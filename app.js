import { MESSAGES, STATIONS } from './config.js';
import { check, matches, baseLetter, isLetter, hangmanStatus } from './logic.js';

// ---------- Flujo ----------
const FLOW = STATIONS.flatMap((st, si) =>
  st.steps.filter((s) => s.enabled !== false).map((s) => ({ ...s, si }))
);

// ---------- Estado persistente ----------
const KEY = 'mapa-tesoro-28-v1';
const fresh = () => ({ pos: 0, maxPos: 0, unlocked: [], solved: {}, hints: {}, guessed: {}, cw: {} });
let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const st = { ...fresh(), ...JSON.parse(raw) };
      st.maxPos = Math.max(st.maxPos || 0, st.pos);
      return st;
    }
  } catch {}
  return fresh();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

// ---------- Utilidades ----------
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lines = (arr, cls = '') => `<div class="lines ${cls}">${(arr || []).map((l) => `<p>${esc(l)}</p>`).join('')}</div>`;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const WRONG = [
  'Mmm, no es eso. ¡Tú puedes, exploradora!',
  'Casi… ¡sigue buscando! 🔍',
  'No es esa, pero vas bien. ¡Otra vez!',
  '¡Uy! Inténtalo de nuevo 🧭',
];

function current() { return FLOW[Math.min(state.pos, FLOW.length - 1)]; }

function go(pos) {
  state.pos = Math.max(0, Math.min(FLOW.length - 1, pos));
  state.maxPos = Math.max(state.maxPos, state.pos);
  save();
  render();
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
}
const next = () => go(state.pos + 1);

function unlock(ids = []) {
  let added = false;
  for (const id of ids) if (!state.unlocked.includes(id)) { state.unlocked.push(id); added = true; }
  if (added) {
    const b = $('#backpackBtn');
    b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  }
}

function solve(step) {
  state.solved[step.id] = true;
  unlock(step.unlocks);
  save();
}

// ---------- Confeti ----------
function confetti() {
  if (reduceMotion) return;
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#c8412d', '#1f8f8a', '#e3a82b', '#7b4bb4', '#2f8a4c'];
  for (let i = 0; i < 44; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = 1.6 + Math.random() * 1.4 + 's';
    p.style.animationDelay = Math.random() * 0.4 + 's';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3500);
}

