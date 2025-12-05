# Proyecto: AI Painter - Interactive Art Gallery

## 🎯 Principios de Desarrollo (Context Engineering)

### Design Philosophy
- **KISS**: Keep It Simple, Stupid - Prefiere soluciones simples
- **YAGNI**: You Aren't Gonna Need It - Implementa solo lo necesario
- **DRY**: Don't Repeat Yourself - Evita duplicación de código
- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion

### Descripción del Proyecto
AI Painter es una galería de arte interactiva que permite a los usuarios transformar sus fotos en obras de arte únicas usando IA. La app incluye:
- Autenticación (Google + Email/Password)
- Sistema de créditos para transformaciones
- Procesamiento de imágenes con IA (Google Gemini)
- Comparación antes/después con slider
- Compartir en redes sociales (collages, Instagram stories)
- Pagos con Stripe para comprar créditos

## 🏗️ Tech Stack & Architecture

### Core Stack
- **Frontend**: Vanilla JavaScript (ES6 Modules)
- **Backend**: Firebase Cloud Functions
- **Base de Datos**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth
- **Payments**: Stripe
- **Styling**: Tailwind CSS (CDN)
- **AI**: Google Gemini 2.5 Flash
- **Hosting**: Firebase Hosting

### Architecture: Feature-First

**Enfoque: Arquitectura Feature-First optimizada para desarrollo asistido por IA**

Este proyecto usa una arquitectura **Feature-First** donde cada feature es independiente y contiene toda la lógica relacionada (componentes, hooks, servicios, tipos).

#### Frontend: Feature-First (Vanilla JS)
```
src/
├── main.js                   # Entry point - Inicializa todas las features
│
├── features/                 # 🎯 Organizadas por funcionalidad
│   ├── auth/                # Feature: Autenticación
│   │   └── index.js         # Login, signup, Firebase Auth
│   │
│   ├── welcome/             # Feature: Onboarding
│   │   └── index.js         # Welcome slides para nuevos usuarios
│   │
│   ├── upload/              # Feature: Procesamiento de imágenes
│   │   └── index.js         # Upload, AI processing, progress
│   │
│   ├── gallery/             # Feature: Visualización
│   │   └── index.js         # Before/after comparison, slider
│   │
│   ├── sharing/             # Feature: Compartir
│   │   └── index.js         # Social sharing, collages, stories
│   │
│   └── payments/            # Feature: Pagos
│       └── index.js         # Stripe integration
│
└── shared/                   # Código reutilizable
    ├── config/              # Configuraciones
    │   ├── firebase.js      # Firebase init y exports
    │   ├── stripe.js        # Stripe init y price IDs
    │   └── api.js           # API endpoints y constantes
    │
    ├── utils/               # Utilidades
    │   ├── toast.js         # Sistema de notificaciones
    │   └── validation.js    # Validación de formularios
    │
    └── ui/                  # Componentes UI compartidos
        ├── screens.js       # Navegación entre pantallas
        └── password-toggle.js # Toggle show/hide password
```

### Estructura de Proyecto Completa
```
ai-painter/
├── src/                     # Código fuente modular (ES6 modules)
│   ├── main.js             # Entry point
│   ├── features/           # Features por funcionalidad
│   └── shared/             # Código reutilizable
├── functions/              # Firebase Cloud Functions
│   └── index.js            # API para procesamiento de imágenes
├── index.html              # Single page app
├── style.css               # Estilos globales
├── script.js               # Legacy (backup)
├── .claude/                # Configuración Claude Code
├── docs/                   # Documentación técnica
├── firebase.json           # Configuración Firebase
└── package.json
```

> **🤖 ¿Por qué Feature-First?**
>
> Esta estructura fue diseñada específicamente para **desarrollo asistido por IA**. La organización clara por features permite que los AI assistants:
> - **Localicen rápidamente** todo el código relacionado con una feature en un mismo lugar
> - **Entiendan el contexto completo** sin navegar múltiples directorios
> - **Mantengan la separación de responsabilidades** al generar código nuevo
> - **Escalen el proyecto** añadiendo features sin afectar el código existente
> - **Generen código consistente** siguiendo patrones establecidos por feature
>
> *La IA puede trabajar de forma más efectiva cuando la información está organizada siguiendo principios claros y predecibles.*

