// High-quality Web Audio API sound synthesizer for soothing, pleasant alerts

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

export function ensureAudioUnlocked() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  } catch {}
}

// Automatically listen for user interaction to unlock web audio early
if (typeof window !== 'undefined') {
  const unlock = () => {
    ensureAudioUnlocked();
    window.removeEventListener('click', unlock);
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('click', unlock, { once: true, passive: true });
  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true, passive: true });
  window.addEventListener('touchstart', unlock, { once: true, passive: true });
}

export type SoundType = 'chime' | 'soft' | 'radar';

function _playSynthesizedSound(ctx: AudioContext, type: SoundType, volume: number) {
  const now = ctx.currentTime;
  
  // Master gain with smooth attack
  const masterGain = ctx.createGain();
  const safeVolume = Math.min(1, Math.max(0.1, volume));
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(safeVolume * 0.5, now + 0.02);
  masterGain.connect(ctx.destination);

  // Warm low-pass filter to eliminate any harsh high frequencies
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2800, now);
  filter.connect(masterGain);

  if (type === 'chime' || type === 'soft') {
    // Elegant 4-note melodic glass chime: C5 (523.25 Hz) -> E5 (659.25 Hz) -> G5 (783.99 Hz) -> C6 (1046.50 Hz)
    const notes = [
      { freq: 523.25, time: 0, duration: 0.8 },
      { freq: 659.25, time: 0.1, duration: 0.9 },
      { freq: 783.99, time: 0.2, duration: 1.1 },
      { freq: 1046.50, time: 0.32, duration: 1.4 }
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      // Pure sine wave for pristine bell clarity
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      // Soft, organic acoustic envelope (quick 15ms attack, smooth exponential decay)
      noteGain.gain.setValueAtTime(0.0001, now + time);
      noteGain.gain.linearRampToValueAtTime(0.35, now + time + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(noteGain);
      noteGain.connect(filter);

      osc.start(now + time);
      osc.stop(now + time + duration + 0.05);
    });
  } else {
    // Gentle dual ping
    [587.33, 880.0].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.15);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 0.6);

      osc.connect(gain);
      gain.connect(filter);
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.65);
    });
  }
}

/**
 * Plays a calm, gentle glass-bell chime (C major arpeggio with warm harmonic decay)
 */
export function playSeatAlertSound(type: SoundType = 'chime', volume: number = 0.75) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        _playSynthesizedSound(ctx, type, volume);
      }).catch(() => {
        _playSynthesizedSound(ctx, type, volume);
      });
      return;
    }
    _playSynthesizedSound(ctx, type, volume);
  } catch (err) {
    console.warn('Audio playback could not be initiated:', err);
  }
}

/**
 * Check if the application is running inside an iframe (e.g. preview sandbox)
 */
export function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

// In-app fallback notification event listener
export interface InAppNotificationPayload {
  title: string;
  body?: string;
  trainNumber?: string;
  trainName?: string;
  availableBerths?: number;
  fromCode?: string;
  toCode?: string;
  journeyDate?: string;
  travelClass?: string;
  quota?: string;
  bookingUrl?: string;
  radarId?: string;
  mode?: 'TRAIN' | 'ROUTE';
  type?: 'SEAT_FOUND' | 'RADAR_ACTIVE' | 'INFO';
  radarRef?: any;
}

type InAppNotificationListener = (payload: InAppNotificationPayload) => void;
const inAppListeners = new Set<InAppNotificationListener>();

export function subscribeToInAppNotifications(listener: InAppNotificationListener): () => void {
  inAppListeners.add(listener);
  return () => inAppListeners.delete(listener);
}

export function triggerInAppNotification(payload: string | InAppNotificationPayload, body?: string) {
  const normalized: InAppNotificationPayload = typeof payload === 'string'
    ? { title: payload, body, type: 'SEAT_FOUND' }
    : payload;

  inAppListeners.forEach((listener) => {
    try {
      listener(normalized);
    } catch (e) {
      console.error('In-app notification listener error:', e);
    }
  });
}

