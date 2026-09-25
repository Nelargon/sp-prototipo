# Prueba de portadas: ¿el dibujo dice la nota?

Cada tanda de portadas del blog pasa esta prueba **antes** de aprobarse. La
pidió Arturo el 25/09/2026: *«Un prompt para testear si esto se entiende
realmente, y si coincide con la filosofía del estilo de Claude, aunque no sea
exactamente lo mismo, pero la forma en la que el dibujo refleja el mensaje, y la
personalidad del estilo.»* El porqué y lo que se vio mirando la referencia de
cerca están en la lección 28 de `README.md`.

Son dos pruebas que miden lo mismo desde dos lados:

1. **Con una IA sin contexto** (dos mensajes, abajo). Rápida: se corre en una
   ventana nueva de Claude, sin decir que las portadas son nuestras.
2. **De pasillo, con 5 personas** (abajo). Es la que manda: una IA adivina mejor
   que un lector apurado.

## El kit de cada tanda

- **Hoja a ciegas**: las 10 portadas numeradas en un orden mezclado, sin título
  ni categoría, en dos partes para leer en el celular.
- **Hoja de títulos**: los 10 títulos con letra (A–J), en otro orden.
- **La clave**: qué número va con qué letra. No se muestra a quien hace la prueba.
- **Las dos imágenes de referencia** que pasó Arturo (no están en este repo: son
  de otra marca). Solo para el mensaje 2 de la IA.

Tanda 1: `img/2026-09-25-portadas-tanda-1-ciega-1.webp`, `…-ciega-2.webp` y
`…-ciega-titulos.webp`. El script que arma la hoja, en la carpeta de la sesión
(`ciega.mjs`): mezcla con dos órdenes fijos y escribe la clave.

**Clave de la tanda 1:** 1 → J · 2 → H · 3 → G · 4 → I · 5 → E · 6 → B · 7 → A ·
8 → D · 9 → C · 10 → F.

## Prueba de pasillo (5 personas)

1. Mostrá la hoja a ciegas en el celular, sin decir quién la hizo. Preguntá:
   *«¿De qué creés que habla cada nota?»* Anotá la respuesta tal cual la dice.
2. Recién después, mostrá la hoja de títulos: *«Uní cada número con una letra.»*
3. **Una portada pasa si al menos 3 de 5 la aciertan a ciegas** (el tema, no el
   título exacto). La ronda 2 dice si, con el título al lado, se entiende; la 1
   dice si el dibujo trabaja solo.

## Prueba con IA — mensaje 1 (ronda a ciegas, igual para las dos variantes)

Adjuntar solo las dos partes de la hoja a ciegas.

```xml
<role>
Sos un lector común de Paraguay, adulto, que entra desde el celular al blog de
una empresa de cobertura médica. No sos diseñador. Mirás rápido, como en la
vida real.
</role>

<context>
Las dos imágenes adjuntas traen 10 portadas numeradas de ese blog. Cada portada
acompaña una nota. Los títulos no están: van a llegar en otro mensaje.
</context>

<destination>
Saber si cada dibujo, solo, da una pista correcta del tema de su nota. Con eso
se decide qué portadas se aprueban y cuáles se vuelven a dibujar.
</destination>

<task>
Para cada portada, del 1 al 10, decí qué ves primero y de qué creés que habla
la nota.
</task>

<definition>
El output cumple cuando:
- [ ] Las 10 portadas tienen respuesta, en orden del 1 al 10.
- [ ] Cada respuesta dice lo primero que viste (≤6 palabras) y el tema que
      adivinás (una frase de ≤15 palabras).
- [ ] Cada respuesta marca tu seguridad: alta, media o baja.
</definition>

<format>
Una tabla: N° · Lo primero que veo · De qué creo que habla · Seguridad.
</format>

<doubt_guards>
- Si un dibujo no te dice nada, escribí "No sé" en lugar de inventar un tema.
  Un "No sé" honesto sirve más que una adivinanza armada.
- Describí solo lo que se ve; no supongas elementos que no están en la imagen.
</doubt_guards>

<done_when>
Terminás con la fila 10. Sin comentarios de diseño, sin recomendaciones, sin
preguntas.
</done_when>
```

## Prueba con IA — mensaje 2, variante B (con contrapeso) · la recomendada

Adjuntar las dos imágenes de referencia. Cambiar la lista `<titulos>` por la de
cada tanda (número de la hoja → título, según la clave).

**Por qué la B:** quien evalúa tiende a aprobar. El contrapeso obliga a atacar
cada aprobada y a defender cada rechazada; el veredicto que queda es el que
resiste las dos cosas.

