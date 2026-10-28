export type BloodGroup = 'A+'|'A-'|'B+'|'B-'|'AB+'|'AB-'|'O+'|'O-';
export type BloodComponent = 'whole_blood'|'packed_red_cells'|'platelets'|'plasma';
export type RequestStatus = 'pending'|'matching'|'donor_accepted'|'ambulance_assigned'|'completed'|'cancelled';
export interface Coordinates {lat:number;lng:number}
export interface Donor {id:string;displayName?:string;name?:string;bloodGroup:BloodGroup;location:string;coordinates:Coordinates;travelMinutes:number;available:boolean;lastVerified:string;consentToContact:boolean;eligibilityConfirmedAt:string|null;lastDonationAt:string|null;healthScreeningStatus:'qualified'|'pending'|'not_recorded';components:BloodComponent[];locationConfidence:'high'|'medium'|'low'}
export interface EmergencyRequest {id:string;patientLabel:string;hospital:string;location:string;coordinates:Coordinates;bloodGroup:BloodGroup;component:BloodComponent;units:number;urgency:'critical'|'urgent'|'routine';requesterPhone:string;requiredArrivalAt:string;createdAt:string;expiresAt:string;status:RequestStatus;verified:boolean;demo:boolean;acceptedDonorId?:string;ambulanceId?:string}
export interface MatchResult {donor:Donor;compatible:boolean;eligible:boolean;etaMinutes:number|null;canMeetDeadline:boolean;reasons:string[];missingInformation:string[];score:number}
export interface RouteResult {reachable:boolean;path:Coordinates[];distanceKm:number;etaMinutes:number;timestamp:string;source:string;notes:string[];mode?:string;liveRouting?:boolean;weatherLive?:boolean}
