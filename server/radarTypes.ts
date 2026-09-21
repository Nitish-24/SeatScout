export type RadarMode = 'TRAIN' | 'ROUTE';

export type RadarState = 'ACTIVE' | 'PAUSED' | 'SEAT_FOUND' | 'STOPPED' | 'EXPIRED';

export interface MonitoredTrainStatus {
  trainNumber: string;
  trainName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  classes: string[];
  lastStatus?: 'AVAILABLE' | 'CURR_AVBL' | 'NOT_AVAILABLE' | 'CHECKING' | 'DEPARTED';
  seatsCount?: number;
  statusText?: string;
  lastCheckedAt?: string;
  isStale?: boolean;
  bookingUrl?: string;
}

export interface AvailableTrainAlertItem {
  trainNumber: string;
  trainName: string;
  departureTime?: string;
  seatsCount: number;
  statusCode: string;
  statusText: string;
  bookingUrl?: string;
}

export interface RadarJob {
  id: string;
  clientId: string; // Device or browser unique ID
  mode: RadarMode; // 'TRAIN' or 'ROUTE'
  trainNumber?: string; // e.g. "12006" or undefined for ROUTE
  trainName?: string;
  fromCode: string;
  toCode: string;
  journeyDate: string; // YYYY-MM-DD
  travelClass: string; // e.g. "CC", "3A", "SL"
  quota: string; // "GN", "TQ", etc.
  departureTime?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  status: RadarState;
  lastCheckedAt?: string;
  nextCheckAt?: string;
  checkCount: number;
  failureCount: number;
  lastStatusText?: string;
  lastError?: string;
  
  // Trains monitored under this radar (1 for TRAIN, multiple for ROUTE)
  monitoredTrains: MonitoredTrainStatus[];

  // Information when seats are found
  foundSeatInfo?: {
    trainNumber: string;
    trainName: string;
    availableBerths: number;
    availabilityCode: string;
    detectedAt: string;
    bookingUrl: string;
    travelClass: string;
    quota: string;
    allAvailableTrains?: AvailableTrainAlertItem[];
  };

  // State deduplication tracker: prevents spamming notifications for unchanged availability
  lastNotifiedState?: {
    isAvailable: boolean;
    availableKeys: string[]; // e.g. ["12006_212", "12012_14"]
    notifiedAt: string;
  };
}

export interface PushSubscriptionItem {
  clientId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: string;
  lastUsedAt?: string;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data: {
    url: string;
    radarId?: string;
    trainNumber?: string;
    journeyDate?: string;
    travelClass?: string;
    quota?: string;
    fromCode?: string;
    toCode?: string;
    seatsCount?: number;
    mode?: RadarMode;
  };
}
