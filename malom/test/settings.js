const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
const ctx=await b.newContext({viewport:{width:1280,height:900},locale:'hu-HU'});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:3000');await p.waitForTimeout(500);
await p.click('#btnHomeSettings');await p.waitForTimeout(500);
await p.screenshot({path:'/tmp/claude-0/shots/set-board.png'});
await p.click('#themeGrid .theme-card[data-theme="lava"]');
await p.click('#tabSound');await p.waitForTimeout(200);
await p.click('#styleGrid .style-card:nth-child(3)');
await p.selectOption('#eventList .event-row:nth-child(5) select','rajzfilm');
await p.locator('#eventList .event-row:nth-child(5) input').fill('40');
for(let i=1;i<=10;i++) await p.click(`#eventList .event-row:nth-child(${i}) .play`);
await p.screenshot({path:'/tmp/claude-0/shots/set-sound.png',fullPage:false});
await p.click('#btnSettingsClose');
console.log('stored', await p.evaluate(()=>localStorage.getItem('malom-sound-v2')));
console.log('hero theme', await p.getAttribute('#heroBoard','data-theme'));
await p.click('#btnAI');await p.click('#aiDialog button[value=ok]');
for (const i of [4,10,13]) { await p.locator(`#board .hit[data-i="${i}"]`).click({force:true}); await p.waitForTimeout(900); }
await p.screenshot({path:'/tmp/claude-0/shots/game-lava.png'});
for (const t of ['pergamen','pixel','ur','kiralyi','filc','jeg','homok']) { await p.evaluate(t=>{document.getElementById('boardFrame').dataset.theme=t},t); await p.locator('#boardFrame').screenshot({path:`/tmp/claude-0/shots/t-${t}.png`, scale:'css'}); }
const m=await (await b.newContext({viewport:{width:390,height:844},locale:'hu-HU'})).newPage();m.on('pageerror',e=>errs.push(e.message));
await m.goto('http://localhost:3000');await m.click('#btnHomeSettings');await m.click('#tabSound');await m.waitForTimeout(200);
await m.screenshot({path:'/tmp/claude-0/shots/set-mobile.png'});
console.log('ERR',errs);await b.close();})();
