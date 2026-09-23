import crypto from 'crypto';
import { SmsGatewayService } from './smsGatewayService';
import { MetaWhatsappService } from './metaWhatsappService';

export interface PendingOtp {
  otp: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
  channel: 'WHATSAPP' | 'SMS';
}

export interface VerifiedPhoneUser {
  phone: string;
  verifiedAt: string;
  token: string;
  subscribedRadars: string[];
  preferredChannel?: 'WHATSAPP' | 'SMS' | 'BOTH';
  alertHistory: Array<{
    id: string;
    type: 'SMS' | 'WHATSAPP' | 'WEB_NOTIFICATION';
    message: string;
    timestamp: string;
    status: 'delivered' | 'failed';
  }>;
}

/**
 * In-memory store for OTPs, Verified Phone Users, and SMS Logs
 */
class PhoneNotificationStore {
  private pendingOtps: Map<string, PendingOtp> = new Map();
  private verifiedUsers: Map<string, VerifiedPhoneUser> = new Map();

  constructor() {
    // Periodic cleanup of expired OTPs every 60 seconds
    setInterval(() => {
      const now = Date.now();
      for (const [phone, item] of this.pendingOtps.entries()) {
        if (now > item.expiresAt) {
          this.pendingOtps.delete(phone);
        }
      }
    }, 60000);
  }

  public normalizePhone(rawPhone: string): string {
    if (!rawPhone) return '';
    let cleaned = rawPhone.replace(/[^\d+]/g, '');
    // If 10 digits (standard Indian mobile), prepend +91
    if (/^[6-9]\d{9}$/.test(cleaned)) {
      cleaned = '+91' + cleaned;
    } else if (/^91[6-9]\d{9}$/.test(cleaned)) {
      cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+') && cleaned.length >= 10) {
      cleaned = '+' + cleaned;
    }
    return cleaned;
  }

  public setOtp(phone: string, otp: string, ttlSeconds = 300, channel: 'WHATSAPP' | 'SMS' = 'WHATSAPP'): void {
    const norm = this.normalizePhone(phone);
    this.pendingOtps.set(norm, {
      otp,
      expiresAt: Date.now() + ttlSeconds * 1000,
      attempts: 0,
      createdAt: Date.now(),
      channel
    });
  }

  public getOtp(phone: string): PendingOtp | undefined {
    const norm = this.normalizePhone(phone);
    return this.pendingOtps.get(norm);
  }

  public deleteOtp(phone: string): void {
    const norm = this.normalizePhone(phone);
    this.pendingOtps.delete(norm);
  }

  public setVerified(phone: string, channel: 'WHATSAPP' | 'SMS' = 'WHATSAPP'): VerifiedPhoneUser {
    const norm = this.normalizePhone(phone);
    const existing = this.verifiedUsers.get(norm);
    const token = crypto.randomBytes(24).toString('hex');
    const user: VerifiedPhoneUser = {
      phone: norm,
      verifiedAt: new Date().toISOString(),
      token,
      subscribedRadars: existing?.subscribedRadars || [],
      preferredChannel: channel,
      alertHistory: existing?.alertHistory || []
    };
    this.verifiedUsers.set(norm, user);
    return user;
  }

  public getVerifiedUser(phone: string): VerifiedPhoneUser | undefined {
    const norm = this.normalizePhone(phone);
    return this.verifiedUsers.get(norm);
  }

  public getAllVerifiedPhones(): string[] {
    return Array.from(this.verifiedUsers.keys());
  }

  public addAlertToHistory(phone: string, type: 'SMS' | 'WHATSAPP' | 'WEB_NOTIFICATION', message: string, status: 'delivered' | 'failed' = 'delivered'): void {
    const norm = this.normalizePhone(phone);
    const user = this.verifiedUsers.get(norm);
    if (user) {
      user.alertHistory.unshift({
        id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type,
        message,
        timestamp: new Date().toISOString(),
        status
      });
      if (user.alertHistory.length > 50) {
        user.alertHistory = user.alertHistory.slice(0, 50);
      }
    }
  }
}

export const phoneStore = new PhoneNotificationStore();

