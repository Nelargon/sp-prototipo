'use client';

import { useState, useEffect, useRef } from 'react';
import { css } from '../css';
import { BP } from '../basePath';
import {
  WHATSAPP_NUMBER, fmt, engine, opts, why, peopleFor, ageTxt, groupLabel, titularAge,
} from '../quote';
import { track } from '../track';

const INITIAL_SIM = {
  step: 0, who: null, nivel: null, geo: null, addons: [], people: [],
  nombre: '', tel: '', email: '', sent: false, err: '', priceAnim: null,
};

export default function Simulador() {
  const [simState, setSimState] = useState(INITIAL_SIM);
  const simPatch = (p) => setSimState((s) => Object.assign({}, s, p));

  const rafRef = useRef(null);
  const prevStepRef = useRef(0);
  const [showCalc, setShowCalc] = useState(false);
  const [resumeAvailable, setResumeAvailable] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const [simDir, setSimDir] = useState(1);
  const savedSimRef = useRef(null);
  const livePrevRef = useRef(0);
  const liveRafRef = useRef(null);

  const toggleCalc = () => setShowCalc((v) => !v);

  // ===== Simulador (nativo) =====
  const pickWho = (k) => { setSimDir(1); simPatch({ who: k, people: peopleFor(k), step: 2 }); };
  const setPersonAge = (i, val) =>
    setSimState((s) => Object.assign({}, s, { people: s.people.map((p, idx) => (idx === i ? Object.assign({}, p, { age: +val }) : p)) }));
  const addKid = () =>
    setSimState((s) => {
      const ppl = s.people.slice();
      const kc = ppl.filter((p) => p.kind === 'kid').length;
      if (kc >= 6) return s;
      ppl.push({ role: 'Hijo/a ' + (kc + 1), age: 6, kind: 'kid' });
      return Object.assign({}, s, { people: ppl });
    });
  const removeKid = () =>
    setSimState((s) => {
      const ppl = s.people.slice();
      if (ppl.filter((p) => p.kind === 'kid').length <= 1) return s;
      for (let i = ppl.length - 1; i >= 0; i--) { if (ppl[i].kind === 'kid') { ppl.splice(i, 1); break; } }
      return Object.assign({}, s, { people: ppl });
    });
  const addAdult = () =>
    setSimState((s) => {
      const ppl = s.people.slice();
      if (ppl.length >= 2) return s;
      ppl.push({ role: 'Otra persona', age: 70, kind: 'adult' });
      return Object.assign({}, s, { people: ppl });
    });
  const removeAdult = () =>
    setSimState((s) => {
      const ppl = s.people.slice();
      if (ppl.length <= 1) return s;
      ppl.pop();
      return Object.assign({}, s, { people: ppl });
    });
  const toggleAddon = (k) =>
    setSimState((s) => {
      const cur = s.addons || [];
      const next = cur.includes(k) ? cur.filter((x) => x !== k) : cur.concat([k]);
      return Object.assign({}, s, { addons: next });
    });
  const simBack = () => { setSimDir(-1); setSimState((s) => Object.assign({}, s, { step: Math.max(0, s.step - 1) })); };
  const simGo = (patch, dir = 1) => { setSimDir(dir); simPatch(patch); };

  const bumpPersonAge = (i, delta) =>
    setSimState((s) => Object.assign({}, s, { people: s.people.map((p, idx) => {
      if (idx !== i) return p;
      const lo = p.kind === 'kid' ? 0 : 18, hi = p.kind === 'kid' ? 25 : 85;
      return Object.assign({}, p, { age: Math.max(lo, Math.min(hi, p.age + delta)) });
    }) }));

  const resumeSim = () => { if (savedSimRef.current) { setSimState(savedSimRef.current); setResumeAvailable(false); } };

  const quoteText = () => {
    const d = simState, r = engine(d), O2 = opts();
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
    track('sim_quote_download', {});
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
    track('sim_quote_share', {});
    const r = engine(simState);
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
    const d = simState;
    const emailOk = !d.email.trim() || /.+@.+\..+/.test(d.email);
    if (!d.nombre.trim() || d.tel.replace(/\D/g, '').length < 8 || !emailOk) {
      simPatch({ err: 'Necesitamos tu nombre y un WhatsApp válido (mín. 8 dígitos). El email es opcional.' });
      return;
    }
    // Sin nombre/tel/email en el evento: el lead viaja al CRM, no a la analítica.
    const rq = engine(d);
    track('sim_lead_submit', { plan: rq.name, precio: rq.price });
    simPatch({ sent: true, err: '' });
  };

  // ===== price count-up (was componentDidUpdate) =====
  useEffect(() => {
    const step = simState.step;
    if (step > 0 && step !== prevStepRef.current) track('sim_step', { paso: Math.min(step, 6) });
    if (prevStepRef.current < 6 && step >= 6) {
      const rq = engine(simState);
      track('sim_result_view', { plan: rq.name, precio: rq.price });
      const target = rq.price;
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
  }, [simState.step]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  // Persistent live estimate in the sidebar — count-up whenever the config changes.
  useEffect(() => {
    const dd = simState;
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
  }, [simState]);

  useEffect(() => () => { if (liveRafRef.current) cancelAnimationFrame(liveRafRef.current); }, []);

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
      const d = simState;
      if (d.step > 0 && d.step < 6 && !d.sent) localStorage.setItem('sp-sim-v1', JSON.stringify(d));
      else if (d.step === 0 || d.sent) localStorage.removeItem('sp-sim-v1');
    } catch (e) {}
  }, [simState]);

  // ===== derived render values =====
  const waDigits = (WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const waHref = waDigits ? ('https://wa.me/' + waDigits + '?text=' + encodeURIComponent('Hola! Quiero información sobre los planes de Salud Protegida.')) : '#';

  // simulador — "configurador": ¿Para quién? → Cobertura → Zona → Edades → Adicionales → resultado
  const d = simState, O = opts(), WHY = why();
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
      label: 'font-size:13.5px;transition:color 220ms;' + (done || active ? 'color:#fff;font-weight:' + (active ? '700' : '500') + ';' : 'color:#9fb8d2;font-weight:500;'),
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

  // El acompañamiento reacciona a lo que la persona eligió — como haría un
  // asesor que escucha — en vez de repetir un mensaje fijo por paso.
  const encWho = { mi: 'Un plan para vos. Empecemos bien.', pareja: 'Para los dos. Cuidarse de a dos suma.', familia: 'Toda la familia junta — de eso se trata.', padres: 'Cuidar a los que nos cuidaron. Estamos con vos.' }[d.who];
  const encNivel = isPadres
    ? ({ equilibrio: 'SP Senior: cuidado cercano para ellos.', amplia: 'Senior Plus: lo más completo para ellos.' })[d.nivel]
    : ({ esencial: 'Lo importante, bien cubierto.', equilibrio: 'El equilibrio que más familias eligen.', amplia: 'Tranquilidad completa. Buen viaje.' })[d.nivel];
  const encGeo = { central: 'Cobertura donde hacés tu vida.', interior: 'Tu zona, bien cubierta.', nacional: 'Todo el país con vos.' }[d.geo];
  const stepEnc = { 1: 'Empecemos por lo básico.', 2: encWho || 'Esto define tu precio base.', 3: encNivel || 'Elegí hasta dónde te cubrimos.', 4: encGeo || 'Ahora afinamos según las edades.', 5: 'Último paso y vemos tu precio.' }[d.step] || '';
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
    download: downloadQuote, share: shareQuote, shareMsg,
    resumeAvailable, resume: resumeSim,
    enc: stepEnc, stepNum: Math.min(5, Math.max(1, d.step)), totalSteps: 5, progressPct: d.step >= 6 ? 100 : (d.step / 5) * 100, isQuestion: d.step >= 1 && d.step <= 5,
    headerStyle: 'padding:16px 20px;color:#fff;background:' + (r ? r.color : '#003B71'),
    formOpen: !d.sent, sentOpen: d.sent,
    nombre: d.nombre, tel: d.tel, email: d.email, err: d.err, hasErr: !!d.err,
    setNombre: (e) => simPatch({ nombre: e.target.value }), setTel: (e) => simPatch({ tel: e.target.value }), setEmail: (e) => simPatch({ email: e.target.value }),
    submit: simSubmit,
  };

  return (
    <div style={css('display:flex;justify-content:center')}>
      <div className="sim-card" style={css('width:760px;max-width:100%;display:flex;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 24px 60px rgba(0,59,113,0.10);border:0.5px solid #E8E8E8')}>

        <div className="sim-side" style={css('width:250px;flex:none;background:#003B71;color:#fff;padding:30px 26px;display:flex;flex-direction:column')}>
          <div style={css('display:flex;align-items:center;gap:10px;margin-bottom:26px')}><span style={css('width:30px;height:30px;border-radius:9px;background:#fff;color:#003B71;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800')}>SP</span><span style={css('font-size:14px;font-weight:800')}>Salud Protegida</span></div>
          {sim.livePanelReady ? (
            <div className="sim-live-panel" style={css('margin-bottom:24px')}>
              <div style={css('font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#80DDD8;margin-bottom:6px')}>Tu estimado</div>
              <div data-live-price className="num-tnum" style={css('font-size:29px;font-weight:800;color:#fff;letter-spacing:-0.01em;line-height:1')}>{sim.liveTotalFmt}</div>
              <div style={css('font-size:12px;color:#B3C7DB;margin-top:4px')}>/mes · estimado</div>
              <div style={css('display:inline-flex;align-items:center;margin-top:12px;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:800;color:#fff;transition:background .3s;background:' + sim.planColor)}>{sim.planShort}</div>
              {sim.gaugeShow && (
                <div style={css('display:flex;gap:5px;margin-top:14px')}>
                  {[1, 2, 3].map((n) => <div key={n} style={css('flex:1;height:6px;border-radius:999px;transition:background .3s;background:' + (n <= sim.gaugeLevel ? sim.planColor : 'rgba(255,255,255,0.15)'))}></div>)}
                </div>
              )}
              <div style={css('font-size:11px;color:#7fa6cc;margin-top:9px;line-height:1.4')}>Se ajusta a medida que configurás.</div>
            </div>
          ) : (
            <div className="sim-side-h" style={css('font-size:20px;font-weight:800;line-height:1.2;margin-bottom:26px;letter-spacing:-0.01em')}>Tu plan,<br />a tu medida</div>
          )}
          <div className="sim-steps" style={css('display:flex;flex-direction:column;gap:14px;flex:1')}>
            {sim.stepsList.map((st, i) => (
              <div key={i} style={css('display:flex;align-items:center;gap:11px')}>
                <span style={css(st.dot)}>{st.isDone && <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}{st.showNum && st.num}</span>
                <span style={css('display:flex;flex-direction:column;min-width:0')}><span style={css(st.label)}>{st.name}</span>{st.value && <span style={css('font-size:11.5px;color:#80DDD8;font-weight:700;line-height:1.2;margin-top:1px')}>{st.value}</span>}</span>
              </div>
            ))}
          </div>
          {sim.enc && <div className="sim-side-enc" style={css('font-size:12px;color:#80DDD8;font-weight:600;line-height:1.4;margin-top:16px')}>{sim.enc}</div>}
          <div className="sim-trust" style={css('font-size:12px;color:#B3C7DB;display:flex;align-items:center;gap:8px;margin-top:24px;line-height:1.4')}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none')}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>Sin datos sensibles · menos de 1 minuto</div>
        </div>

        <div className="sim-body" style={css('flex:1;min-width:0;background:#fff;padding:34px 34px;min-height:560px;display:flex;flex-direction:column;justify-content:center')}>
          {sim.isQuestion && (
            <div className="sim-mobile-progress" style={css('margin:0 0 20px')}>
              <div style={css('display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:8px')}>
                <span style={css('font-size:12px;font-weight:800;color:#003B71;white-space:nowrap')}>Paso {sim.stepNum} de {sim.totalSteps}</span>
                {sim.livePanelReady
                  ? <span style={css('text-align:right;white-space:nowrap')}><span style={css('font-size:11px;color:#6B6B6B')}>Estimado </span><span className="num-tnum" style={css('font-size:14px;font-weight:800;color:#003B71')}>{sim.liveTotalFmt}</span></span>
                  : <span style={css('font-size:12px;color:#007d77;text-align:right')}>{sim.enc}</span>}
              </div>
              <div style={css('height:5px;border-radius:999px;background:#E6EDF4;overflow:hidden')}><div style={css('height:100%;border-radius:999px;transition:width .35s cubic-bezier(.22,1,.36,1),background .3s;background:' + sim.progressBarColor + ';width:' + sim.progressPct + '%')}></div></div>
              {sim.livePanelReady && sim.enc && <div style={css('font-size:12px;color:#007d77;font-weight:600;margin-top:7px')}>{sim.enc}</div>}
            </div>
          )}
          {sim.isIntro && (
            <div style={css(sim.stepAnim)}>
              <h3 style={css('font-size:25px;font-weight:800;color:#003B71;line-height:1.18;letter-spacing:-0.01em;margin:0 0 10px')}>Encontremos tu plan ideal</h3>
              <p style={css('font-size:15px;color:#3D3D3D;line-height:1.6;margin:0 0 24px')}>Te hacemos unas pocas preguntas y te mostramos el plan que mejor va con tu momento, con un precio estimado. El precio lo ves antes de dejar cualquier dato.</p>
              <div style={css('display:flex;align-items:center;gap:16px;flex-wrap:wrap')}>
                <button onClick={sim.start} className="btn-teal" style={css('height:52px;padding:0 28px;border:none;border-radius:13px;background:#00BCB4;color:#fff;font-size:16px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:8px;transition:background 160ms')}>Empecemos <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
                {sim.resumeAvailable && <button onClick={sim.resume} className="link-teal" style={css('background:none;border:none;color:#007d77;font-size:14px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:0')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>Retomar mi simulación</button>}
              </div>
            </div>
          )}

          {sim.isWho && (
            <div style={css(sim.stepAnim)}>
              <button onClick={sim.back} className="link-teal" style={css('display:inline-flex;align-items:center;gap:5px;background:none;border:none;color:#6B6B6B;font-size:13px;font-weight:600;cursor:pointer;padding:0;margin-bottom:14px')}>← Volver</button>
              <div style={css('font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#007d77;margin-bottom:8px')}>Tu grupo</div>
              <h3 style={css('font-size:22px;font-weight:800;color:#003B71;line-height:1.25;letter-spacing:-0.01em;margin:0 0 8px')}>¿Para quién es el plan?</h3>
              <p style={css('font-size:13px;color:#6B6B6B;line-height:1.5;margin:0 0 16px;display:flex;align-items:flex-start;gap:7px')}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00BCB4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:1px')}><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" /><path d="M12 17h.01" /></svg><span>{sim.whyWho}</span></p>
              <div style={css('display:flex;flex-direction:column;gap:10px')}>
                {sim.whoOpts.map((opt, i) => (
                  <button key={i} onClick={opt.onClick} className="sim-opt" style={css('display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;padding:15px 17px;border:1.5px solid #E8E8E8;border-radius:12px;background:#fff;color:#1D1D1B;font-size:15px;font-weight:500;cursor:pointer;transition:all 150ms cubic-bezier(0.22,1,0.36,1)')}><span style={css('display:flex;flex-direction:column;gap:3px')}><span>{opt.label}</span>{opt.hasNote && <span style={css('font-size:12px;font-weight:400;color:#6B6B6B;line-height:1.35')}>{opt.note}</span>}</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00BCB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none')}><path d="m9 18 6-6-6-6" /></svg></button>
                ))}
              </div>
            </div>
          )}

          {sim.isEdades && (
            <div style={css(sim.stepAnim)}>
              <button onClick={sim.back} className="link-teal" style={css('display:inline-flex;align-items:center;gap:5px;background:none;border:none;color:#6B6B6B;font-size:13px;font-weight:600;cursor:pointer;padding:0;margin-bottom:14px')}>← Volver</button>
              <div style={css('font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#007d77;margin-bottom:8px')}>Las edades</div>
              <h3 style={css('font-size:22px;font-weight:800;color:#003B71;line-height:1.25;letter-spacing:-0.01em;margin:0 0 8px')}>¿Qué edades tienen?</h3>
              <p style={css('font-size:13px;color:#6B6B6B;line-height:1.5;margin:0 0 18px;display:flex;align-items:flex-start;gap:7px')}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00BCB4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:1px')}><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" /><path d="M12 17h.01" /></svg><span>{sim.whyEdades}</span></p>
              <div style={css('display:flex;flex-direction:column')}>
                {sim.people.map((person, i) => (
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
              {sim.isFamilia && (
                <div style={css('display:flex;align-items:center;justify-content:space-between;margin-top:4px;padding-top:14px;border-top:1px solid #F0F0F0')}>
                  <span style={css('font-size:14px;font-weight:700;color:#003B71')}>Hijos a sumar</span>
                  <div style={css('display:flex;align-items:center;gap:14px')}>
                    <button onClick={sim.removeKid} aria-label="Quitar hijo" className="step-btn" style={css('width:34px;height:34px;border-radius:999px;border:1.5px solid #E8E8E8;background:#fff;color:#003B71;font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1')}>−</button>
                    <span style={css('font-size:17px;font-weight:800;color:#003B71;min-width:18px;text-align:center')}>{sim.kidCount}</span>
                    <button onClick={sim.addKid} aria-label="Sumar hijo" className="step-btn" style={css('width:34px;height:34px;border-radius:999px;border:1.5px solid #E8E8E8;background:#fff;color:#003B71;font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1')}>+</button>
                  </div>
                </div>
              )}
              {sim.isPadres && (
                <div style={css('display:flex;align-items:center;justify-content:space-between;margin-top:4px;padding-top:14px;border-top:1px solid #F0F0F0')}>
                  <span style={css('font-size:14px;font-weight:700;color:#003B71')}>Personas a cubrir</span>
                  <div style={css('display:flex;align-items:center;gap:14px')}>
                    <button onClick={sim.removeAdult} aria-label="Quitar persona" className="step-btn" style={css('width:34px;height:34px;border-radius:999px;border:1.5px solid #E8E8E8;background:#fff;color:#003B71;font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1')}>−</button>
                    <span style={css('font-size:17px;font-weight:800;color:#003B71;min-width:18px;text-align:center')}>{sim.adultCount}</span>
                    <button onClick={sim.addAdult} aria-label="Sumar persona" className="step-btn" style={css('width:34px;height:34px;border-radius:999px;border:1.5px solid #E8E8E8;background:#fff;color:#003B71;font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1')}>+</button>
                  </div>
                </div>
              )}
              <button onClick={sim.toAddons} className="btn-teal" style={css('width:100%;height:50px;margin-top:22px;border:none;border-radius:13px;background:#00BCB4;color:#fff;font-size:16px;font-weight:800;cursor:pointer;transition:background 160ms')}>Continuar</button>
            </div>
          )}

          {sim.isNivel && (
            <div style={css(sim.stepAnim)}>
              <button onClick={sim.back} className="link-teal" style={css('display:inline-flex;align-items:center;gap:5px;background:none;border:none;color:#6B6B6B;font-size:13px;font-weight:600;cursor:pointer;padding:0;margin-bottom:14px')}>← Volver</button>
              <div style={css('font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#007d77;margin-bottom:8px')}>{sim.nivelEyebrow}</div>
              <h3 style={css('font-size:22px;font-weight:800;color:#003B71;line-height:1.25;letter-spacing:-0.01em;margin:0 0 8px')}>{sim.nivelTitle}</h3>
              <p style={css('font-size:13px;color:#6B6B6B;line-height:1.5;margin:0 0 16px;display:flex;align-items:flex-start;gap:7px')}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00BCB4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:1px')}><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" /><path d="M12 17h.01" /></svg><span>{sim.whyNivel}</span></p>
              <div style={css('display:flex;flex-direction:column;gap:10px')}>
                {sim.nivelOpts.map((opt, i) => (
                  <button key={i} onClick={opt.onClick} className="sim-opt" style={css('display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;padding:15px 17px;border:1.5px solid #E8E8E8;border-radius:12px;background:#fff;color:#1D1D1B;font-size:15px;font-weight:500;cursor:pointer;transition:all 150ms cubic-bezier(0.22,1,0.36,1)')}><span style={css('display:flex;flex-direction:column;gap:3px;min-width:0')}><span>{opt.label}</span>{opt.hasNote && <span style={css('font-size:12px;font-weight:400;color:#6B6B6B;line-height:1.35')}>{opt.note}</span>}</span><span style={css('display:flex;align-items:center;gap:9px;flex:none')}><span style={css('font-size:12.5px;font-weight:800;color:#007d77;white-space:nowrap')}>{opt.from}</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00BCB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg></span></button>
                ))}
              </div>
            </div>
          )}

          {sim.isGeo && (
            <div style={css(sim.stepAnim)}>
              <button onClick={sim.back} className="link-teal" style={css('display:inline-flex;align-items:center;gap:5px;background:none;border:none;color:#6B6B6B;font-size:13px;font-weight:600;cursor:pointer;padding:0;margin-bottom:14px')}>← Volver</button>
              <div style={css('font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#007d77;margin-bottom:8px')}>Zona</div>
              <h3 style={css('font-size:22px;font-weight:800;color:#003B71;line-height:1.25;letter-spacing:-0.01em;margin:0 0 8px')}>¿Hasta dónde querés cobertura?</h3>
              <p style={css('font-size:13px;color:#6B6B6B;line-height:1.5;margin:0 0 16px;display:flex;align-items:flex-start;gap:7px')}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00BCB4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:1px')}><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" /><path d="M12 17h.01" /></svg><span>{sim.whyGeo}</span></p>
              <div style={css('display:flex;flex-direction:column;gap:10px')}>
                {sim.geoOpts.map((opt, i) => (
                  <button key={i} onClick={opt.onClick} className="sim-opt" style={css('display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;padding:15px 17px;border:1.5px solid #E8E8E8;border-radius:12px;background:#fff;color:#1D1D1B;font-size:15px;font-weight:500;cursor:pointer;transition:all 150ms cubic-bezier(0.22,1,0.36,1)')}><span style={css('display:flex;flex-direction:column;gap:3px;min-width:0')}><span>{opt.label} <span style={css('font-size:13px;font-weight:800;color:#00BCB4;letter-spacing:0.06em')}>{opt.tier}</span></span><span style={css('font-size:12px;font-weight:400;color:#6B6B6B;line-height:1.35')}>{opt.note}</span></span><span style={css('display:flex;align-items:center;gap:9px;flex:none')}><span style={css('font-size:12.5px;font-weight:800;color:#007d77;white-space:nowrap')}>{opt.impact}</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00BCB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg></span></button>
                ))}
              </div>
            </div>
          )}

          {sim.isAddons && (
            <div style={css(sim.stepAnim)}>
              <button onClick={sim.back} className="link-teal" style={css('display:inline-flex;align-items:center;gap:5px;background:none;border:none;color:#6B6B6B;font-size:13px;font-weight:600;cursor:pointer;padding:0;margin-bottom:14px')}>← Volver</button>
              <div style={css('font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#007d77;margin-bottom:8px')}>Coberturas adicionales</div>
              <h3 style={css('font-size:22px;font-weight:800;color:#003B71;line-height:1.25;letter-spacing:-0.01em;margin:0 0 8px')}>¿Querés personalizar tu cobertura?</h3>
              <p style={css('font-size:13px;color:#6B6B6B;line-height:1.5;margin:0 0 16px;display:flex;align-items:flex-start;gap:7px')}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00BCB4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:1px')}><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" /><path d="M12 17h.01" /></svg><span>{sim.whyAddons}</span></p>
              {sim.liveReady && (
                <div style={css('display:flex;align-items:center;justify-content:space-between;gap:10px;background:#F2FBFA;border:1px solid #d9efed;border-radius:12px;padding:12px 15px;margin-bottom:14px')}>
                  <span style={css('font-size:13px;color:#00695f')}>Tu estimado</span>
                  <span style={css('text-align:right')}><span className="num-tnum" style={css('font-size:17px;font-weight:800;color:#003B71')}>{sim.liveTotal}</span><span style={css('font-size:12px;color:#6B6B6B;font-weight:500')}> /mes</span>{sim.liveAddonsAmount > 0 && <span className="num-tnum" style={css('display:block;font-size:12px;font-weight:700;color:#007d77')}>+ {sim.liveAddons} en adicionales</span>}</span>
                </div>
              )}
              <div style={css('display:flex;flex-direction:column;gap:10px')}>
                {sim.addonsList.map((ad, i) => (
                  <button key={i} onClick={ad.toggle} style={css(ad.rowStyle)}><span style={css('display:flex;align-items:center;gap:12px;min-width:0')}><span style={css(ad.boxStyle)}>{ad.selected && <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}</span><span style={css('display:flex;flex-direction:column;gap:2px;min-width:0')}><span style={css('font-size:15px;font-weight:600;color:#1D1D1B')}>{ad.label}</span><span style={css('font-size:12px;font-weight:400;color:#6B6B6B;line-height:1.35')}>{ad.note}</span></span></span><span style={css('font-size:12.5px;font-weight:800;color:#007d77;white-space:nowrap;flex:none')}>{ad.priceLabel}</span></button>
                ))}
              </div>
              <button onClick={sim.toResult} className="btn-teal" style={css('width:100%;height:50px;margin-top:18px;border:none;border-radius:13px;background:#00BCB4;color:#fff;font-size:15px;font-weight:800;cursor:pointer;transition:background 160ms')}>{sim.continueLabel}</button>
            </div>
          )}

          {sim.isResult && (
            <div style={css(sim.stepAnim)}>
              <div style={css('display:flex;align-items:center;gap:13px;margin-bottom:16px')}>
                <div style={css('position:relative;width:44px;height:44px;flex:none')}>
                  <svg width="44" height="44" viewBox="0 0 44 44" style={css('display:block')}><circle cx="22" cy="22" r="19" fill="none" stroke="#E6F7F6" strokeWidth="4"></circle><circle cx="22" cy="22" r="19" fill="none" stroke="#00BCB4" strokeWidth="4" strokeLinecap="round" strokeDasharray="119.4" strokeDashoffset="119.4" transform="rotate(-90 22 22)" style={css('animation:spRing 0.95s cubic-bezier(0.22,1,0.36,1) 0.1s forwards')}></circle></svg>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#00BCB4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={css('position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);animation:spCheckIn 0.4s cubic-bezier(0.22,1,0.36,1) 0.72s both')}><path d="M20 6 9 17l-5-5"></path></svg>
                </div>
                <div>
                  <div style={css('font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#007d77')}>Encontramos tu match</div>
                  <div style={css('font-size:14px;color:#6B6B6B')}>Según lo que nos contaste</div>
                </div>
              </div>
              <div style={css('border-radius:16px;overflow:hidden;border:0.5px solid #E8E8E8;animation:spGlow 1.3s cubic-bezier(0.22,1,0.36,1) 0.15s both')}>
                <div style={css(sim.headerStyle)}>
                  <div style={css('font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85')}>Plan recomendado</div>
                  <div style={css('font-size:24px;font-weight:800;line-height:1.1;margin-top:2px')}>{sim.resName}</div>
                  <div style={css('font-size:12px;font-weight:600;opacity:0.92;margin-top:4px;display:flex;align-items:center;gap:5px')}><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none')}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>Cobertura {sim.resGeo}</div>
                </div>
                <div style={css('padding:18px 20px;background:#fff')}>
                  <div style={css('display:flex;align-items:baseline;gap:8px;flex-wrap:wrap')}><span data-sp-price className="num-tnum" style={css('font-size:31px;font-weight:800;color:#003B71;letter-spacing:-0.01em;line-height:1')}>{sim.resPrice}</span><span style={css('font-size:14px;color:#6B6B6B;font-weight:500')}>/ mes estimado</span></div>
                  <div style={css('font-size:12px;color:#6B6B6B;margin:6px 0 14px')}>{sim.resGroup} · titular de {sim.titularAge}. El precio final lo confirma un asesor.</div>
                  <p style={css('font-size:14px;color:#3D3D3D;line-height:1.6;margin:0')}>{sim.resWhy}</p>
                  {sim.hasAddons && <div style={css('font-size:13px;color:#003B71;font-weight:600;margin-top:10px;display:flex;align-items:flex-start;gap:6px')}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00BCB4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={css('flex:none;margin-top:1px')}><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg><span>Sumás: {sim.resAddonsText}</span></div>}
                </div>
              </div>

              <div style={css('margin-top:12px')}>
                <button onClick={toggleCalc} aria-expanded={showCalc} className="link-teal" style={css('background:none;border:none;padding:0;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:13px;color:#6B6B6B;font-weight:600')}>¿Cómo calculamos esto? <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={css('transition:transform .2s cubic-bezier(.22,1,.36,1);transform:rotate(' + (showCalc ? '180deg' : '0deg') + ')')}><path d="m6 9 6 6 6-6" /></svg></button>
                {showCalc && (
                  <div style={css('margin-top:10px;border:1px solid #E8E8E8;border-radius:12px;overflow:hidden')}>
                    {sim.resBreakdown.map((it, i) => (
                      <div key={i} style={css('display:flex;justify-content:space-between;gap:12px;padding:11px 14px;font-size:13.5px;color:#3D3D3D;border-top:' + (i === 0 ? '0' : '1px solid #F0F0F0'))}><span>{it.label}</span><span style={css('font-weight:700;color:#003B71;white-space:nowrap')}>{it.amount}</span></div>
                    ))}
                    <div style={css('display:flex;justify-content:space-between;gap:12px;padding:12px 14px;border-top:1px solid #E8E8E8;background:#F7FBFB;font-size:14px;font-weight:800;color:#003B71')}><span>Total estimado</span><span>{sim.resTotal}</span></div>
                    <div style={css('padding:10px 14px;font-size:11.5px;color:#6B6B6B;background:#F7FBFB;border-top:1px solid #F0F0F0;line-height:1.4')}>Números de referencia, redondeados. El asesor confirma el total final.</div>
                  </div>
                )}
              </div>

              <div style={css('margin-top:18px')}>
                {sim.formOpen && (
                  <div style={css('background:#F7FBFB;border:1px solid #d9efed;border-radius:14px;padding:18px 18px 16px')}>
                    <div style={css('font-size:15px;font-weight:800;color:#003B71;margin-bottom:3px')}>¿A dónde te enviamos tu cotización?</div>
                    <div style={css('font-size:12px;color:#6B6B6B;margin-bottom:14px')}>{sim.whyContacto}</div>
                    <div style={css('display:flex;gap:10px;margin-bottom:10px')}>
                      <input type="text" value={sim.nombre} onChange={sim.setNombre} placeholder="Nombre y apellido" required className="inp" style={css('flex:1;min-width:0;height:46px;border:1.5px solid #E8E8E8;border-radius:8px;padding:0 14px;font-size:15px;color:#1D1D1B;background:#fff;outline:none')} />
                      <input type="tel" value={sim.tel} onChange={sim.setTel} placeholder="WhatsApp" required className="inp" style={css('flex:1;min-width:0;height:46px;border:1.5px solid #E8E8E8;border-radius:8px;padding:0 14px;font-size:15px;color:#1D1D1B;background:#fff;outline:none')} />
                    </div>
                    <input type="email" value={sim.email} onChange={sim.setEmail} placeholder="Email (opcional)" className="inp" style={css('width:100%;height:46px;border:1.5px solid #E8E8E8;border-radius:8px;padding:0 14px;font-size:15px;color:#1D1D1B;background:#fff;outline:none;margin-bottom:8px')} />
                    <div style={css('font-size:11.5px;color:#6B6B6B;margin-bottom:12px;line-height:1.4')}>Tu WhatsApp con código de país si podés (ej: +595 9…). El email es opcional.</div>
                    {sim.hasErr && <div role="alert" style={css('font-size:12px;color:#F44336;margin-bottom:10px')}>{sim.err}</div>}
                    <button onClick={sim.submit} className="btn-teal" style={css('width:100%;height:48px;border:none;border-radius:12px;background:#00BCB4;color:#fff;font-size:15px;font-weight:800;cursor:pointer;transition:background 160ms')}>Enviarme mi cotización</button>
                  </div>
                )}
                {sim.sentOpen && (
                  <div style={css('background:#E6F7F6;border:1px solid #bfe4e1;border-radius:14px;padding:24px;text-align:center')}>
                    <div style={css('width:46px;height:46px;border-radius:999px;background:#00BCB4;color:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto')}><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></div>
                    <div style={css('font-size:17px;font-weight:800;color:#003B71;margin-top:12px')}>¡Listo, {sim.nombre}!</div>
                    <div style={css('font-size:14px;color:#3D3D3D;margin-top:4px;line-height:1.5')}>Tu cotización va en camino. Te va a escribir un asesor — una persona, no un robot — para confirmarla y responder todo lo que quieras preguntar.</div>
                  </div>
                )}
                <a href={waHref} onClick={() => track('click_whatsapp', { origen: 'simulador_resultado' })} target="_blank" rel="noopener" className="btn-wa-outline" style={css('display:flex;align-items:center;justify-content:center;gap:9px;height:48px;border-radius:12px;background:#fff;color:#007d77;border:1.5px solid #00BCB4;font-size:15px;font-weight:700;margin-top:10px')}><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z" /></svg>Prefiero escribir por WhatsApp</a>
                <div style={css('display:flex;gap:10px;margin-top:10px')}>
                  <button onClick={sim.download} className="btn-wa-outline" style={css('flex:1;display:flex;align-items:center;justify-content:center;gap:8px;height:44px;border-radius:12px;background:#fff;color:#007d77;border:1.5px solid #cfe0dc;font-size:14px;font-weight:700;cursor:pointer')}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>Descargar</button>
                  <button onClick={sim.share} className="btn-wa-outline" style={css('flex:1;display:flex;align-items:center;justify-content:center;gap:8px;height:44px;border-radius:12px;background:#fff;color:#007d77;border:1.5px solid #cfe0dc;font-size:14px;font-weight:700;cursor:pointer')}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>{sim.shareMsg || 'Compartir'}</button>
                </div>
                <div style={css('display:flex;align-items:center;justify-content:space-between;margin-top:16px')}>
                  <a href={`${BP}/#comparar`} className="link-teal" style={css('font-size:13px;color:#6B6B6B;font-weight:600')}>Ver el detalle de los planes →</a>
                  <button onClick={sim.restart} className="link-grey" style={css('background:none;border:none;color:#6B6B6B;font-size:13px;font-weight:600;cursor:pointer')}>↺ Empezar de nuevo</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
