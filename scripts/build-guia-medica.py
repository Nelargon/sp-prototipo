# -*- coding: utf-8 -*-
"""Genera lib/guia-medica.json desde la planilla maestra de la Guía Médica.

La planilla (Excel) es la fuente: la arma y la mantiene SP, y vive en el repo
PRIVADO (sp-interno/project/guia-medica/) porque trae Observaciones internas
("confirmar con Tesorería", "confirmar si cambió de sede"). Acá sale solo lo
que la guía online muestra. Es INTERINO (decisión de Arturo, 23/09/2026):
el destino final es leer la red directo del sistema de SP.

Uso (openpyxl vive FUERA del repo, como playwright — regla del CLAUDE.md):
    python3 -m venv /tmp/venv && /tmp/venv/bin/pip install openpyxl
    /tmp/venv/bin/python scripts/build-guia-medica.py <planilla.xlsx>

Qué decide este script (y por qué):
- Redes. Cada guía en PDF es una red. Se publican las que tienen planes
  conocidos: Privilege y su familia, SP Esencial (= "Essential" en los PDF,
  confirmado por Arturo el 23/09) en sus tres zonas, y el Seguro Estatal. La
  Centralizada NO: el PDF no dice qué planes cubre, y una red que no se puede
  asociar a un plan no le contesta nada a nadie. Las filas que solo están en
  la Centralizada quedan afuera.
- Estado. "Baja" no se publica. "Revisar" se publica igual que en el PDF y
  lleva `revisar: true` (el prototipo lo marca con un punto naranja, para
  revisión interna; la v1 no lo muestra).
- Tipo "Aviso" no es un prestador: la guía pone una leyenda en lugar de una
  lista. Viaja como nota de la especialidad.
- Condiciones: se quita la procedencia "(según …)", que nombra guías que la
  persona no conoce.
"""
import sys, os, re, json, unicodedata
import openpyxl

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(BASE, 'lib', 'guia-medica.json')

# columna de la planilla → clave de red en la web
REDES = [
    ('Privilege y otros', 'privilege'),
    ('Essential Asu-Central', 'esencial_ac'),
    ('Essential Interior', 'esencial_int'),
    ('Essential Nacional', 'esencial_nac'),
    ('Estatal V2', 'estatal'),
]
GUIA_DE_RED = {'privilege': 'privilege', 'esencial_ac': 'ess_asucentral',
               'esencial_int': 'ess_interior', 'esencial_nac': 'ess_nacional',
               'estatal': 'estatal'}


def txt(v):
    if v is None:
        return ''
    return re.sub(r'\s+', ' ', str(v)).strip()


def sin_segun(c):
    partes = [re.sub(r'\s*\(según [^)]*\)', '', p).strip() for p in c.split(';')]
    vistos, out = set(), []
    for p in partes:
        if p and p.lower() not in vistos:
            vistos.add(p.lower()); out.append(p)
    return '; '.join(out)


def telefonos(*vals):
    out = []
    for v in vals:
        for t in re.split(r'\s*/\s*', txt(v)):
            if t and t not in out:
                out.append(t)
    return out


def clave_orden(nombre):
    n = re.sub(r'^(Dra?\.|Lic\.|Prof\.|Od\.)\s*', '', nombre)
    return ''.join(c for c in unicodedata.normalize('NFD', n.lower()) if unicodedata.category(c) != 'Mn')


