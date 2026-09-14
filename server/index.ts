import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createGame,applyAction,view,type Game } from './engine.ts';
const app=express();app.disable('x-powered-by');app.use(express.json({limit:'8kb'}));
mkdirSync('data',{recursive:true});
const db=new DatabaseSync(process.env.DB_PATH||'data/games.sqlite');
db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS games(id TEXT PRIMARY KEY, token TEXT NOT NULL, state TEXT NOT NULL); CREATE TABLE IF NOT EXISTS actions(game_id TEXT, action_id TEXT, request TEXT NOT NULL, PRIMARY KEY(game_id,action_id));');
app.use('/api',(req,res,next)=>{res.setHeader('Cache-Control','no-store'); const origin=req.get('origin');if(origin&&origin!==`${req.protocol}://${req.get('host')}`){res.status(403).json({error:'请求来源不匹配。'});return;} next();});
app.post('/api/games',(req,res)=>{
 try {const g=createGame(req.body),token=randomBytes(32).toString('hex');db.prepare('INSERT INTO games VALUES(?,?,?)').run(g.id,token,JSON.stringify(g));res.json({token,game:view(g)});}catch(e){res.status(400).json({error:(e as Error).message});}
});
function load(id:string,token:string|undefined):Game|null {const row=db.prepare('SELECT token,state FROM games WHERE id=?').get(id) as {token:string;state:string}|undefined;return row&&token===`Bearer ${row.token}`?JSON.parse(row.state):null;}
app.get('/api/games/:id',(req,res)=>{const g=load(req.params.id,req.get('authorization'));if(!g){res.status(404).json({error:'对局不存在，或本机没有这局的凭证。'});return;}res.json(view(g));});
app.post('/api/games/:id/actions',(req,res)=>{
 try {
  const g=load(req.params.id,req.get('authorization'));if(!g){res.status(404).json({error:'找不到这场对局。'});return;}
  const {actionId,expectedVersion,action}=req.body;
  if(typeof actionId!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(actionId)||!Number.isInteger(expectedVersion)||!action){res.status(400).json({error:'操作格式不正确。'});return;}
  const fingerprint=JSON.stringify({expectedVersion,action});
  const previous=db.prepare('SELECT request FROM actions WHERE game_id=? AND action_id=?').get(g.id,actionId) as {request:string}|undefined;
  if(previous){if(previous.request!==fingerprint){res.status(409).json({error:'同一个操作编号不能提交不同内容。'});return;}res.json(view(g));return;}
  if(g.version!==expectedVersion){res.status(409).json({error:'对局已更新，请重新载入。',game:view(g)});return;}
  const updated=applyAction(g,action);
  db.exec('BEGIN IMMEDIATE');
  try {db.prepare('UPDATE games SET state=? WHERE id=?').run(JSON.stringify(updated),g.id);db.prepare('INSERT INTO actions VALUES(?,?,?)').run(g.id,actionId,fingerprint);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
  res.json(view(updated));
 }catch(e){res.status(400).json({error:(e as Error).message});}
});
if(process.argv.includes('--production'))app.use(express.static(resolve('dist')));
else {const {createServer}=await import('vite'); const vite=await createServer({server:{middlewareMode:true},appType:'spa'});app.use(vite.middlewares);}
const port=Number(process.env.PORT||4173);
app.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`Grey Heron Club: http://${process.env.HOST||'127.0.0.1'}:${port}`));
