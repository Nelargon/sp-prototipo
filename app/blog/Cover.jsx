import { BP } from '../basePath';

// Portada de marca generada por código para las notas del blog.
// Sin foto, sin costo, sin conector: cada nota recibe una ilustración
// abstracta on-brand (degradé + formas + ícono de categoría), variada de
// forma determinística por su slug (misma nota → misma portada siempre).
// Degradación elegante: si la nota trae `cover` (una foto real en /public),
// esa manda — así el sitio nunca queda sin imagen (HANDOFF jul 2026, capa 1
// de la estrategia de imágenes). Componente puro: sirve en server y cliente.

// Cinco categorías, cinco anclas de color de la marca. La regla de
// `references/colors.md` es que Sage, Lavender y Terracota son TERRITORIOS
// NARRATIVOS, no acentos decorativos: marcan de qué habla la pieza y nunca
// se mezclan entre sí. Por eso hay exactamente cinco categorías — una por
// ancla disponible — y no una lista abierta.
//
// Cada degradé es de un solo tono (variante -900/-800 → -500 del MISMO
// color). La marca prohíbe degradés agresivos y los que cruzan colores de
// marca: "usar colores sólidos o degradés muy sutiles de un solo tono".
// Todos los hex de acá salen de la paleta oficial, ninguno inventado.
const THEMES = {
  // Turquesa — cobertura y protección: el territorio core de SP
  'Entendé tu plan':   { g1: '#006B66', g2: '#00BCB4', soft: '#80DDD8', ring: '#B3EAE7' },
  // Navy — institucional: cómo funciona el sistema de salud y el mercado
  'Salud en Paraguay': { g1: '#002A52', g2: '#003B71', soft: '#B3C7DB', ring: '#E6EDF4' },
  // Sage — prevención y vida sana
  'Prevención':        { g1: '#2E5740', g2: '#7FB396', soft: '#A9D1B4', ring: '#D4E8DB' },
  // Lavender — maternidad y primera infancia
  'Primeros años':     { g1: '#4A3A6E', g2: '#9B84C0', soft: '#C4B3DD', ring: '#E2D9EE' },
  // Terracota — madurez, trayectoria, adulto mayor
  'Vivir más años':    { g1: '#7A3D2E', g2: '#C67B5C', soft: '#DDB29C', ring: '#EBD0C0' },
};
// Turquesa: si una nota llega sin categoría, cae al color primario de marca.
const DEFAULT_THEME = { g1: '#006B66', g2: '#00BCB4', soft: '#80DDD8', ring: '#B3EAE7' };

const ICONS = {
  // file-text — leer la letra chica sin vueltas
  'Entendé tu plan':   'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8ZM14 3v5h5M9 13h6M9 17h4',
  // edificio con cruz — el sistema de salud, hospitales, trámites
  'Salud en Paraguay': 'M3 21h18M5 21V8l7-4 7 4v13M10 12h4M12 10v4M9 21v-4h6v4',
  // escudo + check — cuidarte antes de que pase
  'Prevención':        'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 11.5l2 2 4-4',
  // corazón — primera infancia, maternidad
  'Primeros años':     'M12 20.5s-7-4.6-7-9.2A3.9 3.9 0 0 1 12 8.6a3.9 3.9 0 0 1 7 2.7c0 4.6-7 9.2-7 9.2z',
  // sol sobre el horizonte — los años que vienen
  'Vivir más años':    'M12 3.5v3M6.2 6.2l2.1 2.1M3.5 14h3M17.5 14h3M15.7 8.3l2.1-2.1M8 14a4 4 0 0 1 8 0M3 18.5h18',
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
// LA FIRMA DE MARCA. Se superpone a TODA portada —ilustración generada, foto
// real, lo que venga— y es lo que hace que materiales distintos se lean como
// una sola cosa. La idea viene de mirar una publicación con 44 tarjetas donde
// convivían fotos, ilustraciones y capturas de pantalla sin verse como un
// rejunte: todas llevaban la misma ola y el mismo logo en la esquina.
//
// Es lo que nos permite sumar fotos más adelante sin rehacer nada: la foto
// entra, la firma la integra.
//
// Onda suave y logo al 85%: la marca pide serenidad, nada de degradés
// agresivos ni sombras duras. Sobre foto se agrega un velo oscuro abajo para
// que el isotipo blanco no se pierda en una imagen clara.
function Firma({ sobreFoto = false }) {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg viewBox="0 0 400 200" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {sobreFoto && (
          <>
            <defs>
              <linearGradient id="firmaVelo" x1="0" y1="0.55" x2="0" y2="1">
                <stop offset="0" stopColor="#002A52" stopOpacity="0" />
                <stop offset="1" stopColor="#002A52" stopOpacity="0.42" />
              </linearGradient>
            </defs>
            <rect y="90" width="400" height="110" fill="url(#firmaVelo)" />
          </>
        )}
        {/* Dos ondas: la de atrás más tenue, para dar profundidad sin ruido. */}
        <path d="M0 176 C 90 158, 170 190, 260 172 S 360 150, 400 162 L400 200 L0 200 Z" fill="#ffffff" opacity="0.10" />
        <path d="M0 186 C 100 170, 180 200, 268 182 S 362 162, 400 174 L400 200 L0 200 Z" fill="#ffffff" opacity="0.16" />
      </svg>
      <img
        src={`${BP}/assets/brand/isotipo-sp-white.png`}
        alt=""
        style={{ position: 'absolute', right: '4%', bottom: '6%', height: '19%', width: 'auto', opacity: 0.78 }}
      />
    </div>
  );
}

