'use client';

import { useEffect, useRef, useState } from 'react';

/* El comparador de planes del home (26/09/2026, docs/diseno n.º 45 a 53).
   ----------------------------------------------------------------------------
   Arturo eligió, después de cuatro rondas de muestras:
   - En la computadora, la 1.5: una tabla limpia, sin cajas ni rayado, donde
     solo Silver se levanta como tarjeta (*«se ve súper bien»*). Los nombres de
     los planes quedan fijos arriba al bajar y «Ver mi precio» va al final.
   - En el celular, la 4.1: las tarjetas de los planes una debajo de la otra,
     sin pestañas (*«usualmente es así como se ven las versiones móviles de las
     páginas web más icónicas»*), con los titulillos de banda de color.
   - En las dos, la tarjeta del servicio: la letra chica (unidades, notas y la
     leyenda de colores) salió de la tabla y aparece al pasar el mouse o tocar
     el nombre del servicio, con lo que da cada uno de los tres planes. Arturo:
     *«así ahorramos exceso de información, ahorramos espacio»*.
   Una sola estructura para los dos: cada plan es una columna en la
   computadora y una tarjeta en el celular. La columna de nombres solo existe
   en la computadora; en el celular cada tarjeta trae sus propios nombres.

   ⚠ «por familia» queda a la vista (no va a la tarjeta): cambia la
   comparación. 5 sesiones por familia contra 15 por persona no es el triple,
   es más (docs/diseno, lección 51).

   La tarjeta se comporta como el glosario (app/glossary.jsx): con mouse se
   abre al pasar; con el dedo, al tocar; con teclado, al enfocar. Escape o un
   toque afuera la cierran. Una sola abierta a la vez. */

function Servicio({ fila, planes, id, abierta, abrir, cerrar }) {
  const puntero = useRef('mouse');
  return (
    <span className="cmp2-srv-wrap">
      <button
        type="button"
        className="cmp2-srv txt"
        aria-expanded={abierta}
        aria-controls={abierta ? id : undefined}
        onPointerDown={(e) => { puntero.current = e.pointerType || 'mouse'; }}
        onClick={(e) => { e.stopPropagation(); if (puntero.current !== 'mouse') (abierta ? cerrar() : abrir()); }}
        onPointerEnter={(e) => { if ((e.pointerType || 'mouse') === 'mouse') abrir(); }}
        onPointerLeave={(e) => { if ((e.pointerType || 'mouse') === 'mouse') cerrar(); }}
        onFocus={(e) => { if (e.target.matches?.(':focus-visible')) abrir(); }}
        onBlur={cerrar}
      >
        {fila.name}
      </button>
      {abierta && (
        <span id={id} role="note" className="cmp2-tarjeta">
          <b className="cmp2-tarjeta-t disp">{fila.name}</b>
          {planes.map((p, i) => (
            <span key={p.short} className={'cmp2-tarjeta-p' + (p.recommended ? ' rec' : '')}>
              <b className="disp">{p.short}</b>
              <span>{fila.d[i]}</span>
            </span>
          ))}
          {fila.pie && <span className="cmp2-tarjeta-pie">{fila.pie}</span>}
        </span>
      )}
    </span>
  );
}

const valor = (fila, c) => (
  <>
    {fila.kind === 'status' ? <span className="cmp2-chip disp">{c.t}</span> : <span className="cmp2-val disp num-tnum">{c.t}</span>}
    {c.n === 'por familia' && <span className="cmp2-fam">por familia</span>}
  </>
);

export default function Comparador({ planes, filas }) {
  const [abierta, setAbierta] = useState(null);
  useEffect(() => {
    if (abierta === null) return;
    const tecla = (e) => { if (e.key === 'Escape') setAbierta(null); };
    const afuera = (e) => { if (!e.target.closest?.('.cmp2-srv-wrap')) setAbierta(null); };
    document.addEventListener('keydown', tecla);
    document.addEventListener('pointerdown', afuera);
    return () => { document.removeEventListener('keydown', tecla); document.removeEventListener('pointerdown', afuera); };
  }, [abierta]);
  const srv = (k, donde) => (
    <Servicio
      fila={filas[k]} planes={planes} id={'cmp2-t-' + donde + '-' + k}
      abierta={abierta === donde + '-' + k}
      abrir={() => setAbierta(donde + '-' + k)}
      cerrar={() => setAbierta((a) => (a === donde + '-' + k ? null : a))}
    />
  );

  return (
    <div id="cartilla" data-rv className="cmp2">
      {/* La columna de nombres: solo en la computadora. */}
      <div className="cmp2-lab">
        <div className="cmp2-h"><span className="cmp2-hint">Pasá el mouse o tocá un servicio para ver el detalle de los tres planes.</span></div>
        {filas.map((f, k) => (
          <div key={f.name} className="cmp2-grupo-y-fila">
            {f.g && <div className="cmp2-gt disp">{f.g}</div>}
            <div className={'cmp2-c' + (abierta === 'c-' + k ? ' sobre' : '')}>{srv(k, 'c')}</div>
          </div>
        ))}
        <div className="cmp2-pie" />
      </div>

      {planes.map((p, i) => (
        <div key={p.short} className={'cmp2-plan' + (p.recommended ? ' rec' : '')} style={{ '--c': p.color }}>
          <div className="cmp2-h">
            <span className="cmp2-tag disp">{p.recommended ? 'La más elegida' : ''}</span>
            <b className="cmp2-nombre disp">{p.short}</b>
            <span className="cmp2-precio">desde <b className="num-tnum">{p.price}</b><span className="cmp2-mes"> por mes</span></span>
            <span className="cmp2-para">{p.forWhom}</span>
          </div>
          {filas.map((f, k) => (
            <div key={f.name} className="cmp2-grupo-y-fila">
              {f.g && <div className="cmp2-gt disp"><span>{f.g}</span></div>}
              <div className={'cmp2-c' + (abierta === i + '-' + k ? ' sobre' : '')}>
                {/* En el celular cada tarjeta nombra sus filas. */}
                <span className="cmp2-l">{srv(k, String(i))}</span>
                <span className="cmp2-v">{valor(f, f.cells[i])}</span>
              </div>
            </div>
          ))}
          <div className="cmp2-pie">
            <a href={p.href} onClick={p.onCta} className="cmp2-cta disp">Ver mi precio</a>
          </div>
        </div>
      ))}
    </div>
  );
}
