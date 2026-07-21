/* Salud Protegida — índice geográfico de Paraguay para el paso "¿Dónde
   querés tu cobertura?" del simulador (HANDOFF 11h, jul 2026).

   Por qué existe: la reunión MKT/Ventas del 20 jul 2026 mostró que las
   ventas se pierden por CIUDAD ("Filadelfia"), no por "interior", y que la
   estrategia a 3 años pone precio por zona. La persona escribe su ciudad;
   el departamento se resuelve solo. Cada elección alimenta la demanda por
   ciudad (eventos sim_zona / sim_zona_sin_lista, ANEXO §2) — la
   contraparte web del etiquetado de pérdidas en HubSpot.

   Los datos son geografía pública (departamentos y municipios principales,
   nombres como los dice la gente). NO es un mapa de cobertura: la red real
   por ciudad es el pendiente B del HANDOFF — hasta que llegue, la única
   zona con red confirmada de forma pública es Asunción/Central (Lister +
   sedes SP) y el resto se comunica como "un asesor te confirma la red".

   Precio: el tarifario vigente es NACIONAL. DEPT_AJUSTE deja el motor
   price-ready para el día que la mesa técnica defina precio por
   departamento — hoy todos los factores son 1 (neutro). */

export const DEPARTAMENTOS = [
  { id: 'asuncion', nombre: 'Asunción', capital: true, ciudades: ['Asunción'] },
  { id: 'central', nombre: 'Central', ciudades: ['San Lorenzo', 'Luque', 'Capiatá', 'Lambaré', 'Fernando de la Mora', 'Limpio', 'Ñemby', 'Mariano Roque Alonso', 'Itauguá', 'Villa Elisa', 'San Antonio', 'Areguá', 'Itá', 'Guarambaré', 'Ypacaraí', 'Ypané', 'Villeta', 'Nueva Italia', 'J. Augusto Saldívar'] },
  { id: 'alto_parana', nombre: 'Alto Paraná', ciudades: ['Ciudad del Este', 'Presidente Franco', 'Hernandarias', 'Minga Guazú', 'Santa Rita', 'Juan León Mallorquín', 'San Alberto', 'Itakyry'] },
  { id: 'itapua', nombre: 'Itapúa', ciudades: ['Encarnación', 'Coronel Bogado', 'Hohenau', 'Obligado', 'Bella Vista Sur', 'Natalio', 'María Auxiliadora', 'Fram', 'Capitán Miranda'] },
  { id: 'caaguazu', nombre: 'Caaguazú', ciudades: ['Coronel Oviedo', 'Caaguazú', 'Campo 9', 'Repatriación', 'Yhú'] },
  { id: 'cordillera', nombre: 'Cordillera', ciudades: ['Caacupé', 'Tobatí', 'Eusebio Ayala', 'Piribebuy', 'Atyrá', 'Altos', 'Emboscada', 'Arroyos y Esteros'] },
  { id: 'paraguari', nombre: 'Paraguarí', ciudades: ['Paraguarí', 'Carapeguá', 'Yaguarón', 'Pirayú', 'Quiindy', 'Sapucai'] },
  { id: 'guaira', nombre: 'Guairá', ciudades: ['Villarrica', 'Independencia', 'Mbocayaty'] },
  { id: 'caazapa', nombre: 'Caazapá', ciudades: ['Caazapá', 'San Juan Nepomuceno', 'Yuty'] },
  { id: 'san_pedro', nombre: 'San Pedro', ciudades: ['San Estanislao', 'San Pedro de Ycuamandyyú', 'Guayaibí', 'Choré', 'General Resquín'] },
  { id: 'concepcion', nombre: 'Concepción', ciudades: ['Concepción', 'Horqueta', 'Yby Yaú', 'Loreto'] },
  { id: 'amambay', nombre: 'Amambay', ciudades: ['Pedro Juan Caballero', 'Bella Vista Norte', 'Capitán Bado'] },
  { id: 'canindeyu', nombre: 'Canindeyú', ciudades: ['Salto del Guairá', 'Curuguaty', 'Katueté', 'La Paloma'] },
  { id: 'misiones', nombre: 'Misiones', ciudades: ['San Juan Bautista', 'San Ignacio', 'Ayolas', 'Santa Rosa', 'Santiago'] },
  { id: 'neembucu', nombre: 'Ñeembucú', ciudades: ['Pilar', 'Alberdi'] },
  { id: 'pte_hayes', nombre: 'Presidente Hayes', chaco: true, ciudades: ['Villa Hayes', 'Benjamín Aceval', 'Nanawa', 'Pozo Colorado'] },
  { id: 'boqueron', nombre: 'Boquerón', chaco: true, ciudades: ['Filadelfia', 'Loma Plata', 'Neuland', 'Mariscal Estigarribia'] },
  { id: 'alto_paraguay', nombre: 'Alto Paraguay', chaco: true, ciudades: ['Fuerte Olimpo', 'Carmelo Peralta', 'Bahía Negra', 'Puerto Casado'] },
];

