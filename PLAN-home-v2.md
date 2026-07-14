# PLAN — Home v2: dos puertas, manifiesto sin peaje, portal como destino

**Estado: plan aprobado en discusión, ejecución pendiente del "adelante" del
usuario.** Este documento es el resultado del pin-pon de visión (julio 2026)
y del ejercicio de la mesa de advisors (Miller, Ogilvy, Sutherland, Bezos,
Munger, Christensen, Galperin — veredicto 7-0 a favor de reformar).
Complementa al `HANDOFF.md`; no lo reemplaza.

---

## 1. El problema que resuelve

1. **El manifiesto es un peaje.** Mide 720vh (~7 pantallas) y está ubicado
   entre el hero y las herramientas. El visitante que scrollea — lo más
   natural — atraviesa 7 pantallas de marca antes de tocar la primera
   herramienta que responde una de las cuatro preguntas. La visión promete
   "resolver en un minuto desde el celular"; el camino orgánico lo
   contradice.
2. **La home habla a una sola audiencia.** Todo está escrito para el que
   todavía no es cliente. El afiliado — que vuelve cada mes a preguntar
   "¿esto me cubre?" y "¿dónde me atiendo?" — no tiene nada: cada visita le
   re-vendemos un plan que ya compró. En seguros, el cliente que renueva
   vale más que el que entra (retención > adquisición).
3. **Los testimonios son placeholders.** Un testimonio inventado erosiona
   la credibilidad de todo lo demás (veto unánime Ogilvy/Munger).

**La visión no cambia; gana una segunda audiencia explícita.** Las cuatro
preguntas sirven igual al prospecto ("¿qué plan me conviene?") y al
afiliado ("¿qué me cubre **mi** plan?"). Son dos *jobs* distintos que la
home debe triar en 5 segundos.

## 2. Qué se hace (alcance de ejecución)

### 2a. Hero de dos puertas

El hero mantiene título, foto y tono. Cambian los CTAs — de
(Calcular mi plan / Conocé la historia) a **dos caminos + historia**:

- **Puerta 1 — "Quiero un plan"** → botón teal "Calcular mi plan" →
  `/simulador/` (igual que hoy).
- **Puerta 2 — "Ya soy de SP"** → botón contorno "Ver mi red" → el flujo
  de consulta por CI de la guía (CI + fecha de nacimiento, sin contraseña
  — patrón LatAm: cada campo de registro cuesta usuarios). En demo simula
  un asegurado SP Integral (`guia_resultados.html?plan=integral`), como
  ya documenta la decisión #8 del HANDOFF.
- "Conocé la historia" pasa a link menor → `/historia/` (ver 2c).

### 2b. Reordenar: las herramientas suben, el manifiesto baja y se comprime

Orden nuevo de secciones:

1. Hero (dos puertas)
2. **Guía Médica / qué cubre** (`#cartilla`) — sube; es la herramienta que
   sirve a ambas audiencias
3. Comparador de planes + banda SP Senior
4. Teaser del simulador
5. Cómo funciona la contratación
6. **Manifiesto corto** — UNA pantalla, reescrito en segunda persona
   (el cliente es el héroe; SP es el guía). Copy propuesto:

   > Creés que estás protegido. La mayoría lo descubre recién cuando algo
   > sale mal. Nosotros creemos que la protección real se construye
   > **antes** — antes de la llamada de madrugada, antes del «¿esto me
   > cubre?». Por eso acá todo se responde en un minuto: qué plan te
   > conviene, cuánto sale, qué te cubre y dónde te atendés.
   > **Salud Protegida. Protección que se siente.**

   Con link "Ver la historia completa" → `/historia/`.
7. Diferenciadores · Confianza/edificio · Aliados · FAQ · Cierre · Footer
8. **Sale de la home**: el scrollytelling de 720vh (migra a `/historia/`)
   y el carrusel de testimonios (vuelve cuando haya testimonios reales
   con nombre, foto y consentimiento — hasta entonces, nada).

### 2c. Página nueva `/historia/`

