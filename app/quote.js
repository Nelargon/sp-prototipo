/* Salud Protegida — shared quote/simulator logic and contact constants.
   Pure functions (no React) used by both the home page and the /simulador route.

   Precios y coberturas REALES: Essential / Silver / Gold y Plan Vital
   (senior 65+). Fuente: datos/planes-vigentes/*.json, tomados de los
   cuadernillos y tarifarios oficiales. Primas con IVA incluido.
   Essential reemplazó a Bronze el 24/09/2026 (Arturo: "El plan Bronze ha
   quedado obsoleto; ya no se comercializa"). Silver y Gold son de la gama
   que internamente se llama "Privilege" (nunca de cara al cliente). */

import { DEPT_AJUSTE } from './geo';

/* Salud Protegida contact. One number for WhatsApp, urgencias and phone.
   WHATSAPP_NUMBER is used for every wa.me link; SP_TEL for tel: (call) links. */
export const WHATSAPP_NUMBER = '595 21 319 0000';
export const SP_PHONE_DISPLAY = '(021) 319 0000';
export const SP_TEL = '+595213190000';

/* HubSpot — canal del lead del simulador. El portal es el real de SP.
   HUBSPOT_FORM_ID queda vacío hasta que exista el formulario de leads en
   HubSpot (Marketing → Formularios, campos: firstname, phone, email,
   message). Con ID cargado, "Enviarme mi cotización" envía el lead al CRM
   (API pública de formularios, funciona desde el sitio estático); vacío o
   con el envío fallado, el lead viaja por WhatsApp prellenado — la vía que
   ya funciona. Nunca un lead que se pierde en silencio. */
export const HUBSPOT_PORTAL_ID = '48242096';
export const HUBSPOT_FORM_ID = '';

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
// Bronze salió de la venta el 24/09/2026; su tarifa queda en bronce.json.
const TARIFAS = {
  silver: { solo: [324000, 420000, 570000, 741000], tc: [228000, 330000, 430000, 684000], adh0_20: 172000, hijo3: 140000, pkg: [770000, 1000000] },
  gold: { solo: [432000, 560000, 680000, 884000], tc: [324000, 440000, 540000, 816000], adh0_20: 238000, hijo3: 180000, pkg: [990000, 1300000] },
};
/* ESSENTIAL — precio POR ZONA (datos/planes-vigentes/essential.json).
   Fuente: PRECIOS ESSENTIAL.pdf (21/08/2026), confirmado por la minuta del
   18/08/2026. Otra estructura que Privilege: sin tramos por edad, titular
   hasta 64, hijos hasta 20, pareja por el mayor de los dos (18-45 / 46-64)
   y grupo familiar de titular + cónyuge + 2 hijos. */
const ESSENTIAL = {
  asuncion_central: { titular: 265000, menor: 110000, pareja: [395000, 475000], grupo: 550000 },
  interior: { titular: 220000, menor: 92000, pareja: [330000, 400000], grupo: 460000 },
  nacional: { titular: 305000, menor: 125000, pareja: [455000, 545000], grupo: 635000 },
};
// El precio de una persona sola por zona, para los textos que lo nombran:
// así ningún número de Essential queda escrito a mano fuera de acá.
export const essentialTitular = (zona) => ESSENTIAL[zona].titular;
export const ZONA_ESSENTIAL = { asuncion_central: 'Asunción y Central', interior: 'Interior', nacional: 'Nacional' };
// La red de la Guía Médica que usa cada zona (lib/red-medica.js, ?plan=…).
export const GUIA_ESSENTIAL = { asuncion_central: 'esencial-ac', interior: 'esencial-interior', nacional: 'esencial-nacional' };
export const RED_ESSENTIAL = { asuncion_central: 'esencial_ac', interior: 'esencial_int', nacional: 'esencial_nac' };

/* La zona sale de la ciudad (decisión de Arturo, 24/09/2026): Asunción y
   Central → su precio; el resto del país → Interior. Nacional es una opción
   que la persona elige ("si querés atenderte en cualquier parte del país").
   Sin ciudad todavía, la zona es null y el precio "desde" es el más bajo. */
export const zonaEssential = (d) => {
  if (d && d.essNacional) return 'nacional';
  const ubi = d && d.ubi;
  if (!ubi || !ubi.deptId) return null;
  return ubi.deptId === 'asuncion' || ubi.deptId === 'central' ? 'asuncion_central' : 'interior';
};

/* Quién no tiene tarifa en Essential: mayores de 64, hijos de más de 20 y un
   tercer adulto (el PDF no tiene adherente adulto). Devuelve el motivo, en el
   idioma de la persona, o null si el grupo entra. */
