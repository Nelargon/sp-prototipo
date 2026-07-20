/* QA integral del ecosistema SP (pendiente #3 del HANDOFF).
   Cinco frentes: funcional · responsive · accesibilidad · rendimiento · contenido.
   Ponderado a móvil: el 77% del tráfico real entra por celular (GA, jul 2026).

   Cómo correr (playwright-core vive FUERA del repo — regla de CLAUDE.md):
     1. build:  NEXT_PUBLIC_BASE_PATH=/sp-prototipo npm run build
     2. servir: out/ bajo el prefijo /sp-prototipo/ (http.server + symlink)
     3. PW_PATH=<dir-externo>/node_modules/playwright-core/index.js \
        node qa/qa-integral.mjs http://localhost:8080/sp-prototipo
   Chromium: /opt/pw-browsers/chromium. Salida: resumen en consola +
   qa-resultados.json (hallazgos con severidad) junto al script.

   Notas de entorno (BITACORA caps. 8): los clicks en tel: bloquean la
   navegación posterior en headless (solo presencia); las páginas de la
   guía usan el CDN de Tailwind — sin internet quedan sin estilos, por lo
   que el contraste/responsive de la guía se audita en el prototipo web y
   con la prueba manual de dispositivo real. */

const pwMod = await import(process.env.PW_PATH || 'playwright-core');
const { chromium } = pwMod.default ?? pwMod;
import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.argv[2] || 'http://localhost:8080/sp-prototipo';
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'out');
const hallazgos = []; // {frente, severidad: 'roto'|'confunde'|'cosmetico', detalle, donde}
const oks = [];
const ok = (frente, detalle) => { oks.push({ frente, detalle }); console.log('  ✓ ' + detalle); };
const falla = (frente, severidad, detalle, donde = '') => {
  hallazgos.push({ frente, severidad, detalle, donde });
  console.log('  ✗ [' + severidad + '] ' + detalle + (donde ? ' — ' + donde : ''));
};

const PAGINAS = ['/', '/simulador/', '/blog/', '/historia/', '/guia/guia_home.html', '/guia/guia_resultados.html', '/guia/guia_prestador.html'];
const PAGINAS_APP = ['/', '/simulador/', '/blog/', '/historia/']; // con estilos propios (sin CDN)

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

