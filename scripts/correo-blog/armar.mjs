// Arma el correo de una nota del blog: asunto, HTML con la marca y texto plano.
//
// POR QUÉ EXISTE (24/09/2026, pedido de Arturo): cada nota nueva del blog
// llega por correo, con el TEXTO COMPLETO adentro —no solo el link—, a Arturo
// y a los líderes de área. «La idea es que las personas que veo que pueden ser
// partes interesadas vean el valor del blog primero.» Lo envía
// correo_blog.py; este script solo arma. Manual: scripts/correo-blog/README.md.
//
// Lee la nota igual que la web: gray-matter + marked (las mismas dependencias
// del sitio) y las funciones puras de lib/blog-texto.mjs, así el correo no
// repite el copete ni calcula distinto el tiempo de lectura.
//
// El HTML está hecho para Outlook de escritorio, que es lo que usa el equipo
// de SP (medido en los encabezados X-Mailer de sus correos, 24/09/2026): tablas,
// estilos en línea, sin flexbox ni fuentes web. Las fuentes de marca se
// declaran igual; donde no están, cae a Segoe UI / Arial.
//
// Uso: node scripts/correo-blog/armar.mjs --salida <dir> <archivo.md> [...]
//   (archivos = nombres dentro de contenido/blog/publicados/)
// Escribe <dir>/<archivo>.json con { archivo, slug, asunto, preheader, html,
// texto, url } y <dir>/<archivo>.html para mirarlo en un navegador.

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { readingMinutes, stripDupIntro, formatFecha } from '../../lib/blog-texto.mjs';

const PUBLICADOS = path.join(process.cwd(), 'contenido', 'blog', 'publicados');
const SITIO = (process.env.SITIO || 'https://nelargon.github.io/sp-prototipo').replace(/\/$/, '');

// Color de la categoría para la etiqueta de arriba del título. Son los g1 de
// app/blog/Cover.jsx (los tonos -900 del manual: pasan AA como texto chico).
// Si Cover.jsx cambia un color, cambialo acá también.
const COLOR_CATEGORIA = {
  'Entendé tu plan': '#006B66',
  'Salud en Paraguay': '#002A52',
  'Prevención': '#2E5740',
  'Primeros años': '#4A3A6E',
  'Vivir más años': '#7A3D2E',
};

const F_DISPLAY = "'Nunito Sans','Segoe UI',Arial,sans-serif";
const F_TEXTO = "Inter,'Segoe UI',Arial,sans-serif";
const NAVY = '#003B71';
const TEXTO = '#3D3D3D';
const GRIS = '#6B6B6B';
const LINEA = '#E8E8E8';
const LINK = '#006B66';

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Estilos en línea para lo que produce marked. Outlook de escritorio ignora
// buena parte del <style> del <head>; lo que va en el atributo sí lo respeta.
const ESTILO = {
  p: `margin:0 0 16px;font-family:${F_TEXTO};font-size:16px;line-height:1.7;color:${TEXTO}`,
  h1: `margin:30px 0 10px;font-family:${F_DISPLAY};font-size:24px;line-height:1.25;font-weight:800;color:${NAVY}`,
  h2: `margin:30px 0 10px;font-family:${F_DISPLAY};font-size:22px;line-height:1.28;font-weight:800;color:${NAVY}`,
  h3: `margin:24px 0 8px;font-family:${F_DISPLAY};font-size:18px;line-height:1.3;font-weight:700;color:${NAVY}`,
  h4: `margin:20px 0 6px;font-family:${F_DISPLAY};font-size:16px;line-height:1.35;font-weight:700;color:${NAVY}`,
  ul: `margin:0 0 16px;padding-left:22px`,
  ol: `margin:0 0 16px;padding-left:22px`,
  li: `margin:0 0 6px;font-family:${F_TEXTO};font-size:16px;line-height:1.7;color:${TEXTO}`,
  blockquote: `margin:0 0 16px;padding:2px 0 2px 16px;border-left:3px solid #00BCB4`,
  strong: `font-weight:600;color:#1D1D1B`,
  a: `color:${LINK};text-decoration:underline`,
  hr: `border:0;border-top:1px solid ${LINEA};margin:24px 0`,
  table: `border-collapse:collapse;width:100%;margin:0 0 16px`,
  th: `padding:8px;border-bottom:2px solid ${LINEA};text-align:left;font-family:${F_TEXTO};font-size:14px;font-weight:600;color:#1D1D1B`,
  td: `padding:8px;border-bottom:1px solid ${LINEA};font-family:${F_TEXTO};font-size:14px;line-height:1.5;color:${TEXTO};font-variant-numeric:tabular-nums`,
  img: `max-width:100%;height:auto;border:0`,
  code: `font-family:Consolas,Menlo,monospace;font-size:14px`,
};