export const essentialNoAplica = (people) => {
  const adultos = people.filter((p) => p.kind !== 'kid');
  const hijos = people.filter((p) => p.kind === 'kid');
  if (adultos.some((p) => p.age > 64)) return 'Essential es para personas de hasta 64 años.';
  if (hijos.some((p) => p.age > 20)) return 'En Essential los hijos entran hasta los 20 años.';
  if (adultos.length > 2) return 'Essential cubre a una pareja con sus hijos, no a un tercer adulto.';
  return null;
};

/* Precio de un grupo en Essential. El PDF no trae ejemplos de grupos: esta es
   la lectura directa de sus categorías (inferencia anotada en essential.json):
   pareja + cada hijo; grupo familiar desde 2 hijos, + cada hijo desde el 3º;
   titular solo + cada hijo. */
const priceEssential = (zona, people) => {
  const T = ESSENTIAL[zona];
  const adultos = people.filter((p) => p.kind !== 'kid');
  const hijos = people.filter((p) => p.kind === 'kid').length;
  if (adultos.length <= 1) return T.titular + hijos * T.menor;
  if (hijos >= 2) return T.grupo + (hijos - 2) * T.menor;
  const mayor = Math.max(adultos[0].age, adultos[1].age);
  return T.pareja[mayor <= 45 ? 0 : 1] + hijos * T.menor;
};

const VITAL_PRECIO = 283000; // titular 65+, costo con débito automático
const VITAL_PARTICULAR = 312000; // titular 65+, costo particular

/* 10% de descuento pagando con débito automático o tarjeta de crédito
   (confirmado por el usuario, jul 2026). Las primas del tarifario
   Privilege son el precio particular; Vital publica ambas columnas. */
export const AUTO_PAY_DISCOUNT = 0.10;

const bracket = (a) => (a <= 54 ? 0 : a <= 64 ? 1 : a <= 69 ? 2 : 3);

// `nivel` es la clave interna del simulador; `short.toLowerCase()` es la clave
// pública del `?plan=` del comparador. Ambas viven ACÁ (fuente única): el botón y
// el simulador derivan de este mismo array, así el puente no se puede desincronizar.
export const plans = () => [
  // Essential: el "desde" es el precio más bajo de sus tres zonas (Interior).
  { name: 'Plan Essential', short: 'Essential', nivel: 'esencial', price: ESSENTIAL.interior.titular, color: 'var(--sp-plan-essential)', tag: 'Para empezar a cuidarte, al precio de tu zona',
    lines: ['Consultas sin tope en Lister, y hasta 3 por mes en la red', 'Urgencias 24 h, desde el día uno', 'Laboratorio de rutina, radiografías y fisioterapia, sin espera', 'Odontología básica en Lister: consulta, controles, extracciones y limpieza', 'Internación, cirugías y parto, al año de afiliarte'] },
  { name: 'Plan Silver', short: 'Silver', nivel: 'equilibrio', price: TARIFAS.silver.solo[0], color: 'var(--sp-plan-silver)', tag: 'El que suma resonancia',
    lines: ['Consultas con especialistas (hasta 5 al año por especialidad)', 'Tomografía y resonancia al 100%', 'Terapia intensiva hasta 5 días al año', 'Fisioterapia: 15 sesiones al año', 'Medicamentos en internación hasta ₲ 1.000.000'] },
  { name: 'Plan Gold', short: 'Gold', nivel: 'amplia', price: TARIFAS.gold.solo[0], color: 'var(--sp-plan-gold)', tag: 'La cobertura más amplia',
    lines: ['Consultas sin tope anual en casi todas las especialidades', 'Tomografía y resonancia al 100%, con menos espera', 'Internación semi-suite, hasta 25 días al año', 'Terapia intensiva hasta 6 días al año', 'Medicamentos en internación hasta ₲ 1.500.000'] },
];

// El puente comparador → simulador, en un solo lugar. La clave pública del
// `?plan=` es `short.toLowerCase()` (essential/silver/gold); `bronze` y
// `bronce` quedan como alias: un link viejo al plan de entrada abre el que lo
// reemplazó.
export const planKeyToNivel = () => {
  const m = { bronce: 'esencial', bronze: 'esencial' }; // alias heredados
  for (const p of plans()) m[p.short.toLowerCase()] = p.nivel;
  return m;
};

export const ageTxt = (a) => (a >= 85 ? '85+' : String(a));

