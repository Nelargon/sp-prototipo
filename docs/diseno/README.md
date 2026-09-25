# Lecciones de diseño de SP, con sus láminas

Acá se guardan las láminas de comparación que se le muestran a Arturo cuando
hay que decidir algo de diseño, cada una con la lección que dejó. Pedido suyo
(24/09/2026): *«Todas las imágenes que me envías son ejemplos que vale la pena
conservar como material de aprendizaje, tanto para una diapositiva como para la
bitácora.»*

Cada lección tiene la misma forma, para que sirva de diapositiva tal cual: **el
principio** (el título), **la lámina**, **qué muestra** y **qué se decidió y por
qué**. El camino completo, con los errores, está en `BITACORA.md`; el estado
vigente, en `HANDOFF.md`.

**Cómo se suma una lámina nueva:** en WebP, en `img/`, con la fecha adelante
(`2026-09-24-tema.webp`), y una entrada acá con su lección. Si solo compara
píxeles y no enseña nada, no entra.

---

## Parte 1 · El lenguaje táctil (24/09/2026)

Arturo: *«me gustaría que todo lo que revisamos, el diseño inspirado en Apple y
las mejoras realizadas, se extienda a toda la web»*. Lo que hace que se sienta
Apple no son los efectos: son las reglas detrás de cada uno.

### 1 · La sombra dice «esto se toca»

![Tres intensidades del relieve en el inicio, en celular](img/2026-09-24-toque-tres-intensidades.webp)

**Qué muestra.** El inicio en celular en cuatro columnas: hoy, A (sutil), B (como
la guía) y C (más relieve).

**Qué se decidió.** La **B**, elegida por Arturo (*«Vamos con la B»*). La sombra
va solo en lo que se toca o se abre; lo que informa (la tabla del comparador) no
lleva, y se distingue con color, borde e ícono. Lo elegido va plano, «apretado».
Los botones principales van planos. La C ponía sombra en casi todo, y cuando
todo flota nada se destaca.

### 2 · Cada movimiento avisa algo verdadero

[Video en cámara lenta (×3): el botón se hunde, la tarjeta se hunde entera, la pregunta crece](img/2026-09-24-toque-camara-lenta.webm)

**Qué muestra.** El toque a un tercio de la velocidad real.

**Qué se decidió.** Un botón se hunde al 97 %; una tarjeta entera, al 98 %,
porque es más grande y lo mismo se vería como un salto. Una fila de lista se
oscurece en vez de achicarse, porque se despegaría de sus bordes. Una palabra del
glosario se atenúa, porque achicarla movería la línea. **Un botón deshabilitado
no se hunde**: hundirse sería decir «te escuché» sin escuchar (BITACORA cap. 91).
Nada dura más de un tercio de segundo y todo se apaga con «reducir movimiento».

### 3 · Sobre azul, la sombra no se ve

![Blog y Mi SP antes y ahora](img/2026-09-24-toque-blog-y-mi-sp.webp)

**Qué muestra.** Mi SP, una nota y el índice del blog, antes y después.

**Qué se decidió.** En las páginas de fondo azul no va sombra: una sombra azul
sobre azul no se ve. Ahí lo que se toca se distingue por la superficie más clara
y el borde, y la fila tocada se aclara en vez de oscurecerse. La lámina también
muestra un error que no era del sistema: la etiqueta «Mi SP · tu espacio» estaba
tapada por la barra fija. Lo encontró el ojo, no una prueba (cap. 91).

### 4 · Lo elegido va plano; el relieve va en lo que se toca

![Agendar antes y ahora](img/2026-09-24-toque-agendar.webp)

**Qué muestra.** El formulario de agendar.

**Qué se decidió.** Las opciones sin elegir llevan relieve y la elegida va plana.
Los campos llevan relieve porque se tocan. La tarjeta del formulario pierde su
sombra, porque es superficie y no se toca. Regla afinada: sobre el azul no va
relieve; dentro de una tarjeta blanca apoyada en el azul, sí.

### 5 · Una esquina se elige por lo que es, no por un número

![Esquinas antes y ahora, ampliadas al triple](img/2026-09-24-esquinas-por-funcion.webp)

**Qué muestra.** Seis esquinas reales, ampliadas al triple, con el radio medido.

**Qué se decidió.** 14 px quedaba justo entre 12 y 16: no tenía un «más
cercano». Cada esquina fue al tamaño de su función: botón, campo e ícono 12;
aviso 16; tarjeta grande y tabla 20. A la vista son 2 px; en el sistema, cada
tamaño pasó a querer decir algo (cap. 92).

---

