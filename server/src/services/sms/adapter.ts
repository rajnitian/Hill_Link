export interface SmsMessage { to:string; body:string; requestId:string; donorId:string }
export interface SmsDelivery { provider:'mock'|'configured-provider'; accepted:boolean; deliveryId:string|null; message:string }
export interface SmsAdapter { send(message:SmsMessage):Promise<SmsDelivery> }
export class MockSmsAdapter implements SmsAdapter { async send(message:SmsMessage):Promise<SmsDelivery>{return {provider:'mock',accepted:false,deliveryId:null,message:'Mock only: no SMS was sent. Message preview generated.'};} }
// Real provider integrations should implement this interface and validate provider webhook signatures.
// This intentionally fails closed until a provider adapter is explicitly installed.
export class UnconfiguredSmsAdapter implements SmsAdapter { async send():Promise<SmsDelivery>{return {provider:'configured-provider',accepted:false,deliveryId:null,message:'No live SMS provider adapter is configured; nothing was sent.'};} }
export function getSmsAdapter():SmsAdapter{return process.env.SMS_MODE==='live'?new UnconfiguredSmsAdapter():new MockSmsAdapter();}
