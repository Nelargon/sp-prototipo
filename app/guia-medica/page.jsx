import GuiaMedica from './GuiaMedica';

/* La Guía Médica real (23 sep 2026). Reemplaza, en las dos ediciones, al molde
   de guia/ — que era una maqueta con datos ilustrativos. Los datos salen de la
   planilla maestra de SP (ver scripts/build-guia-medica.py). Es interina: el
   destino es leer la red del sistema de SP, sin cambiar esta pantalla. */
export const metadata = {
  title: 'Guía Médica — encontrá tu médico en la red · Salud Protegida',
  description:
    'Buscá médicos, sanatorios y laboratorios de la red de Salud Protegida por especialidad, ciudad y plan. Con dirección y teléfono para pedir tu turno.',
  alternates: { canonical: '/guia-medica/' },
};

export default function GuiaMedicaPage() {
  return <GuiaMedica />;
}
