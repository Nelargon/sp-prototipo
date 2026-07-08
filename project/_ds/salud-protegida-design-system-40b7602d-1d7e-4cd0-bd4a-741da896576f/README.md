# Salud Protegida — Design System

Sistema de diseño para **Salud Protegida (Odontomedica S.A.)**, empresa paraguaya de medicina prepaga fundada en 2002 en Asunción. ~9.100 contratos activos, ~19.000 vidas aseguradas. Opera también **Lister**, su centro médico propio (consultas, laboratorio, imagen).

Este repositorio contiene los fundamentos visuales, verbales y de UI para todo lo que lleva la marca: landings, captación, portal del afiliado, dashboards internos, piezas de marketing y blog. **Idioma: español paraguayo**. Interfaz y CTAs siempre en español.

---

## Index / Manifiesto

| Archivo / Carpeta | Qué contiene |
|---|---|
| `README.md` | Este documento — visión, voz, motivos visuales, iconografía |
| `colors_and_type.css` | CSS vars — colores, type, spacing, radii, shadows, motion |
| `fonts/` | Gilroy Light + ExtraBold (OTF) — display only. Inter (body/UI) se carga vía CDN, ver `colors_and_type.css` |
| `assets/logos/` | Isologotipo, isotipo, logos de planes (Integral, Previsor, Primordial, Superior, Centralizado, Bienestar Plus, Seguro Estatal, Vital), favicon |
| `assets/illustrations/` | Placeholders de fotografía humana (no ilustraciones stock) |
| `preview/` | Cards de Design System (tipos, colores, spacing, componentes, brand) |
| `ui_kits/web/` | UI kit de la web institucional (home, plan, blog, portal del afiliado) |
| `slides/` | Plantillas de presentación 1920×1080 |
| `source-materials/` | Manual de Identidad original (PDF) y brand guidelines v2 (DOCX) |
| `SKILL.md` | Agent Skill — cómo usar este sistema desde Claude Code |

### Audiencias
1. **Prospectivo** — evalúa un plan. Busca tranquilidad, no ofertas.
2. **Afiliado** — usa el servicio. Busca resolver trámites rápido y sin fricción.
3. **Equipo interno** — operaciones. Necesita dashboards claros y sin ruido.

### Productos representados
- **Sitio institucional + flujo de captación** (`saludprotegida.com.py`)
- **Portal del afiliado** (credencial digital, autorizaciones, reembolsos, turnos)
- **Lister Centro Médico** (sub-marca con identidad propia, convive con SP)
- **Ocho planes con marca propia**: Integral, Previsor, Primordial, Superior, Centralizado, Bienestar Plus, Seguro Estatal, Vital

### Fuentes (source materials)
- `source-materials/Manual de Identidad Salud Protegida.pdf` — manual oficial
- `source-materials/SP_Brand_Guidelines_v2.docx` — guía extendida (marzo 2026)
- Carpeta externa montada: `RECURSOS DE MARCA Y LOGO 2023/` — copiada en su totalidad a `assets/logos/` y `source-materials/`

---

## Personalidad y promesa de marca

Cálida, concreta, serena. Sonamos como alguien que genuinamente disfruta ayudarte — ni frío como un hospital, ni agresivo como un vendedor. **23+ años** de trayectoria como empresa familiar.

**Principio rector:** solo prometer lo que las operaciones pueden cumplir hoy. La brecha entre lo que la marca dice y lo que el afiliado experimenta destruye más confianza que el silencio.

### 4 pilares de voz
- **Cercana** — relaciones directas, "red humana que te acompaña".
- **Clara** — hablamos como pacientes, no como médicos ni abogados.
- **Honesta** — decimos lo que podemos y lo que no. "Cobertura en más de 50 prestadores" le gana a "amplia red de cobertura".
- **Serena** — el afiliado elige seguridad, no lujo. Calma genera confianza, no presión.

---

## CONTENT FUNDAMENTALS

### Registro: vos vs usted
| Canal | Tratamiento | Tono |
|---|---|---|
| Web, blog, redes | **Vos** (tenés, querés, pagás) | Cálido, educativo |
| WhatsApp, BOT, IVR | **Vos** (default) | Directo, resolutivo |
| Teléfono ATC, presencial | **Usted** | Empático, paciente |
| Email formal, contratos | **Usted** | Estructurado, legal |

**Regla de espejo:** si el afiliado cambia de registro, SP acompaña. Cuando hay duda, usted.