/* Cómo la dice la gente → cómo está en el índice. */
const ALIASES = {
  'cde': 'Ciudad del Este', 'ciudad del este': 'Ciudad del Este',
  'pjc': 'Pedro Juan Caballero', 'pedro juan': 'Pedro Juan Caballero',
  'santani': 'San Estanislao', 'santaní': 'San Estanislao',
  'asu': 'Asunción', 'asuncion capital': 'Asunción',
  'campo nueve': 'Campo 9', 'dr. juan eulogio estigarribia': 'Campo 9',
  'fernando': 'Fernando de la Mora', 'mra': 'Mariano Roque Alonso',
  'salto': 'Salto del Guairá', 'encarna': 'Encarnación',
};

/* Ajuste de precio por departamento — HOY NEUTRO (el tarifario vigente es
   nacional). Cuando la mesa técnica defina precio por zona (estrategia a 3
   años, reunión 20 jul 2026), se cargan los factores acá y el motor los
   aplica sin retrabajo. */
export const DEPT_AJUSTE = Object.fromEntries(DEPARTAMENTOS.map((d) => [d.id, 1]));

/* Nota de red para el resultado. SOLO Asunción/Central tienen texto de zona
   con red confirmada públicamente (Lister + sedes SP). El resto usa el texto
   honesto por defecto hasta que llegue la base real de prestadores
   (pendiente B del HANDOFF) — ahí se carga la nota por departamento. */
const RED_CONFIRMADA = new Set(['asuncion', 'central']);
export const zonaConRed = (deptId) => RED_CONFIRMADA.has(deptId);
export const redNota = (ubi) => {
  if (!ubi) return '';
  if (RED_CONFIRMADA.has(ubi.deptId)) return 'Estás en la zona con más red: Lister y los prestadores de Central. Tu asesor te pasa la lista exacta con la cotización.';
  return 'En ' + (ubi.ciudad || ubi.deptNombre) + ' la red está creciendo — tu pedido nos ayuda a priorizarla. Tu asesor te confirma los prestadores más cercanos.';
};

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

const INDEX = (() => {
  const out = [];
  for (const d of DEPARTAMENTOS) for (const c of d.ciudades) out.push({ ciudad: c, deptId: d.id, deptNombre: d.nombre, n: norm(c) });
  return out;
})();

/* Búsqueda tolerante: alias → prefijo → contiene. Devuelve hasta 6. */
export const buscarCiudad = (q) => {
  const nq = norm(q);
  if (nq.length < 2) return [];
  const alias = ALIASES[nq];
  const hits = [];
  const push = (e) => { if (!hits.some((h) => h.ciudad === e.ciudad && h.deptId === e.deptId)) hits.push(e); };
  if (alias) { const e = INDEX.find((x) => x.ciudad === alias); if (e) push(e); }
  for (const e of INDEX) { if (e.n.startsWith(nq)) push(e); if (hits.length >= 6) return hits; }
  for (const e of INDEX) { if (e.n.includes(nq)) push(e); if (hits.length >= 6) return hits; }
  return hits;
};

/* Ciudades de un departamento (para el fallback "elegí tu departamento"
   y para mostrar "estas ciudades son de tu zona"). */
export const ciudadesDe = (deptId) => {
  const d = DEPARTAMENTOS.find((x) => x.id === deptId);
  return d ? d.ciudades : [];
};
