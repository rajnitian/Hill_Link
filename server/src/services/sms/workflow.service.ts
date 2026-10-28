const processed=new Set<string>();
export function validateInboundSms(input:{messageId?:unknown;from?:unknown;body?:unknown;requestId?:unknown}){
 if(typeof input.messageId!=='string'||!input.messageId.trim()||input.messageId.length>200)return {ok:false as const,error:'Invalid message ID.'};
 if(typeof input.from!=='string'||!/^[+]?[1-9]\d{7,14}$/.test(input.from))return {ok:false as const,error:'Invalid sender phone number.'};
 if(typeof input.body!=='string'||!['1','2'].includes(input.body.trim()))return {ok:false as const,error:'SMS response must be 1 or 2.'};
 if(typeof input.requestId!=='string'||!/^HL-[A-Z0-9-]{4,32}$/.test(input.requestId))return {ok:false as const,error:'Invalid request ID.'};
 return {ok:true as const,messageId:input.messageId,from:input.from,response:input.body.trim() as '1'|'2',requestId:input.requestId};
}
export function markSmsResponseProcessed(messageId:string){if(processed.has(messageId))return false;processed.add(messageId);return true;}
export function resetSmsDedupeForTests(){processed.clear();}
export function isRequestExpired(expiresAt:string,now=Date.now()){const time=Date.parse(expiresAt);return !Number.isFinite(time)||time<=now;}
