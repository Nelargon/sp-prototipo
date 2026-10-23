#!/usr/bin/env node
/* ¿Se puede pasar el dominio a Cloudflare sin dejar a nadie sin turno?
   (23/10/2026, sp-interno#209, 1A). Se corre a mano, el día del cambio de DNS
   (sp-interno#101, paso 5), ANTES de cambiar los servidores de nombre. No va en
   el CI: mira sitios en vivo que hoy todavía no existen.

   La reserva de turnos de la web actual («Agendamiento», /login/) es un
   complemento del WordPress (appointment-scheduling) que manda cada pedido a
   admin-ajax.php por el nombre del dominio (medido el 23/10/2026: su
   `ajax_url` es https://saludprotegida.com.py/wp-admin/admin-ajax.php). Por
   eso no alcanza con crear el subdominio: el WordPress tiene que pasar a
   llamarse turnos.saludprotegida.com.py. Si no, la página carga y el turno no
   sale, que es la peor forma de fallar: nadie se entera.

   Uso:
     node scripts/antes-del-dns.mjs [https://<proyecto>.pages.dev]

   1. La reserva responde en su subdominio, con el formulario.
   2. La reserva manda sus pedidos al subdominio, no al dominio que se va.
   3. Con la dirección de Cloudflare: /login/ lleva a la reserva y las bases de
      Octubre Rosa están publicadas.
   Antes de mirar nada se prueba a sí mismo (CLAUDE.md, BITACORA cap. 89). */
import { TURNOS } from './redirecciones-lista.mjs';

// Lo que tiene que decir la página de la reserva para dar turnos.
export function problemasReserva(html, base = TURNOS) {
  const out = [];
  if (!/id="as-login-form-container"/.test(html)) out.push('no está el formulario de la reserva (as-login-form-container)');
  const ajax = /"ajax_url":"([^"]+)"/.exec(html);
  if (!ajax) out.push('no se encontró a dónde manda los pedidos (ajax_url)');
  else {
    const u = ajax[1].replace(/\\\//g, '/');
    if (!u.startsWith(base + '/')) out.push(`manda los pedidos a ${u}, no a ${base}: hay que cambiar la dirección del WordPress`);
  }
  return out;
}

function autoprueba() {
  const f = [];
  const forma = '<div id="as-login-form-container"></div>';
  const hoy = forma + '<script>var as_ajax_object = {"ajax_url":"https:\\/\\/saludprotegida.com.py\\/wp-admin\\/admin-ajax.php"};</script>';
  const lista = forma + '<script>var as_ajax_object = {"ajax_url":"https:\\/\\/turnos.saludprotegida.com.py\\/wp-admin\\/admin-ajax.php"};</script>';
  if (!problemasReserva(hoy).length) f.push('no marca la reserva de hoy, que manda los pedidos al dominio que se va');
  if (problemasReserva(lista).length) f.push('marca una reserva ya mudada');
  if (!problemasReserva('<p>Login</p>').length) f.push('no marca una página sin formulario');
  return f;
}

async function traer(url, redirect = 'follow') {
  try { return await fetch(url, { redirect }); } catch (e) { return { status: 0, error: e.cause?.code || e.message, text: async () => '' }; }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fallas = autoprueba();
  if (fallas.length) { console.error('✗ el control falla en sus propios casos:\n  ' + fallas.join('\n  ')); process.exit(1); }
  const h = [];
  const ok = [];

  const r = await traer(TURNOS + '/login/');
  if (r.status !== 200) h.push(`${TURNOS}/login/ no responde (${r.status || r.error}): la reserva todavía no está en su subdominio`);
  else {
    const p = problemasReserva(await r.text());
    if (p.length) h.push(...p.map((x) => `${TURNOS}/login/: ${x}`));
    else ok.push('la reserva responde en su subdominio y manda los pedidos ahí');
  }

  const cf = process.argv[2]?.replace(/\/$/, '');
  if (cf) {
    const l = await traer(cf + '/login/', 'manual');
    const destino = l.headers?.get?.('location') || '';
    if (![301, 302].includes(l.status) || !destino.startsWith(TURNOS + '/login/')) h.push(`${cf}/login/ no lleva a la reserva (${l.status || l.error} → ${destino || 'sin destino'})`);
    else ok.push('/login/ lleva a la reserva');
    const b = await traer(cf + '/bases/octubre-rosa-2026/');
    if (b.status !== 200) h.push(`${cf}/bases/octubre-rosa-2026/ no responde (${b.status || b.error})`);
    else ok.push('las bases de Octubre Rosa están publicadas');
  } else ok.push('(sin la dirección de Cloudflare no se miraron las redirecciones)');

  if (h.length) {
    console.error(`✗ todavía no se cambia el DNS: ${h.length} problema(s)`);
    for (const x of h) console.error('  ' + x);
    process.exit(1);
  }
  console.log('✓ 3 casos de prueba bien · ' + ok.join(' · '));
}
