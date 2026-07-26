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
  semisuite: {
    t: 'Semi-suite',
    d: 'El tipo de habitación en la que te internás: privada, con baño propio y lugar para un acompañante.',
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
};

export function Term({ k, children }) {
  const term = TERMS[k];
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
  const id = useId();

  useEffect(() => {
    if (!open) { setShift(0); return; }
    const el = bubbleRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const M = 8; // margen mínimo contra el borde
      // clientWidth, NO innerWidth: en emulación móvil (y con barra de scroll)
      // innerWidth se ensancha cuando algo ya desbordó — medimos 373 en un
      // viewport de 360 y la corrección salía corta. clientWidth es el viewport
      // de layout real. (Hallazgo QA /planes, 26 jul 2026.)
      const vw = document.documentElement.clientWidth;
      let s = 0;
      if (r.left < M) s = M - r.left;
      else if (r.right > vw - M) s = (vw - M) - r.right;
      if (s) setShift(s);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onOut);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onOut); };
  }, [open]);

  if (!term) return children || null;

  return (
    <span ref={ref} style={css('position:relative;display:inline-block')}>
      <button
        type="button"
        aria-describedby={id}
        aria-expanded={open}
        onPointerDown={(e) => { lastPointer.current = e.pointerType || 'mouse'; }}
        // Con mouse manda el hover, así que el click no toca nada (si toggleara,
        // hacer click sobre algo ya abierto lo cerraría de golpe).
        onClick={(e) => { e.stopPropagation(); if (lastPointer.current !== 'mouse') setOpen((o) => !o); }}
        onPointerEnter={(e) => { if ((e.pointerType || 'mouse') === 'mouse') setOpen(true); }}
        onPointerLeave={(e) => { if ((e.pointerType || 'mouse') === 'mouse') setOpen(false); }}
        // Solo el foco de TECLADO abre. En mouse y touch el click también enfoca
        // el botón, y abrir ahí volvería a pelearse con el toggle de arriba.
        onFocus={(e) => { if (e.target.matches?.(':focus-visible')) setOpen(true); }}
        onBlur={() => setOpen(false)}
        // Subrayado punteado: la convención de "esto se puede consultar". No usa
        // color de link para no competir con los links reales de la página.
        style={css('font:inherit;color:inherit;background:none;border:0;padding:0;cursor:help;border-bottom:1px dotted #007d77;text-underline-offset:2px')}
      >
        {children || term.t}
      </button>
      {/* (1) La definición para lectores de pantalla: siempre presente, nunca
          visible, y con clip para que no ocupe ni un píxel de layout. */}
      <span id={id} style={css('position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0')}>
        {term.t}: {term.d}
      </span>
      {/* (2) La burbuja visual: decorativa (el texto ya lo da el span de arriba),
          y con display:none cuando está cerrada para no inflar el scrollWidth. */}
      <span
        ref={bubbleRef}
        aria-hidden="true"
        style={css(
          // OJO con el signo: calc(-50% + -20px) es CSS INVÁLIDO y el navegador
          // descarta la declaración entera en silencio. El signo va en el
          // operador, no pegado al número.
          'position:absolute;left:50%;transform:translateX(calc(-50% ' + (shift < 0 ? '- ' + Math.abs(shift) : '+ ' + shift) + 'px));bottom:calc(100% + 8px);z-index:40;'
          + 'width:max-content;max-width:min(260px,72vw);padding:10px 12px;border-radius:10px;background:#003B71;color:#fff;'
          + 'font-family:var(--font-inter),system-ui,sans-serif;font-size:12.5px;font-weight:400;line-height:1.45;text-align:left;white-space:normal;'
          + 'box-shadow:0 6px 20px rgba(0,0,0,.18);pointer-events:none;'
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
export function waitLabel(days) {
  if (days === null || days === undefined) return null;
  if (days === 0) return 'Sin espera';
  if (days < 60) return `${days} días de espera`;
  const m = Math.round(days / 30);
  return `${m} meses de espera`;
}

// Reconoce términos del glosario dentro de un texto y los envuelve en <Term>.
// Así no hay que anotar a mano cada string de cobertura: si mañana aparece
// "semi-suite" en una descripción nueva, se explica sola. Solo marca la PRIMERA
// aparición de cada término por texto — subrayar la misma palabra tres veces en
// una línea es ruido, no ayuda.
const MATCHERS = [
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
