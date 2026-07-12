/* Sincroniza guia/ (la fuente) → public/guia/ (lo que publica GitHub Pages).
   Corre automáticamente antes de cada build (hook "prebuild" en package.json),
   así nunca más hay que acordarse de copiar a mano. */
import { rmSync, cpSync } from 'node:fs';

rmSync('public/guia', { recursive: true, force: true });
cpSync('guia', 'public/guia', { recursive: true });
console.log('✓ guia/ sincronizada a public/guia/');
