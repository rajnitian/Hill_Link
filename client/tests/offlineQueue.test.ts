import test from 'node:test';
import assert from 'node:assert/strict';
import {retryOfflineQueue,readOfflineQueue,writeOfflineQueue} from '../src/services/offlineQueue.js';
test('offline queue retries failures and keeps only unsynchronized drafts',async()=>{const memory=new Map<string,string>();const storage={getItem:(k:string)=>memory.get(k)??null,setItem:(k:string,v:string)=>{memory.set(k,v);}};const items=[{idempotencyKey:'one'},{idempotencyKey:'two'}];writeOfflineQueue(storage,items);assert.equal(readOfflineQueue(storage).length,2);const result=await retryOfflineQueue(items,async item=>{if(item.idempotencyKey==='two')throw new Error('offline');});assert.equal(result.synced,1);assert.deepEqual(result.remaining.map(x=>x.idempotencyKey),['two']);});
