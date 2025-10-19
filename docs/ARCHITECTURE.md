# Arquitectura del Sistema AI Painter

## 📐 Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                         USUARIO                              │
│                     (Web Browser)                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─── Google OAuth
                     ├─── Email/Password
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  FIREBASE HOSTING                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  index.html + script.js + style.css                  │  │
│  │  (Single Page Application)                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  URL: https://ai-painter-app.web.app                        │
└────────────┬───────────────────┬────────────────────────────┘
             │                   │
             │                   │
    ┌────────▼────────┐   ┌─────▼──────────────────┐
    │ FIREBASE AUTH   │   │  CLOUD FIRESTORE        │
    │                 │   │                         │
    │ • Google OAuth  │   │  /users/{uid}           │
    │ • Email/Pass    │   │    • credits: number    │
    │ • User tokens   │   │    • createdAt: time    │
    └─────────────────┘   │                         │
                          │  /customers/{uid}       │
                          │    (Stripe Extension)   │
                          │                         │
                          │  /customers/{uid}/      │
                          │    checkout_sessions/   │
                          │    payments/            │
                          └─────────────────────────┘

             ┌──────────────────────────────────┐
             │    FIREBASE STORAGE              │
             │                                  │
             │  Bucket:                         │
             │  ai-painter-app-uploads-2025     │
             │                                  │
             │  /user_uploads/{uid}/            │
             │    {timestamp}_{filename}        │
             └──────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              CLOUD FUNCTIONS (Backend)                        │
