'use client';

import { useState, useEffect } from 'react';
import { css } from './css';
import { BP } from './basePath';
import { WHATSAPP_NUMBER, SP_TEL, SP_PHONE_DISPLAY } from './quote';
import { track } from './track';

// Header compartido del ecosistema (migración del header unificado, jul 2026).
// Reemplaza el "logo + volver" que reimplementaba cada módulo por el nav real,
// con los mega-menús fluidos aprobados en la home. Autocontenido: maneja su
// propio estado de menú móvil y — solo en variant="hero" — el toggle
// transparente→sólido al scrollear. El color se adapta al fondo del módulo:
//   - variant="hero": home. Vidrio oscuro sobre el hero → blanco sólido al
//     scrollear (usa la clase .solid como el nav original).
//   - variant="dark" (default): sub-páginas de fondo navy. Vidrio oscuro
//     siempre (links blancos), sin toggle.
//   - variant="solid": páginas de lectura de fondo claro (una nota del blog).
//     El look sólido/claro fijo (links oscuros, logo navy), sin toggle — sobre
//     blanco el vidrio oscuro dejaría el texto ilegible.
// Los anchors apuntan a la home (`${BP}/#…`) para funcionar desde cualquier
// módulo; en la propia home el navegador hace scroll in-page sin recargar.
const GUIA = `${BP}/guia/guia_home.html`;

const chev = (
  <svg className="navmenu-chev" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);
const linkStyle = css('color:var(--nl,rgba(255,255,255,0.9));font-size:14px;font-weight:500;transition:color .3s');
const menuTriggerStyle = css('color:var(--nl,rgba(255,255,255,0.9));font-size:14px;font-weight:500;transition:color .3s;display:inline-flex;align-items:center;gap:5px');

function Item({ href, onClick, t, s }) {
  return (
    <a href={href} onClick={onClick} className="navmenu-item"><span className="navmenu-t">{t}</span><span className="navmenu-s">{s}</span></a>
  );
}

