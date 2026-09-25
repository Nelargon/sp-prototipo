// PORTADAS DEL BLOG · TANDA 1, SEGUNDA VERSIÓN (25/09/2026)
//
// Las mismas 10 notas, rehechas como emblema después de la prueba a ciegas
// (docs/diseno/README.md, lecciones 28 a 30): un objeto y un gesto por nota, con
// la mano del chico. Sin suelo, sin sol, sin manos, sin relojes ni cuadrantes,
// sin «!», sin rojo. El lleno es la idea. Lámina:
// docs/diseno/img/2026-09-25-portadas-tanda-1-v2*.webp. NO es código del sitio
// todavía: cuando se lleve a app/blog/Cover.jsx, `TANDA1B` es el registro
// slug → dibujo, y reemplaza a `TANDA1`.
//
// Piezas nuevas: banda (cinta de ancho fijo), lazo, andamio, escalón, moneda,
// sobre, valija-carpeta, consultorio, lupa, promesa, sube y baja, lámpara de
// quirófano, corazón, pin, microscopio, pila de libros, birrete.

// Tanda 1, segunda versión: un objeto y un gesto por nota (lecciones 28 y 29).
// La mano del chico, la gramática del emblema: sin suelo, sin sol, sin manos,
// sin relojes ni cuadrantes, sin «!», sin rojo. El lleno es la idea.
import { suave, linea as linea0, circulo as circulo0, circuloRelleno, caja as caja0, cajaRelleno, tilde, semilla } from './2026-09-24-portadas-maneras-de-dibujar.mjs';
import { P, juntar, persona, casa, temblor } from './2026-09-24-portadas-iteraciones.mjs';
const T = 1.4;
const linea = (x1, y1, x2, y2, t = 0.8) => linea0(x1, y1, x2, y2, t * T);
const caja = (x, y, w, h, r = 6, t = 0.8, c = false) => caja0(x, y, w, h, r, t * T, c);
const circulo = (cx, cy, r, t = 0.04) => circulo0(cx, cy, r, t * T);
const f = (v) => +v.toFixed(1);
const pt = (p) => p.map(f).join(' ');

// ── herramientas ──
// Muestrea una curva Catmull-Rom por puntos.
const muestrear = (pts, n = 10) => { const out = []; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
  for (let j = 0; j < n; j++) { const t = j / n, t2 = t * t, t3 = t2 * t; out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3))); } }
  out.push(pts[pts.length - 1]); return out; };
