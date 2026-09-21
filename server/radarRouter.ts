import express from 'express';
import { RadarStore } from './radarStore.js';
import { PushService } from './pushService.js';
import { RadarScheduler } from './radarScheduler.js';
import { RadarJob, RadarMode } from './radarTypes.js';
import { fetchRealIrctcTrains } from './realIrctcService.js';

export const radarRouter = express.Router();

/**
 * GET /api/radar/vapid-public-key
 * Returns VAPID public key so client can subscribe to browser push notifications
 */
radarRouter.get('/vapid-public-key', (req, res) => {
  res.json({
    publicKey: PushService.getPublicKey()
  });
});

/**
 * POST /api/radar/push/subscribe
 * Register Web Push subscription for a client device
 */
radarRouter.post('/push/subscribe', (req, res) => {
  const { clientId, subscription } = req.body;
  if (!clientId || !subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({ error: 'Invalid subscription payload. clientId and subscription with keys required.' });
  }

  RadarStore.saveSubscription({
    clientId,
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    },
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString()
  });

  console.log(`[RadarAPI] Registered push subscription for client ${clientId}`);
  res.json({ success: true, message: 'Push subscription registered successfully' });
});

/**
 * POST /api/radar/push/test
 * Test web push notifications directly
 */
radarRouter.post('/push/test', async (req, res) => {
  const { clientId } = req.body;
  if (!clientId) {
    return res.status(400).json({ error: 'clientId required' });
  }

  const success = await PushService.sendTestNotification(clientId);
  res.json({ success, message: success ? 'Test push notification delivered' : 'Failed to deliver test push. Check subscription or device permissions.' });
});

/**
 * GET /api/radar/list
 * Get all radars for client device
 */
