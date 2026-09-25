// PORTADAS DEL BLOG · CINCO MANERAS DE DIBUJAR (24/09/2026, tercera vuelta)
//
// Los dibujos de la lámina `docs/diseno/img/2026-09-24-portadas-cinco-maneras-de-dibujar.webp`
// (docs/diseno/README.md, lección 20). NO es código del sitio: se guarda para
// que, cuando Arturo elija, la sesión que lo lleve a app/blog/Cover.jsx parta
// de acá.
//
// El tratamiento ya está elegido: TRAZO BLANCO (Arturo, 24/09: «Trazo blanco
// está bien»). Papel blanco al 20 % (28 % en las manos en silueta), trazo
// blanco de 3,4 con su repasado (copia al 40 %, 2,4, corrida 0,9 / 0,7 y
// girada 0,4°), sobre el -700 de la categoría (navy: #003B71). El papel va
// corrido (4, -3), salvo en el ícono grande.
//
// Lo que se elige ahora es la MANERA DE DIBUJAR. `dibujos()` devuelve
// D[estilo][nota] = { formas, trazos } para los estilos:
//   '1' gente del isotipo · '2' escenas con horizonte · '3' objetos desde arriba
//   '4' manos en silueta · '5' el ícono grande
// y las notas 'anota', 'palabras' y 'cerca'.
//
// Lo que NO se dibuja (BITACORA cap. 101): manos con dedos en lazo, línea suelta
// que va y vuelve, garabatos enredados. Es el lenguaje de los dibujos de Claude.

// Segunda vuelta: cinco maneras de DIBUJAR (no de pintar) las mismas tres notas.
// Todo en el cuadro de 400×200. `formas`: papel translúcido; `trazos`: línea blanca.

let s0 = 7;
const rnd = () => ((s0 = (s0 * 16807) % 2147483647) / 2147483647) - 0.5;
export const semilla = (n) => { s0 = n; };
const f = (v) => +v.toFixed(1);

