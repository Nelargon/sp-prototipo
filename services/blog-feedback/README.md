# Opiniones del blog

Receptor WSGI en Python 3.11+ con SQLite. La web de GitHub Pages sigue estática.
El correo abre este servicio para confirmar varias etiquetas sin cuenta. No
requiere servicios pagos ni paquetes Python externos; sí hosting que ejecute
Python/WSGI, HTTPS y almacenamiento persistente. cPanel debe tener soporte
Python/Passenger: tener cPanel por sí solo no garantiza esa capacidad.

## Activación

1. Alojar `app.py` junto con `scripts/correo-blog/feedback.py`, conservando la
   estructura del repo (o desplegar el repo completo fuera del directorio público).
   Configurar el servidor WSGI para importar `app.application`. En Passenger,
   agregar el directorio de `app.py` al path y exportar `application` desde
   `passenger_wsgi.py`. La aplicación puede montarse en `/` o en `/blog`; el
   servidor debe separar correctamente `SCRIPT_NAME` y `PATH_INFO`.
2. Definir cuatro variables en el servidor, sin guardarlas en Git:

   | Variable | Valor |
   |---|---|
   | `BLOG_FEEDBACK_URL` | URL HTTPS real de la aplicación, sin `/` final |
   | `BLOG_FEEDBACK_SECRET` | Secreto aleatorio de firma, mínimo 32 caracteres |
   | `BLOG_FEEDBACK_EXPORT_SECRET` | Otro secreto aleatorio distinto, mínimo 32 caracteres |
   | `BLOG_FEEDBACK_DB` | Ruta absoluta de SQLite **fuera del directorio público** |

   Generar cada secreto con un gestor de secretos o `secrets.token_urlsafe(48)`.
   No pegarlo en chats, logs, commits ni archivos del despliegue público.
3. En el proxy/servidor, omitir query strings y cuerpos de los logs, desactivar
   logs de acceso para esta aplicación si no es posible filtrarlos y limitar
   peticiones (por ejemplo 30/min/IP) y tamaño de cuerpo a 16 KiB. El receptor no
   registra IPs ni tokens. HTTPS protege el enlace; quien lo posee puede responder.
4. Probar el receptor y sus exportaciones antes de habilitar botones. En
   **sp-prototipo**, configurar la variable `BLOG_FEEDBACK_URL` y el secreto
   `BLOG_FEEDBACK_SECRET` con los mismos valores del receptor. Sin ambos, los
   correos siguen saliendo sin etiquetas; una configuración parcial bloquea el
   envío con un error claro, antes de conectar por SMTP.
5. En **sp-contenido**, configurar la misma URL y el secreto independiente
   `BLOG_FEEDBACK_EXPORT_SECRET`. Ejecutar el workflow `Opiniones del blog` y
   verificar el resumen `intake/feedback/latest.json`.
6. Ejecutar `Correo del blog` en modo **prueba**, confirmar una combinación y
   verificar que no aparezca como voto real. Después las próximas notas usan
   el nuevo correo automáticamente; no se reenvía el archivo histórico.

No activar los botones con una URL provisoria ni desplegar la base dentro de
`public/`. Respaldar la base con SQLite backup (no copiar un archivo mientras
se escribe); documentar quién tiene acceso al endpoint privado de comentarios.
Cambiar el secreto de firma invalida enlaces anteriores; cambiar el secreto
de exportación no afecta a los lectores.

## Comportamiento

- `GET /?token=...&tag=util`: muestra el formulario; **no escribe ni cuenta votos**.
- `POST /`: valida firma, vencimiento, etiquetas y comentario. Un voto por
  destinatario/artículo/versión; volver a enviar actualiza esa misma respuesta.
- `GET /export`: requiere `Authorization: Bearer <secreto de exportación>`.
  Devuelve conteos sin identificadores ni comentarios.
- `GET /comments`: misma autenticación; devuelve comentarios para revisión
  privada, nunca para guardar crudos en GitHub ni enviarlos a la línea editorial.
- Cinco etiquetas: útil, conocido, claro, confuso, falta de concreción. Claro y
  confuso se excluyen; se admiten otras combinaciones, incluido conocido + útil.
- Tokens válidos 90 días. Identificadores derivados con HMAC por artículo/versión;
  no contienen direcciones ni permiten correlacionar al lector entre notas.
- Retención: se purgan respuestas 180 días después del vencimiento de su enlace,
  en la siguiente recepción o exportación. La exportación semanal ejecuta la
  limpieza. Si se apaga el servicio, ejecutar la purga antes de reactivarlo.
- Los enlaces de prueba no escriben respuestas. No hay rastreo de aperturas.
  Sin entregas verificadas no se calcula porcentaje de participación.

La protección contra duplicados depende del enlace personal. Un reenvío permite
que otra persona actualice esa respuesta; evitar reenviar y no presentar el
sistema como una verificación de identidad. No hay cookies ni recursos externos.

## Pruebas locales

```sh
python3 services/blog-feedback/test_feedback.py
python3 scripts/correo-blog/test_correo_blog.py
```

Para desarrollo, `python3 services/blog-feedback/app.py` escucha solo en
127.0.0.1:8765. `wsgiref` es servidor de desarrollo, no de producción.
El servicio exige URL HTTPS para producción; una prueba visual local puede
renderizar `form()` sin enviar correos ni crear votos.

## Estado de entrega

Código y pruebas preparados. Hosting, dominio, secretos y entrega real requieren
configuración; no se han desplegado ni activado en esta sesión. Los comentarios
de lectores no deben contener datos de pacientes: el formulario lo recuerda.
