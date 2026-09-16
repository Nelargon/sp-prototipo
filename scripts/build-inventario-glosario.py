# -*- coding: utf-8 -*-
"""Inventario exhaustivo del vocabulario médico del catálogo publicado.
Regla: a prueba de tontos. Una palabra queda como TRANSPARENTE solo si una
familia paraguaya la usa en su casa sin pensar. Todo lo demás necesita
definición — y lo que no esté clasificado cae en REVISAR, para que nada
desaparezca en silencio."""
import json, re, collections, io, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(BASE, 'lib/prestaciones.json')))
items = d['items']

FUNC = set("""DE DEL LA EL LOS LAS UN UNA CON SIN POR EN Y O A AL PARA MAS MÁS QUE CADA OTROS
OTRAS VARIOS VARIAS SEGUN HASTA DESDE ENTRE TIPO TIPOS NIVEL NIVELES TOTAL TOTALES PARCIAL
SIMPLE SIMPLES DOBLE COMPLETO COMPLETA POSICION POSICIONES MISMO MISMA GENERAL ESPECIAL NUEVO
PRIMERA SEGUNDA NO SU SE ES DOS TRES SUB POST PRE INCLUYE COMUNES LIBRE EXTERNA INTERNA
SUPERIOR INFERIOR IZQUIERDO DERECHO BILATERAL UNILATERAL LADO LADOS AMBOS CIELO ORIGEN PARTES
UNIDAD ALTA BAJA""".split())

# TRANSPARENTE: la dice una familia en su casa. Lista corta a propósito.
TRANSP = set("""SANGRE ORINA HECES CABEZA CARA CUELLO NARIZ BOCA LENGUA LABIO DIENTE DIENTES
OJO OJOS OIDO OIDOS PIEL PELO MANO MANOS DEDO DEDOS BRAZO BRAZOS PIERNA PIERNAS PIE PIES
RODILLA HOMBRO CODO MUÑECA TOBILLO CADERA MUSLO ANTEBRAZO COSTILLA COSTILLAS ESPALDA PECHO
CORAZON CORAZÓN PULMON PULMÓN PULMONES HIGADO HÍGADO RIÑON RIÑÓN RIÑONES ESTOMAGO ESTÓMAGO
INTESTINO VEJIGA UTERO ÚTERO OVARIO MAMA MAMAS PECHOS PENE TESTICULO TESTÍCULO HUESO HUESOS
MUSCULO MÚSCULO PIERNAS EMBARAZO PARTO BEBE BEBÉ HERIDA HERIDAS FRACTURA FRACTURAS QUEMADURA
DOLOR FIEBRE SANGRADO CONSULTA CONTROL EXAMEN PRUEBA MUESTRA LIQUIDO LÍQUIDO LIQUIDOS TIEMPO
TOMA DENTAL CIRUGÍA CIRUGIA CIRUGÍAS OPERACION OPERACIÓN ANESTESIA TRATAMIENTO CLÍNICA CLINICA
PEDIÁTRICA PEDIATRICA FAMILIAR TEJIDO PARED PIEL COLON CUERPO CUERPOS""".split())