export default function Header({ variant = 'dark' }) {
  const [open, setOpen] = useState(false);

  // Toggle sólido al scrollear (solo hero).
  useEffect(() => {
    if (variant !== 'hero') return;
    const nav = document.querySelector('[data-nav]');
    if (!nav) return;
    const onScroll = () => {
      const y = (document.scrollingElement || document.documentElement).scrollTop || 0;
      if (y > 70) nav.classList.add('solid'); else nav.classList.remove('solid');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [variant]);

  // Bloquear el scroll del fondo mientras el overlay móvil está abierto.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const close = () => setOpen(false);
  const tGuia = (via) => track('guia_handoff', { q: '', via });

  return (
    <>
      <nav data-nav className={[variant === 'solid' ? 'solid' : '', open ? 'menu-open' : ''].filter(Boolean).join(' ') || undefined} style={css('position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 40px')}>
        <div className="nav-logo" style={css('position:relative;display:flex;align-items:center')}>
          <a href={`${BP}/`} aria-label="Ir al inicio de Salud Protegida" style={css('display:block;position:relative')}>
            <img src={`${BP}/assets/brand/logo-sp-color.png`} alt="Salud Protegida" className="nlogo-c" style={css('height:56px;display:block;position:relative;z-index:1')} />
            <img src={`${BP}/assets/brand/logo-sp-white.png`} alt="" className="nlogo-w" style={css('height:56px;position:absolute;left:0;top:0;z-index:2;transition:opacity .3s')} />
          </a>
        </div>
        <div style={css('display:flex;align-items:center;gap:16px')}>
          <a href={'tel:' + SP_TEL} onClick={() => track('click_urgencias', { origen: 'header' })} aria-label={'Urgencias 24 h ' + SP_PHONE_DISPLAY} className="urg-pill" style={css('display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 15px;border-radius:12px;background:#E11900;color:#fff;font-size:13px;font-weight:800;white-space:nowrap;box-shadow:0 4px 14px rgba(225,25,0,0.28);flex:none')}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3a5.5 5.5 0 0 1 5.5 5.5M15 7a2.5 2.5 0 0 1 2.5 2.5" /><path d="M21 16.9v2.6a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 3.7 3h2.6a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.5 10.5a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" /></svg><span className="urg-word">Urgencias</span><span className="num-tnum">{SP_PHONE_DISPLAY}</span></a>
          <div className="nav-links-desktop" style={css('display:flex;align-items:center;gap:26px')}>
            <div className="navmenu-wrap">
              <a href={`${BP}/#cartilla`} className="nav-link nav-link-menu" style={menuTriggerStyle}>Cobertura {chev}</a>
              <div className="navmenu"><div className="navmenu-card">
                <Item href={`${BP}/#cartilla`} t="Buscá qué cubre tu plan" s="Escribí un estudio o consulta y mirá qué cubre cada plan" />
                <Item href={`${BP}/#bolsillo`} t="Qué pagás de tu bolsillo" s="Copago, precio de convenio y lo que no cubre ningún plan" />
                <Item href={`${BP}/#faq`} t="Preguntas frecuentes" s="Carencias, preexistencias, cambios de plan y más" />
              </div></div>
            </div>
            <div className="navmenu-wrap">
              <a href={`${BP}/#comparar`} className="nav-link nav-link-menu" style={menuTriggerStyle}>Planes {chev}</a>
              <div className="navmenu"><div className="navmenu-card">
                <Item href={`${BP}/#comparar`} t="Bronze, Silver y Gold" s="Compará qué gana cada nivel y cuánto sale" />
                <Item href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'nav_menu' })} t="Plan Vital · 65 años o más" s="Pensado para tus padres o un adulto mayor" />
                <Item href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'nav_menu' })} t="Simulá tu precio" s="Unas preguntas y ves el precio, en 1 minuto" />
              </div></div>
            </div>
            <a href={`${BP}/blog/`} className="nav-link" style={linkStyle}>Blog</a>
            <div className="navmenu-wrap">
              <a href={`${BP}/mi-sp/`} onClick={() => track('puerta_home', { puerta: 'ya_soy_sp', origen: 'nav' })} className="nav-link nav-link-menu" style={menuTriggerStyle}>Mi SP {chev}</a>
              <div className="navmenu navmenu-right"><div className="navmenu-card">
                <Item href={`${BP}/agendar/`} onClick={() => track('cta_agendar', { origen: 'nav_misp' })} t="Agendar un turno" s="Pedí tu turno en Lister — directo, sin login" />
                <Item href={`${GUIA}#mi-red`} onClick={() => track('puerta_home', { puerta: 'ver_red', origen: 'nav_misp' })} t="Ver mi red" s="Con tu cédula, mirá qué entra en tu plan" />
                <Item href={`${BP}/mi-sp/`} onClick={() => track('puerta_home', { puerta: 'ya_soy_sp', origen: 'nav_misp' })} t="Ir a Mi SP" s="Tu espacio: credencial, turnos y más" />
              </div></div>
            </div>
            <a href={GUIA} onClick={() => tGuia('nav')} className="nav-guia-cta" style={css('height:40px;padding:0 18px;border-radius:12px;font-size:14px;font-weight:700;display:inline-flex;align-items:center;gap:7px;white-space:nowrap')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>Guía Médica</a>
            <a href={`${BP}/simulador/`} onClick={() => track('cta_simulador', { origen: 'nav' })} className="btn-teal" style={css('height:40px;padding:0 20px;border-radius:12px;background:#007d77;color:#fff;font-size:14px;font-weight:700;display:inline-flex;align-items:center;gap:7px;white-space:nowrap')}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" /></svg>Simulá tu plan</a>
          </div>
          <button className="nav-burger" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} style={css('display:none;width:40px;height:40px;border-radius:10px;border:none;background:rgba(255,255,255,0.16);color:#fff;align-items:center;justify-content:center;cursor:pointer;flex:none')}>
            {open
              ? <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>}
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-menu" className="menu-overlay" role="dialog" aria-modal="true" aria-label="Menú">
          <nav style={css('display:flex;flex-direction:column')}>
            <a href={GUIA} onClick={() => { tGuia('menu_movil'); close(); }} className="menu-item" style={{ animationDelay: '30ms' }}>Guía Médica</a>
            <a href={`${BP}/#cartilla`} onClick={close} className="menu-item" style={{ animationDelay: '70ms' }}>Cobertura</a>
            <a href={`${BP}/#comparar`} onClick={close} className="menu-item" style={{ animationDelay: '110ms' }}>Planes</a>
            <a href={`${BP}/#faq`} onClick={close} className="menu-item" style={{ animationDelay: '150ms' }}>Preguntas</a>
            <a href={`${BP}/blog/`} onClick={close} className="menu-item" style={{ animationDelay: '190ms' }}>Blog</a>
            <a href={`${BP}/historia/`} onClick={close} className="menu-item" style={{ animationDelay: '230ms' }}>Historia</a>
            <a href={`${BP}/mi-sp/`} onClick={() => { track('puerta_home', { puerta: 'ya_soy_sp', origen: 'menu' }); close(); }} className="menu-item" style={{ animationDelay: '270ms', marginTop: '14px' }}>Mi SP →</a>
            <a href={`${BP}/agendar/`} onClick={() => { track('cta_agendar', { origen: 'menu_movil' }); close(); }} className="menu-item" style={{ animationDelay: '290ms' }}>Agendar turno →</a>
            <a href={`${BP}/simulador/`} onClick={() => { track('cta_simulador', { origen: 'menu_movil' }); close(); }} className="menu-item menu-item-cta" style={{ animationDelay: '310ms' }}>Simulá tu plan →</a>
          </nav>
        </div>
      )}
    </>
  );
}
