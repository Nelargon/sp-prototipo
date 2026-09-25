// PORTADAS DEL BLOG · CINCO ITERACIONES DEL LENGUAJE ELEGIDO (24/09/2026, cuarta vuelta)
//
// Los dibujos de la lámina `docs/diseno/img/2026-09-24-portadas-cinco-iteraciones.webp`
// (docs/diseno/README.md, lección 22). NO es código del sitio.
//
// El lenguaje lo eligió Arturo sobre la tercera vuelta: la gente del isotipo,
// las casitas, el paisaje y el círculo. «Es casi como un niño que dibuja, pero
// un niño que dibuja y se entiende.» Tratamiento: trazo blanco (ver
// 2026-09-24-portadas-maneras-de-dibujar.mjs para el render y los ayudantes
// `suave`, `linea`, `circulo`, `caja`, `tilde`, que este archivo importa de ahí).
//
// Piezas reutilizables: persona (con brazos opcionales), casa, hospital, globo
// ('pregunta' | 'lineas'), sol, lapacho, lista, suelo, pasto, colinas y mancha.
// `llenos` = papel blanco macizo con sus líneas en el color del fondo
// (iteración 4). `iteraciones()` devuelve I[it][nota] = { formas, trazos, llenos }.

// Cuarta vuelta: cinco iteraciones del lenguaje que eligió Arturo
// («un niño que dibuja y se entiende»): gente del isotipo, casitas, paisaje y círculo.
import { suave, linea as linea0, circulo as circulo0, circuloRelleno, caja as caja0, cajaRelleno, tilde, semilla } from './2026-09-24-portadas-maneras-de-dibujar.mjs';

// Temblor global: el niño tiembla un poco más.
let T = 1;
export const temblor = (t) => { T = t; };
const linea = (x1, y1, x2, y2, t = 0.8) => linea0(x1, y1, x2, y2, t * T);
const caja = (x, y, w, h, r = 6, t = 0.8, c = false) => caja0(x, y, w, h, r, t * T, c);
const circulo = (cx, cy, r, t = 0.04) => circulo0(cx, cy, r, t * T);
const f = (v) => +v.toFixed(1);

// Una pieza: { formas, trazos, llenos } — llenos = papel blanco macizo con sus líneas en el color del fondo.
const P = (o = {}) => ({ formas: [], trazos: [], llenos: [], ...o });
const juntar = (...ps) => ps.reduce((a, p) => ({ formas: [...a.formas, ...(p.formas || [])], trazos: [...a.trazos, ...(p.trazos || [])], llenos: [...a.llenos, ...(p.llenos || [])] }), P());

