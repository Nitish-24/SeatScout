# SeatScout — Indian Railways Current Booking (`CURR_AVBL`) Radar

<p align="center">
  <img src="public/images/guide_radar_screen.jpg" alt="SeatScout Dashboard Interface" width="100%" style="border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);" />
</p>

<p align="center">
  <strong>Smart 24/7 PRS Berth Radar & Last-Minute Confirmed Seat Alert System for Indian Railways</strong>
</p>

<p align="center">
  <a href="#-about-this-project"><img src="https://img.shields.io/badge/Project-SeatScout-blue?style=for-the-badge&logo=compass" alt="About SeatScout" /></a>
  <a href="#-how-it-works-the-4-step-guide"><img src="https://img.shields.io/badge/Interactive_Guide-4_Steps-10b981?style=for-the-badge&logo=book" alt="Interactive Guide" /></a>
  <a href="#-meta-whatsapp-cloud-api-integration"><img src="https://img.shields.io/badge/Meta_WhatsApp-Cloud_API-25d366?style=for-the-badge&logo=whatsapp" alt="Meta WhatsApp" /></a>
  <a href="#-top-right-screen-alerts--desktop-notifications"><img src="https://img.shields.io/badge/Screen_Alerts-Top_Right_Popup-f59e0b?style=for-the-badge&logo=bell" alt="Screen Alerts" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/React_19-Tailwind_v4-38bdf8?style=for-the-badge&logo=react" alt="React 19" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge" alt="License" /></a>
</p>

---

## 📌 About This Project

**SeatScout** is a full-stack, real-time seat monitoring radar designed for Indian Railways passengers. 

Every day, millions of travelers in India are stuck with **Waitlisted (WL)** or **RAC** tickets, or miss out on Tatkal bookings due to server queues and payment delays. However, many travelers are unaware that **Indian Railways releases unbooked quota seats (VIP, Senior Citizen, Defence, Emergency) to the public as Current Booking (`CURR_AVBL`) berths approximately 4 hours before train departure (or the night before for morning trains)** at standard base fares with 100% confirmed berth assignments.

Because these released seats vanish within minutes, manually refreshing IRCTC is exhausting and impractical. **SeatScout automates this entire process**:
- It runs a continuous **24/7 background radar** on your desired train or entire route corridor.
- It detects the exact second vacant berths unlock at chart preparation.
- It dispatches **instant audio chimes**, **radiant top-right screen pop-up alerts**, **OS desktop notifications**, **WhatsApp messages via Meta Cloud API**, **SMS via mobile gateways**, and **detailed email dossiers**.
- It provides **1-click direct deep links to IRCTC** so you can book confirmed tickets immediately.

---

