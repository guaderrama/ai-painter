const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const { v4: uuidv4 } = require("uuid");

// Define el secret para la API key de Gemini
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const admin = require("firebase-admin");
const express = require("express");
const Jimp = require("jimp");
const { GoogleGenAI } = require("@google/genai");
const convert = require("heic-convert");

admin.initializeApp();

// ============================================
// ARTWORK STORAGE CONFIGURATION
// ============================================
// Store artwork images directly in Firestore (no Storage IAM needed)
// Base64 images are typically 200-500KB, well within Firestore's 1MB limit
const MAX_ARTWORKS_PER_USER = 10;
const ARTWORK_RETENTION_DAYS = 15;

/**
 * Saves artwork directly to Firestore (no Storage needed)
 * Compresses image if necessary to fit within Firestore's 1MB limit
 * @param {string} userId - User ID
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} originalUrl - Original image gs:// URL
 * @returns {Promise<{artworkId: string, imageBase64: string}>}
 */
async function saveArtwork(userId, imageBase64, originalUrl) {
  const artworkId = uuidv4();

  try {
    let finalBase64 = imageBase64;
    let sizeInBytes = Buffer.byteLength(imageBase64, 'utf8');
    let sizeInKB = Math.round(sizeInBytes / 1024);
    console.log(`Original artwork size: ${sizeInKB}KB`);

    // If image is too large, compress it using Jimp
    const MAX_SIZE = 800000; // 800KB to leave room for other document fields
    if (sizeInBytes > MAX_SIZE) {
      console.log(`Compressing artwork from ${sizeInKB}KB...`);

      try {
        // Decode base64 to buffer
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const image = await Jimp.read(imageBuffer);

        // Resize to smaller dimension (max 1200px)
        const maxDim = 1200;
        if (image.bitmap.width > maxDim || image.bitmap.height > maxDim) {
          if (image.bitmap.width > image.bitmap.height) {
            await image.resize(maxDim, Jimp.AUTO);
          } else {
            await image.resize(Jimp.AUTO, maxDim);
          }
        }

        // Convert to JPEG with 85% quality (much smaller than PNG)
        await image.quality(85);
        const compressedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
        finalBase64 = compressedBuffer.toString('base64');

        sizeInBytes = Buffer.byteLength(finalBase64, 'utf8');
        sizeInKB = Math.round(sizeInBytes / 1024);
        console.log(`Compressed artwork to: ${sizeInKB}KB`);

        // If still too large, skip
        if (sizeInBytes > 900000) {
          console.warn(`Artwork still too large after compression: ${sizeInKB}KB`);
          return null;
        }
      } catch (compressError) {
        console.error('Error compressing artwork:', compressError);
        return null;
      }
    }

    // Save directly to Firestore with base64 image data
    const artworkRef = admin.firestore()
      .collection("users").doc(userId)
      .collection("artworks").doc(artworkId);

    await artworkRef.set({
      imageBase64: finalBase64,  // Store image data directly
      originalUrl: originalUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      style: "fauvist"
    });

    console.log(`✓ Artwork saved to Firestore: ${artworkId} for user ${userId} (${sizeInKB}KB)`);

    // Cleanup old artworks (keep only MAX_ARTWORKS_PER_USER)
    await cleanupOldArtworks(userId);

    return { artworkId, imageBase64: finalBase64 };
  } catch (error) {
    console.error(`Error saving artwork for user ${userId}:`, error);
    // Don't throw - artwork saving is optional, image generation already succeeded
    return null;
  }
}

/**
 * Removes oldest artworks if user has more than MAX_ARTWORKS_PER_USER
 * @param {string} userId - User ID
 */
async function cleanupOldArtworks(userId) {
  try {
    const artworksRef = admin.firestore()
      .collection("users").doc(userId)
      .collection("artworks");

    const snapshot = await artworksRef
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.size > MAX_ARTWORKS_PER_USER) {
      const toDelete = snapshot.docs.slice(MAX_ARTWORKS_PER_USER);

      // Use batch writes for parallel deletion (more efficient)
      const batch = admin.firestore().batch();
      toDelete.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      console.log(`Cleaned up ${toDelete.length} old artworks for user ${userId}`);
    }
  } catch (error) {
    console.error(`Error cleaning up artworks for user ${userId}:`, error);
  }
}

