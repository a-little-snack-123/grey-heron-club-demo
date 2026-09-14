import type {RoleId} from '../content';
import {OpenLedger} from '../ui/OpenLedger';
import {SceneObject} from '../ui/SceneObject';
export const rulePages=[
 <><small>THE FIRST SEAL</small><h1>封签</h1><p>双人心理博弈 · 约10分钟</p><h3>轮到你出签</h3><p>封入真签或假签，由对方决定放行或拆开查验。</p><p>可说一句，也可沉默。封好后不能换签。</p></>,
 <><h2>今晚规则</h2><p>一局共8轮。双方轮流出签，每人出签4次，最多查验2次。</p><h3>每轮怎么走</h3><ol><li>出签者取签、封口。</li><li>双方可说一句话或沉默。</li><li>查验者决定放行或拆封。</li><li>揭晓真假，记录本轮得分。</li></ol><p>翻到后两页，查看完整得分和对局约定。</p></>,
 <><h2>完整得分表</h2><p>得分：出签者 / 查验者</p><table className="rule-score-table"><thead><tr><th>封签</th><th>放行</th><th>查验</th></tr></thead><tbody><tr><th>真签</th><td>+2 / +1</td><td>+3 / −1</td></tr><tr><th>假签</th><td>+4 / −2</td><td>−3 / +2</td></tr></tbody></table><p>8轮结束，分数高的一方获胜。允许负分，也允许平局。</p><p>查验次数用完后，只能放行。每轮都会公布真假。</p></>,
 <><h2>对局约定</h2><p>封好后不能换签；说话本身不改变得分。</p><p>电脑只根据已公开的历史决定策略，看不到你的未揭封签。</p><p>所有角色使用同一套规则，没有属性加成。措辞和表情不能当作真假提示。</p><p>当前开放电脑对局，没有付费筹码或下注。真人匹配尚未开放。</p></>
];
export function Preparation({onNext}:{role:RoleId|null;opponent:RoleId|null;onNext:()=>void;onRules:()=>void}){
 return <main className="club-stage3 object-scene folio-scene preparation-book" aria-label="封签说明与入会邀请">
  <div className="preparation-reading"><OpenLedger pages={rulePages} labels={['封签规则','对局约定']}/>
   <aside className="invitation-stage"><p>读过规则，就可以入席了。</p><SceneObject asset="invitation" label="递交名帖，进入入会登记" onClick={onNext} className="invitation-guide"><div className="invitation-ink"><small>今夜的邀请</small><b>递交名帖</b><span>进入入会登记 →</span></div></SceneObject></aside>
  </div>
 </main>;
}

