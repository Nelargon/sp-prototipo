/* Salud Protegida — shared quote/simulator logic and contact constants.
   Pure functions (no React) used by both the home page and the /simulador route.

   Precios y coberturas REALES: Essential / Silver / Gold y Plan Vital
   (senior 65+). Fuente: datos/planes-vigentes/*.json, tomados de los
   cuadernillos y tarifarios oficiales. Primas con IVA incluido.
   Essential reemplazó a Bronze el 24/09/2026 (Arturo: "El plan Bronze ha
   quedado obsoleto; ya no se comercializa"). Silver y Gold son de la gama
   que internamente se llama "Privilege" (nunca de cara al cliente).
   Contenido temporal hasta que exista la gama nueva (Esencial / Integral /
   Premium). ⚠ Essential NO es el "Esencial" de esa gama: es un plan vigente
   desde hace años (Arturo, 25/09/2026). La clave interna `nivel: 'esencial'`
   es vieja y hoy quiere decir Essential. */

import { DEPT_AJUSTE } from './geo';
import { coverage } from './coverage';

/* Salud Protegida contact. One number for WhatsApp, urgencias and phone.
   WHATSAPP_NUMBER is used for every wa.me link; SP_TEL for tel: (call) links. */
export const WHATSAPP_NUMBER = '595 21 319 0000';
export const SP_PHONE_DISPLAY = '(021) 319 0000';
export const SP_TEL = '+595213190000';
/* Ambulancias públicas del Ministerio de Salud (SEME): línea gratuita 141. Es
   el segundo número de la línea de emergencias de la Guía Médica, para cuando
   el de SP no atiende (Arturo, 04/10/2026). Fuente: mspbs.gov.py, «SEME brinda
   cobertura en eventos masivos ante emergencias», 01/12/2025 («llamando a la
   línea gratuita 141»). Antes (2016) se marcaba 021-141 desde el celular; desde
   2019 el Ministerio dice 141 desde cualquier teléfono. */
export const SEME_TEL = '141';

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
  'Gs. ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/* LA FUENTE DE LOS PRECIOS (23/10/2026). Arturo: «Si no coincide el simulador
   con el archivo de Drive, el archivo de Drive gana.» El archivo es «9 octubre
   2026 TABLA DE PRECIOS.pdf», en su Drive: carpeta «Fuente de Planes -
   Productos - Guia» (1OB7DQnzbVLcDsh1E5h1m9VuUBo9ACess) → «Fuentes PDF» →
   «Precios» (fileId 1qyh9LBvhzR4JpA9kTFswk5OOxo5_HBG2). Tabla del 09/10/2026,
   IVA incluido. La transcripción, con lo que es dato y lo que es regla
   deducida, está en datos/planes-vigentes/silver.json, gold.json y
   essential.json; qa/precios.mjs controla el motor contra los ejemplos de la
   tabla. Vital no cambió (283.000 con débito, 312.000 particular).

   SILVER Y GOLD. DATO DE LA TABLA: las cifras de abajo. Tramos de titular y de
   cónyuge, 0-54 / 55-64 / 65-69 / 70-99; de adherente, 0-20 / 21-54 / 55-64 /
   65-69 / 70-99. Los 70+ son SOLO DE RENOVACIÓN, no de venta nueva (lo dice la
   tabla): el resultado lo avisa (aviso70) y el precio queda de referencia.
   solo: titular sin adherente · conyuge: cónyuge · adh: adherente con
   parentesco (hijo, hermano, nieto, padre, madre, suegro/a, sobrino), cada uno
   · hijo3: hijo adicional de 0 a 20, desde el 3º · pkg: grupo familiar
   titular + cónyuge + 2 hijos de hasta 20 (T-C hasta 59 / 60-64).
   Las cifras por categoría son las mismas que en julio (salvo cónyuge 70+, que
   ahora llega a 99). Lo que cambió son los ejemplos «GRUPOS» de la tabla, y con
   ellos la regla de priceFor: el sitio cobraba al titular la tarifa de cónyuge
   en cuanto había una segunda persona (pareja de 30: 456.000 en Silver); la
   tabla del 09/10 dice 552.000 (324.000 + 228.000). */
