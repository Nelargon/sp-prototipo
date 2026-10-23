// Las listas que se abren a un toque, contra su fuente (23/10/2026, después de
// la 9A y la 10A de Arturo; sp-interno#191). Sin navegador: segundos.
//
// Por qué existe. La prueba de la 9A y la 10A de qa-lanzamiento compara la
// página con su propio texto aprobado, escrito a mano. Si llega un master nuevo
// con otras esperas, o alguien cambia un nombre de las 26 cirugías, la página y
// el texto aprobado siguen iguales y todo da verde (verificador de datos,
// 23/10). Este control mira la otra punta: lo que dicen los toques
// (app/coverage.js, TOQUES y CIRUGIAS_26) contra los datos de donde salen.
//
// (a) Las ecografías que esperan 3 meses. Toda fila de la grilla del master
//     (datos/planes-vigentes/grilla-coberturas-precios-jul2026.json, Cuadro 2)
//     de los grupos «ECOGRAFIAS» y «ECOGRAFIAS PERINATALES», o que empieza con
//     «ECOGRAFIA» aunque el master la ponga en otro grupo, tiene su nombre en la
//     web en NOMBRE_WEB o está declarada afuera, con su porqué, en
//     FUERA_DE_LA_FILA (los ecocardiogramas, la que SP borró por duplicada, la de
//     nombre pegado). Una fila de esas que no esté en ninguna de las dos, falla;
//     y una de FUERA_DE_LA_FILA cuya espera cambie en el master, también. Un
//     nombre de la web aparece en el toque de un plan si y solo si sus filas
//     esperan 90 días en ese plan. Una fila nueva sin nombre declarado, o un
//     nombre sin su fila, también falla.
//     Los pares que el master contradice (la «VESICAL» y la «DE VEJIGA» de Gold:
//     90 y 60 días) van al asesor y no eligen un lado (CONTRADICHAS).
// (b) Las 26 cirugías de Essential. essential.json (`cirugias_lista_26`, textual
//     del cuadernillo, 4.4.1 a 4.4.26) tiene 26, y cada una tiene su nombre en la
//     web en CIRUGIAS_26, en el mismo índice: PARES_26 los declara de a dos. Si
//     cambia una punta sin la otra, falla. Y aunque cambien las dos, el nombre de
//     la web tiene que conservar los calificativos de su ítem (CALIFICATIVOS:
//     «unilateral», «a cielo abierto», «no complicada», «terapéutico»…): la
//     palabra de casa no puede abarcar más que la del contrato (tercera tanda,
//     23/10).
//
// Antes de mirar los datos se prueba a sí mismo con casos que tienen que fallar
// y casos que no (CLAUDE.md, BITACORA cap. 89).
// Uso: node qa/listas-fuente.mjs        (sale con 1 si algo no cierra)

import { readFileSync } from 'node:fs';

const leer = (r) => readFileSync(new URL('../' + r, import.meta.url), 'utf8');
const COV = await import('data:text/javascript;base64,' + Buffer.from(leer('app/coverage.js')).toString('base64'));
const GRILLA = JSON.parse(leer('datos/planes-vigentes/grilla-coberturas-precios-jul2026.json'));
const ESSENTIAL = JSON.parse(leer('datos/planes-vigentes/essential.json'));

