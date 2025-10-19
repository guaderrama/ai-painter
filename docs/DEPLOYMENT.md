# Guía de Deployment - AI Painter

## 🚀 Deploy Completo

### Prerequisitos

```bash
# Node.js 20+
node --version

# Firebase CLI
npm install -g firebase-tools

# Login a Firebase
firebase login
```

### Deploy Todo el Proyecto

```bash
# Desde la raíz del proyecto
npx firebase-tools deploy
```

Esto despliega:
- ✅ Cloud Functions (3 funciones)
- ✅ Firebase Hosting (frontend)
- ✅ Firestore Rules
- ✅ Storage Rules

**Tiempo estimado:** 2-4 minutos

---

## 📦 Deploy Parcial

### Solo Cloud Functions

```bash
npx firebase-tools deploy --only functions
```

**Cuándo usar:**
- Cambios en `functions/index.js`
- Actualizar lógica de backend
- Cambiar configuraciones de functions

**Tiempo:** 1-2 minutos

### Solo Hosting (Frontend)

```bash
npx firebase-tools deploy --only hosting
```

**Cuándo usar:**
- Cambios en `index.html`, `script.js`, `style.css`
- Updates de UI
- Cambios de texto/contenido

**Tiempo:** 30-60 segundos

### Solo Firestore Rules

```bash
npx firebase-tools deploy --only firestore:rules
```

### Solo Storage Rules

```bash
npx firebase-tools deploy --only storage
```

---

## 🔍 Verificación Post-Deploy

### 1. Verificar Hosting

```bash
# Abrir en navegador
start https://ai-painter-app.web.app
```

Checklist:
- [ ] Página carga correctamente
- [ ] No hay errores en consola
- [ ] Login funciona
- [ ] UI se ve correcta

### 2. Verificar Functions

```bash
# Ver logs en tiempo real
npx firebase-tools functions:log
```

Probar endpoints:
```bash
# Debe retornar 401 (correcto, necesita auth)
curl https://api-255643153942.us-central1.run.app/generate
```

### 3. Verificar Stripe Integration

1. Crear cuenta test
2. Esperar 15 segundos
3. Verificar 3 créditos gratis
4. Comprar plan Starter (tarjeta 4242...)
5. Verificar 10 créditos agregados

---

## 📊 Monitoreo

### Ver Logs

```bash
# Todos los logs
firebase functions:log

# Solo función específica
firebase functions:log --only api

# Últimas 50 líneas
firebase functions:log --limit 50
```

### Firebase Console

URL: https://console.firebase.google.com/project/ai-painter-app

**Secciones importantes:**
- Functions → Ver ejecuciones y errores
- Hosting → Tráfico y bandwidth
- Authentication → Usuarios registrados
- Firestore → Datos y queries
- Storage → Archivos subidos

---

## 🔄 Rollback

### Hosting Rollback

```bash
# Ver versiones anteriores
firebase hosting:releases:list

# Rollback a versión anterior
firebase hosting:rollback
```

### Functions Rollback

No hay rollback directo. Debes:
1. Revertir cambios en código
2. Deploy nuevamente

```bash
git revert HEAD
firebase deploy --only functions
```

---

## 🔐 Configuración de Secrets

### API Keys en Cloud Functions

**NO incluir en código**, usar Firebase Config:

```bash
# Set Gemini API key
firebase functions:config:set gemini.api_key="AIzaSyDdc-34P2AQWnMx1p3iW0mUqShqyfLZ17k"

# Ver configuración actual
firebase functions:config:get

# Usar en código
const apiKey = functions.config().gemini.api_key;
```

**Importante:** Después de cambiar config, re-deploy functions.

---

## 🧪 Deploy a Staging

Para probar cambios antes de producción:

```bash
# Crear proyecto staging en Firebase Console
# Cambiar proyecto temporalmente
firebase use staging-project-id

# Deploy
firebase deploy

# Volver a producción
firebase use ai-painter-app
```

---

## ⚡ Optimizaciones de Deploy

### Pre-Deploy Checks

```bash
# Lint functions
cd functions
npm run lint

# Build frontend (si aplica)
# (Actualmente no hay build step)
```

### Deploy Rápido (Solo Cambios)

```bash
# Si solo cambiaste 1 función
firebase deploy --only functions:api

# Si solo cambiaste index.html
firebase deploy --only hosting
```

---

## 🛠️ Troubleshooting Deploy

### Error: "Permission Denied"

```bash
firebase login --reauth
```

### Error: "Function deployment failed"

1. Verificar `functions/package.json`
2. Verificar sintaxis en `functions/index.js`
3. Ver logs: `firebase functions:log`

### Error: "Hosting deployment failed"

1. Verificar `firebase.json`
2. Verificar que `index.html` existe
3. Revisar `.firebaserc`

---

## 📋 Checklist Pre-Producción

Antes de mover a producción (Stripe Production Mode):

- [ ] Todas las features testeadas
- [ ] No hay console.logs sensibles
- [ ] API keys en environment variables
- [ ] Error handling completo
- [ ] Rate limiting implementado
- [ ] Monitoreo configurado
- [ ] Backup plan definido
- [ ] Crear Price IDs en Stripe Production
- [ ] Actualizar Price IDs en script.js
- [ ] Probar flujo completo con tarjeta real

---

## 🔄 Última Actualización

**Fecha:** Octubre 2025  
**Versión:** 1.0.0
