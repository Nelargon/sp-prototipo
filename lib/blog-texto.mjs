// Funciones puras de texto del blog: sin dependencias y con extensión .mjs a
// propósito, para que las pueda importar tanto Next (lib/blog.js) como Node
// suelto (scripts/correo-blog/armar.mjs). Se separaron de lib/blog.js el
// 24/09/2026 cuando nació el correo del blog: copiar esta lógica en otro lado
// era volver a abrir el bug del copete repetido (BITACORA cap. 65) en un
// segundo lugar.

// Tiempo de lectura REAL, calculado del cuerpo (6 ago 2026).
// Antes se leía `minutes` del frontmatter y 21 de las 22 notas declaraban "4":
// era un default, no una medición — el metadato ocupaba lugar en cada tarjeta
// sin informar nada. 200 palabras/minuto (lectura en español, conservador).
// El valor declarado queda solo como respaldo si la nota no tiene cuerpo.
export function readingMinutes(content, declared) {
  const plain = String(content)
    .replace(/```[\s\S]*?```/g, ' ')            // bloques de código
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')  // links e imágenes → su texto
    .replace(/[#>*_`|-]/g, ' ');                // marcas de markdown
  const words = plain.split(/\s+/).filter(Boolean).length;
  return words ? Math.max(1, Math.round(words / 200)) : (declared || 4);
}

// El copete se repetía como primer párrafo del cuerpo (6 ago 2026).
// El frontmatter trae `intro`, que se rinde como bajada, y el markdown del
// motor de contenido arranca con el mismo texto: el lector veía el mismo
// párrafo dos veces seguidas. Se recorta acá y no en el motor porque la
// duplicación es de PRESENTACIÓN: el markdown, leído solo, necesita su
// primer párrafo.
//
// ⚠ La primera versión comparaba por IGUALDAD EXACTA y agarraba 4 de las 7
// notas que duplican. Las otras 3 repiten el copete con un retoque mínimo —un
// punto donde había dos puntos, una cláusula de lugar agregada al final— y se
// escapaban. Peor: el chequeo que escribí para verificarlo aplicaba la MISMA
// igualdad que la función, así que daba 22/22 por construcción (BITACORA
// cap. 65). Lo detectó la revisión automática del PR #86.
//
// Ahora la comparación es por PREFIJO NORMALIZADO: se bajan acentos y
// puntuación y se comparan los primeros 60 caracteres. Dos párrafos escritos
// de forma independiente no comparten sus primeros 60 caracteres; si los
// comparten, uno es reescritura del otro. El umbral de 40 evita recortar por
// un copete de una línea.
export function stripDupIntro(content, intro) {
  if (!intro) return content;
  const norm = (s) => String(s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // acentos
    .toLowerCase()
    .replace(/[^a-z0-9ñ ]+/g, ' ')                     // puntuación
    .replace(/\s+/g, ' ').trim();

  const body = String(content).replace(/^\s+/, '');
  const partes = body.split(/\n\s*\n/);
  const objetivo = norm(intro);
  if (objetivo.length < 40) return content;

  // La intro puede estar repartida en VARIOS párrafos del cuerpo. Antes esto
  // miraba solo el primero, así que al partir una apertura en dos —lo que pide
  // la regla de párrafos cortos— se borraba la primera mitad y la segunda
  // quedaba duplicada en la página. Ahora se consumen los párrafos de arriba
  // mientras sigan construyendo la intro.
  let acc = '';
  let consumidos = 0;
  for (const p of partes) {
    const siguiente = (acc ? acc + ' ' : '') + norm(p);
    if (siguiente.length > objetivo.length || !objetivo.startsWith(siguiente)) break;
    acc = siguiente;
    consumidos++;
    if (acc.length === objetivo.length) break;
  }
  // Solo se borra si lo consumido cubre la intro casi entera: un párrafo que
  // apenas empieza parecido no es la intro repetida.
  if (consumidos > 0 && acc.length >= objetivo.length * 0.9) {
    return partes.slice(consumidos).join('\n\n').replace(/^\s+/, '');
  }

  // Respaldo, el comportamiento histórico: un único párrafo que ARRANCA igual
  // que la intro pero sigue más allá (la intro es un recorte de ese párrafo).
  const first = partes[0] || '';
  const a = norm(first);
  const n = Math.min(60, a.length, objetivo.length);
  if (n >= 40 && a.slice(0, n) === objetivo.slice(0, n)) {
    return partes.slice(1).join('\n\n').replace(/^\s+/, '');
  }
  return content;
}

// Fecha de publicación completa ("20 de julio de 2026") para byline y tarjetas.
export function formatFecha(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('es-PY', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// La frase en grande (26/09/2026, estándar del blog decidido por Arturo:
// «Que hayan expresiones claves en grande, para elementos que la persona pueda
// escanear en el blog sin necesidad de leerlo todo»). El motor la escribe así:
//
//   > [!clave]
//   > La presión alta trabaja en silencio: no duele mientras desgasta.
//
// Es la sintaxis de los avisos de GitHub: donde no se entiende, se ve como una
// cita común. Acá se convierte en un bloque HTML propio, ANTES de marked, para
// que la web y el correo la muestren igual y no se confunda con los
// «> **Dato:**» de las notas viejas, que siguen siendo citas. Una frase en
// grande es texto llano: si trae **negrita** o un link, se pinta sin el
// formato (la frase entera ya va destacada).
const RE_FRASE_CLAVE = /^>[ \t]*\[!clave\][ \t]*(.*)\n?((?:>.*\n?)*)/gim;
const escHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function textoFrasesClave(md) {
  const out = [];
  for (const m of String(md).matchAll(RE_FRASE_CLAVE)) out.push(unirFraseClave(m[1], m[2]));
  return out.filter(Boolean);
}

function unirFraseClave(a, b) {
  return [a, ...String(b).split('\n').map((l) => l.replace(/^>\s?/, ''))]
    .join(' ')
    .replace(/\*\*|__|`/g, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// render recibe el texto YA escapado (salvo escapar:false, para el texto
// plano del correo) y devuelve el bloque. La web usa la clase (con un <span>
// adentro, que es el que lleva el resaltador: la forma B que eligió Arturo el
// 26/09/2026, lámina 54); el correo pasa su propia versión con estilos en
// línea (Outlook).
export function frasesClave(md, render = (t) => `<p class="frase-clave"><span>${t}</span></p>`, { escapar = true } = {}) {
  return String(md).replace(RE_FRASE_CLAVE, (_, a, b) => {
    const t = unirFraseClave(a, b);
    return t ? `\n${render(escapar ? escHtml(t) : t)}\n\n` : '';
  });
}
