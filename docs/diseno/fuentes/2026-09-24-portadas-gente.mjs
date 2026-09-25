// PORTADAS DEL BLOG · LA GENTE, CON OTRA MANO (24/09/2026, quinta vuelta)
//
// Los dibujos de la lámina `docs/diseno/img/2026-09-24-portadas-gente-otra-mano.webp`
// (docs/diseno/README.md, lección 24). NO es código del sitio.
//
// Referencia de Arturo para las personas: cabeza grande y redonda con dos
// puntitos, cuerpo como una papa, brazos y piernas de palito, poses con
// movimiento. Se toma la manera de dibujar, no un personaje.
//
// `muneco(x, base, H, { pose, mira, nino, estilo, tinta, cara, detalle })`
//   pose: parado | camina | explica | duda | lleva · mira: 1 | -1 · nino: cabeza más grande
//   estilo: 1 cabeza blanca · 2 solo línea · 3 cuerpo de color · 4 con caras · 5 con pelo y detalles
//   detalle (estilo 5): mechon | colita | lentes | gorra | rulos | baston
// Capas: `formas` (papel al 20 %) · `tintas` (cuerpo en el -200 de la categoría)
// · `trazos` (blanco) · `llenos` (la cabeza blanca maciza, con ojos, boca y pelo
// en el color del fondo) · `sobre` (lo que asoma afuera de la cabeza, en blanco).
// Lección de la vuelta: lo blanco sobre la cabeza blanca no se ve; lo que va en
// la cara va en el color del fondo, que es la línea oscura de la referencia.

// Quinta vuelta: la gente con otra manera de dibujar (referencia de Arturo):
// cabeza grande y redonda con dos puntitos, cuerpo de papa, brazos y piernas de palito, poses con movimiento.
import { suave, semilla } from './2026-09-24-portadas-maneras-de-dibujar.mjs';
import { P, juntar, casa, hospital, globo, lista, suelo, temblor } from './2026-09-24-portadas-iteraciones.mjs';
const f = (v) => +v.toFixed(1);
let rs = 3; const rnd = () => ((rs = (rs * 16807) % 2147483647) / 2147483647) - 0.5;