// Curva suave por puntos (Catmull-Rom → Bézier).
export function suave(pts, k = 1, cerrar = false) {
  const P = cerrar ? [...pts, pts[0], pts[1]] : pts;
  let d = `M${f(P[0][0])} ${f(P[0][1])}`;
  const n = cerrar ? pts.length : P.length - 1;
  for (let i = 0; i < n; i++) {
    const p0 = P[i - 1] || (cerrar ? pts[pts.length - 1] : P[i]), p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return cerrar ? d + 'Z' : d;
}
// Línea a mano entre dos puntos (apenas curva, con temblor).
export function linea(x1, y1, x2, y2, t = 0.8) {
  const mx = (x1 + x2) / 2 + rnd() * t * 2, my = (y1 + y2) / 2 + rnd() * t * 2;
  return `M${f(x1)} ${f(y1)} Q${f(mx)} ${f(my)} ${f(x2)} ${f(y2)}`;
}
// Círculo a mano que no cierra perfecto: se pasa un poco del inicio.
export function circulo(cx, cy, r, t = 0.04) {
  const pts = [];
  const a0 = -2.2 + rnd() * 0.4;
  for (let i = 0; i <= 13; i++) {
    const a = a0 + (i / 12) * Math.PI * 2;
    const rr = r * (1 + rnd() * t);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return suave(pts);
}
export function circuloRelleno(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const rr = r * (1 + rnd() * 0.05); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  return suave(pts, 1, true);
}
// Rectángulo redondeado a mano (trazo abierto que se cierra encimado).
export function caja(x, y, w, h, r = 6, t = 0.8, cerrado = false) {
  const J = () => rnd() * t;
  const pts = [
    [x + r, y + J()], [x + w * 0.5, y + J()], [x + w - r, y + J()], [x + w + J() * 0.3, y + r * 0.35], [x + w + J(), y + r],
    [x + w + J(), y + h * 0.5], [x + w + J(), y + h - r], [x + w - r * 0.35, y + h + J() * 0.3], [x + w - r, y + h + J()],
    [x + w * 0.5, y + h + J()], [x + r, y + h + J()], [x + r * 0.35, y + h - r * 0.35], [x + J(), y + h - r],
    [x + J(), y + h * 0.5], [x + J(), y + r], [x + r * 0.35, y + r * 0.35],
  ];
  return cerrado ? suave(pts, 0.9, true) : suave([...pts, [x + r + 2, y + J()]], 0.9);
}
export function cajaRelleno(x, y, w, h, r = 6) { return caja(x, y, w, h, r, 1.2, true); }
// Tilde a mano.
export const tilde = (x, y, s = 1) => `M${f(x)} ${f(y)}c${f(1.8 * s)} ${f(1.9 * s)} ${f(3.2 * s)} ${f(3.8 * s)} ${f(4.6 * s)} ${f(6 * s)} ${f(2.8 * s)}-${f(4.8 * s)} ${f(6 * s)}-${f(9 * s)} ${f(9.6 * s)}-${f(12.4 * s)}`;
// Persona del isotipo: cabeza en anillo y cuerpo en arco (∩). `brazo`: [dx, dy] opcional desde el costado.
export function persona(x, base, h, { brazo } = {}) {
  const w = h * 0.32, top = base - h * 0.62, r = h * 0.14;
  const cuerpo = suave([[x - w / 2, base], [x - w / 2 + rnd() * 0.6, top + w * 0.55], [x - w * 0.34, top + w * 0.14], [x, top], [x + w * 0.34, top + w * 0.14], [x + w / 2 + rnd() * 0.6, top + w * 0.55], [x + w / 2, base]]);
  const out = [cuerpo, circulo(x, top - r - h * 0.07, r)];
  if (brazo) out.push(suave([[x + w / 2, top + w * 0.9], [x + w / 2 + brazo[0] * 0.5, top + w * 0.9 + brazo[1] * 0.4], [x + w / 2 + brazo[0], top + w * 0.9 + brazo[1]]]));
  return out;
}

// ────────────────────────────── los dibujos ──────────────────────────────
export function dibujos() {
  semilla(11);
  const D = {};

  // 1 · GENTE DEL ISOTIPO
  D['1'] = {
    anota: {
      formas: [cajaRelleno(186, 40, 74, 112, 8)],
      trazos: [
        ...persona(150, 166, 104),
        suave([[166.6, 124], [180, 126], [194, 124], [206, 119]]),
        caja(186, 40, 74, 112, 8),
        tilde(197, 64), linea(214, 65, 247, 64),
        tilde(197, 88), linea(214, 89, 243, 88),
        linea(200, 113, 206, 113), linea(214, 113, 226, 112.6),
        // el lápiz, en la mano, escribiendo el tercero
        suave([[204, 121], [226, 112.6], [231, 115], [209, 124], [204, 121]], 0.1), linea(226, 112.6, 231, 115, 0.1),
        linea(106, 167, 296, 166.4),
      ],
    },
    palabras: {
      formas: [cajaRelleno(130, 30, 50, 36, 12), cajaRelleno(214, 18, 78, 44, 12)],
      trazos: [
        ...persona(148, 166, 80), ...persona(262, 166, 92),
        // globo con la pregunta
        suave([[146, 66], [144, 72], [140, 78], [150, 72], [156, 66]]),
        caja(130, 30, 50, 36, 12),
        suave([[148, 41], [150, 36.5], [158, 36], [162, 41], [159, 46], [154, 49], [154, 53]]), `M154 58.6l.2 .2`,
        // globo con la respuesta clara
        caja(214, 18, 78, 44, 12), suave([[254, 62], [257, 68], [262, 74], [261, 67], [265, 62]]),
        linea(226, 33, 280, 32.4), linea(226, 47, 264, 46.6),
        linea(106, 167, 296, 166.4),
      ],
    },
    cerca: {
      formas: ['M112 118 L134 98 L156 118 L156 164 L112 164Z', 'M246 92 C262 91 278 91 292 92 L292 164 L246 164Z'],
      trazos: [
        linea(104, 166, 298, 165.4),
        suave([[108, 121], [120, 110], [134, 97], [148, 109], [160, 121]], 0.6), linea(114, 116, 114, 165), linea(154, 116, 154.4, 165),
        caja(130, 142, 11, 23, 2),
        caja(244, 90, 48, 75, 3), linea(268, 102, 268, 120), linea(259, 111, 277, 111), caja(262, 146, 12, 19, 2),
        ...persona(180, 165, 66), ...persona(204, 165, 84), ...persona(225, 165, 52),
      ],
    },
  };

  // 2 · ESCENAS CON HORIZONTE
  D['2'] = {
    anota: {
      formas: [cajaRelleno(120, 30, 88, 84, 6), 'M214 128 L276 124 L286 150 L218 154Z'],
      trazos: [
        // la ventana con el campo y el sol
        caja(120, 30, 88, 84, 6), linea(164, 31, 164, 114, 0.4), linea(121, 72, 207, 72, 0.4),
        suave([[124, 104], [140, 94], [156, 99], [172, 90], [190, 97], [205, 93]]), circulo(186, 50, 9),
        // la mesa
        linea(104, 160, 298, 159),
        // el termo y la guampa
        caja(128, 118, 18, 41, 5), linea(131, 128, 143, 128, 0.3), caja(151, 138, 13, 21, 4), linea(157, 138, 163, 121, 0.3),
        // la libreta con los tres renglones
        suave([[214, 128], [276, 124], [286, 150], [218, 154], [214, 128]], 0.2),
        tilde(224, 132, 0.6), linea(233, 133, 262, 131.4, 0.3), tilde(226, 140, 0.6), linea(235, 141, 262, 139.6, 0.3), linea(238, 148.6, 252, 147.8, 0.3),
        linea(262, 156, 294, 136, 0.4),
      ],
    },
    palabras: {
      formas: [circuloRelleno(142, 62, 30), cajaRelleno(214, 36, 72, 40, 12)],
      trazos: [
        linea(104, 162, 298, 161),
        // el lapacho: tronco, copa y flores
        suave([[146, 162], [144, 130], [142, 100], [140, 88]]), suave([[144, 118], [132, 104], [124, 96]]), suave([[143, 106], [156, 94]]),
        circulo(142, 62, 30),
        `M128 52l.2.2M150 44l.2.2M160 66l.2.2M134 76l.2.2M146 60l.2.2M120 66l.2.2`,
        // dos sillas enfrentadas
        suave([[184, 162], [184, 142], [204, 142], [204, 162]], 0.3), suave([[184, 142], [182, 116]], 0.3),
        suave([[256, 162], [256, 142], [276, 142], [276, 162]], 0.3), suave([[276, 142], [278, 116]], 0.3),
        // el termo en el suelo
        caja(225, 136, 13, 26, 4),
        // lo que se dicen
        caja(214, 36, 72, 40, 12), suave([[238, 76], [236, 86], [246, 76]]), linea(226, 50, 274, 49.4), linea(226, 62, 258, 61.6),
      ],
    },
    cerca: {
      formas: ['M130 112 L150 94 L170 112 L170 152 L130 152Z', 'M178 96 C192 95 206 95 220 96 L220 152 L178 152Z', circuloRelleno(122, 48, 13)],
      trazos: [
        // horizonte con lomas y el sol
        suave([[104, 128], [116, 124], [127, 122]]), suave([[221, 121], [240, 118], [262, 112], [282, 115], [298, 120]]), circulo(122, 48, 13),
        // la ciudad lejos, chiquita
        linea(270, 113, 270, 104, 0.2), linea(270, 104, 276, 104, 0.2), linea(276, 104, 276, 111, 0.2), linea(279, 110, 279, 99, 0.2), linea(279, 99, 285, 99, 0.2), linea(285, 99, 285, 113, 0.2),
        // la casa y el sanatorio, juntos, adelante
        linea(104, 153, 298, 152), suave([[127, 115], [150, 93], [173, 115]], 0.5), linea(132, 110, 132, 152), linea(168, 110, 168.4, 152), caja(145, 134, 10, 18, 2),
        caja(178, 96, 42, 56, 3), linea(199, 106, 199, 122), linea(191, 114, 207, 114), caja(193, 136, 12, 16, 2),
        // un lapacho chico al lado
        suave([[236, 152], [236, 128]]), circulo(236, 118, 11),
      ],
    },
  };

  // 3 · OBJETOS DE LA MESA, VISTOS DESDE ARRIBA
  D['3'] = {
    anota: {
      formas: ['M152 48 L252 42 L258 146 L158 152Z', circuloRelleno(122, 74, 20)],
      trazos: [
        // la libreta abierta, con su lomo
        suave([[152, 48], [202, 45], [252, 42], [255, 94], [258, 146], [208, 149], [158, 152], [155, 100], [152, 48]], 0.15), linea(202, 45, 205, 149, 0.6),
        tilde(162, 66, 0.9), linea(175, 67, 195, 66, 0.5), tilde(163, 88, 0.9), linea(176, 89, 196, 88, 0.5), linea(166, 111, 172, 110.8, 0.3), linea(178, 111, 190, 110.5, 0.5),
        linea(212, 64, 244, 62, 0.5), linea(213, 80, 240, 78.6, 0.5),
        // el lápiz cruzado
        suave([[226, 132], [284, 90]], 0.2), suave([[230, 138], [288, 96]], 0.2), linea(226, 132, 219, 142, 0.2), linea(219, 142, 230, 138, 0.2), linea(284, 90, 288, 96, 0.2),
        // la guampa con la bombilla, desde arriba
        circulo(122, 74, 20), circulo(122, 74, 13), linea(126, 70, 146, 42, 0.4), circulo(147, 40, 3),
      ],
    },
    palabras: {
      formas: ['M166 34 L246 30 L252 162 L172 166Z', 'M178 84 L240 81 L241 93 L179 96Z'],
      trazos: [
        // el contrato, con una palabra resaltada
        suave([[166, 34], [206, 32], [246, 30], [249, 96], [252, 162], [212, 164], [172, 166], [169, 100], [166, 34]], 0.15),
        linea(180, 52, 236, 50, 0.5), linea(180, 68, 230, 66, 0.5), linea(182, 89, 238, 87, 0.5), linea(182, 110, 234, 108.4, 0.5), linea(183, 128, 222, 126.6, 0.5), linea(184, 146, 214, 145, 0.5),
        // el resaltador
        suave([[262, 122], [296, 76]], 0.2), suave([[272, 128], [305, 82]], 0.2), linea(262, 122, 272, 128, 0.2), linea(296, 76, 305, 82, 0.2), linea(262, 122, 258, 134, 0.2), linea(258, 134, 267, 131, 0.2),
        // los anteojos
        circulo(124, 118, 13), circulo(152, 116, 13), suave([[136, 114], [138, 110], [140, 113]]), linea(111, 114, 104, 100, 0.4),
      ],
    },
    cerca: {
      formas: ['M130 40 L270 36 L274 160 L134 164Z'],
      trazos: [
        // el mapa, con sus pliegues
        suave([[130, 40], [200, 38], [270, 36], [272, 98], [274, 160], [204, 162], [134, 164], [132, 102], [130, 40]], 0.15),
        linea(177, 39, 180, 163, 0.4),
        // dos calles
        suave([[132, 126], [190, 122], [240, 128], [273, 124]]), suave([[150, 40], [154, 100], [150, 163]]),
        // la casa y el sanatorio marcados, cerca, y el tramo corto
        suave([[190, 116], [190, 96], [202, 84], [214, 96], [214, 116], [190, 116]], 0.2), caja(198, 104, 8, 12, 1.5),
        caja(226, 82, 28, 34, 3), linea(240, 88, 240, 104, 0.2), linea(232, 96, 248, 96, 0.2),
        `M206 122 q10 7 20 0`,
        // las llaves al costado
        circulo(108, 144, 8), linea(114, 139, 124, 128, 0.3), linea(120, 132, 124, 136, 0.2),
      ],
    },
  };

  // 4 · MANOS EN SILUETA (manos macizas, sin dedos en lazo)
  // Mano que escribe: silueta cerrada; el lápiz se ve antes y después de la mano.
  const manoLapiz = [[256, 82], [243, 90], [231, 99], [226, 103], [229, 108], [240, 106], [250, 103], [244, 110], [240, 116], [244, 121], [256, 118],
    [256, 124], [262, 130], [274, 131], [292, 138], [320, 146], [326, 128], [322, 110], [304, 91], [282, 80], [266, 78]];
  // Palma abierta hacia arriba, de costado: antebrazo, pulgar parado, dedos juntos.
  const palma = (dx, dy, s = 1) => [[110, 172], [132, 158], [152, 148], [172, 141], [176, 130], [180, 121], [186, 118], [191, 122], [192, 134],
    [214, 134], [240, 132], [262, 128], [274, 122], [281, 123], [282, 131], [270, 140], [244, 150], [212, 158], [180, 166], [150, 180], [128, 196]]
    .map(([x, y]) => [200 + (x - 200) * s + dx, 140 + (y - 140) * s + dy]);
  D['4'] = {
    anota: {
      formas: ['M150 44 L232 40 L236 150 L154 154Z', suave(manoLapiz, 1, true)],
      trazos: [
        suave([[150, 44], [191, 42], [232, 40], [234, 95], [236, 150], [195, 152], [154, 154], [152, 99], [150, 44]], 0.15),
        tilde(162, 62), linea(180, 63, 222, 61), tilde(164, 88), linea(182, 89, 216, 88), linea(168, 114, 176, 114), linea(184, 114, 202, 113.4),
        // el lápiz: la punta antes de la mano y la cola después
        suave([[213.5, 103.8], [206, 114], [218.1, 110.4]], 0.2), linea(213.5, 103.8, 226, 95, 0.2), linea(218.1, 110.4, 228, 104, 0.2),
        linea(262, 74, 279, 57.9, 0.2), linea(266, 80, 283.6, 64.5, 0.2), linea(279, 57.9, 283.6, 64.5, 0.2),
        suave(manoLapiz, 1, true), linea(236, 112, 246, 108, 0.2),
      ],
    },
    palabras: {
      formas: [suave(palma(0, 6), 1, true), cajaRelleno(186, 40, 82, 48, 14)],
      trazos: [
        // en la palma de la mano
        suave(palma(0, 6), 1, true), linea(250, 142, 266, 136, 0.3),
        caja(186, 40, 82, 48, 14), suave([[222, 88], [226, 100], [234, 88]]), linea(200, 56, 254, 55.4), linea(200, 71, 234, 70.6),
      ],
    },
    cerca: {
      formas: [suave(palma(0, 10), 1, true), 'M198 124 L212 110 L226 124 L226 144 L198 144Z', 'M232 106 C242 105 252 105 262 106 L262 142 L232 142Z'],
      trazos: [
        // te queda a mano
        suave(palma(0, 10), 1, true), linea(250, 152, 266, 146, 0.3),
        suave([[195, 126], [212, 109], [229, 126]], 0.5), linea(200, 122, 200, 144), linea(224, 122, 224.4, 144), caja(207, 132, 9, 12, 2),
        caja(232, 104, 30, 38, 3), linea(247, 110, 247, 122), linea(241, 116, 253, 116), caja(242, 131, 10, 11, 2),
      ],
    },
  };

  // 5 · EL ÍCONO GRANDE (la portada como un ícono del sitio, ampliado dentro de su mancha)
  D['5'] = {
    anota: {
      formas: [circuloRelleno(200, 98, 76)],
      trazos: [
        caja(166, 52, 64, 88, 7), caja(186, 44, 24, 14, 4),
        tilde(176, 74, 0.8), linea(191, 75, 218, 74), tilde(176, 96, 0.8), linea(191, 97, 214, 96), linea(180, 118, 186, 118), linea(191, 118, 204, 117.6),
        suave([[214, 138], [248, 104]], 0.2), suave([[220, 144], [254, 110]], 0.2), linea(214, 138, 208, 150, 0.2), linea(208, 150, 220, 144, 0.2), linea(248, 104, 254, 110, 0.2),
      ],
    },
    palabras: {
      formas: [circuloRelleno(200, 98, 76)],
      trazos: [
        // el diccionario abierto
        suave([[200, 68], [184, 60], [162, 60], [152, 64], [152, 130], [164, 126], [184, 126], [200, 134]], 0.8),
        suave([[200, 68], [216, 60], [238, 60], [248, 64], [248, 130], [236, 126], [216, 126], [200, 134]], 0.8),
        linea(200, 68, 200, 134, 0.4),
        linea(162, 78, 190, 80, 0.4), linea(162, 92, 190, 94, 0.4), linea(162, 106, 184, 107.6, 0.4),
        linea(210, 80, 238, 78, 0.4), linea(210, 94, 238, 92, 0.4), linea(210, 108, 228, 106.8, 0.4),
        suave([[228, 124], [228, 146], [234, 140], [240, 146], [240, 122]], 0.3),
      ],
    },
    cerca: {
      formas: [circuloRelleno(200, 98, 76)],
      trazos: [
        linea(146, 138, 254, 137),
        suave([[148, 103], [170, 82], [192, 103]], 0.5), linea(153, 98, 153, 138), linea(187, 98, 187.4, 138), caja(164, 118, 12, 20, 2), caja(164, 100, 11, 10, 2),
        caja(202, 76, 44, 62, 3), linea(224, 86, 224, 104), linea(215, 95, 233, 95), caja(217, 120, 14, 18, 2),
      ],
    },
  };
  return D;
}
