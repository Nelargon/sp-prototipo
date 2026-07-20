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
| `bronce.json` | Plan Privilege Bronze: tarifa por edad/parentesco (IVA incluido) y resumen de coberturas con carencias |
| `vital.json` | Plan Vital (senior, 65+): tarifa y cobertura escalonada por antigüedad |

Pendiente: `silver.json` y `gold.json` (segunda parte, la trae el
usuario). Recién con esos dos se hace el volcado a la web pública
(comparador de 3 niveles + Vital como carril senior) — con Bronce solo,
el comparador quedaría de una columna.

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
