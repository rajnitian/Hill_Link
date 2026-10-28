import type { BloodComponent, BloodGroup, Donor, EmergencyRequest, MatchResult } from '../types.js';
import { estimateRoadRoute } from './routing.service.js';

// Simplified ABO/Rh demonstration rules. Final component selection and clinical suitability
// must always be confirmed by qualified blood-bank staff; platelets/plasma may require local rules.
const packedRbcDonors: Record<BloodGroup, BloodGroup[]> = {
  'O-':['O-'], 'O+':['O-','O+'], 'A-':['O-','A-'], 'A+':['O-','O+','A-','A+'],
  'B-':['O-','B-'], 'B+':['O-','O+','B-','B+'], 'AB-':['O-','A-','B-','AB-'],
  'AB+':['O-','O+','A-','A+','B-','B+','AB-','AB+']
};
const plasmaDonors: Record<BloodGroup, BloodGroup[]> = {
  'O-':['O-','O+','A-','A+','B-','B+','AB-','AB+'],
  'O+':['O-','O+','A-','A+','B-','B+','AB-','AB+'],
  'A-':['A-','A+','AB-','AB+'], 'A+':['A-','A+','AB-','AB+'],
  'B-':['B-','B+','AB-','AB+'], 'B+':['B-','B+','AB-','AB+'],
  'AB-':['AB-','AB+'], 'AB+':['AB-','AB+']
};
export function isBloodGroupCompatible(recipient: BloodGroup, donor: BloodGroup, component: BloodComponent = 'packed_red_cells'): boolean {
  if (component === 'plasma') return plasmaDonors[recipient].includes(donor);
  // Whole blood and platelets are deliberately restricted to same ABO/Rh group in this demo.
  if (component === 'whole_blood' || component === 'platelets') return recipient === donor;
  return packedRbcDonors[recipient].includes(donor);
}
export function minimumDonationIntervalDays(component:BloodComponent):number { return component==='whole_blood'||component==='packed_red_cells'?120:14; }
export function rankDonors(request: EmergencyRequest, donors: Donor[], now = new Date()): MatchResult[] {
  return donors.map(donor => {
    const reasons: string[] = [], missingInformation: string[] = [];
    const compatible = isBloodGroupCompatible(request.bloodGroup, donor.bloodGroup, request.component) && donor.components.includes(request.component);
    if (compatible) reasons.push(`ABO/Rh demonstration rule and component availability match (${request.component.replaceAll('_',' ')})`);
    else reasons.push('Blood group/component compatibility not established by demo rules');
    if (donor.available) reasons.push('Donor marked available'); else reasons.push('Donor currently unavailable');
    if (donor.consentToContact) reasons.push('Consent to contact is recorded'); else reasons.push('No consent to contact');
    const verifiedAt = donor.eligibilityConfirmedAt ? Date.parse(donor.eligibilityConfirmedAt) : NaN;
    const recentEligibility = Number.isFinite(verifiedAt) && now.getTime() - verifiedAt <= 30 * 86400000 && verifiedAt <= now.getTime();
    if (!recentEligibility) missingInformation.push('Recent eligibility confirmation (within 30 days)');
    if (donor.healthScreeningStatus !== 'qualified') missingInformation.push('Qualified-personnel health screening');
    if (!donor.lastDonationAt) missingInformation.push('Last donation date / donation interval check');
    else if (!Number.isFinite(Date.parse(donor.lastDonationAt)) || Date.parse(donor.lastDonationAt) > now.getTime()) missingInformation.push('Valid last donation date');
    else if (now.getTime()-Date.parse(donor.lastDonationAt) < minimumDonationIntervalDays(request.component)*86400000) missingInformation.push(`Applicable donation interval (${minimumDonationIntervalDays(request.component)} days for this demo rule)`);
    if (donor.locationConfidence === 'low') missingInformation.push('Reliable current donor location');
    if (donor.locationConfidence === 'medium') missingInformation.push('Higher-confidence current donor location preferred');
    const route = estimateRoadRoute(donor.coordinates, request.coordinates);
    if (!route.reachable) missingInformation.push('Road route unavailable; travel time cannot be confirmed');
    const etaMinutes = route.reachable ? route.etaMinutes : null;
    const deadlineMinutes = (Date.parse(request.requiredArrivalAt) - now.getTime()) / 60000;
    const canMeetDeadline = etaMinutes !== null && etaMinutes <= deadlineMinutes;
    if (etaMinutes !== null) reasons.push(`Road-graph estimate ${etaMinutes} min (${route.distanceKm.toFixed(1)} km)`);
    if (!canMeetDeadline) reasons.push('Cannot currently be shown to meet the required arrival deadline');
    // Eligibility is never inferred from blood group alone. Missing medical facts block an eligible label.
    const eligible = compatible && donor.available && donor.consentToContact && recentEligibility && donor.healthScreeningStatus === 'qualified' && donor.locationConfidence !== 'low' && !!donor.lastDonationAt && Number.isFinite(Date.parse(donor.lastDonationAt)) && now.getTime()-Date.parse(donor.lastDonationAt)>=minimumDonationIntervalDays(request.component)*86400000 && route.reachable && canMeetDeadline;
    const confidenceBonus = donor.locationConfidence === 'high' ? 10 : donor.locationConfidence === 'medium' ? 4 : 0;
    const score = (compatible ? 100 : 0) + (donor.available ? 20 : 0) + (donor.consentToContact ? 10 : 0) + confidenceBonus - (etaMinutes ?? 999);
    return { donor, compatible, eligible, etaMinutes, canMeetDeadline, reasons, missingInformation, score };
  }).sort((a,b) => Number(b.eligible)-Number(a.eligible) || Number(b.compatible)-Number(a.compatible) || Number(b.canMeetDeadline)-Number(a.canMeetDeadline) || b.score-a.score);
}
export function componentLabel(component: BloodComponent) { return component.replaceAll('_', ' '); }
