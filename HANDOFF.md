# HANDOFF — Ecosistema digital de Salud Protegida

**Documento de pase de posta.** Si sos una persona (o una IA) retomando este
proyecto en una conversación nueva: leé este archivo primero. Acá está la
dirección, lo construido, las decisiones tomadas con su porqué, y los
pendientes priorizados. Complementa (no reemplaza) al `HANDOVER.md` original,
que documenta la implementación técnica de la página de planes.

> ⚠ **Antes de leer: actualizate.** Hay varias sesiones trabajando en
> paralelo y este documento cambia varias veces por día. Tu clon es una
> foto del momento en que arrancó tu contenedor. Corré
> `git fetch origin main && git checkout main && git pull`
> y recién entonces leé este archivo — una sesión que lee la foto vieja
> reporta un proyecto que ya no existe.

*Última actualización: julio 2026.*

---

## 👆 EL LENGUAJE TÁCTIL DE LA GUÍA PASA A TODO EL SITIO (24 sep 2026)

**Arturo, 24/09/2026, textual:** *«me gustaría que todo lo que revisamos, el
diseño inspirado en Apple y las mejoras realizadas, se extienda a toda la
web»*. Pidió el plan antes de construir y lo aprobó el mismo día
(*«Adelante!»*). Alcance: **lo que sale en la v1** (inicio, simulador, planes,
qué cubre, guía). Blog, agendar y Mi SP lo reciben cuando se lancen;
`/historia/` no.

**La idea que ordena el trabajo:** lo que hace que la guía se sienta Apple son
las reglas detrás de cada efecto (cada movimiento avisa algo; la sombra va solo
en lo que se toca). Extenderla es pasar esas reglas al resto del sitio, no
pegar efectos en cada botón.

### El plan, en cuatro PRs

| Paso | Qué | Fusión | Estado |
|---|---|---|---|
| 1 | **El sistema, sin cambio visible**: las reglas salen de `.gm` a clases de todo el sitio; `Plegable` y `Hoja` a `app/components/` | automática | ✔ PR #167 |
| 2 | **Inicio, barra y 404**: todos los botones se hunden, esquina continua, FAQ con `Plegable`, la tarjeta del simulador se toca entera, relieve según la regla | con el OK de Arturo: vio capturas de celular con 3 intensidades y eligió | ✔ PR #168, **B elegida por Arturo** (24/09) |
| 3 | **Simulador**: opciones de cada paso con relieve, «¿Preferís elegir tu departamento?» y «¿Cómo calculamos esto?» con `Plegable`, tarjeta del resultado con relieve | automática (aplica lo aprobado en el 2) | ✔ PR #169 |
| 4 | **Planes, Qué cubre y la ficha del prestador** | automática | ✔ este PR |

**✔ Completo el 24/09/2026**, los cuatro pasos el mismo día: toda la v1
(inicio, simulador, planes, qué cubre, guía, ficha y 404) habla el mismo
lenguaje táctil. Blog, agendar y Mi SP lo reciben cuando se lancen.

### Paso 2 (24/09): la intensidad la eligió Arturo, B

Se le mostraron tres intensidades en capturas de celular lado a lado y un
video en cámara lenta. Eligió la recomendada: *«Vamos con la B»*. **La B es la
intensidad del sitio**: los pasos 3 y 4 la aplican sin volver a preguntar.

| | Qué cambia |
|---|---|
| **A · Sutil** | El toque, la esquina continua y las preguntas que crecen. Las sombras quedan como hoy |
| **B · Como la guía** (recomendada) | A + la regla del relieve: las dos puertas (Qué cubre / Planes) y las preguntas llevan relieve; la tabla del comparador, que solo informa, pierde la sombra |
| **C · Más relieve** | B + los botones principales también flotan (`rel-btn`) |

Por qué la B y no las otras: es la regla que ya estaba aprobada en la guía, así
que el sitio habla un solo idioma. La C pone sombra en casi todo, y cuando todo
flota nada se destaca. La A dejaba la sombra en la tabla, que no se toca: lo
contrario de la regla. **Los botones principales (CTA) van planos**, como en
la guía.

Lo que hizo el paso 2:
- **El inicio y la 404 llevan `tactil`; la barra compartida (`Header.jsx`)
  también**, así que responde al toque en todas las páginas desde este paso.
  Fuera del inicio y la 404, lo único que cambia a la vista es la franja de la
  barra (medido con capturas: las diferencias caen solo en esa franja).
- **La tarjeta del simulador se toca entera** (`.tarjeta-toque` + `.estirado`):
  el link «Simulá tu plan» se estira sobre la tarjeta y la tarjeta se hunde
  completa, como las tarjetas de Apple. Resuelve un choque: la regla dice que la
  sombra va en lo que se toca, y esa tarjeta flota a propósito desde el 6/08
  (el fondo menta que corta la racha de azul). Ahora se toca, así que la sombra
  dice la verdad. El nombre para el lector de pantalla sigue siendo el del
  botón y el evento sigue siendo `cta_simulador {origen:'teaser'}`.
- **Tres piezas nuevas del sistema**, cada una con su porqué: `a.boton` (link
  con forma de cápsula o círculo que se hunde, como el WhatsApp flotante),
  `.txt` (una palabra del glosario se atenúa en vez de achicarse: una palabra
  que se achica mueve la línea) y la tarjeta que se toca entera.
- **Las respuestas de la FAQ están en el HTML aunque estén cerradas**
  (`Plegable`, `inert`). `qa/qa-lanzamiento.mjs` ya no busca el texto en la
  página, porque ahora estaría siempre: mira que la respuesta abierta tenga
  alto y no esté `inert`, y que al cerrarse vuelva a `inert`.
- **Salió el script del `.lift`** del inicio (no encontraba a nadie). La clase
  `.lift` salió de `globals.css` en el paso 4, cuando dejó de usarla `/que-cubre`.

### Paso 3 (24/09): el simulador

- **`/simulador/` lleva `tactil`**: todo botón se hunde, «Empecemos» y los
  «Continuar» incluidos (se les sacó la `transition:background` suelta, que le
  pisaba el toque).
- **Controles con `rel-btn`**: las opciones de cada paso (`sim-opt`), los
  botones de ± de edades y personas, las cápsulas de ciudad y los planes del
  mini-comparador. **Lo elegido va plano** (como en la guía): el plan del
  resultado y una cobertura adicional marcada pierden el relieve, se ven
  «apretados». Las coberturas adicionales hoy no se muestran (los planes
  vigentes no tienen), pero ya siguen la regla.
- **Superficies con `rel`**: el buscador de ciudad y su lista (que perdió su
  sombra suelta de 34px). Las filas de ciudad y de departamento son `.fila`.
- **Crecen en vez de saltar**: «¿Preferís elegir tu departamento?» y «¿Cómo
  calculamos esto?» (`Plegable`, con `aria-controls`).
- **«Lo que te estarás preguntando»** solo informa: sus tarjetas pierden la
  sombra (ya tenían borde).
- **`qa/qa-integral.mjs`** ya no cuenta lo que está dentro de un bloque `inert`
  en el control de foco visible: daba 7 falsos «sin foco» por los links de las
  respuestas cerradas de la FAQ (efecto del paso 2). Antes/después del paso 3:
  mismos hallazgos, menos ese. BITACORA cap. 87.

### Paso 4 (24/09): Planes, Qué cubre y la ficha

- **`/planes/` y `/que-cubre/` llevan `tactil`.** La ficha del prestador ya
  era del sistema desde la guía.
- **Las tablas informan**: sin sombra, con esquina continua.
- **Las tres tarjetas de plan de `/que-cubre` pierden la sombra y el `.lift`**
  (se levantaban al pasar el mouse). No se hicieron tarjetas que se tocan
  enteras porque tienen palabras del glosario adentro: el link estirado las
  taparía. Regla: una tarjeta se toca entera solo si lo único que se toca
  adentro es su link.
- **El buscador de `/que-cubre` lleva `rel`** y su panel pierde la sombra: el
  relieve va en el campo, que es lo que se toca. Las cápsulas de búsqueda
  («Resonancia», «Hemograma»…) son controles: `rel-btn`, y se les sacó la
  transición suelta que le pisaba el toque.
- **Sale la clase `.lift`** de `globals.css`: ya no la usa nadie.
- `qa-integral` antes y después: mismos hallazgos. El CLS de `/que-cubre`
  (0,15, sobre la vara de 0,1) **ya estaba antes** del sistema táctil y sigue
  igual: queda como pendiente aparte.

### Qué se extiende y qué no

| De la guía | ¿A todo el sitio? |
|---|---|
| El botón se hunde al tocarlo (`.tactil`) | Sí, en todos |
| Esquina continua (`.sq` + `--sq`) | Sí, en tarjetas, botones y buscadores. **Cápsulas y círculos quedan como están** |
| Relieve (`.rel` superficies, `.rel-btn` controles) | Sí, con la misma regla: **lo que solo informa no lleva sombra** |
| Lo que se abre crece (`Plegable`) | Sí: todo `{abierto && (…)}` que hoy aparece de golpe |
| Hoja que sube (`Hoja`) | **Solo para elegir de una lista larga.** Fuera de la guía casi no hay casos; no se fuerza |
| Fondo gris claro (`--gm-fondo`) | **No.** Es para pantallas donde se recorre una lista; el inicio tiene su ritmo blanco/menta/azul |

### Cómo se aplica a una página (receta para los pasos 2 a 4)

1. `tactil` en el contenedor raíz de la página: todos sus botones se hunden.
   Un link con forma de botón lleva `sq`; si es cápsula o círculo, `boton`.
   Una palabra que abre algo dentro de una frase, `txt`. Una tarjeta cuyo
   único destino es un link: `tarjeta-toque` en la tarjeta y `estirado` en el
   link (el `data-rv` va en un envoltorio, no en la tarjeta: su transición le
   pisaría la del reveal). Solo si lo único que se toca adentro es ese link:
   una palabra del glosario dentro de la tarjeta quedaría tapada.
2. `className="sq"` + `--sq:<radio>` en lugar de `border-radius` en tarjetas,
   botones y buscadores. Nunca en `--r-pill` ni en `50%`.
3. `rel` o `rel-btn` según la regla; borrar la sombra suelta que tuviera.
4. Cada `{x && (<div>…</div>)}` que se despliega → `<Plegable abierto={x}>`.
   Ojo: el contenido pasa a estar en el HTML aunque esté cerrado. En la FAQ
   del inicio eso es bueno (Google lee las respuestas y Buenavista no tiene
   que armar nada), pero `qa/qa-lanzamiento.mjs` hoy las revisa
   desplegándolas: hay que ajustar esa verificación en el mismo PR.
5. Verificar con capturas antes/después y estilos medidos en el navegador.

### Lo medido para el paso 2 (en el código, 24/09)

- Fuera de la guía, **ninguno de los 129 botones y links de la v1 responde al
  toque** (solo el deslizador del simulador).
- **26 sombras distintas** y **136 esquinas** escritas a mano en las páginas
  de la v1.
- **El `.lift` del inicio no funciona (medido en el navegador, 24/09):
  0 de las 8 tarjetas con sombra lo recibe.** El script de `app/page.jsx`
  busca `border-radius: 16|20|22px` en el `style`, y desde la tokenización del
  6/08 las tarjetas dicen `var(--r-*)` o tienen radios que no están en la
  lista (18px, 26px). Además, en celular (77% del tráfico) no hay mouse: el
  toque es lo que se siente. En el paso 2 el script sale y la tarjeta que se
  toca lleva su clase explícita.

### Cómo se verificó el paso 1

- **48 capturas idénticas píxel por píxel** (umbral 0) contra `main`: inicio,
  simulador, planes, qué cubre, 404, ficha, guía con búsqueda, «Visar una
  orden», «Ver todas las especialidades» y las dos hojas abiertas, a 360, 390,
  430 y 1440 px.
- Estilos medidos en el navegador iguales: sombras, esquinas, transiciones, el
  toque (`scale(.97)` y la sombra aplastada), plegables y hojas cerradas `inert`.
- **Se corrigió un error: «reducir movimiento» no apagaba el toque.** La regla
  que lo apagaba (`.gm button:active`) pesaba menos que la que lo prende
  (`.gm button:not(.fila):active`), así que el botón se seguía achicando. Este
  documento decía que se apagaba; el navegador decía que no. BITACORA cap. 85.
- Las clases funcionan fuera de la guía (probado en `/planes/` con elementos
  de prueba). Las dos ediciones se construyen y `qa-lanzamiento` da todo verde.

## 🩺 LA GUÍA MÉDICA CAMBIA DE CARA: «SÍNTESIS CON CÁPSULAS» (23 sep 2026)

Arturo eligió el diseño en un lienzo de diseño (claude.ai, «Guía Médica SP · 5
caminos»: cinco caminos, cuatro variantes sobrias, dos síntesis y tres
esquinas). Sus pedidos, textuales en la conversación del 23/09:
- **Lo que cuenta es la especialidad y la zona.** El plan es un **filtro**, y la
  tarjeta del prestador dice sola con qué planes se usa: con plan elegido,
  «✓ Atiende con Silver»; sin plan, una línea gris «Planes: …».
