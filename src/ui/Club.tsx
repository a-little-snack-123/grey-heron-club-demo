import {useEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode} from 'react';

export function ClubPaper({children, className = '', angle = -.4}: {
  children: ReactNode; className?: string; angle?: number;
}) {
  return <article className={`card paper-face ${className}`} style={{'--angle': `${angle}deg`} as CSSProperties}>
    <span className="paper-face__material card__material decor" aria-hidden="true"/>
    <div className="card__text">{children}</div>
  </article>;
}

export function ClubButton({children, guide = false, secondary = false, className = '', onClick, ...props}: {
  guide?: boolean; secondary?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!guide || done) return;
    const stop = () => setDone(true);
    document.addEventListener('click', stop, {capture: true, once: true});
    return () => document.removeEventListener('click', stop, true);
  }, [guide, done]);
  return <button {...props} type="button" className={`brass hit ${secondary ? 'brass--secondary' : ''} ${className}`} onClick={onClick}>
    {guide && <span className={`guide decor ${done ? 'is-done' : ''}`} aria-hidden="true"/>}
    <span className="card__text">{children}</span>
  </button>;
}

export function ClubBook({children, title, onClose}: {children: ReactNode; title: string; onClose: () => void}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {dialog?.close(); previous?.focus({preventScroll: true});};
  }, []);
  return <dialog ref={ref} className="club-stage3 club-book" aria-labelledby="club-book-title" onCancel={onClose}>
    <ClubPaper className="book-leaf">
      <header className="book-heading"><small>GREY HERON CLUB · 1926</small><h1 id="club-book-title" tabIndex={-1} autoFocus>{title}</h1></header>
      {children}
      <footer className="book-footer"><ClubButton onClick={onClose}>合上规则</ClubButton></footer>
    </ClubPaper>
  </dialog>;
}

export function ClubObject({title, english, kind, onClick, angle = 0, guide = false}: {
  title: string; english: string; kind: 'letter' | 'ledger' | 'members';
  onClick: () => void; angle?: number; guide?: boolean;
}) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!guide || done) return;
    const stop = () => setDone(true);
    document.addEventListener('click', stop, {capture: true, once: true});
    return () => document.removeEventListener('click', stop, true);
  }, [guide, done]);
  return <div className={`card placement club-object club-object--${kind}`} style={{'--angle': `${angle}deg`} as CSSProperties}>
    <button type="button" className="selectable hit" aria-label={title} onClick={onClick}>
      <span className="card__material decor" aria-hidden="true">
        <span className={kind === 'letter' ? 'paper' : 'book-cover'}>
          {kind !== 'letter' && <span className="book-spine"/>}
        </span>
      </span>
    </button>
    <span className="ink card__text object-ink" aria-hidden="true"><b>{title}</b><small>{english}</small></span>
    {guide && <span className={`object-guide guide decor ${done ? 'is-done' : ''}`} aria-hidden="true"/>}
  </div>;
}
