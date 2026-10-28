export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type BloodComponent = 'whole_blood' | 'packed_red_cells' | 'platelets' | 'plasma';
export type Urgency = 'critical' | 'urgent' | 'routine';
export type RequestStatus = 'pending' | 'matching' | 'donor_accepted' | 'ambulance_assigned' | 'completed' | 'cancelled';
export type UserRole = 'hospital' | 'dispatcher' | 'admin' | 'demo' | 'system';
export interface Coordinates { lat: number; lng: number }
export interface Donor {
  id: string; name: string; phoneE164?: string; bloodGroup: BloodGroup; location: string; coordinates: Coordinates;
  travelMinutes: number; available: boolean; lastVerified: string; consentToContact: boolean;
  eligibilityConfirmedAt: string | null; lastDonationAt: string | null; healthScreeningStatus: 'qualified' | 'pending' | 'not_recorded';
  components: BloodComponent[]; locationConfidence: 'high' | 'medium' | 'low';
}
export interface EmergencyRequest {
  id: string; patientLabel: string; hospital: string; location: string; coordinates: Coordinates;
  bloodGroup: BloodGroup; component: BloodComponent; units: number; urgency: Urgency; requesterPhone: string;
  requiredArrivalAt: string; createdAt: string; expiresAt: string; status: RequestStatus;
  verified: boolean; demo: boolean; idempotencyKey?: string; acceptedDonorId?: string; ambulanceId?: string;
}
export interface Ambulance { id: string; label: string; coordinates: Coordinates; available: boolean; locationConfidence: 'high'|'medium'|'low' }
export interface AuditRecord { id: string; at: string; actorRole: UserRole; action: string; requestId?: string; details: Record<string, unknown> }
export interface MatchResult { donor: Donor; compatible: boolean; eligible: boolean; etaMinutes: number | null; canMeetDeadline: boolean; reasons: string[]; missingInformation: string[]; score: number }
