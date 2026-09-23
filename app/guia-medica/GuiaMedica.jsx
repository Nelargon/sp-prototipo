'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { css } from '../css';
import { BP } from '../basePath';
import { track } from '../track';
import { WHATSAPP_NUMBER } from '../quote';
import Header from '../Header';
import PuntoRevisar from './PuntoRevisar';
import datos from '../../lib/guia-medica.json';
import { GRUPOS_PLAN, grupoDePlan, nombrePlan, indexar, filtrar, catalogos, sugerir, redesCortas, telHref, iniciales, condicionTexto } from '../../lib/red-medica';

/* /guia-medica — la cuarta pregunta del proyecto: ¿dónde me atiendo?
   ----------------------------------------------------------------------------
   La v1 del 15/09 la contestaba por WhatsApp (sp-interno, BITACORA cap. 10).
   Desde el 23/09 la contesta esta página, con la red real: la planilla maestra
   que armó SP con las 6 guías en PDF (lib/guia-medica.json).

   El orden de la pantalla sigue al de la persona que llega: sabe qué necesita
   ("un pediatra", "el doctor Gómez") y, si es cliente, qué plan tiene. La red
   depende del plan, así que "¿qué plan tenés?" va primero entre los filtros.

   Todo el estado vive en la URL (?plan=…&esp=…): un resultado se puede pasar
   por WhatsApp tal cual, y el home puede mandar directo a una especialidad.

   PRIVACIDAD: lo que alguien busca acá puede ser un dato de salud
   ("psiquiatra", "embarazo"). El texto NO se manda nunca a la analítica —
   solo el largo y si hubo resultados, igual que en /que-cubre. */

const P = datos.prestadores;
const INDICE = indexar(P);
const CAT = catalogos(P);
const POR_PAGINA = 20;
const CAMPOS = ['q', 'plan', 'esp', 'dp', 'c', 'tipo'];
const waDigits = String(WHATSAPP_NUMBER).replace(/\D/g, '');

const fechaLarga = (dmy) => {
  const [d, m, y] = String(dmy || '').split('/');
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return d ? `${+d} ${MESES[+m - 1]} ${y}` : '';
};

const INTER = 'font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;';
const ETIQUETA = 'display:block;font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--sp-navy);margin-bottom:7px';
const CHIP_PLAN = 'min-height:48px;padding:8px 12px;border-radius:var(--r-sm);font-size:15px;font-weight:800;line-height:1.2;cursor:pointer;border:1.5px solid;display:inline-flex;align-items:center;justify-content:center;text-align:center;';
const SELECT = INTER + 'width:100%;height:46px;border:1.5px solid var(--sp-mint-line-strong);border-radius:var(--r-sm);padding:0 12px;font-size:15px;color:var(--sp-ink);background:#fff';

