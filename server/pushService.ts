import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import { RADAR_CONFIG } from './radarConfig.js';
import { RadarStore } from './radarStore.js';
import { PushPayload } from './radarTypes.js';

interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

const VAPID_FILE = path.resolve(process.cwd(), RADAR_CONFIG.VAPID_FILE);

function getOrGenerateVapidKeys(): VapidKeys {
  // Check env vars first
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY
    };
  }

  // Check persistent file
  try {
    if (fs.existsSync(VAPID_FILE)) {
      const content = fs.readFileSync(VAPID_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.publicKey && parsed.privateKey) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[PushService] Could not read VAPID file, generating fresh keys:', err);
  }

  // Generate new keys and persist them
  const generated = webpush.generateVAPIDKeys();
  try {
    const dir = path.dirname(VAPID_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(VAPID_FILE, JSON.stringify(generated, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[PushService] Could not save generated VAPID keys to disk:', err);
  }
  return generated;
}

const vapidKeys = getOrGenerateVapidKeys();

try {
  webpush.setVapidDetails(
    'mailto:seatscout-radar@railway-alerts.local',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
} catch (err) {
  console.error('[PushService] Failed to set VAPID details:', err);
}

export class PushService {
  public static getPublicKey(): string {
    return vapidKeys.publicKey;
  }

  /**
   * Send web push notification to a specific client device
   */
  public static async sendPushToClient(clientId: string, payload: PushPayload): Promise<{ success: boolean; delivered: number; failed: number }> {
    const subscriptions = RadarStore.getSubscriptionsForClient(clientId);
    if (subscriptions.length === 0) {
      console.log(`[PushService] No push subscriptions found for client ${clientId}`);
      return { success: false, delivered: 0, failed: 0 };
    }

    let delivered = 0;
    let failed = 0;

    const bodyString = JSON.stringify(payload);

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys
            },
            bodyString,
            {
              TTL: 60 * 60, // 1 hour TTL
              urgency: 'high'
            }
          );
          delivered++;
        } catch (err: any) {
          failed++;
          const statusCode = err?.statusCode;
          console.warn(`[PushService] Push delivery error to ${sub.endpoint} (HTTP ${statusCode}):`, err?.message || err);
          // 404 or 410 indicates expired or unsubscribed endpoint
          if (statusCode === 404 || statusCode === 410) {
            console.log(`[PushService] Removing expired subscription for endpoint: ${sub.endpoint}`);
            RadarStore.deleteSubscription(sub.endpoint);
          }
        }
      })
    );

    return {
      success: delivered > 0,
      delivered,
      failed
    };
  }

  /**
   * Send web push notification to all subscribed clients
   */
  public static async sendToAll(payload: PushPayload): Promise<{ success: boolean; delivered: number; failed: number }> {
    const allSubs = RadarStore.getAllSubscriptions();
    if (allSubs.length === 0) {
      return { success: false, delivered: 0, failed: 0 };
    }

    let delivered = 0;
    let failed = 0;
    const bodyString = JSON.stringify(payload);

    await Promise.all(
      allSubs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys
            },
            bodyString,
            {
              TTL: 60 * 60,
              urgency: 'high'
            }
          );
          delivered++;
        } catch (err: any) {
          failed++;
          const statusCode = err?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            RadarStore.deleteSubscription(sub.endpoint);
          }
        }
      })
    );

    return {
      success: delivered > 0,
      delivered,
      failed
    };
  }

  /**
   * Send test push notification to verify service worker integration
   */
  public static async sendTestNotification(clientId: string): Promise<boolean> {
    const payload: PushPayload = {
      title: '🎯 SeatScout Radar Active!',
      body: 'Push notifications are connected. Radar will alert you immediately when Current Booking seats open.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'radar-test',
      data: {
        url: '/?screen=monitoring',
        mode: 'TRAIN'
      }
    };
    const res = await this.sendPushToClient(clientId, payload);
    return res.success;
  }
}
