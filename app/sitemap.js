// sitemap.xml del ecosistema completo (web Next + guía estática).
// /v1/ queda afuera a propósito: es el snapshot congelado de referencia.

import { getPublishedPosts } from '../lib/blog';
import { SERIES } from '../lib/series';
import { CON_GUIA, CON_GUIA_DEMO, CON_AGENDA, CON_MI_SP, CON_BLOG, CON_HISTORIA } from './edicion';
import red from '../lib/guia-medica.json';

const SITE = (process.env.SITE_URL || 'https://saludprotegida.com.py') + (process.env.NEXT_PUBLIC_BASE_PATH || '');

export const dynamic = 'force-static';

export default function sitemap() {
  const u = (path, priority, changeFrequency = 'weekly') => ({ url: SITE + path, priority, changeFrequency });
  return [
    u('/', 1.0),
    u('/simulador/', 0.9),
    u('/planes/', 0.85),
    // Landing propia de los planes con el buscador de coberturas (6 ago 2026).
    u('/que-cubre/', 0.85),
    ...(CON_AGENDA ? [u('/agendar/', 0.8)] : []),
    // Los módulos que una edición no publica tampoco se enumeran: un sitemap
    // que lista URLs podadas del export es un sitemap que miente (y le da a
    // Google 404 para rastrear). Ver app/edicion.js.
    // La Guía Médica real y una ficha por prestador (23 sep 2026).
    ...(CON_GUIA ? [
      u('/guia-medica/', 0.9),
      ...[...new Set(red.prestadores.map((p) => p.id))].map((id) => u(`/guia-medica/${id}/`, 0.5, 'monthly')),
    ] : []),
    // El molde viejo de guia/ (datos ilustrativos), solo en el prototipo.
    ...(CON_GUIA_DEMO ? [
      u('/guia/guia_home.html', 0.3),
      u('/guia/guia_resultados.html', 0.3),
      u('/guia/guia_prestador.html', 0.3),
    ] : []),
    ...(CON_MI_SP ? [u('/mi-sp/', 0.7)] : []),
    ...(CON_HISTORIA ? [u('/historia/', 0.6, 'monthly')] : []),
    ...(CON_BLOG ? [u('/blog/', 0.6, 'weekly')] : []),
    // Las guías son rutas públicas con canonical propio: si no entran acá, el
    // sitemap deja de enumerar el sitio completo, que es justo su trabajo.
    ...(CON_BLOG ? SERIES.map((g) => u(`/blog/guia/${g.slug}/`, 0.6, 'monthly')) : []),
    // Las notas publicadas entran solas: una nota nueva = una URL nueva.
    ...(CON_BLOG ? getPublishedPosts().map((p) => u(`/blog/${p.slug}/`, 0.5, 'monthly')) : []),
  ];
}
