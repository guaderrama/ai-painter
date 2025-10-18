const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const express = require("express");
const Jimp = require("jimp");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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
    const payment = event.data.data();
    const userId = event.params.uid;
    
    // Solo procesar pagos exitosos
    if (payment.status !== "succeeded") {
      console.log(`Payment ${event.params.paymentId} not succeeded: ${payment.status}`);
      return null;
    }
    
    // Mapear Price IDs a créditos
    const CREDITS_BY_PRICE = {
      "price_1SJ0UWGdnHfsTKebUDHcFzL3": 10,  // Starter Pack
      "price_1SJ0eSGdnHfsTKeb3RErkfWa": 30,  // Popular Pack
    };
    
    // Obtener el price ID del pago
    const priceId =
      payment.items?.[0]?.price?.id ||
      payment.price?.id ||
      payment.prices?.[0]?.id ||
      null;
    
    if (!priceId) {
      console.error(`No price ID found in payment ${event.params.paymentId}`);
      return null;
    }
    
    const credits = CREDITS_BY_PRICE[priceId];
    
    if (!credits) {
      console.error(`Unknown price ID: ${priceId}`);
      return null;
    }
    
    // Agregar créditos al usuario
    try {
      await admin.firestore().collection("users").doc(userId).set(
        {
          credits: admin.firestore.FieldValue.increment(credits),
        },
        { merge: true }
      );
      
      console.log(`Added ${credits} credits to user ${userId} from payment ${event.params.paymentId}`);
      return null;
    } catch (error) {
      console.error(`Error adding credits to user ${userId}:`, error);
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
      const bucket = admin.storage().bucket("ai-painter-app-uploads-2025");
      const file = bucket.file(imageUrl.replace(`gs://${bucket.name}/`, ''));
      [imageBuffer] = await file.download();
      console.log("Original image buffer downloaded. Size:", imageBuffer.length, "bytes.");
    } catch (downloadError) {
      console.error("Error descargando imagen de Storage: ", downloadError);
      return res.status(500).json({ error: "Error al procesar la imagen desde Storage." });
    }

    // Resize image using Jimp - Preserve aspect ratio
    let resizedImageBuffer;
    try {
      const image = await Jimp.read(imageBuffer);
      
      // Get original dimensions
      const width = image.bitmap.width;
      const height = image.bitmap.height;
      
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
      
      await image.resize(newWidth, newHeight);
      resizedImageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

      console.log(`Resized image preserving aspect ratio. Original: ${width}x${height}, New: ${newWidth === Jimp.AUTO ? 'AUTO' : newWidth}x${newHeight === Jimp.AUTO ? 'AUTO' : newHeight}, Size: ${resizedImageBuffer.length} bytes.`);
    } catch (jimpError) {
      console.error("Error redimensionando imagen con Jimp: ", jimpError);
      return res.status(500).json({ error: "Error al redimensionar la imagen." });
    }

    // Usar Gemini 2.5 Flash Image para generación/edición de imágenes
    const apiKey = "AIzaSyDdc-34P2AQWnMx1p3iW0mUqShqyfLZ17k";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    const prompt = "Edit this image to transform it into a Fauvist painting with bold, unnatural colors, expressive brushstrokes, and vivid colors. Return the edited image.";

    // Convertir buffer a base64 para Gemini
    const imageBase64 = resizedImageBuffer.toString("base64");
    
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/png",
      },
    };

    // Generar contenido con imagen
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    
    // Extraer la imagen generada de la respuesta
    // Gemini 2.5 Flash Image devuelve la imagen en parts
    let generatedImageBase64 = null;
    
    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            generatedImageBase64 = part.inlineData.data;
            break;
          }
        }
      }
    }
    
    // Si no encontramos imagen, usar la original
    if (!generatedImageBase64) {
      console.log("No se generó imagen, usando original");
      generatedImageBase64 = imageBase64;
    }

    // Descontar crédito
    await admin.firestore().runTransaction(async (transaction) => {
      const freshUserDoc = await transaction.get(userRef);
      const newCredits = freshUserDoc.data().credits - 1;
      transaction.update(userRef, { credits: newCredits });
    });

    res.json({ 
      imageBase64: generatedImageBase64
    });

  } catch (error) {
    console.error("Error en la función de generar: ", error);
    res.status(500).json({ error: "Lo sentimos, el artista está ocupado en este momento." });
  }
});

// Exportar la función
exports.api = onRequest({ 
  region: "us-central1",
  memory: "1GiB",
  timeoutSeconds: 300,
  concurrency: 1
}, app);
