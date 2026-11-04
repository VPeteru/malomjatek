/* Malom (Nine Men's Morris) szabálymotor — böngészőben és Node.js-ben is fut. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MalomEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 24 pont koordinátái egy 7x7-es rácson
  const COORDS = [
    [0, 0], [3, 0], [6, 0],
    [1, 1], [3, 1], [5, 1],
    [2, 2], [3, 2], [4, 2],
    [0, 3], [1, 3], [2, 3], [4, 3], [5, 3], [6, 3],
    [2, 4], [3, 4], [4, 4],
    [1, 5], [3, 5], [5, 5],
    [0, 6], [3, 6], [6, 6]
  ];

  const ADJ = [
    [1, 9], [0, 2, 4], [1, 14],
    [4, 10], [1, 3, 5, 7], [4, 13],
    [7, 11], [4, 6, 8], [7, 12],
    [0, 10, 21], [3, 9, 11, 18], [6, 10, 15], [8, 13, 17], [5, 12, 14, 20], [2, 13, 23],
    [11, 16], [15, 17, 19], [12, 16],
    [10, 19], [16, 18, 20, 22], [13, 19],
    [9, 22], [19, 21, 23], [14, 22]
  ];

  const MILLS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20], [21, 22, 23],
    [0, 9, 21], [3, 10, 18], [6, 11, 15], [1, 4, 7], [16, 19, 22], [8, 12, 17], [5, 13, 20], [2, 14, 23]
  ];

  const MILLS_OF = Array.from({ length: 24 }, () => []);
  MILLS.forEach((m) => m.forEach((p) => MILLS_OF[p].push(m)));

  const PIECES = 9;
  const NO_CAPTURE_LIMIT = 50; // ennyi lépés ütés nélkül a mozgató fázisban = döntetlen
  const REPETITION_LIMIT = 3;

  function newGame() {
    const s = {
      board: Array(24).fill(null),
      turn: 0,
      inHand: [PIECES, PIECES],
      onBoard: [0, 0],
      pendingRemove: false,
      winner: null,
      draw: false,
      endReason: null,
      moveCount: 0,
      noCapture: 0,
      positions: {},
      lastMove: null,
      millJustFormed: null
    };
    s.positions[posKey(s)] = 1;
    return s;
  }

  function clone(s) {
    return {
      board: s.board.slice(),
      turn: s.turn,
      inHand: s.inHand.slice(),
      onBoard: s.onBoard.slice(),
      pendingRemove: s.pendingRemove,
      winner: s.winner,
      draw: s.draw,
      endReason: s.endReason,
      moveCount: s.moveCount,
      noCapture: s.noCapture,
      positions: Object.assign({}, s.positions),
      lastMove: s.lastMove ? Object.assign({}, s.lastMove) : null,
      millJustFormed: s.millJustFormed ? s.millJustFormed.slice() : null
    };
  }

  function posKey(s) {
    let k = '';
    for (let i = 0; i < 24; i++) k += s.board[i] === null ? '.' : s.board[i];
    return k + s.turn + s.inHand[0] + ',' + s.inHand[1] + (s.pendingRemove ? 'R' : '');
  }

  function phaseOf(s, p) {
    if (s.inHand[p] > 0) return 'place';
    if (s.onBoard[p] === 3) return 'fly';
    return 'move';
  }

  function millAt(board, pos, player) {
    for (const m of MILLS_OF[pos]) {
      if (board[m[0]] === player && board[m[1]] === player && board[m[2]] === player) return m;
    }
    return null;
  }

  function inMill(board, pos) {
    const p = board[pos];
    if (p === null) return false;
    return millAt(board, pos, p) !== null;
  }

  function removable(s) {
    const opp = 1 - s.turn;
    const all = [];
    const free = [];
    for (let i = 0; i < 24; i++) {
      if (s.board[i] === opp) {
        all.push(i);
        if (!inMill(s.board, i)) free.push(i);
      }
    }
    return free.length ? free : all;
  }

  // A soron lévő játékos szabályos lépései
  function legalMoves(s) {
    if (s.winner !== null || s.draw) return [];
    const p = s.turn;
    const moves = [];
    if (s.pendingRemove) {
      for (const at of removable(s)) moves.push({ type: 'remove', at });
      return moves;
    }
    const ph = phaseOf(s, p);
    if (ph === 'place') {
      for (let i = 0; i < 24; i++) if (s.board[i] === null) moves.push({ type: 'place', to: i });
    } else {
      for (let from = 0; from < 24; from++) {
        if (s.board[from] !== p) continue;
        if (ph === 'fly') {
          for (let to = 0; to < 24; to++) if (s.board[to] === null) moves.push({ type: 'move', from, to });
        } else {
          for (const to of ADJ[from]) if (s.board[to] === null) moves.push({ type: 'move', from, to });
        }
      }
    }
    return moves;
  }

  function sameMove(a, b) {
    return a.type === b.type && a.to === b.to && a.from === b.from && a.at === b.at;
  }

  function isLegal(s, m) {
    if (!m || typeof m !== 'object') return false;
    return legalMoves(s).some((x) => sameMove(x, m));
  }

  function endTurn(s) {
    s.turn = 1 - s.turn;
    // Győzelem / vereség ellenőrzése a következő játékosra
    const p = s.turn;
    if (s.inHand[p] + s.onBoard[p] < 3) {
      s.winner = 1 - p;
      s.endReason = 'pieces';
      return;
    }
    if (phaseOf(s, p) === 'move' && legalMoves(s).length === 0) {
      s.winner = 1 - p;
      s.endReason = 'blocked';
      return;
    }
    const k = posKey(s);
    s.positions[k] = (s.positions[k] || 0) + 1;
    if (s.positions[k] >= REPETITION_LIMIT) {
      s.draw = true;
      s.endReason = 'repetition';
      return;
    }
    if (s.noCapture >= NO_CAPTURE_LIMIT) {
      s.draw = true;
      s.endReason = 'nocapture';
    }
  }

  // Lépés végrehajtása (nem ellenőriz — ehhez isLegal kell). Új állapotot ad vissza.
  function apply(state, m) {
    const s = clone(state);
    const p = s.turn;
    s.millJustFormed = null;
    s.lastMove = Object.assign({ player: p }, m);
    if (m.type === 'remove') {
      s.board[m.at] = null;
      s.onBoard[1 - p]--;
      s.pendingRemove = false;
      s.noCapture = 0;
      s.moveCount++;
      endTurn(s);
      return s;
    }
    let to;
    if (m.type === 'place') {
      s.board[m.to] = p;
      s.inHand[p]--;
      s.onBoard[p]++;
      to = m.to;
    } else {
      s.board[m.from] = null;
      s.board[m.to] = p;
      to = m.to;
      if (s.inHand[0] === 0 && s.inHand[1] === 0) s.noCapture++;
    }
    s.moveCount++;
    const mill = millAt(s.board, to, p);
    if (mill) {
      s.millJustFormed = mill.slice();
      const opp = 1 - p;
      let any = false;
      for (let i = 0; i < 24; i++) if (s.board[i] === opp) { any = true; break; }
      if (any) {
        s.pendingRemove = true;
        return s; // ugyanaz a játékos jön: levesz egy bábut
      }
    }
    endTurn(s);
    return s;
  }

  function resign(state, player) {
    const s = clone(state);
    s.winner = 1 - player;
    s.endReason = 'resign';
    return s;
  }

  return {
    COORDS, ADJ, MILLS, PIECES,
    newGame, clone, legalMoves, isLegal, apply, resign, phaseOf, removable, inMill, millAt, posKey
  };
});
