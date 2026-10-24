# Favoritas juntas — 24/10/2026

Devolución: «Están geniales. El serigrafía de dos tintas no me gusta tanto».
32 favoritas explícitas. Arturo autorizó con «Adelante» la comparación de una
selección de portadas juntas, no el reemplazo de portadas del blog.

La vista vive en `public/blog/laboratorio/grillas.html`, con datos en
`grillas.json`. Hoy conserva el HTML renderizado de las doce portadas del
componente Cover.jsx del commit 8c44fe4, extraído de las tarjetas de /blog/
filtradas por categoría. Usa recursos locales y sus rutas son relativas.
Las propuestas A, B y C se resuelven por IDs del catálogo. QA exige que los
36 IDs sean favoritas explícitas y conserva el mismo orden de doce artículos.
La firma de marca se toma del mismo HTML de Cover. No se generan ni editan
imágenes, no se modifica localStorage ni se aplican portadas al blog.

Los ensayos usan la grilla de tarjetas, no la portada editorial completa del
blog. El título introductorio identifica la selección de doce notas. Las
láminas comparan Hoy / A / B / C en 1280 y 390 px con alturas medidas;
QA también cubre 360 y 430 px. C es la recomendación, pendiente de elección.

Revisor: las categorías ubican la nota y reproducen el componente existente.
El checkbox mide 20 px, dentro de una etiqueta clicable de al menos 44 px;
la medición automática no incluye esa etiqueta. Ambos amarillos se revisaron.
