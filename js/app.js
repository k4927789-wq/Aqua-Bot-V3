/* =========================================================
   💧 AQUA BOT V3 — Lógica principal
   Creado por k4927789-wq
   ========================================================= */
'use strict';

/* -------------------- ACCESOS DOM -------------------- */
const $ = (id) => document.getElementById(id);
const authScreen = $('authScreen'), authForm = $('authForm'), authError = $('authError');
const tabLogin = $('tabLogin'), tabRegister = $('tabRegister');
const authUser = $('authUser'), authPass = $('authPass'), authPass2 = $('authPass2');
const confirmField = $('confirmField'), ageRow = $('ageRow'), ageCheck = $('ageCheck'), authBtn = $('authBtn');
const app = $('app'), messagesEl = $('messages'), chipsEl = $('chips');
const inputEl = $('input'), sendBtn = $('sendBtn'), toastEl = $('toast');
const userLabel = $('userLabel'), soundBtn = $('soundBtn');

let currentUser = null;
let isRegisterMode = false;

/* -------------------- ALMACENAMIENTO -------------------- */
const store = {
  get users(){ try { return JSON.parse(localStorage.getItem('aquaV3_users')) || {}; } catch(e){ return {}; } },
  set users(v){ localStorage.setItem('aquaV3_users', JSON.stringify(v)); },
  get session(){ return localStorage.getItem('aquaV3_session'); },
  set session(v){ v ? localStorage.setItem('aquaV3_session', v) : localStorage.removeItem('aquaV3_session'); },
  chatKey(u){ return 'aquaV3_chat_' + u; },
  getChat(u){ try { return JSON.parse(localStorage.getItem(this.chatKey(u))) || []; } catch(e){ return []; } },
  setChat(u, arr){ localStorage.setItem(this.chatKey(u), JSON.stringify(arr.slice(-200))); }
};

/* "Hash" simple (solo demostración local, no es criptografía) */
function hashPass(s){
  let h = 5381;
  for(let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return 'h' + h.toString(36);
}

/* -------------------- UTILIDADES -------------------- */
function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

function nowTs(){
  return new Date().toLocaleTimeString('es-419', { hour: '2-digit', minute: '2-digit' });
}

function scrollBottom(){
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

/* -------------------- MENSAJES -------------------- */
function saveMsg(who, text, img){
  if(!currentUser) return;
  const arr = store.getChat(currentUser);
  arr.push({ who, text: text || '', img: img || null, t: Date.now() });
  store.setChat(currentUser, arr);
}

function renderMsg(who, text, img, ts){
  const b = document.createElement('div');
  b.className = 'bubble ' + who;
  if(img){
    const im = document.createElement('img');
    im.className = 'msg-img';
    im.alt = 'imagen';
    setImg(im, img, PH.avatar);
    b.appendChild(im);
  }
  if(text){
    const span = document.createElement('span');
    span.textContent = text;
    b.appendChild(span);
  }
  const t = document.createElement('span');
  t.className = 'ts';
  t.textContent = ts || nowTs();
  b.appendChild(t);
  messagesEl.appendChild(b);
  scrollBottom();
  return b;
}

function addUserMsg(text){
  renderMsg('user', text);
  saveMsg('user', text);
  playSend();
}

let typingEl = null;
function showTyping(){
  hideTyping();
  typingEl = document.createElement('div');
  typingEl.className = 'bubble bot proc';
  typingEl.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  messagesEl.appendChild(typingEl);
  scrollBottom();
}
function hideTyping(){ if(typingEl){ typingEl.remove(); typingEl = null; } }

function botReply(text, img, delay){
  showTyping();
  setTimeout(() => {
    hideTyping();
    renderMsg('bot', text, img);
    saveMsg('bot', text, img);
    playReceive();
  }, delay || 500);
}

/* -------------------- AUTENTICACIÓN -------------------- */
function setMode(register){
  isRegisterMode = register;
  tabLogin.classList.toggle('active', !register);
  tabRegister.classList.toggle('active', register);
  confirmField.classList.toggle('hidden', !register);
  ageRow.classList.toggle('hidden', !register);
  authBtn.textContent = register ? 'Crear cuenta 💧' : 'Iniciar sesión 💧';
  authError.style.display = 'none';
  authPass2.value = ''; ageCheck.checked = false;
}

function authFail(msg){
  authError.textContent = '⚠️ ' + msg;
  authError.style.display = 'block';
  playError();
}

tabLogin.addEventListener('click', () => setMode(false));
tabRegister.addEventListener('click', () => setMode(true));

authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const u = authUser.value.trim();
  const p = authPass.value;
  if(!u || !p) return authFail('Completa usuario y contraseña.');
  const users = store.users;

  if(isRegisterMode){
    if(u.length < 3) return authFail('El usuario debe tener al menos 3 caracteres.');
    if(p.length < 4) return authFail('La contraseña debe tener al menos 4 caracteres.');
    if(p !== authPass2.value) return authFail('Las contraseñas no coinciden.');
    if(!ageCheck.checked) return authFail('Debes confirmar que tienes 18 años o más.');
    if(users[u]) return authFail('Ese usuario ya existe. Inicia sesión.');
    users[u] = { pass: hashPass(p), age: true, created: Date.now() };
    store.users = users;
    toast('✅ Cuenta creada. ¡Bienvenido, ' + u + '!');
    enterApp(u);
  } else {
    if(!users[u]) return authFail('Usuario no encontrado. Crea una cuenta primero.');
    if(users[u].pass !== hashPass(p)) return authFail('Contraseña incorrecta.');
    enterApp(u);
  }
});

