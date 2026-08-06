// sitemap.xml del ecosistema completo (web Next + guía estática).
// /v1/ queda afuera a propósito: es el snapshot congelado de referencia.

import { getPublishedPosts } from '../lib/blog';
import { SERIES } from '../lib/series';

const SITE = (process.env.SITE_URL || 'https://saludprotegida.com.py') + (process.env.NEXT_PUBLIC_BASE_PATH || '');

export const dynamic = 'force-static';

export default function sitemap() {
  const u = (path, priority, changeFrequency = 'weekly') => ({ url: SITE + path, priority, changeFrequency });
  return [
    u('/', 1.0),
    u('/simulador/', 0.9),
    u('/planes/', 0.85),
    u('/agendar/', 0.8),
    u('/guia/guia_home.html', 0.9),
    u('/guia/guia_resultados.html', 0.8),
    u('/guia/guia_prestador.html', 0.7),
    u('/mi-sp/', 0.7),
    u('/historia/', 0.6, 'monthly'),
    u('/blog/', 0.6, 'weekly'),
    // Las guías son rutas públicas con canonical propio: si no entran acá, el
    // sitemap deja de enumerar el sitio completo, que es justo su trabajo.
    ...SERIES.map((g) => u(`/blog/guia/${g.slug}/`, 0.6, 'monthly')),
    // Las notas publicadas entran solas: una nota nueva = una URL nueva.
    ...getPublishedPosts().map((p) => u(`/blog/${p.slug}/`, 0.5, 'monthly')),
  ];
}
