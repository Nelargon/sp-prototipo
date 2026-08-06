'use client';

import { useState, useEffect, useRef } from 'react';
import { css } from '../css';
import { BP } from '../basePath';
import { fmt, plans, AUTO_PAY_DISCOUNT } from '../quote';
import { coverage } from '../coverage';
import { Term, waitLabel, annotate } from '../glossary';
import { track } from '../track';
import Header from '../Header';
import Buscador from './Buscador';
import datos from '../../lib/prestaciones.json';

/* /que-cubre — el espacio propio de los planes Bronze, Silver y Gold (la
   familia que internamente se llama "Privilege"; de cara al usuario NUNCA se
   nombra así — HANDOFF dec. 11o).
   ----------------------------------------------------------------------------
   ⚠ NO es /planes y no la reemplaza. Decisión del usuario (6 ago 2026): "que
   sea un espacio aparte". `/planes` sigue siendo la comparación servicio por
   servicio dentro del sitio; ESTA es una landing con vida propia — la que se
   le pasa a alguien por WhatsApp, la que recibe una campaña, la que se mide
   sola. Por eso repite deliberadamente cosas que también están en /planes (la
   tabla de 11 servicios, la banda Vital): una landing tiene que cerrar el
   argumento completo sin depender de que alguien navegue a otro lado.

   Qué la hace distinta de una página de planes cualquiera: no abre con tres
   precios, abre con un buscador. La grilla oficial vive en el repo desde julio
   con 935 estudios, análisis y cirugías; acá se puede consultar. El argumento
   va en este orden:

     1. Buscá lo tuyo        → la promesa, verificable en 5 segundos
     2. Los tres planes      → cuánto sale cada uno
     3. Qué ganás al subir   → el upsell honesto, contado en cosas concretas
     4. Servicio por servicio→ la comparación de un vistazo
     5. Consultas            → 43 especialidades con su tope
     6. Los números finos    → UTI, topes de remedios, maternidad
     7. Lo que no cubre nadie→ dicho antes de firmar, no después
     8. Vital + cierre       → a quién le sirve otra cosa, y el precio real

   ⚠ NO reponer acá el bloque "cobertura real 45/66/93". Se eliminó del home el
   25/07/2026 por decisión del usuario ("la transparencia tiene que cumplir un
   propósito"): informa cuán incompleto es un plan sin ayudar a decidir. La
   sección 3 usa los mismos datos para responder lo que sí decide. */

const PLAN_KEYS = ['b', 's', 'o'];

const seccionTitulo = (kicker, titulo, resalte, bajada) => (
  <div data-rv style={css('text-align:center;max-width:700px;margin:0 auto 26px')}>
    <div className="disp" style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#007d77;margin-bottom:13px')}>{kicker}</div>
    <h2 className="disp" style={css('font-size:clamp(27px,3.6vw,38px);font-weight:800;color:#003B71;line-height:1.15;letter-spacing:-0.02em;margin:0 0 13px')}>
      {titulo} <span style={css('color:#007d77')}>{resalte}</span>
    </h2>
    <p style={css('font-family:var(--font-inter),sans-serif;font-size:16.5px;line-height:1.6;color:#3D3D3D;margin:0')}>{bajada}</p>
  </div>
);

/* Entrada suave de las secciones, con el mismo mecanismo del home.
   ⚠ La clase `rvon` se prende DESDE ACÁ, nunca desde el JSX: es la que esconde
   los bloques hasta que se revelan. Si estuviera en el markup y el JS no
   llegara a correr (error, bloqueo, bot), la página entera quedaría invisible.
   Puesta desde el efecto, sin JS simplemente no hay animación y se ve todo. */
