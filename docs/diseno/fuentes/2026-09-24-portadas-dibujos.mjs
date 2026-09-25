// PORTADAS DEL BLOG · DIBUJOS DE PRUEBA (24/09/2026)
//
// Los tres dibujos de la lámina `docs/diseno/img/2026-09-24-portadas-*.webp`
// (docs/diseno/README.md, lecciones 18 y 19). NO es código del sitio: se
// guarda para que, cuando Arturo elija el estilo, la sesión que lo lleve a
// app/blog/Cover.jsx no tenga que redibujar desde cero (BITACORA cap. 96: lo
// que no se guarda en el repo se pierde).
//
// Cada dibujo, en el cuadro de 400×200 de la portada:
//   - `formas`: el papel recortado, relleno plano. Va corrido (5, -4) respecto
//     del trazo, como un recorte que no cayó justo; una forma angosta (el
//     lápiz) va sin correr, porque se despegaría.
//   - `trazos`: la línea a mano, 3,6 de grosor, con su repasado (una copia al
//     40 %, 2,4 de grosor, corrida 0,9 / 0,7 y girada 0,4°).
//   - `mover`: corrimiento de toda la composición para centrarla.
// El borde irregular del papel sale de un filtro (feTurbulence 0,022 +
// feDisplacementMap 2,2). El trazo NO lleva filtro: el mismo filtro cortaba la
// línea en guiones (BITACORA cap. 100). El temblor del trazo va en el dibujo.
//
// Las tres paletas de la primera vuelta (lección 18; los cinco estilos de la
// segunda están en 2026-09-24-portadas-estilos.mjs):
//   A · Tinta navy     fondo -200 (turquesa: -100), papel blanco, trazo #002A52
//   B · Trazo blanco   fondo -700 (navy: -500), papel blanco al 20 %, trazo blanco
//   C · Un solo tono   fondo -50, papel -200, trazo -900 de la misma categoría
// En A y C la firma de la portada lleva el isotipo navy; en B, el blanco.
// Composición centrada entre x 110 y 300: en el riel «Lo último» la portada se
// recorta en cuadrado (x 100–300) y lo que quede afuera no se ve.

// Tres ilustraciones de prueba para portadas del blog (cuadro 400×200).
// Cada una: `formas` (papel recortado, relleno plano) y `trazos` (la línea a mano).