// ── (a) Las ecografías ──────────────────────────────────────────────────────
// El nombre de cada fila de la grilla, como lo dice la web. Dos filas pueden
// tener el mismo nombre (la Doppler venosa de un lado y la de los dos). Los
// nombres de las filas que esperan 2 meses están para que, si un master nuevo
// las pasa a 3, el toque tenga que nombrarlas.
export const NOMBRE_WEB = {
  'ECOGRAFIA ABDOMINAL COMPLETA': 'abdominal completa',
  'ECOGRAFIA ABDOMINAL INFERIOR': 'abdominal inferior',
  'ECOGRAFIA ABDOMINAL SUPERIOR': 'abdominal superior',
  'ECOGRAFIA DE BAZO': 'de bazo',
  'ECOGRAFIA DE CADERA': 'de cadera',
  'ECOGRAFIA DE CRANEO': 'de cráneo',
  'ECOGRAFIA DE MIEMBRO': 'de brazo o pierna',
  'ECOGRAFIA DE PARTES BLANDAS': 'de partes blandas',
  'ECOGRAFIA DE TIROIDES': 'la de tiroides',
  'ECOGRAFIA DE TORAX': 'de tórax',
  'ECOGRAFIA DE VEJIGA': 'de vejiga',
  'ECOGRAFIA GINECOLOGICA': 'ginecológica',
  'ECOGRAFIA HIGADO/VIAS BILIARES/VESICULA': 'de hígado y vesícula',
  'ECOGRAFIA MAMARIA': 'la de mama',
  'ECOGRAFIA OCULAR': 'ocular',
  'ECOGRAFIA PANCREATICA': 'de páncreas',
  'ECOGRAFIA PROSTATICA SUPRAPUBICA': 'de próstata por encima del pubis',
  'ECOGRAFIA PROSTATICA TRANRECTAL': 'de próstata por vía rectal',
  'ECOGRAFIA RENAL': 'de riñón',
  'ECOGRAFIA TESTICULAR': 'la testicular',
  'ECOGRAFIA TRANSVAGINAL': 'transvaginal',
  'ECOGRAFIA VESICAL': 'la vesical',
  'ECOGRAFIA VIAS URINARIAS': 'de vías urinarias',
  // Las del embarazo (grupo «ECOGRAFIAS PERINATALES» del master).
  'ECOGRAFIA OBSTETRICA': 'obstétrica',
  'ECOGRAFIA MORFOLOGICA SIMPLE': 'morfológica',
  'ECOGRAFIA MARCADORES CROMOSOMICOS SIMPLE': 'de marcadores cromosómicos',
  'ECOGRAFIA DOPPLER OBSTETRICO': 'Doppler obstétrico',
  'ECOCARDIOGRAFIA FETAL': 'del corazón del bebé',
  'PERFIL BIOFISICO': 'perfil biofísico',
  'MONITOREO FETAL': 'monitoreo fetal',
  // Las Doppler (el master también las pone en «ECOGRAFIAS PERINATALES»). La web
  // las dice en una sola frase, «las Doppler de tiroides, de mama, …».
  'ECOGRAFIA DOPPLER DE TIROIDES': 'Doppler de tiroides',
  'ECOGRAFIA DOPPLER MAMARIO': 'Doppler de mama',
  'ECOGRAFIA DOPPLER TESTICULAR O CORDON ESPERMATICO': 'Doppler de testículo',
  'ECOGRAFIA DOPPLER VENOSO MIEMBRO SUPERIOR O INFERIOR DOS LADOS ECOGRAFIA DOPPLER VENOSO MIEMBRO SUPERIOR O INFERIOR UN LADO': 'Doppler de venas de brazos o piernas',
  'ECOGRAFIA DOPPLER VENOSO MIEMBRO SUPERIOR O INFERIOR UN LADO': 'Doppler de venas de brazos o piernas',
  'ECOGRAFIA DOPPLER CAROTIDEO': 'Doppler de carótidas',
};
// Filas que el master contradice: el mismo estudio con dos esperas. Donde no
// coinciden, el toque manda al asesor por `asesor` y no nombra `nombre` entre
// las de 3 meses.
export const CONTRADICHAS = [{ filas: ['ECOGRAFIA VESICAL', 'ECOGRAFIA DE VEJIGA'], asesor: 'para la de vejiga, preguntale a tu asesor cuánto esperás' }];

