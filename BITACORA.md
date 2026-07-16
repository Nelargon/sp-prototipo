# BITÁCORA — el libro que escribimos mientras construimos

Esto no es un changelog ni documentación técnica. Es el diario de a bordo
del ecosistema digital de Salud Protegida: qué intentamos, qué pasó de
verdad, qué vueltas dimos y por qué, y qué aprendimos en cada una. Se
escribe mientras construimos — y va a seguir escribiéndose después de que
la página exista — porque las lecciones valen para nosotros y para
cualquiera que construya algo parecido.

**Reglas del libro:**
- Cada entrada cuenta tres cosas: *qué intentamos, qué pasó, qué
  aprendimos*. Si no hay aprendizaje, no es una entrada.
- Los errores se escriben con nombre y apellido. Los capítulos de lo que
  no funcionó son los que más valen.
- Se escribe en el momento (o lo más cerca posible): la memoria edita, el
  diario no.
- La bitácora solo crece; nunca se reescribe una entrada vieja. Si hoy
  pensamos distinto que en un capítulo anterior, eso es un capítulo nuevo.
- Todavía no sabemos de qué trata este libro. Está bien: el tema va a
  aparecer solo cuando lo releamos.

Complementa al `HANDOFF.md` (que dice *dónde estamos*) — la bitácora dice
*cómo llegamos y qué aprendimos en el camino*.

---

## Capítulo 1 — El encargo era una web; la respuesta fue cuatro preguntas

Todo empezó como un pedido conocido: "necesitamos una página para vender
planes". Pudimos haber hecho eso — un folleto digital lindo — y quizás
nadie lo habría objetado. En cambio, la pregunta que ordenó todo fue otra:
*¿qué necesita resolver una familia paraguaya, en minutos y desde el
celular, sin llamar a nadie?* La respuesta cupo en cuatro preguntas: ¿qué
plan me conviene? ¿cuánto me cuesta? ¿qué me cubre? ¿dónde me atiendo?

**Lo aprendido:** una lista corta de preguntas del cliente es mejor brief
que cualquier documento de requisitos. Desde entonces, cada propuesta
nueva se filtra con "¿a cuál de las cuatro preguntas sirve?" — y esa
regla mató más ideas mediocres que cualquier comité.

## Capítulo 2 — La guía se rediseñó en el formato "viejo" a propósito

Para rediseñar la Guía Médica teníamos la tentación obvia: hacerla en el
stack moderno del prototipo (Next.js). La descartamos y la construimos en
el mismo formato que usa el proveedor actual de SP: archivos HTML sueltos
con Tailwind. ¿Por qué? Porque el rediseño más elegante del mundo vale
cero si la empresa que lo tiene que adoptar no puede integrarlo sin
fricción.

**Lo aprendido:** la adopción le gana a la elegancia técnica. Diseñá para
el que tiene que integrar tu trabajo, no para tu portafolio.

## Capítulo 3 — Datos falsos a propósito (porque los reales estaban sucios)

Los datos reales de prestadores existían, pero venían con teléfonos
concatenados que rompían el botón "Llamar", dos direcciones en un campo,
un "fax: 30" y un typo memorable: "SERVICIO DE AMBULACIA". En vez de
importarlos, cargamos datos **ilustrativos** con el formato correcto:
sedes separadas, un teléfono por acción, horarios por día.

**Lo aprendido:** cuando el dato real está sucio, el prototipo con datos
inventados *bien estructurados* vale más — se convierte en el molde que
le dice al dueño del dato cómo tiene que limpiarlo. El prototipo es la
especificación.

## Capítulo 4 — Cero resultados nunca es un callejón

Decisión temprana que se volvió filosofía: cuando alguien busca algo que
no existe en la guía, jamás recibe una página vacía. Recibe un "¿quisiste
decir…?" y un botón de WhatsApp con su búsqueda ya escrita. Cada búsqueda
fallida es dos cosas: un cliente rescatado y un dato para Convenios sobre
qué le falta a la red.

**Lo aprendido:** las fallas del producto son la mejor fuente de
inteligencia de negocio, si las diseñás para capturarlas. El error no se
esconde: se cosecha.

## Capítulo 5 — Nunca "No cubierto", nunca rojo

