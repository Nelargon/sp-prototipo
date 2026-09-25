import { CON_REVISION, REVISION_URL } from '../edicion';

/* Botón «Revisión» (uso interno, 25/09/2026). Abre en otra pestaña la sala de
   revisión (claude.ai, por invitación): los pendientes del sitio, que son los
   issues de sp-interno con la etiqueta «revisión», más un chat con Claude y un
   buzón de propuestas. La lista no se copia en este sitio: es público y los
   puntos son privados. El Guardián la barre cada mañana
   (sp-interno/salud/GUARDIAN.md). Borde punteado y gris: se lee como
   herramienta de trabajo, no como parte de la oferta.
   Dos lugares: junto al logo en escritorio (`nav`) y al final del menú en el
   celular (`menu`). En el celular no entra en la barra: empujaba el botón del
   menú fuera de la pantalla (medido a 360 y 430 px). */
export default function BotonRevision({ donde = 'nav', onClick }) {
  if (!CON_REVISION) return null;
  return (
    <a href={REVISION_URL} target="_blank" rel="noopener" onClick={onClick} className={'revision-btn sq revision-' + donde} title="Puntos de revisión del sitio (uso interno)">
      Revisión
    </a>
  );
}
