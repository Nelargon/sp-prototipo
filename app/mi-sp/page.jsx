import MiSP from './MiSP';

export const metadata = {
  title: 'Mi SP · Salud Protegida',
  description:
    'Tu espacio como cliente de Salud Protegida: consultá tu red de atención, escribinos por WhatsApp y accedé a urgencias las 24 horas.',
  alternates: { canonical: '/mi-sp/' },
};

// El espacio del portal del cliente (decisión #11 del HANDOFF: se llama
// "Mi SP"). Hoy reúne lo que ya funciona (ver mi red, WhatsApp, urgencias)
// y reserva el lugar de lo que viene — sin fingir que existe.
export default function MiSPPage() {
  return <MiSP />;
}
