/* La red médica real — búsqueda y filtros de la Guía Médica (sep 2026).
   ----------------------------------------------------------------------------
   Los datos salen de la planilla maestra de SP (lib/guia-medica.json, generado
   por scripts/build-guia-medica.py). Este módulo es puro: lo usan la página de
   la guía (cliente) y las fichas (build), y se prueba con node sin navegador.

   Cómo está armada la red — y por qué el filtro es "¿qué plan tenés?":
   cada guía en PDF es UNA red, y cada plan usa una de ellas. Silver y Gold no
   tienen redes distintas: comparten la misma, y lo que cambia entre ellos es
   cuánto cubren. Por eso la guía no pregunta "desde qué plan" (el molde viejo
   de guia/ suponía Gold ⊇ Silver ⊇ Bronze) sino qué plan tiene la persona, y
   le muestra su red.

   Nombres: de cara al cliente nunca "Privilege" (HANDOFF dec. 11o) ni
   "Essential" — el Essential de los PDF es SP Esencial (Arturo, 23/09/2026). */

export const REDES = {
  privilege: { corto: 'Silver · Gold · Vital', largo: 'Bronze, Silver, Gold, Vital, Bienestar, Superior, Integral y Primordial', guia: 'privilege' },
  esencial_ac: { corto: 'Esencial', largo: 'SP Esencial · Asunción y Central', guia: 'ess_asucentral' },
  esencial_int: { corto: 'Esencial', largo: 'SP Esencial · Interior', guia: 'ess_interior' },
  esencial_nac: { corto: 'Esencial', largo: 'SP Esencial · Nacional', guia: 'ess_nacional' },
  estatal: { corto: 'Estatal', largo: 'Plan Estatal', guia: 'estatal' },
};

// Lo que la persona elige → la red que usa su plan.
export const PLANES = [
  { v: '', label: 'Todos los planes', red: null },
  { v: 'esencial-ac', label: 'SP Esencial · Asunción y Central', red: 'esencial_ac' },
  { v: 'esencial-interior', label: 'SP Esencial · Interior', red: 'esencial_int' },
  { v: 'esencial-nacional', label: 'SP Esencial · Nacional', red: 'esencial_nac' },
  { v: 'silver-gold', label: 'Silver, Gold o Bronze', red: 'privilege' },
  { v: 'vital', label: 'Vital', red: 'privilege' },
  { v: 'otros', label: 'Bienestar, Superior, Integral o Primordial', red: 'privilege' },
  { v: 'estatal', label: 'Plan Estatal', red: 'estatal' },
];

/* Cómo se ELIGE el plan en pantalla (23/09/2026, pedido de Arturo: la lista
   plana de 8 "no se ve super bien, u ordenado"). Dos pasos con botones, como
   el simulador: primero el grupo que la persona reconoce; si hace falta, una
   segunda fila (la zona de Esencial, o cuál de los otros planes). Los valores
   van a la URL (?plan=…), así un link compartido abre la guía igual. */
export const GRUPOS_PLAN = [
  { k: 'esencial', label: 'SP Esencial', pregunta: '¿En qué zona es tu plan?', opciones: [
    { v: 'esencial-ac', label: 'Asunción y Central' },
    { v: 'esencial-interior', label: 'Interior' },
    { v: 'esencial-nacional', label: 'Nacional' },
  ] },
  { k: 'silver-gold', label: 'Silver, Gold o Bronze', v: 'silver-gold' },
  { k: 'vital', label: 'Vital', v: 'vital' },
  { k: 'otro', label: 'Otro plan', pregunta: '¿Cuál es tu plan?', opciones: [
    { v: 'bienestar', label: 'Bienestar' },
    { v: 'superior', label: 'Superior' },
    { v: 'integral', label: 'Integral' },
    { v: 'primordial', label: 'Primordial' },
    { v: 'estatal', label: 'Plan Estatal' },
  ] },
];
// Los cuatro planes de la familia de Silver/Gold usan su misma red.
PLANES.push(
  { v: 'bienestar', label: 'Bienestar', red: 'privilege' },
  { v: 'superior', label: 'Superior', red: 'privilege' },
  { v: 'integral', label: 'Integral', red: 'privilege' },
  { v: 'primordial', label: 'Primordial', red: 'privilege' },
);
// A qué grupo pertenece un valor de la URL ("esencial-interior" → "esencial").
export const grupoDePlan = (v) => {
  if (!v) return '';
  if (v === 'otros') return 'otro';
  const g = GRUPOS_PLAN.find((x) => x.v === v || (x.opciones || []).some((o) => o.v === v));
  return g ? g.k : '';
};
// El nombre para mostrar ("SP Esencial · Interior").
export const nombrePlan = (v) => {
  for (const g of GRUPOS_PLAN) {
    if (g.v === v) return g.label;
    const o = (g.opciones || []).find((x) => x.v === v);
    if (o) return g.k === 'esencial' ? `SP Esencial · ${o.label}` : o.label;
  }
  return v === 'otros' ? 'Bienestar, Superior, Integral o Primordial' : '';
};

