# Laboratorio de imágenes del blog

Pedido de Arturo, 23/10/2026: conservar las propuestas para decidir con tiempo
y explorar cinco o seis artículos más. La subpágina vive en
[/blog/laboratorio/](https://nelargon.github.io/sp-prototipo/blog/laboratorio/).

## Inventario y criterio

Nueve notas, 27 propuestas actuales y seis versiones anteriores. Los archivos
de trabajo publicados están en `public/blog/laboratorio/assets/`: 33 WebP
completos y 27 miniaturas. Cada propuesta tiene un identificador estable que
incluye su revisión; una futura v2 no hereda automáticamente una favorita v1.

La libreta conserva sus tres variantes. Escuela y caminar muestran la v2 y
permiten recuperar la v1. Arturo valora los tres estilos de libreta y escuela;
en caminar prefiere A editorial y B narrativa. La fotografía D sigue como
antecedente, no como elección aprobada. Las seis notas nuevas quedan por comparar.

| Nota nueva | Idea de portada | Límite de la representación |
|---|---|---|
| Lavado de manos | Jabón y fricción en una pileta de casa | El texto explica duración y pasos |
| Dengue | Vaciar el plato de una maceta | Es una tarea entre varios posibles criaderos |
| Presión | Control tranquilo, aunque la persona se sienta bien | Pantalla sin cifras; no interpreta un resultado |
| Mellizos | Dos pares de escarpines y agenda de controles | El título vincula los objetos al seguimiento prenatal |
| Medicamentos | Revisar indicaciones y documentación en una farmacia | No inventa porcentajes ni identifica un medicamento |
| Hábitos familiares | Preparar alimentos en familia | Un ejemplo cotidiano de lo que los hijos ven en casa |

Cada idea se repite en trazo explicativo, siluetas y papel e ilustración
facetada. Primero se generó una escena por tema; la primera prueba de papel
tenía demasiado relieve y se volvió a trabajar tomando la libreta y la
escuela como referencia. Luego se trasladó la composición a las otras dos
técnicas. Ediciones artísticas mediante `image_gen`; conversión a WebP y
miniaturas mediante ImageMagick. Las imágenes son propuestas, no fotografías
documentales ni una validación clínica. No se publican las referencias del Drive.

`conceptos.json` contiene las seis notas fuente y sus conceptos.
`prompts-iniciales.json` conserva el encargo inicial de las escenas, previo a
las revisiones de estilo; no reproduce por sí solo el resultado final.
`procedencia.json` registra las imágenes nuevas y sus hashes.
`verificacion.json` y `revision-ux.json` guardan los controles locales.

## Uso y mantenimiento

La interfaz es estática, sin servicios externos ni cuentas: favoritas y notas
se guardan en el navegador. Se pueden exportar/importar y copiar como texto.
La importación combina favoritas válidas e incorpora las notas del archivo;
ignora identificadores ajenos al catálogo. No modifica el blog ni escribe en
GitHub. La descarga conserva la imagen entera, aunque se esté viendo un recorte.

Para sumar una nota: incorporar las imágenes completas y miniaturas, agregar
su brief a `conceptos.json` y ejecutar `python3 scripts/build-laboratorio.py`.
El script toma título, copete, categoría y slug del contenido real del blog.
Para sumar una revisión se actualiza también el inventario de versiones del
script. Se conserva la revisión anterior para poder compararla.

Comprobaciones desde la raíz del repo:

```sh
python3 scripts/build-laboratorio.py
node qa/laboratorio.mjs --datos
PW_PATH=/ruta/a/playwright/index.mjs PW_CHROME=/ruta/a/chromium \
  node qa/laboratorio.mjs http://localhost:8768/sp-prototipo
```

El segundo comando no necesita navegador y corre en CI. El tercero necesita
el export servido bajo el basePath. Comprueba nueve artículos, cuatro anchos,
81 vistas de recorte, 33 versiones y el ciclo de selección y recuperación.
Las capturas están en `docs/diseno/img/2026-10-23-laboratorio-*.webp`.
La página queda fuera de la edición de lanzamiento porque se poda `/blog/`.

## Copia que se puede llevar

Los primeros dos intentos de Pages agotaron el tiempo de espera de publicación
el 23/10/2026; la compilación y los controles habían pasado. La copia autónoma
permite revisar el laboratorio mientras se resuelve el despliegue:

```sh
python3 scripts/export-laboratorio.py --output /tmp/SP-Laboratorio-imagenes.html
```

El resultado es un HTML de unos 17 MB con catálogo, 60 recursos de imágenes,
tipografías y logo incluidos. Conserva favoritas, notas, versiones, descargas
y exportación/importación. Los links a las notas y a GitHub necesitan conexión;
la comparación no. Las selecciones de esta copia y las de la web se trasladan
con exportar/importar: no se sincronizan solas.

Verificado con Chromium sin conexión, entregando el HTML exacto mediante una
ruta local de prueba (el entorno bloquea las direcciones `file://`): nueve
artículos, 27 propuestas, 33 versiones, cero solicitudes externas ni errores,
persistencia y exportación correctas, sin desborde a 390 px. El script falla
si la interfaz cambió y una adaptación ya no coincide, en vez de producir una
copia que siga dependiendo del servidor. El HTML generado se entrega como
archivo y no se duplica dentro del repositorio.
