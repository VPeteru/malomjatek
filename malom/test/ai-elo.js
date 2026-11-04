// Böngészőteszt: Élő-csúszka, gép háttérszálon, kategóriás figuraválasztó, háttérzene beállítás
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const p = await (await b.newContext({ viewport: { width: 1280, height: 900 }, locale: 'hu-HU' })).newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:3000');
  await p.click('#picker .cat-chips button[data-cat="orszagok"]');
  await p.click('#picker .skin[data-skin="f-hu"]');
  console.log('my skin:', await p.textContent('#mySkinName'));
  await p.click('#btnAI');
  await p.locator('#eloRange').fill('3000');
  await p.waitForTimeout(100);
  console.log('elo label:', await p.textContent('#eloValue'), await p.textContent('#eloName'));
  await p.screenshot({ path: '/tmp/claude-0/shots/ai-dialog.png' });
  await p.click('#aiDialog button[value=ok]');
  console.log('mode:', await p.textContent('#modeLabel'));
  const t0 = Date.now();
  await p.locator('#board .hit[data-i="4"]').click({ force: true });
  // a gép válaszára várunk; közben a UI-nak reagálnia kell
  let frames = 0;
  const fr = p.evaluate(() => new Promise((r) => { let n = 0; const t = performance.now(); (function f() { n++; if (performance.now() - t < 1500) requestAnimationFrame(f); else r(n); })(); }));
  frames = await fr;
  await p.waitForFunction(() => /Te jössz/.test(document.getElementById('status').textContent), null, { timeout: 8000 });
  console.log('AI replied in', Date.now() - t0, 'ms; frames during think:', frames);
  await p.screenshot({ path: '/tmp/claude-0/shots/ai-game-flag.png' });
  // két játékos dialógus kategóriákkal
  await p.click('#btnMenu');
  await p.click('#btnLocal');
  await p.click('#picker2 .cat-chips button[data-cat="foci"]');
  await p.click('#picker2 .skin[data-skin="m-labda"]');
  await p.screenshot({ path: '/tmp/claude-0/shots/p2-dialog.png' });
  await p.click('#p2Dialog button[value=ok]');
  console.log('p1 name:', (await p.textContent('#panel1 .pl-meta')).trim());
  console.log('ERR', errs);
  await b.close();
})();