// ---------- Mensajes ----------
const docPreview = (src) => src.replace(/\/(edit|view)([?#].*)?$/, '/preview');

function messageCard(id) {
  const m = MESSAGES[id];
  if (!m) return '';
  const head = (icon) => `
    <div class="msg-head">
      <div class="msg-icon" aria-hidden="true">${icon}</div>
      <div><div class="msg-name">${esc(m.name)}</div><div class="msg-rel">${esc(m.relation)}</div></div>
    </div>`;
  if (m.type === 'audio' && m.src) {
    return `<div class="msg">${head('🎧')}<audio controls preload="metadata" src="${esc(m.src)}"></audio></div>`;
  }
  if (m.type === 'doc' && m.src && docId(m.src)) {
    // Google Doc: se lee el texto y se muestra como carta dentro de la app
    return `<div class="msg">${head('📜')}
      <button class="btn teal block" data-letter="${esc(id)}">Leer carta 📜</button>
      <div class="letter-slot"></div>
    </div>`;
  }
  if (m.type === 'doc' && m.src) {
    // archivo de Drive (audio/video/pdf): se abre con el visor de Drive
    return `<div class="msg">${head('💌')}
      <a class="btn teal" href="${esc(m.src)}" target="_blank" rel="noopener">Abrir mensaje 💌</a>
      <button class="btn ghost block doc-toggle" data-doc="${esc(docPreview(m.src))}">Ver aquí</button>
    </div>`;
  }
  return `<div class="msg pending">${head('💌')}<div class="note">Mensaje de ${esc(m.name)} – pendiente. Llegará a tu mochila 🎒</div></div>`;
}

function messagesBlock(step) {
  if (!step.unlocks?.length) return '';
  const label = step.groupLabel ? `<div class="group-label">${esc(step.groupLabel)}</div>` : '';
  // primero los que ya llegaron, luego los pendientes
  const ids = [...step.unlocks].sort((a, b) => (MESSAGES[a]?.type === 'pending') - (MESSAGES[b]?.type === 'pending'));
  const title = step.unlocks.length > 1 ? '¡Desbloqueaste mensajes!' : '¡Desbloqueaste un mensaje!';
  return `<p class="kicker" style="margin-top:6px">${title}</p>${label}<div class="messages">${ids.map(messageCard).join('')}</div>`;
}

// ---------- Cartas (texto de Google Docs) ----------
const docId = (src) => (src.match(/docs\.google\.com\/document\/d\/([\w-]+)/) || [])[1];
const LETTER_KEY = (id) => 'carta-' + id;

async function fetchLetter(src) {
  const id = docId(src);
  const res = await fetch(`https://docs.google.com/document/d/${id}/export?format=txt`);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const text = (await res.text()).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim();
  if (!text) throw new Error('vacía');
  try { localStorage.setItem(LETTER_KEY(id), text); } catch {}
  return text;
}

function cachedLetter(src) {
  try { return localStorage.getItem(LETTER_KEY(docId(src))); } catch { return null; }
}

// Descarga en segundo plano todas las cartas, por si en el museo no hay señal
function prefetchLetters() {
  for (const m of Object.values(MESSAGES)) {
    if (m.type === 'doc' && m.src && docId(m.src)) fetchLetter(m.src).catch(() => {});
  }
}

function letterHtml(text, m) {
  const paras = text.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
  const body = paras.map((p, i) => {
    const html = esc(p).replace(/\n/g, '<br>');
    const greet = i === 0 && p.length < 70 && /[,:]$/.test(p);
    return `<p${greet ? ' class="letter-greet"' : ''}>${html}</p>`;
  }).join('');
  return `<article class="letter">
    <div class="letter-seal" aria-hidden="true">💌</div>
    ${body}
    <a class="letter-link" href="${esc(m.src)}" target="_blank" rel="noopener">Ver en Google Docs ↗</a>
  </article>`;
}

function wireLetters(root) {
  root.querySelectorAll('[data-letter]').forEach((b) => {
    b.addEventListener('click', async () => {
      const m = MESSAGES[b.dataset.letter];
      const slot = b.nextElementSibling;
      if (slot.innerHTML) { slot.innerHTML = ''; b.textContent = 'Leer carta 📜'; return; }
      b.textContent = 'Cerrar carta ✕';
      const cached = cachedLetter(m.src);
      if (cached) {
        slot.innerHTML = letterHtml(cached, m);
        fetchLetter(m.src).catch(() => {}); // refresca por si la editaron
        return;
      }
      slot.innerHTML = `<div class="letter-loading">Desenrollando el pergamino… 🗞️</div>`;
      try {
        const text = await fetchLetter(m.src);
        if (slot.isConnected && slot.innerHTML) slot.innerHTML = letterHtml(text, m);
      } catch {
        slot.innerHTML = `<div class="letter-loading">No pude cargar la carta aquí 😕<br>
          <a class="btn ghost block" href="${esc(m.src)}" target="_blank" rel="noopener">Abrirla en Google Docs</a></div>`;
      }
    });
  });
}

function wireDocToggles(root) {
  wireLetters(root);
  root.querySelectorAll('[data-doc]').forEach((b) => {
    b.addEventListener('click', () => {
      const existing = b.nextElementSibling;
      if (existing?.tagName === 'IFRAME') { existing.remove(); b.textContent = 'Ver aquí'; return; }
      const f = document.createElement('iframe');
      f.className = 'doc-frame';
      f.src = b.dataset.doc;
      f.title = 'Mensaje';
      b.after(f);
      b.textContent = 'Cerrar vista';
    });
  });
}

// ---------- Trail ----------
function renderTrail() {
  const step = current();
  const isFinale = step.type === 'finale';
  const reachedSi = FLOW[state.maxPos].si;
  const islands = STATIONS.map((st, i) => {
    const cls = isFinale || i < step.si ? 'done' : i === step.si ? 'current' : i <= reachedSi ? '' : 'secret';
    // las estaciones futuras son secretas hasta llegar a ellas
    if (cls === 'secret') return `<div class="island secret"><span aria-hidden="true">?</span><span class="lbl">???</span></div>`;
    return `<div class="island ${cls}"><span aria-hidden="true">${st.icon}</span><span class="lbl">${esc(st.place)}</span></div>`;
  }).join('');
  const chest = `<div class="island goal ${isFinale ? 'current' : ''}"><span aria-hidden="true">❌</span><span class="lbl">Tesoro</span></div>`;
  const pct = (state.pos / (FLOW.length - 1)) * 100;
  const inStation = FLOW.filter((s) => s.si === step.si);
  const idx = inStation.findIndex((s) => s.id === step.id) + 1;
  const label = isFinale ? '¡Mapa completo!' : `Estación ${step.si + 1} · ${esc(STATIONS[step.si].name)} · ${idx} de ${inStation.length}`;
  $('#trail').innerHTML = `
    <div class="trail-row">
      <div class="trail-line"></div>
      <div class="trail-fill" style="width:calc((100% - 56px) * ${pct / 100})"></div>
      ${islands}${chest}
    </div>
    <div class="trail-step">${label}</div>`;
}

// ---------- Vistas ----------
function displayAnswer(step) {
  if (step.display) return step.display;
  const a = String(step.answers?.[0] ?? '');
  return a.charAt(0).toUpperCase() + a.slice(1);
}

// Navegación: volver a pasos anteriores y regresar a donde iba
function navBar() {
  const back = state.pos > 0;
  const fwd = state.pos < state.maxPos;
  if (!back && !fwd) return '';
  return `<div class="nav-row">
    ${back ? `<button class="btn ghost" id="navBack">← Anterior</button>` : '<span></span>'}
    ${fwd ? `<button class="btn ghost" id="navLatest">Volver a donde iba ⏩</button>` : '<span></span>'}
  </div>`;
}

function viewIntro(step) {
  return `<section class="card">
    <p class="kicker">${esc(STATIONS[step.si].place)}</p>
    <h1 class="title">${esc(step.title)}</h1>
    ${lines(step.text)}
    <div class="answer"><button class="btn block" id="go">${esc(step.button)}</button></div>
  </section>`;
}

function viewRiddle(step) {
  const solved = state.solved[step.id];
  if (solved) {
    return `<section class="card">
      <p class="kicker">${esc(STATIONS[step.si].place)}</p>
      <h1 class="title">${esc(step.title)}</h1>
      ${lines(step.text, 'solved-text')}
      <div class="answer-pill">Respuesta: <strong>${esc(displayAnswer(step))}</strong></div>
      <div class="success-banner"><span class="big">🎉</span><span>${esc(step.success)}</span></div>
      ${messagesBlock(step)}
      <button class="btn block teal" id="go">Seguir la aventura ➜</button>
    </section>`;
  }
  const shown = state.hints[step.id] || 0;
  const hints = (step.hints || []).slice(0, shown).map((h) => `<div class="hint"><span class="parrot">🦜</span><span>${esc(h)}</span></div>`).join('');
  const more = shown < (step.hints || []).length;
  const isPoem = step.text.length >= 4 && step.text.every((l) => l.length < 60);
  return `<section class="card" id="card">
    <p class="kicker">${esc(STATIONS[step.si].place)}</p>
    <h1 class="title">${esc(step.title)}</h1>
    ${lines(step.text, isPoem ? 'poem' : '')}
    <form class="answer" id="form" autocomplete="off">
      <input id="ans" type="text" inputmode="text" enterkeyhint="done" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Tu respuesta…" aria-label="Tu respuesta" />
      <button class="btn block" type="submit">Comprobar</button>
    </form>
    <div class="feedback" id="fb" role="status"></div>
    <div class="hints">${hints}</div>
    ${more ? `<div class="answer"><button class="btn ghost block" id="hint">🦜 Pedir una pista (${shown + 1}/${step.hints.length})</button></div>` : ''}
  </section>`;
}

function wireRiddle(step) {
  if (state.solved[step.id]) return;
  const form = $('#form'), input = $('#ans'), fb = $('#fb'), card = $('#card');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value;
    if (!val.trim()) { input.focus(); return; }
    const r = check(step, val);
    if (r === 'ok') {
      input.blur();
      solve(step);
      confetti();
      render();
      return;
    }
    card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    if (r.near) { fb.className = 'feedback near'; fb.textContent = r.near; }
    else { fb.className = 'feedback bad'; fb.textContent = step.wrongFeedback || WRONG[Math.floor(Math.random() * WRONG.length)]; }
  });
  $('#hint')?.addEventListener('click', () => {
    state.hints[step.id] = (state.hints[step.id] || 0) + 1;
    save();
    const typed = input.value;
    render();
    const ni = $('#ans');
    if (ni) ni.value = typed;
  });
}

// --- Ahorcado ---
const KB = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'];
const FAKE_LIMIT = 3;
let lastGuess = null;

function viewHangman(step) {
  const guessed = new Set(state.guessed[step.id] || []);
  const { misses, solved } = hangmanStatus(step.phrase, guessed);
  const board = step.phrase.split(' ').map((w) =>
    `<div class="word">${[...w].map((ch) => {
      if (!isLetter(ch)) return `<div class="cell">${esc(ch)}</div>`;
      const b = baseLetter(ch);
      const show = guessed.has(b);
      return `<div class="cell ${show && b === lastGuess ? 'hit' : ''}">${show ? esc(ch) : ''}</div>`;
    }).join('')}</div>`
  ).join('');

  const left = FAKE_LIMIT - misses;
  const coins = left > 0
    ? `Intentos: ${Array.from({ length: FAKE_LIMIT }, (_, i) => `<span class="coin ${i >= left ? 'lost' : ''}">🪙</span>`).join('')}`
    : `Intentos: <span class="inf">∞</span>`;
  const nice = misses >= FAKE_LIMIT && !solved ? `<div class="nice-msg">Soy buena gente, sigue intentando 😉</div>` : '';

  const hintList = Object.entries(step.hints || {})
    .filter(([n]) => misses >= Number(n))
    .map(([, h]) => `<div class="hint"><span class="parrot">🦜</span><span>${esc(h)}</span></div>`).join('');

  const kb = KB.map((row) => `<div class="kb-row">${[...row].map((k) => {
    const l = k.toLowerCase();
    const letters = new Set([...step.phrase].filter(isLetter).map(baseLetter));
    const cls = guessed.has(l) ? (letters.has(l) ? 'hit' : 'miss') : '';
    return `<button class="key ${cls}" data-k="${l}" ${guessed.has(l) || solved ? 'disabled' : ''} aria-label="Letra ${k}">${k}</button>`;
  }).join('')}</div>`).join('');

  if (solved) {
    return `<section class="card">
      <p class="kicker">Siguiente destino</p>
      <h1 class="title">${esc(step.title)}</h1>
      <div class="board">${board}</div>
      <div class="success-banner"><span class="big">🗺️</span><span>${esc(step.success)}</span></div>
      <button class="btn block teal" id="go">${esc(step.button)}</button>
    </section>`;
  }
  return `<section class="card" id="card">
    <p class="kicker">Siguiente destino</p>
    <h1 class="title">${esc(step.title)}</h1>
    ${lines(step.text)}
    <div class="board">${board}</div>
    <div class="coins">${coins}</div>
    ${nice}
    <div class="used">${[...guessed].length ? 'Usadas: ' + [...guessed].map((g) => g.toUpperCase()).join(' ') : ''}</div>
    <div class="kb">${kb}</div>
    <div class="hints">${hintList}</div>
  </section>`;
}

function guessLetter(step, l) {
  const arr = state.guessed[step.id] || (state.guessed[step.id] = []);
  if (arr.includes(l)) return;
  const before = hangmanStatus(step.phrase, new Set(arr));
  if (before.solved) return;
  arr.push(l);
  lastGuess = l;
  save();
  const after = hangmanStatus(step.phrase, new Set(arr));
  if (after.solved) { state.solved[step.id] = true; save(); confetti(); }
  else if (after.misses > before.misses) {
    render();
    const c = $('#card'); c?.classList.remove('shake'); void c?.offsetWidth; c?.classList.add('shake');
    return;
  }
  render();
}

function wireHangman(step) {
  document.querySelectorAll('.key').forEach((b) => b.addEventListener('click', () => guessLetter(step, b.dataset.k)));
}

// --- Crucigrama ---
function cwState(step) {
  return state.cw[step.id] || (state.cw[step.id] = { rows: {}, sel: 0 });
}

function viewCrossword(step) {
  const cs = cwState(step);
  const maxKey = Math.max(...step.rows.map((r) => r.key));
  const cols = Math.max(...step.rows.map((r) => maxKey - r.key + r.answer.length));
  const allRows = step.rows.every((_, i) => cs.rows[i]);
  const solved = state.solved[step.id];

  const grid = step.rows.map((r, i) => {
    const off = maxKey - r.key;
    const done = cs.rows[i];
    let cells = '';
    for (let c = 0; c < cols; c++) {
      const idx = c - off;
      if (idx < 0 || idx >= r.answer.length) { cells += `<div class="cw-cell gap"></div>`; continue; }
      const isKey = idx === r.key;
      cells += `<div class="cw-cell ${isKey ? 'key' : ''} ${done ? 'filled' : ''}">${done ? esc(r.answer[idx]) : ''}</div>`;
    }
    return `<button type="button" class="cw-row ${cs.sel === i && !allRows ? 'sel' : ''} ${done ? 'done' : ''}" data-row="${i}" aria-label="Fila ${i + 1}">
      <span class="cw-num">${i + 1}</span>${cells}</button>`;
  }).join('');

  const head = `<p class="kicker">${esc(STATIONS[step.si].place)}</p><h1 class="title">${esc(step.title)}</h1>`;
  const gridHtml = `<div class="cw ${allRows ? 'glow' : ''}" style="--cols:${cols}">${grid}</div>`;

  if (solved) {
    return `<section class="card">${head}${gridHtml}
      <div class="success-banner"><span class="big">🗝️</span><span>${esc(step.keyword)}</span></div>
      ${lines(step.success, 'poem')}
      ${messagesBlock(step)}
      <button class="btn block gold" id="go">Abrir el cofre 💰</button>
    </section>`;
  }

  if (allRows) {
    return `<section class="card" id="card">${head}${gridHtml}
      <p><strong>${esc(step.keywordPrompt)}</strong></p>
      <form class="answer" id="form" autocomplete="off">
        <input id="ans" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="La palabra clave…" aria-label="Palabra clave" />
        <button class="btn block gold" type="submit">Abrir 🗝️</button>
      </form>
      <div class="feedback" id="fb" role="status"></div>
    </section>`;
  }

  const r = step.rows[cs.sel];
  return `<section class="card" id="card">${head}
    ${lines(step.text)}
    ${gridHtml}
    <div class="clue-box"><span class="n">${cs.sel + 1}.</span> ${esc(r.clue)} <span class="len">(${r.answer.length} letras)</span></div>
    <form class="answer" id="form" autocomplete="off">
      <input id="ans" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Palabra ${cs.sel + 1}…" aria-label="Respuesta fila ${cs.sel + 1}" />
      <button class="btn block" type="submit">Comprobar</button>
    </form>
    <div class="feedback" id="fb" role="status"></div>
  </section>`;
}

function wireCrossword(step) {
  if (state.solved[step.id]) return;
  const cs = cwState(step);
  const allRows = step.rows.every((_, i) => cs.rows[i]);
  document.querySelectorAll('[data-row]').forEach((b) => b.addEventListener('click', () => {
    if (allRows) return;
    cs.sel = Number(b.dataset.row); save(); render();
  }));
  const form = $('#form'), input = $('#ans'), fb = $('#fb'), card = $('#card');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!input.value.trim()) return;
    const bad = () => {
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      fb.className = 'feedback bad'; fb.textContent = WRONG[Math.floor(Math.random() * WRONG.length)];
    };
    if (allRows) {
      if (matches(input.value, [step.keyword])) { input.blur(); solve(step); confetti(); render(); }
      else bad();
      return;
    }
    if (matches(input.value, [step.rows[cs.sel].answer])) {
      cs.rows[cs.sel] = true;
      const nextRow = step.rows.findIndex((_, i) => !cs.rows[i]);
      if (nextRow >= 0) cs.sel = nextRow;
      save();
      render();
      if (step.rows.every((_, i) => cs.rows[i])) confetti();
    } else bad();
  });
}

