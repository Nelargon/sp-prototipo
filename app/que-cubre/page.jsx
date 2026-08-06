import Landing from './Landing';

/* Ruta propia, decidida por el usuario (6 ago 2026): "que sea un espacio
   aparte". El slug sale de la regla de lenguaje del CLAUDE.md — "qué cubre" es
   la forma aprobada de decir lo que el rubro llama "cartilla", y es además lo
   que una familia escribe en un buscador ("qué cubre mi plan de salud").
   No se usa "privilege" en la URL: es nombre interno (HANDOFF dec. 11o). */
export const metadata = {
  title: '¿Y esto, me lo cubre? — Bronze, Silver y Gold · Salud Protegida',
  description:
    'Escribí el estudio, la cirugía o el especialista que necesitás y mirá qué hace cada plan con eso: 935 estudios y 43 especialidades de la grilla oficial de coberturas, con los precios vigentes.',
  alternates: { canonical: '/que-cubre/' },
};

export default function QueCubrePage() {
  return <Landing />;
}
