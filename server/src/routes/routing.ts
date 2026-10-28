import { Router } from 'express';
import { demoRoadEdges, demoRoadNodes, dijkstra } from '../services/routing.service.js';
const router=Router();
router.get('/demo',(_req,res)=>{
 const from=typeof _req.query.from==='string'?_req.query.from:'hospital';const to=typeof _req.query.to==='string'?_req.query.to:'naharlagun';
 const rainfall=typeof _req.query.rainfall==='string'?_req.query.rainfall:'';const closed=typeof _req.query.closed==='string'?_req.query.closed.split(','):[];
 const edges=demoRoadEdges.map((edge,i)=>({...edge,rainfallMultiplier:rainfall==='heavy'?1.6:rainfall==='light'?1.15:edge.rainfallMultiplier,closed:edge.closed||closed.includes(`${edge.from}-${edge.to}`)||closed.includes(`${edge.to}-${edge.from}`)}));
 const result=dijkstra(demoRoadNodes,edges,from,to);res.json({...result,mode:'DEMO',liveRouting:false,weatherLive:false,appliedScenario:{rainfall:rainfall||'none (demo)',closedEdges:closed}});
});
export default router;