// ============================================
// RATE LIMITING (in-memory, resets on cold start)
// ============================================
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 requests per minute per user

function checkRateLimit(userId) {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now - userLimit.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(userId, { windowStart: now, count: 1 });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Allowed image MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

// INITIALIZE USER WITH FREE CREDITS
// ==============================
// Esta función se ejecuta cuando la Firebase Extension crea un documento
// en customers/{uid} (sucede automáticamente al autenticarse)
exports.initializeUser = onDocumentCreated(
  "customers/{uid}",
  async (event) => {
    const userId = event.params.uid;

    try {
      // Verificar si el usuario ya existe en la colección users
      const userRef = admin.firestore().collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        // Crear usuario con 3 créditos gratis
        await userRef.set({
          credits: 3,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Created user ${userId} with 3 free credits`);
      } else {
        console.log(`User ${userId} already exists, skipping initialization`);
      }

      return null;
    } catch (error) {
      console.error(`Error initializing user ${userId}:`, error);
      return null;
    }
  }
);

// GRANT CREDITS ON PAYMENT
// ==============================
// Esta función se ejecuta cuando un pago se completa exitosamente
// y agrega los créditos correspondientes al usuario
exports.grantCreditsOnPayment = onDocumentCreated(
  "customers/{uid}/payments/{paymentId}",
  async (event) => {
    try {
      const payment = event.data.data();
      const userId = event.params.uid;
      const paymentId = event.params.paymentId;

      console.log(`Processing payment ${paymentId} for user ${userId}`);
      console.log(`Payment data:`, JSON.stringify(payment, null, 2));

      // Solo procesar pagos exitosos
      if (payment.status !== "succeeded") {
        console.log(`Payment ${paymentId} not succeeded: ${payment.status}`);
        return null;
      }

      // Mapear Price IDs a créditos
      const CREDITS_BY_PRICE = {
        "price_1SJ0UWGdnHfsTKebUDHcFzL3": 10,  // Starter Pack ($4.99)
        "price_1SJ0eSGdnHfsTKeb3RErkfWa": 30,  // Popular Pack ($12.99)
        "price_1Sb955GdnHfsTKebNLgWcpdc": 50,  // Pro Pack ($19.99)
        "price_1Sb95BGdnHfsTKebUlBo75LW": 100, // Artist Pack ($34.99)
      };

      // Intentar obtener el price ID de múltiples ubicaciones posibles
      let priceId = null;

      // Método 1: items[0].price.id (estructura de Checkout Session)
      if (payment.items && payment.items.length > 0 && payment.items[0].price) {
        priceId = payment.items[0].price.id;
        console.log(`Price ID found in items[0].price.id: ${priceId}`);
      }

      // Método 2: price.id (estructura alternativa)
      if (!priceId && payment.price && payment.price.id) {
        priceId = payment.price.id;
        console.log(`Price ID found in price.id: ${priceId}`);
      }

      // Método 3: prices[0].id (estructura de suscripciones)
      if (!priceId && payment.prices && payment.prices.length > 0) {
        priceId = payment.prices[0].id;
        console.log(`Price ID found in prices[0].id: ${priceId}`);
      }

      // Método 4: Fallback por monto (si no se encuentra price ID)
      if (!priceId && payment.amount) {
        console.log(`No price ID found, using amount: ${payment.amount}`);

        // Identificar por monto (en centavos)
        if (payment.amount === 499) {
          priceId = "price_1SJ0UWGdnHfsTKebUDHcFzL3"; // Starter Pack
          console.log(`Matched amount $4.99 to Starter Pack`);
        } else if (payment.amount === 1299) {
          priceId = "price_1SJ0eSGdnHfsTKeb3RErkfWa"; // Popular Pack
          console.log(`Matched amount $12.99 to Popular Pack`);
        }
      }

      if (!priceId) {
        console.error(`ERROR: No price ID found in payment ${paymentId}`);
        console.error(`Payment structure:`, JSON.stringify(payment, null, 2));
        return null;
      }

      const credits = CREDITS_BY_PRICE[priceId];

      if (!credits) {
        console.error(`ERROR: Unknown price ID: ${priceId}`);
        console.error(`Known price IDs:`, Object.keys(CREDITS_BY_PRICE));
        return null;
      }

      // Agregar créditos al usuario
      console.log(`Adding ${credits} credits to user ${userId}`);

      await admin.firestore().collection("users").doc(userId).set(
        {
          credits: admin.firestore.FieldValue.increment(credits),
        },
        { merge: true }
      );

      console.log(`SUCCESS: Added ${credits} credits to user ${userId} from payment ${paymentId}`);
      return null;

    } catch (error) {
      console.error(`CRITICAL ERROR in grantCreditsOnPayment:`, error);
      console.error(`Error stack:`, error.stack);
      return null;
    }
  }
);

const app = express();

// Helper para extraer y verificar el token de autorización
async function authenticateRequest(req, res) {
  if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
    res.status(403).json({ error: "Usuario no autenticado." });
    return null;
  }
  const idToken = req.headers.authorization.split("Bearer ")[1];
  try {
    return await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error("Token inválido:", error);
    res.status(403).json({ error: "Token de autenticación inválido." });
    return null;
  }
}


// Orígenes permitidos
const ALLOWED = new Set([
  "https://ai-painter-app.web.app",
  "https://ai-painter-app.firebaseapp.com",
  "http://localhost:5173",
  "http://localhost:3000",
]);

// CORS middleware - DEBE IR PRIMERO
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Permitir el origen si está en la lista
  if (origin && ALLOWED.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }

  // Headers CORS necesarios
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Credentials", "true");
  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With");

  // Manejar preflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

// Parser JSON
app.use(express.json());

// Endpoint para asegurar documento de usuario con créditos iniciales
app.post("/ensure-user", async (req, res) => {
  try {
    const decodedToken = await authenticateRequest(req, res);
    if (!decodedToken) return;

    const userId = decodedToken.uid;
    const userRef = admin.firestore().collection("users").doc(userId);

    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      await userRef.set(
        {
          credits: 3,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      res.json({ credits: 3, created: true });
    } else {
      const data = userDoc.data() || {};
      res.json({ credits: data.credits || 0, created: false });
    }
  } catch (error) {
    console.error("Error en ensure-user:", error);
    res.status(500).json({ error: "No se pudo inicializar la cuenta." });
  }
});

// Endpoint para generar imágenes
app.post("/generate", async (req, res) => {
  try {
    // Security: Validate Content-Type
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({ error: "Content-Type must be application/json" });
    }

    // Verificar autenticación
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
      return res.status(403).json({ error: "Usuario no autenticado." });
    }

    const idToken = req.headers.authorization.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return res.status(403).json({ error: "Token de autenticación inválido." });
    }

    const userId = decodedToken.uid;

    // Security: Rate limiting per user
    if (!checkRateLimit(userId)) {
      return res.status(429).json({ error: "Demasiadas solicitudes. Intenta en un minuto." });
    }

    const userRef = admin.firestore().collection("users").doc(userId);

    const userDoc = await userRef.get();

    if (!userDoc.exists || userDoc.data().credits < 1) {
      return res.status(402).json({ error: "No tienes créditos suficientes." });
    }

    const imageUrl = req.body.imageUrl;
    if (!imageUrl) {
      return res.status(400).json({ error: "No se proporcionó ninguna URL de imagen." });
    }

    // Download image from Firebase Storage
    let imageBuffer;
    try {
      console.log("Downloading image from Storage URL:", imageUrl);

      // Extract bucket name and file path from gs:// URL
      const gsUrlMatch = imageUrl.match(/^gs:\/\/([^\/]+)\/(.+)$/);
      if (!gsUrlMatch) {
        throw new Error("Invalid Storage URL format");
      }

      const bucketName = gsUrlMatch[1];
      const filePath = gsUrlMatch[2];

      // Security: Validate path doesn't contain traversal attempts
      if (filePath.includes('..') || filePath.includes('//')) {
        throw new Error("Invalid file path");
      }

      // Security: Validate bucket is the expected one
      const ALLOWED_BUCKET = "ai-painter-app-uploads-2025";
      if (bucketName !== ALLOWED_BUCKET) {
        throw new Error("Invalid storage bucket");
      }

      console.log("Bucket:", bucketName, "File path:", filePath);

      const bucket = admin.storage().bucket(bucketName);
      const file = bucket.file(filePath);

      // Security: Check file size before download (max 20MB)
      const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
      const [metadata] = await file.getMetadata();
      if (metadata.size > MAX_FILE_SIZE) {
        throw new Error(`File too large: ${metadata.size} bytes (max ${MAX_FILE_SIZE})`);
      }

      // Security: Validate MIME type
      const mimeType = metadata.contentType;
      if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
        throw new Error(`Invalid file type: ${mimeType}`);
      }

      [imageBuffer] = await file.download();

      console.log("✓ Image downloaded successfully. Size:", imageBuffer.length, "bytes");
    } catch (downloadError) {
      console.error("ERROR downloading from Storage:");
      console.error("Error message:", downloadError.message);
      console.error("Error stack:", downloadError.stack);
      return res.status(500).json({
        error: "Error al descargar la imagen de Storage."
      });
    }

    // Convert HEIC to PNG if necessary
    let processedBuffer = imageBuffer;
    try {
      // Detect HEIC format by checking the file signature (magic bytes)
      // HEIC files start with specific bytes at offset 4
      const isHEIC = imageBuffer.length > 12 &&
        (imageBuffer.toString('ascii', 4, 8) === 'ftyp' &&
          (imageBuffer.toString('ascii', 8, 12) === 'heic' ||
            imageBuffer.toString('ascii', 8, 12) === 'mif1' ||
            imageBuffer.toString('ascii', 8, 12) === 'msf1' ||
            imageBuffer.toString('ascii', 8, 12) === 'hevc'));

      if (isHEIC) {
        console.log("HEIC format detected, converting to PNG...");

        const outputBuffer = await convert({
          buffer: imageBuffer,
          format: 'PNG',
          quality: 1  // Maximum quality for PNG
        });

        processedBuffer = outputBuffer;
        console.log("✓ HEIC converted to PNG successfully. New size:", processedBuffer.length, "bytes");
      } else {
        console.log("Non-HEIC format, proceeding with original buffer");
      }
    } catch (heicError) {
      console.error("ERROR converting HEIC:");
      console.error("Error message:", heicError.message);
      console.error("Error stack:", heicError.stack);
      return res.status(500).json({
        error: "Error al convertir imagen HEIC."
      });
    }

    // Resize image using Jimp - Preserve aspect ratio
    let resizedImageBuffer;
    try {
      console.log("Starting Jimp processing. Buffer size:", processedBuffer.length);

      // Validate buffer
      if (!processedBuffer || processedBuffer.length === 0) {
        throw new Error("Image buffer is empty");
      }

      const image = await Jimp.read(processedBuffer);
      console.log("Jimp successfully read image");

      // Get original dimensions
      const width = image.bitmap.width;
      const height = image.bitmap.height;
      console.log(`Original dimensions: ${width}x${height}`);

      // Calculate new dimensions preserving aspect ratio
      // Max dimension will be 1536px (good balance of quality and speed)
      const maxDimension = 1536;
      let newWidth, newHeight;

      if (width > height) {
        // Landscape or square
        newWidth = Math.min(width, maxDimension);
        newHeight = Jimp.AUTO; // Jimp will calculate proportionally
      } else {
        // Portrait
        newHeight = Math.min(height, maxDimension);
        newWidth = Jimp.AUTO; // Jimp will calculate proportionally
      }

      console.log(`Resizing to: ${newWidth === Jimp.AUTO ? 'AUTO' : newWidth}x${newHeight === Jimp.AUTO ? 'AUTO' : newHeight}`);

      await image.resize(newWidth, newHeight);
      console.log("Resize completed");

      resizedImageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
      console.log(`Final buffer size: ${resizedImageBuffer.length} bytes`);

    } catch (jimpError) {
      console.error("JIMP ERROR Details:");
      console.error("Error message:", jimpError.message);
      console.error("Error stack:", jimpError.stack);
      console.error("Buffer length:", processedBuffer ? processedBuffer.length : 'null');
      console.error("Buffer type:", typeof processedBuffer);

      return res.status(500).json({
        error: "Error al redimensionar la imagen."
      });
    }

    // Usar Gemini 3 Pro Image (Nano Banana Pro) para generación/edición de imágenes
    // La API key se obtiene del secret configurado en Firebase
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("ERROR: GEMINI_API_KEY secret not configured");
      return res.status(500).json({ error: "Error de configuración del servidor." });
    }

    // Inicializar el nuevo SDK de Google GenAI
    const ai = new GoogleGenAI({ apiKey });

    const prompt = "Edit this image to transform it into a Fauvist painting with bold, unnatural colors, expressive brushstrokes, and vivid colors. Return the edited image.";

    // Convertir buffer a base64 para Gemini
    const imageBase64 = resizedImageBuffer.toString("base64");

    // Generar contenido con imagen usando el nuevo SDK
    // Security: Add timeout to prevent hanging requests
    const GEMINI_TIMEOUT = 120000; // 2 minutes
    console.log("Calling Gemini 3 Pro Image (gemini-3-pro-image-preview)...");

    const geminiPromise = ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/png",
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini API timeout')), GEMINI_TIMEOUT);
    });

    const result = await Promise.race([geminiPromise, timeoutPromise]);

    console.log("Gemini response received");

    // Extraer la imagen generada de la respuesta
    // El nuevo SDK devuelve la respuesta en un formato diferente
    let generatedImageBase64 = null;

    if (result.candidates && result.candidates[0]) {
      const candidate = result.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            generatedImageBase64 = part.inlineData.data;
            console.log("✓ Generated image found in response");
            break;
          }
        }
      }
    }

    // ✅ VALIDAR que Gemini generó una imagen transformada
    if (!generatedImageBase64) {
      console.error("ERROR: Gemini no generó imagen transformada");
      console.error(
        "Response structure:",
        JSON.stringify(result, null, 2),
      );
      // NO descontar crédito si falla la transformación
      const errorMsg = "No se pudo transformar tu imagen a arte. " +
        "Por favor intenta con otra foto o " +
        "contacta soporte.";
      return res.status(500).json({
        error: errorMsg
      });
    }
    // Descontar crédito solo si la transformación fue exitosa
    // Security: Re-validate credits inside transaction to prevent race conditions
    await admin.firestore().runTransaction(async (transaction) => {
      const freshUserDoc = await transaction.get(userRef);
      const currentCredits = freshUserDoc.data()?.credits || 0;
      if (currentCredits < 1) {
        throw new Error('Insufficient credits');
      }
      transaction.update(userRef, { credits: currentCredits - 1 });
    });

    // Save artwork to Storage and Firestore (non-blocking, don't fail if this fails)
    const savedArtwork = await saveArtwork(userId, generatedImageBase64, imageUrl);

    res.json({
      imageBase64: generatedImageBase64,
      artworkId: savedArtwork?.artworkId || null,
    });

  } catch (error) {
    console.error("Error en la función de generar: ", error);
    res.status(500).json({ error: "Lo sentimos, el artista está ocupado en este momento." });
  }
});

// Exportar la función con acceso al secret
exports.api = onRequest({
  region: "us-central1",
  memory: "1GiB",
  timeoutSeconds: 300,
  concurrency: 1,
  secrets: [geminiApiKey]  // Dar acceso al secret
}, app);

// ============================================
// SCHEDULED CLEANUP: Delete artworks older than 15 days
// Runs daily at 3:00 AM Mexico City time
// ============================================
exports.cleanupExpiredArtworks = onSchedule({
  schedule: "0 3 * * *",
  timeZone: "America/Mexico_City",
  region: "us-central1",
}, async (event) => {
  console.log("Starting expired artworks cleanup...");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - ARTWORK_RETENTION_DAYS);

  try {
    // Query all expired artworks across all users
    const expiredDocs = await admin.firestore()
      .collectionGroup("artworks")
      .where("createdAt", "<", cutoffDate)
      .get();

    if (expiredDocs.empty) {
      console.log("No expired artworks found");
      return;
    }

    console.log(`Found ${expiredDocs.size} expired artworks to delete`);

    // Use batched deletes (max 500 per batch in Firestore)
    const BATCH_SIZE = 500;
    const docs = expiredDocs.docs;
    let deletedCount = 0;

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = admin.firestore().batch();
      const chunk = docs.slice(i, i + BATCH_SIZE);

      chunk.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      deletedCount += chunk.length;
      console.log(`Deleted batch: ${deletedCount}/${docs.length}`);
    }

    console.log(`Cleanup complete: ${deletedCount} deleted`);
  } catch (error) {
    console.error("Error in cleanup job:", error);
  }
});
