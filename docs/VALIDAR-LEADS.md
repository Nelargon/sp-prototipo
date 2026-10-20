# Simulador → lead: condiciones para publicar

20/10/2026. Propuesta técnica en rama; no es autorización de lanzamiento.
Base revisada: `05a4e80754316d5099504f16b37ce013a1c76e3f` de `main`.

## Resultado de la revisión

El simulador calculaba el precio y pedía contacto, pero su ID de HubSpot estaba
vacío. Sin ese ID, y también ante un error, marcaba `sent:true` y emitía
`sim_lead_submit` antes de que la persona enviara un mensaje en WhatsApp.
`track()` solo escribía en la consola. La guía confundía el clic de WhatsApp
con un contacto efectivo. Había además un POST sin timeout, sin exclusión
síncrona del doble clic, y con `location.href` completo en `context.pageUri`.
El borrador local serializaba todo el estado, incluidos los datos de contacto
si la persona volvía a pasos anteriores.

La rama corrige esos puntos sin cambiar precios, coberturas ni la estructura
comercial del simulador. No activa proveedores, no agrega secretos, no cambia
formularios de HubSpot, no publica y no crea contactos reales de prueba.

## Qué falta exactamente

Los dueños de cada validación deben confirmarse; lo siguiente es el reparto
propuesto para resolverlo, no una asignación ya acordada.

| Dependencia | Quién debe validar | Evidencia para cerrarla |
|---|---|---|
| Formulario del simulador | Marketing + administrador HubSpot/Grows | Elegir entre los formularios web publicados, obtener definición vigente y confirmar `portalId` + `formId`; no crear otro sin revisar los existentes |
| Campos y consentimiento | Administrador HubSpot + responsable de privacidad | `firstname`, `phone`, `email`, `message` presentes; email opcional; sin otros obligatorios; texto y política aprobados; `legalConsentOptions` compatible |
| Captación sin email | Comercial + administrador HubSpot | Un envío sin email crea/actualiza un contacto usable; definir deduplicación por teléfono y conservación de envíos repetidos |
| Antispam/CAPTCHA | Administrador HubSpot + Desarrollo | Confirmar compatibilidad del formulario con Forms API y aceptación del envío, fuera de spam; si exige CAPTCHA, adaptar a embed oficial o backend, sin desactivar protección a ciegas |
| Registro y atención | Comercial | Envío visible, contacto creado/actualizado, origen identificable, propietario y tarea/notificación correctos; ningún aviso involuntario durante QA |
| WhatsApp alternativo | Comercial/ATC | Mensaje entrante en la línea central y derivación a venta; comprobar cómo se registra en CRM. El clic del sitio no lo demuestra |
| Medición y privacidad | Marketing + responsable de privacidad + Desarrollo | Elegir GA4/Plausible, cuenta/propiedad propia, consentimiento y política; ver evento en el panel y revisar tráfico de red |
| Origen de campañas | Marketing + administrador HubSpot | Acordar propiedades y vocabulario de campaña, agregarlos al formulario y probarlos. Esta rama NO copia UTM ni identificadores publicitarios libres |

Registrar decisiones y evidencia en el seguimiento interno existente.
La revisión del 20/10 confirmó en el portal dos formularios publicados:
“Formulario Nueva Web” y “Salud protegida - Formulario web”. Sus identificadores
y fuentes se entregan en la respuesta de la tarea; el estado publicado
no prueba compatibilidad con este flujo. No se eligió uno por su nombre.

## Lo implementado

- `app/lead.js`: configuración de build, validación, consentimiento explícito,
  API pública sin token, timeout de 12 segundos y errores por categoría.
- Formulario primario cuando está validado; WhatsApp siempre accesible. Sin
  configuración, el botón dice que prepara un mensaje, sin prometer envío.
- Solo una solicitud simultánea. No reintenta automáticamente un resultado
  incierto; el usuario puede reintentar. Una caída de red puede ocurrir después
  de que HubSpot haya aceptado el envío: no hay garantía de “exactamente una
  vez” entre reintentos. La deduplicación real es responsabilidad del CRM.
- La API recibe nombre, teléfono, email opcional, resumen del plan/precio y
  consentimiento. No recibe edades, composición familiar, cookies, IP escrita
  por la aplicación ni la URL completa. Los datos de contacto para WhatsApp
  van únicamente en el mensaje que la persona decide abrir/enviar.
