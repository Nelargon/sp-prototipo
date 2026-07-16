import { A, H2, P, B, Callout, Nota } from '../Articulo';

export const metadata = {
  title: 'Los chequeos que conviene hacerse a cada edad · Blog · Salud Protegida',
  description:
    'Una guía simple de los controles de salud recomendados según la etapa de la vida: niños, adultos y mayores de 65. Prevenir es más barato — y más tranquilo — que curar.',
  alternates: { canonical: '/blog/chequeos-por-edad/' },
};

export default function Nota2() {
  return (
    <A
      kicker="Salud preventiva"
      title="Los chequeos que conviene hacerse a cada edad"
      intro="La mayoría de los sustos grandes de salud avisan antes — si alguien los va a buscar. Esta es una guía simple de los controles que suelen recomendarse en cada etapa de la vida."
      minutes={5}
      date="Julio 2026"
    >
      <H2>En la infancia: el calendario es el mapa</H2>
      <P>Con los chicos, lo más importante ya viene organizado: el <B>calendario de vacunación</B> y los <B>controles del niño sano</B>, donde el pediatra sigue el crecimiento, la vista, la audición y el desarrollo. La regla es simple: no saltearse controles aunque el chico esté perfecto — justamente para que siga estándolo.</P>

      <H2>De los 20 a los 40: crear el hábito</H2>
      <P>Es la etapa donde más fácil es no ir nunca al médico — y donde se forma (o no) el hábito que después te cuida. Lo que suele recomendarse: un <B>chequeo general anual</B> (presión, peso, análisis de sangre básicos), control odontológico y oftalmológico, y para las mujeres el <B>control ginecológico anual</B> (PAP y, según indicación, mamografía más adelante).</P>
      <Callout>Un chequeo anual es una mañana al año. Comparalo con lo que cuesta — en plata, tiempo y miedo — descubrir tarde algo que se podía tratar temprano.</Callout>

      <H2>De los 40 a los 65: los estudios que se suman</H2>
      <P>A partir de acá los médicos suelen sumar estudios específicos: control cardiológico con electrocardiograma, <B>glucosa y colesterol</B> con más atención, mamografía periódica, y a partir de los 45–50 los estudios de <B>prevención del cáncer de colon</B>. Nada de esto es dramático: son estudios de rutina, cortos, que se hacen una vez y dan tranquilidad por uno o dos años.</P>

      <H2>Después de los 65: acompañar, no solo controlar</H2>
      <P>En los adultos mayores el foco se amplía: además de los controles anteriores, importan la <B>vista y la audición</B> (que afectan la autonomía), la densidad ósea (prevención de caídas y fracturas), la vacunación del adulto (gripe, neumonía) y revisar juntos <B>la medicación completa</B> — porque a esa edad es común acumular recetas de varios médicos que no se conocen entre sí.</P>
      <P>Si estás organizando la salud de tus papás, este es el mejor regalo que no se envuelve: acompañarlos a un chequeo completo y salir con el mapa claro.</P>

      <H2>El patrón detrás de todo</H2>
      <P>¿Notaste el hilo? En todas las edades, la medicina que mejor funciona es la que llega <B>antes</B>. Por eso los planes de salud cubren consultas y estudios preventivos: para la empresa y para tu familia, el mejor problema es el que no ocurre.</P>

      <Nota>Esta nota es orientativa y no reemplaza la consulta médica: cada persona tiene su historia, y es tu médico quien define qué controles necesitás y cada cuánto.</Nota>
    </A>
  );
}