// Una banda (cinta) de ancho w a lo largo de una curva: contorno cerrado.
const banda = (pts, w) => { const s = muestrear(pts, 12), L = [], R = [];
  s.forEach((p, i) => { const a = s[Math.max(i - 1, 0)], b = s[Math.min(i + 1, s.length - 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1; const nx = -dy / n * w / 2, ny = dx / n * w / 2; L.push([p[0] + nx, p[1] + ny]); R.push([p[0] - nx, p[1] - ny]); });
  return 'M' + [...L, ...R.reverse()].map(pt).join(' L') + 'Z'; };
const punteada = (pts, paso = 7, largo = 3.5) => { const d = []; let acc = 0; for (let i = 0; i < pts.length - 1; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1]; const L = Math.hypot(x2 - x1, y2 - y1); let t = acc; while (t < L) { const a = t / L, b = Math.min((t + largo) / L, 1); d.push(`M${f(x1 + (x2 - x1) * a)} ${f(y1 + (y2 - y1) * a)} L${f(x1 + (x2 - x1) * b)} ${f(y1 + (y2 - y1) * b)}`); t += paso; } acc = t - L; } return P({ trazos: d }); };
const curva = (a, c, b, n = 24) => [...Array(n + 1)].map((_, i) => { const t = i / n; return [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]; });
const flechita = (x, y, ang, r = 8) => { const a = (ang * Math.PI) / 180; const p = (da) => [x - Math.cos(a + da) * r, y - Math.sin(a + da) * r]; return `M${pt(p(0.5))} L${f(x)} ${f(y)} L${pt(p(-0.5))}`; };
const rayitas = (cx, cy, r1, r2, angs) => angs.map((g) => { const a = (g * Math.PI) / 180; return linea(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, 0.1); });
const cruz = (cx, cy, c) => [linea(cx, cy - c, cx, cy + c, 0.15), linea(cx - c, cy, cx + c, cy, 0.15)];

// ── 1 · VIH: el lazo, en obra ──
const lazo = (cx, cy, h) => { const s = h / 120;
  const X = (x, y) => [cx + x * s, cy + y * s];
  const a = banda([X(24, 58), X(8, 20), X(-12, -14), X(-16, -38), X(0, -56), X(16, -38), X(12, -14), X(2, 4)], 17 * s);
  const b = banda([X(-2, 10), X(-10, 30), X(-24, 58)], 17 * s);
  // el borde de la cinta de adelante donde cruza, en el color del fondo
  const borde = [suave([X(-5, 1), X(-10, 14), X(-14, 24)].map((p) => p), 0.8)];
  return P({ llenos: [{ d: b, lineas: [] }, { d: a, lineas: borde }] }); };
const andamio = (x1, x2, top, base) => P({ trazos: [
  linea(x1, base, x1 + 1, top), linea(x2, base, x2 - 1, top + 3),
  linea(x1 - 8, top + 34, x2 + 9, top + 32), linea(x1 - 6, top + 78, x2 + 7, top + 80),
  linea(x1, top + 34, x2, top + 80, 0.3), linea(x2, top + 34, x1, top + 78, 0.3),
  linea(x1 + 2, base - 2, x2 - 3, top + 82, 0.2)] });

// ── 2 · Precio: la moneda sube; el aviso llegó antes ──
const escalon = (x0, base, n, sw, sh) => { const tr = [linea(x0 - 12, base, x0, base + 0.4, 0.2)]; let x = x0, y = base;
  for (let i = 0; i < n; i++) { const w = sw + [0, 2, -1.5, 1][i % 4]; tr.push(linea(x, y, x + 0.6, y - sh, 0.2)); tr.push(linea(x + 0.6, y - sh, x + w, y - sh + [0.6, -0.4, 0.3, -0.5][i % 4], 0.25)); x += w; y -= sh; }
  return P({ trazos: tr, formas: [] }); };
const moneda = (cx, cy, r) => ({ d: circuloRelleno(cx, cy, r), lineas: [circulo(cx, cy, r * 0.66, 0.03), linea(cx - r * 0.18, cy - r * 0.3, cx - r * 0.18, cy + r * 0.3, 0.05)] });
const sobre = (x, y, w, h) => P({ formas: [cajaRelleno(x, y, w, h, 3)], trazos: [caja(x, y, w, h, 3), suave([[x + 2, y + 2], [x + w / 2, y + h * 0.58], [x + w - 2, y + 2]], 0.4)] });

// ── 3 · Cambiar de médico: la carpeta viaja con vos ──
const valija = (x, y, w, h) => { const d = suave([[x, y + 6], [x + w * 0.34, y + 5], [x + w * 0.42, y], [x + w, y], [x + w + 0.8, y + h], [x - 0.6, y + h]], 0.2, true);
  return P({ llenos: [{ d, lineas: [linea(x + w * 0.2, y + h * 0.48, x + w * 0.8, y + h * 0.47, 0.1), linea(x + w * 0.2, y + h * 0.7, x + w * 0.62, y + h * 0.69, 0.1), ...cruz(x + w * 0.76, y + h * 0.2, 3.2)] }],
    trazos: [suave([[x + w * 0.35, y + 1], [x + w * 0.4, y - 9], [x + w * 0.6, y - 9], [x + w * 0.65, y]], 0.6)] }); };
const consultorio = (cx, cy, s) => P({ formas: [cajaRelleno(cx - s, cy - s, 2 * s, 2 * s, 6)], trazos: [caja(cx - s, cy - s, 2 * s, 2 * s, 6), ...cruz(cx, cy, s * 0.48)] });

// ── 4 · Dengue: la curita, y el mosquito que rebota y se va ──
const mosquito = (cx, cy, s = 1) => P({ trazos: [
  suave([[cx - 8 * s, cy], [cx, cy - 3 * s], [cx + 7 * s, cy], [cx, cy + 3 * s], [cx - 8 * s, cy]], 0.8),
  suave([[cx - 2 * s, cy - 2 * s], [cx - 7 * s, cy - 11 * s], [cx + 1 * s, cy - 9 * s], [cx + 1 * s, cy - 2 * s]], 0.8),
  suave([[cx + 1 * s, cy - 2 * s], [cx + 3 * s, cy - 12 * s], [cx + 8 * s, cy - 7 * s], [cx + 3 * s, cy - 1 * s]], 0.8),
  linea(cx + 7 * s, cy, cx + 14 * s, cy - 3 * s, 0.1), linea(cx - 2 * s, cy + 2 * s, cx - 6 * s, cy + 8 * s, 0.1), linea(cx + 2 * s, cy + 2 * s, cx + 1 * s, cy + 9 * s, 0.1)] });
const curita = (cx, cy, w, h, rot = -20) => { const a = (rot * Math.PI) / 180, R = ([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)];
  const pts = [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2 + h * 0.3, cy], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2], [cx - w / 2 - h * 0.3, cy]].map(R);
  const c = [R([cx - w * 0.18, cy - h * 0.3]), R([cx + w * 0.18, cy - h * 0.3]), R([cx + w * 0.18, cy + h * 0.3]), R([cx - w * 0.18, cy + h * 0.3])];
  return P({ llenos: [{ d: suave(pts, 0.6, true), lineas: [suave([...c, c[0]], 0.3)] }] }); };

