# Cómo agregar un mensaje nuevo

Todo el contenido vive en **`config.js`**. Cada mensaje es una línea dentro de `MESSAGES`:

```js
milton: { name: 'Milton', relation: 'Hermano', type: 'pending', src: '' },
```

Para "activar" un mensaje, cambia `type` y `src`:

| Qué llegó | `type` | `src` |
|---|---|---|
| Carta en Google Docs | `'doc'` | el link del Doc (compartido como "Cualquier persona con el enlace") |
| Audio que ya convertiste a .m4a (ver abajo) | `'audio'` | `'audio/milton.m4a'` |
| Audio/video en Drive (plan B desde el celular) | `'doc'` | el link de Drive. Se muestra como botón "Abrir mensaje 💌" |

Ejemplo:

```js
milton: { name: 'Milton', relation: 'Hermano', type: 'doc', src: 'https://docs.google.com/document/d/XXXX/edit' },
```

Cuida las comillas `'...'` y la coma final.

## Desde el celular (el día del juego)
1. Abre el repo en github.com → `config.js` → ✏️ (Edit).
2. Cambia la línea del mensaje y toca **Commit changes**.
3. En 1–2 minutos queda publicado. Grace solo tiene que recargar la página y el mensaje aparece en su 🎒 mochila, sin perder su progreso.

> ⚠️ Los audios de WhatsApp (.opus) **no suenan en iPhone/iPad** si se ponen como `audio` directo. Desde el celular usa el plan B (link de Drive como `doc`). Otra opción es convertirlos antes en el computador.

## Desde el computador (audios)
```sh
./tools/convertir-audio.sh ~/Downloads/Milton.opus milton   # crea audio/milton.m4a
node test/answers.test.mjs                                   # verifica que config.js sigue sano
git add -A && git commit -m "Mensaje de Milton" && git push
```

## Crucigrama y puzzle 5
En `config.js` busca `TODO DIEGO`:
- **Crucigrama:** la letra de la fila en la posición `key` (empezando en 0) debe formar SIEMPRE de arriba hacia abajo. El test lo verifica.
- **Puzzle 5 (`e3-pareja`):** llena el texto y las respuestas y cambia `enabled: false` → `true`.

## Modo Diego (en el juego)
Toca **5 veces la brújula** (o abre la URL con `?diego=1`). Desde ahí puedes:
- ver la respuesta del paso actual,
- resolverlo (desbloquea sus mensajes),
- ir al paso anterior o al siguiente,
- saltar a una estación,
- reiniciar todo (hay que tocar dos veces).
