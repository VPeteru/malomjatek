/* Malom Aréna — online multiplayer szerver (Express + Socket.IO) */
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const E = require('./shared/engine.js');

const PORT = process.env.PORT || 3000;
const EMOJIS = ['👍', '😂', '😮', '😡', '🔥', '👏', '🤝', '😎'];
const ROOM_TTL_MS = 1000 * 60 * 60 * 3; // 3 óra inaktivitás után törlődik

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/engine.js', (_req, res) => res.sendFile(path.join(__dirname, 'shared', 'engine.js')));
app.get('/ai.js', (_req, res) => res.sendFile(path.join(__dirname, 'shared', 'ai.js')));
app.get('/healthz', (_req, res) => res.send('ok'));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: false } });

/** @type {Map<string, any>} */
const rooms = new Map();

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = '';
    for (let i = 0; i < 6; i++) code += chars[crypto.randomInt(chars.length)];
  } while (rooms.has(code));
  return code;
}

function cleanName(n, fallback) {
  const s = String(n || '').replace(/[<>]/g, '').trim().slice(0, 20);
  return s || fallback;
}

function cleanSkin(s) {
  // a figurák listája a kliensben van; itt csak a formátumot ellenőrizzük
  return typeof s === 'string' && /^[a-z0-9-]{1,24}$/.test(s) ? s : 'klasszikus';
}

function publicRoom(room) {
  return {
    code: room.code,
    state: room.state,
    players: room.players.map((p) =>
      p ? { name: p.name, skin: p.skin, color: p.color, online: !!p.socketId } : null
    ),
    score: room.score,
    rematch: room.rematch
  };
}

function broadcast(room) {
  room.updated = Date.now();
  io.to(room.code).emit('room', publicRoom(room));
}

function seatOf(room, socketId) {
  return room.players.findIndex((p) => p && p.socketId === socketId);
}

