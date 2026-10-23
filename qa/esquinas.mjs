// Las esquinas se eligen por su función, nunca con un número a mano
// (CLAUDE.md; BITACORA caps. 90 y 92): --r-xs chip, ícono chico o miniatura ·
// --r-sm botón, campo o ícono · --r-md aviso o tarjeta chica · --r-lg tarjeta
// grande o tabla · --r-pill cápsula. Este control lo hace cumplir sobre el
// código de app/ (sp-interno#60, 23/10/2026).
//
// Por qué existe. El conteo de qa-integral (sección 6c) daba verde con 13
// radios escritos a mano: perdonaba cada valor fuera de escala usado menos de 3
// veces («excepción local») y solo leía `border-radius:Npx` y `--sq:Npx` con el
// primer número. No veía «0 12px 12px 0» (dos casos con el valor exacto de un
// token), el respaldo `var(--sq,10px)`, las esquinas sueltas, el `borderRadius`
// de React, rem, decimales ni `radius={N}`. Un control más tolerante que la
// regla es, para lo que deja pasar, como no tenerlo.
//
// Qué marca: toda declaración de radio (border-radius, sus cuatro esquinas y
// sus cuatro esquinas lógicas —border-start-start-radius…—, en CSS y en
// camelCase, --sq y el prop `radius` de un componente) cuyo valor lleve un largo
// (px, rem o em) distinto de cero después de reemplazar los var(--r-*). No marca
// porcentajes (los círculos, 50%), calc(var(--r-lg) * 1.8) ni 0.
// La escala vive en un solo lugar: el :root de app/globals.css (--r-xs:10px…).
// Ahí las declaraciones de los tokens son el sistema y no cuentan; una
// declaración de --r-* en cualquier otro lugar es un radio a mano con nombre de
// token (`--r-lg:26px;--sq:var(--r-lg)` daba verde) y se marca.
// Un valor que el detector no puede leer (armado con ${…}, con un + o con una
// variable suelta, `borderRadius: R`) se marca como «no verificable»: lo que no
// se puede revisar no se da por bueno (verificador de código, 23/10/2026).
// Las excepciones van en EXCEPCIONES_RADIO, cada una con su porqué y cuántas
// veces aparece: si cambia o desaparece, también avisa (una excepción vencida).
//
// Uso:  node qa/esquinas.mjs        (sale con 1 si hay un radio a mano)
// Antes de mirar el código se prueba a sí mismo con casos que tienen que marcar
// y casos que no (CLAUDE.md, BITACORA cap. 89). qa-integral lo usa también.
// Afuera: la guía vieja (guia/, Tailwind), el correo del blog (los clientes de
// correo no leen var()) y los `rx` de los SVG, que son parte del dibujo.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Un largo escrito a mano: número con unidad de largo.
const LARGO = /(?<![\w.-])(\d*\.?\d+)(px|rem|em)\b/g;
// Dónde vive la escala: el único lugar donde declarar --r-* es el sistema.
export const ESCALA = 'app/globals.css';
// Las palabras de CSS que un radio puede decir sin ser un largo.
const PALABRA_CSS = /^(?:TOKEN|inherit|initial|unset|revert|revert-layer|none)$/;