function viewFinale(step) {
  return `<section class="card" style="text-align:center">
    <div class="chest" aria-hidden="true">💰</div>
    <h1 class="title">${esc(step.title)}</h1>
    ${lines(step.text)}
    <div class="answer">
      <button class="btn block" id="openBp" style="background:var(--purple)">🎒 Abrir mi mochila</button>
      <button class="btn ghost block" data-reset>🔄 Reiniciar ruta</button>
    </div>
  </section>`;
}

// ---------- Render ----------
function render() {
  const step = current();
  renderTrail();
  const screen = $('#screen');
  const views = { intro: viewIntro, gate: viewIntro, riddle: viewRiddle, hangman: viewHangman, crossword: viewCrossword, finale: viewFinale };
  screen.innerHTML = (views[step.type] || viewIntro)(step) + navBar();
  lastGuess = null;
  $('#go')?.addEventListener('click', next);
  $('#navBack')?.addEventListener('click', () => go(state.pos - 1));
  $('#navLatest')?.addEventListener('click', () => go(state.maxPos));
  $('#openBp')?.addEventListener('click', openBackpack);
  if (step.type === 'riddle') wireRiddle(step);
  if (step.type === 'hangman') wireHangman(step);
  if (step.type === 'crossword') wireCrossword(step);
  if (step.type === 'finale' && !state.finaleSeen) { state.finaleSeen = true; save(); confetti(); }
  wireDocToggles(screen);
  $('#backpackCount').textContent = state.unlocked.filter((id) => MESSAGES[id]?.type !== 'pending').length;
}

