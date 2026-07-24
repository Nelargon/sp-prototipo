// Coberturas REALES de los cuadernillos vigentes (datos/planes-vigentes/).
// Fuente única compartida entre el explorador "qué cubre" del home y la
// comparación fila-por-fila de /planes — antes vivía dentro de app/page.jsx.
// El orden de `cov` es [Bronze, Silver, Gold]. Regla de tono (HANDOFF §3.7): la
// ausencia se comunica como oportunidad ("Desde Plan Silver"), nunca "No cubierto".
const yes = (d) => ({ s: 'Cubierta', ok: true, d });
const no = (s, d) => ({ s, ok: false, d });

export const coverage = () => [
  { name: 'Consulta con especialista', icon: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-1a6 6 0 0 1 12 0v1', cov: [yes('Hasta 3 al año por especialidad'), yes('Hasta 5 al año por especialidad'), yes('Sin tope anual en casi todas')] },
  { name: 'Ecografía', icon: 'M3 12a9 9 0 0 1 18 0M3 12a9 9 0 0 0 18 0', cov: [yes('Al 100% (varias con tope de 1-2 al año)'), yes('Al 100%, la mayoría sin tope'), yes('Al 100%, la mayoría sin tope')] },
  { name: 'Tomografía (TAC)', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5v8', cov: [{ s: 'Copago 50%', ok: true, d: 'Pagás la mitad · 1 al año' }, yes('Al 100%, hasta 2 al año'), yes('Al 100%, hasta 2 al año y menos espera')] },
  { name: 'Resonancia (RM)', icon: 'M4 6h16v12H4zM8 6v12', cov: [no('Desde Plan Silver', 'Se suma al 100% desde Plan Silver'), yes('Al 100%, 1 al año'), yes('Al 100%, 1 al año')] },
  { name: 'Sesión de psicología', icon: 'M12 3a7 7 0 0 0-4 12.7V19l2-1 2 1 2-1 2 1v-3.3A7 7 0 0 0 12 3Z', cov: [yes('3 sesiones al año'), yes('5 sesiones al año'), yes('6 sesiones al año')] },
  { name: 'Internación', icon: 'M3 18v-6h18v6M6 12V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4', cov: [yes('Semi-suite, hasta 20 días al año'), yes('Semi-suite, hasta 20 días al año'), yes('Semi-suite, hasta 25 días al año')] },
  { name: 'Terapia intensiva', icon: 'M3 12h4l2-5 4 10 2-5h6', cov: [yes('Al 100%, hasta 3 días al año'), yes('Al 100%, hasta 5 días al año'), yes('Al 100%, hasta 6 días al año')] },
  { name: 'Parto o cesárea', icon: 'M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10Z', cov: [yes('Cubiertos, con el bebé en nursery'), yes('+ medicamentos hasta ₲ 1 millón'), yes('+ medicamentos hasta ₲ 1,5 millones')] },
  { name: 'Urgencia 24 h', icon: 'M12 2v6m0 8v6M2 12h6m8 0h6', cov: [yes('Al 100% · remedios hasta ₲ 100 mil'), yes('Al 100% · remedios hasta ₲ 150 mil'), yes('Al 100% · remedios hasta ₲ 200 mil')] },
  { name: 'Fisioterapia', icon: 'M12 5c-3-3-8-1-8 4 0 6 3 10 4 10s1-4 4-4 3 4 4 4 4-4 4-10c0-5-5-7-8-4Z', cov: [yes('10 sesiones al año'), yes('15 sesiones al año'), yes('20 sesiones al año')] },
  { name: 'Medicamentos en internación', icon: 'M10 3 3 10a5 5 0 0 0 7 7l7-7a5 5 0 0 0-7-7ZM7 7l7 7', cov: [yes('Hasta ₲ 500 mil por evento'), yes('Hasta ₲ 1 millón por evento'), yes('Hasta ₲ 1,5 millones por evento')] },
];
