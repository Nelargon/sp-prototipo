# Criaderos: segunda versión de los rostros

Arturo, 23/10/2026: «En los tres se ve demasiado la boca. Que no se vea
mucho, que sea un poco más sutil». Para trazo explicativo pide una cara con
ojos; también valora las caras sintetizadas y propone reservar la omisión de
ojos para una de las técnicas.

La revisión queda en el [laboratorio, dengue](https://nelargon.github.io/sp-prototipo/blog/laboratorio/#dengue):

- Trazo: ojo visible dirigido hacia la tarea y boca discreta, respetando el
  ángulo de la cabeza.
- Papel: ojos omitidos y boca casi imperceptible.
- Facetada: ojo sugerido y boca de bajo contraste entre planos de color.

Se conservan composición, acción y las tres técnicas. La v1 permanece en el
selector al ampliar. No se cambian las portadas del blog ni los otros temas.

## Criterio

«Síntesis del rostro» o «abstracción selectiva» describe un recurso, no una
escuela única. La técnica y el grado de detalle facial pueden elegirse por
separado. La postura, la dirección de la cabeza y los rasgos conservados
construyen la expresión. No se afirma que un rostro sin ojos represente a
todas las personas ni que produzca un efecto psicológico universal.

## Procedencia

Las tres v1 del laboratorio fueron las referencias directas de `image_gen`.
`prompts-v2.json` conserva el primer encargo. Papel alcanzó el gesto buscado;
la primera edición de trazo y facetada conservó demasiada boca. Se pidió una
segunda corrección usando la boca de papel como referencia puntual.
`prompts-ajuste.json` conserva esa corrección. Las generaciones descartadas
no se agregan como alternativas aprobadas al catálogo.

WebP y miniaturas se producen con ImageMagick, sin retoque artístico por
script. `procedencia.json` identifica los archivos finales y sus hashes.

## Versiones y selección

La primera actualización de una nota ya publicada reveló que las favoritas
históricas se descartaban al cargar una revisión nueva. El laboratorio ahora
reconoce todos los identificadores de revisión, muestra cuál se guardó y
permite cambiar la selección desde la ampliación. V1 y v2 son independientes.
El contador de versiones sale del catálogo y la agrupación por tanda no
cambia cuando una nota recibe correcciones.

`verificacion.json` conserva la prueba de navegador y `revision-ux.json` la
revisión visual automática. La prueba de selección histórica carga una v1
guardada antes de actualizar, comprueba que v2 no esté elegida, guarda ambas,
exporta, recarga y quita solo v1. La lámina está en
`docs/diseno/img/2026-10-23-laboratorio-dengue-rostros-v2.webp`.
