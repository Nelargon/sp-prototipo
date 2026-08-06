#!/usr/bin/env node
/**
 * Genera `lib/prestaciones.json` — el índice buscable de /planes — a partir de
 * la grilla oficial `datos/planes-vigentes/grilla-coberturas-precios-jul2026.json`.
 *
 * Por qué existe: la grilla cruda pesa 394 KB y está en el vocabulario del
 * tarifario (ALL CAPS, "RMN", "TAC", ", SANGRE"). El buscador necesita lo
 * contrario: liviano y en el idioma en que una familia escribe ("resonancia",
 * "placa", "análisis de sangre"). Este script hace las dos traducciones.
 *
 * El índice cubre las TRES cosas que alguien pregunta, no solo los cuadros:
 *   e — estudios, análisis y cirugías (los 4 cuadros del master, 935 filas)
 *   c — consultas por especialidad (43 especialidades)
 *   x — lo que no cubre ningún plan (las exclusiones reales)
 * Sin (c) y (x) el buscador devuelve CERO para "psicólogo" o "muela", y un cero
 * en una página de transparencia se lee como "no lo cubre" — que en el caso de
 * psicología sería falso (está cubierta: 3/5/6 sesiones). El silencio miente.
 *
 * Se corre a mano cuando cambia la grilla (ver datos/planes-vigentes/README.md)
 * y el resultado SE COMMITEA: es diffeable, así una re-ingesta muestra en el PR
 * exactamente qué cobertura se movió. No se corre en el build para que un
 * cambio de datos nunca entre a producción sin pasar por un diff.
 *
 *   node scripts/build-prestaciones.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'datos/planes-vigentes/grilla-coberturas-precios-jul2026.json');
const OUT = join(ROOT, 'lib/prestaciones.json');

/* Códigos de cobertura, ordenados por "cuánto pone el socio": de nada (0) a
   todo (4). 5 = no lo cubre ningún plan. -1 = la grilla no lo declara para ese
   plan (ver NOTA DE HUECOS al final del script). */
const COB = { CT: 0, COP: 1, CP: 2, 'CP-COP-CT*': 3, AD: 4, EXCL: 5 };

/* Variantes de escritura del master que significan lo mismo. Se mapean acá,
   explícito y a la vista, en vez de normalizar en silencio: si mañana aparece
   un código nuevo, el script CORTA (ver `celda`) en vez de adivinar.
   · "100%" → CT: una sola fila (ESTERNON 1 POSICION, Silver). Verificado en el
     master: sus tres filas hermanas (2/3/4 POSICIONES) dicen CT con la misma
     cantidad y la misma carencia. Es tipeo, no una cobertura distinta. */
const VARIANTES = { '100%': 'CT' };

/* Los cuatro cuadros del master, con el nombre que ve el usuario. "Estudio",
   "análisis", "cirugía" — nunca "prestación" (regla de lenguaje, CLAUDE.md). */
const CUADROS = {
  laboratorio: { k: 'lab', label: 'Análisis de laboratorio' },
  estudios_e_imagenes: { k: 'img', label: 'Estudios e imágenes' },
  cirugias_e_internacion: { k: 'cir', label: 'Cirugías e internación' },
  fisioterapia: { k: 'fis', label: 'Fisioterapia' },
};

/* Sinónimos en idioma de familia. La clave es lo que dice la grilla; el valor,
   lo que la gente escribe en un buscador. Sin esto, alguien que busca
   "resonancia" no encuentra nada: las 22 resonancias se llaman "RMN DE …".
   Cada entrada se verifica contra la grilla al final (ver `huerfanos`): un
   sinónimo que no matchea nada es peso muerto o señal de que la grilla cambió.
   Ojo con los \b: sin ellos "LIPIDO" matchea ANTIFOSFOLIPIDO y "TOMOGRAFIA"
   matchea ORTOPANTOMOGRAFIA — falsos positivos que ensucian el primer
   resultado, que es el único que casi todos leen. */