Regla de tono que costó internalizar: la ausencia de cobertura no se
comunica como negación ("No cubierto", en rojo) sino como oportunidad
(etiqueta dorada, "Desde SP Premium", hoja de upsell hacia el simulador).
El rojo quedó reservado para una sola cosa: urgencias.

**Lo aprendido:** en un producto comercial, cada pixel comunica. Un
"no" mal dicho cierra la venta; el mismo dato dicho como "todavía no,
pero mirá lo que te falta" la abre. Y reservar un color para una sola
emoción (rojo = emergencia) es de las decisiones de diseño más baratas y
más potentes que tomamos.

## Capítulo 6 — El día que rompimos el lockfile

Instalamos una dependencia de prueba dentro del repo y el archivo de
dependencias quedó desincronizado; el deploy automático (que usa
`npm ci`, estricto) se rompió. Barato de arreglar, valioso de aprender.

**Lo aprendido:** las herramientas de verificación viven *fuera* del
proyecto. Y el CI estricto no es una molestia: es el guardián que
convierte un error silencioso en un error ruidoso — los ruidosos se
arreglan, los silenciosos se acumulan.

## Capítulo 7 — La integración que faltaba estaba en el menú

Teníamos una web de planes y una guía médica rediseñada — dos piezas
buenas que no se conocían entre sí. La guía ni aparecía en el menú del
homepage, y sus links de "volver" apuntaban al sitio viejo de producción:
el visitante que entraba a la guía quedaba atrapado en ella. La
integración fue menos glamorosa que construir las piezas: menú, footer,
un buscador que lleva la búsqueda puesta, links de vuelta.

**Lo aprendido:** un ecosistema no es un conjunto de piezas buenas; es un
conjunto de piezas *conectadas*. El pegamento (menús, links, contexto que
viaja con el usuario) es trabajo de primera clase, no un detalle. Y los
callejones sin salida se esconden justo en los bordes entre una pieza y
otra — ahí hay que ir a buscarlos.

## Capítulo 8 — El blur que nunca existió (o: verificá lo computado)

Pusimos un efecto de vidrio esmerilado en el header. El código estaba
"bien". El efecto no existía: el minificador de CSS del build encadenaba
las funciones sin espacio (inválido — el navegador lo descartaba en
silencio) y, cuando declarábamos la variante con prefijo a mano, el
minificador se quedaba *solo* con la prefijada, que nuestro navegador de
prueba no honraba. Dos bugs invisibles, apilados, sin un solo error en
pantalla. Lo encontramos porque la verificación no lee el código fuente:
le pregunta al navegador qué estilos *computó* de verdad.

**Lo aprendido:** entre tu código y el usuario hay una cadena de
herramientas que puede traicionarte en silencio. No verifiques lo que
escribiste; verificá lo que el navegador entendió. (Bonus del mismo día:
en el navegador de pruebas, el click en un link de teléfono congela la
navegación posterior — perdimos una hora hasta descubrir que el bug era
del entorno de prueba, no del producto. Anotado: cuando un test falla
raro, sospechá también del test.)

## Capítulo 9 — La auditoría de algo que no existe es una especificación

Planificamos auditar el registro de búsquedas del sistema actual:
comparar qué campos guarda contra los que necesitamos. Resultó que el
panel de estadísticas del proveedor *también* es un prototipo — no hay
datos reales; todos estamos dibujando el futuro al mismo tiempo. En vez
de frustrarnos, giramos: la auditoría se convirtió en especificación.
Escribimos en el contrato técnico exactamente qué debe tener ese panel
(conversión por prestador, demanda vs. oferta por ciudad, embudo por
sesión anónima) y de paso instrumentamos nuestra propia web con los
mismos eventos.

**Lo aprendido:** en proyectos tempranos, muchas veces vas a auditar
cosas que aún no existen. No es una pared: es la oportunidad de definir
la vara antes de que exista lo que va a ser medido. El que escribe la
especificación primero, define la conversación.

## Capítulo 10 — El manifiesto hermoso que era un peaje

El capítulo más incómodo hasta ahora. Construimos un manifiesto
scrollytelling del que estábamos orgullosos: siete pantallas
cinematográficas, frases que emocionan, fotos con parallax. Y un día,
mirando la home con ojos de usuario, hicimos la pregunta que dolía: *¿y
si esto arruina la experiencia?* Medimos: 720vh de marca **entre** el
hero y las herramientas. El visitante que scrollea — lo más natural del
mundo — paga siete pantallas de peaje antes de poder resolver nada. Y
peor: la home entera le habla solo al que todavía no es cliente; el
afiliado que vuelve cada mes no tiene nada.

