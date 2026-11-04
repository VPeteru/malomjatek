/* Gépi ellenfél: iteratívan mélyülő minimax alfa-béta vágással. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./engine.js'));
  else root.MalomAI = factory(root.MalomEngine);
})(typeof self !== 'undefined' ? self : this, function (E) {
  'use strict';

  const WIN = 100000;

  function countPotential(board, p) {
    // két saját bábu + egy üres pont egy malomvonalon
    let n = 0;
    for (const m of E.MILLS) {
      let mine = 0, empty = 0;
      for (const x of m) {
        if (board[x] === p) mine++;
        else if (board[x] === null) empty++;
      }
      if (mine === 2 && empty === 1) n++;
    }
    return n;
  }

  function countMills(board, p) {
    let n = 0;
    for (const m of E.MILLS) if (board[m[0]] === p && board[m[1]] === p && board[m[2]] === p) n++;
    return n;
  }

  function mobility(s, p) {
    if (E.phaseOf(s, p) !== 'move') return 0;
    let n = 0;
    for (let i = 0; i < 24; i++) {
      if (s.board[i] !== p) continue;
      for (const j of E.ADJ[i]) if (s.board[j] === null) n++;
    }
    return n;
  }

  function evaluate(s, me) {
    const op = 1 - me;
    if (s.winner === me) return WIN;
    if (s.winner === op) return -WIN;
    if (s.draw) return 0;
    let v = 0;
    v += 120 * ((s.onBoard[me] + s.inHand[me]) - (s.onBoard[op] + s.inHand[op]));
    v += 25 * (countMills(s.board, me) - countMills(s.board, op));
    v += 12 * (countPotential(s.board, me) - countPotential(s.board, op));
    v += 3 * (mobility(s, me) - mobility(s, op));
    // a középső kereszteződések (4 szomszéd) értékesebbek
    for (const x of [4, 10, 13, 19]) {
      if (s.board[x] === me) v += 4;
      else if (s.board[x] === op) v -= 4;
    }
    if (s.pendingRemove) v += s.turn === me ? 100 : -100;
    return v;
  }

  function orderMoves(s, moves) {
    // malmot záró lépések és ütések előre
    const p = s.turn;
    return moves
      .map((m) => {
        let score = 0;
        if (m.type === 'remove') score = 50;
        else {
          const b = s.board.slice();
          if (m.type === 'move') b[m.from] = null;
          b[m.to] = p;
          if (E.millAt(b, m.to, p)) score = 100;
          b[m.to] = 1 - p;
          if (E.millAt(b, m.to, 1 - p)) score += 60; // ellenfél malmának blokkolása
        }
        return { m, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.m);
  }

  function search(s, depth, alpha, beta, me, deadline, ctx) {
    ctx.nodes++;
    if ((ctx.nodes & 1023) === 0 && Date.now() > deadline) throw ctx.timeout;
    if (depth === 0 || s.winner !== null || s.draw) {
      const e = evaluate(s, me);
      return e > WIN / 2 ? e + depth : e < -WIN / 2 ? e - depth : e;
    }
    const moves = orderMoves(s, E.legalMoves(s));
    if (moves.length === 0) return evaluate(s, me);
    const maximizing = s.turn === me;
    if (maximizing) {
      let best = -Infinity;
      for (const m of moves) {
        const v = search(E.apply(s, m), depth - 1, alpha, beta, me, deadline, ctx);
        if (v > best) best = v;
        if (best > alpha) alpha = best;
        if (alpha >= beta) break;
      }
      return best;
    } else {
      let best = Infinity;
      for (const m of moves) {
        const v = search(E.apply(s, m), depth - 1, alpha, beta, me, deadline, ctx);
        if (v < best) best = v;
        if (best < beta) beta = best;
        if (alpha >= beta) break;
      }
      return best;
    }
  }

  // Az erősséget egy 0–3000 közötti Élő-szám adja meg.
  // Alacsony Élőn a gép gyakran véletlenszerűen lép és rosszul mérlegel,
  // magas Élőn mélyebben számol és nem hibázik.
  const LEGACY = { easy: 500, medium: 1300, hard: 2600 };

  function configFor(level) {
    let elo = typeof level === 'number' ? level : (LEGACY[level] !== undefined ? LEGACY[level] : 1300);
    elo = Math.max(0, Math.min(3000, elo));
    const t = elo / 3000;
    return {
      elo,
      maxDepth: Math.max(1, Math.min(9, 1 + Math.floor(elo / 375))),
      time: Math.round(120 + 1900 * t * t),
      randomness: elo >= 1100 ? 0 : 0.85 * Math.pow(1 - elo / 1100, 1.6),
      noise: Math.max(0, 260 * Math.pow(1 - Math.min(1, elo / 2300), 1.4)) // értékelési "zaj"
    };
  }

  function gauss() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function chooseMove(state, level) {
    const cfg = configFor(level);
    const root = E.clone(state);
    root.positions = {}; // a keresésben nem követjük az ismétlést
    const me = root.turn;
    let moves = E.legalMoves(root);
    if (moves.length === 0) return null;
    if (moves.length === 1) return moves[0];
    if (Math.random() < cfg.randomness) return moves[Math.floor(Math.random() * moves.length)];

    const deadline = Date.now() + cfg.time;
    const ctx = { nodes: 0, timeout: {} };
    let scoredFinal = null;
    moves = orderMoves(root, moves);
    for (let depth = 1; depth <= cfg.maxDepth; depth++) {
      try {
        const scored = [];
        let bestVal = -Infinity;
        for (const m of moves) {
          const v = search(E.apply(root, m), depth - 1, -Infinity, Infinity, me, deadline, ctx);
          scored.push({ m, v });
          if (v > bestVal) bestVal = v;
        }
        scoredFinal = scored;
        moves = scored.slice().sort((a, b) => b.v - a.v).map((x) => x.m);
        if (bestVal >= WIN / 2) break;
      } catch (e) {
        if (e === ctx.timeout) break;
        throw e;
      }
    }
    if (!scoredFinal) return moves[0];
    // zaj hozzáadása: gyengébb gép néha a második-harmadik legjobbat választja
    let best = null, bestV = -Infinity;
    for (const x of scoredFinal) {
      const v = x.v + (cfg.noise ? gauss() * cfg.noise : 0);
      if (v > bestV) { bestV = v; best = x.m; }
    }
    return best;
  }

  // Élő-szint elnevezések a felülethez
  function eloLabel(elo) {
    if (elo < 400) return 'Kezdő';
    if (elo < 900) return 'Hobbijátékos';
    if (elo < 1400) return 'Haladó';
    if (elo < 1900) return 'Klubjátékos';
    if (elo < 2300) return 'Mester';
    if (elo < 2700) return 'Nemzetközi mester';
    return 'Nagymester';
  }

  return { chooseMove, evaluate, configFor, eloLabel };
});