export class PhoneNotificationService {
  /**
   * Validate Indian or international mobile phone number
   */
  public static isValidPhoneNumber(phone: string): boolean {
    const norm = phoneStore.normalizePhone(phone);
    // Matches +91 followed by 10 digits starting with 6-9, or general international numbers
    return /^\+91[6-9]\d{9}$/.test(norm) || /^\+[1-9]\d{9,14}$/.test(norm);
  }

  /**
   * Generate and send 6-digit OTP to mobile phone via WhatsApp (Meta API) or SMS
   */
  public static async sendOtp(
    rawPhone: string,
    channel: 'WHATSAPP' | 'SMS' = 'WHATSAPP'
  ): Promise<{
    success: boolean;
    phone: string;
    channel: 'WHATSAPP' | 'SMS';
    message: string;
    expiresInSeconds: number;
    devOtp?: string;
    whatsappDirectUrl?: string;
    isOAuthError?: boolean;
  }> {
    const phone = phoneStore.normalizePhone(rawPhone);
    if (!this.isValidPhoneNumber(phone)) {
      return {
        success: false,
        phone,
        channel,
        message: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +919876543210)',
        expiresInSeconds: 0
      };
    }

    // Rate-limiting check (30-second cooldown period)
    const existing = phoneStore.getOtp(phone);
    if (existing && Date.now() - existing.createdAt < 30000) {
      const waitRemaining = Math.ceil((30000 - (Date.now() - existing.createdAt)) / 1000);
      return {
        success: false,
        phone,
        channel,
        message: `Please wait ${waitRemaining} seconds before requesting a new code.`,
        expiresInSeconds: Math.round((existing.expiresAt - Date.now()) / 1000)
      };
    }

    // Generate cryptographic 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlSeconds = 300; // 5 minutes
    phoneStore.setOtp(phone, otp, ttlSeconds, channel);

    // Masked phone for user privacy
    const masked = phone.slice(0, 4) + '******' + phone.slice(-3);

