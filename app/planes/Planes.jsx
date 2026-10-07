'use client';

import { useState } from 'react';
import { css } from '../css';
import { BP } from '../basePath';
import { fmt, plans, essentialTitular, WHATSAPP_NUMBER } from '../quote';
import { coverage, carencias } from '../coverage';
import { Term, waitLabel } from '../glossary';
import { track } from '../track';
import Header from '../Header';
import Plegable from '../components/Plegable';
import Comparador from '../components/Comparador';
import ComparativaCelular from './ComparativaCelular';
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
   con el mismo peso y orden, nunca de gancho en las tarjetas (3/10). En el
   celular, en su propio cuadro (ComparativaCelular.jsx, 07/10); en la
   computadora, en su grupo de la tabla, que desde el 07/10 es el comparador
   del home con todo adentro (lámina 81).

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

  /* LA TABLA DE LA COMPUTADORA (07/10/2026, lámina 81, la A que eligió Arturo:
     «un diseño un poquito más sencillo, un poco más minimalista […] una mejor
     línea y algo un poco más completo»). Es el comparador del home
     (components/Comparador.jsx), con lo que /planes suma: once servicios en vez
     de nueve y las nueve esperas en su propio grupo, con el mismo peso. El
     precio va arriba de cada columna y la letra chica de cada servicio, en su
     tarjeta, al pasar el mouse o tocar el nombre.
     Los valores cortos (`t`) son la forma corta de lo que dicen coverage() y
     plans(); «por familia» va siempre a la vista (lección 51). La tarjeta (`d`)
     es el texto de coverage() con la espera de carencias(), así las dos fuentes
     son las de siempre y nada se escribe dos veces. */
  const cv = Object.fromEntries(cov.map((s) => [s.name, s]));
  const esp = Object.fromEntries(carencias().map((c) => [c.que, c]));
  const conEspera = (servicio, carencia) => cv[servicio].cov.map((c, i) => {
    const e = carencia ? waitLabel(esp[carencia].dias[i]) : null;
    return c.d + (e ? '. ' + e.charAt(0).toUpperCase() + e.slice(1) : '') + '.';
  });
  const odonto = excluidosOdonto();
  function excluidosOdonto() {
    const d = datos.items.find((i) => i.t === 'x' && i.n === 'Odontología');
    const linea = (i) => (plansArr[i].lines.find((l) => l.startsWith('Odontología:')) || '').replace(/\*\*/g, '').replace(/^Odontología:\s*/, '');
    return { d: [0, 1, 2].map((i) => { const t = linea(i); return t.charAt(0).toUpperCase() + t.slice(1) + '.'; }), pie: d ? d.d : null };
  }
  const filasCompu = [
    { g: 'Consultas y estudios', name: 'Consultas por especialista', kind: 'num', cells: [{ t: 'Sin tope', n: 'en Lister' }, { t: 'Sin tope', n: 'en la mitad' }, { t: 'Sin tope', n: 'en casi todas' }], d: conEspera('Consulta con especialista', 'Consultas y urgencias') },
    { name: 'Sesiones de psicología', kind: 'num', cells: [{ t: '3', n: 'por familia' }, { t: '5' }, { t: '6' }], d: conEspera('Sesión de psicología') },
    { name: 'Fisioterapia', kind: 'num', cells: [{ t: '5', n: 'por familia' }, { t: '15' }, { t: '20' }], d: conEspera('Fisioterapia', 'Fisioterapia') },
    { name: 'Ecografía', kind: 'num', cells: [{ t: '4', n: 'por familia' }, { t: 'Sin tope', n: 'la mayoría' }, { t: 'Sin tope', n: 'la mayoría' }], d: conEspera('Ecografía', 'Ecografías') },
    { name: 'Tomografía (TAC)', kind: 'status', cells: [{ t: '2 por familia' }, { t: '2 por persona' }, { t: '2 por persona' }], d: conEspera('Tomografía (TAC)', 'Tomografía') },
    { name: 'Resonancia (RM)', kind: 'status', cells: [{ t: '1 por familia' }, { t: '1 por persona' }, { t: '1 por persona' }], d: conEspera('Resonancia (RM)', 'Resonancia') },
    { name: 'Odontología', kind: 'num', cells: [{ t: 'Lo básico', n: 'en Lister' }, { t: 'No entra', apagado: true }, { t: 'No entra', apagado: true }], d: odonto.d, pie: odonto.pie },
    { g: 'Si te internan', name: 'Internación', kind: 'num', cells: [{ t: '20', n: 'por familia' }, { t: '20' }, { t: '25' }], d: conEspera('Internación', 'Internación por algo agudo'), pie: cv['Internación'].waitNote },
    { name: 'Días de terapia intensiva', kind: 'num', cells: [{ t: '2' }, { t: '5' }, { t: '6' }], d: conEspera('Terapia intensiva') },
    { name: 'Medicamentos internado', kind: 'num', cells: [{ t: 'Gs. 350 mil' }, { t: 'Gs. 1 millón' }, { t: 'Gs. 1,5 mill.' }], d: conEspera('Medicamentos en internación') },
    // Donde el cuadernillo de Essential no fija el tope se dice eso (como en el home).
    { g: 'Urgencias', name: 'Remedios en urgencias', kind: 'num', cells: [{ t: 'Consultalo', n: 'con tu asesor' }, { t: 'Gs. 150 mil' }, { t: 'Gs. 200 mil' }], d: conEspera('Urgencia 24 h', 'Consultas y urgencias') },
    // Las esperas, todas con el mismo peso y de carencias(), lo mismo que muestra
    // el simulador. Sin tarjeta: el número ya es el dato.
    ...carencias().map((c, k) => ({ g: k === 0 ? 'Cuánto esperás para usarlo' : undefined, name: c.que, kind: 'num', cells: c.dias.map((d) => ({ t: waitLabel(d, true) || '—' })) })),
  ];
  const planesCompu = plansArr.map((pl, i) => ({
    short: pl.short, price: fmt(pl.price), color: pl.color, forWhom: pl.tag, recommended: i === 1,
    zona: pl.nivel === 'esencial' ? 'según tu zona' : null,
    href: `${BP}/simulador/?plan=${pl.short.toLowerCase()}`,
    onCta: () => track('cta_simulador', { origen: 'planes_tabla', plan: pl.name }),
  }));

  const especialidades = datos.items.filter((i) => i.t === 'c');
  const excluidos = datos.items.filter((i) => i.t === 'x');

  /* Cómo se MUESTRA un parámetro del master, sin tocar el dato:
     - "Carencia…" va después de lo que la persona entiende (regla del
       8/09/2026: "carencia" no va primero; la palabra del contrato, detrás).
     - El master escribe "Gs." y el sitio también (Arturo, 07/10/2026, sp-interno#164). Una sola moneda. */
  const etiquetaParam = (t) => {
    const m = /^Carencia\s*(?:–|-|de)\s*(.+)$/i.exec(t);
    return m ? `Tiempo de espera para ${m[1].replace(/por evento agudo/, 'por algo agudo')} (carencia)` : t;
  };
  const valorParam = (v) => String(v).replace(/^Gs\.\s*/, 'Gs. ');

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
            <span className="solo-compu">Qué trae cada uno, cuánto sale y lo que no entra en ninguno. Lo más fino lo abrís con un toque.</span>
            <span className="solo-cel">Elegí quiénes entran y mirá cuánto pagás. Tocá cualquier línea para verla en los tres planes.</span>
          </p>
        </div>
      </section>

      {/* ---- 2 Y 3, EN EL CELULAR: TARJETAS IGUALES Y EL DETALLE AL TOCAR --
          Hasta 819 px va la comparativa de la lámina 59, que Arturo confirmó
          el 07/10/2026 (ComparativaCelular.jsx). La tabla vieja se deslizaba de
          costado y al llegar mostraba solo Essential. */}
      <ComparativaCelular />

      {/* ---- 2. EN LA COMPUTADORA: LA TABLA DEL HOME, CON TODO ADENTRO ----
          Desde 820 px, el corte del home. Reemplaza a las tres tarjetas y a la tabla de once
          servicios con barra azul y un «Cubierta» en cada celda (lámina 81, la
          A). Las cinco líneas de las tarjetas siguen en la comparativa del
          celular; acá lo que dicen está en las filas. */}
      <div className="solo-compu">
      <section style={css('padding:40px 24px 0')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          {/* El débito, como en el home: es plata que la familia ve, no letra chica. */}
          <div style={css('display:flex;justify-content:center;margin-bottom:22px')}>
            <span style={css('display:inline-flex;align-items:flex-start;gap:10px;font-family:var(--font-inter),sans-serif;font-size:15px;color:var(--sp-text-fuerte);line-height:1.5;text-align:left;max-width:640px')}>
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#007d77" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:2px')} aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /></svg>
              <span>Pagá con <b style={css('color:var(--sp-navy)')}>débito automático o tarjeta de crédito</b> y ahorrás <b style={css('color:var(--sp-teal-deep)')}>10% todos los meses</b>: en un año, es <b style={css('color:var(--sp-teal-deep)')}>más de una cuota</b> que te queda en el bolsillo.</span>
            </span>
          </div>
          <Comparador planes={planesCompu} filas={filasCompu} notas id="comparar-planes" />
          <p style={css('font-family:var(--font-inter),sans-serif;font-size:12.5px;color:var(--sp-muted);text-align:center;margin:16px auto 0;line-height:1.6;max-width:760px')}>
            El precio es el de una persona sola, con IVA incluido; el tuyo depende de quiénes entran y de la edad. Essential varía según tu zona: {fmt(essentialTitular('interior'))} en el interior, {fmt(essentialTitular('asuncion_central'))} en Asunción y Central y {fmt(essentialTitular('nacional'))} en su versión Nacional. Los tiempos de espera son la <Term k="carencia">carencia</Term> de cada servicio: el reloj arranca el día que te afiliás, no el día que lo necesitás.
          </p>
        </div>
      </section>
      </div>

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
