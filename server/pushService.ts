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

function isValidVapidKey(publicKey?: string, privateKey?: string): boolean {
  if (!publicKey || !privateKey || typeof publicKey !== 'string' || typeof privateKey !== 'string') {
    return false;
  }
  const cleanPub = publicKey.trim();
  const cleanPriv = privateKey.trim();
  if (cleanPub === 'NA' || cleanPriv === 'NA' || cleanPub.length < 50 || cleanPriv.length < 20) {
    return false;
  }
  try {
    const pubBuf = Buffer.from(cleanPub, 'base64url');
    const privBuf = Buffer.from(cleanPriv, 'base64url');
    return pubBuf.length === 65 && privBuf.length === 32;
  } catch {
    return false;
  }
}

function getOrGenerateVapidKeys(): VapidKeys {
  // Check env vars first (only if valid)
  if (isValidVapidKey(process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY)) {
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY!.trim(),
      privateKey: process.env.VAPID_PRIVATE_KEY!.trim()
    };
  }

  // Check persistent file
  try {
    if (fs.existsSync(VAPID_FILE)) {
      const content = fs.readFileSync(VAPID_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (isValidVapidKey(parsed.publicKey, parsed.privateKey)) {
        return {
          publicKey: parsed.publicKey.trim(),
          privateKey: parsed.privateKey.trim()
        };
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

let vapidKeys = getOrGenerateVapidKeys();

function initializeVapid() {
  try {
    webpush.setVapidDetails(
      'mailto:seatscout-radar@railway-alerts.local',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );
  } catch (err) {
    console.warn('[PushService] Initial VAPID keys failed validation, generating fresh keys:', err);
    vapidKeys = webpush.generateVAPIDKeys();
    try {
      const dir = path.dirname(VAPID_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys, null, 2), 'utf-8');
      webpush.setVapidDetails(
        'mailto:seatscout-radar@railway-alerts.local',
        vapidKeys.publicKey,
        vapidKeys.privateKey
      );
      console.log('[PushService] Successfully reinitialized fresh VAPID keys');
    } catch (secondErr) {
      console.error('[PushService] Critical: Failed to configure VAPID details:', secondErr);
    }
  }
}

initializeVapid();

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
