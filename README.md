# Salud Protegida — Planes v6 (Página viva)

A faithful [Next.js](https://nextjs.org/) implementation of the **Planes v6 — Página viva
(Gilroy completo)** design, exported from Claude Design. It reproduces the single-page
marketing site for Salud Protegida (health insurance, Paraguay) pixel-for-pixel, including
all interactivity.

## Running it

```bash
npm install
npm run dev      # dev server at http://localhost:3000
```

## Deploying

The app is configured as a **static export** (`output: 'export'` in `next.config.mjs`), so
`npm run build` writes a fully static site to `out/`.

It auto-deploys to **GitHub Pages** on every push to `main` via
`.github/workflows/deploy.yml`, served at `https://<user>.github.io/sp-prototipo/`. The
`NEXT_PUBLIC_BASE_PATH=/sp-prototipo` build env makes every asset resolve under that subpath;
locally the base path is empty so assets resolve at the root.

> One-time setup in the GitHub repo: **Settings → Pages → Build and deployment → Source:
> "GitHub Actions"**.

## What's on the page

A single scrolling page (`app/page.jsx`) with:

- **Nav** — fixed, transparent over the hero, turns solid on scroll; mobile hamburger menu.
- **Hero** — full-bleed photo with a protection gradient and subtle scroll parallax.
- **Manifiesto** — a 720vh scrollytelling section: seven lines cross-fade over three
  "chapter" photos with a Ken-Burns drift and inertia-smoothed scroll progress.
- **Cartilla viva** — type a medical practice (or pick a chip) and see what each of the
  three plans covers, side by side.
- **Comparador** — a single slider that morphs between SP Esencial / Integral / Premium
  (price, colour and coverage animate live), plus an expandable full comparison table and a
  dedicated SP Senior band.
- **Cómo funciona / Confianza** — process steps and trust stats.
- **Simulador** — a native multi-step quiz (grupo → edades → cobertura → zona → adicionales
  → resultado) that recommends a plan and animates an estimated price count-up, with a
  contact form or WhatsApp hand-off.
- **FAQ**, closing CTA, footer, and a floating WhatsApp button.

## Structure

```
app/
  layout.jsx     # <html lang="es">, metadata / OG tags, favicon
  page.jsx       # the whole page (client component) — logic + markup
  globals.css    # @font-face (Gilroy), keyframes, media queries, hover/focus utilities
public/
  assets/        # hero, logos, manifiesto photos, favicon
  fonts/         # Gilroy 400/500/600/700/800
```

### Implementation notes

- The design export drives its UI from a custom "DC" framework (React under the hood with
  `{{ }}` bindings, `sc-if`/`sc-for`). That class was ported to React hooks; the render
  logic mirrors the original `renderVals()` one-to-one.
- Style strings from the export are preserved **verbatim** via a small `css()` parser
  (`"color:red;font-size:14px"` → a React style object), so values, units and custom
  properties match exactly. The prototype's `style-hover` / `style-focus` attributes became
  utility classes in `globals.css`.
- The scroll engine (reading progress, nav solidify, hero parallax, manifiesto crossfade,
  reveal-on-scroll, price count-up) is the original DOM/`requestAnimationFrame` logic,
  ported into effects with proper cleanup.

### Known placeholders (intentional — from the design brief)

These are deliberately left as placeholders in the design and flagged for the client to fill
in with confirmed data:

- **WhatsApp number** — `WHATSAPP_NUMBER` in `app/page.jsx` is the placeholder
  `595 9XX XXX XXX`. Set the real number to point every WhatsApp CTA at `wa.me/<number>`.
- **Prices & coverage** — "cifras de referencia, sujetas a confirmación".
- **Contact details** — address / phone / email marked "a confirmar" in the footer.

---

## Original Claude Design handoff

The `chats/` transcripts and `project/` design files from the original Claude Design export
are kept in the repo for reference. `project/Planes v6 - Pagina viva (Gilroy completo).dc.html`
is the source design this implementation was built from.