export function radiosAMano(codigo, archivo = '') {
  let sinComentarios = codigo.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  // Las declaraciones de la escala (--r-xs:10px) son el sistema, no una fuga,
  // pero solo en el :root de app/globals.css.
  if (archivo === ESCALA) sinComentarios = sinComentarios.replace(/:root\s*\{[^}]*\}/g, (b) => b.replace(/--r-[a-z]+\s*:\s*[^;}]+;?/g, ''));
  const malos = [];
  const DECL = /(border(?:-(?:top|bottom)-(?:left|right)|-(?:start|end)-(?:start|end))?-radius|border(?:(?:Top|Bottom)(?:Left|Right)|(?:Start|End)(?:Start|End))?Radius|--sq|--r-[a-z]+)\s*:\s*(['"`]?)([^;'"`}]*)|\bradius=\{\s*([^}]*?)\s*\}|\bradius=["'](\d*\.?\d+(?:px|rem|em))["']/g;
  for (const m of sinComentarios.matchAll(DECL)) {
    if (m[5]) { malos.push(m[0].trim()); continue; }
    if (m[4] !== undefined) {
      // radius={14} marca; radius={R} no se puede leer.
      if (/^\d*\.?\d+$/.test(m[4])) { if (parseFloat(m[4]) !== 0) malos.push(m[0].trim()); }
      else if (!/^['"]var\(--r-[a-z]+\)['"]$/.test(m[4])) malos.push('no verificable: ' + m[0].trim());
      continue;
    }
    const prop = m[1];
    // Un token redefinido fuera de la escala: un radio a mano con nombre de token.
    if (/^--r-/.test(prop)) { malos.push('token redefinido: ' + m[0].trim()); continue; }
    let valor = m[3].trim();
    const esJS = /Radius$/.test(prop);
    // Armado con ${…} (template) o con un + (concatenación): no se puede leer.
    // En `'border-radius:' + r + 'px'` la comilla que sigue a los dos puntos
    // cierra el texto y lo que queda es «+ r +».
    if (/\$\{/.test(valor) || /^\+|\+$/.test(valor) || (esJS && m[2] === '' && /[+?]/.test(valor))) { malos.push('no verificable: ' + m[0].trim()); continue; }
    // borderRadius: 6 (React pone px a un número sin unidad).
    if (esJS && /^\d*\.?\d+\s*,?$/.test(valor) && parseFloat(valor) !== 0) { malos.push(m[0].trim()); continue; }
    // Lo que va dentro de un var() del sistema no es un largo a mano; el
    // respaldo de var(--sq,10px) sí, y cae solo.
    valor = valor.replace(/var\(--r-[a-z]+\)/g, 'TOKEN');
    // borderRadius: R (una variable suelta, en JS, sin comillas).
    if (esJS && m[2] === '' && /^[A-Za-z_$][\w$.]*\s*,?$/.test(valor) && !PALABRA_CSS.test(valor.replace(/,$/, '').trim())) { malos.push('no verificable: ' + m[0].trim()); continue; }
    if ([...valor.matchAll(LARGO)].some((x) => parseFloat(x[1]) !== 0)) malos.push(m[0].trim());
  }
  return malos;
}

// [código, cuántos tiene que marcar, leído como (archivo)]: los que marcan y
// los que no.
export const PRUEBAS_RADIOS = [
  ["css('--sq:26px;padding:44px')", 1],
  ['.art-body blockquote{border-radius:0 12px 12px 0}', 1],
  ['.sq{border-radius:var(--sq,10px)}', 1],
  ['<div style={{ borderRadius: 6 }} />', 1],
  ["<div style={{ borderRadius: '14px' }} />", 1],
  ['.x{border-top-left-radius:8px}', 1],
  ['<Cover radius={14} />', 1],
  ['.x{border-radius:.75rem}', 1],
  ['.x{border-radius:6.5px}', 1],
  ['.hoja-panel{border-radius:22px 22px 0 0}', 1],
  // 23/10/2026 (verificador de código): el token redefinido fuera de la escala,
  // las esquinas lógicas y lo que no se puede leer.
  ["css('--r-sm:7px;border-radius:var(--r-sm)')", 1],
  [':root{--r-lg:26px}', 1, 'app/page.jsx'],
  ['.x{border-start-start-radius:8px}', 1],
  ['<div style={{ borderEndStartRadius: 8 }} />', 1],
  ['const e = css(`border-radius:${r}px`)', 1],
  ["const e = css('border-radius:' + r + 'px')", 1],
  ['<div style={{ borderRadius: R }} />', 1],
  ['<Cover radius={R} />', 1],
  ["css('--sq:var(--r-lg);padding:44px')", 0],
  ['.x{border-radius:var(--r-lg) var(--r-lg) 0 0}', 0],
  ['.x{border-radius:calc(var(--r-lg) * 1.8) calc(var(--r-lg) * 1.8) 0 0}', 0],
  ['.x{border-radius:50%}', 0],
  ['.x{border-radius:var(--r-pill)}', 0],
  ['.sq{border-radius:var(--sq,var(--r-xs))}', 0],
  [':root{--r-lg:20px;--r-md:16px}', 0, ESCALA],
  [':root{--r-sm:12px}', 0, ESCALA],
  ['.x{border-radius:0}', 0],
  ['/* radius 16/20/22px y sombra */', 0],
  ['<Cover radius="var(--r-lg)" />', 0],
  ['.x{border-end-end-radius:var(--r-md)}', 0],
  ["<div style={{ borderRadius: 'var(--r-sm)' }} />", 0],
  ['.x{border-radius:inherit}', 0],
];

export function autoprueba() {
  return PRUEBAS_RADIOS.filter(([c, n, a]) => radiosAMano(c, a).length !== n).map(([c, n, a]) => `${c}${a ? ' (como ' + a + ')' : ''} → esperaba ${n}, dio ${radiosAMano(c, a).length}`);
}
const MARCAN = PRUEBAS_RADIOS.filter(([, n]) => n).length;

// Las excepciones, con su porqué. Cada una tiene que seguir existiendo, tantas
// veces como dice: si alguien la cambia, se revisa.
export const EXCEPCIONES_RADIO = [
  { archivo: 'app/historia/page.jsx', decl: 'border-radius:14px', veces: 2, porque: '/historia/ no se toca (HANDOFF, 24/09/2026): sus dos botones quedan con 14px' },
  { archivo: 'app/components/Simulador.jsx', decl: 'border-radius:6px', veces: 1, porque: 'la casilla de 22 px de los adicionales: con --r-xs se lee redonda, la forma de una opción única; hoy no se ve (los planes vigentes no tienen adicionales)' },
];

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

// Cada radio a mano de app/ que no es una excepción, y las excepciones vencidas.
export function revisarApp(raiz = RAIZ) {
  const archivos = [];
  (function walk(d) {
    for (const x of readdirSync(d)) {
      const full = join(d, x);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(jsx?|css)$/.test(x)) archivos.push(full);
    }
  })(join(raiz, 'app'));
  const hallazgos = [];
  const usadas = new Map();
  let declaraciones = 0;
  for (const a of archivos) {
    const rel = a.slice(raiz.length + 1);
    const codigo = readFileSync(a, 'utf8');
    declaraciones += (codigo.match(/border(?:-(?:top|bottom)-(?:left|right)|-(?:start|end)-(?:start|end))?-radius\s*:|Radius\s*:|--sq\s*:/g) || []).length;
    for (const d of radiosAMano(codigo, rel)) {
      const ex = EXCEPCIONES_RADIO.find((e) => e.archivo === rel && d.replace(/\s/g, '') === e.decl);
      if (ex) { usadas.set(ex, (usadas.get(ex) || 0) + 1); continue; }
      hallazgos.push(rel + ': ' + d);
    }
  }
  for (const e of EXCEPCIONES_RADIO) if ((usadas.get(e) || 0) !== e.veces) hallazgos.push(`excepción vencida o cambiada: ${e.archivo} ${e.decl} (esperaba ${e.veces}, hay ${usadas.get(e) || 0})`);
  return { hallazgos, declaraciones, archivos: archivos.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const f = autoprueba();
  if (f.length) { console.error('✗ esquinas: el detector no distingue lo que debe marcar:\n  ' + f.join('\n  ')); process.exit(1); }
  console.log('✓ esquinas, autoprueba: ' + PRUEBAS_RADIOS.length + ' casos bien (' + MARCAN + ' que marcan y ' + (PRUEBAS_RADIOS.length - MARCAN) + ' que no)');
  const r = revisarApp(process.argv[2] || RAIZ);
  if (r.hallazgos.length) {
    console.log('✗ esquinas: ' + r.hallazgos.length + ' radio(s) escrito(s) a mano en app/ — elegí el token por su función (--r-xs, --r-sm, --r-md, --r-lg, --r-pill):\n  ' + r.hallazgos.join('\n  '));
    process.exit(1);
  }
  console.log('✓ esquinas: ' + r.declaraciones + ' declaraciones de radio en ' + r.archivos + ' archivos, todas por token; ' + EXCEPCIONES_RADIO.length + ' excepciones declaradas');
}