BUCKETS = [
 ('Siglas y abreviaturas', set("""RMN TAC TCMS IGG IGM IGA IGE IGD LCR BAAR VDRL AC ANA CK CA
   PTGO DETER PCR VIH HIV TSH T3 T4 PSA HDL LDL VSG TP TTPA GOT GPT LDH CEA AFP HCG FSH LH
   EEG ECG TGO TGP HB HTO VCM ADN ARN""".split())),
 ('Procedimientos y técnicas quirúrgicas', set("""BIOPSIA ESCISIÓN ESCISION DRENAJE PUNCIÓN
   PUNCION SUTURA INCISIÓN INCISION RESECCIÓN RESECCION EXTIRPACIÓN EXTIRPACION EXTRACCIÓN
   EXTRACCION HERNIORRAFÍA HERNIORRAFIA HISTERECTOMÍA HISTERECTOMIA COLPORRAFÍA COLPORRAFIA
   NEFRECTOMÍA NEFRECTOMIA APENDICETOMÍA APENDICETOMIA OOFORECTOMÍA OOFORECTOMIA LINFADENECTOMÍA
   LINFADENECTOMIA LAPAROTOMÍA LAPAROTOMIA SINUSOTOMÍA SINUSOTOMIA LEGRADO ELECTROCOAGULACIÓN
   ELECTROCOAGULACION AMPUTACIÓN AMPUTACION VIDEOLAPAROSCOPÍA VIDEOLAPAROSCOPIA TRANSFUSIÓN
   TRANSFUSION REDUCCIÓN REDUCCION CIERRE INSTALACIÓN INSTALACION EXPLORACIÓN EXPLORACION
   EXPLORADORA DESCUBIERTA QUIRÚRGICO QUIRURGICO QUIRÚRGICA QUIRURGICA OPERATORIA RADICAL
   SUBCUTÁNEO SUBCUTANEO ABIERTO DIAGNÓSTICA DIAGNOSTICA PROCEDIMIENTOS INTERCONSULTA""".split())),
 ('Estudios por imagen y de laboratorio', set("""ECOGRAFIA ECOGRAFÍA DOPPLER TINCION TINCIÓN
   FROTIS ELECTROFORESIS CONTRASTE MONITOREO COLANGIOGRAFIA COLANGIOGRAFÍA PIELOGRAFIA
   PIELOGRAFÍA CULTIVO MICROBIOLOGICO MICROBIOLÓGICO CUANTITATIVO CUALITATIVO LATEX LÁTEX
   REACCION REACCIÓN OSEA ÓSEA FETAL VENOSA VENOSO ORAL TOLERANCIA""".split())),
 ('Anatomía que no es de todos los días', set("""SACRO COXIS HUMERO HÚMERO ESTERNON ESTERNÓN
   MASTOIDES ORBITAS ÓRBITAS MAXILAR MAXILARES DUODENO ESOFAGO ESÓFAGO PARANASALES ILIACAS
   ILÍACAS SACROILIACAS SACROILÍACAS ESCROTAL URETRAL VESICAL PROSTATICA PROSTÁTICA UTERINO
   UTERINA CERVICAL LUMBAR DORSAL INGUINAL TEMPORALES FACIALES PALADAR CORNEA CÓRNEA LAGRIMAL
   TIROIDES GLÁNDULA GLANDULA COLUMNA CRANEO CRÁNEO TORAX TÓRAX ABDOMEN ABDOMINAL PELVIS SENOS
   SENO FEMUR FÉMUR CLAVICULA CLAVÍCULA ARTICULACIONES MIEMBRO MIEMBROS VAGINAL URINARIO
   INTESTINAL RENAL TESTICULAR NASAL BLANDAS SACO VÍA VIA""".split())),
 ('Sustancias y marcadores del análisis', set("""ANTICUERPOS ANTICUERPO ANTIGENO ANTÍGENO
   ANTIGENOS ANTÍGENOS GLUCOSA HEMOGLOBINA ALBUMINA ALBÚMINA COLESTEROL UREA CORTISOL FOSFATASA
   PROTEINAS PROTEÍNAS PROTEINA PROTEÍNA COMPLEMENTO REUMATOIDEO INMUNOGLOBULINAS ANTINUCLEARES
   REACTIVA CALCIO ACIDO ÁCIDO HORMONA FACTOR ALFA BETA SUERO SECRECION SECRECIÓN GERMENES
   GÉRMENES MICROBIANOS BIOLOGICOS BIOLÓGICOS ESPECIFICO ESPECÍFICO""".split())),
 ('Organismos y enfermedades con nombre técnico', set("""CHLAMYDIA TRACHOMATIS MYCOPLASMA
   PNEUMONIAE LEGIONELLA STREPTOCOCCUS TREPONEMA PALLIDIUM TOXOPLASMA GONDII EPSTEIN BARR
   HEPATITIS VIRUS PERITONITIS""".split())),
 ('Condiciones y hallazgos', set("""ABSCESO QUISTE LESIÓN LESION TUMOR HERNIA TRAUMATISMO
   EXTRAÑO COMPLEJIDAD""".split())),
 ('Especialidades médicas', set("""ALERGIA CARDIOCIRUGÍA CARDIOCIRUGIA COLOPROCTOLOGÍA
   COLOPROCTOLOGIA DERMATOLOGÍA DERMATOLOGIA DIABETOLOGÍA DIABETOLOGIA ENDOCRINOLOGÍA
   ENDOCRINOLOGIA FLEBOLOGÍA FLEBOLOGIA FONOAUDIOLOGÍA FONOAUDIOLOGIA GASTROENTEROLOGÍA
   GASTROENTEROLOGIA GERIATRÍA GERIATRIA OBSTETRICIA HEMATOLOGÍA HEMATOLOGIA INFECTOLOGÍA
   INFECTOLOGIA MASTOLOGÍA MASTOLOGIA NEFROLOGÍA NEFROLOGIA NEUMOLOGÍA NEUMOLOGIA
   OTORRINOLARINGOLOGÍA PSIQUIATRÍA PSIQUIATRIA REUMATOLOGÍA REUMATOLOGIA TRAUMATOLOGÍA
   TRAUMATOLOGIA UROLOGÍA UROLOGIA OFTALMOLOGÍA OFTALMOLOGIA NEUROLOGÍA NEUROLOGIA
   CARDIOLOGÍA CARDIOLOGIA GINECOLOGÍA GINECOLOGIA PEDIATRÍA PEDIATRIA ONCOLOGÍA ONCOLOGIA
   NEUROCIRUGÍA NEUROCIRUGIA""".split())),
]