## Parte 2 · Íconos propios (24/09/2026)

Arturo, sobre los íconos de hoy: son genéricos, y quiere íconos *«más creativos,
más nuestros»*, como los de Claude.

### 6 · Copiar un estilo no lo hace nuestro

![Tres direcciones: trazo a mano, línea SP y dúo de color](img/2026-09-24-iconos-tres-direcciones.webp)

**Qué muestra.** Cuatro íconos del sitio en tres estilos, contra los de hoy, que
son de una librería que usan miles de sitios.

**Qué se decidió.** La **B · Línea SP**, que salía del isotipo, quedó
descartada: *«No se ve como un toque personal.»* A Arturo le gustaron el trazo a
mano (A) y el dúo de color (C). La lección: lo que se aprende de Claude no es su
dibujo, que es suyo, sino que sus íconos tienen mano propia.

### 7 · Un ícono se gana su lugar

![Los íconos del sitio en tres grupos](img/2026-09-24-iconos-clasificacion.webp)

**Qué muestra.** Los 111 íconos que hay hoy en el código, clasificados: 22 se
van, 77 son señales de uso y 12 lugares llevan ícono propio (unas 20 piezas).

**Qué se decidió.** La regla es de Arturo: *«En esos casos no es necesario usar
el ícono, y de todas formas, se ve muy pequeño. La aplicación creo que sería en
otras instancias más prácticas y donde tiene más sentido.»* Un ícono se gana su
lugar solo si hace algo que el texto solo no hace: ayuda a recorrer una lista o
una grilla, dice más rápido algo que el texto tarda en decir, o da calidez en un
momento que la necesita. En un botón que ya dice «Guía Médica», el ícono sobra.
Las flechas, la «×», la lupa, WhatsApp y el teléfono de urgencias se quedan
simples: se reconocen al instante.

### 8 · Ocho estilos, tres familias

![Ocho estilos de íconos](img/2026-09-24-iconos-ocho-estilos.webp)

**Qué muestra.** Los cuatro íconos de «En camino» de Mi SP y el «¡Listo!» del
simulador, en tres variantes de trazo a mano, tres de dúo de color y dos
mezclas.

**Qué se dijo.** Arturo: *«Lo que realmente me atrae es el estilo de trazo a
mano. La combinación de colores depende del fondo; debemos elegir la aplicación
correcta según el color de fondo.»* Una sola mano, y el color según el fondo.

### 9 · Un ícono se juzga en su lugar, no suelto

![Los estilos aplicados en Mi SP y en el simulador](img/2026-09-24-iconos-aplicados.webp)

**Qué muestra.** Los estilos en dos lugares reales, con los textos de hoy: las
tarjetas de «En camino» sobre el azul de Mi SP y el «¡Listo!» del simulador.

**La lección.** Un ícono que se ve bien sobre blanco puede desaparecer sobre
azul. Por eso las pruebas siguientes se hicieron en los fondos reales.

### 10 · El color del ícono depende del fondo (medido)

![El mismo ícono sobre los cuatro fondos del sitio](img/2026-09-24-iconos-prueba-fondos.webp)

**Qué muestra.** Credencial y turnos en cinco tratamientos sobre los cuatro
fondos del sitio: blanco, gris de la guía, menta y azul. En naranja, lo que falla
medido.

**Lo que se midió.** El trazo blanco sobre su círculo turquesa (A3) es el único
trazo a mano que funciona en los cuatro fondos, porque trae su propia base. La
mancha menta (A1) solo se distingue sobre blanco. El trazo azul sin base (A2)
funciona en los fondos claros y desaparece en el azul (1,3 a 1; un ícono necesita
por lo menos 3 a 1).

### 11 · Lo que limita el tamaño es el detalle, no el estilo

![Tamaños reales en el celular](img/2026-09-24-iconos-prueba-tamanos.webp)

**Qué muestra.** Un dibujo simple (turnos) y uno con detalle (salud mental) a 24,
32, 40 y 48 px, a la densidad de un celular.

**Lo que se vio.** La hipótesis era que el trazo a mano se perdía por debajo de
32 px, y estaba mal. El dibujo simple se lee a 24 px en cualquier estilo; el que
tiene detalle se empasta a 24 px en todos, el dúo incluido. Como los lugares con
ícono propio usan de 40 a 60 px, el tamaño no limita.

### 12 · Una metáfora se puede confundir con otra

![Metáforas difíciles, en sus tarjetas](img/2026-09-24-iconos-prueba-metaforas.webp)

**Qué muestra.** Las tres tarjetas de «Lo que casi nadie te garantiza» del
inicio, con metáforas más abstractas que un calendario.