Convocamos una mesa de advisors imaginaria (Miller, Ogilvy, Sutherland,
Bezos, Munger, Christensen, Galperin) y el veredicto fue 7-0: la home
debe resolver primero y emocionar después. El manifiesto no muere — se
comprime a una pantalla y su versión completa se muda a su propia página.
El plan quedó escrito en `PLAN-home-v2.md`.

**Lo aprendido — tres lecciones en una:**
1. Lo más difícil de criticar es lo que te quedó lindo. La belleza de una
   pieza no dice nada sobre si está en el lugar correcto.
2. "¿Estamos vendiendo demasiado?" es una pregunta que hay que hacerse
   *en voz alta* y con frecuencia. Vender y servir no son enemigos, pero
   el orden importa: primero resolvé, después emocioná.
3. El truco de la mesa de advisors imaginaria funciona: obligarse a mirar
   la misma decisión con siete pares de ojos distintos (narrativa, oficio
   de venta, psicología, modelo de negocio, sabiduría, producto, cancha
   local) produce mejores decisiones que discutir con uno mismo.

## Capítulo 11 — La medición como espec ejecutable

Cuando instrumentamos la web (cada click importante emite un evento
anónimo), no lo hicimos conectando una herramienta de analytics: lo
hicimos escribiendo los eventos en el código como *demostración
ejecutable* de lo que el backend deberá registrar. El que integre después
no tiene que interpretar un documento: abre la consola y ve los eventos
salir, con sus campos exactos.

**Lo aprendido:** la mejor especificación es la que corre. Un documento
dice "debería"; un prototipo instrumentado dice "así". Y una regla de
privacidad que nos ordenó todo: los eventos nunca llevan nombre, teléfono
ni email — el dato personal va al CRM, la analítica es anónima. Decidirlo
temprano evitó diez discusiones futuras.

## Capítulo 12 — El proceso también se diseñó (y esta bitácora es parte)

Sin darnos cuenta, construimos un método: ramas de trabajo → PR en
borrador → verificación con un navegador real (no "a ojo") → el usuario
dice "fusionalo" → deploy automático → el HANDOFF se actualiza en el
mismo PR que el cambio. Cada pieza del método nació de un dolor real (el
lockfile roto parió el CI; el blur fantasma parió la verificación
computada; el miedo a perder contexto entre sesiones parió el HANDOFF).

**Lo aprendido:** el proceso no se elige al principio, se destila de los
golpes. Y hay que escribirlo — el HANDOFF para el estado, y esta bitácora
para la historia — porque el conocimiento que no se escribe se paga dos
veces.

## Capítulo 13 — La confianza se delega por etapas (y el libro aprende a escribirse solo)

Durante ocho PRs el ritual fue idéntico: yo proponía, verificaba y dejaba
el PR en borrador; el usuario decía "fusionalo". Ese checkpoint no era
burocracia — era el período de prueba. Hoy el usuario lo cerró con dos
pedidos en una frase: *fusioná automáticamente, y date cuenta vos solo de
cuándo hay que escribir en la bitácora*.

Lo interesante es lo que hizo posible ese momento: ocho fusiones seguidas
donde lo prometido y lo entregado coincidieron, cada una con verificación
que el usuario podía ver (capturas, checks, CI). La confianza no se pidió
— se acumuló, y cuando alcanzó cierto nivel, la delegación llegó sola.
Quedaron excepciones explícitas (los cambios de visión o alcance siguen
esperando confirmación), porque delegar la ejecución no es delegar el
rumbo.

**Lo aprendido:** la autonomía no se negocia al principio de una relación
de trabajo: se gana con un historial de resultados verificables, y se
otorga por capas — primero la ejecución rutinaria, el rumbo nunca. Y una
segunda lección, sobre este libro: un diario que depende de que alguien
se acuerde de pedirlo, muere; un diario con criterios escritos de *cuándo
hay capítulo* (errores, vueltas, decisiones revertidas, intuiciones que
cambian el rumbo) puede mantenerse solo. Las reglas quedaron en
`CLAUDE.md`, donde cualquier sesión futura las hereda.

## Capítulo 14 — El rediseño se ejecutó (y congelamos el "antes")

