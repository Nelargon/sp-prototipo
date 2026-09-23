# Cómo publicar la v1 del sitio de Salud Protegida

**Para el equipo que la publica (Buenavista).** Una página, sin supuestos.
Última revisión: 23/09/2026.

## 1. Qué es esto

La v1 es la **edición de lanzamiento** del sitio: inicio, simulador, planes,
qué cubre y la Guía Médica. La maqueta de referencia está en
`https://nelargon.github.io/sp-prototipo/lanzamiento/`.

**No hace falta reprogramarla.** El sitio es HTML estático: se construye una
vez y sale una carpeta (`out/`) que se sube tal cual a cualquier hosting. No
necesita servidor, base de datos ni PHP. Copiarla a mano, pantalla por pantalla,
es el camino más largo y el más propenso a errores.

## 2. Cómo se construye

Requisito: Node 20.

```bash
npm ci
NEXT_PUBLIC_EDICION=lanzamiento \
NEXT_PUBLIC_BASE_PATH= \
NEXT_PUBLIC_INDEXABLE=true \
SITE_URL=https://saludprotegida.com.py \
npm run build
```

El resultado queda en `out/`. Se sube el **contenido** de esa carpeta a la raíz
del dominio.

| Variable | Qué hace | Valor para producción |
|---|---|---|
| `NEXT_PUBLIC_EDICION` | Deja afuera lo que todavía no se lanza (blog, Mi SP, agendar) | `lanzamiento` |
| `NEXT_PUBLIC_BASE_PATH` | Prefijo de las URLs. En la raíz del dominio va vacío | *(vacío)* |
| `NEXT_PUBLIC_INDEXABLE` | Permite que Google indexe. Sin esto, todo sale con `noindex` | `true` |
| `SITE_URL` | Dominio para canonicals, sitemap y datos estructurados | `https://saludprotegida.com.py` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` o `NEXT_PUBLIC_GA_ID` | Medición de visitas. Apagada si no se pone ninguna | ver §4 |

⚠ Entre dos builds, borrar `.next/` (`rm -rf .next`). Si no, el prefijo del
build anterior puede quedar pegado en los links, y eso no da error: solo queda
roto.

## 3. Requisitos del hosting

- Servir archivos estáticos con **barra final** en las URLs (`/simulador/` →
  `simulador/index.html`).
- Servir `404.html` cuando una dirección no existe (ya viene en `out/`).
- HTTPS.

## 4. Lo que hay que conectar antes de abrir

1. **Contactos del simulador → HubSpot.** Hoy el contacto viaja solo por
   WhatsApp: si la persona no toca el botón verde, se pierde. Crear el
   formulario en HubSpot (campos `firstname`, `phone`, `email`, `message`) y
   poner su ID en `HUBSPOT_FORM_ID` (`app/quote.js`). Con eso el contacto entra
   al CRM, y si el envío falla, sigue por WhatsApp.
2. **Medición.** Cada interacción llama a `track()` (`app/track.js`), que hoy
   solo escribe en la consola. Hay que conectarla a GA4 o a un endpoint.
   Regla del proyecto: **nunca** mandar nombre, teléfono, email ni lo que la
   persona escribe en los buscadores.
   Ojo con un evento: `sim_lead_submit` se dispara al tocar "Enviarme mi
   cotización", **antes** de que la persona mande el WhatsApp. El contacto
   enviado de verdad es `click_whatsapp {origen: 'simulador_lead'}` (o el CRM).
3. **Política de privacidad.** El sitio pide nombre, WhatsApp y email, y el
   pie todavía no tiene el link. Con GA4 también hace falta un aviso de
   cookies. Plausible no lo necesita. Esto lo tiene que validar Legal.
4. **Redirecciones desde la web actual.** Las URLs viejas que tengan tráfico
   (y las de campañas) tienen que redirigir a su equivalente nuevo.
   **Muy importante: el QR del carnet** lleva hoy a la guía médica de SIP. Si
   esa dirección cambia, el QR de cada carnet impreso tiene que seguir
   funcionando.
5. **Reserva de turnos por cédula** (la de la web actual): esta v1 **no** la
   reemplaza ni la incluye. Mientras SP no decida, no se apaga.

## 5. La Guía Médica

- Es `/guia-medica/` más una página por prestador (`/guia-medica/P-0001/`…).
- Los datos salen de la **planilla maestra de SP**. Para actualizar la red:
  SP edita la planilla, se corre `scripts/build-guia-medica.py` y se vuelve a
  construir. `lib/guia-medica.json` **nunca se edita a mano**.
- El script valida la planilla antes de escribir: si hay errores (un teléfono
  mal escrito, una ciudad en el departamento equivocado), no genera nada. Su
  informe dice qué altas, bajas y cambios trae la publicación.
- Es interina. El destino es leer la red del sistema de SP sin cambiar la
  pantalla. El formato de los datos está en el propio script.

## 6. Lo que no se toca sin SP

- Precios, coberturas y nombres de planes: esperan la **grilla oficial**
  (ver `HANDOFF.md`, guarda de datos).
- Los textos: están escritos con reglas de lenguaje precisas (por ejemplo,
  "tiempo de espera" antes que "carencia"). Si algo no entra en el diseño de
  ustedes, se consulta; no se reescribe.

## 7. Cómo verificar que quedó bien

```bash
# con out/ servido en http://localhost:8080/
PW_PATH=<playwright-core>/index.js node qa/qa-lanzamiento.mjs http://localhost:8080
```

Revisa las páginas a 360, 390 y 430 px y en escritorio: errores, desbordes,
links a módulos que no se lanzan, el menú móvil, las preguntas frecuentes, las
puertas de la guía y la búsqueda. Tiene que terminar en `✓ todo verde`.
