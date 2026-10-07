#!/usr/bin/env node
/**
 * Prueba cómo se muestran los teléfonos de la Guía Médica (telVisible de
 * lib/red-medica.js), sin navegador.
 *
 * La planilla los trae con +595 y la Guía los muestra como se leen en
 * Paraguay: «(021) 319 0000», «(0981) 427 544» (Arturo, 07/10/2026,
 * sp-interno#164 «3A» y «1A» para la Guía). En una guía médica, un teléfono
 * mal escrito es un paciente que no llega: por eso cada número de la Guía se
 * compara dígito por dígito con el original, y el enlace para llamar se
 * controla aparte.
 *
 *   node scripts/test-telefonos.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { telVisible, telHref } from '../lib/red-medica.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const guia = JSON.parse(readFileSync(join(ROOT, 'lib/guia-medica.json'), 'utf8'));
const fallas = [];

/* Las cuatro formas que hay en la planilla, y lo que no tiene que tocar. */
const CASOS = [
  ['+595 981 427 544', '(0981) 427 544'],   // celular
  ['+595 21 208 162', '(021) 208 162'],     // fijo de 6 cifras
  ['+595 21 319 00 00', '(021) 319 0000'],  // fijo de 7 cifras
  ['+595 742 20 400', '(0742) 20 400'],     // fijo del interior, de 5 cifras
  // Lo que no tiene una forma conocida se muestra tal cual: con +595 sirve,
  // mal reescrito no.
  ['021 3190000', '021 3190000'],
  ['+595 21 3190000', '+595 21 3190000'],
  ['+54 11 4321 0000', '+54 11 4321 0000'],
];
for (const [entra, sale] of CASOS) {
  const r = telVisible(entra);
  if (r !== sale) fallas.push(`caso «${entra}»: dio «${r}», tenía que dar «${sale}»`);
}

/* El detector se prueba antes de creerle: una cifra perdida tiene que saltar. */
const mismosDigitos = (original, visible) => '0' + original.replace(/\D/g, '').replace(/^595/, '') === visible.replace(/\D/g, '');
if (mismosDigitos('+595 21 319 00 00', '(021) 319 000')) fallas.push('el comparador no ve una cifra perdida');
if (!mismosDigitos('+595 21 319 00 00', '(021) 319 0000')) fallas.push('el comparador rechaza un número bien escrito');

/* Cada teléfono de la Guía: mismas cifras, sin +595 a la vista, enlace intacto. */
let total = 0, tal = 0;
for (const p of guia.prestadores) {
  for (const t of p.tel || []) {
    total++;
    const v = telVisible(t);
    if (v === t) { tal++; fallas.push(`${p.f} · «${t}» no tiene una forma conocida y se muestra con +595`); continue; }
    if (!/^\(0\d{2,3}\) \d{2,3} \d{3,4}$/.test(v)) fallas.push(`${p.f} · «${t}» → «${v}»: forma inesperada`);
    if (!mismosDigitos(t, v)) fallas.push(`${p.f} · «${t}» → «${v}»: cambiaron las cifras`);
    if (telHref(t) !== 'tel:+595' + t.replace(/\D/g, '').replace(/^595/, '')) fallas.push(`${p.f} · el enlace de «${t}» cambió`);
  }
}

if (fallas.length) {
  console.error(`✗ ${fallas.length} problema(s) con los teléfonos:\n` + fallas.slice(0, 40).map((f) => '  ' + f).join('\n'));
  process.exit(1);
}
console.log(`✓ Teléfonos: ${CASOS.length} casos fijos y los ${total} de la Guía, cifra por cifra (${tal} quedaron con +595).`);
