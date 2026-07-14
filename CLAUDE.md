# Instrucciones del proyecto (para Claude)

Leé `HANDOFF.md` primero: ahí están la visión, las decisiones tomadas y
los pendientes. Este archivo fija las reglas de trabajo permanentes.

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
- Verificaciones móviles: 360 / 390 / 430 px como mínimo.
- Regla de tono: nunca "No cubierto", nunca rojo para cobertura (rojo =
  solo urgencias). Nombres en Tipo Oración.
- Los eventos `track()` nunca llevan nombre/teléfono/email.