**Lo que se vio.** La lupa que muestra que no hay letra chica y la casa con la
cruz en la puerta se entienden. Los dos globos con un corazón, para salud
mental, se pueden leer como «Escribinos» por WhatsApp: hace falta otra idea.

**Estado (24/09/2026):** propuesta sobre la mesa, esperando a Arturo: trazo a
mano siempre; en fondos claros, trazo azul sin base (A2); en azul, trazo blanco
sobre el círculo turquesa (A3).

**Después (24/09/2026):** Arturo dio el paso (*«ya podemos ir aplicando los
cambios según lo que hablamos en la página»*) y la propuesta se aplicó al sitio.
Al verla, la corrigió: todo A3 (lección 16). Lecciones 13 a 16.

### 13 · Una sola mano para todo el sitio

![El juego completo de íconos propios, en sus fondos y tamaños](img/2026-09-24-iconos-juego-completo.webp)

**Qué muestra.** Las 19 piezas que usa el sitio, cada una sobre blanco, menta y
azul, y chicas a 24 y 32 px. Las del blog, además, sobre su portada.

**Qué se decidió.** Todas salen de la misma mano: el trazo que no cierra
perfecto, repasado y apenas corrido, blanco sobre su mancha turquesa. El mismo
ícono sirve en cualquier fondo porque trae su propia base. Las portadas del blog
llevan el mismo trazo sobre la base translúcida de la portada: la mancha
turquesa sobre Sage, Lavender o Terracota mezclaría dos territorios de color que
la marca no deja mezclar. Los dibujos viven en `app/components/iconos-sp.js` y
se ponen con `IconoSP`.

### 14 · El dibujo dice lo que pasa de verdad

![El inicio, antes y ahora](img/2026-09-24-iconos-antes-y-ahora-inicio.webp)

![Mi SP, simulador, Guía Médica y blog, antes y ahora](img/2026-09-24-iconos-antes-y-ahora-resto.webp)

**Qué muestra.** Cada lugar tocado, en celular, antes y ahora: los botones que
perdieron el ícono y los lugares que ganaron el dibujo propio.

**Qué se vio.** El final que ve hoy quien usa el simulador es «¡Listo, Ana!
Falta un solo toque»: todavía no se mandó nada, porque falta que toque el botón
de WhatsApp. El ícono de antes era un tilde, que dice «ya está». Ahora es un
globo con la flecha de enviar. Es la lección 2 aplicada a un dibujo: lo que se
muestra tiene que avisar algo verdadero. Y los botones que ya decían «Guía
Médica» o «Simulá tu plan» quedaron más limpios sin su ícono, como había dicho
Arturo (lección 7).

### 15 · Una metáfora nueva se elige entre varias

![Salud mental: tres ideas](img/2026-09-24-iconos-salud-mental-tres-ideas.webp)

**Qué muestra.** Tres ideas para «Salud mental incluida», grandes y en su
tarjeta del inicio: una cabeza con un corazón, una cabeza con un brote y una
mano que sostiene un corazón.

**Estado (24/09/2026):** en el sitio va la cabeza con el corazón, que dice mente
y cuidado a la vez. La mano no dice «mente» y se puede leer como cuidado en
general. Las tres quedan dibujadas hasta que Arturo elija.

**Qué se decidió.** Arturo: *«Vamos con la cabeza con el corazón»*. Dice mente y
cuidado a la vez, y no se confunde con ningún otro ícono del sitio. Las otras dos
salieron del archivo de dibujos; quedan en esta lámina.

### 16 · La regla más simple, vista en su lugar

![A2 en claro y A3 en azul, o A3 en todas partes, en los lugares reales](img/2026-09-24-iconos-a3-en-todas-partes.webp)

![A3 con trazo único y con trazo repasado](img/2026-09-24-iconos-trazo-repasado.webp)

**Qué muestra.** Arriba, siete lugares del sitio con las dos reglas que había
sobre la mesa: trazo azul sin base en los fondos claros y A3 en el azul, o A3 en
todas partes. Abajo, A3 con el trazo único, con el trazo repasado y con el
dibujo más grande.

**Qué se decidió.** A3 en todas partes. Arturo: *«no era que íbamos a
seleccionar todo A3?»*, y del trazo, *«Hay algo humano y auténtico en eso»*. La
propuesta de Claude había sido la de dos reglas, por miedo a que una fila de
círculos turquesa iguales se volviera monótona sobre blanco. En los lugares
reales ese miedo no se sostiene: los círculos quedan en secciones distintas y
nunca forman una fila larga. Para que la mano se siga viendo dentro del círculo,
el trazo va repasado (fila del medio). El dibujo más grande ya toca el borde de
la mancha. La lección: una regla se juzga en su lugar, no en una lámina de íconos
sueltos (como la lección 9), y ante dos reglas que funcionan gana la más simple.

