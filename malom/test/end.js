const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1280, height: 800 }, locale: 'hu-HU' })).newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:3000');
  await p.click('#btnLocal');
  await p.fill('#p2Name', 'Anna');
  await p.click('#picker2 .skin[data-skin="kristaly"]');
  await p.click('#p2Dialog button[value=ok]');
  for (let k = 0; k < 500; k++) {
    const st = await p.textContent('#status');
    if (/nyert|Döntetlen/.test(st)) break;
    const acts = await p.$$eval('#board .hit.active', (els) => els.map((e) => e.dataset.i));
    if (!acts.length) break;
    await p.locator(`#board .hit[data-i="${acts[Math.floor(Math.random() * acts.length)]}"]`).click({ force: true });
    if ((await p.textContent('#status')).includes('hová')) {
      const pos = await p.$$eval('#board .hint.target', (els) => els.map((e) => e.getAttribute('cx') + ',' + e.getAttribute('cy')));
      const pick = pos[Math.floor(Math.random() * pos.length)];
      const i = await p.evaluate((pk) => {
        const h = [...document.querySelectorAll('#board .hit')].find((h) => h.getAttribute('cx') + ',' + h.getAttribute('cy') === pk);
        return h.dataset.i;
      }, pick);
      await p.locator(`#board .hit[data-i="${i}"]`).click({ force: true });
    }
  }
  await p.waitForTimeout(1500);
  await p.screenshot({ path: '/tmp/claude-0/shots/end.png' });
  console.log('status', await p.textContent('#status'), '| overlay hidden', await p.$eval('#endOverlay', (e) => e.hidden));
  await p.goto('http://localhost:3000');
  await p.waitForTimeout(800);
  await p.screenshot({ path: '/tmp/claude-0/shots/picker.png', fullPage: true });
  console.log('errors', errs);
  await b.close();
})();
