"""Receptor WSGI de opiniones. Python 3.11+, SQLite; sin dependencias externas.

GET solo muestra el formulario. POST confirma una respuesta por envío.
La base y los secretos deben vivir fuera del directorio público del hosting.
"""
from contextlib import contextmanager
import hmac
import html
import json
import os
from pathlib import Path
import sqlite3
import sys
import time
from urllib.parse import parse_qs, urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts' / 'correo-blog'))
from feedback import LABELS, config, verify_token

SCHEMA = '''CREATE TABLE IF NOT EXISTS responses (
 slug TEXT NOT NULL, version TEXT NOT NULL, reader TEXT NOT NULL,
 title TEXT NOT NULL, tags TEXT NOT NULL, comment TEXT NOT NULL,
 updated_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
 PRIMARY KEY (slug, version, reader)
);'''


@contextmanager
def database(path):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    conn = sqlite3.connect(path, timeout=10)
    os.chmod(path, 0o600)
    conn.execute(SCHEMA)
    try:
        with conn:
            yield conn
    finally:
        conn.close()


def response(start, status, content, *, kind='text/html; charset=utf-8'):
    raw = content.encode('utf-8')
    start(status, [('Content-Type', kind), ('Content-Length', str(len(raw))),
                  ('Cache-Control', 'no-store'), ('Referrer-Policy', 'no-referrer'),
                  ('X-Content-Type-Options', 'nosniff'), ('X-Robots-Tag', 'noindex, nofollow'),
                  ('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'")])
    return [raw]


def page(body):
    return '''<!doctype html><html lang="es"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tu opinión · Salud Protegida</title>
<style>body{margin:0;background:#F1F8F6;color:#173A50;font:17px/1.55 Arial,sans-serif}
main{max-width:540px;margin:36px auto;padding:28px;background:white;border-radius:18px}
h1{font-size:29px;line-height:1.2}label.option{display:flex;align-items:center;gap:12px;padding:14px;margin:10px 0;background:#F3F8F7;border:1px solid #C6DDD7;border-radius:10px;cursor:pointer}
input[type=checkbox]{width:22px;height:22px;accent-color:#006B66;flex-shrink:0}
textarea{box-sizing:border-box;width:100%;min-height:100px;font:inherit;padding:12px;border:1px solid #829B96;border-radius:8px}
button{border:0;border-radius:9px;background:#006B66;color:white;font:700 17px Arial;padding:15px 23px;cursor:pointer;margin-top:16px}
input:focus-visible,textarea:focus-visible,button:focus-visible{outline:3px solid #003B71;outline-offset:3px}
.small{font-size:13px;color:#50645F}.error{padding:12px;background:#FFF0DB;border-radius:8px}
@media(max-width:600px){main{margin:12px;padding:22px}}</style>
<main><p class="small">SALUD PROTEGIDA · BLOG</p>''' + body + '</main></html>'


def form(payload, token, selected, comment='', error=''):
    esc = html.escape
    body = f'<h1>¿Qué te dejó esta nota?</h1><p>{esc(payload["title"])}</p>'
    body += '<p>Podés elegir varias opciones.</p>'
    if payload['test']:
        body += '<p class="error">Prueba del formulario: esta respuesta no se guardará.</p>'
    if error:
        body += f'<p class="error" role="alert">{esc(error)}</p>'
    # Relative action drops the query (token cannot escape in Referer). No JS
    # or third-party assets: works on mobile, including with scripts disabled.
    body += '<form method="post" action="./">'
    body += f'<input type="hidden" name="token" value="{esc(token, quote=True)}">'
    for key, label in LABELS.items():
        checked = ' checked' if key in selected else ''
        body += f'<label class="option"><input type="checkbox" name="tags" value="{key}"{checked}>{label}</label>'
    body += '<p class="small">Elegí solo una entre «Se entendió bien» y «Me costó entender».</p>'
    body += '<label for="comment">¿Qué cambiarías o qué te faltó? <span class="small">(opcional)</span></label>'
    body += f'<textarea id="comment" name="comment" maxlength="1000">{esc(comment)}</textarea>'
    body += '<p class="small">Evitá datos personales o de pacientes.</p>'
    body += '<button type="submit">Enviar opinión</button></form>'
    body += '<details class="small" style="margin-top:20px"><summary>Sobre tus respuestas</summary><p>El equipo editorial usa tu opinión para mejorar las notas. El enlace es personal: no lo reenvíes. Conservamos la respuesta hasta 180 días después del vencimiento del enlace.</p></details>'
    return page(body)


def export_data(conn, now):
    # El motor recibe SOLO agregados. Los comentarios no se copian al repo.
    rows = conn.execute('SELECT slug, version, title, tags, updated_at FROM responses').fetchall()
    groups = {}
    for slug, version, title, tags, updated in rows:
        group = groups.setdefault((slug, version), {'slug': slug, 'version': version,
                    'title': title, 'responses': 0, 'tags': dict.fromkeys(LABELS, 0), 'last_response_at': 0})
        group['responses'] += 1
        group['last_response_at'] = max(group['last_response_at'], updated)
        for tag in json.loads(tags):
            group['tags'][tag] += 1
    return {'schema': 1, 'audience': 'equipo-interno', 'generated_at': now,
            'articles': sorted(groups.values(), key=lambda r: (r['slug'], r['version']))}


def create_app(db_path, public_url, secret, export_secret, *, clock=time.time):
    if len(secret) < 32 or len(export_secret) < 32 or secret == export_secret:
        raise ValueError('Se requieren dos secretos diferentes, de al menos 32 caracteres.')
    parts = urlsplit(public_url)
    if parts.scheme != 'https' or not parts.netloc or parts.query or parts.fragment or parts.username or parts.password:
        raise ValueError('La URL pública debe usar HTTPS y no contener credenciales ni parámetros.')
    origin = parts.scheme + '://' + parts.netloc

    def app(env, start):
        method = env.get('REQUEST_METHOD', 'GET')
        path = env.get('PATH_INFO', '/')
        now = int(clock())
        if path in ('/export', '/comments'):
            if method != 'GET':
                return response(start, '405 Method Not Allowed', page('<h1>Método no permitido</h1>'))
            if not hmac.compare_digest(env.get('HTTP_AUTHORIZATION', ''), 'Bearer ' + export_secret):
                return response(start, '401 Unauthorized', '{}', kind='application/json')
            with database(db_path) as conn:
                conn.execute('DELETE FROM responses WHERE expires_at < ?', (now - 180 * 86400,))
                if path == '/export':
                    data = export_data(conn, now)
                else:
                    data = {'comments': [{'slug': s, 'version': v, 'comment': c, 'updated_at': t}
                        for s, v, c, t in conn.execute('SELECT slug, version, comment, updated_at FROM responses WHERE comment != ? ORDER BY updated_at DESC', ('',))]}
            return response(start, '200 OK', json.dumps(data, ensure_ascii=False), kind='application/json; charset=utf-8')
        if path not in ('', '/'):
            return response(start, '404 Not Found', page('<h1>Página no encontrada</h1>'))
        if method not in ('GET', 'POST'):
            return response(start, '405 Method Not Allowed', page('<h1>Método no permitido</h1>'))
        if method == 'POST':
            # Bearer token is also required; foreign origins cannot post a
            # known invitation through another website. Missing Origin is
            # allowed for older email webviews; token is still unguessable.
            if env.get('HTTP_ORIGIN') and env['HTTP_ORIGIN'] != origin:
                return response(start, '403 Forbidden', page('<h1>Volvé a abrir el enlace del correo.</h1>'))
            try:
                length = int(env.get('CONTENT_LENGTH', '0'))
                if not 0 < length <= 16000 or env.get('CONTENT_TYPE', '').split(';')[0] != 'application/x-www-form-urlencoded':
                    raise ValueError()
                params = parse_qs(env['wsgi.input'].read(length).decode('utf-8'), max_num_fields=12)
            except (ValueError, UnicodeError):
                return response(start, '400 Bad Request', page('<h1>No pudimos leer la respuesta.</h1>'))
        else:
            try:
                query = env.get('QUERY_STRING', '')
                if len(query) > 8000:
                    raise ValueError()
                params = parse_qs(query, max_num_fields=8)
            except ValueError:
                return response(start, '400 Bad Request', page('<h1>Enlace no válido</h1>'))
        token = params.get('token', [''])[0]
        try:
            payload = verify_token(secret, token, now=now)
        except ValueError:
            return response(start, '400 Bad Request', page('<h1>Este enlace no es válido o venció.</h1><p>Podés responder al correo del blog para hacernos llegar tu opinión.</p>'))
        if method == 'GET':
            selected = [tag for tag in params.get('tag', []) if tag in LABELS]
            return response(start, '200 OK', form(payload, token, selected))
        tags = list(dict.fromkeys(params.get('tags', [])))
        comment = params.get('comment', [''])[0].strip()
        error = ''
        if not tags or any(tag not in LABELS for tag in tags):
            error = 'Elegí al menos una de las opciones.'
        elif 'claro' in tags and 'confuso' in tags:
            error = 'Elegí solo una: «Se entendió bien» o «Me costó entender». Podés explicar el matiz en el comentario.'
        elif len(comment) > 1000:
            error = 'El comentario puede tener hasta 1000 caracteres.'
        if error:
            return response(start, '422 Unprocessable Entity', form(payload, token, tags, comment, error))
        if payload['test']:
            return response(start, '200 OK', page('<h1>La prueba funcionó.</h1><p>Esta respuesta no se guardó ni se contará entre las opiniones del equipo.</p>'))
        try:
            with database(db_path) as conn:
                conn.execute('DELETE FROM responses WHERE expires_at < ?', (now - 180 * 86400,))
                conn.execute('''INSERT INTO responses VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(slug, version, reader) DO UPDATE SET
                    tags=excluded.tags, comment=excluded.comment, updated_at=excluded.updated_at,
                    expires_at=excluded.expires_at''',
                    (payload['slug'], payload['version'], payload['reader'], payload['title'],
                     json.dumps(tags), comment, now, payload['exp']))
        except sqlite3.Error:
            return response(start, '503 Service Unavailable', form(payload, token, tags, comment, 'No pudimos guardar tu opinión. Probá de nuevo en un momento.'))
        return response(start, '200 OK', page('<h1>Gracias por contarnos.</h1><p>Tu opinión quedó guardada y ayudará a mejorar las próximas notas.</p><p class="small">Si volvés a responder desde el mismo enlace, actualizamos tu opinión; no contamos dos votos.</p>'))
    return app


def application(env, start):
    try:
        settings = config()
        db = os.environ.get('BLOG_FEEDBACK_DB', '')
        export_secret = os.environ.get('BLOG_FEEDBACK_EXPORT_SECRET', '')
        if not settings or not Path(db).is_absolute():
            raise ValueError('Configuración incompleta')
        url, secret = settings
        return create_app(db, url, secret, export_secret)(env, start)
    except (ValueError, OSError, sqlite3.Error):
        return response(start, '503 Service Unavailable', page('<h1>El formulario todavía no está disponible.</h1>'))


if __name__ == '__main__':
    from wsgiref.simple_server import make_server, WSGIRequestHandler

    class PrivateHandler(WSGIRequestHandler):
        def log_message(self, *args):
            pass  # nunca registrar tokens, IPs, query strings ni comentarios

    with make_server('127.0.0.1', int(os.environ.get('PORT', '8765')), application,
                     handler_class=PrivateHandler) as server:
        print('Vista local en http://127.0.0.1:' + str(server.server_port))
        server.serve_forever()
