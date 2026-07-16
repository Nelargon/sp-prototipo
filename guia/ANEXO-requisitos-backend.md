# Guía Médica SP — Anexo de requisitos (backend / datos / medición)

Complementa las tres páginas de este directorio (`guia_home.html`,
`guia_resultados.html`, `guia_prestador.html`). Las páginas muestran **el
comportamiento y el molde de datos esperado**; este documento lista lo que no
se ve en pantalla y debe implementarse del lado del sistema.

> Los nombres, teléfonos, direcciones y coberturas de las páginas son
> **datos ilustrativos** — definen el formato, no el contenido.

---

## 1. Buscador único

Un solo campo que busca en: especialidades, estudios, nombres de prestadores y
ciudades. El algoritmo esperado (implementado como demo en JS, misma lógica en
el servidor):

1. **Normalizar**: minúsculas, sin tildes (`Pediatría` ≡ `pediatria`), sin
   espacios sobrantes.
2. **Sinónimos**: diccionario término cotidiano → término de catálogo
   (`dentista → Odontología`, `eco → Ecografía`, `análisis de sangre →
   Laboratorio`). Arranque: ~50 entradas (ver catálogo en `guia_home.html`);
   crece con las búsquedas sin resultado registradas.
3. **Coincidencia**: prefijo > contiene > difusa (distancia de edición ≤ 1–2
   según largo, tolera `rezonancia`, `traumatolgia`).
4. **Sugerencias agrupadas** por categoría (Especialidades / Estudios /
   Prestadores / Ciudades), máx. 8, navegables con teclado (ya resuelto en el
   front de ejemplo con ARIA combobox).
5. **Cero resultados**: nunca página vacía → sugerencia "¿quisiste decir…?" +
   botón de WhatsApp con la búsqueda prellenada.

Unificar el parámetro de especialidad: hoy la portada envía **texto**
(`?especialidad=Cardiología`) y los filtros envían **ID** (`?especialidad=13`).
Elegir uno (recomendado: ID interno + `q` de texto libre por separado).

## 2. Registro de eventos (inteligencia de negocio)

Cada página emite eventos por `track(evento, datos)` (hoy `console.debug`;
conectar a un endpoint `/api/eventos` o GA4). Registrar SIEMPRE, con timestamp,
sesión anónima, dispositivo y origen:

| Evento                | Datos                                    | Para qué sirve |
|-----------------------|------------------------------------------|----------------|
| `search`              | texto crudo + normalizado, filtros, nº de resultados | demanda por especialidad/zona |
| `search_zero_results` | texto buscado                            | **prestadores/especialidades faltantes → Convenios** |
| `suggestion_pick`     | texto tipeado, opción elegida, categoría | alimenta el diccionario de sinónimos |
| `result_click`        | prestador, posición en la lista          | ranking "Más buscados" automático |
| `click_llamar` / `click_whatsapp` / `click_como_llegar` | prestador, sede | la búsqueda terminó en contacto (conversión) |
| `fallback_whatsapp`   | texto buscado                            | cola CX con contexto |
| `filtro_plan`         | (sin datos personales)                   | uso de la vista por plan |
| `vista_personalizada` | nivel de plan (sin identidad)            | adopción del modo "mi red" |
| `upsell_view` / `upsell_click_simulador` | prestador, plan requerido, plan del usuario | **qué prestadores generan deseo de upgrade → Comercial** |

Con esto se arma el tablero mínimo: top búsquedas sin resultado, matriz
especialidad × ciudad (demanda vs. oferta), prestadores más contactados.
Revisión mensual sugerida con Comercial / Convenios / CX.

**La web pública emite eventos al mismo endpoint.** La web de planes
(homepage y simulador, `app/track.js` en el prototipo) usa el mismo
`track(evento, datos)` con estos eventos — el embudo completo es
web → guía → contacto y debe poder reconstruirse por sesión anónima:

