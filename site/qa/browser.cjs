const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const { chromium }=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(process.env.TROLL_SITE_ROOT||path.join(__dirname,'..')), shots=process.env.TROLL_SCREENSHOTS||path.join(__dirname,'screens');
fs.mkdirSync(shots,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  try{
    const u=new URL(req.url,'http://localhost');
    let name=decodeURIComponent(u.pathname).replace(/^\/troll-factory(?=\/)/,'');
    if(name.endsWith('/'))name+='index.html';
    const file=path.resolve(root,'.'+name);
    if(!file.startsWith(root+'/'))return res.writeHead(404).end();
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
    res.end(fs.readFileSync(file));
  } catch { if(!res.headersSent)res.writeHead(404);res.end(); }
});
const TITLE='#scene-title';
async function weakEvidence(browser){
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  try{
    await page.goto('http://127.0.0.1:'+server.address().port+'/troll-factory/');
    const click=id=>page.locator(id).tap();
    await click('#begin');
    await click('#view-post');await click('#pin-post');
    await click('#view-resident');await click('#pin-resident');
    await page.locator('#relation-choice').selectOption('independent');await click('#compare');
    assert.match(await page.locator('.coverage-tip').innerText(),/full notice with a firsthand check/);
    for (const id of ['notice','library']) assert(await page.locator('#view-'+id+'-from-tip').isVisible());
    for (const id of ['move','cancel','intent']) await page.locator('#claim-'+id).selectOption('unresolved');
    await click('#decide');
    assert.match(await page.locator('.coverage-tip').innerText(),/Still worth checking/);
    await click('#evidence-from-tip');
    await click('#view-notice-from-tip');assert.equal(await page.evaluate(()=>document.activeElement.id),'reader-title');
    await click('#view-library-from-tip');
    assert.equal(await page.locator('.coverage-tip').count(),0);
    await click('#decide');
    assert.equal(await page.locator('.coverage-tip').count(),0);
    await click('#restart');await page.locator('#confirm [value="restart"]').tap();
    await page.waitForSelector('#begin');
    await click('#begin');
    assert.match(await page.locator('.sources .count').innerText(),/0\/4/);
    assert.equal(await page.locator('#decide').count(),0);
    assert.deepEqual(await page.evaluate(()=>[localStorage.length,sessionStorage.length]),[0,0]);
    console.log('390 weak-evidence recovery, optional decision, restart and no browser storage PASS');
  } finally {await page.close();}
}
async function play(browser,width,{phone=false,offline=false,theme='light',branch='publish',repair='repair',keyboard=false,full=false}={}){
  const ctx=await browser.newContext({viewport:{width,height:width===1280?650:844},hasTouch:phone,isMobile:phone,colorScheme:theme,reducedMotion:'reduce',offline});
  const page=await ctx.newPage();
  page.setDefaultTimeout(5000);
  const errors=[],requests=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('request',r=>requests.push(r.url()));
  page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push('HTTP '+r.url());});
  const file=pathToFileURL(path.join(root,'index.html')).href;
  const base='http://127.0.0.1:'+server.address().port+'/troll-factory/';
  const active=()=> page.evaluate(()=>document.activeElement.id);
  const visible=id=>page.locator(id).isVisible();
  const read=id=>page.locator(id).innerText();
  const tap=async id=>{
    const el=page.locator(id);
    if(phone)await el.tap();
    else if(keyboard){ await el.focus(); await page.keyboard.press('Enter');}
    else await el.click();
  };
  const fit=async()=>{
    assert(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1),width+' horizontal overflow');
    assert(await page.evaluate(()=>Array.from(document.querySelectorAll('button:not([hidden])')).filter(x=>x.offsetWidth&&x.offsetHeight).every(x=>x.getBoundingClientRect().height>=44)));
  };
  const shot=async(name)=>{if(full)await page.screenshot({path:path.join(shots,width+'-'+theme+'-'+name+'.png'),fullPage:false});};
  await page.goto(offline?file:base);
  assert.match(await read(TITLE),/The Harbor\s*Hall Tip/);
  assert(await page.locator('.map img').evaluate(img=>img.complete&&img.naturalWidth===840));
  assert.match(await read('.map figcaption'),/Case illustration/);
  const contrast=await page.evaluate(()=>{
    const style=getComputedStyle(document.documentElement);
    const luminance=name=>{
      const hex=style.getPropertyValue('--'+name).trim().slice(1);
      const rgb=hex.match(/../g).map(channel=>parseInt(channel,16)/255);
      return rgb.reduce((acc,val,i)=>acc+[.2126,.7152,.0722][i]*(val<=.04045?val/12.92:((val+.055)/1.055)**2.4),0);
    };
    return [['ink','bg'],['muted','bg'],['muted','paper'],['amber','paper'],['amber','bg'],['green','paper'],['green','soft'],['on-dark','dark']].map(pair=>{
      const [dark,light]=pair.map(luminance).sort((a,b)=>a-b);
      return {pair,ratio:(light+.05)/(dark+.05)};
    });
  });
  contrast.forEach(({pair,ratio})=>assert(ratio>=4.5,`${theme} ${pair.join('/')} contrast: ${ratio.toFixed(2)}`));
  await fit(); await shot('brief');
  if(keyboard){
    await page.keyboard.press('Tab'); assert.equal(await active(),'');
    await page.keyboard.press('Enter'); assert.equal(await active(),'desk');
    await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
  } else await tap('#begin');
  assert.match(await read(TITLE),/evidence show/);
  assert.equal(await active(),'scene-title');
  assert.equal(await visible('#decide'),false);
  await fit();
  await tap('#view-post');assert.match(await read('#source-reader'),/attached image ends/);
  if(phone)assert.equal(await active(),'reader-title');
  await tap('#trace-post');assert.equal(await active(),'origin-note');
  assert.match(await read('#origin-note'),/part of the town clerk/);
  await tap('#pin-post');
  await tap('#view-notice');await tap('#pin-notice');
  assert.equal(await page.locator('#source-reader').getAttribute('data-source-kind'),'paper');
  assert.match(await read('.evidence-document .byline'),/public register/);
  assert.match(await read('.evidence-document blockquote'),/Tide Library/);
  await fit();await shot('evidence');
  if(await page.locator('#trace-notice-in-compare').count()) {
    assert.equal(await visible('#pair-origin-notice'),false);
    await tap('#view-resident');
    await tap('#trace-notice-in-compare');
    assert.equal(await active(),'pair-origin-notice');
    assert.match(await read('#pair-origin-notice'),/original register entry/i);
    assert.match(await read('#source-reader'),/resident/i);
    assert.equal(await visible('#trace-notice-in-compare'),false);
    await tap('#view-notice');assert.match(await read('#origin-note'),/original register entry/i);
  } else {
    assert(process.env.TROLL_SITE_ROOT, 'main must offer tracing from pinned exhibits');
    await tap('#trace-notice');assert.match(await read('#origin-note'),/original register entry/i);
  }
  await page.locator('#relation-choice').selectOption('independent');await tap('#compare');
  assert.match(await read('#comparison-feedback'),/Recheck: One origin repeated/);
  await tap('#view-library');await tap('#trace-library');await tap('#pin-library');
  assert.equal(await visible('#decide'),false,'new evidence pair requires its own comparison');
  await page.locator('#relation-choice').selectOption('independent');await tap('#compare');
  assert.match(await read('#comparison-feedback'),/Right: Independent accounts/);
  await fit();await shot('compare');
  await page.locator('#claim-move').selectOption('supported');
  await page.locator('#claim-cancel').selectOption('misleading');
  assert.equal(await page.locator('#decide').isDisabled(),true);
  await page.locator('#claim-intent').selectOption('unresolved');
  await tap('#decide'); assert.match(await read(TITLE),/What goes in the feed/);
  assert.equal(await page.locator('#commit').isDisabled(),true);
  if(keyboard){await page.locator('#choose-'+branch).focus();await page.keyboard.press('Space');}
  else if(phone) await page.locator('.choice').filter({has:page.locator('#choose-'+branch)}).tap();
  else await page.locator('.choice').filter({has:page.locator('#choose-'+branch)}).click();
  await tap('#evidence');
  assert.equal(await page.locator('#claim-intent').inputValue(),'unresolved');
  await tap('#decide');assert.equal(await page.locator('#choose-'+branch).isChecked(),true);
  await fit();await shot('decision');
  await tap('#commit');
  assert.match(await read(TITLE),{publish:/change their plans/,qualify:/place to go/,hold:/No wrong alert/}[branch]);
  assert.match(await read('.followup'),/17:18/);await fit();await shot('review');
  if(keyboard){await tap('#restart');await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#confirm').open);assert.equal(await active(),'restart');}
  else{await tap('#restart');await page.locator('#confirm [value="cancel"]').click();await page.waitForFunction(()=>!document.querySelector('#confirm').open);}
  await tap('#followup-'+repair);
  assert.match(await read(TITLE),/Read the record/);
  assert.match(await read('.debrief-record'),repair==='wait'?/unchanged|accurate|no verified directions|latest thing/:/correction|confirmation arrived|finally have|later confirmation/i);
  assert.match(await read('.transfer'),/museum/);
  assert.equal(await visible('#transfer-results'),false);
  await page.locator('#transfer-museum-year').selectOption('misleading');
  await page.locator('#transfer-museum-count').selectOption('misleading');
  assert.equal(await page.locator('#check').isDisabled(),true);
  await page.locator('#transfer-museum-cause').selectOption('unresolved');
  await tap('#check');
  assert.equal(await active(),'transfer-results');
  assert.match(await read('#transfer-results'),/You chose: Misleading/);
  assert.equal(await page.locator('#transfer-results .result-tag.pass').count(),2);
  await fit();await shot('transfer');
  await page.locator('a[href="takeaway.html"]').click();
  assert.match(await read('h1'),/honestly report/);
  await page.locator('a[href="index.html"]').click();
  await page.locator('.teacher-link').click();assert.match(await read('h1'),/Harbor Hall/);
  if(!offline)assert(requests.every(x=>x.startsWith(base)),requests.join('\n'));
  if(offline)assert(requests.every(x=>x.startsWith(pathToFileURL(root).href)),requests.join('\n'));
  assert.deepEqual(errors,[]);
  console.log(width,theme,offline?'offline file://':keyboard?'keyboard':'native browser',branch+'→'+repair,'PASS');
  await ctx.close();
}
async function appearance(browser,{offline=false,width=320}={}) {
  const ctx=await browser.newContext({viewport:{width,height:790},colorScheme:'dark',offline});
  const page=await ctx.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  const url=offline?pathToFileURL(path.join(root,'index.html')).href:'http://127.0.0.1:'+server.address().port+'/troll-factory/';
  const mode=page.getByRole('combobox',{name:'Appearance'});
  const scheme=()=>page.evaluate(()=>getComputedStyle(document.documentElement).colorScheme);
  try {
    await page.goto(url);
    assert.equal(await mode.inputValue(),'system');
    assert.equal(await scheme(),'dark');
    await page.emulateMedia({colorScheme:'light'});
    assert.equal(await scheme(),'light');
    await page.locator('#begin').click();
    await page.locator('#view-notice').click();
    await page.locator('#pin-notice').click();
    await mode.focus();
    await mode.press('End');
    assert.equal(await mode.inputValue(),'dark');
    assert.equal(await scheme(),'dark');
    assert.match(await page.locator('#source-reader').innerText(),/Tide Library/);
    assert.equal(await page.locator('#pin-notice').getAttribute('aria-pressed'),'true');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1), 'appearance control causes horizontal overflow');
    await page.screenshot({path:path.join(shots,'appearance-'+width+'-dark.png')});
    await page.locator('.teacher-link').click();
    assert.match(page.url(),/teacher\.html\?theme=dark$/);
    assert.equal(await mode.inputValue(),'dark');
    assert.equal(await scheme(),'dark');
    await mode.selectOption('light');
    await page.emulateMedia({colorScheme:'dark'});
    assert.equal(await scheme(),'light');
    await page.getByRole('link',{name:/printable student takeaway/i}).click();
    assert.equal(await mode.inputValue(),'light');
    assert.equal(await scheme(),'light');
    await mode.selectOption('system');
    assert.equal(await scheme(),'dark');
    await page.getByRole('link',{name:/Back to the case/}).click();
    assert.equal(await mode.inputValue(),'system');
    assert.equal(new URL(page.url()).searchParams.has('theme'),false);
    assert.deepEqual(await page.evaluate(()=>[localStorage.length,sessionStorage.length]),[0,0]);
    if(!offline) {
      await mode.selectOption('dark');
      assert.equal(new URL(page.url()).searchParams.get('theme'),'dark');
      await page.reload();
      assert.equal(await mode.inputValue(),'dark');
      assert.equal(await scheme(),'dark');
    }
    assert.deepEqual(errors,[]);
    console.log(width,offline?'file://':'HTTP','appearance toggles, OS changes, carried links and no storage PASS');
  } finally { await ctx.close(); }
}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
    await play(b,1440,{branch:'publish',full:true});
    await play(b,390,{phone:true,branch:'qualify',full:true});
    await play(b,320,{phone:true,theme:'dark',branch:'hold',full:true});
    await play(b,1280,{keyboard:true,branch:'publish',repair:'wait',full:true});
    await play(b,390,{offline:true,phone:true,branch:'hold',repair:'wait'});
    await play(b,768,{theme:'dark',branch:'qualify',repair:'wait',full:true});
    await play(b,1920,{theme:'dark',branch:'hold',full:true});
    await weakEvidence(b);
    await appearance(b);
    await appearance(b,{offline:true,width:390});
  } finally {await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
