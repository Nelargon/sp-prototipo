/* Salud Protegida — shared quote/simulator logic and contact constants.
   Pure functions (no React) used by both the home page and the /simulador route.

   Precios y coberturas REALES (jul 2026): planes vigentes Bronce / Silver /
   Gold (ex "Privilege", el usuario pidió quitar esa palabra) y Plan Vital
   (senior 65+). Fuente: datos/planes-vigentes/*.json, tomados de los
   cuadernillos y tarifarios oficiales. Primas con IVA incluido. Contenido
   temporal hasta que existan los planes nuevos (Esencial/Integral/Premium). */

import { DEPT_AJUSTE } from './geo';

/* Salud Protegida contact. One number for WhatsApp, urgencias and phone.
   WHATSAPP_NUMBER is used for every wa.me link; SP_TEL for tel: (call) links. */
export const WHATSAPP_NUMBER = '595 21 319 0000';
export const SP_PHONE_DISPLAY = '(021) 319 0000';
export const SP_TEL = '+595213190000';

/* Fundación: agosto de 2002 (dato confirmado por el usuario, jul 2026).
   Años cumplidos calculados en cada build — el sitio es estático, la cifra
   se refresca sola con cada deploy. */
export const FOUNDED_YEAR = 2002;
const _now = new Date();
export const YEARS_CARING = _now.getFullYear() - FOUNDED_YEAR - (_now.getMonth() < 7 ? 1 : 0);

export const fmt = (n) =>
  '₲ ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/* Tarifario vigente (IVA incluido). Tramos de edad: 0-54 / 55-64 / 65-69 /
   70+ (el tramo 70+ es de renovación, no de venta nueva; se usa solo como
   estimación). El tramo 70+ sale de la tabla consolidada de julio 2026
   (Tabla_Precios_Planes_SP_Privilege_2026_Julio.pdf, pág. 1) — antes no
   había cifra de titular solo 70+ y se estimaba con la de 65-69.
   solo: titular sin adherentes · tc: titular/cónyuge cada uno (aplica en
   cuanto hay más de una persona) · adh: adherente con parentesco ·
   hijo3: hijo adicional desde el 3º (con prima de grupo familiar) ·
   pkg: grupo familiar titular + cónyuge + 2 hijos (≤59 / 60-64). */
const TARIFAS = {
  bronce: { solo: [238000, 300000, 450000, 585000], tc: [162000, 220000, 320000, 540000], adh0_20: 119000, hijo3: 100000, pkg: [550000, 720000] },
  silver: { solo: [324000, 420000, 570000, 741000], tc: [228000, 330000, 430000, 684000], adh0_20: 172000, hijo3: 140000, pkg: [770000, 1000000] },
  gold: { solo: [432000, 560000, 680000, 884000], tc: [324000, 440000, 540000, 816000], adh0_20: 238000, hijo3: 180000, pkg: [990000, 1300000] },
};
const VITAL_PRECIO = 283000; // titular 65+, costo con débito automático
const VITAL_PARTICULAR = 312000; // titular 65+, costo particular

/* 10% de descuento pagando con débito automático o tarjeta de crédito
   (confirmado por el usuario, jul 2026). Las primas del tarifario
   Privilege son el precio particular; Vital publica ambas columnas. */
export const AUTO_PAY_DISCOUNT = 0.10;

const bracket = (a) => (a <= 54 ? 0 : a <= 64 ? 1 : a <= 69 ? 2 : 3);

export const plans = () => [
  { name: 'Plan Bronce', short: 'Bronce', price: TARIFAS.bronce.solo[0], color: '#A9724B', tag: 'Para empezar a cuidarte',
    lines: ['Urgencias 24 h al 100%, desde el día uno', 'Consultas con especialistas (hasta 3 al año por especialidad)', 'Radiografías y ecografías cubiertas', 'Internación semi-suite, hasta 20 días al año', 'Psicología: 3 sesiones al año'] },
  { name: 'Plan Silver', short: 'Silver', price: TARIFAS.silver.solo[0], color: '#66717E', tag: 'El que suma resonancia',
    lines: ['Todo lo de Bronce, con más consultas (5 al año)', 'Tomografía y resonancia al 100%', 'Terapia intensiva hasta 5 días al año', 'Fisioterapia: 15 sesiones al año', 'Medicamentos en internación hasta ₲ 1.000.000'] },
  { name: 'Plan Gold', short: 'Gold', price: TARIFAS.gold.solo[0], color: '#B8860B', tag: 'La cobertura más amplia',
    lines: ['Consultas sin tope anual en casi todas las especialidades', 'Tomografía y resonancia al 100%, con menos espera', 'Internación semi-suite, hasta 25 días al año', 'Terapia intensiva hasta 6 días al año', 'Medicamentos en internación hasta ₲ 1.500.000'] },
];

