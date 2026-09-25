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
const yes = (d) => ({ s: 'Cubierta', ok: true, d });
const no = (s, d) => ({ s, ok: false, d });

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
  { name: 'Consulta con especialista', icon: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-1a6 6 0 0 1 12 0v1', cov: [yes('Sin tope en Lister; en la red, hasta 3 por mes'), yes('Hasta 5 al año por especialidad'), yes('Sin tope anual en casi todas')] },
  { name: 'Ecografía', icon: 'M3 12a9 9 0 0 1 18 0M3 12a9 9 0 0 0 18 0', wait: [90, 60, 60], cov: [yes('Hasta 4 al año por familia'), yes('Al 100%, la mayoría sin tope'), yes('Al 100%, la mayoría sin tope')] },
  { name: 'Tomografía (TAC)', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5v8', wait: [180, 60, 30], cov: [yes('Hasta 2 al año por familia, junto con ecocardiograma y ergometría'), yes('Al 100%, hasta 2 al año'), yes('Al 100%, hasta 2 al año y menos espera')] },
  { name: 'Resonancia (RM)', icon: 'M4 6h16v12H4zM8 6v12', wait: [365, 150, 150], cov: [yes('1 al año por familia, sin contraste'), yes('Al 100%, 1 al año'), yes('Al 100%, 1 al año')] },
  { name: 'Sesión de psicología', icon: 'M12 3a7 7 0 0 0-4 12.7V19l2-1 2 1 2-1 2 1v-3.3A7 7 0 0 0 12 3Z', cov: [yes('Hasta 3 al año por familia, en el mismo cupo que otras especialidades'), yes('5 sesiones al año'), yes('6 sesiones al año')] },
  { name: 'Internación', icon: 'M3 18v-6h18v6M6 12V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4', wait: [365, null, null], waitNote: 'En Silver y Gold, 2 meses si es por algo agudo.', cov: [yes('Habitación privada, hasta 20 días al año por familia'), yes('Semi-suite, hasta 20 días al año'), yes('Semi-suite, hasta 25 días al año')] },
  { name: 'Terapia intensiva', icon: 'M3 12h4l2-5 4 10 2-5h6', cov: [yes('Hasta 2 días al año'), yes('Al 100%, hasta 5 días al año'), yes('Al 100%, hasta 6 días al año')] },
  // Parto: 365 días en Essential y 300 en Silver y Gold. Cesárea: 150 en Gold.
  // Es la espera más larga y la que más caro sale descubrir tarde; por eso
  // además tiene aviso propio en el home.
  { name: 'Parto o cesárea', icon: 'M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10Z', wait: [365, 300, 300], waitNote: 'La cesárea espera 150 días en Gold.', cov: [yes('Con el bebé en nursery · medicamentos hasta ₲ 350 mil'), yes('Con el bebé en nursery · medicamentos hasta ₲ 1 millón'), yes('Con el bebé en nursery · medicamentos hasta ₲ 1,5 millones')] },
  { name: 'Urgencia 24 h', icon: 'M12 2v6m0 8v6M2 12h6m8 0h6', cov: [yes('Consulta 24 h, desde el día uno'), yes('Al 100% · remedios hasta ₲ 150 mil'), yes('Al 100% · remedios hasta ₲ 200 mil')] },
  { name: 'Fisioterapia', icon: 'M12 5c-3-3-8-1-8 4 0 6 3 10 4 10s1-4 4-4 3 4 4 4 4-4 4-10c0-5-5-7-8-4Z', wait: [0, 90, 90], cov: [yes('Hasta 5 sesiones al año por familia'), yes('15 sesiones al año'), yes('20 sesiones al año')] },
  { name: 'Medicamentos en internación', icon: 'M10 3 3 10a5 5 0 0 0 7 7l7-7a5 5 0 0 0-7-7ZM7 7l7 7', cov: [yes('Hasta ₲ 350 mil por evento'), yes('Hasta ₲ 1 millón por evento'), yes('Hasta ₲ 1,5 millones por evento')] },
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
  { que: 'Tomografía', dias: [180, 60, 30] },
  // Parámetros clave: "Carencia – internación clínica por evento agudo: 60 días".
  // Essential no distingue: toda internación, a los 365 días.
  { que: 'Internación por algo agudo', dias: [365, 60, 60] },
  { que: 'Fisioterapia', dias: [0, 90, 90] },
  { que: 'Resonancia', dias: [365, 150, 150], sinCobertura: 'Desde Silver' },
  // Cuadro 3 (cirugías e internación): 292 de 314 filas → 210 / 180 / 150 días.
  // ⚠ La FAQ decía "7 meses" para los tres planes: era el número de Bronze.
  // Silver espera 6 y Gold 5. Se corrigió el 7 sep 2026.
  // Essential: una cirugía al año por familia, de una lista de 26, a los 365.
  { que: 'Cirugías programadas', dias: [365, 180, 150], nota: 'la mayoría', notaPlan: ['una al año por familia', null, null] },
  // Parámetros clave: "Carencia de maternidad: 300 días". Cesárea: 150 en Gold.
  { que: 'Parto', dias: [365, 300, 300], notaPlan: [null, null, 'La cesárea espera 5 meses en Gold'] },
];

// Plan Vital (65+) tiene grilla propia y agrupa las coberturas POR carencia
// (grilla-vital-coberturas-jul2026.json → coberturas_por_carencia). Un solo
// valor por fila: es un plan único, sin niveles.
export const carenciasVital = () => [
  { que: 'Consultas, urgencias y ambulancia a domicilio', dias: 0 },
  { que: 'Laboratorio de rutina, radiografías y electrocardiograma', dias: 0 },
  { que: 'Fisioterapia', dias: 0 },
  { que: 'Análisis complementarios, ecografías y Papanicolau', dias: 90 },
  { que: 'Cirugías menores y procedimientos ambulatorios', dias: 180 },
  { que: 'Internación, cirugías y terapia intensiva', dias: 365 },
];