const POSES = {
  parado:  { bD: [[0.07, 0.12], [0.09, 0.24]], bI: [[-0.07, 0.12], [-0.09, 0.24]], pD: [[0.03, 0.14], [0.04, 0.28]], pI: [[-0.03, 0.14], [-0.04, 0.28]] },
  camina:  { bD: [[0.09, 0.1], [0.16, 0.18]], bI: [[-0.08, 0.11], [-0.13, 0.2]], pD: [[0.1, 0.12], [0.12, 0.28]], pI: [[-0.05, 0.15], [-0.12, 0.27]] },
  explica: { bD: [[0.13, 0.03], [0.25, -0.03]], bI: [[-0.07, 0.12], [-0.08, 0.24]], pD: [[0.05, 0.14], [0.05, 0.28]], pI: [[-0.04, 0.14], [-0.06, 0.28]] },
  duda:    { bD: [[0.12, -0.02], [0.09, -0.14]], bI: [[-0.1, 0.1], [-0.14, 0.18]], pD: [[0.06, 0.13], [0.03, 0.28]], pI: [[-0.02, 0.15], [-0.07, 0.28]] },
  lleva:   { bD: [[0.12, 0.05], [0.22, 0.02]], bI: [[-0.06, 0.12], [-0.03, 0.22]], pD: [[0.1, 0.12], [0.12, 0.28]], pI: [[-0.05, 0.15], [-0.12, 0.27]] },
};
// estilo: 1 cabeza blanca · 2 solo línea · 3 cuerpo de color · 4 con caras · 5 con pelo y detalles
export function muneco(x, base, H, { pose = 'parado', mira = 1, nino = false, estilo = 1, tinta = '#fff', cara = 'tranqui', detalle = null, manoD = null, manoI = null } = {}) {
  const m = mira, po = POSES[pose];
  const r = (nino ? 0.24 : 0.19) * H, cy = base - H + r, cx = x + m * 0.03 * H;
  const byc = base - 0.47 * H + (nino ? 0.03 * H : 0), bry = (nino ? 0.17 : 0.2) * H, brx = (nino ? 0.14 : 0.15) * H;
  const cuerpoPts = []; for (let i = 0; i < 12; i++) { const t = (i / 12) * Math.PI * 2; const bul = Math.cos(t) * m > 0 && Math.sin(t) > -0.2 ? 1.1 : 1; cuerpoPts.push([x + Math.cos(t) * brx * bul + rnd() * 0.6, byc + Math.sin(t) * bry + rnd() * 0.6]); }
  const cuerpo = suave(cuerpoPts, 1, true);
  const cabezaPts = []; for (let i = 0; i < 12; i++) { const t = (i / 12) * Math.PI * 2; cabezaPts.push([cx + Math.cos(t) * r * 1.07 + rnd() * 0.5, cy + Math.sin(t) * r + rnd() * 0.5]); }
  const cabeza = suave(cabezaPts, 1, true);
  const hombro = (s) => [x + s * brx * 0.8, byc - bry * 0.45], cadera = (s) => [x + s * brx * 0.4, byc + bry * 0.85];
  const miembro = (o, rel, s) => { const [[ex, ey], [hx, hy]] = rel; const g = (dx) => dx * H * (s === 'D' ? m : m); return [o, [o[0] + g(ex), o[1] + ey * H], [o[0] + g(hx), o[1] + hy * H]]; };
  const brazoD = miembro(hombro(m), manoD || po.bD, 'D'), brazoI = miembro(hombro(-m), manoI || po.bI, 'I');
  const piernaD = miembro(cadera(m), po.pD, 'D'), piernaI = miembro(cadera(-m), po.pI, 'I');
  const linea3 = (pts) => `M${pts.map((p) => p.map(f).join(' ')).join(' L')}`;
  const pie = (pts) => { const [fx, fy] = pts[2]; return `M${f(fx)} ${f(fy)} l${f(m * 0.06 * H)} 0`; };
  const miembros = [linea3(brazoD), linea3(brazoI), linea3(piernaD), linea3(piernaI), pie(piernaD), pie(piernaI)];
  const ojos = [[cx + m * 0.48 * r, cy - 0.18 * r], [cx - m * 0.02 * r, cy + 0.1 * r]];
  const dot = ([ox, oy]) => `M${f(ox)} ${f(oy)} l.2 .2`;
  const caraL = [];
  if (estilo === 4) {
    if (cara === 'duda') caraL.push(`M${f(cx + m * 0.3 * r)} ${f(cy - 0.5 * r)} l${f(m * 0.3 * r)} ${f(-0.12 * r)}`, suave([[cx + m * 0.05 * r, cy + 0.5 * r], [cx + m * 0.25 * r, cy + 0.45 * r], [cx + m * 0.45 * r, cy + 0.52 * r]], 1));
    else if (cara === 'feliz') caraL.push(suave([[cx - m * 0.05 * r, cy + 0.42 * r], [cx + m * 0.22 * r, cy + 0.62 * r], [cx + m * 0.5 * r, cy + 0.4 * r]], 1));
    else caraL.push(suave([[cx + m * 0.0 * r, cy + 0.48 * r], [cx + m * 0.22 * r, cy + 0.56 * r], [cx + m * 0.44 * r, cy + 0.46 * r]], 1));
  }
  // detalles: `enCara` va sobre la cabeza blanca, en el color del fondo (como la línea oscura de la referencia);
  // `fuera` va afuera de la cabeza, en blanco.
  const enCara = [], fuera = [];
  const arco = (t0, t1, rr, n = 8) => [...Array(n + 1)].map((_, i) => { const t = t0 + (i / n) * (t1 - t0); return [cx + Math.cos(t) * rr * 1.07, cy + Math.sin(t) * rr]; });
  if (estilo === 5 && detalle) {
    if (detalle === 'mechon') { enCara.push(suave(arco(Math.PI * 1.15, Math.PI * 1.85, r * 0.72), 1)); fuera.push(`M${f(cx)} ${f(cy - r)} q${f(-0.05 * r)} ${f(-0.45 * r)} ${f(0.35 * r)} ${f(-0.5 * r)}`); }
    if (detalle === 'colita') { enCara.push(suave(arco(Math.PI * 1.05, Math.PI * 1.95, r * 0.7), 1)); fuera.push(suave([[cx - m * 0.95 * r, cy - 0.45 * r], [cx - m * 1.45 * r, cy - 0.6 * r], [cx - m * 1.55 * r, cy - 0.1 * r], [cx - m * 1.25 * r, cy + 0.1 * r]], 1)); }
    if (detalle === 'lentes') { enCara.push(suave([...Array(9)].map((_, i) => { const t = (i / 8) * Math.PI * 2; return [cx + m * 0.48 * r + Math.cos(t) * 0.24 * r, cy - 0.18 * r + Math.sin(t) * 0.24 * r]; })), suave([...Array(9)].map((_, i) => { const t = (i / 8) * Math.PI * 2; return [cx - m * 0.02 * r + Math.cos(t) * 0.22 * r, cy + 0.1 * r + Math.sin(t) * 0.22 * r]; })), `M${f(cx + m * 0.26 * r)} ${f(cy - 0.08 * r)} L${f(cx + m * 0.2 * r)} ${f(cy + 0.02 * r)}`); }
    if (detalle === 'gorra') { enCara.push(`M${f(cx - r * 0.98)} ${f(cy - 0.3 * r)} Q${f(cx)} ${f(cy - 0.42 * r)} ${f(cx + r * 0.98)} ${f(cy - 0.3 * r)}`); fuera.push(`M${f(cx + m * 0.98 * r)} ${f(cy - 0.3 * r)} l${f(m * 0.6 * r)} ${f(0.08 * r)}`); }
    if (detalle === 'rulos') { const pts = []; for (let i = 0; i <= 10; i++) { const t = Math.PI * 1.08 + (i / 10) * Math.PI * 0.84; const rr = r * (i % 2 ? 0.66 : 0.8); pts.push([cx + Math.cos(t) * rr * 1.07, cy + Math.sin(t) * rr]); } enCara.push(suave(pts, 1)); }
    if (detalle === 'baston') fuera.push(`M${f(brazoD[2][0])} ${f(brazoD[2][1])} L${f(brazoD[2][0] + m * 3)} ${f(base)} M${f(brazoD[2][0])} ${f(brazoD[2][1])} q${f(m * 5)} -3 ${f(m * 7)} 2`);
  }
  const det = [...enCara, ...fuera];
  // capas según estilo
  const o = P();
  if (estilo === 2) { o.trazos.push(...miembros, cuerpo, cabeza, ...det); o.trazos.push(...ojos.map(dot)); return o; }
  if (estilo === 3) o.tintas = [{ d: cuerpo, color: tinta }]; else o.formas.push(cuerpo);
  o.trazos.push(...miembros, cuerpo);
  o.llenos.push({ d: cabeza, lineas: [...ojos.map(dot), ...caraL, ...enCara] });
  o.sobre = fuera; // detalles blancos por encima de la cabeza (pelo, lentes van en color de fondo si están sobre la cara)
  return o;
}

