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

Con esto se arma el tablero mínimo: top búsquedas sin resultado, matriz
especialidad × ciudad (demanda vs. oferta), prestadores más contactados.
Revisión mensual sugerida con Comercial / Convenios / CX.

**Privacidad**: no guardar cédulas ni asociar búsquedas a personas
identificadas. Las búsquedas de síntomas son datos sensibles: solo agregados
y anónimos.

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
  integra la cartilla).
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
