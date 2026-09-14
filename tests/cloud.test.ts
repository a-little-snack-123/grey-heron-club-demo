import {test} from 'node:test';import assert from 'node:assert/strict';
import {makeHandler,type Store,type StoredGame} from '../cloud/handler.ts';
test('云端并发只结算一次，重复请求与非法跨域得到明确结果',async()=>{
 const rows=new Map<string,StoredGame>();const store:Store={async create(id,row){rows.set(id,structuredClone(row));},async read(id){await Promise.resolve();return structuredClone(rows.get(id)||null);},async compareAndSwap(id,version,row){if(rows.get(id)?.version!==version)return false;rows.set(id,structuredClone(row));return true;}};
 const handler=makeHandler(store,['https://game.example']);const create=await handler({httpMethod:'POST',path:'/api/grey-heron/games',body:JSON.stringify({role:'chen',opponent:'luo',difficulty:'tactical',learning:false})});assert.equal(create.statusCode,200);const {game,token}=JSON.parse(create.body),headers={authorization:`Bearer ${token}`,origin:'https://game.example'};
 const event={httpMethod:'POST',path:`/api/grey-heron/games/${game.id}/actions`,headers,body:JSON.stringify({actionId:'one',expectedVersion:0,action:{type:'seal',truth:false}})};
 const responses=await Promise.all([handler(event),handler(event)]);assert.ok(responses.every(r=>r.statusCode===200));assert.ok(responses.every(r=>JSON.parse(r.body).version===1));assert.equal(rows.get(game.id)?.version,1);
 const forged=await handler({...event,headers:{...headers,origin:'https://evil.example'}});assert.equal(forged.statusCode,403);
 const unauth=await handler({httpMethod:'GET',path:`/api/grey-heron/games/${game.id}`});assert.equal(unauth.statusCode,404);
 const conflict=await handler({...event,body:JSON.stringify({actionId:'two',expectedVersion:0,action:{type:'seal',truth:true}})});assert.equal(conflict.statusCode,409);
 const preflight=await handler({httpMethod:'OPTIONS',path:'/api/grey-heron/games',headers});assert.equal(preflight.statusCode,204);assert.equal(preflight.headers['Access-Control-Allow-Origin'],'https://game.example');
});
