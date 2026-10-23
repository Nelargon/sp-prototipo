# Cómo publicar la v1 del sitio de Salud Protegida

> **Nota del 18/10/2026: quién publica cambió.** Este documento se escribió el
> 23/09/2026 (última revisión, 24/09) para la agencia (Buenavista), cuando la idea era que ella copiara
> la v1 en su sitio. El 29/09 Arturo decidió otra cosa: que SP la publique
> desde este repo, en Cloudflare Pages (`Nelargon/sp-interno#101`). Todavía no
> salió: hoy `main` se publica en GitHub Pages (`.github/workflows/deploy.yml`),
> con las dos ediciones del prototipo. Y «qué cubre» ya
> no es una página: desde el 05/10, `/que-cubre/` redirige a `/planes/`. El
> resto se conserva como se escribió. Lo vigente sigue en el `HANDOFF.md`:
> «🧭 DECIDIDO EL 29/09/2026» y «🔁 04/10/2026: UNA SOLA PÁGINA DE DETALLE».

## 0. Lo vigente para SP en Cloudflare Pages (23/10/2026)

> **Lo público espera.** Arturo, 23/10/2026: *«Todavía no podemos sacar lo
> público. Tenemos que preparar el espacio»*. Esta sección deja el espacio
> listo; no se conecta el dominio ni se prende la indexación sin su OK.

**La configuración del proyecto de Cloudflare Pages** (la conecta el dueño de
la cuenta de SP, `Nelargon/sp-interno#101`, pasos 2 y 3):

| Campo | Valor |
|---|---|
| Repositorio y rama de producción | este repo, **`produccion`** (no `main`: ver «Cómo sale un cambio al dominio», abajo) |
| Comando de build | `npm ci && npm run build` |
| Carpeta de salida | `out` |
| Node | 22, la de `.node-version`, la misma del CI |
| `NEXT_PUBLIC_EDICION` | `lanzamiento` |
| `NEXT_PUBLIC_BASE_PATH` | *(vacío)* |
| `SITE_URL` | `https://saludprotegida.com.py` |
| `NEXT_PUBLIC_INDEXABLE` | **no se pone** hasta que Arturo decida salir; recién ahí, `true` |

Cloudflare deja poner variables distintas para la producción y para las vistas previas. Con las de esta tabla solo en **producción**, las vistas previas por rama siguen mostrando el prototipo completo, como describe `docs/PREVIEW.md`.

**Cómo sale un cambio al dominio** (decisión de Arturo, 23/10/2026, 4A). `main`
sigue siendo el taller: cada PR se fusiona como hasta hoy y GitHub Pages
publica el prototipo y la maqueta de la v1. **Al dominio sale solo la rama
`produccion`, y `produccion` avanza solo con el «publicá» de Arturo.** El
porqué: hay varias sesiones fusionando por día, y en el dominio cada cambio lo
lee una familia que está decidiendo.
- Antes de pedirle el «publicá», se le muestra qué cambió desde la última
  publicación (`git log produccion..main`) y la maqueta de la v1 en GitHub
  Pages, que es el mismo código.
- Con su «publicá», una sesión confirma que el CI de `main` está verde en ese
  commit y adelanta la rama sin reescribir nada:
  `git push origin <commit>:refs/heads/produccion`. Nunca `--force`: si
  `produccion` no es ancestro de ese commit, algo raro pasó y se pregunta.
- El día que se conecte Cloudflare se crea `produccion` en el commit que Arturo
  apruebe; hasta entonces no existe, a propósito.
- Ninguna sesión empuja a `produccion` por su cuenta (regla en `CLAUDE.md`,
  «Flujo git»).

**Ese build ya se prueba en cada PR.** El CI construye la v1 con esas mismas
variables y corre `qa/produccion.mjs` y `qa/links-internos.mjs`. Controla que no
quede ninguna dirección con `/sp-prototipo`, que el sitemap y los canonical
estén en el dominio, que el botón «Revisión» no salga, que estén las
redirecciones y el 404, y que la indexación siga apagada. El día del cambio no
hay nada que adaptar: es el mismo build.

**Las redirecciones.** Las escribe `scripts/redirecciones.mjs` en
`out/_redirects`, solo en esta edición. La lista vive en
`scripts/redirecciones-lista.mjs`. Salió del sitemap público de la web actual
(WordPress, 37 direcciones, leído el 23/10/2026):
- `301` (permanente) para lo que el sitio nuevo reemplazó: `/que-cubre/` →
  `/planes/`.
- `302` (temporal) para lo que hoy no tiene casa en la v1 pero la va a tener:
  `/blog/`, las cuatro notas del blog viejo, etiquetas, categoría y autor
  llevan al inicio; `/contacto/` también; `/guia-para-el-asegurado/` lleva a
  la Guía Médica. Son temporales para poder cambiarlas el día que el blog salga
  sin que cada navegador recuerde la vieja.
- `301` para `/octubre_rosa/` → `/bases/octubre-rosa-2026/`: las bases de la
  promoción, con el texto literal de SP (`Nelargon/sp-interno#209`, 2A). Viven
  en `lib/bases.js`, que es también la casa de las bases de las promociones que
  vengan. Tienen que seguir en línea hasta enero de 2027: la promoción vence el
  04/11/2026 y el voucher vale 60 días desde que se recibe.
- `302` para `/login/` y `/dashboard/` → `https://turnos.saludprotegida.com.py/…`:
  la reserva de turnos, que se muda a su subdominio (`Nelargon/sp-interno#209`,
  1A). Es el único destino fuera del sitio, y el build solo acepta subdominios
  de SP por https. Temporal, por si un día la reemplaza una reserva nueva.