/* ============ 1. FUNCIONAL ============ */
console.log('\n== 1. FUNCIONAL ==');
{
  // 1a. Crawler: todos los links internos responden
  const page = await browser.newPage();
  const porVisitar = [...PAGINAS, '/v1/'];
  const links = new Set();
  for (const p of porVisitar) {
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded' }).catch(() => falla('funcional', 'roto', 'no carga', p));
    const hrefs = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href')));
    for (const h of hrefs) {
      if (!h || h.startsWith('#') || h.startsWith('tel:') || h.startsWith('mailto:') || h.startsWith('http') && !h.includes('localhost')) continue;
      const abs = new URL(h, BASE + p).href;
      if (abs.startsWith(BASE)) links.add(abs.split('#')[0]);
    }
  }
  let rotos = 0;
  for (const l of links) {
    const r = await page.request.get(l).catch(() => null);
    if (!r || r.status() >= 400) { rotos++; falla('funcional', 'roto', 'link interno roto (' + (r ? r.status() : 'sin respuesta') + ')', l); }
  }
  if (!rotos) ok('funcional', 'crawler: ' + links.size + ' links internos únicos, todos responden');

  // 1b. Simulador de punta a punta (caminante adaptativo hasta el precio y el lead)
  await page.goto(BASE + '/simulador/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  let pasos = 0;
  while (pasos < 15 && !(await page.locator('[data-sp-price]').count())) {
    // preferir el botón que avanza; jamás "Volver"
    const avanza = page.locator('button:visible', { hasText: /Empecemos|Continuar|Ver mi precio|Siguiente/ }).first();
    if (await avanza.count()) await avanza.click().catch(() => {});
    else {
      const opciones = page.locator('button:visible').filter({ hasNotText: /Volver/ });
      if (await opciones.count()) await opciones.first().click().catch(() => {});
      else break;
    }
    await page.waitForTimeout(450);
    pasos++;
  }
  if (await page.locator('[data-sp-price]').count()) {
    ok('funcional', 'simulador: llega al precio en ' + pasos + ' interacciones');
    // Tilde del "match" centrado en su aro: la animación de entrada pisa la
    // propiedad transform (BITACORA cap. 26) — el centrado va por flexbox y
    // acá se verifica computado, no en el código fuente.
    await page.waitForTimeout(1400); // animaciones del resultado terminadas
    const tilde = await page.evaluate(() => {
      const svgs = [...document.querySelectorAll('svg')];
      const ring = svgs.find((s) => s.getAttribute('viewBox') === '0 0 44 44');
      const chk = ring && ring.parentElement.querySelector('svg[viewBox="0 0 24 24"]');
      if (!ring || !chk) return null;
      const a = chk.getBoundingClientRect(), b = ring.getBoundingClientRect();
      return { dx: Math.abs((a.x + a.width / 2) - (b.x + b.width / 2)), dy: Math.abs((a.y + a.height / 2) - (b.y + b.height / 2)) };
    });
    if (tilde && tilde.dx <= 2 && tilde.dy <= 2) ok('funcional', 'resultado: tilde del match centrado en el aro (±2px)');
    else falla('funcional', 'confunde', 'el tilde del resultado no está centrado en el aro' + (tilde ? ' (dx=' + tilde.dx.toFixed(1) + ', dy=' + tilde.dy.toFixed(1) + ')' : ' (no encontrado)'), '/simulador/');
    const nombre = page.locator('input[placeholder*="ombre"]');
    if (await nombre.count()) {
      await nombre.fill('QA Prueba');
      await page.locator('input[placeholder*="hats"], input[type="tel"]').first().fill('0981123456').catch(() => {});
      await page.locator('button', { hasText: /Enviarme/ }).click().catch(() => {});
      await page.waitForTimeout(500);
      if (await page.locator('text=¡Listo').count()) ok('funcional', 'simulador: lead se envía y confirma');
      else falla('funcional', 'roto', 'el envío del lead no muestra confirmación', '/simulador/');
    }
  } else falla('funcional', 'roto', 'el caminante no llegó al precio del simulador', '/simulador/');

  // 1b-bis. Presupuesto de geometría móvil del simulador (390×670 ≈ viewport
  // útil de un in-app browser): en cada paso, la primera opción debe verse
  // sin scroll — el preámbulo comprimido + auto-scroll lo garantizan.
  {
    const movil = await browser.newPage({ viewport: { width: 390, height: 670 } });
    await movil.goto(BASE + '/simulador/', { waitUntil: 'domcontentloaded' });
    await movil.waitForTimeout(700);
    await movil.locator('button', { hasText: 'Empecemos' }).first().click();
    await movil.waitForTimeout(900);
    for (const [paso, texto] of [['1 (quién)', 'Para mi familia'], ['2 (cobertura)', 'Un equilibrio'], ['3 (zona)', 'Central']]) {
      const b = movil.locator('button', { hasText: texto }).first();
      const box = await b.boundingBox();
      if (box && box.y + box.height <= 670) ok('responsive', 'simulador móvil paso ' + paso + ': primera opción visible sin scroll');
      else falla('responsive', 'confunde', 'simulador móvil paso ' + paso + ': la primera opción queda bajo el pliegue (y=' + (box ? Math.round(box.y) : '—') + ')', '/simulador/');
      await b.click();
      await movil.waitForTimeout(900);
    }
    const cont = movil.locator('button', { hasText: 'Continuar' }).first();
    const cbox = await cont.boundingBox();
    if (cbox && cbox.y + cbox.height <= 670 + 260) ok('responsive', 'simulador móvil paso 4 (edades): el CTA queda a menos de un tercio de pantalla de scroll');
    else falla('responsive', 'confunde', 'simulador móvil: el CTA de edades queda demasiado abajo (y=' + (cbox ? Math.round(cbox.y) : '—') + ')', '/simulador/');
    await movil.close();
  }

  // 1c. Guía: búsqueda con resultados, sin resultados (rescate), modo personalizado
  await page.goto(BASE + '/guia/guia_resultados.html?q=cardio', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  const tarjetas = await page.locator('#lista-resultados > *:visible').count();
  if (tarjetas > 0) ok('funcional', 'guía: búsqueda "cardio" muestra ' + tarjetas + ' resultados');
  else falla('funcional', 'roto', 'búsqueda "cardio" sin resultados visibles', 'guia_resultados');
  const inpG = page.locator('#q, input[type="search"], #busqueda').first();
  await inpG.fill('zzzqqq');
  await page.waitForTimeout(600);
  const rescate = await page.locator('a[href*="wa.me"]:visible').count();
  if (rescate > 0) ok('funcional', 'guía: cero resultados ofrece rescate por WhatsApp (no es callejón)');
  else falla('funcional', 'roto', 'cero resultados sin rescate visible', 'guia_resultados');
  await page.goto(BASE + '/guia/guia_resultados.html?plan=integral', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  if (await page.locator('#banner-plan:visible').count()) ok('funcional', 'guía: modo personalizado muestra el banner del plan');
  else falla('funcional', 'confunde', 'modo personalizado sin banner visible', '?plan=integral');
  // upsell: etiqueta dorada abre hoja, Escape la cierra
  const dorada = page.locator('button:visible', { hasText: /Desde SP|Exclusivo/ }).first();
  if (await dorada.count()) {
    await dorada.click();
    await page.waitForTimeout(400);
    if (await page.locator('#upsell-hoja:visible').count()) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      if (!(await page.locator('#upsell-hoja:visible').count())) ok('funcional', 'guía: hoja de upsell abre y cierra con Escape');
      else falla('funcional', 'confunde', 'la hoja de upsell no cierra con Escape', '?plan=integral');
    }
  }
  // 1d. Ficha de prestador: acciones de contacto presentes (tel: solo presencia)
  await page.goto(BASE + '/guia/guia_prestador.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const acciones = { tel: await page.locator('a[href^="tel:"]').count(), wa: await page.locator('a[href*="wa.me"]').count(), mapa: await page.locator('a[href*="maps"], a', { hasText: /llegar/i }).count() };
  if (acciones.tel && acciones.wa) ok('funcional', 'ficha: acciones de contacto presentes (tel ' + acciones.tel + ', wa ' + acciones.wa + ', mapa ' + acciones.mapa + ')');
  else falla('funcional', 'roto', 'ficha sin acciones de contacto completas', JSON.stringify(acciones));
  await page.close();
}

/* ============ 2. RESPONSIVE (77% del tráfico) ============ */
console.log('\n== 2. RESPONSIVE ==');
for (const w of [360, 390, 430]) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } });
  for (const p of PAGINAS_APP) {
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const hs = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (hs > 1) falla('responsive', 'confunde', 'scroll horizontal de ' + hs + 'px en ' + w + 'px', p);
  }
  // touch targets de los CTAs del hero + urgencias (vara 44px de Apple)
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  const targets = await page.evaluate(() => {
    const sel = ['[data-hero-content] a', 'a.urg-pill', 'button.nav-burger'];
    return sel.flatMap((s) => Array.from(document.querySelectorAll(s)).map((el) => ({ s, h: Math.round(el.getBoundingClientRect().height), t: (el.textContent || '').trim().slice(0, 22) })));
  });
  for (const t of targets.filter((t) => t.h > 0 && t.h < 44)) falla('responsive', 'cosmetico', 'touch target de ' + t.h + 'px (<44px) en ' + w + 'px: "' + t.t + '"', t.s);
  await page.close();
}
ok('responsive', 'barrido 360/390/430 completado en ' + PAGINAS_APP.length + ' páginas');

