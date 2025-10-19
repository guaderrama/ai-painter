# Estándares de Código - AI Painter

## Principios Generales

1. **Seguridad primero**: Nunca exponer API keys en frontend
2. **Validación doble**: Frontend (UX) + Backend (seguridad)
3. **Commits claros**: Usar Conventional Commits (feat:, fix:, refactor:)
4. **Testing**: Probar con cuentas nuevas siempre

## JavaScript/Node.js

- Usar `async/await` sobre callbacks
- Validar todos los inputs
- Logging en Cloud Functions
- Manejo robusto de errores con try/catch

## Firebase

### Cloud Functions
```javascript
// Siempre validar auth
const token = req.headers.authorization?.split('Bearer ')[1];
const decodedToken = await admin.auth().verifyIdToken(token);
const uid = decodedToken.uid;

// Validar créditos antes de procesar
const userDoc = await admin.firestore().collection('users').doc(uid).get();
if (userDoc.data().credits < 1) {
  return res.status(403).json({ error: 'Insufficient credits' });
}
```

### Stripe Integration
```javascript
// CRÍTICO: mode: 'payment' para one-time payments
.add({
  mode: 'payment',
  price: priceId,
  success_url: window.location.origin,
  cancel_url: window.location.origin,
});
```

## Formato de Commits

```bash
<tipo>: <descripción corta>

<descripción detallada>
- Cambio 1
- Cambio 2

Related to: <task/issue>
```

**Tipos:**
- feat: Nueva funcionalidad
- fix: Bug fix
- refactor: Refactorización
- docs: Documentación
- chore: Tareas de mantenimiento
