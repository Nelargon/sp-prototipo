/* Salud Protegida — shared quote/simulator logic and contact constants.
   Pure functions (no React) used by both the home page and the /simulador route. */

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

export const plans = () => [
  { name: 'SP Esencial', short: 'Esencial', price: 290000, color: '#00BCB4', tag: 'Para empezar a cuidarte',
    lines: ['Ilimitadas en Lister + 4 al mes en el resto de la red', 'Urgencias 24 h cubiertas', 'Estudios básicos + tomografía', 'Internación hasta 25 días', 'Salud mental: 3 sesiones al año'] },
  { name: 'SP Integral', short: 'Integral', price: 540000, color: '#5B7A8C', tag: 'Para tu familia',
    lines: ['Todo lo de Esencial, y además:', 'Tomografía y resonancia cubiertas', 'Odontología incluida', 'Internación en sala privada, 30 días', 'Psicología y psiquiatría (6 al año)'] },
  { name: 'SP Premium', short: 'Premium', price: 920000, color: '#B8860B', tag: 'Alta complejidad incluida',
    lines: ['Consultas sin límite en toda la red', 'Cobertura amplia, incluida alta complejidad', 'Médico y laboratorio a domicilio', 'Suite privada, 45 días', '10 sesiones de psicología al año + nutrición'] },
];

export const ageTxt = (a) => (a >= 85 ? '85+' : String(a));

export const peopleFor = (who) => {
  if (who === 'mi') return [{ role: 'Vos', age: 32, kind: 'adult' }];
  if (who === 'pareja') return [{ role: 'Vos', age: 34, kind: 'adult' }, { role: 'Tu pareja', age: 34, kind: 'adult' }];
  if (who === 'familia') return [{ role: 'Vos', age: 37, kind: 'adult' }, { role: 'Tu pareja', age: 37, kind: 'adult' }, { role: 'Hijo/a 1', age: 9, kind: 'kid' }];
  if (who === 'padres') return [{ role: 'Adulto mayor', age: 68, kind: 'adult' }];
  return [{ role: 'Vos', age: 34, kind: 'adult' }];
};

