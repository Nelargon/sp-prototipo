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

const PAGINAS = ['/', '/simulador/', '/planes/', '/agendar/', '/blog/', '/historia/', '/guia/guia_home.html', '/guia/guia_resultados.html', '/guia/guia_prestador.html'];
const PAGINAS_APP = ['/', '/simulador/', '/planes/', '/agendar/', '/blog/', '/historia/']; // con estilos propios (sin CDN)

const browser = await chromium.launch({ executablePath: process.env.PW_CHROME || '/opt/pw-browsers/chromium' });

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
    for (const [paso, texto] of [['1 (quién)', 'Para mi familia'], ['2 (cobertura)', 'Un equilibrio'], ['3 (ubicación)', 'Asunción']]) {
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

  // 1b-ter. Modo app desktop (HANDOFF 11i): en ≥1100px la tarjeta completa
  // entra en el viewport, y avanzar de paso o abrir la lista de
  // departamentos NO mueve la página — lo largo scrollea dentro del cuerpo.
  for (const [w, h] of [[1366, 768], [1440, 900]]) {
    const desk = await browser.newPage({ viewport: { width: w, height: h } });
    await desk.goto(BASE + '/simulador/', { waitUntil: 'domcontentloaded' });
    await desk.waitForTimeout(700);
    const medir = () => desk.evaluate(() => {
      const c = document.querySelector('.sim-card');
      const r = c.getBoundingClientRect();
      return { scrollY: Math.round(window.scrollY), top: Math.round(r.top), bottom: Math.round(r.bottom), vh: window.innerHeight };
    });
    await desk.locator('button', { hasText: 'Empecemos' }).first().click();
    await desk.waitForTimeout(600);
    await desk.locator('button', { hasText: 'Para mí' }).first().click();
    await desk.waitForTimeout(600);
    await desk.locator('button', { hasText: 'Lo esencial' }).first().click();
    await desk.waitForTimeout(600);
    await desk.locator('button', { hasText: 'Preferís elegir tu departamento' }).first().click();
    await desk.waitForTimeout(500);
    const m = await medir();
    if (m.scrollY === 0 && m.top >= 0 && m.bottom <= m.vh + 2) ok('responsive', 'modo app ' + w + '×' + h + ': la tarjeta entra en pantalla y el flujo no mueve la página');
    else falla('responsive', 'confunde', 'modo app ' + w + '×' + h + ': ' + JSON.stringify(m), '/simulador/');
    await desk.close();
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

/* Navegación: un destino no puede vivir en dos desplegables distintos.
   El 6/08 dos sesiones enlazaron /que-cubre por su cuenta el mismo día. Los dos
   PRs tocaban partes distintas del archivo, así que git los fusionó SIN
   CONFLICTO — y main quedó con la misma página en el menú "Cobertura" Y en el
   menú "Planes", bajo dos nombres distintos, uno de ellos jerga interna
   ("Landing v1"). Ningún merge puede ver eso: el defecto no vive en el diff,
   vive en el nav entero. Ver BITACORA cap. 67.

   ⚠ SE MIDEN LAS DOS IMPLEMENTACIONES Y LOS DOS TAMAÑOS, y no es un lujo:
   el sitio tiene DOS headers —el inline de `app/page.jsx` (solo la home) y el
   compartido de `app/Header.jsx` (los otros 8 módulos)— más un menú móvil
   aparte en cada uno. La primera versión de este chequeo abría solo `/` en
   escritorio: miraba el header inline y dejaba ciegos el compartido y los dos
   menús móviles. Habría dado verde con el duplicado puesto en cualquiera de
   esos tres lugares. **Un guardián que no cubre donde el bug puede esconderse
   es el mismo error que vino a prevenir** — y acá el bug nació justamente de
   que hay dos headers.

   ⚠ La regla es DOS DESPLEGABLES, no "dos links". Contar links repetidos a
   secas marcaba tres cosas deliberadas: /simulador/ aparece dos veces en el
   menú Planes MÁS el CTA principal; "Mi SP" es a la vez el título del
   desplegable y una entrada adentro; y la Guía se enlaza al ancla #mi-red y a
   su portada. Dos entradas dentro del MISMO panel son un reparto de
   intenciones; la misma página en DOS paneles es un descuido de coordinación. */
{
  const JERGA = ['Landing v1', 'TODO:', 'lorem ipsum'];
  // '/' usa el header inline de page.jsx; '/planes/' usa el Header compartido.
  for (const [ruta, cual] of [['/', 'header inline (home)'], ['/planes/', 'Header compartido']]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(BASE + ruta, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    const dup = await page.evaluate(() => {
      const paneles = [...document.querySelectorAll('.navmenu-card')];
      const porDestino = {};
      paneles.forEach((panel, iPanel) => {
        panel.querySelectorAll('a[href]').forEach((a) => {
          const u = a.getAttribute('href') || '';
          if (u.startsWith('tel:') || u.startsWith('mailto:')) return;
          // El ancla SÍ distingue: /guia#mi-red y /guia son destinos distintos.
          const e = (porDestino[u] = porDestino[u] || { paneles: [], textos: [] });
          if (!e.paneles.includes(iPanel)) e.paneles.push(iPanel);
          e.textos.push((a.innerText || '').trim().split('\n')[0]);
        });
      });
      return Object.entries(porDestino).filter(([, e]) => e.paneles.length > 1).map(([u, e]) => [u, e.textos]);
    });
    if (!dup.length) ok('funcional', `nav ${cual}: ninguna página aparece en dos desplegables`);
    else for (const [d, t] of dup) falla('funcional', 'confunde', `nav ${cual}: "${d}" en 2+ desplegables (${t.join(' / ')})`, ruta);

    const cuerpo = await page.innerText('body');
    const jerga = JERGA.filter((j) => cuerpo.includes(j));
    if (!jerga.length) ok('contenido', `${cual}: sin jerga interna ni nombres de versión a la vista`);
    else falla('contenido', 'confunde', `jerga interna visible en ${cual}: ` + jerga.join(', '), ruta);
    await page.close();

    /* El menú móvil es OTRO markup: plano, sin desplegables, y solo existe
       abierto. Si no se abre acá, no lo mira nadie. */
    const m = await browser.newPage({ viewport: { width: 390, height: 740 } });
    await m.goto(BASE + ruta, { waitUntil: 'domcontentloaded' });
    await m.waitForTimeout(300);
    const burger = m.locator('.nav-burger').first();
    if (await burger.count()) {
      await burger.click();
      await m.waitForTimeout(500);
      const movil = await m.evaluate(() => {
        const porDestino = {};
        document.querySelectorAll('.menu-overlay a[href]').forEach((a) => {
          const u = a.getAttribute('href') || '';
          if (u.startsWith('tel:') || u.startsWith('mailto:')) return;
          (porDestino[u] = porDestino[u] || []).push((a.innerText || '').trim());
        });
        const dups = Object.entries(porDestino).filter(([, t]) => t.length > 1);
        return { dups, texto: document.querySelector('.menu-overlay').innerText };
      });
      if (!movil.dups.length) ok('funcional', `menú móvil ${cual}: sin destinos repetidos`);
      else for (const [d, t] of movil.dups) falla('funcional', 'confunde', `menú móvil ${cual}: "${d}" repetido (${t.join(' / ')})`, ruta);
      const jm = JERGA.filter((j) => movil.texto.includes(j));
      if (!jm.length) ok('contenido', `menú móvil ${cual}: sin jerga interna`);
      else falla('contenido', 'confunde', `jerga interna en el menú móvil de ${cual}: ` + jm.join(', '), ruta);
    } else falla('funcional', 'roto', `no se encontró el botón del menú móvil`, ruta);
    await m.close();
  }
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

/* ============ 6. PUERTAS DEL CRITERIO DE EVALUACIÓN WEB ============
   (6 ago 2026) El criterio de evaluación de la web define tres puertas y dice
   que la Puerta 2 "se aprueba con números, no con criterio" — y después admite
   que si nadie valida técnicamente, quien entrega se autoevalúa. Esta sección
   cierra ese hueco: las puertas se MIDEN acá y la evidencia es qa-resultados.json,
   no una captura de pantalla.
   Ya estaban cubiertas por las secciones 1-5: contraste sobre estilos computados,
   touch targets ≥44px, peso crítico, alt/labels y lenguaje sin jerga. Faltaban
   estas tres. */
console.log('\n== 6. PUERTAS DEL CRITERIO ==');
{
  /* 6a. Core Web Vitals en gama media sobre 4G — "donde vive la gente", no en
     la notebook del diseñador. Se emula CPU 4× más lenta y red 4G real.
     ⚠ INP NO se mide acá y no se puede: es una métrica de CAMPO (depende de
     interacciones reales de usuarios reales). Declararla verde en headless
     sería inventar un número. Sale de CrUX cuando el sitio tenga tráfico. */
  /* ⚠ LCP hay que OBSERVARLO, no consultarlo: getEntriesByType('largest-
     contentful-paint') vuelve vacío porque esas entradas no quedan en el buffer
     por defecto. El observer se instala con addInitScript, o sea ANTES de que
     la página empiece a pintar — si se instala después, ya te perdiste el
     evento y medís null creyendo que el sitio no tiene LCP. */
  /* ⚠ CACHÉ FRÍA POR RUTA (lo marcó la revisión del PR #91). La primera versión
     medía las tres rutas reusando la misma página: la segunda y la tercera
     cargaban los chunks, CSS y fuentes que la primera ya había dejado en caché,
     así que reportaban un LCP de visitante recurrente y lo presentaban como si
     fuera el de alguien que entra por primera vez. Quien llega a /simulador/
     desde Google no tiene nada cacheado. Ahora cada ruta se mide en un contexto
     nuevo, con su propio throttling. */
  for (const p of ['/', '/simulador/', '/planes/', '/que-cubre/']) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      window.__cwv = { lcp: null, cls: 0 };
      try {
        new PerformanceObserver((l) => { const e = l.getEntries(); window.__cwv.lcp = e[e.length - 1].startTime; })
          .observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cwv.cls += e.value; })
          .observe({ type: 'layout-shift', buffered: true });
      } catch (e) {}
    });
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false, latency: 150, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8,
    });
    await page.goto(BASE + p, { waitUntil: 'load' });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 2500)));
    const cwv = await page.evaluate(() => ({ lcp: window.__cwv?.lcp ?? null, cls: window.__cwv?.cls ?? 0 }));
    if (cwv.lcp == null) falla('rendimiento', 'cosmetico', 'LCP no reportado por el navegador', p);
    else if (cwv.lcp > 2500) falla('rendimiento', 'confunde', 'LCP ' + Math.round(cwv.lcp) + ' ms (vara 2500) en gama media/4G', p);
    else ok('rendimiento', p + ': LCP ' + Math.round(cwv.lcp) + ' ms en gama media/4G (≤2500)');
    if (cwv.cls > 0.1) falla('rendimiento', 'confunde', 'CLS ' + cwv.cls.toFixed(3) + ' (vara 0.1) — salto visual del layout', p);
    else ok('rendimiento', p + ': CLS ' + cwv.cls.toFixed(3) + ' (≤0.1)');
    await ctx.close();
  }

  /* 6b. Foco visible: recorrer con Tab y comprobar que CADA elemento
     interactivo cambia visiblemente al recibir foco. No alcanza con que el
     navegador ponga foco: si el CSS lo suprime con outline:none y no lo
     reemplaza, quien navega por teclado queda a ciegas. */
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  /* ⚠ SIN MUESTREO (lo marcó la revisión del PR #91). La primera versión cortaba
     en los 40 primeros: la FAQ, el cierre y el footer quedaban afuera, así que
     un control sin foco visible allá abajo daba verde igual. Un guardián que
     mira una muestra y reporta como si hubiera mirado todo es peor que no
     tenerlo — certifica lo que no revisó. Ahora recorre TODOS los visibles. */
  const sinFoco = await page.evaluate(() => {
    const malos = [];
    const els = Array.from(document.querySelectorAll('a[href],button,input,select,textarea'))
      .filter((e) => e.offsetParent !== null);
    window.__focoTotal = els.length;
    for (const el of els) {
      const antes = getComputedStyle(el);
      const base = [antes.outlineStyle, antes.outlineWidth, antes.boxShadow, antes.backgroundColor, antes.textDecorationLine].join('|');
      el.focus();
      const d = getComputedStyle(el);
      const foco = [d.outlineStyle, d.outlineWidth, d.boxShadow, d.backgroundColor, d.textDecorationLine].join('|');
      if (base === foco) malos.push((el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 32));
      el.blur();
    }
    return malos;
  });
  const focoTotal = await page.evaluate(() => window.__focoTotal || 0);
  if (sinFoco.length) falla('accesibilidad', 'confunde', sinFoco.length + ' de ' + focoTotal + ' elementos sin cambio visible al recibir foco: ' + sinFoco.slice(0, 4).join(' · '), '/');
  else ok('accesibilidad', 'foco visible: los ' + focoTotal + ' interactivos visibles de la home cambian al recibir foco');
  await page.close();

  /* 6c. Tokens, no valores clavados. El criterio pide que un refresh de marca
     sea un cambio de variables y no un rediseño. Se cuenta la dispersión real
     en el código: cuántos valores distintos de radio y cuántos hex a mano. */
  const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'app');
  const archivos = [];
  (function walk(d) {
    for (const f of readdirSync(d)) {
      const full = join(d, f);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(jsx?|css)$/.test(f)) archivos.push(full);
    }
  })(SRC);
  const radios = new Map(), hexes = new Map();
  for (const f of archivos) {
    const t = readFileSync(f, 'utf8');
    for (const m of t.matchAll(/border-radius:\s*(\d+)px/g)) radios.set(m[1], (radios.get(m[1]) || 0) + 1);
    /* ⚠ Cuenta hex de 3, 4, 6 y 8 dígitos, no solo de 6 (lo marcó la revisión
       del PR #91): el árbol ya tenía 173 `#fff`/`#000` que el patrón viejo no
       veía. Un guardián de tokens ciego a la forma corta puede dar verde con
       cientos de colores clavados a mano — que es exactamente lo que vino a
       impedir. Se normaliza la forma corta a larga para no contar #fff y
       #ffffff como dos colores distintos. */
    for (const m of t.matchAll(/#([0-9A-Fa-f]{3,8})\b/g)) {
      const h = m[1];
      if (![3, 4, 6, 8].includes(h.length)) continue;
      const largo = h.length <= 4 ? h.split('').map((c) => c + c).join('') : h;
      const k = ('#' + largo.slice(0, 6)).toUpperCase();
      hexes.set(k, (hexes.get(k) || 0) + 1);
    }
  }
  const nRadios = radios.size, nHex = hexes.size;
  const totalHex = [...hexes.values()].reduce((a, b) => a + b, 0);
  // Varas: una escala de radios sana tiene ~5 pasos; los hex deberían vivir en
  // variables CSS, no repetidos cientos de veces en estilos inline.
  if (nRadios > 6) falla('craft', 'confunde', 'escala de radios dispersa: ' + nRadios + ' valores distintos (' + [...radios.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => k + 'px×' + v).join(' · ') + ')', 'app/');
  else ok('craft', 'escala de radios: ' + nRadios + ' valores');
  if (totalHex > 200) falla('craft', 'confunde', 'colores clavados a mano: ' + totalHex + ' usos de ' + nHex + ' hex distintos, sin tokens — un refresh de marca sería un rediseño', 'app/');
  else ok('craft', 'colores: ' + totalHex + ' usos de ' + nHex + ' hex');
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
