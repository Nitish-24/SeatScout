import { Passenger, QuotaEligibility, QuotaType } from '../types';

/**
 * Calculates the exact age of a passenger on a specified journey date.
 */
export function calculateAgeOnDate(dobStr: string, journeyDateStr: string): number {
  if (!dobStr || !journeyDateStr) return 0;
  const dob = new Date(dobStr);
  const journeyDate = new Date(journeyDateStr);

  if (isNaN(dob.getTime()) || isNaN(journeyDate.getTime())) return 0;

  let age = journeyDate.getFullYear() - dob.getFullYear();
  const monthDiff = journeyDate.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && journeyDate.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Checks quota eligibility for a passenger on the journey date.
 */
export function evaluateQuotaEligibility(
  quota: QuotaType,
  passenger?: Passenger,
  journeyDate?: string
): QuotaEligibility {
  const disclaimer = 'IRCTC / Indian Railways guidelines and quota eligibility criteria are subject to official railway circulars and single/sole passenger travel conditions.';

  if (quota === 'GN') {
    return {
      isEligible: true,
      calculatedAge: passenger?.dob && journeyDate ? calculateAgeOnDate(passenger.dob, journeyDate) : 0,
      quota: 'GN',
      message: 'General Quota is open to all passengers without age or gender restrictions.',
      criteria: 'Standard public quota',
      disclaimer
    };
  }

  if (quota === 'SS') {
    if (!passenger || !passenger.dob || !journeyDate) {
      return {
        isEligible: false,
        calculatedAge: 0,
        quota: 'SS',
        message: 'Please provide passenger date of birth and gender to verify Senior Citizen / Lower Berth quota qualification.',
        criteria: 'Male: 60+ yrs | Female: 45+ yrs (travelling alone/eligible party)',
        disclaimer
      };
    }

    const ageOnJourney = calculateAgeOnDate(passenger.dob, journeyDate);
    const gender = passenger.gender || 'male';

    let eligible = false;
    let reason = '';

    if (gender === 'male' || gender === 'transgender') {
      if (ageOnJourney >= 60) {
        eligible = true;
        reason = `Male passenger qualifies as Senior Citizen (Age ${ageOnJourney} ≥ 60 on journey date).`;
      } else {
        eligible = false;
        reason = `Male passenger does not meet the minimum age of 60 years (Age will be ${ageOnJourney} on journey date).`;
      }
    } else if (gender === 'female') {
      if (ageOnJourney >= 45) {
        eligible = true;
        reason = `Female passenger qualifies for Lower Berth / Senior quota (Age ${ageOnJourney} ≥ 45 on journey date).`;
      } else {
        eligible = false;
        reason = `Female passenger does not meet the minimum age of 45 years (Age will be ${ageOnJourney} on journey date).`;
      }
    }

    return {
      isEligible: eligible,
      calculatedAge: ageOnJourney,
      quota: 'SS',
      message: eligible
        ? `✓ Eligible for Senior Citizen / Lower Berth Quota`
        : `⚠ This passenger may not qualify for the selected quota.`,
      criteria: eligible
        ? `Age on journey date: ${ageOnJourney} years (${gender === 'female' ? 'Female threshold: 45+' : 'Male threshold: 60+'})`
        : reason,
      disclaimer
    };
  }

  if (quota === 'LD') {
    const isFemale = passenger?.gender === 'female';
    return {
      isEligible: isFemale,
      calculatedAge: passenger?.dob && journeyDate ? calculateAgeOnDate(passenger.dob, journeyDate) : 0,
      quota: 'LD',
      message: isFemale
        ? '✓ Eligible for Ladies Quota'
        : '⚠ Ladies Quota is exclusively reserved for female passengers travelling alone or with children under 12.',
      criteria: 'Female passengers travelling solo or with kids under 12',
      disclaimer
    };
  }

  return {
    isEligible: true,
    calculatedAge: passenger?.dob && journeyDate ? calculateAgeOnDate(passenger.dob, journeyDate) : 0,
    quota,
    message: `Quota selected: ${quota}`,
    criteria: 'Standard railway guidelines apply',
    disclaimer
  };
}
