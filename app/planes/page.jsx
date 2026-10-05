import Planes from './Planes';

export const metadata = {
  title: 'Planes Essential, Silver y Gold, plan por plan · Salud Protegida',
  description:
    'Qué trae cada plan de Salud Protegida, cuánto sale y lo que no cubre: Essential, Silver y Gold servicio por servicio, con los topes y los tiempos de espera. Precios de lista vigentes.',
  alternates: { canonical: '/planes/' },
};

export default function PlanesPage() {
  return <Planes />;
}
