import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const root=process.cwd(),lab=resolve(root,'public/blog/laboratorio');
const data=JSON.parse(readFileSync(resolve(lab,'grillas.json'))),catalog=JSON.parse(readFileSync(resolve(lab,'catalogo.json')));
const favorites=JSON.parse(readFileSync(resolve(root,'docs/diseno/fuentes/2026-10-24-grillas/favoritas-compartidas.json'))).favorites;
assert.equal(favorites.length,32);assert.equal(new Set(data.order).size,12);
for(const o of data.options)for(const id of data.order){assert.ok(catalog.articles.some(a=>a.id===id));if(o.images){assert.ok(favorites.includes(o.images[id]),o.images[id]);assert.ok(catalog.articles.find(a=>a.id===id).variants.some(v=>v.id===o.images[id]));}else{assert.ok(data.currentCovers[id]);assert.ok(!/<script|onerror|onload/i.test(data.currentCovers[id]));}}
console.log('✓ Cuatro vistas de doce artículos; las 36 propuestas usan favoritas compartidas');
if(process.argv.includes('--datos'))process.exit(0);
const {chromium}=await import(process.env.PW_PATH||'/workspace/node_modules/playwright/index.mjs');const browser=await chromium.launch({executablePath:process.env.PW_CHROME||'/usr/bin/chromium',args:['--no-sandbox']});
const output=process.env.GRID_QA_OUTPUT||'/tmp/sp-grillas-qa';mkdirSync(output,{recursive:true});
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+': '+r.status());});
const base=process.argv[2]||'http://127.0.0.1:8768/sp-prototipo';const url=base+'/blog/laboratorio/grillas.html';const measurements=[];
try{
 await page.goto(url+'#c');await page.waitForSelector('.grid-card');await page.evaluate(()=>localStorage.setItem('sp-blog-laboratorio-v1',JSON.stringify({schema:1,favorites:['dengue-papel-v1'],notes:{}})));
 for(const width of [360,390,430,1280]){
  await page.setViewportSize({width,height:900});
  for(const o of data.options){await page.locator(`[data-choice="${o.id}"]`).click();await page.waitForFunction(id=>document.querySelector(`[data-choice="${id}"]`).getAttribute('aria-pressed')==='true',o.id);
   assert.equal(await page.locator('.grid-card').count(),12);assert.deepEqual(await page.locator('.grid-card').evaluateAll(cards=>cards.map(c=>c.dataset.article)),data.order);
   await page.locator('.grid-card').last().scrollIntoViewIfNeeded();await page.evaluate(()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');});await page.waitForFunction(()=>[...document.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0));await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   measurements.push({width,option:o.id,gridHeight:await page.locator('#grid').evaluate(e=>Math.round(e.getBoundingClientRect().height)),cards:12});
   if(width===390||width===1280)await page.locator('#preview').screenshot({path:resolve(output,`${o.id}-${width}.png`)});
  }
 }
 await page.locator('[data-choice="c"]').click();await page.locator('#show-styles').check();assert.equal(await page.locator('.style-caption:visible').count(),12);
 await page.click('#copy-grid');assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/C · Ilustración y fotografía/);
 await page.reload();await page.waitForSelector('.grid-card');assert.equal(await page.locator('[data-choice="c"]').getAttribute('aria-pressed'),'true');
 assert.deepEqual(JSON.parse(await page.evaluate(()=>localStorage.getItem('sp-blog-laboratorio-v1'))).favorites,['dengue-papel-v1']);
 await page.goto(url+'#desconocido');await page.waitForSelector('.grid-card');assert.equal(await page.locator('[data-choice="c"]').getAttribute('aria-pressed'),'true');
 assert.deepEqual(errors,[]);writeFileSync(resolve(output,'qa.json'),JSON.stringify({measurements,errors,copy:true,hash:true,favoritesPreserved:true},null,2)+'\n');console.log('✓ Cuatro anchos, imágenes cargadas, estilos, copia, enlaces directos y favoritas preservadas');
}finally{await browser.close();}