export const peopleFor = (who) => {
  if (who === 'mi') return [{ role: 'Vos', age: 32, kind: 'adult' }];
  if (who === 'pareja') return [{ role: 'Vos', age: 34, kind: 'adult' }, { role: 'Tu pareja', age: 34, kind: 'adult' }];
  if (who === 'familia') return [{ role: 'Vos', age: 37, kind: 'adult' }, { role: 'Tu pareja', age: 37, kind: 'adult' }, { role: 'Hijo/a 1', age: 9, kind: 'kid' }];
  if (who === 'padres') return [{ role: 'Adulto mayor', age: 68, kind: 'adult' }];
  return [{ role: 'Vos', age: 34, kind: 'adult' }];
};

/* Precio real de un grupo en Silver o Gold, siguiendo las
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
    essential: { name: base[0].name, color: base[0].color, why: 'Cobertura de entrada con el precio de tu zona: consultas sin tope en Lister, urgencias 24 h y estudios del día a día. La internación, las cirugías y el parto se cubren al año de afiliarte.' },
    silver: { name: base[1].name, color: base[1].color, why: 'El equilibrio con respaldo de verdad: suma tomografía y resonancia al 100%, más días de terapia intensiva y topes más altos.' },
    gold: { name: base[2].name, color: base[2].color, why: 'La cobertura más amplia del tarifario vigente: consultas sin tope, más días de internación y los topes más altos.' },
    vital: { name: 'Plan Vital', color: 'var(--sp-navy)', why: 'Pensado para personas de 65 años o más: consultas, urgencias 24 h, ambulancia a domicilio y cobertura que crece con la antigüedad.' },
  };
  let best;
  if (d.who === 'padres') best = 'vital';
  else best = ({ esencial: 'essential', equilibrio: 'silver', amplia: 'gold' })[d.nivel] || 'silver';
  const ppl = d.people && d.people.length ? d.people : [{ age: 35, kind: 'adult' }];
  // Un grupo sin tarifa en Essential pasa a Silver y el resultado dice por qué.
  const noAplica = best === 'essential' ? essentialNoAplica(ppl) : null;
  if (noAplica) best = 'silver';
  const zonaEss = best === 'essential' ? zonaEssential(d) : null;
  const nAdultos = ppl.filter((p) => p.kind !== 'kid').length;
  const personas = best === 'vital'
    ? VITAL_PRECIO * nAdultos
    : best === 'essential'
      ? priceEssential(zonaEss || 'interior', ppl)
      : priceFor(best, ppl);
  /* Silver, Gold y Vital cuestan lo mismo en todo el país; Essential ya trae
     su zona en `personas`. El ajuste por departamento sigue neutro (1). */
  const GL = { central: 'Central', interior: 'Interior', nacional: 'Nacional' };
  const ajuste = ubi && best !== 'essential' ? (DEPT_AJUSTE[ubi.deptId] || 1) : 1;
  const price = Math.round(personas * ajuste);
  /* Privilege publica el precio particular → el pago automático descuenta 10%.
     Vital ya publica el precio con débito → mostramos el particular como referencia. */
  const autoPay = best === 'vital' ? null : Math.round(price * (1 - AUTO_PAY_DISCOUNT));
  const vitalParticular = best === 'vital' ? VITAL_PARTICULAR * nAdultos : null;
  return {
    key: best, name: P[best].name, color: P[best].color, why: P[best].why,
    geoLabel: zonaEss ? ZONA_ESSENTIAL[zonaEss] : ubi ? 'Nacional' : (GL[d.geo] || ''), ubi, price, autoPay, vitalParticular,
    zonaEss, essentialNoAplica: noAplica,
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

// El mismo grupo, en la voz de quien escribe: va dentro del WhatsApp que la
// persona le manda a SP. groupLabel habla de "vos" porque lo lee la persona;
// en su propio mensaje decía "Para: para vos" (revisión del 23/09/2026).
export const grupoPropio = (d) => {
  const ppl = d.people || [];
  const ad = ppl.filter((p) => p.kind !== 'kid').length;
  const ki = ppl.filter((p) => p.kind === 'kid').length;
  if (d.who === 'mi') return 'solo para mí';
  if (d.who === 'pareja') return 'mi pareja y yo';
  if (d.who === 'familia') return ad + ' adultos y ' + ki + ' ' + (ki === 1 ? 'hijo' : 'hijos');
  if (d.who === 'padres') return ad > 1 ? 'dos adultos mayores' : 'un adulto mayor';
  return '';
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
    { k: 'esencial', label: 'Lo esencial, para estar cubierto en lo importante', note: 'Essential: urgencias, consultas y estudios del día a día, al precio de tu zona. Para quien quiere pagar lo justo.' },
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
  geo: 'Con tu ciudad te mostramos la red que te queda cerca. En Essential, además, define el precio: Asunción y Central tienen uno y el interior otro.',
  addons: '',
  contacto: 'Te mostramos tu precio ahora. Te pedimos estos datos para que un asesor lo confirme y te acompañe, sin compromiso.',
});
