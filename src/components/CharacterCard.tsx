import {roles,type RoleId} from '../content';
import {Portrait} from './Scene';
import {SelectablePaper} from '../ui/Physical';
export const styles:Record<RoleId,{label:string;note:string}>= {
 zhou:{label:'观察型',note:'留意已经揭开的签，把查验留给值得拆的那轮。'},
 luo:{label:'操盘型',note:'出假签的倾向略高，常用话头试探你的反应。'},
 xu:{label:'分析型',note:'围绕剩余次数和公开记录调整判断。'},
 chen:{label:'沟通型',note:'出签相对稳妥，愿意搭话，但照样会出假签。'},
};
const ratings:Record<RoleId,readonly [string,number][]>= {
 zhou:[['观察',5],['冒险',2],['耐心',5]],
 luo:[['诱导',5],['施压',4],['随机',4]],
 xu:[['观察',4],['推理',5],['进攻',2]],
 chen:[['沟通',5],['伪装',4],['节奏',4]],
};
export function CharacterCard({id,selected,dimmed,onSelect,disabled=false,angle=0}:{id:RoleId;selected:boolean;dimmed:boolean;onSelect:()=>void;disabled?:boolean;angle?:number}){
 const r=roles.find(x=>x.id===id)!;
 return <SelectablePaper className="character-card" selected={selected} dimmed={dimmed} locked={disabled} angle={angle} onClick={onSelect} aria-label={`${disabled?'不可选择：':selected?'已选定：':'选择：'}${r.name}，${styles[id].label}`}>
  <span className="portrait-print"><Portrait id={id}/></span>
  <span className="character-heading"><strong>{r.name}</strong><span>{r.job}</span></span>
  <span className="character-quote">“{r.intro}”</span>
  <span className="character-style"><small>行事风格</small><b>{styles[id].label}</b><span>{styles[id].note}</span></span>
  <span className="character-ratings" aria-label="策略倾向">{ratings[id].map(([name,value])=><span key={name}><small>{name}</small><i aria-label={`${value} 星`}>{'●'.repeat(value)}{'○'.repeat(5-value)}</i></span>)}</span>
  <span className="selection-label">{disabled?'与你同名，不能落座':selected?'名帖已取出':'取出名帖'}</span>
 </SelectablePaper>;
}
