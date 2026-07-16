// robots.txt del ecosistema. ESTRATEGIA (jul 2026): el prototipo NO debe
// indexarse — un cliente real que googlee "salud protegida" no puede
// aterrizar en una demo con precios de referencia. Toda la infraestructura
// SEO queda lista y se enciende con NEXT_PUBLIC_INDEXABLE=true (+ SITE_URL)
// cuando se decida el dominio definitivo (HANDOFF #8/#9).
// Nota GitHub Pages: en un project site (nelargon.github.io/sp-prototipo)
// este archivo no puede vivir en la raíz del dominio, así que la defensa
// efectiva del prototipo es el <meta name="robots" content="noindex"> que
// emite el layout. Este robots.txt gobierna cuando haya dominio propio.

const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === 'true';
const SITE = (process.env.SITE_URL || 'https://saludprotegida.com.py') + (process.env.NEXT_PUBLIC_BASE_PATH || '');

export const dynamic = 'force-static';

export default function robots() {
  if (!INDEXABLE) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/v1/' },
    sitemap: SITE + '/sitemap.xml',
  };
}
