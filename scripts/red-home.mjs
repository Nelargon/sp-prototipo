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
   - Sin ciudades ni especialidades desde el 26/09/2026: Arturo acortó la
     sección («no hace falta poner dónde uno vive… ni cuántos ginecólogos»;
     BITACORA cap. 122). Hasta ese día este script armaba también las ocho
     ciudades de «¿Dónde vivís?», con «En todos los planes: …», y las cuatro
     especialidades con más médicos; están en el historial de git.
   - EL MURO, en cambio, es la red entera de Silver y Gold, con los más
     destacados primero (26/09/2026, decisión de Arturo: «la idea es también
     que la gente sienta que estos son realmente todos los prestadores que
     hay… y que en los lugares más visibles también estén los mejores
     prestadores»; BITACORA cap. 121). La nota de la sección dice de qué red son. */
import { readFileSync, writeFileSync } from 'node:fs';

const datos = JSON.parse(readFileSync('lib/guia-medica.json', 'utf8'));
const red = datos.prestadores.filter((p) => p.r.includes('privilege'));

// Fuera de la vidriera del home, aunque sigan en la guía (la planilla manda en
// la guía; el home elige qué muestra). Los tres esperan que SP los verifique
// en la planilla (Nelargon/sp-interno#71):
// - Da Vinci: clausura temporal de la Superintendencia de Salud el 16/12/2021
//   (ABC Color y Hoy); sin rastro de reapertura ni categorización vigente.
// - COMED Amambay y Planmed Caaguazú: cargados como sanatorios, pero COMED se
//   presenta como cooperativa de medicina prepaga (comed.com.py) y Planmed
//   podría serlo. Una prepaga no va en un muro de prestadores.
const FUERA_DEL_HOME = new Set(['Sanatorio da Vinci', 'COMED Amambay', 'Planmed Caaguazú']);

// Los destacados, en el orden en que van arriba en el muro (26/09/2026). El
// muro va fijo a la pantalla, así que sus primeras líneas se ven en todo el
// home. Salen de la investigación de sp-interno/project/RED-destacados-2026-
// 09-26.md (categorización Nivel 3 de la Superintendencia de Salud, trayectoria
// y los que nombró Arturo) y el orden es juicio comercial. Se escriben como
// quedan después de limpio(). Si uno sale de la planilla, se cae solo y el
// build lo avisa: la lista nunca muestra a alguien que no está en la red.
const DESTACADOS = [
  'Sanatorio Italiano', 'Centro Médico Bautista', 'Sanatorio Español', 'Laboratorio Díaz Gill',
  'Sanatorio Adventista', 'Laboratorio Meyer Lab', 'Hospital Universitario Nuestra Señora de la Asunción',
  'Sanatorio Americano', 'Sanatorio La Trinidad', 'Sanatorio Santa Lucia', 'Sanatorio AMSA',
  'Servicio Médico Tajy', 'Sanatorio San Lucas', 'Sanatorio San José', 'Hospital Universitario San Lorenzo',
  'Sanatorio Internacional', 'Instituto Codas Thompson', 'Instituto Privado del Niño',
  'Instituto Radiológico Iribas', 'Clínica de Diagnóstico por Imágenes IMAP', 'Centro Médico Guaireño',
  'Sanatorio Santa Isabel', 'Sanatorio Concepcion', 'Sanatorio Privado del Este', 'Sanatorio Itapúa',
];

// Cómo se muestra un nombre de la planilla en el home: sin razón social ni
// sucursal. ⚠ Las tildes que faltan en la planilla se corrigen allá, no acá.
const limpio = (n) => n.replace(/\s*-\s*Suc\.?\s*\d+$/i, '').replace(/\s+(Ltda|S\.?A|S\.?R\.?L)\.?$/i, '').replace(/\s+-\s+/g, ' ').replace(/Ntra\.\s*Sra\./g, 'Nuestra Señora');

const ids = (lista) => new Set(lista.map((p) => p.id)).size;
const esSanatorio = (p) => p.t === 'i' && p.e === 'Sanatorios y clínicas';

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
};

// El muro: todas las instituciones de la red de Silver y Gold (sanatorios,
// laboratorios, imagen y el resto), los destacados primero y después las
// demás, intercalando tipo y ciudad para que el fondo no se lea como una lista
// de laboratorios de Asunción.
const enRed = new Map();
for (const p of red.filter((x) => x.t === 'i')) {
  const n = limpio(p.n);
  if (FUERA_DEL_HOME.has(p.n) || FUERA_DEL_HOME.has(n)) continue;
  if (!enRed.has(n)) enRed.set(n, p);
}
const faltan = DESTACADOS.filter((n) => !enRed.has(n));
if (faltan.length) console.warn(`⚠ red-home: ${faltan.length === 1 ? 'este destacado ya no está' : 'estos destacados ya no están'} en la red de Silver y Gold y no se muestra${faltan.length === 1 ? '' : 'n'}: ${faltan.join(' · ')}`);
const muro = DESTACADOS.filter((n) => enRed.has(n));
const nDestacados = muro.length;
const colas = {};
for (const [n, p] of enRed) {
  if (muro.includes(n)) continue;
  const tipo = esSanatorio(p) ? 's' : p.e === 'Laboratorio' ? 'l' : 'o';
  ((colas[tipo] = colas[tipo] || {})[p.c] = colas[tipo][p.c] || []).push(n);
}
// Cada tipo, intercalando ciudades; después, dos sanatorios, un laboratorio y
// cada tanto uno de imagen u otro servicio.
const porTipo = {};
for (const [tipo, porC] of Object.entries(colas)) {
  const orden = Object.keys(porC).sort((a, b) => porC[b].length - porC[a].length || a.localeCompare(b, 'es'));
  porTipo[tipo] = [];
  for (let quedan = true; quedan;) {
    quedan = false;
    for (const c of orden) if (porC[c].length) { porTipo[tipo].push(porC[c].shift()); quedan = true; }
  }
}
const [S, L, O] = [porTipo.s || [], porTipo.l || [], porTipo.o || []];
for (let i = 0; S.length || L.length || O.length; i++) {
  if (S.length) muro.push(S.shift());
  if (S.length) muro.push(S.shift());
  if (L.length) muro.push(L.shift());
  if (i % 2 === 1 && O.length) muro.push(O.shift());
}

const resumen = { datos_al: datos.meta.datos_al, pais, muro };
writeFileSync('lib/red-home.json', JSON.stringify(resumen));
console.log(`✓ lib/red-home.json: ${pais.total} en la red de Silver y Gold · ${pais.sanatorios} sanatorios · ${pais.laboratorios} laboratorios · ${pais.medicos} médicos · muro de ${muro.length} nombres (${nDestacados} destacados primero)`);
