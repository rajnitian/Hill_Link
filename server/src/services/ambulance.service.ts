import { ambulances, requests } from '../data/demoData.js';
import type { Ambulance, EmergencyRequest } from '../types.js';
export type DemoAmbulanceClaim = {ok:true;ambulance:Ambulance;request:EmergencyRequest}|{ok:false;reason:'request_not_ready'|'ambulance_unavailable'|'request_already_assigned'};
// Synchronous in-process demo claim. Production needs one DB transaction locking both request and vehicle rows.
export function claimDemoAmbulanceAtomically(requestId:string,ambulanceId:string):DemoAmbulanceClaim {
 const request=requests.find(r=>r.id===requestId);if(!request||request.status!=='donor_accepted'||!request.acceptedDonorId)return {ok:false,reason:'request_not_ready'};
 if(request.ambulanceId)return {ok:false,reason:'request_already_assigned'};
 const ambulance=ambulances.find(a=>a.id===ambulanceId);if(!ambulance||!ambulance.available)return {ok:false,reason:'ambulance_unavailable'};
 ambulance.available=false;request.ambulanceId=ambulance.id;request.status='ambulance_assigned';return {ok:true,ambulance,request};
}
