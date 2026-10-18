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
const yes = (d) => ({ s: 'Cubierta', ok: true, d });
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
  { name: 'Ecografía', icon: 'M3 12a9 9 0 0 1 18 0M3 12a9 9 0 0 0 18 0', wait: [90, 60, 60], corta: [anual(4, 'familia'), null, null], cov: [yes('Hasta 4 al año por familia'), yes('La mayoría, sin tope'), yes('La mayoría, sin tope')] },
  // Tomografía: 120 días en Silver y 90 en Gold, como TODAS las filas TAC-TCMS
  // de la grilla. Decía 60/30: eran los de ORTOPANTOMOGRAFIA (una placa dental)
  // leída como "tomografía" por la subcadena (auditoría del 25/09/2026).
  // Gold decía «Hasta 2 al año y menos espera»: la espera ya va con su número
  // donde se muestra, y como ventaja rompía la simetría con Silver (regla de
  // esperas del 03/10).
  { name: 'Tomografía (TAC)', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5v8', wait: [180, 120, 90], nota: notaDe(QUIEN_SG), corta: [anual(2, 'familia'), anual(2, QUIEN_SG), anual(2, QUIEN_SG)], cola: [', junto con ecocardiograma y ergometría', null, null], cov: [yes('Hasta 2 al año por familia, junto con ecocardiograma y ergometría'), yes('Hasta 2 al año'), yes('Hasta 2 al año')] },
  { name: 'Resonancia (RM)', icon: 'M4 6h16v12H4zM8 6v12', wait: [365, 150, 150], nota: notaDe(QUIEN_SG), corta: [anual(1, 'familia'), anual(1, QUIEN_SG), anual(1, QUIEN_SG)], cola: [', sin contraste', null, null], cov: [yes('1 al año por familia, sin contraste'), yes('1 al año'), yes('1 al año')] },
  { name: 'Sesión de psicología', icon: 'M12 3a7 7 0 0 0-4 12.7V19l2-1 2 1 2-1 2 1v-3.3A7 7 0 0 0 12 3Z', nota: notaDe(QUIEN_PSICO), corta: [anual(3, 'familia'), anual(5, QUIEN_PSICO), anual(6, QUIEN_PSICO)], cola: [', en el mismo cupo que otras especialidades', null, null], cov: [yes('Hasta 3 al año por familia, en el mismo cupo que otras especialidades'), yes('5 sesiones al año'), yes('6 sesiones al año')] },
  // Internación sí tiene para quién en las tres fuentes: «por grupo familiar»
  // en Essential y «tope 20/25 días por beneficiario/año» en Silver y Gold.
  // `sub`, lo que la hoja de los once servicios dice debajo de la forma corta;
  // `cola`, lo que sigue a la forma corta en esa hoja: las condiciones de
  // Essential que hoy se ven y no pueden quedar solo en el contrato (comité del
  // 13/10, ajuste 4).
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
  // cubre remedios» (comité, vuelta 2, 17/10).
  { name: 'Urgencia 24 h', icon: 'M12 2v6m0 8v6M2 12h6m8 0h6', notaAsesor: 'El cuadernillo de Essential no fija el tope de remedios en urgencias: preguntale a tu asesor.', corta: [ASESOR, 'Gs. 150 mil/evento', 'Gs. 200 mil/evento'], pre: ['Consulta 24 h · remedios ', 'Consulta 24 h · remedios ', 'Consulta 24 h · remedios '], dicho: [null, 'hasta 150 mil guaraníes cada vez que vas a urgencias', 'hasta 200 mil guaraníes cada vez que vas a urgencias'], cov: [yes('Consulta 24 h, desde el día uno'), yes('Consulta 24 h · remedios hasta Gs. 150 mil'), yes('Consulta 24 h · remedios hasta Gs. 200 mil')] },
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
  // + 5 en las dos fuentes (silver.json y la grilla). En Gold, «y también
  // respiratoria» y no «más respiratorias», que sin número se leía «más que los
  // otros». La tarjeta del home lee estas dos mismas líneas.
  { name: 'Fisioterapia', icon: 'M12 5c-3-3-8-1-8 4 0 6 3 10 4 10s1-4 4-4 3 4 4 4 4-4 4-10c0-5-5-7-8-4Z', wait: [0, 90, 90], nota: notaDe(QUIEN_SG), notaAsesor: 'En Gold, preguntale a tu asesor cuántas sesiones de fisioterapia tiene.', corta: [anual(5, 'familia'), anual(15, QUIEN_SG), ASESOR], cov: [yes('Hasta 5 sesiones al año por familia'), yes('15 sesiones al año (traumatológica, neurológica o después de una cirugía), más 5 respiratorias'), yes('Traumatológica, neurológica o después de una cirugía, y también respiratoria')] },
  { name: 'Medicamentos en internación', icon: 'M10 3 3 10a5 5 0 0 0 7 7l7-7a5 5 0 0 0-7-7ZM7 7l7 7', corta: ['Gs. 350 mil/evento', 'Gs. 1 millón/evento', 'Gs. 1,5 millones/evento'], dicho: ['hasta 350 mil guaraníes cada vez que te internan', 'hasta 1 millón de guaraníes cada vez que te internan', 'hasta 1,5 millones de guaraníes cada vez que te internan'], cov: [yes('Hasta Gs. 350 mil por evento'), yes('Hasta Gs. 1 millón por evento'), yes('Hasta Gs. 1,5 millones por evento')] },
];

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
  { que: 'Ecografías', dias: [90, 60, 60] },
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
  // para el simulador y la cotización.
  { que: 'Cirugías programadas', dias: [365, 180, 150], nota: 'la mayoría', notaPlan: ['una al año por familia', null, null], corta: [anual('1 cirugía', 'familia'), null, null] },
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
