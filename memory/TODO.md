# Tareas Pendientes - AI Painter

## 🔴 Prioridad Alta (Esta Semana)

- [ ] Crear Price IDs en Stripe para planes Pro y Artist
  - Pro: $29.99 → 75 créditos
  - Artist: $69.99 → 200 créditos
- [ ] Actualizar `STRIPE_PRICES` en script.js con nuevos IDs
- [ ] Actualizar `CREDITS_BY_PRICE` en functions/index.js
- [ ] Probar flujo completo de compra con planes nuevos

## 🟡 Prioridad Media (Este Mes)

- [ ] Implementar analytics básico
  - Track de conversiones
  - Track de uso de créditos
- [ ] Email notifications post-compra
- [ ] Galería de artworks generados por usuario
- [ ] Implementar más estilos artísticos
  - Impresionismo
  - Cubismo
  - Pop Art

## 🟢 Prioridad Baja (Próximos 3 Meses)

- [ ] Migrar a Stripe Production Mode
- [ ] SEO optimization
- [ ] Progressive Web App (PWA)
- [ ] A/B testing de pricing
- [ ] API pública para developers
- [ ] Sistema de referidos

## 📝 Ideas Futuras

- Modo oscuro
- Exportar a múltiples formatos (SVG, PDF)
- Batch processing (múltiples imágenes)
- Suscripción mensual ilimitada
- Marketplace de estilos custom

## 🔧 Mejoras Técnicas

- [ ] Migrar Gemini API key a environment variables
- [ ] Implementar rate limiting más robusto
- [ ] Cache de transformaciones similares
- [ ] Optimizar cold starts de Cloud Functions
- [ ] Implementar retry logic en frontend
