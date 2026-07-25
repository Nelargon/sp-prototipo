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

## Capítulo 21 — El blog aprende a alimentarse solo (y un repo estaba publicando al vacío)

**Qué intentamos.** El usuario pidió automatizar la recolección diaria de
noticias (salud en Paraguay, seguros, datos) y convertirla en contenido de
blog. La primera versión se construyó entera en el repo privado
`sp-interno`: línea editorial, plantillas, dos Routines programadas (digest
diario a las 02:00, borradores semanales los lunes) y hasta una sección
`/blog` propia en su copia del sitio.

**Qué pasó.** Al traer `sp-prototipo` a la misma sesión apareció el
problema: `sp-interno` tenía un `deploy.yml` copiado literal de acá —
mismo basePath `/sp-prototipo` — pero siendo otro repo, publicaba (si
acaso) a otra URL con todos los links rotos. Publicar un post ahí jamás
habría tocado el sitio real. Además, los dos repos tenían *dos blogs
distintos*: este con 3 notas JSX escritas a mano, aquel con un motor
markdown automatizable. Dos forks del mismo sitio, cada uno con la mitad
buena.

La fusión tomó lo mejor de ambos: el motor markdown vino acá (donde vive
la URL real) y adoptó el diseño de lectura existente — `Articulo.jsx`
quedó como layout, las 3 notas JSX se convirtieron a markdown conservando
sus URLs, y el índice y el sitemap se generan solos desde
`contenido/blog/publicados/`. La cocina editorial (línea editorial,
digests, borradores crudos) se quedó en el repo privado, que deja de ser
fork del sitio. Publicar = copiar un markdown aprobado, vía PR. De paso,
dos notas nuevas del pipeline estrenaron el sistema — con "cartilla"
corregida antes de publicar, porque la regla de lenguaje también aplica a
los robots.

**Qué aprendimos.** Primero: un workflow copiado entre repos es una
promesa rota en silencio — publicaba al vacío y nadie lo veía; cuando un
repo se bifurca, lo primero que hay que auditar es adónde apunta su
deploy. Segundo: la arquitectura sana no fue elegir un repo ganador sino
darle a cada uno un rol nítido — el público es el producto, el privado es
la cocina; la conexión entre ambos no es técnica, es el gesto humano de
publicar. Tercero: el contenido en markdown es el único activo que
sobrevive a cualquier decisión de plataforma futura (WordPress, HubSpot o
lo que BuenaVista decida) — el código del blog es reemplazable; la
biblioteca de notas, no.

---

## Capítulo 22 — Gilroy es para mirar, no para leer

**Qué intentamos.** El blog fusionado salió al aire con todo el texto en
Gilroy, como el resto del sitio.

