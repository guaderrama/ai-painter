# Documentación de APIs - AI Painter

## 📡 Cloud Function API

### Base URL
```
https://api-255643153942.us-central1.run.app
```

### Autenticación
Todas las peticiones requieren un token de autenticación de Firebase en el header:

```http
Authorization: Bearer <firebaseIdToken>
```

**Obtener token en frontend:**
```javascript
const user = firebase.auth().currentUser;
const token = await user.getIdToken();
```

---

## Endpoints

### POST /generate

Genera un artwork a partir de una foto subida, transformándola a estilo Fauvista usando Gemini AI.

#### Request

**Headers:**
```http
Authorization: Bearer <firebaseIdToken>
Content-Type: application/json
```

**Body:**
```json
{
  "imageUrl": "https://firebasestorage.googleapis.com/v0/b/ai-painter-app-uploads-2025/o/..."
}
```

**Parámetros:**
- `imageUrl` (string, required): URL pública de la imagen en Firebase Storage

#### Response

**Success (200 OK):**
```json
{
  "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Error - Sin créditos (403 Forbidden):**
```json
{
  "error": "Insufficient credits"
}
```

**Error - No autenticado (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

**Error - Servidor (500 Internal Server Error):**
```json
{
  "error": "Error message details"
}
```

#### Ejemplo de uso

```javascript
const uploadedImageUrl = "https://firebasestorage.googleapis.com/...";
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch('https://api-255643153942.us-central1.run.app/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    imageUrl: uploadedImageUrl
  })
});

const data = await response.json();
if (response.ok) {
  // data.imageUrl contiene la imagen generada en base64
  const img = document.createElement('img');
  img.src = data.imageUrl;
  document.body.appendChild(img);
} else {
  console.error('Error:', data.error);
}
```

#### Notas importantes

- El endpoint valida que el usuario tenga ≥ 1 crédito antes de procesar
- Descuenta automáticamente 1 crédito al completar exitosamente
- Tiempo de procesamiento: 8-15 segundos
- Máximo tamaño de imagen: Se redimensiona automáticamente a 1024px
- Formato de salida: PNG en base64

---

### POST /ensure-user

Endpoint de backup para inicializar usuario manualmente. Normalmente no es necesario porque `initializeUser` Cloud Function se ejecuta automáticamente.

#### Request

**Headers:**
```http
Authorization: Bearer <firebaseIdToken>
Content-Type: application/json
```

**Body:**
```json
{}
```

#### Response

**Success (200 OK):**
```json
{
  "message": "User initialized successfully"
}
```

#### Ejemplo de uso

```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch('https://api-255643153942.us-central1.run.app/ensure-user', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
});

const data = await response.json();
console.log(data.message);
```

---

## 🤖 Google Gemini API

### Configuración

**Model:** gemini-2.5-flash-preview-0514  
**Plataforma:** Vertex AI  
**Región:** us-central1  
**Proyecto:** ai-painter-app

### Prompt Utilizado

```
Transform this photo into a painting in the style of Fauvism. 
Use bold, vibrant, and non-naturalistic colors. Emphasize 
emotional expression through color rather than realistic 
representation. Apply visible, expressive brushstrokes. 
Focus on simplified forms and strong outlines. The result 
should look like it was painted by Henri Matisse or André 
Derain, with dramatic use of pure, unmixed colors.
```

### Parámetros de Generación

```javascript
{
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 1,
    topP: 0.95
  }
}
```

### Input Format

```javascript
{
  contents: [
    {
      role: 'user',
      parts: [
        { text: '<prompt>' },
        {
          inlineData: {
            data: '<base64_image>',
            mimeType: 'image/png'
          }
        }
      ]
    }
  ]
}
```

### Output Format

```javascript
{
  candidates: [
    {
      content: {
        parts: [
          {
            inlineData: {
              data: '<base64_generated_image>',
              mimeType: 'image/png'
            }
          }
        ]
      }
    }
  ]
}
```

---

## 🔥 Firebase APIs

### Authentication API

#### Google OAuth Sign In

```javascript
const provider = new firebase.auth.GoogleAuthProvider();
const result = await firebase.auth().signInWithPopup(provider);
const user = result.user;

