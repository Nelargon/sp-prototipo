'use client';

import { useState, useEffect, createElement } from 'react';
import { BP } from './basePath';
import { css } from './css';
import { fmt, plans, WHATSAPP_NUMBER, SP_PHONE_DISPLAY, SP_TEL, YEARS_CARING } from './quote';
import { track } from './track';
import { coverage } from './coverage';
import { Term, waitLabel, annotate } from './glossary';

const INITIAL = {
  sel: 'Resonancia (RM)',
  mobileMenuOpen: false,
  faqOpen: null,
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

  // ===== pure data / helpers =====
  const iconEl = (path) =>
    createElement('svg', { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: '#80DDD8', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }, createElement('path', { d: path }));

  const toggleMenu = () => setState((s) => ({ mobileMenuOpen: !s.mobileMenuOpen }));
  const closeMenu = () => patch({ mobileMenuOpen: false });
  const toggleFaq = (i) => setState((s) => ({ faqOpen: s.faqOpen === i ? null : i }));

  // Cada respuesta que despierta una intención concreta termina en su paso
  // siguiente (WhatsApp prellenado con el tema, o el simulador): quien abre
  // una pregunta es un lead caliente — responder y no ofrecer la acción es
  // dejarlo ir (auditoría de conversión, jul 2026).
  // ORDEN Y CONTENIDO DERIVADOS DE DATO REAL (26 jul 2026): los 4 asesores del
  // equipo digital listaron, por separado y sin verse entre ellos, las 5
  // preguntas más frecuentes de los clientes. Coincidencias: precio 4/4,
  // diferencia entre planes 4/4, CARENCIA 4/4, qué cubre 3/4, descuentos 2/4,
  // "¿cubre en todo el país?" 2/4, profesionales específicos 2/4.
  // La FAQ anterior respondía 2 de esas 7. Las que faltaban se agregaron y el
  // orden sigue la frecuencia real, no nuestra intuición.
  // ⚠ Antes de sacar o reordenar una de estas, mirar la frecuencia: no las
  // elegimos nosotros. El detalle está en sp-interno (repo privado).
  const faqs = () => [
    { q: '¿Cuál es la diferencia entre Bronze, Silver y Gold?', a: 'Cada plan incluye todo lo del anterior y suma lo suyo. Bronze cubre lo esencial: urgencias 24 h, consultas (hasta 3 al año por especialidad), radiografías, ecografías e internación. Silver es el salto más grande: agrega resonancia y tomografía al 100%, sube a 5 consultas y estira fisioterapia y terapia intensiva. Gold saca casi todos los topes de consultas, baja algunas esperas y sube los montos de medicamentos en internación.', cta: { label: 'Compará los tres al detalle →', to: 'planes' } },
    { q: '¿Qué es la carencia y cuánto dura?', a: 'La carencia es el tiempo que esperás desde que te afiliás hasta poder usar una cobertura. Arranca el día que te afiliás, no el día que la necesitás. Los plazos reales de los planes vigentes: consultas y urgencias, sin espera; laboratorio y ecografías, unos 2 meses; tomografía, 2 meses (1 en Gold); fisioterapia, 3 meses; resonancia, 5 meses; la mayoría de las cirugías programadas, 7 meses; y parto, 10 meses en los tres planes (la cesárea baja a 5 meses en Gold). Por eso conviene afiliarse antes de necesitarlo: el reloj corre desde la firma.' },
    { q: '¿Hay descuento por la forma de pago?', a: 'Sí: pagando con débito automático o tarjeta de crédito tenés 10% de descuento sobre el precio de lista, todos los meses. Los precios que ves publicados son de lista, sin ese descuento aplicado.', cta: { label: 'Mirá tu precio con el descuento →', sim: true } },
    { q: '¿La cobertura vale en todo el país?', a: 'El precio del plan es el mismo en todo el país, y la red suma Lister —nuestro centro médico propio en Asunción— más de 50 prestadores en el resto del país. Cuánto tenés disponible cerca depende de tu ciudad: lo podés ver vos mismo en la Guía Médica, buscando por tu ciudad.', cta: { label: 'Buscá en tu ciudad →', to: 'guia' } },
    { q: '¿Está mi médico o mi sanatorio en la red?', a: 'Lo podés verificar ahora mismo en la Guía Médica: buscás por nombre del profesional, por especialidad, por estudio o por sanatorio. Si no aparece quien buscás, te mostramos alternativas cerca en vez de dejarte sin respuesta.', cta: { label: 'Abrí la Guía Médica →', to: 'guia' } },
    { q: '¿Cubren preexistencias?', a: 'Las preexistencias se evalúan caso por caso al momento de afiliarte. Contanos tu situación y te decimos exactamente qué cobertura aplica, sin sorpresas después.', cta: { label: 'Contanos tu caso por WhatsApp →', wa: 'Hola! Quiero consultar por preexistencias antes de afiliarme.', tema: 'preexistencias' } },
    { q: '¿Cómo doy de baja mi plan?', a: 'Podés dar de baja cuando quieras, escribiéndonos por WhatsApp o a atención al afiliado. Te explicamos el proceso y los plazos antes de confirmar la baja.' },
    { q: '¿Qué es Lister y en qué se diferencia de "la red"?', a: 'Lister es nuestro centro médico propio, con consultas, laboratorio e imagenología. "La red" suma Lister más de 50 prestadores externos en todo el país, según el plan que elijas.' },
    { q: '¿Cómo se calcula el precio de mi plan?', a: 'Depende de cuántas personas cubrís, sus edades y el plan que elijas — el precio es el mismo en todo el país, con IVA incluido.', cta: { label: 'Mirá tu precio en el simulador →', sim: true } },
    { q: '¿Puedo cambiar de plan más adelante?', a: 'Sí. Si tu familia crece o cambian tus necesidades, podés pedir un cambio de plan cuando quieras — un asesor te muestra las opciones y la diferencia de precio.', cta: { label: 'Consultá tu cambio por WhatsApp →', wa: 'Hola! Quiero consultar por un cambio de plan.', tema: 'cambio_plan' } },
  ];

  // Cada tarjeta se gana su lugar con una cláusula real del cuadernillo
  // (verificado contra los 4 contratos SP, jul 2026): telemedicina y
  // "laboratorio a domicilio" NO figuran en ningún plan — se quitaron para
  // no prometer lo que el contrato no respalda (el bloque "por escrito" no
  // puede sobreprometer). Números de médico a domicilio y salud mental salen
  // de las secciones 2.9.1.5 y consultas de los cuadernillos Bronze/Silver/Gold.
  const difsData = () => [
    { icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M16 13H8M16 17H8M10 9H8', title: 'Sin letra chica', body: 'Ves qué cubre tu plan y qué pagás aparte antes de firmar. Lo que está escrito es lo que recibís, sin sorpresas después.' },
    { icon: 'M3 11l9-8 9 8M5 9.5V20h14V9.5M12 12v5M9.5 14.5h5', title: 'Médico a domicilio', body: 'El médico va a tu casa: hasta 2, 3 o 4 consultas a domicilio al año según tu plan, más urgencias y ambulancia sin cargo.' },
    { icon: 'M20.8 5.6a5 5 0 0 0-8-1.3L12 5l-.8-.7a5 5 0 1 0-7 7.1l7.8 7.6 7.8-7.6a5 5 0 0 0 1-6.4Z', title: 'Salud mental incluida', body: 'Psicología y psiquiatría con sesiones cubiertas en los planes Bronze, Silver y Gold, no como un extra aparte.' },
  ];

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

  // ===== scroll / reveals (was componentDidMount; el manifiesto vive en /historia) =====
  useEffect(() => {
    let disposed = false;
    let bar = null;
    let onScroll = null;
    let loopRaf = null;
    try {
      const root = document.querySelector('[data-page="viva"]');
      if (!root) return;
      bar = root.querySelector('.sp-prog');
      if (!bar) { bar = document.createElement('div'); bar.className = 'sp-prog'; root.appendChild(bar); }
      const nav = root.querySelector('[data-nav]');
      const ctaBar = root.querySelector('[data-cta-bar]');
      const heroBg = root.querySelector('[data-hero-bg]');
      const heroContent = root.querySelector('[data-hero-content]');
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
      onScroll = () => {
        const y = (document.scrollingElement || document.documentElement).scrollTop || 0;
        const el = document.scrollingElement || document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
        if (nav) { if (y > 70) nav.classList.add('solid'); else nav.classList.remove('solid'); }
        if (ctaBar) { if (y > 640) ctaBar.classList.add('show'); else ctaBar.classList.remove('show'); }
        if (heroBg && y < 900) heroBg.style.transform = 'translateY(' + (y * 0.16) + 'px)';
        if (heroContent && y < 900) { heroContent.style.transform = 'translateY(' + (y * 0.14) + 'px)'; heroContent.style.opacity = String(Math.max(0, 1 - y / 620)); }
        revealCheck();
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      window.addEventListener('load', onScroll);
      const t0 = performance.now();
      const loop = () => { if (disposed) return; onScroll(); if (targets.length && performance.now() - t0 < 3200) loopRaf = requestAnimationFrame(loop); };
      loopRaf = requestAnimationFrame(loop);
    } catch (e) { /* no-op */ }

    return () => {
      disposed = true;
      if (onScroll) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        window.removeEventListener('load', onScroll);
      }
      if (loopRaf) cancelAnimationFrame(loopRaf);
      if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
    };
  }, []);

  useEffect(() => { try { document.documentElement.lang = 'es'; } catch (e) {} }, []);

  // Menú overlay: bloquear el scroll del fondo mientras está abierto; al
  // cerrar, re-sincronizar el estado del header (solid/transparente).
  useEffect(() => {
    try {
      document.body.style.overflow = state.mobileMenuOpen ? 'hidden' : '';
      if (!state.mobileMenuOpen) window.dispatchEvent(new Event('scroll'));
    } catch (e) {}
    return () => { try { document.body.style.overflow = ''; } catch (e) {} };
  }, [state.mobileMenuOpen]);

  // Manifiesto corto: registrar (una sola vez) que el visitante llegó a verlo.
  // ⚠ El umbral era 0.5 y con la sección fusionada dejó de ser alcanzable en
  // pantallas bajas (6 ago 2026, lo marcó la revisión del PR #86): la razón
  // máxima de intersección es alto-de-viewport / alto-de-sección, y en un
  // teléfono apaisado la sección mide más del doble del viewport — el evento
  // no se disparaba NUNCA, aunque la persona leyera el argumento entero.
  // Con threshold 0 + rootMargin negativo se dispara cuando la sección entra
  // en la banda central del viewport: alcanzable con cualquier alto de sección,
  // y sigue significando "llegó al argumento" y no "lo rozó al pasar".
  useEffect(() => {
    const el = document.querySelector('[data-mani-corto]');
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { track('manifesto_scroll', { profundidad: 100, pagina: 'home' }); io.disconnect(); }
      });
    }, { threshold: 0, rootMargin: '-25% 0px -25% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ===== derived render values (was renderVals) =====
  const plansArr = plans();
  const cartArr = coverage();
  const waDigits = (WHATSAPP_NUMBER || '').replace(/\D/g, '');
  // WhatsApp con el contexto puesto (salvaguarda Galperin, PLAN-home-v2 §4):
  // si la persona ya eligió un plan o abrió un tema, la conversación arranca
  // desde ahí — nunca desde cero.
  const waMsg = (texto) => (waDigits ? ('https://wa.me/' + waDigits + '?text=' + encodeURIComponent(texto)) : '#');
  const waHref = waMsg('Hola! Quiero información sobre los planes de Salud Protegida.');

  // Guía Médica (páginas estáticas en /guia). Es la puerta a "dónde/con quién
  // atenderte" — la búsqueda de médicos/sanatorios vive allá, donde devuelve
  // resultados; el home solo abre la puerta, no finge buscarla acá.
  const guiaHome = `${BP}/guia/guia_home.html`;

  // Qué cubre — explorador curado de coberturas (ex "buscador" que expulsaba a
  // la Guía Médica al no encontrar: BITACORA cap. 44). Con 11 coberturas reales
  // una caja de texto abierta promete saber todo y falla; los chips muestran lo
  // que REALMENTE tenemos y responden ahí mismo, sin redirección.
  const chips = cartArr.map((c) => ({
    name: c.name, onPick: () => { track('cartilla_select', { practica: c.name, via: 'chip' }); setState({ sel: c.name }); },
    // Chip activo en teal accesible #007d77 (blanco sobre #00BCB4 daba 2.37:1 —
    // hallazgo QA; mismo arreglo que /agendar). El resto, borde gris neutro.
    style: 'padding:9px 15px;border-radius:999px;border:1.5px solid ' + (state.sel === c.name ? '#007d77' : '#d9e4e2') + ';background:' + (state.sel === c.name ? '#007d77' : '#fff') + ';color:' + (state.sel === c.name ? '#fff' : '#3D3D3D') + ';font-size:13px;font-weight:' + (state.sel === c.name ? '700' : '500') + ';cursor:pointer;transition:all .15s',
  }));
  const sel = cartArr.find((c) => c.name === state.sel) || cartArr[0];
  const selRows = sel.cov.map((cv, i) => {
    const ok = cv.ok;
    // La carencia solo se muestra donde HAY cobertura: en un plan que no cubre
    // el servicio no hay espera que contar (ver la regla AD en coverage.js).
    const wait = ok && sel.wait ? waitLabel(sel.wait[i]) : null;
    return {
      plan: plansArr[i].name, color: plansArr[i].color, status: cv.s, detail: cv.d, wait,
      wrap: 'padding:18px 20px;border-left:' + (i === 0 ? '0' : '1px solid #F0F0F0'),
      badge: 'display:inline-flex;align-items:center;font-size:13px;font-weight:700;padding:4px 11px;border-radius:999px;' + (ok ? 'background:#E6F7F6;color:#007d77' : 'background:#F8F1DE;color:#7a5f10'),
    };
  });

  // Comparador "lo que cambia" (ola 2, iter 3 — feedback CX del usuario, BITACORA
  // cap. 48). Iter 2 (el teal condicional) apagaba a Gold y obligaba a leer una
  // regla antes de entender: "no me hagas pensar". Ahora: "Al 100%" en teal
  // CONSISTENTE en los tres (Gold no se apaga); Silver resaltado como "la más
  // elegida" (anclaje); una línea humana bajo cada plan (para quién es); sin
  // barras (eran ruido); y lo común, abajo, como GARANTÍA positiva, no letra chica.
  const FORWHOM = [
    'Lo esencial para quienes cuidan su prevención.',
    'La más elegida. Cobertura equilibrada para tu familia.',
    'Tranquilidad total, sin preocupaciones.',
  ];
  const planHead = plansArr.map((pl, i) => ({
    short: pl.short, price: fmt(pl.price), color: pl.color, forWhom: FORWHOM[i], recommended: i === 1,
    href: `${BP}/simulador/?plan=${pl.short.toLowerCase()}`,
    onCta: () => track('cta_simulador', { origen: 'comparador', plan: pl.name }),
  }));
  // ⚠ MATRIZ ÚNICA (6 ago 2026, pedido del usuario de bajar el scroll).
  // El home tenía DOS matrices de cobertura × plan una arriba de la otra: este
  // comparador (7 filas, 1849px) y el explorador "elegí una cobertura" del
  // bloque "qué cubre" (11 coberturas, 1188px). Cinco filas estaban en las dos.
  // 3037px —el 25% de la página— para responder dos veces la misma pregunta.
  // Ahora hay una sola tabla con las 9 coberturas que DIFIEREN entre planes;
  // las 4 que son iguales en los tres (ecografía, parto, laboratorio, terapia
  // intensiva) siguen resumidas abajo en la banda de garantía, que es donde
  // rinden — como veredicto positivo, no como filas que repiten "Al 100%" ×3.
  // Las dos nuevas respecto del comparador viejo salen de coverage(): terapia
  // intensiva y el tope de remedios de urgencias, que sí cambian por plan y
  // hasta hoy solo se veían dentro del explorador.
  const cmp = [
    { name: 'Resonancia (RM)', kind: 'status', cells: [{ t: 'Desde Silver', ok: false }, { t: 'Al 100%', ok: true }, { t: 'Al 100%', ok: true }] },
    { name: 'Tomografía (TAC)', kind: 'status', cells: [{ t: 'Copago 50%', ok: false }, { t: 'Al 100%', ok: true }, { t: 'Al 100%', ok: true }] },
    { name: 'Consultas por especialista', unit: 'al año', kind: 'num', cells: [{ t: '3' }, { t: '5' }, { t: 'Sin tope' }] },
    { name: 'Sesiones de psicología', unit: 'al año', kind: 'num', cells: [{ t: '3' }, { t: '5' }, { t: '6' }] },
    { name: 'Fisioterapia', unit: 'sesiones/año', kind: 'num', cells: [{ t: '10' }, { t: '15' }, { t: '20' }] },
    { name: 'Internación', unit: 'días/año', kind: 'num', cells: [{ t: '20' }, { t: '20' }, { t: '25' }] },
    { name: 'Días de terapia intensiva', unit: 'tope al año', kind: 'num', cells: [{ t: '3' }, { t: '5' }, { t: '6' }] },
    { name: 'Medicamentos internado', unit: 'tope por evento', kind: 'num', cells: [{ t: '₲500 mil' }, { t: '₲1 millón' }, { t: '₲1,5 mill.' }] },
    { name: 'Remedios en urgencias', unit: 'tope por evento', kind: 'num', cells: [{ t: '₲100 mil' }, { t: '₲150 mil' }, { t: '₲200 mil' }] },
  ];
  // ⚠ La banda dice qué SERVICIOS tenés en los tres planes; la tabla de arriba
  // dice dónde cambia el TOPE. Los dos son ciertos y no se contradicen, pero
  // solo si no comparten el nombre: por eso las filas se llaman "Días de
  // terapia intensiva" y "Remedios en urgencias", no "Terapia intensiva" y
  // "Urgencias". Una fila que se llama igual que un ítem de la garantía le dice
  // al lector dos cosas distintas sobre la misma palabra (lo marcó la revisión
  // del PR #91). Regla: si un servicio está en la banda, su fila en la tabla
  // tiene que nombrar el LÍMITE, no el servicio.
  const cmpIgual = 'Urgencias 24 h · Ecografías y radiografías · Parto y cesárea · Laboratorio · Terapia intensiva';

  // faq
  const faqList = faqs().map((f, i) => ({
    q: f.q, a: f.a, open: state.faqOpen === i,
    chevStyle: 'transition:transform .2s cubic-bezier(.22,1,.36,1);transform:rotate(' + (state.faqOpen === i ? '180deg' : '0deg') + ')',
    toggle: () => { if (state.faqOpen !== i) track('faq_open', { pregunta: f.q }); toggleFaq(i); },
    // Tres destinos posibles: el simulador, una página del sitio (`to`) o
    // WhatsApp. El `to` se sumó al agregar las preguntas que el equipo de
    // ventas reportó como frecuentes: varias se responden mejor mandando a
    // /planes o a la Guía que abriendo un chat. Sin este caso, un cta con `to`
    // caía en la rama de WhatsApp con mensaje vacío.
    cta: f.cta ? {
      label: f.cta.label,
      href: f.cta.sim ? `${BP}/simulador/`
        : f.cta.to === 'planes' ? `${BP}/planes/`
        : f.cta.to === 'guia' ? `${BP}/guia/guia_home.html`
        : waMsg(f.cta.wa),
      external: !f.cta.sim && !f.cta.to,
      onClick: () => (
        f.cta.sim ? track('cta_simulador', { origen: 'faq' })
        : f.cta.to ? track('faq_cta_interna', { origen: 'faq', destino: f.cta.to })
        : track('click_whatsapp', { origen: 'faq', tema: f.cta.tema })
      ),
    } : null,
  }));

  // how it works
  const stepsHow = [
    { n: '1', title: 'Simulá tu plan', body: 'Un minuto, con el precio incluido antes de dejar cualquier dato.' },
    { n: '2', title: 'Un asesor te contacta', body: 'Por WhatsApp o el medio que prefieras, sin apuro ni compromiso.' },
    { n: '3', title: 'Elegís y firmás', body: 'Online o presencial, con todas tus dudas resueltas antes de firmar.' },
    { n: '4', title: 'Activás tu credencial', body: 'Empezás a usar Lister y el resto de la red desde el día uno.' },
  ];

  const v = {
    waHref,
    mobileMenuOpen: state.mobileMenuOpen, mobileMenuClosed: !state.mobileMenuOpen,
    toggleMenu, closeMenu,
    chips,
    guiaHome,
    trackGuia: (via) => track('guia_handoff', { q: '', via }),
    selKey: sel.name, selName: sel.name, selIcon: iconEl(sel.icon), selRows,
    planHead, cmp, cmpIgual, planesHref: `${BP}/planes/`, stepsHow, faqList,
    difs: difsData(),
    aliados: [
      { name: 'Farmatotal', file: 'farmatotal.webp' },
      { name: 'Fisio Spa', file: 'fisiospa.webp' },
      { name: 'Barberos López', file: 'barberos.webp' },
      { name: 'Charpentier', file: 'charpentier.webp' },
      { name: 'Acuidarte', file: 'acuidarte.webp' },
      { name: 'Billio', file: 'billio.webp' },
      { name: 'Farmacia San José', file: 'sanjose.webp' },
      { name: 'Punto Farma', file: 'puntofarma.webp' },
      { name: 'Promedik', file: 'promedik.webp' },
      { name: 'Óptica Meister', file: 'meister.webp' },
      { name: 'Upalala', file: 'upalala.webp' },
      { name: 'Assist Card', file: 'assistcard.webp' },
    ],
    prestadores: ['Sanatorio', 'Laboratorio', 'Centro de imágenes', 'Clínica', 'Maternidad', 'Odontología', 'Cardiología', 'Pediatría', 'Emergencias 24 h', 'Traumatología'],
  };

  // ===== markup =====
  return (
    <div data-page="viva" className="body" style={css('color:#3D3D3D;background:#fff')}>

      {/* NAV */}
      <nav data-nav className={v.mobileMenuOpen ? 'menu-open' : undefined} style={css('position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 40px')}>
        <div className="nav-logo" style={css('position:relative;display:flex;align-items:center')}>
          <img src={`${BP}/assets/brand/logo-sp-color.png`} alt="Salud Protegida" className="nlogo-c" style={css('height:56px;display:block;position:relative;z-index:1')} />
          <img src={`${BP}/assets/brand/logo-sp-white.png`} alt="" className="nlogo-w" style={css('height:56px;position:absolute;left:0;top:0;z-index:2;transition:opacity .3s')} />
        </div>
        <div style={css('display:flex;align-items:center;gap:16px')}>
          <a href={'tel:' + SP_TEL} onClick={() => track('click_urgencias', { origen: 'header' })} aria-label={'Urgencias 24 h ' + SP_PHONE_DISPLAY} className="urg-pill" style={css('display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 15px;border-radius:12px;background:#E11900;color:#fff;font-size:13px;font-weight:800;white-space:nowrap;box-shadow:0 4px 14px rgba(225,25,0,0.28);flex:none')}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3a5.5 5.5 0 0 1 5.5 5.5M15 7a2.5 2.5 0 0 1 2.5 2.5" /><path d="M21 16.9v2.6a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 3.7 3h2.6a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.5 10.5a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" /></svg><span className="urg-word">Urgencias</span><span className="num-tnum">{SP_PHONE_DISPLAY}</span></a>
          <div className="nav-links-desktop" style={css('display:flex;align-items:center;gap:26px')}>
            <div className="navmenu-wrap">
              <a href="#cartilla" className="nav-link nav-link-menu" style={css('color:var(--nl,rgba(255,255,255,0.9));font-size:14px;font-weight:500;transition:color .3s;display:inline-flex;align-items:center;gap:5px')}>Cobertura <svg className="navmenu-chev" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></a>
              <div className="navmenu">
                <div className="navmenu-card">
                  {/* Ver la nota del mismo ítem en app/Header.jsx: el subtítulo
                      prometía un selector que ya no existe. */}
                  <a href="#cartilla" className="navmenu-item"><span className="navmenu-t">Qué cubre tu plan</span><span className="navmenu-s">Lo que cambia entre Bronze, Silver y Gold, de un vistazo</span></a>
                  <a href={`${BP}/que-cubre/`} onClick={() => track('nav_landing', { destino: 'que-cubre', origen: 'nav_menu' })} className="navmenu-item"><span className="navmenu-t">¿Está cubierto lo que me pidieron?</span><span className="navmenu-s">Buscá el estudio, análisis o cirugía por su nombre</span></a>
                  <a href="#bolsillo" className="navmenu-item"><span className="navmenu-t">Qué pagás de tu bolsillo</span><span className="navmenu-s">Copago, precio de convenio y lo que no cubre ningún plan</span></a>
                  <a href="#faq" className="navmenu-item"><span className="navmenu-t">Preguntas frecuentes</span><span className="navmenu-s">Carencias, preexistencias, cambios de plan y más</span></a>
                </div>
              </div>
            </div>
            <div className="navmenu-wrap">
              <a href="#comparar" className="nav-link nav-link-menu" style={css('color:var(--nl,rgba(255,255,255,0.9));font-size:14px;font-weight:500;transition:color .3s;display:inline-flex;align-items:center;gap:5px')}>Planes <svg className="navmenu-chev" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></a>
              <div className="navmenu">
                <div className="navmenu-card">
                  <a href="#comparar" className="navmenu-item"><span className="navmenu-t">Bronze, Silver y Gold</span><span className="navmenu-s">Compará qué gana cada nivel y cuánto sale</span></a>
                  <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'nav_menu' })} className="navmenu-item"><span className="navmenu-t">Plan Vital · 65 años o más</span><span className="navmenu-s">Pensado para tus padres o un adulto mayor</span></a>
                  <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'nav_menu' })} className="navmenu-item"><span className="navmenu-t">Simulá tu precio</span><span className="navmenu-s">Unas preguntas y ves el precio, en 1 minuto</span></a>
                                  </div>
              </div>
            </div>
            <a href={`${BP}/blog/`} className="nav-link" style={css('color:var(--nl,rgba(255,255,255,0.9));font-size:14px;font-weight:500;transition:color .3s')}>Blog</a>
            {/* Puerta persistente del afiliado en desktop (auditoría estratégica jul 2026,
                problema D): "Mi SP" solo vivía en el hero y el menú móvil; apenas se
                scrollea, el cliente actual se quedaba sin camino. Link discreto, no CTA,
                para no competir con la acción comercial única. */}
            <div className="navmenu-wrap">
              <a href={`${BP}/mi-sp/`} onClick={() => track('puerta_home', { puerta: 'ya_soy_sp', origen: 'nav' })} className="nav-link nav-link-menu" style={css('color:var(--nl,rgba(255,255,255,0.9));font-size:14px;font-weight:500;transition:color .3s;display:inline-flex;align-items:center;gap:5px')}>Mi SP <svg className="navmenu-chev" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></a>
              <div className="navmenu navmenu-right">
                <div className="navmenu-card">
                  <a href={`${BP}/agendar/`} onClick={() => track('cta_agendar', { origen: 'nav_misp' })} className="navmenu-item"><span className="navmenu-t">Agendar un turno</span><span className="navmenu-s">Pedí tu turno en Lister — directo, sin login</span></a>
                  <a href={`${BP}/guia/guia_home.html#mi-red`} onClick={() => track('puerta_home', { puerta: 'ver_red', origen: 'nav_misp' })} className="navmenu-item"><span className="navmenu-t">Ver mi red</span><span className="navmenu-s">Con tu cédula, mirá qué entra en tu plan</span></a>
                  <a href={`${BP}/mi-sp/`} onClick={() => track('puerta_home', { puerta: 'ya_soy_sp', origen: 'nav_misp' })} className="navmenu-item"><span className="navmenu-t">Ir a Mi SP</span><span className="navmenu-s">Tu espacio: credencial, turnos y más</span></a>
                </div>
              </div>
            </div>
            <a href={guiaHome} onClick={() => track('guia_handoff', { q: '', via: 'nav' })} className="nav-guia-cta" style={css('height:40px;padding:0 18px;border-radius:12px;font-size:14px;font-weight:700;display:inline-flex;align-items:center;gap:7px;white-space:nowrap')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>Guía Médica</a>
            <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'nav' })} className="btn-teal" style={css('height:40px;padding:0 20px;border-radius:12px;background:#007d77;color:#fff;font-size:14px;font-weight:700;display:inline-flex;align-items:center;gap:7px;white-space:nowrap')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" /></svg>Simulá tu plan</a>
          </div>
          <button className="nav-burger" onClick={v.toggleMenu} aria-expanded={v.mobileMenuOpen} aria-controls="mobile-menu" aria-label="Abrir menú" style={css('display:none;width:40px;height:40px;border-radius:10px;border:none;background:rgba(255,255,255,0.16);color:#fff;align-items:center;justify-content:center;cursor:pointer;flex:none')}>
            {v.mobileMenuClosed && <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>}
            {v.mobileMenuOpen && <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18" /></svg>}
          </button>
        </div>
      </nav>
      {/* Menú móvil: overlay a pantalla completa (patrón Apple/Tesla) — solo
          texto grande; urgencias NO se repite: ya vive en el header, siempre visible. */}
      {v.mobileMenuOpen && (
        <div id="mobile-menu" className="menu-overlay" role="dialog" aria-modal="true" aria-label="Menú">
          <nav style={css('display:flex;flex-direction:column')}>
            <a href={v.guiaHome} onClick={() => { track('guia_handoff', { q: '', via: 'menu_movil' }); v.closeMenu(); }} className="menu-item" style={{ animationDelay: '30ms' }}>Guía Médica</a>
            <a href="#cartilla" onClick={v.closeMenu} className="menu-item" style={{ animationDelay: '70ms' }}>Cobertura</a>
            <a href="#comparar" onClick={v.closeMenu} className="menu-item" style={{ animationDelay: '110ms' }}>Planes</a>
            <a href="#faq" onClick={v.closeMenu} className="menu-item" style={{ animationDelay: '150ms' }}>Preguntas</a>
            {/* Ver la nota en app/Header.jsx: el menú móvil es plano y sin
                esta entrada /que-cubre pierde su puerta en móvil. Misma
                pregunta que en escritorio, en cuerpo menor. */}
            <a href={`${BP}/que-cubre/`} onClick={() => { track('nav_landing', { destino: 'que-cubre', origen: 'menu_movil' }); v.closeMenu(); }} className="menu-item menu-item-sec" style={{ animationDelay: '170ms' }}>¿Está cubierto?</a>
            <a href={`${BP}/blog/`} onClick={v.closeMenu} className="menu-item" style={{ animationDelay: '190ms' }}>Blog</a>
            <a href={`${BP}/historia/`} onClick={v.closeMenu} className="menu-item" style={{ animationDelay: '230ms' }}>Historia</a>
            <a href={`${BP}/mi-sp/`} onClick={() => { track('puerta_home', { puerta: 'ya_soy_sp', origen: 'menu' }); v.closeMenu(); }} className="menu-item" style={{ animationDelay: '270ms', marginTop: '14px' }}>Mi SP →</a>
            <a href={`${BP}/agendar/`} onClick={() => { track('cta_agendar', { origen: 'menu_movil' }); v.closeMenu(); }} className="menu-item" style={{ animationDelay: '290ms' }}>Agendar turno →</a>
            <a href={`${BP}/simulador/`} onClick={() => { track('cta_simulador', { origen: 'menu_movil' }); v.closeMenu(); }} className="menu-item menu-item-cta" style={{ animationDelay: '310ms' }}>Simulá tu plan →</a>
          </nav>
        </div>
      )}

      {/* HERO */}
      <section data-hero style={css('position:relative;height:100vh;min-height:640px;overflow:hidden;background:#002A52;display:flex;align-items:center')}>
        <div data-hero-bg style={css("position:absolute;top:-5%;right:0;bottom:-5%;width:56%;background:url('" + BP + "/assets/hero.webp') center 25%/cover no-repeat;-webkit-mask:linear-gradient(90deg,transparent 0%,#000 34%);mask:linear-gradient(90deg,transparent 0%,#000 34%);will-change:transform")}></div>
        <div style={css('position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,25,48,0.5) 0%,rgba(0,25,48,0.3) 45%,rgba(0,25,48,0) 72%,rgba(0,25,48,0.15) 100%)')}></div>
        <div style={css('position:absolute;left:0;right:0;bottom:0;height:22%;background:linear-gradient(180deg,rgba(0,25,48,0) 0%,rgba(0,25,48,0.55) 100%)')}></div>
        <div data-hero-content style={css('position:relative;z-index:2;max-width:1200px;margin:0 auto;width:100%;padding:0 40px;color:#fff')}>
          <div style={css('max-width:720px')}>
            <div style={css('display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#80DDD8;margin-bottom:22px;border:1px solid rgba(128,221,216,.4);padding:7px 14px;border-radius:999px')}>+{YEARS_CARING} años cuidando familias paraguayas</div>
            <h1 className="disp disp-hero" style={css('font-size:76px;line-height:1.02;letter-spacing:-0.025em;margin:0 0 22px')}>Protección que<br /><span style={css('color:#00BCB4')}>se siente</span>.</h1>
            <p style={css('font-size:20px;line-height:1.6;color:#cfe0f0;max-width:520px;margin:0 0 34px')}>Entendé exactamente qué cubre tu plan, cómo usarlo y cuánto sale — antes de firmar, sin sorpresas de último momento.</p>
            {/* Dos puertas (PLAN-home-v2): el prospecto cotiza, el afiliado va a su red.
                Un solo verbo para la acción comercial en todo el sitio: "Simulá tu plan"
                (auditoría de conversión, jul 2026 — cinco nombres eran cinco decisiones). */}
            <div style={css('display:flex;gap:14px;flex-wrap:wrap')}>
              <a href={`${BP}/simulador/`} onClick={() => track('puerta_home', { puerta: 'plan' })} className="btn-teal" style={css('height:54px;padding:0 30px;border-radius:14px;background:#007d77;color:#fff;font-size:16px;font-weight:700;display:inline-flex;align-items:center;gap:9px')}>Simulá tu plan <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
              <a href={`${BP}/mi-sp/`} onClick={() => track('puerta_home', { puerta: 'ya_soy_sp' })} className="btn-ghost-light" style={css('height:54px;padding:0 28px;border-radius:14px;background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.5);color:#fff;font-size:16px;font-weight:600;display:inline-flex;align-items:center;gap:9px')}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>Ya soy de SP · Mi SP</a>
            </div>
            {/* Ancla de la pregunta 2 ("¿cuánto me cuesta?") en la pantalla 1, sin
                tocar el título del hero — el test de 5 segundos sigue vigente. */}
            <div style={css('margin-top:14px;font-size:13.5px;color:rgba(255,255,255,0.82);font-family:var(--font-inter),sans-serif')}>En 1 minuto ves tu precio — planes desde <span className="num-tnum">{fmt(plansArr[0].price)}</span> al mes, sin dejar datos.</div>
            <a href={`${BP}/historia/`} style={css('display:inline-block;margin-top:2px;padding:14px 8px 14px 0;color:rgba(255,255,255,0.75);font-size:14px;font-weight:500;text-decoration:underline;text-underline-offset:4px')}>Conocé nuestra historia →</a>
          </div>
        </div>
        <div style={css('position:absolute;left:50%;bottom:26px;transform:translateX(-50%);color:rgba(255,255,255,0.7);display:flex;flex-direction:column;align-items:center;gap:6px')}>
          <span style={css('font-size:11px;letter-spacing:.1em;text-transform:uppercase')}>Bajá</span>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={css('animation:cue 1.8s ease-in-out infinite')}><path d="M12 5v14M6 13l6 6 6-6" /></svg>
        </div>
      </section>

      {/* SIMULADOR — teaser hacia /simulador. SUBIDO al puesto 2 (25 jul 2026,
          decisión del usuario sobre el mapa de la home): vivía en la pantalla 7.2
          de 14.9 en móvil, o sea que la única herramienta que de verdad funciona
          quedaba enterrada bajo 6 pantallas de tablas. Ahora es la continuación
          natural del hero — "protección que se siente" → probala — y todo lo que
          sigue pasa a RESPALDAR esa decisión en vez de ser el peaje para llegar. */}
      {/* ⚠ FONDO CLARO, A PROPÓSITO (6 ago 2026, observación del usuario: "todo
          está en tono azul… cansa un poco"). Esta sección era #003B71 y quedaba
          entre el hero navy y "Por qué importa" navy: TRES bloques azules
          seguidos, ~3 pantallas de azul continuo. Lo causó el reordenamiento de
          hoy — antes el simulador caía sobre el comparador gris claro y había
          contraste. Ahora el fondo es mint y la tarjeta oscura FLOTA sobre él:
          rompe la racha, la tarjeta gana contraste en vez de perderlo, y el
          teal es el segundo color de la marca, así que no se inventa nada.
          Regla que deja: al mover una sección hay que mirar de qué color quedan
          sus vecinas nuevas — el ritmo de la página es una propiedad de la
          secuencia, no de cada sección por separado. */}
      <section className="sec" style={css('padding:80px 40px;background:#F2FBFA')}>
        <div data-rv style={css('max-width:1000px;margin:0 auto;background:linear-gradient(135deg,#004a8f 0%,#00294f 100%);border:1px solid rgba(128,221,216,0.18);border-radius:26px;padding:44px 40px;text-align:center;position:relative;overflow:hidden;box-shadow:0 24px 60px rgba(0,20,45,0.28)')}>
          <div style={css('position:absolute;top:-120px;right:-80px;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(0,188,180,0.22) 0%,rgba(0,188,180,0) 68%);pointer-events:none')}></div>
          <div style={css('position:relative;z-index:1;max-width:640px;margin:0 auto')}>
            <div style={css('display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#80DDD8;margin-bottom:16px')}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" /></svg>Simulá tu plan</div>
            <h2 className="disp" style={css('font-size:clamp(30px,4vw,42px);font-weight:800;color:#fff;line-height:1.12;letter-spacing:-0.02em;margin:0 0 14px')}>Conocé tu plan ideal y su precio, <span style={css('color:#00BCB4')}>en un minuto</span>.</h2>
            <p style={css('font-size:17px;color:#B3C7DB;line-height:1.6;margin:0 auto 30px;max-width:520px')}>Unas pocas preguntas y ves el precio antes de dejar cualquier dato. Sin compromiso.</p>
            <div style={css('display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:14px 26px;margin-bottom:34px')}>
              <span style={css('display:inline-flex;align-items:center;gap:8px;font-size:14.5px;font-weight:600;color:#e6f0fa')}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00BCB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" /></svg>En 1 minuto</span>
              <span style={css('display:inline-flex;align-items:center;gap:8px;font-size:14.5px;font-weight:600;color:#e6f0fa')}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00BCB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>Sin datos sensibles</span>
              <span style={css('display:inline-flex;align-items:center;gap:8px;font-size:14.5px;font-weight:600;color:#e6f0fa')}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00BCB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>Ves el precio antes de dejar datos</span>
            </div>
            <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'teaser' })} className="btn-teal" style={css('height:56px;padding:0 34px;border-radius:15px;background:#007d77;color:#fff;font-size:17px;font-weight:800;display:inline-flex;align-items:center;gap:10px')}>Simulá tu plan <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
          </div>
        </div>
      </section>

      {/* POR QUÉ IMPORTA UN SEGURO — sección FUSIONADA y SUBIDA al puesto 3
          (6 ago 2026, decisión de Arturo sobre la auditoría estratégica del 5 ago).

          Antes eran DOS piezas que decían lo mismo y ninguna estaba arriba: el
          bloque de datos "Un seguro no es un gasto" vivía dentro del comparador
          (3,0 pantallas de móvil — o sea, DESPUÉS de pedirle a la persona que
          elija plan), y el manifiesto corto —"Creés que estás protegido…"—
          repetía la misma idea cinco pantallas más abajo.

          El argumento que justifica la CATEGORÍA no puede llegar después de la
          elección: en Paraguay 7 de cada 10 no tienen seguro, así que para la
          mayoría la pregunta previa no es "¿cuál plan?" sino "¿por qué un plan?".
          Ahora es lo primero que respalda al simulador — probá la herramienta →
          por qué esto importa → cuál te queda → qué cubre — sin desalojar al
          simulador del puesto 2, que se midió y se decidió en julio (dec. 12b).

          Orden interno: el golpe humano (la frase del manifiesto) → los dos datos
          duros que lo prueban → el reencuadre (cuenta impredecible vs. cuota
          conocida) → qué hacemos nosotros al respecto. Informa, no asusta: nada
          de rojo (la regla de color lo reserva para urgencias) y las cifras van
          con fuente citada; sin fuente no entran.

          Se podó "Salud Protegida. Protección que se siente." del cierre del
          manifiesto: a dos pantallas del hero repetía su propio H1 (regla de
          etiquetas — si repite lo de al lado, se poda). A siete pantallas no
          repetía; acá sí.

          ⚠ Conserva [data-mani-corto]: el evento manifesto_scroll sigue vivo,
          pero ahora se dispara arriba y ya no significa "atravesó la home"
          (anotado en ANEXO §2 para que nadie lo lea como antes). */}
      <section data-mani-corto className="sec" style={css('padding:80px 40px;background:#002A52')}>
        <div style={css('max-width:860px;margin:0 auto;text-align:center')}>
          <div data-rv>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#80DDD8;margin-bottom:16px')}>Por qué importa</div>
            <p className="disp" style={css('font-size:clamp(24px,3vw,36px);line-height:1.32;letter-spacing:-0.01em;color:#fff;margin:0 0 16px')}>Creés que estás protegido. La mayoría lo descubre recién cuando algo sale mal.</p>
            <p style={css('font-family:var(--font-inter),sans-serif;font-size:17px;color:#B3C7DB;line-height:1.65;margin:0 auto 32px;max-width:600px')}>No es una impresión nuestra: es lo que pasa cuando la salud se paga recién en el momento de necesitarla.</p>
          </div>

          <div data-rv className="two-col" style={css('display:grid;grid-template-columns:1fr 1fr;gap:24px;text-align:left;margin-bottom:32px')}>
            <div style={css('border-left:3px solid #00BCB4;padding-left:16px')}>
              <div className="disp num-tnum" style={css('font-size:clamp(28px,3.6vw,36px);font-weight:800;color:#fff;line-height:1')}>36<span style={css('font-size:.6em')}>%</span></div>
              <div style={css('font-family:var(--font-inter),sans-serif;font-size:14px;color:#B3C7DB;line-height:1.55;margin-top:8px')}>de todo lo que se gasta en salud en Paraguay sale del bolsillo de alguien <b style={css('color:#fff')}>justo cuando se enferma</b>. La OMS recomienda que no pase del 20%.</div>
            </div>
            <div style={css('border-left:3px solid #00BCB4;padding-left:16px')}>
              <div className="disp num-tnum" style={css('font-size:clamp(28px,3.6vw,36px);font-weight:800;color:#fff;line-height:1')}>7<span style={css('font-size:.55em;font-weight:700')}> de cada 10</span></div>
              <div style={css('font-family:var(--font-inter),sans-serif;font-size:14px;color:#B3C7DB;line-height:1.55;margin-top:8px')}>paraguayos <b style={css('color:#fff')}>no tienen ningún seguro médico</b>. Cuando llega una internación, la cuenta llega entera y de una vez.</div>
            </div>
          </div>

          <div data-rv>
            <p className="disp" style={css('font-size:clamp(20px,2.5vw,26px);font-weight:800;line-height:1.3;letter-spacing:-0.01em;color:#fff;margin:0 auto 16px;max-width:680px')}>Un seguro no es un gasto: cambia una cuenta impredecible por <span style={css('color:#00BCB4')}>una cuota que conocés</span>.</p>
            <p style={css('font-family:var(--font-inter),sans-serif;font-size:17px;color:#B3C7DB;line-height:1.65;margin:0 auto 26px;max-width:620px')}>Por eso acá todo se responde en un minuto: qué plan te conviene, cuánto sale, qué te cubre y dónde te atendés. La protección real se construye <b style={css('color:#fff')}>antes</b> — antes de la llamada de madrugada, antes del «¿esto me cubre?».</p>
            <div style={css('display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 24px')}>
              <a href={`${BP}/blog/gasto-de-bolsillo-salud-paraguay/`} onClick={() => track('blog_open', { origen: 'por_que_importa', nota: 'gasto-de-bolsillo' })} className="link-teal" style={css('color:#80DDD8;font-size:15px;font-weight:700;text-decoration:underline;text-underline-offset:4px;padding:6px 0')}>Leé la nota completa →</a>
              <a href={`${BP}/historia/`} style={css('color:#80DDD8;font-size:15px;font-weight:700;text-decoration:underline;text-underline-offset:4px;padding:6px 0')}>Ver la historia completa →</a>
            </div>
            <div style={css('font-family:var(--font-inter),sans-serif;font-size:12.5px;color:#8fa8c0;margin-top:18px')}>Fuentes: OPS (Perfil de país, 2021) e INE.</div>
          </div>
        </div>
      </section>

      {/* COMPARADOR "LO QUE CAMBIA" (iter 3, feedback CX del usuario) — filas
          alineadas de lo que difiere × planes. "Al 100%" en teal CONSISTENTE en
          los tres (Gold ya no se apaga); Silver resaltado como "la más elegida"
          (anclaje); una línea humana bajo cada plan; sin barras (ruido); lo común
          abajo como GARANTÍA positiva. BITACORA cap. 48. Detalle → /planes. */}
      <section id="comparar" className="sec" style={css('padding:80px 40px;background:#F5F5F5')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          <div data-rv style={css('text-align:center;max-width:660px;margin:0 auto 36px')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#007d77;margin-bottom:14px')}>Bronze, Silver y Gold</div>
            <h2 className="disp" style={css('font-size:40px;font-weight:800;color:#003B71;line-height:1.14;letter-spacing:-0.02em;margin:0 0 14px')}>Qué te cubre cada plan y <span style={css('color:#007d77')}>qué ponés vos</span>.</h2>
            <p style={css('font-size:17px;line-height:1.6;color:#6B6B6B;margin:0')}>Los tres cubren lo esencial y ninguno cubre el 100% — preferimos decírtelo a prometerte lo contrario. Acá está <b style={css('color:#007d77')}>todo lo que cambia</b> entre los tres, de un vistazo.</p>
          </div>

          {/* EL DESCUENTO SALE DE LA LETRA CHICA (6 ago 2026, auditoría estratégica).
              "¿Hay descuento por la forma de pago?" es una de las preguntas que más
              se repiten, y la respuesta vivía en gris de 12,5px al pie de OTRA
              sección: estaba enunciada, no respondida. Ahora va donde están los
              precios, legible, y en positivo — es una razón para elegir, no una
              aclaración legal. La FAQ conserva la respuesta larga. */}
          {/* ⚠ SIN CAJA, A PROPÓSITO (6 ago 2026, observación del usuario sobre la
              consistencia de esta zona). La primera versión de esta franja usaba
              mint #F2FBFA con borde teal — exactamente el mismo tratamiento que la
              garantía "Todos los planes te garantizan" de abajo. Quedaban dos cajas
              gemelas bracketeando la tabla que hacen cosas distintas: una es un
              VEREDICTO (lo que los tres planes te aseguran) y la otra una ANOTACIÓN
              sobre el precio. Misma ropa, distinto trabajo.
              Ahora es una línea: sigue siendo legible (15px, texto oscuro, el número
              en teal) —que era el punto, sacarla de la letra chica de 12,5px gris—
              pero no compite con la garantía ni la duplica. Regla que deja: dos
              elementos con el mismo tratamiento visual se leen como el mismo tipo de
              cosa; si no lo son, uno de los dos tiene que ceder. */}
          <div data-rv style={css('display:flex;justify-content:center;margin-bottom:22px')}>
            <span style={css('display:inline-flex;align-items:flex-start;gap:10px;font-family:var(--font-inter),sans-serif;font-size:15px;color:#2A2A28;line-height:1.5;text-align:left;max-width:640px')}>
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#007d77" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:2px')} aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /></svg>
              <span>Pagando con <b style={css('color:#003B71')}>débito automático o tarjeta de crédito</b>, los tres planes tienen <b style={css('color:#007d77')}>10% de descuento</b> todos los meses.</span>
            </span>
          </div>

          {/* Hint de scroll (solo móvil): en el teléfono la tabla se compara
              deslizando — decilo antes para que no se lea como algo cortado. */}
          <div data-rv className="cmp-hint" style={css('align-items:center;justify-content:center;gap:6px;margin-bottom:10px;font-family:var(--font-inter),sans-serif;font-size:12.5px;font-weight:600;color:#00736e')}>Deslizá para comparar los tres planes <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></div>

          {/* ⚠ CONSERVA EL ANCLA #cartilla: el menú del header enlaza "Qué cubre
              tu plan" acá. Al fusionarse las dos secciones, #comparar quedó en la
              sección y #cartilla en la matriz, que es lo que esa entrada del menú
              promete mostrar. Si algún día se mueve la tabla, el ancla va con ella. */}
          <div data-rv id="cartilla" style={css('background:#fff;border:1px solid #E8E8E8;border-radius:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 18px 50px rgba(0,59,113,0.06);overflow:hidden;overflow-x:auto')}>
            <div className="cmp-inner">
              {/* Encabezado: cada plan con precio, para-quién y CTA. Silver = "la más elegida" (anclaje). */}
              <div className="cmp-row">
                <div className="cmp-lbl" style={css('padding:18px 22px;background:#fff')}></div>
                {v.planHead.map((ph, i) => (
                  <div key={i} style={css('padding:14px 12px 16px;text-align:center;border-left:1px solid #F0F0F0;border-top:3px solid ' + ph.color + ';' + (ph.recommended ? 'background:#F1FAF9;' : ''))}>
                    {/* Ranura de badge de altura fija en LAS TRES columnas: el badge de
                        Silver ya no empuja su título hacia abajo — nombres, precios y
                        CTAs quedan en la misma línea base (el resalte de Silver deja de
                        desbalancear la sección; feedback del usuario, jul 2026). */}
                    <div style={css('height:20px;margin-bottom:8px;display:flex;align-items:center;justify-content:center')}>
                      {ph.recommended && <span style={css('font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#fff;background:#007d77;border-radius:999px;padding:3px 10px')}>La más elegida</span>}
                    </div>
                    <div className="disp" style={css('font-size:20px;font-weight:800;color:#003B71;line-height:1')}>{ph.short}</div>
                    <div style={css('font-family:var(--font-inter),sans-serif;font-size:12px;color:#6B6B6B;margin-top:5px')}>desde <span className="num-tnum" style={css('font-weight:700;color:#1D1D1B')}>{ph.price}</span></div>
                    <div style={css('font-family:var(--font-inter),sans-serif;font-size:11.5px;color:#6B6B6B;line-height:1.4;margin-top:9px;min-height:31px')}>{ph.forWhom}</div>
                    <a href={ph.href} onClick={ph.onCta} style={css('margin-top:11px;height:34px;padding:0 15px;border-radius:9px;background:#007d77;color:#fff;font-size:12.5px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;transition:background .2s')}>Ver mi precio</a>
                  </div>
                ))}
              </div>
              {/* Filas: "Al 100%" en teal en TODOS los planes que lo tienen (Gold no se
                  apaga); "Desde Silver"/"Copago" en dorado (oportunidad). Silver tenue. */}
              {v.cmp.map((row, r) => (
                <div key={r} className="cmp-row" style={css('border-top:1px solid #F0F0F0')}>
                  <div className="cmp-lbl" style={css('padding:15px 22px;background:#fff;display:flex;flex-direction:column;justify-content:center')}>
                    <span style={css('font-size:14px;font-weight:700;color:#003B71;line-height:1.2')}>{row.name}</span>
                    {row.unit && <span style={css('font-family:var(--font-inter),sans-serif;font-size:11.5px;color:#6B6B6B;margin-top:2px')}>{row.unit}</span>}
                  </div>
                  {row.cells.map((c, j) => (
                    <div key={j} style={css('padding:14px 12px;border-left:1px solid #F0F0F0;display:flex;align-items:center;justify-content:center;text-align:center;' + (j === 1 ? 'background:#F1FAF9;' : ''))}>
                      {row.kind === 'num' ? (
                        <span style={css('font-size:16px;font-weight:700;color:#1D1D1B;line-height:1.1')}>{c.t}</span>
                      ) : (
                        <span style={css('display:inline-flex;align-items:center;font-size:13px;font-weight:700;padding:4px 11px;border-radius:999px;' + (c.ok ? 'background:#E6F7F6;color:#007d77' : 'background:#F8F1DE;color:#7a5f10'))}>{c.t}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Los tres modos como LEYENDA del explorador (antes eran tres tarjetas):
              es el vocabulario que usan los badges de abajo. Ancla #bolsillo. */}
          <div data-rv id="bolsillo" style={css('display:flex;flex-wrap:wrap;justify-content:center;gap:10px 24px;padding:15px 20px;background:#F7FBFB;border:1px solid #E8EFEE;border-radius:14px;margin-bottom:18px')}>
            {[
              { c: '#00BCB4', t: 'Cubierto', b: 'no ponés nada' },
              { c: '#8a9997', t: 'Copago', b: 'ponés una parte — es la sorpresa más común' },
              { c: '#5f6d6c', t: 'Al precio de convenio', b: 'no lo cubre el plan, pero pagás la tarifa negociada de SP' },
            ].map((m, i) => (
              <span key={i} style={css('display:inline-flex;align-items:baseline;gap:8px;font-family:var(--font-inter),sans-serif;font-size:13.5px;line-height:1.5')}>
                <span style={css('width:10px;height:10px;border-radius:999px;flex:none;transform:translateY(1px);background:' + m.c)}></span>
                <span><b style={css('color:#003B71;font-weight:800')}>{m.t}</b> <span style={css('color:#6B6B6B')}>· {m.b}</span></span>
              </span>
            ))}
          </div>

          {/* Lo común a los tres, como GARANTÍA positiva (no letra chica): la base
              de integridad sobre la que se construyen los tres planes. */}
          <div data-rv className="cmp-garantia" style={css('margin-top:24px;display:flex;align-items:center;gap:13px 22px;flex-wrap:wrap;padding:22px 26px;border:1.5px solid #bfe8e4;border-radius:16px;background:#F2FBFA')}>
            <span style={css('display:inline-flex;align-items:center;gap:11px;font-size:15.5px;font-weight:800;color:#007d77;white-space:nowrap')}><span style={css('display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:999px;background:#007d77;color:#fff;flex:none')}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Todos los planes te garantizan</span>
            <span style={css('font-family:var(--font-inter),sans-serif;font-size:15px;color:#2A2A28;font-weight:600;line-height:1.55')}>{v.cmpIgual}</span>
          </div>

          {/* La comparación entera vive de un vistazo arriba; el detalle
              fila-por-fila (11 servicios × 3 planes) se fue a /planes: home =
              resumen completo, la profundidad a un click (HANDOFF 11t, cap. 46). */}
          {/* ⚠ DOS PUERTAS, PORQUE HAY DOS PREGUNTAS DISTINTAS (6 ago 2026).
              Hasta hoy había una sola que decía "¿Querés el detalle fila por
              fila?" y llevaba a /planes. Desde el 6/08 existe además
              /que-cubre, con las 983 respuestas de la grilla oficial buscables.
              Con una sola puerta genérica, la persona que llega con una orden
              médica en la mano ("¿me cubre la resonancia de rodilla?") aterriza
              en la comparación de planes, que no responde eso.
              La regla: cada puerta dice QUÉ PREGUNTA responde, no "ver más".
              El reparto completo de las cuatro superficies está en HANDOFF. */}
          <div data-rv className="two-col" style={css('display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:30px;max-width:820px;margin-left:auto;margin-right:auto')}>
            <a href={`${BP}/que-cubre/`} onClick={() => track('ver_que_cubre', { origen: 'comparador' })} className="cmp-verplanes" style={css('display:flex;flex-direction:column;gap:4px;padding:16px 22px;border:1.5px solid #b8e6e2;border-radius:12px;background:#fff;color:#007d77;text-align:left')}>
              <span style={css('font-size:16px;font-weight:700;display:inline-flex;align-items:center;gap:8px')}>¿Está cubierto lo que me pidieron? <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
              <span style={css('font-family:var(--font-inter),sans-serif;font-size:13.5px;color:#4a4a4a;line-height:1.5;font-weight:400')}>Buscá el estudio, análisis o cirugía por su nombre.</span>
            </a>
            <a href={v.planesHref} onClick={() => track('ver_planes', { origen: 'comparador' })} className="cmp-verplanes" style={css('display:flex;flex-direction:column;gap:4px;padding:16px 22px;border:1.5px solid #b8e6e2;border-radius:12px;background:#fff;color:#007d77;text-align:left')}>
              <span style={css('font-size:16px;font-weight:700;display:inline-flex;align-items:center;gap:8px')}>El detalle fila por fila <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
              <span style={css('font-family:var(--font-inter),sans-serif;font-size:13.5px;color:#4a4a4a;line-height:1.5;font-weight:400')}>Los tres planes comparados servicio por servicio, con sus esperas.</span>
            </a>
          </div>

          {/* ⚠ El bloque "Por qué importa" (36% de gasto de bolsillo · 7 de cada 10
              sin seguro) VIVÍA ACÁ hasta el 6 ago 2026. Se mudó al puesto 3 de la
              home, fusionado con el manifiesto corto — el argumento que justifica
              la categoría no puede llegar DESPUÉS de pedirle a la persona que
              elija plan. Ver la sección [data-mani-corto], arriba del comparador. */}



            <div style={css('font-size:12.5px;color:#6B6B6B;margin-top:12px;text-align:center')}>Precios de lista vigentes, IVA incluido. El detalle final lo confirmás con tu asesor.</div>
            {/* PARTO: LA ESPERA MÁS LARGA DE LA GRILLA (26 jul 2026).
                Parto son 300 días en los tres planes y la cesárea baja a 150 en
                Gold — el dato más caro de descubrir tarde de todo el sistema, y
                que hasta hoy la web no decía en ningún lado (la FAQ lo derivaba
                al asesor). Va en dorado, no en rojo: la regla de color reserva
                el rojo para urgencias, y el dorado es "oportunidad". Y el
                encuadre es deliberado — el mismo dato dicho a tiempo deja de ser
                una trampa escondida y pasa a ser una razón para afiliarse antes.
                No se suaviza el número: se le da un destino. */}
            <div style={css('margin-top:18px;border:1px solid #E8D9A8;background:#FDFAF2;border-radius:14px;padding:16px 18px;display:flex;gap:13px;align-items:flex-start')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7a5f10" strokeWidth="2" strokeLinecap="round" style={css('flex:0 0 auto;margin-top:1px')} aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              <div>
                <div style={css('font-family:var(--font-display),system-ui,sans-serif;font-size:15px;font-weight:700;color:#003B71;margin-bottom:4px')}>¿Están pensando en agrandar la familia?</div>
                <div style={css('font-family:var(--font-inter),system-ui,sans-serif;font-size:13.5px;color:#4A4A4A;line-height:1.55')}>
                  El parto tiene <strong>10 meses de <Term k="carencia">carencia</Term></strong> en los tres planes, y la cesárea baja a 5 meses en Gold. Es la espera más larga de todos los servicios, y el reloj arranca el día que te afiliás — no el día que lo necesitás. Si el plan es para dentro de un año, <strong>afiliándote ahora llegás</strong>.
                </div>
              </div>
            </div>

          {/* LO QUE QUEDA AFUERA — reencuadre (25 jul 2026, observación del usuario:
              "la transparencia tiene que cumplir un propósito, no puede ser
              transparencia por ser transparencia"). Dos cambios:
              1) Se eliminó el bloque "cuánto cubre de verdad cada plan" (45/66/93).
                 Informaba cuán incompleto es cada plan sin ayudar a decidir nada, y
                 "45% cubierto" se lee como "55% NO cubierto": la transparencia
                 terminaba vendiendo en contra. Lo que sí decide —qué cambia entre
                 planes— ya vive alineado en el comparador.
              2) Las exclusiones cierran con qué hacer, no con un punto final.

              ⚠ CORRECCIÓN (26 jul 2026) — LEER ANTES DE TOCAR ESTE BLOQUE.
              La versión anterior decía que estas cuatro categorías "en general" no
              las cubre la medicina prepaga y cerraba con "es hasta dónde llega este
              tipo de producto". El relevamiento de competidores REFUTÓ esa frase con
              cita textual: SPS (Superior Plus) cubre tratamiento oncológico —quimio
              en pensión y honorarios, radioterapia, cirugías oncológicas— y alta
              complejidad —"Neurológicas, torácicas, cardiacas y vascular
              periférica"—; SPS y MediLife cubren odontología general básica.
              O sea: NO es el límite del producto, es el límite NUESTRO.

              Por eso el bloque ahora habla solo de SP y no afirma nada sobre el
              rubro. La fuerza de esta pieza nunca fue "los demás tampoco": fue
              "te lo decimos antes de que firmes". Eso sobrevive intacto; lo que se
              cayó era una generalización que no podíamos sostener — y que, de
              descubrirla una familia comparando, habría dañado justo la honestidad
              que este bloque viene a demostrar.

              NO volver a escribir afirmaciones sobre lo que cubre "la medicina
              prepaga" sin relevamiento con fuente y fecha. Ver BITACORA cap. 57,
              HANDOFF 12c, y sp-interno/project/RELEVAMIENTO-competidores-2026-07-26.md
              (repo privado: el análisis de competidores nombrados no vive acá). */}
          <div data-rv style={css('margin-top:18px;background:#F4F5F6;border:1px solid #e6e8ea;border-radius:16px;padding:22px 26px;display:flex;align-items:flex-start;gap:14px')}>
            <span style={css('width:28px;height:28px;border-radius:9px;flex:none;background:#e6e8ea;color:#5f6d6c;display:flex;align-items:center;justify-content:center;margin-top:1px')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg></span>
            <div>
              <div className="disp" style={css('font-size:16px;font-weight:800;color:#333;margin-bottom:6px')}>Para que no haya sorpresas</div>
              <div style={css('font-size:14.5px;color:#4a4a4a;line-height:1.6;font-family:var(--font-inter),sans-serif')}>Hay cuatro cosas que <b style={css('color:#333')}>nuestros planes no cubren</b>: {annotate('odontología, cirugía bariátrica, tratamiento oncológico y alta complejidad')} (cardiocirugía, neurocirugía y cirugía vascular). Preferimos que lo sepas ahora y no cuando lo necesites — pasá el mouse o tocá cada una para ver qué incluye.</div>
              <div style={css('font-size:14.5px;color:#4a4a4a;line-height:1.6;margin-top:8px;font-family:var(--font-inter),sans-serif')}>Si alguna de estas te preocupa, <b style={css('color:#333')}>decíselo a tu asesor antes de firmar</b>: te va a decir con qué contás y con qué no. Mejor saberlo hoy que en la sala de espera.</div>
            </div>
          </div>

          {/* Puerta a la Guía Médica: "dónde/con quién atenderte" es su propia
              utilidad; acá una entrada honesta, no un buscador que finge. La
              búsqueda real (médicos, sanatorios, estudios) vive en la guía. */}
          <div data-rv className="two-col" style={css('margin-top:18px;background:#E6EDF4;border:0.5px solid #d4e0ee;border-radius:16px;padding:24px 28px;display:grid;grid-template-columns:auto 1fr auto;gap:26px;align-items:center')}>
            <div style={css('width:52px;height:52px;border-radius:14px;background:#003B71;color:#fff;display:flex;align-items:center;justify-content:center;flex:none')}><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg></div>
            <div>
              <div style={css('font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#00736e;margin-bottom:6px')}>¿Dónde atenderte?</div>
              <div style={css('font-size:16px;color:#3D3D3D;line-height:1.55')}>Buscá tu <b style={css('color:#003B71')}>médico, sanatorio o estudio</b> en toda la red: <b>Lister</b>, nuestro centro propio (consultas, laboratorio e imagen), más de 50 prestadores en todo el país.</div>
            </div>
            <a href={v.guiaHome} onClick={() => v.trackGuia('cta_cobertura')} className="btn-navy" style={css('height:46px;padding:0 22px;border-radius:12px;background:#003B71;color:#fff;font-size:14px;font-weight:700;display:inline-flex;align-items:center;gap:8px;white-space:nowrap')}>Abrí la Guía Médica <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
          </div>


          <div data-rv className="two-col" style={css('margin-top:26px;background:#E6EDF4;border:0.5px solid #d4e0ee;border-radius:16px;padding:24px 28px;display:grid;grid-template-columns:auto 1fr auto;gap:26px;align-items:center')}>
            <div className="disp" style={css('background:#003B71;color:#fff;border-radius:12px;padding:16px 22px;text-align:center;font-weight:800')}><div style={css('font-size:11px;letter-spacing:.2em;opacity:.85')}>SP</div><div style={css('font-size:20px')}>SENIOR</div></div>
            <div><div style={css('font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#00736e;margin-bottom:6px')}>Plan aparte · 65 años o más</div><div style={css('font-size:16px;color:#3D3D3D;line-height:1.55')}>¿Buscás para tus padres o un adulto mayor? <b style={css('color:#003B71')}>Plan Vital</b> está pensado para ellos: consultas, urgencias 24 h y ambulancia a domicilio.</div></div>
            <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'banda_senior' })} className="btn-navy" style={css('height:46px;padding:0 22px;border-radius:12px;background:#003B71;color:#fff;font-size:14px;font-weight:700;display:inline-flex;align-items:center;white-space:nowrap')}>Simulá Plan Vital</a>
          </div>
        </div>
      </section>


      {/* CÓMO FUNCIONA — el proceso después de decidir (el teaser del simulador
          subió al puesto 2; esta sección sigue explicando qué pasa al contratar) */}
      <section className="sec" style={css('padding:72px 40px 64px;background:#F5F5F5')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          <div data-rv style={css('text-align:center;max-width:640px;margin:0 auto 30px')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#007d77;margin-bottom:14px')}>De la cotización a tu credencial</div>
            <h2 className="disp" style={css('font-size:36px;font-weight:800;color:#003B71;line-height:1.16;letter-spacing:-0.02em;margin:0')}>Cómo funciona la contratación</h2>
          </div>
          <div data-rv className="steps-flow" style={css('display:grid;grid-template-columns:repeat(4,1fr);gap:26px')}>
            {v.stepsHow.map((st, i) => (
              <div key={i} style={css('display:flex;gap:12px;align-items:flex-start')}>
                <span className="disp" style={css('width:30px;height:30px;flex:none;border-radius:9px;background:#007d77;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px')}>{st.n}</span>
                <div>
                  <div style={css('font-size:15px;font-weight:700;color:#003B71;line-height:1.3;margin-bottom:3px')}>{st.title}</div>
                  <div style={css('font-size:13.5px;color:#6B6B6B;line-height:1.5')}>{st.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⚠ El MANIFIESTO CORTO vivía acá (puesto 6). El 6 ago 2026 se fusionó con
          el bloque de datos "Un seguro no es un gasto" y subió al puesto 3: decían
          lo mismo con cinco pantallas de distancia, y el argumento de la categoría
          tiene que llegar antes de la elección de plan, no después. */}

      {/* DIFERENCIADORES */}
      <section className="sec" style={css('padding:64px 40px;background:#E6F7F6')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          <div data-rv style={css('text-align:center;max-width:660px;margin:0 auto 30px')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#007d77;margin-bottom:14px')}>Lo que ponemos por escrito</div>
            <h2 className="disp" style={css('font-size:36px;font-weight:800;color:#003B71;line-height:1.16;letter-spacing:-0.02em;margin:0 0 12px')}>Lo que casi nadie te <span style={css('color:#007d77')}>garantiza</span>.</h2>
            <p style={css('font-size:16px;line-height:1.6;color:#3D3D3D;margin:0')}>No son promesas sueltas: quedan escritas en tu plan.</p>
          </div>
          <div data-rv className="two-col" style={css('display:grid;grid-template-columns:repeat(3,1fr);gap:20px')}>
            {v.difs.map((dz, i) => (
              <div key={i} style={css('background:#fff;border-radius:18px;padding:28px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.06)')}>
                <div style={css('width:46px;height:46px;border-radius:13px;background:#E6F7F6;color:#007d77;display:flex;align-items:center;justify-content:center;margin-bottom:16px')}><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={dz.icon} /></svg></div>
                <div style={css('font-size:17px;font-weight:800;color:#003B71;line-height:1.3;margin-bottom:7px')}>{dz.title}</div>
                <div style={css('font-size:14px;color:#6B6B6B;line-height:1.55;font-family:var(--font-inter),sans-serif')}>{dz.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONFIANZA / SOBRE SP (con boceto del edificio) */}
      <section className="sec-x" style={css('padding:72px 40px 64px;background:#fff')}>
        <div data-rv className="two-col" style={css('max-width:1080px;margin:0 auto;background:#E6EDF4;border-radius:20px;padding:40px;display:grid;grid-template-columns:0.85fr 1.15fr;gap:40px;align-items:center')}>
          <div style={css('position:relative;display:flex;align-items:center;justify-content:center;min-height:210px')}>
            <div style={css('position:absolute;width:210px;height:210px;border-radius:50%;background:#d4e0ee')}></div>
            <img src={`${BP}/assets/edificio.webp`} alt="Edificio administrativo de Salud Protegida" loading="lazy" style={css('position:relative;width:100%;max-width:340px;height:auto;display:block')} />
          </div>
          <div>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#00736e;margin-bottom:12px')}>Quiénes somos</div>
            <h3 className="disp" style={css('font-size:26px;font-weight:800;color:#003B71;line-height:1.2;letter-spacing:-0.01em;margin:0 0 22px')}>Una empresa familiar paraguaya, cuidando familias hace más de {YEARS_CARING} años.</h3>
            <div style={css('display:grid;grid-template-columns:1fr 1fr;gap:24px 20px')}>
              <div><div className="disp" style={css('font-size:32px;color:#003B71')}>2002</div><div style={css('font-size:13px;color:#3D3D3D;margin-top:3px')}>Fundada en Asunción</div></div>
              <div><div className="disp num-tnum" data-stat data-target="19000" data-prefix="~" data-thousands="1" style={css('font-size:32px;color:#003B71')}>~19.000</div><div style={css('font-size:13px;color:#3D3D3D;margin-top:3px')}>Vidas aseguradas</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ⚠ Acá vivía la FRANJA RED / LISTER: "Lister + más de 50 prestadores en
          todo el país. Nuestro centro médico propio, más una red que te cubre
          donde estés." Se eliminó el 6 ago 2026 (auditoría estratégica, hallazgo 3):
          decía exactamente lo mismo que la puerta a la Guía Médica de la sección
          "Qué cubre" —"Lister, nuestro centro propio (consultas, laboratorio e
          imagen), más de 50 prestadores en todo el país"—, pero sin la acción que
          esa sí ofrece (abrir la Guía). Un elemento se gana su lugar solo si suma
          un destino o un momento que otro no cubre; este repetía y no sumaba.
          El padding inferior que aportaba esta franja pasó a la sección de arriba. */}

      {/* RED DE BENEFICIOS + PRESTADORES — dos tiras flotantes, sentidos opuestos */}
      <section style={css('padding:64px 0 68px;background:#F5F5F5;overflow:hidden')}>
        <div style={css('max-width:1100px;margin:0 auto;padding:0 40px')}>
          <div data-rv style={css('text-align:center;max-width:680px;margin:0 auto')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#007d77;margin-bottom:14px')}>Red de beneficios · SaludPro 360</div>
            <h2 className="disp" style={css('font-size:34px;font-weight:800;color:#003B71;line-height:1.16;letter-spacing:-0.02em;margin:0 0 12px')}>Aliados y prestadores <span style={css('color:#007d77')}>de tu plan</span>.</h2>
            <p style={css('font-size:16px;line-height:1.6;color:#6B6B6B;margin:0')}>Descuentos con nuestros aliados comerciales y, muy pronto, toda la red médica de Salud Protegida.</p>
          </div>
        </div>

        {/* Tira 1 — aliados · derecha → izquierda */}
        <div data-rv className="mq" style={css('margin-top:42px;--mq-dur:54s')}>
          <div className="mq-track">
            {[...v.aliados, ...v.aliados].map((a, i) => (
              <div key={i} style={css('flex:none;display:flex;align-items:center;justify-content:center;height:58px;margin-right:60px')}>
                <img src={`${BP}/assets/aliados/${a.file}`} alt={a.name} loading="lazy" className="ally-logo" />
              </div>
            ))}
          </div>
        </div>

        {/* Tira 2 — prestadores (próximamente) · izquierda → derecha */}
        <div data-rv className="mq mq-rev" style={css('margin-top:14px;--mq-dur:48s')}>
          <div className="mq-track">
            {[...v.prestadores, ...v.prestadores].map((pr, i) => (
              <div key={i} style={css('flex:none;display:inline-flex;align-items:center;gap:10px;height:52px;margin-right:48px;color:#6B6B6B')}>
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V8l7-4 7 4v13M10 21v-4h4v4M9.5 9.5h.01M14.5 9.5h.01M9.5 13h.01M14.5 13h.01" /></svg>
                <span style={css('font-size:15px;font-weight:700;white-space:nowrap')}>{pr}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={css('max-width:1100px;margin:22px auto 0;padding:0 40px;text-align:center;font-size:12px;color:#6B6B6B')}>Aliados reales — pasá el cursor para verlos a color. Prestadores de ejemplo: <b style={css('color:#007d77')}>próximamente</b> con la red médica real.</div>
      </section>

      {/* FAQ */}
      <section id="faq" className="sec" style={css('padding:80px 40px;background:#fff')}>
        <div style={css('max-width:820px;margin:0 auto')}>
          <div data-rv style={css('text-align:center;max-width:640px;margin:0 auto 12px')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#007d77;margin-bottom:14px')}>Antes de contratar</div>
            <h2 className="disp" style={css('font-size:36px;font-weight:800;color:#003B71;line-height:1.16;letter-spacing:-0.02em;margin:0 0 14px')}>Preguntas frecuentes</h2>
            <p style={css('font-size:15px;color:#6B6B6B;line-height:1.6;margin:0 0 40px')}>Respuestas orientativas — tu asesor confirma los detalles exactos de tu contrato.</p>
          </div>
          <div data-rv style={css('display:flex;flex-direction:column;gap:10px')}>
            {v.faqList.map((f, i) => (
              <div key={i} style={css('background:#fff;border:1px solid #E8E8E8;border-radius:14px;overflow:hidden')}>
                <button onClick={f.toggle} aria-expanded={f.open} style={css('width:100%;text-align:left;padding:18px 20px;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:14px;font-size:15.5px;font-weight:700;color:#003B71')}>{f.q}<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#009690" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={css(f.chevStyle + ';flex:none')}><path d="m6 9 6 6 6-6" /></svg></button>
                {f.open && (
                  <div style={css('padding:0 20px 20px;font-size:14.5px;color:#3D3D3D;line-height:1.65')}>
                    {f.a}
                    {f.cta && <a href={f.cta.href} onClick={f.cta.onClick} {...(f.cta.external ? { target: '_blank', rel: 'noopener' } : {})} className="link-teal" style={css('display:inline-block;margin-top:10px;color:#007d77;font-weight:700;font-size:14px')}>{f.cta.label}</a>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CIERRE */}
      <section className="sec" style={css('padding:64px 40px 84px;background:#003B71')}>
        {/* Teal profundo (#007d77), no el brillante: el blanco sobre #00BCB4 medía
            2.37:1 (título) y 2.2:1 (bajada). El acento pasa de navy a menta porque
            sobre el teal profundo el navy cae a 2.25:1. Regla (jul 2026, decisión
            del usuario): #00BCB4 decora, #007d77 carga texto blanco. */}
        <div data-rv style={css('max-width:1100px;margin:0 auto;background:#007d77;border-radius:22px;padding:44px 40px;display:flex;align-items:center;justify-content:space-between;gap:36px;flex-wrap:wrap')}>
          <div style={css('max-width:560px')}>
            <h2 className="disp" style={css('font-size:34px;font-weight:800;color:#fff;line-height:1.16;letter-spacing:-0.01em;margin:0 0 12px')}>¿Hablamos? Estamos <span style={css('color:#A5EFEA')}>del otro lado</span>.</h2>
            <p style={css('font-size:17px;color:rgba(255,255,255,0.96);line-height:1.6;margin:0')}>Un asesor te acompaña a elegir, sin apuro y sin compromiso. Como el médico de la familia, pero para tu seguro.</p>
          </div>
          <div style={css('display:flex;gap:12px;flex-wrap:wrap')}>
            <a href={v.waHref} onClick={() => track('click_whatsapp', { origen: 'cierre' })} target="_blank" rel="noopener" className="btn-white-teal" style={css('height:52px;padding:0 26px;border-radius:13px;background:#fff;color:#007d77;font-size:15px;font-weight:700;display:inline-flex;align-items:center;gap:9px')}><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z" /></svg>WhatsApp</a>
            {/* Sin relleno translúcido: aclaraba el teal debajo del texto (2.1:1 medido). */}
            <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'cierre' })} className="btn-onteal" style={css('height:52px;padding:0 26px;border-radius:13px;font-size:15px;font-weight:700;display:inline-flex;align-items:center')}>Simulá tu plan</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={css('background:#002A52;color:#fff;padding:56px 40px 30px')}>
        <div className="two-col" style={css('max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:36px;padding-bottom:30px;border-bottom:1px solid rgba(255,255,255,0.12)')}>
          <div>
            <img src={`${BP}/assets/brand/logo-sp-white.png`} alt="Salud Protegida" loading="lazy" style={css('height:52px;display:block;margin-bottom:14px')} />
            <div style={css('font-size:14px;color:#9bb6d2;line-height:1.6')}>Protección que se siente · +{YEARS_CARING} años · Asunción, Paraguay</div>
          </div>
          <div>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#80DDD8;margin-bottom:14px')}>Contacto</div>
            <div style={css('font-size:14px;color:#cfe0f0;line-height:2')}>
              <div>Sede Administrativa · Perú 222 esq. Eligio Ayala, Asunción</div>
              <div>Centro Médico Lister · Paí Perez 630 c/ Azara, Asunción</div>
              <div>Atención y urgencias 24 h: <a href={'tel:' + SP_TEL} className="foot-link num-tnum" style={css('color:#cfe0f0;font-weight:700')}>{SP_PHONE_DISPLAY}</a></div>
              <div><a href="mailto:hola@saludprotegida.com.py" className="foot-link" style={css('color:#cfe0f0')}>hola@saludprotegida.com.py</a></div>
            </div>
          </div>
          <div>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#80DDD8;margin-bottom:14px')}>Enlaces</div>
            <div style={css('display:flex;flex-direction:column;gap:10px;font-size:14px;color:#cfe0f0')}>
              <a href={v.guiaHome} className="foot-link" style={css('color:inherit')}>Guía Médica</a>
              <a href="#cartilla" className="foot-link" style={css('color:inherit')}>Qué cubre cada plan</a>
              <a href="#comparar" className="foot-link" style={css('color:inherit')}>Planes</a>
              <a href="#faq" className="foot-link" style={css('color:inherit')}>Preguntas frecuentes</a>
              <a href={`${BP}/blog/`} className="foot-link" style={css('color:inherit')}>Blog</a>
              <a href={`${BP}/historia/`} className="foot-link" style={css('color:inherit')}>Nuestra historia</a>
              <a href={`${BP}/mi-sp/`} className="foot-link" style={css('color:inherit')}>Mi SP · ya soy cliente</a>
              <a href={`${BP}/simulador/`} className="foot-link" style={css('color:inherit')}>Simulá tu plan</a>
            </div>
          </div>
        </div>
        <div style={css('max-width:1100px;margin:20px auto 0;font-size:12.5px;color:#7f9cbb')}>© 2026 Salud Protegida (Odontomedica S.A.). Coberturas según los cuadernillos vigentes, sujetas a las condiciones de cada contrato.</div>
      </footer>

      {/* WHATSAPP FLOTANTE (solo desktop: en móvil lo reemplaza la barra) */}
      <a href={v.waHref} onClick={() => track('click_whatsapp', { origen: 'fab' })} target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp" className="btn-teal wa-fab" style={css('position:fixed;right:22px;bottom:22px;z-index:110;width:58px;height:58px;border-radius:999px;background:#007d77;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 28px rgba(0,59,113,0.28)')}><svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z" /></svg></a>

      {/* BARRA CTA MÓVIL (auditoría de conversión, jul 2026): en ≤820px los dos
          flotantes formaban una columna que tapaba texto en casi toda la página;
          la barra vive en el borde inferior (zona del pulgar) y no tapa nada
          porque el contenido termina encima de ella. Mismo umbral de scroll que
          el FAB de desktop. */}
      <div data-cta-bar className="cta-bar" role="group" aria-label="Acciones rápidas">
        <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'barra_movil' })} className="btn-teal" style={css('flex:1;height:48px;border-radius:13px;background:#007d77;color:#fff;font-size:15px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;gap:8px')}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" /></svg>Simulá tu plan</a>
        <a href={v.waHref} onClick={() => track('click_whatsapp', { origen: 'barra_movil' })} target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp" style={css('width:48px;height:48px;border-radius:13px;background:#fff;border:1.5px solid #00BCB4;color:#007d77;display:inline-flex;align-items:center;justify-content:center;flex:none')}><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z" /></svg></a>
      </div>

    </div>
  );
}
