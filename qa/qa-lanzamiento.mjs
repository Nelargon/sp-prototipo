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
    const conClic = await page.evaluate(() => { const t = document.querySelector('#cartilla .cmp2-tarjeta'); return t ? { planes: t.querySelectorAll('.cmp2-tarjeta-p').length, pie: (t.querySelector('.cmp2-tarjeta-pie') || {}).innerText || '' } : null; });
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
  // El pie no afirma nada del contrato ni la unidad de Silver y Gold (comité,
  // vuelta 3, 17/10): antes se comparaba con la constante y solo rechazaba la
  // palabra «contrato», así que un NOTA_UNIDAD que dijera «En Silver y Gold son
  // para cada persona.» pasaba en verde. Ahora se lee el texto que se ve, oración
  // por oración: manda a preguntar por Silver y Gold, y toda oración que nombre
  // Silver o Gold con una unidad («por persona», «para todo el grupo»…) la dice
  // después de «preguntale a tu asesor si», como pregunta, no como dato. «Por
  // familia: …» es la definición de la unidad de Essential y queda.
  // Corrección del 18/10 (verificador de accesibilidad): la lista de unidades
  // enumeraba formas conocidas («por persona», «cada uno»…) y pasaban «En Silver
  // y Gold, cada persona tiene su propio cupo: preguntale a tu asesor si querés
  // saber cuántos son.», «son individuales», «cada integrante tiene los suyos» o
  // «son por afiliado». Ahora el pie se compara con los textos que fijó Arturo
  // el 17/10, escritos acá como literales (no leídos de coverage.js, que es lo
  // que dibuja la página): la pregunta por la unidad tiene que estar tal cual, la
  // definición de «por familia» puede estar, y cualquier otra oración solo puede
  // ser otra pregunta al asesor («En Gold, preguntale a tu asesor cuántas
  // sesiones de fisioterapia tiene.»): nada dicho antes de «preguntale» y ninguna
  // palabra de unidad.
  const DEFINICION = 'Por familia: un cupo que comparten todos los del grupo.';
  const PREGUNTA_UNIDAD = 'En Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo.';
  const OTRA_PREGUNTA = /^En (?:Essential|Silver|Gold|Silver y Gold), preguntale a tu asesor (?:cuánt[oa]s?|qué|cuál|cómo|si)\b[^.:;]*\.$/;
  const DE_UNIDAD = /persona|familia|grupo|individual|integrante|afiliad|beneficiari|\bcada\b|cupo|\bsuy[oa]s\b/i;
  const pieBien = (p) => {
    if (!p || /contrato/i.test(p)) return false;
    const oraciones = p.replace(/\s+/g, ' ').trim().split(/(?<=\.)\s+/);
    return oraciones.includes(PREGUNTA_UNIDAD) && oraciones.every((o) => o === DEFINICION || o === PREGUNTA_UNIDAD || (OTRA_PREGUNTA.test(o) && !DE_UNIDAD.test(o)));
  };
  const P = DEFINICION + ' ';
  const pieAuto = {
    deHoy: pieBien(P + PREGUNTA_UNIDAD),
    fisioterapia: pieBien(P + PREGUNTA_UNIDAD + ' En Gold, preguntale a tu asesor cuántas sesiones de fisioterapia tiene.'),
    afirma: pieBien(P + 'En Silver y Gold son para cada persona.'),
    afirmaYPregunta: pieBien(P + 'En Silver y Gold son por persona; preguntale a tu asesor si cambia.'),
    contrato: pieBien(P + 'Según el contrato, en Silver y Gold, preguntale a tu asesor si son para cada persona o para todo el grupo.'),
    noPregunta: pieBien(P.trim()),
    cadaPersona: pieBien(P + 'En Silver y Gold, cada persona tiene su propio cupo: preguntale a tu asesor si querés saber cuántos son.'),
    cadaPersonaYPregunta: pieBien(P + 'En Silver y Gold, cada persona tiene su propio cupo. ' + PREGUNTA_UNIDAD),
    individuales: pieBien(P + 'En Silver y Gold son individuales. ' + PREGUNTA_UNIDAD),
    integrante: pieBien(P + 'En Silver y Gold cada integrante tiene los suyos. ' + PREGUNTA_UNIDAD),
    afiliado: pieBien(P + 'En Silver y Gold son por afiliado. ' + PREGUNTA_UNIDAD),
    preguntaQueAfirma: pieBien(P + 'En Silver y Gold, preguntale a tu asesor si querés: son para cada persona.'),
    afirmaDespues: pieBien(P + PREGUNTA_UNIDAD + ' Son para cada persona.'),
    otraQueAfirma: pieBien(P + PREGUNTA_UNIDAD + ' En Gold, preguntale a tu asesor si son más, porque son por persona.'),
  };
  const pieMalos = Object.entries(pieAuto).filter(([k, v]) => !['deHoy', 'fisioterapia'].includes(k) && v).map(([k]) => k);
  if (!pieAuto.deHoy || !pieAuto.fisioterapia || pieMalos.length) mal('el detector del pie no distingue la pregunta al asesor de una afirmación de unidad o del contrato: ' + JSON.stringify(pieAuto));
  else bien('el detector del pie deja pasar los dos pies de hoy (con la pregunta que fijó Arturo) y rechaza las ' + (Object.keys(pieAuto).length - 2) + ' afirmaciones de unidad o del contrato («son para cada persona», «cada persona tiene su propio cupo», «son individuales», «por afiliado», la unidad antes o después de la pregunta, «contrato» y un pie sin la pregunta)');
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
    const lineas = await cel.evaluate(() => [...document.querySelectorAll('.cmp-cel article')].map((a) => {
      const l = (re) => [...a.querySelectorAll('.linea-cel')].find((x) => re.test(x.textContent));
      const tr = l(/^Tomografía y resonancia/), it = l(/^Internación/);
      const negrita = it && it.querySelector('b'), corta = it && it.querySelector('.corta');
      return {
        t: tr ? [...tr.querySelectorAll('.corta')].map((k) => k.textContent.replace(/\u00a0/g, ' ')) : null,
        sr: tr ? [...tr.querySelectorAll('.sr-solo')].map((k) => k.textContent).join(' | ') : '',
        texto: tr ? tr.textContent : '',
        navy: !!negrita && !!corta && getComputedStyle(corta).color === getComputedStyle(negrita).color,
      };
    }));
    const lineaBien = (l, i) => !!l.t && l.t.length === 2 && l.navy && (i === 0
      ? l.t[0] === '2 estudios/familia/año' && l.t[1] === '1 resonancia/familia/año' && /por familia/.test(l.sr) && !/2 tomografías/.test(l.texto) && /ecocardiograma o ergometría/.test(l.texto)
      : l.t[0] === '2 tomografías/' + QUIEN_SG + '/año' && l.t[1] === '1 resonancia/' + QUIEN_SG + '/año' && (QUIEN_SG !== DUDA || (/sin confirmar para quién/.test(l.sr) && !/persona/i.test(l.texto + l.sr))));
    if (lineas.length !== 3 || !lineas.every(lineaBien)) mal(n + ': las líneas «Tomografía y resonancia» de las tarjetas: Essential «2 estudios/familia/año (…)», Silver y Gold «2 tomografías/' + QUIEN_SG + '/año», con su frase y la forma corta en navy (' + JSON.stringify(lineas) + ')');
    else bien(n + ': las líneas de las tarjetas en forma corta, en navy, con «2 estudios» en Essential');
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
    const esperado = { 'Tomografía (TAC)': '2/familia/año, junto con ecocardiograma y ergometría', 'Resonancia (RM)': '1/familia/año, sin contraste', 'Sesión de psicología': '3/familia/año, en el mismo cupo que otras especialidades', 'Ecografía': '4/familia/año' };
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
          const esperado = /^Fisioterapia/.test(fila) ? 'Gold' : /^En urgencia/.test(fila) ? 'Essential' : null;
          if (plan !== esperado) malas.push(id + ': «' + ASESOR + '» en «' + fila + '» cae en la columna ' + plan);
        });
      }
    }
  }
  const asesorEnPlegable = (await page.locator('#detalle-internacion').ariaSnapshot()).split('\n').filter((l) => l.includes('cell "' + ASESOR + '"')).length;
  if (asesorEnPlegable !== 3) malas.push('detalle-internacion: tendrían que ser 3 celdas «' + ASESOR + '» (las dos de fisioterapia de Gold y la urgencia de Essential), hay ' + asesorEnPlegable);
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
  const arranque = (t) => (t || '').replace(/^\s*(?:Silver|Gold)/, '').trim();
  const mismaForma = (silver, gold) => /^(?:traumatol|neurol)/i.test(arranque(silver)) && /^(?:traumatol|neurol)/i.test(arranque(gold)) && orden(silver) === orden(gold);
  const autoprueba = {
    formaDeLaVuelta2: mismaForma('15 sesiones al año (traumatológica, neurológica o después de una cirugía), más 5 respiratorias.', 'Traumatológica, neurológica o después de una cirugía, y también respiratoria.'),
    formaNueva: mismaForma('SilverTraumatológica, neurológica o después de una cirugía: 15 sesiones al año; respiratoria: otras 5.3 meses de espera', 'GoldTraumatológica, neurológica o después de una cirugía, y respiratoria.3 meses de espera'),
    numeroQueVuelve: conNumero('GoldTraumatológica, neurológica o después de una cirugía, más 5 respiratorias3 meses de espera'),
    lineaDeHoy: conNumero('Traumatológica, neurológica o después de una cirugía, y también respiratoria. 3 meses de espera.'),
    asimetriaDeLaVuelta1: mismosTipos('15 sesiones al año. 3 meses de espera.', 'Traumatológica, neurológica o después de una cirugía, más respiratorias. 3 meses de espera.'),
    simetria: mismosTipos('15 sesiones al año (traumatológica, neurológica o después de una cirugía), más 5 respiratorias.', 'Traumatológica, neurológica o después de una cirugía, y también respiratoria.'),
  };
  if (!autoprueba.numeroQueVuelve || autoprueba.lineaDeHoy || autoprueba.asimetriaDeLaVuelta1 || !autoprueba.simetria || autoprueba.formaDeLaVuelta2 || !autoprueba.formaNueva) malas.push('los detectores de número, de simetría y de forma no distinguen el caso malo del bueno: ' + JSON.stringify(autoprueba));
  const lineasBien = (x) => !!x && !!x.silver && !!x.gold && !conNumero(x.gold) && !/asesor/i.test(x.gold) && mismosTipos(x.silver, x.gold) && mismaForma(x.silver, x.gold);
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
    tarjeta = await page.evaluate(() => { const t = document.querySelector('#cartilla .cmp2-tarjeta'); if (!t) return null; const p = [...t.querySelectorAll('.cmp2-tarjeta-p')]; return { silver: p[1] ? p[1].lastElementChild.textContent : null, gold: p[2] ? p[2].lastElementChild.textContent : null, pie: (t.querySelector('.cmp2-tarjeta-pie') || {}).textContent || '' }; });
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
    tarjetaPlanes = await page.evaluate(() => { const t = document.querySelector('#comparar-planes .cmp2-tarjeta'); if (!t) return null; const p = [...t.querySelectorAll('.cmp2-tarjeta-p')]; return { silver: p[1] ? p[1].lastElementChild.textContent : null, gold: p[2] ? p[2].lastElementChild.textContent : null, pie: (t.querySelector('.cmp2-tarjeta-pie') || {}).textContent || '', todo: t.textContent }; });
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
  const hoja = await cel.evaluate(() => { const d = document.querySelector('.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo'); if (!d) return null; const b = [...d.querySelectorAll('.sq')]; return { silver: b[1] ? b[1].textContent : null, gold: b[2] ? b[2].textContent : null, notas: d.textContent }; });
  if (!lineasBien(hoja) || !hoja.notas.includes(nota) || (hoja.notas.match(VECES) || []).length > 2) malas.push('hoja del servicio (Gold sin número y con los mismos tipos que Silver): ' + JSON.stringify(hoja && { silver: hoja.silver, gold: hoja.gold }));
  await ctx.close();
  if (malas.length) mal('la fisioterapia de Gold tiene que mandar al asesor, sin número, y decir lo mismo en la tabla del home y de /planes, la lista y el plegable (sp-interno#50); en la tarjeta y la hoja, Silver y Gold nombran los mismos tipos con la misma forma · ' + malas.join(' · '));
  else bien('la fisioterapia de Gold manda al asesor («' + ASESOR + '») en la tabla del home y de /planes, la lista (con el peso de la forma corta) y el plegable; la tarjeta y la hoja, sin ningún número para Gold, con los mismos tipos que Silver, en el mismo orden y arrancando por el tipo, y sin repetir el pedido; los detectores distinguen el caso malo del bueno');
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
// - en el plegable, la maternidad de Gold nombra la cesárea con ASESOR.
// Cada regla se prueba antes contra lo que mostraba 02c733a (tiene que fallar) y
// contra lo de hoy (tiene que pasar), y el ✓ dice lo que vio.
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
  };
  // Las notas de la tabla de esperas de /planes, por fila y por plan.
  const TABLA = {
    'Parto': [null, null, cesarea],
    'Análisis de laboratorio': [(t) => /rutina/i.test(t), (t) => /la mayoría/i.test(t), (t) => /la mayoría/i.test(t)],
    'Cirugías programadas': [(t) => /cirug[ií]a/i.test(t) && /familia/i.test(t), (t) => /la mayoría/i.test(t), (t) => /la mayoría/i.test(t)],
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
    tablaVieja: tablaMala({ 'Parto': [null, null, null], 'Análisis de laboratorio': [null, 'la mayoría', 'la mayoría'], 'Cirugías programadas': [null, 'la mayoría', 'la mayoría'] }).length,
    tablaBuena: tablaMala({ 'Parto': [null, null, 'Cesárea: preguntale a tu asesor'], 'Análisis de laboratorio': ['los de rutina, sin espera', 'la mayoría', 'la mayoría'], 'Cirugías programadas': ['1 cirugía/familia/año', 'la mayoría', 'la mayoría'] }).length,
  };
  const malas = [];
  if (auto.partoGoldViejo || auto.partoGoldSinCesarea || !auto.partoGoldBueno || auto.internacionVieja || !auto.internacionBuena || auto.oidoViejo || !auto.oidoBueno || auto.internacionOidaVieja || !auto.internacionOidaBuena || !auto.tablaVieja || auto.tablaBuena) malas.push('las reglas no distinguen lo que mostraba 02c733a de lo de hoy: ' + JSON.stringify(auto));
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
  else bien('las reglas distinguen lo que mostraba 02c733a de lo de hoy, y las esperas llevan su condición: en la lista, Gold en «Parto o cesárea» dice «' + visto.lista + '» y Silver en «Internación», «' + visto.internacion + '» (también para el lector); en la tabla de /planes, el parto de Gold dice «' + visto.tabla + '», y en el plegable, «' + visto.plegable + '»; en la hoja, lo que manda al asesor va arriba en los ' + Object.keys(lista).length + ' servicios');
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

