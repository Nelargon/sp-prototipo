// EDICIONES DEL SITIO (sep 2026) — un solo código, dos sitios publicados.
//
// El prototipo completo es el laboratorio: ahí vive TODO lo construido, y no
// se toca. La v1 que sale al público es la MISMA base con menos módulos: la
// Guía Médica, Mi SP y el blog no se lanzan todavía, pero se siguen
// construyendo en el prototipo. El día que uno de los tres esté listo, es un
// flag acá — no una migración entre repos.
//
//   NEXT_PUBLIC_EDICION=completa     (default)  → el prototipo entero
//   NEXT_PUBLIC_EDICION=lanzamiento             → la v1 pública
//
// ⚠ Por qué un flag y no una copia del repo: el motor de contenido publica las
// notas del blog DENTRO de este repositorio. Una copia en otro repo se queda
// sin ese flujo el día que el blog se lance, y obliga a arreglar cada bug dos
// veces. Ver BITACORA cap. 79.
//
// Regla al agregar un módulo nuevo: si el módulo no está listo para el
// público, se suma acá una constante `CON_…` y se apaga en lanzamiento. Los
// links se esconden con esa constante y la ruta se poda del export en
// `scripts/podar-edicion.mjs`. Las dos cosas, siempre: un link escondido con
// la página igual publicada es una página huérfana que Google puede encontrar.
export const EDICION = process.env.NEXT_PUBLIC_EDICION || 'completa';
export const ES_LANZAMIENTO = EDICION === 'lanzamiento';

// Módulos que la v1 todavía no lanza (decisión de Arturo, 15 sep 2026).
export const CON_GUIA = !ES_LANZAMIENTO;
export const CON_MI_SP = !ES_LANZAMIENTO;
export const CON_BLOG = !ES_LANZAMIENTO;
// /historia es el manifiesto en scrollytelling: 720vh = siete pantallas, con
// sticky y parallax. Fuera de la v1 por tres razones que apuntan al mismo lado
// (16 sep 2026, recomendación aceptada por Arturo): siete pantallas de marca
// contradicen una v1 que estamos acortando; no sirve a ninguna de las cuatro
// preguntas ni lleva al simulador (dec. 12e); y es lo más difícil de
// reimplementar de todo el sitio, justo cuando el entregable es una maqueta
// que Buenavista tiene que copiar. Arranca de su observación: "ver la historia
// completa lleva a un espacio que no se ve muy práctico".
export const CON_HISTORIA = !ES_LANZAMIENTO;
