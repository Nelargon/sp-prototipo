'use client';

import { Fragment, useState } from 'react';
import { css } from '../css';
import { BP } from '../basePath';
import { fmt, plans, essentialTitular, AUTO_PAY_DISCOUNT, WHATSAPP_NUMBER } from '../quote';
import { coverage } from '../coverage';
import { Term, waitLabel, annotate } from '../glossary';
import { track } from '../track';
import Header from '../Header';
import Plegable from '../components/Plegable';
import datos from '../../lib/prestaciones.json';

/* /planes — la ÚNICA página donde se detallan los planes (3/10/2026).

   Arturo: «el espacio de "¿Qué cubre?" realmente debería no existir. Debería
   ser solamente un espacio donde se detallan los planes […] una página aparte.
   No tiene que llevar al home otra vez a la parte de planes.» Antes había dos
   páginas casi iguales (/planes y /que-cubre); /que-cubre es ahora un redirect
   a esta (app/que-cubre/page.jsx) y su dirección, que circula por WhatsApp y
   anuncios, sigue viva.

   Es la versión liviana. La vara es la regla de claridad del 27/09: lo que
   cambia la decisión va a la vista (tarjetas con precio, los once servicios
   con su espera, lo que no entra en ningún plan); lo que solo amplía va a un
   toque (las 43 especialidades, internación, maternidad y topes). Salieron:
   el buscador de estudios («¿Está cubierto lo que me pidieron?») y «Subir un
   escalón» (594 / 275 «cosas que mejoran»: un número que nadie puede usar
   para decidir). El buscador queda guardado en app/que-cubre/Buscador.jsx,
   sin página, hasta decidir si vive en la Guía Médica. Ver HANDOFF.

   Sin rótulos en mayúsculas sobre los títulos (Arturo, 29/09: «no uses el
   etiquetado característico de la IA»). Las esperas van en la tabla, todas
   con el mismo peso y orden, nunca de gancho en las tarjetas (3/10).

   e = Essential (su cuadernillo) · s = Silver · o = Gold (la grilla). Silver y
   Gold son de la familia que internamente se llama "Privilege": de cara al
   usuario NUNCA se nombra así (HANDOFF dec. 11o). */

const PLAN_KEYS = ['e', 's', 'o'];

// «¿Tenés una orden del médico?»: la respuesta a lo que hacía el buscador de
// estudios («¿Está cubierto lo que me pidieron?»), dada por una persona. Las
// asesoras contestan órdenes por WhatsApp (Arturo, 6/10/2026). Ver HANDOFF.
const waDigits = String(WHATSAPP_NUMBER).replace(/\D/g, '');
const WA_ORDEN = 'https://wa.me/' + waDigits + '?text=' + encodeURIComponent('Hola! Tengo una orden del médico y quiero saber si entra en un plan de Salud Protegida. Te mando la foto.');

const titulo = (h, resalte, bajada) => (
  <div style={css('text-align:center;max-width:700px;margin:0 auto 26px')}>
    <h2 className="disp" style={css('font-size:clamp(27px,3.6vw,38px);font-weight:800;color:var(--sp-navy);line-height:1.15;letter-spacing:-0.02em;margin:0 0 13px')}>
      {h} <span style={css('color:var(--sp-teal-deep)')}>{resalte}</span>
    </h2>
    {bajada && <p style={css('font-family:var(--font-inter),sans-serif;font-size:16.5px;line-height:1.6;color:var(--sp-text);margin:0')}>{bajada}</p>}
  </div>
);

/* Un detalle que se abre a un toque. Cerrado sigue en el HTML, inert (Plegable). */
function Detalle({ id, titulo: t, bajada, abierto, onToggle, children }) {
  return (
    <div className="sq rel" style={css('background:#fff;border:1px solid var(--sp-line);--sq:var(--r-md);overflow:hidden')}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierto}
        aria-controls={id}
        className="fila"
        style={css('width:100%;text-align:left;padding:18px 20px;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:14px')}
      >
        <span>
          <span className="disp" style={css('display:block;font-size:16px;font-weight:800;color:var(--sp-navy);line-height:1.3')}>{t}</span>
          <span style={css('display:block;font-family:var(--font-inter),sans-serif;font-size:13.5px;font-weight:400;color:var(--sp-muted);line-height:1.5;margin-top:3px')}>{bajada}</span>
        </span>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#009690" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;transition:transform .24s ease;transform:rotate(' + (abierto ? 180 : 0) + 'deg)')} aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      <Plegable id={id} abierto={abierto}>
        <div style={css('padding:0 16px 18px')}>{children}</div>
      </Plegable>
    </div>
  );
}