- `/planes/` y `/` no necesitan regla: son la misma dirección.
- ⚠ Lo que no se verificó: que Cloudflare aplique la regla de `/que-cubre/`
  aunque exista la página de aviso (`out/que-cubre/index.html`). Se mira en la
  primera vista previa de Cloudflare. Si no la aplica, el aviso igual lleva a
  `/planes/`.

**Lo que esperaba una decisión de Arturo** (`Nelargon/sp-interno#209`; el
control falla si algo de `NO_SE_REDIRIGEN` aparece en `_redirects`). El
23/10/2026 Arturo contestó «1A, 2A, 3A»: la reserva de turnos y las bases de
Octubre Rosa quedaron resueltas arriba, y la lista está vacía. Falta solo el
**QR del carnet** (3A): Arturo escanea uno y pasa la dirección. Si es de este
dominio, se suma su redirección antes del cambio.

**Antes del día del DNS: la reserva de turnos en su subdominio** (1A). La
reserva («Agendamiento») es un complemento del WordPress actual
(`appointment-scheduling` 1.4.1) que manda cada pedido a
`https://saludprotegida.com.py/wp-admin/admin-ajax.php`, por el nombre del
dominio (medido el 23/10/2026). Por eso no alcanza con crear el subdominio: si
el WordPress sigue llamándose como el dominio, la página de la reserva carga en
`turnos.` y los turnos no salen. Lo hace quien maneja hoy el servidor:
1. crear `turnos.saludprotegida.com.py` apuntando al servidor de hoy, con su
   certificado https;
2. cambiar la dirección del WordPress (`siteurl` y `home`) a
   `https://turnos.saludprotegida.com.py`, y su acceso de administración pasa a
   `turnos.…/wp-admin/`;
3. pedirle a Google que no indexe ese WordPress (Ajustes → Lectura): adentro
   sigue la web vieja entera, con planes y precios que ya no son los vigentes;
4. confirmar que los clientes entran con el mismo usuario de siempre;
5. correr `node scripts/antes-del-dns.mjs https://<proyecto>.pages.dev`: mira
   que la reserva responda en `turnos.`, que mande los pedidos ahí, que `/login/`
   lleve a ella desde Cloudflare y que las bases de Octubre Rosa estén
   publicadas. **Si no da verde, no se cambia el DNS.** Hoy da ✗, como tiene que
   dar: la reserva todavía vive en el dominio principal.

**El día del cambio de DNS** (`Nelargon/sp-interno#101`, paso 5): copiar
**exactos** del panel actual, antes de cambiar nada, todos los registros que no
son la web, y probar el correo antes y después:
- el `A` de `turnos.`, el nuevo (la reserva de turnos);
- `MX` y el `A` de `mail.` (el correo de SP);
- los `TXT`: el SPF, que incluye HubSpot, y el código de verificación de Brevo;
- los `DKIM` (`*._domainkey`) que tenga el panel: el correo del blog firma con
  `d=saludprotegida.com.py`;
- el `CNAME` de `marketing.`, que es la página de HubSpot a la que lleva hoy
  «Cotizá tu plan»;
- el `CNAME` de `www.`.

**Para el equipo que la publica (Buenavista).** Una página, sin supuestos.
Última revisión: 24/09/2026.

## 1. Qué es esto

La v1 es la **edición de lanzamiento** del sitio: inicio, simulador, planes,
qué cubre *(desde el 05/10, redirige a `/planes/`)* y la Guía Médica. La
maqueta de referencia está en
`https://nelargon.github.io/sp-prototipo/lanzamiento/`.

**No hace falta reprogramarla.** El sitio es HTML estático: se construye una
vez y sale una carpeta (`out/`) que se sube tal cual a cualquier hosting. No
necesita servidor, base de datos ni PHP. Copiarla a mano, pantalla por pantalla,
es el camino más largo y el más propenso a errores.

## 2. Cómo se construye

Requisito: Node 22 (el de `.node-version` y del CI).

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
| `.tactil` | El botón se hunde al apretarlo; **uno deshabilitado, no** | Una clase en el contenedor de la página (y en la barra). Chrome le aplica `:active` a un botón deshabilitado: la regla lo excluye con `:not(:disabled)` |
| `a.boton` | Link con forma de cápsula o círculo que se hunde | Como `a.sq`, sin cambiar la forma |
| `.txt` | Una palabra del glosario se atenúa al tocarla | No se achica: movería la línea |
| `.tarjeta-toque` | La tarjeta entera se toca y se hunde completa (un poco menos que un botón: `.98`) | Dos formas: la tarjeta **es** el link (`<a class="tarjeta-toque">`), o tiene un link `.estirado` cuyo `::after` la cubre (necesita `:has()`) |
| `.oscuro` | Sobre fondo azul, la fila tocada se aclara en vez de oscurecerse (hoy, blog y Mi SP: fuera de la v1) | Redefine `--toque-gris`. Sobre azul no va `.rel`: la sombra no se ve |
| `Plegable` (`app/components/`) | Lo que se abre crece en vez de saltar | Grilla `0fr → 1fr`; cerrado, `inert` |
| `Hoja` (`app/components/`) | Hoja que sube desde abajo para elegir de una lista larga | Fondo, asa, «×», Escape y tocar afuera la cierran; también deslizarla hacia abajo desde el asa o el título (se cierra pasado un cuarto de su alto o con un movimiento rápido) |

**Las esquinas se eligen por función**, no por número: `--r-xs` (10) chip, ícono chico o miniatura; `--r-sm` (12) botón, campo o ícono; `--r-md` (16) aviso o tarjeta chica; `--r-lg` (20) tarjeta grande o tabla. En este repo no queda ningún radio escrito a mano que se repita.

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
