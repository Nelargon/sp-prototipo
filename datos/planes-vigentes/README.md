# Planes vigentes — datos reales (jul 2026)

Fuente: cuadernillos de cobertura y tarifarios oficiales de Salud
Protegida que pasó el usuario (PDFs, jul 2026). Esta carpeta es la capa
de datos **temporal** que va a alimentar la web hasta que existan los
planes nuevos (Esencial / Integral / Premium): decisión del usuario,
jul 2026 — "esto vamos a tener en la página web al principio hasta que
tengamos los nuevos planes".

**Actualización 20 jul 2026** — el usuario pasó la tabla consolidada
`Tabla_Precios_Planes_SP_Privilege_2026_Julio.pdf`. Su página 1 (los
tres planes juntos) actualiza SOLO las filas 70+ (que son de renovación,
no de venta nueva): aparece por primera vez "titular solo 70-99"
(585.000 / 741.000 / 884.000) y suben cónyuge 70-74 y adherente 70-99
(540.000 / 684.000 / 816.000). Todo lo demás — tramos de venta nueva,
grupo familiar, hijos y los 7 ejemplos GRUPOS por plan — quedó idéntico
(motor re-verificado: 21/21 exactos). Ojo con ese PDF: las páginas 2-4
son las hojas viejas por plan y contradicen a la página 1 en las filas
70+ — **la consolidada manda**.

## Decisiones de presentación (del usuario, jul 2026)

- **"Privilege" se elimina del nombre**: en la web es "Plan Bronce"
  (y serán "Plan Silver" / "Plan Gold" cuando lleguen).
- **Sin logotipos ni colores de los cuadernillos** (no encajan con la
  identidad de la web). La tipografía display del sitio (Nunito Sans
  desde jul 2026; antes Gilroy), y
  colores de sentido común por metal: bronce para Bronce, plata para
  Silver, dorado para Gold. Propuesta de tokens (verificar contraste
  AA al implementarse): bronce `#A9714B`, silver `#8E9196`,
  gold `#C9A227` (el dorado SP existente).
- Nombres en Tipo Oración, como manda la identidad.

## Qué hay

| Archivo | Contenido |
|---|---|
| `SP_Privilege_Grilla_Coberturas_Precios_Jul2026.xlsx` | **Grilla oficial completa (fuente de verdad, jul 2026)** — 8 hojas: Precios, Consultas x especialidad (43), Cuadro 1 Laboratorio (348), Cuadro 2 Estudios e Imágenes (271), Cuadro 3 Cirugías e Internación (314), Cuadro 4 Fisioterapia, Parámetros Clave. La pasó el usuario. |
| `grilla-coberturas-precios-jul2026.json` | **Transcripción fiel de la grilla** (mismo contenido, versionable y diffeable). Cada ítem trae `cob` (CT/COP/CP/AD), `cantidad` (tope) y `carencia` para Bronze / Silver / Gold. Es el volcado estructurado del `.xlsx`. |
| `bronce.json` | Plan Privilege Bronze: tarifa por edad/parentesco (IVA incluido) y **resumen curado** de coberturas con carencias |
| `vital.json` | Plan Vital (senior, 65+): tarifa y cobertura escalonada por antigüedad |

**Silver y Gold (jul 2026): ya están en el repo, dentro de la grilla completa.**
La grilla trae los tres planes con todo el detalle por ítem, así que el
volcado a la web pública (comparador de 3 niveles) ya no está bloqueado — de
hecho el sitio ya corre con los tres planes (`plans()`/`TARIFAS` en
`app/quote.js`). Los `silver.json` / `gold.json` con el mismo *resumen curado*
que `bronce.json` quedan como tarea opcional; la fuente autoritativa para
Silver/Gold es `grilla-coberturas-precios-jul2026.json`.

**Integridad verificada (jul 2026):** los precios `titular_solo` de la grilla
coinciden **exactos** con `TARIFAS` en `app/quote.js` para los tres planes
(Bronze 238/300/450/585 · Silver 324/420/570/741 · Gold 432/560/680/884, en
miles ₲). El motor y la grilla no se contradicen.

### Qué destraba esta grilla (auditoría estratégica jul 2026)

- **Carencias con número** (problema C de la auditoría): la grilla las trae por
  ítem — internación clínica 60 días, maternidad 300 días, y por estudio en los
  cuadros. Ya no hace falta el "tu asesor te muestra el detalle".
- **"Qué no cubre / qué pagás aparte"** (problema B): los ítems `AD` (arancel
  diferenciado, 100% a cargo del beneficiario) son extraíbles por plan desde los
  cuadros — insumo para el bloque sereno "qué no cubre", en gris (regla de tono:
  nunca rojo, nunca "No cubierto").
- **Chequeo de sobrepromesa del bloque "garantiza"** (Crítico): búsqueda en las
  8 hojas → **no existe "telemedicina"** (los únicos "video" son
  *Videolaparoscopía*, técnica quirúrgica) **ni "laboratorio a domicilio"**. Sí
  existe **"Consulta médica a domicilio" (2 / 3 / 4 eventos por año** según plan,
  hoja Parámetros Clave). Conclusión: la tarjeta del home "Telemedicina
  garantizada por contrato" y la parte "laboratorio a domicilio" **no tienen
  respaldo en la grilla** → hay que reetiquetarlas "En camino" o sacarlas hasta
  que Operaciones muestre la cláusula; "médico a domicilio" sí se sostiene.

## Notas de lectura de los cuadernillos

- Tipos de cobertura: `CT` = cobertura total (100%) · `COP` = copago
  50/50 · `CP` = cobertura parcial (diferencia a cargo del
  beneficiario) · `AD` = arancel diferenciado (sin cobertura; precio
  convenio, 100% a cargo del beneficiario).
- Las primas Bronze incluyen IVA (10%). Los rangos 70+ son solo para
  renovación, no venta nueva.
- Regla de tono de la web: lo `AD` nunca se muestra como "No cubierto" —
  se comunica como oportunidad de plan superior (cuando exista el
  detalle Silver/Gold) o como arancel preferencial.
