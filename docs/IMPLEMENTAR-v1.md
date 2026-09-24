# Cómo publicar la v1 del sitio de Salud Protegida

**Para el equipo que la publica (Buenavista).** Una página, sin supuestos.
Última revisión: 24/09/2026.

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

## 6. El sistema táctil: esquinas, relieve y movimiento

El sitio responde al toque con un solo lenguaje, que nació en la Guía Médica
(24/09/2026). Si se construye desde este repo, viene solo. Si se reimplementa
en otra tecnología, es poco lo que hay que copiar, y está todo en el bloque
«Sistema táctil» de `app/globals.css`:

| Pieza | Qué hace | Cómo se copia |
|---|---|---|
| Tokens `--sombra-*`, `--toque-gris`, `--mov-toque` | Dos alturas de sombra y la duración del toque | Al principio de `app/globals.css` |
| `.sq` + `--sq` | Esquina de curvatura continua | Cada elemento dice su radio con `--sq` |
| `.rel` / `.rel-btn` | Sombra de superficie / de control | La sombra va **solo** en lo que se toca o se abre |
| `.tactil` | El botón se hunde al apretarlo | Una clase en el contenedor de la página (y en la barra) |
| `a.boton` | Link con forma de cápsula o círculo que se hunde | Como `a.sq`, sin cambiar la forma |
| `.txt` | Una palabra del glosario se atenúa al tocarla | No se achica: movería la línea |
| `.tarjeta-toque` | La tarjeta entera se toca y se hunde completa (un poco menos que un botón: `.98`) | Dos formas: la tarjeta **es** el link (`<a class="tarjeta-toque">`), o tiene un link `.estirado` cuyo `::after` la cubre (necesita `:has()`) |
| `.oscuro` | Sobre fondo azul, la fila tocada se aclara en vez de oscurecerse (hoy, blog y Mi SP: fuera de la v1) | Redefine `--toque-gris`. Sobre azul no va `.rel`: la sombra no se ve |
| `Plegable` (`app/components/`) | Lo que se abre crece en vez de saltar | Grilla `0fr → 1fr`; cerrado, `inert` |
| `Hoja` (`app/components/`) | Hoja que sube desde abajo para elegir de una lista larga | Fondo, asa, «×», Escape y tocar afuera la cierran |

Tres cosas que no se pueden perder al copiarlo:

- **«Reducir movimiento» lo apaga todo.** Es una preferencia de accesibilidad
  del teléfono; hay personas que se marean con el movimiento.
- **Lo cerrado queda `inert`.** Un plegable cerrado o una hoja cerrada no
  tienen que recibir el Tab ni el lector de pantalla.
- **La esquina continua es una mejora progresiva.** Hoy solo la dibujan Chrome
  y Edge; Safari y Firefox muestran una esquina redondeada común del mismo
  radio. No hace falta hacer nada para que eso pase: sale del `@supports`.

## 7. Lo que no se toca sin SP

- Precios, coberturas y nombres de planes: esperan la **grilla oficial**
  (ver `HANDOFF.md`, guarda de datos).
- Los textos: están escritos con reglas de lenguaje precisas (por ejemplo,
  "tiempo de espera" antes que "carencia"). Si algo no entra en el diseño de
  ustedes, se consulta; no se reescribe.

## 8. Cómo verificar que quedó bien

```bash
# con out/ servido en http://localhost:8080/
PW_PATH=<playwright-core>/index.js node qa/qa-lanzamiento.mjs http://localhost:8080
```

Revisa las páginas a 360, 390 y 430 px y en escritorio: errores, desbordes,
links a módulos que no se lanzan, el menú móvil, las preguntas frecuentes, las
puertas de la guía y la búsqueda. Tiene que terminar en `✓ todo verde`.