│              Region: us-central1                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Function 1: initializeUser                         │    │
│  │  Trigger: onDocumentCreated("customers/{uid}")      │    │
│  │  Acción: Otorgar 3 créditos gratis                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Function 2: grantCreditsOnPayment                  │    │
│  │  Trigger: onDocumentCreated("customers/{uid}/       │    │
│  │           payments/{paymentId}")                     │    │
│  │  Acción: Agregar créditos según plan comprado      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Function 3: api (HTTP Endpoint)                    │    │
│  │  URL: /generate                                     │    │
│  │  Acción: Procesar imagen con Gemini                │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                    │
└──────────────────────────┼────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────────┐
              │   GOOGLE GEMINI 2.5        │
              │   (Vertex AI)              │
              │                            │
              │  Model: gemini-2.5-flash   │
              │  -preview-0514             │
              │                            │
              │  Input: Imagen + Prompt    │
              │  Output: Imagen Base64     │
              └────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              STRIPE PAYMENTS                                  │
│              (via Firebase Extension)                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Price IDs:                                                   │
│  • Starter: price_1SJ0UWGdnHfsTKebUDHcFzL3 → 10 créditos    │
│  • Popular: price_1SJ0eSGdnHfsTKeb3RErkfWa → 30 créditos    │
│                                                               │
│  Webhook → Firebase Extension → Firestore payments/          │
└──────────────────────────────────────────────────────────────┘
```

## 🔄 Flujos de Datos Principales

### 1. Flujo de Registro de Usuario

```
1. Usuario → Click "Sign up with Google" o ingresa email/password
   ↓
2. Firebase Auth → Crea usuario y retorna UID
   ↓
3. Firebase Stripe Extension → Crea documento en customers/{uid}
   ↓
4. Cloud Function initializeUser → Se dispara automáticamente
   ↓
5. Verifica si users/{uid} existe
   ↓
6. Si NO existe → Crea users/{uid} con credits: 3
   ↓
7. Frontend → Escucha cambios en users/{uid}
   ↓
8. UI → Muestra "3 credits remaining"
```

**Tiempo estimado:** 5-15 segundos

### 2. Flujo de Generación de Artwork

```
1. Usuario → Selecciona imagen (JPG/PNG, max 5MB)
   ↓
2. Frontend → Valida formato y tamaño
   ↓
3. Frontend → Verifica créditos ≥ 1 en users/{uid}
   ↓
4. Si créditos < 1 → Redirige a pantalla "limit"
   ↓
5. Frontend → Upload imagen a Storage
   ↓
6. Storage → Retorna downloadURL
   ↓
7. Frontend → POST /generate con Bearer token + imageUrl
   ↓
8. Cloud Function api → Valida token
   ↓
9. Cloud Function → Verifica créditos nuevamente (server-side)
   ↓
10. Cloud Function → Descarga imagen de Storage
    ↓
11. Jimp → Redimensiona imagen a max 1024px
    ↓
12. Gemini API → Procesa imagen con prompt Fauvista
    ↓
13. Gemini → Retorna imagen generada en base64
    ↓
14. Cloud Function → Descuenta 1 crédito en users/{uid}
    ↓
15. Cloud Function → Retorna { imageUrl: "data:image/png;base64,..." }
    ↓
16. Frontend → Muestra Before/After comparison
    ↓
17. Frontend → Actualiza créditos restantes en UI
```

**Tiempo estimado:** 8-15 segundos

### 3. Flujo de Compra de Créditos

```
1. Usuario → Click "Buy Credits" en plan seleccionado
   ↓
2. Frontend → Crea documento en customers/{uid}/checkout_sessions
   {
     mode: 'payment',
     price: 'price_xxx',
     success_url: window.location.origin,
     cancel_url: window.location.origin
   }
   ↓
3. Firebase Stripe Extension → Escucha nuevo documento
   ↓
4. Extension → Crea Stripe Checkout Session
   ↓
5. Extension → Agrega sessionId al documento
   ↓
6. Frontend → Escucha cambio en documento
   ↓
7. Frontend → stripe.redirectToCheckout({ sessionId })
   ↓
8. Usuario → Completa pago en Stripe
   ↓
9. Stripe → Procesa pago
   ↓
10. Stripe → Envía webhook a Extension
    ↓
11. Extension → Crea documento en customers/{uid}/payments
    {
      status: 'succeeded',
      amount: 499,
      items: [{ price: { id: 'price_xxx' }}]
    }
    ↓
12. Cloud Function grantCreditsOnPayment → Se dispara
    ↓
13. Function → Lee priceId del pago
    ↓
14. Function → Mapea priceId a cantidad de créditos
    price_1SJ0UWGdnHfsTKebUDHcFzL3 → 10 créditos
    ↓
15. Function → Incrementa créditos en users/{uid}
    ↓
16. Frontend → Escucha cambio en users/{uid}
    ↓
17. UI → Actualiza contador de créditos
```

**Tiempo estimado:** 10-20 segundos

## 🎨 Arquitectura del Frontend (SPA)

### Estructura de Pantallas

```javascript
// Sistema de navegación por pantallas
const screens = [
  'welcome',        // Onboarding (4 slides)
  'login',          // Login principal
  'emailLogin',     // Login con email
  'emailSignup',    // Registro con email
  'upload',         // Upload de imagen
  'processing',     // Estado de carga
  'result',         // Resultado Before/After
  'limit',          // Sin créditos
  'pricing'         // Planes de compra
];

// Cada pantalla tiene display: none por defecto
// Solo 1 pantalla visible a la vez (display: block)
```

### Componentes Clave

#### 1. Sistema de Autenticación
```javascript
// Ubicación: script.js líneas ~100-250

// Google OAuth
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  const result = await firebase.auth().signInWithPopup(provider);
  return result.user;
}

// Email/Password
async function signUpWithEmail(email, password) {
  const userCredential = await firebase.auth()
    .createUserWithEmailAndPassword(email, password);
  return userCredential.user;
}
```

#### 2. Gestión de Créditos
```javascript
// Ubicación: script.js líneas ~300-350

// Escuchar cambios en tiempo real
const creditsListener = db.collection('users').doc(user.uid)
  .onSnapshot((doc) => {
    if (doc.exists) {
      const credits = doc.data().credits || 0;
      updateCreditsDisplay(credits);
    }
  });

// Validar antes de procesar
function validateCredits(credits) {
  if (credits < 1) {
    showScreen('limit');
    return false;
  }
  return true;
}
```

#### 3. Upload y Procesamiento
```javascript
// Ubicación: script.js líneas ~400-550

async function uploadAndProcess(file) {
  // 1. Validar archivo
  if (!validateFile(file)) return;
  
  // 2. Upload a Storage
  const storageRef = firebase.storage().ref();
  const fileRef = storageRef.child(`user_uploads/${user.uid}/${Date.now()}_${file.name}`);
  await fileRef.put(file);
  const imageUrl = await fileRef.getDownloadURL();
  
  // 3. Llamar a Cloud Function
  showScreen('processing');
  const token = await user.getIdToken();
  const response = await fetch(cloudFunctionUrl + '/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageUrl })
  });
  
  // 4. Mostrar resultado
  const data = await response.json();
  displayResult(imageUrl, data.imageUrl);
}
```

#### 4. Sistema de Pagos
```javascript
// Ubicación: script.js líneas ~600-700

