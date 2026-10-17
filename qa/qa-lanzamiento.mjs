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

import { readFileSync } from 'node:fs';

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
console.log('\n── La forma corta (P3A)');
{
  const { DUDA, QUIEN_SG, QUIEN_PSICO, NOTA_UNIDAD } = COV;
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
      return { t: (k ? k.textContent : (c.querySelector('.cmp2-v') || {}).textContent || '').replace(/\u00a0/g, ' '), sr: ((c.querySelector('.cmp2-v .sr-solo') || {}).textContent || ''), duda: !!c.querySelector('.cmp2-v .cmp2-duda'), corta: !!k };
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
  if (malas.length) mal('forma corta: Essential dice «/familia/» y Silver y Gold «/' + QUIEN_SG + '/» (que se toca), con su frase completa y sin «persona» hasta que SP lo confirme (sp-interno#110) · ' + malas.join(' · '));
  else bien('forma corta en tomografía, resonancia, psicología, fisioterapia, internación y ecografía: «familia» en Essential y «' + QUIEN_SG + '» en Silver y Gold, con su frase para lectores (home, tabla y plegable de /planes)');
  // El hueco con la letra, el color y el peso de «familia», más el subrayado punteado.
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const estilo = await page.evaluate(() => {
    const filas = [...document.querySelectorAll('#cartilla .cmp2-plan')];
    const enFila = (pl) => [...pl.querySelectorAll('.cmp2-c')].find((x) => ((x.querySelector('.cmp2-l') || {}).textContent || '').trim() === 'Resonancia (RM)');
    const fam = enFila(filas[0]) && enFila(filas[0]).querySelector('.corta-r');
    const duda = enFila(filas[1]) && enFila(filas[1]).querySelector('.corta-duda');
    if (!fam || !duda) return null;
    const q = (e) => { const c = getComputedStyle(e); return { familia: c.fontFamily, color: c.color, peso: c.fontWeight, tamaño: c.fontSize }; };
    return { familia: q(fam), duda: q(duda), subrayado: getComputedStyle(duda).borderBottomStyle, texto: duda.textContent };
  });
  if (QUIEN_SG === DUDA && (!estilo || JSON.stringify(estilo.familia) !== JSON.stringify(estilo.duda) || estilo.subrayado !== 'dotted' || estilo.texto !== DUDA)) mal('«' + DUDA + '» no tiene la letra, el color y el peso de «familia», o le falta el subrayado punteado: ' + JSON.stringify(estilo));
  else bien('«' + DUDA + '» con la misma letra, color y peso que «familia», y subrayado punteado');
  // Se abre con un clic y con el teclado, no al pasar el mouse (ajuste 4 del comité).
  const celdaDuda = page.locator('#cartilla .cmp2-plan').nth(1).locator('.cmp2-c', { has: page.locator('.cmp2-l', { hasText: 'Resonancia (RM)' }) }).locator('.cmp2-duda');
  let abre = null;
  if (QUIEN_SG === DUDA && (await celdaDuda.count())) {
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
    const conClic = await page.evaluate(() => { const t = document.querySelector('#cartilla .cmp2-tarjeta'); return t ? { planes: t.querySelectorAll('.cmp2-tarjeta-p').length, pie: (t.querySelector('.cmp2-tarjeta-pie') || {}).textContent || '' } : null; });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    const cerrada = await page.evaluate(() => !document.querySelector('#cartilla .cmp2-tarjeta'));
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    const conTeclado = await page.evaluate(() => !!document.querySelector('#cartilla .cmp2-tarjeta') && document.activeElement.classList.contains('cmp2-duda'));
    const ev = (await page.evaluate(() => window.__tracks)).filter((x) => x.evento === 'abre_explicacion' && x.datos?.tipo === 'duda');
    abre = { conHover, conClic, cerrada, conTeclado, ev: ev.length };
  }
  const pieBien = (p) => p === 'Por familia: un cupo que comparten todos los del grupo. ' + NOTA_UNIDAD && !/contrato/i.test(p);
  if (QUIEN_SG === DUDA && (!abre || abre.conHover || !abre.conClic || abre.conClic.planes !== 3 || !pieBien(abre.conClic.pie) || !abre.cerrada || !abre.conTeclado || abre.ev !== 1)) mal('computadora: la celda con «' + DUDA + '» tiene que abrir la tarjeta con un clic y con el teclado, no al pasar el mouse, con el pie que manda al asesor sin afirmar nada del contrato, y medirse como «duda» (' + JSON.stringify(abre) + ')');
  else bien('computadora: la celda con «' + DUDA + '» abre la tarjeta con un clic y con el teclado, no al pasar el mouse; el pie manda al asesor y se mide como «duda»');
  await page.close();

  // 2. Celular: el toque, las líneas de las tarjetas y la lista de los once.
  for (const width of [360, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
    const cel = await ctx.newPage();
    await cel.goto(BASE + '/', { waitUntil: 'networkidle' });
    const n = 'móvil ' + width;
    let toque = null;
    const dudaCel = cel.locator('#cartilla .cmp2-plan').nth(1).locator('.cmp2-duda').first();
    if (QUIEN_SG === DUDA && (await dudaCel.count())) {
      await cel.waitForFunction(() => { const b = document.querySelector('.cmp2-duda'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).catch(() => {});
      await dudaCel.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await cel.waitForTimeout(1200);
      await dudaCel.tap();
      await cel.waitForTimeout(200);
      toque = await cel.evaluate(() => { const t = document.querySelector('#cartilla .cmp2-tarjeta'); if (!t) return null; const r = t.getBoundingClientRect(); return { planes: t.querySelectorAll('.cmp2-tarjeta-p').length, dentro: r.left >= 0 && r.right <= innerWidth + 1 }; });
    }
    if (QUIEN_SG === DUDA && (!toque || toque.planes !== 3 || !toque.dentro)) mal(n + ': tocar la celda con «' + DUDA + '» tiene que abrir la tarjeta del servicio, dentro de la pantalla (' + JSON.stringify(toque) + ')');
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

// ── La fisioterapia de Gold va al asesor (G1A, Arturo, 17/10/2026, «Todo A») ─
// La fuente se contradice (sp-interno#50): gold.json dice 20 + 5 sesiones y la
// grilla, 10 + 3. Mientras SP no lo aclare, la celda de Gold manda al asesor
// por el número en la tabla del home, la de /planes, la lista de los once
// servicios y los dos renglones de fisioterapia del plegable, y los cuatro
// dicen lo mismo (ASESOR de coverage.js). La tarjeta y la hoja no le dan a Gold
// ningún número, y la línea de la nota lo dice. Probado contra la rama con la
// P3A sin la G1A (falla) y con ella (pasa).
console.log('\n── La fisioterapia de Gold (G1A)');
{
  const { ASESOR } = COV;
  const nota = 'En Gold, preguntale a tu asesor cuántas sesiones de fisioterapia tiene.';
  const malas = [];
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
    if (!f || !f[2] || f[2].t !== ASESOR || !f[2].boton || /\d/.test(f[2].t)) malas.push(ruta + ' tabla: ' + JSON.stringify(f && f[2]));
  }
  // La tarjeta que abre la celda de Gold: sin número para Gold y con la línea del asesor.
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => { const b = document.querySelector('.cmp2-duda'); return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps')); }, null, { timeout: 10000 }).catch(() => {});
  const gold = page.locator('#cartilla .cmp2-plan').nth(2).locator('.cmp2-c', { has: page.locator('.cmp2-l', { hasText: 'Fisioterapia' }) }).locator('.cmp2-duda');
  let tarjeta = null;
  if (await gold.count()) {
    await gold.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(1200);
    await gold.click();
    await page.waitForTimeout(200);
    tarjeta = await page.evaluate(() => { const t = document.querySelector('#cartilla .cmp2-tarjeta'); if (!t) return null; const p = [...t.querySelectorAll('.cmp2-tarjeta-p')]; return { gold: p[2] ? p[2].lastElementChild.textContent : null, pie: (t.querySelector('.cmp2-tarjeta-pie') || {}).textContent || '' }; });
  }
  if (!tarjeta || tarjeta.gold === null || /\d/.test(tarjeta.gold.replace(/\b\d+ días de afiliarte/, '')) || !tarjeta.pie.includes(nota)) malas.push('home, tarjeta: ' + JSON.stringify(tarjeta));
  // El plegable de /planes: los dos renglones de fisioterapia.
  await page.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  const pleg = await page.evaluate(() => [...document.querySelectorAll('#detalle-internacion div')].filter((d) => d.children.length === 4 && /^Fisioterapia/.test((d.firstElementChild || {}).textContent || '')).map((d) => d.children[3].textContent.trim()));
  if (pleg.length !== 2 || pleg.some((t) => t !== ASESOR)) malas.push('/planes/ plegable: ' + JSON.stringify(pleg));
  await page.close();
  // La lista de los once servicios y la hoja del servicio, en el celular.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const cel = await ctx.newPage();
  await cel.goto(BASE + '/planes/', { waitUntil: 'networkidle' });
  await cel.locator('.cmp-cel button', { hasText: 'Los once servicios, plan por plan' }).tap();
  await cel.waitForTimeout(450);
  const lista = await cel.evaluate(() => {
    const b = [...document.querySelectorAll('.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo button.fila')].find((x) => /^Fisioterapia/.test(x.querySelector('b').textContent));
    if (!b) return null;
    const c = b.querySelectorAll(':scope > span > span')[2].cloneNode(true);
    c.querySelectorAll('.sr-solo, i').forEach((x) => x.remove());
    return c.textContent.trim();
  });
  if (lista !== ASESOR) malas.push('lista de los once: ' + JSON.stringify(lista));
  await cel.locator('.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo button.fila', { hasText: 'Fisioterapia' }).tap();
  await cel.waitForTimeout(450);
  const hoja = await cel.evaluate(() => { const d = document.querySelector('.cmp-cel .hoja[data-abierta="1"] .hoja-cuerpo'); if (!d) return null; const b = [...d.querySelectorAll('.sq')]; return { gold: b[2] ? b[2].textContent : null, notas: d.textContent }; });
  if (!hoja || !hoja.gold || !hoja.gold.includes(ASESOR) || /\b(?:10|20)\b/.test(hoja.gold) || !hoja.notas.includes(nota)) malas.push('hoja del servicio: ' + JSON.stringify(hoja));
  await ctx.close();
  if (malas.length) mal('la fisioterapia de Gold tiene que mandar al asesor, sin número, y decir lo mismo en la tabla del home y de /planes, la lista y el plegable (sp-interno#50) · ' + malas.join(' · '));
  else bien('la fisioterapia de Gold manda al asesor («' + ASESOR + '») en la tabla del home y de /planes, la lista, el plegable y la hoja, sin número para Gold');
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
    return k ? { t: k.textContent.replace(/ /g, ' '), sr: (c.querySelector('.cmp2-v .sr-solo') || {}).textContent || '' } : null;
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
      o[b.querySelector('b').textContent.replace(/ ›$/, '')] = [...b.querySelectorAll(':scope > span > span')].map((c) => { const k = c.cloneNode(true); k.querySelectorAll('.sr-solo, i').forEach((x) => x.remove()); return k.textContent.replace(/ /g, ' '); });
    }
    return o;
  });
  const m = lista['Medicamentos en internación'] || [], u = lista['Urgencia 24 h'] || [], pa = lista['Parto o cesárea'] || [];
  if (!MED.every((e, i) => m[i] === e)) malas.push('lista, medicamentos: ' + JSON.stringify(m));
  if (!REM.every((e, i) => e === null || (u[i] || '').endsWith('remedios ' + e))) malas.push('lista, urgencias: ' + JSON.stringify(u));
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

// ── Una sola forma de mandar al asesor (R1A, Arturo, 17/10/2026) ────────────
// «Consultalo», «Consultalo con tu asesor» y «Confirmalo con tu asesor» pasaron
// a «Preguntale a tu asesor» (ASESOR de coverage.js). Se mira el texto que
// traen las páginas de la v1 (con lo que se abre al tocar) y el código de app/
// sin comentarios, porque el buscador de estudios guardado no tiene página. Y
// la fila de remedios en urgencias de Essential: la celda del home y la de
// /planes, y el «—» del plegable, que se leía «no cubre». Probado contra la
// rama sin la R1A (falla) y con ella (pasa).
console.log('\n── Una sola forma de mandar al asesor (R1A)');
{
  const { ASESOR } = COV;
  // Sin \b: textContent pega celdas vecinas («urgenciasConsultalo») y el límite de palabra no se ve.
  const VIEJAS = /(?:consult|confirm)[aá]lo/i;
  const malas = [];
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const ruta of ['/', '/planes/', '/simulador/', '/guia-medica/']) {
    await page.goto(BASE + ruta, { waitUntil: 'networkidle' });
    const m = await page.evaluate((re) => (document.body.textContent.match(new RegExp(re, 'gi')) || []), VIEJAS.source);
    if (m.length) malas.push(ruta + ': ' + [...new Set(m)].join(', '));
  }
  // El código: sin comentarios, cada «Consultalo»/«Confirmalo» que quede es texto de cara al usuario.
  const { readdirSync } = await import('node:fs');
  const raiz = new URL('../app/', import.meta.url);
  const archivos = readdirSync(raiz, { recursive: true }).filter((f) => /\.(jsx?|mjs)$/.test(f) && !/^blog[\\/]/.test(f));
  for (const f of archivos) {
    const sin = readFileSync(new URL(f, raiz), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');
    if (VIEJAS.test(sin)) malas.push('app/' + f);
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
    if (!c || c.t !== ASESOR || !c.boton) malas.push(ruta + ' remedios en urgencias de Essential: ' + JSON.stringify(c));
  }
  const pleg = await page.evaluate(() => { const f = [...document.querySelectorAll('#detalle-internacion div')].find((d) => d.children.length === 4 && /^En urgencia/.test((d.firstElementChild || {}).textContent || '')); return f ? f.children[1].textContent.trim() : null; });
  if (pleg !== ASESOR) malas.push('/planes/ plegable, urgencia de Essential: ' + JSON.stringify(pleg));
  await page.close();
  if (malas.length) mal('una sola forma de mandar al asesor, «' + ASESOR + '»: quedan «Consultalo» o «Confirmalo», o la celda o el plegable de remedios en urgencias de Essential no lo dicen · ' + malas.join(' · '));
  else bien('una sola forma de mandar al asesor: «' + ASESOR + '» en las páginas, el código y la fila de remedios en urgencias de Essential (tablas y plegable)');
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
console.log('\n── La tarjeta del servicio del home, sin esperas (P2A)');
{
  const ESPERA = /a los \d+ días|afiliarte|primer día|día uno|\d+ mes(?:es)?\b|sin espera|de espera|carencia/i;
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
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
    const t = await page.evaluate(() => (document.querySelector('#cartilla .cmp2-tarjeta') || {}).textContent || null);
    if (t) abiertas++;
    if (t && ESPERA.test(t)) conEspera.push(n + ': «' + t.match(ESPERA)[0] + '»');
  }
  await page.mouse.move(5, 5);
  await page.close();
  if (nombres.length !== 9 || abiertas !== 9 || conEspera.length) mal('la tarjeta del servicio del home no lleva esperas (regla del 03/10, P2A): ' + JSON.stringify({ servicios: nombres.length, abiertas, conEspera }));
  else bien('las nueve tarjetas de servicio del home se abren sin esperas');
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
