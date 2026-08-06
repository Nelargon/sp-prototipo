import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Solo esta carpeta se renderiza en /blog. La "cocina" editorial (línea
// editorial, digests de noticias, borradores generados por las Routines)
// vive en el repo privado sp-interno; publicar una nota = traer acá el
// markdown aprobado (ver contenido/README.md).
const PUBLISHED_DIR = path.join(process.cwd(), 'contenido', 'blog', 'publicados');

// Tiempo de lectura REAL, calculado del cuerpo (6 ago 2026).
// Antes se leía `minutes` del frontmatter y 21 de las 22 notas declaraban "4":
// era un default, no una medición — el metadato ocupaba lugar en cada tarjeta
// sin informar nada. 200 palabras/minuto (lectura en español, conservador).
// El valor declarado queda solo como respaldo si la nota no tiene cuerpo.
function readingMinutes(content, declared) {
  const plain = String(content)
    .replace(/```[\s\S]*?```/g, ' ')            // bloques de código
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')  // links e imágenes → su texto
    .replace(/[#>*_`|-]/g, ' ');                // marcas de markdown
  const words = plain.split(/\s+/).filter(Boolean).length;
  return words ? Math.max(1, Math.round(words / 200)) : (declared || 4);
}

// El copete se repetía TEXTUAL como primer párrafo del cuerpo (6 ago 2026).
// El frontmatter trae `intro`, que se rinde como bajada, y el markdown del
// motor de contenido arranca con exactamente el mismo texto: el lector veía
// el mismo párrafo dos veces seguidas en las 22 notas publicadas.
// Se recorta acá y no en el motor porque la duplicación es de PRESENTACIÓN:
// el markdown, leído solo, necesita su primer párrafo. Comparación normalizada
// (el markdown parte las líneas, así que hay que aplanar espacios antes) y
// solo se recorta ante coincidencia exacta — una nota que no duplica no se toca.
function stripDupIntro(content, intro) {
  if (!intro) return content;
  const norm = (s) => String(s).replace(/\s+/g, ' ').trim().toLowerCase();
  const body = String(content).replace(/^\s+/, '');
  const brk = body.search(/\n\s*\n/);
  const first = brk === -1 ? body : body.slice(0, brk);
  if (norm(first) !== norm(intro)) return content;
  return brk === -1 ? '' : body.slice(brk).replace(/^\s+/, '');
}

function readPost(filename) {
  const raw = fs.readFileSync(path.join(PUBLISHED_DIR, filename), 'utf8');
  const { data, content } = matter(raw);
  // Slug canónico: el del frontmatter; respaldo: nombre de archivo sin fecha.
  const fromName = filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
  const intro = data.intro || data.description || '';
  const kicker = data.kicker || 'Blog';
  return {
    slug: data.slug || fromName,
    title: data.title || fromName,
    kicker,
    // ⚠ TAXONOMÍA UNIFICADA (6 ago 2026). Había DOS ejes que no se hablaban:
    // el `kicker` —que se muestra en cada tarjeta, existe en las 22 notas y
    // tiene 7 valores— y `categoria`, que solo 8 notas traían (las otras 14
    // caían en "General") y que además cruza mal: el mismo kicker aparece con
    // categorías distintas ("Decisiones" salió con Prevención, con Entendé tu
    // plan y sin nada). O sea que el lector veía una etiqueta buena en la
    // tarjeta y un filtro que la ignoraba.
    // El kicker es el eje completo y consistente, así que el filtro se apoya
    // en él. `categoria` se sigue leyendo (no se rompe nada para el motor de
    // contenido) pero ya no manda en la UI. Si SP quiere menos secciones, es
    // una decisión editorial de sp-contenido, no de la web.
    tema: kicker,
    categoria: data.categoria || '',
    // Foto de portada opcional (ruta en /public). Sin ella, el blog genera una
    // portada de marca por código (app/blog/Cover.jsx): el sitio nunca queda
    // sin imagen (estrategia de imágenes, HANDOFF jul 2026 — capa 1).
    cover: data.cover || '',
    date: data.date || '',
    description: data.description || '',
    intro,
    minutes: readingMinutes(content, data.minutes),
    tags: Array.isArray(data.tags) ? data.tags : [],
    sources: Array.isArray(data.sources) ? data.sources : [],
    nota: data.nota || '',
    author: data.author || 'Equipo Salud Protegida',
    content: stripDupIntro(content, intro),
  };
}

export function getPublishedPosts() {
  if (!fs.existsSync(PUBLISHED_DIR)) return [];
  return fs
    .readdirSync(PUBLISHED_DIR)
    .filter((f) => f.endsWith('.md'))
    .map(readPost)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug) {
  return getPublishedPosts().find((p) => p.slug === slug) || null;
}

// Fecha de publicación completa ("20 de julio de 2026") para byline y tarjetas.
export function formatFecha(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('es-PY', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// Fecha corta ("6 ago") para el riel de "Lo último", donde el ancho es poco.
// Deliberadamente NO se usa tiempo relativo ("hace 2 horas", como Men's Health):
// el sitio es estático y se congelaría en el momento del build — a los tres días
// diría "hace 2 horas" de una nota vieja. Una fecha corta siempre es cierta.
export function formatFechaCorta(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('es-PY', { day: 'numeric', month: 'short', timeZone: 'UTC' }).replace('.', '');
}
