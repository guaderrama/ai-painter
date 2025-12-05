const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");

// Define el secret para la API key de Gemini
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const admin = require("firebase-admin");
const express = require("express");
const Jimp = require("jimp");
const { GoogleGenAI } = require("@google/genai");
const convert = require("heic-convert");

admin.initializeApp();

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
      
      console.log("Bucket:", bucketName, "File path:", filePath);
      
      const bucket = admin.storage().bucket(bucketName);
      const file = bucket.file(filePath);
      [imageBuffer] = await file.download();
      
      console.log("✓ Image downloaded successfully. Size:", imageBuffer.length, "bytes");
    } catch (downloadError) {
      console.error("ERROR downloading from Storage:");
      console.error("Error message:", downloadError.message);
      console.error("Error stack:", downloadError.stack);
      return res.status(500).json({ 
        error: "Error al descargar la imagen de Storage.",
        details: downloadError.message 
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
        error: "Error al convertir imagen HEIC.",
        details: heicError.message 
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
      // Max dimension will be 1024px
      const maxDimension = 1024;
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
        error: "Error al redimensionar la imagen.",
        details: jimpError.message 
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
    console.log("Calling Gemini 3 Pro Image (gemini-3-pro-image-preview)...");
    const result = await ai.models.generateContent({
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
          JSON.stringify(response, null, 2),
      );
      // NO descontar crédito si falla la transformación
      const errorMsg = "No se pudo transformar tu imagen a arte. " +
                       "Por favor intenta con otra foto o " +
                       "contacta soporte.";
      return res.status(500).json({
        error: errorMsg,
        details: "Gemini no generó una imagen transformada",
      });
    }
    // Descontar crédito solo si la transformación fue exitosa
    await admin.firestore().runTransaction(async (transaction) => {
      const freshUserDoc = await transaction.get(userRef);
      const newCredits = freshUserDoc.data().credits - 1;
      transaction.update(userRef, {credits: newCredits});
    });

    res.json({
      imageBase64: generatedImageBase64,
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
