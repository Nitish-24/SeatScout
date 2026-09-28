import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Train, 
  Users, 
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { SeatScoutWatch } from '../types';
import { CLASS_LABELS, QUOTA_DETAILS } from '../data/trainData';

interface SeatAvailableModalProps {
  watch: SeatScoutWatch | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsBooked: (watchId: string) => void;
}

export const SeatAvailableModal: React.FC<SeatAvailableModalProps> = ({
  watch,
  isOpen,
  onClose,
  onMarkAsBooked
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (isOpen && watch) {
      // Trigger festive confetti explosion for the detected seat!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#14b8a6', '#06b6d4', '#f59e0b', '#ec4899']
        });
      } catch (e) {
        console.log('Confetti effect executed');
      }

      // Freshness timer
      setElapsedSeconds(0);
      const interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, watch]);

  if (!isOpen || !watch || !watch.foundSeatInfo) return null;

  const { foundSeatInfo } = watch;
  const classInfo = CLASS_LABELS[watch.travelClass] || { name: watch.travelClass, short: watch.travelClass };
  const quotaInfo = QUOTA_DETAILS[watch.quota] || { name: watch.quota, code: watch.quota };

  const handleCopyBookingDetails = () => {
    const details = `IRCTC Booking Details:
Train: ${foundSeatInfo.trainNumber} - ${foundSeatInfo.trainName}
Route: ${watch.fromStation.name} (${watch.fromStation.code}) to ${watch.toStation.name} (${watch.toStation.code})
Date: ${watch.journeyDate}
Class: ${watch.travelClass} (${classInfo.name})
Quota: ${watch.quota} (${quotaInfo.name})
Passenger: ${watch.passenger?.name || 'N/A'} (${watch.passenger?.gender}, DOB: ${watch.passenger?.dob})
Status: ${foundSeatInfo.availabilityCode} (${foundSeatInfo.availableBerths} Berths Available)`;

    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleBookOnIrctc = () => {
    // Open official IRCTC booking portal
    window.open('https://www.irctc.co.in/nget/train-search', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-emerald-500/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 alert-glow">
        
        {/* Top Excitement Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-6 text-slate-950 text-center overflow-hidden">
          <div className="absolute top-2 right-3">
            <button
              id="close-seat-alert-modal-btn"
              onClick={onClose}
              className="p-1 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-950 text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-2 shadow">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>SeatScout Detected Confirmed Berth</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
            🎉 Seat Available!
          </h2>

          <p className="text-xs sm:text-sm font-semibold text-emerald-950/90 mt-1 max-w-md mx-auto">
            Confirmed availability detected after chart preparation.
          </p>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 space-y-5">
          
          {/* Detected Train Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Train #{foundSeatInfo.trainNumber}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {foundSeatInfo.trainName}
                </h3>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold text-sm border border-emerald-500/40 font-mono-numbers">
                  {foundSeatInfo.availabilityCode}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {foundSeatInfo.availableBerths} berth{foundSeatInfo.availableBerths > 1 ? 's' : ''} vacant
                </p>
              </div>
            </div>

            {/* Route & Date Details */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Journey Corridor</span>
                <span className="font-semibold text-slate-200">
                  {watch.fromStation.name} ({watch.fromStation.code}) → {watch.toStation.name} ({watch.toStation.code})
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Journey Date</span>
                <span className="font-semibold text-slate-200">{watch.journeyDate}</span>
              </div>
            </div>

            {/* Class & Quota Details */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Class of Travel</span>
                <span className="font-semibold text-emerald-300">
                  {classInfo.name} ({watch.travelClass})
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Quota Selected</span>
                <span className="font-semibold text-cyan-300">
                  {quotaInfo.name} ({watch.quota})
                </span>
              </div>
            </div>

            {/* Passenger Eligibility Summary */}
            {watch.passenger && (
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300">
                    {watch.passenger.name} ({watch.passenger.gender}, DOB: {watch.passenger.dob})
                  </span>
                </div>
                {watch.passengerEligibility && (
                  <span className="text-[11px] text-emerald-400 font-bold">
                    Age {watch.passengerEligibility.calculatedAge} on Journey
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Urgency & Freshness Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Current Booking seats fill fast! Open IRCTC now to secure this berth.</span>
            </div>
            <span className="font-mono-numbers text-[11px] bg-amber-500/20 px-2 py-0.5 rounded font-bold shrink-0">
              {elapsedSeconds}s ago
            </span>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-1">
            
            {/* Primary Action Button: Book Now on IRCTC */}
            <button
              id="btn-book-now-irctc"
              onClick={handleBookOnIrctc}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/30 flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.98] transition-all"
            >
              <span>Book Now on IRCTC</span>
              <ExternalLink className="w-5 h-5" />
            </button>

            {/* Secondary: Copy Details */}
            <div className="grid grid-cols-2 gap-3">
              <button
                id="btn-copy-booking-details"
                onClick={handleCopyBookingDetails}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Details!' : 'Copy Passenger Info'}</span>
              </button>

              <button
                id="btn-mark-as-booked"
                onClick={() => {
                  onMarkAsBooked(watch.id);
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-emerald-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Mark as Booked</span>
              </button>
            </div>

          </div>

          {/* Important Reassuring Product Promise & Disclaimer */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">SeatScout monitors and notifies. You complete the booking on IRCTC.</strong>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              SeatScout operates as an independent intelligent monitoring assistant and does not guarantee ticket issuance. All bookings are processed through the official IRCTC portal.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