| Evento (web)          | Datos                                    | Para qué sirve |
|-----------------------|------------------------------------------|----------------|
| `puerta_home`         | puerta (plan / ya_soy_sp), origen (hero / menu) | qué audiencia entra por el hero: prospecto vs. afiliado (la métrica de la puerta 2 es visita recurrente, no conversión) |
| `manifesto_scroll`    | profundidad (25/50/75/100), pagina (home / historia) | cuánta gente atraviesa el manifiesto vs. lo abandona — el dato que decide su futuro |
| `guia_handoff`        | q (texto buscado, puede ser vacío), via (enter / dropdown / nav / menú / link) | cuánta demanda de la guía nace en la web |
| `cartilla_select`     | práctica, via (chip / sugerencia)        | qué coberturas consulta la gente antes de comprar |
| `comparador_plan`     | plan, via (slider / parada)              | qué nivel de plan explora cada visitante |
| `cta_simulador`       | origen (nav / hero / teaser / senior / cierre / fab / menú) | qué sección de la web empuja a cotizar |
| `sim_step`            | paso (1–6)                               | dónde se abandona el simulador (embudo) |
| `sim_result_view`     | plan recomendado, precio                 | qué recomienda el motor y a qué precio |
| `sim_lead_submit`     | plan, precio — **sin nombre/tel/email**  | conversión a lead (el dato personal va al CRM, no a la analítica) |
| `sim_quote_download` / `sim_quote_share` | —                     | interés fuerte sin dejar datos |
| `click_whatsapp`      | origen (comparador / cierre / fab / simulador_resultado) | conversión a conversación |
| `click_urgencias`     | origen (header / menú móvil)             | uso del acceso de urgencias |
| `faq_open`            | pregunta                                 | objeciones reales → contenido y guiones de venta |

**Privacidad**: no guardar cédulas ni asociar búsquedas a personas
identificadas. Las búsquedas de síntomas son datos sensibles: solo agregados
y anónimos. Los eventos nunca llevan nombre, teléfono ni email.

## 3. Consulta por cédula ("Ver mi red")

- Requiere **CI + fecha de nacimiento** (segundo factor liviano).
- Enviar por **POST** (nunca la cédula en la URL).
- **Rate limiting**: máx. N intentos por IP/minuto + CAPTCHA invisible.
- Respuesta mínima: lista de prestadores filtrada. **No** devolver nombre del
  titular ni denominación del plan.

## 4. Campos de datos requeridos por el diseño

El molde de las páginas asume, por prestador:

- **Nombre en Tipo Oración** (no MAYÚSCULAS SOSTENIDAS) — se puede derivar
  automáticamente + lista de excepciones (siglas).
- **Sedes como registros separados**, cada una con: nombre del lugar,
  dirección, ciudad, **coordenadas (lat/long)** para "Cómo llegar",
  **teléfonos separados** (uno por campo, con marca de cuál es WhatsApp),
  **horarios** por día (permite calcular "Abierto ahora").
- **Planes aceptados** por prestador (y cobertura/copago por plan, si se
  integra la cartilla). La cobertura es **jerárquica** (Premium ⊇ Integral ⊇
  Esencial), así que basta almacenar el **nivel mínimo** por prestador
  (`min_plan`). SP Senior corre por su propio carril (Senior / Senior Plus)
  con su propio nivel mínimo. En la UI: sin CI se muestra "Desde SP X" /
  "★ Exclusivo SP Premium"; con CI, "✓ Con tu plan" o la etiqueta dorada
  que abre la hoja de upsell hacia el simulador. Regla de tono: nunca
  "No cubierto" ni rojo — la ausencia se comunica como oportunidad.
- **Atributos**: urgencias 24h · a domicilio · telemedicina.
- Especialidades ≠ tipos de prestador (hoy "SANATORIO" figura como
  especialidad). Corregir typo del catálogo: "SERVICIO DE AMBULACIA".
- Foto real opcional; si no hay, el front genera iniciales (ya resuelto —
  eliminar avatares genéricos por género).

## 5. Higiene técnica

- Tailwind **compilado** en producción (el CDN `cdn.tailwindcss.com` es solo
  para prototipos; recompila el CSS en cada visita).
