import { SeatScoutWatch, NotificationSettings, AlertHistoryItem } from '../types';

const WATCHES_STORAGE_KEY = 'seatscout_active_watches';
const HISTORY_STORAGE_KEY = 'seatscout_alert_history';
const SETTINGS_STORAGE_KEY = 'seatscout_user_settings';

export const DEFAULT_SETTINGS: NotificationSettings = {
  soundEnabled: true,
  soundType: 'chime',
  volume: 0.85,
  browserNotifications: true,
  checkIntervalDefault: 15,
  autoOpenIrctc: false
};

export function getStoredSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: NotificationSettings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function getStoredSavedPassengers() {
  return [];
}

export function saveStoredPassengers(_passengers: any[]) {
  // no-op
}

// Clean slate: return empty array by default without fake/seeded radars
export function getInitialWatches(): SeatScoutWatch[] {
  try {
    const raw = localStorage.getItem(WATCHES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed parsing stored watches', e);
  }
  return [];
}

export function saveWatches(watches: SeatScoutWatch[]) {
  try {
    localStorage.setItem(WATCHES_STORAGE_KEY, JSON.stringify(watches));
  } catch (e) {
    console.error('Failed to save watches', e);
  }
}

// Clean slate: return empty array by default without fake history
export function getAlertHistory(): AlertHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveAlertHistory(items: AlertHistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export type AppTheme = 'light' | 'dark';
const THEME_STORAGE_KEY = 'seatscout_theme';

export function getStoredTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  return 'dark'; // default theme
}

export function saveStoredTheme(theme: AppTheme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}