io.on('connection', (socket) => {
  let current = null; // { code, seat }

  function leaveCurrent() {
    if (!current) return;
    const room = rooms.get(current.code);
    if (room && room.players[current.seat] && room.players[current.seat].socketId === socket.id) {
      room.players[current.seat].socketId = null;
      broadcast(room);
    }
    socket.leave(current.code);
    current = null;
  }

  socket.on('create', (data, cb) => {
    if (typeof cb !== 'function') return;
    leaveCurrent();
    const code = makeCode();
    const token = crypto.randomBytes(16).toString('hex');
    const room = {
      code,
      state: E.newGame(),
      players: [
        { token, name: cleanName(data && data.name, 'Játékos 1'), skin: cleanSkin(data && data.skin), color: 0, socketId: socket.id },
        null
      ],
      score: [0, 0],
      rematch: [false, false],
      starter: 0,
      updated: Date.now()
    };
    rooms.set(code, room);
    socket.join(code);
    current = { code, seat: 0 };
    cb({ ok: true, code, token, seat: 0 });
    broadcast(room);
  });

  socket.on('join', (data, cb) => {
    if (typeof cb !== 'function') return;
    const code = String((data && data.code) || '').toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) return cb({ ok: false, code: 'no_room', error: 'Nincs ilyen szoba. Ellenőrizd a kódot!' });
    // visszacsatlakozás tokennel
    if (data.token) {
      const seat = room.players.findIndex((p) => p && p.token === data.token);
      if (seat !== -1) {
        leaveCurrent();
        room.players[seat].socketId = socket.id;
        socket.join(code);
        current = { code, seat };
        cb({ ok: true, code, token: data.token, seat });
        broadcast(room);
        return;
      }
    }
    if (room.players[1]) return cb({ ok: false, code: 'room_full', error: 'A szoba már tele van.' });
    leaveCurrent();
    const token = crypto.randomBytes(16).toString('hex');
    room.players[1] = {
      token,
      name: cleanName(data.name, 'Játékos 2'),
      skin: cleanSkin(data.skin),
      color: 1,
      socketId: socket.id
    };
    socket.join(code);
    current = { code, seat: 1 };
    cb({ ok: true, code, token, seat: 1 });
    io.to(code).emit('toast', { key: 'joined', name: room.players[1].name, text: `${room.players[1].name} csatlakozott! Indulhat a játék.` });
    broadcast(room);
  });

  socket.on('move', (m, cb) => {
    const reply = typeof cb === 'function' ? cb : () => {};
    if (!current) return reply({ ok: false, code: 'not_in_room', error: 'Nem vagy szobában.' });
    const room = rooms.get(current.code);
    if (!room) return reply({ ok: false, code: 'room_gone', error: 'A szoba megszűnt.' });
    if (!room.players[1]) return reply({ ok: false, code: 'wait_opp', error: 'Várj, amíg az ellenfeled csatlakozik.' });
    const seat = seatOf(room, socket.id);
    if (seat === -1 || room.state.turn !== seat) return reply({ ok: false, code: 'not_turn', error: 'Nem te következel.' });
    const clean = m && {
      type: m.type,
      to: Number.isInteger(m.to) ? m.to : undefined,
      from: Number.isInteger(m.from) ? m.from : undefined,
      at: Number.isInteger(m.at) ? m.at : undefined
    };
    if (!E.isLegal(room.state, clean)) return reply({ ok: false, code: 'illegal', error: 'Szabálytalan lépés.' });
    room.state = E.apply(room.state, clean);
    if (room.state.winner !== null) room.score[room.state.winner]++;
    reply({ ok: true });
    broadcast(room);
  });

  socket.on('resign', () => {
    if (!current) return;
    const room = rooms.get(current.code);
    if (!room || room.state.winner !== null || room.state.draw || !room.players[1]) return;
    const seat = seatOf(room, socket.id);
    if (seat === -1) return;
    room.state = E.resign(room.state, seat);
    room.score[room.state.winner]++;
    broadcast(room);
  });

  socket.on('rematch', () => {
    if (!current) return;
    const room = rooms.get(current.code);
    if (!room) return;
    const seat = seatOf(room, socket.id);
    if (seat === -1) return;
    if (room.state.winner === null && !room.state.draw) return;
    room.rematch[seat] = true;
    if (room.rematch[0] && room.rematch[1]) {
      room.starter = 1 - room.starter;
      room.state = E.newGame();
      room.state.turn = room.starter;
      room.state.positions = {};
      room.state.positions[E.posKey(room.state)] = 1;
      room.rematch = [false, false];
      io.to(room.code).emit('toast', { key: 'rematch', text: 'Visszavágó! Most a másik játékos kezd.' });
    }
    broadcast(room);
  });

  socket.on('skin', (skin) => {
    if (!current) return;
    const room = rooms.get(current.code);
    if (!room) return;
    const seat = seatOf(room, socket.id);
    if (seat === -1) return;
    room.players[seat].skin = cleanSkin(skin);
    broadcast(room);
  });

  socket.on('react', (emoji) => {
    if (!current || !EMOJIS.includes(emoji)) return;
    const room = rooms.get(current.code);
    if (!room) return;
    const seat = seatOf(room, socket.id);
    if (seat === -1) return;
    const now = Date.now();
    if (socket.data.lastReact && now - socket.data.lastReact < 700) return; // spam védelem
    socket.data.lastReact = now;
    io.to(room.code).emit('react', { seat, emoji });
  });

  socket.on('leave', leaveCurrent);

  socket.on('disconnect', leaveCurrent);
});

// régi szobák takarítása
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.updated > ROOM_TTL_MS) rooms.delete(code);
  }
}, 1000 * 60 * 10).unref();

server.listen(PORT, () => {
  console.log(`Malom Aréna fut: http://localhost:${PORT}`);
});

module.exports = { server, rooms };
