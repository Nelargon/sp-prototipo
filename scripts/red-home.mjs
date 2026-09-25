/* Resumen de la red para la sección «Dónde te atendés» del home (25/09/2026).
   ⚠ No confundir con lib/red-resumen.json: ese lo escribe build-guia-medica.py
   (conteos por red y zona) y lo usa el puente simulador ↔ guía (lib/red-zona.js).
   Este se llamaba igual en el primer borrador y lo pisaba (BITACORA cap. 116).
   ----------------------------------------------------------------------------
   El home es un componente de cliente: si importara lib/guia-medica.json
   entero, le sumaría 258 KB a la página principal. Este script saca de la
   planilla solo lo que la sección muestra (unos pocos KB) y lo escribe en
   lib/red-home.json. Corre solo antes de cada build y de cada dev
   (prebuild/predev en package.json) y el archivo no está en git: nunca puede
   quedar atrasado respecto de la planilla. La planilla manda.

   Qué cuenta (pedido de Arturo, 25/09/2026: el 615 suelto «a veces se puede
   comparar con otras prepagas… que tienen un número mayor»; se desglosa):
   - La red de Silver y Gold (guía «privilege»), la misma de las cifras del
     FAQ. Un prestador cuenta una vez aunque tenga varias filas (id único).
   - Los NOMBRES que se muestran —el muro de fondo y «en todos los planes»—
     son solo los que están además en alguna red de Essential: el título dice
     «de tu plan», y quien compra Essential no puede ver un sanatorio que su
     plan no tiene (BITACORA cap. 114). */
import { readFileSync, writeFileSync } from 'node:fs';

const datos = JSON.parse(readFileSync('lib/guia-medica.json', 'utf8'));
const red = datos.prestadores.filter((p) => p.r.includes('privilege'));
const enTodos = (p) => p.r.includes('privilege') && p.r.some((r) => r.startsWith('esencial'));

// Fuera de la vidriera del home, aunque sigan en la guía (la planilla manda en
// la guía; el home elige qué muestra). Da Vinci: clausura temporal del
// Ministerio de Salud en diciembre de 2021 (ABC Color y Hoy, 16/12/2021).
const FUERA_DEL_HOME = new Set(['Sanatorio da Vinci']);

// Cómo se muestra un nombre de la planilla en el home: sin razón social ni
// sucursal. ⚠ Las tildes que faltan en la planilla se corrigen allá, no acá.
const limpio = (n) => n.replace(/\s*-\s*Suc\.?\s*\d+$/i, '').replace(/\s+(Ltda|S\.?A|S\.?R\.?L)\.?$/i, '').replace(/\s+-\s+/g, ' ').replace(/Ntra\.\s*Sra\./g, 'Nuestra Señora');

const ids = (lista) => new Set(lista.map((p) => p.id)).size;
const esSanatorio = (p) => p.t === 'i' && p.e === 'Sanatorios y clínicas';

// Especialidades en el idioma de una familia: «44 pediatras».
const OFICIO = {
  'Ginecología y Obstetricia': ['ginecólogo y obstetra', 'ginecólogos y obstetras'],
  'Pediatría': ['pediatra', 'pediatras'],
  'Oftalmología': ['oftalmólogo', 'oftalmólogos'],
  'Clínica Médica': ['clínico', 'clínicos'],
  'Otorrinolaringología': ['otorrino', 'otorrinos'],
  'Traumatología': ['traumatólogo', 'traumatólogos'],
  'Cardiología': ['cardiólogo', 'cardiólogos'],
  'Cirugía General': ['cirujano', 'cirujanos'],
  'Dermatología': ['dermatólogo', 'dermatólogos'],
  'Urología': ['urólogo', 'urólogos'],
  'Nutrición': ['nutricionista', 'nutricionistas'],
  'Psicología': ['psicólogo', 'psicólogos'],
  'Neurología': ['neurólogo', 'neurólogos'],
  'Gastroenterología': ['gastroenterólogo', 'gastroenterólogos'],
  'Endocrinología': ['endocrinólogo', 'endocrinólogos'],
  'Neumología': ['neumólogo', 'neumólogos'],
  'Coloproctología': ['coloproctólogo', 'coloproctólogos'],
};
function oficios(lista, cuantos) {
  const por = {};
  for (const p of lista) if (p.t === 'p' && OFICIO[p.e]) (por[p.e] = por[p.e] || new Set()).add(p.id);
  return Object.entries(por).map(([e, s]) => ({ n: s.size, o: OFICIO[e][s.size === 1 ? 0 : 1] }))
    .sort((a, b) => b.n - a.n).slice(0, cuantos);
}
function desglose(lista) {
  const de = (f) => ids(lista.filter(f));
  return {
    total: ids(lista),
    sanatorios: de(esSanatorio),
    laboratorios: de((p) => p.t === 'i' && p.e === 'Laboratorio'),
    imagenes: de((p) => p.t === 'i' && p.e === 'Diagnóstico por Imagen'),
    medicos: de((p) => p.t === 'p'),
  };
}

// Todo el país
const pais = {
  ...desglose(red),
  especialidades: new Set(red.filter((p) => p.t === 'p').map((p) => p.e)).size,
  ciudades: new Set(red.map((p) => p.c + '|' + p.dp)).size,
  departamentos: new Set(red.map((p) => p.dp)).size,
  oficios: oficios(red, 4),
};

// Las ciudades con más red, para los botones de «¿Dónde vivís?»
const porCiudad = {};
for (const p of red) (porCiudad[p.c + '|' + p.dp] = porCiudad[p.c + '|' + p.dp] || []).push(p);
const ciudades = Object.entries(porCiudad)
  .map(([k, lista]) => {
    const [c, dp] = k.split('|');
    const nombres = [...new Set(lista.filter((p) => p.t === 'i' && enTodos(p) && !FUERA_DEL_HOME.has(p.n))
      .sort((a, b) => (esSanatorio(b) - esSanatorio(a)) || a.n.localeCompare(b.n, 'es')).map((p) => limpio(p.n)))].slice(0, 3);
    return { c, dp, ...desglose(lista), oficios: oficios(lista, 4), nombres };
  })
  .sort((a, b) => b.total - a.total || a.c.localeCompare(b.c, 'es'))
  .slice(0, 8);

// El muro: los sanatorios y clínicas de todos los planes, intercalando
// ciudades para que el fondo no se lea como una lista de Asunción.
const vistos = new Set();
const muro = [];
const colas = {};
for (const p of red.filter((x) => esSanatorio(x) && enTodos(x) && !FUERA_DEL_HOME.has(x.n))) {
  const n = limpio(p.n);
  if (vistos.has(n)) continue;
  vistos.add(n);
  (colas[p.c] = colas[p.c] || []).push(n);
}
const orden = Object.keys(colas).sort((a, b) => colas[b].length - colas[a].length || a.localeCompare(b, 'es'));
for (let quedan = true; quedan;) {
  quedan = false;
  for (const c of orden) if (colas[c].length) { muro.push(colas[c].shift()); quedan = true; }
}

const resumen = { datos_al: datos.meta.datos_al, pais, ciudades, muro };
writeFileSync('lib/red-home.json', JSON.stringify(resumen));
console.log(`✓ lib/red-home.json: ${pais.total} en la red de Silver y Gold · ${pais.sanatorios} sanatorios · ${pais.laboratorios} laboratorios · ${pais.medicos} médicos · muro de ${muro.length} nombres`);
