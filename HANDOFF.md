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
- **Telemedicina y "laboratorio a domicilio" NO aparecen** en ninguna grilla → la tarjeta "garantiza" del home sobrepromete (médico a domicilio sí existe).

### Pendientes priorizados (Parte 2)
1. **Telemedicina/domicilio (Crítico de la auditoría):** revisar los cuadernillos
   PDF (Drive, carpeta PRIVILEGE) por la cláusula, o reetiquetar la tarjeta del
   home "En camino".
2. **Bloque "qué no cubre / qué pagás aparte"** con la data nueva (cobertura real
   + AD=convenio), en gris (regla de tono).
3. **Salud mental:** al mostrar el diferenciador, decir "incluida en los planes
   Privilege" — no prometérsela al que busca Vital.
4. **Hoja de plataformas para BuenaVista** (comparación abajo, aún sin escribir).
5. Testimonios reales + fotos reales (pendientes viejos).

### Guardas — qué NO tocar sin input humano
- **Test de 5 segundos (§3c): EN PAUSA** — no tocar hero/categoría/acción
  dominante hasta que el usuario corra el test con usuarios.
- No afirmar "garantizado por contrato" sin la cláusula.
- Reglas de **tono / tipografía / lenguaje** en `CLAUDE.md` — respetarlas.

### Decisiones que viajaron por conversación (escritas acá para no perderlas)
- **Plataforma (pendiente #8):** *WordPress* (lo propone BuenaVista) vs *Next.js*
  (el prototipo) vs *híbrido* (Next.js + CMS headless). La pregunta que decide:
  **¿quién mantiene la web en el día a día?** El backend hace falta igual (ANEXO).
  Criterio: buscar **arquitecto de conversión, no diseñador estético**. Falta la
  "hoja compartible" de una carilla (pendiente 4).
- **Drive `SP-Web`:** ordenar por rol, separar materia prima de
  `01_APROBADO-para-web`; regla de oro: nada sale a la web si no está "aprobado".

### Índice — dónde vive cada cosa
Home `app/page.jsx` · Simulador `app/components/Simulador.jsx` (flujo plan-puesto)
· Motor de precios `app/quote.js` · Guía `guia/*.html` · Datos de planes
`datos/planes-vigentes/` · Análisis AD `datos/planes-vigentes/ANALISIS-arancel-diferenciado.md`
· Blog `contenido/blog/` · QA `qa/qa-integral.mjs`.

### Eventos de tracking nuevos (para cuando se conecte el backend)
`sim_plan_preset`, `sim_plan_switch`, `blog_open{origen:comparador}` (+ los del ANEXO §2).

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
   marca; opciones en el informe, resolver junto al pendiente #8);
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
   declarado, bloqueado por el pendiente #8 y el backend de SIP.

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
8. **Decisión de plataforma de la web pública**: el brief de BuenaVista
   dice WordPress; el prototipo es Next.js. Alguien decide qué va a
   producción y quién hospeda. Condiciona todo el trabajo siguiente.
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

9. **SEO y dominio**: sitemap, metadatos, schema.org (ejemplo ya incluido
   en la ficha), y decidir si la guía vive en `guia.saludprotegida.com.py`
   (la marca se lleva el crédito en Google) o queda en `sp.sip.com.py`.
10. **Gobernanza de contenido**: quién actualiza prestadores, textos y
    especialidades (el brief pedía CMS editable por SP).
11. **Ritual mensual de datos**: revisión de 30 minutos del top de búsquedas
    sin resultado con Comercial/Convenios/CX — un dashboard que nadie mira
    no es inteligencia de negocio.
12. **"Cerca de mi ubicación" + mapa** (necesita coordenadas en la base).
13. **Variante C2 del modo personalizado** (lista dividida "Tu red / El
    resto invita") — solo si los datos de `upsell_view` muestran tracción.
14. **Agendamiento de turnos**, empezando por Lister: el paso de "dónde
    atenderse" a "atenderse".
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

### Preguntas abiertas (y quién responde)

- ¿Qué campos guarda hoy el registro de búsquedas? → **el HTML que va a
  pasar el usuario** (pendiente #2).
- ¿Quién carga `min_plan` por prestador y quién corrige teléfonos/
  direcciones/horarios? → SP + empresa desarrolladora.
- ¿WordPress o Next.js para la web pública? → SP + BuenaVista.
- ¿Dominio de la guía? → SP.

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
