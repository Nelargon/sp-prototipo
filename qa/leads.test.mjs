import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leadReady, contactError, leadPayload, submitLead, simulationDraft } from '../app/lead.js';
import { safeEvent, measurementUrl } from '../app/track.js';

const config = { portalId: '123456', formId: '11111111-2222-3333-4444-555555555555', approved: true, privacyUrl: 'https://example.com/privacy', consentText: 'Texto aprobado de prueba' };
const contact = { nombre: 'Persona QA', tel: '+595981000000', email: 'qa@example.invalid', consent: true };

test('sin configuración o aprobación no sale ninguna solicitud', async () => {
  for (const bad of [{ ...config, formId: '' }, { ...config, approved: false }, { ...config, privacyUrl: 'javascript:alert(1)' }, { ...config, consentText: '' }]) {
    assert.equal(leadReady(bad), false);
    assert.equal((await submitLead(contact, 'Cotización', { config: bad, fetchImpl: () => assert.fail('salió una solicitud') })).status, 'unavailable');
  }
});
test('sin consentimiento o con contacto inválido no sale ninguna solicitud', async () => {
  for (const bad of [{ ...contact, consent: false }, { ...contact, email: 'mal@' }, { ...contact, tel: 'abc12345678' }, { ...contact, nombre: '' }]) {
    assert.equal((await submitLead(bad, 'Cotización', { config, fetchImpl: () => assert.fail('salió una solicitud') })).status, 'invalid');
  }
  assert.equal(contactError({ ...contact, email: '' }), '');
});
test('payload sin URL, UTM, IP, cookies ni consentimiento de publicidad', () => {
  const payload = leadPayload({ ...contact, hutk: 'privado', ipAddress: '1.2.3.4', utm_campaign: 'privado' }, 'Cotización', config);
  assert.deepEqual(payload.context, { pageName: 'Simulador Salud Protegida' });
  assert.deepEqual(payload.legalConsentOptions.consent, { consentToProcess: true, text: config.consentText, communications: [] });
  assert.deepEqual(payload.fields.map(f => f.name), ['firstname', 'phone', 'email', 'message']);
  assert.equal(JSON.stringify(payload).includes('privado'), false);
  assert.equal(leadPayload({ ...contact, email: '' }, '', config).fields.some(f => f.name === 'email'), false);
});
test('una aceptación necesita respuesta 2xx; no reenvía ni interpreta HTML del proveedor', async () => {
  let calls = 0;
  const result = await submitLead(contact, 'Cotización', { config, fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url, 'https://api.hsforms.com/submissions/v3/integration/submit/123456/11111111-2222-3333-4444-555555555555');
    assert.equal(options.credentials, 'omit'); assert.equal(options.referrerPolicy, 'no-referrer');
    assert.equal(options.redirect, 'error'); assert.equal(options.method, 'POST');
    return { ok: true, status: 200, json: () => assert.fail('no debe insertar HTML remoto') };
  } });
  assert.deepEqual(result, { status: 'accepted' }); assert.equal(calls, 1);
});
for (const [status, reason] of [[400, 'rejected'], [429, 'rate_limit'], [500, 'server']]) {
  test(`HTTP ${status} conserva una falla, no una conversión`, async () => {
    assert.deepEqual(await submitLead(contact, '', { config, fetchImpl: async () => ({ ok: false, status }) }), { status: 'failed', reason });
  });
}
test('red caída y timeout terminan sin reintentar automáticamente', async () => {
  assert.equal((await submitLead(contact, '', { config, fetchImpl: async () => { throw Error('qa@example.invalid'); } })).reason, 'network');
  assert.deepEqual(await submitLead(contact, '', { config, timeoutMs: 5, fetchImpl: (_, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(Error('abort')))) }), { status: 'failed', reason: 'timeout' });
});
test('el borrador no conserva contacto ni consentimiento ni estado de envío', () => {
  const saved = simulationDraft({ ...contact, nombre: 'NO_GUARDAR', ubiQ: 'NO_GUARDAR', sending: true, sent: true, step: 4, people: [{ role: 'Titular', age: 30, kind: 'adult', nombre: 'NO_GUARDAR' }] });
  assert.equal(JSON.stringify(saved).includes('NO_GUARDAR'), false);
  for (const key of ['tel', 'email', 'consent', 'sending', 'sent']) assert.equal(key in saved, false);
  assert.equal(saved.people[0].kind, 'adult');
});
test('eventos desconocidos, búsqueda libre y antigua falsa conversión quedan fuera', () => {
  for (const event of ['sim_lead_submit', 'sim_zona_sin_lista', 'consulta_persona', 'qa@example.invalid']) assert.equal(safeEvent(event, contact), null);
});
test('incluso claves aparentemente válidas rechazan valores personales', () => {
  assert.deepEqual(safeEvent('click_whatsapp', { origen: 'qa@example.invalid', nombre: 'Persona QA', url: 'https://wa.me/?text=privado' }), { evento: 'click_whatsapp', props: {} });
  assert.deepEqual(safeEvent('sim_lead_failed', { motivo: 'qa@example.invalid' }).props, {});
  assert.deepEqual(safeEvent('sim_result_view', { plan: 'Vital', precio: 100, ...contact }).props, {});
  assert.deepEqual(safeEvent('sim_step', { paso: 3 }).props, { paso: 3 });
  assert.deepEqual(safeEvent('sim_step', { paso: 981000000 }).props, {});
});
test('URL de medición no conserva parámetros, fragmentos ni paths arbitrarios', () => {
  assert.equal(measurementUrl('https://example.com/sp-prototipo/simulador/?email=qa@example.invalid#privado'), 'https://example.com/simulador/');
  assert.equal(measurementUrl('https://example.com/qa@example.invalid'), 'https://example.com/');
  assert.equal(measurementUrl('https://example.com/guia-medica/P-1234/'), 'https://example.com/guia-medica/');
});

