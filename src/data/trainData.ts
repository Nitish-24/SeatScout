import { Station, TrainSchedule, TrainClass, QuotaType } from '../types';

export const POPULAR_STATIONS: Station[] = [
  { code: 'NDLS', name: 'New Delhi Railway Station', city: 'New Delhi', state: 'Delhi' },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal' },
  { code: 'MAS', name: 'Chennai Central (MGR Chennai)', city: 'Chennai', state: 'Tamil Nadu' },
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'LKO', name: 'Lucknow Charbagh NR', city: 'Lucknow', state: 'Uttar Pradesh' },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh' },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh' },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat' },
  { code: 'CDG', name: 'Chandigarh Junction', city: 'Chandigarh', state: 'Punjab' },
  { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Jn', city: 'Mughalsarai', state: 'Uttar Pradesh' },
  { code: 'PRYJ', name: 'Prayagraj Junction', city: 'Prayagraj', state: 'Uttar Pradesh' },
  { code: 'GKP', name: 'Gorakhpur Junction', city: 'Gorakhpur', state: 'Uttar Pradesh' },
  { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad', state: 'Telangana' },
  { code: 'SC', name: 'Secunderabad Junction', city: 'Secunderabad', state: 'Telangana' },
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh' },
  { code: 'RKMP', name: 'Rani Kamlapati', city: 'Bhopal', state: 'Madhya Pradesh' },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan' },
  { code: 'TVC', name: 'Thiruvananthapuram Central', city: 'Thiruvananthapuram', state: 'Kerala' },
  { code: 'PURI', name: 'Puri Railway Station', city: 'Puri', state: 'Odisha' },
  { code: 'BBS', name: 'Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha' },
  { code: 'GHY', name: 'Guwahati Junction', city: 'Guwahati', state: 'Assam' }
];

let stationLookupFn: ((code: string) => Station | undefined) | null = null;

export function registerStationLookup(fn: (code: string) => Station | undefined) {
  stationLookupFn = fn;
}

export function getStation(code: string): Station | undefined {
  if (stationLookupFn) {
    const res = stationLookupFn(code);
    if (res) return res;
  }
  return POPULAR_STATIONS.find(s => s.code.toUpperCase() === code.trim().toUpperCase());
}


export const POPULAR_ROUTES = [
  { label: 'Delhi ⇄ Lucknow', from: 'NDLS', to: 'LKO' },
  { label: 'Delhi ⇄ Varanasi', from: 'NDLS', to: 'BSB' },
  { label: 'Delhi ⇄ Kanpur', from: 'NDLS', to: 'CNB' },
  { label: 'Mumbai ⇄ Pune', from: 'CSMT', to: 'PUNE' },
  { label: 'Bengaluru ⇄ Chennai', from: 'SBC', to: 'MAS' },
  { label: 'Delhi ⇄ Patna', from: 'NDLS', to: 'PNBE' },
  { label: 'Kolkata ⇄ Puri', from: 'HWH', to: 'PURI' },
  { label: 'Delhi ⇄ Chandigarh', from: 'NDLS', to: 'CDG' }
];

export const CLASS_LABELS: Record<TrainClass, { name: string; short: string; description: string }> = {
  '1A': { name: 'AC First Class', short: '1A', description: 'Top tier air-conditioned coupe & cabin berths' },
  '2A': { name: 'AC 2-Tier', short: '2A', description: 'Air-conditioned 2-tier sleeper with privacy curtains' },
  '3A': { name: 'AC 3-Tier', short: '3A', description: 'Air-conditioned 3-tier sleeper berths' },
  '3E': { name: 'AC 3-Economy', short: '3E', description: 'Economical 3-tier AC coach with modern amenities' },
  'CC': { name: 'AC Chair Car', short: 'CC', description: 'Air-conditioned seated chair car coaches' },
  'EC': { name: 'Executive Chair Car', short: 'EC', description: 'Premium spacious 2x2 AC seating' },
  'EA': { name: 'Anubhuti Class', short: 'EA', description: 'Luxury executive class chair car' },
  'SL': { name: 'Sleeper Class', short: 'SL', description: 'Non-air-conditioned reserved sleeper berths' },
  '2S': { name: 'Second Sitting', short: '2S', description: 'Reserved non-AC bench seating' },
  'ANY': { name: 'Any Class', short: 'ANY', description: 'Alert for any open berth in any travel class' }
};

export const QUOTA_DETAILS: Record<QuotaType, { name: string; code: QuotaType; description: string; rule?: string }> = {
  GN: {
    name: 'General Quota',
    code: 'GN',
    description: 'Standard open public booking across all travel classes without restrictions.',
    rule: 'Available to all citizens'
  },
  TQ: {
    name: 'Tatkal Quota',
    code: 'TQ',
    description: 'Emergency short-notice quota opening at 10:00 AM (AC) and 11:00 AM (Non-AC) 1 day before journey.',
    rule: 'Opens 24 hours prior to train origin departure'
  },
  SS: {
    name: 'Senior Citizen / Lower Berth',
    code: 'SS',
    description: 'Reserved lower berths for senior male travelers (60+) and female travelers (45+) traveling alone or in pairs.',
    rule: 'Male: 60+ yrs | Female: 45+ yrs'
  },
  LD: {
    name: 'Ladies Quota',
    code: 'LD',
    description: 'Dedicated berths reserved exclusively for solo female travelers and mothers traveling with children.',
    rule: 'Sole female passengers and young children'
  },
  HP: {
    name: 'Divyangjan / Handicapped',
    code: 'HP',
    description: 'Reserved berths and concessions for differently abled passengers with valid railway photo ID.',
    rule: 'Requires official railway concession ID'
  }
};

export const TRAIN_DATABASE: TrainSchedule[] = [
  {
    number: '12012',
    name: 'Kalka - New Delhi Shatabdi Express',
    fromCode: 'CDG',
    fromStnName: 'Chandigarh Junction',
    toCode: 'NDLS',
    toStnName: 'New Delhi Railway Station',
    departureTime: '18:23',
    arrivalTime: '21:55',
    duration: '3h 32m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: 'Chart usually prepared around 14:15 - 14:30',
    type: 'Shatabdi'
  },
  {
    number: '22436',
    name: 'New Delhi - Varanasi Vande Bharat Express',
    fromCode: 'NDLS',
    fromStnName: 'New Delhi Railway Station',
    toCode: 'BSB',
    toStnName: 'Varanasi Junction',
    departureTime: '06:00',
    arrivalTime: '14:00',
    duration: '8h 00m',
    classes: ['CC', 'EC'],
    runsOn: ['Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: 'First chart prepared by 20:00 previous evening (06:00 departure)',
    type: 'Vande Bharat'
  },
  {
    number: '12004',
    name: 'Lucknow Swarna Shatabdi Express',
    fromCode: 'NDLS',
    fromStnName: 'New Delhi Railway Station',
    toCode: 'LKO',
    toStnName: 'Lucknow Charbagh NR',
    departureTime: '06:10',
    arrivalTime: '12:40',
    duration: '6h 30m',
    classes: ['CC', 'EC', 'EA'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: 'Chart prepared at 20:00 previous evening',
    type: 'Shatabdi'
  },
  {
    number: '12424',
    name: 'New Delhi - Dibrugarh Rajdhani Express',
    fromCode: 'NDLS',
    fromStnName: 'New Delhi Railway Station',
    toCode: 'PNBE',
    toStnName: 'Patna Junction',
    departureTime: '16:20',
    arrivalTime: '04:15',
    duration: '11h 55m',
    classes: ['1A', '2A', '3A'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: 'Chart prepared around 12:00 - 12:30 (4 hours before departure)',
    type: 'Rajdhani'
  },
  {
    number: '12952',
    name: 'New Delhi - Mumbai Central Tejas Rajdhani',
    fromCode: 'NDLS',
    fromStnName: 'New Delhi Railway Station',
    toCode: 'CSMT',
    toStnName: 'Chhatrapati Shivaji Maharaj Terminus',
    departureTime: '16:55',
    arrivalTime: '08:35',
    duration: '15h 40m',
    classes: ['1A', '2A', '3A'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: 'Chart prepared around 12:30 - 13:00',
    type: 'Rajdhani'
  },
  {
    number: '12626',
    name: 'Kerala Express',
    fromCode: 'NDLS',
    fromStnName: 'New Delhi Railway Station',
    toCode: 'TVC',
    toStnName: 'Thiruvananthapuram Central',
    departureTime: '20:10',
    arrivalTime: '14:15',
    duration: '42h 05m',
    classes: ['2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: 'Chart prepared around 16:00',
    type: 'Superfast'
  },
  {
    number: '12002',
    name: 'Bhopal Shatabdi Express',
    fromCode: 'NDLS',
    fromStnName: 'New Delhi Railway Station',
    toCode: 'RKMP',
    toStnName: 'Rani Kamlapati',
    departureTime: '06:00',
    arrivalTime: '14:40',
    duration: '8h 40m',
    classes: ['CC', 'EC', 'EA'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: 'Chart prepared at 20:00 previous night',
    type: 'Shatabdi'
  }
];

export function getTrainsForRoute(fromCode: string, toCode: string): TrainSchedule[] {
  const f = (fromCode || '').toUpperCase().trim();
  const t = (toCode || '').toUpperCase().trim();
  const direct = TRAIN_DATABASE.filter(
    (train) => (train.fromCode === f && train.toCode === t) || (train.fromCode === t && train.toCode === f)
  );
  if (direct.length > 0) return direct;

  const partial = TRAIN_DATABASE.filter(
    (train) => train.fromCode === f || train.toCode === t || train.fromCode === t || train.toCode === f
  );
  return partial.length > 0 ? partial : TRAIN_DATABASE.slice(0, 3);
}

