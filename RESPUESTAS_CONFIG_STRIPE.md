# 📝 RESPUESTAS PARA CONFIGURAR STRIPE EXTENSION

## 🎯 **IMAGEN 1 - Opciones Avanzadas (Primera foto):**

```
✅ Minimum function instances (Optional): 0
✅ Maximum function instances (Optional): (déjalo vacío)
✅ Function ingress settings (Optional): (déjalo como está)
✅ Function labels (Optional): (déjalo vacío)
✅ KMS key name (Optional): (déjalo vacío)
✅ Docker repository (Optional): (déjalo vacío)
✅ Function memory (Optional): 256MB
```

---

## 🎯 **IMAGEN 2 - Webhook y Events:**

```
✅ Stripe webhook secret (Optional): (DÉJALO VACÍO)
✅ Minimum instances for createCheckoutSession function: 0
❌ Enable events: (NO marques esta casilla, déjala desmarcada)
```

---

## 🎯 **IMAGEN 3 - Configuración Principal:**

```
✅ Automatically delete Stripe customer objects: Do not delete

✅ Stripe API key with restricted access:
[TU_STRIPE_API_KEY_AQUI]

✅ Stripe webhook secret (Optional): (DÉJALO VACÍO)

✅ Minimum instances for createCheckoutSession function: 0

🔽 Configure advanced parameters (abre esta sección):
   ✅ Function timeout seconds (Optional): (déjalo vacío)
   ✅ VPC Connector (Optional): (déjalo vacío)
   ✅ VPC Connector Egress settings (Optional): Unspecified
```

---

## 🎯 **IMAGEN 4 - Configure Extension:**

```
✅ Cloud Functions deployment location: Iowa (us-central1)

✅ Products and pricing plans collection: products

✅ Customer details and subscriptions collection: customers

✅ Stripe configuration collection (Optional): configuration

✅ Sync new users to Stripe customers and Cloud Firestore: Do not sync

✅ Automatically delete Stripe customer objects: Do not delete

✅ Stripe API key with restricted access:
[TU_STRIPE_API_KEY_AQUI]
```

---

## ⚡ **RESUMEN - COPIA Y PEGA:**

### **Campos que DEBES llenar:**

**Stripe API key:**
```
[TU_STRIPE_API_KEY_AQUI]
```

**Products collection:**
```
products
```

**Customers collection:**
```
customers
```

**Configuration collection:**
```
configuration
```

### **Campos que DEBES dejar como están:**

- Location: `Iowa (us-central1)`
- Delete customer objects: `Do not delete`
- Sync users: `Do not sync`
- Minimum instances: `0`

### **Campos que DEBES dejar VACÍOS:**

- Stripe webhook secret
- All optional fields

---

## 🚀 **SIGUIENTE PASO:**

Después de llenar todo, haz scroll hasta abajo y click en:
**"Install extension"** (botón azul)

Espera 2-3 minutos mientras instala.

Cuando termine, dime "Extension instalada" y probamos los pagos.