// 2b. Barra CTA móvil (jul 2026): en ≤820px reemplaza a los dos flotantes que
// tapaban texto (banda Senior, manifiesto, diferenciadores, FAQ, footer).
// Guardián computado: barra visible tras el scroll, flotantes ocultos, y el
// final del footer por encima de la barra — nada queda tapado al fondo.
for (const w of [360, 390, 430]) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } });
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  // behavior:'instant': el html tiene scroll-behavior:smooth y el scroll
  // programático animado hace medir a mitad de viaje.
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
  await page.waitForTimeout(600);
  const bar = await page.evaluate(() => {
    const b = document.querySelector('.cta-bar');
    if (!b) return { existe: false };
    const cs = getComputedStyle(b);
    const r = b.getBoundingClientRect();
    const fab = document.querySelector('.cotizar-fab');
    const wa = document.querySelector('.wa-fab');
    return {
      existe: true,
      visible: cs.display !== 'none' && b.classList.contains('show') && r.height > 40 && r.bottom <= window.innerHeight + 1,
      fabOculto: !fab || getComputedStyle(fab).display === 'none',
      waOculto: !wa || getComputedStyle(wa).display === 'none',
    };
  });
  if (bar.existe && bar.visible && bar.fabOculto && bar.waOculto) ok('responsive', 'barra CTA móvil en ' + w + 'px: visible tras el scroll y flotantes ocultos');
  else falla('responsive', 'confunde', 'barra CTA móvil en ' + w + 'px: ' + JSON.stringify(bar), '/');
  const fondo = await page.evaluate(async () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
    await new Promise((res) => setTimeout(res, 500));
    const b = document.querySelector('.cta-bar');
    const foot = document.querySelector('footer');
    if (!b || !foot || !foot.lastElementChild) return null;
    return { textoBottom: foot.lastElementChild.getBoundingClientRect().bottom, barTop: b.getBoundingClientRect().top };
  });
  if (fondo && fondo.textoBottom <= fondo.barTop + 1) ok('responsive', 'fin de página en ' + w + 'px: el copyright queda por encima de la barra');
  else falla('responsive', 'confunde', 'la barra tapa el final del footer en ' + w + 'px' + (fondo ? ' (texto ' + Math.round(fondo.textoBottom) + ' vs barra ' + Math.round(fondo.barTop) + ')' : ' (elementos no encontrados)'), '/');
  await page.close();
}

