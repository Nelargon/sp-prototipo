import { css } from '../../css';
import { BP } from '../../basePath';
import { WHATSAPP_NUMBER } from '../../quote';
import Header from '../../Header';
import PuntoRevisar from '../PuntoRevisar';
import datos from '../../../lib/guia-medica.json';
import { REDES, telHref, mapaHref, condicionTexto } from '../../../lib/red-medica';

/* Ficha de un prestador de la red (una por "ID prestador" de la planilla).
   Estática: se genera en el build, así cada médico tiene su página con
   dirección, teléfonos y en qué planes lo usás — una URL que se puede pasar
   por WhatsApp y que un buscador puede encontrar el día que se indexe. Un
   mismo prestador puede tener varias filas: otra sede u otra especialidad. */

const POR_ID = {};
for (const p of datos.prestadores) (POR_ID[p.id] = POR_ID[p.id] || []).push(p);

export function generateStaticParams() {
  return Object.keys(POR_ID).map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const filas = POR_ID[id] || [];
  const p = filas[0];
  if (!p) return {};
  const esp = [...new Set(filas.map((f) => f.e))].join(', ');
  return {
    title: `${p.n} — ${esp} en ${p.c} · Guía Médica Salud Protegida`,
    description: `${p.n}: ${esp}. ${p.d}, ${p.c}. Dirección, teléfono y planes de Salud Protegida con los que se atiende.`,
    alternates: { canonical: `/guia-medica/${id}/` },
  };
}

const INTER = 'font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;';

const fechaLarga = (dmy) => {
  const [d, m, y] = String(dmy || '').split('/');
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return d ? `${+d} de ${MESES[+m - 1]} de ${y}` : '';
};