```xml
<role>
Ahora sos director de arte editorial. Conocés la ilustración conceptual y sabés
distinguir entre copiar un estilo y entender su filosofía.
</role>

<titulos>
1. La respuesta al VIH en Paraguay se construye con años de anticipación
2. Por qué el precio de una cobertura de salud se avisa antes de subir
3. Cuando cambiás de médico, la información no viaja sola
4. La vacuna contra el dengue ya se aplica hasta los 60 años
5. Que una aseguradora cumpla lo que promete no lo dice ella sola
6. Más gente con seguro médico no significa atenderla más barato
7. Qué significa que un plan te cubra una cirugía
8. Por qué controlar la presión importa aunque te sientas perfecto
9. El estudio que previene el cáncer de cuello uterino está en tu centro de salud
10. Un hospital se construye en dos años. Formar a quien te atienda, lleva más
</titulos>

<context>
- Arriba, el título real de cada portada de la ronda anterior.
- Las dos imágenes adjuntas son ilustraciones de otra marca. El equipo no quiere
  copiarlas: quiere que sus portadas funcionen como ellas (el dibujo refleja el
  mensaje y tiene personalidad) con una mano propia.
- Lo que el equipo observó en la referencia. Usalo como vara, pero verificalo
  contra las imágenes:
  1. Emblema, no escena: un objeto que todos conocen (corazón, ADN, lamparita,
     escalera, moneda) y un gesto o una línea que le cambia el sentido. El
     objeto dice el tema; el gesto dice la idea.
  2. Dos capas: una forma plana y llena carga la idea; la línea es lo humano y
     la acción, y cruza la forma sin calcarla. (En el segundo juego, el acento
     va sin contorno; los detalles beige, adentro de la línea.)
  3. Pocos trazos, uno a tres elementos y mucho aire alrededor. Sin suelo ni
     paisaje de escena: las cosas flotan.
  4. La gente aparece en pedazos (una mano que sostiene, un perfil), nunca un
     cuerpo entero, nunca ojos.
  5. Pocos valores: fondo, línea y forma. En el segundo juego, un acento
     terracota marca la idea y un beige rellena los detalles.
  6. Una picardía: un movimiento chico e inesperado (el cursor que hace clic en
     una idea, la mano que mete un edificio en la ciudad).
- Lo que el equipo eligió propio a propósito, y no cuenta como falla: el trazo
  blanco sobre el color de la categoría; la mano de "un chico que dibuja y se
  entiende" (línea que tiembla, proporciones ingenuas, la gente del logo con
  cabeza en anillo y cuerpo en arco); la firma de la marca abajo a la derecha.
- Lo que no quiere, porque sería copiar la firma de la referencia: manos con
  dedos en rulo, perfiles de una sola línea, formas facetadas como octógonos,
  pincelada negra, terracota sobre crema, moléculas de nodos.
</context>

<destination>
Decidir, portada por portada, cuáles se aprueban y cuáles se vuelven a dibujar,
y saber si la tanda entendió la filosofía de la referencia aunque no se le
parezca.
</destination>

<task>
Evaluá cada portada con los criterios de <definition>, usando tu adivinanza de
la ronda anterior para el primero. Después, calificá la tanda completa.
</task>

<definition>
Por portada, cada criterio es ✓ o ✗:
- [ ] A ciegas: alguien que leyera solo mi adivinanza de la ronda anterior
      elegiría este título entre los diez. Si mi adivinanza nombra otro tema,
      aunque se parezca, es ✗.
- [ ] Una idea: la portada se resume en una frase de ≤8 palabras y esa frase va
      con el título.
- [ ] Un verbo: alguien o algo hace una acción que se ve (avisar, llevar,
      sostener, subir, irse).
- [ ] Economía: ≤3 elementos principales (contalos y nombralos).
- [ ] La idea primero: lo que carga el mensaje es lo que el ojo encuentra
      primero.
- [ ] Escena que suma: si hay suelo, sol, pasto o paisaje, ayuda al mensaje. Si
      es adorno, ✗. Si no hay escena, ✓.
- [ ] Mano propia: se nota hecha a mano, no parece señalética ni ícono de
      sistema, y no usa ninguno de los rasgos de firma de la referencia.

Regla del veredicto: **Aprobada** si tiene ✓ en "Una idea" y al menos 5 ✓ en
los otros 6. Si no, **Rehacer**.

Para la tanda:
- [ ] Nota de 1 a 10 en filosofía (¿funciona como la referencia: emblema, dos
      capas, gesto, aire, picardía?) con su porqué en ≤2 frases.
- [ ] Nota de 1 a 10 en personalidad (¿se reconoce una mano y un carácter, o
      podría ser de cualquiera?) con su porqué en ≤2 frases.
- [ ] Familia: sí o no a "las 10 se ven de la misma mano y no hay dos con la
      misma composición", nombrando las que se repiten si es no.
</definition>

<contrapeso>
Después de la tabla, un segundo pase. Por cada Aprobada, escribí en una línea el
argumento más fuerte de un lector apurado para no entenderla. Por cada Rehacer,
la mejor defensa en una línea. Si el argumento o la defensa se sostiene mirando
la imagen, cambiá el veredicto. Una portada con ✗ en "A ciegas" no puede pasar
a Aprobada: el contrapeso no defiende lo que el dibujo no dijo solo. Mostrá
solo los veredictos que cambiaron, con su línea; si no cambió ninguno, escribí
"Sin cambios".
</contrapeso>

<format>
1. Tabla: N° · A ciegas · Una idea · Un verbo · Economía · La idea primero ·
   Escena que suma · Mano propia · Veredicto.
2. Debajo, solo para cada Rehacer: "N°: causa visible (≤15 palabras) → arreglo
   (≤15 palabras)".
3. El contrapeso.
4. La tanda: filosofía X/10, personalidad X/10, familia sí/no, cada una con su
   porqué.
5. Los 3 rasgos de la referencia que más le faltan a esta tanda, uno por línea.
</format>

<doubt_guards>
- Cada ✗ nombra el elemento de la imagen que lo causa. Nada de "le falta
  fuerza" o "podría ser más claro".
- No afirmes nada de la referencia que no se vea en las dos imágenes adjuntas.
  No uses lo que sepas de la marca que la hizo.
- Si alguna de las observaciones del equipo (1 a 6) no se ve en la referencia,
  decilo en una línea al final en lugar de usarla como vara.
- No suavices: una portada que no pasa, no pasa. Tampoco castigues lo que el
  equipo eligió a propósito.
</doubt_guards>

<avoid>
- Recomendar rasgos de firma de la referencia (la lista de "lo que no quiere").
- Proponer manos o brazos como arreglo. En esta marca el gesto lo hacen la
  gente del logo, el objeto que se mueve o una flecha; una mano devuelve el
  dibujo a la firma de la referencia.
- Proponer cambiar la paleta, el trazo blanco o la firma de la marca.
- Proponer rojo (en esta marca es solo para urgencias) o dibujos que toquen o
  cambien el logo.
- Elogios generales ("buen trabajo", "gran potencial").
</avoid>

<done_when>
Terminás con el tercer rasgo que falta. Sin siguientes pasos, sin ofrecer
redibujar, sin preguntas.
</done_when>
```

