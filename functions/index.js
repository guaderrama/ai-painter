const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const Jimp = require("jimp");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

const app = express();

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