---

## Parte 3 · El comparador del home (24/09/2026)

### 17 · Dos puertas hermanas hablan con la misma gramática

![El comparador del home antes y después: etiquetas, descuento y las dos puertas](img/2026-09-24-comparador-puertas-simetricas.webp)

**Qué muestra.** El encabezado del comparador y sus dos puertas de salida, antes
y después, en escritorio y en celular.

**Qué se decidió.** Arturo vio que *«¿Está cubierto lo que me pidieron?»* y *«El
detalle fila por fila»* *«presentan una disonancia gráfica; no son simétricos»*.
Las cajas medían lo mismo; lo que no era simétrico era el texto: una pregunta al
lado de un sustantivo, y una bajada de una línea al lado de una de dos. Ahora las
dos son la pregunta que se hace la persona (*«¿Qué cambia de un plan a otro?»*) y
sus bajadas miden lo mismo. En la misma pasada se fueron las etiquetas que
repetían lo que estaba al lado y la línea del descuento pasó del porcentaje a la
plata: *«en un año, es más de una cuota que te queda en el bolsillo»*.

**La lección.** La simetría no es solo de cajas: dos elementos del mismo rango
se escriben con la misma forma gramatical y el mismo largo. Si no, el ojo los lee
como cosas de distinto peso aunque el borde sea idéntico.

---

## Parte 4 · Portadas del blog: un dibujo por nota (24/09/2026)

Arturo pasó cinco portadas del newsroom de Anthropic (no se guardan acá: son
suyas): *«Son muy creativos, lucen genial y no tienen que ser fotos. Podés
hacerlo e imitarlo, pero llevarlo más al estilo SP?»*. Lo que se aprende de esas
portadas no es el dibujo sino la idea: cada imagen dice lo que dice su nota.

### 18 · Un color distinto no es un estilo distinto

![Hoy y un mismo estilo en tres paletas](img/2026-09-24-portadas-tres-paletas.webp)

**Qué muestra.** Tres notas reales, de las tres categorías con más notas, a su
tamaño de tarjeta: la portada de hoy y un mismo estilo (papel recortado y trazo
a mano) en tres paletas. Abajo, las mismas portadas a 64 px, como en el riel
«Lo último».

**Qué se midió.** Hoy, 61 de las 70 notas comparten 5 dibujos: cada una lleva el
ícono de su categoría (las otras 9 muestran su cifra). Y en el riel «Lo último»
la miniatura se recorta en cuadrado y el ícono, que vive a la izquierda, queda
afuera: son cuadrados de color. Nadie lo había notado.

**Qué pasó.** La paleta A era la más parecida a la referencia. Antes de verla,
Arturo avisó: *«Acordate de que no tienen que ser muy similares. Podes ver 3 - 5
versiones del estilo»*. Tres paletas de la misma técnica eran tres versiones de
lo mismo: la receta de la referencia (fondo apagado, trazo oscuro, papel blanco)
seguía entera en las tres. Cambiar el color no cambia el estilo.

### 19 · Cinco técnicas, una sola mano

![Cinco estilos para las mismas tres notas](img/2026-09-24-portadas-cinco-estilos.webp)

![Los cinco estilos en el índice del blog, en celular](img/2026-09-24-portadas-estilos-en-su-lugar.webp)

**Qué muestra.** El mismo dibujo con cinco técnicas: trazo blanco (la mano de los
íconos del sitio), línea y acento ámbar, dos tintas con grano, rayado a mano y
tiza. Abajo, los cinco en el índice del blog, en un celular de 390 px.

**Lo que se vio.** En la página azul, las portadas de fondo blanco (línea y
acento, rayado) se funden con la tarjeta blanca y la tarjeta se lee como una
sola pieza, más de revista. La tiza de «Salud en Paraguay» usa el mismo azul que
la página y pierde el borde de arriba. El trazo blanco es el más parecido a la
referencia de los cinco, porque conserva papel y trazo, pero es también el que
ya usa el sitio en sus íconos.

**Estado (24/09/2026):** los cinco sobre la mesa, esperando a Arturo. Los dibujos
y las técnicas están en `fuentes/`, para no redibujar cuando elija.

**Después (24/09/2026):** Arturo: *«Trazo blanco está bien. El problema no era
eso, pero más el estilo de los garabatos o dibujos. Por ejemplo, la mano, que
tiene súper similitud con la mano que se usa para Claude.»* El acabado quedó
elegido; lo que se parecía era el dibujo, y ese no había cambiado en ninguno de
los cinco (lección 20).

