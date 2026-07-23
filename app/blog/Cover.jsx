// Portada de marca generada por código para las notas del blog.
// Sin foto, sin costo, sin conector: cada nota recibe una ilustración
// abstracta on-brand (degradé + formas + ícono de categoría), variada de
// forma determinística por su slug (misma nota → misma portada siempre).
// Degradación elegante: si la nota trae `cover` (una foto real en /public),
// esa manda — así el sitio nunca queda sin imagen (HANDOFF jul 2026, capa 1
// de la estrategia de imágenes). Componente puro: sirve en server y cliente.

const THEMES = {
  'Prevención':      { g1: '#0a8f86', g2: '#00b3a8', soft: '#8fe6de', ring: '#c6f2ee' },
  'Entendé tu plan': { g1: '#00335f', g2: '#0a63b0', soft: '#8fb8e6', ring: '#c3ddf5' },
};
const DEFAULT_THEME = { g1: '#013a63', g2: '#0a63b0', soft: '#8fb8e6', ring: '#c3ddf5' };

const ICONS = {
  // shield + check (protección / cuidarte antes)
  'Prevención': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 11.5l2 2 4-4',
  // file-text (leer la letra chica sin vueltas)
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

export default function Cover({ categoria, slug, cover, alt = '', height = 'auto', radius = 0 }) {
  const base = { display: 'block', width: '100%', height, borderRadius: radius };

  // Foto real: manda sobre la ilustración generada.
  if (cover) {
    return <img src={cover} alt={alt} loading="lazy" style={{ ...base, objectFit: 'cover' }} />;
  }

  const t = THEMES[categoria] || DEFAULT_THEME;
  const icon = ICONS[categoria] || DEFAULT_ICON;
  const sd = seed(String(slug || categoria || 'sp'));
  const j = (shift, span) => ((sd >> shift) % span) - (span >> 1); // jitter centrado
  const gid = 'cov' + (sd % 100000);
  const c1x = 330 + j(3, 40),  c1y = 168 + j(6, 40);   // círculo blanco, sangra abajo-derecha
  const c2x = 80 + j(9, 44),   c2y = -12 + j(12, 34);  // círculo acento, sangra arriba-izquierda
  const rx  = 306 + j(15, 40), ry  = 30 + j(18, 34);   // anillo, arriba-derecha

  return (
    <svg viewBox="0 0 400 200" role="img" aria-label={alt || ('Ilustración de la categoría ' + (categoria || 'blog'))} preserveAspectRatio="xMidYMid slice" style={base}>
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
