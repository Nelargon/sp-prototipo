// SP es «medicina prepaga», nunca «seguro», cuando habla de sí misma o de lo
// que vende; y no se compara con la competencia (CLAUDE.md, regla de lenguaje;
// sp-interno#104, 04/10/2026). «Seguro médico» como categoría en una
// estadística con fuente («7 de cada 10 paraguayos no tienen ningún seguro
// médico») sí puede quedar: por eso el detector busca FORMAS de presentarse, no
// la palabra suelta. Nació de la revisión mensual del Guardián (sp-interno#136,
// P2): #104 lo encontró una sesión, no un control.
//
// Uso:  node qa/seguro-propio.mjs out
// Antes de mirar el sitio se prueba a sí mismo con frases que tienen que
// marcar y frases que no (regla de CLAUDE.md, BITACORA cap. 89): si el
// detector falla en sus propios casos, corta antes de opinar sobre el sitio.
//
// Afuera a propósito: el blog (/blog/, lo controla la compuerta del motor,
// sp-contenido#238) y /v1 (congelado, como en el QA integral).

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const PATRONES_SEGURO = [
  [/\bplan(?:es)? de seguro\b/i, '«plan de seguro»'],
  [/\bseguro (?:médico|de salud) (?:familiar|para (?:tu|toda la) familia)\b/i, '«seguro médico familiar»'],
  [/\b(?:tu|nuestros?|nuestras?) seguros?\b/i, '«tu seguro» / «nuestro seguro»'],
  [/\bun seguro no es un gasto\b/i, '«un seguro no es un gasto»'],
  [/\bsomos (?:un|una|tu) (?:seguro|aseguradora)\b/i, '«somos un seguro / una aseguradora»'],
  [/\bcasi nadie te garantiza\b/i, 'comparación con la competencia («casi nadie te garantiza»)'],
];

export function seguroPropio(texto) {
  for (const [re, nombre] of PATRONES_SEGURO) {
    const m = texto.match(re);
    if (m) return { nombre, cerca: texto.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30).replace(/\s+/g, ' ').trim() };
  }
  return null;
}

const DEBEN_MARCAR = [
  'Salud Protegida — Planes de seguro médico familiar en Paraguay',
  'Encontrá el plan de seguro médico ideal para tu familia.',
  'Como el médico de la familia, pero para tu seguro.',
  'Un seguro no es un gasto: cambia una cuenta impredecible por una cuota que conocés.',
  'Lo que casi nadie te garantiza.',
  'Somos una aseguradora paraguaya.',
  'Nuestro seguro te cubre desde el primer día.',
];
const NO_DEBEN_MARCAR = [
  '7 de cada 10 paraguayos no tienen ningún seguro médico.',
  'Salud Protegida — Medicina prepaga para tu familia en Paraguay',
  'Un plan de salud no es un gasto.',
  '¿Estás seguro de que tu plan cubre la resonancia?',
  'Es un lugar seguro para estacionar.',
  'La Superintendencia de Seguros publica los datos del sector.',
  'el seguro social (IPS) y las prepagas',
];

function autoprueba() {
  const fallas = [
    ...DEBEN_MARCAR.filter((t) => !seguroPropio(t)).map((t) => 'no marcó: ' + t),
    ...NO_DEBEN_MARCAR.filter((t) => seguroPropio(t)).map((t) => 'marcó en falso: ' + t),
  ];
  return fallas;
}

const visible = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ');
const metas = (html) => [...html.matchAll(/<meta[^>]+(?:name|property)="(?:description|og:description|og:title|twitter:title|twitter:description)"[^>]*content="([^"]*)"/gi)].map((m) => m[1]).join(' · ');

export function revisarCarpeta(dir) {
  const htmls = [];
  const walk = (d) => {
    for (const f of readdirSync(d)) {
      const full = join(d, f);
      if (statSync(full).isDirectory()) { if (!/\/(v1|blog|_next)(\/|$)/.test(full)) walk(full); }
      else if (f.endsWith('.html')) htmls.push(full);
    }
  };
  walk(dir);
  const hallazgos = [];
  for (const f of htmls) {
    const html = readFileSync(f, 'utf8');
    const h = seguroPropio(visible(html)) || seguroPropio(metas(html));
    if (h) hallazgos.push({ pagina: f.slice(dir.length) || '/', ...h });
  }
  return { paginas: htmls.length, hallazgos };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fallas = autoprueba();
  if (fallas.length) { console.error('✗ el detector de «seguro» falla en sus propios casos:\n  ' + fallas.join('\n  ')); process.exit(1); }
  const dir = process.argv[2] || 'out';
  const { paginas, hallazgos } = revisarCarpeta(dir);
  if (hallazgos.length) {
    console.error(`✗ «seguro» donde SP habla de sí misma (regla de lenguaje, sp-interno#104):`);
    for (const h of hallazgos) console.error(`  ${h.pagina} · ${h.nombre} · «…${h.cerca}…»`);
    process.exit(1);
  }
  console.log(`✓ seguro-propio: ${DEBEN_MARCAR.length + NO_DEBEN_MARCAR.length} casos de prueba bien · ${paginas} páginas sin «seguro» para SP (afuera: blog y /v1)`);
}