const dias = (c) => { const m = /(\d+)\s*D[IÍ]AS/i.exec((c && c.carencia) || ''); return m ? +m[1] : null; };
// Qué filas se miran (tercera tanda, 23/10): las de los grupos de ecografías
// del master, donde están también las tres del embarazo que no se llaman
// «ECOGRAFIA…» (el monitoreo fetal, el perfil biofísico y la ecocardiografía
// fetal), y toda fila que empiece con «ECOGRAFIA» aunque esté en otro grupo (la
// Doppler venosa de un lado está en «MAMOGRAFIA»). Hasta la segunda tanda se
// elegían por el nombre, con las tres perinatales escritas a mano, y cuatro
// filas de los grupos quedaban afuera sin que nadie lo declarara: si un master
// nuevo pasaba una a 90 días, la prueba seguía en verde (verificador de datos).
export const GRUPOS_ECO = ['ECOGRAFIAS', 'ECOGRAFIAS PERINATALES'];
const esDeEco = (f) => GRUPOS_ECO.includes(f.grupo) || /^ECOGRAFIA/.test(f.item);
// Las filas de esos grupos que el toque no cuenta, cada una con su porqué y la
// espera que tiene hoy en el master. Si un master nuevo la cambia, falla: alguien
// decide si entra en el toque.
export const FUERA_DE_LA_FILA = {
  'ECOCARDIOGRAMA SIMPLE': { silver: 60, gold: 60, porque: 'es un estudio del corazón y el sitio no lo cuenta entre las ecografías (en Essential va con la tomografía y la ergometría, cuadernillo 3.2); sus dudas, en sp-interno#173' },
  'ECOCARDIOGRAMA CON DOPPLER DE BASOS DE CUELLO': { silver: 60, gold: 60, porque: 'un ecocardiograma, como el de arriba (sp-interno#173)' },
  'ECOCARDIOGRAFIA': { silver: 60, gold: 90, porque: 'SP la borró por duplicada del ecocardiograma (correo del 18/09/2026; CORRECCIONES de scripts/build-prestaciones.mjs); la duda de sus valores de Gold, en sp-interno#173' },
  'MAMOGRAFIA 2 LADOS ECOGRAFIA DOPPLER': { silver: 60, gold: 60, porque: 'nombre pegado de dos estudios, como las celdas combinadas del master (sp-interno#81)' },
};
export const filasDeEco = (grilla, fuera = FUERA_DE_LA_FILA) => grilla.cuadros.estudios_e_imagenes.filter((f) => esDeEco(f) && !Object.hasOwn(fuera, f.item));
// Las de FUERA_DE_LA_FILA, contra la grilla: que sigan ahí, en un grupo de
// ecografías, con la espera declarada, y que no tengan también nombre en la web.
export function revisarFuera(grilla, fuera = FUERA_DE_LA_FILA) {
  const h = [];
  for (const [item, x] of Object.entries(fuera)) {
    const f = grilla.cuadros.estudios_e_imagenes.find((r) => r.item === item);
    if (!f) { h.push('FUERA_DE_LA_FILA: «' + item + '» ya no está en la grilla'); continue; }
    if (!esDeEco(f)) h.push('FUERA_DE_LA_FILA: «' + item + '» ya no está en un grupo de ecografías (' + f.grupo + ')');
    if (Object.hasOwn(NOMBRE_WEB, item)) h.push('«' + item + '» está en NOMBRE_WEB y en FUERA_DE_LA_FILA');
    for (const plan of ['silver', 'gold']) { const d = dias(f[plan]); if (d !== x[plan]) h.push('«' + item + '» (fuera del toque: ' + x.porque + ') espera ' + d + ' días en ' + plan + ' y la declarada es ' + x[plan] + ': ¿entra en el toque?'); }
  }
  return h;
}

// Lo que la frase de un toque nombra, separado: «las del embarazo (a, b y c)»
// y «las Doppler de x, de y y de z» se abren en sus ítems («Doppler» va delante
// de cada uno de los suyos); el resto se busca nombre por nombre. Lo que manda
// al asesor (CONTRADICHAS) no cuenta como nombrado.
const LETRA = 'a-záéíóúüñ';
export function nombresDe(frase) {
  let t = ' ' + frase.replace(/\s+/g, ' ') + ' ';
  for (const c of CONTRADICHAS) t = t.replace(new RegExp(c.asesor, 'ig'), ' ');
  const nombres = new Set();
  const EMB = /del embarazo \(([^)]*)\)/i;
  const e = EMB.exec(t);
  if (e) { e[1].split(/, | y /).forEach((x) => nombres.add(x.trim())); t = t.replace(EMB, ' '); }
  const DOP = /Doppler (de .*?)(?=\.|;|, y |$)/;
  const d = DOP.exec(t);
  if (d) { d[1].split(/, | y /).forEach((x) => nombres.add('Doppler ' + x.trim())); t = t.replace(DOP, ' '); }
  for (const n of Object.values(NOMBRE_WEB)) {
    if (/^Doppler /.test(n)) continue;
    const sin = n.replace(/^(la|las) /, '');
    if (new RegExp('(?<![' + LETRA + '])' + sin + '(?![' + LETRA + '])', 'i').test(t)) nombres.add(n);
  }
  return nombres;
}

