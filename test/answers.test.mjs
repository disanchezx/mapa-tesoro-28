// node webapp/test/answers.test.mjs
import { STATIONS, MESSAGES } from '../config.js';
import { check, matches, hangmanStatus, baseLetter, isLetter } from '../logic.js';

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('✗', msg); } };

const steps = STATIONS.flatMap((s) => s.steps).filter((s) => s.enabled !== false);

// cada respuesta aceptada pasa, también en MAYÚSCULAS, con espacios extra y tildes
const shout = (s) => '  ' + s.toUpperCase() + '  ';
for (const s of steps.filter((s) => s.type === 'riddle')) {
  for (const a of s.answers) {
    ok(check(s, a) === 'ok', `${s.id}: "${a}"`);
    ok(check(s, shout(a)) === 'ok', `${s.id}: "${shout(a)}"`);
  }
  for (const nm of s.nearMisses ?? []) for (const a of nm.answers) {
    const r = check(s, a);
    ok(r !== 'ok' && r.near, `${s.id}: near-miss "${a}" -> ${JSON.stringify(r)}`);
  }
  ok(check(s, 'xyz') === 'wrong', `${s.id}: basura rechazada`);
  ok(check(s, '') === 'wrong', `${s.id}: vacío rechazado`);
  for (const id of s.unlocks ?? []) ok(MESSAGES[id], `${s.id}: mensaje "${id}" existe`);
}

// casos concretos
const byId = Object.fromEntries(steps.map((s) => [s.id, s]));
const cases = [
  ['e1-poke', 'Poké', 'ok'], ['e1-poke', 'poke bowl', 'ok'], ['e1-poke', '¿Por qué?', 'near'],
  ['e2-andres', 'Talleres Robledo', 'ok'], ['e2-mariaisabel', 'González', 'ok'],
  ['e2-sobrinos1', 'Fluvial', 'ok'], ['e2-sobrinos1', 'Kim Jong-un', 'near'],
  ['e2-diegohermano', 'Pedro', 'ok'], ['e2-diegohermano', 'Gómez-Egaña', 'near'],
  ['e2-elizabeth', '5', 'ok'], ['e2-elizabeth', '250', 'near'],
  ['e2-hermanos', 'G G B', 'ok'], ['e2-hermanos', 'ggf', 'near'], ['e2-hermanos', 'G.G.B.', 'ok'],
  ['e2-sobrinos2', '3', 'ok'], ['e2-sobrinos2', '4', 'near'],
  ['e2-monica', 'Iván Argote', 'ok'], ['e2-monica', 'iván', 'near'],
  ['e3-bautizo', 'Mi bautizo', 'ok'], ['e3-comunion', '2008', 'ok'], ['e3-comunion', '2009', 'wrong'],
  ['e3-ninodios', 'El Niño Dios', 'ok'], ['e3-ninodios', 'niñodios', 'ok'], ['e3-ninodios', 'fue el niño dios jaja', 'ok'],
  ['e3-diego', 'Diego', 'ok'], ['e3-diego', 'mi amor Diego', 'ok'], ['e3-diego', 'Brad Pitt', 'wrong'],
];
for (const [id, input, want] of cases) {
  const r = check(byId[id], input);
  const got = r === 'ok' ? 'ok' : r.near ? 'near' : 'wrong';
  ok(got === want, `${id}: "${input}" esperaba ${want}, obtuvo ${got}`);
}

// ahorcados: tildes y solución
for (const s of steps.filter((s) => s.type === 'hangman')) {
  const all = new Set([...s.phrase].filter(isLetter).map(baseLetter));
  ok(hangmanStatus(s.phrase, all).solved, `${s.id}: se resuelve con todas las letras`);
  ok(!all.has('í') && !all.has('é'), `${s.id}: tildes normalizadas`);
  ok(hangmanStatus(s.phrase, new Set(['q', 'z', 'x'])).misses === 3, `${s.id}: 3 fallos contados`);
}

// crucigrama: letra clave arma la palabra
for (const s of steps.filter((s) => s.type === 'crossword')) {
  const word = s.rows.map((r) => r.answer[r.key]).join('');
  ok(word === s.keyword, `${s.id}: columna = ${word}, esperaba ${s.keyword}`);
  ok(matches('siempre', [s.keyword]), `${s.id}: clave en minúsculas`);
  ok(matches('te amo', ['TEAMO']), 'crucigrama: "te amo" con espacio');
}

// ids únicos
const ids = steps.map((s) => s.id);
ok(new Set(ids).size === ids.length, 'ids de pasos únicos');

console.log(fails ? `\n${fails} fallo(s)` : `✓ Todo OK (${steps.length} pasos)`);
process.exit(fails ? 1 : 0);