/* ============ 3. ACCESIBILIDAD ============ */
console.log('\n== 3. ACCESIBILIDAD ==');
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  for (const p of PAGINAS_APP) {
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    // imágenes sin alt (decorativas necesitan alt="")
    const sinAlt = await page.evaluate(() => Array.from(document.querySelectorAll('img:not([alt])')).map((i) => i.getAttribute('src')));
    for (const s of sinAlt) falla('accesibilidad', 'cosmetico', 'imagen sin atributo alt', p + ' → ' + s);
    // inputs sin etiqueta accesible
    const sinLabel = await page.evaluate(() => Array.from(document.querySelectorAll('input:not([type="hidden"])')).filter((i) => !i.getAttribute('aria-label') && !i.labels?.length && !i.getAttribute('placeholder')).length);
    if (sinLabel) falla('accesibilidad', 'confunde', sinLabel + ' inputs sin etiqueta accesible', p);
    // contraste: muestra de textos con su fondo efectivo
    const pares = await page.evaluate(() => {
      // fondo efectivo con composición alpha; si hay background-image (gradiente/foto) → no medible
      const parse = (c) => { const m = (c || '').match(/[\d.]+/g); if (!m) return null; const v = m.map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; };
      const efectivo = (el) => {
        const capas = [];
        let n = el;
        while (n && n !== document.documentElement) {
          const cs = getComputedStyle(n);
          if (cs.backgroundImage && cs.backgroundImage !== 'none') return null; // gradiente o foto: no medible
          const bg = parse(cs.backgroundColor);
          const opaco = bg && bg.a > 0;
          if (opaco) { capas.unshift(bg); if (bg.a >= 1) break; }
          // fixed/sticky sin fondo opaco: lo de atrás no es el ancestro DOM — no medible
          if ((cs.position === 'fixed' || cs.position === 'sticky') && (!bg || bg.a < 1)) return null;
          n = n.parentElement;
        }
        let base = { r: 255, g: 255, b: 255 };
        for (const c of capas) base = { r: c.r * c.a + base.r * (1 - c.a), g: c.g * c.a + base.g * (1 - c.a), b: c.b * c.a + base.b * (1 - c.a) };
        return base;
      };
      const out = [];
      const els = Array.from(document.querySelectorAll('p, a, span, div, h1, h2, h3, button, li, dd, dt')).slice(0, 400);
      for (const el of els) {
        if (!el.textContent || el.textContent.trim().length < 8 || el.children.length > 0) continue;
        const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) continue;
        const cs = getComputedStyle(el);
        if (parseFloat(cs.opacity) < 0.6) continue;
        const bg = efectivo(el);
        if (!bg) continue;
        const fg = parse(cs.color);
        if (!fg) continue;
        // texto con alpha se compone sobre el fondo
        const fgc = fg.a < 1 ? { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) } : fg;
        out.push({ fg: [fgc.r, fgc.g, fgc.b], bg: [bg.r, bg.g, bg.b], size: parseFloat(cs.fontSize), weight: parseInt(cs.fontWeight) || 400, txt: el.textContent.trim().slice(0, 32), css: cs.color });
      }
      return out;
    });
    const vistos = new Set();
    for (const par of pares) {
      const key = par.fg.map(Math.round).join() + '|' + par.bg.map(Math.round).join();
      if (vistos.has(key)) continue; vistos.add(key);
      const r = ratio(par.fg, par.bg);
      const grande = par.size >= 24 || (par.size >= 18.66 && par.weight >= 700);
      const minimo = grande ? 3 : 4.5;
      if (r < minimo) falla('accesibilidad', r < minimo - 1 ? 'confunde' : 'cosmetico', 'contraste ' + r.toFixed(2) + ':1 (mín ' + minimo + ':1) — "' + par.txt + '" ' + par.css + ' sobre rgb(' + par.bg.map(Math.round).join(',') + ')', p);
    }
  }
  // teclado: la home es navegable con Tab y el foco se mueve
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  const focos = [];
  for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); focos.push(await page.evaluate(() => document.activeElement && document.activeElement.tagName + ':' + (document.activeElement.textContent || '').trim().slice(0, 15))); }
  if (new Set(focos).size >= 8) ok('accesibilidad', 'teclado: Tab recorre ' + new Set(focos).size + ' elementos distintos en la home');
  else falla('accesibilidad', 'confunde', 'la navegación por Tab recorre pocos elementos (' + new Set(focos).size + ')', '/');
  await page.close();
}

