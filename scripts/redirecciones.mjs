/* Redirecciones de la v1 para Cloudflare Pages (hook "postbuild", después de
   podar-edicion.mjs). Ver docs/IMPLEMENTAR-v1.md, «Redirecciones».

   Escribe out/_redirects SOLO en la edición de lanzamiento: es la que va al
   dominio de SP. En el prototipo no se escribe a propósito: las previews de
   Cloudflare (docs/PREVIEW.md) sirven el prototipo desde la raíz, y una regla
   como «/blog/ → /» le taparía el blog, que en el prototipo sí existe.
   GitHub Pages no lee este archivo: ahí queda como un archivo suelto.

   Tres familias, con el código elegido por lo que va a pasar después:
   - 301 (permanente) para lo que el sitio nuevo ya reemplazó y no vuelve:
     el navegador lo recuerda y los buscadores pasan la autoridad.
   - 302 (temporal) para lo que hoy no tiene casa en la v1 pero la va a tener
     (el blog sale después): un 301 quedaría guardado en cada navegador y el
     día que el blog salga seguiría mandando al inicio.
   - Fuera de la lista, a propósito: lo que no se redirige sin una decisión de
     Arturo (NO_SE_REDIRIGEN, abajo). Sin regla, esas direcciones dan el 404
     del sitio, que ofrece volver al inicio, en vez de llevar a un lugar que
     alguien eligió sin saber.

   Las direcciones viejas salen del sitemap público de la web actual
   (WordPress, leído el 23/10/2026: 37 direcciones). Cada destino tiene que
   existir en el export, o el build corta: una redirección a una página que no
   está es un 404 con un paso de más. */
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REDIRECCIONES, NO_SE_REDIRIGEN, reglas } from './redirecciones-lista.mjs';

const LANZAMIENTO = process.env.NEXT_PUBLIC_EDICION === 'lanzamiento';
if (!LANZAMIENTO) process.exit(0);

const OUT = 'out';

// Un destino de la v1 es siempre una carpeta con su index.html («/» es la raíz).
const resuelve = (ruta) => existsSync(join(OUT, ruta.replace(/^\/+|\/$/g, ''), 'index.html'));

const rotas = REDIRECCIONES.filter(([, destino]) => !resuelve(destino));
if (rotas.length) {
  console.error('\n✗ Redirecciones a páginas que la v1 no publica:\n');
  for (const [o, d] of rotas) console.error(`   ${o} → ${d}`);
  process.exit(1);
}

const lineas = [
  '# Redirecciones de la v1 (Cloudflare Pages). GENERADO por scripts/redirecciones.mjs: no editar acá.',
  ...reglas().map(([o, d, c]) => `${o} ${d} ${c}`),
  '',
];
writeFileSync(join(OUT, '_redirects'), lineas.join('\n'));
console.log(`✓ redirecciones: ${reglas().length} reglas en out/_redirects (${REDIRECCIONES.length} direcciones) · ${NO_SE_REDIRIGEN.length} direcciones esperan una decisión (${NO_SE_REDIRIGEN.map(([o]) => o).join(', ')})`);