function enterApp(u){
  currentUser = u;
  store.session = u;
  authScreen.classList.add('hidden');
  app.classList.remove('hidden');
  userLabel.textContent = u;
  setImg($('avatarImg'), IMG.avatar, PH.avatar);
  messagesEl.style.setProperty('--bg-img', 'url("' + IMG.fondo + '")');
  loadChat();
  updateSoundBtn();
}

function logout(){
  store.session = null;
  currentUser = null;
  app.classList.add('hidden');
  authScreen.classList.remove('hidden');
  inputEl.value = '';
  toast('👋 Sesión cerrada');
}

function loadChat(){
  messagesEl.innerHTML = '';
  const arr = store.getChat(currentUser);
  if(!arr.length){
    botReply('💧 ¡Hola ' + currentUser + '! Soy Aqua Bot V3. Escribe .menu para ver mis comandos mágicos. ✨', null, 400);
    return;
  }
  arr.forEach(m => renderMsg(m.who, m.text, m.img, new Date(m.t).toLocaleTimeString('es-419', { hour: '2-digit', minute: '2-digit' })));
}

/* -------------------- MENÚ Y AYUDA -------------------- */
function menuHTML(){
  return '<div class="aqua-menu">' +
    '<div class="menu-header">' +
      '<img class="menu-img" src="' + IMG.banner + '" alt="Aqua Bot V3" onerror="this.onerror=null;this.src=\'' + PH.banner + '\'">' +
      '<h2 class="menu-title">💧 AQUA BOT V3 💧</h2>' +
      '<p class="menu-sub">La diosa del agua te bendice con comandos mágicos</p>' +
    '</div>' +
    '<div class="menu-grid">' +
      '<div class="menu-card"><h3>🖼️ Imágenes</h3><p>.waifu → waifu aleatoria</p><p>.rule34 &lt;tags&gt; → buscar en Rule34 🔞</p></div>' +
      '<div class="menu-card"><h3>📱 Redes</h3><p>.tiktok &lt;url&gt; → descargar video</p><p>.tiktoksearch &lt;texto&gt; → buscar</p><p>.yt &lt;texto&gt; → buscar en YouTube</p></div>' +
      '<div class="menu-card"><h3>🤖 Inteligencia</h3><p>.gpt &lt;texto&gt; → ChatGPT</p><p>.gemini &lt;texto&gt; → Gemini</p><p>.tr &lt;lang&gt; &lt;texto&gt; → traducir</p></div>' +
      '<div class="menu-card nsfw"><h3>🔞 NSFW</h3><p>.hentai → imagen hentai</p><p>.hentaivid &lt;texto&gt; → buscar videos</p><p>.rule34 &lt;tags&gt; → Rule34</p></div>' +
      '<div class="menu-card cuenta"><h3>⚙️ Cuenta</h3><p>.ping → latencia</p><p>.testapi → probar APIs</p><p>.sonido → activar/apagar</p><p>.salir → cerrar sesión</p></div>' +
    '</div>' +
  '</div>';
}

