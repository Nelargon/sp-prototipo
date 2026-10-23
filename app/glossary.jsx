'use client';
// Glosario — explicar la palabra donde aparece, no en otra página.
//
// Pedido del usuario (26 jul 2026): "es muy importante siempre explicar qué
// significa cada cosa… será que podemos hacer que la gente ponga el hover con
// su mouse o con su dedo en el móvil para que, cuando vea ese término, pueda
// entender qué significa".
//
// Es la regla de lenguaje del proyecto llevada un paso más: cuando una palabra
// del rubro no se puede evitar (carencia, copago, semi-suite existen en el
// contrato y la familia se las va a encontrar igual), la web no la esconde ni
// la deja sin explicar — la explica AHÍ, en el lugar donde aparece.
//
// Accesibilidad: funciona con mouse (hover), dedo (tap) y teclado (focus). Es
// un <button>, no un <span>, para que el teclado llegue y el lector de pantalla
// lo anuncie. Escape cierra.
//
// La definición vive DOS veces y a propósito (hallazgo del QA, 26 jul 2026):
//   1. Un span visualmente oculto pero SIEMPRE presente, al que apunta
//      aria-describedby. El lector de pantalla lo lee sin que nadie abra nada.
//   2. La burbuja visual, marcada aria-hidden y con display:none cuando está
//      cerrada.
// La razón de separarlas es de layout, no de semántica: una burbuja posicionada
// en absolute con visibility:hidden SIGUE contando para el scrollWidth del
// documento, y en 430 px desbordaba la página 2 px. Con display:none no ocupa
// nada, y la accesibilidad no se pierde porque vive en el span oculto.

import { useState, useRef, useEffect, useId } from 'react';
import { css } from './css';
import { trackExplicacion } from './track';

// Definiciones en idioma de familia (regla de lenguaje del CLAUDE.md): sin
// jerga, sin "prestación", sin "cartilla". Si una definición necesita otra
// palabra difícil para explicarse, está mal escrita.
export const TERMS = {
  carencia: {
    t: 'Carencia',
    d: 'Es el tiempo que hay que esperar desde que te afiliás hasta poder usar una cobertura. Arranca el día que te afiliás, no el día que la necesitás.',
  },
  copago: {
    t: 'Copago',
    d: 'Vos pagás una parte y Salud Protegida la otra. Cuando dice "copago 50%", pagás la mitad.',
  },
  // Semi-suite (13/10/2026, decisión 2A de Arturo, sp-interno#89): decía
  // «privada, con baño propio». Los cuadernillos de Silver y Gold (2.4.4.1)
  // dicen «semi suite, incluye cama para el acompañante, según disponibilidad
  // del prestador»: ni «privada» ni baño. Se define con lo que está escrito.
  semisuite: {
    t: 'Semi-suite',
    d: 'Así llama el contrato de Silver y Gold a la habitación donde te internás, con cama para un acompañante, según lo que tenga el sanatorio.',
  },
  nursery: {
    t: 'Nursery',
    d: 'La sala donde cuidan al recién nacido en el sanatorio, con enfermería las 24 horas.',
  },
  tope: {
    t: 'Tope',
    d: 'La cantidad máxima de veces que podés usar algo en un año, o el monto máximo que cubre el plan.',
  },
  arancel: {
    t: 'Arancel diferenciado',
    d: 'El plan no lo cubre, pero tenés un precio acordado más bajo que el de la calle.',
  },
  preexistencia: {
    t: 'Preexistencia',
    d: 'Una condición de salud que ya tenías antes de afiliarte.',
  },
  // Los cuatro términos del bloque de lo que no cubrimos (pedido de Arturo,
  // 26 jul 2026: "no se explica tratamiento oncológico o cirugía bariátrica").
  // Cada definición dice también qué SÍ está cubierto al lado — porque es
  // verdad y porque una exclusión sin contexto asusta más de lo que informa.
  // Verificado contra la grilla: la consulta de Oncología Clínica está cubierta
  // con copago; las de Cardiocirugía y Neurocirugía, SIN TOPE en los tres
  // planes; y las radiografías dentales son estudio de imagen, sí cubierto.
  oncologico: {
    t: 'Tratamiento oncológico',
    d: 'El tratamiento del cáncer en sí: quimioterapia, radioterapia y las cirugías para tratarlo. La consulta con el oncólogo sí entra (en Silver y Gold pagás la mitad) — lo que no entra es el tratamiento.',
  },
  bariatrica: {
    t: 'Cirugía bariátrica',
    d: 'La operación para bajar de peso cuando la obesidad pone en riesgo la salud: por ejemplo la manga gástrica o el bypass.',
  },
  altacomplejidad: {
    t: 'Alta complejidad',
    d: 'Las cirugías más grandes y delicadas: las del corazón, las del cerebro y las de los vasos sanguíneos principales. Las consultas con esos especialistas sí entran en Silver y Gold — lo que no entra es la cirugía.',
  },
  // Hemodinamia: figura sin cobertura en Silver y Gold (silver.json/gold.json,
  // "sin_cobertura_arancel_diferenciado") y no está en la lista de Essential.
  // Hasta el 25/09/2026 no se nombraba en ningún lado del sitio.
  hemodinamia: {
    t: 'Hemodinamia',
    d: 'Los estudios y tratamientos que se hacen con un catéter por dentro de las arterias del corazón: el cateterismo y la angioplastia. La consulta con el cardiólogo sí entra.',
  },
  odontologia: {
    t: 'Odontología',
    // Essential (24/09/2026) cubre lo básico en Lister (cuadernillo, 1.6).
    d: 'La atención del dentista: limpiezas, arreglos, extracciones, tratamientos. Essential cubre lo básico, solo en Lister: consulta, controles, extracciones simples y limpieza. En Silver y Gold no entra, salvo las radiografías dentales, que son un estudio de imagen.',
  },
};

