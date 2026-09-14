import type {GameRecord} from '../games/registry';
import {OpenLedger} from '../ui/OpenLedger';
import {FolioDialog} from './FolioDialog';
export function GameDossier({game,onClose,onSeal}:{game:GameRecord;onClose:()=>void;onSeal:()=>void}){
 return <FolioDialog title={`${game.name} · 游戏档案`} english={game.english} onClose={onClose} className="folio-dossier">
  <OpenLedger labels={['游戏档案','开放安排']} left={<><small>{game.type}</small><h2>{game.name}</h2><div className="leaf-scroll"><p>{game.description}</p><p>这张牌桌正在整理规则与素材，尚未开放。</p></div></>} right={<><h2>今晚可以玩什么</h2><div className="leaf-scroll"><p>《封签》的完整电脑对局已经开放。</p><p>双方轮流封入真假签，八轮之后按公开规则记分。</p></div><button className="paper-link" onClick={onSeal}>阅读《封签》玩法 →</button></>}/>
 </FolioDialog>;
}