### Casing
- **Oraciones tipo sentence case** en títulos, botones, labels. Nunca gritar con mayúsculas.
- **MAYÚSCULAS solo en overlines** (categorías pequeñas, 11px, tracking 0.08em).
- El logotipo "SALUD PROTEGIDA" es la única excepción — es marca, no texto.

### Patrón central: anticipar miedo, desactivar con información
1. Reconocer que puede generar preocupación.
2. Explicar qué es y por qué se hace.
3. Decir qué pasa después.

**Ejemplo — denegación de un estudio:**
> ❌ "Su solicitud fue rechazada conforme al artículo 12 del contrato."
> ✅ "Entendemos que esperabas una respuesta distinta. Este estudio no está incluido en Plan Previsor, pero sí en Plan Integral. Podés pedir una evaluación de cambio de plan con Ana, de atención al afiliado, al 0981-xxx."

### Específico siempre gana
- ✅ "Atendemos en 24 horas" → ❌ "atención rápida"
- ✅ "Cobertura en más de 50 prestadores" → ❌ "amplia red de cobertura"
- ✅ "Lo que incluye tu plan" → ❌ "Prestaciones cubiertas"
- ✅ "Tu plan" → ❌ "Su contrato"

### Lo que SP **nunca** dice
- "No se puede" sin alternativa
- "Eso no nos corresponde"
- "Lea el contrato"
- Urgencia artificial: "oferta limitada", "solo por hoy"
- Superlativos vacíos: "exclusivo", "imbatible", "imperdible"
- Comparaciones directas con competidores
- Taglines que cualquier empresa podría decir

### Emojis
- Permitidos en digital (web, redes, WhatsApp) si cumplen un rol.
- Máximo **2–3 por pieza**.
- Nunca al inicio de títulos.
- Nunca en email formal, contratos o dashboards internos.

### Guaraní / jopará
- Con intención y autenticidad cuando el momento lo pide.
- Nunca como decoración folclórica.

### En crisis (cuando la respuesta es "no")
1. Escuchar primero — no interrumpir ni justificar.
2. Reconocer el impacto en la persona.
3. Explicar claramente qué pasó y por qué.
4. Ofrecer la alternativa real — siempre hay un siguiente paso.

---

## VISUAL FOUNDATIONS

### Colores
**Principal:** Turquesa SP `#00BCB4` + Navy `#003B71` + Negro `#1D1D1B`.
**Acento cálido:** Ámbar `#F5A623` — CTAs, badges, highlights. **Máximo 10% de superficie.** Si el ámbar domina visualmente, está sobreusado.
**Neutrals:** body `#3D3D3D`, secundario `#6B6B6B`, borde `#E8E8E8`, fondo `#F5F5F5`. Nunca pure black para cuerpo.
**Washes:** turquesa `#E6F7F6`, navy `#E6EDF4` — fondos de sección sin peso.
**Funcionales:** success `#4CAF50`, warning `#FFC107`, error `#F44336`. Solo para estado; nunca decorativo.

**Regla dorada:** Turquesa siempre predomina. Sin turquesa, no se ve como SP. Navy para profundidad (heroes, autoridad). Ámbar solo como chispazo.

**Rojo:** prohibido como color de marca o señalización general. Solo `--error` para estados técnicos. El rojo activa alarma; nuestro afiliado ya viene con ansiedad.

### Tipografía
**Pareja tipográfica: Gilroy (display) + Inter (body/UI).**

Gilroy solo tiene dos archivos reales — **Light** y **ExtraBold** — sin Regular/Medium/SemiBold. Eso lo hace perfecto para titulares grandes (siempre en ExtraBold) pero débil para texto de cuerpo largo: Light a 16px se lee delgado y cansador, justo para una audiencia médica que suele llegar ansiosa. Por eso el cuerpo de texto, labels y controles de UI usan **Inter**, con pesos reales 400/500/600/700 — mejor legibilidad a tamaños chicos, sin necesitar síntesis de negrita.

| Uso | Familia | Peso | Archivo |
|---|---|---|---|
| Display, H1, H2, H3 | Gilroy | 700/800 ExtraBold | `Gilroy-ExtraBold.otf` |
| Body, small, caption, overline, botones, labels, inputs | Inter | 400/500/600/700 | Inter (self-hosted vía CDN, ver `colors_and_type.css`) |

Nunca uses Gilroy Light para párrafos — quedó reservado solo como weight-fallback interno de Gilroy, no para body copy.

