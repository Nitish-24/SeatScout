import { TrainClass, QuotaType } from '../types';

export interface DayAvailability {
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Sat, 29 Aug"
  statusText: string; // e.g. "CURR_AVBL-0012", "AVAILABLE-0024", "RAC 8", "GNWL 14", "Train Departed"
  statusCode: 'CURR_AVBL' | 'AVAILABLE' | 'WL' | 'RAC' | 'REGRET' | 'DEPARTED';
  seatsCount?: number;
  fare: number;
  probability?: string; // e.g. "High Chance", "Guaranteed"
  confirmTktStatus?: string;
  isCustomOverride?: boolean;
  isLiveIrctc?: boolean;
  irctcDataSource?: string;
  cacheTime?: string;
}

const STORAGE_KEY_SEAT_OVERRIDES = 'seatscout_seat_overrides';

export function getSavedSeatOverride(
  trainNumber: string,
  dateStr: string,
  travelClass: string
): DayAvailability | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SEAT_OVERRIDES);
    if (!raw) return null;
    const map = JSON.parse(raw);
    const key = `${trainNumber}_${dateStr}_${travelClass}`;
    return map[key] || null;
  } catch {
    return null;
  }
}

export function saveSeatOverride(
  trainNumber: string,
  dateStr: string,
  travelClass: string,
  availability: Partial<DayAvailability>
) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SEAT_OVERRIDES);
    const map = raw ? JSON.parse(raw) : {};
    const key = `${trainNumber}_${dateStr}_${travelClass}`;
    map[key] = {
      ...(map[key] || {}),
      ...availability,
      isCustomOverride: true
    };
    localStorage.setItem(STORAGE_KEY_SEAT_OVERRIDES, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save seat override', e);
  }
}

export function clearSeatOverride(
  trainNumber: string,
  dateStr: string,
  travelClass: string
) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SEAT_OVERRIDES);
    if (!raw) return;
    const map = JSON.parse(raw);
    const key = `${trainNumber}_${dateStr}_${travelClass}`;
    delete map[key];
    localStorage.setItem(STORAGE_KEY_SEAT_OVERRIDES, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to clear seat override', e);
  }
}

