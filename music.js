// Música de aventura de fondo, compuesta en código con Web Audio (sin archivos).
// Progresión C – Am – F – G, 112 bpm, bucle de 8 compases.
//  - Arranca con el primer toque (iOS no permite audio antes de un gesto).
//  - Se pausa sola mientras suena un audio de la familia.
//  - El botón 🔊/🔇 guarda la preferencia en este dispositivo.

const BPM = 112;
const STEP = 60 / BPM / 4; // semicorchea
const BAR = 16;
const MASTER = 0.32;
const KEY = 'mapa-musica';

// Melodía: 8 corcheas por compás (número MIDI, o null = silencio / sostener)
const MELODY = [
  [72, null, 74, 76, null, 79, null, 76],
  [76, null, 74, 72, null, 69, null, 72],
  [69, null, 72, 77, null, 76, 74, 72],
  [74, null, null, 71, null, 74, 79, null],
  [72, null, 74, 76, null, 79, null, 84],
  [81, null, 79, 76, null, 74, 72, null],
  [77, null, 76, 74, null, 72, 69, null],
  [71, null, 74, null, 79, null, 72, null],
];
// Acordes (raíz, tercera, quinta) por compás
const CHORDS = [
  [48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50],
  [48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50],
];

const hz = (m) => 440 * 2 ** ((m - 69) / 12);

let ctx = null;
let master = null;
let noise = null;
let timer = null;
let nextTime = 0;
let step = 0;
let playing = false;
let ducked = false;
let muted = readMuted();

function readMuted() {
  try { return localStorage.getItem(KEY) === 'off'; } catch { return false; }
}

function setupContext() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  // En iPhone, que suene aunque el interruptor de silencio esté activo
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  // búfer de ruido para la percusión
  noise = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}

// ---------- Instrumentos ----------
function tone(t, freq, dur, { type = 'triangle', gain = 0.2, attack = 0.01, release = 0.12, cutoff = 0 } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  let out = o;
  if (cutoff) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = cutoff;
    o.connect(f);
    out = f;
  }
  out.connect(g);
  g.connect(master);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.setValueAtTime(gain, t + Math.max(attack, dur - release));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + release);
  o.start(t);
  o.stop(t + dur + release + 0.02);
}

function lead(t, midi, dur) {
  tone(t, hz(midi), dur, { type: 'triangle', gain: 0.2, attack: 0.02, release: 0.1 });
  tone(t, hz(midi), dur, { type: 'square', gain: 0.035, attack: 0.02, release: 0.1, cutoff: 1800 });
}
const bass = (t, midi, dur) => tone(t, hz(midi), dur, { type: 'triangle', gain: 0.28, release: 0.06 });
const pluck = (t, midi) => tone(t, hz(midi), 0.05, { type: 'sine', gain: 0.07, attack: 0.003, release: 0.18 });

function kick(t) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  g.gain.setValueAtTime(0.35, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + 0.2);
}

function shaker(t, gain = 0.05) {
  const s = ctx.createBufferSource();
  s.buffer = noise;
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 6000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  s.connect(f); f.connect(g); g.connect(master);
  s.start(t); s.stop(t + 0.08);
}

// ---------- Secuenciador ----------
function scheduleStep(i, t) {
  const bar = Math.floor(i / BAR) % MELODY.length;
  const s = i % BAR;
  const [root, third, fifth] = CHORDS[bar];

  // melodía (corcheas; se alarga si le sigue un silencio)
  if (s % 2 === 0) {
    const e = s / 2;
    const note = MELODY[bar][e];
    if (note) {
      let len = 1;
      while (e + len < 8 && MELODY[bar][e + len] === null) len++;
      lead(t, note, STEP * 2 * len * 0.9);
    }
  }
  // bajo
  if (s === 0 || s === 8) bass(t, root, STEP * 3);
  if (s === 6) bass(t, root + 12, STEP * 1.5);
  if (s === 14) bass(t, fifth, STEP * 1.5);
  // arpegio suave
  if (s % 2 === 0) pluck(t, [root, third, fifth, root + 12, fifth, third, root + 12, fifth][s / 2] + 12);
  // percusión
  if (s === 0 || s === 8) kick(t);
  if (s % 4 === 2) shaker(t, 0.05);
  else if (s % 2 === 1) shaker(t, 0.018);
}

function tick() {
  while (nextTime < ctx.currentTime + 0.12) {
    scheduleStep(step, nextTime);
    nextTime += STEP;
    step++;
  }
}

function fadeTo(value, secs = 0.6) {
  if (!ctx) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(value, now + secs);
}

function start() {
  setupContext();
  if (!ctx || playing) return;
  ctx.resume?.();
  playing = true;
  nextTime = ctx.currentTime + 0.08;
  timer = setInterval(tick, 25);
  fadeTo(ducked ? 0 : MASTER, 1.2);
}

function stop() {
  if (!playing) return;
  playing = false;
  fadeTo(0, 0.4);
  setTimeout(() => { if (!playing) { clearInterval(timer); timer = null; } }, 450);
}

function refresh() {
  if (muted) stop();
  else { start(); fadeTo(ducked ? 0 : MASTER); }
}

// ---------- API ----------
export function isMuted() { return muted; }

const otherAudioPlaying = () => [...document.querySelectorAll('audio')].some((a) => !a.paused && !a.ended);

// Revisa si todavía hay un audio sonando (un audio que se borra de la pantalla no avisa)
export function syncMusicDuck() {
  if (!ducked || otherAudioPlaying()) return;
  ducked = false;
  if (playing && !muted) fadeTo(MASTER, 1.2);
}

export function toggleMusic() {
  muted = !muted;
  try { localStorage.setItem(KEY, muted ? 'off' : 'on'); } catch {}
  refresh();
  return muted;
}

export function initMusic() {
  // primer gesto: arrancar
  const firstGesture = () => { if (!muted) start(); };
  document.addEventListener('pointerdown', firstGesture, { once: true, capture: true });
  document.addEventListener('keydown', firstGesture, { once: true, capture: true });

  // pausar mientras suena un audio de la familia
  document.addEventListener('play', (e) => { if (e.target.tagName === 'AUDIO') { ducked = true; fadeTo(0, 0.4); } }, true);
  const maybeResume = () => setTimeout(syncMusicDuck, 50);
  document.addEventListener('pause', maybeResume, true);
  document.addEventListener('ended', maybeResume, true);

  // al salir de la app, silencio
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend?.();
    else if (!muted) { ctx.resume?.(); start(); }
  });
}

// Diagnóstico (consola): __musica()
window.__musica = () => ({ playing, ducked, muted, state: ctx?.state ?? 'sin iniciar', volumen: master ? +master.gain.value.toFixed(2) : 0 });
