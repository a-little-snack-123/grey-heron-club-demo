import {useEffect,useRef,type ReactNode} from 'react';
import {ClubNavigation} from './ClubNavigation';

/** One room-sized dialog, with the same physical desk as the main pages. */
export function FolioDialog({title,english,onClose,children,className=''}:{title:string;english:string;onClose:()=>void;children:ReactNode;className?:string}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const el=ref.current;el?.showModal();return()=>el?.close();},[]);
 return <dialog ref={ref} className="folio-archive-dialog" aria-label={title} onCancel={onClose}>
  <main className={`club-stage3 object-scene folio-scene ${className}`}>
   <ClubNavigation compact onBack={onClose} rulesOpen={className==='folio-rules'}/>
   <header className="folio-heading"><div><small>{english}</small><h1>{title}</h1></div></header>
   {children}
  </main>
 </dialog>;
}
