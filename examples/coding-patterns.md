# Patrones de Código - AI Painter

## Ejemplo 1: Validación de Créditos (Frontend + Backend)

### Frontend (script.js)
```javascript
// Validar antes de permitir upload
async function handleImageSelect(file) {
  const userDoc = await db.collection('users').doc(user.uid).get();
  const credits = userDoc.data()?.credits || 0;
  
  if (credits < 1) {
    showScreen('limit');  // Redirigir a pricing
    return;
  }
  
  // Continuar con upload...
  await uploadAndProcess(file);
}
```

### Backend (functions/index.js)
```javascript
// Validar nuevamente en servidor (seguridad)
app.post('/generate', async (req, res) => {
  const uid = decodedToken.uid;
  const userDoc = await admin.firestore()
    .collection('users').doc(uid).get();
  
  if (userDoc.data().credits < 1) {
    return res.status(403).json({ error: 'Insufficient credits' });
  }
  
  // Procesar imagen...
});
```

---

## Ejemplo 2: Crear Checkout de Stripe

```javascript
async function purchaseCredits(planId) {
  const priceId = STRIPE_PRICES[planId];
  
  const docRef = await db
    .collection('customers')
    .doc(user.uid)
    .collection('checkout_sessions')
    .add({
      mode: 'payment',  // CRÍTICO para one-time payments
      price: priceId,
      success_url: window.location.origin,
      cancel_url: window.location.origin,
    });
  
  // Escuchar cuando se agregue sessionId
  docRef.onSnapshot(async (snap) => {
    const { error, sessionId } = snap.data();
    if (error) alert('Error: ' + error.message);
    if (sessionId) {
      await stripe.redirectToCheckout({ sessionId });
    }
  });
}
```

---

## Ejemplo 3: Listener de Créditos en Tiempo Real

```javascript
// En auth state change
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // Escuchar cambios en créditos
    creditsListener = db.collection('users')
      .doc(user.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const credits = doc.data().credits || 0;
          document.getElementById('credits-display').textContent = 
            `${credits} credits remaining`;
        }
      });
  } else {
    // Detener listener al hacer logout
    if (creditsListener) creditsListener();
  }
});
