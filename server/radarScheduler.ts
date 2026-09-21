import { RADAR_CONFIG } from './radarConfig.js';
import { RadarStore } from './radarStore.js';
import { PushService } from './pushService.js';
import { 
  RadarJob, 
  MonitoredTrainStatus, 
  AvailableTrainAlertItem, 
  PushPayload 
} from './radarTypes.js';
import { 
  fetchRealIrctcAvailabilityForTrain, 
  fetchRealIrctcTrains 
} from './realIrctcService.js';

interface ParsedSeatResult {
  isAvailable: boolean;
  isCurrAvbl: boolean;
  statusCode: string;
  statusText: string;
  seatsCount: number;
  probability?: string;
  isDeparted?: boolean;
}

export class RadarScheduler {
  private static isRunning = false;
  private static timer: NodeJS.Timeout | null = null;
  
  // Shared upstream cache across all radars to prevent duplicate polling
  private static sharedCache = new Map<string, { timestamp: number; result: ParsedSeatResult; raw: any }>();
  // In-flight request deduplication map
  private static inFlightQueries = new Map<string, Promise<{ result: ParsedSeatResult; raw: any } | null>>();

  /**
   * Start the background scheduler
   */
  public static start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[RadarScheduler] Started 24/7 background seat monitoring worker');

