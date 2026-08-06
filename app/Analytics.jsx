import Script from 'next/script';

// Medición de audiencia del sitio.
//
// POR QUÉ EXISTE
// Hasta el 06/08/2026 el sitio no tenía NINGUNA analítica. Sin eso no se puede
// saber qué nota funciona, ni armar un "lo más leído" honesto: cualquier
// ranking sería inventado, y eso choca de frente con el pilar Honesta.
//
// APAGADA POR DEFECTO, a propósito. Medir a los visitantes de un sitio de
// SALUD no es una decisión técnica, es una decisión de privacidad: hay que
// tomarla a conciencia, no heredarla de un commit. Se enciende poniendo una
// de las dos variables de entorno en el build.
//
// DOS OPCIONES, y la recomendación no es neutral:
//
//   NEXT_PUBLIC_PLAUSIBLE_DOMAIN   → Plausible (recomendado)
//     Sin cookies, sin datos personales, sin huella de navegador. Al no usar
//     cookies NO exige banner de consentimiento, que en un sitio de salud es
//     una fricción que no vale la pena pagar. Es de pago (~USD 9/mes).
//
//   NEXT_PUBLIC_GA_ID              → Google Analytics 4
//     Gratis y ya conocido por el equipo. Usa cookies y envía datos a Google,
//     así que exige banner de consentimiento y una política de privacidad que
//     lo diga. Más potente para marketing; más pesado para el visitante.
//
// Si las dos están puestas, gana Plausible: ante la duda, la opción que no
// sigue a la persona.
//
// NUNCA se enciende sola: sin variable, este componente no renderiza nada y
// el sitio no carga un solo byte de terceros.

export default function Analytics() {
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const ga = process.env.NEXT_PUBLIC_GA_ID;

  if (plausible) {
    return (
      <Script
        defer
        data-domain={plausible}
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
    );
  }

  if (ga) {
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
// anonymize_ip: el sitio no necesita la IP completa de nadie para saber qué
// nota se lee más. Es el mínimo decente en un sitio de salud.
gtag('config','${ga}',{anonymize_ip:true});`}
        </Script>
      </>
    );
  }

  return null;
}
