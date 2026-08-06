'use client';

import { css } from '../css';
import Header from '../Header';
import { BP } from '../basePath';
import { WHATSAPP_NUMBER, SP_TEL } from '../quote';
import { track } from '../track';

// Lo que ya funciona hoy vs. lo que está en camino: el portal no finge.
const PROXIMAMENTE = [
  { icon: 'M4 6h16v12H4zM8 6v12', title: 'Mi plan y cobertura', body: 'Qué cubre tu plan, tus copagos y tus topes — en tu idioma, siempre a mano.' },
  { icon: 'M3 8h18v11H3zM8 8V5h8v3M12 11v5M9.5 13.5h5', title: 'Credencial digital', body: 'Tu credencial en el teléfono, para vos y tu familia. Sin plastiquito que se pierde.' },
  { icon: 'M8 2v4M16 2v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z', title: 'Mis turnos', body: 'Agendá consultas y estudios desde acá, empezando por el Centro Médico Lister.' },
  { icon: 'M12 2v20M17 7H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H6', title: 'Pagos y facturas', body: 'Tus cuotas, comprobantes y medios de pago, sin llamar a nadie.' },
];

export default function MiSP() {
  const waDigits = (WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const waHref = waDigits ? ('https://wa.me/' + waDigits + '?text=' + encodeURIComponent('Hola! Soy cliente de Salud Protegida y tengo una consulta.')) : '#';
  const go = (accion) => track('mi_sp_accion', { accion });

  return (
    <div className="body" style={css('min-height:100vh;background:var(--sp-navy-deep);color:#fff;display:flex;flex-direction:column')}>
      <Header variant="dark" />

      <div style={css('flex:1;padding:34px 24px 80px')}>
        <div style={css('max-width:860px;margin:0 auto')}>
          <div style={css('display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--sp-mint);border:1px solid rgba(128,221,216,.4);padding:7px 14px;border-radius:var(--r-pill);margin-bottom:20px')}>Mi SP · tu espacio</div>
          <h1 className="disp" style={css('font-size:clamp(32px,4.6vw,48px);line-height:1.08;letter-spacing:-0.02em;margin:0 0 14px')}>Hola. Qué bueno<br />tenerte <span style={css('color:var(--sp-teal)')}>de vuelta</span>.</h1>
          <p style={css('font-size:17px;line-height:1.65;color:var(--sp-blue-soft);max-width:560px;margin:0 0 34px')}>Estamos construyendo tu portal. Esto es lo que ya podés hacer hoy — y lo que viene en camino.</p>

          {/* Lo que ya funciona */}
          <div className="misp-grid" style={css('display:grid;grid-template-columns:1.4fr 1fr;gap:16px;margin-bottom:40px')}>
            <a href={`${BP}/guia/guia_home.html#mi-red`} onClick={() => go('ver_red')} style={css('display:flex;flex-direction:column;justify-content:space-between;gap:18px;background:#fff;color:var(--sp-navy);border-radius:var(--r-lg);padding:26px 24px;min-height:190px')}>
              <div>
                <div style={css('width:44px;height:44px;border-radius:var(--r-sm);background:var(--sp-mint-bg);color:var(--sp-teal-deep);display:flex;align-items:center;justify-content:center;margin-bottom:14px')}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg></div>
                <div style={css('font-size:19px;font-weight:800;margin-bottom:5px')}>Ver mi red de atención</div>
                <div style={css('font-size:14px;color:var(--sp-text);line-height:1.55')}>Con tu cédula y fecha de nacimiento, mirá los sanatorios, médicos y farmacias que entran en tu plan.</div>
              </div>
              <span style={css('display:inline-flex;align-items:center;gap:7px;font-size:14.5px;font-weight:800;color:var(--sp-teal-deep)')}>Entrar con mi cédula <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
            </a>
            <div style={css('display:flex;flex-direction:column;gap:16px')}>
              <a href={waHref} onClick={() => go('whatsapp')} target="_blank" rel="noopener" style={css('flex:1;display:flex;align-items:center;gap:13px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.16);border-radius:18px;padding:18px 20px;color:#fff')}>
                <span style={css('width:40px;height:40px;border-radius:var(--r-sm);background:rgba(0,188,180,0.2);color:var(--sp-teal);display:flex;align-items:center;justify-content:center;flex:none')}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z" /></svg></span>
                <span><span style={css('display:block;font-size:15px;font-weight:800')}>Escribinos</span><span style={css('display:block;font-size:12.5px;color:var(--sp-blue-meta)')}>Consultas por WhatsApp</span></span>
              </a>
              <a href={`tel:${SP_TEL}`} onClick={() => go('urgencias')} style={css('flex:1;display:flex;align-items:center;gap:13px;background:rgba(244,67,54,0.14);border:1px solid rgba(244,67,54,0.35);border-radius:18px;padding:18px 20px;color:#fff')}>
                <span style={css('width:40px;height:40px;border-radius:var(--r-sm);background:rgba(244,67,54,0.28);color:#ffb4ae;display:flex;align-items:center;justify-content:center;flex:none')}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.5 2.8.7a2 2 0 0 1 1.7 2Z" /></svg></span>
                <span><span style={css('display:block;font-size:15px;font-weight:800')}>Urgencias 24 h</span><span style={css('display:block;font-size:12.5px;color:#e8b8be')}>(021) 319 0000</span></span>
              </a>
            </div>
          </div>

          {/* Lo que viene */}
          <div style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--sp-mint);margin-bottom:14px')}>En camino</div>
          <div className="misp-soon" style={css('display:grid;grid-template-columns:repeat(4,1fr);gap:14px')}>
            {PROXIMAMENTE.map((t, i) => (
              <div key={i} style={css('background:rgba(255,255,255,0.05);border:1px dashed rgba(255,255,255,0.22);border-radius:var(--r-md);padding:20px 18px')}>
                <div style={css('width:38px;height:38px;border-radius:var(--r-xs);background:rgba(255,255,255,0.08);color:var(--sp-mint);display:flex;align-items:center;justify-content:center;margin-bottom:12px')}><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg></div>
                <div style={css('font-size:14.5px;font-weight:800;color:#fff;margin-bottom:5px')}>{t.title}</div>
                <div style={css('font-size:12.5px;color:var(--sp-blue-meta);line-height:1.5')}>{t.body}</div>
              </div>
            ))}
          </div>

          <p style={css('font-size:13px;color:var(--sp-blue-meta);line-height:1.6;margin:30px 0 0;max-width:560px')}>¿Todavía no sos parte de Salud Protegida? <a href={`${BP}/simulador/`} style={css('color:var(--sp-teal);font-weight:700;text-decoration:underline;text-underline-offset:3px')}>Descubrí tu plan ideal en un minuto</a>.</p>
        </div>
      </div>
    </div>
  );
}
