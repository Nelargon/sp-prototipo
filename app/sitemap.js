// sitemap.xml del ecosistema completo (web Next + guía estática).
// /v1/ queda afuera a propósito: es el snapshot congelado de referencia.

const SITE = (process.env.SITE_URL || 'https://saludprotegida.com.py') + (process.env.NEXT_PUBLIC_BASE_PATH || '');

export const dynamic = 'force-static';

export default function sitemap() {
  const u = (path, priority, changeFrequency = 'weekly') => ({ url: SITE + path, priority, changeFrequency });
  return [
    u('/', 1.0),
    u('/simulador/', 0.9),
    u('/guia/guia_home.html', 0.9),
    u('/guia/guia_resultados.html', 0.8),
    u('/guia/guia_prestador.html', 0.7),
    u('/mi-sp/', 0.7),
    u('/historia/', 0.6, 'monthly'),
    u('/blog/', 0.6, 'monthly'),
    u('/blog/como-elegir-plan-familia/', 0.5, 'monthly'),
    u('/blog/carencia-copago-y-otras-palabras/', 0.5, 'monthly'),
    u('/blog/chequeos-por-edad/', 0.5, 'monthly'),
  ];
}
