import { A, H2, P, B, Callout, Nota } from '../Articulo';

export const metadata = {
  title: 'Carencia, copago y otras palabras que nadie te explicó · Blog · Salud Protegida',
  description:
    'El diccionario para entender tu plan de salud en idioma de familia: qué significa carencia, copago, tope, urgencia y alta complejidad — sin letra chica.',
  alternates: { canonical: '/blog/carencia-copago-y-otras-palabras/' },
};

export default function Nota1() {
  return (
    <A
      kicker="Entendé tu cobertura"
      title="Carencia, copago y otras palabras que nadie te explicó"
      intro="Los contratos de salud hablan un idioma que ninguna familia habla en su casa. Acá va la traducción, palabra por palabra, para que sepas exactamente qué estás firmando."
      minutes={4}
      date="Julio 2026"
    >
      <H2>Carencia: el tiempo de espera</H2>
      <P>La <B>carencia</B> es el tiempo que tiene que pasar desde que empezás tu plan hasta que podés usar ciertas coberturas. Por ejemplo: si una cirugía programada tiene 90 días de carencia, y te afiliaste el 1 de enero, podés usarla desde abril.</P>
      <P>¿Por qué existe? Para que el sistema sea justo con todos: evita que alguien se afilie solo para una operación que ya tenía planeada y se dé de baja al mes siguiente. Las urgencias, en general, no tienen carencia — se cubren desde el primer día.</P>
      <Callout>Lo que conviene preguntar antes de firmar: ¿qué carencias tiene este plan y para qué? Un buen asesor te lo dice sin que insistas.</Callout>

      <H2>Copago: lo que ponés vos en el momento</H2>
      <P>El <B>copago</B> es un monto chico que pagás cuando usás un servicio — por ejemplo, al ir a una consulta. Tu plan cubre la mayor parte y vos ponés esa diferencia.</P>
      <P>Un plan con copagos suele tener una cuota mensual más baja; uno sin copagos, una cuota más alta pero cero sorpresas al usarlo. Ninguno es "mejor": depende de cuánto usás el plan. Si van seguido al médico (chicos pequeños, controles), un plan sin copagos puede convenir aunque la cuota sea mayor.</P>

      <H2>Tope: hasta dónde llega la cobertura</H2>
      <P>Algunas coberturas tienen un <B>tope</B>: un máximo por año o por evento. Por ejemplo, una cantidad de sesiones de fisioterapia por año. Pasado el tope, el costo corre por tu cuenta o con descuento.</P>
      <P>La pregunta clave no es "¿tiene tope?" (casi todo lo tiene, en todas las empresas) sino <B>¿el tope alcanza para una familia como la mía?</B></P>

      <H2>Urgencia y emergencia: no son lo mismo</H2>
      <P>Una <B>urgencia</B> necesita atención rápida pero no pone en riesgo la vida (una fiebre alta de madrugada, un corte que necesita puntos). Una <B>emergencia</B> sí (un dolor de pecho fuerte, una dificultad para respirar). Los planes suelen cubrir ambas desde el primer día, pero los canales pueden ser distintos: guardia, atención a domicilio o ambulancia.</P>
      <Callout>Guardá el número de urgencias en el teléfono hoy, que no lo tengas que buscar la noche que lo necesites. El de Salud Protegida: (021) 319 0000 — para todo.</Callout>

      <H2>Alta complejidad: lo grande</H2>
      <P>La <B>alta complejidad</B> agrupa los tratamientos y cirugías mayores: terapia intensiva, cirugías cardíacas, tratamientos oncológicos. Es la parte del plan que esperás no usar nunca — y la razón principal por la que un plan existe. Cuando compares planes, mirá primero esto: es donde una diferencia de letra chica se vuelve una diferencia de verdad.</P>

      <H2>La regla de oro</H2>
      <P>Si algo del contrato no lo podés explicar con tus palabras a otra persona de tu casa, <B>pedí que te lo expliquen de nuevo</B>. No es ignorancia tuya: es jerga de ellos. Un plan que no se entiende no protege — confunde.</P>

      <Nota>Esta nota explica términos generales del mundo de los planes de salud. Los detalles de cada cobertura dependen de tu plan y tu contrato: ante la duda, consultá a tu asesor.</Nota>
    </A>
  );
}
