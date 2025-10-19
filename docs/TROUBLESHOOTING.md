# Troubleshooting - AI Painter

## 🔧 Problemas Comunes y Soluciones

### 1. Créditos No Se Otorgan al Registrarse

**Síntoma:** Usuario nuevo muestra "Loading credits..." infinitamente

**Diagnóstico:**
```bash
# Ver logs de initializeUser
firebase functions:log --only initializeUser
```

**Causas posibles:**
- Extension de Stripe no está activa
- Documento `customers/{uid}` no se creó
- Función initializeUser falló

**Solución:**
```javascript
// Llamar manualmente /ensure-user
const token = await user.getIdToken();
fetch('https://api-255643153942.us-central1.run.app/ensure-user', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### 2. Pago Completado Pero Sin Créditos

**Diagnóstico:**
1. Firebase Console → Firestore → `customers/{uid}/payments`
2. Verificar que existe documento con `status: "succeeded"`
3. Ver logs: `firebase functions:log --only grantCreditsOnPayment`

**Causas posibles:**
- Price ID no está en `CREDITS_BY_PRICE` mapping
- Payment status !== "succeeded"
- Función falló

**Solución:**
```javascript
// En functions/index.js, verificar mapping
const CREDITS_BY_PRICE = {
  'price_1SJ0UWGdnHfsTKebUDHcFzL3': 10,
  'price_1SJ0eSGdnHfsTKeb3RErkfWa': 30,
  // Agregar el Price ID faltante aquí
};
```

Re-deploy: `firebase deploy --only functions`

---

### 3. Error "must provide recurring price in subscription mode"

**Síntoma:** Al comprar créditos, error en Stripe checkout

**Causa:** Falta `mode: 'payment'` en checkout session

**Solución:**
```javascript
// En script.js, verificar que incluye mode
.add({
  mode: 'payment',  // ← DEBE estar presente
  price: priceId,
  success_url: window.location.origin,
  cancel_url: window.location.origin,
});
```

---

### 4. Imagen No Se Genera (Timeout)

**Síntoma:** Processing screen infinito, timeout después de 5 minutos

**Diagnóstico:**
```bash
firebase functions:log --only api
```

**Causas posibles:**
- Imagen muy grande (>5MB)
- Gemini API lento
- Error en redimensionado

**Solución:**
1. Verificar tamaño de imagen
2. Intentar con imagen más pequeña
3. Si persiste, revisar quota de Gemini API en Google Cloud Console

---

### 5. CORS Error en /generate

**Síntoma:** Error de CORS al llamar Cloud Function

**Verificar origen permitido:**
```javascript
// En functions/index.js
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://ai-painter-app.web.app',
  // Agregar origen si es necesario
];
```

---

### 6. "Insufficient credits" Aunque Hay Créditos

**Causa:** Cache del frontend desactualizado

**Solución:**
```javascript
// Forzar refresh
window.location.reload();
```

---

### 7. Login con Google No Funciona

**Verificar:**
1. Firebase Console → Authentication → Sign-in method
2. Google debe estar habilitado
3. Dominio debe estar en lista autorizada

**Solución:**
Firebase Console → Authentication → Settings → Authorized domains
Agregar: `ai-painter-app.web.app`

---

### 8. Storage Upload Falla

**Síntoma:** Error al subir imagen

**Verificar reglas de Storage:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /user_uploads/{userId}/{allPaths=**} {
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
  }
}
```

---

## 🚨 Errores Críticos

### Cloud Function No Responde

```bash
# Verificar que está deployada
firebase functions:list

# Ver logs
firebase functions:log --only api

# Re-deploy
firebase deploy --only functions:api
```

### Stripe Extension No Funciona

1. Firebase Console → Extensions
2. Verificar que "Firebase Stripe Extension" está instalada y activa
3. Revisar configuración de webhook en Stripe Dashboard

---

## 📊 Debugging Tips

### Ver Requests en Network Tab

1. Abrir DevTools → Network
2. Intentar operación que falla
3. Ver request/response
4. Copiar error exacto

### Ver Firestore en Tiempo Real

```javascript
// En browser console
db.collection('users').doc(firebase.auth().currentUser.uid)
  .onSnapshot(doc => console.log(doc.data()));
```

### Verificar Token de Auth

```javascript
// En browser console
firebase.auth().currentUser.getIdToken()
  .then(token => console.log(token));
```

---

## 🔄 Última Actualización

**Fecha:** Octubre 2025  
**Versión:** 1.0.0