## 🛠️ Comandos Importantes

### Development
- Abrir `index.html` en Live Server (VS Code) o servidor local
- `npx serve .` - Servidor local rápido
- `firebase serve` - Servidor con Firebase Hosting local

### Firebase
- `firebase deploy` - Deploy completo (hosting + functions)
- `firebase deploy --only hosting` - Solo deploy de hosting
- `firebase deploy --only functions` - Solo deploy de functions
- `firebase functions:log` - Ver logs de Cloud Functions

### Cloud Functions (en carpeta /functions)
- `cd functions && npm install` - Instalar dependencias
- `cd functions && npm run serve` - Emular functions localmente

### Git Workflow
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Branch naming: `feature/`, `fix/`, `hotfix/`

### Quick Reference
```bash
# Firebase
firebase login                  # Autenticarse
firebase init                   # Inicializar proyecto
firebase deploy                 # Deploy completo

# Local Development
npx serve .                     # Servidor local en puerto 3000
python -m http.server 8000      # Alternativa Python

# Debugging
# Abrir DevTools (F12) y revisar Console para errores
# Network tab para ver requests a Cloud Functions

# Functions logs
firebase functions:log --only generate
```

## 📝 Convenciones de Código

### File & Function Limits
- **Archivos**: Máximo 500 líneas
- **Funciones**: Máximo 50 líneas
- **Componentes**: Una responsabilidad clara

### Naming Conventions
- **Variables/Functions**: `camelCase`
- **Components**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case.extension`
- **Folders**: `kebab-case`

### JavaScript Guidelines
- **ES6 Modules**: Usar `import/export` para modularizar
- **JSDoc Comments**: Documentar funciones con JSDoc para autocompletado
- **Const por defecto**: Preferir `const`, usar `let` solo si es necesario
- **Arrow functions**: Para callbacks y funciones cortas
- **Async/await**: Preferir sobre `.then()` para código más legible

### Module Patterns
```javascript
// ✅ GOOD: Proper module structure
/**
 * Shows a toast notification
 * @param {string} message - Message to display
 * @param {'success'|'error'|'info'} type - Toast type
 */
export function showToast(message, type = 'success') {
    // Implementation
}

// ✅ GOOD: Feature module with clear exports
export function initFeature() {
    setupEventListeners();
    loadInitialData();
}

function setupEventListeners() {
    // Private function - not exported
}
```

## 🧪 Testing Strategy

### Test-Driven Development (TDD)
1. **Red**: Escribe el test que falla
2. **Green**: Implementa código mínimo para pasar
3. **Refactor**: Mejora el código manteniendo tests verdes

### Test Structure (AAA Pattern)
```typescript
// ✅ GOOD: Clear test structure
test('should calculate total with tax', () => {
  // Arrange
  const items = [{ price: 100 }, { price: 200 }];
  const taxRate = 0.1;
  
  // Act
  const result = calculateTotal(items, taxRate);
  
  // Assert  
  expect(result).toBe(330);
});
```

### Coverage Goals
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical paths
- **E2E Tests**: Main user journeys

## 🔒 Security Best Practices

### Input Validation
- Validate all user inputs
- Sanitize data before processing
- Use schema validation (Zod, Yup, etc.)

### Authentication & Authorization
- JWT tokens con expiración
- Role-based access control
- Secure session management

### Data Protection
- Never log sensitive data
- Encrypt data at rest
- Use HTTPS everywhere

## ⚡ Performance Guidelines

### Code Splitting
- Route-based splitting
- Component lazy loading
- Dynamic imports

### State Management
- Local state first
- Global state only when needed
- Memoization for expensive computations

### Database Optimization
- Index frequently queried columns
- Use pagination for large datasets
- Cache repeated queries

## 🔄 Git Workflow & Repository Rules

### Branch Strategy
- `main` - Production ready code
- `develop` - Integration branch
- `feature/TICKET-123-description` - Feature branches
- `hotfix/TICKET-456-description` - Hotfixes

### Commit Convention (Conventional Commits)
```
type(scope): description

