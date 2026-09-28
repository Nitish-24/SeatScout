import { Station, TrainSchedule, TrainClass, QuotaType } from '../types';

export const POPULAR_STATIONS: Station[] = [
  { code: 'NDLS', name: 'New Delhi Railway Station', city: 'New Delhi', state: 'Delhi', zone: 'NR', isMajor: true },
  { code: 'CDG', name: 'Chandigarh Junction', city: 'Chandigarh', state: 'Punjab', zone: 'NR', isMajor: true },
  { code: 'CSMT', name: 'Mumbai Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra', zone: 'CR', isMajor: true },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', zone: 'ER', isMajor: true },
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu', zone: 'SR', isMajor: true },
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka', zone: 'SWR', isMajor: true },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar', zone: 'ECR', isMajor: true },
  { code: 'GKP', name: 'Gorakhpur Junction', city: 'Gorakhpur', state: 'Uttar Pradesh', zone: 'NER', isMajor: true },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh', zone: 'NR', isMajor: true },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh', zone: 'NCR', isMajor: true },
  { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Junction', city: 'Mughalsarai', state: 'Uttar Pradesh', zone: 'ECR', isMajor: true },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh', zone: 'NR', isMajor: true },
  { code: 'PRYJ', name: 'Prayagraj Junction', city: 'Prayagraj', state: 'Uttar Pradesh', zone: 'NCR', isMajor: true },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat', zone: 'WR', isMajor: true },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra', zone: 'CR', isMajor: true },
  { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad', state: 'Telangana', zone: 'SCR', isMajor: true },
  { code: 'SC', name: 'Secunderabad Junction', city: 'Secunderabad', state: 'Telangana', zone: 'SCR', isMajor: true },
  { code: 'TVC', name: 'Thiruvananthapuram Central', city: 'Thiruvananthapuram', state: 'Kerala', zone: 'SR', isMajor: true },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan', zone: 'NWR', isMajor: true },
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh', zone: 'WCR', isMajor: true },
  { code: 'BDTS', name: 'Bandra Terminus', city: 'Mumbai', state: 'Maharashtra', zone: 'WR', isMajor: true },
  { code: 'ANVT', name: 'Anand Vihar Terminal', city: 'Delhi', state: 'Delhi', zone: 'NR', isMajor: true },
  { code: 'DLI', name: 'Old Delhi Junction', city: 'Delhi', state: 'Delhi', zone: 'NR', isMajor: true },
  { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'Delhi', state: 'Delhi', zone: 'NR', isMajor: true },
  { code: 'SDAH', name: 'Sealdah', city: 'Kolkata', state: 'West Bengal', zone: 'ER', isMajor: true },
  { code: 'BZA', name: 'Vijayawada Junction', city: 'Vijayawada', state: 'Andhra Pradesh', zone: 'SCR', isMajor: true },
  { code: 'VSKP', name: 'Visakhapatnam Junction', city: 'Visakhapatnam', state: 'Andhra Pradesh', zone: 'ECoR', isMajor: true },
  { code: 'GHY', name: 'Guwahati', city: 'Guwahati', state: 'Assam', zone: 'NFR', isMajor: true },
  { code: 'ASR', name: 'Amritsar Junction', city: 'Amritsar', state: 'Punjab', zone: 'NR', isMajor: true },
  { code: 'UMB', name: 'Ambala Cantt Junction', city: 'Ambala', state: 'Haryana', zone: 'NR', isMajor: true }
];

export const POPULAR_ROUTES = [
  { from: 'CDG', to: 'NDLS', label: 'Chandigarh → New Delhi (Shatabdi Corridor)' },
  { from: 'NDLS', to: 'CDG', label: 'New Delhi → Chandigarh' },
  { from: 'CSMT', to: 'PUNE', label: 'Mumbai CSMT → Pune (Deccan Queen Corridor)' },
  { from: 'NDLS', to: 'CNB', label: 'New Delhi → Kanpur Central' },
  { from: 'NDLS', to: 'LKO', label: 'New Delhi → Lucknow' },
  { from: 'HWH', to: 'PURI', label: 'Howrah → Puri (Vande Bharat)' },
  { from: 'SBC', to: 'MAS', label: 'Bengaluru → Chennai Central' },
  { from: 'NDLS', to: 'BSB', label: 'New Delhi → Varanasi (Vande Bharat)' }
];

export const CLASS_LABELS: Record<string, { name: string; short: string; description: string }> = {
  '1A': { name: 'AC First Class', short: '1A', description: 'Cabin / Coupé berths with lockable doors' },
  '2A': { name: 'AC 2-Tier', short: '2A', description: 'Curtained 4-berth bays + 2 side berths' },
  '3A': { name: 'AC 3-Tier', short: '3A', description: '6-berth bays + 2 side berths' },
  '3E': { name: 'AC 3-Tier Economy', short: '3E', description: 'Economy 3AC with modified berth spacing' },
  'CC': { name: 'AC Chair Car', short: 'CC', description: 'Push-back seats (Shatabdi & Intercity)' },
  'EC': { name: 'Executive Chair Car', short: 'EC', description: '2x2 Premium leather reclining chairs' },
  'EA': { name: 'Anubhuti Luxury', short: 'EA', description: 'Ultra-premium Vande Bharat / Shatabdi' },
  'SL': { name: 'Sleeper Class', short: 'SL', description: 'Non-AC 3-tier sleeper berths' },
  '2S': { name: 'Second Sitting', short: '2S', description: 'Reserved cushioned seats' },
  'ANY': { name: 'Any Available Class', short: 'ANY', description: 'Monitors all available travel classes' }
};