- **Sin totales de prestadores** en ningún lado ("Ver más" sin número).
- **Fondo gris claro** (`--gm-fondo` #F4F5F6) y **cápsulas más chicas**.
- «Lo que más se busca» (de la opción A) y la **tira de zonas** (Todo el país ·
  Asunción · Central · Interior). Central abre sus ciudades; Interior abre los
  departamentos y, elegido uno, sus ciudades.
- **«Visar una orden»**: botón junto al título y enlace en las tarjetas de
  laboratorios y estudios. Abre qué tiene que tener la orden (textos de la hoja
  Contenido de la planilla) y el WhatsApp con el mensaje escrito.
- **Esquina de curvatura continua** (opción 2 del lienzo): clase `.sq` con
  `--sq` en `app/globals.css`, con `@supports (corner-shape: squircle)`.
  ⚠ Hoy solo la dibujan **Chrome y Edge**; en **Safari (iPhone) y Firefox** se ve
  una esquina redondeada común del mismo radio. Arturo lo sabía al elegirla.

**El buscador entiende síntomas** (`interpretar()` en `lib/red-medica.js`):
«me duele la cabeza» → Clínica Médica y Neurología, con una línea de por qué;
«mi hijo tiene fiebre» → Pediatría; «dolor de pecho» → cartel rojo de
emergencia con la ambulancia. Es un diccionario, no IA: previsible, sin costo,
el texto no sale del teléfono y no va a la analítica.
**⚠ GUARDA: antes de la v1 real lo tiene que revisar un médico** (idealmente la
dirección médica de Lister). La guía orienta a quién ir; no diagnostica.

**«Lo que más se busca» tiene un orden PROVISORIO** (no hay medición: `track()`
no está conectado). Cuando lo esté, sale de `guia_filtro {campo:'esp'}` de la
semana. Arturo pidió también «los profesionales más buscados»: **no se hizo**
(manda más pacientes al médico ya lleno, genera reclamos de prestadores y se
realimenta solo). Queda para decidir con él.

**Qué se fue del diseño anterior:** la tarjeta azul de Lister (ahora es una
fila en «Lo que más se busca»; sus horarios aparecen al buscar «lister»), los
botones de tipo (Profesionales / Sanatorios) y los desplegables de
especialidad y departamento. Los links viejos (`?plan&esp&dp&c`) siguen
funcionando: el departamento se traduce a su zona.

**Movimiento, a la manera de Apple (24/09/2026, pedido de Arturo: «aplicalos
directo a la guía»).** Tres gestos, y cada uno avisa algo:
- **Al apretar, el botón se hunde** (`scale(.97)`, 0,12 s). Las filas de lista
  se oscurecen en vez de achicarse.
- **Lo que se abre crece** en vez de saltar: `Plegable` en `GuiaMedica.jsx`
  (grid `0fr → 1fr`), usado en «Visar una orden», «Ver todas las especialidades»
  y cada grupo. Cerrado queda `inert` (el lector de pantalla y el Tab no entran).
- **Especialidad y plan se eligen en una hoja que sube desde abajo**
  (`Hoja`): fondo oscurecido, asa, «×», Escape o tocar afuera la cierran, y
  bloquea el scroll de atrás. La de especialidad trae buscador propio.
Todo dura menos de 1/3 de segundo y se apaga con «reducir movimiento» del
sistema (el toque recién desde el 24/09: ver arriba). CSS en `app/globals.css`,
bloque «Sistema táctil» desde el 24/09 (antes, «Movimiento», solo de la guía). La hoja todavía **no
se arrastra con el dedo** para cerrarla: se cierra con la «×» o tocando afuera.

**Relieve (24/09/2026, Arturo: «me gusta que le diste tridimensionalidad»,** por
la zona elegida que flota sobre su riel). Regla: **el relieve dice «esto se toca
o se abre»**. `.rel` (sombra suave) para superficies: tarjetas, listas, buscador.
`.rel-btn` (sombra más marcada) para controles como Especialidad y Tu plan, que
al apretarse se aplastan contra la página; las cápsulas de ciudad y plan también
la llevan. Lo que solo informa (el «por qué» del síntoma) **no lleva sombra**:
gana contraste con color, borde y un ícono de idea. Una sombra ahí lo haría
parecer un botón.

**Ciudad: un buscador que completa (24/09/2026, pedido de Arturo).** La pared
de cápsulas de ciudades y departamentos se fue. Ahora hay un solo campo,
«Tu ciudad o localidad» (`BuscaCiudad` en `GuiaMedica.jsx`, combobox ARIA):
- al tocarlo sin escribir, lista las ciudades de la zona elegida, primero las
  que tienen más red;
- al escribir, busca en todo el país sin tildes y resalta lo que coincide;
- tiene alias (`ALIAS_CIUDAD`): cde, asu, fdo, mra, pjc, slo;
- el Interior ofrece «Todo Itapúa» y los demás departamentos;
- elegir una ciudad pone la zona sola y la URL no cambia de forma (`z`, `dp`, `c`).

Solo lista ciudades con alguien en la red. **Pendiente posible:** los barrios de
Asunción (Villa Morra, Recoleta…), que la planilla ya tiene pero hoy no filtran.

**Marcas internas de especialidades (24/09/2026, pedido de Arturo, solo en el
prototipo).** Sirven para ver, mientras se prueba, qué falta completar:
- **punto naranja con número**: filas de esa especialidad en «Revisar» en la
  planilla;
- **círculo naranja hueco**: está en el catálogo pero no quedó nadie publicado.
  Hoy es solo **Anestesiología**, y hay que decidir si se completa o se saca del
  catálogo.

Las vacías viajan en `meta.sin_prestadores` del JSON (las escribe
`build-guia-medica.py`). Con `CON_MARCA_REVISAR` apagado (la v1) no se ve
ninguna marca ni aparece la especialidad vacía; está verificado en la edición de
lanzamiento.

## 🔄 LA V1 CAMBIA DE FORMA: ENTRA LA GUÍA, SALE AGENDAR (23 sep 2026)

**Arturo, 23/09/2026, textual:**

> *"La agenda de turnos aún no la lanzaremos, pero podemos crear una versión
> preliminar. También volveremos a incorporar la guía médica. Lo que haré es
> enviarte la guía médica actual, ya sea en PDF o Excel, y tú la adaptarás
> hasta que podamos integrarla directamente en el sistema."*

Y ante la pregunta de qué hacer con la versión preliminar de agendar, eligió
**dejarla fuera de la v1**.

| | Hasta el 22/09 | **Desde el 23/09** |
|---|---|---|
| `/agendar/` en la v1 | publicada, puerta del cliente | **fuera de la v1**; sigue en el prototipo como versión preliminar |
| Guía Médica en la v1 | fuera (`CON_GUIA` apagado) | **entra**, con la red real que manda Arturo (PDF o Excel) |
| Puerta del cliente del hero | "Ya soy de SP · Pedí tu turno" → agendar | pasa a la Guía Médica |
| Botón de la barra | "Agendar un turno" | vuelve a "Guía Médica" |
| FAQ "¿vale en todo el país?" / "¿está mi médico?" | las contesta un asesor por WhatsApp | pueden volver a contestarse con la guía |

**✔ Aplicado el mismo 23/09** (llegó la planilla maestra:
`20260923_SP_Planilla_GuiaMedicaMaestra_v1.xlsx`, guardada en
`sp-interno/project/guia-medica/` porque trae Observaciones internas).

### Cómo quedó la Guía Médica real

| Pieza | Dónde |
|---|---|
| Datos públicos (sin Observaciones) | `lib/guia-medica.json` — **generado, no editar a mano** |
| Cómo se generan | `scripts/build-guia-medica.py <planilla.xlsx>` (openpyxl fuera del repo) |
| Búsqueda y filtros (puro, se prueba con node) | `lib/red-medica.js` |
| Buscador + filtros + Lister | `/guia-medica/` (`app/guia-medica/GuiaMedica.jsx`) |
| Ficha estática por prestador (674) | `/guia-medica/P-0001/` … (`app/guia-medica/[id]/page.jsx`) |
| El molde viejo (datos ilustrativos, "Ver mi red" por CI) | `guia/`, **solo en el prototipo** (`CON_GUIA_DEMO`) |

- **Números (planilla al 23/09/2026):** 847 filas → 839 publicadas, 674
  prestadores, 79 ciudades, 17 departamentos. Quedan afuera 7 filas que solo
  figuran en la Centralizada y la leyenda de Anestesiología (no es un
  prestador: viaja como nota de la especialidad).
- **El filtro es "¿Qué plan tenés?", no "desde qué plan".** Cada guía en PDF es
  una red; Silver y Gold comparten la misma y lo que cambia es cuánto cubren.
  El molde viejo suponía Gold ⊇ Silver ⊇ Bronze, y eso no es cierto para la
  red. Opciones: SP Esencial en sus 3 zonas (= "Essential" de los PDF,
  confirmado por Arturo el 23/09), Silver/Gold/Bronze, Vital, Bienestar/
  Superior/Integral/Primordial (las 3 últimas usan la misma red) y Plan
  Estatal. **La Centralizada no se publica** hasta saber qué planes cubre.
- **"Revisar" (185 filas):** se publican como en el PDF. En el **prototipo**
  llevan un **punto naranja** (pedido de Arturo: *"como señal para que veamos
  que se debe revisar de forma interna"*); la v1 no lo muestra
  (`CON_MARCA_REVISAR`).
- **Odontología:** la red tiene odontólogos (incluido el centro de Lister) y
  `/que-cubre` dice que el dentista no entra en Bronze/Silver/Gold. La guía no
  afirma cobertura: en esas filas dice *"Antes de ir, preguntá a tu asesor qué
  cubre tu plan en odontología"*. Falta que SP diga qué cubre cada plan.
- **Teléfono de Lister:** ~~la guía usa el (021) 220 199~~ → **resuelto el
  23/09: (021) 319 0000**, como todo SP (ver abajo, "Teléfonos de SP").
- **Privacidad:** el texto buscado no viaja a la analítica (solo el largo), igual
  que en `/que-cubre`.

**Para actualizar la red:** SP edita la planilla → se corre el script → PR con
el JSON nuevo. La planilla manda.

### Arreglos de la revisión del 23/09 (lo que no dependía de un dato de SP)

- **"Más de 50 prestadores" → "más de 600 médicos, sanatorios y laboratorios
  en 79 ciudades"** en el home (cobertura, FAQ). Sale de la planilla: 615
  prestadores en la red de Silver/Gold, 674 en total.
- **"Odontología" salió de la tira de prestadores** del home: contradecía a
  `/que-cubre` (el dentista no entra en Bronze/Silver/Gold).
- **"Carencia" ya no va primero**: la FAQ pregunta "¿Cuánto tengo que esperar
  para usar mi plan?", y las tablas de `/que-cubre` dicen "Tiempo de espera
  para maternidad (carencia)". Mismos números; cambia solo cómo se muestran.
- **Moneda única**: las tablas de `/que-cubre` pasan de "Gs." a "₲" al
  mostrarse (el dato del master no se toca).
- **Simulador**: el WhatsApp del contacto decía "Para: para vos" (la persona
  hablándole a SP de "vos") y el desglose decía "Cobertura para para vos".
  Ahora el mensaje va en primera persona (`grupoPropio` en `app/quote.js`).
- **`/planes` en celular**: la columna del servicio es angosta y queda fija al
  deslizar, y hay un aviso de "Deslizá para ver Silver y Gold".
- **Condiciones de la guía, en idioma de cliente** (`condicionTexto` en
  `lib/red-medica.js`): "Atiende desde los 12 años" se leía ambiguo (Arturo:
  *"¿qué quiere decir que atiende desde los 12 años o 12 meses?"*) → "Atiende a
  pacientes desde los 12 años de edad". Y las condiciones que listaban planes
  internos ("Privilege", "essential", "centralizados") pasan a "Confirmá con tu
  asesor si atiende con tu plan". La planilla no se toca.
- **404 en español** (`app/not-found.jsx`), con salida al simulador, la guía y
  el inicio. Antes era la de Next, en inglés y sin salida.
- **`docs/IMPLEMENTAR-v1.md`**: cómo publicar la v1 sin reprogramarla (es HTML
  estático), qué conectar (HubSpot, medición, privacidad, redirecciones, el
  QR del carnet) y qué no tocar.

### El puente simulador ↔ guía (23/09/2026, pedido de Arturo)

- **Del simulador a la guía:** en el resultado, la nota de red dice cuántos
  médicos y centros tiene ese plan en la ciudad elegida ("En Luque tenés 17
  médicos y centros de la red de este plan") y abre la guía ya filtrada por
  plan, departamento y ciudad. Si en la ciudad no hay, da el número del
  departamento; si en el departamento tampoco, lo dice y manda al asesor.
  Evento: `sim_guia {origen:'resultado'}`.
- **Los números salen de `lib/red-resumen.json`** (conteos por red, depto y
  ciudad), generado por el mismo `scripts/build-guia-medica.py`. El simulador
  no carga la red entera. Lógica en `lib/red-zona.js` (incluye los dos nombres
  de ciudad que `app/geo.js` escribe distinto que la planilla).
- **La guía cuenta igual:** "N médicos y centros" (prestadores distintos), y
  suma "· M resultados" cuando un mismo médico ocupa más de una tarjeta. Así
  el número del simulador y el de la guía coinciden.
- **De la guía al simulador:** al pie de la guía, "¿Todavía no tenés plan?"
  con "Simulá tu plan" (`cta_simulador {origen:'guia'}`), y una línea igual en
  cada ficha.
- **Reemplaza a `redNota` de `app/geo.js`**, que decía "la red está creciendo"
  fuera de Asunción/Central. La planilla la desmintió: hay red en 17
  departamentos (BITACORA cap. 80). `redNota` ya no se usa.

### "¿Qué plan tenés?" en botones de dos pasos (23/09/2026)

Arturo, mirando el desplegable de 8 planes: *"Esta parte no se ve super bien,
u ordenado."* Eligió, entre tres opciones, **botones en dos pasos**: SP
Esencial · Bronze, Silver, Gold · Vital · Otro plan (orden pedido por Arturo el
23/09: *"que sea 'Bronze, Silver, Gold'"*). Esencial abre una
segunda fila con la zona; "Otro plan" abre Bienestar, Superior, Integral,
Primordial y Plan Estatal. 4 en fila en escritorio, 2×2 en celular
(`.gm-planes`). La estructura vive en `GRUPOS_PLAN` (`lib/red-medica.js`).
Los links viejos (`?plan=otros`, `?plan=vital` del simulador) siguen
funcionando y marcan su botón.

### Lister: se detecta por la dirección, no solo por la palabra (23/09/2026)

El code review encontró que `build-guia-medica.py` marcaba "En Lister,
centro propio" solo si la fila decía "lister". Cinco filas en Pa'i Pérez 630
dicen "C.M. Salud Protegida" y quedaban afuera: Dra. Penayo Aguilera
(Dermatología), Dra. Caballero (Neumología) y tres nutricionistas. Ahora vale
cualquiera de tres señales: la palabra, la dirección (Pa'i Pérez 630) o que la
hoja «Lister» de la planilla nombre la fila. Son 94 filas de Lister (antes, 89).
Además, el buscador indexa "lister" en toda fila marcada, así que el botón
"Ver sus profesionales" las encuentra a todas.

### Primera corrección oficial de la grilla: el ecocardiograma (18/09 → 23/09/2026)

SP (correo del 18/09, "Corrección de nomenclatura – Cobertura Plan
Bronze", pág. 27 del cuadernillo) marcó que el ecocardiograma estaba dos veces
con nombres distintos. Quedó así en `/que-cubre`:
- **Se borró** `ECOCARDIOGRAFIA` (Bronze con copago, 60 días).
- **Queda** `ECOCARDIOGRAMA` (antes "ECOCARDIOGRAMA SIMPLE"): Bronze cubierto,
  1 por año, 90 días de espera. Quien busca "ecocardiografía" lo encuentra igual.

**Cómo se aplica:** la grilla JSON sigue siendo la copia fiel del master. La
corrección vive en `CORRECCIONES` (`scripts/build-prestaciones.mjs`), con su
fuente. Si el master se corrige y la fila desaparece, el script corta: así se
sabe que hay que sacar la corrección. **Las próximas correcciones de SP van ahí,
con la misma forma.** Una fila de la grilla vale para los tres planes, así que
el cambio también alcanza a Silver y Gold.

### La Guía Médica se publica con control (23/09/2026, acordado con Cowork)

Había **dos conversores con reglas distintas**: el de Cowork
(`validar_y_exportar_guia.py`, publicaba la Centralizada y no marcaba Lister) y
`scripts/build-guia-medica.py`. Queda uno solo, el de acá, con los controles del
de Cowork portados todos:
- **Frenan:** ID fila vacío o repetido (el ID prestador se repite a propósito),
  ID prestador, Estado y Tipo válidos, especialidad y departamento contra
  Catálogos, ciudad coherente con su departamento, formato de teléfono, fila
  marcada en al menos una guía, dirección/ciudad/departamento vacíos, columnas
  de guías con algo distinto de «Sí».
- **Solo avisan:** sin teléfono, profesional sin título, posible repetido,
  ciudad o barrio fuera de Catálogos. Las filas «Aviso» no llevan teléfono ni
  dirección y no frenan.
- **Informa** las reglas que aplicó (qué guías, Centralizada afuera con sus
  filas, «Revisar» adentro, Lister) y qué cambia contra la publicación anterior.
- **Publica con el OK de Arturo:** el PR de datos no se fusiona solo.

Con la planilla del 23/09: 0 errores, 4 avisos (los mismos que daba el de
Cowork), 0 cambios contra lo publicado.

**Dónde se edita:** solo el Excel del Drive de Arturo (fileId en
`sp-interno/README.md`). Cowork no genera JSON ni copias.

**Teléfonos de SP (Decisiones 23/09, n.º 1):** el (021) 319 0000 es línea y
WhatsApp para todo. Se buscaron los seis WhatsApp viejos (0981 494 495,
0986 605 500, 0981 494 435, 0982 797 800, 0985 380 515, 0986 422 274), con y sin
espacios y con +595, en los tres repos y en la planilla: **no aparecen en
ningún lado**.
**Actualización (23/09, Arturo):** *"El número es para todo. Incluso
teleconsulta y Encarnación"*, y **Lister también**. La tarjeta de Lister de la
guía ya llama al (021) 319 0000 (usa `SP_TEL` de `app/quote.js`). Falta la
planilla: las 61 filas de Lister con +595 21 220 199, la nota de la hoja
«Lister» y el representante de Encarnación (0983 593 439, hoja Contenido) se
cambian en el Excel del Drive; después se regenera la guía con su informe y
el OK de Arturo. Teleconsulta (0981 745 667) no aparece ni en el sitio ni en la
planilla.

### Lo que sigue esperando a SP (no se inventa)

| Pendiente | Quién |
|---|---|
| Grilla oficial: Bronze → Esencial, precio por zona (guarda de datos) | SP |
| Qué cubre cada plan en odontología | SP |
| Qué planes usa la red Centralizada | SP |
| Qué aliados quedan en la tira de logos (el directorio pidió podarla) | Arturo |
| "La más elegida" en Silver: ¿hay dato de ventas? Si no, cambiar la etiqueta | Comercial |
| "SP Senior" y "Plan Vital" en la misma tarjeta: ¿cuál es el nombre? | Arturo |
| Política de privacidad (el sitio pide nombre, WhatsApp y email) | Legal |
| Ecocardiograma, dos dudas: (1) ¿"ECOCARDIOGRAMA CON DOPPLER DE BASOS DE CUELLO" estaba en rojo? Sigue publicado. (2) En Gold, la fila borrada decía "Ilimitada" y la que queda dice "1 por año": ¿cuál vale? | SP (quien mandó la corrección) |
| 619 nombres de estudios en MAYÚSCULAS sin tilde en `/que-cubre` | llegan así de la grilla: corregir con la grilla nueva |

**Guardas que siguen valiendo:**
- La **Guía Médica pública no incluye "Ver mi red" por cédula**: eso es Mi SP,
  que sigue fuera de la v1.
- Si el listado de la red viene **por plan**, choca con la guarda de datos de
  abajo (Bronze dado de baja, grilla oficial pendiente). No renombrar planes a
  mano.
- La reserva de turnos por cédula de la web vieja (la que Buenavista está
  migrando) no se toca desde acá.

---

## ⚠ LEER PRIMERO — `/lanzamiento/` ES UNA MAQUETA, NO NUESTRO SITIO (16 sep 2026)

**Arturo, 16/09/2026, textual:**

> *"Nuestro /lanzamiento/ es la maqueta que Buenavista tiene que implementar en
> el sitio de ellos. Esta es la versión que nosotros queremos construir hasta
> que estemos dispuestos a abrir los demás módulos. De una vista, lo que tiene
> que hacer es literalmente copiar y lanzar esto como la página oficial,
> limpiando cualquier problema técnico que haya en la página y asegurándose de
> que funcione muy bien."*

Esto cambia qué es "terminar" en este repo:

| | Lo que creíamos el 15/09 | **Lo que es** |
|---|---|---|
| `/lanzamiento/` | el sitio público de SP | **la maqueta de referencia** |
| Quién publica | nosotros, en Pages | **Buenavista, en su sitio** |
| Dominio, hosting, indexación | pendiente nuestro (#9) | **de ellos** |
| Qué entregamos | un sitio | **una página copiable, sin deuda técnica** |

**Consecuencia de trabajo:** "copiable" pasa a ser un requisito de diseño, no
un detalle. Arturo, en el directorio del 15/09: *"la empresa que me hace diseño
web, ustedes tienen esto en mi GitHub, copien y peguen. Hasta eso les cuesta
hacer eso porque hay muchas piezas envueltas."* Cada pieza que agregamos la
tiene que poder reimplementar otro equipo, en otra tecnología, con apuro. Si
una sección es difícil de copiar, es una sección que no va a llegar al cliente.

---

## ✂️ LA PODA DEL HOME — opción B (16 sep 2026, elección de Arturo)

Arturo eligió la **opción B** de las tres que se le presentaron, y dijo por qué:
*"Quiero ir con la opción B, porque me gustaría el espacio propio para el
simulador."* O sea: **el simulador NO se embebe en el home**; se queda en
`/simulador/`, con ruta propia. Eso descarta la opción A, que lo subía a la
primera pantalla.

**Todo lo podado va detrás de `ES_LANZAMIENTO`, no se borra.** El prototipo
completo conserva cada bloque con su comentario y su porqué; la v1 es la que
adelgaza. Así ninguna decisión de meses se pierde por un lanzamiento.

### Medido, no estimado (Chromium 390 × 844)

| | Antes | Después |
|---|---|---|
| Alto del home | 13,1 pantallas | **11,5 pantallas** |
| Palabras | 1.356 | **1.147** |
| Rutas publicadas | 9 | **8** |

Qué salió de la v1: los **diferenciadores** ("Lo que casi nadie te garantiza"
— Arturo en el directorio, mirando esa sección: *"esto voy a borrar, esto no
está, no está planeado"*, y la dec. 12e ya la marcaba como bloque que vende
producto sin camino al simulador); la **caja del parto** (la FAQ contesta el
mismo dato: se dice una vez en vez de dos); las **promesas "muy pronto" y
"próximamente"** de la tira de aliados (regla de la estrategia); y el link
**"Ver la historia completa"** de la sección "Por qué importa".

### ⚠ El número que prometí era optimista — corregido

Al presentar las tres opciones dije que la B llegaba a **8,3 pantallas**. Es
falso, y conviene que quede escrito por qué: esa proyección suponía podar el
comparador de 4,0 a 1,5 pantallas. Medido por dentro, el comparador no tiene
1,5 pantallas de relleno — tiene las tres tarjetas de plan (1,12), la leyenda
de copago, la garantía común, la puerta a `/que-cubre`, lo que no se cubre, la
banda Vital y el bloque de dónde te atendés. **Podarlo a 1,5 no es podar: es
sacar respuestas.**

Y el aire tampoco era la explicación: en móvil las secciones ya están en 44px
de padding, 1,2 pantallas en total sobre 13. **La longitud de este home es
contenido, no espacio.**

**El techo real de la opción B, respetando la guarda de datos, es ~11,5 hoy y
~10 cuando llegue la grilla oficial** (recién ahí se puede reescribir el copy
de coberturas, que es el bloque de texto más denso de la página). Para bajar
de eso hay que **mudar** contenido a `/planes` y `/que-cubre`, que es lo que
proponía la opción A — pero la mudanza del detalle de cobertura **no toca el
simulador**, así que sigue disponible sin contradecir lo que Arturo pidió.
Decisión pendiente de él.

### `/historia/` no entra en la v1 (resuelto el 16/09)

Arranca de su observación: *"el por qué importa, ver la historia completa lleva
a un espacio que no se ve muy práctico."* Tiene razón, y el problema es mayor
que el link: `/historia/` es el manifiesto en scrollytelling, **720vh = siete
pantallas**, con sticky y parallax.

Se recomendó dejarlo fuera de la v1 por tres razones que apuntan al mismo lado
— siete pantallas de marca contradicen una v1 que estamos acortando; no sirve a
ninguna de las cuatro preguntas ni lleva al simulador (dec. 12e); y es, por
lejos, **lo más difícil de reimplementar de todo el sitio**, justo cuando el
entregable es una maqueta que Buenavista tiene que copiar. **Arturo aceptó**
(*"seguimos tu sugerencia"*).

Se cerraron **las tres puertas juntas** con `CON_HISTORIA` — el link de "Por
qué importa", el del hero y el del menú móvil— más el pie, el sitemap y el
export (`scripts/podar-edicion.mjs`). **El prototipo la conserva entera**, con
sus tres puertas y su lugar en el sitemap: verificado en el build completo.

⚠ Si el manifiesto se quiere recuperar para la v1 más adelante, el problema a
resolver primero no es el contenido sino **la forma**: 720vh de scroll dirigido
es lo que ningún otro equipo va a poder copiar sin rehacerlo.

---

## 📌 LO QUE DECIDIÓ EL DIRECTORIO (reunión del 15 sep 2026 — afecta al sitio)

Reunión de directorio con Crafting sobre MKT. Lo que toca a la web:

1. **Bronze se dio de baja.** La línea pasa a ser **SP Esencial (reemplaza a
   Bronze) · Silver · Gold**. Arturo: *"solo 3 productos necesitamos ofrecer"*;
   y el 14/09 a Buenavista: *"voy a hablar para que en la página pongamos 3
   productos y se acabó"*. El Vital sigue aparte, para 65+.
2. **Fecha de lanzamiento: primera semana de octubre de 2026**, con los 3
   planes, ocultando blog y guía si no llegan — que es exactamente la edición
   de lanzamiento que ya está construida.
3. **Orden de lo que se abre después: la guía médica en octubre, el blog en
   noviembre** — *"entre blog y guía médica, le pondría un poco a guía médica,
   que es lo que el cliente más necesita"*. Antes no teníamos este orden.
4. **La reserva de turnos es prioritaria** (Arturo, textual). Ojo: ya existe
   una reserva de turnos en el sitio actual, atada al sistema de SP y a su
   programador. Nuestro `/agendar` es un handoff a WhatsApp. **Hay que decidir
   si conviven o si uno reemplaza al otro** — no está resuelto.
5. **La tira de logos se poda.** Arturo: *"es mucho ruido poner tantos colores,
   tantos logotipos. Parece que entramos a una perfumería."*

### ⚠ GUARDA DE DATOS — la grilla que usamos puede no ser la que vale

Arturo, en esa reunión: *"yo no sé cuál del Bronze, Silver y Gold es el
correcto porque hay 2 versiones... Quiero que alguien me diga esta es la
versión oficial."* Y el porqué, en sus palabras: *"si la persona siente otra
vez que se le mintió, nosotros vamos a pagar caro eso a la larga."*

Todo lo que este sitio afirma sobre cobertura sale de
`datos/planes-vigentes/grilla-coberturas-precios-jul2026.json` (tarifario
Privilege). **Hasta que Arturo confirme cuál es la grilla oficial, `/que-cubre`
es la parte más expuesta del sitio, no la más transparente:** 983 respuestas
afirmativas apoyadas en una fuente sin confirmar.

Dos contradicciones concretas, medidas el 16/09 contra el código:

- **Bronze aparece 26 veces de cara al cliente** (`app/page.jsx` 8,
  `app/coverage.js` 7, `app/quote.js` 5, `app/que-cubre/Landing.jsx` 4,
  `app/planes/Planes.jsx` 1, `app/components/Simulador.jsx` 1) — un plan que
  ya no se vende.
- **El sitio dice 4 veces que el precio es el mismo en todo el país** (3 en el
  home, 1 en el simulador) y `TARIFAS` en `app/quote.js` no tiene dimensión de
  zona. El directorio habló de **3 precios por zona** para el Esencial. Una de
  las dos afirmaciones es falsa y todavía no sabemos cuál.

**No tocar los números de cobertura ni de precio hasta que llegue la grilla
oficial.** Cambiar "Bronze" por "Esencial" a mano, sin la grilla, es
inventar — y es justo el error que la guarda viene a evitar.

---

## 🚀 LA V1 QUE SE LANZA — dos ediciones del mismo código (15 sep 2026)

**Empezá por acá si vas a tocar el sitio.** Desde hoy este repo produce **dos
sitios**, no uno:

| | Prototipo completo | **Edición de lanzamiento (v1)** |
|---|---|---|
| Dónde | `/sp-prototipo/` (donde estuvo siempre) | `/sp-prototipo/lanzamiento/` |
| Qué es | El laboratorio: todo lo construido | **Lo que sale al público** |
| Rutas | home · simulador · planes · qué cubre · agendar · historia · **blog · Mi SP · Guía Médica** · snapshot `/v1/` | home · simulador · planes · qué cubre · **Guía Médica** (desde el 23/09; agendar salió ese día) |
| Se indexa | no | **no todavía** (`noindex`, decisión del 15 sep) |

**La decisión (Arturo, 15 sep 2026):** *"Tenemos que lanzar la v1 de la página
web de SP. Quiero crear otra versión del prototipo para esto sin tocar el
prototipo original. Porque todavía no lanzaremos la guía médica, o la sección
mi SP, aunque sí la sección de agendamiento de turnos."* Y minutos después:
*"El Blog tampoco saldría aun en esta version."*

### Cómo funciona — `app/edicion.js`, no un repo aparte

Un flag de build decide qué módulos entran:

```bash
# el prototipo, como siempre
NEXT_PUBLIC_BASE_PATH=/sp-prototipo npm run build

# la v1 pública
NEXT_PUBLIC_BASE_PATH=/sp-prototipo/lanzamiento \
NEXT_PUBLIC_EDICION=lanzamiento npm run build
```

`app/edicion.js` exporta `CON_GUIA`, `CON_MI_SP` y `CON_BLOG`. Cada link a uno
de esos módulos vive detrás de su constante; cada ruta se poda del export en
`scripts/podar-edicion.mjs` (hook `postbuild`). **Las dos cosas, siempre**: un
link escondido con la página igual publicada es una página huérfana que Google
puede encontrar, y una página podada con el link puesto es un 404 en la cara
del cliente. El podador verifica lo segundo y **corta el build** si queda un
`href` apuntando a lo podado — por eso el CI construye las dos ediciones.

> ⚠ **Por qué un flag y no una copia del repo.** El motor de contenido publica
> las notas del blog **dentro de este repositorio**. Una copia en otro repo se
> queda sin ese flujo el día que el blog se lance, y obliga a arreglar cada bug
> dos veces. Se evaluaron las tres opciones (flag / repo nuevo / rama larga) y
> ganó el flag por eso. BITACORA cap. 73.

### Lo que la v1 cambia en el home — no es "el prototipo menos dos links"

Sacar la guía y Mi SP deja huecos que hay que **contestar**, no tapar:

1. **La puerta del cliente en el hero.** Decía "Ya soy de SP · Mi SP" y llevaba
   a un portal que no se lanza. Ahora dice **"Ya soy de SP · Pedí tu turno"** y
   lleva a `/agendar/`. Es la única acción que un cliente puede resolver hoy en
   la web. Decisión de Arturo, 15 sep.
2. **El botón de la barra.** Era "Guía Médica". En la v1 es **"Agendar un
   turno"** — la acción que hasta ahora vivía escondida bajo el desplegable de
   Mi SP y que en esta edición gana primera línea.
3. **Dos preguntas de la FAQ cambian de respuesta.** "¿La cobertura vale en
   todo el país?" y "¿Está mi médico o mi sanatorio en la red?" se contestaban
   mandando a la Guía Médica. En la v1 se contestan por WhatsApp, que es lo que
   de verdad pasa hoy. Una respuesta no puede apuntar a un lugar que no existe.
4. **El bloque "¿Dónde atenderte?"** prometía buscar médicos y sanatorios. En
   la v1 dice dónde te atendés (Lister + más de 50 prestadores) y ofrece el
   turno. No promete la búsqueda que no puede dar.

### Cómo se lleva la v1 con el principio 12e (*la página vende el simulador*)

Se verificó al integrar `main` el 15/09: **no lo contradice, y conviene saber
por qué** antes de contar CTAs a ojo.

- **El destino comercial sigue siendo uno solo.** El botón teal "Simulá tu
  plan" no se movió, en el nav ni en el hero. Lo que cambia es la **puerta del
  cliente**, que nunca fue comercial: antes iba a Mi SP, ahora va a agendar.
  Sirve a quien ya compró; no vende un plan.
- **La barra de la v1 queda más limpia con 12e, no menos.** El prototipo tiene
  dos entradas no comerciales en la barra (el botón de la Guía Médica y el
  desplegable de Mi SP); la v1 tiene una sola, agendar.
- **Lo que sí cambia de verdad: dos respuestas de la FAQ pasan de una
  herramienta a una persona.** "¿Vale en todo el país?" y "¿está mi médico en
  la red?" contestaban mandando a la Guía Médica; en la v1 las contesta un
  asesor por WhatsApp. Eso cae **dentro de la excepción con nombre de 12e**
  (*el WhatsApp es el atajo, siempre abierto*), pero no es gratis: en la v1, la
  cuarta de las cuatro preguntas del proyecto —*¿dónde me atiendo?*— **no la
  resuelve el sitio solo**. Es costo de atención al cliente, y es el argumento
  más concreto para priorizar la guía en la v2. El detalle, en
  `sp-interno/BITACORA.md` cap. 10.

**Eventos.** La puerta del hero emite `cta_agendar {origen:'hero'}`, no
`puerta_home`, a propósito: el embudo de turnos se cuenta con **un solo
evento**. Sumar dos eventos para un embudo ya nos costó caro con `/que-cubre`
(`nav_landing` + `ver_que_cubre`, más arriba en este documento). Las puertas de
agendar en la v1 son: `hero`, `nav`, `menu_movil`, `cobertura`.

### Al agregar algo nuevo

- **Texto o link nuevo**: preguntarse en qué edición vive. Si toca un módulo
  que la v1 no lanza, va detrás de su `CON_…`.
- **Módulo nuevo que no está listo para el público**: constante `CON_…` en
  `app/edicion.js` + entrada en `PODAR` de `scripts/podar-edicion.mjs`.
- **Verificación**: `qa/qa-lanzamiento.mjs` (cabecera con el cómo). Revisa lo
  que el HTML estático no muestra — el menú móvil, que se arma al abrirlo, y
  las respuestas de la FAQ, que se renderizan al desplegarlas.

### Pendiente para lanzar de verdad

> ⚠ **Corregido el 16/09/2026.** El 15 escribí acá que lo que faltaba era el
> dominio. Era una suposición mía, y era falsa: **esta edición no se publica
> desde este repo.** Ver la sección de arriba — `/lanzamiento/` es la maqueta
> que implementa Buenavista. El dominio, el hosting y la indexación son de
> ellos. El `noindex` de nuestra copia se queda como está: nuestra copia es
> una referencia, no el sitio.

---

## 🆕 `/que-cubre` — la landing de los planes, en espacio propio (6 ago 2026)

Ruta nueva: **`/que-cubre/`** (`app/que-cubre/`). Es **la página donde la
promesa de transparencia se puede verificar**: abre con un buscador — escribís
el estudio, la cirugía o el especialista que necesitás y ves qué hace cada plan
con eso. Detrás hay **983 respuestas**: 935 estudios/análisis/cirugías y 43
especialidades **salidas de la grilla oficial**, más 5 exclusiones **tomadas del
contrato** (no están en la grilla — la procedencia se dice partida en la
pantalla, porque decir que las 983 salen de la grilla exageraría el respaldo
justo de las afirmaciones negativas, que son las más fuertes).

**El dato ya estaba en el repo desde el 22/07 y solo servía para tres
porcentajes.** Ver BITACORA cap. 65.

### ⚠ `/que-cubre` NO reemplaza a `/planes` — son dos cosas

Decisión del usuario (6 ago 2026), textual: **"que sea un espacio aparte"**.

| | `/planes` | `/que-cubre` |
|---|---|---|
| Qué es | Página **del sitio**: la comparación servicio por servicio | **Landing con vida propia** |
| Para qué | La consulta alguien que ya está navegando SP | El link que se pasa por WhatsApp, el destino de una campaña |
| Se mide | Con el resto del sitio | **Sola** (eventos con prefijo `quecubre_`) |

`/planes` quedó **exactamente como estaba** — la primera versión de este
trabajo la había reemplazado y se revirtió byte a byte. Una landing repite a
propósito cosas que también viven en el sitio (la tabla de 11 servicios, la
banda Vital): tiene que cerrar el argumento completo sin que nadie navegue a
otro lado. **Si alguna vez se unifican, es una decisión de producto, no una
limpieza de duplicados.**

**El slug** sale de la regla de lenguaje del `CLAUDE.md`: "qué cubre" es la
forma aprobada de decir lo que el rubro llama "cartilla", y es lo que una
familia escribe en un buscador. **No se usa "privilege" en la URL**: es nombre
interno (dec. 11o).

**Cómo se entra (6 ago 2026, resuelto tras un choque de dos sesiones).**
Una sola puerta de menú por superficie:

| Superficie | Entrada |
|---|---|
| Desplegable **Cobertura** (escritorio) | "¿Está cubierto lo que me pidieron?" |
| **Menú móvil** (es plano, no tiene desplegables) | "¿Está cubierto?" en cuerpo menor |
| **Comparador** del home | tarjeta "¿Está cubierto lo que me pidieron?" |

> ⚠ **Cómo se llegó acá — para no repetirlo.** El PR #92 puso una entrada
> discreta llamada **"Landing v1"** en el desplegable *Planes* y en el menú
> móvil, a pedido del usuario (*"en algún lugar medio escondidito"*). El PR #91,
> de otra sesión y en paralelo, integró la misma página como entrada de primera
> línea en *Cobertura* + tarjeta en el comparador, con el nombre en idioma de
> cliente. Los dos se fusionaron el mismo día y `main` quedó con **la misma
> página dos veces en la misma barra, bajo dos nombres distintos** — y uno de
> ellos, "Landing v1", era **jerga interna delante del cliente**, contra la
> regla de lenguaje del `CLAUDE.md`. Ganó el nombre del cliente; se eliminaron
> las entradas "Landing v1". **Lección: cuando dos sesiones tocan navegación,
> el conflicto no aparece en el `git merge` — los dos lados aplican limpio y el
> defecto solo se ve mirando el nav entero.** Verificar la barra completa, no
> el diff.

El menú móvil conserva su propia entrada **a propósito**: es plano y no tiene
los desplegables donde vive la de escritorio. Sin ella, `/que-cubre` se quedaba
sin puerta de menú justo para el 77% del tráfico.

**Eventos — ojo, son DOS, no uno.** Las puertas de menú emiten
`nav_landing{destino:'que-cubre', origen:'nav_menu'|'menu_movil'}`; la tarjeta
del comparador emite `ver_que_cubre{origen:'comparador'}` (viene del PR #91 y
se respeta). **Un embudo que consulte solo `nav_landing` va a perder a los que
entran por el comparador** — hay que sumar los dos eventos para tener las tres
puertas.

### Lo que una sesión futura tiene que saber (del buscador)

- **Fuente y regeneración.** `lib/prestaciones.json` lo **genera**
  `scripts/build-prestaciones.mjs` desde
  `datos/planes-vigentes/grilla-coberturas-precios-jul2026.json`. Se corre a
  mano (no en el build) y **el resultado se commitea**: así una re-ingesta de
  la grilla muestra en el diff del PR exactamente qué cobertura se movió. Si
  cambia la grilla: `node scripts/build-prestaciones.mjs && node scripts/test-buscador.mjs`.
- **El generador corta si no entiende.** Un código de cobertura desconocido
  tira error en vez de adivinar. Hoy mapea una sola variante documentada
  (`"100%"` → `CT`, una fila del master). Si aparece otra, **verificarla contra
  el master antes de agregarla** — no normalizar en silencio.
- **10 ítems tienen celdas combinadas en el `.xlsx`** y les falta un plan. Se
  muestran como "Sin dato" con su aviso; **nunca se infiere cobertura**. El
  generador los lista al correr. Vale confirmarlos con quien mantiene la grilla.
- **El buscador habla el idioma del cliente, no el del tarifario.** La grilla
  dice "RMN DE RODILLA"; la gente escribe "resonancia de rodilla". Esa
  traducción vive en `SINONIMOS` y `COMO_LE_DICEN` del generador. Al agregar
  sinónimos, correr el generador: **avisa cuáles no matchearon nada** (así se
  descubrió que el cuadro de cirugías estaba ciego, cap. 65).
- **Nunca dejar que una búsqueda razonable devuelva cero.** En una página de
  transparencia el cero se lee como "no lo cubre". Por eso el índice incluye
  las especialidades y las exclusiones, y el estado vacío aclara que no
  encontrarlo no significa que no esté.
- **Privacidad:** el evento `planes_buscar` lleva **solo el largo** del texto
  (más `hubo_resultados` y `aproximado`), nunca el texto. Lo que alguien escribe ahí ("quimio", "psiquiatra",
  "embarazo") es un dato de salud. No agregarle el término, por útil que suene.
- **Pendiente chico, anotado para no perderlo:** el home dice *"cuatro cosas que
  nuestros planes no cubren"* (odontología, bariátrica, oncológico, alta
  complejidad). `/planes` lista además **enfermería a domicilio** (cláusula
  2.9.2, confirmada en este mismo HANDOFF), porque el buscador tiene que
  responderle a quien escribe "enfermera a domicilio". Ninguna de las dos miente
  y ninguna canta el número, así que hoy no se contradicen a la vista. **Si se
  unifica, que sea sumando la quinta en el home — no sacándola de `/que-cubre`.**
  El home está fuera del territorio de este PR.

### ⚠ Guarda — NO reponer el bloque 45/66/93 en ningún lado

La cobertura real por plan (Bronze 45% / Silver 66% / Gold 93%) **se eliminó
del home el 25/07/2026 por decisión del usuario**: *"la transparencia tiene que
cumplir un propósito, no puede ser transparencia por ser transparencia"*.
Informa cuán incompleto es un plan sin ayudar a decidir, y "45% cubierto" se
lee como "55% NO cubierto" — la transparencia vendiendo en contra.

`/que-cubre` usa **los mismos datos para responder lo que sí decide**: cuántas
cosas mejoran al subir de plan (**Bronze→Silver 298**, **Silver→Gold 275**) y
en qué cuadro se concentra el salto. Los números los calcula el generador
(`saltos`), así que no se desactualizan a mano. Si mañana alguien quiere
"mostrar cuánto cubre cada plan": eso ya se decidió que no, y esta sección es
la versión que sí sirve.

---

## 🔖 ESTADO AL CIERRE DE LA PARTE 1 (22 jul 2026) — handoff para la Parte 2

**Si retomás el proyecto, empezá por acá.** Una sesión larga (Parte 1) hizo una
auditoría estratégica y varias mejoras; todo lo de abajo está **en vivo** o
documentado en el repo.

### En vivo (fusionado + deploy verde)
- **#41** Auditoría — "Mi SP" persistente (nav+footer), honestidad pareja en la
  Guía (badges "Datos de ejemplo"), y arreglo de un desborde latente del nav.
- **#42** Grilla oficial Privilege incorporada al git.
- **#43** Análisis de arancel diferenciado / copago / exclusiones (estrategia).
- **#44** **Consulta caliente**: el comparador entra al simulador con el plan
  puesto (no salta a WhatsApp) → precio → cierre humano.
- **(este PR)** Re-ingesta de grillas enriquecidas: Privilege (+ cobertura_real,
  + AD cláusula 2.10) y **Vital** (nueva, `grilla-vital-coberturas-jul2026.json`).

### Pipeline de datos (Drive → repo) — NUEVO
- Carpeta **`SP-Web`** en el Drive del usuario, reorganizada (00_LEEME,
  01_APROBADO-para-web, 02_Brief, 03_Prototipos, 04_Fotos, 05_Textos, …).
- **Masters canónicos** (fuente de verdad; se leen por `fileId` con la
  herramienta de Google Drive — los atajos `.lnk` NO sirven de puntero):
  - Privilege: `1ORPseTEt-jeo2FDqGJ6LQkr0F-fr_oYh`
  - Vital: `1kIptlBGNTpKuEgFQAEJjmpzeqKmfrZm3`
- Runbook de re-ingesta + fechas + chequeo mensual: `datos/planes-vigentes/README.md`.

### Hallazgos clave (de los masters)
- **AD = sin cobertura, el socio paga 100% con tarifa de convenio** (cláusula 2.10). Confirmado.
- **Cobertura real** Privilege: Bronze **45%** / Silver **66%** / Gold **93%** cubierto al 100% (el mejor argumento de upsell honesto).
- **Vital (65+) NO incluye salud mental** (psico/psiq/fono = arancel preferencial) → el diferenciador de salud mental es de **Privilege**, no de Vital.
- **Telemedicina y "laboratorio a domicilio" NO aparecen** en ninguna grilla → la tarjeta "garantiza" del home sobreprometía. **✔ Resuelto (dec. 11l):** verificado también contra los 4 cuadernillos SP y corregido en el home. Médico a domicilio (2/3/4 al año) y salud mental (Bronce/Silver/Gold) sí existen y quedaron con su número real.

### Pendientes priorizados (Parte 2)
1. ~~**Telemedicina/domicilio (Crítico de la auditoría)**~~ ✔ **HECHO (22 jul
   2026, dec. 11l):** se verificaron los 4 contratos SP en el Drive —
   telemedicina y "laboratorio a domicilio" NO existen en ningún plan. Se
   corrigió el bloque "Lo que casi nadie te garantiza" del home (telemedicina →
   "Sin letra chica"; "médico a domicilio" con números reales; salud mental
   acotada a Bronce/Silver/Gold). Queda afuera del home: el filtro
   "Telemedicina" de la guía (`guia_resultados.html`) si SP no va a ofrecerla.
2. ~~**Bloque "qué no cubre / qué pagás aparte"**~~ ✔ **PRIMERA VERSIÓN HECHA
   (22 jul 2026, dec. 11m):** sección "Lo que pagás de tu bolsillo" en el home
   (después del comparador) — los 3 modos (Cubierto/Copago/Al precio de
   convenio) + cobertura real por plan (45/66/93) + exclusiones verdaderas, en
   gris. Falta el **glosario buscable** completo (Visaciones ya tiene la lista
   de FAQs — pedírsela).
3. ~~**Salud mental**~~ ✔ **HECHO (dec. 11l):** el diferenciador del home ya dice
   "incluida en los planes Bronce, Silver y Gold" (nombres públicos, no a quien
   mira Vital); el comparador ya la mostraba por plan (3/5/6 sesiones, exacto al
   contrato). No aparece como promesa general en ningún otro lado.
4. **Hoja de plataformas para BuenaVista** (comparación abajo, aún sin escribir).
5. Testimonios reales + fotos reales (pendientes viejos).

### Reunión con departamentos (22 jul 2026) — norte para la web
La reunión cross-departamental (MKT + áreas) validó la tesis ("SP no vende
salud, vende tranquilidad y transparencia; hoy NO somos transparentes") y el
anti-sobrepromesa ("no existe un plan que cubra todo"). Insumos accionables
para la web, más allá del #2 ya arrancado:
- **Glosario buscable + FAQ**: Visaciones YA tiene la lista de preguntas
  frecuentes y un "speech" que traduce la jerga (CT, COP, "arancel por
  restricción activa" = cuotas atrasadas, evento, prestador, sanatorio en
  convenio). **Acción: pedir esa lista** y armar el componente buscable.
- ~~**Blog por categorías**~~ ✔ **HECHO (dec. 11n):** filtro por categoría en el
  índice (Prevención · Entendé tu plan). Palanca SEO; calza con oct–nov.
- **Fotos reales** de sanatorios/prestadores para "quiénes somos" (Arturo las
  pidió en voz alta) — mismo pendiente #5.
- **NO construir todavía**: precios de sanatorio para lo no cubierto (Arturo lo
  pospuso a septiembre), y el portal/app (credencial, turnos, pagos,
  vencimientos, noticias-HubSpot) — territorio de la app de Luján + backend;
  definir la frontera app↔web antes de tocar.
- **Preguntas abiertas que cambian qué construimos** (confirmar con Arturo):
  ~~(1) ¿nuevos planes en curso?~~ ✔ **respondido (dec. 11o):** solo Bronce/
  Silver/Gold hoy; Esencial/Integral/Premium (versiones mejoradas de esos tres)
  llegan en 2-3 meses — no modelar los demás productos. ~~(2) "Privilege"
  ¿público o interno?~~ ✔ **interno**; lo público es Bronce/Silver/Gold. Quedan:
  ~~(3) ¿plataforma abierta o el prototipo ya es la web?~~ ✔ **el prototipo ES
  la web (dec. 11p).** Queda solo (4) **SEO** — destrabado por lo anterior;
  falta el dominio del sitio y de la guía (#9), quitar el `noindex` de los 3
  HTML de la guía, y cuándo el sitio sale público.

### Guardas — qué NO tocar sin input humano
- **Test de 5 segundos (§3c): EN PAUSA** — no tocar hero/categoría/acción
  dominante hasta que el usuario corra el test con usuarios.
- No afirmar "garantizado por contrato" sin la cláusula.
- Reglas de **tono / tipografía / lenguaje** en `CLAUDE.md` — respetarlas.

### Decisiones que viajaron por conversación (escritas acá para no perderlas)
- **Plataforma (pendiente #8): ✔ DECIDIDO (23 jul 2026, dec. 11p) — el prototipo
  Next.js ES la web** ("a muchísimos les está gustando cómo está quedando"). Se
  descarta WordPress. El backend hace falta igual (ANEXO); quedan quién hospeda +
  el dominio del sitio y de la guía (#9). La "hoja de plataformas para
  BuenaVista" (pendiente 4) pierde
  urgencia: ya no se comparan plataformas, se decide hosting/dominio.
- **Drive `SP-Web`:** ordenar por rol, separar materia prima de
  `01_APROBADO-para-web`; regla de oro: nada sale a la web si no está "aprobado".

### Índice — dónde vive cada cosa
Home `app/page.jsx` · Simulador `app/components/Simulador.jsx` (flujo plan-puesto)
· Planes `app/planes/Planes.jsx` · **Landing `app/que-cubre/Landing.jsx` + buscador
`app/que-cubre/Buscador.jsx`** · Motor de
precios `app/quote.js` · Guía `guia/*.html` · Datos de planes
`datos/planes-vigentes/` · **Índice buscable `lib/prestaciones.json` (generado por
`scripts/build-prestaciones.mjs`) + lógica `lib/buscar-prestaciones.js`** · Análisis AD
`datos/planes-vigentes/ANALISIS-arancel-diferenciado.md` · Blog `contenido/blog/`
· QA `qa/qa-integral.mjs` + `scripts/test-buscador.mjs`.

### Eventos de tracking nuevos (para cuando se conecte el backend)
`sim_plan_preset`, `sim_plan_switch`, `blog_open{origen:comparador}` (+ los del ANEXO §2).
`planes_buscar{largo}` — **solo el largo del texto, nunca el texto: es un dato de
salud** —, `quecubre_ver_especialidades`,
`cta_simulador{origen:quecubre_tarjeta|quecubre_tabla|quecubre_senior|quecubre_cierre}`.
El prefijo `quecubre_` existe para que la landing **se mida sola**, separada de
`/planes` y del home.

### Recordatorio mensual de datos
El usuario pidió un chequeo mensual de si las grillas cambiaron (comparar
`modifiedTime` de los masters vs la última ingestión del README). **Estado: a
definir con el usuario** (la Routine automática quedó pendiente de su OK).

---

## 1. LA DIRECCIÓN — por qué existe todo esto

La dirección es lo permanente; todo lo demás en este documento es táctico.
Se expresa en tres versiones — **la misma verdad para tres audiencias**:

### 1a. El momento que importa *(para dirección, marca y aliados — el porqué)*

> Cuando alguien de tu familia necesita un médico, no hay tiempo para letra
> chica. Queremos que ese momento — el de la fiebre a medianoche, el del
> estudio que pidió el doctor, el de "¿esto me cubre?" — se resuelva en un
> minuto y desde el celular: qué plan te conviene, cuánto cuesta, qué cubre
> y dónde te atendés. Y que cada vez que alguien busque y no encuentre,
> nosotros lo sepamos antes que nadie — porque una red de salud se mejora
> escuchando lo que la gente necesita, no adivinándolo.

### 1b. Las cuatro preguntas *(para el equipo que construye — el criterio de decisión)*

> Todo el ecosistema digital de Salud Protegida existe para responder
> **cuatro preguntas en minutos, sin llamar a nadie**:
>
> 1. **¿Qué plan me conviene?** → el simulador
> 2. **¿Cuánto me cuesta?** → el precio antes de dejar datos
> 3. **¿Qué me cubre?** → la cartilla, sin letra chica
> 4. **¿Dónde me atiendo?** → la guía médica
>
> Cada sección de la web sirve a una de esas preguntas; si alguna vez una
> sección no sirve a ninguna, sobra. Y toda interacción deja un registro
> anónimo que le dice a SP qué demanda la gente y qué le falta a la red.

**Regla práctica:** ante cualquier propuesta nueva ("agreguemos X"), la
pregunta automática es *¿a cuál de las cuatro preguntas sirve?*

**Dos audiencias, los mismos jobs (home-v2, julio 2026):** las cuatro
preguntas sirven igual al **prospecto** ("¿qué plan me conviene?") y al
**afiliado** ("¿qué me cubre *mi* plan?"). La home hace el triaje en el
hero con dos puertas: "Quiero un plan" → simulador · "Ya soy de SP" →
guía en modo personalizado (fase 1 del portal; el portal completo es
destino declarado, ver `PLAN-home-v2.md` §3).

### 1c. El círculo que se alimenta solo *(para negocio e inversión — el retorno)*

> Queremos construir algo más que una web linda: un círculo que gira solo.
> La web atrae y responde → cada búsqueda y cada click quedan registrados →
> esos datos le dicen a Convenios qué prestadores faltan, a Comercial qué
> vende mejor y a CX dónde se frustra la gente → la red y la oferta mejoran
> → la web responde mejor y vende más → más gente la usa → mejores datos.
> El día que la guía médica sea el lugar donde *todo paraguayo* verifica un
> médico — sea o no asegurado — Salud Protegida tendrá el activo digital
> más valioso del sector.

---

## 2. QUÉ EXISTE HOY — el estado del ecosistema

| Pieza | Dónde | Estado |
|---|---|---|
| **Web de planes** (hero, manifiesto, cartilla viva, comparador, simulador embebido, FAQ) | `app/page.jsx` → [nelargon.github.io/sp-prototipo](https://nelargon.github.io/sp-prototipo/) | Prototipo funcional completo |
| **Simulador** (ruta propia) | `app/simulador/` → [/simulador](https://nelargon.github.io/sp-prototipo/simulador/) | Funcional, **tarifario vigente real** (jul 2026, IVA incl.) |
| **Guía Médica rediseñada** (home + resultados + ficha de prestador) | `guia/` (fuente) y `public/guia/` (copia publicada) → [/guia/guia_home.html](https://nelargon.github.io/sp-prototipo/guia/guia_home.html) | Funcional con datos ilustrativos |
| **Nuestra historia** (manifiesto cinematográfico) | `app/historia/` → [/historia/](https://nelargon.github.io/sp-prototipo/historia/) | Funcional (movido de la home en home-v2) |
| **Snapshot del home v1** (referencia congelada, pre-rediseño) | `public/v1/` → [/v1/](https://nelargon.github.io/sp-prototipo/v1/) | Solo referencia — no editar (fuente: commit `b8289a8`) |
| **Anexo de requisitos backend** | `guia/ANEXO-requisitos-backend.md` | El contrato técnico para la empresa desarrolladora |
| **Guía actual en producción** | `sp.sip.com.py` (sistema de SIP, datos reales de la app de siempre) | Analizada; sus 3 HTML fueron el insumo del rediseño |

**Contexto clave:** la guía en producción corre sobre el sistema de SIP con
plantillas ("un cambio en un prestador se aplica a todos"). SP puede
modificar el diseño y pasárselo a la empresa desarrolladora, que lo evalúa e
integra. Nuestro paquete `guia/` está en el mismo formato que usan ellos
(HTML sueltos + Tailwind) justamente para que la adopción sea directa.

**Línea de base de datos reales (GA de la web activa de SP,
15 may – 13 jul 2026, aportada por el usuario):** ~3.200 usuarios
activos, **2.900 nuevos (recurrencia ~9% — la métrica a vencer con la
guía nueva y el portal)**, 50 s de interacción media, **77% móvil**, 94%
Paraguay. "Guía para el asegurado" es la **3ª página más visitada** (783
usuarios — valida la puerta 2 del hero); Login solo 132 usuarios.
Canales: Organic Search #1 (282 sesiones/semana), Paid Social pagado
creciendo (+33%). Pregunta abierta para SIP: el embudo que mostraba
"100% inicio de sesión" parece auto-calificarse — ¿la app/portal mide en
otra propiedad de GA? El `BRANDSCRIPT.md` está escrito con estos números.

**Historia git:** PR #1 (rediseño de la guía + publicación en Pages),
PR #2 (QA móvil + menú + cobertura por plan + upsell), PR #3 (HANDOFF),
PR #4 (CI en PRs + sync de la guía + README) y PR #5 (integración de la
guía al homepage, A+B) — todos mergeados a `main`. El deploy a GitHub
Pages es automático al pushear a `main` (`.github/workflows/deploy.yml`,
usa `npm ci`).

---

## 3. DECISIONES TOMADAS (con su porqué — no re-litigar sin motivo)

1. **La guía se rediseñó en HTML + Tailwind sueltos** (no Next.js): mismo
   formato que usa el proveedor → adopción sin fricción. El CDN de Tailwind
   es solo para prototipo; producción requiere build compilado.
2. **Identidad visual**: tokens SP — navy `#003B71`, teal `#00BCB4`, verde
   `#009690`, dorado `#C9A227` (solo planes premium), rojo `#D92D20`
   (SOLO urgencias). **Nunito Sans** ExtraBold/SemiBold para títulos
   (desde el 20 jul 2026 — reemplazó a Gilroy porque su licencia anual no
   se podía pagar; Nunito Sans es SIL OFL, gratis y auto-hospedada), Inter
   para cuerpo. Nombres en Tipo Oración, nunca MAYÚSCULAS SOSTENIDAS.
3. **Buscador único**: un campo que entiende especialidades, estudios,
   prestadores, ciudades, sinónimos cotidianos ("dentista"→Odontología),
   errores de tipeo ("rezonancia"→Resonancia) y orienta síntomas
   ("me duele la espalda"→Traumatología, con disclaimer). Sugerencias
   agrupadas por categoría, navegables por teclado (ARIA combobox).
   La lógica demo en JS es la espec ejecutable para el backend.
4. **Cero resultados nunca es un callejón**: "¿quisiste decir…?" + WhatsApp
   con la búsqueda prellenada. Cada falla es un lead y un dato.
5. **Cobertura jerárquica**: Premium ⊇ Integral ⊇ Esencial. SP Senior corre
   por su propio carril (Senior / Senior Plus). Por eso basta almacenar el
   **nivel mínimo** (`min_plan`) por prestador.
6. **Combo aprobado A1 + B3 + C3**:
   - **A1**: menú móvil desplegable (mismo patrón que la web).
   - **B3**: en listas, una sola etiqueta "Desde SP X" / "★ Exclusivo SP
     Premium"; en la ficha, el detalle por plan (incluye tarjeta Senior).
   - **C3**: modo personalizado (con CI) = una sola lista, lo cubierto
     primero con "✓ Con tu plan", lo no cubierto con etiqueta dorada que
     abre la **hoja de upsell** → "Simulá el cambio" → simulador.
7. **Regla de tono comercial**: nunca "No cubierto", nunca rojo para
   cobertura. La ausencia se comunica como oportunidad (dorado). La guía
   genera el deseo; el simulador cierra la venta.
8. **Seguridad de la consulta por cédula**: CI + fecha de nacimiento
   (segundo factor liviano), POST (nunca la cédula en la URL), rate
   limiting + CAPTCHA invisible, respuesta mínima (ni nombre ni plan del
   titular en pantalla). Hoy la demo simula un asegurado SP Integral.
9. **Los datos de prestadores del prototipo son ilustrativos a propósito**:
   son el *molde* del formato correcto (sedes separadas, un teléfono por
   acción, horarios, planes). Los datos reales de SIP existen pero están
   sucios (teléfonos concatenados que rompen el botón Llamar, dos
   direcciones en un campo, "fax: 30", typo "SERVICIO DE AMBULACIA").
10. **Integración guía ↔ homepage**: aprobado **A+B ahora, C como destino**
    (ver pendiente #1 abajo).
11. **El espacio del afiliado se llama "Mi SP"** (julio 2026, elegido por
    el usuario): corto, apropiable y crece bien. **Desde julio 2026 ya
    tiene su página propia: `/mi-sp/`** — reúne lo que funciona hoy (Ver
    mi red con CI+fecha, WhatsApp, urgencias) y muestra en tarjetas "en
    camino" lo que viene (mi plan, credencial digital, turnos, pagos),
    sin fingir que existe. El menú móvil y la puerta 2 del hero ("Ya soy
    de SP · Mi SP") llevan ahí. Evento `mi_sp_accion` (ANEXO §2) mide
    qué buscan los clientes — ese dato ordena qué módulo construir
    primero.
11b. **El simulador acompaña como una persona** (julio 2026, pedido del
    usuario): los mensajes laterales reaccionan a cada elección ("Toda la
    familia junta — de eso se trata") en vez de repetir texto fijo, la
    línea de acompañamiento convive con el estimado en móvil, y el cierre
    tras dejar datos promete "una persona, no un robot". Referencia:
    flujos conversacionales tipo Lemonade (una pregunta por vez + lenguaje
    llano), sin convertirlo en chatbot — balance con lo funcional.
11c. **El simulador entra en la pantalla del celular** (17 jul 2026, del
    dispositivo real del usuario): auto-scroll al inicio de la tarjeta en
    cada paso, "¿por qué te preguntamos esto?" plegado en `<details>`,
    paddings comprimidos en móvil, y el resultado en dos actos (precio +
    formulario primero; desglose, descargar y compartir después). El
    tilde del "match" se centra con flexbox — su animación pisaba el
    `transform` que lo centraba (BITACORA cap. 26). El QA integral ganó
    dos guardianes: presupuesto de geometría (primera opción visible sin
    scroll en 390×670) y centrado computado del tilde (±2px). Queda como
    evolución opcional el modo "pantalla completa" con CTA fijo (100dvh)
    si el test con usuarios lo pide.
11d. **Regla de etiquetas y su poda** (17 jul 2026, de la observación del
    usuario "a todo le pones etiquetas"): quedó codificada en `CLAUDE.md`
    la regla de las tres funciones (veredicto / estado / orientación —
    si repite el título de al lado, se poda). Auditoría completa del
    ecosistema: se podaron los 4 kickers de pasos del simulador ("Tu
    grupo", "Cobertura", "Zona", "Las edades" — la checklist "Paso X de
    4" ya orienta y cada pregunta se titula sola); el resto del sistema
    pasó la auditoría (badges de veredicto, etiquetas de honestidad,
    kickers de sección con nombre propio, headers de tabla y footer).
11e. **Primera ola de la auditoría de conversión — ejecutada (20 jul
    2026, aprobada por el usuario; BITACORA cap. 30)**: (a) **un solo
    verbo comercial** — "Simulá tu plan" en hero, cierre, footer, banda
    Senior ("Simulá Plan Vital"), kicker/título del simulador y OG
    (convivían cinco rótulos; `BRANDSCRIPT.md` §5 actualizado — el guion
    manda); (b) **WhatsApp siempre con contexto** (salvaguarda Galperin):
    el comparador prellena el plan elegido y la FAQ su tema; (c) **la FAQ
    ofrece el paso siguiente** (preexistencias y cambio de plan →
    WhatsApp por tema; precio → simulador), con `faq`/`barra_movil` como
    orígenes nuevos en ANEXO §2; (d) **barra CTA fija en móvil** (Simulá
    tu plan + WhatsApp, ≤820px, zona del pulgar) reemplaza a los dos
    flotantes que tapaban texto — con guardián computado en
    `qa/qa-integral.mjs` (barra visible tras scroll, flotantes ocultos,
    copyright por encima); (e) **ancla de precio en pantalla 1**:
    microcopy bajo las puertas del hero y ticks en la intro del simulador
    ("planes desde ₲ 238.000" sale de `plans()`, nunca a mano). Lo que
    depende del **test de 5 segundos** (categoría en el hero, acción
    dominante única, portada -20%, fusión intro+pregunta 1) sigue EN
    PAUSA (§3c) — dos auditorías independientes ya coinciden en esos
    puntos. El punto "logos de aliados en gris en táctil" se propuso y
    el usuario decidió NO tocarlo (20 jul) — no reabrir sin pedido suyo.
11f. **Simulador desktop rediseñado (20 jul 2026, pedido del usuario:
    "la versión desktop todavía no se ve bien")**: fondo continuo
    hero→tarjeta (el degradé pasó a la sección de la tarjeta; antes había
    una costura #00294f→#003B71), tarjeta de 920px con rail de 280px en
    ≥1100px, y la intro llena su espacio con datos útiles (desde ₲,
    4 pasos, 10% con débito) en vez de media tarjeta en blanco. El móvil
    quedó intacto (decisión 11c y sus guardianes de geometría).
11g. **Tipografía display: Nunito Sans (20 jul 2026, decisión del
    usuario; BITACORA cap. 29)**: la licencia anual de Gilroy no se podía
    pagar; Nunito Sans (SIL OFL, gratis) la reemplazó 1:1 — mismos pesos,
    mismas reglas, variable renombrada a `--font-display`. Los TTF de
    Gilroy salieron del repo (riesgo legal); la guía lleva sus TTF de
    Nunito Sans y la web el variable woff2 (subset latin). Ojo: `/v1/`
    (congelado) todavía sirve los TTF viejos de Gilroy — decidir si el
    snapshot se baja o se tolera mientras sea demo interna.
11h. **El paso "Zona" se volvió "¿Dónde querés tu cobertura?" (21 jul
    2026, decisión del usuario tras la reunión MKT/Ventas del 20 jul;
    BITACORA cap. 31)**: la persona escribe SU CIUDAD (buscador tolerante
    en `app/geo.js`: 18 departamentos, ~97 ciudades, aliases "CDE",
    "Santaní", acentos) o toca un chip, y el departamento se resuelve
    solo; fallback "elegí tu departamento" con las ciudades como pista.
    Por qué: ventas pierde negocios por CIUDAD ("Filadelfia"), no por
    "interior", y ese dato hoy no se registra en ningún lado — cada
    elección emite `sim_zona {ciudad, departamento, via}` y cada búsqueda
    sin match `sim_zona_sin_lista {texto}` (ANEXO §2): la contraparte web
    del etiquetado de pérdidas por ciudad que se le pidió a Estefanía en
    HubSpot. Juntas arman el caso al directorio de "dónde falta red".
    Reglas: (a) **sin cobertura nunca bloquea** — el precio se muestra
    igual y la nota de red es honesta (`redNota` en geo.js: solo
    Asunción/Central se comunican como zona con red confirmada; el resto
    "la red está creciendo, tu asesor te confirma" — nunca "no
    cubierto", decisión #7); (b) **price-ready**: `DEPT_AJUSTE` por
    departamento existe y es neutro (=1, el tarifario vigente es
    nacional) — cuando la mesa técnica defina precio por zona
    (estrategia a 3 años del usuario), se cargan los factores y listo;
    (c) las simulaciones guardadas con el formato viejo (`geo` string)
    siguen retomándose sin romper. **Pendientes que nacen acá**: cargar
    la red real por ciudad cuando llegue la base de prestadores
    (pendiente B) para que `redNota` hable con datos; y revisar
    `sim_zona_sin_lista` en el ritual mensual (#11) para sumar ciudades
    al índice.
11i. **Modo app del simulador en desktop + hover reveal (21 jul 2026,
    pedido del usuario: "la ideal es no escrollear, tener todo en una
    pantalla, casi como una app")** — ejecuta la evolución 100dvh que
    11c había dejado declarada: en ≥1100px el hero se compacta y la
    tarjeta tiene altura fija (`clamp(460px, 100dvh−275px, 680px)`);
    header + hero + tarjeta = una pantalla, la página NO se mueve al
    avanzar de paso (el auto-scroll de 11c queda solo en ≤1099px) y lo
    que no entra (lista de departamentos, resultado) scrollea DENTRO
    del cuerpo, que resetea su scroll interno en cada paso. El centrado
    vertical usa `::before/::after{margin:auto}` para no romper el
    overflow. En móvil el hero del simulador se compactó (la bajada se
    oculta ≤640px) para que la tarjeta arranque en el primer
    pantallazo; el comportamiento fino de 11c no se tocó. **Hover
    reveal** en ciudades y departamentos (pedido del usuario: "que el
    botón sea invisible hasta que uno acerca el puntero"): filas y chips
    planos que al hover se vuelven botón (fondo mint, título teal,
    chevron que aparece) — SOLO bajo `@media(hover:hover)`; en táctil
    los chips conservan su borde visible porque sin puntero no hay
    reveal. Guardián nuevo en el QA: en 1366×768 y 1440×900 la tarjeta
    entra en pantalla y el flujo no scrollea la página.
    *Refinado en el día (poda del usuario, 21 jul)*: (a) el hero del
    simulador quedó SOLO con el título — el kicker "Simulá tu plan" y la
    bajada repetían lo que la tarjeta ya dice (los ticks de la intro, el
    candado del rail); el espacio liberado se lo quedó la tarjeta (hero
    171→70px, tarjeta hasta 760px de alto — menos scroll interno);
    (b) **"← Volver y ajustar" en el resultado**: vuelve un paso (a las
    edades, salteando el paso dormido de adicionales) para evaluar
    decisiones sin arrancar de cero — antes solo existía "Empezar de
    nuevo"; lo configurado queda y el precio se recalcula;
    (c) FYI del usuario codificado en `geo.js`: **Asunción y Central son
    UNA zona de cobertura** (`ZONA_COBERTURA` las agrupa como
    'asu-central') — administrativamente dos, para red y futuro precio
    por zona, una.
11j. **Segunda ola de auditoría — estratégica (CRO/UX/contenido/CX,
    22 jul 2026).** Auditoría de la web contra la pregunta central "¿la
    web cura o repite la enfermedad de prometer más de lo que cumple?".
    Veredicto: **empieza a curar** (precio real sin pedir datos, "qué
    cubre" con topes/copagos reales, demos bien rotuladas), con **un foco
    crítico**: el bloque "Lo que casi nadie te garantiza" promete
    telemedicina "garantizada por contrato" y laboratorio a domicilio
    (`app/page.jsx:82-84`) que **los cuadernillos volcados no documentan**
    (`datos/planes-vigentes/*.json`) — la enfermedad textual, en el bloque
    que debía probar lo contrario. **Ejecutado en este PR (arreglos que no
    dependen de datos nuevos ni del test de 5 seg en pausa §3c):**
    (a) **"Mi SP" ahora es puerta persistente del afiliado en desktop** —
    link en el nav y en el footer (antes solo vivía en el hero y el menú
    móvil; el cliente actual se quedaba sin camino al scrollear — contradecía
    "retención primero"); (b) **honestidad pareja en la Guía**: badge visible
    "Datos de ejemplo" en "Los más buscados" y en el conteo "590 prestadores"
    (el caveat vivía solo en un comentario HTML invisible), y "el ranking se
    calcula automáticamente" pasó a futuro; (c) **"sin letra chica" se
    desacopló del hero de la Guía** (`guia_home.html:104`) — esa promesa se
    gana donde se muestran límites reales (el "qué cubre" del home), no sobre
    un directorio de prestadores ilustrativos. **Bug latente arreglado de
    paso** (BITACORA cap. 32): el nav desktop ya desbordaba por debajo de
    ~1145px cortando el CTA "Simulá tu plan"; ahora colapsa al menú
    hamburguesa (que tiene todo, incluida Mi SP) por debajo de 1200px.
    **Queda pendiente del material del usuario (Drive de contratos, en
    marcha):** el Crítico de telemedicina/domicilio (¿el contrato lo
    respalda? si no, reetiquetar "En camino"), el bloque "qué no cubre / qué
    pagás aparte" (regla de tono: gris, nunca rojo) y las carencias con
    número — todo necesita el detalle de exclusiones/AD y los cuadernillos
    Silver/Gold. **Requiere validación externa:** "Vigilado por
    Superintendencia de Salud" (footer de la guía) — confirmar nombre del
    ente y registro. **Decisión de negocio abierta:** ¿SP Empresas/B2B entra
    en el alcance de la web? El brief del usuario nombra tres públicos, los
    docs internos declaran dos. El informe completo de la auditoría se
    entregó en la conversación.
11k. **Consulta caliente: el comparador entra al simulador, no a WhatsApp
    (22 jul 2026, intuición del usuario — BITACORA cap. 35).** El botón
    "Consultar este plan" del comparador saltaba a un **WhatsApp frío**:
    el asesor recibía "Hola, quiero Silver" y **empezaba de cero** el
    descubrimiento (¿cuántos son?, ¿edades?, ¿te conviene?) — el proceso
    doloroso otra vez. El usuario lo reencuadró: *"la consulta tiene que
    ser la cereza sobre la torta, no el arranque del laburo; la persona
    tiene que llegar sold on the idea"*. Nuevo flujo: **comparador →
    simulador con el plan puesto → su precio para su familia → cierre
    humano**. Detalle (3 decisiones del usuario): (a) **plan editable pero
    puesto** — entra con el nivel pre-elegido (`/simulador/?plan=bronce|
    silver|gold`), el simulador **saltea el paso "¿qué plan?"** (3 pasos en
    vez de 4; adelante y al volver) y en el resultado hay un **mini-
    comparador con TU precio** (Bronce/Silver/Gold, cada uno con la prima
    de tu grupo) para cambiar sin salir; (b) **cierre con los dos, principal
    dejar el dato** — el form "un asesor te escribe" es primario, el
    WhatsApp secundario ya lleva el plan (cierre caliente); (c) **hilito
    "por esto importa"** bajo el comparador → nota de gasto de bolsillo (el
    porqué racional, no un CTA a cotizar). Eventos nuevos: `sim_plan_preset`,
    `sim_plan_switch`, `blog_open{origen:comparador}`. Verificado: QA
    integral 0 roto + walkthrough del flujo nuevo (13 checks). El resultado
    con plan puesto rotula "Tu plan elegido" (no "recomendado"). Territorio:
    `app/page.jsx`, `app/components/Simulador.jsx`.
11l. **Crítico de la auditoría resuelto — el bloque "por escrito" ya no
    sobrepromete (22 jul 2026; verificado contra los 4 contratos SP,
    BITACORA cap. 36).** El home, en "Lo que casi nadie te garantiza"
    (`app/page.jsx`, `difsData`), prometía tres cosas que el contrato no
    respaldaba parejo: "Telemedicina **garantizada por contrato**", "Médico
    y **laboratorio a domicilio**" y "Salud mental incluida" (sin distinguir
    plan). Se leyeron los cuatro cuadernillos SP (Bronce/Silver/Gold + Vital)
    en el Drive: **telemedicina NO existe en ningún plan** (el único "video"
    es videolaparoscopía, técnica quirúrgica); **"laboratorio a domicilio"
    tampoco** (los labs son siempre en laboratorio habilitado; ojo:
    **enfermería a domicilio está EXCLUIDA**, cláusula 2.9.2). Sí son reales y
    quedaron con su número: **consulta médica a domicilio** (Bronce 2 /
    Silver 3 / Gold 4 eventos/año, secc. 2.9.1.5, vigencia inmediata) +
    urgencias/ambulancia a domicilio sin cargo; y **salud mental** en
    Privilege (psicología y psiquiatría, Bronce 3 / Silver 5 / Gold 6
    sesiones) — **Vital NO la incluye** (arancel preferencial). Fix: (a)
    telemedicina → tarjeta **"Sin letra chica"** (ves qué cubre y qué pagás
    aparte antes de firmar: pasa de contradecir la tesis del sitio a
    probarla); (b) "Médico a domicilio" con los números reales, sin
    "laboratorio"; (c) salud mental acotada a "los planes Bronce, Silver y
    Gold". El cuerpo de las tarjetas pasó a Inter (regla tipográfica: es
    prosa). QA integral: 0 roto, sin hallazgos nuevos (los mismos 6
    pre-existentes de contraste/testimonios). Territorio: `app/page.jsx`.
    **Pendiente afuera:** el filtro "Telemedicina" de la guía si SP no va a
    ofrecerla.
11m. **"Lo que pagás de tu bolsillo" — el sitio empieza a explicar lo que NO
    cubre (22 jul 2026; pendiente #2 de la Parte 2 + pedido de la reunión con
    departamentos; BITACORA cap. 37).** Nueva sección en el home (`app/page.jsx`,
    después del comparador) contra la "incertidumbre del plan" —el tema central
    de la reunión— con la data confirmada y en gris (regla de tono: nunca rojo,
    nunca "No cubierto" a secas): (a) **los tres modos en criollo** — Cubierto
    (no ponés nada) · Copago (ponés una parte) · Al precio de convenio (no lo
    cubre el plan, pero al precio negociado de SP, no al particular — cláusula
    2.10, la versión honesta de "arancel diferenciado"); (b) **cobertura real
    por plan** — Bronce 45% / Silver 66% / Gold 93% cubierto al 100%, con barra
    apilada (el gradiente ES el upsell honesto); (c) **exclusiones verdaderas**
    planas — odontología, bariátrica, tratamiento oncológico, alta complejidad
    ("mejor saberlo hoy que en la sala de espera"). Datos de
    `ANALISIS-arancel-diferenciado.md` (§2 cobertura real y §4 AD=convenio). QA
    integral 0 roto (se arregló de paso un contraste del footnote, #8a8a8a→#666
    sobre panel casi-blanco). Territorio: `app/page.jsx`. **Sigue pendiente:** el
    glosario BUSCABLE completo — Visaciones ya tiene la lista de FAQs
    (pedírsela); acá quedó embebido solo el glosario mínimo (los 3 modos).
11n. **Blog por categorías (22 jul 2026, pedido de la reunión con
    departamentos: "separar los artículos en categorías, una = prevención").**
    El índice de `/blog` ganó pastillas de filtro por categoría —client-side,
    el SSR rinde todas las notas (SEO y no-JS ven todo)—. Dos categorías hoy:
    **Prevención** (3) y **Entendé tu plan** (5, sinergia con la claridad recién
    subida). Campo `categoria` nuevo en el frontmatter (documentado en
    `contenido/README.md`; sin categoría → "General"). Componente nuevo
    `app/blog/BlogList.jsx` (cliente) al que `page.jsx` le pasa las notas ya
    serializadas + fecha formateada, para no arrastrar `fs` al bundle. QA 0
    roto, /blog 153 KB. Territorio: `app/blog/*`, `lib/blog.js`, las 8 notas,
    `contenido/README.md`. Futuro (si SEO sube): páginas por categoría
    (`/blog/categoria/…`) — hoy es filtro sin ruta nueva.
11o. **Solo Bronce/Silver/Gold en la web — simplificar, no reflejar la
    realidad (22 jul 2026, decisión del usuario; BITACORA cap. 38).** SP tiene
    muchos más productos que los de la web ("miles", formas traslapadas de los
    mismos). El usuario decidió NO modelarlos: los nuevos Esencial/Integral/
    Premium son las versiones mejoradas de Bronce/Silver/Gold y llegan en 2-3
    meses; poner el resto hoy "son más confusos otra vez". **Regla de diseño
    para toda sesión: escribir siempre sobre Bronce/Silver/Gold, no mencionar
    los otros productos**, y dejar el set armado para que los nuevos planes sean
    un swap de datos (`plans()` + `TARIFAS` + `cart()`), no un rehacer.
    "Privilege" es nombre interno; lo público es Bronce/Silver/Gold.
11p. **La plataforma quedó decidida: el prototipo Next.js ES la web pública
    (23 jul 2026, decisión del usuario; BITACORA cap. 39).** Cierra el
    pendiente #8 (WordPress de BuenaVista vs Next.js), que "condicionaba todo
    el trabajo siguiente". Textual: *"el prototipo va a ser la web… a muchísimos
    les está gustando cómo está quedando"*. Se descarta WordPress como
    plataforma; BuenaVista, si entra, es implementador/hosting, no dueño del
    diseño. **Consecuencia para SEO:** el bloqueo técnico era esta decisión —
    la infra de las páginas Next.js ya está lista (robots/noindex/sitemap/
    canonicals/OG/JSON-LD, se prende con `NEXT_PUBLIC_INDEXABLE=true` +
    `SITE_URL`). Faltan, concretas: (a) el **hostname público del sitio** (para
    `SITE_URL`) y el **dominio de la guía** (#9, ampliado); (b) **quitar el
    `noindex` hardcodeado de los 3 `guia/*.html`** (checklist #8b — el flag de
    Next.js NO los cubre); (c) la decisión de negocio de **cuándo salir
    público** (hoy noindex a propósito, por los precios de referencia). Lo que
    mueve la aguja ya está en marcha: el blog (2-3 notas/semana, ahora por
    categorías) y la guía médica como directorio verificable (esta última,
    cuando tenga datos reales de prestadores, pendiente B).
11q. **Estrategia de imágenes + portadas de marca generadas (23 jul 2026,
    pedido del usuario; BITACORA cap. 40).** El problema: los diseños salían
    "sin imágenes" y conseguirlas a mano (ChatGPT/Gemini/Envato) no escala. La
    causa: un asistente de código genera código, no píxeles → la solución es que
    el código genere lo visual. **Tres capas:** (1) **portadas de marca por
    código** (SVG: degradé + formas + ícono de categoría, `app/blog/Cover.jsx`)
    — costo cero, sin conector, automáticas; capa default, ya en el blog;
    (2) **stock (Pexels/Envato) o IA por API** (centavos/imagen, en el motor de
    contenido) para una "foto" real-ish puntual (héroes/secciones) — falta
    elegir proveedor con el usuario; (3) **fotos reales** (Lister, equipo) — el
    destino, toma tiempo, no bloquea. **Regla:** `cover` opcional en el
    frontmatter (una foto real manda); sin él, la portada generada — el sitio
    nunca queda sin imagen. En el mismo cambio: **schema.org `BlogPosting`** por
    nota (SEO on-page, inerte con noindex, listo para el flip). Territorio:
    `app/blog/*`, `lib/blog.js`, `contenido/README.md`.
11r. **Agendamiento directo, sin login: el espacio `/agendar` (24 jul 2026,
    pedido del usuario; BITACORA cap. 41).** Pedir un turno no debe estar
    enterrado detrás del login de Mi SP — *"capaz tiene que haber un espacio
    directo de agendamiento para no dar muchas vueltas"*. **Regla de IA que
    queda:** las **acciones de alta intención** (agendar, simular, urgencias)
    van **directas, sin login**; lo **personal** del afiliado (mis turnos, mi
    red, credencial, pagos) queda detrás del login de Mi SP. Nuevo `/agendar`
    (`app/agendar/`): centro (Lister primero) → especialidad → cuándo → nombre,
    y **handoff a la recepción de Lister por WhatsApp** (la persona llega
    "caliente", con todo cargado) — sin backend, funcional hoy; el día que
    exista el sistema real de turnos se enchufa detrás sin mover la experiencia.
    "Agendar" entró **directo en la nav** (desktop + menú móvil; se subió el
    corte de colapso del nav a 1279px para no desbordar con el link nuevo).
    Eventos nuevos (ANEXO §2): `cta_agendar`, `agendar_envio`, `agendar_llamar`
    (sin PII). QA 0 roto, /agendar en el sitemap y en la suite. Territorio:
    `app/agendar/*`, `app/page.jsx` (nav), `app/globals.css`, `app/sitemap.js`,
    `qa/qa-integral.mjs`. **Sigue en camino:** el header unificado tipo Anthropic
    (POC) — ya con "Agendar" en su lugar en la nav.
11s. **Header fluido tipo Anthropic — POC del desglose (24 jul 2026, pedido del
    usuario).** El header hoy NO es una experiencia única: cada módulo
    reimplementa el suyo (home rico; blog/artículo/historia/Mi SP/simulador =
    "logo + volver"), sin componente compartido ni desglose. Modelo pedido:
    Anthropic — header idéntico en todo el sitio, vidrio, y cada título que se
    **desglosa** en un panel con animación suave ("un poco, pero no demasiado").
    **Primer paso, en la home:** tres **mega-menús fluidos** — **Cobertura**
    (ex "Qué cubre", con "Preguntas" adentro), **Planes**, y **Mi SP**
    (desplegable de usuario con Agendar / Ver mi red / Ir a Mi SP) — panel de
    vidrio que se revela con hover/focus (fade+slide 180ms), chevron que rota,
    ítems con título + subtítulo (`.navmenu*` en `globals.css`; CSS puro, sin
    JS, accesible por teclado con `:focus-within`). El header se **simplificó**
    (de 7 a 4 ítems de texto): "Preguntas" pasó adentro de Cobertura y "Agendar"
    adentro de Mi SP (feedback del usuario: "son demasiados ítems"); el corte de
    colapso del nav volvió a 1199px.
    Verificado: `backdrop-filter` computa (no lo tragó el minificador), QA 0
    roto, Tab recorre 12 elementos. Se le dio ancla `#bolsillo` a la sección de
    claridad para deep-link. Territorio: `app/page.jsx`, `app/globals.css`.
    **Migración en curso (el grueso) — `app/Header.jsx` (24 jul 2026).** El POC
    quedó aprobado (el usuario fusionó #51) y arrancó la extracción a un
    **componente compartido**: `app/Header.jsx` es autocontenido (maneja su
    propio estado de menú móvil y el toggle transparente→sólido) con tres
    variantes por fondo — `hero` (home: vidrio oscuro→sólido al scrollear),
    `dark` (páginas navy: vidrio oscuro fijo, links blancos) y `solid` (páginas
    de lectura claras: sólido/claro fijo, links oscuros — sobre blanco el vidrio
    oscuro dejaría el texto ilegible). Los anchors apuntan a la home
    (`${BP}/#cartilla|#comparar|#bolsillo|#faq`) para funcionar desde cualquier
    módulo. **Primera ola: el blog** — índice (`app/blog/page.jsx`, `dark`) y
    nota (`app/blog/Articulo.jsx`, `solid`) ya no reimplementan "logo + volver":
    llevan el nav real con los tres mega-menús y el overlay móvil. La home sigue
    con su nav inline intacto (variant `hero` se aplicará en una ola futura para
    no arriesgar la regresión de lo recién aprobado). Verificado: build OK, QA 0
    roto (87 links internos responden), menú móvil abre/cierra, screenshots
    desktop+móvil de índice y nota.
    **Sigue pendiente:** rodar `Header.jsx` a los módulos restantes (agendar,
    Mi SP, historia, simulador) y a la home (variant `hero`, reemplazando el nav
    inline de `app/page.jsx`), más su **gemelo en la guía** (HTML/Tailwind).
    Territorio de esta ola: `app/Header.jsx` (nuevo), `app/blog/page.jsx`,
    `app/blog/Articulo.jsx`.

11t. **Auditoría de honestidad del home — las herramientas que prometían y
    no cumplían (24 jul 2026, observación del usuario).** El usuario señaló que
    dos módulos del home no cumplen su utilidad: (a) el "comparador" **no compara
    — es un slider** que muestra un plan a la vez, con la tabla que sí compara
    (11 servicios × Bronce/Silver/Gold) **escondida detrás de un toggle**; y (b)
    el buscador de "Guía Médica" del home **promete búsqueda y termina en
    redirección**: está etiquetado *Guía Médica* pero busca sobre solo 11
    coberturas y, ante cualquier término fuera de ese índice, expulsa a la página
    de la guía. Lo único que le funcionó fue **el simulador** — porque da una
    respuesta personal y completa **ahí mismo**. De ahí el principio: *una
    herramienta se gana el home solo si responde ahí mismo; si redirige o pliega
    el premio, es una puerta disfrazada de herramienta.* Plan acordado con el
    usuario ("adelante", 24 jul 2026).
    **Ola 1 — buscador (HECHO en este PR):** la sección `#cartilla` deja de ser
    un buscador falso. Se quitó la caja de texto abierta (con 11 ítems, una caja
    promete saber todo y falla) y la redirección-al-no-encontrar; ahora es un
    **explorador curado**: los 11 servicios reales como chips → tarjeta
    Bronce/Silver/Gold al toque, sin salir del home. Se **separó la conflación**:
    el título deja de decir "Guía Médica" (pasa a *"Qué cubre tu plan"*), y la
    Guía Médica (buscar médico/sanatorio) queda como **puerta honesta** — una
    tarjeta-CTA *"¿Dónde atenderte?"* que abre la guía, donde la búsqueda SÍ
    devuelve resultados. Chip activo pasó a teal accesible `#007d77` (blanco
    sobre `#00BCB4` daba 2.37:1). Territorio: `app/page.jsx`.
    **Ola 2 — comparador + explorador + `/planes` (PENDIENTE, ya acordada;
    feedback afinado del usuario 24 jul 2026).** El usuario miró el slider Y el
    explorador de "qué cubre" y detectó que comparten UNA misma falla:
    **revelan una porción a la vez** (el slider, un plan; el explorador, una
    cobertura), así que "no parecen completos" y "no son tan prácticos". Su
    instinto, textual: *"un comparador que se ve de entrada es mucho mejor"*, y
    *"tiene que ser divertido/interactivo pero al mismo tiempo dar mejor
    claridad"*. La regla que sale (cap. 45): **la interacción tiene que AGREGAR
    claridad, no ser la reja que la tapa** — se muestra el todo de entrada, y
    tocar/hover/expandir es un bonus de profundidad, no el único modo de ver
    algo. Test: *si sacás la interacción, ¿el núcleo sigue claro?* Slider y
    explorador hoy fallan ese test. Y su pregunta abierta (home vs. espacio
    dedicado) se responde **por profundidad**: el **home** muestra un resumen
    **completo de un vistazo** (la comparación entera al llegar) + puerta; el
    espacio dedicado (`/planes`, quizá `/cobertura`) guarda el detalle
    exhaustivo, clickeable, con aire y bueno para SEO.
    **Comparador — PROTOTIPO, iter 2 (24 jul 2026), a la espera del ok visual
    del usuario (NO fusionar sin su sí — decide mirando).** Iter 1 fueron 3
    **tarjetas de precio**; el usuario: *"muy genérico, no veo la diferencia"*
    (BITACORA cap. 47 — una diferencia solo se ve alineada, y restando lo igual).
    Iter 2 fue una tabla-diff con **teal condicional** (resaltar solo donde cada
    nivel mejora) — el usuario, con ojo de CX, la volteó: *"prioriza ser ingeniosa
    sobre ser clara; me obliga a leer una regla antes de entender; y castiga a
    Gold"* (Gold quedaba gris donde ya estaba al 100% desde Silver → Silver se veía
    más completo que el premium). **Iter 3, la forma ACTUAL (BITACORA cap. 48):**
    tabla "lo que cambia" con **"Al 100%" en teal CONSISTENTE en los tres** (Gold
    ya no se apaga); **Silver resaltado como "la más elegida"** (badge + tinte de
    columna — anclaje); una **línea humana** bajo cada plan (para quién es); **sin
    barras** (eran ruido); y lo común, abajo, como **garantía positiva** ("Todos
    los planes te garantizan…"), no letra chica. Encabezado con precio + CTA
    (#007d77) por plan. En móvil scrollea horizontal con la **columna de servicios
    pegada** (`.cmp-lbl` sticky).
    **Rename de marca (pedido del usuario):** unificado a **Bronze, Silver, Gold**
    (antes "Bronce" en español mezclado). Es site-wide (`quote.js`, comparador,
    `/planes`, simulador, etc.); el mapa `?plan=` del simulador acepta `bronze` y
    `bronce` (links viejos no se rompen). Territorio extra de esta iter:
    `app/quote.js`, `app/components/Simulador.jsx`, `app/coverage.js`,
    `app/Header.jsx`, `app/planes/*`. El detalle fila-por-fila (11 servicios) se **mudó a `/planes`** (nueva
    página, `Header variant="solid"`): tabla 11 servicios × 3 planes con estado
    real y detalle, precios y CTA por plan en el encabezado. El home lleva una
    puerta *"¿Querés el detalle fila por fila? Ver todos los planes → /planes"*.
    La data de cobertura se extrajo a **`app/coverage.js`** (fuente única
    compartida home + /planes). `/planes` agregado a sitemap y a las PAGINAS del
    QA. Territorio: `app/page.jsx`, `app/coverage.js` (nuevo), `app/planes/*`
    (nuevo), `app/globals.css`, `app/sitemap.js`, `qa/qa-integral.mjs`.
    **Falta de la ola 2:** el **explorador "qué cubre"** todavía es de-a-una-
    cobertura; aplicarle el mismo principio (matriz compacta cobertura×plan de un
    vistazo, chips como filtro) — pendiente, después del ok del comparador.

11u. **Vocabulario de hover — que todo lo interactivo telegrafíe el toque
    (24 jul 2026, pedido del usuario).** El usuario señaló (con el subrayado de
    "Policy" en Anthropic) que faltaba señal de hover: *"que se sienta que estás
    tocando algo… necesitamos poner más eso en toda la web"*. Los botones y
    tarjetas ya avisaban (color/lift); el hueco eran los **links de texto**. Se
    agregó al CSS compartido (`app/globals.css`, cae en todos los módulos): en el
    nav, un **subrayado que crece** de izquierda a derecha (`currentColor` →
    sirve sobre nav oscuro y claro; los desplegables siguen con el chevron, sin
    subrayado bajo él); en links inline (`.link-teal/.link-grey`), de footer
    (`.foot-link`) e ítems del menú móvil (`.menu-item`), el subrayado aparece
    (color transparente→`currentColor`, sin mover el layout). Todo refleja en
    `:focus-visible` (teclado) y respeta `prefers-reduced-motion`. Es la capa
    micro del mismo objetivo que la ola 2 (macro): que la web se sienta
    interactiva y considerada. Pendiente si el usuario quiere más: chips e
    interactivos sin clase compartida (requieren pasada por módulo).

11v. **Previews por rama con Cloudflare Pages (24 jul 2026, pedido del usuario:
    "¿cómo veo la rama sin fusionar?").** `main` sigue en GitHub Pages; se suma
    Cloudflare Pages para dar **una URL en vivo por rama y por PR**, para revisar
    antes de fusionar. El `next.config.mjs` ya hace `basePath = env || ''`, así
    que en Cloudflare **no se setea `NEXT_PUBLIC_BASE_PATH`** (sirve desde la raíz
    de `*.pages.dev`; el prefijo `/sp-prototipo` es solo de GitHub Pages). Se
    agregó `.node-version` (Node 20) y **`docs/PREVIEW.md`** con los pasos de
    conexión (una vez, dashboard de Cloudflare — lo hace el dueño de la cuenta).
    Territorio: `.node-version`, `docs/PREVIEW.md`.

11w. **⚠ El "puente de venta" — la transición al simulador tiene que respirar
    empatía (24 jul 2026, dirección estratégica del usuario). EN DISEÑO, acordar
    antes de construir.** El usuario nombró la fractura clásica: una página de
    precios cálida y clara (la promesa) que, al clickear, cae en un formulario que
    "escupe un número" (cotización fría) — y en un segundo pasás de asesor de
    confianza a **cajero automático**. Su regla: *la promesa de marketing y el
    proceso de venta tienen que ser el mismo material; el cierre debe respirar
    humanidad, empatía, integridad y responsabilidad.* Estado real hoy: el puente
    está **a medio construir** — el `?plan=` entra puesto (sin re-preguntar), sin
    login, el precio sube animado y personalizado, hay objeciones respondidas y un
    handoff humano. Pero el **centro sigue siendo transaccional**: el número llega
    solo (sin contexto ni tranquilidad), la captura de datos puede leerse como
    peaje, y el asesor es anónimo. **Dirección propuesta (a diseñar con el
    usuario):** (1) contextualizar el número ("para tu familia de N, con lo que
    elegiste — este es tu punto de partida" + qué ya incluye); (2) enmarcar los
    datos como regalo, no peaje ("te lo guardamos y te lo mandamos"); (3) ponerle
    cara/nombre al asesor; (4) mantener la MISMA lengua cálida de la tabla. Toca
    `app/components/Simulador.jsx` (conversión — no tocar sin acordar).
    Relacionado — **auditoría/rebalanceo de la home** (dec. previa, "valle de la
    súper saturación"): tres tablas de datos apiladas arriba y en tono negativo;
    pendiente el mapa sección-por-sección (qué se queda / comprime / baja a página
    profunda / reencuadra en positivo).

11x. **El lead dejó de ser teatro — envío honesto con puente WhatsApp (25 jul
    2026, aprobado por el usuario; BITACORA cap. 49).** "Enviarme mi cotización"
    marcaba `sent:true` y no enviaba nada: la tarjeta de éxito prometía un
    asesor que jamás iba a escribir (violaba el principio inmutable #7 en el
    sitio publicado). Ahora el submit tiene un canal real con respaldo:
    (a) **CRM listo para enchufar** — `HUBSPOT_PORTAL_ID = '48242096'` (portal
    real de SP) y `HUBSPOT_FORM_ID` en `app/quote.js`; con el ID cargado, el
    lead viaja a HubSpot por la API pública de formularios (funciona desde el
    sitio estático, sin backend). **Falta crear el formulario en HubSpot**
    (Marketing → Formularios) con campos `firstname`, `phone`, `email`,
    `message` — al pegar su ID el CRM queda vivo sin tocar más código.
    (b) **Puente WhatsApp mientras tanto y ante fallas** — sin formId (hoy) o
    si el POST falla, la tarjeta post-envío pide "un solo toque": botón que
    abre WhatsApp con la cotización entera prellenada (nombre, plan, precio,
    grupo y el número de contacto DENTRO del mensaje, por si escriben desde
    otro teléfono). Cada dato pedido se usa (principio #3) y una falla nunca
    es un lead perdido (misma doctrina que el cero-resultados de la guía).
    (c) **Eventos**: `sim_lead_submit` ahora lleva `via: 'crm'|'whatsapp'`;
    nuevo `sim_lead_crm_error`; `click_whatsapp{origen:'simulador_lead'}`.
    Nombre/tel/email jamás en la analítica. El formulario sigue primario y el
    WhatsApp secundario (decisión 11k-b intacta); el rediseño empático del
    puente de venta (11w, EN DISEÑO) corre por encima de esta cañería y no
    queda condicionado por ella. Territorio: `app/quote.js`,
    `app/components/Simulador.jsx`.

11y. **Resalte balanceado en el comparador + poda del FAB redundante (25 jul
    2026, observación del usuario). HECHO.** Dos afinados de la home, misma raíz
    ("ruido que no se gana su lugar", ver BITACORA cap. 50):
    - **Comparador:** el badge "La más elegida" de Silver vivía dentro del flujo de
      su columna y empujaba el nombre hacia abajo, descuadrando la línea base de las
      tres columnas ("desbalancea la estética"). Fix: **ranura de badge de alto fijo
      en las TRES columnas** (vacía en Bronze/Gold) — nombres, precios y CTAs quedan
      alineados; el resalte de Silver queda como franja teñida serena, no como bulto.
      Regla general: *un elemento que aparece en un ítem de una grilla comparativa
      reserva su alto en todos.*
    - **FAB flotante:** se eliminó el pill "Simulá tu plan" flotante (desktop, abajo
      a la derecha) — el header es `position:fixed` y ya lleva ese CTA en el scroll,
      así que el FAB repetía el mismo verbo a 300px. **Se conserva** el WhatsApp
      flotante (otra acción) y, en móvil, la barra CTA inferior (Simulá + WhatsApp)
      intacta. Regla de etiquetas aplicada a CTAs: *un botón se gana su lugar solo
      si ofrece un destino o momento que otro no cubre.* Tocó `app/page.jsx`
      (comparador + bloque flotantes + scroll useEffect) y `app/globals.css`
      (`.cotizar-fab`/`.fab-full`/`.fab-short` eliminadas).

11z. **Comparador móvil que encaja + protagonismo de las tres piezas bajo la tabla
    (25 jul 2026, observación del usuario). HECHO** (mismo PR #59, BITACORA cap. 51):
    - **Móvil:** la tabla con scroll horizontal mostraba un solo plan y la columna
      de servicios se comía la pantalla ("no se ve tan bien… algo que encaje"). La
      grilla pasó a clase (`.cmp-row`/`.cmp-inner`) para reencuadrar por CSS: en
      ≤640px la etiqueta se angosta a 104px y los planes se ensanchan → entran DOS
      planes completos + asomo del tercero (affordance), con la etiqueta pegajosa y
      un rótulo "Deslizá para comparar los tres planes →" (`.cmp-hint`, solo móvil).
      Desktop sin cambios. Regla: *el teléfono no es la web angosta — comparativa en
      móvil = etiqueta angosta+sticky, 2 planes visibles, asomo del 3º, hint de scroll.*
    - **Protagonismo:** las tres piezas bajo la tabla (garantía "Todos los planes te
      garantizan", "Ver todos los planes", "un seguro no es un gasto") estaban muy
      chicas ("es magnífico, pero se ve muy pequeño… más protagonismo"). Se
      agrandaron: la garantía con check en círculo teal + más cuerpo; "Ver todos los
      planes" ahora es CTA con borde (hover relleno, `.cmp-verplanes`); el "un seguro
      no es un gasto" más grande. Regla: *un buen elemento subdimensionado se saltea
      — calidad no compensa falta de peso visual.* Tocó `app/page.jsx` + `app/globals.css`.

12a. **⭐ REGLA DE COLOR: el teal brillante decora, el profundo carga texto blanco
    (25 jul 2026, decisión explícita del usuario). HECHO** (BITACORA cap. 52).
    El QA venía marcando dos contrastes en `/simulador/`; al medir con el navegador
    apareció que el problema era **sistémico**: `#00BCB4` con texto blanco daba
    **2.37:1** (mínimo 4.5:1) — y ese es el CTA "Simulá tu plan", el botón más
    importante del sitio, presente en el header de TODAS las páginas. La marca
    entera apoyaba su acción principal en un color que no se lee al sol.
    - **La regla, para todo lo que venga:** `#00BCB4` es **decorativo** (íconos,
      acentos sobre navy oscuro, bordes, barras de progreso, el "se siente" del
      hero); **`#007d77`** es el que **lleva texto blanco** (≈5:1). Ese teal ya
      vivía en la paleta (los "Ver mi precio" del comparador, los links), así que
      no se inventó color: se ordenó el uso de los dos que ya había.
    - Aplicado: CTAs de header/hero/teaser/barra móvil/simulador/blog/historia;
      hover de `.btn-teal` (#009690 daba 3.6:1) → `#00615C`; bandas de cierre de
      home y `/simulador/` a teal profundo, con el acento "del otro lado" de navy
      a menta `#A5EFEA` (sobre teal profundo el navy caía a 2.25:1); nueva
      `.btn-onteal` para el secundario sobre tarjeta teal (el relleno translúcido
      aclaraba el fondo bajo el texto: 2.1:1 medido); y el botón deshabilitado de
      `/agendar/` (blanco sobre #c8d4dc = **1.51:1**, se leía roto, no "todavía no").
    - **Resultado medido:** de 17 fallas de contraste en 6 páginas a **0 reales**
      (quedan 4 falsos positivos: los links del nav sobre el hero — el auditor no
      ve imágenes y asume fondo blanco; verificado a ojo que se leen perfecto).
    - Herramienta: `qa/` + auditor propio de contraste que recorre el DOM y calcula
      sobre **estilos computados** (compone alfa y sube por los padres). La lección
      de la bitácora otra vez: mi cálculo a mano decía 3.2:1 donde el navegador
      medía 2.1:1. Territorio: `app/page.jsx`, `app/globals.css`, `app/Header.jsx`,
      `app/components/Simulador.jsx`, `app/simulador/page.jsx`, `app/agendar/Agendar.jsx`,
      `app/blog/*`, `app/historia/page.jsx`.

12b. **⭐ REBALANCEO DE LA HOME — la acción antes del estudio (25 jul 2026,
    decisión del usuario sobre el mapa medido). HECHO** (BITACORA cap. 53).
    Cierra el pendiente del "valle de la súper saturación" que el usuario abrió en
    julio. **Se midió antes de opinar** (`scratchpad/home-map.mjs`: alto y posición
    de cada sección en pantallas, desktop y móvil) y el mapa mostró dos cosas duras:
    - El **teaser del simulador arrancaba en la pantalla 7.2 de 14.9** en móvil: la
      única herramienta que el usuario dijo que funciona quedaba enterrada bajo
      **6.2 pantallas seguidas de tablas** (qué cubre 1.88 + comparador 2.2 +
      bolsillo 2.12). La home hacía estudiar el producto antes de dejar probarlo.
    - Dos de esos tres bloques estaban en registro negativo (lo que *no* tenés, lo
      que pagás vos), encadenados y en la primera mitad.
    **Qué se hizo:** (a) el **teaser del simulador sube al puesto 2**, pegado al
    hero — "protección que se siente" → probala; todo lo que sigue pasa a respaldar
    la decisión en vez de ser el peaje para llegar a ella. (b) **"Qué cubre" y
    "Claridad del bolsillo" se fusionan** en una sola sección: respondían la misma
    pregunta, y los tres modos (cubierto/copago/precio de convenio) pasaron de ser
    tres tarjetas grandes a ser la **leyenda del explorador** — que es lo que
    siempre fueron, el vocabulario de sus propios badges. El gradiente honesto
    (45/66/93) pasó de tres tarjetas altas a **tres filas alineadas**, aplicando el
    principio del cap. 47: *una diferencia solo se ve alineada*.
    **Orden nuevo:** Hero → **Simulador** → Comparador → **Qué cubre y qué pagás** →
    Cómo funciona → Manifiesto → Diferenciadores → Confianza → Red → FAQ → Cierre.
    **Medido:** simulador de pantalla 7.2 → **1.0**; total móvil 14.9 → **13.7**
    pantallas; la sección fusionada 4.0 → **2.77**.
    ⚠ La sección fusionada **conserva las dos anclas** (`#cartilla` en la sección y
    `#bolsillo` en la leyenda) porque el menú de `Header.jsx` enlaza ambas. De paso
    se corrigieron las etiquetas del menú que aún decían "Buscá…/Escribí un estudio"
    (el buscador ya no existe desde el cap. 44). Territorio: `app/page.jsx`,
    `app/Header.jsx` (solo rótulos del menú — compartido, declarado).

12c. **⭐ LA TRANSPARENCIA TIENE QUE CUMPLIR UN PROPÓSITO (25 jul 2026, corrección
    del usuario). HECHO** (BITACORA cap. 54). Su formulación, que queda como regla:
    *"Creo que estamos llegando a un punto en el cual la transparencia no sé si
    ayuda realmente, porque parece que somos más negativos que positivos. La
    transparencia tiene que cumplir un propósito, no puede ser transparencia por
    ser transparencia nada más. Es lo mismo que yo sea honesto pero sin pelos en la
    lengua: puede salir de mi boca honestidad, pero no va a caer bien."*
    - **Se eliminó el bloque "Cuánto cubre de verdad cada plan"** (45/66/93).
      Informaba cuán incompleto es cada plan sin ayudar a decidir nada, y "45%
      cubierto" se lee como **"55% NO cubierto"**: la transparencia terminaba
      vendiendo en contra del plan de entrada. Lo que sí ayuda a decidir —qué
      cambia entre planes— ya vive alineado en el comparador. El dato sigue en
      `datos/planes-vigentes/ANALISIS-arancel-diferenciado.md` para producto.
    - **Las exclusiones se reencuadraron**: de "esto no lo cubre ningún plan
      [nuestro]" —que se leía como carencia de SP— a **"Dónde termina la medicina
      prepaga"**, el límite del PRODUCTO. Y cierran con qué hacer ("decíselo a tu
      asesor antes de firmar"), no con un punto final. **Test para lo que venga:
      un bloque honesto que no termina en una acción o en un alivio es una mala
      noticia sin destinatario — no es transparencia, es descargo.**
    - ⚠ **DATO PENDIENTE (bloquea endurecer el copy).** El usuario pidió decir lo
      que **no cubre la medicina prepaga en el país**, no solo SP. La lista actual
      sale del **cuadernillo de SP** y no tenemos ningún relevamiento de la
      competencia — el propio análisis deja abierta la pregunta *"¿hay cosas que la
      competencia sí cubre?"* (§5.4). Por eso el copy dice **"en general"** y no
      "ningún seguro del país": afirmar eso sin dato sería una afirmación
      comparativa infundada. **Con un relevamiento de competidores se puede
      endurecer la frase** — es la versión más fuerte y sigue siendo honesta.
      Territorio: `app/page.jsx`.
    - **Actualización 25 jul 2026:** el usuario aportó el mapa de con quién se
      compite y por qué, y ese mapa vive en el repo **privado**
      `sp-interno/project/MAPA-COMPETITIVO.md` — es evaluación estratégica sobre
      empresas nombradas y **no va en este repo, que es público**. Ahí está la
      lista concreta a relevar y el método. Dos cosas que conviene saber sin
      abrir ese documento: (a) el mercado se ordena por **si el competidor tiene
      sanatorio propio o solo centro médico**, no por tamaño ni precio; (b) hay
      una hipótesis anotada que **puede dar vuelta la conclusión** — es razonable
      que los competidores con sanatorio cubran MÁS en alta complejidad, y si se
      confirma en uno solo, la frase absoluta sería falsa y el "en general"
      actual queda como la única redacción honesta. O sea: el relevamiento puede
      terminar **confirmando el copy prudente**, no habilitando el fuerte.
      ⚠ **Regla general que deja este caso:** cualquier análisis de competidores
      nombrados va a `sp-interno`. A la web pública solo llegan afirmaciones
      sobre la **categoría de producto**, con fuente y fecha.

12d. **⭐ LA CARENCIA ANTES DEL TELÉFONO (7 sep 2026 — *"Sería bueno ser ya
    transparentes con las carencias"*, Arturo). HECHO** (BITACORA cap. 70).
    El resultado del simulador daba el precio y pedía nombre y teléfono **sin
    nombrar la carencia**; la Puerta 1.5 del criterio de evaluación fallaba
    exactamente por eso, y era el hallazgo más accionable de la Puerta 1.
    - **Qué hay ahora:** antes del formulario, un bloque *"Cuánto esperás para
      usar cada cobertura"* con las esperas del plan elegido — nueve servicios
      en Bronze/Silver/Gold, seis en Vital — ordenadas de "sin espera" a "10
      meses" (se leen como línea de tiempo, no como letra chica); lo que el
      plan no cubre va al final como oportunidad ("Desde Silver", dorado). La
      cotización descargable las lleva también.
    - **Una sola verdad:** salen de `app/coverage.js` (`carencias()` y
      `carenciasVital()`), la misma fuente que el comparador y `/planes`. Cada
      fila cita de dónde sale en la grilla. Vital **sí** tiene datos propios
      (`grilla-vital-coberturas-jul2026.json` agrupa por carencia) — el
      instinto de "para 65+ que lo diga el asesor" era el mismo derivar-lo-que-
      ya-sabemos que este bloque vino a corregir.
    - **Guarda 11w:** la frase del usuario es el acuerdo **para esta pieza**
      (contextualizar el número). Las otras tres direcciones del puente de
      venta —datos como regalo, cara del asesor, misma lengua cálida— siguen
      EN DISEÑO y bajo la guarda.
    - **Verificación de posición, no de presencia:** la suite (1b, 1b-bis)
      comprueba sobre el DOM que el bloque precede al formulario y trae parto
      10 meses; en 390px, que entra sin desborde. Si alguien lo baja "para
      convertir más", el build se pone rojo.
    - **Hallazgo colateral corregido:** la FAQ decía *"cirugías programadas, 7
      meses"* para los tres planes; la grilla dice 210/180/150 días (7 / 6 / 5
      meses). Error en la dirección segura, por eso nadie lo vio.
    - **De dónde viene el pedido:** es el acto A7 de la estrategia de marketing
      *"levantar la niebla"* — la transparencia como práctica verificable, no
      como adjetivo — que vive en `sp-interno`
      (`project/ESTRATEGIA-levantar-la-niebla-2026-09.md`, privado). Cada
      pieza así se publica solo cuando es cierta y se protege con un test.
    Territorio: `app/components/Simulador.jsx`, `app/coverage.js`,
    `app/glossary.jsx` (`waitLabel` gana un modo corto), `app/page.jsx` (FAQ),
    `qa/`.

12e. **⭐ LA PÁGINA VENDE EL SIMULADOR, NO EL PRODUCTO (15 sep 2026 — Arturo:
    *"We need to sell our lead generator, not our product"*; y el alcance:
    *"hoy por hoy el lead generator es solo el simulador. Esto es solo para el
    concepto de la página por hoy, pero queremos permear a lo demás
    después"*).** PRINCIPIO; sin cambios en el sitio todavía.
    - **Qué dice:** cada pieza vende solo el paso siguiente. La página vende el
      simulador; el simulador vende la conversación; la conversación vende el
      plan. Ninguna sección de la home vende un plan por su cuenta: o lleva al
      simulador, o lo respalda. Hoy el generador es el simulador, no el blog ni
      la Guía Médica (esos respaldan).
    - **Dónde ya está (verificado el 15 sep):** un solo **destino** comercial
      en toda la home, el simulador: nav, hero, teaser del puesto 2, botones
      del comparador, banda Vital, CTAs de la FAQ, cierre y barra móvil llevan
      a `/simulador/`. La **etiqueta** no es una sola: "Simulá tu plan" en
      nav, hero, teaser, cierre y barra móvil; "Ver mi precio" en el
      comparador (`app/page.jsx:621`); "Simulá Plan Vital" en la banda Vital
      (`:776`); "Mirá tu precio…" en la FAQ (`:53`, `:59`). Las variantes
      nombran el resultado y no cambian el destino; unificarlas es el ajuste 5
      de abajo. Además, la línea ancla del hero ("En 1 minuto ves tu precio…
      sin dejar datos") y la promesa del teaser ("ves el precio antes de dejar
      cualquier dato. Sin compromiso") prometen lo que da el simulador. El
      espinazo de la home ya es el generador; la decisión de julio (un solo
      verbo, dec. 12b) era este principio sin nombre, y en las etiquetas no
      se cumplió del todo.
    - **Dónde todavía vende producto por su cuenta:** (1) el **H1 del hero**
      ("Protección que se siente") es la promesa de la marca, no la del
      generador; todo lo demás del hero sí lo es. (2) Los **diferenciadores**
      ("Lo que casi nadie te garantiza") no tienen salida al simulador. (3) La
      **red de beneficios** vende perks, y su "próximamente" es una promesa
      que la estrategia pide no publicar. El **comparador** vende producto,
      pero responde "¿qué me cubre?" y cada botón lleva al simulador:
      recomendación, dejarlo. El **cierre** ofrece primero WhatsApp y después
      el simulador.
    - **Excepción explícita: el camino directo a una persona se conserva.**
      El WhatsApp flotante y el botón de WhatsApp del cierre venden la
      conversación sin pasar por el simulador. Leída como regla absoluta, la
      cadena "página → simulador → conversación" los contradice. No es
      absoluta: hablar con una persona sin llenar ningún formulario es un acto
      de la estrategia (A6, principio #5) y una promesa vigente del sitio. La
      regla queda así: **el simulador es el camino principal y el único que
      la página vende; el WhatsApp es el atajo, siempre abierto, para quien ya
      sabe lo que quiere o no quiere simular.** No se quita. Lo que el
      principio sí ordena es la jerarquía: en el cierre, el simulador primero
      y el WhatsApp segundo (ajuste 2). Una sesión futura no lee acá dos
      políticas incompatibles: lee una regla y su excepción, con nombre.
    - **Ajustes posibles, a decisión de Arturo (ninguno hecho):** (1) el H1
      del hero dice lo que el simulador da y "Protección que se siente" queda
      como kicker; (2) el cierre ordena simulador primero y WhatsApp segundo;
      (3) los diferenciadores cierran con una línea hacia el resultado del
      simulador; (4) la **red de beneficios**: sacar "muy pronto" y
      "próximamente" (`app/page.jsx:863`, `:890`), que es regla de la
      estrategia aunque este principio no existiera, y darle una salida al
      simulador o dejarla escrita como respaldo (los aliados son un beneficio
      del plan, no una razón para elegirlo); (5) unificar las etiquetas de
      los CTAs, si se decide que el verbo también sea uno solo. Los cuatro
      primeros son copy, no estructura. El hero es visión: espera su "dale".
      Completar esta lista no deja ninguna de las tres violaciones de arriba
      sin destino.
    - **Guarda para sesiones futuras:** una sección nueva en la home entra solo
      si lleva al simulador o lo respalda. Un bloque que vende un plan sin
      camino al simulador contradice este principio.
    - **Alcance:** hoy gobierna el concepto de la página. La pauta, el feed y
      los guiones vienen después ("permear a lo demás"), cuando Arturo lo
      diga; el detalle vive en `sp-interno`
      (`project/ESTRATEGIA-levantar-la-niebla-2026-09.md` §3c, privado).
    Territorio: solo `HANDOFF.md`.

---

## 4. PENDIENTES PRIORIZADOS — el siguiente ciclo

### ⚡ Próxima sesión — datos reales que trae el usuario (jul 2026)

El usuario anunció dos fuentes de datos reales que destraban pendientes.
La sesión que lea esto debe pedírselas y trabajar con ellas:

A. ~~**Planes vigentes**~~ ✔ **COMPLETO Y VOLCADO A LA WEB (17 jul
   2026)**: el usuario pasó los cuadernillos y tarifarios reales de los
   cuatro planes vigentes — **Plan Vital** (senior 65+), **Bronce,
   Silver y Gold** (ex "Privilege", palabra eliminada a pedido del
   usuario). Todo ingerido en **`datos/planes-vigentes/`** (4 JSON +
   README con las decisiones) y **publicado en la web como contenido
   temporal** hasta que existan los planes nuevos (Esencial/Integral/
   Premium — la mesa técnica sigue pendiente, #6):
   - **Simulador con el tarifario real** (IVA incluido): tramos de edad
     0-54/55-64/65-69, tarifa titular/cónyuge, adherentes, grupo
     familiar y hijo adicional desde el 3º. El motor (`app/quote.js`)
     reproduce **los 21 ejemplos "GRUPOS" de los tres tarifarios,
     exactos** (verificado por script). "Padres/adulto mayor" →
     Plan Vital (₲ 283.000/persona, débito). **Descuento por pago
     automático ✔ activo en la web (17 jul 2026)**: el usuario confirmó
     10% pagando con débito automático o tarjeta de crédito, y que la
     prima publicada del tarifario Privilege es el precio particular.
     El simulador muestra ambos precios (lista y con pago automático,
     `autoPay` en `engine()`); en Vital, al revés: el precio publicado
     ya es el débito y el particular (₲ 312.000) va como referencia.
     La nota del 10% vive también bajo el comparador y en la FAQ.
   - El precio es nacional: el paso "Zona" quedó informativo (sin
     recargo) y el paso "Adicionales" se eliminó (los planes vigentes
     no tienen extras) — el simulador quedó de 4 pasos.
   - **Comparador con la escalera real**: 11 filas de los cuadernillos
     (la resonancia en Bronce es la etiqueta dorada "Desde Plan Silver"
     — el upsell ahora es literalmente cierto). Colores por metal:
     bronce `#A9724B`, silver `#66717E`, gold `#B8860B` (pedido del
     usuario: sin logos/colores de los cuadernillos, la tipografía
     display del sitio, sentido
     común por metal).
   - **Guía Médica**: `min_plan` ahora es bronce/silver/gold, el modo
     personalizado es `?plan=silver`, upsell "Con Plan Gold", tarjeta
     Vital en la ficha.
   - Los cuadernillos completos (24-37 págs.) tienen mucho más detalle
     del volcado (cuadros de laboratorio, cirugías por carencia):
     quedan como fuente en los PDF del usuario; los JSON guardan el
     resumen operativo.
   - *Tarifario re-confirmado (20 jul 2026)*: el usuario pasó la tabla
     consolidada de julio (`Tabla_Precios_Planes_SP_Privilege_2026_
     Julio.pdf`). Solo cambiaron las filas 70+ (renovación) — volcadas a
     `datos/planes-vigentes/` y a `TARIFAS` en `app/quote.js`; los
     precios de venta nueva y los 21 ejemplos GRUPOS quedaron idénticos
     (motor re-verificado 21/21). Detalle y una trampa del PDF (páginas
     internas contradicen a la consolidada) en el README de la carpeta.
   - *Grilla oficial completa incorporada al git (22 jul 2026)*: el
     usuario pasó `SP_Privilege · Grilla Coberturas y Precios Jul 2026.xlsx`
     — 8 hojas con **el detalle por ítem de los tres planes** (Precios,
     Consultas x especialidad, y los 4 Cuadros: Laboratorio 348, Estudios
     e Imágenes 271, Cirugías e Internación 314, Fisioterapia; + Parámetros
     Clave). Vive en `datos/planes-vigentes/` (el `.xlsx` como fuente de
     verdad + `grilla-coberturas-precios-jul2026.json`, transcripción fiel
     y diffeable). **Precios verificados exactos** contra `TARIFAS` de
     `app/quote.js` para los tres planes. Con esto **Silver/Gold dejan de
     estar "pendientes"** (su detalle completo está en la grilla) y se
     destraban tres cosas de la auditoría: (a) **carencias con número**
     (internación 60 d, maternidad 300 d, y por estudio); (b) el insumo
     del bloque **"qué no cubre / qué pagás aparte"** — los ítems `AD`
     (100% a cargo) salen por plan de los cuadros: **114 en Bronze, 73 en
     Silver, 14 en Gold** (el gradiente del upsell, a comunicar en gris,
     nunca rojo); (c) **chequeo de sobrepromesa confirmado**: en las 8
     hojas **no existe "telemedicina" ni "laboratorio a domicilio"**; sí
     "consulta médica a domicilio" (2/3/4 por año). ⚠ **A revisar antes de
     tocar el sitio** (no ejecutado en este PR): los resúmenes curados del
     comparador (`cart()` en `app/page.jsx`) podrían diferir de la grilla
     en categorías multi-fila (resonancia/TAC tienen muchas filas con
     coberturas distintas — CT/COP/AD) — cotejar contra la grilla antes de
     dar por buena cada celda del comparador. *(Revisado 22 jul: la mayoría
     de las RMN son CT en Silver; el comparador está mayormente OK, solo
     casos borde como la colangioresonancia difieren.)*
   - *Análisis de "arancel diferenciado / copago / exclusiones"
     (22 jul 2026, intuición del usuario — BITACORA cap. 34)*: quedó en
     `datos/planes-vigentes/ANALISIS-arancel-diferenciado.md`. Traduce la
     jerga (AD = sin cobertura / COP = pagás la mitad) y abre la superficie
     de sorpresa en tres capas: exclusión total (solo 13 ítems sueltos +
     categorías enteras: odontología, bariátrica, oncología-tratamiento,
     hemodinamia, alta complejidad), AD-recuperable-en-plan-superior (101,
     el upsell honesto), y **copago — la capa más grande y silenciosa (300
     ítems en Bronce)**. Es insumo de estrategia, NO copy de web. Preguntas
     abiertas para la operación: ¿AD = precio de convenio? y el porqué de
     cada exclusión. Cuando se defina, recién ahí se toca la web.

B. **Base de prestadores del sistema interno de SP** (mencionado por
   voz; el nombre del sistema hay que confirmarlo con el usuario en la
   próxima sesión): la exportación de todos los prestadores, para
   poblar la Guía Médica con datos reales — hoy usa el catálogo de
   muestra. Campos deseados: los del ANEXO §4 (nombre, tipo,
   especialidades, sedes con dirección y ciudad, teléfonos, horarios,
   atributos urgencias 24h / a domicilio / telemedicina). Un Excel o
   CSV con lo que haya alcanza para empezar: la limpieza conocida
   (teléfonos concatenados, typo "AMBULACIA", especialidades que son
   tipos) ya está especificada en el ANEXO.

Cómo retomar en una sesión nueva: abrirla sobre `sp-prototipo` y decir
**"Leé el HANDOFF.md y continuemos"** — este archivo es la memoria del
proyecto, y `BITACORA.md` cuenta el camino y sus lecciones.

### Prioridad alta (próxima sesión)

1. ~~**Integrar la guía al homepage (A+B)**~~ ✔ **Hecho (julio 2026, PR #5)**:
   "Guía Médica" en menú desktop, menú móvil y footer (link directo a
   `guia_home.html`); la sección se renombró "Guía Médica · sin letra
   chica" (el ancla sigue siendo `#cartilla`, en menú/footer aparece como
   "Qué cubre"); su buscador lleva a `guia_resultados.html?q=…` (Enter, o
   la fila fija del dropdown — que aparece incluso sin matches locales,
   cero resultados nunca es un callejón), y bajo la tarjeta hay un link
   permanente "Abrí la Guía Médica". Los chips y el panel de cobertura
   local siguen igual. *Refinado después del merge (PR #6)*: el header del
   homepage da énfasis propio a cada destino — urgencias en rojo, Guía
   Médica como pastilla con contorno e ícono de pin (blanca sobre el hero,
   navy con el nav sólido), simulador en teal sólido; en el menú móvil la
   guía va destacada en mint. Y la guía ahora vuelve al homepage: el logo
   e "Inicio" → `../`, "Planes" → `../#comparar` (en producción esos
   links apuntan al dominio público — anotado en el ANEXO §5). Además, el
   header es **translúcido en sus dos estados** (vidrio esmerilado: oscuro
   `rgba(0,22,44,.35)` sobre el hero, claro `rgba(255,255,255,.55)` al
   scrollear, blur 18px constante; ojo: el minificador de CSS rompe
   `backdrop-filter` con funciones encadenadas o con la variante
   `-webkit-` declarada a mano — declarar solo la propiedad estándar con
   un único `blur()`), y el nav ganó **"Blog"** → `/blog`, una página
   placeholder "muy pronto" que anticipa los temas y devuelve al inicio.
   **Destino (C, declarado, no ejecutar aún)**:
   fusionar "qué cubre" + "dónde atenderse" en una sola respuesta cuando
   haya datos reales de cobertura.
2. **Registro de búsquedas / panel de estadísticas**: se aclaró (julio
   2026) que el panel `/estadisticas` de SIP **también es un prototipo —
   no hay datos reales todavía**; la guía online está en construcción.
   La auditoría se convirtió en especificación: el **ANEXO §6** (nuevo)
   toma como base lo que el panel de SIP ya contempla (búsquedas por
   período, sin-resultados por término, perfiles vistos, tops,
   dispositivo/navegador) y le suma lo que falta — conversión por
   prestador, matriz especialidad × ciudad, embudo por sesión anónima,
   sinónimos candidatos, cola de rescates CX, upsell — con **tres vistas
   por audiencia** (Convenios / Comercial / CX) y export CSV. Además, la
   **web quedó instrumentada** igual que la guía (`app/track.js`,
   eventos en homepage y simulador; tabla en ANEXO §2). Queda: que la
   empresa conecte `track()` a un endpoint real, y el ritual mensual
   (#11).
3. ~~**QA integral del ecosistema**~~ ✔ **Ejecutado (julio 2026)**: suite
   permanente en `qa/qa-integral.mjs` + informe en `qa/QA-INFORME.md`.
   Resultado: **0 "roto"**; 12 arreglos aplicados (contrastes WCAG AA con
   tonos imperceptiblemente más oscuros, touch targets ≥44px en móvil,
   lazy-loading de 27 imágenes). **Quedan:** (a) la decisión
   "blanco sobre teal #00BCB4" en los CTAs (2,4:1 — es identidad de
   marca; opciones en el informe, resolver antes de salir a público —
   el #8, plataforma, ya se resolvió: Next.js);
   (b) la prueba en iPhone/Safari real — checklist de 10 min en el
   informe (la hace SP); (c) testimonios reales (prueba social sin voz
   humana). El QA de integración con backend queda para cuando la
   empresa conecte.

3b. ~~**Home v2**~~ ✔ **Ejecutado (julio 2026)**: hero de dos puertas
   ("Quiero un plan" → simulador · "Ya soy de SP" → `guia_home.html#mi-red`,
   la consulta CI+fecha), herramientas arriba, manifiesto comprimido a
   una pantalla en segunda persona (el cinematográfico completo vive en
   `/historia/`), testimonios placeholder afuera (vuelven cuando haya
   reales con consentimiento), eventos `manifesto_scroll` y `puerta_home`
   (ANEXO §2), y presupuesto móvil verificado: 173 KB gzip de contenido
   crítico (≤300 KB). El home anterior quedó congelado en `/v1/` como
   referencia. Detalle y salvaguardas: `PLAN-home-v2.md`. **Pendiente que
   nace de acá:** testimonios reales con consentimiento (responsable: SP).
   *Refinado v2.1 (feedback del usuario, jul 2026)*: menú móvil overlay a
   pantalla completa estilo Apple/Tesla/Ogilvy (blanco pleno, tipografía
   enorme en Tipo Oración — la referencia Ogilvy usa mayúsculas, la regla
   de identidad manda acá —, sin urgencias repetida: ya vive en el header), "Cómo
   funciona" compactado a paso-a-paso, y dieta de espacios en toda la
   home: **14,2 → 11,6 pantallas en móvil (-18%)**, 8,9 → 8,1 en desktop.
   El portal completo (login, credencial, estados) sigue como destino
   declarado, bloqueado por el backend de SIP (el #8 —plataforma— ya se
   resolvió: Next.js, dec. 11p).

3c. **Feedback externo sobre la web (16 jul 2026)** — evaluación de un
   revisor externo, pimponeada con el usuario. Veredicto general: madura,
   no maqueta; su lectura estratégica ("guía = recurrencia, simulador =
   conversión, portada = triaje") coincide con la tesis del §1 sin haberla
   leído. **Ejecutado en el mismo día**: (a) etiqueta "No incluida" del
   comparador → "Desde SP Integral" en dorado (violaba la decisión #7);
   (b) cifras: quedan solo las confirmadas — vidas ~19.000 (real),
   contratos ~9.100 salió (sin confirmar), los años se calculan desde la
   fundación (agosto 2002, `YEARS_CARING` en `app/quote.js` + script en
   la guía) en cada build; (c) el bloque CI+fecha de la guía lleva
   etiqueta visible "Demostración" y aclara que muestra un asegurado de
   ejemplo. **En pausa hasta el test de 5 segundos (lo corre el usuario,
   5 personas: ¿qué ofrece? ¿dónde tocás para precio? ¿dónde si ya sos
   cliente?)**: acortar la portada ~20% (poda guiada por las cuatro
   preguntas, no pareja), decir la categoría más rápido en el hero, una
   acción comercial dominante (contrapropuesta: desnivelar peso visual
   sin cerrar la puerta 2 — los datos de GA la defienden), y fusionar la
   intro del simulador con la primera pregunta (manteniendo la promesa
   "2 minutos, precio sin dejar datos" como microcopy). **Pendiente del
   usuario:** confirmar el dato "+800 prestadores" — recién ahí se
   actualizan los "más de 50 prestadores" (page.jsx y FAQ), que son
   ciertos pero se quedan cortos.
   *Actualización 20 jul 2026:* la auditoría de conversión propia llegó,
   sin leer este feedback, a los mismos cuatro puntos pausados — refuerza
   correr el test de 5 segundos ya. Todo lo que NO dependía del test se
   ejecutó en la decisión 11e.

### Prioridad media

4. **Datos reales de contacto**: ✔ el número quedó confirmado por el
   usuario (julio 2026): **(021) 319 0000 para todo** — llamadas,
   urgencias y WhatsApp (`WHATSAPP_NUMBER`/`SP_TEL` en `app/quote.js` y
   los `wa.me/595213190000` de rescate en la guía; el WhatsApp de la
   ficha de prestador es dato ilustrativo del prestador, no de SP).
   Footer también resuelto con los datos reales: Sede Administrativa
   (Perú 222 esq. Eligio Ayala, Asunción), Centro Médico Lister (Paí
   Perez 630 c/ Azara, Asunción) y **hola@saludprotegida.com.py**
   (reemplazó al info@ que tenía la guía). ✔ Completo.
5. **Fotos reales** (hero y secciones — estaba previsto en el plan original).
6. **Precios y coberturas definitivos** para simulador y comparador:
   ✔ *resuelto de forma interina* (jul 2026) — la web corre con el
   tarifario y las coberturas **vigentes reales** (Bronce/Silver/Gold +
   Vital, ver bloque ⚡). Sigue pendiente la mesa técnica de los planes
   nuevos (Esencial/Integral/Premium); cuando existan, el volcado es el
   mismo mecanismo (plans() + TARIFAS en `app/quote.js`, cart() en
   `app/page.jsx`, mapas NIVEL/NOMBRE en la guía).
7. **Flujo real de "Ver mi red"**: especificar con SIP el endpoint
   CI + fecha → nivel de plan, con las reglas de seguridad del ANEXO.
8. ⚠ **Superado el 16/09/2026** — ver "LEER PRIMERO" arriba: la v1 la publica
   **Buenavista**, en su sitio, a partir de nuestra maqueta. Lo de abajo es la
   decisión de julio, que se conserva como historia. Guía de publicación para
   ellos: `docs/IMPLEMENTAR-v1.md`.
   ~~**Decisión de plataforma de la web pública**~~ ✔ **RESUELTO (23 jul 2026,
   dec. 11p): el prototipo Next.js ES la web.** Se descarta WordPress/BuenaVista
   como plataforma. Quedan quién hospeda y el dominio (#9); el backend (ANEXO)
   hace falta igual.
   **Criterios de contratación** (jul 2026, de la evaluación de
   arquitectura de conversión): buscar arquitecto de conversión /
   StoryBrand, no diseñador estético; el brief es `BRANDSCRIPT.md` +
   `guia/ANEXO-requisitos-backend.md` + el prototipo funcionando;
   prohibido lorem ipsum — el copy dicta el diseño.
8b. **SEO** (sube de prioridad baja → media, jul 2026): los datos reales
   muestran que **Organic Search ya es el canal #1** de la web activa
   (282 sesiones/semana) y hay Paid Social pagado aterrizando en un
   sitio con ~9% de recurrencia. Sitemap, metadatos, schema.org (ejemplo
   en la ficha de la guía) valen más de lo presupuestado. La decisión de
   dominio de la guía (#9) se evalúa junto con esto.
   **Estado (jul 2026): infraestructura ✔ lista, indexación apagada a
   propósito.** El prototipo emite `noindex` en todas las páginas (web y
   guía) y `robots.txt` con `Disallow: /` para que ningún cliente real
   aterrice en una demo con precios de referencia. Ya existen
   `robots.txt`, `sitemap.xml` (7 URLs, sin `/v1/`), canonicals por
   página, Open Graph y JSON-LD de la organización (InsuranceAgency con
   teléfono, sedes y email reales). Todo se enciende con
   `NEXT_PUBLIC_INDEXABLE=true` + `SITE_URL` en el build cuando haya
   decisión de dominio — un solo flip, sin retrabajo. Lo que falta al
   publicar la guía: quitar el `noindex` de los 3 HTML (nota en ANEXO §5).
8c. **Nota para la mesa técnica de precios**: al definir los precios
   reales del comparador, evaluar el **efecto señuelo** (Integral como
   ancla que ordena la percepción de Esencial y Premium) — con la
   salvaguarda de Munger: persuasión sí, manipulación no; el simulador
   debe recomendar el plan correcto, no el más caro.

### Prioridad baja / evolución

9. **SEO y dominio**: sitemap, metadatos, schema.org (ejemplo ya incluido en
   la ficha). **Dos hostnames que decidir, no uno:** (a) el **dominio público
   del sitio Next.js** —hace falta para `SITE_URL` (canonicals, robots,
   sitemap); hoy indefinido—; y (b) si la **guía** vive en
   `guia.saludprotegida.com.py` (la marca se lleva el crédito en Google) o
   queda en `sp.sip.com.py`.
10. **Gobernanza de contenido**: quién actualiza prestadores, textos y
    especialidades (el brief pedía CMS editable por SP).
11. **Ritual mensual de datos**: revisión de 30 minutos del top de búsquedas
    sin resultado con Comercial/Convenios/CX — un dashboard que nadie mira
    no es inteligencia de negocio.
12. **"Cerca de mi ubicación" + mapa** (necesita coordenadas en la base).
13. **Variante C2 del modo personalizado** (lista dividida "Tu red / El
    resto invita") — solo si los datos de `upsell_view` muestran tracción.
14. ~~**Agendamiento de turnos**, empezando por Lister~~ ✔ **PRIMERA VERSIÓN
    (24 jul 2026, dec. 11r):** espacio directo `/agendar`, **sin login**, con
    handoff a la recepción de Lister por WhatsApp — el paso de "dónde atenderse"
    a "atenderse". Falta: el sistema real de turnos (backend / app de Luján)
    detrás del handoff, y extender de Lister a la red.
15. **Contenido del blog** — RESUELTO (julio 2026): la estrategia
    editorial existe y está en marcha. Las notas viven como markdown en
    `contenido/blog/publicados/` (una nota nueva = un archivo nuevo;
    índice, sitemap y página propia se generan solos con `lib/blog.js` +
    `marked`/`gray-matter`, mismo diseño de lectura `Articulo.jsx`).
    Meta acordada: 2-3 notas publicadas por semana; publicar = copiar
    el markdown aprobado a `publicados/` vía PR — revisión humana
    siempre. El contenido es portable: el día que la web oficial pase a
    WordPress/HubSpot (BuenaVista), la biblioteca de notas migra tal
    cual.
    **✔ Motor de contenido — CONSTRUIDO (20 jul 2026, guarda
    levantada):** el pimpón del cerebro se completó (9 temas) y Arturo
    aprobó el diseño con "construí". La cocina definitiva es el repo
    privado **`Nelargon/sp-contenido`**: ahí viven `CEREBRO.md` (la
    constitución del motor), el `ORQUESTADOR.md` de la sesión Master
    Orquestador, la línea editorial en 3 capas, el semáforo de
    aprobaciones (`GOVERNANCE.md`), la bandeja de entradas y las
    Routines reapuntadas (digest diario, borradores semanales, más el
    Publicador y el Minero de reuniones). `sp-interno` queda como
    archivo histórico. **Para este repo la regla es simple:** los PRs
    del Publicador traen notas aprobadas a `contenido/blog/publicados/`
    — los mergea un humano, SIEMPRE (el merge automático de este repo
    no aplica a PRs de contenido). Ninguna sesión de la web coordina
    contenido: eso es del Master Orquestador en `sp-contenido`.

### Carencias visibles y glosario en contexto (26 jul 2026)

**Qué cambió.** La web decía la palabra "carencia" **una sola vez**, en una
FAQ, y derivaba al asesor (*"tu asesor te muestra el detalle exacto"*) un
dato que ya estaba estructurado en las 935 filas de
`datos/planes-vigentes/grilla-coberturas-precios-jul2026.json`. Ahora:

1. **El explorador de coberturas muestra la espera** por plan, junto a cada
   cobertura (`wait` en `app/coverage.js`, render en `app/page.jsx`).
2. **La FAQ responde de verdad**, con los plazos reales de los planes
   vigentes en vez de derivar.
3. **Aviso de parto** debajo del explorador: es la espera más larga de toda
   la grilla y la más cara de descubrir tarde.
4. **Glosario en contexto** (`app/glossary.jsx`): carencia, copago,
   semi-suite, nursery, tope, arancel diferenciado y preexistencia se
   explican **donde aparecen**, con hover, dedo y teclado. `annotate()`
   los reconoce solo dentro de cualquier texto de cobertura, así que una
   descripción nueva que diga "semi-suite" se explica sola.

**Los datos** (grilla de julio 2026, verificada por el usuario): parto
**300 días en los tres planes**; cesárea 300/300 y **150 en Gold**;
cirugías programadas mayormente 210; resonancia 150 (Silver/Gold, Bronce no
cubre); fisioterapia 90; tomografía 60/60/30; ecografía y laboratorio ~60;
consultas y urgencias sin espera declarada.

⚠ **Regla crítica al leer carencias de la grilla — no borrar.** Las filas
con `cob: "AD"` (Arancel Diferenciado = **SIN COBERTURA**) traen
`"INMEDIATA"` en el campo carencia. Es basura del origen, no una espera de
cero: ahí no hay cobertura que esperar. **Nunca leer la carencia de una
fila AD.** Sin ese filtro, la web diría "Resonancia: cubierta sin espera"
en Bronce, que no la cubre. Ver BITACORA cap. 55.

**Encuadre del aviso de parto (decisión, no estética).** Va en dorado
—oportunidad— y nunca en rojo, que este proyecto reserva para urgencias. El
número no se suaviza: se le da un destino. *"El reloj arranca el día que te
afiliás, no el día que lo necesitás. Si el plan es para dentro de un año,
afiliándote ahora llegás."* La misma información que descubierta tarde es
una trampa, dicha a tiempo es una razón para decidir.

**Territorio:** `app/coverage.js`, `app/glossary.jsx` (nuevo), `app/page.jsx`.

### Carencias y glosario en /planes (26 jul 2026)

Segunda tanda, después de la home. `/planes` es la página de decisión, así que
la espera importa más ahí que en ningún lado:

- **Carencia por celda** en la tabla de 11 servicios × 3 planes, con la misma
  regla: solo donde HAY cobertura (Resonancia no muestra espera en Bronce,
  porque Bronce no la cubre).
- **`waitNote`** por fin visible: la fila de parto aclara que *"la cesárea
  espera 150 días en Gold"*. El campo estaba en `app/coverage.js` desde la
  tanda anterior y nunca se había mostrado.
- **Glosario** en los detalles de cobertura (`annotate`) y en la nota al pie,
  que ahora explica de dónde arranca el reloj.

**Mejora del glosario que vale para todo el sitio:** la burbuja se **clampea al
viewport** al abrir, así que ya no se sale de pantalla por más al borde que
caiga la palabra. Dos trampas encontradas al hacerlo, ambas en BITACORA cap. 56:
un `calc(-50% + -20px)` que es CSS inválido y se descarta en silencio, y
`window.innerWidth`, que en emulación móvil **se ensancha con el propio
desborde** — para decidir si algo entra en pantalla va
`document.documentElement.clientWidth`.

**Territorio:** `app/planes/Planes.jsx`, `app/glossary.jsx`.

### ✔ Pendiente 12c CERRADO (26 jul 2026) — y salió al revés de lo previsto

El relevamiento de los 7 competidores está hecho
(`sp-interno/project/RELEVAMIENTO-competidores-2026-07-26.md`, repo privado).
**No permitió endurecer la frase: obligó a corregirla.**

**Lo que se encontró, con cita textual de folletos propios de cada empresa:**
SPS (Superior Plus) cubre tratamiento oncológico —quimio en pensión y
honorarios, radioterapia, cirugías oncológicas— y **alta complejidad**
(*"Neurológicas, torácicas, cardiacas y vascular periférica"*). SPS y MediLife
cubren odontología general básica. Bariátrica no se puede afirmar en ninguna
dirección.

**Consecuencia:** la frase *"es hasta dónde llega este tipo de producto"* era
**falsa**. El "en general" protegía la primera oración, pero esa última
afirmaba sobre toda la categoría sin hedge.

**Qué cambió en la web.** El bloque pasó a llamarse **"Dónde termina nuestra
cobertura"** y habla **solo de SP**, sin afirmar nada sobre el rubro:
*"Hay cuatro cosas que nuestros planes no cubren… Preferimos que lo sepas ahora
y no cuando lo necesites."* El cierre accionable (*"decíselo a tu asesor antes
de firmar"*) queda intacto — la fuerza del bloque nunca fue "los demás tampoco"
sino "te lo decimos antes".

Verificado contra nuestra grilla: SP efectivamente **no cubre** las cuatro
(oncológico 0 filas, alta complejidad 0 filas; lo que figura como "dental" son
radiografías dentales, y "Gastrectomía Parcial" es cirugía general, no
bariátrica). El bloque siempre fue exacto sobre SP; el error era la
generalización.

⚠ **Regla que deja el caso:** no escribir afirmaciones sobre lo que cubre
"la medicina prepaga" sin relevamiento con fuente y fecha. Y al revisar copy
sensible, leer **cada oración por separado**: una hedge no protege a la frase
categórica que tiene al lado (BITACORA cap. 57).

**Bonus estratégico (vive en el repo privado):** la hipótesis de que los
competidores con sanatorio propio cubrirían más en alta complejidad quedó
**refutada**, y el competidor más filoso en coberturas resultó estar en la
categoría de los directos, no entre los grandes.

### La FAQ ahora responde lo que la gente pregunta (26 jul 2026)

**Dato de origen — el mejor que tuvo este proyecto para copy:** los 4 asesores
del equipo digital listaron por separado, en papel y sin verse entre ellos, las
5 preguntas más frecuentes de los clientes. Convergencia:

| Pregunta | Frecuencia | Estado antes |
|---|---|---|
| Precio | 4/4 | ✔ estaba |
| **Diferencia entre planes** | **4/4** | ✗ no estaba |
| **Carencia** | **4/4** | ✔ recién arreglada ese día |
| Qué cubre | 3/4 | parcial (explorador) |
| **Descuento 10%** | 2/4 | ✗ solo en letra chica |
| **¿Cubre en todo el país?** | 2/4 | ✗ no estaba |
| **¿Está mi médico?** | 2/4 | ✗ no estaba (la Guía lo resuelve, la FAQ no lo decía) |

**La FAQ anterior respondía 2 de esas 7** y usaba slots en preguntas que
ninguna asesora reportó (baja de plan, cambio de plan). Se agregaron las cuatro
faltantes y el orden sigue la **frecuencia real**.

⚠ **Antes de sacar o reordenar una entrada de la FAQ, mirar la frecuencia: no
las elegimos nosotros.** El detalle vive en `sp-interno` (repo privado).

**Cambio técnico incluido:** los CTA de la FAQ soportan ahora un tercer destino
—`to: 'planes' | 'guia'`— además del simulador y WhatsApp. Varias de estas
preguntas se responden mejor mostrando que conversando. Sin ese caso, un CTA
interno caía en la rama de WhatsApp con mensaje vacío.

**Territorio:** `app/page.jsx`.

### El valor del seguro sube de nota al pie a bloque (26 jul 2026)

**Pedido de Arturo:** *"Creo que tiene que tener mucho más protagonismo… hoy en
Paraguay hay una gran necesidad de que la gente entienda la necesidad de un
seguro médico. Todo lo que tenga que ver con eso, en cualquier cosa que hagamos
en el futuro, es muy importante."*

⚠ **Tratar esto como dirección permanente, no como un cambio puntual.**
Cualquier pieza futura —web, blog, Tranquibara, redes— tiene que dejarle lugar
al argumento de **por qué existe un seguro**, no solo a cuál plan conviene. En
un mercado donde 7 de cada 10 no tienen cobertura, educar la categoría pesa más
que diferenciar el producto.

**Qué cambió.** La frase *"Un seguro no es un gasto…"* era una línea debajo del
comparador; ahora es un bloque con kicker, titular en display y **dos cifras con
fuente**: 36% del gasto en salud sale del bolsillo (OPS, 2021; la OMS recomienda
≤20%) y 7 de cada 10 paraguayos sin seguro (INE). Encuadre sereno: muestra el
contraste, no la catástrofe. Sin rojo.

### El bloque de exclusiones: título con propósito y términos explicados

- **Título:** *"Dónde termina nuestra cobertura"* → **"Para que no haya
  sorpresas"**. El anterior era mi corrección de esa misma mañana: dejó de ser
  falso pero seguía mirando el límite. Ahora el propósito está en el título.
- **Glosario ampliado** a los cuatro términos del bloque: odontología, cirugía
  bariátrica, tratamiento oncológico y alta complejidad. Se explican solos con
  `annotate()`, con hover, dedo y teclado.

⚠ **Hallazgo verificado contra la grilla, útil para cualquier copy futuro:** la
**consulta de Oncología Clínica SÍ está cubierta** (con copago) y las de
**Cardiocirugía y Neurocirugía están sin tope** en los tres planes. Lo que no se
cubre es el **tratamiento y la cirugía**, no el acceso al especialista. Cada
definición del glosario dice las dos mitades — es más preciso y además menos
sombrío.

**Territorio:** `app/page.jsx`, `app/glossary.jsx`.

### ✔ Header unificado — ola 2 (5 ago 2026): 8 de 9 módulos

Cierra el pendiente que quedó abierto el 24 jul (*"rodar `Header.jsx` a los
módulos restantes"*). Auditoría previa: había **cinco** tratamientos distintos y
en **5 de 9 páginas no se llegaba al resto del sitio**.

**Migrados a `<Header variant="dark" />`:** simulador, Mi SP, historia, agendar.
Los tres últimos reimplementaban el mismo "logo + volver"; el simulador tenía su
propio `<header>` sticky de 76px.

**Estado actual — verificado en 1280 y 390 px:** home, planes, blog, nota,
simulador, Mi SP, historia y agendar llevan **el mismo nav** (8 ítems en
escritorio, logo + urgencias + menú en móvil).

⚠ **Recalibración del modo app del simulador — no revertir sin recalcular.** Su
CSS estaba atado a un header de 76px: `.sim-card{height:calc(100dvh - 180px)}`
con 180 = header 76 + hero 74 + aire 28. El compartido mide **88** (84 en
móvil), y `fixed` no ocupa lugar en el flujo mientras que `sticky` sí — por eso
el hero necesita `padding-top` explícito. Quedó en **192** y `padding:110px`.
Verificado: la tarjeta entra en la primera pantalla en 1280×900, 1440×900,
1366×768 y 1100×800.

📌 **Dato para no volver a asustarse:** el simulador tiene ~993px de contenido
**debajo** de la tarjeta (confianza, mini-FAQ, contacto, footer) y eso es
intencional, viene de antes y no rompe nada. *"Modo app" significa que la
tarjeta entra en la primera pantalla, no que la página no scrollee.*

**Sigue pendiente:** el **gemelo del header en la guía** (`guia/`, HTML +
Tailwind, otra tecnología) — es el único módulo que conserva navegación propia,
y además no es fija. Y la home sigue con su `<nav>` inline (funciona y tiene el
mapa completo; migrarla a `variant="hero"` es cosmética interna, no afecta al
usuario).

**Territorio:** `app/simulador/page.jsx`, `app/mi-sp/MiSP.jsx`,
`app/historia/page.jsx`, `app/agendar/Agendar.jsx`, `app/globals.css`.

### ✔ EJECUTADA — Auditoría estratégica de la home (decisión de Arturo, 6 ago 2026)

Arturo eligió **reordenar** (no "solo pulir"). Lo ejecutado, contra los hallazgos
que sobrevivieron a la corrección del PR #84 — el detalle de la medición sigue
abajo, sin tocar, porque es el insumo que justifica cada movimiento.

**1. El argumento del seguro sube al puesto 3, fusionado.** Las dos piezas que
decían lo mismo —el bloque de datos *"Un seguro no es un gasto"* (36% de gasto de
bolsillo · 7 de cada 10 sin seguro), que vivía **dentro del comparador**, y el
manifiesto corto *"Creés que estás protegido…"*, cinco pantallas más abajo— son
ahora **una sola sección navy**, pegada al teaser del simulador.

Orden nuevo: **Hero → Simulador → Por qué importa → Comparador → Qué cubre →
Cómo funciona → Diferenciadores → Quiénes somos → Aliados → FAQ → Contacto.**

El porqué: el argumento que justifica la **categoría** no puede llegar después de
pedirle a la persona que elija plan. Para 7 de cada 10 paraguayos la pregunta
previa no es *"¿cuál plan?"* sino *"¿por qué un plan?"*. El simulador **no se
movió** del puesto 2 — eso se midió y se decidió en julio (dec. 12b) y no se
re-litiga; el argumento entra como el primer respaldo, no como peaje.

Estructura interna: golpe humano → los dos datos duros que lo prueban → el
reencuadre (cuenta impredecible vs. cuota conocida) → qué hacemos al respecto
(las cuatro preguntas) → las dos salidas (la nota del blog, la historia).

⚠ **Dos efectos colaterales, anotados para que nadie se sorprenda:**
- Se podó *"Salud Protegida. Protección que se siente."* del cierre del
  manifiesto: a dos pantallas del hero repetía su propio H1. A siete no repetía;
  acá sí (regla de etiquetas).
- **`manifesto_scroll` cambió de significado en la home** y ya está anotado en el
  ANEXO §2: se dispara a 1,75 pantallas en vez de ~7,7, así que mide "llegó al
  argumento", no "atravesó la página". La serie histórica no es comparable a
  partir del 6 ago 2026. `blog_open` pasó de `origen:'comparador'` a
  `origen:'por_que_importa'` (el bloque se mudó; el nombre viejo mentía).

**2. El descuento sale de la letra chica.** *"¿Hay descuento por la forma de
pago?"* estaba **enunciado, no respondido**: gris de 12,5px al pie de otra
sección. Ahora es una franja legible en el comparador, **donde están los
precios**, y en positivo — una razón para elegir, no una aclaración legal. La FAQ
conserva la respuesta larga; el pie de la sección "qué cubre" ya no la repite.

**3. Consolidada la repetición real (hallazgo 3).** Se eliminó la franja navy
*"Lister + más de 50 prestadores en todo el país"*: decía exactamente lo mismo
que la puerta a la Guía Médica de la sección "Qué cubre", pero **sin la acción**
que esa sí ofrece. El padding que aportaba pasó a la sección de arriba. La
sección de aliados (SaludPro 360) **no se tocó** — la auditoría corregida ya
había establecido que no es lo mismo, y consolidarla mezclaría lo que existe hoy
con lo que todavía no.

**Medido después (mismo método que el 5 ago):** escritorio **9,6 → 9,4**
pantallas · móvil **14,8 → 14,5** · de 12 secciones a 11. El argumento del seguro
pasó de arrancar a **3,0 pantallas** (y su gemelo a 7,7) a arrancar a **1,75**.
El comparador bajó de 2,6 a **2,25** en móvil al soltar el bloque de datos.
Verificado: build OK, QA integral **0 roto** (los 5 "confunde" son de notas del
blog publicadas hoy por el bot, no de la home), y captura desktop+móvil de la
sección nueva, del comparador y de la juntura donde estaba la franja.

**Lo que NO se ejecutó, y por qué.** La **cobertura geográfica** sigue siendo una
afirmación ("en todo el país") que nadie puede verificar sin ir a la Guía. La
auditoría la dejaba a decisión junto con el descuento, pero **no se puede
resolver con copy**: hace falta la base real de prestadores por ciudad
(pendiente B) para que "¿y en mi ciudad?" tenga respuesta. Queda abierta,
esperando ese dato. Territorio de este cambio: `app/page.jsx`,
`guia/ANEXO-requisitos-backend.md`.

### La medición que originó todo esto (5 ago 2026) — insumo, ya ejecutado

Arturo pidió mirar la home "de forma estratégica… la disposición de cada
herramienta, y si hay mucho scroll". Se midió pero **todavía no se ejecutó
nada**: la decisión de reordenar quedó abierta. Los números y los hallazgos,
para que la próxima sesión no tenga que volver a medir.

**Profundidad: 9,6 pantallas en escritorio (1280×900) · 14,8 en móvil (390×844).**

| # | Sección | Móvil |
|---|---|---|
| 1 | Hero | 1,0 pant |
| 2 | Simulador (precio) | 0,8 |
| 3 | **Comparador de planes** | **2,6** |
| 4 | **Qué cubre / qué ponés vos** | **3,0** |
| 5 | Cómo funciona | 0,6 |
| 6 | "Creés que estás protegido" | 0,7 |
| 7 | "Lo que casi nadie te garantiza" | 1,2 |
| 8 | Empresa familiar | 0,8 |
| 9 | Lister + prestadores | 0,4 |
| 10 | Aliados / SaludPro 360 | 0,7 |
| 11 | **Preguntas frecuentes** | 1,3 |
| 12 | Contacto | 0,7 |

Las secciones 3 y 4 juntas son **el 38% de la página en móvil**.

**Hallazgo 1 — CORREGIDO. No es profundidad: es forma.**

> ⚠ La primera versión de este hallazgo decía que descuentos, cobertura
> geográfica y "¿está mi médico?" "viven en la FAQ, al 79% de profundidad".
> **Era falso** y lo detectó la revisión automática del PR #84. Los tres
> aparecen antes en la página. Se corrige acá para que nadie ejecute trabajo
> sobre una premisa equivocada:

| Pregunta | Dónde aparece antes | Qué falta realmente |
|---|---|---|
| **Descuentos** (2/4) | `page.jsx:628` — nota al pie gris bajo el comparador (~3 pant) | Está **enunciado**, no **respondido**: es letra chica de precios, no una respuesta a "¿hay descuento?" |
| **¿Está mi médico?** (2/4) | `page.jsx:697` — *"Buscá tu médico, sanatorio o estudio…"* con puerta a la Guía (~5 pant) | **Nada. Está bien resuelto.** El hallazgo original era incorrecto. |
| **¿Cubre en todo el país?** (2/4) | `page.jsx:697` y `:778` — *"en todo el país"* | Es una **afirmación**, no una verificación. No hay forma de responder "¿y en mi ciudad?" sin ir a la Guía |

**Lo que queda en pie, más chico y más preciso:** el descuento vive en letra
chica y la cobertura geográfica se afirma sin poder comprobarse. **No hay que
"desenterrar" nada de la FAQ** — hay que decidir si esas dos merecen mejor
forma arriba. "¿Está mi médico?" se saca de la lista.

**Hallazgo 2 — el argumento del "por qué un seguro" está partido en dos, y
ninguna mitad está arriba.** El bloque *"Un seguro no es un gasto"* está a
**3,0 pantallas**, *después* del comparador: el argumento que justifica la
categoría llega después de pedirle a la persona que elija plan. Y la sección 6
(*"Creés que estás protegido. La mayoría lo descubre recién cuando algo sale
mal"*) dice esencialmente lo mismo, cinco pantallas más abajo.
⚠ Esto choca con la dirección permanente que Arturo fijó el 26 jul: *"todo lo
que tenga que ver con eso… es muy importante"*, porque en Paraguay 7 de cada 10
no tienen seguro.

**Hallazgo 3 — CORREGIDO. La repetición es 4 ↔ 9, no 9 ↔ 10.**

> ⚠ También detectado en la revisión del PR #84. Había emparejado las secciones
> por vecindad, no por contenido.

La duplicación real: **`page.jsx:697` (sección 4)** dice *"Lister, nuestro
centro propio… más de 50 prestadores en todo el país"* y **`page.jsx:778`
(sección 9)** repite *"Lister + más de 50 prestadores en todo el país"*. Es el
mismo mensaje dos veces.

La **sección 10 NO es lo mismo**: es el carrusel de **aliados comerciales**
(SaludPro 360), y sus prestadores médicos están marcados como ejemplos y
*"muy pronto"* / *"próximamente"* (`page.jsx:786-815`). Consolidar 9 con 10
mezclaría lo que existe hoy con lo que todavía no existe — y dejaría intacta
la repetición verdadera.

~~**Qué falta decidir (es de Arturo, altera el alcance):**~~ ✔ **DECIDIDO el
6 ago 2026: reordenar.** Arturo eligió mover, no solo pulir. Lo ejecutado está
arriba, en el bloque que abre esta sección.

*Cómo se midió, por si hay que repetirlo: build local, servir `out/` bajo
`/sp-prototipo/`, y recorrer `document.querySelectorAll('section')` anotando
`top` y `height` a 1280×900 y 390×844.*

### ✔ El blog con jerarquía editorial (6 ago 2026, referencia del usuario: Men's Health)

Arturo pasó dos capturas sin instrucción: la portada de **Men's Health** y el
**newsletter de Arnold's Pump Club**. Eligió trabajar sobre la primera.

**El diagnóstico de la referencia:** Men's Health no tiene una grilla, tiene
**jerarquía** — una nota manda (foto grande, título enorme), un riel de "lo
último" al costado, y las demás abajo. Cada pieza pesa distinto porque no todas
valen lo mismo. Nuestro índice era una grilla plana de 3 columnas donde las 22
notas pesaban igual: con 8 se leía, con 22 se leía como un depósito.

**Cuatro cosas estaban rotas, y ninguna se veía hasta contar 22 notas:**

1. **Las 22 portadas eran casi la misma.** `Cover.jsx` tenía dos temas
   (Prevención, Entendé tu plan) y todo lo demás caía al default → mismo degradé
   y mismo ícono para la mayoría. **Resuelto por el PR #87** (ver abajo): cinco
   temas atados a los colores-ancla del manual de marca.
2. **21 de 22 notas decían "4 min de lectura".** Era el default del frontmatter,
   no una medición. Ahora **se calcula del cuerpo** (200 palabras/min): quedan
   9 notas de 2 min y 13 de 3 min. El campo `minutes` se ignora.
3. **Había DOS taxonomías que no se hablaban.** El `kicker` se muestra en cada
   tarjeta y existe en las 22 notas; `categoria` alimentaba el filtro y solo
   estaba en 8 — las otras 14 caían en **"General"**. El lector veía una
   etiqueta buena en la tarjeta y un filtro que la ignoraba. **Resuelto por el
   PR #87** con la lista cerrada de cinco; acá se cerró el último cabo: la
   categoría es ahora **la única etiqueta visible** (tarjeta, destacada y
   artículo), porque dejar el kicker en pantalla mantenía dos nombres para la
   misma nota — justo el problema que veníamos a arreglar.
4. **El copete se repetía textual como primer párrafo** en las 22 notas
   publicadas: el frontmatter trae `intro`, que se rinde como bajada, y el
   markdown arrancaba con el mismo texto. Se recorta en `lib/blog.js`
   (comparación normalizada, solo ante coincidencia exacta) y **no** en el motor
   de contenido: la duplicación es de presentación — el markdown, leído solo,
   necesita su primer párrafo. Verificado: 22/22 sin duplicado.

**Layout nuevo:** portada (destacada grande + riel "Lo último" con 5) → chips de
sección → "Todas las notas" en grilla. Con un filtro activo **la portada se
pliega** y todo pasa a grilla: un filtro que deja la destacada arriba se lee como
un filtro roto. El ancho del índice subió de 860 a 1120px.

### ⚠ DOS SESIONES, EL MISMO HALLAZGO, EL MISMO DÍA — cómo se integró

Mientras esta sesión trabajaba, **otra abrió el PR #87** ("Cinco categorías de
blog, una por ancla de color de la marca") con **exactamente el mismo
diagnóstico**: 14 de 22 notas sin `categoria` → dos tercios del blog con la
misma portada. Y lo resolvió **distinto y mejor**:

| | Esta sesión (#86) | La otra (#87) |
|---|---|---|
| Eje | el `kicker` — 7 secciones sacadas de los datos que ya había | **lista CERRADA de 5 categorías**, asignadas a las 22 notas a mano |
| Colores | 7 degradés **inventados** "dentro del rango navy↔teal" | **los colores-ancla del manual** (`references/colors.md`): Sage, Lavender y Terracota como territorios narrativos |
| Datos | se cambió de eje para esquivar el campo vacío | **se llenó el campo** en los 16 markdown que faltaban |
| Guardas | ninguna | `lib/categorias.js` como fuente única + aviso en el build ante un typo |

**Ganó #87 y se fusionó primero** (protocolo de `CLAUDE.md`: los merges van de a
uno). Después esta rama trajo `origin/main` y resolvió los conflictos **a favor
de la taxonomía ajena**, conservando de acá solo lo que #87 no tocaba: la
jerarquía editorial del índice, el copete duplicado y el tiempo de lectura real.

**Una decisión de integración propia, para que quede escrita:** con las cinco
categorías adentro, la etiqueta visible de tarjeta/destacada/artículo pasó de
`kicker` a `categoria`. Si no, la portada Sage decía "Prevención" en el filtro y
"Salud preventiva" en la tarjeta — dos nombres para la misma nota, que es el
problema original con otra cara. El `kicker` sigue en el frontmatter para el
motor de contenido; simplemente no llega a la pantalla.

**La lección, que vale más que el cambio:** el protocolo de sesiones paralelas
funcionó exactamente como estaba escrito — mirar los PRs abiertos ANTES de
fusionar evitó que el merge automático pisara trabajo mejor fundado. Si esta
rama entraba primero, el blog quedaba con colores inventados por encima de una
paleta que el manual ya tenía resuelta, y la otra sesión habría tenido que
rehacer lo suyo.

⚠ **Lo que NO se copió de la referencia, a propósito:**
- **"MOST READ" numerado.** No tenemos ese dato: `track()` todavía no está
  conectado a ningún backend (ANEXO §2). Cualquier "lo más leído" sería
  inventado, y este es el sitio que se construyó sobre no afirmar lo que no
  puede probar. Cuando la analítica esté conectada, el módulo entra solo.
- **Tiempo relativo ("hace 2 horas").** El sitio es estático: se congelaría en
  el momento del build y a los tres días seguiría diciendo "hace 2 horas". El
  riel usa fecha corta ("4 ago"), que siempre es cierta.

📌 **Observación editorial que sale de esto (para `sp-contenido`, no para la
web):** las 22 notas miden entre **370 y 676 palabras** — todas 2 o 3 minutos.
Men's Health va de 2 a 30 min en la misma portada, y esa variedad de profundidad
es parte de lo que hace que se lea como publicación. Hoy no la tenemos. Anotado
también en `contenido/README.md`.

**Pendiente que queda vivo:** el **newsletter de Arnold's Pump Club** —la otra
referencia que pasó Arturo— no se ejecutó. Su formato (índice arriba, secciones
cortas, y la declaración de proceso editorial al pie) encaja con el principio de
honestidad del proyecto, pero es **producto nuevo**: necesita captura de email en
la web (el formulario de HubSpot sigue sin crearse, dec. 11x) y acordar cadencia
con el Master Orquestador en `sp-contenido`. No lo arranca una sesión de web sola.

**Territorio:** `lib/blog.js`, `app/blog/BlogList.jsx`, `app/blog/Cover.jsx`,
`app/blog/page.jsx`, `app/blog/[slug]/page.jsx`, `app/blog/Articulo.jsx`,
`app/globals.css`, `contenido/README.md`.

### ✔ El criterio de evaluación web, hecho ejecutable (6 ago 2026)

Arturo trajo un **criterio de evaluación de la web** con tres puertas (Claridad
A · Accesibilidad y rendimiento A · Craft B+). Es el mejor documento de los que
circularon: operativo, con dueños y declarando sus propios agujeros. Su propia
premisa —*"la Puerta 2 se aprueba con números, no con criterio"*— más su propia
advertencia —*"si nadie valida técnicamente, quien entrega se autoevalúa"*— piden
que el estándar sea **ejecutable**, no un PDF que se discute.

**Qué se hizo:** `qa/qa-integral.mjs` ganó una sección 6 que mide las puertas que
faltaban, y el resultado quedó en **`qa/CRITERIO-PUERTAS.md`** — el prototipo
contra las tres puertas, con números.

| Medición nueva | Resultado |
|---|---|
| **LCP** en gama media (CPU 4×) sobre 4G | home 924 ms · simulador 668 ms · planes 324 ms (vara 2500) |
| **CLS** | 0,000 · 0,001 · 0,000 (vara 0,1) |
| **Foco visible** | 40/40 interactivos de la home cambian al recibir foco |
| **Tokens** | ❌ **17 valores de radio distintos · 618 hex a mano de 84 colores** → ✅ desde el 6 ago, ver abajo |

⚠ **Dos trampas de medición que quedaron aprendidas y comentadas en el código:**
- **LCP hay que OBSERVARLO, no consultarlo.** `getEntriesByType('largest-
  contentful-paint')` vuelve vacío: esas entradas no quedan en el buffer. El
  `PerformanceObserver` se instala con `addInitScript`, antes de que la página
  pinte. La primera versión medía `null` y lo reportaba como "el navegador no
  informa" — parecía un límite del navegador y era un error nuestro.
- **INP no se puede medir en laboratorio.** Es métrica de campo. Cualquier INP
  verde reportado desde headless es un número inventado; sale de CrUX cuando
  haya tráfico. Quedó escrito para que nadie lo prometa.

**Lo que el boletín deja pedido:**
1. ~~**Pasada de tokens**~~ — **hecha el 6 ago** (ver "La pasada de tokens" abajo).
2. **`₲` vs `Gs.`**: el sitio renderiza `₲ 238.000`, el criterio fija
   `Gs. 1.250.000`. Hay que elegir uno y aplicarlo en los dos lados.
3. **La tabla de contraste del criterio necesita `#007d77`**: propone resolver
   el botón turquesa con *texto navy sobre `#00BCB4`*; el sitio usa *teal
   profundo `#007d77` con blanco* desde el 25/07 (dec. 12a). Las dos pasan AA,
   pero si el criterio sale como está, lo que se construya no va a coincidir con
   el sitio.
4. **Las 10 preguntas** de la Puerta 1.1 no se pueden correr hasta que la lista
   exista; hay material previo en `sp-interno`
   (`PREGUNTAS-FRECUENTES-asesores-2026-07.md`).
5. ~~**La carencia antes del teléfono** (Puerta 1.5)~~ — **hecha el 7 sep**
   (dec. 12d): el resultado del simulador muestra las esperas del plan antes del
   formulario, y la suite verifica la posición, no solo la presencia.

⚠ **Contradicción de alcance que excede a la web y no se resolvió acá:** el
criterio se declara aplicable a *"entregas de fase 1: rediseño web, cotizador,
guía médica básica, blog"*. La decisión **11p** (23 jul) dice que el prototipo
Next.js **ES** la web pública y que un proveedor, si entra, es implementador u
hosting, no dueño del diseño. Cotizador, guía y blog ya existen y funcionan. O
el alcance cambió, o el criterio está escrito sobre un supuesto vencido. **Es
decisión de Arturo y toca la relación con un proveedor: se discute en
`sp-interno`, no en este repo público.**

### ⭐ LA PASADA DE TOKENS — el sistema de color y radio (6 ago 2026)

**Qué era el problema.** El criterio: *"si los colores están escritos a mano en
cada componente, esta entrega nos cuesta el doble el año que viene"*. Medido:
**970 usos de 100 colores** y **17 valores de `border-radius`**, todo en estilos
inline. Cambiar el navy no era editar una línea, era recorrer cientos de lugares.

**Dónde vive ahora.** Bloque `:root` en `app/globals.css`, con un comentario
largo que explica qué se tokenizó y qué no. **Al escribir estilo nuevo se usan
los tokens** — un hex a mano que se repita tres veces vuelve a poner el QA en
rojo, y esta vez con razón.

| | Antes | Ahora |
|---|---|---|
| Usos de token | 0 | **830** |
| Colores repetidos 3+ veces sin token | 20 (297 usos) | **0** |
| Radios a mano teniendo token | 99 | **0** |

**Lo que quedó afuera, declarado:** blanco y negro puros (174 usos — no son
decisiones de marca); hex en atributos SVG (53 — `fill="#..."` no acepta
`var()`, y la paleta de `blog/Cover.jsx` los alimenta por variable); 42 tintes
de uso único en un solo componente.

**Lo único abierto, y es de diseño:** dos pasos de radio (**14px ×19** y **18px
×11**) caen a mitad de camino entre `--r-sm`/`--r-md` y `--r-md`/`--r-lg`. Los
que estaban a 1-2px de un paso se acercaron (35 casos, invisible); mover 30
tarjetas 2px es una decisión de diseño, no una pasada mecánica. El QA la deja
anotada en amarillo.

⚠ **Y cambió la vara del guardián, que es media historia.** El chequeo viejo
contaba *todo* hex contra un umbral de 200: metía los `#fff` que no se
tokenizan, y el estado post-pasada lo habría pasado **raspando con 186**. Un
umbral que se pasa raspando es un adorno. Hoy la regla es la que el criterio
pregunta de verdad: **un color usado tres o más veces es una decisión tomada; si
no tiene nombre, es un token que nadie declaró.** Misma vara para los radios.

### ⭐ EL MAPA DE COBERTURA — qué superficie responde qué (6 ago 2026)

**Por qué existe este mapa.** El 6 de agosto, tres veces en un día, apareció la
misma forma: **dos cosas respondiendo la misma pregunta sin que nadie lo hubiera
decidido.** El blog tenía dos taxonomías que no se hablaban (lo encontraron dos
sesiones el mismo día, por separado). El home tenía dos matrices de cobertura ×
plan con cinco filas repetidas — el 25% de la página. Y ese mismo día nació
`/que-cubre`, una tercera superficie de cobertura.

Ninguna de las tres fue un error de nadie: fueron sesiones paralelas
construyendo bien, más rápido de lo que alguien decidía el reparto. **Este mapa
es el reparto.** Antes de crear una superficie nueva de cobertura, o de mover una
puerta, se mira acá.

| Superficie | La pregunta que responde | Forma |
|---|---|---|
| **Home** (`#comparar`/`#cartilla`) | *¿Cuál me conviene?* | Matriz de 9 filas: **solo lo que cambia** entre planes, de un vistazo |
| **`/planes`** | *¿Qué me toca en cada servicio importante?* | 11 servicios curados × 3 planes, con carencias y glosario |
| **`/que-cubre`** | *¿Está cubierto **esto** que me pidió el médico?* | Buscador sobre 983 respuestas de la grilla oficial |
| **`/guia`** | *¿Dónde y con quién me atiendo?* | Directorio de prestadores |

**No son redundantes: son cuatro preguntas distintas.** Por eso el arreglo nunca
fue fusionar páginas — fue **que cada puerta diga qué pregunta responde**. La
puerta genérica ("¿Querés ver más?") es la que rompe el sistema: manda a la
persona que llega con una orden médica en la mano a la comparación de planes.

**Regla que queda:** *una puerta se nombra por la pregunta que contesta del otro
lado, nunca por el lugar al que lleva.* El home tiene ahora dos puertas bajo la
matriz — "¿Está cubierto lo que me pidieron?" → `/que-cubre` y "El detalle fila
por fila" → `/planes` — en vez de una sola que decía "ver todos los planes".

⚠ Que `/planes` y `/que-cubre` sean cosas distintas **es decisión de Arturo**,
registrada al construir `/que-cubre`: *"que sea un espacio aparte"*. No
re-litigar sin él.

### ⚠ EL CAÑO DE PUBLICACIÓN SE ROMPIÓ EN SILENCIO (6 ago 2026)

**Qué pasó.** Los PRs #88, #90 y #89 se fusionaron a `main` y **ninguno disparó
el deploy**. `main` quedó tres commits por delante de producción durante horas
— con `/que-cubre` entero sin publicar — y nadie se enteró, **porque el sitio
seguía respondiendo**: solo que con contenido viejo.

**La causa:** GitHub no encadena workflows cuando el push viene de una acción
autenticada con el token de otra acción. Los merges hechos desde una sesión
disparaban el deploy; los hechos por otra vía, no. No hay forma de saberlo
mirando el repo: `main` se ve perfecto.

**El arreglo:** `deploy.yml` suma un `schedule` horario (`17 * * * *`) como red
de seguridad. `push` sigue siendo el camino normal; si el evento no llegó, a la
hora se publica igual.

**La lección, que vale más que el arreglo:** la regla cero mantiene fresca la
lectura del repo. **Nadie tenía fresco lo publicado.** En un proyecto donde el
repo es la única memoria compartida, que el repo deje de llegar a producción es
una falla de sistema, no una tarea de mantenimiento. *Verificar contra la URL
pública, no contra un build local.*

⚠ **`qa/qa-resultados.json` salió de git** en el mismo cambio. Era un artefacto
trackeado: todas las sesiones lo regeneran al correr la suite, así que era un
imán de conflictos — y peor, un JSON viejo commiteado **se lee como evidencia
del árbol actual y no lo es**. La evidencia se genera corriendo la suite.

### Preguntas abiertas (y quién responde)

- ¿Qué campos guarda hoy el registro de búsquedas? → **el HTML que va a
  pasar el usuario** (pendiente #2).
- ¿Quién carga `min_plan` por prestador y quién corrige teléfonos/
  direcciones/horarios? → SP + empresa desarrolladora.
- ~~¿WordPress o Next.js para la web pública?~~ ✔ RESUELTO (dec. 11p): Next.js
  (el prototipo). BuenaVista, si entra, es implementador/hosting.
- ¿Dominio **del sitio** (hostname para `SITE_URL`) y **de la guía**? → SP.

---

## 5. CÓMO RETOMAR EL TRABAJO (instrucciones técnicas)

```bash
# correr el prototipo completo (web + simulador + guía)
npm install && npm run build
cd out && python3 -m http.server 8080
# → http://localhost:8080/            (web de planes)
# → http://localhost:8080/simulador/  (simulador)
# → http://localhost:8080/guia/guia_home.html (guía)
```

- **La guía se edita solo en `guia/`** (la fuente y el paquete que se entrega
  a la empresa). `public/guia/` se genera automáticamente en cada build
  (`scripts/sync-guia.mjs`, hook `prebuild`) y está fuera de git — no editar.
- Las páginas de la guía usan el CDN de Tailwind → necesitan internet para
  verse con estilos. En entornos sin salida a internet: compilar Tailwind
  local (v3, con los tokens del `tailwind.config` inline de cada página) e
  inyectar el CSS al verificar con Playwright/Chromium
  (`executablePath: '/opt/pw-browsers/chromium'`, instalar playwright-core
  FUERA del repo — ver `HANDOVER.md`).
- Probar el modo personalizado de la guía: `guia_resultados.html?plan=silver`.
- Verificaciones móviles: 360 / 390 / 430 px como mínimo.
- Flujo git de este proyecto: rama de trabajo → PR en borrador →
  verificación + CI verde → **merge automático** (el usuario autorizó en
  julio 2026 dejar de esperar el "fusionalo"; excepciones — cambios de
  visión/alcance o destructivos — esperan confirmación; detalle en
  `CLAUDE.md`) → Pages se redeploya solo (~2 min).
- **Sesiones paralelas**: hay varias sesiones trabajando a la vez sobre
  este proyecto. El protocolo completo está en `CLAUDE.md` — una rama
  por sesión, territorio declarado, merges de a uno (traer `origin/main`
  a la rama antes de fusionar), y en conflictos de HANDOFF/BITACORA se
  integra lo de ambas sesiones, nunca se descarta.
- El deploy usa `npm ci`: **no instalar dependencias dentro del repo** que
  no estén en `package.json` (ya rompió el lockfile una vez).

## 6. MATERIAL DE REFERENCIA

- **`BRANDSCRIPT.md` — el argumento de venta central (SB7).** El guion
  que dicta estructura y texto de toda pieza digital; se entrega a quien
  construya la producción. Escrito con los datos reales de GA adentro.
- **`BITACORA.md` — el libro del proyecto.** Diario narrativo de qué
  intentamos, qué falló, qué vueltas dimos y qué aprendimos. **Ritual
  obligatorio para quien retome este proyecto:** cada PR fusionado que
  haya enseñado algo deja su entrada (qué intentamos / qué pasó / qué
  aprendimos); las observaciones del usuario entran dictadas ("anotá en
  la bitácora: …"). Solo crece — nunca reescribir entradas viejas.
- `HANDOVER.md` — implementación técnica de la página de planes (v6).
- `guia/ANEXO-requisitos-backend.md` — eventos de medición, seguridad de
  cédula, campos de datos, higiene técnica. **Es el contrato con la empresa.**
- **Material interno** (briefs 01–06, plan estratégico, los 3 HTML de la
  guía actual de SIP, transcripciones y prototipos históricos): vive en el
  repo **privado `Nelargon/sp-interno`** (carpetas `project/` y `chats/`,
  más las ramas `archivo/*`). Se movió ahí en julio 2026 para que el repo
  público no exponga documentos confidenciales. **No compartir acceso a
  sp-interno con proveedores.**
- ZIP de entrega para la empresa: regenerable con `zip -r guia-medica-sp.zip guia/`.
