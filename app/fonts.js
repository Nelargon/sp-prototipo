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
export const inter = localFont({
  src: [{ path: '../public/fonts/Inter-Variable.ttf', weight: '100 900', style: 'normal' }],
  variable: '--font-inter',
  display: 'swap',
});
