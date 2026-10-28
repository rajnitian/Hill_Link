import { Router } from 'express';
import { getDonors } from '../data/store.js';
import { requireRole } from '../middleware/auth.js';
const router=Router();
router.get('/',requireRole('hospital','dispatcher','admin'),async(_req,res)=>res.json((await getDonors()).map(({name,phoneE164,...d})=>({...d,displayName:name}))));
export default router;
