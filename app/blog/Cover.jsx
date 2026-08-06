import { BP } from '../basePath';

// Portada de marca generada por código para las notas del blog.
// Sin foto, sin costo, sin conector: cada nota recibe una ilustración
// abstracta on-brand (degradé + formas + ícono de categoría), variada de
// forma determinística por su slug (misma nota → misma portada siempre).
// Degradación elegante: si la nota trae `cover` (una foto real en /public),
// esa manda — así el sitio nunca queda sin imagen (HANDOFF jul 2026, capa 1
// de la estrategia de imágenes). Componente puro: sirve en server y cliente.

// ⚠ UN TEMA POR SECCIÓN (6 ago 2026). Antes había dos temas —"Prevención" y
// "Entendé tu plan"— y el resto caía al DEFAULT: como 14 de las 22 notas no
// traían categoría, la mayoría del blog compartía degradé E ícono. A tres notas
// no se notaba; a 22 la grilla se leía como un solo bloque azul y ninguna nota
// se distinguía de la de al lado. Ahora el tema sale del KICKER (el eje que sí
// existe en las 22) y hay uno por cada sección que el motor de contenido usa.
// Paleta: todo dentro del rango navy↔teal de la marca — el dorado es
// "oportunidad" y el rojo es SOLO urgencias, así que ninguno entra acá.
const THEMES = {
  'Salud preventiva':     { g1: '#0a8f86', g2: '#00b3a8', soft: '#8fe6de', ring: '#c6f2ee' },
  'Decisiones':           { g1: '#00335f', g2: '#0a63b0', soft: '#8fb8e6', ring: '#c3ddf5' },
  'El dato':              { g1: '#062f4a', g2: '#0d7a86', soft: '#8fd8dd', ring: '#c3eaf0' },
  'Entendé tu cobertura': { g1: '#013a63', g2: '#1a7fb8', soft: '#9cc9e8', ring: '#cfe4f5' },
  'Entendé el sistema':   { g1: '#052744', g2: '#2a6b8f', soft: '#a3c4d6', ring: '#d0e2ec' },
  'Dónde te atendés':     { g1: '#065c63', g2: '#00a0a8', soft: '#8fe0e6', ring: '#c6f0f2' },
  'Cuánto cuesta':        { g1: '#0a4d6b', g2: '#12909b', soft: '#93dbe2', ring: '#c8edf0' },
  // Alias de la taxonomía vieja (`categoria`), por si alguna nota la usa de tema.
  'Prevención':           { g1: '#0a8f86', g2: '#00b3a8', soft: '#8fe6de', ring: '#c6f2ee' },
  'Entendé tu plan':      { g1: '#00335f', g2: '#0a63b0', soft: '#8fb8e6', ring: '#c3ddf5' },
};
const DEFAULT_THEME = { g1: '#013a63', g2: '#0a63b0', soft: '#8fb8e6', ring: '#c3ddf5' };

const ICONS = {
  // shield + check (protección / cuidarte antes)
  'Salud preventiva': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 11.5l2 2 4-4',
  // camino que se bifurca (elegir entre opciones)
  'Decisiones': 'M12 3v6M12 9l-5 5v7M12 9l5 5v7',
  // barras (una cifra que explica algo)
  'El dato': 'M3 21h18M7 21V11M12 21V5M17 21v-8',
  // file-text (leer la letra chica sin vueltas)
  'Entendé tu cobertura': 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8ZM14 3v5h5M9 13h6M9 17h4',
  // institución (cómo funciona el sistema de salud)
  'Entendé el sistema': 'M4 21V6l8-3v18M12 21h8V10l-8-3M8 10h.01M8 14h.01M16 14h.01M16 18h.01',
  // pin de mapa (dónde te atendés)
  'Dónde te atendés': 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  // billetera (lo que sale de tu bolsillo)
  'Cuánto cuesta': 'M3 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm0 0 2-3h11M16 13h.01',
  'Prevención': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 11.5l2 2 4-4',
  'Entendé tu plan': 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8ZM14 3v5h5M9 13h6M9 17h4',
};
const DEFAULT_ICON = 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z';

// Hash FNV-1a → variación determinística por slug (sin Math.random, que el
// harness bloquea y rompería el prerender estable).
function seed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// `aspect` (no `height`) para que la portada escale proporcional en cualquier
// ancho — clave en el layout de una columna (<860px), donde una altura fija
// recortaría la ilustración 2:1. `alt=''` (o ausente) = decorativa: no la
// anuncia el lector de pantalla (la tarjeta ya expone el título). `eager` para
// el hero del artículo (probable LCP); las tarjetas quedan lazy.
export default function Cover({ tema, slug, cover, alt = '', aspect = '2 / 1', radius = 0, eager = false }) {
  const base = { display: 'block', width: '100%', aspectRatio: aspect, borderRadius: radius };
  const decorative = !alt;

  // Foto real: manda sobre la ilustración generada. Ruta local (root-relative)
  // → prefijo con basePath (GitHub Pages sirve bajo /sp-prototipo); URL externa
  // se deja igual.
  if (cover) {
    const src = /^https?:\/\//.test(cover) ? cover : `${BP}${cover}`;
    return <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} style={{ ...base, objectFit: 'cover' }} />;
  }

  const t = THEMES[tema] || DEFAULT_THEME;
  const icon = ICONS[tema] || DEFAULT_ICON;
  const sd = seed(String(slug || tema || 'sp'));
  const j = (shift, span) => ((sd >> shift) % span) - (span >> 1); // jitter centrado
  const gid = 'cov' + (sd % 100000);
  const c1x = 330 + j(3, 40),  c1y = 168 + j(6, 40);   // círculo blanco, sangra abajo-derecha
  const c2x = 80 + j(9, 44),   c2y = -12 + j(12, 34);  // círculo acento, sangra arriba-izquierda
  const rx  = 306 + j(15, 40), ry  = 30 + j(18, 34);   // anillo, arriba-derecha
  const a11y = decorative
    ? { 'aria-hidden': true, focusable: 'false' }
    : { role: 'img', 'aria-label': alt };

  return (
    <svg viewBox="0 0 400 200" {...a11y} preserveAspectRatio="xMidYMid slice" style={base}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor={t.g1} />
          <stop offset="1" stopColor={t.g2} />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill={`url(#${gid})`} />
      <circle cx={c2x} cy={c2y} r="104" fill={t.soft} opacity="0.16" />
      <circle cx={c1x} cy={c1y} r="132" fill="#ffffff" opacity="0.10" />
      <circle cx={rx} cy={ry} r="58" fill="none" stroke={t.ring} strokeWidth="2" opacity="0.5" />
      <g transform="translate(26,110)">
        <rect width="62" height="62" rx="17" fill="#ffffff" fillOpacity="0.15" stroke="#ffffff" strokeOpacity="0.32" />
        <g transform="translate(15,15) scale(1.33)" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d={icon} />
        </g>
      </g>
    </svg>
  );
}