// ── 5 · La promesa, bajo la lupa ──
const promesa = (x, y, w, h) => P({ formas: [cajaRelleno(x, y, w, h, 14)], trazos: [caja(x, y, w, h, 14), suave([[x + w * 0.24, y + h], [x + w * 0.16, y + h + 16], [x + w * 0.38, y + h + 1]], 0.4), linea(x + 14, y + h * 0.36, x + w - 18, y + h * 0.35), linea(x + 14, y + h * 0.64, x + w * 0.6, y + h * 0.63)] });
const lupa = (cx, cy, r) => { const a = Math.PI / 4, hx = cx + Math.cos(a) * r, hy = cy + Math.sin(a) * r;
  return P({ llenos: [{ d: circuloRelleno(cx, cy, r), lineas: [tilde(cx - r * 0.42, cy - r * 0.02, r * 0.1)] }, { d: banda([[hx + 1, hy + 1], [hx + 16, hy + 16], [hx + 30, hy + 30]], 9), lineas: [] }],
    trazos: [circulo(cx, cy, r + 4, 0.03)] }); };

// ── 6 · Más gente no levanta la cuenta: el sube y baja ──
const subeybaja = (fx, base, largo, ang) => { const a = (ang * Math.PI) / 180, top = base - 26; const dx = Math.cos(a) * largo / 2, dy = Math.sin(a) * largo / 2;
  return { tabla: [[fx - dx, top - dy], [fx + dx, top + dy]], pieza: P({ formas: [`M${f(fx - 14)} ${f(base)} L${f(fx)} ${f(top)} L${f(fx + 14)} ${f(base)}Z`], trazos: [suave([[fx - 15, base], [fx, top + 1], [fx + 15, base]], 0.3), linea(fx - 18, base, fx + 18, base - 0.4, 0.2), linea(fx - dx, top - dy, fx + dx, top + dy, 0.4), linea(fx - dx, top - dy + 4, fx + dx, top + dy + 4, 0.4)] }) }; };

// ── 7 · Cirugía: ida y vuelta, bajo la lámpara ──
const lampara = (cx, cy, r, techo) => { const bs = [0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2 + 0.3; return circulo(cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, r * 0.17, 0.03); });
  return P({ llenos: [{ d: circuloRelleno(cx, cy, r), lineas: [...bs, circulo(cx, cy, r * 0.2, 0.03)] }], trazos: [linea(cx + 34, techo, cx + 34, cy - r - 20, 0.2), linea(cx + 34, cy - r - 20, cx + 4, cy - r - 12, 0.2), circulo(cx + 34, cy - r - 20, 3), linea(cx + 4, cy - r - 12, cx, cy - r + 1, 0.1),
    ...rayitas(cx, cy, r + 8, r + 17, [60, 90, 120])] }); };

// ── 8 · Presión: el corazón se pone el brazalete ──
const corazon = (cx, cy, w) => { const s = w / 100; const X = (x, y) => [cx + x * s, cy + y * s];
  return suave([X(0, -22), X(-18, -42), X(-42, -38), X(-50, -14), X(-38, 14), X(-14, 36), X(0, 48), X(14, 36), X(38, 14), X(50, -14), X(42, -38), X(18, -42)], 0.95, true); };

