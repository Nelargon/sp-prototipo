import { DIBUJOS, MANCHA } from './iconos-sp';

/* IconoSP — los íconos propios de SP (24/09/2026). Trazo a mano, blanco, sobre
   su mancha turquesa, en todos los fondos del sitio (A3). Es el único
   tratamiento que funcionó en los cuatro fondos porque trae su propia base
   (docs/diseno, lección 10), y el que eligió Arturo: *«no era que íbamos a
   seleccionar todo A3?»*, y del trazo, *«Hay algo humano y auténtico en eso»*
   (lección 16).

   El trazo va repasado, apenas corrido, como un lápiz que pasó dos veces: es
   lo que hace que se lea «lo hizo una persona» aunque el dibujo sea chico.

   Solo va donde un ícono hace algo que el texto solo no hace (lección 7): en
   un botón que ya dice «Guía Médica», no. Siempre acompaña a un texto, así que
   el lector de pantalla no lo anuncia. Los dibujos están en ./iconos-sp.js;
   las portadas del blog los usan con su propia base (app/blog/Cover.jsx). */
export default function IconoSP({ nombre, size = 48, style }) {
  const trazos = DIBUJOS[nombre];
  if (!trazos) return null;
  const paths = trazos.map((d) => <path key={d} d={d} />);
  const linea = { fill: 'none', stroke: '#fff', strokeLinecap: 'round', strokeLinejoin: 'round' };
  // Al achicarse, el trazo engorda en el dibujo para seguir leyéndose: a 48 px
  // va a 2,8; a 24 px, a 3,2.
  const ancho = Math.max(2.8, 76 / size);
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false" style={{ display: 'block', flex: 'none', overflow: 'visible', ...style }}>
      <path d={MANCHA} fill="#007d77" />
      <g transform="translate(24 24.5) scale(.66) translate(-24 -24)">
        <g opacity=".45" transform="translate(1.1 .9) rotate(.8 24 24)" {...linea} strokeWidth={+(ancho * 0.78).toFixed(2)}>{paths}</g>
        <g {...linea} strokeWidth={+ancho.toFixed(2)}>{paths}</g>
      </g>
    </svg>
  );
}
