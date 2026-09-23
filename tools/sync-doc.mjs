// Genera config.js a partir de dos documentos fuera del repo:
//   ../../mapa-del-tesoro-28.md → el flujo (solo lo que está entre <!-- APP:INICIO --> y <!-- APP:FIN -->)
//   ../../mensajes.md           → la tabla de mensajes
//
// Uso:
//   node tools/sync-doc.mjs            → escribe config.js
//   node tools/sync-doc.mjs --check    → solo valida el documento, no escribe nada
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DOC = fileURLToPath(new URL('../../mapa-del-tesoro-28.md', import.meta.url));
const MSG_DOC = fileURLToPath(new URL('../../mensajes.md', import.meta.url));
const OUT = fileURLToPath(new URL('../config.js', import.meta.url));
const CHECK = process.argv.includes('--check');

const TYPES = { intro: 'intro', puerta: 'gate', acertijo: 'riddle', ahorcado: 'hangman', crucigrama: 'crossword', final: 'finale' };
// "## Textos de la app": clave del documento → nombre en la app
const TEXT_KEYS = {
  'encabezado pequeño': 'brandSmall', 'encabezado grande': 'brandBig', 'título mochila': 'backpackTitle',
  'mochila vacía': 'backpackEmpty', 'abrir mi mochila': 'openBackpack', 'reiniciar ruta': 'reset',
  'confirmar título': 'confirmTitle', 'confirmar texto': 'confirmText', 'confirmar no': 'confirmNo', 'confirmar sí': 'confirmYes',
  'tesoro': 'treasure', 'mapa completo': 'mapComplete', 'anterior': 'back', 'volver a donde iba': 'resume',
  'seguir la aventura': 'continue', 'toca para continuar': 'skipLoader',
  'campo respuesta': 'answerPlaceholder', 'comprobar': 'check', 'respuesta': 'answerLabel', 'pedir pista': 'hint', 'error': 'wrong',
  'siguiente destino': 'nextDestination', 'intentos': 'attempts', 'usadas': 'used', 'buena gente': 'niceMsg',
  'campo palabra': 'rowPlaceholder', 'letras': 'letters', 'campo palabra clave': 'keywordPlaceholder', 'abrir': 'openKey', 'abrir el cofre': 'openChest',
  'desbloqueaste uno': 'unlockedOne', 'desbloqueaste varios': 'unlockedMany', 'mensaje secreto': 'secretName',
  'mensaje secreto subtítulo': 'secretRel', 'pendiente secreto': 'pendingSecret', 'pendiente': 'pending',
  'leer carta': 'readLetter', 'cerrar carta': 'closeLetter', 'cargando carta': 'letterLoading', 'carta no carga': 'letterError',
  'abrir en google docs': 'letterOpenDocs', 'ver en google docs': 'letterLink', 'abrir mensaje': 'openMessage',
  'ver aquí': 'viewHere', 'cerrar vista': 'closeView',
};
const TEXT_LISTS = new Set(['wrong']);
const MSG_TYPES = { audio: 'audio', doc: 'doc', carta: 'doc', drive: 'doc', pendiente: 'pending' };

const errors = [];
const fail = (line, msg) => errors.push(`línea ${line}: ${msg}`);
const failMsg = (line, msg) => errors.push(`mensajes.md, línea ${line}: ${msg}`);

