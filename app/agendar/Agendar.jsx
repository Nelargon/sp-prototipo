'use client';

import { useState } from 'react';
import { css } from '../css';
import { BP } from '../basePath';
import { WHATSAPP_NUMBER, SP_TEL, SP_PHONE_DISPLAY } from '../quote';
import { track } from '../track';

// Espacio directo de agendamiento (pedido del usuario, jul 2026): pedir un
// turno NO debe estar enterrado detrás del login de Mi SP. Regla de IA:
// acciones de alta intención (agendar, simular, urgencias) van directas, sin
// login; lo personal (mis turnos, credencial) queda detrás del login.
// Hoy es un handoff a la recepción del Centro Médico Lister por WhatsApp (la
// persona llega "caliente", con todo cargado); el día que exista el sistema
// real de turnos se enchufa detrás sin mover la experiencia. Empezamos por
// Lister (el centro propio) — HANDOFF pendiente #14. track() nunca lleva
// nombre/teléfono (regla del proyecto).

const CENTROS = ['Centro Médico Lister', 'Otro centro de la red'];
const ESPECIALIDADES = ['Clínica médica', 'Pediatría', 'Laboratorio', 'Ginecología', 'Cardiología', 'Ecografía'];
const CUANDO = ['Cuanto antes', 'Esta semana', 'Soy flexible'];
const HORARIO = ['Mañana', 'Tarde', 'Cualquiera'];