export const redDePlan = (v) => (PLANES.find((p) => p.v === v) || PLANES[0]).red;

// Chips cortos de "en qué redes está", sin repetir Esencial por zona.
export function redesCortas(r) {
  const out = [];
  for (const k of r) {
    const c = REDES[k] && REDES[k].corto;
    if (c && !out.includes(c)) out.push(c);
  }
  return out;
}

export const norm = (s) =>
  String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

/* Cómo lo dice una familia → cómo figura en la guía. Cada entrada suma
   una forma de encontrar lo mismo; no reemplaza lo que la persona escribió. */
const SINONIMOS = {
  dentista: 'odontologia', odontologo: 'odontologia', odontologa: 'odontologia', muela: 'odontologia', dientes: 'odontologia',
  pediatra: 'pediatria', ninos: 'pediatria', nino: 'pediatria', bebe: 'pediatria',
  ginecologo: 'ginecologia', ginecologa: 'ginecologia', gineco: 'ginecologia', obstetra: 'obstetricia', embarazo: 'obstetricia', parto: 'obstetricia',
  cardiologo: 'cardiologia', cardiologa: 'cardiologia', corazon: 'cardiologia',
  oculista: 'oftalmologia', oftalmologo: 'oftalmologia', oftalmologa: 'oftalmologia', ojos: 'oftalmologia', vista: 'oftalmologia',
  otorrino: 'otorrinolaringologia', oidos: 'otorrinolaringologia', garganta: 'otorrinolaringologia',
  traumatologo: 'traumatologia', traumatologa: 'traumatologia', huesos: 'traumatologia',
  dermatologo: 'dermatologia', dermatologa: 'dermatologia', piel: 'dermatologia',
  psicologo: 'psicologia', psicologa: 'psicologia', terapia: 'psicologia',
  psiquiatra: 'psiquiatria',
  nutricionista: 'nutricion', dieta: 'nutricion',
  kinesiologo: 'fisioterapia', kinesiologia: 'fisioterapia', kine: 'fisioterapia', fisioterapeuta: 'fisioterapia', rehabilitacion: 'fisioterapia',
  analisis: 'laboratorio', sangre: 'laboratorio', lab: 'laboratorio',
  rayos: 'radiografia', placa: 'radiografia',
  eco: 'ecografia', ecografista: 'ecografia',
  resonancia: 'diagnostico por imagen', tomografia: 'diagnostico por imagen', imagenes: 'diagnostico por imagen',
  sanatorio: 'sanatorios', clinica: 'sanatorios', internacion: 'sanatorios', urgencias: 'sanatorios', hospital: 'sanatorios',
  urologo: 'urologia', neurologo: 'neurologia', neurologa: 'neurologia',
  endocrinologo: 'endocrinologia', endocrinologa: 'endocrinologia', tiroides: 'endocrinologia',
  gastro: 'gastroenterologia', gastroenterologo: 'gastroenterologia',
  reumatologo: 'reumatologia', mastologo: 'mastologia', mastologa: 'mastologia',
  cirujano: 'cirugia', cirujana: 'cirugia',
  fono: 'fonoaudiologia', fonoaudiologo: 'fonoaudiologia', fonoaudiologa: 'fonoaudiologia',
  papanicolau: 'pap', colposcopia: 'pap',
  clinico: 'clinica medica', general: 'clinica medica', medico: 'clinica medica',
  diabetes: 'diabetologia', alergia: 'alergologia', alergista: 'alergologia',
  ambulancia: 'ambulancias',
};

// Texto donde se busca: todo lo que una persona puede escribir de un prestador.
// Arranca con un espacio para que cada palabra se pueda buscar por su comienzo.
export function indexar(prestadores) {
  return prestadores.map((p) => ' ' + norm([p.n, p.e, p.c, p.b, p.d, p.dp].join(' ').replace(/[^\p{L}\p{N}]+/gu, ' ')));
}

/* Cada palabra de la búsqueda tiene que ser el comienzo de una palabra del
   prestador: "eco" encuentra Ecografía, pero no "Ecuador" ni "Secondo". Buscar
   por pedazos sueltos devolvía 89 resultados para "eco" — la mayoría, ruido. */
export function coincide(heno, q) {
  const tokens = norm(q).replace(/[^\p{L}\p{N}]+/gu, ' ').split(' ').filter(Boolean);
  return tokens.every((t) => heno.includes(' ' + t) || (SINONIMOS[t] && heno.includes(' ' + SINONIMOS[t])));
}

