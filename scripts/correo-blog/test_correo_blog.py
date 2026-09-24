#!/usr/bin/env python3
"""Pruebas del correo del blog, sin red: el servidor SMTP es de mentira.

Corre en el CI de cada PR (ci.yml). Cada garantía del manual tiene su caso
que tiene que pasar y su caso que tiene que fallar (regla de la casa: un
detector que no se probó contra un error no se sabe si detecta).

    python3 scripts/correo-blog/test_correo_blog.py
"""

import contextlib
import importlib.util
import io
import json
import os
import shutil
import smtplib
import ssl
import subprocess
import tempfile
import unittest
from email import message_from_bytes
from email.policy import default as politica
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
os.chdir(RAIZ)
_spec = importlib.util.spec_from_file_location('correo_blog', RAIZ / 'scripts/correo-blog/correo_blog.py')
cb = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(cb)
cb.PAUSA_ENTRE_ENVIOS = 0

DESTINOS = ['fernanda.nacimiento@saludprotegida.com.py', 'amparo.sanchez@saludprotegida.com.py', 'alguien@gmail.com']
USUARIO = 'remitente@saludprotegida.com.py'


class FakeSMTP:
    """Registra lo que se manda. Configurable para simular fallas."""
    enviados = []
    conexiones = []
    rechazar = set()            # destinatarios que el servidor rechaza
    clave_mala = False
    cert_malo_en = set()        # hosts con certificado inválido
    cortar_despues_de = None    # corta la conexión tras N envíos (una vez)

    def __init__(self, host, puerto, context=None, timeout=None):
        FakeSMTP.conexiones.append((host, puerto))
        if host in FakeSMTP.cert_malo_en:
            raise ssl.SSLCertVerificationError('certificate verify failed')

    def ehlo(self): pass
    def starttls(self, context=None): pass

    def login(self, u, c):
        if FakeSMTP.clave_mala:
            raise smtplib.SMTPAuthenticationError(535, b'Incorrect authentication data')

    def send_message(self, msg):
        if FakeSMTP.cortar_despues_de is not None and len(FakeSMTP.enviados) >= FakeSMTP.cortar_despues_de:
            FakeSMTP.cortar_despues_de = None
            raise smtplib.SMTPServerDisconnected('Connection unexpectedly closed')
        if msg['To'] in FakeSMTP.rechazar:
            raise smtplib.SMTPRecipientsRefused({msg['To']: (550, b'No such user ' + msg['To'].encode())})
        FakeSMTP.enviados.append(msg)

    def quit(self): pass

    @classmethod
    def reiniciar(cls):
        cls.enviados, cls.conexiones = [], []
        cls.rechazar, cls.clave_mala, cls.cert_malo_en, cls.cortar_despues_de = set(), False, set(), None


cb.smtplib.SMTP_SSL = FakeSMTP
cb.smtplib.SMTP = FakeSMTP


def correr(*argv, env=None):
    """Corre un subcomando y devuelve (código, lo impreso)."""
    viejo = dict(os.environ)
    os.environ.update(env or {})
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            codigo = cb.main(list(argv))
    finally:
        os.environ.clear()
        os.environ.update(viejo)
    return codigo, buf.getvalue()


ENV = {
    'CORREO_BLOG_USUARIO': USUARIO,
    'CORREO_BLOG_CLAVE': 'x',
    'CORREO_BLOG_DESTINATARIOS': ', '.join(DESTINOS) + '\nFERNANDA.NACIMIENTO@saludprotegida.com.py',
    'CORREO_SMTP_HOSTS': 'mail.ejemplo.py server.ejemplo.py',
    'GITHUB_OUTPUT': '',
    'GITHUB_STEP_SUMMARY': '',
}


