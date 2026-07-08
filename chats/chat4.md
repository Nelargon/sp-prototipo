# Integración con Google Drive

_Started 2026-07-02 15:55 UTC_

---

## User

Si quiero agregar un paquete de imágenes o te quiero pasar para que agarres de alguna fuente, como google Drive, podrías hacerlo?

## Assistant

Sí, puedo trabajar con imágenes de varias formas:

**Subida directa** — Podés adjuntar las imágenes acá en el chat (arrastrándolas o desde el botón de adjuntar). Se guardan en el proyecto y las uso directo en el diseño. Esta es la opción más confiable.

**Google Drive** — Puedo intentar traer archivos si tengo una herramienta de conexión disponible. Si me pasás el enlace, lo intento; si no logro acceder (por permisos o falta de conexión), te aviso y lo resolvemos con subida directa. Ojo: los enlaces de Drive suelen requerir que el archivo esté compartido públicamente o que haya una integración autorizada.

**Desde una web/URL pública** — Si las imágenes están en una página accesible, puedo buscarlas, pero no siempre puedo descargarlas directo según el origen.

La ruta más segura y rápida es que me las subas directamente acá. ¿Querés que armemos una carpeta de `assets` para organizarlas por sección (hero, planes, testimonios, etc.)?

## User

Aquí están las fotos 
https://drive.google.com/drive/folders/1gpee9ckFLhuIW9RSWtQdUnY2m5IMBV71?usp=sharing

## Assistant

_[tool: googledrive__search_files]_

_[tool: tool_search_tool_bm25]_

_[tool: tool_search_tool_bm25]_

¡Sí, tengo acceso a la carpeta! Veo las fotos. Déjame revisar si hay más y traerlas al proyecto.

_[tool: googledrive__search_files]_

_[tool: googledrive__search_files]_

Tengo acceso completo. La carpeta tiene 17 imágenes (9 PNG de la serie "Familia Feliz" + 7 fotos JPG + 1 PNG "Para la mamá") y una subcarpeta con versiones anteriores.

Déjame probar traer una para verificar el mecanismo de guardado.

_[tool: googledrive__download_file_content]_

I have full access to the folder, but I hit a practical snag: these are large files (the PNGs are ~2 MB each) and pulling them through as raw data is heavy and unreliable at that size. Let me test the cleaner route — embedding them by their Drive link — before committing.

_[tool: write_file]_

_[tool: snip]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: eval_js]_

Confirmé el mecanismo. Buenas noticias y un par de advertencias importantes:

Las imágenes **sí cargan** en el navegador usando su enlace de Drive (formato `lh3.googleusercontent.com/d/ID` o `drive.google.com/thumbnail?id=ID`). Puedo enlazarlas directo sin descargarlas.

**Pero hay dos límites reales que conviene que sepas:**

1. **Enlazar desde Drive es frágil para producción.** Google puede limitar o cambiar esos endpoints, y las imágenes desaparecerían del sitio. Sirve muy bien para un mockup o prototipo, no para la web final publicada.

2. **No funcionan al exportar** (PDF, HTML offline/standalone, PPTX). Esos formatos necesitan la imagen incrustada en el archivo — con enlaces de Drive saldrían en blanco. La página "offline" que ya tenés en el proyecto quedaría rota.

Traer los archivos *de verdad* al proyecto (los bytes, para que queden incrustados y sean confiables) tiene una traba técnica: son pesados (~2 MB cada PNG) y el canal por el que los leo se satura con ese tamaño.

**Mi recomendación según tu objetivo:**

- **Para mockup rápido / iterar diseño ahora** → los enlazo directo desde Drive. Cero espera, y después reemplazamos.
- **Para la web final, o si vas a exportar PDF/HTML offline** → la vía sólida es que descargues la carpeta de Drive como ZIP (Drive lo permite en un clic) y la arrastres acá al chat. Yo la descomprimo, organizo por sección y optimizo. Quedan incrustadas y confiables.

¿Cómo preferís avanzar? Y contame para qué las querés usar exactamente (¿hero, sección de planes, testimonios?) así las ubico bien.

## User

Vamos con Para mockup rápido / iterar diseño ahora

## Assistant

_[tool: snip]_

_[tool: delete_file]_

Perfecto. Voy con enlaces directos de Drive. Déjame ver la página actual para saber dónde encajan las fotos.

_[tool: read_file]_

La página tiene un placeholder claro de foto full-bleed en el hero (familia paraguaya, luz cálida). Es el lugar natural para arrancar. Voy a colocar ahí una de las fotos y te lo muestro.

_[tool: dc_html_str_replace]_

_[tool: show_html]_

_[tool: eval_js]_

El JPG que elegí es de baja resolución (solo 800px de ancho) — se vería borroso en un hero full-bleed. Los PNG de la serie "Familia Feliz" son de mayor resolución. Déjame comprobar cuánto dan.