export const engine = (d) => {
  const base = plans();
  const P = {
    esencial: { name: base[0].name, color: base[0].color, base: base[0].price, why: 'Cobertura básica clara, accesible y sin sorpresas. Para empezar a cuidarte bien, sin pagar de más.' },
    integral: { name: base[1].name, color: base[1].color, base: base[1].price, why: 'Protección familiar clara y completa, para lo de todos los días y para lo inesperado.' },
    premium: { name: base[2].name, color: base[2].color, base: base[2].price, why: 'Más cobertura, mayor red y prioridad de atención en alta complejidad.' },
    senior: { name: 'SP Senior', color: '#003B71', base: 680000, why: 'Cuidado continuo con acceso real, pensado para adultos de 65 años o más.' },
    seniorplus: { name: 'SP Senior Plus', color: '#003B71', base: 980000, why: 'El nivel más completo de SP Senior: cobertura amplia y prioridad, con respaldo total para mayores.' },
  };
  let best;
  if (d.who === 'padres') best = d.nivel === 'amplia' ? 'seniorplus' : 'senior';
  else best = ({ esencial: 'esencial', equilibrio: 'integral', amplia: 'premium' })[d.nivel] || 'integral';
  const AGE_ANCHORS = [[18, 0.95], [25, 1], [35, 1.08], [45, 1.2], [55, 1.4], [65, 1.65], [85, 2]];
  const f = (a) => {
    if (a <= AGE_ANCHORS[0][0]) return AGE_ANCHORS[0][1];
    for (let i = 0; i < AGE_ANCHORS.length - 1; i++) {
      const a0 = AGE_ANCHORS[i][0], f0 = AGE_ANCHORS[i][1], a1 = AGE_ANCHORS[i + 1][0], f1 = AGE_ANCHORS[i + 1][1];
      if (a <= a1) return f0 + (f1 - f0) * ((a - a0) / (a1 - a0));
    }
    return AGE_ANCHORS[AGE_ANCHORS.length - 1][1];
  };
  const baseP = P[best].base;
  const ppl = d.people && d.people.length ? d.people : [{ age: 35, kind: 'adult' }];
  let tPersonas = 0, ai = 0;
  ppl.forEach((p) => {
    if (p.kind === 'kid') tPersonas += baseP * (p.age < 6 ? 0.24 : p.age < 13 ? 0.3 : 0.36);
    else { tPersonas += baseP * f(p.age) * (ai === 0 ? 1 : ai === 1 ? 0.75 : 0.65); ai++; }
  });
  const G = { central: 1, interior: 1.08, nacional: 1.18 };
  const geoMult = G[d.geo] || 1.15;
  const tGeo = tPersonas * geoMult;
  const AP = { emocional: 75000, mujer: 120000, odonto: 90000, viajero: 45000, complejos: 110000, chequeo: 55000 };
  const addonItems = (d.addons || []).map((k) => ({ key: k, price: AP[k] || 0 }));
  const addonsSum = addonItems.reduce((s, a) => s + a.price, 0);
  // Rounded, consistent parts so the breakdown always sums exactly to the total.
  const r10 = (n) => Math.round(n / 10000) * 10000;
  const personas = r10(tPersonas);
  const geoDelta = r10(tGeo - tPersonas);
  const price = personas + geoDelta + addonsSum;
  const GL = { central: 'Central', interior: 'Interior', nacional: 'Nacional' };
  return {
    key: best, name: P[best].name, color: P[best].color, why: P[best].why,
    geoLabel: GL[d.geo] || '', price,
    breakdown: { base: baseP, personas, geoMult, geoDelta, addonsSum, addonItems },
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
    { k: 'padres', label: 'Para mis padres o un adulto mayor', note: 'Es un plan aparte (SP Senior), para personas de 65 años o más.' },
  ],
  nivel: [
    { k: 'esencial', label: 'Lo esencial, para estar cubierto en lo importante', note: 'Consultas, urgencias y estudios básicos. Para quien está sano y quiere pagar lo justo.' },
    { k: 'equilibrio', label: 'Un equilibrio entre precio y cobertura', note: 'Red ampliada, especialistas y estudios sin tanto copago. El que elige la mayoría.' },
    { k: 'amplia', label: 'La cobertura más amplia posible', note: 'Internación amplia, mayor red y prioridad, incluida alta complejidad.' },
  ],
  geo: [
    { k: 'central', label: 'Central', tier: '$', note: 'Asunción y Gran Asunción. La opción más accesible.' },
    { k: 'interior', label: 'Interior', tier: '$$', note: 'Tu ciudad del interior, con respaldo en Central.' },
    { k: 'nacional', label: 'Nacional', tier: '$$$', note: 'Te atendés en cualquier punto del país, donde estés.' },
  ],
  addons: [
    { k: 'emocional', label: 'Bienestar emocional y nutrición', price: 75000, note: 'Psicología, nutrición y manejo del estrés, con acompañamiento real.' },
    { k: 'mujer', label: 'Salud femenina y maternidad', price: 120000, note: 'Controles, estudios y maternidad, con carencias y topes claros desde el inicio.' },
    { k: 'odonto', label: 'Odontología y ortodoncia', price: 90000, note: 'Limpiezas, tratamientos y ortodoncia, para grandes y chicos.' },
    { k: 'viajero', label: 'Cobertura viajero', price: 45000, note: 'Te cubrimos también cuando viajás, dentro y fuera del país.' },
    { k: 'complejos', label: 'Mayor respaldo ante tratamientos complejos', price: 110000, note: 'Más respaldo para internaciones y tratamientos de mayor complejidad.' },
    { k: 'chequeo', label: 'Chequeo preventivo anual', price: 55000, note: 'Una vez al año: laboratorio básico, consulta clínica y orientación en Lister.' },
  ],
});

export const why = () => ({
  who: 'Así armamos un plan a la medida de quienes querés cuidar.',
  edades: 'La edad es lo que más influye en el precio. Con este dato te damos un número real, no un estimado al voleo.',
  nivel: 'No todos necesitan lo mismo. Te mostramos el plan que mejor equilibra lo que te importa y lo que querés pagar.',
  geo: 'Definí hasta dónde te cubrimos. A mayor alcance, mayor precio — pagás por la zona que de verdad usás.',
  addons: 'Sumá solo lo que tiene sentido para vos. Te mostramos el costo exacto antes de contratar.',
  contacto: 'Te mostramos tu precio ahora. Te pedimos estos datos para que un asesor lo confirme y te acompañe, sin compromiso.',
});
