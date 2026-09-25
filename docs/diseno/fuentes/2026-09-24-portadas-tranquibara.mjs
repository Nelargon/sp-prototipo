// PORTADAS DEL BLOG · TRANQUIBARA A MANO (24/09/2026)
//
// Los dibujos de la lámina `docs/diseno/img/2026-09-24-portadas-tranquibara.webp`
// (docs/diseno/README.md, lección 23). NO es código del sitio, y NO es el dibujo
// maestro de Tranquibara: es una versión a mano, en trazo blanco, para portadas.
//
// Reglas del personaje que respeta (el detalle vive en el repo privado
// sp-interno, en el documento de diseño de Tranquibara):
// - fijos: proporciones, hocico, orejas, tamaño y posición de los ojos. Los ojos
//   NUNCA se agrandan (más ojos = más infantil = más credulidad).
// - sereno · presente · sin pose de autoridad: nada de guardapolvo, carpeta ni
//   escritorio. Es un par que trabaja para SP, no la autoridad.
// - la cabeza girada hacia el contenido (`mira`: 1 derecha, -1 izquierda). De
//   frente, en línea blanca, se leía como un oso: el carpincho está en el hocico
//   largo, que solo se ve de tres cuartos (BITACORA cap. 105).
// - dónde va: libre en blog; sereno y sin chiste en carencias y copagos; NO en
//   notas sobre una enfermedad o un diagnóstico (menos personaje, más persona).
//
// `tranquibara(x, base, H, { brazos, ojos, mira, rot })` — brazos: 'colgando' |
// 'saluda' | 'libro' | 'explica' | 'explicaIzq'; ojos: 'abiertos' | 'cerrados'.
// El papel de la cabeza va calado en el hocico (fill-rule evenodd): así el hocico
// queda más oscuro, como en el original.

// Tranquibara a mano, en trazo blanco. Reglas de sp-interno/project/TRANQUIBARA-asistente.md §13:
// fijos: proporciones, hocico, orejas, tamaño y posición de los ojos (NUNCA más grandes), masa del cuerpo.
// Libres: vestuario, pose, escenario, nivel de detalle. Sereno · presente · sin pose de autoridad.
import { suave, circuloRelleno, cajaRelleno } from './2026-09-24-portadas-maneras-de-dibujar.mjs';
const f = (v) => +v.toFixed(1);

