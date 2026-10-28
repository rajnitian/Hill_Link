export interface RoadCondition { edgeId: string; rainfallLevel?: 'none'|'light'|'heavy'; flooded?: boolean; landslideAlert?: boolean; closed?: boolean; source: string; observedAt: string }
export interface AdjustedCondition { multiplier: number; unsafe: boolean; notes: string[] }
export function adjustForWeather(condition:RoadCondition):AdjustedCondition {
 const notes:string[]=[]; if(condition.flooded||condition.landslideAlert||condition.closed){if(condition.flooded)notes.push('Flooding reported');if(condition.landslideAlert)notes.push('Landslide alert reported');if(condition.closed)notes.push('Road closure reported');return {multiplier:1,unsafe:true,notes};}
 let multiplier=1;if(condition.rainfallLevel==='light'){multiplier=1.15;notes.push('Light-rain travel-time adjustment');}if(condition.rainfallLevel==='heavy'){multiplier=1.6;notes.push('Heavy-rain travel-time adjustment; verify road safety');}
 return {multiplier,unsafe:false,notes};
}
// No live weather source is configured by default. Callers must show the source and timestamp.