const SINONIMOS = [
  // Familias de imágenes — el caso que rompe la búsqueda si falta
  [/\bRMN|\bRESONANCIA/, 'resonancia magnetica rmn'],
  [/\bTAC\b|\bTAC-|\bTOMOGRAFIA|\bUROTAC\b/, 'tomografia tac computada escaner'],
  [/\bECOGRAFIA|\bECODOPPLER|\bDOPPLER/, 'ecografia eco ultrasonido'],
  [/\bMAMOGRAFIA/, 'mamografia mama pecho'],
  [/\bDENSITOMETRIA/, 'densitometria huesos osteoporosis'],
  [/\bCENTELLOGRAFIA|\bCINTIGRAFIA/, 'centellografia medicina nuclear'],
  [/\bESPIROMETRIA|\bBRONCOSCOPIA/, 'pulmon respiracion soplido'],
  [/\bELECTROCARDIOGRAMA|\bECOCARDIOGRAMA|\bERGOMETRIA|\bHOLTER/, 'corazon electro'],
  [/\bENDOSCOPIA|\bCOLONOSCOPIA|\bGASTROSCOPIA/, 'endoscopia camara estomago intestino'],
  // Órganos y motivos, en la palabra de la casa
  [/\bCOLECIST|VESICULA/, 'vesicula piedras'],
  [/\bAPENDIC/, 'apendice apendicitis'],
  [/\bHERNI/, 'hernia'],
  [/\bCESAREA|\bPARTO\b|\bOBSTETR|PERINATAL|\bEMBARAZ|\bGESTACION/, 'parto cesarea embarazo bebe maternidad'],
  [/\bPROSTAT/, 'prostata'],
  [/\bTIROID|\bTSH\b|\bT4\b|\bT3\b/, 'tiroides'],
  [/\bCOLESTEROL|\bTRIGLICERID|\bLIPIDO|\bLIPIDICO/, 'colesterol grasa'],
  [/\bGLUCOSA|GLICOSILADA|\bGLICEMIA/, 'azucar diabetes glucemia'],
  [/\bPAPANICOLAU|\bPAP\b/, 'papanicolau pap cuello uterino'],
  [/\bHEMOGRAMA|\bHEMATOCRITO/, 'hemograma sangre analisis de rutina'],
  [/\bCATARATA|\bCRISTALINO|\bRETINA|\bOFTALM/, 'ojo vista'],
  [/\bAMIGDAL/, 'amigdalas anginas garganta'],
  [/\bCADERA|\bRODILLA|\bTOBILLO|\bHOMBRO|\bCOLUMNA|\bFRACTURA|\bTRAUMATOL/, 'hueso traumatologia golpe'],
  [/\bUTERO|\bOVARIO|\bGINECOL|\bMASTOLOG/, 'ginecologia mujer'],
  // RINON sin ñ: `paraMatch` pasa por NFD y borra los diacríticos, así que la
  // "ñ" del master llega como "n". El alias sí lleva la ñ — el cliente
  // normaliza query e índice igual, y "riñón" encuentra "rinon".
  [/\bRINON|\bRENAL|\bUREA\b|\bCREATININA|\bUROLOG/, 'riñon renal'],
  [/\bCEREBRO|\bCRANEO|\bENCEFALO|\bNEUROLOG|\bNEUROCIR/, 'cabeza cerebro'],
  /* Solo el concepto, NO los dos títulos: si el paquete le da "psiquiatra" a
     Psicología, buscar "psiquiatra" devuelve Psicología primero. Los títulos
     los deriva `formasDePaciente`, y a cada especialidad el suyo. */
  [/\bPSICOLOG|\bPSIQUIATR|\bSALUD MENTAL/, 'salud mental terapia'],
  [/\bPEDIATR|\bNEONAT|\bLACTANTE/, 'chicos hijos nene bebe'],
];

/* Las radiografías del cuadro 2 no dicen "radiografía" en ningún lado: se
   llaman "ABDOMEN SIMPLE 1 POSICION", "ANTEBRAZO 2 POSICIONES". Son las filas
   sin grupo que terminan en posiciones — la forma que tiene el master de
   listarlas. Sin este alias, "placa" y "radiografía" no devuelven nada. */
const ES_RADIOGRAFIA = /\d\s*POSICION|^(TORAX|ABDOMEN|CRANEO|COLUMNA|PELVIS|SENOS PARANASALES)\b/;

