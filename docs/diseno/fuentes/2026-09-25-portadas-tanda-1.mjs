// PORTADAS DEL BLOG · BIBLIOTECA, TANDA 1 (25/09/2026)
//
// Las 10 notas más nuevas sin cifra, en el estilo elegido («como lo dibuja un
// chico», con el detalle lleno a veces). Lámina: docs/diseno/img/2026-09-25-portadas-tanda-1*.webp
// (docs/diseno/README.md, lección 27). NO es código del sitio todavía: cuando se
// lleve a app/blog/Cover.jsx, `TANDA1` es el registro slug → dibujo.
//
// Piezas nuevas de esta tanda: edificio, globo con tilde, cartel, escalera, reloj,
// mosquito, curita, línea punteada, flechita, grúa, libro, calendario,
// tensiómetro, carpeta y pila de monedas. Se suman a las de
// 2026-09-24-portadas-iteraciones.mjs (gente del isotipo, casa, sanatorio, globo,
// sol, lapacho, lista, suelo, pasto, colinas, mancha).

// Tanda 1 de la biblioteca: las 10 notas más nuevas sin cifra, en el estilo del chico.
import { suave, linea as linea0, circulo as circulo0, circuloRelleno, caja as caja0, cajaRelleno, tilde, semilla } from './2026-09-24-portadas-maneras-de-dibujar.mjs';
import { P, juntar, persona, casa, hospital, globo, sol, lapacho, lista, suelo, pasto, colinas, mancha, temblor } from './2026-09-24-portadas-iteraciones.mjs';
const T = 1.4;
const linea = (x1, y1, x2, y2, t = 0.8) => linea0(x1, y1, x2, y2, t * T);
const caja = (x, y, w, h, r = 6, t = 0.8, c = false) => caja0(x, y, w, h, r, t * T, c);
const circulo = (cx, cy, r, t = 0.04) => circulo0(cx, cy, r, t * T);
const f = (v) => +v.toFixed(1);

// ── piezas nuevas ──
const edificio = (x, base, w, h) => {
  const tr = [caja(x, base - h, w, h, 3), caja(x + w * 0.38, base - h * 0.24, w * 0.24, h * 0.24, 2, 0.3)];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) tr.push(caja(x + w * (0.18 + c * 0.42), base - h * (0.86 - r * 0.2), w * 0.22, h * 0.1, 1.5, 0.2));
  return P({ formas: [`M${x} ${base - h} L${x + w} ${base - h} L${x + w} ${base} L${x} ${base}Z`], trazos: tr });
};
const globoT = (x, y, w, h, qx, qy, { lleno = false } = {}) => {
  const bx = Math.min(Math.max(qx, x + 10), x + w - 10);
  const cola = suave([[bx - 5, y + h], [qx, qy], [bx + 6, y + h]], 0.3);
  const t = tilde(x + w * 0.3, y + h * 0.48, 1.1);
  const d = cajaRelleno(x, y, w, h, 12);
  return lleno ? P({ llenos: [{ d, lineas: [t] }], trazos: [caja(x, y, w, h, 12), cola] }) : P({ formas: [d], trazos: [caja(x, y, w, h, 12), cola, t] });
};
const cartel = (x, base, w, h, { lleno = true } = {}) => {
  const by = base - h, bh = h * 0.45;
  const d = cajaRelleno(x - w / 2, by, w, bh, 5);
  const ex = [linea(x, by + bh * 0.2, x, by + bh * 0.62, 0.2), `M${f(x)} ${f(by + bh * 0.82)}l.2 .2`];
  const poste = linea(x, by + bh, x, base, 0.3);
  return lleno ? P({ llenos: [{ d, lineas: ex }], trazos: [poste, caja(x - w / 2, by, w, bh, 5)] }) : P({ formas: [d], trazos: [poste, caja(x - w / 2, by, w, bh, 5), ...ex] });
};
const escalera = (x0, base, n, sw, sh) => { const pts = [[x0, base]]; for (let i = 0; i < n; i++) { pts.push([x0 + i * sw, base - (i + 1) * sh]); pts.push([x0 + (i + 1) * sw, base - (i + 1) * sh]); } pts.push([x0 + n * sw, base]);
  return P({ trazos: [`M${pts.map((p) => p.map(f).join(' ')).join(' L')}`], formas: [`M${pts.map((p) => p.map(f).join(' ')).join(' L')}Z`] }); };