// Adapters reales con transporte falso: ninguna llamada sale a Internet.
test('Plausible: sin consentimiento no envía; luego solo payload permitido; revocar corta', async () => {
  process.env.NEXT_PUBLIC_ANALYTICS_APPROVED = 'true';
  process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = 'example.com';
  const mod = await import('../app/track.js?plausible-test');
  const sent = [];
  globalThis.window = { location: { href: 'https://example.com/simulador/?email=NO_ENVIAR' } };
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => { sent.push({ url, opts }); return { ok: true }; };
  try {
    assert.equal(mod.track('sim_lead_accepted', contact), false);
    mod.setAnalyticsConsent(true);
    mod.track('sim_lead_accepted', contact);
    assert.equal(sent.length, 2);
    assert.equal(JSON.stringify(sent).includes('NO_ENVIAR'), false);
    assert.equal(JSON.stringify(sent).includes('Persona QA'), false);
    assert.equal(JSON.parse(sent[1].opts.body).name, 'sim_lead_accepted');
    assert.equal(sent[1].opts.referrerPolicy, 'no-referrer');
    mod.setAnalyticsConsent(false);
    mod.track('sim_lead_accepted', {});
    assert.equal(sent.length, 2);
  } finally { globalThis.fetch = oldFetch; delete globalThis.window; }
});
test('GA4: carga solo con consentimiento, manual y sin publicidad; se deshabilita al revocar', async () => {
  process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = '';
  process.env.NEXT_PUBLIC_GA_ID = 'G-QATEST';
  const mod = await import('../app/track.js?ga-test');
  const scripts = [];
  globalThis.window = { location: { href: 'https://example.com/simulador/?q=NO_ENVIAR' } };
  globalThis.document = { createElement: () => ({}), head: { appendChild: s => scripts.push(s) } };
  try {
    mod.startAnalytics(); assert.equal(scripts.length, 0);
    mod.setAnalyticsConsent(true); assert.equal(scripts.length, 1);
    mod.track('sim_lead_accepted', contact);
    const events = window.dataLayer.map(a => [...a]);
    const cfg = events.find(a => a[0] === 'config')[2];
    assert.equal(cfg.send_page_view, false); assert.equal(cfg.allow_google_signals, false);
    assert.equal(JSON.stringify(events).includes('NO_ENVIAR'), false);
    assert.equal(JSON.stringify(events).includes('Persona QA'), false);
    mod.setAnalyticsConsent(false); assert.equal(window['ga-disable-G-QATEST'], true);
    const count = window.dataLayer.length;
    mod.track('sim_lead_accepted', contact); assert.equal(window.dataLayer.length, count);
  } finally { delete globalThis.window; delete globalThis.document; }
});
