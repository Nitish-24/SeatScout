export type QuotaType = 'GN' | 'SS' | 'LD' | 'HP' | 'TQ';

export type SoundType = 'chime' | 'soft' | 'radar';

export type TrainClass = 'ANY' | '1A' | '2A' | '3A' | '3E' | 'CC' | 'EC' | 'EA' | 'SL' | '2S';

export interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
}

export interface TrainSchedule {
  number: string;
  name: string;
  fromCode: string;
  fromStnName?: string;
  toCode: string;
  toStnName?: string;
  isNearby?: boolean;
  departureTime: string; // e.g. "18:23"
  arrivalTime: string;   // e.g. "21:55"
  duration: string;      // e.g. "3h 32m"
  classes: TrainClass[];
  runsOn: string[];      // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  chartingTimeNote?: string; // e.g. "Chart usually prepared around 14:00"
  type: 'Shatabdi' | 'Vande Bharat' | 'Rajdhani' | 'Express' | 'Superfast' | 'Duronto' | 'Mail' | 'Tejas' | string;
  isRealIrctc?: boolean;
  liveAvailability?: Record<string, any>;
  liveAvailabilityTq?: Record<string, any>;
}

export interface Passenger {
  name?: string;
  gender: 'male' | 'female' | 'transgender';
  dob: string; // YYYY-MM-DD
}

export interface QuotaEligibility {
  isEligible: boolean;
  calculatedAge: number;
  quota: QuotaType;
  message: string;
  criteria: string;
  disclaimer: string;
}

export type WatchStatus = 'monitoring' | 'seat_found' | 'paused' | 'expired' | 'booked';

export type UrgencyTier = 'critical' | 'urgent' | 'active' | 'standard' | 'relaxed' | 'departed';
export type NetworkTier = 'optimal' | 'normal' | 'elevated' | 'busy' | 'degraded' | 'disconnected';

export interface AdaptivePollingMeta {
  effectiveIntervalSeconds: number;
  baseIntervalSeconds: number;
  proximityMultiplier: number;
  networkMultiplier: number;
  urgencyTier: UrgencyTier;
  urgencyLabel: string;
  networkTier: NetworkTier;
  networkLabel: string;
  statusReason: string;
  hoursUntilDeparture: number;
  isBackingOff?: boolean;
  consecutiveFailures?: number;
  lastResponseLatencyMs?: number;
}

export interface PingLogEntry {
  id: string;
  timestamp: string;
  statusText: string;
  availabilityCode: string; // e.g. 'REG_WL', 'CURR_AVBL 0004', 'CHARTING_PENDING'
  seatsAvailable?: number;
  trainNumber?: string;
  adaptiveIntervalSeconds?: number;
  latencyMs?: number;
  reason?: string;
}

export interface SeatScoutWatch {
  id: string;
  createdAt: string;
  updatedAt: string;
  fromStation: Station;
  toStation: Station;
  journeyDate: string; // YYYY-MM-DD
  trainNumber?: string; // specific train or "ALL"
  trainName?: string;
  departureTime?: string; // e.g. "18:23"
  estimatedChartingTime?: string; // ISO string of estimated charting timestamp
  travelClass: TrainClass;
  quota: QuotaType;
  passenger?: Passenger;
  passengerEligibility?: QuotaEligibility;
  status: WatchStatus;
  checkIntervalSeconds: number; // e.g. 15
  adaptivePolling?: AdaptivePollingMeta;
  lastCheckedAt?: string;
  nextCheckAt?: string;
  checkCount: number;
  foundSeatInfo?: {
    trainNumber: string;
    trainName: string;
    availableBerths: number;
    availabilityCode: string; // "CURR_AVBL 0004"
    detectedAt: string;
    bookingUrl: string;
    travelClass: TrainClass;
    quota: QuotaType;
    estimatedFare?: number;
  };
  pingLogs: PingLogEntry[];
  notifySound: boolean;
  notifyPush: boolean;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  soundType: 'chime' | 'horn' | 'radar' | 'urgent';
  volume: number; // 0 to 1
  browserNotifications: boolean;
  checkIntervalDefault: number; // 15
  autoOpenIrctc: boolean;
  emailNotifications?: boolean;
  emailAddress?: string;
  emailAlertFormat?: 'detailed' | 'summary';
}

export interface AlertHistoryItem {
  id: string;
  watchId: string;
  timestamp: string;
  trainNumber: string;
  trainName: string;
  fromCode: string;
  toCode: string;
  journeyDate: string;
  travelClass: TrainClass;
  quota: QuotaType;
  availableBerths: number;
  actionTaken: 'booked' | 'dismissed' | 'expired' | 'viewed';
}

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

export interface ServerRadarJob {
  id: string;
  clientId: string;
  mode: RadarMode;
  trainNumber?: string;
  trainName?: string;
  fromCode: string;
  toCode: string;
  journeyDate: string; // YYYY-MM-DD
  travelClass: string;
  quota: string;
  departureTime?: string;
  createdAt: string;
  updatedAt: string;
  status: RadarState;
  lastCheckedAt?: string;
  nextCheckAt?: string;
  checkCount: number;
  failureCount: number;
  lastStatusText?: string;
  lastError?: string;
  monitoredTrains: MonitoredTrainStatus[];
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
}

