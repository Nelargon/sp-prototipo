import { A, H2, P, B, Callout, Nota } from '../Articulo';

export const metadata = {
  title: 'Cómo elegir un plan de salud para tu familia (sin perderte) · Blog · Salud Protegida',
  description:
    'Las cuatro preguntas que ordenan la decisión de un plan de salud familiar: quiénes son, cuánto lo van a usar, dónde viven y qué pasa en el peor día.',
  alternates: { canonical: '/blog/como-elegir-plan-familia/' },
};

export default function Nota3() {
  return (
    <A
      kicker="Decisiones"
      title="Cómo elegir un plan de salud para tu familia (sin perderte)"
      intro="Comparar planes de salud puede sentirse como leer tres contratos a la vez. La buena noticia: la decisión se ordena con cuatro preguntas — y ninguna es sobre folletos."
      minutes={4}
      date="Julio 2026"
    >
      <H2>1. ¿Quiénes son?</H2>
      <P>Todo empieza acá, porque el precio y el plan correcto dependen de <B>las edades</B>. Un plan para una pareja de treinta no se parece al de una familia con tres chicos, ni al de tus papás de setenta. No busques "el mejor plan": buscá el mejor plan <B>para esta familia, en este momento</B>. En unos años la respuesta puede cambiar — y está bien que cambie.</P>

      <H2>2. ¿Cuánto lo van a usar?</H2>
      <P>Sé honesto con esto. Si tenés chicos pequeños, van a ir al pediatra <B>muchas</B> veces al año — consultas frecuentes baratas o gratis valen oro. Si son dos adultos sanos que van al médico dos veces al año, quizás convenga una cuota más baja con copagos. El error clásico es pagar de más por coberturas que no se usan, o de menos por las que sí.</P>

      <H2>3. ¿Dónde viven (y dónde se atienden)?</H2>
      <P>Un plan vale lo que vale <B>su red cerca tuyo</B>: los sanatorios, médicos y farmacias que te quedan a mano. Antes de decidir, mirá la red en tu zona — no la lista completa del país. Y si viajás seguido al interior o tenés familia allá, eso también cuenta: hay planes con cobertura por zona, y pagar por todo el país cuando vivís y te atendés en Central es plata que no trabaja.</P>
      <Callout>Prueba sencilla: pensá en los tres lugares donde se atendieron el último año. ¿Están en la red del plan que estás mirando? Esa respuesta vale más que cualquier folleto.</Callout>

      <H2>4. ¿Qué pasa en el peor día?</H2>
      <P>Esta es la pregunta que nadie quiere hacer y todos deberían: si mañana pasa <B>lo grande</B> — una internación, una cirugía mayor, terapia intensiva — ¿este plan responde? La cobertura de alta complejidad es la razón de ser de un plan. Las consultas las podés pagar del bolsillo si hace falta; una terapia intensiva, no.</P>

      <H2>Y una trampa a evitar: elegir solo por precio</H2>
      <P>El plan más barato que no cubre lo que tu familia necesita no es barato: es <B>plata tirada más el susto</B>. Y el más caro tampoco es automáticamente el mejor — puede estar cobrándote coberturas que nunca vas a usar. El precio correcto es el que corresponde a la protección que tu familia de verdad necesita. Por eso las cuatro preguntas vienen antes que el número.</P>

      <Nota>¿Un atajo honesto? Nuestro simulador te hace estas mismas preguntas — quiénes son, qué edades tienen, dónde viven, cuánta cobertura buscás — y te muestra el plan que va con las respuestas, con precio estimado, antes de pedirte ningún dato.</Nota>
    </A>
  );
}
