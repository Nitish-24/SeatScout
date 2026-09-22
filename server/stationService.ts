import fs from 'fs';
import path from 'path';

export interface IndianRailwayStation {
  code: string;
  name: string;
  city: string;
  state: string;
  zone?: string;
  isMajor?: boolean;
}

// In-memory cache and indexed lookup tables
let stationsList: IndianRailwayStation[] = [];
const stationCodeMap = new Map<string, IndianRailwayStation>();

// List of top major railway terminals and junctions in India for prioritised suggestions
const MAJOR_STATION_CODES = new Set([
  'NDLS', 'CSMT', 'HWH', 'MAS', 'SBC', 'CDG', 'PNBE', 'GKP', 'LKO', 'CNB',
  'DDU', 'BSB', 'PRYJ', 'ADI', 'PUNE', 'HYB', 'SC', 'TVC', 'JP', 'BPL',
  'BDTS', 'ANVT', 'DLI', 'NZM', 'SDAH', 'BZA', 'VSKP', 'GHY', 'ASR', 'UMB',
  'MFP', 'DBG', 'CPR', 'GAYA', 'RNC', 'DHN', 'TATA', 'BBS', 'PURI', 'ROU',
  'CBE', 'MDU', 'ERS', 'CLT', 'MAQ', 'UBL', 'ST', 'BRC', 'RJT', 'NGP',
  'INDB', 'GWL', 'VGLJ', 'JBP', 'KOTA', 'JU', 'AII', 'SVDK', 'JAT', 'HW',
  'DDN', 'YNRK', 'AYC', 'AY', 'RKMP', 'SMVB', 'YPR', 'KJM', 'SUR'
]);

/**
 * Initialize station dataset from server data directory
 */
export function initializeStationDatabase(): void {
  try {
    const dataFilePath = path.join(process.cwd(), 'server', 'data', 'allIndianStations.json');
    if (fs.existsSync(dataFilePath)) {
      const raw = fs.readFileSync(dataFilePath, 'utf8');
      const parsed: IndianRailwayStation[] = JSON.parse(raw);
      
      stationsList = parsed.map(s => ({
        code: s.code.toUpperCase().trim(),
        name: s.name.trim(),
        city: s.city ? s.city.trim() : s.name.trim(),
        state: s.state ? s.state.trim() : '',
        zone: s.zone ? s.zone.trim() : '',
        isMajor: MAJOR_STATION_CODES.has(s.code.toUpperCase().trim())
      }));

      // Populate lookup map
      stationCodeMap.clear();
      for (const stn of stationsList) {
        stationCodeMap.set(stn.code, stn);
      }

      console.log(`[StationService] Successfully loaded all ${stationsList.length} Indian Railway stations into in-memory index.`);
    } else {
      console.warn(`[StationService] Station dataset not found at ${dataFilePath}`);
    }
  } catch (err) {
    console.error('[StationService] Failed to load stations dataset:', err);
  }
}

// Auto-initialize on import
initializeStationDatabase();

/**
 * Get all stations
 */
export function getAllStations(): IndianRailwayStation[] {
  return stationsList;
}

/**
 * Get station by code (instant O(1))
 */
export function getStationByCode(code: string): IndianRailwayStation | undefined {
  if (!code) return undefined;
  return stationCodeMap.get(code.trim().toUpperCase());
}

/**
 * Get curated popular stations for quick UI chips
 */
export function getPopularStations(): IndianRailwayStation[] {
  const popularCodes = [
    'NDLS', 'CSMT', 'HWH', 'MAS', 'SBC', 'CDG', 'PNBE', 'GKP', 'LKO', 'CNB',
    'DDU', 'BSB', 'PRYJ', 'ADI', 'PUNE', 'HYB', 'SC', 'TVC', 'JP', 'BPL',
    'ASR', 'UMB', 'SVDK', 'JAT', 'AYC', 'AY', 'RKMP', 'SMVB', 'GHY', 'BBS'
  ];
  const list: IndianRailwayStation[] = [];
  for (const c of popularCodes) {
    const s = stationCodeMap.get(c);
    if (s) list.push(s);
  }
  return list;
}

/**
 * Search stations with intelligent relevance scoring
 * - Exact code match (e.g. GKP -> Gorakhpur) gets highest priority
 * - Prefix code matches
 * - Station name matches
 * - City / Town matches
 * - State matches
 */
export function searchStations(query: string, limit = 30): IndianRailwayStation[] {
  const q = (query || '').trim().toUpperCase();
  if (!q) {
    return getPopularStations().slice(0, limit);
  }

  const qLower = q.toLowerCase();

  interface ScoredStation {
    station: IndianRailwayStation;
    score: number;
  }

  const results: ScoredStation[] = [];

  for (const stn of stationsList) {
    const code = stn.code;
    const nameLower = stn.name.toLowerCase();
    const cityLower = stn.city.toLowerCase();
    const stateLower = stn.state.toLowerCase();
    let score = 0;

    // 1. Exact code match (highest precedence)
    if (code === q) {
      score += 2000;
    } else if (code.startsWith(q)) {
      score += 1000 - (code.length - q.length) * 50;
    } else if (code.includes(q)) {
      score += 600;
    }

    // 2. Name matches
    if (nameLower === qLower) {
      score += 1200;
    } else if (nameLower.startsWith(qLower)) {
      score += 800;
    } else if (nameLower.includes(' ' + qLower)) {
      score += 500;
    } else if (nameLower.includes(qLower)) {
      score += 300;
    }

    // 3. City matches
    if (cityLower === qLower) {
      score += 700;
    } else if (cityLower.startsWith(qLower)) {
      score += 400;
    } else if (cityLower.includes(qLower)) {
      score += 200;
    }

    // 4. State matches
    if (stateLower.startsWith(qLower)) {
      score += 100;
    }

    // 5. Popularity boost
    if (stn.isMajor) {
      score += 150;
    }

    if (score > 0) {
      results.push({ station: stn, score });
    }
  }

  // Sort descending by relevance score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit).map(r => r.station);
}
