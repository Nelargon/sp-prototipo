import { css } from '../css';
import { CON_MARCA_REVISAR } from '../edicion';

// Marca INTERNA (pedido de Arturo, 23/09/2026): la fila está en "Revisar" en
// la planilla — un teléfono, una dirección o un nombre que no coincide entre
// dos guías. Se publica igual que en el PDF; el punto naranja es para que el
// equipo la vea. Solo en el prototipo: la v1 que copia Buenavista no lo
// muestra (CON_MARCA_REVISAR en app/edicion.js). Naranja y no dorado ni rojo:
// esos colores ya tienen significado de cara al cliente.
export default function PuntoRevisar() {
  if (!CON_MARCA_REVISAR) return null;
  return <span title="Revisar (marca interna): hay un dato para confirmar en la planilla" aria-label="Dato a revisar, marca interna" style={css('display:inline-block;width:10px;height:10px;border-radius:var(--r-pill);background:#F28C28;flex:none;margin-left:8px;vertical-align:middle')} />;
}
