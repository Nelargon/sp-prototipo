// El sitio es solo claro, y su texto de fondo aguanta igual un modo oscuro
// forzado (23/10/2026, BITACORA cap. 155).
//
// En el celular de Arturo, Samsung Internet en modo oscuro repintó la Guía
// Médica con colores propios: el fondo pasó a negro y el tapiz de nombres, que
// era un gris opaco casi igual al fondo, quedó blanco pleno encima de todo.
// Dos defensas, y este control mira las dos:
//
// 1. Cada página declara <meta name="color-scheme" content="only light">
//    (viewport de app/layout.jsx). Chrome deja de oscurecer la página; Samsung
//    Internet no siempre la respeta.
// 2. El texto que es textura (el tapiz de la guía y el muro de la home: toda
//    regla de CSS cuyo selector diga «tapiz» o «muro») se pinta con un color
//    transparente, nunca opaco. El navegador aclara el texto oscuro y conserva
//    su transparencia, así que sigue siendo textura; un gris opaco claro lo
//    deja tal cual sobre el fondo ya oscurecido.
//
// Uso:  node qa/modo-oscuro.mjs out
// Antes de mirar el sitio se prueba a sí mismo con casos que tienen que marcar
// y casos que no (CLAUDE.md, BITACORA cap. 89). Afuera: _next. Hasta el
// 23/10/2026 quedaba afuera también la guía vieja (guia/, páginas sueltas que no
// pasaban por el layout), y el patrón /guia/ se llevaba de arrastre las guías
// de lectura del blog (/blog/guia/…), que sí pasan por el layout: ahora entran.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function sinSoloClaro(html) {
  const m = html.match(/<meta[^>]+name="color-scheme"[^>]*>/i);
  return !m || !/content="only light"/i.test(m[0]);
}

const tokens = (css) => Object.fromEntries([...css.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)].map((m) => [m[1], m[2].trim()]));

function transparente(valor, defs, vueltas = 0) {
  const v = valor.replace(/!important/, '').trim();
  if (v === 'transparent') return true;
  const alfa = v.match(/^(?:rgba|hsla)\([^)]*,\s*([\d.]+)\s*\)$/i) || v.match(/^(?:rgb|hsl)\([^)]*\/\s*([\d.]+)\s*\)$/i);
  if (alfa) return parseFloat(alfa[1]) < 1;
  const ref = v.match(/^var\((--[\w-]+)\)$/);
  if (ref && defs[ref[1]] && vueltas < 5) return transparente(defs[ref[1]], defs, vueltas + 1);
  return false;
}

// Los colores opacos de las reglas de texto de fondo («tapiz», «muro»).
export function texturasOpacas(css) {
  const defs = tokens(css);
  const malas = [];
  for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim();
    if (!/tapiz|muro/i.test(selector)) continue;
    for (const d of m[2].matchAll(/(?:^|[;\s])color\s*:\s*([^;]+)/g)) {
      if (!transparente(d[1], defs)) malas.push(`${selector}{color:${d[1].trim()}}`);
    }
  }
  return malas;
}

const PRUEBAS_META = [
  ['<head><meta name="color-scheme" content="only light"/></head>', false],
  ['<head><meta name="color-scheme" content="light dark"/></head>', true],
  ['<head><meta name="viewport" content="width=device-width"/></head>', true],
];
const PRUEBAS_TEXTURA = [
  ['.gm-tapiz{position:fixed;color:#EBEDEF;text-align:justify}', 1],
  ['.gm-tapiz{position:fixed;color:rgba(0,27,52,.0353)}', 0],
  [':root{--sp-muro:#E9EBED}.muro-pleno .muro-texto{color:var(--sp-muro)}', 1],
  [':root{--sp-muro:rgba(0,27,52,.0471)}.muro-pleno .muro-texto{color:var(--sp-muro)}', 0],
  ['.muro-oscuro .muro-texto{color:rgba(255,255,255,1)}', 1],
  ['.muro-claro .muro-texto{color:rgb(0 27 52 / .03)}', 0],
  ['.muro-marco{position:absolute;inset:0}', 0],
  ['.gm-tapiz{background-color:#fff}', 0],
  ['.dta-tarjeta{color:#003B71}', 0],
];

function autoprueba() {
  const fallas = [];
  for (const [h, espera] of PRUEBAS_META) if (sinSoloClaro(h) !== espera) fallas.push(`meta: ${h} → esperaba ${espera ? 'marcar' : 'pasar'}`);
  for (const [c, n] of PRUEBAS_TEXTURA) if (texturasOpacas(c).length !== n) fallas.push(`textura: ${c} → esperaba ${n}`);
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
  if (fallas.length) { console.error('✗ el detector de modo oscuro falla en sus propios casos:\n  ' + fallas.join('\n  ')); process.exit(1); }
  const dir = process.argv[2] || 'out';
  const hallazgos = [];
  const paginas = archivos(dir, /\.html$/, /\/_next(\/|$)/);
  for (const f of paginas) if (sinSoloClaro(readFileSync(f, 'utf8'))) hallazgos.push(`sin color-scheme «only light» en ${f.slice(dir.length) || '/'}`);
  const estilos = archivos('app', /\.css$/, /node_modules/);
  for (const f of estilos) for (const t of texturasOpacas(readFileSync(f, 'utf8'))) hallazgos.push(`texto de fondo con color opaco en ${f}: ${t}`);
  if (hallazgos.length) {
    console.error('✗ modo oscuro (BITACORA cap. 155):\n  ' + hallazgos.join('\n  '));
    process.exit(1);
  }
  console.log(`✓ modo oscuro: ${PRUEBAS_META.length + PRUEBAS_TEXTURA.length} casos de prueba bien · ${paginas.length} páginas solo claras · tapiz y muro con transparencia`);
}
