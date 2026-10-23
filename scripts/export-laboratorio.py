"""Package the image lab as one HTML file, including images, fonts and logo."""
from pathlib import Path
import argparse
import base64
import json
import mimetypes
import re

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
lab = Path(__file__).resolve().parents[1] / 'public/blog/laboratorio'


def data_url(path):
    mime = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
    return f'data:{mime};base64,' + base64.b64encode(path.read_bytes()).decode()


def replace_once(text, old, new):
    if text.count(old) != 1:
        raise ValueError('La interfaz cambió; revisar la adaptación offline: ' + old[:80])
    return text.replace(old, new, 1)


html = (lab / 'index.html').read_text(encoding='utf-8')
css = (lab / 'laboratorio.css').read_text(encoding='utf-8')
js = (lab / 'laboratorio.js').read_text(encoding='utf-8')
css = re.sub(r"url\('([^']+)'\)", lambda m: "url('" + data_url((lab / m[1]).resolve()) + "')", css)
html = replace_once(html, '<link rel="stylesheet" href="laboratorio.css">', '<style>' + css + '</style>')
html = replace_once(html, '<script src="laboratorio.js" defer></script>', '')
for relative in ['../../assets/favicon.png', '../../assets/brand/logo-sp-color.png']:
    html = replace_once(html, relative, data_url((lab / relative).resolve()))
html = replace_once(html, 'href="../../"', 'href="https://nelargon.github.io/sp-prototipo/"')

catalog = json.loads((lab / 'catalogo.json').read_text(encoding='utf-8'))
assets = {p.relative_to(lab).as_posix(): data_url(p) for p in sorted((lab / 'assets').glob('*.webp'))}
prefix = 'const embeddedCatalog=' + json.dumps(catalog, ensure_ascii=False).replace('<', '\\u003c') + ';\n'
prefix += 'const embeddedAssets=' + json.dumps(assets) + ';\n'
js = replace_once(js, "  const response=await fetch('catalogo.json');\n  if(!response.ok)throw Error('No pudimos cargar las propuestas.');\n  catalog=await response.json();", """  catalog=embeddedCatalog;
  for(const a of catalog.articles)for(const v of a.variants){
    v.src=embeddedAssets[v.src];v.thumbnail=embeddedAssets[v.thumbnail];
    v.versions=v.versions.map(r=>({...r,filename:r.src.split('/').pop(),src:embeddedAssets[r.src]}));
  }""")
js = replace_once(js, "$('#download-image').download=v.src.split('/').pop();", "$('#download-image').download=v.filename;")
js = replace_once(js, "$('#article-link').href='../'+article.slug+'/';", "$('#article-link').href='https://nelargon.github.io/sp-prototipo/blog/'+article.slug+'/';")
html = replace_once(html, '</body>', '<script>\n' + prefix + js + '\n</script></body>')
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(html, encoding='utf-8')
print(f'{args.output}: {args.output.stat().st_size:,} bytes; {len(assets)} recursos incluidos.')
