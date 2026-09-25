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

const pwMod = await import(process.env.PW_PATH || 'playwright-core');
const { chromium } = pwMod.default ?? pwMod;

const BASE = process.argv[2] || 'http://localhost:8080/sp-prototipo/lanzamiento';
const PAGINAS = ['/', '/guia-medica/', '/guia-medica/P-0001/', '/planes/', '/que-cubre/', '/simulador/'];
// 360/390/430: el piso de verificación móvil del proyecto (77% del tráfico).
const ANCHOS = [['escritorio', 1440, 900], ['móvil 360', 360, 780], ['móvil 390', 390, 844], ['móvil 430', 430, 932]];

let fallas = 0;
const mal = (m) => { fallas++; console.log('  ✗ ' + m); };
const bien = (m) => console.log('  ✓ ' + m);

const browser = await chromium.launch({ executablePath: process.env.PW_CHROME || '/opt/pw-browsers/chromium' });

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

await browser.close();
console.log('\n' + (fallas ? '✗ ' + fallas + ' falla(s)' : '✓ todo verde'));
process.exit(fallas ? 1 : 0);