// Datos disponibles
console.log(user.uid);           // User ID único
console.log(user.email);         // Email del usuario
console.log(user.displayName);   // Nombre del usuario
console.log(user.photoURL);      // URL de foto de perfil
```

#### Email/Password Sign Up

```javascript
const userCredential = await firebase.auth()
  .createUserWithEmailAndPassword(email, password);
const user = userCredential.user;

console.log(user.uid);    // User ID único
console.log(user.email);  // Email registrado
```

#### Email/Password Sign In

```javascript
const userCredential = await firebase.auth()
  .signInWithEmailAndPassword(email, password);
const user = userCredential.user;
```

#### Sign Out

```javascript
await firebase.auth().signOut();
```

#### Auth State Observer

```javascript
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // Usuario autenticado
    console.log('User signed in:', user.uid);
  } else {
    // Usuario no autenticado
    console.log('User signed out');
  }
});
```

---

### Firestore API

#### Leer créditos del usuario

```javascript
const db = firebase.firestore();
const userDoc = await db.collection('users').doc(user.uid).get();

if (userDoc.exists) {
  const credits = userDoc.data().credits;
  console.log('Credits:', credits);
} else {
  console.log('User document not found');
}
```

#### Escuchar cambios en tiempo real

```javascript
const unsubscribe = db.collection('users').doc(user.uid)
  .onSnapshot((doc) => {
    if (doc.exists) {
      const credits = doc.data().credits;
      updateUI(credits);
    }
  });

// Detener listener cuando ya no se necesite
unsubscribe();
```

#### Leer pagos del usuario

```javascript
const paymentsSnapshot = await db
  .collection('customers')
  .doc(user.uid)
  .collection('payments')
  .where('status', '==', 'succeeded')
  .orderBy('created', 'desc')
  .limit(10)
  .get();

paymentsSnapshot.forEach((doc) => {
  const payment = doc.data();
  console.log('Amount:', payment.amount);
  console.log('Status:', payment.status);
});
```

---

### Storage API

#### Subir imagen

```javascript
const storage = firebase.storage();
const storageRef = storage.ref();
const fileRef = storageRef.child(`user_uploads/${user.uid}/${Date.now()}_${file.name}`);

// Metadata opcional
const metadata = {
  contentType: file.type,
  customMetadata: {
    'uploadedBy': user.uid,
    'originalName': file.name
  }
};

// Upload
const uploadTask = fileRef.put(file, metadata);

// Monitorear progreso
uploadTask.on('state_changed',
  (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload progress:', progress + '%');
  },
  (error) => {
    console.error('Upload error:', error);
  },
  async () => {
    // Upload completo
    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
    console.log('File available at:', downloadURL);
  }
);
```

#### Obtener URL de descarga

```javascript
const url = await fileRef.getDownloadURL();
console.log('Download URL:', url);
```

#### Eliminar archivo

```javascript
await fileRef.delete();
console.log('File deleted');
```

---

## 💳 Stripe API (via Firebase Extension)

### Crear Checkout Session

```javascript
const db = firebase.firestore();
const stripe = Stripe('pk_test_51N4Hx4GdnHfsTKeb...');  // Publishable key

// Crear sesión de checkout
const docRef = await db
  .collection('customers')
  .doc(user.uid)
  .collection('checkout_sessions')
  .add({
    mode: 'payment',  // IMPORTANTE: Debe ser 'payment' para one-time payments
    price: 'price_1SJ0UWGdnHfsTKebUDHcFzL3',  // Price ID de Stripe
    success_url: window.location.origin,
    cancel_url: window.location.origin,
  });