- El guardado para retomar excluye contacto, consentimiento, búsquedas libres
  y estado de envío. Las simulaciones anteriores se leen con la misma selección
  de campos. La información de la simulación (edades y zona elegida) permanece
  en el navegador: no debe describirse como ausencia total de datos locales.
- `track()` aplica lista cerrada antes de cualquier transporte u observación
  local. Sin valores personales aunque un llamador los agregue por error.
  GA4/Plausible no se cargan por tener un ID solamente.

## Qué acredita cada señal

| Señal | Significa | No demuestra |
|---|---|---|
| `sim_result_view` | Se vio un resultado | Interés confirmado |
| `sim_lead_attempt` | Se inició un POST válido | Recepción |
| `sim_lead_accepted` | Forms API devolvió 2xx | Contacto único, asignación, atención ni venta |
| `sim_lead_failed` | No se pudo confirmar aceptación | Que HubSpot nunca lo haya recibido |
| `sim_lead_fallback` | Se ofreció continuar por WhatsApp | Mensaje enviado |
| `click_whatsapp` | Se activó el enlace | Conversación ni lead registrado |
| Envío + contacto en HubSpot | Registro efectivo comprobado | Atención comercial |
| Propietario + tarea/notificación | Entrada al circuito de venta | Venta cerrada |

El indicador de leads efectivos sale del CRM. `sim_lead_accepted` sirve como
conversión técnica del formulario y se concilia con CRM; puede actualizar un
contacto existente. No sumar aperturas de WhatsApp a ese total. Para confirmar
WhatsApp se necesita el proveedor de mensajería o registro comercial, no otro
evento en el navegador. No enviar IDs de contacto, email cifrado/hash, teléfono
ni detalles médicos a las plataformas de medición.

## Configuración de lanzamiento (pendiente de validación)

Variables públicas de build, nunca tokens:

