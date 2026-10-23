#!/usr/bin/env node
/* ¿El simulador cobra lo que dice la tabla de precios?

   La fuente es la tabla del 09/10/2026 del Drive de Arturo («9 octubre  2026
   TABLA DE PRECIOS.pdf»), transcripta en datos/planes-vigentes/silver.json,
   gold.json y essential.json. Regla de Arturo (23/10/2026): «Si no coincide el
   simulador con el archivo de Drive, el archivo de Drive gana.» Esto corre el
   motor real (engine() de app/quote.js) y lo compara con esos JSON:

   - Silver y Gold: los 7 ejemplos «GRUPOS» de cada plan (14), cada uno con
     las edades en el borde de su tramo y en el medio; y cada tarifa por
     categoría (titular, cónyuge, adherente, hijo adicional, grupo familiar).
   - Essential: las 10 filas de su tabla en las tres zonas (30).
   - Lo que la tabla no dice y el motor deduce (inferencias anotadas en los
     JSON), los grupos sin tarifa en Essential y los casos del simulador que
     se revisaron en el navegador.

   La prueba se prueba a sí misma: corre lo mismo contra la regla de antes del
   09/10 (el titular acompañado pagaba como cónyuge; Essential sin las filas
   nuevas) y tiene que encontrar diferencias. Si no las encuentra, no está
   mirando nada.

   Uso: node qa/precios.mjs   (sin build ni navegador; lo corre el CI) */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { register } from 'node:module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const leer = (f) => JSON.parse(readFileSync(join(ROOT, 'datos/planes-vigentes', f), 'utf8'));
const SILVER = leer('silver.json');
const GOLD = leer('gold.json');
const ESS = leer('essential.json');

// app/ importa sin extensión («./geo»), como lo resuelve Next. Para Node, el
// mismo import con «.js».
register('data:text/javascript,' + encodeURIComponent(
  'export async function resolve(s, c, n) { try { return await n(s, c); } catch (e) {'
  + ' if (s.startsWith(".") && !/\\.[cm]?js$/.test(s)) return n(s + ".js", c); throw e; } }'));
const { engine, essentialNoAplica } = await import(pathToFileURL(join(ROOT, 'app/quote.js')).href);

const A = (age) => ({ age, kind: 'adult' });
const H = (age) => ({ age, kind: 'kid' });
const NIVEL = { silver: 'equilibrio', gold: 'amplia', essential: 'esencial' };
const ZONA = { asuncion_central: { ubi: { deptId: 'asuncion' } }, interior: { ubi: { deptId: 'itapua' } }, nacional: { essNacional: true } };
const fmt = (n) => (n == null ? '—' : Math.round(n).toLocaleString('es-PY'));

// El precio de verdad: el motor del sitio. null si el plan no le da tarifa al
// grupo (Essential lo pasa a Silver).
const motor = (plan, gente, zona) => {
  const r = engine({ who: 'familia', nivel: NIVEL[plan], people: gente, ...(plan === 'essential' ? ZONA[zona] : {}) });
  return r.key === plan ? r.price : null;
};

/* Las pruebas, contra cualquier función de precio (el motor, o la regla vieja
   de la autoprueba). Devuelve [aciertos, fallas]. */