- Corregir en las plantillas actuales: `<style>` anidado, `<main>` duplicado,
  `>` suelto en `<head>`, columnas vacías del footer.
- `schema.org` (Physician / MedicalClinic) en fichas — incluido de ejemplo en
  `guia_prestador.html`.
- Paginación: mantenerla, pero con "Cargar más" como acción principal en móvil
  y conservando los filtros al volver de una ficha.
- Tipografías: Gilroy ExtraBold/SemiBold para títulos (archivos en `fonts/`),
  Inter para cuerpo. Paleta: navy `#003B71`, teal `#00BCB4`, verde `#009690`
  (tokens en el `tailwind.config` de cada página).
- Links de vuelta a la web de planes: en el prototipo, el logo y los enlaces
  "Inicio" / "Planes" del header, menú móvil y footer apuntan en relativo
  (`../`, `../#comparar`). En producción deben apuntar al dominio público de
  la web de Salud Protegida (p. ej. `https://saludprotegida.com.py/`).
- **SEO al publicar en el dominio definitivo** (jul 2026): las tres páginas
  de la guía llevan `<meta name="robots" content="noindex">` a propósito —
  el prototipo no debe aparecer en Google. Al publicar: **quitar esa
  etiqueta**, hacer absolutas las URLs de `og:image` (hoy relativas a
  `assets/`), agregar `<link rel="canonical">` con la URL pública de cada
  página, y publicar el `sitemap.xml` + `robots.txt` (la web Next ya los
  genera parametrizados: se encienden con `NEXT_PUBLIC_INDEXABLE=true` +
  `SITE_URL`).

## 6. Panel de estadísticas (`/estadisticas`)

El prototipo del panel ya contempla una buena base, que se mantiene:
búsquedas hoy / 7d / 30d, **búsquedas sin resultado con detalle por
término**, términos y especialidades más buscados, perfiles de prestador
más vistos con cantidad, gráfico de actividad día por día y distribución
por dispositivo/navegador.

Para que el panel sirva a la operación (y no solo a la curiosidad), se
suma lo siguiente:

1. **Conversión por prestador**: además de las vistas de perfil, contar
   `click_llamar`, `click_whatsapp` y `click_como_llegar` por prestador y
   sede. La métrica clave es *búsquedas que terminan en contacto*, no
   vistas.
2. **Matriz especialidad × ciudad** (demanda vs. oferta): cuántas
   búsquedas hubo de cada especialidad en cada ciudad vs. cuántos
   prestadores la cubren. Las celdas con mucha demanda y poca oferta son
   la lista de tareas de Convenios.
3. **Embudo por sesión anónima**: búsqueda → click en resultado →
   contacto. Requiere que cada evento lleve el ID de sesión anónima
   (§2). Sin identidad: el embudo se mira agregado.
4. **Sinónimos candidatos**: tabla de `suggestion_pick` (qué tipeó la
   gente vs. qué eligió) — de ahí salen las entradas nuevas del
   diccionario del buscador.
5. **Cola de rescates**: `fallback_whatsapp` con el texto buscado, para
   que CX vea con qué contexto llega cada conversación.
6. **Adopción del modo por plan** (cuando se integre la guía nueva):
   `vista_personalizada` por nivel, y ranking de `upsell_view` /
   `upsell_click_simulador` por prestador — qué prestadores generan
   deseo de upgrade (insumo directo de Comercial).
7. **Eventos de la web** (§2): embudo del simulador (paso a paso →
   resultado → lead), CTAs que más convierten y `guia_handoff` (cuánta
   demanda de la guía nace en la web de planes).

**Tres vistas, una por audiencia** (el mismo dato, la pregunta de cada
equipo): **Convenios** — qué falta (sin resultados + matriz demanda/
oferta); **Comercial** — qué vende (conversión por prestador, upsell,
embudo del simulador); **CX** — dónde se frustra la gente (rescates,
typos frecuentes, abandonos).

Cada tabla debe poder **exportarse (CSV)** y filtrarse por rango de
fechas. El panel es de uso interno: requiere autenticación y no expone
ningún dato personal (§2, privacidad).
