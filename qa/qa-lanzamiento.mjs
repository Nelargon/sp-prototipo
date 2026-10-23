/* QA de la EDICIÓN DE LANZAMIENTO (v1 pública). Ver app/edicion.js.

   Responde una sola pregunta, que es la que importa en esta edición:
   ¿la v1 ofrece algo que no puede cumplir? Un link a agendar, a Mi SP
   o al blog en un sitio donde esas páginas no existen no es un 404: es una
   promesa rota, que es lo contrario de lo que vende esta empresa.

   El build ya corta si queda un href a un módulo podado
   (scripts/podar-edicion.mjs, hook postbuild). Esto verifica lo que el HTML
   estático no muestra: el menú móvil, que se arma al abrirlo, y las dos
   preguntas de la FAQ, abiertas como las abre una persona.
   Es el hallazgo que dejó esta corrida: grepear el HTML del export daba verde
   con las respuestas sin revisar. Desde el 24/09/2026 las respuestas están en
   el HTML aunque estén cerradas (Plegable, sistema táctil): por eso no alcanza
   con buscar el texto en la página. Se mira la respuesta que se abrió, que
   tenga alto y no esté inert, y que al cerrarse vuelva a quedar inert.

   Cómo correr (playwright-core vive FUERA del repo — regla de CLAUDE.md):
     1. build:  NEXT_PUBLIC_BASE_PATH=/sp-prototipo/lanzamiento \
                NEXT_PUBLIC_EDICION=lanzamiento npm run build
     2. servir: out/ bajo el prefijo /sp-prototipo/lanzamiento/
     3. PW_PATH=<dir-externo>/node_modules/playwright-core/index.js \
        node qa/qa-lanzamiento.mjs http://localhost:8080/sp-prototipo/lanzamiento */

import { readFileSync, existsSync } from 'node:fs';

const pwMod = await import(process.env.PW_PATH || 'playwright-core');
const { chromium } = pwMod.default ?? pwMod;

const BASE = process.argv[2] || 'http://localhost:8080/sp-prototipo/lanzamiento';
const PAGINAS = ['/', '/guia-medica/', '/guia-medica/P-0001/', '/planes/', '/simulador/'];
// 360/390/430: el piso de verificación móvil del proyecto (77% del tráfico).
const ANCHOS = [['escritorio', 1440, 900], ['móvil 360', 360, 780], ['móvil 390', 390, 844], ['móvil 430', 430, 932]];

let fallas = 0;
const mal = (m) => { fallas++; console.log('  ✗ ' + m); };
const bien = (m) => console.log('  ✓ ' + m);

const browser = await chromium.launch({ executablePath: process.env.PW_CHROME || '/opt/pw-browsers/chromium' });

// Las constantes de cobertura se leen de app/coverage.js (no importa nada), no
// de un literal: si SP contesta y una cambia, las pruebas la siguen (P3A y G1A).
const COV = await import('data:text/javascript;base64,' + Buffer.from(readFileSync(new URL('../app/coverage.js', import.meta.url), 'utf8')).toString('base64'));
// Los renglones de un elemento, como se ven: cada carácter con su caja,
// agrupados por altura. Lo oculto para lectores no cuenta.
const RENGLONES = `(el) => {
  const lineas = [];
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (n.parentElement.closest('.sr-solo')) continue;
    for (let i = 0; i < n.length; i++) {
      const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1);
      const b = r.getClientRects()[0];
      if (!b || !b.width) continue;
      let l = lineas.find((x) => Math.abs(x.top - b.top) < 8);
      if (!l) { l = { top: b.top, t: '' }; lineas.push(l); }
      l.t += n.data[i];
    }
  }
  return lineas.sort((a, b) => a.top - b.top).map((x) => x.t);
}`;
// Lo que oye el lector, en orden, de un ariaSnapshot: el texto de cada «text» y
// el nombre de cada botón o link (el nombre es lo que se oye, no su contenido).
// Se mide lo que expone el navegador, no el texto oculto (BITACORA cap. 149).
const oido = (snap) => snap.split('\n').map((l) => {
  const m = /^\s*- '?([a-z]+)(?: "((?:[^"\\]|\\.)*)")?(?: \[[^\]]*\])*'?(?::\s*(.*))?$/.exec(l);
  if (!m) return '';
  const [, rol, nombre, resto] = m;
  if (nombre !== undefined) return JSON.parse('"' + nombre + '"');
  // Sin nombre, el texto que trae en la misma línea («- text: …», «- paragraph: …»).
  return (resto || '').replace(/^"(.*)"$/, (_, x) => JSON.parse('"' + x + '"'));
}).filter(Boolean).join(' ').replace(/\s+/g, ' ');
const minus = (x) => x.charAt(0).toLowerCase() + x.slice(1);

for (const [nombre, width, height] of ANCHOS) {
  console.log('\n── ' + nombre);
  const page = await browser.newPage({ viewport: { width, height } });
  const erroresJs = [];
  page.on('pageerror', (e) => erroresJs.push(String(e)));
  for (const ruta of PAGINAS) {
    const r = await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
    if (!r || r.status() !== 200) { mal(ruta + ' → HTTP ' + (r && r.status())); continue; }
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href') || ''));
    const podados = hrefs.filter((x) => /\/(mi-sp|blog|guia|historia|v1|agendar)[/#]/.test(x));
    if (podados.length) mal(ruta + ' linkea a módulos podados: ' + podados.join(', '));
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (desborde > 1) mal(ruta + ' desborda ' + desborde + 'px a lo ancho');
  }
  if (erroresJs.length) mal('errores de JS: ' + erroresJs.slice(0, 3).join(' | '));
  else bien(PAGINAS.length + ' páginas sin errores de JS, sin desbordes, sin links podados');
  await page.close();
}

// ── el menú móvil se arma al abrirlo: el HTML estático no lo muestra ─────
console.log('\n── menú móvil');
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.click('.nav-burger');
  await page.waitForSelector('.menu-overlay');
  const items = await page.$$eval('.menu-overlay .menu-item', (as) => as.map((a) => [a.textContent.trim(), a.getAttribute('href')]));
  console.log('    ' + items.map(([t]) => t).join(' · '));
  if (items.some(([t]) => /Mi SP|^Blog$|^Historia$|Agendar/.test(t))) mal('ofrece un módulo que la v1 no publica');
  else bien('no ofrece Mi SP, blog, historia ni agendar');
  if (!items.some(([t, h]) => /Guía Médica/.test(t) && /\/guia-medica\/$/.test(h))) mal('falta "Guía Médica" → /guia-medica/');
  else bien('"Guía Médica" presente y lleva a /guia-medica/');
  await page.close();
}

// ── las FAQ vuelven a contestar con la guía ───────────────────────────────
console.log('\n── FAQ (se abren y dicen lo que tienen que decir)');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  // El acordeón abre de a UNA: cada pregunta se abre, se lee y se cierra.
  const casos = [
    ['¿La cobertura vale en todo el país?', ['lo podés ver vos mismo en la Guía Médica', 'Buscá en tu ciudad']],
    ['¿Está mi médico o mi sanatorio en la red?', ['no te dejamos sin respuesta', 'Abrí la Guía Médica']],
  ];
  const respuesta = (btn) => btn.evaluate((b) => {
    const r = document.getElementById(b.getAttribute('aria-controls'));
    if (!r) return null;
    return { abierta: r.dataset.abierto === '1' && !r.inert && r.getBoundingClientRect().height > 0, inert: !!r.inert, txt: r.innerText };
  });
  for (const [pregunta, frases] of casos) {
    const btn = page.locator('button[aria-controls]', { hasText: pregunta }).first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(400);
    const r = await respuesta(btn);
    if (!r || !r.abierta) { mal('"' + pregunta + '" no se abre'); continue; }
    for (const frase of frases) {
      if (r.txt.includes(frase)) bien('"' + frase + '"');
      else mal('la respuesta no dice: "' + frase + '"');
    }
    await btn.click();
    await page.waitForTimeout(400);
    const c = await respuesta(btn);
    if (!c || !c.inert) mal('"' + pregunta + '" cerrada sigue recibiendo el foco (falta inert)');
  }
  const txt = await page.evaluate(() => document.body.innerText);
  if (/Mi SP|Pedí tu turno|Agendar un turno/.test(txt)) mal('el home de la v1 todavía nombra Mi SP o agendar');
  else bien('el home de la v1 no nombra Mi SP ni agendar');
  await page.close();
}

// ── las puertas de la guía que la v1 estrena el 23/09 ───────────────────────
console.log('\n── puertas de la Guía Médica');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const hero = await page.$$eval('a.btn-ghost-light', (as) => as.map((a) => [a.textContent.trim(), a.getAttribute('href')]));
  if (!hero.some(([t, h]) => /Buscá tu médico/.test(t) && /\/guia-medica\/$/.test(h))) mal('la puerta del hero no lleva a /guia-medica/');
  else bien('hero: "Ya soy de SP · Buscá tu médico" → /guia-medica/');
  const cta = await page.$$eval('a.nav-guia-cta', (as) => as.map((a) => [a.textContent.trim(), a.getAttribute('href')]));
  if (!cta.some(([t, h]) => /Guía Médica/.test(t) && /\/guia-medica\/$/.test(h))) mal('el botón de la barra no lleva a /guia-medica/');
  else bien('barra: "Guía Médica" → /guia-medica/');
  await page.close();
}

// ── la guía funciona con la red real ─────────────────────────────────────
console.log('\n── Guía Médica');
for (const [nombre, width, height] of [['móvil 390', 390, 844], ['escritorio', 1440, 900]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e)));
  await page.goto(BASE + '/guia-medica/?q=pediatra&plan=esencial-interior', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const n1 = await page.locator('article').count();
  if (!n1) mal(nombre + ': "pediatra" con Essential Interior no devuelve nada');
  else bien(nombre + ': pediatras con Essential Interior desde la URL (' + n1 + ')');
  const puntos = await page.locator('[aria-label="Dato a revisar, marca interna"]').count();
  if (puntos) mal(nombre + ': la v1 muestra la marca interna de "Revisar"');
  // Emergencias: siempre a la vista, no según lo que se escriba (Arturo,
  // 04/10/2026). Hasta esa fecha un cartel se prendía con «dolor de pecho» y
  // callaba con «me duele el pecho»; sin un médico que valide qué es urgencia,
  // la guía no lo adivina y un dolor que no reconoce no recibe turno sugerido.
  // Dos puertas (Arturo, 04/10/2026): el número de SP y, si no atiende, el 141
  // de las ambulancias públicas. Un solo número es una sola puerta.
  const fija = page.locator('.gm-emergencia').first();
  const fijaOk = async () => (await fija.count()) > 0 && (await fija.isVisible())
    && (await fija.locator('a[href^="tel:+595"]').count()) === 1 && (await fija.locator('a[href="tel:141"]').count()) === 1;
  if (!(await fijaOk())) mal(nombre + ': la línea fija de emergencias no está a la vista con sus dos números (SP y 141)');
  else bien(nombre + ': la línea de emergencias está siempre a la vista, con el número de SP y el 141');
  await page.fill('input[type=search]', 'me duele el pecho');
  await page.waitForTimeout(600);
  const pecho = await page.evaluate(() => document.body.innerText);
  if (/Para empezar, un médico clínico/.test(pecho) || !(await fijaOk())) mal(nombre + ': «me duele el pecho» sugiere un turno o esconde la línea de emergencias');
  else bien(nombre + ': «me duele el pecho» no sugiere turno y la línea de emergencias sigue a la vista');
  // Sin resultados, el WhatsApp es para encontrar un médico, no para un dolor:
  // antes decía «escribinos y te decimos dónde atenderte» (04/10/2026).
  if (/te decimos dónde atenderte/.test(pecho) || !/Buscás un médico o un lugar que no aparece/.test(pecho)) mal(nombre + ': sin resultados, el WhatsApp no dice que es para encontrar un médico');
  else bien(nombre + ': sin resultados, el WhatsApp dice que es para encontrar un médico o un lugar');
  await page.fill('input[type=search]', 'rezonancia');
  await page.waitForTimeout(600);
  const txt = await page.evaluate(() => document.body.innerText);
  if (!/No encontramos «rezonancia»/.test(txt) || !/Quisiste decir/.test(txt)) mal(nombre + ': sin resultados no sugiere nada');
  else bien(nombre + ': "rezonancia" → ¿Quisiste decir…? + WhatsApp');
  const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (desborde > 1) mal(nombre + ': la guía desborda ' + desborde + 'px');
  const r = await page.goto(BASE + '/guia-medica/P-0001/', { waitUntil: 'networkidle' });
  const ficha = await page.evaluate(() => document.body.innerText);
  if (!r || r.status() !== 200 || !/Lo usás con estos planes/.test(ficha)) mal(nombre + ': la ficha P-0001 no carga');
  else bien(nombre + ': ficha P-0001 con sus planes');
  // "Essential" dejó de ser nombre interno el 24/09/2026: es el nombre que ve
  // el cliente (Arturo). "Privilege" sigue sin mostrarse nunca.
  if (/Privilege/.test(txt + ficha)) mal(nombre + ': aparece un nombre interno (Privilege)');
  if (errores.length) mal(nombre + ': errores de JS en la guía: ' + errores.slice(0, 2).join(' | '));
  await page.close();
}

// ── La fecha de la Guía Médica es la de la planilla (sp-interno#61) ────────
// Hasta el 23/10/2026 la Guía decía «Datos al 17/09/2026» siempre: leía la
// fecha del PDF de la red Privilege (meta.guias.privilege.fecha), que no se
// mueve con la planilla, mientras el home ya decía «según la planilla al
// 30/09». Y cada ficha mostraba la del PDF más reciente de sus redes (25/09 en
// P-0001, 10/08 en P-0363, que es solo Essential). Ahora las dos dicen
// meta.datos_al, el día en que build-guia-medica.py leyó la planilla del Drive.
// La fecha esperada sale de lib/guia-medica.json, no de un literal que
// envejece. Antes se prueba la comparación: la fecha vieja tiene que fallar.
console.log('\n── La fecha de la Guía Médica es la de la planilla (#61)');
{
  const META_GM = JSON.parse(readFileSync(new URL('../lib/guia-medica.json', import.meta.url), 'utf8')).meta;
  const AL = /^\d{4}-\d\d-\d\d$/.test(META_GM.datos_al || '') ? META_GM.datos_al.split('-').reverse().join('/') : '';
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const LARGA = AL ? (([d, m, y]) => `${+d} de ${MESES[+m - 1]} de ${y}`)(AL.split('/')) : '';
  const deLaGuia = (t) => ((t || '').match(/Datos al \d\d\/\d\d\/\d{4}/) || [''])[0];
  const deLaFicha = (t) => ((t || '').match(/Datos de la Guía Médica al \d{1,2} de [a-z]+ de \d{4}/) || [''])[0];
  const guiaBien = (t) => !!AL && deLaGuia(t) === 'Datos al ' + AL;
  const fichaBien = (t) => !!LARGA && deLaFicha(t) === 'Datos de la Guía Médica al ' + LARGA;
  const auto = {
    guiaVieja: guiaBien('Médicos, sanatorios y laboratorios. Datos al 17/09/2026'),
    guiaNueva: guiaBien('Médicos, sanatorios y laboratorios. Datos al ' + AL),
    fichaVieja: fichaBien('Datos de la Guía Médica al 10 de agosto de 2026.'),
    fichaNueva: fichaBien('Datos de la Guía Médica al ' + LARGA + '.'),
  };
  const malas = [];
  if (!AL) malas.push('lib/guia-medica.json no trae meta.datos_al con forma aaaa-mm-dd: ' + JSON.stringify(META_GM.datos_al));
  if (auto.guiaVieja || !auto.guiaNueva || auto.fichaVieja || !auto.fichaNueva) malas.push('la comparación no distingue la fecha vieja de la buena: ' + JSON.stringify(auto));
  for (const [nombre, width, height] of [['móvil 390', 390, 844], ['escritorio', 1440, 900]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(BASE + '/guia-medica/', { waitUntil: 'networkidle' });
    const g = await page.evaluate(() => document.body.innerText);
    if (!guiaBien(g)) malas.push(nombre + ': la Guía dice «' + (deLaGuia(g) || 'sin fecha') + '»; la planilla publicada es del ' + AL + ' (meta.datos_al)');
    // P-0001 tiene varias redes; P-0363 es solo Essential (antes, 10/08).
    for (const id of ['P-0001', 'P-0363']) {
      await page.goto(BASE + '/guia-medica/' + id + '/', { waitUntil: 'networkidle' });
      const f = await page.evaluate(() => document.body.innerText);
      if (!fichaBien(f)) malas.push(nombre + ', ficha ' + id + ': «' + (deLaFicha(f) || 'sin fecha') + '», no «' + LARGA + '»');
    }
    await page.close();
  }
  if (malas.length) mal('la Guía Médica y sus fichas dicen la fecha de la planilla publicada (meta.datos_al) · ' + malas.join(' · '));
  else bien('la Guía dice «Datos al ' + AL + '» y las fichas P-0001 y P-0363, «' + LARGA + '»: la fecha de la planilla publicada (meta.datos_al), a 390 y 1440; la comparación rechaza el 17/09 y el 10/08 de antes');
}

// ── Toda esquina del sistema táctil sale de la escala (sp-interno#60) ──────
// Lo computado, no el código (CLAUDE.md): cada .sq visible tiene que tener su
// --sq igual a uno de los valores de --r-xs, --r-sm, --r-md o --r-lg, leídos del
// :root en el navegador. Atrapa lo que se arma en tiempo de ejecución (un
// radio que llega por prop o un --sq calculado), que qa/esquinas.mjs, que mira
// el código, no ve. En 35165a7 marcaba 26 px (la tarjeta «Conocé tu plan ideal
// y su precio»), 24 px (la tarjeta del simulador), 9 px (zonas y Lista/Mapa de
// la Guía), 5 px (el chip «Lister») y 6 px («Atiende con»). Antes se prueba con
// dos .sq metidas en la página: una a mano (tiene que marcar) y una por token
// (no).
console.log('\n── Toda esquina del sistema táctil sale de la escala (#60)');
{
  const LEER_SQ = String((auto) => {
    const raiz = getComputedStyle(document.documentElement);
    const escala = ['--r-xs', '--r-sm', '--r-md', '--r-lg'].map((v) => raiz.getPropertyValue(v).trim()).filter(Boolean);
    const metidas = [];
    if (auto) for (const v of ['26px', 'var(--r-lg)']) { const d = document.createElement('div'); d.className = 'sq'; d.style.cssText = '--sq:' + v + ';width:40px;height:40px'; d.dataset.auto = v; document.body.appendChild(d); metidas.push(d); }
    const fuera = [];
    for (const e of document.querySelectorAll('.sq')) {
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(e).visibility === 'hidden') continue;
      const v = getComputedStyle(e).getPropertyValue('--sq').trim();
      // Sin --sq propio usa el respaldo del sistema (--r-xs).
      if (v && !escala.includes(v)) fuera.push({ v, auto: e.dataset.auto || null, quien: (e.textContent || e.className).replace(/\s+/g, ' ').trim().slice(0, 40) });
    }
    metidas.forEach((d) => d.remove());
    return { escala, fuera };
  });
  const malas = [];
  let autoOk = null;
  const RUTAS = ['/', '/planes/', '/simulador/', '/guia-medica/', '/guia-medica/?plan=silver-gold&esp=' + encodeURIComponent('Pediatría')];
  for (const [nombre, width, height] of [['móvil 390', 390, 844], ['escritorio', 1280, 900]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    for (const ruta of RUTAS) {
      await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
      if (ruta === '/simulador/') { const b = page.locator('button:visible', { hasText: 'Empecemos' }).first(); if (await b.count()) { await b.click(); await page.waitForTimeout(400); } }
      const r = await page.evaluate(`(${LEER_SQ})(${autoOk === null})`);
      if (autoOk === null) {
        const a = r.fuera.filter((x) => x.auto);
        autoOk = a.length === 1 && a[0].auto === '26px' && r.escala.length === 4;
        if (!autoOk) malas.push('la lectura no distingue la esquina a mano de la de la escala: ' + JSON.stringify({ escala: r.escala, metidas: a }));
      }
      r.fuera.filter((x) => !x.auto).forEach((x) => malas.push(nombre + ' ' + ruta + ': --sq ' + x.v + ' fuera de la escala («' + x.quien + '»)'));
    }
    await page.close();
  }
  if (malas.length) mal('cada .sq visible tiene su --sq en la escala (--r-xs, --r-sm, --r-md, --r-lg) · ' + malas.slice(0, 8).join(' · '));
  else bien('cada .sq visible del home, /planes, el simulador y la Guía Médica (también con Silver y Gold en Pediatría), a 390 y 1280, tiene su --sq en la escala, leída del :root; la lectura marca una esquina de 26 px metida a mano y deja pasar una por token');
}

// ── «Dónde te atendés» del home y el mapa de la guía (25/09/2026) ───────────
// El desglose sale de la planilla (scripts/red-home.mjs): se prueba que los
// números existan, no un valor fijo que envejece. Y que la sección siga corta
// (26/09/2026, Arturo: «no hace falta poner dónde uno vive… ni cuántos
// ginecólogos»; BITACORA cap. 122): sin botones de ciudad ni lista de
// especialidades, y una sola salida, a la Guía Médica.
console.log('\n── Dónde te atendés y el mapa de la guía');
for (const [nombre, width, height] of [['móvil 390', 390, 844], ['escritorio', 1440, 900]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const sec = page.locator('section.dta');
  if (!(await sec.count())) { mal(nombre + ': el home no tiene «Dónde te atendés»'); await page.close(); continue; }
  await sec.scrollIntoViewIfNeeded();
  const muro = await page.$eval('section.dta .muro-marco', (m) => ({ aria: m.getAttribute('aria-hidden'), n: m.querySelectorAll('.muro-texto span').length })).catch(() => ({ aria: null, n: 0 }));
  if (muro.aria !== 'true' || muro.n < 10) mal(nombre + ': el muro de nombres falta o lo leen los lectores de pantalla');
  const pais = await page.$$eval('section.dta .dta-cuadro b', (bs) => bs.map((b) => b.textContent).join('/'));
  const corta = await sec.evaluate((s) => ({
    botones: s.querySelectorAll('button').length,
    oficios: /ginecólog|pediatras|oftalmólog/i.test(s.innerText),
    links: [...s.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
  }));
  if (!/^\d+(\/\d+){2,}$/.test(pais)) mal(nombre + ': «Dónde te atendés» no muestra el desglose de la red (' + (pais || 'vacío') + ')');
  else if (corta.botones || corta.oficios) mal(nombre + ': «Dónde te atendés» volvió a crecer: ' + [corta.botones && corta.botones + ' botones', corta.oficios && 'lista de especialidades'].filter(Boolean).join(' y '));
  else if (corta.links.length !== 1 || !/\/guia-medica\/$/.test(corta.links[0])) mal(nombre + ': «Dónde te atendés» debería tener una sola salida, a la Guía Médica (' + corta.links.join(', ') + ')');
  else bien(nombre + ': desglose ' + pais + ', sin ciudades ni especialidades, y una sola salida a la guía');
  // El mapa: al costado en escritorio; detrás de «Lista | Mapa» en el celular.
  await page.goto(BASE + '/guia-medica/?esp=Pediatr%C3%ADa', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  if (width < 1400) {
    await page.locator('.gm-mapa-conmutador button', { hasText: 'Mapa' }).click();
    await page.waitForTimeout(300);
  }
  const zona = width < 1400 ? '.gm-mapa-flujo' : '.gm-mapa-lado';
  const puntos = await page.locator(zona + ' svg circle[fill="transparent"]').count();
  const lista = await page.locator(zona + ' button[aria-pressed]');
  if (!puntos || !(await lista.count())) { mal(nombre + ': el mapa de la guía no dibuja ciudades'); await page.close(); continue; }
  const primera = (await lista.first().textContent()).split('·')[0].trim();
  const textoMapa = await page.$eval(zona, (z) => z.innerText.replace(/©.*$/s, ''));
  if (/\d/.test(textoMapa.split('\n').slice(2).join(' '))) mal(nombre + ': el mapa muestra números (la guía no muestra totales)');
  await lista.first().click();
  await page.waitForTimeout(500);
  const u = page.url();
  const tarjetas = await page.$$eval('.gm-lista article', (as) => as.map((a) => a.innerText));
  if (!u.includes('c=' + encodeURIComponent(primera)) || !tarjetas.length || !tarjetas.every((t) => t.includes(primera))) mal(nombre + ': tocar «' + primera + '» en el mapa no filtra la lista');
  else bien(nombre + ': mapa con ' + puntos + ' ciudades; tocar «' + primera + '» deja ' + tarjetas.length + ' tarjetas de ahí');
  // El tapiz de la guía (26/09/2026): textura, no contenido.
  const tapiz = await page.$eval('.gm-tapiz', (t) => ({ aria: t.getAttribute('aria-hidden'), pe: getComputedStyle(t).pointerEvents, largo: t.textContent.length })).catch(() => null);
  if (!tapiz || tapiz.aria !== 'true' || tapiz.pe !== 'none' || tapiz.largo < 200) mal(nombre + ': el tapiz de la guía falta, lo leen los lectores de pantalla o ataja el puntero');
  else bien(nombre + ': tapiz detrás de la guía, invisible para lectores y puntero');
  await page.close();
}

// ── El tramo bajo la tabla del comparador (26/09/2026, BITACORA cap. 117) ───
// La espera de Essential es una fila de la tabla; abajo quedan una tarjeta con
// tres puertas y SP Senior en una frase. La banda «¿Dónde atenderte?» (que
// decía el total) ya no está. La leyenda de colores salió el 26/09 (cap. 125):
// #bolsillo, que enlaza el menú, es ahora una pregunta del FAQ.
console.log('\n── El tramo bajo la tabla del comparador');
for (const [nombre, width, height] of [['móvil 390', 390, 844], ['escritorio', 1280, 900]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const comp = document.getElementById('comparar');
    // La tabla del home es la vista rápida: no lleva esperas (regla del
    // 03/10; la fila «Tiempo de espera» salió el 13/10, decisión 5A de Arturo).
    const tabla = document.getElementById('cartilla');
    const srv = tabla ? [...tabla.querySelectorAll('.cmp2-srv')].map((x) => x.textContent.trim()) : [];
    const ley = document.getElementById('bolsillo');
    const puertas = [...document.querySelectorAll('#comparar .cmp-puertas a')].map((a) => ({ h: a.getAttribute('href'), alto: a.getBoundingClientRect().height }));
    const senior = [...comp.querySelectorAll('a')].find((a) => a.textContent.includes('Simulá Plan Vital'));
    return {
      espera: srv.length > 0 && !srv.some((t) => /espera/i.test(t)) && !/2 a 10 meses/.test(tabla.textContent),
      ley: !!ley && !!ley.closest('#faq') && /Copago/.test(ley.textContent),
      puertas, senior: senior && senior.getAttribute('href'),
      // textContent y no innerText: el rótulo viejo iba en mayúsculas por CSS,
      // e innerText lo devuelve transformado («¿DÓNDE ATENDERTE?»).
      viejo: ['¿Dónde atenderte?', 'más de 600'].filter((t) => comp.textContent.includes(t)),
    };
  });
  const destinos = ['/planes/', '/guia-medica/'];
  const faltan = destinos.filter((d) => !r.puertas.some((p) => p.h && p.h.endsWith(d)));
  const chicas = width < 600 ? r.puertas.filter((p) => p.alto < 44).length : 0;
  if (!r.espera) mal(nombre + ': la tabla del home muestra una espera (la vista rápida no lleva esperas: regla del 03/10, decisión del 13/10)');
  else bien(nombre + ': la tabla del home no muestra esperas');
  if (!r.ley) mal(nombre + ': falta #bolsillo en el FAQ, con copago (lo enlaza el menú «Qué pagás de tu bolsillo»)');
  else bien(nombre + ': #bolsillo es una pregunta del FAQ que explica el copago');
  if (faltan.length || chicas) mal(nombre + ': puertas del comparador — faltan ' + (faltan.join(', ') || 'ninguna') + (chicas ? '; ' + chicas + ' miden menos de 44 px' : ''));
  else bien(nombre + ': dos puertas (planes, guía)' + (width < 600 ? ', de 44 px o más' : ''));
  if (r.viejo.length) mal(nombre + ': el comparador todavía dice ' + r.viejo.join(' y '));
  else bien(nombre + ': sin la banda «¿Dónde atenderte?» ni el total');
  // Desde el 26/09 lleva ?plan=vital: el simulador entra directo al carril de
  // padres (sp-interno#59). Un enlace a /simulador/ sin el parámetro es el
  // arreglo deshecho.
  if (!r.senior || !r.senior.endsWith('/simulador/?plan=vital')) mal(nombre + ': falta «Simulá Plan Vital» hacia el simulador con ?plan=vital' + (r.senior ? ' (va a ' + r.senior + ')' : ''));
  else bien(nombre + ': SP Senior en una frase, con «Simulá Plan Vital» (?plan=vital)');
  await page.close();
}

// ── /planes/ es la única página de detalle; /que-cubre/ es su redirect ──────
// (3/10/2026, Arturo: «el espacio de "¿Qué cubre?" realmente debería no
// existir […] No tiene que llevar al home otra vez a la parte de planes».)
// Tres cosas que un HTML estático no prueba: que la dirección vieja llega a
// /planes/ (circula por WhatsApp y anuncios), que ningún ítem del menú ni de la
// página manda al home a #cartilla / #comparar, y que el detalle fino está
// plegado (inert) y se abre con un toque.
console.log('\n── /planes/: la página única de detalle');
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + '/que-cubre/');
  await page.waitForURL(/\/planes\/$/, { timeout: 5000 }).catch(() => {});
  if (/\/planes\/$/.test(page.url())) bien('/que-cubre/ lleva a /planes/');
  else mal('/que-cubre/ no llega a /planes/ (queda en ' + page.url() + ')');
  await page.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => ({
    // La tabla de la computadora es el comparador del home con todo adentro
    // (lámina 81, 07/10/2026): once servicios y nueve esperas, tres columnas.
    tabla: (() => { const t = document.getElementById('comparar-planes'); if (!t) return null; const cols = [...t.querySelectorAll('.cmp2-plan')]; const tops = cols.map((c) => c.getBoundingClientRect().top); return { planes: cols.length, filas: cols.map((c) => c.querySelectorAll('.cmp2-c').length), enFila: tops.every((y) => Math.abs(y - tops[0]) < 20), cubierta: (t.textContent.match(/Cubierta/g) || []).length }; })(),
    buscador: !!document.getElementById('bus-q'),
    escalon: /cosas mejoran|Subir un escalón/.test(document.body.textContent),
    haciaHome: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => /#(cartilla|comparar)|\/que-cubre\//.test(h)),
    exclusiones: [...document.querySelectorAll('.excl-grid > div')].length,
    orden: (() => { const a = [...document.querySelectorAll('.excl-grid a')].find((x) => /wa\.me\//.test(x.getAttribute('href') || '')); return a ? { href: a.getAttribute('href'), alto: a.getBoundingClientRect().height } : null; })(),
    plegables: [...document.querySelectorAll('.pleg')].map((e) => ({ abierto: e.dataset.abierto, inert: e.hasAttribute('inert'), alto: e.getBoundingClientRect().height })),
  }));
  if (!r.tabla || r.tabla.planes !== 3 || r.tabla.filas.some((x) => x !== 20) || !r.tabla.enFila || r.tabla.cubierta) mal('/planes/: en la computadora tiene que estar la tabla del home con los tres planes lado a lado, once servicios y nueve esperas, sin «Cubierta» (' + JSON.stringify(r.tabla) + ')');
  else bien('/planes/: la tabla del home, con los once servicios y las nueve esperas');
  if (r.buscador || r.escalon) mal('/planes/ todavía muestra el buscador o «Subir un escalón»'); else bien('/planes/: sin buscador ni «Subir un escalón»');
  if (r.haciaHome.length) mal('/planes/ manda al home o a /que-cubre/: ' + r.haciaHome.join(', ')); else bien('/planes/: ningún link vuelve a la sección de planes del home');
  if (r.exclusiones < 8) mal('/planes/: lo que no cubren debe estar a la vista (6 tarjetas + «¿Te preocupa alguna?» + la orden médica)'); else bien('/planes/: lo que no cubren, a la vista');
  // «¿Tenés una orden del médico?» (6/10/2026): el buscador salió y esto es lo que
  // lo reemplaza, con una persona. Tiene que ser un wa.me con el mensaje armado.
  if (!r.orden || !/text=.*orden/i.test(decodeURIComponent(r.orden.href)) || r.orden.alto < 44) mal('/planes/: falta «Mandar la foto por WhatsApp» (wa.me con el mensaje de la orden, de 44 px o más)'); else bien('/planes/: «¿Tenés una orden del médico?» manda la foto por WhatsApp');
  if (r.plegables.length !== 2 || r.plegables.some((p) => p.abierto !== '0' || !p.inert || p.alto > 1)) mal('/planes/: el detalle fino debe arrancar plegado e inert'); else bien('/planes/: especialidades e internación, plegadas');
  for (const id of ['detalle-especialidades', 'detalle-internacion']) await page.click(`button[aria-controls="${id}"]`);
  await page.waitForTimeout(450);
  const ab = await page.evaluate(() => [...document.querySelectorAll('.pleg')].map((e) => ({ inert: e.hasAttribute('inert'), alto: e.getBoundingClientRect().height })));
  if (ab.some((p) => p.inert || p.alto < 100)) mal('/planes/: un toque no abre el detalle'); else bien('/planes/: con un toque se abren las dos tablas');
  // El menú de la barra: el detalle de los planes es /planes/, no el home.
  await page.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  const menu = await page.$$eval('.navmenu-card a', (as) => as.map((a) => a.getAttribute('href') || ''));
  if (menu.some((h) => /#(cartilla|comparar)|\/que-cubre\//.test(h))) mal('el menú de la barra manda a #cartilla / #comparar o a /que-cubre/'); else bien('el menú de la barra no vuelve al home por planes');
  // «Plan Vital · 65 años o más» abre el simulador con Vital elegido, como los
  // botones «Simulá Plan Vital» (sp-interno#139, 06/10/2026). El home tiene su
  // propio menú: se miran los dos.
  for (const ruta of ['/planes/', '/']) {
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
    const vital = await page.$$eval('.navmenu-card a', (as) => as.filter((a) => /Plan Vital/.test(a.textContent)).map((a) => a.getAttribute('href') || ''));
    if (!vital.length || vital.some((h) => !h.endsWith('/simulador/?plan=vital'))) mal(ruta + ': el ítem «Plan Vital» del menú no abre el simulador con Vital (' + vital.join(', ') + ')');
    else bien(ruta + ': el ítem «Plan Vital» del menú abre el simulador con Vital');
  }
  // «Simulá Plan Vital» es turquesa como todo botón lleno: ningún plan tiene
  // color propio, tampoco Vital (sp-interno#141 punto 5, Arturo, 06/10/2026).
  await page.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  const fondoVital = await page.$$eval('a', (as) => { const a = as.find((x) => x.textContent.trim() === 'Simulá Plan Vital'); return a ? getComputedStyle(a).backgroundColor : null; });
  if (fondoVital !== 'rgb(0, 125, 119)') mal('/planes/: «Simulá Plan Vital» no es turquesa (' + fondoVital + ')'); else bien('/planes/: «Simulá Plan Vital» en turquesa, como todo botón lleno');
  // Los números del riel del simulador se leen: 4,5:1 o más sobre su círculo,
  // que es translúcido y se compone sobre el azul del riel (sp-interno#141
  // punto 4, 06/10/2026). Con --sp-blue-meta daban 3,3:1.
  await page.goto(BASE + '/simulador/', { waitUntil: 'networkidle' });
  const riel = await page.evaluate(() => {
    const rgb = (t) => (t.match(/[\d.]+/g) || []).map(Number);
    const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    const fondoDe = (el) => { for (let e = el.parentElement; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c.length >= 3 && c[3] !== 0) return c; } return [255, 255, 255]; };
    return [...document.querySelectorAll('.sim-steps > div > span:first-child')].filter((s) => /^\d$/.test(s.textContent.trim())).map((s) => {
      const cs = getComputedStyle(s), t = rgb(cs.color), b = rgb(cs.backgroundColor), p = fondoDe(s);
      const a = b.length < 3 ? 0 : (b[3] === undefined ? 1 : b[3]);
      const f = [0, 1, 2].map((i) => (b[i] || 0) * a + p[i] * (1 - a));
      const l1 = lum(t), l2 = lum(f);
      return { n: s.textContent.trim(), cr: (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) };
    });
  });
  const bajos = riel.filter((x) => x.cr < 4.5);
  if (riel.length < 3 || bajos.length) mal('/simulador/: números del riel por debajo de 4,5:1 (' + (bajos.map((x) => x.n + ': ' + x.cr.toFixed(2)).join(', ') || 'no se encontró el riel') + ')');
  else bien('/simulador/: los números del riel se leen (' + Math.min(...riel.map((x) => x.cr)).toFixed(2) + ':1 o más)');
  // Las explicaciones que se abren al tocar se miden (regla de claridad,
  // sp-interno#98): abrir «carencia» manda un abre_explicacion, una sola vez
  // por página aunque se vuelva a abrir. Se escucha console.debug, que es por donde sale
  // track() hasta que haya backend.
  await page.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  await page.evaluate(() => { window.__tracks = []; const d = console.debug; console.debug = (...a) => { if (a[0] === '[track]') window.__tracks.push({ evento: a[1], datos: a[2] }); d.apply(console, a); }; });
  // :visible — la comparativa del celular también tiene su «carencia», escondida
  // en la computadora (07/10/2026).
  const pal = page.locator('button.txt:visible', { hasText: 'carencia' }).first();
  const aExpl = async () => (await page.evaluate(() => window.__tracks)).filter((t) => t.evento === 'abre_explicacion');
  if (!(await pal.count())) mal('/planes/: no está la palabra «carencia» con su explicación');
  else {
    await pal.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(300);
    for (let vez = 0; vez < 2; vez++) {
      const c = await pal.boundingBox();
      await page.mouse.move(5, 5);
      await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
      await page.waitForTimeout(300);
    }
    const ev = await aExpl();
    if (ev.length !== 1 || ev[0].datos?.tipo !== 'glosario' || ev[0].datos?.clave !== 'carencia') mal('/planes/: abrir «carencia» dos veces tiene que mandar un solo abre_explicacion de glosario (' + JSON.stringify(ev) + ')');
    else bien('/planes/: abrir «carencia» se mide, una sola vez por página');
  }
  await page.close();
}

// ── /planes/ en el celular: tarjetas iguales y el detalle al tocar ─────────
// (lámina 59; Arturo la confirmó el 07/10/2026 con «1A, 2A, 3A, 4A».) Hasta
// 640 px la tabla de once servicios no se ve: se deslizaba de costado y al
// llegar mostraba solo Essential. En su lugar, quiénes entran (cuatro grupos),
// tres tarjetas con las mismas cinco líneas en el mismo orden, cada línea abre
// el tema en los tres planes, las esperas en un cuadro que entra y los once
// servicios en una hoja. Se prueba con el dedo, en 360 y 390.
console.log('\n── /planes/ en el celular: tarjetas iguales y el detalle al tocar');
for (const width of [360, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__tracks = []; const d = console.debug; console.debug = (...a) => { if (a[0] === '[track]') window.__tracks.push({ evento: a[1], datos: a[2] }); d.apply(console, a); }; });
  await page.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  const n = 'móvil ' + width;
  const r = await page.evaluate(() => {
    const cel = document.querySelector('.cmp-cel');
    const tabla = document.getElementById('comparar-planes');
    const cards = cel ? [...cel.querySelectorAll('article')] : [];
    const temas = cards.map((c) => [...c.querySelectorAll('.linea-cel')].map((l) => l.textContent.split(':')[0]).join('|'));
    const celdas = [...document.querySelectorAll('.esp-f [role=cell]')];
    return {
      cel: !!cel && getComputedStyle(cel).display !== 'none',
      tablaVisible: !!tabla && tabla.getClientRects().length > 0,
      cards: cards.length,
      lineas: cards.map((c) => c.querySelectorAll('.linea-cel').length),
      mismoOrden: temas.length === 3 && temas.every((t) => t === temas[0]),
      grupos: cel ? cel.querySelectorAll('[role=group] button[aria-pressed]').length : 0,
      precios: cards.map((c) => c.querySelector('.num-tnum')?.textContent),
      esperas: document.querySelectorAll('.esp-f[role=row]').length,
      celdasQueSeSalen: celdas.filter((e) => e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > e.parentElement.getBoundingClientRect().right + 0.5).length,
    };
  });
  if (!r.cel || r.tablaVisible) mal(n + ': /planes/ tiene que mostrar la comparativa del celular y no la tabla de la computadora (' + JSON.stringify({ cel: r.cel, tabla: r.tablaVisible }) + ')');
  else bien(n + ': la comparativa del celular, sin la tabla de la computadora');
  if (r.cards !== 3 || r.lineas.some((x) => x !== 5) || !r.mismoOrden) mal(n + ': las tres tarjetas tienen que tener las mismas cinco líneas, en el mismo orden (' + JSON.stringify({ cards: r.cards, lineas: r.lineas, mismoOrden: r.mismoOrden }) + ')');
  else bien(n + ': tres tarjetas con las mismas cinco líneas, en el mismo orden');
  if (r.esperas !== 10 || r.celdasQueSeSalen) mal(n + ': el cuadro de esperas tiene que traer las nueve esperas del simulador y entrar entero (' + JSON.stringify({ filas: r.esperas, seSalen: r.celdasQueSeSalen }) + ')');
  else bien(n + ': las nueve esperas, a la vista y sin salirse del cuadro');
  if (r.grupos !== 4) { mal(n + ': faltan los cuatro grupos de «quiénes entran» (hay ' + r.grupos + ')'); }
  else {
    await page.locator('.cmp-cel [role=group] button', { hasText: 'Vos con tus hijos' }).tap();
    const hijos = await page.$$eval('.cmp-cel article .num-tnum', (es) => es.map((e) => e.textContent));
    if (hijos.some((x, i) => x === r.precios[i])) mal(n + ': «Vos con tus hijos» no cambia el precio de las tres tarjetas (' + r.precios.join(', ') + ' → ' + hijos.join(', ') + ')');
    else bien(n + ': «Vos con tus hijos» cambia el precio de las tres tarjetas');
  }
  // Una línea se toca y abre el tema en los tres planes, en la hoja; se cierra y queda inert.
  // Acá se cuentan las cajas; lo que dice la hoja del tema «Tomografía y
  // resonancia» y la línea que la abre se comparan con la lista cerrada, en «Lo
  // que dicen las tarjetas y la hoja, contra una lista cerrada» (vuelta 8, 18/10).
  const linea = page.locator('.cmp-cel article').nth(1).locator('.linea-cel').nth(1);
  if (!(await linea.count())) mal(n + ': no hay líneas para tocar');
  else {
    await linea.scrollIntoViewIfNeeded();
    await linea.tap();
    await page.waitForTimeout(450);
    const h = await page.evaluate(() => { const d = document.querySelector('.cmp-cel .hoja[data-abierta="1"]'); return d ? { bloques: d.querySelectorAll('.hoja-cuerpo .sq').length, actual: [...d.querySelectorAll('.hoja-cuerpo .sq')].findIndex((b) => /0 0 0 1px/.test(b.getAttribute('style') || '')) } : null; });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(450);
    const inert = await page.evaluate(() => { const d = document.querySelector('.cmp-cel .hoja'); return d && d.dataset.abierta === '0' && d.hasAttribute('inert'); });
    const ev = (await page.evaluate(() => window.__tracks)).filter((t) => t.evento === 'abre_explicacion' && t.datos?.tipo === 'servicio');
    if (!h || h.bloques !== 3 || h.actual !== 1 || !inert || !ev.length) mal(n + ': tocar una línea tiene que abrir el tema en los tres planes, marcar el plan tocado, medirse y cerrarse inert (' + JSON.stringify({ h, inert, ev: ev.length }) + ')');
    else bien(n + ': tocar una línea abre el tema en los tres planes, se mide y se cierra');
  }
  const once = page.locator('.cmp-cel button', { hasText: 'Los once servicios, plan por plan' });
  let lista = 0;
  if (await once.count()) {
    await once.tap();
    await page.waitForTimeout(450);
    lista = await page.evaluate(() => { const d = document.querySelector('.cmp-cel .hoja[data-abierta="1"]'); return d ? d.querySelectorAll('.hoja-cuerpo button.fila').length : 0; });
  }
  if (lista !== 11) mal(n + ': «Los once servicios» tiene que abrir una hoja con los once (abrió ' + lista + ')');
  else bien(n + ': los once servicios, a pedido, en una hoja');
  await ctx.close();
}
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  const cel = await page.evaluate(() => { const e = document.querySelector('.cmp-cel'); return e ? getComputedStyle(e).display : 'no está'; });
  if (cel !== 'none') mal('escritorio: la comparativa del celular no se tiene que ver en la computadora (' + cel + ')');
  else bien('escritorio: en la computadora, la tabla y no la comparativa del celular');
  // La letra chica de cada servicio se abre al pasar el mouse por su nombre,
  // con los tres planes y su espera, y se mide (como en el home).
  await page.evaluate(() => { window.__tracks = []; const d = console.debug; console.debug = (...a) => { if (a[0] === '[track]') window.__tracks.push({ evento: a[1], datos: a[2] }); d.apply(console, a); }; });
  const srv = page.locator('#comparar-planes .cmp2-lab .cmp2-srv', { hasText: 'Internación' });
  let t = null;
  if (await srv.count()) {
    await srv.scrollIntoViewIfNeeded();
    const c = await srv.boundingBox();
    await page.mouse.move(5, 5);
    await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
    await page.waitForTimeout(300);
    t = await page.evaluate(() => { const e = document.querySelector('#comparar-planes .cmp2-tarjeta'); return e ? { planes: e.querySelectorAll('.cmp2-tarjeta-p').length, espera: /de espera/.test(e.textContent) } : null; });
  }
  const evS = (await page.evaluate(() => window.__tracks)).filter((x) => x.evento === 'abre_explicacion' && x.datos?.tipo === 'servicio' && x.datos?.clave === 'Internación');
  if (!t || t.planes !== 3 || !t.espera || evS.length !== 1) mal('escritorio: pasar el mouse por «Internación» tiene que abrir su tarjeta con los tres planes y la espera, y medirse una vez (' + JSON.stringify({ t, ev: evS.length }) + ')');
  else bien('escritorio: la letra chica de cada servicio se abre al pasar el mouse, con su espera, y se mide');
  await page.close();
}

// ── El comparador de planes (26/09/2026, components/Comparador.jsx) ────────
// En la computadora, la tabla 1.5: los tres planes a la vista, los nombres
// fijos debajo del menú al bajar. En el celular, las tarjetas apiladas. En las
// dos, la tarjeta del servicio con los tres planes. Y «por familia» a la vista
// (lección 51 de docs/diseno: cambia la comparación, no va a la tarjeta).
console.log('\n── El comparador de planes');
for (const [nombre, width, height] of [['móvil 360', 360, 780], ['móvil 390', 390, 844], ['escritorio', 1280, 900]]) {
  const movil = width < 820;
  const page = await browser.newPage({ viewport: { width, height }, hasTouch: movil, isMobile: movil });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const base = await page.evaluate(() => {
    const box = document.querySelector('#cartilla.cmp2');
    if (!box) return null;
    const planes = [...box.querySelectorAll('.cmp2-plan')].map((p) => p.getBoundingClientRect());
    // Desde la forma corta (P3, 13/10/2026) «familia» va adentro de la celda
    // («1/familia/año», .corta); antes iba en su nota (.cmp2-fam).
    const fam = [...box.querySelector('.cmp2-plan').querySelectorAll('.cmp2-fam, .corta')].filter((e) => e.offsetParent && /familia/.test(e.textContent)).length;
    return {
      planes: planes.length,
      apiladas: planes.every((r, i) => i === 0 || r.top > planes[i - 1].bottom - 1),
      enFila: planes.every((r, i) => i === 0 || Math.abs(r.top - planes[0].top) < 20),
      dentro: planes.every((r) => r.left >= 0 && r.right <= innerWidth + 1),
      desborde: document.documentElement.scrollWidth - innerWidth,
      fam,
      vieja: !!document.querySelector('.cmp-row, .cmp-ley'),
    };
  });
  if (!base) { mal(nombre + ': el home no tiene el comparador nuevo (#cartilla.cmp2)'); await page.close(); continue; }
  const forma = movil ? base.apiladas : base.enFila;
  if (base.planes !== 3 || !forma || !base.dentro || base.desborde > 0) mal(nombre + ': los tres planes no se ven ' + (movil ? 'uno debajo del otro' : 'uno al lado del otro') + ' dentro de la pantalla (' + JSON.stringify(base) + ')');
  else bien(nombre + ': tres planes ' + (movil ? 'apilados' : 'lado a lado') + ', sin deslizar de costado');
  if (!base.fam) mal(nombre + ': «familia» no está a la vista en Essential (cambia la comparación)');
  else bien(nombre + ': «familia» a la vista en Essential');
  if (base.vieja) mal(nombre + ': quedan restos de la tabla vieja (.cmp-row o la leyenda)');
  // La tarjeta del servicio: con el dedo en el celular, con el mouse en la compu.
  const btn = movil ? page.locator('.cmp2-plan').nth(1).locator('.cmp2-srv', { hasText: 'Fisioterapia' }) : page.locator('.cmp2-lab .cmp2-srv', { hasText: 'Fisioterapia' });
  // ⚠ Con mouse, NO usar btn.hover(): la página tiene scroll-behavior:smooth y
  // Playwright, al acomodar el botón, la desplaza con animación mientras el
  // puntero ya llegó; el botón se va de abajo del mouse y la tarjeta se cierra
  // (así falló el CI del PR #218, 26/09/2026). Se hace como una persona: el
  // botón al medio de la pantalla con scroll instantáneo, y el mouse que
  // entra desde afuera. Antes, que React haya activado los botones.
  const react = await page.waitForFunction(() => { const b = document.querySelector('.cmp2-srv'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).then(() => true).catch(() => false);
  await btn.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  // ⚠ Tocar recién cuando la sección terminó de entrar y el botón está quieto.
  // El comparador entra con una animación (data-rv: sube 18 px en ~1 s). Con
  // la máquina cargada, el botón se movía entre el toque y el click: el dedo
  // caía en el botón y el click, en la celda de abajo. Así falló el CI el
  // 29/09 y el 01/10 a 360 px, con el diagnóstico de abajo:
  // {"ev":[…"touchend→botón","click/touch→cmp2-c"]}. Una persona toca lo que
  // ya ve quieto: se espera que haya corrido el efecto que arma la animación
  // (.rvon), que la sección no tenga una animación en curso, y tres lecturas
  // seguidas, cada 100 ms, con el botón en el mismo lugar.
  let yPrev = null, quietas = 0;
  for (let i = 0; i < 60 && quietas < 3; i++) {
    const y = await btn.evaluate((e) => {
      const secs = [];
      for (let n = e.closest('[data-rv]'); n; n = n.parentElement && n.parentElement.closest('[data-rv]')) secs.push(n);
      const armado = !!document.querySelector('.rvon');
      const anima = secs.some((n) => n.getAnimations().some((a) => a.playState === 'running'));
      const pendiente = secs.some((n) => n.classList.contains('rv') && !n.classList.contains('in'));
      return armado && !anima && !pendiente ? Math.round(e.getBoundingClientRect().top) : null;
    });
    quietas = y !== null && y === yPrev ? quietas + 1 : 0;
    yPrev = y;
    if (quietas < 3) await page.waitForTimeout(100);
  }
  const quieto = quietas >= 3;
  // Si falla, que diga por qué (29/09/2026: falló una vez a 360 px con
  // {"t":null} y no se pudo reproducir en 36 intentos, ni con la CPU 8 veces
  // más lenta). Se anotan los eventos que llegaron y adónde, sin cambiar lo
  // que la prueba exige. El 01/10 volvió a fallar y esto mostró la causa: el
  // click cayó en la celda, no en el botón (la espera de arriba).
  await page.evaluate(() => { window.__cmpEv = []; for (const t of ['pointerdown', 'pointerup', 'touchend', 'focusin', 'focusout', 'click']) document.addEventListener(t, (e) => window.__cmpEv.push(t + (e.pointerType ? '/' + e.pointerType : '') + '→' + (e.target.closest?.('.cmp2-srv') ? 'botón' : String(e.target.className || e.target.nodeName).slice(0, 24))), true); });
  await page.evaluate(() => { window.__tracks = []; const d = console.debug; console.debug = (...a) => { if (a[0] === '[track]') window.__tracks.push({ evento: a[1], datos: a[2] }); d.apply(console, a); }; });
  if (movil) await btn.tap();
  else {
    const caja = await btn.boundingBox();
    await page.mouse.move(width / 2, 5);
    await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
  }
  await page.waitForSelector('.cmp2-tarjeta', { timeout: 2000 }).catch(() => {});
  const t = await page.evaluate(() => { const e = document.querySelector('.cmp2-tarjeta'); if (!e) return null; const r = e.getBoundingClientRect(); return { planes: e.querySelectorAll('.cmp2-tarjeta-p').length, dentro: r.left >= 0 && r.right <= innerWidth + 1 }; });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  const cerrada = await page.evaluate(() => !document.querySelector('.cmp2-tarjeta'));
  const ev = await page.evaluate(() => window.__cmpEv || []);
  if (!t || t.planes !== 3 || !t.dentro || !cerrada) mal(nombre + ': la tarjeta del servicio no se abre con los tres planes, se sale de la pantalla o no se cierra con Escape (' + JSON.stringify({ t, cerrada, react, quieto, ev }) + ')');
  else bien(nombre + ': la tarjeta del servicio se abre ' + (movil ? 'al tocar' : 'al pasar el mouse') + ', con los tres planes, y se cierra');
  // Abrir la tarjeta se mide una vez, con el nombre del servicio (sp-interno#98).
  const evSrv = (await page.evaluate(() => window.__tracks)).filter((x) => x.evento === 'abre_explicacion');
  if (evSrv.length !== 1 || evSrv[0].datos?.tipo !== 'servicio' || evSrv[0].datos?.clave !== 'Fisioterapia') mal(nombre + ': abrir la tarjeta de Fisioterapia tiene que mandar un solo abre_explicacion de servicio (' + JSON.stringify(evSrv) + ')');
  else bien(nombre + ': abrir la tarjeta del servicio se mide, con su nombre');
  if (!movil) {
    await page.evaluate(() => { const e = document.querySelector('#cartilla'); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY + 300, behavior: 'instant' }); });
    await page.waitForTimeout(200);
    const arriba = await page.evaluate(() => [...document.querySelectorAll('.cmp2-plan .cmp2-h')].map((h) => Math.round(h.getBoundingClientRect().top)));
    if (!arriba.every((y) => Math.abs(y - 88) <= 14)) mal(nombre + ': al bajar, los nombres de los planes no quedan fijos debajo del menú (' + arriba.join(', ') + ')');
    else bien(nombre + ': al bajar, los nombres de los planes quedan fijos debajo del menú');
  }
  await page.close();
}

// ── Lo que el sitio no afirma sin fuente (decisión 2A de Arturo, 13/10/2026) ─
// Mientras SP no conteste, lo que no tiene fuente sale o manda al asesor
// (sp-interno #80, #110, #116, #89 y #52). Se controlan las que se pueden
// volver a colar sin que nadie lo note: el 10% calculado en el precio de
// Essential, «por persona» en la tomografía y la resonancia de Silver y Gold
// (home, tabla y tarjetas de /planes y la FAQ), «La más elegida» sobre Silver,
// la cesárea de Gold a 5 meses, visar desde la App y la semi-suite «con baño
// propio». Probado contra el main del 13/10 (fallan todas) y contra la rama que
// las saca (pasan).
console.log('\n── Lo que el sitio no afirma sin fuente (decisión 2A)');
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  // El simulador hasta el precio: una persona sola, en Asunción.
  const resultado = async (plan) => {
    await page.goto(BASE + '/simulador/?plan=' + plan, { waitUntil: 'networkidle' });
    for (let i = 0; i < 14 && !(await page.locator('[data-sp-price]').count()); i++) {
      let hecho = false;
      for (const t of ['Empecemos', 'Para mí', 'Asunción', 'Continuar', 'Ver mi precio']) {
        const b = page.locator('button:visible', { hasText: t }).first();
        if (await b.count()) { await b.click().catch(() => {}); hecho = true; break; }
      }
      if (!hecho) break;
      await page.waitForTimeout(500);
    }
    return page.evaluate(() => {
      const p = document.querySelector('[data-sp-price]');
      const c = p && p.closest('div.sq');
      return c ? { plan: (c.textContent.match(/Plan (Essential|Silver|Gold)/) || [])[1] || null, texto: c.textContent } : null;
    });
  };
  const ess = await resultado('essential');
  if (!ess || ess.plan !== 'Essential') mal('/simulador/: no llegué al resultado de Essential (' + JSON.stringify(ess && ess.plan) + ')');
  else if (/10% de descuento/.test(ess.texto) || !/preguntale a tu asesor si Essential tiene descuento/.test(ess.texto)) mal('/simulador/: el resultado de Essential calcula el 10% por débito o no manda al asesor (sp-interno#80)');
  else bien('/simulador/: Essential no calcula el 10% por débito y manda a preguntarle al asesor');
  const sil = await resultado('silver');
  if (!sil || sil.plan !== 'Silver' || !/10% de descuento/.test(sil.texto)) mal('/simulador/: el resultado de Silver tiene que seguir mostrando el 10% por débito (' + JSON.stringify(sil && sil.plan) + ')');
  else bien('/simulador/: Silver sigue mostrando su 10% por débito');
  // «Por persona» en tomografía y resonancia de Silver y Gold: desde la P3A
  // (17/10/2026) lo controla la sección «La forma corta», con la constante.
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const home = await page.evaluate(() => {
    const t = document.getElementById('cartilla');
    return t ? { etiqueta: /La más elegida/i.test(t.textContent) } : null;
  });
  await page.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  const planes = await page.evaluate(() => ({ etiqueta: /La más elegida/i.test((document.getElementById('comparar-planes') || {}).textContent || '') }));
  if (!home || home.etiqueta || planes.etiqueta) mal('«La más elegida» sigue sobre Silver sin un dato de ventas confirmado (sp-interno#52)');
  else bien('sin «La más elegida» en el home ni en /planes');
  // Lo que salió y no tiene que volver, en todo el texto que trae cada página:
  // el textContent incluye lo que se ve recién al tocar (FAQ, glosario, hojas).
  const frases = [
    [/por persona y no por familia/i, '«por persona y no por familia» (sp-interno#110)'],
    [/cesárea (?:espera|baja a) 5/i, 'la cesárea de Gold a 5 meses (sp-interno#116)'],
    [/visarla desde la App/i, 'visar la orden desde la App (sp-interno#89)'],
    [/con baño propio/i, 'la semi-suite «con baño propio» (sp-interno#89)'],
  ];
  const vuelven = [];
  for (const ruta of ['/', '/planes/', '/guia-medica/']) {
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
    const texto = await page.evaluate(() => document.body.textContent);
    for (const [re, que] of frases) if (re.test(texto)) vuelven.push(ruta + ': ' + que);
  }
  if (vuelven.length) mal('vuelve una afirmación sin fuente: ' + vuelven.join(' · '));
  else bien('sin «por persona y no por familia», cesárea a 5 meses, visar desde la App ni «con baño propio» (home, /planes y Guía Médica)');
  await page.close();
}

// ── Lo que espera a SP no se afirma (3A y 8A, Arturo, 20/10/2026, «Adelante»; 1A, 23/10/2026) ──
// 3A (sp-interno#184): la tarjeta de «Consultas por especialista» del home dice
// para Silver «5 o 6 al año», sin «por persona», hasta que SP conteste #110. La
// psicología es una de ese resto y su fila dice «¿quién?»: la tabla afirmaba y
// negaba el mismo dato. 8A (sp-interno#189): Gold dice «La cobertura más
// amplia», sin «con los topes más altos», en el home y en el simulador, hasta
// que SP conteste #50: si vale la grilla, Gold tiene menos fisioterapia que
// Silver, y el superlativo tomaba el lado del dato que favorece al plan caro.
// Qué se mira:
//   3A · la línea de Silver de esa tarjeta, abierta como la abre una persona: a
//        1280 px pasando el mouse por el nombre y a 390 px con el dedo, desde la
//        tarjeta de Silver. No puede decir para quién (QUIEN_DICHO). Y en todo
//        el texto del home y de /planes (también lo que se abre al tocar), lo
//        que sigue a cada «5 o 6» hasta el punto tampoco: hoy, la pregunta
//        frecuente del home y la línea de consultas de la tarjeta de Silver de
//        /planes. En el simulador, lo mismo sobre lo que se ve en cada pantalla
//        de los recorridos de Essential, Silver y Gold (los pasos y el
//        resultado), en el paso del nivel y en la ubicación después de elegir
//        Gold. Ahí hoy no hay ningún «5 o 6», y eso vale; lo que no vale es no
//        haber leído: cada recorrido tiene que llegar al resultado de su plan y
//        pasar por las tres preguntas, con texto en cada pantalla.
//   8A · los textos de Gold, literales, como se ven: la cabecera de Gold de la
//        tabla del home (lo que dice bajo el precio) es «La cobertura más
//        amplia.» (GOLD_PARA); la línea de Gold de /planes es «La cobertura más
//        amplia» (GOLD_TAG), en la tarjeta de Gold a 390 px y en el texto de la
//        cabecera de la tabla, que a 1280 px no se ve; en el simulador, el
//        mensaje que acompaña el paso que sigue a elegir Gold es GOLD_PARA (a 390
//        y a 1280 px con Gold puesto desde el enlace, y a 390 px eligiéndolo en
//        el paso del nivel), la opción «La cobertura más amplia posible» dice su
//        rótulo y su nota (OPCION_AMPLIA_NOTA) y a la derecha solo su precio, y
//        el resultado de Gold tiene un párrafo que es su porqué, entero
//        (GOLD_PORQUE). Debajo, una segunda capa: el texto entero del home y de
//        /planes, el botón de la opción y cada pantalla del recorrido de Gold,
//        el resultado incluido, no dicen TOPES_ALTOS.
//        Lo que mira solo la segunda capa, y donde pasa una paráfrasis que
//        TOPES_ALTOS no conoce: un párrafo nuevo en la tarjeta del resultado de
//        Gold (no se compara con una lista cerrada, como TARJETA_APROBADA,
//        porque sus otros párrafos cambian con el precio, la zona, la red y las
//        esperas) y cualquier otro texto de esas pantallas, del home y de
//        /planes que no sea una de las líneas de arriba.
//        Silver, en el simulador, lo mira la 1A (abajo).
//        Corrección del 20/10 (verificador): el simulador se miraba solo con
//        TOPES_ALTOS, y «…y los mejores topes.» o «…, con los topes más
//        amplios.» pasaban en verde. Es la lección del cap. 153 («la lista de
//        lo que no va no se termina nunca»), que la cabecera ya cumplía.
//        Corrección del 20/10 (segundo verificador): tres lugares más del mismo
//        tipo. El mensaje del paso del simulador y la línea de Gold de /planes
//        no los leía ningún control con su texto aprobado: una copia con «…, con
//        los topes más altos.» en el mensaje y «…, con el respaldo más alto en
//        cada tope» en /planes daba 133 ✓. Y el «5 o 6» del simulador se había
//        medido una vez, a mano. Lo de la derecha de la opción lo miraba solo la
//        lista.
//   1A (Arturo, 23/10/2026, «Adelante con tus sugerencias», sp-interno#193):
//        Silver dice lo que da de más sin depender de lo que conteste SP en
//        #110: más días de terapia intensiva (5 contra 2; «por beneficiario» en
//        silver.json y «por persona» en el cuadernillo de Essential) y más
//        sesiones de psicología (5 contra 3, que en Essential son por familia y
//        en un cupo compartido). Sale «y topes más altos»: en 10 de las 20
//        especialidades con tope de Silver, Essential puede dar más consultas
//        al año. Lo literal: la opción «Un equilibrio entre precio y cobertura»
//        dice su rótulo y su nota (OPCION_EQUILIBRIO_NOTA) y a la derecha solo
//        su precio, y el resultado de Silver tiene un párrafo que es su porqué,
//        entero (SILVER_PORQUE), a 390 y a 1280 px con Silver puesto desde el
//        enlace y a 390 px eligiendo la opción en el paso del nivel. Debajo, la
//        segunda capa: el botón de la opción y cada pantalla de esos tres
//        recorridos, el resultado incluido, no dicen TOPES_ALTOS. El mensaje
//        del paso que sigue a elegir Silver («Un equilibrio entre precio y
//        cobertura.») no lo tocó la 1A: lo mira solo la segunda capa.
// Autoprueba: los dos detectores, contra los textos de antes del 20/10 y sus
// variantes (fallan) y los de ahora (pasan); la 3A del simulador, en texto, con
// el resultado de Silver como se leyó y una línea metida (con «por persona»,
// cae; sin él, no); y en la página, la línea de antes o una paráfrasis metida,
// leída con la misma lectura y devuelta: en la tarjeta de Silver (a 1280 px),
// en la cabecera de Gold del home, en la línea de Gold de /planes (a 390 y a
// 1280 px), en el mensaje del paso (en los tres recorridos de Gold), en la nota
// de la opción, al lado de su precio y en el porqué de Gold. Y la 1A, igual: la
// nota y el porqué de Silver de antes del 23/10 metidos en la página caen en
// las dos capas; una paráfrasis que TOPES_ALTOS no conoce («…y más consultas
// con especialistas.», justo lo que no es cierto en 10 especialidades), en la
// literal; y una frase pegada al precio de la opción, en la que la mira.
// Sabotajes fuera del repo: la build de antes (5a15047) da ✗ en la tarjeta y en
// los cuatro lugares de Gold; una copia con variantes, ✗ también en el «5 o 6»
// del texto; una con paráfrasis del superlativo en la opción y en el porqué,
// ✗ en los dos; la del segundo verificador (la frase vieja en el mensaje y la
// paráfrasis en /planes), ✗ en los dos; y dos más del 20/10: «5 o 6 al año por
// persona» en el resultado de Silver, ✗ en la 3A del simulador, y «La cobertura
// más amplia, sin tope en nada» en /planes, ✗ (HANDOFF, «✅ DECIDIDO EL 20/10/2026»).
// Los de la 1A (23/10): la build de main de antes (35165a7) da ✗ en la nota de
// la opción (en las dos capas) y en el porqué de los tres recorridos de Silver;
// una copia de la build con la 1A y «…y los mejores topes.» en la nota y «…y
// más consultas con especialistas.» en el porqué, ✗ en los dos (la nota, en las
// dos capas; el porqué, solo en la literal), y la build con la 1A, ✓.
console.log('\n── Lo que espera a SP no se afirma (3A: consultas de Silver; 8A: Gold; 1A: Silver en el simulador)');
{
  // Para quién: «por persona», «por beneficiario», «para cada uno»… y también
  // «por familia» o «para todo el grupo», que afirman lo contrario. «En cada
  // especialidad» no es una unidad: no cuenta.
  const QUIEN_DICHO = /\bpor\s+(?:persona|beneficiario|integrante|cabeza|socio|titular|afiliado|familia|grupo)s?\b|\bcada\s+(?:persona|integrante|beneficiario|afiliado|uno)\b|\bpara\s+cada\b|\bpara\s+tod[oa]s?\s+(?:la\s+familia|el\s+grupo|los\s+del\s+grupo)\b|\bcompartid[oa]s?\b/i;
  // Segunda capa: la lista de lo que no va. La primera son los literales de abajo.
  const TOPES_ALTOS = /\btopes?\s+(?:m[aá]s\s+(?:alt[oa]s?|ampli[oa]s?|grandes?|generos[oa]s?)|mayor(?:es)?|superior(?:es)?|mejor(?:es)?)|\b(?:m[aá]s\s+alt[oa]s?|mayor(?:es)?|superiores|mejor(?:es)?)\s+topes?\b|\blos\s+m[aá]s\s+altos\b/i;
  // Lo aprobado el 20/10 (8A), escrito acá como literales, no leído de quote.js
  // ni de page.jsx, que es lo que dibuja la página.
  const GOLD_PARA = 'La cobertura más amplia.';
  const OPCION_AMPLIA = 'La cobertura más amplia posible';
  const OPCION_AMPLIA_NOTA = 'Consultas sin tope en casi todas las especialidades y más días de internación y terapia intensiva.';
  const GOLD_PORQUE = 'La cobertura más amplia: consultas sin tope en casi todas las especialidades y más días de internación.';
  // La línea de Gold de /planes: el `tag` de Gold de `plans()` (app/quote.js),
  // sin punto. Es, literal, el texto de la 8A (Arturo, 20/10/2026,
  // sp-interno#189: Gold dice «La cobertura más amplia», sin «con los topes más
  // altos»); /planes ya lo decía así y no cambió.
  const GOLD_TAG = 'La cobertura más amplia';
  // Lo aprobado el 23/10 (1A, sp-interno#193), literal: Silver sin «y topes más
  // altos», con lo que da de más sin depender de #110.
  const OPCION_EQUILIBRIO = 'Un equilibrio entre precio y cobertura';
  const OPCION_EQUILIBRIO_NOTA = 'Más días de terapia intensiva y más sesiones de psicología.';
  const SILVER_PORQUE = 'El equilibrio con respaldo de verdad: más días de terapia intensiva y más sesiones de psicología.';
  // Las de antes del 23/10, para las autopruebas.
  const OPCION_EQUILIBRIO_VIEJA = 'Más días de terapia intensiva y topes más altos.';
  const SILVER_PORQUE_VIEJO = 'El equilibrio con respaldo de verdad: más días de terapia intensiva y topes más altos.';
  // La paráfrasis que TOPES_ALTOS no ve: solo la ve el texto aprobado.
  const SILVER_PARAFRASIS = 'Más días de terapia intensiva y más consultas con especialistas.';
  // Lo que sigue a cada «5 o 6» hasta el punto (o 80 caracteres). En la página
  // se lee el texto del bloque que lo tiene (subiendo por los padres en línea),
  // no el de todo el body: textContent pega bloques vecinos sin espacio («…en el
  // restoTomografía…») y la ventana podía llevarse el «por persona» de otra
  // línea. Cuenta también lo que está oculto hasta que se toca.
  const VENTANA = '5\\s+o\\s+6[^.]{0,80}';
  const trasCincoOSeis = (t) => [...(t || '').matchAll(new RegExp(VENTANA, 'g'))].map((m) => m[0]);
  const cincoOSeisEnPagina = (src) => {
    const r = [];
    const vistos = new Set();
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (!/5\s+o\s+6/.test(n.data)) continue;
      let e = n.parentElement;
      while (e.parentElement && e !== document.body && getComputedStyle(e).display === 'inline') e = e.parentElement;
      if (vistos.has(e)) continue;
      vistos.add(e);
      for (const m of e.textContent.matchAll(new RegExp(src, 'g'))) r.push(m[0]);
    }
    return r;
  };
  const auto = [
    ...['Sin tope en 23 de las 43 especialidades; en el resto, 5 o 6 al año por persona.', '5 o 6 al año por beneficiario.', 'en el resto, 5 o 6 al año para cada uno.', '5 o 6 al año por familia.'].map((t) => [t, trasCincoOSeis(t).some((x) => QUIEN_DICHO.test(x)), true, 'QUIEN_DICHO']),
    ...['Sin tope en 23 de las 43 especialidades; en el resto, 5 o 6 al año. Hasta 3 por mes en cada especialidad; después, con copago.', 'Sin tope en la mitad de las especialidades; 5 o 6 al año en el resto', 'Sin topeen la mitad; 5 o 6 en el resto'].map((t) => [t, trasCincoOSeis(t).some((x) => QUIEN_DICHO.test(x)), false, 'QUIEN_DICHO']),
    ...['La cobertura más amplia, con los topes más altos.', 'Consultas sin tope en casi todas las especialidades, más días de internación y terapia intensiva, y los topes más altos.', 'La cobertura más amplia: consultas sin tope en casi todas las especialidades, más días de internación y los topes más altos.', 'Con los mayores topes.', 'Topes superiores a los de Silver.',
      // Las paráfrasis del verificador del 20/10, que pasaban en el simulador.
      'La cobertura más amplia: consultas sin tope en casi todas las especialidades y más días de internación y los mejores topes.', 'Consultas sin tope en casi todas las especialidades y más días de internación y terapia intensiva, con los topes más amplios.', 'los mejores topes', 'topes más amplios',
      // Los de Silver de antes del 23/10 (1A).
      OPCION_EQUILIBRIO_VIEJA, SILVER_PORQUE_VIEJO].map((t) => [t, TOPES_ALTOS.test(t), true, 'TOPES_ALTOS']),
    ...[GOLD_PARA, OPCION_AMPLIA_NOTA, GOLD_PORQUE, OPCION_EQUILIBRIO_NOTA, SILVER_PORQUE, 'Tope: la cantidad máxima de veces que podés usar algo en un año, o el monto máximo que cubre el plan.', 'Sin tope en 38 de las 43 especialidades. Hasta 3 por mes en cada especialidad; después, con copago.'].map((t) => [t, TOPES_ALTOS.test(t), false, 'TOPES_ALTOS']),
  ];
  const autoMal = auto.filter(([, dio, debe]) => dio !== debe).map(([t, dio, , re]) => re + (dio ? ' grita en falso con «' : ' no ve «') + t + '»');
  if (autoMal.length) mal('autoprueba de los detectores de la 3A y la 8A: ' + autoMal.join(' · '));
  else bien('autoprueba: QUIEN_DICHO y TOPES_ALTOS ven los ' + auto.filter((a) => a[2]).length + ' textos de antes del 20/10 (y los de Silver de antes del 23/10) y sus variantes, y callan en los ' + auto.filter((a) => !a[2]).length + ' de ahora');

  // La línea de Silver de la tarjeta abierta (una sola), como se ve.
  const silverDe = (tsel) => {
    const ts = document.querySelectorAll(tsel);
    if (ts.length !== 1) return null;
    const p = [...ts[0].querySelectorAll('.cmp2-tarjeta-p')].find((x) => x.querySelector('b') && x.querySelector('b').innerText.trim() === 'Silver');
    return { titulo: (ts[0].querySelector('.cmp2-tarjeta-t') || {}).innerText || '', silver: p ? p.innerText.replace(/^\s*Silver\s*/, '').trim() : null };
  };
  const TARJETA = '#cartilla .cmp2-tarjeta';
  const SRV = 'Consultas por especialista';
  // 3A en la computadora: el mouse entra al nombre desde afuera.
  const lecturas = [];
  let vieja3A = null;
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => { const b = document.querySelector('#cartilla .cmp2-srv'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).catch(() => {});
    const btn = page.locator('#cartilla .cmp2-lab .cmp2-srv', { hasText: SRV }).first();
    if (await btn.count()) {
      await btn.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForTimeout(250);
      const c = await btn.boundingBox();
      await page.mouse.move(5, 5);
      await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
      await page.waitForTimeout(250);
    }
    lecturas.push(['1280 px, con el mouse', await page.evaluate(silverDe, TARJETA)]);
    // Autoprueba en la página, con la misma lectura: la línea de antes del 20/10
    // en lugar de la de hoy, leída y devuelta como estaba.
    vieja3A = await page.evaluate(([tsel, vieja]) => {
      const t = document.querySelector(tsel);
      const p = t && [...t.querySelectorAll('.cmp2-tarjeta-p')].find((x) => x.querySelector('b') && x.querySelector('b').innerText.trim() === 'Silver');
      const ns = [];
      if (p) { const w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT); for (let n = w.nextNode(); n; n = w.nextNode()) if (n.data.trim() && !n.parentElement.closest('b')) ns.push(n); }
      if (!ns.length) return null;
      const antes = ns.map((n) => n.data);
      ns.forEach((n, i) => { n.data = i ? '' : vieja; });
      const leida = p.innerText.replace(/^\s*Silver\s*/, '').trim();
      ns.forEach((n, i) => { n.data = antes[i]; });
      return leida;
    }, [TARJETA, 'Sin tope en 23 de las 43 especialidades; en el resto, 5 o 6 al año por persona. Hasta 3 por mes en cada especialidad; después, con copago.']);
    await page.close();
  }
  // 3A en el celular: el dedo toca el nombre en la tarjeta de Silver.
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await p.waitForFunction(() => { const b = document.querySelector('#cartilla .cmp2-srv'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).catch(() => {});
    const tarjeta = p.locator('#cartilla .cmp2-plan').filter({ has: p.locator('.cmp2-nombre', { hasText: /^Silver$/ }) }).first();
    const btn = tarjeta.locator('.cmp2-srv', { hasText: SRV }).first();
    if (await btn.count()) {
      await btn.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await btn.tap();
      await p.waitForSelector(TARJETA, { timeout: 2000 }).catch(() => {});
    }
    lecturas.push(['390 px, con el dedo', await p.evaluate(silverDe, TARJETA)]);
    await ctx.close();
  }
  const mal3A = lecturas.filter(([, l]) => !l || l.titulo.trim() !== SRV || !l.silver || !/5 o 6 al año/.test(l.silver) || QUIEN_DICHO.test(l.silver)).map(([d, l]) => d + ': ' + (!l || l.silver === null ? 'no se abrió la tarjeta o no tiene la línea de Silver' : '«' + l.silver + '»' + (QUIEN_DICHO.test(l.silver) ? ' dice para quién («' + l.silver.match(QUIEN_DICHO)[0] + '»)' : ' no dice «5 o 6 al año»')));
  if (!vieja3A || !QUIEN_DICHO.test(vieja3A)) mal('3A, autoprueba en la página: con la línea de antes del 20/10 metida en la tarjeta, la lectura no ve el «por persona» (' + JSON.stringify(vieja3A) + ')');
  else bien('3A, autoprueba en la página: con la línea de antes del 20/10 metida en la tarjeta a 1280 px, la misma lectura ve «' + vieja3A.match(QUIEN_DICHO)[0] + '»');
  if (mal3A.length) mal('3A: la tarjeta de «' + SRV + '» del home, en Silver, dice para quién o no se leyó (sp-interno#184) · ' + mal3A.join(' · '));
  else bien('3A: la tarjeta de «' + SRV + '» del home dice para Silver «5 o 6 al año», sin para quién, a 1280 px con el mouse y a 390 px con el dedo («' + lecturas[0][1].silver + '»)');

  // 3A y 8A en todo el texto del home y /planes, la cabecera de Gold del home y
  // la línea de Gold de /planes.
  // La línea de Gold de /planes (el `tag` de Gold de `plans()`, app/quote.js),
  // como se ve: en el celular, la de la tarjeta de Gold, debajo del nombre; en la
  // computadora no se ve ninguna, porque la cabecera de la tabla la esconde
  // (`.cmp2-para`, display:none desde 820 px). Se leen las dos en cada ancho: la
  // que se ve, con innerText; las dos, con textContent, que es lo que se vería
  // si la mostraran. Con `vieja`, la autoprueba: las dos pasan a decir `vieja`,
  // se leen igual y se devuelven como estaban.
  const lineaGoldPlanes = (vieja) => {
    const vis = (e) => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
    const art = document.querySelector('article[aria-label="Plan Gold"]');
    const nom = art && [...art.querySelectorAll('span')].find((s) => s.textContent.trim() === 'Gold');
    const sig = nom && nom.nextElementSibling;
    const pl = [...document.querySelectorAll('#comparar-planes .cmp2-plan')].find((x) => (x.querySelector('.cmp2-nombre') || {}).textContent === 'Gold');
    const es = [['la tarjeta de Gold', sig && sig.tagName === 'P' ? sig : null], ['la cabecera de Gold de la tabla', pl ? pl.querySelector('.cmp2-para') : null]];
    const leer = () => es.map(([donde, e]) => ({ donde, hay: !!e, visto: vis(e), t: e ? e.textContent : null, v: vis(e) ? e.innerText : null }));
    const r = { lineas: leer() };
    const conTexto = es.map(([, e]) => e).filter((e) => e && e.childNodes.length === 1 && e.firstChild.nodeType === 3);
    if (vieja && conTexto.length === es.length) {
      const antes = conTexto.map((e) => e.firstChild.data);
      conTexto.forEach((e) => { e.firstChild.data = vieja; });
      r.vieja = leer();
      conTexto.forEach((e, i) => { e.firstChild.data = antes[i]; });
    }
    return r;
  };
  // La paráfrasis que pasó en verde el 20/10 (sabotaje C del segundo
  // verificador): TOPES_ALTOS no la ve; la ve solo el texto aprobado.
  const PLANES_PARAFRASIS = 'La cobertura más amplia, con el respaldo más alto en cada tope';
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const textos = {};
  const ventanas = {};
  const planesGold = {};
  for (const ruta of ['/', '/planes/']) {
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
    textos[ruta] = await page.evaluate(() => document.body.textContent);
    ventanas[ruta] = await page.evaluate(cincoOSeisEnPagina, VENTANA);
    // La cabecera de Gold, y la autoprueba con la misma lectura: la línea de
    // antes del 20/10 en su lugar, leída y devuelta como estaba.
    if (ruta === '/') textos.gold = await page.evaluate((vieja) => {
      const pl = [...document.querySelectorAll('#cartilla .cmp2-plan')].find((x) => (x.querySelector('.cmp2-nombre') || {}).textContent === 'Gold');
      const e = pl && pl.querySelector('.cmp2-para');
      if (!e || !e.firstChild) return null;
      const r = { t: e.textContent, visto: e.innerText };
      const antes = e.firstChild.data;
      e.firstChild.data = vieja;
      r.vieja = e.innerText;
      e.firstChild.data = antes;
      return r;
    }, 'La cobertura más amplia, con los topes más altos.');
    if (ruta === '/planes/') planesGold[390] = await page.evaluate(lineaGoldPlanes, PLANES_PARAFRASIS);
  }
  {
    const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await p.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
    planesGold[1280] = await p.evaluate(lineaGoldPlanes, PLANES_PARAFRASIS);
    await p.close();
  }
  // El simulador hasta el precio (una persona sola, en Asunción), como la 2A. En
  // cada pantalla se guarda lo que se ve: la pregunta del paso, el mensaje que
  // acompaña (en la computadora, en la columna de la izquierda; en el celular,
  // al lado de «Paso N de M» o, cuando ya hay estimado, debajo de la barra) y
  // el texto entero de la tarjeta del simulador. Con `vieja`, en el paso de la
  // ubicación (el que sigue a elegir el plan), la autoprueba: el mensaje pasa a
  // decir `vieja`, se lee igual y se devuelve como estaba.
  const PASO_QUIEN = '¿Para quién es el plan?';
  const PASO_UBI = '¿Dónde querés tu cobertura?';
  const PASO_EDADES = '¿Qué edades tienen?';
  const GOLD_PARA_VIEJA = 'La cobertura más amplia, con los topes más altos.';
  const leerPaso = ([pasoUbi, vieja]) => {
    const vis = (e) => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
    const n = (t) => t.replace(/\s+/g, ' ').trim();
    const card = document.querySelector('.sim-card');
    const enc = () => {
      const r = [document.querySelector('.sim-side-enc')];
      const mp = document.querySelector('.sim-mobile-progress');
      if (mp) {
        const der = mp.children[0] && mp.children[0].children[1];
        if (der && !der.querySelector('.num-tnum')) r.push(der);
        r.push(mp.children[2]);
      }
      return r.filter(vis);
    };
    const leer = () => ({ mensajes: enc().map((e) => n(e.innerText)), texto: card ? card.innerText : '' });
    const r = Object.assign({ titulo: n((document.querySelector('.sim-q-title') || {}).innerText || ''), precio: !!document.querySelector('[data-sp-price]') }, leer());
    if (vieja && r.titulo === pasoUbi) {
      const es = enc().filter((e) => e.childNodes.length === 1 && e.firstChild.nodeType === 3);
      if (es.length) {
        const antes = es.map((e) => e.firstChild.data);
        es.forEach((e) => { e.firstChild.data = vieja; });
        r.vieja = leer();
        es.forEach((e, i) => { e.firstChild.data = antes[i]; });
      }
    }
    return r;
  };
  // `porque`: el porqué aprobado del plan, cómo empieza (para encontrarlo si una
  // build lo cambió) y la línea que la autoprueba mete en su lugar. `elegir`:
  // sin plan en el enlace, el rótulo de la opción que se toca en el paso del
  // nivel (1A).
  const PORQUE_GOLD = [GOLD_PORQUE, '^La cobertura más amplia', 'La cobertura más amplia: consultas sin tope en casi todas las especialidades y más días de internación y los mejores topes.'];
  const PORQUE_SILVER = [SILVER_PORQUE, '^El equilibrio con respaldo', SILVER_PORQUE_VIEJO];
  const resultado = async (plan, pg = page, vieja = null, porque = PORQUE_GOLD, elegir = null) => {
    await pg.goto(BASE + '/simulador/' + (plan ? '?plan=' + plan : ''), { waitUntil: 'networkidle' });
    const pasos = [];
    for (let i = 0; i < 14; i++) {
      pasos.push(await pg.evaluate(leerPaso, [PASO_UBI, vieja]));
      if (await pg.locator('[data-sp-price]').count()) break;
      let hecho = false;
      for (const t of ['Empecemos', 'Para mí', ...(elegir ? [elegir] : []), 'Asunción', 'Continuar', 'Ver mi precio']) {
        const b = pg.locator('button:visible', { hasText: t }).first();
        if (await b.count()) { await b.click().catch(() => {}); hecho = true; break; }
      }
      if (!hecho) break;
      await pg.waitForTimeout(500);
    }
    // La tarjeta del resultado y sus párrafos como se ven; la autoprueba: el
    // párrafo que hoy es el porqué aprobado pasa a decir la línea de prueba de
    // `porque`, se lee igual y se devuelve como estaba.
    const r = await pg.evaluate(([aprobado, comienzo, vieja]) => {
      const p = document.querySelector('[data-sp-price]');
      const c = p && p.closest('div.sq');
      if (!c) return null;
      const parrafos = () => [...c.querySelectorAll('p')].map((x) => x.innerText.replace(/\s+/g, ' ').trim());
      const r = { plan: (c.textContent.match(/Plan (Essential|Silver|Gold)/) || [])[1] || null, texto: c.innerText, parrafos: parrafos() };
      // El párrafo aprobado; si no está (una build que lo cambió), el que empieza
      // como el porqué del plan, para que la autoprueba igual tenga dónde probar.
      const ps = [...c.querySelectorAll('p')];
      const e = ps.find((x) => x.innerText.replace(/\s+/g, ' ').trim() === aprobado) || ps.find((x) => new RegExp(comienzo).test(x.innerText.trim()));
      if (e && e.firstChild && e.firstChild.nodeType === 3 && e.childNodes.length === 1) {
        const antes = e.firstChild.data;
        e.firstChild.data = vieja;
        r.vieja = { texto: c.innerText, parrafos: parrafos() };
        e.firstChild.data = antes;
      }
      return r;
    }, porque);
    return Object.assign(r || { plan: null }, { pasos });
  };
  const gold = await resultado('gold', page, GOLD_PARA_VIEJA);
  const silver = await resultado('silver', page, null, PORQUE_SILVER);
  const essential = await resultado('essential');
  // 1A: Silver eligiendo la opción en el paso del nivel, hasta su resultado.
  const silverElegida = await resultado(null, page, null, PORQUE_SILVER, OPCION_EQUILIBRIO);
  let gold1280, silver1280;
  {
    const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    gold1280 = await resultado('gold', p, GOLD_PARA_VIEJA);
    silver1280 = await resultado('silver', p, null, PORQUE_SILVER);
    await p.close();
  }
  // La opción del paso «¿Qué nivel de cobertura buscás?», sin plan elegido: el
  // rótulo con su nota (la columna de texto del botón), lo que va a la derecha
  // (el precio) y el botón entero, como se ven; con la autoprueba, la nota de
  // antes metida y devuelta, y después una frase pegada al precio.
  await page.goto(BASE + '/simulador/', { waitUntil: 'networkidle' });
  for (const t of ['Empecemos', 'Para mí']) {
    const b = page.locator('button:visible', { hasText: t }).first();
    if (await b.count()) { await b.click().catch(() => {}); await page.waitForTimeout(500); }
  }
  const pasoNivel = await page.evaluate(leerPaso, [PASO_UBI, null]);
  const leerOpcion = ([rotulo, vieja, pegada]) => {
    const esRotulo = (s) => !s.children.length && s.textContent.trim() === rotulo;
    const b = [...document.querySelectorAll('button.sim-opt')].find((x) => [...x.querySelectorAll('span')].some(esRotulo));
    if (!b) return null;
    const lab = [...b.querySelectorAll('span')].find(esRotulo);
    const col = lab.parentElement;
    const nota = lab.nextElementSibling;
    const n = (t) => t.replace(/\s+/g, ' ').trim();
    const leer = () => ({ col: n(col.innerText), nota: nota ? n(nota.innerText) : null, boton: n(b.innerText) });
    const r = leer();
    if (nota && nota.firstChild && nota.firstChild.nodeType === 3 && nota.childNodes.length === 1) {
      const antes = nota.firstChild.data;
      nota.firstChild.data = vieja;
      r.vieja = leer();
      nota.firstChild.data = antes;
    }
    // Lo de la derecha: una frase pegada al precio, leída y sacada.
    const der = col.nextElementSibling;
    if (der) {
      const s = document.createElement('span');
      s.textContent = pegada;
      der.insertBefore(s, der.firstChild);
      r.pegada = leer();
      s.remove();
    }
    return r;
  };
  const opcion = await page.evaluate(leerOpcion, [OPCION_AMPLIA, 'Consultas sin tope en casi todas las especialidades y más días de internación y terapia intensiva, con los topes más amplios.', 'El máximo en todo']);
  // 1A: la opción de Silver, con la nota de antes (y una frase pegada al precio)
  // y con la paráfrasis.
  const opcionEq = await page.evaluate(leerOpcion, [OPCION_EQUILIBRIO, OPCION_EQUILIBRIO_VIEJA, 'Y topes más altos']);
  const opcionEqPar = await page.evaluate(leerOpcion, [OPCION_EQUILIBRIO, SILVER_PARAFRASIS, '']);
  // Y la persona elige ahí Gold: el paso que sigue es el de la ubicación.
  let elegida = null;
  const bAmplia = page.locator('button.sim-opt', { hasText: OPCION_AMPLIA }).first();
  if (await bAmplia.count()) {
    await bAmplia.click().catch(() => {});
    await page.waitForTimeout(500);
    elegida = await page.evaluate(leerPaso, [PASO_UBI, GOLD_PARA_VIEJA]);
  }
  await page.close();

  const lugares = [['/', ventanas['/']], ['/planes/', ventanas['/planes/']]];
  const cincoOSeis = lugares.flatMap(([ruta, vs]) => (vs || []).filter((x) => QUIEN_DICHO.test(x)).map((x) => ruta + ': «' + x.trim() + '»'));
  if (!ventanas['/'].length || !ventanas['/planes/'].length) mal('3A: no encontré ningún «5 o 6» en el home o en /planes (la prueba no estaría mirando nada)');
  else if (cincoOSeis.length) mal('3A: lo que sigue a «5 o 6» dice para quién (sp-interno#184) · ' + cincoOSeis.join(' · '));
  else bien('3A: ningún «5 o 6» dice para quién en el texto del home ni de /planes (' + lugares.map(([ruta, vs]) => ruta + ': ' + vs.map((x) => '«' + x.trim() + '»').join(', ')).join(' · ') + ')');

  // 3A en el simulador: lo que sigue a cada «5 o 6» en lo visible de cada
  // pantalla, renglón por renglón (innerText separa los bloques con un salto, y
  // así la ventana no se lleva el renglón de al lado). Que no diga ningún «5 o
  // 6» vale; que no haya leído, no: cada recorrido tiene que llegar al
  // resultado de su plan, pasar por las tres preguntas y tener texto en cada
  // pantalla.
  const ventanasDeTexto = (t) => (t || '').split('\n').flatMap(trasCincoOSeis);
  const dicePara = (t) => ventanasDeTexto(t).filter((x) => QUIEN_DICHO.test(x));
  const recorridos3A = [['Essential', essential], ['Silver', silver], ['Gold', gold], ['Gold', gold1280]];
  const sinLeer = recorridos3A.map(([pl, res], i) => {
    const ps = res.pasos || [];
    const falta = [];
    if (res.plan !== pl || !ps.length || !ps[ps.length - 1].precio) falta.push('no llegó al resultado de ' + pl + ' (' + JSON.stringify(res.plan) + ')');
    for (const t of [PASO_QUIEN, PASO_UBI, PASO_EDADES]) if (!ps.some((x) => x.titulo === t)) falta.push('no pasó por «' + t + '»');
    if (ps.some((x) => !x.texto.trim())) falta.push('una pantalla sin texto');
    return falta.length ? pl + (i === 3 ? ' a 1280 px' : '') + ': ' + falta.join(', ') : null;
  }).filter(Boolean);
  if (!pasoNivel || pasoNivel.titulo !== '¿Qué nivel de cobertura buscás?' || !pasoNivel.texto.trim()) sinLeer.push('no leí el paso del nivel (' + JSON.stringify(pasoNivel && pasoNivel.titulo) + ')');
  const pantallas = recorridos3A.flatMap(([pl, res], i) => (res.pasos || []).map((x) => [pl + (i === 3 ? ' a 1280 px' : '') + ', ' + (x.precio ? 'resultado' : x.titulo || 'inicio'), x.texto])).concat(pasoNivel ? [['paso del nivel', pasoNivel.texto]] : [], elegida ? [['ubicación, después de elegir Gold', elegida.texto]] : []);
  const ventanasSim = pantallas.flatMap(([d, t]) => ventanasDeTexto(t).map((x) => [d, x]));
  const caracteres = pantallas.reduce((s, [, t]) => s + t.length, 0);
  // Autoprueba, en texto: el resultado de Silver como se leyó, con una línea de
  // consultas metida debajo del nombre del plan. Con «por persona», cae; sin
  // él, la ventana lo ve y calla, también con la línea de Essential al lado.
  // Se cuenta contra lo que ya tenía el texto leído: si la página dice para
  // quién, eso lo marca la línea de abajo, y la autoprueba sigue midiendo solo
  // al detector (corrección del 20/10: con el sabotaje S2 daba dos ✗ por una
  // misma falla, y la de la autoprueba decía que el detector veía de más).
  const resSilver = (silver.pasos || []).find((x) => x.precio);
  const baseSilver = resSilver && resSilver.texto.includes('Plan Silver') ? resSilver.texto : null;
  const conPersona = baseSilver && baseSilver.replace('Plan Silver', 'Plan Silver\nSin tope en la mitad de las especialidades; 5 o 6 al año por persona en el resto.');
  const sinPersona = baseSilver && baseSilver.replace('Plan Silver', 'Plan Silver\nSin tope en la mitad de las especialidades; 5 o 6 al año en el resto.\nEn la red, hasta 3 por mes por persona.');
  const yaDice = baseSilver ? dicePara(baseSilver).length : 0;
  if (!baseSilver) mal('3A en el simulador, autoprueba: no tengo el texto del resultado de Silver para probar');
  else if (dicePara(conPersona).length !== yaDice + 1 || dicePara(sinPersona).length !== yaDice || ventanasDeTexto(sinPersona).length !== ventanasDeTexto(baseSilver).length + 1) mal('3A en el simulador, autoprueba: en el resultado de Silver, con «5 o 6 al año por persona» ve ' + (dicePara(conPersona).length - yaDice) + ' más (debe ver 1) y sin él ' + (dicePara(sinPersona).length - yaDice) + ' más (debe ver 0)');
  else bien('3A en el simulador, autoprueba en texto: en el resultado de Silver, «…5 o 6 al año por persona en el resto.» cae y «…5 o 6 al año en el resto.», con «En la red, hasta 3 por mes por persona.» en el renglón de abajo, no');
  const simPara = ventanasSim.filter(([, x]) => QUIEN_DICHO.test(x));
  if (sinLeer.length) mal('3A en el simulador: no leí lo que tenía que leer (la prueba no estaría mirando el simulador) · ' + sinLeer.join(' · '));
  else if (simPara.length) mal('3A en el simulador: lo que sigue a «5 o 6» dice para quién (sp-interno#184) · ' + simPara.map(([d, x]) => d + ': «' + x.trim() + '»').join(' · '));
  else bien('3A en el simulador: leí ' + pantallas.length + ' pantallas (las de Essential, Silver y Gold, cada una hasta su resultado, Gold también a 1280 px, el paso del nivel y la ubicación después de elegir Gold; ' + caracteres + ' caracteres) y ' + (ventanasSim.length ? 'ningún «5 o 6» dice para quién (' + ventanasSim.map(([d, x]) => d + ': «' + x.trim() + '»').join(' · ') + ')' : 'no dicen «5 o 6» en ninguna: no hay nada que diga para quién'));

  const mal8A = [];
  if (!textos.gold || textos.gold.vieja.trim() === GOLD_PARA || !TOPES_ALTOS.test(textos.gold.vieja)) mal('8A, autoprueba en la página: con la línea de antes del 20/10 en la cabecera de Gold, la lectura no la ve (' + JSON.stringify(textos.gold && textos.gold.vieja) + ')');
  else bien('8A, autoprueba en la página: con la línea de antes del 20/10 en la cabecera de Gold, la misma lectura ve «' + textos.gold.vieja.match(TOPES_ALTOS)[0] + '» y que no es «' + GOLD_PARA + '»');
  if (!textos.gold) mal8A.push('home: la tarjeta de Gold de la tabla no tiene su línea («.cmp2-para»)');
  else if (textos.gold.t.trim() !== GOLD_PARA || textos.gold.visto.trim() !== GOLD_PARA) mal8A.push('home, cabecera de Gold: dice «' + textos.gold.visto.trim() + '» y no «' + GOLD_PARA + '»');
  for (const ruta of ['/', '/planes/']) { const m = (textos[ruta] || '').match(TOPES_ALTOS); if (m) mal8A.push(ruta + ': «…' + textos[ruta].slice(Math.max(0, m.index - 40), m.index + m[0].length + 10).trim() + '…»'); }
  // La línea de Gold de /planes, literal: las dos lecturas en cada ancho; a
  // 390 px, la de la tarjeta tiene que verse.
  const planesMal = (ancho, lineas) => {
    if (!lineas) return ['a ' + ancho + ' px no pude leer la página'];
    const r = [];
    for (const l of lineas) {
      if (!l.hay) r.push('a ' + ancho + ' px no encontré ' + l.donde);
      else if (l.t.trim() !== GOLD_TAG) r.push('a ' + ancho + ' px, ' + l.donde + ' dice «' + l.t.trim() + '» y no «' + GOLD_TAG + '»');
      else if (l.visto && l.v.trim() !== GOLD_TAG) r.push('a ' + ancho + ' px, ' + l.donde + ' se ve «' + l.v.trim() + '» y no «' + GOLD_TAG + '»');
    }
    if (ancho === 390 && !lineas.some((l) => l.donde === 'la tarjeta de Gold' && l.visto)) r.push('a 390 px no se ve la línea de la tarjeta de Gold');
    return r;
  };
  const autoPlanes = [390, 1280].map((a) => {
    const g = planesGold[a];
    if (!g || !g.vieja) return 'a ' + a + ' px no pude meter la línea de prueba';
    const v = planesMal(a, g.vieja);
    return v.length >= g.lineas.length ? null : 'a ' + a + ' px, con la paráfrasis, la lectura ve ' + v.length + ' de ' + g.lineas.length + ' (' + (v.join(' · ') || 'nada') + ')';
  }).filter(Boolean);
  if (autoPlanes.length) mal('8A, autoprueba en /planes: ' + autoPlanes.join(' · '));
  else bien('8A, autoprueba en /planes: con «' + PLANES_PARAFRASIS + '» en la línea de Gold de la tarjeta y de la cabecera de la tabla, a 390 y a 1280 px, la misma lectura ve que no es «' + GOLD_TAG + '» en las dos');
  [390, 1280].forEach((a) => planesMal(a, planesGold[a] && planesGold[a].lineas).forEach((x) => mal8A.push('/planes/, línea de Gold: ' + x)));
  // El simulador: primero lo literal (la opción dice su rótulo y su nota, y a la
  // derecha solo su precio; el mensaje del paso que sigue a elegir Gold es
  // GOLD_PARA; el resultado de Gold tiene un párrafo que es su porqué, entero),
  // y debajo TOPES_ALTOS sobre el botón y cada pantalla del recorrido de Gold.
  const opcionMal = (o, rotulo = OPCION_AMPLIA, notaAprobada = OPCION_AMPLIA_NOTA) => {
    if (!o) return ['no encontré la opción «' + rotulo + '»'];
    const r = [];
    const colAprobada = rotulo + ' ' + notaAprobada;
    if (o.nota !== notaAprobada) r.push('la nota dice «' + o.nota + '» y no «' + notaAprobada + '»');
    else if (o.col !== colAprobada) r.push('el texto del botón dice «' + o.col + '» y no «' + colAprobada + '»');
    const der = o.boton.startsWith(o.col) ? o.boton.slice(o.col.length).trim() : null;
    if (der === null || !/^desde Gs\. \d{1,3}(?:\.\d{3})*$/.test(der)) r.push('a la derecha dice «' + (der === null ? o.boton : der) + '» y no solo «desde Gs. …»');
    const m = o.boton.match(TOPES_ALTOS);
    if (m) r.push('dice «' + m[0] + '»');
    return r;
  };
  const porqueMal = (g, plan = 'Gold', aprobado = GOLD_PORQUE, pista = 'cobertura más amplia') => {
    if (!g || g.plan !== plan) return ['no llegué al resultado de ' + plan + ' (' + JSON.stringify(g && g.plan) + ')'];
    const r = [];
    const iguales = g.parrafos.filter((x) => x === aprobado).length;
    if (iguales !== 1) r.push('ningún párrafo es, entero, «' + aprobado + '» (' + (g.parrafos.filter((x) => x.toLowerCase().includes(pista)).map((x) => '«' + x + '»').join(', ') || 'no hay ninguno con «' + pista + '»') + ')');
    const k = g.texto.search(TOPES_ALTOS);
    if (k >= 0) r.push('dice «…' + g.texto.slice(Math.max(0, k - 60), k + 25).replace(/\s+/g, ' ').trim() + '…»');
    return r;
  };
  // El mensaje del paso que sigue a elegir Gold: el de la ubicación, una vez, con
  // al menos un mensaje a la vista, y todos literales.
  const mensajeMal = (pasos) => {
    const ubi = pasos.filter((x) => x && x.titulo === PASO_UBI);
    if (ubi.length !== 1) return ['no encontré, una vez, el paso «' + PASO_UBI + '» (' + ubi.length + ')'];
    if (!ubi[0].mensajes.length) return ['en el paso «' + PASO_UBI + '» no se ve ningún mensaje'];
    return ubi[0].mensajes.filter((x) => x !== GOLD_PARA).map((x) => 'el mensaje del paso dice «' + x + '» y no «' + GOLD_PARA + '»');
  };
  const topesEnPasos = (pasos) => pasos.filter(Boolean).map((x) => {
    const k = x.texto.search(TOPES_ALTOS);
    return k < 0 ? null : 'en «' + (x.precio ? 'resultado' : x.titulo || 'inicio') + '» dice «…' + x.texto.slice(Math.max(0, k - 50), k + 25).replace(/\s+/g, ' ').trim() + '…»';
  }).filter(Boolean);
  const recorridosGold = [['390 px, con Gold puesto desde el enlace', gold.pasos || []], ['1280 px, con Gold puesto desde el enlace', gold1280.pasos || []], ['390 px, eligiendo «' + OPCION_AMPLIA + '»', elegida ? [elegida] : []]];
  // Autoprueba en el simulador, con la misma lectura: la paráfrasis metida en la
  // nota de la opción y en el porqué de Gold, y la línea de antes en el mensaje
  // del paso, tienen que caer en las dos capas; una frase pegada al precio de la
  // opción, en la que la mira.
  if (!opcion || !opcion.vieja) mal('8A, autoprueba en el simulador: no pude meter la nota de prueba en la opción «' + OPCION_AMPLIA + '»');
  else {
    const v = opcionMal(opcion.vieja);
    if (v.length < 2) mal('8A, autoprueba en el simulador: con «…, con los topes más amplios.» en la nota de la opción, la lectura no lo ve en las dos capas (' + (v.join(' · ') || 'no ve nada') + ')');
    else bien('8A, autoprueba en el simulador: con «…, con los topes más amplios.» en la nota de la opción, la misma lectura ve que no es la nota aprobada y que dice «' + opcion.vieja.boton.match(TOPES_ALTOS)[0] + '»');
  }
  if (!opcion || !opcion.pegada) mal('8A, autoprueba en el simulador: no pude pegar la frase de prueba al precio de la opción «' + OPCION_AMPLIA + '»');
  else if (!opcionMal(opcion.pegada).some((x) => x.startsWith('a la derecha'))) mal('8A, autoprueba en el simulador: con «El máximo en todo» pegado al precio de la opción, la lectura no lo ve (' + (opcionMal(opcion.pegada).join(' · ') || 'no ve nada') + ')');
  else bien('8A, autoprueba en el simulador: con «El máximo en todo» pegado al precio de la opción, la misma lectura ve que a la derecha no dice solo «desde Gs. …»');
  if (!gold || !gold.vieja) mal('8A, autoprueba en el simulador: no pude meter el porqué de prueba en el resultado de Gold');
  else {
    const v = porqueMal(Object.assign({ plan: gold.plan }, gold.vieja));
    if (v.length < 2) mal('8A, autoprueba en el simulador: con «…y los mejores topes.» en el porqué de Gold, la lectura no lo ve en las dos capas (' + (v.join(' · ') || 'no ve nada') + ')');
    else bien('8A, autoprueba en el simulador: con «…y los mejores topes.» en el porqué de Gold, la misma lectura ve que no es el porqué aprobado y que dice «' + gold.vieja.texto.match(TOPES_ALTOS)[0] + '»');
  }
  const autoMensaje = recorridosGold.map(([d, pasos]) => {
    const ubi = pasos.find((x) => x && x.titulo === PASO_UBI);
    if (!ubi || !ubi.vieja) return d + ': no pude meter la línea de prueba en el mensaje del paso';
    const lit = mensajeMal([Object.assign({}, ubi, ubi.vieja)]).length;
    const lista = TOPES_ALTOS.test(ubi.vieja.texto);
    return lit === ubi.vieja.mensajes.length && lit > 0 && lista ? null : d + ': con la línea de antes, el texto aprobado ve ' + lit + ' de ' + ubi.vieja.mensajes.length + ' mensajes y la lista ' + (lista ? 'la ve' : 'no la ve');
  }).filter(Boolean);
  if (autoMensaje.length) mal('8A, autoprueba del mensaje del paso: ' + autoMensaje.join(' · '));
  else bien('8A, autoprueba del mensaje del paso: con «' + GOLD_PARA_VIEJA + '» en el mensaje que sigue a elegir Gold (a 390 px y a 1280 px desde el enlace, y a 390 px eligiendo la opción), la misma lectura ve que no es «' + GOLD_PARA + '» y que dice «' + GOLD_PARA_VIEJA.match(TOPES_ALTOS)[0] + '»');
  opcionMal(opcion).forEach((x) => mal8A.push('/simulador/, la opción «' + OPCION_AMPLIA + '»: ' + x));
  porqueMal(gold).forEach((x) => mal8A.push('/simulador/, porqué del resultado de Gold: ' + x));
  for (const [d, pasos] of recorridosGold) {
    mensajeMal(pasos).forEach((x) => mal8A.push('/simulador/, ' + d + ': ' + x));
    topesEnPasos(pasos).forEach((x) => mal8A.push('/simulador/, ' + d + ', ' + x));
  }
  const mensajesVistos = recorridosGold.map(([, pasos]) => (pasos.find((x) => x && x.titulo === PASO_UBI) || { mensajes: [] }).mensajes.length).reduce((a, b) => a + b, 0);
  if (mal8A.length) mal('8A: Gold «con los topes más altos» o su línea cambió sin decisión (sp-interno#189) · ' + mal8A.join(' · '));
  else bien('8A: los textos de Gold son, literales, los aprobados («' + GOLD_PARA + '» en la tabla del home; «' + GOLD_TAG + '» en la tarjeta de Gold de /planes a 390 px, y en el texto de la cabecera de la tabla, que a 1280 px no se ve; en el simulador, el mensaje del paso que sigue a elegir Gold (' + mensajesVistos + ' lecturas), la nota de la opción «' + OPCION_AMPLIA + '», con solo su precio a la derecha, y el porqué del resultado), y ni el home, ni /planes, ni esa opción, ni ninguna pantalla del recorrido de Gold dicen que tiene los topes más altos');

  // 1A (sp-interno#193): Silver en el simulador, con las mismas lecturas que la
  // 8A. Primero las autopruebas; después lo literal y la segunda capa.
  const OPC_EQ = [OPCION_EQUILIBRIO, OPCION_EQUILIBRIO_NOTA];
  const PQ_SILVER = ['Silver', SILVER_PORQUE, 'respaldo de verdad'];
  if (!opcionEq || !opcionEq.vieja) mal('1A, autoprueba en el simulador: no pude meter la nota de prueba en la opción «' + OPCION_EQUILIBRIO + '»');
  else {
    const v = opcionMal(opcionEq.vieja, ...OPC_EQ);
    if (v.length < 2) mal('1A, autoprueba en el simulador: con la nota de antes del 23/10 en la opción, la lectura no la ve en las dos capas (' + (v.join(' · ') || 'no ve nada') + ')');
    else bien('1A, autoprueba en el simulador: con «' + OPCION_EQUILIBRIO_VIEJA + '» en la nota de la opción, la misma lectura ve que no es la nota aprobada y que dice «' + opcionEq.vieja.boton.match(TOPES_ALTOS)[0] + '»');
  }
  if (!opcionEqPar || !opcionEqPar.vieja) mal('1A, autoprueba en el simulador: no pude meter la paráfrasis en la opción «' + OPCION_EQUILIBRIO + '»');
  else {
    const v = opcionMal(opcionEqPar.vieja, ...OPC_EQ);
    if (TOPES_ALTOS.test(opcionEqPar.vieja.boton) || !v.some((x) => x.startsWith('la nota dice'))) mal('1A, autoprueba en el simulador: con «' + SILVER_PARAFRASIS + '» en la nota, la lectura literal no lo ve o TOPES_ALTOS lo ve (' + (v.join(' · ') || 'no ve nada') + ')');
    else bien('1A, autoprueba en el simulador: con «' + SILVER_PARAFRASIS + '» en la nota, que TOPES_ALTOS no conoce, la lectura literal ve que no es la nota aprobada');
  }
  if (!opcionEq || !opcionEq.pegada) mal('1A, autoprueba en el simulador: no pude pegar la frase de prueba al precio de la opción «' + OPCION_EQUILIBRIO + '»');
  else if (!opcionMal(opcionEq.pegada, ...OPC_EQ).some((x) => x.startsWith('a la derecha'))) mal('1A, autoprueba en el simulador: con «Y topes más altos» pegado al precio de la opción, la lectura no lo ve (' + (opcionMal(opcionEq.pegada, ...OPC_EQ).join(' · ') || 'no ve nada') + ')');
  else bien('1A, autoprueba en el simulador: con «Y topes más altos» pegado al precio de la opción, la misma lectura ve que a la derecha no dice solo «desde Gs. …»');
  if (!silver || !silver.vieja) mal('1A, autoprueba en el simulador: no pude meter el porqué de prueba en el resultado de Silver');
  else {
    const v = porqueMal(Object.assign({ plan: silver.plan }, silver.vieja), ...PQ_SILVER);
    if (v.length < 2) mal('1A, autoprueba en el simulador: con el porqué de antes del 23/10 en el resultado de Silver, la lectura no lo ve en las dos capas (' + (v.join(' · ') || 'no ve nada') + ')');
    else bien('1A, autoprueba en el simulador: con «' + SILVER_PORQUE_VIEJO + '» en el porqué de Silver, la misma lectura ve que no es el porqué aprobado y que dice «' + silver.vieja.texto.match(TOPES_ALTOS)[0] + '»');
  }
  const mal1A = [];
  opcionMal(opcionEq, ...OPC_EQ).forEach((x) => mal1A.push('/simulador/, la opción «' + OPCION_EQUILIBRIO + '»: ' + x));
  const recorridosSilver = [['390 px, con Silver puesto desde el enlace', silver], ['1280 px, con Silver puesto desde el enlace', silver1280], ['390 px, eligiendo «' + OPCION_EQUILIBRIO + '»', silverElegida]];
  for (const [d, res] of recorridosSilver) {
    porqueMal(res, ...PQ_SILVER).forEach((x) => mal1A.push('/simulador/, ' + d + ', porqué del resultado: ' + x));
    topesEnPasos(res.pasos || []).forEach((x) => mal1A.push('/simulador/, ' + d + ', ' + x));
  }
  if (!(silverElegida.pasos || []).some((x) => x.titulo === '¿Qué nivel de cobertura buscás?')) mal1A.push('/simulador/, ' + recorridosSilver[2][0] + ': no pasó por el paso del nivel');
  const pantallasSilver = recorridosSilver.reduce((s, [, res]) => s + (res.pasos || []).length, 0);
  if (mal1A.length) mal('1A: Silver «topes más altos», o su nota o su porqué cambiaron sin decisión (sp-interno#193) · ' + mal1A.join(' · '));
  else bien('1A: los textos de Silver son, literales, los aprobados (la nota de la opción «' + OPCION_EQUILIBRIO + '», con solo su precio a la derecha, y el porqué del resultado en los tres recorridos), y ni esa opción ni ninguna de las ' + pantallasSilver + ' pantallas de los recorridos de Silver dicen que tiene los topes más altos');
}

// ── El pie de las filas con «¿quién?»: la lista cerrada (P3A) ────────────────
// Lo usan «La forma corta (P3A)» (la celda que abre la tarjeta) y «Lo que dicen
// las tarjetas y la hoja, contra una lista cerrada» (todos los pies y la hoja).
// El pie no afirma nada del contrato ni la unidad de Silver y Gold (comité,
// vuelta 3, 17/10): antes se comparaba con la constante y solo rechazaba la
// palabra «contrato», así que un NOTA_UNIDAD que dijera «En Silver y Gold son
// para cada persona.» pasaba en verde.
// Corrección del 18/10 (verificador de accesibilidad): una lista de palabras de
// unidad dejaba pasar «cada persona tiene su propio cupo», «son individuales»,
// «cada integrante tiene los suyos» o «son por afiliado».
// Cierre de la vuelta 3 (verificador, 18/10): la lista se agrandó y siguieron
// pasando «… si querés, son compartidos.», «… porque son por titular.», «… que
// van por cabeza.», «… que son por socio.» y «… que se comparten entre todos.».
// Buscar las palabras que no van no termina nunca: siempre hay otra forma de
// decir la unidad. Ahora se mira al revés: el pie de una fila con «¿quién?» solo
// puede decir oraciones de una LISTA CERRADA, escritas acá como literales (no
// leídas de coverage.js, que es lo que dibuja la página), y tiene que traer la
// pregunta por la unidad. Cualquier otra oración falla, aunque sea inocente: si
// el sitio necesita decir algo nuevo en ese pie, se suma acá a conciencia, con
// su origen. Antes de comparar se normalizan los espacios (también el duro) y
// las comillas; nada más.
// Lo que el sitio muestra hoy en esos pies (relevado en el navegador el 18/10:
// home y /planes a 1280 px, todas las filas con «¿quién?», y la hoja de esos
// servicios a 390 px) son estas tres oraciones y, en la hoja, su cierre fijo.
// No hay otra nota al asesor.
const PIE_APROBADO = {
  // NOTA_UNIDAD de app/coverage.js, como la fijó Arturo el 17/10 (P3A, «Todo A»):
  // el pie del home, el de /planes y la hoja de tomografía, resonancia,
  // psicología y fisioterapia. Es la que tiene que estar.
  PREGUNTA_UNIDAD: 'En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo.',
  // La definición de «Por familia» del pie del home (PIE_QUIEN del 17/10;
  // pieQuien de app/page.jsx). /planes y la hoja no la dicen.
  DEFINICION: 'Por familia: un cupo que comparten todos los del grupo.',
  // La pregunta de la fisioterapia de Gold (G1A, Arturo, 17/10; `notaAsesor` de
  // Fisioterapia en coverage.js): el pie de Fisioterapia en el home y en
  // /planes, y su hoja.
  PREGUNTA_FISIO_GOLD: 'En Gold, preguntale a tu asesor cuántas sesiones de fisioterapia tiene.',
};
// El cierre de toda hoja del celular (app/planes/ComparativaCelular.jsx, el
// último párrafo de enLosTres): vale solo en la hoja, no en el pie.
const CIERRE_HOJA = 'El tiempo de espera arranca el día que te afiliás, no el día que lo necesitás. En el contrato se llama carencia.';
const normal = (t) => String(t || '').replace(/[\s\u00a0\u202f\u2009]+/g, ' ').replace(/[«»“”„‟"]/g, '"').replace(/[‘’‚‛`´]/g, "'").trim();
// Se sacan del principio, una por una, las oraciones aprobadas; tiene que no
// quedar nada. Sin partir en oraciones a mano: un punto adentro de una oración
// aprobada (el cierre de la hoja tiene dos) no la parte.
const pieBien = (p, extra = []) => {
  const lista = Object.values(PIE_APROBADO).concat(extra).map(normal);
  let resto = normal(p);
  const dichas = [];
  for (let o = lista.find((x) => resto === x || resto.startsWith(x + ' ')); resto && o; o = lista.find((x) => resto === x || resto.startsWith(x + ' '))) { dichas.push(o); resto = resto.slice(o.length).trim(); }
  return !!normal(p) && resto === '' && dichas.includes(normal(PIE_APROBADO.PREGUNTA_UNIDAD));
};

// LA LISTA CERRADA DE LO QUE DICEN LAS TARJETAS, LAS HOJAS Y LAS LÍNEAS (P2A y
// P3A). Qué es, cómo se lee, qué superficies y qué anchos cubre y cuáles no: en
// la sección «Lo que dicen las tarjetas y la hoja, contra una lista cerrada»,
// más abajo, que es la que la recorre. Vive acá arriba desde el 18/10 (vuelta 8)
// porque la prueba de las líneas de las tarjetas de /planes en el celular (en
// «La forma corta», `lineaBien`) también compara contra ella.
const TARJETA_APROBADA = {
  // La tabla del home (app/page.jsx, `cmp`): las nueve tarjetas, enteras, sin
  // ninguna espera (P2A). `pie` es el pie de la tarjeta ('' si no tiene). Se
  // leen a 1280 px pasando el mouse y a 360, 390 y 430 px con el dedo, desde
  // cada una de las tres tarjetas de plan. Relevado en el navegador el 18/10
  // sobre la v1 de 8db9016: en el celular dicen, letra por letra, lo mismo que a
  // 1280 (las 81 lecturas), así que es una sola lista para los dos tamaños.
  home: {
    'Resonancia (RM)': {
      Essential: '1 al año para toda la familia. Sin contraste ni sedación.',
      Silver: '1 al año, y no ponés nada.',
      Gold: '1 al año, y no ponés nada.',
      pie: 'Por familia: un cupo que comparten todos los del grupo. En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo.',
    },
    'Tomografía (TAC)': {
      Essential: 'Hasta 2 al año para toda la familia, contando también ecocardiograma y ergometría.',
      Silver: 'Hasta 2 al año, y no ponés nada.',
      Gold: 'Hasta 2 al año, y no ponés nada.',
      pie: 'Por familia: un cupo que comparten todos los del grupo. En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo.',
    },
    'Consultas por especialista': {
      Essential: 'Sin tope en Lister, nuestro centro propio. En la red, hasta 3 por mes por persona.',
      // 20/10/2026, 3A (Arturo, sp-interno#184): sin «por persona» después de «5
      // o 6 al año» hasta que SP conteste #110. Decía «…5 o 6 al año por persona.».
      Silver: 'Sin tope en 23 de las 43 especialidades; en el resto, 5 o 6 al año. Hasta 3 por mes en cada especialidad; después, con copago.',
      Gold: 'Sin tope en 38 de las 43 especialidades. Hasta 3 por mes en cada especialidad; después, con copago.',
      pie: 'Copago: vos pagás una parte y Salud Protegida la otra.',
    },
    'Sesiones de psicología': {
      Essential: 'Hasta 3 al año para toda la familia, en el mismo cupo que otras especialidades.',
      Silver: '5 sesiones al año.',
      Gold: '6 sesiones al año.',
      pie: 'Por familia: un cupo que comparten todos los del grupo. En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo.',
    },
    'Fisioterapia': {
      // 23/10/2026, 190A (Arturo, sp-interno#190): solo la traumatológica
      // (cuadernillo 1.11); lee la línea de coverage.js, como Silver y Gold.
      // Decía «5 sesiones al año para toda la familia.».
      Essential: 'Solo la traumatológica: hasta 5 sesiones al año por familia.',
      Silver: 'Traumatológica, neurológica o después de una cirugía: 15 sesiones al año; respiratoria: otras 5.',
      Gold: 'Traumatológica, neurológica o después de una cirugía, y respiratoria.',
      pie: 'Por familia: un cupo que comparten todos los del grupo. En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo. En Gold, preguntale a tu asesor cuántas sesiones de fisioterapia tiene.',
    },
    'Internación': {
      Essential: '20 días al año para toda la familia, en habitación privada.',
      Silver: '20 días al año por persona, en semi-suite.',
      Gold: '25 días al año por persona, en semi-suite.',
      pie: 'En los tres planes, la habitación tiene cama para un acompañante, según lo que tenga el sanatorio. Qué cambia entre la privada de Essential y la semi-suite de Silver y Gold, preguntale a tu asesor.',
    },
    'Días de terapia intensiva': {
      Essential: 'Hasta 2 días al año por persona.',
      Silver: 'Hasta 5 días al año por persona, con cobertura total.',
      Gold: 'Hasta 6 días al año por persona, con cobertura total.',
      pie: '',
    },
    'Medicamentos internado': {
      Essential: 'Hasta Gs. 350.000 en medicamentos en cada internación.',
      Silver: 'Hasta Gs. 1.000.000 en medicamentos y descartables en cada internación.',
      Gold: 'Hasta Gs. 1.500.000 en medicamentos y descartables en cada internación.',
      pie: 'Tope: la cantidad máxima de veces que podés usar algo en un año, o el monto máximo que cubre el plan.',
    },
    'Remedios en urgencias': {
      Essential: 'En Essential, preguntale a tu asesor cuánto cubre en remedios en urgencias.',
      Silver: 'Hasta Gs. 150.000 en medicamentos en cada urgencia.',
      Gold: 'Hasta Gs. 200.000 en medicamentos en cada urgencia.',
      pie: 'Tope: la cantidad máxima de veces que podés usar algo en un año, o el monto máximo que cubre el plan.',
    },
  },
  // La tabla de /planes en la computadora (app/planes/Planes.jsx, `filasCompu`):
  // las filas con «¿quién?», enteras, a 1280 px pasando el mouse. Las de las
  // filas sin «¿quién?» no están. Acá las esperas van: cada línea suma la de su
  // plan (conEspera, de carencias()). `pie` es el pie de la tarjeta. Relevado el
  // 18/10 sobre la v1 de e4dc862, como la hoja de abajo.
  planes: {
    'Tomografía (TAC)': {
      Essential: 'Hasta 2 al año por familia, junto con ecocardiograma y ergometría. 6 meses de espera.',
      Silver: 'Hasta 2 al año. 4 meses de espera.',
      Gold: 'Hasta 2 al año. 3 meses de espera.',
      pie: 'En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo.',
    },
    'Resonancia (RM)': {
      Essential: '1 al año por familia, sin contraste ni sedación. 1 año de espera.',
      Silver: '1 al año. 5 meses de espera.',
      Gold: '1 al año. 5 meses de espera.',
      pie: 'En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo.',
    },
    'Sesiones de psicología': {
      Essential: 'Hasta 3 al año por familia, en el mismo cupo que otras especialidades.',
      Silver: '5 sesiones al año.',
      Gold: '6 sesiones al año.',
      pie: 'En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo.',
    },
    'Fisioterapia': {
      Essential: 'Solo la traumatológica: hasta 5 sesiones al año por familia. Sin espera.',
      Silver: 'Traumatológica, neurológica o después de una cirugía: 15 sesiones al año; respiratoria: otras 5. 3 meses de espera.',
      Gold: 'Traumatológica, neurológica o después de una cirugía, y respiratoria. 3 meses de espera.',
      pie: 'En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo. En Gold, preguntale a tu asesor cuántas sesiones de fisioterapia tiene.',
    },
  },
  // La hoja de cada fila con «¿quién?» en el celular, abierta desde «Los once
  // servicios, plan por plan» a 390 px, y solo a 390 (app/planes/
  // ComparativaCelular.jsx, `enLosTres`). La línea de un plan es su caja, con
  // « · » entre sus dos bloques (lo que cubre y la espera); `notas`, todo lo
  // demás que dice la hoja, en orden, sin el «‹ Los once servicios» de arriba.
  hoja: {
    'Tomografía (TAC)': {
      Essential: 'Hasta 2 al año por familia, junto con ecocardiograma y ergometría · 6 meses de espera',
      Silver: 'Hasta 2 al año · 4 meses de espera',
      Gold: 'Hasta 2 al año · 3 meses de espera',
      notas: 'En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo. El tiempo de espera arranca el día que te afiliás, no el día que lo necesitás. En el contrato se llama carencia.',
    },
    'Resonancia (RM)': {
      Essential: '1 al año por familia, sin contraste ni sedación · 1 año de espera',
      Silver: '1 al año · 5 meses de espera',
      Gold: '1 al año · 5 meses de espera',
      notas: 'En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo. El tiempo de espera arranca el día que te afiliás, no el día que lo necesitás. En el contrato se llama carencia.',
    },
    'Sesión de psicología': {
      Essential: 'Hasta 3 al año por familia, en el mismo cupo que otras especialidades',
      Silver: '5 sesiones al año',
      Gold: '6 sesiones al año',
      notas: 'En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo. El tiempo de espera arranca el día que te afiliás, no el día que lo necesitás. En el contrato se llama carencia.',
    },
    'Fisioterapia': {
      Essential: 'Solo la traumatológica: hasta 5 sesiones al año por familia · Sin espera',
      Silver: 'Traumatológica, neurológica o después de una cirugía: 15 sesiones al año; respiratoria: otras 5 · 3 meses de espera',
      Gold: 'Traumatológica, neurológica o después de una cirugía, y respiratoria · 3 meses de espera',
      notas: 'En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo. En Gold, preguntale a tu asesor cuántas sesiones de fisioterapia tiene. El tiempo de espera arranca el día que te afiliás, no el día que lo necesitás. En el contrato se llama carencia.',
    },
  },
  // La hoja de un tema de las tarjetas de plan de /planes en el celular, la que
  // se abre al tocar una línea de la tarjeta (ComparativaCelular.jsx,
  // `enLosTres(TEMA[t])`), cuando muestra filas con «¿quién?»: hoy, solo
  // «Tomografía y resonancia». Las otras cuatro (Consultas, Internación, Terapia
  // intensiva y Odontología) no nombran tomografía, resonancia, psicología ni
  // fisioterapia y no están en la lista. La línea de un plan es su caja, con
  // « · » entre sus bloques (el nombre de cada servicio, lo que cubre y la
  // espera: en /planes las esperas van); `notas`, lo demás. Relevada el 18/10
  // sobre la v1 de 8db9016 a 360, 390 y 430 px, abierta desde cada una de las
  // tres tarjetas: dice lo mismo en las nueve.
  tema: {
    'Tomografía y resonancia': {
      Essential: 'Tomografía · Hasta 2 al año por familia, junto con ecocardiograma y ergometría · 6 meses de espera · Resonancia · 1 al año por familia, sin contraste ni sedación · 1 año de espera',
      Silver: 'Tomografía · Hasta 2 al año · 4 meses de espera · Resonancia · 1 al año · 5 meses de espera',
      Gold: 'Tomografía · Hasta 2 al año · 3 meses de espera · Resonancia · 1 al año · 5 meses de espera',
      notas: 'En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo. El tiempo de espera arranca el día que te afiliás, no el día que lo necesitás. En el contrato se llama carencia.',
    },
  },
  // La línea de la tarjeta de cada plan de /planes en el celular que nombra
  // tomografía, resonancia, psicología o fisioterapia (`lines` de plans(),
  // app/quote.js; la dibuja ComparativaCelular.jsx): hoy, «Tomografía y
  // resonancia» en las tres tarjetas. `ve`, lo que se ve (el texto dibujado,
  // sin el oculto para lectores); `oye`, lo que oye el lector (la línea es un
  // botón: su nombre, del ariaSnapshot). Relevada el 18/10 sobre la v1 de
  // 8db9016: igual a 360, 390 y 430 px. Las esperas no van en estas líneas
  // (Arturo, 03/10), y en Silver y Gold nada dice para quién (P3A).
  linea: {
    'Tomografía y resonancia': {
      // 23/10/2026, 185A con el agregado del comité (Arturo, sp-interno#185): la
      // resonancia de Essential lleva su condición también en esta línea, la
      // primera que ve en /planes quien entra desde el celular. Decía «… y 1
      // resonancia/familia/año», sin «(sin contraste ni sedación)».
      Essential: {
        ve: 'Tomografía y resonancia: 2 estudios/familia/año (tomografía, ecocardiograma o ergometría) y 1 resonancia/familia/año (sin contraste ni sedación)',
        oye: 'Tomografía y resonancia: 2 estudios por familia al año (tomografía, ecocardiograma o ergometría) y 1 resonancia por familia al año (sin contraste ni sedación)',
      },
      Silver: {
        ve: 'Tomografía y resonancia: 2 tomografías/¿quién?/año y 1 resonancia/¿quién?/año',
        oye: 'Tomografía y resonancia: 2 tomografías al año, sin confirmar para quién y 1 resonancia al año, sin confirmar para quién',
      },
      Gold: {
        ve: 'Tomografía y resonancia: 2 tomografías/¿quién?/año y 1 resonancia/¿quién?/año',
        oye: 'Tomografía y resonancia: 2 tomografías al año, sin confirmar para quién y 1 resonancia al año, sin confirmar para quién',
      },
    },
  },
};
// Las líneas de las tarjetas de plan que entran en la lista: las que nombran un
// servicio con «¿quién?» (P3A). La misma expresión elige las hojas de tema.
const NOMBRA_DUDA = /tomograf|resonanc|psicolog|fisioterap/i;
// Cómo se lee una línea de la tarjeta de plan. Lo que se ve: el texto de la
// línea que el navegador dibuja (tiene caja), sin el oculto para lectores
// (.sr-solo); la forma corta visible (aria-hidden) sí cuenta. El tema es lo que
// va antes de los dos puntos.
const LEER_LINEA = String((l) => {
  const w = document.createTreeWalker(l, NodeFilter.SHOW_TEXT);
  let ve = '';
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (n.parentElement.closest('.sr-solo')) continue;
    const r = document.createRange();
    r.selectNodeContents(n);
    if (r.getClientRects().length) ve += n.data;
  }
  ve = ve.replace(/[\s   ]+/g, ' ').trim();
  return { tema: ve.split(':')[0], ve };
});
// Lo que oye el lector: el nombre del botón, del ariaSnapshot (lo que expone el
// navegador, no el texto oculto; BITACORA cap. 149).
const oyeDe = async (loc) => oido((await loc.ariaSnapshot()).split('\n')[0]);
// Una línea leída ({ ve, oye }) contra la lista: los hallazgos, vacío si está.
const lineaEnLista = (tema, plan, l, donde = 'línea › ' + plan + ' › ' + tema) => {
  const lista = TARJETA_APROBADA.linea[tema] && TARJETA_APROBADA.linea[tema][plan];
  if (!lista) return [{ tipo: 'línea que no está en la lista', donde, linea: l.ve }];
  const h = [];
  if (normal(l.ve) !== normal(lista.ve)) h.push({ tipo: 'línea nueva', donde: donde + ' › se ve', linea: l.ve, antes: lista.ve });
  if (normal(l.oye) !== normal(lista.oye)) h.push({ tipo: 'línea nueva', donde: donde + ' › se oye', linea: l.oye, antes: lista.oye });
  return h;
};

// ── La forma corta (P3A: regla de escaneo de Arturo del 13/10/2026, elegida ──
// el 17/10/2026 con «Todo A»; components/Corta.jsx). Lo que se escanea dice la
// cifra, para quién y cada cuánto con barras («1/familia/año»), y donde la
// fuente no dice para quién (sp-interno#110), el hueco DUDA («¿quién?») en el
// lugar de «familia», con la misma letra, color y peso, y nunca «persona» hasta
// que SP lo confirme. Las constantes se leen de app/coverage.js, no de un
// literal: si SP contesta y QUIEN_SG pasa a 'persona', la prueba la sigue. Se
// controla: las celdas de tomografía, resonancia, psicología y fisioterapia
// (home y tabla de /planes), con su texto para lectores; la internación con su
// para quién también en el plegable; la ecografía; que «¿quién?» herede el
// estilo de «familia»; que la celda con la duda se abra con un clic, un toque y
// el teclado y NO al pasar el mouse; las líneas de las tarjetas del celular
// (Essential: «2 estudios», no «2 tomografías»), en navy; la lista de los once
// servicios con las condiciones de Essential; que ningún renglón termine en
// «/»; y que la nota no afirme nada del contrato. Probado contra la rama sin la
// P3A (falla) y con ella (pasa).
// Vuelta 2 (Dev, 17/10): las pruebas del botón corren sobre la primera fila que
// dice «¿quién?» (con QUIEN_SG en 'persona', la psicología) y dicen «se salta»
// si no queda ninguna; y la de teclado aprieta Enter y Espacio con la tarjeta
// cerrada, con un caso de teclas mudas que tiene que ver. Medido con QUIEN_SG en
// 'persona' (corren sobre psicología y pasan) y con los dos interruptores en
// 'persona' (dicen «se salta», no ✓).
// Vuelta 3 (comité, 17/10): el celular se mide también a 430 px, y el pie se
// lee como se ve y se rechaza toda afirmación de unidad, no solo «contrato»
// (falla con un NOTA_UNIDAD que dice «En Silver y Gold son para cada persona.»).
console.log('\n── La forma corta (P3A)');
{
  const { DUDA, QUIEN_SG, QUIEN_PSICO } = COV;
  // La tercera columna: los planes cuya celda manda al asesor en lugar de dar
  // un número (la fisioterapia de Gold, G1A): esa la controla su sección.
  const FILAS = [['Tomografía (TAC)', QUIEN_SG, []], ['Resonancia (RM)', QUIEN_SG, []], ['Sesiones de psicología', QUIEN_PSICO, []], ['Fisioterapia', QUIEN_SG, [2]]];
  // Cada celda de una fila, por el nombre (.cmp2-l está en el HTML también en la
  // computadora). La primera fila con ese nombre: /planes tiene otra
  // «Fisioterapia» en las esperas.
  const leerFila = ([sel, nombre]) => {
    const t = document.querySelector(sel);
    if (!t) return null;
    return [...t.querySelectorAll('.cmp2-plan')].map((pl) => {
      const c = [...pl.querySelectorAll('.cmp2-c')].find((x) => ((x.querySelector('.cmp2-l') || {}).textContent || '').trim() === nombre);
      if (!c) return null;
      const k = c.querySelector('.cmp2-v .corta');
      // La forma corta une la cifra y su unidad con espacio duro: se compara con espacio común.
      // La frase es la de la forma corta (su vecina), no el primer .sr-solo de la
      // celda: desde la vuelta 3 ese dice la fila y el plan.
      const sr = k && k.nextElementSibling && k.nextElementSibling.classList.contains('sr-solo') ? k.nextElementSibling.textContent : '';
      return { t: (k ? k.textContent : (c.querySelector('.cmp2-v') || {}).textContent || '').replace(/\u00a0/g, ' '), sr, duda: !!c.querySelector('.cmp2-v .cmp2-duda'), corta: !!k };
    });
  };
  const celdaBien = (c, i, quien) => !!c && c.corta && (i === 0
    ? c.t.includes('/familia/') && c.sr.includes('por familia')
    : c.t.includes('/' + quien + '/') && (quien === DUDA ? c.duda && /sin confirmar para quién/.test(c.sr) && !/persona/i.test(c.t + c.sr) : c.sr.includes('por ' + quien)));
  const terminaEnBarra = async (page, sel) => page.evaluate(([sel, fn]) => {
    const renglones = eval(fn);
    return [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length).map((e) => renglones(e)).filter((ls) => ls.slice(0, -1).some((t) => /\/\s*$/.test(t))).map((ls) => ls.join(' ⏎ '));
  }, [sel, RENGLONES]);

  // 1. Computadora: las celdas, el estilo del hueco y cómo se abre.
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.addInitScript(() => { window.__tracks = []; const d = console.debug; console.debug = (...a) => { if (a[0] === '[track]') window.__tracks.push({ evento: a[1], datos: a[2] }); d.apply(console, a); }; });
  const malas = [];
  for (const ruta of ['/', '/planes/']) {
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
    const sel = ruta === '/' ? '#cartilla' : '#comparar-planes';
    for (const [nombre, quien, aparte] of FILAS) {
      const fila = await page.evaluate(leerFila, [sel, nombre]);
      if (!fila || fila.length !== 3 || !fila.every((c, i) => aparte.includes(i) || celdaBien(c, i, quien))) malas.push(ruta + ' ' + nombre + ': ' + JSON.stringify(fila));
    }
    const int = await page.evaluate(leerFila, [sel, 'Internación']);
    const intEsperada = ['20 días/familia/año', '20 días/persona/año', '25 días/persona/año'];
    if (!int || int.some((c, i) => !c || c.t !== intEsperada[i] || !c.sr.includes(intEsperada[i].split('/')[1] === 'familia' ? 'por familia' : 'por persona'))) malas.push(ruta + ' Internación: ' + JSON.stringify(int));
  }
  // /planes: la ecografía de Essential y el plegable de internación dicen lo mismo que la tabla.
  const eco = await page.evaluate(leerFila, ['#comparar-planes', 'Ecografía']);
  if (!eco || !eco[0] || eco[0].t !== '4/familia/año') malas.push('/planes/ Ecografía: ' + JSON.stringify(eco));
  const pleg = await page.evaluate(() => {
    const f = [...document.querySelectorAll('#detalle-internacion div')].find((d) => /^Tope de días de internación/.test((d.firstElementChild || {}).textContent || '') && d.children.length === 4);
    return f ? [...f.children].slice(1).map((c) => (c.querySelector('.corta') || c).textContent.replace(/\u00a0/g, ' ')) : null;
  });
  if (JSON.stringify(pleg) !== JSON.stringify(['20 días/familia', '20 días/persona', '25 días/persona'])) malas.push('/planes/ plegable, tope de días de internación: ' + JSON.stringify(pleg));
  const menosEspera = await page.evaluate(() => /menos espera/.test(document.body.textContent));
  if (menosEspera) malas.push('/planes/: la tomografía de Gold dice «y menos espera» (regla de esperas del 03/10)');
  // Lo que dicen Silver y Gold: uno o los dos interruptores (QUIEN_SG y QUIEN_PSICO).
  const quienes = [...new Set([QUIEN_SG, QUIEN_PSICO])].map((q) => '«' + q + '»').join(' o ');
  if (malas.length) mal('forma corta: Essential dice «/familia/» y Silver y Gold ' + quienes + ' (la duda se toca), con su frase completa y sin «persona» hasta que SP lo confirme (sp-interno#110) · ' + malas.join(' · '));
  else bien('forma corta en tomografía, resonancia, psicología, fisioterapia, internación y ecografía: «familia» en Essential y ' + quienes + ' en Silver y Gold, con su frase para lectores (home, tabla y plegable de /planes)');
  // Las pruebas del botón «¿quién?» corren sobre la primera fila de FILAS que lo
  // tiene, no sobre una fija (Dev, vuelta 2, 17/10). Antes miraban siempre la
  // tomografía y la resonancia y se condicionaban solo a QUIEN_SG: si SP
  // contestaba esas dos primero, la psicología (QUIEN_PSICO) seguía siendo un
  // botón «¿quién?», nadie lo probaba y el log decía ✓ (medido con QUIEN_SG en
  // 'persona'). Si ninguna fila tiene «¿quién?», lo dicen («se salta»).
  const HAY_DUDA = [QUIEN_SG, QUIEN_PSICO].includes(DUDA);
  const FILA_DUDA = (FILAS.find(([, q]) => q === DUDA) || [''])[0];
  const salta = (m) => console.log('    · se salta: ' + m + ' (ninguna fila dice «' + DUDA + '»)');
  const escRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const celdaDe = (plan) => page.locator('#cartilla .cmp2-plan').nth(plan).locator('.cmp2-c', { has: page.locator('.cmp2-l', { hasText: FILA_DUDA }) });
  // El hueco con la letra, el color y el peso de «familia», más el subrayado punteado.
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  if (HAY_DUDA) {
    const estilo = await page.evaluate((nombre) => {
      const filas = [...document.querySelectorAll('#cartilla .cmp2-plan')];
      const enFila = (pl) => [...pl.querySelectorAll('.cmp2-c')].find((x) => ((x.querySelector('.cmp2-l') || {}).textContent || '').trim() === nombre);
      const fam = enFila(filas[0]) && enFila(filas[0]).querySelector('.corta-r');
      const duda = enFila(filas[1]) && enFila(filas[1]).querySelector('.corta-duda');
      if (!fam || !duda) return null;
      const q = (e) => { const c = getComputedStyle(e); return { familia: c.fontFamily, color: c.color, peso: c.fontWeight, tamaño: c.fontSize }; };
      return { familia: q(fam), duda: q(duda), subrayado: getComputedStyle(duda).borderBottomStyle, texto: duda.textContent };
    }, FILA_DUDA);
    if (!estilo || JSON.stringify(estilo.familia) !== JSON.stringify(estilo.duda) || estilo.subrayado !== 'dotted' || estilo.texto !== DUDA) mal('«' + DUDA + '» no tiene la letra, el color y el peso de «familia», o le falta el subrayado punteado (' + FILA_DUDA + '): ' + JSON.stringify(estilo));
    else bien('«' + DUDA + '» con la misma letra, color y peso que «familia», y subrayado punteado (' + FILA_DUDA + ')');
  } else salta('el estilo del hueco');
  // Se abre con un clic y con el teclado, no al pasar el mouse (ajuste 4 del comité).
  const celdaDuda = celdaDe(1).locator('.cmp2-duda');
  let abre = null;
  if (HAY_DUDA && (await celdaDuda.count())) {
    await page.waitForFunction(() => { const b = document.querySelector('.cmp2-duda'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).catch(() => {});
    await celdaDuda.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(1200);
    const caja = await celdaDuda.boundingBox();
    await page.mouse.move(5, 5);
    await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await page.waitForTimeout(500);
    const conHover = await page.evaluate(() => !!document.querySelector('#cartilla .cmp2-tarjeta'));
    await page.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await page.waitForTimeout(200);
    const conClic = await page.evaluate(() => { const t = document.querySelector('#cartilla .cmp2-tarjeta'); return t ? { planes: t.querySelectorAll('.cmp2-tarjeta-p').length, pie: [...t.querySelectorAll('.cmp2-tarjeta-pie')].map((x) => x.innerText).join(' ') } : null; });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    const cerrada = await page.evaluate(() => !document.querySelector('#cartilla .cmp2-tarjeta'));
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    const conTeclado = await page.evaluate(() => !!document.querySelector('#cartilla .cmp2-tarjeta') && document.activeElement.classList.contains('cmp2-duda'));
    // Enter y Espacio son las teclas de un botón: no pueden cerrar lo que el
    // foco acaba de abrir (vuelta 1 del comité, 17/10: con Enter se cerraba).
    const sigueAbierta = () => page.evaluate(() => !!document.querySelector('#cartilla .cmp2-tarjeta') && document.activeElement.getAttribute('aria-expanded') === 'true');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const conEnter = await sigueAbierta();
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    const conEspacio = await sigueAbierta();
    // Y las teclas abren (Dev, vuelta 2, 17/10): lo de arriba solo miraba que
    // siguiera abierto lo que ya había abierto el foco, y pasaba igual con
    // Enter y Espacio mudos. Con la tarjeta cerrada por Escape (y
    // aria-expanded en «false»), Enter la abre; cerrada otra vez, Espacio también.
    const estado = () => page.evaluate(() => ({ abierta: !!document.querySelector('#cartilla .cmp2-tarjeta'), expandida: document.activeElement.getAttribute('aria-expanded') }));
    const teclas = async () => {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);
      const tras = await estado();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
      const enter = await estado();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);
      await page.keyboard.press('Space');
      await page.waitForTimeout(200);
      const espacio = await estado();
      return { cierraEscape: !tras.abierta && tras.expandida === 'false', abreEnter: enter.abierta && enter.expandida === 'true', abreEspacio: espacio.abierta && espacio.expandida === 'true' };
    };
    const conTeclas = await teclas();
    // El caso que tiene que fallar, en la misma página: Enter y Espacio mudos (el
    // clic de teclado, con detail 0, no llega a React). La prueba los tiene que ver.
    await page.evaluate(() => { window.__mudo = (e) => { if (e.detail === 0 && e.target.closest && e.target.closest('.cmp2-duda')) { e.stopImmediatePropagation(); e.preventDefault(); } }; document.addEventListener('click', window.__mudo, true); });
    const mudas = await teclas();
    await page.evaluate(() => document.removeEventListener('click', window.__mudo, true));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    // Una vez por fila, aunque se abra muchas veces (Shift+Tab puede pasar por la
    // celda de la fila de arriba, que se mide aparte).
    const ev = (await page.evaluate(() => window.__tracks)).filter((x) => x.evento === 'abre_explicacion' && x.datos?.tipo === 'duda' && x.datos?.clave === FILA_DUDA);
    abre = { conHover, conClic, cerrada, conTeclado, conEnter, conEspacio, ...conTeclas, veMudas: !mudas.abreEnter && !mudas.abreEspacio, ev: ev.length };
  }
  // PIE_APROBADO, CIERRE_HOJA, normal y pieBien (la lista cerrada del pie y cómo
  // se lee) están arriba, antes de esta sección: también los usa «Lo que dicen
  // las tarjetas y la hoja, contra una lista cerrada», más abajo.
  const { PREGUNTA_UNIDAD: U, DEFINICION, PREGUNTA_FISIO_GOLD } = PIE_APROBADO;
  const P = DEFINICION + ' ';
  const pieAuto = {
    // Los pies de hoy: tienen que pasar.
    buenos: { home: P + U, homeFisio: P + U + ' ' + PREGUNTA_FISIO_GOLD, planes: U, planesFisio: U + ' ' + PREGUNTA_FISIO_GOLD, conEspacioDuro: P.replace(/ /g, '\u00a0') + U },
    // Tienen que fallar: las cinco del verificador del cierre de la vuelta 3, tres
    // nuevas (la pregunta estirada, una oración sin punto, la de Gold con la
    // unidad) y las de las vueltas anteriores.
    malos: {
      compartidos: P + U + ' En Silver y Gold, preguntale a tu asesor si querés, son compartidos.',
      titular: P + U + ' En Silver y Gold, preguntale a tu asesor cuántos son, porque son por titular.',
      cabeza: P + U + ' En Gold, preguntale a tu asesor cuántas son, que van por cabeza.',
      socio: P + U + ' En Silver y Gold, preguntale a tu asesor cómo se usan, que son por socio.',
      entreTodos: P + U + ' En Silver y Gold, preguntale a tu asesor cuántos son, que se comparten entre todos.',
      preguntaEstirada: P + 'En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo, aunque suelen ser por persona.',
      sinPunto: P + U + ' Van por titular',
      fisioConUnidad: P + U + ' En Gold, preguntale a tu asesor cuántas sesiones de fisioterapia tiene cada integrante.',
      afirma: P + 'En Silver y Gold son para cada persona.',
      afirmaYPregunta: P + 'En Silver y Gold son por persona; preguntale a tu asesor si cambia.',
      contrato: P + 'Según el contrato, en Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo.',
      noPregunta: P.trim(),
      cadaPersona: P + 'En Silver y Gold, cada persona tiene su propio cupo: preguntale a tu asesor si querés saber cuántos son.',
      individuales: P + 'En Silver y Gold son individuales. ' + U,
      integrante: P + 'En Silver y Gold cada integrante tiene los suyos. ' + U,
      afiliado: P + 'En Silver y Gold son por afiliado. ' + U,
      afirmaDespues: P + U + ' Son para cada persona.',
      otraQueAfirma: P + U + ' En Gold, preguntale a tu asesor si son más, porque son por persona.',
      cierreDeLaHojaEnElPie: U + ' ' + CIERRE_HOJA,
    },
  };
  const pieMalos = Object.entries(pieAuto.malos).filter(([, p]) => pieBien(p)).map(([k]) => k);
  const pieBuenosNo = Object.entries(pieAuto.buenos).filter(([, p]) => !pieBien(p)).map(([k]) => k);
  if (!pieBien(U + ' ' + CIERRE_HOJA, [CIERRE_HOJA])) pieBuenosNo.push('hoja con su cierre');
  if (pieMalos.length || pieBuenosNo.length) mal('el detector del pie no distingue los pies de hoy de un pie con otra oración: pasan ' + JSON.stringify(pieMalos) + ', fallan ' + JSON.stringify(pieBuenosNo));
  else bien('el detector del pie (lista cerrada de ' + Object.keys(PIE_APROBADO).length + ' oraciones) deja pasar los pies de hoy y rechaza los ' + Object.keys(pieAuto.malos).length + ' que dicen otra cosa («son compartidos», «por titular», «por cabeza», «por socio», «se comparten entre todos», la pregunta estirada, una oración sin punto, «contrato», un pie sin la pregunta…)');
  if (!HAY_DUDA) salta('la celda que se abre con clic y teclado');
  else if (!abre || abre.conHover || !abre.conClic || abre.conClic.planes !== 3 || !pieBien(abre.conClic.pie) || !abre.cerrada || !abre.conTeclado || !abre.conEnter || !abre.conEspacio || !abre.cierraEscape || !abre.abreEnter || !abre.abreEspacio || !abre.veMudas || abre.ev !== 1) mal('computadora: la celda con «' + DUDA + '» (' + FILA_DUDA + ') tiene que abrir la tarjeta con un clic y con el teclado (Enter o Espacio no la cierran, y con la tarjeta cerrada la abren), no al pasar el mouse, con el pie que manda al asesor sin afirmar nada del contrato, y medirse como «duda»; la prueba tiene que ver las teclas mudas (' + JSON.stringify(abre) + ')');
  else bien('computadora: la celda con «' + DUDA + '» (' + FILA_DUDA + ') abre la tarjeta con un clic y con el teclado; Enter o Espacio no la cierran y, con la tarjeta cerrada, la abren (la prueba ve las teclas mudas); no se abre al pasar el mouse; el pie manda al asesor y se mide como «duda»');
  // Lo que oye el lector de pantalla (vuelta 1 del comité, 17/10). En la
  // computadora la columna de nombres está lejos: el nombre del botón (el que
  // calcula el navegador, no un atributo leído a mano) dice la fila y el plan;
  // la tarjeta abierta es su descripción, y «expandido» lo dice solo la celda
  // que la abrió, no las de los otros planes de la misma fila.
  let lector = null;
  const dudaSilver = celdaDe(1).locator('.cmp2-duda');
  if (HAY_DUDA && (await dudaSilver.count())) {
    await dudaSilver.click();
    await page.waitForTimeout(200);
    lector = await page.evaluate((nombre) => {
      const b = [...document.querySelectorAll('#cartilla .cmp2-duda[aria-expanded="true"]')];
      const d = b[0] && document.getElementById(b[0].getAttribute('aria-describedby') || '');
      return { expandidos: b.length, describe: !!d && d.classList.contains('cmp2-tarjeta') && d.textContent.includes(nombre) };
    }, FILA_DUDA);
    lector.nombre = await page.getByRole('button', { name: new RegExp('^' + escRe(FILA_DUDA) + ', Silver: \\d+ al año, sin confirmar para quién$') }).count();
    lector.sinFila = await page.getByRole('button', { name: /^\d+ al año, sin confirmar para quién$/ }).count();
    await page.keyboard.press('Escape');
  }
  if (!HAY_DUDA) salta('lo que oye el lector en la celda con la duda');
  else if (!lector || lector.expandidos !== 1 || !lector.describe || lector.nombre !== 1 || lector.sinFila) mal('computadora: el lector de pantalla tiene que oír la fila y el plan en la celda con «' + DUDA + '» (' + FILA_DUDA + '), la tarjeta como su descripción, y «expandido» solo en la celda que la abrió (' + JSON.stringify(lector) + ')');
  else bien('computadora: el lector oye «' + FILA_DUDA + ', Silver: …» en la celda con «' + DUDA + '», la tarjeta como descripción y «expandido» solo ahí');
  await page.close();

  // 1b. Los pies de todas las filas con «¿quién?» (home y /planes) y la hoja de
  // esos servicios en el celular se miran más abajo, en «Lo que dicen las
  // tarjetas y la hoja, contra una lista cerrada», con la misma lectura que sus
  // líneas: todos los pies (.cmp2-tarjeta-pie), no solo el primero, y todo el
  // texto de la hoja, no solo los <p> hijos directos (verificador, 18/10).

  // 2. Celular: el toque, las líneas de las tarjetas y la lista de los once.
  // También a 430 (comité, vuelta 3, 17/10): es el piso móvil del proyecto y ahí
  // las columnas de la lista tienen otro ancho y el corte cae en otro lugar.
  for (const width of [360, 390, 430]) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
    const cel = await ctx.newPage();
    await cel.goto(BASE + '/', { waitUntil: 'networkidle' });
    const n = 'móvil ' + width;
    let toque = null;
    const dudaCel = cel.locator('#cartilla .cmp2-plan').nth(1).locator('.cmp2-duda').first();
    if (HAY_DUDA && (await dudaCel.count())) {
      await cel.waitForFunction(() => { const b = document.querySelector('.cmp2-duda'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).catch(() => {});
      await dudaCel.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await cel.waitForTimeout(1200);
      await dudaCel.tap();
      await cel.waitForTimeout(200);
      toque = await cel.evaluate(() => { const t = document.querySelector('#cartilla .cmp2-tarjeta'); if (!t) return null; const r = t.getBoundingClientRect(); return { planes: t.querySelectorAll('.cmp2-tarjeta-p').length, dentro: r.left >= 0 && r.right <= innerWidth + 1 }; });
    }
    if (!HAY_DUDA) salta(n + ': el toque en la celda con la duda');
    else if (!toque || toque.planes !== 3 || !toque.dentro) mal(n + ': tocar la celda con «' + DUDA + '» tiene que abrir la tarjeta del servicio, dentro de la pantalla (' + JSON.stringify(toque) + ')');
    else bien(n + ': tocar la celda con «' + DUDA + '» abre la tarjeta del servicio');
    await cel.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
    // Lo que dice la línea, lo que se ve y lo que oye el lector, contra la lista
    // cerrada (TARJETA_APROBADA.linea, con LEER_LINEA y oyeDe; vuelta 8, 18/10).
    // Reemplaza las expresiones de antes (`!/persona/i`, `!/2 tomografías/`,
    // `/por familia/`, `/sin confirmar para quién/`): eran una lista de lo que no
    // va, y «Son por persona.» se escribe de muchas formas. Acá quedan la forma
    // corta (.corta, con las constantes de coverage.js) y su color.
    const arts = cel.locator('.cmp-cel article');
    const lineas = [];
    for (let i = 0; i < (await arts.count()); i++) {
      const a = arts.nth(i);
      const tr = a.locator('.linea-cel').filter({ hasText: /^Tomografía y resonancia/ }).first();
      const l = await a.evaluate((a) => {
        const l = (re) => [...a.querySelectorAll('.linea-cel')].find((x) => re.test(x.textContent));
        const tr = l(/^Tomografía y resonancia/), it = l(/^Internación/);
        const negrita = it && it.querySelector('b'), corta = it && it.querySelector('.corta');
        return {
          plan: (a.getAttribute('aria-label') || '').replace(/^Plan /, ''),
          t: tr ? [...tr.querySelectorAll('.corta')].map((k) => k.textContent.replace(/\u00a0/g, ' ')) : null,
          navy: !!negrita && !!corta && getComputedStyle(corta).color === getComputedStyle(negrita).color,
        };
      });
      if (await tr.count()) Object.assign(l, await tr.evaluate((e, fn) => eval(fn)(e), LEER_LINEA), { oye: await oyeDe(tr) });
      lineas.push(l);
    }
    const enLista = (l) => (l.ve ? lineaEnLista('Tomografía y resonancia', l.plan, l) : [{ donde: l.plan, linea: 'sin la línea' }]);
    const lineaBien = (l, i) => !!l.t && l.t.length === 2 && l.navy && (i === 0
      ? l.t[0] === '2 estudios/familia/año' && l.t[1] === '1 resonancia/familia/año'
      : l.t[0] === '2 tomografías/' + QUIEN_SG + '/año' && l.t[1] === '1 resonancia/' + QUIEN_SG + '/año') && !enLista(l).length;
    if (lineas.length !== 3 || !lineas.every(lineaBien)) mal(n + ': las líneas «Tomografía y resonancia» de las tarjetas: Essential «2 estudios/familia/año (…)», Silver y Gold «2 tomografías/' + QUIEN_SG + '/año», con la forma corta en navy, y lo que se ve y lo que oye el lector, literal, como en la lista cerrada (TARJETA_APROBADA.linea) · ' + lineas.map((l) => JSON.stringify(l) + enLista(l).map((x) => ' · ' + x.donde + ': «' + x.linea + '»' + (x.antes ? ' (la lista dice «' + x.antes + '»)' : '')).join('')).join(' · '));
    else bien(n + ': las líneas «Tomografía y resonancia» de las tarjetas, en forma corta y en navy, con «2 estudios» en Essential, y lo que se ve y lo que oye el lector, literal, como en la lista cerrada');
    await cel.locator('.cmp-cel button', { hasText: 'Los once servicios, plan por plan' }).tap();
    await cel.waitForTimeout(450);
    const lista = await cel.evaluate(() => {
      const d = document.querySelector('.cmp-cel .hoja[data-abierta="1"]');
      if (!d) return null;
      const o = {};
      for (const b of d.querySelectorAll('.hoja-cuerpo button.fila')) {
        const nombre = b.querySelector('b').textContent.replace(/ ›$/, '');
        // Lo que se ve de cada celda: sin el texto para lectores.
        o[nombre] = [...b.querySelectorAll(':scope > span > span')].map((c) => { const k = c.cloneNode(true); k.querySelectorAll('.sr-solo').forEach((x) => x.remove()); return k.textContent.replace(/\u00a0/g, ' '); });
      }
      return o;
    });
    const esperado = { 'Tomografía (TAC)': '2/familia/año, junto con ecocardiograma y ergometría', 'Resonancia (RM)': '1/familia/año, sin contraste ni sedación', 'Fisioterapia': '5/familia/año, solo traumatológica', 'Sesión de psicología': '3/familia/año, en el mismo cupo que otras especialidades', 'Ecografía': '4/familia/año' };
    const faltan = Object.entries(esperado).filter(([k, v]) => !lista || !lista[k] || !lista[k][0].startsWith(v)).map(([k]) => k + ': ' + JSON.stringify(lista && lista[k]));
    if (faltan.length) mal(n + ': la lista de los once servicios tiene que conservar las condiciones de Essential con la forma corta · ' + faltan.join(' · '));
    else bien(n + ': la lista de los once servicios conserva lo que Essential decía («2/familia/año, junto con ecocardiograma y ergometría»…)');
    const barras = [...await terminaEnBarra(cel, '.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo button.fila > span > span'), ...await terminaEnBarra(cel, '.cmp-cel article .linea-cel')];
    if (barras.length) mal(n + ': un renglón termina en «/» (la forma corta corta antes de la barra) · ' + barras.slice(0, 4).join(' · '));
    else bien(n + ': ningún renglón de la lista ni de las tarjetas termina en «/»');
    await ctx.close();
  }
}

// ── Ningún renglón termina en «/» (QA y writer, vuelta 1, 17/10/2026) ──────
// La regla de la P3A (ningún renglón termina en «/») valía también fuera de la
// forma corta: el plegable de topes de /planes cortaba «Fisioterapia
// traumatológica / ⏎ neurológica…» a 360, 390, 430 y 820 px, y el pie del home,
// «Pa'í Pérez 630 c/ ⏎ Azara» a 360. La barra que hacía de «o» pasó a «o»
// (regla de escaneo) y «c/» se une a la calle con un espacio duro. Se miran los
// rótulos y las celdas de cada fila del plegable abierto (cada celda por
// separado, no la fila entera) y la dirección del pie, en cinco anchos. El detector se prueba antes contra un renglón que termina en «/» (lo
// encuentra) y el mismo texto con espacio duro (no). Falla en la build de
// 56d4d9e y pasa con el cambio.
console.log('\n── Ningún renglón termina en «/» (pie del home y plegable de topes)');
{
  const CON_BARRA = `(r, els) => els.filter((e) => e.getClientRects().length).map((e) => r(e)).filter((ls) => ls.slice(0, -1).some((t) => /\\/\\s*$/.test(t))).map((ls) => ls.join(' ⏎ '))`;
  const malas = [];
  for (const width of [360, 390, 430, 820, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    if (width === 360) {
      const prueba = await page.evaluate(([fn, cb]) => {
        const r = eval(fn), f = eval(cb);
        const caja = (html) => { const d = document.createElement('div'); d.style.cssText = 'width:1ch;font-size:16px'; d.innerHTML = html; document.body.appendChild(d); const x = f(r, [d]).length; d.remove(); return x; };
        return { mala: caja('Pérez 630 c/ Azara'), buena: caja('Pérez 630 c/&nbsp;Azara') };
      }, [RENGLONES, CON_BARRA]);
      if (prueba.mala !== 1 || prueba.buena !== 0) malas.push('el detector no distingue «c/ ⏎ Azara» de «c/ Azara» con espacio duro: ' + JSON.stringify(prueba));
    }
    const pie = await page.evaluate(([fn, cb]) => { const r = eval(fn), f = eval(cb); return f(r, [...document.querySelectorAll('footer *')].filter((e) => !e.children.length && /Azara/.test(e.textContent))); }, [RENGLONES, CON_BARRA]);
    pie.forEach((t) => malas.push(width + ' px, pie del home: ' + t));
    await page.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => { const b = document.querySelector('button[aria-controls="detalle-internacion"]'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).catch(() => {});
    await page.evaluate(() => { const b = document.querySelector('button[aria-controls="detalle-internacion"]'); if (b && b.getAttribute('aria-expanded') === 'false') b.click(); });
    await page.waitForTimeout(500);
    const pleg = await page.evaluate(([fn, cb]) => { const r = eval(fn), f = eval(cb); return f(r, [...document.querySelectorAll('#detalle-internacion div')].filter((d) => d.children.length === 4 && getComputedStyle(d).display === 'grid').flatMap((d) => [...d.children])); }, [RENGLONES, CON_BARRA]);
    pleg.forEach((t) => malas.push(width + ' px, plegable de topes: ' + t));
    await page.close();
  }
  if (malas.length) mal('un renglón termina en «/» · ' + malas.slice(0, 6).join(' · '));
  else bien('ningún renglón del pie del home ni del plegable de topes termina en «/» (360, 390, 430, 820 y 1280 px); el detector distingue el caso malo del bueno');
}

// ── La forma corta, para los lectores de pantalla (P3A; comité, vueltas 1 y 3) ─
// La decisión fija cómo se oye: la forma visible («1/¿quién?/año») va con
// aria-hidden y al lado, un texto oculto (.sr-solo) con la frase completa; sin
// role="img", porque algunos lectores le suman «imagen».
// Vuelta 3 (17/10): la prueba leía el atributo y el texto oculto del DOM, no lo
// que expone el navegador. Con `.corta + .sr-solo{display:none}` en el CSS el
// lector no oía nada y todo seguía en verde (lo midió el revisor de Dev). Ahora,
// para cada forma corta visible (no inerte ni escondida para el lector) se
// cuenta su frase en el árbol de accesibilidad (ariaSnapshot) de su celda, su
// botón o su línea: tiene que estar al menos tantas veces como formas cortas la
// llevan ahí, y la forma con barras no se oye nunca. Del DOM queda solo lo que
// el árbol no dice: el role. Se mira el home y /planes en la computadora (con
// los plegables abiertos) y en el celular (con la lista de los once abierta).
// El detector se prueba antes, en la misma página, contra cinco formas mal
// armadas (sin aria-hidden, con role="img", sin frase, con la frase escondida
// con display:none, y escondida al lado de otra celda que la contiene) y dos
// bien armadas. Falla en una copia del sitio con la frase silenciada en el CSS,
// en todo el sitio o en una sola fila del plegable, y pasa en la rama.
// Corrección del 18/10: se contaba en todo el body, y con las tres celdas de
// «Tope de días de internación» del plegable mudas seguía en verde, porque
// «20 días por familia» está dentro de «20 días por familia al año».
console.log('\n── La forma corta, para los lectores de pantalla (P3A)');
{
  const BARRAS = /\d[\d.,]*(?:\s\S+)?\/(?:familia|persona|año|mes|evento|¿quién\?)/;
  const escRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Cada frase se cuenta en lo que oye el lector de SU contenedor (la celda, el
  // botón o la línea que trae la forma corta), no en todo el body (corrección
  // del 18/10, verificador de accesibilidad): una frase que es el comienzo de
  // otra que se oye en otra parte de la página («20 días por familia» del
  // plegable, dentro de «20 días por familia al año» de la tabla de arriba) se
  // daba por oída aunque su celda estuviera muda.
  const CONTENEDOR = '[role="cell"], [role="button"], button, a, .cmp2-v, .linea-cel, li, p';
  const revisar = async (pg, sel) => {
    const esperado = await pg.evaluate(([sel, cont]) => {
      document.querySelectorAll('[data-qa-corta]').forEach((e) => e.removeAttribute('data-qa-corta'));
      let n = 0;
      return [...document.querySelectorAll(sel + ' .corta')]
        .filter((k) => k.getClientRects().length && !k.parentElement.closest('[inert], [aria-hidden="true"]'))
        .map((k) => {
          const sr = k.nextElementSibling;
          const c = k.closest(cont) || k.parentElement;
          if (!c.hasAttribute('data-qa-corta')) c.setAttribute('data-qa-corta', String(n++));
          return { t: k.textContent, frase: sr && sr.classList.contains('sr-solo') ? sr.textContent.trim() : '', role: k.getAttribute('role'), c: c.getAttribute('data-qa-corta') };
        });
    }, [sel, CONTENEDOR]);
    const malas = [];
    const porContenedor = {};
    for (const e of esperado) {
      if (e.role) malas.push(e.t + ': role=' + e.role);
      if (!e.frase) { malas.push(e.t + ': sin su frase'); continue; }
      const f = (porContenedor[e.c] = porContenedor[e.c] || {});
      f[e.frase] = (f[e.frase] || 0) + 1;
    }
    for (const [c, frases] of Object.entries(porContenedor)) {
      const leido = oido(await pg.locator('[data-qa-corta="' + c + '"]').ariaSnapshot());
      for (const [f, n] of Object.entries(frases)) {
        const hay = (leido.match(new RegExp('(?<![\\d,])' + escRe(f), 'g')) || []).length;
        if (hay < n) malas.push('«' + f + '»: el lector la oye ' + hay + ' de ' + n + ' veces en su celda, que dice ' + JSON.stringify(leido.slice(0, 70)));
      }
    }
    const barra = oido(await pg.locator(sel).first().ariaSnapshot()).match(BARRAS);
    if (barra) malas.push('el lector oye la forma con barras: «' + barra[0] + '»');
    return { total: esperado.length, contenedores: Object.keys(porContenedor).length, malas };
  };
  const malas = [];
  let revisadas = 0, contenedores = 0;
  const pagina = async (pg, donde) => {
    const r = await revisar(pg, 'body');
    revisadas += r.total;
    contenedores += r.contenedores;
    if (!r.total) malas.push(donde + ': ninguna forma corta visible');
    r.malas.forEach((m) => malas.push(donde + ' · ' + m));
  };
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  // Los casos que tienen que fallar y el que no, armados en la misma página.
  await page.evaluate(() => {
    const d = document.createElement('div');
    d.id = 'qa-corta';
    d.innerHTML = '<p id="qa-c1"><span class="corta">1/familia/año</span><span class="sr-solo">1 por familia al año</span></p>'
      + '<p id="qa-c2"><span class="corta" aria-hidden="true" role="img">2/familia/año</span><span class="sr-solo">2 por familia al año</span></p>'
      + '<p id="qa-c3"><span class="corta" aria-hidden="true">3/familia/año</span></p>'
      + '<p id="qa-c4"><span class="corta" aria-hidden="true">4/familia/año</span><span class="sr-solo" style="display:none">4 por familia al año</span></p>'
      + '<p id="qa-c5"><span class="corta" aria-hidden="true">5/familia/año</span><span class="sr-solo">5 por familia al año</span></p>'
      // La frase escondida al lado de otra celda que la contiene (tiene que
      // fallar) y la misma, bien armada (tiene que pasar).
      + '<div id="qa-c6" role="table" aria-label="qa"><div role="row"><div role="cell">20 días por familia al año</div><div role="cell"><span class="corta" aria-hidden="true">20 días/familia</span><span class="sr-solo" style="display:none">20 días por familia</span></div></div></div>'
      + '<div id="qa-c7" role="table" aria-label="qa"><div role="row"><div role="cell">20 días por familia al año</div><div role="cell"><span class="corta" aria-hidden="true">20 días/familia</span><span class="sr-solo">20 días por familia</span></div></div></div>';
    document.body.appendChild(d);
  });
  const caso = async (id) => (await revisar(page, '#' + id)).malas.length;
  const prueba = { sinAriaHidden: await caso('qa-c1'), conRole: await caso('qa-c2'), sinFrase: await caso('qa-c3'), fraseEscondida: await caso('qa-c4'), bienArmada: await caso('qa-c5'), mudaAlLadoDeOtra: await caso('qa-c6'), alLadoDeOtraBien: await caso('qa-c7') };
  await page.evaluate(() => document.getElementById('qa-corta').remove());
  if (!prueba.sinAriaHidden || !prueba.conRole || !prueba.sinFrase || !prueba.fraseEscondida || prueba.bienArmada || !prueba.mudaAlLadoDeOtra || prueba.alLadoDeOtraBien) mal('el detector de la forma corta para lectores no distingue el caso malo del bueno: ' + JSON.stringify(prueba));
  else bien('el detector, sobre el árbol de accesibilidad de cada celda, encuentra las cinco formas cortas mal armadas (sin aria-hidden, con role="img", sin frase, con la frase escondida y muda al lado de otra celda que la contiene) y deja pasar las bien armadas');
  await pagina(page, 'home 1280');
  await page.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => { const b = document.querySelector('button[aria-controls="detalle-internacion"]'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).catch(() => {});
  for (const id of ['detalle-especialidades', 'detalle-internacion']) await page.click(`button[aria-controls="${id}"]`);
  await page.waitForTimeout(500);
  await pagina(page, '/planes 1280 con los plegables abiertos');
  await page.close();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const cel = await ctx.newPage();
  await cel.goto(BASE + '/', { waitUntil: 'networkidle' });
  await pagina(cel, 'home 390');
  await cel.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  await cel.locator('.cmp-cel button', { hasText: 'Los once servicios, plan por plan' }).tap();
  await cel.waitForTimeout(450);
  await pagina(cel, '/planes 390 con la lista abierta');
  await ctx.close();
  if (malas.length) mal('cada forma corta visible se oye con su frase, sin las barras y sin role (árbol de accesibilidad) · ' + malas.slice(0, 6).join(' · '));
  else bien(revisadas + ' formas cortas visibles en ' + contenedores + ' celdas, botones y líneas (home y /planes, computadora y celular): el lector oye cada frase en su celda y ninguna forma con barras');
}

// ── Lo que oye el lector: cada valor con su fila y su plan ──────────────────
// (comité, vueltas 2 y 3, 17/10/2026). Se mide lo que expone el navegador (el
// árbol de accesibilidad, con ariaSnapshot), no el texto oculto (cap. 149).
// - En la computadora, la tabla del home y la de /planes. La página va columna
//   por columna y la columna de nombres está lejos. La vuelta 2 le dio la fila y
//   el plan a la celda del asesor; la vuelta 3, a todas: el lector oía «2» suelto
//   en terapia intensiva, y «Sin topeen casi todas». Cada columna tiene que
//   decir, en orden, cada fila con su plan delante («Días de terapia intensiva,
//   Essential: 2») y algo después, y nada suelto antes de la primera. La celda
//   del asesor dice la constante ASESOR (no un texto escrito a mano), y el link
//   de cada columna, de qué plan es («Ver mi precio en Gold»). En el celular la
//   fila está al lado y el plan arriba de la tarjeta: ahí no se repite.
//   Corrección del 18/10 (W1): en la banda de esperas de /planes cada valor dice
//   que es una espera («Resonancia, Essential: 1 año de espera»); se oía «1 año»
//   y se entendía como un cupo.
// - Los dos plegables de /planes son tablas para el lector (roles de tabla), sin
//   celdas mudas (una `cell` sin nombre falla; corrección del 18/10):
//   cada valor está en la columna de su plan y en la fila de lo que es, y la
//   fisioterapia de Gold y la urgencia de Essential mandan al asesor en la
//   columna de su plan. Antes eran divs y se oía «… Preguntale a tu asesor Gs.
//   150.000 Gs. 200.000» sin saber de qué plan.
// - En el celular, cada fila de «Los once servicios» se nombra con cada valor y
//   su plan, sin «›» ni barras, con la plata en «guaraníes», sin «·», y con
//   «preguntale a tu asesor» en minúscula y después de dos puntos, nunca pegado
//   a la palabra de antes («remedios Preguntale»).
// - Ningún botón ni link del home ni de /planes se nombra con «Gs.».
// Cada detector se prueba antes contra un caso que tiene que fallar y uno que no.
// Falla en la build de 02c733a y pasa con el cambio.
console.log('\n── Lo que oye el lector: cada valor con su fila y su plan');
{
  const { ASESOR } = COV;
  const SERVICIOS = COV.coverage().map((s) => s.name);
  const malas = [];
  // Una columna de la computadora: cada fila, en orden, con «Fila, Plan:» delante.
  const conFilas = (leido, filas, plan) => {
    const pos = [];
    let desde = 0;
    const faltan = [];
    for (const f of filas) {
      const pref = f + ', ' + plan + ':';
      const j = leido.indexOf(pref, desde);
      if (j < 0) { faltan.push(f); continue; }
      pos.push([f, j, j + pref.length]);
      desde = j + pref.length;
    }
    // Lo que dice cada fila (si dos se llaman igual, como «Fisioterapia» en
    // /planes, la primera: la del servicio, no la de su espera).
    const lista = pos.map(([f, , fin], k) => [f, leido.slice(fin, k + 1 < pos.length ? pos[k + 1][1] : undefined).replace(/Ver mi precio.*$/, '').trim()]);
    const valores = {};
    for (const [f, v] of lista) if (!(f in valores)) valores[f] = v;
    const vacias = lista.filter(([, v]) => !v).map(([f]) => f);
    const antes = pos.length ? leido.slice(0, pos[0][1]) : leido;
    const sueltos = /\d/.test(antes.replace(/Gs\.\s*[\d.]+/, '')) || /asesor/i.test(antes);
    return { faltan, vacias, sueltos, valores, lista };
  };
  const columnaBien = (r) => !r.faltan.length && !r.vacias.length && !r.sueltos;
  // La banda de esperas de /planes (corrección del 18/10, W1): el título «Cuánto
  // esperás para usarlo» no llega al lector en las columnas, y varias filas se
  // llaman casi igual que un servicio («Resonancia, Essential: 1 año», al lado de
  // «Resonancia (RM), Essential: 1 por familia al año»). Cada valor de la banda
  // tiene que decir que es una espera («1 año de espera», «Sin espera»): el
  // valor, antes de la coma de su nota (un «sin espera» de la nota, «los de
  // rutina, sin espera», no dice nada de los 3 meses de al lado).
  const esperasMudas = (r, desde) => r.lista.slice(desde).filter(([, v]) => v !== '—' && !/\bespera\b/i.test(v.split(/\s,\s/)[0])).map(([f, v]) => f + ': ' + v);
  // Las tablas que expone el navegador, con sus filas y los roles de cada celda.
  const tablas = (snap) => {
    const out = [];
    let t = null, fila = null;
    for (const l of snap.split('\n')) {
      const m = /^\s*- '?([a-z]+)(?: "((?:[^"\\]|\\.)*)")?/.exec(l);
      if (!m) continue;
      const [, rol, nom] = m;
      const nombre = nom !== undefined ? JSON.parse('"' + nom + '"') : '';
      if (rol === 'table') { t = { nombre, filas: [] }; out.push(t); fila = null; }
      else if (rol === 'row' && t) { fila = []; t.filas.push(fila); }
      else if (['columnheader', 'rowheader', 'cell'].includes(rol) && fila) fila.push([rol, nombre]);
    }
    return out;
  };
  const roles = (f) => f.map(([r]) => r).join(',');
  // Y ninguna celda muda: una `cell` sin nombre no le dice nada al lector
  // (corrección del 18/10, V1).
  const tablaBien = (t) => t.filas.length > 1 && roles(t.filas[0]) === 'columnheader,columnheader,columnheader,columnheader'
    && t.filas[0].slice(1).map(([, n]) => n).join(',') === 'Essential,Silver,Gold'
    && t.filas.slice(1).every((f) => roles(f) === 'rowheader,cell,cell,cell' && f.every(([, n]) => n.trim()));
  // «Fisioterapia. Essential: …. Silver: …. Gold: ….», sin «›», barras, «·» ni «Gs.».
  const nombreBien = (n, servicio) => n.startsWith(servicio + '. Essential: ') && /\. Silver: .+\. Gold: .+\.$/.test(n)
    && !/[›/·]/.test(n) && !/Gs\./.test(n) && !/Preguntale/.test(n) && !/\b24 h\b/.test(n.slice(servicio.length));
  // ariaSnapshot escribe «- button "…"» o, si el nombre trae «: », «- 'button "…"': …».
  const nombres = (snap, rol = 'button|link') => [...snap.matchAll(new RegExp("- '?(?:" + rol + ') "((?:[^"\\\\]|\\\\.)*)"', 'g'))].map((m) => JSON.parse('"' + m[1] + '"'));

  // Los detectores, contra un caso que tiene que fallar y uno que no.
  const filas = ['Resonancia (RM)', 'Días de terapia intensiva', 'Remedios en urgencias'];
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const d = document.createElement('div');
    d.id = 'qa-lector';
    d.innerHTML = '<div id="qa-grilla-mala"><div><div>Topes</div><div>Essential</div><div>Silver</div><div>Gold</div></div><div><div>Fisioterapia</div><div>5</div><div>15</div><div>Preguntale a tu asesor</div></div></div>'
      + '<div id="qa-grilla-buena" role="table" aria-label="Topes"><div role="row"><div role="columnheader">Topes</div><div role="columnheader">Essential</div><div role="columnheader">Silver</div><div role="columnheader">Gold</div></div><div role="row"><div role="rowheader">Fisioterapia</div><div role="cell">5</div><div role="cell">15</div><div role="cell">Preguntale a tu asesor</div></div></div>'
      + '<div id="qa-grilla-muda" role="table" aria-label="Topes"><div role="row"><div role="columnheader">Topes</div><div role="columnheader">Essential</div><div role="columnheader">Silver</div><div role="columnheader">Gold</div></div><div role="row"><div role="rowheader">Fisioterapia</div><div role="cell">5</div><div role="cell"><span aria-hidden="true">15</span></div><div role="cell">Preguntale a tu asesor</div></div></div>'
      + '<p id="qa-boton-malo"><button aria-label="Parto. Essential: hasta Gs. 350 mil">x</button></p><p id="qa-boton-bueno"><button aria-label="Parto. Essential: hasta 350 mil guaraníes">x</button></p>';
    document.body.appendChild(d);
  });
  const prueba = {
    columnaVieja: columnaBien(conFilas('Essential desde Gs. 220.000 1 por familia al año 2 Remedios en urgencias, Essential: preguntale a tu asesor Ver mi precio', filas, 'Essential')),
    columnaNueva: columnaBien(conFilas('Essential desde Gs. 220.000 Resonancia (RM), Essential: 1 por familia al año Días de terapia intensiva, Essential: 2 Remedios en urgencias, Essential: Preguntale a tu asesor Ver mi precio en Essential', filas, 'Essential')),
    grillaSinRoles: tablas(await page.locator('#qa-grilla-mala').ariaSnapshot()).some(tablaBien),
    grillaConRoles: tablas(await page.locator('#qa-grilla-buena').ariaSnapshot()).every(tablaBien),
    grillaConCeldaMuda: tablas(await page.locator('#qa-grilla-muda').ariaSnapshot()).some(tablaBien),
    esperaComoCupo: esperasMudas(conFilas('Resonancia (RM), Essential: 1 por familia al año Consultas y urgencias, Essential: Sin espera Resonancia, Essential: 1 año Ver mi precio en Essential', ['Resonancia (RM)', 'Consultas y urgencias', 'Resonancia'], 'Essential'), 1).length,
    esperaConNotaQueDiceEspera: esperasMudas(conFilas('Resonancia (RM), Essential: 1 por familia al año Análisis de laboratorio, Essential: 3 meses , los de rutina, sin espera Ver mi precio en Essential', ['Resonancia (RM)', 'Análisis de laboratorio'], 'Essential'), 1).length,
    esperaDicha: esperasMudas(conFilas('Resonancia (RM), Essential: 1 por familia al año Consultas y urgencias, Essential: Sin espera Análisis de laboratorio, Essential: 3 meses de espera , los de rutina, sin espera Resonancia, Essential: 1 año de espera Ver mi precio en Essential', ['Resonancia (RM)', 'Consultas y urgencias', 'Análisis de laboratorio', 'Resonancia'], 'Essential'), 1).length,
    filaVuelta1: nombreBien('Fisioterapia › 5 por familia al año Sin espera 15 al año, sin confirmar para quién 3 meses de espera Preguntale a tu asesor 3 meses de espera', 'Fisioterapia'),
    filaVuelta2: nombreBien('Urgencia 24 h. Essential: Consulta 24 h · remedios Preguntale a tu asesor, sin espera. Silver: Consulta 24 h · remedios hasta 150 mil guaraníes cada vez que vas a urgencias, sin espera. Gold: Consulta 24 h · remedios hasta 200 mil guaraníes cada vez que vas a urgencias, sin espera.', 'Urgencia 24 h'),
    filaConGs: nombreBien('Parto o cesárea. Essential: con el bebé en nursery, medicamentos hasta Gs. 350 mil, 1 año de espera. Silver: x. Gold: y.', 'Parto o cesárea'),
    filaBuena: nombreBien('Urgencia 24 h. Essential: consulta 24 horas, remedios: preguntale a tu asesor, sin espera. Silver: consulta 24 horas, remedios hasta 150 mil guaraníes cada vez que vas a urgencias, sin espera. Gold: consulta 24 horas, remedios hasta 200 mil guaraníes cada vez que vas a urgencias, sin espera.', 'Urgencia 24 h'),
    botonConGs: nombres(await page.locator('#qa-boton-malo').ariaSnapshot()).some((n) => /Gs\./.test(n)),
    botonBueno: nombres(await page.locator('#qa-boton-bueno').ariaSnapshot()).some((n) => /Gs\./.test(n)),
  };
  await page.evaluate(() => document.getElementById('qa-lector').remove());
  if (prueba.columnaVieja || !prueba.columnaNueva || prueba.grillaSinRoles || !prueba.grillaConRoles || prueba.grillaConCeldaMuda || !prueba.esperaComoCupo || !prueba.esperaConNotaQueDiceEspera || prueba.esperaDicha || prueba.filaVuelta1 || prueba.filaVuelta2 || prueba.filaConGs || !prueba.filaBuena || !prueba.botonConGs || prueba.botonBueno) malas.push('los detectores no distinguen el caso malo del bueno: ' + JSON.stringify(prueba));

  // 1. La computadora: cada columna de la tabla del home y de /planes.
  const conGs = [];
  let esperasOidas = 0;
  for (const [ruta, sel] of [['/', '#cartilla'], ['/planes/', '#comparar-planes']]) {
    if (ruta !== '/') await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
    const nombresFila = await page.$$eval(sel + ' .cmp2-lab .cmp2-c', (cs) => cs.map((c) => c.textContent.trim()));
    // Dónde empieza la banda de esperas (solo en /planes).
    const desdeEsperas = await page.$$eval(sel + ' .cmp2-lab .cmp2-grupo-y-fila', (gs) => gs.findIndex((g) => /Cuánto esperás/.test((g.querySelector('.cmp2-gt') || {}).textContent || '')));
    if (ruta !== '/' && desdeEsperas < 0) malas.push(ruta + ': no encuentro la banda «Cuánto esperás para usarlo»');
    const cols = page.locator(sel + ' .cmp2-plan');
    for (let i = 0; i < 3; i++) {
      const plan = (await cols.nth(i).locator('.cmp2-nombre').textContent()).trim();
      const snap = await cols.nth(i).ariaSnapshot();
      const r = conFilas(oido(snap), nombresFila, plan);
      if (!columnaBien(r)) malas.push(ruta + ' columna de ' + plan + ': ' + JSON.stringify({ faltan: r.faltan.slice(0, 4), vacias: r.vacias, sueltos: r.sueltos }));
      if (plan === 'Gold' && r.valores['Fisioterapia'] !== ASESOR) malas.push(ruta + ' fisioterapia de Gold: ' + JSON.stringify(r.valores['Fisioterapia']));
      if (plan === 'Essential' && r.valores['Remedios en urgencias'] !== ASESOR) malas.push(ruta + ' remedios en urgencias de Essential: ' + JSON.stringify(r.valores['Remedios en urgencias']));
      if (!nombres(snap, 'link').includes('Ver mi precio en ' + plan)) malas.push(ruta + ' columna de ' + plan + ': el link no dice de qué plan es');
      if (desdeEsperas >= 0) {
        const mudas = esperasMudas(r, desdeEsperas);
        if (mudas.length) malas.push(ruta + ' columna de ' + plan + ': la espera no dice que es una espera · ' + mudas.slice(0, 3).join(' · '));
        else if (plan === 'Essential') esperasOidas = r.lista.slice(desdeEsperas).length;
      }
    }
    nombres(await page.locator('body').ariaSnapshot()).filter((n) => /Gs\./.test(n)).forEach((n) => conGs.push(ruta + ' 1280: ' + n));
  }
  // 2. Los plegables de /planes, abiertos: tablas para el lector.
  await page.waitForFunction(() => { const b = document.querySelector('button[aria-controls="detalle-internacion"]'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).catch(() => {});
  for (const id of ['detalle-especialidades', 'detalle-internacion']) await page.click(`button[aria-controls="${id}"]`);
  await page.waitForTimeout(500);
  const plegables = {};
  for (const id of ['detalle-especialidades', 'detalle-internacion']) {
    const ts = tablas(await page.locator('#' + id).ariaSnapshot());
    plegables[id] = ts.length;
    if (!ts.length || !ts.every(tablaBien)) malas.push(id + ': no es una tabla para el lector (' + JSON.stringify(ts.map((t) => ({ t: t.nombre, filas: t.filas.length, roles: t.filas.slice(0, 2).map(roles) }))) + ')');
    for (const t of ts) {
      const planes = t.filas[0].map(([, n]) => n);
      for (const f of t.filas.slice(1)) {
        f.forEach(([rol, n], j) => {
          if (rol !== 'cell' || n !== ASESOR) return;
          const fila = f[0][1], plan = planes[j];
          const esperado = /^Fisioterapia/.test(fila) ? 'Gold' : /^En (?:urgencia|estudios y procedimientos)/.test(fila) ? 'Essential' : null;
          if (plan !== esperado) malas.push(id + ': «' + ASESOR + '» en «' + fila + '» cae en la columna ' + plan);
        });
      }
    }
  }
  const asesorEnPlegable = (await page.locator('#detalle-internacion').ariaSnapshot()).split('\n').filter((l) => l.includes('cell "' + ASESOR + '"')).length;
  if (asesorEnPlegable !== 4) malas.push('detalle-internacion: tendrían que ser 4 celdas «' + ASESOR + '» (las dos de fisioterapia de Gold, y la urgencia y el Cuadro 2 de Essential), hay ' + asesorEnPlegable);
  await page.close();

  // 3. El celular: la tabla del home no repite la fila (está al lado) y la lista de los once.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const cel = await ctx.newPage();
  await cel.goto(BASE + '/', { waitUntil: 'networkidle' });
  const repetidas = async () => {
    const out = [];
    const cols = cel.locator('#cartilla .cmp2-plan');
    for (let i = 0; i < 3; i++) {
      const plan = (await cols.nth(i).locator('.cmp2-nombre').textContent()).trim();
      (await cols.nth(i).ariaSnapshot()).split('\n').filter((l) => /^\s*- text:/.test(l) && l.includes(', ' + plan + ':')).forEach((l) => out.push(l.trim()));
    }
    return out;
  };
  // Caso que tiene que fallar: la fila y el plan a la vista del lector también en el celular.
  await cel.addStyleTag({ content: '.cmp2 .cmp2-fila{display:inline-block !important}' }).then((h) => h.evaluate((e) => { e.id = 'qa-fila-cel'; }));
  const conRepeticion = (await repetidas()).length;
  await cel.evaluate(() => document.getElementById('qa-fila-cel').remove());
  const rep = await repetidas();
  if (!conRepeticion || rep.length) malas.push('celular: la fila y el plan se repiten para el lector, al lado del nombre de la fila (' + JSON.stringify({ casoMalo: conRepeticion, rep: rep.slice(0, 2) }) + ')');
  nombres(await cel.locator('body').ariaSnapshot()).filter((n) => /Gs\./.test(n)).forEach((n) => conGs.push('/ 390: ' + n));
  await cel.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  await cel.locator('.cmp-cel button', { hasText: 'Los once servicios, plan por plan' }).tap();
  await cel.waitForTimeout(450);
  const snapLista = await cel.locator('.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo').ariaSnapshot();
  const deLaLista = nombres(snapLista, 'button');
  for (const s of SERVICIOS) {
    const n = deLaLista.find((x) => x.startsWith(s + '.'));
    if (!n || !nombreBien(n, s)) malas.push('lista, ' + s + ': ' + JSON.stringify(n || null));
  }
  const fisio = deLaLista.find((x) => x.startsWith('Fisioterapia')) || '';
  if (!fisio.includes('Gold: ' + minus(ASESOR))) malas.push('lista, fisioterapia de Gold: ' + JSON.stringify(fisio));
  const urg = deLaLista.find((x) => x.startsWith('Urgencia 24 h')) || '';
  if (!urg.includes('Essential: consulta 24 horas, remedios: ' + minus(ASESOR) + ',')) malas.push('lista, urgencia de Essential: ' + JSON.stringify(urg));
  nombres(await cel.locator('body').ariaSnapshot()).filter((n) => /Gs\./.test(n)).forEach((n) => conGs.push('/planes 390: ' + n));
  await ctx.close();
  if (conGs.length) malas.push('nombres de botones o links con «Gs.»: ' + conGs.slice(0, 3).join(' | '));
  if (malas.length) mal('el lector tiene que oír de qué fila y de qué plan es cada valor (tablas de la computadora, plegables y lista de los once), con la plata en guaraníes · ' + malas.slice(0, 6).join(' · '));
  else bien('el lector oye cada valor con su fila y su plan en las tablas del home y de /planes («Días de terapia intensiva, Essential: 2»; la celda del asesor dice ASESOR), en /planes las ' + esperasOidas + ' esperas de cada columna se oyen como espera («1 año de espera»), los links dicen de qué plan son, los plegables son tablas (' + Object.values(plegables).reduce((a, b) => a + b, 0) + ') sin celdas mudas, con el asesor en la columna de su plan, el celular no repite la fila, y las ' + deLaLista.length + ' filas de la lista se nombran con su plan, en guaraníes y sin «·»; los detectores distinguen el caso malo del bueno');
}

// ── La fisioterapia de Gold va al asesor (G1A, Arturo, 17/10/2026, «Todo A») ─
// La fuente se contradice (sp-interno#50): gold.json dice 20 + 5 sesiones y la
// grilla, 10 + 3. Mientras SP no lo aclare, la celda de Gold manda al asesor
// por el número en la tabla del home, la de /planes, la lista de los once
// servicios y los dos renglones de fisioterapia del plegable, y los cuatro
// dicen lo mismo (ASESOR de coverage.js); en la lista, con la letra y el peso
// de la forma corta de al lado. La tarjeta y la hoja (lo que se lee) no le dan a
// Gold ningún número ni repiten el pedido: la línea de Gold dice qué cubre y la
// nota manda al asesor (comité, vuelta 1). La celda es texto, no botón:
// solo «¿quién?» es botón (P3A); la tarjeta se abre desde el nombre del
// servicio, como la cesárea de Gold de la 2A (comité, vuelta 1, 17/10).
// Probado contra la rama con la P3A sin la G1A (falla) y con ella (pasa), y
// contra la rama con la celda como botón (falla).
// Vuelta 2 (comité, 17/10): «sin número» es cualquier dígito que no sea una
// espera (antes solo se rechazaban 10 y 20, y «más 5 respiratorias», el número
// de Gold que la fuente también da de dos maneras, pasaba en verde). Y la línea
// de Gold no nombra un tipo de fisioterapia que la de Silver no nombre, ni al
// revés: la vuelta 1 le dio a Gold «más respiratorias» y dejó a Silver en «15
// sesiones al año», y parecía que solo Gold tenía respiratoria. Los dos
// detectores se prueban antes contra un caso que tiene que fallar y uno que no.
// Falla en la build de f40cc02 (la tarjeta de /planes y la hoja) y pasa con el
// cambio.
console.log('\n── La fisioterapia de Gold (G1A)');
{
  const { ASESOR } = COV;
  const nota = 'En Gold, preguntale a tu asesor cuántas sesiones de fisioterapia tiene.';
  const malas = [];
  // Lo que no es un número de sesiones: las esperas («3 meses de espera», «Sin
  // espera»). Sin \b: textContent pega la línea y su espera («respiratoria3 meses»).
  const conNumero = (t) => /\d/.test((t || '').replace(/(?:\d+ (?:días|meses)|1 año) de espera|sin espera|\d+ días de afiliarte/gi, ''));
  const TIPOS = [['traumatológica', /traumatol/i], ['neurológica', /neurol/i], ['después de una cirugía', /cirug|quirúrg/i], ['respiratoria', /respirat/i]];
  const tipos = (t) => TIPOS.filter(([, re]) => re.test(t || '')).map(([n]) => n).join(', ');
  const mismosTipos = (silver, gold) => tipos(silver) === tipos(gold);
  // Y con la misma forma (comité, vuelta 3, 17/10): las dos arrancan por los
  // tipos, en el mismo orden. Una arrancaba por «15 sesiones al año (…)» y la
  // otra por «Traumatológica…», y el ojo tenía que reacomodarlas.
  const orden = (t) => TIPOS.map(([n, re]) => [n, (t || '').search(re)]).filter(([, i]) => i >= 0).sort((a, b) => a[1] - b[1]).map(([n]) => n).join(', ');
  const arranque = (t) => (t || '').replace(/^\s*(?:Essential|Silver|Gold)/, '').trim();
  // Essential nombra un solo tipo y arranca por él (190A, Arturo, 23/10/2026):
  // «Solo la traumatológica: hasta 5 sesiones…» (cuadernillo 1.11). Decía «Hasta
  // 5 sesiones al año por familia» y, al lado de los tipos de Silver y Gold, se
  // leía «cubre lo mismo».
  const essentialBien = (t) => tipos(t) === 'traumatológica' && /^solo la traumatol/i.test(arranque(t));
  const mismaForma = (silver, gold) => /^(?:traumatol|neurol)/i.test(arranque(silver)) && /^(?:traumatol|neurol)/i.test(arranque(gold)) && orden(silver) === orden(gold);
  const autoprueba = {
    formaDeLaVuelta2: mismaForma('15 sesiones al año (traumatológica, neurológica o después de una cirugía), más 5 respiratorias.', 'Traumatológica, neurológica o después de una cirugía, y también respiratoria.'),
    formaNueva: mismaForma('SilverTraumatológica, neurológica o después de una cirugía: 15 sesiones al año; respiratoria: otras 5.3 meses de espera', 'GoldTraumatológica, neurológica o después de una cirugía, y respiratoria.3 meses de espera'),
    numeroQueVuelve: conNumero('GoldTraumatológica, neurológica o después de una cirugía, más 5 respiratorias3 meses de espera'),
    lineaDeHoy: conNumero('Traumatológica, neurológica o después de una cirugía, y también respiratoria. 3 meses de espera.'),
    asimetriaDeLaVuelta1: mismosTipos('15 sesiones al año. 3 meses de espera.', 'Traumatológica, neurológica o después de una cirugía, más respiratorias. 3 meses de espera.'),
    simetria: mismosTipos('15 sesiones al año (traumatológica, neurológica o después de una cirugía), más 5 respiratorias.', 'Traumatológica, neurológica o después de una cirugía, y también respiratoria.'),
    essentialVieja: essentialBien('EssentialHasta 5 sesiones al año por familia.Sin espera'),
    essentialNueva: essentialBien('EssentialSolo la traumatológica: hasta 5 sesiones al año por familia.Sin espera'),
  };
  if (!autoprueba.numeroQueVuelve || autoprueba.lineaDeHoy || autoprueba.asimetriaDeLaVuelta1 || !autoprueba.simetria || autoprueba.formaDeLaVuelta2 || !autoprueba.formaNueva || autoprueba.essentialVieja || !autoprueba.essentialNueva) malas.push('los detectores de número, de simetría y de forma no distinguen el caso malo del bueno: ' + JSON.stringify(autoprueba));
  const lineasBien = (x) => !!x && !!x.silver && !!x.gold && !conNumero(x.gold) && !/asesor/i.test(x.gold) && mismosTipos(x.silver, x.gold) && mismaForma(x.silver, x.gold) && essentialBien(x.essential);
  const visible = ([sel, nombre]) => {
    const t = document.querySelector(sel);
    if (!t) return null;
    return [...t.querySelectorAll('.cmp2-plan')].map((pl) => {
      const c = [...pl.querySelectorAll('.cmp2-c')].find((x) => ((x.querySelector('.cmp2-l') || {}).textContent || '').trim() === nombre);
      if (!c) return null;
      const v = c.querySelector('.cmp2-v').cloneNode(true);
      v.querySelectorAll('.sr-solo').forEach((x) => x.remove());
      return { t: v.textContent.replace(/ /g, ' ').trim(), boton: !!c.querySelector('.cmp2-v .cmp2-duda') };
    });
  };
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const [ruta, sel] of [['/', '#cartilla'], ['/planes/', '#comparar-planes']]) {
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
    const f = await page.evaluate(visible, [sel, 'Fisioterapia']);
    if (!f || !f[2] || f[2].t !== ASESOR || f[2].boton || /\d/.test(f[2].t)) malas.push(ruta + ' tabla (texto, no botón): ' + JSON.stringify(f && f[2]));
  }
  // La tarjeta que abre el nombre del servicio: sin número para Gold y con la línea del asesor.
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => { const b = document.querySelector('.cmp2-srv'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).catch(() => {});
  const srvFisio = page.locator('#cartilla .cmp2-lab .cmp2-srv', { hasText: 'Fisioterapia' });
  let tarjeta = null;
  if (await srvFisio.count()) {
    await srvFisio.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(1200);
    const caja = await srvFisio.boundingBox();
    await page.mouse.move(5, 5);
    await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await page.waitForTimeout(200);
    tarjeta = await page.evaluate(() => { const t = document.querySelector('#cartilla .cmp2-tarjeta'); if (!t) return null; const p = [...t.querySelectorAll('.cmp2-tarjeta-p')]; return { essential: p[0] ? p[0].lastElementChild.textContent : null, silver: p[1] ? p[1].lastElementChild.textContent : null, gold: p[2] ? p[2].lastElementChild.textContent : null, pie: (t.querySelector('.cmp2-tarjeta-pie') || {}).textContent || '' }; });
    await page.mouse.move(5, 5);
  }
  if (!lineasBien(tarjeta) || !tarjeta.pie.includes(nota)) malas.push('home, tarjeta (Gold sin número y con los mismos tipos que Silver): ' + JSON.stringify(tarjeta));
  // La tarjeta de /planes en la computadora: sin número para Gold y sin repetir
  // el pedido (comité, vuelta 1, 17/10: «Preguntale a tu asesor» salía tres
  // veces, una como línea de Gold que no decía qué preguntar).
  const VECES = /preguntale a tu asesor/gi;
  await page.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => { const b = document.querySelector('.cmp2-srv'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).catch(() => {});
  const srvPlanes = page.locator('#comparar-planes .cmp2-lab .cmp2-srv', { hasText: 'Fisioterapia' });
  let tarjetaPlanes = null;
  if (await srvPlanes.count()) {
    await srvPlanes.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(800);
    const caja = await srvPlanes.boundingBox();
    await page.mouse.move(5, 5);
    await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await page.waitForTimeout(200);
    tarjetaPlanes = await page.evaluate(() => { const t = document.querySelector('#comparar-planes .cmp2-tarjeta'); if (!t) return null; const p = [...t.querySelectorAll('.cmp2-tarjeta-p')]; return { essential: p[0] ? p[0].lastElementChild.textContent : null, silver: p[1] ? p[1].lastElementChild.textContent : null, gold: p[2] ? p[2].lastElementChild.textContent : null, pie: (t.querySelector('.cmp2-tarjeta-pie') || {}).textContent || '', todo: t.textContent }; });
    await page.mouse.move(5, 5);
  }
  if (!lineasBien(tarjetaPlanes) || !tarjetaPlanes.pie.includes(nota) || (tarjetaPlanes.todo.match(VECES) || []).length > 2) malas.push('/planes/ tarjeta (Gold sin número y con los mismos tipos que Silver): ' + JSON.stringify(tarjetaPlanes && { silver: tarjetaPlanes.silver, gold: tarjetaPlanes.gold, pie: tarjetaPlanes.pie }));
  // El plegable de /planes: los dos renglones de fisioterapia.
  const pleg = await page.evaluate(() => [...document.querySelectorAll('#detalle-internacion div')].filter((d) => d.children.length === 4 && /^Fisioterapia/.test((d.firstElementChild || {}).textContent || '')).map((d) => d.children[3].textContent.trim()));
  if (pleg.length !== 2 || pleg.some((t) => t !== ASESOR)) malas.push('/planes/ plegable: ' + JSON.stringify(pleg));
  await page.close();
  // La lista de los once servicios y la hoja del servicio, en el celular.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const cel = await ctx.newPage();
  await cel.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  await cel.locator('.cmp-cel button', { hasText: 'Los once servicios, plan por plan' }).tap();
  await cel.waitForTimeout(450);
  // En la lista, la celda de Gold dice ASESOR con la letra y el peso de la
  // forma corta de Silver de al lado: la duda, con el mismo peso que el dato
  // (lámina 84; comité, vuelta 1: iba en la letra de lectura, Inter 400).
  const lista = await cel.evaluate(() => {
    const b = [...document.querySelectorAll('.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo button.fila')].find((x) => /^Fisioterapia/.test(x.querySelector('b').textContent));
    if (!b) return null;
    const celdas = b.querySelectorAll(':scope > span > span');
    const c = celdas[2].cloneNode(true);
    c.querySelectorAll('.sr-solo, i').forEach((x) => x.remove());
    const w = document.createTreeWalker(celdas[2], NodeFilter.SHOW_TEXT);
    let n = w.nextNode();
    while (n && !n.data.trim()) n = w.nextNode();
    const silver = celdas[1].querySelector('.corta');
    // La familia que usa el navegador (la primera; los respaldos pueden variar) y el peso.
    const q = (e) => { const k = getComputedStyle(e); return k.fontFamily.split(',')[0].trim() + ' ' + k.fontWeight; };
    return { t: c.textContent.trim(), gold: n ? q(n.parentElement) : null, silver: silver ? q(silver) : null };
  });
  if (!lista || lista.t !== ASESOR || !lista.silver || lista.gold !== lista.silver) malas.push('lista de los once (texto y peso de la forma corta de Silver): ' + JSON.stringify(lista));
  await cel.locator('.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo button.fila', { hasText: 'Fisioterapia' }).tap();
  await cel.waitForTimeout(450);
  // La hoja se lee: la línea de Gold dice qué cubre, sin número, y el pedido
  // al asesor va en las notas, sin repetirse.
  const hoja = await cel.evaluate(() => { const d = document.querySelector('.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo'); if (!d) return null; const b = [...d.querySelectorAll('.sq')]; return { essential: b[0] ? b[0].textContent : null, silver: b[1] ? b[1].textContent : null, gold: b[2] ? b[2].textContent : null, notas: d.textContent }; });
  if (!lineasBien(hoja) || !hoja.notas.includes(nota) || (hoja.notas.match(VECES) || []).length > 2) malas.push('hoja del servicio (Gold sin número y con los mismos tipos que Silver): ' + JSON.stringify(hoja && { silver: hoja.silver, gold: hoja.gold }));
  await ctx.close();
  if (malas.length) mal('la fisioterapia de Gold tiene que mandar al asesor, sin número, y decir lo mismo en la tabla del home y de /planes, la lista y el plegable (sp-interno#50); en la tarjeta y la hoja, Silver y Gold nombran los mismos tipos con la misma forma · ' + malas.join(' · '));
  else bien('la fisioterapia de Gold manda al asesor («' + ASESOR + '») en la tabla del home y de /planes, la lista (con el peso de la forma corta) y el plegable; la tarjeta y la hoja, sin ningún número para Gold, con los mismos tipos que Silver, en el mismo orden y arrancando por el tipo, y sin repetir el pedido; los detectores distinguen el caso malo del bueno');
}

// ── Las condiciones de Essential, a la vista en las tablas (185A y 190A) ────
// Arturo, 23/10/2026 («Adelante con tus sugerencias»; sp-interno#185 y #190).
// La celda de Essential decía «2/familia/año», «1/familia/año» y «5/familia/año»
// y lo que cambia la elección quedaba a un toque: que los 2 se comparten con el
// ecocardiograma y la ergometría (cuadernillo 3.2), que la resonancia es sin
// contraste ni sedación (4.2) y que la fisioterapia es solo la traumatológica
// (1.11). Ahora la celda lo dice debajo de la forma corta (`notaCelda` de
// coverage.js: la misma `cola` de la lista de los once), en el home y en
// /planes, en la computadora y en las tarjetas del home en el celular. Se mira:
// - que esas tres filas, y solo esas, lleven nota, en la columna de Essential y
//   con el texto literal (lista cerrada: una nota nueva tiene que entrar acá);
// - que la nota vaya debajo del valor y adentro de la celda, y que la fila siga
//   alineada con la columna de nombres (820, 1024, 1280 y 1440 px): la tabla son
//   columnas sueltas y solo la altura fija las alinea; con la nota en el renglón,
//   la de tomografía a 820 px ocupaba tres renglones y se salía de los 48 px;
// - en el celular (360, 390 y 430 px), que la nota no le coma el ancho al nombre
//   de la fila (en el renglón del valor, «Tomografía (TAC)» quedaba en 0 px);
// - que el lector la oiga después del valor y separada por una coma.
// La regla de «debajo, adentro y alineada» se prueba antes contra cuatro celdas
// que tienen que fallar y dos que no. Falla en la build de 35165a7 (no hay
// ninguna nota) y pasa con el cambio.
console.log('\n── Las condiciones de Essential, a la vista en las tablas (185A y 190A)');
{
  const NOTA = { 'Tomografía (TAC)': 'junto con ecocardiograma y ergometría', 'Resonancia (RM)': 'sin contraste ni sedación', 'Fisioterapia': 'solo traumatológica' };
  const OIDO = { 'Tomografía (TAC)': '2 por familia al año, junto con ecocardiograma y ergometría', 'Resonancia (RM)': '1 por familia al año, sin contraste ni sedación', 'Fisioterapia': '5 por familia al año, solo traumatológica' };
  const malas = [];
  const srv = Object.fromEntries(COV.coverage().map((s) => [s.name, s]));
  for (const [s, t] of Object.entries(NOTA)) if (!COV.notaCelda || COV.notaCelda(srv[s], 0) !== t) malas.push('coverage.js, ' + s + ': ' + JSON.stringify(COV.notaCelda ? COV.notaCelda(srv[s], 0) : 'sin notaCelda'));
  // Debajo del valor, adentro de la celda y, en la computadora, a la altura de su
  // fila en la columna de nombres; en el celular, sin comerle el nombre.
  const bienPuesta = (c, fila, compu) => !!c && !!c.notaCaja
    && c.notaCaja[0] >= c.valorCaja[1] - 1
    && c.notaCaja[0] >= c.celda[0] - 0.5 && c.notaCaja[1] <= c.celda[1] + 0.5
    && c.notaCaja[2] >= c.celda[2] - 0.5 && c.notaCaja[3] <= c.celda[3] + 0.5
    && (compu ? !!fila && Math.abs(fila[0] - c.celda[0]) < 1 && Math.abs(fila[1] - c.celda[1]) < 1 : c.nombreAncho >= 0.4 * c.ancho);
  const caja = (v, n, cel, nombre = 169, ancho = 282) => ({ valorCaja: v, notaCaja: n, celda: cel, nombreAncho: nombre, ancho });
  const auto = {
    enElRenglon: bienPuesta(caja([4, 27], [7, 44, 10, 170], [0, 48, 0, 177]), [0, 48], true),
    seSale: bienPuesta(caja([6, 27], [29, 61, 10, 170], [0, 48, 0, 177]), [0, 48], true),
    desalineada: bienPuesta(caja([6, 27], [29, 61, 10, 170], [0, 64, 0, 177]), [0, 48], true),
    nombreComido: bienPuesta(caja([0, 22], [24, 40, 0, 282], [0, 63, 0, 282], 0, 282), null, false),
    buenaCompu: bienPuesta(caja([6, 27], [29, 61, 10, 170], [0, 64, 0, 177]), [0, 64], true),
    buenaCel: bienPuesta(caja([0, 22], [24, 40, 0, 282], [0, 63, 0, 282]), null, false),
  };
  if (auto.enElRenglon || auto.seSale || auto.desalineada || auto.nombreComido || !auto.buenaCompu || !auto.buenaCel) malas.push('la regla no distingue la celda mala de la buena: ' + JSON.stringify(auto));
  // Cada celda, columna por columna (la primera fila con ese nombre: en /planes,
  // «Fisioterapia» también es una espera), y la caja de cada fila en la columna
  // de nombres.
  const LEER = String((sel) => {
    const t = document.querySelector(sel);
    if (!t) return null;
    const ve = (e) => { if (!e) return null; const k = e.cloneNode(true); k.querySelectorAll('.sr-solo').forEach((x) => x.remove()); return k.textContent.replace(/ /g, ' ').trim(); };
    const celdas = {};
    for (const pl of t.querySelectorAll('.cmp2-plan')) {
      const plan = pl.querySelector('.cmp2-nombre').textContent.trim();
      for (const c of pl.querySelectorAll('.cmp2-c')) {
        const fila = ((c.querySelector('.cmp2-l') || {}).textContent || '').trim();
        if (celdas[fila] && celdas[fila][plan]) continue;
        const v = c.querySelector('.cmp2-v'), n = c.querySelector('.cmp2-bajo');
        const rc = c.getBoundingClientRect(), rv = v.getBoundingClientRect(), rn = n && n.getBoundingClientRect();
        (celdas[fila] = celdas[fila] || {})[plan] = { nota: ve(n), celda: [rc.top, rc.bottom, rc.left, rc.right], valorCaja: [rv.top, rv.bottom], notaCaja: rn ? [rn.top, rn.bottom, rn.left, rn.right] : null, nombreAncho: c.querySelector('.cmp2-l').getBoundingClientRect().width, ancho: rc.width };
      }
    }
    const lab = {};
    for (const c of t.querySelectorAll('.cmp2-lab .cmp2-c')) { const n = c.textContent.trim(); if (!lab[n]) { const r = c.getBoundingClientRect(); lab[n] = [r.top, r.bottom]; } }
    return { celdas, lab };
  });
  const revisar = (r, donde, compu) => {
    if (!r) { malas.push(donde + ': no encuentro la tabla'); return; }
    for (const [fila, planes] of Object.entries(r.celdas)) {
      for (const [plan, c] of Object.entries(planes)) {
        const debe = plan === 'Essential' ? NOTA[fila] : undefined;
        if (!debe) { if (c.nota) malas.push(donde + ', ' + fila + ', ' + plan + ': una nota que no está en la lista («' + c.nota + '»)'); continue; }
        if (c.nota !== debe) malas.push(donde + ', ' + fila + ', Essential: ' + JSON.stringify(c.nota) + ' en vez de «' + debe + '»');
        else if (!bienPuesta(c, r.lab[fila], compu)) malas.push(donde + ', ' + fila + ', Essential: la nota no va debajo, adentro y alineada · ' + JSON.stringify({ valor: c.valorCaja.map(Math.round), nota: c.notaCaja && c.notaCaja.map(Math.round), celda: c.celda.map(Math.round), fila: r.lab[fila] && r.lab[fila].map(Math.round), nombre: Math.round(c.nombreAncho) }));
      }
    }
  };
  for (const w of [820, 1024, 1280, 1440]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    for (const [ruta, sel] of [['/', '#cartilla'], ['/planes/', '#comparar-planes']]) {
      await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
      revisar(await page.evaluate(`(${LEER})(${JSON.stringify(sel)})`), ruta + ' ' + w, true);
      if (w === 1280) {
        // Lo que oye el lector en la columna de Essential: el valor, una coma y la nota.
        const leido = oido(await page.locator(sel + ' .cmp2-plan').first().ariaSnapshot()).replace(/\s+,/g, ',');
        for (const [fila, t] of Object.entries(OIDO)) if (!leido.includes(fila + ', Essential: ' + t)) malas.push(ruta + ' lector, ' + fila + ': «' + (leido.split(fila + ', Essential:')[1] || '').slice(0, 70).trim() + '»');
      }
    }
    await page.close();
  }
  for (const w of [360, 390, 430]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true });
    const cel = await ctx.newPage();
    await cel.goto(BASE + '/', { waitUntil: 'networkidle' });
    revisar(await cel.evaluate(`(${LEER})('#cartilla')`), '/ ' + w, false);
    await ctx.close();
  }
  if (malas.length) mal('las condiciones de Essential van a la vista en las tablas, debajo de la forma corta (185A y 190A) · ' + malas.slice(0, 6).join(' · '));
  else bien('tomografía «junto con ecocardiograma y ergometría», resonancia «sin contraste ni sedación» y fisioterapia «solo traumatológica», debajo de la forma corta de Essential en la tabla del home y en la de /planes (820, 1024, 1280 y 1440 px) y en las tarjetas del home (360, 390 y 430), sin salirse de la celda, con la fila alineada y oídas después del valor; ninguna otra celda lleva nota; la regla distingue la celda mala de la buena');
}

// ── «/evento» en medicamentos y remedios (E3A, Arturo, 17/10/2026) ──────────
// Donde la fuente dice «por evento», la celda lo dice en forma corta, con los
// millones enteros («Gs. 1,5 millones/evento», nunca «1,5 mill.»), y el lector
// de pantalla oye «guaraníes» y cuándo («cada vez que te internan»). Va en la
// tabla del home y la de /planes (medicamentos internado y los remedios en
// urgencias de Silver y Gold) y en la lista de los once servicios. El parto
// queda con «hasta» y sin «/evento». A 360 px el nombre de la fila puede bajar
// de renglón, pero entre palabras, y el monto no se sale de la celda. Probado
// contra la rama sin la E3A (falla) y con ella (pasa).
console.log('\n── «/evento» en medicamentos y remedios (E3A)');
{
  const MED = ['Gs. 350 mil/evento', 'Gs. 1 millón/evento', 'Gs. 1,5 millones/evento'];
  const REM = [null, 'Gs. 150 mil/evento', 'Gs. 200 mil/evento'];
  const malas = [];
  const fila = ([sel, nombre]) => [...document.querySelectorAll(sel + ' .cmp2-plan')].map((pl) => {
    const c = [...pl.querySelectorAll('.cmp2-c')].find((x) => ((x.querySelector('.cmp2-l') || {}).textContent || '').trim() === nombre);
    const k = c && c.querySelector('.cmp2-v .corta');
    // La frase de la forma corta es su vecina (el primer .sr-solo de la celda dice la fila y el plan).
    return k ? { t: k.textContent.replace(/ /g, ' '), sr: (k.nextElementSibling || {}).textContent || '' } : null;
  });
  const bien3 = (f, esperado, cuando) => f.length === 3 && esperado.every((e, i) => e === null || (f[i] && f[i].t === e && /guaraníes/.test(f[i].sr) && !/Gs\./.test(f[i].sr) && f[i].sr.includes(cuando)));
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const [ruta, sel] of [['/', '#cartilla'], ['/planes/', '#comparar-planes']]) {
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
    const med = await page.evaluate(fila, [sel, 'Medicamentos internado']);
    const rem = await page.evaluate(fila, [sel, 'Remedios en urgencias']);
    if (!bien3(med, MED, 'cada vez que te internan')) malas.push(ruta + ' medicamentos: ' + JSON.stringify(med));
    if (!bien3(rem, REM, 'cada vez que vas a urgencias')) malas.push(ruta + ' remedios: ' + JSON.stringify(rem));
    if (await page.evaluate(() => /\d mill\./.test(document.body.textContent))) malas.push(ruta + ': queda «mill.»');
  }
  await page.close();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true });
  const cel = await ctx.newPage();
  await cel.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  await cel.locator('.cmp-cel button', { hasText: 'Los once servicios, plan por plan' }).tap();
  await cel.waitForTimeout(450);
  const lista = await cel.evaluate(() => {
    const o = {};
    for (const b of document.querySelectorAll('.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo button.fila')) {
      // Cada columna, renglón por renglón: `pre` va en su propio renglón (vuelta 3).
      o[b.querySelector('b').textContent.replace(/ ›$/, '')] = [...b.querySelectorAll(':scope > span > span')].map((c) => [...c.children].filter((x) => x.tagName !== 'I').map((x) => { const k = x.cloneNode(true); k.querySelectorAll('.sr-solo').forEach((y) => y.remove()); return k.textContent.replace(/ /g, ' '); }).join(' ⏎ '));
    }
    return o;
  });
  const m = lista['Medicamentos en internación'] || [], u = lista['Urgencia 24 h'] || [], pa = lista['Parto o cesárea'] || [];
  if (!MED.every((e, i) => m[i] === e)) malas.push('lista, medicamentos: ' + JSON.stringify(m));
  if (!REM.every((e, i) => e === null || (u[i] || '') === 'Consulta 24 h · remedios ⏎ ' + e)) malas.push('lista, urgencias: ' + JSON.stringify(u));
  if (pa.length !== 3 || pa.some((t) => /\/evento/.test(t) || !/hasta Gs\./.test(t))) malas.push('lista, parto (queda con «hasta», sin «/evento»): ' + JSON.stringify(pa));
  // A 360 px, en las tarjetas del home: el nombre baja entre palabras y el monto entra.
  await cel.goto(BASE + '/', { waitUntil: 'networkidle' });
  const nombres = await cel.evaluate((fn) => {
    const renglones = eval(fn);
    return [...document.querySelectorAll('#cartilla .cmp2-plan .cmp2-c')].filter((c) => /^(Medicamentos internado|Remedios en urgencias)$/.test(((c.querySelector('.cmp2-l') || {}).textContent || '').trim())).map((c) => {
      const l = c.querySelector('.cmp2-l .cmp2-srv'), k = c.querySelector('.cmp2-v .corta');
      const ls = renglones(l);
      return { nombre: l.textContent, renglones: ls, enteras: ls.map((x) => x.trim()).join(' ') === l.textContent.trim(), dentro: !k || k.getBoundingClientRect().right <= c.getBoundingClientRect().right + 0.5 };
    });
  }, RENGLONES);
  const rotos = nombres.filter((x) => !x.enteras || !x.dentro);
  if (nombres.length !== 6 || rotos.length) malas.push('360 px, nombre o monto: ' + JSON.stringify(rotos.length ? rotos : nombres.length));
  await ctx.close();
  if (malas.length) mal('«/evento»: medicamentos y remedios de Silver y Gold en forma corta, con los millones enteros y «guaraníes» para el lector, en las tablas y la lista; el parto con «hasta» · ' + malas.join(' · '));
  else bien('«/evento» en medicamentos y remedios (tablas del home y /planes, y la lista), con los millones enteros y «guaraníes» para el lector; el parto con «hasta»; a 360 px el nombre baja entre palabras');
}

// ── Las esperas llevan su condición (comité, vuelta 3, 17/10/2026) ─────────
// Un número de espera fuera de su fila perdía la condición que el resto del
// sitio ya dice:
// - la lista «Los once servicios» del celular nombra «Parto o cesárea» e
//   «Internación» y daba a la cesárea de Gold los 10 meses que la 2A le sacó
//   (sp-interno#116), y a toda internación de Silver y Gold los 2 meses de la
//   aguda (la programada no tiene espera escrita, #82);
// - la tabla de esperas de /planes en la computadora no traía ninguna nota: el
//   laboratorio de Essential decía «3 meses» sin los de rutina, las cirugías no
//   decían «una al año por familia» y el parto de Gold, nada de la cesárea;
// - el plegable «Internación, maternidad y topes» decía para Gold «300 días» de
//   maternidad, sin la cesárea (vuelta 3, corrección, 18/10);
// - en la hoja del celular, la nota de la cesárea y la de la internación
//   programada quedaban abajo, en gris, debajo de los tres planes.
// Corrección del 18/10 (verificador de datos): la prueba armaba lo que esperaba
// con los mismos campos de coverage.js que dibujan la página (`cuando`,
// `alAsesor`, `notaCorta`) y, con el campo vacío, se salteaba la comprobación:
// sacando `cuando` y `alAsesor` volvía el defecto y la prueba seguía en verde,
// con un ✓ de texto fijo. «Una prueba no compara la página con la constante que
// la arma» (cap. 151). Ahora las reglas están escritas acá y rechazan la clase
// de error en lo que se ve y en lo que oye el lector, haya o no campo:
// - en «Parto o cesárea», Gold nombra la cesárea con ASESOR, y todo plazo de
//   espera de Gold dice que es del parto;
// - en «Internación», todo plazo de espera de Silver y Gold dice «algo agudo»
//   (un tope por año, «20 días/persona/año», no es un plazo);
// - en la tabla de /planes: el parto de Gold nombra la cesárea con ASESOR, el
//   laboratorio de Essential dice «rutina», las cirugías de Essential dicen
//   cirugía y familia, y las de Silver y Gold, «la mayoría»;
// - en el plegable, la maternidad de Gold nombra la cesárea con ASESOR;
// - las ecografías de Silver y Gold dicen «la mayoría» (9A, Arturo, 23/10/2026,
//   sp-interno#191): en la tabla de /planes y en la lista del celular, en lo que
//   se ve y en lo que oye el lector, todo plazo de la ecografía de Silver y Gold
//   lleva «la mayoría». Es la misma clase de error que la cesárea de Gold: un
//   plazo fuera de su fila que pierde su condición.
// Cada regla se prueba antes contra lo que mostraba 02c733a (35165a7 para la
// ecografía; tiene que fallar) y contra lo de hoy (tiene que pasar), y el ✓
// dice lo que vio.
console.log('\n── Las esperas llevan su condición (lista, tabla y plegable de /planes, y hoja)');
{
  const { ASESOR } = COV;
  const asesor = ASESOR.toLowerCase();
  const sinDuro = (t) => t.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  // Un plazo de espera: «10 meses», «2 meses de espera», «1 año». Un tope por año
  // («20 días/persona/año», «20 días por persona al año») no lo es.
  const PLAZO = /\b\d+ (?:d[ií]as?|semanas?|mes(?:es)?|años?)\b/i;
  const esPlazo = (t) => PLAZO.test(t) && !/\b(?:al|por) año\b|\/\S/i.test(t);
  // Cada trozo (un renglón de la celda, o lo que oye el lector cortado en comas y
  // punto y coma) que dice un plazo tiene que decir también su condición.
  const plazosSin = (trozos, condicion) => trozos.map(sinDuro).filter((t) => esPlazo(t) && !condicion.test(t));
  const cesarea = (t) => /ces[aá]rea/i.test(t) && t.toLowerCase().includes(asesor);
  const enTrozos = (t) => t.split(/[;,]\s+/);
  const reglas = {
    partoGold: (renglones) => cesarea(renglones.join(' ')) && !plazosSin(renglones, /parto/i).length,
    internacion: (renglones) => !plazosSin(renglones, /algo agudo/i).length,
    partoGoldOido: (t) => cesarea(t) && !plazosSin(enTrozos(t), /parto/i).length,
    internacionOida: (t) => !plazosSin(enTrozos(t), /algo agudo/i).length,
    // 9A: el plazo de la ecografía de Silver y Gold va con «la mayoría», en su
    // renglón; para el lector, cortado en comas, el trozo que sigue al plazo.
    ecografia: (renglones) => !plazosSin(renglones, /la mayoría/i).length,
    ecografiaOida: (t) => { const x = enTrozos(t).map(sinDuro); return x.every((y, k) => !esPlazo(y) || /la mayoría/i.test(y) || /^la mayoría\.?$/i.test(x[k + 1] || '')); },
  };
  // Las notas de la tabla de esperas de /planes, por fila y por plan.
  const TABLA = {
    'Parto': [null, null, cesarea],
    'Análisis de laboratorio': [(t) => /rutina/i.test(t), (t) => /la mayoría/i.test(t), (t) => /la mayoría/i.test(t)],
    'Cirugías programadas': [(t) => /cirug[ií]a/i.test(t) && /familia/i.test(t), (t) => /la mayoría/i.test(t), (t) => /la mayoría/i.test(t)],
    'Ecografías': [null, (t) => /la mayoría/i.test(t), (t) => /la mayoría/i.test(t)],
  };
  const tablaMala = (tabla) => Object.entries(TABLA).flatMap(([fila, rs]) => rs.map((r, i) => (r && !r(sinDuro((tabla[fila] || [])[i] || '')) ? fila + ', plan ' + (i + 1) + ': ' + JSON.stringify((tabla[fila] || [])[i] || null) : null)).filter(Boolean));
  // Lo que mostraba 02c733a (tiene que fallar) y lo de hoy (tiene que pasar).
  const auto = {
    partoGoldViejo: reglas.partoGold(['Con el bebé en nursery · medicamentos hasta Gs. 1,5 millones', '10 meses de espera']),
    partoGoldSinCesarea: reglas.partoGold(['Con el bebé en nursery', '10 meses de espera para el parto']),
    partoGoldBueno: reglas.partoGold(['Con el bebé en nursery · medicamentos hasta Gs. 1,5 millones', '10 meses de espera para el parto', 'Cesárea: preguntale a tu asesor']),
    internacionVieja: reglas.internacion(['20 días/persona/año', 'Semi-suite', '2 meses de espera']),
    internacionBuena: reglas.internacion(['20 días/persona/año', 'Semi-suite', '2 meses de espera si es por algo agudo']),
    oidoViejo: reglas.partoGoldOido('con el bebé en nursery, medicamentos hasta 1,5 millones de guaraníes, 10 meses de espera'),
    oidoBueno: reglas.partoGoldOido('con el bebé en nursery, medicamentos hasta 1,5 millones de guaraníes, 10 meses de espera para el parto; para una cesárea, preguntale a tu asesor cuánto esperás'),
    internacionOidaVieja: reglas.internacionOida('20 días por persona al año, semi-suite, 2 meses de espera'),
    internacionOidaBuena: reglas.internacionOida('20 días por persona al año, semi-suite, 2 meses de espera si es por algo agudo'),
    tablaVieja: tablaMala({ 'Parto': [null, null, null], 'Análisis de laboratorio': [null, 'la mayoría', 'la mayoría'], 'Cirugías programadas': [null, 'la mayoría', 'la mayoría'], 'Ecografías': [null, null, null] }).length,
    tablaBuena: tablaMala({ 'Parto': [null, null, 'Cesárea: preguntale a tu asesor'], 'Análisis de laboratorio': ['los de rutina, sin espera', 'la mayoría', 'la mayoría'], 'Cirugías programadas': ['1 cirugía/familia/año', 'la mayoría', 'la mayoría'], 'Ecografías': [null, 'la mayoría', 'la mayoría'] }).length,
    // La ecografía sola, como la mostraba 35165a7: tienen que caer Silver y Gold.
    tablaEcoVieja: tablaMala({ 'Parto': [null, null, 'Cesárea: preguntale a tu asesor'], 'Análisis de laboratorio': ['los de rutina, sin espera', 'la mayoría', 'la mayoría'], 'Cirugías programadas': ['1 cirugía/familia/año', 'la mayoría', 'la mayoría'], 'Ecografías': [null, null, null] }).length,
    ecografiaVieja: reglas.ecografia(['La mayoría, sin tope', '2 meses de espera']),
    ecografiaBuena: reglas.ecografia(['La mayoría, sin tope', '2 meses de espera, la mayoría']),
    ecografiaOidaVieja: reglas.ecografiaOida('la mayoría, sin tope, 2 meses de espera'),
    ecografiaOidaBuena: reglas.ecografiaOida('la mayoría, sin tope, 2 meses de espera, la mayoría'),
  };
  const malas = [];
  if (auto.partoGoldViejo || auto.partoGoldSinCesarea || !auto.partoGoldBueno || auto.internacionVieja || !auto.internacionBuena || auto.oidoViejo || !auto.oidoBueno || auto.internacionOidaVieja || !auto.internacionOidaBuena || !auto.tablaVieja || auto.tablaBuena || auto.tablaEcoVieja !== 2 || auto.ecografiaVieja || !auto.ecografiaBuena || auto.ecografiaOidaVieja || !auto.ecografiaOidaBuena) malas.push('las reglas no distinguen lo que mostraba 02c733a de lo de hoy: ' + JSON.stringify(auto));
  const visto = {};
  // 1. La tabla de /planes en la computadora y el plegable, abierto.
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  const tabla = await page.evaluate(() => {
    const o = {};
    const filas = [...document.querySelectorAll('#comparar-planes .cmp2-lab .cmp2-c')].map((c) => c.textContent.trim());
    // Las filas de la banda de esperas: desde el título «Cuánto esperás para usarlo».
    const grupos = [...document.querySelectorAll('#comparar-planes .cmp2-lab .cmp2-grupo-y-fila')];
    const desde = grupos.findIndex((g) => /Cuánto esperás/.test((g.querySelector('.cmp2-gt') || {}).textContent || ''));
    [...document.querySelectorAll('#comparar-planes .cmp2-plan')].forEach((pl, i) => [...pl.querySelectorAll('.cmp2-c')].forEach((c, k) => {
      if (desde < 0 || k < desde) return;
      const n = c.querySelector('.cmp2-fam');
      const v = n ? n.cloneNode(true) : null;
      if (v) v.querySelectorAll('.sr-solo').forEach((x) => x.remove());
      (o[filas[k]] = o[filas[k]] || [null, null, null])[i] = v ? v.textContent.trim() : null;
    }));
    return o;
  });
  tablaMala(tabla).forEach((m) => malas.push('/planes 1280, tabla de esperas, ' + m));
  visto.tabla = (tabla['Parto'] || [])[2];
  await page.waitForFunction(() => { const b = document.querySelector('button[aria-controls="detalle-internacion"]'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).catch(() => {});
  await page.click('button[aria-controls="detalle-internacion"]');
  await page.waitForTimeout(500);
  const fila = page.locator('#detalle-internacion [role="row"]', { has: page.locator('[role="rowheader"]', { hasText: /^Tiempo de espera para maternidad/ }) });
  if (!(await fila.count())) malas.push('plegable: falta la fila «Tiempo de espera para maternidad»');
  else {
    const gold = fila.first().locator('[role="cell"]').nth(2);
    // Lo que se ve, texto por texto (sin el de los lectores), separado por espacios.
    const seVe = await gold.evaluate((c) => { const out = []; const w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT); for (let n = w.nextNode(); n; n = w.nextNode()) if (!n.parentElement.closest('.sr-solo')) out.push(n.data); return out.join(' '); });
    const seOye = oido(await gold.ariaSnapshot());
    if (!cesarea(sinDuro(seVe))) malas.push('plegable, maternidad de Gold: ' + JSON.stringify(sinDuro(seVe)) + ' no nombra la cesárea con «' + ASESOR + '»');
    if (!cesarea(seOye)) malas.push('plegable, maternidad de Gold: el lector oye ' + JSON.stringify(seOye));
    visto.plegable = sinDuro(seVe);
  }
  await page.close();
  // 2. La lista de los once y la hoja de cada servicio, en el celular.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const cel = await ctx.newPage();
  await cel.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  await cel.locator('.cmp-cel button', { hasText: 'Los once servicios, plan por plan' }).tap();
  await cel.waitForTimeout(450);
  const FILA = '.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo button.fila';
  // Cada columna, renglón por renglón, como se ve (sin el texto para lectores),
  // y lo que oye el lector de cada plan (el nombre del botón, cortado por plan).
  const lista = await cel.evaluate((sel) => Object.fromEntries([...document.querySelectorAll(sel)].map((b) => [b.querySelector('b').textContent.replace(/ ›$/, ''), {
    nombre: b.getAttribute('aria-label') || '',
    cols: [...b.querySelectorAll(':scope > span > span')].map((c) => [...c.children].map((x) => { const k = x.cloneNode(true); k.querySelectorAll('.sr-solo').forEach((s) => s.remove()); return k.textContent; })),
  }])), FILA);
  const oidoDe = (nombre, plan) => { const m = new RegExp('(?:^|\\. )' + plan + ': (.*?)(?=\\. (?:Essential|Silver|Gold): |\\.$)').exec(nombre); return m ? m[1] : ''; };
  const parto = lista['Parto o cesárea'], inter = lista['Internación'];
  if (!parto) malas.push('lista: falta «Parto o cesárea»');
  else {
    if (!reglas.partoGold(parto.cols[2] || [])) malas.push('lista, Parto o cesárea, Gold: ' + JSON.stringify((parto.cols[2] || []).map(sinDuro)) + ' (la cesárea con «' + ASESOR + '» y la espera, del parto)');
    if (!reglas.partoGoldOido(oidoDe(parto.nombre, 'Gold'))) malas.push('lista, Parto o cesárea: el lector oye para Gold ' + JSON.stringify(oidoDe(parto.nombre, 'Gold')));
    visto.lista = (parto.cols[2] || []).map(sinDuro).slice(-2).join(' ⏎ ');
  }
  if (!inter) malas.push('lista: falta «Internación»');
  else {
    [1, 2].forEach((i) => {
      const plan = ['Essential', 'Silver', 'Gold'][i];
      if (!reglas.internacion(inter.cols[i] || [])) malas.push('lista, Internación, ' + plan + ': ' + JSON.stringify((inter.cols[i] || []).map(sinDuro)) + ' (la espera sin «algo agudo»)');
      if (!reglas.internacionOida(oidoDe(inter.nombre, plan))) malas.push('lista, Internación: el lector oye para ' + plan + ' ' + JSON.stringify(oidoDe(inter.nombre, plan)));
    });
    visto.internacion = (inter.cols[1] || []).map(sinDuro).filter(esPlazo).join(' · ') || '(sin plazo)';
  }
  // 9A: la ecografía de Silver y Gold, en lo que se ve y en lo que se oye.
  const eco = lista['Ecografía'];
  if (!eco) malas.push('lista: falta «Ecografía»');
  else {
    [1, 2].forEach((i) => {
      const plan = ['Essential', 'Silver', 'Gold'][i];
      if (!reglas.ecografia(eco.cols[i] || [])) malas.push('lista, Ecografía, ' + plan + ': ' + JSON.stringify((eco.cols[i] || []).map(sinDuro)) + ' (la espera sin «la mayoría»)');
      if (!reglas.ecografiaOida(oidoDe(eco.nombre, plan))) malas.push('lista, Ecografía: el lector oye para ' + plan + ' ' + JSON.stringify(oidoDe(eco.nombre, plan)));
    });
    visto.ecografia = (eco.cols[1] || []).map(sinDuro).filter(esPlazo).join(' · ') || '(sin plazo)';
  }
  // La hoja de cada servicio: lo que manda al asesor, arriba de los tres planes.
  const abajo = [];
  for (const servicio of Object.keys(lista)) {
    await cel.locator(FILA, { hasText: servicio }).first().tap();
    await cel.waitForTimeout(400);
    const r = await cel.evaluate((asesor) => {
      const d = document.querySelector('.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo > div');
      if (!d) return null;
      const hijos = [...d.children];
      const primero = hijos.findIndex((x) => x.classList.contains('sq'));
      return hijos.map((x, k) => [k, x]).filter(([, x]) => x.tagName === 'P' && x.textContent.toLowerCase().includes(asesor)).filter(([k]) => k > primero).map(([, x]) => x.textContent);
    }, asesor);
    if (r === null) abajo.push(servicio + ': no se abrió la hoja');
    else r.forEach((t) => abajo.push(servicio + ': «' + t.slice(0, 50) + '…»'));
    await cel.locator('.cmp-cel .hoja[data-abierta="1"] button', { hasText: 'Los once servicios' }).first().tap();
    await cel.waitForTimeout(350);
  }
  if (abajo.length) malas.push('hoja: notas que mandan al asesor debajo de los planes · ' + abajo.join(' · '));
  await ctx.close();
  if (malas.length) mal('cada espera lleva su condición (la cesárea de Gold, la internación por algo agudo, el laboratorio y las cirugías de Essential) en la lista, la tabla y el plegable de /planes y la hoja, y lo que manda al asesor va arriba · ' + malas.slice(0, 6).join(' · '));
  else bien('las reglas distinguen lo que mostraba 02c733a (y 35165a7, la ecografía) de lo de hoy, y las esperas llevan su condición: en la lista, Gold en «Parto o cesárea» dice «' + visto.lista + '», Silver en «Internación», «' + visto.internacion + '» y en «Ecografía», «' + visto.ecografia + '» (también para el lector); en la tabla de /planes, el parto de Gold dice «' + visto.tabla + '» y las ecografías de Silver y Gold, «la mayoría», y en el plegable, «' + visto.plegable + '»; en la hoja, lo que manda al asesor va arriba en los ' + Object.keys(lista).length + ' servicios');
}

// ── 9A y 10A: «la mayoría» de las ecografías y «de una lista de 26», a un toque ──
// Arturo, 23/10/2026 («Adelante con tus sugerencias»; sp-interno#191):
// - 9A: las ecografías de Silver y Gold decían «2 meses» y en la grilla del
//   master esperan 90 días las del embarazo (las siete), las Doppler y, en Gold,
//   cinco más (y la vesical, que el master contradice con la de vejiga: va al
//   asesor). Dicen «2 meses, la mayoría» y, a un toque, cuáles esperan 3 (TOQUES
//   de coverage.js, dibujado con Term).
// - 10A: la cirugía de Essential es «de una lista de 26» (cuadernillo, 4.4
//   «Intervenciones Quirúrgicas (Abiertas)», 4.4.1 a 4.4.26), y la lista se
//   abre al tocar, con lo que el cuadernillo dice del anestesista y de la
//   videolaparoscopía.
// Los textos aprobados van escritos acá, no se leen de coverage.js: una prueba
// no compara la página con la constante que la arma (cap. 151). Las 26 se leen
// de PARES_26 de qa/listas-fuente.mjs (una prueba, no el sitio), que además las
// controla contra essential.json: así hay una sola copia escrita a mano.
// Un toque abierto se lee dos veces: lo que oye el lector (el texto al que
// apunta aria-describedby) y lo que se ve (la burbuja). La burbuja tiene que
// verse entera (dentro de la pantalla y de cada caja que la recorta) y sin nada
// encima (elementFromPoint en una grilla de 5 × 5 puntos, con pointer-events
// prendido un momento). Si no entra y scrollea por dentro, se tiene que poder
// scrollear sin que se cierre: con el dedo (un arrastre de verdad, por CDP) y
// con el mouse (pasar a la burbuja y la rueda).
// DÓNDE SE ABRE (verificador de código, 23/10/2026): cada toque se abre en tres
// posiciones naturales, con su borde de arriba al 25 %, al 50 % y al 85 % del
// alto de la pantalla (scrolleando con behavior:'instant', primero lo que
// scrollea por dentro y después la página). Hasta el 23/10 se abría siempre al
// 62 %, el único lugar donde la lista más larga entraba: con el Term de main
// daba verde, y en el celular las 26 quedaban debajo de la cabecera fija. Una
// build con el Term de main (35165a7) tiene que caer acá, y una con el Term de
// 72291ef (la burbuja sin scroll), también.
// Dónde: /planes a 1280 con el mouse (la banda de esperas, también con la fila
// de Ecografías a 320 px del borde, donde la cabecera fija de Gold cortaba la
// burbuja de Silver, y la tarjeta de la ecografía, que lo dice en su pie);
// /planes a 360 × 780, 390 × 844 y 430 × 932 con el dedo (el cuadro de esperas:
// lo que oye el lector en cada encabezado de fila y que nada se salga de su
// borde; y, a 390, la hoja de la ecografía, cuya fila es un botón); el teclado a
// 1280 (Tab, Escape, Enter, Enter, Espacio, Espacio, sin mover la página); el
// simulador a 360, 390, 430 y 1280 (Silver, Gold y Essential, con el porqué de
// Essential); las preguntas frecuentes del home, en oraciones.
// LA BURBUJA FIJA (tercera tanda, 23/10): la de un toque va con position:fixed,
// y cada apertura mide además que se vea grande (ALTO_MIN), que esté junto a su
// toque y que ningún ancestro haga de marco del fixed; y las 26 se scrollean
// con la burbuja abierta (seguir): se reacomoda junto al toque y se esconde
// mientras el toque está fuera de la pantalla. Una build con el Term de 40d36ad
// (la rendija de 153 px con la fila al 25 %) tiene que caer acá.
// Antes se prueba cada detector: la lista de las 26 contra listas malas, y en la
// página, el texto del lector cambiado, la burbuja corrida y tapada, el arreglo
// de la cabecera de Gold sacado, un encabezado de fila con la lista adentro, un
// texto que se sale de su fila y la nota borrada.
console.log('\n── 9A y 10A: «la mayoría» de las ecografías y «de una lista de 26», a un toque');
{
  const NOTA = 'la mayoría', PALABRA_26 = 'de una lista de 26';
  const EMB = 'las del embarazo (obstétrica, morfológica, de marcadores cromosómicos, Doppler obstétrico, del corazón del bebé, perfil biofísico y monitoreo fetal)';
  const DOP = 'las Doppler de tiroides, de mama, de testículo, de venas de brazos o piernas y de carótidas';
  const GOLD5 = 'las de riñón y de vías urinarias, la testicular, la de próstata por vía rectal y la transvaginal';
  const VEJ = 'para la de vejiga, preguntale a tu asesor cuánto esperás';
  const may = (x) => x[0].toUpperCase() + x.slice(1);
  const escR = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Lo que dice la burbuja (y oye el lector): «título: lista», como la escribe
  // TOQUES. En oraciones (el pie de la tarjeta, la hoja), con minúscula después
  // de los dos puntos (toqueEnTexto, verificador de código, 23/10).
  const TOQUE = {
    Silver: 'Ecografías que esperan 3 meses en Silver: ' + may(EMB) + ' y ' + DOP + '.',
    // Las Doppler, en su oración: con una coma, «… y de carótidas, y las de
    // riñón» se leía «Doppler de riñón» (tercera tanda, 23/10).
    Gold: 'Ecografías que esperan 3 meses en Gold: ' + may(EMB) + ' y ' + DOP + '. También ' + GOLD5 + '. ' + may(VEJ) + '.',
    // Con los dos planes, la vejiga va dentro de la oración de Gold (en
    // Silver espera 60): suelta, se leía que valía para los dos (ronda 2).
    juntos: 'Ecografías que esperan 3 meses: En Silver y Gold, ' + EMB + ' y ' + DOP + '. En Gold, también ' + GOLD5 + ', y ' + VEJ + '.',
  };
  const EN_TEXTO = 'Ecografías que esperan 3 meses: en Silver y Gold, ' + EMB + ' y ' + DOP + '. En Gold, también ' + GOLD5 + ', y ' + VEJ + '.';
  const { PARES_26 } = await import(new URL('../qa/listas-fuente.mjs', import.meta.url));
  const LAS_26 = PARES_26.map((p) => p[1]);
  const T26_TITULO = 'Las 26 cirugías de Essential, a cielo abierto';
  // Después de la lista, lo que dice el cuadernillo del anestesista (4.3.2) y de
  // la videolaparoscopía (el párrafo que sigue a la lista, copia fiel desde la
  // tercera tanda: con la torre y el instrumental).
  const CIR_COLA = 'De los honorarios del anestesista, el plan cubre la mitad. Si te operan por videolaparoscopía, pagás vos la diferencia de aranceles en los honorarios del anestesista, el ayudante y el instrumentador, y el costo total del uso del equipo, la torre, los materiales y el instrumental.';
  const lista26 = (v, titulo = T26_TITULO, cola = CIR_COLA) => titulo + ': ' + may(v.slice(0, -1).join('; ') + '; y ' + v[v.length - 1]) + '.' + (cola ? ' ' + cola : '');
  const T26 = lista26(LAS_26);
  // La lista, ítem por ítem: qué falta, qué sobra, qué está fuera de su lugar
  // (4.4.n), y el título y el cierre.
  const difs26 = (t) => {
    const m = new RegExp('^' + escR(T26_TITULO) + ': (.*?)\\. (De los honorarios del anestesista.*)$').exec((t || '').replace(/\s+/g, ' ').trim());
    if (!m) return ['no empieza con «' + T26_TITULO + ':» o no cierra con lo del anestesista y la videolaparoscopía'];
    const v = m[1].split(/; (?:y )?/), r = [];
    if (v[0]) v[0] = minus(v[0]);
    LAS_26.forEach((x, i) => { if (!v.includes(x)) r.push('falta «' + x + '»'); else if (v[i] !== x) r.push('«' + x + '» no está en el lugar 4.4.' + (i + 1)); });
    v.filter((x) => !LAS_26.includes(x)).forEach((x) => r.push('sobra «' + x + '»'));
    if (v.length !== 26) r.push(v.length + ' ítems, no 26');
    if (m[2] !== CIR_COLA) r.push('el cierre dice «' + m[2].slice(0, 80) + '»');
    return r;
  };
  const malas = [];
  // La regla de la lista contra listas que tienen que fallar y la buena.
  {
    const cambiados = [...LAS_26]; [cambiados[1], cambiados[2]] = [cambiados[2], cambiados[1]];
    const conFaco = [...LAS_26]; conFaco.splice(12, 0, 'facoemulsificación del cristalino');
    const auto = {
      buena: difs26(T26).length,
      sinQuiste: difs26(lista26(LAS_26.filter((_, i) => i !== 23))).length,
      conFaco: difs26(lista26(conFaco)).length,
      catarataSinTecnica: difs26(lista26(LAS_26.map((x) => (/^catarata/.test(x) ? 'catarata de un ojo' : x)))).length,
      // «legrado» sin «evacuador» promete también el de diagnóstico, que no
      // entra (verificador de datos, 23/10).
      legradoSinEvacuador: difs26(lista26(LAS_26.map((x) => (/^legrado/.test(x) ? 'legrado (raspado del útero)' : x)))).length,
      cambiados: difs26(lista26(cambiados)).length,
      sinTitulo: difs26(T26.replace(T26_TITULO + ': ', '')).length,
      sinCieloAbierto: difs26(lista26(LAS_26, 'Las 26 cirugías de Essential')).length,
      sinVideolaparoscopia: difs26(lista26(LAS_26, T26_TITULO, CIR_COLA.replace(/ Si te operan.*$/, ''))).length,
    };
    if (auto.buena || Object.entries(auto).some(([k, n]) => k !== 'buena' && !n)) malas.push('la regla de las 26 no distingue la lista mala de la buena: ' + JSON.stringify(auto));
  }
  // Lo que se ve de un elemento: sin el texto para lectores, sin el texto al que
  // apunta un aria-describedby y sin la burbuja de un toque (la forma corta, que
  // también lleva aria-hidden, sí se ve). Un toque es un botón o, en una frase,
  // un span con role="button" (Term, tipo «toque», 23/10/2026).
  const SE_VE = `(e) => {
    if (!e) return null;
    const k = e.cloneNode(true);
    for (const b of k.querySelectorAll('[aria-describedby]')) {
      const d = k.querySelector('[id="' + b.getAttribute('aria-describedby') + '"]'); if (d) d.remove();
      for (const s of [...b.parentElement.children]) if (s !== b && s.getAttribute('aria-hidden') === 'true') s.remove();
    }
    k.querySelectorAll('.sr-solo').forEach((x) => x.remove());
    return k.textContent.replace(/\\u00a0/g, ' ').replace(/\\s+/g, ' ').trim();
  }`;
  const LEER = `(b) => {
    const oido = ((document.getElementById(b.getAttribute('aria-describedby') || '') || {}).textContent || '').replace(/\\s+/g, ' ').trim();
    const u = b.parentElement.querySelector(':scope > [aria-hidden="true"]:not([id])');
    const top = Math.round(b.getBoundingClientRect().top);
    if (!u || getComputedStyle(u).display === 'none') return { oido, visto: null, top };
    const r = u.getBoundingClientRect();
    const cs = getComputedStyle(u);
    // Lo que se ve: la pantalla, recortada por cada caja que recorta (hidden,
    // clip, o una que scrollea por dentro, como el cuerpo del simulador). Una
    // burbuja fija (la de un toque, desde la tercera tanda del 23/10) no la
    // recorta ninguna de sus cajas, salvo que un ancestro haga de marco del fixed
    // (transform, filter, perspective, contain, will-change, container-type): si
    // lo hay, se informa en «rompe» y desde él para arriba sí recortan.
    const fija = cs.position === 'fixed';
    const MARCO = (s) => s.transform !== 'none' || s.filter !== 'none' || s.perspective !== 'none' || (s.backdropFilter || 'none') !== 'none' || /paint|layout|strict|content/.test(s.contain || '') || /transform|filter|perspective/.test(s.willChange || '') || (s.containerType || 'normal') !== 'normal';
    let rompe = null, desde = u.parentElement;
    if (fija) {
      desde = null;
      for (let a = u.parentElement; a && a !== document.documentElement; a = a.parentElement) if (MARCO(getComputedStyle(a))) { rompe = a.tagName.toLowerCase() + (typeof a.className === 'string' && a.className.trim() ? '.' + a.className.trim().split(/\\s+/).join('.') : ''); desde = a; break; }
    }
    let c = { left: 0, top: 0, right: document.documentElement.clientWidth, bottom: innerHeight };
    for (let a = desde; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (/hidden|clip|auto|scroll/.test(s.overflow + s.overflowX + s.overflowY)) { const q = a.getBoundingClientRect(); c = { left: Math.max(c.left, q.left), top: Math.max(c.top, q.top), right: Math.min(c.right, q.right), bottom: Math.min(c.bottom, q.bottom) }; }
    }
    const entera = r.left >= c.left - 0.5 && r.right <= c.right + 0.5 && r.top >= c.top - 0.5 && r.bottom <= c.bottom + 0.5;
    // Junto a su toque: 8 px arriba o abajo (con el redondeo, de 4 a 12) y
    // encima de él a lo ancho. Una burbuja fija que quedó en otro lado (un marco
    // del fixed corrido, el scroll de la página sin reacomodarla) no lo está.
    const t = b.getBoundingClientRect();
    const hueco = r.top >= t.bottom - 1 ? r.top - t.bottom : t.top - r.bottom;
    const junto = hueco >= 4 && hueco <= 12 && r.left <= t.right && r.right >= t.left;
    const scroll = u.scrollHeight > u.clientHeight + 1;
    // Si scrollea, que se pueda: overflow, el dedo (pointer-events) y que no
    // arrastre la página (overscroll-behavior).
    const puedeScroll = /auto|scroll/.test(cs.overflowY) && cs.pointerEvents === 'auto' && cs.overscrollBehaviorY === 'contain';
    const pe = u.style.pointerEvents; u.style.pointerEvents = 'auto';
    // Una grilla de 5 × 5 puntos, 8 px adentro en los bordes: la burbuja tiene
    // la esquina redondeada (--r-xs) y a 3 px el punto cae afuera de la curva.
    const xs = [r.left + 8, r.left + r.width / 4, r.left + r.width / 2, r.left + r.width * 3 / 4, r.right - 8];
    const ys = [r.top + 8, r.top + r.height / 4, r.top + r.height / 2, r.top + r.height * 3 / 4, r.bottom - 8];
    let tapadas = 0;
    for (const x of xs) for (const y of ys) { const e = document.elementFromPoint(x, y); if (!e || !u.contains(e)) tapadas++; }
    u.style.pointerEvents = pe;
    return { oido, visto: u.innerText.replace(/\\n+/, ': ').replace(/\\s+/g, ' ').trim(), entera, tapadas, scroll, puedeScroll, top, caja: [Math.round(r.top), Math.round(r.bottom)], clip: [Math.round(c.top), Math.round(c.bottom)], alto: Math.round(r.height), largo: u.scrollHeight, fija, rompe, junto };
  }`;
  // Deja el borde de arriba del toque al `pos` del alto de la pantalla: primero
  // lo que scrollea por dentro (el cuerpo del simulador en la computadora),
  // después la página. Siempre con behavior:'instant' (cap. 140).
  const COLOCAR = `(e, pos) => {
    let d = e.getBoundingClientRect().top - innerHeight * pos;
    for (let a = e.parentElement; a && a !== document.body && Math.abs(d) > 1; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (/auto|scroll/.test(s.overflowY) && a.scrollHeight > a.clientHeight + 1) { const t0 = a.scrollTop; a.scrollBy({ top: d, behavior: 'instant' }); d -= a.scrollTop - t0; }
    }
    window.scrollBy({ top: d, behavior: 'instant' });
  }`;
  // EL ALTO QUE SE VE (tercera tanda, 23/10/2026, verificador de código). «Entera,
  // sin nada encima y scrolleable» daba por buena una rendija: con la fila al
  // 25 %, las 26 se abrían en 73 a 153 px que scrolleaban, porque el cuadro de
  // esperas y la tarjeta del simulador recortan por sus esquinas, y debajo
  // quedaban 600 px libres. Ahora la burbuja de un toque es fija, y se mide que se
  // vea grande: al menos ALTO_MIN px de alto, o la lista entera si es más corta.
  // Medido el 23/10 en las 63 aperturas: con la burbuja fija, el alto más chico
  // que se ve de las 26 es 344 px; con el Term de 40d36ad, con la fila al 25 %,
  // 153 px en el cuadro del celular (360, 390 y 430) y, según el verificador,
  // 89 a 132 en el simulador. 240 px son unos 13 renglones: deja margen a lo de
  // hoy y no deja pasar la rendija (la build con el Term de 40d36ad cae acá).
  // Y la burbuja fija tiene que estar junto a su toque y sin un marco del fixed.
  const ALTO_MIN = 240;
  const grande = (l) => l.alto >= Math.min(l.largo, ALTO_MIN) - 1;
  const bienPuesta = (l) => l.entera && !l.tapadas && grande(l) && (!l.fija || (l.junto && !l.rompe)) && (!l.scroll || (l.puedeScroll && l.sigue)) && (!l.cuadros || primerBien(l.cuadros));
  const bienAbierto = (l, esperado) => !!l && l.oido === esperado && l.visto === esperado && bienPuesta(l);
  const bien26 = (l) => !!l && !difs26(l.oido).length && !difs26(l.visto).length && bienPuesta(l);
  const corto = (l) => JSON.stringify(l && { oido: (l.oido || '').slice(0, 50), visto: (l.visto || '').slice(0, 50), entera: l.entera, tapadas: l.tapadas, scroll: l.scroll, puedeScroll: l.puedeScroll, sigue: l.sigue, top: l.top, caja: l.caja, clip: l.clip, alto: l.alto, largo: l.largo, fija: l.fija, junto: l.junto, rompe: l.rompe, primerCuadro: l.cuadros && (l.cuadros[0] || 'ninguno') });
  // Lo que se midió, para el informe: el alto más chico que se vio de cada lista.
  const altos = { 26: Infinity, eco: Infinity };
  const POS = [0.25, 0.5, 0.85];
  // Abre el toque como lo abre una persona: con el mouse, pasando por encima de
  // su primer renglón; con el dedo, tocando. Si la burbuja scrollea, se scrollea
  // por dentro como se scrollea: con el dedo, un arrastre (CDP, eventos de
  // toque de verdad); con el mouse, pasando a la burbuja y con la rueda. Tiene
  // que moverse y seguir abierta (`sigue`).
  // EL PRIMER CUADRO (ronda 2, 23/10/2026, verificador). El efecto que pone la
  // burbuja fija en su lugar es useLayoutEffect: mide y acomoda antes de
  // pintar. Con useEffect, al tocar con el dedo el primer cuadro salía en otro
  // lado (con el Term de 40d36ad, entera hacia arriba, de −446 a 192, y recién
  // en el segundo bajaba junto al toque): un parpadeo que ninguna prueba veía,
  // porque todas miran 300 ms después. Con el dedo, antes del toque, se registra
  // en cada cuadro (requestAnimationFrame, que corre antes de pintar) la caja de
  // la burbuja desde que deja de estar en display:none, y el primero ya tiene
  // que verse junto a su toque y por debajo de la cabecera fija. Sabotaje
  // probado: en una copia con el efecto de posición en useEffect, cae en las 45
  // aperturas con el dedo (el primer cuadro sale escondido, todavía sin ubicar).
  const CUADROS = `(e) => {
    const u = e.parentElement.querySelector(':scope > [aria-hidden="true"]:not([id])');
    const nav = document.querySelector('[data-nav]');
    const c = window.__cuadros = [];
    const t0 = performance.now();
    const vuelta = () => {
      const cs = getComputedStyle(u);
      if (cs.display !== 'none') {
        const r = u.getBoundingClientRect(), t = e.getBoundingClientRect();
        const techo = nav && getComputedStyle(nav).position === 'fixed' ? nav.getBoundingClientRect().bottom : 0;
        const hueco = r.top >= t.bottom - 1 ? r.top - t.bottom : t.top - r.bottom;
        c.push({ ms: Math.round(performance.now() - t0), visible: cs.visibility === 'visible', caja: [Math.round(r.top), Math.round(r.bottom)], junto: hueco >= 4 && hueco <= 12 && r.left <= t.right && r.right >= t.left, bajoTecho: r.top >= techo - 0.5 });
      }
      if (c.length < 3 && performance.now() - t0 < 2000) requestAnimationFrame(vuelta);
    };
    requestAnimationFrame(vuelta);
  }`;
  const primerBien = (c) => c.length > 0 && c[0].visible && c[0].junto && c[0].bajoTecho;
  // La regla, contra un primer cuadro escondido (el de useEffect: la burbuja
  // dibujada antes de medirse), uno corrido hacia arriba, ninguno, y el bueno.
  {
    const bueno = { visible: true, junto: true, bajoTecho: true };
    const auto = {
      bueno: primerBien([bueno]),
      escondido: !primerBien([{ ...bueno, visible: false, junto: false }, bueno]),
      corrido: !primerBien([{ ...bueno, junto: false, bajoTecho: false }, bueno]),
      ninguno: !primerBien([]),
    };
    if (Object.values(auto).some((x) => !x)) malas.push('la regla del primer cuadro no distingue el bueno de los malos: ' + JSON.stringify(auto));
  }
  const abrir = async (pg, boton, dedo, pos) => {
    await boton.evaluate(eval(COLOCAR), pos);
    await pg.waitForTimeout(150);
    // En su primer renglón: un toque partido en dos tiene el centro de su caja
    // entre los renglones, fuera del texto.
    const q = await boton.evaluate((e) => { const b = e.getBoundingClientRect(), r = e.getClientRects()[0]; return { x: r.left + r.width / 2, y: r.top + r.height / 2, dx: r.left - b.left + r.width / 2, dy: r.top - b.top + r.height / 2 }; });
    if (dedo) { await boton.evaluate(eval(CUADROS)); await boton.tap({ position: { x: q.dx, y: q.dy } }); }
    else { await pg.mouse.move(5, 5); await pg.mouse.move(q.x, q.y); }
    await pg.waitForTimeout(300);
    const l = await boton.evaluate(eval(LEER));
    l.pos = pos;
    if (dedo) { l.cuadros = await pg.evaluate(() => window.__cuadros || []); visto.cuadros++; }
    if (l.visto !== null && l.scroll) {
      const u = await boton.evaluateHandle((e) => e.parentElement.querySelector(':scope > [aria-hidden="true"]:not([id])'));
      const c = await u.evaluate((x) => { const r = x.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), h: r.height, st: x.scrollTop }; });
      if (dedo) {
        const cdp = await pg.context().newCDPSession(pg);
        const paso = Math.max(4, Math.floor(c.h / 30));
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y + paso * 5 }] });
        for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: c.x, y: c.y + paso * 5 - i * paso }] }); await pg.waitForTimeout(16); }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await cdp.detach();
      } else { await pg.mouse.move(c.x, c.y, { steps: 4 }); await pg.waitForTimeout(400); await pg.mouse.wheel(0, 120); }
      await pg.waitForTimeout(400);
      const despues = await u.evaluate((x, b) => ({ st: x.scrollTop, abierta: getComputedStyle(x).display !== 'none' && b.getAttribute('aria-expanded') === 'true' }), await boton.elementHandle());
      l.sigue = despues.abierta && despues.st > c.st;
    }
    return l;
  };
  const cerrar = async (pg, dedo) => { if (dedo) await pg.keyboard.press('Escape'); else await pg.mouse.move(5, 5); await pg.waitForTimeout(350); };
  const visto = { posiciones: 0, seguir: 0, cuadros: 0, recortado: 0, cabecera: 0, asoma: 0, encima: 0 };
  const abrirEn = async (pg, boton, dedo, esperado, donde) => {
    for (const pos of POS) {
      const l = await abrir(pg, boton, dedo, pos);
      visto.posiciones++;
      if (l && l.visto !== null) { const k = esperado === 26 ? 26 : 'eco'; altos[k] = Math.min(altos[k], l.alto); }
      const ok = esperado === 26 ? bien26(l) : bienAbierto(l, esperado);
      if (!ok) malas.push(donde + ' al ' + Math.round(pos * 100) + ' %: ' + corto(l) + (esperado === 26 ? ' · ' + difs26(l && l.oido).concat(difs26(l && l.visto)).slice(0, 2).join(' · ') : ''));
      await cerrar(pg, dedo);
    }
  };
  // AL SCROLLEAR (tercera tanda, 23/10): la burbuja fija no se queda en la
  // pantalla mientras su toque se va. Se eligió reacomodarla junto al toque, y
  // esconderla mientras el toque está fuera de lo que se ve, y no cerrarla: al
  // llegar con Tab, el navegador scrollea (suave) hasta el toque justo después
  // de abrirlo, y cerrarla en el camino dejaba el toque con el foco y la lista
  // cerrada (medido: la prueba del teclado caía). Se abre con la fila al 50 %
  // (con el dedo, o con el teclado donde manda el mouse: con el mouse, salir del
  // toque ya la cierra), se scrollean 60 px de lo que scrollea (la caja, como el
  // cuerpo del simulador en la computadora, o la página) y se lee: abierta, junto
  // al toque, entera, sin nada encima y grande. Después el toque se lleva arriba
  // de la pantalla (la burbuja no se tiene que ver) y se vuelve a donde estaba
  // (se tiene que ver otra vez, junto a él).
  const SCROLL60 = `(e) => {
    let a = e.parentElement;
    for (; a && a !== document.body; a = a.parentElement) { const s = getComputedStyle(a); if (/auto|scroll/.test(s.overflowY) && a.scrollHeight > a.clientHeight + 1) break; }
    const caja = !!a && a !== document.body;
    (caja ? a : window).scrollBy({ top: 60, behavior: 'instant' });
    return caja ? 'la caja' : 'la página';
  }`;
  // Volver a donde estaba, y no «al medio» con COLOCAR (ronda 2, 23/10/2026):
  // en el simulador de la computadora, COLOCAR(−0.3) scrollea el cuerpo del
  // simulador y también la página, y COLOCAR(0.5) devolvía todo con el cuerpo
  // solo, así que el toque quedaba a media pantalla pero debajo del borde de su
  // caja, escondido. La burbuja lo seguía mostrando porque «fuera» se medía
  // contra la pantalla; desde que se mide contra lo que se ve, se esconde (está
  // bien), y la prueba tiene que devolver el toque a un lugar donde se vea.
  const GUARDAR = `(e) => {
    const v = [[null, scrollY]];
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const s = getComputedStyle(a); if (/auto|scroll/.test(s.overflowY) && a.scrollHeight > a.clientHeight + 1) v.push([a, a.scrollTop]); }
    window.__vuelta = v;
  }`;
  const VOLVER = `() => { for (const [a, y] of window.__vuelta || []) (a || window).scrollTo({ top: y, behavior: 'instant' }); }`;
  const seguir = async (pg, boton, con, esperado, donde) => {
    await boton.evaluate(eval(COLOCAR), 0.5);
    await pg.mouse.move(5, 5);
    await pg.waitForTimeout(150);
    if (con === 'dedo') { const q = await boton.evaluate((e) => { const b = e.getBoundingClientRect(), r = e.getClientRects()[0]; return { dx: r.left - b.left + r.width / 2, dy: r.top - b.top + r.height / 2 }; }); await boton.tap({ position: { x: q.dx, y: q.dy } }); }
    else { await boton.evaluate((e) => { const f = [...document.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"]),input,select,textarea')].filter((x) => x.getClientRects().length); f[f.indexOf(e) - 1].focus(); }); await pg.keyboard.press('Tab'); }
    await pg.waitForTimeout(300);
    const antes = await boton.evaluate(eval(LEER));
    const que = await boton.evaluate(eval(SCROLL60));
    await pg.waitForTimeout(300);
    const l = await boton.evaluate(eval(LEER));
    // Acá no se scrollea por dentro: eso lo mide abrirEn.
    if (l.scroll) l.sigue = true;
    const abierta = (await boton.getAttribute('aria-expanded')) === 'true';
    const ok = abierta && antes.visto !== null && l.visto !== null && Math.abs((antes.top - l.top) - 60) <= 1 && (esperado === 26 ? bien26(l) : bienAbierto(l, esperado));
    const seVe = () => boton.evaluate((e) => { const u = e.parentElement.querySelector(':scope > [aria-hidden="true"]:not([id])'); const s = getComputedStyle(u); return s.display !== 'none' && s.visibility === 'visible'; });
    await boton.evaluate(eval(GUARDAR));
    await boton.evaluate(eval(COLOCAR), -0.3);
    await pg.waitForTimeout(300);
    const fuera = !(await seVe());
    await boton.evaluate(eval(VOLVER));
    await pg.waitForTimeout(300);
    const v = await boton.evaluate(eval(LEER));
    if (v.scroll) v.sigue = true;
    const vuelve = (await boton.getAttribute('aria-expanded')) === 'true' && (await seVe()) && (esperado === 26 ? bien26(v) : bienAbierto(v, esperado));
    if (!ok || !fuera || !vuelve) malas.push(donde + ', al scrollear ' + que + ' 60 px (' + con + '): ' + (abierta ? corto(l) + ' · el toque subió ' + (antes.top - l.top) + ' px' : 'se cerró') + (fuera ? '' : ' · con el toque fuera de la pantalla, la burbuja se sigue viendo') + (vuelve ? '' : ' · con el toque de vuelta donde estaba: ' + corto(v)));
    visto.seguir++;
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(200);
  };
  // EL TOQUE ESCONDIDO POR SU CAJA (ronda 2, 23/10/2026, verificador). En el
  // simulador de la computadora, con la lista abierta por teclado, la persona
  // puede scrollear el cuerpo del simulador (la rueda, el touchpad) hasta que el
  // toque quede escondido por el borde de la tarjeta, todavía dentro de la
  // pantalla. «Fuera» se medía contra la pantalla sola: la burbuja seguía a la
  // vista, encima de «Tu plan, a tu medida», apuntando a nada. `seguir` no lo
  // veía: saca el toque de la pantalla, no de la caja. Acá se abre con Tab, se
  // scrollea la caja hasta dejar el toque 20 px más allá de su borde (o lo que
  // haya hasta el borde de la pantalla o de la cabecera), abajo y arriba donde
  // se pueda, y la burbuja no se tiene que ver; vuelta al medio, se ve otra vez.
  // Si por ningún lado el toque queda escondido dentro de la pantalla, el caso
  // no prueba nada y se informa. Con el Term de 3db7cb7 cae: a 1280 × 900, el
  // toque en 885-899 y la caja cortando en 865, la burbuja se seguía viendo.
  const RECORTAR = `(e, lado) => {
    let a = e.parentElement;
    for (; a && a !== document.body; a = a.parentElement) { const s = getComputedStyle(a); if (/auto|scroll/.test(s.overflowY) && a.scrollHeight > a.clientHeight + 1) break; }
    if (!a || a === document.body) return { sinCaja: true };
    const q = a.getBoundingClientRect(), t = e.getBoundingClientRect(), nav = document.querySelector('[data-nav]');
    const techo = nav && getComputedStyle(nav).position === 'fixed' ? nav.getBoundingClientRect().bottom : 0;
    // 20 px más allá del borde, o lo que haya hasta el borde de lo que se ve.
    const dist = Math.min(20, Math.floor(lado === 'abajo' ? innerHeight - q.bottom - t.height - 1 : q.top - techo - t.height - 1));
    if (dist < 4) return { caja: [Math.round(q.top), Math.round(q.bottom)], sinLugar: true };
    a.scrollBy({ top: lado === 'abajo' ? t.top - (q.bottom + dist) : t.bottom - (q.top - dist), behavior: 'instant' });
    const t2 = e.getBoundingClientRect();
    const escondido = lado === 'abajo' ? t2.top >= q.bottom + dist - 1 : t2.bottom <= q.top - dist + 1;
    return { caja: [Math.round(q.top), Math.round(q.bottom)], toque: [Math.round(t2.top), Math.round(t2.bottom)], dist, escondido, enPantalla: t2.top >= techo && t2.bottom <= innerHeight };
  }`;
  const recortado = async (pg, boton, donde) => {
    const seVe = () => boton.evaluate((e) => { const u = e.parentElement.querySelector(':scope > [aria-hidden="true"]:not([id])'); const s = getComputedStyle(u); return s.display !== 'none' && s.visibility === 'visible'; });
    let probados = 0;
    const sinProbar = [];
    for (const lado of ['abajo', 'arriba']) {
      // Desde la página arriba, con la caja entera a la vista: COLOCAR mueve
      // primero la caja, y así deja el toque adentro de ella.
      await pg.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await boton.evaluate(eval(COLOCAR), 0.5);
      await pg.mouse.move(5, 5);
      await pg.waitForTimeout(150);
      await boton.evaluate((e) => { const f = [...document.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"]),input,select,textarea')].filter((x) => x.getClientRects().length); f[f.indexOf(e) - 1].focus(); });
      await pg.keyboard.press('Tab');
      await pg.waitForTimeout(300);
      const antes = await seVe();
      const r = await boton.evaluate(eval(RECORTAR), lado);
      await pg.waitForTimeout(300);
      const abierta = (await boton.getAttribute('aria-expanded')) === 'true';
      const despues = await seVe();
      await boton.evaluate(eval(COLOCAR), 0.5);
      await pg.waitForTimeout(300);
      const v = await boton.evaluate(eval(LEER));
      if (v.scroll) v.sigue = true;
      const vuelve = (await seVe()) && bien26(v);
      await pg.keyboard.press('Escape');
      await pg.waitForTimeout(200);
      if (r.sinCaja) { malas.push(donde + ': no encontró la caja que scrollea'); return; }
      // Cada lado existe solo si entre el borde de la caja y el de lo que se ve
      // (la cabecera arriba, la pantalla abajo) queda lugar para el toque.
      if (!r.escondido || !r.enPantalla) { sinProbar.push(lado + ' ' + JSON.stringify(r)); continue; }
      probados++;
      if (!antes || !abierta || despues || !vuelve) malas.push(donde + ', con la caja scrolleada hasta esconder el toque por ' + lado + ' (teclado): ' + JSON.stringify({ antes, abierta, seVeConElToqueEscondido: despues, ...r }) + (vuelve ? '' : ' · de vuelta en el medio: ' + corto(v)));
    }
    if (!probados) malas.push(donde + ', el toque escondido por su caja: no se pudo dejar escondido dentro de la pantalla por ningún lado · ' + sinProbar.join(' · '));
    visto.recortado += probados;
  };

  // EL TOQUE TAPADO POR UNA CABECERA PEGAJOSA (ronda 3, 23/10/2026, verificador).
  // Lo que no se ve no es solo lo que recorta. En /planes, en la computadora,
  // cada plan tiene su cabecera pegajosa (.cmp2-h, position:sticky), que no
  // recorta nada: tapa. Con la lista abierta por teclado y la página scrolleada
  // con la rueda hasta dejar el toque debajo de esa cabecera, la burbuja seguía
  // a la vista, encima de la columna, apuntando a nada (con el mouse no pasa:
  // salir del toque la cierra). Acá se abre con Tab, la rueda (con el mouse
  // sobre la cabecera del sitio, lejos del toque) lleva el centro del toque al
  // medio de la cabecera del plan, y se mira qué hay de verdad en el toque
  // (elementsFromPoint, sin contar la burbuja): si no es la cabecera, el caso
  // no prueba nada y se informa. La burbuja no se tiene que ver; con la rueda de
  // vuelta, se ve otra vez, junto al toque. Con el Term de b44c1a1 cae: la
  // burbuja, a la vista con el toque debajo de la cabecera.
  const BAJO_CABECERA = `(e) => {
    const plan = e.closest('.cmp2-plan'), h = plan && plan.querySelector('.cmp2-h');
    if (!h) return null;
    const u = e.parentElement.querySelector(':scope > [aria-hidden="true"]:not([id])');
    const q = h.getBoundingClientRect(), t = e.getBoundingClientRect();
    const y = t.top + t.height / 2;
    const hay = document.elementsFromPoint(t.left + t.width / 2, y).find((n) => !u.contains(n));
    return { pegajosa: getComputedStyle(h).position === 'sticky', cabecera: [Math.round(q.top), Math.round(q.bottom)], toque: [Math.round(t.top), Math.round(t.bottom)], falta: Math.round(y - (q.top + q.bottom) / 2), tapado: !!hay && h.contains(hay) && !e.contains(hay) };
  }`;
  // El foco va primero a lo de antes sin scrollear (preventScroll): en /planes,
  // lo de antes en el orden del Tab está en otra columna, lejos, y el scroll
  // suave hasta ahí seguía después del Tab y se llevaba el toque de la pantalla.
  const FOCO_ANTES = (e) => { const f = [...document.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"]),input,select,textarea')].filter((x) => x.getClientRects().length); f[f.indexOf(e) - 1].focus({ preventScroll: true }); };
  const seVeLa = (boton) => boton.evaluate((e) => { const u = e.parentElement.querySelector(':scope > [aria-hidden="true"]:not([id])'); const s = getComputedStyle(u); return s.display !== 'none' && s.visibility === 'visible'; });
  const tapadoPorCabecera = async (pg, boton, esperado, donde) => {
    await boton.evaluate(eval(COLOCAR), 0.5);
    await pg.mouse.move(5, 5);
    await pg.waitForTimeout(150);
    await boton.evaluate(FOCO_ANTES);
    await pg.keyboard.press('Tab');
    await pg.waitForTimeout(300);
    const antes = await seVeLa(boton);
    const arriba = () => boton.evaluate((e) => Math.round(e.getBoundingClientRect().top));
    const t0 = await arriba();
    let m = await boton.evaluate(eval(BAJO_CABECERA));
    for (let i = 0; i < 6 && m && Math.abs(m.falta) > 3; i++) {
      await pg.mouse.wheel(0, m.falta);
      await pg.waitForTimeout(400);
      m = await boton.evaluate(eval(BAJO_CABECERA));
    }
    const abierta = (await boton.getAttribute('aria-expanded')) === 'true';
    const tapadaSeVe = await seVeLa(boton);
    // De vuelta con la rueda, hasta donde estaba.
    for (let i = 0, f = (await arriba()) - t0; i < 6 && Math.abs(f) > 3; i++, f = (await arriba()) - t0) {
      await pg.mouse.wheel(0, f);
      await pg.waitForTimeout(400);
    }
    const v = await boton.evaluate(eval(LEER));
    if (v.scroll) v.sigue = true;
    const vuelve = (await seVeLa(boton)) && (esperado === 26 ? bien26(v) : bienAbierto(v, esperado));
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(200);
    if (!m || !m.pegajosa) { malas.push(donde + ': no encuentro la cabecera pegajosa de su plan (.cmp2-h) ' + JSON.stringify(m)); return; }
    if (!m.tapado) { malas.push(donde + ': la rueda no dejó el toque debajo de la cabecera de su plan, y el caso no prueba nada ' + JSON.stringify(m)); return; }
    visto.cabecera++;
    if (!antes || !abierta || tapadaSeVe || !vuelve) malas.push(donde + ', con el toque debajo de la cabecera pegajosa de su plan (teclado y la rueda): ' + JSON.stringify({ antes, abierta, seVeConElToqueTapado: tapadaSeVe, ...m }) + (vuelve ? '' : ' · con la rueda de vuelta: ' + corto(v)));
  };
  // EL TOQUE QUE ASOMA DEBAJO DE LA CABECERA DEL SITIO (ronda 3, 23/10/2026,
  // verificador). Hasta la cuarta tanda, «fuera» se medía con el margen de 8 px
  // de la burbuja: un toque que asomaba de 1 a 8 px debajo de [data-nav] se
  // abría con el mouse (aria-expanded true) con la burbuja escondida. Se arregló
  // en la cuarta tanda sin prueba propia. Acá, en el simulador a 1280, el toque
  // queda con 3 y con 7 px a la vista debajo de la cabecera (lo que scrollea por
  // dentro primero y después la página, como COLOCAR), el mouse pasa por la
  // franja que se ve y la burbuja tiene que estar abierta, a la vista y junto a
  // su toque. Antes se mira que el caso sea real: que en la franja esté el
  // toque. Con la regla «fuera» de 3db7cb7 (`b.bottom < techo`, con el margen)
  // cae.
  const ASOMAR = `(e, px) => {
    const nav = document.querySelector('[data-nav]');
    const techo = nav && getComputedStyle(nav).position === 'fixed' ? nav.getBoundingClientRect().bottom : 0;
    let d = e.getBoundingClientRect().bottom - (techo + px);
    for (let a = e.parentElement; a && a !== document.body && Math.abs(d) > 0.5; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (/auto|scroll/.test(s.overflowY) && a.scrollHeight > a.clientHeight + 1) { const t0 = a.scrollTop; a.scrollBy({ top: d, behavior: 'instant' }); d -= a.scrollTop - t0; }
    }
    window.scrollBy({ top: d, behavior: 'instant' });
    const rs = e.getClientRects(), r = rs[rs.length - 1], b = e.getBoundingClientRect();
    const x = r.left + r.width / 2, y = (Math.max(r.top, techo) + r.bottom) / 2;
    const hay = document.elementFromPoint(x, y);
    return { techo: Math.round(techo), toque: [Math.round(b.top), Math.round(b.bottom)], asoma: Math.round((b.bottom - techo) * 10) / 10, x, y, real: !!hay && (hay === e || e.contains(hay)) };
  }`;
  const asoma = async (pg, boton, donde) => {
    for (const px of [3, 7]) {
      await pg.mouse.move(5, 5);
      await pg.waitForTimeout(300);
      const a = await boton.evaluate(eval(ASOMAR), px);
      await pg.waitForTimeout(150);
      if (!a.real || Math.abs(a.asoma - px) > 1) { malas.push(donde + ', el toque asomando ' + px + ' px debajo de la cabecera: no se pudo dejar así, y el caso no prueba nada ' + JSON.stringify(a)); continue; }
      await pg.mouse.move(a.x, a.y);
      await pg.waitForTimeout(350);
      const abierta = (await boton.getAttribute('aria-expanded')) === 'true';
      const l = await boton.evaluate(eval(LEER));
      if (l.scroll) l.sigue = true;
      const se = await seVeLa(boton);
      visto.asoma++;
      if (!abierta || !se || !bien26(l)) malas.push(donde + ', el toque asomando ' + px + ' px debajo de la cabecera, abierto con el mouse: ' + JSON.stringify({ abierta, seVe: se, ...a }) + ' · ' + corto(l));
    }
    await pg.mouse.move(5, 5);
    await pg.waitForTimeout(300);
  };
  // LA BURBUJA ENCIMA DE SU TOQUE (ronda 4, 23/10/2026, verificador). Para
  // saber si el toque se ve, colocarFijo le pregunta al navegador qué hay en él,
  // y saltea la burbuja (elementsFromPoint): mientras se scrollea, la del cuadro
  // anterior puede quedar encima del toque. Esa parte del arreglo de la quinta
  // tanda no tenía prueba. Pasa cuando la burbuja abre abajo y scrollea por
  // dentro (pointer-events:auto, para el dedo): en el cuadro de esperas a 360,
  // con las 26 y la fila al 15 %. Un solo salto de scroll hacia arriba deja el
  // toque donde estaba la burbuja; si se le pregunta solo a elementFromPoint, lo
  // que hay es la burbuja, la esconde con la lista abierta y no vuelve hasta el
  // próximo scroll. Acá se arma el caso con el dedo, se confirma que es el caso
  // (abajo, scrolleando y con pointer-events:auto, y después del salto, el toque
  // adentro de donde estaba la burbuja; si no, no prueba nada y se informa), y la
  // burbuja tiene que seguir abierta, a la vista y junto al toque. Con
  // `queHay = (x, y) => document.elementFromPoint(x, y)` cae: abierta, escondida
  // y lejos del toque.
  const CASO_ENCIMA = `(e) => {
    const u = e.parentElement.querySelector(':scope > [aria-hidden="true"]:not([id])');
    const s = getComputedStyle(u), r = u.getBoundingClientRect(), t = e.getBoundingClientRect();
    return { abierta: e.getAttribute('aria-expanded') === 'true', seVe: s.display !== 'none' && s.visibility === 'visible', abajo: r.top >= t.bottom, scroll: u.scrollHeight > u.clientHeight + 1, pe: s.pointerEvents, toque: [Math.round(t.top), Math.round(t.bottom)], burbuja: [Math.round(r.top), Math.round(r.bottom)] };
  }`;
  const encima = async (pg, boton, donde) => {
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(250);
    await boton.evaluate(eval(COLOCAR), 0.15);
    await pg.waitForTimeout(150);
    const q = await boton.evaluate((e) => { const b = e.getBoundingClientRect(), r = e.getClientRects()[0]; return { dx: r.left - b.left + r.width / 2, dy: r.top - b.top + r.height / 2 }; });
    await boton.tap({ position: { x: q.dx, y: q.dy } });
    await pg.waitForTimeout(300);
    const c = await boton.evaluate(eval(CASO_ENCIMA));
    if (!c.abierta || !c.seVe || !c.abajo || !c.scroll || c.pe !== 'auto') {
      malas.push(donde + ', la burbuja encima de su toque: no abrió abajo, scrolleando por dentro y con pointer-events:auto, y el caso no prueba nada ' + JSON.stringify(c));
    } else {
      const d = c.burbuja[0] - c.toque[0] + 12;
      await boton.evaluate((e, d) => window.scrollBy({ top: -d, behavior: 'instant' }), d);
      await pg.waitForTimeout(250);
      const abierta = (await boton.getAttribute('aria-expanded')) === 'true';
      const se = await seVeLa(boton);
      const l = await boton.evaluate(eval(LEER));
      const t2 = l.top;
      if (!(t2 > c.burbuja[0] && t2 < c.burbuja[1])) malas.push(donde + ', la burbuja encima de su toque: el salto de ' + d + ' px no dejó el toque donde estaba la burbuja (' + t2 + ', la burbuja en ' + c.burbuja.join('-') + '), y el caso no prueba nada');
      else {
        visto.encima++;
        if (!abierta || !se || !l.junto) malas.push(donde + ', con el toque debajo de donde estaba su burbuja (un salto de ' + d + ' px con el dedo): ' + JSON.stringify({ antes: c, abierta, seVe: se, junto: l.junto, toque: t2, burbuja: l.caja }));
      }
    }
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(250);
  };

  // (1) /planes a 1280, con el mouse: la banda de esperas y la tarjeta.
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
    // Marca la celda de la banda de esperas de cada fila y plan, por índice.
    const marcar = () => page.evaluate(() => {
      const t = document.querySelector('#comparar-planes');
      if (!t) return 0;
      const grupos = [...t.querySelectorAll('.cmp2-lab .cmp2-grupo-y-fila')];
      const desde = grupos.findIndex((g) => /Cuánto esperás/.test((g.querySelector('.cmp2-gt') || {}).textContent || ''));
      let n = 0;
      grupos.forEach((g, k) => {
        if (desde < 0 || k < desde) return;
        const fila = g.querySelector('.cmp2-c').textContent.trim();
        [...t.querySelectorAll('.cmp2-plan')].forEach((pl, i) => { const c = pl.querySelectorAll('.cmp2-c')[k]; if (c) { c.dataset.qaBanda = fila + '|' + i; n++; } });
      });
      return n;
    });
    if (!(await marcar())) malas.push('/planes 1280: no encuentro la banda «Cuánto esperás para usarlo»');
    const celda = (fila, i) => page.locator('[data-qa-banda="' + fila + '|' + i + '"]');
    const nota = async (fila, i) => { const n = celda(fila, i).locator('.cmp2-fam'); return (await n.count()) ? n.evaluate(eval(SE_VE)) : null; };
    if ((await nota('Ecografías', 0)) !== null) malas.push('/planes 1280, Ecografías, Essential: una nota que no va («' + (await nota('Ecografías', 0)) + '»)');
    for (const [i, plan] of [[1, 'Silver'], [2, 'Gold']]) {
      const n = await nota('Ecografías', i);
      const b = celda('Ecografías', i).locator('.cmp2-fam .txt[aria-describedby]');
      if (n !== NOTA || !(await b.count()) || (await b.textContent()).trim() !== NOTA) { malas.push('/planes 1280, Ecografías, ' + plan + ': ' + (n === null ? 'falta la nota' : '«' + n + '»') + ' (tiene que ser «' + NOTA + '» y tocarse)'); continue; }
      await abrirEn(page, b, false, TOQUE[plan], '/planes 1280, Ecografías, ' + plan);
      // Lo que oye el lector en la celda: la fila, el plan, la espera entera y la nota.
      const oye = oido(await celda('Ecografías', i).ariaSnapshot()).replace(/\s+,/g, ',');
      if (!new RegExp('^Ecografías, ' + plan + ': .*2 meses de espera, la mayoría').test(oye)) malas.push('/planes 1280, Ecografías, ' + plan + ': el lector oye «' + oye.slice(0, 80) + '»');
      if (i === 1) visto.compu = n;
    }
    // La fila de Ecografías a 320 px del borde de arriba: la burbuja de Silver
    // abre hacia arriba, sobre las cabeceras fijas. Silver arma su propia pila
    // (z-index 2) y la cabecera fija de Gold (4) se le pintaba encima; con un
    // toque abierto, la columna sube a 7 (globals.css). Autoprueba: sin esa
    // regla, la misma apertura tiene que dar «tapada».
    {
      const b = celda('Ecografías', 1).locator('.cmp2-fam .txt[aria-describedby]');
      if (await b.count()) {
        const l = await abrir(page, b, false, 320 / 900);
        if (!bienAbierto(l, TOQUE.Silver)) malas.push('/planes 1280, Ecografías, Silver con la fila a 320 px: ' + corto(l));
        await cerrar(page, false);
        const sacadas = await page.evaluate(() => {
          const fuera = [];
          const recorrer = (rules, padre) => { for (let i = rules.length - 1; i >= 0; i--) { const r = rules[i]; if (r.selectorText !== undefined) { if (/cmp2-plan:has\(/.test(r.selectorText)) { fuera.push({ padre, texto: r.cssText, i }); padre.deleteRule(i); } } else if (r.cssRules) recorrer(r.cssRules, r); } };
          for (const s of document.styleSheets) { try { recorrer(s.cssRules, s); } catch (e) { /* hoja de otro origen */ } }
          window.__qaReglas = fuera;
          return fuera.length;
        });
        const lSin = await abrir(page, b, false, 320 / 900);
        await cerrar(page, false);
        await page.evaluate(() => { for (const f of window.__qaReglas || []) f.padre.insertRule(f.texto, f.i); });
        const lCon = await abrir(page, b, false, 320 / 900);
        await cerrar(page, false);
        if (sacadas !== 1 || !lSin.tapadas || !bienAbierto(lCon, TOQUE.Silver)) malas.push('autoprueba de la cabecera de Gold: reglas sacadas ' + sacadas + ', sin la regla ' + corto(lSin) + ', devuelta ' + corto(lCon));
      }
    }
    {
      const n = await nota('Cirugías programadas', 0);
      const b = celda('Cirugías programadas', 0).locator('.cmp2-fam .txt[aria-describedby]');
      if (n !== '1 cirugía/familia/año, ' + PALABRA_26 || !(await b.count()) || (await b.textContent()).trim() !== PALABRA_26) malas.push('/planes 1280, Cirugías programadas, Essential: ' + (n === null ? 'falta la nota' : '«' + n + '»') + ' (tiene que ser «1 cirugía/familia/año, ' + PALABRA_26 + '», y tocarse solo «' + PALABRA_26 + '»)');
      else {
        await abrirEn(page, b, false, 26, '/planes 1280, las 26');
        // Autoprueba en la página: el texto del lector sin «sacar un nódulo de la
        // mama» tiene que fallar; devuelto, pasar.
        await abrir(page, b, false, 0.5);
        const sab = await b.evaluate((e, t) => { const d = document.getElementById(e.getAttribute('aria-describedby')); const antes = d.textContent; d.textContent = t; return antes; }, T26.replace('; sacar un nódulo de la mama', ''));
        const lMala = await b.evaluate(eval(LEER));
        await b.evaluate((e, t) => { document.getElementById(e.getAttribute('aria-describedby')).textContent = t; }, sab);
        const lBuena = await b.evaluate(eval(LEER));
        // El scroll de adentro lo mide abrirEn; acá se mira solo el texto.
        lMala.sigue = lBuena.sigue = true;
        if (bien26(lMala) || !bien26(lBuena)) malas.push('autoprueba de las 26 en la página: sin «sacar un nódulo de la mama» ' + (bien26(lMala) ? 'pasa' : 'falla') + ', devuelta ' + (bien26(lBuena) ? 'pasa' : 'falla'));
        await cerrar(page, false);
        await seguir(page, b, 'teclado', 26, '/planes 1280, las 26');
        // Autoprueba del alto: la misma burbuja con 89 px de alto (la rendija que
        // se veía en el simulador a 1280 con el Term de 40d36ad) tiene que fallar.
        await abrir(page, b, false, 0.5);
        const lChica = await b.evaluate((e, LEER) => { const u = e.parentElement.querySelector(':scope > [aria-hidden="true"]:not([id])'); const m = u.style.maxHeight, o = u.style.overflowY; u.style.maxHeight = '89px'; u.style.overflowY = 'auto'; const r = eval(LEER)(e); u.style.maxHeight = m; u.style.overflowY = o; return r; }, LEER);
        lChica.sigue = true;
        if (grande(lChica)) malas.push('autoprueba del alto: la lista de las 26 con 89 px de alto pasa (' + corto(lChica) + ')');
        await cerrar(page, false);
      }
    }
    // Autoprueba de «entera» y «tapadas» con el toque de Silver abierto.
    {
      const b = celda('Ecografías', 1).locator('.cmp2-fam .txt[aria-describedby]');
      if (await b.count()) {
        const l0 = await abrir(page, b, false, 0.5);
        const corrida = await b.evaluate((e, LEER) => { const u = e.parentElement.querySelector(':scope > [aria-hidden="true"]:not([id])'); const t = u.style.top; u.style.top = '-2000px'; const r = eval(LEER)(e); u.style.top = t; return r; }, LEER);
        // Una franja de 40 px sobre el medio de la burbuja: las cuatro esquinas
        // quedan libres; solo la grilla la ve.
        const tapada = await b.evaluate((e, LEER) => { const u = e.parentElement.querySelector(':scope > [aria-hidden="true"]:not([id])'); const q = u.getBoundingClientRect(); const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:' + q.left + 'px;top:' + (q.top + q.height / 2 - 20) + 'px;width:' + q.width + 'px;height:40px;z-index:1000;background:#fff'; document.body.appendChild(d); const r = eval(LEER)(e); d.remove(); return r; }, LEER);
        const l1 = await b.evaluate(eval(LEER));
        if (!bienAbierto(l0, TOQUE.Silver) || corrida.entera || !tapada.tapadas || !bienAbierto(l1, TOQUE.Silver)) malas.push('autoprueba de la burbuja: corrida ' + JSON.stringify({ entera: corrida.entera }) + ', tapada por el medio ' + JSON.stringify({ tapadas: tapada.tapadas }) + ', antes y después ' + bienAbierto(l0, TOQUE.Silver) + '/' + bienAbierto(l1, TOQUE.Silver));
        await cerrar(page, false);
      }
    }
    // El teclado (verificador de código, 23/10): con Tab se abre; Escape la
    // cierra; Enter la vuelve a abrir y la cierra; Espacio también (tercera
    // tanda: si alguien sacaba el Espacio del toque, la prueba seguía en verde), y
    // sin mover la página: el Espacio, en un span, scrollea si no se le gana la
    // tecla. Hasta el 23/10, después del Escape no había forma de reabrirla sin
    // salir y volver a entrar. En un toque de la banda (span con role="button") y
    // en una palabra del glosario (un botón), si la página la trae.
    {
      const prueba = async (b) => {
        await b.evaluate(eval(COLOCAR), 0.5);
        await page.mouse.move(5, 5);
        await b.evaluate((e) => { const f = [...document.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"]),input,select,textarea')].filter((x) => x.getClientRects().length); f[f.indexOf(e) - 1].focus(); });
        const pasos = [];
        for (const k of ['Tab', 'Escape', 'Enter', 'Enter', 'Space', 'Space']) {
          const y0 = await page.evaluate(() => scrollY);
          await page.keyboard.press(k); await page.waitForTimeout(250);
          const dy = Math.round((await page.evaluate(() => scrollY)) - y0);
          pasos.push(k + ' ' + (await b.getAttribute('aria-expanded')) + (await b.evaluate((e) => document.activeElement === e) ? '' : ' (sin foco)') + (k === 'Space' && dy ? ' (movió la página ' + dy + ' px)' : ''));
        }
        await page.keyboard.press('Escape');
        return pasos;
      };
      const ESPERADO = ['Tab true', 'Escape false', 'Enter true', 'Enter false', 'Space true', 'Space false'];
      // Autoprueba del «movió la página»: el Espacio sin nadie que se lo gane (el
      // foco en el cuerpo de la página) scrollea, y la medida lo tiene que ver.
      {
        await page.evaluate(() => { window.scrollTo({ top: 0, behavior: 'instant' }); if (document.activeElement) document.activeElement.blur(); });
        const y0 = await page.evaluate(() => scrollY);
        await page.keyboard.press('Space'); await page.waitForTimeout(400);
        const dy = Math.round((await page.evaluate(() => scrollY)) - y0);
        if (!(dy > 0)) malas.push('autoprueba del teclado: el Espacio en el cuerpo de la página no movió la página (' + dy + ' px), así que la medida no ve un scroll');
      }
      const toques = [celda('Cirugías programadas', 0).locator('.cmp2-fam .txt[aria-describedby]'), celda('Ecografías', 1).locator('.cmp2-fam .txt[aria-describedby]')];
      const glosario = page.locator('button.txt[aria-describedby]:visible').first();
      if (await glosario.count()) toques.push(glosario);
      for (const b of toques) {
        if (!(await b.count())) continue;
        const pasos = await prueba(b);
        if (JSON.stringify(pasos) !== JSON.stringify(ESPERADO)) malas.push('teclado, «' + (await b.textContent()).trim() + '»: ' + pasos.join(' · ') + ' (tiene que ser ' + ESPERADO.join(' · ') + ')');
      }
      visto.teclado = toques.length;
    }
    // El toque debajo de la cabecera pegajosa de su plan (ronda 3): la
    // ecografía de Silver y las 26 de Essential, abiertas con Tab.
    for (const [b, esperado, donde] of [[celda('Ecografías', 1).locator('.cmp2-fam .txt[aria-describedby]'), TOQUE.Silver, '/planes 1280, Ecografías, Silver'], [celda('Cirugías programadas', 0).locator('.cmp2-fam .txt[aria-describedby]'), 26, '/planes 1280, las 26']]) {
      if (await b.count()) await tapadoPorCabecera(page, b, esperado, donde);
    }
    // La tarjeta de la ecografía (se abre al pasar el mouse por el nombre): la
    // espera con su condición y la lista, en oraciones, en el pie.
    {
      const srv = page.locator('#comparar-planes .cmp2-lab .cmp2-srv', { hasText: /^Ecografía$/ }).first();
      await srv.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.mouse.move(5, 5);
      const c = await srv.boundingBox();
      await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
      await page.waitForTimeout(250);
      const t = await page.evaluate(() => { const t = document.querySelector('#comparar-planes .cmp2-tarjeta'); if (!t) return null; const p = [...t.querySelectorAll('.cmp2-tarjeta-p')].map((x) => x.lastElementChild.textContent.trim()); return { p, pie: ((t.querySelector('.cmp2-tarjeta-pie') || {}).textContent || '').trim() }; });
      const LINEA = 'La mayoría, sin tope. 2 meses de espera, la mayoría.';
      if (!t || t.p[1] !== LINEA || t.p[2] !== LINEA || t.pie !== EN_TEXTO) malas.push('/planes 1280, tarjeta de la ecografía: ' + JSON.stringify(t && { silver: t.p[1], gold: t.p[2], pie: t.pie.slice(0, 60) }));
      await page.mouse.move(5, 5);
    }
    // Autoprueba: sin la nota (lo que mostraba 35165a7), «falta la nota».
    await page.evaluate(() => { const c = document.querySelector('[data-qa-banda="Ecografías|1"] .cmp2-fam'); if (c) c.remove(); });
    if ((await nota('Ecografías', 1)) !== null) malas.push('autoprueba: borrada la nota de Silver, la lectura igual la encuentra');
    await page.close();
  }

  // (2) /planes en el celular, con el dedo: el cuadro de esperas y la hoja.
  // Lo que se sale del encabezado de su fila: cada renglón de texto visible
  // contra el borde derecho del encabezado (el control de desborde de la página
  // no lo ve: scrollWidth sigue igual). «de una lista de 26.» se salía 17 px a
  // 360 (verificador de código, 23/10).
  const SALE = `(rh) => {
    const R = rh.getBoundingClientRect().right;
    let max = 0;
    const w = document.createTreeWalker(rh, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (n.parentElement.closest('[aria-hidden="true"], .sr-solo')) continue;
      const g = document.createRange(); g.selectNodeContents(n);
      for (const q of g.getClientRects()) if (q.width) max = Math.max(max, q.right - R);
    }
    return Math.round(max * 10) / 10;
  }`;
  for (const [w, h] of [[360, 780], [390, 844], [430, 932]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    const cel = await ctx.newPage();
    await cel.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
    const vp = w + ' × ' + h;
    const fila = (que) => cel.locator('.cmp-cel [role="table"] [role="row"]', { has: cel.locator('[role="rowheader"]', { hasText: que }) }).first();
    const small = async (que) => { const s = fila(que).locator('[role="rowheader"] small'); return (await s.count()) ? s.evaluate(eval(SE_VE)) : null; };
    {
      const n = await small('Ecografías');
      const b = fila('Ecografías').locator('small .txt[aria-describedby]');
      if (n !== 'En Silver y Gold, la mayoría.' || !(await b.count())) malas.push(vp + ', cuadro de esperas, Ecografías: ' + (n === null ? 'falta la nota' : '«' + n + '»'));
      else await abrirEn(cel, b, true, TOQUE.juntos, vp + ', cuadro de esperas, Ecografías');
      if (w === 390) visto.cel = n;
    }
    {
      // «la mayoría» de Silver y Gold va por plan, después de Essential (11,
      // verificador de textos, 23/10): un «La mayoría.» suelto delante parecía
      // valer también para Essential.
      const n = await small('Cirugías programadas');
      const b = fila('Cirugías programadas').locator('small .txt[aria-describedby]');
      if (n !== 'En Essential, una al año por familia, ' + PALABRA_26 + '. En Silver y Gold, la mayoría.' || !(await b.count()) || (await b.textContent()).trim() !== PALABRA_26) malas.push(vp + ', cuadro de esperas, Cirugías programadas: ' + (n === null ? 'falta la nota' : '«' + n + '»'));
      else {
        await abrirEn(cel, b, true, 26, vp + ', cuadro de esperas, las 26');
        await seguir(cel, b, 'dedo', 26, vp + ', cuadro de esperas, las 26');
        // Solo a 360: a 390 y 430, con la fila al 15 %, la lista entra y la
        // burbuja no scrollea por dentro (medido por el verificador).
        if (w === 360) await encima(cel, b, vp + ', cuadro de esperas, las 26');
      }
    }
    // Nada se sale del encabezado de su fila. Autoprueba: una palabra larga que
    // no se parte, metida en el encabezado de Cirugías, tiene que salirse.
    {
      const sale = await cel.evaluate((f) => [...document.querySelectorAll('.cmp-cel [role="table"] [role="rowheader"]')].map((rh) => [rh.firstChild.textContent.trim(), eval(f)(rh)]).filter((x) => x[1] > 0.5), SALE);
      const auto = await fila('Cirugías programadas').locator('[role="rowheader"]').evaluate((rh, f) => { const s = document.createElement('span'); s.style.whiteSpace = 'nowrap'; s.textContent = ' de una lista larguísima de 26.'; rh.querySelector('small').appendChild(s); const r = eval(f)(rh); s.remove(); return r; }, SALE);
      if (sale.length) malas.push(vp + ', cuadro de esperas: se sale del encabezado de su fila ' + sale.map((x) => x[0] + ' ' + x[1] + ' px').join(', '));
      if (!(auto > 0.5)) malas.push(vp + ', autoprueba del desborde de la fila: una frase que no se parte no se sale (' + auto + ')');
    }
    // Lo que oye el lector (el árbol de accesibilidad de Chromium, por CDP): el
    // encabezado de fila se llama con lo que se ve, sin la lista (el texto del
    // lector de la burbuja lleva aria-hidden); la lista llega como descripción
    // del toque. Hasta el 23/10 «Cirugías programadas» se llamaba con las 26
    // enteras (839 caracteres) y terminaba con un punto doble. Autoprueba: la
    // lista metida en el encabezado, sin aria-hidden, tiene que verse.
    {
      const cdp = await ctx.newCDPSession(cel);
      const arbol = async () => (await cdp.send('Accessibility.getFullAXTree')).nodes;
      const val = (x) => (x && x.value) || '';
      const leerArbol = (nodos) => ({
        filas: nodos.filter((n) => val(n.role) === 'rowheader').map((n) => val(n.name)),
        toques: nodos.filter((n) => val(n.role) === 'button' && /^(la mayoría|de una lista de 26)$/.test(val(n.name))).map((n) => ({ nombre: val(n.name), desc: val(n.description) })),
      });
      const a = leerArbol(await arbol());
      const plano = (t) => t.replace(/\s+/g, '').replace(/\.+/g, '.');
      const vistos = new Set((await cel.evaluate((f) => [...document.querySelectorAll('[role="rowheader"]')].map((rh) => eval(f)(rh)), SE_VE)).map(plano));
      const filasMal = a.filas.filter((n) => !vistos.has(plano(n)) || n.length > 120 || /Ecografías que esperan|Las 26 cirugías|\.\s*\./.test(n));
      if (!a.filas.some((n) => /^Ecografías/.test(n)) || !a.filas.some((n) => /^Cirugías programadas/.test(n))) filasMal.push('no encuentro los encabezados de Ecografías y de Cirugías en el árbol');
      const eco = a.toques.find((t) => t.nombre === 'la mayoría'), cir = a.toques.find((t) => t.nombre === PALABRA_26);
      if (a.filas.length < 5 || filasMal.length) malas.push(vp + ', lector: el encabezado de fila no se llama con lo que se ve · ' + filasMal.map((x) => x.length + ' caracteres: «' + x.slice(0, 70) + '»').join(' · '));
      if (!eco || eco.desc !== TOQUE.juntos || !cir || difs26(cir.desc).length) malas.push(vp + ', lector: la descripción del toque no trae la lista · ' + JSON.stringify({ eco: eco && eco.desc.slice(0, 50), cir: cir && cir.desc.slice(0, 50) }));
      if (w === 390) {
        const id = await fila('Cirugías programadas').locator('small .txt[aria-describedby]').getAttribute('aria-describedby');
        await cel.evaluate((id) => { const d = document.getElementById(id); window.__qaAria = d.getAttribute('aria-hidden'); d.removeAttribute('aria-hidden'); }, id);
        const sin = leerArbol(await arbol()).filas.find((n) => /^Cirugías programadas/.test(n)) || '';
        await cel.evaluate((id) => { document.getElementById(id).setAttribute('aria-hidden', window.__qaAria); }, id);
        if (!(sin.length > 120)) malas.push('autoprueba del lector: sin aria-hidden, el encabezado de Cirugías mide ' + sin.length + ' caracteres');
        visto.fila = (a.filas.find((n) => /^Cirugías programadas/.test(n)) || '').length;
      }
      await cdp.detach();
    }
    if (w === 390) {
      // La hoja de la ecografía, desde «Los once servicios».
      await cel.locator('.cmp-cel button', { hasText: 'Los once servicios, plan por plan' }).tap();
      await cel.waitForTimeout(450);
      await cel.locator('.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo button.fila', { hasText: /^Ecografía/ }).first().tap();
      await cel.waitForTimeout(450);
      const hj = await cel.evaluate(() => { const d = document.querySelector('.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo'); if (!d) return null; return { texto: d.textContent.replace(/\s+/g, ' '), planes: [...d.querySelectorAll('.sq')].map((x) => x.textContent) }; });
      const PILDORA = '2 meses de espera, la mayoría';
      if (!hj || !hj.texto.includes(EN_TEXTO) || /Las demás, 2 meses/.test(hj.texto) || !hj.planes[1] || !hj.planes[1].includes(PILDORA) || !hj.planes[2] || !hj.planes[2].includes(PILDORA) || (hj.planes[0] || '').includes('la mayoría')) malas.push('390, hoja de la ecografía: ' + JSON.stringify(hj && { lista: hj.texto.includes(EN_TEXTO), planes: hj.planes.map((x) => x.slice(-40)) }));
    }
    await ctx.close();
  }

  // (3) El simulador, a 360, 390 y 430 con el dedo y a 1280 con el mouse, con
  // el porqué de Essential (10A: «una cirugía al año por familia, de una lista
  // de 26», como el cuadro y el simulador; decía «las cirugías», sin más).
  const ESS_PORQUE = 'Cobertura de entrada con el precio de tu zona: consultas sin tope en Lister, urgencias 24 h y estudios del día a día. La internación, el parto y una cirugía al año por familia, de una lista de 26, se cubren al año de afiliarte.';
  for (const [w, h, dedo] of [[360, 780, true], [390, 844, true], [430, 932, true], [1280, 900, false]]) {
    const ctx = await browser.newContext(dedo ? { viewport: { width: w, height: h }, isMobile: true, hasTouch: true } : { viewport: { width: w, height: h } });
    const pg = await ctx.newPage();
    for (const plan of ['silver', 'gold', 'essential']) {
      await pg.goto(BASE + '/simulador/?plan=' + plan, { waitUntil: 'networkidle' });
      for (let i = 0; i < 14; i++) {
        if (await pg.locator('[data-sp-carencias]').count()) break;
        let hecho = false;
        for (const t of ['Empecemos', 'Para mí', 'Asunción', 'Continuar', 'Ver mi precio']) { const b = pg.locator('button:visible', { hasText: t }).first(); if (await b.count()) { await b.click().catch(() => {}); hecho = true; break; } }
        if (!hecho) break;
        await pg.waitForTimeout(450);
      }
      const fila = (que) => pg.locator('[data-sp-carencias] [data-sp-carencia-row]', { hasText: que }).first();
      const notaDe = async (que) => { const s = fila(que).locator(':scope > span:first-child > span'); return (await s.count()) ? s.evaluate(eval(SE_VE)) : null; };
      if (!(await pg.locator('[data-sp-carencias]').count())) { malas.push('simulador ' + w + ', ' + plan + ': no llega a las esperas'); continue; }
      const n = await notaDe('Ecografías');
      if (plan === 'essential') {
        if (n !== null) malas.push('simulador ' + w + ', Essential, Ecografías: una nota que no va («' + n + '»)');
        const c = await notaDe('Cirugías programadas');
        const b = fila('Cirugías programadas').locator('.txt[aria-describedby]');
        if (c !== 'una al año por familia, ' + PALABRA_26 || !(await b.count())) malas.push('simulador ' + w + ', Essential, Cirugías programadas: ' + (c === null ? 'falta la nota' : '«' + c + '»'));
        else {
          await abrirEn(pg, b, dedo, 26, 'simulador ' + w + ', las 26');
          await seguir(pg, b, dedo ? 'dedo' : 'teclado', 26, 'simulador ' + w + ', las 26');
          if (!dedo) { await recortado(pg, b, 'simulador ' + w + ', las 26'); await asoma(pg, b, 'simulador ' + w + ', las 26'); }
        }
        const porque = await pg.evaluate(() => { const p = document.querySelector('[data-sp-price]'); const c = p && p.closest('div.sq'); return c ? [...c.querySelectorAll('p')].map((x) => x.innerText.replace(/\s+/g, ' ').trim()) : []; });
        if (!porque.includes(ESS_PORQUE) || porque.some((x) => /las cirugías y el parto/.test(x))) malas.push('simulador ' + w + ', el porqué de Essential: ' + JSON.stringify(porque.find((x) => /^Cobertura de entrada/.test(x)) || porque.slice(0, 2)));
      } else {
        const P = plan === 'silver' ? 'Silver' : 'Gold';
        const b = fila('Ecografías').locator('.txt[aria-describedby]');
        if (n !== NOTA || !(await b.count())) malas.push('simulador ' + w + ', ' + P + ', Ecografías: ' + (n === null ? 'falta la nota' : '«' + n + '»'));
        else await abrirEn(pg, b, dedo, TOQUE[P], 'simulador ' + w + ', ' + P);
      }
    }
    await ctx.close();
  }

  // (4) Las preguntas frecuentes del home, abiertas como las abre una persona:
  // la de las esperas nombra las cinco de Gold y manda al asesor por la de
  // vejiga (decía «otras seis»: 12, verificador de textos, 23/10); la de la
  // diferencia dice la cirugía de Essential con su condición (10A).
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const abrirFaq = async (q) => {
      const btn = page.locator('button[aria-controls]', { hasText: q }).first();
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      await page.waitForTimeout(400);
      return btn.evaluate((b) => { const r = document.getElementById(b.getAttribute('aria-controls')); return r ? r.innerText.replace(/\s+/g, ' ') : ''; });
    };
    const r = await abrirFaq('¿Cuánto tengo que esperar para usar mi plan?');
    const debe = ['ecografías, 2 meses la mayoría y 3 las del embarazo y las Doppler (en Gold, también ' + GOLD5 + ', y ' + VEJ + ')', 'cirugías (una al año por familia, de una lista de 26)'];
    const faltan = debe.filter((x) => !r.includes(x));
    if (faltan.length || /laboratorio y ecografías, unos 2 meses|otras seis/.test(r)) malas.push('home, FAQ de las esperas: ' + (faltan.length ? 'no dice «' + faltan.join('» ni «') + '»' : 'sigue diciendo «otras seis» o «unos 2 meses»'));
    const d = await abrirFaq('¿Cuál es la diferencia entre Essential, Silver y Gold?');
    const DIF = 'La internación, el parto y una cirugía al año por familia, de una lista de 26, los cubre al año de afiliarte, y varios topes son por familia.';
    if (!d.includes(DIF) || /las cirugías y el parto/.test(d)) malas.push('home, FAQ de la diferencia: no dice «' + DIF + '»');
    await page.close();
  }

  if (malas.length) mal('9A y 10A: «la mayoría» de las ecografías de Silver y Gold y «' + PALABRA_26 + '» de Essential, a la vista y con su lista a un toque, entera, sin nada encima y donde se abra · ' + malas.slice(0, 8).join(' · ') + (malas.length > 8 ? ' · (y ' + (malas.length - 8) + ' más)' : ''));
  else bien('9A y 10A: Silver y Gold «2 meses · ' + visto.compu + '» → las ecografías que esperan 3 meses (las siete del embarazo y cinco Doppler; en Gold, cinco más y la de vejiga al asesor), y Essential «1 cirugía/familia/año, ' + PALABRA_26 + '» → las 26 a cielo abierto, en el orden del cuadernillo, con el anestesista y la videolaparoscopía: en la banda de esperas de /planes a 1280 con el mouse (también con la fila a 320 px, sobre las cabeceras fijas), en el cuadro del celular a 360, 390 y 430 con el dedo («' + visto.cel + '»), en el simulador a 360, 390, 430 y 1280, cada toque con la fila al 25, 50 y 85 % del alto (' + visto.posiciones + ' aperturas): lo oye el lector, la burbuja (fija, junto a su toque, sin marco del fixed) se ve entera, sin nada encima (5 × 5 puntos) y grande (el alto más chico que se vio: las 26, ' + altos[26] + ' px; las ecografías, ' + altos.eco + ' px; mínimo ' + ALTO_MIN + ' o la lista entera) y, si no entra, scrollea por dentro con el dedo y con el mouse sin cerrarse; al scrollear la página o su caja se reacomoda junto al toque, se esconde mientras el toque está fuera de la pantalla y vuelve junto a él (' + visto.seguir + ' veces), y también mientras su caja lo esconde (el simulador a 1280 con el teclado, ' + visto.recortado + (visto.recortado === 1 ? ' borde' : ' bordes') + ') o la cabecera pegajosa de su plan lo tapa (/planes a 1280 con el teclado y la rueda, ' + visto.cabecera + ' toques); con el toque asomando 3 y 7 px debajo de la cabecera del sitio, el mouse la abre a la vista y junto a él (' + visto.asoma + ' veces); con el toque debajo de donde estaba su burbuja después de un salto de scroll, sigue abierta, a la vista y junto a él (el cuadro a 360 con el dedo, ' + visto.encima + (visto.encima === 1 ? ' vez' : ' veces') + '); con el dedo, el primer cuadro en que se dibuja ya está junto a su toque y debajo de la cabecera (' + visto.cuadros + ' toques); el teclado la abre y la cierra con Enter y con Espacio, sin mover la página (' + visto.teclado + ' toques); el encabezado de fila se llama con lo que se ve (' + visto.fila + ' caracteres en Cirugías, a 390) y nada se sale de él; la tarjeta y la hoja de la ecografía lo dicen en oraciones, y las preguntas frecuentes y el porqué de Essential también; los detectores fallan con la lista mala, la burbuja corrida o tapada, la cabecera de Gold sin su arreglo, la lista en el encabezado y una frase que se sale');
}

// ── «Compartir cotización» no mueve nada al copiar (#60, tercera tanda del 23/10) ──
// Sin Web Share (la computadora con Linux y, deducido sin verificar, los
// navegadores de adentro de Instagram y Facebook en Android), el botón copia y
// su texto pasa a «¡Copiado!», que es más corto: a 360 y 390 los dos botones
// entraban en un renglón y todo lo de abajo subía 54 px, y a los 2,2 s bajaba,
// con el botón corriéndose de debajo del dedo (verificador de código, 23/10).
// Ahora el texto largo va escondido en la misma celda de una grilla y el botón
// mide siempre lo de «Compartir cotización». Se mide, con navigator.share sacado
// y el portapapeles permitido, el link «Ver el detalle de los planes» y el ancho
// de los dos botones antes y después de tocar; el lector oye lo que se ve.
// Autoprueba: sin el texto largo escondido (lo de antes), el link se mueve.
console.log('\n── «Compartir cotización» no mueve nada al copiar (#60)');
{
  const malas = [], visto = [];
  for (const [w, h] of [[360, 780], [390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, permissions: ['clipboard-read', 'clipboard-write'] });
    await ctx.addInitScript(() => { try { Object.defineProperty(Navigator.prototype, 'share', { value: undefined, configurable: true }); } catch (e) { /* ya no está */ } });
    const pg = await ctx.newPage();
    await pg.goto(BASE + '/simulador/?plan=silver', { waitUntil: 'networkidle' });
    for (let i = 0; i < 14 && !(await pg.locator('[data-sp-price]').count()); i++) {
      let hecho = false;
      for (const t of ['Empecemos', 'Para mí', 'Asunción', 'Continuar', 'Ver mi precio']) { const b = pg.locator('button:visible', { hasText: t }).first(); if (await b.count()) { await b.click().catch(() => {}); hecho = true; break; } }
      if (!hecho) break;
      await pg.waitForTimeout(450);
    }
    // Por el nombre que oye el lector: el texto del botón trae también el largo
    // escondido.
    const comp = pg.getByRole('button', { name: /^(Compartir cotización|¡Copiado!)$/ }).first();
    const link = pg.locator('a', { hasText: 'Ver el detalle de los planes' }).first();
    if (!(await comp.count()) || !(await link.count())) { malas.push(w + ': no llego a «Compartir cotización» (' + (await comp.count()) + ') ni al link de abajo (' + (await link.count()) + ')'); await ctx.close(); continue; }
    await comp.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await pg.waitForTimeout(150);
    const medir = async () => ({
      y: Math.round((await link.boundingBox()).y),
      anchos: await pg.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /^(Descargar cotización|Compartir cotización|¡Copiado!)$/.test(b.innerText.trim())).map((b) => Math.round(b.getBoundingClientRect().width))),
      texto: (await comp.innerText()).trim(),
      oye: oido(await comp.ariaSnapshot()),
    });
    const tocar = async () => { const a = await medir(); await comp.click(); await pg.waitForTimeout(300); const d = await medir(); return { a, d }; };
    const { a, d } = await tocar();
    if (d.texto !== '¡Copiado!') malas.push(w + ': al tocar sin Web Share no dice «¡Copiado!» («' + d.texto + '»): no se puede medir');
    else if (Math.abs(d.y - a.y) > 0.5 || JSON.stringify(a.anchos) !== JSON.stringify(d.anchos)) malas.push(w + ': al copiar, el link de abajo se movió ' + (d.y - a.y) + ' px y los botones pasaron de ' + a.anchos.join('/') + ' a ' + d.anchos.join('/') + ' px');
    if (a.oye !== 'Compartir cotización' || d.oye !== '¡Copiado!') malas.push(w + ': el lector oye «' + a.oye + '» y, al copiar, «' + d.oye + '» (tiene que ser lo que se ve)');
    visto.push(w + ': ' + a.anchos.join('/') + ' px, el link en ' + a.y + ' antes y ' + d.y + ' después');
    // Autoprueba: lo de antes (sin el texto largo escondido) tiene que moverse.
    await pg.waitForTimeout(2400);
    await comp.evaluate((e) => { const x = e.querySelector('[aria-hidden="true"]'); if (x) x.remove(); });
    await pg.waitForTimeout(100);
    const sab = await tocar();
    if (!(Math.abs(sab.d.y - sab.a.y) > 0.5)) malas.push(w + ': autoprueba, sin el texto largo escondido el link no se mueve (' + sab.a.y + ' → ' + sab.d.y + ')');
    await ctx.close();
  }
  if (malas.length) mal('«Compartir cotización» sin Web Share: ' + malas.join(' · '));
  else bien('«Compartir cotización» sin Web Share: al pasar a «¡Copiado!» no cambia el ancho de los botones ni se mueve nada de abajo, y el lector oye lo que se ve (' + visto.join('; ') + '); sin el texto largo escondido, el link se mueve');
}

// ── La nota de la cesárea del plegable, con letra de nota (cierre de la vuelta 3, 18/10) ──
// «Cesárea: preguntale a tu asesor» en el plegable «Internación, maternidad y
// topes» de /planes heredaba .disp y el 700 de la celda: se veía en Nunito Sans
// Bold, 12 px, #4F5C5B, mientras la misma frase en la tabla de esperas de arriba
// va con la nota de la celda (.cmp2-fam: Inter 400, 12 px, --sp-muted). Es una
// nota, y las notas van en Inter (regla tipográfica de CLAUDE.md). Se mide con
// getComputedStyle, que llama a la familia por su alias («inter» o «display»,
// BITACORA cap. 120), a 1280, 820, 430, 390 y 360 px: la nota del plegable con
// la letra, el peso, el tamaño y el color de la nota de la tabla, y ni la celda
// ni la página desbordan. El detector se prueba antes en la misma celda: una nota
// armada como la de antes (sin la clase, con el estilo escrito a mano) tiene que
// fallar, y una con la clase, pasar.
console.log('\n── La nota de la cesárea del plegable, con letra de nota (Inter)');
{
  const LETRA = `(e) => { const s = getComputedStyle(e); return { familia: s.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '').toLowerCase(), peso: s.fontWeight, tamaño: s.fontSize, color: s.color }; }`;
  // Inter 400 de 12 px y, si hay con qué comparar, lo mismo que la nota de la tabla.
  const esNota = (l, ref) => !!l && l.familia === 'inter' && l.peso === '400' && l.tamaño === '12px' && (!ref || JSON.stringify(l) === JSON.stringify(ref));
  const CELDA = `() => { const f = [...document.querySelectorAll('#detalle-internacion [role="row"]')].find((r) => /^Tiempo de espera para maternidad/.test((r.querySelector('[role="rowheader"]') || {}).textContent || '')); return f ? f.querySelectorAll('[role="cell"]')[2] : null; }`;
  const malas = [];
  const visto = [];
  let ref = null, auto = null;
  for (const width of [1280, 820, 430, 390, 360]) {
    const movil = width < 820;
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, isMobile: movil, hasTouch: movil });
    const page = await ctx.newPage();
    await page.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
    // La misma frase en la tabla de esperas (solo en la computadora): la referencia.
    if (!movil) {
      const r = await page.evaluate((fn) => { const n = [...document.querySelectorAll('#comparar-planes .cmp2-fam')].find((e) => /^Ces[aá]rea: /.test(e.textContent) && e.getClientRects().length); return n ? eval(fn)(n) : null; }, LETRA);
      if (!r) malas.push(width + ': la tabla de esperas no muestra la nota de la cesárea de Gold');
      else if (!ref) ref = r;
      else if (JSON.stringify(r) !== JSON.stringify(ref)) malas.push(width + ': la nota de la tabla cambia de letra con el ancho ' + JSON.stringify(r));
    }
    await page.waitForFunction(() => { const b = document.querySelector('button[aria-controls="detalle-internacion"]'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).catch(() => {});
    const btn = page.locator('button[aria-controls="detalle-internacion"]');
    await btn.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    if (movil) await btn.tap(); else await btn.click();
    await page.waitForTimeout(600);
    // El caso malo y el bueno, en la misma celda y leídos con la misma función.
    if (!auto) auto = await page.evaluate(([fl, fc]) => {
      const letra = eval(fl), celda = eval(fc)();
      if (!celda) return null;
      const caja = celda.firstElementChild || celda;
      const mala = document.createElement('span');
      mala.setAttribute('style', 'font-size:12px;color:var(--sp-estado-ink-2)');
      mala.textContent = 'Cesárea: preguntale a tu asesor';
      const buena = document.createElement('span');
      buena.className = 'cmp2-fam';
      buena.textContent = 'Cesárea: preguntale a tu asesor';
      caja.append(mala, buena);
      const r = { mala: letra(mala), buena: letra(buena) };
      mala.remove(); buena.remove();
      return r;
    }, [LETRA, CELDA]);
    const r = await page.evaluate(([fl, fc, fr]) => {
      const letra = eval(fl), celda = eval(fc)(), renglones = eval(fr);
      if (!celda) return null;
      const w = document.createTreeWalker(celda, NodeFilter.SHOW_TEXT);
      let nota = null;
      for (let n = w.nextNode(); n && !nota; n = w.nextNode()) if (/^Ces[aá]rea: /.test(n.data.trim())) nota = n.parentElement;
      return {
        letra: nota && letra(nota), renglones: nota ? renglones(nota).length : 0,
        celdaDesborda: celda.scrollWidth > celda.clientWidth + 1,
        pagina: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    }, [LETRA, CELDA, RENGLONES]);
    await ctx.close();
    if (!r || !r.letra) { malas.push(width + ': el plegable no muestra la nota de la cesárea en la maternidad de Gold'); continue; }
    if (!esNota(r.letra, ref)) malas.push(width + ': la nota del plegable va en ' + JSON.stringify(r.letra) + ' y la de la tabla, en ' + JSON.stringify(ref));
    if (r.celdaDesborda || r.pagina > 0) malas.push(width + ': desborda (' + JSON.stringify(r) + ')');
    visto.push(width + ' px, ' + r.renglones + (r.renglones === 1 ? ' renglón' : ' renglones'));
  }
  const autoBien = !!auto && !!ref && !esNota(auto.mala, ref) && esNota(auto.buena, ref);
  if (!autoBien) malas.unshift('el detector no distingue la nota armada como antes de la que lleva la clase: ' + JSON.stringify({ ref, auto }));
  if (malas.length) mal('la nota «Cesárea: preguntale a tu asesor» del plegable tiene que ir con la letra de la nota de la tabla (Inter 400, 12 px, el mismo color), sin desbordar · ' + malas.join(' · '));
  else bien('la nota de la cesárea del plegable va como la de la tabla (' + ref.familia + ' ' + ref.peso + ', ' + ref.tamaño + ', ' + ref.color + '), sin desbordar: ' + visto.join(' · ') + '; el detector rechaza la nota armada como antes (' + auto.mala.familia + ' ' + auto.mala.peso + ') y acepta la de la clase');
}

// ── La plata no se parte por dentro (P3A; comité, vuelta 3, 17/10/2026) ─────
// «Las cifras con plata no se cortan por dentro (espacio duro)». La forma corta
// lo cumplía, pero la lista de los once muestra oraciones de coverage.js con
// espacios comunes y partía «hasta Gs. 1,5 ⏎ millones» a 360 y 390 px. Ahora
// `duro` de coverage.js une «Gs.», la cifra y «mil/millón/millones». Se mide
// cada monto visible, carácter por carácter, en la lista, las líneas de las
// tarjetas y la tabla del home, a 360, 390 y 430: todo el monto en un renglón.
// El detector se prueba antes en una caja angosta: el monto con espacios comunes
// se parte (lo encuentra) y con espacio duro no. Falla en la build de 02c733a y
// pasa con el cambio.
console.log('\n── La plata no se parte por dentro (360, 390 y 430 px)');
{
  const PARTIDA = `(els) => els.filter((e) => e.getClientRects().length).flatMap((e) => {
    const cs = [];
    const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (n.parentElement.closest('.sr-solo')) continue;
      for (let i = 0; i < n.length; i++) {
        const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1);
        const b = r.getClientRects()[0];
        cs.push({ c: n.data[i], top: b && b.width ? b.top : null });
      }
    }
    const t = cs.map((x) => x.c).join('');
    const out = [];
    for (const m of t.matchAll(/Gs\\.[\\s\\u00a0]*\\d[\\d.,]*(?:[\\s\\u00a0](?:mil|millón|millones)(?![a-záéíóúñ]))?/g)) {
      const tops = cs.slice(m.index, m.index + m[0].length).map((x) => x.top).filter((y) => y !== null);
      if (tops.some((y) => Math.abs(y - tops[0]) > 4)) out.push(m[0].replace(/\\u00a0/g, ' '));
    }
    return out;
  })`;
  const malas = [];
  for (const width of [360, 390, 430]) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
    const cel = await ctx.newPage();
    await cel.goto(BASE + '/', { waitUntil: 'networkidle' });
    if (width === 360) {
      const prueba = await cel.evaluate((fn) => {
        const f = eval(fn);
        const caja = (t) => { const d = document.createElement('div'); d.style.cssText = 'width:9ch;font-size:16px'; d.textContent = t; document.body.appendChild(d); const r = f([d]).length; d.remove(); return r; };
        return { mala: caja('medicamentos hasta Gs. 1,5 millones'), buena: caja('medicamentos hasta Gs. 1,5 millones') };
      }, PARTIDA);
      if (prueba.mala !== 1 || prueba.buena !== 0) malas.push('el detector no distingue «Gs. 1,5 ⏎ millones» del monto con espacio duro: ' + JSON.stringify(prueba));
    }
    const home = await cel.evaluate((fn) => eval(fn)([...document.querySelectorAll('#cartilla .cmp2-plan .cmp2-v')]), PARTIDA);
    home.forEach((m) => malas.push(width + ' px, tabla del home: «' + m + '»'));
    await cel.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
    const lineas = await cel.evaluate((fn) => eval(fn)([...document.querySelectorAll('.cmp-cel article .linea-cel')]), PARTIDA);
    lineas.forEach((m) => malas.push(width + ' px, tarjetas de /planes: «' + m + '»'));
    await cel.locator('.cmp-cel button', { hasText: 'Los once servicios, plan por plan' }).tap();
    await cel.waitForTimeout(450);
    const lista = await cel.evaluate((fn) => eval(fn)([...document.querySelectorAll('.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo button.fila > span > span')]), PARTIDA);
    lista.forEach((m) => malas.push(width + ' px, lista de los once: «' + m + '»'));
    await ctx.close();
  }
  if (malas.length) mal('un monto con plata se parte por dentro · ' + malas.slice(0, 6).join(' · '));
  else bien('ningún monto con plata se parte por dentro en la tabla del home, las tarjetas de /planes ni la lista de los once (360, 390 y 430 px); el detector distingue el caso malo del bueno');
}

// ── Los montos, con la forma de la E3A en lo que se escanea (vuelta 3) ──────
// El mismo tope aparecía de tres formas en /planes: «Gs. 1,5 millones/evento» en
// la tabla, «Hasta Gs. 1,5 millones por evento» en la tarjeta y «Gs. 1.500.000»
// en el plegable de topes. La E3A pidió una sola forma, con los millones
// enteros: el plegable dice ahora «Gs. 1,5 millones», «Gs. 350 mil» (sin
// «/evento», porque su rótulo ya dice «(por evento)», como la internación dice
// «20 días/persona» bajo «(por año)»). Se mira todo monto de lo que se escanea
// (las celdas de las tablas del home y de /planes, el plegable abierto y la lista
// de los once): ninguno con puntos de miles ni «mill.». Los precios de la
// cabecera quedan fuera: son la E2A. Con su caso malo y su caso bueno. Falla en
// la build de 02c733a y pasa con el cambio.
console.log('\n── Los montos, con la forma de la E3A en lo que se escanea');
{
  const VIEJA = /Gs\.[\s ]*\d{1,3}(?:\.\d{3})+|\d mill\./;
  const auto = { malas: ['Gs. 1.500.000', 'Gs. 350.000', 'Gs. 1,5 mill.'].filter((t) => !VIEJA.test(t)), buenas: ['Gs. 1,5 millones', 'Gs. 350 mil/evento', 'Gs. 1 millón'].filter((t) => VIEJA.test(t)) };
  const malas = [];
  if (auto.malas.length || auto.buenas.length) malas.push('el detector no distingue la forma vieja de la de la E3A: ' + JSON.stringify(auto));
  const visible = (sel) => [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length).map((e) => { const k = e.cloneNode(true); k.querySelectorAll('.sr-solo').forEach((x) => x.remove()); return k.textContent; });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const [ruta, sel] of [['/', '#cartilla .cmp2-plan .cmp2-c'], ['/planes/', '#comparar-planes .cmp2-plan .cmp2-c']]) {
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
    (await page.evaluate(visible, sel)).filter((t) => VIEJA.test(t)).forEach((t) => malas.push(ruta + ' tabla: «' + t.match(VIEJA)[0] + '»'));
  }
  await page.waitForFunction(() => { const b = document.querySelector('button[aria-controls="detalle-internacion"]'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).catch(() => {});
  await page.click('button[aria-controls="detalle-internacion"]');
  await page.waitForTimeout(500);
  const pleg = await page.evaluate(visible, '#detalle-internacion .disp');
  pleg.filter((t) => VIEJA.test(t)).forEach((t) => malas.push('/planes plegable: «' + t.match(VIEJA)[0] + '»'));
  const montos = pleg.filter((t) => /Gs\./.test(t)).length;
  if (montos < 10) malas.push('/planes plegable: se esperaban los montos de los topes y de maternidad, hay ' + montos);
  await page.close();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const cel = await ctx.newPage();
  await cel.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  await cel.locator('.cmp-cel button', { hasText: 'Los once servicios, plan por plan' }).tap();
  await cel.waitForTimeout(450);
  (await cel.evaluate(visible, '.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo button.fila > span > span')).filter((t) => VIEJA.test(t)).forEach((t) => malas.push('lista: «' + t.match(VIEJA)[0] + '»'));
  await ctx.close();
  if (malas.length) mal('los montos de lo que se escanea van con la forma de la E3A («Gs. 1,5 millones», «Gs. 350 mil»), sin puntos de miles · ' + malas.slice(0, 6).join(' · '));
  else bien('los montos de las tablas, del plegable (' + montos + ') y de la lista van con la forma de la E3A, sin puntos de miles ni «mill.»; el detector distingue el caso malo del bueno');
}

// ── Una sola forma de mandar al asesor (R1A, Arturo, 17/10/2026) ────────────
// «Consultalo», «Consultalo con tu asesor» y «Confirmalo con tu asesor» pasaron
// a «Preguntale a tu asesor» (ASESOR de coverage.js). Se mira el texto que
// traen las páginas de la v1 (con lo que se abre al tocar) y el código de app/
// sin comentarios, porque el buscador de estudios guardado no tiene página. Y
// la fila de remedios en urgencias de Essential: la celda del home y la de
// /planes (texto, no botón: solo «¿quién?» es botón), y el «—» del plegable,
// que se leía «no cubre». Probado contra la rama sin la R1A (falla) y con ella
// (pasa), y contra la rama con la celda como botón (falla).
// Vuelta 3 (comité, 17/10): «una sola forma» se busca por clase, no por las dos
// palabras viejas. La Guía Médica decía «preguntá a tu asesor» y «Confirmá con
// tu asesor» (en el código de app/ y de lib/red-medica.js, no en la planilla):
// ahora se rechaza todo imperativo de preguntar, consultar o confirmar «a» o
// «con tu asesor» que no sea «preguntale a tu asesor» («lo confirmás con tu
// asesor», que no manda a preguntar, queda). El rótulo que manda al asesor sale
// de la constante ASESOR: ningún archivo fuera de coverage.js lo escribe como
// texto suelto (el buscador lo tenía escrito a mano). Una oración de coverage.js
// no se escribe otra vez en otro archivo (la nota de remedios de Essential
// estaba en el home con otras palabras), y la tarjeta del home la lee de ahí.
// Cada detector, contra un caso que tiene que fallar y uno que no.
console.log('\n── Una sola forma de mandar al asesor (R1A)');
{
  const { ASESOR } = COV;
  // Sin \b: textContent pega celdas vecinas («urgenciasConsultalo») y el límite de palabra no se ve.
  const VIEJAS = /(?:consult|confirm)[aá]lo/i;
  const FORMAS = /\b(?:pregunt|consult|confirm)[aá](?:le|lo|la|selo|les)?\s+(?:a|con)\s+tu\s+asesor/gi;
  const otraForma = (t) => (t.match(FORMAS) || []).filter((m) => m.toLowerCase().replace(/\s+/g, ' ') !== minus(ASESOR));
  const escRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const SUELTO = new RegExp('([\'"`])' + escRe(ASESOR) + '\\1|>\\s*' + escRe(ASESOR) + '\\s*<');
  // Las oraciones de coverage.js que la página muestra: cada una vive solo ahí.
  const ORACIONES = [...new Set(COV.coverage().flatMap((x) => [x.nota, x.notaAsesor, x.waitNote]).concat([COV.NOTA_UNIDAD]).filter(Boolean))];
  const copiadas = (fuente) => ORACIONES.filter((o) => fuente.includes(o));
  const autoprueba = {
    guia: otraForma('Antes de ir, preguntá a tu asesor qué cubre tu plan en odontología.').length,
    red: otraForma('Confirmá con tu asesor si atiende con tu plan.').length,
    consultala: otraForma('Consultá con tu asesor').length,
    buenas: otraForma('Preguntale a tu asesor si atiende. El detalle final lo confirmás con tu asesor. Decíselo a tu asesor.').length,
    rotuloAMano: SUELTO.test("{sinDato ? (plan.k === 'e' ? 'Preguntale a tu asesor' : 'Sin dato') : modo.k}"),
    rotuloConstante: SUELTO.test("{sinDato ? (plan.k === 'e' ? ASESOR : 'Sin dato') : modo.k}"),
    notaCopiada: copiadas("d: ['" + (COV.coverage().find((x) => x.name === 'Urgencia 24 h').notaAsesor) + "', 'Hasta…']").length,
    notaLeida: copiadas("d: [cartDe['Urgencia 24 h'].notaAsesor, 'Hasta…']").length,
  };
  const malas = [];
  if (!autoprueba.guia || !autoprueba.red || !autoprueba.consultala || autoprueba.buenas || !autoprueba.rotuloAMano || autoprueba.rotuloConstante || !autoprueba.notaCopiada || autoprueba.notaLeida) malas.push('los detectores no distinguen el caso malo del bueno: ' + JSON.stringify(autoprueba));
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const ruta of ['/', '/planes/', '/simulador/', '/guia-medica/', '/guia-medica/P-0001/']) {
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
    const texto = await page.evaluate(() => document.body.textContent);
    const m = [...(texto.match(new RegExp(VIEJAS.source, 'gi')) || []), ...otraForma(texto)];
    if (m.length) malas.push(ruta + ': ' + [...new Set(m)].join(', '));
  }
  // El código: sin comentarios, de app/ y de lib/ (la Guía Médica arma ahí sus
  // frases; lib/guia-medica.json sale de la planilla y no se mira).
  const { readdirSync } = await import('node:fs');
  const sinComentarios = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');
  const fuentes = [['app/', new URL('../app/', import.meta.url), true], ['lib/', new URL('../lib/', import.meta.url), false]];
  for (const [nombre, raiz, recursivo] of fuentes) {
    const archivos = readdirSync(raiz, { recursive: recursivo }).filter((f) => /\.(jsx?|mjs)$/.test(f) && !/^blog[\\/]/.test(f));
    for (const f of archivos) {
      const sin = sinComentarios(readFileSync(new URL(f, raiz), 'utf8'));
      if (VIEJAS.test(sin) || otraForma(sin).length) malas.push(nombre + f + ': ' + [...new Set(otraForma(sin))].join(', '));
      if (nombre + f === 'app/coverage.js') continue;
      if (SUELTO.test(sin)) malas.push(nombre + f + ': escribe «' + ASESOR + '» a mano, sin la constante ASESOR');
      copiadas(sin).forEach((o) => malas.push(nombre + f + ': copia una oración de coverage.js («' + o.slice(0, 40) + '…»)'));
    }
  }
  const celda = ([sel]) => {
    const pl = document.querySelectorAll(sel + ' .cmp2-plan')[0];
    const c = pl && [...pl.querySelectorAll('.cmp2-c')].find((x) => ((x.querySelector('.cmp2-l') || {}).textContent || '').trim() === 'Remedios en urgencias');
    if (!c) return null;
    const v = c.querySelector('.cmp2-v').cloneNode(true);
    v.querySelectorAll('.sr-solo').forEach((x) => x.remove());
    return { t: v.textContent.trim(), boton: !!c.querySelector('.cmp2-v .cmp2-duda') };
  };
  for (const [ruta, sel] of [['/', '#cartilla'], ['/planes/', '#comparar-planes']]) {
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
    const c = await page.evaluate(celda, [sel]);
    // Texto, no botón: solo «¿quién?» es botón (P3A; comité, vuelta 1, 17/10).
    if (!c || c.t !== ASESOR || c.boton) malas.push(ruta + ' remedios en urgencias de Essential (texto, no botón): ' + JSON.stringify(c));
  }
  const pleg = await page.evaluate(() => { const f = [...document.querySelectorAll('#detalle-internacion div')].find((d) => d.children.length === 4 && /^En urgencia/.test((d.firstElementChild || {}).textContent || '')); return f ? f.children[1].textContent.trim() : null; });
  if (pleg !== ASESOR) malas.push('/planes/ plegable, urgencia de Essential: ' + JSON.stringify(pleg));
  // El Cuadro 2 de Essential (186A, Arturo, 23/10/2026, sp-interno#186): el mismo
  // hueco de la fuente que la urgencia de arriba (null en essential-cobertura.json),
  // y su «—» se leía «no cubre». Silver y Gold siguen con su monto, y ninguna
  // celda del plegable queda en «—».
  const cuadro2 = await page.evaluate(() => { const f = [...document.querySelectorAll('#detalle-internacion div')].find((d) => d.children.length === 4 && /^En estudios y procedimientos/.test((d.firstElementChild || {}).textContent || '')); return f ? [...f.children].slice(1).map((c) => c.textContent.trim()) : null; });
  if (!cuadro2 || cuadro2[0] !== ASESOR || !/^Gs\.\s80\smil/.test(cuadro2[1]) || !/^Gs\.\s100\smil/.test(cuadro2[2])) malas.push('/planes/ plegable, Cuadro 2 (Essential al asesor; Silver y Gold con su monto): ' + JSON.stringify(cuadro2));
  const rayas = await page.evaluate(() => [...document.querySelectorAll('#detalle-internacion [role="cell"]')].filter((c) => c.textContent.trim() === '—').length);
  if (rayas) malas.push('/planes/ plegable: ' + rayas + ' celda(s) con «—»');
  // La tarjeta del home lee la nota de coverage.js (comité, vuelta 3): escrita a
  // mano en page.jsx decía «no fija este tope» y, en /planes, «no fija el tope de
  // remedios en urgencias». Y dice qué preguntar, con el molde de la G1A.
  const notaRem = COV.coverage().find((x) => x.name === 'Urgencia 24 h').notaAsesor;
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => { const b = document.querySelector('.cmp2-srv'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).catch(() => {});
  const srvRem = page.locator('#cartilla .cmp2-lab .cmp2-srv', { hasText: 'Remedios en urgencias' });
  let lineaRem = null;
  if (await srvRem.count()) {
    await srvRem.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(1200);
    const caja = await srvRem.boundingBox();
    await page.mouse.move(5, 5);
    await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await page.waitForTimeout(250);
    lineaRem = await page.evaluate(() => { const p = document.querySelector('#cartilla .cmp2-tarjeta .cmp2-tarjeta-p'); return p ? p.lastElementChild.textContent : null; });
    await page.mouse.move(5, 5);
  }
  if (lineaRem !== notaRem || !/^En Essential, preguntale a tu asesor cuánto /.test(notaRem || '')) malas.push('home, tarjeta de «Remedios en urgencias»: la línea de Essential tiene que ser la nota de coverage.js y decir qué preguntar (' + JSON.stringify({ linea: lineaRem, nota: notaRem }) + ')');
  await page.close();
  // El celular de /planes (comité, vuelta 2, 17/10): la lista de los once decía
  // «Consulta 24 h, desde el día uno» para Essential al lado del tope de Silver y
  // Gold, y la hoja «Urgencia 24 h» no traía ninguna nota. El silencio se leía
  // «no cubre remedios». Ahora la lista dice «Consulta 24 h · remedios» y manda
  // al asesor, y la hoja trae la nota de coverage.js. Falla en la build de
  // f40cc02 y pasa con el cambio.
  const notaUrg = COV.coverage().find((s) => s.name === 'Urgencia 24 h').notaAsesor;
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const cel = await ctx.newPage();
  await cel.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  await cel.locator('.cmp-cel button', { hasText: 'Los once servicios, plan por plan' }).tap();
  await cel.waitForTimeout(450);
  const filaUrg = '.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo button.fila';
  // Comité, vuelta 3: «Consulta 24 h · remedios» en su propio renglón y
  // «Preguntale a tu asesor» en el siguiente; pegados, se leía «remedios
  // Preguntale a tu asesor», con la mayúscula a mitad de renglón. Se mira cada
  // renglón como se ve (ninguno tiene «Preguntale» después de una minúscula), con
  // su caso malo armado en la misma página.
  const listaUrg = await cel.evaluate(([sel, fn]) => {
    const renglones = eval(fn);
    const b = [...document.querySelectorAll(sel)].find((x) => /^Urgencia 24 h/.test(x.querySelector('b').textContent));
    if (!b) return null;
    const col = b.querySelectorAll(':scope > span > span')[0];
    const lineas = [...col.children].filter((x) => x.tagName !== 'I').map((x) => x.textContent.replace(/\u00a0/g, ' ').trim());
    const pegadas = [...b.querySelectorAll(':scope > span > span')].flatMap((c) => renglones(c)).filter((t) => /[a-záéíóúñ]\s+Preguntale/.test(t));
    const caja = (html) => { const d = document.createElement('div'); d.style.cssText = 'width:120px;font-size:12.5px'; d.innerHTML = html; document.body.appendChild(d); const r = renglones(d).filter((t) => /[a-záéíóúñ]\s+Preguntale/.test(t)).length; d.remove(); return r; };
    return { lineas, pegadas, casoMalo: caja('<span>Consulta 24 h · remedios <b>Preguntale a tu asesor</b></span>'), casoBueno: caja('<span style="display:block">Consulta 24 h · remedios</span><b style="display:block">Preguntale a tu asesor</b>') };
  }, [filaUrg, RENGLONES]);
  if (!listaUrg || listaUrg.lineas[0] !== 'Consulta 24 h · remedios' || listaUrg.lineas[1] !== ASESOR || listaUrg.pegadas.length || !listaUrg.casoMalo || listaUrg.casoBueno) malas.push('celular, lista de los once, urgencia de Essential («Consulta 24 h · remedios» y «' + ASESOR + '» en renglones separados): ' + JSON.stringify(listaUrg));
  await cel.locator(filaUrg, { hasText: 'Urgencia 24 h' }).tap();
  await cel.waitForTimeout(450);
  const hojaUrg = await cel.evaluate(() => (document.querySelector('.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo') || {}).textContent || '');
  if (!notaUrg || !/preguntale a tu asesor/i.test(notaUrg) || !hojaUrg.includes(notaUrg)) malas.push('celular, hoja «Urgencia 24 h» sin la nota de Essential: ' + JSON.stringify(hojaUrg.slice(0, 160)));
  await ctx.close();
  if (malas.length) mal('una sola forma de mandar al asesor, «' + ASESOR + '»: quedan «Consultalo» o «Confirmalo», o la celda, el plegable, la lista o la hoja del celular de remedios en urgencias de Essential no lo dicen · ' + malas.join(' · '));
  else bien('una sola forma de mandar al asesor: «' + ASESOR + '» en las páginas (también la Guía Médica), el código de app/ y lib/ (ningún «preguntá», «consultá» ni «confirmá» con tu asesor, el rótulo sale de la constante y ninguna oración de coverage.js se copia) y la fila de remedios en urgencias de Essential (tablas, plegable, tarjeta del home, y la lista, en dos renglones, y la hoja del celular); los detectores distinguen el caso malo del bueno');
}

// ── Lo que dicen las tarjetas y la hoja, contra una lista cerrada (P2A y P3A) ─
// Qué se controla:
// - P2A (Arturo, 17/10/2026, «Todo A»): la tarjeta que se abre al pasar el mouse
//   o al tocar el nombre de un servicio de la tabla del home no muestra esperas
//   (la regla del 03/10: ninguna espera en la vista rápida). Las esperas siguen
//   en /planes, el simulador y la cotización.
// - P3A (17/10): en las filas con «¿quién?» (tomografía, resonancia, psicología
//   y fisioterapia), nada dice para quién son los de Silver y Gold mientras SP
//   no conteste (sp-interno#110): ni la celda, ni la línea del plan, ni el pie.
//
// LA RED ES LA LISTA CERRADA (cierre de la vuelta 3, 18/10). TARJETA_APROBADA
// (arriba, después de pieBien) tiene, como literales, lo que el sitio dice hoy,
// relevado en el navegador. Cada línea se lee como se ve y se compara; antes se
// normalizan los espacios (también el duro) y las comillas, nada más. Falla con
// cualquier línea que no esté en la lista, con la que falte y con cualquier
// texto fuera de las líneas, aunque sea inocente: un cambio querido se suma a la
// lista a conciencia, después de revisar que no sea una espera en la tarjeta del
// home (P2A) ni una afirmación de unidad, de para quién es, en Silver y Gold
// (P3A). Las líneas que hoy salen de una pregunta abierta de Arturo (por ejemplo
// la fisioterapia de Essential, pregunta 9 del PR #271) están como se ven hoy:
// si la respuesta las cambia, se cambian en la lista.
// Los pies y las notas de las filas con «¿quién?» pasan además por pieBien (la
// lista cerrada de oraciones de arriba, PIE_APROBADO), que pide la pregunta por
// la unidad. Se leen todos los .cmp2-tarjeta-pie y todo el texto de la hoja: la
// versión anterior leía solo el primer pie y, en la hoja, solo los <p> hijos
// directos (verificador, 18/10).
//
// QUÉ SUPERFICIES Y QUÉ ANCHOS CUBRE (18/10, vuelta 8). Hasta la tercera vuelta
// del verificador del cierre, la tarjeta del home se leía solo a 1280 px con el
// mouse, y en /planes del celular la lista no leía la hoja del tema ni la línea
// de la tarjeta del plan: una espera o una frase de unidad que solo se viera ahí
// pasaba en verde. Ahora:
//   1. Home: las nueve tarjetas de la tabla, enteras (las tres líneas y el pie),
//      a 1280 px pasando el mouse por el nombre (la columna de nombres) y a 360,
//      390 y 430 px con el dedo (isMobile, hasTouch), tocando el nombre en cada
//      una de las tres tarjetas de plan (9 lecturas en la computadora y 81 en el
//      celular). En el celular dicen lo mismo que a 1280, así que es la misma
//      lista.
//   2. /planes en la computadora (1280 px, pasando el mouse): la tarjeta de las
//      cuatro filas con «¿quién?», entera.
//   3. /planes en el celular (390 px): la hoja de las cuatro filas con «¿quién?»,
//      abierta desde «Los once servicios, plan por plan», entera.
//   4. /planes en el celular (360, 390 y 430 px): la hoja del tema «Tomografía y
//      resonancia», abierta tocando la línea en cada una de las tres tarjetas de
//      plan, entera (9 lecturas). Se abren las hojas de las cinco líneas de cada
//      tarjeta, y toda hoja que nombra tomografía, resonancia, psicología o
//      fisioterapia (NOMBRA_DUDA), en su línea o en su texto, tiene que estar en
//      la lista: hoy es esa sola.
//   5. /planes en el celular (360, 390 y 430 px): la línea de la tarjeta de cada
//      plan que nombra esos servicios, lo que se ve y lo que oye el lector (9
//      lecturas): hoy, «Tomografía y resonancia» en las tres tarjetas. La prueba
//      de la forma corta (`lineaBien`, más arriba) también la compara con la
//      lista.
// Las tarjetas y las hojas se leen con innerText, lo que el navegador dibuja,
// también el texto oculto para lectores (.sr-solo, que mide 1 px).
// LO QUE NO CUBRE: en /planes, las tarjetas de la computadora y las hojas de
// «Los once servicios» de las filas sin «¿quién?», las hojas de las cuatro filas
// con «¿quién?» a 360 y 430 px, las otras cuatro hojas de tema (Consultas,
// Internación, Terapia intensiva y Odontología) y las otras cuatro líneas de
// cada tarjeta de plan; en el home, la tarjeta abierta desde la celda
// «¿quién?» (es la misma que abre el nombre, pero no se lee desde ahí); ningún
// otro ancho (ni la tableta); de las tarjetas y las hojas, lo que el lector oye
// por un aria-label o una descripción, que no es texto dibujado (de la línea de
// la tarjeta del plan, sí); y el simulador, /que-cubre y la cotización.
//
// EL REGEX ESPERA ES SOLO UNA PISTA: no hace fallar nada. Cuando una línea nueva
// de la tarjeta del home lo dispara, el mensaje dice «parece una espera», para
// quien revisa. Cada vuelta le sumó formas (abajo, su historia) y cada vez se
// escribió que rechazaba «la clase» o «la clase entera». No era cierto: con nueve
// esperas a la vista daba verde («Lo usás pasado el año.», «Se usa después de
// los noventa.», «Lo usás al año y medio.», «Disponible al año.», «A partir de
// la tercera cuota.»…) y gritaba en falso con topes posibles («20 días por
// persona al año», «Hasta 2 días anuales», «Hasta 15 días en habitación
// privada»). La lista de lo que no va no se termina nunca (BITACORA cap. 153);
// lo que cierra la clase es la lista de lo que sí va.
//
// Autoprueba, en la misma página y con la misma lectura (se cambia el texto de
// una línea real, se lee y se deja como estaba):
//   (i) las 16 esperas que pasaban con el regex, metidas en una línea real del
//       home a 1280, fallan;
//   (ii) las 4 afirmaciones de unidad («Son por persona.», «Cada integrante
//       tiene el suyo.», «Por persona.», «Para cada uno de la familia.»),
//       metidas en una línea de Silver o Gold de una fila con «¿quién?», fallan
//       en el home y en /planes a 1280 y en la hoja de «Los once servicios»;
//   (iii) un tope nuevo legítimo («Hasta 2 días anuales.») falla como «línea
//       nueva», con la pista apagada;
//   (iv) cada tarjeta, hoja y línea, releída después de los cambios, dice lo
//       mismo que antes: la autoprueba no depende de cómo esté el sitio.
// Y en cada superficie del 18/10, en cada ancho y desde cada tarjeta de plan,
// una espera y una afirmación de unidad: ·cel, en el home con el dedo, una
// espera en cada una de las 81 tarjetas y una unidad en Silver o Gold de cada
// fila con «¿quién?» (36); ·tema, en la hoja «Tomografía y resonancia», una
// espera y una unidad en cada una de las 9; ·línea, en la línea de la tarjeta,
// una espera que se ve en las 9 y una unidad que solo oye el lector (en su
// texto .sr-solo) en las 6 de Silver y Gold. Que las líneas reales pasan lo dice
// la comparación de la lista, sobre la misma lectura. Y la pista se prueba
// contra sus casos: dice «parece una espera» en las formas que conoce y calla en
// los topes.
console.log('\n── Lo que dicen las tarjetas y la hoja, contra una lista cerrada (P2A y P3A)');
{
  const { DUDA, QUIEN_SG, QUIEN_PSICO } = COV;
  const HAY_DUDA = [QUIEN_SG, QUIEN_PSICO].includes(DUDA);
  const PLANES = ['Essential', 'Silver', 'Gold'];
  const ANCHOS_CEL = [360, 390, 430];
  // El botón de arriba de la hoja: no es una nota.
  const VOLVER = '‹ Los once servicios';
  // Las filas con «¿quién?» de cada superficie, en el orden de la autoprueba (ii).
  const FILAS_DUDA = {
    home: ['Tomografía (TAC)', 'Resonancia (RM)', 'Sesiones de psicología', 'Fisioterapia'],
    planes: ['Tomografía (TAC)', 'Resonancia (RM)', 'Sesiones de psicología', 'Fisioterapia'],
    hoja: ['Tomografía (TAC)', 'Resonancia (RM)', 'Sesión de psicología', 'Fisioterapia'],
  };

  // La pista (no la red). Su historia, de la primera versión al cierre de la
  // vuelta 3: enumeraba «a los N días», «de afiliarte», «desde el primer día»,
  // «día uno», «N meses» y «sin espera» (P2A, 17/10); el comité (vuelta 3, 17/10)
  // le sumó cualquier plazo en días, semanas, meses o años que no fuera un tope
  // por año, un «día N» y las palabras de espera; el verificador de
  // accesibilidad (18/10), los ordinales, «el mes 4», «al año de contratarlo», «a
  // los 365» y «en un año» (que pasa en la definición de tope, «podés usar algo
  // en un año»); y el del cierre (18/10), los números en palabras, quincena,
  // trimestre y semestre, y las formas relativas («el año que viene», «al
  // cumplir», «después de un», «recién a los», «a partir del»). Desde que es
  // pista (18/10, segunda vuelta del verificador del cierre) calla también ante
  // «hasta N días», «N días anuales», «N días por persona» y «N días de algo al
  // año», que son topes. No se le suman más formas para cerrar la clase: eso lo
  // hace la lista.
  const DIGITO = '\\d+(?:[.,]\\d+)?';
  const UNO_A_NUEVE = '(?:un[oa]?|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)';
  // Del dos al cien en palabras («treinta y cinco», «veintiún», «dieciocho»).
  const NUM_PAL = '(?:(?:treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa)(?:\\s+y\\s+' + UNO_A_NUEVE + ')?|veinti(?:[úu]n[oa]?|d[oó]s|tr[eé]s|cuatro|cinco|s[eé]is|siete|ocho|nueve)|dieci(?:s[eé]is|siete|ocho|nueve)|diez|once|doce|trece|catorce|quince|veinte|cien(?:to)?|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)';
  // «en un año» es un plazo («lo podés usar en un año»), salvo después de una
  // cantidad, donde es una frecuencia («hasta 5 sesiones en un año», «usar algo
  // en un año» de la definición de tope).
  const UN = '(?<!(?:\\balgo|\\bveces|(?:' + DIGITO + '|' + NUM_PAL + ')\\s+[a-záéíóúñ]+)\\s+en\\s)un[oa]?';
  const CUANTO = '(?:' + DIGITO + '|' + NUM_PAL + '|' + UN + '|medi[oa]|un\\s+par\\s+de|unos|unas|varios|varias|algunos|algunas|pocos|pocas)';
  const PLAZO_U = '(?:d[ií]as?|semanas?|quincenas?|mes(?:es)?|bimestres?|trimestres?|cuatrimestres?|semestres?|años?)';
  const UNIDAD = '(?:d[ií]a|semana|quincena|mes|bimestre|trimestre|cuatrimestre|semestre|año)';
  const ORDINAL = '(?:primer[oa]?|segund[oa]|tercer[oa]?|cuart[oa]|quint[oa]|sext[oa]|s[ée]ptim[oa]|octav[oa]|noven[oa]|d[ée]cim[oa]|[úu]ltim[oa]|pr[oó]xim[oa])';
  const FIN = '(?![\\w\\u00c0-\\u024f])';
  // Lo que viene después de una cantidad de tiempo y la vuelve tope: «al año»,
  // «por año», «cada año», «/persona/año», «anuales», «por persona», «de
  // internación al año».
  const TOPE_DESPUES = '\\s*(?:al|por|cada)\\s+año|\\s*\\/|\\s+anual(?:es)?' + FIN + '|\\s+por\\s+(?:persona|familia|beneficiario|integrante)' + FIN + '|\\s+(?:de|en)\\s+[a-záéíóúñ-]+(?:\\s+[a-záéíóúñ-]+)?\\s+(?:al|por|cada)\\s+año';
  const ESPERA = new RegExp([
    // una cantidad con su unidad que no es un tope: «3 meses», «un año», «noventa
    // días», «medio año», «un trimestre», «un par de meses»; no «hasta 2 días»
    '(?:^|[^\\w\\u00c0-\\u024f])(?<!\\bhasta\\s)' + CUANTO + '\\s+' + PLAZO_U + FIN + '(?!' + TOPE_DESPUES + ')',
    // un ordinal: «al tercer mes», «en el segundo semestre», «el próximo año»
    '\\b' + ORDINAL + '\\s+' + UNIDAD + FIN,
    // la unidad con lo que la ubica: «el año que viene», «al mes siguiente»
    '\\b' + UNIDAD + '\\s+(?:siguiente|pr[oó]xim[oa]|entrante|que\\s+viene)' + FIN,
    // un número de día, semana, mes o año: «el mes 4», «a partir del día 91»
    '\\b(?:d[ií]a|semana|mes|año)\\s+(?:n[.º°]\\s*)?\\d+\\b',
    // «al año de contratarlo», «al mes de afiliarte»
    '\\bal\\s+(?:d[ií]a|mes|año)\\s+de\\b',
    // «a los 365», «a las 6 semanas», «a los noventa»
    '\\ba\\s+l[oa]s\\s+(?:\\d+|' + NUM_PAL + ')' + FIN,
    // las formas relativas: «al cumplir el año», «después de un semestre»,
    // «recién a los…», «recién al año», «a partir del…»
    '\\bal\\s+cumplir\\b',
    '\\bdespu[eé]s\\s+de\\s+un' + FIN,
    '\\breci[eé]n\\s+(?:a\\s+l[oa]s|al|a\\s+partir|despu[eé]s|desde|cuando|pasad[oa]s?|tras|en\\s+el)' + FIN,
    '\\ba\\s+partir\\s+del' + FIN,
    // lo que dice que no hay espera: «desde el comienzo», «desde que entrás»
    '\\bdesde\\s+(?:el\\s+(?:comienzo|principio|inicio)|que\\s+(?:entr|firm|contrat|te\\s+(?:afili|sum)))',
    '\\bd[ií]a\\s+uno\\b', '\\besper(?:a[rns]?|ás|ando|ado)\\b', 'carencia', 'afilia', 'desde el d[ií]a', 'inmediat',
  ].join('|'), 'i');
  const pistaDe = (t) => { const m = ESPERA.exec(t || ''); return m ? m[0].trim() : null; };
  // Los casos de la pista: las formas que conoce (tiene que prenderse) y los
  // topes (tiene que callar), con los de la segunda vuelta del verificador del
  // cierre y todas las líneas del home de la lista.
  const pistaAuto = {
    prende: ['esperás un año', 'después de 365 días', 'a partir del día 91', 'a los 365 días de afiliarte', '3 meses de espera', 'Sin espera', 'desde el primer día', 'Se puede usar a los 150 días.', 'Desde el día uno.', 'Cubre de inmediato.', 'Hay que esperar seis meses.', 'Lo usás en 3 meses.',
      'A partir del tercer mes.', 'Desde el mes 4.', 'Al tercer mes ya lo usás.', 'Recién al año de contratarlo.', 'Lo podés usar en un año.', 'A partir del segundo año.', 'Se usa a los 365.', 'Está habilitado desde el comienzo.', 'Lo usás desde que entrás.',
      'Se usa a los noventa días.', 'Lo usás a los treinta días.', 'Recién después de un semestre.', 'a los quince días', 'a los dieciocho meses', 'medio año', 'un trimestre', 'en el segundo semestre', 'el año que viene', 'al cumplir el año',
      'Recién a los quince días.', 'Disponible tras medio año.', 'Después de un semestre.', 'Pasado un trimestre ya lo usás.', 'Lo usás el año que viene.', 'Con un año y medio de antigüedad.', 'Tras seis meses.', 'Se habilita en el segundo semestre.', 'Lo usás pasados 90 días.', 'Lo usás después de 3 meses.',
      'Lo usás en un par de meses.', 'Al tercer trimestre ya entra.', 'Se habilita el mes que viene.', 'A los cuarenta y cinco días.', 'Lo usás al semestre siguiente.', 'Dentro de veintiún días.', 'En una quincena.', 'Recién al año.', 'Después de un tiempo.', 'Lo usás en unas semanas.', 'Recién en el segundo año.', 'Cien días después.', 'El próximo año ya lo usás.',
      'Hay que aguardar tres meses.', 'Se habilita en noventa días.'],
    calla: ['20 días al año para toda la familia, en habitación privada.', 'Hasta 2 días al año por persona.', '25 días/persona/año', 'Hasta 3 por mes en cada especialidad; después, con copago.', '1 al año, y no ponés nada.', 'Sin tope en 23 de las 43 especialidades; en el resto, 5 o 6 al año por persona.', 'En Essential, preguntale a tu asesor cuánto cubre en remedios en urgencias.', 'Tope: la cantidad máxima de veces que podés usar algo en un año, o el monto máximo que cubre el plan.',
      'Hasta 2 al año para toda la familia, contando también ecocardiograma y ergometría.', '1 al año para toda la familia. Sin contraste ni sedación.', 'Hasta Gs. 1.500.000 en medicamentos y descartables en cada internación.', 'Hasta 6 días al año.', 'Hasta Gs. 350 mil por evento.', 'Hasta 5 sesiones en un año.',
      'Hasta 2 días al año', '20 días/familia/año', '3 por mes', '1 al año', 'Hasta dos días al año por persona.', 'Cinco sesiones en un año.', 'Gs. 1,5 millones/evento', 'Traumatológica, neurológica o después de una cirugía: 15 sesiones al año; respiratoria: otras 5.',
      // Los que gritaban en falso (segunda vuelta del verificador del cierre, 18/10).
      '20 días por persona al año', 'Hasta 2 días anuales', 'Hasta 15 días en habitación privada', '20 días por persona al año, en semi-suite.', 'Hasta 6 días por persona al año.', '25 días de internación al año.', 'Hasta 5 días de terapia intensiva al año.', 'Hasta 2 días cada año.', 'Hasta 2 días anuales.', 'Hasta 15 días en habitación privada.', 'Hasta 6 días/persona/año', '1 resonancia por año.', '5 sesiones por semestre.',
      ...Object.values(TARJETA_APROBADA.home).flatMap((t) => Object.values(t)).filter(Boolean)],
  };
  const pistaMal = [...pistaAuto.prende.filter((t) => !pistaDe(t)).map((t) => 'calla en «' + t + '»'), ...pistaAuto.calla.filter((t) => pistaDe(t)).map((t) => 'se prende en el tope «' + t + '» («' + pistaDe(t) + '»)')];

  // Cómo se leen: renglón por renglón, como los arma el navegador (innerText: lo
  // que se ve, cada bloque en su renglón y lo de adentro de un renglón junto, sin
  // pegar el plan a su línea). Cada plan es su nombre y su línea (lo que queda de
  // su caja sin el nombre; si son varios bloques, con « · » entre ellos); los
  // pies, todos; y `fuera`, lo que dice la tarjeta fuera del título, las líneas y
  // los pies. La hoja, igual: las cajas de los planes, las notas (todo lo demás
  // del cuerpo, en orden) y lo que el panel dice fuera del título y el cuerpo.
  const LEER_TARJETA = String((t) => {
    const renglones = (e) => (e ? e.innerText.split('\n').map((x) => x.trim()).filter(Boolean) : []);
    const menos = (a, b) => { const r = [...a]; for (const x of b) { const i = r.indexOf(x); if (i >= 0) r.splice(i, 1); } return r; };
    const tit = t.querySelector('.cmp2-tarjeta-t');
    const ps = [...t.querySelectorAll('.cmp2-tarjeta-p')];
    const pies = [...t.querySelectorAll('.cmp2-tarjeta-pie')];
    const planes = ps.map((p) => { const b = p.querySelector('b'); const plan = b ? b.innerText.trim() : ''; return { plan, linea: menos(renglones(p), [plan]).join(' · ') }; });
    const fuera = menos(renglones(t), [...renglones(tit), ...ps.flatMap(renglones), ...pies.flatMap(renglones)]);
    return { titulo: tit ? tit.innerText.trim() : null, planes, pies: pies.map((e) => renglones(e).join(' ')), fuera };
  });
  const LEER_HOJA = String((h) => {
    const renglones = (e) => (e ? e.innerText.split('\n').map((x) => x.trim()).filter(Boolean) : []);
    const menos = (a, b) => { const r = [...a]; for (const x of b) { const i = r.indexOf(x); if (i >= 0) r.splice(i, 1); } return r; };
    const tit = h.querySelector('h2');
    const cuerpo = h.querySelector('.hoja-cuerpo');
    const cajas = cuerpo ? [...cuerpo.querySelectorAll('.sq')] : [];
    const planes = cajas.map((c) => { const plan = c.firstElementChild ? c.firstElementChild.innerText.trim() : ''; return { plan, linea: menos(renglones(c), [plan]).join(' · ') }; });
    const notas = menos(renglones(cuerpo), cajas.flatMap(renglones));
    const fuera = menos(renglones(h), [...renglones(tit), ...renglones(cuerpo)]);
    return { titulo: tit ? tit.innerText.trim() : null, planes, notas, fuera };
  });
  // La autoprueba cambia el texto de una línea real en la página (los nodos de
  // texto, sin tocar los elementos de React), la lee con la misma función y la
  // deja como estaba. `donde` es el plan o «pie»; `modo`, si el texto va al
  // final, al principio o en lugar de la línea; «nada» relee sin cambiar nada.
  const INYECTAR = String(([leer, sel, casos]) => {
    const k = document.querySelector(sel);
    if (!k) return casos.map(() => null);
    const lee = eval(leer);
    const caja = (plan) => [...k.querySelectorAll('.cmp2-tarjeta-p, .sq')].find((c) => c.firstElementChild && c.firstElementChild.innerText.trim() === plan);
    const lineaDe = (c) => (c ? (c.classList.contains('sq') ? c.querySelector(':scope > div > span') : c.lastElementChild) : null);
    const textos = (el) => { const r = []; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); for (let n = w.nextNode(); n; n = w.nextNode()) if (n.data.trim()) r.push(n); return r; };
    return casos.map((c) => {
      if (c.modo === 'nada') return lee(k);
      const el = c.donde === 'pie' ? k.querySelector('.cmp2-tarjeta-pie') : lineaDe(caja(c.donde));
      const ns = el ? textos(el) : [];
      if (!ns.length) return null;
      const antes = ns.map((n) => n.data);
      if (c.modo === 'inicio') ns[0].data = c.texto + ' ' + ns[0].data;
      else if (c.modo === 'fin') ns[ns.length - 1].data = ns[ns.length - 1].data + ' ' + c.texto;
      else ns.forEach((n, i) => { n.data = i ? '' : c.texto; });
      const r = lee(k);
      ns.forEach((n, i) => { n.data = antes[i]; });
      return r;
    });
  });

  // Lo leído contra la lista: cada hallazgo dice qué es, dónde está y qué dice.
  // `donde` dice además el ancho y la tarjeta de plan desde la que se abrió.
  const hallazgos = (sup, servicio, leido, donde = sup + ' › ' + servicio) => {
    const lista = TARJETA_APROBADA[sup][servicio];
    const h = [];
    const nueva = (d, linea, antes) => h.push({ tipo: 'línea nueva', donde: d, linea, antes, pista: sup === 'home' ? pistaDe(linea) : null });
    if (!lista) return [{ tipo: 'tarjeta que no está en la lista', donde, linea: leido ? leido.planes.map((p) => p.plan + ': ' + p.linea).join(' | ') : '' }];
    if (!leido) return [{ tipo: 'no se abrió', donde, linea: '' }];
    if (normal(leido.titulo) !== normal(servicio)) nueva(donde + ' › título', leido.titulo, servicio);
    const vistos = [];
    for (const { plan, linea } of leido.planes) {
      if (!PLANES.includes(plan) || vistos.includes(plan)) { nueva(donde + ' › ' + (plan || 'sin plan'), linea); continue; }
      vistos.push(plan);
      if (normal(linea) !== normal(lista[plan])) nueva(donde + ' › ' + plan, linea, lista[plan]);
    }
    PLANES.filter((p) => !vistos.includes(p)).forEach((p) => h.push({ tipo: 'falta', donde: donde + ' › ' + p, linea: lista[p] }));
    const clave = sup === 'hoja' || sup === 'tema' ? 'notas' : 'pie';
    const dicho = clave === 'notas' ? notasDe(leido).join(' ') : leido.pies.join(' ');
    if (normal(dicho) !== normal(lista[clave])) {
      if (!normal(dicho)) h.push({ tipo: 'falta', donde: donde + ' › ' + clave, linea: lista[clave] });
      else nueva(donde + ' › ' + clave, dicho, lista[clave]);
    }
    leido.fuera.forEach((f) => nueva(donde + ' › fuera de las líneas', f));
    return h;
  };
  // Las notas de la hoja, sin el «‹ Los once servicios» de arriba.
  const notasDe = (leido) => (normal(leido.notas[0]) === normal(VOLVER) ? leido.notas.slice(1) : leido.notas);
  const decir = (x) => x.donde + ': ' + x.tipo + ' «' + x.linea + '»' + (x.antes !== undefined ? ' (la lista dice «' + x.antes + '»)' : '') + (x.pista ? ', parece una espera («' + x.pista + '»)' : '');

  // Los casos de la autoprueba.
  // (i) Las 16 esperas que pasaban en verde con el regex (segunda vuelta del
  // verificador del cierre, 18/10), repartidas entre las nueve tarjetas del home,
  // en las tres líneas y el pie, al final o al principio.
  const ESPERAS_QUE_PASABAN = ['Lo usás pasado el año.', 'Se usa después de los noventa.', 'Lo usás al año y medio.', 'A partir de la tercera cuota.', 'Se habilita a mitad de año.', 'Lo usás cuando cumplas el año.', 'Lo usás apenas entrás.', 'Se habilita cumplido el semestre.', 'Se usa pasados los noventa.', 'Lo usás al trimestre.', 'Desde la primera cuota.', 'Requiere antigüedad.', 'Lo usás de entrada.', 'Se habilita en la cuota 4.', 'Lo usás luego de doce mensualidades.', 'Disponible al año.'];
  // (ii) Las 4 afirmaciones de unidad que nadie miraba en Silver y Gold.
  const UNIDADES = ['Son por persona.', 'Cada integrante tiene el suyo.', 'Por persona.', 'Para cada uno de la familia.'];
  // (iii) Un tope nuevo, legítimo: falla como línea nueva y sin la pista.
  const TOPE_NUEVO = 'Hasta 2 días anuales.';
  // `tag` dice la superficie del 18/10 (vacío en las de antes); `j`, la lectura,
  // para repartir las esperas y las unidades entre las tarjetas y los planes.
  const casosDe = (sup, servicio, tag = '', j = 0) => {
    const casos = [];
    if (sup === 'home' && !tag) {
      const k = Object.keys(TARJETA_APROBADA.home).indexOf(servicio);
      ESPERAS_QUE_PASABAN.forEach((texto, n) => {
        if (n % 9 !== k) return;
        let donde = ['Silver', 'Gold', 'Essential', 'pie'][n % 4];
        if (donde === 'pie' && !TARJETA_APROBADA.home[servicio].pie) donde = 'Silver';
        casos.push({ por: 'i', donde, modo: n % 2 ? 'inicio' : 'fin', texto });
      });
      if (servicio === 'Días de terapia intensiva') casos.push({ por: 'iii', donde: 'Essential', modo: 'reemplazo', texto: TOPE_NUEVO });
    }
    if (sup === 'home' && tag) {
      // ·cel: una espera en cada tarjeta, en una de sus líneas o en el pie.
      let donde = ['Silver', 'Gold', 'Essential', 'pie'][j % 4];
      if (donde === 'pie' && !TARJETA_APROBADA.home[servicio].pie) donde = 'Silver';
      casos.push({ por: 'i', tag, donde, modo: j % 2 ? 'inicio' : 'fin', texto: ESPERAS_QUE_PASABAN[j % ESPERAS_QUE_PASABAN.length] });
    }
    if (sup === 'tema') {
      // ·tema: una espera en uno de los tres planes y una unidad en Silver o Gold.
      casos.push({ por: 'i', tag, donde: PLANES[j % 3], modo: 'fin', texto: ESPERAS_QUE_PASABAN[j % ESPERAS_QUE_PASABAN.length] });
      casos.push({ por: 'ii', tag, donde: j % 2 ? 'Gold' : 'Silver', modo: 'fin', texto: UNIDADES[j % UNIDADES.length] });
    }
    const u = (FILAS_DUDA[sup] || []).indexOf(servicio);
    if (u >= 0) casos.push({ por: 'ii', tag, donde: (tag ? j + u : u) % 2 ? 'Gold' : 'Silver', modo: 'fin', texto: UNIDADES[(tag ? j + u : u) % UNIDADES.length] });
    // (iv) Después de los cambios, la tarjeta real otra vez: tiene que decir lo
    // mismo que en la primera lectura.
    casos.push({ por: 'iv', tag, modo: 'nada' });
    return casos;
  };
  const auto = {};
  const cuenta = (k) => { auto[k] = (auto[k] || 0) + 1; };
  const autoMal = [];
  const revisar = (sup, servicio, casos, leidos, primera, donde = sup + ' › ' + servicio) => casos.forEach((c, n) => {
    const h = leidos[n] ? hallazgos(sup, servicio, leidos[n], donde) : null;
    const lugar = donde + (c.donde ? ' › ' + c.donde : '');
    const k = c.por + (c.tag ? '·' + c.tag : '');
    if (!h) { autoMal.push('(' + k + ') no se pudo leer ' + lugar); return; }
    if (c.modo === 'nada') { if (JSON.stringify(leidos[n]) !== JSON.stringify(primera)) autoMal.push('(' + k + ') ' + lugar + ', releída después de los cambios, no dice lo mismo que antes: ' + JSON.stringify(leidos[n])); else cuenta(k); return; }
    const x = h.find((y) => y.donde === lugar && y.tipo === 'línea nueva');
    if (!x) autoMal.push('(' + k + ') no falla: ' + lugar + ' con «' + c.texto + '»');
    else if (c.por === 'iii' && (x.pista || !decir(x).includes('línea nueva'))) autoMal.push('(iii) falla, pero no como una línea nueva con la pista apagada: ' + decir(x));
    else cuenta(k);
  });

  const malas = [];
  const piesMal = [];
  const piesVistos = [];
  const listo = (p, s = '.cmp2-srv') => p.waitForFunction((sel) => { const b = document.querySelector(sel); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, s, { timeout: 10000 }).catch(() => {});
  const escRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // 1. La computadora: las nueve tarjetas del home y las de /planes de las filas
  // con «¿quién?», abiertas como una persona (el mouse que entra desde afuera,
  // con el botón quieto).
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const [sup, ruta, sel] of [['home', '/', '#cartilla'], ['planes', '/planes/', '#comparar-planes']]) {
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
    await listo(page);
    const nombres = await page.$$eval(sel + ' .cmp2-lab .cmp2-srv', (bs) => bs.map((b) => b.textContent.trim()));
    // Las filas que hoy dicen «¿quién?» (de la página, no de una lista).
    const conDuda = await page.evaluate((sel) => {
      const filas = [...document.querySelectorAll(sel + ' .cmp2-lab .cmp2-c')].map((c) => c.textContent.trim());
      const r = new Set();
      [...document.querySelectorAll(sel + ' .cmp2-plan')].forEach((pl) => [...pl.querySelectorAll('.cmp2-c')].forEach((c, k) => { if (c.querySelector('.cmp2-duda')) r.add(filas[k]); }));
      return [...r];
    }, sel);
    const enLista = Object.keys(TARJETA_APROBADA[sup]);
    // En el home, las nueve, ni una más ni una menos; en /planes, toda fila con «¿quién?» tiene que estar.
    (sup === 'home' ? nombres : conDuda).filter((n) => !enLista.includes(n)).forEach((n) => malas.push({ tipo: 'tarjeta que no está en la lista', donde: sup + ' › ' + n, linea: sup === 'home' ? 'un servicio nuevo en la tabla' : 'una fila nueva con «' + DUDA + '»' }));
    enLista.filter((n) => !nombres.includes(n)).forEach((n) => malas.push({ tipo: 'falta', donde: sup + ' › ' + n, linea: 'la tabla no tiene esta fila' }));
    if (HAY_DUDA && !conDuda.length) piesMal.push(sup + ': ninguna fila con «' + DUDA + '», y coverage.js dice que hay');
    for (const n of enLista.filter((x) => nombres.includes(x))) {
      const btn = page.locator(sel + ' .cmp2-lab .cmp2-srv').filter({ hasText: new RegExp('^' + escRe(n) + '$') }).first();
      await btn.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForTimeout(250);
      const c = await btn.boundingBox();
      await page.mouse.move(5, 5);
      await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
      await page.waitForTimeout(200);
      const tsel = sel + ' .cmp2-tarjeta';
      const leido = await page.evaluate(([fn, s]) => { const k = document.querySelector(s); return k ? eval(fn)(k) : null; }, [LEER_TARJETA, tsel]);
      malas.push(...hallazgos(sup, n, leido));
      if (HAY_DUDA && conDuda.includes(n)) {
        piesVistos.push(sup + ' ' + n);
        if (!leido || !pieBien(leido.pies.join(' '))) piesMal.push(sup + ' ' + n + ': ' + JSON.stringify(leido && leido.pies));
      }
      const casos = casosDe(sup, n);
      revisar(sup, n, casos, await page.evaluate(([fn, leer, s, cs]) => eval(fn)([leer, s, cs]), [INYECTAR, LEER_TARJETA, tsel, casos]), leido);
    }
    await page.mouse.move(5, 5);
  }
  await page.close();
  // 2. El celular (390 px): la hoja de cada fila con «¿quién?», abierta desde
  // «Los once servicios, plan por plan».
  const ctxH = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const cel = await ctxH.newPage();
  await cel.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  await cel.locator('.cmp-cel button', { hasText: 'Los once servicios, plan por plan' }).tap();
  await cel.waitForTimeout(450);
  const FILA_H = '.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo button.fila';
  const PANEL = '.cmp-cel .hoja[data-abierta="1"] .hoja-panel';
  const deLaLista = await cel.$$eval(FILA_H, (bs) => bs.map((b) => b.querySelector('b').textContent.replace(/ ›$/, '').trim()));
  // Las filas de la lista que dicen «¿quién?» en Silver o Gold (lo que se ve).
  const conDudaH = await cel.$$eval(FILA_H, (bs, duda) => bs.filter((b) => [...b.querySelectorAll(':scope > span > span')].slice(1).some((c) => c.textContent.includes(duda))).map((b) => b.querySelector('b').textContent.replace(/ ›$/, '').trim()), DUDA);
  const enListaH = Object.keys(TARJETA_APROBADA.hoja);
  conDudaH.filter((n) => !enListaH.includes(n)).forEach((n) => malas.push({ tipo: 'tarjeta que no está en la lista', donde: 'hoja › ' + n, linea: 'una fila nueva con «' + DUDA + '»' }));
  enListaH.filter((n) => !deLaLista.includes(n)).forEach((n) => malas.push({ tipo: 'falta', donde: 'hoja › ' + n, linea: 'la lista de los once no tiene esta fila' }));
  if (HAY_DUDA && !conDudaH.length) piesMal.push('hoja: ninguna fila de la lista con «' + DUDA + '»');
  for (const n of enListaH.filter((x) => deLaLista.includes(x))) {
    await cel.locator(FILA_H).filter({ has: cel.locator('b', { hasText: new RegExp('^' + escRe(n) + '(?: ›)?$') }) }).first().tap();
    await cel.waitForTimeout(400);
    const leido = await cel.evaluate(([fn, s]) => { const k = document.querySelector(s); return k ? eval(fn)(k) : null; }, [LEER_HOJA, PANEL]);
    malas.push(...hallazgos('hoja', n, leido));
    if (HAY_DUDA && conDudaH.includes(n)) {
      piesVistos.push('hoja ' + n);
      if (!leido || !pieBien(notasDe(leido).join(' '), [CIERRE_HOJA])) piesMal.push('hoja ' + n + ': ' + JSON.stringify(leido && notasDe(leido)));
    }
    const casos = casosDe('hoja', n);
    revisar('hoja', n, casos, await cel.evaluate(([fn, leer, s, cs]) => eval(fn)([leer, s, cs]), [INYECTAR, LEER_HOJA, PANEL, casos]), leido);
    await cel.locator('.cmp-cel .hoja[data-abierta="1"] button', { hasText: 'Los once servicios' }).first().tap();
    await cel.waitForTimeout(350);
  }
  await ctxH.close();

  // 3. El home en el celular (vuelta 8, 18/10): las nueve tarjetas con el dedo,
  // a 360, 390 y 430, tocando el nombre en cada una de las tres tarjetas de plan
  // (en el celular cada tarjeta de plan trae sus nombres y abre su tarjeta). Se
  // lee la tarjeta abierta, que tiene que ser una sola y de esa tarjeta de plan.
  const TARJETA_H = '#cartilla .cmp2-tarjeta';
  const leidasCel = { home: 0, tema: 0, linea: 0 };
  let jCel = 0;
  for (const w of ANCHOS_CEL) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await listo(p);
    const tarjetas = p.locator('#cartilla .cmp2-plan');
    const nt = await tarjetas.count();
    if (nt !== PLANES.length) malas.push({ tipo: 'falta', donde: 'home ' + w + ' px', linea: 'hay ' + nt + ' tarjetas de plan, no ' + PLANES.length });
    const enLista = Object.keys(TARJETA_APROBADA.home);
    for (let i = 0; i < nt; i++) {
      const plan = (await tarjetas.nth(i).locator('.cmp2-nombre').innerText()).trim();
      const base = 'home ' + w + ' px, tarjeta de ' + plan;
      const nombres = await tarjetas.nth(i).locator('.cmp2-srv').evaluateAll((bs) => bs.map((b) => b.textContent.trim()));
      nombres.filter((n) => !enLista.includes(n)).forEach((n) => malas.push({ tipo: 'tarjeta que no está en la lista', donde: base + ' › ' + n, linea: 'un servicio nuevo en la tabla' }));
      enLista.filter((n) => !nombres.includes(n)).forEach((n) => malas.push({ tipo: 'falta', donde: base + ' › ' + n, linea: 'la tarjeta del plan no tiene esta fila' }));
      for (const n of enLista.filter((x) => nombres.includes(x))) {
        const btn = tarjetas.nth(i).locator('.cmp2-srv').filter({ hasText: new RegExp('^' + escRe(n) + '$') }).first();
        await btn.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await btn.tap();
        await p.waitForSelector(TARJETA_H, { timeout: 2000 }).catch(() => {});
        const leido = await p.evaluate(([fn, s, i]) => {
          const ks = document.querySelectorAll(s);
          if (ks.length !== 1 || ks[0].closest('.cmp2-plan') !== document.querySelectorAll('#cartilla .cmp2-plan')[i]) return null;
          return eval(fn)(ks[0]);
        }, [LEER_TARJETA, TARJETA_H, i]);
        const donde = base + ' › ' + n;
        malas.push(...hallazgos('home', n, leido, donde));
        if (leido) {
          leidasCel.home++;
          const casos = casosDe('home', n, 'cel', jCel++);
          revisar('home', n, casos, await p.evaluate(([fn, leer, s, cs]) => eval(fn)([leer, s, cs]), [INYECTAR, LEER_TARJETA, TARJETA_H, casos]), leido, donde);
          await btn.tap();
          await p.waitForFunction((s) => !document.querySelector(s), TARJETA_H, { timeout: 2000 }).catch(() => {});
        }
      }
    }
    await ctx.close();
  }

  // 4. /planes en el celular (vuelta 8, 18/10), a 360, 390 y 430: en cada
  // tarjeta de plan, la línea que nombra un servicio con «¿quién?» (lo que se ve
  // y lo que oye el lector), y la hoja de cada línea, abierta tocándola como una
  // persona (en el ícono de la izquierda: en el medio puede haber una palabra
  // del glosario, como «semi-suite», que abre su explicación y no la hoja).
  const PANEL_T = '.cmp-cel .hoja[data-abierta="1"] .hoja-panel';
  // La línea de la autoprueba: se le suma `texto` al último nodo de texto que se
  // ve y se oye (modo «visto») o al último del texto oculto para lectores (modo
  // «oido»), y `window.__qaVolver` la deja como estaba.
  const TOCAR_LINEA = String(([l, modo, texto]) => {
    const ns = [];
    const w = document.createTreeWalker(l, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) if (n.data.trim()) ns.push(n);
    const elegibles = ns.filter((n) => (modo === 'oido' ? !!n.parentElement.closest('.sr-solo') : !n.parentElement.closest('.sr-solo, [aria-hidden="true"]')));
    const n = elegibles[elegibles.length - 1];
    if (!n) return false;
    const antes = n.data;
    n.data = antes + ' ' + texto + ' ';
    window.__qaVolver = () => { n.data = antes; };
    return true;
  });
  let jTema = 0;
  let jLinea = 0;
  for (const w of ANCHOS_CEL) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    await p.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
    await listo(p);
    const arts = p.locator('.cmp-cel article');
    const na = await arts.count();
    if (na !== PLANES.length) malas.push({ tipo: 'falta', donde: '/planes ' + w + ' px', linea: 'hay ' + na + ' tarjetas de plan, no ' + PLANES.length });
    const vistos = new Set();
    for (let i = 0; i < na; i++) {
      const plan = ((await arts.nth(i).getAttribute('aria-label')) || '').replace(/^Plan /, '');
      const ls = arts.nth(i).locator('.linea-cel');
      const nl = await ls.count();
      for (let k = 0; k < nl; k++) {
        const l = ls.nth(k);
        const vista = await l.evaluate((e, fn) => eval(fn)(e), LEER_LINEA);
        const nombra = NOMBRA_DUDA.test(vista.ve);
        // La línea.
        if (nombra) {
          vistos.add('linea|' + plan + '|' + vista.tema);
          leidasCel.linea++;
          const leida = { ...vista, oye: await oyeDe(l) };
          const donde = 'línea ' + w + ' px, tarjeta de ' + plan + ' › ' + vista.tema;
          malas.push(...lineaEnLista(vista.tema, plan, leida, donde));
          const casosL = [{ por: 'i', modo: 'visto', texto: ESPERAS_QUE_PASABAN[jLinea % ESPERAS_QUE_PASABAN.length], parte: ' › se ve' }];
          if (plan !== 'Essential') casosL.push({ por: 'ii', modo: 'oido', texto: UNIDADES[jLinea % UNIDADES.length], parte: ' › se oye' });
          jLinea++;
          for (const c of casosL) {
            const k2 = c.por + '·línea';
            if (!(await l.evaluate((e, [fn, modo, texto]) => eval(fn)([e, modo, texto]), [TOCAR_LINEA, c.modo, c.texto]))) { autoMal.push('(' + k2 + ') no se pudo cambiar ' + donde); continue; }
            const otra = { ...(await l.evaluate((e, fn) => eval(fn)(e), LEER_LINEA)), oye: await oyeDe(l) };
            await l.evaluate(() => window.__qaVolver());
            if (!lineaEnLista(vista.tema, plan, otra, donde).some((x) => x.donde === donde + c.parte && x.tipo === 'línea nueva')) autoMal.push('(' + k2 + ') no falla: ' + donde + c.parte + ' con «' + c.texto + '»');
            else cuenta(k2);
          }
          const otraVez = { ...(await l.evaluate((e, fn) => eval(fn)(e), LEER_LINEA)), oye: await oyeDe(l) };
          if (JSON.stringify(otraVez) !== JSON.stringify(leida)) autoMal.push('(iv·línea) ' + donde + ', releída después de los cambios, no dice lo mismo que antes: ' + JSON.stringify(otraVez));
          else cuenta('iv·línea');
        }
        // La hoja de su tema.
        await l.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await l.tap({ position: { x: 6, y: 12 } });
        await p.waitForSelector(PANEL_T, { timeout: 2000 }).catch(() => {});
        await p.waitForTimeout(150);
        const hoja = await p.evaluate(([fn, s]) => { const k = document.querySelector(s); return k ? { leido: eval(fn)(k), texto: k.innerText } : null; }, [LEER_HOJA, PANEL_T]);
        // Toda línea abre su hoja: si una no abre, no se sabe qué dice.
        if (!hoja) malas.push({ tipo: 'no se abrió', donde: 'tema ' + w + ' px, tarjeta de ' + plan + ' › ' + vista.tema, linea: 'la hoja de la línea' });
        else if (nombra || NOMBRA_DUDA.test(hoja.texto)) {
          const t = hoja.leido.titulo;
          const donde = 'tema ' + w + ' px, tarjeta de ' + plan + ' › ' + t;
          vistos.add('tema|' + plan + '|' + t);
          leidasCel.tema++;
          malas.push(...hallazgos('tema', t, hoja.leido, donde));
          if (HAY_DUDA) {
            piesVistos.push('tema ' + t + ' (' + w + ' px, ' + plan + ')');
            if (!pieBien(notasDe(hoja.leido).join(' '), [CIERRE_HOJA])) piesMal.push(donde + ': ' + JSON.stringify(notasDe(hoja.leido)));
          }
          if (TARJETA_APROBADA.tema[t]) {
            const casos = casosDe('tema', t, 'tema', jTema++);
            revisar('tema', t, casos, await p.evaluate(([fn, leer, s, cs]) => eval(fn)([leer, s, cs]), [INYECTAR, LEER_HOJA, PANEL_T, casos]), hoja.leido, donde);
          }
        }
        await p.keyboard.press('Escape');
        await p.waitForFunction(() => { const h = document.querySelector('.cmp-cel .hoja'); return !!h && h.dataset.abierta === '0'; }, null, { timeout: 2000 }).catch(() => {});
        await p.waitForTimeout(350);
      }
    }
    // Lo de la lista que no apareció, en cada tarjeta de plan y en este ancho.
    for (const plan of PLANES) {
      Object.keys(TARJETA_APROBADA.linea).filter((t) => !vistos.has('linea|' + plan + '|' + t)).forEach((t) => malas.push({ tipo: 'falta', donde: 'línea ' + w + ' px, tarjeta de ' + plan + ' › ' + t, linea: 'la tarjeta del plan no tiene esta línea' }));
      Object.keys(TARJETA_APROBADA.tema).filter((t) => !vistos.has('tema|' + plan + '|' + t)).forEach((t) => malas.push({ tipo: 'falta', donde: 'tema ' + w + ' px, tarjeta de ' + plan + ' › ' + t, linea: 'ninguna línea de la tarjeta abre esta hoja' }));
    }
    await ctx.close();
  }

  // Lo que se espera de la autoprueba. En la computadora y la hoja de «Los once
  // servicios»: 16 esperas, 4 unidades en cada una de las tres superficies, un
  // tope y la relectura de cada tarjeta y hoja. En el celular (·cel, ·tema y
  // ·línea): una espera y una relectura por lectura, y una unidad por lectura de
  // una fila con «¿quién?» (en la línea, solo Silver y Gold).
  const nAnchos = ANCHOS_CEL.length * PLANES.length;
  const cuantas = (s) => Object.keys(TARJETA_APROBADA[s]).length;
  const debe = {
    i: ESPERAS_QUE_PASABAN.length, ii: UNIDADES.length * 3, iii: 1, iv: cuantas('home') + cuantas('planes') + cuantas('hoja'),
    'i·cel': cuantas('home') * nAnchos, 'ii·cel': FILAS_DUDA.home.length * nAnchos, 'iv·cel': cuantas('home') * nAnchos,
    'i·tema': cuantas('tema') * nAnchos, 'ii·tema': cuantas('tema') * nAnchos, 'iv·tema': cuantas('tema') * nAnchos,
    'i·línea': cuantas('linea') * nAnchos, 'ii·línea': cuantas('linea') * ANCHOS_CEL.length * 2, 'iv·línea': cuantas('linea') * nAnchos,
  };
  Object.keys(debe).filter((k) => (auto[k] || 0) !== debe[k]).forEach((k) => autoMal.push('(' + k + ') ' + (auto[k] || 0) + ' de ' + debe[k]));
  if (pistaMal.length || autoMal.length) mal('la autoprueba de la lista cerrada no da lo esperado · ' + [...autoMal, ...pistaMal.map((t) => 'la pista ' + t)].join(' · '));
  else bien('la autoprueba de la lista cerrada, en la misma página y con la misma lectura: (i) las ' + debe.i + ' esperas que pasaban con el regex («Lo usás pasado el año.», «Disponible al año.», «A partir de la tercera cuota.»…), metidas en una línea real del home a 1280, fallan; (ii) las ' + UNIDADES.length + ' afirmaciones de unidad («Son por persona.», «Cada integrante tiene el suyo.»…) fallan en Silver y Gold en el home y /planes a 1280 y en la hoja de «Los once servicios» a 390 (' + debe.ii + '); (iii) «' + TOPE_NUEVO + '» falla como «línea nueva», sin la pista; en el celular, a 360, 390 y 430 y desde las tres tarjetas de plan, fallan una espera en cada una de las ' + debe['i·cel'] + ' tarjetas del home abiertas con el dedo y una unidad en Silver o Gold en las ' + debe['ii·cel'] + ' de filas con «' + DUDA + '», una espera y una unidad en cada una de las ' + debe['i·tema'] + ' hojas «Tomografía y resonancia», y en la línea de la tarjeta del plan, una espera que se ve (' + debe['i·línea'] + ') y una unidad que solo oye el lector (' + debe['ii·línea'] + ', Silver y Gold); (iv) las ' + (debe.iv + debe['iv·cel'] + debe['iv·tema'] + debe['iv·línea']) + ' tarjetas, hojas y líneas, releídas después de los cambios, dicen lo mismo que antes (que las líneas reales pasan lo dice la línea de abajo); la pista («parece una espera») se prende en las ' + pistaAuto.prende.length + ' formas que conoce y calla en los ' + pistaAuto.calla.length + ' topes y líneas del home');
  const contar = (o) => (typeof o === 'string' ? (o ? 1 : 0) : Object.values(o).reduce((a, v) => a + contar(v), 0));
  if (malas.length) mal('lo que dicen las tarjetas, las hojas y las líneas tiene que estar, literal, en TARJETA_APROBADA · ' + malas.map(decir).join(' · ') + ' · Si es un cambio querido, sumala a TARJETA_APROBADA (qa/qa-lanzamiento.mjs) después de revisar que no sea una espera en la tarjeta del home (P2A) ni en la línea de la tarjeta del plan (03/10), ni una afirmación de unidad, de para quién es, en Silver y Gold (P3A).');
  else bien('dicen solo lo que está en TARJETA_APROBADA (' + contar(TARJETA_APROBADA) + ' líneas, pies y notas, literales), sin nada fuera de las líneas: las ' + cuantas('home') + ' tarjetas del home a 1280 con el mouse y a 360, 390 y 430 con el dedo, desde las tres tarjetas de plan (' + leidasCel.home + ' lecturas), sin ninguna espera (P2A); de las filas con «' + DUDA + '», las ' + cuantas('planes') + ' tarjetas de /planes a 1280 y sus ' + cuantas('hoja') + ' hojas de «Los once servicios» a 390; y en /planes a 360, 390 y 430, desde las tres tarjetas, la hoja del tema «Tomografía y resonancia» (' + leidasCel.tema + ' lecturas) y la línea de la tarjeta del plan que nombra tomografía, resonancia, psicología o fisioterapia, lo que se ve y lo que se oye (' + leidasCel.linea + ' lecturas): en Silver y Gold, nada que diga para quién (P3A). No cubre las otras cuatro hojas de tema ni las otras líneas de las tarjetas de plan, ni las tarjetas y hojas de /planes de las filas sin «' + DUDA + '»');
  if (!HAY_DUDA) console.log('    · se salta: los pies de las filas con la duda (ninguna fila dice «' + DUDA + '»)');
  else if (piesMal.length) mal('el pie de una fila con «' + DUDA + '» dice una oración que no está en la lista cerrada (o le falta la pregunta por la unidad) · ' + piesMal.join(' · '));
  else bien('los ' + piesVistos.length + ' pies y hojas de las filas con «' + DUDA + '» (todos los pies y todo el texto de la hoja) dicen solo oraciones de PIE_APROBADO, con la pregunta por la unidad (' + piesVistos.join(', ') + ')');
}

// ── La copia congelada /v1/ ya no existe (P4A, Arturo, 17/10/2026) ─────────
// sp-interno#181: public/v1/ servía los TTF de Gilroy sin licencia, una cifra
// de contratos sin confirmar que decía «hoy» y «seguro médico». Se bajó del
// repo y queda en el historial de git. Next copia public/ entero a out/ en las
// dos ediciones (la de lanzamiento la podaba después), así que se mira en tres
// lugares: el repo no tiene public/v1/, esta edición da 404 en /v1/ y, si el
// prototipo se sirve en el prefijo de arriba (la salud nocturna lo monta así),
// el prototipo también. Falla con public/v1/ de vuelta y pasa sin ella.
console.log('\n── La copia congelada /v1/ ya no existe (P4A)');
{
  if (existsSync(new URL('../public/v1', import.meta.url))) mal('el repo todavía tiene public/v1/: cada build la copia a out/v1/ (sp-interno#181)');
  else bien('el repo no tiene public/v1/');
  const page = await browser.newPage();
  const estado = async (url) => { const r = await page.request.get(url).catch(() => null); return r ? r.status() : 'sin respuesta'; };
  const aca = await estado(BASE + '/v1/');
  if (aca === 404) bien('/v1/ da 404 en esta edición');
  else mal('/v1/ responde ' + aca + ' en esta edición: la copia congelada se bajó el 17/10/2026 (sp-interno#181)');
  const PROTO = BASE.replace(/\/lanzamiento\/?$/, '');
  if (PROTO !== BASE && (await estado(PROTO + '/')) === 200) {
    const alla = await estado(PROTO + '/v1/');
    if (alla === 404) bien('/v1/ da 404 también en el prototipo (' + PROTO.replace(/^https?:\/\/[^/]+/, '') + '/)');
    else mal('/v1/ responde ' + alla + ' en el prototipo: la copia congelada se bajó el 17/10/2026 (sp-interno#181)');
  } else console.log('    · el prototipo no se sirve al lado: su /v1/ lo mira qa-integral');
  await page.close();
}

// ── Los aliados, quietos (26/09/2026, docs/diseno n.º 53) ───────────────────
// Los 12 a la vista y sin movimiento: la tira tardaba 54 s en mostrarlos.
console.log('\n── Los aliados');
for (const [nombre, width, height] of [['móvil 390', 390, 844], ['escritorio', 1280, 900]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const sec = page.locator('section.aliados');
  if (!(await sec.count())) { mal(nombre + ': el home no tiene la sección de aliados'); await page.close(); continue; }
  await sec.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const r = await sec.evaluate((s) => {
    const imgs = [...s.querySelectorAll('img')];
    return {
      logos: imgs.length,
      visibles: imgs.filter((i) => { const b = i.getBoundingClientRect(); return i.naturalWidth && b.width > 4 && b.left >= 0 && b.right <= innerWidth; }).length,
      mueve: [...s.querySelectorAll('*')].some((e) => getComputedStyle(e).animationName !== 'none'),
      alto: Math.round(s.getBoundingClientRect().height),
    };
  });
  const tope = width < 700 ? 320 : 280;
  if (r.logos !== 12 || r.visibles !== 12 || r.mueve || r.alto > tope) mal(nombre + ': aliados — ' + JSON.stringify(r) + ' (se esperan 12 logos a la vista, quietos, en menos de ' + tope + ' px)');
  else bien(nombre + ': los 12 aliados a la vista, quietos, en ' + r.alto + ' px');
  await page.close();
}

// ── El muro detrás de toda la home (26/09/2026, components/MuroFondo.jsx) ──
// Cada sección y el pie llevan su copia del muro, fija a la pantalla: si una
// sección nueva entra sin la suya, o un transform en un ancestro rompe el
// fixed (el muro empezaría a moverse con la sección y las líneas dejarían de
// coincidir), esto lo dice. El tono se controla contra el fondo real.
console.log('\n── El muro detrás de toda la home');
for (const [nombre, width, height] of [['móvil 390', 390, 844], ['escritorio', 1440, 900]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight / 2, behavior: 'instant' }));
  const secs = await page.evaluate(() => {
    const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number); return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; };
    return [...document.querySelectorAll('[data-page="viva"] > section, [data-page="viva"] > footer')].map((s) => {
      const m = s.querySelector(':scope > .muro-marco');
      const t = m && m.querySelector('.muro-texto');
      const bb = t && t.getBoundingClientRect();
      const nombre = s.id || (s.querySelector('h1,h2') || {}).textContent || s.tagName.toLowerCase();
      return {
        nombre: nombre.trim().slice(0, 28),
        tono: m ? ([...m.classList].find((c) => c !== 'muro-marco' && c.startsWith('muro-')) || '').replace('muro-', '') : '',
        esperado: s.classList.contains('dta') ? 'pleno' : lum(getComputedStyle(s).backgroundColor) < 0.4 ? 'oscuro' : 'claro',
        textura: !!m && m.getAttribute('aria-hidden') === 'true' && getComputedStyle(m).pointerEvents === 'none',
        fijo: !!t && getComputedStyle(t).position === 'fixed' && Math.abs(bb.top) < 1 && Math.abs(bb.height - innerHeight) < 2,
        // Los que el home deja afuera hasta que SP los verifique (sp-interno#71;
        // FUERA_DEL_HOME de scripts/red-home.mjs).
        afuera: t ? ['Sanatorio da Vinci', 'COMED Amambay', 'Planmed Caaguazú'].filter((n) => t.textContent.includes(n)) : [],
      };
    });
  });
  const colados = [...new Set(secs.flatMap((x) => x.afuera))];
  if (colados.length) mal(nombre + ': el muro muestra prestadores que el home deja afuera: ' + colados.join(' · '));
  const sin = secs.filter((x) => !x.tono), mal_tono = secs.filter((x) => x.tono && x.tono !== x.esperado);
  const suelto = secs.filter((x) => x.tono && (!x.textura || !x.fijo));
  if (!secs.length) mal(nombre + ': no encontré las secciones de la home');
  if (sin.length) mal(nombre + ': ' + sin.length + ' sección(es) sin muro: ' + sin.map((x) => x.nombre).join(' · '));
  if (mal_tono.length) mal(nombre + ': tono del muro que no va con su fondo: ' + mal_tono.map((x) => x.nombre + ' (' + x.tono + ', va ' + x.esperado + ')').join(' · '));
  if (suelto.length) mal(nombre + ': muro que lo leen los lectores, ataja el puntero o no queda fijo: ' + suelto.map((x) => x.nombre).join(' · '));
  if (secs.length && !sin.length && !mal_tono.length && !suelto.length && !colados.length) bien(nombre + ': las ' + secs.length + ' secciones con su muro, fijo, en el tono de su fondo y sin los prestadores que quedan afuera');
  await page.close();
}

// El botón «Revisión» (la sala de revisión, uso interno) sale de la v1 desde el
// 23/10/2026: Arturo eligió dejarlo solo en el prototipo (sp-interno#192, A).
// Se mira con el navegador porque en el celular vive en el menú, que se arma
// al abrirlo; qa/produccion.mjs mira el HTML del build.
console.log('\n── El botón «Revisión» no sale en la v1');
for (const [nombre, width, height] of [['móvil 390', 390, 844], ['escritorio', 1280, 900]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  const vistos = [];
  for (const ruta of ['/', '/planes/', '/simulador/', '/guia-medica/']) {
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
    if (width < 900 && (await page.$('.nav-burger'))) { await page.click('.nav-burger'); await page.waitForTimeout(350); }
    const n = await page.evaluate(() => document.querySelectorAll('.revision-btn, a[href*="claude.ai/artifact"]').length);
    if (n) vistos.push(ruta + ' (' + n + ')');
  }
  if (vistos.length) mal(nombre + ': el botón «Revisión» aparece en la v1: ' + vistos.join(' · '));
  else bien(nombre + ': sin el botón «Revisión» en home, planes, simulador y Guía Médica, con el menú abierto');
  await page.close();
}

// Lo que se vende (Arturo, 23/10/2026): Essential, Silver, Gold y Vital. Bronze
// ya no se vende, pero lo tienen clientes: se queda en la Guía Médica (sus
// fichas y su filtro) y en ningún lugar de venta. Lo mismo los planes viejos de
// la red. «Superior» e «Integral» quedan afuera de la lista a propósito: son
// palabras comunes y nombres de prestadores del muro, y gritarían en falso.
console.log('\n── En las páginas de venta, solo los planes que se venden');
const NO_SE_VENDEN = /\b(Bronze|Bronce|Primordial|Bienestar|Estatal|Previsor|Privilege)\b/g;
const leerVenta = (page) => page.evaluate((re) => {
  const r = new RegExp(re, 'g');
  const vistos = new Set();
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const el = n.parentElement;
    if (!el || el.closest('[aria-hidden="true"], script, style')) continue;
    for (const m of n.textContent.matchAll(r)) vistos.add(m[1]);
  }
  return [...vistos];
}, NO_SE_VENDEN.source);
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  // La prueba del control: con «Plan Bronze» metido en la página, tiene que verlo.
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => { const p = document.createElement('p'); p.textContent = 'Plan Bronze, desde Gs. 199.000'; document.body.appendChild(p); });
  if (!(await leerVenta(page)).includes('Bronze')) mal('el control de planes que no se venden no ve «Plan Bronze» metido en la página');
  const vistos = [];
  for (const ruta of ['/', '/planes/', '/simulador/']) {
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
    const v = await leerVenta(page);
    if (v.length) vistos.push(ruta + ': ' + v.join(', '));
  }
  if (vistos.length) mal('una página de venta nombra planes que no se venden: ' + vistos.join(' · '));
  else bien('home, planes y simulador nombran solo Essential, Silver, Gold y Vital (el control ve «Plan Bronze» si se lo mete)');
  await page.close();
}

await browser.close();
console.log('\n' + (fallas ? '✗ ' + fallas + ' falla(s)' : '✓ todo verde'));
process.exit(fallas ? 1 : 0);