/* ============ 4. RENDIMIENTO ============ */
console.log('\n== 4. RENDIMIENTO ==');
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  for (const p of PAGINAS_APP) {
    const reqs = [];
    page.on('response', (r) => reqs.push(r));
    await page.goto(BASE + p, { waitUntil: 'networkidle' });
    let gz = 0;
    for (const r of reqs.splice(0)) {
      const t = r.request().resourceType();
      if (!['document', 'stylesheet', 'script'].includes(t)) continue;
      try { gz += gzipSync(await r.body()).length; } catch (e) {}
    }
    const kb = Math.round(gz / 1024);
    if (kb > 300) falla('rendimiento', 'confunde', 'peso crítico ' + kb + ' KB gzip (vara 300)', p);
    else ok('rendimiento', p + ': ' + kb + ' KB gzip de contenido crítico (≤300)');
    // imágenes bajo el pliegue sin lazy
    const sinLazy = await page.evaluate(() => Array.from(document.querySelectorAll('img')).filter((i) => i.getBoundingClientRect().top > window.innerHeight * 1.5 && i.loading !== 'lazy').map((i) => (i.getAttribute('src') || '').split('/').pop()));
    if (sinLazy.length) falla('rendimiento', 'cosmetico', sinLazy.length + ' imágenes bajo el pliegue sin loading="lazy"', p + ' → ' + sinLazy.slice(0, 4).join(', '));
  }
  // 3G rápido emulado en la home (el 77% entra por celular)
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  const t0 = Date.now();
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  const dcl = Date.now() - t0;
  if (dcl < 3000) ok('rendimiento', 'home en 3G rápido: contenido en ' + dcl + ' ms (< 3 s)');
  else falla('rendimiento', 'confunde', 'home en 3G rápido tarda ' + dcl + ' ms (vara 3 s)', '/');
  await page.close();
}

