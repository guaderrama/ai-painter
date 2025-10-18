# 🔧 PLAN PARA ARREGLAR ERROR DE STRIPE

## ❌ **PROBLEMA ACTUAL:**

```
Error: You must provide at least one recurring price in `subscription` mode when using prices.
```

## 🎯 **CAUSA DEL PROBLEMA:**

La Firebase Extension "Run Payments with Stripe" está configurada para manejar **suscripciones** por defecto, pero nuestros productos son **pagos únicos** (one-time payments).

---

## 📋 **OPCIONES DE SOLUCIÓN:**

### **OPCIÓN 1: Reconfigurar Firebase Extension (MÁS FÁCIL)**

**Pros:**
- Usa la infraestructura existente
- No requiere código backend adicional
- Automático

**Cons:**
- Puede que la Extension no soporte one-time payments bien
- Menos control

**Pasos:**
1. Ir a Firebase Console → Extensions
2. Reconfigurar la Extension para soportar pagos únicos
3. O desinstalar y reinstalar con configuración correcta

---

### **OPCIÓN 2: Crear Cloud Function propia (RECOMENDADO)**

**Pros:**
- Control total sobre el flujo de pagos
- Soporte completo para one-time payments
- Más flexible

**Cons:**
- Requiere más código
- Tenemos que manejar webhooks manualmente

**Pasos:**
1. Desinstalar Firebase Extension
2. Crear Cloud Function para crear Checkout Sessions
3. Crear Cloud Function para manejar webhooks de Stripe
4. Actualizar frontend para usar la nueva función
5. Deploy y testing

---

## ✅ **RECOMENDACIÓN: OPCIÓN 2**

Voy a crear una Cloud Function que maneje Stripe directamente, sin depender de la Extension.

---

## 📝 **PLAN DETALLADO - OPCIÓN 2:**

### **PASO 1: Instalar Stripe SDK**
```bash
cd functions
npm install stripe
```

### **PASO 2: Crear función createCheckoutSession**
- Recibe: `priceId` del frontend
- Crea: Stripe Checkout Session en mode 'payment'
- Retorna: `sessionId` al frontend

### **PASO 3: Crear función handleStripeWebhook**
- Escucha: eventos de Stripe (`checkout.session.completed`)
- Cuando pago exitoso: agrega créditos al usuario
- Security: valida signature de Stripe

### **PASO 4: Actualizar script.js**
- Cambiar de Firestore approach a llamar función directamente
- Usar sessionId para redirigir a Stripe Checkout

### **PASO 5: Configurar webhook en Stripe**
- URL: `https://api-XXXXXX.cloudfunctions.net/handleStripeWebhook`
- Eventos: `checkout.session.completed`

### **PASO 6: Deploy y testing**

---

## ⏱️ **TIEMPO ESTIMADO:**

- Instalar Stripe: 1 min
- Crear functions: 10 min
- Actualizar frontend: 5 min
- Configurar webhook: 3 min
- Deploy y testing: 5 min

**Total: ~25 minutos**

---

## 🚀 **VENTAJAS DE ESTE APPROACH:**

1. **Control total** sobre el flujo de pagos
2. **No dependemos** de Firebase Extension
3. **Soporte completo** para one-time payments
4. **Más fácil** de debuggear
5. **Más flexible** para futuras features

---

## ⚠️ **DESVENTAJAS:**

1. Más código para mantener
2. Tenemos que manejar webhooks manualmente
3. Requiere configuración en Stripe Dashboard

---

## 💡 **DECISIÓN:**

**Procederemos con OPCIÓN 2** - crear Cloud Functions propias para manejar Stripe.

Esto nos dará control total y garantizará que funcione correctamente con one-time payments.

---

**¿Procedo con la implementación?**

Si dices "sí" o "procede", comenzaré a:
1. Instalar Stripe SDK en functions
2. Crear las dos Cloud Functions
3. Actualizar el frontend
4. Deployar y probar

**Estimas 25 minutos para tener todo funcionando.**