Tokens: `--font-display` (Gilroy) y `--font-ui` (Inter) en `colors_and_type.css`. Las clases `.sp-display/.sp-h1/.sp-h2/.sp-h3` ya aplican `--font-display`; `.sp-body/.sp-small/.sp-caption/.sp-overline` ya aplican `--font-ui` — no hace falta declarar la familia a mano.

Fallback Gilroy: `'Gilroy', 'Aptos', 'Segoe UI', system-ui, sans-serif`. Fallback Inter: `'Inter', 'Aptos', 'Segoe UI', system-ui, sans-serif`.
Fallback print: Century Gothic (nunca mezclar con Gilroy ni Inter en la misma pieza impresa).

**Jerarquía desktop:**

| Nivel | Tamaño | Familia / Peso | Interlineado | Color |
|---|---|---|---|---|
| Display | 40px | Gilroy 800 ExtraBold | 1.1 | Navy `#003B71` |
| H1 | 32px | Gilroy 800 ExtraBold | 1.15 | Navy `#003B71` |
| H2 | 24px | Gilroy 800 ExtraBold | 1.25 | Navy `#003B71` |
| H3 | 18px | Gilroy 800 ExtraBold | 1.35 | `#1D1D1B` |
| Body | **16px** | Inter 400 | **1.7** | `#3D3D3D` |
| Small | 14px | Inter 400/500 | 1.6 | `#6B6B6B` |
| Caption | 12px | Inter 500 | 1.5 | `#6B6B6B` |
| Overline | 11px | Inter 600, UPPERCASE, tracking 0.08em | 1.4 | contextual |

Body 16 / line-height 1.7 no es negociable. Público médico frecuentemente ansioso; leading generoso reduce carga cognitiva.

Móvil (<600px): Display→28, H1→24, body se queda en 16.

### Spacing
Sistema de 8. Entre secciones 48px. Título↔contenido 16px. Entre párrafos 12px. Cards padding 24px (20 móvil). Mínimo entre elementos 8px.

**Generous whitespace es parte de la marca.** Audiencias médicas suelen estar estresadas — UI apretada sube ansiedad.

### Backgrounds
- **Default = blanco.** Jamás dark mode por defecto.
- **Heroes** en Navy `#003B71` (institucional, serio) o Turquesa `#00BCB4` (onboarding, momentos de bienvenida).
- **Washes** (`#E6F7F6`, `#E6EDF4`) para separar secciones sin peso. No para superficies grandes.
- **Fotografía humana real**, preferentemente paraguaya, cálida (warm tint, nunca b&w clínico). No stock corporativo, no ilustraciones vectoriales de "gente feliz".
- **Sin gradients de marca.** Los degradados se prohíben explícitamente en el manual. Excepción: "protection gradient" muy sutil para legibilidad de texto sobre foto (negro→transparent, 0→50% opacity).
- **Sin patrones ni texturas.** Composición limpia.

### Bordes y radios
Todo redondeado, nada con esquina dura. Es un pilar estético.
- Inputs: **6px**
- Botones: **8px**
- Cards: **12px**
- Contenedores grandes: **16px**
- Badges / chips: **pill (999px)**

