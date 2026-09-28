import { TrainSchedule } from '../types';

export type TimeSlotId = 'early_morning' | 'morning' | 'afternoon' | 'night';

export type TimeSlotTarget = 'departure' | 'arrival';

export type SortOptionId =
  | 'departure_asc'
  | 'departure_desc'
  | 'arrival_asc'
  | 'arrival_desc'
  | 'duration_asc'
  | 'train_number_asc';

export interface TimeSlotConfig {
  id: TimeSlotId;
  label: string;
  timeRange: string;
  startHour: number;
  endHour: number;
  description: string;
}

export const TIME_SLOTS: TimeSlotConfig[] = [
  {
    id: 'early_morning',
    label: 'Early Morning',
    timeRange: '12:00 AM – 06:00 AM',
    startHour: 0,
    endHour: 6,
    description: '00:00 to 06:00'
  },
  {
    id: 'morning',
    label: 'Morning',
    timeRange: '06:00 AM – 12:00 PM',
    startHour: 6,
    endHour: 12,
    description: '06:00 to 12:00'
  },
  {
    id: 'afternoon',
    label: 'Mid-Day / Afternoon',
    timeRange: '12:00 PM – 06:00 PM',
    startHour: 12,
    endHour: 18,
    description: '12:00 to 18:00'
  },
  {
    id: 'night',
    label: 'Night / Evening',
    timeRange: '06:00 PM – 12:00 AM',
    startHour: 18,
    endHour: 24,
    description: '18:00 to 24:00'
  }
];

export const SORT_OPTIONS: { id: SortOptionId; label: string; shortLabel: string }[] = [
  { id: 'departure_asc', label: 'Departure: Earliest First (00:00 → 23:59)', shortLabel: 'Dep: Earliest' },
  { id: 'departure_desc', label: 'Departure: Latest First (23:59 → 00:00)', shortLabel: 'Dep: Latest' },
  { id: 'arrival_asc', label: 'Arrival: Earliest First', shortLabel: 'Arr: Earliest' },
  { id: 'arrival_desc', label: 'Arrival: Latest First', shortLabel: 'Arr: Latest' },
  { id: 'duration_asc', label: 'Duration: Fastest / Shortest Travel Time', shortLabel: 'Fastest' },
  { id: 'train_number_asc', label: 'Train Number (Ascending)', shortLabel: 'Train #' }
];

/**
 * Parses time string like "06:53" or "6:53" into minutes from midnight (0 - 1439).
 */
export function timeToMinutes(timeStr?: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Parses duration string like "3h 27m" into total minutes.
 */
export function parseDurationToMinutes(durationStr?: string): number {
  if (!durationStr) return 9999;
  let total = 0;
  const hoursMatch = durationStr.match(/(\d+)\s*h/i);
  const minsMatch = durationStr.match(/(\d+)\s*m/i);
  if (hoursMatch) total += parseInt(hoursMatch[1], 10) * 60;
  if (minsMatch) total += parseInt(minsMatch[1], 10);
  return total > 0 ? total : 9999;
}

/**
 * Classifies a time string into one of the 4 time categories.
 */
export function getTimeSlotForTime(timeStr?: string): TimeSlotId {
  const mins = timeToMinutes(timeStr);
  const hour = Math.floor(mins / 60);

  if (hour >= 0 && hour < 6) return 'early_morning';
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'night';
}

/**
 * Calculates how many trains fall into each of the 4 time categories.
 */
export function calculateSlotCounts(
  trains: TrainSchedule[],
  target: TimeSlotTarget = 'departure'
): Record<TimeSlotId, number> {
  const counts: Record<TimeSlotId, number> = {
    early_morning: 0,
    morning: 0,
    afternoon: 0,
    night: 0
  };

  trains.forEach((train) => {
    const time = target === 'departure' ? train.departureTime : train.arrivalTime;
    const slot = getTimeSlotForTime(time);
    counts[slot]++;
  });

  return counts;
}

export interface FilterAndSortParams {
  selectedSlots: TimeSlotId[]; // empty means all
  slotTarget: TimeSlotTarget;
  sortBy: SortOptionId;
  searchQuery?: string;
}

/**
 * Filters and sorts train list based on selected time categories and sort criteria.
 */
export function filterAndSortTrains(
  trains: TrainSchedule[],
  params: FilterAndSortParams
): TrainSchedule[] {
  let filtered = [...trains];

  // 1. Text filter (Train number or name)
  if (params.searchQuery && params.searchQuery.trim()) {
    const q = params.searchQuery.trim().toLowerCase();
    filtered = filtered.filter(
      (t) => t.number.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
    );
  }

  // 2. Time slot filter
  if (params.selectedSlots.length > 0) {
    filtered = filtered.filter((train) => {
      const time = params.slotTarget === 'departure' ? train.departureTime : train.arrivalTime;
      const slot = getTimeSlotForTime(time);
      return params.selectedSlots.includes(slot);
    });
  }

  // 3. Sorting
  filtered.sort((a, b) => {
    switch (params.sortBy) {
      case 'departure_asc':
        return timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime);
      case 'departure_desc':
        return timeToMinutes(b.departureTime) - timeToMinutes(a.departureTime);
      case 'arrival_asc':
        return timeToMinutes(a.arrivalTime) - timeToMinutes(b.arrivalTime);
      case 'arrival_desc':
        return timeToMinutes(b.arrivalTime) - timeToMinutes(a.arrivalTime);
      case 'duration_asc':
        return parseDurationToMinutes(a.duration) - parseDurationToMinutes(b.duration);
      case 'train_number_asc':
        return a.number.localeCompare(b.number);
      default:
        return timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime);
    }
  });

  return filtered;
}
