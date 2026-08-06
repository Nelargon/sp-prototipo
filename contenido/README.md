# contenido/ — las notas publicadas del blog

`blog/publicados/` es la única fuente de la sección `/blog` del sitio: cada
archivo markdown de esta carpeta se convierte en una nota publicada en el
próximo deploy (índice, sitemap y página propia, todo automático).

**La cocina editorial vive en el repo privado `sp-interno`**: línea
editorial, digests diarios de noticias y los borradores que las Routines
generan cada lunes. Publicar una nota = copiar acá el markdown aprobado
(con `status: "publicado"`) vía PR. Nada se publica sin revisión humana.

Formato de archivo: `YYYY-MM-DD-slug.md` con frontmatter `title`, `slug`,
`kicker`, `date`, `description` (para la tarjeta del índice y el SEO), `cover`
(opcional — ruta a una foto en `/public`; si falta, el blog genera una portada
de marca automática por código), `intro` (el
copete de la nota), `tags`, `sources` (opcional), `nota` (opcional, el
recuadro gris final) y `author`. Referencia completa:
`contenido/blog/PLANTILLA.md` del repo `sp-interno`.

## Tres cosas que cambiaron el 6 ago 2026 — leer antes de escribir una nota

1. **El `kicker` ES la sección.** Antes había dos ejes: el `kicker` (que se ve
   en cada tarjeta) y `categoria` (que alimentaba el filtro). No coincidían —
   14 de 22 notas no traían `categoria` y caían en "General", y el mismo kicker
   aparecía con categorías distintas. Ahora **el filtro del índice usa el
   kicker**, que existe en todas las notas. `categoria` se sigue leyendo pero
   ya no manda en la UI: **elegí bien el kicker, es lo que ordena el blog.**
   Los que están en uso: *Salud preventiva · Decisiones · El dato · Entendé tu
   cobertura · Dónde te atendés · Entendé el sistema · Cuánto cuesta*. Un
   kicker nuevo crea una sección nueva (y necesita su tema visual en
   `app/blog/Cover.jsx` — si no, cae al degradé por defecto).
2. **`minutes` ya no se usa: el tiempo de lectura se calcula** del cuerpo
   (200 palabras/minuto). Las 22 notas declaraban "4" y era un default, no una
   medición. Podés dejar el campo o sacarlo; el sitio lo ignora.
3. **No repitas el `intro` como primer párrafo del cuerpo.** El sitio rinde
   `intro` como copete, así que el markdown que arranca repitiéndolo se leía
   dos veces. Hoy el sitio lo detecta y lo recorta solo — pero la nota queda
   más limpia si no viene duplicado de origen.

📌 **Observación editorial para el motor (no es un bug):** las 22 notas
publicadas miden entre 370 y 676 palabras — todas 2 o 3 minutos de lectura. La
variedad de profundidad es parte de lo que hace que un blog se lea como una
publicación y no como un depósito; hoy no la hay. Es decisión de `sp-contenido`,
no de la web.

Regla de lenguaje (ver CLAUDE.md): idioma de familia, no jerga de seguros —
nada de "cartilla", "práctica" ni "prestación" de cara al usuario.