// Persona del isotipo, con brazos opcionales. brazos: [[lado, dx, dy], ...] desde el hombro.
function persona(x, base, h, { brazos = [], inclina = 0 } = {}) {
  const w = h * 0.32, top = base - h * 0.62, r = h * 0.14, hy = top + w * 0.55;
  const k = inclina;
  const cuerpo = suave([[x - w / 2, base], [x - w / 2 + k * 0.3, top + w * 0.55], [x - w * 0.34 + k * 0.6, top + w * 0.14], [x + k, top], [x + w * 0.34 + k * 0.6, top + w * 0.14], [x + w / 2 + k * 0.3, top + w * 0.55], [x + w / 2, base]]);
  const tr = [cuerpo, circulo(x + k * 1.2, top - r - h * 0.07, r)];
  for (const [lado, dx, dy, cx = 0.5, cy = 0.35] of brazos) {
    const sx = x + (lado === 'd' ? w / 2 : -w / 2) + k * 0.3;
    tr.push(suave([[sx, hy], [sx + dx * cx, hy + dy * cy], [sx + dx, hy + dy]]));
  }
  return P({ trazos: tr, cabeza: [x + k * 1.2, top - r - h * 0.07, r], hombro: (lado) => [x + (lado === 'd' ? w / 2 : -w / 2), hy] });
}
function casa(x, base, w, h, { llena = false, torcida = 0 } = {}) {
  const wy = base - h * 0.6, ax = x + w / 2 + torcida, ay = base - h;
  const forma = `M${f(x - 4)} ${f(wy + 3)} L${f(ax)} ${f(ay)} L${f(x + w + 4)} ${f(wy + 3)} L${f(x + w)} ${f(base)} L${f(x)} ${f(base)}Z`;
  const dw = w * 0.26, dh = h * 0.34;
  const trazos = [suave([[x - 5, wy + 4], [x + w * 0.25 + torcida * 0.5, (wy + ay) / 2 + 2], [ax, ay], [x + w * 0.75 + torcida * 0.5, (wy + ay) / 2 + 2], [x + w + 5, wy + 4]], 0.4),
    linea(x, wy, x, base), linea(x + w, wy, x + w + 0.4, base), caja(x + w * 0.2, base - dh, dw, dh, 2, 0.2), caja(x + w * 0.6, wy + h * 0.1, w * 0.22, w * 0.22, 1.5, 0.15)];
  return llena ? P({ llenos: [{ d: forma, lineas: trazos.slice(3) }], trazos: trazos.slice(0, 3) }) : P({ formas: [forma], trazos });
}
function hospital(x, base, w, h, { llena = false } = {}) {
  const forma = `M${f(x)} ${f(base - h)} L${f(x + w)} ${f(base - h)} L${f(x + w)} ${f(base)} L${f(x)} ${f(base)}Z`;
  const cx = x + w / 2, cy = base - h * 0.72, c = Math.min(w, h) * 0.2;
  const cruz = [linea(cx, cy - c, cx, cy + c, 0.3), linea(cx - c, cy, cx + c, cy, 0.3)];
  const puerta = caja(cx - w * 0.14, base - h * 0.28, w * 0.28, h * 0.28, 2);
  const marco = caja(x, base - h, w, h, 3);
  return llena ? P({ llenos: [{ d: forma, lineas: [...cruz, puerta] }], trazos: [marco] }) : P({ formas: [forma], trazos: [marco, ...cruz, puerta] });
}
// Globo de diálogo: caja + cola hacia (qx, qy). contenido: 'pregunta' | 'lineas'
function globo(x, y, w, h, qx, qy, contenido, { lleno = false } = {}) {
  const bx = Math.min(Math.max(qx, x + 10), x + w - 10);
  const cola = suave([[bx - 5, y + h], [qx, qy], [bx + 6, y + h]], 0.3);
  let dentro = [];
  if (contenido === 'pregunta') {
    const cx = x + w / 2, cy = y + h / 2;
    dentro = [suave([[cx - 6, cy - 5], [cx - 4, cy - 10], [cx + 3, cy - 11], [cx + 7, cy - 6], [cx + 4, cy - 1], [cx, cy + 2], [cx, cy + 6]]), `M${f(cx)} ${f(cy + 11.4)}l.2 .2`];
  } else {
    dentro = [linea(x + 11, y + h * 0.36, x + w - 12, y + h * 0.35), linea(x + 11, y + h * 0.66, x + w * 0.62, y + h * 0.65)];
  }
  const d = cajaRelleno(x, y, w, h, 12);
  return lleno ? P({ llenos: [{ d, lineas: dentro }], trazos: [caja(x, y, w, h, 12), cola] }) : P({ formas: [d], trazos: [caja(x, y, w, h, 12), cola, ...dentro] });
}
function sol(cx, cy, r, rayos = 0) {
  const tr = [circulo(cx, cy, r)];
  for (let i = 0; i < rayos; i++) { const a = (i / rayos) * Math.PI * 2 + 0.3; tr.push(linea(cx + Math.cos(a) * (r + 5), cy + Math.sin(a) * (r + 5), cx + Math.cos(a) * (r + 11), cy + Math.sin(a) * (r + 11), 0.2)); }
  return P({ trazos: tr, formas: [circuloRelleno(cx, cy, r)] });
}
function lapacho(x, base, h) {
  const cy = base - h * 0.72, r = h * 0.28;
  return P({ formas: [circuloRelleno(x, cy, r)], trazos: [suave([[x + 1, base], [x, cy + r * 0.6], [x - 1, cy + r * 0.2]]), circulo(x, cy, r),
    `M${f(x - r * 0.4)} ${f(cy - r * 0.3)}l.2.2M${f(x + r * 0.3)} ${f(cy - r * 0.5)}l.2.2M${f(x + r * 0.45)} ${f(cy + r * 0.2)}l.2.2M${f(x - r * 0.2)} ${f(cy + r * 0.35)}l.2.2M${f(x)} ${f(cy - r * 0.05)}l.2.2`] });
}
function lista(x, y, w, h, { llena = false } = {}) {
  const d = cajaRelleno(x, y, w, h, 5);
  const s = w / 60;
  const lin = [tilde(x + w * 0.14, y + h * 0.2, 0.75 * s), linea(x + w * 0.4, y + h * 0.25, x + w * 0.86, y + h * 0.24), tilde(x + w * 0.14, y + h * 0.46, 0.75 * s), linea(x + w * 0.4, y + h * 0.51, x + w * 0.8, y + h * 0.5), linea(x + w * 0.18, y + h * 0.77, x + w * 0.28, y + h * 0.77), linea(x + w * 0.4, y + h * 0.77, x + w * 0.62, y + h * 0.765)];
  return llena ? P({ llenos: [{ d, lineas: lin }], trazos: [caja(x, y, w, h, 5)] }) : P({ formas: [d], trazos: [caja(x, y, w, h, 5), ...lin] });
}
const suelo = (x1, x2, y) => P({ trazos: [linea(x1, y, x2, y - 0.6)] });
const pasto = (xs, y) => P({ trazos: xs.map((x) => `M${f(x)} ${f(y)} l-2 -6 M${f(x + 3)} ${f(y)} l0 -8 M${f(x + 6)} ${f(y)} l2 -6`) });
const loma = (pts) => P({ trazos: [suave(pts)] });
const colinas = (pts) => P({ formas: [suave([[-30, 200], [-30, pts[0][1] + 4], ...pts, [430, pts[pts.length - 1][1] + 4], [430, 200]], 0.9, true)] });
const mancha = (r = 78) => P({ formas: [circuloRelleno(200, 96, r)] });

