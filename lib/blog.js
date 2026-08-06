import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { CATEGORIAS, CATEGORIA_FALLBACK, esCategoriaValida } from './categorias';

// Normaliza contra la lista cerrada para que un typo en el frontmatter no
// invente una categoría en la web. Avisa en el build en vez de fallar en
// silencio: el error se ve en los logs, no en la página publicada.
function normalizarCategoria(valor, filename) {
  const v = String(valor || '').trim();
  if (esCategoriaValida(v)) return v;
  console.warn(
    `[blog] ${filename}: categoría ${v ? `"${v}" no existe` : 'ausente'} — ` +
    `usando "${CATEGORIA_FALLBACK}". Válidas: ${CATEGORIAS.join(' · ')}`
  );
  return CATEGORIA_FALLBACK;
}



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

// El copete se repetía como primer párrafo del cuerpo (6 ago 2026).
// El frontmatter trae `intro`, que se rinde como bajada, y el markdown del
// motor de contenido arranca con el mismo texto: el lector veía el mismo
// párrafo dos veces seguidas. Se recorta acá y no en el motor porque la
// duplicación es de PRESENTACIÓN: el markdown, leído solo, necesita su
// primer párrafo.
//
// ⚠ La primera versión comparaba por IGUALDAD EXACTA y agarraba 4 de las 7
// notas que duplican. Las otras 3 repiten el copete con un retoque mínimo —un
// punto donde había dos puntos, una cláusula de lugar agregada al final— y se
// escapaban. Peor: el chequeo que escribí para verificarlo aplicaba la MISMA
// igualdad que la función, así que daba 22/22 por construcción (BITACORA
// cap. 65). Lo detectó la revisión automática del PR #86.
//
// Ahora la comparación es por PREFIJO NORMALIZADO: se bajan acentos y
// puntuación y se comparan los primeros 60 caracteres. Dos párrafos escritos
// de forma independiente no comparten sus primeros 60 caracteres; si los
// comparten, uno es reescritura del otro. El umbral de 40 evita recortar por
// un copete de una línea.
function stripDupIntro(content, intro) {
  if (!intro) return content;
  const norm = (s) => String(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // acentos
    .toLowerCase()
    .replace(/[^a-z0-9ñ ]+/g, ' ')                     // puntuación
    .replace(/\s+/g, ' ').trim();
  const body = String(content).replace(/^\s+/, '');
  const brk = body.search(/\n\s*\n/);
  const first = brk === -1 ? body : body.slice(0, brk);
  const a = norm(first), b = norm(intro);
  const n = Math.min(60, a.length, b.length);
  if (n < 40 || a.slice(0, n) !== b.slice(0, n)) return content;
  return brk === -1 ? '' : body.slice(brk).replace(/^\s+/, '');
}

function readPost(filename) {
  const raw = fs.readFileSync(path.join(PUBLISHED_DIR, filename), 'utf8');
  const { data, content } = matter(raw);
  // Slug canónico: el del frontmatter; respaldo: nombre de archivo sin fecha.
  const fromName = filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
  const intro = data.intro || data.description || '';
  return {
    slug: data.slug || fromName,
    title: data.title || fromName,
    // ⚠ `kicker` ya NO maneja la UI (6 ago 2026, al integrar dos ramas).
    // Dos sesiones encontraron el mismo problema el mismo día —14 de 22 notas
    // sin `categoria`, así que dos tercios del blog compartían portada— y lo
    // resolvieron distinto: una hizo del `kicker` el eje (7 secciones sacadas
    // de los datos existentes), la otra definió una lista CERRADA de cinco
    // categorías atadas a los colores-ancla del manual de marca y se las
    // asignó a las 22 notas. Ganó la segunda: sus colores salen de
    // `references/colors.md` (Sage, Lavender y Terracota como territorios
    // narrativos), no de un criterio inventado, y cinco categorías con
    // intención le ganan a siete sacadas de lo que había.
    // Por eso `categoria` es el ÚNICO eje: color, ícono, filtro y etiqueta.
    // El `kicker` sigue en el frontmatter como rúbrica editorial del motor de
    // contenido, pero ya no se muestra: dos etiquetas distintas sobre la misma
    // nota era justo el problema que veníamos a arreglar.
    kicker: data.kicker || 'Blog',
    // Categoría para el filtro del índice (reunión departamentos, jul 2026:
    // "separar los artículos en categorías"). Lista CERRADA de cinco — ver
    // CATEGORIAS arriba. Se normaliza acá para que un typo en el frontmatter
    // no invente una categoría en la web.
    categoria: normalizarCategoria(data.categoria, filename),
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

// Las notas que se ofrecen al final de una nota ("Seguí leyendo").
//
// POR QUÉ EXISTE: hasta el 06/08/2026 una nota terminaba en las fuentes y el
// lector quedaba sin salida — solo "volver al blog" o el CTA del simulador.
// Un blog que quiere ser referente tiene que ofrecer el próximo click.
//
// Criterio: primero las de la MISMA categoría (es lo que el lector está
// buscando en ese momento), de la más reciente a la más vieja. Si no alcanzan
// —hay categorías con una sola nota—, se completa con las más recientes de
// cualquier categoría, para que la sección nunca aparezca a medias ni vacía.
export function getRelacionadas(slug, n = 3) {
  const todas = getPublishedPosts();
  const actual = todas.find((p) => p.slug === slug);
  if (!actual) return [];

  const otras = todas.filter((p) => p.slug !== slug);
  const mismaCategoria = otras.filter((p) => p.categoria === actual.categoria);
  const resto = otras.filter((p) => p.categoria !== actual.categoria);

  return [...mismaCategoria, ...resto].slice(0, n);
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

export { CATEGORIAS } from './categorias';
