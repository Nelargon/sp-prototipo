import { BP } from '../basePath';

/* /que-cubre ya no es una página: es la dirección vieja de /planes/ (3 oct
   2026). Arturo: «el espacio de "¿Qué cubre?" realmente debería no existir.
   Debería ser solamente un espacio donde se detallan los planes». La dirección
   se conserva a propósito: circula por WhatsApp, anuncios y buscadores, y un
   link roto en una empresa que vende confianza es lo que no se puede permitir.

   El sitio es un export estático (sin servidor que responda un 301), así que
   el redirect es el que se puede hacer en GitHub Pages: meta refresh, más un
   `location.replace` por si el navegador lo ignora, más un link visible. El
   canonical apunta a /planes/ para que los buscadores le pasen la autoridad.

   El buscador de estudios que vivía acá está guardado en
   app/que-cubre/Buscador.jsx, sin página. Ver HANDOFF. */
const DESTINO = `${BP}/planes/`;

export const metadata = {
  title: 'Planes Essential, Silver y Gold · Salud Protegida',
  alternates: { canonical: '/planes/' },
  robots: { index: false, follow: true },
};

export default function QueCubreRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${DESTINO}`} />
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace(${JSON.stringify(DESTINO)})` }} />
      <p style={{ fontFamily: 'sans-serif', padding: '40vh 24px 0', textAlign: 'center' }}>
        Esta página se mudó. <a href={DESTINO}>Ver los planes en detalle</a>.
      </p>
    </>
  );
}