export const QUOTA_DETAILS: Record<QuotaType, { code: QuotaType; name: string; criteria: string; description: string }> = {
  'GN': {
    code: 'GN',
    name: 'General Quota',
    criteria: 'Open to all passengers',
    description: 'Standard booking quota with maximum berth allocation across trains'
  },
  'TQ': {
    code: 'TQ',
    name: 'Tatkal Quota',
    criteria: 'Last-minute emergency travel',
    description: 'Opens 1 day prior at 10:00 AM (AC) and 11:00 AM (Non-AC)'
  },
  'SS': {
    code: 'SS',
    name: 'Senior Citizen / Lower Berth',
    criteria: 'Men aged 60+ or Women aged 45+ traveling solo',
    description: 'Guaranteed lower berth allocation from reserved government quota'
  },
  'LD': {
    code: 'LD',
    name: 'Ladies Quota',
    criteria: 'Solo women or women with child under 12',
    description: 'Dedicated 6-berth sleeper/3AC bays designated for female passengers'
  },
  'HP': {
    code: 'HP',
    name: 'Divyangjan / PwD Quota',
    criteria: 'Passengers with physical disabilities + 1 escort',
    description: 'Wide entrance bays, lower berths, wheelchair assistance'
  }
};

let stationLookup: ((code: string) => Station | undefined) | null = null;

export function registerStationLookup(fn: (code: string) => Station | undefined) {
  stationLookup = fn;
}

export function lookupStation(code: string): Station | undefined {
  if (stationLookup) {
    const s = stationLookup(code);
    if (s) return s;
  }
  return POPULAR_STATIONS.find(s => s.code.toUpperCase() === code.trim().toUpperCase());
}

export const TRAIN_DATABASE: TrainSchedule[] = [
  {
    number: '12012',
    name: 'Kalka Shatabdi Express',
    fromCode: 'CDG',
    fromStnName: 'Chandigarh Junction',
    toCode: 'NDLS',
    toStnName: 'New Delhi Railway Station',
    departureTime: '18:23',
    arrivalTime: '21:55',
    duration: '3h 32m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    type: 'Shatabdi',
    chartingTimeNote: 'Chart prepared around 14:30 at Kalka / Chandigarh'
  },
  {
    number: '12006',
    name: 'Kalka Shatabdi Express (Morning)',
    fromCode: 'CDG',
    fromStnName: 'Chandigarh Junction',
    toCode: 'NDLS',
    toStnName: 'New Delhi Railway Station',
    departureTime: '06:53',
    arrivalTime: '10:15',
    duration: '3h 22m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    type: 'Shatabdi',
    chartingTimeNote: 'Chart prepared previous evening around 20:30'
  },
  {
    number: '12011',
    name: 'New Delhi - Kalka Shatabdi Express',
    fromCode: 'NDLS',
    fromStnName: 'New Delhi Railway Station',
    toCode: 'CDG',
    toStnName: 'Chandigarh Junction',
    departureTime: '07:40',
    arrivalTime: '11:05',
    duration: '3h 25m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    type: 'Shatabdi',
    chartingTimeNote: 'Chart prepared previous evening around 21:00'
  },
  {
    number: '12005',
    name: 'New Delhi - Kalka Shatabdi (Evening)',
    fromCode: 'NDLS',
    fromStnName: 'New Delhi Railway Station',
    toCode: 'CDG',
    toStnName: 'Chandigarh Junction',
    departureTime: '17:15',
    arrivalTime: '20:30',
    duration: '3h 15m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    type: 'Shatabdi',
    chartingTimeNote: 'Chart prepared around 13:30 at NDLS'
  }
];

export function getTrainsForRoute(fromCode: string, toCode: string): TrainSchedule[] {
  const f = fromCode.trim().toUpperCase();
  const t = toCode.trim().toUpperCase();

  const exact = TRAIN_DATABASE.filter(tr => tr.fromCode === f && tr.toCode === t);
  if (exact.length > 0) return exact;

  const fStn = lookupStation(f) || { code: f, name: `${f} Station`, city: f, state: '' };
  const tStn = lookupStation(t) || { code: t, name: `${t} Station`, city: t, state: '' };

  return [
    {
      number: '12050',
      name: `${fStn.city || f} - ${tStn.city || t} Superfast Express`,
      fromCode: f,
      fromStnName: fStn.name,
      toCode: t,
      toStnName: tStn.name,
      departureTime: '06:30',
      arrivalTime: '11:45',
      duration: '5h 15m',
      classes: ['CC', '3A', '2A', 'SL'],
      runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      type: 'Superfast',
      chartingTimeNote: 'Chart prepared 4 hours before departure'
    }
  ];
}