// Las filas de un plan que esperan 3 meses, por nombre de la web, y lo que no
// cierra (filas sin nombre, nombres con filas que no coinciden).
export function esperan90(grilla, plan, fuera = FUERA_DE_LA_FILA) {
  const r = { tres: new Set(), dos: new Set(), mal: [] };
  const porNombre = new Map();
  const filas = filasDeEco(grilla, fuera);
  for (const f of filas) {
    const n = NOMBRE_WEB[f.item];
    if (!n) { r.mal.push('la fila «' + f.item + '» (' + (f.grupo || 'sin grupo') + ') no tiene nombre en la web (NOMBRE_WEB) ni está declarada afuera (FUERA_DE_LA_FILA)'); continue; }
    const d = dias(f[plan]);
    if (!porNombre.has(n)) porNombre.set(n, []);
    porNombre.get(n).push({ item: f.item, d });
  }
  for (const k of Object.keys(NOMBRE_WEB)) if (!filas.some((f) => f.item === k)) r.mal.push('«' + k + '» está en NOMBRE_WEB y no en la grilla');
  for (const [n, fs] of porNombre) {
    const con = fs.filter((x) => x.d !== null);
    if (!con.length) continue;
    if (con.every((x) => x.d === 90)) r.tres.add(n);
    else if (con.every((x) => x.d !== 90)) r.dos.add(n);
    else r.mal.push('«' + n + '» mezcla esperas en ' + plan + ': ' + con.map((x) => x.item + ' ' + x.d).join(', '));
  }
  // Los pares contradichos: si no coinciden, ninguno se nombra entre las de 3
  // meses; el toque manda al asesor.
  r.asesor = [];
  for (const c of CONTRADICHAS) {
    const ds = c.filas.map((it) => dias((grilla.cuadros.estudios_e_imagenes.find((f) => f.item === it) || {})[plan]));
    if (ds.some((d) => d === 90) && ds.some((d) => d !== null && d !== 90)) {
      c.filas.forEach((it) => { r.tres.delete(NOMBRE_WEB[it]); r.dos.delete(NOMBRE_WEB[it]); });
      r.asesor.push(c.asesor);
    }
  }
  return r;
}

// La regla, sobre una grilla y unos toques: los hallazgos (vacío si cierra).
export function revisarEcos(grilla, toques, fuera = FUERA_DE_LA_FILA) {
  const h = [];
  const S = esperan90(grilla, 'silver', fuera), G = esperan90(grilla, 'gold', fuera);
  h.push(...new Set([...S.mal, ...G.mal]), ...revisarFuera(grilla, fuera));
  const igual = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
  const decir = (s) => [...s].sort().join(', ');
  const comparar = (donde, frase, esperado, asesor) => {
    const vistos = nombresDe(frase);
    const faltan = [...esperado].filter((x) => !vistos.has(x)), sobran = [...vistos].filter((x) => !esperado.has(x));
    if (faltan.length) h.push(donde + ': no nombra ' + faltan.join(', ') + ', que en la grilla esperan 90 días');
    const contra = new Set(CONTRADICHAS.flatMap((c) => c.filas.map((f) => NOMBRE_WEB[f])));
    const sobranC = sobran.filter((x) => asesor.length && contra.has(x)), sobranN = sobran.filter((x) => !sobranC.includes(x));
    if (sobranN.length) h.push(donde + ': nombra ' + sobranN.join(', ') + ', que en la grilla no esperan 90 días');
    if (sobranC.length) h.push(donde + ': nombra ' + sobranC.join(', ') + ' entre las de 3 meses, y el master se contradice (va al asesor)');
    for (const a of asesor) if (!frase.toLowerCase().includes(a.toLowerCase())) h.push(donde + ': no dice «' + a + '» (el master se contradice)');
    if (!asesor.length && /preguntale a tu asesor/.test(frase)) h.push(donde + ': manda al asesor y el master ya no se contradice');
    return !faltan.length && !sobran.length;
  };
  comparar('eco-silver', toques['eco-silver'].d, S.tres, S.asesor);
  comparar('eco-gold', toques['eco-gold'].d, G.tres, G.asesor);
  // eco-sg: «En Silver y Gold, <las de los dos>. En Gold, también <las de Gold>».
  const [antes, despues = ''] = toques['eco-sg'].d.split('En Gold, también');
  const comunes = new Set([...S.tres].filter((x) => G.tres.has(x)));
  const soloG = new Set([...G.tres].filter((x) => !S.tres.has(x)));
  const soloS = [...S.tres].filter((x) => !G.tres.has(x));
  if (soloS.length) h.push('eco-sg: ' + soloS.join(', ') + ' espera 90 días solo en Silver, y el toque no tiene cómo decirlo');
  comparar('eco-sg (Silver y Gold)', antes, comunes, []);
  comparar('eco-sg (solo Gold)', despues, soloG, G.asesor);
  if (!h.length && !igual(new Set([...comunes, ...soloG]), G.tres)) h.push('eco-sg: no suma lo de Gold (' + decir(G.tres) + ')');
  return h;
}