// Generate realistic, class-calibrated IRCTC multi-day availability
export function getMultiDayAvailability(
  trainNumber: string,
  travelClass: TrainClass,
  quota: QuotaType = 'GN',
  startDateStr?: string
): DayAvailability[] {
  const baseDate = startDateStr ? new Date(startDateStr) : new Date();
  const results: DayAvailability[] = [];

  // Realistic fare mapping for Indian Railways
  const classFares: Record<string, number> = {
    '1A': 2145,
    '2A': 1365,
    '3A': 985,
    '3E': 890,
    'CC': 845,
    'EC': 1620,
    'EA': 1750,
    'SL': 385,
    '2S': 195,
    'ANY': 845
  };

  const baseFare = classFares[travelClass] || 820;

  for (let i = 0; i < 6; i++) {
    const current = new Date(baseDate);
    current.setDate(current.getDate() + i);

    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const dateIso = `${year}-${month}-${day}`;

    const dayName = current.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = current.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = String(current.getDate()).padStart(2, '0');
    const dayLabel = `${dayName}, ${dayNum} ${monthName}`;

    // Check user custom override first!
    const override = getSavedSeatOverride(trainNumber, dateIso, travelClass);
    if (override) {
      results.push({
        ...override,
        dateStr: dateIso,
        dayLabel,
        fare: override.fare || baseFare + (quota === 'TQ' ? 300 : 0)
      });
      continue;
    }

    // Deterministic hash based on train, date, class, and quota
    const hashStr = `${trainNumber}-${dateIso}-${travelClass}-${quota}`;
    let hash = 0;
    for (let charIdx = 0; charIdx < hashStr.length; charIdx++) {
      hash = (hash * 31 + hashStr.charCodeAt(charIdx)) & 0xffffffff;
    }
    const seed = Math.abs(hash);

    let statusCode: 'CURR_AVBL' | 'AVAILABLE' | 'WL' | 'RAC' | 'REGRET' = 'AVAILABLE';
    let statusText = 'AVAILABLE-0018';
    let seatsCount = 18;

    // Realistic capacity limits per coach type in Indian Railways
    let maxAvail = 42;
    if (travelClass === '1A') maxAvail = 6;
    else if (travelClass === 'EC' || travelClass === 'EA') maxAvail = 14;
    else if (travelClass === '2A') maxAvail = 22;
    else if (travelClass === '3A' || travelClass === '3E') maxAvail = 48;
    else if (travelClass === 'CC') maxAvail = 56;
    else if (travelClass === 'SL') maxAvail = 78;
    else if (travelClass === '2S') maxAvail = 65;

    if (quota === 'TQ') {
      // Tatkal Quota: strictly small berth counts (2 to 14 max) or TQWL
      if (seed % 3 === 0) {
        const wl = (seed % 9) + 1;
        statusText = `TQWL ${wl}`;
        statusCode = 'WL';
        seatsCount = 0;
      } else {
        seatsCount = (seed % 10) + 2;
        statusText = `AVAILABLE-${String(seatsCount).padStart(4, '0')}`;
        statusCode = 'AVAILABLE';
      }
    } else if (quota === 'SS') {
      // Senior Citizen: Lower berth quota (1 to 5 seats)
      seatsCount = (seed % 4) + 1;
      statusText = `AVAILABLE-${String(seatsCount).padStart(4, '0')}`;
      statusCode = 'AVAILABLE';
    } else if (quota === 'LD') {
      // Ladies Quota: 2 to 6 berths
      seatsCount = (seed % 5) + 2;
      statusText = `AVAILABLE-${String(seatsCount).padStart(4, '0')}`;
      statusCode = 'AVAILABLE';
    } else {
      // General Quota (GN)
      if (i === 0) {
        // Today (Current booking releases after 1st chart preparation)
        const mode = seed % 4;
        if (mode === 0 || mode === 1) {
          // Current booking active with realistic seat release
          seatsCount = (seed % 18) + 2;
          statusText = `CURR_AVBL-${String(seatsCount).padStart(4, '0')}`;
          statusCode = 'CURR_AVBL';
        } else if (mode === 2) {
          const rac = (seed % 12) + 2;
          statusText = `RAC ${rac}`;
          statusCode = 'RAC';
          seatsCount = rac;
        } else {
          const wl = (seed % 18) + 3;
          statusText = `GNWL ${wl}`;
          statusCode = 'WL';
          seatsCount = 0;
        }
      } else if (i === 1) {
        // Tomorrow
        const mode = seed % 4;
        if (mode === 0) {
          seatsCount = Math.max(3, (seed % maxAvail) + 4);
          statusText = `AVAILABLE-${String(seatsCount).padStart(4, '0')}`;
          statusCode = 'AVAILABLE';
        } else if (mode === 1) {
          const rac = (seed % 14) + 4;
          statusText = `RAC ${rac}`;
          statusCode = 'RAC';
          seatsCount = rac;
        } else {
          const wl = (seed % 22) + 4;
          statusText = `GNWL ${wl}`;
          statusCode = 'WL';
          seatsCount = 0;
        }
      } else if (i === 2) {
        // Day + 2
        const mode = seed % 3;
        if (mode === 0) {
          const wl = (seed % 15) + 2;
          statusText = `GNWL ${wl}`;
          statusCode = 'WL';
          seatsCount = 0;
        } else {
          seatsCount = Math.max(4, (seed % maxAvail) + 8);
          statusText = `AVAILABLE-${String(seatsCount).padStart(4, '0')}`;
          statusCode = 'AVAILABLE';
        }
      } else {
        // Days 3, 4, 5: Normal booking horizon
        seatsCount = Math.max(6, (seed % maxAvail) + 12);
        statusText = `AVAILABLE-${String(seatsCount).padStart(4, '0')}`;
        statusCode = 'AVAILABLE';
      }
    }

    results.push({
      dateStr: dateIso,
      dayLabel,
      statusText,
      statusCode,
      seatsCount,
      fare: baseFare + (quota === 'TQ' ? 300 : 0)
    });
  }

  return results;
}
