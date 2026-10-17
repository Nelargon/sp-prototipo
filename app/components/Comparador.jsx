'use client';

import { useEffect, useRef, useState } from 'react';
import { trackExplicacion } from '../track';
import Corta from './Corta';
import { DUDA } from '../coverage';

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
   comparación. 5 sesiones por familia contra 15 no es el triple: si las 15
   fueran para cada persona, sería más (docs/diseno, lección 51). Si lo son,
   lo tiene que confirmar SP (sp-interno#110).

   LA FORMA CORTA EN LA CELDA (P3, opción A: regla de escaneo de Arturo del
   13/10/2026, elegida el 17/10 con «Todo A»). Una celda con barras
   («1/familia/año», «Gs. 350 mil/evento») se dibuja con Corta: la cifra, para
   quién y cada cuánto, con la frase completa para los lectores de pantalla
   (la celda puede traer la suya en `dicho`). Donde la fuente no dice para
   quién (Silver y Gold en tomografía, resonancia, psicología y fisioterapia,
   sp-interno#110), el lugar de «familia» dice DUDA («¿quién?», coverage.js),
   con la misma letra, el mismo color y el mismo peso. Esa celda, y la que
   manda al asesor (`asesor`: la fisioterapia de Gold, sp-interno#50, o los
   remedios en urgencias de Essential), es un botón que abre la misma tarjeta
   que el nombre del servicio, donde el pie lo explica en oraciones. Se abre
   con un clic, un toque o el teclado, NO al pasar el mouse: al cruzar la
   tabla se abrían tarjetas sin querer, lejos del puntero (ajuste 4 del
   comité del 13/10). Pasar el mouse queda para el nombre, como dice la ayuda
   de la tabla. Se mide aparte (`duda`), para saber cuánta gente se frena ahí.

   La tarjeta se comporta como el glosario (app/glossary.jsx): con mouse se
   abre al pasar; con el dedo, al tocar; con teclado, al enfocar. Escape o un
   toque afuera la cierran. Una sola abierta a la vez.

   TAMBIÉN ES LA TABLA DE /planes EN LA COMPUTADORA (07/10/2026, lámina 81, la A
   que eligió Arturo: «una mejor línea»). Una sola manera de comparar en todo el
   sitio. Lo que /planes suma, sin cambiar el home:
   - `notas`: muestra la nota de cada celda («en Lister», «la mayoría»), no solo
     «por familia»;
   - una celda con `apagado` va en gris («No entra»: ausencia neutra, nunca rojo
     ni dorado);
   - una fila sin `d` no abre tarjeta (las esperas: el número ya es el dato);
   - `zona` en un plan dice debajo del precio que cambia según la zona;
   - `id`, para que /planes no repita el ancla #cartilla del home. */

function Servicio({ fila, planes, id, abierta, abrir, cerrar }) {
  const puntero = useRef('mouse');
  if (!fila.d) return <span className="cmp2-srv-sin">{fila.name}</span>;
  return (
    <span className="cmp2-srv-wrap">
      <button
        type="button"
        className="cmp2-srv txt"
        aria-expanded={abierta}
        aria-controls={abierta ? id : undefined}
        onPointerDown={(e) => { puntero.current = e.pointerType || 'mouse'; }}
        // Con mouse, el clic solo abre (el hover ya la abrió o la cierra al
        // salir): si el hover no llegó, un clic igual la muestra. Con el dedo,
        // el toque abre y cierra.
        onClick={(e) => { e.stopPropagation(); if (puntero.current === 'mouse') abrir(); else (abierta ? cerrar() : abrir()); }}
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

// Una celda con barras es una forma corta.
const texto = (c) => (c.t.includes('/') ? <Corta t={c.t} dicho={c.dicho} /> : c.t);
const valor = (fila, c, notas) => (
  <>
    {fila.kind === 'status' ? <span className="cmp2-chip disp">{texto(c)}</span> : <span className={'cmp2-val disp num-tnum' + (c.apagado ? ' apagado' : '')}>{texto(c)}</span>}
    {(c.n === 'por familia' || (notas && c.n)) && <span className="cmp2-fam">{c.n}</span>}
  </>
);

// La celda con el hueco o que manda al asesor: se toca como el nombre del
// servicio y abre su tarjeta (la de la fila: en la computadora vive en la
// columna de nombres). Clic, toque o teclado; sin hover (ver arriba).
function Duda({ abierta, controla, abrir, cerrar, children }) {
  return (
    <button
      type="button"
      className="cmp2-duda"
      aria-expanded={abierta}
      aria-controls={abierta ? controla : undefined}
      onClick={(e) => { e.stopPropagation(); if (abierta) cerrar(); else abrir(); }}
      onFocus={(e) => { if (e.target.matches?.(':focus-visible')) abrir(); }}
      onBlur={cerrar}
    >
      {children}
    </button>
  );
}

export default function Comparador({ planes, filas, notas = false, id = 'cartilla' }) {
  const [abierta, setAbierta] = useState(null);
  useEffect(() => {
    if (abierta === null) return;
    const tecla = (e) => { if (e.key === 'Escape') setAbierta(null); };
    const afuera = (e) => { if (!e.target.closest?.('.cmp2-srv-wrap, .cmp2-duda')) setAbierta(null); };
    document.addEventListener('keydown', tecla);
    document.addEventListener('pointerdown', afuera);
    return () => { document.removeEventListener('keydown', tecla); document.removeEventListener('pointerdown', afuera); };
  }, [abierta]);
  const srv = (k, donde) => (
    <Servicio
      fila={filas[k]} planes={planes} id={'cmp2-t-' + donde + '-' + k}
      abierta={abierta === donde + '-' + k}
      // Cuántas personas abren la tarjeta de cada servicio (sp-interno#98).
      abrir={() => { setAbierta(donde + '-' + k); trackExplicacion('servicio', filas[k].name); }}
      cerrar={() => setAbierta((a) => (a === donde + '-' + k ? null : a))}
    />
  );
  // La tarjeta que abre una celda con «¿quién?» o «Preguntale a tu asesor»: la
  // de la fila en la columna de nombres (computadora) o la de la tarjeta del
  // plan (celular).
  const dondeDuda = (i) => (typeof window !== 'undefined' && window.matchMedia('(min-width: 820px)').matches ? 'c' : String(i));
  const celda = (f, i, k) => {
    const v = valor(f, f.cells[i], notas);
    const c = f.cells[i];
    if (!f.d || !(c.asesor || c.t.includes('/' + DUDA + '/'))) return v;
    const aqui = abierta === 'c-' + k || abierta === i + '-' + k;
    return (
      <Duda
        abierta={aqui} controla={'cmp2-t-' + abierta}
        abrir={() => { const d = dondeDuda(i); setAbierta(d + '-' + k); trackExplicacion('duda', f.name); }}
        cerrar={() => setAbierta((a) => (a === 'c-' + k || a === i + '-' + k ? null : a))}
      >
        {v}
      </Duda>
    );
  };

  return (
    <div id={id} data-rv className="cmp2">
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
            {/* «La más elegida» salió el 13/10/2026 (decisión 2A de Arturo,
                sp-interno#52): no hay un dato de ventas confirmado por
                Comercial. El renglón queda vacío en los tres planes para que
                las cabeceras sigan alineadas; Silver sigue resaltado. */}
            <span className="cmp2-tag disp" />
            <b className="cmp2-nombre disp">{p.short}</b>
            <span className="cmp2-precio">desde <b className="num-tnum">{p.price}</b><span className="cmp2-mes"> por mes</span></span>
            {p.zona && <span className="cmp2-zona">{p.zona}</span>}
            <span className="cmp2-para">{p.forWhom}</span>
          </div>
          {filas.map((f, k) => (
            <div key={f.name} className="cmp2-grupo-y-fila">
              {f.g && <div className="cmp2-gt disp"><span>{f.g}</span></div>}
              <div className={'cmp2-c' + (abierta === i + '-' + k ? ' sobre' : '')}>
                {/* En el celular cada tarjeta nombra sus filas. */}
                <span className="cmp2-l">{srv(k, String(i))}</span>
                <span className="cmp2-v">{celda(f, i, k)}</span>
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