function useRevelado(ref) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = [];
    root.classList.add('rvon');
    root.querySelectorAll('[data-rv]').forEach((n) => { n.classList.add('rv'); targets.push(n); });
    const revisar = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      for (let i = targets.length - 1; i >= 0; i--) {
        /* Basta con que el bloque haya llegado a la línea de revelado. NO se
           pide además que siga en pantalla (`bottom > -80`): con un salto de
           scroll —un ancla, un "ir al final", el teclado— los bloques que
           quedaron ARRIBA del viewport nunca volverían a cumplir esa condición
           y se quedarían invisibles para siempre. Verificado en Playwright:
           con la condición extra, saltar al pie dejaba 12 secciones en blanco. */
        if (targets[i].getBoundingClientRect().top < vh * 0.9) {
          targets[i].classList.add('in');
          targets.splice(i, 1);
        }
      }
    };
    revisar();
    // Los resultados del buscador cambian la altura de la página: sin el
    // resize, una sección que quedó fuera de vista no se revela nunca.
    window.addEventListener('scroll', revisar, { passive: true });
    window.addEventListener('resize', revisar);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(revisar).catch(() => {});
    return () => {
      window.removeEventListener('scroll', revisar);
      window.removeEventListener('resize', revisar);
    };
  }, [ref]);
}

