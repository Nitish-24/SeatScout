import express from 'express';
import { EmailNotificationService, EmailAlertPayload } from './emailNotificationService.js';

export const emailNotificationRouter = express.Router();

/**
 * GET /api/notifications/email/status
 * Returns system email delivery capability (SMTP configured vs preview mode)
 */
emailNotificationRouter.get('/status', (req, res) => {
  const isSmtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  res.json({
    success: true,
    isSmtpConfigured,
    smtpHost: process.env.SMTP_HOST || null,
    fromEmail: process.env.ALERT_FROM_EMAIL || 'alerts@seatscout.in'
  });
});

/**
 * POST /api/notifications/email/test
 * Dispatches a realistic long-form test seat alert email
 */
emailNotificationRouter.post('/test', async (req, res) => {
  try {
    const { email, format } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required (e.g. yourname@example.com).'
      });
    }

    const testPayload: EmailAlertPayload = {
      to: email.trim(),
      trainNumber: '12012',
      trainName: 'KALKA SHTBDI',
      fromStation: 'NDLS (New Delhi)',
      toStation: 'CDG (Chandigarh Jn)',
      journeyDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      travelClass: '3A',
      quota: 'SS',
      availableBerths: 4,
      statusCode: 'CURR_AVBL 0004',
      departureTime: '17:45',
      arrivalTime: '21:15',
      bookingUrl: 'https://www.irctc.co.in/nget/train-search',
      isTest: true,
      format: format === 'summary' ? 'summary' : 'detailed'
    };

    const result = await EmailNotificationService.sendLongFormSeatAlert(testPayload);
    return res.json(result);
  } catch (err: any) {
    console.error('[EmailRouter] Error sending test alert:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error while dispatching test email.'
    });
  }
});

/**
 * POST /api/notifications/email/save-preference
 * Saves user email alert preference
 */
emailNotificationRouter.post('/save-preference', (req, res) => {
  try {
    const { clientId, email, enabled, format } = req.body;
    if (!clientId) {
      return res.status(400).json({ success: false, message: 'clientId is required' });
    }

    EmailNotificationService.setClientEmailPreference(
      clientId, 
      email ? String(email).trim() : '', 
      Boolean(enabled), 
      format === 'summary' ? 'summary' : 'detailed'
    );

    return res.json({
      success: true,
      message: 'Email notification preferences updated successfully.'
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to save email preference.'
    });
  }
});
