import type { Coordinates } from '../types.js';
export interface RoadNode { id: string; coordinates: Coordinates }
export interface RoadEdge { from: string; to: string; lengthKm: number; roadType: 'primary'|'secondary'|'local'|'mountain'; closed?: boolean; unsafe?: boolean; trafficMultiplier?: number; rainfallMultiplier?: number }
export interface RouteResult { reachable: boolean; path: Coordinates[]; distanceKm: number; etaMinutes: number; timestamp: string; source: string; notes: string[] }
// Synthetic road graph around Itanagar for demo/testing only. Replace with a licensed/live OSM-derived graph adapter.
export const demoRoadNodes: RoadNode[] = [
 {id:'hospital',coordinates:{lat:27.0844,lng:93.6053}}, {id:'central',coordinates:{lat:27.1026,lng:93.623}},
 {id:'naharlagun',coordinates:{lat:27.1038,lng:93.695}}, {id:'nirjuli',coordinates:{lat:27.1374,lng:93.748}},
 {id:'doimukh',coordinates:{lat:27.151,lng:93.767}}, {id:'west',coordinates:{lat:27.065,lng:93.56}}
];
export const demoRoadEdges: RoadEdge[] = [
 {from:'hospital',to:'central',lengthKm:3.8,roadType:'primary'}, {from:'central',to:'naharlagun',lengthKm:8.2,roadType:'primary',trafficMultiplier:1.15},
 {from:'naharlagun',to:'nirjuli',lengthKm:7.1,roadType:'secondary'}, {from:'nirjuli',to:'doimukh',lengthKm:5.4,roadType:'mountain',rainfallMultiplier:1.35},
 {from:'hospital',to:'west',lengthKm:6.3,roadType:'mountain',rainfallMultiplier:1.2}, {from:'west',to:'central',lengthKm:7.4,roadType:'secondary'}
];
const speedKph: Record<RoadEdge['roadType'], number> = { primary:38, secondary:27, local:18, mountain:15 };
export function edgeTravelMinutes(edge: RoadEdge): number {
 if (edge.closed || edge.unsafe) return Infinity;
 return edge.lengthKm / speedKph[edge.roadType] * 60 * (edge.trafficMultiplier ?? 1) * (edge.rainfallMultiplier ?? 1);
}
export function dijkstra(nodes: RoadNode[], edges: RoadEdge[], startId: string, endId: string): RouteResult {
 const timestamp = new Date().toISOString();
 if (!nodes.some(n=>n.id===startId) || !nodes.some(n=>n.id===endId)) return {reachable:false,path:[],distanceKm:0,etaMinutes:0,timestamp,source:'synthetic demo road graph',notes:['Origin or destination is not mapped to the road graph.']};
 const dist = new Map(nodes.map(n=>[n.id,Infinity])); const km = new Map(nodes.map(n=>[n.id,Infinity])); const prev = new Map<string,string>(); const remaining = new Set(nodes.map(n=>n.id));
 dist.set(startId,0); km.set(startId,0);
 while (remaining.size) {
  let current: string | undefined; let best=Infinity;
  for (const id of remaining) if ((dist.get(id) ?? Infinity) < best) { best=dist.get(id)!; current=id; }
  if (!current || best===Infinity) break;
  if (current===endId) break;
  remaining.delete(current);
  for (const edge of edges.filter(e=>e.from===current || e.to===current)) {
   const next=edge.from===current?edge.to:edge.from; if (!remaining.has(next)) continue;
   const weight=edgeTravelMinutes(edge); if (!Number.isFinite(weight)) continue;
   const candidate=best+weight;
   if (candidate < (dist.get(next) ?? Infinity)) { dist.set(next,candidate); km.set(next,(km.get(current)??0)+edge.lengthKm); prev.set(next,current); }
  }
 }
 if (!Number.isFinite(dist.get(endId))) return {reachable:false,path:[],distanceKm:0,etaMinutes:0,timestamp,source:'synthetic demo road graph',notes:['No safe connected road route was found.']};
 const ids=[endId]; let cursor=endId; while(cursor!==startId){const p=prev.get(cursor);if(!p)break;ids.unshift(p);cursor=p;}
 const path=ids.map(id=>nodes.find(n=>n.id===id)!.coordinates);
 const notes=['Dijkstra minimizes weighted estimated travel time, not straight-line distance.','Synthetic road data; not suitable for real dispatch.'];
 if(edges.some(e=>e.rainfallMultiplier && e.rainfallMultiplier>1)) notes.push('Rainfall adjustment is illustrative only; no live weather feed is connected.');
 if(edges.some(e=>e.closed||e.unsafe)) notes.push('Closed or marked-unsafe edges are excluded.');
 return {reachable:true,path,distanceKm:km.get(endId)??0,etaMinutes:Math.ceil(dist.get(endId)!),timestamp,source:'synthetic demo road graph',notes};
}
export function estimateRoadRoute(from: Coordinates, to: Coordinates): RouteResult {
 // Coordinates are not silently snapped to real roads: use this clearly labelled approximation for demo matching.
 const nearest=(point:Coordinates)=>demoRoadNodes.reduce((a,b)=>haversine(point,b.coordinates)<haversine(point,a.coordinates)?b:a);
 const a=nearest(from), b=nearest(to);
 if(haversine(from,a.coordinates)>18 || haversine(to,b.coordinates)>18) return {reachable:false,path:[],distanceKm:0,etaMinutes:0,timestamp:new Date().toISOString(),source:'synthetic demo road graph',notes:['Coordinates are outside demo graph coverage.']};
 return dijkstra(demoRoadNodes,demoRoadEdges,a.id,b.id);
}
function haversine(a:Coordinates,b:Coordinates){const r=6371,rad=Math.PI/180,dLat=(b.lat-a.lat)*rad,dLng=(b.lng-a.lng)*rad;const x=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)**2;return 2*r*Math.asin(Math.sqrt(x));}
