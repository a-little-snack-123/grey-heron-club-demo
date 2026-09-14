import {createHash,randomBytes} from 'node:crypto';
import {createGame,applyAction,view,type Game} from '../server/engine.ts';
export interface StoredGame{state:string;tokenHash:string;version:number;receipts:string;createdAt:number}
export interface Store{create:(id:string,row:StoredGame)=>Promise<void>;read:(id:string)=>Promise<StoredGame|null>;compareAndSwap:(id:string,version:number,row:StoredGame)=>Promise<boolean>}
interface Event{httpMethod?:string;path?:string;headers?:Record<string,string>;body?:string;isBase64Encoded?:boolean}
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
export function makeHandler(store:Store,origins:string[]){return async function handler(event:Event){
 const h=Object.fromEntries(Object.entries(event.headers||{}).map(([k,v])=>[k.toLowerCase(),v]));
 const origin=h.origin;
 const headers:Record<string,string>={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'};
 const reply=(statusCode:number,data:unknown)=>({statusCode,headers,body:JSON.stringify(data),isBase64Encoded:false});
 if(origin&&!origins.includes(origin))return reply(403,{error:'请求来源不匹配。'});
 if(origin){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Headers']='Content-Type, Authorization';headers['Access-Control-Allow-Methods']='GET, POST, OPTIONS';}
 if(event.httpMethod==='OPTIONS')return {...reply(204,null),body:''};
 const path=(event.path||'').replace(/^\/api\/grey-heron/,'').replace(/\/$/,'');
 if(event.httpMethod==='GET'&&path==='/health')return reply(200,{ok:true,service:'grey-heron-club',rulesVersion:'0.1'});
 try{
  const raw=event.body?(event.isBase64Encoded?Buffer.from(event.body,'base64').toString('utf8'):event.body):'{}';
  if(Buffer.byteLength(raw)>8192)return reply(413,{error:'请求内容过长。'});
  let body;try{body=JSON.parse(raw);}catch{return reply(400,{error:'请求格式不正确。'});}
  if(event.httpMethod==='POST'&&path==='/games'){
   const game=createGame(body),token=randomBytes(32).toString('hex');
   await store.create(game.id,{state:JSON.stringify(game),tokenHash:hash(token),version:0,receipts:'{}',createdAt:game.createdAt});
   return reply(200,{token,game:view(game)});
  }
  const match=path.match(/^\/games\/([a-f0-9-]{36})(\/actions)?$/);
  if(!match)return reply(404,{error:'没有这个地址。'});
  const id=match[1],auth=h.authorization||'';
  if(!/^Bearer [a-f0-9]{64}$/.test(auth))return reply(404,{error:'找不到这场对局。'});
  const row=await store.read(id);if(!row||row.tokenHash!==hash(auth.slice(7)))return reply(404,{error:'找不到这场对局。'});
  const game=JSON.parse(row.state) as Game;
  if(event.httpMethod==='GET'&&!match[2])return reply(200,view(game));
  if(event.httpMethod!=='POST'||!match[2])return reply(405,{error:'这个地址不接受此操作。'});
  const {actionId,expectedVersion,action}=body;
  if(typeof actionId!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(actionId)||!Number.isInteger(expectedVersion)||!action)return reply(400,{error:'操作格式不正确。'});
  const receipts=JSON.parse(row.receipts) as Record<string,string>,fingerprint=JSON.stringify({expectedVersion,action});
  if(Object.hasOwn(receipts,actionId))return receipts[actionId]===fingerprint?reply(200,view(game)):reply(409,{error:'同一个操作编号不能提交不同内容。'});
  if(expectedVersion!==game.version)return reply(409,{error:'对局已更新，请重新载入。',game:view(game)});
  const next=applyAction(game,action);receipts[actionId]=fingerprint;
  const updated=await store.compareAndSwap(id,row.version,{...row,state:JSON.stringify(next),version:next.version,receipts:JSON.stringify(receipts)});
  if(updated)return reply(200,view(next));
  // Concurrent requests cannot both advance a version. A retried identical request
  // gets the durable result; a different stale request receives the latest view.
  const current=await store.read(id);if(!current)return reply(404,{error:'找不到这场对局。'});
  const currentGame=JSON.parse(current.state) as Game;
  if(JSON.parse(current.receipts)[actionId]===fingerprint)return reply(200,view(currentGame));
  return reply(409,{error:'另一项操作已先完成，请按最新状态继续。',game:view(currentGame)});
 }catch(e){
  const message=(e as Error).message||'';
  if(/请选择|设置不正确|现在不能|尚未|次数|不能再|未知操作|还没有结束/.test(message))return reply(400,{error:message});
  console.error('game_request_failed',(e as {code?:string}).code||'unknown');
  return reply(503,{error:'对局服务暂时没有响应，请稍后重新载入。'});
 }
};}