export const juntarM = (...ps) => ps.reduce((a, p) => ({ formas: [...a.formas, ...(p.formas || [])], trazos: [...a.trazos, ...(p.trazos || [])], llenos: [...a.llenos, ...(p.llenos || [])], tintas: [...a.tintas, ...(p.tintas || [])], sobre: [...a.sobre, ...(p.sobre || [])] }), { formas: [], trazos: [], llenos: [], tintas: [], sobre: [] });

export function escenas(estilo, tinta) {
  semilla(31); temblor(1); rs = 3 + estilo;
  const E = estilo;
  const d = (k) => (E === 5 ? k : null);
  return {
    anota: juntarM(muneco(170, 164, 104, { pose: 'lleva', mira: 1, estilo: E, tinta, cara: 'tranqui', detalle: d('lentes') }), lista(196, 86, 30, 38), hospital(254, 164, 40, 66), suelo(104, 298, 165)),
    palabras: juntarM(muneco(150, 164, 92, { pose: 'duda', mira: 1, estilo: E, tinta, cara: 'duda', detalle: d('rulos') }), globo(116, 18, 50, 38, 146, 62, 'pregunta'),
      muneco(256, 164, 100, { pose: 'explica', mira: -1, estilo: E, tinta, cara: 'feliz', detalle: d('colita') }), globo(214, 10, 80, 44, 250, 58, 'lineas'), suelo(104, 298, 165)),
    cerca: juntarM(casa(110, 164, 38, 58), muneco(166, 164, 92, { pose: 'camina', mira: 1, estilo: E, tinta, cara: 'feliz', detalle: d('gorra'), manoD: [[0.07, 0.12], [0.12, 0.22]] }),
      muneco(203, 164, 60, { pose: 'camina', mira: 1, nino: true, estilo: E, tinta, cara: 'feliz', detalle: d('mechon') }),
      muneco(238, 164, 88, { pose: 'parado', mira: -1, estilo: E, tinta, cara: 'tranqui', detalle: d('baston') }), hospital(260, 164, 38, 72), suelo(104, 298, 165)),
  };
}
