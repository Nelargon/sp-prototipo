'use client';

import { useState } from 'react';
import { css } from '../css';
import Cover from './Cover';
import { CATEGORIAS } from '../../lib/categorias';

// Filtro por categoría del índice del blog (reunión departamentos, jul 2026:
// "separar los artículos en categorías, una de ellas prevención"). Cliente:
// el server (page.jsx) rinde TODAS las notas —así el SEO y el no-JS ven todo—
// y las pastillas filtran en el navegador. Recibe notas ya serializables
// (con fechaFmt preformateada) para no arrastrar `fs` ni el markdown al bundle.
export default function BlogList({ notas, basePath }) {
  // Los chips salen de la lista CANÓNICA (orden estable, definido por marca),
  // filtrada a las que efectivamente tienen notas. Antes se armaban con lo que
  // viniera en los datos, así que un typo en un frontmatter creaba una
  // categoría pública nueva sin que nadie lo notara. lib/blog.js ya normaliza,
  // esto es la segunda barrera.
  const cats = CATEGORIAS.filter((c) => notas.some((n) => n.categoria === c));
  const chips = ['Todas', ...cats];
  const [active, setActive] = useState('Todas');
  const shown = active === 'Todas' ? notas : notas.filter((n) => n.categoria === active);
  const count = (c) => (c === 'Todas' ? notas.length : notas.filter((n) => n.categoria === c).length);

  return (
    <div>
      {cats.length > 1 && (
        <div role="group" aria-label="Filtrar notas por categoría" style={css('display:flex;flex-wrap:wrap;gap:9px;margin-bottom:28px')}>
          {chips.map((c) => {
            const on = c === active;
            return (
              <button
                key={c}
                onClick={() => setActive(c)}
                aria-pressed={on}
                style={css('cursor:pointer;font-family:var(--font-display),sans-serif;font-weight:700;font-size:13.5px;padding:9px 16px;border-radius:999px;transition:background .2s,border-color .2s,color .2s;border:1px solid ' + (on ? '#00BCB4' : 'rgba(255,255,255,0.28)') + ';background:' + (on ? '#00BCB4' : 'transparent') + ';color:' + (on ? '#012a2a' : 'rgba(255,255,255,0.88)'))}
              >
                {c} <span style={css('opacity:.65;font-weight:600')}>{count(c)}</span>
              </button>
            );
          })}
        </div>
      )}
      <div className="blog-list" style={css('display:grid;grid-template-columns:repeat(3,1fr);gap:16px')}>
        {shown.map((n) => (
          <a key={n.slug} href={`${basePath}/blog/${n.slug}/`} className="blog-card" style={css('display:flex;flex-direction:column;background:#fff;border-radius:18px;overflow:hidden;color:#1D1D1B;min-height:300px')}>
            <Cover categoria={n.categoria} slug={n.slug} cover={n.cover} alt="" />
            <div style={css('display:flex;flex-direction:column;flex:1;padding:22px 22px')}>
              <div style={css('font-size:11.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#007d77;margin-bottom:10px')}>{n.kicker}</div>
              <div className="disp" style={css('font-size:19px;line-height:1.25;letter-spacing:-0.01em;color:#003B71;margin-bottom:9px')}>{n.title}</div>
              <div style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:13.5px;color:#3D3D3D;line-height:1.55;flex:1')}>{n.description}</div>
              <div style={css('display:flex;align-items:center;justify-content:space-between;margin-top:16px')}>
                <span style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:12px;color:#6B6B6B')}>{n.fechaFmt} · {n.minutes} min de lectura</span>
                <span style={css('display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:800;color:#007d77')}>Leer <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
