"""Protocolo compartido por el correo y el receptor. Sin correos en los enlaces."""
import base64
import hashlib
import hmac
import html
import json
import os
import re
import time
from urllib.parse import urlencode, urlsplit

LABELS = {
    'util': 'Me sirvió',
    'conocido': 'Ya lo sabía',
    'claro': 'Se entendió bien',
    'confuso': 'Me costó entender',
    'concreto': 'Me faltó algo concreto',
}
HTML_MARKER = '<!-- BLOG_FEEDBACK -->'
TEXT_MARKER = '[BLOG_FEEDBACK]'
TTL = 90 * 86400


def config():
    url = os.environ.get('BLOG_FEEDBACK_URL', '').rstrip('/')
    secret = os.environ.get('BLOG_FEEDBACK_SECRET', '')
    if not url and not secret:
        return None
    parts = urlsplit(url)
    if (parts.scheme != 'https' or not parts.netloc or parts.username or
            parts.password or parts.query or parts.fragment or len(secret) < 32):
        raise ValueError('Configurá BLOG_FEEDBACK_URL (HTTPS, sin query) y BLOG_FEEDBACK_SECRET (mínimo 32 caracteres).')
    return url, secret


def b64(value):
    return base64.urlsafe_b64encode(value).decode().rstrip('=')


def issue_token(secret, slug, version, recipient, title, *, now=None, test=False):
    now = int(time.time() if now is None else now)
    # Identificador distinto por artículo y versión: no permite reconstruir
    # direcciones ni seguir al lector a través de todas sus lecturas.
    identity = hmac.new(secret.encode(),
                        f'lector\0{slug}\0{version}\0{recipient.strip().lower()}'.encode(),
                        hashlib.sha256).hexdigest()
    payload = {'v': 1, 'slug': slug, 'version': version, 'reader': identity,
               'title': title, 'iat': now, 'exp': now + TTL, 'test': bool(test)}
    encoded = b64(json.dumps(payload, ensure_ascii=False, separators=(',', ':')).encode())
    signature = b64(hmac.new(secret.encode(), ('blog-feedback\0' + encoded).encode(), hashlib.sha256).digest())
    return encoded + '.' + signature


def verify_token(secret, token, *, now=None):
    try:
        if not isinstance(token, str) or len(token) > 4000:
            raise ValueError()
        encoded, signature = token.split('.')
        expected = b64(hmac.new(secret.encode(), ('blog-feedback\0' + encoded).encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(expected, signature):
            raise ValueError()
        p = json.loads(base64.b64decode(encoded + '=' * (-len(encoded) % 4), altchars=b'-_', validate=True))
        current = int(time.time() if now is None else now)
        if (p['v'] != 1 or type(p['iat']) is not int or type(p['exp']) is not int or
                not p['iat'] - 300 <= current < p['exp'] or p['exp'] - p['iat'] != TTL or
                not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', p['slug']) or
                not re.fullmatch(r'[a-f0-9]{64}', p['version']) or
                not re.fullmatch(r'[a-f0-9]{64}', p['reader']) or
                not isinstance(p['title'], str) or not 1 <= len(p['title']) <= 300 or
                type(p['test']) is not bool):
            raise ValueError()
        return p
    except (ValueError, TypeError, KeyError, UnicodeError):
        raise ValueError('El enlace no es válido o venció.') from None


def personalize(correo, recipient, *, test=False):
    result = dict(correo)
    settings = config()
    block, plain = '', ''
    if settings:
        url, secret = settings
        token = issue_token(secret, correo['slug'], correo['feedback_version'],
                            recipient, correo['feedback_title'], test=test)
        links = [(label, url + '/?' + urlencode({'token': token, 'tag': key})) for key, label in LABELS.items()]
        block = '<tr><td class="pad" style="padding:22px 40px;font-family:Arial,sans-serif;color:#003B71">'
        block += '<p style="font-size:18px;font-weight:bold;margin:0 0 8px">¿Qué te dejó esta nota?</p>'
        block += '<p style="font-size:14px;margin:0 0 14px">Podés marcar más de una. Tocá una opción para empezar.</p>'
        block += '<table role="presentation" cellpadding="0" cellspacing="0">'
        for label, link in links:
            block += f'<tr><td style="padding:0 0 8px"><a href="{html.escape(link, quote=True)}" style="display:inline-block;padding:12px 16px;background:#E3F5F2;border:1px solid #9BCBC3;border-radius:8px;color:#006B66;font-size:15px;text-decoration:none">{label}</a></td></tr>'
        block += '</table><p style="font-size:12px;color:#666">Tu opinión ayuda a mejorar las próximas notas.</p></td></tr>'
        plain = '¿Qué te dejó esta nota? Podés marcar más de una.\n' + '\n'.join(f'{label}: {link}' for label, link in links)
    result['html'] = result['html'].replace(HTML_MARKER, block)
    result['texto'] = result['texto'].replace(TEXT_MARKER, plain)
    return result
