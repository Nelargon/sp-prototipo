import { Fragment } from 'react';
import { DUDA } from '../coverage';

/* LA FORMA CORTA (13/10/2026, regla de escaneo de Arturo; P3, opción A, que
   Arturo eligió el 17/10/2026 con «Todo A», con «¿quién?» en el hueco).
   ----------------------------------------------------------------------------
   Arturo: «Si ponemos más palabras de las que tenemos que poner, podemos restar
   claridad al cliente que escanea la información». Lo que se escanea va como la
   cifra con su unidad, separadas por barras: «1/familia/año», «20
   días/persona/año», «Gs. 350 mil/evento». Este componente la dibuja igual en
   todo el sitio:
   - la cifra y lo que sigue, en Nunito Sans (capa de cifras, no de oraciones);
   - la barra más fina, para que el ojo separe las partes sin leerla;
   - el hueco DUDA («¿quién?», coverage.js) en el mismo lugar que «familia»,
     con la misma letra, el mismo color y el mismo peso (lámina 84: la duda se
     escribe con la misma forma que el dato) y el subrayado punteado de lo que
     se explica al tocar;
   - la frase completa para los lectores de pantalla («1 por familia al año»),
     porque «uno barra familia barra año» no se entiende de oído. Va en un texto
     oculto al lado y la forma visible lleva aria-hidden: con role="img" algunos
     lectores agregan «imagen» (ajuste del comité, 13/10). La plata se lee
     «guaraníes», no «ge ese».
   - Si baja de renglón, corta ANTES de la barra: «20 días» arriba y
     «/persona/año» abajo. Ningún renglón termina en «/», la cifra no se separa
     de su unidad («20 días», «Gs. 350 mil» llevan espacio duro) y lo que va
     después de la barra no se parte.
   La barra no se usa donde ya significa otra cosa (fechas, fracciones). */

// Cómo se dice cada parte en voz alta. Lo que no está acá se lee «por …».
const LEER = { año: 'al año', mes: 'por mes', evento: 'por evento' };
// «Gs. 350 mil» → «350 mil guaraníes»; «Gs. 1,5 millones» → «1,5 millones de guaraníes».
const plata = (t) => t.replace(/^Gs\.\s*(.+)$/, (_, n) => n + (/(?:millón|millones)$/.test(n) ? ' de guaraníes' : ' guaraníes'));
export function frase(t) {
  const [cuanto, ...partes] = t.split('/');
  const dichas = partes.filter((p) => p !== DUDA).map((p) => {
    const [u, ...cola] = p.split(' ');
    return (LEER[u] || 'por ' + u) + (cola.length ? ' ' + cola.join(' ') : '');
  });
  return [plata(cuanto), ...dichas].join(' ') + (partes.includes(DUDA) ? ', sin confirmar para quién' : '');
}

// Una forma corta adentro de una línea de texto: «2 tomografías/familia/año».
// El hueco sale de la constante, no de un literal: si DUDA cambia, esto también.
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const CORTA = new RegExp('((?:Gs\\. )?\\d[\\d.,]*(?: [a-záéíóúñ]+)?(?:\\/(?:familia|persona|año|mes|evento|' + esc(DUDA) + '))+)');
// Parte un texto y dibuja cada forma corta que trae; el resto pasa por `resto`
// (por ejemplo, el glosario).
export const conCortas = (texto, resto = (x) => x) => texto.split(CORTA).map((seg, k) => (k % 2
  ? <Corta key={k} t={seg} />
  : <Fragment key={k}>{resto(seg)}</Fragment>));

// `partir`: en una columna angosta (la hoja de los once servicios, tres
// columnas en 360 px) la forma corta puede bajar de renglón, pero solo antes de
// la primera barra. `dicho`: lo que oye el lector de pantalla cuando la frase de
// siempre no alcanza («hasta 350 mil guaraníes cada vez que te internan»).
export default function Corta({ t, partir = false, dicho }) {
  const [cuanto, ...partes] = t.split('/');
  return (
    <>
      <span className={'corta' + (partir ? ' parte' : '')} aria-hidden="true">
        <span className="corta-n">{cuanto.replace(/ /g, ' ')}</span>
        {partir && <wbr />}
        <span className="corta-r">
          {partes.map((p, k) => (
            <Fragment key={k}>
              <span className="corta-b">/</span>
              {p === DUDA ? <span className="corta-duda">{p}</span> : p}
            </Fragment>
          ))}
        </span>
      </span>
      <span className="sr-solo">{dicho || frase(t)}</span>
    </>
  );
}