export const ageTxt = (a) => (a >= 85 ? '85+' : String(a));

export const peopleFor = (who) => {
  if (who === 'mi') return [{ role: 'Vos', age: 32, kind: 'adult' }];
  if (who === 'pareja') return [{ role: 'Vos', age: 34, kind: 'adult' }, { role: 'Tu pareja', age: 34, kind: 'adult' }];
  if (who === 'familia') return [{ role: 'Vos', age: 37, kind: 'adult' }, { role: 'Tu pareja', age: 37, kind: 'adult' }, { role: 'Hijo/a 1', age: 9, kind: 'kid' }];
  if (who === 'padres') return [{ role: 'Adulto mayor', age: 68, kind: 'adult' }];
  return [{ role: 'Vos', age: 34, kind: 'adult' }];
};

/* Precio real de un grupo en un plan Bronce/Silver/Gold, siguiendo las
   reglas del tarifario (verificado contra los ejemplos "GRUPOS" de los
   PDFs oficiales):
   - una sola persona → tarifa "titular solo" por edad;
   - más de una → titular y cónyuge pagan la tarifa T/C por edad; los
     hijos (0-20) pagan adherente; adultos extra pagan T/C por edad;
   - titular + cónyuge + 2 hijos → prima de grupo familiar (≤59 / 60-64),
     y del 3er hijo en adelante, la prima de hijo adicional. */
const priceFor = (planKey, people) => {
  const T = TARIFAS[planKey];
  const adults = people.filter((p) => p.kind !== 'kid');
  const kids = people.filter((p) => p.kind === 'kid');
  if (people.length === 1 && adults.length === 1) return T.solo[bracket(adults[0].age)];
  if (adults.length === 2 && kids.length >= 2) {
    const maxAd = Math.max(adults[0].age, adults[1].age);
    if (maxAd <= 64) return T.pkg[maxAd <= 59 ? 0 : 1] + (kids.length - 2) * T.hijo3;
  }
  let total = 0;
  adults.forEach((p) => { total += T.tc[bracket(p.age)]; });
  kids.forEach(() => { total += T.adh0_20; });
  return total;
};

