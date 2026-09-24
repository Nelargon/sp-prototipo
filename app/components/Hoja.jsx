'use client';

import { useEffect, useRef } from 'react';
import { css } from '../css';

/* Hoja — lo que se elige de una lista larga sube desde abajo (sistema táctil,
   ver «Sistema táctil» en app/globals.css). Nació en la Guía Médica el
   23/09/2026, para especialidad y plan: «esto es temporal, volvés a donde
   estabas». Solo para listas largas; no es un modal para cualquier cosa.

   Fondo oscurecido, asa, «×», Escape o tocar afuera la cierran, y bloquea el
   scroll de atrás. Cerrada queda inert. Todavía no se arrastra con el dedo. */
const X = <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>;

export default function Hoja({ abierta, titulo, onCerrar, children }) {
  const panel = useRef(null);
  const cerrar = useRef(onCerrar);
  cerrar.current = onCerrar;
  useEffect(() => {
    if (!abierta) return undefined;
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => panel.current && panel.current.focus(), 60);
    const esc = (e) => { if (e.key === 'Escape') cerrar.current(); };
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = antes; clearTimeout(t); window.removeEventListener('keydown', esc); };
  }, [abierta]);
  return (
    <div className="hoja" data-abierta={abierta ? '1' : '0'} inert={abierta ? undefined : true} aria-hidden={abierta ? undefined : true}>
      <div className="hoja-fondo" onClick={() => cerrar.current()} />
      <div ref={panel} role="dialog" aria-modal="true" aria-label={titulo} tabIndex={-1} className="hoja-panel">
        <div className="hoja-asa" aria-hidden="true" />
        <div style={css('display:flex;justify-content:space-between;align-items:center;padding:6px 16px 10px')}>
          <h2 className="disp" style={css('margin:0;font-size:19px;font-weight:900;color:var(--sp-navy)')}>{titulo}</h2>
          <button type="button" onClick={() => cerrar.current()} aria-label="Cerrar" style={css('width:36px;height:36px;border-radius:var(--r-pill);border:none;background:var(--toque-gris);color:var(--sp-text-2);display:flex;align-items:center;justify-content:center;cursor:pointer')}>{X}</button>
        </div>
        <div className="hoja-cuerpo">{children}</div>
      </div>
    </div>
  );
}
