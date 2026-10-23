// «Datos al» (sp-interno#61): la fecha ISO (aaaa-mm-dd) que escribe el script
// que genera un JSON de datos (meta.datos_al de lib/guia-medica.json, datos_al
// de lib/red-home.json), dicha como la lee una persona, dd/mm/aaaa. Una sola
// forma: estaba copiada en la Guía Médica, en su ficha y en el home.
export const fechaDatosAl = (iso) => (iso || '').split('-').reverse().join('/');
