// Bases y condiciones de las promociones de SP (23/10/2026, sp-interno#209, 2A).
//
// Arturo eligió que las bases vivan en el sitio nuevo «con el texto tal cual lo
// aprobó SP»: un texto legal no cambia en una mudanza. Por eso cada texto es
// LITERAL, copiado de la página donde se publicó, con su fuente y su fecha.
// Lo único que cambia es la forma: los títulos pasan de MAYÚSCULAS a tipo
// oración y las viñetas «●» y «○» pasan a listas. Ninguna palabra cambia, ni
// siquiera las que el sitio no usaría («carencia» primero, «INSTITUTO IRIBAS»
// en mayúsculas): son de SP, no nuestras.
//
// Esta es la casa de las bases de las próximas promociones: una promoción
// nueva es una entrada nueva en BASES, con su propia dirección
// (/bases/<slug>/). Las bases se quedan publicadas mientras la promoción o lo
// que entrega (un voucher) siga vigente.
//
// Bloques: { p } párrafo · { lista: [ítem | { t, sub: [ítem] }] }.

export const BASES = [
  {
    slug: 'octubre-rosa-2026',
    titulo: 'Bases y condiciones',
    promo: 'Promo Octubre Rosa 2026',
    fuente: 'saludprotegida.com.py/octubre_rosa/',
    leido: '2026-10-23',
    // Vigencia: del 07/10 al 04/11/2026; el voucher vale 60 días desde que se
    // recibe, así que la página tiene que seguir en línea hasta enero de 2027.
    intro: 'Por medio del presente documento, se dejan establecidas las condiciones de la Promoción Comercial Octubre Rosa, las cuales son informadas y aceptadas expresamente por el cliente mediante su firma.',
    secciones: [
      {
        titulo: '1. Beneficio – primeros 50 clientes',
        bloques: [
          { p: 'La promoción estará disponible para los primeros 50 clientes que contraten un plan de Salud Protegida.' },
          { p: 'Los clientes que califiquen accederán a los siguientes beneficios:' },
          {
            lista: [
              '15% de descuento en las primeras 3 cuotas.',
              '10% de descuento a partir de la cuarta cuota y durante el período restante del contrato, (este descuento del 10% es válido para vinculaciones al débito automático a través de MetrePay, ya sea con tarjeta de débito o crédito).',
              {
                t: 'Adelanto de carencia sin costo adicional: Como beneficio especial, Salud Protegida permitirá el acceso inmediato a los siguientes estudios:',
                sub: ['PAP y colposcopía.', 'Ecografía mamaria.', 'Mamografía.'],
              },
            ],
          },
        ],
      },
      {
        titulo: '2. Beneficio especial – Plan Vital / Instituto IRIBAS',
        bloques: [
          { p: 'Para los clientes que contraten el Plan Vital, el beneficio especial será válido exclusivamente en el INSTITUTO IRIBAS, bajo las siguientes condiciones:' },
          { lista: ['PAP y Colposcopía (incluye citología) con vigencia inmediata.', 'Mamografía de regalo.'] },
          { p: 'Como beneficio especial, Salud Protegida otorga el acceso anticipado, por única vez, a los estudios mencionados, sin necesidad de cumplir el período de carencia habitual.' },
          { p: 'Una vez utilizado el beneficio, el cliente deberá respetar los plazos de reutilización y las condiciones establecidas en su contrato para acceder nuevamente a dichos estudios.' },
        ],
      },
      {
        titulo: '3. Vigencia de la promoción',
        bloques: [
          { p: 'La promoción estará vigente desde el 07 de octubre de 2026 hasta el 04 de noviembre de 2026. Todas las personas que contraten un plan de Salud Protegida durante este período accederán a los beneficios promocionales, conforme a las condiciones establecidas.' },
        ],
      },
      {
        titulo: '4. Vigencia del voucher',
        bloques: [
          { p: 'El voucher tendrá una vigencia de 2 (dos) meses (60 días), contados a partir de la fecha de recepción del mismo.' },
          { p: 'Una vez transcurrido dicho plazo, el voucher perderá automáticamente su validez.' },
        ],
      },
      {
        titulo: '5. Condiciones generales',
        bloques: [
          {
            lista: [
              'La presente promoción está sujeta al cumplimiento de las condiciones establecidas en este documento.',
              'Los beneficios de esta promoción no son acumulables con otras promociones, descuentos, bonificaciones o beneficios comerciales vigentes.',
              'El beneficio corresponde exclusivamente a los clientes que cumplan con las condiciones establecidas y se encuentren dentro de los primeros 50 beneficiarios.',
              'El cliente declara haber recibido información clara y suficiente respecto de los beneficios, condiciones y vigencia de la promoción.',
            ],
          },
        ],
      },
    ],
  },
];

export const getBases = (slug) => BASES.find((b) => b.slug === slug);
