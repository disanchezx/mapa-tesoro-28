# Cómo agregar un mensaje nuevo

> **Forma normal (en el computador):** edita la tabla de `mensajes.md` (junto a `mapa-del-tesoro-28.md`, fuera del repo) y corre `node tools/sync-doc.mjs`, que regenera `config.js`.
>
> **Forma urgente (desde el celular, el día del juego):** edita `config.js` directo en github.com como se explica abajo. Después, replica el cambio en `mensajes.md` para que la próxima sincronización no lo borre.

En `config.js` cada mensaje es un bloque dentro de `MESSAGES`:

```js
"milton": { "name": "Milton", "relation": "Hermano", "type": "pending", "src": "" },
```

Para "activar" un mensaje, cambia `type` y `src`:

| Qué llegó | `type` | `src` |
|---|---|---|
| Carta en Google Docs | `"doc"` | el link del Doc (compartido como "Cualquier persona con el enlace"). La app lee el texto y lo muestra como carta en pergamino. |
| Audio que ya convertiste a .m4a (ver abajo) | `"audio"` | `"audio/milton.m4a"` |
| Audio/video en Drive (plan B desde el celular) | `"doc"` | el link de Drive. Se muestra como botón "Abrir mensaje 💌" |

Ejemplo:

```js
"milton": { "name": "Milton", "relation": "Hermano", "type": "doc", "src": "https://docs.google.com/document/d/XXXX/edit" },
```

Cuida las comillas `"..."` y las comas.

## Desde el celular (el día del juego)
1. Abre el repo en github.com → `config.js` → ✏️ (Edit).
2. Cambia la línea del mensaje y toca **Commit changes**.
3. En 1–2 minutos queda publicado; el navegador puede tardar hasta ~10 min en ver la versión nueva. Grace solo tiene que recargar la página y el mensaje aparece en su 🎒 mochila, sin perder su progreso.

> ⚠️ Los audios de WhatsApp (.opus) **no suenan en iPhone/iPad** si se ponen como `audio` directo. Desde el celular usa el plan B (link de Drive como `doc`). Otra opción es convertirlos antes en el computador.

## Desde el computador (audios)
```sh
./tools/convertir-audio.sh ~/Downloads/Milton.opus milton   # crea audio/milton.m4a
node test/answers.test.mjs                                   # verifica que config.js sigue sano
git add -A && git commit -m "Mensaje de Milton" && git push
```

## Crucigrama y puzzle 5
Se editan en `mapa-del-tesoro-28.md` (sección 7, Estación 3). Después corre `node tools/sync-doc.mjs`, que avisa si la columna del crucigrama no forma SIEMPRE.

## Modo Diego (en el juego)
Toca **5 veces la brújula** (o abre la URL con `?diego=1`). Desde ahí puedes:
- ver la respuesta del paso actual,
- resolverlo (desbloquea sus mensajes),
- ir al paso anterior o al siguiente,
- saltar a una estación,
- reiniciar todo (hay que tocar dos veces).

Grace también puede reiniciar la ruta desde la mochila o desde la pantalla final. Antes de borrar le pregunta "¿Estás segura?".