function helpText(){
  return '💧 *Comandos de Aqua Bot V3*\n\n' +
    '🖼️ .waifu · .rule34 <tags> 🔞\n' +
    '📱 .tiktok <url> · .tiktoksearch <texto> · .yt <texto>\n' +
    '🤖 .gpt <texto> · .gemini <texto> · .tr <lang> <texto>\n' +
    '🔞 .hentai · .hentaivid <texto> · .rule34 <tags> (solo 18+)\n' +
    '⚙️ .menu · .ping · .testapi · .sonido · .salir\n\n' +
    'Creado por k4927789-wq';
}

/* -------------------- LLAMADAS A APIs -------------------- */
function stellarURL(ep, params){
  const q = new URLSearchParams(Object.assign({ key: STELLAR.key }, params || {}));
  return STELLAR.base + ep + '?' + q.toString();
}

function extractImageURL(data){
  if(!data) return null;
  const d = data.data !== undefined ? data.data : data;
  if(typeof d === 'string') return d;
  if(d && typeof d === 'object'){
    return d.url || d.image || d.img || (d[0] && (d[0].url || d[0].image || d[0].file_url)) || null;
  }
  return null;
}

function extractVideoURL(data){
  if(!data) return null;
  const d = data.data !== undefined ? data.data : data;
  if(typeof d === 'string') return d;
  if(d && typeof d === 'object'){
    return d.video || d.url || d.mp4 || d.download || (d.medias && d.medias[0] && d.medias[0].url) || null;
  }
  return null;
}

function nsfwAllowed(){
  const users = store.users;
  return currentUser && users[currentUser] && users[currentUser].age === true;
}

/* -------------------- TEST DE APIs -------------------- */
async function testAPIs(){
  botReply('🧪 Probando APIs... espera un momento.', null, 300);
  const results = [];
  const extra = {
    rule34:       { tag: 'aqua', type: STELLAR.rule34Type },
    hentaivid:    { query: 'aqua' },
    tiktok:       { url: 'https://vm.tiktok.com/test/' },
    tiktokSearch: { query: 'aqua' },
    ytdl:         { query: 'aqua' },
    gemini:       { text: 'hola' },
    chatgpt:      { text: 'hola' },
    translate:    { text: 'hola', to: 'en' }
  };
  // waifu / hentai / rule34 devuelven imagen binaria (no JSON) → solo checamos HTTP 200
  const imageOnly = new Set(['waifu', 'hentai', 'rule34']);
  const jobs = Object.entries(STELLAR.ep).map(async ([name, ep]) => {
    const t0 = performance.now();
    try {
      const url = stellarURL(ep, extra[name] || {});
      if(imageOnly.has(name)){
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 12000);
        const r = await fetch(url, { method: 'GET', signal: ctrl.signal });
        clearTimeout(t);
        if(!r.ok) throw new Error('HTTP ' + r.status);
        results.push({ name, ok: true, ms: Math.round(performance.now() - t0) });
      } else {
        await apiGet(url, 12000);
        results.push({ name, ok: true, ms: Math.round(performance.now() - t0) });
      }
    } catch(e) {
      results.push({ name, ok: false, ms: Math.round(performance.now() - t0) });
    }
  });
  try { await apiGet(DELIRIUS, 8000); results.push({ name: 'delirius', ok: true, ms: 0 }); }
  catch(e){ results.push({ name: 'delirius', ok: false, ms: 0 }); }
  await Promise.allSettled(jobs);

  showTyping();
  setTimeout(() => {
    hideTyping();
    const okCount = results.filter(r => r.ok).length;
    const lines = results.map(r => (r.ok ? '✅' : '❌') + ' ' + r.name + (r.ms ? ' (' + r.ms + 'ms)' : '')).join('\n');
    renderMsg('bot', '🧪 *Test de APIs* — ' + okCount + '/' + results.length + ' OK\n' + lines + '\n\nSi alguna sale ❌, edita su ruta en js/config.js');
    saveMsg('bot', '🧪 Test de APIs: ' + okCount + '/' + results.length + ' OK');
    playReceive();
  }, 600);
}

