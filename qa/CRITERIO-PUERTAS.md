# El prototipo contra las tres puertas — boletín medido

**Fecha de la corrida:** 06/08/2026 · **Instrumento:** `qa/qa-integral.mjs`
**Método:** Chromium headless sobre el build de producción servido bajo
`/sp-prototipo/`. CPU emulada 4× más lenta y red 4G (9 Mbps, 150 ms de latencia)
para las métricas de carga — "el celular que la gente tiene", no la notebook del
que construye.

> **Qué es esto y qué no.** El criterio de evaluación de la web define tres
> puertas y sostiene que la Puerta 2 *"se aprueba con números, no con criterio"*
> — y a la vez admite que, sin alguien que valide técnicamente, quien entrega se
> autoevalúa. Este boletín cierra ese hueco por el lado de casa: mide **nuestro
> propio prototipo** contra las mismas varas, con la misma herramienta, y deja
> la evidencia en `qa/qa-resultados.json`.
>
> Nada de lo que hay acá es opinión. Donde no se pudo medir, dice que no se pudo
> medir — no dice que está bien.
>
> ⚠ Este archivo es **técnico y público**. Todo lo que toca la relación con un
> proveedor —alcances, plazos, personas, evaluaciones— vive en el repo privado
> `sp-interno`, no acá.

---

## Resumen

| Puerta | Objetivo | Estado del prototipo |
|---|---|---|
| **1 · Claridad** | A | **NO PASA** — 1.5 falla, 1.4 tiene hallazgos, 1.1 no se pudo correr |
| **2 · Accesibilidad y rendimiento** | A | **Pasa lo medible**; una métrica no es medible en laboratorio |
| **3 · Craft, marca y futuro** | B+ | **NO pasa** — el punto de tokens |

> ⚠️ **La primera versión de este resumen decía que la Puerta 1 "pasa, con una
> salvedad de contenido del blog"** — mientras la tabla de abajo, en la misma
> página, marcaba 1.5 como ❌, 1.1 como pendiente y 1.4 con hallazgos. Lo detectó
> la revisión automática del PR #91.
>
> Y es un error con nombre: **el criterio dice que un solo criterio binario de la
> Puerta 1 que falle hace que la entrega no se acepte.** Un resumen que dice
> "pasa" cuando una fila obligatoria falla es exactamente el tipo de
> autocertificación que este boletín existe para impedir — y quien lea solo el
> resumen certifica una puerta cuyos propios chequeos están rojos.
>
> **Regla que deja: el resumen no puede ser más indulgente que su peor fila.**

**Las dos conclusiones incómodas:**

1. **La Puerta 1 no pasa.** El flujo que pide nombre y teléfono no nombra la
   carencia antes de pedirlos (1.5), y la prueba de las diez preguntas ni
   siquiera se pudo correr (1.1).
2. **La Puerta 3 tampoco**, por tokens. Si se le va a exigir a alguien, conviene
   saber que hoy no lo cumplimos nosotros.

---

## Puerta 1 — Claridad

> ⚠️ **Dos de estas filas eran autoevaluación en prosa.** La primera versión de
> este boletín se ponía ✅ en 1.2 y 1.3 sobre la base de que quien lo escribió
> miró la página y le pareció que estaba. Eso es exactamente el hueco que el
> criterio dice venir a cerrar. Abajo, cada fila declara **qué se verificó y
> cómo**, y las que no tienen verificación automática lo dicen.

