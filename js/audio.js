/* =========================================================
   💧 AQUA BOT V3 — Sonidos
   ========================================================= */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let soundOn = localStorage.getItem('aquaV3_sound') !== 'off';

function ensureAudio(){
  if(!audioCtx) audioCtx = new AudioCtx();
  if(audioCtx.state === 'suspended') audioCtx.resume();
}

/* Beep simple: tipo de onda, frecuencia, duración (s) y volumen (0-1) */
function playBeep(type, freq, dur, gain){
  if(!soundOn) return;
  try{
    ensureAudio();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq || 720;
    g.gain.setValueAtTime(gain || 0.08, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (dur || 0.12));
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + (dur || 0.12));
  }catch(e){ /* sin audio disponible */ }
}

/* Sonido al enviar mensaje */
function playSend(){
  playBeep('sine', 880, 0.10, 0.07);
}

/* Sonido al recibir respuesta del bot */
function playReceive(){
  playBeep('sine', 620, 0.10, 0.07);
  setTimeout(() => playBeep('sine', 830, 0.12, 0.06), 90);
}

/* Sonido de error */
function playError(){
  playBeep('square', 220, 0.18, 0.05);
}
