// PORTADAS DEL BLOG · CINCO ESTILOS DE PRUEBA (24/09/2026)
//
// Las técnicas de la lámina `docs/diseno/img/2026-09-24-portadas-cinco-estilos.webp`
// (docs/diseno/README.md, lección 18). NO es código del sitio: se guarda para
// que, cuando Arturo elija, la sesión que lo lleve a app/blog/Cover.jsx parta
// de acá. `portadaEstilo(dibujo, categoría, estilo)` devuelve el SVG de la
// portada completa, con su firma (onda + isotipo).
//
//   1 · Trazo blanco     papel blanco al 20 % + trazo blanco repasado, fondo -700
//   2 · Línea y acento   solo línea fina -900 y un papel en ámbar, fondo blanco
//   3 · Dos tintas       papel -200 y trazo -700 grueso, multiplicados, con grano
//   4 · Rayado           papel rayado a mano en -500, trazo navy repasado, fondo blanco
//   5 · Tiza             trazo blanco con textura de tiza, fondo -900
//
// Ojo con los filtros: el grano (3 y 5) y el borde del papel son filtros SVG.
// Sobre el TRAZO, un filtro de desplazamiento lo cortó en guiones (BITACORA
// cap. 99): el temblor del trazo va en el dibujo, no en un filtro.

import { ILUS } from './2026-09-24-portadas-dibujos.mjs';

// Escala completa por categoría (manual de marca, references/colors.md).
export const PAL = {
  'Entendé tu plan':   { c50: '#E6F7F6', c100: '#B3EAE7', c200: '#80DDD8', c500: '#00BCB4', c700: '#009690', c900: '#006B66' },
  'Salud en Paraguay': { c50: '#E6EDF4', c100: '#CCDAE8', c200: '#B3C7DB', c500: '#4F7BA6', c700: '#003B71', c900: '#002A52' },
  'Prevención':        { c50: '#EEF5F0', c100: '#D4E8DB', c200: '#A9D1B4', c500: '#7FB396', c700: '#457A5A', c900: '#2E5740' },
};
const NAVY = '#002A52', AMBAR = '#F5A623';
// El isotipo navy todavía no está en public/assets/brand: en la prueba salió del
// manual de marca (skill sp-brand-identity, assets/logos/isotipo/sp-isotipo-navy.png).
const ISO_BLANCO = '/assets/brand/isotipo-sp-white.png';
const ISO_NAVY = '/assets/brand/isotipo-sp-navy.png';
// El elemento que se lleva el acento en «Línea y acento»: lo que la nota quiere que mires.
const ACENTO = { anota: 1, palabras: 1, cerca: 1 };

let uid = 0;
const formaD = (f) => (typeof f === 'string' ? f : f.d);
const formaOff = (f, def = [5, -4]) => (typeof f === 'string' ? def : f.off);

export function portadaEstilo(nombre, cat, estilo, { firma = true } = {}) {
  const il = ILUS[nombre], p = PAL[cat], id = 'e' + uid++;
  const T = (w, extra = '') => il.trazos.map((d) => `<path d="${d}" stroke-width="${w}" ${extra}/>`).join('');
  const formas = (fill, def, extra = '') => il.formas.map((f) => `<path transform="translate(${formaOff(f, def).join(' ')})" d="${formaD(f)}" fill="${fill}" ${extra}/>`).join('');
  let bg, cuerpo, oscuro, defs = '';
  const bordePapel = `<filter id="${id}p" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter>`;

  if (estilo === 1) { // Trazo blanco: la mano de los íconos, sobre el color fuerte
    bg = p.c700; oscuro = true; defs = bordePapel;
    cuerpo = `<g filter="url(#${id}p)">${formas('#fff', undefined, 'fill-opacity="0.2"')}</g>
      <g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"><g opacity="0.4" transform="translate(0.9 0.7) rotate(0.4 200 100)">${T(2.4)}</g>${T(3.6)}</g>`;
  }
  if (estilo === 2) { // Línea y acento: línea fina, sin papel, y un solo detalle ámbar
    bg = '#FFFFFF'; oscuro = false; defs = bordePapel;
    const f = il.formas[ACENTO[nombre]];
    cuerpo = `<g filter="url(#${id}p)"><path transform="translate(${formaOff(f).join(' ')})" d="${formaD(f)}" fill="${AMBAR}" fill-opacity="0.85"/></g>
      <g fill="none" stroke="${p.c900}" stroke-linecap="round" stroke-linejoin="round">${T(2.3)}</g>`;
  }
  if (estilo === 3) { // Dos tintas: impresión de serigrafía, sin contorno, con grano y corrimiento
    bg = p.c50; oscuro = false;
    defs = `${bordePapel}<filter id="${id}g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="5" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.42" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>`;
    cuerpo = `<g filter="url(#${id}g)"><g filter="url(#${id}p)" style="mix-blend-mode:multiply">${formas(p.c200, [7, -6])}</g>
      <g fill="none" stroke="${p.c700}" stroke-linecap="round" stroke-linejoin="round" style="mix-blend-mode:multiply" opacity="0.92">${T(5.6)}</g></g>`;
  }
  if (estilo === 4) { // Rayado: el papel se rellena a mano con rayas, trazo navy
    bg = '#FFFFFF'; oscuro = false;
    defs = `<pattern id="${id}h" width="5.2" height="5.2" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><line x1="0" y1="-1" x2="0" y2="7" stroke="${p.c500}" stroke-width="1.7"/></pattern>
      <filter id="${id}w" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="9"/><feDisplacementMap in="SourceGraphic" scale="2.4"/></filter>`;
    cuerpo = `<g filter="url(#${id}w)">${formas(`url(#${id}h)`, [6, -5])}</g>
      <g fill="none" stroke="${NAVY}" stroke-linecap="round" stroke-linejoin="round"><g opacity="0.4" transform="translate(0.9 0.7) rotate(0.4 200 100)">${T(2.4)}</g>${T(3.4)}</g>`;
  }
  if (estilo === 5) { // Tiza: trazo con textura sobre el color oscuro de la categoría
    bg = p.c900; oscuro = true;
    defs = `<filter id="${id}t" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="2" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.8 2.05" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>${bordePapel}`;
    cuerpo = `<g filter="url(#${id}t)"><g filter="url(#${id}p)">${formas(p.c200, undefined, 'fill-opacity="0.34"')}</g>
      <g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">${T(4.2)}</g></g>`;
  }
  const mover = (il.mover || [0, 0]).join(' ');
  return `<svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" style="display:block;width:100%;height:100%"><defs>${defs}</defs>
  <rect width="400" height="200" fill="${bg}"/>
  <g transform="translate(${mover})">${cuerpo}</g>
  ${firma ? `<path d="M0 176 C 90 158, 170 190, 260 172 S 360 150, 400 162 L400 200 L0 200 Z" fill="${oscuro ? '#fff' : p.c100}" opacity="${oscuro ? 0.1 : 0.35}"/>
  <path d="M0 186 C 100 170, 180 200, 268 182 S 362 162, 400 174 L400 200 L0 200 Z" fill="${oscuro ? '#fff' : p.c100}" opacity="${oscuro ? 0.16 : 0.5}"/>
  <image href="${oscuro ? ISO_BLANCO : ISO_NAVY}" x="351.3" y="150" width="32.7" height="38" opacity="${oscuro ? 0.78 : 0.7}"/>` : ''}
</svg>`;
}