Ejecutamos el plan de la mesa de advisors: la home ahora abre con dos
puertas ("Quiero un plan" / "Ya soy de SP · Ver mi red"), las
herramientas suben, el manifiesto quedó en una pantalla — reescrito con
el cliente como protagonista — y su versión cinematográfica completa
vive en `/historia/`, donde la emoción persuade sin cobrar peaje. Los
testimonios inventados salieron (volverán cuando existan de verdad).

Dos detalles del proceso que valen registro. Primero: antes de tocar
nada, **congelamos el home anterior en `/v1/`**, navegable para siempre.
No es nostalgia — es honestidad metodológica: dentro de unos meses, la
memoria va a editar cómo era "el antes"; el snapshot no. Comparar contra
lo real le gana a comparar contra el recuerdo. Segundo: el presupuesto
de peso móvil dejó de ser una intención y se volvió un número medido en
el pipeline — 173 KB comprimidos de contenido crítico, bien abajo del
techo de 300 — y ahora cualquier regresión futura tiene una vara contra
la cual fallar.

**Lo aprendido:** un rediseño no está completo sin tres cosas que no son
diseño — el snapshot del antes (para comparar sin autoengaño), la
medición del después (para que "más liviano" sea un número y no una
sensación), y los eventos nuevos (`puerta_home`, `manifesto_scroll`)
que van a decirnos si la teoría de la mesa de advisors sobrevive al
contacto con usuarios reales. Diseñar es opinar; instrumentar es
permitir que la realidad conteste.

## Capítulo 15 — El idioma del cliente (o: nadie dice "cartilla" en su casa)

Observación del usuario, con su voz: *"la palabra 'cartilla' o 'cartilla
viva' no es una palabra que se usa mucho. Tenemos que insertar algo que
ya se conoce y ya se dice usualmente y la gente entiende fácilmente."*

Tenía razón, y el hallazgo fue más profundo que una palabra: al barrer el
sitio encontramos toda una familia de jerga de seguros que se nos había
colado sin darnos cuenta — "cartilla" (ya renombrada antes), "práctica"
("Escribí una práctica…" — ¿quién le dice 'práctica' a una ecografía?) y
"prestación" (cabecera de la tabla comparativa). Las tres se fueron:
"escribí lo que necesitás", "cobertura", "servicio".

**Lo aprendido:** la jerga es invisible para el que la escribe — nosotros
veníamos leyendo "práctica" hace semanas sin verla, porque en el mundo de
los seguros es normal. El test que quedó como regla permanente: ante cada
palabra visible, preguntarse *¿la dice una familia en su casa?* Si no la
dice, hay otra palabra mejor. Y un corolario: este tipo de hallazgo lo
hace mejor el que mira de afuera (el usuario) que el que construye — otra
razón para mostrar el trabajo seguido y temprano.

## Capítulo 16 — Llegaron los primeros datos reales (y me corrigieron)

El usuario trajo el Google Analytics de la web activa de SP: dos meses de
datos reales, los primeros del proyecto. Confirmaron tres decisiones
tomadas por intuición y teoría: **el 77% del tráfico entra por celular**
(la ponderación móvil no era perfeccionismo), **"Guía para el asegurado"
es la tercera página más visitada** (la puerta 2 del hero atiende una
demanda que ya existía), y la atención media es de **50 segundos**
("resolver en un minuto" es la vara correcta, y cualquier peaje de siete
pantallas estaba condenado por los datos antes que por la mesa de
advisors).

Pero el capítulo se gana su lugar por dos cosas más incómodas. Primera:
la captura inicial (un embudo con "100% de finalización" en cada paso) me
llevó a concluir que "un tercio de los clientes ya usa el canal digital".
Con el informe completo quedó claro que ese embudo se auto-calificaba —
el Login real tuvo 132 usuarios, no 2.900. **Los datos merecen la misma
desconfianza metódica que el código**: un embudo perfecto es tan
sospechoso como un test que nunca falla. Corregido en el mismo día,
gracias a que el usuario trajo más capturas en vez de conformarse.

Segunda: el dato más valioso no confirmaba nada — revelaba. **El 91% de
los usuarios son nuevos: casi nadie vuelve.** El sitio actual no le da a
nadie un motivo de regreso, mientras SP paga tráfico social que aterriza
ahí. Esa cifra (recurrencia ~9%) quedó registrada en el HANDOFF como *la
métrica a vencer* — el día que la guía nueva y el portal existan, este
número es el juez.