class Base(unittest.TestCase):
    def setUp(self):
        FakeSMTP.reiniciar()
        self.tmp = Path(tempfile.mkdtemp())
        self.pub = self.tmp / 'publicados'
        self.pub.mkdir()
        for nombre in ['2026-09-20-a.md', '2026-09-21-b.md', '2026-09-22-c.md']:
            (self.pub / nombre).write_text('---\ntitle: x\n---\nhola\n')
        self._pub_orig = cb.PUBLICADOS
        cb.PUBLICADOS = self.pub
        self.estado = self.tmp / 'estado' / 'enviados.tsv'
        self.salida = self.tmp / 'output.txt'
        self.env = dict(ENV, GITHUB_OUTPUT=str(self.salida), GITHUB_STEP_SUMMARY=str(self.tmp / 'resumen.md'))

    def tearDown(self):
        cb.PUBLICADOS = self._pub_orig
        shutil.rmtree(self.tmp)

    def outputs(self):
        return dict(l.split('=', 1) for l in self.salida.read_text().splitlines() if '=' in l)

    def correos(self, *archivos):
        d = self.tmp / 'correos'
        d.mkdir(exist_ok=True)
        for a in archivos:
            (d / a.replace('.md', '.json')).write_text(json.dumps({
                'archivo': a, 'slug': a[11:-3], 'asunto': f'Nuevo en el blog: {a}',
                'preheader': 'p', 'html': f'<p>{a}</p><img src="cid:logo-sp">', 'texto': a, 'url': 'https://x/'}))
        return str(d)


class Pendientes(Base):
    def test_sin_registro_pide_linea_de_base(self):
        codigo, _ = correr('pendientes', '--estado', str(self.estado), env=self.env)
        self.assertEqual(codigo, 0)
        self.assertEqual(self.outputs()['modo'], 'base')

    def test_linea_de_base_anota_todo_y_no_envia(self):
        correr('base', '--estado', str(self.estado), env=self.env)
        self.assertEqual(set(cb.leer_estado(self.estado)), {'2026-09-20-a.md', '2026-09-21-b.md', '2026-09-22-c.md'})
        self.assertEqual(FakeSMTP.enviados, [])
        correr('pendientes', '--estado', str(self.estado), env=self.env)
        self.assertEqual(self.outputs()['modo'], 'nada')

    def test_linea_de_base_no_pisa_un_registro_existente(self):
        cb.anotar(self.estado, '2026-09-20-a.md', 'enviado')
        correr('base', '--estado', str(self.estado), env=self.env)
        self.assertEqual(cb.leer_estado(self.estado), {'2026-09-20-a.md': 'enviado'})

    def test_detecta_lo_nuevo_mas_nuevo_primero(self):
        cb.anotar(self.estado, '2026-09-20-a.md', 'base')
        correr('pendientes', '--estado', str(self.estado), env=self.env)
        o = self.outputs()
        self.assertEqual(o['modo'], 'enviar')
        self.assertEqual(o['archivos'], '2026-09-22-c.md 2026-09-21-b.md')
        self.assertEqual(o['omitidos'], '')

    def test_tope_por_corrida(self):
        cb.anotar(self.estado, 'otra.md', 'base')
        correr('pendientes', '--estado', str(self.estado), '--max', '1', env=self.env)
        o = self.outputs()
        self.assertEqual(o['archivos'], '2026-09-22-c.md')
        self.assertEqual(o['omitidos'], '2026-09-21-b.md 2026-09-20-a.md')


