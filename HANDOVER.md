# Handover — Implementación Planes v6 (Página viva)

## 1. Qué se pidió
Implementar de verdad el diseño exportado de Claude Design
**`project/Planes v6 - Pagina viva (Gilroy completo).dc.html`** (sitio one-page de Salud
Protegida, seguro médico, Paraguay).

Decisiones ya tomadas por el usuario (no volver a preguntar):
- **Stack: Next.js** (App Router).
- **Alcance:** solo esta página, fiel al diseño, **manteniendo los placeholders** intencionales.
- **Entrega:** commit en una rama nueva, **sin PR**.

## 2. Estado actual — HECHO
- App Next.js 16 (App Router, React 19) funcionando. `npm run build` limpio.
- Página completa portada en `app/page.jsx`: nav, hero con parallax, **manifiesto
  scrollytelling 720vh**, cartilla viva, comparador con slider, cómo funciona, confianza,
  **simulador multi-paso con count-up de precio**, FAQ, cierre, footer, WhatsApp flotante.
- Verificado con Chromium headless: **0 errores de consola, 0 requests fallidos**; búsqueda
  de cartilla, morph del slider (Integral→Premium), flujo completo del simulador
  ("Para mí"+amplia → SP Premium ₲ 970.000), validación de form, progreso del manifiesto
  (5.7%→33.6%→71.2%) y nav sólido — todo funciona.
- Rama: **`implement-planes-v6`**.

## 3. Estructura
```
app/layout.jsx     # <html lang="es">, metadata/OG, favicon
app/page.jsx       # toda la página (client component): lógica + markup (~1024 líneas)
app/globals.css    # @font-face Gilroy, keyframes, media queries, clases hover/focus
public/assets/     # hero.webp, logos, manifiesto/frase-1|4|7.webp, favicon
public/fonts/      # Gilroy 400/500/600/700/800
project/, chats/   # export original de Claude Design (referencia)
```

## 4. Cómo correr
```bash
npm install
npm run dev            # http://localhost:3000
# build de prod:
npm run build && npm run start
```
Verificación E2E (opcional): usar Playwright con
`executablePath:'/opt/pw-browsers/chromium'`. Instalar Playwright **fuera** del repo para no
ensuciar `package.json`.

## 5. Claves de la implementación (para no romper la fidelidad)
- El export usa el framework "DC" (React por debajo, bindings `{{ }}`, `sc-if`/`sc-for`). Se
  portó a hooks **espejando `renderVals()` 1:1**.
- Los strings de estilo se preservan **literales** vía un parser `css("prop:val;…")` →
  objeto de estilo React. **No hand-camelCasear**: mantené el patrón `css('...')`.
- `style-hover` / `style-focus` del prototipo → clases utilitarias en `globals.css`
  (`.btn-teal`, `.sim-opt`, `.inp:focus`, etc.).
- El motor de scroll (barra de lectura, nav sólido, parallax, crossfade del manifiesto,
  reveal-on-scroll, count-up) es la lógica DOM+`requestAnimationFrame` original, portada a
  `useEffect` con cleanup.
- **Disciplina de className:** los elementos que reciben clases por JS (`.lift`, `.rv`/`.in`,
  `.rvon`, `.solid`) **no** deben tener un `className` dinámico que React reescriba, o se
  pierden en el re-render. Mantené sus `className` constantes o ausentes.

## 6. Placeholders intencionales (del brief — NO inventar datos)
- **Número de WhatsApp:** const `WHATSAPP_NUMBER` en `app/page.jsx` = `595 9XX XXX XXX`.
  Poner el real para que todos los CTA apunten a `wa.me/<número>`.
- **Precios y coberturas:** "cifras de referencia, sujetas a confirmación".
- **Contacto:** dirección/teléfono/email "a confirmar" en el footer.

## 7. Git / remoto
- Remoto: **`Nelargon/sp-prototipo`** (GitHub). Rama de trabajo: `implement-planes-v6`.
- Si en una sesión nueva el trabajo no está, reimplementar desde
  `project/Planes v6 - Pagina viva (Gilroy completo).dc.html` siguiendo este handover.

## 8. Próximos pasos sugeridos
- Cargar número real de WhatsApp + datos de contacto.
- Reemplazar precios/coberturas cuando la mesa cierre números.
- Opcional: pasar `<img>` del manifiesto a `next/image`, y revisar responsive fino en 360–420px.