const reloj = (cx, cy, r) => P({ formas: [circuloRelleno(cx, cy, r)], trazos: [circulo(cx, cy, r), linea(cx, cy, cx, cy - r * 0.62, 0.1), linea(cx, cy, cx + r * 0.45, cy + r * 0.12, 0.1)] });
const mosquito = (cx, cy, s = 1) => P({ trazos: [
  suave([[cx - 7 * s, cy], [cx, cy - 3 * s], [cx + 8 * s, cy], [cx, cy + 3 * s], [cx - 7 * s, cy]], 0.8),
  suave([[cx - 1 * s, cy - 2 * s], [cx - 6 * s, cy - 11 * s], [cx + 2 * s, cy - 9 * s], [cx + 1 * s, cy - 2 * s]], 0.8),
  suave([[cx + 2 * s, cy - 2 * s], [cx + 4 * s, cy - 12 * s], [cx + 9 * s, cy - 7 * s], [cx + 3 * s, cy - 1 * s]], 0.8),
  linea(cx + 8 * s, cy, cx + 15 * s, cy + 2 * s, 0.1), linea(cx - 2 * s, cy + 2 * s, cx - 6 * s, cy + 8 * s, 0.1), linea(cx + 2 * s, cy + 2 * s, cx + 1 * s, cy + 9 * s, 0.1), linea(cx + 5 * s, cy + 2 * s, cx + 7 * s, cy + 8 * s, 0.1)] });
const curita = (cx, cy, w, h, rot = -20) => { const a = (rot * Math.PI) / 180, R = ([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)];
  const pts = [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2 + h * 0.3, cy], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2], [cx - w / 2 - h * 0.3, cy]].map(R);
  const d = suave(pts, 0.6, true); const [p1, p2] = [R([cx - 2.5, cy]), R([cx + 2.5, cy])];
  return P({ llenos: [{ d, lineas: [`M${p1.map(f).join(' ')}l.2 .2`, `M${p2.map(f).join(' ')}l.2 .2`] }] }); };
const punteada = (pts, paso = 7, largo = 3.5) => { // una curva en guiones, a mano
  const d = []; let acc = 0; for (let i = 0; i < pts.length - 1; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1]; const L = Math.hypot(x2 - x1, y2 - y1); let t = acc; while (t < L) { const a = t / L, b = Math.min((t + largo) / L, 1); d.push(`M${f(x1 + (x2 - x1) * a)} ${f(y1 + (y2 - y1) * a)} L${f(x1 + (x2 - x1) * b)} ${f(y1 + (y2 - y1) * b)}`); t += paso; } acc = t - L; }
  return P({ trazos: d }); };
const curva = (a, c, b, n = 24) => [...Array(n + 1)].map((_, i) => { const t = i / n; return [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]; });
const flechita = (x, y, ang) => { const a = (ang * Math.PI) / 180; const p = (da, r) => [x - Math.cos(a + da) * r, y - Math.sin(a + da) * r]; return P({ trazos: [`M${p(0.5, 8).map(f).join(' ')} L${f(x)} ${f(y)} L${p(-0.5, 8).map(f).join(' ')}`] }); };
const grua = (x, base, h) => { const top = base - h; const tr = [linea(x - 5, base, x - 5, top, 0.3), linea(x + 5, base, x + 5, top, 0.3)];
  for (let y = base - 12; y > top + 6; y -= 14) tr.push(linea(x - 5, y, x + 5, y - 7, 0.1));
  tr.push(linea(x - 14, top, x + 62, top, 0.3), linea(x, top - 12, x - 14, top, 0.2), linea(x, top - 12, x + 50, top, 0.2), linea(x + 48, top, x + 48, top + 26, 0.1), suave([[x + 44, top + 26], [x + 48, top + 32], [x + 52, top + 27]], 1));
  return P({ trazos: tr }); };