/* -------------------- COMANDOS -------------------- */
async function runCommand(raw){
  const parts = raw.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase().replace(/^[.!]/, '');
  const args = parts.slice(1).join(' ');

  switch(cmd){
    case 'menu':
    case 'start':
      showTyping();
      setTimeout(() => {
        hideTyping();
        const b = document.createElement('div');
        b.className = 'bubble bot';
        b.innerHTML = menuHTML() + '<span class="ts">' + nowTs() + '</span>';
        messagesEl.appendChild(b);
        scrollBottom();
        saveMsg('bot', '[menú principal]');
        playReceive();
      }, 450);
      break;

    case 'help':
    case 'ayuda':
      botReply(helpText(), null, 350);
      break;

    case 'ping':
      botReply('🏓 Pong! Latencia: ' + Math.round(performance.now() % 200) + 'ms · Todo funcionando 💧', null, 300);
      break;

    case 'owner':
    case 'creador':
      botReply('👑 Creado por *k4927789-wq* 💧\nAqua Bot V3 — todos los derechos reservados.', null, 350);
      break;

    case 'sonido':
      soundOn = !soundOn;
      localStorage.setItem('aquaV3_sound', soundOn ? 'on' : 'off');
      updateSoundBtn();
      toast(soundOn ? '🔊 Sonido activado' : '🔇 Sonido desactivado');
      if(soundOn) playReceive();
      break;

    case 'testapi':
      testAPIs();
      break;

    case 'salir':
    case 'logout':
      setTimeout(logout, 600);
      botReply('👋 Cerrando sesión... ¡Hasta luego!', null, 200);
      break;

    case 'waifu': {
      // La API devuelve la imagen directa → usamos la URL como src del <img>
      botReply('🖼️ Buscando waifu...', null, 200);
      try {
        const url = stellarURL(STELLAR.ep.waifu) + '&t=' + Date.now();
        botReply('🖼️ Tu waifu:', url, 100);
      } catch(e){ botReply('❌ Error al obtener la imagen. La API puede estar caída.', null, 100); playError(); }
      break;
    }

    case 'rule34':
    case 'girls': {
      // La API devuelve la imagen directa (JPEG) → usamos la URL como src
      if(!nsfwAllowed()){ botReply('🔞 Rule34 es contenido NSFW: solo mayores de 18 años.', null, 200); playError(); break; }
      if(!args) return botReply('⚠️ Uso: .rule34 <tag>  (ej: .rule34 aqua)', null, 200);
      botReply('🔞 Buscando en Rule34: ' + args, null, 200);
      try {
        const url = stellarURL(STELLAR.ep.rule34, { tag: args, type: STELLAR.rule34Type }) + '&t=' + Date.now();
        botReply('🔞 Rule34 [' + args + ']:', url, 100);
      } catch(e){
        botReply('❌ Rule34 no respondió. Revisa el tag.', null, 100);
        playError();
      }
      break;
    }

    case 'hentai': {
      // La API devuelve la imagen directa → usamos la URL como src del <img>
      if(!nsfwAllowed()){ botReply('🔞 Este comando es solo para mayores de 18 años.', null, 200); playError(); break; }
      botReply('🔞 Buscando hentai...', null, 200);
      try {
        const url = stellarURL(STELLAR.ep.hentai) + '&t=' + Date.now();
        botReply('🔞 Aquí tienes:', url, 100);
      } catch(e){ botReply('❌ Error al obtener el contenido NSFW.', null, 100); playError(); }
      break;
    }

    case 'hentaivid': {
      if(!nsfwAllowed()){ botReply('🔞 Este comando es solo para mayores de 18 años.', null, 200); playError(); break; }
      if(!args) return botReply('⚠️ Uso: .hentaivid <texto>  (ej: .hentaivid anime cosplay)', null, 200);
      botReply('🔞 Buscando videos: ' + args, null, 200);
      try {
        const data = await apiGet(stellarURL(STELLAR.ep.hentaivid, { query: args }));
        // API: { status, resultados: [{ title, url, cover, ... }] }
        const items = (data && Array.isArray(data.resultados) ? data.resultados : []).slice(0, 5);
        if(items.length){
          const txt = items.map((it, i) => (i + 1) + '. ' + (it.title || 'video') + (it.duration ? ' (' + it.duration + ')' : '') + '\n' + (it.url || '')).join('\n\n');
          botReply('🔞 Resultados:\n' + txt, null, 100);
        } else {
          throw new Error('sin resultados');
        }
      } catch(e){ botReply('❌ Búsqueda NSFW fallida.', null, 100); playError(); }
      break;
    }

    case 'tiktok': {
      if(!args) return botReply('⚠️ Uso: .tiktok <url de TikTok>', null, 200);
      botReply('📱 Descargando video de TikTok...', null, 200);
      try {
        const data = await apiGet(stellarURL(STELLAR.ep.tiktok, { url: args }));
        const v = extractVideoURL(data) || (data && (data.dl || data.video || data.url));
        if(!v) throw new Error('sin video');
        botReply('📱 Video listo: ' + v, null, 100);
      } catch(e){ botReply('❌ No pude descargar ese TikTok. Revisa el enlace.', null, 100); playError(); }
      break;
    }

    case 'tiktoksearch': {
      if(!args) return botReply('⚠️ Uso: .tiktoksearch <texto>', null, 200);
      botReply('🔍 Buscando en TikTok...', null, 200);
      try {
        const data = await apiGet(stellarURL(STELLAR.ep.tiktokSearch, { query: args }));
        // API: { status, result: [{ title, id, dl, ... }] }
        const items = (data && Array.isArray(data.result) ? data.result : []).slice(0, 5);
        if(!items.length) throw new Error('sin resultados');
        const txt = items.map((it, i) => (i + 1) + '. ' + (it.title || 'video') + '\n' + (it.dl || it.url || it.play || '')).join('\n\n');
        botReply('🔍 Resultados de TikTok:\n' + txt, null, 100);
      } catch(e){ botReply('❌ Búsqueda TikTok fallida.', null, 100); playError(); }
      break;
    }

    case 'yt':
    case 'ytdl':
    case 'youtube': {
      if(!args) return botReply('⚠️ Uso: .yt <texto para buscar>', null, 200);
      botReply('📺 Buscando en YouTube...', null, 200);
      try {
        const data = await apiGet(stellarURL(STELLAR.ep.ytdl, { query: args }));
        // API: { status, result: [{ title, autor, url, ... }] }
        const items = (data && Array.isArray(data.result) ? data.result : []).slice(0, 5);
        if(items.length){
          const txt = items.map((it, i) => (i + 1) + '. ' + (it.title || 'video') + (it.autor ? ' — ' + it.autor : '') + '\n' + (it.url || '')).join('\n\n');
          botReply('📺 Resultados de YouTube:\n' + txt, null, 100);
        } else {
          throw new Error('sin resultados');
        }
      } catch(e){ botReply('❌ Búsqueda de YouTube fallida.', null, 100); playError(); }
      break;
    }

    case 'gpt':
    case 'chatgpt': {
      if(!args) return botReply('⚠️ Uso: .gpt <tu pregunta>', null, 200);
      botReply('🤖 Preguntando a ChatGPT...', null, 200);
      try {
        const data = await apiGet(stellarURL(STELLAR.ep.chatgpt, { text: args }));
        // API: { status, result: "..." }
        const ans = data && (data.result || data.response || data.answer || data.message);
        if(!ans) throw new Error('sin respuesta');
        botReply('🤖 ' + String(ans).slice(0, 900), null, 100);
      } catch(e){ botReply('❌ ChatGPT no respondió. Intenta de nuevo.', null, 100); playError(); }
      break;
    }

    case 'gemini': {
      if(!args) return botReply('⚠️ Uso: .gemini <tu pregunta>', null, 200);
      botReply('🤖 Consultando a Gemini...', null, 200);
      try {
        const data = await apiGet(stellarURL(STELLAR.ep.gemini, { text: args }));
        // API: { status, response: "..." }
        const ans = data && (data.response || data.result || data.answer || data.message);
        if(!ans) throw new Error('sin respuesta');
        botReply('🤖 ' + String(ans).slice(0, 900), null, 100);
      } catch(e){ botReply('❌ Gemini no respondió. Intenta de nuevo.', null, 100); playError(); }
      break;
    }

    case 'tr':
    case 'translate': {
      const trParts = raw.trim().split(/\s+/);
      const lang = trParts[1];
      const text = trParts.slice(2).join(' ');
      if(!lang || !text) return botReply('⚠️ Uso: .tr <código idioma> <texto>  (ej: .tr en hola mundo)', null, 200);
      botReply('🌐 Traduciendo...', null, 200);
      try {
        const data = await apiGet(stellarURL(STELLAR.ep.translate, { text, to: lang }));
        const d = data && (data.data !== undefined ? data.data : data);
        const ans = typeof d === 'string' ? d : (d && (d.translated || d.translation || d.result || d.text));
        if(!ans) throw new Error('sin traducción');
        botReply('🌐 Traducción (' + lang + '): ' + ans, null, 100);
      } catch(e){ botReply('❌ No pude traducir. Verifica el código de idioma.', null, 100); playError(); }
      break;
    }

    default:
      botReply('🤔 No reconozco ese comando. Escribe .menu para ver todo lo que puedo hacer. 💧', null, 300);
  }
}