async function purchaseCredits(planId) {
  const priceId = STRIPE_PRICES[planId];
  
  // Crear checkout session
  const docRef = await db
    .collection('customers')
    .doc(user.uid)
    .collection('checkout_sessions')
    .add({
      mode: 'payment',  // CRÍTICO: Debe ser 'payment'
      price: priceId,
      success_url: window.location.origin,
      cancel_url: window.location.origin,
    });
  
  // Escuchar sessionId
  docRef.onSnapshot((snap) => {
    const { error, sessionId } = snap.data();
    if (error) {
      console.error('Stripe error:', error);
      alert('Error creating checkout session');
    }
    if (sessionId) {
      stripe.redirectToCheckout({ sessionId });
    }
  });
}
```

## ⚙️ Arquitectura del Backend (Cloud Functions)

### Function 1: initializeUser

```javascript
// Ubicación: functions/index.js líneas ~50-100

exports.initializeUser = onDocumentCreated(
  "customers/{uid}",
  async (event) => {
    const uid = event.params.uid;
    const userRef = admin.firestore().collection("users").doc(uid);
    
    // Verificar si ya existe
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      console.log(`User ${uid} already exists, skipping initialization`);
      return null;
    }
    
    // Crear usuario con 3 créditos gratis
    await userRef.set({
      credits: 3,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`User ${uid} initialized with 3 free credits`);
    return null;
  }
);
```

**Trigger:** Cuando Firebase Stripe Extension crea `customers/{uid}`  
**Tiempo de ejecución:** <1 segundo  
**Costo:** Gratuito (Firestore write)

### Function 2: grantCreditsOnPayment

```javascript
// Ubicación: functions/index.js líneas ~350-420

const CREDITS_BY_PRICE = {
  'price_1SJ0UWGdnHfsTKebUDHcFzL3': 10,  // Starter
  'price_1SJ0eSGdnHfsTKeb3RErkfWa': 30,  // Popular
};

exports.grantCreditsOnPayment = onDocumentCreated(
  "customers/{uid}/payments/{paymentId}",
  async (event) => {
    const payment = event.data.data();
    const uid = event.params.uid;
    
    // Verificar que pago fue exitoso
    if (payment.status !== 'succeeded') {
      console.log('Payment not succeeded, skipping');
      return null;
    }
    
    // Obtener priceId del pago
    const priceId = payment.items[0]?.price?.id;
    if (!priceId) {
      console.error('No price ID found in payment');
      return null;
    }
    
    // Mapear a créditos
    const creditsToAdd = CREDITS_BY_PRICE[priceId];
    if (!creditsToAdd) {
      console.error(`Unknown price ID: ${priceId}`);
      return null;
    }
    
    // Agregar créditos
    const userRef = admin.firestore().collection('users').doc(uid);
    await userRef.update({
      credits: admin.firestore.FieldValue.increment(creditsToAdd)
    });
    
    console.log(`Added ${creditsToAdd} credits to user ${uid}`);
    return null;
  }
);
```

**Trigger:** Cuando pago se completa en Stripe  
**Tiempo de ejecución:** <1 segundo  
**Costo:** Gratuito (Firestore update)

### Function 3: api (HTTP Endpoint)

```javascript
// Ubicación: functions/index.js líneas ~100-350

const app = express();
app.use(cors({ origin: ALLOWED_ORIGINS }));

