'use client';

import { useState } from 'react';
import { css } from '../css';
import Cover from './Cover';

/* ÍNDICE DEL BLOG CON JERARQUÍA EDITORIAL (6 ago 2026, referencia del usuario:
   la portada de Men's Health).

   Qué había antes: una grilla plana de 3 columnas donde las 22 notas pesaban
   exactamente lo mismo. Con 8 notas eso se lee; con 22 se lee como un depósito.
   El diagnóstico de la referencia es que Men's Health NO tiene una grilla:
   tiene JERARQUÍA — una nota manda (foto grande, título enorme), un riel de
   "lo último" al costado, y las demás abajo. Cada pieza pesa distinto porque
   no todas valen lo mismo.

   Cómo quedó:
   - PORTADA (sin filtro): la nota más reciente como destacada + riel "Lo
     último" con las 5 siguientes + "Todas las notas" abajo en grilla.
   - CON FILTRO: la portada se pliega y todo pasa a ser una grilla de esa
     sección. Un filtro que deja la destacada arriba se lee como un filtro roto.

   ⚠ LO QUE NO SE COPIÓ, A PROPÓSITO. Men's Health tiene "MOST READ" numerado
   del 1 al 5. Nosotros no tenemos ese dato: `track()` todavía no está conectado
   a ningún backend (ANEXO §2), así que cualquier "lo más leído" sería inventado
   — y este es el sitio que se construyó sobre no afirmar lo que no puede
   probar. Cuando la analítica esté conectada, el módulo entra solo.
   Tampoco hay tiempo relativo ("hace 2 horas"): el sitio es estático y se
   congelaría en el momento del build (ver formatFechaCorta en lib/blog.js). */

export default function BlogList({ notas, basePath }) {
  // Secciones = el kicker (ver la nota de taxonomía en lib/blog.js), ordenadas
  // por volumen: las que más se escriben van primero, no en orden alfabético.
  const counts = new Map();
  for (const n of notas) counts.set(n.tema, (counts.get(n.tema) || 0) + 1);
  const temas = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);

  const [active, setActive] = useState('Todas');
  const esPortada = active === 'Todas';
  const filtradas = esPortada ? notas : notas.filter((n) => n.tema === active);

  const destacada = esPortada ? notas[0] : null;
  const ultimas = esPortada ? notas.slice(1, 6) : [];
  const grilla = esPortada ? notas.slice(6) : filtradas;

  const meta = (n) => `${n.fechaFmt} · ${n.minutes} min de lectura`;

  return (
    <div>
      {/* PORTADA: la destacada manda, el riel acompaña */}
      {destacada && (
        <div className="blog-top" style={css('display:grid;grid-template-columns:1.62fr 1fr;gap:34px;align-items:start;margin-bottom:44px')}>
          <a href={`${basePath}/blog/${destacada.slug}/`} className="blog-hero" style={css('display:block;color:#fff')}>
            <Cover tema={destacada.tema} slug={destacada.slug} cover={destacada.cover} alt="" aspect="16 / 9" radius={18} eager />
            <div style={css('font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#80DDD8;margin:20px 0 10px')}>{destacada.tema}</div>
            <h2 className="disp" style={css('font-size:clamp(26px,3.2vw,38px);line-height:1.13;letter-spacing:-0.02em;margin:0 0 12px')}>{destacada.title}</h2>
            <p style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:16.5px;line-height:1.6;color:#B3C7DB;margin:0 0 12px;max-width:60ch')}>{destacada.description}</p>
            <div style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:13px;color:#8fa8c0')}>{meta(destacada)}</div>
          </a>

          <div>
            <div className="disp" style={css('font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#80DDD8;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.18);margin-bottom:6px')}>Lo último</div>
            {ultimas.map((n) => (
              <a key={n.slug} href={`${basePath}/blog/${n.slug}/`} className="blog-ult" style={css('display:grid;grid-template-columns:64px 1fr;gap:13px;align-items:start;padding:15px 0;border-bottom:1px solid rgba(255,255,255,0.10);color:#fff')}>
                <Cover tema={n.tema} slug={n.slug} cover={n.cover} alt="" aspect="1 / 1" radius={10} />
                <div>
                  <div className="disp blog-ult-t" style={css('font-size:15px;line-height:1.28;margin-bottom:5px')}>{n.title}</div>
                  <div style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:12px;color:#8fa8c0')}>{n.fechaCorta} · {n.minutes} min</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* SECCIONES: el kicker es el filtro (antes filtraba por un campo que 14
          de 22 notas no tenían, así que casi todo caía en "General") */}
      {temas.length > 1 && (
        <div role="group" aria-label="Filtrar notas por sección" style={css('display:flex;flex-wrap:wrap;gap:9px;align-items:center;padding-top:6px;border-top:1px solid rgba(255,255,255,0.14);margin-bottom:26px')}>
          <span className="disp" style={css('font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#80DDD8;margin:20px 10px 0 0')}>Secciones</span>
          {['Todas', ...temas].map((t) => {
            const on = t === active;
            const c = t === 'Todas' ? notas.length : counts.get(t);
            return (
              <button
                key={t}
                onClick={() => setActive(t)}
                aria-pressed={on}
                style={css('margin-top:20px;cursor:pointer;font-family:var(--font-display),sans-serif;font-weight:700;font-size:13.5px;padding:9px 16px;border-radius:999px;transition:background .2s,border-color .2s,color .2s;border:1px solid ' + (on ? '#00BCB4' : 'rgba(255,255,255,0.28)') + ';background:' + (on ? '#00BCB4' : 'transparent') + ';color:' + (on ? '#012a2a' : 'rgba(255,255,255,0.88)'))}
              >
                {t} <span style={css('opacity:.65;font-weight:600')}>{c}</span>
              </button>
            );
          })}
        </div>
      )}

      <h2 className="disp" style={css('font-size:15px;font-weight:800;letter-spacing:.02em;color:#fff;margin:0 0 16px')}>
        {esPortada ? 'Todas las notas' : active} <span style={css('color:#8fa8c0;font-weight:600')}>· {grilla.length}</span>
      </h2>

      <div className="blog-list" style={css('display:grid;grid-template-columns:repeat(3,1fr);gap:16px')}>
        {grilla.map((n) => (
          <a key={n.slug} href={`${basePath}/blog/${n.slug}/`} className="blog-card" style={css('display:flex;flex-direction:column;background:#fff;border-radius:18px;overflow:hidden;color:#1D1D1B;min-height:300px')}>
            <Cover tema={n.tema} slug={n.slug} cover={n.cover} alt="" />
            <div style={css('display:flex;flex-direction:column;flex:1;padding:22px 22px')}>
              <div style={css('font-size:11.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#007d77;margin-bottom:10px')}>{n.tema}</div>
              <div className="disp" style={css('font-size:19px;line-height:1.25;letter-spacing:-0.01em;color:#003B71;margin-bottom:9px')}>{n.title}</div>
              <div style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:13.5px;color:#3D3D3D;line-height:1.55;flex:1')}>{n.description}</div>
              <div style={css('display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:16px')}>
                <span style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:12px;color:#6B6B6B')}>{meta(n)}</span>
                <span style={css('display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:800;color:#007d77;white-space:nowrap')}>Leer <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
