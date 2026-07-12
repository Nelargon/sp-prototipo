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