// ── (b) Las 26 cirugías ─────────────────────────────────────────────────────
// [lo que dice el cuadernillo (essential.json), lo que dice la web (CIRUGIAS_26)].
// Es la lista aprobada: la lee también la prueba con navegador de qa-lanzamiento
// (LAS_26), así hay una sola copia escrita a mano y no tres.
export const PARES_26 = [
  ['Absceso perianal', 'absceso perianal (junto al ano)'],
  ['Adenoamigdalectomía', 'sacar las amígdalas y las adenoides juntas'],
  ['Adenoidectomía', 'sacar las adenoides'],
  ['Adenomectomía prostática a cielo abierto', 'sacar el adenoma de próstata, a cielo abierto'],
  ['Amigdalectomía', 'sacar las amígdalas'],
  ['Apendicectomía no complicada', 'sacar el apéndice (apendicectomía no complicada)'],
  ['Blefarotomía (absceso, orzuelo, chalazión)', 'orzuelo, chalazión o absceso del párpado'],
  ['Circuncisión (postectomía)', 'circuncisión'],
  ['Colecistectomía', 'sacar la vesícula'],
  ['Colporrafía anterior', 'colporrafia anterior'],
  ['Colporrafía posterior', 'colporrafia posterior'],
  ['Extracción de catarata unilateral (EECC)', 'catarata de un ojo, por extracción extracapsular'],
  ['Hemorroidectomía abierta o cerrada', 'hemorroidectomía (cirugía para sacar las hemorroides)'],
  ['Hernioplastia crural unilateral (no incluye malla)', 'hernia crural de un lado (la malla no entra)'],
  ['Hernioplastia inguinal unilateral (no incluye malla)', 'hernia de la ingle de un lado (la malla no entra)'],
  ['Herniorrafia umbilical o epigástrica (no incluye malla)', 'hernia del ombligo o epigástrica (la malla no entra)'],
  ['Hidrocele unilateral', 'hidrocele de un lado'],
  ['Histerectomía total abdominal/vaginal', 'sacar el útero (histerectomía total)'],
  ['Laparotomía exploradora', 'laparotomía exploradora'],
  ['Legrado evacuador (raspado uterino terapéutico)', 'legrado evacuador (raspado del útero como tratamiento)'],
  ['Ooforosalpingectomía/anexectomía unilateral', 'sacar el ovario y la trompa de un lado'],
  ['Pielolitotomía abierta', 'pielolitotomía abierta (abrir la pelvis del riñón para sacar una piedra)'],
  ['Pterigión con o sin autoinjerto', 'pterigión, con o sin autoinjerto'],
  ['Quistectomía unilateral', 'quistectomía de un lado (preguntale a tu asesor cuáles entran)'],
  ['Resección de nódulo mamario', 'sacar un nódulo de la mama'],
  ['Varicocele unilateral inguinoescrotal', 'varicocele de un lado, inguinoescrotal'],
];

