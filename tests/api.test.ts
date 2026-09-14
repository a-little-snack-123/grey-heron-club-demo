import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn,type ChildProcess} from 'node:child_process';
import {once} from 'node:events';
import {randomUUID} from 'node:crypto';
import {unlinkSync} from 'node:fs';
import {resolve} from 'node:path';
import {createServer} from 'node:net';
test('API 隔离、重复提交、过期版本、隐藏信息以及服务重启续局',async()=>{
 const probe=createServer();
 await new Promise<void>((resolve,reject)=>{probe.once('error',reject);probe.listen(0,'127.0.0.1',resolve);});
 const port=(probe.address() as {port:number}).port;
 await new Promise<void>((resolve,reject)=>probe.close(error=>error?reject(error):resolve()));
 const base=`http://127.0.0.1:${port}`,db=resolve(`data/test-${randomUUID()}.sqlite`);let child:ChildProcess;
 async function launch(){child=spawn(process.execPath,['--import','tsx','server/index.ts','--production'],{cwd:process.cwd(),env:{...process.env,PORT:String(port),DB_PATH:db},stdio:['ignore','pipe','pipe'],windowsHide:true});let output='';child.stdout!.on('data',b=>output+=b);child.stderr!.on('data',b=>output+=b);for(let i=0;i<100;i++){if(output.includes('Grey Heron Club:'))return;if(child.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,100));}throw Error(`server timeout: ${output}`);}
 async function stop(){if(child.exitCode===null){const done=once(child,'exit');child.kill();await done;}}
 try{await launch();const created=await fetch(`${base}/api/games`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:'chen',opponent:'luo',difficulty:'tactical',learning:true})});assert.equal(created.status,200);const {game,token}=await created.json();const url=`${base}/api/games/${game.id}`,headers={'Content-Type':'application/json',Authorization:`Bearer ${token}`};assert.equal((await fetch(url)).status,404);
 const body={actionId:'seal-once',expectedVersion:0,action:{type:'seal',truth:false}};const action=async(b:unknown,h=headers)=>fetch(`${url}/actions`,{method:'POST',headers:h,body:JSON.stringify(b)});
 assert.equal((await action(body)).status,200);const repeated=await (await action(body)).json();assert.equal(repeated.version,1);assert.equal(repeated.sealed,false);
 assert.equal((await action({...body,action:{type:'seal',truth:true}})).status,409);
 assert.equal((await action({...body,actionId:'old-version'})).status,409);
 assert.equal((await action({...body,actionId:'origin'}, {...headers,Origin:'https://unrelated.example'} as typeof headers)).status,403);
 assert.equal((await action({actionId:'talk',expectedVersion:1,action:{type:'talk',intent:'silent'}})).status,200);
 const next=await (await action({actionId:'next',expectedVersion:2,action:{type:'next'}})).json();assert.equal(next.round,2);assert.equal(next.sealed,null);assert.equal('usedLines' in next,false);
 await stop();await launch();const restored=await(await fetch(url,{headers})).json();assert.deepEqual(restored,next);
 }finally{if(child!)await stop();for(const suffix of ['','-wal','-shm'])try{unlinkSync(db+suffix);}catch{/* Already removed by SQLite. */}}
});
