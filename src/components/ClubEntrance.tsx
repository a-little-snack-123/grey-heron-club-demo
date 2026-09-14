export function ClubEntrance({onEnter,onArchive,onMembers,onResume,onRules,resumeLabel}:{onEnter:()=>void;onArchive:()=>void;onMembers:()=>void;onResume:()=>void;onRules:()=>void;resumeLabel?:string;}){
 return <main className="club-stage3 start-scene" aria-label="开始界面">
  <div className="start-copy"><small>SHANGHAI · 1926</small><h1 tabIndex={-1}>灰鹭俱乐部</h1><p className="start-label">开始界面</p>
   <nav className="start-menu" aria-label="开始菜单"><button className="start-primary" onClick={onEnter}>进入俱乐部 <span aria-hidden="true">→</span></button>{resumeLabel&&<button onClick={onResume}>{resumeLabel}</button>}<button onClick={onArchive}>查看旧案</button><button onClick={onMembers}>人物档案</button><button onClick={onRules}>游戏规则</button></nav>
   <p className="start-footnote">一场关于选择与判断的桌边游戏。<br/>电脑对局已开放 · 无需注册</p>
  </div>
 </main>;
}

