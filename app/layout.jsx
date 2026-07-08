import './globals.css';
import { gilroy } from './fonts';
import { BP } from './basePath';

export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://saludprotegida.com.py'),
  title: 'Salud Protegida — Planes de seguro médico familiar en Paraguay',
  description:
    'Encontrá el plan de seguro médico ideal para tu familia. Cotizá en un minuto, mirá exactamente qué cubre cada plan y hablá con un asesor por WhatsApp.',
  icons: { icon: `${BP}/assets/favicon.png` },
  openGraph: {
    type: 'website',
    title: 'Salud Protegida — Protección que se siente',
    description:
      'Cotizá tu plan de salud en un minuto. Cobertura clara, sin sorpresas de último momento.',
    images: [`${BP}/assets/hero.webp`],
    locale: 'es_PY',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={gilroy.variable}>
      <body>{children}</body>
    </html>
  );
}