// Bronze salió de la venta el 24/09/2026; su tarifa queda en bronce.json.
const TARIFAS = {
  silver: { solo: [324000, 420000, 570000, 741000], conyuge: [228000, 330000, 430000, 684000], adh: [172000, 226000, 300000, 430000, 684000], hijo3: 140000, pkg: [770000, 1000000] },
  gold: { solo: [432000, 560000, 680000, 884000], conyuge: [324000, 440000, 540000, 816000], adh: [238000, 324000, 420000, 540000, 816000], hijo3: 180000, pkg: [990000, 1300000] },
};
/* ESSENTIAL — precio POR ZONA (datos/planes-vigentes/essential.json). Misma
   tabla del 09/10/2026, pero ahí Essential es una IMAGEN dentro del PDF: el
   texto que extrae Drive no la ve (BITACORA, «El texto extraído no es el
   documento»). Cifras transcriptas de la captura que pasó Arturo el
   23/10/2026. Otra estructura que Silver y Gold: sin tramos por edad salvo el
   de la pareja, y una fila por grupo.
   DATO DE LA TABLA, por zona:
   titular: titular de 0 a 64 · menor: adherente de 0 a 20, cada uno ·
   adh21_35: adherente de 21 a 35, cada uno (nuevo: antes un hijo de más de 20
   no tenía tarifa) · pareja: pareja matrimonial, o titular y adherente
   adulto, por el mayor de los dos (18-45 / 46-64): son dos filas de la tabla
   con las mismas cifras · unoMasDos: titular de 18 a 64 + 2 adherentes de 0 a
   20 (nuevo) · dosMasUno: titular y adherente de 18 a 64 + 1 adherente de 0 a
   20 (nuevo) · grupo: titular y adherente de 18 a 64 + 2 adherentes de 0 a 20.
   ⚠ Rareza que la tabla trae y el sitio no corrige (Drive gana): una pareja de
   46 a 64 sola paga más (475.000 en Asunción) que con un hijo (415.000). Va
   como pregunta para SP en el PR. */
const ESSENTIAL = {
  asuncion_central: { titular: 265000, menor: 110000, adh21_35: 150000, pareja: [395000, 475000], unoMasDos: 415000, dosMasUno: 415000, grupo: 550000 },
  interior: { titular: 220000, menor: 92000, adh21_35: 125000, pareja: [330000, 400000], unoMasDos: 345000, dosMasUno: 345000, grupo: 460000 },
  nacional: { titular: 305000, menor: 125000, adh21_35: 170000, pareja: [455000, 545000], unoMasDos: 475000, dosMasUno: 475000, grupo: 635000 },
};
/* Hasta qué edad se carga un hijo en el simulador: 35, el último tramo de
   hijo con tarifa en los tres planes (Essential, adherente de 21 a 35; Silver
   y Gold, adherente de 21 a 54). Era 25 desde septiembre; con la tabla del
   09/10, un hijo de 26 a 35 tiene precio en Essential y no se podía cargar. */
export const EDAD_MAX_HIJO = 35;
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

/* Quién no tiene tarifa en Essential (tabla del 09/10/2026): adultos de más de
   64 (el titular y el adherente adulto llegan hasta 64), hijos de más de 35 (el
   último tramo de adherente es de 21 a 35) y un tercer adulto de más de 35 (la
   tabla tiene filas para dos adultos; un tercero solo entra como adherente,
   hasta 35). Devuelve el motivo, en el idioma de la persona, o null si el grupo
   entra. */
export const essentialNoAplica = (people) => {
  const adultos = people.filter((p) => p.kind !== 'kid');
  const hijos = people.filter((p) => p.kind === 'kid');
  if (adultos.some((p) => p.age > 64)) return 'Essential es para personas de hasta 64 años.';
  if (hijos.some((p) => p.age > 35)) return 'En Essential los hijos entran hasta los 35 años.';
  if (adultos.slice(2).some((p) => p.age > 35)) return 'En Essential, un tercer adulto entra solo hasta los 35 años.';
  return null;
};

/* Precio de un grupo en Essential (tabla del 09/10/2026). La tabla no trae
   ejemplos de grupos: tiene una fila por grupo. Lo que dice una fila es DATO;
   lo marcado «inferencia» lo arma el motor con las filas que hay, y está
   anotado en essential.json («reglas_de_grupo»):
   - 1 adulto solo → titular. 1 adulto + 1 hijo de 0 a 20 → titular + 1
     adherente de 0 a 20 (inferencia: la tabla no tiene esa fila).
   - 1 adulto + 2 hijos de 0 a 20 → su fila (unoMasDos); desde el 3º, + 1
     adherente de 0 a 20 cada uno (inferencia).
   - 2 adultos sin hijos de 0 a 20 → pareja, por el mayor de los dos (18-45 /
     46-64). 2 adultos + 1 hijo → su fila (dosMasUno). 2 adultos + 2 hijos →
     grupo; desde el 3º, + 1 adherente de 0 a 20 cada uno (inferencia).
   - Cada hijo de 21 a 35 paga aparte el adherente de 21 a 35, y no cuenta para
     las filas de grupo, que son con hijos de 0 a 20 (inferencia).
   - Un tercer adulto paga aparte como adherente por su edad: hasta 20, el de 0
     a 20; de 21 a 35, el de 21 a 35 (inferencia). */
