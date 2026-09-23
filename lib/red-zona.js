/* La red real en la zona que eligió la persona en el simulador (23/09/2026).
   ----------------------------------------------------------------------------
   Une el simulador con la Guía Médica: al ver su precio, la persona ve cuántos
   médicos, sanatorios y laboratorios tiene ese plan en su ciudad, y abre la
   guía ya filtrada. Sale de lib/red-resumen.json (conteos por red, depto y
   ciudad, generado junto con la guía por scripts/build-guia-medica.py), no de
   la red entera: el simulador no carga 250 KB para mostrar dos números.

   Reemplaza a la nota de red de app/geo.js, que decía "la red está creciendo"
   en todo lo que no fuera Asunción/Central. Con la planilla real eso quedó
   desmentido: hay red en 17 departamentos. */
import resumen from './red-resumen.json';

// Nombres del simulador (app/geo.js) → nombres de la planilla.
const DEPTO = { 'Asunción': 'Capital' };
const CIUDAD = { 'bella vista sur': 'bella vista', 'san pedro de ycuamandyyu': 'san pedro del ycuamandiyu' };
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

export function redEnZona(red, ubi) {
  if (!ubi) return null;
  const dp = DEPTO[ubi.deptNombre] || ubi.deptNombre;
  const depto = (resumen[red] || {})[dp];
  const nDepto = depto ? depto.n : 0;
  let c = null, nCiudad = 0;
  if (depto && ubi.ciudad) {
    const buscada = CIUDAD[norm(ubi.ciudad)] || norm(ubi.ciudad);
    c = Object.keys(depto.c).find((x) => norm(x) === buscada) || null;
    nCiudad = c ? depto.c[c] : 0;
  }
  return { dp, c, nCiudad, nDepto, ciudadPedida: ubi.ciudad || null };
}

// El link a la guía con el plan, el departamento y (si tiene red) la ciudad.
export function guiaHref(base, planGuia, z) {
  const u = new URLSearchParams();
  if (planGuia) u.set('plan', planGuia);
  if (z && z.nDepto) {
    u.set('dp', z.dp);
    if (z.nCiudad) u.set('c', z.c);
  }
  return base + '/guia-medica/?' + u.toString();
}
