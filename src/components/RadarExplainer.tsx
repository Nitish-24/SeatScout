import React from 'react';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Train
} from 'lucide-react';

interface RadarExplainerProps {
  onStartWatch: () => void;
}

export const RadarExplainer: React.FC<RadarExplainerProps> = ({ onStartWatch }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>The Secret Opportunity Behind Chart Preparation</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
          Why Current Booking (<span className="text-emerald-400 font-mono">CURR_AVBL</span>) Works
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Understanding the Indian Railways charting lifecycle and how short-lived confirmed seats become available right when people think tickets are sold out.
        </p>
      </div>

      {/* Visual Timeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Phase 1 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="text-lg font-bold text-white">1. The Regular Booking Trap</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Weeks before journey date, high-demand trains like <strong>Chandigarh → New Delhi</strong> fill up quickly. Regular booking enters heavy Waitlist (WL/RAC). Tatkal quota opens 1 day prior, but sells out in seconds.
          </p>
          <div className="p-2.5 rounded-lg bg-slate-950 text-xs text-rose-300/90 border border-rose-500/20 font-mono">
            Status: RLWL#32 / RAC 14 (Unconfirmed)
          </div>
        </div>

        {/* Phase 2 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-3 relative overflow-hidden shadow-lg shadow-emerald-500/10">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="text-lg font-bold text-emerald-300">2. 1st Chart Preparation (~4h Prior)</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            4 hours before train departure, Indian Railways runs computerized chart preparation. Vacant VIP, Emergency, Defence, and Senior Citizen quotas are released to the public as <strong>Current Booking (`CURR_AVBL`)</strong>.
          </p>
          <div className="p-2.5 rounded-lg bg-emerald-950/60 text-xs text-emerald-300 border border-emerald-500/30 font-mono">
            Status: CURR_AVBL 0004 (Confirmed!)
          </div>
        </div>

        {/* Phase 3 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="text-lg font-bold text-white">3. SeatScout Bridges the Gap</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            These seats can appear at 7:34 PM and vanish by 7:38 PM. Humans cannot sit refreshing IRCTC every 30 seconds. <strong>SeatScout watches continuously</strong> and pings your phone the exact second a berth opens.
          </p>
          <div className="p-2.5 rounded-lg bg-cyan-950/60 text-xs text-cyan-300 border border-cyan-500/20 font-mono">
            Radar: Instant Chime + Push Sent
          </div>
        </div>

      </div>

      {/* Deep-Dive Route Insights: Chandigarh to New Delhi */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Case Study: Chandigarh ↔ New Delhi Express Corridor</h3>
            <p className="text-xs text-slate-400">Charting schedules and high-probability Current Booking windows</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">12012 Kalka Shatabdi Express</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[11px] font-mono">18:23 Dep (CDG)</span>
            </div>
            <p className="text-slate-400">
              Departs Chandigarh at 18:23. 1st Chart is prepared between <strong>14:15 - 14:30</strong>. Current booking remains open until 17:50 (or 2nd chart).
            </p>
            <div className="text-teal-400 font-semibold text-[11px]">
              ⭐ Prime Current Booking Window: 14:30 to 16:30
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">12006 Kalka Shatabdi Express</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[11px] font-mono">06:53 Dep (CDG)</span>
            </div>
            <p className="text-slate-400">
              Early morning departure. 1st Chart is prepared the previous evening at <strong>20:00 - 21:00</strong>. Remaining Senior Citizen quotas open overnight.
            </p>
            <div className="text-teal-400 font-semibold text-[11px]">
              ⭐ Prime Current Booking Window: 21:00 to 06:00
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Ready to let SeatScout keep watch for your journey?
          </div>
          <button
            onClick={onStartWatch}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Create a Watch on This Corridor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
