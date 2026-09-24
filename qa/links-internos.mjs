#!/usr/bin/env node
/* ¿Todo link interno del sitio exportado lleva a una página que existe?

   podar-edicion.mjs ya corta la v1 si queda un link a un módulo podado. Esto
   mira el caso general, en las DOS ediciones: cualquier href/src interno y
   cualquier URL del sitemap.xml tiene que resolver a un archivo del export.
   Un link roto no aparece en el diff de ningún PR: se ve solo recorriendo el
   sitio entero, que es lo que hace esto. Sin navegador, corre en segundos.

   Uso (después de un build; el export queda en out/):
     node qa/links-internos.mjs out /sp-prototipo
     node qa/links-internos.mjs out /sp-prototipo/lanzamiento

   Sale con 1 si hay algún link roto. Lo corren el CI de cada PR y la salud
   nocturna (.github/workflows/salud-nocturna.yml). */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const OUT = process.argv[2] || 'out';
const BP = (process.argv[3] ?? process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');

if (!existsSync(OUT)) {
  console.error(`✗ No existe ${OUT}/: corré el build antes.`);
  process.exit(1);
}

const htmls = [];
(function recorrer(d) {
  for (const e of readdirSync(d)) {
    const f = join(d, e);
    if (statSync(f).isDirectory()) { if (e !== '_next') recorrer(f); }
    else if (f.endsWith('.html')) htmls.push(f);
  }
})(OUT);

// Una ruta del sitio resuelve si existe como archivo, como carpeta con
// index.html, o como página .html (así sirve GitHub Pages un export estático).
const resuelve = (ruta) => {
  const p = decodeURIComponent(ruta.split('#')[0].split('?')[0]).replace(/^\/+/, '');
  const f = join(OUT, p);
  if (p === '') return existsSync(join(OUT, 'index.html'));
  if (existsSync(f) && statSync(f).isFile()) return true;
  if (existsSync(join(f, 'index.html'))) return true;
  return existsSync(f.replace(/\/$/, '') + '.html');
};

const rotos = new Map(); // destino → [páginas que lo linkean]
const anotar = (destino, desde) => {
  if (!rotos.has(destino)) rotos.set(destino, []);
  rotos.get(destino).push(desde);
};

// Solo atributos reales de HTML. Un string suelto en un chunk de JS no es un
// link (misma regla que podar-edicion.mjs).
const ATTR = /\s(?:href|src)="([^"]+)"/g;
let revisados = 0;
for (const f of htmls) {
  const html = readFileSync(f, 'utf8');
  const desde = '/' + relative(OUT, f);
  for (const m of html.matchAll(ATTR)) {
    const url = m[1].replace(/&amp;/g, '&');
    if (!url.startsWith('/') || url.startsWith('//')) continue; // externos, tel:, mailto:, #anclas
    if (BP && !(url === BP || url.startsWith(BP + '/'))) {
      anotar(url + '  (fuera del prefijo ' + BP + ')', desde);
      continue;
    }
    revisados++;
    if (!resuelve(url.slice(BP.length))) anotar(url, desde);
  }
}

// El sitemap es lo que Google recorre: una URL muerta ahí es una página que
// prometemos y no existe (p. ej., un módulo podado que quedó listado).
let enSitemap = 0;
const sitemap = join(OUT, 'sitemap.xml');
if (existsSync(sitemap)) {
  for (const m of readFileSync(sitemap, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    enSitemap++;
    let path;
    try { path = new URL(m[1]).pathname; } catch { anotar(m[1] + '  (URL inválida)', '/sitemap.xml'); continue; }
    if (BP && !(path === BP || path.startsWith(BP + '/'))) { anotar(m[1] + '  (fuera del prefijo ' + BP + ')', '/sitemap.xml'); continue; }
    if (!resuelve(path.slice(BP.length))) anotar(m[1], '/sitemap.xml');
  }
}

if (rotos.size) {
  console.error(`\n✗ ${rotos.size} destino(s) interno(s) que no existen en ${OUT}/ (prefijo ${BP || '/'}):\n`);
  for (const [destino, desde] of rotos) {
    const unicos = [...new Set(desde)];
    console.error(`   ${destino}\n      ← ${unicos.slice(0, 3).join(', ')}${unicos.length > 3 ? ` y ${unicos.length - 3} más` : ''}`);
  }
  console.error('\nUn link que no lleva a ningún lado es una promesa rota: arreglá el destino o sacá el link.\n');
  process.exit(1);
}

console.log(`✓ links internos: ${revisados} links en ${htmls.length} páginas y ${enSitemap} URLs del sitemap, todos llevan a algo que existe`);
