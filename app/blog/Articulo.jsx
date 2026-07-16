import { css } from '../css';
import { BP } from '../basePath';

// Layout compartido de las notas del blog: lectura cómoda (columna angosta,
// cuerpo grande), la marca arriba y una sola invitación al final.
export function A({ kicker, title, intro, minutes, date, children }) {
  return (
    <div className="body" style={css('min-height:100vh;background:#fff;color:#1D1D1B')}>
      <div style={css('display:flex;align-items:center;justify-content:space-between;padding:18px 28px;border-bottom:1px solid #F0F0F0')}>
        <a href={`${BP}/`} aria-label="Ir al inicio de Salud Protegida">
          <img src={`${BP}/assets/brand/logo-sp-color.png`} alt="Salud Protegida" style={css('height:44px;display:block')} />
        </a>
        <a href={`${BP}/blog/`} style={css('color:#003B71;font-size:14px;font-weight:700;display:inline-flex;align-items:center;gap:7px')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>Volver al blog</a>
      </div>
      <article style={css('max-width:680px;margin:0 auto;padding:52px 24px 40px')}>
        <div style={css('font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#007d77;margin-bottom:12px')}>{kicker}</div>
        <h1 className="disp" style={css('font-size:clamp(30px,4.4vw,42px);line-height:1.12;letter-spacing:-0.02em;color:#003B71;margin:0 0 14px')}>{title}</h1>
        <p style={css('font-size:18px;line-height:1.6;color:#3D3D3D;margin:0 0 14px')}>{intro}</p>
        <div style={css('font-size:13px;color:#6B6B6B;padding-bottom:26px;border-bottom:1px solid #F0F0F0;margin-bottom:30px')}>Equipo Salud Protegida · {date} · Lectura de {minutes} min</div>
        <div className="art-body">{children}</div>
      </article>
      <div style={css('max-width:680px;margin:0 auto;padding:0 24px 70px')}>
        <div style={css('background:#003B71;border-radius:18px;padding:28px 26px;color:#fff')}>
          <div style={css('font-size:19px;font-weight:800;line-height:1.3;margin-bottom:6px')}>¿Querés saber cuál es el plan para tu familia?</div>
          <div style={css('font-size:14.5px;color:#B3C7DB;line-height:1.55;margin-bottom:18px')}>Contanos quiénes son y te mostramos el plan que va con ustedes, con precio estimado — en un minuto y sin dejar datos.</div>
          <a href={`${BP}/simulador/`} className="btn-teal" style={css('height:48px;padding:0 24px;border-radius:12px;background:#00BCB4;color:#fff;font-size:15px;font-weight:800;display:inline-flex;align-items:center;gap:8px')}>Simulá tu plan <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
        </div>
      </div>
    </div>
  );
}

// Piezas de contenido con el estilo ya resuelto, para que las notas sean solo texto.
export const H2 = ({ children }) => <h2 className="disp" style={css('font-size:23px;line-height:1.25;letter-spacing:-0.01em;color:#003B71;margin:34px 0 12px')}>{children}</h2>;
export const P = ({ children }) => <p style={css('font-size:16.5px;line-height:1.75;color:#3D3D3D;margin:0 0 16px')}>{children}</p>;
export const B = ({ children }) => <strong style={css('color:#1D1D1B;font-weight:700')}>{children}</strong>;
export const Callout = ({ children }) => <div style={css('background:#F2FBFA;border-left:3px solid #00BCB4;border-radius:0 12px 12px 0;padding:16px 18px;font-size:15.5px;line-height:1.65;color:#00695f;margin:0 0 16px')}>{children}</div>;
export const Nota = ({ children }) => <div style={css('font-size:13.5px;line-height:1.6;color:#6B6B6B;background:#F7F7F7;border-radius:12px;padding:14px 16px;margin:26px 0 0')}>{children}</div>;
