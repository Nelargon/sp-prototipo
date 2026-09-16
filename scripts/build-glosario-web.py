# -*- coding: utf-8 -*-
"""Genera app/glosario-medico.js desde los borradores de scripts/glosario-definiciones.py.
UNA sola fuente: el Excel que revisa Lister y lo que muestra la web salen de acá,
así no pueden divergir. Entran SOLO los términos con definición propuesta (D):
los modificadores no van al glosario y los ambiguos esperan a Lister."""
import os, io, json, unicodedata, importlib.util as u
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sp = u.spec_from_file_location('gd', os.path.join(BASE, 'scripts/glosario-definiciones.py'))
m = u.module_from_spec(sp); sp.loader.exec_module(m)

def clave(w):
    s = ''.join(c for c in unicodedata.normalize('NFD', w) if unicodedata.category(c) != 'Mn')
    return s.lower()

# Las siglas conservan sus mayúsculas: "AFP", no "Afp".
fam = json.load(open(os.path.join(BASE, 'datos/glosario/terminos.json'), encoding='utf-8'))
SIGLAS = set(fam.get('Siglas y abreviaturas', []))

ent = {}
for w, (tipo, txt) in m.DEFS.items():
    if tipo != 'D':      # M = modificador · C = ambiguo, espera a Lister
        continue
    k = clave(w)
    if k in ent: continue
    ent[k] = (w if w in SIGLAS else w.capitalize(), txt)

js = io.StringIO()
js.write("""// GENERADO por scripts/build-glosario-web.py — NO editar a mano.
// Los textos viven en scripts/glosario-definiciones.py, que es también la fuente
// del Excel que revisa Lister. Una sola fuente: no pueden divergir.
//
// ⚠ ESTADO: BORRADOR SIN VALIDACIÓN MÉDICA. Por eso este glosario NO entra en la
// edición de lanzamiento (ver CON_GLOSARIO_MEDICO en app/edicion.js). El día que
// Lister devuelva el Excel firmado se corrigen los textos acá, se regenera y se
// abre el flag. Publicar una definición médica sin firma es el mismo error que
// publicar una cobertura sin grilla, y pesa más.
//
// Quedan afuera a propósito: los modificadores ("abierto", "por vena") porque
// solo tienen sentido dentro de la fila, y los ambiguos (AC, CA, SENOS, SENO,
// SACO, DETER) porque no sabemos qué significan en esta grilla.
""")
js.write(f"\nexport const MEDICOS = {{\n")
for k in sorted(ent):
    t, dd = ent[k]
    js.write('  %s: { t: "%s", d: "%s" },\n' % (k, t.replace('"', '\\"'), dd.replace('"', '\\"')))
js.write("};\n")
open(os.path.join(BASE, 'app/glosario-medico.js'), 'w', encoding='utf-8').write(js.getvalue())
print(f"✓ app/glosario-medico.js — {len(ent)} términos médicos (solo los de definición propuesta)")