Bordes finos (0.5–1px) en `--gray-border` (#E8E8E8). Focus ring: 1.5px turquesa + inset glow `0 0 0 3px rgba(0,188,180,.18)`.

### Sombras
Suaves y bajas. Médico, no materialista.
- Card: `0 1px 3px rgba(0,0,0,0.06)`
- Card hover: `0 4px 16px rgba(0,0,0,0.08)`
- Popover: `0 8px 24px rgba(0,59,113,0.12)` — tintada con navy, no negra pura
- Modal: `0 20px 48px rgba(0,59,113,0.18)`

Nunca sombras duras o con offsets grandes. Nunca inner-shadow decorativo.

### Animación
Calma. Nunca ansiedad. Nunca bounces.
- Durations: **120ms** (micro), **200ms** (base), **360ms** (entrada grande).
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` — entrada desacelerada, salida lineal.
- Fades y slides pequeños (4–8px). Nada de elasticidad, overshoot ni spring.
- Loading: spinner discreto turquesa o skeleton gris. Nunca pulsos rojos/amarillos.

### Hover / press
- **Hover (botón primario):** turquesa se oscurece ~10% (#009690), sin grow.
- **Hover (card):** sombra de card→hover, sin scale.
- **Hover (link):** color se oscurece, subrayado aparece después de 60ms.
- **Press:** opacidad 0.85, sin shrink. El "shrink on press" se percibe juguetón — no aquí.
- **Focus:** ring turquesa inset 3px, siempre visible para teclado.

### Transparencia y blur
Uso moderado. Modals: `rgba(29, 29, 27, 0.48)` overlay. Glass/backdrop-blur solo en sticky nav sobre foto (8–12px blur, fondo `rgba(255,255,255,0.82)`).

### Layout / rejilla
- Grid de **9×9 unidades** para proporciones de logo y composiciones institucionales.
- Contenido web: **max-width 1200px**, gutters 24px.
- Dashboard: grid de 12 columnas, 24px gap.
- Elementos fijos: nav superior 72px, sidebar del portal 260px.

### Cards
Fondo blanco, borde 0.5px `#E8E8E8`, radius 12px, sombra `0 1px 3px rgba(0,0,0,0.06)`. Hover: sombra a `0 4px 16px rgba(0,0,0,0.08)`. Padding interno 24px (20 móvil). Nunca cards con borde lateral coloreado (anti-slop).

### Fotografía
- Gente real, paraguaya cuando sea posible.
- Temperatura cálida (warm tones). Luz natural.
- Evitar: habitaciones blancas clínicas, estetoscopios, pastillas, ropa quirúrgica.
- "Protection gradient" lineal negro→transparente en bordes inferiores cuando hay texto encima.

---

## ICONOGRAPHY

El manual oficial **no prescribe un set de iconos específico**. La marca se apoya en tipografía + logos-de-planes (que son compuestos isotipo+texto) para transmitir categorías.

**Decisión para este sistema:**

- **Lucide Icons** (CDN: `https://unpkg.com/lucide@latest`) — stroke-based, línea ~1.75px, geometría limpia, empata visualmente con la construcción del isotipo SP (líneas abiertas, trazo uniforme, extremos redondeados).
- Color default: `var(--fg-secondary)` (#6B6B6B). Sobre acción: `var(--sp-turquesa)`. Sobre hero navy: blanco.
- Tamaño estándar 20px; 16px inline con texto 14px; 24px en targets táctiles grandes.
- Nunca rellenos sólidos, nunca pastilla coloreada detrás del icono (anti-slop corporate-SaaS).
- **Emoji NO se usan en UI institucional**, dashboards o email formal. Se permiten en WhatsApp/redes con moderación (máx 2–3 por pieza, nunca al inicio de título).
- **Unicode glyphs** puntuales para arrows (→ ←) y checkmarks ✓ en contenido, no en UI.

**⚠️ Substitución declarada:** Lucide no aparece en el manual original — es la recomendación más cercana al carácter trazo-abierto del isotipo. Si el equipo prefiere otro set (Tabler, Phosphor Regular, custom SP), cambiar aquí y en `ui_kits/web/`.

### Logos, isotipo, isologotipo
Todos copiados a `assets/logos/`:
- `logo-sp-2025-color.png` — isologotipo horizontal a color (uso principal)
- `logo-sp-2025-white.png` — versión en blanco (contornos; sobre fondo blanco no lee — usar sobre turquesa/navy/foto)
- `iso-sp-color.jpg` — isotipo a color sobre turquesa
- `iso-sp-white.jpg` — isotipo blanco sobre turquesa
- `iso-16x16.png` — favicon / app icon
- `isologo-04.png` / `isologo-05.png` — variantes horizontales
- `logo-sp-cuadrado.png` — versión cuadrada (redes, avatar)
- `plan-02` … `plan-09` — los 8 planes con marca propia

---

## Uso rápido (para quien diseña con este sistema)

1. Enlazá `colors_and_type.css` en el `<head>`.
2. Usá las vars semánticas (`--fg-heading`, `--bg-hero`, `--space-6`, `--font-display`, `--font-ui`). Evitá hex y nombres de familia directos.
3. Componé con las clases: `.sp-display`, `.sp-h1`, `.sp-h2`, `.sp-body`, `.sp-small`, `.sp-caption`, `.sp-overline`.
4. Ante la duda de copy, volvé a los 4 pilares: **cercana, clara, honesta, serena**.
5. Ante la duda de color, sacá ámbar y devolvele espacio al blanco.

**Contacto brand:** Arturo González — Director de Marketing, `marketing@saludprotegida.com.py`.
