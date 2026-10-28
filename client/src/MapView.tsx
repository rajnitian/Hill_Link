import {MapContainer,TileLayer,Marker,Polyline,Popup,useMap} from 'react-leaflet';
import L from 'leaflet';
import {useEffect} from 'react';
import type {Coordinates,EmergencyRequest,RouteResult} from './types';
import 'leaflet/dist/leaflet.css';
// Fix Leaflet's default marker asset paths under Vite.
const markerIcon=new L.Icon({iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',iconSize:[25,41],iconAnchor:[12,41]});
function Fit({points}:{points:Coordinates[]}){const map=useMap();useEffect(()=>{if(points.length>1)map.fitBounds(points.map(p=>[p.lat,p.lng] as [number,number]),{padding:[24,24]});else if(points[0])map.setView([points[0].lat,points[0].lng],12);},[map,points]);return null;}
export default function MapView({request,route}:{request?:EmergencyRequest;route?:RouteResult}){
 const center:Coordinates=request?.coordinates??{lat:27.0844,lng:93.6053};const points=route?.path?.length?route.path:[center];
 return <div className="map-shell"><MapContainer center={[center.lat,center.lng]} zoom={11} scrollWheelZoom={false} style={{height:320,width:'100%'}}><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><Fit points={points}/>{request&&<Marker position={[request.coordinates.lat,request.coordinates.lng]} icon={markerIcon}><Popup>{request.hospital}<br/>Demo hospital destination</Popup></Marker>}{route?.path.map((p,i)=><Marker key={`${p.lat}-${p.lng}-${i}`} position={[p.lat,p.lng]} icon={markerIcon}><Popup>Demo road graph node {i+1}</Popup></Marker>)}{route?.path && route.path.length>1&&<Polyline positions={route.path.map(p=>[p.lat,p.lng] as [number,number])} pathOptions={{color:'#49c8b8',weight:5,opacity:.85}}/>}</MapContainer><div className="map-disclaimer">OpenStreetMap tiles require connectivity. The displayed route uses a synthetic demo graph, not a live road-routing service.</div></div>;
}
