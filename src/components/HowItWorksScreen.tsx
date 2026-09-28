import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Radio, 
  Bell, 
  MessageCircle, 
  Smartphone, 
  Calendar, 
  MapPin, 
  ExternalLink,
  Volume2,
  Train,
  MousePointer,
  HelpCircle,
  Ticket
} from 'lucide-react';

interface HowItWorksScreenProps {
  onStartWatch: () => void;
}

export const HowItWorksScreen: React.FC<HowItWorksScreenProps> = ({ onStartWatch }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const steps = [
    {
      step: 1,
      title: 'Pick Your Stations',
      shortTitle: '1. Stations',
      description: 'Choose where you want to board the train and where you want to get off.'
    },
    {
      step: 2,
      title: 'Choose Date & Class',
      shortTitle: '2. Date & Class',
      description: 'Select your travel date and preferred coach type (CC, 3AC, Sleeper).'
    },
    {
      step: 3,
      title: 'Tap "Start Radar"',
      shortTitle: '3. Start Radar',
      description: 'Turn on 24/7 background monitoring with a single click. No need to refresh.'
    },
    {
      step: 4,
      title: 'Get Alerted & Book',
      shortTitle: '4. Book Ticket',
      description: 'Hear an instant chime and receive WhatsApp & Email alerts the second seats open!'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 space-y-8 text-slate-100">
      
      {/* Friendly Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick 4-Step Walkthrough</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          How to Use SeatScout
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Follow these 4 simple steps to catch confirmed train seats released at charting (<span className="text-blue-600 dark:text-blue-400 font-mono font-bold">CURR_AVBL</span>).
        </p>
      </div>

      {/* Step Selector Pills with Progress */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {steps.map((s) => {
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step;

          return (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`py-2.5 px-3 rounded-xl text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold'
                  : isDone
                  ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                  isActive
                    ? 'bg-white text-blue-600'
                    : isDone
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.step}
              </div>
              <div className="truncate">
                <div className="text-xs font-extrabold truncate">{s.shortTitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Step Card Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl space-y-6">
        
        {/* Step Title & Plain English Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
              Step {currentStep} of 4
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {steps[currentStep - 1].description}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((c) => Math.max(1, c - 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((c) => Math.min(4, c + 1))}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-sm shadow-blue-600/20"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartWatch}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-sm shadow-emerald-600/20"
              >
                <span>Search Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ================= STEP 1 CUTOUT: PICK STATIONS ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-blue-300 dark:border-blue-900/60 relative space-y-4">
              
              {/* Pointer Callout */}
              <div className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg w-fit animate-bounce">
                <MousePointer className="w-3.5 h-3.5" />
                <span>👉 STEP 1: Enter your From & To stations here</span>
              </div>

              {/* Realistic App Cutout: Station Input Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-500 shadow-md ring-4 ring-blue-500/10">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    From Station
                  </label>
                  <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
                    <Train className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Chandigarh Junction (CDG)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    To Station
                  </label>
                  <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>New Delhi Railway Station (NDLS)</span>
                  </div>
                </div>
              </div>

              {/* Quick Route Buttons Cutout */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Or click any popular route with 1 tap:
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                    Chandigarh → New Delhi
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    Mumbai CSMT → Pune
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    New Delhi → Lucknow
                  </span>
                </div>
              </div>
            </div>

            {/* Easy Words Explanation */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-4 rounded-2xl space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>What to do:</span>
              </div>
              <p>
                Type any city or station name (like <strong>Delhi</strong>, <strong>Mumbai</strong>, <strong>Bengaluru</strong>) or station code (like <strong>NDLS</strong>, <strong>CDG</strong>). The app will automatically show matching stations for you to pick.
              </p>
            </div>
          </div>
        )}

        {/* ================= STEP 2 CUTOUT: CHOOSE DATE & CLASS ================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-blue-300 dark:border-blue-900/60 relative space-y-4">
              
              {/* Pointer Callout */}
              <div className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg w-fit animate-bounce">
                <MousePointer className="w-3.5 h-3.5" />
                <span>👉 STEP 2: Pick your journey date & travel class</span>
              </div>

              {/* Realistic App Cutout: Date & Quota Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-500 shadow-md ring-4 ring-blue-500/10">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Journey Date
                  </label>
                  <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
                    <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Tomorrow (Chart preparation window)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Quota
                  </label>
                  <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
                    <Ticket className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>General Quota (GN)</span>
                  </div>
                </div>
              </div>

              {/* Class Buttons Cutout */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Pick preferred coach:
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs">
                    AC Chair Car (CC)
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                    AC 3-Tier (3A)
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                    Sleeper (SL)
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                    Executive (EC)
                  </span>
                </div>
              </div>
            </div>

            {/* Easy Words Explanation */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-4 rounded-2xl space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>What to do:</span>
              </div>
              <p>
                Click on the calendar to select the day you are traveling. Current booking seats are released during chart preparation — usually <strong>about 4 hours before the train departs</strong> (or the previous night for early morning trains).
              </p>
            </div>
          </div>
        )}

        {/* ================= STEP 3 CUTOUT: TAP START RADAR ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-emerald-300 dark:border-emerald-900/60 relative space-y-4">
              
              {/* Pointer Callout */}
              <div className="flex items-center space-x-2 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg w-fit animate-bounce">
                <MousePointer className="w-3.5 h-3.5" />
                <span>👉 STEP 3: Click 'Start Radar' on your train</span>
              </div>

              {/* Realistic App Cutout: Train Card with Start Radar Button */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-500 shadow-md ring-4 ring-emerald-500/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>12012 · Kalka Shatabdi Express</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                        Shatabdi
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Departs 18:23 (CDG) → 21:55 (NDLS) · 3h 32m
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-bold">
                    WL 42 (Waitlist)
                  </div>
                </div>

                {/* The Big Highlighted Button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Seats currently full? Start the radar:
                  </span>
                  
                  <div className="relative">
                    <button
                      type="button"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/30 flex items-center space-x-2 cursor-pointer transform scale-105"
                    >
                      <Radio className="w-4 h-4 animate-pulse text-white" />
                      <span>Start Radar (24/7 Watch)</span>
                    </button>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                ✓ Radar monitors the train automatically in the background even when your browser is closed.
              </div>
            </div>

            {/* Easy Words Explanation */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-2xl space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>What to do:</span>
              </div>
              <p>
                Find your train from the search list. If seats are in <strong>Waitlist (WL)</strong>, just tap <strong>Start Radar</strong>. SeatScout immediately starts checking Indian Railways in the background without you having to press refresh!
              </p>
            </div>
          </div>
        )}

        {/* ================= STEP 4 CUTOUT: GET ALERTED & BOOK ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-emerald-400 dark:border-emerald-800/80 relative space-y-4">
              
              {/* Pointer Callout */}
              <div className="flex items-center space-x-2 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg w-fit animate-bounce">
                <MousePointer className="w-3.5 h-3.5" />
                <span>👉 STEP 4: When you hear the chime, click 'Book Now'</span>
              </div>

              {/* Realistic App Cutout: Confirmed Seat Alert Banner */}
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/80 dark:to-slate-950 rounded-2xl border-2 border-emerald-500 shadow-xl space-y-3.5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs shadow-xs">
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                      <span>🎉 CURR_AVBL 4 BERTHS CONFIRMED</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Berths Just Released on IRCTC!
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      12012 Kalka Shatabdi · AC Chair Car (CC) · ₹845
                    </p>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 text-[10px] font-bold uppercase">
                    Just Now
                  </span>
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                  >
                    <span>Book Now on IRCTC</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                    <span>Alert also sent to your WhatsApp/SMS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Easy Words Explanation */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-2xl space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>What happens next:</span>
              </div>
              <p>
                The moment Indian Railways releases vacant seats at charting, SeatScout plays an alert chime sound and dispatches an instant notification. Click <strong>Book Now on IRCTC</strong> to secure your ticket before others!
              </p>
            </div>

            {/* Big Launch Action Button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onStartWatch}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition-all inline-flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-102"
              >
                <span>Ready to Try It? Go to Train Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 3 Common Questions in Easy Words */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-center">
          Frequently Asked Questions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
            <div className="font-bold text-xs text-blue-600 dark:text-blue-400">
              What is CURR_AVBL?
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              When Indian Railways prepares the final chart (~4 hours before departure), all leftover VIP and quota seats are given to general passengers at normal fare.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
            <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
              Do I have to keep the screen open?
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              No! The radar runs on the server 24/7. It continues monitoring continuously even if you close your browser or turn off your computer.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
            <div className="font-bold text-xs text-teal-600 dark:text-teal-400">
              How do I get mobile alerts?
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Click the <strong>SMS Alerts</strong> button at the top right of the screen and verify your mobile number. You'll receive instant WhatsApp & SMS notifications.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
