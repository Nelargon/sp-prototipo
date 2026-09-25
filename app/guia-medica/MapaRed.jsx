'use client';

import { useMemo } from 'react';
import { css } from '../css';
import { CIUDADES, proyeccion } from '../../lib/mapa-paraguay';

/* El mapa de la Guía Médica (25/09/2026, opción 2 de docs/diseno n.º 35).
   ----------------------------------------------------------------------------
   Muestra DÓNDE ESTÁN los resultados de lo que la persona eligió (especialidad,
   búsqueda, plan): un punto por ciudad, más grande donde hay más. Tocar un
   punto elige esa ciudad en «Tu ciudad o localidad». Sin nada elegido, muestra
   toda la red.
   - En pantallas anchas va al costado de la lista; en el resto, detrás del
     botón «Lista | Mapa» (GuiaMedica.jsx).
   - SIN NÚMEROS: la guía no muestra totales de prestadores (decisión de Arturo
     del 23/09/2026, HANDOFF «La Guía Médica cambia de cara»). El tamaño del
     punto dice dónde hay más; la lista de abajo dice cuáles son, en orden.
   - Los puntos son para el mouse y el dedo; la lista de ciudades es la misma
     acción con teclado y lector de pantalla (el dibujo va aria-hidden). */

const W = 300;
const H = 330;
const { p: proyectar, trazo: CONTORNO } = proyeccion(W, H, 6);
const INTER = 'font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;';
const der = <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>;
const check = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;

export default function MapaRed({ lista, que, sel, elegir, limpiar, enLista = 6 }) {
  // Cuántos prestadores distintos hay en cada ciudad (un id cuenta una vez).
  const ciudades = useMemo(() => {
    const por = {};
    for (const p of lista) {
      const k = p.c + '|' + p.dp;
      (por[k] = por[k] || { c: p.c, dp: p.dp, ids: new Set() }).ids.add(p.id);
    }
    return Object.values(por)
      .map((x) => ({ c: x.c, dp: x.dp, n: x.ids.size, xy: CIUDADES[x.c + '|' + x.dp] }))
      .sort((a, b) => b.n - a.n || a.c.localeCompare(b.c, 'es'));
  }, [lista]);

  if (!ciudades.length) return null;
  const max = ciudades[0].n;
  const radio = (n) => 3 + Math.sqrt(n / max) * 13;
  const esSel = (x) => sel && x.c === sel;
  const tocar = (x) => (esSel(x) ? limpiar() : elegir({ c: x.c, dp: x.dp }, 'mapa'));

  // Nombres en el dibujo: las dos ciudades con más y la elegida.
  const rotulos = new Set(ciudades.slice(0, 2).map((x) => x.c));
  if (sel) rotulos.add(sel);
  const enLaLista = ciudades.slice(0, enLista);
  const elegida = ciudades.find(esSel);
  if (elegida && !enLaLista.includes(elegida)) enLaLista.push(elegida);
  const dibujadas = [...ciudades].filter((x) => x.xy).reverse(); // las grandes, abajo

  return (
    <div className="sq rel" style={css('--sq:var(--r-md);background:#fff;border:1px solid var(--gm-linea);padding:16px 16px 12px')}>
      <div className="disp" style={css('font-size:15px;font-weight:800;color:var(--sp-navy)')}>Dónde están</div>
      <div style={css(INTER + 'font-size:12.5px;line-height:1.4;color:var(--sp-muted);margin:2px 0 6px')}>{que} · {ciudades.length} {ciudades.length === 1 ? 'ciudad' : 'ciudades'}</div>

      <svg viewBox={`0 0 ${W} ${H}`} style={css('width:100%;max-width:380px;height:auto;display:block;margin:0 auto;overflow:visible')} aria-hidden="true">
        <path d={CONTORNO} fill="var(--sp-mint-bg)" stroke="var(--sp-mint-line-strong)" strokeWidth="1.3" />
        {dibujadas.map((x) => {
          const [lon, lat] = [x.xy[1], x.xy[0]];
          const [cx, cy] = proyectar(lon, lat);
          const r = radio(x.n);
          const s = esSel(x);
          return (
            <g key={x.c + x.dp} onClick={() => tocar(x)} style={css('cursor:pointer')}>
              <title>{x.c}</title>
              <circle cx={cx} cy={cy} r={r + 7} fill="transparent" />
              {s && <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke="var(--sp-teal-deep)" strokeWidth="2" strokeOpacity=".35" />}
              <circle cx={cx} cy={cy} r={r} fill={s ? 'var(--sp-teal-deep)' : 'var(--sp-teal)'} fillOpacity={s ? 1 : 0.78} stroke="#fff" strokeWidth="1.3" />
            </g>
          );
        })}
        {dibujadas.filter((x) => rotulos.has(x.c)).map((x) => {
          const [cx, cy] = proyectar(x.xy[1], x.xy[0]);
          return <text key={'t' + x.c} x={cx - radio(x.n) - 5} y={cy + 4} textAnchor="end" style={css('font-family:var(--font-display),sans-serif;font-size:12px;font-weight:800;paint-order:stroke;stroke:#fff;stroke-width:4px;pointer-events:none;fill:' + (esSel(x) ? 'var(--sp-teal-deep)' : 'var(--sp-navy)'))}>{x.c}</text>;
        })}
      </svg>

      <div role="group" aria-label="Elegí una ciudad" style={css('border-top:1px solid var(--sp-line-2);margin-top:6px')}>
        {enLaLista.map((x) => (
          <button key={x.c + x.dp} type="button" className="fila" aria-pressed={!!esSel(x)} onClick={() => tocar(x)} style={css('width:100%;min-height:40px;padding:0 4px;border:none;border-bottom:1px solid var(--sp-line-2);background:#fff;display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;text-align:left')}>
            <span className="disp" style={css('font-size:14px;font-weight:' + (esSel(x) ? '900' : '700') + ';color:var(--sp-navy)')}>{x.c}{x.dp !== 'Capital' && x.dp !== x.c ? <span style={css(INTER + 'font-weight:400;font-size:12.5px;color:var(--sp-muted)')}> · {x.dp}</span> : null}</span>
            <span style={css('display:flex;color:' + (esSel(x) ? 'var(--sp-teal-deep)' : 'var(--sp-blue-meta)'))}>{esSel(x) ? check : der}</span>
          </button>
        ))}
      </div>
      <div style={css(INTER + 'font-size:12px;line-height:1.5;color:var(--sp-muted);margin-top:8px')}>
        {sel ? 'Tocá la ciudad de nuevo para ver todas.' : 'Tocá una ciudad para ver solo esa.'} Ubicaciones: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" style={css('color:var(--sp-muted)')}>OpenStreetMap</a>.
      </div>
    </div>
  );
}
