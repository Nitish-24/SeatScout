import React from 'react';
import { 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Train, 
  Zap 
} from 'lucide-react';

interface HowItWorksScreenProps {
  onStartWatch: () => void;
}

export const HowItWorksScreen: React.FC<HowItWorksScreenProps> = ({ onStartWatch }) => {
  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Secret to Last-Minute Confirmed Seats</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          How SeatScout & Current Booking Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Understand why Indian Railways releases confirmed seats after chart preparation.
        </p>
      </div>

      {/* 3 Step Timeline */}
      <div className="space-y-4">
        
        {/* Step 1 */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-sm border border-slate-700">
              1
            </div>
            <h2 className="text-base font-bold text-white">
              1st Chart Preparation (~4 Hours Before Departure)
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed pl-11">
            Indian Railways locks initial bookings 4 hours before the train leaves its origin station. All unbooked special quota berths (Senior Citizen, VIP, Foreign Tourist, Defence) are pooled together.
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-sm border border-slate-700">
              2
            </div>
            <h2 className="text-base font-bold text-white">
              Current Booking Opens as <span className="font-mono text-emerald-400">CURR_AVBL</span>
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed pl-11">
            Remaining pooled berths are released on IRCTC under Current Booking status (<code className="text-emerald-400 font-mono text-[11px]">CURR_AVBL</code>). These seats can be booked directly with 100% confirmed berth allotment at normal or discounted base fare.
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center text-sm">
              3
            </div>
            <h2 className="text-base font-bold text-white">
              SeatScout Alerts You The Second They Appear
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed pl-11">
            Instead of manually refreshing IRCTC every 2 minutes, SeatScout runs continuous radar scans and immediately plays an audio chime and sends a notification so you can grab the berth on IRCTC before anyone else.
          </p>
        </div>

      </div>

      {/* Senior Citizen Quota Rules */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">Senior Citizen / Lower Berth (SS) Quota Rules</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="font-bold text-slate-200 block mb-1">Male Passengers</span>
            <span className="text-slate-400">Must be 60+ years old on the journey date. Travelling solo.</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span className="font-bold text-slate-200 block mb-1">Female Passengers</span>
            <span className="text-slate-400">Must be 45+ years old on the journey date. Travelling solo.</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center pt-2">
        <button
          onClick={onStartWatch}
          className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center space-x-2 cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          <span>Set Up Your Seat Watch Now →</span>
        </button>
      </div>

    </div>
  );
};
