import { css } from '../css';
import { BP } from '../basePath';
import { WHATSAPP_NUMBER } from '../quote';

export const metadata = {
  title: 'Blog · Salud Protegida',
  description:
    'Muy pronto: consejos de salud preventiva, guías para entender tu cobertura y novedades de la red de Salud Protegida.',
  alternates: { canonical: '/blog/' },
};

// Placeholder editorial: reserva el lugar del blog en el ecosistema sin ser
// un callejón sin salida — adelanta los temas y devuelve al visitante a la web.
export default function BlogPage() {
  const waDigits = (WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const waHref = waDigits ? ('https://wa.me/' + waDigits + '?text=' + encodeURIComponent('Hola! Quiero información sobre los planes de Salud Protegida.')) : '#';

  const temas = [
    { icon: 'M20.8 5.6a5 5 0 0 0-8-1.3L12 5l-.8-.7a5 5 0 1 0-7 7.1l7.8 7.6 7.8-7.6a5 5 0 0 0 1-6.4Z', title: 'Salud preventiva', body: 'Chequeos, vacunas y hábitos que evitan sustos — explicados por la gente de nuestra red.' },
    { icon: 'M4 6h16v12H4zM8 6v12', title: 'Entendé tu cobertura', body: 'Qué significa carencia, copago o alta complejidad — en idioma de familia, no de contrato.' },
    { icon: 'M12 3a9 9 0 1 0 9 9M17 3v4h4M21 3l-6 6', title: 'Novedades de la red', body: 'Nuevos prestadores, especialidades y beneficios que se suman a tu plan.' },
  ];

  return (
    <div className="body" style={css('min-height:100vh;background:#002A52;color:#fff;display:flex;flex-direction:column')}>
      <div style={css('padding:20px 40px')}>
        <a href={`${BP}/`} aria-label="Ir al inicio de Salud Protegida">
          <img src={`${BP}/assets/brand/logo-sp-white.png`} alt="Salud Protegida" style={css('height:52px;display:block')} />
        </a>
      </div>
      <div style={css('flex:1;display:flex;align-items:center;justify-content:center;padding:40px 24px 70px')}>
        <div style={css('max-width:760px;text-align:center')}>
          <div style={css('display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#80DDD8;border:1px solid rgba(128,221,216,.4);padding:7px 14px;border-radius:999px;margin-bottom:22px')}>Blog · muy pronto</div>
          <h1 className="disp" style={css('font-size:clamp(34px,5vw,52px);line-height:1.08;letter-spacing:-0.02em;margin:0 0 16px')}>Historias y consejos para cuidar a tu familia, <span style={css('color:#00BCB4')}>antes</span>.</h1>
          <p style={css('font-size:17px;line-height:1.65;color:#B3C7DB;max-width:560px;margin:0 auto 38px')}>Estamos preparando este espacio. Mientras tanto, esto es lo que vas a encontrar acá:</p>
          <div className="two-col" style={css('display:grid;grid-template-columns:repeat(3,1fr);gap:16px;text-align:left;margin-bottom:42px')}>
            {temas.map((t, i) => (
              <div key={i} style={css('background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);border-radius:16px;padding:22px 20px')}>
                <div style={css('width:42px;height:42px;border-radius:12px;background:rgba(0,188,180,0.18);color:#00BCB4;display:flex;align-items:center;justify-content:center;margin-bottom:13px')}><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg></div>
                <div style={css('font-size:15.5px;font-weight:800;color:#fff;margin-bottom:6px')}>{t.title}</div>
                <div style={css('font-size:13.5px;color:#9bb6d2;line-height:1.55')}>{t.body}</div>
              </div>
            ))}
          </div>
          <div style={css('display:flex;gap:12px;flex-wrap:wrap;justify-content:center')}>
            <a href={`${BP}/`} className="btn-teal" style={css('height:50px;padding:0 26px;border-radius:13px;background:#00BCB4;color:#fff;font-size:15px;font-weight:700;display:inline-flex;align-items:center;gap:8px')}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>Volver al inicio</a>
            <a href={waHref} target="_blank" rel="noopener" className="btn-ghost-light2" style={css('height:50px;padding:0 24px;border-radius:13px;background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.45);color:#fff;font-size:15px;font-weight:700;display:inline-flex;align-items:center;gap:9px')}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z" /></svg>Escribinos</a>
          </div>
        </div>
      </div>
    </div>
  );
}
