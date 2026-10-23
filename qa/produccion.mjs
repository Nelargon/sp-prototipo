#!/usr/bin/env node
// ¿El build de la v1 está listo para el dominio de SP? (23/10/2026,
// sp-interno#103). Arturo: «Todavía no podemos sacar lo público. Tenemos que
// preparar el espacio». Esto controla el espacio, sin publicar nada.
//
// Se corre sobre un build hecho como en producción:
//   NEXT_PUBLIC_EDICION=lanzamiento NEXT_PUBLIC_BASE_PATH= \
//   SITE_URL=https://saludprotegida.com.py npm run build
//   node qa/produccion.mjs out https://saludprotegida.com.py
//
// Mira lo que en el build de GitHub Pages no se ve y el día del cambio de
// dominio sí:
//  1. ninguna dirección con el prefijo /sp-prototipo (es de GitHub Pages);
//  2. el sitemap, los canonical y el og:url, todos en el dominio de SP;
//  3. el botón «Revisión» afuera (sp-interno#192, A: solo en el prototipo);
//  4. out/_redirects con las reglas de scripts/redirecciones-lista.mjs, cada
//     destino publicado o en un subdominio de SP (la reserva de turnos, que se
//     muda: sp-interno#209, 1A), y ninguna de las direcciones que esperan a
//     Arturo (NO_SE_REDIRIGEN; vacía desde el 23/10/2026);
//  5. el 404 propio;
//  6. la indexación apagada mientras NEXT_PUBLIC_INDEXABLE no diga «true»:
//     lo público espera la decisión de Arturo.
// Antes de mirar el build se prueba a sí mismo con casos que tienen que
// marcar y casos que no (CLAUDE.md, BITACORA cap. 89).

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { reglas, NO_SE_REDIRIGEN, SUBDOMINIO_SP } from '../scripts/redirecciones-lista.mjs';

// Lo que no puede aparecer en un HTML de producción.
export function rastrosDePrototipo(html) {
  const out = [];
  if (/["'(=]\/sp-prototipo[/"'?#]/.test(html) || /https?:\/\/[^"'\s]*\/sp-prototipo\b/.test(html)) out.push('dirección con /sp-prototipo');
  if (/class="[^"]*\brevision-btn\b/.test(html) || /claude\.ai\/artifact\//.test(html)) out.push('botón «Revisión» o link a la sala');
  return out;
}

// canonical y og:url fuera del dominio.
export function urlsAjenas(html, sitio) {
  const out = [];
  for (const m of html.matchAll(/<link rel="canonical" href="([^"]+)"|<meta property="og:url" content="([^"]+)"/g)) {
    const u = m[1] || m[2];
    if (!u.startsWith(sitio + '/')) out.push(u);
  }
  return out;
}

// Las reglas de _redirects contra la lista, y las que esperan a Arturo.
export function problemasRedirects(texto, esperadas, prohibidas) {
  const out = [];
  const lineas = texto.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const reglasArchivo = new Set(lineas);
  for (const [o, d, c] of esperadas) if (!reglasArchivo.has(`${o} ${d} ${c}`)) out.push(`falta la regla «${o} ${d} ${c}»`);
  for (const l of lineas) {
    const [o, d] = l.split(/\s+/);
    for (const [p] of prohibidas) if (o === p || o === p.replace(/\/$/, '')) out.push(`«${o}» se redirige y espera una decisión de Arturo`);
    if (/^https?:/.test(d || '') && !SUBDOMINIO_SP.test(d)) out.push(`«${o}» lleva afuera del sitio de SP: ${d}`);
  }
  return out;
}