El manifiesto cinematográfico completo (720vh, las 7 frases, las fotos)
se muda intacto a su propia página. La magia no se lija (Sutherland: la
belleza es señal de confianza) — se saca del camino crítico. Con CTA al
simulador al final.

### 2d. Medición (el veredicto final lo dan los datos)

- `manifesto_scroll` {profundidad: 25|50|75|100, pagina: home|historia} —
  en el manifiesto corto y en `/historia/`. En dos semanas de uso real
  sabremos si la gente lo atraviesa o lo abandona.
- `puerta_home` {puerta: plan|ya_soy_sp} — clicks de las dos puertas.
  La métrica de la puerta 2 es **visitas recurrentes**, no conversión.
- Todo por el `track()` existente (`app/track.js`), documentado en
  ANEXO §2.

### 2e. Presupuesto móvil (requisito, no optimización)

- La home v2 debe cargar y ser usable en un gama media con 3G.
- Presupuesto: contenido crítico (HTML+CSS+JS sin fotos) ≤ 300 KB;
  fotos lazy fuera del primer viewport; LCP objetivo < 3 s en 3G rápido
  emulado. Se verifica con Playwright + throttling en el QA (#3).

## 3. Qué NO se hace ahora

- **Portal completo** (login, credencial, estados de cuenta, pagos):
  requiere backend de SIP, autenticación seria y la decisión de
  plataforma (pendiente #8 del HANDOFF). Queda declarado como **destino**:
  - Fase 1 (esta): puerta "Ya soy de SP" → guía personalizada CI+fecha.
  - Fase 2: credencial digital y "tu plan cubrió ₲ X este año" (hacer
    visible lo invisible), cuando SIP exponga APIs.
- Cambiar título/marca del hero ("Protección que se siente" queda).
- Tocar la guía (ya integrada) o el simulador.

## 4. Salvaguardas de la mesa (se auditan en el PR de ejecución)

- **Munger/Ogilvy**: cero testimonios inventados; el motor del simulador
  debe recomendar el plan correcto, no el más caro (auditar cuando
  lleguen los precios reales de la mesa técnica).
- **Sutherland**: la emoción no se elimina — se reubica después de las
  herramientas y conserva su página cinematográfica.
- **Galperin**: WhatsApp con contexto prellenado sigue siendo el canal de
  cierre; nada del rediseño lo entierra.
- **Bezos (prueba de la nota de prensa)**: el layout final debe hacer
  verdadera esta frase — *"una familia paraguaya resolvió a las 23:40,
  desde el celular, si la resonancia estaba cubierta y dónde hacérsela,
  sin llamar a nadie"*.

## 5. Ejecución propuesta (cuando haya "adelante")

Un solo PR, verificable con Playwright como siempre:

1. `app/historia/page.jsx` — nueva ruta con el scrollytelling migrado.
2. `app/page.jsx` — hero dos puertas, reorden de secciones, manifiesto
   corto, testimonios afuera.
3. `app/track.js` + eventos nuevos (`manifesto_scroll`, `puerta_home`).
4. ANEXO §2: fila de los eventos nuevos.
5. HANDOFF: visión con dos audiencias, portal como destino en fases,
   pendiente nuevo "testimonios reales" (responsable: SP).
6. Verificación: build, checks funcionales desktop/móvil, presupuesto de
   peso, captura de las dos puertas.

Estimación: una sesión de trabajo. Reversible: el manifiesto completo
queda intacto en `/historia/`, así que volver atrás es re-embeberlo.

## 6. Preguntas abiertas (para decidir antes o durante la ejecución)

- Copy exacto de la puerta 2: ¿"Ya soy de SP" / "Ver mi red" / "Mi SP"?
- ¿La puerta 2 abre la consulta CI+fecha en la home (modal) o lleva a la
  guía? (Propuesta: llevar a la guía — una sola implementación.)
- ¿`/historia/` entra al menú o solo se llega desde el hero y el footer?
  (Propuesta: solo hero + footer — el menú ya está cargado.)
