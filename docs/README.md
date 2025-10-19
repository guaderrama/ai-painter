# AI Painter - Documentación Completa del Proyecto

## 📋 Descripción General

AI Painter es una aplicación web que transforma fotografías en pinturas estilo Fauvista usando inteligencia artificial (Google Gemini 2.5 Flash). Los usuarios pueden subir fotos, obtener transformaciones artísticas instantáneas y compartir sus creaciones.

## 🌐 URLs de Producción

- **Frontend (Hosting):** https://ai-painter-app.web.app
- **API Endpoint:** https://api-255643153942.us-central1.run.app/generate
- **Firebase Console:** https://console.firebase.google.com/project/ai-painter-app
- **Repositorio GitHub:** https://github.com/guaderrama/ai-painter.git

## 🛠️ Stack Tecnológico Completo

### Frontend
- **HTML5** - Estructura de página única (SPA)
- **Vanilla JavaScript** - Lógica de aplicación (ES6+)
- **Tailwind CSS** - Framework de estilos (vía CDN)
- **Firebase SDK 9.6.1** - Autenticación, Firestore, Storage
- **Stripe.js v3** - Procesamiento de pagos

### Backend
- **Node.js 20** - Runtime de JavaScript
- **Firebase Cloud Functions** - Serverless functions
- **Express.js** - Framework HTTP para API
- **Jimp** - Procesamiento de imágenes (redimensionado)

### Servicios de IA
- **Google Gemini 2.5 Flash Image** - Generación de arte
- **Vertex AI** - Plataforma de Google Cloud para IA

### Servicios de Firebase
- **Firebase Authentication** - Google OAuth + Email/Password
- **Cloud Firestore** - Base de datos NoSQL
- **Firebase Storage** - Almacenamiento de imágenes
- **Firebase Hosting** - Hosting estático
- **Firebase Stripe Extension** - Integración de pagos

### Pagos y Monetización
- **Stripe (Test Mode)** - Procesamiento de pagos
- **Firebase Stripe Extension** - Integración automatizada

### Infraestructura
- **Región:** us-central1 (Iowa, USA)
- **Storage Bucket:** ai-painter-app-uploads-2025
- **Project ID:** ai-painter-app

## 📂 Estructura del Proyecto

```
ai-painter/
├── .clinerules/           # Reglas de Cline para IA
│   ├── 01-project-context.md
│   ├── 02-coding-standards.md
│   └── 03-tool-guidance.md
│
├── memory/                # Memoria del proyecto (estado actual)
│   ├── NOTES.md          # Estado funcional actual
│   ├── TODO.md           # Tareas pendientes
│   ├── DECISIONS.md      # Decisiones arquitectónicas
│   └── BLOCKERS.md       # Problemas conocidos
│
├── docs/                  # Documentación completa
│   ├── README.md         # Este archivo
│   ├── ARCHITECTURE.md   # Arquitectura del sistema
│   ├── API.md            # Documentación de APIs
│   ├── DEPLOYMENT.md     # Guía de deployment
│   ├── TROUBLESHOOTING.md
│   └── CONFIGURATION.md
│
├── examples/              # Ejemplos de código
│   ├── coding-patterns.md
│   └── api-requests.md
│
├── functions/             # Cloud Functions (Backend)
│   ├── index.js          # 3 funciones principales
│   ├── package.json
│   └── .eslintrc.js
│
├── rules/                 # Reglas de gestión de tareas
│   ├── create-prd.md
│   ├── gemini.md
│   ├── generate-tasks.md
│   └── process-task-list.md
│
├── tasks/                 # Tareas de desarrollo
│
├── index.html             # Frontend principal
├── script.js              # Lógica de aplicación
├── style.css              # Estilos personalizados
├── firebase.json          # Configuración Firebase
├── .firebaserc            # Proyecto Firebase
└── 404.html               # Página de error

```

## 🎯 Funcionalidades Principales

### Sistema de Autenticación
- ✅ Google OAuth (Sign in with Google)
- ✅ Email/Password (Registro y login tradicional)
- ✅ Persistencia de sesión
- ✅ Recuperación de contraseña
- ✅ Logout

### Sistema de Créditos
- ✅ 3 créditos gratis al registrarse
- ✅ 1 crédito = 1 transformación de imagen
- ✅ Validación de créditos antes de procesar
- ✅ Descuento automático al generar artwork
- ✅ Visualización en tiempo real del saldo

### Procesamiento de Imágenes
- ✅ Upload de JPG, PNG, WEBP (max 5MB)
- ✅ Validación de formato y tamaño
- ✅ Almacenamiento en Firebase Storage
- ✅ Redimensionado automático a 1024px
- ✅ Preservación de aspect ratio
- ✅ Transformación a estilo Fauvista con Gemini

### Visualización de Resultados
- ✅ Comparación Before/After con slider interactivo
- ✅ Modo fullscreen
- ✅ Download de artwork en alta calidad
- ✅ Social sharing (Instagram, WhatsApp, Facebook)
- ✅ Historial de transformaciones

