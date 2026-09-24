/* Plegable — lo que se abre crece en vez de saltar (sistema táctil, ver
   «Sistema táctil» en app/globals.css). Nació en la Guía Médica el 23/09/2026.

   El contenido está SIEMPRE en la página: cerrado, la fila de la grilla mide 0
   y el bloque queda inert (el lector de pantalla y el Tab no entran). Por eso
   el texto de una respuesta plegada igual está en el HTML estático.

   enColumna: para un plegable dentro de una columna con gap. Cerrado, le
   devuelve a la columna el gap que igual ocupa (--gap, 14px por defecto). */
export default function Plegable({ abierto, enColumna, id, children }) {
  return (
    <div id={id} className={'pleg' + (enColumna ? ' pleg-col' : '')} data-abierto={abierto ? '1' : '0'} inert={abierto ? undefined : true} aria-hidden={abierto ? undefined : true}>
      <div>{children}</div>
    </div>
  );
}