class Enviar(Base):
    def test_uno_por_persona_sin_duplicados_y_con_logo(self):
        d = self.correos('2026-09-22-c.md')
        codigo, impreso = correr('enviar', '--correos', d, '--estado', str(self.estado), env=self.env)
        self.assertEqual(codigo, 0)
        # 3 personas: la cuarta entrada es Fernanda en mayúsculas → no se duplica.
        self.assertEqual([m['To'] for m in FakeSMTP.enviados], DESTINOS)
        m = message_from_bytes(FakeSMTP.enviados[0].as_bytes(), policy=politica)
        self.assertIn('Arturo', m['From'])
        self.assertIn(USUARIO, m['From'])
        self.assertTrue(m['List-Unsubscribe'].startswith('<mailto:'))
        self.assertEqual(m.get_content_type(), 'multipart/alternative')
        tipos = [p.get_content_type() for p in m.walk()]
        self.assertIn('text/plain', tipos)
        self.assertIn('multipart/related', tipos)
        self.assertIn('image/png', tipos)
        logo = next(p for p in m.walk() if p.get_content_type() == 'image/png')
        self.assertEqual(logo['Content-ID'], '<logo-sp>')
        self.assertEqual(cb.leer_estado(self.estado), {'2026-09-22-c.md': 'enviado'})

    def test_baja_en_texto_plano(self):
        # Se mira el correo CRUDO, como lo lee Gmail. La prueba de arriba lee el
        # encabezado ya decodificado y por eso dio verde aunque salía como
        # =?utf-8?q?…, que Gmail no reconoce (primera prueba real, 24/09/2026).
        # La segunda casilla tiene el largo exacto de la real (37 caracteres).
        casillas = (USUARIO, 'nombre.apellido@saludprotegida.com.py',
                    'una.casilla.muy.larga.de.verdad.para.probar@saludprotegida.com.py')
        for usuario in casillas:
            msg = cb.construir({'asunto': 'x', 'texto': 't', 'html': '<p>h</p>'}, usuario, 'a@b.com', b'png')
            crudo = msg.as_bytes().decode('ascii')
            linea = crudo.split('List-Unsubscribe:')[1].split('\n', 2)
            valor = (linea[0] + linea[1]).strip() if not linea[0].strip() else linea[0].strip()
            self.assertNotIn('=?', valor, usuario)
            self.assertTrue(valor.startswith(f'<mailto:{usuario}'), valor)
            if usuario != casillas[-1]:
                # Las de largo normal, en un solo renglón y con el asunto de baja.
                self.assertTrue(linea[0].strip().endswith('?subject=Baja>'), linea[0])

    def test_nunca_imprime_una_direccion(self):
        FakeSMTP.rechazar = {DESTINOS[1]}
        d = self.correos('2026-09-22-c.md')
        codigo, impreso = correr('enviar', '--correos', d, '--estado', str(self.estado), env=self.env)
        resumen = (self.tmp / 'resumen.md').read_text()
        for dest in DESTINOS:
            self.assertNotIn(dest, impreso)
            self.assertNotIn(dest, resumen)
        self.assertIn('am***@saludprotegida.com.py', impreso)  # señalado, pero enmascarado
        self.assertEqual(codigo, 3)                             # rechazo = corrida en rojo
        self.assertEqual(cb.leer_estado(self.estado), {'2026-09-22-c.md': 'enviado'})  # y no se reintenta

    def test_prueba_va_solo_al_remitente_y_no_toca_el_registro(self):
        d = self.correos('2026-09-22-c.md')
        codigo, _ = correr('enviar', '--correos', d, '--estado', str(self.estado), '--prueba', env=self.env)
        self.assertEqual(codigo, 0)
        self.assertEqual([m['To'] for m in FakeSMTP.enviados], [USUARIO])
        self.assertFalse(self.estado.exists())

    def test_clave_mala_corta_sin_insistir(self):
        FakeSMTP.clave_mala = True
        d = self.correos('2026-09-22-c.md')
        codigo, impreso = correr('enviar', '--correos', d, '--estado', str(self.estado), env=self.env)
        self.assertEqual(codigo, 1)
        self.assertEqual(len(FakeSMTP.conexiones), 1)   # un solo intento: el hosting bloquea por reintentos
        self.assertIn('CORREO_BLOG_CLAVE', impreso)
        self.assertFalse(self.estado.exists())

    def test_certificado_malo_prueba_el_siguiente_servidor(self):
        FakeSMTP.cert_malo_en = {'mail.ejemplo.py'}
        d = self.correos('2026-09-22-c.md')
        codigo, impreso = correr('enviar', '--correos', d, '--estado', str(self.estado), env=self.env)
        self.assertEqual(codigo, 0)
        self.assertEqual(FakeSMTP.conexiones[-1][0], 'server.ejemplo.py')
        self.assertEqual(len(FakeSMTP.enviados), 3)

    def test_sin_ningun_servidor_no_anota_nada(self):
        FakeSMTP.cert_malo_en = {'mail.ejemplo.py', 'server.ejemplo.py'}
        d = self.correos('2026-09-22-c.md')
        codigo, _ = correr('enviar', '--correos', d, '--estado', str(self.estado), env=self.env)
        self.assertEqual(codigo, 1)
        self.assertFalse(self.estado.exists())   # la próxima corrida lo reintenta

    def test_corte_a_mitad_reconecta_una_vez(self):
        FakeSMTP.cortar_despues_de = 1
        d = self.correos('2026-09-22-c.md')
        codigo, _ = correr('enviar', '--correos', d, '--estado', str(self.estado), env=self.env)
        self.assertEqual(codigo, 0)
        self.assertEqual([m['To'] for m in FakeSMTP.enviados], DESTINOS)

    def test_lista_con_una_entrada_invalida_no_envia_nada(self):
        env = dict(self.env, CORREO_BLOG_DESTINATARIOS='ok@saludprotegida.com.py, esto-no-es-un-correo')
        d = self.correos('2026-09-22-c.md')
        codigo, _ = correr('enviar', '--correos', d, '--estado', str(self.estado), env=env)
        self.assertEqual(codigo, 1)
        self.assertEqual(FakeSMTP.enviados, [])

    def test_sin_secretos_no_envia(self):
        env = dict(self.env, CORREO_BLOG_CLAVE='')
        d = self.correos('2026-09-22-c.md')
        codigo, _ = correr('enviar', '--correos', d, '--estado', str(self.estado), env=env)
        self.assertEqual(codigo, 1)
        self.assertEqual(FakeSMTP.conexiones, [])

    def test_omitidos_quedan_anotados(self):
        d = self.correos('2026-09-22-c.md')
        correr('enviar', '--correos', d, '--estado', str(self.estado), '--omitidos', '2026-09-20-a.md', env=self.env)
        self.assertEqual(cb.leer_estado(self.estado), {'2026-09-22-c.md': 'enviado', '2026-09-20-a.md': 'omitido'})


