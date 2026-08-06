import { css } from '../../../css';
import { BP } from '../../../basePath';
import { getGuia, getPublishedPosts, formatFechaCorta } from '../../../../lib/blog';
import { SERIES } from '../../../../lib/series';
import Cover from '../../Cover';
import Header from '../../../Header';

// La página de una guía: el camino completo, en orden.
//
// Una categoría dice "esto habla de X"; una guía dice "leé estas cuatro, en
// este orden, y entendés el tema". Es lo que convierte 22 notas sueltas en
// algo que se comparte y se vuelve a visitar.

export const dynamicParams = false;

// Con output:'export' y dynamicParams:false, Next rechaza una lista vacía de
// params — el mismo motivo por el que /blog/[slug] tiene su centinela. Sin
// notas publicadas no hay guías, así que se genera una sola página sentinela.
const SENTINEL = 'muy-pronto';

export function generateStaticParams() {
  if (getPublishedPosts().length === 0) return [{ slug: SENTINEL }];
  return SERIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guia = getGuia(slug);
  if (!guia) return {};
  const title = `Guía: ${guia.titulo} · Blog · Salud Protegida`;
  return {
    title,
    description: guia.promesa,
    alternates: { canonical: `/blog/guia/${guia.slug}/` },
    // Sin esto las tres guías heredan el openGraph del sitio y se comparten
    // todas con el título genérico de la home: indistinguibles en WhatsApp.
    openGraph: { type: 'website', title, description: guia.promesa, locale: 'es_PY' },
    twitter: { card: 'summary_large_image', title, description: guia.promesa },
  };
}

export default async function GuiaPage({ params }) {
  const { slug } = await params;
  const guia = getGuia(slug);

  if (!guia) {
    return (
      <div className="body" style={css('min-height:100vh;background:var(--sp-navy-deep);color:#fff;display:flex;align-items:center;justify-content:center;padding:24px')}>
        <div style={css('text-align:center;max-width:460px')}>
          <h1 className="disp" style={css('font-size:28px;margin:0 0 10px')}>Muy pronto</h1>
          <p style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;color:var(--sp-blue-soft);line-height:1.6')}>Todavía no hay guías publicadas.</p>
        </div>
      </div>
    );
  }

  const totalMin = guia.notas.reduce((a, n) => a + (n.minutes || 0), 0);

  return (
    <div className="body" style={css('min-height:100vh;background:var(--sp-navy-deep);color:#fff;display:flex;flex-direction:column')}>
      <Header variant="dark" />
      <div style={css('flex:1;padding:118px 24px 80px')}>
        <div style={css('max-width:820px;margin:0 auto')}>
          <a href={`${BP}/blog/`} style={css('display:flex;width:fit-content;align-items:center;gap:7px;color:var(--sp-mint);font-size:14px;font-weight:700;margin-bottom:26px')}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
            Volver al blog
          </a>

          <div style={css('display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--sp-mint);border:1px solid rgba(128,221,216,.4);padding:7px 14px;border-radius:var(--r-pill);margin-bottom:18px')}>Guía</div>

          <h1 className="disp" style={css('font-size:clamp(30px,4.4vw,44px);line-height:1.1;letter-spacing:-0.02em;margin:0 0 14px')}>{guia.titulo}</h1>

          <p style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:17px;line-height:1.65;color:var(--sp-blue-soft);max-width:60ch;margin:0 0 10px')}>{guia.promesa}</p>

          <div style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:13.5px;color:var(--sp-blue-meta);margin:0 0 40px')}>
            {guia.notas.length} notas · {totalMin} min en total
          </div>

          {/* Numeradas: el orden ES el contenido de una guía. */}
          <ol style={css('list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:14px')}>
            {guia.notas.map((n, i) => (
              <li key={n.slug}>
                <a href={`${BP}/blog/${n.slug}/`} className="guia-item" style={css('display:grid;grid-template-columns:44px 132px 1fr;gap:18px;align-items:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:14px 18px 14px 14px;color:inherit')}>
                  <div className="disp" style={css('font-size:22px;color:var(--sp-mint);text-align:center')}>{i + 1}</div>
                  <Cover categoria={n.categoria} slug={n.slug} cover={n.cover} dato={n.cover_dato} alt="" aspect="16 / 10" radius={9} />
                  <div>
                    <div className="guia-item-t disp" style={css('font-size:17.5px;line-height:1.3;letter-spacing:-0.01em;margin:0 0 5px')}>{n.title}</div>
                    <div style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:12.5px;color:var(--sp-blue-meta)')}>{n.categoria} · {formatFechaCorta(n.date)} · {n.minutes} min</div>
                  </div>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
