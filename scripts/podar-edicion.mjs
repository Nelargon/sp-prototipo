/* Poda del export según la edición (hook "postbuild"). Ver app/edicion.js.

   Next construye TODA ruta que exista bajo app/, mire quien la mire: esconder
   los links no saca las páginas del export. Sin esta poda, /mi-sp/ y /blog/
   quedarían publicados y accesibles por URL directa en la v1 — páginas
   huérfanas que nadie mantiene y que Google puede encontrar igual.

   Después de podar, verifica que ningún HTML publicado quedó apuntando a lo
   que se podó. Esa verificación es el punto del script: el error que ya nos
   costó caro (HANDOFF, PRs #91/#92) no aparece en el diff — solo se ve
   mirando el sitio entero. Un link roto en producción no es un detalle de
   estilo, es la promesa de la marca. */
import { rmSync, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const LANZAMIENTO = process.env.NEXT_PUBLIC_EDICION === 'lanzamiento';
if (!LANZAMIENTO) process.exit(0);

const BP = process.env.NEXT_PUBLIC_BASE_PATH || '';
const OUT = 'out';

// Qué se poda y por qué. El snapshot /v1/ entra también: es referencia
// congelada del home viejo, material interno, no una página del sitio.
const PODAR = [
  ['mi-sp', 'Mi SP — no se lanza en la v1'],
  ['blog', 'el blog — no se lanza en la v1'],
  ['guia', 'el molde viejo de la Guía Médica (datos ilustrativos) — la v1 usa /guia-medica/'],
  ['agendar', 'agendar un turno — sale de la v1 el 23/09/2026 (versión preliminar, solo prototipo)'],
  ['historia', 'el manifiesto en scrollytelling — 720vh, no entra en la v1'],
  ['v1', 'snapshot congelado del home viejo — referencia interna'],
];

for (const [dir, porque] of PODAR) {
  const ruta = join(OUT, dir);
  if (existsSync(ruta)) {
    rmSync(ruta, { recursive: true, force: true });
    console.log(`· podado out/${dir}/ — ${porque}`);
  }
}

// ── verificación: ningún HTML publicado puede linkear a lo podado ────────
const htmls = [];
(function recorrer(d) {
  for (const e of readdirSync(d)) {
    const f = join(d, e);
    if (statSync(f).isDirectory()) recorrer(f);
    else if (f.endsWith('.html')) htmls.push(f);
  }
})(OUT);

const rotos = [];
for (const f of htmls) {
  const html = readFileSync(f, 'utf8');
  for (const [dir] of PODAR) {
    // Solo hrefs reales: un string suelto en un chunk de JS no es un link.
    const re = new RegExp('href="' + BP.replace(/[/]/g, '\\/') + '\\/' + dir + '[/"]', 'g');
    const n = (html.match(re) || []).length;
    if (n) rotos.push(`${f} → ${n} link(s) a /${dir}/`);
  }
}

if (rotos.length) {
  console.error('\n✗ La edición de lanzamiento quedó con links a módulos podados:\n');
  for (const r of rotos) console.error('   ' + r);
  console.error('\nEsconder la ruta no alcanza: hay que esconder también el link.');
  console.error('Poné el link detrás de la constante CON_… que corresponda (app/edicion.js).\n');
  process.exit(1);
}

console.log(`✓ edición de lanzamiento: ${htmls.length} páginas, sin links a módulos podados`);
