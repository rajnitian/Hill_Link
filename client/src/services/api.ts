import type {Donor,EmergencyRequest,MatchResult,RouteResult,BloodComponent,BloodGroup} from '../types';
const API=import.meta.env.VITE_API_URL||'http://localhost:4000/api';
async function request<T>(path:string,init?:RequestInit):Promise<T>{const res=await fetch(`${API}${path}`,init);const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||`Request failed (${res.status})`);return data as T;}
export const getRequests=()=>request<EmergencyRequest[]>('/requests');
export const getDonors=()=>request<Donor[]>('/donors');
export const createRequest=(input:{hospital:string;location:string;coordinates:{lat:number;lng:number};bloodGroup:BloodGroup;component:BloodComponent;units:number;urgency:EmergencyRequest['urgency'];requesterPhone:string;requiredArrivalAt:string},idempotencyKey:string)=>request<EmergencyRequest>('/requests',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify(input)});
export const getMatches=(id:string)=>request<MatchResult[]>(`/requests/${encodeURIComponent(id)}/matches`);
export const simulateOutreach=(requestId:string)=>request<{count:number;mode:string;message:string;blocked?:boolean;recipients:Array<{donorId:string;preview:string}>}>('/notifications/outreach',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId})});
export const getDemoRoute=(from='hospital',to='naharlagun')=>request<RouteResult>(`/routing/demo?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