**Lo aprendido:** los datos reales hacen tres trabajos — confirman (barato),
corrigen (incómodo pero sano) y revelan lo que nadie preguntó (lo más
valioso). Y una regla de higiene: ante un dashboard, preguntar siempre
cómo se midió antes de creer qué dice.

## Capítulo 17 — El QA integral (o: el instrumento también se audita)

Recorrimos todo el ecosistema como un usuario con mala suerte: 76 links,
el simulador de punta a punta, la guía con búsquedas absurdas, tres
anchos de celular, contraste computado de cada texto, pesos de página y
caza de placeholders. Resultado: cero "roto" — y una docena de arreglos
que nadie había visto porque no dolían: textos grises y verdes que no
cumplían el contraste mínimo para un adulto mayor (el público de SP
Senior, nada menos), botones más chicos que un pulgar, 27 imágenes
cargándose antes de tiempo.

Dos lecciones. La primera repite el capítulo 8 con otro disfraz: **el
primer reporte de la suite traía 34 hallazgos, y un tercio eran mentiras
del instrumento** — el medidor de contraste no sabía componer fondos
translúcidos ni sabía que detrás de un header fijo no está el fondo
blanco del documento. Un QA que no audita sus propias herramientas
fabrica trabajo falso. Depuramos el medidor antes de tocar el producto,
y los 34 quedaron en 7 reales.

La segunda es sobre qué se arregla y qué se decide: los tonos de texto se
oscurecieron un pelo (nadie lo nota, WCAG sí) — eso es un arreglo. Pero
el blanco sobre el teal de marca de los botones falla la norma *y es la
identidad comercial del sitio* — eso no se "arregla" en silencio un
martes: se documenta con opciones y lo decide el dueño de la marca. La
línea entre bug y decisión no la marca la severidad técnica sino quién
tiene que vivir con el cambio.

**Lo aprendido:** el QA no es buscar errores; es separar tres pilas — lo
que se arregla ya, lo que decide otro, y lo que el instrumento inventó.
Y la accesibilidad no era un lujo: era literalmente legibilidad para el
cliente de SP Senior.

## Capítulo 18 — La densidad también es diseño (y el menú aprendió de Apple)

Feedback del usuario, con su voz: *"la experiencia tiene que ser un poco
menos de scroll… siento que es un poco más largo de lo que debería ser…
usar bien los espacios que tenemos"* y, sobre el menú móvil: *"podría ser
algo como la página de Apple o la página de Tesla… si en el header ya
aparece urgencias, quizás al desplegar no hace falta poner urgencias"*.

Tres cambios salieron de ahí. El menú móvil dejó de ser una tarjetita
flotante con filas de colores y pasó a ser un overlay a pantalla completa
de vidrio esmerilado: solo texto grande, entrada escalonada, y **sin
urgencias adentro** — el usuario tenía razón en algo sutil: repetir un
elemento que ya está siempre visible no es refuerzo, es ruido. "Cómo
funciona la contratación" pasó de cuatro tarjetones a un paso-a-paso
compacto (1.068 → 538 px en móvil). Y toda la página hizo dieta de
espacios: **de 14,2 a 11,6 pantallas en móvil (-18%), de 8,9 a 8,1 en
desktop** — medido antes y después, no estimado.

**Lo aprendido:** el aire entre secciones parece elegancia en el monitor
del que diseña y es peaje en el pulgar del que usa (y acá el 77% usa el
pulgar). Segundo: la mejor referencia de diseño no es una tendencia sino
un patrón que el usuario ya ama y sabe nombrar — "como Apple, como
Tesla" es un brief más claro que cualquier documento. Y tercero: medir
la altura de la página por sección convirtió una sensación ("es largo")
en una lista de culpables con números.

## Capítulo 19 — El mejor SEO del prototipo es esconderlo

Los datos reales habían dicho algo claro: Organic Search ya es el canal
número uno de la web activa. La reacción obvia era "hagamos SEO al
prototipo, ya". Y ahí apareció la trampa: **si Google indexa el
prototipo, un cliente real que busque "salud protegida" puede aterrizar
en una demo con precios de referencia** — creería que ese es el precio,
que esa es la web, que eso es lo que firma. Riesgo reputacional puro, y
encima canibalizando al sitio activo que sí vende.

