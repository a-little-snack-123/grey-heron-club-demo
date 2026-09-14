import {useState} from 'react';
import type {GameView} from '../../../server/engine';
import {OpenLedger} from '../../ui/OpenLedger';
import {SceneObject} from '../../ui/SceneObject';
import {analyzeGame,signed} from './analysis';
const lessons=[{name:'信息不对称',english:'HIDDEN INFORMATION',text:'出签者知道真假，查验者只能看到已经公开的记录。同样一句话，出真签或假签的人都可能说，所以语气不能代替证据。',life:'核对二手商品时，先确认哪些信息卖家知道而你不知道，再决定检查什么。礼貌和熟络都不能替代查验。'},
{name:'信号与承诺',english:'SIGNALS & COMMITMENTS',text:'“你尽管查”没有额外代价，也不约束出签者。这类话可以影响印象，但不具备保证真签的效力。',life:'谈合作时，把承诺变成可核验的里程碑与交付条件。比起猜对方是不是诚恳，更有用的是确认出了问题怎么办。'},
{name:'混合策略',english:'MIXED STRATEGIES',text:'如果固定只出真签，或者固定最后两轮才查验，对手就能针对这个习惯。混合策略让同一个情境下不止一种选择有机会发生。纳什均衡描述的是双方都不愿单独改变策略的状态，不保证每轮获胜。',life:'别机械照搬游戏里的随机化。现实决策可以先写出对方可能的反应，再检查自己的计划是否过分依赖某一种反应。'},
{name:'有限的查验',english:'THE COST OF CHECKING',text:'这次用了查验，下一轮就少一次机会。判断时既要看当前风险，也要看后面还剩多少轮。单轮划算的决定，放进整局未必最好。',life:'检查合同、验收成果都有时间成本。把有限的核查精力放到影响大、难以补救的事项上；不要把这种分配等同于识破一个人。'}];
export function Learning({game,onBack,onAgain}:{game:GameView|null;onBack:()=>void;onAgain:()=>void}){
 const [topic,setTopic]=useState(0),[chance,setChance]=useState(35),[view,setView]=useState<'application'|'trial'|'record'>('application');
 const a=game?analyzeGame(game):null,lesson=lessons[topic];
 return <main className="club-stage3 object-scene folio-scene folio-learning" aria-label="博弈原理解析">
  <header className="folio-heading"><div><small>STRATEGY NOTES</small><h1 tabIndex={-1}>博弈原理解析</h1><p>把已知的结果，和当时能知道的信息分开看。</p></div></header>
  <OpenLedger labels={['原理笔记','应用与试算']} left={<><nav className="ink-tabs" aria-label="笔记目录">{lessons.map((l,i)=><button key={l.name} aria-pressed={topic===i} onClick={()=>setTopic(i)}>{l.name}</button>)}</nav><h2>{lesson.name}</h2><div className="leaf-scroll" key={topic}><p>{lesson.text}</p></div></>} right={<><nav className="ink-tabs" aria-label="笔记内容"><button aria-pressed={view==='application'} onClick={()=>setView('application')}>现实应用</button><button aria-pressed={view==='trial'} onClick={()=>setView('trial')}>试算一轮</button><button aria-pressed={view==='record'} onClick={()=>setView('record')}>本局轨迹</button></nav><div className="leaf-scroll" key={view+topic}>
   {view==='application'?<><h3>{['核验信息','谈判条件','准备备选方案','分配核查精力'][topic]}</h3><p>{lesson.life}</p><h3>回到这张桌子</h3><p>{a?.decisive?'第 '+a.decisive.round+' 轮出现了本局较大的单轮分差。回看时先列出当时剩余的次数与公开的历史，再比较其他可选行动。':'出签、查验和放行都有明确的代价。先把得分表看清楚，再考虑怎么回应对手。'}</p><p className="folio-marginalia">本页根据规则和已公开记录生成，不从游戏表现诊断性格或识别现实中的谎言。</p></>:view==='trial'?<div className="folio-trial"><h3>查验还是放行</h3><label htmlFor="fake-rate">假设假签概率为 {chance}%</label><input id="fake-rate" type="range" min="0" max="100" value={chance} onChange={e=>setChance(Number(e.target.value))}/><dl><div><dt>查验</dt><dd>{(3*chance/100-1).toFixed(2)}</dd></div><div><dt>放行</dt><dd>{(1-3*chance/100).toFixed(2)}</dd></div></dl><p>只计算查验者本轮的期望得分，暂不计后续机会成本。概率是你设定的假设，不能由一句台词直接推得。</p></div>:<><h3>你的决策轨迹</h3>{game?.history.length?<><ol className="folio-history">{game.history.map(r=><li key={r.round}><span>第 {r.round} 轮 · {r.submitter==='player'?'出'+(r.truth?'真':'假')+'签':r.inspected?'查验对手':'放行对手'}</span><b>{signed(r.delta[0])} 分</b></li>)}</ol><p>{a?.explanation}</p></>:<p>完成一轮封签后，这里会记录你当时的选择和实际得分。</p>}<p className="folio-marginalia">一局的样本很少，不足以给你贴上“博弈人格”的标签。</p></>}
  </div></>}/>
  <footer className="folio-reveal-actions"><SceneObject asset="note" label={game?'返回对局':'返回大厅'} onClick={onBack} className="confirm-note"><div className="note-inscription"><b>返回{game?'对局':'大厅'}</b></div></SceneObject><SceneObject asset="note" label="更换对手" onClick={onAgain} className="confirm-note"><div className="note-inscription"><b>更换对手</b></div></SceneObject></footer>
 </main>;
}