// Dedo como lazo alargado: sale de `b`, avanza `len` en la dirección `ang`
// (grados), da la vuelta con ancho `w` y vuelve. Con un poco de temblor.
function dedo([bx, by], ang, len, w, jit = 0) {
  const a = (ang * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
  const P = (s, t) => [bx + ux * s + nx * t, by + uy * s + ny * t].map((v) => +v.toFixed(1));
  const p1 = P(len * 0.55, -w * 0.08 + jit), p2 = P(len, -w * 0.02), tip = P(len + w * 0.55, w * 0.5), p3 = P(len, w * 1.02), p4 = P(len * 0.5, w * 1.05 - jit), end = P(-2, w * 1.0);
  return `M${bx} ${by} Q${p1} ${p2} C${P(len + w * 0.35, -w * 0.05)} ${P(len + w * 0.6, w * 0.3)} ${tip} S${P(len + w * 0.3, w * 1.05)} ${p3} Q${p4} ${end}`;
}


// Curva suave que pasa por los puntos (Catmull-Rom → Bézier): se dibuja
// "pasando la mano" por una serie de puntos, en vez de calcular cada curva.
export function suave(pts, k = 1) {
  const f = (v) => +v.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}
// Coordenadas del lápiz: s a lo largo (desde la punta), t hacia abajo-derecha.
const LA = (-35 * Math.PI) / 180, LU = [Math.cos(LA), Math.sin(LA)], LN = [-LU[1], LU[0]], LT = [204, 117];
const L = (s, t = 0) => [LT[0] + LU[0] * s + LN[0] * t, LT[1] + LU[1] * s + LN[1] * t];
const Ls = (arr) => arr.map(([s, t]) => L(s, t));

// Un ovillo: lazos que se cruzan en distintas direcciones (epiciclos), y al
// final la línea se suelta hacia la derecha, hasta la cola del globo.
function ovillo() {
  const pts = [];
  for (let i = 0; i <= 44; i++) {
    const t = (i / 44) * Math.PI * 3.6;
    pts.push([143 + 15 * Math.cos(t) + 9 * Math.cos(2.7 * t + 1), 98 + 26 * Math.sin(1.25 * t) + 8 * Math.sin(3.3 * t)]);
  }
  return [...pts, [168, 128], [188, 137], [206, 139.5], [221.5, 137]];
}

export const ILUS = {
  anota: {
    mover: [-26, -6],
    formas: [
      // la hoja, recortada a mano y apenas girada
      'M150 38 C170 35 205 33 233 30 C236 72 238 118 242 162 C214 165 186 167 158 169 C156 126 153 82 150 38Z',
      // el lápiz, también de papel (sin corrimiento: es angosto y se despegaría)
      { d: 'M' + [L(0, 0), L(13, -5.5), L(106, -5.5), L(106, 5.5), L(13, 5.5)].map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L') + 'Z', off: [0, 0] },
    ],
    trazos: [
      // tres renglones: dos tildados, el tercero a medio escribir
      'M162 60c2 2 3.5 4 5 6.5 3-5 6.5-9.5 10.5-13',
      'M184 60c13-1 26-1.8 38-2.6',
      'M164 89c2 2 3.5 4 5 6.5 3-5 6.5-9.5 10.5-13',
      'M186 89c11-.8 22-1.4 32-1.8',
      'M166 118.5c4-.4 8-.6 12-.6',
      'M186 118c5-.3 10-.6 15-.9',
      // la punta del lápiz
      suave([L(13, -5), L(0.5, 0), L(13, 5)], 0.3),
      suave([L(4.5, -1.8), L(0.8, 0), L(4.5, 1.8)], 0.3),
      // la mano, de un solo trazo: dorso, índice sobre el lápiz, mayor, los otros dos recogidos, palma, muñeca
      suave([[330, 140], [312, 110], [296, 93], [278, 83], [262, 80], [246, 90], [231, 99.5], [220, 106.5],
             [216.5, 111.5], [221, 115], [236, 111.5], [247, 108], [236, 116], [233, 122.5], [239, 126], [252, 123],
             [249, 131], [253, 138], [263, 139], [282, 149], [304, 156], [326, 160]]),
      // el pulgar, del otro lado del lápiz
      suave([[268, 72], [252, 79], [239, 87.5], [233.5, 92.5], [237.5, 96.5], [246, 93]]),
    ],
  },
  palabras: {
    mover: [0, -5],
    formas: [
      // el contrato
      'M112 50 C130 47 150 46 170 45 C172 80 173 118 175 152 C156 153 138 155 118 156 C116 120 114 86 112 50Z',
      // el globo de la traducción
      'M212 54 C238 50 264 50 288 54 C294 70 294 104 288 120 C272 124 256 125 240 124 L224 140 L226 122 C218 121 214 119 211 116 C207 98 207 72 212 54Z',
    ],
    trazos: [
      // las palabras enredadas sobre el contrato, que se desatan en una línea…
      suave(ovillo()),
      // …y dibujan el globo
      'M221.5 137c2-5 3-9 3-14-6-1-10-4-12-8-3-16-3-38 1-58 24-5 50-5 74-1 4 18 4 42 0 60-18 3-38 4-58 3',
      'M226 78c14-1 30-1.5 46-1.2',
      'M226 96c10-.8 20-1 30-.8',
    ],
  },
  cerca: {
    mover: [0, -9],
    formas: [
      // la casa
      'M126 104 L158 74 L190 104 L191 160 L127 160Z',
      // el sanatorio
      'M205 68 C228 66 252 66 276 68 L277 160 L206 160Z',
    ],
    trazos: [
      // el barrio de un solo trazo: suelo, casa, suelo, sanatorio, suelo
      'M106 161c10-.4 17-.6 25-.8c-.5-21-.6-43-.1-64c9-8.6 18-17.2 27-26c9.3 8.6 18.6 17.3 28 26c.5 21 .6 43 .2 64c7.6-.3 15.3-.3 23-.1c-.6-30-.6-60 0-90c21.6-1.3 43.3-1.4 65-.4c.8 30 .8 60 .5 91c7-.3 14-.6 21-.9',
      'M151 160c0-8 0-15 .4-22 4-.4 8-.4 12 0 .3 7 .3 14 .1 22',
      'M168 112c4-.3 8-.3 11.4 0 .3 4 .3 8 0 11.4-3.7.3-7.4.3-11 0-.3-3.8-.3-7.6-.4-11.4z',
      // el sanatorio, con su cruz
      'M241 83c-.3 7-.3 15 0 22M231 94c7-.4 14-.4 21 0',
      'M234 160c0-7 0-13 .3-19 5-.3 10-.3 14 0 .2 6 .2 12 0 19',
    ],
  },
};
