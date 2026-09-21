/**
 * Real SMS Gateway Service
 * 
 * Supports live programmatic SMS delivery across major telecommunication providers:
 * 1. Twilio SMS (Global & India DLT / International Carrier routes)
 * 2. Fast2SMS (Indian Mobile Numbers direct OTP route)
 * 3. Custom SMS Gateway / Webhook
 */

export interface SmsDispatchResult {
  success: boolean;
  provider: 'TWILIO' | 'FAST2SMS' | 'CUSTOM_WEBHOOK' | 'DEV_MOCK';
  messageId?: string;
  phone: string;
  error?: string;
  details?: string;
}

export class SmsGatewayService {
  /**
   * Determine currently active SMS carrier configuration
   */
  public static getActiveProvider(): 'TWILIO' | 'FAST2SMS' | 'CUSTOM_WEBHOOK' | 'NONE' {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      return 'TWILIO';
    }
    if (process.env.FAST2SMS_API_KEY) {
      return 'FAST2SMS';
    }
    if (process.env.SMS_GATEWAY_URL) {
      return 'CUSTOM_WEBHOOK';
    }
    return 'NONE';
  }

  /**
   * Dispatch real 6-digit OTP SMS to user's mobile number
   */
  public static async sendOtpSms(toPhone: string, otp: string): Promise<SmsDispatchResult> {
    const provider = this.getActiveProvider();
    const message = `[SeatScout] Your IRCTC Current Booking Radar verification code is: ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;

    console.log(`\n==================================================`);
    console.log(`📡 [REAL SMS GATEWAY] Initiating Live SMS Dispatch`);
    console.log(`📱 Destination: ${toPhone}`);
    console.log(`🏢 Active Provider: ${provider}`);
    console.log(`==================================================`);

    switch (provider) {
      case 'TWILIO':
        return await this.sendViaTwilio(toPhone, message);
      case 'FAST2SMS':
        return await this.sendViaFast2Sms(toPhone, otp);
      case 'CUSTOM_WEBHOOK':
        return await this.sendViaWebhook(toPhone, message, otp);
      case 'NONE':
      default:
        console.warn(`⚠️ [REAL SMS GATEWAY] No SMS provider API keys configured in environment.`);
        console.warn(`👉 To receive real SMS on your mobile phone, provide TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN or FAST2SMS_API_KEY in your environment secrets.`);
        console.log(`📱 Target: ${toPhone} | OTP Code: ${otp}`);
        console.log(`==================================================\n`);
        return {
          success: true, // Allow verification to proceed in local development while logging clearly
          provider: 'DEV_MOCK',
          phone: toPhone,
          details: 'Live carrier keys not yet set. OTP logged to server console.'
        };
    }
  }

  /**
   * Dispatch real berth alert notification via SMS
   */
  public static async sendAlertSms(toPhone: string, alertMessage: string): Promise<SmsDispatchResult> {
    const provider = this.getActiveProvider();

    switch (provider) {
      case 'TWILIO':
        return await this.sendViaTwilio(toPhone, alertMessage);
      case 'FAST2SMS': {
        const cleanNumber = toPhone.replace(/^\+91/, '').replace(/\D/g, '');
        try {
          const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
              'authorization': process.env.FAST2SMS_API_KEY!,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              route: 'q',
              message: alertMessage,
              language: 'english',
              flash: 0,
              numbers: cleanNumber
            })
          });
          const data = await res.json();
          return {
            success: data.return === true,
            provider: 'FAST2SMS',
            phone: toPhone,
            messageId: data.request_id,
            error: data.return ? undefined : (data.message?.[0] || 'Fast2SMS error')
          };
        } catch (e: any) {
          return { success: false, provider: 'FAST2SMS', phone: toPhone, error: e.message };
        }
      }
      case 'CUSTOM_WEBHOOK':
        return await this.sendViaWebhook(toPhone, alertMessage);
      case 'NONE':
      default:
        return {
          success: true,
          provider: 'DEV_MOCK',
          phone: toPhone,
          details: 'Alert logged to server console.'
        };
    }
  }

  /**
   * Twilio SMS REST API Dispatcher
   */
  private static async sendViaTwilio(toPhone: string, message: string): Promise<SmsDispatchResult> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER!;

    try {
      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const body = new URLSearchParams({
        To: toPhone,
        From: fromPhone,
        Body: message
      });

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`❌ [Twilio SMS Error]`, data);
        return {
          success: false,
          provider: 'TWILIO',
          phone: toPhone,
          error: data.message || `Twilio error code: ${data.code}`
        };
      }

      console.log(`✅ [Twilio SMS Delivered] SID: ${data.sid} | Status: ${data.status}`);
      return {
        success: true,
        provider: 'TWILIO',
        phone: toPhone,
        messageId: data.sid,
        details: `Dispatched via Twilio (Status: ${data.status})`
      };
    } catch (err: any) {
      console.error(`❌ [Twilio SMS Exception]`, err);
      return {
        success: false,
        provider: 'TWILIO',
        phone: toPhone,
        error: err.message || 'Failed to connect to Twilio SMS API'
      };
    }
  }

  /**
   * Fast2SMS OTP Dispatcher (Specialized for Indian mobile numbers)
   */
  private static async sendViaFast2Sms(toPhone: string, otp: string): Promise<SmsDispatchResult> {
    const apiKey = process.env.FAST2SMS_API_KEY!;
    const cleanNumber = toPhone.replace(/^\+91/, '').replace(/\D/g, '');

    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: cleanNumber
        })
      });

      const data = await response.json();

      if (!data.return) {
        console.error(`❌ [Fast2SMS Error]`, data);
        return {
          success: false,
          provider: 'FAST2SMS',
          phone: toPhone,
          error: data.message?.[0] || 'Fast2SMS OTP delivery failure'
        };
      }

      console.log(`✅ [Fast2SMS Delivered] Request ID: ${data.request_id}`);
      return {
        success: true,
        provider: 'FAST2SMS',
        phone: toPhone,
        messageId: data.request_id,
        details: 'Dispatched via Fast2SMS OTP Gateway'
      };
    } catch (err: any) {
      console.error(`❌ [Fast2SMS Exception]`, err);
      return {
        success: false,
        provider: 'FAST2SMS',
        phone: toPhone,
        error: err.message || 'Failed to connect to Fast2SMS API'
      };
    }
  }

  /**
   * Custom Webhook / SMS Gateway Dispatcher
   */
  private static async sendViaWebhook(toPhone: string, message: string, otp?: string): Promise<SmsDispatchResult> {
    const url = process.env.SMS_GATEWAY_URL!;
    const apiKey = process.env.SMS_GATEWAY_API_KEY || '';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
        },
        body: JSON.stringify({
          to: toPhone,
          message,
          otp,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json().catch(() => ({}));
      return {
        success: response.ok,
        provider: 'CUSTOM_WEBHOOK',
        phone: toPhone,
        details: `Webhook status: ${response.status}`
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'CUSTOM_WEBHOOK',
        phone: toPhone,
        error: err.message || 'Failed to connect to custom SMS webhook'
      };
    }
  }
}
