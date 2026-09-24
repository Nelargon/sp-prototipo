#!/usr/bin/env python3
"""Envía por correo cada nota nueva del blog. Lo corre .github/workflows/correo-blog.yml.

POR QUÉ EXISTE (24/09/2026, pedido de Arturo): la nota del blog llega entera
por correo a Arturo y a los líderes de área, el mismo día que se publica. El
armado (HTML + texto) lo hace armar.mjs; este script decide QUÉ mandar, lo
manda por SMTP desde la casilla de SP y lleva la cuenta de lo ya enviado.
Manual completo: scripts/correo-blog/README.md.

Tres reglas que no se negocian:

1. NUNCA se imprime una dirección de correo. El repo es público y los logs de
   GitHub Actions también: una lista de correos del equipo en un log es una
   lista para spam. Se imprimen cantidades y, si hace falta señalar a alguien,
   la dirección enmascarada (fe***@dominio).
2. Nada se manda dos veces. El registro (enviados.tsv, en la rama
   estado/correo-blog) se escribe por nota: si una nota salió aunque sea a una
   persona, queda anotada y no se reintenta. Un correo repetido a doce líderes
   es peor que uno que no llegó y se reenvía a mano.
3. La primera corrida no manda nada: toma como línea de base todo lo que ya
   estaba publicado. Sin eso, el primer día llegaban 70 correos a cada uno.

Subcomandos:
  pendientes --estado F [--max N]   qué notas faltan (escribe GITHUB_OUTPUT)
  base       --estado F             anota todo lo publicado sin enviar nada
  enviar     --correos DIR --estado F [--omitidos "a.md b.md"] [--prueba]

Variables de entorno (secretos del repo, nunca en el código):
  CORREO_BLOG_USUARIO        la casilla que envía (y usuario SMTP)
  CORREO_BLOG_CLAVE          su contraseña
  CORREO_BLOG_DESTINATARIOS  la lista, separada por comas, punto y coma o renglones
  CORREO_SMTP_HOSTS          servidores a probar, en orden (opcional; por defecto
                             mail.<dominio de la casilla>)
"""

import argparse
import json
import os
import re
import smtplib
import ssl
import sys
import time
from datetime import datetime, timezone
from email.message import EmailMessage
from email.utils import formataddr, formatdate, make_msgid
from pathlib import Path

PUBLICADOS = Path('contenido/blog/publicados')
LOGO = Path('public/assets/isologo-04-crop.png')
NOMBRE_REMITENTE = 'Arturo González · Blog SP'
PAUSA_ENTRE_ENVIOS = 1.0  # segundos: el servidor de SP es un hosting compartido
MAX_POR_CORRIDA = 3

EMAIL_RE = re.compile(r'^[^@\s,;]+@[^@\s,;]+\.[^@\s,;]+$')


class ConexionFallida(Exception):
    pass


def enmascarar(direccion):
    """fernanda.x@dominio → fe***@dominio. Para señalar sin publicar."""
    local, _, dominio = direccion.partition('@')
    return f'{local[:2]}***@{dominio}'


EMAIL_EN_TEXTO_RE = re.compile(r'[^@\s<>"\'(),;:]+@[^@\s<>"\'(),;:]+\.[A-Za-z]{2,}')


def limpio(texto):
    """Enmascara toda dirección que aparezca en un texto (p. ej. la respuesta de
    un servidor que cita al destinatario) antes de imprimirlo."""
    return EMAIL_EN_TEXTO_RE.sub(lambda m: enmascarar(m.group(0)), str(texto))


def publicados():
    return sorted(p.name for p in PUBLICADOS.glob('*.md'))


def leer_estado(ruta):
    """{archivo: estado}. None si el registro no existe (→ línea de base)."""
    ruta = Path(ruta)
    if not ruta.exists():
        return None
    estado = {}
    for linea in ruta.read_text(encoding='utf-8').splitlines():
        if not linea.strip() or linea.startswith('#'):
            continue
        partes = linea.split('\t')
        estado[partes[0]] = partes[1] if len(partes) > 1 else 'enviado'
    return estado


def anotar(ruta, archivo, estado):
    ruta = Path(ruta)
    nuevo = not ruta.exists()
    ruta.parent.mkdir(parents=True, exist_ok=True)
    with ruta.open('a', encoding='utf-8') as f:
        if nuevo:
            f.write('# Notas del blog ya procesadas por el correo (scripts/correo-blog/).\n'
                    '# archivo\testado\tfecha UTC — estados: base, enviado, parcial, omitido\n')
        f.write(f"{archivo}\t{estado}\t{datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%MZ')}\n")


