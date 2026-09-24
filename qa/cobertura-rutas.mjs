#!/usr/bin/env node
/* ¿Toda página del sitio tiene al menos una prueba que la abra?

   Cada carpeta de app/ con un page.jsx es una página publicada. Esto la cruza
   con las páginas que recorren las dos suites con navegador
   (qa/qa-integral.mjs y qa/qa-lanzamiento.mjs) y falla si alguna no la abre
   nadie. Es la regla «lo nuevo entra con su prueba», hecha puerta: una
   página agregada sin sumarla a la QA no pasa el CI.

   Cómo se cumple (una de dos, siempre con su porqué):
     1. sumar la ruta a PAGINAS / PAGINAS_APP de qa-integral.mjs, o a
        PAGINAS de qa-lanzamiento.mjs si sale en la v1;
        para una ruta dinámica ([slug], [id]) alcanza una página concreta
        (/guia-medica/P-0001/) o la marca «// cubre: /ruta/[slug]/» al lado
        del código que la elige;
     2. o, si de verdad no se prueba, anotarla en EXENTAS con el motivo.

   Uso: node qa/cobertura-rutas.mjs   (sin build, sin navegador; lo corre el CI) */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUITES = ['qa/qa-integral.mjs', 'qa/qa-lanzamiento.mjs'];

// Rutas que no se prueban a propósito. Cada una con su motivo: una exención
// sin porqué es una prueba que alguien se ahorró.
const EXENTAS = {
  // '/ruta/': 'motivo',
};

// ── las páginas que existen: app/**/page.{js,jsx} ──────────────────────
const rutas = [];
(function recorrer(dir, url) {
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    if (statSync(f).isDirectory()) {
      // (grupo) no suma segmento a la URL; _privada y @slot no son páginas
      if (e.startsWith('_') || e.startsWith('@')) continue;
      recorrer(f, /^\(.*\)$/.test(e) ? url : url + e + '/');
    } else if (/^page\.(js|jsx|ts|tsx)$/.test(e)) rutas.push(url);
  }
})(join(ROOT, 'app'), '/');

// ── las páginas que abren las pruebas ──────────────────────────────────
const probadas = new Set();
const marcas = new Set();
for (const s of SUITES) {
  const src = readFileSync(join(ROOT, s), 'utf8');
  for (const lista of src.matchAll(/const PAGINAS\w*\s*=\s*\[([^\]]*)\]/g))
    for (const m of lista[1].matchAll(/'(\/[^']*)'/g)) probadas.add(m[1]);
  for (const m of src.matchAll(/\/\/\s*cubre:\s*(\/\S*)/g)) marcas.add(m[1]);
}

const aRegex = (ruta) => new RegExp('^' + ruta.replace(/\[[^\]]+\]/g, '[^/]+') + '$');
const faltan = [];
for (const r of rutas.sort()) {
  if (EXENTAS[r]) { console.log(`  · ${r} — exenta: ${EXENTAS[r]}`); continue; }
  const dinamica = r.includes('[');
  const cubierta = dinamica
    ? marcas.has(r) || [...probadas].some((p) => aRegex(r).test(p))
    : probadas.has(r);
  if (cubierta) console.log(`  ✓ ${r}`);
  else faltan.push(r);
}

if (faltan.length) {
  console.error(`\n✗ ${faltan.length} página(s) que ninguna prueba abre:\n`);
  for (const r of faltan) console.error('   ' + r);
  console.error(`
Una página que nadie prueba puede estar rota sin que nadie se entere.
Sumala a PAGINAS_APP de qa/qa-integral.mjs (o a PAGINAS de
qa/qa-lanzamiento.mjs si sale en la v1). Si es dinámica, alcanza una página
concreta o la marca «// cubre: ${faltan[0]}». Si no se prueba a propósito,
anotala en EXENTAS de qa/cobertura-rutas.mjs con el motivo.
`);
  process.exit(1);
}

console.log(`✓ cobertura: las ${rutas.length} páginas del sitio tienen una prueba que las abre`);