function Tarjeta({ p, conRedes }) {
  const inst = p.t === 'i';
  return (
    <article style={css('background:#fff;border:1px solid var(--sp-line);border-radius:var(--r-md);padding:18px 18px 16px;display:flex;gap:14px')}>
      <div aria-hidden="true" className="disp" style={css('flex:none;width:46px;height:46px;border-radius:var(--r-pill);display:flex;align-items:center;justify-content:center;font-size:16px;' + (inst ? 'background:var(--sp-blue-bg);color:var(--sp-navy)' : 'background:var(--sp-teal-deep);color:#fff'))}>
        {inst
          ? <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V8l7-4 7 4v13M10 21v-4h4v4M12 8.5v4M10 10.5h4" /></svg>
          : iniciales(p.n)}
      </div>
      <div style={css('min-width:0;flex:1')}>
        <div style={css('display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin-bottom:6px')}>
          <span className="disp" style={css('font-size:12px;font-weight:800;color:var(--sp-teal-900)')}>{p.e}</span>
          {p.l ? <span className="disp" style={css('font-size:11px;font-weight:800;padding:2px 9px;border-radius:var(--r-pill);background:var(--sp-navy);color:#fff')}>En Lister, centro propio</span> : null}
        </div>
        <h3 className="disp" style={css('font-size:17px;line-height:1.3;color:var(--sp-navy);margin:0 0 6px')}>
          <a href={`${BP}/guia-medica/${p.id}/`} onClick={() => track('guia_ficha', { origen: 'lista' })} style={css('color:inherit')}>{p.n}</a>
          {p.rv ? <PuntoRevisar /> : null}
        </h3>
        <p style={css(INTER + 'font-size:14px;line-height:1.5;color:var(--sp-text);margin:0')}>
          {p.d}{p.b ? ` · ${p.b}` : ''}<br />
          <span style={css('color:var(--sp-muted)')}>{p.c}{p.dp && p.dp !== 'Capital' ? `, ${p.dp}` : ''}</span>
        </p>
        {p.k && <p style={css(INTER + 'font-size:13px;line-height:1.5;color:var(--sp-muted);margin:6px 0 0')}>{condicionTexto(p.k)}</p>}
        {p.e === 'Odontología' && <p style={css(INTER + 'font-size:13px;line-height:1.5;color:var(--sp-muted);margin:6px 0 0')}>Antes de ir, preguntá a tu asesor qué cubre tu plan en odontología.</p>}
        {conRedes && (
          <div style={css('display:flex;flex-wrap:wrap;gap:6px;margin-top:10px')} aria-label="Planes con los que lo usás">
            {redesCortas(p.r).map((r) => <span key={r} className="disp" style={css('font-size:11px;font-weight:700;padding:3px 9px;border-radius:var(--r-pill);background:var(--sp-mint-bg);color:var(--sp-teal-ink)')}>{r}</span>)}
          </div>
        )}
        <div style={css('display:flex;flex-wrap:wrap;gap:8px;margin-top:13px')}>
          {p.tel[0] && (
            <a href={telHref(p.tel[0])} onClick={() => track('guia_llamar', { tipo: p.t })} className="disp" style={css('height:40px;padding:0 15px;border-radius:var(--r-sm);background:var(--sp-teal-deep);color:#fff;font-size:14px;font-weight:700;display:inline-flex;align-items:center;gap:7px')}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2z" /></svg>
              <span className="num-tnum">{p.tel[0]}</span>
            </a>
          )}
          <a href={`${BP}/guia-medica/${p.id}/`} onClick={() => track('guia_ficha', { origen: 'boton' })} className="disp" style={css('height:40px;padding:0 15px;border-radius:var(--r-sm);border:1.5px solid var(--sp-mint-line-strong);color:var(--sp-navy);font-size:14px;font-weight:700;display:inline-flex;align-items:center')}>Ver ficha →</a>
        </div>
      </div>
    </article>
  );
}

