/**
 * El buscador de /planes: "¿Y esto, me lo cubre?".
 *
 * Vive fuera del componente a propósito — es lógica pura, sin React, para poder
 * probarla contra los 983 ítems reales sin levantar un navegador
 * (`node scripts/test-buscador.mjs`). El componente solo la pinta.
 *
 * La regla que ordena todo: el primer resultado es el único que casi todos
 * leen. Si alguien escribe "tomografía" y arriba le sale ORTOPANTOMOGRAFIA
 * (que contiene la palabra, pero es una placa dental), la página perdió su
 * promesa en el primer intento.
 */

export const norm = (s) =>
  (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/* Palabras que la gente escribe y no aportan a la búsqueda: "placa de tórax",
   "operación de vesícula", "análisis para el colesterol". Si no se filtran, el
   "de" tiene que aparecer en el índice y la búsqueda devuelve cero. */
const VACIAS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'en', 'con', 'para', 'por', 'y', 'o', 'a', 'al', 'mi', 'me', 'se', 'que', 'es', 'lo']);

/* Contiene la palabra, no la sílaba. "tomografia" está dentro de
   "ortopantomografia" como subcadena pero no como palabra: sin el borde, esa
   placa dental se roba el primer puesto de todas las tomografías. */
const tieneLaPalabra = (texto, palabra) => {
  const i = texto.indexOf(palabra);
  if (i === -1) return false;
  for (let k = i; k !== -1; k = texto.indexOf(palabra, k + 1)) {
    const antes = k === 0 || !/[a-z0-9]/.test(texto[k - 1]);
    const j = k + palabra.length;
    const despues = j === texto.length || !/[a-z0-9]/.test(texto[j]);
    if (antes && despues) return true;
  }
  return false;
};

/** Prepara el índice una sola vez (useMemo en el componente). */
export function indexar(datos) {
  return datos.items.map((it) => ({
    n: norm(it.n),
    q: norm([it.n, it.g, it.a != null ? datos.alias[it.a] : ''].filter(Boolean).join(' ')),
  }));
}

/**
 * Devuelve los ítems que responden a `consulta`, del más al menos relevante.
 * `limite` corta la lista: 983 resultados en pantalla no ayudan a nadie, y el
 * componente avisa cuántos quedaron afuera.
 */
export function buscar(datos, idx, consulta, limite = 40) {
  const q = norm(consulta);
  if (q.length < 2) return { hits: [], total: 0 };

  const todas = q.split(' ').filter(Boolean);
  const utiles = todas.filter((w) => !VACIAS.has(w));
  // "de" sola, o "la": si no queda nada, se busca con lo que haya.
  const palabras = utiles.length ? utiles : todas;

  const marcados = [];
  for (let k = 0; k < datos.items.length; k++) {
    const { n, q: texto } = idx[k];
    let score;
    if (n === q) score = 0;
    else if (n.startsWith(q)) score = 1;
    else if (tieneLaPalabra(n, q)) score = 2;
    else if (palabras.every((w) => tieneLaPalabra(n, w))) score = 3;
    else if (palabras.every((w) => tieneLaPalabra(texto, w))) score = 4;
    else if (palabras.every((w) => texto.includes(w))) score = 5; // último recurso: subcadena
    else continue;

    /* Una consulta con especialista o una exclusión responden la pregunta de
       una: "psicología" es la sesión con el psicólogo, no un análisis que
       menciona la palabra. Empujan medio punto para arriba. */
    const it = datos.items[k];
    if (it.t !== 'e') score -= 0.5;

    marcados.push({ score, it });
  }

  marcados.sort((a, b) => a.score - b.score || a.it.n.length - b.it.n.length || a.it.n.localeCompare(b.it.n));
  return { hits: marcados.slice(0, limite).map((m) => m.it), total: marcados.length };
}

/* Sugerencias del estado inicial: no son decoración, son el manual de uso.
   El ORDEN importa. Los cuatro primeros son uno de cada tipo de respuesta, para
   que en cuatro toques se entienda todo lo que el buscador sabe hacer:
     Resonancia → los planes se separan (convenio en Bronze, cubierta en Silver)
     Hemograma  → cubierto en los tres, con su cantidad y su espera
     Psicología → una consulta con especialista, no un estudio
     Muela      → algo que NO cubre ningún plan, dicho de frente
   En móvil solo se muestran esos cuatro (ver .bus-chip en globals.css): con los
   ocho, los chips comían tres filas y empujaban los resultados fuera de la
   pantalla — y el 77% del tráfico entra por celular. */
export const EJEMPLOS = ['Resonancia', 'Hemograma', 'Psicología', 'Muela', 'Placa de tórax', 'Cesárea', 'Vesícula', 'Colesterol'];
