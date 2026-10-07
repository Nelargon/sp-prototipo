'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { css } from '../css';
import { BP } from '../basePath';
import { fmt, plans, engine } from '../quote';
import { coverage, carencias } from '../coverage';
import { Term, waitLabel, annotate } from '../glossary';
import { track, trackExplicacion } from '../track';
import Hoja from '../components/Hoja';
import IconoSP from '../components/IconoSP';
import datos from '../../lib/prestaciones.json';

/* La comparativa de /planes en el celular (lámina 59; Arturo la confirmó el
   07/10/2026 con «1A, 2A, 3A, 4A»). Reemplaza, solo hasta 640 px, a las
   tarjetas con precio «desde» y a la tabla de once servicios que se deslizaba
   de costado y al llegar mostraba solo Essential. En la computadora la tabla
   entra y sigue igual (lámina 46).

   Por qué tiene esta forma (BITACORA cap. 141, docs/diseno n.º 79):
   - Quiénes entran se elige una vez, arriba, y cambia el precio de las tres
     tarjetas, con la edad hasta la que vale cada uno (lámina 59; el cuarto
     botón, «Vos con tus hijos», es la decisión 3A).
   - Lo que tienen los tres se dice una vez.
   - Las tres tarjetas tienen las mismas cinco líneas, en el mismo orden: las
     de plans() (lámina 65). Cada línea se toca y abre el tema en los tres
     planes, con su espera.
   - Las esperas NO van en las tarjetas (Arturo, 03/10): van en un cuadro
     aparte, debajo, todas con el mismo peso. En el celular no entra la tabla
     de once servicios, pero las esperas son palabras cortas y sí entran.
   - Los once servicios, a pedido, en una hoja que sube (decisión 2A).
   Lo que no cubren, el detalle fino, Vital y el cierre son los de la página.

   Todos los números salen de quote.js y coverage.js: ninguno se escribe acá. */

// Las personas con las que se calcula cada grupo: la edad más joven de cada
// tarifa, así el precio es el «desde» de ese grupo y la condición lo dice.
const ADULTO = { age: 30, kind: 'adult' };
const HIJO = { age: 8, kind: 'kid' };
const GRUPOS = [
  { k: 'solo', l: 'Vos solo', gente: [ADULTO] },
  { k: 'pareja', l: 'En pareja', gente: [ADULTO, ADULTO] },
  { k: 'familia', l: 'Pareja con 2 hijos', gente: [ADULTO, ADULTO, HIJO, HIJO] },
  { k: 'hijos', l: 'Vos con tus hijos', gente: [ADULTO, HIJO, HIJO] },
];
// Hasta qué edad vale ese precio en cada plan (quote.js: Essential no tiene
// tramos y la pareja va por el mayor, 18-45 / 46-64; Silver y Gold, 0-54, y el
// grupo familiar hasta 59).
const QUIEN = {
  solo: ['Vos solo, hasta 64 años', 'Vos solo, hasta 54 años', 'Vos solo, hasta 54 años'],
  pareja: ['Ustedes dos, hasta 45 años', 'Ustedes dos, hasta 54 años', 'Ustedes dos, hasta 54 años'],
  familia: ['Ustedes dos, hasta 64 años, con 2 hijos de hasta 20', 'Ustedes dos, hasta 59 años, con 2 hijos de hasta 20', 'Ustedes dos, hasta 59 años, con 2 hijos de hasta 20'],
  hijos: ['Vos, hasta 64 años, con 2 hijos de hasta 20', 'Vos, hasta 54 años, con 2 hijos de hasta 20', 'Vos, hasta 54 años, con 2 hijos de hasta 20'],
};
const NIVEL = ['esencial', 'equilibrio', 'amplia'];
// Essential cambia por zona: Asunción y Central a la vista, las otras dos al
// tocar «Otras zonas».
const ZONA = { ac: { ubi: { deptId: 'asuncion' } }, int: { ubi: { deptId: 'interior' } }, nac: { essNacional: true } };
const precio = (gente, i, zona = 'ac') => engine({ nivel: NIVEL[i], people: gente, ...(i === 0 ? ZONA[zona] : {}) }).price;

