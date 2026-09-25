/* =========================================================
   💧 AQUA BOT V3 — Configuración central
   Creado por k4927789-wq
   ========================================================= */

/* -------------------- IMÁGENES -------------------- */
const IMG = {
  avatar: 'https://inmiku.infinityfreeapp.com/u/ImMiku_4b628e69.jpg',
  banner: 'https://inmiku.infinityfreeapp.com/u/ImMiku_8ab5d540.jpg',
  fondo:  'https://inmiku.infinityfreeapp.com/u/ImMiku_b9aa13a2.jpg',
  cover:  'https://inmiku.infinityfreeapp.com/u/ImMiku_75e81a39.jpg',
  icon:   'https://inmiku.infinityfreeapp.com/u/ImMiku_562907dc.jpg'
};

/* -------------------- PLACEHOLDERS (fallback local) -------------------- */
const PH = {
  avatar: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b72ff"/><stop offset="1" stop-color="#2fbf9a"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/><text x="100" y="120" font-size="72" text-anchor="middle" fill="#fff" font-family="Arial">💧</text><text x="100" y="158" font-size="22" text-anchor="middle" fill="#eafffb" font-family="Arial" font-weight="bold">AQUA</text></svg>'),
  banner: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="340"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#075e54"/><stop offset=".5" stop-color="#0b8f6b"/><stop offset="1" stop-color="#0b72ff"/></linearGradient></defs><rect width="800" height="340" fill="url(#g)"/><text x="400" y="150" font-size="58" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="bold">💧 AQUA BOT V3 💧</text><text x="400" y="200" font-size="24" text-anchor="middle" fill="#d8fff4" font-family="Arial">La diosa del agua te bendice con comandos mágicos</text><text x="400" y="240" font-size="17" text-anchor="middle" fill="#bfe9ff" font-family="Arial">Creado por k4927789-wq</text></svg>'),
  fondo:  'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#e9f6f3"/><circle cx="60" cy="80" r="40" fill="rgba(11,114,255,.05)"/><circle cx="330" cy="300" r="60" fill="rgba(47,191,154,.06)"/></svg>')
};

/* Carga una imagen con fallback automático al placeholder */
function setImg(el, url, ph){
  el.onerror = () => { el.onerror = null; el.src = ph; };
  el.src = url;
}

/* =========================================================
   🔌 APIS — Configuración central (rutas reales Stellar)
   Si un comando falla, AJUSTA SU RUTA AQUÍ.
   Usa .testapi en el chat para probar todas automáticamente.
   ========================================================= */
const DELIRIUS = 'https://api.delirius.online';  // sin key (gratis)

const STELLAR = {
  base: 'https://api.stellarwa.xyz',
  key:  'proyectsV2',  // key Premium
  // ----- Rutas Stellar (key Premium: proyectsV2) -----
  // waifu / hentai / rule34 → la URL DEVUELVE LA IMAGEN DIRECTA (no JSON)
  // chatgpt → { result }, gemini → { response }, translate → { translated }
  // hentaivid → { resultados[] }, tiktoksearch/yt → { result[] }
  ep: {
    rule34:       '/nsfw/rule34',           // 🔞 .rule34 <tag>
    waifu:        '/anime/waifu',           // imagen waifu SFW   → .waifu
    hentai:       '/nsfw/waifu',            // 🔞 imagen hentai   → .hentai
    hentaivid:    '/nsfw/search/xvideos',   // 🔞 .hentaivid <q>
    tiktok:       '/dl/tiktok',             // .tiktok <url>
    tiktokSearch: '/search/tiktok',         // .tiktoksearch <q>
    ytdl:         '/search/yt',             // .yt <texto>
    gemini:       '/ai/gemini',             // .gemini <texto>
    chatgpt:      '/ai/chatgpt',            // .gpt <texto>
    translate:    '/tools/translate'        // .tr <lang> <texto>
  },
  // Rule34: type = "image" o "video"
  rule34Type: 'image'
};

/* Helper: fetch con timeout y manejo de errores */
async function apiGet(url, timeoutMs = 20000){
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } catch(e){
    clearTimeout(t);
    throw e;
  }
}