// Endpoint principal
app.post('/generate', async (req, res) => {
  try {
    // 1. Validar autenticación
    const authHeader = req.headers.authorization;
    const token = authHeader?.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    
    // 2. Verificar créditos
    const userRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userRef.get();
    const credits = userDoc.data()?.credits || 0;
    
    if (credits < 1) {
      return res.status(403).json({ error: 'Insufficient credits' });
    }
    
    // 3. Descargar imagen
    const { imageUrl } = req.body;
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    
    // 4. Redimensionar
    const buffer = Buffer.from(response.data);
    const image = await Jimp.read(buffer);
    const maxDimension = 1024;
    
    if (image.bitmap.width > maxDimension || image.bitmap.height > maxDimension) {
      image.scaleToFit(maxDimension, maxDimension);
    }
    
    const resizedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
    const base64Image = resizedBuffer.toString('base64');
    
    // 5. Llamar a Gemini
    const prompt = `Transform this photo into a painting in the style of Fauvism...`;
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/png'
        }
      }
    ]);
    
    // 6. Obtener resultado
    const generatedImage = result.response.candidates[0].content.parts[0].inlineData.data;
    
    // 7. Descontar crédito
    await userRef.update({
      credits: admin.firestore.FieldValue.increment(-1)
    });
    
    // 8. Retornar
    return res.json({
      imageUrl: `data:image/png;base64,${generatedImage}`
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

exports.api = onRequest({
  memory: '1GiB',
  timeoutSeconds: 300,
  concurrency: 1
}, app);
```

**URL:** https://api-255643153942.us-central1.run.app/generate  
**Tiempo de ejecución:** 8-15 segundos  
**Costo:** ~$0.12 por ejecución (Gemini + Cloud Functions)

## 📊 Base de Datos (Firestore)

### Estructura de Colecciones

```
/users/{uid}
  ├── credits: number (3 inicial, se incrementa/decrementa)
  └── createdAt: timestamp

/customers/{uid}  (Creado por Stripe Extension)
  ├── email: string
  ├── stripeId: string
  └── ... (otros datos de Stripe)
  │
  ├── /checkout_sessions/{sessionId}
  │   ├── mode: 'payment'
  │   ├── price: string (priceId)
  │   ├── success_url: string
  │   ├── cancel_url: string
  │   ├── sessionId: string (agregado por Extension)
  │   └── error: object (si hay error)
  │
  └── /payments/{paymentId}
      ├── status: 'succeeded' | 'processing' | 'failed'
      ├── amount: number (centavos)
      ├── created: timestamp
      └── items: array
          └── [0]
              └── price
                  └── id: string (priceId)
```

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users: Solo lectura/escritura propia
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false;  // Solo Cloud Functions pueden escribir
    }
    
    // Customers: Gestionado por Stripe Extension
    match /customers/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      
      match /checkout_sessions/{sessionId} {
        allow read, write: if request.auth.uid == userId;
      }
      
      match /payments/{paymentId} {
        allow read: if request.auth.uid == userId;
      }
    }
  }
}
```

## 🔐 Seguridad y Mejores Prácticas

### 1. Validación en Múltiples Capas

```
Frontend: Validación de UI (rápida, mejora UX)
    ↓
Backend: Validación de negocio (crítica, no hackeable)
    ↓
Firestore Rules: Validación de acceso (última línea)
```

### 2. Tokens de Autenticación

```javascript
// Frontend obtiene token
const token = await firebase.auth().currentUser.getIdToken();

// Backend valida token
const decodedToken = await admin.auth().verifyIdToken(token);
const uid = decodedToken.uid;  // UID verificado
```

### 3. Rate Limiting

```javascript
// En Cloud Functions
const rateLimitMap = new Map();

function checkRateLimit(uid) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(uid) || [];
  
  // Limpiar requests antiguos (>1 min)
  const recentRequests = userRequests.filter(time => now - time < 60000);
  
  // Máximo 5 requests por minuto
  if (recentRequests.length >= 5) {
    throw new Error('Rate limit exceeded');
  }
  
  recentRequests.push(now);
  rateLimitMap.set(uid, recentRequests);
}
```

## 📈 Escalabilidad

### Puntos de Escalabilidad

1. **Cloud Functions**
   - Escalado automático por Firebase
   - Concurrency: 1 (puede aumentarse si es necesario)
   - Memory: 1GiB (ajustable según demanda)

2. **Firestore**
   - Escalado automático
   - Límite: 10,000 writes/seg (más que suficiente)

3. **Storage**
   - Escalado automático
   - Límite: 5TB (puede expandirse)

4. **Gemini API**
   - Rate limit: Depende del plan de Google Cloud
   - Actual: Suficiente para producción inicial

### Cuellos de Botella Potenciales

1. **Gemini API latency** (8-12 seg)
   - Solución: Implementar cola de procesamiento
   - Futuro: Cache de transformaciones similares

2. **Cold starts de Cloud Functions** (2-3 seg)
   - Solución: Implementar warm-up requests
   - Futuro: Migrar a Cloud Run para instancias siempre activas

3. **Firestore reads** (costo)
   - Solución: Implementar caché en frontend
   - Futuro: Redis para datos frecuentes

## 🔄 Última Actualización

**Fecha:** Octubre 2025  
**Versión:** 1.0.0