// Teclado físico para el ahorcado
document.addEventListener('keydown', (e) => {
  const step = current();
  if (step.type !== 'hangman' || e.metaKey || e.ctrlKey || e.altKey) return;
  if ([...document.querySelectorAll('.overlay')].some((o) => !o.hidden)) return;
  const k = e.key.toLowerCase();
  if (/^[a-zñ]$/.test(k)) guessLetter(step, k);
});

// ---------- Mochila ----------
function openBackpack() {
  const list = $('#backpackList');
  if (!state.unlocked.length) {
    list.innerHTML = `<div class="empty">Tu mochila está vacía… ¡por ahora! 🗺️</div>`;
  } else {
    // agrupa por estación en el orden del juego
    const blocks = STATIONS.map((st) => {
      const ids = st.steps.flatMap((s) => s.unlocks || []).filter((id) => state.unlocked.includes(id));
      if (!ids.length) return '';
      return `<div class="group-label">${st.icon} ${esc(st.place)}</div><div class="messages">${ids.map(messageCard).join('')}</div>`;
    }).join('');
    list.innerHTML = blocks;
    wireDocToggles(list);
  }
  list.insertAdjacentHTML('beforeend', `<div class="bp-footer"><button class="btn ghost block" data-reset>🔄 Reiniciar ruta</button></div>`);
  $('#backpack').hidden = false;
}