feat(auth): add OAuth2 integration
fix(api): handle null user response  
docs(readme): update installation steps
```

### Pull Request Rules
- **No direct commits** a `main` o `develop`
- **Require PR review** antes de merge
- **All tests must pass** antes de merge
- **Squash and merge** para mantener historia limpia

### Flujo Operacional Git (Claude Code)

Para operaciones Git con Claude en VS Code, seguir la guía completa:
**Ver `.claude/docs/GIT_WORKFLOW.md`**

La guía incluye dos flujos:

**A) GIT_INIT** — Proyecto nuevo (primer push a GitHub)
- Inicializar repo local
- Crear .gitignore apropiado
- Crear repo en GitHub
- Push inicial

**B) GIT_UPDATE** — Cambios y mejoras en repo existente
- Preflight y sincronización
- Crear/usar rama de trabajo
- Aplicar cambios con calidad local
- Crear PR y ciclo de revisión
- Merge seguro

**Comando rápido para updates:**
```
Tarea: <...> | Rama: feature/<...> | Commit: feat(...): <...> | PR: <resumen>
```

## ❌ No Hacer (Critical)

### Code Quality
- ❌ No usar `any` en TypeScript
- ❌ No hacer commits sin tests
- ❌ No omitir manejo de errores
- ❌ No hardcodear configuraciones

### Security  
- ❌ No exponer secrets en código
- ❌ No loggear información sensible
- ❌ No saltarse validación de entrada
- ❌ No usar HTTP en producción

### Architecture
- ❌ No editar archivos en `src/legacy/`
- ❌ No crear dependencias circulares
- ❌ No mezclar concerns en un componente
- ❌ No usar global state innecesariamente

## 📚 Referencias & Context

### Project Files

#### Core Configuration
- Ver **`@README.md`** para overview detallado
- Ver **`@package.json`** para scripts disponibles
- Ver **`@.claude/INDEX.md`** para mapa completo del sistema

#### Documentation & Workflows
- Ver **`@.claude/docs/`** para workflows y guías detalladas:
  - **`WORKFLOW.md`** - Proceso PLAN → DIFFS → VERIFY
  - **`ARCHITECTURE.md`** - Arquitectura completa del proyecto
  - **`FEATURE_TEMPLATE.md`** - Template para crear features
  - **`GIT_WORKFLOW.md`** - Git branching y commits
  - **`QUICK_START.md`** - Quick reference de comandos

#### Memory & Session Management
- Ver **`@.claude/memory/`** para contexto de sesiones:
  - **`NOTES.md`** - Session tracking y progress
  - **`TODO.md`** - Task list con prioridades
  - **`DECISIONS.md`** - Decisions log
  - **`BLOCKERS.md`** - Issues tracking

#### Task Management
- Ver **`@.claude/tasks/`** para feature documentation
  - **`0001-template.md`** - Template completo para tasks

#### Quick Reference
- Ver **`@.claude/snippets/`** para comandos y configs:
  - **`commands.md`** - Development commands completos
  - **`gitignore.txt`** - Template de .gitignore

#### External Configurations
- Ver **`@.mcp.json.examples`** para MCPs disponibles

### External Dependencies
- Documentación oficial de frameworks
- Best practices guides
- Security guidelines (OWASP)

## 🤖 AI Assistant Guidelines

### Session Workflow

**At session start:**
1. **Read context**: `"Lee .claude/memory/NOTES.md"`
2. **Check priorities**: `"Revisa .claude/memory/TODO.md"`
3. **Review blockers**: `"¿Hay algo en BLOCKERS.md?"`
4. **Understand workflow**: Seguir WORKFLOW.md (PLAN → DIFFS → VERIFY)

**During development:**
1. **Plan first**: Explicar QUÉ se hará antes de implementar
2. **Show diffs**: Mostrar cambios antes de aplicar
3. **Provide verification**: Dar comandos para validar
4. **Update memory**: Actualizar TODO.md, DECISIONS.md según avance
5. **Track blockers**: Documentar problemas en BLOCKERS.md

**At session end:**
1. **Update progress**: Actualizar NOTES.md con progreso
2. **Update TODO**: Marcar completadas, agregar nuevas
3. **Document decisions**: Registrar decisiones importantes
4. **Summarize**: Dar resumen de lo completado

### When Suggesting Code
- Siempre incluir types en TypeScript
- Seguir principles de CLAUDE.md
- Implementar error handling
- Incluir tests cuando sea relevante
- **Usar workflow PLAN → DIFFS → VERIFY** para cambios significativos

### When Reviewing Code  
- Verificar adherencia a principios SOLID
- Validar security best practices
- Sugerir optimizaciones de performance
- Recomendar mejoras en testing
- **Validar contra decisiones en DECISIONS.md**

### Context Priority
1. **CLAUDE.md rules** (highest priority - este archivo)
2. **`.claude/docs/WORKFLOW.md`** - Development process
3. **`.claude/memory/`** - Session context y history
   - NOTES.md, TODO.md, DECISIONS.md, BLOCKERS.md
4. **`.claude/docs/`** - Other workflows and guides
5. **Project-specific files** (package.json, tsconfig.json, etc.)
6. **General best practices**

### Memory Management Best Practices
- ✅ **SIEMPRE leer** NOTES.md al inicio de sesión
- ✅ **MANTENER actualizado** TODO.md durante desarrollo
- ✅ **DOCUMENTAR** decisiones importantes en DECISIONS.md
- ✅ **TRACKEAR** problemas en BLOCKERS.md
- ✅ **RESUMIR** progreso en NOTES.md al final

### Workflow Best Practices
- ✅ **PLAN primero** para cambios significativos
- ✅ **MOSTRAR diffs** antes de aplicar
- ✅ **DAR comandos** de verificación
- ✅ **ESPERAR aprobación** antes de continuar
- ⚠️ **OPCIONAL** para cambios triviales

### Quick Commands Reference
```bash
# Development
npm run dev              # Auto port detection (3000-3006)
npm run build           # Production build
npm run test            # Run tests