export default function Landing() {
  const plansArr = plans();
  const cov = coverage();
  const [verTodas, setVerTodas] = useState(false);
  const raiz = useRef(null);
  useRevelado(raiz);

  const badge = (c) =>
    'display:inline-flex;align-items:center;font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px;white-space:nowrap;' +
    (c.ok ? 'background:#E6F7F6;color:#007d77' : 'background:#F8F1DE;color:#7a5f10');

  const especialidades = datos.items.filter((i) => i.t === 'c');
  const especialidadesVisibles = verTodas ? especialidades : especialidades.slice(0, 12);
  const excluidos = datos.items.filter((i) => i.t === 'x');
  const { bs, so } = datos.saltos;
  const nombreCuadro = (k) => datos.meta.cuadros[k].toLowerCase();

  /* Las secciones de parámetros vienen agrupadas del master (Internación,
     Topes…). Se respeta ese agrupamiento: es como lo lee quien vende. */
  const seccionesParam = [];
  for (const p of datos.parametros) {
    const ult = seccionesParam[seccionesParam.length - 1];
    if (ult && ult.sec === p.sec) ult.filas.push(p);
    else seccionesParam.push({ sec: p.sec, filas: [p] });
  }

  return (
    <div ref={raiz} className="body" style={css('min-height:100vh;background:#fff;color:#1D1D1B')}>
      <Header variant="solid" />

      {/* ---- 1. HERO + BUSCADOR ------------------------------------------
          El buscador va ARRIBA, no al final. Es la única parte de la página
          que no se puede copiar con un rediseño: cualquiera publica tres
          precios, nadie publica las 935 filas de su grilla. */}
      <section style={css('padding:100px 24px 12px')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          <div style={css('text-align:center;max-width:720px;margin:0 auto 26px')}>
            <div className="disp" style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#007d77;margin-bottom:14px')}>Bronze · Silver · Gold</div>
            <h1 className="disp" style={css('font-size:clamp(32px,5vw,50px);font-weight:800;color:#003B71;line-height:1.1;letter-spacing:-0.025em;margin:0 0 16px')}>
              Tres planes que <span style={css('color:#007d77')}>podés revisar antes de firmar</span>.
            </h1>
            <p style={css('font-family:var(--font-inter),sans-serif;font-size:17.5px;line-height:1.6;color:#3D3D3D;margin:0')}>
              Preguntá por el estudio que te pidió el doctor, por la cirugía que te preocupa o por el especialista que buscás. Te decimos qué hace cada plan con eso — <b style={css('color:#003B71')}>incluso cuando la respuesta no nos conviene</b>.
            </p>
          </div>
          <Buscador />
        </div>
      </section>

      {/* ---- 2. LOS TRES PLANES ------------------------------------------ */}
      <section style={css('padding:64px 24px 0')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          {seccionTitulo('Los tres planes', 'Cada uno incluye todo el anterior', 'y suma lo suyo.', 'El precio es nacional y ya tiene IVA. Con débito automático o tarjeta de crédito, 10% menos.')}
          <div className="planes-grid" style={css('display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px')}>
            {plansArr.map((pl, i) => (
              <div key={pl.short} data-rv className="lift" style={css('border:1px solid #E8E8E8;border-radius:18px;overflow:hidden;background:#fff;display:flex;flex-direction:column;box-shadow:0 1px 3px rgba(0,0,0,0.06)')}>
                <div style={css('height:5px;background:' + pl.color)}></div>
                <div style={css('padding:22px 22px 24px;display:flex;flex-direction:column;flex:1')}>
                  <div style={css('display:flex;align-items:center;gap:8px;margin-bottom:5px')}>
                    <span style={css('width:10px;height:10px;border-radius:999px;background:' + pl.color)}></span>
                    <span className="disp" style={css('font-size:21px;font-weight:800;color:#003B71')}>{pl.short}</span>
                  </div>
                  {/* La etiqueta se gana el lugar: dice para quién es, cosa que
                      el nombre del metal no dice (regla de etiquetas). */}
                  <div style={css('font-family:var(--font-inter),sans-serif;font-size:13px;color:#6B6B6B;line-height:1.45;margin-bottom:14px')}>{pl.tag}</div>
                  <div style={css('display:flex;align-items:baseline;gap:7px;flex-wrap:wrap')}>
                    <span style={css('font-family:var(--font-inter),sans-serif;font-size:12.5px;color:#6B6B6B')}>desde</span>
                    <span className="disp num-tnum" style={css('font-size:27px;font-weight:800;color:#003B71;letter-spacing:-0.02em')}>{fmt(pl.price)}</span>
                    <span style={css('font-family:var(--font-inter),sans-serif;font-size:12.5px;color:#6B6B6B')}>por mes</span>
                  </div>
                  <div style={css('font-family:var(--font-inter),sans-serif;font-size:12.5px;color:#00736e;margin-top:5px')}>
                    <span className="num-tnum">{fmt(Math.round(pl.price * (1 - AUTO_PAY_DISCOUNT)))}</span> con pago automático
                  </div>
                  <ul style={css('list-style:none;padding:0;margin:17px 0 0;display:flex;flex-direction:column;gap:9px;flex:1')}>
                    {pl.lines.map((l, j) => (
                      <li key={j} style={css('display:flex;gap:9px;align-items:flex-start;font-family:var(--font-inter),sans-serif;font-size:13.5px;color:#3D3D3D;line-height:1.5')}>
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00BCB4" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:3px')} aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                        <span>{annotate(l)}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`${BP}/simulador/?plan=${pl.short.toLowerCase()}`}
                    onClick={() => track('cta_simulador', { origen: 'quecubre_tarjeta', plan: pl.name })}
                    className="btn-teal"
                    style={css('margin-top:20px;height:46px;border-radius:12px;background:#007d77;color:#fff;font-size:14.5px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:7px')}
                  >
                    Ver mi precio real
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div style={css('font-family:var(--font-inter),sans-serif;font-size:12.5px;color:#6B6B6B;text-align:center;margin-top:13px')}>
            El precio de arriba es el de una persona sola. El tuyo depende de quiénes entran y de la edad — sale en un minuto en el simulador.
          </div>
        </div>
      </section>

      {/* ---- 3. QUÉ GANÁS AL SUBIR DE PLAN -------------------------------
          El upsell honesto: cada número sale de contar los ítems que MEJORAN
          de modo entre un plan y el siguiente, y se puede verificar uno por
          uno en el buscador de arriba. Nada de "45% cubierto" (ver el aviso
          del encabezado del archivo). */}
      <section style={css('padding:70px 24px 0')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          {seccionTitulo('Subir un escalón', 'Qué comprás exactamente', 'cuando pasás al plan de arriba.', 'No es "más cobertura" en abstracto. Contamos cuántas cosas de la grilla cambian a tu favor — y podés verificar cada una en el buscador de arriba.')}
          <div className="planes-grid-2" style={css('display:grid;grid-template-columns:1fr 1fr;gap:16px')}>
            {[
              { de: 'Bronze', a: 'Silver', color: '#66717E', d: bs },
              { de: 'Silver', a: 'Gold', color: '#B8860B', d: so },
            ].map((s) => (
              <div key={s.a} data-rv className="rv" style={css('background:#F7FBFB;border:1px solid #d9efed;border-radius:18px;padding:24px 26px')}>
                <div className="disp" style={css('display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;color:#003B71;margin-bottom:12px')}>
                  {s.de}
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#007d77" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  <span style={css('color:' + s.color)}>{s.a}</span>
                </div>
                <div style={css('display:flex;align-items:baseline;gap:10px;flex-wrap:wrap')}>
                  <span className="disp num-tnum" style={css('font-size:44px;font-weight:800;color:#007d77;line-height:1;letter-spacing:-0.03em')}>{s.d.total}</span>
                  <span style={css('font-family:var(--font-inter),sans-serif;font-size:15px;color:#3D3D3D;line-height:1.45')}>cosas mejoran</span>
                </div>
                <div style={css('font-family:var(--font-inter),sans-serif;font-size:14px;color:#3D3D3D;line-height:1.6;margin-top:12px')}>
                  El salto está sobre todo en <b style={css('color:#003B71')}>{nombreCuadro(s.d.donde[0].c)}</b> ({s.d.donde[0].n} de los {s.d.total}).
                  {s.d.desdeConvenio > 0 && (
                    <> Y <b style={css('color:#003B71')}>{s.d.desdeConvenio}</b> pasan de pagarlos vos enteros a tener cobertura.</>
                  )}
                </div>
                <div style={css('display:flex;flex-wrap:wrap;gap:6px;margin-top:14px')}>
                  {s.d.donde.map((d) => (
                    <span key={d.c} className="disp" style={css('font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:999px;background:#fff;border:1px solid #cfe6e4;color:#00736e')}>
                      {datos.meta.cuadros[d.c]} · <span className="num-tnum">{d.n}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- 4. SERVICIO POR SERVICIO (la tabla que ya existía) ---------- */}
      <section style={css('padding:70px 24px 0')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          {seccionTitulo('Servicio por servicio', 'Los once servicios', 'que más se preguntan.', 'La comparación de un vistazo, con la letra chica al lado y no escondida.')}
          <div data-rv style={css('border:1px solid #E8E8E8;border-radius:18px;overflow:hidden;overflow-x:auto')}>
            <div style={css('min-width:720px')}>
              <div style={css('display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;background:#003B71;color:#fff')}>
                <div className="disp" style={css('padding:16px 18px;display:flex;align-items:flex-end;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase')}>Servicio</div>
                {plansArr.map((pl, i) => (
                  <div key={i} style={css('padding:14px 12px;text-align:center;border-left:1px solid rgba(255,255,255,0.12)')}>
                    <div style={css('display:inline-block;width:9px;height:9px;border-radius:999px;background:' + pl.color + ';margin-bottom:6px')}></div>
                    <div className="disp" style={css('font-size:18px;font-weight:800;line-height:1')}>{pl.short}</div>
                    <div style={css('font-size:12px;opacity:.85;margin-top:5px')}>desde <span className="num-tnum">{fmt(pl.price)}</span></div>
                    <a href={`${BP}/simulador/?plan=${pl.short.toLowerCase()}`} onClick={() => track('cta_simulador', { origen: 'quecubre_tabla', plan: pl.name })} className="disp" style={css('margin-top:9px;height:34px;padding:0 14px;border-radius:9px;background:#007d77;color:#fff;font-size:12.5px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:5px;transition:background .2s')}>Ver mi precio</a>
                  </div>
                ))}
              </div>
              {cov.map((item, r) => (
                <div key={r} style={css('display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;border-top:1px solid #F0F0F0;background:' + (r % 2 ? '#FAFCFC' : '#fff'))}>
                  <div style={css('padding:15px 18px;display:flex;flex-direction:column;justify-content:center')}>
                    <span className="disp" style={css('font-size:14px;font-weight:700;color:#003B71')}>{item.name}</span>
                    {item.waitNote && (
                      <span style={css('font-family:var(--font-inter),sans-serif;font-size:11.5px;color:#6B6B6B;line-height:1.4;margin-top:4px')}>{item.waitNote}</span>
                    )}
                  </div>
                  {item.cov.map((c, j) => {
                    // La espera solo se muestra donde HAY cobertura: en un plan que
                    // no cubre el servicio no hay nada que esperar (regla AD, ver
                    // app/coverage.js y BITACORA cap. 55).
                    const espera = c.ok && item.wait ? waitLabel(item.wait[j]) : null;
                    return (
                      <div key={j} style={css('padding:14px 12px;text-align:center;border-left:1px solid #F0F0F0')}>
                        <div className="disp" style={css(badge(c))}>{c.s}</div>
                        <div style={css('font-family:var(--font-inter),sans-serif;font-size:12px;color:#6B6B6B;line-height:1.4;margin-top:6px')}>{annotate(c.d)}</div>
                        {espera && (
                          <div style={css('font-family:var(--font-inter),sans-serif;font-size:11.5px;color:#6B6B6B;line-height:1.4;margin-top:6px;display:flex;align-items:center;justify-content:center;gap:4px')}>
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
          <div style={css('font-family:var(--font-inter),sans-serif;font-size:12.5px;color:#6B6B6B;margin-top:13px;text-align:center;line-height:1.6')}>
            Los tiempos de espera son la <Term k="carencia">carencia</Term> de cada servicio: el reloj arranca el día que te afiliás, no el día que lo necesitás.
          </div>
        </div>
      </section>

      {/* ---- 5. CONSULTAS POR ESPECIALIDAD ------------------------------- */}
      <section style={css('padding:70px 24px 0')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          {seccionTitulo('Con qué especialista', `Las ${especialidades.length} especialidades`, 'y cuántas veces al año.', 'Donde dice "sin tope" es sin tope de verdad: las que tienen número, lo tienen escrito acá.')}
          <div data-rv style={css('border:1px solid #E8E8E8;border-radius:18px;overflow:hidden;overflow-x:auto')}>
            <div style={css('min-width:600px')}>
              <div className="disp" style={css('display:grid;grid-template-columns:2fr 1fr 1fr 1fr;background:#003B71;color:#fff;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase')}>
                <div style={css('padding:13px 18px')}>Especialidad</div>
                {plansArr.map((pl) => (
                  <div key={pl.short} style={css('padding:13px 12px;text-align:center;border-left:1px solid rgba(255,255,255,0.12)')}>{pl.short}</div>
                ))}
              </div>
              {especialidadesVisibles.map((esp, r) => (
                <div key={esp.n} style={css('display:grid;grid-template-columns:2fr 1fr 1fr 1fr;border-top:1px solid #F0F0F0;background:' + (r % 2 ? '#FAFCFC' : '#fff'))}>
                  <div className="disp" style={css('padding:12px 18px;font-size:13.5px;font-weight:700;color:#003B71;display:flex;align-items:center')}>{esp.n}</div>
                  {PLAN_KEYS.map((k) => {
                    const [cob, cantIdx] = esp[k];
                    const texto = cantIdx >= 0 ? datos.cantidades[cantIdx] : '—';
                    const copago = cob === 1;
                    return (
                      <div key={k} style={css('padding:12px;text-align:center;border-left:1px solid #F0F0F0;font-family:var(--font-inter),sans-serif;font-size:13px;color:#3D3D3D;line-height:1.4')}>
                        {texto}
                        {copago && <div className="disp" style={css('font-size:11px;font-weight:700;color:#4f5c5b;margin-top:3px')}>Pagás la mitad</div>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          {!verTodas && (
            <div style={css('text-align:center;margin-top:14px')}>
              <button
                type="button"
                onClick={() => { setVerTodas(true); track('quecubre_ver_especialidades'); }}
                className="disp"
                style={css('height:44px;padding:0 22px;border-radius:12px;border:1px solid #cfe6e4;background:#fff;color:#007d77;font-size:14px;font-weight:700;cursor:pointer')}
              >
                Ver las {especialidades.length} especialidades
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ---- 6. LOS NÚMEROS FINOS ---------------------------------------- */}
      <section style={css('padding:70px 24px 0')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          {seccionTitulo('La letra chica, en letra grande', 'Los números que deciden', 'cuando ya estás internado.', 'Días de terapia intensiva, topes de medicamentos, esperas de maternidad. Es lo que casi nadie publica y lo que más se extraña el día que hace falta.')}
          <div data-rv style={css('display:flex;flex-direction:column;gap:14px')}>
            {seccionesParam.map((grupo) => (
              <div key={grupo.sec} style={css('border:1px solid #E8E8E8;border-radius:16px;overflow:hidden;overflow-x:auto')}>
                <div style={css('min-width:600px')}>
                  <div className="disp" style={css('display:grid;grid-template-columns:2fr 1fr 1fr 1fr;background:#E6EDF4;color:#003B71;font-size:12px;font-weight:800;letter-spacing:.05em;text-transform:uppercase')}>
                    <div style={css('padding:12px 18px')}>{grupo.sec}</div>
                    {plansArr.map((pl) => (
                      <div key={pl.short} style={css('padding:12px;text-align:center;border-left:1px solid #d4e0ee')}>{pl.short}</div>
                    ))}
                  </div>
                  {grupo.filas.map((f, r) => (
                    <div key={f.p} style={css('display:grid;grid-template-columns:2fr 1fr 1fr 1fr;border-top:1px solid #F0F0F0;background:' + (r % 2 ? '#FAFCFC' : '#fff'))}>
                      <div style={css('padding:13px 18px;font-family:var(--font-inter),sans-serif;font-size:13.5px;color:#3D3D3D;line-height:1.5;display:flex;align-items:center')}>{f.p}</div>
                      {f.v.map((v, j) => (
                        <div key={j} className="disp" style={css('padding:13px 12px;text-align:center;font-size:13.5px;font-weight:700;color:#003B71;line-height:1.4;display:flex;align-items:center;justify-content:center')}>{v || '—'}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- 7. LO QUE NO CUBRE NINGÚN PLAN ------------------------------
          En gris, sin dramatismo y con lo que SÍ entra al lado — una exclusión
          sin contexto asusta más de lo que informa (mismo criterio que el home
          y app/glossary.jsx). Rojo jamás: es solo para urgencias. */}
      <section style={css('padding:70px 24px 0')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          {/* ⚠ Sin número en el copete, a propósito. El home habla de "cuatro
              cosas que nuestros planes no cubren" (odontología, bariátrica,
              oncológico, alta complejidad); acá va también **enfermería a
              domicilio** (cláusula 2.9.2), porque el buscador tiene que
              responderle a quien escribe "enfermera a domicilio" en vez de
              dejarlo deducir del silencio. Las dos páginas dicen la verdad;
              cantar "cinco" acá y "cuatro" allá sí sería una contradicción a
              la vista. Si algún día se unifica, que sea sumando en el home —
              no restando acá. Ver HANDOFF. */}
          {seccionTitulo('Antes de firmar', 'Lo que nuestros planes', 'no cubren.', 'Preferimos que lo sepas ahora y no en la sala de espera. Son las mismas en Bronze, Silver y Gold.')}
          <div data-rv className="excl-grid" style={css('display:grid;grid-template-columns:1fr 1fr;gap:12px')}>
            {excluidos.map((e) => (
              <div key={e.n} style={css('background:#F4F5F6;border:1px solid #e6e8ea;border-radius:14px;padding:18px 20px')}>
                <div className="disp" style={css('font-size:15px;font-weight:800;color:#333;margin-bottom:6px')}>{e.n}</div>
                <div style={css('font-family:var(--font-inter),sans-serif;font-size:13.5px;color:#4a4a4a;line-height:1.6')}>{e.d}</div>
              </div>
            ))}
            <div style={css('background:#E6F7F6;border:1px solid #cfe6e4;border-radius:14px;padding:18px 20px;display:flex;flex-direction:column;justify-content:center')}>
              <div className="disp" style={css('font-size:15px;font-weight:800;color:#003B71;margin-bottom:6px')}>¿Te preocupa alguna?</div>
              <div style={css('font-family:var(--font-inter),sans-serif;font-size:13.5px;color:#3D3D3D;line-height:1.6')}>Decíselo a tu asesor <b>antes de firmar</b>: te va a decir con qué contás y con qué no.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- 8. VITAL + CIERRE ------------------------------------------- */}
      <section style={css('padding:60px 24px 0')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          <div data-rv className="two-col" style={css('background:#E6EDF4;border:0.5px solid #d4e0ee;border-radius:16px;padding:24px 28px;display:grid;grid-template-columns:auto 1fr auto;gap:26px;align-items:center')}>
            <div className="disp" style={css('background:#003B71;color:#fff;border-radius:12px;padding:16px 22px;text-align:center;font-weight:800')}><div style={css('font-size:11px;letter-spacing:.2em;opacity:.85')}>SP</div><div style={css('font-size:20px')}>SENIOR</div></div>
            <div>
              <div className="disp" style={css('font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#00736e;margin-bottom:6px')}>Plan aparte · 65 años o más</div>
              <div style={css('font-family:var(--font-inter),sans-serif;font-size:16px;color:#3D3D3D;line-height:1.55')}>¿Buscás para tus padres o un adulto mayor? <b style={css('color:#003B71')}>Plan Vital</b> está pensado para ellos: consultas, urgencias 24 h y ambulancia a domicilio.</div>
            </div>
            <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'quecubre_senior' })} className="btn-navy" style={css('height:46px;padding:0 22px;border-radius:12px;background:#003B71;color:#fff;font-size:14px;font-weight:700;display:inline-flex;align-items:center;white-space:nowrap')}>Simulá Plan Vital</a>
          </div>
        </div>
      </section>

      <section style={css('padding:44px 24px 80px')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          <div data-rv style={css('background:#003B71;border-radius:20px;padding:44px 32px;text-align:center')}>
            <h2 className="disp" style={css('font-size:clamp(24px,3.2vw,33px);font-weight:800;color:#fff;line-height:1.15;letter-spacing:-0.02em;margin:0 0 12px')}>Ya sabés qué cubre. Falta lo tuyo.</h2>
            <p style={css('font-family:var(--font-inter),sans-serif;font-size:16px;line-height:1.6;color:#B3C7DB;margin:0 auto 24px;max-width:520px')}>
              Unas preguntas y ves el precio real de tu grupo en los tres planes. Sin dejar el teléfono, sin que te llame nadie.
            </p>
            <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'quecubre_cierre' })} className="btn-teal disp" style={css('height:52px;padding:0 30px;border-radius:13px;background:#007d77;color:#fff;font-size:16px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:8px')}>
              Simulá tu plan
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </div>
          {/* Dos salidas, porque esta landing puede ser la PRIMERA página que
              alguien ve (le llegó el link, no navegó hasta acá): una al sitio
              y otra a la comparación de /planes. */}
          <div style={css('display:flex;flex-wrap:wrap;justify-content:center;gap:10px 26px;margin-top:28px')}>
            <a href={`${BP}/`} className="link-teal disp" style={css('display:inline-flex;align-items:center;gap:7px;color:#007d77;font-size:14px;font-weight:700')}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
              Ir a Salud Protegida
            </a>
            <a href={`${BP}/planes/`} className="link-teal disp" style={css('display:inline-flex;align-items:center;gap:7px;color:#007d77;font-size:14px;font-weight:700')}>
              Ver la comparación servicio por servicio
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
