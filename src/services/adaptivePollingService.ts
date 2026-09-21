import { SeatScoutWatch, AdaptivePollingMeta, UrgencyTier, NetworkTier } from '../types';
import { NetworkHealthStatus } from './railwayApi';

interface NetworkMetrics {
  lastLatencyMs: number;
  consecutiveFailures: number;
  lastSuccessTimestamp: number;
  isServiceBusy: boolean;
  status: 'connected' | 'retrying' | 'disconnected';
}

// In-memory telemetry for adaptive polling engine
const currentMetrics: NetworkMetrics = {
  lastLatencyMs: 32,
  consecutiveFailures: 0,
  lastSuccessTimestamp: Date.now(),
  isServiceBusy: false,
  status: 'connected'
};

/**
 * Record an API response to dynamically adjust service health factors
 */
export function recordNetworkObservation(
  latencyMs: number,
  success: boolean,
  httpStatus?: number
) {
  currentMetrics.lastLatencyMs = Math.max(5, Math.round(latencyMs));
  if (success) {
    currentMetrics.consecutiveFailures = 0;
    currentMetrics.lastSuccessTimestamp = Date.now();
    currentMetrics.isServiceBusy = latencyMs > 280;
    currentMetrics.status = 'connected';
  } else {
    currentMetrics.consecutiveFailures += 1;
    // If HTTP 429 (rate limited) or 503 (service unavailable) or consecutive errors
    currentMetrics.isServiceBusy = true;
    if (httpStatus === 503 || httpStatus === 429 || currentMetrics.consecutiveFailures >= 2) {
      currentMetrics.status = 'retrying';
    } else if (httpStatus === 502 || httpStatus === 504 || currentMetrics.consecutiveFailures >= 4) {
      currentMetrics.status = 'disconnected';
    }
  }
}

/**
 * Update gateway health state from periodic health pings
 */
export function updateGatewayHealth(health: NetworkHealthStatus) {
  currentMetrics.status = health.status;
  if (health.latencyMs > 0) {
    currentMetrics.lastLatencyMs = health.latencyMs;
  }
  if (health.status === 'retrying' || health.latencyMs > 250) {
    currentMetrics.isServiceBusy = true;
  } else if (health.status === 'connected' && health.latencyMs <= 150) {
    currentMetrics.isServiceBusy = false;
  }
}

export function getCurrentNetworkMetrics(): Readonly<NetworkMetrics> {
  return { ...currentMetrics };
}

/**
 * Calculates hours remaining between now and train departure
 */
export function getHoursUntilDeparture(journeyDateStr: string, departureTimeStr?: string): number {
  try {
    const time = departureTimeStr && /^\d{1,2}:\d{2}$/.test(departureTimeStr)
      ? departureTimeStr
      : '12:00';
    const [hours, minutes] = time.split(':').map((v) => parseInt(v, 10));
    
    // Parse journeyDate: YYYY-MM-DD
    const dateParts = journeyDateStr.split('-');
    if (dateParts.length !== 3) return 48; // fallback 2 days

    const departureDate = new Date(
      parseInt(dateParts[0], 10),
      parseInt(dateParts[1], 10) - 1,
      parseInt(dateParts[2], 10),
      hours,
      minutes,
      0
    );

    const now = Date.now();
    const diffMs = departureDate.getTime() - now;
    return diffMs / (1000 * 60 * 60);
  } catch (err) {
    console.warn('Error computing departure time diff', err);
    return 48;
  }
}

/**
 * Core Adaptive Polling Calculator:
 * Dynamically scales frequency according to:
 * 1. Journey date & departure proximity (increasing frequency as journey nears)
 * 2. Network & IRCTC service health / busy load (decreasing frequency when service is under pressure)
 */
