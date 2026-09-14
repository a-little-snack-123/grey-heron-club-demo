import {useState} from 'react';
import {SceneObject} from '../ui/SceneObject';
import {OpenLedger} from '../ui/OpenLedger';
import {ClubNavigation} from './ClubNavigation';
const cases=[
 {name:'封签 · 第一局',note:'已完成的八轮记录。查看每次出签、查验和分差。',tag:'CASE 01',detail:'一张封签，四次出手。公开的记录会留下，没说出口的判断不会。'},
 {name:'俱乐部章程',note:'关于公开记录、查验次数和对局礼仪的旧页。',tag:'RULES 02',detail:'先听完对方，再决定要不要拆开封签。查验不是勇气，是资源。'},
 {name:'人物来访簿',note:'四位原创角色的行事习惯与创作参考。',tag:'PEOPLE 03',detail:'同一张牌桌上，每个人都带着自己的节奏。没有天生的赢家。'},
];
export function Archive({onClose,onOpenLearning}:{onClose:()=>void;onOpenLearning:()=>void}){
 const [selected,setSelected]=useState(0),[opened,setOpened]=useState(false);
 const current=cases[selected];
 return <main className="club-stage3 object-scene folio-scene folio-archive" aria-label="旧案室">
  <ClubNavigation compact onBack={onClose}/>
  <header className="folio-heading"><div><small>ARCHIVE OF CASES</small><h1>旧案室</h1></div><button className="folio-link" onClick={onClose}>离开旧案室</button></header>
  {opened?<OpenLedger labels={['案卷','卷宗索引']} left={<><small>{current.tag}</small><h2>{current.name}</h2><div className="leaf-scroll"><p>{current.note}</p><p>{current.detail}</p></div>{selected===0&&<button className="paper-link" onClick={onOpenLearning}>打开博弈笔记 →</button>}<button className="paper-link" onClick={()=>setOpened(false)}>合上卷宗</button></>} right={<><h2>卷宗索引</h2><nav className="folio-index" aria-label="旧案索引">{cases.map((c,i)=><button key={c.name} type="button" aria-pressed={i===selected} onClick={()=>setSelected(i)}><small>0{i+1}</small><span>{c.name}</span></button>)}</nav><p className="folio-marginalia">留下来的，不只是结果。</p></>}/>:<div className="closed-ledger-stage"><SceneObject asset="casebook" label="翻开旧案卷宗" onClick={()=>setOpened(true)}><div className="cover-inscription"><b>旧案卷宗</b><small>CASE ARCHIVE</small></div></SceneObject></div>}
 </main>;
}