// Los calificativos de un ítem del cuadernillo que el nombre de la web tiene que
// conservar (tercera tanda, 23/10/2026; verificador de datos): [lo que dice el
// ítem, lo que tiene que decir la web, por qué]. Vale aunque cambien las dos
// puntas de PARES_26 a la vez: la traducción entre paréntesis también se lee,
// y tampoco puede abarcar más que el ítem. Hasta la segunda tanda, «legrado
// evacuador (raspado del útero)» decía «evacuador» pero su traducción incluía el
// raspado de diagnóstico, y «sacar el adenoma de próstata» había perdido el «a
// cielo abierto» de su ítem: la prueba solo veía que faltara «evacuador».
// Cada regla acepta el literal del cuadernillo y su traducción (verificador de
// la ronda 2, 23/10): hasta entonces pedía solo la palabra que eligió el sitio,
// y la lista dicha tal como la dice el cuadernillo daba 12 hallazgos. Era un
// detector que grita en falso (CLAUDE.md, BITACORA cap. 89): sp-interno#206 le
// ofrece a Arturo quedarse con el literal o elegir palabras de casa, y con
// cualquiera de las dos el CI se habría puesto en rojo por algo que está bien.
export const CALIFICATIVOS = [
  [/unilateral/i, /unilateral|de un (solo )?(lado|ojo)/i, '«unilateral»: de un lado'],
  [/a cielo abierto/i, /a cielo abierto|cirug[ií]a abierta/i, '«a cielo abierto» (la de próstata más común es por la uretra, y no es videolaparoscopía)'],
  // «abierta o cerrada» (la hemorroidectomía) nombra las dos técnicas: no limita.
  [/\babierta\b(?! o cerrada)/i, /\babierta\b|a cielo abierto/i, '«abierta»'],
  [/no complicada/i, /no (est[aá] )?complicada/i, '«no complicada», como lo dice el ítem («sin complicaciones» se leía «si la cirugía sale bien»)'],
  [/no incluye malla/i, /no incluye malla|la malla no entra/i, '«no incluye malla»'],
  [/con o sin autoinjerto/i, /con o sin (auto)?injerto/i, '«con o sin autoinjerto»'],
  [/evacuador/i, /evacuador/i, '«evacuador» (sin él, también el legrado de diagnóstico)'],
  [/terap[eé]utico/i, /terap[eé]utic|como tratamiento/i, '«terapéutico»: la traducción no puede incluir el raspado de diagnóstico'],
  [/\btotal\b/i, /\btotal\b|\bentero\b|\bcompleto\b/i, '«total»'],
  [/exploradora/i, /exploradora|para explorar/i, '«exploradora»'],
  [/inguinoescrotal/i, /inguinoescrotal|de la ingle y (del|el) escroto/i, '«inguinoescrotal»'],
  [/\banterior\b/i, /\banterior\b|de adelante/i, '«anterior»'],
  [/\bposterior\b/i, /\bposterior\b|de atr[aá]s/i, '«posterior»'],
  [/\(EECC\)/, /EECC|extracapsular/i, '«EECC», la extracción extracapsular'],
];

export function revisar26(items, web, pares = PARES_26) {
  const h = [];
  if (!Array.isArray(items) || items.length !== 26) h.push('essential.json: cirugias_lista_26 tiene ' + (items ? items.length : 0) + ' ítems, no 26');
  if (!Array.isArray(web) || web.length !== 26) h.push('CIRUGIAS_26 tiene ' + (web ? web.length : 0) + ' nombres, no 26');
  pares.forEach(([cuad, w], i) => {
    if ((items || [])[i] !== cuad) h.push('4.4.' + (i + 1) + ': el cuadernillo (essential.json) dice «' + ((items || [])[i] || '—') + '» y el par declarado es «' + cuad + '»');
    if ((web || [])[i] !== w) h.push('4.4.' + (i + 1) + ': la web (CIRUGIAS_26) dice «' + ((web || [])[i] || '—') + '» y el par de «' + cuad + '» es «' + w + '»');
    // Contra lo que dice la web (CIRUGIAS_26), que es lo que lee la familia.
    const lee = (web || [])[i] || '';
    for (const [enItem, enWeb, porque] of CALIFICATIVOS) if (enItem.test(cuad) && !enWeb.test(lee)) h.push('4.4.' + (i + 1) + ': «' + lee + '» perdió un calificativo de su ítem («' + cuad + '»): ' + porque);
  });
  return h;
}

