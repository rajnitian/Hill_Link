import type { BloodComponent, BloodGroup, Urgency } from '../types.js';
const groups:BloodGroup[]=['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const components:BloodComponent[]=['whole_blood','packed_red_cells','platelets','plasma'];
const coordinate=(v:unknown)=>!!v&&typeof v==='object'&&Number.isFinite((v as {lat?:unknown}).lat)&&(v as {lat:number}).lat>=-90&&(v as {lat:number}).lat<=90&&Number.isFinite((v as {lng?:unknown}).lng)&&(v as {lng:number}).lng>=-180&&(v as {lng:number}).lng<=180;
export function validateRequestPayload(b:Record<string,unknown>,now=Date.now()):string|null {
 const required=['hospital','location','requesterPhone','requiredArrivalAt'];
 if(!required.every(k=>typeof b[k]==='string'&&b[k].trim())||!groups.includes(b.bloodGroup as BloodGroup)||!components.includes(b.component as BloodComponent)||!coordinate(b.coordinates)||!Number.isInteger(Number(b.units))||Number(b.units)<1||Number(b.units)>10||!['critical','urgent','routine'].includes(b.urgency as Urgency)||!/^\+?[1-9]\d{7,14}$/.test(String(b.requesterPhone))||!Number.isFinite(Date.parse(String(b.requiredArrivalAt)))||Date.parse(String(b.requiredArrivalAt))<=now)return 'Invalid request. Check blood group, component, units, phone, coordinates and future arrival deadline.';
 return null;
}