function closeOverlay(el) {
  el.querySelectorAll('audio').forEach((a) => a.pause());
  el.hidden = true;
}

document.querySelectorAll('.overlay').forEach((ov) => {
  ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('[data-close]')) closeOverlay(ov); });
});
$('#backpackBtn').addEventListener('click', openBackpack);

// ---------- Reiniciar ruta (con confirmación) ----------
// El diálogo se crea aquí (no en index.html) para no depender de un index.html en caché
document.body.insertAdjacentHTML('beforeend', `
  <div class="overlay center" id="confirm" hidden>
    <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="cfTitle" aria-describedby="cfText">
      <div class="dialog-icon" aria-hidden="true">🧭</div>
      <h2 id="cfTitle">¿Estás segura?</h2>
      <p id="cfText">Vas a reiniciar la ruta desde el principio. Se borrará tu progreso, y los acertijos y mensajes volverán a quedar escondidos.</p>
      <div class="dialog-actions">
        <button class="btn teal block" id="confirmNo">No, seguir mi aventura</button>
        <button class="btn ghost block" id="confirmYes">Sí, reiniciar ruta</button>
      </div>
    </div>
  </div>`);
$('#confirm').addEventListener('click', (e) => { if (e.target.id === 'confirm') closeOverlay($('#confirm')); });
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-reset]')) $('#confirm').hidden = false;
});
$('#confirmYes').addEventListener('click', () => {
  state = fresh();
  save();
  document.querySelectorAll('.overlay').forEach(closeOverlay);
  render();
  window.scrollTo({ top: 0 });
});
$('#confirmNo').addEventListener('click', () => closeOverlay($('#confirm')));

