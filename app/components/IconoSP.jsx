import { DIBUJOS, MANCHA } from './iconos-sp';

/* IconoSP — los íconos propios de SP (24/09/2026). Trazo a mano siempre; el
   color lo decide el fondo, no el ícono (Arturo: «La combinación de colores
   depende del fondo; debemos elegir la aplicación correcta según el color de
   fondo»). Medido en la prueba de fondos (docs/diseno, lección 10):

   - fondo="claro" (blanco, gris de la guía, menta): trazo azul sin base, con
     el trazo repasado apenas corrido (A2). Sobre azul desaparece (1,3 a 1).
   - fondo="azul": trazo blanco sobre su mancha turquesa (A3), el único trazo a
     mano que funciona en los cuatro fondos porque trae su propia base.

   Solo va donde un ícono hace algo que el texto solo no hace (lección 7): en
   un botón que ya dice «Guía Médica», no. Siempre acompaña a un texto, así que
   el lector de pantalla no lo anuncia. Los dibujos están en ./iconos-sp.js. */
export default function IconoSP({ nombre, fondo = 'claro', size = 48, style }) {
  const trazos = DIBUJOS[nombre];
  if (!trazos) return null;
  const caja = { viewBox: '0 0 48 48', width: size, height: size, 'aria-hidden': true, focusable: 'false', style: { display: 'block', flex: 'none', overflow: 'visible', ...style } };
  const linea = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = trazos.map((d) => <path key={d} d={d} />);

  if (fondo === 'azul') {
    return (
      <svg {...caja}>
        <path d={MANCHA} fill="#007d77" />
        <g transform="translate(24 24.5) scale(.66) translate(-24 -24)" {...linea} stroke="#fff" strokeWidth="3.2">{paths}</g>
      </svg>
    );
  }

  // Al achicarse, el trazo engorda en el dibujo para no bajar de ~1,3 px en
  // pantalla: a 48 px va a 1,7; a 24 px, a 2,6.
  const ancho = Math.max(1.7, 62 / size);
  return (
    <svg {...caja}>
      <g opacity=".4" transform="translate(.8 .6) rotate(.8 24 24)" {...linea} stroke="#003B71" strokeWidth={+(ancho * 0.82).toFixed(2)}>{paths}</g>
      <g {...linea} stroke="#003B71" strokeWidth={+ancho.toFixed(2)}>{paths}</g>
    </svg>
  );
}
