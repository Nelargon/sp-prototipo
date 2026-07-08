// When the site is served from a subpath (GitHub Pages project site at
// /sp-prototipo), assets in public/ must be referenced with that prefix.
// Set via NEXT_PUBLIC_BASE_PATH at build time; empty locally / at a root domain.
export const BP = process.env.NEXT_PUBLIC_BASE_PATH || '';
