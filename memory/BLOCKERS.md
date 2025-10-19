# Bloqueos y Problemas - AI Painter

## 🟢 Activos

Ninguno actualmente. Sistema funcionando al 100%.

---

## ✅ Resueltos

### Créditos Gratis No Se Otorgaban (Resuelto: 2025-10-17)

**Problema:** Usuarios nuevos no recibían 3 créditos automáticamente

**Causa:** `initializeUser` usaba trigger incorrecto (`beforeUserCreated`)

**Solución:** Cambiar a `onDocumentCreated("customers/{uid}")`
- Espera a que Stripe Extension cree el documento
- Se dispara automáticamente al crear usuario

**Resultado:** Funciona perfectamente, 15-20 seg delay aceptable

---

### Error Stripe "must provide recurring price" (Resuelto: 2025-10-17)

**Problema:** Al comprar créditos, error en Stripe checkout

**Causa:** Faltaba `mode: 'payment'` en checkout session

**Solución:** Agregar explícitamente:
```javascript
.add({
  mode: 'payment',  // CRÍTICO
  price: priceId,
  success_url: window.location.origin,
  cancel_url: window.location.origin,
});
```

**Resultado:** Pagos funcionando correctamente

---

### Usuario Podía Procesar Sin Créditos (Resuelto: 2025-10-17)

**Problema:** Frontend permitía upload aun sin créditos

**Causa:** No se validaba créditos antes de permitir upload

**Solución:** Agregar validación en frontend antes de upload:
```javascript
if (credits < 1) {
  showScreen('limit');
  return;
}
```

**Resultado:** Usuarios sin créditos redirigidos a pricing

---

## 📝 Lecciones Aprendidas

1. **Siempre validar en múltiples capas**: Frontend (UX) + Backend (seguridad)
2. **Firebase Extension requiere paciencia**: Los triggers pueden tardar 15-20 seg
3. **Stripe mode='payment' es crucial**: Para one-time payments
4. **Logs son tu mejor amigo**: `firebase functions:log` esencial para debug
5. **Test con cuentas nuevas**: Siempre probar con emails nunca usados antes
