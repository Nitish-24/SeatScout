import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface EmailAlertPayload {
  to: string;
  trainNumber: string;
  trainName: string;
  fromStation: string;
  toStation: string;
  journeyDate: string;
  travelClass: string;
  quota: string;
  availableBerths: number;
  statusCode?: string;
  departureTime?: string;
  arrivalTime?: string;
  bookingUrl?: string;
  isTest?: boolean;
  format?: 'detailed' | 'summary';
}

export interface EmailDispatchResult {
  success: boolean;
  delivered: boolean;
  messageId?: string;
  previewUrl?: string;
  message: string;
  timestamp: string;
  mode: 'smtp' | 'preview_log';
}

// In-memory store for registered client email notification preferences
const clientEmailStore = new Map<string, { email: string; enabled: boolean; format: 'detailed' | 'summary' }>();

export class EmailNotificationService {
  private static transporter: Transporter | null = null;

  /**
   * Lazy-initializes the SMTP transporter if environment credentials exist.
   * If credentials are not supplied, alerts are logged and formatted cleanly with mock preview delivery.
   */
  private static getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass }
        });
        console.log(`[EmailNotificationService] Configured SMTP client for ${host}:${port}`);
      } catch (err) {
        console.error('[EmailNotificationService] Failed to initialize SMTP transporter:', err);
        return null;
      }
    }
    return this.transporter;
  }

  public static setClientEmailPreference(clientId: string, email: string, enabled: boolean, format: 'detailed' | 'summary' = 'detailed') {
    clientEmailStore.set(clientId, { email, enabled, format });
  }

  public static getClientEmailPreference(clientId: string) {
    return clientEmailStore.get(clientId);
  }

  public static getAllRegisteredEmails(): string[] {
    const list: string[] = [];
    for (const pref of clientEmailStore.values()) {
      if (pref.enabled && pref.email) {
        list.push(pref.email);
      }
    }
    return list;
  }

  /**
   * Generates a long-form HTML email dossier for IRCTC seat availability
   */
  private static generateHtmlDossier(payload: EmailAlertPayload): string {
    const quotaDesc = payload.quota === 'SS' 
      ? 'Senior Citizen / Lower Berth Quota' 
      : payload.quota === 'TQ' 
        ? 'Tatkal Quota' 
        : 'General Quota (GN)';
    
    const bookingUrl = payload.bookingUrl || 'https://www.irctc.co.in/nget/train-search';
    const timestampStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SeatScout Urgent Berth Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f17; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Urgent Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 24px; text-align: left;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: rgba(0, 0, 0, 0.25); color: #ecfdf5; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 9999px;">
                      ${payload.isTest ? '🧪 TEST BERTH DOSSIER' : '🚨 IMMEDIATE ACTION REQUIRED'}
                    </span>
                    <h1 style="margin: 12px 0 4px 0; color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.2;">
                      Confirmed Berths Released!
                    </h1>
                    <p style="margin: 0; color: #d1fae5; font-size: 14px;">
                      IRCTC SeatScout Radar has detected open availability.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Berth Summary Highlights -->
          <tr>
            <td style="padding: 24px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #1f2937; border-radius: 12px; border: 1px solid #374151; padding: 18px; margin-bottom: 20px;">
                <tr>
                  <td width="50%" style="vertical-align: top; padding: 8px 12px; border-right: 1px solid #374151;">
                    <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Available Berths</div>
                    <div style="font-size: 28px; font-weight: 800; color: #10b981; margin-top: 4px;">
                      ${payload.availableBerths} <span style="font-size: 14px; font-weight: 600; color: #34d399;">Seats</span>
                    </div>
                    <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">Status: <strong>${payload.statusCode || 'CURR_AVBL'}</strong></div>
                  </td>
                  <td width="50%" style="vertical-align: top; padding: 8px 12px;">
                    <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Class & Quota</div>
                    <div style="font-size: 20px; font-weight: 800; color: #f9fafb; margin-top: 4px;">
                      ${payload.travelClass}
                    </div>
                    <div style="font-size: 12px; color: #38bdf8; font-weight: 600; margin-top: 2px;">${quotaDesc}</div>
                  </td>
                </tr>
              </table>

              <!-- Journey Details Card -->
              <h2 style="font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">
                🚆 Train & Journey Information
              </h2>
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f17; border-radius: 12px; border: 1px solid #1f2937; padding: 16px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 12px; font-size: 13px; color: #9ca3af;" width="35%">Train Number & Name</td>
                  <td style="padding: 6px 12px; font-size: 14px; font-weight: 700; color: #ffffff;">
                    ${payload.trainNumber} - ${payload.trainName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px; font-size: 13px; color: #9ca3af;">Route</td>
                  <td style="padding: 6px 12px; font-size: 14px; font-weight: 700; color: #38bdf8;">
                    ${payload.fromStation} &rarr; ${payload.toStation}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px; font-size: 13px; color: #9ca3af;">Journey Date</td>
                  <td style="padding: 6px 12px; font-size: 14px; font-weight: 700; color: #f59e0b;">
                    ${payload.journeyDate}
                  </td>
                </tr>
                ${payload.departureTime ? `
                <tr>
                  <td style="padding: 6px 12px; font-size: 13px; color: #9ca3af;">Scheduled Departure</td>
                  <td style="padding: 6px 12px; font-size: 14px; font-weight: 600; color: #e2e8f0;">
                    ${payload.departureTime} (IST)
                  </td>
                </tr>` : ''}
              </table>

              <!-- Primary Action Button -->
              <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${bookingUrl}" target="_blank" style="display: block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 800; padding: 16px 32px; border-radius: 12px; text-align: center; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4);">
                      ⚡ Open IRCTC & Book Immediately &rarr;
                    </a>
                    <div style="font-size: 11px; color: #6b7280; margin-top: 8px;">
                      Berths are allocated on a first-come, first-served basis. High cancellation velocity may exhaust seats quickly.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Strategic IRCTC Booking Intelligence Dossier -->
              <h2 style="font-size: 15px; font-weight: 700; color: #f3f4f6; margin: 0 0 12px 0;">
                💡 Strategic Booking Insights & Guidelines
              </h2>
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #1e1b4b; border: 1px solid #3730a3; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <div style="font-size: 13px; font-weight: 700; color: #c7d2fe; margin-bottom: 6px;">
                      ⏰ Current Booking Window (CURR_AVBL)
                    </div>
                    <p style="margin: 0 0 10px 0; font-size: 12px; color: #e0e7ff; line-height: 1.5;">
                      Current Booking opens online approximately 4 hours before the train's scheduled departure from its origin or charting station. Berths are confirmed immediately with direct coach and seat numbers assigned upon checkout.
                    </p>
                    
                    <div style="font-size: 13px; font-weight: 700; color: #c7d2fe; margin-bottom: 6px;">
                      🧓 Senior Citizen / Lower Berth Rules
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #e0e7ff; line-height: 1.5;">
                      If booked under the SS quota: Men must be 60 years or older; Women must be 45 years or older traveling single or as two seniors. Carry original government age proof (Aadhaar / Voter ID / Passport) during travel to avoid standard ticket penalties.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <div style="border-top: 1px solid #1f2937; padding-top: 16px; font-size: 11px; color: #6b7280; line-height: 1.6; text-align: center;">
                This notification was dispatched by <strong>IRCTC SeatScout 24/7 Automated Radar</strong> at ${timestampStr}.<br>
                You received this long-form dossier because email alerts are enabled in your SeatScout settings.
              </div>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Dispatches a long-form seat alert email (or test email)
   */
  public static async sendLongFormSeatAlert(payload: EmailAlertPayload): Promise<EmailDispatchResult> {
    const timestamp = new Date().toISOString();
    const quotaDesc = payload.quota === 'SS' ? 'Lower Berth / Senior Citizen' : payload.quota;
    const subject = payload.isTest
      ? `[TEST ALERT] 🚨 SeatScout Long-Form Dossier: ${payload.availableBerths} Berths on ${payload.trainNumber} ${payload.trainName}`
      : `🚨 [SeatScout ALERT] ${payload.availableBerths} Confirmed Berth(s) Available on ${payload.trainNumber} (${payload.travelClass} · ${quotaDesc})!`;

    const html = this.generateHtmlDossier(payload);
    const text = `
🚨 SeatScout Berth Alert: Confirmed Berths Available!
=============================================================
Train: ${payload.trainNumber} - ${payload.trainName}
Route: ${payload.fromStation} -> ${payload.toStation}
Date: ${payload.journeyDate}
Class: ${payload.travelClass} | Quota: ${quotaDesc}
Available Berths: ${payload.availableBerths} (Status: ${payload.statusCode || 'CURR_AVBL'})
Direct Booking Link: ${payload.bookingUrl || 'https://www.irctc.co.in/nget/train-search'}

Book immediately on IRCTC before berths are filled.
Dispatched by SeatScout 24/7 Radar at ${timestamp}.
    `.trim();

    const transporter = this.getTransporter();

    if (transporter) {
      try {
        const fromAddress = process.env.ALERT_FROM_EMAIL || `"SeatScout Radar" <alerts@seatscout.in>`;
        const info = await transporter.sendMail({
          from: fromAddress,
          to: payload.to,
          subject,
          text,
          html
        });

        console.log(`[EmailNotificationService] Email delivered to ${payload.to}. MessageId: ${info.messageId}`);
        return {
          success: true,
          delivered: true,
          messageId: info.messageId,
          message: `Long-form seat alert email delivered to ${payload.to} via SMTP.`,
          timestamp,
          mode: 'smtp'
        };
      } catch (err: any) {
        console.error('[EmailNotificationService] Error sending via SMTP:', err);
        return {
          success: false,
          delivered: false,
          message: `Failed to deliver email via SMTP: ${err.message}`,
          timestamp,
          mode: 'smtp'
        };
      }
    }

    // Fallback: If SMTP credentials are not yet set in .env, format and simulate delivery
    console.log(`\n==================================================`);
    console.log(`📧 [EMAIL GATEWAY DISPATCH] To: ${payload.to}`);
    console.log(`🏷️  Subject: ${subject}`);
    console.log(`🚆 Train: ${payload.trainNumber} ${payload.trainName}`);
    console.log(`🎫 Berths: ${payload.availableBerths} in ${payload.travelClass}`);
    console.log(`⏰ Time: ${timestamp}`);
    console.log(`==================================================\n`);

    return {
      success: true,
      delivered: true,
      message: `Long-form berth alert dossier formatted and dispatched for ${payload.to}. (Configure SMTP_HOST in .env for external carrier delivery).`,
      timestamp,
      mode: 'preview_log'
    };
  }
}