tok = collections.Counter()
for i in items:
    for w in re.findall(r"[A-Za-zÁÉÍÓÚÑáéíóúñ]{2,}", i['n']):
        tok[w.upper()] += 1

clasif = {}
for nombre, ws in BUCKETS:
    for w in ws:
        clasif[w] = nombre

filas = collections.defaultdict(list)
for w, c in tok.items():
    if w in FUNC: filas['— palabra funcional —'].append((w, c)); continue
    if w in TRANSP: filas['Transparente (no se define)'].append((w, c)); continue
    filas[clasif.get(w, 'SIN CLASIFICAR — revisar a mano')].append((w, c))

orden = [b[0] for b in BUCKETS] + ['SIN CLASIFICAR — revisar a mano',
         'Transparente (no se define)', '— palabra funcional —']
resumen = []
for b in orden:
    ws = sorted(filas[b], key=lambda x: (-x[1], x[0]))
    resumen.append((b, len(ws), sum(c for _, c in ws)))

print(f"{len(items)} fichas · {len(tok)} tokens distintos\n")
print(f"{'categoría':<46} {'términos':>9} {'apariciones':>12}")
for b, n, ap in resumen:
    print(f"  {b:<44} {n:>9} {ap:>12}")
nec = sum(n for b, n, _ in resumen if b not in ('Transparente (no se define)', '— palabra funcional —'))
print(f"\n→ NECESITAN DEFINICIÓN (incluyendo los sin clasificar): {nec} términos")

# documento completo
out = io.StringIO()
out.write("# Inventario del vocabulario médico del catálogo\n\n")
out.write(f"Generado el 16/09/2026 desde `lib/prestaciones.json` — **{len(items)} fichas publicadas**, "
          f"**{len(tok)} términos distintos**.\n\n")
out.write("La vara es la de Arturo: *a prueba de tontos en materia médica*. Una palabra queda como\n"
          "**transparente** solo si una familia paraguaya la usa en su casa sin pensarlo. Ante la duda,\n"
          "**necesita definición**. Lo que el clasificador no reconoce cae en *SIN CLASIFICAR* — a la\n"
          "vista, nunca descartado en silencio.\n\n")
out.write("⚠ **Esta clasificación es de Claude, no de un médico.** Ninguna definición se publica sin que\n"
          "la valide alguien de Lister. El número entre paréntesis es en cuántas fichas aparece.\n\n")
