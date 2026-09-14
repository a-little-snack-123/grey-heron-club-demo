import { randomInt, randomUUID } from 'node:crypto';
import { dialogue, roles, playerLines, type RoleId, type Intent, type DialogueKey } from '../src/content.ts';
export type Side = 'player'|'bot';
export type Phase = 'choose'|'talk'|'inspect'|'reveal'|'ended';
export type Difficulty = 'casual'|'tactical';
export interface Round { round:number; submitter:Side; truth:boolean; inspected:boolean; delta:[number,number]; scores:[number,number]; checksBefore:[number,number]; conversation:Message[] }
export interface Message { who:Side; text:string }
export interface Game { id:string; version:number; rulesVersion:'0.1'; role:RoleId; opponent:RoleId; difficulty:Difficulty; learning:boolean; round:number; phase:Phase; scores:[number,number]; checks:[number,number]; sealed:boolean|null; talked:boolean; conversation:Message[]; history:Round[]; usedLines:string[]; createdAt:number; }
export interface Action { type:'seal'|'talk'|'decide'|'next'; truth?:boolean; intent?:Intent|'silent'; inspect?:boolean }
export const rng = () => randomInt(0, 1_000_000) / 1_000_000;
export function payoff(truth:boolean, inspect:boolean):[number,number] {return truth ? inspect ? [3,-1] : [2,1] : inspect ? [-3,2] : [4,-2];}
export const submitter = (g:Pick<Game,'round'>):Side => g.round % 2 ? 'player':'bot';
// This observation is the ONLY object passed to the strategic policy. Sealed contents,
// dialogue wording, player-selected appearance and server state are deliberately absent.
export interface Observation { remaining:number; checks:number; history:Pick<Round,'submitter'|'truth'|'inspected'>[]; difficulty:Difficulty; opponent:RoleId }
export function observe(g:Game, actor:Side):Observation {
 return {remaining: Math.ceil((9-g.round)/2),checks:g.checks[actor==='bot'?1:0],history:g.history.map(({submitter,truth,inspected})=>({submitter,truth,inspected})),difficulty:g.difficulty,opponent:g.opponent};
}
// Finite resource, zero-sum score-difference policy. A stage matrix includes continuation
// values after spending/retaining a check. It optimizes expected difference, not win odds.
const cache = new Map<string,{value:number; fake:number; inspect:number}>();
export function equilibrium(n:number,k:number):{value:number; fake:number; inspect:number} {
 if(n<=0) return {value:0,fake:0,inspect:0};
 k=Math.min(k,n); const key=`${n}:${k}`; const old=cache.get(key);if(old)return old;
 if(k===0) return {value:6*n,fake:1,inspect:0};
 const keep=equilibrium(n-1,k).value, spend=equilibrium(n-1,k-1).value;
 const a=1+keep,b=4+spend,c=6+keep,d=-5+spend;
 const denom=a-b-c+d;
 const p=(a-b)/denom,q=(a-c)/denom;
 let best:{value:number;fake:number;inspect:number};
 if(p>=0&&p<=1&&q>=0&&q<=1) best={value:(a*d-b*c)/denom,fake:p,inspect:q};
 else { // Pure saddle when future inspection scarcity changes the active choices.
  const row=Math.min(a,b)>=Math.min(c,d)?0:1;
  const col=row===0?(a<=b?0:1):(c<=d?0:1);
  best={value:[[a,b],[c,d]][row][col],fake:row,inspect:col};
 }
 cache.set(key,best);return best;
}
export function policy(o:Observation, action:'seal'|'inspect', random=rng):boolean {
 if(action==='inspect'&&o.checks===0)return false;
 if(action==='seal'&&o.checks===0)return true;
 const base=equilibrium(o.remaining,o.checks);
 if(o.difficulty==='casual') return random() < (action==='seal' ? 0.5 : Math.min(0.8,o.checks/o.remaining));
 const theirs=o.history.filter(r=>r.submitter===(action==='seal'?'bot':'player'));
 const tendency=action==='seal' ? theirs.filter(r=>r.inspected).length : theirs.filter(r=>!r.truth).length;
 const rate=(tendency+1)/(theirs.length+2);
 const personality={zhou:0,luo:0.05,xu:0.02,chen:-0.05}[o.opponent];
 const p=action==='seal'?base.fake+(0.36-rate)*0.24+personality : base.inspect+(rate-0.44)*0.30;
 // Small adaptation around a finite-horizon policy; does not claim universal optimality.
 return random()<Math.max(0,Math.min(1,p));
}
function line(g:Game,key:DialogueKey,random=rng) {
 const bank=dialogue[g.opponent][key] as readonly string[];
 const available=bank.filter(x=>!g.usedLines.includes(x));
 if(!available.length)return;
 const chosen=available[Math.floor(random()*available.length)];g.usedLines.push(chosen);g.conversation.push({who:'bot',text:chosen});
}
function prepare(g:Game,random=rng) {
 g.talked=false;g.conversation=[];g.sealed=null;
 if(submitter(g)==='player')g.phase='choose';
 else {g.phase='inspect';g.sealed=!policy(observe(g,'player'),'seal',random);line(g,'offer',random);}
}
export function createGame(opts:{role:RoleId;opponent:RoleId;difficulty:Difficulty;learning:boolean},random=rng):Game {
 if(!roles.some(r=>r.id===opts.role)||!roles.some(r=>r.id===opts.opponent)||opts.role===opts.opponent)throw Error('请选择不同的玩家角色和对手。');
 if(!['casual','tactical'].includes(opts.difficulty)||typeof opts.learning!=='boolean')throw Error('对局设置不正确。');
 const g:Game={...opts,id:randomUUID(),version:0,rulesVersion:'0.1',round:1,phase:'choose',scores:[0,0],checks:[2,2],sealed:null,talked:false,conversation:[],history:[],usedLines:[],createdAt:Date.now()};
 prepare(g,random);return g;
}
function resolve(g:Game,inspect:boolean,random=rng) {
 if(g.sealed===null)throw Error('封签尚未提交。');
 const side=submitter(g),si=side==='player'?0:1,ii=1-si;
 if(inspect&&g.checks[ii]===0)throw Error('查验次数已经用完。');
 const before:[number,number]=[...g.checks];if(inspect)g.checks[ii]--;
 const pair=payoff(g.sealed,inspect),delta:[number,number]=si===0?pair:[pair[1],pair[0]];
 g.scores=[g.scores[0]+delta[0],g.scores[1]+delta[1]];
 line(g,side==='bot'?(g.sealed?(inspect?'honestCheck':'honestPass'):(inspect?'caught':'slipped')):(g.sealed?(inspect?'botMiss':'botPass'):(inspect?'botCaught':'botFooled')),random);
 g.history.push({round:g.round,submitter:side,truth:g.sealed,inspected:inspect,delta,scores:[...g.scores],checksBefore:before,conversation:structuredClone(g.conversation)});
 g.phase='reveal';
}
export function applyAction(original:Game,a:Action,random=rng):Game {
 const g=structuredClone(original);
 if(a.type==='seal') {
  if(g.phase!=='choose'||typeof a.truth!=='boolean')throw Error('现在不能提交封签。');
  g.sealed=a.truth;g.phase='talk';
 } else if(a.type==='talk') {
  if(!['talk','inspect'].includes(g.phase)||g.talked||!a.intent||!['steady','challenge','friendly','silent'].includes(a.intent))throw Error('这一轮不能再说话了。');
  const side=submitter(g);
  if(a.intent!=='silent'){
   const intent=a.intent as Intent;
   g.conversation.push({who:'player',text:playerLines[g.role][side==='player'?'submit':'inspect'][intent]});
   const inspectorResponses:Record<Intent,DialogueKey>={steady:'inspectSteady',challenge:'inspectChallenge',friendly:'inspectFriendly'};
   line(g,side==='player'?inspectorResponses[intent]:intent,random);
  }
  g.talked=true;
  if(side==='player')resolve(g,policy(observe(g,'bot'),'inspect',random),random);
 } else if(a.type==='decide') {
  if(g.phase!=='inspect'||typeof a.inspect!=='boolean')throw Error('现在不能查验或放行。');
  resolve(g,a.inspect,random);
 } else if(a.type==='next') {
  if(g.phase!=='reveal')throw Error('这一轮还没有结束。');
  if(g.round===8){g.phase='ended';g.conversation=[];line(g,g.scores[1]>g.scores[0]?'win':g.scores[1]<g.scores[0]?'lose':'tie',random);}
  else {g.round++;prepare(g,random);}
 } else throw Error('未知操作。');
 g.version++;return g;
}
export function view(g:Game) {
 const {sealed,usedLines,...visible}=g;
 return {...visible,sealed:submitter(g)==='player'||['reveal','ended'].includes(g.phase)?sealed:null,submitter:submitter(g)};
}
export type GameView=ReturnType<typeof view>;
