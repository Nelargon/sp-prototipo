// Las cinco categorías del blog — única fuente de verdad.
//
// Vive en su propio módulo, sin dependencias, a propósito: `lib/blog.js`
// importa `fs` y solo puede correr en el servidor, mientras que BlogList es
// un componente de cliente ('use client'). Si la lista viviera en blog.js,
// importarla desde el cliente arrastraría `fs` y el parser de markdown al
// bundle del navegador.
//
// Lista CERRADA. Cada categoría tiene su color-ancla de marca en
// app/blog/Cover.jsx, y la regla de `references/colors.md` del manual es que
// los colores narrativos (Sage, Lavender, Terracota) son territorios
// semánticos que no se mezclan. Agregar una categoría acá SIN sumar su tema
// en Cover.jsx la deja sin identidad visual, cayendo al tema por defecto.
//
// El orden es el de los filtros en el índice: deliberado, no alfabético.
export const CATEGORIAS = [
  'Entendé tu plan',
  'Salud en Paraguay',
  'Prevención',
  'Primeros años',
  'Vivir más años',
];

// Respaldo cuando el frontmatter viene vacío o con un valor inexistente.
// Antes el respaldo era 'General', que se colaba como un chip más en el
// índice: una nota mal tipeada creaba una categoría pública sin que nadie se
// enterara. Ahora cae en una categoría real y el build avisa.
export const CATEGORIA_FALLBACK = 'Entendé tu plan';

export function esCategoriaValida(valor) {
  return CATEGORIAS.includes(String(valor || '').trim());
}
