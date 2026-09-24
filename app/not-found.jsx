import { css } from './css';
import { BP } from './basePath';
import Header from './Header';

/* La página que ve alguien cuando llega a una dirección que no existe.
   Hasta el 23/09/2026 era la de Next, en inglés ("This page could not be
   found") y sin salida. Un callejón sin salida en un sitio que promete
   "sin sorpresas" es justo la sorpresa: acá se dice qué pasó y se ofrecen
   las tres puertas del sitio. */
export const metadata = {
  title: 'No encontramos esta página · Salud Protegida',
  robots: { index: false, follow: false },
};

const INTER = 'font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;';
const boton = (fondo, color, borde) => css('height:50px;padding:0 22px;--sq:var(--r-sm);display:inline-flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;background:' + fondo + ';color:' + color + ';border:1.5px solid ' + borde);

export default function NoEncontrada() {
  return (
    <div className="body tactil" style={css('min-height:100vh;background:var(--sp-mint-tint);color:var(--sp-ink)')}>
      <Header variant="solid" />
      <div style={css('max-width:620px;margin:0 auto;padding:130px 20px 80px;text-align:center')}>
        <div className="disp" style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--sp-teal-900);margin-bottom:12px')}>Error 404</div>
        <h1 className="disp" style={css('font-size:clamp(30px,5vw,42px);line-height:1.15;color:var(--sp-navy);margin:0 0 14px;letter-spacing:-0.02em')}>No encontramos esta página.</h1>
        <p style={css(INTER + 'font-size:17px;line-height:1.6;color:var(--sp-text);margin:0 0 28px')}>Puede que el link esté mal escrito o que la página ya no exista. Desde acá seguís en un toque:</p>
        <div style={css('display:flex;flex-wrap:wrap;gap:10px;justify-content:center')}>
          <a href={`${BP}/simulador/`} className="disp sq" style={boton('var(--sp-teal-deep)', '#fff', 'var(--sp-teal-deep)')}>Simulá tu plan</a>
          <a href={`${BP}/guia-medica/`} className="disp sq" style={boton('#fff', 'var(--sp-navy)', 'var(--sp-mint-line-strong)')}>Buscá tu médico</a>
          <a href={`${BP}/`} className="disp sq" style={boton('#fff', 'var(--sp-navy)', 'var(--sp-mint-line-strong)')}>Ir al inicio</a>
        </div>
      </div>
    </div>
  );
}
