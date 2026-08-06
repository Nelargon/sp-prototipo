import { css } from '../css';
import { BP } from '../basePath';
import { getPublishedPosts, formatFecha, formatFechaCorta } from '../../lib/blog';
import BlogList from './BlogList';
import Header from '../Header';

export const metadata = {
  title: 'Blog · Salud Protegida',
  description:
    'Consejos de salud preventiva, guías para entender tu cobertura y ayudas para decidir — escritos en idioma de familia, no de contrato.',
  alternates: { canonical: '/blog/' },
};

// El espacio editorial del ecosistema. Las notas viven como markdown en
// contenido/blog/publicados/ (una nota nueva = un archivo nuevo, sin tocar
// código); la cocina editorial — línea editorial, digests, borradores
// generados por las Routines — está en el repo privado sp-interno.
export default function BlogPage() {
  const posts = getPublishedPosts();
  // Solo lo que la tarjeta necesita, y la fecha ya formateada: BlogList es un
  // componente cliente y no debe importar lib/blog (arrastraría `fs` al bundle).
  const notas = posts.map((n) => ({
    slug: n.slug, title: n.title, categoria: n.categoria,
    cover: n.cover, description: n.description, minutes: n.minutes,
    fechaFmt: formatFecha(n.date), fechaCorta: formatFechaCorta(n.date),
  }));

  return (
    <div className="body" style={css('min-height:100vh;background:#002A52;color:#fff;display:flex;flex-direction:column')}>
      <Header variant="dark" />
      {/* 1120px (antes 860): la portada editorial necesita ancho para que la
          destacada y el riel de "Lo último" convivan sin apretarse. */}
      <div style={css('flex:1;padding:118px 24px 80px')}>
        <div style={css('max-width:1120px;margin:0 auto')}>
          <div style={css('display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#80DDD8;border:1px solid rgba(128,221,216,.4);padding:7px 14px;border-radius:999px;margin-bottom:20px')}>Blog</div>
          <h1 className="disp" style={css('font-size:clamp(32px,4.8vw,50px);line-height:1.08;letter-spacing:-0.02em;margin:0 0 14px')}>Historias y consejos para cuidar a tu familia, <span style={css('color:#00BCB4')}>antes</span>.</h1>
          <p style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:17px;line-height:1.65;color:#B3C7DB;max-width:560px;margin:0 0 36px')}>Escrito en idioma de familia, no de contrato. Hay notas nuevas cada semana.</p>
          {notas.length === 0 ? (
            <p style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:16px;color:#B3C7DB')}>Las primeras notas están en camino.</p>
          ) : (
            <BlogList notas={notas} basePath={BP} />
          )}
        </div>
      </div>
    </div>
  );
}