export function iteraciones() {
  const I = {};
  // ── 1 · COMO LO DIBUJA UN CHICO ────────────────────────────────────────
  semilla(21); temblor(1.9);
  I['1'] = {
    anota: juntar(sol(116, 40, 11, 8), persona(168, 164, 96, { brazos: [['d', 22, -6], ['i', -12, 26]] }), lista(192, 58, 44, 58), hospital(258, 164, 38, 54), suelo(104, 298, 165), pasto([122, 234], 165)),
    palabras: juntar(sol(110, 34, 9, 8), persona(156, 164, 80), persona(262, 164, 92), globo(140, 28, 50, 38, 156, 76, 'pregunta'), globo(212, 16, 80, 46, 258, 70, 'lineas'), suelo(104, 298, 165), pasto([200, 286], 165)),
    cerca: juntar(sol(114, 40, 11, 8), casa(124, 164, 42, 64, { torcida: 3 }), persona(186, 164, 64), persona(208, 164, 82), persona(229, 164, 50), hospital(246, 164, 46, 76), suelo(104, 298, 165), pasto([108, 297], 165)),
  };
  // ── 2 · DENTRO DEL CÍRCULO ────────────────────────────────────────────
  semilla(22); temblor(1);
  I['2'] = {
    anota: juntar(mancha(), persona(182, 152, 84, { brazos: [['d', 18, -4]] }), lista(204, 60, 38, 50), suelo(146, 256, 153)),
    palabras: juntar(mancha(), persona(172, 152, 66), persona(234, 152, 76), globo(150, 42, 42, 32, 172, 84, 'pregunta'), globo(206, 26, 62, 38, 234, 73, 'lineas'), suelo(144, 258, 153)),
    cerca: juntar(mancha(), casa(148, 146, 32, 50), persona(196, 146, 50), persona(212, 146, 62), persona(227, 146, 40), hospital(240, 146, 34, 58), suelo(140, 282, 147)),
  };
  // ── 3 · CON PAISAJE ───────────────────────────────────────────────────
  semilla(23); temblor(1);
  I['3'] = {
    anota: juntar(colinas([[100, 132], [140, 118], [180, 126], [230, 112], [270, 120], [300, 116]]), sol(124, 40, 11), casa(112, 164, 30, 44), hospital(266, 164, 30, 46),
      persona(176, 164, 84, { brazos: [['d', 16, -2]] }), lista(194, 88, 26, 32), suelo(104, 298, 165)),
    palabras: juntar(colinas([[100, 126], [150, 116], [200, 124], [250, 110], [300, 118]]), lapacho(126, 164, 108), persona(178, 164, 78), persona(262, 164, 88), globo(156, 36, 44, 34, 176, 82, 'pregunta'), globo(214, 22, 72, 42, 254, 74, 'lineas'), suelo(104, 298, 165)),
    cerca: juntar(colinas([[100, 128], [150, 114], [210, 124], [260, 110], [300, 118]]), sol(282, 40, 11), lapacho(116, 164, 48), casa(136, 164, 36, 56), persona(178, 164, 58), persona(197, 164, 74), persona(215, 164, 46), hospital(234, 164, 40, 68), suelo(104, 298, 165)),
  };
  // ── 4 · UN DETALLE LLENO ──────────────────────────────────────────────
  semilla(24); temblor(1);
  I['4'] = {
    anota: juntar(persona(160, 164, 100, { brazos: [['d', 22, -4]] }), lista(186, 44, 62, 80, { llena: true }), suelo(104, 298, 165)),
    palabras: juntar(persona(150, 164, 80), persona(262, 164, 92), globo(132, 28, 50, 38, 150, 76, 'pregunta'), globo(212, 16, 80, 46, 258, 70, 'lineas', { lleno: true }), suelo(104, 298, 165)),
    cerca: juntar(casa(114, 164, 42, 64), persona(178, 164, 64), persona(200, 164, 82), persona(221, 164, 50), hospital(240, 164, 50, 78, { llena: true }), suelo(104, 298, 165)),
  };
  // ── 5 · GENTE CON GESTOS ──────────────────────────────────────────────
  semilla(25); temblor(1.1);
  I['5'] = {
    anota: juntar(persona(150, 164, 86, { brazos: [['d', 28, -4, 0.5, 0.2]] }), persona(254, 164, 92, { brazos: [['i', -26, 0, 0.5, 0.2]] }),
      P({ trazos: [linea(254, 132, 254, 144, 0.2), linea(248, 138, 260, 138, 0.2)] }), lista(184, 94, 36, 46), suelo(104, 298, 165)),
    palabras: juntar(persona(150, 164, 80, { brazos: [['i', -6, -30, 0.2, 0.7]] }), persona(258, 164, 92, { brazos: [['i', -24, -18, 0.6, 0.5]] }), globo(126, 22, 50, 38, 146, 70, 'pregunta'), globo(212, 14, 80, 46, 256, 62, 'lineas'), suelo(104, 298, 165)),
    cerca: juntar(casa(110, 164, 40, 62), persona(172, 164, 64, { brazos: [['d', 4.3, 10.4, 0.5, 0.5]] }), persona(204, 164, 82, { brazos: [['i', -4.4, 18.4, 0.5, 0.5], ['d', 4.4, 24.4, 0.5, 0.5]] }), persona(234, 164, 50, { brazos: [['i', -4.5, 10.2, 0.5, 0.5]] }), hospital(250, 164, 44, 76), suelo(104, 298, 165)),
  };
  return I;
}