### 20 · Lo que se parecía era la mano, no la pintura

![La mano de antes y cinco maneras de dibujar, en trazo blanco](img/2026-09-24-portadas-cinco-maneras-de-dibujar.webp)

![Las cinco maneras de dibujar en el índice del blog, en celular](img/2026-09-24-portadas-maneras-en-su-lugar.webp)

**Qué muestra.** Las mismas tres notas, las mismas ideas y el mismo trazo blanco,
dibujadas de cinco maneras: gente con cabeza en anillo y cuerpo en arco, como las
figuras del isotipo; escenas chicas con suelo y cielo; objetos sobre la mesa
vistos desde arriba; manos macizas con el pulgar a la vista; y la portada como un
ícono grande dentro de su mancha. A la izquierda, apagada, la mano de antes.
Abajo, las cinco en el índice del blog, en un celular de 390 px.

**Lo que se vio.** La gente del isotipo se lee a tamaño de tarjeta y es la única
que pone personas donde la referencia pone manos sueltas. Las manos en silueta se
leen como manos gracias al pulgar; sin él, la palma parecía una hoja. El ícono
grande es el que mejor se lee chico, pero dice el tema más que la historia. En
las escenas, los detalles lejanos (la ciudad en el horizonte) no se ven en la
tarjeta. Y la guampa vista desde arriba se puede confundir con un blanco de tiro.

**Estado (24/09/2026):** las cinco sobre la mesa, esperando a Arturo. Los dibujos
están en `fuentes/2026-09-24-portadas-maneras-de-dibujar.mjs`.

---

## Parte 5 · Essential reemplaza a Bronze (24/09/2026)

### 21 · Si el número no se compara igual, se dice debajo

![La tabla del home con Bronze y con Essential, y el resultado del simulador con la zona](img/2026-09-24-essential-reemplaza-bronze.webp)

**Qué muestra.** La tabla del home antes (Bronze) y después (Essential), y el
resultado del simulador en celular para alguien de Ciudad del Este, con la
opción de todo el país.

**Qué se decidió.** Arturo eligió que la ciudad ponga el precio y que Nacional
quede a un toque. En la tabla, Essential no tiene los topes de Bronze: varios
son **por familia** y no por persona. Un «5» por familia al lado de un «15» por
persona se lee como una comparación que no es; por eso cada número de Essential
dice debajo qué cuenta. Donde el cuadernillo no trae el dato, la celda lo dice
(«Consultalo con tu asesor») en vez de rellenarla. Y como la tabla muestra topes
y no esperas, la espera de un año de Essential va en una línea propia, a la
vista, debajo de la tabla.

**La lección.** Una tabla compara solo si cada celda mide lo mismo. Cuando un
plan cuenta distinto, la diferencia se escribe junto al número; y lo que la
tabla no puede mostrar (la espera) se dice al lado, no se deja para la letra
chica.

---

## Parte 6 · Portadas del blog: el lenguaje elegido (24/09/2026)

Sigue a la Parte 4. Arturo tachó en rojo, sobre la lámina de la lección 20, todo
lo que no le servía. Quedaron la gente del isotipo (las dos personas que se
explican, la familia entre la casa y el sanatorio), el barrio con paisaje y el
ícono grande en círculo: *«Es casi como un niño que dibuja, pero un niño que
dibuja y se entiende.»*

### 22 · Un chico que dibuja y se entiende

![Lo que marcó Arturo y cinco iteraciones de ese lenguaje](img/2026-09-24-portadas-cinco-iteraciones.webp)

![Las cinco iteraciones en el índice del blog, en celular](img/2026-09-24-portadas-iteraciones-en-su-lugar.webp)

**Qué muestra.** Primero, lo que Arturo marcó. Después, cinco iteraciones del
mismo lenguaje sobre las mismas tres notas: más de chico (temblor, sol con rayos,
pasto), la escena dentro del círculo, con paisaje (lomas, sol, lapacho), un
detalle en papel blanco macizo, y gente con gestos (brazos simples). Abajo, las
cinco en el índice del blog, en celular.

**Lo que se vio.** «Antes de la consulta» no tenía ninguna versión elegida
fuera del círculo. La que mejor lo cuenta con gente es la de gestos: el paciente
le da su lista a la doctora. En el paisaje, las lomas dibujadas con línea
cruzaban a las personas y parecían rayitas sueltas; como papel translúcido
detrás, se leen como campo y no tapan a nadie. Y el detalle lleno es el que más
se ve de lejos, porque es lo único macizo de la portada.

