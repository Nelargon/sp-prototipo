"""Rebuild the lab catalog from the blog's actual frontmatter and image inventory."""
from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[1]
LAB = ROOT / 'public/blog/laboratorio'
BRIEFS = ROOT / 'docs/diseno/fuentes/2026-10-23-laboratorio-imagenes/conceptos.json'
styles = {
    'collage': {'name':'Collage editorial','description':'Recortes, capas y fragmentos de distintos materiales.'},
    'gouache': {'name':'Gouache pintado a mano','description':'Pinceladas opacas y formas orgánicas.'},
    'serigrafia': {'name':'Serigrafía de dos tintas','description':'Siluetas, trama y contraste con pocos colores.'},
    'foto-objetos': {'name':'Fotografía conceptual','description':'Objetos escenificados en una imagen generada.'},
    'trazo': {'name':'Trazo explicativo','description':'Contorno y rayado para describir la acción.'},
    'papel': {'name':'Siluetas y papel','description':'Formas superpuestas, textura y gestos mínimos.'},
    'facetada': {'name':'Ilustración facetada','description':'Volumen construido con planos de color.'},
    'editorial': {'name':'A · Ilustración editorial','description':'Textura y una escena cotidiana con aire.'},
    'narrativa': {'name':'B · Ilustración narrativa','description':'Personajes y entorno cuentan la situación.'},
    'foto': {'name':'D · Apariencia fotográfica','description':'Exploración de apariencia fotográfica.'},
}
previous = [
    {'key':'libreta','file':'2026-10-15-la-libreta-de-salud-del-nino-es-el-cuaderno-de-obra-de-su-cuidado.md','short':'La libreta de salud','concept':'Una libreta preparada junto al bolso que acompaña al niño.','limit':'El título identifica el documento como libreta de salud. Las páginas son genéricas.','review':'Tu favorita compartida: ilustración facetada. Las otras opciones se conservan.','revision':1},
    {'key':'escuela','file':'2026-07-31-que-hace-que-una-escuela-sea-saludable.md','short':'Una escuela saludable','concept':'Una docente conversa con una familia en el patio.','limit':'La escena muestra participación familiar. No representa una escuela real ni una certificación.','review':'Tus favoritas compartidas: papel y facetada, ambas en su segunda versión.','revision':2},
    {'key':'caminar','file':'2026-10-19-caminar-al-almacen-cuenta-como-actividad-fisica.md','short':'Caminar al almacén','concept':'Una caminata cotidiana con una bolsa de compras.','limit':'Son imágenes generadas; la versión fotográfica no documenta una persona o comercio real.','review':'Tus favoritas compartidas: B narrativa y D fotográfica, ambas v2.','revision':2},
]
topics = []
new_briefs = json.loads((ROOT/'docs/diseno/fuentes/2026-10-24-cinco-estilos/conceptos.json').read_text())
for brief in [*new_briefs, *json.loads(BRIEFS.read_text()), *previous]:
    key = brief['key']
    raw = (ROOT/'contenido/blog/publicados'/brief['file']).read_text()
    meta = {}
    for field in ['title','slug','categoria','description','date']:
        match = re.search(r'^'+field+r':\s*(.+)',raw,re.M)
        if not match: raise ValueError(f'{brief["file"]}: falta {field}')
        value = match[1]
        meta[field] = json.loads(value) if value.startswith('"') else value
    variants=[]
    for style in brief.get('styles',(['editorial','narrativa','foto'] if key=='caminar' else ['trazo','papel','facetada'])):
        revision = brief.get('revisions',{}).get(style,brief.get('revision',1))
        current_revision = brief.get('currentRevisions',{}).get(style,revision)
        if not 1 <= current_revision <= revision:
            raise ValueError(f'{key}/{style}: revisión actual fuera del historial')
        versions=[]
        for v in range(1,revision+1):
            src=f'assets/{key}-{style}-v{v}.webp'
            if not (LAB/src).is_file(): raise FileNotFoundError(src)
            label = 'Primera versión' if v==1 else f'Versión {v}'
            if revision>1 and v==current_revision: label += ' · Actual'
            versions.append({'label':label,'src':src,'revision':v})
        mini=f'assets/{key}-{style}-v{current_revision}-mini.webp'
        if not (LAB/mini).is_file(): raise FileNotFoundError(mini)
        variants.append({'id':f'{key}-{style}-v{current_revision}','style':style,'src':versions[current_revision-1]['src'],'thumbnail':mini,'versions':versions,'description':brief.get('styleNotes',{}).get(style,styles[style]['description']),'alt':brief['concept']+' Técnica: '+styles[style]['name']+'.'})
    topics.append({'id':key,'short':brief['short'],'title':meta['title'],'slug':meta['slug'],'category':meta['categoria'],'description':meta['description'],'date':meta['date'],'concept':brief['concept'],'limit':brief['limit'],'review':brief.get('review','Nueva exploración: por comparar.'),'isNew':brief.get('batch')=='2026-10-24','variants':variants})
catalog={'version':1,'updated':'2026-10-24','styles':styles,'articles':topics}
(LAB/'catalogo.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
print(f'Laboratorio: {len(topics)} artículos, {sum(len(t["variants"]) for t in topics)} propuestas.')