def salida_github(**valores):
    ruta = os.environ.get('GITHUB_OUTPUT')
    if ruta:
        with open(ruta, 'a', encoding='utf-8') as f:
            for k, v in valores.items():
                f.write(f'{k}={v}\n')


def resumen_github(texto):
    ruta = os.environ.get('GITHUB_STEP_SUMMARY')
    if ruta:
        with open(ruta, 'a', encoding='utf-8') as f:
            f.write(texto + '\n')


def cmd_pendientes(args):
    estado = leer_estado(args.estado)
    if estado is None:
        print('Sin registro previo: esta corrida arma la línea de base y no envía nada.')
        salida_github(modo='base', archivos='', omitidos='')
        return 0
    faltan = [a for a in publicados() if a not in estado]
    if not faltan:
        print('No hay notas nuevas.')
        salida_github(modo='nada', archivos='', omitidos='')
        return 0
    # Más nuevas primero (el nombre empieza con la fecha). Si de golpe aparecen
    # muchas —una migración, un registro perdido— se mandan solo las últimas:
    # nadie quiere diez correos seguidos del blog.
    faltan.sort(reverse=True)
    enviar, omitir = faltan[:args.max], faltan[args.max:]
    print(f'Notas nuevas: {len(faltan)}. Se envían {len(enviar)}.')
    if omitir:
        print(f'⚠ {len(omitir)} quedan sin enviar por el tope de {args.max} por corrida: {" ".join(omitir)}')
    salida_github(modo='enviar', archivos=' '.join(enviar), omitidos=' '.join(omitir))
    return 0


def cmd_base(args):
    if leer_estado(args.estado) is not None:
        print('El registro ya existe: no se rehace la línea de base.')
        return 0
    todos = publicados()
    for archivo in todos:
        anotar(args.estado, archivo, 'base')
    print(f'Línea de base: {len(todos)} notas anotadas como ya publicadas. No se envió nada.')
    resumen_github(f'**Correo del blog — línea de base.** {len(todos)} notas anotadas; desde ahora se envía solo lo nuevo.')
    return 0


def destinatarios_de(texto):
    vistos, lista, malos = set(), [], []
    for d in re.split(r'[,;\s]+', texto or ''):
        d = d.strip()
        if not d:
            continue
        if not EMAIL_RE.match(d):
            malos.append(d)
            continue
        if d.lower() not in vistos:
            vistos.add(d.lower())
            lista.append(d)
    return lista, malos


def conectar(usuario, clave, hosts):
    """Prueba cada servidor por 465 (SSL) y 587 (STARTTLS), siempre verificando
    el certificado. Una clave rechazada corta en el acto: insistir contra otro
    puerto es sumar intentos fallidos, y el hosting bloquea por eso."""
    errores = []
    for host in hosts:
        for puerto, modo in ((465, 'ssl'), (587, 'starttls')):
            try:
                ctx = ssl.create_default_context()
                if modo == 'ssl':
                    smtp = smtplib.SMTP_SSL(host, puerto, context=ctx, timeout=30)
                else:
                    smtp = smtplib.SMTP(host, puerto, timeout=30)
                    smtp.ehlo()
                    smtp.starttls(context=ctx)
                    smtp.ehlo()
                smtp.login(usuario, clave)
                print(f'✓ Conectado a {host}:{puerto} ({modo}).')
                return smtp
            except smtplib.SMTPAuthenticationError as e:
                raise ConexionFallida(
                    f'{host}:{puerto} rechazó usuario o contraseña ({e.smtp_code}). '
                    'Revisá el secreto CORREO_BLOG_CLAVE.') from None
            except (OSError, smtplib.SMTPException) as e:
                errores.append(f'{host}:{puerto} ({modo}) → {type(e).__name__}: {limpio(e)}')
    raise ConexionFallida('No se pudo conectar a ningún servidor:\n  ' + '\n  '.join(errores))


def construir(correo, usuario, destinatario, logo):
    msg = EmailMessage()
    msg['Subject'] = correo['asunto']
    msg['From'] = formataddr((NOMBRE_REMITENTE, usuario))
    msg['To'] = destinatario
    msg['Date'] = formatdate(localtime=False)
    msg['Message-ID'] = make_msgid(domain=usuario.split('@')[1])
    # Darse de baja con un clic en Gmail/Outlook: abre un correo a Arturo.
    msg['List-Unsubscribe'] = f'<mailto:{usuario}?subject=No%20quiero%20recibir%20el%20blog>'
    # Que las respuestas automáticas (fuera de oficina) no contesten a esto.
    msg['Auto-Submitted'] = 'auto-generated'
    msg.set_content(correo['texto'])
    msg.add_alternative(correo['html'], subtype='html')
    msg.get_payload()[1].add_related(logo, 'image', 'png', cid='<logo-sp>', filename='salud-protegida.png')
    return msg