// ── La autoprueba: casos que tienen que fallar y casos que tienen que pasar ──
// Cada uno cambia una sola cosa de los datos de hoy. Los que tienen que pasar
// son el de hoy, sin cambios (la revisión de abajo: si falla, se informa como
// hallazgo, no como falla de la autoprueba) y los de `pasan`, que cambian algo
// que la regla no tiene que marcar.
export function autoprueba() {
  const f = [];
  const items = ESSENTIAL.cobertura_clave.cirugias_lista_26.items;
  const copia = (o) => JSON.parse(JSON.stringify(o));
  const conDias = (g, item, plan, d) => { const x = copia(g); x.cuadros.estudios_e_imagenes.find((r) => r.item === item)[plan].carencia = d + ' DIAS'; return x; };
  const conFila = (g, fila) => { const x = copia(g); x.cuadros.estudios_e_imagenes.push(fila); return x; };
  const toques = { ...COV.TOQUES };
  const conD = (k, d) => ({ ...toques, [k]: { ...toques[k], d } });
  // Lo que un caso agrega a lo de hoy: así un hallazgo de hoy (que se informa
  // abajo) no hace pasar ni fallar a la autoprueba.
  const hoy26 = new Set(revisar26(items, COV.CIRUGIAS_26)), hoyEco = new Set(revisarEcos(GRILLA, toques));
  const nuevos = (h, hoy) => h.filter((x) => !hoy.has(x));
  // Un nombre de la web cambiado en las dos puntas (CIRUGIAS_26 y PARES_26): la
  // igualdad de los pares no lo ve; solo CALIFICATIVOS.
  const enLasDos = (i, nombre) => revisar26(items, COV.CIRUGIAS_26.map((x, k) => (k === i ? nombre : x)), PARES_26.map((p, k) => (k === i ? [p[0], nombre] : p)));
  const LITERAL = (xs) => xs.map((x) => x[0].toLowerCase() + x.slice(1));
  const porCalificativo = (i, h) => h.filter((x) => x.startsWith('4.4.' + (i + 1) + ':') && /perdió un calificativo/.test(x));
  const sinFuera = (item) => Object.fromEntries(Object.entries(FUERA_DE_LA_FILA).filter(([k]) => k !== item));
  const casos = [
    ['la ecocardiografía fetal de Silver a 60 días', revisarEcos(conDias(GRILLA, 'ECOCARDIOGRAFIA FETAL', 'silver', 60), toques)],
    ['la ecografía abdominal completa de Gold a 90 días', revisarEcos(conDias(GRILLA, 'ECOGRAFIA ABDOMINAL COMPLETA', 'gold', 90), toques)],
    ['la vejiga de Gold a 90 (ya no se contradice)', revisarEcos(conDias(GRILLA, 'ECOGRAFIA DE VEJIGA', 'gold', 90), toques)],
    ['el toque de Silver sin «del corazón del bebé»', revisarEcos(GRILLA, conD('eco-silver', toques['eco-silver'].d.replace(', del corazón del bebé', '')))],
    ['el toque de Gold con «la vesical»', revisarEcos(GRILLA, conD('eco-gold', toques['eco-gold'].d.replace('y la transvaginal', ', la transvaginal y la vesical')))],
    ['una fila nueva sin nombre en la web', revisarEcos(conFila(GRILLA, { item: 'ECOGRAFIA NUEVA', silver: { carencia: '60 DIAS' }, gold: { carencia: '60 DIAS' } }), toques)],
    // Las filas de los grupos del master (tercera tanda).
    ['el ecocardiograma simple del grupo, sin declararlo afuera', revisarEcos(GRILLA, toques, sinFuera('ECOCARDIOGRAMA SIMPLE'))],
    ['el ecocardiograma simple de Gold a 90 días (declarado afuera con 60)', revisarEcos(conDias(GRILLA, 'ECOCARDIOGRAMA SIMPLE', 'gold', 90), toques)],
    ['una fila nueva del grupo «ECOGRAFIAS» que no se llama «ECOGRAFIA…»', revisarEcos(conFila(GRILLA, { item: 'ELASTOGRAFIA HEPATICA', grupo: 'ECOGRAFIAS', silver: { carencia: '60 DIAS' }, gold: { carencia: '60 DIAS' } }), toques)],
    ['una fila declarada afuera que ya no está en la grilla', revisarEcos(GRILLA, toques, { ...FUERA_DE_LA_FILA, 'ECOGRAFIA QUE NO EXISTE': { silver: 60, gold: 60, porque: 'prueba' } })],
    ['«legrado (raspado del útero)», sin «evacuador»', revisar26(items, COV.CIRUGIAS_26.map((x) => (/^legrado/.test(x) ? 'legrado (raspado del útero)' : x)))],
    ['dos cirugías cambiadas de lugar', revisar26(items, [COV.CIRUGIAS_26[1], COV.CIRUGIAS_26[0], ...COV.CIRUGIAS_26.slice(2)])],
    ['el cuadernillo con 25', revisar26(items.slice(0, 25), COV.CIRUGIAS_26)],
    ['un nombre del cuadernillo cambiado', revisar26(items.map((x, i) => (i === 22 ? 'Pterigión' : x)), COV.CIRUGIAS_26)],
    // Los cuatro de la tercera tanda, cambiados en las dos puntas: tienen que
    // caer por el calificativo, no por la igualdad de los pares.
    ['«sacar el adenoma de próstata», sin «a cielo abierto»', porCalificativo(3, enLasDos(3, 'sacar el adenoma de próstata'))],
    ['«sacar el apéndice, sin complicaciones», sin «no complicada»', porCalificativo(5, enLasDos(5, 'sacar el apéndice, sin complicaciones'))],
    ['«legrado evacuador (raspado del útero)», con la traducción que incluye el de diagnóstico', porCalificativo(19, enLasDos(19, 'legrado evacuador (raspado del útero)'))],
    ['«pielolitotomía (sacar una piedra de la pelvis del riñón)», sin «abierta»', porCalificativo(21, enLasDos(21, 'pielolitotomía (sacar una piedra de la pelvis del riñón)'))],
  ];
  const pasan = [
    ['una fila nueva de otro grupo que no se llama «ECOGRAFIA…» (no se mira)', nuevos(revisarEcos(conFila(GRILLA, { item: 'TOMOGRAFIA NUEVA', grupo: 'TOMOGRAFIAS', silver: { carencia: '90 DIAS' }, gold: { carencia: '90 DIAS' } }), toques), hoyEco)],
    ['otra palabra de casa con los calificativos de su ítem, en las dos puntas', nuevos(enLasDos(3, 'sacar el adenoma de la próstata, a cielo abierto'), hoy26)],
    ['la hemorroidectomía «abierta o cerrada» sin «abierta» (nombra las dos técnicas)', nuevos(enLasDos(12, 'hemorroidectomía (cirugía para sacar las hemorroides)'), hoy26)],
    // El literal del cuadernillo pasa su propia regla (ronda 2, 23/10): las 26
    // tal como las dice el ítem, en minúscula, en las dos puntas; y una palabra
    // de casa para el apéndice que dice la condición con otras palabras.
    ['las 26 en literal, en las dos puntas', nuevos(revisar26(items, LITERAL(items), items.map((x, i) => [x, LITERAL(items)[i]])), hoy26)],
    ['«sacar el apéndice, si la apendicitis no está complicada», en las dos puntas', nuevos(enLasDos(5, 'sacar el apéndice, si la apendicitis no está complicada'), hoy26)],
  ];
  for (const [que, h] of casos) if (!h.length) f.push(que + ': tenía que fallar y pasa');
  for (const [que, h] of pasan) if (h.length) f.push(que + ': tenía que pasar y falla (' + h[0] + ')');
  return { fallas: f, casos: casos.length, pasan: pasan.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = autoprueba();
  if (a.fallas.length) { console.error('✗ listas contra su fuente: la autoprueba no distingue lo que debe marcar:\n  ' + a.fallas.join('\n  ')); process.exit(1); }
  console.log('✓ listas contra su fuente, autoprueba: los ' + a.casos + ' casos que tienen que fallar, fallan, y los ' + a.pasan + ' que tienen que pasar, pasan (más el de hoy, abajo)');
  const h = [...revisarEcos(GRILLA, COV.TOQUES), ...revisar26(ESSENTIAL.cobertura_clave.cirugias_lista_26.items, COV.CIRUGIAS_26)];
  if (h.length) { console.log('✗ listas contra su fuente: ' + h.length + ' hallazgo(s):\n  ' + h.join('\n  ')); process.exit(1); }
  const S = esperan90(GRILLA, 'silver'), G = esperan90(GRILLA, 'gold');
  console.log('✓ ecografías que esperan 3 meses: Silver ' + S.tres.size + ' nombres y Gold ' + G.tres.size + (G.asesor.length ? ' (más «' + G.asesor.join('», «') + '»)' : '') + ', los mismos que la grilla (' + filasDeEco(GRILLA).length + ' filas miradas)');
  console.log('✓ las 26 cirugías: essential.json y CIRUGIAS_26, par por par, en el orden del cuadernillo y con los calificativos de cada ítem (' + CALIFICATIVOS.length + ' reglas)');
  console.log('· fuera del toque, con su porqué: ' + Object.keys(FUERA_DE_LA_FILA).join(', '));
}
