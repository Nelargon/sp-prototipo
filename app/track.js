// Contrato cerrado: agregar un evento exige revisar qué sale del navegador.
// No se transmiten contactos, precios, edades, grupo, ciudad, búsquedas, plan,
// URLs de WhatsApp, UTM libres, identificadores del CRM ni errores del proveedor.
const EVENTS = new Set(['pageview', 'cta_simulador', 'sim_step', 'sim_result_view',
  'sim_quote_download', 'sim_quote_share', 'sim_lead_attempt', 'sim_lead_accepted',
  'sim_lead_failed', 'sim_lead_fallback', 'click_whatsapp', 'abre_explicacion']);
const REASONS = new Set(['unavailable', 'rejected', 'rate_limit', 'server', 'network', 'timeout']);
const ORIGINS = new Set(['simulador_lead', 'simulador_resultado', 'barra_movil',
  'planes_tabla', 'planes_tarjeta_celular', 'planes_senior', 'planes_cierre']);
export function safeEvent(evento, datos = {}) {
  if (!EVENTS.has(evento)) return null;
  datos = datos || {};
  const props = {};
  if (evento === 'abre_explicacion' && ['por_que', 'calculo', 'glosario', 'servicio'].includes(datos.tipo)) props.tipo = datos.tipo;
  if (evento === 'sim_step' && Number.isInteger(datos.paso) && datos.paso >= 1 && datos.paso <= 6) props.paso = datos.paso;
  if (['sim_lead_failed', 'sim_lead_fallback'].includes(evento) && REASONS.has(datos.motivo)) props.motivo = datos.motivo;
  if (['click_whatsapp', 'cta_simulador'].includes(evento) && ORIGINS.has(datos.origen)) props.origen = datos.origen;
  return { evento, props };
}

// También limita el path: una URL puede contener datos personales sin query.
export function measurementUrl(href) {
  try {
    const url = new URL(href);
    const section = url.pathname.split('/').find((p) => ['simulador', 'planes', 'guia-medica', 'que-cubre', 'blog', 'historia', 'agendar', 'mi-sp'].includes(p));
    return url.origin + '/' + (section ? section + '/' : '');
  } catch { return ''; }
}

export const ANALYTICS_CONFIG = {
  approved: process.env.NEXT_PUBLIC_ANALYTICS_APPROVED === 'true',
  plausible: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || '',
  ga: process.env.NEXT_PUBLIC_GA_ID || '',
  // Solo Plausible admite esta excepción, tras validación de SP.
  noConsentRequired: process.env.NEXT_PUBLIC_ANALYTICS_CONSENT_MODE === 'not_required',
};
let consent = null;
let gaInitialized = false;
let pageViewed = false;
function enabled() {
  return typeof window !== 'undefined' && ANALYTICS_CONFIG.approved &&
    (consent === true || (consent === null && ANALYTICS_CONFIG.plausible && ANALYTICS_CONFIG.noConsentRequired));
}

function initializeGA() {
  const id = ANALYTICS_CONFIG.ga;
  if (!/^G-[A-Z0-9]+$/.test(id) || !consent || gaInitialized) return;
  gaInitialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('js', new Date());
  window.gtag('config', id, {
    send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
    page_location: measurementUrl(window.location.href), page_referrer: '', page_title: 'Salud Protegida',
  });
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  script.async = true;
  script.referrerPolicy = 'no-referrer';
  document.head.appendChild(script);
}

// La CMP llama con true solo tras consentimiento; false lo revoca.
// No conservamos ni reenviamos eventos ocurridos antes del consentimiento.
export function setAnalyticsConsent(granted) {
  consent = granted === true;
  if (typeof window === 'undefined') return;
  if (ANALYTICS_CONFIG.ga) window['ga-disable-' + ANALYTICS_CONFIG.ga] = !consent;
  if (gaInitialized) window.gtag('consent', 'update', { analytics_storage: consent ? 'granted' : 'denied' });
  startAnalytics();
}

export function startAnalytics() {
  if (!enabled()) return;
  if (!ANALYTICS_CONFIG.plausible) initializeGA();
  if (!pageViewed) { pageViewed = track('pageview', {}); }
}

export function track(evento, datos) {
  const safe = safeEvent(evento, datos);
  if (!safe) return false;
  // Observación local para QA, con el MISMO contrato sin datos personales.
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('sp:measurement', { detail: { evento: safe.evento, datos: safe.props } }));
  }
  if (!enabled()) return false;
  try {
    const url = measurementUrl(window.location.href);
    if (ANALYTICS_CONFIG.plausible) {
      // API oficial; no script que capture URLs, links o campos automáticamente.
      void fetch('https://plausible.io/api/event', {
        method: 'POST', headers: { 'Content-Type': 'text/plain' },
        credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true,
        body: JSON.stringify({ name: safe.evento, domain: ANALYTICS_CONFIG.plausible, url, props: safe.props }),
      }).catch(() => {});
      return true; // Se intentó enviar, no afirma recepción en el panel.
    }
    if (/^G-[A-Z0-9]+$/.test(ANALYTICS_CONFIG.ga) && consent) {
      initializeGA();
      window.gtag('event', evento === 'pageview' ? 'page_view' : safe.evento, {
        ...safe.props, send_to: ANALYTICS_CONFIG.ga, page_location: url,
        page_referrer: '', page_title: 'Salud Protegida',
      });
      return true;
    }
  } catch { /* La medición nunca bloquea la consulta. */ }
  return false;
}

// Se mide la apertura y su tipo, sin la clave del servicio de salud.
// La clave se usa solo en memoria para no contar dos veces la misma apertura.
const abiertas = new Set();
export function trackExplicacion(tipo, clave) {
  const id = tipo + '|' + clave;
  if (abiertas.has(id)) return;
  abiertas.add(id);
  track('abre_explicacion', { tipo, clave });
}
