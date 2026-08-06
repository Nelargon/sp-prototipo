import Cover from './Cover';
import { css } from '../css';
import { BP } from '../basePath';

// El próximo click al final de una nota.
//
// Hasta el 06/08/2026 una nota terminaba en las fuentes y el lector quedaba
// sin salida: solo "volver al blog" o el CTA del simulador. Esta sección va
// ENTRE la nota y el CTA a propósito — primero más contenido, después la
// oferta. Es una marca que vende confianza, no una que empuja.
//
// Se apoya en las categorías: las relacionadas salen de la misma categoría
// (lib/blog.js → getRelacionadas), así que sin ese trabajo previo esto no
// tendría de dónde agarrarse.
export default function SeguiLeyendo({ notas }) {
  if (!notas || notas.length === 0) return null;

  return (
    <div style={css('max-width:680px;margin:0 auto;padding:0 24px 8px')}>
      <div style={css('border-top:1px solid #F0F0F0;padding-top:30px')}>
        <div style={css('font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#9A9A9A;margin-bottom:18px')}>
          Seguí leyendo
        </div>

        {/* Una columna por nota en escritorio; el CSS de .sl-grid las apila en
            móvil (globals.css), donde tres columnas de 200px serían ilegibles. */}
        <div className="sl-grid" style={css('display:grid;grid-template-columns:repeat(3,1fr);gap:20px')}>
          {notas.map((n) => (
            <a
              key={n.slug}
              href={`${BP}/blog/${n.slug}/`}
              style={css('display:block;color:inherit;text-decoration:none')}
            >
              <Cover categoria={n.categoria} slug={n.slug} cover={n.cover} dato={n.cover_dato} alt="" aspect="16 / 10" radius={12} />
              <div style={css('font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#007d77;margin:12px 0 6px')}>
                {n.categoria}
              </div>
              <div className="disp" style={css('font-size:16px;line-height:1.3;letter-spacing:-0.01em;color:#003B71;margin:0 0 6px')}>
                {n.title}
              </div>
              <div style={css('font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;font-size:12.5px;color:#6B6B6B')}>
                Lectura de {n.minutes} min
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