export default function Planes() {
  const plansArr = plans();
  const cov = coverage();
  const [abierto, setAbierto] = useState({});
  const alternar = (k) => setAbierto((a) => {
    if (!a[k]) track('planes_detalle_abrir', { tema: k });
    return { ...a, [k]: !a[k] };
  });

  const badge = (c) => 'display:inline-flex;align-items:center;font-size:12px;font-weight:700;padding:3px 10px;border-radius:var(--r-pill);white-space:nowrap;' + (c.ok ? 'background:var(--sp-mint-bg);color:var(--sp-teal-deep)' : 'background:var(--sp-gold-bg);color:var(--sp-gold-ink)');

  const especialidades = datos.items.filter((i) => i.t === 'c');
  const excluidos = datos.items.filter((i) => i.t === 'x');

  /* Cómo se MUESTRA un parámetro del master, sin tocar el dato:
     - "Carencia…" va después de lo que la persona entiende (regla del
       8/09/2026: "carencia" no va primero; la palabra del contrato, detrás).
     - El master escribe "Gs."; el resto del sitio, "₲". Una sola moneda. */
  const etiquetaParam = (t) => {
    const m = /^Carencia\s*(?:–|-|de)\s*(.+)$/i.exec(t);
    return m ? `Tiempo de espera para ${m[1].replace(/por evento agudo/, 'por algo agudo')} (carencia)` : t;
  };
  const valorParam = (v) => String(v).replace(/^Gs\.\s*/, '₲ ');

  // Las secciones de parámetros vienen agrupadas del master (Internación,
  // Topes…). Se respeta ese agrupamiento: es como lo lee quien vende.
  const seccionesParam = [];
  for (const p of datos.parametros) {
    const ult = seccionesParam[seccionesParam.length - 1];
    if (ult && ult.sec === p.sec) ult.filas.push(p);
    else seccionesParam.push({ sec: p.sec, filas: [p] });
  }

  return (
    <div className="body tactil" style={css('min-height:100vh;background:#fff;color:var(--sp-ink)')}>
      <Header variant="solid" />

      {/* ---- 1. ENCABEZADO ---------------------------------------------- */}
      <section style={css('padding:104px 24px 0')}>
        <div style={css('max-width:1080px;margin:0 auto;text-align:center')}>
          <h1 className="disp" style={css('font-size:clamp(32px,4.6vw,46px);font-weight:800;color:var(--sp-navy);line-height:1.12;letter-spacing:-0.02em;margin:0 auto 14px;max-width:720px')}>
            Essential, Silver y Gold, <span style={css('color:var(--sp-teal-deep)')}>plan por plan</span>
          </h1>
          <p style={css('font-family:var(--font-inter),sans-serif;font-size:17px;line-height:1.6;color:var(--sp-muted);margin:0 auto;max-width:640px')}>
            Qué trae cada uno, cuánto sale y lo que no entra en ninguno. Lo más fino lo abrís con un toque.
          </p>
        </div>
      </section>

      {/* ---- 2. LAS TRES TARJETAS --------------------------------------- */}
      <section style={css('padding:40px 24px 0')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          <div className="planes-grid" style={css('display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px')}>
            {plansArr.map((pl) => (
              <div key={pl.short} className="sq" style={css('border:1px solid var(--sp-line);--sq:var(--r-lg);overflow:hidden;background:#fff;display:flex;flex-direction:column')}>
                <div style={css('height:5px;background:' + pl.color)}></div>
                <div style={css('padding:22px 22px 24px;display:flex;flex-direction:column;flex:1')}>
                  <div style={css('display:flex;align-items:center;gap:8px;margin-bottom:5px')}>
                    <span style={css('width:10px;height:10px;border-radius:var(--r-pill);background:' + pl.color)}></span>
                    <span className="disp" style={css('font-size:21px;font-weight:800;color:var(--sp-navy)')}>{pl.short}</span>
                  </div>
                  <div style={css('font-family:var(--font-inter),sans-serif;font-size:13px;color:var(--sp-muted);line-height:1.45;margin-bottom:14px')}>{pl.tag}</div>
                  <div style={css('display:flex;align-items:baseline;gap:7px;flex-wrap:wrap')}>
                    <span style={css('font-family:var(--font-inter),sans-serif;font-size:12.5px;color:var(--sp-muted)')}>desde</span>
                    <span className="disp num-tnum" style={css('font-size:27px;font-weight:800;color:var(--sp-navy);letter-spacing:-0.02em')}>{fmt(pl.price)}</span>
                    <span style={css('font-family:var(--font-inter),sans-serif;font-size:12.5px;color:var(--sp-muted)')}>por mes</span>
                  </div>
                  <div style={css('font-family:var(--font-inter),sans-serif;font-size:12.5px;color:var(--sp-teal-900);margin-top:5px')}>
                    <span className="num-tnum">{fmt(Math.round(pl.price * (1 - AUTO_PAY_DISCOUNT)))}</span> con pago automático
                  </div>
                  <ul style={css('list-style:none;padding:0;margin:17px 0 0;display:flex;flex-direction:column;gap:9px;flex:1')}>
                    {pl.lines.map((l, j) => (
                      <li key={j} style={css('display:flex;gap:9px;align-items:flex-start;font-family:var(--font-inter),sans-serif;font-size:13.5px;color:var(--sp-text);line-height:1.5')}>
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00BCB4" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:3px')} aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                        <span>{l.split('**').map((seg, k) => (k % 2 ? <b key={k} style={css('color:var(--sp-navy);font-weight:600')}>{annotate(seg)}</b> : <Fragment key={k}>{annotate(seg)}</Fragment>))}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`${BP}/simulador/?plan=${pl.short.toLowerCase()}`}
                    onClick={() => track('cta_simulador', { origen: 'planes_tarjeta', plan: pl.name })}
                    className="btn-teal sq"
                    style={css('margin-top:20px;height:46px;--sq:var(--r-sm);background:var(--sp-teal-deep);color:#fff;font-size:14.5px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:7px')}
                  >
                    Ver mi precio
                  </a>
                </div>
              </div>
            ))}
          </div>
          <p style={css('font-family:var(--font-inter),sans-serif;font-size:12.5px;color:var(--sp-muted);text-align:center;margin:13px auto 0;line-height:1.6;max-width:760px')}>
            El precio es el de una persona sola, con IVA incluido; el tuyo depende de quiénes entran y de la edad. Essential varía según tu zona: {fmt(essentialTitular('interior'))} en el interior, {fmt(essentialTitular('asuncion_central'))} en Asunción y Central y {fmt(essentialTitular('nacional'))} en su versión Nacional. Con débito automático o tarjeta de crédito, 10% menos.
          </p>
        </div>
      </section>

      {/* ---- 3. LOS ONCE SERVICIOS -------------------------------------- */}
      <section style={css('padding:70px 24px 0')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          {titulo('Los once servicios', 'que más se preguntan', 'La comparación de un vistazo, con la letra chica al lado y no escondida.')}
          {/* ⚠ LA FORMA DE ESTA TABLA EN EL CELULAR LA DECIDE ARTURO (05/10/2026).
              Ya descartó dos: deslizar de costado (26/09, lámina 45: al llegar
              Gold no se ve) y la fila partida (27/09, lámina 57: «demasiado
              ordenado en filas y columnas»). La dirección que aprobó es otra:
              tarjetas con las mismas líneas y el detalle al tocar (lámina 59,
              HANDOFF «📱 La comparativa en el celular»), y espera que la revise
              en su celular. Hasta entonces queda como estaba. No cambiar la
              forma sin su OK (BITACORA cap. 137). */}
          {/* En celular la tabla se desliza de costado y solo se ve el primer
              plan: sin este aviso, la página que existe para comparar los tres
              muestra uno y medio (revisión del 23/09/2026). */}
          <div className="cmp-hint" style={css('align-items:center;justify-content:center;gap:6px;margin-bottom:10px;font-family:var(--font-inter),sans-serif;font-size:12.5px;font-weight:600;color:var(--sp-teal-900)')}>Deslizá para ver Silver y Gold <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></div>
          <div className="sq" style={css('border:1px solid var(--sp-line);--sq:var(--r-lg);overflow:hidden;overflow-x:auto')}>
            <div className="pl-inner" style={css('min-width:720px')}>
              <div className="pl-row" style={css('display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;background:var(--sp-navy);color:#fff')}>
                <div className="pl-lbl disp" style={css('position:sticky;left:0;z-index:1;background:var(--sp-navy);padding:16px 18px;display:flex;align-items:flex-end;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase')}>Servicio</div>
                {plansArr.map((pl, i) => (
                  <div key={i} style={css('padding:14px 12px;text-align:center;border-left:1px solid rgba(255,255,255,0.12)')}>
                    <div style={css('display:inline-block;width:9px;height:9px;border-radius:var(--r-pill);background:' + pl.color + ';margin-bottom:6px')}></div>
                    <div className="disp" style={css('font-size:18px;font-weight:800;line-height:1')}>{pl.short}</div>
                    <div style={css('font-size:12px;opacity:.85;margin-top:5px')}>desde <span className="num-tnum">{fmt(pl.price)}</span>{pl.nivel === 'esencial' && <span style={css('display:block;font-size:11px;opacity:.9;margin-top:2px')}>según tu zona</span>}</div>
                  </div>
                ))}
              </div>
              {cov.map((item, r) => (
                <div key={r} className="pl-row" style={css('display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;border-top:1px solid var(--sp-line-2);background:' + (r % 2 ? 'var(--sp-surface-2)' : '#fff'))}>
                  <div className="pl-lbl" style={css('position:sticky;left:0;z-index:1;background:inherit;padding:15px 18px;display:flex;flex-direction:column;justify-content:center')}>
                    <span className="disp" style={css('font-size:14px;font-weight:700;color:var(--sp-navy)')}>{item.name}</span>
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
                        <div className="disp" style={css(badge(c))}>{c.s}</div>
                        <div style={css('font-family:var(--font-inter),sans-serif;font-size:12px;color:var(--sp-muted);line-height:1.4;margin-top:6px')}>{annotate(c.d)}</div>
                        {espera && (
                          <div style={css('font-family:var(--font-inter),sans-serif;font-size:11.5px;color:var(--sp-muted);line-height:1.4;margin-top:6px;display:flex;align-items:center;justify-content:center;gap:4px')}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
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
          <div style={css('font-family:var(--font-inter),sans-serif;font-size:12.5px;color:var(--sp-muted);margin-top:13px;text-align:center;line-height:1.6')}>
            Los tiempos de espera son la <Term k="carencia">carencia</Term> de cada servicio: el reloj arranca el día que te afiliás, no el día que lo necesitás. El detalle final lo confirmás con tu asesor.
          </div>
        </div>
      </section>

      {/* ---- 4. LO QUE NO CUBREN NINGÚN PLAN -----------------------------
          A la vista, no a un toque: si la persona no lo ve, puede elegir mal
          (regla de claridad, 27/09). En gris, sin dramatismo y con lo que SÍ
          entra al lado; rojo jamás (es solo para urgencias). Sin número en el
          título a propósito: el home habla de cuatro y acá van seis, porque
          suma enfermería a domicilio (cláusula 2.9.2) y hemodinamia. Si algún
          día se unifica, que sea sumando en el home, no restando acá. */}
      <section style={css('padding:70px 24px 0')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          {titulo('Lo que nuestros planes', 'no cubren', 'Preferimos que lo sepas ahora y no en la sala de espera. Valen para los tres planes, con una diferencia: Essential cubre la odontología básica en Lister.')}
          <div className="excl-grid" style={css('display:grid;grid-template-columns:1fr 1fr;gap:12px')}>
            {excluidos.map((e) => (
              <div className="sq" key={e.n} style={css('background:var(--sp-estado-bg);border:1px solid var(--sp-line-3);--sq:var(--r-md);padding:18px 20px')}>
                <div className="disp" style={css('font-size:15px;font-weight:800;color:var(--sp-text);margin-bottom:6px')}>{e.n}</div>
                <div style={css('font-family:var(--font-inter),sans-serif;font-size:13.5px;color:var(--sp-text-2);line-height:1.6')}>{e.d}</div>
              </div>
            ))}
            <div className="sq" style={css('background:var(--sp-mint-bg);border:1px solid var(--sp-mint-line-strong);--sq:var(--r-md);padding:18px 20px;display:flex;flex-direction:column;justify-content:center')}>
              <div className="disp" style={css('font-size:15px;font-weight:800;color:var(--sp-navy);margin-bottom:6px')}>¿Te preocupa alguna?</div>
              <div style={css('font-family:var(--font-inter),sans-serif;font-size:13.5px;color:var(--sp-text);line-height:1.6')}>Decíselo a tu asesor <b>antes de firmar</b>: te va a decir con qué contás y con qué no.</div>
            </div>
            <div className="sq" style={css('background:var(--sp-mint-bg);border:1px solid var(--sp-mint-line-strong);--sq:var(--r-md);padding:18px 20px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start')}>
              <div className="disp" style={css('font-size:15px;font-weight:800;color:var(--sp-navy);margin-bottom:6px')}>¿Tenés una orden del médico?</div>
              <div style={css('font-family:var(--font-inter),sans-serif;font-size:13.5px;color:var(--sp-text);line-height:1.6')}>Mandanos la foto por WhatsApp y una asesora te dice si entra, antes de que elijas.</div>
              <a
                href={WA_ORDEN}
                onClick={() => track('click_whatsapp', { origen: 'planes_orden' })}
                target="_blank"
                rel="noopener"
                className="btn-wa-outline disp sq"
                style={css('margin-top:12px;display:inline-flex;align-items:center;justify-content:center;gap:9px;height:44px;padding:0 18px;--sq:var(--r-sm);background:#fff;color:var(--sp-teal-deep);border:1.5px solid var(--sp-teal);font-size:14px;font-weight:700')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z" /></svg>
                Mandar la foto por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---- 5. EL DETALLE FINO, A UN TOQUE ------------------------------
          Amplía lo que ya se ve y no cambia la elección: va plegado. Sigue en
          el HTML (Plegable), así que Google lo lee y quien copia el sitio no
          tiene que armar nada. */}
      <section style={css('padding:70px 24px 0')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          {titulo('Si necesitás más,', 'está acá', 'Cada tema se abre con un toque.')}
          <div style={css('display:flex;flex-direction:column;gap:10px')}>
            <Detalle
              id="detalle-especialidades"
              titulo={`Las ${especialidades.length} especialidades y cuántas veces al año`}
              bajada={'Donde dice "sin tope" es sin tope de verdad: las que tienen número, lo tienen escrito acá.'}
              abierto={!!abierto.especialidades}
              onToggle={() => alternar('especialidades')}
            >
              <div className="sq" style={css('border:1px solid var(--sp-line);--sq:var(--r-md);overflow:hidden;overflow-x:auto')}>
                <div style={css('min-width:600px')}>
                  <div className="disp" style={css('display:grid;grid-template-columns:2fr 1fr 1fr 1fr;background:var(--sp-navy);color:#fff;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase')}>
                    <div style={css('padding:13px 18px')}>Especialidad</div>
                    {plansArr.map((pl) => (
                      <div key={pl.short} style={css('padding:13px 12px;text-align:center;border-left:1px solid rgba(255,255,255,0.12)')}>{pl.short}</div>
                    ))}
                  </div>
                  {especialidades.map((esp, r) => (
                    <div key={esp.n} style={css('display:grid;grid-template-columns:2fr 1fr 1fr 1fr;border-top:1px solid var(--sp-line-2);background:' + (r % 2 ? 'var(--sp-surface-2)' : '#fff'))}>
                      <div className="disp" style={css('padding:12px 18px;font-size:13.5px;font-weight:700;color:var(--sp-navy);display:flex;align-items:center')}>{esp.n}</div>
                      {PLAN_KEYS.map((k) => {
                        const [cob, cantIdx] = esp[k];
                        // Essential nombra una lista cerrada: la que no está, no entra.
                        const texto = cob === 5 ? 'No entra en este plan' : cantIdx >= 0 ? datos.cantidades[cantIdx] : '—';
                        return (
                          <div key={k} style={css('padding:12px;text-align:center;border-left:1px solid var(--sp-line-2);font-family:var(--font-inter),sans-serif;font-size:13px;color:var(--sp-text);line-height:1.4')}>
                            {texto}
                            {cob === 1 && <div className="disp" style={css('font-size:11px;font-weight:700;color:var(--sp-estado-ink-2);margin-top:3px')}>Pagás la mitad</div>}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </Detalle>

            <Detalle
              id="detalle-internacion"
              titulo="Internación, maternidad y topes de medicamentos"
              bajada="Días de terapia intensiva, topes de remedios y esperas de maternidad: lo que más se extraña el día que hace falta."
              abierto={!!abierto.internacion}
              onToggle={() => alternar('internacion')}
            >
              <div style={css('display:flex;flex-direction:column;gap:14px')}>
                {seccionesParam.map((grupo) => (
                  <div className="sq" key={grupo.sec} style={css('border:1px solid var(--sp-line);--sq:var(--r-md);overflow:hidden;overflow-x:auto')}>
                    <div style={css('min-width:600px')}>
                      <div className="disp" style={css('display:grid;grid-template-columns:2fr 1fr 1fr 1fr;background:var(--sp-blue-bg);color:var(--sp-navy);font-size:12px;font-weight:800;letter-spacing:.05em;text-transform:uppercase')}>
                        <div style={css('padding:12px 18px')}>{grupo.sec}</div>
                        {plansArr.map((pl) => (
                          <div key={pl.short} style={css('padding:12px;text-align:center;border-left:1px solid var(--sp-blue-line)')}>{pl.short}</div>
                        ))}
                      </div>
                      {grupo.filas.map((f, r) => (
                        <div key={f.p} style={css('display:grid;grid-template-columns:2fr 1fr 1fr 1fr;border-top:1px solid var(--sp-line-2);background:' + (r % 2 ? 'var(--sp-surface-2)' : '#fff'))}>
                          <div style={css('padding:13px 18px;font-family:var(--font-inter),sans-serif;font-size:13.5px;color:var(--sp-text);line-height:1.5;display:flex;align-items:center')}>{etiquetaParam(f.p)}</div>
                          {f.v.map((v, j) => (
                            <div key={j} className="disp" style={css('padding:13px 12px;text-align:center;font-size:13.5px;font-weight:700;color:var(--sp-navy);line-height:1.4;display:flex;align-items:center;justify-content:center')}>{v ? valorParam(v) : '—'}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Detalle>
          </div>
        </div>
      </section>

      {/* ---- 6. VITAL + CIERRE ------------------------------------------
          «Simulá Plan Vital» va en turquesa como todo botón lleno: ningún plan
          tiene color propio, tampoco Vital (lámina 74 A; Arturo confirmó que
          Vital sigue la regla el 06/10/2026, sp-interno#141 punto 5). */}
      <section style={css('padding:60px 24px 0')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          <div className="two-col sq" style={css('background:var(--sp-blue-bg);border:0.5px solid var(--sp-blue-line);--sq:var(--r-md);padding:24px 28px;display:grid;grid-template-columns:auto 1fr auto;gap:26px;align-items:center')}>
            <div className="disp sq" style={css('background:var(--sp-navy);color:#fff;--sq:var(--r-sm);padding:16px 22px;text-align:center;font-weight:800')}><div style={css('font-size:11px;letter-spacing:.2em;opacity:.85')}>SP</div><div style={css('font-size:20px')}>SENIOR</div></div>
            <div>
              <div className="disp" style={css('font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--sp-teal-900);margin-bottom:6px')}>Plan aparte · 65 años o más</div>
              <div style={css('font-family:var(--font-inter),sans-serif;font-size:16px;color:var(--sp-text);line-height:1.55')}>¿Buscás para tus padres o un adulto mayor? <b style={css('color:var(--sp-navy)')}>Plan Vital</b> está pensado para ellos: consultas, urgencias 24 h y ambulancia a domicilio.</div>
            </div>
            <a href={`${BP}/simulador/?plan=vital`} onClick={() => track('cta_simulador', { origen: 'planes_senior' })} className="btn-teal sq" style={css('height:46px;padding:0 22px;--sq:var(--r-sm);background:var(--sp-teal-deep);color:#fff;font-size:14px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;white-space:nowrap')}>Simulá Plan Vital</a>
          </div>
        </div>
      </section>

      <section style={css('padding:44px 24px 80px')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          <div className="sq" style={css('background:var(--sp-navy);--sq:var(--r-lg);padding:44px 32px;text-align:center')}>
            <h2 className="disp" style={css('font-size:clamp(24px,3.2vw,33px);font-weight:800;color:#fff;line-height:1.15;letter-spacing:-0.02em;margin:0 0 12px')}>Ya sabés qué cubre. Falta lo tuyo</h2>
            <p style={css('font-family:var(--font-inter),sans-serif;font-size:16px;line-height:1.6;color:var(--sp-blue-soft);margin:0 auto 24px;max-width:520px')}>
              Unas preguntas y ves el precio real de tu grupo en los tres planes. Sin dejar el teléfono, sin que te llame nadie.
            </p>
            <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'planes_cierre' })} className="btn-teal disp sq" style={css('height:52px;padding:0 30px;--sq:var(--r-sm);background:var(--sp-teal-deep);color:#fff;font-size:16px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:8px')}>
              Simulá tu plan
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
