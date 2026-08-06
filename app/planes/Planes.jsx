'use client';

import { css } from '../css';
import { BP } from '../basePath';
import { fmt, plans } from '../quote';
import { coverage } from '../coverage';
import { Term, waitLabel, annotate } from '../glossary';
import { track } from '../track';
import Header from '../Header';

// /planes — el detalle exhaustivo que antes vivía plegado en un toggle del home
// (BITACORA cap. 46). El home muestra la comparación de un vistazo; acá, servicio
// por servicio, con la letra chica que en la portada estorbaría. Página clara →
// Header variant="solid".
export default function Planes() {
  const plansArr = plans();
  const cov = coverage();
  const badge = (c) => 'display:inline-flex;align-items:center;font-size:12px;font-weight:700;padding:3px 10px;border-radius:var(--r-pill);white-space:nowrap;' + (c.ok ? 'background:var(--sp-mint-bg);color:var(--sp-teal-deep)' : 'background:var(--sp-gold-bg);color:var(--sp-gold-ink)');

  return (
    <div className="body" style={css('min-height:100vh;background:#fff;color:var(--sp-ink)')}>
      <Header variant="solid" />
      <div style={css('max-width:1080px;margin:0 auto;padding:104px 24px 20px')}>
        <div style={css('text-align:center;max-width:680px;margin:0 auto 36px')}>
          <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--sp-teal-deep);margin-bottom:14px')}>Los tres planes</div>
          <h1 className="disp" style={css('font-size:clamp(32px,4.6vw,46px);font-weight:800;color:var(--sp-navy);line-height:1.12;letter-spacing:-0.02em;margin:0 0 14px')}>Bronze, Silver y Gold — <span style={css('color:var(--sp-teal-deep)')}>todo el detalle</span>.</h1>
          <p style={css('font-family:var(--font-inter),sans-serif;font-size:17px;line-height:1.6;color:var(--sp-muted);margin:0')}>Servicio por servicio, qué cubre cada nivel y cuánto sale. Cada nivel incluye todo el anterior y suma lo suyo.</p>
        </div>
      </div>

      {/* Tabla completa: 11 servicios × 3 planes, con estado y detalle real de los
          cuadernillos. Scroll horizontal en pantallas chicas. */}
      <div style={css('max-width:1080px;margin:0 auto;padding:0 24px')}>
        <div style={css('border:1px solid var(--sp-line);border-radius:18px;overflow:hidden;overflow-x:auto')}>
          <div style={css('min-width:720px')}>
            {/* Encabezado: servicio + los tres planes con precio y CTA */}
            <div style={css('display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;background:var(--sp-navy);color:#fff')}>
              <div style={css('padding:16px 18px;display:flex;align-items:flex-end;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase')}>Servicio</div>
              {plansArr.map((pl, i) => (
                <div key={i} style={css('padding:14px 12px;text-align:center;border-left:1px solid rgba(255,255,255,0.12)')}>
                  <div style={css('display:inline-block;width:9px;height:9px;border-radius:var(--r-pill);background:' + pl.color + ';margin-bottom:6px')}></div>
                  <div className="disp" style={css('font-size:18px;font-weight:800;line-height:1')}>{pl.short}</div>
                  <div style={css('font-size:12px;opacity:.85;margin-top:5px')}>desde <span className="num-tnum">{fmt(pl.price)}</span></div>
                  <a href={`${BP}/simulador/?plan=${pl.short.toLowerCase()}`} onClick={() => track('cta_simulador', { origen: 'planes', plan: pl.name })} style={css('margin-top:9px;height:34px;padding:0 14px;border-radius:var(--r-xs);background:var(--sp-teal-deep);color:#fff;font-size:12.5px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:5px;transition:background .2s')}>Ver mi precio</a>
                </div>
              ))}
            </div>
            {/* Filas */}
            {cov.map((item, r) => (
              <div key={r} style={css('display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;border-top:1px solid var(--sp-line-2);background:' + (r % 2 ? 'var(--sp-surface-2)' : '#fff'))}>
                <div style={css('padding:15px 18px;display:flex;flex-direction:column;justify-content:center')}>
                  <span style={css('font-size:14px;font-weight:700;color:var(--sp-navy)')}>{item.name}</span>
                  {item.waitNote && (
                    <span style={css('font-family:var(--font-inter),sans-serif;font-size:11.5px;color:var(--sp-muted);line-height:1.4;margin-top:4px')}>{item.waitNote}</span>
                  )}
                </div>
                {item.cov.map((c, j) => {
                  // La espera solo se muestra donde HAY cobertura: en un plan que
                  // no cubre el servicio no hay nada que esperar (regla AD, ver
                  // app/coverage.js y BITACORA cap. 55).
                  const espera = c.ok && item.wait ? waitLabel(item.wait[j]) : null;
                  return (
                    <div key={j} style={css('padding:14px 12px;text-align:center;border-left:1px solid var(--sp-line-2)')}>
                      <div style={css(badge(c))}>{c.s}</div>
                      <div style={css('font-family:var(--font-inter),sans-serif;font-size:12px;color:var(--sp-muted);line-height:1.4;margin-top:6px')}>{annotate(c.d)}</div>
                      {espera && (
                        <div style={css('font-family:var(--font-inter),sans-serif;font-size:11.5px;color:var(--sp-muted);line-height:1.4;margin-top:6px;display:flex;align-items:center;justify-content:center;gap:4px')}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                          <span>{espera}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div style={css('font-family:var(--font-inter),sans-serif;font-size:12.5px;color:var(--sp-muted);margin-top:14px;text-align:center;line-height:1.6')}>
          Los tiempos de espera son la <Term k="carencia">carencia</Term> de cada servicio: el reloj arranca el día que te afiliás, no el día que lo necesitás.<br />
          Coberturas y precios de lista vigentes, IVA incluido — con débito automático o tarjeta de crédito, 10% de descuento. El detalle final lo confirmás con tu asesor.
        </div>
      </div>

      {/* Banda senior + cierre */}
      <div style={css('max-width:1080px;margin:0 auto;padding:32px 24px 20px')}>
        <div className="two-col" style={css('background:var(--sp-blue-bg);border:0.5px solid var(--sp-blue-line);border-radius:var(--r-md);padding:24px 28px;display:grid;grid-template-columns:auto 1fr auto;gap:26px;align-items:center')}>
          <div className="disp" style={css('background:var(--sp-navy);color:#fff;border-radius:var(--r-sm);padding:16px 22px;text-align:center;font-weight:800')}><div style={css('font-size:11px;letter-spacing:.2em;opacity:.85')}>SP</div><div style={css('font-size:20px')}>SENIOR</div></div>
          <div><div style={css('font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--sp-teal-900);margin-bottom:6px')}>Plan aparte · 65 años o más</div><div style={css('font-family:var(--font-inter),sans-serif;font-size:16px;color:var(--sp-text);line-height:1.55')}>¿Buscás para tus padres o un adulto mayor? <b style={css('color:var(--sp-navy)')}>Plan Vital</b> está pensado para ellos: consultas, urgencias 24 h y ambulancia a domicilio.</div></div>
          <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'planes_senior' })} className="btn-navy" style={css('height:46px;padding:0 22px;border-radius:var(--r-sm);background:var(--sp-navy);color:#fff;font-size:14px;font-weight:700;display:inline-flex;align-items:center;white-space:nowrap')}>Simulá Plan Vital</a>
        </div>
      </div>

      <div style={css('max-width:1080px;margin:0 auto;padding:8px 24px 70px;text-align:center')}>
        <a href={`${BP}/`} className="link-teal" style={css('display:inline-flex;align-items:center;gap:7px;color:var(--sp-teal-deep);font-size:14px;font-weight:700')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>Volver al inicio</a>
      </div>
    </div>
  );
}