export function tranquibara(x, base, H, { brazos = 'colgando', ojos = 'abiertos', rot = 0, boca = 'tranqui', mira = 0 } = {}) {
  const a = (rot * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const R = ([px, py]) => [x + (px - x) * ca - (py - base) * sa, base + (px - x) * sa + (py - base) * ca];
  const S = (pts, k = 1, c = false) => suave(pts.map(R), k, c);
  const pt = (p) => R(p).map(f).join(' ');
  const hh = 0.4 * H, w = 0.24 * H, ht = base - H + 0.05 * H, hb = ht + hh;
  const head = [[x - w * 0.82, ht + hh * 0.1], [x - w * 0.3, ht], [x + w * 0.3, ht], [x + w * 0.82, ht + hh * 0.1], [x + w * 1.0, ht + hh * 0.45], [x + w * 1.06, ht + hh * 0.8],
    [x + w * 0.62, hb], [x, hb + hh * 0.03], [x - w * 0.62, hb], [x - w * 1.06, ht + hh * 0.8], [x - w * 1.0, ht + hh * 0.45]];
  const hocico = [[x - w * 0.62, ht + hh * 0.62], [x - w * 0.42, ht + hh * 0.96], [x + w * 0.42, ht + hh * 0.96], [x + w * 0.62, ht + hh * 0.62], [x, ht + hh * 0.52]];
  const oreja = (s) => { const cx = x + s * w * 0.6, cy = ht + hh * 0.045, r = 0.062 * H; return S([[cx - r, cy + 1.5], [cx - r * 0.85, cy - r * 0.55], [cx, cy - r * 0.95], [cx + r * 0.85, cy - r * 0.55], [cx + r, cy + 1.5]]); };
  const ey = ht + hh * 0.4, ex = w * 0.36;
  const ojo = (s) => ojos === 'cerrados'
    ? S([[x + s * ex - 3.2, ey], [x + s * ex, ey + 2.2], [x + s * ex + 3.2, ey]], 1)
    : `M${pt([x + s * ex, ey])} l.2 .2`;
  const nariz = S([[x - w * 0.2, ht + hh * 0.62], [x - w * 0.12, ht + hh * 0.57], [x + w * 0.12, ht + hh * 0.57], [x + w * 0.2, ht + hh * 0.62], [x + w * 0.1, ht + hh * 0.68], [x - w * 0.1, ht + hh * 0.68], [x - w * 0.2, ht + hh * 0.62]], 0.7);
  const bocaD = S([[x, ht + hh * 0.69], [x, ht + hh * 0.78]], 1) + ' ' + (boca === 'sonrie'
    ? S([[x - w * 0.2, ht + hh * 0.8], [x - w * 0.08, ht + hh * 0.84], [x, ht + hh * 0.78], [x + w * 0.08, ht + hh * 0.84], [x + w * 0.2, ht + hh * 0.8]], 1)
    : S([[x - w * 0.15, ht + hh * 0.82], [x - w * 0.06, ht + hh * 0.84], [x, ht + hh * 0.78], [x + w * 0.06, ht + hh * 0.84], [x + w * 0.15, ht + hh * 0.82]], 1));
  // Cabeza de tres cuartos, girada hacia el contenido (§13-Q13): el hocico largo es lo que lo hace carpincho.
  let cabeza = head, cabezaTr = null, hocicoTono = hocico;
  if (mira) {
    const m = mira, X = (dx) => x + m * dx;
    cabeza = [[X(-w * 0.92), ht + hh * 0.22], [X(-w * 0.45), ht + hh * 0.01], [X(w * 0.3), ht], [X(w * 0.8), ht + hh * 0.14], [X(w * 1.18), ht + hh * 0.4],
      [X(w * 1.34), ht + hh * 0.66], [X(w * 1.2), ht + hh * 0.9], [X(w * 0.55), hb + hh * 0.02], [X(-w * 0.35), hb - hh * 0.03], [X(-w * 0.95), ht + hh * 0.72], [X(-w * 1.03), ht + hh * 0.45]];
    hocicoTono = [[X(w * 0.36), ht + hh * 0.5], [X(w * 1.2), ht + hh * 0.42], [X(w * 1.34), ht + hh * 0.66], [X(w * 1.2), ht + hh * 0.9], [X(w * 0.55), hb], [X(w * 0.26), ht + hh * 0.76]];
    const orejaM = (cx, r) => S([[cx - r, ht + hh * 0.04 + 1.5], [cx - r * 0.85, ht + hh * 0.04 - r * 0.55], [cx, ht + hh * 0.04 - r * 0.95], [cx + r * 0.85, ht + hh * 0.04 - r * 0.55], [cx + r, ht + hh * 0.04 + 1.5]]);
    const ojoM = (ox, oy) => ojos === 'cerrados' ? S([[ox - 3, oy], [ox, oy + 2.1], [ox + 3, oy]], 1) : `M${pt([ox, oy])} l.2 .2`;
    const nx = X(w * 1.14), ny = ht + hh * 0.6;
    cabezaTr = [S(cabeza, 1, true), orejaM(X(-w * 0.3), 0.062 * H), orejaM(X(w * 0.42), 0.05 * H),
      ojoM(X(w * 0.18), ht + hh * 0.38), ojoM(X(w * 0.74), ht + hh * 0.35),
      S([[nx - m * w * 0.12, ny - 1], [nx, ny - 3], [nx + m * w * 0.12, ny + 1], [nx, ny + 4], [nx - m * w * 0.12, ny - 1]], 0.8),
      S([[nx - m * w * 0.02, ny + 5], [X(w * 1.0), ht + hh * 0.8], [X(w * 0.82), ht + hh * 0.84]], 1)];
  }
  // cuerpo: camisa y pantalón
  const bw = 0.2 * H, hem = base - 0.2 * H;
  const camisa = [[x - bw * 0.82, hb - 1], [x - bw * 1.02, hb + 0.12 * H], [x - bw * 1.02, hem], [x + bw * 1.02, hem], [x + bw * 1.02, hb + 0.12 * H], [x + bw * 0.82, hb - 1]];
  const tr = [
    ...(cabezaTr || [S(head, 1, true), oreja(-1), oreja(1), ojo(-1), ojo(1), nariz, bocaD]),
    S([[x - bw * 0.82, hb - 1], [x - bw * 1.02, hb + 0.12 * H], [x - bw * 1.02, hem]], 1), S([[x + bw * 0.82, hb - 1], [x + bw * 1.02, hb + 0.12 * H], [x + bw * 1.02, hem]], 1),
    S([[x - bw * 1.04, hem], [x, hem + 0.6], [x + bw * 1.04, hem]], 1),
    S([[x - bw * 0.36, hb + 0.4], [x, hb + 0.07 * H], [x + bw * 0.36, hb + 0.4]], 0.5), S([[x, hb + 0.07 * H], [x, hem - 1]], 1),
    // pantalón y pies
    S([[x - bw * 0.98, hem], [x - bw * 0.94, base - 0.06 * H]], 1), S([[x + bw * 0.98, hem], [x + bw * 0.94, base - 0.06 * H]], 1), S([[x, hem + 0.05 * H], [x, base - 0.06 * H]], 1),
    S([[x - bw * 0.96, base - 0.06 * H], [x - bw * 0.1, base - 0.06 * H]], 1), S([[x + bw * 0.1, base - 0.06 * H], [x + bw * 0.96, base - 0.06 * H]], 1),
    S([[x - bw * 0.9, base - 0.06 * H], [x - bw * 1.0, base], [x - bw * 0.2, base], [x - bw * 0.18, base - 0.06 * H]], 0.8),
    S([[x + bw * 0.18, base - 0.06 * H], [x + bw * 0.2, base], [x + bw * 1.0, base], [x + bw * 0.9, base - 0.06 * H]], 0.8),
  ];
  const sh = (s) => [x + s * bw * 1.02, hb + 0.05 * H];
  const brazo = (s, pts) => S([sh(s), ...pts], 1);
  const extra = [];
  if (brazos === 'colgando') {
    tr.push(brazo(-1, [[x - bw * 1.3, hb + 0.14 * H], [x - bw * 1.22, hb + 0.26 * H]]), brazo(1, [[x + bw * 1.3, hb + 0.14 * H], [x + bw * 1.22, hb + 0.26 * H]]));
  } else if (brazos === 'libro') {
    // leyendo y verificando: un cuaderno abierto con dos tildes
    const ly = hb + 0.1 * H, lw = 0.3 * H, lh = 0.16 * H;
    tr.push(brazo(-1, [[x - bw * 1.2, hb + 0.14 * H], [x - lw * 0.5, ly + lh * 0.7]]), brazo(1, [[x + bw * 1.2, hb + 0.14 * H], [x + lw * 0.5, ly + lh * 0.7]]));
    tr.push(S([[x - lw * 0.55, ly + lh * 0.1], [x - lw * 0.25, ly - lh * 0.05], [x, ly + lh * 0.12], [x + lw * 0.25, ly - lh * 0.05], [x + lw * 0.55, ly + lh * 0.1], [x + lw * 0.55, ly + lh], [x + lw * 0.25, ly + lh * 0.85], [x, ly + lh], [x - lw * 0.25, ly + lh * 0.85], [x - lw * 0.55, ly + lh], [x - lw * 0.55, ly + lh * 0.1]], 0.4));
    tr.push(S([[x, ly + lh * 0.12], [x, ly + lh]], 1));
    extra.push({ d: S([[x - lw * 0.55, ly + lh * 0.1], [x - lw * 0.25, ly - lh * 0.05], [x, ly + lh * 0.12], [x + lw * 0.25, ly - lh * 0.05], [x + lw * 0.55, ly + lh * 0.1], [x + lw * 0.55, ly + lh], [x, ly + lh], [x - lw * 0.55, ly + lh]], 0.4, true) });
  } else if (brazos === 'saluda') {
    tr.push(brazo(-1, [[x - bw * 1.3, hb + 0.14 * H], [x - bw * 1.22, hb + 0.26 * H]]), brazo(1, [[x + bw * 1.5, hb + 0.0 * H], [x + bw * 1.62, hb - 0.12 * H]]));
  } else if (brazos === 'explica') {
    tr.push(brazo(-1, [[x - bw * 1.3, hb + 0.14 * H], [x - bw * 1.22, hb + 0.26 * H]]), brazo(1, [[x + bw * 1.45, hb + 0.08 * H], [x + bw * 1.75, hb + 0.02 * H]]));
  } else if (brazos === 'explicaIzq') {
    tr.push(brazo(1, [[x + bw * 1.3, hb + 0.14 * H], [x + bw * 1.22, hb + 0.26 * H]]), brazo(-1, [[x - bw * 1.45, hb + 0.08 * H], [x - bw * 1.75, hb + 0.02 * H]]));
  }
  // papel: la cabeza con el hocico calado (queda más oscuro, como en el original) y la camisa
  const cabezaForma = { d: S(cabeza, 1, true) + ' ' + S(hocicoTono, 0.9, true), regla: 'evenodd' };
  const camisaForma = { d: S(camisa, 0.9, true) };
  return { trazos: tr, formas: [cabezaForma, camisaForma, ...extra], llenos: [] };
}

// ── Las tres portadas de la lámina ──
const PAL = { 'Entendé tu plan': '#009690', 'Salud en Paraguay': '#003B71', 'Prevención': '#457A5A' };
const J = (...ps) => ps.reduce((a, p) => ({ formas: [...a.formas, ...(p.formas || [])], trazos: [...a.trazos, ...(p.trazos || [])] }), { formas: [], trazos: [] });
const L = (x1, y1, x2, y2) => `M${f(x1)} ${f(y1)} Q${f((x1 + x2) / 2 + 0.6)} ${f((y1 + y2) / 2 - 0.5)} ${f(x2)} ${f(y2)}`;
const caja = (x, y, w, h, r = 4) => suave([[x + r, y], [x + w - r, y + 0.4], [x + w, y + r], [x + w + 0.3, y + h - r], [x + w - r, y + h], [x + r, y + h + 0.3], [x, y + h - r], [x - 0.2, y + r], [x + r + 1.5, y - 0.2]], 0.8);
const hospital = (x, base, w, h) => ({ formas: [`M${x} ${base - h} L${x + w} ${base - h} L${x + w} ${base} L${x} ${base}Z`], trazos: [caja(x, base - h, w, h, 3), L(x + w / 2, base - h * 0.86, x + w / 2, base - h * 0.58), L(x + w / 2 - h * 0.14, base - h * 0.72, x + w / 2 + h * 0.14, base - h * 0.72), caja(x + w * 0.36, base - h * 0.28, w * 0.28, h * 0.28, 2)] });
const globo = (x, y, w, h, qx, qy, tipo) => {
  const bx = Math.min(Math.max(qx, x + 10), x + w - 10);
  const cx = x + w / 2, cy = y + h / 2;
  const dentro = tipo === 'pregunta'
    ? [suave([[cx - 6, cy - 5], [cx - 4, cy - 10], [cx + 3, cy - 11], [cx + 7, cy - 6], [cx + 4, cy - 1], [cx, cy + 2], [cx, cy + 6]]), `M${f(cx)} ${f(cy + 11.4)}l.2 .2`]
    : [L(x + 11, y + h * 0.36, x + w - 12, y + h * 0.35), L(x + 11, y + h * 0.66, x + w * 0.62, y + h * 0.65)];
  return { formas: [cajaRelleno(x, y, w, h, 12)], trazos: [caja(x, y, w, h, 12), suave([[bx - 5, y + h], [qx, qy], [bx + 6, y + h]], 0.3), ...dentro] };
};
const persona = (x, base, h) => { const w = h * 0.32, top = base - h * 0.62, r = h * 0.14; const ang = [...Array(14)].map((_, i) => -2.2 + (i / 12) * Math.PI * 2);
  return { formas: [], trazos: [suave([[x - w / 2, base], [x - w / 2, top + w * 0.55], [x - w * 0.34, top + w * 0.14], [x, top], [x + w * 0.34, top + w * 0.14], [x + w / 2, top + w * 0.55], [x + w / 2, base]]), suave(ang.map((a) => [x + Math.cos(a) * r, top - r - h * 0.07 + Math.sin(a) * r]))] }; };
const suelo = (x1, x2, y) => ({ formas: [], trazos: [L(x1, y, x2, y - 0.6)] });
const sol = (cx, cy, r) => { const ang = [...Array(14)].map((_, i) => -2 + (i / 12) * Math.PI * 2); return { formas: [circuloRelleno(cx, cy, r)], trazos: [suave(ang.map((a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r]))] }; };

// La hamaca con Tranquibara tomando tereré (nota: resolver la cobertura antes de necesitarla).
function hamaca() {
  const cab = tranquibara(219, 170, 118, { mira: 1, ojos: 'cerrados', rot: -24 });
  const cabeza = { formas: [cab.formas[0]], trazos: cab.trazos.slice(0, 6) };
  return J(
    { formas: [], trazos: [L(122, 166, 124, 58), L(286, 166, 284, 60), L(124, 62, 158, 100), L(284, 64, 262, 102)] },
    cabeza,
    // la rodilla que asoma y el brazo con la guampa
    { formas: [], trazos: [suave([[236, 104], [246, 82], [256, 80], [262, 102]], 1), suave([[204, 106], [214, 100], [221, 98]], 1), caja(220, 90, 11, 13, 3), L(225.5, 90, 217, 83)] },
    // la hamaca: borde, fondo y la red
    { formas: [suave([[156, 100], [210, 106], [264, 102], [238, 128], [208, 136], [178, 126]], 0.9, true)],
      trazos: [suave([[156, 100], [210, 106], [264, 102]], 1), suave([[156, 100], [176, 124], [208, 136], [240, 126], [264, 102]], 1), L(176, 106, 190, 130), L(196, 107, 210, 136), L(218, 107, 228, 133), L(240, 106, 246, 124)] },
    // el termo en el pasto
    { formas: [`M232 140 L246 140 L246 164 L232 164Z`], trazos: [caja(232, 140, 14, 24, 3), L(232, 146, 246, 146), suave([[246, 146], [251, 148], [251, 156], [246, 158]], 1), caja(250, 154, 8, 10, 2)] },
    sol(300, 34, 11), suelo(104, 298, 165));
}

export const TQ = {
  anota: J(tranquibara(176, 164, 128, { brazos: 'libro', mira: 1 }), hospital(250, 164, 42, 66), suelo(104, 298, 165)),
  palabras: J(persona(146, 164, 80), globo(122, 30, 48, 36, 146, 76, 'pregunta'), tranquibara(254, 164, 104, { brazos: 'explicaIzq', mira: -1 }), globo(206, 10, 80, 42, 238, 60, 'lineas'), suelo(104, 298, 165)),
  tranqui: hamaca(),
};

