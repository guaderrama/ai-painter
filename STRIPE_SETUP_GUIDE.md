# 🔧 GUÍA COMPLETA DE CONFIGURACIÓN DE STRIPE

## ✅ PASOS QUE DEBES SEGUIR (15 MINUTOS)

### **PASO 1: Instalar Firebase Extension de Stripe** (5 min)

```bash
cd "C:\Users\admin\Dropbox\Ai\ai painter"
firebase ext:install stripe/firestore-stripe-payments
```

**Te preguntará:**

1. **Stripe Secret Key:**
   - Ve a https://dashboard.stripe.com/test/apikeys
   - Click "Reveal test key" en Secret key
   - Copia y pega: `sk_test_51xxxxx...`

2. **Productos y precios collection:**
   - Déjalo como está: `products`

3. **Clientes collection:**
   - Déjalo como está: `customers`

4. **Configurar webhooks automáticamente:**
   - Selecciona: `YES`

---

### **PASO 2: Crear Productos en Stripe Dashboard** (10 min)

Ve a: https://dashboard.stripe.com/test/products

**Crea 4 productos:**

#### **Producto 1: Starter Pack**
```
Name: Starter Pack
Description: 10 AI Artwork Credits
Price: $4.99 USD
Type: One-time
```
**Copia el Price ID:** `price_xxxxx1` ← Guárdalo

#### **Producto 2: Popular Pack**
```
Name: Popular Pack
Description: 30 AI Artwork Credits - Best Value!
Price: $12.99 USD
Type: One-time
```
**Copia el Price ID:** `price_xxxxx2` ← Guárdalo

#### **Producto 3: Pro Pack**
```
Name: Pro Pack
Description: 75 AI Artwork Credits
Price: $29.99 USD
Type: One-time
```
**Copia el Price ID:** `price_xxxxx3` ← Guárdalo

#### **Producto 4: Artist Pack**
```
Name: Artist Pack
Description: 200 AI Artwork Credits
Price: $69.99 USD
Type: One-time
```
**Copia el Price ID:** `price_xxxxx4` ← Guárdalo

---

### **PASO 3: Configurar Metadata en Cada Producto**

Para cada producto creado:

1. Click en el producto
2. Ve a la sección "Metadata"
3. Agrega:
   ```
   Key: credits
   Value: 10  (o 30, 75, 200 según el paquete)
   ```

Esto le dice a la función cuántos créditos dar al usuario.

---

### **PASO 4: Actualizar Price IDs en el Código**

Abre `script.js` y busca la sección "STRIPE CONFIGURATION"

Reemplaza con tus Price IDs reales:

```javascript
const STRIPE_PRICES = {
    starter: 'price_xxxxx1',  // ← Tu Price ID real
    popular: 'price_xxxxx2',  // ← Tu Price ID real
    pro: 'price_xxxxx3',      // ← Tu Price ID real
    artist: 'price_xxxxx4',   // ← Tu Price ID real
};
```

---

### **PASO 5: Obtener Publishable Key**

1. Ve a: https://dashboard.stripe.com/test/apikeys
2. Copia tu **Publishable key** (pk_test_...)
3. En `script.js`, busca:
   ```javascript
   const stripe = Stripe('AQUI_TU_PUBLISHABLE_KEY');
   ```
4. Reemplaza con tu key real

---

### **PASO 6: Deploy**

```bash
firebase deploy --only functions,hosting
```

---

## ✅ VERIFICACIÓN

Después de configurar todo, verifica:

- [ ] Extensión de Stripe instalada en Firebase
- [ ] 4 productos creados en Stripe
- [ ] Metadata "credits" en cada producto
- [ ] Price IDs actualizados en script.js
- [ ] Publishable key actualizada
- [ ] Deploy completado

---

## 🧪 TESTING

### **Tarjetas de Prueba:**

```
Éxito:
4242 4242 4242 4242
Cualquier fecha futura
Cualquier CVC

Requiere autenticación 3D:
4000 0025 0000 3155

Declinada:
4000 0000 0000 0002
```

---

## 🆘 TROUBLESHOOTING

**Problema:** "No such customer"
**Solución:** Asegúrate que el usuario esté autenticado

**Problema:** "Invalid API Key"
**Solución:** Verifica que usaste Secret key (sk_test_) no Publishable key

**Problema:** "Webhook signature verification failed"
**Solución:** La extensión lo maneja automáticamente, no te preocupes

---

**Una vez completes estos pasos, el sistema de pagos estará 100% funcional.**
