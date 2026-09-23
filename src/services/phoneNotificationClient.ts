/**
 * Client service to interact with Phone OTP validation & SMS / Web Notification API
 */

export interface PhoneStatusResponse {
  verified: boolean;
  phone: string;
  verifiedAt?: string;
  alertHistory?: Array<{
    id: string;
    type: 'SMS' | 'WEB_NOTIFICATION';
    message: string;
    timestamp: string;
    status: 'delivered' | 'failed';
  }>;
  message?: string;
}

const STORAGE_KEY_PHONE = 'seatscout_verified_phone';
const STORAGE_KEY_TOKEN = 'seatscout_verified_token';

export class PhoneNotificationClient {
  public static getSavedPhone(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY_PHONE);
    } catch {
      return null;
    }
  }

  public static saveVerifiedPhone(phone: string, token: string): void {
    try {
      localStorage.setItem(STORAGE_KEY_PHONE, phone);
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    } catch (e) {
      console.warn('Could not save verified phone to localStorage:', e);
    }
  }

  public static clearVerifiedPhone(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_PHONE);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    } catch (e) {
      console.warn('Could not clear verified phone:', e);
    }
  }

  /**
   * Unified verifyPhone API endpoint interaction:
   * - Call `verifyPhone(phone, undefined, channel)` to trigger an OTP request via WhatsApp (Meta API) or SMS.
   * - Call `verifyPhone(phone, otp)` to validate the OTP before enabling alerts.
   */
  public static async verifyPhone(phone: string, otp?: string, channel: 'WHATSAPP' | 'SMS' = 'WHATSAPP'): Promise<{
    success: boolean;
    verified?: boolean;
    action?: 'OTP_REQUESTED' | 'OTP_VALIDATED';
    alertsEnabled?: boolean;
    channel?: 'WHATSAPP' | 'SMS';
    securityVerified?: boolean;
    phone: string;
    token?: string;
    message: string;
    expiresInSeconds?: number;
  }> {
    const res = await fetch('/api/notifications/phone/verifyPhone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, ...(otp ? { otp } : { channel }) })
    });
    const data = await res.json();
    if (data.success && data.verified && data.phone) {
      this.saveVerifiedPhone(data.phone, data.token || '');
    }
    return data;
  }

  /**
   * Request OTP to mobile number via WhatsApp or SMS
   */
  public static async sendOtp(phone: string, channel: 'WHATSAPP' | 'SMS' = 'WHATSAPP'): Promise<{
    success: boolean;
    phone: string;
    channel?: 'WHATSAPP' | 'SMS';
    message: string;
    expiresInSeconds: number;
  }> {
    const res = await fetch('/api/notifications/phone/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, channel })
    });
    return await res.json();
  }

  /**
   * Verify 6-digit OTP
   */
  public static async verifyOtp(phone: string, otp: string): Promise<{
    success: boolean;
    verified: boolean;
    phone: string;
    token?: string;
    message: string;
  }> {
    const res = await fetch('/api/notifications/phone/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    const data = await res.json();
    if (data.success && data.verified) {
      this.saveVerifiedPhone(data.phone, data.token || '');
    }
    return data;
  }

  /**
   * Check verification status of a phone number
   */
  public static async getPhoneStatus(phone: string): Promise<PhoneStatusResponse> {
    const res = await fetch(`/api/notifications/phone/status?phone=${encodeURIComponent(phone)}`);
    return await res.json();
  }

  /**
   * Trigger instant berth alert notification to mobile via SMS and/or Web notification
   */
  public static async sendAlert(payload: {
    phone: string;
    trainNumber?: string;
    trainName?: string;
    fromStation?: string;
    toStation?: string;
    journeyDate?: string;
    travelClass?: string;
    quota?: string;
    availableBerths?: number;
    channel?: 'WHATSAPP' | 'SMS' | 'WEB_NOTIFICATION' | 'BOTH';
    customMessage?: string;
  }): Promise<{
    success: boolean;
    delivered?: boolean;
    smsDelivered?: boolean;
    webPushDelivered?: boolean;
    channel: string;
    phone: string;
    messageText: string;
    timestamp: string;
    error?: string;
  }> {
    const res = await fetch('/api/notifications/phone/send-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }

  public static async sendTestAlert(payload: Parameters<typeof PhoneNotificationClient.sendAlert>[0]) {
    return this.sendAlert(payload);
  }
}
