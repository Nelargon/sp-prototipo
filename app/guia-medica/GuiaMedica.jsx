'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { css } from '../css';
import { BP } from '../basePath';
import { track } from '../track';
import { WHATSAPP_NUMBER, SP_TEL } from '../quote';
import Header from '../Header';
import PuntoRevisar from './PuntoRevisar';
import datos from '../../lib/guia-medica.json';
import { GRUPOS_PLAN, grupoDePlan, nombrePlan, indexar, filtrar, catalogos, sugerir, redesCortas, telHref, mapaHref, condicionTexto, interpretar } from '../../lib/red-medica';

/* /guia-medica — ¿dónde me atiendo?
   ----------------------------------------------------------------------------
   Diseño del 23/09/2026 («síntesis con cápsulas», elegido por Arturo en el
   lienzo de diseño entre nueve caminos). Lo que cuenta es la especialidad y la
   zona; el plan es un filtro, y la tarjeta dice sola con qué planes se usa.
   Sin totales de prestadores (pedido de Arturo): la persona busca un médico,
   no una cifra. Fondo gris claro y esquinas de curvatura continua (.sq).

   Todo el estado vive en la URL (?q, plan, esp, z, dp, c): un resultado se
   puede pasar por WhatsApp tal cual, y el simulador manda con plan y zona.

   PRIVACIDAD: lo que alguien busca acá puede ser un dato de salud
   ("psiquiatra", "embarazo", "me duele el pecho"). El texto NO se manda nunca a
   la analítica: solo el largo y si hubo resultados. */

const P = datos.prestadores;
const INDICE = indexar(P);
const CAT = catalogos(P);
const POR_PAGINA = 20;
const CAMPOS = ['q', 'plan', 'esp', 'z', 'dp', 'c'];
const VACIO = { q: '', plan: '', esp: '', z: '', dp: '', c: '' };
const waDigits = String(WHATSAPP_NUMBER).replace(/\D/g, '');
const INTER = 'font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;';

/* "Lo que más se busca". ⚠ Orden PROVISORIO: todavía no hay medición
   (track() no está conectado a nada). Cuando lo esté, este orden sale de los
   eventos guia_filtro {campo: 'esp'} de la semana — la especialidad tocada,
   nunca lo que la persona escribió. */
const MAS_BUSCADO = ['Ginecología y Obstetricia', 'Pediatría', 'Clínica Médica', 'Oftalmología', 'Laboratorio', 'Otorrinolaringología', 'Traumatología', 'Odontología'];

// Zonas: lo que una familia reconoce, no los 17 departamentos.
const ZONAS = [{ k: '', n: 'Todo el país' }, { k: 'asu', n: 'Asunción' }, { k: 'central', n: 'Central' }, { k: 'interior', n: 'Interior' }];
const zonaDeDepto = (dp) => (!dp ? '' : dp === 'Capital' ? 'asu' : dp === 'Central' ? 'central' : 'interior');
const DEPTOS_INTERIOR = CAT.departamentos.filter((d) => d.d !== 'Capital' && d.d !== 'Central');
const CIUDADES_CENTRAL = (CAT.departamentos.find((d) => d.d === 'Central') || { ciudades: [] }).ciudades;

// Estudios que piden orden médica visada: su tarjeta ofrece "Visar la orden".
const PIDE_ORDEN = new Set(['Laboratorio', 'Diagnóstico por Imagen', 'Ecografía', 'Radiografía', 'Anatomía Patológica', 'Ecocardiograma', 'Electrocardiograma', 'Holter y MAPA', 'Estudios Audiológicos', 'PAP y Colposcopía']);

const REQUISITOS = ['Nombre del paciente y fecha', 'Estudios pedidos y diagnóstico presuntivo', 'Firma y sello del médico, con su registro profesional', 'Dónde te vas a hacer el estudio'];
const WA_VISAR = 'https://wa.me/' + waDigits + '?text=' + encodeURIComponent('Hola, quiero visar una orden médica. Te mando la foto.');

const Icono = {
  buscar: <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>,
  orden: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="m9 15 2 2 4-4" /></svg>,
  abajo: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>,
  der: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>,
  x: <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>,
  check: <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>,
  pin: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  wa: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.5 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z" /></svg>,
};