// `dict` permite usar el mismo componente con otro diccionario — hoy el médico
// (app/glosario-medico.js), que está en borrador y vive aparte a propósito: no
// se mezcla lo validado con lo que todavía no lo está — y TOQUES de coverage.js,
// las listas que se abren en las esperas (9A y 10A, 23/10/2026). `tipo` es cómo
// se cuenta al abrirse: 'toque' para esas listas, así la medición no las mezcla
// con las palabras del glosario.
export function Term({ k, children, dict, tipo = 'glosario' }) {
  const term = (dict || TERMS)[k];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  // Con qué se tocó por última vez. Sin esto, en móvil el tap dispara PRIMERO
  // un mouseenter sintético (abre) y enseguida el click (cierra): la burbuja
  // nunca llega a verse con el dedo — bug encontrado por el QA, 26 jul 2026.
  const lastPointer = useRef('mouse');
  const bubbleRef = useRef(null);
  // Corrimiento horizontal para que la burbuja no se salga de la pantalla.
  // Centrada con translateX(-50%) alcanza casi siempre, pero un término cerca
  // del borde en 360 px la empuja afuera (12 px, hallazgo QA en /planes). Se
  // mide al abrir y se corrige; no se puede resolver solo con CSS porque
  // depende de dónde cayó la palabra en la línea.
  const [shift, setShift] = useState(0);
  // Arriba por defecto; abajo cuando arriba no hay lugar. Ver el efecto.
  const [abajo, setAbajo] = useState(false);
  // El alto máximo cuando no entra ni arriba ni abajo (null: entra entera). Con
  // alto, la burbuja scrollea por dentro (23/10/2026, verificador de código: en
  // el celular, las 26 cirugías quedaban debajo de la cabecera fija).
  const [alto, setAlto] = useState(null);
  // Con el mouse, salir del botón cierra; pero si la burbuja scrollea, hay que
  // poder llegar a ella: el cierre espera un momento y entrar lo cancela.
  const salida = useRef(null);
  const id = useId();

  // Cuántas personas abren cada palabra (sp-interno#98): una vez por página.
  useEffect(() => { if (open) trackExplicacion(tipo, k); }, [open, k, tipo]);

  useEffect(() => {
    if (!open) { setShift(0); setAbajo(false); setAlto(null); return; }
    const el = bubbleRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const M = 8; // margen mínimo contra el borde

    // El borde que importa NO siempre es el de la pantalla. Un ancestro con
    // overflow:hidden recorta la burbuja sin avisar — es lo que hacen las
    // fichas de /que-cubre, que usan overflow:hidden para redondear las
    // esquinas. La burbuja salía cortada y el test de "¿aparece el texto?"
    // pasaba igual, porque el texto vive en el span oculto para lectores de
    // pantalla. Solo se vio midiendo la caja contra la del ancestro.
    // (BITACORA cap. 76.) No se toca el overflow de la tarjeta: se acomoda
    // la burbuja adentro.
    // Desde el 23/10/2026 cuentan todas las cajas que recortan, no solo la
    // primera, y también las que scrollean por dentro (auto o scroll): la
    // tarjeta de esperas del simulador está adentro del cuerpo del simulador,
    // que en la computadora scrollea y recorta (10A).
    let corta = null;
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (/hidden|clip|auto|scroll/.test(cs.overflow + cs.overflowX + cs.overflowY)) {
        const q = a.getBoundingClientRect();
        corta = corta ? { left: Math.max(corta.left, q.left), right: Math.min(corta.right, q.right), top: Math.max(corta.top, q.top), bottom: Math.min(corta.bottom, q.bottom) } : { left: q.left, right: q.right, top: q.top, bottom: q.bottom };
      }
    }
    // clientWidth, NO innerWidth: en emulación móvil (y con barra de scroll)
    // innerWidth se ensancha cuando algo ya desbordó — medimos 373 en un
    // viewport de 360 y la corrección salía corta. (Hallazgo QA /planes,
    // 26 jul 2026.)
    const vw = document.documentElement.clientWidth;
    let min = M, max = vw - M;
    // El techo y el piso de lo que se ve: el ancestro que recorta (si hay) y,
    // arriba, también la cabecera fija (nav[data-nav], z-index 100), que tapa lo
    // que pasa por debajo. Hasta el 23/10/2026 el techo era el borde de la
    // pantalla (o solo el del ancestro): una lista larga que abría hacia arriba
    // quedaba debajo de la cabecera (las 26 cirugías miden unos 366 px; 10A).
    const nav = document.querySelector('[data-nav]');
    const techoNav = nav && getComputedStyle(nav).position === 'fixed' ? nav.getBoundingClientRect().bottom : 0;
    let techo = Math.max(M, techoNav + M), piso = window.innerHeight - M;
    if (corta) {
      const rc = corta;
      min = Math.max(min, rc.left + 4);
      max = Math.min(max, rc.right - 4);
      techo = Math.max(techo, rc.top);
      piso = Math.min(piso, rc.bottom);
    }
    // Arriba por defecto. Si arriba no entra y abajo sí, se abre hacia abajo.
    // Si no entra en ninguno de los dos (las 26 cirugías en el celular: unos
    // 400 px, contra la cabecera fija arriba y el cuadro de esperas, que
    // recorta, abajo), se abre hacia el lado más grande, con ese alto como
    // máximo y scroll por dentro (23/10/2026). Hasta entonces quedaba del lado
    // más grande pero entera, y lo que no entraba quedaba tapado.
    if (r.top < techo && ref.current) {
      const b = ref.current.getBoundingClientRect();
      const lugarAbajo = piso - (b.bottom + 8), lugarArriba = b.top - 8 - techo;
      if (lugarAbajo >= r.height) setAbajo(true);
      else {
        const haciaAbajo = lugarAbajo > lugarArriba;
        setAbajo(haciaAbajo);
        setAlto(Math.max(0, Math.floor(haciaAbajo ? lugarAbajo : lugarArriba)));
      }
    }

    let s = 0;
    if (r.left < min) s = min - r.left;
    else if (r.right > max) s = max - r.right;
    if (s) setShift(s);
  }, [open]);

  // Cada vez que scrollea, la lista arranca desde arriba: el navegador guarda
  // dónde quedó la vez anterior y, al volver a abrirse, la mostraba por la mitad
  // (medido el 23/10/2026). Va cuando ya tiene su alto: antes no scrollea.
  useEffect(() => { if (open && alto !== null && bubbleRef.current) bubbleRef.current.scrollTop = 0; }, [open, alto]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    // Tocar adentro (la burbuja, cuando scrollea) no cierra: ref la contiene.
    const onOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onOut);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onOut); clearTimeout(salida.current); };
  }, [open]);

  // Con el mouse: salir cierra; si la burbuja scrollea, después de un momento,
  // para poder pasar a ella. Entrar al botón o a la burbuja cancela el cierre.
  const quedar = () => { clearTimeout(salida.current); };
  const irse = (e) => {
    if ((e.pointerType || 'mouse') !== 'mouse') return;
    clearTimeout(salida.current);
    if (alto === null) setOpen(false);
    else salida.current = setTimeout(() => setOpen(false), 250);
  };
  // Con el teclado, cuando la burbuja scrollea: las flechas y las páginas la
  // mueven (no se puede llegar a ella con Tab: está fuera del orden).
  const mover = (e) => {
    const u = bubbleRef.current;
    if (!open || alto === null || !u) return;
    const d = { ArrowDown: 40, ArrowUp: -40, PageDown: u.clientHeight - 32, PageUp: 32 - u.clientHeight }[e.key];
    if (d) { e.preventDefault(); u.scrollBy({ top: d, behavior: 'instant' }); }
  };

  if (!term) return children || null;

  // Un toque (9A y 10A) es una frase («de una lista de 26») que tiene que poder
  // partirse como el texto que la rodea: la caja va en línea (inline, no
  // inline-block) y el subrayado es text-decoration, que se dibuja en cada
  // renglón. Por eso un toque no es un <button>: Chrome dibuja un botón con
  // display:inline como inline-block (lo pide el estándar de HTML; medido el
  // 23/10/2026), y una caja así no se parte. Es un <span role="button">, que el
  // teclado alcanza (tabIndex 0) y abre con Enter o Espacio, como un botón.
  // Hasta el 23/10/2026 era un botón con nowrap: partido se centraba en dos
  // renglones, y entero se salía 17 px del encabezado de su fila en el cuadro de
  // esperas del celular, a 360 (verificador de código).
  const enLinea = tipo === 'toque';
  const Toca = enLinea ? 'span' : 'button';
  const comoBoton = enLinea
    ? {
      role: 'button', tabIndex: 0,
      onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); return; }
        mover(e);
      },
    }
    : { type: 'button', onKeyDown: mover };
  return (
    <span ref={ref} style={css('position:relative;display:' + (enLinea ? 'inline' : 'inline-block'))}>
      <Toca
        {...comoBoton}
        // .txt: una palabra dentro de una frase se atenúa al tocarla, no se
        // achica como un botón (sistema táctil, app/globals.css).
        className="txt"
        aria-describedby={id}
        aria-expanded={open}
        onPointerDown={(e) => { lastPointer.current = e.pointerType || 'mouse'; }}
        // Con mouse manda el hover, así que el click no toca nada (si toggleara,
        // hacer click sobre algo ya abierto lo cerraría de golpe). Con el
        // teclado (Enter o Espacio, un click con e.detail 0) abre y cierra: una
        // tecla no dispara pointerdown, y lastPointer quedaba en 'mouse', así que
        // después de un Escape no había forma de reabrir (verificador de código,
        // 23/10/2026).
        onClick={(e) => { e.stopPropagation(); if (e.detail === 0 || lastPointer.current !== 'mouse') setOpen((o) => !o); }}
        onPointerEnter={(e) => { if ((e.pointerType || 'mouse') === 'mouse') { quedar(); setOpen(true); } }}
        onPointerLeave={irse}
        // Solo el foco de TECLADO abre. En mouse y touch el click también enfoca
        // el botón, y abrir ahí volvería a pelearse con el toggle de arriba.
        onFocus={(e) => { if (e.target.matches?.(':focus-visible')) setOpen(true); }}
        onBlur={(e) => { if (!(ref.current && e.relatedTarget && ref.current.contains(e.relatedTarget))) setOpen(false); }}
        // Subrayado punteado: la convención de "esto se puede consultar". No usa
        // color de link para no competir con los links reales de la página.
        style={css(enLinea
          ? 'cursor:help;text-decoration:underline dotted var(--sp-teal-deep);text-decoration-thickness:1px;text-underline-offset:2px'
          : 'font:inherit;color:inherit;background:none;border:0;padding:0;cursor:help;border-bottom:1px dotted var(--sp-teal-deep);text-underline-offset:2px')}
      >
        {children || term.t}
      </Toca>
      {/* (1) La definición para lectores de pantalla: siempre presente, nunca
          visible, y con clip para que no ocupe ni un píxel de layout. Con
          aria-hidden: la lee el botón como su descripción (aria-describedby
          apunta acá, y un nodo oculto que se nombra directo se lee igual), pero
          no se suma al nombre de lo que la rodea. Sin aria-hidden, en el cuadro de
          esperas del celular el encabezado de fila «Cirugías programadas» se
          llamaba con las 26 cirugías enteras, 839 caracteres que el lector
          repetía en cada celda (verificador de código, 23/10/2026). */}
      <span id={id} aria-hidden="true" style={css('position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0')}>
        {term.t}: {term.d}
      </span>
      {/* (2) La burbuja visual: decorativa (el texto ya lo da el span de arriba),
          y con display:none cuando está cerrada para no inflar el scrollWidth. */}
      {/* Cuando scrollea (alto), recibe el dedo y la rueda: pointer-events y
          overscroll-behavior, y apretarla no le saca el foco al botón (si no, el
          onBlur la cerraba). Fuera del orden del Tab (tabIndex -1): Chrome hace
          enfocable con el teclado una caja que scrollea, y esta es decorativa. */}
      <span
        ref={bubbleRef}
        aria-hidden="true"
        tabIndex={alto !== null ? -1 : undefined}
        onPointerEnter={(e) => { if ((e.pointerType || 'mouse') === 'mouse') quedar(); }}
        onPointerLeave={irse}
        onMouseDown={(e) => { if (alto !== null) e.preventDefault(); }}
        style={css(
          // OJO con el signo: calc(-50% + -20px) es CSS INVÁLIDO y el navegador
          // descarta la declaración entera en silencio. El signo va en el
          // operador, no pegado al número.
          'position:absolute;left:50%;transform:translateX(calc(-50% ' + (shift < 0 ? '- ' + Math.abs(shift) : '+ ' + shift) + 'px));' + (abajo ? 'top:calc(100% + 8px);' : 'bottom:calc(100% + 8px);') + 'z-index:40;'
          // `ancho`: una entrada larga del diccionario puede pedir una burbuja más
          // ancha (y así más baja): las 26 cirugías de Essential no entraban,
          // a 260 px, en la tarjeta de esperas del simulador en la computadora,
          // que recorta (10A, 23/10/2026). En el celular manda el 72vw.
          + 'width:max-content;max-width:min(' + (term.ancho || 260) + 'px,72vw);padding:10px 12px;border-radius:var(--r-xs);background:var(--sp-navy);color:#fff;'
          + 'font-family:var(--font-inter),system-ui,sans-serif;font-size:12.5px;font-weight:400;line-height:1.45;text-align:left;white-space:normal;'
          + 'box-shadow:var(--sombra-abre);'
          + (alto !== null ? 'max-height:' + alto + 'px;overflow-y:auto;overscroll-behavior:contain;pointer-events:auto;' : 'pointer-events:none;')
          + (open ? 'display:block' : 'display:none')
        )}
      >
        <strong style={css('font-family:var(--font-display),system-ui,sans-serif;font-weight:700;display:block;margin-bottom:2px')}>{term.t}</strong>
        {term.d}
      </span>
    </span>
  );
}

