'use strict';

const $ = (s) => document.querySelector(s);
const esc = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STORAGE = 'sp-blog-laboratorio-v1';
let catalog, article, opened, opener, crop = 'wide';
let favorites = new Set(), notes = {}, canStore = true;
const focus = {medicamentos:25,mellizos:43};

function allVariants() {
  return catalog.articles.flatMap(a => a.variants.map(v => ({...v, article:a})));
}
function allVersions() {
  return allVariants().flatMap(v => v.versions.map((version,index) => ({
    ...v, id:`${v.article.id}-${v.style}-v${version.revision}`, src:version.src,
    thumbnail:version.src===v.src?v.thumbnail:version.src,
    revision:version.revision, versionIndex:index
  })));
}
function cleanState(input) {
  if (!input || input.schema !== 1 || !Array.isArray(input.favorites) || typeof input.notes !== 'object' || input.notes === null) throw Error('Formato de selección no válido.');
  const ids = new Set(allVersions().map(v => v.id));
  const cleanedNotes = {};
  for (const a of catalog.articles) if (typeof input.notes[a.id] === 'string') cleanedNotes[a.id] = input.notes[a.id].slice(0,1000);
  return {favorites:input.favorites.filter(id => typeof id === 'string' && ids.has(id)),notes:cleanedNotes};
}
function state() { return {schema:1,updated:new Date().toISOString(),favorites:[...favorites],notes}; }
function save() {
  try { localStorage.setItem(STORAGE,JSON.stringify(state())); canStore = true; }
  catch { canStore = false; }
  $('#save-status').textContent = canStore
    ? 'Tus favoritas y notas se guardan en este navegador. Podés exportarlas para conservarlas o compartirlas.'
    : 'El navegador no permite guardar estos cambios. Exportá tu selección antes de cerrar la página.';
}
function markFavorite(id) {
  favorites.has(id) ? favorites.delete(id) : favorites.add(id);
  save();
  document.querySelectorAll(`[data-favorite="${id}"]`).forEach(b=>updateFavoriteButton(b,id));
  renderFavorites();
}
function updateFavoriteButton(button,id) {
  const selected = favorites.has(id);
  button.setAttribute('aria-pressed',String(selected));
  button.textContent = selected ? 'En tus favoritas ✓' : 'Guardar favorita';
  button.classList.toggle('secondary',!selected);
  const v=allVersions().find(v=>v.id===id);
  button.setAttribute('aria-label',`${selected?'Quitar de':'Guardar en'} favoritas: ${catalog.styles[v.style].name}, ${v.article.short}, versión ${v.revision}`);
}
function renderFavorites() {
  $('#favorites').innerHTML=allVersions().filter(v=>favorites.has(v.id)).map(v=>`<div class="favorite-item"><button type="button" data-favorite-open="${esc(v.id)}" aria-label="Ampliar ${esc(catalog.styles[v.style].name)} de ${esc(v.article.short)}, versión ${v.revision}"><img src="${esc(v.thumbnail)}" alt="${esc(v.alt)}" loading="lazy" width="768" height="384"><span>${esc(v.article.short)}<br>${esc(catalog.styles[v.style].name)} · v${v.revision}</span></button></div>`).join('');
  $('#selection-title').textContent = favorites.size ? `Tus favoritas · ${favorites.size}` : 'Tus favoritas, sin apuro';
  document.querySelectorAll('[data-favorite-open]').forEach(b=>b.onclick=()=>openImage(b.dataset.favoriteOpen,b));
}
function showArticle(id,scroll=false) {
  article=catalog.articles.find(a=>a.id===id)||catalog.articles[0];
  $('#article-select').value=article.id;
  $('#category').textContent=article.category;
  $('#article-title').textContent=article.title;
  $('#article-description').textContent=article.description;
  $('#article-review').textContent=article.review;
  $('#article-limit').textContent=article.limit;
  $('#article-link').href='../'+article.slug+'/';
  $('#article-notes').value=notes[article.id]||'';
  const index=catalog.articles.indexOf(article);
  $('#previous').disabled=index===0;
  $('#next').disabled=index===catalog.articles.length-1;
  $('#options').innerHTML=article.variants.map(v=>`<section class="option"><h3>${esc(catalog.styles[v.style].name)}</h3><button type="button" class="art-button" data-open="${esc(v.id)}" aria-label="Ampliar ${esc(catalog.styles[v.style].name)}"><img src="${esc(v.thumbnail)}" alt="${esc(v.alt)}" width="768" height="384" style="object-position:${focus[article.id]||50}% 50%"><span class="enlarge" aria-hidden="true">Ampliar</span></button><p class="style-note">${esc(v.description||catalog.styles[v.style].description)}</p><button type="button" class="favorite-control" data-favorite="${esc(v.id)}" aria-pressed="false"></button></section>`).join('');
  document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openImage(b.dataset.open,b));
  document.querySelectorAll('[data-favorite]').forEach(b=>{updateFavoriteButton(b,b.dataset.favorite);b.onclick=()=>markFavorite(b.dataset.favorite)});
  document.querySelectorAll('[data-article]').forEach(b=>b.setAttribute('aria-current',String(b.dataset.article===article.id)));
  if(scroll){$('#comparacion').scrollIntoView({block:'start'});$('#article-title').focus({preventScroll:true});}
}
function navigate(id,scroll=false) {
  history.pushState(null,'','#'+id);
  showArticle(id,scroll);
}
function setRatio(value) {
  const ratio=Number(value);
  $('#image-frame').style.aspectRatio=String(ratio);
  $('#image-frame').classList.toggle('square',ratio===1);
  document.querySelectorAll('[data-ratio]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.ratio)===ratio)));
}
function setImageVersion(index) {
  const v=opened.versions[Number(index)];
  $('#large-image').src=v.src;
  $('#large-image').alt=opened.alt+' '+v.label+'.';
  $('#download-image').href=v.src;
  $('#download-image').download=v.src.split('/').pop();
  $('#dialog-note').textContent=`${v.label} · La descarga conserva la imagen completa.`;
  const favorite=$('#dialog-favorite');
  const id=`${opened.article.id}-${opened.style}-v${v.revision}`;
  favorite.dataset.favorite=id;
  updateFavoriteButton(favorite,id);
  favorite.onclick=()=>markFavorite(id);
}
function openImage(id,button) {
  opened=allVersions().find(v=>v.id===id);if(!opened)return;
  opener=button;
  $('#dialog-title').textContent=catalog.styles[opened.style].name;
  $('#dialog-article').textContent=opened.article.title;
  $('#image-version').innerHTML=opened.versions.map((v,i)=>`<option value="${i}">${esc(v.label)}</option>`).join('');
  $('#version-picker').hidden=opened.versions.length===1;
  $('#image-version').value=opened.versionIndex;
  $('#large-image').style.objectPosition=`${focus[opened.article.id]||50}% 50%`;
  setImageVersion(opened.versionIndex);setRatio(crop==='square'?1:2);
  $('#image-dialog').showModal();
}
function selectionText() {
  const lines=['Laboratorio de imágenes · Salud Protegida'];
  for(const a of catalog.articles){
    const selected=allVersions().filter(v=>v.article.id===a.id&&favorites.has(v.id));
    if(!selected.length&&!notes[a.id])continue;
    lines.push('',a.title);
    if(selected.length)lines.push('Favoritas: '+selected.map(v=>catalog.styles[v.style].name+' ('+v.id+')').join(', '));
    if(notes[a.id])lines.push('Nota: '+notes[a.id]);
  }
  if(lines.length===1)lines.push('Todavía no hay favoritas ni notas.');
  return lines.join('\n');
}
async function init() {
  const response=await fetch('catalogo.json');
  if(!response.ok)throw Error('No pudimos cargar las propuestas.');
  catalog=await response.json();
  try { const saved=localStorage.getItem(STORAGE);if(saved){const s=cleanState(JSON.parse(saved));favorites=new Set(s.favorites);notes=s.notes;} }
  catch { canStore=false; }
  $('#inventory').textContent=`${catalog.articles.length} artículos · ${allVariants().length} propuestas · ${allVersions().length} versiones`;
  $('#article-select').innerHTML=['Nueva tanda','Exploraciones anteriores'].map((name,i)=>`<optgroup label="${name}">${catalog.articles.filter(a=>a.isNew===(i===0)).map(a=>`<option value="${esc(a.id)}">${esc(a.short)}</option>`).join('')}</optgroup>`).join('');
  $('#article-library').innerHTML=catalog.articles.map(a=>{const v=a.variants.find(v=>v.style==='papel')||a.variants[0];return `<a class="article-tile" href="#${esc(a.id)}" data-article="${esc(a.id)}" aria-current="false"><img src="${esc(v.thumbnail)}" alt="" loading="lazy" width="112" height="78"><div><h3>${esc(a.short)}</h3><small>${a.isNew?'Nueva tanda':'Ya revisado'} · 3 estilos</small></div></a>`}).join('');
  document.querySelectorAll('[data-article]').forEach(b=>b.onclick=e=>{e.preventDefault();navigate(b.dataset.article,true)});
  $('#article-select').onchange=e=>navigate(e.target.value);
  $('#previous').onclick=()=>navigate(catalog.articles[catalog.articles.indexOf(article)-1].id);
  $('#next').onclick=()=>navigate(catalog.articles[catalog.articles.indexOf(article)+1].id);
  window.addEventListener('hashchange',()=>showArticle(location.hash.slice(1)));
  window.addEventListener('popstate',()=>showArticle(location.hash.slice(1)));
  document.querySelectorAll('[data-crop]').forEach(b=>b.onclick=()=>{crop=b.dataset.crop;$('#options').classList.toggle('square',crop==='square');document.querySelectorAll('[data-crop]').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.crop===crop)))});
  $('#article-notes').oninput=e=>{notes[article.id]=e.target.value;save()};
  $('#close-dialog').onclick=()=>$('#image-dialog').close();
  $('#image-dialog').addEventListener('close',()=>{
    const target=opener?.isConnected?opener:document.querySelector(`[data-favorite-open="${opener?.dataset.favoriteOpen}"]`)||$('#article-title');
    target?.focus({preventScroll:true});
  });
  $('#image-dialog').addEventListener('click',e=>{if(e.target===$('#image-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
  $('#image-version').onchange=e=>setImageVersion(e.target.value);
  document.querySelectorAll('[data-ratio]').forEach(b=>b.onclick=()=>setRatio(b.dataset.ratio));
  $('#export-selection').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({...state(),summary:selectionText()},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='SP-seleccion-laboratorio.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#action-status').textContent='Selección exportada. Podés importarla en otro navegador o compartir el archivo.'};
  $('#copy-selection').onclick=async()=>{try{await navigator.clipboard.writeText(selectionText());$('#action-status').textContent='Resumen copiado. Podés pegarlo en el chat para seguir decidiendo.'}catch{$('#action-status').textContent='No se pudo copiar el resumen. Usá «Exportar selección» para guardarlo.'}};
  $('#import-trigger').onclick=()=>$('#import-selection').click();
  $('#import-selection').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>100000)throw Error('Archivo demasiado grande.');const incoming=cleanState(JSON.parse(await f.text()));incoming.favorites.forEach(id=>favorites.add(id));Object.assign(notes,incoming.notes);save();showArticle(article.id);renderFavorites();$('#action-status').textContent='Selección importada y combinada con tus favoritas actuales.'}catch{$('#action-status').textContent='No pudimos importar ese archivo. Elegí una selección JSON exportada por este laboratorio.'}finally{e.target.value=''}};
  renderFavorites();showArticle(location.hash.slice(1));save();
  $('#loading').hidden=true;$('#lab').hidden=false;
}
init().catch(()=>{$('#loading').textContent='No pudimos cargar las propuestas. Recargá la página para volver a intentar.';$('#inventory').textContent='Laboratorio de imágenes';});
