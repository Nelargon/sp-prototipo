# Salud Protegida — Ecosistema digital (prototipo)

Prototipo funcional del ecosistema web de **Salud Protegida** (medicina
prepaga, Paraguay): la web de planes, el simulador de cotización y la
**Guía Médica** rediseñada.

## 🌐 Ver en vivo

Este repo publica **dos sitios del mismo código** (ver `app/edicion.js`):

| Pieza | Link |
|---|---|
| **Edición de lanzamiento (v1)** — el sitio que SP decidió publicar desde este repo (todavía no salió) | https://nelargon.github.io/sp-prototipo/lanzamiento/ |
| Guía Médica de la v1 (red real, desde la planilla de SP) | https://nelargon.github.io/sp-prototipo/lanzamiento/guia-medica/ |
| Prototipo completo — el laboratorio | https://nelargon.github.io/sp-prototipo/ |
| Simulador | https://nelargon.github.io/sp-prototipo/simulador/ |

**La v1 publica** inicio, simulador, planes y la **Guía Médica** (desde el 23
sep 2026). «Qué cubre» ya no es una página: desde el 05/10/2026, `/que-cubre/`
redirige a `/planes/`, la única página de detalle. **No publica** agendar
turnos, Mi SP, el blog ni `/historia/`: siguen en el prototipo, cada uno con
la condición que le falta para entrar (`HANDOFF.md`, «🧩 23/10/2026»). El molde
viejo de la guía (`/guia/`, datos ilustrativos) se retiró el 23/10/2026.

**Quién la publica.** Está decidido desde el 29/09/2026 que la publique SP,
desde este repo, en Cloudflare Pages (`Nelargon/sp-interno#101`). Todavía no
salió: hoy `main` se publica en GitHub Pages (`.github/workflows/deploy.yml`),
con las dos ediciones del prototipo, en los links de arriba. Antes, la idea era
que la agencia la copiara en su sitio: eso quedó como historia. El detalle, en
el `HANDOFF.md`.

## 📖 Para entender el proyecto

- **[`HANDOFF.md`](HANDOFF.md)** ← empezá acá: la dirección, las decisiones
  tomadas y los pendientes priorizados.
- [`CLAUDE.md`](CLAUDE.md) — las reglas de trabajo permanentes (flujo git,
  reglas técnicas, de lenguaje y de tipografía). Valen para personas y para IA.
- [`BITACORA.md`](BITACORA.md) — el libro del proyecto: qué intentamos, qué
  pasó y qué aprendimos, capítulo por capítulo.
- [`docs/IMPLEMENTAR-v1.md`](docs/IMPLEMENTAR-v1.md) — cómo publicar la v1,
  en una página. Se escribió el 23/09 para la agencia; quién publica cambió el
  29/09 (lo dice la nota al principio del documento).
- [`BRANDSCRIPT.md`](BRANDSCRIPT.md) — el argumento de venta central (SB7) que
  dicta estructura y texto de toda pieza digital.
- [`PLAN-home-v2.md`](PLAN-home-v2.md) — plan de la home v2. ⚠ Su ejecución
  espera el «adelante» de Arturo.
- [`docs/ANEXO-requisitos-backend.md`](docs/ANEXO-requisitos-backend.md) —
  requisitos técnicos para la implementación real (eventos de medición,
  seguridad, modelo de datos). Vivía en `guia/` hasta el 23/10/2026.
- [`HANDOVER.md`](HANDOVER.md) — detalles técnicos de la página de planes.
- [`docs/PREVIEW.md`](docs/PREVIEW.md) — previews por rama (Cloudflare Pages).

## 🩺 Salud del sitio

Dos veces por día (05:23 y 17:23, Asunción) `.github/workflows/salud-nocturna.yml`
construye las dos ediciones, corre todas las pruebas y mira el sitio en vivo; a
las 06:00 una rutina de Claude (el Guardián) cruza los repos y arregla lo que
puede. El estado del día está en el issue fijo con la etiqueta
[`tablero-salud`](https://github.com/Nelargon/sp-prototipo/issues?q=is%3Aissue+label%3Atablero-salud).
Una página nueva sin prueba no pasa el CI (`qa/cobertura-rutas.mjs`).

## 🚀 Correr localmente

```bash
npm install
npm run dev      # → http://localhost:3000

# o el build estático completo (igual al publicado):
npm run build
cd out && python3 -m http.server 8080

# la edición de lanzamiento (la v1 pública):
NEXT_PUBLIC_BASE_PATH=/sp-prototipo/lanzamiento \
NEXT_PUBLIC_EDICION=lanzamiento npm run build
```

## 🗂️ Estructura

```
app/            # el sitio (Next.js, export estático)
app/edicion.js  # qué módulos entran en cada edición (completa / lanzamiento)
lib/            # datos y lógica compartida: Guía Médica (guia-medica.json, se
                #   regenera desde la planilla), lo que cubre cada plan, buscador, blog
datos/          # transcripciones versionadas de las grillas y el glosario
contenido/blog/ # las notas publicadas del blog (las publica el motor de contenido)
scripts/        # generadores (guía médica, glosario, prestaciones) y los hooks del build
qa/             # pruebas: qa-integral, qa-lanzamiento, cobertura-rutas, links-internos
docs/           # cómo publicar la v1, las previews por rama y el contrato de eventos (ANEXO)
docs/diseno/    # las láminas de diseño y la lección de cada una (README.md, img/, fuentes/)
```

- La **Guía Médica real** se regenera desde la planilla maestra de SP con
  `scripts/build-guia-medica.py`; nunca se edita a mano (regla de `CLAUDE.md`).
- Cada push a `main` publica automáticamente a GitHub Pages **las dos
  ediciones**; cada PR construye las dos en el CI, con las pruebas rápidas. Si
  un link queda apuntando a un módulo que la v1 no publica, el build corta.
- El material interno del proyecto (briefs, estrategia, histórico) vive en el
  repositorio **privado** `sp-interno`.

## Analítica (apagada por defecto)

El sitio no mide nada hasta que alguien lo decide. Sin variable de entorno,
`app/Analytics.jsx` no renderiza nada y no se carga un solo byte de terceros.

Medir visitantes de un sitio de SALUD es una decisión de privacidad, no una
decisión técnica: se toma a conciencia, no se hereda de un commit.

| Variable | Proveedor | Cookies | Banner de consentimiento |
|---|---|---|---|
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible **(recomendado)** | no | **no hace falta** |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 | sí | sí, y política de privacidad |

Si están las dos, gana Plausible: ante la duda, la opción que no sigue a la
persona. GA4 se configura con `anonymize_ip`.

Se enciende en el workflow de deploy, junto a `NEXT_PUBLIC_BASE_PATH`:

```yaml
env:
  NEXT_PUBLIC_BASE_PATH: /sp-prototipo
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: saludprotegida.com.py
```

**Ojo con el orden:** el sitio todavía no se indexa
(`NEXT_PUBLIC_INDEXABLE` en false). Encender la analítica antes de que el
sitio sea público mide casi nada — pero deja el contador andando desde el
día uno, que es cuando el dato empieza a valer.

Sin analítica no hay forma honesta de armar un "lo más leído": cualquier
ranking sería inventado, y eso choca con el pilar Honesta de la marca.
