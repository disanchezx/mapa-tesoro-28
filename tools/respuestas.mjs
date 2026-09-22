// Genera ../RESPUESTAS.md (fuera del repo público) con todas las respuestas del juego.
// Uso: node tools/respuestas.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { STATIONS, MESSAGES } from '../config.js';

const out = fileURLToPath(new URL('../../RESPUESTAS.md', import.meta.url));
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const list = (arr) => arr.map((a) => `\`${a}\``).join(', ');
const who = (ids = []) => ids.map((id) => {
  const m = MESSAGES[id];
  return m.type === 'pending' ? `${m.name} _(pendiente)_` : m.name;
}).join(', ');

let md = `# 🗝️ Respuestas · Mapa del Tesoro 28

> Solo para Diego. Este archivo se genera desde \`webapp/config.js\` con \`node tools/respuestas.mjs\`.
> No está en el repo público.

**Modo Diego:** toca 5 veces la brújula (o abre la URL con \`?diego=1\`) para ver la respuesta, resolver o saltar un paso.

`;

let n = 0;
STATIONS.forEach((st, si) => {
  md += `\n---\n\n## ${st.icon} Estación ${si + 1} · ${st.name} (${st.place})\n\n`;
  for (const s of st.steps) {
    if (s.enabled === false) {
      md += `### ⏸️ ${s.title} _(desactivado: falta completarlo en config.js)_\n\n`;
      continue;
    }
    if (s.type === 'intro' || s.type === 'finale') continue;
    if (s.type === 'gate') {
      md += `### ${s.title}\n\n${s.text.join(' ')}\n\n**Respuesta:** pedir la **carta** (el menú) y tocar «${s.button}».\n\n`;
      continue;
    }
    if (s.type === 'riddle') {
      n++;
      md += `### ${n}. ${s.title}\n\n`;
      md += s.text.map((l) => `> ${l}`).join('  \n') + '\n\n';
      md += `**✅ Respuesta:** **${s.display || cap(s.answers[0])}**\n\n`;
      md += `- Acepta: ${list(s.answers)}`;
      if (s.contains?.length) md += `; o cualquier frase que contenga ${list(s.contains)}`;
      md += '\n';
      md += `- No importan mayúsculas, tildes, espacios ni artículos (el, la, mi…).\n`;
      for (const nm of s.nearMisses ?? []) md += `- Casi: ${list(nm.answers)} → «${nm.feedback}»\n`;
      if (s.wrongFeedback) md += `- Cualquier otra respuesta → «${s.wrongFeedback}»\n`;
      s.hints?.forEach((h, i) => (md += `- Pista ${i + 1}: ${h}\n`));
      if (s.unlocks?.length) md += `- 💌 Desbloquea: ${who(s.unlocks)}\n`;
      md += '\n';
      continue;
    }
    if (s.type === 'hangman') {
      md += `### 🪢 Ahorcado · ${s.title}\n\n**✅ Frase:** **${s.phrase}**\n\n`;
      md += `- Letras: ${[...new Set([...s.phrase.toUpperCase().normalize('NFD').replace(/[̀-ͯ\s]/g, '')])].join(' ')}\n`;
      for (const [k, h] of Object.entries(s.hints)) md += `- Pista a los ${k} fallos: ${h}\n`;
      md += `- Límite falso: al 3.er fallo sale «Soy buena gente, sigue intentando» y el juego sigue.\n\n`;
      continue;
    }
    if (s.type === 'crossword') {
      md += `### 🧩 ${s.title}\n\n**✅ Palabra clave:** **${s.keyword}**\n\n`;
      md += `| # | Pista | Respuesta | Letra clave |\n|---|---|---|---|\n`;
      s.rows.forEach((r, i) => (md += `| ${i + 1} | ${r.clue} | **${r.answer}** | ${r.answer[r.key]} |\n`));
      md += `\nAl final se escribe **${s.keyword.toLowerCase()}** para abrir el cofre.\n`;
      if (s.unlocks?.length) md += `\n- 💌 Desbloquea: ${who(s.unlocks)}\n`;
      md += '\n';
    }
  }
});

md += `\n---\n\n## 📋 Resumen rápido\n\n| Estación | Paso | Respuesta |\n|---|---|---|\n`;
STATIONS.forEach((st, si) => {
  for (const s of st.steps.filter((s) => s.enabled !== false)) {
    const a = s.type === 'riddle' ? s.display || cap(s.answers[0])
      : s.type === 'hangman' ? s.phrase
      : s.type === 'crossword' ? s.keyword
      : s.type === 'gate' ? 'Pedir la carta' : null;
    if (a) md += `| ${si + 1} · ${st.place} | ${s.title} | **${a}** |\n`;
  }
});

writeFileSync(out, md);
console.log('✓ ' + out);