const adhEssential = (T, edad) => (edad <= 20 ? T.menor : T.adh21_35);
const priceEssential = (zona, people) => {
  const T = ESSENTIAL[zona];
  const adultos = people.filter((p) => p.kind !== 'kid');
  const menores = people.filter((p) => p.kind === 'kid' && p.age <= 20).length;
  const aparte = people.filter((p) => p.kind === 'kid' && p.age > 20).concat(adultos.slice(2))
    .reduce((s, p) => s + adhEssential(T, p.age), 0);
  const extra = (desde) => Math.max(0, menores - desde) * T.menor;
  if (adultos.length <= 1) {
    if (menores >= 2) return T.unoMasDos + extra(2) + aparte;
    return T.titular + menores * T.menor + aparte;
  }
  if (menores >= 2) return T.grupo + extra(2) + aparte;
  if (menores === 1) return T.dosMasUno + aparte;
  const mayor = Math.max(adultos[0].age, adultos[1].age);
  return T.pareja[mayor <= 45 ? 0 : 1] + aparte;
};

const VITAL_PRECIO = 283000; // titular 65+, costo con débito automático
const VITAL_PARTICULAR = 312000; // titular 65+, costo particular

/* 10% de descuento pagando con débito automático o tarjeta de crédito.
   La confirmación del usuario (17/07/2026) fue para el tarifario Privilege:
   bronce.json, silver.json y gold.json («descuento_debito_automatico»).
   Essential tiene su propia lista de precios y ninguna fuente dice si lleva el
   descuento (sp-interno#80). Decisión 2A de Arturo (13/10/2026): hasta que SP
   conteste, el sitio no le calcula a Essential un precio con descuento y manda
   a preguntarle al asesor. Las primas del tarifario Privilege son el precio
   particular; Vital publica ambas columnas. */
export const AUTO_PAY_DISCOUNT = 0.10;

// Tramo de titular y de cónyuge: 0-54 / 55-64 / 65-69 / 70-99. Tramo de
// adherente: 0-20 / 21-54 / 55-64 / 65-69 / 70-99 (tabla del 09/10/2026).
const bracket = (a) => (a <= 54 ? 0 : a <= 64 ? 1 : a <= 69 ? 2 : 3);
const bracketAdh = (a) => (a <= 20 ? 0 : a <= 54 ? 1 : a <= 64 ? 2 : a <= 69 ? 3 : 4);

