'use client';

import { useEffect } from 'react';
import { css } from '../css';
import { BP } from '../basePath';
import { track } from '../track';

/* Scrollytelling del manifiesto (720vh, 7 frases, 3 fotos con parallax).
   Vivía en la home como peaje entre el hero y las herramientas; desde el
   rediseño home-v2 (PLAN-home-v2.md, veredicto de la mesa de advisors)
   tiene su propia página /historia. La lógica de scroll es la misma que
   tenía la home; acá suma la medición de profundidad (manifesto_scroll). */
export default function Manifiesto() {
  useEffect(() => {
    let disposed = false;
    let onScroll = null;
    let maniRaf = null;
    const mani = document.querySelector('[data-manifesto]');
    if (!mani) return;
    const mGlow = mani.querySelector('[data-mani-glow]');
    const mBar = mani.querySelector('[data-mani-bar]');
    let mlines = [];
    let mphotos = [];
    const refreshMani = () => {
      if (!mlines.length || !mlines[0].isConnected) mlines = Array.prototype.slice.call(mani.querySelectorAll('[data-mline]'));
      if (!mphotos.length || !mphotos[0].isConnected) mphotos = Array.prototype.slice.call(mani.querySelectorAll('.mframe'));
    };
    refreshMani();
    let maniTarget = 0, maniP = 0;
    const CHAP_STARTS = [0, 1, 5];
    const hito = { 25: false, 50: false, 75: false, 100: false };
    const renderMani = (p) => {
      const n = mlines.length;
      if (!n) return;
      const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
      const seg = 0.5 + Math.min(1, Math.max(0, p / 0.86)) * (n - 1);
      mlines.forEach((ln, i) => {
        const u = seg - i;
        if (u <= -0.2 || u >= 1.2) { ln.style.visibility = 'hidden'; ln.style.opacity = '0'; return; }
        ln.style.visibility = 'visible';
        const op = ss(-0.12, 0.3, u) * (1 - ss(0.7, 1.12, u));
        ln.style.opacity = op.toFixed(3);
        ln.style.transform = 'translateY(calc(-50% + ' + ((0.5 - u) * 64).toFixed(1) + 'px))';
      });
      mphotos.forEach((ph, k) => {
        const start = CHAP_STARTS[k];
        const end = (k + 1 < CHAP_STARTS.length ? CHAP_STARTS[k + 1] : n) - 1;
        const bk = start + 0.5;
        const op = k === 0 ? 1 : ss(bk - 0.8, bk + 0.1, seg);
        ph.style.opacity = op.toFixed(3);
        ph.style.visibility = op <= 0.001 ? 'hidden' : 'visible';
        const w0 = k === 0 ? 0.5 : bk - 0.8;
        const qv = Math.min(1, Math.max(0, (seg - w0) / ((end + 1) - w0)));
        ph.firstElementChild.style.transform = 'translate3d(0,' + (-qv * 14).toFixed(1) + 'px,0) scale(' + (1.03 + qv * 0.07).toFixed(4) + ')';
      });
      if (mBar) mBar.style.width = (p * 100) + '%';
      if (mGlow) mGlow.style.opacity = String(0.5 + 0.5 * Math.sin(p * Math.PI));
    };
    const maniTick = () => {
      if (disposed) return;
      maniP += (maniTarget - maniP) * 0.065;
      if (Math.abs(maniTarget - maniP) < 0.0005) maniP = maniTarget;
      renderMani(maniP);
      maniRaf = maniP === maniTarget ? null : requestAnimationFrame(maniTick);
    };
    onScroll = () => {
      refreshMani();
      if (!mlines.length) return;
      const total = mani.offsetHeight - window.innerHeight;
      maniTarget = Math.min(1, Math.max(0, (-mani.getBoundingClientRect().top) / (total || 1)));
      const pct = maniTarget * 100;
      [25, 50, 75, 100].forEach((u) => {
        if (!hito[u] && pct >= u) { hito[u] = true; track('manifesto_scroll', { profundidad: u, pagina: 'historia' }); }
      });
      if (maniRaf === null) maniRaf = requestAnimationFrame(maniTick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    let maniInitTries = 0;
    const maniInit = () => {
      if (disposed) return;
      refreshMani();
      if (mlines.length) { renderMani(maniP); onScroll(); }
      else if (++maniInitTries < 50) setTimeout(maniInit, 100);
    };
    maniInit();
    return () => {
      disposed = true;
      if (onScroll) { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); }
      if (maniRaf) cancelAnimationFrame(maniRaf);
    };
  }, []);

  return (
    <section id="manifiesto" data-manifesto style={css('position:relative;height:720vh;background:var(--sp-navy-deep)')}>
      <div data-mani-inner style={css('position:sticky;top:0;height:100vh;overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--sp-navy-deep)')}>
        <div style={css('position:absolute;inset:0;pointer-events:none;background:radial-gradient(85% 65% at 50% 50%,transparent 40%,rgba(0,16,32,.45) 100%)')}></div>
        <div data-mani-glow style={css('position:absolute;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle,rgba(0,188,180,0.16) 0%,rgba(0,188,180,0) 62%);pointer-events:none')}></div>
        <div className="mani-media" style={css('position:absolute;inset:0;overflow:hidden;z-index:0')}>
          <figure className="mframe" style={css('margin:0')}><img src={`${BP}/assets/manifiesto/frase-1.webp`} alt="" /></figure>
          <figure className="mframe" style={css('margin:0')}><img src={`${BP}/assets/manifiesto/frase-4.webp`} alt="" loading="lazy" decoding="async" /></figure>
          <figure className="mframe" style={css('margin:0')}><img src={`${BP}/assets/manifiesto/frase-7.webp`} alt="" loading="lazy" decoding="async" /></figure>
        </div>
        <div style={css('position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,rgba(0,22,44,0.6) 0%,rgba(0,22,44,0.52) 55%,rgba(0,22,44,0.75) 100%),radial-gradient(90% 70% at 50% 50%,transparent 42%,rgba(0,14,28,0.4) 100%)')}></div>
        <div className="mani-grid" style={css('position:relative;z-index:2;width:100%;height:100%;max-width:1060px;margin:0 auto;padding:0 48px;display:flex;align-items:center;justify-content:center')}>
          <div className="mani-lines" style={css('position:relative;height:60vh;width:100%;text-align:center')}>
            <div data-mline className="disp mani-line" style={css('position:absolute;left:0;right:0;top:50%;font-size:clamp(26px,3.1vw,42px);line-height:1.14;letter-spacing:-0.01em;color:#fff')}>En Paraguay, miles de familias creen que están protegidas.</div>
            <div data-mline className="disp mani-line" style={css('position:absolute;left:0;right:0;top:50%;font-size:clamp(26px,3.1vw,42px);line-height:1.14;letter-spacing:-0.01em;color:#fff')}>La mayoría lo descubre recién cuando algo sale mal.</div>
            <div data-mline className="disp mani-line" style={css('position:absolute;left:0;right:0;top:50%;font-size:clamp(28px,3.4vw,46px);line-height:1.12;letter-spacing:-0.02em;color:#fff')}>Nosotros creemos que la protección real se construye <span style={css('color:var(--sp-teal)')}>antes</span>.</div>
            <div data-mline className="disp mani-line" style={css('position:absolute;left:0;right:0;top:50%;font-size:clamp(26px,3.1vw,42px);line-height:1.14;letter-spacing:-0.02em;color:#fff')}>Antes de la llamada de madrugada.</div>
            <div data-mline className="disp mani-line" style={css('position:absolute;left:0;right:0;top:50%;font-size:clamp(26px,3.1vw,42px);line-height:1.14;letter-spacing:-0.02em;color:#fff')}>Antes del diagnóstico difícil.</div>
            <div data-mline className="disp mani-line" style={css('position:absolute;left:0;right:0;top:50%;font-size:clamp(26px,3.1vw,42px);line-height:1.14;letter-spacing:-0.02em;color:#fff')}>Antes de la eterna pregunta:<br /><span style={css('color:var(--sp-mint)')}>«¿esto lo cubre?»</span></div>
            <div data-mline className="disp mani-line" style={css('position:absolute;left:0;right:0;top:50%;font-size:clamp(30px,3.7vw,50px);line-height:1.08;letter-spacing:-0.02em;color:#fff')}>Salud Protegida es<br />protección que <span style={css('color:var(--sp-teal)')}>se siente</span>.</div>
          </div>
        </div>
        <div style={css('position:absolute;bottom:34px;left:50%;transform:translateX(-50%);width:160px;height:3px;border-radius:var(--r-pill);background:rgba(255,255,255,0.14)')}><div data-mani-bar style={css('height:100%;width:0;border-radius:var(--r-pill);background:var(--sp-teal)')}></div></div>
      </div>
    </section>
  );
}