// Texto de espera en idioma de familia. 300 días se dice "10 meses": nadie
// cuenta en días a esa escala, y "300 días" suena a letra chica mientras que
// "10 meses" se entiende de una.
// `corto` omite el "de espera": en una lista con encabezado propio ("Cuánto
// esperás para usarlo") repetirlo nueve veces es ruido, no claridad.
export function waitLabel(days, corto = false) {
  if (days === null || days === undefined) return null;
  if (days === 0) return 'Sin espera';
  const suf = corto ? '' : ' de espera';
  if (days < 60) return `${days} días${suf}`;
  const m = Math.round(days / 30);
  // 365 días son "1 año", no "12 meses": así lo dice una familia (Essential
  // espera un año para internación, cirugías y parto).
  if (m === 12) return `1 año${suf}`;
  return `${m} meses${suf}`;
}

// Reconoce términos del glosario dentro de un texto y los envuelve en <Term>.
// Así no hay que anotar a mano cada string de cobertura: si mañana aparece
// "semi-suite" en una descripción nueva, se explica sola. Solo marca la PRIMERA
// aparición de cada término por texto — subrayar la misma palabra tres veces en
// una línea es ruido, no ayuda.
const MATCHERS = [
  // Los más largos primero: "tratamiento oncológico" tiene que ganarle a
  // cualquier coincidencia más corta que caiga adentro.
  [/tratamiento oncológico/i, 'oncologico'],
  [/cirugía bariátrica/i, 'bariatrica'],
  [/alta complejidad/i, 'altacomplejidad'],
  [/hemodinamia/i, 'hemodinamia'],
  [/odontología/i, 'odontologia'],
  [/semi-?suite/i, 'semisuite'],
  [/copago/i, 'copago'],
  [/nursery/i, 'nursery'],
  [/carencias?/i, 'carencia'],
  [/arancel diferenciado/i, 'arancel'],
  [/preexistencias?/i, 'preexistencia'],
];