// `nivel` es la clave interna del simulador; `short.toLowerCase()` es la clave
// pública del `?plan=` del comparador. Ambas viven ACÁ (fuente única): el botón y
// el simulador derivan de este mismo array, así el puente no se puede desincronizar.
// LAS LÍNEAS DE LAS TARJETAS (29/09/2026, lámina 65, opción 1 de Arturo): los
// MISMOS cinco temas y en el mismo orden en los tres planes, para comparar
// leyendo de lado a lado. Lo que cambia va entre `**`: /que-cubre lo pone en
// negrita. Salieron urgencias y laboratorio/radiografías/fisioterapia de
// Essential (siguen en el buscador y el comparador del home). La odontología
// volvió a pedido de Arturo (29/09): es lo que Essential tiene y Silver y Gold
// no. ⚠ LAS ESPERAS NO VAN EN ESTAS TARJETAS (Arturo, 03/10/2026): el 29/09 se
// había sumado «Espera para internarte» y se sacó. No es esconderlas: se dicen
// antes de la firma en otros momentos (detalle, simulador, cotización), no al
// principio como gancho. Mapa en HANDOFF («Reparto de páginas de planes»).
// ⚠ «Por persona» salió de la tomografía y la resonancia de Silver y Gold el
// 13/10/2026 (decisión 2A de Arturo): la grilla dice «por año de contrato» y no
// «por beneficiario». «Persona» vuelve si SP confirma que es para cada uno
// (sp-interno#110). La espera de la tomografía de Gold también salió de su
// línea: va en el cuadro de esperas (regla del 03/10).
// LA FORMA CORTA (P3, opción A: regla de escaneo de Arturo del 13/10/2026,
// elegida el 17/10 con «Todo A»): en la tomografía, la resonancia y la
// internación, la línea dice cuántas, para quién y cada cuánto con barras,
// igual en las tres tarjetas. Los números salen de `corta` en coverage.js, no se
// escriben acá (sp-interno#117): Essential dice «familia», porque está escrito
// en su cuadernillo; Silver y Gold, «¿quién?» (QUIEN_SG) donde la fuente no dice
// para quién; la internación lo tiene escrito en las tres («persona» en Silver y
// Gold: «por beneficiario»). Sin «hasta»: un tope ya es un máximo.
// En Essential, los 2 son estudios compartidos entre tomografía, ecocardiograma y
// ergometría (cuadernillo 3.2, essential.json; sp-interno#113): la línea no dice
// «2 tomografías», dice «2 estudios» y cuáles. ComparativaCelular dibuja cada
// forma corta con su frase completa para los lectores de pantalla.
const nombrar = (t, cosa) => t.replace(/^([^/]+)/, '$1 ' + cosa); // «2/familia/año» → «2 tomografías/familia/año»
const lineasCortas = (i) => {
  const c = Object.fromEntries(coverage().map((s) => [s.name, s.corta]));
  const tom = i === 0
    ? nombrar(c['Tomografía (TAC)'][0], 'estudios') + ' (tomografía, ecocardiograma o ergometría)'
    : nombrar(c['Tomografía (TAC)'][i], 'tomografías');
  return { estudios: 'Tomografía y resonancia: ' + tom + ' y ' + nombrar(c['Resonancia (RM)'][i], 'resonancia'), internacion: c['Internación'][i] };
};
export const plans = () => {
  const [e, s, g] = [0, 1, 2].map(lineasCortas);
  return [
    // Essential: el "desde" es el precio más bajo de sus tres zonas (Interior).
    { name: 'Plan Essential', short: 'Essential', nivel: 'esencial', price: ESSENTIAL.interior.titular, color: 'var(--sp-plan-essential)', tag: 'Para empezar a cuidarte, al precio de tu zona',
      lines: ['Consultas: **sin tope en Lister**, y hasta 3 por mes en la red', e.estudios, 'Internación: **habitación privada**, ' + e.internacion, 'Terapia intensiva: **hasta 2 días** al año', 'Odontología: **sin costo, solo en Lister**: consulta, controles, extracciones simples y limpieza'] },
    { name: 'Plan Silver', short: 'Silver', nivel: 'equilibrio', price: TARIFAS.silver.solo[0], color: 'var(--sp-plan-silver)', tag: 'El equilibrio entre precio y cobertura',
      lines: ['Consultas: **sin tope en la mitad** de las especialidades, 5 o 6 al año en el resto', s.estudios, 'Internación: **semi-suite**, ' + s.internacion, 'Terapia intensiva: **hasta 5 días** al año', 'Odontología: **la atención del dentista no entra**'] },
    { name: 'Plan Gold', short: 'Gold', nivel: 'amplia', price: TARIFAS.gold.solo[0], color: 'var(--sp-plan-gold)', tag: 'La cobertura más amplia',
      lines: ['Consultas: **sin tope anual** en casi todas las especialidades', g.estudios, 'Internación: **semi-suite**, ' + g.internacion, 'Terapia intensiva: **hasta 6 días** al año', 'Odontología: **la atención del dentista no entra**'] },
  ];
};

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

/* Precio de un grupo en Silver o Gold (tabla del 09/10/2026). La tabla da las
   tarifas por categoría y 7 ejemplos «GRUPOS» por plan, pero no escribe la
   regla. ESTA REGLA ES DEDUCIDA, y reproduce los 7 ejemplos de los dos planes
   (14 de 14; qa/precios.mjs):
   - el titular paga SIEMPRE «titular solo» por su edad, aunque no esté solo
     (antes pagaba la de cónyuge en cuanto había otra persona);
   - el cónyuge (el segundo adulto) paga «cónyuge» por su edad;
   - cada hijo de 0 a 20 paga el adherente de 0 a 20, y desde el 3º, «hijo
     adicional», haya cónyuge o no (titular + 3 hijos: 808.000 en Silver);
   - cada hijo de 21 o más paga el adherente por su edad, y no cuenta para el
     grupo familiar ni como 3º hijo; un tercer adulto también paga adherente
     por su edad;
   - titular + cónyuge, los dos de hasta 64, con 2 hijos o más de 0 a 20 →
     prima de grupo familiar por la edad del mayor (hasta 59 / 60-64), «hijo
     adicional» desde el 3º, y los adherentes de 21 o más, aparte.
   Inferencia que ningún ejemplo prueba: el titular es la primera persona del
   simulador («Vos»), y la segunda es el cónyuge. Si el mayor de los dos fuera
   el titular, el total podría cambiar unos miles. */
