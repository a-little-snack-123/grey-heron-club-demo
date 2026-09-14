import {FolioDialog} from '../../components/FolioDialog';
import {OpenLedger} from '../../ui/OpenLedger';

export function RulesBook({onClose}:{onClose:()=>void}) {
  return <FolioDialog title="封签 · 对局说明" english="THE FIRST SEAL" onClose={onClose} className="folio-rules"><OpenLedger labels={['规则与得分','对局约定']} left={<><h2>规则与得分</h2><div className="leaf-scroll"><Rules compact/></div></>} right={<><h2>对局约定</h2><div className="leaf-scroll"><p>封好后不能换签。每轮可以说一句，也可以沉默；说话本身不改变得分。查验次数用完后，只能放行。</p><p>电脑只使用已公开的历史决定策略，看不到你的未揭封签。角色的措辞和表情不能当作真假提示。</p><p>当前没有下注或付费筹码规则。邀请好友与真人匹配尚未开放。</p></div></>}/></FolioDialog>;
}

export function Rules({compact=false}:{compact?:boolean}){return <div className="rules"><p>双方轮流出签，选择真签或假签。另一方可以放行，也可以拆开查验。</p><table><caption>得分：出签者 / 查验者</caption><thead><tr><th>封签</th><th>放行</th><th>查验</th></tr></thead><tbody><tr><th>真签</th><td>+2 / +1</td><td>+3 / −1</td></tr><tr><th>假签</th><td>+4 / −2</td><td>−3 / +2</td></tr></tbody></table><p>共 8 轮，每人出签 4 次、查验最多 2 次。每轮都公布真假，结束时分数高的一方获胜，允许负分与平局。</p>{!compact&&<><p>封好后不能换签。每轮可以说一句，也可以沉默；说话本身不改变得分。查验次数用完后，只能放行。</p><p>电脑只使用已公开的历史决定策略，看不到你的未揭封签。角色的措辞和表情不能当作真假提示。</p><p>当前没有下注或付费筹码规则。邀请好友与真人匹配尚未开放。</p></>}</div>;}