export default function Cover({ categoria, slug, cover, dato, alt = '', aspect = '2 / 1', radius = 0, eager = false }) {
  const base = { display: 'block', width: '100%', aspectRatio: aspect, borderRadius: radius };
  const decorative = !alt;

  // Foto real: manda sobre la ilustración generada. Ruta local (root-relative)
  // → prefijo con basePath (GitHub Pages sirve bajo /sp-prototipo); URL externa
  // se deja igual.
  if (cover) {
    const src = /^https?:\/\//.test(cover) ? cover : `${BP}${cover}`;
    return (
      <div style={{ ...base, position: 'relative', overflow: 'hidden' }}>
        <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
        <Firma sobreFoto />
      </div>
    );
  }

  const t = THEMES[categoria] || DEFAULT_THEME;
  const icon = ICONS[categoria] || DEFAULT_ICON;
  const sd = seed(String(slug || categoria || "sp"));
  const j = (shift, span) => ((sd >> shift) % span) - (span >> 1); // jitter centrado
  const gid = 'cov' + (sd % 100000);
  const c1x = 330 + j(3, 40),  c1y = 168 + j(6, 40);   // círculo blanco, sangra abajo-derecha
  const c2x = 80 + j(9, 44),   c2y = -12 + j(12, 34);  // círculo acento, sangra arriba-izquierda
  const rx  = 306 + j(15, 40), ry  = 30 + j(18, 34);   // anillo, arriba-derecha
  // El dato se parte en cifra + bajada por el primer salto de línea o " · ",
  // para que "36 %" domine y "del gasto en salud" acompañe sin competir.
  const datoLimpio = typeof dato === 'string' ? dato.trim() : '';
  const [cifra = '', sub = ''] = datoLimpio ? datoLimpio.split(/\s*(?:\n|·)\s*/) : [];
  // Tamaño según cuánto ocupa: una cifra corta puede ser enorme; "7 de cada
  // 100" necesita achicarse para no salirse de los 400px del viewBox.
  const tam = cifra.length <= 4 ? 66 : cifra.length <= 8 ? 48 : cifra.length <= 14 ? 34 : 26;

  // Con un dato encima, el recorte se ancla a la IZQUIERDA: el texto vive ahí
  // y `xMidYMid slice` se lo comía en las tarjetas angostas. Sin dato, se
  // centra como siempre para que la composición quede equilibrada.
  const encuadre = datoLimpio ? 'xMinYMid slice' : 'xMidYMid slice';

  const a11y = decorative
    ? { 'aria-hidden': true, focusable: 'false' }
    : { role: 'img', 'aria-label': alt };

  return (
    <div style={{ ...base, position: 'relative', overflow: 'hidden' }}>
      <svg viewBox="0 0 400 200" {...a11y} preserveAspectRatio={encuadre} style={{ display: 'block', width: '100%', height: '100%' }}>
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
      {/* EL DATO COMO PORTADA. Una nota que se titula "solo 7 de cada 100
          paraguayos tiene un plan" tiene su mejor imagen en el propio número:
          es más contundente que cualquier foto de stock, es honesto, es
          nuestro, y no lo puede copiar nadie porque el dato ES el contenido.
          Sale del campo `cover_dato` del frontmatter; sin él, la portada
          queda como antes, con el ícono de categoría. */}
      {datoLimpio ? (
        <>
          <text
            x="30" y={sub ? 108 : 124} fill="#ffffff"
            style={{ font: `800 ${tam}px var(--font-display, 'Nunito Sans'), sans-serif`, letterSpacing: '-0.02em' }}
          >{cifra}</text>
          {sub && (
            <text
              x="32" y="140" fill={t.ring} fillOpacity="0.92"
              style={{ font: "600 15px var(--font-inter, 'Inter'), sans-serif" }}
            >{sub}</text>
          )}
        </>
      ) : (
        <g transform="translate(26,110)">
          <rect width="62" height="62" rx="17" fill="#ffffff" fillOpacity="0.15" stroke="#ffffff" strokeOpacity="0.32" />
          <g transform="translate(15,15) scale(1.33)" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon} />
          </g>
        </g>
      )}
    </svg>
      <Firma />
    </div>
  );
}
