/* La lista de redirecciones de la v1. La usan scripts/redirecciones.mjs, que
   escribe out/_redirects, y qa/produccion.mjs, que lo controla. Es un módulo
   aparte para que el control la lea sin correr el script. Ver el porqué de
   cada familia (301, 302 y las que no se redirigen) en scripts/redirecciones.mjs. */

// La reserva de turnos de la web actual («Agendamiento») se muda a su propio
// subdominio, en el servidor de hoy (sp-interno#209, 1A, Arturo, 23/10/2026).
// Es un complemento del WordPress (appointment-scheduling) que llama al
// dominio por su nombre (admin-ajax.php), así que el subdominio solo funciona
// si el WordPress pasa a llamarse así: ver docs/IMPLEMENTAR-v1.md, §0.
export const TURNOS = 'https://turnos.saludprotegida.com.py';
// Lo único de afuera que puede ser destino: un subdominio de SP, por https.
export const SUBDOMINIO_SP = /^https:\/\/[a-z0-9-]+\.saludprotegida\.com\.py\//;

// [origen, destino, código, por qué]. Cloudflare Pages toma la primera regla
// que coincide; las de comodín (*) van al final. Un destino es una página de la
// v1 («/planes/») o, solo para lo que se muda a un subdominio de SP, una
// dirección completa (TURNOS).
export const REDIRECCIONES = [
  // Lo que el sitio nuevo reemplazó.
  ['/que-cubre/', '/planes/', 301, '«qué cubre» es /planes/ desde el 05/10/2026 (HANDOFF, «UNA SOLA PÁGINA DE DETALLE»)'],
  ['/octubre_rosa/', '/bases/octubre-rosa-2026/', 301, 'web actual: las bases de Octubre Rosa 2026. Su casa en la v1 es /bases/, con el texto literal (sp-interno#209, 2A)'],
  // La reserva de turnos, en su subdominio. 302: si algún día la reemplaza una
  // reserva nueva, la dirección vieja tiene que poder ir ahí sin que cada
  // navegador recuerde esta.
  ['/login/', TURNOS + '/login/', 302, 'web actual: «Agendamiento», la reserva de turnos de los clientes. Se muda a su subdominio (sp-interno#209, 1A)'],
  ['/dashboard/', TURNOS + '/dashboard/', 302, 'web actual: la misma reserva de turnos, ya con la sesión iniciada'],
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
// Vacía desde el 23/10/2026: Arturo decidió /login/ y /dashboard/ (1A) y
// /octubre_rosa/ (2A) en Nelargon/sp-interno#209. Queda el QR del carnet (3A):
// Arturo escanea uno y, si la dirección es de este dominio, se suma acá o arriba.
export const NO_SE_REDIRIGEN = [];

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