/* Lo que NO cubre ningún plan. Fuente: el bloque "Lo que pagás de tu bolsillo"
   del home + `TERMS` de app/glossary.jsx (textos aprobados, verificados contra
   la grilla en jul 2026). Van al buscador para que "muela" o "quimio" tengan
   respuesta, y no un vacío que cada uno interpreta como quiere. Cada uno dice
   también qué SÍ entra: una exclusión sin contexto asusta más de lo que
   informa. */
const EXCLUIDOS = [
  { n: 'Odontología', a: 'muela diente dentista caries limpieza extraccion ortodoncia',
    d: 'La atención del dentista no entra en ningún plan. Las radiografías dentales sí, porque son un estudio de imagen.' },
  { n: 'Tratamiento oncológico', a: 'cancer quimioterapia radioterapia tumor oncologia quimio',
    d: 'La quimioterapia, la radioterapia y las cirugías para tratar el cáncer no entran. La consulta con el oncólogo sí está cubierta.' },
  { n: 'Cirugía bariátrica', a: 'obesidad bajar de peso manga gastrica bypass balon',
    d: 'La operación para bajar de peso no entra en ningún plan.' },
  { n: 'Cirugías de alta complejidad', a: 'corazon cerebro trasplante neurocirugia cardiocirugia vascular',
    d: 'Las cirugías del corazón, del cerebro y de los vasos principales no entran. Las consultas con esos especialistas sí, y sin tope.' },
  { n: 'Enfermería a domicilio', a: 'enfermera enfermero domicilio casa curaciones',
    d: 'No está cubierta (cláusula 2.9.2). La consulta médica a domicilio sí: 2 al año en Bronze, 3 en Silver, 4 en Gold.' },
];

