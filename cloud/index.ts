import cloudbase from '@cloudbase/node-sdk';
import {makeHandler,type StoredGame,type Store} from './handler.ts';
const app=cloudbase.init({env:process.env.TCB_ENV});
const collection=app.database().collection('grey_heron_games');
const store:Store={
 async create(id,row){await collection.doc(id).set(row);},
 async read(id){const result=await collection.doc(id).get();const row=result.data?.[0] as StoredGame|undefined;if(!row)return null;return {state:row.state,tokenHash:row.tokenHash,version:row.version,receipts:row.receipts,createdAt:row.createdAt};},
 async compareAndSwap(id,version,row){const result=await collection.where({_id:id,version}).update(row);return result.updated===1;}
};
export const main=makeHandler(store,(process.env.ALLOWED_ORIGINS||'').split(',').filter(Boolean));
