#!/usr/bin/env node
/* ¿Toda ciudad de la Guía Médica está en el mapa?

   El mapa de la guía (app/guia-medica/MapaRed.jsx) dibuja un punto por ciudad
   con las coordenadas de lib/mapa-paraguay.js. Si la planilla suma una ciudad
   que no está ahí, el punto no se dibuja y nadie lo nota mirando el mapa: la
   ciudad simplemente no existe. Esto cruza las dos listas y corta el CI con el
   nombre de la que falta.

   Cómo se arregla: agregar su línea en CIUDADES de lib/mapa-paraguay.js,
   'Ciudad|Departamento': [latitud, longitud], del centro de la ciudad en
   OpenStreetMap (openstreetmap.org → buscar la ciudad → clic derecho → «Mostrar
   dirección»). También avisa si una coordenada cae fuera del Paraguay: una
   ciudad homónima de otro país es el error típico al buscarla.

   Uso: node qa/mapa-ciudades.mjs [ruta/a/guia-medica.json]
        (sin build, sin navegador; lo corre el CI. La ruta opcional sirve para
        probar el detector contra un archivo armado para fallar.) */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const archivo = process.argv[2] || join(ROOT, 'lib/guia-medica.json');
const datos = JSON.parse(readFileSync(archivo, 'utf8'));
const { CIUDADES } = await import(pathToFileURL(join(ROOT, 'lib/mapa-paraguay.js')).href);

const enGuia = [...new Set(datos.prestadores.map((p) => p.c + '|' + p.dp))].sort((a, b) => a.localeCompare(b, 'es'));
const faltan = enGuia.filter((k) => !CIUDADES[k]);
// El Paraguay entra en latitud −19,3 a −27,6 y longitud −54,3 a −62,7.
const afuera = Object.entries(CIUDADES).filter(([, [lat, lon]]) => !(lat <= -19 && lat >= -28 && lon <= -54 && lon >= -63)).map(([k]) => k);

if (faltan.length || afuera.length) {
  if (faltan.length) console.error(`✗ mapa: ${faltan.length} ${faltan.length === 1 ? 'ciudad de la guía no tiene' : 'ciudades de la guía no tienen'} coordenadas en lib/mapa-paraguay.js:\n  ` + faltan.join('\n  '));
  if (afuera.length) console.error(`✗ mapa: ${afuera.length === 1 ? 'esta coordenada cae' : 'estas coordenadas caen'} fuera del Paraguay:\n  ` + afuera.join('\n  '));
  console.error('  Cómo se arregla: ver el comentario de qa/mapa-ciudades.mjs.');
  process.exit(1);
}
console.log(`✓ mapa: las ${enGuia.length} ciudades de la guía tienen su punto`);
