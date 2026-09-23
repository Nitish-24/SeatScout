import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Train, 
  Zap,
  Bell,
  MessageCircle,
  Smartphone,
  Eye,
  Radar,
  HelpCircle,
  Calendar,
  AlertTriangle,
  Info
} from 'lucide-react';

interface HowItWorksScreenProps {
  onStartWatch: () => void;
}

export const HowItWorksScreen: React.FC<HowItWorksScreenProps> = ({ onStartWatch }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'radar' | 'alerts' | 'quotas'>('timeline');
  const [testDepartureHour, setTestDepartureHour] = useState<number>(18); // Default 6:00 PM (18:00)

  // Calculate dynamic charting time based on departure hour
  const getChartingCalculations = (hour: number) => {
    const isMorningTrain = hour >= 0 && hour <= 10;
    let chartTimeText = '';
    let currAvblOpenText = '';
    let explanation = '';

    if (isMorningTrain) {
      chartTimeText = 'Previous Night by 08:00 PM - 09:00 PM';
      currAvblOpenText = 'Previous Night after Charting until departure';
      explanation = 'For morning trains departing between 00:00 and 11:00 AM, Indian Railways prepares charts the previous evening. Current booking opens immediately after!';
    } else {
      const chartHour = Math.max(0, hour - 4);
      const formattedChart = `${String(chartHour).padStart(2, '0')}:00`;
      chartTimeText = `${formattedChart} (${4} hours before departure)`;
      currAvblOpenText = `From ${formattedChart} until 30 mins before train departure`;
      explanation = `For afternoon and evening departures, initial charting is executed precisely 4 hours before the train leaves origin station (${String(hour).padStart(2, '0')}:00).`;
    }

    return { chartTimeText, currAvblOpenText, explanation, isMorningTrain };
  };

  const currentCalc = getChartingCalculations(testDepartureHour);

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-10 text-slate-100">
      
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Radar Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          How SeatScout & Current Booking Work
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Master the mechanics of Indian Railways PRS chart preparation, <span className="text-emerald-400 font-mono font-bold">CURR_AVBL</span> vacant berth releases, and automated multi-channel alert delivery.
        </p>
      </div>

      {/* Interactive Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>1. Charting Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'radar'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Radar className="w-4 h-4" />
          <span>2. Live Radar System</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'alerts'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>3. WhatsApp & SMS Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('quotas')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'quotas'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>4. Quotas & Rules</span>
        </button>
      </div>

      {/* TAB 1: Charting Timeline & Interactive Calculator */}
      {activeTab === 'timeline' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Visual Application Image */}
          <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl relative group">
            <img 
              src="/images/guide_charting_timeline.jpg" 
              alt="IRCTC Current Booking and Charting Timeline Infographic"
              className="w-full h-auto object-cover max-h-[380px]"
            />
            <div className="p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Visual Architecture
                </span>
                <h3 className="text-sm font-bold text-white">
                  3-Stage Indian Railways Current Booking Release Mechanism
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 self-start sm:self-auto font-mono">
                PRS Release Window: ~4 hrs
              </span>
            </div>
          </div>

          {/* Interactive Charting Time Simulator */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Interactive Simulator
                </span>
                <h3 className="text-base font-bold text-white">
                  Calculate Your Train's Exact Charting Window
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                Departure: {String(testDepartureHour).padStart(2, '0')}:00 {testDepartureHour >= 12 ? 'PM' : 'AM'}
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>12:00 AM (Midnight)</span>
                <span>12:00 PM (Noon)</span>
                <span>11:00 PM (Night)</span>
              </div>
              <input
                type="range"
                min={0}
                max={23}
                step={1}
                value={testDepartureHour}
                onChange={(e) => setTestDepartureHour(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
              />
            </div>

            {/* Simulator Output Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">
                  1st Chart Preparation Time
                </span>
                <div className="text-sm font-black text-emerald-300 font-mono">
                  {currentCalc.chartTimeText}
                </div>
                <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                  Train reservations lock and all unbooked special quotas are pooled into general availability.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">
                  Current Booking (CURR_AVBL) Open
                </span>
                <div className="text-sm font-black text-teal-300 font-mono">
                  {currentCalc.currAvblOpenText}
                </div>
                <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                  Confirmed seats unlock at standard base fare with zero Tatkal surcharge!
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-blue-200 text-xs flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{currentCalc.explanation}</span>
            </div>
          </div>

          {/* 3 Core Steps Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-emerald-400 font-black text-sm flex items-center justify-center border border-slate-700">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Initial Reservations Lock</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                4 hours before origin departure, IRCTC locks standard waitlist bookings to calculate coach assignments and prepare the reservation chart.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-teal-400 font-black text-sm flex items-center justify-center border border-slate-700">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Quota Pooling</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Berths reserved for Senior Citizens, VIP, Defence, Foreign Tourist, and Emergency quotas that remain unused are released into one open pool.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Current Booking Release</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Berths show up as <code className="text-emerald-400 font-mono font-bold">CURR_AVBL</code> on IRCTC. Anyone can book with instant 100% confirmed coaches.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: Live Radar Monitoring System */}
      {activeTab === 'radar' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Visual Mockup */}
          <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl relative group">
            <img 
              src="/images/guide_radar_screen.jpg" 
              alt="SeatScout Radar Dashboard Interface"
              className="w-full h-auto object-cover max-h-[380px]"
            />
            <div className="p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Live Radar Architecture
                </span>
                <h3 className="text-sm font-bold text-white">
                  Automated Background Polling & Circuit Breaker Engine
                </h3>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30 self-start sm:self-auto font-mono">
                Continuous Radar Active
              </span>
            </div>
          </div>

          {/* Key Advantages of the Radar */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Radar className="w-5 h-5 text-emerald-400" />
              <span>Why Automated Radar Beats Manual Checking</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>No Page Refreshing Needed</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Instead of staring at your phone and refreshing IRCTC every 60 seconds, SeatScout continuously tracks the train PRS feeds in the background.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Instant Audio Chime & Web Push</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  The exact moment available berths tick from 0 to 1 or more, an audible radar alert sounds and a high-priority push notification is triggered.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>1-Click Pre-Filled IRCTC Launch</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Every alert card includes a direct button opening the official IRCTC portal with train number, journey date, and route pre-selected.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Multi-Train Concurrent Tracking</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Track multiple Rajdhani, Shatabdi, Vande Bharat, or Superfast trains on the same route simultaneously without any quota restrictions.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: WhatsApp & SMS Multi-Channel Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Visual Alert Mockup */}
          <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl relative group">
            <img 
              src="/images/guide_whatsapp_alert.jpg" 
              alt="Instant WhatsApp and Mobile Notification Mockup"
              className="w-full h-auto object-cover max-h-[380px]"
            />
            <div className="p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Mobile Alert Architecture
                </span>
                <h3 className="text-sm font-bold text-white">
                  Meta WhatsApp Business Cloud API & Direct Push
                </h3>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30 self-start sm:self-auto font-mono">
                No Brand Noise · Direct To Phone
              </span>
            </div>
          </div>

          {/* Notification Channels Breakdown */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>Multi-Channel Notification Matrix</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp (Meta API)</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Delivered straight to your WhatsApp. Clean and neutral without any promotional text, giving you the train number, class, and available seat count.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-teal-400 font-bold">
                  <Smartphone className="w-4 h-4" />
                  <span>SMS Mobile Gateway</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Direct SMS sent to your verified Indian mobile number. Ideal for travel situations when mobile data reception is low.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-blue-400 font-bold">
                  <Bell className="w-4 h-4" />
                  <span>Browser Web Push</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Standard W3C VAPID browser notifications delivered instantly on desktop and mobile devices even when the tab is in the background.
                </p>
              </div>
            </div>

            {/* How verification works */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Safe & Verified Phone Registration
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                When you enter your 10-digit mobile number, a 6-digit one-time verification code is generated. Once confirmed, your device is securely activated for automated seat release dispatches.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: Quotas, Senior Citizen & Booking Comparison */}
      {activeTab === 'quotas' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Comparison Table */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Train className="w-5 h-5 text-emerald-400" />
              <span>General vs Tatkal vs Current Booking (CURR_AVBL)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Booking Type</th>
                    <th className="py-3 px-3">Opening Time</th>
                    <th className="py-3 px-3">Extra Surcharge</th>
                    <th className="py-3 px-3">Cancellation Refund</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  <tr className="hover:bg-slate-950/40">
                    <td className="py-3.5 px-3 font-bold text-slate-200">General Booking</td>
                    <td className="py-3.5 px-3 text-slate-300">120 days before journey at 08:00 AM</td>
                    <td className="py-3.5 px-3 text-slate-400">₹0 (Base fare)</td>
                    <td className="py-3.5 px-3 text-emerald-400">Full refund (minus clerkage)</td>
                  </tr>
                  <tr className="hover:bg-slate-950/40">
                    <td className="py-3.5 px-3 font-bold text-amber-300">Tatkal (TQ)</td>
                    <td className="py-3.5 px-3 text-slate-300">1 day prior (10:00 AM AC / 11:00 AM Non-AC)</td>
                    <td className="py-3.5 px-3 text-amber-400 font-bold">+₹100 to ₹500 extra</td>
                    <td className="py-3.5 px-3 text-rose-400 font-bold">Zero refund on confirmed</td>
                  </tr>
                  <tr className="bg-emerald-500/10 hover:bg-emerald-500/15">
                    <td className="py-3.5 px-3 font-extrabold text-emerald-300 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Current Booking</span>
                    </td>
                    <td className="py-3.5 px-3 text-white font-bold">~4 Hours before departure at Charting</td>
                    <td className="py-3.5 px-3 text-emerald-400 font-bold">₹0 or up to 10% discount!</td>
                    <td className="py-3.5 px-3 text-emerald-400">Standard cancellation rules apply</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quota Rules Cards */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Senior Citizen / Lower Berth (SS) Quota Rules</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              When senior citizen or female passenger quotas go unbooked, they directly feed into the Current Booking pool.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-1">Male Passengers</span>
                <span className="text-slate-300">Must be 60 years or older on the journey date, travelling solo. Automatically assigned lower berths if available.</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-teal-400 block mb-1">Female Passengers</span>
                <span className="text-slate-300">Must be 45 years or older on the journey date, travelling solo. Eligible for designated lower berth allocation.</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 text-center space-y-4 shadow-xl">
        <h3 className="text-xl font-black text-white">
          Ready to catch confirmed seats for your upcoming trip?
        </h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          Set up a live radar watch in 10 seconds. Select your train, travel class, and phone number to receive alerts the instant seats unlock.
        </p>
        <div className="pt-2">
          <button
            onClick={onStartWatch}
            className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all inline-flex items-center space-x-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-slate-950" />
            <span>Launch Seat Radar Now →</span>
          </button>
        </div>
      </div>

    </div>
  );
};
