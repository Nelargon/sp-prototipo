# contenido/ — las notas publicadas del blog

`blog/publicados/` es la única fuente de la sección `/blog` del sitio: cada
archivo markdown de esta carpeta se convierte en una nota publicada en el
próximo deploy (índice, sitemap y página propia, todo automático).

**La cocina editorial vive en el repo privado `sp-interno`**: línea
editorial, digests diarios de noticias y los borradores que las Routines
generan cada lunes. Publicar una nota = copiar acá el markdown aprobado
(con `status: "publicado"`) vía PR. Nada se publica sin revisión humana.

Formato de archivo: `YYYY-MM-DD-slug.md` con frontmatter `title`, `slug`,
`kicker`, `date`, `minutes`, `description` (para la tarjeta del índice y el
SEO), `intro` (el copete de la nota), `tags`, `sources` (opcional), `nota`
(opcional, el recuadro gris final) y `author`. Referencia completa:
`contenido/blog/PLANTILLA.md` del repo `sp-interno`.

Regla de lenguaje (ver CLAUDE.md): idioma de familia, no jerga de seguros —
nada de "cartilla", "práctica" ni "prestación" de cara al usuario.
