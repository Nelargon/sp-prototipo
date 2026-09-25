import Planes from './Planes';

export const metadata = {
  title: 'Planes Essential, Silver y Gold — todo el detalle · Salud Protegida',
  description:
    'Compará los planes de Salud Protegida servicio por servicio: qué cubre Essential, Silver y Gold, y cuánto sale cada uno. Precios de lista vigentes.',
  alternates: { canonical: '/planes/' },
};

export default function PlanesPage() {
  return <Planes />;
}
