# Configuración - AI Painter

## 🔧 Configuraciones Principales

### Firebase Config (Frontend)

**Ubicación:** `script.js` ~línea 50

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBnO-...",
  authDomain: "ai-painter-app.firebaseapp.com",
  projectId: "ai-painter-app",
  storageBucket: "ai-painter-app-uploads-2025",
  messagingSenderId: "255643153942",
  appId: "1:255643153942:web:..."
};
```

**Nota:** El apiKey es público, es seguro que esté en frontend.

---

### Stripe Config (Frontend)

**Ubicación:** `script.js` ~línea 90

```javascript
const STRIPE_PUBLISHABLE_KEY = "pk_test_51N4Hx4GdnHfsTKeb...";

const STRIPE_PRICES = {
  starter: "price_1SJ0UWGdnHfsTKebUDHcFzL3",  // $4.99 → 10 créditos
  popular: "price_1SJ0eSGdnHfsTKeb3RErkfWa", // $12.99 → 30 créditos
  pro: "price_xxx",      // ⚠️ Pendiente crear
  artist: "price_xxx"    // ⚠️ Pendiente crear
};
```

**Para actualizar:**
1. Crear Price en Stripe Dashboard
2. Copiar Price ID
3. Actualizar objeto STRIPE_PRICES
4. Deploy: `firebase deploy --only hosting`

---

### Gemini API (Backend)

**Ubicación:** `functions/index.js` ~línea 20

```javascript
const API_KEY = "AIzaSyDdc-34P2AQWnMx1p3iW0mUqShqyfLZ17k";
const MODEL_NAME = "gemini-2.5-flash-preview-0514";
const PROJECT_ID = "ai-painter-app";
const LOCATION = "us-central1";
```

**⚠️ Para producción:** Mover a environment variables
```bash
firebase functions:config:set gemini.api_key="YOUR_KEY"
```

---

### Credits Mapping (Backend)

**Ubicación:** `functions/index.js` ~línea 350

```javascript
const CREDITS_BY_PRICE = {
  'price_1SJ0UWGdnHfsTKebUDHcFzL3': 10,  // Starter
  'price_1SJ0eSGdnHfsTKeb3RErkfWa': 30,  // Popular
  // Agregar aquí cuando se creen Pro y Artist:
  // 'price_xxx': 75,   // Pro
  // 'price_xxx': 200,  // Artist
};
```

**Importante:** Debe coincidir con Price IDs de Stripe.

---

### CORS Origins (Backend)

**Ubicación:** `functions/index.js` ~línea 450

```javascript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'https://ai-painter-app.web.app',
  'https://ai-painter-app.firebaseapp.com',
];
```

---

### Cloud Function Settings

**Ubicación:** `functions/index.js` ~línea 460

```javascript
exports.api = onRequest({
  memory: '1GiB',
  timeoutSeconds: 300,
  concurrency: 1
}, app);
```

**Ajustables:**
- `memory`: 128MB, 256MB, 512MB, 1GiB, 2GiB, etc.
- `timeoutSeconds`: 60-540 segundos
- `concurrency`: Requests simultáneos por instancia

---

## 📄 Archivos de Configuración

### firebase.json

```json
{
  "hosting": {
    "public": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [{
      "source": "**",
      "headers": [{
        "key": "Cross-Origin-Opener-Policy",
        "value": "same-origin-allow-popups"
      }]
    }]
  },
  "functions": [{
    "source": "functions",
    "codebase": "default",
    "ignore": [
      "node_modules",
      ".git",
      "firebase-debug.log",
      "firebase-debug.*.log",
      "*.local"
    ]
  }]
}
```

### .firebaserc

```json
{
  "projects": {
    "default": "ai-painter-app"
  }
}
```

---

## 🔐 Secrets y API Keys

### Keys Públicas (OK en Frontend)
- ✅ Firebase API Key
- ✅ Stripe Publishable Key
- ✅ Firebase Project ID

### Keys Privadas (Solo Backend)
- ❌ Gemini API Key
- ❌ Stripe Secret Key
- ❌ Firebase Admin SDK credentials

---

## 🌍 Environment Variables

### Development

```bash
# .env.local (no commitear)
GEMINI_API_KEY=AIzaSyDdc-34P2AQWnMx1p3iW0mUqShqyfLZ17k
```

### Production

```bash
firebase functions:config:set gemini.api_key="KEY_HERE"
```

---

## 📊 Límites y Quotas

### Firebase (Spark Plan - Gratis)
- Storage: 5GB
- Bandwidth: 10GB/mes
- Cloud Functions: 125K invocaciones/mes
- Firestore: 50K reads/día, 20K writes/día

### Gemini API
- Según quota de Google Cloud Project
- Actual: Suficiente para testing

### Stripe (Test Mode)
- Sin límites de requests
- Test cards ilimitadas

---

## 🔄 Última Actualización

**Fecha:** Octubre 2025  
**Versión:** 1.0.0
