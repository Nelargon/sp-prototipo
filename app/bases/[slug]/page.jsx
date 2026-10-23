import { css } from '../../css';
import Header from '../../Header';
import { BASES, getBases } from '../../../lib/bases';

/* Bases y condiciones de las promociones (23/10/2026, sp-interno#209, 2A).
   El texto es literal y vive en lib/bases.js, con su fuente: acá solo se le da
   forma. Es una página para leer: Inter en todo lo que es oración, Nunito Sans
   en los títulos, y nada que no sea de las bases (ni botones ni avisos). */

export const dynamicParams = false;

export function generateStaticParams() {
  return BASES.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const b = getBases(slug);
  if (!b) return {};
  return {
    title: `${b.titulo} · ${b.promo} · Salud Protegida`,
    description: `${b.titulo} de la ${b.promo} de Salud Protegida: beneficios, vigencia y condiciones.`,
    alternates: { canonical: `/bases/${b.slug}/` },
  };
}

const INTER = 'font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;';
const TEXTO = INTER + 'font-size:16.5px;line-height:1.65;color:var(--sp-text);';

function Lista({ items, sub }) {
  return (
    <ul style={css('margin:0 0 16px;padding-left:22px;' + (sub ? 'list-style:circle;margin:8px 0 0' : ''))}>
      {items.map((it) => {
        // Un ítem es texto o { t, sub }. Ojo: no preguntar `it.sub` a un texto:
        // String.prototype.sub existe (un método viejo de HTML) y es verdadero.
        const [t, subitems] = typeof it === 'string' ? [it, null] : [it.t, it.sub];
        return (
          <li key={t} style={css(TEXTO + 'margin-bottom:8px')}>
            {t}
            {subitems && <Lista items={subitems} sub />}
          </li>
        );
      })}
    </ul>
  );
}

export default async function Bases({ params }) {
  const { slug } = await params;
  const b = getBases(slug);
  return (
    <div className="body tactil" style={css('min-height:100vh;background:var(--sp-mint-tint);color:var(--sp-ink)')}>
      <Header variant="solid" />
      <main style={css('max-width:720px;margin:0 auto;padding:120px 20px 80px')}>
        <div className="disp" style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--sp-teal-900);margin-bottom:12px')}>{b.promo}</div>
        <h1 className="disp" style={css('font-size:clamp(30px,5vw,42px);line-height:1.15;color:var(--sp-navy);margin:0 0 18px;letter-spacing:-0.02em')}>{b.titulo}</h1>
        <p style={css(TEXTO + 'margin:0 0 28px')}>{b.intro}</p>
        {b.secciones.map((s) => (
          <section key={s.titulo} style={css('margin-bottom:26px')}>
            <h2 className="disp" style={css('font-size:20px;line-height:1.3;color:var(--sp-navy);margin:0 0 10px')}>{s.titulo}</h2>
            {s.bloques.map((bl, i) => bl.p
              ? <p key={i} style={css(TEXTO + 'margin:0 0 12px')}>{bl.p}</p>
              : <Lista key={i} items={bl.lista} />)}
          </section>
        ))}
      </main>
    </div>
  );
}
