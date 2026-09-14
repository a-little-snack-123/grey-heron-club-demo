import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrassControl, PaperSheet, SelectablePaper} from '../ui/Physical';
import './materials.css';

const guests = [
  {id:'zhou', name:'周宁', job:'核算员', words:'规则我看过了。你要是还没看完，我等你。', angle:-.8},
  {id:'luo', name:'罗辰', job:'旧货商', words:'我把店提前关了。今天可得多玩几盘。', angle:.3},
  {id:'xu', name:'许遥', job:'旁听者', words:'不用特意跟我解释。该问的时候我会问。', angle:-.3},
  {id:'chen', name:'陈夏', job:'调解员', words:'工作上总要劝人和气，玩牌总算不用了。', angle:.8},
];

function Materials() {
  const [selected, setSelected] = useState<string | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const guest = guests.find(g => g.id === selected);
  return <main className="club-ui material-desk">
    <header className="desk-heading">
      <div><p className="english">GREY HERON CLUB</p><h1>来访名帖</h1></div>
      <p className="desk-invitation">四份名帖已经送到。<br/>把想看的那份拿近一些。</p>
    </header>
    <section className="visiting-cards" aria-label="来访名帖">
      {guests.map(g => <SelectablePaper key={g.id} selected={selected === g.id} dimmed={selected !== null && selected !== g.id}
        locked={locked && g.id === 'chen'} angle={g.angle} className="visiting-card" aria-label={`拿起${g.name}的名帖`}
        onClick={() => setSelected(g.id)}>
        <span className="portrait-print"><img src={`${import.meta.env.BASE_URL}art/noir-v2/${g.id}-pixel.webp`} alt="" className="decor" /></span>
        <span className="guest-heading"><strong>{g.name}</strong><span>{g.job}</span></span>
        <span className="guest-words">“{g.words}”</span>
        <span className="guest-mark">{locked && g.id === 'chen' ? '今晚不在' : selected === g.id ? '已拿起' : '拿近看看'}</span>
      </SelectablePaper>)}
    </section>
    <section className="desk-correspondence" aria-label="桌上的信">
      <PaperSheet className="desk-letter" angle={-.4}>
        <div className="letter-heading"><h2>{letterOpen ? '给来访的朋友' : '俱乐部来信'}</h2><span className="letter-seal decor" aria-hidden="true">鹭</span></div>
        <p aria-live="polite">{letterOpen
          ? guest ? `${guest.name}的名帖留在手边了。人物只影响外观与台词，每个人遵守同样的得分规则。` : '名帖上的四位，你都可以扮演。人物只影响外观与台词，每个人遵守同样的得分规则。'
          : '信放在名帖旁边。拆开后，可以读到俱乐部给来访者的留言。'}</p>
      </PaperSheet>
      <div className="desk-controls">
        <BrassControl guide onClick={() => setLetterOpen(v => !v)}>{letterOpen ? '收起信纸' : '拆开来信'}</BrassControl>
        <BrassControl secondary disabled={!selected} onClick={() => setSelected(null)}>放回名帖</BrassControl>
      </div>
    </section>
    <footer className="sample-footer">
      <span>第一批 · 材质与交互试样</span>
      <label><input type="checkbox" checked={locked} onChange={e => {setLocked(e.target.checked); if (e.target.checked && selected === 'chen') setSelected(null);}} />检查不可用状态（陈夏）</label>
      <output aria-live="polite">{guest ? `当前拿起：${guest.name}` : '尚未拿起名帖'}</output>
    </footer>
  </main>;
}

createRoot(document.getElementById('materials-root')!).render(<Materials/>);