function revisar(precio) {
  const ok = [], mal = [];
  const igual = (que, dio, debe) => (dio === debe ? ok : mal).push(que + ': ' + fmt(dio) + (dio === debe ? '' : ' (la tabla dice ' + fmt(debe) + ')'));
  const dif = (plan, con, sin, z) => { const a = precio(plan, con, z), b = precio(plan, sin, z); return a == null || b == null ? null : a - b; };

  // SILVER Y GOLD — los ejemplos «GRUPOS», en el orden de la tabla. Cada uno,
  // en el borde de su tramo (54 / 59 / hijos de 20) y en el medio.
  const GRUPOS = [
    ['Titular solo hasta 54', () => [A(54)], () => [A(31)]],
    ['Titular y cónyuge hasta 54', () => [A(54), A(54)], () => [A(30), A(28)]],
    ['Titular (h/54) y 1 hijo hasta 20', () => [A(54), H(20)], () => [A(35), H(8)]],
    ['Titular (h/54) y 2 hijos hasta 20', () => [A(54), H(20), H(20)], () => [A(35), H(9), H(4)]],
    ['Titular (h/54) y 3 hijos hasta 20', () => [A(54), H(20), H(20), H(20)], () => [A(40), H(12), H(9), H(1)]],
    ['Titular, cónyuge (h/59) y 3 hijos hasta 20', () => [A(59), A(59), H(20), H(20), H(20)], () => [A(44), A(41), H(15), H(10), H(6)]],
    ['Titular, cónyuge (h/54) y 1 hijo hasta 20', () => [A(54), A(54), H(20)], () => [A(36), A(33), H(3)]],
  ];
  for (const [plan, J] of [['silver', SILVER], ['gold', GOLD]]) {
    const ej = J.precios.ejemplos_grupos;
    if (ej.length !== GRUPOS.length) mal.push(plan + ': la tabla tiene ' + ej.length + ' ejemplos y la prueba conoce ' + GRUPOS.length);
    GRUPOS.forEach(([nombre, borde, medio], i) => {
      const e = ej[i];
      if (!e || !e.grupo.startsWith(nombre)) { mal.push(plan + ': el ejemplo ' + (i + 1) + ' de la tabla no es «' + nombre + '» (es «' + (e && e.grupo) + '»)'); return; }
      igual(plan + ', ' + nombre + ' (borde)', precio(plan, borde()), e.prima);
      igual(plan + ', ' + nombre + ' (medio)', precio(plan, medio()), e.prima);
    });

    // Cada tarifa por categoría, sola o como diferencia entre dos grupos.
    const P = J.precios;
    const edadDe = (tramo) => +tramo.split('-')[0];
    P.titular_solo.forEach((t) => igual(plan + ', titular solo ' + t.edad, precio(plan, [A(Math.max(18, edadDe(t.edad)))]), t.prima));
    P.conyuge.forEach((t) => igual(plan + ', cónyuge ' + t.edad, dif(plan, [A(30), A(Math.max(18, edadDe(t.edad)))], [A(30)]), t.prima));
    P.adherente_con_parentesco_cada_uno.forEach((t) => {
      const e = edadDe(t.edad);
      // Hasta 35 se prueba como hijo; de ahí para arriba, como tercer adulto
      // (padre, suegra…), que paga la misma tarifa.
      const quien = e <= 35 ? H(e) : A(e);
      igual(plan + ', adherente ' + t.edad, dif(plan, [A(30), A(30), quien], [A(30), A(30)]), t.prima);
    });
    igual(plan + ', adherente 21-54 (hijo de 35)', dif(plan, [A(50), H(35)], [A(50)]), P.adherente_con_parentesco_cada_uno[1].prima);
    igual(plan + ', hijo adicional desde el 3º', dif(plan, [A(40), A(40), H(5), H(5), H(5)], [A(40), A(40), H(5), H(5)]), P.hijo_adicional_desde_3ro.prima);
    const [g59, g64] = P.grupo_familiar_titular_conyuge_2_hijos_hasta_20;
    igual(plan + ', grupo familiar T-C hasta 59', precio(plan, [A(59), A(25), H(20), H(0)]), g59.prima);
    igual(plan + ', grupo familiar T-C 60-64', precio(plan, [A(40), A(64), H(20), H(0)]), g64.prima);
    igual(plan + ', grupo familiar T-C 60-64 (el mayor es el titular)', precio(plan, [A(60), A(30), H(10), H(7)]), g64.prima);
    // Un hijo de 21 o más no arma el grupo familiar ni cuenta como 3º hijo.
    igual(plan + ', T+C + 2 hijos de hasta 20 + 1 de 23', precio(plan, [A(40), A(40), H(10), H(7), H(23)]), g59.prima + P.adherente_con_parentesco_cada_uno[1].prima);
    // Con uno de los dos de más de 64 no hay grupo familiar: se suma cada uno.
    igual(plan + ', T 66 + C 60 + 2 hijos (sin grupo familiar)', precio(plan, [A(66), A(60), H(10), H(7)]), P.titular_solo[2].prima + P.conyuge[1].prima + 2 * P.adherente_con_parentesco_cada_uno[0].prima);
  }

  // ESSENTIAL — las 10 filas de la tabla, en las tres zonas.
  const FILAS = {
    titular: [() => [A(64)], () => [A(18)]],
    adherente_0_20: [() => [[A(30), H(20)], [A(30)]], () => [[A(50), H(0)], [A(50)]]],
    adherente_21_35: [() => [[A(50), H(21)], [A(50)]], () => [[A(60), H(35)], [A(60)]]],
    pareja_18_45: [() => [A(45), A(18)], () => [A(30), A(28)]],
    pareja_46_64: [() => [A(46), A(30)], () => [A(64), A(64)]],
    titular_y_adherente_18_45: [() => [A(18), A(45)]],
    titular_y_adherente_46_64: [() => [A(30), A(46)]],
    titular_mas_2_menores: [() => [A(64), H(20), H(0)], () => [A(42), H(10), H(7)]],
    dos_adultos_mas_1_menor: [() => [A(64), A(18), H(20)], () => [A(50), A(48), H(5)]],
    dos_adultos_mas_2_menores: [() => [A(18), A(64), H(0), H(20)], () => [A(37), A(37), H(9), H(6)]],
  };
  const filas = ESS.tabla_09_10_2026.filas;
  if (filas.length !== 10) mal.push('essential: la tabla tiene ' + filas.length + ' filas y la prueba espera 10');
  for (const f of filas) {
    const casos = FILAS[f.clave];
    if (!casos) { mal.push('essential: la prueba no conoce la fila «' + f.fila + '»'); continue; }
    for (const zona of ['interior', 'asuncion_central', 'nacional']) {
      casos.forEach((caso, k) => {
        const g = caso();
        const dio = Array.isArray(g[0]) ? dif('essential', g[0], g[1], zona) : precio('essential', g, zona);
        igual('essential ' + zona + ', «' + f.fila + '»' + (k ? ' (otro caso)' : ''), dio, f[zona]);
      });
    }
  }
  // Lo que el motor arma con las filas que hay (inferencia en essential.json).
  const fila = Object.fromEntries(filas.map((f) => [f.clave, f]));
  for (const zona of ['interior', 'asuncion_central', 'nacional']) {
    const v = (k) => fila[k][zona];
    igual('essential ' + zona + ', 1 adulto + 1 hijo', precio('essential', [A(35), H(6)], zona), v('titular') + v('adherente_0_20'));
    igual('essential ' + zona + ', 1 adulto + 3 hijos', precio('essential', [A(40), H(12), H(9), H(3)], zona), v('titular_mas_2_menores') + v('adherente_0_20'));
    igual('essential ' + zona + ', 2 adultos + 3 hijos', precio('essential', [A(40), A(38), H(12), H(9), H(3)], zona), v('dos_adultos_mas_2_menores') + v('adherente_0_20'));
    igual('essential ' + zona + ', pareja 40/38 + hijo de 23', precio('essential', [A(40), A(38), H(23)], zona), v('pareja_18_45') + v('adherente_21_35'));
    igual('essential ' + zona + ', 2 adultos + 1 hijo de 10 + 1 de 30', precio('essential', [A(50), A(50), H(10), H(30)], zona), v('dos_adultos_mas_1_menor') + v('adherente_21_35'));
    igual('essential ' + zona + ', tercer adulto de 35', precio('essential', [A(40), A(40), A(35)], zona), v('pareja_18_45') + v('adherente_21_35'));
    // La rareza de la tabla, a propósito (Drive gana): sola, la pareja de 46
    // a 64 paga más que con un hijo. Si la tabla cambia, esto avisa.
    const sola = precio('essential', [A(50), A(50)], zona), conHijo = precio('essential', [A(50), A(50), H(5)], zona);
    (sola > conHijo ? ok : mal).push('essential ' + zona + ', la rareza de la tabla sigue: pareja de 50 sola ' + fmt(sola) + ', con un hijo ' + fmt(conHijo));
  }
  // Sin tarifa en Essential: pasa a Silver.
  for (const [que, g] of [['adulto de 65', [A(65)]], ['hijo de 36', [A(40), H(36)]], ['tercer adulto de 36', [A(40), A(40), A(36)]]]) {
    const dio = precio('essential', g, 'asuncion_central');
    (dio == null ? ok : mal).push('essential sin tarifa, ' + que + (dio == null ? '' : ': cotizó ' + fmt(dio)));
  }

  // Los casos que se miraron en el navegador (simulador, 23/10/2026).
  igual('simulador: pareja 30/28 en Silver', precio('silver', [A(30), A(28)]), 552000);
  igual('simulador: titular 35 + 2 hijos en Gold', precio('gold', [A(35), H(9), H(4)]), 908000);
  igual('simulador: mamá 42 + 2 hijos en Essential, Asunción', precio('essential', [A(42), H(10), H(7)], 'asuncion_central'), 415000);
  igual('simulador: pareja 40/38 + hijo de 23 en Essential, Asunción', precio('essential', [A(40), A(38), H(23)], 'asuncion_central'), 545000);
  return [ok, mal];
}

