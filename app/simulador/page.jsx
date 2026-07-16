import { css } from '../css';
import { BP } from '../basePath';
import { WHATSAPP_NUMBER, SP_PHONE_DISPLAY, SP_TEL, YEARS_CARING } from '../quote';
import Simulador from '../components/Simulador';

export const metadata = {
  title: 'Cotizá tu plan · Salud Protegida',
  description:
    'Simulá el precio de tu plan de salud en un minuto. Unas pocas preguntas y ves el precio antes de dejar cualquier dato. Sin compromiso.',
  alternates: { canonical: '/simulador/' },
};

export default function SimuladorPage() {
  const waDigits = (WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const waHref = waDigits ? ('https://wa.me/' + waDigits + '?text=' + encodeURIComponent('Hola! Quiero información sobre los planes de Salud Protegida.')) : '#';

  const objeciones = [
    { q: '¿Tiene costo?', a: 'No, simular y cotizar es gratis y sin compromiso.' },
    { q: '¿Me van a llamar sin parar?', a: 'No. Un asesor te contacta una vez, por el medio que elijas.' },
    { q: '¿Qué datos piden?', a: 'Solo nombre y WhatsApp para enviarte la cotización. Nada sensible.' },
  ];

  const trust = [
    { icon: 'M20.8 5.6a5 5 0 0 0-8-1.3L12 5l-.8-.7a5 5 0 1 0-7 7.1l7.8 7.6 7.8-7.6a5 5 0 0 0 1-6.4Z', text: '+' + YEARS_CARING + ' años cuidando familias' },
    { icon: 'M21 16.9v2.6a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 3.7 3h2.6a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.5 10.5a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z', text: 'Urgencias 24 h · ' + SP_PHONE_DISPLAY },
    { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z', text: 'Sin datos sensibles para ver tu precio' },
  ];

  return (
    <div className="body" style={css('color:#3D3D3D;background:#fff;min-height:100vh')}>

      {/* HEADER simplificado */}
      <header style={css('position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 24px;background:#003B71;box-shadow:0 1px 0 rgba(255,255,255,0.08)')}>
        <div style={css('display:flex;align-items:center;gap:18px;min-width:0')}>
          <a href={`${BP}/`} aria-label="Salud Protegida — Inicio" style={css('display:flex;align-items:center;flex:none')}>
            <img src={`${BP}/assets/brand/logo-sp-white.png`} alt="Salud Protegida" className="sim-logo" style={css('height:52px;display:block')} />
          </a>
          <a href={`${BP}/`} className="link-teal sim-back" style={css('display:inline-flex;align-items:center;gap:6px;color:rgba(255,255,255,0.72);font-size:13px;font-weight:600;white-space:nowrap')}>← Volver al inicio</a>
        </div>
        <a href={'tel:' + SP_TEL} aria-label={'Urgencias 24 h ' + SP_PHONE_DISPLAY} className="urg-pill" style={css('display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 15px;border-radius:12px;background:#E11900;color:#fff;font-size:13px;font-weight:800;white-space:nowrap;box-shadow:0 4px 14px rgba(225,25,0,0.28);flex:none')}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3a5.5 5.5 0 0 1 5.5 5.5M15 7a2.5 2.5 0 0 1 2.5 2.5" /><path d="M21 16.9v2.6a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 3.7 3h2.6a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.5 10.5a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" /></svg><span className="urg-word">Urgencias</span><span className="num-tnum">{SP_PHONE_DISPLAY}</span></a>
      </header>

      {/* HERO enfocado */}
      <section style={css('background:linear-gradient(180deg,#003B71 0%,#00294f 100%);color:#fff;padding:48px 24px 40px')}>
        <div style={css('max-width:720px;margin:0 auto;text-align:center')}>
          <div style={css('display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#80DDD8;margin-bottom:16px;border:1px solid rgba(128,221,216,.4);padding:6px 14px;border-radius:999px')}>Cotizá tu plan</div>
          <h1 className="disp" style={css('font-size:clamp(32px,5vw,50px);line-height:1.08;letter-spacing:-0.025em;margin:0 0 16px')}>Tu plan y tu precio, <span style={css('color:#00BCB4')}>en un minuto</span>.</h1>
          <p style={css('font-size:17px;line-height:1.6;color:#cfe0f0;max-width:520px;margin:0 auto')}>Unas pocas preguntas y ves el precio antes de dejar cualquier dato. Sin compromiso.</p>
        </div>
      </section>

      {/* SIMULADOR */}
      <section style={css('background:#003B71;padding:0 24px 64px')}>
        <Simulador />
      </section>

      {/* TRUST STRIP */}
      <section style={css('background:#fff;padding:40px 24px;border-bottom:1px solid #F0F0F0')}>
        <div className="two-col" style={css('max-width:960px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:20px')}>
          {trust.map((t, i) => (
            <div key={i} style={css('display:flex;align-items:center;gap:12px;justify-content:center;text-align:left')}>
              <span style={css('width:42px;height:42px;border-radius:12px;background:#E6F7F6;color:#007d77;display:flex;align-items:center;justify-content:center;flex:none')}><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg></span>
              <span style={css('font-size:14.5px;font-weight:700;color:#003B71;line-height:1.35')}>{t.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* MINI-OBJECIONES */}
      <section style={css('background:#F5F5F5;padding:64px 24px')}>
        <div style={css('max-width:960px;margin:0 auto')}>
          <div style={css('text-align:center;max-width:560px;margin:0 auto 36px')}>
            <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#007d77;margin-bottom:12px')}>Sin letra chica</div>
            <h2 className="disp" style={css('font-size:30px;font-weight:800;color:#003B71;line-height:1.16;letter-spacing:-0.02em;margin:0')}>Lo que te estarás preguntando</h2>
          </div>
          <div className="two-col" style={css('display:grid;grid-template-columns:repeat(3,1fr);gap:18px')}>
            {objeciones.map((o, i) => (
              <div key={i} style={css('background:#fff;border:1px solid #E8E8E8;border-radius:16px;padding:24px 22px;box-shadow:0 1px 3px rgba(0,0,0,0.05)')}>
                <div style={css('font-size:16px;font-weight:800;color:#003B71;line-height:1.3;margin-bottom:8px')}>{o.q}</div>
                <div style={css('font-size:14px;color:#6B6B6B;line-height:1.55')}>{o.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CIERRE WHATSAPP */}
      <section style={css('background:#003B71;padding:56px 24px')}>
        <div style={css('max-width:820px;margin:0 auto;background:#00BCB4;border-radius:22px;padding:40px 36px;display:flex;align-items:center;justify-content:space-between;gap:28px;flex-wrap:wrap')}>
          <div style={css('max-width:460px')}>
            <h2 className="disp" style={css('font-size:26px;font-weight:800;color:#fff;line-height:1.2;letter-spacing:-0.01em;margin:0 0 8px')}>¿Preferís hablarlo con alguien?</h2>
            <p style={css('font-size:16px;color:rgba(255,255,255,0.92);line-height:1.55;margin:0')}>Escribinos por WhatsApp y un asesor te acompaña, sin apuro y sin compromiso.</p>
          </div>
          <a href={waHref} target="_blank" rel="noopener" className="btn-white-teal" style={css('height:52px;padding:0 28px;border-radius:13px;background:#fff;color:#007d77;font-size:15px;font-weight:800;display:inline-flex;align-items:center;gap:9px;white-space:nowrap')}><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z" /></svg>Prefiero escribir por WhatsApp</a>
        </div>
      </section>

      {/* FOOTER minimal */}
      <footer style={css('background:#002A52;color:#fff;padding:36px 24px')}>
        <div style={css('max-width:960px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap')}>
          <div style={css('display:flex;align-items:center;gap:14px')}>
            <img src={`${BP}/assets/brand/logo-sp-white.png`} alt="Salud Protegida" loading="lazy" style={css('height:50px;display:block')} />
            <span style={css('font-size:13.5px;color:#9bb6d2')}>Salud Protegida · Asunción, Paraguay</span>
          </div>
          <a href={'tel:' + SP_TEL} className="foot-link num-tnum" style={css('font-size:14px;color:#cfe0f0;font-weight:700')}>Urgencias 24 h: {SP_PHONE_DISPLAY}</a>
        </div>
      </footer>

    </div>
  );
}
