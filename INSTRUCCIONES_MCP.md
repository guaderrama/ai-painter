# Instrucciones para Activar Servidores MCP

## ✅ Servidores Configurados

Los siguientes servidores MCP han sido instalados y configurados correctamente:

1. **Playwright MCP** - Automatización de navegador
2. **GitHub MCP** - Gestión de repositorios GitHub
3. **Context7 MCP** - Memoria a largo plazo con Redis
4. **Chrome DevTools MCP** - Control de Chrome DevTools Protocol
5. **Perplexity MCP** - Búsqueda y research con IA

## 🔄 Pasos para Activar los Servidores

### 1. Reiniciar Cline
1. Cierra completamente la ventana de chat de Cline
2. Vuelve a abrir Cline desde la barra lateral de VSCode
3. Espera unos segundos mientras los servidores se conectan

### 2. Verificar Conexión
Después de reiniciar, en la nueva conversación con Cline:
- Los servidores conectados aparecerán en el prompt del sistema
- Deberías ver las herramientas disponibles de cada servidor

### 3. Probar los Servidores

#### Playwright MCP:
Prueba con: "Navega a https://www.google.com y toma una captura de pantalla"

#### GitHub MCP:
Prueba con: "Muestra mis repositorios en GitHub" o "Busca repositorios sobre React"

#### Context7 MCP:
Prueba con: "Recuerda que mi lenguaje preferido es TypeScript"

#### Chrome DevTools MCP:
Prueba con: "Usa Chrome DevTools para inspeccionar esta página"

#### Perplexity MCP:
Prueba con: "Busca información actualizada sobre inteligencia artificial"

## 🔧 Solución de Problemas

### Si hay errores de conexión:
- Verifica tu conexión a internet
- Asegúrate de que Node.js y npm estén actualizados
- Los servidores se descargan automáticamente con `npx` la primera vez

## 📝 Configuración Actual

```json
{
  "mcpServers": {
    "github.com/executeautomation/mcp-playwright": {
      "disabled": false
    },
    "github.com/modelcontextprotocol/servers/tree/main/src/github": {
      "disabled": false,
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "configurado ✓"
      }
    },
    "context7": {
      "disabled": false,
      "env": {
        "UPSTASH_REDIS_REST_URL": "configurado ✓",
        "UPSTASH_REDIS_REST_TOKEN": "configurado ✓"
      }
    },
    "chrome-devtools": {
      "disabled": false
    },
    "perplexity": {
      "disabled": false,
      "env": {
        "PERPLEXITY_API_KEY": "configurado ✓"
      }
    }
  }
}
```

**5 servidores MCP activos y listos para usar.**

## 📌 Archivo de Configuración

Ubicación: `C:\Users\admin\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

Para editar manualmente, abre este archivo en VSCode y realiza los cambios necesarios.
