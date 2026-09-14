import {createContext,useContext} from 'react';

type Navigation={onStart:()=>void;onLobby:()=>void;onBack:()=>void;onRules:()=>void;onMembers:()=>void};
export const ClubNavigationContext=createContext<Navigation|null>(null);

export function ClubNavigation({onBack,rulesOpen=false,compact=false}:{onBack?:()=>void;rulesOpen?:boolean;compact?:boolean}){
 const navigation=useContext(ClubNavigationContext);
 if(!navigation)return null;
 return <nav className={compact?'folio-dialog-navigation':'club-navigation'} aria-label="俱乐部导航">
  <button onClick={navigation.onStart}>返回开始界面</button>
  <button onClick={navigation.onLobby}>返回游戏大厅</button>
  <button onClick={onBack||navigation.onBack} title="返回上一页面，保留当前对局">返回上一步</button>
  {!rulesOpen&&<button onClick={navigation.onRules}>查看游戏规则</button>}
  {!compact&&<button onClick={navigation.onMembers}>人物档案</button>}
 </nav>;
}