export const engine = (d) => {
  const base = plans();
  /* Ubicación (jul 2026): d.ubi = {ciudad, deptId, deptNombre} sale del
     buscador de ciudades (app/geo.js). El precio vigente es nacional; el
     ajuste por departamento existe pero es neutro (DEPT_AJUSTE, todo 1)
     hasta que la mesa técnica defina precio por zona. d.geo (string) es
     el formato viejo de simulaciones guardadas — solo se conserva para
     que un "Retomar mi simulación" anterior no rompa. */
  const ubi = d.ubi && d.ubi.deptId ? d.ubi : null;
  const P = {
    bronce: { name: base[0].name, color: base[0].color, why: 'Cobertura real de entrada: urgencias, consultas y estudios del día a día, al precio más accesible.' },
    silver: { name: base[1].name, color: base[1].color, why: 'El equilibrio con respaldo de verdad: suma tomografía y resonancia al 100%, más días de terapia intensiva y topes más altos.' },
    gold: { name: base[2].name, color: base[2].color, why: 'La cobertura más amplia del tarifario vigente: consultas sin tope, más días de internación y los topes más altos.' },
    vital: { name: 'Plan Vital', color: '#003B71', why: 'Pensado para personas de 65 años o más: consultas, urgencias 24 h, ambulancia a domicilio y cobertura que crece con la antigüedad.' },
  };
  let best;
  if (d.who === 'padres') best = 'vital';
  else best = ({ esencial: 'bronce', equilibrio: 'silver', amplia: 'gold' })[d.nivel] || 'silver';
  const ppl = d.people && d.people.length ? d.people : [{ age: 35, kind: 'adult' }];
  const nAdultos = ppl.filter((p) => p.kind !== 'kid').length;
  const personas = best === 'vital'
    ? VITAL_PRECIO * nAdultos
    : priceFor(best, ppl);
  /* El tarifario vigente es nacional: hoy el ajuste por departamento es 1. */
  const GL = { central: 'Central', interior: 'Interior', nacional: 'Nacional' };
  const ajuste = ubi ? (DEPT_AJUSTE[ubi.deptId] || 1) : 1;
  const price = Math.round(personas * ajuste);
  /* Privilege publica el precio particular → el pago automático descuenta 10%.
     Vital ya publica el precio con débito → mostramos el particular como referencia. */
  const autoPay = best === 'vital' ? null : Math.round(price * (1 - AUTO_PAY_DISCOUNT));
  const vitalParticular = best === 'vital' ? VITAL_PARTICULAR * nAdultos : null;
  return {
    key: best, name: P[best].name, color: P[best].color, why: P[best].why,
    geoLabel: ubi ? 'Nacional' : (GL[d.geo] || ''), ubi, price, autoPay, vitalParticular,
    breakdown: { base: personas, personas, geoMult: ajuste, geoDelta: price - personas, addonsSum: 0, addonItems: [] },
  };
};

export const groupLabel = (d) => {
  const ppl = d.people || [];
  const ad = ppl.filter((p) => p.kind !== 'kid').length;
  const ki = ppl.filter((p) => p.kind === 'kid').length;
  if (d.who === 'mi') return 'para vos';
  if (d.who === 'pareja') return 'para tu pareja y vos';
  if (d.who === 'familia') return 'para ' + ad + ' adultos + ' + ki + ' ' + (ki === 1 ? 'hijo' : 'hijos');
  if (d.who === 'padres') return ad > 1 ? 'para dos adultos mayores' : 'para un adulto mayor';
  return 'según tus respuestas';
};

export const titularAge = (d) => { const a = (d.people || []).find((p) => p.kind !== 'kid'); return a ? ageTxt(a.age) : '—'; };

export const opts = () => ({
  who: [
    { k: 'mi', label: 'Para mí', note: '' },
    { k: 'pareja', label: 'Para mi pareja y yo', note: '' },
    { k: 'familia', label: 'Para mi familia, con hijos', note: '' },
    { k: 'padres', label: 'Para mis padres o un adulto mayor', note: 'Es un plan aparte (Plan Vital), para personas de 65 años o más.' },
  ],
  nivel: [
    { k: 'esencial', label: 'Lo esencial, para estar cubierto en lo importante', note: 'Urgencias al 100%, consultas y estudios del día a día. Para quien quiere pagar lo justo.' },
    { k: 'equilibrio', label: 'Un equilibrio entre precio y cobertura', note: 'Suma tomografía y resonancia al 100% y topes más altos. El paso que más tranquilidad agrega.' },
    { k: 'amplia', label: 'La cobertura más amplia posible', note: 'Consultas sin tope anual, más días de internación y terapia intensiva, los topes más altos.' },
  ],
  /* geo: reemplazado por el buscador de ciudades (app/geo.js) — el paso
     "¿Dónde querés tu cobertura?" ya no usa opciones fijas (HANDOFF 11h). */
  addons: [],
});

export const why = () => ({
  who: 'Así armamos un plan a la medida de quienes querés cuidar.',
  edades: 'La edad define el tramo del tarifario. Con este dato te damos el precio de lista real, no un estimado al voleo.',
  nivel: 'No todos necesitan lo mismo. Te mostramos el plan que mejor equilibra lo que te importa y lo que querés pagar.',
  geo: 'Tu precio hoy es el mismo en todo el país. Tu ciudad nos deja mostrarte la red que te queda cerca — y saber dónde nos falta crecer.',
  addons: '',
  contacto: 'Te mostramos tu precio ahora. Te pedimos estos datos para que un asesor lo confirme y te acompañe, sin compromiso.',
});