@unittest.skipUnless((RAIZ / 'node_modules/marked').exists(), 'sin node_modules (correr npm ci)')
class Armado(unittest.TestCase):
    """El HTML real, armado con armar.mjs sobre notas publicadas de verdad."""

    @classmethod
    def setUpClass(cls):
        cls.tmp = Path(tempfile.mkdtemp())
        cls.notas = sorted(p.name for p in (RAIZ / 'contenido/blog/publicados').glob('*.md'))
        subprocess.run(['node', 'scripts/correo-blog/armar.mjs', '--salida', str(cls.tmp), *cls.notas],
                       check=True, capture_output=True)
        cls.correos = [json.loads(p.read_text()) for p in sorted(cls.tmp.glob('*.json'))]

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.tmp)

    def test_arma_todas_las_notas(self):
        self.assertEqual(len(self.correos), len(self.notas))

    def test_links_internos_con_dominio(self):
        for c in self.correos:
            self.assertNotIn('href="/', c['html'], c['archivo'])

    def test_estilos_en_linea(self):
        for c in self.correos:
            # Ninguna etiqueta de texto pelada y ningún link sin estilo propio.
            self.assertNotRegex(c['html'], r'<(p|h2|h3|li|ul|ol|strong|blockquote)>|<a (?![^>]*style=)', c['archivo'])

    def test_logo_por_cid(self):
        for c in self.correos:
            self.assertIn('src="cid:logo-sp"', c['html'])

    def test_no_repite_el_copete(self):
        # Mismo criterio que la web (lib/blog-texto.mjs): la bajada no vuelve a
        # aparecer como primer párrafo del cuerpo.
        import re
        for c in self.correos:
            parrafos = re.findall(r'<p style="margin:0 0 16px[^>]*>(.*?)</p>', c['html'], re.S)
            intro = re.search(r'font-size:18px[^>]*>(.*?)</p>', c['html'], re.S)
            if parrafos and intro:
                self.assertNotEqual(parrafos[0][:60], intro.group(1)[:60], c['archivo'])


if __name__ == '__main__':
    unittest.main(verbosity=2)
