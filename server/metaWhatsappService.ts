/**
 * Meta WhatsApp Business Cloud API Service
 * 
 * Provides official integration with Meta's WhatsApp Cloud API for:
 * 1. Dispatching verification OTP codes to users via WhatsApp without mentioning SeatScout.
 * 2. Dispatching real-time berth release alerts directly to WhatsApp.
 * 
 * Official Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

export interface MetaWhatsappDispatchResult {
  success: boolean;
  provider: 'META_WHATSAPP' | 'DEV_MOCK';
  messageId?: string;
  phone: string;
  channel: 'WHATSAPP';
  error?: string;
  details?: string;
}

export class MetaWhatsappService {
  /**
   * Resolve active Meta WhatsApp credentials from environment variables
   */
  public static getMetaConfig(): {
    token: string | null;
    phoneNumberId: string | null;
    templateName: string | null;
    templateLang: string;
    isConfigured: boolean;
  } {
    const token = process.env.META_WHATSAPP_TOKEN || 
                  process.env.WHATSAPP_ACCESS_TOKEN || 
                  process.env.META_ACCESS_TOKEN || 
                  null;

    const phoneNumberId = process.env.META_PHONE_NUMBER_ID || 
                          process.env.WHATSAPP_PHONE_NUMBER_ID || 
                          null;

    const templateName = process.env.WHATSAPP_TEMPLATE_NAME || null;
    const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || 'en_US';

    return {
      token,
      phoneNumberId,
      templateName,
      templateLang,
      isConfigured: Boolean(token && phoneNumberId)
    };
  }

  /**
   * Format phone number for Meta WhatsApp Cloud API (Digits only, e.g. 919876543210)
   */
  public static formatPhoneForWhatsapp(phone: string): string {
    const digitsOnly = phone.replace(/\D/g, '');
    // If 10-digit Indian mobile number without country code, prefix with 91
    if (digitsOnly.length === 10) {
      return `91${digitsOnly}`;
    }
    return digitsOnly;
  }

  /**
   * Dispatch verification OTP code to user's WhatsApp using Meta API
   * Notice: Strictly without the name 'SeatScout' as specified by user requirements
   */
  public static async sendOtpWhatsapp(toPhone: string, otp: string): Promise<MetaWhatsappDispatchResult> {
    const config = this.getMetaConfig();
    const cleanPhone = this.formatPhoneForWhatsapp(toPhone);

    // Message body without any mention of SeatScout
    const messageBody = `Your verification code is: *${otp}*. Valid for 5 minutes. Do not share this code with anyone.`;

    console.log(`\n==================================================`);
    console.log(`💬 [META WHATSAPP CLOUD API] Verification Dispatch`);
    console.log(`📱 Destination: +${cleanPhone}`);
    console.log(`🔑 Configured: ${config.isConfigured ? 'Yes (Live Meta Cloud API)' : 'No (Console Debug Mode)'}`);
    console.log(`📄 Message: ${messageBody}`);
    console.log(`==================================================\n`);

    if (!config.isConfigured) {
      console.warn(`⚠️ [META WHATSAPP API] Live credentials not set in environment.`);
      console.warn(`👉 To send real WhatsApp messages to users' phones, add META_WHATSAPP_TOKEN and META_PHONE_NUMBER_ID to your .env file.`);
      console.log(`💬 Verification code for +${cleanPhone}: ${otp}`);

      return {
        success: true,
        provider: 'DEV_MOCK',
        phone: toPhone,
        channel: 'WHATSAPP',
        details: 'Meta API keys not configured in .env. Code logged for verification.'
      };
    }

    try {
      const endpoint = `https://graph.facebook.com/v20.0/${config.phoneNumberId}/messages`;

      // 1. Try sending standard text message
      const textPayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: messageBody
        }
      };

      let res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(textPayload)
      });

      let data = await res.json();

      // If text message fails because 24-hr customer service window is closed or template required
      if (!res.ok && (data?.error?.code === 131047 || config.templateName)) {
        console.log(`[Meta WhatsApp] Text message requires template; attempting template dispatch...`);
        const templatePayload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'template',
          template: {
            name: config.templateName || 'otp_verification',
            language: { code: config.templateLang },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: otp }
                ]
              },
              {
                type: 'button',
                sub_type: 'url',
                index: '0',
                parameters: [
                  { type: 'text', text: otp }
                ]
              }
            ]
          }
        };

        res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(templatePayload)
        });

        data = await res.json();
      }

      if (res.ok && data?.messages?.[0]?.id) {
        console.log(`✅ [META WHATSAPP API] Successfully sent WhatsApp message! Message ID: ${data.messages[0].id}`);
        return {
          success: true,
          provider: 'META_WHATSAPP',
          messageId: data.messages[0].id,
          phone: toPhone,
          channel: 'WHATSAPP',
          details: 'Dispatched via official Meta WhatsApp Business Cloud API'
        };
      }

      const errMsg = data?.error?.message || `Meta WhatsApp API HTTP ${res.status}`;
      console.error(`❌ [META WHATSAPP API] Error dispatching message:`, data);
      return {
        success: false,
        provider: 'META_WHATSAPP',
        phone: toPhone,
        channel: 'WHATSAPP',
        error: errMsg
      };

    } catch (err: any) {
      console.error(`❌ [META WHATSAPP API] Network error:`, err);
      return {
        success: false,
        provider: 'META_WHATSAPP',
        phone: toPhone,
        channel: 'WHATSAPP',
        error: err?.message || 'Failed to reach Meta WhatsApp API endpoint'
      };
    }
  }

  /**
   * Dispatch real-time berth alert to WhatsApp via Meta API
   */
  public static async sendAlertWhatsapp(toPhone: string, alertMessage: string): Promise<MetaWhatsappDispatchResult> {
    const config = this.getMetaConfig();
    const cleanPhone = this.formatPhoneForWhatsapp(toPhone);

    if (!config.isConfigured) {
      console.log(`💬 [WhatsApp Alert Logged for +${cleanPhone}]:\n${alertMessage}`);
      return {
        success: true,
        provider: 'DEV_MOCK',
        phone: toPhone,
        channel: 'WHATSAPP',
        details: 'Meta API keys not configured. Alert logged to console.'
      };
    }

    try {
      const endpoint = `https://graph.facebook.com/v20.0/${config.phoneNumberId}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: alertMessage
        }
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data?.messages?.[0]?.id) {
        return {
          success: true,
          provider: 'META_WHATSAPP',
          messageId: data.messages[0].id,
          phone: toPhone,
          channel: 'WHATSAPP',
          details: 'Alert delivered via Meta WhatsApp API'
        };
      }

      return {
        success: false,
        provider: 'META_WHATSAPP',
        phone: toPhone,
        channel: 'WHATSAPP',
        error: data?.error?.message || 'Meta WhatsApp alert delivery failed'
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'META_WHATSAPP',
        phone: toPhone,
        channel: 'WHATSAPP',
        error: err.message
      };
    }
  }
}
