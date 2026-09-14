import type {GameView,Round} from '../../../server/engine';
export const signed=(n:number)=>n>0?`+${n}`:String(n);
export function analyzeRound(r:Round){
 const inspector=r.submitter==='player'?1:0;
 const pair=r.truth?(r.inspected?[2,1]:[3,-1]):(r.inspected?[4,-2]:[-3,2]);
 const alternative=pair[r.submitter==='player'?0:1];
 return {outcome:`${r.truth?'真签':'假签'}${r.inspected?'被查验':'获准放行'}`,alternative,
  canSwitch:r.inspected||r.checksBefore[inspector]>0,
  explanation:r.inspected?(r.truth?'拆开的是一张真签。出签者得 3 分，查验者扣 1 分。':'查验拦下了假签。出签者扣 3 分，查验者得 2 分。'):(r.truth?'真签放行。出签者得 2 分，查验者得 1 分。':'假签通过。出签者得 4 分，查验者扣 2 分。'),
  resource:r.inspected?`查验前剩 ${r.checksBefore[inspector]} 次，这次用掉 1 次。后面的封签因此少了一次查证机会。`:`查验者保留了 ${r.checksBefore[inspector]} 次机会。保留次数有后续价值，但不能抵消本轮已经发生的扣分。`,
 };
}
export function analyzeGame(g:GameView){
 const player=g.history.filter(r=>r.submitter==='player');
 const inspected=g.history.filter(r=>r.submitter==='bot'&&r.inspected);
 const missed=g.history.filter(r=>r.submitter==='bot'&&!r.inspected&&!r.truth);
 return {submitted:player.length,fakes:player.filter(r=>!r.truth).length,inspected:inspected.length,caught:inspected.filter(r=>!r.truth).length,missed:missed.length,
  decisive:[...g.history].sort((a,b)=>Math.abs(b.delta[0]-b.delta[1])-Math.abs(a.delta[0]-a.delta[1]))[0],
  explanation:inspected.length===0?'你还没有使用查验。留次数可以增加后续选择，但遇到假签也会付出放行的代价。':`你用了 ${inspected.length} 次查验，其中 ${inspected.filter(r=>!r.truth).length} 次查到假签。可以从这几轮开始，比较当时的信息与剩余次数。`,
 };
}
