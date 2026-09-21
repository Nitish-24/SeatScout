import { getClientId } from '../utils/clientId';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface PushStatus {
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
}

export class PushNotificationService {
  private static registration: ServiceWorkerRegistration | null = null;

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  public static async initServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) return null;
    try {
      if (!this.registration) {
        this.registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        console.log('[PushService] Service Worker registered with scope:', this.registration.scope);
      }
      return this.registration;
    } catch (err) {
      console.warn('[PushService] Service Worker registration failed:', err);
      return null;
    }
  }

  public static async getStatus(): Promise<PushStatus> {
    const supported = this.isSupported();
    if (!supported) {
      return { supported: false, permission: 'default', subscribed: false };
    }

    const permission = Notification.permission;
    let subscribed = false;

    try {
      const reg = await this.initServiceWorker();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        subscribed = !!sub;
      }
    } catch {
      subscribed = false;
    }

    return { supported, permission, subscribed };
  }

  /**
   * Request permission and subscribe to Web Push
   */
  public static async enablePushNotifications(): Promise<{ success: boolean; message: string }> {
    if (!this.isSupported()) {
      return { success: false, message: 'Web Push is not supported in this browser.' };
    }

    try {
      // Check if running inside iframe
      const inIframe = typeof window !== 'undefined' && window.self !== window.top;
      if (inIframe) {
        try {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            return {
              success: false,
              message: 'Native browser notifications are restricted in embedded preview mode. Please open the app in a new tab or use our SMS/Phone alert system.'
            };
          }
        } catch {
          return {
            success: false,
            message: 'Browser sandbox blocked push permission. Please open this app in a new tab or verify your phone number for SMS alerts.'
          };
        }
      } else {
        // 1. Request browser notification permission in top-level context
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          return { success: false, message: 'Notification permission was denied. Please allow notifications in site settings or use SMS alerts.' };
        }
      }

      // 2. Register Service Worker
      const reg = await this.initServiceWorker();
      if (!reg) {
        return { success: false, message: 'Could not initialize service worker for notifications.' };
      }

      // Wait until active
      if (reg.installing) {
        await new Promise((resolve) => {
          reg.installing?.addEventListener('statechange', (e: any) => {
            if (e.target.state === 'activated') resolve(null);
          });
        });
      }

      // 3. Fetch VAPID public key from backend
      const vapidRes = await fetch('/api/radar/vapid-public-key');
      if (!vapidRes.ok) {
        throw new Error('Failed to retrieve VAPID key from backend');
      }
      const { publicKey } = await vapidRes.json();
      if (!publicKey) {
        throw new Error('VAPID public key is empty');
      }

      // 4. Subscribe with PushManager
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);
      let subscription = await reg.pushManager.getSubscription();

      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      }

      // 5. Send subscription to server
      const clientId = getClientId();
      const subJson = subscription.toJSON();

      const saveRes = await fetch('/api/radar/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          subscription: {
            endpoint: subJson.endpoint,
            keys: {
              p256dh: subJson.keys?.p256dh,
              auth: subJson.keys?.auth
            }
          }
        })
      });

      if (!saveRes.ok) {
        throw new Error('Server failed to register push subscription');
      }

      return { success: true, message: 'Push notifications successfully activated!' };
    } catch (err: any) {
      console.error('[PushService] Enable push error:', err);
      return { success: false, message: err?.message || 'Failed to enable push notifications' };
    }
  }

  /**
   * Send test push notification to verify delivery
   */
  public static async sendTestNotification(): Promise<boolean> {
    try {
      const clientId = getClientId();
      const res = await fetch('/api/radar/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId })
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  }
}
