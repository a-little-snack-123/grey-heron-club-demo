import {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {type RoleId} from './content';
import type {GameView,Action,Difficulty} from '../server/engine';
import {ClubEntrance} from './components/ClubEntrance';
import {GameLobby} from './components/GameLobby';
import {Preparation} from './components/Preparation';
import {Selection} from './components/Selection';
import {SealGame,Reveal} from './games/seal/SealGame';
import {Learning} from './games/seal/Learning';
import {RulesBook} from './games/seal/Rules';
import {Archive} from './components/Archive';
import {MembersBook} from './components/MembersBook';
import {GameDossier} from './components/GameDossier';
import {ClubNavigation,ClubNavigationContext} from './components/ClubNavigation';
import type {GameRecord} from './games/registry';
import './style.css';
import './style-final.css';
import './batch2.css';
import './ui/club.css';
import './ui/folio.css';
import './ui/typography.css';
import './ui/site-folio.css';
import './ui/rooms-v7.css';
const API=import.meta.env.VITE_API_BASE||'/api';
type Ticket={id:string;token:string};
const screens=['entrance','lobby','rules','identity','opponent','game','learn'] as const;
type Screen=typeof screens[number];
function readScreen():Screen{const s=location.hash.slice(2);return screens.includes(s as Screen)?s as Screen:'entrance';}
function readTicket():Ticket|null{try{const t=JSON.parse(localStorage.getItem('heron-game')||'null');return t&&typeof t.id==='string'&&typeof t.token==='string'?t:null;}catch{return null;}}
function App(){
 const [screen,setScreen]=useState<Screen>(readScreen),[role,setRole]=useState<RoleId|null>(null),[opponent,setOpponent]=useState<RoleId|null>(null);
 const [difficulty,setDifficulty]=useState<Difficulty>('tactical'),[learning,setLearning]=useState(true);
 const [game,setGame]=useState<GameView|null>(null),[ticket,setTicket]=useState<Ticket|null>(readTicket);
 const [busy,setBusy]=useState(false),[restoring,setRestoring]=useState(!!ticket),[error,setError]=useState('');
 const [modal,setModal]=useState<'rules'|'members'|'archive'|null>(null),[future,setFuture]=useState<GameRecord|null>(null);
 const archiveRef=useRef<HTMLDialogElement>(null);
 const rulesReturn=useRef<'members'|'archive'|null>(null);
 function openRules(){rulesReturn.current=modal==='rules'?rulesReturn.current:modal;setModal('rules');}
 const lock=useRef(false),screenTrail=useRef<Screen[]>([]);
 function back(){const fallback:Record<Screen,Screen>={entrance:'lobby',lobby:'entrance',rules:'lobby',identity:'rules',opponent:'identity',game:'opponent',learn:game?'game':'lobby'};const previous=screenTrail.current.pop()||fallback[screen];location.hash=`/${previous}`;setScreen(previous);}
 function go(s:Screen){if(s!==screen)screenTrail.current.push(screen);location.hash=`/${s}`;setScreen(s);}
 useEffect(()=>{const changed=()=>setScreen(readScreen());window.addEventListener('hashchange',changed);return ()=>window.removeEventListener('hashchange',changed);},[]);
 useEffect(()=>{document.title=`${screen==='entrance'?'开始界面':screen==='lobby'?'游戏大厅':screen==='learn'?'博弈笔记':'封签'} · Grey Heron Club`;window.scrollTo(0,0);document.querySelector<HTMLElement>('h1')?.focus({preventScroll:true});},[screen]);
 useEffect(()=>{const el=archiveRef.current;if(modal==='archive'&&el&&!el.open){try{el.showModal();}catch{el.setAttribute('open','');}}return ()=>{if(el?.open)el.close();};},[modal]);
 useEffect(()=>{if(!ticket)return;let active=true;fetch(`${API}/games/${ticket.id}`,{headers:{Authorization:`Bearer ${ticket.token}`}}).then(async r=>{if(!r.ok)throw Error('上一局暂时没有载入，可以重试。');const g=await r.json();if(active){setGame(g);setRole(g.role);setOpponent(g.opponent);}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setRestoring(false);});return ()=>{active=false;};},[]);
 async function start(){if(lock.current){setError('牌桌正在准备，请稍候。');return;}if(!role){setError('请先取一份自己的名帖。');go('identity');return;}if(!opponent){setError('请先选择一位对手。');return;}if(role===opponent){setError('请另选一位对手，不能与自己同名。');return;}lock.current=true;setBusy(true);setError('');try{const r=await fetch(`${API}/games`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role,opponent,difficulty,learning})});const data=await r.json();if(!r.ok)throw Error(data.error||'暂时无法开始对局');const t={id:data.game.id,token:data.token};setTicket(t);setGame(data.game);try{localStorage.setItem('heron-game',JSON.stringify(t));}catch{setError('浏览器没有允许保存记录，关闭页面后可能无法续局。');}go('game');}catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}}
 async function act(action:Action){if(!game||!ticket){setError('对局尚未载入，请重新入席。');return;}if(lock.current){setError('上一步正在处理，请稍候。');return;}lock.current=true;setBusy(true);setError('');try{const r=await fetch(`${API}/games/${ticket.id}/actions`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${ticket.token}`},body:JSON.stringify({actionId:crypto.randomUUID(),expectedVersion:game.version,action})});const data=await r.json();if(!r.ok){if(data.game)setGame(data.game);throw Error(data.error||'操作未完成');}setGame(data);}catch(e){setError(`${(e as Error).message} 请重新载入确认最新结果。`);}finally{lock.current=false;setBusy(false);}}
 async function reload(){if(!ticket){setError('没有可以载入的对局，请从大厅入席。');return;}if(lock.current){setError('正在连接牌桌，请稍候。');return;}lock.current=true;setBusy(true);try{const r=await fetch(`${API}/games/${ticket.id}`,{headers:{Authorization:`Bearer ${ticket.token}`}});if(!r.ok)throw Error('仍未连接到对局，请稍后重试。');setGame(await r.json());setError('');}catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}}
 function selectRole(id:RoleId){setRole(id);if(id===opponent)setOpponent(null);}
 const selection={role,opponent,setRole:selectRole,setOpponent,difficulty,setDifficulty,learning,setLearning,busy,onNotice:setError};
 const resumeLabel=game?(game.phase==='ended'?'查看上一局复盘':`继续上一局 · 第 ${game.round} 轮`):undefined;
 return <ClubNavigationContext.Provider value={{onStart:()=>{setModal(null);setFuture(null);go('entrance');},onLobby:()=>{setModal(null);setFuture(null);go('lobby');},onBack:back,onRules:openRules,onMembers:()=>setModal('members')}}><div className="app-shell"><a className="skip-link" href="#main-content">跳到游戏内容</a>{!modal&&!future&&<ClubNavigation/>}{error&&<div role="alert" className="error-banner"><span>{error}</span>{ticket&&<button onClick={reload} disabled={busy}>重新载入</button>}<button onClick={()=>setError('')}>关闭提示</button></div>}<div id="main-content">
 {screen==='entrance'&&<ClubEntrance onEnter={()=>go('lobby')} onArchive={()=>setModal('archive')} onMembers={()=>setModal('members')} onResume={()=>go('game')} onRules={openRules} resumeLabel={resumeLabel}/>}
 {screen==='lobby'&&<GameLobby onGame={g=>g.available?go('rules'):setFuture(g)} onArchive={()=>setModal('archive')} game={game} onResume={()=>go('game')}/>}
 {screen==='rules'&&<Preparation role={role} opponent={opponent} onNext={()=>go('identity')} onRules={openRules}/>}
 {screen==='identity'&&<Selection {...selection} step="identity" onNext={()=>{if(!role){setError('请先取一份名帖，再登记入席。');return;}setError('');go('opponent');}}/>}
 {screen==='opponent'&&<Selection {...selection} step="opponent" onNext={start}/>}
 {screen==='game'&&(game?(game.phase==='reveal'||game.phase==='ended'?<Reveal key={`${game.id}-${game.round}-${game.phase}`} game={game} busy={busy} onNext={()=>act({type:'next'})} onLearn={()=>go('learn')} onAgain={()=>go('opponent')}/>:<SealGame key={`${game.id}-${game.round}`} game={game} busy={busy} act={act} onRules={openRules}/>):<section className="empty-game"><h1>{restoring?'正在载入对局…':'还没有入席'}</h1><p>{restoring?'正在读取本机保存的那场对局。':'从大厅选择《封签》，就可以开始。'}</p><button onClick={()=>go('lobby')}>前往游戏大厅</button></section>)}
 {screen==='learn'&&<Learning game={game} onBack={()=>go(game?'game':'lobby')} onAgain={()=>go('opponent')}/>}
 </div><footer className="site-footer"><span>GREY HERON CLUB · SHANGHAI 1926</span><span>《封签》电脑对局 · 角色无属性加成</span></footer>
 {modal==='rules'&&<RulesBook onClose={()=>setModal(rulesReturn.current)}/>}
 {modal==='members'&&<MembersBook onClose={()=>setModal(null)}/> }
 {modal==='archive'&&<dialog ref={archiveRef} className="folio-archive-dialog" aria-label="旧案室" onCancel={()=>setModal(null)} onClick={e=>{if(e.target===archiveRef.current)setModal(null);}}><Archive onClose={()=>setModal(null)} onOpenLearning={()=>{setModal(null);go('learn');}}/></dialog>}
 {future&&modal!=='rules'&&<GameDossier game={future} onClose={()=>setFuture(null)} onSeal={()=>{setFuture(null);go('rules');}}/>}
 </div></ClubNavigationContext.Provider>;
}
createRoot(document.getElementById('root')!).render(<App/>);