const libro = (x, y, w, h, { lleno = true } = {}) => { const d = cajaRelleno(x, y, w, h, 3); const ls = [linea(x + w * 0.2, y + 2, x + w * 0.2, y + h - 2, 0.1), linea(x + w * 0.35, y + h * 0.35, x + w * 0.8, y + h * 0.35, 0.1)];
  return lleno ? P({ llenos: [{ d, lineas: ls }], trazos: [caja(x, y, w, h, 3)] }) : P({ formas: [d], trazos: [caja(x, y, w, h, 3), ...ls] }); };
const calendario = (x, y, w, h) => { const tr = [caja(x, y, w, h, 6), linea(x + 2, y + h * 0.22, x + w - 2, y + h * 0.22, 0.2), linea(x + w * 0.3, y - 6, x + w * 0.3, y + 6, 0.1), linea(x + w * 0.7, y - 6, x + w * 0.7, y + 6, 0.1)];
  const cols = 5, rows = 3; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const cx = x + w * (0.13 + c * 0.185), cy = y + h * (0.42 + r * 0.2); tr.push(tilde(cx - 4, cy - 1, 0.55)); }
  return P({ formas: [cajaRelleno(x, y, w, h, 6)], trazos: tr }); };
const tensiometro = (cx, cy, r, tubo) => { const d = circuloRelleno(cx, cy, r); const ls = []; for (let i = 0; i < 5; i++) { const a = Math.PI * (1.1 + i * 0.2); ls.push(linea(cx + Math.cos(a) * r * 0.7, cy + Math.sin(a) * r * 0.7, cx + Math.cos(a) * r * 0.85, cy + Math.sin(a) * r * 0.85, 0.05)); }
  ls.push(linea(cx, cy, cx - r * 0.35, cy - r * 0.45, 0.05), `M${f(cx)} ${f(cy)}l.2 .2`);
  return P({ llenos: [{ d, lineas: ls }], trazos: [circulo(cx, cy, r), suave(tubo, 1)] }); };
const carpeta = (x, y, w, h) => { const d = suave([[x, y + 5], [x + w * 0.35, y + 4], [x + w * 0.42, y], [x + w, y], [x + w, y + h], [x, y + h]], 0.2, true);
  return P({ llenos: [{ d, lineas: [linea(x + w * 0.2, y + h * 0.5, x + w * 0.8, y + h * 0.5, 0.1), linea(x + w * 0.2, y + h * 0.72, x + w * 0.6, y + h * 0.72, 0.1)] }], trazos: [] }); };
const pila = (x, base, n, w = 26) => { const tr = [], fo = []; for (let i = 0; i < n; i++) { const y = base - (i + 1) * 9; tr.push(caja(x + (i % 2) * 1.5, y, w, 8, 4, 0.3)); } fo.push(`M${x} ${base - n * 9} L${x + w} ${base - n * 9} L${x + w} ${base} L${x} ${base}Z`); return P({ trazos: tr, formas: fo }); };

