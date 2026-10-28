import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../types.js';
export interface AuthRequest extends Request { userRole?: UserRole }
const tokenRoles: Array<[string|undefined,UserRole]> = [[process.env.HOSPITAL_API_TOKEN,'hospital'],[process.env.DISPATCHER_API_TOKEN,'dispatcher'],[process.env.ADMIN_API_TOKEN,'admin']];
export function hasRoleAccess(role:UserRole|undefined,roles:UserRole[],demoMode:boolean){return !!role&&(roles.includes(role)||role==='admin'||(role==='demo'&&demoMode));}
export function requireRole(...roles:UserRole[]){return (req:AuthRequest,res:Response,next:NextFunction)=>{
 const demoMode=process.env.DEMO_MODE!=='false' && process.env.NODE_ENV!=='production';
 const authorization=req.header('authorization')?.replace(/^Bearer\s+/i,'');
 let role:UserRole|undefined=tokenRoles.find(([token])=>!!token&&token===authorization)?.[1];
 if(!role && demoMode) role='demo';
 if(!hasRoleAccess(role,roles,demoMode)) return res.status(401).json({error:'Authorized role required. Demo mode cannot verify real requesters.'});
 req.userRole=role; next();
};}
export function rateLimitWindow(limit=60,windowMs=60000){const hits=new Map<string,{count:number;reset:number}>();return(req:Request,res:Response,next:NextFunction)=>{const key=req.ip||'unknown',now=Date.now(),entry=hits.get(key);if(!entry||entry.reset<now)hits.set(key,{count:1,reset:now+windowMs});else entry.count++;const current=hits.get(key)!;res.setHeader('RateLimit-Limit',limit);res.setHeader('RateLimit-Remaining',Math.max(0,limit-current.count));if(current.count>limit)return res.status(429).json({error:'Too many requests. Please retry later.'});next();};}
