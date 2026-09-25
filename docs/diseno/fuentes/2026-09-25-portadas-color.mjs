// PORTADAS DEL BLOG · CUATRO TRATAMIENTOS DE COLOR (25/09/2026)
//
// Arturo: «no todos los trazos tienen que ser necesariamente de un color [...]
// en algunas de las imágenes no se siente ese contraste». Lámina:
// docs/diseno/img/2026-09-25-portadas-color-*.webp (lección 30). `portadaE`
// dibuja un registro de tanda con uno de los tratamientos: hoy, tono, menta o
// claro. Todos los colores salen de la paleta oficial (app/blog/Cover.jsx y
// --sp-mint). NO es código del sitio.

// Tratamientos de color para las portadas (25/09/2026, pedido de Arturo: contraste, no todo blanco).
import fs from 'node:fs';
export const PAL = { 'Entendé tu plan': '#009690', 'Salud en Paraguay': '#003B71', 'Prevención': '#457A5A', 'Primeros años': '#6F5A95', 'Vivir más años': '#A05640' };
// Paleta oficial por categoría (app/blog/Cover.jsx).
export const TEMA = {
  'Entendé tu plan':   { g1: '#006B66', g2: '#00BCB4', soft: '#80DDD8', ring: '#B3EAE7' },
  'Salud en Paraguay': { g1: '#002A52', g2: '#003B71', soft: '#B3C7DB', ring: '#E6EDF4' },
  'Prevención':        { g1: '#2E5740', g2: '#7FB396', soft: '#A9D1B4', ring: '#D4E8DB' },
  'Primeros años':     { g1: '#4A3A6E', g2: '#9B84C0', soft: '#C4B3DD', ring: '#E2D9EE' },
  'Vivir más años':    { g1: '#7A3D2E', g2: '#C67B5C', soft: '#DDB29C', ring: '#EBD0C0' },
};
const MENTA = '#80DDD8';
// Cada tratamiento dice: fondo, línea, lleno (la idea), líneas del lleno, papel y firma.
export const TRAT = {
  hoy:    (c) => ({ bg: PAL[c], linea: '#fff', lleno: '#fff', llenoLin: PAL[c], papel: ['#fff', 0.2], firma: '#fff' }),
  tono:   (c) => ({ bg: TEMA[c].g1, linea: '#fff', lleno: TEMA[c].soft, llenoLin: TEMA[c].g1, papel: ['#fff', 0.14], firma: '#fff' }),
  menta:  (c) => ({ bg: TEMA[c].g1, linea: '#fff', lleno: MENTA, llenoLin: TEMA[c].g1, papel: ['#fff', 0.14], firma: '#fff' }),
  claro:  (c) => ({ bg: TEMA[c].ring, linea: TEMA[c].g1, lleno: TEMA[c].g2, llenoLin: TEMA[c].ring, papel: ['#fff', 0.95], firma: TEMA[c].g1 }),
};
const ISO_BLANCO = 'data:image/png;base64,' + fs.readFileSync(new URL('../../../public/assets/brand/isotipo-sp-white.png', import.meta.url)).toString('base64');
let uid = 0;
export function portadaE(il, cat, trat = 'hoy', { firma = true } = {}) {
  const t = TRAT[trat](cat), id = 'k' + uid++;
  const S = (arr, w, c) => arr.map((d) => `<path d="${d}" stroke="${c}" stroke-width="${w}"/>`).join('');
  return `<svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" style="display:block;width:100%;height:100%">
  <defs><filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter>
  <filter id="${id}i"><feFlood flood-color="${t.firma}"/><feComposite in2="SourceAlpha" operator="in"/></filter></defs>
  <rect width="400" height="200" fill="${t.bg}"/>
  <g filter="url(#${id})" fill="${t.papel[0]}" fill-opacity="${t.papel[1]}">${il.formas.map((d) => `<path d="${d}" transform="translate(4 -3)"/>`).join('')}</g>
  ${il.llenos.map((l) => `<path d="${l.d}" fill="${t.lleno}" filter="url(#${id})"/>`).join('')}
  <g fill="none" stroke-linecap="round" stroke-linejoin="round"><g opacity="0.4" transform="translate(0.9 0.7) rotate(0.4 200 100)">${S(il.trazos, 2.4, t.linea)}</g>${S(il.trazos, 3.4, t.linea)}</g>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">${il.llenos.map((l) => S(l.lineas, 3.2, t.llenoLin)).join('')}</g>
  ${firma ? `<path d="M0 176 C 90 158, 170 190, 260 172 S 360 150, 400 162 L400 200 L0 200 Z" fill="${t.firma}" opacity="0.1"/>
  <path d="M0 186 C 100 170, 180 200, 268 182 S 362 162, 400 174 L400 200 L0 200 Z" fill="${t.firma}" opacity="0.16"/>
  <image href="${ISO_BLANCO}" x="351.3" y="150" width="32.7" height="38" opacity="0.78" ${t.firma !== '#fff' ? `filter="url(#${id}i)"` : ''}/>` : ''}
</svg>`;
}
