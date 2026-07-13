// Registro de eventos (inteligencia de negocio) — la misma espec ejecutable
// que usan las páginas de la guía (guia/*.html): cada interacción relevante
// emite un evento anónimo que en producción se envía al backend o a GA4.
// Detalle de campos, privacidad y panel de estadísticas:
// guia/ANEXO-requisitos-backend.md (§2 y §6).
export function track(evento, datos) {
  // TODO backend: fetch('/api/eventos', { method: 'POST', body: JSON.stringify({ evento, datos, ts: Date.now() }) })
  try { console.debug('[track]', evento, datos || {}); } catch (e) {}
}
