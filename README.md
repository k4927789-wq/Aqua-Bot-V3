# 💧 Aqua Bot V3 — Web

Chatbot estilo WhatsApp creado por **k4927789-wq**. Funciona 100% en el navegador:
cuentas y conversaciones se guardan en `localStorage` (sin servidor).

## 📁 Estructura

```
aqua-bot-v3/
├── index.html      → estructura de la página
├── css/
│   └── style.css   → todos los estilos
└── js/
    ├── config.js   → imágenes, APIs y helper de fetch
    ├── audio.js    → sonidos del chat
    └── app.js      → lógica: auth, comandos, chips, exportar...
```

## 🚀 Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube **todo el contenido de esta carpeta** (manteniendo la estructura
   `index.html`, `css/`, `js/`).
3. En el repo: **Settings → Pages → Source: Deploy from a branch → `main` / `/root` → Save**.
4. Espera 1-2 minutos: tu sitio quedará en `https://<usuario>.github.io/<repo>/`.

> `index.html` debe estar en la raíz del repo, tal como está aquí.

## ⌨️ Comandos

| Comando | Descripción |
|---|---|
| `.menu` | Menú principal con tarjetas |
| `.help` | Lista de comandos |
| `.ping` | Latencia |
| `.testapi` | Prueba todas las APIs y muestra ✅/❌ |
| `.waifu` | Imagen waifu SFW |
| `.rule34 <tags>` | 🔞 Buscar en Rule34 (requiere 18+) |
| `.tiktok <url>` | Descargar video de TikTok |
| `.tiktoksearch <texto>` | Buscar videos en TikTok |
| `.yt <texto>` | Buscar en YouTube |
| `.gpt <texto>` / `.gemini <texto>` | IA |
| `.tr <lang> <texto>` | Traductor |
| `.hentai` | 🔞 Imagen hentai (requiere 18+) |
| `.hentaivid <texto>` | 🔞 Buscar videos (requiere 18+) |
| `.sonido` | Activar/apagar sonido |
| `.salir` | Cerrar sesión |

## 🔧 Configurar APIs

Edita `js/config.js`:

- `STELLAR.base` / `STELLAR.key` — API principal (imágenes, descargas, IA).
- `STELLAR.ep` — rutas de cada endpoint. Si `.testapi` marca alguna en ❌,
  corrige la ruta ahí.
- `DELIRIUS` — API alternativa sin key.

⚠️ **Nota**: las APIs externas pueden cambiar de ruta o caerse; el bot lo
detecta y avisa sin romperse.

## ⚠️ Avisos

- Las contraseñas se guardan con un *hash* simple solo para demostración
  local (no criptografía real). No uses contraseñas reales.
- El contenido NSFW exige confirmar ser mayor de 18 años al registrarse.