// Flashing document tab title to draw instant attention when user is on another browser tab
let tabAlertInterval: any = null;
let originalDocTitle = '';

export function startTabAlertBadge(alertMessage: string = '🚨 SEATS AVAILABLE!') {
  if (typeof document === 'undefined') return;
  if (!originalDocTitle) {
    originalDocTitle = document.title || 'SeatScout';
  }

  if (tabAlertInterval) {
    clearInterval(tabAlertInterval);
  }

  let toggle = true;
  tabAlertInterval = setInterval(() => {
    document.title = toggle ? alertMessage : `⚡ ${originalDocTitle}`;
    toggle = !toggle;
  }, 900);

  const clearAlert = () => {
    if (tabAlertInterval) {
      clearInterval(tabAlertInterval);
      tabAlertInterval = null;
    }
    document.title = originalDocTitle;
    window.removeEventListener('focus', clearAlert);
    document.removeEventListener('visibilitychange', clearAlert);
  };

  window.addEventListener('focus', clearAlert);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) clearAlert();
  });
}

/**
 * Request notification permission from browser with safety for sandboxed iframes
 */
export async function requestNotificationPermission(): Promise<{
  permission: NotificationPermission;
  isIframeBlocked: boolean;
  message?: string;
}> {
  if (!('Notification' in window)) {
    return {
      permission: 'denied',
      isIframeBlocked: false,
      message: 'Browser does not support notifications.'
    };
  }

  if (Notification.permission === 'granted') {
    return { permission: 'granted', isIframeBlocked: false };
  }

  if (isInIframe()) {
    // In sandboxed/cross-origin iframes, Notification.requestPermission() is blocked by browser security policy
    try {
      const perm = await Notification.requestPermission();
      return {
        permission: perm,
        isIframeBlocked: perm !== 'granted',
        message: perm !== 'granted' ? 'Embedded preview blocked notification prompt. Open in a new tab or use SMS alerts.' : undefined
      };
    } catch {
      return {
        permission: 'denied',
        isIframeBlocked: true,
        message: 'Browser security restricts native notification prompts in embedded previews. Please open the app in a new tab or use our SMS alerts.'
      };
    }
  }

  try {
    const permission = await Notification.requestPermission();
    return { permission, isIframeBlocked: false };
  } catch (err: any) {
    console.warn('Notification permission request error:', err);
    return {
      permission: 'denied',
      isIframeBlocked: true,
      message: err?.message || 'Could not request notification permission.'
    };
  }
}

/**
 * Dispatch desktop push notification with automatic In-App notification fallback.
 * Uses ServiceWorkerRegistration.showNotification() when available (which works even
 * when user is on another browser tab or another application), with fallback to new Notification().
 */
export async function sendDesktopNotification(
  title: string, 
  options?: NotificationOptions & { data?: any }
) {
  // 1. Flash the tab title so it stands out in the browser tab bar
  startTabAlertBadge(`🚨 ${title}`);

  // 2. Dispatch native OS desktop pop-up on the screen
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  const notifOptions: NotificationOptions & Record<string, any> = {
    body: options?.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: `seatscout-seat-alert-${Date.now()}`,
    renotify: true,
    requireInteraction: true, // Keeps alert popup on top-right of the screen until user dismisses or clicks!
    vibrate: [300, 100, 300, 100, 300],
    data: {
      url: typeof window !== 'undefined' ? window.location.origin + '/?screen=monitoring' : '/?screen=monitoring',
      ...options?.data
    },
    ...options
  };

  // Method A: Service Worker showNotification (Best for background tabs, Chrome & Firefox)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, notifOptions);
        return;
      }
    } catch (swErr) {
      console.warn('Service worker showNotification fallback:', swErr);
    }
  }

  // Method B: Direct new Notification constructor
  try {
    const notification = new Notification(title, notifOptions);
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (e) {
    console.warn('Direct notification construction failed:', e);
  }
}
