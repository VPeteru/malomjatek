/* Fejlesztői indító: elindítja a szervert, és pár másodpercenként lehúzza a
   GitHubról az új változásokat (git pull). Ha a szerveroldali kód változott,
   újraindítja a szervert; a public/ mappa változásaihoz elég frissíteni a
   böngészőt. Indítás: npm run live (Windowson: npm.cmd run live) */
const { spawn, execFileSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const INTERVAL_MS = Number(process.env.PULL_INTERVAL_MS) || 10000;
const GIT_ENV = { ...process.env, GIT_TERMINAL_PROMPT: '0' };

let server = null;
let stopping = false;

function log(msg) {
  const t = new Date().toLocaleTimeString('hu-HU');
  console.log(`[auto-pull ${t}] ${msg}`);
}

function git(args) {
  return execFileSync('git', args, { cwd: DIR, env: GIT_ENV, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

// friss letöltés után még nincsenek meg a csomagok: ilyenkor telepítjük őket
function ensureDeps() {
  if (fs.existsSync(path.join(DIR, 'node_modules', 'express')) && fs.existsSync(path.join(DIR, 'node_modules', 'socket.io'))) return;
  log('Hiányoznak a csomagok, npm install fut (ez egyszer kell, kb. fél perc)...');
  try { execSync('npm install', { cwd: DIR, stdio: 'inherit' }); } catch { log('Az npm install nem sikerült. Nézd meg a fenti hibaüzenetet.'); }
}

function startServer() {
  server = spawn(process.execPath, ['server.js'], { cwd: DIR, stdio: 'inherit' });
  server.on('exit', (code) => {
    server = null;
    if (!stopping && code !== null && code !== 0) {
      log(`A szerver leállt (kód: ${code}). A hiba oka a fenti üzenetben látszik (pl. ha a 3000-es port foglalt, zárd be a másik futó szervert). A következő változásnál újraindítom.`);
    }
  });
}

function restartServer() {
  if (!server) { startServer(); return; }
  server.once('exit', () => startServer());
  server.kill();
}

function check() {
  let before, after;
  try {
    before = git(['rev-parse', 'HEAD']);
    git(['pull', '--ff-only', '--quiet']);
    after = git(['rev-parse', 'HEAD']);
  } catch (e) {
    log('A git pull nem sikerült: ' + String(e.stderr || e.message).trim());
    return;
  }
  if (before === after) return;

  log(`Új változás érkezett: ${git(['log', '-1', '--format=%h %s'])}`);
  // --relative: csak a malom mappán belüli fájlok, ehhez a mappához képest
  const changed = git(['diff', '--name-only', '--relative', before, after]).split('\n').filter(Boolean);

  if (changed.some((f) => f === 'package.json' || f === 'package-lock.json')) {
    log('Változtak a függőségek, npm install fut...');
    try { execSync('npm install', { cwd: DIR, stdio: 'inherit' }); } catch { log('Az npm install nem sikerült.'); }
  }
  if (changed.some((f) => !f.startsWith('public/'))) {
    log('Szerveroldali kód változott, újraindítom a szervert.');
    restartServer();
  } else if (!server) {
    startServer();
  }
  log('Frissítsd a böngészőt (Ctrl+F5), hogy lásd a változást.');
}

function loop() {
  check();
  setTimeout(loop, INTERVAL_MS);
}

function shutdown() {
  stopping = true;
  if (server) server.kill();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

log(`Indul a szerver, és ${INTERVAL_MS / 1000} másodpercenként keresem a változásokat a GitHubon. Leállítás: Ctrl+C`);
ensureDeps();
startServer();
setTimeout(loop, INTERVAL_MS);
