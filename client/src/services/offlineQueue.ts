export interface QueueStorage {getItem(key:string):string|null;setItem(key:string,value:string):void}
export interface QueueItem {idempotencyKey:string}
export function readOfflineQueue<T extends QueueItem>(storage:QueueStorage,key='hilllink-demo-queue'):T[]{try{const parsed=JSON.parse(storage.getItem(key)||'[]');return Array.isArray(parsed)?parsed as T[]:[];}catch{return [];}}
export function writeOfflineQueue<T extends QueueItem>(storage:QueueStorage,items:T[],key='hilllink-demo-queue'){storage.setItem(key,JSON.stringify(items));}
export async function retryOfflineQueue<T extends QueueItem>(items:T[],submit:(item:T)=>Promise<unknown>):Promise<{remaining:T[];synced:number}>{const remaining:T[]=[];let synced=0;for(const item of items){try{await submit(item);synced++;}catch{remaining.push(item);}}return {remaining,synced};}