function distancia(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/* "¿Quisiste decir…?" para cuando no hay resultados: la especialidad, la
   ciudad o el sinónimo más parecido a lo que se escribió ("rezonancia"). */
export function sugerir(prestadores, q) {
  const t = norm(q);
  if (t.length < 4) return null;
  const vocab = new Map();
  for (const p of prestadores) { vocab.set(norm(p.e), p.e); vocab.set(norm(p.c), p.c); }
  for (const k of Object.keys(SINONIMOS)) vocab.set(k, k);
  let mejor = null;
  for (const [n, original] of vocab) {
    for (const cand of [n, ...n.split(' ')]) {
      const d = distancia(t, cand);
      if (d > 0 && d <= (t.length > 6 ? 2 : 1) && (!mejor || d < mejor.d)) mejor = { d, texto: cand === n ? original : cand };
    }
  }
  return mejor && mejor.texto;
}

/* Filtra y ordena. Dentro de cada especialidad, Lister primero — es el centro
   propio, donde la persona tiene la atención más directa — y después A–Z,
   que es el orden en que ya vienen del JSON. */
export function filtrar(prestadores, indice, { q = '', plan = '', esp = '', dp = '', c = '', tipo = '' } = {}) {
  const red = redDePlan(plan);
  const out = [];
  for (let i = 0; i < prestadores.length; i++) {
    const p = prestadores[i];
    if (red && !p.r.includes(red)) continue;
    if (esp && p.e !== esp) continue;
    if (dp && p.dp !== dp) continue;
    if (c && p.c !== c) continue;
    if (tipo && p.t !== tipo) continue;
    if (q && !coincide(indice[i], q)) continue;
    out.push(p);
  }
  return out.sort((a, b) => (a.e === b.e ? (b.l || 0) - (a.l || 0) : 0));
}

// Catálogos para los desplegables, derivados de los mismos datos.
export function catalogos(prestadores) {
  const grupos = {};
  const deptos = {};
  for (const p of prestadores) {
    (grupos[p.g] = grupos[p.g] || new Set()).add(p.e);
    if (p.dp) (deptos[p.dp] = deptos[p.dp] || new Set()).add(p.c);
  }
  const alfa = (a, b) => a.localeCompare(b, 'es');
  const ORDEN_GRUPOS = ['Especialidades médicas', 'Salud infantil', 'Estudios y diagnóstico', 'Salud mental y terapias', 'Centros y servicios'];
  return {
    especialidades: ORDEN_GRUPOS.filter((g) => grupos[g]).map((g) => ({ g, items: [...grupos[g]].sort(alfa) })),
    // Capital y Central primero: es donde está 7 de cada 10 filas de la red.
    departamentos: Object.keys(deptos).sort((a, b) => {
      const w = (x) => (x === 'Capital' ? 0 : x === 'Central' ? 1 : 2);
      return w(a) - w(b) || alfa(a, b);
    }).map((d) => ({ d, ciudades: [...deptos[d]].sort(alfa) })),
  };
}

// "+595 21 208 162" → "+59521208162" para el tel:
export const telHref = (t) => 'tel:' + String(t).replace(/[^\d+]/g, '');

export const mapaHref = (p) =>
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([p.d, p.b, p.c, 'Paraguay'].filter(Boolean).join(', '));

export function iniciales(n) {
  const limpio = String(n).replace(/^(Dra?\.|Lic\.|Prof\.|Od\.)\s*/, '');
  const pal = limpio.split(/\s+/).filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w));
  return ((pal[0] || '')[0] || '') + (pal.length > 1 ? pal[pal.length - 1][0] : '');
}

/* Las condiciones de la planilla, en el idioma de la persona (23/09/2026).
   - "Atiende desde los 12 años" se leía ambiguo (¿12 años de qué?): es la
     edad mínima del paciente. Se dice "a pacientes desde los 12 años de edad".
   - Las que listan planes ("Exclusivo para planes … Privilege", "Excepto los
     centralizados, Lister, essential…") nombran planes internos y además
     repiten lo que ya dice "Lo usás con estos planes". Se reemplazan por una
     sola frase que manda a confirmar. */
const DE_PLANES = /planes|privilege|essential|centraliz|habilitado/i;
export function condicionTexto(k) {
  if (!k) return '';
  const out = [];
  for (const parte of k.split(';').map((s) => s.trim()).filter(Boolean)) {
    let t = parte;
    if (DE_PLANES.test(t)) t = 'Confirmá con tu asesor si atiende con tu plan';
    else if (/^Atiende desde/i.test(t)) t = t.replace(/^Atiende desde (los )?/i, 'Atiende a pacientes desde $1') + ' de edad';
    else if (/^Solo estudios$/i.test(t)) t = 'Solo hace estudios';
    else if (/^Estudios$/i.test(t)) t = 'Hace estudios';
    else if (/^Arancel preferencial$/i.test(t)) t = 'Precio preferencial';
    if (!out.includes(t)) out.push(t);
  }
  return out.join(' · ') + '.';
}
