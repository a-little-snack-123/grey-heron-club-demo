import {useState, type ReactNode} from 'react';
import './objects.css';

/** The sprite is the control. Text shares its grid area, never its transforms. */
export function SceneObject({asset, label, children, className = '', onClick, unavailable = false, selected, onUnavailable}: {
  asset: 'book' | 'envelope' | 'invitation' | 'casebook' | 'memberbook' | 'note' | 'letter' | 'visitingcard' | 'true-seal' | 'false-seal'; label: string; children: ReactNode; className?: string;
  onClick?: () => void; unavailable?: boolean; selected?: boolean; onUnavailable?: () => void;
}) {
  const [notice, setNotice] = useState('');
  const source = asset==='invitation'?'club-v7/invitation.webp':asset.endsWith('-seal') ? `seal-v4/${asset.split('-')[0]}.webp` : asset === 'letter' ? 'club/paper-aged-b.png' : ['book','envelope'].includes(asset) ? `preparation-v2/${asset}.webp` : `folio-v3/${asset}.webp`;
  const material = <span className="object-material" aria-hidden="true"><img className="object-sprite" src={`${import.meta.env.BASE_URL}art/${source}`} alt="" draggable={false}/></span>;
  return <section className={`scene-object scene-object--${asset} ${className}`}>
    {onClick ? <button type="button" className="object-hit" aria-label={label} aria-disabled={unavailable} aria-pressed={selected}
      onClick={event => {
        if (event.currentTarget.getAttribute('aria-disabled') === 'true') {
          if(onUnavailable){onUnavailable();return;}
          setNotice('这件物件暂时不可用，请稍后再试。');
          return;
        }
        setNotice(''); onClick();
      }}>
      {material}
    </button> : <div className="object-rest" aria-hidden="true">{material}</div>}
    <div className={`object-text card__text${onClick ? '' : ' object-readable'}`}>{children}</div>
    {notice && <span className="object-notice" role="status">{notice}</span>}
  </section>;
}
