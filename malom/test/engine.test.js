const assert = require('assert');
const E = require('../shared/engine.js');
const AI = require('../shared/ai.js');
// adjacency symmetric
E.ADJ.forEach((a,i)=>a.forEach(j=>assert(E.ADJ[j].includes(i),`adj ${i}-${j}`)));
// mills are lines of adjacent
E.MILLS.forEach(m=>{assert(E.ADJ[m[0]].includes(m[1])&&E.ADJ[m[1]].includes(m[2]),'mill '+m)});
// mill + remove
let s=E.newGame();
const seq=[[0,0],[1,9],[0,1],[1,10],[0,2]];
for(const [p,to] of seq){assert.equal(s.turn,p);s=E.apply(s,{type:'place',to});}
assert(s.pendingRemove && s.turn===0);
assert.deepEqual(E.legalMoves(s).map(m=>m.at).sort((a,b)=>a-b),[9,10]);
s=E.apply(s,{type:'remove',at:9});
assert.equal(s.turn,1); assert.equal(s.onBoard[1],1);
// mill protection: pieces in mill not removable unless all
// random full games terminate
for(let g=0;g<300;g++){let t=E.newGame(),n=0;while(t.winner===null&&!t.draw&&n<2000){const ms=E.legalMoves(t);t=E.apply(t,ms[Math.floor(Math.random()*ms.length)]);n++;}assert(t.winner!==null||t.draw,'terminates');}
// AI vs random
let wins=0;for(let g=0;g<6;g++){let t=E.newGame(),n=0;while(t.winner===null&&!t.draw&&n<400){const m=t.turn===0?AI.chooseMove(t,'medium'):(ms=>ms[Math.floor(Math.random()*ms.length)])(E.legalMoves(t));t=E.apply(t,m);n++;}if(t.winner===0)wins++;}
console.log('AI medium wins vs random:',wins,'/6');
const t0=Date.now();AI.chooseMove(E.newGame(),'hard');console.log('hard first move ms',Date.now()-t0);
console.log('ENGINE OK');
