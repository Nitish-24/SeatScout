import { ServerRadarJob, MonitoredTrainStatus } from '../types';
import { getClientId } from '../utils/clientId';

export interface CreateRadarParams {
  mode: 'TRAIN' | 'ROUTE';
  trainNumber?: string;
  trainName?: string;
  fromCode: string;
  toCode: string;
  journeyDate: string;
  travelClass: string;
  quota: string;
  departureTime?: string;
}

export class RadarApiService {
  public static async listRadars(): Promise<{ radars: ServerRadarJob[]; activeCount: number; seatFoundCount: number }> {
    const clientId = getClientId();
    const res = await fetch(`/api/radar/list?clientId=${encodeURIComponent(clientId)}`);
    if (!res.ok) {
      throw new Error(`Failed to list radars: ${res.statusText}`);
    }
    return await res.json();
  }

  public static async createRadar(params: CreateRadarParams): Promise<{ radar: ServerRadarJob; isExisting: boolean; message?: string }> {
    const clientId = getClientId();
    const res = await fetch('/api/radar/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        ...params
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to create radar: ${res.statusText}`);
    }
    return await res.json();
  }

  public static async pauseRadar(id: string): Promise<ServerRadarJob> {
    const res = await fetch(`/api/radar/${id}/pause`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to pause radar');
    const data = await res.json();
    return data.radar;
  }

  public static async resumeRadar(id: string): Promise<ServerRadarJob> {
    const res = await fetch(`/api/radar/${id}/resume`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to resume radar');
    const data = await res.json();
    return data.radar;
  }

  public static async stopRadar(id: string): Promise<ServerRadarJob> {
    const res = await fetch(`/api/radar/${id}/stop`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to stop radar');
    const data = await res.json();
    return data.radar;
  }

  public static async forceScan(id: string): Promise<ServerRadarJob> {
    const res = await fetch(`/api/radar/${id}/scan`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to scan radar');
    const data = await res.json();
    return data.radar;
  }

  public static async deleteRadar(id: string): Promise<boolean> {
    const res = await fetch(`/api/radar/${id}`, { method: 'DELETE' });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.success;
  }

  public static async getRadarTrains(id: string): Promise<{ monitoredTrains: MonitoredTrainStatus[]; foundSeatInfo?: any }> {
    const res = await fetch(`/api/radar/${id}/trains`);
    if (!res.ok) throw new Error('Failed to fetch radar trains');
    return await res.json();
  }
}
