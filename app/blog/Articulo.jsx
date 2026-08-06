import { css } from '../css';
import { BP } from '../basePath';
import Cover from './Cover';
import Header from '../Header';
import SeguiLeyendo from './SeguiLeyendo';

// Layout compartido de las notas del blog: lectura cómoda (columna angosta,
// cuerpo grande), la marca arriba y una sola invitación al final.
export function A({ title, intro, minutes, date, categoria, slug, cover, dato, relacionadas, serie, children }) {
  return (
    <div className="body" style={css('min-height:100vh;background:#fff;color:#1D1D1B')}>
      <Header variant="solid" />
      <div style={css('max-width:680px;margin:0 auto;padding:0 24px')}>
        <a href={`${BP}/blog/`} style={css('display:inline-flex;align-items:center;gap:7px;color:#003B71;font-size:14px;font-weight:700;padding:104px 0 0')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>Volver al blog</a>
      </div>
      <article style={css('max-width:680px;margin:0 auto;padding:18px 24px 40px')}>
        <Cover categoria={categoria} slug={slug} cover={cover} dato={dato} alt={title} radius={18} eager />
        <div style={css('font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#007d77;margin:24px 0 12px')}>{categoria}</div>
        <h1 className="disp" style={css('font-size:clamp(30px,4.4vw,42px);line-height:1.12;letter-spacing:-0.02em;color:#003B71;margin:0 0 14px')}>{title}</h1>
        <p style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:18px;line-height:1.65;color:#3D3D3D;margin:0 0 14px')}>{intro}</p>
        <div style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:13px;color:#6B6B6B;padding-bottom:26px;border-bottom:1px solid #F0F0F0;margin-bottom:30px')}>Equipo Salud Protegida · {date} · Lectura de {minutes} min</div>
        {/* Si la nota es parte de una guía, el lector tiene que saberlo ANTES
            de leer: cambia cómo la lee — no es una nota suelta, es un paso. */}
        {serie && (
          <a href={`${BP}/blog/guia/${serie.slug}/`} style={css('display:flex;align-items:center;gap:10px;background:#F2FBFA;border:1px solid #CFEDEA;border-radius:12px;padding:12px 15px;margin:0 0 28px;color:#00695f;font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:13.5px')}>
            <span style={css('font-weight:800;white-space:nowrap')}>Parte {serie.posicion} de {serie.total}</span>
            <span style={css('color:#9CC8C4')}>·</span>
            <span>Guía: <strong style={css('font-weight:700')}>{serie.titulo}</strong></span>
          </a>
        )}
        <div className="art-body">{children}</div>
      </article>
      {/* El paso siguiente de la guía manda sobre las relacionadas: si el
          lector entró a un camino, lo que quiere es seguirlo. */}
      {serie && serie.siguiente && (
        <div style={css('max-width:680px;margin:0 auto;padding:34px 24px 0')}>
          <a href={`${BP}/blog/${serie.siguiente.slug}/`} style={css('display:block;border:1px solid #E3EEF7;border-radius:16px;padding:20px 22px;color:inherit;background:#F7FBFE')}>
            <div style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:11.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#6B93B8;margin-bottom:8px')}>Siguiente en la guía · {serie.posicion + 1} de {serie.total}</div>
            <div className="disp" style={css('font-size:20px;line-height:1.28;letter-spacing:-0.01em;color:#003B71;margin-bottom:6px')}>{serie.siguiente.title}</div>
            <div style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:13px;color:#6B6B6B')}>Lectura de {serie.siguiente.minutes} min</div>
          </a>
        </div>
      )}
      {/* Primero el próximo click, después la oferta: el lector que quiere
          seguir leyendo no tiene que pasar por encima de un CTA. */}
      <SeguiLeyendo notas={relacionadas} />
      <div style={css('max-width:680px;margin:0 auto;padding:26px 24px 70px')}>
        <div style={css('background:#003B71;border-radius:18px;padding:28px 26px;color:#fff')}>
          <div style={css('font-size:19px;font-weight:800;line-height:1.3;margin-bottom:6px')}>¿Querés saber cuál es el plan para tu familia?</div>
          <div style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:14.5px;color:#B3C7DB;line-height:1.55;margin-bottom:18px')}>Contanos quiénes son y te mostramos el plan que va con ustedes, con precio estimado — en un minuto y sin dejar datos.</div>
          <a href={`${BP}/simulador/`} className="btn-teal" style={css('height:48px;padding:0 24px;border-radius:12px;background:#007d77;color:#fff;font-size:15px;font-weight:800;display:inline-flex;align-items:center;gap:8px')}>Simulá tu plan <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
        </div>
      </div>
    </div>
  );
}

// Piezas de contenido con el estilo ya resuelto, para que las notas sean solo texto.
export const H2 = ({ children }) => <h2 className="disp" style={css('font-size:23px;line-height:1.25;letter-spacing:-0.01em;color:#003B71;margin:34px 0 12px')}>{children}</h2>;
export const P = ({ children }) => <p style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:17px;line-height:1.8;color:#3D3D3D;margin:0 0 18px')}>{children}</p>;
export const B = ({ children }) => <strong style={css('color:#1D1D1B;font-weight:700')}>{children}</strong>;
export const Callout = ({ children }) => <div style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;background:#F2FBFA;border-left:3px solid #00BCB4;border-radius:0 12px 12px 0;padding:16px 18px;font-size:16px;line-height:1.7;color:#00695f;margin:0 0 16px')}>{children}</div>;
export const Nota = ({ children }) => <div style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:14px;line-height:1.65;color:#6B6B6B;background:#F7F7F7;border-radius:12px;padding:14px 16px;margin:26px 0 0')}>{children}</div>;