/* La autoprueba: la regla de antes del 09/10/2026, escrita acá a propósito.
   Silver y Gold: con dos personas o más, titular y cónyuge pagaban «cónyuge»,
   y el hijo adicional solo con grupo familiar. Essential: sin adherente de 21
   a 35 ni las filas de titular + 2 hijos y de 2 adultos + 1 hijo. */
const T = {
  silver: { solo: [324000, 420000, 570000, 741000], tc: [228000, 330000, 430000, 684000], adh: [172000, 226000], hijo3: 140000, pkg: [770000, 1000000] },
  gold: { solo: [432000, 560000, 680000, 884000], tc: [324000, 440000, 540000, 816000], adh: [238000, 324000], hijo3: 180000, pkg: [990000, 1300000] },
};
const E = { asuncion_central: [265000, 110000, 395000, 475000, 550000], interior: [220000, 92000, 330000, 400000, 460000], nacional: [305000, 125000, 455000, 545000, 635000] };
const br = (a) => (a <= 54 ? 0 : a <= 64 ? 1 : a <= 69 ? 2 : 3);
function reglaVieja(plan, gente, zona) {
  const ad = gente.filter((p) => p.kind !== 'kid'), men = gente.filter((p) => p.kind === 'kid' && p.age <= 20).length, may = gente.filter((p) => p.kind === 'kid' && p.age > 20).length;
  if (plan === 'essential') {
    const [tit, men1, par18, par46, grupo] = E[zona];
    if (ad.some((p) => p.age > 64) || may || ad.length > 2) return null;
    if (ad.length <= 1) return tit + men * men1;
    if (men >= 2) return grupo + (men - 2) * men1;
    return (Math.max(ad[0].age, ad[1].age) <= 45 ? par18 : par46) + men * men1;
  }
  const t = T[plan];
  if (gente.length === 1) return t.solo[br(ad[0].age)];
  if (ad.length === 2 && men >= 2 && Math.max(ad[0].age, ad[1].age) <= 64) return t.pkg[Math.max(ad[0].age, ad[1].age) <= 59 ? 0 : 1] + (men - 2) * t.hijo3 + may * t.adh[1];
  return ad.reduce((s, p) => s + t.tc[br(p.age)], 0) + men * t.adh[0] + may * t.adh[1];
}