    // Run first tick after 1s, then repeat at WORKER_TICK_MS
    setTimeout(() => this.tick(), 1000);
    this.timer = setInterval(() => this.tick(), RADAR_CONFIG.WORKER_TICK_MS);
  }

  public static stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[RadarScheduler] Stopped background worker');
  }

  /**
   * Main scheduler tick
   */
  private static async tick(): Promise<void> {
    const now = Date.now();
    const activeRadars = RadarStore.getActiveRadars();

    if (activeRadars.length === 0) return;

    for (const radar of activeRadars) {
      // 1. Check journey expiry
      if (this.isRadarExpired(radar)) {
        console.log(`[RadarScheduler] Radar ${radar.id} expired (journey date ${radar.journeyDate} passed)`);
        RadarStore.updateRadar(radar.id, {
          status: 'EXPIRED',
          lastStatusText: 'Journey date has passed. Radar auto-expired.'
        });
        continue;
      }

      // 2. Check if due for next check
      const nextCheckTime = radar.nextCheckAt ? new Date(radar.nextCheckAt).getTime() : 0;
      if (now >= nextCheckTime) {
        // Execute check without blocking the loop
        this.processRadar(radar).catch((err) => {
          console.error(`[RadarScheduler] Error processing radar ${radar.id}:`, err);
        });
      }
    }
  }

  /**
   * Check if a radar has expired based on journey date and grace hours
   */
  public static isRadarExpired(radar: RadarJob): boolean {
    if (!radar.journeyDate) return false;
    const parts = radar.journeyDate.split('-').map(Number);
    if (parts.length !== 3) return false;

    // End of journey date + grace hours in IST
    const journeyExpiry = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
    journeyExpiry.setHours(journeyExpiry.getHours() + RADAR_CONFIG.EXPIRY_GRACE_HOURS);
    return Date.now() > journeyExpiry.getTime();
  }

  /**
   * Calculate adaptive polling interval based on journey proximity and failure backoff
   */
  public static calculateNextIntervalMs(radar: RadarJob, isFailure = false): number {
    if (isFailure && radar.failureCount > 0) {
      const exponent = Math.min(radar.failureCount, RADAR_CONFIG.MAX_CONSECUTIVE_FAILURES);
      const backoff = RADAR_CONFIG.BASE_BACKOFF_MS * Math.pow(RADAR_CONFIG.BACKOFF_MULTIPLIER, exponent - 1);
      return Math.min(backoff, RADAR_CONFIG.MAX_BACKOFF_MS);
    }

    if (!radar.journeyDate) return RADAR_CONFIG.POLL_INTERVALS.NORMAL_MS;

    const parts = radar.journeyDate.split('-').map(Number);
    const jDate = new Date(parts[0], parts[1] - 1, parts[2]);
    const now = new Date();
    const diffHours = (jDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours <= 6) {
      return RADAR_CONFIG.POLL_INTERVALS.CRITICAL_MS;
    } else if (diffHours <= 24) {
      return RADAR_CONFIG.POLL_INTERVALS.URGENT_MS;
    } else if (diffHours <= 72) {
      return RADAR_CONFIG.POLL_INTERVALS.NORMAL_MS;
    } else {
      return RADAR_CONFIG.POLL_INTERVALS.RELAXED_MS;
    }
  }

  /**
   * Core execution for a single Radar job
   */
  public static async processRadar(radar: RadarJob): Promise<void> {
    const updatedRadar = RadarStore.getRadarById(radar.id);
    if (!updatedRadar || updatedRadar.status !== 'ACTIVE') return;

    if (radar.mode === 'TRAIN') {
      await this.processTrainRadar(updatedRadar);
    } else {
      await this.processRouteRadar(updatedRadar);
    }
  }

  /**
   * Process a Single Train Radar
   */
  private static async processTrainRadar(radar: RadarJob): Promise<void> {
    const trainNo = radar.trainNumber || '12006';
    const queryResult = await this.queryTrainAvailabilityWithDeduplication(
      trainNo,
      radar.fromCode,
      radar.toCode,
      radar.travelClass,
      radar.quota,
      radar.journeyDate
    );

    const nowIso = new Date().toISOString();

    if (!queryResult) {
      // Temporary upstream failure
      const failureCount = radar.failureCount + 1;
      const intervalMs = this.calculateNextIntervalMs({ ...radar, failureCount }, true);
      const nextCheckIso = new Date(Date.now() + intervalMs).toISOString();

      RadarStore.updateRadar(radar.id, {
        failureCount,
        lastError: 'Upstream PRS connection timed out or unavailable',
        lastCheckedAt: nowIso,
        nextCheckAt: nextCheckIso,
        checkCount: radar.checkCount + 1,
        lastStatusText: `Gateway retry #${failureCount} scheduled in ${Math.round(intervalMs / 1000)}s`
      });
      return;
    }

    const { result } = queryResult;
    const isNowAvailable = result.isAvailable;
    const wasAvailable = radar.lastNotifiedState?.isAvailable || false;
    const currentKey = `${trainNo}_${result.seatsCount}_${result.statusCode}`;
    const previousKeys = radar.lastNotifiedState?.availableKeys || [];

    // Update monitored train status list
    const updatedMonitored: MonitoredTrainStatus[] = [
      {
        trainNumber: trainNo,
        trainName: radar.trainName || `Train ${trainNo}`,
        departureTime: radar.departureTime || '18:00',
        arrivalTime: '--:--',
        duration: '--',
        classes: [radar.travelClass],
        lastStatus: result.isCurrAvbl ? 'CURR_AVBL' : (result.isAvailable ? 'AVAILABLE' : (result.isDeparted ? 'DEPARTED' : 'NOT_AVAILABLE')),
        seatsCount: result.seatsCount,
        statusText: result.statusText,
        lastCheckedAt: nowIso,
        bookingUrl: 'https://www.irctc.co.in/nget/train-search'
      }
    ];

    const nextIntervalMs = this.calculateNextIntervalMs({ ...radar, failureCount: 0 });
    const nextCheckIso = new Date(Date.now() + nextIntervalMs).toISOString();

    // Check if we should notify:
    // Rule:
    // - If it wasn't available and is now available -> NOTIFY!
    // - If it was already available but has a new event (e.g. key changed or seats changed significantly) -> check deduplication
    // - If availability went 0 -> 212 -> 212 -> 211, do NOT repeatedly spam for the same event
    const isNewAvailabilityEvent = isNowAvailable && (!wasAvailable || !previousKeys.includes(currentKey));

    if (isNewAvailabilityEvent) {
      console.log(`[RadarScheduler] SEAT AVAILABLE for Train Radar ${radar.id}: ${trainNo} ${result.statusText}`);

      const foundInfo = {
        trainNumber: trainNo,
        trainName: radar.trainName || `Train ${trainNo}`,
        availableBerths: result.seatsCount,
        availabilityCode: result.statusText,
        detectedAt: nowIso,
        bookingUrl: 'https://www.irctc.co.in/nget/train-search',
        travelClass: radar.travelClass,
        quota: radar.quota
      };

      RadarStore.updateRadar(radar.id, {
        status: 'SEAT_FOUND',
        lastCheckedAt: nowIso,
        nextCheckAt: nextCheckIso,
        checkCount: radar.checkCount + 1,
        failureCount: 0,
        lastStatusText: `🚨 ${result.statusText} detected!`,
        monitoredTrains: updatedMonitored,
        foundSeatInfo: foundInfo,
        lastNotifiedState: {
          isAvailable: true,
          availableKeys: [currentKey],
          notifiedAt: nowIso
        }
      });

      // Send Push Notification
      const pushPayload: PushPayload = {
        title: '🚨 Seats Available!',
        body: `${radar.trainName || trainNo}\n${radar.fromCode} → ${radar.toCode} · ${formatDateDisplay(radar.journeyDate)} · ${radar.travelClass}\n${result.statusText}.\nTap to open the train and book.`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `radar-${radar.id}`,
        data: {
          url: `/?screen=monitoring&radarId=${radar.id}&trainNumber=${trainNo}&date=${radar.journeyDate}&class=${radar.travelClass}&quota=${radar.quota}`,
          radarId: radar.id,
          trainNumber: trainNo,
          journeyDate: radar.journeyDate,
          travelClass: radar.travelClass,
          quota: radar.quota,
          fromCode: radar.fromCode,
          toCode: radar.toCode,
          seatsCount: result.seatsCount,
          mode: 'TRAIN'
        }
      };

      await PushService.sendPushToClient(radar.clientId, pushPayload);
    } else {
      // Normal monitoring tick (seats unavailable or unchanged)
      RadarStore.updateRadar(radar.id, {
        lastCheckedAt: nowIso,
        nextCheckAt: nextCheckIso,
        checkCount: radar.checkCount + 1,
        failureCount: 0,
        lastStatusText: result.statusText,
        monitoredTrains: updatedMonitored,
        lastNotifiedState: {
          isAvailable: isNowAvailable,
          availableKeys: isNowAvailable ? [currentKey] : [],
          notifiedAt: radar.lastNotifiedState?.notifiedAt || nowIso
        }
      });
    }
  }

  /**
   * Process a Route Radar (monitors all trains on the route)
   */
  private static async processRouteRadar(radar: RadarJob): Promise<void> {
    const nowIso = new Date().toISOString();

    // Ensure we have the list of trains on this corridor
    let trainsToMonitor = radar.monitoredTrains;
    if (!trainsToMonitor || trainsToMonitor.length === 0) {
      try {
        const routeTrains = await fetchRealIrctcTrains(radar.fromCode, radar.toCode, radar.journeyDate, radar.quota, false);
        if (routeTrains && routeTrains.length > 0) {
          trainsToMonitor = routeTrains.map((t) => ({
            trainNumber: t.trainNumber,
            trainName: t.trainName,
            departureTime: t.departureTime,
            arrivalTime: t.arrivalTime,
            duration: t.duration,
            classes: t.classes || [radar.travelClass],
            lastStatus: 'CHECKING',
            seatsCount: 0,
            statusText: 'Checking availability...',
            lastCheckedAt: nowIso,
            bookingUrl: 'https://www.irctc.co.in/nget/train-search'
          }));
        }
      } catch (err) {
        console.warn(`[RadarScheduler] Could not fetch route trains for ${radar.fromCode}->${radar.toCode}:`, err);
      }
    }

    if (!trainsToMonitor || trainsToMonitor.length === 0) {
      const nextIntervalMs = this.calculateNextIntervalMs(radar);
      RadarStore.updateRadar(radar.id, {
        lastCheckedAt: nowIso,
        nextCheckAt: new Date(Date.now() + nextIntervalMs).toISOString(),
        checkCount: radar.checkCount + 1,
        lastStatusText: 'No trains active on this route for selected date.'
      });
      return;
    }

    const updatedMonitoredList: MonitoredTrainStatus[] = [];
    const availableTrainsList: AvailableTrainAlertItem[] = [];
    let hasAnyFailure = false;

    // Query each train (using shared deduplicated cache)
    for (const train of trainsToMonitor) {
      const queryResult = await this.queryTrainAvailabilityWithDeduplication(
        train.trainNumber,
        radar.fromCode,
        radar.toCode,
        radar.travelClass,
        radar.quota,
        radar.journeyDate
      );

      if (!queryResult) {
        hasAnyFailure = true;
        updatedMonitoredList.push({
          ...train,
          lastStatus: train.lastStatus || 'CHECKING',
          isStale: true,
          statusText: train.statusText || 'Gateway checking...',
          lastCheckedAt: train.lastCheckedAt || nowIso
        });
        continue;
      }

      const { result } = queryResult;
      const isTrainAvbl = result.isAvailable;
      const statusType: MonitoredTrainStatus['lastStatus'] = result.isCurrAvbl 
        ? 'CURR_AVBL' 
        : (result.isAvailable ? 'AVAILABLE' : (result.isDeparted ? 'DEPARTED' : 'NOT_AVAILABLE'));

      updatedMonitoredList.push({
        ...train,
        lastStatus: statusType,
        seatsCount: result.seatsCount,
        statusText: result.statusText,
        lastCheckedAt: nowIso,
        isStale: false
      });

      if (isTrainAvbl) {
        availableTrainsList.push({
          trainNumber: train.trainNumber,
          trainName: train.trainName,
          departureTime: train.departureTime,
          seatsCount: result.seatsCount,
          statusCode: result.statusCode,
          statusText: result.statusText,
          bookingUrl: 'https://www.irctc.co.in/nget/train-search'
        });
      }
    }

    const currentAvailableKeys = availableTrainsList.map((t) => `${t.trainNumber}_${t.seatsCount}`);
    const previousKeys = radar.lastNotifiedState?.availableKeys || [];
    const wasAvailable = radar.lastNotifiedState?.isAvailable || false;
    const isNowAvailable = availableTrainsList.length > 0;

    // Check if new trains or seats opened up that weren't notified yet
    const hasNewAvailableTrains = isNowAvailable && (
      !wasAvailable || 
      currentAvailableKeys.some((k) => !previousKeys.includes(k))
    );

    const nextIntervalMs = this.calculateNextIntervalMs({
      ...radar,
      failureCount: hasAnyFailure ? radar.failureCount + 1 : 0
    });
    const nextCheckIso = new Date(Date.now() + nextIntervalMs).toISOString();

    if (hasNewAvailableTrains) {
      console.log(`[RadarScheduler] Route seats found on ${radar.fromCode}->${radar.toCode}: ${availableTrainsList.length} train(s)`);

      const primaryTrain = availableTrainsList[0];
      const foundInfo = {
        trainNumber: primaryTrain.trainNumber,
        trainName: primaryTrain.trainName,
        availableBerths: primaryTrain.seatsCount,
        availabilityCode: primaryTrain.statusText,
        detectedAt: nowIso,
        bookingUrl: primaryTrain.bookingUrl || 'https://www.irctc.co.in/nget/train-search',
        travelClass: radar.travelClass,
        quota: radar.quota,
        allAvailableTrains: availableTrainsList
      };

      RadarStore.updateRadar(radar.id, {
        status: 'SEAT_FOUND',
        lastCheckedAt: nowIso,
        nextCheckAt: nextCheckIso,
        checkCount: radar.checkCount + 1,
        failureCount: 0,
        lastStatusText: `🚨 ${availableTrainsList.length} train(s) have seats available!`,
        monitoredTrains: updatedMonitoredList,
        foundSeatInfo: foundInfo,
        lastNotifiedState: {
          isAvailable: true,
          availableKeys: currentAvailableKeys,
          notifiedAt: nowIso
        }
      });

      // Construct intelligently grouped push notification:
      let title = '';
      let body = '';
      if (availableTrainsList.length === 1) {
        title = '🚨 Current Booking Available';
        body = `${radar.fromCode} → ${radar.toCode} · ${formatDateDisplay(radar.journeyDate)} · ${radar.travelClass}\n${primaryTrain.trainNumber} ${primaryTrain.trainName}\n${primaryTrain.seatsCount} seats available\nTap to view/book.`;
      } else {
        title = `🚨 Seats Available on ${availableTrainsList.length} Trains!`;
        const listText = availableTrainsList
          .slice(0, 3)
          .map((t) => `• ${t.trainNumber} ${t.trainName} (${t.seatsCount} seats)`)
          .join('\n');
        body = `${radar.fromCode} → ${radar.toCode} · ${formatDateDisplay(radar.journeyDate)} · ${radar.travelClass}\n${listText}${availableTrainsList.length > 3 ? `\n+${availableTrainsList.length - 3} more` : ''}\nTap to view all available trains.`;
      }

      const pushPayload: PushPayload = {
        title,
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `radar-${radar.id}`,
        data: {
          url: `/?screen=monitoring&radarId=${radar.id}&mode=ROUTE&from=${radar.fromCode}&to=${radar.toCode}&date=${radar.journeyDate}&class=${radar.travelClass}&quota=${radar.quota}`,
          radarId: radar.id,
          journeyDate: radar.journeyDate,
          travelClass: radar.travelClass,
          quota: radar.quota,
          fromCode: radar.fromCode,
          toCode: radar.toCode,
          seatsCount: availableTrainsList.reduce((acc, t) => acc + t.seatsCount, 0),
          mode: 'ROUTE'
        }
      };

      await PushService.sendPushToClient(radar.clientId, pushPayload);
    } else {
      // Normal monitoring tick for route
      RadarStore.updateRadar(radar.id, {
        lastCheckedAt: nowIso,
        nextCheckAt: nextCheckIso,
        checkCount: radar.checkCount + 1,
        failureCount: hasAnyFailure ? radar.failureCount + 1 : 0,
        lastStatusText: isNowAvailable 
          ? `${availableTrainsList.length} train(s) available (already alerted)` 
          : `All ${updatedMonitoredList.length} trains monitored · No current-booking seats yet`,
        monitoredTrains: updatedMonitoredList,
        lastNotifiedState: {
          isAvailable: isNowAvailable,
          availableKeys: isNowAvailable ? currentAvailableKeys : [],
          notifiedAt: radar.lastNotifiedState?.notifiedAt || nowIso
        }
      });
    }
  }

  /**
   * Upstream query with in-flight deduplication and shared caching
   * Multiple radars or users querying the same train/date/class share the single upstream call.
   */
  public static async queryTrainAvailabilityWithDeduplication(
    trainNumber: string,
    fromCode: string,
    toCode: string,
    travelClass: string,
    quota: string,
    journeyDate: string,
    forceRefresh = false
  ): Promise<{ result: ParsedSeatResult; raw: any } | null> {
    const cacheKey = `${trainNumber}_${fromCode}_${toCode}_${travelClass}_${quota}_${journeyDate}`;
    const now = Date.now();

    // 1. Check shared cache
    if (!forceRefresh) {
      const cached = this.sharedCache.get(cacheKey);
      if (cached && (now - cached.timestamp < RADAR_CONFIG.CACHE_TTL_MS)) {
        return cached;
      }
    }

    // 2. Check if query is already in-flight from another worker/user
    const inFlight = this.inFlightQueries.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    // 3. Initiate single upstream request
    const promise = (async () => {
      try {
        const raw = await fetchRealIrctcAvailabilityForTrain(
          trainNumber,
          fromCode,
          toCode,
          travelClass,
          quota,
          journeyDate,
          forceRefresh
        );

        if (!raw || !Array.isArray(raw) || raw.length === 0) {
          return null;
        }

        // Find exact date or closest matching day
        const match = raw.find((d: any) => d.dateStr === journeyDate) || raw[0];
        const parsed = this.parseSeatStatus(match);

        const entry = { result: parsed, raw };
        this.sharedCache.set(cacheKey, { timestamp: Date.now(), result: parsed, raw });
        return entry;
      } catch (err) {
        console.warn(`[RadarScheduler] Upstream query error for ${trainNumber}:`, err);
        return null;
      } finally {
        this.inFlightQueries.delete(cacheKey);
      }
    })();

    this.inFlightQueries.set(cacheKey, promise);
    return promise;
  }

  /**
   * Helper: parse seat availability item into structured result
   */
  public static parseSeatStatus(item: any): ParsedSeatResult {
    if (!item) {
      return {
        isAvailable: false,
        isCurrAvbl: false,
        statusCode: 'REGRET',
        statusText: 'No availability data',
        seatsCount: 0
      };
    }

    const code = (item.statusCode || '').toUpperCase();
    const text = (item.statusText || '').toUpperCase();
    const count = typeof item.seatsCount === 'number' ? item.seatsCount : 0;
    const isDeparted = code === 'DEPARTED' || text.includes('DEPARTED');

    const isCurrAvbl = (code === 'CURR_AVBL' || text.includes('CURR_AVBL') || text.includes('CURRENT')) && !isDeparted;
    const isStandardAvbl = (code === 'AVAILABLE' || text.includes('AVAILABLE') || text.startsWith('AVL')) && count > 0 && !isDeparted;
    const isAvailable = (isCurrAvbl || isStandardAvbl) && count > 0;

    return {
      isAvailable,
      isCurrAvbl,
      statusCode: isCurrAvbl ? 'CURR_AVBL' : (isAvailable ? 'AVAILABLE' : (isDeparted ? 'DEPARTED' : code)),
      statusText: item.statusText || (isAvailable ? `Available ${count}` : 'Not Available'),
      seatsCount: count,
      probability: item.probability,
      isDeparted
    };
  }

  /**
   * Trigger immediate scan for a radar when created or manually requested
   */
  public static async scanImmediately(radarId: string): Promise<RadarJob | null> {
    const radar = RadarStore.getRadarById(radarId);
    if (!radar) return null;
    await this.processRadar(radar);
    return RadarStore.getRadarById(radarId);
  }
}

function formatDateDisplay(isoDateStr: string): string {
  if (!isoDateStr) return '';
  const parts = isoDateStr.split('-').map(Number);
  if (parts.length === 3) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }
  return isoDateStr;
}
