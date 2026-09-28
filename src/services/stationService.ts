import { Station } from '../types';
import { POPULAR_STATIONS, registerStationLookup } from '../data/trainData';

// Cache all stations in memory once loaded on the client
let allStationsCache: Station[] | null = null;
const stationMap = new Map<string, Station>();
let isLoadingPromise: Promise<Station[]> | null = null;

// Populate initial station map with popular stations
for (const stn of POPULAR_STATIONS) {
  stationMap.set(stn.code.toUpperCase(), stn);
}

// Hook up station lookup with trainData
registerStationLookup((code: string) => stationMap.get(code.trim().toUpperCase()));

/**
 * Lazy loads the complete 9,000+ Indian Railway stations dataset in the browser background
 */
export async function loadAllStations(): Promise<Station[]> {
  if (allStationsCache) {
    return allStationsCache;
  }

  if (isLoadingPromise) {
    return isLoadingPromise;
  }

  isLoadingPromise = (async () => {
    try {
      const res = await fetch('/data/stations.json');
      if (res.ok) {
        const data: Station[] = await res.json();
        allStationsCache = data;
        for (const stn of data) {
          stationMap.set(stn.code.toUpperCase(), stn);
        }
        return data;
      }
    } catch (e) {
      console.warn('[StationService] Could not preload stations.json, will rely on API search:', e);
    }
    return POPULAR_STATIONS;
  })();

  return isLoadingPromise;
}

// Trigger background preload after initial render idle
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      loadAllStations();
    });
  } else {
    setTimeout(() => {
      loadAllStations();
    }, 1500);
  }
}

/**
 * Search stations across all 9,000+ Indian Railway Stations:
 * 1. Checks backend API (/api/stations/search?q=...)
 * 2. If offline or instantaneous response needed, searches in-memory / loaded stations
 */
export async function searchStations(query: string, limit = 30): Promise<Station[]> {
  const q = query.trim();

  // Try API first
  try {
    const res = await fetch(`/api/stations/search?q=${encodeURIComponent(q)}&limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Cache returned stations into lookup map
        for (const s of data) {
          stationMap.set(s.code.toUpperCase(), s);
        }
        return data;
      }
    }
  } catch (err) {
    // Backend API offline or fetch error, proceed to client-side fallback
    console.warn('[StationService] API search failed, falling back to local dataset:', err);
  }

  // Fallback to local memory / cache
  const list = allStationsCache || POPULAR_STATIONS;
  if (!q) {
    return POPULAR_STATIONS.slice(0, limit);
  }

  const qUpper = q.toUpperCase();
  const qLower = q.toLowerCase();

  const results: { station: Station; score: number }[] = [];

  for (const stn of list) {
    const code = stn.code.toUpperCase();
    const nameLower = stn.name.toLowerCase();
    const cityLower = (stn.city || '').toLowerCase();
    let score = 0;

    if (code === qUpper) {
      score += 2000;
    } else if (code.startsWith(qUpper)) {
      score += 1000;
    } else if (code.includes(qUpper)) {
      score += 500;
    }

    if (nameLower === qLower) {
      score += 1200;
    } else if (nameLower.startsWith(qLower)) {
      score += 800;
    } else if (nameLower.includes(' ' + qLower)) {
      score += 400;
    } else if (nameLower.includes(qLower)) {
      score += 250;
    }

    if (cityLower === qLower) {
      score += 600;
    } else if (cityLower.startsWith(qLower)) {
      score += 350;
    } else if (cityLower.includes(qLower)) {
      score += 200;
    }

    if (score > 0) {
      results.push({ station: stn, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map((r) => r.station);
}

/**
 * Get station by code (synchronously if already cached, or asynchronously via API)
 */
export async function getStationByCode(code: string): Promise<Station | undefined> {
  if (!code) return undefined;
  const clean = code.trim().toUpperCase();

  // Fast in-memory map check
  if (stationMap.has(clean)) {
    return stationMap.get(clean);
  }

  // Try API
  try {
    const res = await fetch(`/api/stations/${encodeURIComponent(clean)}`);
    if (res.ok) {
      const stn: Station = await res.json();
      stationMap.set(clean, stn);
      return stn;
    }
  } catch (e) {
    // Ignore and proceed
  }

  // Ensure dataset is loaded
  await loadAllStations();
  return stationMap.get(clean);
}

/**
 * Synchronous instant station lookup from memory
 */
export function getCachedStation(code: string): Station | undefined {
  if (!code) return undefined;
  return stationMap.get(code.trim().toUpperCase());
}

/**
 * Return curated popular stations
 */
export function getPopularStationsList(): Station[] {
  return POPULAR_STATIONS;
}