| Criterio | Cómo se verificó | Resultado |
|---|---|---|
| **1.2** Lugar permanente para lo que NO cubrimos, sin PDF ni enlace externo | **Inspección manual** de la sección de planes: contiene exclusiones ("Para que no haya sorpresas"), carencias por servicio y el aviso de los 10 meses de parto, en la misma página, sin abrir nada | ✅ *(no automatizado)* |
| **1.3** Precio con piso real, no "consultanos" | **Inspección manual** del hero (publica "desde ₲ 238.000") + **automatizado** el recorrido del simulador hasta ver un precio sin dejar datos | ✅ *(el origen del "desde" NO está verificado — ver abajo)* |
| **1.4** Lenguaje de paciente, cero jerga | **Automatizado**: la suite busca `cartilla`, `prestación` y `práctica` en el HTML publicado de las 9 páginas | ⚠️ **3 notas del blog** dicen "práctica"; 2 tienen placeholders "a confirmar" |
| **1.5** El flujo que pide datos avisa antes de pedirlos | **Inspección del simulador** | ❌ **NO PASA** — ver abajo |
| **1.1** Prueba de las diez preguntas | **No se puede correr todavía**: la lista de las 10 preguntas reales no está cerrada. Existe material previo en `sp-interno` (`PREGUNTAS-FRECUENTES-asesores-2026-07.md`, 4 asesores) — no se arranca de cero | ⏸ Pendiente |

**Sobre 1.4:** los hallazgos son de notas del blog publicadas por el motor de
contenido, no de las páginas de producto. Se corrigen en `sp-contenido`.

**Sobre 1.3 — una afirmación que había que bajar de tono.** La versión anterior
de esta fila decía *"la suite verifica que el 'desde' del hero sale de `plans()`
y no de un número a mano"*. **Esa verificación no existe.** La suite recorre el
simulador hasta ver un precio; nadie compara el "desde" del hero contra
`plans()`. Si mañana alguien clava ese número y el tarifario se mueve, el
guardián sigue en verde y el hero miente. Lo detectó la revisión del PR #91.

Es el mismo error que este boletín vino a corregir, cometido una fila más abajo:
**decir "automatizado" sobre algo que se miró a ojo.** Queda como pendiente
concreto de la suite — es una comparación de tres líneas — y hasta que exista,
la fila dice lo que realmente hay.

### 1.5 — la fila que faltaba, y no pasa

El simulador entrega un precio y **después pide nombre y teléfono**. En ese
tramo no nombra la carencia. Alguien puede dejar sus datos entusiasmado por un
número sin saber que el servicio que le importa tiene meses de espera.

⚠️ **Y acá hay un dato que corrige el instinto** — queda escrito porque ya se
propuso una vez el arreglo equivocado. La encuesta a las cuatro asesoras
(26/07/2026, en `app/page.jsx`) dice:

| | Menciones |
|---|---|
| **Carencia** | **4 de 4** |
| Preexistencias | **ninguna** |

Lo que la gente pregunta es **carencia**, no preexistencias. Y la diferencia no
es de matiz: la carencia es dato verificado, vive por plan en `app/coverage.js`,
se puede personalizar con el plan que la persona acaba de elegir, y **resuelve**
("el reloj arranca el día que firmás, no el día que lo necesitás"). De
preexistencias hoy solo sabemos decir *"se evalúa caso por caso"*, que es
**diferir**, no responder — y una frase que difiere, puesta en el momento de la
conversión, agrega ansiedad sin agregar información.

**No se arregló en este boletín** porque toca `app/components/Simulador.jsx`,
que lleva la guarda ⚠ del "puente de venta" (HANDOFF 11w): ese archivo no se
toca sin acordarlo. Queda como el hallazgo más accionable de la Puerta 1.

---

## Puerta 2 — Accesibilidad y rendimiento

### 2.1 Contraste WCAG 2.1 AA

**0 fallas reales** en las 6 páginas de la app. El auditor recorre el DOM y
calcula sobre **estilos computados**, componiendo alfa y subiendo por los padres
— no sobre el código fuente.

> ⚠️ **Conflicto a resolver antes de que el criterio salga a un tercero.**
> El criterio propone resolver el botón turquesa con **texto navy sobre `#00BCB4`**
> (4,8:1). El sitio, desde el 25/07/2026, usa **teal profundo `#007d77` con texto
> blanco** (≈5:1) y esa regla ya está escrita: *el turquesa brillante decora, el
> profundo carga texto blanco*. Las dos pasan AA, pero son decisiones distintas.
> Si el criterio sale con la tabla actual, quien construya va a entregar botones
> que no coinciden con el sitio. **La tabla de contraste necesita una fila para
> `#007d77`.**
>
> El diagnóstico de fondo del criterio era correcto y llegó al mismo lugar que
> nosotros: `#00BCB4` con blanco da **2,37:1 medido**, y no era un botón suelto
> — era el CTA principal del header de todas las páginas.