radarRouter.get('/list', (req, res) => {
  const clientId = (req.query.clientId as string) || '';
  const status = (req.query.status as string) || '';

  let list = clientId ? RadarStore.getRadarsByClient(clientId) : RadarStore.getAllRadars();

  if (status) {
    const statuses = status.split(',');
    list = list.filter((r) => statuses.includes(r.status));
  }

  // Sort: ACTIVE and SEAT_FOUND first, then by updatedAt descending
  list.sort((a, b) => {
    const priority = (s: string) => (s === 'SEAT_FOUND' ? 1 : s === 'ACTIVE' ? 2 : s === 'PAUSED' ? 3 : 4);
    if (priority(a.status) !== priority(b.status)) {
      return priority(a.status) - priority(b.status);
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  res.json({
    radars: list,
    activeCount: list.filter((r) => r.status === 'ACTIVE').length,
    seatFoundCount: list.filter((r) => r.status === 'SEAT_FOUND').length
  });
});

/**
 * POST /api/radar/create
 * Create a new Train Radar or Route Radar
 */
radarRouter.post('/create', async (req, res) => {
  try {
    const {
      clientId,
      mode,
      trainNumber,
      trainName,
      fromCode,
      toCode,
      journeyDate,
      travelClass,
      quota = 'GN',
      departureTime
    } = req.body;

    if (!clientId || !mode || !fromCode || !toCode || !journeyDate || !travelClass) {
      return res.status(400).json({
        error: 'Missing required radar parameters (clientId, mode, fromCode, toCode, journeyDate, travelClass)'
      });
    }

    const cleanMode: RadarMode = mode === 'ROUTE' ? 'ROUTE' : 'TRAIN';
    const cleanFrom = fromCode.trim().toUpperCase();
    const cleanTo = toCode.trim().toUpperCase();
    const cleanDate = journeyDate.trim();
    const cleanClass = travelClass.trim().toUpperCase();
    const cleanQuota = quota.trim().toUpperCase();
    const cleanTrainNo = trainNumber ? String(trainNumber).trim() : undefined;

    // 1. Check duplicate prevention
    const existing = RadarStore.findDuplicateRadar({
      clientId,
      mode: cleanMode,
      trainNumber: cleanTrainNo,
      fromCode: cleanFrom,
      toCode: cleanTo,
      journeyDate: cleanDate,
      travelClass: cleanClass,
      quota: cleanQuota
    });

    if (existing) {
      console.log(`[RadarAPI] Duplicate radar request found for ${existing.id}. Returning existing instance.`);
      // If it was paused or stopped, resume it
      if (existing.status === 'PAUSED' || existing.status === 'STOPPED') {
        const resumed = RadarStore.updateRadar(existing.id, {
          status: 'ACTIVE',
          nextCheckAt: new Date().toISOString()
        });
        return res.json({ radar: resumed, isExisting: true, reactivated: true });
      }
      return res.json({ radar: existing, isExisting: true });
    }

    // 2. Fetch train details / route trains to seed monitoredTrains
    let monitoredTrains = [];
    if (cleanMode === 'ROUTE') {
      try {
        const routeTrains = await fetchRealIrctcTrains(cleanFrom, cleanTo, cleanDate, cleanQuota, false);
        if (routeTrains && routeTrains.length > 0) {
          monitoredTrains = routeTrains.map((t) => ({
            trainNumber: t.trainNumber,
            trainName: t.trainName,
            departureTime: t.departureTime,
            arrivalTime: t.arrivalTime,
            duration: t.duration,
            classes: t.classes || [cleanClass],
            lastStatus: 'CHECKING' as const,
            seatsCount: 0,
            statusText: 'Initializing Radar...',
            lastCheckedAt: new Date().toISOString(),
            bookingUrl: 'https://www.irctc.co.in/nget/train-search'
          }));
        }
      } catch (err) {
        console.warn('[RadarAPI] Route train fetch error:', err);
      }
    } else {
      monitoredTrains = [
        {
          trainNumber: cleanTrainNo || '12006',
          trainName: trainName || `Train ${cleanTrainNo}`,
          departureTime: departureTime || '18:00',
          arrivalTime: '--:--',
          duration: '--',
          classes: [cleanClass],
          lastStatus: 'CHECKING' as const,
          seatsCount: 0,
          statusText: 'Initializing Radar...',
          lastCheckedAt: new Date().toISOString(),
          bookingUrl: 'https://www.irctc.co.in/nget/train-search'
        }
      ];
    }

    const nowIso = new Date().toISOString();
    const newRadar: RadarJob = {
      id: `radar_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      clientId,
      mode: cleanMode,
      trainNumber: cleanTrainNo,
      trainName: trainName || (cleanTrainNo ? `Train ${cleanTrainNo}` : `${cleanFrom} → ${cleanTo} Express`),
      fromCode: cleanFrom,
      toCode: cleanTo,
      journeyDate: cleanDate,
      travelClass: cleanClass,
      quota: cleanQuota,
      departureTime,
      createdAt: nowIso,
      updatedAt: nowIso,
      status: 'ACTIVE',
      lastCheckedAt: undefined,
      nextCheckAt: nowIso, // Immediate check
      checkCount: 0,
      failureCount: 0,
      lastStatusText: cleanMode === 'ROUTE' 
        ? `Monitoring all ${monitoredTrains.length || 'corridor'} trains on ${cleanFrom} → ${cleanTo}`
        : `Monitoring ${cleanTrainNo} (${cleanClass} · ${cleanQuota})`,
      monitoredTrains
    };

    RadarStore.saveRadar(newRadar);
    console.log(`[RadarAPI] Created ${cleanMode} Radar ${newRadar.id} for client ${clientId}`);

    // Rule: "If seats are already available when a Radar is started, immediately show/send the availability alert rather than waiting for the next polling cycle."
    // Trigger immediate scan asynchronously
    RadarScheduler.scanImmediately(newRadar.id).catch((err) => {
      console.error(`[RadarAPI] Immediate scan error for ${newRadar.id}:`, err);
    });

    // Fetch the updated radar after quick initial scan or return newly created
    const postScanRadar = RadarStore.getRadarById(newRadar.id) || newRadar;

    res.json({
      radar: postScanRadar,
      isExisting: false,
      message: `Started ${cleanMode} Radar. Monitoring 24/7 in backend.`
    });
  } catch (err: any) {
    console.error('[RadarAPI] Failed to create radar:', err);
    res.status(500).json({ error: 'Failed to create radar', details: err?.message });
  }
});

/**
 * POST /api/radar/:id/pause
 */
radarRouter.post('/:id/pause', (req, res) => {
  const radar = RadarStore.getRadarById(req.params.id);
  if (!radar) return res.status(404).json({ error: 'Radar not found' });

  const updated = RadarStore.updateRadar(req.params.id, {
    status: 'PAUSED',
    lastStatusText: 'Radar paused by user'
  });
  res.json({ success: true, radar: updated });
});

/**
 * POST /api/radar/:id/resume
 */
radarRouter.post('/:id/resume', (req, res) => {
  const radar = RadarStore.getRadarById(req.params.id);
  if (!radar) return res.status(404).json({ error: 'Radar not found' });

  const updated = RadarStore.updateRadar(req.params.id, {
    status: 'ACTIVE',
    nextCheckAt: new Date().toISOString(),
    lastStatusText: 'Radar resumed. Monitoring active.'
  });

  // Trigger quick check
  RadarScheduler.scanImmediately(req.params.id).catch(() => {});

  res.json({ success: true, radar: updated });
});

/**
 * POST /api/radar/:id/stop
 */
radarRouter.post('/:id/stop', (req, res) => {
  const radar = RadarStore.getRadarById(req.params.id);
  if (!radar) return res.status(404).json({ error: 'Radar not found' });

  const updated = RadarStore.updateRadar(req.params.id, {
    status: 'STOPPED',
    lastStatusText: 'Radar stopped by user'
  });
  console.log(`[RadarAPI] Stopped monitoring radar ${req.params.id}`);
  res.json({ success: true, radar: updated });
});

/**
 * POST /api/radar/:id/scan
 * Force immediate manual check
 */
radarRouter.post('/:id/scan', async (req, res) => {
  const radar = RadarStore.getRadarById(req.params.id);
  if (!radar) return res.status(404).json({ error: 'Radar not found' });

  const scanned = await RadarScheduler.scanImmediately(req.params.id);
  res.json({ success: true, radar: scanned });
});

/**
 * GET /api/radar/:id/trains
 * Get live monitored trains status for Route Radar
 */
radarRouter.get('/:id/trains', (req, res) => {
  const radar = RadarStore.getRadarById(req.params.id);
  if (!radar) return res.status(404).json({ error: 'Radar not found' });

  res.json({
    radarId: radar.id,
    mode: radar.mode,
    monitoredTrains: radar.monitoredTrains || [],
    foundSeatInfo: radar.foundSeatInfo
  });
});

/**
 * DELETE /api/radar/:id
 */
radarRouter.delete('/:id', (req, res) => {
  const deleted = RadarStore.deleteRadar(req.params.id);
  res.json({ success: deleted });
});
