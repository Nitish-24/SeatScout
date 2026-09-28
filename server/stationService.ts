import fs from 'fs';
import path from 'path';

export interface IndianRailwayStation {
  code: string;
  name: string;
  city: string;
  state: string;
  zone?: string;
  isMajor?: boolean;
  source?: 'ixigo' | 'indian-railways';
  lat?: string;
  lon?: string;
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
 * Initialize national station dataset from server data directory
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
        isMajor: MAJOR_STATION_CODES.has(s.code.toUpperCase().trim()),
        source: 'indian-railways'
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
 * Dynamically queries Ixigo API for real-time station suggestions across India.
 * Endpoint: https://www.ixigo.com/action/content/trainstation?searchFor=trainstationsLatLon&anchor=false&value={query}
 */
export async function fetchIxigoStations(query: string): Promise<IndianRailwayStation[]> {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) return [];

  const url = `https://www.ixigo.com/action/content/trainstation?searchFor=trainstationsLatLon&anchor=false&value=${encodeURIComponent(cleanQuery)}`;
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.ixigo.com/trains',
        'Origin': 'https://www.ixigo.com'
      }
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[StationService] Ixigo station API returned status ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    const ixigoStations: IndianRailwayStation[] = [];
    const seenCodes = new Set<string>();

    for (const item of data) {
      if (!item || !item.e || typeof item.e !== 'string') continue;

      // Matches code inside parentheses: e.g. "Delhi - All stations(NDLS)" or "New Delhi (NDLS)" or "Kanpur Central (CNB)"
      const match = item.e.match(/\(([A-Z0-9]+)\)$/);
      if (!match) continue;

      const code = match[1].toUpperCase().trim();
      if (!code || code.length > 6) continue;

      // Extract clean station name
      let cleanName = item.e
        .replace(/\s*\([A-Z0-9]+\)$/, '')
        .replace(/\s*-\s*All stations/i, '')
        .trim();

      if (!cleanName) cleanName = code;

      // Existing cached station metadata fallback for state & zone
      const existing = stationCodeMap.get(code);

      const stationObj: IndianRailwayStation = {
        code,
        name: cleanName,
        city: item.c ? item.c.trim() : (existing?.city || cleanName.split(' ')[0]),
        state: existing?.state || '',
        zone: existing?.zone || '',
        lat: item.lat || undefined,
        lon: item.lon || undefined,
        isMajor: MAJOR_STATION_CODES.has(code),
        source: 'ixigo'
      };

      // Add to dynamic cache
      if (!stationCodeMap.has(code) || !stationCodeMap.get(code)?.name) {
        stationCodeMap.set(code, stationObj);
        stationsList.push(stationObj);
      } else if (existing) {
        // Enrich existing entry with coordinates
        if (item.lat && !existing.lat) existing.lat = item.lat;
        if (item.lon && !existing.lon) existing.lon = item.lon;
      }

      if (!seenCodes.has(code)) {
        seenCodes.add(code);
        ixigoStations.push(stationObj);
      }
    }

    return ixigoStations;
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      console.warn(`[StationService] Ixigo station API query failed for "${cleanQuery}":`, err.message || err);
    }
    return [];
  }
}

/**
 * Get all stations
 */
export function getAllStations(): IndianRailwayStation[] {
  return stationsList;
}

/**
 * Get station by code (instant O(1) with dynamic Ixigo fallback)
 */
export async function getStationByCode(code: string): Promise<IndianRailwayStation | undefined> {
  if (!code) return undefined;
  const cleanCode = code.trim().toUpperCase();

  const cached = stationCodeMap.get(cleanCode);
  if (cached) return cached;

  // Query Ixigo API dynamically to resolve station code
  try {
    const dynamicResults = await fetchIxigoStations(cleanCode);
    const found = dynamicResults.find(s => s.code === cleanCode);
    if (found) return found;
  } catch (e) {
    // Ignore and return undefined
  }

  return undefined;
}

/**
 * Synchronous get station by code from memory cache
 */
export function getStationByCodeSync(code: string): IndianRailwayStation | undefined {
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
 * Search stations with live dynamic Ixigo integration + intelligent local relevance scoring.
 * - Queries Ixigo API in real-time
 * - Searches comprehensive Indian Railway index (8,900+ stations)
 * - Merges and deduplicates results with exact matches prioritized
 */
export async function searchStations(query: string, limit = 30): Promise<IndianRailwayStation[]> {
  const q = (query || '').trim();
  if (!q) {
    return getPopularStations().slice(0, limit);
  }

  const qUpper = q.toUpperCase();
  const qLower = q.toLowerCase();

  // Run Ixigo live API search concurrently
  const ixigoPromise = fetchIxigoStations(q).catch(() => [] as IndianRailwayStation[]);

  // Search local in-memory dataset
  interface ScoredStation {
    station: IndianRailwayStation;
    score: number;
  }

  const localResults: ScoredStation[] = [];

  for (const stn of stationsList) {
    const code = stn.code;
    const nameLower = stn.name.toLowerCase();
    const cityLower = stn.city.toLowerCase();
    const stateLower = stn.state.toLowerCase();
    let score = 0;

    // 1. Exact code match (highest precedence)
    if (code === qUpper) {
      score += 2500;
    } else if (code.startsWith(qUpper)) {
      score += 1200 - (code.length - qUpper.length) * 50;
    } else if (code.includes(qUpper)) {
      score += 700;
    }

    // 2. Name matches
    if (nameLower === qLower) {
      score += 1500;
    } else if (nameLower.startsWith(qLower)) {
      score += 900;
    } else if (nameLower.includes(' ' + qLower)) {
      score += 550;
    } else if (nameLower.includes(qLower)) {
      score += 350;
    }

    // 3. City matches
    if (cityLower === qLower) {
      score += 800;
    } else if (cityLower.startsWith(qLower)) {
      score += 450;
    } else if (cityLower.includes(qLower)) {
      score += 250;
    }

    // 4. State matches
    if (stateLower.startsWith(qLower)) {
      score += 150;
    }

    // 5. Popularity boost
    if (stn.isMajor) {
      score += 200;
    }

    if (score > 0) {
      localResults.push({ station: stn, score });
    }
  }

  localResults.sort((a, b) => b.score - a.score);

  // Await Ixigo results
  const ixigoResults = await ixigoPromise;

  // Merge Ixigo live results with local results, avoiding duplicates
  const finalStations: IndianRailwayStation[] = [];
  const seenCodes = new Set<string>();

  // If Ixigo returned live results, prioritize them
  for (const stn of ixigoResults) {
    if (!seenCodes.has(stn.code)) {
      seenCodes.add(stn.code);
      finalStations.push(stn);
    }
  }

  // Add scored local stations
  for (const { station } of localResults) {
    if (!seenCodes.has(station.code)) {
      seenCodes.add(station.code);
      finalStations.push(station);
      if (finalStations.length >= limit) break;
    }
  }

  return finalStations.slice(0, limit);
}
