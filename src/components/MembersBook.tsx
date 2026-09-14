import {useState} from 'react';
import {roles} from '../content';
import {OpenLedger} from '../ui/OpenLedger';
import {FolioDialog} from './FolioDialog';
import {MemberPortrait} from './MemberPortrait';
export function MembersBook({onClose}:{onClose:()=>void}){
 const [index,setIndex]=useState(0),r=roles[index];
 return <FolioDialog title="人物档案" english="MEMBERS REGISTER" onClose={onClose} className="folio-members">
  <nav className="member-book-tabs" aria-label="选择人物档案">{roles.map((r,i)=><button key={r.id} aria-pressed={index===i} onClick={()=>setIndex(i)}>{r.name}</button>)}</nav>
  <OpenLedger key={r.id} labels={['人物','创作参考']} left={<><MemberPortrait id={r.id} large/><h2>{r.name}</h2><small>{r.job}</small><div className="leaf-scroll"><p>{r.bio}</p><p>“{r.intro}”</p></div></>} right={<><h2>创作参考</h2><div className="leaf-scroll"><p>{r.origin}</p><p>{r.inspiration}</p><p className="folio-marginalia">四位均为原创角色。所列出处是创作参考，不是原作角色改名或官方联动。</p></div></>}/>
 </FolioDialog>;
}
