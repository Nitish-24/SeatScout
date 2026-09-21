import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Ticket
} from 'lucide-react';

interface HeroBannerProps {
  onStartWatch: () => void;
  onOpenRadarGuide: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onStartWatch, onOpenRadarGuide }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 p-6 sm:p-8 md:p-10 mb-8 shadow-2xl">
      {/* Background glow and subtle ambient elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-teal-500/5 rounded-full blur-2xl pointer-events-none -z-0" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        
        {/* Value badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>The Smartest Way to Catch Confirmed Train Berths</span>
        </div>

        {/* Hero headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Stop refreshing IRCTC. <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            SeatScout watches for your seat.
          </span>
        </h1>

        {/* Subtitle / Problem explanation */}
        <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
          Regular ticket Waitlisted? Missed Tatkal? Confirmed seats routinely open up during 
          <span className="text-emerald-400 font-semibold"> Current Booking (`CURR_AVBL`)</span> after chart preparation. 
          SeatScout watches the train 24/7 and instantly pings you when a berth appears.
        </p>

        {/* 4-Step Visual Flow */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-left">
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">1</span>
              <span>Create Watch</span>
            </div>
            <p className="text-[12px] text-slate-400">Specify route, train, class & smart quota.</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold mb-1">
              <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-[10px]">2</span>
              <span>SeatScout Watches</span>
            </div>
            <p className="text-[12px] text-slate-400">Continuous radar checks post-charting window.</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold mb-1">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">3</span>
              <span>Instant Alert</span>
            </div>
            <p className="text-[12px] text-slate-400">Audio chime + push notification the moment CURR_AVBL hits.</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold mb-1">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">4</span>
              <span>Book on IRCTC</span>
            </div>
            <p className="text-[12px] text-slate-400">One-click jump straight to official IRCTC booking.</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            id="hero-start-scout-cta"
            onClick={onStartWatch}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Launch a SeatScout Alert</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="hero-learn-radar-cta"
            onClick={onOpenRadarGuide}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Ticket className="w-4 h-4 text-emerald-400" />
            <span>Why Current Booking Works</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Chart Preparation Monitoring</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Smart Senior Citizen (SS) Quota DOB Verification</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Under-20s Response Time</span>
          </span>
        </div>

      </div>
    </div>
  );
};