// Cada línea de la tarjeta abre los servicios que nombra. La clave es lo que
// va antes de los dos puntos en plans(); Odontología no está entre los once.
const TEMA = {
  Consultas: ['Consulta con especialista'],
  'Tomografía y resonancia': ['Tomografía (TAC)', 'Resonancia (RM)'],
  Internación: ['Internación'],
  'Terapia intensiva': ['Terapia intensiva'],
  Odontología: ['Odontología'],
};
// La espera de cada servicio, de carencias(): lo mismo que muestra el simulador.
const ESPERA_DE = {
  'Consulta con especialista': 'Consultas y urgencias', 'Urgencia 24 h': 'Consultas y urgencias',
  'Ecografía': 'Ecografías', 'Tomografía (TAC)': 'Tomografía', 'Resonancia (RM)': 'Resonancia',
  'Internación': 'Internación por algo agudo', 'Parto o cesárea': 'Parto', 'Fisioterapia': 'Fisioterapia',
};
// coverage.js lo dice en un comentario: Essential no distingue, espera un año
// para toda internación.
const NOTA_EXTRA = { 'Internación por algo agudo': 'En Essential, toda internación.' };

const tema = (linea) => linea.split(':')[0];
const sinMarcas = (t) => t.replace(/\*\*/g, '');
const conNegrita = (texto) => texto.split('**').map((seg, k) => (k % 2
  ? <b key={k} style={css('color:var(--sp-navy);font-weight:600')}>{annotate(seg)}</b>
  : <Fragment key={k}>{annotate(seg)}</Fragment>));

const CHECK = <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00BCB4" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:3px')} aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;
const FLECHA = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:4px;color:var(--sp-muted)')} aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>;
const RELOJ = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
const inter = 'font-family:var(--font-inter),sans-serif;';