def main(ruta):
    wb = openpyxl.load_workbook(ruta, data_only=True)

    filas = list(wb['Red'].iter_rows(values_only=True))
    H = filas[0]
    red = [dict(zip(H, f)) for f in filas[1:] if f[0]]

    grupo = {}
    guias = {}
    for f in wb['Catálogos'].iter_rows(min_row=2, values_only=True):
        if f[0]:
            grupo[txt(f[0])] = txt(f[1])
        if f[11]:
            guias[txt(f[11])] = {'nombre': txt(f[12]), 'fecha': txt(f[13]), 'planes': txt(f[14])}

    prestadores, notas = [], {}
    excluidas = {'baja': 0, 'solo_centralizada': 0}
    for r in red:
        estado = txt(r['Estado'])
        if estado == 'Baja':
            excluidas['baja'] += 1; continue
        esp = txt(r['Especialidad'])
        if txt(r['Tipo']) == 'Aviso':
            notas[esp] = txt(r['Nombre']); continue
        redes = [k for col, k in REDES if txt(r[col]) == 'Sí']
        if not redes:
            excluidas['solo_centralizada'] += 1; continue
        direccion = txt(r['Dirección'])
        nombre = txt(r['Nombre'])
        p = {
            'f': txt(r['ID fila']),
            'id': txt(r['ID prestador']),
            'n': nombre,
            'e': esp,
            'g': grupo.get(esp, 'Especialidades médicas'),
            't': 'i' if txt(r['Tipo']) == 'Institución' else 'p',
            'd': direccion,
            'b': txt(r['Barrio']),
            'c': txt(r['Ciudad']),
            'dp': txt(r['Departamento']),
            'tel': telefonos(r['Teléfono'], r['Otros teléfonos']),
            'r': redes,
        }
        cond = sin_segun(txt(r['Condiciones']))
        if cond:
            p['k'] = cond
        if 'lister' in (direccion + ' ' + nombre).lower():
            p['l'] = 1
        if estado == 'Revisar':
            p['rv'] = 1
        prestadores.append(p)

    prestadores.sort(key=lambda p: (p['e'], clave_orden(p['n'])))

    # Página «Guía Lister»: servicios y horarios (igual en las 6 guías)
    lister = []
    en_horarios = False
    for f in wb['Lister'].iter_rows(values_only=True):
        a, b = txt(f[0]), txt(f[1] if len(f) > 1 else '')
        if a == 'Servicio' and b.startswith('Horario'):
            en_horarios = True; continue
        if en_horarios:
            if not a or a.startswith('En la Red con'):
                break
            lister.append({'s': a, 'h': b})

    out = {
        'meta': {
            'generado_de': re.sub(r'^[0-9a-f]{8}-', '', os.path.basename(ruta)),
            'datos_al': '2026-09-23',
            'guias': {GUIA_DE_RED[k]: guias.get(GUIA_DE_RED[k]) for _, k in REDES},
            'excluidas': excluidas,
        },
        'notas': notas,
        'lister': lister,
        'prestadores': prestadores,
    }
    with open(SALIDA, 'w', encoding='utf-8') as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))
    # Resumen chico para el simulador: cuántos prestadores distintos tiene cada
    # red por departamento y ciudad. El simulador no carga la red entera (250
    # KB); le alcanza con esto para decir "en tu ciudad tenés N" y abrir la
    # guía ya filtrada.
    resumen = {}
    for p in prestadores:
        for r in p['r']:
            d = resumen.setdefault(r, {}).setdefault(p['dp'] or '—', {'ids': set(), 'c': {}})
            d['ids'].add(p['id'])
            d['c'].setdefault(p['c'], set()).add(p['id'])
    resumen = {r: {dp: {'n': len(v['ids']), 'c': {c: len(ids) for c, ids in v['c'].items()}} for dp, v in dps.items()}
               for r, dps in resumen.items()}
    with open(os.path.join(BASE, 'lib', 'red-resumen.json'), 'w', encoding='utf-8') as fh:
        json.dump(resumen, fh, ensure_ascii=False, separators=(',', ':'), sort_keys=True)

    n_prest = len({p['id'] for p in prestadores})
    print(f'✓ {SALIDA}: {len(prestadores)} filas · {n_prest} prestadores · '
          f'{sum(1 for p in prestadores if p.get("rv"))} a revisar · excluidas {excluidas}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('uso: build-guia-medica.py <planilla.xlsx>')
    main(sys.argv[1])
