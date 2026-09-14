import {useState} from 'react';
import {games,type GameRecord} from '../games/registry';
import type {GameView} from '../../server/engine';
const props=['art/club-v7/bound-deck-v1.webp','art/club-v7/coupe-v1.webp','art/club-v7/whisky.webp','art/club-v7/cards.webp'];
export function GameLobby({onGame,onArchive,game,onResume}:{onGame:(g:GameRecord)=>void;onArchive:()=>void;game:GameView|null;onResume:()=>void}){
 const [selected,setSelected]=useState<GameRecord|null>(null);
 return <main className="club-stage3 round-lobby" aria-label="游戏大厅">
  <header className="round-heading"><small>THE GAMES ROOM</small><h1 tabIndex={-1}>游戏大厅</h1><p>取一只酒杯，或翻开一叠牌。点击名字，看看玩法。</p></header>
  <nav className="round-games" aria-label="游戏目录">{games.map((g,i)=><button key={g.id} className={'game-prop game-prop-'+g.id} aria-pressed={selected?.id===g.id} onClick={()=>setSelected(g)}><span className="game-prop-material"><img src={import.meta.env.BASE_URL+props[i]} alt=""/></span><span className="game-name">{g.name}</span><small>{g.available?'今晚开放':'筹备中'}</small></button>)}</nav>
  <section className="lobby-introduction" aria-live="polite" aria-label="游戏简短介绍">{selected?<><h2>{selected.name}<small>{selected.type}</small></h2><p>{selected.description}</p>{selected.available?<button onClick={()=>onGame(selected)}>阅读《封签》玩法 →</button>:<p className="opening-note">这张牌桌尚未开放，敬请期待。</p>}</>:<p className="lobby-hint">点击桌上的物件或游戏名字，查看简短介绍。</p>}</section>
  <footer className="round-footer"><button onClick={onArchive}>翻看旧案</button>{game&&<button onClick={onResume}>{game.phase==='ended'?'打开上一局复盘':'继续上一局'}</button>}</footer>
 </main>;
}