export default function GuiaMedica() {
  const [f, setF] = useState({ q: '', plan: '', esp: '', dp: '', c: '', tipo: '' });
  const [q, setQ] = useState('');
  const [n, setN] = useState(POR_PAGINA);
  const [grupoAbierto, setGrupoAbierto] = useState('');
  const listo = useRef(false);

  // Estado inicial desde la URL (links compartidos, puertas del home).
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const ini = {};
    for (const k of CAMPOS) ini[k] = u.get(k) || '';
    setF(ini);
    setQ(ini.q);
    listo.current = true;
  }, []);

  // La búsqueda escrita se aplica con una pausa, para no filtrar letra por letra.
  useEffect(() => {
    const t = setTimeout(() => setF((v) => (v.q === q ? v : { ...v, q })), 220);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!listo.current) return;
    const u = new URLSearchParams();
    for (const k of CAMPOS) if (f[k]) u.set(k, f[k]);
    const s = u.toString();
    window.history.replaceState(null, '', window.location.pathname + (s ? '?' + s : ''));
    setN(POR_PAGINA);
  }, [f]);

  const res = useMemo(() => filtrar(P, INDICE, f), [f]);
  const distintos = useMemo(() => new Set(res.map((p) => p.id)).size, [res]);
  const sug = useMemo(() => (f.q && !res.length ? sugerir(P, f.q) : null), [f.q, res.length]);

  useEffect(() => {
    if (f.q) track('guia_buscar', { largo: f.q.length, resultados: res.length });
  }, [f.q]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k, v) => {
    track('guia_filtro', { campo: k });
    setF((x) => ({ ...x, [k]: v, ...(k === 'dp' ? { c: '' } : {}) }));
  };
  const limpiar = () => { setQ(''); setGrupoAbierto(''); setF({ q: '', plan: '', esp: '', dp: '', c: '', tipo: '' }); };
  const hayFiltros = CAMPOS.some((k) => f[k]);
  // El grupo que se ve marcado: el del plan elegido, o el que se abrió y
  // todavía espera la segunda elección (la zona de Esencial, o cuál "otro").
  const grupoActual = grupoAbierto || grupoDePlan(f.plan);
  const grupoConOpciones = GRUPOS_PLAN.find((g) => g.k === grupoActual && g.opciones);
  const elegirGrupo = (g) => {
    if (g.opciones) {
      // Tocar de nuevo el grupo abierto lo cierra; si no, lo abre y espera.
      if (grupoActual === g.k) { setGrupoAbierto(''); set('plan', ''); return; }
      setGrupoAbierto(g.k);
      if (grupoDePlan(f.plan) !== g.k) set('plan', '');
      return;
    }
    setGrupoAbierto('');
    set('plan', f.plan === g.v ? '' : g.v);
  };
  const ciudades = f.dp ? (CAT.departamentos.find((d) => d.d === f.dp) || { ciudades: [] }).ciudades : [];
  const G = datos.meta.guias;
  const waSinResultado = 'https://wa.me/' + waDigits + '?text=' + encodeURIComponent('Hola! Busqué «' + f.q + '» en la Guía Médica y no lo encontré. ¿Me ayudan?');
  const waNoEncuentro = 'https://wa.me/' + waDigits + '?text=' + encodeURIComponent('Hola! Quiero saber si un profesional está en la red de mi plan.');

  const chipTipo = (v, label) => (
    <button type="button" onClick={() => set('tipo', v)} aria-pressed={f.tipo === v} className="disp" style={css('height:40px;padding:0 14px;border-radius:var(--r-sm);font-size:14px;font-weight:700;cursor:pointer;border:1.5px solid ' + (f.tipo === v ? 'var(--sp-teal-deep)' : 'var(--sp-mint-line-strong)') + ';background:' + (f.tipo === v ? 'var(--sp-teal-deep)' : '#fff') + ';color:' + (f.tipo === v ? '#fff' : 'var(--sp-navy)'))}>{label}</button>
  );

  return (
    <div className="body" style={css('min-height:100vh;background:var(--sp-mint-tint);color:var(--sp-ink)')}>
      <Header variant="solid" />

      <div style={css('max-width:980px;margin:0 auto;padding:100px 16px 70px')}>
        <div style={css('text-align:center;max-width:640px;margin:0 auto 24px')}>
          <div className="disp" style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--sp-teal-900);margin-bottom:12px')}>Para clientes de SP</div>
          <h1 className="disp" style={css('font-size:clamp(30px,5vw,44px);font-weight:800;color:var(--sp-navy);line-height:1.12;letter-spacing:-0.02em;margin:0 0 12px')}>Encontrá tu médico <span style={css('color:var(--sp-teal-deep)')}>en la red</span>.</h1>
          <p style={css(INTER + 'font-size:16.5px;line-height:1.6;color:var(--sp-text);margin:0')}>Buscá por especialidad, por nombre o por ciudad. Si elegís tu plan, te mostramos solo los lugares donde lo usás.</p>
        </div>

        {/* Buscador */}
        <div style={css('background:#fff;border:1.5px solid var(--sp-mint-line-strong);border-radius:var(--r-md);display:flex;align-items:center;padding:4px 6px 4px 14px;box-shadow:0 10px 30px rgba(0,59,113,.07)')}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--sp-teal-deep)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} type="search" autoComplete="off" aria-label="Buscar en la Guía Médica" placeholder="Pediatra, un nombre, tu ciudad…" style={css(INTER + 'flex:1;min-width:0;height:50px;border:none;outline:none;font-size:16px;padding:0 10px;background:transparent;color:var(--sp-ink)')} />
          {q && <button type="button" onClick={() => setQ('')} className="disp" style={css('border:none;background:none;color:var(--sp-muted);font-size:13px;font-weight:700;cursor:pointer;padding:0 10px')}>Borrar</button>}
        </div>

        {/* Filtros */}
        <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-top:14px;background:#fff;border:1px solid var(--sp-line);border-radius:var(--r-md);padding:16px')}>
          {/* ¿Qué plan tenés? — botones en dos pasos (ver GRUPOS_PLAN en
              lib/red-medica.js). Ocupa toda la fila: es el filtro que decide
              qué red se ve, y va antes que los demás. */}
          <div style={css('grid-column:1/-1')} role="group" aria-label="¿Qué plan tenés?">
            <div style={css('display:flex;justify-content:space-between;align-items:baseline;gap:10px')}>
              <span style={css(ETIQUETA + ';color:var(--sp-teal-900)')}>¿Qué plan tenés?</span>
              {(f.plan || grupoAbierto) && <button type="button" onClick={() => { setGrupoAbierto(''); set('plan', ''); }} className="disp" style={css('border:none;background:none;padding:0;color:var(--sp-teal-deep);font-size:13px;font-weight:700;cursor:pointer')}>Ver todos los planes</button>}
            </div>
            <div className="gm-planes">
              {GRUPOS_PLAN.map((g) => {
                const activo = grupoActual === g.k;
                return (
                  <button key={g.k} type="button" aria-pressed={activo} onClick={() => elegirGrupo(g)} className="disp" style={css(CHIP_PLAN + (activo ? 'border-color:var(--sp-teal-deep);background:var(--sp-teal-deep);color:#fff' : 'border-color:var(--sp-mint-line-strong);background:#fff;color:var(--sp-navy)'))}>
                    {g.label}{g.opciones ? <span aria-hidden="true" style={css('margin-left:6px;font-size:12px;opacity:.8')}>{activo ? '▴' : '▾'}</span> : null}
                  </button>
                );
              })}
            </div>
            {grupoConOpciones && (
              <div style={css('margin-top:10px;background:var(--sp-mint-soft);border:1px solid var(--sp-mint-line);border-radius:var(--r-sm);padding:12px')}>
                <span style={css(ETIQUETA + ';margin-bottom:9px')}>{grupoConOpciones.pregunta}</span>
                <div style={css('display:flex;flex-wrap:wrap;gap:8px')}>
                  {grupoConOpciones.opciones.map((o) => {
                    const activo = f.plan === o.v;
                    return <button key={o.v} type="button" aria-pressed={activo} onClick={() => set('plan', o.v)} className="disp" style={css('height:40px;padding:0 14px;border-radius:var(--r-sm);font-size:14px;font-weight:700;cursor:pointer;border:1.5px solid ' + (activo ? 'var(--sp-teal-deep)' : 'var(--sp-mint-line-strong)') + ';background:' + (activo ? 'var(--sp-teal-deep)' : '#fff') + ';color:' + (activo ? '#fff' : 'var(--sp-navy)'))}>{o.label}</button>;
                  })}
                </div>
              </div>
            )}
            {f.plan && <p aria-live="polite" style={css(INTER + 'font-size:13.5px;color:var(--sp-text);margin:10px 0 0')}>Te mostramos la red de <b style={css('color:var(--sp-navy)')}>{nombrePlan(f.plan)}</b>.</p>}
          </div>
          <label>
            <span style={css(ETIQUETA)}>Especialidad</span>
            <select value={f.esp} onChange={(e) => set('esp', e.target.value)} style={css(SELECT)}>
              <option value="">Todas</option>
              {CAT.especialidades.map((g) => (
                <optgroup key={g.g} label={g.g}>{g.items.map((e) => <option key={e}>{e}</option>)}</optgroup>
              ))}
            </select>
          </label>
          <label>
            <span style={css(ETIQUETA)}>Departamento</span>
            <select value={f.dp} onChange={(e) => set('dp', e.target.value)} style={css(SELECT)}>
              <option value="">Todo el país</option>
              {CAT.departamentos.map((d) => <option key={d.d}>{d.d}</option>)}
            </select>
          </label>
          {ciudades.length > 1 && (
            <label>
              <span style={css(ETIQUETA)}>Ciudad</span>
              <select value={f.c} onChange={(e) => set('c', e.target.value)} style={css(SELECT)}>
                <option value="">Todas</option>
                {ciudades.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          )}
          <div style={css('grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px;align-items:center')} role="group" aria-label="Tipo de prestador">
            {chipTipo('', 'Todos')}{chipTipo('p', 'Profesionales')}{chipTipo('i', 'Sanatorios, laboratorios y centros')}
          </div>
        </div>

        {/* Lister, cuando todavía no se buscó nada: el centro propio es la
            respuesta más corta a "¿dónde me atiendo?" en Asunción. */}
        {!hayFiltros && (
          <div style={css('margin-top:14px;background:var(--sp-navy);color:#fff;border-radius:var(--r-md);padding:20px 20px 18px')}>
            <div className="disp" style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--sp-mint);margin-bottom:8px')}>Nuestro centro médico</div>
            <h2 className="disp" style={css('font-size:22px;line-height:1.2;color:#fff;margin:0 0 6px')}>Lister, en Asunción</h2>
            <p style={css(INTER + 'font-size:14.5px;line-height:1.55;color:var(--sp-blue-soft);margin:0 0 14px')}>Pa&apos;i Pérez 630 c/ Azara. Consultas con especialistas, laboratorio, ecografías, radiografías y odontología, en un solo lugar.</p>
            <div style={css('display:flex;flex-wrap:wrap;gap:8px')}>
              <button type="button" onClick={() => { setQ('lister'); track('guia_filtro', { campo: 'lister' }); }} className="disp" style={css('height:42px;padding:0 16px;border-radius:var(--r-sm);border:none;background:var(--sp-teal-deep);color:#fff;font-size:14px;font-weight:700;cursor:pointer')}>Ver sus profesionales</button>
              <a href="tel:+59521220199" onClick={() => track('guia_llamar', { tipo: 'lister' })} className="disp" style={css('height:42px;padding:0 16px;border-radius:var(--r-sm);border:1.5px solid rgba(255,255,255,.35);color:#fff;font-size:14px;font-weight:700;display:inline-flex;align-items:center')}>Llamar al (021) 220 199</a>
            </div>
            {datos.lister.length > 0 && (
              <details style={css('margin-top:14px')}>
                <summary className="disp" style={css('cursor:pointer;font-size:14px;font-weight:700;color:var(--sp-mint)')}>Horarios de cada servicio</summary>
                <dl style={css(INTER + 'margin:10px 0 0;font-size:13.5px;line-height:1.5')}>
                  {datos.lister.map((s) => (
                    <div key={s.s} style={css('padding:8px 0;border-top:1px solid rgba(255,255,255,.12)')}>
                      <dt style={css('font-weight:700;color:#fff')}>{s.s}</dt>
                      <dd style={css('margin:2px 0 0;color:var(--sp-blue-soft)')}>{s.h}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}
          </div>
        )}

        {/* Resultados */}
        <div aria-live="polite" style={css('display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;margin:22px 2px 12px')}>
          <span style={css(INTER + 'font-size:14.5px;color:var(--sp-text)')}>
            {/* Se cuentan médicos y centros distintos, igual que el simulador
                ("en Luque tenés 12"): un mismo médico con dos especialidades o
                dos sedes es una persona, aunque ocupe dos tarjetas. */}
            <b className="num-tnum" style={css('color:var(--sp-navy)')}>{distintos}</b> {distintos === 1 ? 'médico o centro' : 'médicos y centros'}
            {distintos !== res.length && <span style={css('color:var(--sp-muted)')}> · {res.length} resultados</span>}
          </span>
          {hayFiltros && <button type="button" onClick={limpiar} className="disp" style={css('border:none;background:none;color:var(--sp-teal-deep);font-size:14px;font-weight:700;cursor:pointer;padding:6px 0')}>Limpiar filtros</button>}
        </div>

        {f.esp && datos.notas[f.esp] && (
          <p style={css(INTER + 'font-size:14px;line-height:1.55;color:var(--sp-text);background:#fff;border:1px solid var(--sp-line);border-radius:var(--r-sm);padding:12px 14px;margin:0 0 12px')}>{datos.notas[f.esp]}.</p>
        )}

        {res.length ? (
          <div style={css('display:grid;gap:12px')}>
            {res.slice(0, n).map((p) => <Tarjeta key={p.f} p={p} conRedes={!f.plan} />)}
            {res.length > n && (
              <button type="button" onClick={() => { setN(n + POR_PAGINA); track('guia_mas', {}); }} className="disp" style={css('height:50px;border-radius:var(--r-md);border:2px solid var(--sp-navy);background:#fff;color:var(--sp-navy);font-size:15px;font-weight:800;cursor:pointer')}>
                Ver más ({res.length - n} restantes)
              </button>
            )}
          </div>
        ) : (
          <div style={css('background:#fff;border:1px solid var(--sp-line);border-radius:var(--r-md);padding:28px 20px;text-align:center')}>
            <h2 className="disp" style={css('font-size:20px;color:var(--sp-navy);margin:0 0 8px')}>{f.q ? <>No encontramos «{f.q}» en la red.</> : 'No hay resultados con esos filtros.'}</h2>
            {sug && <p style={css(INTER + 'font-size:15px;margin:0 0 6px;color:var(--sp-text)')}>¿Quisiste decir <button type="button" onClick={() => setQ(sug)} className="disp" style={css('border:none;background:none;padding:0;color:var(--sp-teal-deep);font-weight:800;font-size:15px;cursor:pointer;text-decoration:underline;text-underline-offset:3px')}>{sug}</button>?</p>}
            <p style={css(INTER + 'font-size:14.5px;line-height:1.55;color:var(--sp-muted);margin:0 auto 16px;max-width:440px')}>Probá con otra palabra o sacá algún filtro. Si no aparece, escribinos y te decimos dónde atenderte.</p>
            <a href={f.q ? waSinResultado : waNoEncuentro} onClick={() => track('guia_whatsapp', { origen: 'sin_resultados' })} className="disp" style={css('height:46px;padding:0 20px;border-radius:var(--r-sm);background:var(--sp-teal-deep);color:#fff;font-size:15px;font-weight:700;display:inline-flex;align-items:center')}>Preguntar por WhatsApp</a>
          </div>
        )}

        {/* De dónde salen los datos — dicho, no escondido. */}
        <div style={css(INTER + 'margin-top:28px;font-size:13px;line-height:1.6;color:var(--sp-muted)')}>
          <p style={css('margin:0 0 8px')}>La red cambia: antes de ir, llamá para pedir tu turno y confirmá que atiende con tu plan. ¿No encontrás a tu médico? <a href={waNoEncuentro} onClick={() => track('guia_whatsapp', { origen: 'pie' })} style={css('color:var(--sp-teal-deep);font-weight:700')}>Preguntanos por WhatsApp</a>.</p>
          <p style={css('margin:0')}>Datos de la Guía Médica de cada plan: Silver, Gold, Vital y otros al {fechaLarga(G.privilege && G.privilege.fecha)} · SP Esencial al {fechaLarga(G.ess_asucentral && G.ess_asucentral.fecha)} · Plan Estatal al {fechaLarga(G.estatal && G.estatal.fecha)}.</p>
        </div>

        {/* La otra mitad del puente con el simulador (dec. 12e: la página vende
            el simulador). Quien llega buscando a su médico y todavía no es
            cliente ya sabe dónde se atendería: le falta saber cuánto sale. */}
        <div style={css('margin-top:26px;background:#fff;border:1px solid var(--sp-line);border-radius:var(--r-md);padding:20px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px')}>
          <div style={css('min-width:220px;flex:1')}>
            <h2 className="disp" style={css('font-size:18px;color:var(--sp-navy);margin:0 0 4px')}>¿Todavía no tenés plan?</h2>
            <p style={css(INTER + 'font-size:14.5px;line-height:1.5;color:var(--sp-text);margin:0')}>En un minuto ves cuál te conviene y cuánto sale, sin dejar tus datos.</p>
          </div>
          <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'guia' })} className="disp" style={css('height:46px;padding:0 20px;border-radius:var(--r-sm);background:var(--sp-teal-deep);color:#fff;font-size:15px;font-weight:700;display:inline-flex;align-items:center')}>Simulá tu plan →</a>
        </div>

        <div style={css('text-align:center;margin-top:30px')}>
          <a href={`${BP}/`} className="disp" style={css('color:var(--sp-teal-deep);font-weight:700;font-size:15px')}>← Volver al inicio</a>
        </div>
      </div>
    </div>
  );
}
