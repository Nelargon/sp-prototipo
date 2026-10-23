// Static catalog in CI; browser behavior when called with the built site URL.
// PW_PATH and PW_CHROME follow the other QA scripts. No dependencies in the repo.
import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const LAB=join(ROOT,'public/blog/laboratorio');
const catalog=JSON.parse(readFileSync(join(LAB,'catalogo.json'),'utf8'));
const ids=new Set(),assets=new Set();
for(const a of catalog.articles){
  assert.match(a.id,/^[a-z-]+$/);assert.equal(a.variants.length,3);
  assert.ok(a.title&&a.slug&&a.concept&&a.limit);
  for(const v of a.variants){
    assert.ok(!ids.has(v.id));ids.add(v.id);assert.ok(catalog.styles[v.style]);
    assert.equal(v.src,v.versions.find(r=>v.id===`${a.id}-${v.style}-v${r.revision}`)?.src);
    for(const src of [v.thumbnail,...v.versions.map(r=>r.src)]){
      assert.match(src,/^assets\/[a-z0-9-]+\.webp$/);
      assert.ok(existsSync(join(LAB,src)),src);assets.add(src);
    }
  }
}
console.log(`✓ catálogo: ${catalog.articles.length} artículos · ${ids.size} propuestas · ${assets.size} recursos`);
if(process.argv.includes('--datos'))process.exit(0);