function conEstilos(html) {
  const tags = Object.keys(ESTILO).join('|');
  return html
    // Los links internos se escriben absolutos ("/simulador/"): en la web
    // reciben el basePath; en un correo necesitan el dominio entero.
    .replace(/href="\//g, `href="${SITIO}/`)
    .replace(new RegExp(`<(${tags})(\\s[^>]*)?>`, 'g'), (_, tag, attrs = '') => `<${tag} style="${ESTILO[tag]}"${attrs}>`);
}

// Texto plano: la alternativa que ven los clientes sin HTML y los filtros de
// spam. Es el markdown sin sus marcas.
function aTextoPlano(md) {
  return String(md)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `${t} (${u.startsWith('/') ? SITIO + u : u})`)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|\W)[*_]([^*_\n]+)[*_](?=\W|$)/g, '$1$2')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function armar(archivo) {
  const raw = fs.readFileSync(path.join(PUBLICADOS, archivo), 'utf8');
  const { data, content } = matter(raw);
  const slug = data.slug || archivo.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
  const titulo = data.title || slug;
  const intro = data.intro || data.description || '';
  const cuerpo = stripDupIntro(content, intro);
  const minutos = readingMinutes(content, data.minutes);
  const categoria = String(data.categoria || '').trim();
  const colorCat = COLOR_CATEGORIA[categoria] || COLOR_CATEGORIA['Entendé tu plan'];
  const fuentes = Array.isArray(data.sources) ? data.sources : [];
  const url = `${SITIO}/blog/${slug}/`;
  // Solo el botón lleva UTM: si algún día se prende la analítica
  // (app/Analytics.jsx), se sabrá cuántos llegaron a la web desde el correo.
  // No identifica a nadie.
  const urlBoton = `${url}?utm_source=correo-interno&utm_medium=email&utm_campaign=blog`;
  const byline = `Equipo Salud Protegida · ${formatFecha(data.date || '')} · Lectura de ${minutos} min`;
  const cuerpoHtml = conEstilos(marked.parse(cuerpo));

  const bloqueFuentes = fuentes.length === 0 ? '' : `
          <tr><td class="pad" style="padding:8px 40px 0">
            <div style="border-top:1px solid ${LINEA};padding-top:18px;font-family:${F_DISPLAY};font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:${GRIS};margin-bottom:8px">Fuentes</div>
            ${fuentes.map((f) => `<div style="margin:0 0 6px;font-family:${F_TEXTO};font-size:13px;line-height:1.5;word-break:break-all"><a href="${esc(f)}" style="color:${LINK};text-decoration:underline">${esc(f)}</a></div>`).join('\n            ')}
          </td></tr>`;

  // El preheader es la línea gris que la bandeja muestra junto al asunto.
  const preheader = data.description || intro;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${esc(titulo)}</title>
<!--[if mso]><style>body,table,td,div,p,a,li,h1,h2,h3,h4{font-family:'Segoe UI',Arial,sans-serif !important}</style><![endif]-->
<style>
  @media (max-width:620px) {
    .contenedor { width:100% !important; }
    .pad { padding-left:20px !important; padding-right:20px !important; }
    .titulo { font-size:26px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#F5F5F5">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${esc(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F5F5">
    <tr><td align="center" style="padding:24px 10px">
      <table role="presentation" class="contenedor" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#FFFFFF;border-radius:12px">
          <tr><td class="pad" style="padding:30px 40px 0">
            <a href="${SITIO}/blog/" style="text-decoration:none"><img src="cid:logo-sp" width="150" height="54" alt="Salud Protegida" style="display:block;border:0;width:150px;height:54px"></a>
          </td></tr>
          <tr><td class="pad" style="padding:26px 40px 0">
            <div style="font-family:${F_DISPLAY};font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:${colorCat};margin:0 0 10px">${esc(categoria || 'Blog')}</div>
            <h1 class="titulo" style="margin:0 0 14px;font-family:${F_DISPLAY};font-size:30px;line-height:1.15;font-weight:800;color:${NAVY}">${esc(titulo)}</h1>
            ${intro ? `<p style="margin:0 0 14px;font-family:${F_TEXTO};font-size:18px;line-height:1.6;color:${TEXTO}">${esc(intro)}</p>` : ''}
            <p style="margin:0;padding:0 0 22px;border-bottom:1px solid ${LINEA};font-family:${F_TEXTO};font-size:13px;line-height:1.5;color:${GRIS}">${esc(byline)}</p>
          </td></tr>
          <tr><td class="pad" style="padding:24px 40px 4px">
            ${cuerpoHtml}
          </td></tr>
          <tr><td class="pad" style="padding:8px 40px 26px">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="background:${NAVY};border-radius:8px">
                <a href="${esc(urlBoton)}" style="display:inline-block;padding:13px 24px;font-family:${F_DISPLAY};font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none">Leer en el blog</a>
              </td>
            </tr></table>
          </td></tr>${bloqueFuentes}
          <tr><td class="pad" style="padding:26px 40px 30px">
            <p style="margin:0;padding-top:18px;border-top:1px solid ${LINEA};font-family:${F_TEXTO};font-size:12px;line-height:1.6;color:${GRIS}">Este correo sale solo cada vez que se publica una nota nueva en el blog de Salud Protegida. Si preferís no recibirlo, respondé este correo y te sacamos de la lista.</p>
          </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

  const texto = [
    categoria ? categoria.toUpperCase() : 'BLOG',
    '',
    titulo,
    '',
    intro,
    '',
    byline,
    '',
    aTextoPlano(cuerpo),
    '',
    `Leer en el blog: ${url}`,
    ...(fuentes.length ? ['', 'Fuentes:', ...fuentes.map((f) => `- ${f}`)] : []),
    '',
    '--',
    'Este correo sale solo cada vez que se publica una nota nueva en el blog de Salud Protegida. Si preferís no recibirlo, respondé este correo y te sacamos de la lista.',
  ].join('\n');

  return {
    archivo,
    slug,
    asunto: `Nuevo en el blog: ${titulo}`,
    preheader,
    html,
    texto,
    url,
  };
}

// CLI
const args = process.argv.slice(2);
const iSalida = args.indexOf('--salida');
if (iSalida === -1 || !args[iSalida + 1]) {
  console.error('Uso: node scripts/correo-blog/armar.mjs --salida <dir> <archivo.md> [...]');
  process.exit(2);
}
const salida = args[iSalida + 1];
const archivos = args.filter((_, i) => i !== iSalida && i !== iSalida + 1);
if (archivos.length === 0) {
  console.error('Falta al menos un archivo de contenido/blog/publicados/.');
  process.exit(2);
}
fs.mkdirSync(salida, { recursive: true });
for (const archivo of archivos) {
  const correo = armar(path.basename(archivo));
  const base = path.join(salida, correo.archivo.replace(/\.md$/, ''));
  fs.writeFileSync(`${base}.json`, JSON.stringify(correo, null, 2));
  fs.writeFileSync(`${base}.html`, correo.html);
  console.log(`✓ armado: ${correo.archivo} → «${correo.asunto}»`);
}
