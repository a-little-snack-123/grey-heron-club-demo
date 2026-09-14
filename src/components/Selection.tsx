import {roles,type RoleId} from '../content';
import type {Difficulty} from '../../server/engine';
import {styles} from './CharacterCard';
import {SceneObject} from '../ui/SceneObject';
import {MemberPortrait} from './MemberPortrait';
type Props={role:RoleId|null;opponent:RoleId|null;setRole:(id:RoleId)=>void;setOpponent:(id:RoleId)=>void;difficulty:Difficulty;setDifficulty:(d:Difficulty)=>void;learning:boolean;setLearning:(l:boolean)=>void;onNext:()=>void;busy:boolean;onNotice:(message:string)=>void};
export function Selection({step,...p}:Props&{step:'identity'|'opponent'}){
 const identity=step==='identity',chosen=identity?p.role:p.opponent;
 return <main className="club-stage3 object-scene folio-scene folio-selection" aria-label={identity?'入会登记':'选择你的对手'}>
  <header className="folio-heading"><div><small>{identity?'MEMBERSHIP REGISTER':'CHOOSE YOUR OPPONENT'}</small><h1 tabIndex={-1}>{identity?'入会登记':'选择你的对手'}</h1><p>{identity?'取一份名帖。只换称呼和说话方式，不改变规则。':'电脑对手只看公开记录。挑一位落座。'}</p></div></header>
  <div className="native-members" aria-label="桌上的四份名帖">{roles.map(r=>{
   const unavailable=!identity&&r.id===p.role;
   return <SceneObject key={r.id} asset="visitingcard" label={`${unavailable?'不可选择：':chosen===r.id?'已选定：':'选择：'}${r.name}，${styles[r.id].label}`} selected={chosen===r.id} unavailable={unavailable||p.busy} onUnavailable={()=>p.onNotice(unavailable?'不能选择与你同名的人，请另选一位对手。':'正在准备牌桌，请稍候。')} onClick={()=>{p.onNotice('');identity?p.setRole(r.id):p.setOpponent(r.id);}} className="native-member-card">
    <div className="visiting-inscription"><MemberPortrait id={r.id}/><h2>{r.name}</h2><small>{r.job} · {styles[r.id].label}</small><p>{styles[r.id].note}</p><span className="native-pick-label">{unavailable?'不能选择与你同名的人':chosen===r.id?'名帖已取出':'取出名帖'}</span></div>
   </SceneObject>;
  })}</div>
  <footer className="selection-desk-footer">
   {identity?<p className="selection-note">四位原创角色，同一套动作与得分规则。</p>:<SceneObject asset="note" label="牌桌安排" className="table-settings"><div className="note-inscription"><label>对局强度 <select value={p.difficulty} onChange={e=>p.setDifficulty(e.target.value as Difficulty)}><option value="casual">先熟悉规则</option><option value="tactical">认真过招</option></select></label><label><input type="checkbox" checked={p.learning} onChange={e=>p.setLearning(e.target.checked)}/> 每轮揭封后附一页讲解</label></div></SceneObject>}
   <SceneObject asset="note" label={identity?'登记这份名帖':p.busy?'正在准备牌桌…':'确认挑战对象'} onClick={p.onNext} unavailable={p.busy} className="confirm-note"><div className="note-inscription"><b>{identity?'登记这份名帖':p.busy?'正在准备牌桌…':'确认挑战对象'}</b><small>{chosen?'名帖已选好':identity?'先取一份名帖':'先选择对手'}</small></div></SceneObject>
  </footer>
 </main>;
}
