# HANDOFF — Ecosistema digital de Salud Protegida

**Documento de pase de posta.** Si sos una persona (o una IA) retomando este
proyecto en una conversación nueva: leé este archivo primero. Acá está la
dirección, lo construido, las decisiones tomadas con su porqué, y los
pendientes priorizados. Complementa (no reemplaza) al `HANDOVER.md` original,
que documenta la implementación técnica de la página de planes.

*Última actualización: julio 2026.*

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
| **Simulador** (ruta propia) | `app/simulador/` → [/simulador](https://nelargon.github.io/sp-prototipo/simulador/) | Funcional, precios de referencia |
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
   (SOLO urgencias). Gilroy ExtraBold/SemiBold para títulos, Inter para
   cuerpo. Nombres en Tipo Oración, nunca MAYÚSCULAS SOSTENIDAS.
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

---

## 4. PENDIENTES PRIORIZADOS — el siguiente ciclo

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
6. **Precios y coberturas definitivos** para simulador y comparador
   (esperan a la mesa técnica; hoy dicen "cifras de referencia").
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
15. **Contenido del blog**: `/blog` hoy es un placeholder "muy pronto"
    (con el lugar ya reservado en el header). Definir estrategia
    editorial, quién escribe y con qué CMS — ligado a la gobernanza de
    contenido (#10).

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
- Probar el modo personalizado de la guía: `guia_resultados.html?plan=integral`.
- Verificaciones móviles: 360 / 390 / 430 px como mínimo.
- Flujo git de este proyecto: rama de trabajo → PR en borrador →
  verificación + CI verde → **merge automático** (el usuario autorizó en
  julio 2026 dejar de esperar el "fusionalo"; excepciones — cambios de
  visión/alcance o destructivos — esperan confirmación; detalle en
  `CLAUDE.md`) → Pages se redeploya solo (~2 min).
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
