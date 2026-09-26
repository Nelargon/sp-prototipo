'use client';

import { BP } from '../basePath';
import { track } from '../track';
import { GUIA_HREF } from '../edicion';
import red from '../../lib/red-home.json';
import MuroFondo from './MuroFondo';

/* «Dónde te atendés» — la red médica en el home (25/09/2026).
   ----------------------------------------------------------------------------
   Reemplaza a la tira de prestadores en movimiento. Arturo: «¿qué pasa si, en
   vez de que sea una tira dinámica, algo que se ve muchísimo, no es algo más
   original?» (BITACORA cap. 115). Eligió, de cinco versiones, la que junta tres
   (docs/diseno n.º 33 a 35, opción 1 del home):
   - El DESGLOSE en lugar del total: «ese número grande, 615, a veces se puede
     comparar con otras prepagas… que tienen un número mayor». Un total se
     compara con otro total; cuatro cuadros dicen de qué está hecha la red.
   - El MURO de fondo: desde el 26/09 es la red entera de Silver y Gold, con los
     más destacados primero (decisión de Arturo), en gris muy claro y sin velo,
     para que la tarjeta resalte sola. La nota de abajo dice de qué red son. Es
     textura: aria-hidden, sin puntero y sin selección.
     Desde el 26/09 es el mismo muro de toda la home (components/MuroFondo.jsx),
     acá en tono «pleno»: la página se desliza sobre una sola pared y esta es
     la sección donde se ve entera.
   ⚠ MÁS CORTA DESDE EL 26/09/2026 (Arturo, mirándola en el celular: «es
   excesivamente larga. No hace falta poner dónde uno vive, no hace falta
   ponerlo de Lister, no hace falta poner los detalles de cuántos ginecólogos…
   al final la persona se puede ir a la guía médica»). Salieron «¿Dónde vivís?»
   con sus ocho ciudades, el panel por ciudad, «Entre los médicos: 53
   ginecólogos…» y la línea de Lister. Queda el desglose del país y una sola
   salida: la Guía Médica, que responde la pregunta de la ciudad mejor que ocho
   botones. Ver BITACORA cap. 122.
   Los datos salen de lib/red-home.json, que scripts/red-home.mjs arma
   de la planilla antes de cada build. Ninguna cifra está escrita a mano. */

const GUIA = `${BP}${GUIA_HREF}`;
const fecha = (red.datos_al || '').split('-').reverse().join('/');
const plural = (n, uno, varios) => (n === 1 ? uno : varios);

export default function DondeTeAtendes() {
  const d = red.pais;
  const cuadros = [
    [d.sanatorios, plural(d.sanatorios, 'sanatorio o clínica', 'sanatorios y clínicas')],
    [d.laboratorios, plural(d.laboratorios, 'laboratorio', 'laboratorios')],
    [d.medicos, plural(d.medicos, 'médico', 'médicos'), `de ${d.especialidades} especialidades`],
    [d.imagenes, plural(d.imagenes, 'centro de diagnóstico por imagen', 'centros de diagnóstico por imagen')],
  ].filter(([n]) => n > 0);

  return (
    <section className="dta con-muro" aria-labelledby="dta-titulo">
      <MuroFondo tono="pleno" />

      <div className="dta-tarjeta">
        <h2 id="dta-titulo" className="disp dta-titulo">Dónde te <span>atendés</span>.</h2>
        <p className="dta-bajada">Sanatorios, laboratorios y médicos en {d.ciudades} ciudades del país.</p>

        <div className={'dta-cuadros n' + cuadros.length}>
          {cuadros.map(([n, que, extra]) => (
            <div key={que} className="dta-cuadro">
              <b className="disp num-tnum">{n}</b>
              <span>{que}</span>
              {extra ? <small>{extra}</small> : null}
            </div>
          ))}
        </div>

        <a href={GUIA} className="disp boton dta-cta" onClick={() => track('guia_handoff', { q: '', via: 'red_pais' })}>Buscá tu ciudad en la Guía Médica</a>
      </div>

      <p className="dta-nota">Las cifras y los nombres del fondo son de la red de Silver y Gold, según la planilla al {fecha}. La red de Essential cambia según la zona: buscala en la Guía Médica.</p>
    </section>
  );
}