// ── 9 · Cuello uterino: el estudio, acá ──
const pin = (cx, cy, r, punta) => P({ trazos: [suave([[cx - r * 0.72, cy + r * 0.72], [cx - r, cy], [cx - r * 0.7, cy - r * 0.72], [cx, cy - r], [cx + r * 0.7, cy - r * 0.72], [cx + r, cy], [cx + r * 0.72, cy + r * 0.72], [cx + 1, punta]], 0.7), suave([[cx + 1, punta], [cx - r * 0.3, cy + r * 1.05], [cx - r * 0.72, cy + r * 0.72]], 0.7)] });
const microscopio = (cx, base, h) => { const s = h / 100; const X = (x, y) => [cx + x * s, base + y * s];
  const pie = suave([X(-34, 0), X(-34, -9), X(22, -10), X(26, 0)], 0.3, true);
  const brazo = banda([X(12, -10), X(18, -38), X(10, -66), X(-2, -80)], 12 * s);
  const tubo = banda([X(-24, -96), X(-10, -70), X(-2, -54)], 15 * s);
  const platina = suave([X(-30, -40), X(12, -41), X(12, -35), X(-30, -34)], 0.2, true);
  return P({ llenos: [{ d: pie, lineas: [] }, { d: brazo, lineas: [] }, { d: tubo, lineas: [linea(...X(-20, -88), ...X(-13, -93), 0.05)] }, { d: platina, lineas: [] }],
    trazos: [linea(...X(-4, -52), ...X(-6, -44), 0.1)] }); };

// ── 10 · La pila de libros le gana al hospital ──
const pilaLibros = (cx, base, anchos) => { const ll = []; let y = base; anchos.forEach(([w, h, dx], i) => { y -= h; const x = cx - w / 2 + dx; const d = cajaRelleno(x, y, w, h, 2.5);
    const k = [0.12, 0.3, 0.08, 0.22, 0.16, 0.26, 0.1, 0.2][i % 8], m = [0.84, 0.7, 0.78, 0.88, 0.74, 0.8, 0.9, 0.72][i % 8];
    const ls = [linea(x + w * k, y + h * 0.5, x + w * (k + 0.34), y + h * 0.5, 0.05), linea(x + w * m, y + 2, x + w * m, y + h - 2, 0.05)]; if (i % 3 === 1) ls.push(linea(x + w * (m - 0.08), y + 2, x + w * (m - 0.08), y + h - 2, 0.05));
    ll.push({ d, lineas: ls }); });
  return { pieza: P({ llenos: ll }), top: y }; };
const birrete = (cx, y) => P({ llenos: [{ d: suave([[cx - 24, y], [cx, y - 9], [cx + 24, y], [cx, y + 9]], 0.1, true), lineas: [] }], trazos: [suave([[cx - 12, y + 5], [cx - 12, y + 14], [cx, y + 18], [cx + 12, y + 14], [cx + 12, y + 5]], 0.6), suave([[cx + 1, y], [cx + 16, y + 3], [cx + 20, y + 16]], 0.7), circulo(cx + 20, y + 19, 2.4)] });
const hospitalChico = (x, base, w, h) => P({ formas: [`M${x} ${base - h} L${x + w} ${base - h} L${x + w} ${base} L${x} ${base}Z`], trazos: [caja(x, base - h, w, h, 3), ...cruz(x + w / 2, base - h * 0.66, Math.min(w, h) * 0.16), caja(x + w * 0.36, base - h * 0.3, w * 0.28, h * 0.3, 2, 0.2)] });