// ---------- Modo Diego ----------
let taps = [];
$('#compass').addEventListener('click', () => {
  const now = Date.now();
  taps = taps.filter((t) => now - t < 3000).concat(now);
  if (taps.length >= 5) { taps = []; openAdmin(); }
});

let resetArmed = false;
function openAdmin() {
  const step = current();
  const answer = step.answers?.[0] || step.phrase || (step.type === 'crossword' ? step.rows.map((r) => r.answer).join(' · ') + ' → ' + step.keyword : '—');
  resetArmed = false;
  $('#adminBody').innerHTML = `
    <div class="admin-grid">
      <div class="admin-info">Paso actual: <strong>${esc(step.id)}</strong> (${state.pos + 1}/${FLOW.length})<br>Respuesta: <code>${esc(answer)}</code></div>
      ${['riddle', 'hangman', 'crossword'].includes(step.type) && !state.solved[step.id] ? `<button class="btn teal" data-a="solve">✅ Resolver este paso (desbloquea mensajes)</button>` : ''}
      <div class="row">
        <button class="btn ghost" data-a="prev">⬅ Anterior</button>
        <button class="btn ghost" data-a="next">Siguiente ➜</button>
      </div>
      <div class="row">
        ${STATIONS.map((st, i) => `<button class="btn ghost" data-a="st${i}">${st.icon} E${i + 1}</button>`).join('')}
      </div>
      <button class="btn" data-a="reset" style="background:var(--red-dk)">🔄 Reiniciar todo</button>
    </div>`;
  $('#adminBody').querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => adminAction(b.dataset.a, b)));
  $('#admin').hidden = false;
}

function adminAction(a, btn) {
  const step = current();
  const close = () => closeOverlay($('#admin'));
  if (a === 'solve') {
    if (step.type === 'hangman') {
      state.guessed[step.id] = [...new Set([...step.phrase].filter(isLetter).map(baseLetter))];
    }
    if (step.type === 'crossword') {
      const cs = cwState(step);
      step.rows.forEach((_, i) => (cs.rows[i] = true));
    }
    solve(step);
    close(); render();
  } else if (a === 'prev') { close(); go(state.pos - 1); }
  else if (a === 'next') { close(); next(); }
  else if (a.startsWith('st')) { close(); go(FLOW.findIndex((s) => s.si === Number(a.slice(2)))); }
  else if (a === 'reset') {
    if (!resetArmed) { resetArmed = true; btn.textContent = '⚠️ Toca otra vez para borrar todo'; return; }
    state = fresh(); save(); close(); render();
  }
}

if (new URLSearchParams(location.search).has('diego')) setTimeout(openAdmin, 300);

render();
prefetchLetters();