/* ============ 5. CONTENIDO ============ */
console.log('\n== 5. CONTENIDO ==');
{
  const htmls = [];
  const walk = (d) => { for (const f of readdirSync(d)) { const full = join(d, f); if (statSync(full).isDirectory()) { if (!full.includes('/v1') && !full.includes('_next')) walk(full); } else if (f.endsWith('.html')) htmls.push(full); } };
  walk(OUT_DIR);
  const visible = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ');
  const patrones = [
    [/a confirmar/i, 'placeholder "a confirmar"'],
    [/Nombre Apellido/, 'testimonio/nombre placeholder'],
    [/lorem/i, 'lorem ipsum'],
    [/\bcartilla\b/i, 'jerga: "cartilla"'],
    [/\bprestaci[oó]n\b/i, 'jerga: "prestación"'],
    [/\bpr[aá]ctica\b/i, 'jerga: "práctica"'],
    [/9XX/, 'teléfono placeholder'],
  ];
  let limpio = true;
  for (const f of htmls) {
    const txt = visible(readFileSync(f, 'utf8'));
    for (const [re, nombre] of patrones) {
      const m = txt.match(re);
      if (m) { limpio = false; falla('contenido', 'confunde', nombre + ' visible ("…' + txt.slice(Math.max(0, m.index - 30), m.index + 34).replace(/\s+/g, ' ').trim() + '…")', f.replace(OUT_DIR, '')); }
    }
  }
  if (limpio) ok('contenido', htmls.length + ' páginas sin placeholders ni jerga prohibida (excluido /v1, congelado a propósito)');
  // lente Shapiro en la home: hero claro / prueba social / objeciones / CTA
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  const shapiro = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    pruebaSocial: document.querySelectorAll('[data-stat]').length + document.querySelectorAll('.ally-logo').length,
    objeciones: !!document.querySelector('#faq'),
    ctas: Array.from(document.querySelectorAll('a')).filter((a) => /Calcular|Simul/.test(a.textContent || '')).length,
  }));
  if (shapiro.h1 === 1 && shapiro.objeciones && shapiro.ctas >= 3 && shapiro.pruebaSocial > 5) ok('contenido', 'lente Shapiro: hero(h1=1) + prueba social(' + shapiro.pruebaSocial + ' elementos) + objeciones(FAQ) + ' + shapiro.ctas + ' CTAs');
  else falla('contenido', 'confunde', 'estructura Shapiro incompleta: ' + JSON.stringify(shapiro), '/');
  falla('contenido', 'cosmetico', 'prueba social sin voz humana: testimonios reales pendientes (responsable SP) — hoy la carga llevan números y logos', '/');
  await page.close();
}

await browser.close();

const porSev = { roto: 0, confunde: 0, cosmetico: 0 };
hallazgos.forEach((h) => porSev[h.severidad]++);
console.log('\n===============================================');
console.log('QA INTEGRAL — ' + oks.length + ' verificaciones OK · ' + hallazgos.length + ' hallazgos');
console.log('  roto: ' + porSev.roto + ' · confunde: ' + porSev.confunde + ' · cosmético: ' + porSev.cosmetico);
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), 'qa-resultados.json'), JSON.stringify({ fecha: new Date().toISOString(), oks, hallazgos }, null, 2));
console.log('Detalle: qa/qa-resultados.json');
process.exit(porSev.roto ? 1 : 0);
