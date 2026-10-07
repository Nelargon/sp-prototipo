// Registro de eventos (inteligencia de negocio) — la misma espec ejecutable
// que usan las páginas de la guía (guia/*.html): cada interacción relevante
// emite un evento anónimo que en producción se envía al backend o a GA4.
// Detalle de campos, privacidad y panel de estadísticas:
// guia/ANEXO-requisitos-backend.md (§2 y §6).
export function track(evento, datos) {
  // TODO backend: fetch('/api/eventos', { method: 'POST', body: JSON.stringify({ evento, datos, ts: Date.now() }) })
  try { console.debug('[track]', evento, datos || {}); } catch (e) {}
}

// Las explicaciones que se abren al tocar se miden (regla de claridad de
// CLAUDE.md, sp-interno#98): si algo que importa casi nadie lo abre, sube a la
// vista. Con mouse se abren al pasar, y contar cada pasada inflaría el número:
// cada explicación cuenta una sola vez por página vista (el sitio navega
// recargando la página, así que el Set arranca vacío en cada una). Lleva qué se
// abrió (la palabra, el servicio o el cálculo), nunca nada de la persona. El
// evento está en el contrato: guia/ANEXO-requisitos-backend.md §2.
const abiertas = new Set();
export function trackExplicacion(tipo, clave) {
  const id = tipo + '|' + clave;
  if (abiertas.has(id)) return;
  abiertas.add(id);
  track('abre_explicacion', { tipo, clave });
}