### 2.2 Rendimiento en gama media sobre 4G

| Página | LCP (vara 2500 ms) | CLS (vara 0,1) |
|---|---|---|
| Home | **824 ms** ✅ | **0,000** ✅ |
| Simulador | **960 ms** ✅ | **0,000** ✅ |
| Planes | **668 ms** ✅ | **0,000** ✅ |
| `/que-cubre` | **912 ms** ✅ | **0,154** ❌ |

> ⚠️ **Estos números son más altos que los de la primera corrida, y los de antes
> estaban mal.** La versión anterior medía las cuatro rutas **reusando la misma
> página**: la segunda y la tercera cargaban los chunks, CSS y fuentes que la
> primera ya había dejado en caché, así que reportaban el LCP de un visitante
> **recurrente** y lo presentaban como el de alguien que entra por primera vez.
> Quien llega a `/simulador/` desde Google no tiene nada cacheado. Lo detectó la
> revisión del PR #91; ahora cada ruta se mide en un contexto nuevo. El
> simulador pasó de 668 a **960 ms** — sigue holgado, pero es el número real.

**`/que-cubre` no pasa CLS, y el diagnóstico está hecho.** El salto es de
**0,154** y ocurre en un solo evento a los **~1910 ms**. El elemento que se mueve
es la fila de chips *"Probá con:"* del buscador (`app/que-cubre/Buscador.jsx`),
que usa la tipografía display: cuando la fuente termina de cargar bajo conexión
lenta, los chips cambian de ancho, la fila rewrapea y empuja todo lo de abajo.

⚠️ **Solo se ve con throttling.** Sin CPU lenta ni 4G la misma página da **CLS
0,000** — la fuente llega antes de que nadie vea nada. Es exactamente por eso
que el criterio exige medir *"en el celular que la gente tiene"*: este defecto
es invisible en la notebook del que construye.

*No se corrigió acá: `app/que-cubre/` es territorio de otra sesión y se fusionó
hace horas. Queda el diagnóstico completo para que lo arregle quien lo
construyó — la dirección probable es reservar el alto de esa fila o revisar el
`font-display` de la tipografía display.*

Peso crítico (gzip, documento + CSS + JS): home 185 KB, resto entre 161 y 175 KB.
La vara del criterio es 2 MB de peso total; la nuestra, más estricta, es 300 KB
de contenido crítico.

> ⚠️ **INP no está medido y no se puede medir acá.** Es una métrica de **campo**:
> depende de interacciones de usuarios reales. Cualquier número que un laboratorio
> headless reporte como INP es inventado. Sale de CrUX cuando el sitio tenga
> tráfico real. **Una entrega que presente INP verde medido en laboratorio está
> presentando un dato que no existe.**

### 2.3 Teclado y foco visible

- **Foco visible: 57/57.** **Todos** los elementos interactivos visibles de la
  home cambian de estilo al recibir foco (se compara el computado antes y
  después: `outline`, `box-shadow`, `background`, `text-decoration`).

  > ⚠️ La primera versión cortaba en los **40 primeros** y reportaba verde: la
  > FAQ, el cierre y el footer quedaban fuera de la muestra. **Un guardián que
  > mira una parte y reporta como si hubiera mirado todo certifica lo que no
  > revisó** — peor que no tenerlo. Lo detectó la revisión del PR #91.
- Imágenes sin `alt` y campos sin etiqueta accesible: **0**.
- ⏸ **No cubierto:** lector de pantalla real y orden de lectura. La suite verifica
  que el foco se ve y que las etiquetas existen; no verifica que la experiencia
  con NVDA/VoiceOver sea buena. Eso necesita una persona.

### 2.4 Mobile real