// ── las diez ──
export const TANDA1 = [
  { slug: 'que-una-aseguradora-cumpla-lo-que-promete-no-lo-dice-ella-sola', cat: 'Entendé tu plan', idea: 'La empresa dice que cumple; otros lo confirman.',
    dib: () => juntar(edificio(180, 164, 50, 84), globo(172, 16, 66, 40, 206, 78, 'lineas'), persona(138, 164, 74), globoT(106, 58, 44, 34, 132, 100), persona(270, 164, 82), globoT(250, 50, 46, 34, 266, 92), suelo(104, 298, 165)) },
  { slug: 'por-que-el-precio-de-una-cobertura-de-salud-se-avisa-antes-de-subir', cat: 'Entendé tu plan', idea: 'El cartel avisa antes de la subida.',
    dib: () => juntar(escalera(200, 164, 5, 18, 17), cartel(172, 164, 40, 92), persona(130, 164, 84), suelo(104, 298, 165)) },
  { slug: 'el-estudio-que-previene-el-cancer-de-cuello-uterino-esta-en-tu-centro-de-salud', cat: 'Salud en Paraguay', idea: 'Quince minutos, a la vuelta de casa.',
    dib: () => juntar(sol(116, 38, 10, 8), persona(158, 164, 86, { brazos: [['d', 14, 14], ['i', -12, 18]] }), hospital(212, 164, 56, 60), reloj(272, 62, 16), pasto([120, 290], 165), suelo(104, 298, 165)) },
  { slug: 'la-vacuna-contra-el-dengue-ya-se-aplica-hasta-los-60-anos', cat: 'Prevención', idea: 'Grandes y más grandes, con su curita; el mosquito se va.',
    dib: () => { const a = persona(158, 164, 80), b = persona(222, 164, 94); return juntar(a, b, P({ trazos: [linea(236, 128, 244, 165, 0.3)] }), curita(146, 124, 18, 10, -60), curita(209, 120, 18, 10, -60), mosquito(282, 52, 1.2), punteada(curva([272, 62], [250, 80], [230, 70]), 7, 3), pasto([118, 262], 165), suelo(104, 298, 165)); } },
  { slug: 'que-significa-que-un-plan-te-cubra-una-cirugia', cat: 'Entendé tu plan', idea: 'La cirugía es ida y vuelta: antes y después también cuentan.',
    dib: () => juntar(casa(112, 164, 42, 60), hospital(236, 164, 50, 80), punteada(curva([140, 96], [196, 20], [252, 80]), 8, 4), flechita(252, 80, 60), punteada(curva([248, 92], [196, 60], [148, 108]), 8, 4), flechita(148, 108, 125), suelo(104, 298, 165)) },
  { slug: 'un-hospital-se-construye-en-dos-anos-formar-a-quien-atiende-lleva-mas', cat: 'Primeros años', idea: 'La obra avanza; quien va a atender todavía estudia.',
    dib: () => juntar(colinas([[100, 132], [160, 122], [220, 128], [300, 118]]), grua(128, 164, 110), P({ formas: ['M160 164 L160 110 L222 110 L222 164Z'], trazos: [linea(160, 164, 160, 110), linea(160, 110, 222, 110), linea(222, 110, 222, 164), caja(184, 138, 14, 26, 2, 0.3)] }), punteada([[160, 110], [160, 78], [222, 78], [222, 110]], 7, 3.5), persona(262, 164, 82, { brazos: [['i', -10, 4]] }), libro(236, 112, 18, 24), suelo(104, 298, 165)) },
  { slug: 'la-respuesta-al-vih-en-paraguay-se-construye-con-anos-de-anticipacion', cat: 'Salud en Paraguay', idea: 'Todos los días, sin cortes.',
    dib: () => juntar(mancha(), calendario(150, 44, 100, 96)) },
  { slug: 'por-que-controlar-la-presion-importa-aunque-te-sientas-bien', cat: 'Vivir más años', idea: 'Te sentís perfecto y igual te la medís.',
    dib: () => juntar(persona(160, 164, 98, { brazos: [['d', 24, -8]], }), P({ trazos: [caja(178, 114, 16, 12, 3, 0.3)] }), tensiometro(242, 84, 24, [[194, 120], [214, 128], [230, 112], [236, 106]]), suelo(104, 298, 165)) },
  { slug: 'cuando-cambias-de-medico-la-informacion-no-viaja-sola', cat: 'Prevención', idea: 'De un consultorio al otro, con tu carpeta.',
    dib: () => juntar(sol(284, 36, 10, 8), hospital(108, 164, 40, 56), hospital(252, 164, 40, 56), persona(196, 164, 84, { brazos: [['d', 16, 2]] }), carpeta(210, 104, 26, 20), suelo(104, 298, 165)) },
  { slug: 'mas-gente-con-seguro-medico-no-significa-atenderla-mas-barato', cat: 'Entendé tu plan', idea: 'Más gente, y la cuenta sube igual.',
    dib: () => juntar(persona(120, 164, 60), persona(142, 164, 72), persona(164, 164, 56), persona(186, 164, 68), persona(208, 164, 60), pila(230, 164, 3, 20), pila(254, 164, 5, 20), pila(278, 164, 8, 20), suelo(104, 298, 165)) },
];
export function dibujosTanda() { semilla(41); temblor(1.4); return TANDA1.map((t) => ({ ...t, il: t.dib() })); }
