'use strict';
(async()=>{
 const $=s=>document.querySelector(s);let data,catalog,current;
 const text=(tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;e.textContent=value;return e;};
 const render=()=>{
  current=data.options.find(o=>o.id===location.hash.slice(1))||data.options.find(o=>o.id==='c');
  for(const b of $('#choices').children)b.setAttribute('aria-pressed',String(b.dataset.choice===current.id));
  $('#rationale').textContent=current.description;$('#grid').replaceChildren();
  for(const id of data.order){
   const a=catalog.articles.find(a=>a.id===id);const v=current.images&&a.variants.find(v=>v.id===current.images[id]);
   const card=text('article','grid-card','');card.dataset.article=id;const cover=text('div','cover','');
   if(!v){cover.innerHTML=data.currentCovers[id];}else{
    const img=new Image();img.src=v.thumbnail;img.alt='';img.width=768;img.height=384;img.loading='lazy';cover.append(img);
    // The same signature used by app/blog/Cover.jsx; this is a layout overlay, not a changed image.
    const source=document.createElement('template');source.innerHTML=data.currentCovers[id];const signature=source.content.querySelector('div[aria-hidden="true"]');
    if(signature)cover.append(signature.cloneNode(true));
   }
   const copy=text('div','card-copy','');copy.append(text('p','card-category',a.category));
   const h=text('h3','','');const link=text('a','',a.title);link.href='../'+a.slug+'/';h.append(link);copy.append(h,text('p','card-description',a.description));
   const footer=text('div','card-footer','');const date=new Intl.DateTimeFormat('es-PY',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(a.date+'T12:00:00Z'));footer.append(text('span','',date));const read=text('a','','Leer →');read.href=link.href;read.setAttribute('aria-label','Leer: '+a.title);footer.append(read);copy.append(footer);
   copy.append(text('p','style-caption',v?catalog.styles[v.style].name:'Portada actual'));card.append(cover,copy);$('#grid').append(card);
  }
  $('#copy-grid').disabled=false;$('#status').textContent='';
 };
 try{
  [catalog,data]=await Promise.all(['catalogo.json','grillas.json'].map(async path=>{const r=await fetch(path);if(!r.ok)throw Error();return r.json();}));
  for(const o of data.options){const b=text('button','',o.name);b.type='button';b.dataset.choice=o.id;b.addEventListener('click',()=>{if(location.hash==='#'+o.id)return;location.hash=o.id;});$('#choices').append(b);}
  window.addEventListener('hashchange',render);$('#show-styles').addEventListener('change',e=>$('#grid').classList.toggle('show-styles',e.target.checked));
  $('#copy-grid').addEventListener('click',async()=>{const summary=['Laboratorio de imágenes · Salud Protegida',current.name,current.description,'',...data.order.map(id=>{const a=catalog.articles.find(a=>a.id===id);return a.title+'\n'+(current.images?.[id]||'Portada actual');})].join('\n');try{await navigator.clipboard.writeText(summary);$('#status').textContent='Propuesta copiada. Podés pegarla en el chat y sumar tus ajustes.';}catch{const area=document.createElement('textarea');area.value=summary;area.readOnly=true;area.setAttribute('aria-label','Resumen para copiar');$('#status').replaceChildren(text('span','','Copiá este resumen:'),area);area.select();}});
  render();
 }catch{$('#status').textContent='No pudimos cargar las combinaciones. Recargá la página para volver a intentar.';}
})();
