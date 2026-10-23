/* La lista de redirecciones de la v1. La usan scripts/redirecciones.mjs, que
   escribe out/_redirects, y qa/produccion.mjs, que lo controla. Es un módulo
   aparte para que el control la lea sin correr el script. Ver el porqué de
   cada familia (301, 302 y las que no se redirigen) en scripts/redirecciones.mjs. */

// [origen, destino, código, por qué]. Cloudflare Pages toma la primera regla
// que coincide; las de comodín (*) van al final.
export const REDIRECCIONES = [
  // Lo que el sitio nuevo reemplazó.
  ['/que-cubre/', '/planes/', 301, '«qué cubre» es /planes/ desde el 05/10/2026 (HANDOFF, «UNA SOLA PÁGINA DE DETALLE»)'],
  // La web actual.
  ['/guia-para-el-asegurado/', '/guia-medica/', 302, 'web actual: dudas del asegurado (urgencias, documentos); su casa en la v1 es la Guía Médica, con la línea de emergencias. Temporal hasta que Arturo confirme'],
  ['/contacto/', '/', 302, 'web actual: formulario de contacto. La v1 contacta por WhatsApp y teléfono desde cada página'],
  ['/blog/', '/', 302, 'web actual: el blog. El de la v1 sale después (HANDOFF, «🧩 23/10/2026»)'],
  ['/blog-caminata/', '/', 302, 'web actual: nota del blog'],
  ['/disfrutar-del-sol-y-aprovechar-la-vitamina-d/', '/', 302, 'web actual: nota del blog'],
  ['/consejos-para-proteger-promover-y-apoyar-la-lactancia-materna/', '/', 302, 'web actual: nota del blog'],
  ['/no-todo-cansancio-es-rutina-puede-ser-tu-tiroides/', '/', 302, 'web actual: nota del blog'],
  ['/tag/*', '/', 302, 'web actual: 23 etiquetas del blog'],
  ['/category/*', '/', 302, 'web actual: categoría del blog'],
  ['/author/*', '/', 302, 'web actual: página de autor de WordPress'],
];

// Direcciones de la web actual que NO se redirigen hasta que Arturo decida.
// No es un olvido: qa/produccion.mjs falla si alguna aparece como origen.
// La decisión está en Nelargon/sp-interno#209.
export const NO_SE_REDIRIGEN = [
  ['/login/', 'es «Agendamiento»: la reserva de turnos de los clientes, atada al sistema de SP. No se toca desde acá (HANDOFF, guarda de la Guía Médica)'],
  ['/dashboard/', 'la misma reserva de turnos (redirige a /login/)'],
  ['/octubre_rosa/', 'son las bases y condiciones de la promoción Octubre Rosa 2026: un texto legal que tiene que seguir en línea mientras la promoción corra'],
];

// Cada regla exacta sale con y sin la barra final: no está verificado que
// Cloudflare Pages trate «/blog» y «/blog/» como la misma dirección, y una
// regla de más no cuesta nada. Los comodines (/tag/*) van una sola vez.
export function reglas() {
  const out = [];
  for (const [o, d, c] of REDIRECCIONES) {
    out.push([o, d, c]);
    if (!o.endsWith('*') && o.endsWith('/')) out.push([o.slice(0, -1), d, c]);
  }
  return out;
}
