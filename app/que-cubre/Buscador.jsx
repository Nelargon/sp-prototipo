'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { css } from '../css';
import { track } from '../track';
import { Term } from '../glossary';
import datos from '../../lib/prestaciones.json';
import { buscar, indexar, EJEMPLOS } from '../../lib/buscar-prestaciones';

/* ¿Y esto, me lo cubre? — el buscador de las 983 respuestas.
   ----------------------------------------------------------------------------
   Es el corazón de /planes. La grilla oficial (935 estudios, análisis y
   cirugías + 43 especialidades + lo que no cubre nadie) vive en el repo desde
   julio y hasta hoy solo servía para calcular tres porcentajes. Acá se vuelve
   lo que una familia puede usar: escribís lo que te pidió el doctor y ves qué
   hace cada plan con eso, antes de firmar.

   Por qué esto y no tres columnas de precios: la tesis del proyecto es que SP
   vende transparencia y hoy no la demuestra. Una promesa de transparencia que
   no se puede verificar es marketing; una que sí, es producto.

   PRIVACIDAD — leer antes de tocar `track` acá.
   Lo que alguien escribe en este campo puede ser un dato de salud ("quimio",
   "psiquiatra", "embarazo"). El texto de la búsqueda NO SE MANDA NUNCA: el
   evento lleva solo el largo y si hubo resultados, que es lo único que sirve
   para saber si el buscador funciona. Es la misma regla que prohíbe mandar
   nombre/teléfono/email (CLAUDE.md), aplicada a lo que es aún más sensible. */

// El índice del modo ES el código de cobertura (ver scripts/build-prestaciones.mjs).
// Colores con la semántica fija del proyecto: teal = cubierto/sí · gris = estado
// neutro · dorado = oportunidad (nunca ausencia) · rojo = SOLO urgencias.
const ESTILO_MODO = [
  { bg: 'var(--sp-mint-bg)', fg: 'var(--sp-teal-deep)', punto: 'var(--sp-teal)' }, // Cubierto
  { bg: 'var(--sp-estado-bg-2)', fg: 'var(--sp-estado-ink-2)', punto: 'var(--sp-estado-punto)' }, // Pagás la mitad
  { bg: 'var(--sp-estado-bg-2)', fg: 'var(--sp-estado-ink-2)', punto: 'var(--sp-estado-punto)' }, // Cubre una parte
  { bg: 'var(--sp-estado-bg)', fg: 'var(--sp-estado-ink)', punto: 'var(--sp-estado-punto-2)' }, // Según la cirugía
  { bg: 'var(--sp-estado-bg)', fg: 'var(--sp-estado-ink)', punto: 'var(--sp-estado-ink)' }, // Al precio de convenio
  { bg: 'var(--sp-estado-bg)', fg: 'var(--sp-estado-ink)', punto: 'var(--sp-estado-punto-2)' }, // No lo cubre ningún plan
];
const SIN_DATO = { bg: '#FAFAFA', fg: '#8a8a8a', punto: '#c9c9c9' };

const PLANES = [
  { k: 'b', nombre: 'Bronze', color: 'var(--sp-plan-bronze)' },
  { k: 's', nombre: 'Silver', color: 'var(--sp-plan-silver)' },
  { k: 'o', nombre: 'Gold', color: 'var(--sp-plan-gold)' },
];

const RelojIcono = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
);

/* La espera en la unidad en que la gente piensa el tiempo. 300 días no le dice
   nada a nadie; "10 meses" sí — es el mismo criterio que usa app/glossary.jsx
   en el resto del sitio. */
function esperaTexto(dias) {
  if (dias == null) return null;
  if (dias === 0) return 'Desde el día uno';
  if (dias < 45) return `${dias} días de espera`;
  const meses = Math.round(dias / 30);
  return `${meses} meses de espera`;
}