# Database (Supabase)
npx supabase start      # Local instance
npx supabase db reset   # Reset database
npx supabase migration new [name]  # New migration

# Git
git status
git add .
git commit -m "feat: description"
git push origin main

# Debugging
lsof -i :3000           # Check port usage
kill -9 <PID>           # Kill process
```

Ver **`.claude/snippets/commands.md`** para lista completa de comandos.

## 🚀 Pre-Development Validation Protocol

### API & Dependencies Current Check
**CRÍTICO**: Siempre verificar antes de asumir
- [ ] ✅ Verificar que las versiones de APIs/modelos existen (ej: GPT-5 no existe aún)
- [ ] ✅ Confirmar que las librerías están actualizadas
- [ ] ✅ Validar endpoints externos funcionan
- [ ] ✅ Tener fallbacks para todas las dependencias externas

### Simplicity-First Development
- [ ] ✅ Crear versión simplificada primero (`simple_main.py`)
- [ ] ✅ Probar funcionalidad básica antes de agregar complejidad
- [ ] ✅ Mantener siempre una versión "modo demo" que funcione
- [ ] ✅ Implementar mock data para casos donde servicios externos fallen

### Incremental Validation Strategy
- [ ] ✅ Probar cada endpoint inmediatamente después de crearlo
- [ ] ✅ Usar TodoWrite para tracking sistemático de progreso
- [ ] ✅ Validar UI después de cada cambio importante
- [ ] ✅ Mantener logs detallados de errores para debugging

## 🔄 Error-First Development Protocol

### Manejo de Errores Predictivos
```python
# ✅ GOOD: Siempre incluir fallbacks
try:
    ai_result = await openai_call()
except Exception as e:
    print(f"AI call failed: {e}")
    ai_result = get_mock_fallback()  # Siempre tener fallback
