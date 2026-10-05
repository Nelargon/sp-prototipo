// Dos reglas del sistema visual que se rompen sin que nadie lo note
// (decisiones de Arturo del 05/10/2026, sp-interno#107, láminas 73 y 75):
//
// 1. Ningún título termina en punto. Una sola regla, sin excepciones que
//    recordar; las preguntas conservan su signo. Se mide sobre lo construido
//    (h1, h2 y h3 de out/), porque el punto puede venir de un dato o de un
//    componente que arma el título en dos partes.
// 2. Toda sombra es uno de los tres niveles de la web (--sombra-sup,
//    --sombra-ctrl, --sombra-hoja / --sombra-abre). Se mide sobre el código:
//    un box-shadow con difuminado de más de 4 px escrito a mano es un cuarto
//    nivel que nadie decidió. Las líneas (difuminado 0) y los anillos de foco
//    no son sombras y no cuentan.
//
// Uso:  node qa/titulos-y-sombras.mjs out
// Antes de mirar el sitio se prueba a sí mismo con casos que tienen que marcar
// y casos que no (CLAUDE.md, BITACORA cap. 89).
// Afuera: el blog (sus títulos los escribe el motor), /v1 y la guía vieja.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const limpio = (s) => s.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();

export function titulosConPunto(html) {
  return [...html.matchAll(/<h([123])\b[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((m) => limpio(m[2]))
    .filter((t) => t && /\.$/.test(t) && !/\.\.\.$|…$/.test(t));
}

// Un box-shadow escrito a mano con una capa de difuminado mayor a 4 px. Las
// definiciones de los tokens (--sombra-*:) son el único lugar donde va eso.
export function sombrasSueltas(codigo) {
  const malas = [];
  for (const m of codigo.matchAll(/box-shadow\s*:\s*([^;'"`}]+)/gi)) {
    const valor = m[1];
    for (const capa of valor.split(/,(?![^(]*\))/)) {
      // Los largos pueden venir sin unidad («0»): se leen los números sueltos
      // después de sacar el color, y el tercero es el difuminado.
      const nums = capa.replace(/rgba?\([^)]*\)|hsla?\([^)]*\)|var\([^)]*\)|#[0-9a-f]{3,8}/gi, ' ')
        .split(/\s+/).filter((x) => /^-?\d*\.?\d+(px)?$/.test(x)).map((x) => parseFloat(x));
      if (!/inset/.test(capa) && nums.length >= 3 && nums[2] > 4) { malas.push(valor.trim()); break; }
    }
  }
  return malas;
}

const PRUEBAS_TITULOS = [
  ['<h1>Protección que <span>se siente</span>.</h1>', 1],
  ['<h2 class="disp">Lo que nuestros planes <span>no cubren.</span></h2>', 1],
  ['<h1>Protección que <span>se siente</span></h1>', 0],
  ['<h2>¿Hablamos? Estamos del otro lado</h2>', 0],
  ['<h3>¿Está tu médico?</h3>', 0],
  ['<p>Un párrafo termina en punto.</p>', 0],
];
const PRUEBAS_SOMBRAS = [
  ["style={css('box-shadow:0 24px 60px rgba(0,20,45,0.28)')}", 1],
  ['.x{box-shadow:var(--sombra-sup),0 24px 60px rgba(0,27,52,.07)}', 1],
  ['.x{box-shadow:var(--sombra-sup)}', 0],
  ['.x{box-shadow:0 0 0 4px rgba(0,188,180,.16)}', 0],
  ['.x{box-shadow:0 1px 0 rgba(0,59,113,.08)}', 0],
  ['.x{box-shadow:inset 0 0 0 2px var(--sp-teal)}', 0],
  ['.x{box-shadow:0 1px 2px rgba(0,27,52,.12),0 2px 4px rgba(0,27,52,.05)}', 0],
];

function autoprueba() {
  const fallas = [];
  for (const [t, n] of PRUEBAS_TITULOS) if (titulosConPunto(t).length !== n) fallas.push(`títulos: ${t} → esperaba ${n}`);
  for (const [c, n] of PRUEBAS_SOMBRAS) if (sombrasSueltas(c).length !== n) fallas.push(`sombras: ${c} → esperaba ${n}`);
  return fallas;
}

function archivos(dir, ext, saltear) {
  const out = [];
  const walk = (d) => {
    for (const f of readdirSync(d)) {
      const full = join(d, f);
      if (statSync(full).isDirectory()) { if (!saltear.test(full)) walk(full); }
      else if (ext.test(f)) out.push(full);
    }
  };
  walk(dir);
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fallas = autoprueba();
  if (fallas.length) { console.error('✗ el detector de títulos y sombras falla en sus propios casos:\n  ' + fallas.join('\n  ')); process.exit(1); }
  const dir = process.argv[2] || 'out';
  const hallazgos = [];
  const paginas = archivos(dir, /\.html$/, /\/(v1|blog|guia|_next)(\/|$)/);
  for (const f of paginas) for (const t of titulosConPunto(readFileSync(f, 'utf8'))) hallazgos.push(`título con punto en ${f.slice(dir.length) || '/'}: «${t}»`);
  const codigo = archivos('app', /\.(jsx?|css)$/, /node_modules/);
  for (const f of codigo) {
    const src = readFileSync(f, 'utf8').replace(/^\s*--sombra-[a-z-]+\s*:.*$/gm, '');
    for (const s of sombrasSueltas(src)) hallazgos.push(`sombra fuera de los tres niveles en ${f}: ${s}`);
  }
  if (hallazgos.length) {
    console.error('✗ títulos y sombras (láminas 73 y 75, sp-interno#107):\n  ' + hallazgos.join('\n  '));
    process.exit(1);
  }
  console.log(`✓ títulos y sombras: ${PRUEBAS_TITULOS.length + PRUEBAS_SOMBRAS.length} casos de prueba bien · ${paginas.length} páginas sin títulos con punto · ${codigo.length} archivos de app/ sin sombras sueltas`);
}
