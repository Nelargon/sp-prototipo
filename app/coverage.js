// Coberturas REALES de los cuadernillos vigentes (datos/planes-vigentes/).
// Fuente única compartida entre el explorador "qué cubre" del home y la
// comparación fila-por-fila de /planes — antes vivía dentro de app/page.jsx.
// El orden de `cov` es [Essential, Silver, Gold]. Regla de tono (HANDOFF §3.7): la
// ausencia se comunica como oportunidad ("Desde Plan Silver"), nunca "No cubierto".
// ESSENTIAL (24/09/2026) reemplazó a Bronze. Su columna sale de su propio
// cuadernillo (datos/planes-vigentes/essential.json, CUADERNILLO PLAN
// ESSENTIAL 25/03/2026), no de la grilla Privilege: otra red, otros topes, y
// muchos son POR GRUPO FAMILIAR en vez de por persona. Por eso lo dice cada
// celda. Silver y Gold siguen saliendo de la grilla.
// ⚠ En tomografía, resonancia y fisioterapia la grilla de Silver y Gold dice
// «por año de contrato», no «por beneficiario»: si es para cada persona o para
// todo el grupo, no está escrito (sp-interno#110). Decisión 2A de Arturo
// (13/10/2026): el sitio no lo afirma y manda a preguntarle al asesor
// (NOTA_UNIDAD, la `nota` de esos servicios). En psicología pasa lo mismo:
// «5 sesiones/año» y «6 sesiones/año», sin decir para quién (la pregunta ya
// está en sp-interno#110).
// Las cifras con plata no se parten por dentro (P3A; comité, vuelta 3, 17/10):
// «Gs.», la cifra y «mil», «millón» o «millones» van unidos con espacio duro en
// toda oración de `cov`, como en la forma corta. La lista de los once servicios
// del celular partía «hasta Gs. 1,5 ⏎ millones» a 360 y 390 px.
export const duro = (t) => t.replace(/Gs\.\s(\d[\d.,]*)(\s(?:mil|millón|millones)\b)?/g, (_, n, u) => 'Gs. ' + n + (u ? ' ' + u.trim() : ''));
const yes = (d) => ({ s: 'Cubierta', ok: true, d: duro(d) });
const no = (s, d) => ({ s, ok: false, d });
export const minuscula = (x) => x.charAt(0).toLowerCase() + x.slice(1);

// LA FORMA CORTA (P3, opción A: la regla de escaneo de Arturo del 13/10/2026,
// elegida el 17/10/2026 con «Todo A»). Lo que se escanea (las celdas de las
// tablas, las líneas de las tarjetas, la hoja de los once servicios) dice la
// cifra, para quién y cada cuánto, separados por barras: «1/familia/año». Lo
// dibuja components/Corta.jsx, con la frase completa para los lectores de
// pantalla. `corta` es esa forma, la misma en el home, en /planes y en el
// celular (un `null` deja la oración de `cov`); `d` sigue siendo la oración de
// la tarjeta que se abre al tocar.
// El hueco: donde la fuente no dice para quién cuenta el número, va DUDA en el
// lugar de «familia», con la misma letra, el mismo color y el mismo peso
// (lámina 84). «¿quién?» y no «¿?» (ajuste del comité del 13/10, con la
// palabra de la opción C): dice qué falta y mide casi lo mismo que «familia».
export const DUDA = '¿quién?';
// Para quién cuentan los topes de Silver y Gold en tomografía, resonancia y
// fisioterapia (sp-interno#110). Cuando SP conteste se cambia ACÁ, por
// 'persona' o 'familia', y cambian las celdas del home y de /planes, las líneas
// de las tarjetas del celular (quote.js), la hoja de los once servicios, la
// nota del asesor y la prueba de qa/qa-lanzamiento.mjs, que lee esta línea.
export const QUIEN_SG = DUDA;
// La psicología de Silver y Gold lleva su propio interruptor: es otra pregunta
// a SP (si es por beneficiario, como las otras especialidades con tope de
// Silver; sp-interno#110) y puede llegar con otra respuesta.
export const QUIEN_PSICO = DUDA;
const anual = (cuanto, quien) => cuanto + '/' + quien + '/año';
// Una sola forma de mandar al asesor (decisión 2A, sp-interno#110). No dice
// por qué: la fuente registrada es la grilla, no el contrato, y afirmar algo
// del contrato sin haberlo leído es otro dato sin fuente (comité del 13/10).
export const NOTA_UNIDAD = 'En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo.';
const notaDe = (quien) => (quien === DUDA ? NOTA_UNIDAD : undefined);
// La celda que manda al asesor, una sola forma en todo el sitio (R1A, 17/10).
// Va donde la fuente no fija el dato o se contradice, en lugar del número.
export const ASESOR = 'Preguntale a tu asesor';
// Lo que se escanea y manda al asesor por una parte de la fila («Cesárea:
// preguntale a tu asesor»): la misma forma única, después de lo que se pregunta.
export const conAsesor = (que) => que + ': ' + minuscula(ASESOR);
// Las dos condiciones de espera que el sitio ya dice y que viajan con el número
// fuera de su fila (comité, vuelta 3, 17/10): los 2 meses de internación de
// Silver y Gold son si es por algo agudo (la programada no tiene espera escrita,
// sp-interno#82), y la cesárea de Gold manda al asesor (sp-interno#116).
const SI_AGUDO = 'si es por algo agudo';
const CESAREA_GOLD = 'para una cesárea, ' + minuscula(ASESOR) + ' cuánto esperás';

