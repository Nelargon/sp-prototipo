'use client';

import { useState } from 'react';
import { BP } from '../basePath';
import { track } from '../track';
import { GUIA_HREF } from '../edicion';
import red from '../../lib/red-home.json';

/* «Dónde te atendés» — la red médica en el home (25/09/2026).
   ----------------------------------------------------------------------------
   Reemplaza a la tira de prestadores en movimiento. Arturo: «¿qué pasa si, en
   vez de que sea una tira dinámica, algo que se ve muchísimo, no es algo más
   original?» (BITACORA cap. 115). Eligió, de cinco versiones, la que junta tres
   (docs/diseno n.º 33 a 35, opción 1 del home):
   - El DESGLOSE en lugar del total: «ese número grande, 615, a veces se puede
     comparar con otras prepagas… que tienen un número mayor». Un total se
     compara con otro total; «44 pediatras» se compara con lo que la persona
     necesita.
   - «¿Dónde vivís?»: la pregunta que trae la persona, con la respuesta ahí
     mismo. No repite la puerta a la Guía Médica (por eso se sacó la franja
     «Lister + más de 50 prestadores» el 6/08): da la respuesta y después
     lleva a la guía con la ciudad ya elegida.
   - El MURO de fondo: los sanatorios y clínicas que están en todos los planes,
     en gris muy claro y sin velo (pedido de Arturo), para que la tarjeta
     resalte sola. Es textura: aria-hidden, sin puntero y sin selección.
   Los datos salen de lib/red-home.json, que scripts/red-home.mjs arma
   de la planilla antes de cada build. Ninguna cifra está escrita a mano. */

const GUIA = `${BP}${GUIA_HREF}`;
const fecha = (red.datos_al || '').split('-').reverse().join('/');
const plural = (n, uno, varios) => (n === 1 ? uno : varios);
const lista = (xs) => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1]);
// El muro, dos vueltas para cubrir la sección en cualquier ancho.
const MURO = [...red.muro, ...red.muro];

export default function DondeTeAtendes() {
  const [sel, setSel] = useState('');
  const ciudad = red.ciudades.find((x) => x.c + '|' + x.dp === sel);
  const d = ciudad || red.pais;

  const cuadros = [
    [d.sanatorios, plural(d.sanatorios, 'sanatorio o clínica', 'sanatorios y clínicas')],
    [d.laboratorios, plural(d.laboratorios, 'laboratorio', 'laboratorios')],
    [d.medicos, plural(d.medicos, 'médico', 'médicos'), ciudad ? '' : `de ${red.pais.especialidades} especialidades`],
    [d.imagenes, plural(d.imagenes, 'centro de diagnóstico por imagen', 'centros de diagnóstico por imagen')],
  ].filter(([n]) => n > 0);
  // Solo las especialidades con dos o más: «1 nutricionista y 1 oftalmólogo» no dice nada.
  const oficios = d.oficios.filter((o) => o.n >= 2);
  const hrefGuia = ciudad ? `${GUIA}?c=${encodeURIComponent(ciudad.c)}&dp=${encodeURIComponent(ciudad.dp)}` : GUIA;

  const elegir = (k, c) => {
    setSel(k);
    track('red_ciudad', { ciudad: c || 'todo_el_pais' });
  };

  return (
    <section className="dta" aria-labelledby="dta-titulo">
      <div className="dta-muro" aria-hidden="true">
        {MURO.map((n, i) => <span key={i} className={i % 6 === 2 ? 'm2' : undefined}>{n}{i < MURO.length - 1 ? <i> · </i> : null}</span>)}
      </div>

      <div className="dta-tarjeta">
        <h2 id="dta-titulo" className="disp dta-titulo">Dónde te <span>atendés</span>.</h2>
        <p className="dta-bajada">Sanatorios, laboratorios y médicos en {red.pais.ciudades} ciudades del país.</p>

        <div id="dta-pregunta" className="disp dta-pregunta">¿Dónde vivís?</div>
        <div className="dta-ciudades" role="group" aria-labelledby="dta-pregunta">
          <button type="button" className="disp dta-ciudad" aria-pressed={!ciudad} onClick={() => elegir('', '')}>Todo el país</button>
          {red.ciudades.map((x) => {
            const k = x.c + '|' + x.dp;
            return <button key={k} type="button" className="disp dta-ciudad" aria-pressed={sel === k} onClick={() => elegir(k, x.c)}>{x.c}</button>;
          })}
          <a href={GUIA} className="disp dta-ciudad dta-otra" onClick={() => track('guia_handoff', { q: '', via: 'red_otra_ciudad' })}>Otra ciudad</a>
        </div>

        <div className="dta-panel" aria-live="polite">
          <div className="dta-panel-tit">
            <b className="disp">{ciudad ? ciudad.c : 'Todo el país'}</b>
            <span>{ciudad ? `${ciudad.total} ${plural(ciudad.total, 'médico o centro', 'médicos y centros')} en la red` : `${red.pais.ciudades} ciudades · ${red.pais.departamentos} departamentos`}</span>
          </div>
          <div className={'dta-cuadros n' + cuadros.length}>
            {cuadros.map(([n, que, extra]) => (
              <div key={que} className="dta-cuadro">
                <b className="disp num-tnum">{n}</b>
                <span>{que}</span>
                {extra ? <small>{extra}</small> : null}
              </div>
            ))}
          </div>
          {oficios.length > 0 && (
            <p className="dta-oficios">Entre los médicos: {oficios.map((o, i) => <span key={o.o}>{i ? (i === oficios.length - 1 ? ' y ' : ', ') : ''}<b className="disp num-tnum">{o.n}</b> {o.o}</span>)}.</p>
          )}
          <div className="dta-pie">
            {ciudad
              ? (ciudad.nombres.length ? <p>En todos los planes: <b className="disp">{lista(ciudad.nombres)}</b>.</p> : <p />)
              : <p>Y <b className="disp">Lister</b>, nuestro centro médico propio en Asunción.</p>}
            <a href={hrefGuia} className="disp boton dta-cta" onClick={() => track('guia_handoff', { q: '', via: ciudad ? 'red_ciudad' : 'red_pais' })}>
              {ciudad ? `Ver ${ciudad.c} en la Guía Médica` : 'Buscá tu ciudad en la Guía Médica'}
            </a>
          </div>
        </div>
      </div>

      <p className="dta-nota">Red de Silver y Gold, planilla al {fecha}. Los nombres que ves están en todos los planes; la red de Essential cambia según la zona.</p>
    </section>
  );
}