const priceFor = (planKey, people) => {
  const T = TARIFAS[planKey];
  const adults = people.filter((p) => p.kind !== 'kid');
  const menores = people.filter((p) => p.kind === 'kid' && p.age <= 20).length;
  const adherentes = people.filter((p) => p.kind === 'kid' && p.age > 20).concat(adults.slice(2))
    .reduce((s, p) => s + T.adh[bracketAdh(p.age)], 0);
  const [titular, conyuge] = adults;
  if (titular && conyuge && menores >= 2) {
    const mayor = Math.max(titular.age, conyuge.age);
    if (mayor <= 64) return T.pkg[mayor <= 59 ? 0 : 1] + (menores - 2) * T.hijo3 + adherentes;
  }
  let total = titular ? T.solo[bracket(titular.age)] : 0;
  if (conyuge) total += T.conyuge[bracket(conyuge.age)];
  total += Math.min(menores, 2) * T.adh[0] + Math.max(0, menores - 2) * T.hijo3;
  return total + adherentes;
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
    silver: { name: base[1].name, color: base[1].color, why: 'El equilibrio con respaldo de verdad: más días de terapia intensiva y topes más altos.' },
    // Sin «los topes más altos» (8A, Arturo, 20/10/2026, sp-interno#189): si vale
    // la grilla, Gold tiene menos fisioterapia que Silver; lo aclara SP (#50).
    gold: { name: base[2].name, color: base[2].color, why: 'La cobertura más amplia: consultas sin tope en casi todas las especialidades y más días de internación.' },
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
  /* Desde los 70, la tarifa de Silver y Gold es SOLO de renovación: no se
     contratan nuevos (datos/planes-vigentes/*.json, "solo_renovacion"). El
     precio se muestra como referencia y el resultado lo dice (auditoría del
     25/09/2026). */
  const aviso70 = (best === 'silver' || best === 'gold') && ppl.some((p) => p.kind !== 'kid' && p.age >= 70)
    ? 'Desde los 70 años, Silver y Gold solo se renuevan: no se contratan nuevos. Para esa edad está Plan Vital.'
    : null;
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
     Vital ya publica el precio con débito → mostramos el particular como referencia.
     Essential, sin descuento calculado hasta que SP diga si lo lleva
     (sp-interno#80, decisión 2A): el resultado manda a preguntarle al asesor. */
  const autoPay = best === 'vital' || best === 'essential' ? null : Math.round(price * (1 - AUTO_PAY_DISCOUNT));
  const vitalParticular = best === 'vital' ? VITAL_PARTICULAR * nAdultos : null;
  return {
    key: best, name: P[best].name, color: P[best].color, why: P[best].why,
    geoLabel: zonaEss ? ZONA_ESSENTIAL[zonaEss] : ubi ? 'Nacional' : (GL[d.geo] || ''), ubi, price, autoPay, vitalParticular,
    zonaEss, essentialNoAplica: noAplica, aviso70,
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
    { k: 'equilibrio', label: 'Un equilibrio entre precio y cobertura', note: 'Más días de terapia intensiva y topes más altos.' },
    // Gold, sin «los topes más altos» (8A, 20/10/2026, sp-interno#189), como su porqué.
    { k: 'amplia', label: 'La cobertura más amplia posible', note: 'Consultas sin tope en casi todas las especialidades y más días de internación y terapia intensiva.' },
  ],
  /* geo: reemplazado por el buscador de ciudades (app/geo.js) — el paso
     "¿Dónde querés tu cobertura?" ya no usa opciones fijas (HANDOFF 11h). */
  addons: [],
});

export const why = () => ({
  who: 'Así armamos un plan a la medida de quienes querés cuidar.',
  edades: 'La edad define el precio. Con este dato te damos el precio de lista real, no un estimado al voleo.',
  nivel: 'No todos necesitan lo mismo. Te mostramos el plan que mejor equilibra lo que te importa y lo que querés pagar.',
  geo: 'Con tu ciudad te mostramos la red que te queda cerca. En Essential, además, define el precio: Asunción y Central tienen uno y el interior otro.',
  addons: '',
  contacto: 'Te mostramos tu precio ahora. Te pedimos estos datos para que un asesor lo confirme y te acompañe, sin compromiso.',
});
