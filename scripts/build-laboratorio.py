"""Rebuild the lab catalog from the blog's actual frontmatter and image inventory."""
from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[1]
LAB = ROOT / 'public/blog/laboratorio'
BRIEFS = ROOT / 'docs/diseno/fuentes/2026-10-23-laboratorio-imagenes/conceptos.json'
styles = {
    'trazo': {'name':'Trazo explicativo','description':'Contorno y rayado para describir la acción.'},
    'papel': {'name':'Siluetas y papel','description':'Formas superpuestas, textura y gestos mínimos.'},
    'facetada': {'name':'Ilustración facetada','description':'Volumen construido con planos de color.'},
    'editorial': {'name':'A · Ilustración editorial','description':'Textura y una escena cotidiana con aire.'},
    'narrativa': {'name':'B · Ilustración narrativa','description':'Personajes y entorno cuentan la situación.'},
    'foto': {'name':'D · Apariencia fotográfica','description':'Prueba conservada; todavía se percibe artificial.'},
}
previous = [
    {'key':'libreta','file':'2026-10-15-la-libreta-de-salud-del-nino-es-el-cuaderno-de-obra-de-su-cuidado.md','short':'La libreta de salud','concept':'Una libreta preparada junto al bolso que acompaña al niño.','limit':'El título identifica el documento como libreta de salud. Las páginas son genéricas.','review':'Los tres estilos te gustan. Conservamos las tres opciones.','revision':1},
    {'key':'escuela','file':'2026-07-31-que-hace-que-una-escuela-sea-saludable.md','short':'Una escuela saludable','concept':'Una docente conversa con una familia en el patio.','limit':'La escena muestra participación familiar. No representa una escuela real ni una certificación.','review':'Los tres estilos te gustan. Esta es la revisión de sombras y del gesto mínimo en papel.','revision':2},
    {'key':'caminar','file':'2026-10-19-caminar-al-almacen-cuenta-como-actividad-fisica.md','short':'Caminar al almacén','concept':'Una caminata cotidiana con una bolsa de compras.','limit':'Son imágenes generadas; la versión fotográfica no documenta una persona o comercio real.','review':'A y B son tus preferidas. La fotográfica queda como antecedente para revisar.','revision':2},
]
topics = []
previous_keys = {brief['key'] for brief in previous}
for brief in [*json.loads(BRIEFS.read_text()), *previous]:
    key = brief['key']
    raw = (ROOT/'contenido/blog/publicados'/brief['file']).read_text()
    meta = {}
    for field in ['title','slug','categoria','description','date']:
        match = re.search(r'^'+field+r':\s*(.+)',raw,re.M)
        if not match: raise ValueError(f'{brief["file"]}: falta {field}')
        value = match[1]
        meta[field] = json.loads(value) if value.startswith('"') else value
    revision = brief.get('revision',1)
    variants=[]
    for style in (['editorial','narrativa','foto'] if key=='caminar' else ['trazo','papel','facetada']):
        versions=[]
        for v in range(1,revision+1):
            src=f'assets/{key}-{style}-v{v}.webp'
            if not (LAB/src).is_file(): raise FileNotFoundError(src)
            versions.append({'label':('Revisión actual' if v==revision and revision>1 else f'Primera versión'),'src':src,'revision':v})
        mini=f'assets/{key}-{style}-v{revision}-mini.webp'
        if not (LAB/mini).is_file(): raise FileNotFoundError(mini)
        variants.append({'id':f'{key}-{style}-v{revision}','style':style,'src':versions[-1]['src'],'thumbnail':mini,'versions':versions,'description':brief.get('styleNotes',{}).get(style,styles[style]['description']),'alt':brief['concept']+' Técnica: '+styles[style]['name']+'.'})
    topics.append({'id':key,'short':brief['short'],'title':meta['title'],'slug':meta['slug'],'category':meta['categoria'],'description':meta['description'],'date':meta['date'],'concept':brief['concept'],'limit':brief['limit'],'review':brief.get('review','Nueva exploración: por comparar.'),'isNew':key not in previous_keys,'variants':variants})
catalog={'version':1,'updated':'2026-10-23','styles':styles,'articles':topics}
(LAB/'catalogo.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
print(f'Laboratorio: {len(topics)} artículos, {sum(len(t["variants"]) for t in topics)} propuestas.')