```

### Debugging Sin Visibilidad Directa
- **Usar logs extensivos** con emojis para fácil identificación
- **Crear endpoints de testing** (`/test-connection`, `/health`)  
- **Implementar timeouts** en todas las llamadas externas
- **Hacer requests incrementales** - nunca asumir que algo complejo funcionará

## 🔌 Auto Port Detection (CRÍTICO para desarrollo)

### Problema: "EADDRINUSE - Puerto Ocupado"
**Solución implementada:** Scripts que auto-detectan puertos disponibles

### Frontend (Next.js) - Puertos 3000-3006
**Script:** `frontend/scripts/dev-server.js`

```javascript
// Auto-detecta primer puerto disponible en rango 3000-3006
// Checks both IPv4 (0.0.0.0) and IPv6 (::)
npm run dev  // Usa auto-port detection
```

**Características:**
- ✅ Chequea puertos 3000-3006 secuencialmente
- ✅ Compatible con IPv4 y IPv6 (Next.js usa `::`)
- ✅ Fallback automático si puerto ocupado
- ✅ Graceful shutdown (SIGINT/SIGTERM)

### Backend (FastAPI) - Puertos 8000-8006
**Script:** `backend/dev_server.py`

```python
# Auto-detecta primer puerto disponible en rango 8000-8006
python dev_server.py  # Usa auto-port detection
```

**Características:**
- ✅ Chequea puertos 8000-8006 secuencialmente
- ✅ Bind a `0.0.0.0` para acceso desde cualquier interface
- ✅ Fallback automático si puerto ocupado
- ✅ Keyboard interrupt handling

### CORS Backend Configuration
**Importante:** Backend CORS está configurado para soportar puertos dinámicos:

```python
# backend/main.py
ALLOWED_ORIGINS = [
    "https://tu-app.vercel.app",  # Production
    *[f"http://localhost:{port}" for port in range(3000, 3007)],
    *[f"http://127.0.0.1:{port}" for port in range(3000, 3007)],
]
```

### Best Practices
- ❌ **NO usar `uvicorn main:app` directamente** → puerto hardcodeado
- ✅ **SÍ usar `python dev_server.py`** → auto-port detection
- ❌ **NO usar `next dev` directamente** → puerto hardcodeado
- ✅ **SÍ usar `npm run dev`** → auto-port detection

### Debugging Port Issues
```bash
# Ver qué proceso está usando un puerto
lsof -i :3000
lsof -i :8000

# Matar proceso específico
kill -9 <PID>

# Matar todos los servidores de desarrollo
pkill -f "next dev"
pkill -f "uvicorn"
```

## 🎯 Advanced Real-Time Debugging (Expert Level)

### Background Log Streaming Setup
```bash
# 1. Start dev servers with log capture
npm run dev 2>&1 | tee frontend.log
uvicorn main:app --reload 2>&1 | tee backend.log

# 2. Monitor logs in real-time (Claude Code)
tail -f frontend.log | claude -p "Alert me of compilation errors"

# 3. Use Background Commands (Ctrl+B)
npm run dev  # Press Ctrl+B to run in background
# Then use BashOutput tool to monitor status
```

### Claude Code Web Interface
```bash
# Install web interface for visual log monitoring
npm install -g claude-code-web
claude-code-web --debug  # Enhanced logging mode

# Or use alternative: 
npx claude-code-web --dev  # Development mode with verbose logs
```

### Multi-Terminal Monitoring Pattern
```bash
# Terminal 1: Backend with structured logging
python -m uvicorn main:app --reload --log-level debug

# Terminal 2: Frontend with compilation monitoring
npm run dev -- --verbose

