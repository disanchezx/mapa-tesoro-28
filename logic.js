// Lógica pura (sin DOM): normalización de respuestas y utilidades del ahorcado.
// Se importa desde app.js y desde test/answers.test.mjs.

const ARTICLES = /^(el|la|los|las|mi|un|una)\s+/;

// minúsculas, sin tildes (ñ → n), sin puntuación, espacios colapsados
export function normalize(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function variants(s) {
  const n = normalize(s);
  const noArt = n.replace(ARTICLES, '');
  return new Set([n, n.replace(/ /g, ''), noArt, noArt.replace(/ /g, '')]);
}

export function matches(input, answers = []) {
  const iv = variants(input);
  if (![...iv].some(Boolean)) return false;
  return answers.some((a) => {
    const av = variants(a);
    for (const x of iv) if (x && av.has(x)) return true;
    return false;
  });
}

export function containsAny(input, words = []) {
  const n = normalize(input);
  return words.some((w) => n.includes(normalize(w)));
}

// Evalúa un acertijo: 'ok' | { near: feedback } | 'wrong'
export function check(step, input) {
  if (matches(input, step.answers) || containsAny(input, step.contains)) return 'ok';
  for (const nm of step.nearMisses ?? []) {
    if (matches(input, nm.answers)) return { near: nm.feedback };
  }
  return 'wrong';
}

// Letra base para el ahorcado: "í" → "i", pero "ñ" se mantiene
export function baseLetter(ch) {
  const l = ch.toLowerCase();
  if (l === 'ñ') return 'ñ';
  return l.normalize('NFD')[0];
}

export function isLetter(ch) {
  return /\p{L}/u.test(ch);
}

export function hangmanStatus(phrase, guessed) {
  const letters = new Set([...phrase].filter(isLetter).map(baseLetter));
  const misses = [...guessed].filter((g) => !letters.has(g)).length;
  const solved = [...letters].every((l) => guessed.has(l));
  return { misses, solved };
}
