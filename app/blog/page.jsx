import { css } from '../css';
import { BP } from '../basePath';
import { getPublishedPosts } from '../../lib/blog';

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
  const notas = getPublishedPosts();

  return (
    <div className="body" style={css('min-height:100vh;background:#002A52;color:#fff;display:flex;flex-direction:column')}>
      <div style={css('display:flex;align-items:center;justify-content:space-between;padding:20px 40px')}>
        <a href={`${BP}/`} aria-label="Ir al inicio de Salud Protegida">
          <img src={`${BP}/assets/brand/logo-sp-white.png`} alt="Salud Protegida" style={css('height:52px;display:block')} />
        </a>
        <a href={`${BP}/`} style={css('color:rgba(255,255,255,0.85);font-size:14px;font-weight:600;display:inline-flex;align-items:center;gap:7px')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>Volver al inicio</a>
      </div>
      <div style={css('flex:1;padding:36px 24px 80px')}>
        <div style={css('max-width:860px;margin:0 auto')}>
          <div style={css('display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#80DDD8;border:1px solid rgba(128,221,216,.4);padding:7px 14px;border-radius:999px;margin-bottom:20px')}>Blog</div>
          <h1 className="disp" style={css('font-size:clamp(32px,4.8vw,50px);line-height:1.08;letter-spacing:-0.02em;margin:0 0 14px')}>Historias y consejos para cuidar a tu familia, <span style={css('color:#00BCB4')}>antes</span>.</h1>
          <p style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:17px;line-height:1.65;color:#B3C7DB;max-width:560px;margin:0 0 36px')}>Escrito en idioma de familia, no de contrato. Hay notas nuevas cada semana.</p>
          {notas.length === 0 ? (
            <p style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:16px;color:#B3C7DB')}>Las primeras notas están en camino.</p>
          ) : (
            <div className="blog-list" style={css('display:grid;grid-template-columns:repeat(3,1fr);gap:16px')}>
              {notas.map((n) => (
                <a key={n.slug} href={`${BP}/blog/${n.slug}/`} className="blog-card" style={css('display:flex;flex-direction:column;background:#fff;border-radius:18px;padding:24px 22px;color:#1D1D1B;min-height:230px')}>
                  <div style={css('font-size:11.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#007d77;margin-bottom:10px')}>{n.kicker}</div>
                  <div className="disp" style={css('font-size:19px;line-height:1.25;letter-spacing:-0.01em;color:#003B71;margin-bottom:9px')}>{n.title}</div>
                  <div style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:13.5px;color:#3D3D3D;line-height:1.55;flex:1')}>{n.description}</div>
                  <div style={css('display:flex;align-items:center;justify-content:space-between;margin-top:16px')}>
                    <span style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:12px;color:#6B6B6B')}>Lectura de {n.minutes} min</span>
                    <span style={css('display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:800;color:#007d77')}>Leer <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
