import red from '../../lib/red-home.json';

/* El muro detrás de toda la home (26/09/2026, docs/diseno n.º 40 y 41).
   ----------------------------------------------------------------------------
   Arturo: «el mural se podría ver muy bien si se puede ver atrás de toda la
   página, desde el home, desde la primera sección, que traspase toda la
   página». Eligió la C (entero en las bandas navy) con las secciones claras al
   40%: el mismo muro en toda la página, y la intensidad según lo que hay que
   leer encima.
   - UN SOLO MURO. Cada sección lleva su copia, pero fija a la pantalla y
     recortada a la sección (.muro-marco: clip-path; .muro-texto: fixed): todas
     las copias ocupan el mismo lugar, así que las líneas siguen de una sección
     a la otra y la página se desliza sobre una sola pared, como el tapiz de la
     Guía Médica.
   - tono: 'oscuro' (bandas navy: blanco casi transparente), 'claro' (secciones
     claras: navy casi transparente; el «40%», que el 26/09 Arturo subió un
     poco y bajó un poco las navy, un paso de 1/255 cada uno: ver globals.css)
     o 'pleno' («Dónde te atendés»,
     donde el muro vive entero y dice lo que es: los nombres de la red).
   - Es textura: aria-hidden, sin puntero ni selección. La sección que lo lleva
     necesita la clase .con-muro (isolation) para que quede sobre su fondo y
     debajo de todo lo demás.
   Los nombres son los de lib/red-home.json: los que están en todos los planes. */

const NOMBRES = [...red.muro, ...red.muro, ...red.muro];
const TEXTO = NOMBRES.join(' · ');

export default function MuroFondo({ tono = 'claro' }) {
  return (
    <div className={'muro-marco muro-' + tono} aria-hidden="true">
      <div className="muro-texto">
        {tono === 'pleno'
          ? NOMBRES.map((n, i) => <span key={i} className={i % 6 === 2 ? 'm2' : undefined}>{n}{i < NOMBRES.length - 1 ? <i> · </i> : null}</span>)
          : TEXTO}
      </div>
    </div>
  );
}