**Estado (24/09/2026):** las cinco sobre la mesa, esperando a Arturo. Se pueden
combinar: él pidió que el conjunto sea diverso.

**Qué se decidió (25/09/2026).** Después de ver a Tranquibara y al muñeco
(lecciones 23 y 24), Arturo volvió a esta lámina: *«vamos a volver atrás con
todo»*. Eligió la **1 · Como lo dibuja un chico** como estilo base, y la **4 · Un
detalle lleno** para usar a veces: en la lista y en el globo sí, en el sanatorio
no (*«excepto la figura que tiene la casa, no me gusta esa»*). La regla que sale
de ahí: se llena un objeto chico que lleva la idea, nunca un edificio. Y sin
rigidez: *«No tenemos que ser muy estrictos, pero el estilo de dibujo creo que
encaja bastante bien aquí.»*

### 23 · Tranquibara también, con la misma mano

![Tranquibara a mano: sus estados, tres portadas y la nota donde no va](img/2026-09-24-portadas-tranquibara.webp)

**Qué muestra.** Arriba, Tranquibara dibujado con el mismo trazo blanco, en cinco
estados: en reposo, saluda, leyendo y verificando, explicando y tranqui. Después,
tres portadas, sueltas y en el círculo: lee su cuaderno antes de la consulta,
explica con calma qué es una carencia, y descansa en la hamaca con su tereré
porque resolvió su cobertura antes de necesitarla. Al final, la nota donde no
va.

**Qué se respetó.** Las reglas del personaje: los ojos nunca se agrandan, nada
de guardapolvo ni carpeta, sereno y presente. En carencias y copagos va sereno y
sin chiste. En una nota sobre tratamiento oncológico no aparece: *cuanta más
angustia hay en el momento, menos personaje y más persona*.

**Lo que se vio.** De frente, en línea blanca, parecía un oso. El carpincho está
en el hocico largo, y eso solo se ve de tres cuartos. Girarle la cabeza fue
también cumplir otra regla suya: la cabeza mira hacia lo que atiende.

**Estado (24/09/2026):** esperando a Arturo. Tranquibara no tiene todavía un
dibujo maestro en vector; si estas portadas salen, conviene que las revise quien
hizo el original.

**Después (25/09/2026): descartado.** Arturo: *«Si el dibujo es así es horrible.
Parece como que la IA trató de dibujar usando líneas. No es el estilo de
Claude.»* Un personaje con tantos rasgos delata que el dibujo está construido con
coordenadas; las figuras simples del estilo del chico no, porque ahí la simpleza
es el estilo (BITACORA cap. 106). Si Tranquibara aparece en el blog, va con su
arte oficial.

### 24 · La gente, con otra mano

![La gente de hasta ahora y cinco variaciones del muñeco](img/2026-09-24-portadas-gente-otra-mano.webp)

![Las cinco variaciones en el índice del blog, en celular](img/2026-09-24-portadas-gente-en-su-lugar.webp)

**Qué muestra.** Arturo pasó una referencia para dibujar a las personas: cabeza
grande y redonda con dos puntitos, cuerpo como una papa, brazos y piernas de
palito, poses con movimiento. La referencia no se guarda acá, porque no es
nuestra. Se tomó la manera de dibujar, no el personaje. La lámina muestra la gente
de hasta ahora y cinco variaciones del muñeco sobre las mismas tres notas:
cabeza blanca, solo línea, cuerpo de color, con caras y con pelo y detalles.

**Lo que se vio.** Con cabeza, cuerpo y palitos, la gente se mueve: el que no
entiende se rasca la cabeza, el que explica abre el brazo, la familia camina. El
primer intento de pelo y lentes fue en blanco sobre la cabeza blanca, y no se
veía. Lo que va en la cara va en el color del fondo, que cumple el papel de la
línea oscura de la referencia con la paleta de SP.

**Estado (24/09/2026):** esperando a Arturo.

**Después (25/09/2026): descartado** junto con Tranquibara: *«vamos a volver
atrás con todo»*. La gente sigue siendo la del isotipo (lección 22).

---

## Parte 7 · Essential estudio por estudio y un título sin bajada (25/09/2026)

### 25 · «No sé» también es una respuesta de la tabla

![El buscador de «¿Está cubierto?» en celular con la columna de Essential: cubierto, confirmalo con tu asesor, exclusión y especialidades](img/2026-09-25-essential-estudio-por-estudio.webp)

