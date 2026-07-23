import Agendar from './Agendar';

export const metadata = {
  title: 'Agendá tu turno · Salud Protegida',
  description:
    'Pedí tu turno en el Centro Médico Lister sin vueltas ni login: elegí qué necesitás y cuándo te queda cómodo, y un asesor te confirma día y hora.',
  alternates: { canonical: '/agendar/' },
};

// Espacio directo de agendamiento (sin login). La lógica interactiva vive en
// el componente cliente Agendar.jsx; acá solo el metadata para SEO.
export default function AgendarPage() {
  return <Agendar />;
}