| Variable | Valor requerido |
|---|---|
| `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` | Portal de SP, valor por defecto `48242096` |
| `NEXT_PUBLIC_HUBSPOT_FORM_ID` | UUID del formulario que SP confirme |
| `NEXT_PUBLIC_LEAD_FORM_APPROVED` | `true` solo después de comprobar definición y recorrido |
| `NEXT_PUBLIC_PRIVACY_URL` | URL HTTPS de política publicada y validada |
| `NEXT_PUBLIC_LEAD_CONSENT_TEXT` | Texto exacto que la persona acepta para la consulta |
| `NEXT_PUBLIC_ANALYTICS_APPROVED` | `true` después de validar cuenta, configuración y privacidad |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` o `NEXT_PUBLIC_GA_ID` | Uno de los proveedores; si hay dos, gana Plausible |
| `NEXT_PUBLIC_ANALYTICS_CONSENT_MODE` | Por defecto requiere consentimiento; `not_required` solo para Plausible, si SP lo valida |

La casilla del lead está desmarcada y no habilita publicidad. Si la política
aprobada requiere otro mecanismo o suscripciones, adaptar el código y probar;
no insertar un consentimiento genérico. Un formulario con otros obligatorios
no se vuelve compatible poniendo su UUID: hay que revisar el mapeo.

**Consentimiento analítico.** La CMP emite, después de montar la página:

```js
window.dispatchEvent(new CustomEvent('sp:analytics-consent', {
  detail: { granted: true } // false al rechazar/revocar
}));
```

Debe volver a comunicar el estado en cada navegación (sincronizar después del
montaje) y permitir revocarlo. La rama no trae una CMP ni una política legal.
GA4 no se carga hasta aceptar; no hay cola de eventos previos. **Desactivar en
la propiedad toda medición mejorada, captura automática de formularios/links,
Google Signals y datos proporcionados por usuarios**, y retirar etiquetas
duplicadas. `send_page_view:false` solo no desactiva toda medición mejorada.
El adaptador fija URL reducida, título fijo y referrer vacío. No activar GA4
sin revisar también las solicitudes automáticas del proveedor en navegador.

Plausible usa la API oficial de eventos con URL reducida y sin referrer,
cookies o propiedades personales. Esto reduce el payload; no equivale a
prometer que el proveedor no recibe IP/UA por la conexión de red. Validar el
tratamiento con SP. Crear el objetivo `sim_lead_accepted` en la cuenta elegida y
verificar recepción: un 202 de Plausible tampoco prueba que el evento se vea.

## Prueba de cierre con SP (todavía pendiente)

1. Elegir formulario, comprobar campos, privacidad, antispam, dominios y reglas
   de automatización. Acordar un contacto de prueba controlado y aislarlo de
   campañas/notificaciones reales antes del envío.
2. Desde el sitio de pruebas, simular → precio/esperas → contacto → consentimiento
   → enviar. Registrar hora, respuesta y envío, sin publicar PII en git/logs.
3. Dentro de HubSpot: ver envío fuera de spam, contacto correcto, resumen,
   consentimiento, origen y asignación. Repetir sin email y con contacto ya
   existente. Verificar qué deduplica y qué conserva como envío nuevo.
4. Simular rechazo, 429, 500, red caída, timeout y doble clic. Verificar que la
   falla no diga éxito, mantenga los campos y deje WhatsApp. Comprobar recepción
   real de un WhatsApp de prueba y su tratamiento en Comercial.
5. Probar consentimiento analítico aceptado/rechazado/revocado; revisar URLs,
   payloads y almacenamiento. Confirmar evento en el panel, sin contactos,
   búsquedas ni URLs de WhatsApp; conciliar contra el envío registrado.
6. Guardar evidencia privada y responsables que dieron conformidad. Recién
   entonces preparar build productivo. Este PR no aprueba publicar.

## Pruebas locales reproducibles

Resultado del 20/10: 14 pruebas unitarias y 13 escenarios de navegador
aprobados (4 sin CRM y 9 con respuestas interceptadas). Builds del prototipo
y de lanzamiento correctos; suite de lanzamiento sin errores. Se probaron
360/390/430/1280 px, consentimiento, doble clic, errores 400/429/500, red,
timeout, recuperación y ausencia de datos personales en eventos. Estos
resultados no sustituyen la prueba real de envío/contacto/asignación ni la
recepción en la cuenta de medición, que siguen pendientes.

`node --test qa/leads.test.mjs` valida transporte, timeout, consentimiento,
privacidad, configuración incompleta y adaptadores sin red.

`qa/qa-leads.mjs` sirve el export dentro del mismo proceso y recorre el
simulador a 360/390/430/1280 px. Intercepta todos los terceros. Prueba
aceptación, errores, consentimiento, doble clic, reintento, WhatsApp y payload
analítico. No crea contactos ni mensajes. `PW_PATH`/`PW_CHROME` apuntan a
Playwright/Chromium instalados **fuera del repo**.

Build sin variables: ejecutar con `MODE=fallback`, prefijo `/sp-prototipo`.
Build con configuración ficticia para probar CRM:

```bash
NEXT_PUBLIC_BASE_PATH=/sp-prototipo/lanzamiento \
NEXT_PUBLIC_EDICION=lanzamiento \
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=123456 \
NEXT_PUBLIC_HUBSPOT_FORM_ID=11111111-2222-3333-4444-555555555555 \
NEXT_PUBLIC_LEAD_FORM_APPROVED=true \
NEXT_PUBLIC_PRIVACY_URL=https://example.com/privacy \
NEXT_PUBLIC_LEAD_CONSENT_TEXT='Texto aprobado de prueba' \
NEXT_PUBLIC_ANALYTICS_APPROVED=true \
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=example.com npm run build
MODE=crm QA_PREFIX=/sp-prototipo/lanzamiento \
PW_PATH=<ruta-playwright> PW_CHROME=<ruta-chromium> node qa/qa-leads.mjs
```

Este export es solo para QA interceptada: **no se publica**. Construir de
nuevo sin variables ficticias antes de preparar cualquier entrega. Entre
builds, limpiar o mover `.next/` para no mezclar prefijos/configuraciones.

Referencias técnicas verificadas el 20/10/2026:
- [Forms API / definiciones](https://developers.hubspot.com/docs/api-reference/legacy/marketing/forms/guide)
- [Forms AJAX y consentimiento](https://developers.hubspot.com/changelog/2018-05-25-ajax-submission-endpoint)
- [Validación de campos del formulario](https://developers.hubspot.com/changelog/bugfix-form-field-validation-and-crm-properties)
- [Medición manual GA4](https://developers.google.com/analytics/devguides/collection/ga4/views)
- [Plausible Events API](https://plausible.io/docs/events-api)