// Una cápsula chica (filtro de segunda fila, plan, ciudad).
const chip = (on) => 'height:34px;padding:0 13px;border-radius:var(--r-pill);font-size:14px;font-weight:700;white-space:nowrap;flex-shrink:0;cursor:pointer;border:1.5px solid ' + (on ? 'var(--sp-navy);background:var(--sp-navy);color:#fff' : 'var(--gm-borde);background:#fff;color:var(--sp-navy)');
const KICKER = 'font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--sp-teal-900)';

function Tarjeta({ p, plan, abrirVisar }) {
  return (
    <article className="sq" style={css('--sq:12px;background:#fff;border:1px solid var(--gm-linea);padding:15px 16px;display:flex;flex-direction:column;gap:6px')}>
      <div style={css('display:flex;justify-content:space-between;align-items:center;gap:8px')}>
        <span className="disp" style={css('font-size:11.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--sp-teal-900)')}>{p.e}</span>
        {p.l ? <span className="disp sq" style={css('--sq:5px;font-size:11px;font-weight:800;color:var(--sp-navy);background:var(--sp-blue-bg);padding:2px 7px')}>Lister</span> : null}
      </div>
      <h3 className="disp" style={css('font-size:17px;line-height:1.28;color:var(--sp-navy);margin:0')}>
        <a href={`${BP}/guia-medica/${p.id}/`} onClick={() => track('guia_ficha', { origen: 'lista' })} style={css('color:inherit')}>{p.n}</a>
        {p.rv ? <PuntoRevisar /> : null}
      </h3>
      <p style={css(INTER + 'font-size:14px;line-height:1.45;color:var(--sp-text-2);margin:0')}>
        {p.d}{p.b ? ` · ${p.b}` : ''} · {p.c}{p.dp && p.dp !== 'Capital' && p.dp !== p.c ? `, ${p.dp}` : ''}
      </p>
      {/* La etiqueta del plan se acomoda sola: con un plan elegido dice que
          atiende con él; sin plan, una línea gris dice con cuáles. */}
      {plan
        ? <span className="sq" style={css(INTER + '--sq:6px;align-self:flex-start;font-size:12.5px;font-weight:600;color:var(--sp-teal-ink);background:var(--sp-mint-bg);padding:3px 8px;display:inline-flex;align-items:center;gap:4px')}>{Icono.check} Atiende con {nombrePlan(plan)}</span>
        : <span style={css(INTER + 'font-size:12.5px;color:var(--sp-muted)')}>Planes: {redesCortas(p.r).join(' · ')}</span>}
      {p.k && <p style={css(INTER + 'font-size:13px;line-height:1.45;color:var(--sp-muted);margin:0')}>{condicionTexto(p.k)}</p>}
      {p.e === 'Odontología' && <p style={css(INTER + 'font-size:13px;line-height:1.45;color:var(--sp-muted);margin:0')}>Antes de ir, preguntá a tu asesor qué cubre tu plan en odontología.</p>}
      <div style={css('display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-top:4px')}>
        {p.tel[0] && (
          <a href={telHref(p.tel[0])} onClick={() => track('guia_llamar', { tipo: p.t })} className="disp num-tnum" style={css('height:36px;padding:0 14px;border-radius:var(--r-pill);background:var(--sp-mint-bg);border:1px solid #BFE6E3;color:var(--sp-teal-ink);font-size:15px;font-weight:800;display:inline-flex;align-items:center')}>{p.tel[0]}</a>
        )}
        <a href={mapaHref(p)} target="_blank" rel="noopener" onClick={() => track('guia_mapa', { tipo: p.t })} style={css(INTER + 'font-size:14px;font-weight:600;color:var(--sp-navy);display:inline-flex;align-items:center;gap:4px')}>{Icono.pin} Cómo llegar</a>
        {PIDE_ORDEN.has(p.e) && (
          <button type="button" onClick={() => abrirVisar('tarjeta')} style={css(INTER + 'border:none;background:none;padding:0;font-size:14px;font-weight:600;color:var(--sp-teal-deep);display:inline-flex;align-items:center;gap:4px;cursor:pointer')}>{Icono.orden} Visar la orden</button>
        )}
      </div>
    </article>
  );
}

