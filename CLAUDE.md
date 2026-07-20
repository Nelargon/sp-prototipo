# Instrucciones del proyecto (para Claude)

Leé `HANDOFF.md` primero: ahí están la visión, las decisiones tomadas y
los pendientes. Este archivo fija las reglas de trabajo permanentes.

## Regla cero: actualizarse antes de leer o trabajar (jul 2026)

Hay **varias sesiones trabajando en paralelo** sobre este proyecto, y el
clon de cada sesión es una foto del momento en que arrancó su contenedor.
Antes de leer `HANDOFF.md`/`BITACORA.md` o empezar cualquier trabajo:
`git fetch origin main && git checkout main && git pull`. Y antes de
crear una rama de trabajo, partir siempre de `origin/main` recién
traído. Una sesión que lee documentos viejos reporta un proyecto que ya
no existe y puede construir cosas que otra sesión ya construyó distinto.

## Protocolo de sesiones paralelas (jul 2026 — complementa la regla cero)

La regla cero mantiene fresca la **lectura**; estas reglas evitan que dos
sesiones se pisen al **escribir**. Valen para cualquier combinación de
sesiones, hoy y en el futuro:

- **Una rama por sesión, siempre.** Nunca dos sesiones sobre la misma
  rama (una pisa el push de la otra). Cada sesión nace de `origin/main`
  recién traído, trabaja en su rama y abre su propio PR.
- **Territorio declarado.** Cada sesión toca solo los archivos de su
  tarea. Si necesita salir de su territorio (un componente compartido,
  `app/quote.js`, la guía), lo declara en la descripción del PR.
- **Antes de fusionar, mirar los otros PRs abiertos.** Si otro PR toca
  los mismos archivos, los merges van de a uno: entra el primero, el
  segundo trae `origin/main` a su rama (`git fetch origin main &&
  git merge origin/main`), resuelve conflictos, re-verifica y recién
  entonces se fusiona. Lo mismo si `main` avanzó desde que arrancó la
  sesión, aunque no haya conflicto declarado.
- **`HANDOFF.md` y `BITACORA.md` son los puntos de choque naturales**
  (casi todos los PRs los tocan). Al resolver un conflicto ahí la regla
  es **integrar, nunca descartar**: lo que escribió otra sesión se
  conserva. La bitácora es append-only — si dos capítulos llegan con el
  mismo número, se renumeran y quedan los dos.
- **Lo decidido viaja por los archivos, no por la memoria.** Las
  sesiones no se ven entre sí; el repo es la única memoria compartida.
  Toda decisión que otra sesión va a necesitar se escribe en `HANDOFF.md`
  en el mismo PR. Y si tu tarea depende de algo que no está escrito, no
  lo asumas: preguntale al usuario.
