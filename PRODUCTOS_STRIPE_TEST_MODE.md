# 📦 PRODUCTOS PARA CREAR EN STRIPE (TEST MODE)

## ⚠️ **IMPORTANTE ANTES DE EMPEZAR:**

1. Ve a: https://dashboard.stripe.com/test/products
2. Arriba a la derecha, **ASEGÚRATE** de que diga **"Test mode"** (toggle activado)
3. Si dice "Live mode", cambia a "Test mode"

---

## 📦 **PRODUCTO 1: STARTER PACK**

### **Información del Producto:**
```
Product name: Starter Pack

Description: 10 AI Artwork Credits - Perfect for trying

Images: (opcional, puedes dejarlo vacío o subir una imagen)
```

### **Pricing Information:**
```
Pricing model: Standard pricing

Price: 4.99

Currency: USD

Billing period: One time
```

### **Additional options:**
```
Statement descriptor: (déjalo vacío)

Tax code: (déjalo como está)
```

### **Metadata (MUY IMPORTANTE):**
Click en "Add metadata"
```
Key: credits
Value: 10
```

### **Acción:**
- Click "Save product"
- **COPIA EL PRICE ID** (aparece debajo del precio, empieza con `price_`)

---

## 📦 **PRODUCTO 2: POPULAR PACK**

### **Información del Producto:**
```
Product name: Popular Pack

Description: 30 AI Artwork Credits - Best Value!

Images: (opcional, déjalo vacío)
```

### **Pricing Information:**
```
Pricing model: Standard pricing

Price: 12.99

Currency: USD

Billing period: One time
```

### **Metadata (MUY IMPORTANTE):**
```
Key: credits
Value: 30
```

### **Acción:**
- Click "Save product"
- **COPIA EL PRICE ID**

---

## 📦 **PRODUCTO 3: PRO PACK** (OPCIONAL)

### **Información del Producto:**
```
Product name: Pro Pack

Description: 75 AI Artwork Credits - Professional

Images: (opcional, déjalo vacío)
```

### **Pricing Information:**
```
Pricing model: Standard pricing

Price: 29.99

Currency: USD

Billing period: One time
```

### **Metadata (MUY IMPORTANTE):**
```
Key: credits
Value: 75
```

### **Acción:**
- Click "Save product"
- **COPIA EL PRICE ID**

---

## 📦 **PRODUCTO 4: ARTIST PACK** (OPCIONAL)

### **Información del Producto:**
```
Product name: Artist Pack

Description: 200 AI Artwork Credits - For Serious Artists

Images: (opcional, déjalo vacío)
```

### **Pricing Information:**
```
Pricing model: Standard pricing

Price: 69.99

Currency: USD

Billing period: One time
```

### **Metadata (MUY IMPORTANTE):**
```
Key: credits
Value: 200
```

### **Acción:**
- Click "Save product"
- **COPIA EL PRICE ID**

---

## ✅ **CHECKLIST:**

Después de crear cada producto, verifica:
- [ ] Estás en TEST MODE (arriba a la derecha)
- [ ] El producto se guardó correctamente
- [ ] Tiene el precio correcto
- [ ] Tiene "One time" como billing period
- [ ] Tiene metadata con Key: credits y Value: (número correcto)
- [ ] Copiaste el PRICE ID (empieza con `price_`)

---

## 📝 **FORMATO PARA PEGARME LOS PRICE IDS:**

Una vez que crees los productos, pégame los Price IDs así:

```
Starter Pack (TEST): price_xxxxxxxxxxxxx
Popular Pack (TEST): price_xxxxxxxxxxxxx
Pro Pack (TEST): price_xxxxxxxxxxxxx (opcional)
Artist Pack (TEST): price_xxxxxxxxxxxxx (opcional)
```

---

## 💡 **NOTAS IMPORTANTES:**

1. **DEBES estar en Test mode** - los Price IDs de Live mode NO funcionarán con las test keys
2. **Metadata es CRÍTICO** - sin `credits: X` la Firebase Extension no sabrá cuántos créditos agregar
3. **Mínimo necesitas 2 productos** - Starter y Popular (los otros 2 son opcionales)
4. Los Price IDs de test son diferentes a los de live y empiezan con `price_`

---

**Ve a https://dashboard.stripe.com/test/products y crea los productos. Cuando termines, pégame los Price IDs.**