export default function GuiaMedica() {
  const [f, setF] = useState(VACIO);
  const [q, setQ] = useState('');
  const [n, setN] = useState(POR_PAGINA);
  const [panel, setPanel] = useState(''); // '' | 'plan'
  const [todas, setTodas] = useState(false);
  const [abiertos, setAbiertos] = useState({});
  const [grupoAbierto, setGrupoAbierto] = useState('');
  const [visar, setVisar] = useState(false);
  const listo = useRef(false);
  const refVisar = useRef(null);

  // Estado inicial desde la URL (links compartidos, simulador, home).
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const ini = { ...VACIO };
    for (const k of CAMPOS) ini[k] = u.get(k) || '';
    if (!ini.z) ini.z = zonaDeDepto(ini.dp);
    setF(ini);
    setQ(ini.q);
    listo.current = true;
  }, []);

  // La búsqueda escrita se aplica con una pausa, para no filtrar letra por letra.
  useEffect(() => {
    const t = setTimeout(() => setF((v) => (v.q === q ? v : { ...v, q, esp: q ? '' : v.esp })), 220);
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

  // Lo que la persona siente («me duele la cabeza») → a quién ir.
  const sint = useMemo(() => (f.q ? interpretar(f.q) : { urg: false, esp: [], motivo: '' }), [f.q]);

  const res = useMemo(() => {
    const base = { plan: f.plan, esp: f.esp, dp: f.z === 'interior' ? f.dp : (f.z === 'asu' ? 'Capital' : f.z === 'central' ? 'Central' : ''), c: f.c };
    let lista = filtrar(P, INDICE, { ...base, q: f.q });
    // Si lo escrito es un síntoma, suman los especialistas que lo ven,
    // en el orden de "a quién ir primero".
    if (sint.esp.length) {
      const ya = new Set(lista.map((p) => p.f));
      for (const e of sint.esp) for (const p of filtrar(P, INDICE, { ...base, esp: e })) if (!ya.has(p.f)) { ya.add(p.f); lista.push(p); }
    }
    if (f.z === 'interior' && !f.dp) lista = lista.filter((p) => p.dp !== 'Capital' && p.dp !== 'Central');
    return lista;
  }, [f, sint]);
  const sug = useMemo(() => (f.q && !res.length ? sugerir(P, f.q) : null), [f.q, res.length]);

  useEffect(() => {
    if (f.q) track('guia_buscar', { largo: f.q.length, resultados: res.length, sintoma: sint.esp.length > 0, urgencia: sint.urg });
  }, [f.q]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (cambios, campo) => {
    track('guia_filtro', { campo });
    setF((x) => ({ ...x, ...cambios }));
  };
  const elegirEsp = (e, origen) => { setQ(''); setTodas(false); track('guia_filtro', { campo: 'esp', origen }); setF((x) => ({ ...x, q: '', esp: e })); };
  const abrirVisar = (origen) => {
    setVisar(true);
    track('guia_visar', { origen });
    setTimeout(() => refVisar.current && refVisar.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  };

  // Plan: los mismos dos pasos de siempre (GRUPOS_PLAN), dentro de la cápsula.
  const grupoActual = grupoAbierto || grupoDePlan(f.plan);
  const grupoConOpciones = GRUPOS_PLAN.find((g) => g.k === grupoActual && g.opciones);
  const elegirGrupo = (g) => {
    if (g.opciones) {
      if (grupoActual === g.k) { setGrupoAbierto(''); set({ plan: '' }, 'plan'); return; }
      setGrupoAbierto(g.k);
      if (grupoDePlan(f.plan) !== g.k) set({ plan: '' }, 'plan');
      return;
    }
    setGrupoAbierto('');
    set({ plan: f.plan === g.v ? '' : g.v }, 'plan');
    if (f.plan !== g.v) setPanel('');
  };

  // Con una especialidad, un texto o una ciudad elegida se ven resultados; con
  // solo zona o plan, la pantalla de inicio (y los filtros ya puestos).
  const buscando = !!(f.q || f.esp || f.c);

  // Segunda fila de la zona: ciudades de Central; departamentos del Interior
  // y, elegido uno, sus ciudades.
  let fila2 = null;
  if (f.z === 'central') fila2 = { items: CIUDADES_CENTRAL.map((c) => ({ n: c, on: f.c === c, pick: () => set({ c: f.c === c ? '' : c }, 'ciudad') })), todas: () => set({ c: '' }, 'ciudad'), todasOn: !f.c };
  if (f.z === 'interior') {
    const dep = DEPTOS_INTERIOR.find((d) => d.d === f.dp);
    fila2 = dep && dep.ciudades.length > 1
      ? { atras: () => set({ dp: '', c: '' }, 'dp'), titulo: dep.d, items: dep.ciudades.map((c) => ({ n: c, on: f.c === c, pick: () => set({ c: f.c === c ? '' : c }, 'ciudad') })), todas: () => set({ c: '' }, 'ciudad'), todasOn: !f.c }
      : { items: DEPTOS_INTERIOR.map((d) => ({ n: d.d, on: f.dp === d.d, pick: () => set({ dp: f.dp === d.d ? '' : d.d, c: '' }, 'dp') })), todas: () => set({ dp: '', c: '' }, 'dp'), todasOn: !f.dp };
  }

  const G = datos.meta.guias;
  const fecha = (G.privilege && G.privilege.fecha) || '';
  const waSinResultado = 'https://wa.me/' + waDigits + '?text=' + encodeURIComponent('Hola! Busqué «' + f.q + '» en la Guía Médica y no lo encontré. ¿Me ayudan?');
  const waNoEncuentro = 'https://wa.me/' + waDigits + '?text=' + encodeURIComponent('Hola! Quiero saber si un profesional está en la red de mi plan.');

  return (
    <div className="body gm" style={css('min-height:100vh;background:var(--gm-fondo);color:var(--sp-ink)')}>
      <Header variant="solid" />

      <div style={css('max-width:720px;margin:0 auto;padding:96px 16px 70px;display:flex;flex-direction:column;gap:14px')}>
        {/* Encabezado */}
        <div style={css('display:flex;flex-direction:column;gap:8px')}>
          <div style={css('display:flex;justify-content:space-between;align-items:flex-start;gap:12px')}>
            <h1 className="disp" style={css('margin:0;font-size:clamp(34px,6vw,44px);line-height:1.05;font-weight:900;color:var(--sp-navy);letter-spacing:-0.01em')}>Guía médica</h1>
            <button type="button" onClick={() => abrirVisar('encabezado')} className="disp" style={css('flex-shrink:0;margin-top:4px;height:36px;padding:0 12px;border-radius:var(--r-pill);border:1.5px solid var(--sp-teal-deep);background:#fff;color:var(--sp-teal-deep);font-size:13.5px;font-weight:800;display:flex;align-items:center;gap:6px;cursor:pointer')}>{Icono.orden} Visar una orden</button>
          </div>
          <p style={css(INTER + 'margin:0;font-size:15px;line-height:1.45;color:var(--sp-text-2)')}>Médicos, sanatorios y laboratorios, con dirección y teléfono.</p>
          <div style={css(INTER + 'font-size:13.5px;color:var(--sp-muted)')}>Datos al <b style={css('color:var(--sp-navy)')}>{fecha}</b> · <a href={`tel:${SP_TEL}`} onClick={() => track('guia_llamar', { tipo: 'emergencias' })} style={css('color:var(--sp-muted);text-decoration:underline;text-underline-offset:3px')}>Ambulancia y emergencias</a></div>
        </div>

        {/* Visar una orden */}
        {visar && (
          <section ref={refVisar} aria-label="Visar una orden médica" className="sq" style={css('--sq:14px;scroll-margin-top:90px;background:#fff;border:1.5px solid var(--sp-teal-deep);padding:16px;display:flex;flex-direction:column;gap:10px')}>
            <div style={css('display:flex;justify-content:space-between;align-items:center')}>
              <h2 className="disp" style={css('margin:0;font-size:18px;font-weight:900;color:var(--sp-navy)')}>Visá tu orden médica</h2>
              <button type="button" onClick={() => setVisar(false)} aria-label="Cerrar" style={css('width:36px;height:36px;border-radius:var(--r-pill);border:none;background:var(--gm-fondo);color:var(--sp-text-2);display:flex;align-items:center;justify-content:center;cursor:pointer')}>{Icono.x}</button>
            </div>
            <p style={css(INTER + 'margin:0;font-size:14px;line-height:1.5;color:var(--sp-text-2)')}>Mandá una foto de la orden y decinos dónde te vas a hacer el estudio. La visación vale 30 días.</p>
            <div className="sq" style={css('--sq:10px;background:var(--gm-fondo);padding:10px 12px;display:flex;flex-direction:column;gap:4px')}>
              <div className="disp" style={css(KICKER)}>Tu orden tiene que tener</div>
              {REQUISITOS.map((r) => <div key={r} style={css(INTER + 'display:flex;gap:8px;font-size:13.5px;line-height:1.45;color:var(--sp-text)')}><span style={css('color:var(--sp-teal-deep);display:flex;margin-top:3px')}>{Icono.check}</span>{r}</div>)}
            </div>
            <a href={WA_VISAR} target="_blank" rel="noopener" onClick={() => track('guia_whatsapp', { origen: 'visar' })} className="disp sq" style={css('--sq:10px;height:46px;background:var(--sp-teal-deep);color:#fff;font-size:15.5px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:8px')}>{Icono.wa} Enviar mi orden por WhatsApp</a>
            <div style={css(INTER + 'font-size:12.5px;color:var(--sp-muted);text-align:center')}>También podés visarla desde la App de Salud Protegida.</div>
          </section>
        )}

        {/* Buscador */}
        <label className="sq" style={css('--sq:12px;display:flex;align-items:center;gap:10px;height:52px;padding:0 8px 0 16px;border:1.5px solid var(--sp-blue-pale);background:#fff;color:var(--sp-blue-meta)')}>
          {Icono.buscar}
          <input value={q} onChange={(e) => setQ(e.target.value)} type="search" autoComplete="off" aria-label="Buscar en la Guía Médica" placeholder="Nombre, especialidad o lo que sentís" style={css(INTER + 'flex:1;min-width:0;height:48px;border:none;outline:none;font-size:16.5px;background:transparent;color:var(--sp-ink)')} />
          {q && <button type="button" onClick={() => setQ('')} className="disp" style={css('border:none;background:none;color:var(--sp-muted);font-size:13px;font-weight:700;cursor:pointer;padding:0 8px')}>Borrar</button>}
        </label>

        {/* Zona: la tira siempre visible */}
        <div role="group" aria-label="Zona" className="sq" style={css('--sq:12px;display:flex;gap:4px;background:var(--gm-linea);padding:4px')}>
          {ZONAS.map((z) => {
            const on = f.z === z.k;
            return <button key={z.k || 'todo'} type="button" aria-pressed={on} onClick={() => set({ z: z.k, dp: '', c: '' }, 'zona')} className="disp sq" style={css('--sq:9px;flex:1;min-width:0;height:36px;border:none;font-size:13.5px;font-weight:800;cursor:pointer;white-space:nowrap;' + (on ? 'background:#fff;color:var(--sp-navy);box-shadow:0 1px 2px rgba(0,0,0,.12)' : 'background:transparent;color:var(--sp-estado-ink)'))}>{z.n}</button>;
          })}
        </div>
        {fila2 && (
          <div className="gm-fila" role="group" aria-label={f.z === 'interior' && !fila2.titulo ? 'Departamento' : 'Ciudad'}>
            {fila2.atras && <button type="button" onClick={fila2.atras} style={css(chip(false))}>← {fila2.titulo}</button>}
            <button type="button" onClick={fila2.todas} style={css(chip(fila2.todasOn))}>Todas</button>
            {fila2.items.map((it) => <button key={it.n} type="button" aria-pressed={it.on} onClick={it.pick} style={css(chip(it.on))}>{it.n}</button>)}
          </div>
        )}

        {/* Especialidad y plan, en dos cápsulas */}
        <div style={css('display:flex;gap:8px')}>
          <button type="button" onClick={() => (f.esp ? set({ esp: '' }, 'esp') : setTodas(true))} aria-expanded={!f.esp && todas} className="disp sq" style={css('--sq:10px;flex:1;min-width:0;height:42px;padding:0 12px;font-size:14px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:6px;' + (f.esp ? 'background:var(--sp-navy);color:#fff;border:1.5px solid var(--sp-navy)' : 'background:#fff;color:var(--sp-navy);border:1.5px solid var(--gm-borde)'))}>
            <span style={css('overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{f.esp || 'Especialidad'}</span>{f.esp ? Icono.x : Icono.abajo}
          </button>
          <button type="button" onClick={() => setPanel(panel === 'plan' ? '' : 'plan')} aria-expanded={panel === 'plan'} className="disp sq" style={css('--sq:10px;flex:1;min-width:0;height:42px;padding:0 12px;font-size:14px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:6px;' + (f.plan ? 'background:var(--sp-navy);color:#fff;border:1.5px solid var(--sp-navy)' : 'background:#fff;color:var(--sp-navy);border:1.5px solid ' + (panel === 'plan' ? 'var(--sp-navy)' : 'var(--gm-borde)')))}>
            <span style={css('overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{f.plan ? nombrePlan(f.plan) : 'Tu plan'}</span>{Icono.abajo}
          </button>
        </div>
        {panel === 'plan' && (
          <div role="group" aria-label="¿Qué plan tenés?" className="sq" style={css('--sq:12px;background:#fff;border:1px solid var(--gm-linea);padding:12px;display:flex;flex-direction:column;gap:10px')}>
            <div style={css('display:flex;justify-content:space-between;align-items:baseline')}>
              <span style={css(INTER + 'font-size:13.5px;color:var(--sp-text-2)')}>¿Qué plan tenés? Te mostramos solo quién te atiende con él.</span>
            </div>
            <div style={css('display:flex;flex-wrap:wrap;gap:6px')}>
              <button type="button" onClick={() => { setGrupoAbierto(''); set({ plan: '' }, 'plan'); setPanel(''); }} style={css(chip(!f.plan && !grupoAbierto))}>Todos</button>
              {GRUPOS_PLAN.map((g) => <button key={g.k} type="button" aria-pressed={grupoActual === g.k} onClick={() => elegirGrupo(g)} style={css(chip(grupoActual === g.k))}>{g.label}{g.opciones ? ' ▾' : ''}</button>)}
            </div>
            {grupoConOpciones && (
              <div style={css('display:flex;flex-direction:column;gap:6px')}>
                <span style={css(INTER + 'font-size:13px;color:var(--sp-muted)')}>{grupoConOpciones.pregunta}</span>
                <div style={css('display:flex;flex-wrap:wrap;gap:6px')}>
                  {grupoConOpciones.opciones.map((o) => <button key={o.v} type="button" aria-pressed={f.plan === o.v} onClick={() => { set({ plan: o.v }, 'plan'); setPanel(''); }} style={css(chip(f.plan === o.v))}>{o.label}</button>)}
                </div>
              </div>
            )}
          </div>
        )}


        {/* Inicio: lo que más se busca y todas las especialidades */}
        {!buscando && (
          <>
            <div className="disp" style={css(KICKER + ';margin-top:4px')}>Lo que más se busca</div>
            {/* Una sola lista agrupada, con filas finas y separadores: la misma
                forma que la lista de especialidades (pedido de Arturo, 23/09). */}
            <div className="sq" style={css('--sq:10px;background:#fff;border:1px solid var(--gm-linea);overflow:hidden')}>
              {MAS_BUSCADO.map((e, i) => (
                <button key={e} type="button" onClick={() => elegirEsp(e, 'mas_buscado')} style={css('width:100%;height:44px;padding:0 14px;border:none;border-bottom:1px solid var(--sp-line-2);background:#fff;display:flex;align-items:center;gap:12px;cursor:pointer;text-align:left')}>
                  <span className="disp" style={css('width:16px;font-size:13.5px;font-weight:900;color:var(--sp-blue-meta)')}>{i + 1}</span>
                  <span style={css(INTER + 'flex:1;font-size:15px;color:var(--sp-navy)')}>{e}</span>
                  <span style={css('color:var(--sp-blue-meta);display:flex')}>{Icono.der}</span>
                </button>
              ))}
              <button type="button" onClick={() => { setQ('lister'); track('guia_filtro', { campo: 'lister' }); }} style={css('width:100%;height:44px;padding:0 14px;border:none;background:#fff;display:flex;align-items:center;gap:12px;cursor:pointer;text-align:left')}>
                <span className="disp sq" style={css('--sq:5px;font-size:11px;font-weight:800;color:var(--sp-navy);background:var(--sp-blue-bg);padding:2px 7px')}>Lister</span>
                <span style={css(INTER + 'flex:1;font-size:15px;color:var(--sp-navy)')}>Nuestro centro médico</span>
                <span style={css('color:var(--sp-blue-meta);display:flex')}>{Icono.der}</span>
              </button>
            </div>
            <button type="button" onClick={() => setTodas(!todas)} aria-expanded={todas} className="disp" style={css('align-self:flex-start;height:36px;padding:0 2px;border:none;background:transparent;color:var(--sp-teal-deep);font-size:14.5px;font-weight:800;cursor:pointer')}>{todas ? 'Ocultar la lista completa' : 'Ver todas las especialidades'}</button>
            {todas && CAT.especialidades.map((g) => (
              <div key={g.g} style={css('display:flex;flex-direction:column')}>
                <button type="button" onClick={() => setAbiertos({ ...abiertos, [g.g]: !abiertos[g.g] })} aria-expanded={!!abiertos[g.g]} style={css('height:42px;border:none;background:transparent;padding:0 2px;display:flex;align-items:center;justify-content:space-between;cursor:pointer')}>
                  <span className="disp" style={css(KICKER)}>{g.g}</span>
                  <span style={css('color:var(--sp-estado-punto);display:flex;transition:transform .2s;transform:' + (abiertos[g.g] ? 'rotate(180deg)' : 'none'))}>{Icono.abajo}</span>
                </button>
                {abiertos[g.g] && (
                  <div className="sq" style={css('--sq:10px;background:#fff;border:1px solid var(--gm-linea);overflow:hidden')}>
                    {g.items.map((e) => (
                      <button key={e} type="button" onClick={() => elegirEsp(e, 'lista')} style={css('width:100%;height:44px;padding:0 14px;border:none;border-bottom:1px solid var(--sp-line-2);background:#fff;display:flex;align-items:center;cursor:pointer;text-align:left')}>
                        <span style={css(INTER + 'flex:1;font-size:15px;color:var(--sp-navy)')}>{e}</span>
                        <span style={css('color:var(--sp-blue-meta);display:flex')}>{Icono.der}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Resultados */}
        {buscando && (
          <div aria-live="polite" style={css('display:flex;flex-direction:column;gap:10px')}>
            {sint.urg && (
              <a href={`tel:${SP_TEL}`} onClick={() => track('guia_llamar', { tipo: 'urgencia_detectada' })} className="disp sq" style={css('--sq:12px;background:#B42318;color:#fff;padding:13px 16px;font-size:15.5px;font-weight:800;display:flex;justify-content:space-between;align-items:center;gap:10px')}>
                <span>¿Es una emergencia? Llamá a la ambulancia, las 24 horas</span><span className="num-tnum" style={css('white-space:nowrap')}>(021) 319 0000</span>
              </a>
            )}
            {sint.motivo && <p className="sq" style={css(INTER + '--sq:10px;margin:0;font-size:14px;line-height:1.5;color:var(--sp-teal-ink);background:var(--sp-mint-bg);padding:10px 12px')}>{sint.motivo}</p>}
            {f.esp && datos.notas[f.esp] && <p className="sq" style={css(INTER + '--sq:10px;margin:0;font-size:14px;line-height:1.5;color:var(--sp-text);background:#fff;border:1px solid var(--gm-linea);padding:10px 12px')}>{datos.notas[f.esp]}.</p>}
            {f.q.toLowerCase().includes('lister') && datos.lister.length > 0 && (
              <details className="sq" style={css('--sq:10px;background:#fff;border:1px solid var(--gm-linea);padding:10px 14px')}>
                <summary className="disp" style={css('cursor:pointer;font-size:14.5px;font-weight:800;color:var(--sp-navy)')}>Horarios de cada servicio de Lister</summary>
                <dl style={css(INTER + 'margin:8px 0 0;font-size:13.5px;line-height:1.5')}>
                  {datos.lister.map((s) => <div key={s.s} style={css('padding:7px 0;border-top:1px solid var(--sp-line-2)')}><dt style={css('font-weight:700;color:var(--sp-navy)')}>{s.s}</dt><dd style={css('margin:2px 0 0;color:var(--sp-text-2)')}>{s.h}</dd></div>)}
                </dl>
              </details>
            )}
            {res.length ? (
              <>
                {res.slice(0, n).map((p) => <Tarjeta key={p.f} p={p} plan={f.plan} abrirVisar={abrirVisar} />)}
                {res.length > n && (
                  <button type="button" onClick={() => { setN(n + POR_PAGINA); track('guia_mas', {}); }} className="disp sq" style={css('--sq:10px;height:48px;border:1.5px solid var(--sp-navy);background:#fff;color:var(--sp-navy);font-size:15px;font-weight:800;cursor:pointer')}>Ver más</button>
                )}
              </>
            ) : (
              <div className="sq" style={css('--sq:12px;background:#fff;border:1px solid var(--gm-linea);padding:22px 18px;text-align:center')}>
                <h2 className="disp" style={css('font-size:19px;color:var(--sp-navy);margin:0 0 8px')}>{f.q ? <>No encontramos «{f.q}» en la red.</> : 'No hay resultados con estos filtros.'}</h2>
                {sug && <p style={css(INTER + 'font-size:15px;margin:0 0 6px;color:var(--sp-text)')}>¿Quisiste decir <button type="button" onClick={() => setQ(sug)} className="disp" style={css('border:none;background:none;padding:0;color:var(--sp-teal-deep);font-weight:800;font-size:15px;cursor:pointer;text-decoration:underline;text-underline-offset:3px')}>{sug}</button>?</p>}
                <p style={css(INTER + 'font-size:14.5px;line-height:1.55;color:var(--sp-muted);margin:0 auto 14px;max-width:420px')}>Probá con otra zona u otra palabra. Si no aparece, escribinos y te decimos dónde atenderte.</p>
                <a href={f.q ? waSinResultado : waNoEncuentro} onClick={() => track('guia_whatsapp', { origen: 'sin_resultados' })} className="disp sq" style={css('--sq:10px;height:44px;padding:0 18px;background:var(--sp-teal-deep);color:#fff;font-size:15px;font-weight:700;display:inline-flex;align-items:center')}>Preguntar por WhatsApp</a>
              </div>
            )}
          </div>
        )}

        {/* La nota de siempre: confirmar antes de ir */}
        <p className="sq" style={css(INTER + '--sq:10px;margin:6px 0 0;background:var(--sp-estado-bg-2);padding:12px 14px;font-size:13.5px;line-height:1.5;color:var(--sp-estado-ink-2)')}>
          Algunos atienden solo ciertos planes o edades. Antes de ir, llamá para pedir tu turno y confirmá que atiende con tu plan. ¿No encontrás a tu médico? <a href={waNoEncuentro} onClick={() => track('guia_whatsapp', { origen: 'pie' })} style={css('color:var(--sp-teal-ink);font-weight:700')}>Preguntanos por WhatsApp</a>.
        </p>

        {/* La otra mitad del puente con el simulador (dec. 12e). */}
        <div className="sq" style={css('--sq:12px;background:#fff;border:1px solid var(--gm-linea);padding:18px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px')}>
          <div style={css('min-width:200px;flex:1')}>
            <h2 className="disp" style={css('font-size:17px;color:var(--sp-navy);margin:0 0 4px')}>¿Todavía no tenés plan?</h2>
            <p style={css(INTER + 'font-size:14px;line-height:1.5;color:var(--sp-text);margin:0')}>En un minuto ves cuál te conviene y cuánto sale, sin dejar tus datos.</p>
          </div>
          <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'guia' })} className="disp sq" style={css('--sq:10px;height:44px;padding:0 18px;background:var(--sp-teal-deep);color:#fff;font-size:15px;font-weight:700;display:inline-flex;align-items:center')}>Simulá tu plan →</a>
        </div>
      </div>
    </div>
  );
}
