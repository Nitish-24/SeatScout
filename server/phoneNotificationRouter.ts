import express from 'express';
import { PhoneNotificationService, phoneStore } from './phoneNotificationService.js';
import { PushService } from './pushService.js';

export const phoneNotificationRouter = express.Router();

/**
 * POST /api/notifications/phone/verifyPhone
 * POST /api/notifications/phone/verify-phone
 * 
 * Secure Two-Step API Endpoint Interaction:
 * - If called with { phone } (no otp): triggers an OTP request to the specified mobile number.
 * - If called with { phone, otp }: cryptographically validates the OTP, generates a verification token,
 *   and enables 24/7 SMS berth alerts to ensure account security.
 */
async function handleVerifyPhone(req: express.Request, res: express.Response) {
  try {
    const { phone, otp, channel = 'WHATSAPP' } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Step 2: If OTP is provided, validate the OTP and activate alerts
    if (otp) {
      const result = await PhoneNotificationService.verifyOtp(phone, otp);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.json({
        ...result,
        action: 'OTP_VALIDATED',
        alertsEnabled: true,
        channel: result.channel || channel,
        securityVerified: true
      });
    }

    // Step 1: If no OTP is provided, trigger an OTP request via specified channel (WhatsApp/SMS)
    const result = await PhoneNotificationService.sendOtp(phone, channel);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json({
      ...result,
      action: 'OTP_REQUESTED',
      alertsEnabled: false
    });
  } catch (err: any) {
    console.error('[PhoneRouter] Error in verifyPhone endpoint:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
}

phoneNotificationRouter.post('/verifyPhone', handleVerifyPhone);
phoneNotificationRouter.post('/verify-phone', handleVerifyPhone);

/**
 * POST /api/notifications/phone/send-otp
 * Body: { phone: string, channel?: 'WHATSAPP' | 'SMS' }
 */
phoneNotificationRouter.post('/send-otp', async (req, res) => {
  try {
    const { phone, channel = 'WHATSAPP' } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const result = await PhoneNotificationService.sendOtp(phone, channel);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err: any) {
    console.error('[PhoneRouter] Error in send-otp:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

/**
 * POST /api/notifications/phone/verify-otp
 * Body: { phone: string, otp: string }
 */
phoneNotificationRouter.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Both phone and OTP code are required' });
    }

    const result = await PhoneNotificationService.verifyOtp(phone, otp);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err: any) {
    console.error('[PhoneRouter] Error in verify-otp:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

/**
 * GET /api/notifications/phone/status
 * Query: ?phone=+919876543210
 */
phoneNotificationRouter.get('/status', (req, res) => {
  try {
    const rawPhone = (req.query.phone as string) || '';
    if (!rawPhone) {
      return res.status(400).json({ success: false, message: 'phone parameter required' });
    }

    const norm = phoneStore.normalizePhone(rawPhone);
    const user = phoneStore.getVerifiedUser(norm);

    if (!user) {
      return res.json({
        verified: false,
        phone: norm,
        message: 'Phone number is not verified yet.'
      });
    }

    return res.json({
      verified: true,
      phone: norm,
      verifiedAt: user.verifiedAt,
      alertHistory: user.alertHistory || []
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/notifications/phone/send-alert
 * Send SMS and/or Web notification to verified phone
 */
phoneNotificationRouter.post('/send-alert', async (req, res) => {
  try {
    const {
      phone,
      trainNumber = '12012',
      trainName = 'Kalka Shatabdi Express',
      fromStation = 'CDG',
      toStation = 'NDLS',
      journeyDate = new Date().toISOString().split('T')[0],
      travelClass = 'CC',
      quota = 'GN',
      availableBerths = 4,
      customMessage,
      channel = 'WHATSAPP' // 'WHATSAPP' | 'SMS' | 'WEB_NOTIFICATION' | 'BOTH'
    } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // 1. Send SMS Alert
    const smsResult = await PhoneNotificationService.sendBerthAlert(phone, {
      trainNumber,
      trainName,
      fromStation,
      toStation,
      journeyDate,
      travelClass,
      quota,
      availableBerths,
      customMessage
    });

    if (!smsResult.success) {
      return res.status(400).json(smsResult);
    }

    // 2. If Web Push channel also requested
    let webPushDelivered = false;
    if (channel === 'WEB_NOTIFICATION' || channel === 'BOTH') {
      try {
        const title = `🚨 Seats Available: ${trainNumber} ${trainName}`;
        const body = `🎉 ${availableBerths} confirmed berth(s) released (${travelClass}, ${quota}) on ${journeyDate}!`;
        // Broadcast push notification to active service workers
        await PushService.sendToAll({
          title,
          body,
          tag: `seat-avail-${trainNumber}-${Date.now()}`,
          data: {
            url: 'https://www.irctc.co.in/nget/train-search',
            trainNumber: String(trainNumber),
            journeyDate: String(journeyDate),
            travelClass: String(travelClass),
            quota: String(quota),
            seatsCount: Number(availableBerths) || 1
          }
        });
        webPushDelivered = true;
      } catch (pushErr) {
        console.warn('[PhoneRouter] Web push broadcast warning:', pushErr);
      }
    }

    return res.json({
      success: true,
      smsDelivered: smsResult.delivered,
      webPushDelivered,
      channel,
      phone: smsResult.phone,
      messageText: smsResult.messageText,
      timestamp: smsResult.timestamp
    });
  } catch (err: any) {
    console.error('[PhoneRouter] Error sending alert:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to dispatch alert' });
  }
});
