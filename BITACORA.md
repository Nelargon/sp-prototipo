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

*Próxima entrada: cuando fusionemos el siguiente cambio o aprendamos la
siguiente lección — lo que ocurra primero. El ritual: cada PR fusionado
deja su entrada si enseñó algo — detectado automáticamente, sin que nadie
lo pida; las observaciones del usuario entran dictadas ("anotá en la
bitácora: …") con su propia voz.*