export function annotate(text) {
  if (typeof text !== 'string' || !text) return text;
  // Busca la primera coincidencia de cualquier término y parte el texto ahí;
  // el resto se procesa recursivamente, saltando el término ya marcado.
  let best = null;
  for (const [rx, key] of MATCHERS) {
    const m = rx.exec(text);
    if (m && (best === null || m.index < best.i)) best = { i: m.index, len: m[0].length, word: m[0], key };
  }
  if (!best) return text;
  const before = text.slice(0, best.i);
  const after = text.slice(best.i + best.len);
  return [
    before,
    <Term key={`t-${best.i}`} k={best.key}>{best.word}</Term>,
    // El resto sigue procesándose: un texto puede tener dos términos distintos.
    annotate(after),
  ];
}

// ── Marcar UNA sola palabra médica por ficha ──────────────────────────────
// Los nombres del tarifario ("BIOPSIA POR PUNCION, PIEL") traen a veces tres o
// cuatro palabras del diccionario. Subrayarlas todas es el ruido que Arturo
// nombró mirando la tira de logos: "parece que entramos a una perfumería".
// Se marca la PRIMERA que aparece y nada más: quien quiera la siguiente ya
// entendió el mecanismo. El nombre NO se toca — sigue coincidiendo letra por
// letra con la orden del médico, que es la decisión tomada en Buscador.jsx.
export function marcarTerminoMedico(nombre, dict) {
  if (typeof nombre !== 'string' || !nombre || !dict) return nombre;
  const sinTilde = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const plano = sinTilde(nombre);
  let mejor = null;
  for (const k of Object.keys(dict)) {
    // \b no sirve acá: los nombres vienen con comas y paréntesis pegados.
    const rx = new RegExp('(^|[^a-z0-9])(' + k + ')([^a-z0-9]|$)');
    const m = rx.exec(plano);
    if (m) {
      const i = m.index + m[1].length;
      if (mejor === null || i < mejor.i) mejor = { i, len: k.length, k };
    }
  }
  if (!mejor) return nombre;
  return [
    nombre.slice(0, mejor.i),
    <Term key="tm" k={mejor.k} dict={dict}>{nombre.slice(mejor.i, mejor.i + mejor.len)}</Term>,
    nombre.slice(mejor.i + mejor.len),
  ];
}
