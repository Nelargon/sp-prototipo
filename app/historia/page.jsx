import { css } from '../css';
import { BP } from '../basePath';
import Manifiesto from '../components/Manifiesto';

export const metadata = {
  title: 'Nuestra historia · Salud Protegida',
  description:
    'Por qué creemos que la protección real se construye antes — antes de la llamada de madrugada, antes del «¿esto me cubre?».',
  alternates: { canonical: '/historia/' },
};

// La casa del manifiesto cinematográfico desde el rediseño home-v2:
// la emoción persuade mejor cuando el visitante ya resolvió lo suyo.
export default function HistoriaPage() {
  return (
    <div className="body" style={css('background:#002A52;color:#fff')}>
      <div style={css('position:absolute;top:0;left:0;right:0;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:20px 40px')}>
        <a href={`${BP}/`} aria-label="Ir al inicio de Salud Protegida">
          <img src={`${BP}/assets/brand/logo-sp-white.png`} alt="Salud Protegida" style={css('height:52px;display:block')} />
        </a>
        <a href={`${BP}/`} style={css('color:rgba(255,255,255,0.85);font-size:14px;font-weight:600;display:inline-flex;align-items:center;gap:7px')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>Volver al inicio</a>
      </div>
      <Manifiesto />
      <section style={css('padding:90px 24px 110px;text-align:center;background:#002A52')}>
        <div style={css('max-width:640px;margin:0 auto')}>
          <h2 className="disp" style={css('font-size:clamp(28px,3.6vw,40px);line-height:1.14;letter-spacing:-0.02em;margin:0 0 14px')}>¿Listo para <span style={css('color:#00BCB4')}>sentirla</span>?</h2>
          <p style={css('font-size:17px;color:#B3C7DB;line-height:1.6;margin:0 0 32px')}>Conocé tu plan ideal y su precio en un minuto — antes de dejar cualquier dato.</p>
          <div style={css('display:flex;gap:12px;flex-wrap:wrap;justify-content:center')}>
            <a href={`${BP}/simulador/`} className="btn-teal" style={css('height:52px;padding:0 28px;border-radius:14px;background:#00BCB4;color:#fff;font-size:16px;font-weight:700;display:inline-flex;align-items:center;gap:9px')}>Simulá tu plan <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
            <a href={`${BP}/`} className="btn-ghost-light2" style={css('height:52px;padding:0 26px;border-radius:14px;background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.45);color:#fff;font-size:16px;font-weight:600;display:inline-flex;align-items:center')}>Volver al inicio</a>
          </div>
        </div>
      </section>
    </div>
  );
}
