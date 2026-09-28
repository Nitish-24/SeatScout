import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Train, 
  Calendar, 
  ShieldCheck, 
  User, 
  ArrowLeft,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { SeatScoutWatch } from '../types';

interface SeatAlertScreenProps {
  watch: SeatScoutWatch;
  onClose: () => void;
  onMarkBooked: (watchId: string) => void;
}

export const SeatAlertScreen: React.FC<SeatAlertScreenProps> = ({
  watch,
  onClose,
  onMarkBooked
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const found = watch.foundSeatInfo;

  const handleCopyPassenger = () => {
    if (!watch.passenger) return;
    const text = `Passenger: ${watch.passenger.name}\nGender: ${watch.passenger.gender}\nDOB: ${watch.passenger.dob}\nQuota: ${watch.quota === 'SS' ? 'Senior Citizen / Lower Berth' : 'General'}\nTrain: ${found?.trainNumber || watch.trainNumber}\nClass: ${watch.travelClass}\nDate: ${watch.journeyDate}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleBookNow = () => {
    window.open('https://www.irctc.co.in/nget/train-search', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 px-4 space-y-6">
      
      {/* Back button */}
      <button
        onClick={onClose}
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Live Radar</span>
      </button>

      {/* Main Alert Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 dark:shadow-emerald-950/50 space-y-6 text-center relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Celebration Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 text-xs font-bold animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Confirmed Current Booking Released</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            🎉 Seat Available!
          </h1>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            Confirmed availability detected on Indian Railways
          </p>
        </div>

        {/* Available Berths Badge */}
        <div className="py-3 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 inline-flex items-center space-x-3">
          <span className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
            {found?.availabilityCode || 'CURR_AVBL 0004'}
          </span>
          <span className="text-xs text-emerald-800 dark:text-emerald-400/90 text-left font-medium">
            {found?.availableBerths || 4} Berths Open for Instant Booking
          </span>
        </div>

        {/* Train & Journey Details */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-left">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div className="flex items-center space-x-2">
              <Train className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="font-bold text-white text-base">
                  {found?.trainNumber || watch.trainNumber} - {found?.trainName || watch.trainName}
                </div>
                <div className="text-xs text-slate-400">
                  {watch.fromStation.city} → {watch.toStation.city}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-white font-mono font-bold text-xs">
              {watch.travelClass}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Journey Date</span>
              <span className="font-bold text-slate-200">{watch.journeyDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Quota</span>
              <span className="font-bold text-emerald-400">
                {watch.quota === 'SS' ? 'Senior Citizen / Lower Berth' : 'General Quota'}
              </span>
            </div>
          </div>

          {watch.passenger && (
            <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">{watch.passenger.name}</span>
                <span className="text-slate-500 text-[11px]">({watch.passenger.gender}, DOB: {watch.passenger.dob})</span>
              </div>
            </div>
          )}
        </div>

        {/* Copy Passenger Info helper */}
        <button
          onClick={handleCopyPassenger}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
          <span>{copied ? 'Passenger Details Copied to Clipboard!' : 'Copy Passenger Details for IRCTC'}</span>
        </button>

        {/* ================= PRIMARY BOOK NOW CTA ================= */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleBookNow}
            id="book-now-irctc-btn"
            className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center space-x-2 cursor-pointer transform hover:-translate-y-0.5"
          >
            <span>Book Now on IRCTC</span>
            <ExternalLink className="w-5 h-5" />
          </button>
          <p className="text-[11px] text-slate-400">
            SeatScout monitors and notifies; you complete the booking securely on the official IRCTC portal.
          </p>
        </div>

        {/* Mark Booked or Return */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            Keep Radar Monitoring
          </button>
          <button
            onClick={() => onMarkBooked(watch.id)}
            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            ✓ Mark as Booked
          </button>
        </div>

      </div>

    </div>
  );
};