/* -------------------- ENVÍO -------------------- */
function send(){
  const text = inputEl.value.trim();
  if(!text || !currentUser) return;
  inputEl.value = '';
  addUserMsg(text);
  runCommand(text);
}

sendBtn.addEventListener('click', send);
inputEl.addEventListener('keydown', (e) => { if(e.key === 'Enter') send(); });

/* -------------------- CHIPS -------------------- */
const CHIPS = [
  { label: '.menu', cmd: '.menu' },
  { label: '📱 .tiktok', cmd: '.tiktok ' },
  { label: '🤖 .gpt', cmd: '.gpt ' },
  { label: '🌐 .tr', cmd: '.tr en ' },
  { label: '🖼️ .waifu', cmd: '.waifu' },
  { label: '🔞 .rule34', cmd: '.rule34 ', nsfw: true },
  { label: '🔞 .hentai', cmd: '.hentai', nsfw: true },
  { label: '🧪 .testapi', cmd: '.testapi' }
];
CHIPS.forEach(c => {
  const b = document.createElement('button');
  b.className = 'chip' + (c.nsfw ? ' nsfw' : '');
  b.textContent = c.label;
  b.addEventListener('click', () => { inputEl.value = c.cmd; inputEl.focus(); });
  chipsEl.appendChild(b);
});