export default async function Ficha({ params }) {
  const { id } = await params;
  const filas = POR_ID[id];
  const p = filas[0];
  const inst = p.t === 'i';
  const redes = [...new Set(filas.flatMap((f) => f.r))];
  // Si dos guías no coinciden, manda la más reciente (regla de la planilla):
  // esa es la fecha que vale para esta ficha.
  const aOrden = (dmy) => String(dmy).split('/').reverse().join('');
  const fechaDatos = redes.map((r) => (datos.meta.guias[REDES[r].guia] || {}).fecha).filter(Boolean).sort((a, b) => aOrden(b).localeCompare(aOrden(a)))[0];
  const waDigits = String(WHATSAPP_NUMBER).replace(/\D/g, '');
  const waAviso = 'https://wa.me/' + waDigits + '?text=' + encodeURIComponent(`Hola! Quiero avisar un dato de la Guía Médica que no coincide: ${p.n} (${id}).`);

  // schema.org — para cuando el sitio se indexe (ver ANEXO de la guía §5).
  const ld = {
    '@context': 'https://schema.org',
    '@type': inst ? 'MedicalOrganization' : 'Physician',
    name: p.n,
    ...(inst ? {} : { medicalSpecialty: [...new Set(filas.map((f) => f.e))] }),
    address: filas.map((f) => ({ '@type': 'PostalAddress', streetAddress: f.d, addressLocality: f.c, addressRegion: f.dp, addressCountry: 'PY' })),
    telephone: p.tel[0] || undefined,
  };

  return (
    <div className="body gm tactil" style={css('min-height:100vh;background:var(--gm-fondo);color:var(--sp-ink)')}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Header variant="solid" />
      <div style={css('max-width:760px;margin:0 auto;padding:100px 16px 70px')}>
        <nav aria-label="Migas de pan" style={css(INTER + 'font-size:13.5px;margin-bottom:18px')}>
          <a href={`${BP}/guia-medica/`} style={css('color:var(--sp-teal-deep);font-weight:600')}>← Guía Médica</a>
        </nav>

        <div className="sq" style={css('--sq:14px;background:#fff;border:1px solid var(--gm-linea);padding:24px 20px')}>
          <div className="disp" style={css('font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--sp-teal-900);margin-bottom:10px')}>{inst ? 'Sanatorio, laboratorio o centro' : 'Profesional'}{p.l ? ' · En Lister, centro propio' : ''}</div>
          <h1 className="disp" style={css('font-size:clamp(26px,4.4vw,34px);line-height:1.15;color:var(--sp-navy);margin:0 0 18px;letter-spacing:-0.01em')}>
            {p.n}{filas.some((f) => f.rv) ? <PuntoRevisar /> : null}
          </h1>

          {filas.map((f) => (
            <section key={f.f} style={css('border-top:1px solid var(--sp-line-2);padding:16px 0')}>
              <h2 className="disp" style={css('font-size:17px;color:var(--sp-teal-900);margin:0 0 8px')}>{f.e}</h2>
              <p style={css(INTER + 'font-size:15.5px;line-height:1.55;color:var(--sp-text);margin:0')}>
                {f.d}{f.b ? ` · ${f.b}` : ''}<br />{f.c}{f.dp && f.dp !== 'Capital' ? `, ${f.dp}` : ''}
              </p>
              {f.k && <p style={css(INTER + 'font-size:14px;line-height:1.5;color:var(--sp-muted);margin:6px 0 0')}>{condicionTexto(f.k)}</p>}
              {f.e === 'Odontología' && <p style={css(INTER + 'font-size:14px;line-height:1.5;color:var(--sp-muted);margin:6px 0 0')}>Antes de ir, preguntá a tu asesor qué cubre tu plan en odontología.</p>}
              <div style={css('display:flex;flex-wrap:wrap;gap:8px;margin-top:12px')}>
                {f.tel.map((t) => (
                  <a key={t} href={telHref(t)} className="disp sq" style={css('--sq:var(--r-xs);height:42px;padding:0 16px;background:var(--sp-teal-deep);color:#fff;font-size:14.5px;font-weight:700;display:inline-flex;align-items:center')}>
                    Llamar <span className="num-tnum" style={css('margin-left:6px')}>{t}</span>
                  </a>
                ))}
                {f.d && <a href={mapaHref(f)} target="_blank" rel="noopener" className="disp sq" style={css('--sq:var(--r-xs);height:42px;padding:0 16px;border:1.5px solid var(--sp-mint-line-strong);color:var(--sp-navy);font-size:14.5px;font-weight:700;display:inline-flex;align-items:center')}>Cómo llegar</a>}
              </div>
            </section>
          ))}

          <section style={css('border-top:1px solid var(--sp-line-2);padding-top:16px')}>
            <h2 className="disp" style={css('font-size:17px;color:var(--sp-navy);margin:0 0 10px')}>Lo usás con estos planes</h2>
            <ul style={css(INTER + 'margin:0;padding:0;list-style:none;display:grid;gap:7px')}>
              {redes.map((r) => (
                <li key={r} style={css('display:flex;gap:9px;align-items:flex-start;font-size:15px;line-height:1.45;color:var(--sp-text)')}>
                  <span aria-hidden="true" style={css('flex:none;width:8px;height:8px;border-radius:var(--r-pill);background:var(--sp-teal);margin-top:7px')} />{REDES[r].largo}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div style={css(INTER + 'margin-top:20px;font-size:13.5px;line-height:1.6;color:var(--sp-muted)')}>
          <p style={css('margin:0 0 8px')}>Antes de ir, llamá para pedir tu turno y confirmá que atiende con tu plan. ¿Algún dato no coincide? <a href={waAviso} style={css('color:var(--sp-teal-deep);font-weight:700')}>Avisanos por WhatsApp</a> y lo corregimos.</p>
          {fechaDatos && <p style={css('margin:0')}>Datos de la Guía Médica al {fechaLarga(fechaDatos)}.</p>}
          <p style={css('margin:14px 0 0')}>¿Todavía no tenés plan? <a href={`${BP}/simulador/`} style={css('color:var(--sp-teal-deep);font-weight:700')}>Simulá el tuyo en un minuto</a>.</p>
        </div>
      </div>
    </div>
  );
}