_[tool: eval_js]_

Todas las fotos de la carpeta topan en ~1122px de ancho y son verticales (formato retrato). Para un hero full-bleed horizontal quedan un poco justas de resolución y hay que recortar, pero para iterar el mockup sirven bien. Uso una de la serie "Familia Feliz" (mayor calidad que los JPG).

_[tool: dc_html_str_replace]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: dc_html_str_replace]_

_[tool: eval_js]_

_[tool: show_html]_

_[tool: eval_js]_

Listo — la foto ya está cargando en el hero (confirmado, 1122×1402 desde Drive).

_[tool: ready_for_verification]_

Foto colocada en el hero de **Planes v5 – Página viva**. Se ve la familia caminando (serie "Familia Feliz") a todo el ancho, con el degradado de protección navy sobre la izquierda para que el texto siga legible.

Dos cosas para tener presente:

- **Resolución**: todas las fotos de la carpeta topan en ~1122px y son verticales. En el hero horizontal se recorta y queda apenas suave — perfecto para iterar, pero para la web final conviene una versión más grande y horizontal del hero.
- **Enlace de Drive**: mientras iteramos funciona; al exportar (PDF / HTML offline) saldría en blanco. Cuando cierres el diseño, pasamos a incrustar los archivos.

¿Sigo colocando fotos en otras secciones? El resto de la página (cartilla, comparador, simulador) es puro UI sin placeholder de imagen, así que ahí meter fotos ya sería una decisión de diseño tuya. Si querés, te propongo dónde encajarían mejor (ej: una banda con foto antes del cierre, o el manifiesto con imagen de fondo).

## User

Cómo se llama esa sección interactiva que dice: En Paraguay, miles de familias creen que están protegidas.La mayoría lo descubre recién cuando algo sale mal....

## Assistant

_[tool: snip]_

Esa sección se llama el **Manifiesto** (en el código está marcada como `id="manifiesto"` / `data-manifesto`).

La técnica que usa se llama **scrollytelling** (o "scroll narrativo"): el bloque queda fijo en pantalla —"sticky"— mientras hacés scroll, y las frases van apareciendo, desvaneciéndose y desplazándose una tras otra en sincronía con el movimiento del mouse. Es la sección alta (mide 360vh) que arranca con esas líneas y termina en "Salud Protegida es protección que se siente", con la barrita turquesa de progreso abajo.

En el nav aparece linkeada como "Conocé la historia" (el botón secundario del hero también lleva ahí).

¿Querés que le ajuste algo — el texto, el ritmo, o meterle una foto de fondo tenue detrás de las frases?

## User

QUé sería conveniente agregar aquí? Un video que se anime mientras se hace el scroll?

## Assistant

Mi recomendación honesta: **video scroll-scrubbed no** — al menos no como primera opción.

Un video que se scrubbea con el scroll es llamativo, pero acá juega en contra por tres razones:

- **La marca pide calma, no espectáculo.** El manifiesto ya funciona por su silencio y ritmo. Un video compitiendo con el texto sube el "ruido" justo donde querés que el afiliado (que suele venir ansioso) respire.
- **Costo y peso.** Necesitás un clip producido de verdad (cálido, familiar, paraguayo) y pesa mucho — carga lenta en mobile, que es donde más se ve.
- **Fragilidad.** Scroll-scrubbing bien hecho es delicado en celulares gama media.

**Lo que sí le queda perfecto y es "conveniente":** un **fondo fotográfico que va cambiando con cada frase**. Es decir:

- Detrás de cada línea del manifiesto, una foto de familia (de las que ya tenemos en Drive) que **cross-fadea** suavemente al pasar a la siguiente frase.
- Un **Ken Burns** muy lento (la foto deriva/zoom 3-4% mientras la leés) → da sensación de vida sin animación agresiva.
- El degradado navy de protección encima mantiene el texto legible y le da unidad con el hero.

Eso reutiliza las fotos que ya cargamos, es liviano, y respeta el "movimiento calmo de 4-8px" del sistema. Da el efecto cinematográfico que buscás, sin video.

¿Lo prototipo así? Emparejo las 6-7 frases con fotos de la carpeta (ej: "algo sale mal" → foto más íntima/seria, cierre "se siente" → la más cálida) y lo ves funcionando en un minuto. Si igual querés probar el video scrubbed, también lo puedo hacer — decime.

## User

Dale

## Assistant

¡Dale! Emparejo las 7 frases con fotos que cross-fadean y con Ken Burns lento detrás. Mapeo emocional: apertura familia unida → "algo sale mal" foto de consulta → planificar antes → momentos íntimos → abrazo/apoyo → mate cotidiano → cierre cálido (chipa en familia).

_[tool: snip]_

