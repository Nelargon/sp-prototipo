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
    // La última fila de Essential (la primera tarjeta o columna de plan).
    const essential = document.querySelector('#cartilla .cmp2-plan');
    const filas = essential ? [...essential.querySelectorAll('.cmp2-c')] : [];
    const ultima = filas.length ? filas[filas.length - 1] : null;
    const nombre = ultima ? ultima.querySelector('.cmp2-srv')?.textContent.trim() : '';
    const celdas = ultima ? [nombre, ultima.querySelector('.cmp2-v')?.textContent.trim() || ''] : [];
    const ley = document.getElementById('bolsillo');
    const puertas = [...document.querySelectorAll('#comparar .cmp-puertas a')].map((a) => ({ h: a.getAttribute('href'), alto: a.getBoundingClientRect().height }));
    const senior = [...comp.querySelectorAll('a')].find((a) => a.textContent.includes('Simulá Plan Vital'));
    return {
      espera: celdas[0] && celdas[0].startsWith('Tiempo de espera') && /1 año/.test(celdas[1] || ''),
      ley: !!ley && !!ley.closest('#faq') && /Copago/.test(ley.textContent),
      puertas, senior: senior && senior.getAttribute('href'),
      // textContent y no innerText: el rótulo viejo iba en mayúsculas por CSS,
      // e innerText lo devuelve transformado («¿DÓNDE ATENDERTE?»).
      viejo: ['¿Dónde atenderte?', 'más de 600'].filter((t) => comp.textContent.includes(t)),
    };
  });
  const destinos = ['/que-cubre/', '/planes/', '/guia-medica/'];
  const faltan = destinos.filter((d) => !r.puertas.some((p) => p.h && p.h.endsWith(d)));
  const chicas = width < 600 ? r.puertas.filter((p) => p.alto < 44).length : 0;
  if (!r.espera) mal(nombre + ': la última fila de la tabla no es «Tiempo de espera» con «1 año» en Essential');
  else bien(nombre + ': la espera de Essential es una fila de la tabla');
  if (!r.ley) mal(nombre + ': falta #bolsillo en el FAQ, con copago (lo enlaza el menú «Qué pagás de tu bolsillo»)');
  else bien(nombre + ': #bolsillo es una pregunta del FAQ que explica el copago');
  if (faltan.length || chicas) mal(nombre + ': puertas del comparador — faltan ' + (faltan.join(', ') || 'ninguna') + (chicas ? '; ' + chicas + ' miden menos de 44 px' : ''));
  else bien(nombre + ': tres puertas (qué cubre, planes, guía)' + (width < 600 ? ', de 44 px o más' : ''));
  if (r.viejo.length) mal(nombre + ': el comparador todavía dice ' + r.viejo.join(' y '));
  else bien(nombre + ': sin la banda «¿Dónde atenderte?» ni el total');
  // Desde el 26/09 lleva ?plan=vital: el simulador entra directo al carril de
  // padres (sp-interno#59). Un enlace a /simulador/ sin el parámetro es el
  // arreglo deshecho.
  if (!r.senior || !r.senior.endsWith('/simulador/?plan=vital')) mal(nombre + ': falta «Simulá Plan Vital» hacia el simulador con ?plan=vital' + (r.senior ? ' (va a ' + r.senior + ')' : ''));
  else bien(nombre + ': SP Senior en una frase, con «Simulá Plan Vital» (?plan=vital)');
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
    const fam = [...box.querySelector('.cmp2-plan').querySelectorAll('.cmp2-fam')].filter((e) => e.offsetParent).length;
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
  if (!base.fam) mal(nombre + ': «por familia» no está a la vista en Essential (cambia la comparación)');
  else bien(nombre + ': «por familia» a la vista en Essential');
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
  if (!movil) {
    await page.evaluate(() => { const e = document.querySelector('#cartilla'); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY + 300, behavior: 'instant' }); });
    await page.waitForTimeout(200);
    const arriba = await page.evaluate(() => [...document.querySelectorAll('.cmp2-plan .cmp2-h')].map((h) => Math.round(h.getBoundingClientRect().top)));
    if (!arriba.every((y) => Math.abs(y - 88) <= 14)) mal(nombre + ': al bajar, los nombres de los planes no quedan fijos debajo del menú (' + arriba.join(', ') + ')');
    else bien(nombre + ': al bajar, los nombres de los planes quedan fijos debajo del menú');
  }
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
