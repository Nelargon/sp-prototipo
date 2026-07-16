import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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

// Las notas muestran mes y año ("Julio 2026"), como las originales.
export function formatMonthYear(iso) {
  const [y, m] = String(iso).split('-').map(Number);
  if (!y || !m) return String(iso);
  const mes = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('es-PY', { month: 'long', timeZone: 'UTC' });
  return mes.charAt(0).toUpperCase() + mes.slice(1) + ' ' + y;
}
