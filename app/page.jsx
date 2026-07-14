'use client';

import { useState, useEffect, createElement } from 'react';
import { BP } from './basePath';
import { css } from './css';
import { fmt, plans, WHATSAPP_NUMBER, SP_PHONE_DISPLAY, SP_TEL } from './quote';
import { track } from './track';

const INITIAL = {
  q: '',
  sel: 'Resonancia (RM)',
  sliderVal: 100,
  mobileMenuOpen: false,
  showFullTable: false,
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

  const faqs = () => [
    { q: '¿Qué es la carencia y cuánto dura?', a: 'La carencia es el tiempo de espera desde que te afiliás hasta poder usar ciertas coberturas (como estudios de alta complejidad o internaciones programadas). Varía según el servicio — tu asesor te muestra el detalle exacto antes de firmar.' },
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
      const cotizarFab = root.querySelector('[data-cotizar-fab]');
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
        if (cotizarFab) { if (y > 640) cotizarFab.classList.add('show'); else cotizarFab.classList.remove('show'); }
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

  // Manifiesto corto: registrar (una sola vez) que el visitante llegó a verlo.
  useEffect(() => {
    const el = document.querySelector('[data-mani-corto]');
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { track('manifesto_scroll', { profundidad: 100, pagina: 'home' }); io.disconnect(); }
      });
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ===== derived render values (was renderVals) =====
  const plansArr = plans();
  const cartArr = cart();
  const waDigits = (WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const waHref = waDigits ? ('https://wa.me/' + waDigits + '?text=' + encodeURIComponent('Hola! Quiero información sobre los planes de Salud Protegida.')) : '#';

  // Guía Médica (páginas estáticas en /guia). guia_resultados lee ?q= y
  // precarga la búsqueda, así el buscador del homepage llega "con la búsqueda hecha".
  const guiaHome = `${BP}/guia/guia_home.html`;
  const guiaSearchHref = (term) => (term ? `${BP}/guia/guia_resultados.html?q=${encodeURIComponent(term)}` : guiaHome);

  // qué cubre (buscador de cobertura)
  const qNorm = (state.q || '').trim().toLowerCase();
  const matches = qNorm ? cartArr.filter((c) => c.name.toLowerCase().includes(qNorm)).slice(0, 5).map((c) => ({ name: c.name, onPick: () => { track('cartilla_select', { practica: c.name, via: 'sugerencia' }); setState({ sel: c.name, q: '' }); } })) : [];
  const quick = ['Resonancia (RM)', 'Parto o cesárea', 'Sesión de psicología', 'Internación', 'Tomografía (TAC)', 'Odontología'];
  const chips = quick.map((nm) => ({
    name: nm, onPick: () => { track('cartilla_select', { practica: nm, via: 'chip' }); setState({ sel: nm, q: '' }); },
    style: 'padding:9px 15px;border-radius:999px;border:1.5px solid ' + (state.sel === nm ? '#00BCB4' : '#d9e4e2') + ';background:' + (state.sel === nm ? '#00BCB4' : '#fff') + ';color:' + (state.sel === nm ? '#fff' : '#3D3D3D') + ';font-size:13px;font-weight:' + (state.sel === nm ? '700' : '500') + ';cursor:pointer;transition:all .15s',
  }));
  const sel = cartArr.find((c) => c.name === state.sel) || cartArr[0];
  const selRows = sel.cov.map((cv, i) => {
    const ok = cv.s !== 'No incluida';
    return {
      plan: plansArr[i].name, color: plansArr[i].color, status: cv.s, detail: cv.d,
      wrap: 'padding:18px 20px;border-left:' + (i === 0 ? '0' : '1px solid #F0F0F0'),
      badge: 'display:inline-flex;align-items:center;font-size:13px;font-weight:700;padding:4px 11px;border-radius:999px;' + (ok ? 'background:#E6F7F6;color:#007d77' : 'background:#F3F4F6;color:#6B6B6B'),
    };
  });

  // slider
  const tSlide = (state.sliderVal || 0) / 100;
  const idx = Math.max(0, Math.min(2, Math.round(tSlide)));
  const p = plansArr[idx];
  const segS = tSlide >= 1 ? 1 : 0, fracS = tSlide - segS;
  const color = lerpHex(plansArr[segS].color, (plansArr[segS + 1] || plansArr[segS]).color, fracS);
  const stops = plansArr.map((pl, i) => ({
    label: pl.short, onPick: () => { if (i !== idx) track('comparador_plan', { plan: pl.short, via: 'parada' }); setState({ sliderVal: i * 100 }); },
    style: 'background:none;border:none;cursor:pointer;font-size:13px;font-weight:' + (idx === i ? '800' : '500') + ';color:' + (idx === i ? '#003B71' : '#6B6B6B') + ';padding:2px 4px;transition:color .2s',
  }));

  // full comparison table
  const planHeaders = plansArr.map((pl) => pl.short);
  const fullRows = cartArr.map((item) => ({
    name: item.name,
    cols: item.cov.map((c) => ({ status: c.s, badge: 'display:inline-flex;font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:999px;' + (c.s !== 'No incluida' ? 'background:#E6F7F6;color:#007d77' : 'background:#F3F4F6;color:#6B6B6B') })),
  }));

  // faq
  const faqList = faqs().map((f, i) => ({
    q: f.q, a: f.a, open: state.faqOpen === i,
    chevStyle: 'transition:transform .2s cubic-bezier(.22,1,.36,1);transform:rotate(' + (state.faqOpen === i ? '180deg' : '0deg') + ')',
    toggle: () => { if (state.faqOpen !== i) track('faq_open', { pregunta: f.q }); toggleFaq(i); },
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
    q: state.q, onQ: (e) => setState({ q: e.target.value }),
    onQKey: (e) => { if (e.key === 'Enter' && state.q.trim()) { track('guia_handoff', { q: state.q.trim(), via: 'enter' }); window.location.href = guiaSearchHref(state.q.trim()); } },
    matches, showDrop: qNorm.length > 0, chips,
    guiaHome, guiaQHref: guiaSearchHref(state.q.trim()),
    trackGuia: (via) => track('guia_handoff', { q: state.q.trim(), via }),
    selKey: sel.name, selName: sel.name, selIcon: iconEl(sel.icon), selRows,
    sliderVal: state.sliderVal, onSlide: (e) => { const val = +e.target.value; const ni = Math.max(0, Math.min(2, Math.round(val / 100))); if (ni !== idx) track('comparador_plan', { plan: plansArr[ni].short, via: 'slider' }); setState({ sliderVal: val }); },
    planName: p.name, planTag: p.tag, planPrice: fmt(p.price), planLines: p.lines, stops,
    sliderHeadStyle: 'padding:30px 30px 26px;color:#fff;transition:background .25s;background:' + color,
    sliderTrackStyle: 'width:100%;background:linear-gradient(90deg,' + color + ' ' + (tSlide / 2 * 100) + '%,#E3E6E5 ' + (tSlide / 2 * 100) + '%);--c:' + color,
    showFullTable: state.showFullTable, toggleFullTable,
    fullTableLabel: state.showFullTable ? 'Ocultar tabla completa' : '¿Querés el detalle fila por fila? Ver tabla completa',
    chevStyle: 'transition:transform .2s cubic-bezier(.22,1,.36,1);transform:rotate(' + (state.showFullTable ? '180deg' : '0deg') + ')',
    planHeaders, fullRows, stepsHow, faqList,
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
      <nav data-nav style={css('position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 40px')}>
        <div className="nav-logo" style={css('position:relative;display:flex;align-items:center')}>
          <img src={`${BP}/assets/brand/logo-sp-color.png`} alt="Salud Protegida" className="nlogo-c" style={css('height:56px;display:block;position:relative;z-index:1')} />
          <img src={`${BP}/assets/brand/logo-sp-white.png`} alt="" className="nlogo-w" style={css('height:56px;position:absolute;left:0;top:0;z-index:2;transition:opacity .3s')} />
        </div>
        <div style={css('display:flex;align-items:center;gap:16px')}>
          <a href={'tel:' + SP_TEL} onClick={() => track('click_urgencias', { origen: 'header' })} aria-label={'Urgencias 24 h ' + SP_PHONE_DISPLAY} className="urg-pill" style={css('display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 15px;border-radius:12px;background:#E11900;color:#fff;font-size:13px;font-weight:800;white-space:nowrap;box-shadow:0 4px 14px rgba(225,25,0,0.28);flex:none')}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3a5.5 5.5 0 0 1 5.5 5.5M15 7a2.5 2.5 0 0 1 2.5 2.5" /><path d="M21 16.9v2.6a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 3.7 3h2.6a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.5 10.5a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" /></svg><span className="urg-word">Urgencias</span><span className="num-tnum">{SP_PHONE_DISPLAY}</span></a>
          <div className="nav-links-desktop" style={css('display:flex;align-items:center;gap:26px')}>
            <a href="#cartilla" className="nav-link" style={css('color:var(--nl,rgba(255,255,255,0.9));font-size:14px;font-weight:500;transition:color .3s')}>Qué cubre</a>
            <a href="#comparar" className="nav-link" style={css('color:var(--nl,rgba(255,255,255,0.9));font-size:14px;font-weight:500;transition:color .3s')}>Planes</a>
            <a href="#faq" className="nav-link" style={css('color:var(--nl,rgba(255,255,255,0.9));font-size:14px;font-weight:500;transition:color .3s')}>Preguntas</a>
            <a href={`${BP}/blog/`} className="nav-link" style={css('color:var(--nl,rgba(255,255,255,0.9));font-size:14px;font-weight:500;transition:color .3s')}>Blog</a>
            <a href={guiaHome} onClick={() => track('guia_handoff', { q: '', via: 'nav' })} className="nav-guia-cta" style={css('height:40px;padding:0 18px;border-radius:12px;font-size:14px;font-weight:700;display:inline-flex;align-items:center;gap:7px;white-space:nowrap')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>Guía Médica</a>
            <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'nav' })} className="btn-teal" style={css('height:40px;padding:0 20px;border-radius:12px;background:#00BCB4;color:#fff;font-size:14px;font-weight:700;display:inline-flex;align-items:center;gap:7px;white-space:nowrap')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" /></svg>Simulá tu plan</a>
          </div>
          <button className="nav-burger" onClick={v.toggleMenu} aria-expanded={v.mobileMenuOpen} aria-controls="mobile-menu" aria-label="Abrir menú" style={css('display:none;width:40px;height:40px;border-radius:10px;border:none;background:rgba(255,255,255,0.16);color:#fff;align-items:center;justify-content:center;cursor:pointer;flex:none')}>
            {v.mobileMenuClosed && <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>}
            {v.mobileMenuOpen && <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18" /></svg>}
          </button>
        </div>
      </nav>
      {v.mobileMenuOpen && (
        <div id="mobile-menu" role="menu" style={css('position:fixed;top:66px;left:14px;right:14px;z-index:99;background:#fff;border-radius:16px;box-shadow:0 20px 48px rgba(0,59,113,0.18);padding:10px;display:flex;flex-direction:column;gap:2px')}>
          <a href={'tel:' + SP_TEL} onClick={() => { track('click_urgencias', { origen: 'menu_movil' }); v.closeMenu(); }} style={css('padding:13px 16px;border-radius:10px;background:#E11900;color:#fff;font-size:15px;font-weight:800;display:flex;align-items:center;gap:9px;margin-bottom:4px')}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16.9v2.6a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 3.7 3h2.6a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.5 10.5a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" /></svg>Urgencias · {SP_PHONE_DISPLAY}</a>
          <a href={v.guiaHome} onClick={() => { track('guia_handoff', { q: '', via: 'menu_movil' }); v.closeMenu(); }} style={css('padding:14px 16px;border-radius:10px;background:#E6F7F6;color:#007d77;font-size:15px;font-weight:700;display:flex;align-items:center;gap:9px')}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>Guía Médica</a>
          <a href="#cartilla" onClick={v.closeMenu} style={css('padding:14px 16px;border-radius:10px;color:#003B71;font-size:15px;font-weight:600')}>Qué cubre</a>
          <a href="#comparar" onClick={v.closeMenu} style={css('padding:14px 16px;border-radius:10px;color:#003B71;font-size:15px;font-weight:600')}>Planes</a>
          <a href="#faq" onClick={v.closeMenu} style={css('padding:14px 16px;border-radius:10px;color:#003B71;font-size:15px;font-weight:600')}>Preguntas frecuentes</a>
          <a href={`${BP}/blog/`} onClick={v.closeMenu} style={css('padding:14px 16px;border-radius:10px;color:#003B71;font-size:15px;font-weight:600')}>Blog</a>
          <a href={`${BP}/simulador/`} onClick={() => { track('cta_simulador', { origen: 'menu_movil' }); v.closeMenu(); }} style={css('margin-top:6px;padding:14px 16px;border-radius:10px;background:#00BCB4;color:#fff;font-size:15px;font-weight:700;text-align:center;display:flex;align-items:center;justify-content:center;gap:8px')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" /></svg>Simulá tu plan</a>
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
            {/* Dos puertas (PLAN-home-v2): el prospecto cotiza, el afiliado va a su red. */}
            <div style={css('display:flex;gap:14px;flex-wrap:wrap')}>
              <a href={`${BP}/simulador/`} onClick={() => track('puerta_home', { puerta: 'plan' })} className="btn-teal" style={css('height:54px;padding:0 30px;border-radius:14px;background:#00BCB4;color:#fff;font-size:16px;font-weight:700;display:inline-flex;align-items:center;gap:9px')}>Calcular mi plan <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
              <a href={`${BP}/guia/guia_home.html#mi-red`} onClick={() => track('puerta_home', { puerta: 'ya_soy_sp' })} className="btn-ghost-light" style={css('height:54px;padding:0 28px;border-radius:14px;background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.5);color:#fff;font-size:16px;font-weight:600;display:inline-flex;align-items:center;gap:9px')}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>Ya soy de SP · Ver mi red</a>
            </div>
            <a href={`${BP}/historia/`} style={css('display:inline-block;margin-top:6px;padding:14px 8px 14px 0;color:rgba(255,255,255,0.75);font-size:14px;font-weight:500;text-decoration:underline;text-underline-offset:4px')}>Conocé nuestra historia →</a>
          </div>
        </div>
        <div style={css('position:absolute;left:50%;bottom:26px;transform:translateX(-50%);color:rgba(255,255,255,0.7);display:flex;flex-direction:column;align-items:center;gap:6px')}>
          <span style={css('font-size:11px;letter-spacing:.1em;text-transform:uppercase')}>Bajá</span>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={css('animation:cue 1.8s ease-in-out infinite')}><path d="M12 5v14M6 13l6 6 6-6" /></svg>
        </div>
      </section>

      {/* QUÉ CUBRE — buscador de cobertura (ex "cartilla viva": jerga, ver BITACORA cap. 15) */}
      <section id="cartilla" style={css('padding:110px 40px;background:#fff')}>
        <div style={css('max-width:1000px;margin:0 auto')}>
          <div data-rv style={css('text-align:center;max-width:640px;margin:0 auto 20px')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#007d77;margin-bottom:14px')}>Guía Médica · sin letra chica</div>
            <h2 className="disp" style={css('font-size:40px;font-weight:800;color:#003B71;line-height:1.14;letter-spacing:-0.02em;margin:0 0 14px')}>Escribí lo que necesitás y mirá <span style={css('color:#007d77')}>qué cubre</span>.</h2>
            <p style={css('font-size:17px;line-height:1.6;color:#6B6B6B;margin:0')}>Nada de adivinar. Antes de contratar ya sabés qué cubre cada plan y cuánto ponés de tu bolsillo.</p>
          </div>
          <div data-rv style={css('max-width:640px;margin:0 auto 32px;background:#E6F7F6;border-radius:12px;padding:14px 18px;font-size:13.5px;color:#00695f;line-height:1.55;text-align:center')}><b>Lister</b> es nuestro centro médico propio (consultas, laboratorio e imagen). <b>«La red»</b> suma Lister + más de 50 prestadores externos en todo el país.</div>

          <div data-rv style={css('background:#F7FBFB;border:1px solid #d9efed;border-radius:20px;padding:26px 26px 30px;box-shadow:0 1px 3px rgba(0,0,0,0.06)')}>
            <div style={css('position:relative')}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#009690" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={css('position:absolute;left:18px;top:50%;transform:translateY(-50%);pointer-events:none')}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              <input type="text" role="searchbox" aria-label="Buscar un estudio, consulta o tratamiento" aria-expanded={v.showDrop} aria-controls="cartilla-matches" value={v.q} onChange={v.onQ} onKeyDown={v.onQKey} placeholder="Ej: resonancia, parto, psicología…" className="search-inp" style={css('width:100%;height:58px;border:1.5px solid #cfe0dc;border-radius:14px;padding:0 18px 0 48px;font-size:17px;color:#1D1D1B;background:#fff;outline:none')} />
              {v.showDrop && (
                <div id="cartilla-matches" role="listbox" style={css('position:absolute;left:0;right:0;top:64px;z-index:5;background:#fff;border:1px solid #E8E8E8;border-radius:14px;box-shadow:0 12px 34px rgba(0,59,113,0.14);overflow:hidden')}>
                  {v.matches.map((m, i) => (
                    <button key={i} role="option" onClick={m.onPick} className="cart-match" style={css('display:flex;align-items:center;gap:11px;width:100%;text-align:left;padding:13px 16px;background:#fff;border:none;border-bottom:1px solid #F0F0F0;cursor:pointer;font-size:15px;color:#1D1D1B')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00BCB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>{m.name}</button>
                  ))}
                  <a role="option" href={v.guiaQHref} onClick={() => v.trackGuia('dropdown')} className="cart-match" style={css('display:flex;align-items:center;gap:11px;width:100%;padding:13px 16px;background:#F7FBFB;font-size:15px;font-weight:700;color:#007d77')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V8l7-4 7 4v13M10 21v-4h4v4" /></svg>Buscar «{v.q.trim()}» en la Guía Médica<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={css('margin-left:auto')}><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
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
                <div><div style={css('font-size:12px;color:#9bc0e0')}>Cobertura</div><div className="disp" style={css('font-size:20px;font-weight:800')}>{v.selName}</div></div>
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
            <div style={css('font-size:12.5px;color:#6B6B6B;margin-top:12px;text-align:center')}>Cifras de referencia — el detalle final de tu contrato lo confirmás con tu asesor.</div>
            <div style={css('margin-top:18px;padding-top:18px;border-top:1px solid #d9efed;text-align:center;font-size:14.5px;color:#3D3D3D')}>¿Buscás dónde atenderte? <a href={v.guiaHome} onClick={() => v.trackGuia('link_cartilla')} className="link-teal" style={css('color:#007d77;font-weight:700')}>Abrí la Guía Médica</a> — médicos, sanatorios y estudios de toda la red.</div>
          </div>
        </div>
      </section>

      {/* COMPARADOR SLIDER */}
      <section id="comparar" style={css('padding:110px 40px;background:#F5F5F5')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          <div data-rv style={css('text-align:center;max-width:640px;margin:0 auto 48px')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#007d77;margin-bottom:14px')}>Tres planes, un solo deslizador</div>
            <h2 className="disp" style={css('font-size:40px;font-weight:800;color:#003B71;line-height:1.14;letter-spacing:-0.02em;margin:0 0 14px')}>Movelo y mirá cómo cambia <span style={css('color:#007d77')}>tu cobertura</span>.</h2>
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
                <a href={v.waHref} onClick={() => track('click_whatsapp', { origen: 'comparador', plan: v.planName })} target="_blank" rel="noopener" className="btn-teal" style={css('height:48px;padding:0 26px;border-radius:13px;background:#00BCB4;color:#fff;font-size:15px;font-weight:700;display:inline-flex;align-items:center')}>Consultar este plan</a>
              </div>
              {v.showFullTable && (
                <div style={css('margin-top:22px;border:1px solid #E8E8E8;border-radius:16px;overflow:hidden;overflow-x:auto')}>
                  <div style={css('display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;background:#003B71;color:#fff;min-width:560px')}>
                    <div style={css('padding:12px 16px;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;display:flex;align-items:center')}>Servicio</div>
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
            <div><div style={css('font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#00736e;margin-bottom:6px')}>Plan aparte · 65 años o más</div><div style={css('font-size:16px;color:#3D3D3D;line-height:1.55')}>¿Buscás para tus padres o un adulto mayor? <b style={css('color:#003B71')}>SP Senior</b> y <b style={css('color:#003B71')}>SP Senior Plus</b> tienen cuidado continuo pensado para ellos.</div></div>
            <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'banda_senior' })} className="btn-navy" style={css('height:46px;padding:0 22px;border-radius:12px;background:#003B71;color:#fff;font-size:14px;font-weight:700;display:inline-flex;align-items:center;white-space:nowrap')}>Simular Senior</a>
          </div>
        </div>
      </section>

      {/* SIMULADOR — teaser hacia /simulador */}
      <section style={css('padding:110px 40px;background:#003B71')}>
        <div data-rv style={css('max-width:1000px;margin:0 auto;background:linear-gradient(135deg,#004a8f 0%,#00294f 100%);border:1px solid rgba(128,221,216,0.18);border-radius:26px;padding:56px 44px;text-align:center;position:relative;overflow:hidden;box-shadow:0 24px 60px rgba(0,20,45,0.35)')}>
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
            <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'teaser' })} className="btn-teal" style={css('height:56px;padding:0 34px;border-radius:15px;background:#00BCB4;color:#fff;font-size:17px;font-weight:800;display:inline-flex;align-items:center;gap:10px')}>Simulá tu plan <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA (después del simulador) */}
      <section style={css('padding:100px 40px 90px;background:#fff')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          <div data-rv style={css('text-align:center;max-width:640px;margin:0 auto 44px')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#007d77;margin-bottom:14px')}>De la cotización a tu credencial</div>
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

      {/* MANIFIESTO — versión breve, en segunda persona; la historia completa vive en /historia */}
      <section data-mani-corto style={css('padding:110px 40px;background:#002A52')}>
        <div data-rv style={css('max-width:780px;margin:0 auto;text-align:center')}>
          <p className="disp" style={css('font-size:clamp(24px,3vw,36px);line-height:1.32;letter-spacing:-0.01em;color:#fff;margin:0 0 24px')}>Creés que estás protegido. La mayoría lo descubre recién cuando algo sale mal. Nosotros creemos que la protección real se construye <span style={css('color:#00BCB4')}>antes</span> — antes de la llamada de madrugada, antes del «¿esto me cubre?».</p>
          <p style={css('font-size:17px;color:#B3C7DB;line-height:1.65;margin:0 0 28px')}>Por eso acá todo se responde en un minuto: qué plan te conviene, cuánto sale, qué te cubre y dónde te atendés.</p>
          <div className="disp" style={css('font-size:21px;color:#fff;margin-bottom:24px')}>Salud Protegida. Protección que <span style={css('color:#00BCB4')}>se siente</span>.</div>
          <a href={`${BP}/historia/`} style={css('color:#80DDD8;font-size:15px;font-weight:700;text-decoration:underline;text-underline-offset:4px')}>Ver la historia completa →</a>
        </div>
      </section>

      {/* DIFERENCIADORES */}
      <section style={css('padding:80px 40px;background:#E6F7F6')}>
        <div style={css('max-width:1080px;margin:0 auto')}>
          <div data-rv style={css('text-align:center;max-width:660px;margin:0 auto 42px')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#007d77;margin-bottom:14px')}>Lo que ponemos por escrito</div>
            <h2 className="disp" style={css('font-size:36px;font-weight:800;color:#003B71;line-height:1.16;letter-spacing:-0.02em;margin:0 0 12px')}>Lo que casi nadie te <span style={css('color:#007d77')}>garantiza</span>.</h2>
            <p style={css('font-size:16px;line-height:1.6;color:#3D3D3D;margin:0')}>No son promesas sueltas: quedan escritas en tu plan.</p>
          </div>
          <div data-rv className="two-col" style={css('display:grid;grid-template-columns:repeat(3,1fr);gap:20px')}>
            {v.difs.map((dz, i) => (
              <div key={i} style={css('background:#fff;border-radius:18px;padding:28px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.06)')}>
                <div style={css('width:46px;height:46px;border-radius:13px;background:#E6F7F6;color:#007d77;display:flex;align-items:center;justify-content:center;margin-bottom:16px')}><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={dz.icon} /></svg></div>
                <div style={css('font-size:17px;font-weight:800;color:#003B71;line-height:1.3;margin-bottom:7px')}>{dz.title}</div>
                <div style={css('font-size:14px;color:#6B6B6B;line-height:1.55')}>{dz.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONFIANZA / SOBRE SP (con boceto del edificio) */}
      <section style={css('padding:96px 40px 40px;background:#fff')}>
        <div data-rv className="two-col" style={css('max-width:1080px;margin:0 auto;background:#E6EDF4;border-radius:20px;padding:40px;display:grid;grid-template-columns:0.85fr 1.15fr;gap:40px;align-items:center')}>
          <div style={css('position:relative;display:flex;align-items:center;justify-content:center;min-height:210px')}>
            <div style={css('position:absolute;width:210px;height:210px;border-radius:50%;background:#d4e0ee')}></div>
            <img src={`${BP}/assets/edificio.webp`} alt="Edificio administrativo de Salud Protegida" loading="lazy" style={css('position:relative;width:100%;max-width:340px;height:auto;display:block')} />
          </div>
          <div>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#00736e;margin-bottom:12px')}>Quiénes somos</div>
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

      {/* RED DE BENEFICIOS + PRESTADORES — dos tiras flotantes, sentidos opuestos */}
      <section style={css('padding:88px 0 92px;background:#F5F5F5;overflow:hidden')}>
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
      <section id="faq" style={css('padding:110px 40px;background:#F5F5F5')}>
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
            <a href={v.waHref} onClick={() => track('click_whatsapp', { origen: 'cierre' })} target="_blank" rel="noopener" className="btn-white-teal" style={css('height:52px;padding:0 26px;border-radius:13px;background:#fff;color:#007d77;font-size:15px;font-weight:700;display:inline-flex;align-items:center;gap:9px')}><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z" /></svg>WhatsApp</a>
            <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'cierre' })} className="btn-ghost-light2" style={css('height:52px;padding:0 26px;border-radius:13px;background:rgba(255,255,255,0.16);border:1.5px solid rgba(255,255,255,0.6);color:#fff;font-size:15px;font-weight:700;display:inline-flex;align-items:center')}>Simular mi plan</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={css('background:#002A52;color:#fff;padding:56px 40px 30px')}>
        <div className="two-col" style={css('max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:36px;padding-bottom:30px;border-bottom:1px solid rgba(255,255,255,0.12)')}>
          <div>
            <img src={`${BP}/assets/brand/logo-sp-white.png`} alt="Salud Protegida" loading="lazy" style={css('height:52px;display:block;margin-bottom:14px')} />
            <div style={css('font-size:14px;color:#9bb6d2;line-height:1.6')}>Protección que se siente · +23 años · Asunción, Paraguay</div>
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
              <a href={`${BP}/simulador/`} className="foot-link" style={css('color:inherit')}>Simular mi plan</a>
            </div>
          </div>
        </div>
        <div style={css('max-width:1100px;margin:20px auto 0;font-size:12.5px;color:#7f9cbb')}>© 2026 Salud Protegida (Odontomedica S.A.). Coberturas de referencia sujetas a confirmación.</div>
      </footer>

      {/* COTIZAR STICKY (aparece al scrollear) */}
      <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'fab' })} data-cotizar-fab className="cotizar-fab" aria-label="Cotizar mi plan" style={css('position:fixed;right:22px;bottom:90px;z-index:110;height:48px;padding:0 20px;border-radius:999px;background:#003B71;color:#fff;font-size:14px;font-weight:800;display:inline-flex;align-items:center;gap:8px;box-shadow:0 10px 28px rgba(0,59,113,0.28)')}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" /></svg><span className="fab-full">Simulá tu plan</span><span className="fab-short">Simulá</span></a>

      {/* WHATSAPP FLOTANTE */}
      <a href={v.waHref} onClick={() => track('click_whatsapp', { origen: 'fab' })} target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp" className="btn-teal" style={css('position:fixed;right:22px;bottom:22px;z-index:110;width:58px;height:58px;border-radius:999px;background:#00BCB4;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 28px rgba(0,59,113,0.28)')}><svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z" /></svg></a>

    </div>
  );
}
