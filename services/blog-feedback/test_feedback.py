import importlib.util
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
from urllib.parse import urlencode

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import app
from feedback import issue_token, verify_token, personalize, config, LABELS

SECRET, EXPORT = 'firma-' + 'a' * 40, 'export-' + 'b' * 40
NOW = 1800000000
URL = 'https://opiniones.example/blog'


class FeedbackTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.db = Path(self.temp.name) / 'private' / 'feedback.sqlite3'
        self.server = app.create_app(self.db, URL, SECRET, EXPORT, clock=lambda: NOW)
        self.token = self.token_for()

    def token_for(self, recipient='persona@example.org', **kwargs):
        return issue_token(SECRET, 'nota-ejemplo', 'a' * 64, recipient,
                           'Una nota útil', now=NOW, **kwargs)

    def call(self, method='GET', path='/', params=None, auth='', origin=None, raw=None):
        encoded = urlencode(params or {}, doseq=True)
        body = raw if raw is not None else encoded.encode()
        env = {'REQUEST_METHOD': method, 'PATH_INFO': path, 'QUERY_STRING': encoded if method == 'GET' else '',
               'CONTENT_TYPE': 'application/x-www-form-urlencoded', 'CONTENT_LENGTH': str(len(body)),
               'wsgi.input': io.BytesIO(body), 'HTTP_AUTHORIZATION': auth}
        if origin is not None:
            env['HTTP_ORIGIN'] = origin
        status = {}
        result = b''.join(self.server(env, lambda s, h: status.update(code=s, headers=dict(h))))
        return status['code'], result.decode(), status['headers']

    def vote(self, tags=('util', 'claro'), **kwargs):
        params = {'token': self.token, 'tags': tags, **kwargs}
        return self.call('POST', params=params)

    def export(self):
        return json.loads(self.call(path='/export', auth='Bearer ' + EXPORT)[1])

    def test_scanner_get_does_not_create_database_or_vote(self):
        for _ in range(3):
            code, body, headers = self.call(params={'token': self.token, 'tag': 'util'})
            self.assertEqual(code, '200 OK')
            self.assertIn('value="util" checked', body)
            self.assertEqual(headers['Referrer-Policy'], 'no-referrer')
        self.assertFalse(self.db.exists())

    def test_multiple_tags_and_duplicate_submission_updates_one_response(self):
        self.assertEqual(self.vote()[0], '200 OK')
        self.vote(('conocido', 'util'))
        item = self.export()['articles'][0]
        self.assertEqual(item['responses'], 1)
        self.assertEqual(item['tags']['claro'], 0)
        self.assertEqual(item['tags']['conocido'], 1)
        self.assertEqual(item['tags']['util'], 1)
        self.assertEqual(self.db.stat().st_mode & 0o777, 0o600)

    def test_different_recipients_and_versions_are_separate(self):
        self.vote()
        self.call('POST', params={'token': self.token_for('otro@example.org'), 'tags': ['util']})
        next_version = issue_token(SECRET, 'nota-ejemplo', 'b' * 64, 'persona@example.org', 'Otra versión', now=NOW)
        self.call('POST', params={'token': next_version, 'tags': ['confuso']})
        items = self.export()['articles']
        self.assertEqual([x['responses'] for x in items], [2, 1])

    def test_conflicting_unknown_empty_tags_and_oversized_comment_rejected(self):
        for tags in [[], ['inventada'], ['claro', 'confuso']]:
            self.assertTrue(self.vote(tags)[0].startswith('422'))
        self.assertTrue(self.vote(comment='a' * 1001)[0].startswith('422'))
        self.assertFalse(self.db.exists())

    def test_tampered_expired_and_future_tokens_rejected(self):
        for token in [self.token + 'x', 'bad', issue_token(SECRET, 'nota-ejemplo', 'a' * 64, 'x@y.z', 'Título', now=NOW-91*86400),
                      issue_token(SECRET, 'nota-ejemplo', 'a' * 64, 'x@y.z', 'Título', now=NOW+1000)]:
            self.assertTrue(self.call(params={'token': token})[0].startswith('400'))
        self.assertFalse(self.db.exists())

    def test_foreign_origin_and_oversized_request_rejected(self):
        self.assertTrue(self.call('POST', params={'token': self.token, 'tags': ['util']}, origin='https://evil.example')[0].startswith('403'))
        self.assertTrue(self.call('POST', raw=b'x' * 16001)[0].startswith('400'))

    def test_test_links_never_save_real_feedback(self):
        self.assertEqual(self.call('POST', params={'token': self.token_for(test=True), 'tags': ['util']})[0], '200 OK')
        self.assertFalse(self.db.exists())

    def test_comments_private_and_escaped_not_in_aggregates(self):
        comment = '<script>alert(1)</script> dato privado'
        code, body, _ = self.vote(['claro', 'confuso'], comment=comment)
        self.assertIn('&lt;script&gt;', body)
        self.assertNotIn('<script>', body)
        self.vote(comment=comment)
        for path in ('/export', '/comments'):
            self.assertTrue(self.call(path=path)[0].startswith('401'))
        exported = self.call(path='/export', auth='Bearer ' + EXPORT)[1]
        for private in (comment, 'reader', 'persona@example.org', self.token):
            self.assertNotIn(private, exported)
        private = json.loads(self.call(path='/comments', auth='Bearer ' + EXPORT)[1])
        self.assertEqual(private['comments'][0]['comment'], comment)

    def test_email_personalization_and_disabled_configuration(self):
        mail = {'slug': 'nota-ejemplo', 'feedback_version': 'a' * 64, 'feedback_title': 'Título',
                'html': '<table><!-- BLOG_FEEDBACK --></table>', 'texto': '[BLOG_FEEDBACK]'}
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(personalize(mail, 'persona@example.org')['html'], '<table></table>')
        with patch.dict(os.environ, {'BLOG_FEEDBACK_URL': URL, 'BLOG_FEEDBACK_SECRET': SECRET}, clear=True):
            output = personalize(mail, 'persona@example.org')
            self.assertEqual(output['html'].count('href='), 5)
            self.assertNotIn('persona@example.org', output['html'])
            self.assertNotEqual(output['html'], personalize(mail, 'otro@example.org')['html'])
            for label in LABELS.values():
                self.assertIn(label, output['texto'])

    def test_partial_or_insecure_config_fails_before_sending(self):
        for settings in [{'BLOG_FEEDBACK_URL': URL}, {'BLOG_FEEDBACK_SECRET': SECRET},
                         {'BLOG_FEEDBACK_URL': 'http://example.org', 'BLOG_FEEDBACK_SECRET': SECRET}]:
            with patch.dict(os.environ, settings, clear=True):
                self.assertRaises(ValueError, config)


if __name__ == '__main__':
    unittest.main()
