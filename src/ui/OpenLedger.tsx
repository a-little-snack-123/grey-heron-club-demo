import {Children,cloneElement,isValidElement,useLayoutEffect,useRef,useState,type ReactNode,type ReactElement} from 'react';
import {SceneObject} from './SceneObject';
function readingContent(nodes:ReactNode):ReactNode{return Children.map(nodes,node=>{
 if(!isValidElement(node))return node;
 const el=node as ReactElement<{className?:string;children?:ReactNode}>;
 return cloneElement(el,{...(el.props.className?.includes('leaf-scroll')?{className:el.props.className.replace('leaf-scroll','leaf-section')}:{})},readingContent(el.props.children));
});}
function BookLeaf({active,children,label}:{active:boolean;children:ReactNode;label:string}){
 const viewport=useRef<HTMLDivElement>(null),flow=useRef<HTMLDivElement>(null);
 const [page,setPage]=useState(0),[count,setCount]=useState(1),[width,setWidth]=useState(0);
 useLayoutEffect(()=>{
  const v=viewport.current,f=flow.current;if(!v||!f)return;
  let live=true;
  const measure=()=>{
   if(!live||!v.clientWidth)return;
   const measured=Math.floor(v.getBoundingClientRect().width);setWidth(measured);
   // Check the full leaf first: a previously visible pager must not create its own overflow.
   const previousHeight=f.style.height;
   f.style.height=`${v.parentElement!.clientHeight}px`;
   const fitsWholeLeaf=f.scrollWidth<=measured+1;
   f.style.height=previousHeight;
   const total=fitsWholeLeaf?1:Math.max(2,Math.ceil((f.scrollWidth+32)/(measured+32)));
   setCount(total);setPage(p=>Math.min(p,total-1));
  };
  const observer=new ResizeObserver(measure);observer.observe(v);f.addEventListener('toggle',measure,true);
  const frame=requestAnimationFrame(measure);document.fonts.ready.then(measure);
  return()=>{live=false;cancelAnimationFrame(frame);observer.disconnect();f.removeEventListener('toggle',measure,true);};
 },[children,active,width]);
 useLayoutEffect(()=>{
  const v=viewport.current;if(!v)return;const b=v.getBoundingClientRect();
  for(const e of v.querySelectorAll<HTMLElement>('button,a,input,select,summary')){const r=e.getBoundingClientRect();e.tabIndex=active&&r.left>=b.left-1&&r.right<=b.right+1?0:-1;}
 },[page,width,active,count]);
 return <div className={'book-page folio-leaf '+(active?'mobile-leaf':'')}>
  <div className="page-viewport" ref={viewport}><div className="page-flow" ref={flow} style={{width:width||'100%',columnWidth:width||'auto',left:-page*(width+32)}}>{readingContent(children)}</div></div>
  {count>1&&<nav className="paper-pagination" aria-label={label+'续页'}><button disabled={page===0} onClick={()=>setPage(p=>p-1)}>上一页</button><small aria-live="polite">{page+1} / {count}</small><button disabled={page===count-1} onClick={()=>setPage(p=>p+1)}>下一页</button></nav>}
 </div>;
}
export function OpenLedger({left,right,labels=['左页','右页'],pages}:{left?:ReactNode;right?:ReactNode;labels?:[string,string];pages?:ReactNode[]}){
 const [leaf,setLeaf]=useState(0),[spread,setSpread]=useState(0),[mobile,setMobile]=useState(()=>matchMedia('(max-width:700px)').matches);
 useLayoutEffect(()=>{const m=matchMedia('(max-width:700px)'),change=()=>{setMobile(m.matches);setSpread(0);};m.addEventListener('change',change);return()=>m.removeEventListener('change',change);},[]);
 const total=pages?Math.ceil(pages.length/(mobile?1:2)):1,index=spread*(mobile?1:2);
 const l=pages?pages[index]:left,r=pages?pages[index+1]:right;
 return <div className="open-ledger">
  <SceneObject asset="book" label="摊开的书页" className="reading-book"><div className="book-spread" key={pages?index:'book'}>
   <BookLeaf active={pages?true:!mobile||leaf===0} label={labels[0]}>{l}</BookLeaf>
   <BookLeaf active={pages?!mobile:!mobile||leaf===1} label={labels[1]}>{r}</BookLeaf>
  </div></SceneObject>
  {pages?<nav className="book-pagination" aria-label="翻动规则册"><button disabled={spread===0} onClick={()=>setSpread(p=>p-1)}>上一页</button><span aria-live="polite">第 {index+1}{!mobile?'–'+Math.min(index+2,pages.length):''} 页 / 共 {pages.length} 页</span><button disabled={spread===total-1} onClick={()=>setSpread(p=>p+1)}>下一页</button></nav>:<nav className="folio-leaf-switch" aria-label="翻页">{labels.map((label,i)=><button key={label} type="button" aria-pressed={leaf===i} onClick={()=>setLeaf(i)}>{label}</button>)}</nav>}
 </div>;
}

