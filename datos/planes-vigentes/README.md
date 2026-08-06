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
| `grilla-coberturas-precios-jul2026.json` | **Transcripción fiel de la grilla Privilege** (Bronze/Silver/Gold), versionable y diffeable. Cada ítem trae `cob` (CT/COP/CP/AD), `cantidad` y `carencia`. Incluye `cobertura_real` (% cubierto por plan) y la leyenda `AD` con la cláusula 2.10. |
| `grilla-vital-coberturas-jul2026.json` | **Transcripción fiel de la grilla Plan Vital (65+)** — precios (débito/particular + sepelio), coberturas por carencia (4 tramos), 26 especialidades, laboratorio y estudios, sepelio. |
| `bronce.json` / `silver.json` / `gold.json` | **Resumen curado** por plan Privilege: tarifa por edad/parentesco (IVA incl.) + coberturas clave. Vista cómoda; para el detalle fino, ir a la grilla. |
| `vital.json` | Plan Vital: resumen curado (tarifa + cobertura escalonada). El detalle completo está en `grilla-vital-coberturas-jul2026.json`. |

## Pipeline de datos (Drive → repo) — runbook

Los **masters** viven en el Drive del usuario (carpeta `SP-Web`) y son la fuente
de verdad. El repo guarda la transcripción versionada. Para **re-ingerir** cuando
el usuario actualiza un master:

1. Leer el master por su **fileId** con la herramienta de Google Drive
   (`get_file_metadata` / `read_file_content`).
2. Transcribir a JSON fiel (mismo formato que los `grilla-*.json`).
3. **Verificar** los precios contra `TARIFAS` en `app/quote.js` (deben coincidir).
4. **Regenerar el índice buscable de `/planes`** (desde jul→ago 2026 la grilla ya
   no es solo referencia: la consulta el buscador de la web):

   ```
   node scripts/build-prestaciones.mjs   # → lib/prestaciones.json (se commitea)
   node scripts/test-buscador.mjs        # 32 casos en el idioma del cliente
   ```

   El generador **corta** si aparece un código de cobertura que no conoce
   —en vez de adivinar— y avisa de sinónimos que ya no matchean nada y de
   ítems con celdas combinadas. Leer esa salida: es donde aparecen los
   cambios que el diff de precios no muestra.
5. PR en borrador → revisión humana → merge. El diff de `lib/prestaciones.json`
   muestra **ítem por ítem qué cobertura se movió** — es la parte del PR que
   hay que mirar con más cuidado, porque va derecho a la web.

| Master (Drive) | fileId | Última ingestión |
|---|---|---|
| SP Privilege — Grilla Coberturas y Precios (Jul 2026).xlsx | `1ORPseTEt-jeo2FDqGJ6LQkr0F-fr_oYh` | **26 jul 2026** (master del 24/07: filas AD → `N/A`) |
| SP Vital — Grilla Coberturas y Precios (Jul 2026).xlsx | `1kIptlBGNTpKuEgFQAEJjmpzeqKmfrZm3` | 22 jul 2026 (primera ingestión) |

> Nota: los atajos `.lnk` en Drive **no** funcionan como puntero (son atajos de
> Windows); se trackea el **fileId** del master.

**Chequeo quincenal automatizado (26 jul 2026):** una Routine compara el
`modifiedTime` de cada master contra las fechas de esta tabla los días 1 y 15.
Si un master cambió, re-ingiere y abre PR; si no, no molesta a nadie. Reemplaza
al chequeo mensual que estaba solo propuesto.

### Ingestión del 26 jul 2026 (master modificado el 24/07)

Diff completo master ↔ repo, celda por celda:

| | Resultado |
|---|---|
| Códigos de cobertura (CT/COP/CP/AD) | **0 cambios** |
| Precios | **0 cambios** — y siguen coincidiendo exactos con `TARIFAS` de `app/quote.js` |
| Filas agregadas o eliminadas | **0** |
| Carencias y cantidades | **201 celdas** — todas en filas `AD`, todas a `N/A` |

Las 201 celdas cambiadas son **exactamente** las filas con `cob: "AD"`. Es
decir: el master del 24/07 corrigió los valores heredados que esas filas traían
(`INMEDIATA`, cantidades) y los puso en `N/A`, que es lo que el propio
cuadernillo indica para Arancel Diferenciado.

⚠ **Por qué importa aunque no cambie nada en la web.** Una fila `AD` con
`carencia: "INMEDIATA"` leída sin filtrar dice *"cubierto, sin espera"* en un
plan que **no cubre** ese servicio. El código de la web ya lo filtraba por
`cob !== 'AD'` (ver `app/coverage.js` y BITACORA cap. 55), así que el sitio
nunca publicó el dato malo — pero ahora la fuente y el repo dicen lo mismo, y
la próxima persona que lea este JSON no se puede tropezar.

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
