# Salud Protegida — Ecosistema digital (prototipo)

Prototipo funcional del ecosistema web de **Salud Protegida** (medicina
prepaga, Paraguay): la web de planes, el simulador de cotización y la
**Guía Médica** rediseñada.

## 🌐 Ver en vivo

| Pieza | Link |
|---|---|
| Web de planes | https://nelargon.github.io/sp-prototipo/ |
| Simulador | https://nelargon.github.io/sp-prototipo/simulador/ |
| Guía Médica | https://nelargon.github.io/sp-prototipo/guia/guia_home.html |

## 📖 Para entender el proyecto

- **[`HANDOFF.md`](HANDOFF.md)** ← empezá acá: la dirección, las decisiones
  tomadas y los pendientes priorizados.
- [`guia/ANEXO-requisitos-backend.md`](guia/ANEXO-requisitos-backend.md) —
  requisitos técnicos para la implementación real (eventos de medición,
  seguridad, modelo de datos).
- [`HANDOVER.md`](HANDOVER.md) — detalles técnicos de la página de planes.

## 🚀 Correr localmente

```bash
npm install
npm run dev      # → http://localhost:3000

# o el build estático completo (igual al publicado):
npm run build
cd out && python3 -m http.server 8080
```

## 🗂️ Estructura

```
app/           # web de planes + simulador (Next.js)
guia/          # Guía Médica — FUENTE (HTML + Tailwind, formato del proveedor)
public/guia/   # copia publicada — se genera sola en cada build, NO editar
scripts/       # sync-guia.mjs (corre automático en el prebuild)
```

- La guía se edita **solo** en `guia/`; el build la sincroniza a `public/`.
- Los datos de prestadores de la guía son **ilustrativos**: definen el molde
  al que debe llegar la base real.
- Cada push a `main` publica automáticamente a GitHub Pages; cada PR corre
  el chequeo de build (CI).
- El material interno del proyecto (briefs, plan estratégico, histórico)
  vive en el repositorio **privado** `sp-interno`.

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
