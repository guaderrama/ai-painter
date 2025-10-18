# 🔄 INSTRUCCIONES DE BACKUP Y RESTAURACIÓN

## ✅ BACKUPS DISPONIBLES

### **ÚLTIMO BACKUP: v1.1-stable** ⭐
**Fecha:** 16 de Octubre, 2025  
**Commit:** 0dbb3e7  
**Estado:** App completa con 6 mejoras principales implementadas

**Funcionalidades:**
- ✅ Welcome/Onboarding Screen (4 slides)
- ✅ App 100% en inglés
- ✅ Enhanced Processing Screen (progress bar + mensajes inspiradores)
- ✅ Before/After Slider (3 modos de comparación)
- ✅ Fullscreen mode
- ✅ Social Sharing (Instagram, WhatsApp, Facebook, Copy Link)
- ✅ CORS, Auth, Créditos, Gemini 2.5 Flash

### **BACKUP ANTERIOR: v1.0-stable**
**Fecha:** 15 de Octubre, 2025  
**Commit:** 1f197d1  
**Estado:** App base funcional con Gemini 2.5 Flash Image

---

## 📦 QUÉ SE RESPALDÓ

### **Archivos Principales:**
- ✅ `index.html` - Frontend completo
- ✅ `script.js` - Lógica de la aplicación
- ✅ `style.css` - Estilos
- ✅ `functions/index.js` - Backend con Gemini 2.5 Flash Image
- ✅ `functions/package.json` - Dependencias
- ✅ `firebase.json` - Configuración Firebase
- ✅ `ANALISIS_Y_PLAN_DE_MEJORAS.md` - Plan completo de mejoras

### **Características Respaldadas:**
- ✅ CORS completamente funcional
- ✅ Autenticación Firebase (Google + Email/Password)
- ✅ Sistema de créditos
- ✅ Gemini 2.5 Flash Image integrado
- ✅ Aspect ratio preservado (max 1024px)
- ✅ Frontend adaptativo (bg-contain, altura flexible)
- ✅ Download de artworks
- ✅ Processing screen funcional

---

## 🔙 CÓMO RESTAURAR ESTE BACKUP

### **Opción 1: Restaurar usando el Tag (RECOMENDADO)**

Si quieres volver exactamente a este punto estable:

```bash
# 1. Ver todos los tags disponibles
git tag -l

# 2. Restaurar al tag v1.0-stable
git checkout v1.0-stable

# 3. Crear una nueva rama desde este punto (opcional)
git checkout -b restauracion-v1.0

# 4. O volver directamente a main y resetear
git checkout main
git reset --hard v1.0-stable

# 5. Forzar push si es necesario (CUIDADO: borra cambios posteriores)
git push origin main --force
```

### **Opción 2: Restaurar Archivos Específicos**

Si solo quieres restaurar ciertos archivos:

```bash
# Restaurar un archivo específico del tag
git checkout v1.0-stable -- functions/index.js
git checkout v1.0-stable -- index.html
git checkout v1.0-stable -- script.js

# Commit los cambios
git commit -m "Restaurado desde v1.0-stable"
```

### **Opción 3: Ver Diferencias**

Para comparar versión actual con el backup:

```bash
# Ver qué cambió desde el backup
git diff v1.0-stable

# Ver cambios en archivo específico
git diff v1.0-stable -- functions/index.js
```

---

## 📍 INFORMACIÓN DEL BACKUP

### **Commit Hash:**
```
1f197d1
```

### **Tag Creado:**
```
v1.0-stable
```

### **Branch:**
```
main
```

### **Repositorio Remoto:**
```
https://github.com/guaderrama/ai-painter.git
```

---

## 🚨 IMPORTANTE: ANTES DE RESTAURAR

### **1. Guardar Cambios Actuales (si los hay):**
```bash
# Crear un backup temporal de cambios actuales
git stash save "Backup temporal antes de restaurar"

# O crear una rama con los cambios actuales
git checkout -b backup-cambios-actuales
git add .
git commit -m "Backup de cambios antes de restaurar"
git checkout main
```

### **2. Verificar Estado Actual:**
```bash
# Ver en qué commit estás
git log --oneline -5

# Ver qué archivos han cambiado
git status
```

### **3. Hacer Backup de Firebase:**
Si has hecho cambios en Firebase (Firestore, Storage, etc.), descarga los datos primero:
```bash
# Exportar configuración Firebase
firebase projects:list
firebase functions:config:get > firebase-config-backup.json
```

---

## 📋 CHECKLIST DE RESTAURACIÓN

Antes de restaurar, verifica:

- [ ] He guardado los cambios actuales que quiero conservar
- [ ] He documentado qué ha cambiado desde el backup
- [ ] He descargado datos importantes de Firebase (si aplica)
- [ ] Estoy seguro de que quiero volver a este punto
- [ ] Tengo acceso al repositorio remoto
- [ ] He notificado al equipo (si aplica)

---

## 🔄 DESPUÉS DE RESTAURAR

### **1. Reinstalar Dependencias:**
```bash
cd functions
npm install
cd ..
```

### **2. Redesplegar si es Necesario:**
```bash
# Redesplegar functions
firebase deploy --only functions

# Redesplegar hosting
firebase deploy --only hosting

# O todo junto
firebase deploy
```

### **3. Verificar que Todo Funciona:**
- [ ] Abrir https://ai-painter-app.web.app
- [ ] Probar login
- [ ] Probar upload de imagen
- [ ] Verificar transformación con Gemini
- [ ] Verificar download

---

## 💡 TIPS ÚTILES

### **Ver Historial de Commits:**
```bash
# Ver últimos 10 commits
git log --oneline -10

# Ver commits con detalles
git log --graph --decorate --oneline
```

### **Comparar con Backup:**
```bash
# Ver qué archivos cambiaron
git diff --name-only v1.0-stable

# Ver cambios en detalle
git diff v1.0-stable
```

### **Listar Todos los Tags:**
```bash
git tag -l
```

### **Ver Info del Tag:**
```bash
git show v1.0-stable
```

---

## 🆘 EN CASO DE PROBLEMAS

### **Si algo sale mal durante la restauración:**

```bash
# 1. Abortar cambios y volver al estado anterior
git reset --hard HEAD

# 2. Recuperar cambios guardados en stash
git stash list
git stash pop

# 3. Volver a la rama anterior
git reflog
git checkout <commit-hash-anterior>
```

### **Contacto de Soporte:**
- GitHub Issues: https://github.com/guaderrama/ai-painter/issues
- Email: (agregar email de soporte)

---

## 📊 ESTADO ACTUAL vs BACKUP

| Característica | v1.0-stable | Estado Actual |
|----------------|-------------|---------------|
| CORS | ✅ | ? |
| Auth Firebase | ✅ | ? |
| Gemini 2.5 Flash | ✅ | ? |
| Aspect Ratio | ✅ | ? |
| Créditos | ✅ | ? |

**Actualiza esta tabla según avances con mejoras**

---

## 🎯 PRÓXIMAS MEJORAS PLANEADAS

Ver documento completo en: `ANALISIS_Y_PLAN_DE_MEJORAS.md`

**Prioridades Mes 1:**
1. Welcome onboarding (3 slides)
2. Before/After slider
3. Enhanced processing screen
4. 2-3 nuevos estilos artísticos
5. Personal gallery básica

---

**Última actualización:** 15 de Octubre, 2025  
**Versión del documento:** 1.0
