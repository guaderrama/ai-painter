# Guía de Uso de Herramientas - AI Painter

## Exploración de Archivos (JIT - Just In Time)

- **SIEMPRE usa:** `list_files` primero para navegar
- **Para buscar código:** `search_files` con regex
- **Para leer:** `read_file` solo lo necesario
- **EVITA:** Cargar archivos completos innecesariamente

## Workflow Recomendado

1. **Planear:** Crear checklist antes de empezar
2. **Explorar:** Usar list_files/search_files para localizar
3. **Leer:** Solo secciones relevantes
4. **Implementar:** Cambios incrementales con replace_in_file o write_to_file
5. **Verificar:** Tests cuando sea necesario
6. **Documentar:** Actualizar memory/NOTES.md

## Archivos Clave del Proyecto

- `index.html` - Frontend completo (SPA)
- `script.js` - Lógica de aplicación
- `functions/index.js` - Cloud Functions (3 funciones)
- `memory/NOTES.md` - Estado actual del proyecto
- `docs/` - Documentación completa

## Al Empezar Nueva Sesión

1. Leer `memory/NOTES.md` - Estado actual
2. Leer `memory/TODO.md` - Tareas pendientes
3. Leer `memory/BLOCKERS.md` - Problemas conocidos
4. Revisar `.clinerules/` - Contexto del proyecto

## Al Terminar Sesión

1. Actualizar `memory/NOTES.md` con cambios
2. Actualizar `memory/TODO.md` si aplica
3. Documentar decisiones en `memory/DECISIONS.md` si aplica
4. Hacer commit con mensaje descriptivo

## Compaction (Cada 15-20 Turnos)

1. Resumir decisiones en memory/DECISIONS.md
2. Actualizar TODO.md con pendientes
3. Limpiar outputs de herramientas antiguas (mental)
4. Continuar con contexto reducido