## Prueba con IA — mensaje 2, variante A (directa)

La misma que la B **sin el bloque `<contrapeso>`** y sin el punto 3 de
`<format>`. Sirve para una pasada rápida sobre una tanda chica o sobre una sola
portada rehecha; para aprobar una tanda, la B.

**Segundo ajuste (25/09/2026, después de la corrida de Arturo):** el contrapeso
cambió cinco veredictos en las dos corridas y cuatro fueron para aprobar. Dos
de esas aprobaciones (cambiar de médico y más gente) se apoyaban en un «A
ciegas» generoso: el evaluador contó «traslados» como acierto de «cambiar de
médico». «A ciegas» se volvió una prueba concreta (¿alguien elegiría este título
leyendo solo la adivinanza?), y una portada con ✗ a ciegas ya no se puede
aprobar en el contrapeso. Y el rojo y el logo entraron en `<avoid>`: un arreglo
proponía un lazo rojo tocando el logo.

**Primer ajuste (25/09/2026):** el evaluador propuso manos en
tres de sus nueve arreglos, y corrigió con razón las observaciones 2 y 5. El
prompt de arriba ya trae las dos cosas: las observaciones corregidas y las manos
en `<avoid>`.

## Resultados

| Tanda | Prueba | Fecha | Pasan a ciegas | Veredicto | Dónde |
|---|---|---|---|---|---|
| 1 | IA sin contexto (variante B) | 25/09/2026 | 2 de 10 (3 cerca) | 2 aprobadas, 8 a rehacer · filosofía 4/10 · personalidad 5/10 | `README.md`, lección 28 |
| 1 | IA sin contexto, ronda a ciegas (corrida de Arturo) | 25/09/2026 | 1 de 10 (4 cerca) | — | `README.md`, lección 28 |
| 1 | IA sin contexto (variante B, corrida de Arturo) | 25/09/2026 | (su ronda de arriba) | 3 aprobadas, 7 a rehacer · filosofía 4/10 · personalidad 6/10 | `README.md`, lección 29 |
| 1 v2 (emblema) | IA sin contexto (variante B calibrada) | 25/09/2026 | 6 de 10 | 5 aprobadas, 5 a rehacer · filosofía 5/10 · personalidad 7/10 | `README.md`, lección 30 |
| 1 | Pasillo, 5 personas | — | — | — | pendiente (Arturo), para la versión que se elija |