export default function ComparativaCelular() {
  const planes = plans();
  const cov = coverage();
  const car = carencias();
  const COV = Object.fromEntries(cov.map((s) => [s.name, s]));
  const CAR = Object.fromEntries(car.map((c) => [c.que, c]));
  const odonto = datos.items.find((i) => i.t === 'x' && i.n === 'Odontología');

  const [quien, setQuien] = useState('solo');
  // La hoja: null, la lista de los once, un tema de la tarjeta o un servicio
  // abierto desde la lista (con «volver»).
  const [hoja, setHoja] = useState(null);
  const cuerpo = useRef(null);
  useEffect(() => { const c = cuerpo.current && cuerpo.current.closest('.hoja-cuerpo'); if (c) c.scrollTop = 0; }, [hoja]);

  const grupo = GRUPOS.find((g) => g.k === quien);
  const zonas = { int: precio(grupo.gente, 0, 'int'), nac: precio(grupo.gente, 0, 'nac') };
  const ZONAS = { zona: { t: 'Otras zonas', d: 'Essential cambia según dónde te atendés. En el Interior, ' + fmt(zonas.int) + '. Nacional, para atenderte en todo el país, ' + fmt(zonas.nac) + '.' } };

  const abrirTema = (t, i) => { setHoja({ tipo: 'tema', t, plan: i }); trackExplicacion('servicio', t); };
  const abrirServicio = (n) => { setHoja({ tipo: 'serv', n }); trackExplicacion('servicio', n); };
  const abrirLista = () => { setHoja({ tipo: 'lista' }); trackExplicacion('servicio', 'once servicios'); };

  const chip = (nombre, i) => {
    const c = CAR[ESPERA_DE[nombre]];
    const d = c ? c.dias[i] : null;
    const txt = waitLabel(d);
    if (!txt) return null;
    return (
      <span className="disp" style={css('display:inline-flex;align-items:center;gap:5px;width:fit-content;font-size:12px;font-weight:700;line-height:1.2;padding:4px 9px;border-radius:var(--r-pill);' + (d === 0 ? 'background:var(--sp-mint-bg);color:var(--sp-teal-900)' : 'background:var(--sp-estado-bg);color:var(--sp-estado-ink-2)'))}>
        {RELOJ}{txt}
      </span>
    );
  };
  const textoDe = (n, i) => (n === 'Odontología'
    ? sinMarcas(planes[i].lines.find((l) => tema(l) === 'Odontología') || '').replace(/^Odontología:\s*/, '').replace(/^./, (x) => x.toUpperCase())
    : COV[n].cov[i].d);

  // El tema (o el servicio) en los tres planes: la tarjeta del servicio de la
  // lámina 51, con la espera de cada uno.
  const enLosTres = (nombres, actual) => {
    const varios = nombres.length > 1;
    const notas = nombres.map((n) => (n === 'Odontología' ? odonto && odonto.d : COV[n] && COV[n].waitNote)).filter(Boolean);
    return (
      <>
        {planes.map((p, i) => (
          <div key={p.short} className="sq" style={css('--sq:var(--r-md);border:1px solid ' + (i === actual ? 'var(--sp-teal-deep);box-shadow:0 0 0 1px var(--sp-teal-deep)' : 'var(--sp-line)') + ';padding:14px;display:flex;flex-direction:column;gap:8px;margin-bottom:10px')}>
            <span className="disp" style={css('display:flex;align-items:center;gap:7px;font-size:16px;font-weight:800;color:var(--sp-navy)')}>
              <span style={css('width:9px;height:9px;border-radius:var(--r-pill);background:' + p.color)} />{p.short}
            </span>
            {nombres.map((n, k) => (
              <div key={n} style={css('display:flex;flex-direction:column;gap:5px;' + (k ? 'border-top:1px solid var(--sp-line-2);padding-top:8px' : ''))}>
                {varios && <span className="disp" style={css('font-size:12.5px;font-weight:700;color:var(--sp-muted)')}>{n.replace(/ \(.*\)$/, '')}</span>}
                <span style={css(inter + 'font-size:14.5px;line-height:1.5;color:var(--sp-text)')}>{annotate(textoDe(n, i))}</span>
                {chip(n, i)}
              </div>
            ))}
          </div>
        ))}
        {notas.map((t) => <p key={t} style={css(inter + 'font-size:13px;line-height:1.5;color:var(--sp-muted);margin:6px 0 0')}>{t}</p>)}
        <p style={css(inter + 'font-size:13px;line-height:1.5;color:var(--sp-muted);margin:6px 0 0')}>El tiempo de espera arranca el día que te afiliás, no el día que lo necesitás. En el contrato se llama carencia.</p>
      </>
    );
  };

  const lista = (
    <>
      <div style={css('display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;position:sticky;top:-4px;background:#fff;padding:8px 0;z-index:1;border-bottom:1px solid var(--sp-line)')}>
        {planes.map((p) => <span key={p.short} className="disp" style={css('font-size:12.5px;font-weight:800;color:var(--sp-navy)')}>{p.short}</span>)}
      </div>
      {cov.map((s) => (
        <button key={s.name} type="button" className="fila" onClick={() => abrirServicio(s.name)} style={css('display:flex;flex-direction:column;gap:6px;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--sp-line-2);padding:12px 0;cursor:pointer')}>
          <b className="disp" style={css('font-size:14.5px;font-weight:800;color:var(--sp-navy)')}>{s.name} ›</b>
          <span style={css('display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;' + inter + 'font-size:12.5px;line-height:1.35;color:var(--sp-text)')}>
            {s.cov.map((c, i) => {
              const e = ESPERA_DE[s.name] && CAR[ESPERA_DE[s.name]].dias[i];
              return (
                <span key={i} style={css('display:flex;flex-direction:column;gap:3px')}>
                  {c.d}
                  {e != null ? <i className="disp" style={css('font-style:normal;font-size:11.5px;font-weight:700;color:var(--sp-estado-ink-2)')}>{waitLabel(e)}</i> : null}
                </span>
              );
            })}
          </span>
        </button>
      ))}
    </>
  );

  let tituloHoja = '';
  let contenido = null;
  if (hoja && hoja.tipo === 'tema') { tituloHoja = hoja.t; contenido = enLosTres(TEMA[hoja.t], hoja.plan); }
  if (hoja && hoja.tipo === 'serv') {
    tituloHoja = hoja.n;
    contenido = (
      <>
        <button type="button" className="txt disp" onClick={abrirLista} style={css('background:none;border:0;color:var(--sp-teal-deep);font-size:14px;font-weight:800;padding:2px 0 12px;cursor:pointer')}>‹ Los once servicios</button>
        {enLosTres([hoja.n], -1)}
      </>
    );
  }
  if (hoja && hoja.tipo === 'lista') { tituloHoja = 'Los once servicios'; contenido = lista; }

  // Las notas de cada espera salen de carencias(): «la mayoría» y lo que dice
  // cada plan.
  const notaEspera = (c) => {
    const partes = [];
    if (c.nota) partes.push(c.nota.charAt(0).toUpperCase() + c.nota.slice(1) + '.');
    (c.notaPlan || []).forEach((t, i) => { if (t) partes.push(/^[A-ZÁÉÍÓÚ]/.test(t) ? t + '.' : 'En ' + planes[i].short + ', ' + t + '.'); });
    if (NOTA_EXTRA[c.que]) partes.push(NOTA_EXTRA[c.que]);
    return partes.join(' ');
  };

  return (
    <div className="solo-cel cmp-cel">
      {/* ---- QUIÉNES ENTRAN, LO DE LOS TRES Y LAS TARJETAS ----------------- */}
      <section style={css('padding:28px 24px 0')}>
        <div style={css('display:flex;flex-direction:column;gap:18px')}>
          <div role="group" aria-label="Quiénes entran" style={css('display:grid;grid-template-columns:1fr 1fr;gap:6px;background:var(--sp-estado-bg);border-radius:var(--r-md);padding:4px')}>
            {GRUPOS.map((g) => (
              <button
                key={g.k}
                type="button"
                aria-pressed={quien === g.k}
                onClick={() => setQuien(g.k)}
                className={'disp' + (quien === g.k ? ' rel-btn' : '')}
                style={css('font-size:13.5px;font-weight:800;line-height:1.15;padding:12px 6px;border:0;border-radius:var(--r-sm);cursor:pointer;' + (quien === g.k ? 'background:#fff;color:var(--sp-navy)' : 'background:none;color:var(--sp-muted)'))}
              >
                {g.l}
              </button>
            ))}
          </div>
          <p style={css(inter + 'font-size:12.5px;line-height:1.5;color:var(--sp-muted);text-align:center;margin:-8px 0 0')}>Precio por mes, con IVA. Con débito automático o tarjeta de crédito, 10% menos.</p>

          <div className="sq" style={css('--sq:var(--r-md);background:var(--sp-mint-bg);padding:14px;display:flex;flex-direction:column;gap:10px')}>
            <span className="disp" style={css('font-size:14.5px;font-weight:800;color:var(--sp-teal-900)')}>Lo que tienen los tres</span>
            <span style={css('display:flex;gap:10px;align-items:center;' + inter + 'font-size:14.5px;line-height:1.4;color:var(--sp-text)')}><IconoSP nombre="red" size={30} />Urgencias las 24 horas, desde el primer día.</span>
            <span style={css('display:flex;gap:10px;align-items:center;' + inter + 'font-size:14.5px;line-height:1.4;color:var(--sp-text)')}><IconoSP nombre="turnos" size={30} />Consultas con especialistas, sin tiempo de espera.</span>
          </div>

          {planes.map((p, i) => (
            <article key={p.short} aria-label={'Plan ' + p.short} className="sq" style={css('--sq:var(--r-lg);border:1px solid var(--sp-line);overflow:hidden;background:#fff')}>
              <div style={css('height:5px;background:' + p.color)} />
              <div style={css('padding:18px 16px 6px;display:flex;flex-direction:column;gap:10px')}>
                <span className="disp" style={css('display:flex;align-items:center;gap:8px;font-size:21px;font-weight:800;color:var(--sp-navy)')}>
                  <span style={css('width:10px;height:10px;border-radius:var(--r-pill);background:' + p.color)} />{p.short}
                </span>
                <p style={css(inter + 'font-size:13px;line-height:1.45;color:var(--sp-muted);margin:-4px 0 0')}>{p.tag}</p>
                <div>
                  <span className="disp num-tnum" style={css('font-size:31px;font-weight:800;color:var(--sp-navy);letter-spacing:-0.02em')}>{fmt(precio(grupo.gente, i))}</span>
                  <span style={css(inter + 'font-size:13.5px;color:var(--sp-muted)')}> por mes</span>
                </div>
                <p style={css(inter + 'font-size:13px;line-height:1.45;color:var(--sp-muted);margin:-2px 0 0')}>
                  {QUIEN[quien][i]}{i === 0 ? <>, en Asunción y Central. <Term k="zona" dict={ZONAS}>Otras zonas</Term></> : ', en todo el país.'}
                </p>
                <a
                  href={`${BP}/simulador/?plan=${p.short.toLowerCase()}`}
                  onClick={() => track('cta_simulador', { origen: 'planes_tarjeta_celular', plan: p.name })}
                  className="btn-teal sq disp"
                  style={css('height:46px;--sq:var(--r-sm);background:var(--sp-teal-deep);color:#fff;font-size:14.5px;font-weight:700;display:flex;align-items:center;justify-content:center')}
                >
                  Ver mi precio
                </a>
                <div style={css('display:flex;flex-direction:column;border-top:1px solid var(--sp-line-2);margin-top:4px')}>
                  {p.lines.map((l, li) => (
                    <div
                      key={li}
                      role="button"
                      tabIndex={0}
                      className="fila linea-cel"
                      aria-haspopup="dialog"
                      onClick={() => abrirTema(tema(l), i)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirTema(tema(l), i); } }}
                      style={css('display:grid;grid-template-columns:16px minmax(0,1fr) 14px;gap:10px;align-items:start;padding:12px 0;cursor:pointer;' + (li < p.lines.length - 1 ? 'border-bottom:1px solid var(--sp-line-2)' : ''))}
                    >
                      {CHECK}
                      <span style={css(inter + 'font-size:13.5px;line-height:1.5;color:var(--sp-text)')}>{conNegrita(l)}</span>
                      {FLECHA}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---- LAS ESPERAS, EN UN CUADRO APARTE ------------------------------ */}
      <section style={css('padding:56px 24px 0')}>
        <div style={css('text-align:center;margin:0 auto 18px')}>
          <h2 className="disp" style={css('font-size:27px;font-weight:800;color:var(--sp-navy);line-height:1.15;letter-spacing:-0.02em;margin:0 0 10px')}>Cuánto esperás <span style={css('color:var(--sp-teal-deep)')}>para usarlo</span></h2>
          <p style={css(inter + 'font-size:15px;line-height:1.6;color:var(--sp-text);margin:0')}>Se cuenta desde el día que te afiliás, no desde el día que lo necesitás. En el contrato se llama <Term k="carencia">carencia</Term>.</p>
        </div>
        <div role="table" aria-label="Cuánto esperás para usarlo" className="sq" style={css('--sq:var(--r-lg);border:1px solid var(--sp-line);overflow:hidden')}>
          <div role="row" className="esp-f" style={css('background:var(--sp-navy)')}>
            <span role="columnheader" style={css('position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)')}>Servicio</span>
            <span aria-hidden="true" />
            {planes.map((p) => <span key={p.short} role="columnheader" className="disp" style={css('font-size:12.5px;font-weight:800;color:#fff;text-align:center')}>{p.short}</span>)}
          </div>
          {car.map((c, r) => {
            const nota = notaEspera(c);
            return (
              <div key={c.que} role="row" className="esp-f" style={css('border-top:1px solid var(--sp-line-2);background:' + (r % 2 ? '#fff' : 'var(--sp-surface-2)'))}>
                <span role="rowheader" className="disp" style={css('display:flex;flex-direction:column;gap:2px;font-size:13.5px;font-weight:700;line-height:1.25;color:var(--sp-navy)')}>
                  {c.que}
                  {nota && <small style={css(inter + 'font-size:11.5px;font-weight:400;line-height:1.35;color:var(--sp-muted)')}>{nota}</small>}
                </span>
                {c.dias.map((d, i) => (
                  <span key={i} role="cell" className="disp num-tnum" style={css('font-size:12.5px;font-weight:700;line-height:1.2;text-align:center;white-space:nowrap;color:' + (d === 0 ? 'var(--sp-teal-900)' : 'var(--sp-navy)'))}>
                    {waitLabel(d, true) || '—'}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="fila sq"
          aria-haspopup="dialog"
          onClick={abrirLista}
          style={css('margin-top:16px;width:100%;display:flex;justify-content:space-between;align-items:center;gap:10px;--sq:var(--r-md);background:var(--sp-surface-2);border:1px solid var(--sp-line);padding:14px;cursor:pointer;text-align:left')}
        >
          <span>
            <span className="disp" style={css('display:block;font-size:15px;font-weight:800;color:var(--sp-navy);line-height:1.25')}>Los once servicios, plan por plan</span>
            <span style={css('display:block;' + inter + 'font-size:13px;line-height:1.4;color:var(--sp-muted);margin-top:3px')}>Qué cubre cada uno en los tres planes, para quien quiere verlo todo.</span>
          </span>
          <span aria-hidden="true" className="disp" style={css('font-size:20px;color:var(--sp-muted)')}>›</span>
        </button>
      </section>

      <Hoja abierta={!!hoja} titulo={tituloHoja} onCerrar={() => setHoja(null)}>
        <div ref={cuerpo}>{contenido}</div>
      </Hoja>
    </div>
  );
}