// Escuchar cuando Extension agregue el sessionId
docRef.onSnapshot(async (snap) => {
  const { error, sessionId } = snap.data();
  
  if (error) {
    // Manejo de error
    alert(`An error occurred: ${error.message}`);
  }
  
  if (sessionId) {
    // Redirigir a Stripe Checkout
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      console.error('Stripe redirect error:', error);
    }
  }
});
```

### Price IDs Disponibles

```javascript
const STRIPE_PRICES = {
  starter: 'price_1SJ0UWGdnHfsTKebUDHcFzL3',  // $4.99 → 10 créditos
  popular: 'price_1SJ0eSGdnHfsTKeb3RErkfWa',  // $12.99 → 30 créditos
  pro: 'price_xxx',      // $29.99 → 75 créditos (pendiente)
  artist: 'price_xxx'    // $69.99 → 200 créditos (pendiente)
};
```

### Verificar estado de pago

```javascript
// Los pagos aparecen automáticamente en esta colección
const paymentsSnapshot = await db
  .collection('customers')
  .doc(user.uid)
  .collection('payments')
  .get();

paymentsSnapshot.forEach((doc) => {
  const payment = doc.data();
  console.log('Payment ID:', doc.id);
  console.log('Status:', payment.status);  // 'succeeded', 'processing', 'failed'
  console.log('Amount:', payment.amount);  // En centavos
  console.log('Price ID:', payment.items[0].price.id);
});
```

---

## 🔒 Seguridad y Rate Limiting

### Rate Limits

**Cloud Function /generate:**
- Por usuario: ~5 requests por minuto (implementado en código)
- Global: Limitado por Gemini API quota

**Firestore:**
- Reads: Sin límite práctico para uso actual
- Writes: 10,000 writes/segundo (tier gratis)

**Storage:**
- Upload: 5GB/día en tier gratis
- Download: 1GB/día en tier gratis

### CORS Configuration

Orígenes permitidos en Cloud Functions:
```javascript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'https://ai-painter-app.web.app',
  'https://ai-painter-app.firebaseapp.com'
];
```

### Token Expiration

Los tokens de Firebase Auth expiran después de 1 hora. El SDK maneja automáticamente la renovación, pero si haces llamadas manuales:

```javascript
// Forzar refresh del token
const token = await user.getIdToken(true);  // true = force refresh
```

---

## 📊 Códigos de Error

### HTTP Status Codes

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Petición exitosa |
| 400 | Bad Request | Parámetros inválidos |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | Sin créditos suficientes |
| 404 | Not Found | Endpoint no existe |
| 500 | Internal Server Error | Error en servidor |
| 503 | Service Unavailable | Gemini API no disponible |

### Firebase Auth Errors

```javascript
try {
  await firebase.auth().signInWithEmailAndPassword(email, password);
} catch (error) {
  switch (error.code) {
    case 'auth/user-not-found':
      console.log('No user found with this email');
      break;
    case 'auth/wrong-password':
      console.log('Incorrect password');
      break;
    case 'auth/email-already-in-use':
      console.log('Email already registered');
      break;
    case 'auth/weak-password':
      console.log('Password should be at least 6 characters');
      break;
    default:
      console.log('Auth error:', error.message);
  }
}
```

---

## 🧪 Testing

### Tarjeta de Prueba Stripe

Para testing en modo test de Stripe:

```
Número: 4242 4242 4242 4242
Expira: 12/34 (cualquier fecha futura)
CVC: 123 (cualquier 3 dígitos)
ZIP: 12345 (cualquier código)
```

### Endpoints de Testing

```javascript
// Test que Cloud Function está activa
fetch('https://api-255643153942.us-central1.run.app/generate')
  .then(res => console.log('Status:', res.status));
// Debe retornar 401 (esperado sin auth)
```

---

## 📝 Notas Importantes

1. **Siempre incluir Authorization header** en llamadas a Cloud Functions
2. **Validar créditos en frontend** antes de subir imagen (mejor UX)
3. **Manejar errores apropiadamente** y mostrar mensajes claros al usuario
4. **No almacenar tokens** en localStorage (el SDK maneja esto automáticamente)
5. **Implementar retry logic** para peticiones que fallen por network issues

---

## 🔄 Última Actualización

**Fecha:** Octubre 2025  
**Versión:** 1.0.0
