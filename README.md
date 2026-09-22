# SeatScout (IRCTC Current Booking Radar)

> **Smart Current Booking (`CURR_AVBL`) & Tatkal Berth Radar for Indian Railways.**  
> Stop refreshing the IRCTC portal repeatedly — SeatScout watches train charts and PRS berth releases in real time, alerting you the second confirmed seats unlock via Web Push, SMS, and Email.

---

## 🚀 Key Features

- 🛰️ **Automated Seat Radar**: Configurable background polling daemon that monitors PRS berth pools for specific trains, dates, travel classes, and quotas.
- ⚡ **Current Booking (`CURR_AVBL`) Specialist**: Catches post-charting vacant berths released 4 hours before departure (or night before for morning trains).
- 📱 **Multi-Channel Instant Alerts**:
  - **Browser Web Push Notifications** (VAPID / Service Worker standard)
  - **Direct SMS Alerts & OTP Verification** (Twilio, Fast2SMS, Custom HTTP Gateway)
  - **Rich HTML Email Berth Dossiers** (SMTP via Nodemailer)
- 🤖 **Gemini AI Charting & Strategy Advisor**: Predicts exact charting windows, confirmation chances for waitlisted tickets, and recommends Tatkal vs Current Booking strategies.
- 🛡️ **Resilient PRS Gateway with Circuit Breaker**: Connects to live Indian Railways PRS feeds with 3.5s timeout protection and automatic failover.
- 🚉 **Comprehensive National Station Index (9,000+ Stations)**: High-performance searchable dataset covering all IRCTC station codes, junction aliases, and railway zones.
- 🕒 **Live IRCTC Timetables & Corridor Routing**: Direct PRS train timetable synchronization with real stoppage schedules and zero synthetic mock fallbacks.
- 🚄 **Live Train Running Status**: Real-time GPS delay tracking, current station, platform numbers, and scheduled vs actual timings.
- 🎯 **One-Click IRCTC Deep Linking**: Direct button to launch the official IRCTC eTicketing portal pre-filled with your train number, journey date, and route.
- 📱 **Progressive Web App (PWA)**: Installable on Android, iOS, and desktop browsers with offline caching.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS v4, Motion (`motion/react`), Lucide React, Canvas Confetti
- **Backend**: Node.js, Express, `tsx` TypeScript runner, `esbuild` for production bundling
- **AI Engine**: Google Gemini API (`@google/genai`) for charting analysis and booking intelligence
- **Notification Services**:
  - `web-push` (W3C Web Push Protocol with VAPID keys)
  - `nodemailer` (SMTP transport for email dossiers)
  - Fast2SMS & Twilio REST APIs (SMS delivery)
- **Data Source**: Live Indian Railways PRS & CRIS integration with smart gateway circuit breakers

---

## 📋 Prerequisites

- **Node.js**: `v20+` or `v22+` recommended
- **npm**: `v10+`

---

## ⚡ Quick Start (Local Setup)

### 1. Clone the Repository
```bash
git clone https://github.com/Nitish-24/SeatScout.git
cd SeatScout
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example configuration file:
```bash
cp .env.example .env
```

Edit `.env` and configure your credentials (all third-party notification keys are optional for local testing):
```env
# Google Gemini API Key (Required for AI Charting & Booking Advice)
GEMINI_API_KEY="your_gemini_api_key_here"

# Application URL
APP_URL="http://localhost:3000"

# (Optional) SMS Gateway: Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# (Optional) SMS Gateway: Fast2SMS (India OTP Route)
FAST2SMS_API_KEY=

# (Optional) Long-form Email Alerts (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ALERT_FROM_EMAIL=alerts@seatscout.in
```

### 4. Run Development Server
```bash
npm run dev
```

The application will start at:
👉 **`http://localhost:3000`**

---

## 📦 Production Build & Deployment

### Build the Application
```bash
npm run build
```
This runs Vite client-side compilation and uses `esbuild` to bundle `server.ts` into a self-contained CommonJS binary at `dist/server.cjs`.

### Start in Production
```bash
npm start
```

---

## ⚙️ Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `tsx server.ts` | Runs the full-stack app with live reload on port 3000 |
| `npm run build` | `vite build && esbuild ...` | Compiles client and bundles server for production |
| `npm run start` | `node dist/server.cjs` | Runs the compiled production server |
| `npm run lint` | `tsc --noEmit` | Runs TypeScript type checking across the codebase |
| `npm run clean` | `rm -rf dist server.js` | Cleans build artifacts |

---

## 📡 API Architecture Overview

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/trains/search` | Search trains between any two IRCTC station codes |
| `GET` | `/api/trains/availability` | Fetch real-time class availability across consecutive days |
| `GET` | `/api/trains/livestatus` | Real-time train running status, delay in minutes, & platforms |
| `POST` | `/api/ai/predict-charting` | Gemini AI-driven charting time & Current Booking berth prediction |
| `GET` | `/api/trackers` | Retrieve all active background seat radar monitors |
| `POST` | `/api/trackers` | Register a new train watch with SMS/push alert triggers |
| `POST` | `/api/trackers/:id/check-now` | Manually force an instant PRS check for a tracker |
| `DELETE` | `/api/trackers/:id` | Cancel/remove an active background tracker |
| `POST` | `/api/auth/send-otp` | Send an SMS OTP for verified phone alert registration |
| `POST` | `/api/auth/verify-otp` | Verify user phone number with OTP |
| `GET` | `/api/notifications/vapid-public-key` | Fetch VAPID public key for browser push subscriptions |
| `POST` | `/api/notifications/subscribe` | Register a client browser push subscription |

---

## 🔒 Security & Best Practices

- **Server-Side API Proxying**: All third-party secrets (`GEMINI_API_KEY`, Twilio tokens, SMTP passwords) are strictly held on the server and never sent to the browser.
- **Circuit Breakers**: Upstream train PRS endpoints have timeout guards (3.5s) to ensure zero page hangs during Indian Railways CRIS high-traffic peak hours.
- **Port Ingress**: The dev and production servers are hardcoded to bind to `0.0.0.0:3000` for compatibility with container environments and reverse proxies.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