**Qué muestra.** El buscador de `/que-cubre` en celular después de cargar
Essential estudio por estudio: un estudio cubierto con su tope y su espera, uno
que el cuadernillo no nombra igual («Confirmalo con tu asesor»), la exclusión
de hemodinamia que faltaba y la tabla de especialidades con cuatro columnas.

**Qué se decidió.** El cuadernillo de Essential es una lista cerrada, así que
lo que no nombra queda como «No entra en este plan». Cuando un nombre de la
grilla podría ser el mismo estudio con otra palabra, no se adivina: se muestra
en gris neutro, con una línea que dice por qué y a quién preguntar. La nota del
pie nombra las dos fuentes con su fecha, porque Essential y Silver/Gold salen
de documentos distintos.

**La lección.** Un casillero que dice «preguntá» es más honesto que uno
rellenado por parecido, siempre que diga por qué no sabe y a quién preguntar:
sin esa línea, «Confirmalo» se lee como una evasiva. Y cuando dos columnas
salen de dos fuentes, la nota lo dice; si no, la persona cree que todo viene
del mismo papel.

### 26 · La transparencia no implica sobreexplicar

![El título de la tabla del home antes (dos partes y una bajada) y después (solo «Qué te cubre cada plan.»)](img/2026-09-25-titulo-tabla-solo-titulo.webp)

**Qué muestra.** El encabezado de la tabla que compara los planes en el home,
antes y después, en celular y en escritorio.

**Qué se decidió.** Arturo: *«Esta frase no es muy clara y no se dirige
directamente a la persona. Debemos ser más directos y claros. Solo hace falta
poner un título, sin demasiados detalles adicionales. La transparencia no
implica sobreexplicar.»* Quedó «Qué te cubre cada plan.», casi las mismas
palabras del menú que trae hasta ahí, y sin bajada. La tabla sube unos 100 px
en el celular.

**La lección.** Una bajada que anuncia lo que el bloque de abajo ya muestra
(«todo lo que cambia, de un vistazo») no agrega información: agrega lectura. Lo
honesto está en la tabla, no en explicar que la tabla es honesta.

---

## Parte 8 · Portadas del blog: la biblioteca, en tandas (25/09/2026)

Con el estilo elegido (lección 22), Arturo: *«Vamos a cubrir todas en tandas de
10.»* Son 62 notas sin cifra (las 9 con cifra quedan como están), de la más
nueva a la más vieja. Cada tanda se aprueba antes de pasar a la siguiente.

### 27 · Tanda 1: las diez más nuevas

![Las 10 portadas de la tanda 1](img/2026-09-25-portadas-tanda-1.webp)

![La tanda 1 arriba del blog, en escritorio y en celular](img/2026-09-25-portadas-tanda-1-en-su-lugar.webp)

**Qué muestra.** Una metáfora por nota, armada con piezas: la empresa que dice
que cumple y otros que lo confirman; el cartel antes de la escalera; el centro de
salud con su relojito; la curita del joven y del mayor; el ida y vuelta de una
cirugía; la obra y quien estudia; el calendario de todos los días; el
tensiómetro; la carpeta de un consultorio al otro; la gente y las monedas que
suben. Abajo, la parte de arriba del blog con la nota destacada y el riel.

**Lo que se vio.** En el riel «Lo último», la miniatura de 64 px ahora muestra el
dibujo: antes el ícono de la categoría quedaba afuera del recorte y se veía un
cuadrado de color. Las curitas tuvieron que crecer para verse. Y el detalle lleno
quedó en objetos chicos, en cuatro de diez.

**Estado (25/09/2026):** esperando a Arturo.


### 28 · El objeto dice el tema; el gesto dice la idea

![La tanda 1 a ciegas, parte 1: cinco portadas numeradas, sin título](img/2026-09-25-portadas-tanda-1-ciega-1.webp)

![La tanda 1 a ciegas, parte 2](img/2026-09-25-portadas-tanda-1-ciega-2.webp)

![Los diez títulos con letra, en otro orden](img/2026-09-25-portadas-tanda-1-ciega-titulos.webp)

**Qué se pidió.** Arturo volvió a pasar dos juegos de la referencia (seis
portadas de colores apagados y seis íconos crema con un acento terracota) y
pidió *«un prompt para testear si esto se entiende realmente, y si coincide con
la filosofía del estilo de Claude, aunque no sea exactamente lo mismo, pero la
forma en la que el dibujo refleja el mensaje, y la personalidad del estilo»*.
Y después: *«Si miras con excesiva atención las imágenes, ¿qué observas? ¿Qué
otros detalles podrías extraer del estilo y forma?»* Las imágenes de referencia
no se guardan acá: son de otra marca.