**Qué pasó.** El usuario lo leyó y lo dijo sin vueltas: *"el diseño del
cuerpo debería estar en vez de Gilroy, algo más leíble, por favor, porque
Gilroy me cuesta muchísimo leer para un blog"*. Y tenía razón dos veces:
primero porque una geométrica display cansa en lectura larga, y segundo
porque la propia identidad SP (decisión #2 de este mismo HANDOFF) siempre
dijo "Gilroy para títulos, **Inter para cuerpo**" — el prototipo había
derivado a Gilroy-para-todo sin que nadie lo decidiera. Se auto-hospedó
Inter variable (OFL, mismo mecanismo next/font que Gilroy) y el cuerpo de
las notas — párrafos, listas, copete, callouts y nota final — pasó a Inter
17px/1.8; los títulos siguen en Gilroy, que es donde brilla.

**Qué aprendimos.** Una tipografía display vende el titular pero cobra
peaje en el párrafo: si un texto de 800 palabras "cuesta leer", el
problema no es el lector. Y otra vez la lección del minificador al revés:
la deriva silenciosa también pasa en diseño — la espec decía Inter y nadie
lo notó hasta que dolió. Cuando el usuario dice "me cuesta", eso es un
dato de QA, no una opinión.

## Capítulo 23 — La sesión que leyó una foto vieja

El proyecto llegó a un punto que nadie planeó explícitamente: **varias
sesiones de Claude trabajando en paralelo**, cada una en lo suyo — una en
la web, otra en el blog, otra en la tipografía. El mismo día en que
celebrábamos esa velocidad, apareció el costo. El usuario abrió una
sesión nueva, le pidió "leé el HANDOFF", y la sesión respondió con
seguridad total que el master orquestador y el motor de contenido "no
están registrados en ninguna parte" — cuando habían quedado escritos en
el HANDOFF *esa misma mañana*, con guarda y todo.

¿Mintió el documento? No. Mintió la foto. Cada sesión clona el repo en el
momento en que arranca su contenedor; esa sesión había nacido antes de
los últimos merges y leyó, con total honestidad, un HANDOFF de horas
atrás. En un proyecto de una sola sesión eso jamás duele. Con cinco PRs
fusionados en un día por manos distintas, la foto vieja se vuelve una
máquina de contradicciones: sesiones que reportan pendientes ya
resueltos, o peor, que construyen algo que otra ya construyó distinto —
también pasó hoy: dos versiones del blog nacieron en paralelo y hubo que
reconciliarlas sobre la marcha.

La solución es de una línea y ahora es la **regla cero** del proyecto:
antes de leer cualquier documento o empezar cualquier trabajo,
actualizarse (`git pull`). La memoria compartida solo funciona si todos
leen la última página, no la que quedó abierta cuando entraron.

**Lo aprendido:** cuando un equipo pasa de uno a varios — sean personas
o sesiones de IA — el primer bug no es de código: es de sincronización.
Y la confianza de una respuesta no dice nada sobre la frescura de sus
datos: la sesión que negó el orquestador no estaba rota, estaba
desactualizada. Preguntarse "¿estoy leyendo la última versión?" antes que
"¿qué dice el documento?" — en ese orden.

---

## Capítulo 24 — El feedback que nos encontró violando nuestra propia regla

El usuario trajo un feedback externo sobre la web — el mejor que recibió
el prototipo hasta ahora. La señal más valiosa no fue ningún hallazgo
puntual sino la lectura estratégica final: "la guía consigue recurrencia,
el simulador conversión, la portada conduce". Es exactamente la tesis del
HANDOFF, reconstruida por alguien que nunca leyó nuestros documentos.
Cuando un lector externo llega solo a tu tesis, la arquitectura comunica.

Pero el hallazgo que dolió (y enseñó) fue otro: la etiqueta **"No
incluida"** en el comparador de la home. La decisión #7 del proyecto dice
desde hace meses "nunca 'No cubierto', la ausencia se comunica como
oportunidad (dorado)" — y la guía la cumple religiosamente con su "Desde
SP X". El comparador de la home, escrito antes de que la regla madurara,
quedó violándola a la vista de todos. Nadie de adentro lo vio; el de
afuera lo vio en una pasada. Se corrigió con la solución que la guía ya
tenía: "Desde SP Integral", en dorado.

Del mismo feedback salió la disciplina de cifras: solo sobreviven los
números confirmados por el usuario. Vidas (~19.000) es real y se queda;
contratos (~9.100) no estaba confirmado y salió; prestadores espera la
confirmación del +800 antes de tocar el "más de 50" actual (que es
verdadero pero se queda corto); y los años dejaron de ser un número
escrito a mano — se calculan desde la fundación (agosto de 2002) en cada
build, así no pueden envejecer. Y el bloque de cédula de la guía ganó su
etiqueta visible de "Demostración": el mismo principio de Mi SP — el
prototipo no finge integraciones que no existen.

Lo que el feedback propuso y quedó en pausa, a propósito: acortar la
portada, decir la categoría más rápido en el hero, una sola acción
dominante y fusionar la intro del simulador. Todo eso lo decide el test
de 5 segundos con 5 personas que el usuario va a correr — evidencia antes
que opinión, y los datos de GA ya defendieron una vez la puerta 2.

**Lo aprendido:** las reglas propias también necesitan auditoría — una
regla que nace después del código deja huérfanos atrás, y quien mejor los
encuentra es un ojo externo que no sabe cuáles son las reglas. Segundo:
toda cifra pública es una promesa; la que no está confirmada se marca o
se va, y la que puede calcularse sola (los años) nunca debería escribirse
a mano. Tercero: el elogio más útil no es "está lindo" — es que un
extraño reconstruya tu estrategia sin haberla leído.

---

## Capítulo 25 — La web deja de inventar precios

Llegó el día que el proyecto esperaba desde el principio: el usuario
pasó los cuadernillos y tarifarios **reales** de los cuatro planes
vigentes — Vital (senior 65+), Bronce, Silver y Gold — y decidió que
van a la web como contenido temporal, hasta que la mesa técnica defina
los planes nuevos. Con dos reglas suyas: fuera la palabra "Privilege"
(queda "Plan Bronce"), y nada de logos ni colores de los cuadernillos —
Gilroy y colores de sentido común por metal.

Lo primero que hicimos con el tarifario no fue diseñar: fue **escribir
un test**. Cada PDF de precios trae una tabla "GRUPOS" con siete
combinaciones resueltas (titular solo, pareja, familia con 1/2/3
hijos…). Reconstruimos las reglas del tarifario — tarifa de titular
solo, tarifa titular/cónyuge en cuanto hay más de una persona,
adherentes por edad, prima de grupo familiar, hijo adicional desde el
3º — y recién nos dimos por satisfechos cuando el motor reprodujo
**los 21 ejemplos exactos, guaraní por guaraní**. Los ejemplos del
tarifario resultaron ser la mejor suite de tests que este proyecto
tuvo jamás: escritos por la propia empresa, sin ambigüedad.

Los datos reales, además, **simplificaron el producto**. El simulador
tenía un paso de "zona" que cambiaba el precio y un paso de
"coberturas adicionales" — los dos eran ficción de prototipo: el
tarifario real es nacional y los planes vigentes no tienen extras. Al
tocar datos verdaderos, dos pasos inventados se convirtieron en uno
informativo ("tu precio es el mismo en todo el país" — que además es
un buen argumento comercial) y uno eliminado. El simulador quedó de
4 pasos: la honestidad acortó el embudo.

Y una simetría que nadie planeó: la regla de tono #7 ("la ausencia se
comunica como oportunidad, en dorado") era hasta ayer una convención
estética. Hoy es un hecho: la resonancia **de verdad** no está cubierta
en Bronce y **de verdad** se suma al 100% desde Silver. La etiqueta
dorada "Desde Plan Silver" dejó de ser una promesa de diseño y pasó a
ser una cláusula del cuadernillo.

**Lo aprendido:** cuando el dato real llega, lo primero es buscarle los
ejemplos resueltos y convertirlos en tests — el modelo se valida contra
la fuente, no contra la intuición. Segundo: los datos reales no solo
corrigen números, corrigen *estructura* — pasos enteros del producto
eran artefactos de no tener datos. Y tercero: guardar la fuente
estructurada (`datos/planes-vigentes/*.json`) separada de la
presentación pagó en horas — el mismo JSON alimentó motor, comparador
y guía sin releer los PDFs.

---

## Capítulo 26 — El simulador entra en la pantalla (y el tilde vuelve al centro)

El usuario abrió el simulador en su iPhone y vio lo que ninguna
verificación nuestra había visto: *"en varias fases todavía no encaja
bien con la versión móvil, se requiere de scroll para ver todo"*. Y una
segunda observación al pasar: *"el ícono de check no figura bien"*.

Antes de proponer nada, medimos. Los números fueron elocuentes: en un
iPhone de 844px de alto, la primera opción del paso 1 aparecía en
y=783 — el usuario aterrizaba viendo todo *menos* las respuestas — y en
el paso 2 directamente en y=890, bajo el pliegue. Peor: al elegir una
opción, el scroll quedaba donde estaba (medimos scrollY=528 arrastrado
entre pasos); que el paso siguiente se viera bien era suerte de
geometría, no diseño. Y en los in-app browsers de Instagram/Facebook —
justo donde aterriza el Paid Social — hay 150-200px menos.

La cura fue en tres movimientos: **auto-scroll** al inicio de la
tarjeta en cada cambio de paso (la corrección más importante: pocas
líneas, garantiza que cada pregunta arranque desde arriba), **dieta del
preámbulo** ("¿por qué te preguntamos esto?" plegado en un `<details>`
nativo, paddings comprimidos en móvil), y el **resultado en dos actos**:
precio y formulario juntos en el primer pantallazo, y "¿cómo calculamos
esto?", descargar y compartir en el segundo. Después del cambio, el
paso 1 completo — pregunta, cuatro opciones y respiro — entra en una
sola pantalla.

El tilde tenía otra historia. El ícono del "match" se centraba con
`transform: translate(-50%,-50%)`… y su animación de entrada animaba
`transform: scale()`. Una animación CSS con fill-mode **pisa la
propiedad transform completa**, translate incluido: el tilde terminaba
descentrado, montado sobre el aro, pareciendo un círculo roto. La
solución no fue meter el translate en los keyframes (más funciones
encadenadas, la familia de trucos que el minificador ya nos rompió una
vez): fue quitarle al transform la responsabilidad de centrar — ahora
centra un flexbox y la animación solo escala.

Y para que nada de esto regrese, el QA integral ganó dos guardianes
nuevos: un **presupuesto de geometría** (en 390×670, la primera opción
de cada paso debe verse sin scroll) y la verificación **computada** de
que el tilde queda centrado en su aro (±2px).

**Lo aprendido:** el dispositivo real del usuario ve lo que el headless
no mira — nuestras verificaciones comprobaban *que* los elementos
existían, no *dónde* caían; ahora el "dónde" también tiene presupuesto.
Segundo: animar `transform` pisa todo el transform — si un elemento se
centra con translate, su animación no puede tocar esa propiedad; mejor
aún, que el centrado no dependa de transform. Y tercero: la regla de la
casa se confirma una vez más — verificá lo computado, no el código que
creés haber escrito.

---

## Capítulo 27 — Las reglas para no pisarse (la otra mitad de la regla cero)

El capítulo 23 resolvió la mitad del problema de trabajar con varias
sesiones a la vez: la **lectura** (actualizarse antes de leer, o
terminás reportando un proyecto que ya no existe). Hoy el usuario trajo
la otra mitad. Con dos sesiones corriendo desde ayer — una sobre el
cerebro del motor de contenido, otra sobre el sistema del blog —
preguntó: *"¿Hay algo que se pueda dejar claro en el repo para evitar
cualquier problema, no solo para este caso, sino para otros en el
futuro?"*.

Qué intentamos: destilar en `CLAUDE.md` un protocolo de **escritura** en
paralelo, para que valga para cualquier combinación de sesiones y no
solo para las dos de hoy. Qué pasó: al revisar los golpes ya anotados,
el protocolo casi se escribió solo — cada regla ya tenía su cicatriz.
"Una rama por sesión" (el push pisado), "integrar, nunca descartar, en
conflictos de HANDOFF/BITACORA" (los dos blogs que nacieron en paralelo
y hubo que reconciliar, cap. 21 y 23), "respetar las guardas ⚠" (el
motor de contenido que ninguna sesión debe construir mientras el usuario
lo diseña en otra conversación).

Qué aprendimos: dos cosas. Primera, que git ya resolvió este problema
hace veinte años para equipos de personas, y las sesiones de IA no
necesitan reglas nuevas — necesitan las mismas: rama propia, territorio
declarado, integrar antes de fusionar. Segunda, la ironía fundacional
del protocolo: **las reglas escritas en el repo solo protegen a las
sesiones que se actualizan para leerlas**. Las dos sesiones que ya
están corriendo nacieron antes de este capítulo; a ellas hay que
avisarles a mano ("traé main y releé CLAUDE.md"). La memoria compartida
funciona — pero solo para quien lee la última página, y eso incluye a
las reglas mismas.

---

## Capítulo 28 — El cerebro se diseñó antes que la casa (y la mudanza fue con las ollas hirviendo)

**Qué intentamos.** Construir el motor de contenido universal — la
guarda ⚠ que este propio libro defendió durante cuatro días. Pero al
revés de como se construye casi todo: primero el usuario diseñó el
cerebro en un pimpón de 9 temas (alcance, audiencias, voz, entradas,
circuito humano, documentos, orquestador, medición, terreno vedado) —
cada tema con recomendación, porqué, y cierre explícito antes de pasar
al siguiente — y recién con el `CEREBRO-motor-de-contenido.md` aprobado
y el "construí" dicho con todas las letras, se creó la casa: el repo
privado `sp-contenido`.

**Qué pasó.** Dos cosas que valen capítulo. La primera: mientras la
sesión constructora armaba el repo nuevo, la Routine de borradores
semanales — que nadie detuvo, a propósito, por la regla de corte
("ninguna obrera se desactiva hasta verificar su reemplazo") — dejó sus
3 borradores del lunes en la cocina vieja. Uno de ellos, "Vivimos 14
años más" (educación con fuentes INE/Banco Mundial), resultó el estreno
perfecto del flujo completo hasta el PR de publicación; otro, "Cómo
funciona la cobertura de medicamentos", era 🔴 de cobertura y estrenó
la regla de parking **el mismo día en que la regla se escribió**: quedó
terminado y estacionado, esperando un validador de Producto que todavía
no tiene nombre. La cola de rojos — el caso de negocio para pedirle
validadores a Gerencia — se escribió sola antes de que terminara la
construcción. La segunda: la guarda ⚠ funcionó exactamente como se
diseñó — cuatro días protegiendo a todas las sesiones paralelas de
construir antes de tiempo, y se levantó en el mismo PR que anuncia lo
construido.