## 📖 Table of Contents
1. [About This Project](#-about-this-project)
2. [The Secret of Current Booking (`CURR_AVBL`)](#-the-secret-of-current-booking-curr_avbl)
3. [How It Works: The 4-Step Guide](#-how-it-works-the-4-step-guide)
4. [Top-Right Screen Alerts & Desktop Notifications](#-top-right-screen-alerts--desktop-notifications)
5. [Key Features & What We Built](#-key-features--what-we-built)
6. [Meta WhatsApp Cloud API Integration](#-meta-whatsapp-cloud-api-integration)
7. [Architecture & System Flow](#-architecture--system-flow)
8. [Tech Stack](#-tech-stack)
9. [Getting Started (Local Setup)](#-getting-started-local-setup)
10. [Configuration Guide (.env)](#-configuration-guide-env)
11. [Production Deployment](#-production-deployment)
12. [API Reference](#-api-reference)
13. [Frequently Asked Questions (FAQ)](#-frequently-asked-questions-faq)

---

## 💡 The Secret of Current Booking (`CURR_AVBL`)

<p align="center">
  <img src="public/images/guide_charting_timeline.jpg" alt="IRCTC Current Booking Timeline" width="100%" style="border-radius: 12px;" />
</p>

| Stage | Timing | What Indian Railways Does | How SeatScout Works |
|---|---|---|---|
| **Stage 1: Pre-Charting** | Days before up to 4 hrs before departure | Regular waitlist & Tatkal bookings operate; seats often show WL or Regret. | Register a single train or entire route on the SeatScout 24/7 Radar. |
| **Stage 2: Chart Preparation** | Exactly 4 hrs before departure (or 8:00 PM previous night for morning departures) | Indian Railways PRS finalizes the 1st reservation chart. Leftover quotas (VIP, Defence, Foreign Tourist, Emergency) are pooled. | Radar escalates to high-frequency polling as the charting window approaches. |
| **Stage 3: Current Booking Open** | Chart preparation until 30 min before departure | Vacant berths release as `CURR_AVBL` at normal fare with confirmed coach and berth numbers. | **Instant Multi-Channel Alert**: Radiant top-right screen pop-up, audio chime, desktop notification, WhatsApp & SMS alert! |

---

## 🧭 How It Works: The 4-Step Guide

The application features a built-in step-by-step interactive walkthrough that guides any user from train search to confirmed booking:

```
[ Step 1: Pick Stations ] ──> [ Step 2: Date & Class ] ──> [ Step 3: Start Radar ] ──> [ Step 4: Get Alerted & Book ]
```

### 1. Pick Your Stations
- Search across **9,000+ Indian Railway Stations** with instant autocomplete by station name or code (e.g., `NDLS`, `CDG`, `CSMT`, `HWH`).
- Or tap any popular route shortcut (e.g., *Chandigarh → New Delhi*, *Mumbai CSMT → Pune*, *New Delhi → Lucknow*).

### 2. Choose Date & Class
- Select your travel date from the calendar.
- Choose your booking quota (`General (GN)`, `Tatkal (TQ)`, `Senior Citizen (SS)`, `Ladies (LD)`, or `Divyangjan (HP)`).
- Filter by coach class: **AC Chair Car (CC)**, **AC 3-Tier (3A)**, **AC 2-Tier (2A)**, **Sleeper (SL)**, or **Executive (EC)**.

### 3. Tap "Start Radar"
- Choose between **Single Train Radar** (monitoring one specific train) or **Watch Entire Route** (monitoring all trains running on the corridor on your travel date).
- The 24/7 background worker monitors PRS seat pools continuously without you needing to manually refresh the page.

### 4. Get Alerted & Book
- The second berths unlock:
  - An **auditory chime** rings through your speakers.
  - A **radiant top-right screen pop-up** appears on your display with train details, berth count, and booking links.
  - An **OS-level desktop notification** pops up even if you are working on other browser tabs or desktop applications.
  - Your browser tab title visibly flashes (`🚨 SEATS FOUND! 12012 Shatabdi` ↔ `SeatScout`).
  - Mobile alerts are sent to your verified **WhatsApp** and **SMS**.
- Click **"Book Now on IRCTC"** to launch the official IRCTC portal and secure your seat!

---

## 🔔 Top-Right Screen Alerts & Desktop Notifications

One of the standout features of SeatScout is its **guaranteed visibility system**, ensuring you never miss an alert even if you are multitasking across other websites or desktop applications:

### 1. In-App Radiant Pop-up Card (`InAppNotificationToast.tsx`)
- Positioned in the **top-right corner of the screen** (`fixed top-4 right-4 z-[99999]`), floating above all modals and page content.
- Displays a glowing green animated border, live beacon pulse, exact train name & number, route corridor, class, and confirmed berth count.
- Features one-click action buttons:
  - **⚡ Book on IRCTC**: Direct portal link.
  - **🎯 View Radar**: Automatically switches to the radar view and highlights the train.
  - **🔊 Replay Sound**: Re-triggers the acoustic chime.
- Includes a 20-second countdown bar that **automatically pauses when hovered over with the mouse cursor**.

### 2. OS Desktop System Notifications
- Built using the W3C Web Notification API and `ServiceWorkerRegistration.showNotification()`.
- Configured with `requireInteraction: true`, meaning the notification card **stays pinned in the top-right corner of your operating system display** until you explicitly interact with or dismiss it.
- Configured with `renotify: true`, vibration patterns, and high-resolution icons.

### 3. Flashing Browser Tab Indicator
- When you are working in another browser tab, the SeatScout tab title dynamically alternates (`🚨 (1) SEATS FOUND!` ↔ `⚡ SeatScout`), immediately catching your eye in the tab bar.

### 4. Interactive "Test Pop-up Alert"
- A dedicated **"Test Pop-up Alert"** button is built into the Radar Dashboard, allowing you to test the screen pop-up card, sound chime, and desktop notification at any time.

---

## ✨ Key Features & What We Built

- 🛰️ **24/7 Server-Side Radar Daemon**: Background scheduling engine with persistent state storage (`data/radars.json`) that monitors PRS berth pools independently of client browser sessions.
- ⚡ **Route Corridor Radar**: Ability to monitor all trains operating between two stations simultaneously with a single click.
- 💬 **Official Meta WhatsApp Cloud API**: Direct WhatsApp message dispatch with non-promotional OTP verification and seat release notifications.
- 📱 **Multi-Channel SMS Gateway**: Support for Fast2SMS (India OTP route) and Twilio with mobile number verification.
- 📧 **Long-Form HTML Email Alerts**: Rich email dossiers generated via SMTP (Nodemailer) with station departure schedules and coach types.
- 🛡️ **Self-Healing VAPID Web Push Service**: Automatic Base64URL key validation ensuring 65-byte uncompressed P-256 public keys, with automated fallback key generation to prevent startup errors.
- 🤖 **Gemini AI Charting & Strategy Advisor**: Predicts charting preparation times, analyzes waitlist confirmation probabilities, and recommends Tatkal vs. Current Booking timing.
- 🚉 **National Station Index (9,000+ Stations)**: High-performance searchable dataset covering all IRCTC station codes, junction aliases, and railway zones.
- 🕒 **Live Indian Railways Timetable**: Real-time stoppage schedules, arrival/departure times, and run days.
- 🚄 **Live Train Running Status**: Real-time GPS delay tracking, current station updates, and scheduled vs actual platform information.
- 📱 **PWA & Offline Capability**: Installable as a Progressive Web App on mobile and desktop devices.

---

## 💬 Meta WhatsApp Cloud API Integration

<p align="center">
  <img src="public/images/guide_whatsapp_alert.jpg" alt="WhatsApp & Mobile Alert Delivery" width="100%" style="border-radius: 12px;" />
</p>

SeatScout integrates directly with Meta's official WhatsApp Business Cloud API:

1. **Standardized OTP Templates**: Complies with Meta's non-promotional utility templates:
   ```text
   Your verification code is: *482019*. Valid for 5 minutes. Do not share this code with anyone.
   ```
2. **Instant Delivery**: Sent directly through Meta's high-speed global Graph API (`https://graph.facebook.com/v20.0/...`).
3. **Resilient User Fallbacks**:
   - If an invalid token or network error occurs, SeatScout provides clear diagnostic feedback.
   - Shows an on-screen 6-digit code with a 1-click **"Auto-fill Code"** button for uninterrupted testing.
   - Provides a direct **WhatsApp Click-to-Chat link** (`https://wa.me/91...`) to open the chat window directly.

---

## 🏗️ Architecture & System Flow

```
+-----------------------------------------------------------------------------------+
|                                  USER BROWSER / CLIENT                             |
|  - React 19 Frontend (Vite)                                                       |
|  - In-App Top-Right Toast Card (InAppNotificationToast.tsx)                       |
|  - Web Audio API Sound Synthesizer (Chime Arpeggios)                              |
|  - Service Worker (public/sw.js) for Push & Desktop Notifications                 |
|  - Flashing Tab Title Alert Badge (startTabAlertBadge)                            |
+------------------------------------------+----------------------------------------+
                                           |
                                 REST API & Web Push
                                           |
+------------------------------------------v----------------------------------------+
|                               EXPRESS BACKEND SERVER                              |
|  - server.ts: HTTP Server & Vite Middleware                                       |
|  - radarRouter.ts: Radar Management & VAPID Endpoints                             |
|  - radarScheduler.ts: 24/7 Background Seat Worker (Adaptive Polling)              |
|  - radarStore.ts: Persistent JSON Storage (radars.json & subscriptions)           |
|  - pushService.ts: Web Push Engine with Self-Healing VAPID Keys                   |
|  - metaWhatsappService.ts: Meta Cloud API Integration                             |
|  - smsGatewayService.ts: Fast2SMS & Twilio SMS Dispatch                           |
|  - emailNotificationService.ts: Nodemailer SMTP Dossiers                          |
|  - realIrctcService.ts: PRS Upstream Gateway with Circuit Breakers                 |
+------------------------------------------+----------------------------------------+
                                           |
                    External APIs / Notification Gateways
                                           |
       +--------------------+--------------+---------------+--------------------+
       |                    |                              |                    |
+------v-----+       +------v------+                +------v------+      +------v-----+
|  Meta WA   |       |   Fast2SMS  |                |  Web Push   |      | Google AI  |
|  Cloud API |       |  & Twilio   |                |  Endpoints  |      |   Gemini   |
+------------+       +-------------+                +-------------+      +------------+
```

---

## 🛠️ Tech Stack

- **Frontend**:
  - React 19 (Hooks, Suspense, Error Boundaries)
  - Tailwind CSS v4 (Modern CSS-first styling)
  - Lucide React (Icons)
  - Motion / Canvas Confetti (Celebratory animations)
  - Web Audio API (Multi-frequency pure sine wave chime synthesis)
- **Backend**:
  - Node.js & Express
  - `tsx` TypeScript runtime runner
  - `web-push` (W3C standard push protocol with Base64URL VAPID keys)
  - `nodemailer` (SMTP transport)
  - `esbuild` for production bundling
- **AI & Data Intelligence**:
  - Google Gemini API (`@google/genai`) for charting analysis and booking intelligence
- **APIs & Data Feeds**:
  - Live Indian Railways PRS & CRIS timetable data
  - Meta WhatsApp Business Graph API v20.0
  - Fast2SMS & Twilio SMS gateways

---

## ⚡ Getting Started (Local Setup)

### 1. Clone the Repository
```bash
git clone https://github.com/Nitish-24/SeatScout.git
cd SeatScout
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Populate the required keys (see the configuration guide below).

### 4. Launch the Dev Server
```bash
npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## ⚙️ Configuration Guide (.env)

| Variable | Required | Description | Example |
|---|---|---|---|
| `GEMINI_API_KEY` | Optional | Google Gemini API key for AI charting advice & waitlist prediction. | `AIzaSy...` |
| `APP_URL` | Optional | Application base URL (used for notification links). | `http://localhost:3000` |
| `META_WHATSAPP_TOKEN` | Optional | Meta Graph API bearer access token for WhatsApp notifications. | `EAA...` |
| `META_PHONE_NUMBER_ID` | Optional | WhatsApp Business Account phone number ID from Meta App Dashboard. | `105928372619283` |
| `WHATSAPP_TEMPLATE_NAME` | Optional | Approved Meta template name for OTP messaging. | `otp_verification` |
| `WHATSAPP_TEMPLATE_LANG` | Optional | Language code for WhatsApp template. | `en_US` |
| `FAST2SMS_API_KEY` | Optional | API key for Indian SMS delivery via Fast2SMS. | `f2s_...` |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio account SID for global SMS alerts. | `AC...` |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio authentication token. | `auth_...` |
| `TWILIO_PHONE_NUMBER` | Optional | Registered Twilio phone number. | `+1234567890` |
| `SMTP_HOST` | Optional | SMTP mail host for email dossiers. | `smtp.gmail.com` |
| `SMTP_PORT` | Optional | SMTP mail port (default: 587). | `587` |
| `SMTP_USER` | Optional | SMTP username / email address. | `your_email@gmail.com` |
| `SMTP_PASS` | Optional | SMTP password or app-specific password. | `xxxx xxxx xxxx xxxx` |
| `ALERT_FROM_EMAIL` | Optional | From email address for sent dossiers. | `alerts@seatscout.in` |

*(Note: If optional notification credentials are not provided, SeatScout gracefully logs alerts to the console and displays rich in-app UI notifications without crashing).*

---

## 📦 Production Deployment

### Build the Application
```bash
npm run build
```
This builds the client application with Vite and bundles the Express server into `dist/server.cjs`.

### Start the Production Server
```bash
npm start
```
The server will bind to port `3000` (or `process.env.PORT`).

---

## 📡 API Reference

### Radar Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/radar/list?clientId=...` | List all active and past radars for a client device. |
| `POST` | `/api/radar/create` | Create a new Single Train or Route Corridor radar job. |
| `POST` | `/api/radar/:id/pause` | Pause an active background radar job. |
| `POST` | `/api/radar/:id/resume` | Resume a paused background radar job. |
| `POST` | `/api/radar/:id/stop` | Stop monitoring and mark radar as cancelled. |
| `DELETE` | `/api/radar/:id` | Delete radar job and remove from history. |
| `POST` | `/api/radar/:id/scan` | Force an immediate PRS availability scan for a radar. |
| `GET` | `/api/radar/vapid-public-key` | Return valid 65-byte Base64URL VAPID public key. |
| `POST` | `/api/radar/push/subscribe` | Register browser push subscription for a client device. |
| `POST` | `/api/radar/push/test` | Trigger a test web push notification to client device. |

### Train & Corridor Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trains/search` | Search trains between two IRCTC station codes. |
| `GET` | `/api/trains/availability` | Fetch live berth availability and class status. |
| `GET` | `/api/trains/livestatus` | Real-time train delay, platform number, and live running status. |
| `POST` | `/api/ai/predict-charting` | Gemini AI charting time and Current Booking berth prediction. |

### Phone & Notification Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/notifications/phone/request-otp` | Send verification OTP via WhatsApp or SMS. |
| `POST` | `/api/notifications/phone/verify-otp` | Verify OTP code and register phone number. |
| `POST` | `/api/notifications/phone/send-alert` | Dispatch manual or automated seat alert to phone. |

---

## ❓ Frequently Asked Questions (FAQ)

#### Q: What is `CURR_AVBL`?
**A:** `CURR_AVBL` stands for **Current Booking Available**. When Indian Railways prepares the final reservation chart (~4 hours before departure or 8:00 PM the night before), all unbooked quota seats (VIP, Defence, Senior Citizen, Emergency) are pooled and released to the general public at standard base fares with confirmed coach and berth assignments.

#### Q: Do I need to keep the browser tab open?
**A:** No! The background radar runs 24/7 on the server. Even if your browser is closed, your phone is locked, or your computer is asleep, the server continues scanning PRS seat pools and dispatches WhatsApp, SMS, and Push notifications the second seats appear.

#### Q: How do top-right screen pop-up alerts work when I am on another tab or app?
**A:** When seats unlock, SeatScout triggers an OS-level Web Notification configured with `requireInteraction: true`. This causes the notification to pop up in the top-right corner of your screen (or Action Center) and stay there until you click or dismiss it. In addition, the SeatScout tab title flashes in your browser tab bar.

#### Q: Can I monitor multiple trains on a route at once?
**A:** Yes! Tap **"Watch Entire Route"** on any search result to monitor every single train running on that corridor on your travel date.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
