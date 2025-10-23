# 🔄 Workflow de Ramas - AI Painter

**Versión:** 1.0  
**Fecha:** 23 de Octubre, 2025  
**Estado:** ✅ Implementado con SonarCloud & CodeRabbit

---

## 📋 Resumen del Proceso

Este es el flujo de trabajo profesional para desarrollar nuevas features usando ramas Git, con integración automática de análisis de código.

**Herramientas Integradas:**
- ✅ **SonarCloud** - Análisis de calidad de código
- ✅ **CodeRabbit** - Revisión automática de código con IA
- ✅ **GitHub** - Control de versiones y Pull Requests

---

## 🚀 Fase 1: Inicio de Tarea

### Instrucción para Cline:

```
Cline, vamos a empezar una nueva tarea. Por favor, prepárame el espacio de trabajo:

1. Ve a la rama principal (main)
2. Sincroniza con GitHub para descargar la última versión (git pull origin main)
3. Crea una nueva rama para mí. Quiero que se llame: [NOMBRE-DE-LA-RAMA]
```

### Ejemplos de Nombres de Rama:

**Features (nuevas funcionalidades):**
- `feature/artwork-info-card`
- `feature/personal-gallery`
- `feature/multiple-art-styles`
- `feature/quick-actions-panel`

**Fixes (arreglos de bugs):**
- `fix/upload-button-error`
- `fix/payment-not-processing`
- `fix/image-display-bug`

**Refactors (mejoras de código):**
- `refactor/cleanup-auth-logic`
- `refactor/optimize-image-processing`

**Docs (documentación):**
- `docs/update-readme`
- `docs/add-api-documentation`

---

## 💻 Fase 2: Programación

### Instrucción para Cline:

```
Gracias. Ahora, en esta rama [nombre-de-la-rama], necesito que hagas lo siguiente:

[AQUÍ VA TU PETICIÓN ESPECÍFICA]

Ejemplos:
- "Crea un componente de Artwork Info Card que muestre metadata"
- "Implementa la lógica de Personal Gallery con Firestore"
- "Arregla el bug donde el botón de download no funciona en móvil"
```

**Puedes tener múltiples interacciones aquí hasta que la tarea esté terminada.**

---

## ✅ Fase 3: Cierre y Subida

### Instrucción para Cline:

```
Cline, el trabajo en esta rama [nombre-de-la-rama] está terminado. Por favor:

1. Guarda todos los cambios (haz commit)
2. Usa este mensaje para el commit: "[MENSAJE DESCRIPTIVO]"
3. Sube esta rama [nombre-de-la-rama] a GitHub
4. Avísame en cuanto esté arriba
```

### Ejemplos de Mensajes de Commit:

**Features:**
- `feat: implementa Artwork Info Card con metadata`
- `feat: agrega Personal Gallery con filtros`
- `feat: añade múltiples estilos artísticos (Impressionism, Sacred Art)`

**Fixes:**
- `fix: corrige error de upload en Safari`
- `fix: resuelve problema de pago en Stripe`
- `fix: arregla responsive en móvil`

**Refactors:**
- `refactor: limpia lógica de autenticación`
- `refactor: optimiza procesamiento de imágenes`

**Docs:**
- `docs: actualiza README con nuevas features`
- `docs: agrega documentación de API`

---

## 🔍 Fase 4: Pull Request en GitHub

### Tu Tarea Manual:

1. **Abre GitHub.com** y ve a tu repositorio
2. **Verás un aviso amarillo** en la parte superior con tu rama
3. **Click en "Compare & Pull Request"** (botón verde)
4. **Escribe:**
   - **Título:** Descripción corta de la feature
   - **Descripción:** Qué hace, por qué, cómo testearlo
5. **Click en "Create Pull Request"**

### 🤖 Análisis Automático

**En ese momento, se activan automáticamente:**

✅ **SonarCloud** - Analiza:
- Calidad del código
- Bugs potenciales
- Vulnerabilidades de seguridad
- Code smells
- Cobertura de tests
- Duplicación de código

✅ **CodeRabbit** - Revisa:
- Best practices
- Patrones de diseño
- Sugerencias de mejora
- Optimizaciones
- Posibles bugs

**Ambos dejarán comentarios en el Pull Request.**

---

## 📊 Fase 5: Revisión y Merge

### Checklist Antes de Merge:

- [ ] ✅ SonarCloud: Sin issues críticos
- [ ] ✅ CodeRabbit: Revisión completada
- [ ] 🧪 Tests: Funcionan correctamente
- [ ] 📱 Mobile: Testeado en móvil
- [ ] 🌐 Desktop: Testeado en desktop
- [ ] 🔐 Security: Sin vulnerabilidades
- [ ] 📖 Docs: Actualizadas si es necesario

### Hacer Merge:

1. **Revisa comentarios** de SonarCloud y CodeRabbit
2. **Haz cambios** si es necesario
3. **Click en "Merge Pull Request"**
4. **Delete branch** después del merge (GitHub lo sugiere)

---

## 🏷️ Tags de Versión

### Crear Tags de Respaldo:

Después de features importantes, crea tags para marcar versiones estables:

```bash
git tag v1.x-nombre-descriptivo
git push origin v1.x-nombre-descriptivo
```

### Convención de Tags:

- `v1.0-initial-release` - Lanzamiento inicial
- `v1.1-brushstroke-loading` - Primera mejora
- `v1.2-enhanced-sharing` - Sharing mejorado ✅ (actual)
- `v1.3-artwork-info-card` - Próximo
- `v1.4-personal-gallery` - Futuro
- `v2.0-major-update` - Updates mayores

