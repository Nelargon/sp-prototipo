'use client';

import { useState, useEffect, useRef, createElement } from 'react';
import { BP } from './basePath';

/* Salud Protegida contact. One number for WhatsApp, urgencias and phone.
   WHATSAPP_NUMBER is used for every wa.me link; SP_TEL for tel: (call) links. */
const WHATSAPP_NUMBER = '595 21 319 0000';
const SP_PHONE_DISPLAY = '(021) 319 0000';
const SP_TEL = '+595213190000';

/* Parse a CSS declaration string ("color:red;font-size:14px") into a React
   style object, so the exact style strings from the design export are preserved
   verbatim (values, units, custom properties) instead of being hand-camelCased. */
function css(str) {
  const o = {};
  if (!str) return o;
  String(str)
    .split(';')
    .forEach((decl) => {
      const i = decl.indexOf(':');
      if (i < 0) return;
      let key = decl.slice(0, i).trim();
      const val = decl.slice(i + 1).trim();
      if (!key) return;
      if (key.startsWith('--')) {
        o[key] = val;
      } else {
        key = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        o[key] = val;
      }
    });
  return o;
}

const INITIAL = {
  q: '',
  sel: 'Resonancia (RM)',
  sliderVal: 100,
  mobileMenuOpen: false,
  showFullTable: false,
  faqOpen: null,
  sim: {
    step: 0, who: null, nivel: null, geo: null, addons: [], people: [],
    nombre: '', tel: '', email: '', sent: false, err: '', priceAnim: null,
  },
};