**Lo que se ve de cerca.**
- **Emblema, no escena.** Un objeto que todos conocen (corazón, ADN, lamparita,
  escalera, moneda) y un gesto o una línea que le cambia el sentido: el pulso
  que cruza el corazón, la flecha que sube por arriba de la escalera, la mano
  que sostiene la moneda. El objeto dice el tema; el gesto dice la idea.
- **Dos capas que no se calcan.** Una forma plana, llena y sin contorno carga
  la idea; la línea es lo humano y la acción, y cruza la forma sin seguirle el
  borde. En la nuestra el papel también va corrido de la línea, pero al 20 %:
  se lee como sombra, no como idea.
- **Pocos trazos y mucho aire.** Uno a tres elementos en el centro, a media
  altura del cuadro. Sin suelo ni paisaje: las cosas flotan.
- **La gente, en pedazos.** Una mano que sostiene, un perfil que piensa. Nunca
  un cuerpo entero, nunca ojos. La personalidad está en el gesto, no en la cara.
- **Pocos valores.** Fondo, línea y forma. En el juego crema, un solo color de
  acento marca la idea, y un beige apenas más oscuro rellena los detalles.
- **Una picardía.** Un movimiento chico e inesperado: el cursor que hace clic en
  una molécula, la mano que mete un edificio en la ciudad.
- **Misma gramática, otra piel.** Los dos juegos cambian fondo, grosor y color, y
  se reconocen igual. La filosofía viaja; la firma (la mano de dedos en rulo, el
  perfil de una sola línea, las formas facetadas, la pincelada negra) no se toma.

**Lo que eso dice de la tanda 1** (contado sobre la lámina de la lección 27).
Nueve de diez tienen suelo; ocho de diez, gente de cuerpo entero; el sol o el
pasto aparecen en tres. La forma llena, que en la referencia es la idea, en la
nuestra es un detalle chico. Las nuestras cuentan una escena; las de la
referencia condensan una idea.

**La prueba** (`prueba-de-portadas.md`). La hoja a ciegas mezcla el orden y saca
títulos y categorías; la de títulos los trae con letra, en otro orden. Primera
medición, 25/09/2026: una IA sin contexto adivinó el tema de cada portada solo
con el dibujo. Es un lector, no cinco personas: vale como señal.
- **Acertó (2):** dengue (seguridad alta) y presión (baja).
- **Se acercó (3):** cambiar de médico (*«usar tu carnet en distintas
  clínicas»*), más gente (*«cuánto cuesta cubrir a toda la familia»*) y cirugía
  (*«ir y volver del hospital»*).
- **No acertó (5):** VIH (*«cumplir un plazo de días»*), el precio que se avisa
  (*«No sé»*), la aseguradora que cumple (*«a la gente le aprueban algo»*), el
  cuello uterino y el hospital con quien estudia (*«No sé»*).

El cuello uterino es la lección chica: el reloj quería decir «quince minutos» y
se leyó *«cuánto esperás para que te atiendan»*. En salud, un reloj se lee como
espera.

**Los errores que la referencia evita** (Arturo: *«¿Qué errores pensás que evita
cometer?»*). Entre paréntesis, la tanda 1:
1. **Dibujar la oración entera** en lugar de un objeto y un gesto (la comete: la
   aseguradora lleva edificio, globo, dos personas y dos tildes).
2. **La escena genérica de salud**: ni un hospital, ni un guardapolvo, ni un
   estetoscopio en doce dibujos (la comete: cuatro llevan sanatorio o hospital, y
   las dos de «persona + sanatorio» se leyeron como «clínicas» y «horarios»).
3. **Las caras**, que traen edad, género y emoción, y dejan a alguien afuera (la
   evita: la cabeza en anillo no tiene cara).
4. **El adorno** (la comete: suelo en nueve, sol o pasto en tres).
5. **Que todo pese igual** (la comete: todo con el mismo contorno, el papel como
   sombra).
6. **Los símbolos con dos lecturas** (la comete: el reloj y el cartel «!»).
7. **El dibujo quieto** (la comete: casi todo parado sobre una horizontal; la
   excepción, el mosquito que se va, fue de las dos que se acertaron).

Tres preguntas antes de dibujar cada portada: ¿cuál es el objeto?, ¿cuál es el
gesto?, ¿qué sobra?

**Estado (25/09/2026):** la tanda 1 sigue esperando a Arturo, ahora con la
prueba de pasillo. Propuesta de Claude, sin decidir: la mano del chico con la
gramática del emblema; rehacer como emblema las cinco que fallaron y probarlas
igual antes de la tanda 2.
