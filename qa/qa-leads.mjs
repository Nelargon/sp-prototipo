// Build local + HubSpot/Plausible interceptados: jamás crea contactos reales.
// MODE=fallback (build sin variables) o MODE=crm (configuración ficticia, ver doc).
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const { chromium } = await import(process.env.PW_PATH || 'playwright-core');
const root = resolve(process.env.QA_OUT || 'out');
const prefix = process.env.QA_PREFIX || '/sp-prototipo';
const server = createServer(async (req, res) => {
  try {
    let path = new URL(req.url, 'http://local').pathname;
    if (prefix && !path.startsWith(prefix + '/')) throw Error('prefix');
    path = path.slice(prefix.length) || '/';
    const file = resolve(root, '.' + decodeURIComponent(path) + (path.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(root + '/')) throw Error('path');
    const body = await readFile(file);
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' })[extname(file)] || 'application/octet-stream');
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}${prefix}`;
const browser = await chromium.launch({ executablePath: process.env.PW_CHROME, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
const mode = process.env.MODE || 'fallback';
let checks = 0;
async function resultPage(width = 390) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
  const requests = [];
  await context.route('**/*', async route => {
    if (route.request().url().startsWith(BASE.split(prefix)[0])) return route.continue();
    requests.push(route.request().url());
    return route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.addInitScript(() => { window.__events = []; window.addEventListener('sp:measurement', e => window.__events.push(e.detail)); });
  await page.goto(BASE + '/simulador/?email=NO_ENVIAR#NO_ENVIAR');
  await page.getByRole('button', { name: /Empecemos/ }).click();
  const card = page.locator('.sim-card');
  for (let i = 0; i < 12 && !await page.getByLabel('Nombre y apellido', { exact: true }).isVisible(); i++) {
    const next = card.locator('button:visible').filter({ hasText: /Continuar|Ver mi precio|Siguiente/ }).first();
    if (await next.count()) await next.click();
    else {
      const option = card.locator('button:visible').filter({ hasNotText: /Volver|Reiniciar|Retomar/ }).first();
      assert.ok(await option.count(), 'debe haber una opción para avanzar');
      await option.click();
    }
    await page.waitForTimeout(200);
  }
  await page.getByLabel('Nombre y apellido', { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
  assert.ok(await page.locator('[data-sp-price]').isVisible());
  await page.getByLabel('Nombre y apellido', { exact: true }).fill('Persona QA');
  await page.getByLabel('WhatsApp', { exact: true }).fill('+595981000000');
  await page.getByLabel('Email (opcional)', { exact: true }).fill('qa@example.invalid');
  assert.equal(await page.evaluate(() => JSON.stringify(localStorage).includes('qa@example.invalid')), false);
  return { page, context, requests, errors };
}
try {
  for (const width of [360, 390, 430, 1280]) {
    const { page, context, requests, errors } = await resultPage(width);
    const sent = [];
    const analytics = [];
    if (mode === 'crm' && width === 1280) {
      await context.route('https://plausible.io/api/event', async route => { analytics.push(route.request().postDataJSON()); await route.fulfill({ status: 202, body: '{}' }); });
      await page.evaluate(() => window.dispatchEvent(new CustomEvent('sp:analytics-consent', { detail: { granted: true } })));
    }
    await context.route('https://api.hsforms.com/**', async route => {
      sent.push(route.request().postDataJSON());
      await new Promise(r => setTimeout(r, 120));
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"inlineMessage":"<script>throw Error()</script>"}' });
    });
    if (mode === 'fallback') {
      await page.getByRole('button', { name: 'Preparar mensaje de WhatsApp' }).click();
      assert.ok(await page.getByText('Abrí WhatsApp, revisá el mensaje', { exact: false }).isVisible());
      assert.equal(sent.length, 0);
    } else {
      const button = page.getByRole('button', { name: 'Enviar mi consulta' });
      await button.click();
      assert.ok(await page.locator('.sim-card [role=alert]').isVisible());
      assert.equal(sent.length, 0);
      await page.getByRole('checkbox').check();
      // Dos clics en la misma tarea del navegador prueban la exclusión síncrona.
      await button.evaluate(b => { b.click(); b.click(); });
      await page.getByText('Recibimos tu solicitud de cotización.', { exact: false }).waitFor();
      assert.equal(sent.length, 1);
      assert.deepEqual(sent[0].fields.map(f => f.name), ['firstname', 'phone', 'email', 'message']);
      assert.ok(!JSON.stringify(sent).includes('NO_ENVIAR'));
      assert.ok(await page.locator('.sim-card').getByRole('link', { name: 'Prefiero escribir por WhatsApp' }).isVisible());
      assert.equal((await page.evaluate(() => window.__events)).filter(e => e.evento === 'sim_lead_accepted').length, 1);
      if (width === 1280) {
        await page.waitForTimeout(100);
        assert.equal(analytics.filter(e => e.name === 'sim_lead_accepted').length, 1);
        assert.ok(!/Persona QA|qa@example.invalid|NO_ENVIAR|981000000/.test(JSON.stringify(analytics)));
      }
    }
    const events = await page.evaluate(() => window.__events);
    assert.ok(!JSON.stringify(events).includes('Persona QA'));
    assert.ok(!JSON.stringify(events).includes('qa@example.invalid'));
    assert.ok(!events.some(e => e.evento === 'sim_lead_submit'));
    if (mode === 'fallback') {
      assert.ok(!events.some(e => e.evento === 'sim_lead_accepted'));
      const wa = page.getByRole('link', { name: 'Abrir WhatsApp con mi cotización' });
      const link = new URL(await wa.getAttribute('href'));
      assert.equal(link.hostname, 'wa.me');
      assert.ok(link.searchParams.get('text').includes('Persona QA'));
      // Cancela navegación para no abrir el servicio real; dispara el clic de React.
      await wa.evaluate(a => { a.addEventListener('click', e => e.preventDefault(), { once: true }); a.click(); });
      const after = await page.evaluate(() => window.__events);
      assert.ok(after.some(e => e.evento === 'click_whatsapp'));
      assert.ok(!after.some(e => e.evento === 'sim_lead_accepted'));
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    assert.deepEqual(errors, []);
    // Sin consentimiento analítico, ninguna carga a Google/Plausible.
    assert.ok(!requests.some(url => /google-analytics|googletagmanager|plausible/.test(url)));
    if (process.env.QA_SCREENSHOT && width === 390) await page.locator('.sim-card').screenshot({ path: process.env.QA_SCREENSHOT });
    checks++;
    console.log(`✓ ${mode} ${width}px: recorrido, estado, privacidad y ancho`);
    await context.close();
  }
  if (mode === 'crm') {
    for (const status of [400, 429, 500, 'network', 'timeout']) {
      const { page, context } = await resultPage();
      await context.route('https://api.hsforms.com/**', async route => {
        if (status === 'network') return route.abort();
        if (status === 'timeout') return; // el AbortController del sitio corta a los 12 s
        return route.fulfill({ status, contentType: 'application/json', body: '{"message":"qa@example.invalid"}' });
      });
      await page.getByRole('checkbox').check();
      await page.getByRole('button', { name: 'Enviar mi consulta' }).click();
      await page.getByRole('button', { name: 'Reintentar envío' }).waitFor({ timeout: 15000 });
      assert.ok(await page.getByRole('link', { name: 'Abrir WhatsApp con mi cotización' }).isVisible());
      assert.equal(await page.getByLabel('Nombre y apellido', { exact: true }).inputValue(), 'Persona QA');
      assert.ok(!(await page.evaluate(() => window.__events)).some(e => e.evento === 'sim_lead_accepted'));
      if (status !== 'timeout') {
        await context.route('https://api.hsforms.com/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
        await page.getByRole('button', { name: 'Reintentar envío' }).click();
        await page.getByText('Recibimos tu solicitud de cotización.', { exact: false }).waitFor();
      }
      checks++;
      console.log(`✓ ${status}: conserva datos, salida WhatsApp y sin conversión falsa`);
      await context.close();
    }
  }
} finally { await browser.close(); await new Promise(r => server.close(r)); }
console.log(`${checks} escenarios de navegador OK; 0 envíos reales`);
