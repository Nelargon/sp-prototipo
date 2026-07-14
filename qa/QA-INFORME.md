# QA integral del ecosistema — informe (julio 2026)

**Pendiente #3 del HANDOFF, ejecutado.** Cinco frentes, ponderados a
móvil (el 77% del tráfico real entra por celular — línea de base de GA).
La suite (`qa/qa-integral.mjs`) queda como **regresión permanente**:
cualquier cambio futuro se re-verifica contra ella. Cómo correrla: ver el
encabezado del script.

## Resumen ejecutivo

| | |
|---|---|
| Verificaciones OK | 16 grupos (76 links, simulador de punta a punta, guía completa, 4 páginas × 3 anchos, teclado, pesos, contenido) |
| Hallazgos "roto" | **0** |
| Arreglos aplicados en este PR | 12 (contraste, touch targets, lazy-loading) |
| Decisión pendiente del usuario | 1 (familia "blanco sobre teal" — ver abajo) |
| Pendiente externo | Testimonios reales (SP) · prueba en iPhone real (checklist abajo) |

## 1. Funcional — todo verde

- **76 links internos únicos** en las 8 páginas + /v1: todos responden.
- **Simulador de punta a punta**: llega al precio en 6 interacciones y el
  lead se envía y confirma.
- **Guía**: búsqueda con resultados ("cardio" → 5), cero resultados con
  rescate por WhatsApp (no es callejón), modo personalizado con banner,
  hoja de upsell abre y cierra con Escape, ficha con acciones de contacto.

## 2. Responsive — verde tras 3 arreglos

- Sin scroll horizontal en 360/390/430 px en las 4 páginas de la app.
- **Arreglado**: touch targets menores a 44 px en móvil — la pastilla de
  urgencias y el menú hamburguesa pasan a 44 px en pantallas chicas, y el
  link "Conocé nuestra historia" ganó área de toque (17 → 45 px) sin
  cambio visual.
- La guía (Tailwind por CDN) no es medible sin internet en este entorno:
  entra en la prueba de dispositivo real.

## 3. Accesibilidad — 12 contrastes corregidos, 1 decisión pendiente

Se midió el **contraste computado real** (composición de fondos con
transparencia incluida) contra WCAG AA. Corregido en este PR, preservando
el matiz de marca (cambios imperceptibles a simple vista):

- Gris apagado `#9aa0a6` → `#6B6B6B` (token existente) en notas,
  etiquetas "No incluida", paradas del deslizador y tira de prestadores:
  de 2,4–2,6:1 → **4,8:1**.
- Verde de texto `#009690` → `#007d77` en eyebrows, insignias y links
  (el verde de íconos y fondos no cambia): de 3,3–3,6:1 → **4,5–5:1**.
  Sobre el panel azulado (`#E6EDF4`), un punto más: `#00736e` (4,8:1).
- Pasos inactivos del simulador: alpha 0,6 → sólido `#9fb8d2` (**5,5:1**).
- Teclado: Tab recorre la home correctamente; Escape cierra la hoja de
  upsell; inputs con etiqueta accesible; imágenes con `alt`.

**⚠ Decisión pendiente (única): blanco sobre el teal de marca `#00BCB4`**
(2,4:1) — afecta los botones primarios ("Simulá tu plan", chips
seleccionados, la sección de cierre). Es la identidad comercial del
sitio; no se toca sin decisión. Opciones, de menor a mayor impacto:
1. **Aceptarlo como compromiso de marca** (práctica común; los botones
   grandes y en negrita mitigan) y compensar con foco visible + tamaño.
2. **Texto navy `#003B71` sobre teal** en los botones (8,4:1) — legible y
   dentro de paleta, cambia la cara de los CTAs.
3. **Oscurecer el teal de los botones** hacia `#008780` (3,2:1 — solo
   cumple para texto grande). Cumplimiento parcial.
La mesa técnica de identidad (o BuenaVista) debería resolverlo junto con
la decisión de plataforma (#8).

## 4. Rendimiento — todo verde

| Página | Crítico (gzip) | Vara |
|---|---|---|
| Home | 173 KB | ≤300 ✓ |
| Simulador | 164 KB | ≤300 ✓ |
| Blog | 149 KB | ≤300 ✓ |
| Historia | 151 KB | ≤300 ✓ |

- Home con 3G rápido emulado: contenido en <3 s ✓.
- **Arreglado**: 27 imágenes bajo el pliegue sin `loading="lazy"`
  (edificio, logos de aliados, logos de footer) — ahora cargan solo
  cuando hacen falta.

## 5. Contenido — verde con 1 pendiente conocido

- 10 páginas sin placeholders ("a confirmar", "Nombre Apellido", "9XX",
  lorem) ni jerga prohibida (cartilla/práctica/prestación). `/v1` se
  excluye a propósito: es el snapshot congelado.
- **Lente Shapiro** (estructura de landing): hero con un solo H1 ✓,
  prueba social (números + 12 logos de aliados) ✓, objeciones (FAQ) ✓,
  CTAs distribuidos ✓. **Hueco conocido**: la prueba social no tiene voz
  humana — testimonios reales con consentimiento (responsable: SP).

## Checklist de 10 minutos en iPhone real (lo que yo no puedo probar)

En Safari de un iPhone (y de paso un Android de gama media), abrir
[nelargon.github.io/sp-prototipo](https://nelargon.github.io/sp-prototipo/) y verificar:

1. El header translúcido se ve como vidrio esmerilado (no gris plano) al
   scrollear, arriba y abajo.
2. Las dos puertas del hero se tocan bien con el pulgar y navegan.
3. El buscador de "Qué cubre": escribir "resonancia", tocar la fila
   "Buscar en la Guía Médica" → llega a la guía con la búsqueda puesta.
4. La guía se ve con estilos (Tailwind CDN necesita internet) y el botón
   "Llamar" de una ficha abre el discador.
5. El simulador completo hasta el precio: los steppers de edad responden
   bien al toque; el teclado del celular no tapa el formulario del lead.
6. `/historia/`: el scrollytelling se mueve suave (sin tirones) y las
   fotos cargan.
7. El botón de WhatsApp (burbuja) abre la app con el mensaje puesto.
8. Girar a horizontal: nada se rompe.

Si algo falla: captura + modelo de teléfono, y entra como hallazgo.

## Reproducir esta auditoría

```bash
NEXT_PUBLIC_BASE_PATH=/sp-prototipo npm run build
# servir out/ bajo /sp-prototipo/ y luego:
PW_PATH=<externo>/node_modules/playwright-core/index.js \
  node qa/qa-integral.mjs http://localhost:8080/sp-prototipo
```

Los hallazgos quedan en `qa/qa-resultados.json` con severidad
(roto / confunde / cosmético).
