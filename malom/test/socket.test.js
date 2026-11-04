const { io } = require('socket.io-client');
const E = require('../shared/engine.js');
const URL='http://localhost:3000';
const ask=(s,ev,d)=>new Promise(r=>s.emit(ev,d,r));
(async()=>{
  const a=io(URL),b=io(URL);let room=null;
  a.on('room',r=>room=r);
  const c=await ask(a,'create',{name:'A',skin:'robot'});
  const j=await ask(b,'join',{code:c.code,name:'B',skin:'bagoly'});
  console.log('join',j.ok,j.seat);
  const full=await ask(io(URL),'join',{code:c.code,name:'C'});console.log('third:',full.error);
  // out of turn
  console.log('oot:',(await ask(b,'move',{type:'place',to:0})).error);
  console.log('illegal:',(await ask(a,'move',{type:'move',from:0,to:1})).error);
  const socks=[a,b];let n=0;
  while(true){await new Promise(r=>setTimeout(r,15));const s=room.state;if(s.winner!==null||s.draw)break;const ms=E.legalMoves(s);const r=await ask(socks[s.turn],'move',ms[Math.floor(Math.random()*ms.length)]);if(!r.ok){console.log('fail',r);break;}n++;}
  await new Promise(r=>setTimeout(r,50));
  console.log('ended after',n,'winner',room.state.winner,'draw',room.state.draw,room.state.endReason,'score',room.score);
  // reconnect b with token
  b.disconnect(); await new Promise(r=>setTimeout(r,100));
  console.log('b online after dc:',room.players[1].online);
  const b2=io(URL);const rj=await ask(b2,'join',{code:c.code,token:j.token});console.log('rejoin seat',rj.seat);
  a.emit('rematch');b2.emit('rematch');await new Promise(r=>setTimeout(r,150));
  console.log('rematch moveCount',room.state.moveCount,'turn',room.state.turn);
  process.exit(0);
})();
