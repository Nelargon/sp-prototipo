#!/usr/bin/env node
/**
 * Prueba el buscador de /planes contra el índice real (983 ítems), sin
 * navegador. Corre en segundos y es lo que hay que correr después de tocar
 * `lib/buscar-prestaciones.js` o los sinónimos del generador.
 *
 * Cada caso dice qué DEBE salir primero. Los casos no son inventados: son las
 * formas en que una familia escribe lo que le pidió el doctor — el idioma del
 * cliente, no el del tarifario (regla de lenguaje, CLAUDE.md).
 *
 *   node scripts/test-buscador.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buscar, indexar, norm } from '../lib/buscar-prestaciones.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const datos = JSON.parse(readFileSync(join(ROOT, 'lib/prestaciones.json'), 'utf8'));
const idx = indexar(datos);

/* [consulta, fragmento que debe aparecer en el PRIMER resultado] */
const CASOS = [
  ['resonancia', 'RMN'],
  ['resonancia de rodilla', 'RODILLA'],
  ['tomografia', 'TAC'],
  ['tomografía', 'TAC'],
  ['placa de torax', 'TORAX'],
  ['radiografia de rodilla', 'RODILLA'],
  ['hemograma', 'HEMOGRAMA'],
  ['analisis de sangre', 'SANGRE'],
  ['colesterol', 'COLESTEROL'],
  ['azucar', 'GLUCOSA'],
  ['cesarea', 'Cesárea'],
  ['parto', 'Parto'],
  ['operacion de vesicula', 'Colecist'],
  // "APENDICE" es un estudio de imagen real del master, y el nombre exacto
  // debe ganarle a la cirugía: quien escribe la palabra sola no dijo "operar".
  ['apendice', 'APENDICE'],
  ['operacion de apendice', 'Apendicetomía'],
  ['ecografia', 'ECO'],
  ['mamografia', 'MAMOGRAFIA'],
  // Consultas: el paciente nombra al médico, no a la especialidad
  ['psicologia', 'Psicología'],
  ['psicologo', 'Psicología'],
  ['psiquiatra', 'Psiquiatría'],
  ['pediatra', 'Pediatría'],
  ['dermatologo', 'Dermatología'],
  ['traumatologo', 'Traumatología'],
  ['oculista', 'Oftalmología'],
  ['otorrino', 'Otorrinolaringología'],
  ['nutricionista', 'Nutrición'],
  ['cardiologo', 'Cardiología'],
  // Lo que no cubre nadie: tiene que responder, no quedarse callado
  ['muela', 'Odontología'],
  ['dentista', 'Odontología'],
  ['quimio', 'oncológico'],
  ['bajar de peso', 'bariátrica'],
  ['enfermera a domicilio', 'Enfermería'],
  /* Los cuatro de la revisión del 6 ago 2026 (PR #89). Cada uno devolvía algo
     equivocado o nada; quedan acá para que no vuelvan. */
  ['RMN DE RODILLA.', 'RODILLA'],          // la puntuación de una orden copiada
  // Una palabra de más no puede dar vacío. Y lo primero tiene que ser la
  // exclusión: para quien pregunta esto, "el tratamiento no lo cubre ningún
  // plan" decide más que la consulta con el mastólogo.
  ['cancer de mama', 'oncológico'],
  ['cirugia de cerebro', 'alta complejidad'], // la exclusión manda, no un "Cubierto"
];

/* Casos con una condición propia, que no se expresa como "el primero contiene X". */
const CASOS_ESPECIALES = [
  {
    q: 'resonancia de rodilla',
    porque: 'la fila COMPLETA gana a la que tiene huecos de celda combinada',
    ok: (hits) => hits[0] && hits[0].b[0] !== -1 && hits[0].s[0] !== -1 && hits[0].o[0] !== -1,
  },
  {
    q: 'muela',
    porque: 'una exclusión nunca queda debajo de un resultado "Cubierto"',
    ok: (hits) => hits[0] && hits[0].t === 'x',
  },
];

let fallos = 0;
for (const [q, esperado] of CASOS) {
  const { hits, total } = buscar(datos, idx, q);
  const primero = hits[0];
  const ok = primero && norm(primero.n).includes(norm(esperado));
  if (!ok) {
    fallos++;
    console.log(`✘ "${q}" → ${primero ? `"${primero.n}"` : 'SIN RESULTADOS'} (esperaba algo con "${esperado}")`);
    hits.slice(0, 4).forEach((h) => console.log(`     · ${h.n}`));
  } else {
    console.log(`✔ ${q.padEnd(24)} → ${primero.n.slice(0, 46).padEnd(46)} (${total} resultado${total === 1 ? '' : 's'})`);
  }
}

for (const c of CASOS_ESPECIALES) {
  const { hits } = buscar(datos, idx, c.q);
  if (c.ok(hits)) {
    console.log(`✔ ${c.q.padEnd(24)} → ${(hits[0] ? hits[0].n : '—').slice(0, 46).padEnd(46)} (${c.porque})`);
  } else {
    fallos++;
    console.log(`✘ "${c.q}" — ${c.porque}`);
    hits.slice(0, 3).forEach((h) => console.log(`     · [${h.t}] ${h.n}  ${JSON.stringify([h.b[0], h.s[0], h.o[0]])}`));
  }
}

/* Ninguna búsqueda razonable debería devolver cero: un cero en una página de
   transparencia se lee como "no lo cubre". */
console.log('');
if (fallos) {
  console.log(`✘ ${fallos} caso(s) fallaron.`);
  process.exit(1);
}
console.log(`✔ ${CASOS.length + CASOS_ESPECIALES.length}/${CASOS.length + CASOS_ESPECIALES.length} — el buscador responde en el idioma del cliente.`);