- **Respetar las guardas ⚠ del HANDOFF** (ej. "motor de contenido — EN
  DISEÑO, no construir"): marcan trabajo que otra conversación está
  diseñando. Ignorarlas es construir en paralelo lo que otro ya está
  pensando distinto.

## Flujo git (actualizado julio 2026 — merge automático autorizado)

- Rama de trabajo → PR en borrador → verificación con Playwright →
  CI verde → **fusionar automáticamente, sin esperar "fusionalo"**
  (autorización explícita del usuario, julio 2026). Después del merge,
  confirmar que el deploy a Pages terminó en verde.
- **Excepciones — esperar confirmación del usuario antes de fusionar:**
  cambios que alteren la visión o el alcance (p. ej. ejecutar
  `PLAN-home-v2.md`), que eliminen trabajo existente, o sobre los que el
  usuario expresó dudas en la conversación.
- El `HANDOFF.md` se actualiza en el mismo PR que el cambio.

## Bitácora (detección automática — no esperar a que el usuario lo pida)

`BITACORA.md` es el libro del proyecto. Detectar solo cuándo hay
material de capítulo y escribirlo en el mismo PR. Hay capítulo cuando:

- algo que intentamos **no funcionó** y hubo que dar una vuelta;
- un bug o error enseñó algo generalizable (ej.: el blur fantasma del
  minificador → "verificá lo computado");
- se tomó o **revirtió** una decisión de diseño/visión, con su porqué;
- el usuario expresó una intuición que cambió el rumbo (citarla);
- cambió el método de trabajo.

Formato: *qué intentamos / qué pasó / qué aprendimos*. Los errores con
nombre y apellido. Nunca reescribir entradas viejas. Los "anotá en la
bitácora: …" del usuario entran con su voz.

## Reglas técnicas (destiladas de golpes reales — ver BITACORA)

- La guía se edita **solo en `guia/`**; `public/guia/` se genera en el
  build y no está en git.
- **No instalar dependencias dentro del repo** (rompe el lockfile y el
  deploy usa `npm ci`). Playwright-core se instala fuera del repo;
  Chromium en `/opt/pw-browsers/chromium`.
- Build de verificación: `NEXT_PUBLIC_BASE_PATH=/sp-prototipo npm run
  build`, servir `out/` bajo el prefijo `/sp-prototipo/`.
- Verificar **estilos computados en el navegador**, no el código fuente
  (el minificador de CSS puede descartar declaraciones en silencio; no
  encadenar funciones en `backdrop-filter` ni declarar `-webkit-` a
  mano).
- En Chromium headless, el click en links `tel:` bloquea navegaciones
  posteriores — aislar esos clicks al final de los tests.
- **Cambio de tipografía = cambio de layout** (jul 2026, BITACORA cap.
  29): la métrica de la fuente participa de todos los anchos; un
  `white-space:nowrap` que "entraba justo" puede desbordar con la fuente
  nueva. Tras cambiar una tipografía, correr el QA responsive completo.
- Con `scroll-behavior:smooth`, medir después de `window.scrollTo()` es
  medir a mitad de viaje: los tests scrollean con `behavior:'instant'`.
- Verificaciones móviles: 360 / 390 / 430 px como mínimo.
- Regla de tono: nunca "No cubierto", nunca rojo para cobertura (rojo =
  solo urgencias). Nombres en Tipo Oración.
- **Regla de etiquetas (jul 2026, de la observación del usuario)**: una
  etiqueta (kicker, badge, tag) se gana su lugar solo si hace al menos
  una de tres cosas — da un **veredicto** ("Cubierta", "Desde Plan
  Silver"), declara un **estado que la prosa no dice** ("Demostración",
  "En camino"), o te **ubica donde el título solo no alcanza** ("Quiénes
  somos", "Para asegurados"). Si repite el título de al lado, se poda.
  Colores con semántica fija: teal = cubierto/sí · dorado = oportunidad
  (nunca ausencia) · rojo = SOLO urgencias · gris = estado neutro.
- **Regla tipográfica (julio 2026, pedido del usuario): Nunito Sans es
  display, Inter es lectura.** (Nunito Sans reemplazó a Gilroy el 20 jul
  2026 — la licencia anual de Gilroy no se podía pagar; Nunito Sans es
  libre, SIL OFL, auto-hospedada: `--font-display` en la web y TTFs en
  `guia/fonts/`. La regla no cambió, solo la fuente.) Nunito Sans SOLO
  para: títulos (h1/h2/h3, `.disp`), títulos de tarjetas, botones y CTAs,
  etiquetas cortas en mayúsculas (kickers, badges), navegación y cifras
  grandes. Inter (`--font-inter`, auto-hospedada en `public/fonts/`) para
  TODO lo que se lee como oración: párrafos, copetes/bajadas,
  descripciones de tarjetas, listas, citas, tablas, bylines y metadatos
  ("Equipo SP · fecha · lectura"), notas al pie, fuentes y estados vacíos.
  Test rápido: si el texto tiene más de una línea o termina en punto, va
  en Inter; si es un titular, botón o etiqueta, Nunito Sans. Al agregar
  texto nuevo, elegir la fuente a conciencia — el default de `.body` es la
  display y se filtra solo.
- **Regla de lenguaje (julio 2026, pedido del usuario)**: escribir en el
  idioma del cliente, no en jerga de seguros. Prohibido de cara al
  usuario: "cartilla" / "cartilla viva" (→ "qué cubre", "cobertura",
  "Guía Médica"), "práctica" (→ "estudio", "consulta", "lo que
  necesitás"), "prestación" (→ "servicio"). Ante una palabra nueva,
  preguntarse: ¿la dice una familia en su casa? Si no, buscar la que sí.
- Los eventos `track()` nunca llevan nombre/teléfono/email.
