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
  Flame
} from 'lucide-react';
import { SeatScoutWatch, ServerRadarJob, TrainClass, QuotaType } from '../types';
import { CLASS_LABELS, QUOTA_DETAILS } from '../data/trainData';

interface SeatAvailableModalProps {
  watch?: SeatScoutWatch | null;
  radar?: ServerRadarJob | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsBooked?: (id?: string) => void;
}

export const SeatAvailableModal: React.FC<SeatAvailableModalProps> = ({
  watch,
  radar,
  isOpen,
  onClose,
  onMarkAsBooked
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const hasData = Boolean((watch && watch.foundSeatInfo) || (radar && radar.foundSeatInfo));

  useEffect(() => {
    if (isOpen && hasData) {
      // Trigger festive confetti explosion for the detected seat!
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.55 },
          colors: ['#10b981', '#14b8a6', '#06b6d4', '#f59e0b', '#ec4899', '#3b82f6']
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
  }, [isOpen, hasData]);

  if (!isOpen || !hasData) return null;

  // Normalize details from either watch or radar
  const isRouteRadar = Boolean(radar && radar.mode === 'ROUTE');
  const fromCode = watch ? watch.fromStation.code : radar!.fromCode;
  const fromName = watch ? watch.fromStation.name : (radar!.fromName || radar!.fromCode);
  const toCode = watch ? watch.toStation.code : radar!.toCode;
  const toName = watch ? watch.toStation.name : (radar!.toName || radar!.toCode);
  const journeyDate = watch ? watch.journeyDate : radar!.journeyDate;
  const travelClass = (watch ? watch.travelClass : radar!.travelClass) as TrainClass;
  const quota = (watch ? watch.quota : radar!.quota) as QuotaType;

  const foundSeatInfo = watch ? watch.foundSeatInfo! : radar!.foundSeatInfo!;
  const allAvailableTrains = foundSeatInfo.allAvailableTrains || [];

  const classInfo = CLASS_LABELS[travelClass] || { name: travelClass, short: travelClass };
  const quotaInfo = QUOTA_DETAILS[quota] || { name: quota, code: quota };

  const handleCopyBookingDetails = () => {
    let details = '';
    if (isRouteRadar && allAvailableTrains.length > 0) {
      const trainListText = allAvailableTrains
        .map((t) => `• Train ${t.trainNumber} ${t.trainName} | Departs: ${t.departureTime || '--'} | Status: ${t.statusText} (${t.seatsCount} seats)`)
        .join('\n');
      details = `IRCTC Route Radar Booking Alert:
Route: ${fromName} (${fromCode}) → ${toName} (${toCode})
Date: ${journeyDate}
Class: ${travelClass} (${classInfo.name})
Quota: ${quota} (${quotaInfo.name})
Available Trains:
${trainListText}
Book on IRCTC: https://www.irctc.co.in/nget/train-search`;
    } else {
      details = `IRCTC Booking Details:
Train: ${foundSeatInfo.trainNumber} - ${foundSeatInfo.trainName}
Route: ${fromName} (${fromCode}) to ${toName} (${toCode})
Date: ${journeyDate}
Class: ${travelClass} (${classInfo.name})
Quota: ${quota} (${quotaInfo.name})
Passenger: ${watch?.passenger?.name || 'N/A'} (${watch?.passenger?.gender || ''}, DOB: ${watch?.passenger?.dob || ''})
Status: ${foundSeatInfo.availabilityCode} (${foundSeatInfo.availableBerths} Berths Available)
Book on IRCTC: https://www.irctc.co.in/nget/train-search`;
    }

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
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-emerald-500/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 alert-glow max-h-[92vh] flex flex-col">
        
        {/* Top Excitement Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-5 text-slate-950 text-center shrink-0">
          <div className="absolute top-2 right-3">
            <button
              id="close-seat-alert-modal-btn"
              onClick={onClose}
              className="p-1 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-950 text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-2 shadow">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isRouteRadar ? 'Route Radar Confirmed Berths' : 'SeatScout Detected Confirmed Berth'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
            🎉 Seat Available!
          </h2>

          <p className="text-xs sm:text-sm font-semibold text-emerald-950/90 mt-1 max-w-md mx-auto">
            {isRouteRadar && allAvailableTrains.length > 1
              ? `Current Booking berths detected on ${allAvailableTrains.length} trains along your route!`
              : 'Confirmed availability detected after chart preparation.'}
          </p>
        </div>

        {/* Modal Main Body (Scrollable if multiple trains) */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Corridor & Date Summary Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Route</span>
              <span className="font-bold text-slate-200 truncate block">
                {fromCode} → {toCode}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Date</span>
              <span className="font-bold text-slate-200 block">{journeyDate}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Class</span>
              <span className="font-bold text-emerald-400 block">{travelClass} ({classInfo.name})</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Quota</span>
              <span className="font-bold text-cyan-400 block">{quota}</span>
            </div>
          </div>

          {/* Route Radar: Multiple Available Trains List */}
          {isRouteRadar && allAvailableTrains.length > 0 ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                <span>Trains with Available Berths ({allAvailableTrains.length})</span>
                <span className="text-emerald-400 text-[11px] font-mono">🟢 Live Available</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {allAvailableTrains.map((tr) => (
                  <div
                    key={tr.trainNumber}
                    className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Train className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono font-bold text-xs text-emerald-300">
                          {tr.trainNumber}
                        </span>
                        <span className="text-xs font-bold text-white truncate">
                          {tr.trainName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                        {tr.departureTime && <span>Departs: <strong className="text-slate-200">{tr.departureTime}</strong></span>}
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">{tr.statusText}</span>
                      </div>
                    </div>

                    <a
                      href="https://www.irctc.co.in/nget/train-search"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 flex items-center space-x-1 shadow transition-all cursor-pointer"
                    >
                      <span>Book</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Single Train Card */
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

              {/* Passenger info if present */}
              {watch?.passenger && (
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
          )}

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
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-500/30 flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.98] transition-all"
            >
              <span>Book Now on IRCTC</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Secondary: Copy Details + Dismiss */}
            <div className="grid grid-cols-2 gap-3">
              <button
                id="btn-copy-booking-details"
                onClick={handleCopyBookingDetails}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Details!' : 'Copy Alert Details'}</span>
              </button>

              <button
                id="btn-mark-as-booked"
                onClick={() => {
                  if (watch && onMarkAsBooked) {
                    onMarkAsBooked(watch.id);
                  } else if (radar && onMarkAsBooked) {
                    onMarkAsBooked(radar.id);
                  }
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-emerald-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Mark as Handled</span>
              </button>
            </div>

          </div>

          {/* Important Reassuring Product Promise & Disclaimer */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">SeatScout monitors and notifies. You complete the booking on IRCTC.</strong>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              SeatScout operates as an independent intelligent monitoring assistant. All bookings are completed on the official IRCTC portal.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