const module=await import(process.env.PW_PATH||'playwright-core');
const {chromium}=module.default??module;
const browser=await chromium.launch({executablePath:process.env.PW_CHROME||'/opt/pw-browsers/chromium',args:['--no-sandbox']});
const base=(process.argv[2]||'http://127.0.0.1:8768/sp-prototipo').replace(/\/$/,'');
const url=base+'/blog/laboratorio/';
const output=process.env.LAB_QA_OUTPUT||'/tmp/sp-laboratorio-qa';mkdirSync(output,{recursive:true});
const context=await browser.newContext({viewport:{width:1280,height:1000}});
const page=await context.newPage();const errors=[],badResponses=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)badResponses.push({url:r.url(),status:r.status()})});
const report={viewports:[],imageViews:0,versions:0,errors,badResponses};
async function ready(){await page.waitForSelector('#lab:not([hidden])');await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>[...document.querySelectorAll('#options img')].every(i=>i.complete&&i.naturalWidth>0));}
try{
  await page.goto(url);await ready();
  for(const width of [360,390,430,1280]){
    await page.setViewportSize({width,height:1000});
    for(const a of catalog.articles){
      await page.selectOption('#article-select',a.id);await ready();
      assert.equal(await page.locator('#article-title').innerText(),a.title);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width,`overflow ${a.id} ${width}`);
      for(const crop of ['square','wide']){
        await page.click(`[data-crop="${crop}"]`);
        assert.ok(await page.locator('.art-button').evaluateAll((els,expected)=>els.every(e=>Math.abs(e.clientWidth/e.clientHeight-expected)<.02),crop==='square'?1:2));
      }
      if(width===390&&a.id==='manos')await page.locator('#comparacion').screenshot({path:join(output,'laboratorio-movil.png')});
    }
    report.viewports.push({width,articles:catalog.articles.length,overflow:false});
  }
  for(const a of catalog.articles){
    await page.selectOption('#article-select',a.id);await ready();
    const noteResponse=await context.request.get(base+'/blog/'+a.slug+'/');assert.equal(noteResponse.status(),200,`nota ${a.id}`);
    for(const v of a.variants){
      await page.click(`[data-open="${v.id}"]`);
      for(const ratio of ['2','1.7777777778','1']){
        await page.click(`[data-ratio="${ratio}"]`);
        await page.waitForFunction(()=>document.querySelector('#large-image').complete&&document.querySelector('#large-image').naturalWidth>0);
        assert.ok(await page.locator('#image-frame').evaluate((e,r)=>Math.abs(e.clientWidth/e.clientHeight-Number(r))<.02,ratio));
        report.imageViews++;
      }
      for(let i=0;i<v.versions.length;i++){
        if(v.versions.length>1)await page.selectOption('#image-version',String(i));
        await page.waitForFunction(()=>document.querySelector('#large-image').complete&&document.querySelector('#large-image').naturalWidth>0);
        assert.ok((await page.locator('#large-image').getAttribute('src')).endsWith(v.versions[i].src));
        assert.equal(await page.locator('#download-image').getAttribute('href'),v.versions[i].src);
        report.versions++;
      }
      if(a.id==='escuela'&&v.style==='papel'){
        const pending=page.waitForEvent('download');await page.click('#download-image');
        assert.equal((await pending).suggestedFilename(),'escuela-papel-v2.webp');
      }
      await page.keyboard.press('Escape');
      assert.ok(await page.locator(`[data-open="${v.id}"]`).evaluate(e=>e===document.activeElement));
    }
  }
  // More than one favorite per article, cross-article notes and reload persistence.
  await page.selectOption('#article-select','manos');await page.click('[data-favorite="manos-trazo-v1"]');await page.click('[data-favorite="manos-papel-v1"]');
  await page.fill('#article-notes','Me gustan ambas. Revisar el jabón.');
  await page.selectOption('#article-select','escuela');await page.fill('#article-notes','Conservar el gesto mínimo.');
  await page.reload();await ready();assert.equal(await page.inputValue('#article-notes'),'Conservar el gesto mínimo.');
  await page.selectOption('#article-select','manos');assert.equal(await page.inputValue('#article-notes'),'Me gustan ambas. Revisar el jabón.');
  assert.equal(await page.locator('[data-favorite][aria-pressed="true"]').count(),2);
  const exporting=page.waitForEvent('download');await page.click('#export-selection');
  const exported=JSON.parse(readFileSync(await (await exporting).path(),'utf8'));
  assert.deepEqual(exported.favorites,['manos-trazo-v1','manos-papel-v1']);assert.ok(exported.summary.includes('Conservar el gesto mínimo.'));
  await page.setInputFiles('#import-selection',{name:'seleccion.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({schema:1,favorites:['familia-papel-v1','no-existe'],notes:{familia:'Comparar los fondos.'}}))});
  await page.waitForFunction(()=>document.querySelector('#action-status').textContent.includes('importada'));
  assert.equal(await page.locator('.favorite-item').count(),3);
  await page.setInputFiles('#import-selection',{name:'mal.json',mimeType:'application/json',buffer:Buffer.from('{')});
  await page.waitForFunction(()=>document.querySelector('#action-status').textContent.includes('No pudimos'));
  assert.equal(await page.locator('.favorite-item').count(),3);
  // Browser history and missing hash recover without an empty screen.
  await page.selectOption('#article-select','dengue');await page.selectOption('#article-select','presion');await page.goBack();assert.equal(await page.inputValue('#article-select'),'dengue');
  await page.goto(url+'#desconocido');await ready();assert.equal(await page.inputValue('#article-select'),'manos');
  // A new image revision must preserve earlier favorites without approving v2.
  await page.evaluate(()=>localStorage.setItem('sp-blog-laboratorio-v1',JSON.stringify({schema:1,favorites:['dengue-trazo-v1'],notes:{dengue:'Conservar la primera comparación.'}})));
  await page.goto(url+'#dengue');await page.reload();await ready();
  assert.equal(await page.locator('#options [data-favorite][aria-pressed="true"]').count(),0);
  for(const style of ['papel','facetada']){
    await page.click(`[data-open="dengue-${style}-v1"]`);
    assert.equal(await page.inputValue('#image-version'),'0');
    assert.ok((await page.locator('#large-image').getAttribute('src')).endsWith(`dengue-${style}-v1.webp`));
    await page.keyboard.press('Escape');
  }
  assert.equal(await page.locator('[data-favorite-open="dengue-trazo-v1"]').count(),1);
  await page.click('[data-favorite-open="dengue-trazo-v1"]');
  assert.equal(await page.inputValue('#image-version'),'0');
  assert.ok((await page.locator('#large-image').getAttribute('src')).endsWith('dengue-trazo-v1.webp'));
  assert.equal(await page.locator('#dialog-favorite').getAttribute('aria-pressed'),'true');
  await page.selectOption('#image-version','2');
  assert.equal(await page.locator('#dialog-favorite').getAttribute('aria-pressed'),'false');
  await page.click('#dialog-favorite');await page.keyboard.press('Escape');
  assert.equal(await page.locator('#options [data-favorite="dengue-trazo-v3"]').getAttribute('aria-pressed'),'true');
  const historyExport=page.waitForEvent('download');await page.click('#export-selection');
  const historyState=JSON.parse(readFileSync(await(await historyExport).path(),'utf8'));
  assert.deepEqual(historyState.favorites,['dengue-trazo-v1','dengue-trazo-v3']);
  assert.ok(historyState.summary.includes('dengue-trazo-v1')&&historyState.summary.includes('dengue-trazo-v3'));
  await page.reload();await ready();assert.equal(await page.locator('.favorite-item').count(),2);
  await page.click('[data-favorite-open="dengue-trazo-v1"]');await page.click('#dialog-favorite');await page.keyboard.press('Escape');
  await page.waitForFunction(()=>document.querySelector('#article-title')===document.activeElement);
  assert.equal(await page.locator('.favorite-item').count(),1);
  assert.equal(await page.locator('[data-favorite-open="dengue-trazo-v3"]').count(),1);
  assert.equal(await page.inputValue('#article-notes'),'Conservar la primera comparación.');
  report.historicalFavorites=true;
  // Clean screenshots for the design archive, with no test selections.
  await page.evaluate(()=>localStorage.removeItem('sp-blog-laboratorio-v1'));await page.reload();await ready();
  await page.setViewportSize({width:1280,height:1000});await page.screenshot({path:join(output,'laboratorio-desktop.png'),fullPage:true});
  for(const a of catalog.articles.filter(a=>a.isNew)){
    await page.selectOption('#article-select',a.id);await ready();await page.locator('#comparacion').screenshot({path:join(output,`comparacion-${a.id}.png`)});
  }
  const denied=await browser.newContext();await denied.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new Error('blocked')}});
  const deniedPage=await denied.newPage();await deniedPage.goto(url);await deniedPage.waitForSelector('#lab:not([hidden])');
  assert.ok((await deniedPage.locator('#save-status').innerText()).includes('no permite guardar'));await denied.close();
  assert.deepEqual(errors,[]);assert.deepEqual(badResponses,[]);
  writeFileSync(join(output,'informe.json'),JSON.stringify(report,null,2));
  console.log(`✓ navegador: ${report.imageViews} recortes, ${report.versions} versiones, 4 anchos, favoritas múltiples, notas, exportación/importación y recuperación`);
}finally{await browser.close()}
