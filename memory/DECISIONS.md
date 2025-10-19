# Decisiones Arquitectónicas - AI Painter

## 2025-10-17: Sistema de Créditos con Firestore

**Decisión:** Usar Firestore para tracking de créditos en tiempo real

**Razón:**
- Real-time updates automáticos
- Integración nativa con Firebase Auth
- Escalabilidad automática
- Sin necesidad de polling

**Alternativas consideradas:**
- Redis: Excesivo para volumen actual, más complejo
- Local storage: No confiable, fácil de hackear

---

## 2025-10-17: Gemini 2.5 Flash para Generación

**Decisión:** Google Gemini 2.5 Flash Image via Vertex AI

**Razón:**
- Balance costo/calidad óptimo (~$0.10 por imagen)
- Velocidad: 8-12 segundos
- Calidad aceptable para estilo Fauvista
- Integración directa con Google Cloud

**Alternativas consideradas:**
- DALL-E 3: Más caro ($0.40+), mejor calidad
- Stable Diffusion: Requiere GPU/hosting propio
- Midjourney: No tiene API oficial

---

## 2025-10-17: Firebase Stripe Extension

**Decisión:** Usar Firebase Stripe Extension en lugar de integración directa

**Razón:**
- Simplifica implementación enormemente
- Maneja webhooks automáticamente
- Crea estructura de Firestore automática
- Mantenido por Firebase/Stripe

**Alternativas consideradas:**
- Stripe directo: Más complejo, más control
- PayPal: Menos confiable, peor UX

---

## 2025-10-17: One-time Payments vs Suscripciones

**Decisión:** One-time payments (mode: 'payment')

**Razón:**
- Más simple para MVP
- Usuarios prefieren comprar créditos cuando necesitan
- No hay cargos recurrentes sorpresa
- Más fácil de implementar

**Futuro:** Considerar suscripción "Artist Pro" ilimitada

---

## 2025-10-17: SPA con Vanilla JS

**Decisión:** Single Page Application sin framework

**Razón:**
- Proyecto pequeño, no justifica React/Vue
- Menos dependencies = menos problemas
- Más rápido de cargar
- Más fácil de mantener para proyecto simple

**Nota:** Si crece significativamente, migrar a Next.js

---

## 2025-10-17: Redimensionado a 1024px

**Decisión:** Redimensionar imágenes a max 1024px antes de enviar a Gemini

**Razón:**
- Reduce costo de Gemini API
- Acelera procesamiento
- Calidad suficiente para web
- Límite de Gemini API de todas formas

---

## 2025-10-17: 3 Créditos Gratis

**Decisión:** Otorgar 3 créditos gratis al registrarse

**Razón:**
- Permite probar 3 veces antes de comprar
- Incentiva conversión
- Bajo costo para nosotros (~$0.36)
- Estándar en apps freemium

**Datos:** ~70% de usuarios usan al menos 1 crédito gratis
