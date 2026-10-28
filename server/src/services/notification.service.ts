import { getDonors, getRequest, addAudit } from '../data/store.js';
import { rankDonors } from './matching.service.js';
import { getSmsAdapter, type SmsDelivery } from './sms/adapter.js';
import type { EmergencyRequest } from '../types.js';
const sentBatches = new Map<string,{batch:number;expiresAt:number;contacted:string[]}>();
const responseTimeoutMs=Math.max(10000,Number(process.env.SMS_RESPONSE_TIMEOUT_MS||60000));
const batchSize=Math.min(10,Math.max(1,Number(process.env.SMS_BATCH_SIZE||3)));
export async function simulateOutreach(requestId:string,actorRole='demo',forceNextBatch=false) {
 const request=await getRequest(requestId);if(!request)return null;
 if(!request.verified||request.demo)return {requestId,mode:'SIMULATION_ONLY',blocked:true,count:0,recipients:[],message:'Request is unverified/demo. Donor alerts are blocked; no SMS was sent.'};
 if(!['pending','matching'].includes(request.status)||Date.parse(request.expiresAt)<=Date.now())return {requestId,mode:'SIMULATION_ONLY',blocked:true,count:0,recipients:[],message:'Request is closed or expired; no SMS was sent.'};
 const donors=await getDonors();const matches=rankDonors(request,donors).filter(m=>m.eligible);
 const existing=sentBatches.get(requestId);if(existing&&!forceNextBatch&&Date.now()<existing.expiresAt)return {requestId,mode:'SIMULATION_ONLY',waiting:true,count:0,recipients:[],nextBatchAt:new Date(existing.expiresAt).toISOString(),message:'Waiting for the configured response timeout; no additional messages were sent.'};
 const state:{batch:number;expiresAt:number;contacted:string[]}=existing??{batch:0,expiresAt:Date.now()+responseTimeoutMs,contacted:[]};
 const next=matches.filter(m=>!state.contacted.includes(m.donor.id)).slice(0,batchSize);
 const adapter=getSmsAdapter();const recipients:Array<{donorId:string;channel:'mock';status:'preview-only';preview:string;delivery:SmsDelivery}>=[];
 for(const match of next){const preview=`HILLLINK BLOOD ALERT: A verified hospital needs ${request.bloodGroup} ${request.component.replaceAll('_',' ')} at ${request.location} by ${new Date(request.requiredArrivalAt).toLocaleString('en-IN')}. Reply 1 to express interest or 2 to decline. Request ID: ${request.id}. Do not reply with medical information.`;const delivery=await adapter.send({to:'[consented donor number]',body:preview,requestId,donorId:match.donor.id});recipients.push({donorId:match.donor.id,channel:'mock',status:'preview-only',preview,delivery});state.contacted.push(match.donor.id);}
 state.batch++;state.expiresAt=Date.now()+responseTimeoutMs;sentBatches.set(requestId,state);await addAudit(actorRole,'outreach_preview_created',requestId,{batch:state.batch,recipientCount:recipients.length,provider:'mock-or-unconfigured'});
 return {requestId,mode:'SIMULATION_ONLY',batch:state.batch,responseTimeoutMs,count:recipients.length,recipients,message:'Preview only. No real SMS delivery is claimed.'};
}
export function outreachState(requestId:string){return sentBatches.get(requestId)??null;}

