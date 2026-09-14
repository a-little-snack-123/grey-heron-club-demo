import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const base=process.env.SMOKE_API;
const origin=process.env.SMOKE_ORIGIN;
if(!base||!origin)throw new Error('Set SMOKE_API and SMOKE_ORIGIN for the dedicated Grey Heron CloudBase environment.');
if(/teamind/i.test(`${base} ${origin}`))throw new Error('Refusing to smoke-test the TeaMind CloudBase environment.');
let token;
async function request(path,body){await new Promise(r=>setTimeout(r,1100));const response=await fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Origin:origin,...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});const text=await response.text();assert.equal(response.status,200,text.slice(0,500));return JSON.parse(text);}
const created=await request('/games',{role:'chen',opponent:'luo',difficulty:'tactical',learning:true});token=created.token;let game=created.game;console.log('Created cloud game; credentials omitted.');
while(game.phase!=='ended'){
 let action;
 if(game.phase==='choose')action={type:'seal',truth:game.round%3===0};
 else if(game.phase==='talk')action={type:'talk',intent:'challenge'};
 else if(game.phase==='inspect'){assert.equal(game.sealed,null);action={type:'decide',inspect:game.checks[0]>0};}
 else action={type:'next'};
 const body={actionId:randomUUID(),expectedVersion:game.version,action};game=await request(`/games/${game.id}/actions`,body);
 if(game.version===1){const duplicate=await request(`/games/${game.id}/actions`,body);assert.equal(duplicate.version,1);}
}
assert.equal(game.history.length,8);assert.deepEqual(game.scores,game.history.reduce((s,r)=>[s[0]+r.delta[0],s[1]+r.delta[1]],[0,0]));const restored=await request(`/games/${game.id}`);assert.deepEqual(restored,game);
console.log(JSON.stringify({passed:true,rounds:game.history.length,phase:game.phase,scores:game.scores,refreshRestore:true,idempotency:true,hiddenInformation:true}));
