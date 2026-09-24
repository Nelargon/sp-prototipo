# El correo del blog

Cada nota nueva del blog llega por correo, **con el texto completo adentro**, a
Arturo y a los líderes de área de SP, el mismo día que se publica.

> «La idea es que las personas que veo que pueden ser partes interesadas vean
> el valor del blog primero.» — Arturo, 24/09/2026

## Cómo funciona

1. El Publicador (o una sesión) sube la nota a `contenido/blog/publicados/`.
2. Termina el deploy a Pages → se dispara `.github/workflows/correo-blog.yml`.
3. `correo_blog.py pendientes` compara lo publicado con el registro
   (`enviados.tsv`, en la rama `estado/correo-blog`) y ve qué es nuevo.
4. `armar.mjs` arma cada correo leyendo la nota igual que la web (mismas
   dependencias y `lib/blog-texto.mjs`).
5. `correo_blog.py enviar` lo manda **uno por persona**, por el servidor de
   correo de SP, desde la casilla de Arturo, y anota la nota en el registro.

Si el deploy no se disparó con el push, el deploy de cada hora lo hace igual,
y este correo sale en ese momento.

## Quién lo recibe

La lista **no está en este repo**, porque es público. Vive en dos lugares:

- **Donde se usa:** el secreto `CORREO_BLOG_DESTINATARIOS` del repo.
- **Donde se documenta:** `sp-interno/contenido/correo-blog-destinatarios.md`
  (privado), con el nombre y el área de cada persona.

**Para sumar o sacar a alguien:** editá los dos. El secreto se edita en GitHub:
Settings → Secrets and variables → Actions → `CORREO_BLOG_DESTINATARIOS` →
Update. Hay que pegar la lista entera, separada por comas.

## Activarlo (una sola vez)

En GitHub: **Settings → Secrets and variables → Actions → New repository
secret**, tres veces:

| Nombre | Valor |
|---|---|
| `CORREO_BLOG_USUARIO` | la casilla que envía (la de SP de Arturo) |
| `CORREO_BLOG_CLAVE` | su contraseña (la misma del webmail) |
| `CORREO_BLOG_DESTINATARIOS` | la lista, separada por comas |

Después: **Actions → Correo del blog → Run workflow → modo `prueba`**. Manda
la nota más nueva solo a la casilla que envía, que se reenvía sola al Gmail de
Arturo. Si llega bien, está listo: la próxima nota sale sola.

**Sin el secreto `CORREO_BLOG_CLAVE`, la corrida automática no hace nada** y
queda en verde. Nunca se envía por accidente antes de configurarlo.

## Lo que garantiza (y está probado en `test_correo_blog.py`)

- **Nada se manda dos veces.** Una nota que salió aunque sea a una persona queda
  anotada y no se reintenta.
- **La primera corrida no manda nada:** anota lo que ya estaba publicado como
  línea de base.
- **Máximo 3 notas por corrida.** Si aparecen más de golpe (por ejemplo, porque
  se perdió el registro), salen las 3 más nuevas y el resto queda anotado como
  `omitido`.
- **Ninguna dirección en los logs.** Los logs de este repo son públicos: se
  imprimen cantidades y, si hace falta señalar a alguien, `fe***@dominio`.
- **Clave rechazada = se corta en el acto.** No se insiste contra otro puerto:
  el hosting bloquea por intentos fallidos.
- **Certificado siempre verificado.** Si el de `mail.saludprotegida.com.py` no
  sirve, se prueba `server.joseflores.com.py`, que es el mismo servidor.

## Si la corrida queda en rojo

Leé el resumen de la corrida en Actions. Casos conocidos:

- **«rechazó usuario o contraseña»:** la clave cambió. Actualizá
  `CORREO_BLOG_CLAVE`.
- **«rechazados: xx***@…»:** esa dirección no existe o está llena. La nota ya
  quedó anotada y no se reintenta: corregí la lista.
- **«No se pudo conectar a ningún servidor»:** el hosting no aceptó la conexión
  desde GitHub. No se envió nada y el registro no cambió: la próxima corrida
  reintenta. Si se repite, hay que pedirle al hosting que permita SMTP
  autenticado desde afuera.
- **«Se cortó el envío … después de N de M»:** la nota queda como `parcial`
  (no se reintenta, para no duplicar). Los que no la recibieron se pueden
  cubrir con un reenvío a mano.

## Por qué así y no de otra forma (24/09/2026)

- **Desde la casilla de SP y no desde Gmail.** El correo de SP está en un
  hosting con cPanel (no en Google Workspace ni en Microsoft 365). Mandar
  desde el Gmail de Arturo exigía una «contraseña de aplicación», que abre el
  buzón entero de su cuenta personal. La casilla de SP expone solo esa casilla,
  el correo pasa SPF y DKIM, y a los compañeros les llega desde adentro del
  mismo servidor.
- **Un proceso de GitHub y no una rutina de Claude.** Mandar un correo es
  mecánico. Las rutinas ya se trabaron de madrugada esperando permisos
  (`sp-contenido/routines/registry.yml`, 07/08/2026); un workflow no pide
  permiso a nadie.
- **Uno por persona y no un correo con todos.** No hay «responder a todos» por
  accidente, nadie ve la lista y la baja es individual.
- **El logo va adentro del correo** (imagen incrustada), no como link: Outlook
  de escritorio, que es lo que usa el equipo, bloquea las imágenes externas.