function Celda({ item, plan, indice, datos }) {
  const cel = item[plan.k];
  const [cob, cantIdx, carencia] = cel;
  const sinDato = cob === -1;
  const modo = sinDato ? null : datos.meta.modos[cob];
  const est = sinDato ? SIN_DATO : ESTILO_MODO[cob];
  const cantidad = cantIdx >= 0 ? datos.cantidades[cantIdx] : null;
  const espera = esperaTexto(carencia);

  /* La ausencia se dice como oportunidad, nunca como falta (regla de tono del
     HANDOFF §3.7). Si un plan de más arriba mejora esto, el dorado lo señala:
     es la única lectura útil de un "no" en la columna de Bronze. */
  let mejora = null;
  if (!sinDato && indice < 2) {
    for (let j = indice + 1; j < 3; j++) {
      const otro = item[PLANES[j].k][0];
      if (otro >= 0 && otro < cob) {
        mejora = `${datos.meta.modos[otro].k} desde ${PLANES[j].nombre}`;
        break;
      }
    }
  }

  return (
    <div style={css('padding:13px 14px;border-left:1px solid var(--sp-line-2);display:flex;flex-direction:column;gap:6px')}>
      <div style={css('display:flex;align-items:center;gap:6px')}>
        <span style={css('width:8px;height:8px;border-radius:var(--r-pill);flex:none;background:' + plan.color)}></span>
        <span className="disp" style={css('font-size:12px;font-weight:800;color:var(--sp-navy)')}>{plan.nombre}</span>
      </div>
      <div className="disp" style={css(`display:inline-flex;align-items:center;gap:6px;align-self:flex-start;font-size:12.5px;font-weight:700;padding:4px 10px;border-radius:var(--r-pill);line-height:1.3;background:${est.bg};color:${est.fg}`)}>
        <span style={css('width:7px;height:7px;border-radius:var(--r-pill);flex:none;background:' + est.punto)}></span>
        {sinDato ? 'Sin dato' : modo.k}
      </div>
      {cantidad && (
        <div style={css('font-family:var(--font-inter),sans-serif;font-size:12px;color:var(--sp-muted);line-height:1.45')}>{cantidad}</div>
      )}
      {espera && (
        <div style={css('font-family:var(--font-inter),sans-serif;font-size:11.5px;color:var(--sp-muted);line-height:1.4;display:flex;align-items:center;gap:4px')}>
          {RelojIcono}<span>{espera}</span>
        </div>
      )}
      {sinDato && (
        <div style={css('font-family:var(--font-inter),sans-serif;font-size:11.5px;color:#8a8a8a;line-height:1.45')}>La grilla no lo declara para este plan. Preguntale a tu asesor.</div>
      )}
      {mejora && (
        <div className="disp" style={css('font-size:11.5px;font-weight:700;color:var(--sp-gold-ink);line-height:1.35')}>↑ {mejora}</div>
      )}
    </div>
  );
}

function Ficha({ item, datos }) {
  const familia = datos.meta.cuadros[item.c];
  return (
    <div style={css('border:1px solid var(--sp-line);border-radius:14px;overflow:hidden;background:#fff')}>
      <div style={css('padding:12px 16px;background:var(--sp-surface-2);border-bottom:1px solid var(--sp-line-2);display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px 14px')}>
        {/* Nombre del estudio: viene del tarifario en MAYÚSCULAS. No se
            "arregla" a Tipo Oración — es el nombre con el que aparece en la
            orden del médico, y esa coincidencia literal es la que deja
            reconocerlo. */}
        <span className="disp" style={css('font-size:14.5px;font-weight:800;color:var(--sp-navy);line-height:1.3')}>{item.n}</span>
        <span className="disp" style={css('font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--sp-teal-900);white-space:nowrap')}>{familia}</span>
      </div>
      {item.d && (
        <div style={css('padding:11px 16px;border-bottom:1px solid var(--sp-line-2);font-family:var(--font-inter),sans-serif;font-size:13px;color:var(--sp-text-2);line-height:1.55')}>{item.d}</div>
      )}
      <div className="bus-celdas" style={css('display:grid;grid-template-columns:1fr 1fr 1fr')}>
        {PLANES.map((p, i) => (
          <Celda key={p.k} item={item} plan={p} indice={i} datos={datos} />
        ))}
      </div>
    </div>
  );
}