// Carencia = días de espera desde la afiliación hasta poder usar la cobertura.
// Fuente: las 935 filas de datos/planes-vigentes/grilla-coberturas-precios-jul2026.json,
// verificada por el usuario (jul 2026). Orden [Essential, Silver, Gold]; la
// columna de Essential sale de su cuadernillo (carencias_dias en essential.json).
// REGLA CRÍTICA: las filas con cob='AD' (Arancel Diferenciado = SIN COBERTURA)
// traen "INMEDIATA" en el campo carencia — es basura del origen, no una espera
// de cero. Nunca leer la carencia de una fila AD: ahí no hay cobertura que
// esperar. (Por eso Resonancia llevaba null en Bronze y no "0 días".)
// null = la grilla no declara carencia para ese servicio → no se muestra nada.

export const coverage = () => [
  // nota (04/10/2026, decisión de Arturo en sp-interno#55): el tope mensual de
  // Silver y Gold va en la página de detalle (/planes), no en la vista rápida del
  // home. La lista de estudios con copago espera a SP.
  { name: 'Consulta con especialista', icon: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-1a6 6 0 0 1 12 0v1', nota: 'En Silver y Gold, hasta 3 consultas por mes en cada especialidad; después, con copago.', cov: [yes('Sin tope en Lister; en la red, hasta 3 por mes'), yes('Sin tope en la mitad de las especialidades; 5 o 6 al año en el resto'), yes('Sin tope anual en casi todas')] },
  // `waitNote` de la ecografía (9A): la lista de las que esperan 3 meses, en
  // oraciones, para la tarjeta de /planes y la hoja del celular, que no pueden
  // llevar un toque adentro.
  { name: 'Ecografía', icon: 'M3 12a9 9 0 0 1 18 0M3 12a9 9 0 0 0 18 0', wait: [90, 60, 60], waitNote: toqueEnTexto('eco-sg'), corta: [anual(4, 'familia'), null, null], cov: [yes('Hasta 4 al año por familia'), yes('La mayoría, sin tope'), yes('La mayoría, sin tope')] },
  // Tomografía: 120 días en Silver y 90 en Gold, como TODAS las filas TAC-TCMS
  // de la grilla. Decía 60/30: eran los de ORTOPANTOMOGRAFIA (una placa dental)
  // leída como "tomografía" por la subcadena (auditoría del 25/09/2026).
  // Gold decía «Hasta 2 al año y menos espera»: la espera ya va con su número
  // donde se muestra, y como ventaja rompía la simetría con Silver (regla de
  // esperas del 03/10).
  { name: 'Tomografía (TAC)', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5v8', wait: [180, 120, 90], nota: notaDe(QUIEN_SG), corta: [anual(2, 'familia'), anual(2, QUIEN_SG), anual(2, QUIEN_SG)], cola: [', junto con ecocardiograma y ergometría', null, null], enTabla: true, cov: [yes('Hasta 2 al año por familia, junto con ecocardiograma y ergometría'), yes('Hasta 2 al año'), yes('Hasta 2 al año')] },
  { name: 'Resonancia (RM)', icon: 'M4 6h16v12H4zM8 6v12', wait: [365, 150, 150], nota: notaDe(QUIEN_SG), corta: [anual(1, 'familia'), anual(1, QUIEN_SG), anual(1, QUIEN_SG)], cola: [', sin contraste ni sedación', null, null], enTabla: true, cov: [yes('1 al año por familia, sin contraste ni sedación'), yes('1 al año'), yes('1 al año')] },
  { name: 'Sesión de psicología', icon: 'M12 3a7 7 0 0 0-4 12.7V19l2-1 2 1 2-1 2 1v-3.3A7 7 0 0 0 12 3Z', nota: notaDe(QUIEN_PSICO), corta: [anual(3, 'familia'), anual(5, QUIEN_PSICO), anual(6, QUIEN_PSICO)], cola: [', en el mismo cupo que otras especialidades', null, null], cov: [yes('Hasta 3 al año por familia, en el mismo cupo que otras especialidades'), yes('5 sesiones al año'), yes('6 sesiones al año')] },
  // Internación sí tiene para quién en las tres fuentes: «por grupo familiar»
  // en Essential y «tope 20/25 días por beneficiario/año» en Silver y Gold.
  // `sub`, lo que la hoja de los once servicios dice debajo de la forma corta;
  // `cola`, lo que sigue a la forma corta en esa hoja: las condiciones de
  // Essential que hoy se ven y no pueden quedar solo en el contrato (comité del
  // 13/10, ajuste 4). Con `enTabla`, la misma `cola` va también debajo de la
  // celda de Essential en las tablas del home y de /planes (`notaCelda`, abajo;
  // 185A y 190A, Arturo, 23/10/2026): tomografía, resonancia y fisioterapia. La
  // de psicología todavía no (no está decidida).
  // La resonancia de Essential es «sin contraste ni sedación» (cuadernillo 4.2:
  // «No incluye contraste, materiales descartables ni sedación»): decía solo
  // «sin contraste» en la tarjeta y la hoja de /planes, en la lista y en el
  // tema, mientras la tarjeta del home ya decía las dos (185A, con el agregado
  // del comité).
  { name: 'Internación', icon: 'M3 18v-6h18v6M6 12V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4', wait: [365, null, null], waitNote: 'En Silver y Gold, 2 meses ' + SI_AGUDO + '; si es programada, ' + minuscula(ASESOR) + ' cuánto esperás.', corta: [anual('20 días', 'familia'), anual('20 días', 'persona'), anual('25 días', 'persona')], sub: ['Habitación privada', 'Semi-suite', 'Semi-suite'], cov: [yes('Habitación privada, hasta 20 días al año por familia'), yes('Semi-suite, hasta 20 días al año por persona'), yes('Semi-suite, hasta 25 días al año por persona')] },
  { name: 'Terapia intensiva', icon: 'M3 12h4l2-5 4 10 2-5h6', cov: [yes('Hasta 2 días al año'), yes('Hasta 5 días al año'), yes('Hasta 6 días al año')] },
  // Parto: 365 días en Essential y 300 en Silver y Gold. Es la espera más larga
  // y la que más caro sale descubrir tarde; por eso además tiene aviso propio en
  // el home. «La cesárea espera 5 meses en Gold» salió el 13/10/2026 (decisión
  // 2A de Arturo): el contrato de Gold se contradice (Cuadro 3: 150 días;
  // cláusula de maternidad 2.5.2: 300). Mostrar los 10 meses sin más tomaba el
  // otro lado, así que la cesárea de Gold manda al asesor. Vuelve con su número
  // si SP lo aclara (sp-interno#116). La nota dice lo mismo, con las mismas
  // palabras, que el cuadro de esperas, el simulador y la cotización
  // (CESAREA_GOLD; comité, vuelta 3, 17/10).
  { name: 'Parto o cesárea', icon: 'M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10Z', wait: [365, 300, 300], nota: 'En Gold, ' + CESAREA_GOLD + '.', cov: [yes('Con el bebé en nursery · medicamentos hasta Gs. 350 mil'), yes('Con el bebé en nursery · medicamentos hasta Gs. 1 millón'), yes('Con el bebé en nursery · medicamentos hasta Gs. 1,5 millones')] },
  // Los topes «por evento» (E3A, decisión de Arturo del 17/10/2026): donde la
  // fuente dice «por evento» (la grilla en Silver y Gold; essential.json, «hasta
  // ₲ 350.000 por evento», en la internación de Essential), lo que se escanea lo
  // dice en forma corta, con los millones enteros: «Gs. 1,5 millones/evento»,
  // nunca «1,5 mill.». `pre` es lo que va delante en la hoja de los once
  // servicios y `dicho`, lo que oye el lector de pantalla. La oración de `cov`
  // sigue para la tarjeta. El parto queda con «hasta» y sin «/evento»: su fuente
  // no trae unidad.
  // Los remedios en urgencias de Essential: su cuadernillo no fija el tope
  // (essential.json, «sin_dato»). La celda manda al asesor (R1A, 17/10) en las
  // tablas y también en la lista del celular, con el mismo `pre` que Silver y
  // Gold, y `notaAsesor` lo dice en oraciones en la tarjeta de /planes y en la
  // hoja del celular: el silencio al lado del tope de los otros dos se leía «no
  // cubre remedios» (comité, vuelta 2, 17/10). Es la única copia de esa oración:
  // la tarjeta del home también la lee de acá, y dice qué preguntar con el molde
  // de la G1A (comité, vuelta 3, 17/10). `pre` va en su propio renglón en la
  // lista: pegado a «Preguntale a tu asesor» se leía «remedios Preguntale…».
  { name: 'Urgencia 24 h', icon: 'M12 2v6m0 8v6M2 12h6m8 0h6', notaAsesor: 'En Essential, preguntale a tu asesor cuánto cubre en remedios en urgencias.', corta: [ASESOR, 'Gs. 150 mil/evento', 'Gs. 200 mil/evento'], pre: ['Consulta 24 h · remedios', 'Consulta 24 h · remedios', 'Consulta 24 h · remedios'], dicho: [null, 'hasta 150 mil guaraníes cada vez que vas a urgencias', 'hasta 200 mil guaraníes cada vez que vas a urgencias'], cov: [yes('Consulta 24 h, desde el día uno'), yes('Consulta 24 h · remedios hasta Gs. 150 mil'), yes('Consulta 24 h · remedios hasta Gs. 200 mil')] },
  // Fisioterapia de Gold (G1A, decisión de Arturo del 17/10/2026, sp-interno#50):
  // la fuente se contradice. gold.json dice «20 sesiones/año […] + 5
  // respiratorias» y los parámetros clave de la grilla (y el plegable de
  // /planes), 10 y 3. Hasta que SP lo aclare, la celda de Gold manda al asesor
  // por el número, igual que la cesárea de Gold (#116): ninguna forma corta le
  // da a Gold un número seguro. `notaAsesor` es la línea que lo dice.
  // Lo que se escanea (la celda de las tablas y de la lista, `corta`) dice
  // ASESOR; lo que se lee (la tarjeta y la hoja, `cov`) dice qué cubre, sin
  // número, igual que la tarjeta del home: la nota ya manda al asesor y
  // repetirlo en la línea de Gold lo decía tres veces (comité, vuelta 1, 17/10).
  // Silver y Gold nombran lo mismo (comité, vuelta 2, 17/10): la vuelta 1 le dio
  // a Gold los tipos y las respiratorias y dejó a Silver en «15 sesiones al año»,
  // y quien comparaba entendía que solo Gold tenía respiratoria. Silver tiene 15
  // + 5 en las dos fuentes (silver.json y la grilla). En Gold, «y respiratoria»
  // y no «más respiratorias», que sin número se leía «más que los otros». Y las
  // dos con la misma forma (comité, vuelta 3, 17/10): arrancan por los mismos
  // tipos, en el mismo orden, y Silver suma sus números; antes una arrancaba por
  // el número y la otra por el tipo, y el ojo tenía que reacomodarlas para ver
  // que lo único distinto es que Gold no tiene número. La tarjeta del home lee
  // estas dos mismas líneas.
  // Essential (190A, Arturo, 23/10/2026, sp-interno#190): solo la
  // traumatológica (cuadernillo 1.11: «Hasta cinco (5) sesiones traumatológicas,
  // por grupo familiar por año de contrato»; regla fis-traumatologica de
  // essential-cobertura.json).
  // La línea arranca por el tipo, como Silver y Gold, y la forma corta lleva la
  // `cola` («5/familia/año, solo traumatológica»). Decía «Hasta 5 sesiones al
  // año por familia» y, al lado de los tipos de Silver y Gold, se leía «cubre lo
  // mismo».
  { name: 'Fisioterapia', icon: 'M12 5c-3-3-8-1-8 4 0 6 3 10 4 10s1-4 4-4 3 4 4 4 4-4 4-10c0-5-5-7-8-4Z', wait: [0, 90, 90], nota: notaDe(QUIEN_SG), notaAsesor: 'En Gold, preguntale a tu asesor cuántas sesiones de fisioterapia tiene.', corta: [anual(5, 'familia'), anual(15, QUIEN_SG), ASESOR], cola: [', solo traumatológica', null, null], enTabla: true, cov: [yes('Solo la traumatológica: hasta 5 sesiones al año por familia'), yes('Traumatológica, neurológica o después de una cirugía: 15 sesiones al año; respiratoria: otras 5'), yes('Traumatológica, neurológica o después de una cirugía, y respiratoria')] },
  { name: 'Medicamentos en internación', icon: 'M10 3 3 10a5 5 0 0 0 7 7l7-7a5 5 0 0 0-7-7ZM7 7l7 7', corta: ['Gs. 350 mil/evento', 'Gs. 1 millón/evento', 'Gs. 1,5 millones/evento'], dicho: ['hasta 350 mil guaraníes cada vez que te internan', 'hasta 1 millón de guaraníes cada vez que te internan', 'hasta 1,5 millones de guaraníes cada vez que te internan'], cov: [yes('Hasta Gs. 350 mil por evento'), yes('Hasta Gs. 1 millón por evento'), yes('Hasta Gs. 1,5 millones por evento')] },
];

// LO QUE SE ABRE A UN TOQUE EN LAS ESPERAS (9A y 10A, Arturo, 23/10/2026,
// «Adelante con tus sugerencias»; sp-interno#191). Dos condiciones que el sitio
// callaba y cambian la elección:
// - 9A, las ecografías de Silver y Gold: «2 meses» era la espera de la mayoría.
//   En la grilla del master del 24/07, en Silver esperan 90 días 10 de las 33
//   filas «ECOGRAFIA…» (las 4 del embarazo y 5 Doppler, una de ellas en dos
//   filas) y en Gold 15 de las 32 con dato (esas 9, porque la Doppler venosa de
//   un lado no tiene dato en Gold, y 6 más; entre ellas la «VESICAL», que el
//   master pone a 90 mientras su «DE VEJIGA» espera 60). Esperan 90 también tres
//   perinatales que no se llaman «ECOGRAFIA…»: el monitoreo fetal, el perfil
//   biofísico y la ecocardiografía fetal (la del corazón del bebé). La celda dice
//   «2 meses, la mayoría» y, a un toque, cuáles esperan 3: TODAS las del
//   embarazo, nombradas una por una (verificador de textos, 23/10: la lista de
//   cuatro se leía completa y la del corazón del bebé esperaba 3 meses), sin
//   «Las demás, 2 meses» (repetía la celda y, debajo de las tres tarjetas,
//   parecía valer también para Essential). La vesical y la de vejiga no eligen
//   un lado: «Para la de vejiga, preguntale a tu asesor cuánto esperás»
//   (pregunta a SP, sp-interno#204). Las Doppler van en su propia oración,
//   separadas con punto de las de Gold: con una coma, «las Doppler de … y de
//   carótidas, y las de riñón» se leía «Doppler de riñón», y la renal común es
//   la que espera 3 meses en Gold (verificador de datos, 23/10, tercera tanda).
//   Lo controla qa/listas-fuente.mjs contra la grilla, fila por fila
//   (`NOMBRE_WEB`; las filas de los grupos de ecografías del master que el toque
//   no cuenta, en `FUERA_DE_LA_FILA`, con su porqué).
// - 10A, las cirugías programadas de Essential: «1 cirugía/familia/año» es de
//   una lista cerrada de 26 (CUADERNILLO PLAN ESSENTIAL.pdf, 4.4 «Intervenciones
//   Quirúrgicas (Abiertas)», 4.4.1 a 4.4.26, 25/03/2026; la lista literal está en
//   essential.json, `cirugias_lista_26`). «de una lista de 26» se toca y abre la
//   lista. Ningún nombre promete más que el cuadernillo (verificadores de datos
//   y de textos, 23/10): la palabra de la familia va donde dice lo mismo («sacar
//   la vesícula»); donde no es segura, el nombre del cuadernillo con su
//   traducción entre paréntesis, nunca una palabra más amplia («hemorroides»
//   abarcaba la ligadura, que no entra; «quiste», cualquier quiste). Y la
//   traducción tampoco puede abarcar más que el ítem (tercera tanda, 23/10):
//   «(raspado del útero)» incluía el de diagnóstico, que no entra; ahora
//   «legrado evacuador (raspado del útero como tratamiento)», que es lo que dice
//   «terapéutico». Con todos los calificativos del ítem, también los que repiten
//   el título: «sacar el adenoma de próstata, a cielo abierto» (la cirugía de
//   próstata más común es por la uretra, que no es videolaparoscopía: el cierre
//   de la lista no la nombra), «pielolitotomía abierta», «(apendicectomía no
//   complicada)» tal como lo dice el ítem («sin complicaciones» se leía «si la
//   cirugía sale bien»), «varicocele de un lado, inguinoescrotal», «de un
//   lado», «la malla no entra», «con o sin autoinjerto». La técnica de todas va
//   en el título, como en el cuadernillo («Intervenciones Quirúrgicas
//   (Abiertas)»), y la lista cierra con lo que el cuadernillo dice del
//   anestesista (4.3.2) y de la videolaparoscopía (el párrafo que sigue a la
//   lista). En el mismo orden que el cuadernillo; qa/listas-fuente.mjs controla
//   que cada nombre tenga su par y conserve los calificativos de su ítem
//   (`CALIFICATIVOS`). Las palabras de casa esperan la lámina de Arturo
//   (sp-interno#206).
// Se dibujan con `Term` de glossary.jsx (`dict={TOQUES}`): subrayado punteado,
// mouse, dedo y teclado, y la lista entera para el lector de pantalla. Donde no
// puede ir un toque (una tarjeta que se cierra al sacar el mouse, una fila que
// ya es un botón, el texto de la cotización), la lista va en oraciones.
const may = (x) => x.charAt(0).toUpperCase() + x.slice(1);
// Lo que se lee de cada fila de la grilla, en la misma forma que el sitio. La
// tabla de nombres de la grilla a nombres de la web está en qa/listas-fuente.mjs.
const EMBARAZO = 'las del embarazo (obstétrica, morfológica, de marcadores cromosómicos, Doppler obstétrico, del corazón del bebé, perfil biofísico y monitoreo fetal)';
const DOPPLER = 'las Doppler de tiroides, de mama, de testículo, de venas de brazos o piernas y de carótidas';
// Las que en Gold esperan 3 meses y en Silver 2. «la testicular» y no «de
// testículos»: en la misma oración ya está la Doppler «de testículo».
export const SOLO_GOLD = 'las de riñón y de vías urinarias, la testicular, la de próstata por vía rectal y la transvaginal';
// La «VESICAL» de Gold espera 90 días en el master y la «DE VEJIGA», 60: no se
// elige un lado (pregunta a SP, sp-interno#204). Con «cuánto esperás», como la
// cesárea de Gold (CESAREA_GOLD): «preguntale a tu asesor» solo no decía qué
// preguntar.
export const VEJIGA_GOLD = 'para la de vejiga, ' + minuscula(ASESOR) + ' cuánto esperás';
// La frase de la pregunta frecuente de las esperas del home: la misma lista,
// dicha corta (la respuesta vive en un Plegable que recorta y no lleva toque).
// Sin punto y coma adentro del paréntesis: la oración de la respuesta ya separa
// los servicios con punto y coma (verificador de textos, 23/10).
export const ECO_EN_FAQ = '2 meses la mayoría y 3 las del embarazo y las Doppler (en Gold, también ' + SOLO_GOLD + ', y ' + VEJIGA_GOLD + ')';
export const CIRUGIAS_26 = ['absceso perianal (junto al ano)', 'sacar las amígdalas y las adenoides juntas', 'sacar las adenoides', 'sacar el adenoma de próstata, a cielo abierto', 'sacar las amígdalas', 'sacar el apéndice (apendicectomía no complicada)', 'orzuelo, chalazión o absceso del párpado', 'circuncisión', 'sacar la vesícula', 'colporrafia anterior', 'colporrafia posterior', 'catarata de un ojo, por extracción extracapsular', 'hemorroidectomía (cirugía para sacar las hemorroides)', 'hernia crural de un lado (la malla no entra)', 'hernia de la ingle de un lado (la malla no entra)', 'hernia del ombligo o epigástrica (la malla no entra)', 'hidrocele de un lado', 'sacar el útero (histerectomía total)', 'laparotomía exploradora', 'legrado evacuador (raspado del útero como tratamiento)', 'sacar el ovario y la trompa de un lado', 'pielolitotomía abierta (abrir la pelvis del riñón para sacar una piedra)', 'pterigión, con o sin autoinjerto', 'quistectomía de un lado (' + minuscula(ASESOR) + ' cuáles entran)', 'sacar un nódulo de la mama', 'varicocele de un lado, inguinoescrotal'];
if (CIRUGIAS_26.length !== 26) throw new Error('Essential: la lista de cirugías no tiene 26');
// Lo que el cuadernillo dice después de la lista (4.4) y del anestesista en toda
// cirugía con internación (4.3.2: «50% cobertura honorarios del anestesiólogo»).
// La videolaparoscopía, copia fiel del párrafo que sigue a la lista: «En caso de
// que la intervención quirúrgica sea realizada por vía videolaparoscópica. Queda
// a cargo del asegurado el pago de la diferencia en aranceles en honorarios
// médicos (anestesiólogo, ayudante, instrumentador) y el costo total del uso de
// equipo, torre y materiales/instrumentales» (releído en el PDF del Drive el
// 23/10/2026). Hasta la tercera tanda decía «todo el uso del equipo y de los
// materiales»: sin la torre ni el instrumental, la persona veía menos de lo que
// iba a pagar (verificador de datos). «Anestesista» es «anestesiólogo», como en
// la oración de arriba.
const CIR_ANESTESISTA = 'De los honorarios del anestesista, el plan cubre la mitad.';
const CIR_VIDEO = 'Si te operan por videolaparoscopía, pagás vos la diferencia de aranceles en los honorarios del anestesista, el ayudante y el instrumentador, y el costo total del uso del equipo, la torre, los materiales y el instrumental.';
export const TOQUES = {
  'eco-silver': { t: 'Ecografías que esperan 3 meses en Silver', d: may(EMBARAZO) + ' y ' + DOPPLER + '.' },
  'eco-gold': { t: 'Ecografías que esperan 3 meses en Gold', d: may(EMBARAZO) + ' y ' + DOPPLER + '. También ' + SOLO_GOLD + '. ' + may(VEJIGA_GOLD) + '.' },
  'eco-sg': { t: 'Ecografías que esperan 3 meses', d: 'En Silver y Gold, ' + EMBARAZO + ' y ' + DOPPLER + '. En Gold, también ' + SOLO_GOLD + '. ' + may(VEJIGA_GOLD) + '.' },
  // `ancho` (Term): a 260 px la lista mide unos 366 px de alto y no entraba en la
  // tarjeta de esperas del simulador en la computadora; a 420, unos 290. Desde la
  // tercera tanda (23/10) la burbuja es fija y ya no la recorta la tarjeta, pero
  // la lista creció con los calificativos y la videolaparoscopía entera: a 420
  // medía 421 px y, con la fila en el medio de la pantalla a 1280 × 900, le
  // faltaban 3 para entrar (scrolleaba 3 px). A 480 entra. En el celular manda el
  // 72vw; donde no entra ni arriba ni abajo, Term la abre hacia el lado más
  // grande y scrollea por dentro.
  'cir-26': { t: 'Las 26 cirugías de Essential, a cielo abierto', d: may(CIRUGIAS_26.slice(0, -1).join('; ') + '; y ' + CIRUGIAS_26[25]) + '. ' + CIR_ANESTESISTA + ' ' + CIR_VIDEO, ancho: 480 },
};
// La lista en oraciones, para donde no entra el toque: «título: lista», con
// minúscula después de los dos puntos.
export const toqueEnTexto = (k) => TOQUES[k].t + ': ' + minuscula(TOQUES[k].d);

// LAS ESPERAS QUE IMPORTAN AL DECIDIR (7 sep 2026 — "Sería bueno ser ya
// transparentes con las carencias", Arturo). Es lo que el simulador muestra
// ANTES de pedir nombre y teléfono: la Puerta 1.5 del criterio de evaluación
// fallaba exactamente por no hacerlo. Orden [Essential, Silver, Gold], en días;
// null = ese plan no cubre el servicio (regla AD de arriba: ahí no hay espera
// que contar). Cada fila cita de dónde sale — sin fuente, un dato no existe.
// Fuente: datos/planes-vigentes/grilla-coberturas-precios-jul2026.json para
// Silver y Gold; essential.json (su cuadernillo) para Essential. En Essential la
// internación, las cirugías y el parto esperan UN AÑO: es lo más importante de
// decir antes de que alguien lo elija por precio.
export const carencias = () => [
  // Cuadernillo, textual en quote.js: "Urgencias 24 h al 100%, desde el día uno".
  // Consultas sin carencia (FAQ de la home, verificada jul 2026).
  { que: 'Consultas y urgencias', dias: [0, 0, 0] },
  // Cuadro 1 (laboratorio), filas con cobertura: la moda es 60 días en los
  // tres planes (Bronze/Silver 167 de 283; Gold 296 de 343). El resto espera
  // 90-120 días en Bronze/Silver y 30 en Gold — por eso "la mayoría".
  // En Essential: rutina sin espera, especializados a los 90 días.
  { que: 'Análisis de laboratorio', dias: [90, 60, 60], nota: 'la mayoría', notaPlan: ['los de rutina, sin espera', null, null] },
  // 9A (Arturo, 23/10/2026, sp-interno#191): «2 meses, la mayoría» y, a un
  // toque, cuáles esperan 3 (TOQUES, arriba). `notaPlan` y no `nota`: Essential
  // espera 3 meses para todas y no lleva «la mayoría». `toque` sin `palabra`: lo
  // que se toca es la nota misma; `toqueJuntos`, donde una sola nota habla de
  // Silver y Gold a la vez (el cuadro del celular).
  { que: 'Ecografías', dias: [90, 60, 60], notaPlan: [null, 'la mayoría', 'la mayoría'], toque: [null, { k: 'eco-silver' }, { k: 'eco-gold' }], toqueJuntos: 'eco-sg' },
  { que: 'Tomografía', dias: [180, 120, 90] },
  // Parámetros clave: "Carencia – internación clínica por evento agudo: 60 días".
  // Essential no distingue: toda internación, a los 365 días. La internación
  // programada de Silver y Gold no tiene espera escrita: no se deduce de la de
  // su cirugía (sp-interno#82); la nota de «Internación» manda al asesor.
  { que: 'Internación por algo agudo', dias: [365, 60, 60], cuando: [null, SI_AGUDO, SI_AGUDO] },
  { que: 'Fisioterapia', dias: [0, 90, 90] },
  { que: 'Resonancia', dias: [365, 150, 150], sinCobertura: 'Desde Silver' },
  // Cuadro 3 (cirugías e internación): 292 de 314 filas → 210 / 180 / 150 días.
  // ⚠ La FAQ decía "7 meses" para los tres planes: era el número de Bronze.
  // Silver espera 6 y Gold 5. Se corrigió el 7 sep 2026.
  // Essential: una cirugía al año por familia, de una lista de 26, a los 365.
  // `corta`, esa misma condición en la forma corta, para la celda de la tabla de
  // /planes en la computadora (lo que se escanea); `notaPlan` sigue en oraciones
  // para el simulador y la cotización. «de una lista de 26» va después de la
  // nota y se toca (10A, Arturo, 23/10/2026, sp-interno#191): `palabra` es lo
  // que se subraya. «la mayoría» va por plan (`notaPlan`) y no como `nota` de
  // los tres: en el cuadro del celular salía un «La mayoría.» suelto delante de
  // «En Essential, una al año…», y parecía valer también para Essential
  // (verificador de textos, 23/10). Ahora dice «En Essential, una al año por
  // familia, de una lista de 26. En Silver y Gold, la mayoría.».
  { que: 'Cirugías programadas', dias: [365, 180, 150], notaPlan: ['una al año por familia', 'la mayoría', 'la mayoría'], corta: [anual('1 cirugía', 'familia'), null, null], toque: [{ k: 'cir-26', palabra: 'de una lista de 26' }, null, null] },
  // Parámetros clave: "Carencia de maternidad: 300 días". La cesárea de Gold
  // tiene la fuente contradicha: el Cuadro 3 de su contrato dice 150 días y la
  // cláusula de maternidad (2.5.2), 300. Hasta que SP lo aclare, en Gold manda
  // al asesor (sp-interno#116, decisión 2A de Arturo, 13/10/2026).
  // `cuando`, la condición que viaja con el número cuando la espera se muestra
  // fuera de su fila: la lista de los once servicios nombra «Parto o cesárea» e
  // «Internación», no «Parto» ni «por algo agudo», y daba a la cesárea de Gold
  // los 10 meses que la 2A le sacó, y a toda internación de Silver y Gold los 2
  // meses de la aguda (comité, vuelta 3, 17/10). `alAsesor`, la parte de la fila
  // que en ese plan manda al asesor, dicha en corto con `conAsesor`.
  { que: 'Parto', dias: [365, 300, 300], notaPlan: [null, null, CESAREA_GOLD], cuando: [null, null, 'para el parto'], alAsesor: [null, null, 'Cesárea'] },
];

// La condición de Essential que va debajo de la forma corta en las celdas de las
// tablas del home y de /planes (185A y 190A, Arturo, 23/10/2026): la misma
// `cola` de la lista de los once servicios, sin la coma. Solo en los servicios
// con `enTabla` (tomografía, resonancia y fisioterapia).
export const notaCelda = (s, i) => (s.enTabla && s.cola && s.cola[i] ? s.cola[i].replace(/^,\s*/, '') : undefined);

// La nota de una espera en una celda que se escanea (la tabla de /planes en la
// computadora): la forma corta si la hay, la parte que manda al asesor, lo que
// dice ese plan o lo que dicen los tres. Es la misma nota que muestran el
// simulador y el cuadro de esperas del celular, en la forma de una celda: la
// tabla no traía ninguna y decía «3 meses» para el laboratorio de Essential y
// «10 meses» para el parto de Gold sin la cesárea (comité, vuelta 3, 17/10).
export const notaCorta = (c, i) => (c.corta && c.corta[i]) || (c.alAsesor && c.alAsesor[i] && conAsesor(c.alAsesor[i])) || (c.notaPlan && c.notaPlan[i]) || c.nota || null;

// Plan Vital (65+) tiene grilla propia y agrupa las coberturas POR carencia
// (grilla-vital-coberturas-jul2026.json → coberturas_por_carencia). Un solo
// valor por fila: es un plan único, sin niveles.
export const carenciasVital = () => [
  { que: 'Consultas, urgencias y ambulancia a domicilio', dias: 0 },
  { que: 'Laboratorio de rutina, radiografías y electrocardiograma', dias: 0 },
  { que: 'Fisioterapia', dias: 0 },
  { que: 'Análisis complementarios, ecografías y Papanicolaou', dias: 90 },
  { que: 'Cirugías menores y procedimientos ambulatorios', dias: 180 },
  { que: 'Internación, cirugías y terapia intensiva', dias: 365 },
];
