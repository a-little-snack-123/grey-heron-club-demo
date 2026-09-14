import {art,roleOf} from './Scene';
import type {RoleId} from '../content';
const sizes={zhou:[430,438],luo:[443,438],xu:[430,424],chen:[442,424]} as const;
export function MemberPortrait({id,large=false,compact=false}:{id:RoleId;large?:boolean;compact?:boolean}){
 const [w,h]=sizes[id],divisor=compact?10:large?4:5;
 return <span className="native-portrait" style={{width:w/divisor,height:h/divisor}}><img src={art(id)} alt={`${roleOf(id).name}的肖像`} width={w/divisor} height={h/divisor}/></span>;
}