// ── La tarjeta del servicio del home no muestra esperas (P2A, Arturo, 17/10) ─
// La regla del 03/10 (ninguna espera en la vista rápida) vale también para la
// tarjeta que se abre al pasar el mouse por el nombre de un servicio de la
// tabla del home. Se abre cada una, como una persona (el mouse que entra desde
// afuera, con el botón quieto), y se busca cualquier espera: «a los N días»,
// «de afiliarte», «desde el primer día», «día uno», «N meses», «sin espera».
// Las esperas siguen en /planes (lo controla «/planes/ en el celular» y la
// tarjeta de Internación de la computadora). Probado contra la rama sin la P2A
// (falla) y con ella (pasa).
// Vuelta 3 (comité, 17/10): la expresión enumeraba formas conocidas y «esperás
// un año», «después de 365 días» o «a partir del día 91» pasaban en verde. Ahora
// rechaza la clase: cualquier plazo en días, semanas, meses o años que no sea un
// tope por año («20 días al año», «25 días/persona/año»), un «día N», y las
// palabras de espera (espera, esperás, carencia, afiliarte, primer día, día uno,
// desde el día, inmediata). Con su caso malo y su caso bueno acá mismo.
// Corrección del 18/10 (verificador de accesibilidad), dos huecos:
// - la tarjeta se leía con textContent, que pega el plan a su línea
//   («Silver5 meses para usarla.»), y una espera al principio de la línea de un
//   plan, donde más naturalmente iría, no se veía. Ahora se lee texto por texto,
//   separado por espacios, y la autoprueba incluye una tarjeta armada así en la
//   página, leída con la misma función;
// - quedaban afuera plazos comunes: los ordinales («a partir del tercer mes»,
//   «al segundo año»), «el mes 4», «al año de contratarlo», «a los 365» y «en un
//   año». «En un año» solo pasa en la definición de tope del glosario («podés
//   usar algo en un año»), que es una frecuencia.
console.log('\n── La tarjeta del servicio del home, sin esperas (P2A)');
{
  // «en un año» es un plazo («lo podés usar en un año»), salvo después de una
  // cantidad, donde es una frecuencia («hasta 5 sesiones en un año», «usar algo
  // en un año» de la definición de tope).
  const CUANTO = '(?:\\d+|(?<!(?:\\balgo|\\bveces|\\d+\\s+[a-záéíóúñ]+)\\s+en\\s)un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)';
  const PLAZO_U = '(?:d[ií]as?|semanas?|mes(?:es)?|años?)';
  const ORDINAL = '(?:primer[oa]?|segund[oa]|tercer[oa]?|cuart[oa]|quint[oa]|sext[oa]|s[ée]ptim[oa]|octav[oa]|noven[oa]|d[ée]cim[oa]|[úu]ltim[oa])';
  const ESPERA = new RegExp([
    // un plazo que no es un tope por año: «3 meses», «un año», «365 días»
    '(?:^|[^\\w\\u00c0-\\u024f])' + CUANTO + '\\s+' + PLAZO_U + '(?![\\w\\u00c0-\\u024f])(?!\\s*(?:al|por)\\s+año|\\s*\\/)',
    // un ordinal: «al tercer mes», «a partir del segundo año», «primer día»
    '\\b' + ORDINAL + '\\s+(?:d[ií]a|semana|mes|año)\\b',
    // un número de día, semana, mes o año: «el mes 4», «a partir del día 91»
    '\\b(?:d[ií]a|semana|mes|año)\\s+(?:n[.º°]\\s*)?\\d+\\b',
    // «al año de contratarlo», «al mes de afiliarte»
    '\\bal\\s+(?:d[ií]a|mes|año)\\s+de\\b',
    // «a los 365», «a las 6 semanas»
    '\\ba\\s+l[oa]s\\s+\\d+',
    // lo que dice que no hay espera: «desde el comienzo», «desde que entrás»
    '\\bdesde\\s+(?:el\\s+(?:comienzo|principio|inicio)|que\\s+(?:entr|firm|contrat|te\\s+(?:afili|sum)))',
    '\\bd[ií]a\\s+uno\\b', '\\besper(?:a[rns]?|ás|ando|ado)\\b', 'carencia', 'afilia', 'desde el d[ií]a', 'inmediat',
  ].join('|'), 'i');
  // Lo que dice una tarjeta: cada texto por separado, sin pegar el plan a su línea.
  const LEER_TARJETA = `(t) => { const out = []; const w = document.createTreeWalker(t, NodeFilter.SHOW_TEXT); for (let n = w.nextNode(); n; n = w.nextNode()) out.push(n.data); return out.join(' ').replace(/\\s+/g, ' ').trim(); }`;
  const esperaAuto = {
    malas: ['esperás un año', 'después de 365 días', 'a partir del día 91', 'a los 365 días de afiliarte', '3 meses de espera', 'Sin espera', 'desde el primer día', 'Se puede usar a los 150 días.', 'Desde el día uno.', 'Cubre de inmediato.', 'Hay que esperar seis meses.', 'Lo usás en 3 meses.',
      'A partir del tercer mes.', 'Desde el mes 4.', 'Al tercer mes ya lo usás.', 'Recién al año de contratarlo.', 'Lo podés usar en un año.', 'A partir del segundo año.', 'Se usa a los 365.', 'Está habilitado desde el comienzo.', 'Lo usás desde que entrás.'],
    buenas: ['20 días al año para toda la familia, en habitación privada.', 'Hasta 2 días al año por persona.', '25 días/persona/año', 'Hasta 3 por mes en cada especialidad; después, con copago.', '1 al año, y no ponés nada.', 'Sin tope en 23 de las 43 especialidades; en el resto, 5 o 6 al año por persona.', 'En Essential, preguntale a tu asesor cuánto cubre en remedios en urgencias.', 'Tope: la cantidad máxima de veces que podés usar algo en un año, o el monto máximo que cubre el plan.',
      'Hasta 2 al año para toda la familia, contando también ecocardiograma y ergometría.', '1 al año para toda la familia. Sin contraste ni sedación.', 'Hasta Gs. 1.500.000 en medicamentos y descartables en cada internación.', 'Hasta 6 días al año.', 'Hasta Gs. 350 mil por evento.', 'Hasta 5 sesiones en un año.'],
  };
  const formas = esperaAuto.malas.length;
  esperaAuto.malas = esperaAuto.malas.filter((t) => !ESPERA.test(t));
  esperaAuto.buenas = esperaAuto.buenas.filter((t) => ESPERA.test(t));
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  // El caso en contexto: una tarjeta armada como las del home, con la espera al
  // principio de la línea de un plan (tiene que encontrarla) y la misma tarjeta
  // sin espera (no tiene que encontrar nada), leídas con la misma función.
  const enContexto = await page.evaluate((fn) => {
    const leer = eval(fn);
    const d = document.createElement('div');
    d.innerHTML = '<span class="cmp2-tarjeta" id="qa-t-mala"><b class="cmp2-tarjeta-t">Tomografía (TAC)</b><span class="cmp2-tarjeta-p"><b>Essential</b><span>Hasta 2 al año.</span></span><span class="cmp2-tarjeta-p"><b>Silver</b><span>5 meses para usarla.</span></span></span>'
      + '<span class="cmp2-tarjeta" id="qa-t-buena"><b class="cmp2-tarjeta-t">Tomografía (TAC)</b><span class="cmp2-tarjeta-p"><b>Essential</b><span>Hasta 2 al año.</span></span><span class="cmp2-tarjeta-p"><b>Silver</b><span>Hasta 2 al año.</span></span></span>';
    document.body.appendChild(d);
    const r = { mala: leer(d.querySelector('#qa-t-mala')), buena: leer(d.querySelector('#qa-t-buena')), pegada: d.querySelector('#qa-t-mala').textContent };
    d.remove();
    return r;
  }, LEER_TARJETA);
  if (!ESPERA.test(enContexto.mala)) esperaAuto.malas.push('en contexto: ' + enContexto.mala);
  if (ESPERA.test(enContexto.buena)) esperaAuto.buenas.push('en contexto: ' + enContexto.buena);
  if (esperaAuto.malas.length || esperaAuto.buenas.length) mal('el detector de esperas no distingue el caso malo del bueno: ' + JSON.stringify(esperaAuto));
  else bien('el detector de esperas encuentra las ' + formas + ' formas de un plazo («esperás un año», «a partir del tercer mes», «al año de contratarlo», «a los 365»…) y la espera al principio de la línea de un plan en una tarjeta armada en la página (que con textContent se leía «' + enContexto.pegada.slice(enContexto.pegada.indexOf('Silver'), enContexto.pegada.indexOf('Silver') + 14) + '…»), y deja pasar los topes por año');
  await page.waitForFunction(() => { const b = document.querySelector('.cmp2-srv'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).catch(() => {});
  const nombres = await page.$$eval('#cartilla .cmp2-lab .cmp2-srv', (bs) => bs.map((b) => b.textContent.trim()));
  const conEspera = [];
  let abiertas = 0;
  for (const n of nombres) {
    const btn = page.locator('#cartilla .cmp2-lab .cmp2-srv', { hasText: n }).first();
    await btn.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(250);
    const c = await btn.boundingBox();
    await page.mouse.move(5, 5);
    await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
    await page.waitForTimeout(150);
    const t = await page.evaluate((fn) => { const k = document.querySelector('#cartilla .cmp2-tarjeta'); return k ? eval(fn)(k) : null; }, LEER_TARJETA);
    if (t) abiertas++;
    if (t && ESPERA.test(t)) conEspera.push(n + ': «' + t.match(ESPERA)[0] + '»');
  }
  await page.mouse.move(5, 5);
  await page.close();
  if (nombres.length !== 9 || abiertas !== 9 || conEspera.length) mal('la tarjeta del servicio del home no lleva esperas (regla del 03/10, P2A): ' + JSON.stringify({ servicios: nombres.length, abiertas, conEspera }));
  else bien('las nueve tarjetas de servicio del home se abren sin esperas (leídas texto por texto)');
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

await browser.close();
console.log('\n' + (fallas ? '✗ ' + fallas + ' falla(s)' : '✓ todo verde'));
process.exit(fallas ? 1 : 0);