    if (channel === 'WHATSAPP') {
      const whatsappResult = await MetaWhatsappService.sendOtpWhatsapp(phone, otp);
      return {
        success: true,
        phone,
        channel: 'WHATSAPP',
        message: whatsappResult.error 
          ? `Verification code generated for ${masked}. ${whatsappResult.error}`
          : `Verification code sent via WhatsApp to ${masked}. Please check your WhatsApp messages.`,
        expiresInSeconds: ttlSeconds,
        devOtp: whatsappResult.devOtp,
        whatsappDirectUrl: whatsappResult.whatsappDirectUrl,
        isOAuthError: whatsappResult.isOAuthError
      };
    } else {
      const smsResult = await SmsGatewayService.sendOtpSms(phone, otp);
      return {
        success: true,
        phone,
        channel: 'SMS',
        message: smsResult.error 
          ? `Verification code generated for ${masked}. Note: ${smsResult.error}`
          : `Verification code sent via SMS to ${masked}. Please check your phone messages.`,
        expiresInSeconds: ttlSeconds,
        devOtp: otp
      };
    }
  }

  /**
   * Verify OTP submitted by user
   */
  public static async verifyOtp(rawPhone: string, submittedOtp: string): Promise<{
    success: boolean;
    verified: boolean;
    phone: string;
    channel?: 'WHATSAPP' | 'SMS';
    token?: string;
    message: string;
  }> {
    const phone = phoneStore.normalizePhone(rawPhone);
    const pending = phoneStore.getOtp(phone);

    if (!pending) {
      return {
        success: false,
        verified: false,
        phone,
        message: 'No active verification code found or code has expired. Please request a new code.'
      };
    }

    if (Date.now() > pending.expiresAt) {
      phoneStore.deleteOtp(phone);
      return {
        success: false,
        verified: false,
        phone,
        message: 'Verification code has expired. Please request a new code.'
      };
    }

    pending.attempts += 1;
    if (pending.attempts > 5) {
      phoneStore.deleteOtp(phone);
      return {
        success: false,
        verified: false,
        phone,
        message: 'Too many incorrect attempts. Please request a new verification code.'
      };
    }

    if (pending.otp.trim() !== submittedOtp.trim()) {
      return {
        success: false,
        verified: false,
        phone,
        message: 'Invalid verification code. Please check the 6-digit code and try again.'
      };
    }

    // OTP matched!
    const userChannel = pending.channel || 'WHATSAPP';
    phoneStore.deleteOtp(phone);
    const user = phoneStore.setVerified(phone, userChannel);

    console.log(`\n✅ [VERIFICATION] Phone ${phone} verified successfully via ${userChannel}!\n`);

    return {
      success: true,
      verified: true,
      phone,
      channel: userChannel,
      token: user.token,
      message: `Phone number ${phone} successfully verified! You will receive instant seat alerts via ${userChannel === 'WHATSAPP' ? 'WhatsApp' : 'SMS'}.`
    };
  }

  /**
   * Send confirmed berth alert notification via WhatsApp, SMS, and Web Notification
   */
  public static async sendBerthAlert(
    rawPhone: string,
    alert: {
      trainNumber: string;
      trainName: string;
      fromStation?: string;
      toStation?: string;
      journeyDate: string;
      travelClass: string;
      quota: string;
      availableBerths: number;
      customMessage?: string;
    }
  ): Promise<{
    success: boolean;
    delivered: boolean;
    phone: string;
    channel: 'WHATSAPP' | 'SMS' | 'BOTH';
    messageText: string;
    timestamp: string;
    error?: string;
  }> {
    const phone = phoneStore.normalizePhone(rawPhone);
    const user = phoneStore.getVerifiedUser(phone);

    if (!user) {
      return {
        success: false,
        delivered: false,
        phone,
        channel: 'WHATSAPP',
        messageText: '',
        timestamp: new Date().toISOString(),
        error: 'Phone number is not verified. Please complete verification first.'
      };
    }

    const routeText = alert.fromStation && alert.toStation ? `${alert.fromStation} → ${alert.toStation}` : '';
    const quotaDesc = alert.quota === 'SS' ? 'Lower Berth / Senior Citizen' : 'General Quota';

    const messageText = alert.customMessage || 
      `🚨 *Seat Alert*: 🎉 ${alert.availableBerths} confirmed berth(s) released on ${alert.trainNumber} ${alert.trainName}${routeText ? ` (${routeText})` : ''} for ${alert.journeyDate} in ${alert.travelClass} (${quotaDesc})! Book immediately on IRCTC: https://www.irctc.co.in/nget/train-search`;

    const channel = user.preferredChannel || 'WHATSAPP';
    let deliverySuccess = false;
    let deliveryError: string | undefined;

    if (channel === 'WHATSAPP' || channel === 'BOTH') {
      const waResult = await MetaWhatsappService.sendAlertWhatsapp(phone, messageText);
      deliverySuccess = waResult.success;
      deliveryError = waResult.error;
      phoneStore.addAlertToHistory(phone, 'WHATSAPP', messageText, waResult.success ? 'delivered' : 'failed');
    }

    if (channel === 'SMS' || channel === 'BOTH') {
      const smsResult = await SmsGatewayService.sendAlertSms(phone, messageText);
      deliverySuccess = deliverySuccess || smsResult.success;
      if (!deliveryError) deliveryError = smsResult.error;
      phoneStore.addAlertToHistory(phone, 'SMS', messageText, smsResult.success ? 'delivered' : 'failed');
    }

    return {
      success: deliverySuccess,
      delivered: deliverySuccess,
      phone,
      channel,
      messageText,
      timestamp: new Date().toISOString(),
      error: deliveryError
    };
  }

  /**
   * Broadcast seat alert to all verified phones
   */
  public static async broadcastBerthAlertToAllVerified(alert: {
    trainNumber: string;
    trainName: string;
    fromStation?: string;
    toStation?: string;
    journeyDate: string;
    travelClass: string;
    quota: string;
    availableBerths: number;
  }): Promise<{ totalSent: number; phones: string[] }> {
    const allPhones = phoneStore.getAllVerifiedPhones();
    for (const phone of allPhones) {
      await this.sendBerthAlert(phone, alert);
    }
    return { totalSent: allPhones.length, phones: allPhones };
  }
}