Lo que hicimos fue lo contrario de lo obvio, en las dos direcciones a la
vez: construimos **toda** la infraestructura SEO (robots.txt, sitemap con
las 7 URLs del ecosistema, canonicals por página, Open Graph, JSON-LD de
la organización con teléfono y sedes reales) — y la dejamos **apagada
bajo llave**. Todas las páginas, web y guía, dicen hoy `noindex`; el
robots.txt dice `Disallow: /`. Un solo interruptor
(`NEXT_PUBLIC_INDEXABLE=true` más el dominio) enciende todo el día que se
decida dónde vive esto — sin retrabajo, sin "ahora hay que hacer el SEO".

Hubo un detalle técnico con moraleja: en GitHub Pages, este prototipo
vive en una subcarpeta del dominio (`/sp-prototipo/`), y los buscadores
solo leen el robots.txt de la **raíz** del dominio — donde no podemos
escribir. O sea que nuestro robots.txt, hoy, es decorativo; la defensa
real es la etiqueta `noindex` dentro de cada página. Saber cuál de tus
dos cerraduras funciona de verdad importa más que tener dos cerraduras.

**Lo aprendido:** a veces el trabajo correcto es construir algo y no
encenderlo. La madurez no era "tener SEO" sino separar la
infraestructura (que se construye cuando se entiende el problema) de la
activación (que se decide cuando el negocio está listo). Y la variante
del capítulo 8: no alcanza con poner la protección — hay que saber cuál
de las protecciones está haciendo el trabajo.

## Capítulo 20 — El simulador aprende a escuchar (y el ecosistema deja de prometer)

La brújula la puso el usuario, con su voz: *"lo importante siempre es que
la experiencia se sienta humana, especialmente cuando la persona vaya a
través del simulador, que el simulador también sea como una persona que
le responde, que le ayude a entender lo que está escogiendo, como que le
está acompañando en ese proceso"*. Y una salvedad sabia: *"tenemos que
saber tener un balance con lo funcional"*.

Fuimos a mirar cómo lo hacen los mejores. Lemonade —la aseguradora que
nació conversacional— construyó su cotizador como una charla: una
pregunta por vez, lenguaje llano, y el precio en menos de dos minutos.
La sorpresa fue grata: nuestro simulador ya tenía casi todo eso (una
pregunta por vez, el "por qué te preguntamos esto", el precio antes de
pedir datos). Lo que le faltaba era más fino: **escuchar**. Los mensajes
de aliento eran fijos por paso — decían lo mismo elijas lo que elijas.
Una persona que acompaña no hace eso: responde a *tu* elección. Ahora,
si elegís cuidar a tus padres, el simulador dice "cuidar a los que nos
cuidaron — estamos con vos"; si elegís a toda la familia, "de eso se
trata". Y al final, el cierre promete lo que la marca es: te va a
escribir *una persona, no un robot*.

El mismo día nacieron dos espacios que faltaban. El blog dejó de ser un
cartel de "muy pronto": tres notas reales, escritas en el idioma que
esta bitácora ya defendió a capa y espada (carencia, copago y compañía,
traducidos a idioma de familia). Y "Mi SP" — el espacio del cliente que
el usuario venía pidiendo — ya es una página: lo que funciona hoy
funciona de verdad (ver mi red, WhatsApp, urgencias), y lo que no
existe todavía se muestra como "en camino", con borde punteado y sin
botón. **El portal no finge.**

**Lo aprendido:** humanizar no era rehacer — era afinar. La
infraestructura conversacional ya estaba; lo humano estaba en el detalle
de reaccionar a la elección de la persona. Segundo: contra la tentación
de fingir funcionalidades para que el prototipo "se vea completo", la
honestidad visual (tarjetas punteadas, "en camino") vende mejor: nadie
toca un botón que no anda. Y tercero: cuando el usuario dice "que se
sienta humano", la respuesta técnica correcta casi nunca es un chatbot —
es copy que escucha.

---

*Próxima entrada: cuando fusionemos el siguiente cambio o aprendamos la
siguiente lección — lo que ocurra primero. El ritual: cada PR fusionado
deja su entrada si enseñó algo — detectado automáticamente, sin que nadie
lo pida; las observaciones del usuario entran dictadas ("anotá en la
bitácora: …") con su propia voz.*