// ---------- Mensajes (mensajes.md) ----------
const MESSAGES = {};
readFileSync(MSG_DOC, 'utf8').split('\n').forEach((text, i) => {
  const t = text.trim();
  const n = i + 1;
  if (!t.startsWith('|') || /^\|\s*-/.test(t) || /^\|\s*id\s*\|/i.test(t)) return;
  const cells = t.split('|').slice(1, -1).map((c) => c.trim());
  const [id, name, relation, tipo, src = ''] = cells; // la columna "Original (Drive)" es solo de referencia
  const type = MSG_TYPES[(tipo || '').toLowerCase()];
  if (!id || !name) return failMsg(n, 'fila de mensaje sin id o nombre');
  if (!type) return failMsg(n, `tipo de mensaje "${tipo}" no válido (audio, doc o pendiente)`);
  if (MESSAGES[id]) failMsg(n, `el id "${id}" está repetido`);
  const link = (src.match(/\((https?:[^)]+)\)/) || [])[1] || src.replace(/`/g, '');
  if (type !== 'pending' && !link) failMsg(n, `el mensaje "${id}" es ${tipo} pero no tiene archivo/link`);
  MESSAGES[id] = { name, relation, type, src: type === 'pending' ? '' : link };
});
if (!Object.keys(MESSAGES).length) errors.push('mensajes.md no tiene ninguna fila de mensajes');

// ---------- Lectura ----------
const all = readFileSync(DOC, 'utf8').split('\n');
const start = all.findIndex((l) => l.trim() === '<!-- APP:INICIO -->');
const end = all.findIndex((l) => l.trim() === '<!-- APP:FIN -->');
if (start < 0 || end < 0 || end < start) {
  console.error('✗ Faltan los marcadores <!-- APP:INICIO --> / <!-- APP:FIN --> en el documento.');
  process.exit(1);
}
const lines = all.slice(start + 1, end).map((text, i) => ({ text, n: start + 2 + i }));

// ---------- Bloques: pantalla de carga, estaciones y pasos ----------
const ticks = (s) => [...s.matchAll(/`([^`]*)`/g)].map((m) => m[1]);
const FIELD = /^- \*\*(.+?):\*\*\s*(.*)$/;

let section = null; // 'carga' | 'textos' | 'estacion'
const TEXTS = {};
const loaderFields = {};
const STATIONS = [];
let station = null;
let step = null;
let field = null; // campo abierto que recibe sub-líneas

function closeStep() {
  if (step) station.steps.push(step);
  step = null;
  field = null;
}

for (const { text, n } of lines) {
  const t = text.trimEnd();

  if (/^## /.test(t)) {
    if (station) { closeStep(); STATIONS.push(station); station = null; }
    if (/^## Mensajes/i.test(t)) { fail(n, 'la tabla de mensajes ahora vive en mensajes.md; borra esta sección'); section = null; continue; }
    if (/^## Pantalla de carga/i.test(t)) { section = 'carga'; field = null; continue; }
    if (/^## Textos de la app/i.test(t)) { section = 'textos'; field = null; continue; }
    const m = t.match(/^## Estación\s+\d+(?:\s*·\s*(.+))?\s*$/);
    if (!m) { fail(n, `encabezado desconocido: "${t}"`); section = null; continue; }
    section = 'estacion';
    station = { _line: n, fields: {}, name: (m[1] || '').trim(), steps: [] };
    continue;
  }

  if (section === 'carga') {
    const f = t.match(FIELD);
    if (f) { field = loaderFields[f[1].trim().toLowerCase()] = { value: f[2].trim(), sub: [], line: n }; continue; }
    if (/^\s{2,}\S/.test(text) && field) field.sub.push({ text: text.trim(), n });
    continue;
  }

  if (section === 'textos') {
    const f = t.match(FIELD);
    if (f) {
      const key = TEXT_KEYS[f[1].trim().toLowerCase()];
      field = null;
      if (!key) { fail(n, `texto "${f[1].trim()}" desconocido (las claves no se cambian, solo el texto)`); continue; }
      if (TEXT_LISTS.has(key)) { field = TEXTS[key] = []; continue; }
      if (f[2].trim()) TEXTS[key] = f[2].trim();
      continue;
    }
    if (/^\s{2,}-\s*\S/.test(text) && Array.isArray(field)) field.push(text.trim().replace(/^-\s*/, ''));
    continue;
  }

  if (section !== 'estacion') continue;

  if (/^### /.test(t)) {
    closeStep();
    step = { _line: n, fields: {} };
    continue;
  }

  const f = t.match(FIELD);
  if (f) {
    const key = f[1].trim().toLowerCase();
    const target = step ? step.fields : station.fields;
    target[key] = { value: f[2].trim(), sub: [], line: n };
    field = target[key];
    continue;
  }

  if (/^\s{2,}\S/.test(text) && field) { field.sub.push({ text: text.trim(), n }); continue; }
  if (t.trim() === '' || t.startsWith('>') || t.startsWith('<!--')) continue;
  // cualquier otra línea es texto libre (notas) y se ignora
}
if (station) { closeStep(); STATIONS.push(station); }

// ---------- Conversión a la forma de la app ----------
const quote = (sub) => sub.filter((s) => s.text.startsWith('>')).map((s) => s.text.replace(/^>\s?/, '')).filter(Boolean);

function buildStep(raw, stationName) {
  const F = raw.fields;
  const get = (k) => F[k]?.value ?? '';
  const tipo = get('tipo').toLowerCase();
  const type = TYPES[tipo];
  if (!type) { fail(raw._line, `tipo de paso "${tipo}" no válido (${Object.keys(TYPES).join(', ')})`); return null; }
  const s = { type, id: get('id') };
  if (!s.id) fail(raw._line, 'paso sin id');
  if (/^no$/i.test(get('activo'))) s.enabled = false;
  if (get('título')) s.title = get('título');
  if (F['texto']) s.text = quote(F['texto'].sub);

  if (type === 'intro' || type === 'gate') {
    s.button = get('botón');
  }
  if (type === 'riddle') {
    if (get('muestra')) s.display = get('muestra');
    s.answers = ticks(get('respuestas'));
    if (!s.answers.length) fail(F['respuestas']?.line ?? raw._line, `el acertijo "${s.id}" no tiene respuestas`);
    if (F['contiene']) s.contains = ticks(get('contiene'));
    if (F['casi']) {
      s.nearMisses = F['casi'].sub.map(({ text, n }) => {
        const [left, ...right] = text.replace(/^-\s*/, '').split('→');
        if (!right.length) fail(n, 'en "casi" usa: `respuesta`, `otra` → mensaje');
        return { answers: ticks(left), feedback: right.join('→').trim() };
      });
    }
    if (get('error')) s.wrongFeedback = get('error');
  }
  if (F['pistas']) s.hints = F['pistas'].sub.map((x) => x.text.replace(/^\d+\.\s*/, ''));
  if (type === 'hangman') {
    s.phrase = get('frase');
    if (get('pista del lugar')) s.clue = get('pista del lugar');
    s.hints = {};
    for (const { text, n } of F['pistas por fallos']?.sub ?? []) {
      const m = text.match(/^-?\s*(\d+)\s*(?:fallos?)?\s*:\s*(.+)$/);
      if (!m) { fail(n, 'en "pistas por fallos" usa: - 2: texto'); continue; }
      s.hints[m[1]] = m[2].trim();
    }
    s.button = get('botón');
  }
  if (type === 'crossword') {
    s.keyword = get('clave').replace(/`/g, '').toUpperCase();
    s.rows = (F['filas']?.sub ?? []).map(({ text, n }) => {
      const m = text.match(/^\d+\.\s*\*\*(.+?)\*\*\s*·\s*letra\s*(\d+)\s*·\s*(.+)$/);
      if (!m) { fail(n, 'fila de crucigrama: 1. **PALABRA** · letra 2 · pista'); return null; }
      return { answer: m[1].toUpperCase(), key: Number(m[2]) - 1, clue: m[3].trim() };
    }).filter(Boolean);
    const col = s.rows.map((r) => r.answer[r.key]).join('');
    if (col !== s.keyword) fail(F['filas']?.line ?? raw._line, `las letras clave forman "${col}" pero la clave es "${s.keyword}"`);
    s.keywordPrompt = get('pregunta clave');
  }
  if (F['éxito']) {
    const sub = quote(F['éxito'].sub);
    s.success = type === 'crossword' ? (sub.length ? sub : [get('éxito')]) : get('éxito');
  }
  if (F['desbloquea']) {
    s.unlocks = ticks(get('desbloquea'));
    for (const id of s.unlocks) if (!MESSAGES[id]) fail(F['desbloquea'].line, `"${id}" no está en mensajes.md`);
  }
  if (get('grupo')) s.groupLabel = get('grupo');
  if (get('imagen')) s.image = get('imagen');
  if (get('nota')) s.note = get('nota');
  return s;
}

const stationsOut = STATIONS.map((st) => {
  const get = (k) => st.fields[k]?.value ?? '';
  return {
    id: get('id'),
    name: st.name,
    place: get('lugar'),
    icon: get('icono'),
    ...(get('imagen de carga') ? { loaderImage: get('imagen de carga') } : {}),
    steps: st.steps.map((raw) => buildStep(raw, st.name)).filter(Boolean),
  };
});

const ids = stationsOut.flatMap((s) => s.steps.map((x) => x.id));
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dup.length) errors.push(`ids de pasos repetidos: ${dup.join(', ')}`);
if (!stationsOut.length) errors.push('no se encontró ninguna estación');

for (const k of TEXT_LISTS) if (Array.isArray(TEXTS[k]) && !TEXTS[k].length) delete TEXTS[k];

const LOADER = {
  title: loaderFields['título']?.value || '¡Vámonos, exploradora!',
  duration: Number(loaderFields['duración']?.value?.replace(/[^\d]/g, '')) || 2200,
  phrases: (loaderFields['frases']?.sub ?? []).map((x) => x.text.replace(/^-\s*/, '')).filter(Boolean),
};
if (!LOADER.phrases.length) LOADER.phrases = ['Revisando el mapa… 🗺️'];

if (errors.length) {
  console.error('✗ Los documentos tienen errores:\n  ' + errors.join('\n  '));
  process.exit(1);
}

const js = `// ============================================================
//  ARCHIVO GENERADO desde mapa-del-tesoro-28.md (flujo) y mensajes.md
//  con: node tools/sync-doc.mjs
//  Para cambiar el juego, edita esos documentos y vuelve a sincronizar.
//  (Una edición urgente aquí se pierde en la próxima sincronización
//   si no se hace también en el documento.)
// ============================================================

export const MESSAGES = ${JSON.stringify(MESSAGES, null, 2)};

export const LOADER = ${JSON.stringify(LOADER, null, 2)};

export const TEXTS = ${JSON.stringify(TEXTS, null, 2)};

export const STATIONS = ${JSON.stringify(stationsOut, null, 2)};
`;

const steps = stationsOut.reduce((a, s) => a + s.steps.length, 0);
if (CHECK) {
  console.log(`✓ Documento válido: ${stationsOut.length} estaciones, ${steps} pasos, ${Object.keys(MESSAGES).length} mensajes`);
} else {
  writeFileSync(OUT, js);
  console.log(`✓ config.js generado: ${stationsOut.length} estaciones, ${steps} pasos, ${Object.keys(MESSAGES).length} mensajes`);
}