### Sistema de Pagos
- ✅ Integración con Stripe
- ✅ 4 planes de créditos (2 activos, 2 pendientes)
- ✅ Checkout seguro vía Stripe
- ✅ Agregado automático de créditos
- ✅ Confirmación visual de compra

### Experiencia de Usuario
- ✅ Onboarding de 4 slides
- ✅ Diseño responsive (móvil + desktop)
- ✅ Animaciones smooth
- ✅ Loading states con animaciones
- ✅ Mensajes de error claros
- ✅ Navegación intuitiva

## 💰 Planes de Créditos

| Plan | Precio | Créditos | Price ID | Estado |
|------|--------|----------|----------|--------|
| **Gratis** | $0.00 | 3 | N/A | ✅ Activo |
| **Starter** | $4.99 | 10 | price_1SJ0UWGdnHfsTKebUDHcFzL3 | ✅ Activo |
| **Popular** | $12.99 | 30 | price_1SJ0eSGdnHfsTKeb3RErkfWa | ✅ Activo |
| **Pro** | $29.99 | 75 | TBD | ⚠️ Pendiente |
| **Artist** | $69.99 | 200 | TBD | ⚠️ Pendiente |

**Costo por transformación:**
- Starter: $0.499 por artwork
- Popular: $0.433 por artwork (mejor valor)
- Pro: $0.40 por artwork
- Artist: $0.35 por artwork

## 🔐 Seguridad

### Prácticas Implementadas
- ✅ API keys de backend NUNCA expuestas en frontend
- ✅ Validación de autenticación con Bearer tokens
- ✅ CORS configurado para dominios específicos
- ✅ Firestore rules para acceso por usuario
- ✅ Storage rules para uploads por usuario
- ✅ Rate limiting en Cloud Functions
- ✅ Validación de créditos en servidor

### Datos Sensibles
- Gemini API Key: Solo en Cloud Functions
- Stripe Secret Key: Solo en Extension (servidor)
- Firebase Admin SDK: Solo en Cloud Functions
- User data: Encriptado en Firestore

## 📊 Métricas de Rendimiento

### Cloud Functions
- **Memory:** 1GiB (api function)
- **Timeout:** 300 segundos
- **Concurrency:** 1 (evita sobrecarga)
- **Cold start:** ~2-3 segundos
- **Warm execution:** ~5-10 segundos

### Procesamiento de Imágenes
- **Tiempo promedio:** 8-12 segundos
- **Max input size:** 5MB
- **Max dimension:** 1024px (redimensionado automático)
- **Output format:** PNG base64

### Costos Estimados
- **Gemini API:** ~$0.10 por transformación
- **Cloud Functions:** ~$0.02 por ejecución
- **Storage:** ~$0.01 por GB/mes
- **Firestore:** Gratis en tier actual

## 🚀 Estado Actual del Proyecto

### Completamente Funcional ✅
- Sistema deployado en producción
- Autenticación funcionando
- Generación de artworks operativa
- Pagos con Stripe activos (2 planes)
- Créditos gratis otorgados automáticamente
- Sin bugs críticos conocidos

### En Desarrollo ⚠️
- Planes Pro y Artist (pendiente crear Price IDs)
- Analytics y métricas de uso
- Email notifications
- Galería de artworks guardados

### Roadmap 🗺️
- Más estilos artísticos (Impresionismo, Cubismo, etc.)
- Progressive Web App (PWA)
- Modo oscuro
- Exportar a múltiples formatos
- API pública para desarrolladores

## 🧪 Testing

### Cuentas de Prueba
- **Email Test:** Use cualquier email válido
- **Password Test:** Mínimo 6 caracteres

### Tarjeta de Prueba Stripe
```
Número: 4242 4242 4242 4242
Expira: 12/34 (cualquier fecha futura)
CVC: 123 (cualquier 3 dígitos)
ZIP: 12345 (cualquier ZIP)
```

### Flujo de Testing Recomendado
1. Crear cuenta nueva con email único
2. Esperar 15-20 segundos (créditos gratis)
3. Verificar: "3 credits remaining"
4. Subir imagen de prueba
5. Esperar generación (~10 seg)
6. Verificar: "2 credits remaining"
7. Agotar créditos restantes
8. Comprar plan Starter con tarjeta test
9. Verificar: "12 credits remaining" (2 + 10)

## 📞 Contacto y Soporte

- **GitHub Issues:** https://github.com/guaderrama/ai-painter/issues
- **Documentación:** Carpeta `/docs` de este repositorio
- **Firebase Console:** Logs y métricas en tiempo real

## 📝 Licencia

Proyecto privado - Todos los derechos reservados

## 🔄 Última Actualización

- **Fecha:** Octubre 2025
- **Versión:** 1.0.0 (Producción)
- **Commit Hash:** a8595d6f32b738b0ccbc281f962466600e61bab7
