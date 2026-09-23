// ============================================================
//  ARCHIVO GENERADO desde mapa-del-tesoro-28.md (flujo) y mensajes.md
//  con: node tools/sync-doc.mjs
//  Para cambiar el juego, edita esos documentos y vuelve a sincronizar.
//  (Una edición urgente aquí se pierde en la próxima sincronización
//   si no se hace también en el documento.)
// ============================================================

export const MESSAGES = {
  "sol": {
    "name": "Señora Sol",
    "relation": "Mamá",
    "type": "audio",
    "src": "audio/sol.m4a"
  },
  "sandy": {
    "name": "Sandy",
    "relation": "Hermana",
    "type": "audio",
    "src": "audio/sandy.m4a"
  },
  "yeimi": {
    "name": "Yeimi",
    "relation": "Hermana",
    "type": "pending",
    "src": ""
  },
  "monica": {
    "name": "Monica",
    "relation": "Hermana",
    "type": "audio",
    "src": "audio/monica.m4a"
  },
  "diegoHermano": {
    "name": "Diego (hermano)",
    "relation": "Hermano",
    "type": "doc",
    "src": "https://docs.google.com/document/d/1m9XK8CWki8tHuOBvwaCzvslGTdoVPHsL32jm0D8_0QQ/edit?usp=drive_link"
  },
  "milton": {
    "name": "Milton",
    "relation": "Hermano",
    "type": "doc",
    "src": "https://docs.google.com/document/d/1qaZ5kobYQp-7dO7f_P5o9hbNISq7Dg5252yQxiPsGAk/edit?usp=drive_link"
  },
  "mariaIsabel": {
    "name": "Maria Isabel",
    "relation": "Amiga",
    "type": "pending",
    "src": ""
  },
  "andres": {
    "name": "Andrés",
    "relation": "Amigo",
    "type": "pending",
    "src": ""
  },
  "brayan": {
    "name": "Brayan",
    "relation": "Amigo",
    "type": "pending",
    "src": ""
  },
  "camilo": {
    "name": "Camilo",
    "relation": "Amigo",
    "type": "pending",
    "src": ""
  },
  "elizabeth": {
    "name": "Elizabeth",
    "relation": "Amiga",
    "type": "doc",
    "src": "https://docs.google.com/document/d/1KSMSFmtPrRQRD8ucZoPwQpBHu_WS5tnfEbBjkU8v_8U/edit?usp=drive_link"
  },
  "juanEsteban": {
    "name": "Juan Esteban",
    "relation": "Sobrino",
    "type": "audio",
    "src": "audio/juan-esteban.m4a"
  },
  "isaias": {
    "name": "Isaias",
    "relation": "Sobrino",
    "type": "pending",
    "src": ""
  },
  "nicoll": {
    "name": "Nicoll",
    "relation": "Sobrina",
    "type": "pending",
    "src": ""
  },
  "samuel": {
    "name": "Samuel",
    "relation": "Sobrino",
    "type": "pending",
    "src": ""
  },
  "juanLucas": {
    "name": "Juan Lucas",
    "relation": "Sobrino",
    "type": "audio",
    "src": "audio/juan-lucas.m4a"
  },
  "naomi": {
    "name": "Naomi",
    "relation": "Sobrina",
    "type": "audio",
    "src": "audio/naomi.m4a"
  },
  "milan": {
    "name": "Milan",
    "relation": "Sobrino",
    "type": "audio",
    "src": "audio/milan.m4a"
  },
  "ivan": {
    "name": "Ivan",
    "relation": "Sobrino",
    "type": "pending",
    "src": ""
  },
  "diegoNovio": {
    "name": "Diego",
    "relation": "Tu novio",
    "type": "doc",
    "src": "https://docs.google.com/document/d/161LHnXCCjqtF7rdQM4gguISjFFJyR0RCH7s5uRjBiIY/edit?usp=drive_link"
  }
};

export const LOADER = {
  "title": "¡Vámonos, exploradora!",
  "duration": 2200,
  "phrases": [
    "Revisando el mapa… 🗺️",
    "Siguiendo las huellas… 👣",
    "Preguntándole a la brújula… 🧭",
    "Abriendo la mochila… 🎒",
    "Buscando la próxima pista… 🔍",
    "¡Vámonos, vámonos! ⛵"
  ]
};

