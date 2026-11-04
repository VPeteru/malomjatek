const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const errs=[];
  const mk = async (w,h)=>{const c=await b.newContext({viewport:{width:w,height:h},locale:'hu-HU'});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});return p;};
  const dir=process.argv[2];
  const a = await mk(1400,900);
  await a.goto('http://localhost:3000');
  await a.waitForTimeout(3500);
  await a.screenshot({path:dir+'/home.png'});
  await a.screenshot({path:dir+'/home-full.png',fullPage:true});
  // online
  await a.fill('#nameInput','Péter');
  await a.click('#btnCreate');
  await a.waitForSelector('#lobby:not([hidden])');
  const code = (await a.textContent('#roomCode')).trim();
  await a.screenshot({path:dir+'/lobby.png'});
  const bp = await mk(390,844);
  await bp.goto('http://localhost:3000/?szoba='+code);
  await bp.waitForSelector('#joinDialog[open]');
  await bp.click('#btnJoin');
  await a.waitForSelector('#game:not([hidden])');
  await bp.waitForSelector('#game:not([hidden])');
  const click = async (p,i)=>{await p.locator(`#board .hit[data-i="${i}"]`).click({force:true}); await p.waitForTimeout(250);};
  // A: 0,1,2 mill; B: 9,10
  await click(a,0); await click(bp,9); await click(a,1); await click(bp,10); await click(a,2);
  await a.waitForTimeout(300);
  console.log('status A:', await a.textContent('#status'));
  await a.screenshot({path:dir+'/game-mill.png'});
  await click(a,9);
  await bp.waitForTimeout(600);
  console.log('status B:', await bp.textContent('#status'));
  console.log('B onboard text:', await bp.locator('#panel1 .pl-stats').textContent());
  await bp.screenshot({path:dir+'/game-mobile.png',fullPage:true});
  // illegal by B out of turn? B's turn now; A tries
  await click(a,5);
  console.log('A after illegal:', await a.textContent('#status'));
  // AI mode on new page
  const c = await mk(1280,800);
  await c.goto('http://localhost:3000');
  await c.click('#btnAI'); await c.click('#aiDialog button[value=ok]');
  for (const i of [4,10,13,19,0,2]) { await c.locator(`#board .hit[data-i="${i}"]`).click({force:true}); await c.waitForTimeout(1300); }
  await c.evaluate(()=>{document.getElementById('boardFrame').dataset.theme='neon'});
  await c.waitForTimeout(400);
  await c.screenshot({path:dir+'/ai-neon.png'});
  await c.evaluate(()=>{document.getElementById('boardFrame').dataset.theme='marvany'});
  await c.screenshot({path:dir+'/ai-marvany.png'});
  console.log('AI status:', await c.textContent('#status'));
  console.log('ERRORS:', JSON.stringify(errs));
  await b.close();
})();