def cmd_enviar(args):
    usuario = os.environ.get('CORREO_BLOG_USUARIO', '').strip()
    clave = os.environ.get('CORREO_BLOG_CLAVE', '')
    if not usuario or not clave:
        print('✗ Faltan los secretos CORREO_BLOG_USUARIO y/o CORREO_BLOG_CLAVE.')
        return 1

    if args.prueba:
        # La prueba va solo a la casilla que envía (que le llega a Arturo por el
        # reenvío a su Gmail). No toca el registro.
        destinatarios = [usuario]
    else:
        destinatarios, malos = destinatarios_de(os.environ.get('CORREO_BLOG_DESTINATARIOS', ''))
        if malos:
            print(f'✗ CORREO_BLOG_DESTINATARIOS tiene {len(malos)} entrada(s) que no son un correo válido. '
                  'No se envía nada hasta corregirlo.')
            return 1
        if not destinatarios:
            print('✗ El secreto CORREO_BLOG_DESTINATARIOS está vacío.')
            return 1

    correos = [json.loads(p.read_text(encoding='utf-8')) for p in sorted(Path(args.correos).glob('*.json'))]
    if not correos:
        print('✗ No hay correos armados en', args.correos)
        return 1
    logo = LOGO.read_bytes()
    dominio = usuario.split('@')[1]
    hosts = os.environ.get('CORREO_SMTP_HOSTS', '').split() or [f'mail.{dominio}']

    try:
        smtp = conectar(usuario, clave, hosts)
    except ConexionFallida as e:
        print(f'✗ {limpio(e)}')
        print('No se envió nada; el registro no cambió. La próxima corrida lo reintenta.')
        return 1

    codigo = 0
    filas = []
    try:
        for correo in correos:
            enviados, rechazados = 0, []
            try:
                for dest in destinatarios:
                    msg = construir(correo, usuario, dest, logo)
                    try:
                        smtp.send_message(msg)
                        enviados += 1
                    except smtplib.SMTPRecipientsRefused:
                        rechazados.append(dest)
                    except smtplib.SMTPServerDisconnected:
                        # Un corte a mitad de camino: una reconexión, un reintento.
                        smtp = conectar(usuario, clave, hosts)
                        smtp.send_message(msg)
                        enviados += 1
                    time.sleep(PAUSA_ENTRE_ENVIOS)
            except (ConexionFallida, OSError, smtplib.SMTPException) as e:
                print(f'✗ Se cortó el envío de {correo["archivo"]} después de {enviados} de {len(destinatarios)}: '
                      f'{type(e).__name__}: {limpio(e)}')
                if not args.prueba and enviados:
                    anotar(args.estado, correo['archivo'], 'parcial')
                filas.append((correo['archivo'], enviados, len(destinatarios), 'cortado'))
                codigo = 1
                break

            if not args.prueba and (enviados or rechazados):
                anotar(args.estado, correo['archivo'], 'enviado')
            nota = ''
            if rechazados:
                nota = 'rechazados: ' + ', '.join(enmascarar(r) for r in rechazados)
                codigo = codigo or 3
            filas.append((correo['archivo'], enviados, len(destinatarios), nota))
            print(f'✓ {correo["archivo"]}: enviado a {enviados} de {len(destinatarios)}'
                  + (f' — {nota}' if nota else '') + ('  [PRUEBA]' if args.prueba else ''))
    finally:
        try:
            smtp.quit()
        except Exception:
            pass

    if not args.prueba:
        for archivo in (args.omitidos or '').split():
            anotar(args.estado, archivo, 'omitido')

    titulo = 'Correo del blog — PRUEBA (solo a la casilla que envía)' if args.prueba else 'Correo del blog'
    tabla = '\n'.join(f'| {a} | {e} de {t} | {n} |' for a, e, t, n in filas)
    resumen_github(f'**{titulo}**\n\n| Nota | Enviado | Observación |\n|---|---|---|\n{tabla}')
    return codigo


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    sub = p.add_subparsers(dest='cmd', required=True)
    a = sub.add_parser('pendientes')
    a.add_argument('--estado', required=True)
    a.add_argument('--max', type=int, default=MAX_POR_CORRIDA)
    b = sub.add_parser('base')
    b.add_argument('--estado', required=True)
    c = sub.add_parser('enviar')
    c.add_argument('--correos', required=True)
    c.add_argument('--estado', required=True)
    c.add_argument('--omitidos', default='')
    c.add_argument('--prueba', action='store_true')
    args = p.parse_args(argv)
    return {'pendientes': cmd_pendientes, 'base': cmd_base, 'enviar': cmd_enviar}[args.cmd](args)


if __name__ == '__main__':
    sys.exit(main())
