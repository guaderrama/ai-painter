# AI Painter - Contexto del Proyecto

## Stack Tecnológico

**Frontend:**
- HTML5 + Vanilla JS + Tailwind CSS
- Single Page Application (9 pantallas)
- Firebase SDK 9.6.1 (Auth, Firestore, Storage)
- Stripe.js v3

**Backend:**
- Firebase Cloud Functions (Node.js 20)
- Express.js para API HTTP
- Jimp para procesamiento de imágenes

**IA:**
- Google Gemini 2.5 Flash Image (Vertex AI)
- Prompt: Transformación a estilo Fauvista

**Servicios:**
- Firebase Auth (Google OAuth + Email/Password)
- Cloud Firestore (base de datos)
- Firebase Storage (bucket: ai-painter-app-uploads-2025)
- Stripe + Firebase Extension (pagos)
- Región: us-central1

## Arquitectura

```
Usuario → Firebase Hosting (SPA)
    ↓
Firebase Auth → Firestore (/users, /customers)
    ↓
Storage → Cloud Function (/generate)
    ↓
Gemini API → Artwork generado
```

## URLs Críticas

- **Producción:** https://ai-painter-app.web.app
- **API:** https://api-255643153942.us-central1.run.app
- **Repo:** https://github.com/guaderrama/ai-painter.git
- **Firebase Console:** ai-painter-app

## Sistema de Créditos

- 3 créditos gratis al registrarse
- 1 crédito = 1 transformación
- Validación: Frontend (UX) + Backend (seguridad)

## Planes Stripe (Test Mode)

| Plan | Precio | Créditos | Price ID |
|------|--------|----------|----------|
| Starter | $4.99 | 10 | price_1SJ0UWGdnHfsTKebUDHcFzL3 |
| Popular | $12.99 | 30 | price_1SJ0eSGdnHfsTKeb3RErkfWa |
| Pro | $29.99 | 75 | Pendiente |
| Artist | $69.99 | 200 | Pendiente |
