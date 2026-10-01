import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { interpretar, detectarUrgencia, indexar, filtrar } from '../lib/red-medica.js';

const positivos = [
  'dolor de pecho', 'dolor en el pecho', 'me duele el pecho',
  'ME DUELE EL PECHO!', 'me falta el aire', 'falta de aire',
  'no puedo respirar', 'no puede respirar', 'hemorragia',
  'no tengo dolor de pecho, pero me falta el aire',
  'sin dolor de pecho; no puedo respirar',
  'no tengo dolor de pecho y me falta el aire',
  'dolor de pecho, no tengo dolor de pecho',
  '¿Me duele el pecho?', 'no sé si es dolor de pecho',
];
const negativos = [
  '', 'pediatra', 'dolor de cabeza', 'me duele la cabeza',
  'no tengo dolor de pecho', 'no tiene dolor en el pecho',
  'sin dolor de pecho', 'no me duele el pecho',
  'no me falta el aire', 'no tengo falta de aire',
  'no siento dolor de pecho', 'no hay hemorragia',
  'accidental', 'desmayos', 'infartologia',
];
for (const q of positivos) assert.equal(detectarUrgencia(q), true, q);
for (const q of negativos) assert.equal(detectarUrgencia(q), false, q);
for (const q of [...positivos, ...negativos]) {
  assert.equal(interpretar(q).urg, detectarUrgencia(q), 'integración: ' + q);
}
assert.deepEqual(interpretar('me duele el pecho').esp, ['Clínica Médica']);
assert.deepEqual(interpretar('mi hijo tiene fiebre').esp, ['Pediatría']);
assert.match(interpretar('me duele la cabeza').motivo, /Como orientación, podés explorar/);
assert.match(interpretar('mi hijo tiene fiebre').motivo, /podés explorar Pediatría/);

// La libre exploración y los filtros de red no dependen de la alerta.
const prestadores = [
  { n: 'A', e: 'Clínica Médica', c: 'Asunción', dp: 'Capital', r: ['privilege'] },
  { n: 'B', e: 'Neurología', c: 'Asunción', dp: 'Capital', r: ['privilege'] },
  { n: 'C', e: 'Neurología', c: 'Luque', dp: 'Central', r: ['esencial_ac'] },
];
const indice = indexar(prestadores);
assert.equal(filtrar(prestadores, indice, { esp: 'Neurología' }).length, 2);
assert.equal(filtrar(prestadores, indice, { esp: 'Neurología', plan: 'silver-gold' }).length, 1);

// Contrato de presentación; el build verifica JSX. No sustituye QA visual.
const ui = readFileSync(new URL('../app/guia-medica/GuiaMedica.jsx', import.meta.url), 'utf8');
assert.ok(ui.includes('{sint.motivo && !sint.urg &&'));
assert.ok(ui.includes('no son un diagnóstico ni indican que sea seguro esperar'));
assert.ok(ui.includes('buscá ayuda urgente aunque no aparezca una alerta'));
assert.ok(ui.includes('¿Es una emergencia? Llamá a la ambulancia, las 24 horas'));
console.log('✓ Síntomas: 30 frases, integración, orientación, filtros y contrato de avisos');