const norm = (s) =>
  (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/* Los cuadros no comparten convención de escritura: Laboratorio e Imágenes
   vienen en MAYÚSCULAS sin acentos ("APENDICE"), Cirugías en Tipo Oración con
   acentos ("Apendicetomía"). Los sinónimos se prueban contra ESTA forma —
   mayúsculas sin tildes — para que valgan en los cuatro cuadros por igual.
   (Sin esto, ningún sinónimo de la casa matcheaba el cuadro de cirugías.) */
const paraMatch = (s) => norm(s).toUpperCase();

/* Carencia = días de espera. El master trae "60 DÍAS", "30 DIAS.", "N/A" y un
   "INMENDIATA" con typo. Devolvemos días como número, o null si no aplica.
   REGLA CRÍTICA (HANDOFF + app/coverage.js): en una fila AD nunca se lee la
   carencia — no hay cobertura que esperar. Eso se aplica en `celda()`. */
function carencia(s) {
  if (!s) return null;
  const t = norm(s).replace(/\./g, '');
  if (t === 'n/a' || t === 'na') return null;
  if (t.startsWith('inme')) return 0;
  const m = t.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

/* Tabla de deduplicación para los textos de cantidad ("Ilimitada", "Hasta 2 por
   año de contrato"…): 935 filas × 3 planes repiten un puñado de textos. */
const cantidades = [];
const cantIdx = (s) => {
  if (!s) return -1;
  const t = String(s).trim();
  if (!t || norm(t) === 'n/a') return -1;
  let i = cantidades.indexOf(t);
  if (i === -1) i = cantidades.push(t) - 1;
  return i;
};

const aliasList = [];
const aliasIdx = (set) => {
  if (!set.size) return -1;
  const t = [...set].sort().join(' ');
  let i = aliasList.indexOf(t);
  if (i === -1) i = aliasList.push(t) - 1;
  return i;
};

function celda(v) {
  if (!v || typeof v !== 'object' || v.cob == null) return [-1, -1, null];
  const raw = VARIANTES[v.cob] || v.cob;
  const cob = COB[raw];
  if (cob == null) throw new Error(`Código de cobertura desconocido: ${v.cob}`);
  // AD = sin cobertura: cantidad y carencia no significan nada ahí.
  if (raw === 'AD') return [cob, -1, null];
  return [cob, cantIdx(v.cantidad), carencia(v.carencia)];
}

/* ⚠ Los sinónimos se prueban SOLO contra el nombre del ítem, NUNCA contra su
   grupo. El grupo del master agrupa por especialidad que opera, no por órgano:
   "Cirugía túnel carpiano" está en el grupo NEUROCIRUGIA —correcto, la opera un
   neurocirujano— pero es una cirugía de la muñeca. Cuando el grupo alimentaba
   los sinónimos, esa fila heredaba el alias "cerebro" y la búsqueda
   "cirugía de cerebro" devolvía PRIMERO una cirugía CUBIERTA en los tres
   planes, mientras la exclusión real ("Cirugías de alta complejidad", que no
   cubre ningún plan) quedaba tercera. La respuesta opuesta, arriba de todo, en
   la página cuyo argumento es la honestidad.
   El grupo NO se pierde: sigue entrando al texto buscable por `fila.g`, así
   quien escribe "neurocirugía" la encuentra igual. Lo que no hace es expandirse
   a órganos que la fila no menciona. */
const sinonimosDe = (nombre) => {
  const M = paraMatch(nombre);
  const out = new Set();
  for (const [re, syn] of SINONIMOS) {
    if (re.test(M)) {
      usados.add(re.source);
      for (const w of syn.split(' ')) out.add(w);
    }
  }
  return out;
};

const grilla = JSON.parse(readFileSync(SRC, 'utf8'));
const items = [];
const huecos = [];
const usados = new Set();

/* ---- (e) Los 4 cuadros: estudios, análisis y cirugías -------------------- */
for (const [cuadro, rows] of Object.entries(grilla.cuadros)) {
  const meta = CUADROS[cuadro];
  if (!meta) throw new Error(`Cuadro inesperado en la grilla: ${cuadro}`);
  for (const r of rows) {
    const nombre = (r.item || '').trim();
    if (!nombre || norm(nombre) === 'item') continue;

    const celdas = ['bronze', 'silver', 'gold'].map((p) => celda(r[p]));
    if (celdas.every((c) => c[0] === -1)) continue; // fila vacía del master

    const alias = sinonimosDe(nombre);
    const M = paraMatch(nombre);
    if (cuadro === 'laboratorio') {
      alias.add('analisis').add('laboratorio');
      if (/SANGRE|SUERO|PLASMA/.test(M)) alias.add('sangre');
      if (/ORINA/.test(M)) alias.add('orina');
    } else if (cuadro === 'cirugias_e_internacion') {
      alias.add('cirugia').add('operacion');
    } else if (cuadro === 'fisioterapia') {
      alias.add('fisioterapia').add('kinesiologia').add('rehabilitacion');
    } else if (cuadro === 'estudios_e_imagenes' && !r.grupo && ES_RADIOGRAFIA.test(M)) {
      alias.add('radiografia').add('placa').add('rayos x');
    }

    const fila = { t: 'e', n: nombre, c: meta.k, b: celdas[0], s: celdas[1], o: celdas[2] };
    if (r.grupo) fila.g = r.grupo;
    const ai = aliasIdx(alias);
    if (ai !== -1) fila.a = ai;
    items.push(fila);

    if (celdas.some((c) => c[0] === -1)) huecos.push(`${meta.k} · ${nombre}`);
  }
}

/* ---- (c) Las 43 consultas por especialidad ------------------------------- */
/* El master las escribe como "3 /año", "Sin tope anual", "3 /año · Copago".
   El "· Copago" cambia el MODO (pagás la mitad), no la cantidad — por eso se
   parte en dos: el código de cobertura y el tope, que son cosas distintas. */
const tope = (v) => {
  const copago = /copago/i.test(v);
  const txt = v.replace(/\s*·\s*Copago/i, '').trim().replace(/^(\d+)\s*\/\s*año$/i, '$1 al año');
  return [copago ? COB.COP : COB.CT, cantIdx(txt), null];
};
/* Nadie busca "Dermatología": busca "dermatólogo". El master nombra la
   ESPECIALIDAD y el paciente nombra al MÉDICO, así que las formas de la gente
   se derivan con dos reglas (-logía→-logo, -iatría→-iatra) más las que ninguna
   regla saca. Sin esto, "pediatra" y "dermatologo" devolvían cero. */
const COMO_LE_DICEN = {
  'Nutrición': 'nutricionista',
  'Oftalmología': 'oculista',
  'Oftalmología Pediátrica': 'oculista',
  'Otorrinolaringología': 'otorrino oido nariz garganta',
  'Ginecología y Obstetricia': 'obstetra partera control del embarazo',
  'Medicina Familiar': 'clinico medico de cabecera medico general',
  'Medicina Interna - Clínica Médica': 'clinico medico de cabecera medico general',
  'Fonoaudiología': 'fono lenguaje habla',
  'Traumatología': 'huesos fractura golpe',
  'Geriatría': 'adulto mayor abuelo',
  'Mastología': 'mama pecho',
};
const formasDePaciente = (esp) => {
  const out = new Set();
  for (const w of norm(esp).split(/[\s-]+/)) {
    if (w.endsWith('logia')) out.add(w.replace(/logia$/, 'logo'));
    else if (w.endsWith('iatria')) out.add(w.replace(/iatria$/, 'iatra'));
    else if (w.endsWith('cirugia')) out.add(w.replace(/cirugia$/, 'cirujano'));
  }
  for (const w of (COMO_LE_DICEN[esp] || '').split(' ').filter(Boolean)) out.add(w);
  return out;
};

for (const r of grilla.consultas_por_especialidad) {
  const esp = (r.especialidad || '').trim();
  if (!esp || norm(esp) === 'especialidad') continue;
  const alias = sinonimosDe(esp);
  for (const w of formasDePaciente(esp)) alias.add(w);
  alias.add('consulta').add('especialista').add('medico').add('doctor');
  const fila = { t: 'c', n: esp, c: 'esp', b: tope(r.bronze), s: tope(r.silver), o: tope(r.gold) };
  const ai = aliasIdx(alias);
  if (ai !== -1) fila.a = ai;
  items.push(fila);
}

/* ---- (x) Lo que no cubre ningún plan ------------------------------------- */
for (const e of EXCLUIDOS) {
  const alias = new Set(e.a.split(' '));
  const cel = [COB.EXCL, -1, null];
  items.push({ t: 'x', n: e.n, c: 'exc', d: e.d, b: cel, s: cel, o: cel, a: aliasIdx(alias) });
}

/* ---- Los parámetros clave (topes, días, montos) -------------------------- */
/* Los números que deciden y que el folleto no pone en la portada: días de UTI,
   tope de medicamentos, carencia de maternidad. Van aparte de los ítems porque
   no son cosas que se busquen: son la letra chica que se lee de corrido. */
const parametros = grilla.parametros_clave
  .filter((r) => r.parametro && norm(r.parametro) !== 'parametro')
  .map((r) => ({ sec: r.seccion || '', p: r.parametro.trim(), v: [r.bronze, r.silver, r.gold] }));

/* ---- Qué gana el socio al subir de plan ---------------------------------- */
/* ⚠ POR QUÉ ESTO Y NO "45% / 66% / 93%".
   El bloque de cobertura real por plan se ELIMINÓ del home el 25/07/2026 tras
   una observación del usuario: "la transparencia tiene que cumplir un propósito,
   no puede ser transparencia por ser transparencia". Decir "Bronze cubre el 45%"
   informa cuán incompleto es un plan sin ayudar a decidir nada — y se lee como
   "el 55% NO está cubierto": la transparencia terminaba vendiendo en contra.
   No se reconstruye eso acá.
   Este cálculo sale de los MISMOS datos pero responde otra pregunta, que sí
   decide: qué comprás cuando subís un escalón. Contamos los ítems que MEJORAN
   de modo (de "al precio de convenio" a "cubierto", de "la mitad" a "cubierto")
   y en qué cuadro se concentra el salto. Es el upsell honesto: cada número es
   verificable ítem por ítem en el buscador de la misma página. */
const saltoEntre = (de, a) => {
  const mejoran = items.filter((i) => i.t === 'e' && i[de][0] >= 0 && i[a][0] >= 0 && i[a][0] < i[de][0]);
  const porCuadro = {};
  for (const i of mejoran) porCuadro[i.c] = (porCuadro[i.c] || 0) + 1;
  return {
    total: mejoran.length,
    // El cuadro donde más se mueve la aguja: es lo que hay que decir primero.
    donde: Object.entries(porCuadro).sort((x, y) => y[1] - x[1]).map(([k, n]) => ({ c: k, n })),
    // Los que pasan de "lo pagás entero" a tener alguna cobertura.
    desdeConvenio: mejoran.filter((i) => i[de][0] === COB.AD).length,
  };
};
const saltos = { bs: saltoEntre('b', 's'), so: saltoEntre('s', 'o'), bo: saltoEntre('b', 'o') };

const out = {
  meta: {
    _: 'GENERADO por scripts/build-prestaciones.mjs — no editar a mano. Fuente: datos/planes-vigentes/grilla-coberturas-precios-jul2026.json.',
    vigencia: grilla.meta.vigencia,
    fuente: grilla.meta.archivo_fuente,
    total: items.length,
    porTipo: { e: items.filter((i) => i.t === 'e').length, c: items.filter((i) => i.t === 'c').length, x: items.filter((i) => i.t === 'x').length },
    cuadros: { ...Object.fromEntries(Object.values(CUADROS).map((c) => [c.k, c.label])), esp: 'Consultas con especialista', exc: 'No lo cubre ningún plan' },
    /* Los modos, en el vocabulario del sitio — el mismo del home (ancla
       #bolsillo). El índice de este array ES el código de cobertura. */
    modos: [
      { k: 'Cubierto', d: 'No ponés nada de tu bolsillo.' },
      { k: 'Pagás la mitad', d: 'Salud Protegida cubre el 50% y vos el otro 50%.' },
      { k: 'Cubre una parte', d: 'El plan cubre una parte del evento; la diferencia queda a tu cargo.' },
      { k: 'Según la cirugía', d: 'Depende de la cirugía: buscá la cirugía puntual para ver qué te toca.' },
      { k: 'Al precio de convenio', d: 'Este plan no lo cubre, pero lo pagás a la tarifa negociada de SP, no a la de la calle.' },
      { k: 'No lo cubre ningún plan', d: 'No entra en Bronze, Silver ni Gold.' },
    ],
  },
  cantidades,
  alias: aliasList,
  items,
  parametros,
  saltos,
};

/* ⚠ Serializado A MANO, un ítem por línea. El archivo se commitea justamente
   para que una re-ingesta muestre en el diff QUÉ COBERTURA SE MOVIÓ; con
   `JSON.stringify(out)` a secas todo quedaba en UNA línea de 130 KB y cambiar
   una sola celda reemplazaba la línea entera — el diff no mostraba nada y la
   supuesta red de seguridad no atrapaba nada. Sigue siendo JSON válido. */
const serializar = (o) => {
  const partes = [];
  for (const [k, v] of Object.entries(o)) {
    if (k === 'items') {
      partes.push('"items":[\n' + v.map((i) => JSON.stringify(i)).join(',\n') + '\n]');
    } else if (Array.isArray(v)) {
      partes.push(JSON.stringify(k) + ':[\n' + v.map((x) => JSON.stringify(x)).join(',\n') + '\n]');
    } else {
      partes.push(JSON.stringify(k) + ':' + JSON.stringify(v, null, 1));
    }
  }
  return '{\n' + partes.join(',\n') + '\n}\n';
};
const texto = serializar(out);
writeFileSync(OUT, texto);

const size = Buffer.byteLength(texto);
console.log(`✔ lib/prestaciones.json — ${items.length} ítems (${out.meta.porTipo.e} estudios · ${out.meta.porTipo.c} especialidades · ${out.meta.porTipo.x} exclusiones), ${parametros.length} parámetros, ${(size / 1024).toFixed(1)} KB`);
console.log(`  Salto de plan: Bronze→Silver ${saltos.bs.total} mejoran · Silver→Gold ${saltos.so.total} · Bronze→Gold ${saltos.bo.total}`);
if (huecos.length) {
  console.log(`\n⚠ ${huecos.length} ítems con al menos un plan sin declarar en el master (celdas combinadas del .xlsx).`);
  console.log('  Se muestran como "Sin dato" en la web — nunca se infiere cobertura.');
  for (const h of huecos) console.log(`   · ${h}`);
}
const huerfanos = SINONIMOS.filter(([re]) => !usados.has(re.source));
if (huerfanos.length) {
  console.log(`\n⚠ ${huerfanos.length} sinónimos no matchearon ninguna fila (peso muerto, o la grilla cambió):`);
  for (const [re] of huerfanos) console.log(`   · ${re}`);
}