// ── las diez (mismo orden que la tanda 1) ──
export const TANDA1B = [
  { slug: 'que-una-aseguradora-cumpla-lo-que-promete-no-lo-dice-ella-sola', cat: 'Entendé tu plan', idea: 'La promesa, bajo la lupa de otro.',
    dib: () => juntar(promesa(118, 38, 104, 62), lupa(238, 96, 32)) },
  { slug: 'por-que-el-precio-de-una-cobertura-de-salud-se-avisa-antes-de-subir', cat: 'Entendé tu plan', idea: 'La moneda va a subir; el aviso llegó antes.',
    dib: () => juntar(escalon(142, 160, 4, 36, 25), P({ llenos: [moneda(160, 118, 16)], trazos: [...rayitas(160, 118, 21, 29, [165, 190, 215])] }), sobre(250, 38, 34, 23), P({ trazos: rayitas(267, 49, 23, 30, [-55, -90, -125]) })) },
  { slug: 'el-estudio-que-previene-el-cancer-de-cuello-uterino-esta-en-tu-centro-de-salud', cat: 'Salud en Paraguay', idea: 'El estudio está acá, en tu centro de salud.',
    dib: () => juntar(pin(206, 76, 52, 164), microscopio(210, 108, 72), P({ trazos: cruz(206, 138, 5) })) },
  { slug: 'la-vacuna-contra-el-dengue-ya-se-aplica-hasta-los-60-anos', cat: 'Prevención', idea: 'Grande y más grande, con su curita: el mosquito rebota y se va.',
    dib: () => juntar(persona(160, 160, 78), persona(214, 160, 94), P({ trazos: [linea(230, 122, 238, 161, 0.3), suave([[230, 122], [233, 117], [238, 118]], 0.6)] }), curita(149, 120, 24, 12, -60), curita(201, 115, 26, 13, -60),
      P({ trazos: rayitas(201, 115, 16, 23, [-150, -120, 170]) }), punteada(curva([188, 100], [196, 48], [262, 40]), 7, 3), P({ trazos: [flechita(266, 39, -4, 7)] }), mosquito(288, 36, 0.95)) },
  { slug: 'que-significa-que-un-plan-te-cubra-una-cirugia', cat: 'Entendé tu plan', idea: 'Ir, operarte y volver: todo el viaje cuenta.',
    dib: () => juntar(lampara(236, 68, 28, 0), casa(118, 164, 40, 56), punteada(curva([146, 104], [180, 58], [218, 120]), 7, 3.5), P({ trazos: [flechita(218, 120, 60)] }), punteada(curva([232, 132], [206, 176], [160, 150]), 7, 3.5), P({ trazos: [flechita(160, 150, 196)] })) },
  { slug: 'un-hospital-se-construye-en-dos-anos-formar-a-quien-atiende-lleva-mas', cat: 'Primeros años', idea: 'La pila de libros, más alta que el hospital.',
    dib: () => { const p = pilaLibros(236, 162, [[70, 15, 0], [56, 11, -5], [64, 16, 4], [48, 10, -2], [60, 13, 6], [66, 12, -4], [50, 15, 1], [58, 10, 5]]); return juntar(hospitalChico(132, 162, 52, 52), p.pieza, birrete(238, p.top - 9)); } },
  { slug: 'la-respuesta-al-vih-en-paraguay-se-construye-con-anos-de-anticipacion', cat: 'Salud en Paraguay', idea: 'El lazo, en obra.',
    dib: () => juntar(lazo(204, 96, 124), andamio(160, 250, 28, 162)) },
  { slug: 'por-que-controlar-la-presion-importa-aunque-te-sientas-bien', cat: 'Vivir más años', idea: 'El corazón se pone el brazalete.',
    dib: () => juntar(P({ llenos: [{ d: corazon(196, 88, 112), lineas: [suave([[142, 84], [174, 92], [214, 92], [248, 82]], 0.8), suave([[150, 108], [178, 116], [212, 116], [242, 106]], 0.8), caja(206, 94, 16, 18, 3, 0.2)] }] }),
      P({ trazos: [suave([[244, 96], [262, 102], [274, 120], [266, 134], [272, 146]], 0.8)] }), P({ llenos: [{ d: suave([[264, 148], [274, 144], [284, 152], [282, 168], [272, 172], [262, 164]], 0.9, true), lineas: [] }] })) },
  { slug: 'cuando-cambias-de-medico-la-informacion-no-viaja-sola', cat: 'Prevención', idea: 'La carpeta viaja con vos, de un consultorio al otro.',
    dib: () => juntar(consultorio(128, 70, 16), consultorio(284, 70, 16), punteada(curva([146, 92], [206, 176], [266, 92]), 7, 3.5), P({ trazos: [flechita(266, 92, -55)] }), persona(196, 140, 86, { brazos: [['d', 10, 20, 0.5, 0.5]], inclina: 3 }), valija(206, 100, 40, 32)) },
  { slug: 'mas-gente-con-seguro-medico-no-significa-atenderla-mas-barato', cat: 'Entendé tu plan', idea: 'Se suben todos y la moneda no se levanta.',
    dib: () => { const sb = subeybaja(206, 158, 196, 14); const [[x1, y1], [x2, y2]] = sb.tabla; const gente = [0.1, 0.24, 0.38].map((k, i) => { const x = x1 + (x2 - x1) * k, y = y1 + (y2 - y1) * k; return persona(x, y - 2, [54, 58, 52][i]); });
      return juntar(sb.pieza, ...gente, P({ llenos: [moneda(x2 - 18, y2 - 26, 24)] })); } },
];
export function dibujosTanda() { semilla(61); temblor(1.4); return TANDA1B.map((t) => ({ ...t, il: t.dib() })); }