export default function Agendar() {
  const [centro, setCentro] = useState('Centro Médico Lister');
  const [esp, setEsp] = useState('');
  const [cuando, setCuando] = useState('');
  const [horario, setHorario] = useState('');
  const [nombre, setNombre] = useState('');

  const waDigits = (WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const listo = esp.trim().length > 1 && nombre.trim().length > 1;

  const pedir = () => {
    if (!listo) return;
    const msg =
      'Hola! Quiero agendar un turno.\n' +
      '• Centro: ' + centro + '\n' +
      '• Necesito: ' + esp.trim() + '\n' +
      '• Cuándo me queda cómodo: ' + (cuando || 'a coordinar') + (horario ? ' · ' + horario : '') + '\n' +
      '• Mi nombre: ' + nombre.trim() + '\n' +
      '¿Me confirman día y hora? ¡Gracias!';
    // Sin PII en el evento: solo las opciones elegidas.
    track('agendar_envio', { centro, cuando: cuando || '', horario: horario || '', esp_dada: true, via: 'whatsapp' });
    window.open('https://wa.me/' + waDigits + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  };

  const chip = (label, active, onClick) =>
    css('cursor:pointer;font-family:var(--font-display),sans-serif;font-weight:700;font-size:13.5px;padding:10px 15px;border-radius:12px;transition:background .2s,border-color .2s,color .2s;border:1px solid ' +
      (active ? '#007d77' : '#d7e2ea') + ';background:' + (active ? '#007d77' : '#fff') + ';color:' + (active ? '#fff' : '#1D1D1B'));

  const inputStyle = css('width:100%;height:50px;border:1.5px solid #d7e2ea;border-radius:13px;padding:0 16px;font-size:16px;color:#1D1D1B;background:#fff;outline:none;font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif');
  const labelStyle = css('font-size:13.5px;font-weight:800;color:#003B71;margin-bottom:10px;display:block');
  const rowStyle = css('display:flex;flex-wrap:wrap;gap:9px');

  return (
    <div className="body" style={css('min-height:100vh;background:#002A52;color:#fff;display:flex;flex-direction:column')}>
      <div style={css('display:flex;align-items:center;justify-content:space-between;padding:20px 40px')}>
        <a href={`${BP}/`} aria-label="Ir al inicio de Salud Protegida">
          <img src={`${BP}/assets/brand/logo-sp-white.png`} alt="Salud Protegida" style={css('height:52px;display:block')} />
        </a>
        <a href={`${BP}/`} style={css('color:rgba(255,255,255,0.85);font-size:14px;font-weight:600;display:inline-flex;align-items:center;gap:7px')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>Volver al inicio</a>
      </div>

      <div style={css('flex:1;padding:34px 24px 80px')}>
        <div style={css('max-width:680px;margin:0 auto')}>
          <div style={css('display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#80DDD8;border:1px solid rgba(128,221,216,.4);padding:7px 14px;border-radius:999px;margin-bottom:20px')}>Agendá tu turno</div>
          <h1 className="disp" style={css('font-size:clamp(30px,4.4vw,44px);line-height:1.1;letter-spacing:-0.02em;margin:0 0 14px')}>Pedí tu turno, <span style={css('color:#00BCB4')}>sin vueltas</span>.</h1>
          <p style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:17px;line-height:1.65;color:#B3C7DB;max-width:540px;margin:0 0 30px')}>Elegí qué necesitás y cuándo te queda cómodo. Un asesor te confirma día y hora — <b style={css('color:#e8f2fb')}>sin login ni vueltas</b>. Empezamos por el Centro Médico Lister, nuestro centro propio.</p>

          <div style={css('background:#fff;color:#1D1D1B;border-radius:22px;padding:28px 26px;box-shadow:0 20px 50px rgba(0,15,35,0.28)')}>
            {/* Centro */}
            <div style={css('margin-bottom:22px')}>
              <label style={labelStyle}>¿Dónde querés atenderte?</label>
              <div style={rowStyle}>
                {CENTROS.map((c) => <button key={c} type="button" onClick={() => setCentro(c)} style={chip(c, centro === c)}>{c}</button>)}
              </div>
              {centro === 'Otro centro de la red' && <div style={css('font-family:var(--font-inter),sans-serif;font-size:12.5px;color:#6B6B6B;margin-top:9px')}>Perfecto — nuestro asesor te ayuda a coordinar el turno en el prestador de la red que prefieras.</div>}
            </div>

            {/* Especialidad */}
            <div style={css('margin-bottom:22px')}>
              <label style={labelStyle}>¿Qué necesitás?</label>
              <input type="text" value={esp} onChange={(e) => setEsp(e.target.value)} placeholder="Ej: pediatría, un control, laboratorio…" aria-label="Especialidad o motivo del turno" style={inputStyle} />
              <div style={{ ...rowStyle, marginTop: '10px' }}>
                {ESPECIALIDADES.map((s) => <button key={s} type="button" onClick={() => setEsp(s)} style={chip(s, esp === s)}>{s}</button>)}
              </div>
            </div>

            {/* Cuándo */}
            <div style={css('margin-bottom:22px')}>
              <label style={labelStyle}>¿Cuándo te queda cómodo?</label>
              <div style={rowStyle}>
                {CUANDO.map((c) => <button key={c} type="button" onClick={() => setCuando(c)} style={chip(c, cuando === c)}>{c}</button>)}
              </div>
              <div style={{ ...rowStyle, marginTop: '9px' }}>
                {HORARIO.map((h) => <button key={h} type="button" onClick={() => setHorario(h)} style={chip(h, horario === h)}>{h}</button>)}
              </div>
            </div>

            {/* Nombre */}
            <div style={css('margin-bottom:24px')}>
              <label style={labelStyle}>Tu nombre</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Cómo te llamás" aria-label="Tu nombre" style={inputStyle} />
            </div>

            {/* Deshabilitado: antes era blanco sobre #c8d4dc (1.51:1 medido) — el
                rótulo casi desaparecía y se leía "roto", no "todavía no". Gris
                oscuro sobre gris claro dice deshabilitado Y se lee. */}
            <button type="button" onClick={pedir} disabled={!listo} style={css('width:100%;height:56px;border:none;border-radius:15px;background:' + (listo ? '#007d77' : '#E4EAEF') + ';color:' + (listo ? '#fff' : '#4A5A66') + ';font-size:16px;font-weight:800;cursor:' + (listo ? 'pointer' : 'not-allowed') + ';display:inline-flex;align-items:center;justify-content:center;gap:9px')}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z" /></svg>
              Pedir turno por WhatsApp
            </button>
            <div style={css('font-family:var(--font-inter),sans-serif;font-size:12.5px;color:#6B6B6B;line-height:1.55;text-align:center;margin-top:12px')}>Te abrimos WhatsApp con tu pedido ya escrito. Un asesor confirma día y hora. {!listo && <span style={css('color:#6B6B6B')}>— completá qué necesitás y tu nombre.</span>}</div>
          </div>

          {/* Alternativa: llamar */}
          <div style={css('display:flex;align-items:center;gap:10px;margin-top:22px;font-family:var(--font-inter),sans-serif;font-size:14.5px;color:#B3C7DB')}>
            <span>¿Preferís hablar?</span>
            <a href={`tel:${SP_TEL}`} onClick={() => track('agendar_llamar', { via: 'tel' })} style={css('color:#80DDD8;font-weight:700')}>Llamanos al {SP_PHONE_DISPLAY}</a>
          </div>

          <p style={css('font-family:var(--font-inter),sans-serif;font-size:13px;color:#7fa6cc;line-height:1.6;margin:26px 0 0;max-width:540px')}>¿Ya sos de Salud Protegida y querés ver tus turnos y tu red? <a href={`${BP}/mi-sp/`} style={css('color:#00BCB4;font-weight:700;text-decoration:underline;text-underline-offset:3px')}>Entrá a Mi SP</a>.</p>
        </div>
      </div>
    </div>
  );
}
