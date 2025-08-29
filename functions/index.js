const { https } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const logger = require("firebase-functions/logger");
const Jimp = require("jimp"); // Import Jimp

admin.initializeApp();

const app = express();
app.use(cors({ origin: "https://ai-painter-app.web.app" }));
app.use(express.json()); // To parse JSON-encoded bodies

app.post("/generate", async (req, res) => {
  // Move PredictionServiceClient import and initialization inside the handler
  const { PredictionServiceClient } = require("@google-cloud/aiplatform");
  const clientOptions = {
    apiEndpoint: "us-central1-aiplatform.googleapis.com",
  };
  const predictionServiceClient = new PredictionServiceClient(clientOptions);

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

  try {
    const userDoc = await userRef.get();

    if (!userDoc.exists || userDoc.data().credits < 1) {
      return res.status(402).json({ error: "No tienes créditos suficientes." });
    }

    const imageUrl = req.body.imageUrl; // Expecting image URL from frontend
    if (!imageUrl) {
      return res.status(400).json({ error: "No se proporcionó ninguna URL de imagen." });
    }

    // Download image from Firebase Storage
    let imageBuffer;
    try {
      const bucket = admin.storage().bucket("ai-painter-app-uploads-2025"); // Specify the new bucket name
      const file = bucket.file(imageUrl.replace(`gs://${bucket.name}/`, '')); // Extract path from gs:// URL
      [imageBuffer] = await file.download();
      logger.info("Original image buffer downloaded. Size:", imageBuffer.length, "bytes.");
    } catch (downloadError) {
      console.error("Error descargando imagen de Storage: ", downloadError);
      return res.status(500).json({ error: "Error al procesar la imagen desde Storage." });
    }

    // Resize image using Jimp
    let resizedImageBuffer;
    try {
      const image = await Jimp.read(imageBuffer);
      await image.resize(512, 512); // Force 512x512
      // image.quality(60); // Removed for PNG output
      resizedImageBuffer = await image.getBufferAsync(Jimp.MIME_PNG); // Get buffer as PNG
      logger.info("Resized image buffer. Size:", resizedImageBuffer.length, "bytes.");
    } catch (jimpError) {
      console.error("Error redimensionando imagen con Jimp: ", jimpError);
      return res.status(500).json({ error: "Error al redimensionar la imagen." });
    }

    const imageBase64 = resizedImageBuffer.toString("base64");
    logger.info("Base64 string length (after resize):", imageBase64.length);

    const prompt = "a painting of a landscape"; // Simplified prompt

    const request_body = {
      instances: [
        {
          prompt: prompt,
          image: { bytesBase64Encoded: imageBase64, mimeType: "image/png" }, // Changed mimeType to PNG
        },
      ],
      parameters: {
        sampleCount: 1,
      },
    };

    const endpoint = `projects/255643153942/locations/us-central1/publishers/google/models/imagegeneration@006`;

    const [response] = await predictionServiceClient.predict({
      endpoint,
      instances: request_body.instances,
      parameters: request_body.parameters,
    });

    const prediction = response.predictions[0];
    const generatedImageBase64 = prediction.structValue.fields.bytesBase64Encoded.stringValue;

    await admin.firestore().runTransaction(async (transaction) => {
      const freshUserDoc = await transaction.get(userRef);
      const newCredits = freshUserDoc.data().credits - 1;
      transaction.update(userRef, { credits: newCredits });
    });

    return res.json({ imageBase64: generatedImageBase64 });

  } catch (error) {
    console.error("Error en la función de generar: ", error);
    return res.status(500).json({ error: "Lo sentimos, el artista está ocupado en este momento." });
  }
});

exports.api = https.onRequest(
  {
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 300,
    concurrency: 1
  },
  app
);
