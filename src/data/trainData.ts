import { Station, TrainSchedule, TrainClass, QuotaType } from '../types';

export const POPULAR_STATIONS: Station[] = [
  { code: 'CDG', name: 'Chandigarh Junction', city: 'Chandigarh', state: 'Chandigarh' },
  { code: 'NDLS', name: 'New Delhi', city: 'New Delhi', state: 'Delhi' },
  { code: 'DLI', name: 'Old Delhi', city: 'Delhi', state: 'Delhi' },
  { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'Delhi', state: 'Delhi' },
  { code: 'ANVT', name: 'Anand Vihar Terminal', city: 'Delhi', state: 'Delhi' },
  { code: 'DEE', name: 'Delhi Sarai Rohilla', city: 'Delhi', state: 'Delhi' },
  { code: 'DEC', name: 'Delhi Cantt', city: 'Delhi', state: 'Delhi' },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'BDTS', name: 'Bandra Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra' },
  { code: 'SBC', name: 'KSR Bengaluru', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'YPR', name: 'Yesvantpur Junction', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
  { code: 'MS', name: 'Chennai Egmore', city: 'Chennai', state: 'Tamil Nadu' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal' },
  { code: 'SDAH', name: 'Sealdah', city: 'Kolkata', state: 'West Bengal' },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar' },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh' },
  { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Junction', city: 'Varanasi / DDU', state: 'Uttar Pradesh' },
  { code: 'PRYJ', name: 'Prayagraj Junction', city: 'Prayagraj', state: 'Uttar Pradesh' },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh' },
  { code: 'LJN', name: 'Lucknow Junction', city: 'Lucknow', state: 'Uttar Pradesh' },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh' },
  { code: 'GKP', name: 'Gorakhpur Junction', city: 'Gorakhpur', state: 'Uttar Pradesh' },
  { code: 'AGC', name: 'Agra Cantt', city: 'Agra', state: 'Uttar Pradesh' },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat' },
  { code: 'ST', name: 'Surat', city: 'Surat', state: 'Gujarat' },
  { code: 'ASR', name: 'Amritsar Junction', city: 'Amritsar', state: 'Punjab' },
  { code: 'UMB', name: 'Ambala Cantt', city: 'Ambala', state: 'Haryana' },
  { code: 'KLK', name: 'Kalka', city: 'Kalka', state: 'Haryana' },
  { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad', state: 'Telangana' },
  { code: 'SC', name: 'Secunderabad Junction', city: 'Secunderabad', state: 'Telangana' },
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh' },
  { code: 'RKMP', name: 'Rani Kamlapati (Habibganj)', city: 'Bhopal', state: 'Madhya Pradesh' },
  { code: 'INDB', name: 'Indore Junction', city: 'Indore', state: 'Madhya Pradesh' },
  { code: 'GHY', name: 'Guwahati', city: 'Guwahati', state: 'Assam' },
  { code: 'BBS', name: 'Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha' },
  { code: 'PURI', name: 'Puri', city: 'Puri', state: 'Odisha' },
  { code: 'MAO', name: 'Madgaon Junction (Goa)', city: 'Goa', state: 'Goa' },
  { code: 'TVC', name: 'Thiruvananthapuram Central', city: 'Trivandrum', state: 'Kerala' },
  { code: 'DDN', name: 'Dehradun', city: 'Dehradun', state: 'Uttarakhand' },
  { code: 'HW', name: 'Haridwar', city: 'Haridwar', state: 'Uttarakhand' },
  { code: 'JAT', name: 'Jammu Tawi', city: 'Jammu', state: 'Jammu and Kashmir' },
  { code: 'SVDK', name: 'Shri Mata Vaishno Devi Katra', city: 'Katra', state: 'Jammu and Kashmir' }
];

export const POPULAR_ROUTES = [
  { from: 'CDG', to: 'NDLS', label: 'Chandigarh → New Delhi', popular: true, tagline: 'Heavy Shatabdi & Vande Bharat Route' },
  { from: 'NDLS', to: 'CDG', label: 'New Delhi → Chandigarh', popular: true, tagline: 'Daily Executive & Superfast' },
  { from: 'NDLS', to: 'BSB', label: 'New Delhi → Varanasi', popular: true, tagline: 'Vande Bharat & Shiv Ganga SF' },
  { from: 'NDLS', to: 'MMCT', label: 'New Delhi → Mumbai', popular: true, tagline: 'Rajdhani / Tejas Express' },
  { from: 'MMCT', to: 'NDLS', label: 'Mumbai → New Delhi', popular: true, tagline: 'Superfast Corridor' },
  { from: 'SBC', to: 'MAS', label: 'Bengaluru → Chennai', popular: true, tagline: 'Shatabdi & Vande Bharat' },
  { from: 'NDLS', to: 'LKO', label: 'New Delhi → Lucknow', popular: true, tagline: 'Tejas & Shatabdi Route' },
  { from: 'NDLS', to: 'PRYJ', label: 'New Delhi → Prayagraj', popular: true, tagline: 'Prayagraj Express & Vande Bharat' },
  { from: 'NDLS', to: 'SVDK', label: 'New Delhi → Katra (Jammu)', popular: true, tagline: 'Vande Bharat & Shri Shakti' },
  { from: 'NDLS', to: 'PNBE', label: 'New Delhi → Patna', popular: true, tagline: 'Tejas Rajdhani & Sampoorna Kranti' },
  { from: 'HWH', to: 'PNBE', label: 'Howrah → Patna', popular: true, tagline: 'Vande Bharat & Jan Shatabdi' }
];

// Metros station cluster mapping
export const CITY_CLUSTERS: Record<string, string[]> = {
  'NDLS': ['NDLS', 'DLI', 'NZM', 'ANVT', 'DEE', 'DEC'],
  'DLI': ['NDLS', 'DLI', 'NZM', 'ANVT', 'DEE', 'DEC'],
  'NZM': ['NDLS', 'DLI', 'NZM', 'ANVT', 'DEE', 'DEC'],
  'ANVT': ['NDLS', 'DLI', 'NZM', 'ANVT', 'DEE', 'DEC'],
  'DEE': ['NDLS', 'DLI', 'NZM', 'ANVT', 'DEE', 'DEC'],
  'DEC': ['NDLS', 'DLI', 'NZM', 'ANVT', 'DEE', 'DEC'],
  'CDG': ['CDG', 'KLK', 'UMB'],
  'KLK': ['CDG', 'KLK', 'UMB'],
  'UMB': ['CDG', 'KLK', 'UMB'],
  'MMCT': ['MMCT', 'CSMT', 'BDTS', 'BVI', 'DR'],
  'CSMT': ['MMCT', 'CSMT', 'BDTS', 'BVI', 'DR'],
  'BDTS': ['MMCT', 'CSMT', 'BDTS', 'BVI', 'DR'],
  'SBC': ['SBC', 'YPR'],
  'YPR': ['SBC', 'YPR'],
  'MAS': ['MAS', 'MS'],
  'MS': ['MAS', 'MS'],
  'HWH': ['HWH', 'SDAH'],
  'SDAH': ['HWH', 'SDAH'],
  'BSB': ['BSB', 'DDU'],
  'DDU': ['BSB', 'DDU'],
  'PRYJ': ['PRYJ'],
  'LKO': ['LKO', 'LJN'],
  'LJN': ['LKO', 'LJN'],
  'JAT': ['JAT', 'SVDK'],
  'SVDK': ['JAT', 'SVDK'],
  'ADI': ['ADI'],
  'JP': ['JP']
};

let externalStationLookup: ((code: string) => Station | undefined) | null = null;
export function registerStationLookup(fn: (code: string) => Station | undefined) {
  externalStationLookup = fn;
}

export function getTrainsForRoute(fromCode: string, toCode: string, query?: string): TrainSchedule[] {
  // 1. If explicit query provided, search entire database first
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    const queryMatches = TRAIN_DATABASE.filter(
      (t) => t.number.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
    );
    if (queryMatches.length > 0) return queryMatches;
  }

  // 2. Direct exact station match
  const direct = TRAIN_DATABASE.filter(
    (t) => t.fromCode === fromCode && t.toCode === toCode
  );

  // 3. Metro Cluster match (e.g. CDG -> NDLS/DLI/NZM)
  const fromCluster = CITY_CLUSTERS[fromCode] || [fromCode];
  const toCluster = CITY_CLUSTERS[toCode] || [toCode];

  const clusterMatches = TRAIN_DATABASE.filter(
    (t) => fromCluster.includes(t.fromCode) && toCluster.includes(t.toCode)
  );

  if (clusterMatches.length > 0) {
    // Deduplicate by train number, giving priority to direct match
    const seen = new Set<string>();
    const deduplicated: TrainSchedule[] = [];
    for (const t of direct) {
      if (!seen.has(t.number)) {
        seen.add(t.number);
        deduplicated.push(t);
      }
    }
    for (const t of clusterMatches) {
      if (!seen.has(t.number)) {
        seen.add(t.number);
        deduplicated.push(t);
      }
    }
    return deduplicated;
  }

  // 4. Return empty list if no trains match route - NEVER fabricate fake trains!
  return [];
}

export const TRAIN_DATABASE: TrainSchedule[] = [
  // ================= CHANDIGARH -> DELHI CORRIDOR =================
  {
    number: '12012',
    name: 'Kalka Shatabdi Express',
    fromCode: 'CDG',
    toCode: 'NDLS',
    departureTime: '18:23',
    arrivalTime: '21:55',
    duration: '3h 32m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared around 14:15. Current booking active 14:30 - 18:00.',
    type: 'Shatabdi'
  },
  {
    number: '12006',
    name: 'Kalka Shatabdi Express',
    fromCode: 'CDG',
    toCode: 'NDLS',
    departureTime: '06:53',
    arrivalTime: '10:20',
    duration: '3h 27m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared around 20:00 (previous night). High early-morning CURR_AVBL.',
    type: 'Shatabdi'
  },
  {
    number: '12046',
    name: 'Chandigarh - New Delhi Shatabdi',
    fromCode: 'CDG',
    toCode: 'NDLS',
    departureTime: '12:05',
    arrivalTime: '15:20',
    duration: '3h 15m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 08:00 AM.',
    type: 'Shatabdi'
  },
  {
    number: '22448',
    name: 'Amb Andaura - New Delhi Vande Bharat',
    fromCode: 'CDG',
    toCode: 'NDLS',
    departureTime: '15:32',
    arrivalTime: '18:25',
    duration: '2h 53m',
    classes: ['CC', 'EC', 'EA'],
    runsOn: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 11:30 AM.',
    type: 'Vande Bharat'
  },
  {
    number: '20978',
    name: 'Chandigarh - Ajmer Vande Bharat Express',
    fromCode: 'CDG',
    toCode: 'DEC',
    departureTime: '15:15',
    arrivalTime: '18:31',
    duration: '3h 16m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 11:15 AM.',
    type: 'Vande Bharat'
  },
  {
    number: '12926',
    name: 'Paschim Superfast Express',
    fromCode: 'CDG',
    toCode: 'NDLS',
    departureTime: '12:20',
    arrivalTime: '16:35',
    duration: '4h 15m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 08:30 AM.',
    type: 'Superfast'
  },
  {
    number: '12058',
    name: 'Daulatpur Chowk - New Delhi Jan Shatabdi',
    fromCode: 'CDG',
    toCode: 'NDLS',
    departureTime: '07:43',
    arrivalTime: '12:00',
    duration: '4h 17m',
    classes: ['CC', '2S'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 20:00 (prev night).',
    type: 'Shatabdi'
  },
  {
    number: '14218',
    name: 'Unchahar Express',
    fromCode: 'CDG',
    toCode: 'DLI',
    departureTime: '16:45',
    arrivalTime: '21:10',
    duration: '4h 25m',
    classes: ['2A', '3A', 'SL', '2S'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 12:45 PM.',
    type: 'Express'
  },
  {
    number: '12460',
    name: 'Amritsar - New Delhi Intercity Express',
    fromCode: 'CDG',
    toCode: 'NDLS',
    departureTime: '10:15',
    arrivalTime: '14:15',
    duration: '4h 00m',
    classes: ['CC', '2S', '3A'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 06:15 AM.',
    type: 'Superfast'
  },
  {
    number: '12218',
    name: 'Kerala Sampark Kranti Express',
    fromCode: 'CDG',
    toCode: 'NZM',
    departureTime: '09:30',
    arrivalTime: '13:15',
    duration: '3h 45m',
    classes: ['2A', '3A', '3E', 'SL'],
    runsOn: ['Wed', 'Fri'],
    chartingTimeNote: '1st Chart prepared at 20:00 (prev night).',
    type: 'Superfast'
  },
  {
    number: '12450',
    name: 'Goa Sampark Kranti Express',
    fromCode: 'CDG',
    toCode: 'NZM',
    departureTime: '02:15',
    arrivalTime: '05:50',
    duration: '3h 35m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Sat'],
    chartingTimeNote: '1st Chart prepared at 20:00 (prev night).',
    type: 'Superfast'
  },
  {
    number: '14054',
    name: 'Himachal Express',
    fromCode: 'CDG',
    toCode: 'DLI',
    departureTime: '22:30',
    arrivalTime: '05:05',
    duration: '6h 35m',
    classes: ['1A', '2A', '3A', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 18:30.',
    type: 'Express'
  },
  {
    number: '12984',
    name: 'Chandigarh - Ajmer Garib Rath Express',
    fromCode: 'CDG',
    toCode: 'DEE',
    departureTime: '19:45',
    arrivalTime: '00:05',
    duration: '4h 20m',
    classes: ['3A'],
    runsOn: ['Mon', 'Wed', 'Sat'],
    chartingTimeNote: '1st Chart prepared at 15:45.',
    type: 'Superfast'
  },
  {
    number: '12242',
    name: 'Amritsar - Chandigarh - Delhi Superfast',
    fromCode: 'CDG',
    toCode: 'NDLS',
    departureTime: '09:40',
    arrivalTime: '13:55',
    duration: '4h 15m',
    classes: ['CC', '2S', '3A'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 06:00 AM.',
    type: 'Superfast'
  },
  {
    number: '12312',
    name: 'Netaji Express',
    fromCode: 'CDG',
    toCode: 'DLI',
    departureTime: '01:25',
    arrivalTime: '06:15',
    duration: '4h 50m',
    classes: ['1A', '2A', '3A', '3E', 'SL', '2S'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared around 20:00 (prev evening). Current booking active late night.',
    type: 'Mail'
  },
  {
    number: '12312',
    name: 'Netaji Express',
    fromCode: 'CDG',
    toCode: 'NDLS',
    departureTime: '01:25',
    arrivalTime: '06:15',
    duration: '4h 50m',
    classes: ['1A', '2A', '3A', '3E', 'SL', '2S'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared around 20:00 (prev evening). Current booking active late night.',
    type: 'Mail'
  },
  {
    number: '12312',
    name: 'Kalka - Howrah Netaji Express',
    fromCode: 'CDG',
    toCode: 'HWH',
    departureTime: '01:25',
    arrivalTime: '08:05',
    duration: '30h 40m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared around 20:00 (prev evening).',
    type: 'Mail'
  },
  {
    number: '12312',
    name: 'Netaji Express',
    fromCode: 'DLI',
    toCode: 'HWH',
    departureTime: '06:15',
    arrivalTime: '08:05',
    duration: '25h 50m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared around 20:00 (prev evening).',
    type: 'Mail'
  },
  {
    number: '12312',
    name: 'Netaji Express',
    fromCode: 'NDLS',
    toCode: 'HWH',
    departureTime: '06:15',
    arrivalTime: '08:05',
    duration: '25h 50m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared around 20:00 (prev evening).',
    type: 'Mail'
  },

  // ================= DELHI -> CHANDIGARH CORRIDOR =================
  {
    number: '12011',
    name: 'New Delhi - Kalka Shatabdi',
    fromCode: 'NDLS',
    toCode: 'CDG',
    departureTime: '07:40',
    arrivalTime: '11:05',
    duration: '3h 25m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared around 20:00 (prev night).',
    type: 'Shatabdi'
  },
  {
    number: '12045',
    name: 'New Delhi - Chandigarh Shatabdi',
    fromCode: 'NDLS',
    toCode: 'CDG',
    departureTime: '19:15',
    arrivalTime: '22:35',
    duration: '3h 20m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 15:00.',
    type: 'Shatabdi'
  },
  {
    number: '12005',
    name: 'New Delhi - Kalka Shatabdi',
    fromCode: 'NDLS',
    toCode: 'CDG',
    departureTime: '17:15',
    arrivalTime: '20:30',
    duration: '3h 15m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 13:15.',
    type: 'Shatabdi'
  },
  {
    number: '22447',
    name: 'New Delhi - Amb Andaura Vande Bharat',
    fromCode: 'NDLS',
    toCode: 'CDG',
    departureTime: '05:50',
    arrivalTime: '08:40',
    duration: '2h 50m',
    classes: ['CC', 'EC', 'EA'],
    runsOn: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 20:00 (prev night).',
    type: 'Vande Bharat'
  },
  {
    number: '20977',
    name: 'Ajmer - Chandigarh Vande Bharat',
    fromCode: 'DEC',
    toCode: 'CDG',
    departureTime: '11:20',
    arrivalTime: '14:45',
    duration: '3h 25m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 07:30 AM.',
    type: 'Vande Bharat'
  },
  {
    number: '12925',
    name: 'Paschim Superfast Express',
    fromCode: 'NDLS',
    toCode: 'CDG',
    departureTime: '11:05',
    arrivalTime: '15:55',
    duration: '4h 50m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 07:00 AM.',
    type: 'Superfast'
  },
  {
    number: '12057',
    name: 'New Delhi - Daulatpur Chowk Jan Shatabdi',
    fromCode: 'NDLS',
    toCode: 'CDG',
    departureTime: '14:35',
    arrivalTime: '18:45',
    duration: '4h 10m',
    classes: ['CC', '2S'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 10:30 AM.',
    type: 'Shatabdi'
  },
  {
    number: '14217',
    name: 'Unchahar Express',
    fromCode: 'DLI',
    toCode: 'CDG',
    departureTime: '04:00',
    arrivalTime: '09:15',
    duration: '5h 15m',
    classes: ['2A', '3A', 'SL', '2S'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 20:00 (prev night).',
    type: 'Express'
  },
  {
    number: '12459',
    name: 'New Delhi - Amritsar Intercity',
    fromCode: 'NDLS',
    toCode: 'CDG',
    departureTime: '13:50',
    arrivalTime: '17:55',
    duration: '4h 05m',
    classes: ['CC', '2S', '3A'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 09:50 AM.',
    type: 'Superfast'
  },
  {
    number: '14053',
    name: 'Himachal Express',
    fromCode: 'DLI',
    toCode: 'CDG',
    departureTime: '22:50',
    arrivalTime: '04:30',
    duration: '5h 40m',
    classes: ['1A', '2A', '3A', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 18:50.',
    type: 'Express'
  },
  {
    number: '12311',
    name: 'Netaji Express',
    fromCode: 'DLI',
    toCode: 'CDG',
    departureTime: '21:10',
    arrivalTime: '01:25',
    duration: '4h 15m',
    classes: ['1A', '2A', '3A', '3E', 'SL', '2S'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 17:10 (4 hours prior to departure).',
    type: 'Mail'
  },
  {
    number: '12311',
    name: 'Netaji Express',
    fromCode: 'NDLS',
    toCode: 'CDG',
    departureTime: '21:10',
    arrivalTime: '01:25',
    duration: '4h 15m',
    classes: ['1A', '2A', '3A', '3E', 'SL', '2S'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 17:10 (4 hours prior to departure).',
    type: 'Mail'
  },
  {
    number: '12311',
    name: 'Howrah - Kalka Netaji Express',
    fromCode: 'HWH',
    toCode: 'CDG',
    departureTime: '21:55',
    arrivalTime: '01:25',
    duration: '27h 30m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 17:55.',
    type: 'Mail'
  },
  {
    number: '12311',
    name: 'Howrah - Kalka Netaji Express',
    fromCode: 'HWH',
    toCode: 'DLI',
    departureTime: '21:55',
    arrivalTime: '20:55',
    duration: '23h 00m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 17:55.',
    type: 'Mail'
  },
  {
    number: '12311',
    name: 'Howrah - Kalka Netaji Express',
    fromCode: 'HWH',
    toCode: 'NDLS',
    departureTime: '21:55',
    arrivalTime: '20:55',
    duration: '23h 00m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 17:55.',
    type: 'Mail'
  },

  // ================= NEW DELHI <-> MUMBAI =================
  {
    number: '12952',
    name: 'New Delhi - Mumbai Central Tejas Rajdhani',
    fromCode: 'NDLS',
    toCode: 'MMCT',
    departureTime: '16:55',
    arrivalTime: '08:35',
    duration: '15h 40m',
    classes: ['1A', '2A', '3A', '3E'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 12:45 PM.',
    type: 'Rajdhani'
  },
  {
    number: '12951',
    name: 'Mumbai Central - New Delhi Tejas Rajdhani',
    fromCode: 'MMCT',
    toCode: 'NDLS',
    departureTime: '17:00',
    arrivalTime: '08:32',
    duration: '15h 32m',
    classes: ['1A', '2A', '3A', '3E'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 13:00 PM.',
    type: 'Rajdhani'
  },
  {
    number: '12954',
    name: 'August Kranti Tejas Rajdhani',
    fromCode: 'NZM',
    toCode: 'MMCT',
    departureTime: '17:15',
    arrivalTime: '09:45',
    duration: '16h 30m',
    classes: ['1A', '2A', '3A'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 13:15 PM.',
    type: 'Rajdhani'
  },
  {
    number: '12953',
    name: 'August Kranti Tejas Rajdhani',
    fromCode: 'MMCT',
    toCode: 'NZM',
    departureTime: '17:10',
    arrivalTime: '09:43',
    duration: '16h 33m',
    classes: ['1A', '2A', '3A'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 13:10 PM.',
    type: 'Rajdhani'
  },
  {
    number: '22210',
    name: 'New Delhi - Mumbai Central AC Duronto',
    fromCode: 'NDLS',
    toCode: 'MMCT',
    departureTime: '22:10',
    arrivalTime: '15:50',
    duration: '17h 40m',
    classes: ['1A', '2A', '3A'],
    runsOn: ['Tue', 'Sat'],
    chartingTimeNote: '1st Chart prepared at 18:00.',
    type: 'Duronto'
  },
  {
    number: '22209',
    name: 'Mumbai Central - New Delhi AC Duronto',
    fromCode: 'MMCT',
    toCode: 'NDLS',
    departureTime: '23:10',
    arrivalTime: '15:55',
    duration: '16h 45m',
    classes: ['1A', '2A', '3A'],
    runsOn: ['Mon', 'Fri'],
    chartingTimeNote: '1st Chart prepared at 19:10.',
    type: 'Duronto'
  },
  {
    number: '12910',
    name: 'Hazrat Nizamuddin - Bandra Garib Rath',
    fromCode: 'NZM',
    toCode: 'BDTS',
    departureTime: '15:35',
    arrivalTime: '09:15',
    duration: '17h 40m',
    classes: ['3A'],
    runsOn: ['Wed', 'Fri', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 11:35 AM.',
    type: 'Superfast'
  },
  {
    number: '12909',
    name: 'Bandra - Hazrat Nizamuddin Garib Rath',
    fromCode: 'BDTS',
    toCode: 'NZM',
    departureTime: '17:30',
    arrivalTime: '10:15',
    duration: '16h 45m',
    classes: ['3A'],
    runsOn: ['Tue', 'Thu', 'Sat'],
    chartingTimeNote: '1st Chart prepared at 13:30 PM.',
    type: 'Superfast'
  },

  // ================= NEW DELHI <-> VARANASI =================
  {
    number: '22436',
    name: 'New Delhi - Varanasi Vande Bharat',
    fromCode: 'NDLS',
    toCode: 'BSB',
    departureTime: '06:00',
    arrivalTime: '14:00',
    duration: '8h 00m',
    classes: ['CC', 'EC', 'EA'],
    runsOn: ['Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 20:00 (prev night).',
    type: 'Vande Bharat'
  },
  {
    number: '22435',
    name: 'Varanasi - New Delhi Vande Bharat',
    fromCode: 'BSB',
    toCode: 'NDLS',
    departureTime: '15:00',
    arrivalTime: '23:00',
    duration: '8h 00m',
    classes: ['CC', 'EC', 'EA'],
    runsOn: ['Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 11:00 AM.',
    type: 'Vande Bharat'
  },
  {
    number: '20178',
    name: 'New Delhi - Varanasi Vande Bharat (2nd)',
    fromCode: 'NDLS',
    toCode: 'BSB',
    departureTime: '15:00',
    arrivalTime: '23:05',
    duration: '8h 05m',
    classes: ['CC', 'EC', 'EA'],
    runsOn: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 11:00 AM.',
    type: 'Vande Bharat'
  },
  {
    number: '20177',
    name: 'Varanasi - New Delhi Vande Bharat (2nd)',
    fromCode: 'BSB',
    toCode: 'NDLS',
    departureTime: '06:00',
    arrivalTime: '14:05',
    duration: '8h 05m',
    classes: ['CC', 'EC', 'EA'],
    runsOn: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 20:00 (prev night).',
    type: 'Vande Bharat'
  },
  {
    number: '12560',
    name: 'Shiv Ganga Superfast Express',
    fromCode: 'NDLS',
    toCode: 'BSB',
    departureTime: '20:05',
    arrivalTime: '06:10',
    duration: '10h 05m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 16:00.',
    type: 'Superfast'
  },
  {
    number: '12559',
    name: 'Shiv Ganga Superfast Express',
    fromCode: 'BSB',
    toCode: 'NDLS',
    departureTime: '22:15',
    arrivalTime: '08:25',
    duration: '10h 10m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 18:15.',
    type: 'Superfast'
  },
  {
    number: '12582',
    name: 'New Delhi - Banaras SF Express',
    fromCode: 'NDLS',
    toCode: 'BSB',
    departureTime: '22:50',
    arrivalTime: '09:45',
    duration: '10h 55m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 18:50.',
    type: 'Superfast'
  },
  {
    number: '15128',
    name: 'Kashi Vishwanath Express',
    fromCode: 'NDLS',
    toCode: 'BSB',
    departureTime: '11:35',
    arrivalTime: '04:40',
    duration: '17h 05m',
    classes: ['1A', '2A', '3A', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 07:35 AM.',
    type: 'Express'
  },

  // ================= NEW DELHI <-> LUCKNOW =================
  {
    number: '12004',
    name: 'New Delhi - Lucknow Shatabdi Express',
    fromCode: 'NDLS',
    toCode: 'LJN',
    departureTime: '06:10',
    arrivalTime: '12:40',
    duration: '6h 30m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 20:00 (prev night).',
    type: 'Shatabdi'
  },
  {
    number: '12003',
    name: 'Lucknow - New Delhi Shatabdi Express',
    fromCode: 'LJN',
    toCode: 'NDLS',
    departureTime: '15:30',
    arrivalTime: '22:20',
    duration: '6h 50m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 11:30 AM.',
    type: 'Shatabdi'
  },
  {
    number: '82502',
    name: 'New Delhi - Lucknow IRCTC Tejas Express',
    fromCode: 'NDLS',
    toCode: 'LJN',
    departureTime: '15:40',
    arrivalTime: '22:05',
    duration: '6h 25m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 11:40 AM.',
    type: 'Tejas'
  },
  {
    number: '82501',
    name: 'Lucknow - New Delhi IRCTC Tejas Express',
    fromCode: 'LJN',
    toCode: 'NDLS',
    departureTime: '06:10',
    arrivalTime: '12:25',
    duration: '6h 15m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 20:00 (prev night).',
    type: 'Tejas'
  },
  {
    number: '12230',
    name: 'Lucknow Mail',
    fromCode: 'NDLS',
    toCode: 'LKO',
    departureTime: '22:00',
    arrivalTime: '06:50',
    duration: '8h 50m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 18:00.',
    type: 'Superfast'
  },
  {
    number: '12229',
    name: 'Lucknow Mail',
    fromCode: 'LKO',
    toCode: 'NDLS',
    departureTime: '22:00',
    arrivalTime: '06:55',
    duration: '8h 55m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 18:00.',
    type: 'Superfast'
  },

  // ================= NEW DELHI <-> PRAYAGRAJ =================
  {
    number: '12418',
    name: 'Prayagraj Express',
    fromCode: 'NDLS',
    toCode: 'PRYJ',
    departureTime: '22:10',
    arrivalTime: '07:00',
    duration: '8h 50m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 18:00. Frequent senior citizen lower berth releases.',
    type: 'Superfast'
  },
  {
    number: '12417',
    name: 'Prayagraj - New Delhi Express',
    fromCode: 'PRYJ',
    toCode: 'NDLS',
    departureTime: '22:10',
    arrivalTime: '07:00',
    duration: '8h 50m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 18:00.',
    type: 'Superfast'
  },

  // ================= NEW DELHI <-> JAMMU & KATRA =================
  {
    number: '22439',
    name: 'New Delhi - Katra Vande Bharat Express',
    fromCode: 'NDLS',
    toCode: 'SVDK',
    departureTime: '06:00',
    arrivalTime: '14:00',
    duration: '8h 00m',
    classes: ['CC', 'EC', 'EA'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 20:00 (prev night).',
    type: 'Vande Bharat'
  },
  {
    number: '22440',
    name: 'Katra - New Delhi Vande Bharat Express',
    fromCode: 'SVDK',
    toCode: 'NDLS',
    departureTime: '15:00',
    arrivalTime: '23:00',
    duration: '8h 00m',
    classes: ['CC', 'EC', 'EA'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 11:00 AM.',
    type: 'Vande Bharat'
  },
  {
    number: '22461',
    name: 'Shri Shakti AC Superfast Express',
    fromCode: 'NDLS',
    toCode: 'SVDK',
    departureTime: '19:05',
    arrivalTime: '09:05',
    duration: '14h 00m',
    classes: ['1A', '2A', '3A'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 15:05.',
    type: 'Superfast'
  },
  {
    number: '12445',
    name: 'Uttar Sampark Kranti Express',
    fromCode: 'NDLS',
    toCode: 'SVDK',
    departureTime: '20:50',
    arrivalTime: '07:55',
    duration: '11h 05m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 16:50.',
    type: 'Superfast'
  },

  // ================= NEW DELHI <-> PATNA =================
  {
    number: '12310',
    name: 'New Delhi - Rajendra Nagar Tejas Rajdhani',
    fromCode: 'NDLS',
    toCode: 'PNBE',
    departureTime: '17:10',
    arrivalTime: '05:15',
    duration: '12h 05m',
    classes: ['1A', '2A', '3A'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 13:00 PM.',
    type: 'Rajdhani'
  },
  {
    number: '12394',
    name: 'Sampoorna Kranti Express',
    fromCode: 'NDLS',
    toCode: 'PNBE',
    departureTime: '17:30',
    arrivalTime: '06:50',
    duration: '13h 20m',
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 13:30.',
    type: 'Superfast'
  },

  // ================= BENGALURU <-> CHENNAI =================
  {
    number: '12008',
    name: 'MGR Chennai Central Shatabdi Express',
    fromCode: 'SBC',
    toCode: 'MAS',
    departureTime: '16:25',
    arrivalTime: '21:30',
    duration: '5h 05m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    chartingTimeNote: '1st Chart prepared around 12:30 PM.',
    type: 'Shatabdi'
  },
  {
    number: '12027',
    name: 'MGR Chennai - Bengaluru Shatabdi Express',
    fromCode: 'MAS',
    toCode: 'SBC',
    departureTime: '17:30',
    arrivalTime: '22:30',
    duration: '5h 00m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 13:30.',
    type: 'Shatabdi'
  },
  {
    number: '20608',
    name: 'Mysuru - Chennai Central Vande Bharat',
    fromCode: 'SBC',
    toCode: 'MAS',
    departureTime: '14:50',
    arrivalTime: '19:20',
    duration: '4h 30m',
    classes: ['CC', 'EC', 'EA'],
    runsOn: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 10:50 AM.',
    type: 'Vande Bharat'
  },
  {
    number: '20607',
    name: 'Chennai - Mysuru Vande Bharat (via SBC)',
    fromCode: 'MAS',
    toCode: 'SBC',
    departureTime: '05:50',
    arrivalTime: '10:20',
    duration: '4h 30m',
    classes: ['CC', 'EC', 'EA'],
    runsOn: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 20:00 (prev night).',
    type: 'Vande Bharat'
  },
  {
    number: '12640',
    name: 'Brindavan Express',
    fromCode: 'SBC',
    toCode: 'MAS',
    departureTime: '15:10',
    arrivalTime: '21:10',
    duration: '6h 00m',
    classes: ['CC', '2S'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 11:10 AM.',
    type: 'Superfast'
  },
  {
    number: '12610',
    name: 'Chennai Intercity SF Express',
    fromCode: 'SBC',
    toCode: 'MAS',
    departureTime: '08:00',
    arrivalTime: '14:30',
    duration: '6h 30m',
    classes: ['CC', '2S'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 20:00 (prev night).',
    type: 'Superfast'
  },

  // ================= NEW DELHI <-> HOWRAH =================
  {
    number: '12302',
    name: 'New Delhi - Howrah Rajdhani Express',
    fromCode: 'NDLS',
    toCode: 'HWH',
    departureTime: '16:55',
    arrivalTime: '09:55',
    duration: '17h 00m',
    classes: ['1A', '2A', '3A'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 12:45 PM.',
    type: 'Rajdhani'
  },
  {
    number: '12301',
    name: 'Howrah - New Delhi Rajdhani Express',
    fromCode: 'HWH',
    toCode: 'NDLS',
    departureTime: '16:50',
    arrivalTime: '10:05',
    duration: '17h 15m',
    classes: ['1A', '2A', '3A'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    chartingTimeNote: '1st Chart prepared at 12:30 PM.',
    type: 'Rajdhani'
  },
  {
    number: '12314',
    name: 'Sealdah Rajdhani Express',
    fromCode: 'NDLS',
    toCode: 'SDAH',
    departureTime: '16:30',
    arrivalTime: '10:10',
    duration: '17h 40m',
    classes: ['1A', '2A', '3A'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartingTimeNote: '1st Chart prepared at 12:30 PM.',
    type: 'Rajdhani'
  },

  // ================= AHMEDABAD <-> MUMBAI =================
  {
    number: '20902',
    name: 'Ahmedabad - Mumbai Central Vande Bharat',
    fromCode: 'ADI',
    toCode: 'MMCT',
    departureTime: '16:45',
    arrivalTime: '21:55',
    duration: '5h 10m',
    classes: ['CC', 'EC', 'EA'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    chartingTimeNote: '1st Chart prepared at 12:30 PM.',
    type: 'Vande Bharat'
  },
  {
    number: '20901',
    name: 'Mumbai Central - Ahmedabad Vande Bharat',
    fromCode: 'MMCT',
    toCode: 'ADI',
    departureTime: '06:00',
    arrivalTime: '11:25',
    duration: '5h 25m',
    classes: ['CC', 'EC', 'EA'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    chartingTimeNote: '1st Chart prepared at 20:00 (prev night).',
    type: 'Vande Bharat'
  },
  {
    number: '12010',
    name: 'Ahmedabad - Mumbai Central Shatabdi Express',
    fromCode: 'ADI',
    toCode: 'MMCT',
    departureTime: '15:10',
    arrivalTime: '21:45',
    duration: '6h 35m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    chartingTimeNote: '1st Chart prepared at 11:00 AM.',
    type: 'Shatabdi'
  },
  {
    number: '12009',
    name: 'Mumbai Central - Ahmedabad Shatabdi Express',
    fromCode: 'MMCT',
    toCode: 'ADI',
    departureTime: '06:20',
    arrivalTime: '12:45',
    duration: '6h 25m',
    classes: ['CC', 'EC'],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    chartingTimeNote: '1st Chart prepared at 20:00 (prev night).',
    type: 'Shatabdi'
  }
];

export const CLASS_LABELS: Record<string, { name: string; short: string }> = {
  '1A': { name: 'AC First Class', short: '1A' },
  '2A': { name: 'AC 2 Tier', short: '2A' },
  '3A': { name: 'AC 3 Tier', short: '3A' },
  '3E': { name: 'AC 3 Economy', short: '3E' },
  'CC': { name: 'AC Chair car', short: 'CC' },
  'EC': { name: 'Exec. Chair Car', short: 'EC' },
  'EA': { name: 'Anubhuti / Exec', short: 'EA' },
  'SL': { name: 'Sleeper', short: 'SL' },
  '2S': { name: 'Second Sitting', short: '2S' },
  'ANY': { name: 'Any Class', short: 'ANY' }
};

export const QUOTA_DETAILS: Record<string, { name: string; desc: string }> = {
  GN: { name: 'General (GN)', desc: 'Standard Public Quota' },
  TQ: { name: 'Tatkal (TQ)', desc: 'Emergency Short-notice Quota' },
  PT: { name: 'Premium Tatkal (PT)', desc: 'Dynamic Fare Quota' },
  SS: { name: 'Senior Citizen / Lower Berth (SS)', desc: 'Lower berth reserved for seniors' },
  LD: { name: 'Ladies Quota (LD)', desc: 'Reserved for solo female passengers' },
  HO: { name: 'Headquarters / High Official (HO)', desc: 'Railway Board Emergency Quota' }
};
