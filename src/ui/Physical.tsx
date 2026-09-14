import {useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode} from 'react';
import './legacy-club.css';

const angleStyle = (angle: number) => ({'--paper-angle': `${angle}deg`} as CSSProperties);

export function PaperSheet({children, className = '', angle = -.4}: {
  children: ReactNode; className?: string; angle?: number;
}) {
  return <section className={`paper ${className}`} style={angleStyle(angle)}>
    <div className="paper-face"><div className="paper-content">{children}</div></div>
  </section>;
}

export function SelectablePaper({children, selected, dimmed, locked, angle = -.4, className = '', ...props}: {
  children: ReactNode; selected: boolean; dimmed: boolean; locked?: boolean; angle?: number;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'aria-pressed'>) {
  const state = locked ? 'is-locked' : selected ? 'is-selected' : dimmed ? 'is-dimmed' : '';
  return <button {...props} type="button" className={`selectable hit ${state} ${className}`} style={angleStyle(angle)}
    disabled={locked} aria-pressed={!locked && selected}>
    <span className="paper-face">{children}</span>
  </button>;
}

export function BrassControl({children, guide = false, secondary = false, className = '', onClick, ...props}: {
  guide?: boolean; secondary?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  // A guide is one-shot, independent of request/animation duration. Parent owns which control guides.
  const [used, setUsed] = useState(false);
  return <button {...props} type="button" className={`brass hit ${secondary ? 'brass-secondary' : ''} ${guide ? `guide ${used ? 'is-done' : ''}` : ''} ${className}`}
    onClick={event => {setUsed(true); onClick?.(event);}}>{children}</button>;
}