---

## 🎯 Ejemplo Completo

### Caso: Implementar Artwork Info Card

**Inicio:**
```
Cline, vamos a empezar una nueva tarea:
1. Ve a main
2. Pull latest
3. Crea rama: feature/artwork-info-card
```

**Desarrollo:**
```
En feature/artwork-info-card, implementa:
1. Componente expandible debajo de la imagen
2. Muestra: título, artista, técnica, fecha
3. Descripción del estilo
4. Botón "Learn More"
```

**Cierre:**
```
Trabajo terminado en feature/artwork-info-card:
1. Commit con: "feat: implementa Artwork Info Card con metadata"
2. Push a GitHub
3. Avísame
```

**Pull Request:**
- Título: "feat: Artwork Info Card"
- Descripción:
  ```
  ## Qué hace
  Agrega info card expandible con metadata del artwork
  
  ## Features
  - Muestra artista (Iván Guaderrama)
  - Técnica utilizada (Fauvism)
  - Fecha de creación
  - Descripción del estilo
  - Link "Learn More"
  
  ## Testing
  1. Genera un artwork
  2. Ve la info card debajo
  3. Click para expandir/colapsar
  4. Verifica datos correctos
  
  ## Screenshots
  [Aquí irían screenshots]
  ```

**Merge:**
- Revisar comentarios SonarCloud
- Revisar sugerencias CodeRabbit
- Merge a main
- Delete branch feature/artwork-info-card

**Tag:**
```bash
git checkout main
git pull origin main
git tag v1.3-artwork-info-card
git push origin v1.3-artwork-info-card
```

---

## 🔒 Protecciones de Rama Main

### Reglas Configuradas:

- ✅ Require Pull Request antes de merge
- ✅ Require status checks to pass (SonarCloud, CodeRabbit)
- ✅ Require branches to be up to date
- ❌ No direct push to main (protegida)

### Esto Significa:

- NO puedes hacer push directo a main
- DEBES crear rama para cada feature
- DEBES crear Pull Request
- DEBES pasar análisis de SonarCloud
- DEBES revisar comentarios de CodeRabbit

---

## 📈 Beneficios de Este Workflow

### 1. Código de Calidad
- ✅ SonarCloud detecta bugs antes de producción
- ✅ CodeRabbit sugiere mejores prácticas
- ✅ Revisión automática 24/7

### 2. Historial Limpio
- ✅ Commits organizados por feature
- ✅ Easy rollback si algo falla
- ✅ Tags marcan versiones estables

### 3. Colaboración
- ✅ Pull Requests documentan cambios
- ✅ Comentarios centralizados
- ✅ Fácil code review

### 4. Seguridad
- ✅ Main siempre estable
- ✅ Features aisladas en ramas
- ✅ Testing antes de merge

---

## 🚨 Troubleshooting

### Problema: Merge Conflict

**Solución:**
```bash
git checkout main
git pull origin main
git checkout tu-rama
git merge main
# Resolver conflictos en VS Code
git add .
git commit -m "fix: resolve merge conflicts"
git push origin tu-rama
```

### Problema: SonarCloud falla

**Solución:**
1. Lee los comentarios de SonarCloud
2. Arregla los issues
3. Push nuevos cambios
4. SonarCloud re-analiza automáticamente

### Problema: Olvidé crear rama

**Solución:**
```bash
# Si ya hiciste cambios en main
git checkout -b feature/nombre-correcto
git push origin feature/nombre-correcto
# Ahora crea el Pull Request
```

### Problema: Quiero cancelar cambios

**Solución:**
```bash
# Si no has hecho push
git checkout main
git branch -D rama-a-borrar

# Si ya hiciste push
# Borrar en GitHub desde la UI
# Settings → Branches → Delete branch
```

---

## ✅ Checklist Rápida

### Antes de Empezar:
- [ ] Estoy en rama main
- [ ] He hecho pull latest
- [ ] Tengo clara la tarea

### Durante Desarrollo:
- [ ] Estoy en mi rama feature
- [ ] Commits frecuentes y claros
- [ ] Testing local funcionando

### Antes de PR:
- [ ] Código funciona
- [ ] Sin errores de consola
- [ ] Mobile responsive
- [ ] Commit messages descriptivos

### En Pull Request:
- [ ] Título claro
- [ ] Descripción completa
- [ ] Screenshots si aplica
- [ ] SonarCloud passed
- [ ] CodeRabbit reviewed

### Después de Merge:
- [ ] Delete branch
- [ ] Pull main actualizado
- [ ] Crear tag si es milestone
- [ ] Actualizar NOTES.md

---

## 📚 Recursos

- **Git Branching:** https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging
- **SonarCloud:** https://sonarcloud.io
- **CodeRabbit:** https://coderabbit.ai
- **Conventional Commits:** https://www.conventionalcommits.org

---

## 🎓 Best Practices

1. **Una rama = Una feature/fix**
2. **Nombres descriptivos de ramas**
3. **Commits pequeños y frecuentes**
4. **Pull Requests con contexto**
5. **Merge solo cuando pase análisis**
6. **Delete ramas después de merge**
7. **Tags para versiones importantes**
8. **NOTES.md siempre actualizado**

---

**¿Listo para tu próxima feature?** 🚀

Usa este documento como guía cada vez que vayas a desarrollar algo nuevo.
