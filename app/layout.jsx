import './globals.css';
import { display, inter } from './fonts';
import { BP } from './basePath';

// Mientras el ecosistema sea prototipo, NO se indexa (defensa principal en
// GitHub Pages, donde robots.txt no puede vivir en la raíz del dominio).
// Se enciende con NEXT_PUBLIC_INDEXABLE=true + SITE_URL al decidir dominio.
const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === 'true';

export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://saludprotegida.com.py'),
  title: 'Salud Protegida — Planes de seguro médico familiar en Paraguay',
  description:
    'Encontrá el plan de seguro médico ideal para tu familia. Cotizá en un minuto, mirá exactamente qué cubre cada plan y hablá con un asesor por WhatsApp.',
  icons: { icon: `${BP}/assets/favicon.png` },
  alternates: { canonical: '/' },
  robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: 'website',
    title: 'Salud Protegida — Protección que se siente',
    description:
      'Simulá tu plan de salud en un minuto. Cobertura clara, sin sorpresas de último momento.',
    images: [`${BP}/assets/hero.webp`],
    locale: 'es_PY',
  },
  twitter: { card: 'summary_large_image' },
};

// Datos reales confirmados por el usuario (jul 2026): teléfono, sedes, email.
const ORG_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'InsuranceAgency',
  name: 'Salud Protegida',
  legalName: 'Odontomedica S.A.',
  url: process.env.SITE_URL || 'https://saludprotegida.com.py',
  logo: (process.env.SITE_URL || 'https://saludprotegida.com.py') + `${BP}/assets/brand/logo-sp-color.png`,
  telephone: '+595213190000',
  email: 'hola@saludprotegida.com.py',
  areaServed: { '@type': 'Country', name: 'Paraguay' },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Perú 222 esq. Eligio Ayala',
    addressLocality: 'Asunción',
    addressCountry: 'PY',
  },
  department: {
    '@type': 'MedicalClinic',
    name: 'Centro Médico Lister',
    telephone: '+595213190000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Paí Perez 630 c/ Azara',
      addressLocality: 'Asunción',
      addressCountry: 'PY',
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${display.variable} ${inter.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }} />
        {children}
      </body>
    </html>
  );
}