export default function Buscador() {
  const [q, setQ] = useState('');
  const idx = useMemo(() => indexar(datos), []);
  const { hits, total, aproximado } = useMemo(() => buscar(datos, idx, q), [q, idx]);
  const yaContado = useRef(false);

  const escribir = (valor) => setQ(valor);

  const buscando = q.trim().length >= 2;
  const vacio = buscando && total === 0;

  /* Un solo evento por sesión de búsqueda, cuando la consulta SE ASENTÓ.
     Antes se disparaba al segundo carácter y quedaba ahí: escribir "resonancia"
     registraba `largo: 2` y nada sobre si el buscador respondió — la métrica
     era casi constante y no servía para saber si esto funciona. Ahora espera a
     que la persona deje de tipear y manda el largo final y si hubo resultados.
     Sigue sin viajar el texto: ver la nota de PRIVACIDAD arriba. */
  useEffect(() => {
    if (yaContado.current || !buscando) return;
    const t = setTimeout(() => {
      yaContado.current = true;
      track('planes_buscar', { largo: q.trim().length, hubo_resultados: total > 0, aproximado });
    }, 1200);
    return () => clearTimeout(t);
  }, [q, buscando, total, aproximado]);

  return (
    <div style={css('background:var(--sp-mint-tint);border:1px solid var(--sp-mint-line);border-radius:var(--r-lg);padding:24px 22px 26px;box-shadow:0 1px 3px rgba(0,0,0,0.06)')}>
      <label htmlFor="bus-q" className="disp" style={css('display:block;font-size:13px;font-weight:800;color:var(--sp-navy);margin-bottom:9px')}>
        Escribí lo que te pidió el doctor:
      </label>
      <div style={css('position:relative')}>
        <span style={css('position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--sp-teal-deep);pointer-events:none;display:flex')}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        </span>
        <input
          id="bus-q"
          type="search"
          value={q}
          onChange={(e) => escribir(e.target.value)}
          placeholder="Resonancia, hemograma, cesárea, psicólogo…"
          autoComplete="off"
          style={css('width:100%;height:56px;padding:0 16px 0 46px;border:1.5px solid var(--sp-mint-line-strong);border-radius:14px;background:#fff;font-family:var(--font-inter),sans-serif;font-size:16px;color:var(--sp-ink);outline:none')}
        />
      </div>

      {/* Ejemplos: no son decoración, son el manual de uso. Sin ellos la gente
          no sabe que puede escribir "muela" y obtener una respuesta honesta. */}
      <div style={css('display:flex;flex-wrap:wrap;gap:7px;margin-top:12px;align-items:center')}>
        <span style={css('font-family:var(--font-inter),sans-serif;font-size:12.5px;color:var(--sp-muted)')}>Probá con:</span>
        {EJEMPLOS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => escribir(e)}
            className="disp bus-chip"
            style={css('height:31px;padding:0 13px;border-radius:var(--r-pill);border:1px solid var(--sp-mint-line-strong);background:#fff;color:var(--sp-teal-deep);font-size:12.5px;font-weight:700;cursor:pointer;transition:background .15s,border-color .15s')}
          >
            {e}
          </button>
        ))}
      </div>

      {/* ⚠ El aria-live cubre SOLO esta línea de estado, nunca la lista.
          Cuando envolvía las fichas, cada tecla le anunciaba a un lector de
          pantalla hasta 40 nombres con sus tres planes, cantidades, esperas y
          avisos: un chorro imposible de escuchar. Acá se anuncia lo que cambió
          —cuántos resultados hay— y la lista queda afuera, para leerla
          navegando. */}
      <div aria-live="polite" style={css('margin-top:18px')}>
        {!buscando && (
          /* Procedencia partida a propósito: los estudios y las especialidades
             salen de la grilla oficial; las exclusiones NO están en la grilla
             —se toman del contrato— y decir que las 983 salen de la grilla
             exageraría el respaldo justo de las afirmaciones más fuertes, las
             negativas. En una página de transparencia eso importa. */
          <div style={css('font-family:var(--font-inter),sans-serif;font-size:13.5px;color:var(--sp-muted);line-height:1.6;text-align:center;padding:14px 6px')}>
            <b className="disp" style={css('color:var(--sp-navy)')}>{datos.meta.total} respuestas</b>: {datos.meta.porTipo.e} estudios, análisis y cirugías y {datos.meta.porTipo.c} especialidades salidas de la <b>grilla oficial de coberturas</b>, más {datos.meta.porTipo.x} cosas que <b>no cubre ningún plan</b>, tomadas del contrato.
          </div>
        )}

        {buscando && total > 0 && (
          <div style={css('font-family:var(--font-inter),sans-serif;font-size:13px;color:var(--sp-muted)')}>
            {aproximado
              ? 'No encontramos eso exacto. Esto es lo más parecido que hay en la grilla:'
              : <>{total === 1 ? '1 resultado' : `${total} resultados`}{total > hits.length && <> · mostramos los {hits.length} más parecidos</>}</>}
          </div>
        )}

        {/* El vacío también se anuncia — la tarjeta que lo explica vive abajo,
            fuera de la región viva, pero quien no ve la pantalla tiene que
            enterarse de que no hubo resultados. */}
        {vacio && (
          <div style={css('font-family:var(--font-inter),sans-serif;font-size:13px;color:var(--sp-muted)')}>Sin resultados para esa búsqueda.</div>
        )}
      </div>

      <div id="bus-resultados" style={css('margin-top:11px')}>
        {buscando && total > 0 && (
          <div style={css('display:flex;flex-direction:column;gap:10px')}>
            {hits.map((it, i) => <Ficha key={`${it.t}-${it.n}-${i}`} item={it} datos={datos} />)}
          </div>
        )}

        {vacio && (
          /* Un vacío en una página de transparencia se lee como "no lo cubre".
             Por eso el estado vacío dice lo que sí sabemos y a dónde ir — nunca
             deja a alguien deduciendo del silencio. */
          <div style={css('background:#fff;border:1px solid var(--sp-line);border-radius:14px;padding:20px 22px')}>
            <div className="disp" style={css('font-size:15px;font-weight:800;color:var(--sp-navy);margin-bottom:7px')}>No lo encontramos con ese nombre.</div>
            <div style={css('font-family:var(--font-inter),sans-serif;font-size:13.5px;color:var(--sp-text-2);line-height:1.6')}>
              Que no aparezca acá <b>no quiere decir que no esté cubierto</b>: la grilla usa el nombre técnico del estudio. Probá con una palabra más corta ("rodilla", "sangre", "cirugía") o con el nombre del especialista. Si no aparece, preguntale a tu asesor antes de firmar — te va a decir con qué contás y con qué no.
            </div>
          </div>
        )}
      </div>

      <div style={css('font-family:var(--font-inter),sans-serif;font-size:12px;color:var(--sp-muted);line-height:1.6;margin-top:16px;padding-top:14px;border-top:1px solid #e2eeed')}>
        La espera es la <Term k="carencia">carencia</Term> de cada servicio: el reloj arranca el día que te afiliás, no el día que lo necesitás. Coberturas de la grilla oficial vigente ({datos.meta.vigencia}); el detalle final lo confirmás con tu asesor.
      </div>
    </div>
  );
}
