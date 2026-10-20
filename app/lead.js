// La configuración pública NO contiene tokens. Activar solo tras validar el
// formulario y su tratamiento de datos (docs/VALIDAR-LEADS.md).
export const LEAD_CONFIG = {
  portalId: process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || '48242096',
  formId: process.env.NEXT_PUBLIC_HUBSPOT_FORM_ID || '',
  approved: process.env.NEXT_PUBLIC_LEAD_FORM_APPROVED === 'true',
  privacyUrl: process.env.NEXT_PUBLIC_PRIVACY_URL || '',
  consentText: process.env.NEXT_PUBLIC_LEAD_CONSENT_TEXT || '',
};

export function leadReady(config = LEAD_CONFIG) {
  let policy;
  try { policy = new URL(config.privacyUrl); } catch { return false; }
  return config.approved === true && /^\d+$/.test(config.portalId) &&
    /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(config.formId) &&
    policy.protocol === 'https:' && !policy.username && !policy.password &&
    Boolean(config.consentText.trim());
}

export function contactError({ nombre, tel, email }) {
  if (!nombre.trim() || nombre.trim().length > 150) return 'Escribí tu nombre (hasta 150 caracteres).';
  if (!/^[+\d\s().-]+$/.test(tel) || !/^\d{8,15}$/.test(tel.replace(/\D/g, ''))) return 'Revisá tu WhatsApp: necesitamos entre 8 y 15 dígitos.';
  if (email.trim() && (email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) return 'Revisá tu email o dejá ese campo vacío.';
  return '';
}

export function leadPayload(contact, quote, config = LEAD_CONFIG) {
  const field = (name, value) => ({ objectTypeId: '0-1', name, value });
  return {
    fields: [field('firstname', contact.nombre.trim()), field('phone', contact.tel.trim()),
      ...(contact.email.trim() ? [field('email', contact.email.trim())] : []),
      field('message', quote)],
    // Sin URL de llegada, búsquedas, UTM libres, cookies, IP ni datos del grupo.
    context: { pageName: 'Simulador Salud Protegida' },
    legalConsentOptions: { consent: {
      consentToProcess: true, text: config.consentText, communications: [],
    } },
  };
}

// Una respuesta 2xx acredita aceptación del formulario, no asignación ni venta.
// No hay reintento automático: con un timeout, HubSpot pudo haberlo recibido.
export async function submitLead(contact, quote, { config = LEAD_CONFIG, fetchImpl = fetch, timeoutMs = 12000 } = {}) {
  if (!leadReady(config)) return { status: 'unavailable' };
  if (contactError(contact) || contact.consent !== true) return { status: 'invalid' };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`https://api.hsforms.com/submissions/v3/integration/submit/${config.portalId}/${config.formId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'error',
      signal: controller.signal, body: JSON.stringify(leadPayload(contact, quote, config)),
    });
    if (response.ok) return { status: 'accepted' };
    return { status: 'failed', reason: response.status === 429 ? 'rate_limit' : response.status >= 500 ? 'server' : 'rejected' };
  } catch {
    return { status: 'failed', reason: controller.signal.aborted ? 'timeout' : 'network' };
  } finally { clearTimeout(timeout); }
}

// Solo lo necesario para retomar una simulación. Nunca contactos, búsquedas
// libres, consentimientos o estados de envío, incluidos los guardados antiguos.
export function simulationDraft(d) {
  return { step: d.step, who: d.who, nivel: d.nivel, essNacional: d.essNacional,
    geo: d.geo, ubi: d.ubi ? { ciudad: d.ubi.ciudad, deptId: d.ubi.deptId, deptNombre: d.ubi.deptNombre } : null,
    addons: [], people: Array.isArray(d.people) ? d.people.map(({ role, age, kind }) => ({ role, age, kind })) : [] };
}
