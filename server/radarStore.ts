import fs from 'fs';
import path from 'path';
import { RadarJob, PushSubscriptionItem } from './radarTypes.js';
import { RADAR_CONFIG } from './radarConfig.js';

const DATA_DIR = path.resolve(process.cwd(), RADAR_CONFIG.DATA_DIR);
const RADARS_FILE = path.resolve(process.cwd(), RADAR_CONFIG.RADARS_FILE);
const SUBS_FILE = path.resolve(process.cwd(), RADAR_CONFIG.SUBSCRIPTIONS_FILE);

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function safeReadJson<T>(filePath: string, fallback: T): T {
  try {
    ensureDataDir();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[RadarStore] Failed to read ${filePath}, returning fallback:`, err);
    return fallback;
  }
}

function safeWriteJson<T>(filePath: string, data: T): void {
  try {
    ensureDataDir();
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`[RadarStore] Failed to write ${filePath}:`, err);
  }
}

export class RadarStore {
  private static radarsCache: Map<string, RadarJob> | null = null;
  private static subscriptionsCache: Map<string, PushSubscriptionItem> | null = null;

  private static loadRadars(): Map<string, RadarJob> {
    if (!this.radarsCache) {
      const list = safeReadJson<RadarJob[]>(RADARS_FILE, []);
      this.radarsCache = new Map();
      for (const r of list) {
        this.radarsCache.set(r.id, r);
      }
    }
    return this.radarsCache;
  }

  private static persistRadars(): void {
    if (!this.radarsCache) return;
    const array = Array.from(this.radarsCache.values());
    safeWriteJson(RADARS_FILE, array);
  }

  private static loadSubscriptions(): Map<string, PushSubscriptionItem> {
    if (!this.subscriptionsCache) {
      const list = safeReadJson<PushSubscriptionItem[]>(SUBS_FILE, []);
      this.subscriptionsCache = new Map();
      for (const s of list) {
        this.subscriptionsCache.set(s.endpoint, s);
      }
    }
    return this.subscriptionsCache;
  }

  private static persistSubscriptions(): void {
    if (!this.subscriptionsCache) return;
    const array = Array.from(this.subscriptionsCache.values());
    safeWriteJson(SUBS_FILE, array);
  }

  // --- Radar Operations ---

  public static getAllRadars(): RadarJob[] {
    const map = this.loadRadars();
    return Array.from(map.values());
  }

  public static getRadarsByClient(clientId: string): RadarJob[] {
    const all = this.getAllRadars();
    if (!clientId) return all;
    return all.filter((r) => r.clientId === clientId);
  }

  public static getActiveRadars(): RadarJob[] {
    const all = this.getAllRadars();
    return all.filter((r) => r.status === 'ACTIVE');
  }

  public static getRadarById(id: string): RadarJob | null {
    const map = this.loadRadars();
    return map.get(id) || null;
  }

  /**
   * Find existing matching active or paused radar to prevent duplicate creation
   */
  public static findDuplicateRadar(params: {
    clientId: string;
    mode: 'TRAIN' | 'ROUTE';
    trainNumber?: string;
    fromCode: string;
    toCode: string;
    journeyDate: string;
    travelClass: string;
    quota: string;
  }): RadarJob | null {
    const all = this.getAllRadars();
    return all.find((r) => {
      // Must match client and date/class/quota
      if (r.clientId !== params.clientId) return false;
      if (r.journeyDate !== params.journeyDate) return false;
      if (r.travelClass !== params.travelClass) return false;
      if (r.quota !== params.quota) return false;
      if (r.status === 'STOPPED' || r.status === 'EXPIRED') return false;

      if (params.mode === 'TRAIN') {
        return r.mode === 'TRAIN' && r.trainNumber === params.trainNumber;
      } else {
        return r.mode === 'ROUTE' && r.fromCode === params.fromCode && r.toCode === params.toCode;
      }
    }) || null;
  }

  public static saveRadar(radar: RadarJob): RadarJob {
    const map = this.loadRadars();
    map.set(radar.id, radar);
    this.persistRadars();
    return radar;
  }

  public static updateRadar(id: string, updates: Partial<RadarJob>): RadarJob | null {
    const map = this.loadRadars();
    const existing = map.get(id);
    if (!existing) return null;

    const updated: RadarJob = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    map.set(id, updated);
    this.persistRadars();
    return updated;
  }

  public static deleteRadar(id: string): boolean {
    const map = this.loadRadars();
    const deleted = map.delete(id);
    if (deleted) {
      this.persistRadars();
    }
    return deleted;
  }

  // --- Push Subscription Operations ---

  public static saveSubscription(sub: PushSubscriptionItem): void {
    const map = this.loadSubscriptions();
    map.set(sub.endpoint, sub);
    this.persistSubscriptions();
  }

  public static getSubscriptionsForClient(clientId: string): PushSubscriptionItem[] {
    const map = this.loadSubscriptions();
    return Array.from(map.values()).filter((s) => s.clientId === clientId);
  }

  public static getAllSubscriptions(): PushSubscriptionItem[] {
    const map = this.loadSubscriptions();
    return Array.from(map.values());
  }

  public static deleteSubscription(endpoint: string): void {
    const map = this.loadSubscriptions();
    if (map.delete(endpoint)) {
      this.persistSubscriptions();
    }
  }
}