out.write("## Resumen\n\n| Categoría | Términos | Apariciones |\n|---|---:|---:|\n")
for b, n, ap in resumen: out.write(f"| {b} | {n} | {ap} |\n")
out.write(f"\n**Necesitan definición: {nec} términos.**\n\n")
for b in orden:
    ws = sorted(filas[b], key=lambda x: (-x[1], x[0]))
    if not ws: continue
    out.write(f"\n## {b} · {len(ws)}\n\n")
    out.write(', '.join(f"{w.title()} ({c})" for w, c in ws) + "\n")
u1 = sum(1 for w in filas['SIN CLASIFICAR — revisar a mano'] for _ in [0] if w[1] == 1)
u2 = sum(1 for w in filas['SIN CLASIFICAR — revisar a mano'] if w[1] == 2)
moldes = collections.Counter()
for i in items:
    ws = [w.upper() for w in re.findall(r"[A-Za-zÁÉÍÓÚÑáéíóúñ]{2,}", i['n'])]
    moldes[tuple(sorted({w for w in ws if w not in FUNC and tok[w] >= 3}))] += 1
out.write(f"""
---

## Qué dice este inventario — leer antes de usarlo

**No son 30 palabras, ni 47. Son {nec}.** Ese es el número real cuando la vara es
"a prueba de tontos en materia médica", y es el que hay que mirar antes de
prometer un glosario.

Pero el dato que importa no es el total, es **cómo se reparte**:

- **{nec - len(filas['SIN CLASIFICAR — revisar a mano'])} términos** entran en ocho familias ordenadas (siglas, procedimientos,
  estudios, anatomía, sustancias, organismos, condiciones, especialidades). Son los
  que se repiten, los que todo el mundo se cruza, y los que de verdad conviene
  definir como palabra.
- **{len(filas['SIN CLASIFICAR — revisar a mano'])} quedan sueltos** — y de esos, **{u1} aparecen en UNA sola ficha** y {u2} en dos.
  Marsupialización, colecistostomía, fistulotomía, estradiol, apolipoproteína.

**Esa cola larga es la que rompe el plan del glosario.** Definir "marsupialización"
como palabra, para que sirva en una sola fila, es trabajo tirado: quien lee esa
fila no necesita saber qué quiere decir la palabra, necesita saber **para qué
sirve el procedimiento**.

### La vuelta: no definir palabras, explicar fichas

Las mismas {len(items)} fichas se agrupan en **{len(moldes)} moldes distintos**, y 13 de esos moldes
cubren 288 fichas. O sea: **{len(moldes)} explicaciones de una línea en vez de {nec}
definiciones de palabra** — menos trabajo, y contesta la pregunta que la persona
realmente tiene.

La ficha ya soporta esa línea: el campo `d` de cada ítem, que hoy usan cinco
(odontología, oncológico, bariátrica). No hay que construir nada nuevo.

### Y cómo se vuelve realista

Escribir {len(moldes)} explicaciones médicas desde cero no es un pedido que se le pueda hacer
a Lister. **Revisarlas sí.** El borrador se genera, el médico corrige y firma.
Revisar {len(moldes)} líneas es trabajo de días; escribirlas es de meses.

Las {nec - len(filas['SIN CLASIFICAR — revisar a mano'])} palabras de las ocho familias siguen valiendo como glosario clásico: son
las que se repiten en todo el sitio, no solo en el catálogo.

⚠ Nada de esto se publica sin validación médica. Una explicación inventada en un
sitio de salud es el mismo tipo de error que una cobertura mal listada, y pesa
más: la promesa de esta empresa es que lo que decimos se puede verificar.
""")
open(os.path.join(BASE, 'datos/glosario/INVENTARIO-terminos.md'), 'w', encoding='utf-8').write(out.getvalue())
json.dump({b: sorted([w for w, _ in filas[b]]) for b in orden},
          open(os.path.join(BASE, 'datos/glosario/terminos.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print("\n✓ datos/glosario/INVENTARIO-terminos.md + terminos.json")
