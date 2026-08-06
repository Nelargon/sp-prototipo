import Planes from './Planes';

export const metadata = {
  title: 'Planes Bronze, Silver y Gold — buscá qué te cubre · Salud Protegida',
  description:
    'Escribí el estudio, la cirugía o el especialista que necesitás y mirá qué hace cada plan con eso. 983 respuestas salidas de la grilla oficial de coberturas, con precios vigentes.',
  alternates: { canonical: '/planes/' },
};

export default function PlanesPage() {
  return <Planes />;
}
