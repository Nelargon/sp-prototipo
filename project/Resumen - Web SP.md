# Salud Protegida — Web de Planes
## Resumen del proyecto · hasta hoy

**Estado:** prototipos funcionales navegables. Faltan datos finales de cobertura (mesa de trabajo), fotos reales y copy estratégico definitivo.

---

## 1. ¿Dónde llegamos?

Tenemos **dos piezas terminadas y navegables**:

1. **Simulador de planes** — un cotizador conversacional que recomienda un plan y estima el precio.
2. **Página de Planes** — evolucionó en 4 versiones (v2 → v5); la última (v5 "Página viva") es una experiencia inmersiva con storytelling.

Ambas funcionan de punta a punta y hay un export **standalone offline** de la v5 listo para compartir.

---

## 2. Entregables (archivos del proyecto)

- **Simulador de planes.dc.html** — el cotizador (se puede usar solo o embebido).
- **Simulador de planes SP.html** — el cotizador como archivo único offline.
- **Planes v2 / v3 / v4** — la evolución de la página (ver abajo).
- **Planes v5 - Pagina viva.dc.html** — la versión inmersiva (storytelling).
- **Planes v5 - Pagina viva.html** — v5 como archivo único offline (listo para compartir).
- **Planes v3 - Inter / Open Sans** — pruebas de tipografía.

---

## 3. El simulador de planes

Cotizador guiado que en ~1 minuto recomienda plan + precio estimado. **Muestra el precio antes de pedir datos de contacto.**

**Preguntas (cada una con su "por qué te preguntamos"):**
1. ¿Para quién es? (mí / pareja / familia / adulto mayor 65+)
2. ¿Qué edades tienen? (edad por persona — es lo que más mueve el precio)
3. ¿Qué nivel de cobertura buscás?
4. ¿Hasta dónde? — zona geográfica (Central $ / Interior $$ / Nacional $$$)
5. Coberturas adicionales (multi-select, con costo visible)
6. Cierre: nombre + WhatsApp + email (obligatorios) **o** WhatsApp directo

**Detalles resueltos:** el precio se ensambla animado (count-up) + destello al revelar; "adulto mayor" aclara que es plan aparte 65+ y ancla a SP Senior; panel lateral con progreso y mensajes de confianza.

---

## 4. La página de Planes — la evolución

- **v2** — punto de partida heredado (esquinas rectas, tipografía sola, "recomendador" viejo).
- **v3** — se incorporó el simulador embebido, se **redondeó toda la página**, tipografía web, y se cableó "Cotizá tu plan" al simulador.
- **v4** — se sumó **movimiento**: barra de progreso de lectura, reveals en scroll en cascada, hover en tarjetas. Tabla comparativa reescrita en **lenguaje humano** con Premium como flagship.
- **v5 "Página viva"** — salto a experiencia inmersiva:
  - **Hero cinematográfico** ("Protección que se siente", tipografía display gigante, parallax).
  - **Manifiesto scrollytelling** — las frases del manifiesto se revelan una por una al bajar (usa el copy real del plan estratégico).
  - **Cartilla viva interactiva** — escribís una práctica → ves qué cubre cada plan y cuánto ponés.
  - **Comparador con slider** — arrastrás y el plan se transforma (precio, color y cobertura cambian en vivo).
  - Simulador embebido + cierre + footer.

---

## 5. Tipografía — decisiones

- Base de marca: **Gilroy** (solo Light + ExtraBold disponibles).
- Problema detectado: Gilroy en tamaños chicos pierde legibilidad.
- Se probaron 3 caminos: todo Gilroy, todo Inter, todo Open Sans.
- **Decisión:** cuerpo/UI en **Inter**; **display grande** (hero, títulos) en **Gilroy ExtraBold** por carácter de marca. (v5 usa esta combinación.)

---

## 6. Movimiento / animación

**Referencia adoptada:** principios de motion de Zajno (easing, offset/delay, fade+posición, dimension/parallax).

**Qué funcionó:**
- Easing sereno `cubic-bezier(0.22,1,0.36,1)`, sin bounces (fiel al manual).
- Reveals en cascada + parallax sutil + count-up del precio.
- Manifiesto scroll-driven (el "wow" de la v5).

**Qué NO funcionó (y se corrigió):**
- Un "seguro" que revelaba todo a los 2.8s **mataba** la animación → se quitó.
- Reveals que dependían solo de `IntersectionObserver`/`requestAnimationFrame` quedaban **invisibles** en algunos contextos → se pasó a un mecanismo por scroll robusto + fallback.
- El hero se ocultaba por un bug de **fuente de scroll** (`window.scrollY` vs `scrollingElement`) → corregido.
- Lección: **nunca** dejar contenido que dependa 100% de JS para volverse visible.

---

## 7. Arquitectura de planes (decidida)

- **3 columnas:** SP Esencial · SP Integral · SP Premium.
- **SP Premium = flagship.**
- **SP Senior** en banda aparte, 2 niveles (Senior / Senior Plus), 65+.
- **SP Empresas** fuera del simulador por ahora (existe como espejo B2B de los 3 niveles).
- **SP Bienestar** quedó descartado como plan (salud mental vive como cobertura/add-on).
- Cobertura cargada en la tabla = columna "LO MEJOR" de la matriz, **marcada como sujeta a confirmación**.
- Diferenciadores fuertes de la matriz: **telemedicina garantizada por contrato** y **médico/laboratorio a domicilio** (nadie los pone por escrito).

---

## 8. Lo que funcionó vs. lo que no

**Funcionó:**
- El simulador como pieza central (coincide con una iniciativa del plan estratégico).
- Pasar la tabla a lenguaje humano.
- La v5 inmersiva: cambió la percepción de "bland" a "wow".
- Paleta y tono fieles a la marca (sereno, cálido, sin letra chica).

**No funcionó / pendiente de pulir:**
- Las primeras animaciones eran demasiado sutiles/rápidas (ya ajustado).
- Varios intentos hasta lograr animaciones robustas (documentado arriba).
- Aún falta terminación fina y contenido real.

---

## 9. Próximos pasos

1. **Fotos reales** (Canva/Drive) → hero con parallax + masking/zoom en secciones.
2. **Cobertura definitiva** cuando la mesa cierre números y topes.
3. **Copy estratégico** final (hoy se mantiene el copy actual a propósito).
4. **Elegir la versión principal** (recomendación: v5 como base).
5. Opcional fase 2: "cartilla viva" con datos reales conectados.

---

## 10. Decisiones abiertas

- ¿v5 pasa a ser la web principal (y jubilamos v3/v4)?
- ¿Intensidad de las animaciones: como está, más marcada o más calma?
- ¿Sumamos "¿tenés cobertura hoy?" al simulador para calificar el lead?
- ¿SP Empresas entra al simulador más adelante?

---

*Documento vivo — se actualiza a medida que avanza el proyecto.*