# Terminal 3: Claude Code with combined log analysis
tail -f *.log | claude -p "Debug any compilation or runtime errors immediately"
```

### Background Task Management
- **Use Ctrl+B** para run commands in background
- **BashOutput tool** para retrieving incremental output
- **Filter logs** for specific patterns (ERROR, WARN, Compil)
- **Status tracking** (running/completed/killed)

## 🎨 Bucle Agéntico con Playwright MCP

### Metodología de Desarrollo Visual
**Problema:** IA genera frontends genéricos sin poder ver el resultado  
**Solución:** Playwright MCP otorga "ojos" al AI para iteración visual

### Bucle Agéntico Frontend
```
1. Código UI → 2. Playwright Screenshot → 3. Visual Compare → 4. Iterate
```

### Playwright MCP Integration
- **browser_snapshot**: Captura estado actual de la página
- **browser_take_screenshot**: Screenshots para comparación visual
- **browser_navigate**: Navegación automática para testing
- **browser_click/type**: Interacción automatizada con UI
- **browser_resize**: Testing responsive en diferentes viewports

### Visual Development Protocol
1. **Implementar componente** siguiendo specs
2. **Capturar screenshot** con Playwright
3. **Comparar vs design requirements**
4. **Iterar automáticamente** hasta pixel-perfect
5. **Validar responsiveness** en mobile/tablet/desktop

### Integration con Design Review
- Activar review visual automático post-implementación
- Usar criterios objetivos de diseño (spacing, colors, typography)
- Generar feedback específico y accionable
- Prevenir frontends genéricos mediante validación visual

---

## 🧠 Memory Management System

### Mantener Contexto Entre Sesiones
Este proyecto usa un sistema de memoria estructurado para mantener contexto y tracking entre sesiones de desarrollo.

### Archivos de Memoria

#### `.claude/memory/NOTES.md` - Session Tracking
**Para qué:** Mantener contexto entre sesiones de trabajo

**Contenido:**
- Estado actual de la sesión
- Progreso del día
- Decisiones tomadas hoy
- Challenges encontrados
- Próximos pasos

**Cuándo actualizar:**
- Al inicio: Lee para retomar contexto
- Durante: Anota decisiones y progreso
- Al final: Resume lo completado y next steps

#### `.claude/memory/TODO.md` - Task Management
**Para qué:** Lista organizada de tareas con prioridades

**Estructura:**
- 🔥 **High Priority** (esta semana)
- 📋 **Medium Priority** (este mes)
- 💡 **Low Priority** (backlog)
- ✅ **Completed** (histórico)

**Cuándo actualizar:**
- Al completar: Marca como done
- Al planear: Agrega nuevas tasks
- Al priorizar: Mueve entre secciones

#### `.claude/memory/DECISIONS.md` - Decision Log
**Para qué:** Documentar decisiones técnicas importantes

**Incluye:**
- Contexto que llevó a la decisión
- Razón de la decisión
- Alternativas consideradas
- Trade-offs y análisis
- Fecha y responsable

**Cuándo usar:**
- Elección de tecnología
- Decisiones de arquitectura
- Cambios de approach
- Políticas de equipo

#### `.claude/memory/BLOCKERS.md` - Issue Tracking
**Para qué:** Problemas que bloquean progreso

**Tracking:**
- 🚨 Active blockers
- Soluciones intentadas
- Workarounds temporales
- ✅ Resolved blockers con solución

**Cuándo usar:**
- Bug bloqueante encontrado
- API no funciona
- Dependency issue
- Cualquier problema >30 min

### Workflow de Sesión

**Al inicio de cada sesión:**
```bash
# Dile a Claude:
"Lee .claude/memory/NOTES.md y .claude/memory/TODO.md"
```

Claude tendrá contexto completo de:
- Qué se hizo en sesiones anteriores
- Qué tareas están pendientes
- Qué decisiones se tomaron
- Qué problemas existen

**Durante desarrollo:**
```bash
# Mantener actualizado
"Actualiza TODO.md: marca [tarea X] como completada"
"Documenta en DECISIONS.md: elegimos PostgreSQL porque..."
"Agrega a BLOCKERS.md: API de Stripe no responde"
```

**Al final de sesión:**
```bash
# Actualizar progreso
"Actualiza NOTES.md con:
- Qué completamos hoy
- Decisiones tomadas
- Challenges encontrados
- Next steps para mañana"
```

### Task Documentation (Features Complejas)

Para features complejas, usa el template en `.claude/tasks/`:

**Crear nueva task:**
```bash
cp .claude/tasks/0001-template.md .claude/tasks/0002-auth-feature.md
```

**Task structure incluye:**
- Objective y success criteria
- Plan por fases con checkboxes
- Technical details (affected files, APIs, DB changes)
- Testing strategy
- Verification commands
- Documentation updates
- Notes & learnings

**Cuándo usar:**
- Features que toman >1 día
- Múltiples archivos affected
- Requiere planning detallado
- Necesitas tracking de progreso

### Quick Reference Snippets

Para comandos frecuentes, consulta `.claude/snippets/`:

**`.claude/snippets/commands.md`**
- Development commands (dev, build, test)
- Database operations (Supabase)
- Git workflows
- Debugging techniques
- Performance analysis

**`.claude/snippets/gitignore.txt`**
- Template completo de .gitignore
- Configurado para Node.js, TypeScript, Next.js
- Incluye .claude/ system

**Uso:**
```bash
"¿Cómo reseteo la base de datos? Consulta snippets/commands.md"
"Copia el .gitignore desde snippets/gitignore.txt"
```

---

## 🔄 Development Workflow: PLAN → DIFFS → VERIFY

### Proceso Estructurado
Este proyecto sigue un workflow estándar para todos los cambios significativos.
Ver **`.claude/docs/WORKFLOW.md`** para documentación completa.

### Las 3 Fases

#### 1️⃣ PLAN (Planificación)
**Qué es:** Explicar QUÉ se hará ANTES de implementar

**Incluye:**
- Descripción clara de la tarea
- Archivos que se van a modificar
- Razón de cada cambio
- Posibles impactos

**Ejemplo:**
```markdown
## PLAN
Voy a implementar autenticación básica:

1. Crear `lib/auth.ts`
   - Por qué: Centralizar lógica de auth
   - Incluye: login(), logout(), getSession()

2. Modificar `app/layout.tsx`
   - Por qué: Agregar AuthProvider
   - Cambios: Wrap children con provider

3. Crear `middleware.ts`
   - Por qué: Proteger rutas privadas
   - Redirige a /login si no autenticado

¿Procedo con estos cambios?
```

**Tu respuesta:**
- ✅ "Sí" / "Procede" / "OK" → Continúa al paso 2
- ⚠️ "Modifica X" → Claude ajusta el plan
- ❌ "No" → Claude no hace nada

---

#### 2️⃣ DIFFS (Cambios Específicos)
**Qué es:** Mostrar cambios EXACTOS antes de aplicar

**Formato diff claro:**
```diff
// lib/auth.ts (NEW FILE)
+ export async function login(email: string, password: string) {
+   const { data, error } = await supabase.auth.signInWithPassword({
+     email,
+     password
+   })
+   if (error) throw error
+   return data
+ }

// app/layout.tsx (MODIFIED)
  export default function RootLayout({ children }) {
    return (
      <html>
        <body>
+         <AuthProvider>
            {children}
+         </AuthProvider>
        </body>
      </html>
    )
  }

¿Aplicar estos cambios?
```

**Tu respuesta:**
- ✅ "Aplica" / "OK" / "Sí" → Continúa al paso 3
- ⚠️ "Cambia X" → Claude ajusta diffs
- ❌ "No apliques" → Claude no hace nada

---

#### 3️⃣ VERIFY (Verificación)
**Qué es:** Comandos ESPECÍFICOS para validar que todo funciona

**Ejemplo:**
```bash
# 1. Verificar build
npm run build
# Debe completar sin errores

# 2. Verificar types
npm run typecheck
# 0 errores

# 3. Verificar tests
npm run test
# Todos los tests pasan

# 4. Probar manualmente
npm run dev
# 1. Ir a /login
# 2. Ingresar credenciales
# 3. Debe redirigir a /dashboard
# 4. Logout debe funcionar
```

**Tu responsabilidad:**
- ✅ Ejecutar los comandos
- ✅ Reportar resultados
- ✅ Indicar si algo falló

---

### Cuándo Usar Este Workflow

**✅ SÍ usar para:**
- Features nuevas
- Cambios en múltiples archivos
- Refactoring importante
- Cambios de arquitectura
- Integraciones con APIs

**⚠️ OPCIONAL para:**
- Cambios triviales (fix typo)
- Updates de documentación
- Ajustes de styling menores

**❌ NO necesario para:**
- Leer archivos
- Explorar código
- Responder preguntas

---

### Comandos Útiles

```bash
# Iniciar con workflow
"Usa el workflow de WORKFLOW.md para implementar [feature]"

# Durante desarrollo
"Muéstrame el PLAN antes de implementar"
"Espera mi aprobación antes de aplicar DIFFS"
"Dame comandos de VERIFY después de aplicar"

# Para features complejas
"Usa bucle-agentico y sigue el workflow PLAN → DIFFS → VERIFY"
```

---

### Beneficios del Workflow

1. ✅ **Control total** - Nada se aplica sin tu aprobación
2. ✅ **Transparencia** - Ves exactamente qué cambia
3. ✅ **Aprendizaje** - Entiendes cada cambio
4. ✅ **Seguridad** - Reduces riesgo de bugs
5. ✅ **Documentación** - Queda registro del razonamiento
6. ✅ **Reversibilidad** - Fácil de revertir si algo falla

---

*Este archivo es la fuente de verdad para desarrollo en este proyecto. Todas las decisiones de código deben alinearse con estos principios.*