Touch targets ≥44px verificados en 360, 390 y 430 px. Sin desborde horizontal.
Nada esencial detrás de `hover` (el *hover reveal* del simulador está bajo
`@media(hover:hover)` y en táctil los chips conservan su borde visible).

---

## Puerta 3 — Craft, marca y futuro

### 3.1 Tokens, no valores clavados — ❌ **NO PASA**

Medido sobre `app/`:

| | Medido | Lectura |
|---|---|---|
| Valores distintos de `border-radius` | **17** | Una escala sana tiene ~5 pasos |
| Usos de color hex escritos a mano | **970** | De **100** colores distintos |

> ⚠️ **Antes decía 618 de 84, y estaba mal por debajo.** El contador solo veía
> hex de 6 dígitos: los `#fff` y `#000` —173 en el árbol— no se contaban. Un
> guardián de tokens ciego a la forma corta puede dar verde con cientos de
> colores clavados a mano, que es justo lo que vino a impedir. Lo detectó la
> revisión del PR #91.

El criterio lo dice con precisión: *"si los colores están escritos a mano en cada
componente, esta entrega nos cuesta el doble el año que viene"*. Es exactamente
nuestra situación. Un refresh de marca hoy no sería cambiar variables — sería
recorrer 618 lugares.

**Esto no es un defecto que apareció ayer:** es la deuda de haber construido con
estilos inline para iterar rápido, que sirvió para llegar hasta acá y que ahora
cobra. La salida es una pasada de tokens (variables CSS para color, radio y
espaciado) — es trabajo mecánico, verificable y con esta misma suite como red.

### 3.2 Adhesión al sistema de marca

| Punto | Estado |
|---|---|
| Tipografía Nunito Sans (display) + Inter (lectura) | ✅ Auto-hospedadas, decisión del **20/07/2026** |
| Un solo color narrativo por pieza | ✅ El blog aplica un ancla por categoría (5 categorías, 5 anclas) |
| Formato de moneda | ⚠️ **Conflicto**: el sitio renderiza **`₲ 238.000`**; el criterio fija **`Gs. 1.250.000`** |

> **Dos cosas para cerrar antes de que el criterio se comparta:**
> 1. **`₲` vs `Gs.`** — hay que elegir uno. Es el mismo tipo de contradicción que
>    el criterio ya detectó con la tipografía, y se resuelve igual: decidir y
>    actualizar los dos lados.
> 2. **La fecha de Nunito Sans**: el criterio dice 17/07; el registro del proyecto
>    dice **20/07** (BITÁCORA cap. 29). En un documento hecho para zanjar
>    discusiones, las fechas tienen que estar bien.

### 3.3 Ninguna puerta arquitectónica cerrada

- **Guía médica con búsqueda y filtros**: la lógica ya existe en `guia/` como
  demo funcional y está especificada para backend en el ANEXO §4/§6.
- **SEO**: infraestructura completa (robots, sitemap, canonicals, OG, JSON-LD),
  apagada a propósito con `noindex`. Se enciende con un flag.
- **Agendamiento**: `/agendar` funciona hoy sin login con handoff a recepción por
  WhatsApp; el sistema real de turnos se enchufa detrás sin mover la experiencia.

---

## Lo que este boletín deja pedido

1. **Pasada de tokens** (color, radio, espaciado) — es lo único que separa al
   prototipo del B+ de la Puerta 3.
2. **Decidir `₲` vs `Gs.`** y aplicarlo en los dos lados.
3. **Agregar `#007d77` a la tabla de contraste** del criterio, o cambiar la
   decisión del sitio. Una de las dos, no las dos.
4. **Cerrar la lista de las 10 preguntas** para poder correr la Puerta 1.1 —
   hay material previo en `sp-interno`.
5. **INP**: no prometerlo hasta que haya tráfico real. Sale de campo, no de
   laboratorio.

*Para repetir la corrida: build de producción, servir `out/` bajo
`/sp-prototipo/`, y `PW_PATH=<playwright-core externo> node qa/qa-integral.mjs
http://localhost:8080/sp-prototipo`. La evidencia queda en `qa/qa-resultados.json`.*
