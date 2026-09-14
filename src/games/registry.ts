export const games=[
 {id:'seal',name:'封签',english:'THE FIRST SEAL',type:'双人心理博弈',level:'入门规则 · 进阶策略',duration:'8 轮 · 约 10 分钟',image:'seal-table',description:'轮流封入真签或假签。每人只有两次查验，什么时候用，由你决定。',available:true},
 {id:'testimony',name:'最后证词',english:'LAST TESTIMONY',type:'证词推理',level:'筹备中',duration:'尚未开放',image:'testimony',description:'把几份彼此矛盾的证词放在一起，找出需要追问的那句话。',available:false},
 {id:'blind',name:'盲池',english:'THE BLIND POT',type:'风险与谈判',level:'筹备中',duration:'尚未开放',image:'blind-pot',description:'手里的信息不一样，能承担的风险也不一样。规则正在设计。',available:false},
 {id:'third',name:'第三席',english:'THE THIRD SEAT',type:'多人阵营推理',level:'筹备中',duration:'尚未开放',image:'third-seat',description:'围绕投票、联盟与少数意见的多人游戏。当前版本尚不能匹配真人。',available:false},
] as const;
export type GameRecord=typeof games[number];
