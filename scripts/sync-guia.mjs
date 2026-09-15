/* Sincroniza guia/ (la fuente) → public/guia/ (lo que publica GitHub Pages).
   Corre automáticamente antes de cada build (hook "prebuild" en package.json),
   así nunca más hay que acordarse de copiar a mano.

   En la edición de lanzamiento la Guía Médica NO se publica todavía (ver
   app/edicion.js): se borra la copia y no se sincroniza. Ojo con el orden —
   los dos builds del deploy comparten el mismo public/, así que esta línea
   tiene que borrar, no solo saltear: si el build completo corrió antes, la
   copia quedó ahí y se colaría en la v1. */
import { rmSync, cpSync } from 'node:fs';

const LANZAMIENTO = process.env.NEXT_PUBLIC_EDICION === 'lanzamiento';

rmSync('public/guia', { recursive: true, force: true });

if (LANZAMIENTO) {
  console.log('· edición de lanzamiento: la guía no se publica (public/guia/ vacío)');
} else {
  cpSync('guia', 'public/guia', { recursive: true });
  console.log('✓ guia/ sincronizada a public/guia/');
}
