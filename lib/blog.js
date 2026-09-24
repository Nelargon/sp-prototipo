import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { CATEGORIAS, CATEGORIA_FALLBACK, esCategoriaValida } from './categorias';
import { SERIES, getSerie, getSerieDeNota } from './series';
// Funciones puras de texto (tiempo de lectura, copete repetido, fecha). Viven
// aparte, sin dependencias, porque también las usa el correo del blog
// (scripts/correo-blog/), que corre en Node fuera de Next: así el correo lee
// cada nota exactamente como la web.
import { readingMinutes, stripDupIntro, formatFecha } from './blog-texto.mjs';

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
    // Dato destacado para la portada: la cifra que sostiene la nota, puesta
    // en grande sobre el color de su categoría. Opcional.
    cover_dato: data.cover_dato || '',
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
// `excluir` saca slugs que ya se ofrecen en otro lado de la misma página. El
// caso real: la nota que va como "Siguiente en la guía" aparecía además en
// "Seguí leyendo", así que el lector veía el mismo destino dos veces seguidas
// y perdía una de las tres opciones.
export function getRelacionadas(slug, n = 3, excluir = []) {
  const todas = getPublishedPosts();
  const actual = todas.find((p) => p.slug === slug);
  if (!actual) return [];

  const fuera = new Set([slug, ...excluir]);
  const otras = todas.filter((p) => !fuera.has(p.slug));
  const mismaCategoria = otras.filter((p) => p.categoria === actual.categoria);
  const resto = otras.filter((p) => p.categoria !== actual.categoria);

  return [...mismaCategoria, ...resto].slice(0, n);
}

export function getPost(slug) {
  return getPublishedPosts().find((p) => p.slug === slug) || null;
}

// Resuelve una guía a sus notas reales, en el orden editorial definido.
//
// Si un slug de lib/series.js no existe entre las publicadas, TIRA. Es a
// propósito: una guía que promete seis notas y entrega cinco es peor que un
// build roto, porque el hueco no se ve. Falla en CI, no en la web.
export function getGuia(slugSerie) {
  const serie = getSerie(slugSerie);
  if (!serie) return null;

  const publicadas = getPublishedPosts();
  // Blog vacío: no hay guías que armar. Es un estado legítimo (el build
  // inicial, antes de la primera nota) y distinto de "falta UNA nota", que sí
  // tiene que romper el build — ver el throw de abajo.
  if (publicadas.length === 0) return null;

  const notas = serie.notas.map((slugNota) => {
    const nota = publicadas.find((p) => p.slug === slugNota);
    if (!nota) {
      throw new Error(
        `[series] La guía "${serie.slug}" apunta a "${slugNota}", que no está publicada. ` +
        `Corregí lib/series.js o publicá la nota.`
      );
    }
    return nota;
  });

  return { ...serie, notas };
}

// Todas las guías resueltas, para el índice del blog.
export function getGuias() {
  return SERIES.map((s) => getGuia(s.slug)).filter(Boolean);
}

// La guía a la que pertenece una nota, con su posición y la siguiente.
export function getContextoDeSerie(slugNota) {
  const ctx = getSerieDeNota(slugNota);
  if (!ctx) return null;

  const guia = getGuia(ctx.serie.slug);
  return {
    titulo: guia.titulo,
    slug: guia.slug,
    posicion: ctx.posicion,
    total: ctx.total,
    siguiente: guia.notas[ctx.posicion] || null,
  };
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
export { formatFecha };