**Qué aprendimos.** Diseñar el cerebro antes que las carpetas no fue
burocracia: fue lo que permitió que la construcción entera cupiera en
una sesión sin una sola decisión improvisada — cada archivo del repo
nuevo es una frase del pimpón. Y la mudanza con la fábrica encendida
(las Routines viejas siguen corriendo hasta que las nuevas prueben que
funcionan) confirmó la lección del capítulo 13: la confianza se delega
por etapas — también entre robots.

---

## Capítulo 29 — La tipografía que no podíamos pagar

**Qué intentamos.** Nada — esta vez el cambio vino de afuera. El usuario
avisó: "cambiamos la tipografía a Nunito Sans, porque Gilroy no podemos
pagar la licencia anual". Gilroy era la display de la identidad desde el
primer día (decisión #2), pero era una fuente comercial; Nunito Sans es
libre (SIL OFL), con un dibujo redondeado que hasta le queda bien a una
marca que se define "cercana".

**Qué pasó.** El reemplazo fue 1:1 a propósito: mismos pesos, mismas
reglas, cero reforma de diseño. La variable CSS pasó de `--font-gilroy` a
`--font-display` — un nombre semántico, así el próximo cambio de fuente
(si lo hay) no obliga a renombrar nada. Los TTF de Gilroy se borraron del
repo (eran, además, el riesgo legal), la guía recibió sus propios TTF de
Nunito Sans en el mismo formato que consume la empresa desarrolladora, y
la web usa el subset latin del variable woff2 (50 KB, alfabeto español
completo). Pero al correr el QA integral apareció una regresión que nadie
tocó: **scroll horizontal de 7px en el simulador a 360px**. El culpable:
"Prefiero escribir por WhatsApp", un botón con `white-space:nowrap` que
entraba justo con Gilroy — y Nunito Sans dibuja las mismas letras unos
píxeles más anchas.

**Qué aprendimos.** Un cambio de fuente es un cambio de layout: la
métrica tipográfica participa de todos los anchos, y cada `nowrap` que
"entraba justo" es una promesa hecha con la fuente vieja. La regla quedó
en `CLAUDE.md`: después de cambiar una tipografía, el QA responsive se
corre entero, aunque "solo se cambió la fuente". Y la de siempre, otra
vez: lo agarró el QA computado, no el ojo.

---

## Capítulo 30 — La conversión no era rediseñar: era la última milla

**Qué intentamos.** El usuario pidió auditar la página con ojos de
conversión: "las personas no leen, escanean" — y que la web tenga una
dirección definida, no solo información. La auditoría (build local,
recorrida completa en 390px y 1440px con capturas por pantalla) llegó a
la misma tesis que el feedback externo de julio: la arquitectura ya
convierte; lo que faltaba era fricción de última milla.

**Qué pasó.** Se ejecutó la primera ola, aprobada por el usuario, sin
tocar lo que espera el test de 5 segundos: (a) el mismo botón tenía
**cinco nombres** ("Calcular mi plan", "Simulá tu plan", "Simular mi
plan", "Cotizá tu plan", "Empecemos") — quedó un solo verbo, "Simulá tu
plan", y el BRANDSCRIPT se actualizó para que el guion mande; (b) el
botón "Consultar este plan" del comparador abría WhatsApp con un mensaje
**genérico** — ahora prellena el plan elegido, y la FAQ prellena su tema
(la salvaguarda de Galperin era letra escrita que el código no cumplía);
(c) la FAQ respondía y no ofrecía el paso siguiente — quien abre
"¿cubren preexistencias?" es un lead caliente y ahora tiene su link; (d)
los **dos botones flotantes** de móvil tapaban texto en la banda Senior,
el manifiesto, los diferenciadores y el footer — los reemplazó una barra
fija en el borde inferior (zona del pulgar) con guardián computado en el
QA; y (e) el precio ancla entró a la pantalla 1 ("planes desde
₲ 238.000", calculado de `plans()`, nunca escrito a mano). El punto de
los logos de aliados en gris se propuso y el usuario lo descartó — queda
como está. De paso, el simulador desktop dejó de flotar chico en un
océano navy: fondo continuo, tarjeta de 920px y una intro que llena su
vacío con datos útiles.

**Qué aprendimos.** Primero: los elementos flotantes se auditan contra el
contenido que tapan, no mirándolos a ellos — un FAB "chico" es una columna
permanente que se come el 15% de cada pantalla de lectura. Segundo: la
consistencia del CTA es escaneo puro — cada verbo nuevo para la misma
acción es una decisión más que le pedimos a alguien que no lee. Tercero:
cuando dos auditorías independientes (la externa de julio y esta) llegan
a los mismos cuatro puntos pausados, el test de 5 segundos dejó de ser
opcional: es la llave que ya tiene dos cerraduras esperándola. Y una
técnica: con `scroll-behavior:smooth`, medir después de un
`window.scrollTo()` es medir a mitad de viaje — los guardianes scrollean
con `behavior:'instant'`.

---

## Capítulo 31 — Filadelfia, o el paso que preguntaba mal

**Qué intentamos.** El usuario trajo una intuición: "en vez de hacer que
la persona escoja interior, central o todo el país, quizás tenemos que
preguntarle **dónde** quiere la cobertura". Propusimos tres opciones
(tarjetas por departamento, buscador de ciudades, mapa tocable) y él
sumó la pieza que faltaba: la transcripción de la reunión semanal de
MKT y Ventas en tl;dv.

**Qué pasó.** La reunión cambió el problema. No era UX: era inteligencia
de mercado. Una venta real se perdió en Filadelfia — familia interesada,
sin red en su ciudad, "yo vivo acá y necesito acá" — y la pérdida se
registró como "fuera de zona de cobertura" **sin la ciudad**. Del
interior "hay muchísimos" leads así, y la estrategia a 3 años del
usuario pone la zona como dimensión del precio ("si quiere Ciudad del
Este, Ciudad del Este tiene su precio"). Con eso, el buscador de
ciudades dejó de ser la opción recomendada para ser la única que
resolvía el problema: la gente sabe decir su ciudad, el negocio necesita
demanda por ciudad, y la web ya dominaba el patrón (el buscador único de
la guía). Se construyó en una sesión: `app/geo.js` (18 departamentos,
~97 ciudades, aliases y acentos tolerados), eventos `sim_zona` y
`sim_zona_sin_lista`, motor price-ready con ajuste por departamento
neutro, y la regla de honestidad: sin cobertura **nunca bloquea** — la
persona de Filadelfia ve su precio, una nota honesta ("la red está
creciendo — tu pedido nos ayuda a priorizarla") y su pedido queda
contado para el caso al directorio.

**Qué aprendimos.** Primero: cuando una pregunta del formulario no le
sirve a nadie — ni al que responde (no cambiaba su precio) ni al que
pregunta (no registraba nada útil) — no se optimiza: se reemplaza por la
pregunta que ambos necesitan. Segundo: la fuente del rediseño no fue un
benchmark sino una venta perdida con nombre de ciudad — las
transcripciones de reuniones son material de diseño, no solo actas.
Tercero: el mismo dato vale doble si se recolecta igual en los dos
embudos (web por `sim_zona`, ventas por HubSpot): dos fuentes, una sola
bolsa de demanda por ciudad para Convenios y el directorio.

---

## Capítulo 32 — El link que destapó un desborde viejo

**Qué intentamos.** La segunda ola de auditoría (estratégica, 22 jul
2026) pidió darle al afiliado una puerta persistente en desktop: "Mi SP"
solo vivía en el hero y el menú móvil, así que apenas se scrolleaba, el
cliente actual —la prioridad de retención— se quedaba sin camino. El
arreglo parecía de una línea: sumar "Mi SP" como link del nav.

**Qué pasó.** Al medir la geometría (no el código), el nav desbordaba a
960px: "Mi SP" envolvía a dos líneas y el CTA "Simulá tu plan" quedaba
cortado fuera de pantalla. Pero el cálculo mostró algo peor: el nav
completo necesita ~1171px, y el corte al hamburguesa estaba en 860px. O
sea, **el nav ya venía cortando el "Simulá tu plan" en cualquier pantalla
de 861 a 1145px — un bug que estaba en producción y nadie había visto.**
El link nuevo no rompió nada: destapó lo que ya estaba roto. Se subió el
corte al hamburguesa a 1200px (el hamburguesa ya tiene todo, Mi SP
incluida) y se verificó sin desborde ≥1200 en 1200/1280/1440/1680.

**Qué aprendimos.** Dos cosas. Primero, la de siempre pero que siempre
vuelve: **el bug no estaba en el diff, estaba en lo computado.** Agregar
un ítem a un contenedor que se ve "holgado" a pantalla completa puede
revelar que ya desbordaba en la franja de anchos que uno nunca abre.
Cada vez que se suma algo a una barra de ancho fijo, se mide la
geometría en la franja incómoda (861–1199), no solo en el monitor
grande. Segundo, más de fondo: un nav que necesita 1200px para entrar es
un nav sobrecargado — el corte no fue una decisión de diseño sino la
factura de haber apilado cinco links + dos CTA + urgencias. La próxima
poda del header ya tiene su primer argumento.

---

## Capítulo 33 — El resumen no es la fuente

**Qué intentamos.** La auditoría había dejado una pregunta abierta con
etiqueta "requiere validación": ¿la web sobrepromete al decir
"telemedicina garantizada por contrato" y "laboratorio a domicilio"? El
resumen curado que teníamos en el repo (`bronce.json`) no las mencionaba,
pero un resumen que no menciona algo no prueba que no exista — podía estar
incompleto. El usuario pasó la grilla oficial completa (`.xlsx`, 8 hojas,
~950 ítems de los tres planes) y pidió incorporarla al git.

**Qué pasó.** Con la fuente completa en la mano, la búsqueda fue
concluyente: en las 8 hojas **no aparece "telemedicina" en ningún lado**
(los únicos "video" son *Videolaparoscopía*, una técnica quirúrgica) ni
"laboratorio a domicilio". Sí existe "consulta médica a domicilio" (2/3/4
eventos por año). O sea, el Crítico de la auditoría quedó **confirmado con
la fuente**, no con el resumen. Y de yapa, al cotejar celda por celda,
salió que los resúmenes del comparador (`cart()`) podrían no coincidir con
la grilla en categorías multi-fila (resonancia y TAC tienen decenas de
filas con CT/COP/AD distintos) — quedó anotado para revisar antes de tocar
el sitio.

**Qué aprendimos.** Para un chequeo de sobrepromesa, **verificá contra la
fuente completa, no contra el resumen** — el resumen es una vista con
pérdida, y lo que no dice puede ser omisión, no ausencia. La grilla cruda
(el `.xlsx` y su transcripción JSON diffeable) es ahora la fuente de
verdad de coberturas; los `*.json` curados por plan son una vista cómoda,
pero cuando el detalle importa (una cláusula, un copago, una carencia) se
va a la grilla. Corolario del método: cuando entra material nuevo del
negocio, primero se incorpora fiel y verificado (precios cotejados 3/3
contra el motor), y recién después se decide qué mostrar — ingerir y
mostrar son dos pasos, no uno.

---

## Capítulo 34 — "Arancel diferenciado" es decir "sin cobertura" con saco y corbata

**Qué pasó.** Con la grilla ya en el repo, el usuario puso el dedo en una
palabra: *«"Arancel diferenciado" es una forma elegante de decir sin
cobertura. No hay que eliminar esas determinaciones, pero en pos de la
claridad tenemos que ayudar siempre a dar claridad con esa clase de cosas.
Y tengo que entender cuál es la razón de ese arancel diferencial.»*

**Qué encontramos al mirar el dato.** Tres cosas cambiaron el mapa. Una:
la exclusión *total* (AD en los tres planes) es corta — 13 ítems, casi
todos técnicas de contraste en desuso + "Depilación"; lo que pesa de
verdad son categorías enteras (odontología, bariátrica, oncología-
tratamiento). Dos: la sorpresa más grande **no es el AD sino el copago** —
300 ítems en Bronce donde pagás la mitad y creés que está cubierto. Tres:
hay una pista de que AD = *precio de convenio* (no precio de mercado), que
de confirmarse convierte "sin cobertura" en "no cubierto, pero a precio SP".

**Qué aprendimos.** Dos ideas. Primera, del usuario: **la claridad no es
mostrar todo ni esconder todo — es traducir la jerga que suena a beneficio
y significa bolsillo propio** (AD, COP), y explicar el *por qué*, que es el
nivel más alto de transparencia. Segunda, de método: una etiqueta única
("AD") tapaba dos cosas distintas —exclusión real vs. cobertura-desde-un-
plan-superior— y sin abrir el dato no se veía; el gris de la "letra chica"
casi nunca es un solo color. El análisis quedó en
`datos/planes-vigentes/ANALISIS-arancel-diferenciado.md` — insumo de
estrategia, todavía no copy de web.

---

## Capítulo 35 — La consulta era la cereza, no el arranque

**Qué pasó.** Mirando el comparador, el usuario notó algo que la auditoría
había rozado sin afilar: el botón "Consultar este plan" saltaba a un
WhatsApp frío. Su reencuadre, textual: *"cuando uno quiere consultar el
plan, prácticamente que sea la cereza sobre la torta. Que no sea toda otra
vez el proceso doloroso de entender si ese plan le conviene. O que la
persona también sea sold on the idea of getting insurance."*

**Qué aprendimos.** Dos ideas que van a volver. Primera: **un handoff no es
un cierre.** Mandar a la persona a WhatsApp desde una tabla la deja MÁS
lejos, no más cerca — el asesor tiene que redescubrir todo, y ella siente
que vuelve a empezar. El cierre bueno llega cuando la persona ya vio su
precio y ya decidió; ahí el asesor confirma, no descubre. Por eso el
comparador ahora entra al simulador con el plan puesto (`?plan=`), saltea
la pregunta "¿qué plan?" y muestra el precio para su familia antes de
hablar con nadie. Segunda, del guion de marca: **la solución no era sacar
WhatsApp** —en salud se vende la cita, no el carrito— sino que la persona
**llegue caliente**. El WhatsApp quedó, pero de cierre, con el plan puesto,
y detrás del "dejá tu dato y un asesor te escribe".

**Un detalle de método (dos golpes de test que no eran bugs).** Verificando
el flujo nuevo, cuatro checks "fallaron" y ninguno era real: el contador
"Paso X de 3" es solo móvil (en desktop lo reemplaza el checklist del
costado), y el rótulo "Tu plan elegido" lleva `text-transform:uppercase`,
así que el `innerText` de Chrome lo devuelve en MAYÚSCULAS y un match
sensible a mayúsculas no lo encuentra. Moraleja que ya conocíamos y volvió:
**cuando el test falla, sospechá del test tanto como del código** —
verificá el viewport correcto y que la comparación no se rompa por una
transformación de CSS.

---

## Capítulo 36 — La tarjeta que prometía lo que el contrato no decía

**Qué intentamos.** Retomar el Crítico #1 de la Parte 2: el bloque del home
"Lo que casi nadie te garantiza" —el mismo que jura "quedan escritas en tu
plan"— encabezaba con "Telemedicina **garantizada por contrato**" y "Médico
y **laboratorio a domicilio**". El resumen del repo (la grilla de 8 hojas)
ya avisaba que ninguna de las dos aparecía. En vez de reetiquetar por
inferencia, fuimos a la fuente: leímos los cuatro cuadernillos SP
(Bronce/Silver/Gold + Vital) en el Drive.

**Qué pasó.** El contrato confirmó lo peor y sumó una sorpresa. Telemedicina:
**cero menciones** en los cuatro planes (el único "video" es
*videolaparoscopía*, una técnica quirúrgica — un falso amigo perfecto).
Laboratorio a domicilio: **no existe**; los labs son siempre en laboratorio
habilitado, y de yapa **la enfermería a domicilio está EXCLUIDA** (cláusula
2.9.2, "a cargo del beneficiario"). Lo que sí está, con número y todo:
**consulta médica a domicilio** (2/3/4 eventos al año según plan, secc.
2.9.1.5, vigencia inmediata) y **salud mental** en Privilege (3/5/6 sesiones)
— pero **Vital no la incluye** (arancel preferencial). O sea: la enfermedad
que la web venía a curar —prometer de más— vivía justo en el bloque que decía
"esto lo ponemos por escrito".

**Qué aprendimos.** Tres cosas. Primera, la más incómoda: **el bloque que más
promete es el que más hay que auditar.** Un kicker que dice "Lo que ponemos
por escrito" es un cheque que alguien puede querer cobrar; si no está en el
contrato, no se firma. Segunda: **cuando el dato no alcanza, andá a la fuente,
no al resumen.** La grilla decía "no aparece"; el cuadernillo lo confirmó Y
agregó la exclusión de enfermería que la grilla no mostraba — el resumen es un
mapa, no el territorio (eco del cap. 33). Tercera, la salida no fue tapar el
agujero sino darlo vuelta: la tarjeta de telemedicina se volvió **"Sin letra
chica"** — "ves qué cubre y qué pagás aparte antes de firmar". Donde había una
promesa que el contrato desmentía, ahora está la única promesa que el contrato
**sí** puede sostener: la de mostrar la verdad. El diferenciador más honesto
era la honestidad.

**Un detalle de método.** La verificación la hizo una sub-sesión leyendo los
PDF completos y devolviendo citas textuales por plan; el hilo principal no se
llenó con cientos de páginas de cuadernillo. Cuando la fuente es enorme y solo
querés el veredicto, delegá la lectura y quedate con la cita.

---

## Capítulo 37 — Explicar lo que no se cubre (sin pintar de rojo la verdad)

**Qué intentamos.** Después de sacar las promesas falsas (cap. 36), el paso
natural: que el sitio diga, de frente, lo que el plan NO cubre y lo que ponés
de tu bolsillo. Lo pedían dos frentes a la vez: el pendiente #2 del HANDOFF y
—el mismo día— la reunión con los departamentos, donde Arturo lo puso en una
frase: *"no somos transparentes hoy como empresa… si quiere Bronce, que sepa en
qué se está metiendo"*. Y Visaciones desnudó el truco del lenguaje: *"hacer
'preferencial' o 'diferencial' es la misma cosa que no te cubrimos, se lo lleva
a cargo el asegurado"*.

**Qué pasó.** El desafío no era el dato —ya estaba en la grilla— sino el TONO.
La regla del proyecto dice "nunca rojo, nunca 'No cubierto' a secas". ¿Cómo
mostrás la ausencia sin asustar? La respuesta la dio el propio contrato: AD no
es "andá a pagar lo que sea", es "no cubierto, pero al precio de convenio de SP"
(cláusula 2.10). Eso convierte una mala noticia desnuda en una verdad completa.
Entonces el bloque entero se pintó de gris, no de rojo: tres modos en criollo
(Cubierto / Copago / Al precio de convenio), la cobertura real por plan
(45→66→93, donde el gradiente mismo es el argumento de subir de plan), y las
exclusiones de verdad dichas planas ("mejor saberlo hoy que en la sala de
espera").

**Qué aprendimos.** Dos cosas. Primera: **la transparencia no es mostrar lo
malo, es mostrar lo completo.** "Sin cobertura" asusta; "no cubierto, y esto sí
podés hacer" da tranquilidad — es la misma información con el final puesto. La
honestidad bien hecha vende. Segunda, un recordatorio de oficio: el número más
honesto puede fallar el contraste. El footnote gris claro (#8a8a8a) sobre el
panel casi-blanco daba 3,2:1 — lo cazó el QA. Bajarlo a #666 lo arregló. De
nada sirve la claridad del mensaje si la claridad del pixel no acompaña.

---

## Capítulo 38 — Menos planes en la web que en la realidad (a propósito)

**Qué pasó.** Preguntando por los "nuevos planes" que la reunión había
mencionado, Arturo aclaró algo que cambia el alcance: SP no tiene cuatro
planes, tiene muchos —"miles de otros planes", formas traslapadas de los
mismos—. Y su decisión fue tajante: en la web, solo Bronce, Silver y Gold.
Textual: *"la idea es simplificarlo… si pongo los otros planes son más
confusos otra vez, porque son como formas traslapadas de los planes que ya
tenemos… no tiene sentido trabajar todos los planes que realmente existen"*.
Los nuevos —Esencial, Integral, Premium— son las versiones mejoradas de esos
tres y llegan en dos o tres meses.

**Qué aprendimos.** La web no es un espejo del backend, es un filtro. El
instinto de ingeniería es modelar toda la realidad —los mil productos, cada
excepción—; el de producto es al revés: mostrar lo mínimo que le sirve a la
persona para decidir y esconder la complejidad que solo confunde. Es la misma
tesis de claridad de los caps. 36 y 37, aplicada al catálogo: menos opciones,
mejor decisión. Y una consecuencia práctica para las sesiones que vienen: se
escribe siempre sobre Bronce/Silver/Gold, "Privilege" es nombre de trastienda,
y el set queda armado para que cuando lleguen los nuevos planes sea cambiar los
datos, no rehacer la web.

---

## Capítulo 39 — El prototipo dejó de ser prototipo

**Qué pasó.** La pregunta que estuvo abierta desde el principio —¿la web
pública se hace en WordPress (como proponía la agencia) o en el prototipo
Next.js?— se cerró en una frase del usuario: *"el prototipo va a ser la web.
A muchísimos les está gustando cómo está quedando"*. El pendiente #8, el que
"condicionaba todo el trabajo siguiente", quedó resuelto a favor de lo que ya
estábamos construyendo.

**Qué aprendimos.** El prototipo ganó por acumulación, no por decreto: cada PR
que sumó honestidad, claridad y contenido lo fue volviendo indefendible de
descartar. La lección de método: cuando la decisión de plataforma está trabada,
la mejor forma de destrabarla no es un documento comparativo — es hacer el
producto tan bueno que la comparación se vuelva obvia. "Prohibido lorem ipsum,
el copy dicta el diseño" (criterio que ya estaba en el HANDOFF) resultó ser
también la estrategia para ganar la discusión de plataforma. Consecuencia
práctica: BuenaVista, si entra, es implementador/hosting, no dueño del diseño;
y el SEO —que dependía de esta decisión— quedó a un flip de distancia (falta
solo el dominio y la fecha de salida a público).

---

## Capítulo 40 — Las imágenes no se consiguen, se generan

**Qué pasó.** Arturo señaló un hueco real: *"cada vez que hago el diseño de la
web, me sale sin imágenes… no me tiran las imágenes automáticamente, percibiendo
la necesidad"*. Tenía que ir a ChatGPT, Gemini o Envato a mano. Y las fotos
reales —las buenas, de Lister y del equipo— toman tiempo: hay que agendar,
sacar, elegir. Mientras tanto, el blog salía sin una sola imagen.

**Qué aprendimos.** La causa raíz: un asistente de código genera código, no
píxeles. Entonces la salida sostenible no es que aprenda a generar imágenes —
es **hacer que el código genere lo visual.** Se dio vuelta el problema: en vez
de conseguir una imagen para cada nota, cada nota genera su propia portada de
marca (SVG por código: degradé + formas + ícono de categoría, variado de forma
determinística por el slug). Costo cero, sin conector, sin trabajo humano. Y con
**degradación elegante**: si algún día hay una foto real (`cover` en el
frontmatter), esa manda; si no, la portada generada — el sitio nunca queda sin
imagen. La foto real deja de ser un requisito y pasa a ser una mejora opcional.
Regla que queda para las imágenes (HANDOFF, capa 1/2/3): para lo abstracto y
editorial, generamos por código; el banco de stock (Pexels/Envato) o la IA por
API se reservan para cuando hace falta una cara humana concreta, y las fotos
reales son el destino, no el bloqueo.

---

## Capítulo 41 — Agendar no puede vivir detrás de una contraseña

**Qué pasó.** Encarando el header, el usuario frenó con una observación fina:
el agendamiento estaba pensado como algo "en camino" dentro de Mi SP —o sea,
detrás del login—. Y lo dijo claro: *"capaz tiene que haber un espacio directo
de agendamiento para no dar muchas vueltas"*. Pedir un turno es de las cosas de
más alta intención que hace una persona; enterrarlo detrás de usuario y
contraseña es ponerle un peaje a la puerta.

**Qué aprendimos.** Salió una regla de arquitectura de información que vale para
todo el sitio: **separar la intención de la identidad.** Las acciones de alta
intención y baja fricción —agendar, simular, urgencias— van directas, sin
login; el login (Mi SP) es solo para lo personal —mis turnos, mi red, mi
credencial, mis pagos—. "Quiero un turno" es directo; "ver MIS turnos" es con
login. Con eso nació `/agendar`: sin login, empieza por Lister (el centro
propio) y hace hoy lo único que se puede sin backend — un handoff caliente a la
recepción por WhatsApp, con todo cargado. El sistema real de turnos, cuando
exista, se enchufa detrás sin mover la experiencia. La lección general: **no le
pongas login a lo que la persona quiere hacer ya.** El login protege lo suyo,
no le cobra entrada a la intención.

---

## Capítulo 42 — El header es el mapa (y el mapa cambiaba en cada módulo)

**Qué pasó.** El usuario miró la web y nombró algo que ya se sentía: el header
no era UNA experiencia, eran varios. La home tenía un nav rico; el blog, el
artículo, Mi SP, el simulador traían cada uno un "logo + volver" reinventado.
Alguien que iba de la home al blog sentía que cambiaba de sitio. Su referencia:
el header de Anthropic — cómo cada título se desglosa en un panel, con una
animación fluida "pero no demasiado".

**Qué aprendimos.** El header no es decoración, es el mapa del sitio; si el mapa
cambia en cada módulo, el sitio se siente roto aunque cada página esté linda. El
primer paso fue enseñarle a los títulos a desglosarse —"Qué cubre" y "Planes"
abren un panel de vidrio con fade+slide— para aprobar el *feel* antes de la
migración grande: extraer el header a un componente compartido y rodarlo a todos
los módulos, incluida la guía (que corre en otra tecnología). La lección de
método: cuando algo tiene que vivir en "todos los módulos", primero se prueba el
feel en uno, y recién con el sí se paga el costo de unificar. (Y de paso, el
vidrio del panel volvió a recordar el cap. 24: el `backdrop-filter` hay que
verificarlo computado, no en el código — esta vez sobrevivió al minificador.)

---

## Capítulo 43 — Un header compartido no es un header con un solo color

**Qué intentamos.** Con el *feel* aprobado (cap. 42), arrancó la migración: sacar
el header a `app/Header.jsx` y llevarlo al primer módulo, el blog. La idea
ingenua era "un componente, un look": copio el nav de la home tal cual y lo
reuso. El índice del blog es navy, así que el vidrio oscuro con links blancos —el
mismo de la home sobre el hero— cayó perfecto de una.

**Qué pasó.** La nota del blog reventó esa idea. La página del artículo es de
fondo **blanco** (es lectura larga, tiene que descansar la vista). El mismo
header de vidrio oscuro con texto blanco, sobre blanco, es texto invisible: al
scrollear, el contenido pasa por debajo del nav fijo y no se lee nada. Un solo
look no servía para los dos fondos.

**Qué aprendimos.** Un header verdaderamente compartido no lleva UN color: lleva
una **variante por fondo**. Quedaron tres — `hero` (home: transparente sobre el
hero → sólido al scrollear), `dark` (páginas navy: vidrio oscuro fijo, links
blancos) y `solid` (páginas de lectura claras: sólido/claro fijo, links
oscuros). La estructura del nav es idéntica en todos —los mismos mega-menús, el
mismo overlay móvil, el mismo mapa—; lo único que cambia es cómo se pinta para
que se lea sobre lo que tiene detrás. La generalización: cuando unificás un
componente que vive sobre fondos distintos, el eje de variación no es el estilo
entero, es *el contraste con el fondo*. Y se decidió arrancar por el blog y
**dejar la home para el final**: su nav inline se acababa de aprobar (#51), y no
se arriesga una regresión de lo recién bendecido para ahorrarse una ola.

---

## Capítulo 44 — Una herramienta que te patea afuera no es una herramienta

**Qué pasó.** El usuario miró el home y puso el dedo en algo incómodo: *"el
comparador de planes no es un comparador, es un slider… y tampoco muestra muchas
diferencias"*, y *"la guía médica del home es medio raro: ponés algo que no está
en el buscador y te lleva directo a la página de la guía médica — no me cumple
esa utilidad"*. Y remató: *"lo único que ahora me funcionó fue el simulador"*.
Fuimos al código y tenía toda la razón, con nombre y apellido: el "comparador"
era un `input range` que mostraba **un plan a la vez** y escondía la tabla que sí
compara detrás de un toggle; el "buscador" buscaba sobre **11 coberturas** y, ante
cualquier término fuera de esa lista, hacía `window.location.href` a la guía. Dos
herramientas que prometían y, al primer roce, o plegaban el premio o te expulsaban.

**Qué aprendimos.** El simulador funcionó por una razón que sirve de vara para
todo lo demás: **da una respuesta personal y completa ahí mismo**, no te manda a
otro lado. De ahí el principio que queda: *una herramienta se gana su lugar en el
home solo si responde en el lugar. Si redirige o esconde el resultado, no es una
herramienta: es una puerta disfrazada de herramienta — y el usuario lo siente
como "raro" antes de poder explicar por qué.* El arreglo de la primera ola no fue
mejorar el buscador, fue **dejar de fingir que era uno**: con 11 datos reales, la
honestidad es un explorador curado (chips → tarjeta, sin caja que promete saber
todo), y la búsqueda de verdad (médicos, sanatorios) se la queda la Guía Médica,
que ahí sí devuelve resultados; el home solo abre esa puerta, honesta y separada.
La generalización de método: cuando algo "se siente raro" y no sabés por qué,
buscá el **hueco entre lo que la interfaz promete y lo que entrega** — casi
siempre está ahí. Y la data manda el diseño: un buscador con 11 ítems no es un
buscador, es una lista; forzarlo a parecer buscador es el origen del engaño.

---

## Capítulo 45 — La interacción que aclara vs. la que tapa (y la señal del toque)

**Qué pasó.** Dos observaciones del usuario el mismo día, chicas en apariencia,
grandes en fondo. La primera: *"que se sienta que estás tocando algo — un
subrayado, lo que sea. Necesitamos poner más eso en toda la web."* La segunda,
volviendo sobre el slider y el explorador de "qué cubre": *"un comparador que se
ve de entrada es mucho mejor… parece divertido al principio, pero al mismo tiempo
tiene que dar mejor claridad… no parece completo, le falta más para interactuar."*
Y una confesión de método que vale oro: *"al principio me encantan, pero después
de verlas varias veces me doy cuenta si realmente ayudan o hay una forma mejor."*

**Qué aprendimos.** Dos capas del mismo objetivo — que la web se sienta viva y
cuidada — que se resuelven al revés una de la otra:

- *Micro (el hover):* faltaba **señal de que estás tocando algo**. Los botones y
  tarjetas ya avisaban; los links de texto solo cambiaban de color, señal débil.
  Se sumó un subrayado que crece (nav) y que aparece (inline/footer/menú),
  currentColor para servir sobre cualquier fondo, en el CSS compartido → cae en
  todo. Barato, y cambia cuánto "responde" la página.
- *Macro (el slider y el explorador):* la lección más profunda. Ambos **revelaban
  una porción a la vez** —un plan, una cobertura— y por eso "no parecían
  completos". El usuario nombró la cura sin querer: *ver de entrada*. De ahí el
  principio: **la interacción tiene que AGREGAR claridad, no ser la reja que la
  tapa.** El test: *si sacás la interacción, ¿el núcleo sigue claro?* Un slider
  que esconde los otros planes falla; una comparación entera a la vista, donde
  tocar solo enfoca o profundiza, pasa. Corolario que explica su propia
  confesión: **novedad ≠ utilidad.** Lo divertido deslumbra la primera vez y
  cansa a la quinta si cada uso sigue mostrando una sola tajada; lo que aguanta
  es claro de un vistazo Y premia explorar. Por eso "después de verlo varias
  veces" se cae: el test de las repeticiones es el juez honesto, no el flechazo.
- *Método:* como el usuario decide **mirando** ("me doy cuenta después de ver"),
  la forma de proponerle rediseños no es describirlos, es **prototiparlos para
  que los vea** — y dejar que las repeticiones, no la primera impresión, decidan.

---

## Capítulo 46 — El deslizador que revelaba de a uno → el comparador de entrada

**Qué intentamos.** El comparador del home era un `slider`: arrastrabas y veías
**un plan a la vez**, con la tabla que sí compara escondida detrás de un toggle.
Divertido el primer minuto; poco práctico siempre, porque comparar es, por
definición, ver varios a la vez. La cura la nombró el usuario (cap. 45): *ver de
entrada*.

**Qué aprendimos (construyendo la cura).** Reemplazamos el slider por **tres
columnas Bronce/Silver/Gold a la vista**, cada una mostrando el **delta** — lo
que suma sobre el anterior ("La base" → "Todo lo de Bronce, y suma" → "Todo lo de
Silver, y suma"). Ahí la interacción cambió de rol: ya no es la reja que te deja
ver un plan, es un **bonus de foco** — pasás el mouse por una columna y esa se
eleva mientras las otras se atenúan apenas; nada se esconde. Es el principio del
cap. 45 hecho pixeles: *la interacción agrega claridad, no la tapa.*

Y la pregunta home-vs-página se resolvió **partiendo por profundidad**: el home
se queda con el **resumen completo de un vistazo** (las tres columnas + precio);
el **detalle exhaustivo** —11 servicios × 3 planes, con el estado y la letra
chica real de cada uno— se mudó a una **página propia `/planes`**, a un click.
Dos lecciones de ingeniería que dejó el traslado: (1) cuando un dato va a vivir
en dos lugares (home + /planes), se **extrae a una fuente única** (`coverage.js`)
antes de duplicar — o en tres semanas hay dos verdades; (2) una página de detalle
puede permitirse lo que la portada no: la tabla con toda la letra chica estorba
en el home y es exactamente lo que alguien busca en `/planes`. **El mismo dato,
dos profundidades, dos formas.** Queda pendiente aplicarle la misma cura al
explorador de "qué cubre", que todavía revela de a una cobertura.

---

## Capítulo 47 — Una diferencia solo se ve alineada (y restando lo igual)

**Qué intentamos.** El "comparador de entrada" (cap. 46) mostró los tres planes a
la vez, pero como **tres tarjetas de precios**. Lo mostramos al usuario.

**Qué pasó.** *"Se ve muy genérico, y poco claro. No siento que puedo ver la
diferencia entre planes."* Dos golpes en una frase, y con razón. Genérico: tres
pricing cards es el molde de *toda* web de planes. Y no se veía la diferencia por
algo más profundo: **las tres columnas eran tres listas separadas, con texto
distinto cada una** — para comparar había que leerlas y diferenciarlas de memoria.

**Qué aprendimos.** Dos leyes de las comparaciones, que valen para cualquier tabla
que hagamos:

1. **Una diferencia solo se ve cuando lo mismo está alineado al lado.** Las
   tarjetas son *column-first*: cada una monologa lo suyo. La comparación es
   *row-first*: el mismo servicio, tres valores en columnas alineadas, y el ojo
   compara cruzando la fila. Cards → tres monólogos; tabla → un careo.
2. **Para ver la diferencia hay que restar lo igual.** Si repetís en cada columna
   lo que es idéntico, la diferencia se ahoga en el ruido. La cura: mostrar solo
   las filas que difieren, **resaltar (en teal) únicamente la celda donde cada
   nivel mejora sobre el anterior** —aparece una *escalera* visible de lo que
   ganás subiendo— y mandar "lo igual en los tres" a una línea apagada abajo. De
   yapa, **barras** para la magnitud: "5 vs 3" entra más rápido por una barra que
   por un número. Anti-genérico no fue decorar: fue cambiar de *checklist* a
   *mapa de diferencias*.

Método (otra vez cap. 45): esto se entendió recién en la **tercera** forma
—slider → tarjetas → tabla-diff—, cada una prototipada y mirada. El flechazo
miente; las repeticiones y el ojo del usuario mandan. (Pendiente: la tabla-diff
en móvil scrollea horizontal con la columna de servicios pegada; si hace falta,
una vista móvil nativa de "saltos" — Bronze→Silver→Gold — es el próximo paso.)

---

## Capítulo 48 — La claridad ingeniosa no es claridad: "no me hagas pensar"

**Qué intentamos.** La tabla-diff (cap. 47) resaltaba en teal **solo** la celda
donde cada plan mejoraba sobre el anterior. Analíticamente impecable.

**Qué pasó.** El usuario, con ojo de CX, la desarmó en dos golpes: *"prioriza ser
ingeniosa por encima de ser clara… me obliga a leer instrucciones ('en teal, lo
que ganás') antes de entender los precios. La regla de oro es: no me hagas
pensar."* Y el peor efecto secundario: **castigaba al plan más rentable.** Como
Resonancia y Tomografía ya estaban al 100% en Silver, en Gold aparecían **en
gris** — así Silver, con más celdas teñidas, se veía *más completo que Gold*. La
transparencia terminó vendiendo peor el plan premium.

**Qué aprendimos.** Varias reglas de CX que valen para cualquier pantalla:

- **El color semántico consistente le gana al color condicional ingenioso.**
  "Al 100%" va en teal en **todos** los planes que lo tienen — el premium se ve
  premium. Un mapa que apaga lo que un plan superior *sí* incluye miente
  emocionalmente.
- **Si el usuario tiene que leer una regla para entender la tabla, la tabla
  falló.** La claridad que exige decodificar es fricción disfrazada.
- **Guiá, no solo informes.** Una línea humana bajo cada plan ("la más elegida",
  "tranquilidad total") saca a la persona de la parálisis de "no sé cuántas
  sesiones de fisio necesito". Y **anclá**: destacar UN plan (el intermedio)
  orienta más que resaltar deltas.
- **Menos burocracia visual = más claridad.** Las barritas bajo los números no
  aportaban nada: fuera. Que el número respire.
- **Lo común no es letra chica, es la base de integridad.** "Todos los planes te
  garantizan…", con peso y en positivo — no gris al pie como una cláusula.

La meta de fondo, que el usuario nombró: **la tabla no muestra la diferencia
matemática, lleva de la mano hacia la mejor decisión sin estresar.** El objetivo
no es el dato; es el cliente eligiendo tranquilo.

---

## Capítulo 49 — El asesor que nunca iba a escribir

**Qué intentamos.** Auditar el "clic crítico" del sitio: qué pasa exactamente
cuando alguien termina el simulador y toca "Enviarme mi cotización".

**Qué pasó.** Nada. Literalmente nada: `simSubmit()` validaba los campos,
marcaba `sent: true` y mostraba "Tu cotización va en camino. Te va a escribir
un asesor — una persona, no un robot". Ningún dato salía del navegador. Hasta
había un comentario en el código que decía "el lead viaja al CRM" — era
aspiracional, no descriptivo. El sitio publicado violaba el principio
inmutable #7 (no prometer lo que no se cumple) en su momento de mayor
confianza: justo cuando la persona acababa de entregar su nombre y su número.

**Qué aprendimos.**

- **La promesa más cara de romper es la del final del embudo.** Toda la web
  puede ser honesta y un solo botón falso al final la vuelve mentirosa. La
  auditoría de honestidad tiene que incluir *qué hace* cada botón, no solo
  *qué dice*.
- **Un comentario que describe el futuro como presente es una trampa.** "El
  lead viaja al CRM" sonaba a hecho; era un deseo. Los comentarios describen
  lo que el código HACE; los deseos van al HANDOFF como pendientes.
- **El puente honesto se diseña con la falla adentro.** La solución quedó en
  capas: CRM cuando exista el formulario de HubSpot (el portal real ya quedó
  cableado), WhatsApp prellenado con la cotización entera mientras tanto —
  **y** como respaldo si el POST al CRM falla. La misma doctrina del
  cero-resultados de la guía: cada falla es un lead y un dato, nunca un
  callejón.
- **Estrategia antes de código** (el usuario lo pidió explícito en esta
  sesión): el arreglo se dimensionó contra los tres horizontes de la web —
  hoy máquina honesta de leads, mediano plazo ecosistema conectado
  (HubSpot + analítica real), largo plazo el círculo que se alimenta solo.
  Por eso no fue un parche: es la primera cañería del círculo.

---

## Capítulo 50 — El resalte que desbalancea, y el segundo CTA que no suma

**Qué intentamos.** Dos detalles de la home, heredados de iteraciones previas: (1)
en el comparador, Silver se destacaba como "la más elegida" con un badge encima
del nombre y una columna teñida; (2) al scrollear aparecía un FAB flotante "Simulá
tu plan" abajo a la derecha, además del CTA del header.

**Qué pasó.** El usuario miró la sección y nombró dos cosas distintas con la misma
raíz —*ruido que no se gana su lugar*:

- *"Cuando dice acerca del plan Silver, el más usado, como que desbalancea la
  estética de esa parte."* El badge vivía **dentro** del flujo de la columna del
  medio, así que empujaba el nombre "Silver" hacia abajo: Bronze y Gold quedaban
  en una línea base, Silver en otra. El resalte, que buscaba anclar, terminaba
  descuadrando las tres columnas.
- *"Ya tenemos un iconito de 'Simulá tu plan' abajo y también en el header, que se
  desplaza al hacer scroll. No creo que sea necesario ese de abajo… ¿cuál es la
  utilidad?"* Dos botones con **el mismo verbo** compitiendo por la misma acción.

**Qué aprendimos.**

- **Énfasis sin alineación se lee como desbalance.** Para destacar una columna
  entre pares, la *ranura* del badge tiene que existir en **todas** las columnas
  (vacía en las demás), no solo en la destacada. Si el marcador vive en el flujo de
  una sola, mueve solo a esa y rompe la línea base. La regla general: **un elemento
  que aparece en un ítem de una grilla comparativa reserva su alto en todos.** Así
  el resalte de Silver quedó como una tenue franja teñida —emphasis sereno— en vez
  de un bulto que descuadra.
- **Dos CTAs con el mismo verbo no se refuerzan: se estorban.** El header ya es
  `position:fixed` y su "Simulá tu plan" viaja con el scroll en desktop; el FAB
  flotante repetía exactamente esa función a 300px de distancia. Redundancia, no
  seguro. (Se aplica la regla de etiquetas a los CTAs: **un botón se gana su lugar
  solo si ofrece un destino o un momento que otro no cubre.**) El WhatsApp flotante
  se queda —*ese* sí es otra acción— y en móvil la barra inferior sigue igual: un
  Simulá + un WhatsApp, sin flotantes que tapen texto.

El hilo con el cap. 48 y con el "valle de la súper saturación": **la claridad no es
agregar señales, es podar las que no aportan.** Menos, pero cada cosa en su lugar.

---

## Capítulo 51 — El teléfono no es la web angosta, y darle peso a lo que ya funcionaba

**Qué intentamos.** El comparador de la home era una tabla con scroll horizontal
(`min-width:640px`). En desktop se ve entero; confiamos en que en móvil "también
se entiende deslizando". Y debajo de la tabla vivían tres piezas que al usuario le
encantan —la banda "Todos los planes te garantizan", el "Ver todos los planes" y el
"un seguro no es un gasto"— pero chicas, casi al pie.

**Qué pasó.** Dos observaciones del usuario, el mismo día:

- *"Este espacio es genial… pero se ve muy pequeño. Siento que debería tener más
  protagonismo."* Las tres piezas buenas estaban subdimensionadas: contenido
  magnífico que la jerarquía mandaba a segundo plano.
- *"La versión móvil de esta comparativa no se ve tan bien todavía… algo que
  encaje y no se vea medio raro."* En 390px la columna de servicios (≈222px) se
  comía la pantalla y dejaba ver **un solo plan**, cortado, sin señal de que había
  más. Se leía como algo roto, no como algo que se desliza.

**Qué aprendimos.**

- **Un buen elemento subdimensionado se saltea.** Calidad no compensa falta de
  peso visual: si algo importa, tiene que *pesar* — cuerpo, aire, y en el caso del
  "Ver todos los planes", forma de CTA (borde + relleno en hover) en vez de link
  al pie. Darle protagonismo fue agrandar lo que ya era bueno, no inventar nada.
- **El teléfono no es "la web pero angosta".** Una tabla comparativa en 360–430px
  necesita: columna de etiquetas **angosta y pegajosa** (labels siempre visibles),
  **dos planes completos** a la vez (no uno), **asomo del tercero** como affordance
  de scroll, y un **rótulo explícito** ("Deslizá para comparar los tres planes →")
  para que el corte se lea como intención, no como bug. La grilla se movió a una
  clase (`.cmp-row`) para reencuadrarla por CSS sin tocar el markup fila por fila.
- **Nota de método — el contenedor es efímero, el remoto es la memoria.** A mitad
  de sesión el clon local "volvió" a un `main` viejo (reflog: *Reset to
  origin/main* sobre un commit anterior; el commit ya pusheado no estaba en el
  object-db local). El susto dura hasta recordar la regla: **lo pusheado es la
  verdad.** `git fetch` + `git reset` a `origin/<rama>` recuperó el trabajo intacto
  (el PR y su CI nunca se habían movido). Nunca reconstruir a mano lo que el remoto
  ya tiene guardado.

---

## Capítulo 52 — El hallazgo chico que era la marca entera

**Qué intentamos.** Cerrar un pendiente menor: el QA venía marcando, hacía días,
dos contrastes flojos en la banda de cierre de `/simulador/`. Un parche de diez
minutos, en principio.

**Qué pasó.** Antes de tocar nada escribimos un auditor que recorre el DOM y
calcula el contraste sobre **estilos computados** —componiendo el alfa y subiendo
por los padres hasta encontrar fondo opaco— y lo corrimos sobre las seis páginas.
El parche de diez minutos se convirtió en otra cosa: **17 fallas**, y en el centro
no estaba la banda sino **el CTA "Simulá tu plan": blanco sobre `#00BCB4`, 2.37:1,
en el header de todas las páginas.** El botón más importante del sitio —el que
sostiene la conversión entera— apoyado en un color que se lava con sol o en una
pantalla mala. Nadie lo había visto porque *se ve lindo en el monitor del que lo
diseña*.

Peor: el peor número no era ese. El botón deshabilitado de `/agendar/` daba
**1.51:1** — blanco sobre gris claro. No se leía "todavía no", se leía roto.

**Qué aprendimos.**

- **Un hallazgo de QA es una punta, no un tamaño.** El reporte decía "dos
  contrastes en /simulador/" y el problema real era la paleta de acción de la
  marca. Antes de parchear lo que el QA nombra, conviene preguntarse *de qué es
  síntoma* y medir alrededor. Si hubiéramos arreglado solo la banda, habríamos
  cerrado el ticket dejando el bug grande intacto — y con la sensación de haberlo
  resuelto, que es lo peligroso.
- **La regla que ordena mejor no inventa: elige entre lo que ya hay.** La solución
  no fue un color nuevo sino repartir los dos teals que ya vivían en la paleta:
  **`#00BCB4` decora, `#007d77` carga texto blanco.** Una frase que se puede
  aplicar sin volver a medir, y que además unificó los botones con los del
  comparador.
- **Los arreglos de contraste se propagan.** Oscurecer la tarjeta rompió el acento
  navy que vivía encima (de 4.75:1 a 2.25:1): sobre fondo oscuro el acento tiene
  que **aclararse**, no mantenerse. Y el secundario "fantasma" con relleno blanco
  translúcido resultó el peor de la banda (2.1:1) porque el relleno *aclaraba el
  fondo debajo del texto* — quitarle el relleno lo arregló. Nada de esto se ve
  leyendo el código: aparece midiendo.
- **La bitácora otra vez, en carne propia (cap. 8):** calculé a mano 3.2:1 donde el
  navegador medía 2.1:1. **Verificá lo computado**, incluso cuando "la cuenta es
  fácil".
- **Y el falso positivo también enseña.** El auditor marcó los links del nav en
  2.26:1 porque no ve imágenes y asume fondo blanco; en la realidad están sobre el
  hero oscuro y se leen perfecto. Una herramienta automática propone, el ojo
  dispone: cerrar hallazgos sin mirar habría oscurecido un nav que estaba bien.

---

## Capítulo 53 — Medir la home antes de opinar sobre la home

**Qué intentamos.** Encarar el pendiente más viejo y más difuso del proyecto: el
"valle de la súper saturación" que el usuario había nombrado semanas antes —
*"estás yendo mucho por el tema de la súper claridad… demasiados botones… quiero
que vayas un poquito más atrás, mires el panorama completo y lo que realmente se
necesita poner en la home page"*. Un diagnóstico sin números es una opinión, y
sobre opiniones no se rediseña una home.

**Qué pasó.** En vez de proponer, medimos: un script que recorre la home y devuelve
**el alto y la posición de cada sección en pantallas**, desktop y móvil. El valle
dejó de ser una sensación y pasó a tener coordenadas:

- El **teaser del simulador arrancaba en la pantalla 7.2 de 14.9** en móvil. La
  única herramienta que el usuario había dicho que funcionaba estaba enterrada
  bajo **6.2 pantallas seguidas de tablas**.
- Esas tablas eran tres: "qué cubre" (1.88), comparador (2.2) y "bolsillo" (2.12).
  Dos de las tres en registro negativo — lo que *no* tenés, lo que pagás vos —
  encadenadas y en la primera mitad.
- "Qué cubre" concentraba **11 botones**: la mayor densidad de la página, el
  "demasiados botones" del usuario con nombre y apellido.

Con el mapa sobre la mesa, las dos decisiones se tomaron solas: **subir el
simulador al puesto 2** y **fusionar "qué cubre" con "bolsillo"**.

**Qué aprendimos.**

- **La home no se rediseña con criterio, se rediseña con un mapa.** El mismo
  problema que veníamos nombrando de forma vaga se volvió accionable cuando tuvo
  unidades. "Pantallas de scroll" resultó la unidad correcta: es lo que la persona
  realmente gasta.
- **El orden es un argumento.** Poner el estudio antes que la acción dice
  "demostrame que entendiste antes de dejarte probar". Poner la acción antes dice
  "probá; acá abajo está todo lo que respalda lo que viste". Es la misma
  información y la promesa cambia entera.
- **La mejor fusión no recorta: descubre que dos cosas eran una.** "Qué cubre" y
  "bolsillo" respondían la misma pregunta. Y al juntarlas apareció lo que no se
  veía por separado: los tres modos (cubierto / copago / precio de convenio) **no
  eran una sección, eran la leyenda del explorador** — el vocabulario que sus
  propios badges ya usaban. Puestos como leyenda ocupan un cuarto y explican más.
- **Los principios viejos siguen pagando.** El gradiente 45/66/93 estaba en tres
  tarjetas altas que en móvil se apilaban: imposible comparar. Pasarlo a tres
  filas con las barras alineadas es el cap. 47 otra vez —*una diferencia solo se
  ve alineada*— aplicado en otra parte de la página.
- **Nota de método, segunda vez en dos días:** el contenedor volvió a reiniciarse
  y otra vez se llevó ediciones no commiteadas. La regla del cap. 51 ya no es un
  aprendizaje sino un hábito: **commitear y pushear apenas una tanda funciona**,
  no al final. Lo pusheado es lo único que existe.
- **Coda: la regla nueva cazó a su propio autor.** Al rearmar el gradiente le puse
  un mini-encabezado ("PLAN · CÓMO SE REPARTE · CUBIERTO") en gris claro. El QA
  lo marcó en **2.78:1** — una hora después de haber publicado la regla de
  contraste del cap. 52, y en el mismo bloque que estaba reordenando. La moraleja
  no es "qué distraído": es que **una regla escrita en el HANDOFF no alcanza si no
  hay una verificación que la haga cumplir**. La disciplina no está en acordarse,
  está en que el QA corra siempre y en no cerrar sin mirarlo.

---

*Próxima entrada: cuando fusionemos el siguiente cambio o aprendamos la
siguiente lección — lo que ocurra primero. El ritual: cada PR fusionado
deja su entrada si enseñó algo — detectado automáticamente, sin que nadie
lo pida; las observaciones del usuario entran dictadas ("anotá en la
bitácora: …") con su propia voz.*