Primero el CSS (Ken Burns + capa de foto):

_[tool: dc_html_str_replace]_

Ahora las capas de foto + tinte navy detrás del texto del manifiesto:

_[tool: dc_html_str_replace]_

Ahora la lógica: capturar las fotos y cruzarlas según el avance del scroll.

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: show_html]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

Funciona: confirmado que a mitad del scroll la frase 4 ("antes de la llamada de madrugada") queda con su foto íntima activa, cruzando suavemente entre las demás. Las 7 fotos cargan bien y el Ken Burns corre detrás.

_[tool: ready_for_verification]_

Listo. El **Manifiesto** ahora tiene fotos de fondo que se cruzan frase por frase, con Ken Burns lento (deriva/zoom sutil) y el tinte navy encima para que el texto siga legible. Mapeo:

1. "creen que están protegidas" → familia en el patio
2. "algo sale mal" → consulta médica
3. "se construye antes" → pareja planificando
4. "llamada de madrugada" → manos sobre manos (íntimo)
5. "diagnóstico difícil" → abuela e hija abrazadas
6. "«¿esto lo cubre?»" → familia tomando mate
7. "protección que se siente" → abuela y nieta haciendo chipa

Bajá por esa sección para verlo en movimiento. Recordá el mismo caveat: los enlaces de Drive andan mientras iteramos, pero al exportar habría que incrustar las fotos.

Si algo no cuadra, lo más fácil de ajustar: el **emparejamiento foto↔frase**, la **fuerza del tinte** (si querés ver más o menos la foto) o la **velocidad del Ken Burns**. ¿Retocamos algo?

## User

Creo que no cuadran bien las fotos que estamos usando de nuestros recursos. Entonces, si querés, pedime en descripción las mejores fotos para cada una de estas frases y yo las voy a buscar personalmente.

## Assistant

_[tool: snip]_

Perfecto, así lo hacemos bien. Acá van los briefs foto por foto.

**Specs generales para todas** (esta sección es full-bleed y el texto va centrado en blanco sobre tinte navy):
- **Orientación horizontal (16:9)**, mínimo ~2400px de ancho. Las actuales fallan porque son verticales y de baja resolución — se recortan mal.
- **Luz natural cálida**, gente paraguaya real, tono documental (no pose de stock).
- **Centro relativamente despejado** (ahí va el texto) — la acción/los rostros mejor hacia los tercios laterales.
- Deben verse bien **oscurecidas ~40%** (el tinte navy va encima).
- Evitá: salas blancas clínicas, estetoscopios, pastillas, ambo/quirúrgico, sonrisa forzada a cámara.

**Frase 1 — "En Paraguay, miles de familias creen que están protegidas."**
Familia multigeneracional en un momento cotidiano y confiado en casa (patio, comedor). Ambiente luminoso, cálido, tranquilo. Sensación de normalidad feliz, guardia baja. Plano abierto.

**Frase 2 — "La mayoría lo descubre recién cuando algo sale mal."**
Cambio de tono: un rostro preocupado, mirada baja, alguien mirando el teléfono con inquietud, o una mano sosteniendo otra en una sala de espera. Luz más tenue/lateral. Íntimo, sin dramatismo excesivo, sin sangre ni hospital frío. La tensión se sugiere, no se grita.

**Frase 3 — "La protección real se construye antes."**
Pareja o familia joven planificando: mirando papeles en la mesa, conversando con mate, revisando algo juntos con actitud de decisión serena. Luz clara. Transmite previsión y calma.

**Frase 4 — "Antes de la llamada de madrugada."**
Escena nocturna o de penumbra cálida: alguien despierto de noche, luz de velador, o una madre con un hijo en brazos de madrugada. Tono íntimo, silencioso, contenido. Nada alarmante — vulnerabilidad tranquila.

**Frase 5 — "Antes del diagnóstico difícil."**
Gesto de apoyo humano: un abrazo, una mano sobre el hombro, dos personas juntas mirando hacia adelante. Cálida, esperanzadora dentro de la seriedad. Sin médicos ni consultorios.

**Frase 6 — "Antes de la eterna pregunta: «¿esto lo cubre?»"**
Vida cotidiana familiar y relajada: mate en el patio, sobremesa, charla entre generaciones. Vuelve la calidez y lo doméstico. Gente distendida, sin preocupación.

**Frase 7 — "Salud Protegida es protección que se siente."**
La más cálida y luminosa de todas: familia unida, contacto físico (abrazo, risas reales), luz dorada. Cierre emocional pleno. Idealmente la más fuerte estéticamente porque es la que queda.

Cuando las tengas, subilas acá al chat con el nombre de la frase (o numeradas 1-7) y las coloco al toque. Si alguna te cuesta conseguir, decime y ajustamos la frase o busco una alternativa.