const [ok, mal] = revisar(motor);
const [, malVieja] = revisar(reglaVieja);
const vieja = (re) => malVieja.some((m) => re.test(m));
// Lo que la regla vieja tiene que fallar, uno por cada cosa que cambió.
const debeVer = [
  ['Silver, titular y cónyuge hasta 54 (la regla de julio daba 456.000)', /^silver, Titular y cónyuge hasta 54/],
  ['Gold, titular + 3 hijos (el hijo adicional sin grupo familiar)', /^gold, Titular \(h\/54\) y 3 hijos/],
  ['Essential, titular + 2 hijos (fila nueva)', /^essential asuncion_central, «Grupo Familiar: Titular de 18-64 \+ 2/],
  ['Essential, hijo de 21 a 35 (fila nueva)', /^essential interior, «Adherentes de 21-35»/],
];
const ciega = debeVer.filter(([, re]) => !vieja(re));

if (mal.length || ciega.length) {
  if (mal.length) console.error('✗ precios: el motor no da lo que dice la tabla del 09/10/2026 en ' + mal.length + ' de ' + (ok.length + mal.length) + ' casos:\n  ' + mal.join('\n  '));
  if (ciega.length) console.error('✗ precios, autoprueba: contra la regla de antes del 09/10 la prueba no vio:\n  ' + ciega.map(([q]) => q).join('\n  '));
  console.error('  La tabla está en datos/planes-vigentes/{silver,gold,essential}.json; el motor, en app/quote.js. Drive gana: si la tabla cambió, se transcribe y el motor se ajusta a ella.');
  process.exit(1);
}
console.log('✓ precios: el motor da lo que dice la tabla del 09/10/2026 en los ' + ok.length + ' casos (14 ejemplos de Silver y Gold, 10 filas de Essential × 3 zonas, tarifas por categoría, inferencias y grupos sin tarifa)');
console.log('✓ precios, autoprueba: contra la regla de antes del 09/10 la misma prueba falla en ' + malVieja.length + ' casos, y ve los ' + debeVer.length + ' cambios');