export function calculateAdaptivePolling(
  watch: SeatScoutWatch,
  overrideHealth?: NetworkHealthStatus
): AdaptivePollingMeta {
  const baseInterval = watch.checkIntervalSeconds || 15;
  const hoursUntil = getHoursUntilDeparture(watch.journeyDate, watch.departureTime);

  // 1. Calculate Journey Proximity Multiplier (Shorter interval = faster polling as journey draws near)
  let proximityMultiplier = 1.0;
  let urgencyTier: UrgencyTier = 'active';
  let urgencyLabel = 'Active (<48h)';

  if (hoursUntil < 0) {
    // Train has already departed
    urgencyTier = 'departed';
    urgencyLabel = 'Train Departed';
    proximityMultiplier = 3.0; // relaxed backoff
  } else if (hoursUntil <= 4) {
    // Critical official IRCTC Charting window & Current Booking release (CURR_AVBL berths released!)
    urgencyTier = 'critical';
    urgencyLabel = 'Critical Charting Window (<4h)';
    proximityMultiplier = 0.35; // e.g. 15s * 0.35 ≈ 5s polling for ultra-high accuracy
  } else if (hoursUntil <= 12) {
    // Same-day travel window approaching first chart
    urgencyTier = 'urgent';
    urgencyLabel = 'Same-Day Travel (<12h)';
    proximityMultiplier = 0.55; // e.g. 15s * 0.55 ≈ 8s polling
  } else if (hoursUntil <= 24) {
    // Within 24 hours of travel
    urgencyTier = 'urgent';
    urgencyLabel = 'Approaching Travel (<24h)';
    proximityMultiplier = 0.75; // e.g. 15s * 0.75 ≈ 11s polling
  } else if (hoursUntil <= 48) {
    // 1-2 days before departure
    urgencyTier = 'active';
    urgencyLabel = 'Active (1-2 days away)';
    proximityMultiplier = 1.0; // standard 15s polling
  } else if (hoursUntil <= 168) {
    // 3 to 7 days before departure
    const days = Math.ceil(hoursUntil / 24);
    urgencyTier = 'standard';
    urgencyLabel = `${days} days to journey`;
    proximityMultiplier = 1.6; // e.g. 15s * 1.6 ≈ 24s polling
  } else {
    // Far advance (> 7 days)
    const days = Math.ceil(hoursUntil / 24);
    urgencyTier = 'relaxed';
    urgencyLabel = `Advance Booking (${days}d away)`;
    proximityMultiplier = 2.4; // e.g. 15s * 2.4 ≈ 36s polling
  }

  // 2. Calculate Network & Service Health Multiplier (Longer interval = slower polling when service is busy)
  const healthStatus = overrideHealth?.status || currentMetrics.status;
  const latency = overrideHealth?.latencyMs !== undefined ? overrideHealth.latencyMs : currentMetrics.lastLatencyMs;
  const consecutiveFailures = currentMetrics.consecutiveFailures;

  let networkMultiplier = 1.0;
  let networkTier: NetworkTier = 'optimal';
  let networkLabel = `Fast (${latency}ms)`;
  let isBackingOff = false;

  if (healthStatus === 'disconnected') {
    networkTier = 'disconnected';
    networkLabel = 'Gateway Offline';
    networkMultiplier = 3.5;
    isBackingOff = true;
  } else if (healthStatus === 'retrying' || consecutiveFailures >= 2) {
    networkTier = 'degraded';
    networkLabel = 'Service Busy (Retrying)';
    networkMultiplier = 2.5; // slow down to avoid swamping gateway
    isBackingOff = true;
  } else if (latency >= 300 || consecutiveFailures === 1 || currentMetrics.isServiceBusy) {
    networkTier = 'busy';
    networkLabel = `High Latency (${latency}ms)`;
    networkMultiplier = 1.8; // halve the request frequency
    isBackingOff = true;
  } else if (latency >= 120) {
    networkTier = 'elevated';
    networkLabel = `Moderate Load (${latency}ms)`;
    networkMultiplier = 1.3;
    isBackingOff = true;
  } else {
    networkTier = 'optimal';
    networkLabel = `Optimal (${latency}ms)`;
    networkMultiplier = 1.0;
    isBackingOff = false;
  }

  // 3. Compute Final Effective Interval (clamped to safe thresholds 5s - 120s)
  const rawInterval = baseInterval * proximityMultiplier * networkMultiplier;
  const effectiveIntervalSeconds = Math.max(5, Math.min(120, Math.round(rawInterval)));

  // 4. Formulate contextual reason explanation
  let statusReason = '';
  if (isBackingOff) {
    statusReason = `Service under elevated load (${networkLabel}). Frequency throttled to ${effectiveIntervalSeconds}s to protect gateway.`;
  } else if (urgencyTier === 'critical') {
    statusReason = `Critical Charting & Current Booking window active. Polling accelerated to ${effectiveIntervalSeconds}s for sub-minute accuracy.`;
  } else if (urgencyTier === 'urgent') {
    statusReason = `Journey approaches in ${Math.max(1, Math.round(hoursUntil))}h. Polling accelerated to ${effectiveIntervalSeconds}s.`;
  } else if (urgencyTier === 'relaxed') {
    statusReason = `Advance booking date (${Math.ceil(hoursUntil / 24)}d away). Polling relaxed to ${effectiveIntervalSeconds}s to conserve network.`;
  } else {
    statusReason = `Balanced polling active (${effectiveIntervalSeconds}s interval, ${networkLabel}).`;
  }

  return {
    effectiveIntervalSeconds,
    baseIntervalSeconds: baseInterval,
    proximityMultiplier: Number(proximityMultiplier.toFixed(2)),
    networkMultiplier: Number(networkMultiplier.toFixed(2)),
    urgencyTier,
    urgencyLabel,
    networkTier,
    networkLabel,
    statusReason,
    hoursUntilDeparture: Number(hoursUntil.toFixed(1)),
    isBackingOff,
    consecutiveFailures,
    lastResponseLatencyMs: latency
  };
}