function autoprueba() {
  const f = [];
  const S = 'https://saludprotegida.com.py';
  if (!rastrosDePrototipo('<a href="/sp-prototipo/planes/">').length) f.push('no marca un link con /sp-prototipo');
  if (!rastrosDePrototipo(`<loc>${S}/sp-prototipo/</loc>`).length) f.push('no marca una URL absoluta con /sp-prototipo');
  if (!rastrosDePrototipo('<a href="https://claude.ai/artifact/abc" class="revision-btn sq">Revisión</a>').length) f.push('no marca el botón «Revisión»');
  if (rastrosDePrototipo('<a href="/planes/">Planes</a><p>prototipo de la guía</p>').length) f.push('marca una página limpia');
  if (!urlsAjenas('<link rel="canonical" href="https://nelargon.github.io/sp-prototipo/"/>', S).length) f.push('no marca un canonical ajeno');
  if (urlsAjenas(`<link rel="canonical" href="${S}/planes/"/><meta property="og:url" content="${S}/"/>`, S).length) f.push('marca un canonical propio');
  const esperadas = [['/que-cubre/', '/planes/', 301]];
  const prohibidas = [['/login/', '']];
  if (problemasRedirects('/que-cubre/ /planes/ 301\n', esperadas, prohibidas).length) f.push('marca un _redirects correcto');
  if (!problemasRedirects('# vacío\n', esperadas, prohibidas).length) f.push('no marca una regla que falta');
  if (!problemasRedirects('/que-cubre/ /planes/ 301\n/login / 302\n', esperadas, prohibidas).length) f.push('no marca /login redirigido');
  if (problemasRedirects('/que-cubre/ /planes/ 301\n/turnos/ https://turnos.saludprotegida.com.py/login/ 302\n', esperadas, []).length) f.push('marca una regla a un subdominio de SP');
  if (!problemasRedirects('/que-cubre/ /planes/ 301\n/turnos/ https://turnos.example.com/login/ 302\n', esperadas, []).length) f.push('no marca una regla que lleva afuera de SP');
  if (!problemasRedirects('/que-cubre/ /planes/ 301\n/turnos/ http://turnos.saludprotegida.com.py/login/ 302\n', esperadas, []).length) f.push('no marca una regla sin https');
  return f;
}

function archivos(dir, re) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { if (e !== '_next') out.push(...archivos(p, re)); }
    else if (re.test(e)) out.push(p);
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fallas = autoprueba();
  if (fallas.length) { console.error('✗ el control de producción falla en sus propios casos:\n  ' + fallas.join('\n  ')); process.exit(1); }
  const dir = process.argv[2] || 'out';
  const sitio = (process.argv[3] || process.env.SITE_URL || 'https://saludprotegida.com.py').replace(/\/$/, '');
  const indexable = process.env.NEXT_PUBLIC_INDEXABLE === 'true';
  const h = [];

  const htmls = archivos(dir, /\.html$/);
  for (const f of htmls) {
    const html = readFileSync(f, 'utf8');
    for (const r of rastrosDePrototipo(html)) h.push(`${r} en ${f.slice(dir.length)}`);
    for (const u of urlsAjenas(html, sitio)) h.push(`canonical u og:url fuera de ${sitio} en ${f.slice(dir.length)}: ${u}`);
    if (!indexable && !/<meta name="robots" content="noindex/.test(html) && !/http-equiv="refresh"/i.test(html)) h.push(`sin noindex en ${f.slice(dir.length)} (la indexación espera a Arturo)`);
  }

  const sm = join(dir, 'sitemap.xml');
  if (!existsSync(sm)) h.push('falta sitemap.xml');
  else {
    const locs = [...readFileSync(sm, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const ajenas = locs.filter((u) => !u.startsWith(sitio + '/') || u.includes('/sp-prototipo'));
    if (!locs.length) h.push('el sitemap no tiene direcciones');
    if (ajenas.length) h.push(`${ajenas.length} direcciones del sitemap fuera de ${sitio}, por ejemplo ${ajenas[0]}`);
  }

  const rb = join(dir, 'robots.txt');
  if (!existsSync(rb)) h.push('falta robots.txt');
  else if (!indexable && !/Disallow:\s*\/\s*$/m.test(readFileSync(rb, 'utf8'))) h.push('robots.txt deja indexar y la indexación espera a Arturo');

  const rd = join(dir, '_redirects');
  if (!existsSync(rd)) h.push('falta _redirects (lo escribe scripts/redirecciones.mjs en la edición de lanzamiento)');
  else h.push(...problemasRedirects(readFileSync(rd, 'utf8'), reglas(), NO_SE_REDIRIGEN));

  if (!existsSync(join(dir, '404.html'))) h.push('falta 404.html');

  if (h.length) {
    console.error(`✗ producción: ${h.length} problema(s) en el build para ${sitio}:`);
    for (const x of h.slice(0, 40)) console.error('  ' + x);
    process.exit(1);
  }
  console.log(`✓ producción: 12 casos de prueba bien · ${htmls.length} páginas sin /sp-prototipo ni botón «Revisión», canonical en ${sitio} y ${indexable ? 'indexables' : 'con noindex'} · sitemap en el dominio · ${reglas().length} redirecciones, cada una a una página publicada o a un subdominio de SP · 404 propio`);
}
