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
| **1 · Claridad** | A | **Pasa**, con una salvedad de contenido del blog |
| **2 · Accesibilidad y rendimiento** | A | **Pasa lo medible**; una métrica no es medible en laboratorio |
| **3 · Craft, marca y futuro** | B+ | **NO pasa** — el punto de tokens |

**La conclusión incómoda:** el criterio pide tokens y no valores clavados. Ese es
el punto donde nuestro propio prototipo reprueba, y por bastante. Si se le va a
exigir a alguien, conviene saber que hoy no lo cumplimos nosotros.

---

## Puerta 1 — Claridad

| Criterio | Cómo se verificó | Resultado |
|---|---|---|
| **1.2** Lugar permanente para lo que NO cubrimos, sin PDF ni enlace externo | La sección de planes incluye exclusiones ("Para que no haya sorpresas"), carencias por servicio y el aviso de los 10 meses de parto, todo en la misma página | ✅ |
| **1.3** Precio con piso real, no "consultanos" | El hero publica *"planes desde ₲ 238.000"* leído de `plans()`, y el simulador da precio **sin pedir datos** | ✅ |
| **1.4** Lenguaje de paciente, cero jerga | Automatizado: la suite busca `cartilla`, `prestación` y `práctica` en el HTML publicado de las 9 páginas | ⚠️ **3 notas del blog** dicen "práctica"; 2 tienen placeholders "a confirmar" |
| **1.1** Prueba de las diez preguntas | **No se puede correr todavía**: la lista de las 10 preguntas reales no está cerrada. Existe material previo en `sp-interno` (`PREGUNTAS-FRECUENTES-asesores-2026-07.md`, 4 asesores) — no se arranca de cero | ⏸ Pendiente |

**Sobre 1.4:** los hallazgos son de notas del blog publicadas por el motor de
contenido, no de las páginas de producto. Se corrigen en `sp-contenido`.

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
| Home | **924 ms** ✅ | **0,000** ✅ |
| Simulador | **668 ms** ✅ | **0,001** ✅ |
| Planes | **324 ms** ✅ | **0,000** ✅ |

Peso crítico (gzip, documento + CSS + JS): home 185 KB, resto entre 161 y 175 KB.
La vara del criterio es 2 MB de peso total; la nuestra, más estricta, es 300 KB
de contenido crítico.

> ⚠️ **INP no está medido y no se puede medir acá.** Es una métrica de **campo**:
> depende de interacciones de usuarios reales. Cualquier número que un laboratorio
> headless reporte como INP es inventado. Sale de CrUX cuando el sitio tenga
> tráfico real. **Una entrega que presente INP verde medido en laboratorio está
> presentando un dato que no existe.**

### 2.3 Teclado y foco visible

- **Foco visible: 40/40.** Los primeros 40 elementos interactivos de la home
  cambian de estilo al recibir foco (se compara el computado antes y después:
  `outline`, `box-shadow`, `background`, `text-decoration`).
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
| Usos de color hex escritos a mano | **618** | De **84** colores distintos |

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
