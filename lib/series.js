// Las guías del blog: caminos ordenados de lectura.
//
// POR QUÉ EXISTEN
// Una categoría es un BALDE ("esto habla de prevención"). Una guía es un
// CAMINO ("leé estas cuatro, en este orden, y entendés el tema"). La
// diferencia importa para ser referente: 22 notas sueltas se leen de a una y
// se olvidan; cuatro recorridos con una promesa clara se comparten y se
// vuelven a visitar.
//
// Las guías CRUZAN categorías a propósito — ahí está su valor agregado.
// "Chequeos a cada edad" toca Prevención, Primeros años y Vivir más años,
// porque el lector no piensa en categorías, piensa en su etapa de la vida.
//
// EL ORDEN ES EDITORIAL, no cronológico: va de lo general a lo específico, o
// del problema a la decisión. Reordenar una guía es editar este archivo y
// nada más — por eso vive acá y no repartido en el frontmatter de cada nota.
//
// Los slugs se validan contra las notas publicadas en build time
// (lib/blog.js → getGuia): un slug mal escrito rompe el build en vez de
// dejar un hueco silencioso en la guía.
export const SERIES = [
  {
    slug: 'elegir-tu-plan',
    titulo: 'Elegir tu plan',
    promesa:
      'De por qué conviene tener uno hasta qué preguntar antes de firmar, en el orden en que aparecen las dudas.',
    notas: [
      'gasto-de-bolsillo-salud-paraguay',
      'como-elegir-plan-de-salud-paraguay',
      'como-elegir-plan-familia',
      'carencia-copago-y-otras-palabras',
      'como-funciona-cobertura-medicamentos',
      'cobertura-de-salud-en-el-interior',
      'resolver-cobertura-de-salud-antes-de-necesitarla',
    ],
  },
  {
    slug: 'por-que-sube-el-precio',
    titulo: 'Por qué sube el precio de la salud',
    promesa:
      'La pregunta que más duele, contestada con datos y sin culpar a nadie. Qué mueve el costo médico y qué podés mirar en tu plan.',
    notas: [
      'por-que-sube-el-costo-de-la-salud',
      'el-numero-detras-del-costo-medico',
      'por-que-sube-el-seguro-cuando-cambian-los-subsidios',
      'por-que-una-aseguradora-recorta-planes-que-mirar',
    ],
  },
  {
    slug: 'chequeos-a-cada-edad',
    titulo: 'Chequeos a cada edad',
    promesa:
      'Qué conviene controlar en cada etapa, del primer control del bebé a los años que vienen. Prevención concreta, sin susto.',
    notas: [
      'chequeos-por-edad',
      'primer-control-bebe-recien-nacido',
      'chequeo-anual-de-vista-despues-de-los-40',
      'vivimos-14-anos-mas',
    ],
  },
];

// slug de nota -> { serie, posicion, total }. Se arma una sola vez.
const INDICE = new Map();
for (const s of SERIES) {
  s.notas.forEach((slugNota, i) => {
    // Una nota pertenece a UNA guía. Si aparece en dos, gana la primera y
    // avisamos: dos "parte 2 de N" en la misma nota confunden al lector.
    if (INDICE.has(slugNota)) {
      console.warn(`[series] "${slugNota}" está en más de una guía; se usa "${INDICE.get(slugNota).serie.slug}"`);
      return;
    }
    INDICE.set(slugNota, { serie: s, posicion: i + 1, total: s.notas.length });
  });
}

export function getSerie(slug) {
  return SERIES.find((s) => s.slug === slug) || null;
}

// Devuelve { serie, posicion, total } si la nota pertenece a una guía.
export function getSerieDeNota(slugNota) {
  return INDICE.get(slugNota) || null;
}
