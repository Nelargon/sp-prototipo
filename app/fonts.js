import localFont from 'next/font/local';

// Nunito Sans (variable, OFL — ver public/fonts/OFL-NunitoSans.txt): la
// tipografía display de SP desde julio 2026. Reemplazó a Gilroy porque la
// licencia anual de Gilroy no se podía pagar (decisión del usuario; ver
// BITACORA). next/font emite las reglas @font-face con URLs que respetan
// basePath/assetPrefix, así las fuentes resuelven bien en local y bajo el
// subpath de GitHub Pages. El archivo es el subset latin (alfabeto español
// completo); el signo ₲ cae al fallback del sistema, igual que con Gilroy.
export const display = localFont({
  src: [{ path: '../public/fonts/NunitoSans-Variable.woff2', weight: '200 1000', style: 'normal' }],
  variable: '--font-display',
  display: 'swap',
});

// Inter (variable, OFL — ver public/fonts/OFL-Inter.txt): la tipografía de
// cuerpo que define la identidad SP (HANDOFF decisión #2, "Inter para
// cuerpo"). La display es para mirar: en lectura larga cansa; el cuerpo de
// las notas del blog se lee en Inter.
//
// ⚠ SUBSET LATIN EN WOFF2 (24/09/2026). Hasta hoy se servía el TTF completo:
// 877 KB con todos los alfabetos del mundo. En 4G llegaba ~2 s después de
// dibujada la página y, al cambiar de la fuente de reemplazo a Inter, la bajada
// de /que-cubre ganaba una línea y empujaba 27 px todo lo de abajo (CLS 0,15;
// BITACORA cap. 88). El recorte pesa 125 KB y conserva los dos ejes (wght,
// opsz), las métricas y los rasgos (tnum incluido). Rangos: latin de Google
// Fonts + monedas (₲, €) + flechas + ≤ ≥ ✓. Se regenera con fonttools:
//   pyftsubset Inter-Variable.ttf --flavor=woff2 --layout-features='*' \
//     --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,
//     U+02DC,U+0300-0304,U+0308,U+0327,U+0329,U+2000-206F,U+20A0-20CF,U+2122,
//     U+2190-21FF,U+2212,U+2215,U+2264-2265,U+2713-2714,U+FEFF,U+FFFD"
// (el TTF original es el de github.com/rsms/inter, versión variable). Un
// carácter que no esté en el recorte cae a la fuente del sistema, igual que el
// ₲ en Nunito Sans.
export const inter = localFont({
  src: [{ path: '../public/fonts/Inter-Variable-latin.woff2', weight: '100 900', style: 'normal' }],
  variable: '--font-inter',
  display: 'swap',
});
