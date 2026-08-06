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

function readPost(filename) {
  const raw = fs.readFileSync(path.join(PUBLISHED_DIR, filename), 'utf8');
  const { data, content } = matter(raw);
  // Slug canónico: el del frontmatter; respaldo: nombre de archivo sin fecha.
  const fromName = filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
  return {
    slug: data.slug || fromName,
    title: data.title || fromName,
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
    intro: data.intro || data.description || '',
    minutes: data.minutes || 4,
    tags: Array.isArray(data.tags) ? data.tags : [],
    sources: Array.isArray(data.sources) ? data.sources : [],
    nota: data.nota || '',
    author: data.author || 'Equipo Salud Protegida',
    content,
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

export { CATEGORIAS } from './categorias';
