/* Malom Aréna — kliens */
(function () {
  'use strict';
  const E = window.MalomEngine;
  const AI = window.MalomAI;
  const SK = window.MalomSkins;
  const SND = window.MalomSound;
  const I18N = window.I18N;
  const tr = (k, p) => I18N.t(k, p);
  const en = () => I18N.lang === 'en';
  const skinName = (k) => SK.nameOf(k, I18N.lang);
  const ELO_BOUNDS = [400, 900, 1400, 1900, 2300, 2700];
  function eloLabel(e) { let i = 0; while (i < ELO_BOUNDS.length && e >= ELO_BOUNDS[i]) i++; return tr('elo.l' + i); }
  const $ = (id) => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const EMOJIS = ['👍', '😂', '😮', '😡', '🔥', '👏', '🤝', '😎'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- tárolás (biztonságosan) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* nincs tárhely */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* nincs tárhely */ } }
  };

  // ---------- koordináták ----------
  const P = (i) => ({ x: 50 + E.COORDS[i][0] * 100, y: 50 + E.COORDS[i][1] * 100 });

  // ---------- állapot ----------
  const prefs = {
    name: store.get('malom-name', ''),
    skin: store.get('malom-skin', 'lovag'),
    theme: store.get('malom-theme', 'fa')
  };

  let G = null; // aktuális játék
  let socket = null;
  let selected = null;
  let aiTimer = null;

  function screen(id) {
    for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== id;
    window.scrollTo(0, 0);
  }

  function toast(text, ms) {
    const t = $('toast');
    t.textContent = text;
    t.hidden = false;
    t.classList.remove('show');
    void t.offsetWidth;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { t.hidden = true; }, ms || 2600);
  }

  // ---------- tábla rajzolása ----------
  function boardBase(svg) {
    svg.innerHTML = '';
    const g = (cls) => { const el = document.createElementNS(NS, 'g'); el.setAttribute('class', cls); svg.appendChild(el); return el; };
    const bg = g('bg');
    const u = svg.id;
    const R = (cls, fill) => `<rect x="4" y="4" width="692" height="692" rx="14" class="${cls}" fill="${fill}"/>`;
    bg.innerHTML = `
      <defs>
        <pattern id="grain-${u}" width="140" height="18" patternUnits="userSpaceOnUse">
          <path d="M0,9 C35,3 70,15 140,7" fill="none" stroke="rgba(80,40,10,.24)" stroke-width="1.4"/>
          <path d="M0,15 C45,11 90,17 140,13" fill="none" stroke="rgba(80,40,10,.16)" stroke-width="0.8"/>
        </pattern>
        <pattern id="vein-${u}" width="350" height="350" patternUnits="userSpaceOnUse">
          <path d="M-10,60 C80,40 120,150 220,120 S330,200 370,170" fill="none" stroke="rgba(96,100,128,.32)" stroke-width="2"/>
          <path d="M20,300 C110,250 180,320 260,260 S330,240 360,280" fill="none" stroke="rgba(96,100,128,.22)" stroke-width="1.2"/>
          <path d="M150,-10 C170,60 130,90 160,160" fill="none" stroke="rgba(184,150,90,.35)" stroke-width="1"/>
        </pattern>
        <pattern id="felt-${u}" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1" fill="rgba(255,255,255,.05)"/><circle cx="9" cy="8" r="1.2" fill="rgba(0,0,0,.08)"/>
        </pattern>
        <pattern id="paper-${u}" width="90" height="90" patternUnits="userSpaceOnUse">
          <path d="M5,20 l30,4 M50,60 l28,-3 M20,75 l18,6 M60,15 l20,8" stroke="rgba(110,70,30,.18)" stroke-width="1"/>
          <circle cx="70" cy="40" r="6" fill="rgba(140,90,40,.07)"/>
        </pattern>
        <pattern id="ice-${u}" width="230" height="230" patternUnits="userSpaceOnUse">
          <path d="M0,40 L60,70 L90,30 L150,90 L230,60 M60,70 L70,150 L20,200 M150,90 L170,170 L230,190 M70,150 L150,170" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1.6"/>
          <path d="M90,30 L110,0 M170,170 L160,230" fill="none" stroke="rgba(120,180,220,.5)" stroke-width="1"/>
        </pattern>
        <pattern id="lava-${u}" width="240" height="240" patternUnits="userSpaceOnUse">
          <path d="M0,60 C40,50 60,90 110,70 S180,20 240,50 M30,240 C50,180 100,190 120,140 S200,150 240,120 M110,70 C120,100 100,120 120,140" fill="none" stroke="#FF6A1A" stroke-width="3" opacity=".75"/>
          <path d="M0,60 C40,50 60,90 110,70 S180,20 240,50 M30,240 C50,180 100,190 120,140 S200,150 240,120" fill="none" stroke="#FFD166" stroke-width="1" opacity=".8"/>
        </pattern>
        <pattern id="velvet-${u}" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M25,0 L50,25 L25,50 L0,25 Z" fill="none" stroke="rgba(230,184,79,.16)" stroke-width="1.2"/>
          <circle cx="25" cy="25" r="2" fill="rgba(230,184,79,.22)"/>
        </pattern>
        <pattern id="sand-${u}" width="60" height="22" patternUnits="userSpaceOnUse">
          <path d="M0,11 C15,4 45,18 60,11" fill="none" stroke="rgba(120,96,60,.28)" stroke-width="1.6"/>
        </pattern>
        <pattern id="pixel-${u}" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="rgba(255,255,255,.035)"/><rect x="20" y="20" width="20" height="20" fill="rgba(255,255,255,.035)"/>
        </pattern>
        <pattern id="stars-${u}" width="160" height="160" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="30" r="1.4" fill="#fff" opacity=".8"/><circle cx="90" cy="12" r="1" fill="#fff" opacity=".6"/><circle cx="130" cy="80" r="1.6" fill="#fff" opacity=".9"/>
          <circle cx="50" cy="110" r="1" fill="#fff" opacity=".5"/><circle cx="110" cy="140" r="1.2" fill="#C9B6FF" opacity=".8"/>
        </pattern>
        <radialGradient id="vig-${u}" cx=".5" cy=".5" r=".72"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>
        <radialGradient id="burn-${u}" cx=".5" cy=".5" r=".72"><stop offset=".7" stop-color="#5A3410" stop-opacity="0"/><stop offset="1" stop-color="#5A3410" stop-opacity=".55"/></radialGradient>
        <radialGradient id="nebula-${u}" cx=".3" cy=".3" r=".8"><stop offset="0" stop-color="#7B3FBF" stop-opacity=".55"/><stop offset=".5" stop-color="#2A2A7A" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      </defs>
      ${R('board-bg', 'var(--bg)')}
      ${R('tex tex-grain', `url(#grain-${u})`)}
      ${R('tex tex-vein', `url(#vein-${u})`)}
      ${R('tex tex-felt', `url(#felt-${u})`)}
      ${R('tex tex-paper', `url(#paper-${u})`)}
      ${R('tex tex-ice', `url(#ice-${u})`)}
      ${R('tex tex-lava', `url(#lava-${u})`)}
      ${R('tex tex-velvet', `url(#velvet-${u})`)}
      ${R('tex tex-sand', `url(#sand-${u})`)}
      ${R('tex tex-pixel', `url(#pixel-${u})`)}
      ${R('tex tex-nebula', `url(#nebula-${u})`)}
      ${R('tex tex-stars', `url(#stars-${u})`)}
      ${R('tex tex-burn', `url(#burn-${u})`)}
      ${R('tex tex-vig', `url(#vig-${u})`)}
      <rect x="4" y="4" width="692" height="692" rx="14" class="board-edge" fill="none"/>`;
    const lines = g('lines');
    const L = (a, b) => {
      const p = P(a), q = P(b);
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', p.x); l.setAttribute('y1', p.y); l.setAttribute('x2', q.x); l.setAttribute('y2', q.y);
      lines.appendChild(l);
    };
    E.ADJ.forEach((adj, i) => adj.forEach((j) => { if (j > i) L(i, j); }));
    const pts = g('points');
    for (let i = 0; i < 24; i++) {
      const p = P(i);
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 11);
      c.setAttribute('class', 'dot');
      pts.appendChild(c);
    }
    g('mills');
    g('hints');
    g('pieces');
    g('fx');
    const hits = g('hits');
    for (let i = 0; i < 24; i++) {
      const p = P(i);
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 44);
      c.setAttribute('class', 'hit');
      c.setAttribute('data-i', i);
      hits.appendChild(c);
    }
    return svg;
  }

  function pieceNode(i, player, skin, anim, extra) {
    const p = P(i);
    const outer = document.createElementNS(NS, 'g');
    outer.setAttribute('class', 'piece');
    outer.setAttribute('transform', `translate(${p.x},${p.y})`);
    outer.dataset.i = i;
    const inner = document.createElementNS(NS, 'g');
    inner.setAttribute('class', 'pi' + (anim ? ' a-' + anim : ''));
    if (extra) for (const k in extra) inner.style.setProperty(k, extra[k]);
    inner.innerHTML = `<g transform="scale(.96)">${SK.markup(skin, player)}</g>`;
    outer.appendChild(inner);
    return outer;
  }

  function layer(svg, cls) { return svg.querySelector('g.' + cls); }

  function drawBoard(svg, state, skins, opts) {
    opts = opts || {};
    const pieces = layer(svg, 'pieces');
    const mills = layer(svg, 'mills');
    const fx = layer(svg, 'fx');
    pieces.innerHTML = '';
    mills.innerHTML = '';
    const lm = opts.animate ? state.lastMove : null;

    // malomvonalak kiemelése
    for (const m of E.MILLS) {
      const o = state.board[m[0]];
      if (o !== null && state.board[m[1]] === o && state.board[m[2]] === o) {
        const a = P(m[0]), b = P(m[2]);
        const l = document.createElementNS(NS, 'line');
        l.setAttribute('x1', a.x); l.setAttribute('y1', a.y); l.setAttribute('x2', b.x); l.setAttribute('y2', b.y);
        const fresh = state.millJustFormed && state.millJustFormed.join() === m.join() && opts.animate;
        l.setAttribute('class', 'mill-line p' + o + (fresh ? ' fresh' : ''));
        mills.appendChild(l);
      }
    }

    for (let i = 0; i < 24; i++) {
      const o = state.board[i];
      if (o === null) continue;
      let anim = null, extra = null;
      if (lm && lm.to === i && !reduceMotion) {
        if (lm.type === 'place') anim = (SK.SKINS[skins[o]] || SK.SKINS.klasszikus).anim;
        else if (lm.type === 'move') {
          const a = P(lm.from), b = P(lm.to);
          anim = 'slide';
          extra = { '--dx': (a.x - b.x) + 'px', '--dy': (a.y - b.y) + 'px' };
        }
      }
      const node = pieceNode(i, o, skins[o], anim, extra);
      if (state.millJustFormed && opts.animate && state.millJustFormed.includes(i)) node.classList.add('in-mill-fresh');
      pieces.appendChild(node);
    }

    // levett bábu "szellem" animációja
    if (lm && lm.type === 'remove' && !reduceMotion) {
      const victim = 1 - lm.player;
      const ghost = pieceNode(lm.at, victim, skins[victim], 'remove');
      ghost.classList.add('ghost');
      fx.appendChild(ghost);
      burst(fx, lm.at, victim);
      setTimeout(() => ghost.remove(), 700);
    }
  }

  function burst(fx, i, player) {
    const p = P(i);
    const col = SK.PALETTES[player].c;
    for (let k = 0; k < 10; k++) {
      const c = document.createElementNS(NS, 'circle');
      const ang = (Math.PI * 2 * k) / 10;
      c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 6);
      c.setAttribute('fill', col);
      c.setAttribute('class', 'spark');
      c.style.setProperty('--sx', Math.cos(ang) * 70 + 'px');
      c.style.setProperty('--sy', Math.sin(ang) * 70 + 'px');
      fx.appendChild(c);
      setTimeout(() => c.remove(), 700);
    }
  }

  function drawHints(svg, state, sel, interactive) {
    const hints = layer(svg, 'hints');
    hints.innerHTML = '';
    for (const n of svg.querySelectorAll('.piece.selected,.piece.removable,.piece.movable')) n.classList.remove('selected', 'removable', 'movable');
    for (const h of svg.querySelectorAll('.hit')) h.classList.remove('active');
    if (!interactive) return;
    const moves = E.legalMoves(state);
    const mark = (i, cls) => {
      const p = P(i);
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', p.x); c.setAttribute('cy', p.y);
      c.setAttribute('r', cls === 'target' ? 16 : 40);
      c.setAttribute('class', 'hint ' + cls + ' p' + state.turn);
      hints.appendChild(c);
      const hit = svg.querySelector(`.hit[data-i="${i}"]`);
      if (hit) hit.classList.add('active');
    };
    const pieceAt = (i) => svg.querySelector(`.pieces .piece[data-i="${i}"]`);
    if (state.pendingRemove) {
      for (const m of moves) { const n = pieceAt(m.at); if (n) n.classList.add('removable'); mark(m.at, 'remove'); }
      return;
    }
    if (moves.length && moves[0].type === 'place') {
      for (const m of moves) mark(m.to, 'target');
      return;
    }
    const froms = new Set(moves.map((m) => m.from));
    for (const f of froms) { const n = pieceAt(f); if (n) n.classList.add('movable'); const hit = svg.querySelector(`.hit[data-i="${f}"]`); if (hit) hit.classList.add('active'); }
    if (sel !== null) {
      const n = pieceAt(sel);
      if (n) n.classList.add('selected');
      for (const m of moves) if (m.from === sel) mark(m.to, 'target');
    }
  }

  // ---------- figura-választó ----------
  function buildPicker(el, player, current, onPick) {
    el.innerHTML = '';
    el.classList.add('picker-root');
    const chips = document.createElement('div');
    chips.className = 'cat-chips';
    chips.setAttribute('role', 'tablist');
    const grid = document.createElement('div');
    grid.className = 'skin-grid';
    grid.setAttribute('role', 'radiogroup');
    el.appendChild(chips);
    el.appendChild(grid);
    let chosen = current;
    let cat = (SK.SKINS[current] || SK.SKINS.klasszikus).cat;

    const fill = () => {
      grid.innerHTML = '';
      for (const key of SK.ORDER) {
        if (SK.SKINS[key].cat !== cat) continue;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'skin';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', key === chosen ? 'true' : 'false');
        b.dataset.skin = key;
        b.innerHTML = `<span class="skin-one">${SK.svg(key, player, 84)}</span><span class="skin-name">${escapeHtml(skinName(key))}</span>`;
        b.addEventListener('click', () => {
          chosen = key;
          for (const x of grid.querySelectorAll('.skin')) x.setAttribute('aria-checked', x === b ? 'true' : 'false');
          SND.play('select');
          onPick(key);
        });
        grid.appendChild(b);
      }
    };
    for (const c of SK.CATEGORIES) {
      const n = SK.ORDER.filter((k) => SK.SKINS[k].cat === c.id).length;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.setAttribute('role', 'tab');
      chip.dataset.cat = c.id;
      chip.setAttribute('aria-selected', c.id === cat ? 'true' : 'false');
      chip.innerHTML = `${escapeHtml(en() ? c.nameEn : c.name)} <span>${n}</span>`;
      chip.addEventListener('click', () => {
        cat = c.id;
        for (const x of chips.children) x.setAttribute('aria-selected', x === chip ? 'true' : 'false');
        fill();
      });
      chips.appendChild(chip);
    }
    fill();
  }

  // ---------- nyitóoldali demo tábla ----------
  let demoTimer = null;
  function startDemo() {
    const svg = boardBase($('demoBoard'));
    let s = E.newGame();
    let skinIdx = SK.ORDER.indexOf(prefs.skin);
    const step = () => {
      if ($('home').hidden) return;
      if (s.winner !== null || s.draw || s.moveCount > 26) {
        s = E.newGame();
        skinIdx = (skinIdx + 1) % SK.ORDER.length;
      }
      const m = AI.chooseMove(s, 'easy');
      if (!m) { s = E.newGame(); return; }
      s = E.apply(s, m);
      const skins = [prefs.skin, SK.ORDER[(skinIdx + 3) % SK.ORDER.length]];
      if (skins[1] === skins[0]) skins[1] = SK.ORDER[(skinIdx + 4) % SK.ORDER.length];
      drawBoard(svg, s, skins, { animate: true });
    };
    clearInterval(demoTimer);
    if (!reduceMotion) demoTimer = setInterval(step, 1100);
    else for (let k = 0; k < 12; k++) step();
  }

  // ---------- játék indítása ----------
  function newLocalGame(mode, players, opts) {
    stopAI();
    G = {
      mode, // 'local' | 'ai' | 'online'
      state: E.newGame(),
      players, // [{name, skin}, {name, skin}]
      history: [],
      score: G && G.mode === mode && G.scoreKey === opts.scoreKey ? G.score : [0, 0],
      scoreKey: opts.scoreKey,
      level: opts.level,
      aiSeat: opts.aiSeat,
      mySeat: null,
      starter: opts.starter || 0,
      ended: false
    };
    if (G.starter === 1) {
      G.state.turn = 1;
      G.state.positions = {};
      G.state.positions[E.posKey(G.state)] = 1;
    }
    selected = null;
    enterGame();
    maybeAI();
  }

  function enterGame() {
    clearInterval(demoTimer);
    screen('game');
    boardBase($('board'));
    $('boardFrame').dataset.theme = prefs.theme;
    $('emojiBar').hidden = G.mode !== 'online';
    $('btnUndo').hidden = G.mode === 'online';
    setModeLabel();
    $('endOverlay').hidden = true;
    render(false);
  }

  function setModeLabel() {
    if (!G) return;
    $('modeLabel').textContent = G.mode === 'online' ? tr('mode.online', { code: G.code }) : G.mode === 'ai' ? tr('mode.ai', { elo: G.level, label: eloLabel(G.level) }) : tr('mode.local');
  }

  function isMyTurn() {
    if (!G || G.state.winner !== null || G.state.draw) return false;
    if (G.mode === 'local') return true;
    if (G.mode === 'ai') return G.state.turn !== G.aiSeat;
    return G.state.turn === G.mySeat && G.players[1] && G.players[0];
  }

  function skinsOf() { return [G.players[0] ? G.players[0].skin : 'klasszikus', G.players[1] ? G.players[1].skin : 'klasszikus']; }

  function render(animate) {
    const svg = $('board');
    const sk = skinsOf();
    $('game').classList.toggle('same-skin', sk[0] === sk[1]);
    drawBoard(svg, G.state, skinsOf(), { animate });
    drawHints(svg, G.state, selected, isMyTurn());
    renderPanels();
    renderStatus();
    $('btnUndo').disabled = !G.history.length || G.state.winner !== null || G.state.draw;
    $('btnResign').disabled = G.state.winner !== null || G.state.draw || (G.mode === 'online' && !G.players[1]);
    if ((G.state.winner !== null || G.state.draw) && !G.ended) {
      G.ended = true;
      setTimeout(showEnd, animate ? 900 : 100);
    }
    if (G.state.winner === null && !G.state.draw) { G.ended = false; $('endOverlay').hidden = true; }
  }

  function renderPanels() {
    for (const seat of [0, 1]) {
      const el = $('panel' + seat);
      const pl = G.players[seat];
      const s = G.state;
      const active = s.turn === seat && s.winner === null && !s.draw;
      el.classList.toggle('active', active);
      if (!pl) {
        el.innerHTML = `<div class="pl-head"><div class="pl-fig empty"></div><div><div class="pl-name">${tr('pl.waiting')}</div><div class="pl-meta">${tr('pl.notJoined')}</div></div></div>`;
        continue;
      }
      let tag = '';
      if (G.mode === 'online') tag = seat === G.mySeat ? tr('tag.you') : (pl.online ? tr('tag.opp') : tr('tag.dc'));
      if (G.mode === 'ai') tag = seat === G.aiSeat ? tr('tag.cpu') : tr('tag.you');
      const hand = Array.from({ length: s.inHand[seat] }, () => `<span class="hand-pc">${SK.svg(pl.skin, seat, 26)}</span>`).join('');
      const lost = E.PIECES - s.inHand[seat] - s.onBoard[seat];
      el.innerHTML = `
        <div class="pl-head">
          <div class="pl-fig">${SK.svg(pl.skin, seat, 56)}</div>
          <div>
            <div class="pl-name">${escapeHtml(pl.name)}</div>
            <div class="pl-meta">${tag ? escapeHtml(tag) + ' · ' : ''}${escapeHtml(skinName(pl.skin))}</div>
          </div>
          <div class="pl-score" title="${tr('pl.wins')}">${G.score[seat]}</div>
        </div>
        <div class="pl-stats">
          <span>${tr('pl.onBoard')} <b>${s.onBoard[seat]}</b></span>
          <span>${tr('pl.lost')} <b>${lost}</b></span>
        </div>
        <div class="hand" aria-label="${tr('pl.inHand', { n: s.inHand[seat] })}">${hand || `<span class="hand-empty">${tr('pl.allPlaced')}</span>`}</div>
        <div class="react-slot" id="react${seat}"></div>`;
    }
  }

  function nameOf(seat) { return G.players[seat] ? G.players[seat].name : '—'; }

  function renderStatus() {
    const s = G.state;
    const st = $('status');
    st.className = 'status p' + s.turn;
    if (G.mode === 'online' && !G.players[1]) { st.textContent = tr('st.waitOpp'); return; }
    if (s.winner !== null || s.draw) { st.textContent = s.draw ? tr('st.draw') : tr('st.won', { name: nameOf(s.winner) }); return; }
    const mine = isMyTurn();
    const who = G.mode === 'local' ? nameOf(s.turn) + ': ' : mine ? '' : null;
    if (who === null) {
      st.textContent = G.mode === 'ai' ? tr('st.cpuThinking') : tr('st.oppMoves', { name: nameOf(s.turn) });
      return;
    }
    const ph = E.phaseOf(s, s.turn);
    let t;
    if (s.pendingRemove) t = tr('st.mill');
    else if (ph === 'place') t = tr('st.place', { n: s.inHand[s.turn] });
    else if (ph === 'fly') t = tr('st.fly');
    else t = selected === null ? tr('st.select') : tr('st.target');
    if (!s.pendingRemove) t = (who || tr('st.yourTurn')) + t;
    else if (G.mode === 'local') t = who + t;
    st.textContent = t;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  // ---------- kattintás a táblán ----------
  $('board').addEventListener('click', (ev) => {
    const hit = ev.target.closest('.hit');
    if (!hit || !G) return;
    onPoint(Number(hit.dataset.i));
  });

  function onPoint(i) {
    if (!isMyTurn()) { SND.play('error'); return; }
    const s = G.state;
    const moves = E.legalMoves(s);
    if (s.pendingRemove) {
      const m = moves.find((x) => x.at === i);
      if (m) doMove(m); else { SND.play('error'); toast(tr('toast.cantRemove')); }
      return;
    }
    if (moves[0] && moves[0].type === 'place') {
      const m = moves.find((x) => x.to === i);
      if (m) doMove(m); else SND.play('error');
      return;
    }
    if (s.board[i] === s.turn) {
      if (moves.some((x) => x.from === i)) { selected = selected === i ? null : i; SND.play('select'); }
      else { selected = null; SND.play('error'); toast(tr('toast.noMoves')); }
      drawHints($('board'), s, selected, true);
      renderStatus();
      return;
    }
    if (selected !== null) {
      const m = moves.find((x) => x.from === selected && x.to === i);
      if (m) doMove(m); else SND.play('error');
    }
  }

  function errText(res) { return res ? (res.code ? tr('err.' + res.code) : res.error) : ''; }

  function playFx(state) {
    const lm = state.lastMove;
    if (!lm) return;
    if (state.millJustFormed) SND.play('mill');
    else if (lm.type === 'remove') SND.play('remove');
    else if (lm.type === 'place') SND.play('place');
    else SND.play('move');
  }

  function doMove(m) {
    selected = null;
    if (G.mode === 'online') {
      socket.emit('move', m, (res) => {
        if (!res || !res.ok) { SND.play('error'); toast(errText(res) || tr('toast.moveFailed')); render(false); }
      });
      // azonnali visszajelzés, a szerver válasza felülírja
      drawHints($('board'), G.state, null, false);
      return;
    }
    G.history.push(G.state);
    G.state = E.apply(G.state, m);
    if (G.state.winner !== null) G.score[G.state.winner]++;
    playFx(G.state);
    render(true);
    maybeAI();
  }

  let aiWorker = null;
  let aiReq = 0;
  try { aiWorker = new Worker('ai-worker.js'); } catch (e) { aiWorker = null; }

  function think(state, level) {
    return new Promise((resolve) => {
      if (!aiWorker) { resolve(AI.chooseMove(state, level)); return; }
      const id = ++aiReq;
      const onMsg = (ev) => {
        if (ev.data.id !== id) return;
        aiWorker.removeEventListener('message', onMsg);
        resolve(ev.data.move);
      };
      aiWorker.addEventListener('message', onMsg);
      aiWorker.postMessage({ id, state, level });
    });
  }

  function maybeAI() {
    if (!G || G.mode !== 'ai') return;
    if (G.state.turn !== G.aiSeat || G.state.winner !== null || G.state.draw) return;
    stopAI();
    const game = G;
    const before = G.state;
    const started = Date.now();
    const minDelay = G.state.pendingRemove ? 650 : 520;
    aiTimer = setTimeout(() => {}, 0);
    const myTimer = aiTimer;
    think(before, G.level).then((m) => {
      const wait = Math.max(0, minDelay - (Date.now() - started));
      setTimeout(() => {
        // ha közben visszavonás / új játék / menü történt, eldobjuk a választ
        if (G !== game || G.state !== before || aiTimer !== myTimer || !m) return;
        if (!E.isLegal(G.state, m)) return;
        G.state = E.apply(G.state, m);
        if (G.state.winner !== null) G.score[G.state.winner]++;
        playFx(G.state);
        render(true);
        maybeAI();
      }, wait);
    });
  }

  function stopAI() { clearTimeout(aiTimer); aiTimer = null; aiReq++; }

  $('btnUndo').addEventListener('click', () => {
    if (!G || G.mode === 'online' || !G.history.length) return;
    stopAI();
    if (G.mode === 'ai') {
      // vissza a legutóbbi saját lépésünk előtti állapotig
      let st = G.history.pop();
      while (G.history.length && (st.turn === G.aiSeat)) st = G.history.pop();
      if (st.turn === G.aiSeat) { G.history.push(st); maybeAI(); return; }
      G.state = st;
    } else {
      G.state = G.history.pop();
    }
    selected = null;
    SND.play('select');
    render(false);
  });

  $('btnResign').addEventListener('click', () => {
    if (!G || G.state.winner !== null || G.state.draw) return;
    if (!confirmResign()) return;
    if (G.mode === 'online') { socket.emit('resign'); return; }
    stopAI();
    const loser = G.mode === 'ai' ? 1 - G.aiSeat : G.state.turn;
    G.history.push(G.state);
    G.state = E.resign(G.state, loser);
    G.score[G.state.winner]++;
    render(false);
  });

  function confirmResign() {
    const b = $('btnResign');
    if (b.dataset.armed === '1') { b.dataset.armed = ''; b.textContent = tr('btn.resign'); return true; }
    b.dataset.armed = '1';
    b.textContent = tr('resign.confirm');
    setTimeout(() => { b.dataset.armed = ''; b.textContent = tr('btn.resign'); }, 3000);
    return false;
  }

  // ---------- játék vége ----------
  const REASONS = {
    pieces: (l) => tr('end.pieces', { l }),
    blocked: (l) => tr('end.blocked', { l }),
    resign: (l) => tr('end.resign', { l }),
    repetition: () => tr('end.repetition'),
    nocapture: () => tr('end.nocapture')
  };

  function showEnd() {
    const s = G.state;
    const ov = $('endOverlay');
    let title;
    let mine = null;
    if (s.draw) title = tr('st.draw');
    else {
      const me = G.mode === 'online' ? G.mySeat : G.mode === 'ai' ? 1 - G.aiSeat : null;
      mine = me === null ? null : s.winner === me;
      title = me === null ? tr('st.won', { name: nameOf(s.winner) }) : mine ? tr('end.youWon') : G.mode === 'ai' ? tr('end.cpuWon') : tr('end.xWon', { name: nameOf(s.winner) });
    }
    if (G.mode === 'ai' && mine === true) {
      const best = store.get('malom-best-elo', null);
      if (best === null || G.level > best) { store.set('malom-best-elo', G.level); title = tr('end.record'); }
    }
    $('endTitle').textContent = title;
    const loser = s.winner === null ? '' : nameOf(1 - s.winner);
    $('endReason').textContent = (REASONS[s.endReason] || (() => ''))(loser);
    $('endScore').textContent = `${nameOf(0)} ${G.score[0]} : ${G.score[1]} ${nameOf(1)}`;
    $('endFigure').innerHTML = s.winner === null ? SK.svg(skinsOf()[0], 0, 70) + SK.svg(skinsOf()[1], 1, 70) : SK.svg(skinsOf()[s.winner], s.winner, 110);
    $('btnRematch').textContent = tr('btn.rematch');
    $('btnRematch').disabled = false;
    if (G.mode === 'online' && G.rematch && G.rematch[G.mySeat]) { $('btnRematch').textContent = tr('btn.waitingOpp'); $('btnRematch').disabled = true; }
    ov.hidden = false;
    if (mine === false) SND.play('lose'); else SND.play('win');
  }

  $('btnRematch').addEventListener('click', () => {
    if (!G) return;
    if (G.mode === 'online') {
      socket.emit('rematch');
      $('btnRematch').textContent = tr('btn.waitingOpp');
      $('btnRematch').disabled = true;
      return;
    }
    const starter = 1 - G.starter;
    newLocalGame(G.mode, G.players, { scoreKey: G.scoreKey, level: G.level, aiSeat: G.aiSeat, starter });
  });

  $('btnEndMenu').addEventListener('click', goHome);
  $('btnMenu').addEventListener('click', goHome);

  function goHome() {
    stopAI();
    if (G && G.mode === 'online' && socket) { socket.emit('leave'); store.del('malom-room'); }
    G = null;
    $('endOverlay').hidden = true;
    history.replaceState(null, '', location.pathname);
    screen('home');
    startDemo();
  }

  // ---------- online ----------
  function ensureSocket() {
    if (socket) return socket;
    if (typeof io === 'undefined') { toast(tr('toast.noOnline')); return null; }
    socket = io({ reconnection: true });
    socket.on('room', onRoom);
    socket.on('toast', (d) => { toast(d.key ? tr('toast.' + d.key, { name: d.name }) : d.text); SND.play('notify'); });
    socket.on('react', (d) => showReact(d.seat, d.emoji));
    socket.on('connect', () => {
      const saved = store.get('malom-room', null);
      if (G && G.mode === 'online' && saved) {
        socket.emit('join', { code: saved.code, token: saved.token }, (res) => {
          if (!res.ok) { toast(tr('toast.roomGone')); goHome(); }
        });
      }
    });
    socket.on('disconnect', () => { if (G && G.mode === 'online') toast(tr('toast.reconnecting'), 4000); });
    return socket;
  }

  function onRoom(room) {
    if (!G || G.mode !== 'online' || room.code !== G.code) return;
    const prev = G.state;
    const wasWaiting = !G.players[1];
    G.players = room.players;
    G.score = room.score;
    G.rematch = room.rematch;
    const changed = !prev || prev.moveCount !== room.state.moveCount || prev.winner !== room.state.winner;
    const fresh = prev && room.state.moveCount === prev.moveCount + 1;
    G.state = room.state;
    if (!G.players[1]) { $('roomCode').textContent = room.code; clearInterval(demoTimer); screen('lobby'); return; }
    if (wasWaiting || $('game').hidden) { enterGame(); return; }
    if (fresh) playFx(G.state);
    if (room.state.moveCount === 0 && prev && prev.moveCount > 0) { selected = null; G.ended = false; }
    render(changed && fresh);
    if (G.ended && !$('endOverlay').hidden) {
      if (G.rematch[G.mySeat]) { $('btnRematch').textContent = tr('btn.waitingOpp'); $('btnRematch').disabled = true; }
      else if (G.rematch[1 - G.mySeat]) $('btnRematch').textContent = tr('btn.acceptRematch');
    }
  }

  function startOnline(res) {
    G = {
      mode: 'online', code: res.code, mySeat: res.seat, state: null,
      players: [null, null], history: [], score: [0, 0], rematch: [false, false], ended: false
    };
    store.set('malom-room', { code: res.code, token: res.token });
    history.replaceState(null, '', '?szoba=' + res.code);
  }

  function myName() { return ($('nameInput').value.trim() || prefs.name || tr('player')).slice(0, 20); }

  $('btnCreate').addEventListener('click', () => {
    const s = ensureSocket();
    if (!s) return;
    saveName();
    s.emit('create', { name: myName(), skin: prefs.skin }, (res) => {
      if (!res.ok) { toast(tr('toast.createFailed')); return; }
      startOnline(res);
      $('roomCode').textContent = res.code;
      clearInterval(demoTimer);
      screen('lobby');
    });
  });

  function linkFor(code) { return location.origin + location.pathname + '?szoba=' + code; }

  async function copy(text, okMsg) {
    try { await navigator.clipboard.writeText(text); toast(okMsg); }
    catch (e) { window.prompt(tr('copy.prompt'), text); }
  }
  $('btnCopyLink').addEventListener('click', () => G && copy(linkFor(G.code), tr('toast.linkCopied')));
  $('btnCopyCode').addEventListener('click', () => G && copy(G.code, tr('toast.codeCopied')));
  $('btnLobbyBack').addEventListener('click', goHome);

  $('btnJoinOpen').addEventListener('click', () => openJoin(''));
  function openJoin(code) {
    $('joinCode').value = code || '';
    $('joinError').hidden = true;
    $('joinDialog').showModal();
    setTimeout(() => (code ? $('btnJoin') : $('joinCode')).focus(), 30);
  }

  $('joinForm').addEventListener('submit', (ev) => {
    const btn = ev.submitter;
    if (!btn || btn.value !== 'join') return;
    ev.preventDefault();
    const code = $('joinCode').value.trim().toUpperCase();
    if (code.length !== 6) { $('joinError').textContent = tr('join.codeLen'); $('joinError').hidden = false; return; }
    const s = ensureSocket();
    if (!s) return;
    saveName();
    const saved = store.get('malom-room', null);
    const token = saved && saved.code === code ? saved.token : undefined;
    s.emit('join', { code, name: myName(), skin: prefs.skin, token }, (res) => {
      if (!res.ok) { $('joinError').textContent = errText(res); $('joinError').hidden = false; return; }
      $('joinDialog').close();
      startOnline(res);
    });
  });

  function buildEmojiBar() {
    const bar = $('emojiBar');
    bar.innerHTML = '';
    for (const e of EMOJIS) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = e;
      b.setAttribute('aria-label', tr('react.aria', { e }));
      b.addEventListener('click', () => socket && socket.emit('react', e));
      bar.appendChild(b);
    }
  }

  function showReact(seat, emoji) {
    const slot = $('react' + seat);
    if (!slot) return;
    const s = document.createElement('span');
    s.className = 'react';
    s.textContent = emoji;
    slot.appendChild(s);
    SND.play('react');
    setTimeout(() => s.remove(), 1800);
  }

  // ---------- helyi és gépi mód ----------
  function saveName() {
    const n = $('nameInput').value.trim();
    if (n) { prefs.name = n; store.set('malom-name', n); }
  }

  let p2Skin = 'robot';
  $('btnLocal').addEventListener('click', () => {
    saveName();
    p2Skin = store.get('malom-skin2', prefs.skin === 'robot' ? 'kristaly' : 'robot');
    $('p2Name').value = store.get('malom-name2', '');
    buildPicker($('picker2'), 1, p2Skin, (k) => { p2Skin = k; });
    $('p2Dialog').showModal();
  });
  $('p2Dialog').addEventListener('close', () => {
    if ($('p2Dialog').returnValue !== 'ok') return;
    const n2 = $('p2Name').value.trim() || tr('player2');
    store.set('malom-name2', n2);
    store.set('malom-skin2', p2Skin);
    newLocalGame('local', [{ name: myName(), skin: prefs.skin }, { name: n2, skin: p2Skin }], { scoreKey: 'local' });
  });

  // ---------- gép elleni mód: Élő 0–3000 ----------
  let aiElo = Number(store.get('malom-ai-elo', 1200)) || 1200;
  function eloDesc(e) {
    const c = AI.configFor(e);
    if (c.randomness > 0.4) return tr('elo.d0');
    if (c.randomness > 0.02) return tr('elo.d1');
    if (c.noise > 80) return tr('elo.d2', { d: c.maxDepth });
    if (c.noise > 0) return tr('elo.d3', { d: c.maxDepth });
    return tr('elo.d4', { d: c.maxDepth });
  }
  function updateElo(e) {
    aiElo = Math.max(0, Math.min(3000, Math.round(e / 50) * 50));
    $('eloRange').value = aiElo;
    $('eloValue').textContent = aiElo;
    $('eloName').textContent = eloLabel(aiElo);
    $('eloDesc').textContent = eloDesc(aiElo);
    $('eloRange').style.setProperty('--fill', (aiElo / 30) + '%');
    for (const b of document.querySelectorAll('.elo-presets button')) b.classList.toggle('on', Number(b.dataset.elo) === aiElo);
  }
  $('eloRange').addEventListener('input', (e) => updateElo(Number(e.target.value)));
  for (const b of document.querySelectorAll('.elo-presets button')) b.addEventListener('click', () => { updateElo(Number(b.dataset.elo)); SND.play('select'); });

  function openAI(elo) {
    saveName();
    updateElo(elo === undefined ? aiElo : elo);
    const best = store.get('malom-best-elo', null);
    $('eloBest').hidden = best === null;
    if (best !== null) $('eloBest').textContent = tr('elo.best', { n: best });
    $('aiDialog').showModal();
  }
  $('btnAI').addEventListener('click', () => openAI());
  $('aiDialog').addEventListener('close', () => {
    if ($('aiDialog').returnValue !== 'ok') return;
    store.set('malom-ai-elo', aiElo);
    updateAiNote();
    const aiFirst = $('aiFirst').checked;
    const others = SK.ORDER.filter((k) => k !== prefs.skin);
    const aiSkin = others[Math.floor(Math.random() * others.length)];
    newLocalGame('ai', [{ name: myName(), skin: prefs.skin }, { name: tr('cpu.name', { n: aiElo }), skin: aiSkin }], { scoreKey: 'ai-' + aiElo, level: aiElo, aiSeat: 1, starter: aiFirst ? 1 : 0 });
  });

  // ---------- eszközök ----------
  function soundIcon() {
    $('btnSound').innerHTML = SND.enabled
      ? '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    $('btnSound').setAttribute('aria-pressed', SND.enabled ? 'true' : 'false');
  }
  $('btnSound').addEventListener('click', () => { SND.toggle(); soundIcon(); });
  // ---------- beállítások: tábla és hang ----------
  const THEMES = [
    { id: 'fa', name: 'Diófa' },
    { id: 'marvany', name: 'Márvány' },
    { id: 'neon', name: 'Neon' },
    { id: 'filc', name: 'Kaszinó filc' },
    { id: 'pergamen', name: 'Kincses térkép' },
    { id: 'jeg', name: 'Jégmező' },
    { id: 'lava', name: 'Vulkán' },
    { id: 'kiralyi', name: 'Királyi bársony' },
    { id: 'homok', name: 'Zen kert' },
    { id: 'pixel', name: 'Retro pixel' },
    { id: 'ur', name: 'Galaxis' }
  ];
  if (!THEMES.some((t) => t.id === prefs.theme)) prefs.theme = 'fa';

  function applyTheme(id) {
    prefs.theme = id;
    store.set('malom-theme', id);
    $('boardFrame').dataset.theme = id;
    $('heroBoard').dataset.theme = id;
    for (const b of document.querySelectorAll('.theme-card')) b.setAttribute('aria-checked', b.dataset.theme === id ? 'true' : 'false');
  }

  let themeGridBuilt = false;
  function buildThemeGrid() {
    if (themeGridBuilt) return;
    themeGridBuilt = true;
    buildThemeCards($('themeGrid'), 'tprev');
  }
  function buildThemeCards(grid, prefix) {
    const demo = E.newGame();
    // egy kis bemutató állás, hogy a figurák is látsszanak a mintán
    [[0, 0], [1, 4], [0, 9], [1, 13], [0, 19], [1, 23]].forEach(([pl, i]) => { demo.board[i] = pl; });
    THEMES.forEach((t, k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'theme-card';
      b.dataset.theme = t.id;
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', t.id === prefs.theme ? 'true' : 'false');
      const wrap = document.createElement('span');
      wrap.className = 'theme-prev';
      wrap.dataset.theme = t.id;
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '-14 -14 728 728');
      svg.id = prefix + k;
      wrap.appendChild(svg);
      b.appendChild(wrap);
      const label = document.createElement('span');
      label.className = 'theme-name';
      label.textContent = tr('theme.' + t.id);
      b.appendChild(label);
      b.addEventListener('click', () => { applyTheme(t.id); SND.play('select'); });
      grid.appendChild(b);
      boardBase(svg);
      drawBoard(svg, demo, [prefs.skin, prefs.skin === 'robot' ? 'kristaly' : 'robot'], {});
    });
  }

  function pct(v) { return Math.round(v * 100) + '%'; }

  function buildSoundPanel() {
    const st = SND.settings;
    $('masterVol').value = Math.round(st.master * 100);
    $('masterOut').textContent = pct(st.master);
    $('muteAll').checked = st.muted;
    $('musicVol').value = Math.round(st.music.vol * 100);
    $('musicOut').textContent = pct(st.music.vol);
    const mc = $('moodChips');
    mc.innerHTML = '';
    for (const m of SND.MOODS) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', st.music.mood === m.id ? 'true' : 'false');
      b.textContent = en() ? m.nameEn : m.name;
      b.addEventListener('click', () => {
        SND.setMusicMood(m.id);
        for (const x of mc.children) x.setAttribute('aria-checked', x === b ? 'true' : 'false');
      });
      mc.appendChild(b);
    }

    const sg = $('styleGrid');
    sg.innerHTML = '';
    for (const sty of SND.STYLES) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'style-card';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', st.style === sty.id ? 'true' : 'false');
      b.innerHTML = `<strong>${escapeHtml(en() ? sty.nameEn : sty.name)}</strong><span>${escapeHtml(en() ? sty.descEn : sty.desc)}</span>`;
      b.addEventListener('click', () => {
        SND.setStyle(sty.id);
        SND.preview('mill', sty.id);
        buildSoundPanel();
      });
      sg.appendChild(b);
    }

    const list = $('eventList');
    list.innerHTML = '';
    for (const ev of SND.EVENTS) {
      const e = st.events[ev.id];
      const row = document.createElement('div');
      row.className = 'event-row';
      const styName = (x) => (en() ? x.nameEn : x.name);
      const evName = en() ? ev.nameEn : ev.name;
      const opts = [`<option value="">${escapeHtml(tr('snd.shared', { name: styName(SND.STYLES.find((x) => x.id === st.style)) }))}</option>`]
        .concat(SND.STYLES.map((x) => `<option value="${x.id}"${e.style === x.id ? ' selected' : ''}>${escapeHtml(styName(x))}</option>`)).join('');
      row.innerHTML = `
        <span class="ev-name">${escapeHtml(evName)}</span>
        <select aria-label="${escapeHtml(tr('snd.evStyle', { ev: evName }))}">${opts}</select>
        <input type="range" min="0" max="100" step="1" value="${Math.round(e.vol * 100)}" aria-label="${escapeHtml(tr('snd.evVol', { ev: evName }))}">
        <output>${pct(e.vol)}</output>
        <button type="button" class="icon-btn play" aria-label="${escapeHtml(tr('snd.play', { ev: evName }))}" title="${escapeHtml(tr('snd.preview'))}">
          <svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>
        </button>`;
      const [sel, range, out, play] = [row.querySelector('select'), row.querySelector('input'), row.querySelector('output'), row.querySelector('.play')];
      sel.addEventListener('change', () => { SND.setEventStyle(ev.id, sel.value || null); SND.preview(ev.id); });
      range.addEventListener('input', () => { SND.setEventVol(ev.id, range.value / 100); out.textContent = pct(range.value / 100); });
      range.addEventListener('change', () => SND.preview(ev.id));
      play.addEventListener('click', () => SND.preview(ev.id));
      list.appendChild(row);
    }
  }

  $('masterVol').addEventListener('input', (e) => { SND.setMaster(e.target.value / 100); $('masterOut').textContent = pct(e.target.value / 100); });
  $('masterVol').addEventListener('change', () => SND.preview('place'));
  $('musicVol').addEventListener('input', (e) => { SND.setMusicVol(e.target.value / 100); $('musicOut').textContent = pct(e.target.value / 100); });
  $('muteAll').addEventListener('change', (e) => { SND.setMuted(e.target.checked); soundIcon(); });
  $('btnSoundReset').addEventListener('click', () => { SND.reset(); buildSoundPanel(); soundIcon(); SND.preview('mill'); });

  function selectTab(which) {
    const board = which === 'board';
    $('tabBoard').setAttribute('aria-selected', board ? 'true' : 'false');
    $('tabSound').setAttribute('aria-selected', board ? 'false' : 'true');
    $('panelBoard').hidden = !board;
    $('panelSound').hidden = board;
  }
  $('tabBoard').addEventListener('click', () => selectTab('board'));
  $('tabSound').addEventListener('click', () => selectTab('sound'));

  function openSettings(tab) {
    buildThemeGrid();
    buildSoundPanel();
    selectTab(tab || 'board');
    $('settingsDialog').showModal();
  }
  $('btnSettings').addEventListener('click', () => openSettings('board'));
  $('btnHomeSettings').addEventListener('click', () => openSettings('board'));
  $('btnSettingsClose').addEventListener('click', () => $('settingsDialog').close());
  $('settingsDialog').addEventListener('close', soundIcon);

  // billentyűzet: nyilakkal a pontok között, Enterrel lépés
  let kbFocus = 0;
  document.addEventListener('keydown', (ev) => {
    if (!G || $('game').hidden || document.querySelector('dialog[open]')) return;
    const dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (dirs[ev.key]) {
      ev.preventDefault();
      const [dx, dy] = dirs[ev.key];
      const [cx, cy] = E.COORDS[kbFocus];
      let best = null, bd = Infinity;
      for (let i = 0; i < 24; i++) {
        const [x, y] = E.COORDS[i];
        const ex = x - cx, ey = y - cy;
        if ((dx && Math.sign(ex) !== dx) || (dy && Math.sign(ey) !== dy)) continue;
        const d = Math.abs(dx ? ex : ey) * 1 + Math.abs(dx ? ey : ex) * 3;
        if (d < bd) { bd = d; best = i; }
      }
      if (best !== null) kbFocus = best;
      showKbFocus();
    } else if (ev.key === 'Enter' || ev.key === ' ') {
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
      ev.preventDefault();
      onPoint(kbFocus);
      showKbFocus();
    } else if (ev.key === 'Escape') {
      selected = null;
      drawHints($('board'), G.state, null, isMyTurn());
      renderStatus();
    }
  });
  function showKbFocus() {
    const svg = $('board');
    let f = svg.querySelector('.kb-focus');
    if (!f) { f = document.createElementNS(NS, 'circle'); f.setAttribute('class', 'kb-focus'); f.setAttribute('r', 46); layer(svg, 'fx').appendChild(f); }
    const p = P(kbFocus);
    f.setAttribute('cx', p.x); f.setAttribute('cy', p.y);
  }

  // ---------- nyitóoldal ----------
  function updateMySkin() {
    $('mySkinFig').innerHTML = SK.svg(prefs.skin, 0, 46);
    $('mySkinName').textContent = skinName(prefs.skin);
  }

  // állítható figurakeret: szín, vastagság, fényesség, élő előnézettel
  function buildFrameEditors() {
    const en = I18N.lang === 'en';
    const other = prefs.skin === 'robot' ? 'kristaly' : 'robot';
    ['frameEditor', 'frameEditor2'].forEach((elId, n) => {
      const el = $(elId);
      if (!el) return;
      const swatches = SK.FRAME_SWATCHES.map((w) =>
        `<button type="button" class="fe-swatch" role="radio" data-color="${w.color}" style="background:${w.color}" aria-label="${escapeHtml(en ? w.nameEn : w.name)}" title="${escapeHtml(en ? w.nameEn : w.name)}"></button>`).join('');
      el.innerHTML = `
        <div class="fe-preview" aria-hidden="true">${SK.svg(prefs.skin, 0, 84)}${SK.svg(other, 1, 84)}</div>
        <div class="fe-controls">
          <div class="fe-row colors">
            <span class="fe-label" id="feColorLbl${n}">${escapeHtml(tr('frame.color'))}</span>
            <div class="fe-swatches" role="radiogroup" aria-labelledby="feColorLbl${n}">
              ${swatches}
              <button type="button" class="fe-swatch fe-pl" role="radio" data-player="1" aria-label="${escapeHtml(tr('frame.player'))}" title="${escapeHtml(tr('frame.player'))}"></button>
              <label class="fe-custom" title="${escapeHtml(tr('frame.custom'))}"><input type="color" class="fe-color" aria-label="${escapeHtml(tr('frame.custom'))}"></label>
            </div>
          </div>
          <label class="fe-row">
            <span class="fe-label">${escapeHtml(tr('frame.width'))}</span>
            <input type="range" class="fe-width" min="0" max="${SK.FRAME_MAX}" step="1">
            <output class="fe-width-out"></output>
          </label>
          <label class="fe-row">
            <span class="fe-label">${escapeHtml(tr('frame.sheen'))}</span>
            <input type="range" class="fe-sheen" min="0" max="100" step="1">
            <output class="fe-sheen-out"></output>
          </label>
          <div class="fe-actions"><button type="button" class="link-btn fe-reset">${escapeHtml(tr('frame.reset'))}</button></div>
        </div>`;
      for (const b of el.querySelectorAll('.fe-swatch')) {
        b.addEventListener('click', () => {
          SK.setFrame(b.dataset.player ? { player: true } : { player: false, color: b.dataset.color });
          syncFrameEditors();
          SND.play('select');
        });
      }
      el.querySelector('.fe-color').addEventListener('input', (e) => { SK.setFrame({ player: false, color: e.target.value }); syncFrameEditors(); });
      el.querySelector('.fe-width').addEventListener('input', (e) => { SK.setFrame({ width: Number(e.target.value) }); syncFrameEditors(); });
      el.querySelector('.fe-sheen').addEventListener('input', (e) => { SK.setFrame({ sheen: Number(e.target.value) / 100 }); syncFrameEditors(); });
      el.querySelector('.fe-reset').addEventListener('click', () => { SK.resetFrame(); syncFrameEditors(); SND.play('select'); });
    });
    syncFrameEditors();
  }

  // mindkét szerkesztő (nyitóoldal és beállítások) ugyanazt mutassa
  function syncFrameEditors() {
    const f = SK.frame;
    const preset = !f.player && SK.FRAME_SWATCHES.some((w) => w.color.toLowerCase() === f.color.toLowerCase());
    for (const el of [$('frameEditor'), $('frameEditor2')]) {
      if (!el || !el.firstElementChild) continue;
      for (const b of el.querySelectorAll('.fe-swatch')) {
        const on = b.dataset.player ? f.player : (!f.player && b.dataset.color.toLowerCase() === f.color.toLowerCase());
        b.setAttribute('aria-checked', on ? 'true' : 'false');
      }
      const custom = el.querySelector('.fe-custom');
      custom.setAttribute('aria-checked', !f.player && !preset ? 'true' : 'false');
      if (!f.player && !preset) custom.style.background = f.color; else custom.style.background = '';
      const color = el.querySelector('.fe-color');
      if (document.activeElement !== color) color.value = f.color;
      el.querySelector('.fe-width').value = f.width;
      el.querySelector('.fe-width-out').textContent = f.width === 0 ? tr('frame.none') : String(f.width);
      el.querySelector('.fe-sheen').value = Math.round(f.sheen * 100);
      el.querySelector('.fe-sheen-out').textContent = Math.round(f.sheen * 100) + '%';
    }
  }

  function pickSkin(k, fromOrbit) {
    prefs.skin = k;
    store.set('malom-skin', k);
    updateMySkin();
    buildFrameEditors();
    buildPicker($('picker'), 0, prefs.skin, (x) => pickSkin(x));
    if (fromOrbit) toast(tr('toast.picked', { name: skinName(k) }));
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // a tábla körül lebegő figurák
  const ORBIT_SPOTS = [
    { x: -2, y: 4, sz: 84 }, { x: 40, y: -6, sz: 64 }, { x: 82, y: 2, sz: 92 },
    { x: 90, y: 46, sz: 66 }, { x: 80, y: 84, sz: 80 }, { x: 36, y: 90, sz: 60 },
    { x: -6, y: 72, sz: 74 }, { x: -8, y: 38, sz: 58 }
  ];
  function buildOrbit() {
    const orbit = $('orbit');
    orbit.innerHTML = '';
    // minden kategóriából jusson figura
    const byCat = SK.CATEGORIES.map((c) => shuffle(SK.ORDER.filter((k) => SK.SKINS[k].cat === c.id)));
    const picks = [];
    for (let i = 0; picks.length < ORBIT_SPOTS.length; i++) picks.push(byCat[i % byCat.length][Math.floor(i / byCat.length)]);
    ORBIT_SPOTS.forEach((spot, i) => {
      const key = picks[i];
      const b = document.createElement('button');
      b.type = 'button';
      b.style.setProperty('--x', spot.x + '%');
      b.style.setProperty('--y', spot.y + '%');
      b.style.setProperty('--sz', `clamp(${Math.round(spot.sz * 0.6)}px, ${spot.sz / 7}vw, ${spot.sz}px)`);
      b.style.setProperty('--dur', (2.6 + (i % 4) * 0.55) + 's');
      b.style.setProperty('--delay', (-i * 0.7) + 's');
      b.setAttribute('aria-label', tr('orbit.aria', { name: skinName(key) }));
      b.title = skinName(key);
      b.innerHTML = SK.svg(key, i % 2, 100);
      b.addEventListener('click', () => {
        pickSkin(key, true);
        SND.play('place');
        b.classList.remove('picked'); void b.offsetWidth; b.classList.add('picked');
      });
      orbit.appendChild(b);
    });
  }

  function buildMarquee() {
    const row = (el, player, list) => {
      const html = list.map((k) => SK.svg(k, player, 64)).join('');
      el.innerHTML = html + html; // kétszer, hogy a görgetés folytonos legyen
    };
    row($('marqueeA'), 0, shuffle(SK.ORDER));
    row($('marqueeB'), 1, shuffle(SK.ORDER));
  }

  // animált szabály-ábrák (SVG SMIL)
  function anim(el, tag, attrs) {
    const a = document.createElementNS(NS, tag);
    for (const k in attrs) a.setAttribute(k, attrs[k]);
    el.appendChild(a);
    return a;
  }
  function buildRules() {
    const sk = [prefs.skin, prefs.skin === 'a-roka' ? 'a-panda' : 'a-roka'];
    const make = (id, theme) => { const svg = boardBase($(id)); svg.setAttribute('data-theme', theme); return svg; };
    const add = (svg, i, pl) => { const n = pieceNode(i, pl, sk[pl]); layer(svg, 'pieces').appendChild(n); return n; };
    const loop = { dur: '6s', repeatCount: 'indefinite' };

    // 1. lerakás: egymás után jelennek meg a bábuk
    const a = make('ruleA', 'fa');
    [[0, 0, 0.08], [4, 1, 0.26], [13, 0, 0.44], [10, 1, 0.62]].forEach(([i, pl, t]) => {
      const n = add(a, i, pl);
      anim(n, 'animate', Object.assign({ attributeName: 'opacity', values: '0;0;1;1;0', keyTimes: `0;${t};${t + 0.04};0.92;1` }, loop));
    });

    // 2. mozgatás: egy bábu átcsúszik a szomszédos pontra
    const b = make('ruleB', 'marvany');
    [[0, 0], [9, 1], [13, 1], [22, 0]].forEach(([i, pl]) => add(b, i, pl));
    const mv = add(b, 4, 0);
    const p4 = P(4), p7 = P(7);
    anim(mv, 'animateTransform', { attributeName: 'transform', type: 'translate', values: `${p4.x} ${p4.y};${p4.x} ${p4.y};${p7.x} ${p7.y};${p7.x} ${p7.y};${p4.x} ${p4.y}`, keyTimes: '0;0.2;0.4;0.75;1', dur: '4s', repeatCount: 'indefinite' });

    // 3. ugrás: 3 bábunál bárhová lehet ugrani
    const c = make('ruleC', 'neon');
    [[0, 0], [14, 0], [5, 1], [12, 1], [16, 1], [19, 1]].forEach(([i, pl]) => add(c, i, pl));
    const jp = add(c, 21, 0);
    jp.setAttribute('transform', 'translate(0,0)');
    const s0 = P(21), s1 = P(8);
    anim(jp, 'animateMotion', { path: `M${s0.x},${s0.y} Q${(s0.x + s1.x) / 2},${Math.min(s0.y, s1.y) - 260} ${s1.x},${s1.y}`, keyPoints: '0;0;1;1;0', keyTimes: '0;0.2;0.45;0.75;1', calcMode: 'linear', dur: '4.5s', repeatCount: 'indefinite' });

    // 4. malom: a harmadik bábu lezárja a sort, az ellenfél egyik bábuja eltűnik
    const d = make('ruleD', 'filc');
    add(d, 0, 0); add(d, 1, 0);
    [[9, 1], [13, 1]].forEach(([i, pl]) => add(d, i, pl));
    const third = add(d, 2, 0);
    anim(third, 'animate', Object.assign({ attributeName: 'opacity', values: '0;0;1;1;0', keyTimes: '0;0.15;0.2;0.92;1' }, loop));
    const victim = add(d, 10, 1);
    anim(victim, 'animate', Object.assign({ attributeName: 'opacity', values: '1;1;0;0;1', keyTimes: '0;0.5;0.58;0.95;1' }, loop));
    const l = document.createElementNS(NS, 'line');
    const q0 = P(0), q2 = P(2);
    l.setAttribute('x1', q0.x); l.setAttribute('y1', q0.y); l.setAttribute('x2', q2.x); l.setAttribute('y2', q2.y);
    l.setAttribute('class', 'mill-line p0');
    layer(d, 'mills').appendChild(l);
    anim(l, 'animate', Object.assign({ attributeName: 'opacity', values: '0;0;.9;.9;0', keyTimes: '0;0.2;0.25;0.9;1' }, loop));
  }

  function updateAiNote() {
    const last = store.get('malom-ai-elo', null);
    $('aiCurrent').textContent = last === null ? tr('hero.aiNote') : tr('home.aiCurrent', { n: last, label: eloLabel(Number(last)) });
  }

  function refreshLang() {
    $('pickerTitle').dataset.i18nN = SK.ORDER.length;
    I18N.apply();
    buildPicker($('picker'), 0, prefs.skin, (x) => pickSkin(x));
    if ($('p2Dialog').open) buildPicker($('picker2'), 1, p2Skin, (k) => { p2Skin = k; });
    $('themeStrip').innerHTML = '';
    buildThemeCards($('themeStrip'), 'tstrip');
    if (themeGridBuilt) { $('themeGrid').innerHTML = ''; buildThemeCards($('themeGrid'), 'tprev'); }
    updateMySkin();
    buildFrameEditors();
    buildOrbit();
    updateAiNote();
    const best = store.get('malom-best-elo', null);
    if (best !== null) $('bestEloHome').textContent = tr('home.best', { n: best });
    if ($('settingsDialog').open) buildSoundPanel();
    if ($('aiDialog').open) updateElo(aiElo);
    if (G && !$('game').hidden) { setModeLabel(); render(false); }
  }

  function buildLanding() {
    $('pickerTitle').dataset.i18nN = SK.ORDER.length;
    for (const b of document.querySelectorAll('[data-lang]')) b.addEventListener('click', () => { if (b.dataset.lang !== I18N.lang) { I18N.set(b.dataset.lang); SND.play('select'); } });
    I18N.onChange(refreshLang);
    updateAiNote();
    updateMySkin();
    buildOrbit();
    buildMarquee();
    buildThemeCards($('themeStrip'), 'tstrip');
    buildRules();
    const best = store.get('malom-best-elo', null);
    if (best !== null) { $('bestEloHome').hidden = false; $('bestEloHome').textContent = tr('home.best', { n: best }); }
    for (const b of document.querySelectorAll('[data-action]')) {
      b.addEventListener('click', () => {
        const act = b.dataset.action;
        if (act === 'create') $('btnCreate').click();
        else if (act === 'ai') $('btnAI').click();
        else if (act === 'local') $('btnLocal').click();
      });
    }
    $('btnNavSettings').addEventListener('click', () => openSettings('board'));
  }

  // ---------- indítás ----------
  function init() {
    SK.installDefs();
    I18N.apply();
    SND.armMusic();
    applyTheme(prefs.theme);
    $('nameInput').value = prefs.name;
    buildPicker($('picker'), 0, prefs.skin, (k) => pickSkin(k));
    buildFrameEditors();
    buildLanding();
    buildEmojiBar();
    soundIcon();
    startDemo();
    const code = new URLSearchParams(location.search).get('szoba');
    if (code) {
      const saved = store.get('malom-room', null);
      if (saved && saved.code === code.toUpperCase()) {
        // frissítés után: visszacsatlakozás ugyanabba a székbe
        const s = ensureSocket();
        if (s) s.emit('join', { code: saved.code, token: saved.token }, (res) => {
          if (res.ok) startOnline(res); else { store.del('malom-room'); openJoin(code.toUpperCase()); }
        });
      } else {
        toast(tr('toast.invited'), 4000);
        setTimeout(() => openJoin(code.toUpperCase()), 400);
      }
    }
  }
  init();
})();