export default function Page() {
  const [state, setStateRaw] = useState(INITIAL);

  // Class-style shallow-merge setState (mirrors the DCLogic base class).
  const setState = (updater) =>
    setStateRaw((prev) => {
      const partial = typeof updater === 'function' ? updater(prev) : updater;
      return { ...prev, ...partial };
    });

  const patch = (p) => setState((s) => Object.assign({}, s, p));
  const simPatch = (p) => setState((s) => ({ sim: Object.assign({}, s.sim, p) }));

  const rafRef = useRef(null);
  const prevStepRef = useRef(0);

  const [showCalc, setShowCalc] = useState(false);
  const [resumeAvailable, setResumeAvailable] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const [simDir, setSimDir] = useState(1);
  const [testiIndex, setTestiIndex] = useState(0);
  const savedSimRef = useRef(null);
  const livePrevRef = useRef(0);
  const liveRafRef = useRef(null);

  // ===== pure data / helpers =====
  const fmt = (n) =>
    '₲ ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const plans = () => [
    { name: 'SP Esencial', short: 'Esencial', price: 290000, color: '#00BCB4', tag: 'Para empezar a cuidarte',
      lines: ['Ilimitadas en Lister + 4 al mes en el resto de la red', 'Urgencias 24 h cubiertas', 'Estudios básicos + tomografía', 'Internación hasta 25 días', 'Salud mental: 3 sesiones al año'] },
    { name: 'SP Integral', short: 'Integral', price: 540000, color: '#5B7A8C', tag: 'Para tu familia',
      lines: ['Todo lo de Esencial, y además:', 'Tomografía y resonancia cubiertas', 'Odontología incluida', 'Internación en sala privada, 30 días', 'Psicología y psiquiatría (6 al año)'] },
    { name: 'SP Premium', short: 'Premium', price: 920000, color: '#B8860B', tag: 'Alta complejidad incluida',
      lines: ['Consultas sin límite en toda la red', 'Cobertura amplia, incluida alta complejidad', 'Médico y laboratorio a domicilio', 'Suite privada, 45 días', '10 sesiones de psicología al año + nutrición'] },
  ];

  const cart = () => {
    const yes = (d) => ({ s: 'Cubierta', d });
    const no = (d) => ({ s: 'No incluida', d });
    return [
      { name: 'Consulta con especialista', icon: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-1a6 6 0 0 1 12 0v1', cov: [yes('Ilimitadas en Lister + 4 al mes en la red'), yes('Ilimitadas en Lister + 6 al mes en la red'), yes('Sin límite en toda la red')] },
      { name: 'Ecografía', icon: 'M3 12a9 9 0 0 1 18 0M3 12a9 9 0 0 0 18 0', cov: [yes('Hasta 4 al año'), yes('+ Doppler y prenatal'), yes('Hasta 12 al año')] },
      { name: 'Tomografía (TAC)', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5v8', cov: [yes('Hasta 2 al año'), yes('Cubierta'), yes('Cubierta, con orden médica')] },
      { name: 'Resonancia (RM)', icon: 'M4 6h16v12H4zM8 6v12', cov: [no('Disponible en SP Integral'), yes('Al 100%'), yes('Cubierta al 100%, con orden médica')] },
      { name: 'Sesión de psicología', icon: 'M12 3a7 7 0 0 0-4 12.7V19l2-1 2 1 2-1 2 1v-3.3A7 7 0 0 0 12 3Z', cov: [yes('3 sesiones al año'), yes('6 sesiones al año'), yes('10 sesiones al año + nutrición')] },
      { name: 'Internación', icon: 'M3 18v-6h18v6M6 12V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4', cov: [yes('Hasta 25 días'), yes('Privada, 30 días'), yes('Suite, 45 días')] },
      { name: 'Parto o cesárea', icon: 'M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10Z', cov: [yes('Parto y cesárea'), yes('+ curso y pediatra'), yes('Suite + kit para el bebé')] },
      { name: 'Urgencia 24 h', icon: 'M12 2v6m0 8v6M2 12h6m8 0h6', cov: [yes('Remedios hasta ₲ 150 mil'), yes('100% · ₲ 200 mil'), yes('100% · ₲ 300 mil')] },
      { name: 'Odontología', icon: 'M12 5c-3-3-8-1-8 4 0 6 3 10 4 10s1-4 4-4 3 4 4 4 4-4 4-10c0-5-5-7-8-4Z', cov: [yes('Limpieza anual'), yes('Incluida'), yes('Incluida')] },
      { name: 'Medicamentos', icon: 'M10 3 3 10a5 5 0 0 0 7 7l7-7a5 5 0 0 0-7-7ZM7 7l7 7', cov: [no('Con descuento en Integral'), yes('40% de descuento'), yes('60% de descuento')] },
    ];
  };

  const iconEl = (path) =>
    createElement('svg', { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: '#80DDD8', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }, createElement('path', { d: path }));

  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpHex = (h1, h2, t) => {
    const p = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const a = p(h1), b = p(h2);
    const c = a.map((v, i) => Math.round(lerp(v, b[i], t)));
    return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
  };

  const toggleMenu = () => setState((s) => ({ mobileMenuOpen: !s.mobileMenuOpen }));
  const closeMenu = () => patch({ mobileMenuOpen: false });
  const toggleFullTable = () => setState((s) => ({ showFullTable: !s.showFullTable }));
  const toggleFaq = (i) => setState((s) => ({ faqOpen: s.faqOpen === i ? null : i }));

  // ===== Simulador (nativo) =====
  const ageTxt = (a) => (a >= 85 ? '85+' : String(a));
  const peopleFor = (who) => {
    if (who === 'mi') return [{ role: 'Vos', age: 32, kind: 'adult' }];
    if (who === 'pareja') return [{ role: 'Vos', age: 34, kind: 'adult' }, { role: 'Tu pareja', age: 34, kind: 'adult' }];
    if (who === 'familia') return [{ role: 'Vos', age: 37, kind: 'adult' }, { role: 'Tu pareja', age: 37, kind: 'adult' }, { role: 'Hijo/a 1', age: 9, kind: 'kid' }];
    if (who === 'padres') return [{ role: 'Adulto mayor', age: 68, kind: 'adult' }];
    return [{ role: 'Vos', age: 34, kind: 'adult' }];
  };
  const pickWho = (k) => { setSimDir(1); simPatch({ who: k, people: peopleFor(k), step: 2 }); };
  const setPersonAge = (i, val) =>
    setState((s) => ({ sim: Object.assign({}, s.sim, { people: s.sim.people.map((p, idx) => (idx === i ? Object.assign({}, p, { age: +val }) : p)) }) }));
  const addKid = () =>
    setState((s) => {
      const ppl = s.sim.people.slice();
      const kc = ppl.filter((p) => p.kind === 'kid').length;
      if (kc >= 6) return {};
      ppl.push({ role: 'Hijo/a ' + (kc + 1), age: 6, kind: 'kid' });
      return { sim: Object.assign({}, s.sim, { people: ppl }) };
    });
  const removeKid = () =>
    setState((s) => {
      const ppl = s.sim.people.slice();
      if (ppl.filter((p) => p.kind === 'kid').length <= 1) return {};
      for (let i = ppl.length - 1; i >= 0; i--) { if (ppl[i].kind === 'kid') { ppl.splice(i, 1); break; } }
      return { sim: Object.assign({}, s.sim, { people: ppl }) };
    });
  const addAdult = () =>
    setState((s) => {
      const ppl = s.sim.people.slice();
      if (ppl.length >= 2) return {};
      ppl.push({ role: 'Otra persona', age: 70, kind: 'adult' });
      return { sim: Object.assign({}, s.sim, { people: ppl }) };
    });
  const removeAdult = () =>
    setState((s) => {
      const ppl = s.sim.people.slice();
      if (ppl.length <= 1) return {};
      ppl.pop();
      return { sim: Object.assign({}, s.sim, { people: ppl }) };
    });
  const toggleAddon = (k) =>
    setState((s) => {
      const cur = s.sim.addons || [];
      const next = cur.includes(k) ? cur.filter((x) => x !== k) : cur.concat([k]);
      return { sim: Object.assign({}, s.sim, { addons: next }) };
    });
  const simBack = () => { setSimDir(-1); setState((s) => ({ sim: Object.assign({}, s.sim, { step: Math.max(0, s.sim.step - 1) }) })); };
  const simGo = (patch, dir = 1) => { setSimDir(dir); simPatch(patch); };

  const engine = (d) => {
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

  const groupLabel = (d) => {
    const ppl = d.people || [];
    const ad = ppl.filter((p) => p.kind !== 'kid').length;
    const ki = ppl.filter((p) => p.kind === 'kid').length;
    if (d.who === 'mi') return 'para vos';
    if (d.who === 'pareja') return 'para tu pareja y vos';
    if (d.who === 'familia') return 'para ' + ad + ' adultos + ' + ki + ' ' + (ki === 1 ? 'hijo' : 'hijos');
    if (d.who === 'padres') return ad > 1 ? 'para dos adultos mayores' : 'para un adulto mayor';
    return 'según tus respuestas';
  };
  const titularAge = (d) => { const a = (d.people || []).find((p) => p.kind !== 'kid'); return a ? ageTxt(a.age) : '—'; };

  const bumpPersonAge = (i, delta) =>
    setState((s) => ({ sim: Object.assign({}, s.sim, { people: s.sim.people.map((p, idx) => {
      if (idx !== i) return p;
      const lo = p.kind === 'kid' ? 0 : 18, hi = p.kind === 'kid' ? 25 : 85;
      return Object.assign({}, p, { age: Math.max(lo, Math.min(hi, p.age + delta)) });
    }) }) }));

  const resumeSim = () => { if (savedSimRef.current) { setState({ sim: savedSimRef.current }); setResumeAvailable(false); } };

  const quoteText = () => {
    const d = state.sim, r = engine(d), O2 = opts();
    const ad = O2.addons.filter((o) => (d.addons || []).includes(o.k));
    const L = [];
    L.push('SALUD PROTEGIDA — Cotización estimada');
    L.push('');
    L.push('Plan recomendado: ' + r.name);
    L.push('Cobertura: ' + r.geoLabel);
    L.push('Para: ' + groupLabel(d) + ' · titular de ' + titularAge(d));
    L.push('');
    L.push('Cobertura para el grupo: ' + fmt(r.breakdown.personas));
    L.push('Zona ' + r.geoLabel + ': ' + (r.breakdown.geoDelta > 0 ? '+ ' + fmt(r.breakdown.geoDelta) : 'sin recargo'));
    if (ad.length) { L.push('Coberturas adicionales:'); ad.forEach((o) => L.push('  · ' + o.label + ': + ' + fmt(o.price))); }
    L.push('');
    L.push('TOTAL ESTIMADO: ' + fmt(r.price) + ' / mes');
    L.push('');
    L.push('Números de referencia — el precio final lo confirma un asesor de Salud Protegida.');
    return L.join('\n');
  };
  const downloadQuote = () => {
    try {
      const blob = new Blob([quoteText()], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'cotizacion-salud-protegida.txt';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {}
  };
  const shareQuote = async () => {
    const r = engine(state.sim);
    const msg = 'Mi plan en Salud Protegida: ' + r.name + ' — ' + fmt(r.price) + '/mes estimado.';
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'Salud Protegida', text: msg, url });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(msg + ' ' + url);
        setShareMsg('¡Copiado!');
        setTimeout(() => setShareMsg(''), 2200);
      }
    } catch (e) {}
  };

  const simSubmit = () => {
    const d = state.sim;
    const emailOk = !d.email.trim() || /.+@.+\..+/.test(d.email);
    if (!d.nombre.trim() || d.tel.replace(/\D/g, '').length < 8 || !emailOk) {
      simPatch({ err: 'Necesitamos tu nombre y un WhatsApp válido (mín. 8 dígitos). El email es opcional.' });
      return;
    }
    simPatch({ sent: true, err: '' });
  };

  const opts = () => ({
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

  const why = () => ({
    who: 'Así armamos un plan a la medida de quienes querés cuidar.',
    edades: 'La edad es lo que más influye en el precio. Con este dato te damos un número real, no un estimado al voleo.',
    nivel: 'No todos necesitan lo mismo. Te mostramos el plan que mejor equilibra lo que te importa y lo que querés pagar.',
    geo: 'Definí hasta dónde te cubrimos. A mayor alcance, mayor precio — pagás por la zona que de verdad usás.',
    addons: 'Sumá solo lo que tiene sentido para vos. Te mostramos el costo exacto antes de contratar.',
    contacto: 'Te mostramos tu precio ahora. Te pedimos estos datos para que un asesor lo confirme y te acompañe, sin compromiso.',
  });

  const faqs = () => [
    { q: '¿Qué es la carencia y cuánto dura?', a: 'La carencia es el tiempo de espera desde que te afiliás hasta poder usar ciertas coberturas (como estudios de alta complejidad o internaciones programadas). Varía según la prestación — tu asesor te muestra el detalle exacto antes de firmar.' },
    { q: '¿Cubren preexistencias?', a: 'Las preexistencias se evalúan caso por caso al momento de afiliarte. Contanos tu situación y te decimos exactamente qué cobertura aplica, sin sorpresas después.' },
    { q: '¿Cómo doy de baja mi plan?', a: 'Podés dar de baja cuando quieras, escribiéndonos por WhatsApp o a atención al afiliado. Te explicamos el proceso y los plazos antes de confirmar la baja.' },
    { q: '¿Qué es Lister y en qué se diferencia de "la red"?', a: 'Lister es nuestro centro médico propio, con consultas, laboratorio e imagenología. "La red" suma Lister más de 50 prestadores externos en todo el país, según el plan que elijas.' },
    { q: '¿Cómo se calcula el precio de mi plan?', a: 'Depende de cuántas personas cubrís, sus edades, el nivel de cobertura y la zona geográfica. Usá el simulador para ver tu precio estimado en menos de un minuto.' },
    { q: '¿Puedo cambiar de plan más adelante?', a: 'Sí. Si tu familia crece o cambian tus necesidades, podés pedir un cambio de plan cuando quieras — un asesor te muestra las opciones y la diferencia de precio.' },
  ];

  const difsData = () => [
    { icon: 'm23 7-7 5 7 5V7ZM1 5h15v14H1z', title: 'Telemedicina garantizada por contrato', body: 'Consultas por video con un tiempo de respuesta escrito en tu plan — no una promesa suelta.' },
    { icon: 'M3 11l9-8 9 8M5 9.5V20h14V9.5M12 12v5M9.5 14.5h5', title: 'Médico y laboratorio a domicilio', body: 'Atención y estudios en tu casa cuando más lo necesitás, según el plan que elijas.' },
    { icon: 'M20.8 5.6a5 5 0 0 0-8-1.3L12 5l-.8-.7a5 5 0 1 0-7 7.1l7.8 7.6 7.8-7.6a5 5 0 0 0 1-6.4Z', title: 'Salud mental incluida', body: 'Psicología y acompañamiento emocional desde el plan, no como un extra aparte.' },
  ];

  const testimonios = () => [
    { quote: 'Me ayudaron a elegir según lo que mi familia necesitaba, no el plan más caro.', name: 'Nombre Apellido', meta: 'Afiliada · Plan Integral' },
    { quote: 'Cuando llamé de madrugada, me atendió alguien que conocía mi plan. Eso no tiene precio.', name: 'Nombre Apellido', meta: 'Afiliado · Plan Premium' },
    { quote: 'Entendí exactamente qué cubría antes de firmar. Cero sorpresas después.', name: 'Nombre Apellido', meta: 'Afiliada · Plan Esencial' },
    { quote: 'El asesor me explicó todo sin apuro y en mi idioma, no en “letra chica”.', name: 'Nombre Apellido', meta: 'Afiliado · SP Senior' },
  ];

  // Testimonials auto-advance (calm, 6s).
  useEffect(() => {
    const n = testimonios().length;
    const id = setInterval(() => setTestiIndex((i) => (i + 1) % n), 6000);
    return () => clearInterval(id);
  }, []);

  // Count-up for the trust stats when they scroll into view (once).
  useEffect(() => {
    const els = Array.prototype.slice.call(document.querySelectorAll('[data-stat]'));
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fmtN = (n, thousands) => (thousands ? Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : String(Math.round(n)));
    const animateEl = (el) => {
      const target = +el.getAttribute('data-target');
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      const thousands = el.getAttribute('data-thousands') === '1';
      if (reduce) { el.textContent = prefix + fmtN(target, thousands) + suffix; return; }
      const t0 = performance.now(), dur = 1100;
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + fmtN(target * e, thousands) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { animateEl(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ===== price count-up (was componentDidUpdate) =====
  useEffect(() => {
    const step = state.sim.step;
    if (prevStepRef.current < 6 && step >= 6) {
      const target = engine(state.sim).price;
      const t0 = performance.now(), dur = 1150;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const el = document.querySelector('[data-sp-price]');
        if (el) el.textContent = fmt(Math.round(target * eased));
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
        else if (el) el.textContent = fmt(target);
      };
      rafRef.current = requestAnimationFrame(tick);
    }
    prevStepRef.current = step;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.sim.step]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  // Persistent live estimate in the sidebar — count-up whenever the config changes.
  useEffect(() => {
    const dd = state.sim;
    const ready = !!(dd.who && dd.nivel && (dd.people || []).length) && dd.step >= 3 && dd.step < 6;
    if (!ready) { livePrevRef.current = 0; return; }
    const target = engine(Object.assign({}, dd, { geo: dd.geo || 'central' })).price;
    const from = livePrevRef.current || target;
    livePrevRef.current = target;
    if (from === target) { const el = document.querySelector('[data-live-price]'); if (el) el.textContent = fmt(target); return; }
    if (liveRafRef.current) cancelAnimationFrame(liveRafRef.current);
    const t0 = performance.now(), dur = 520;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const el = document.querySelector('[data-live-price]');
      if (el) el.textContent = fmt(Math.round(from + (target - from) * eased));
      if (p < 1) liveRafRef.current = requestAnimationFrame(tick);
    };
    liveRafRef.current = requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.sim]);

  useEffect(() => () => { if (liveRafRef.current) cancelAnimationFrame(liveRafRef.current); }, []);

  // ===== scroll / manifiesto / reveals (was componentDidMount) =====
  useEffect(() => {
    let disposed = false;
    let bar = null;
    let onScroll = null;
    let maniRaf = null;
    let loopRaf = null;
    try {
      const root = document.querySelector('[data-page="viva"]');
      if (!root) return;
      bar = root.querySelector('.sp-prog');
      if (!bar) { bar = document.createElement('div'); bar.className = 'sp-prog'; root.appendChild(bar); }
      const nav = root.querySelector('[data-nav]');
      const cotizarFab = root.querySelector('[data-cotizar-fab]');
      const heroBg = root.querySelector('[data-hero-bg]');
      const heroContent = root.querySelector('[data-hero-content]');
      const mani = root.querySelector('[data-manifesto]');
      const mGlow = mani && mani.querySelector('[data-mani-glow]');
      const mBar = mani && mani.querySelector('[data-mani-bar]');
      let mlines = [];
      let mphotos = [];
      const refreshMani = () => {
        if (!mani) return;
        if (!mlines.length || !mlines[0].isConnected) mlines = Array.prototype.slice.call(mani.querySelectorAll('[data-mline]'));
        if (!mphotos.length || !mphotos[0].isConnected) mphotos = Array.prototype.slice.call(mani.querySelectorAll('.mframe'));
      };
      refreshMani();
      Array.prototype.forEach.call(root.querySelectorAll('div'), (c) => {
        const st = c.getAttribute('style') || '';
        if (/border-radius:\s*(16|20|22)px/i.test(st) && /box-shadow/i.test(st)) c.classList.add('lift');
      });
      const targets = [];
      root.classList.add('rvon');
      root.querySelectorAll('[data-rv]').forEach((n) => { n.classList.add('rv'); targets.push(n); });
      const revealCheck = () => {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        for (let i = targets.length - 1; i >= 0; i--) {
          const r = targets[i].getBoundingClientRect();
          if (r.top < vh * 0.9 && r.bottom > -80) {
            const el = targets[i];
            el.classList.add('in');
            el.style.setProperty('opacity', '1', 'important');
            el.style.setProperty('transform', 'none', 'important');
            targets.splice(i, 1);
          }
        }
      };
      revealCheck();
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => { if (disposed) return; revealCheck(); if (onScroll) onScroll(); });
      }
      let maniTarget = 0, maniP = 0;
      const CHAP_STARTS = [0, 1, 5];
      const renderMani = (p) => {
        const n = mlines.length;
        if (!n) return;
        const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
        const seg = 0.5 + Math.min(1, Math.max(0, p / 0.86)) * (n - 1);
        mlines.forEach((ln, i) => {
          const u = seg - i;
          if (u <= -0.2 || u >= 1.2) { ln.style.visibility = 'hidden'; ln.style.opacity = '0'; return; }
          ln.style.visibility = 'visible';
          const op = ss(-0.12, 0.3, u) * (1 - ss(0.7, 1.12, u));
          ln.style.opacity = op.toFixed(3);
          ln.style.transform = 'translateY(calc(-50% + ' + ((0.5 - u) * 64).toFixed(1) + 'px))';
        });
        mphotos.forEach((ph, k) => {
          const start = CHAP_STARTS[k];
          const end = (k + 1 < CHAP_STARTS.length ? CHAP_STARTS[k + 1] : n) - 1;
          const bk = start + 0.5;
          const op = k === 0 ? 1 : ss(bk - 0.8, bk + 0.1, seg);
          ph.style.opacity = op.toFixed(3);
          ph.style.visibility = op <= 0.001 ? 'hidden' : 'visible';
          const w0 = k === 0 ? 0.5 : bk - 0.8;
          const qv = Math.min(1, Math.max(0, (seg - w0) / ((end + 1) - w0)));
          ph.firstElementChild.style.transform = 'translate3d(0,' + (-qv * 14).toFixed(1) + 'px,0) scale(' + (1.03 + qv * 0.07).toFixed(4) + ')';
        });
        if (mBar) mBar.style.width = (p * 100) + '%';
        if (mGlow) mGlow.style.opacity = String(0.5 + 0.5 * Math.sin(p * Math.PI));
      };
      const maniTick = () => {
        if (disposed) return;
        maniP += (maniTarget - maniP) * 0.065;
        if (Math.abs(maniTarget - maniP) < 0.0005) maniP = maniTarget;
        renderMani(maniP);
        maniRaf = maniP === maniTarget ? null : requestAnimationFrame(maniTick);
      };
      onScroll = () => {
        const y = (document.scrollingElement || document.documentElement).scrollTop || 0;
        const el = document.scrollingElement || document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
        if (nav) { if (y > 70) nav.classList.add('solid'); else nav.classList.remove('solid'); }
        if (cotizarFab) { if (y > 640) cotizarFab.classList.add('show'); else cotizarFab.classList.remove('show'); }
        if (heroBg && y < 900) heroBg.style.transform = 'translateY(' + (y * 0.16) + 'px)';
        if (heroContent && y < 900) { heroContent.style.transform = 'translateY(' + (y * 0.14) + 'px)'; heroContent.style.opacity = String(Math.max(0, 1 - y / 620)); }
        if (mani) {
          refreshMani();
          if (mlines.length) {
            const total = mani.offsetHeight - window.innerHeight;
            maniTarget = Math.min(1, Math.max(0, (-mani.getBoundingClientRect().top) / (total || 1)));
            if (maniRaf === null) maniRaf = requestAnimationFrame(maniTick);
          }
        }
        revealCheck();
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      window.addEventListener('load', onScroll);
      const t0 = performance.now();
      const loop = () => { if (disposed) return; onScroll(); if (targets.length && performance.now() - t0 < 3200) loopRaf = requestAnimationFrame(loop); };
      loopRaf = requestAnimationFrame(loop);
      let maniInitTries = 0;
      const maniInit = () => {
        if (disposed) return;
        refreshMani();
        if (mlines.length) { renderMani(maniP); onScroll(); }
        else if (++maniInitTries < 50) setTimeout(maniInit, 100);
      };
      maniInit();
    } catch (e) { /* no-op */ }

    return () => {
      disposed = true;
      if (onScroll) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        window.removeEventListener('load', onScroll);
      }
      if (maniRaf) cancelAnimationFrame(maniRaf);
      if (loopRaf) cancelAnimationFrame(loopRaf);
      if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
    };
  }, []);

  useEffect(() => { try { document.documentElement.lang = 'es'; } catch (e) {} }, []);

  // Load a saved in-progress simulation once (offer to resume, don't auto-apply).
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sp-sim-v1');
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.step > 0 && saved.step < 6 && !saved.sent) {
          savedSimRef.current = saved;
          setResumeAvailable(true);
        }
      }
    } catch (e) {}
  }, []);

  // Persist the simulation while it's in progress; clear it once sent or reset.
  useEffect(() => {
    try {
      const d = state.sim;
      if (d.step > 0 && d.step < 6 && !d.sent) localStorage.setItem('sp-sim-v1', JSON.stringify(d));
      else if (d.step === 0 || d.sent) localStorage.removeItem('sp-sim-v1');
    } catch (e) {}
  }, [state.sim]);

  // ===== derived render values (was renderVals) =====
  const plansArr = plans();
  const cartArr = cart();
  const waDigits = (WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const waHref = waDigits ? ('https://wa.me/' + waDigits + '?text=' + encodeURIComponent('Hola! Quiero información sobre los planes de Salud Protegida.')) : '#';

  // cartilla
  const qNorm = (state.q || '').trim().toLowerCase();
  const matches = qNorm ? cartArr.filter((c) => c.name.toLowerCase().includes(qNorm)).slice(0, 5).map((c) => ({ name: c.name, onPick: () => setState({ sel: c.name, q: '' }) })) : [];
  const quick = ['Resonancia (RM)', 'Parto o cesárea', 'Sesión de psicología', 'Internación', 'Tomografía (TAC)', 'Odontología'];
  const chips = quick.map((nm) => ({
    name: nm, onPick: () => setState({ sel: nm, q: '' }),
    style: 'padding:9px 15px;border-radius:999px;border:1.5px solid ' + (state.sel === nm ? '#00BCB4' : '#d9e4e2') + ';background:' + (state.sel === nm ? '#00BCB4' : '#fff') + ';color:' + (state.sel === nm ? '#fff' : '#3D3D3D') + ';font-size:13px;font-weight:' + (state.sel === nm ? '700' : '500') + ';cursor:pointer;transition:all .15s',
  }));
  const sel = cartArr.find((c) => c.name === state.sel) || cartArr[0];
  const selRows = sel.cov.map((cv, i) => {
    const ok = cv.s !== 'No incluida';
    return {
      plan: plansArr[i].name, color: plansArr[i].color, status: cv.s, detail: cv.d,
      wrap: 'padding:18px 20px;border-left:' + (i === 0 ? '0' : '1px solid #F0F0F0'),
      badge: 'display:inline-flex;align-items:center;font-size:13px;font-weight:700;padding:4px 11px;border-radius:999px;' + (ok ? 'background:#E6F7F6;color:#009690' : 'background:#F3F4F6;color:#9aa0a6'),
    };
  });

  // slider
  const tSlide = (state.sliderVal || 0) / 100;
  const idx = Math.max(0, Math.min(2, Math.round(tSlide)));
  const p = plansArr[idx];
  const segS = tSlide >= 1 ? 1 : 0, fracS = tSlide - segS;
  const color = lerpHex(plansArr[segS].color, (plansArr[segS + 1] || plansArr[segS]).color, fracS);
  const stops = plansArr.map((pl, i) => ({
    label: pl.short, onPick: () => setState({ sliderVal: i * 100 }),
    style: 'background:none;border:none;cursor:pointer;font-size:13px;font-weight:' + (idx === i ? '800' : '500') + ';color:' + (idx === i ? '#003B71' : '#9aa0a6') + ';padding:2px 4px;transition:color .2s',
  }));

  // full comparison table
  const planHeaders = plansArr.map((pl) => pl.short);
  const fullRows = cartArr.map((item) => ({
    name: item.name,
    cols: item.cov.map((c) => ({ status: c.s, badge: 'display:inline-flex;font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:999px;' + (c.s !== 'No incluida' ? 'background:#E6F7F6;color:#009690' : 'background:#F3F4F6;color:#9aa0a6') })),
  }));

  // faq
  const faqList = faqs().map((f, i) => ({
    q: f.q, a: f.a, open: state.faqOpen === i,
    chevStyle: 'transition:transform .2s cubic-bezier(.22,1,.36,1);transform:rotate(' + (state.faqOpen === i ? '180deg' : '0deg') + ')',
    toggle: () => toggleFaq(i),
  }));

  // how it works
  const stepsHow = [
    { n: '1', title: 'Simulá tu plan', body: 'Un minuto, con el precio incluido antes de dejar cualquier dato.' },
    { n: '2', title: 'Un asesor te contacta', body: 'Por WhatsApp o el medio que prefieras, sin apuro ni compromiso.' },
    { n: '3', title: 'Elegís y firmás', body: 'Online o presencial, con todas tus dudas resueltas antes de firmar.' },
    { n: '4', title: 'Activás tu credencial', body: 'Empezás a usar Lister y el resto de la red desde el día uno.' },
  ];

  // simulador — "configurador": ¿Para quién? → Cobertura → Zona → Edades → Adicionales → resultado
  const d = state.sim, O = opts(), WHY = why();
  const r = d.step >= 6 ? engine(d) : null;
  const isPadres = d.who === 'padres';

  const planShortOf = (who, nivel) => {
    if (!nivel) return '';
    if (who === 'padres') return nivel === 'amplia' ? 'Senior Plus' : 'Senior';
    return { esencial: 'Esencial', equilibrio: 'Integral', amplia: 'Premium' }[nivel] || '';
  };

  // Current configuration → plan colour + live estimate (geo defaults to central until chosen).
  const curReady = !!(d.who && d.nivel && (d.people || []).length);
  const cur = curReady ? engine(Object.assign({}, d, { geo: d.geo || 'central' })) : null;
  const planColor = cur ? cur.color : '#003B71';
  const liveTotalNum = cur ? cur.price : 0;
  const livePanelReady = curReady && d.step >= 3 && d.step < 6;

  const checkNames = ['¿Para quién?', 'Cobertura', 'Zona', 'Las edades', 'Adicionales'];
  const stepValueList = [
    ({ mi: 'Vos', pareja: 'Pareja', familia: 'Familia', padres: 'Adulto mayor' })[d.who] || '',
    planShortOf(d.who, d.nivel),
    ({ central: 'Central', interior: 'Interior', nacional: 'Nacional' })[d.geo] || '',
    (d.people || []).length ? titularAge(d) + ' años' : '',
    (d.addons || []).length ? ((d.addons || []).length + ((d.addons || []).length === 1 ? ' extra' : ' extras')) : (d.step > 5 ? 'Sin extras' : ''),
  ];
  const stepsList = checkNames.map((n, i) => {
    const stepOf = i + 1, done = d.step > stepOf || d.step >= 6, active = d.step === stepOf;
    return {
      name: n, num: String(i + 1), isDone: done, showNum: !done, value: done ? stepValueList[i] : '',
      dot: 'flex:none;width:25px;height:25px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;transition:all 220ms cubic-bezier(0.22,1,0.36,1);' + (done ? 'background:#00BCB4;color:#fff;' : active ? 'background:#fff;color:#003B71;box-shadow:inset 0 0 0 2px #00BCB4;' : 'background:rgba(255,255,255,0.12);color:#7fa6cc;'),
      label: 'font-size:13.5px;transition:color 220ms;' + (done || active ? 'color:#fff;font-weight:' + (active ? '700' : '500') + ';' : 'color:rgba(179,199,219,0.6);font-weight:500;'),
    };
  });
  const peopleVals = (d.people || []).map((pp, i) => ({ role: pp.role, age: pp.age, ageTxt: ageTxt(pp.age), min: pp.kind === 'kid' ? 0 : 18, max: pp.kind === 'kid' ? 25 : 85, setAge: (e) => setPersonAge(i, e.target.value), inc: () => bumpPersonAge(i, 1), dec: () => bumpPersonAge(i, -1) }));

  // For 65+ the two "cobertura" choices are really SP Senior vs SP Senior Plus.
  const nivelData = isPadres
    ? [
        { k: 'equilibrio', label: 'SP Senior', note: 'Cuidado continuo para adultos de 65+, con acceso real y acompañamiento cercano.' },
        { k: 'amplia', label: 'SP Senior Plus', note: 'El nivel más completo: cobertura amplia y prioridad, con respaldo total.' },
      ]
    : O.nivel;

  // Live estimate for the add-ons step (geo is set by then).
  const liveBaseNum = curReady ? engine(Object.assign({}, d, { addons: [], geo: d.geo || 'central' })).price : 0;
  const liveAddonsAmount = liveTotalNum - liveBaseNum;
  // Geo base (for the per-zone price impact on the Zona step).
  const geoBaseNum = curReady ? engine(Object.assign({}, d, { geo: 'central' })).price : 0;

  // Result breakdown, built from the engine's rounded parts so it sums to the total.
  const resBreakdown = r ? (() => {
    const items = [{ label: 'Cobertura para ' + groupLabel(d), amount: fmt(r.breakdown.personas) }];
    items.push({ label: 'Zona ' + r.geoLabel, amount: r.breakdown.geoDelta > 0 ? '+ ' + fmt(r.breakdown.geoDelta) : 'Sin recargo' });
    O.addons.filter((o) => (d.addons || []).includes(o.k)).forEach((o) => items.push({ label: o.label, amount: '+ ' + fmt(o.price) }));
    return items;
  })() : [];

  const stepEnc = { 1: 'Empecemos por lo básico.', 2: 'Esto define tu precio base.', 3: 'Elegí hasta dónde te cubrimos.', 4: 'Ahora afinamos según las edades.', 5: 'Último paso antes de tu precio.' }[d.step] || '';
  const simAnim = 'animation:' + (simDir > 0 ? 'spSlideR' : 'spSlideL') + ' 0.34s cubic-bezier(0.22,1,0.36,1)';

  const sim = {
    isIntro: d.step === 0, isWho: d.step === 1, isNivel: d.step === 2, isGeo: d.step === 3, isEdades: d.step === 4, isAddons: d.step === 5, isResult: d.step >= 6,
    stepAnim: simAnim,
    stepsList,
    planColor, livePanelReady, liveTotalNum, liveTotalFmt: fmt(liveTotalNum),
    planShort: planShortOf(d.who, d.nivel),
    gaugeShow: !!d.nivel && !isPadres, gaugeLevel: ({ esencial: 1, equilibrio: 2, amplia: 3 })[d.nivel] || 0,
    progressBarColor: livePanelReady ? planColor : '#00BCB4',
    whyWho: WHY.who, whyEdades: WHY.edades, whyNivel: isPadres ? 'SP Senior tiene dos niveles. Elegí según cuánta cobertura y prioridad buscás para ellos.' : WHY.nivel, whyGeo: WHY.geo, whyAddons: WHY.addons, whyContacto: WHY.contacto,
    nivelEyebrow: isPadres ? 'Nivel Senior' : 'Cobertura',
    nivelTitle: isPadres ? '¿Qué nivel para el adulto mayor?' : '¿Qué nivel de cobertura buscás?',
    whoOpts: O.who.map((o) => ({ label: o.label, note: o.note, hasNote: !!o.note, onClick: () => pickWho(o.k) })),
    nivelOpts: nivelData.map((o) => ({ label: o.label, note: o.note, hasNote: !!o.note, from: 'desde ' + fmt(engine(Object.assign({}, d, { nivel: o.k, geo: d.geo || 'central' })).price), onClick: () => simGo({ nivel: o.k, step: 3 }) })),
    geoOpts: O.geo.map((o) => { const delta = geoBaseNum ? engine(Object.assign({}, d, { geo: o.k })).price - geoBaseNum : 0; return { label: o.label, note: o.note, tier: o.tier, impact: delta <= 0 ? 'Incluida' : '+ ' + fmt(delta), onClick: () => simGo({ geo: o.k, step: 4 }) }; }),
    addonsList: O.addons.map((o) => ({ key: o.k, label: o.label, note: o.note, priceLabel: '+ ' + fmt(o.price) + ' /mes', selected: (d.addons || []).includes(o.k), boxStyle: 'width:22px;height:22px;border-radius:6px;flex:none;display:flex;align-items:center;justify-content:center;transition:all 150ms;' + ((d.addons || []).includes(o.k) ? 'background:#00BCB4;border:1.5px solid #00BCB4;' : 'background:#fff;border:1.5px solid #cdd5d3;'), rowStyle: 'display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;padding:14px 16px;border-radius:12px;cursor:pointer;transition:all 150ms cubic-bezier(0.22,1,0.36,1);' + ((d.addons || []).includes(o.k) ? 'border:1.5px solid #00BCB4;background:#F2FBFA;' : 'border:1.5px solid #E8E8E8;background:#fff;'), toggle: () => toggleAddon(o.k) })),
    liveReady: livePanelReady, liveTotal: fmt(liveTotalNum), liveAddonsAmount, liveAddons: fmt(liveAddonsAmount),
    continueLabel: (d.addons || []).length === 0 ? 'Continuar sin coberturas adicionales' : 'Ver mi cotización',
    toResult: () => simGo({ step: 6 }),
    people: peopleVals, isFamilia: d.who === 'familia', isPadres,
    kidCount: (d.people || []).filter((pp) => pp.kind === 'kid').length,
    adultCount: (d.people || []).filter((pp) => pp.kind !== 'kid').length,
    addKid, removeKid, addAdult, removeAdult,
    toAddons: () => simGo({ step: 5 }),
    back: simBack, start: () => simGo({ step: 1 }),
    restart: () => { setSimDir(-1); simPatch({ step: 0, who: null, nivel: null, geo: null, addons: [], people: [], sent: false, err: '', nombre: '', tel: '', email: '' }); },
    resName: r ? r.name : '', resWhy: r ? r.why : '', resPrice: r ? fmt(r.price) : '', resGroup: r ? groupLabel(d) : '', titularAge: r ? titularAge(d) : '', resGeo: r ? r.geoLabel : '',
    resAddonsText: r ? O.addons.filter((o) => (d.addons || []).includes(o.k)).map((o) => o.label).join(' · ') : '', hasAddons: r ? (d.addons || []).length > 0 : false,
    resBreakdown, resTotal: r ? fmt(r.price) : '',
    verDetalle: () => { const idx = { esencial: 0, integral: 1, premium: 2 }[r ? r.key : '']; if (idx != null) setState({ sliderVal: idx * 100 }); },
    download: downloadQuote, share: shareQuote, shareMsg,
    resumeAvailable, resume: resumeSim,
    enc: stepEnc, stepNum: Math.min(5, Math.max(1, d.step)), totalSteps: 5, progressPct: d.step >= 6 ? 100 : (d.step / 5) * 100, isQuestion: d.step >= 1 && d.step <= 5,
    headerStyle: 'padding:16px 20px;color:#fff;background:' + (r ? r.color : '#003B71'),
    formOpen: !d.sent, sentOpen: d.sent,
    nombre: d.nombre, tel: d.tel, email: d.email, err: d.err, hasErr: !!d.err,
    setNombre: (e) => simPatch({ nombre: e.target.value }), setTel: (e) => simPatch({ tel: e.target.value }), setEmail: (e) => simPatch({ email: e.target.value }),
    submit: simSubmit,
  };

  const v = {
    waHref,
    mobileMenuOpen: state.mobileMenuOpen, mobileMenuClosed: !state.mobileMenuOpen,
    toggleMenu, closeMenu,
    q: state.q, onQ: (e) => setState({ q: e.target.value }),
    matches, hasMatches: matches.length > 0, chips,
    selKey: sel.name, selName: sel.name, selIcon: iconEl(sel.icon), selRows,
    sliderVal: state.sliderVal, onSlide: (e) => setState({ sliderVal: +e.target.value }),
    planName: p.name, planTag: p.tag, planPrice: fmt(p.price), planLines: p.lines, stops,
    sliderHeadStyle: 'padding:30px 30px 26px;color:#fff;transition:background .25s;background:' + color,
    sliderTrackStyle: 'width:100%;background:linear-gradient(90deg,' + color + ' ' + (tSlide / 2 * 100) + '%,#E3E6E5 ' + (tSlide / 2 * 100) + '%);--c:' + color,
    showFullTable: state.showFullTable, toggleFullTable,
    fullTableLabel: state.showFullTable ? 'Ocultar tabla completa' : '¿Querés el detalle fila por fila? Ver tabla completa',
    chevStyle: 'transition:transform .2s cubic-bezier(.22,1,.36,1);transform:rotate(' + (state.showFullTable ? '180deg' : '0deg') + ')',
    planHeaders, fullRows, stepsHow, faqList, sim,
    showCalc, toggleCalc: () => setShowCalc((x) => !x),
    difs: difsData(),
    aliados: ['Farmacia Catedral', 'Farmatotal', 'Fisio Spa', 'Barberos López', 'Charpentier', 'Acuadante', 'Billio', 'Farmacia San José', 'Punto Farma', 'Promedik', 'Phönix Med', 'Óptica Meister', 'Upalala', 'Assist Card'],
    testi: (() => {
      const list = testimonios();
      const idx = ((testiIndex % list.length) + list.length) % list.length;
      return {
        index: idx, current: list[idx],
        prev: () => setTestiIndex((i) => (i - 1 + list.length) % list.length),
        next: () => setTestiIndex((i) => (i + 1) % list.length),
        dots: list.map((_, i) => ({ active: i === idx, onClick: () => setTestiIndex(i) })),
      };
    })(),
  };

  // ===== markup =====
  return (
    <div data-page="viva" className="body" style={css('color:#3D3D3D;background:#fff')}>

      {/* NAV */}
      <nav data-nav style={css('position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 40px')}>
        <div className="nav-logo" style={css('position:relative;display:flex;align-items:center')}>
          <img src={`${BP}/assets/logo-sp-white-crop.png`} alt="Salud Protegida" className="nlogo-w" style={css('height:36px;display:block;transition:opacity .3s')} />
          <img src={`${BP}/assets/isologo-04-crop.png`} alt="" className="nlogo-c" style={css('height:36px;position:absolute;left:0;top:0;transition:opacity .3s')} />
        </div>
        <div style={css('display:flex;align-items:center;gap:16px')}>
          <a href={'tel:' + SP_TEL} aria-label={'Urgencias 24 h ' + SP_PHONE_DISPLAY} className="urg-pill" style={css('display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 15px;border-radius:12px;background:#E11900;color:#fff;font-size:13px;font-weight:800;white-space:nowrap;box-shadow:0 4px 14px rgba(225,25,0,0.28);flex:none')}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3a5.5 5.5 0 0 1 5.5 5.5M15 7a2.5 2.5 0 0 1 2.5 2.5" /><path d="M21 16.9v2.6a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 3.7 3h2.6a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.5 10.5a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" /></svg><span className="urg-word">Urgencias</span><span className="num-tnum">{SP_PHONE_DISPLAY}</span></a>
          <div className="nav-links-desktop" style={css('display:flex;align-items:center;gap:26px')}>
            <a href="#cartilla" className="nav-link" style={css('color:var(--nl,rgba(255,255,255,0.9));font-size:14px;font-weight:500;transition:color .3s')}>Cartilla viva</a>
            <a href="#comparar" className="nav-link" style={css('color:var(--nl,rgba(255,255,255,0.9));font-size:14px;font-weight:500;transition:color .3s')}>Planes</a>
            <a href="#faq" className="nav-link" style={css('color:var(--nl,rgba(255,255,255,0.9));font-size:14px;font-weight:500;transition:color .3s')}>Preguntas</a>
            <a href="#simulador" className="nav-sim-cta" style={css('height:40px;padding:0 18px;border-radius:12px;font-size:14px;font-weight:700;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;transition:background 200ms,border-color 200ms')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" /></svg>Simulador de planes</a>
            <a href="#simulador" className="btn-teal" style={css('height:40px;padding:0 20px;border-radius:12px;background:#00BCB4;color:#fff;font-size:14px;font-weight:700;display:inline-flex;align-items:center;white-space:nowrap')}>Cotizá tu plan</a>
          </div>
          <button className="nav-burger" onClick={v.toggleMenu} aria-expanded={v.mobileMenuOpen} aria-controls="mobile-menu" aria-label="Abrir menú" style={css('display:none;width:40px;height:40px;border-radius:10px;border:none;background:rgba(255,255,255,0.16);color:#fff;align-items:center;justify-content:center;cursor:pointer;flex:none')}>
            {v.mobileMenuClosed && <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>}
            {v.mobileMenuOpen && <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18" /></svg>}
          </button>
        </div>
      </nav>
      {v.mobileMenuOpen && (
        <div id="mobile-menu" role="menu" style={css('position:fixed;top:66px;left:14px;right:14px;z-index:99;background:#fff;border-radius:16px;box-shadow:0 20px 48px rgba(0,59,113,0.18);padding:10px;display:flex;flex-direction:column;gap:2px')}>
          <a href={'tel:' + SP_TEL} onClick={v.closeMenu} style={css('padding:13px 16px;border-radius:10px;background:#E11900;color:#fff;font-size:15px;font-weight:800;display:flex;align-items:center;gap:9px;margin-bottom:4px')}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16.9v2.6a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 3.7 3h2.6a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.5 10.5a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" /></svg>Urgencias · {SP_PHONE_DISPLAY}</a>
          <a href="#cartilla" onClick={v.closeMenu} style={css('padding:14px 16px;border-radius:10px;color:#003B71;font-size:15px;font-weight:600')}>Cartilla viva</a>
          <a href="#comparar" onClick={v.closeMenu} style={css('padding:14px 16px;border-radius:10px;color:#003B71;font-size:15px;font-weight:600')}>Planes</a>
          <a href="#faq" onClick={v.closeMenu} style={css('padding:14px 16px;border-radius:10px;color:#003B71;font-size:15px;font-weight:600')}>Preguntas frecuentes</a>
          <a href="#simulador" onClick={v.closeMenu} style={css('margin-top:6px;padding:14px 16px;border-radius:10px;border:1.5px solid #00BCB4;color:#009690;font-size:15px;font-weight:700;text-align:center;display:flex;align-items:center;justify-content:center;gap:8px')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" /></svg>Simulador de planes</a>
          <a href="#simulador" onClick={v.closeMenu} style={css('padding:14px 16px;border-radius:10px;background:#00BCB4;color:#fff;font-size:15px;font-weight:700;text-align:center')}>Cotizá tu plan</a>
        </div>
      )}

      {/* HERO */}
      <section data-hero style={css('position:relative;height:100vh;min-height:640px;overflow:hidden;background:#002A52;display:flex;align-items:center')}>
        <div data-hero-bg style={css("position:absolute;top:-5%;right:0;bottom:-5%;width:56%;background:url('" + BP + "/assets/hero.webp') center 25%/cover no-repeat;-webkit-mask:linear-gradient(90deg,transparent 0%,#000 34%);mask:linear-gradient(90deg,transparent 0%,#000 34%);will-change:transform")}></div>
        <div style={css('position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,25,48,0.5) 0%,rgba(0,25,48,0.3) 45%,rgba(0,25,48,0) 72%,rgba(0,25,48,0.15) 100%)')}></div>
        <div style={css('position:absolute;left:0;right:0;bottom:0;height:22%;background:linear-gradient(180deg,rgba(0,25,48,0) 0%,rgba(0,25,48,0.55) 100%)')}></div>
        <div data-hero-content style={css('position:relative;z-index:2;max-width:1200px;margin:0 auto;width:100%;padding:0 40px;color:#fff')}>
          <div style={css('max-width:720px')}>
            <div style={css('display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#80DDD8;margin-bottom:22px;border:1px solid rgba(128,221,216,.4);padding:7px 14px;border-radius:999px')}>+23 años cuidando familias paraguayas</div>
            <h1 className="disp disp-hero" style={css('font-size:76px;line-height:1.02;letter-spacing:-0.025em;margin:0 0 22px')}>Protección que<br /><span style={css('color:#00BCB4')}>se siente</span>.</h1>
            <p style={css('font-size:20px;line-height:1.6;color:#cfe0f0;max-width:520px;margin:0 0 34px')}>Entendé exactamente qué cubre tu plan, cómo usarlo y cuánto sale — antes de firmar, sin sorpresas de último momento.</p>
            <div style={css('display:flex;gap:14px;flex-wrap:wrap')}>
              <a href="#simulador" className="btn-teal" style={css('height:54px;padding:0 30px;border-radius:14px;background:#00BCB4;color:#fff;font-size:16px;font-weight:700;display:inline-flex;align-items:center;gap:9px')}>Calcular mi plan <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
              <a href="#manifiesto" className="btn-ghost-light" style={css('height:54px;padding:0 28px;border-radius:14px;background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.5);color:#fff;font-size:16px;font-weight:600;display:inline-flex;align-items:center')}>Conocé la historia</a>
            </div>
          </div>
        </div>
        <div style={css('position:absolute;left:50%;bottom:26px;transform:translateX(-50%);color:rgba(255,255,255,0.7);display:flex;flex-direction:column;align-items:center;gap:6px')}>
          <span style={css('font-size:11px;letter-spacing:.1em;text-transform:uppercase')}>Bajá</span>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={css('animation:cue 1.8s ease-in-out infinite')}><path d="M12 5v14M6 13l6 6 6-6" /></svg>
        </div>
      </section>

      {/* MANIFIESTO — scrollytelling */}
      <section id="manifiesto" data-manifesto style={css('position:relative;height:720vh;background:#002A52')}>
        <div data-mani-inner style={css('position:sticky;top:0;height:100vh;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#002A52')}>
          <div style={css('position:absolute;inset:0;pointer-events:none;background:radial-gradient(85% 65% at 50% 50%,transparent 40%,rgba(0,16,32,.45) 100%)')}></div>
          <div data-mani-glow style={css('position:absolute;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle,rgba(0,188,180,0.16) 0%,rgba(0,188,180,0) 62%);pointer-events:none')}></div>
          <div className="mani-media" style={css('position:absolute;inset:0;overflow:hidden;z-index:0')}>
            <figure className="mframe" style={css('margin:0')}><img src={`${BP}/assets/manifiesto/frase-1.webp`} alt="" /></figure>
            <figure className="mframe" style={css('margin:0')}><img src={`${BP}/assets/manifiesto/frase-4.webp`} alt="" loading="lazy" decoding="async" /></figure>
            <figure className="mframe" style={css('margin:0')}><img src={`${BP}/assets/manifiesto/frase-7.webp`} alt="" loading="lazy" decoding="async" /></figure>
          </div>
          <div style={css('position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,rgba(0,22,44,0.6) 0%,rgba(0,22,44,0.52) 55%,rgba(0,22,44,0.75) 100%),radial-gradient(90% 70% at 50% 50%,transparent 42%,rgba(0,14,28,0.4) 100%)')}></div>
          <div className="mani-grid" style={css('position:relative;z-index:2;width:100%;height:100%;max-width:1060px;margin:0 auto;padding:0 48px;display:flex;align-items:center;justify-content:center')}>
            <div className="mani-lines" style={css('position:relative;height:60vh;width:100%;text-align:center')}>
              <div data-mline className="disp mani-line" style={css('position:absolute;left:0;right:0;top:50%;font-size:clamp(26px,3.1vw,42px);line-height:1.14;letter-spacing:-0.01em;color:#fff')}>En Paraguay, miles de familias creen que están protegidas.</div>
              <div data-mline className="disp mani-line" style={css('position:absolute;left:0;right:0;top:50%;font-size:clamp(26px,3.1vw,42px);line-height:1.14;letter-spacing:-0.01em;color:#fff')}>La mayoría lo descubre recién cuando algo sale mal.</div>
              <div data-mline className="disp mani-line" style={css('position:absolute;left:0;right:0;top:50%;font-size:clamp(28px,3.4vw,46px);line-height:1.12;letter-spacing:-0.02em;color:#fff')}>Nosotros creemos que la protección real se construye <span style={css('color:#00BCB4')}>antes</span>.</div>
              <div data-mline className="disp mani-line" style={css('position:absolute;left:0;right:0;top:50%;font-size:clamp(26px,3.1vw,42px);line-height:1.14;letter-spacing:-0.02em;color:#fff')}>Antes de la llamada de madrugada.</div>
              <div data-mline className="disp mani-line" style={css('position:absolute;left:0;right:0;top:50%;font-size:clamp(26px,3.1vw,42px);line-height:1.14;letter-spacing:-0.02em;color:#fff')}>Antes del diagnóstico difícil.</div>
              <div data-mline className="disp mani-line" style={css('position:absolute;left:0;right:0;top:50%;font-size:clamp(26px,3.1vw,42px);line-height:1.14;letter-spacing:-0.02em;color:#fff')}>Antes de la eterna pregunta:<br /><span style={css('color:#80DDD8')}>«¿esto lo cubre?»</span></div>
              <div data-mline className="disp mani-line" style={css('position:absolute;left:0;right:0;top:50%;font-size:clamp(30px,3.7vw,50px);line-height:1.08;letter-spacing:-0.02em;color:#fff')}>Salud Protegida es<br />protección que <span style={css('color:#00BCB4')}>se siente</span>.</div>
            </div>
          </div>
          <div style={css('position:absolute;bottom:34px;left:50%;transform:translateX(-50%);width:160px;height:3px;border-radius:999px;background:rgba(255,255,255,0.14)')}><div data-mani-bar style={css('height:100%;width:0;border-radius:999px;background:#00BCB4')}></div></div>
        </div>
      </section>

      {/* CARTILLA VIVA */}
      <section id="cartilla" style={css('padding:110px 40px;background:#fff')}>
        <div style={css('max-width:1000px;margin:0 auto')}>
          <div data-rv style={css('text-align:center;max-width:640px;margin:0 auto 20px')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#009690;margin-bottom:14px')}>Cartilla viva · sin letra chica</div>
            <h2 className="disp" style={css('font-size:40px;font-weight:800;color:#003B71;line-height:1.14;letter-spacing:-0.02em;margin:0 0 14px')}>Escribí una práctica y mirá <span style={css('color:#009690')}>qué cubre</span>.</h2>
            <p style={css('font-size:17px;line-height:1.6;color:#6B6B6B;margin:0')}>Nada de adivinar. Antes de contratar ya sabés qué cubre cada plan y cuánto ponés de tu bolsillo.</p>
          </div>
          <div data-rv style={css('max-width:640px;margin:0 auto 32px;background:#E6F7F6;border-radius:12px;padding:14px 18px;font-size:13.5px;color:#00695f;line-height:1.55;text-align:center')}><b>Lister</b> es nuestro centro médico propio (consultas, laboratorio e imagen). <b>«La red»</b> suma Lister + más de 50 prestadores externos en todo el país.</div>

          <div data-rv style={css('background:#F7FBFB;border:1px solid #d9efed;border-radius:20px;padding:26px 26px 30px;box-shadow:0 1px 3px rgba(0,0,0,0.06)')}>
            <div style={css('position:relative')}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#009690" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={css('position:absolute;left:18px;top:50%;transform:translateY(-50%);pointer-events:none')}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              <input type="text" role="searchbox" aria-label="Buscar una práctica médica" aria-expanded={v.hasMatches} aria-controls="cartilla-matches" value={v.q} onChange={v.onQ} placeholder="Ej: resonancia, parto, psicología…" className="search-inp" style={css('width:100%;height:58px;border:1.5px solid #cfe0dc;border-radius:14px;padding:0 18px 0 48px;font-size:17px;color:#1D1D1B;background:#fff;outline:none')} />
              {v.hasMatches && (
                <div id="cartilla-matches" role="listbox" style={css('position:absolute;left:0;right:0;top:64px;z-index:5;background:#fff;border:1px solid #E8E8E8;border-radius:14px;box-shadow:0 12px 34px rgba(0,59,113,0.14);overflow:hidden')}>
                  {v.matches.map((m, i) => (
                    <button key={i} role="option" onClick={m.onPick} className="cart-match" style={css('display:flex;align-items:center;gap:11px;width:100%;text-align:left;padding:13px 16px;background:#fff;border:none;border-bottom:1px solid #F0F0F0;cursor:pointer;font-size:15px;color:#1D1D1B')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00BCB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>{m.name}</button>
                  ))}
                </div>
              )}
            </div>

            <div style={css('display:flex;flex-wrap:wrap;gap:9px;margin-top:16px')}>
              {v.chips.map((c, i) => (
                <button key={i} onClick={c.onPick} style={css(c.style)}>{c.name}</button>
              ))}
            </div>

            <div key={v.selKey} style={css('margin-top:24px;background:#fff;border:1px solid #E8E8E8;border-radius:16px;overflow:hidden;animation:glowin 1.1s cubic-bezier(.22,1,.36,1)')}>
              <div style={css('display:flex;align-items:center;gap:12px;padding:18px 22px;background:#003B71;color:#fff')}>
                <div style={css('width:40px;height:40px;border-radius:11px;background:rgba(255,255,255,0.14);display:flex;align-items:center;justify-content:center')}>{v.selIcon}</div>
                <div><div style={css('font-size:12px;color:#9bc0e0')}>Práctica</div><div className="disp" style={css('font-size:20px;font-weight:800')}>{v.selName}</div></div>
              </div>
              <div className="two-col" style={css('display:grid;grid-template-columns:1fr 1fr 1fr')}>
                {v.selRows.map((row, i) => (
                  <div key={i} style={css(row.wrap)}>
                    <div style={css('display:flex;align-items:center;gap:7px;margin-bottom:8px')}><span style={css('width:9px;height:9px;border-radius:999px;background:' + row.color)}></span><span style={css('font-size:13px;font-weight:700;color:#003B71')}>{row.plan}</span></div>
                    <div style={css(row.badge)}>{row.status}</div>
                    <div style={css('font-size:13px;color:#6B6B6B;line-height:1.5;margin-top:6px')}>{row.detail}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={css('font-size:12.5px;color:#9aa0a6;margin-top:12px;text-align:center')}>Cifras de referencia — el detalle final de tu contrato lo confirmás con tu asesor.</div>
          </div>
        </div>
      </section>

      {/* COMPARADOR SLIDER */}
      <section id="comparar" style={css('padding:110px 40px;background:#F5F5F5')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          <div data-rv style={css('text-align:center;max-width:640px;margin:0 auto 48px')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#009690;margin-bottom:14px')}>Tres planes, un solo deslizador</div>
            <h2 className="disp" style={css('font-size:40px;font-weight:800;color:#003B71;line-height:1.14;letter-spacing:-0.02em;margin:0 0 14px')}>Movelo y mirá cómo cambia <span style={css('color:#009690')}>tu cobertura</span>.</h2>
            <p style={css('font-size:17px;line-height:1.6;color:#6B6B6B;margin:0')}>De lo esencial a lo premium, arrastrá para ver qué gana cada nivel — y cuánto sale.</p>
          </div>

          <div data-rv style={css('background:#fff;border:0.5px solid #E8E8E8;border-radius:22px;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 18px 50px rgba(0,59,113,0.07);overflow:hidden')}>
            <div style={css(v.sliderHeadStyle)}>
              <div style={css('display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:16px')}>
                <div>
                  <div style={css('font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.85')}>{v.planTag}</div>
                  <div className="disp" style={css('font-size:44px;font-weight:800;line-height:1;margin-top:6px')}>{v.planName}</div>
                </div>
                <div style={css('text-align:right')}>
                  <div style={css('font-size:13px;opacity:.85')}>desde</div>
                  <div className="disp" style={css('font-size:40px;font-weight:800;line-height:1')}>{v.planPrice}</div>
                  <div style={css('font-size:12px;opacity:.85')}>/ mes · titular</div>
                </div>
              </div>
            </div>
            <div style={css('padding:26px 30px 32px')}>
              <input type="range" min="0" max="200" value={v.sliderVal} onChange={v.onSlide} className="sldr" aria-label="Comparar niveles de plan: Esencial, Integral, Premium" aria-valuetext={v.planName} style={css(v.sliderTrackStyle)} />
              <div style={css('display:flex;justify-content:space-between;margin-top:12px')}>
                {v.stops.map((s, i) => (
                  <button key={i} onClick={s.onPick} style={css(s.style)}>{s.label}</button>
                ))}
              </div>
              <div className="two-col" style={css('display:grid;grid-template-columns:1fr 1fr;gap:14px 30px;margin-top:28px')}>
                {v.planLines.map((ln, i) => (
                  <div key={i} style={css('display:flex;align-items:flex-start;gap:11px')}>
                    <span style={css('width:22px;height:22px;border-radius:999px;background:#E6F7F6;display:flex;align-items:center;justify-content:center;flex:none;margin-top:1px')}><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#009690" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
                    <span style={css('font-size:15px;color:#3D3D3D;line-height:1.45')}>{ln}</span>
                  </div>
                ))}
              </div>
              <div style={css('display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-top:30px;padding-top:22px;border-top:1px solid #F0F0F0')}>
                <button onClick={v.toggleFullTable} aria-expanded={v.showFullTable} className="link-teal" style={css('background:none;border:none;padding:0;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:14px;color:#6B6B6B;font-weight:600')}>{v.fullTableLabel} <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={css(v.chevStyle)}><path d="m6 9 6 6 6-6" /></svg></button>
                <a href={v.waHref} target="_blank" rel="noopener" className="btn-teal" style={css('height:48px;padding:0 26px;border-radius:13px;background:#00BCB4;color:#fff;font-size:15px;font-weight:700;display:inline-flex;align-items:center')}>Cotizar este plan</a>
              </div>
              {v.showFullTable && (
                <div style={css('margin-top:22px;border:1px solid #E8E8E8;border-radius:16px;overflow:hidden;overflow-x:auto')}>
                  <div style={css('display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;background:#003B71;color:#fff;min-width:560px')}>
                    <div style={css('padding:12px 16px;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;display:flex;align-items:center')}>Prestación</div>
                    {v.planHeaders.map((ph, i) => (
                      <div key={i} style={css('padding:12px 10px;font-size:12px;font-weight:700;text-align:center;display:flex;align-items:center;justify-content:center')}>{ph}</div>
                    ))}
                  </div>
                  {v.fullRows.map((row, i) => (
                    <div key={i} style={css('display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;border-top:1px solid #F0F0F0;min-width:560px')}>
                      <div style={css('padding:13px 16px;font-size:13.5px;font-weight:600;color:#1D1D1B;display:flex;align-items:center')}>{row.name}</div>
                      {row.cols.map((col, j) => (
                        <div key={j} style={css('padding:13px 10px;text-align:center;display:flex;align-items:center;justify-content:center')}>
                          <span style={css(col.badge)}>{col.status}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div data-rv className="two-col" style={css('margin-top:22px;background:#E6EDF4;border:0.5px solid #d4e0ee;border-radius:16px;padding:24px 28px;display:grid;grid-template-columns:auto 1fr auto;gap:26px;align-items:center')}>
            <div className="disp" style={css('background:#003B71;color:#fff;border-radius:12px;padding:16px 22px;text-align:center;font-weight:800')}><div style={css('font-size:11px;letter-spacing:.2em;opacity:.85')}>SP</div><div style={css('font-size:20px')}>SENIOR</div></div>
            <div><div style={css('font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#009690;margin-bottom:6px')}>Plan aparte · 65 años o más</div><div style={css('font-size:16px;color:#3D3D3D;line-height:1.55')}>¿Buscás para tus padres o un adulto mayor? <b style={css('color:#003B71')}>SP Senior</b> y <b style={css('color:#003B71')}>SP Senior Plus</b> tienen cuidado continuo pensado para ellos.</div></div>
            <a href="#simulador" className="btn-navy" style={css('height:46px;padding:0 22px;border-radius:12px;background:#003B71;color:#fff;font-size:14px;font-weight:700;display:inline-flex;align-items:center;white-space:nowrap')}>Cotizar Senior</a>
          </div>
        </div>
      </section>

      {/* DIFERENCIADORES */}
      <section style={css('padding:80px 40px;background:#E6F7F6')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          <div data-rv style={css('text-align:center;max-width:660px;margin:0 auto 42px')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#009690;margin-bottom:14px')}>Lo que ponemos por escrito</div>
            <h2 className="disp" style={css('font-size:36px;font-weight:800;color:#003B71;line-height:1.16;letter-spacing:-0.02em;margin:0 0 12px')}>Lo que casi nadie te <span style={css('color:#009690')}>garantiza</span>.</h2>
            <p style={css('font-size:16px;line-height:1.6;color:#3D3D3D;margin:0')}>No son promesas sueltas: quedan escritas en tu plan.</p>
          </div>
          <div data-rv className="two-col" style={css('display:grid;grid-template-columns:repeat(3,1fr);gap:20px')}>
            {v.difs.map((dz, i) => (
              <div key={i} style={css('background:#fff;border-radius:18px;padding:28px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.06)')}>
                <div style={css('width:46px;height:46px;border-radius:13px;background:#E6F7F6;color:#009690;display:flex;align-items:center;justify-content:center;margin-bottom:16px')}><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={dz.icon} /></svg></div>
                <div style={css('font-size:17px;font-weight:800;color:#003B71;line-height:1.3;margin-bottom:7px')}>{dz.title}</div>
                <div style={css('font-size:14px;color:#6B6B6B;line-height:1.55')}>{dz.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIMULADOR */}
      <section id="simulador" style={css('padding:110px 40px;background:#003B71')}>
        <div style={css('max-width:1100px;margin:0 auto')}>
          <div data-rv style={css('text-align:center;max-width:640px;margin:0 auto 36px')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#80DDD8;margin-bottom:12px')}>Simulá tu plan</div>
            <h2 className="disp" style={css('font-size:40px;font-weight:800;color:#fff;line-height:1.14;letter-spacing:-0.02em;margin:0 0 12px')}>Tu plan ideal y su precio, <span style={css('color:#00BCB4')}>en un minuto</span>.</h2>
            <p style={css('font-size:17px;color:#B3C7DB;line-height:1.6;margin:0')}>Unas pocas preguntas y ves el precio antes de dejar cualquier dato.</p>
          </div>
          <div data-rv style={css('display:flex;justify-content:center')}>
            <div className="sim-card" style={css('width:760px;max-width:100%;display:flex;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 24px 60px rgba(0,59,113,0.10);border:0.5px solid #E8E8E8')}>

              <div className="sim-side" style={css('width:250px;flex:none;background:#003B71;color:#fff;padding:30px 26px;display:flex;flex-direction:column')}>
                <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:26px')}><span style={css('width:30px;height:30px;border-radius:9px;background:#fff;color:#003B71;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800')}>SP</span><span style={css('font-size:14px;font-weight:800')}>Salud Protegida</span></div>
                {v.sim.livePanelReady ? (
                  <div className="sim-live-panel" style={css('margin-bottom:24px')}>
                    <div style={css('font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#80DDD8;margin-bottom:6px')}>Tu estimado</div>
                    <div data-live-price className="num-tnum" style={css('font-size:29px;font-weight:800;color:#fff;letter-spacing:-0.01em;line-height:1')}>{v.sim.liveTotalFmt}</div>
                    <div style={css('font-size:12px;color:#B3C7DB;margin-top:4px')}>/mes · estimado</div>
                    <div style={css('display:inline-flex;align-items:center;margin-top:12px;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:800;color:#fff;transition:background .3s;background:' + v.sim.planColor)}>{v.sim.planShort}</div>
                    {v.sim.gaugeShow && (
                      <div style={css('display:flex;gap:5px;margin-top:14px')}>
                        {[1, 2, 3].map((n) => <div key={n} style={css('flex:1;height:6px;border-radius:999px;transition:background .3s;background:' + (n <= v.sim.gaugeLevel ? v.sim.planColor : 'rgba(255,255,255,0.15)'))}></div>)}
                      </div>
                    )}
                    <div style={css('font-size:11px;color:#7fa6cc;margin-top:9px;line-height:1.4')}>Se ajusta a medida que configurás.</div>
                  </div>
                ) : (
                  <div className="sim-side-h" style={css('font-size:20px;font-weight:800;line-height:1.2;margin-bottom:26px;letter-spacing:-0.01em')}>Tu plan,<br />a tu medida</div>
                )}
                <div className="sim-steps" style={css('display:flex;flex-direction:column;gap:14px;flex:1')}>
                  {v.sim.stepsList.map((st, i) => (
                    <div key={i} style={css('display:flex;align-items:center;gap:11px')}>
                      <span style={css(st.dot)}>{st.isDone && <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}{st.showNum && st.num}</span>
                      <span style={css('display:flex;flex-direction:column;min-width:0')}><span style={css(st.label)}>{st.name}</span>{st.value && <span style={css('font-size:11.5px;color:#80DDD8;font-weight:700;line-height:1.2;margin-top:1px')}>{st.value}</span>}</span>
                    </div>
                  ))}
                </div>
                {v.sim.enc && <div className="sim-side-enc" style={css('font-size:12px;color:#80DDD8;font-weight:600;line-height:1.4;margin-top:16px')}>{v.sim.enc}</div>}
                <div className="sim-trust" style={css('font-size:12px;color:#B3C7DB;display:flex;align-items:center;gap:8px;margin-top:24px;line-height:1.4')}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none')}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>Sin datos sensibles · menos de 1 minuto</div>
              </div>

              <div className="sim-body" style={css('flex:1;min-width:0;background:#fff;padding:34px 34px;min-height:560px;display:flex;flex-direction:column;justify-content:center')}>
                {v.sim.isQuestion && (
                  <div className="sim-mobile-progress" style={css('margin:0 0 20px')}>
                    <div style={css('display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:8px')}>
                      <span style={css('font-size:12px;font-weight:800;color:#003B71;white-space:nowrap')}>Paso {v.sim.stepNum} de {v.sim.totalSteps}</span>
                      {v.sim.livePanelReady
                        ? <span style={css('text-align:right;white-space:nowrap')}><span style={css('font-size:11px;color:#6B6B6B')}>Estimado </span><span className="num-tnum" style={css('font-size:14px;font-weight:800;color:#003B71')}>{v.sim.liveTotalFmt}</span></span>
                        : <span style={css('font-size:12px;color:#009690;text-align:right')}>{v.sim.enc}</span>}
                    </div>
                    <div style={css('height:5px;border-radius:999px;background:#E6EDF4;overflow:hidden')}><div style={css('height:100%;border-radius:999px;transition:width .35s cubic-bezier(.22,1,.36,1),background .3s;background:' + v.sim.progressBarColor + ';width:' + v.sim.progressPct + '%')}></div></div>
                  </div>
                )}
                {v.sim.isIntro && (
                  <div style={css(v.sim.stepAnim)}>
                    <div style={css('width:54px;height:54px;border-radius:16px;background:#E6F7F6;color:#009690;display:flex;align-items:center;justify-content:center;margin-bottom:18px')}><svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg></div>
                    <h3 style={css('font-size:25px;font-weight:800;color:#003B71;line-height:1.18;letter-spacing:-0.01em;margin:0 0 10px')}>Encontremos tu plan ideal</h3>
                    <p style={css('font-size:15px;color:#3D3D3D;line-height:1.6;margin:0 0 24px')}>Te hacemos unas pocas preguntas y te mostramos el plan que mejor va con tu momento, con un precio estimado. El precio lo ves antes de dejar cualquier dato.</p>
                    <div style={css('display:flex;align-items:center;gap:16px;flex-wrap:wrap')}>
                      <button onClick={v.sim.start} className="btn-teal" style={css('height:52px;padding:0 28px;border:none;border-radius:13px;background:#00BCB4;color:#fff;font-size:16px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:8px;transition:background 160ms')}>Empecemos <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
                      {v.sim.resumeAvailable && <button onClick={v.sim.resume} className="link-teal" style={css('background:none;border:none;color:#009690;font-size:14px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:0')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>Retomar mi simulación</button>}
                    </div>
                  </div>
                )}

                {v.sim.isWho && (
                  <div style={css(v.sim.stepAnim)}>
                    <button onClick={v.sim.back} className="link-teal" style={css('display:inline-flex;align-items:center;gap:5px;background:none;border:none;color:#6B6B6B;font-size:13px;font-weight:600;cursor:pointer;padding:0;margin-bottom:14px')}>← Volver</button>
                    <div style={css('font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#009690;margin-bottom:8px')}>Tu grupo</div>
                    <h3 style={css('font-size:22px;font-weight:800;color:#003B71;line-height:1.25;letter-spacing:-0.01em;margin:0 0 8px')}>¿Para quién es el plan?</h3>
                    <p style={css('font-size:13px;color:#6B6B6B;line-height:1.5;margin:0 0 16px;display:flex;align-items:flex-start;gap:7px')}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00BCB4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:1px')}><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" /><path d="M12 17h.01" /></svg><span>{v.sim.whyWho}</span></p>
                    <div style={css('display:flex;flex-direction:column;gap:10px')}>
                      {v.sim.whoOpts.map((opt, i) => (
                        <button key={i} onClick={opt.onClick} className="sim-opt" style={css('display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;padding:15px 17px;border:1.5px solid #E8E8E8;border-radius:12px;background:#fff;color:#1D1D1B;font-size:15px;font-weight:500;cursor:pointer;transition:all 150ms cubic-bezier(0.22,1,0.36,1)')}><span style={css('display:flex;flex-direction:column;gap:3px')}><span>{opt.label}</span>{opt.hasNote && <span style={css('font-size:12px;font-weight:400;color:#6B6B6B;line-height:1.35')}>{opt.note}</span>}</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00BCB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none')}><path d="m9 18 6-6-6-6" /></svg></button>
                      ))}
                    </div>
                  </div>
                )}

                {v.sim.isEdades && (
                  <div style={css(v.sim.stepAnim)}>
                    <button onClick={v.sim.back} className="link-teal" style={css('display:inline-flex;align-items:center;gap:5px;background:none;border:none;color:#6B6B6B;font-size:13px;font-weight:600;cursor:pointer;padding:0;margin-bottom:14px')}>← Volver</button>
                    <div style={css('font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#009690;margin-bottom:8px')}>Las edades</div>
                    <h3 style={css('font-size:22px;font-weight:800;color:#003B71;line-height:1.25;letter-spacing:-0.01em;margin:0 0 8px')}>¿Qué edades tienen?</h3>
                    <p style={css('font-size:13px;color:#6B6B6B;line-height:1.5;margin:0 0 18px;display:flex;align-items:flex-start;gap:7px')}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00BCB4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:1px')}><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" /><path d="M12 17h.01" /></svg><span>{v.sim.whyEdades}</span></p>
                    <div style={css('display:flex;flex-direction:column')}>
                      {v.sim.people.map((person, i) => (
                        <div key={i} style={css('margin-bottom:14px')}>
                          <div style={css('display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;gap:10px')}>
                            <span style={css('font-size:13px;font-weight:600;color:#1D1D1B')}>{person.role}</span>
                            <div style={css('display:flex;align-items:center;gap:10px')}>
                              <button onClick={person.dec} aria-label={'Bajar edad de ' + person.role} className="step-btn" style={css('width:28px;height:28px;border-radius:999px;border:1.5px solid #E8E8E8;background:#fff;color:#003B71;font-size:16px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;flex:none')}>−</button>
                              <span style={css('font-size:15px;font-weight:800;color:#003B71;min-width:52px;text-align:center')}>{person.ageTxt}<span style={css('font-size:11px;color:#6B6B6B;font-weight:500')}> años</span></span>
                              <button onClick={person.inc} aria-label={'Subir edad de ' + person.role} className="step-btn" style={css('width:28px;height:28px;border-radius:999px;border:1.5px solid #E8E8E8;background:#fff;color:#003B71;font-size:16px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;flex:none')}>+</button>
                            </div>
                          </div>
                          <input type="range" min={person.min} max={person.max} value={person.age} onChange={person.setAge} aria-label={'Edad de ' + person.role} style={css('width:100%;accent-color:#00BCB4;height:5px;cursor:pointer')} />
                        </div>
                      ))}
                    </div>
                    {v.sim.isFamilia && (
                      <div style={css('display:flex;align-items:center;justify-content:space-between;margin-top:4px;padding-top:14px;border-top:1px solid #F0F0F0')}>
                        <span style={css('font-size:14px;font-weight:700;color:#003B71')}>Hijos a sumar</span>
                        <div style={css('display:flex;align-items:center;gap:14px')}>
                          <button onClick={v.sim.removeKid} aria-label="Quitar hijo" className="step-btn" style={css('width:34px;height:34px;border-radius:999px;border:1.5px solid #E8E8E8;background:#fff;color:#003B71;font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1')}>−</button>
                          <span style={css('font-size:17px;font-weight:800;color:#003B71;min-width:18px;text-align:center')}>{v.sim.kidCount}</span>
                          <button onClick={v.sim.addKid} aria-label="Sumar hijo" className="step-btn" style={css('width:34px;height:34px;border-radius:999px;border:1.5px solid #E8E8E8;background:#fff;color:#003B71;font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1')}>+</button>
                        </div>
                      </div>
                    )}
                    {v.sim.isPadres && (
                      <div style={css('display:flex;align-items:center;justify-content:space-between;margin-top:4px;padding-top:14px;border-top:1px solid #F0F0F0')}>
                        <span style={css('font-size:14px;font-weight:700;color:#003B71')}>Personas a cubrir</span>
                        <div style={css('display:flex;align-items:center;gap:14px')}>
                          <button onClick={v.sim.removeAdult} aria-label="Quitar persona" className="step-btn" style={css('width:34px;height:34px;border-radius:999px;border:1.5px solid #E8E8E8;background:#fff;color:#003B71;font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1')}>−</button>
                          <span style={css('font-size:17px;font-weight:800;color:#003B71;min-width:18px;text-align:center')}>{v.sim.adultCount}</span>
                          <button onClick={v.sim.addAdult} aria-label="Sumar persona" className="step-btn" style={css('width:34px;height:34px;border-radius:999px;border:1.5px solid #E8E8E8;background:#fff;color:#003B71;font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1')}>+</button>
                        </div>
                      </div>
                    )}
                    <button onClick={v.sim.toAddons} className="btn-teal" style={css('width:100%;height:50px;margin-top:22px;border:none;border-radius:13px;background:#00BCB4;color:#fff;font-size:16px;font-weight:800;cursor:pointer;transition:background 160ms')}>Continuar</button>
                  </div>
                )}

                {v.sim.isNivel && (
                  <div style={css(v.sim.stepAnim)}>
                    <button onClick={v.sim.back} className="link-teal" style={css('display:inline-flex;align-items:center;gap:5px;background:none;border:none;color:#6B6B6B;font-size:13px;font-weight:600;cursor:pointer;padding:0;margin-bottom:14px')}>← Volver</button>
                    <div style={css('font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#009690;margin-bottom:8px')}>{v.sim.nivelEyebrow}</div>
                    <h3 style={css('font-size:22px;font-weight:800;color:#003B71;line-height:1.25;letter-spacing:-0.01em;margin:0 0 8px')}>{v.sim.nivelTitle}</h3>
                    <p style={css('font-size:13px;color:#6B6B6B;line-height:1.5;margin:0 0 16px;display:flex;align-items:flex-start;gap:7px')}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00BCB4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:1px')}><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" /><path d="M12 17h.01" /></svg><span>{v.sim.whyNivel}</span></p>
                    <div style={css('display:flex;flex-direction:column;gap:10px')}>
                      {v.sim.nivelOpts.map((opt, i) => (
                        <button key={i} onClick={opt.onClick} className="sim-opt" style={css('display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;padding:15px 17px;border:1.5px solid #E8E8E8;border-radius:12px;background:#fff;color:#1D1D1B;font-size:15px;font-weight:500;cursor:pointer;transition:all 150ms cubic-bezier(0.22,1,0.36,1)')}><span style={css('display:flex;flex-direction:column;gap:3px;min-width:0')}><span>{opt.label}</span>{opt.hasNote && <span style={css('font-size:12px;font-weight:400;color:#6B6B6B;line-height:1.35')}>{opt.note}</span>}</span><span style={css('display:flex;align-items:center;gap:9px;flex:none')}><span style={css('font-size:12.5px;font-weight:800;color:#009690;white-space:nowrap')}>{opt.from}</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00BCB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg></span></button>
                      ))}
                    </div>
                  </div>
                )}

                {v.sim.isGeo && (
                  <div style={css(v.sim.stepAnim)}>
                    <button onClick={v.sim.back} className="link-teal" style={css('display:inline-flex;align-items:center;gap:5px;background:none;border:none;color:#6B6B6B;font-size:13px;font-weight:600;cursor:pointer;padding:0;margin-bottom:14px')}>← Volver</button>
                    <div style={css('font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#009690;margin-bottom:8px')}>Zona</div>
                    <h3 style={css('font-size:22px;font-weight:800;color:#003B71;line-height:1.25;letter-spacing:-0.01em;margin:0 0 8px')}>¿Hasta dónde querés cobertura?</h3>
                    <p style={css('font-size:13px;color:#6B6B6B;line-height:1.5;margin:0 0 16px;display:flex;align-items:flex-start;gap:7px')}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00BCB4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:1px')}><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" /><path d="M12 17h.01" /></svg><span>{v.sim.whyGeo}</span></p>
                    <div style={css('display:flex;flex-direction:column;gap:10px')}>
                      {v.sim.geoOpts.map((opt, i) => (
                        <button key={i} onClick={opt.onClick} className="sim-opt" style={css('display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;padding:15px 17px;border:1.5px solid #E8E8E8;border-radius:12px;background:#fff;color:#1D1D1B;font-size:15px;font-weight:500;cursor:pointer;transition:all 150ms cubic-bezier(0.22,1,0.36,1)')}><span style={css('display:flex;flex-direction:column;gap:3px;min-width:0')}><span>{opt.label} <span style={css('font-size:13px;font-weight:800;color:#00BCB4;letter-spacing:0.06em')}>{opt.tier}</span></span><span style={css('font-size:12px;font-weight:400;color:#6B6B6B;line-height:1.35')}>{opt.note}</span></span><span style={css('display:flex;align-items:center;gap:9px;flex:none')}><span style={css('font-size:12.5px;font-weight:800;color:#009690;white-space:nowrap')}>{opt.impact}</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00BCB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg></span></button>
                      ))}
                    </div>
                  </div>
                )}

                {v.sim.isAddons && (
                  <div style={css(v.sim.stepAnim)}>
                    <button onClick={v.sim.back} className="link-teal" style={css('display:inline-flex;align-items:center;gap:5px;background:none;border:none;color:#6B6B6B;font-size:13px;font-weight:600;cursor:pointer;padding:0;margin-bottom:14px')}>← Volver</button>
                    <div style={css('font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#009690;margin-bottom:8px')}>Coberturas adicionales</div>
                    <h3 style={css('font-size:22px;font-weight:800;color:#003B71;line-height:1.25;letter-spacing:-0.01em;margin:0 0 8px')}>¿Querés personalizar tu cobertura?</h3>
                    <p style={css('font-size:13px;color:#6B6B6B;line-height:1.5;margin:0 0 16px;display:flex;align-items:flex-start;gap:7px')}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00BCB4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:1px')}><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" /><path d="M12 17h.01" /></svg><span>{v.sim.whyAddons}</span></p>
                    {v.sim.liveReady && (
                      <div style={css('display:flex;align-items:center;justify-content:space-between;gap:10px;background:#F2FBFA;border:1px solid #d9efed;border-radius:12px;padding:12px 15px;margin-bottom:14px')}>
                        <span style={css('font-size:13px;color:#00695f')}>Tu estimado</span>
                        <span style={css('text-align:right')}><span className="num-tnum" style={css('font-size:17px;font-weight:800;color:#003B71')}>{v.sim.liveTotal}</span><span style={css('font-size:12px;color:#6B6B6B;font-weight:500')}> /mes</span>{v.sim.liveAddonsAmount > 0 && <span className="num-tnum" style={css('display:block;font-size:12px;font-weight:700;color:#009690')}>+ {v.sim.liveAddons} en adicionales</span>}</span>
                      </div>
                    )}
                    <div style={css('display:flex;flex-direction:column;gap:10px')}>
                      {v.sim.addonsList.map((ad, i) => (
                        <button key={i} onClick={ad.toggle} style={css(ad.rowStyle)}><span style={css('display:flex;align-items:center;gap:12px;min-width:0')}><span style={css(ad.boxStyle)}>{ad.selected && <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}</span><span style={css('display:flex;flex-direction:column;gap:2px;min-width:0')}><span style={css('font-size:15px;font-weight:600;color:#1D1D1B')}>{ad.label}</span><span style={css('font-size:12px;font-weight:400;color:#6B6B6B;line-height:1.35')}>{ad.note}</span></span></span><span style={css('font-size:12.5px;font-weight:800;color:#009690;white-space:nowrap;flex:none')}>{ad.priceLabel}</span></button>
                      ))}
                    </div>
                    <button onClick={v.sim.toResult} className="btn-teal" style={css('width:100%;height:50px;margin-top:18px;border:none;border-radius:13px;background:#00BCB4;color:#fff;font-size:15px;font-weight:800;cursor:pointer;transition:background 160ms')}>{v.sim.continueLabel}</button>
                  </div>
                )}

                {v.sim.isResult && (
                  <div style={css(v.sim.stepAnim)}>
                    <div style={css('display:flex;align-items:center;gap:13px;margin-bottom:16px')}>
                      <div style={css('position:relative;width:44px;height:44px;flex:none')}>
                        <svg width="44" height="44" viewBox="0 0 44 44" style={css('display:block')}><circle cx="22" cy="22" r="19" fill="none" stroke="#E6F7F6" strokeWidth="4"></circle><circle cx="22" cy="22" r="19" fill="none" stroke="#00BCB4" strokeWidth="4" strokeLinecap="round" strokeDasharray="119.4" strokeDashoffset="119.4" transform="rotate(-90 22 22)" style={css('animation:spRing 0.95s cubic-bezier(0.22,1,0.36,1) 0.1s forwards')}></circle></svg>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#00BCB4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={css('position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);animation:spCheckIn 0.4s cubic-bezier(0.22,1,0.36,1) 0.72s both')}><path d="M20 6 9 17l-5-5"></path></svg>
                      </div>
                      <div>
                        <div style={css('font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#009690')}>Encontramos tu match</div>
                        <div style={css('font-size:14px;color:#6B6B6B')}>Según lo que nos contaste</div>
                      </div>
                    </div>
                    <div style={css('border-radius:16px;overflow:hidden;border:0.5px solid #E8E8E8;animation:spGlow 1.3s cubic-bezier(0.22,1,0.36,1) 0.15s both')}>
                      <div style={css(v.sim.headerStyle)}>
                        <div style={css('font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85')}>Plan recomendado</div>
                        <div style={css('font-size:24px;font-weight:800;line-height:1.1;margin-top:2px')}>{v.sim.resName}</div>
                        <div style={css('font-size:12px;font-weight:600;opacity:0.92;margin-top:4px;display:flex;align-items:center;gap:5px')}><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none')}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>Cobertura {v.sim.resGeo}</div>
                      </div>
                      <div style={css('padding:18px 20px;background:#fff')}>
                        <div style={css('display:flex;align-items:baseline;gap:8px;flex-wrap:wrap')}><span data-sp-price className="num-tnum" style={css('font-size:31px;font-weight:800;color:#003B71;letter-spacing:-0.01em;line-height:1')}>{v.sim.resPrice}</span><span style={css('font-size:14px;color:#6B6B6B;font-weight:500')}>/ mes estimado</span></div>
                        <div style={css('font-size:12px;color:#6B6B6B;margin:6px 0 14px')}>{v.sim.resGroup} · titular de {v.sim.titularAge}. El precio final lo confirma un asesor.</div>
                        <p style={css('font-size:14px;color:#3D3D3D;line-height:1.6;margin:0')}>{v.sim.resWhy}</p>
                        {v.sim.hasAddons && <div style={css('font-size:13px;color:#003B71;font-weight:600;margin-top:10px;display:flex;align-items:flex-start;gap:6px')}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00BCB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:1px')}><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg><span>Sumás: {v.sim.resAddonsText}</span></div>}
                      </div>
                    </div>

                    <div style={css('margin-top:12px')}>
                      <button onClick={v.toggleCalc} aria-expanded={v.showCalc} className="link-teal" style={css('background:none;border:none;padding:0;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:13px;color:#6B6B6B;font-weight:600')}>¿Cómo calculamos esto? <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={css('transition:transform .2s cubic-bezier(.22,1,.36,1);transform:rotate(' + (v.showCalc ? '180deg' : '0deg') + ')')}><path d="m6 9 6 6 6-6" /></svg></button>
                      {v.showCalc && (
                        <div style={css('margin-top:10px;border:1px solid #E8E8E8;border-radius:12px;overflow:hidden')}>
                          {v.sim.resBreakdown.map((it, i) => (
                            <div key={i} style={css('display:flex;justify-content:space-between;gap:12px;padding:11px 14px;font-size:13.5px;color:#3D3D3D;border-top:' + (i === 0 ? '0' : '1px solid #F0F0F0'))}><span>{it.label}</span><span style={css('font-weight:700;color:#003B71;white-space:nowrap')}>{it.amount}</span></div>
                          ))}
                          <div style={css('display:flex;justify-content:space-between;gap:12px;padding:12px 14px;border-top:1px solid #E8E8E8;background:#F7FBFB;font-size:14px;font-weight:800;color:#003B71')}><span>Total estimado</span><span>{v.sim.resTotal}</span></div>
                          <div style={css('padding:10px 14px;font-size:11.5px;color:#9aa0a6;background:#F7FBFB;border-top:1px solid #F0F0F0;line-height:1.4')}>Números de referencia, redondeados. El asesor confirma el total final.</div>
                        </div>
                      )}
                    </div>

                    <div style={css('margin-top:18px')}>
                      {v.sim.formOpen && (
                        <div style={css('background:#F7FBFB;border:1px solid #d9efed;border-radius:14px;padding:18px 18px 16px')}>
                          <div style={css('font-size:15px;font-weight:800;color:#003B71;margin-bottom:3px')}>¿A dónde te enviamos tu cotización?</div>
                          <div style={css('font-size:12px;color:#6B6B6B;margin-bottom:14px')}>{v.sim.whyContacto}</div>
                          <div style={css('display:flex;gap:10px;margin-bottom:10px')}>
                            <input type="text" value={v.sim.nombre} onChange={v.sim.setNombre} placeholder="Nombre y apellido" required className="inp" style={css('flex:1;min-width:0;height:46px;border:1.5px solid #E8E8E8;border-radius:8px;padding:0 14px;font-size:15px;color:#1D1D1B;background:#fff;outline:none')} />
                            <input type="tel" value={v.sim.tel} onChange={v.sim.setTel} placeholder="WhatsApp" required className="inp" style={css('flex:1;min-width:0;height:46px;border:1.5px solid #E8E8E8;border-radius:8px;padding:0 14px;font-size:15px;color:#1D1D1B;background:#fff;outline:none')} />
                          </div>
                          <input type="email" value={v.sim.email} onChange={v.sim.setEmail} placeholder="Email (opcional)" className="inp" style={css('width:100%;height:46px;border:1.5px solid #E8E8E8;border-radius:8px;padding:0 14px;font-size:15px;color:#1D1D1B;background:#fff;outline:none;margin-bottom:8px')} />
                          <div style={css('font-size:11.5px;color:#9aa0a6;margin-bottom:12px;line-height:1.4')}>Tu WhatsApp con código de país si podés (ej: +595 9…). El email es opcional.</div>
                          {v.sim.hasErr && <div role="alert" style={css('font-size:12px;color:#F44336;margin-bottom:10px')}>{v.sim.err}</div>}
                          <button onClick={v.sim.submit} className="btn-teal" style={css('width:100%;height:48px;border:none;border-radius:12px;background:#00BCB4;color:#fff;font-size:15px;font-weight:800;cursor:pointer;transition:background 160ms')}>Enviarme mi cotización</button>
                        </div>
                      )}
                      {v.sim.sentOpen && (
                        <div style={css('background:#E6F7F6;border:1px solid #bfe4e1;border-radius:14px;padding:24px;text-align:center')}>
                          <div style={css('width:46px;height:46px;border-radius:999px;background:#00BCB4;color:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto')}><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></div>
                          <div style={css('font-size:17px;font-weight:800;color:#003B71;margin-top:12px')}>¡Listo, {v.sim.nombre}!</div>
                          <div style={css('font-size:14px;color:#3D3D3D;margin-top:4px;line-height:1.5')}>Te enviamos tu cotización y un asesor te contacta para confirmarla.</div>
                        </div>
                      )}
                      <a href={v.waHref} target="_blank" rel="noopener" className="btn-wa-outline" style={css('display:flex;align-items:center;justify-content:center;gap:9px;height:48px;border-radius:12px;background:#fff;color:#009690;border:1.5px solid #00BCB4;font-size:15px;font-weight:700;margin-top:10px')}><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z" /></svg>Prefiero escribir por WhatsApp</a>
                      <div style={css('display:flex;gap:10px;margin-top:10px')}>
                        <button onClick={v.sim.download} className="btn-wa-outline" style={css('flex:1;display:flex;align-items:center;justify-content:center;gap:8px;height:44px;border-radius:12px;background:#fff;color:#009690;border:1.5px solid #cfe0dc;font-size:14px;font-weight:700;cursor:pointer')}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>Descargar</button>
                        <button onClick={v.sim.share} className="btn-wa-outline" style={css('flex:1;display:flex;align-items:center;justify-content:center;gap:8px;height:44px;border-radius:12px;background:#fff;color:#009690;border:1.5px solid #cfe0dc;font-size:14px;font-weight:700;cursor:pointer')}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>{v.sim.shareMsg || 'Compartir'}</button>
                      </div>
                      <div style={css('display:flex;align-items:center;justify-content:space-between;margin-top:16px')}>
                        <a href="#comparar" onClick={v.sim.verDetalle} className="link-teal" style={css('font-size:13px;color:#6B6B6B;font-weight:600')}>Ver el detalle de los planes →</a>
                        <button onClick={v.sim.restart} className="link-grey" style={css('background:none;border:none;color:#9aa0a6;font-size:13px;font-weight:600;cursor:pointer')}>↺ Empezar de nuevo</button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA (después del simulador) */}
      <section style={css('padding:100px 40px 90px;background:#fff')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          <div data-rv style={css('text-align:center;max-width:640px;margin:0 auto 44px')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#009690;margin-bottom:14px')}>De la cotización a tu credencial</div>
            <h2 className="disp" style={css('font-size:36px;font-weight:800;color:#003B71;line-height:1.16;letter-spacing:-0.02em;margin:0')}>Cómo funciona la contratación</h2>
          </div>
          <div data-rv className="two-col" style={css('display:grid;grid-template-columns:repeat(4,1fr);gap:20px')}>
            {v.stepsHow.map((st, i) => (
              <div key={i} style={css('background:#F5F5F5;border-radius:16px;padding:24px 20px')}>
                <div className="disp" style={css('width:36px;height:36px;border-radius:10px;background:#00BCB4;color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;margin-bottom:14px')}>{st.n}</div>
                <div style={css('font-size:15.5px;font-weight:700;color:#003B71;line-height:1.35;margin-bottom:6px')}>{st.title}</div>
                <div style={css('font-size:13.5px;color:#6B6B6B;line-height:1.5')}>{st.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALES — carrusel editorial */}
      <section style={css('padding:104px 40px;background:#003B71;overflow:hidden')}>
        <div style={css('max-width:900px;margin:0 auto;text-align:center')}>
          <div data-rv style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#80DDD8;margin-bottom:30px')}>Lo que dicen nuestros afiliados</div>
          <div data-rv>
            <div key={v.testi.index} style={css('animation:testiFade .5s cubic-bezier(.22,1,.36,1)')}>
              <svg viewBox="0 0 24 24" width="44" height="44" fill="#00BCB4" style={css('opacity:.9;margin:0 auto 18px;display:block')}><path d="M9.5 5C6.5 5 4 7.6 4 10.8c0 3 2.2 5.2 5 5.2.3 0 .6 0 .9-.1-.5 1.4-1.8 2.6-3.6 3.1-.4.1-.6.5-.5.9.1.3.4.6.8.6 3.9-.4 7.4-3.7 7.4-9.1V10C13.9 7 12 5 9.5 5Zm10 0C16.5 5 14 7.6 14 10.8c0 3 2.2 5.2 5 5.2.3 0 .6 0 .9-.1-.5 1.4-1.8 2.6-3.6 3.1-.4.1-.6.5-.5.9.1.3.4.6.8.6 3.9-.4 7.4-3.7 7.4-9.1V10C23.9 7 22 5 19.5 5Z" /></svg>
              <p className="disp" style={css('font-size:clamp(24px,3vw,34px);font-weight:800;color:#fff;line-height:1.28;letter-spacing:-0.01em;margin:0 auto 26px;max-width:760px')}>“{v.testi.current.quote}”</p>
              <div style={css('font-size:16px;font-weight:700;color:#fff')}>{v.testi.current.name}</div>
              <div style={css('font-size:14px;color:#80DDD8;margin-top:2px')}>{v.testi.current.meta}</div>
            </div>
          </div>
          <div style={css('display:flex;align-items:center;justify-content:center;gap:20px;margin-top:34px')}>
            <button onClick={v.testi.prev} aria-label="Testimonio anterior" style={css('width:42px;height:42px;border-radius:999px;border:1.5px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.06);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center')}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg></button>
            <div style={css('display:flex;gap:8px')}>
              {v.testi.dots.map((dt, i) => (
                <button key={i} onClick={dt.onClick} aria-label={'Ir al testimonio ' + (i + 1)} style={css('width:9px;height:9px;border-radius:999px;border:none;cursor:pointer;padding:0;transition:all .3s;background:' + (dt.active ? '#00BCB4' : 'rgba(255,255,255,0.3)') + (dt.active ? ';width:24px' : ''))}></button>
              ))}
            </div>
            <button onClick={v.testi.next} aria-label="Testimonio siguiente" style={css('width:42px;height:42px;border-radius:999px;border:1.5px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.06);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center')}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg></button>
          </div>
          <div style={css('font-size:12px;color:#7f9cbb;margin-top:30px')}>Testimonios de ejemplo — se reemplazan por reales, con su consentimiento.</div>
        </div>
      </section>

      {/* CONFIANZA / SOBRE SP (con boceto del edificio) */}
      <section style={css('padding:96px 40px 40px;background:#fff')}>
        <div data-rv className="two-col" style={css('max-width:1080px;margin:0 auto;background:#E6EDF4;border-radius:20px;padding:40px;display:grid;grid-template-columns:0.85fr 1.15fr;gap:40px;align-items:center')}>
          <div style={css('position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:210px')}>
            <div style={css('position:absolute;top:6px;width:180px;height:180px;border-radius:50%;background:#d4e0ee')}></div>
            {/* Placeholder line-art del edificio SP — reemplazar por el boceto real */}
            <svg viewBox="0 0 260 190" width="100%" style={css('position:relative;max-width:250px')} fill="none" stroke="#5b83ac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M36 66 L130 26 L224 66 Z" />
              <path d="M40 66 H220 M40 78 H220" />
              <path d="M56 78 V158 M92 78 V158 M128 78 V158 M164 78 V158 M200 78 V158" />
              <path d="M30 158 H230 M22 172 H238" />
              <path d="M110 128 h40 v30 h-40 z M110 128 a20 20 0 0 1 40 0" />
              <path d="M130 26 v-8" /><circle cx="130" cy="14" r="4" />
            </svg>
            <div style={css('position:relative;margin-top:12px;font-size:11px;color:#9aa0a6;text-align:center;line-height:1.4')}>Ilustración de referencia — reemplazar por el boceto real del edificio.</div>
          </div>
          <div>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#009690;margin-bottom:12px')}>Quiénes somos</div>
            <h3 className="disp" style={css('font-size:26px;font-weight:800;color:#003B71;line-height:1.2;letter-spacing:-0.01em;margin:0 0 22px')}>Una empresa familiar paraguaya, cuidando familias hace más de 23 años.</h3>
            <div style={css('display:grid;grid-template-columns:1fr 1fr;gap:24px 20px')}>
              <div><div className="disp" style={css('font-size:32px;color:#003B71')}>2002</div><div style={css('font-size:13px;color:#3D3D3D;margin-top:3px')}>Fundada en Asunción</div></div>
              <div><div className="disp num-tnum" data-stat data-target="23" data-prefix="+" data-suffix=" años" style={css('font-size:32px;color:#003B71')}>+23 años</div><div style={css('font-size:13px;color:#3D3D3D;margin-top:3px')}>Cuidando familias en todo el país</div></div>
              <div><div className="disp num-tnum" data-stat data-target="9100" data-prefix="~" data-thousands="1" style={css('font-size:32px;color:#003B71')}>~9.100</div><div style={css('font-size:13px;color:#3D3D3D;margin-top:3px')}>Contratos activos hoy</div></div>
              <div><div className="disp num-tnum" data-stat data-target="19000" data-prefix="~" data-thousands="1" style={css('font-size:32px;color:#003B71')}>~19.000</div><div style={css('font-size:13px;color:#3D3D3D;margin-top:3px')}>Vidas aseguradas</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* FRANJA RED / LISTER */}
      <section style={css('padding:0 40px 90px;background:#fff')}>
        <div data-rv style={css('max-width:1080px;margin:0 auto;background:#003B71;border-radius:20px;padding:30px 36px;display:flex;align-items:center;gap:20px;flex-wrap:wrap;justify-content:center;text-align:center')}>
          <span style={css('width:52px;height:52px;border-radius:14px;background:rgba(0,188,180,0.18);color:#00BCB4;display:flex;align-items:center;justify-content:center;flex:none')}><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><circle cx="5" cy="6" r="2" /><circle cx="19" cy="6" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="18" r="2" /><path d="M10 10 6.5 7.5M14 10l3.5-2.5M10 14l-3.5 2.5M14 14l3.5 2.5" /></svg></span>
          <div style={css('font-size:18px;color:#fff;line-height:1.5')}><b>Lister + más de 50 prestadores</b> <span style={css('color:#80DDD8')}>en todo el país.</span> Nuestro centro médico propio, más una red que te cubre donde estés.</div>
        </div>
      </section>

      {/* RED DE BENEFICIOS / ALIADOS */}
      <section style={css('padding:90px 40px;background:#F5F5F5')}>
        <div style={css('max-width:1100px;margin:0 auto')}>
          <div data-rv style={css('text-align:center;max-width:660px;margin:0 auto')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#009690;margin-bottom:14px')}>Red de beneficios · SaludPro 360</div>
            <h2 className="disp" style={css('font-size:34px;font-weight:800;color:#003B71;line-height:1.16;letter-spacing:-0.02em;margin:0 0 12px')}>Ventajas y ofertas exclusivas <span style={css('color:#009690')}>con tu plan</span>.</h2>
            <p style={css('font-size:16px;line-height:1.6;color:#6B6B6B;margin:0')}>Descuentos en farmacias, ópticas, bienestar y más — solo por ser afiliado de Salud Protegida.</p>
          </div>
          <div data-rv className="ally-grid" style={css('display:grid;grid-template-columns:repeat(7,1fr);gap:14px;margin-top:38px')}>
            {v.aliados.map((name, i) => (
              <div key={i} style={css('background:#fff;border:1px solid #E8E8E8;border-radius:12px;min-height:74px;display:flex;align-items:center;justify-content:center;padding:10px;text-align:center')}>
                <span style={css('font-size:12.5px;font-weight:800;color:#9aa0a6;line-height:1.25;letter-spacing:0.01em')}>{name}</span>
              </div>
            ))}
          </div>
          <div style={css('text-align:center;margin-top:18px;font-size:12px;color:#9aa0a6')}>Aliados de ejemplo — se reemplazan por el logo real de cada uno.</div>
        </div>
      </section>

      {/* PRESTADORES (próximamente) */}
      <section style={css('padding:0 40px 96px;background:#F5F5F5')}>
        <div data-rv style={css('max-width:1100px;margin:0 auto;background:#fff;border:1.5px dashed #cfd8e3;border-radius:20px;padding:40px 36px;text-align:center')}>
          <div style={css('width:52px;height:52px;border-radius:14px;background:#E6EDF4;color:#003B71;display:flex;align-items:center;justify-content:center;margin:0 auto 16px')}><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 10h.01M15 10h.01M9 13h.01M15 13h.01" /></svg></div>
          <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#009690;margin-bottom:10px')}>Prestadores</div>
          <h3 className="disp" style={css('font-size:24px;font-weight:800;color:#003B71;line-height:1.2;margin:0 0 8px')}>Sanatorios, laboratorios y profesionales de la red</h3>
          <p style={css('font-size:15px;color:#6B6B6B;line-height:1.6;margin:0 auto 16px;max-width:520px')}>Muy pronto vas a poder explorar acá toda la red de prestadores de Salud Protegida, con sus especialidades y ubicaciones.</p>
          <span style={css('display:inline-flex;align-items:center;gap:7px;padding:7px 16px;border-radius:999px;background:#E6F7F6;color:#009690;font-size:13px;font-weight:700')}>Próximamente</span>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={css('padding:110px 40px;background:#F5F5F5')}>
        <div style={css('max-width:820px;margin:0 auto')}>
          <div data-rv style={css('text-align:center;max-width:640px;margin:0 auto 12px')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#009690;margin-bottom:14px')}>Antes de contratar</div>
            <h2 className="disp" style={css('font-size:36px;font-weight:800;color:#003B71;line-height:1.16;letter-spacing:-0.02em;margin:0 0 14px')}>Preguntas frecuentes</h2>
            <p style={css('font-size:15px;color:#6B6B6B;line-height:1.6;margin:0 0 40px')}>Respuestas orientativas — tu asesor confirma los detalles exactos de tu contrato.</p>
          </div>
          <div data-rv style={css('display:flex;flex-direction:column;gap:10px')}>
            {v.faqList.map((f, i) => (
              <div key={i} style={css('background:#fff;border:1px solid #E8E8E8;border-radius:14px;overflow:hidden')}>
                <button onClick={f.toggle} aria-expanded={f.open} style={css('width:100%;text-align:left;padding:18px 20px;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:14px;font-size:15.5px;font-weight:700;color:#003B71')}>{f.q}<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#009690" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={css(f.chevStyle + ';flex:none')}><path d="m6 9 6 6 6-6" /></svg></button>
                {f.open && <div style={css('padding:0 20px 20px;font-size:14.5px;color:#3D3D3D;line-height:1.65')}>{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CIERRE */}
      <section style={css('padding:80px 40px 110px;background:#003B71')}>
        <div data-rv style={css('max-width:1100px;margin:0 auto;background:#00BCB4;border-radius:22px;padding:56px 48px;display:flex;align-items:center;justify-content:space-between;gap:36px;flex-wrap:wrap')}>
          <div style={css('max-width:560px')}>
            <h2 className="disp" style={css('font-size:34px;font-weight:800;color:#fff;line-height:1.16;letter-spacing:-0.01em;margin:0 0 12px')}>¿Hablamos? Estamos <span style={css('color:#003B71')}>del otro lado</span>.</h2>
            <p style={css('font-size:17px;color:rgba(255,255,255,0.92);line-height:1.6;margin:0')}>Un asesor te acompaña a elegir, sin apuro y sin compromiso. Como el médico de la familia, pero para tu seguro.</p>
          </div>
          <div style={css('display:flex;gap:12px;flex-wrap:wrap')}>
            <a href={v.waHref} target="_blank" rel="noopener" className="btn-white-teal" style={css('height:52px;padding:0 26px;border-radius:13px;background:#fff;color:#009690;font-size:15px;font-weight:700;display:inline-flex;align-items:center;gap:9px')}><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z" /></svg>WhatsApp</a>
            <a href="#simulador" className="btn-ghost-light2" style={css('height:52px;padding:0 26px;border-radius:13px;background:rgba(255,255,255,0.16);border:1.5px solid rgba(255,255,255,0.6);color:#fff;font-size:15px;font-weight:700;display:inline-flex;align-items:center')}>Simular mi plan</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={css('background:#002A52;color:#fff;padding:56px 40px 30px')}>
        <div className="two-col" style={css('max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:36px;padding-bottom:30px;border-bottom:1px solid rgba(255,255,255,0.12)')}>
          <div>
            <img src={`${BP}/assets/logo-sp-white-crop.png`} alt="Salud Protegida" style={css('height:38px;display:block;margin-bottom:14px')} />
            <div style={css('font-size:14px;color:#9bb6d2;line-height:1.6')}>Protección que se siente · +23 años · Asunción, Paraguay</div>
          </div>
          <div>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#80DDD8;margin-bottom:14px')}>Contacto</div>
            <div style={css('font-size:14px;color:#cfe0f0;line-height:2')}>
              <div>Asunción, Paraguay <span style={css('opacity:.55')}>(dirección a confirmar)</span></div>
              <div>Urgencias 24 h: <a href={'tel:' + SP_TEL} className="foot-link num-tnum" style={css('color:#cfe0f0;font-weight:700')}>{SP_PHONE_DISPLAY}</a></div>
              <div>hola@saludprotegida.com.py <span style={css('opacity:.55')}>(a confirmar)</span></div>
            </div>
          </div>
          <div>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#80DDD8;margin-bottom:14px')}>Enlaces</div>
            <div style={css('display:flex;flex-direction:column;gap:10px;font-size:14px;color:#cfe0f0')}>
              <a href="#cartilla" className="foot-link" style={css('color:inherit')}>Cartilla viva</a>
              <a href="#comparar" className="foot-link" style={css('color:inherit')}>Planes</a>
              <a href="#faq" className="foot-link" style={css('color:inherit')}>Preguntas frecuentes</a>
              <a href="#simulador" className="foot-link" style={css('color:inherit')}>Simular mi plan</a>
            </div>
          </div>
        </div>
        <div style={css('max-width:1100px;margin:20px auto 0;font-size:12.5px;color:#7f9cbb')}>© 2026 Salud Protegida (Odontomedica S.A.). Coberturas de referencia sujetas a confirmación.</div>
      </footer>

      {/* COTIZAR STICKY (aparece al scrollear) */}
      <a href="#simulador" data-cotizar-fab className="cotizar-fab" aria-label="Cotizar mi plan" style={css('position:fixed;right:22px;bottom:90px;z-index:110;height:48px;padding:0 20px;border-radius:999px;background:#003B71;color:#fff;font-size:14px;font-weight:800;display:inline-flex;align-items:center;gap:8px;box-shadow:0 10px 28px rgba(0,59,113,0.28)')}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" /></svg>Cotizar mi plan</a>

      {/* WHATSAPP FLOTANTE */}
      <a href={v.waHref} target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp" className="btn-teal" style={css('position:fixed;right:22px;bottom:22px;z-index:110;width:58px;height:58px;border-radius:999px;background:#00BCB4;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 28px rgba(0,59,113,0.28)')}><svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z" /></svg></a>

    </div>
  );
}
