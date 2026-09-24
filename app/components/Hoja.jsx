'use client';

import { useEffect, useRef } from 'react';
import { css } from '../css';

/* Hoja — lo que se elige de una lista larga sube desde abajo (sistema táctil,
   ver «Sistema táctil» en app/globals.css). Nació en la Guía Médica el
   23/09/2026, para especialidad y plan: «esto es temporal, volvés a donde
   estabas». Solo para listas largas; no es un modal para cualquier cosa.

   Fondo oscurecido, asa, «×», Escape o tocar afuera la cierran, y bloquea el
   scroll de atrás. Cerrada queda inert.

   Se cierra también deslizándola hacia abajo (24/09/2026), el gesto que
   cualquiera espera de una hoja así. Se arrastra desde el asa y el título, no
   desde la lista: la lista tiene su propio scroll y los dos gestos se
   pelearían. La hoja sigue al dedo y el fondo se aclara con ella; al soltar se
   cierra si bajó más de un cuarto de su alto o si el movimiento fue rápido, y
   si no vuelve a su lugar. El teclado y el lector de pantalla no cambian:
   Escape y la «×». */
const X = <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>;

// Cuánto tiene que bajar para cerrarse (fracción del alto) y qué velocidad
// cuenta como un movimiento rápido (px por milisegundo, con un mínimo de 24px
// para que un temblor al tocar no la cierre).
const UMBRAL = 0.25;
const RAPIDO = 0.5;

export default function Hoja({ abierta, titulo, onCerrar, children }) {
  const panel = useRef(null);
  const fondo = useRef(null);
  const arrastre = useRef(null);
  const cerrar = useRef(onCerrar);
  cerrar.current = onCerrar;
  useEffect(() => {
    if (!abierta) {
      // Cerrada, el CSS la manda abajo: se sueltan los estilos del arrastre
      // (la hoja ya está donde el CSS la quiere, no hay salto).
      if (panel.current) { panel.current.style.transform = ''; panel.current.style.transition = ''; }
      if (fondo.current) { fondo.current.style.opacity = ''; fondo.current.style.transition = ''; }
      return undefined;
    }
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => panel.current && panel.current.focus(), 60);
    const esc = (e) => { if (e.key === 'Escape') cerrar.current(); };
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = antes; clearTimeout(t); window.removeEventListener('keydown', esc); };
  }, [abierta]);

  const empezar = (e) => {
    // La «×» se toca, no se arrastra.
    if (!abierta || e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
    arrastre.current = { id: e.pointerId, y0: e.clientY, t0: performance.now(), dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    panel.current.style.transition = 'none';
    fondo.current.style.transition = 'none';
  };
  const mover = (e) => {
    const a = arrastre.current;
    if (!a || e.pointerId !== a.id) return;
    a.dy = Math.max(0, e.clientY - a.y0); // hacia arriba no se mueve
    panel.current.style.transform = 'translateY(' + a.dy + 'px)';
    fondo.current.style.opacity = String(Math.max(0, 1 - a.dy / panel.current.offsetHeight));
  };
  const soltar = (e) => {
    const a = arrastre.current;
    if (!a || e.pointerId !== a.id) return;
    arrastre.current = null;
    const vel = a.dy / Math.max(1, performance.now() - a.t0);
    const seCierra = a.dy > panel.current.offsetHeight * UMBRAL || (vel > RAPIDO && a.dy > 24);
    panel.current.style.transition = '';
    fondo.current.style.transition = '';
    if (seCierra) {
      // Termina de bajar desde donde la dejó el dedo, no desde arriba.
      panel.current.style.transform = 'translateY(104%)';
      fondo.current.style.opacity = '0';
      cerrar.current();
    } else {
      panel.current.style.transform = '';
      fondo.current.style.opacity = '';
    }
  };

  return (
    <div className="hoja" data-abierta={abierta ? '1' : '0'} inert={abierta ? undefined : true} aria-hidden={abierta ? undefined : true}>
      <div ref={fondo} className="hoja-fondo" onClick={() => cerrar.current()} />
      <div ref={panel} role="dialog" aria-modal="true" aria-label={titulo} tabIndex={-1} className="hoja-panel">
        <div className="hoja-tirador" onPointerDown={empezar} onPointerMove={mover} onPointerUp={soltar} onPointerCancel={soltar}>
          <div className="hoja-asa" aria-hidden="true" />
          <div style={css('display:flex;justify-content:space-between;align-items:center;padding:6px 16px 10px')}>
            <h2 className="disp" style={css('margin:0;font-size:19px;font-weight:900;color:var(--sp-navy)')}>{titulo}</h2>
            <button type="button" onClick={() => cerrar.current()} aria-label="Cerrar" style={css('width:36px;height:36px;border-radius:var(--r-pill);border:none;background:var(--toque-gris);color:var(--sp-text-2);display:flex;align-items:center;justify-content:center;cursor:pointer')}>{X}</button>
          </div>
        </div>
        <div className="hoja-cuerpo">{children}</div>
      </div>
    </div>
  );
}