export const STATIONS = [
  {
    "id": "causa",
    "name": "La Carta",
    "place": "La Causa",
    "icon": "🍽️",
    "loaderImage": "img/grace-exploradora.jpg",
    "steps": [
      {
        "type": "intro",
        "id": "e1-intro",
        "title": "Estación 1 · La Carta",
        "text": [
          "¡Hola, Grace la Exploradora! 🧭",
          "Hoy tu familia y las personas que te quieren te dejaron mensajes escondidos en este mapa. Aunque estén lejos, siempre te piensan y te admiran por todo lo que haces. Eres su ejemplo.",
          "La aventura empieza aquí, en esta mesa."
        ],
        "button": "¡Vámonos! 🗺️"
      },
      {
        "type": "gate",
        "id": "e1-gate",
        "title": "Algo que no está a la vista",
        "text": [
          "Para abrir la primera carta necesitas algo que no está a la vista.",
          "Pide lo que se entrega cuando alguien aún no ha elegido."
        ],
        "button": "¡Ya la tengo! 📜"
      },
      {
        "type": "riddle",
        "id": "e1-poke",
        "title": "El acertijo del menú",
        "text": [
          "Hay algo que comparten los platos de este menú",
          "y un niño que no para de preguntar.",
          "No es el hambre.",
          "No es la curiosidad."
        ],
        "display": "Poke",
        "answers": [
          "poke",
          "poké",
          "pokebowl",
          "poke bowl",
          "poke bol"
        ],
        "nearMisses": [
          {
            "answers": [
              "por que",
              "porque",
              "porqué",
              "po que",
              "poque"
            ],
            "feedback": "¡Eso dice el niño! Ahora búscalo como plato en la carta 😉"
          }
        ],
        "hints": [
          "Lee la palabra en voz alta, como la diría un niño con prisa: ¿po’qué?",
          "Viene en bowl 🥗"
        ],
        "success": "¡Poke! ¿Po’qué? ¡Porque eres la mejor exploradora!",
        "unlocks": [
          "sol"
        ]
      },
      {
        "type": "hangman",
        "id": "e1-hangman",
        "title": "El siguiente lugar está escondido",
        "text": [
          "Adivina letra por letra:"
        ],
        "phrase": "Museo de Arte Moderno de Medellín",
        "clue": "El lugar donde convive el arte, la cultura, la modernidad y Medellín.",
        "hints": {
          "2": "Se mira pero no se toca.",
          "4": "De fábrica a museo.",
          "6": "Sus siglas son M.A.M.M."
        },
        "button": "Ir a la Estación 2 · Las Obras",
        "success": "¡Lo encontraste! Próxima parada: el MAMM 🎨"
      }
    ]
  },
  {
    "id": "mamm",
    "name": "Las Obras",
    "place": "MAMM",
    "icon": "🎨",
    "loaderImage": "img/grace-exploradora.jpg",
    "steps": [
      {
        "type": "intro",
        "id": "e2-intro",
        "title": "Estación 2 · Las Obras",
        "text": [
          "Bienvenida al Museo de Arte Moderno de Medellín.",
          "Tus hermanos, amigos y sobrinos escondieron sus mensajes entre las obras. Cada respuesta está en algún rincón del museo: mira con ojos de exploradora. 🔍",
          "Consejo: ten tus audífonos a la mano 🎧"
        ],
        "button": "¡A explorar!"
      },
      {
        "type": "riddle",
        "id": "e2-andres",
        "title": "Antes del arte",
        "text": [
          "Antes de ser museo, este edificio de ladrillo fue un taller de fundición de la siderúrgica.",
          "Busca su nombre original: Talleres ________."
        ],
        "display": "Talleres Robledo",
        "answers": [
          "robledo",
          "talleres robledo"
        ],
        "nearMisses": [
          {
            "answers": [
              "simesa",
              "siderurgica de medellin"
            ],
            "feedback": "Esa era la siderúrgica. Busca el nombre del taller 🔨"
          }
        ],
        "hints": [
          "Busca la placa o los textos sobre la historia del edificio.",
          "También es el nombre de un barrio de Medellín."
        ],
        "success": "¡Talleres Robledo! De fábrica a museo.",
        "unlocks": [
          "andres",
          "brayan"
        ],
        "groupLabel": "Amigos"
      },
      {
        "type": "riddle",
        "id": "e2-mariaisabel",
        "title": "Sala D · La boca y el agua",
        "text": [
          "Hay una exposición cuyo título habla de una boca y de agua.",
          "Escribe el apellido de la artista."
        ],
        "display": "González",
        "answers": [
          "gonzalez",
          "astrid gonzalez"
        ],
        "nearMisses": [
          {
            "answers": [
              "astrid"
            ],
            "feedback": "Ese es el nombre. ¡Falta el apellido!"
          }
        ],
        "hints": [
          "Está en la Sala D.",
          "Su nombre es Astrid."
        ],
        "success": "¡Astrid González! «La boca donde el agua engendra el agua».",
        "unlocks": [
          "mariaIsabel",
          "camilo"
        ],
        "groupLabel": "Amigos"
      },
      {
        "type": "riddle",
        "id": "e2-sobrinos1",
        "title": "Sala A · Un Kim muy famoso",
        "text": [
          "Ve a la Sala A y busca el nombre completo de la artista.",
          "Su apellido esconde un nombre.",
          "Si no fuese artista… ¿qué otra cosa sería? 🤔"
        ],
        "display": "Kim Jong-un, dictador de Corea del Norte",
        "answers": [
          "kim jong un",
          "kim jong-un",
          "kimjongun",
          "jong un",
          "dictador",
          "el dictador",
          "dictador de corea del norte",
          "dictador de korea del norte",
          "lider de corea del norte",
          "presidente de corea del norte"
        ],
        "contains": [
          "jong un",
          "jongun",
          "dictador",
          "corea del norte",
          "korea del norte"
        ],
        "nearMisses": [
          {
            "answers": [
              "kim",
              "gala",
              "porras kim",
              "gala porras kim"
            ],
            "feedback": "¡Esa es la artista! Pero te pregunto por OTRO Kim muy famoso 😏"
          },
          {
            "answers": [
              "kim kardashian",
              "kardashian"
            ],
            "feedback": "Jajaja, buena, pero no. Piensa en un Kim más… autoritario 🚀"
          },
          {
            "answers": [
              "corea",
              "korea",
              "coreana",
              "coreano"
            ],
            "feedback": "¡Caliente! ¿Pero quién es y qué hace? 🚀"
          }
        ],
        "hints": [
          "La artista es Gala Porras-Kim. Piensa en otro Kim, uno que no hace arte.",
          "Gobierna Corea del Norte 🚀"
        ],
        "success": "¡Jajaja, Kim Jong-un! 🚀 Tranquila: Gala Porras-Kim hace arte, no misiles. Su obra es «El movimiento de un registro fluvial».",
        "unlocks": [
          "juanEsteban",
          "isaias",
          "nicoll",
          "samuel",
          "juanLucas"
        ],
        "groupLabel": "Sobrinos · Grupo 1"
      },
      {
        "type": "riddle",
        "id": "e2-diegohermano",
        "title": "Salas B y C · Los años de la piedra",
        "text": [
          "En «Los años de la piedra» (Salas B, C y Nave central):",
          "¿cuál es el nombre de pila del artista?"
        ],
        "display": "Pedro (Gómez-Egaña)",
        "answers": [
          "pedro"
        ],
        "nearMisses": [
          {
            "answers": [
              "gomez",
              "gomez egana",
              "pedro gomez egana",
              "gomezegana"
            ],
            "feedback": "Ese es el apellido. Te pido el nombre de pila 😉"
          }
        ],
        "hints": [
          "Busca la ficha del artista en la entrada de la exposición.",
          "Su apellido es Gómez-Egaña."
        ],
        "success": "¡Pedro Gómez-Egaña!",
        "unlocks": [
          "diegoHermano"
        ]
      },
      {
        "type": "riddle",
        "id": "e2-elizabeth",
        "title": "Lab 3 · El enjambre",
        "text": [
          "En el Lab 3 zumba un enjambre sin una sola abeja. 🐝",
          "Busca en la ficha cuántos altavoces lo forman y divide ese número entre 50."
        ],
        "answers": [
          "5",
          "cinco"
        ],
        "nearMisses": [
          {
            "answers": [
              "250",
              "doscientos cincuenta"
            ],
            "feedback": "¡Ese es el número de altavoces! Ahora divide entre 50 ➗"
          }
        ],
        "hints": [
          "La ficha de la obra de Félix Blume tiene el número.",
          "Son 250 altavoces."
        ],
        "success": "¡5! 250 altavoces zumbando para ti 🐝",
        "unlocks": [
          "elizabeth"
        ]
      },
      {
        "type": "riddle",
        "id": "e2-hermanos",
        "title": "Agua, piedra y abejas",
        "text": [
          "Toma la primera letra del APELLIDO de:",
          "💧 la artista del agua,",
          "🪨 el artista de la piedra,",
          "🐝 el artista de las abejas.",
          "Forma las tres letras."
        ],
        "display": "G · G · B",
        "answers": [
          "ggb",
          "g g b"
        ],
        "nearMisses": [
          {
            "answers": [
              "ggf",
              "agf",
              "apf",
              "apb",
              "agb"
            ],
            "feedback": "Casi: usa siempre el APELLIDO de cada artista."
          }
        ],
        "hints": [
          "Agua → Sala D · Piedra → Salas B/C · Abejas → Lab 3.",
          "Son tres letras y dos se repiten."
        ],
        "success": "¡G·G·B! González, Gómez-Egaña y Blume.",
        "unlocks": [
          "sandy",
          "yeimi",
          "milton"
        ],
        "groupLabel": "Hermanos"
      },
      {
        "type": "riddle",
        "id": "e2-sobrinos2",
        "title": "Palabras escondidas",
        "text": [
          "Piensa en las 4 exposiciones nuevas y la de la terraza.",
          "¿Cuántos títulos contienen EXACTAMENTE una de estas palabras?",
          "agua · piedra · río · abeja · peso",
          "Ojo: los sinónimos no cuentan."
        ],
        "answers": [
          "3",
          "tres"
        ],
        "nearMisses": [
          {
            "answers": [
              "4",
              "5",
              "cuatro",
              "cinco"
            ],
            "feedback": "Revisa bien: los sinónimos no cuentan 🧐"
          }
        ],
        "hints": [
          "Los 5 títulos: Los años de la piedra · La boca donde el agua engendra el agua · El movimiento de un registro fluvial · Enjambre · Sentir tu peso.",
          "«Fluvial» no es «río» y «Enjambre» no es «abeja»."
        ],
        "success": "¡Tres! Piedra, agua y peso.",
        "unlocks": [
          "naomi",
          "milan",
          "ivan"
        ],
        "groupLabel": "Sobrinos · Grupo 2"
      },
      {
        "type": "gate",
        "id": "e2-terraza",
        "title": "Ahora, sube a la terraza",
        "text": [
          "Sube a la terraza del 4.º piso. ☀️",
          "Cuando estés arriba, mirando la ciudad, toca el botón."
        ],
        "button": "¡Ya estoy en la terraza! ☀️"
      },
      {
        "type": "riddle",
        "id": "e2-monica",
        "title": "Terraza · Sentir tu peso",
        "text": [
          "Érase una vez una reina abandonada.",
          "Abandonada hasta que a su príncipe conoció.",
          "En su primera vez mirando la ciudad,",
          "¿a dónde el rey a la reina llevó?"
        ],
        "display": "La Calera",
        "answers": [
          "la calera",
          "calera"
        ],
        "contains": [
          "calera"
        ],
        "nearMisses": [
          {
            "answers": [
              "bogota"
            ],
            "feedback": "¡Casi! Más específica."
          }
        ],
        "hints": [
          "La ciudad bonita de Colombia.",
          "Huele a asado."
        ],
        "success": "¡La Calera! 🌄 Ahora mira esta ciudad desde aquí y tómate una foto en las Aves 📸",
        "unlocks": [
          "monica"
        ]
      },
      {
        "type": "hangman",
        "id": "e2-hangman",
        "title": "El último destino también está escondido",
        "text": [
          "Adivina letra por letra:"
        ],
        "phrase": "Café Pergamino",
        "clue": "Donde el café se toma con calma, a pocos pasos del arte.",
        "hints": {
          "2": "Es un café de especialidad.",
          "4": "Queda casi enfrente del museo.",
          "6": "Su nombre tiene que ver con el pergamino del café."
        },
        "button": "Ir a la Estación 3",
        "success": "¡Café Pergamino! Última parada ☕"
      }
    ]
  },
  {
    "id": "pergamino",
    "name": "",
    "place": "Pergamino",
    "icon": "☕",
    "loaderImage": "img/grace-y-diego.jpg",
    "steps": [
      {
        "type": "intro",
        "id": "e3-intro",
        "title": "Estación 3",
        "text": [
          "Última parada, exploradora. ☕",
          "Aquí las preguntas son sobre ti… y sobre nosotros.",
          "Al final del camino te espera el tesoro."
        ],
        "button": "Empezar"
      },
      {
        "type": "riddle",
        "id": "e3-bautizo",
        "title": "El día que todo empezó",
        "text": [
          "Nací un 23 de septiembre.",
          "Ese mismo día, un año después, hubo una fiesta especial donde el bollo fue el protagonista.",
          "¿Qué celebración era?"
        ],
        "answers": [
          "bautizo",
          "bautismo",
          "mi bautizo",
          "mi bautismo",
          "bautizado",
          "bautizada"
        ],
        "hints": [
          "Fue en una iglesia.",
          "Te echaron agua en la cabeza 💧"
        ],
        "success": "Correcto. Ese día cumpliste tu primer año y te bautizaron."
      },
      {
        "type": "riddle",
        "id": "e3-comunion",
        "title": "Vestida de blanco",
        "text": [
          "Tenía 10 años cuando vestí de blanco y recibí la primera comunión.",
          "Fue en octubre.",
          "¿En qué año ocurrió?"
        ],
        "answers": [
          "2008"
        ],
        "hints": [
          "Naciste en 1998.",
          "Cumpliste 10 en septiembre… y un mes después fue la comunión."
        ],
        "success": "¡Exacto! Octubre de 2008, con 10 añitos."
      },
      {
        "type": "riddle",
        "id": "e3-ninodios",
        "title": "La bicicleta que nunca llegó",
        "text": [
          "La bicicleta que nunca llegó",
          "y el vecino que jamás olvidará a la niña feliz…",
          "¿Quién fue el causante?"
        ],
        "display": "El Niño Dios",
        "answers": [
          "niño dios",
          "ninodios",
          "el niño dios",
          "niño diosito",
          "divino niño",
          "niño jesus",
          "el niño jesus"
        ],
        "contains": [
          "nino dios",
          "ninodios"
        ],
        "nearMisses": [
          {
            "answers": [
              "papa noel",
              "santa",
              "santa claus",
              "papa noel"
            ],
            "feedback": "Aquí en Colombia no trae los regalos él 🎅❌"
          }
        ],
        "hints": [
          "Pasa cada 24 de diciembre.",
          "En Colombia es él quien trae los regalos."
        ],
        "success": "Jajaja… «El Niño Dios se pasó de largo y no llegó a mi casa»."
      },
      {
        "type": "riddle",
        "id": "e3-diego",
        "title": "La felicidad absoluta",
        "text": [
          "Nombre de la persona más interesante, atractiva, inteligente, amable y carismática que tienes a tu alrededor."
        ],
        "answers": [
          "diego",
          "mi novio",
          "diego sanchez"
        ],
        "contains": [
          "diego"
        ],
        "wrongFeedback": "Hmm… ¿segura? Piénsalo mejor 😏",
        "hints": [
          "Está sentado muy cerca de ti.",
          "Empieza por D 😎"
        ],
        "success": "Respuesta correctísima. 😎❤️"
      },
      {
        "type": "riddle",
        "id": "e3-pareja",
        "enabled": false,
        "title": "Nuestro comienzo",
        "text": [
          "¿Dónde fue nuestra primera cita?"
        ],
        "answers": [
          "RESPUESTA"
        ],
        "hints": [
          "Pista 1",
          "Pista 2"
        ],
        "success": "¡Ahí empezó todo! ❤️"
      },
      {
        "type": "crossword",
        "id": "e3-crucigrama",
        "title": "El crucigrama final",
        "text": [
          "Resuelve el crucigrama. Toca una fila, lee la pista y escribe la palabra.",
          "La palabra que queda en la columna dorada es la clave final. 🗝️"
        ],
        "keyword": "SIEMPRE",
        "rows": [
          {
            "answer": "ESTRUCTURA",
            "key": 1,
            "clue": "Esqueleto que sostiene un edificio."
          },
          {
            "answer": "VIGA",
            "key": 1,
            "clue": "Elemento horizontal que resiste la flexión."
          },
          {
            "answer": "PERGAMINO",
            "key": 1,
            "clue": "El lugar donde estás sentada ahora mismo."
          },
          {
            "answer": "MEDELLIN",
            "key": 0,
            "clue": "La ciudad donde hoy celebras tus 28."
          },
          {
            "answer": "POKE",
            "key": 0,
            "clue": "El plato que habla como un niño preguntón."
          },
          {
            "answer": "CONCRETO",
            "key": 4,
            "clue": "Cemento + arena + grava + agua."
          },
          {
            "answer": "TEAMO",
            "key": 1,
            "clue": "Lo que te digo todos los días (dos palabras, juntas)."
          }
        ],
        "keywordPrompt": "Escribe la palabra de la columna dorada para abrir el cofre:",
        "success": [
          "Felicidades.",
          "Has llegado al final del mapa.",
          "Esta es mi carta para ti."
        ],
        "unlocks": [
          "diegoNovio"
        ]
      },
      {
        "type": "finale",
        "id": "finale",
        "title": "¡Feliz cumpleaños 28, Grace!",
        "text": [
          "Mi amor, espero que esta aventura haya sido de tu agrado.",
          "Espero pasar mil aventuras más a tu lado.",
          "Te amo y Feliz Cumpleaños 28"
        ],
        "image": "img/diego-y-grace.jpg",
        "note": "Todos tus mensajes quedan guardados en tu mochila 🎒 para escucharlos cuando quieras."
      }
    ]
  }
];