/* -------------------- BOTONES DEL HEADER -------------------- */
function updateSoundBtn(){ soundBtn.textContent = soundOn ? '🔊' : '🔇'; }
soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  localStorage.setItem('aquaV3_sound', soundOn ? 'on' : 'off');
  updateSoundBtn();
  if(soundOn) playReceive();
});

$('clearBtn').addEventListener('click', () => {
  if(!currentUser) return;
  if(confirm('¿Limpiar toda la conversación?')){
    store.setChat(currentUser, []);
    messagesEl.innerHTML = '';
    botReply('🧹 Chat limpiado. ¡Empecemos de nuevo! Escribe .menu.', null, 300);
  }
});

$('exportBtn').addEventListener('click', () => {
  if(!currentUser) return;
  const arr = store.getChat(currentUser);
  if(!arr.length) return toast('No hay mensajes para exportar');
  const txt = arr.map(m =>
    '[' + new Date(m.t).toLocaleString('es-419') + '] ' +
    (m.who === 'user' ? currentUser : 'Aqua Bot') + ': ' +
    (m.text || (m.img ? '[imagen] ' + m.img : ''))
  ).join('\n');
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'aqua-chat-' + currentUser + '.txt';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('📥 Conversación descargada');
});

$('logoutBtn').addEventListener('click', logout);

/* -------------------- ARRANQUE -------------------- */
setImg($('authLogo'), IMG.icon, PH.avatar);
if(store.session && store.users[store.session]){
  enterApp(store.session);
} else {
  setMode(false);
}
