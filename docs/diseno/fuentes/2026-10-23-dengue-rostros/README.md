# Criaderos: rostro en trazo y originales recuperadas

Última indicación de Arturo, 23/10/2026: «Al final, creo que me gustó cómo
estaba antes». Solo conserva la cara completa en trazo, pero pide corregir
la ubicación relativa de ojo, nariz y boca. Para las otras dos técnicas
prefiere la primera versión: sin ojos y con el contraste de la boca.

La selección actual del [laboratorio](https://nelargon.github.io/sp-prototipo/blog/laboratorio/#dengue) es:

- **Trazo v3:** rostro completo, rasgos revisados en conjunto y boca visible.
- **Papel v1:** original, sin ojos y con el gesto inicial.
- **Facetada v1:** original, sin ojos y con la boca contrastada.

Las v2 con bocas casi invisibles quedan en el historial. La devolución llegó
antes de publicar esa vuelta como actual en Pages. No se cambian las portadas
del blog ni las imágenes de otros temas.

## Criterio y recorrido

La primera devolución pedía bocas muy sutiles en las tres y ojos en trazo.
Se prepararon v2, con ojos sugeridos también en facetada. Al verlas, Arturo
prefirió recuperar el original de papel y facetada. Para trazo señaló un
problema de construcción del rostro: la nueva corrección parte de v1 y
redibuja la relación entre los rasgos, en lugar de añadir un ojo aislado.

«Síntesis del rostro» o «abstracción selectiva» describe un recurso, no una
escuela única. La técnica y el grado de detalle facial se eligen por separado.
La postura, la dirección de la cabeza y los rasgos conservados construyen la
expresión. Reducir el contraste no es una mejora automática.

## Procedencia

Las v1 del laboratorio fueron las referencias de `image_gen`.
`prompts-v2.json` y `prompts-ajuste.json` conservan los encargos de la prueba
intermedia. `prompt-trazo-v3.json` registra la corrección de anatomía facial.
`procedencia.json` conserva hashes, fuentes y cuáles son las imágenes actuales.
ImageMagick solo convierte a WebP y reduce las miniaturas; no hace retoques
artísticos. Papel y facetada v1 son los mismos archivos que ya estaban en main.

## Versiones y selección

El catálogo distingue la última revisión disponible de la actual por estilo
(`revisions` y `currentRevisions` en el brief). Permite recuperar una anterior
sin eliminar las pruebas. Las favoritas conservan su revisión e imagen y se
pueden abrir, exportar o quitar desde la ampliación; una v1 no aprueba una v3.

`verificacion.json` comprueba 37 versiones, 81 recortes, cuatro anchos y la
recuperación de favoritas. Prueba que papel y facetada abran v1 aunque exista
v2 y que una favorita trazo v1 no se transfiera a v3. `revision-ux.json` y
`verificacion-offline.json` conservan los otros controles.
Las láminas v2 y v3 están en `docs/diseno/img/2026-10-23-laboratorio-dengue-rostros-*.webp`.
