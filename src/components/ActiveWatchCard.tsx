import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Pause, 
  Play, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  RotateCw, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Zap, 
  AlertTriangle,
  ArrowRight,
  History,
  Train
} from 'lucide-react';
import { SeatScoutWatch } from '../types';
import { CLASS_LABELS, QUOTA_DETAILS } from '../data/trainData';

interface ActiveWatchCardProps {
  watch: SeatScoutWatch;
  onPauseToggle: (watchId: string) => void;
  onDeleteWatch: (watchId: string) => void;
  onForceCheck: (watchId: string) => void;
  onSimulateSeatAvailable: (watchId: string) => void;
  onOpenSeatAvailableModal: (watch: SeatScoutWatch) => void;
}

export const ActiveWatchCard: React.FC<ActiveWatchCardProps> = ({
  watch,
  onPauseToggle,
  onDeleteWatch,
  onForceCheck,
  onSimulateSeatAvailable,
  onOpenSeatAvailableModal
}) => {
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  // Live "Last checked: X seconds ago" counter
  useEffect(() => {
    const updateTimeAgo = () => {
      if (!watch.lastCheckedAt) {
        setSecondsAgo(0);
        return;
      }
      const diffMs = Date.now() - new Date(watch.lastCheckedAt).getTime();
      setSecondsAgo(Math.max(0, Math.floor(diffMs / 1000)));
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [watch.lastCheckedAt]);

  const classInfo = CLASS_LABELS[watch.travelClass] || { name: watch.travelClass, short: watch.travelClass };
  const quotaInfo = QUOTA_DETAILS[watch.quota] || { name: watch.quota, code: watch.quota };

  const isSeatFound = watch.status === 'seat_found';
  const isPaused = watch.status === 'paused';
  const isMonitoring = watch.status === 'monitoring';

  return (
    <div
      id={`watch-card-${watch.id}`}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isSeatFound
          ? 'bg-gradient-to-b from-amber-50 via-white to-orange-50/40 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 border-amber-500/80 shadow-2xl shadow-amber-500/20 alert-glow'
          : isPaused
          ? 'bg-slate-900/60 border-slate-800 opacity-80'
          : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40 shadow-xl'
      }`}
    >
      {/* Top Banner Status Bar */}
      <div className={`px-4 sm:px-6 py-3 flex items-center justify-between border-b ${
        isSeatFound
          ? 'bg-amber-100/80 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200'
          : isPaused
          ? 'bg-slate-950/60 border-slate-800 text-slate-400'
          : 'bg-slate-950/50 border-slate-800/80 text-emerald-300'
      }`}>
        <div className="flex items-center space-x-2.5">
          {isSeatFound ? (
            <div className="flex items-center space-x-1.5 font-extrabold text-amber-800 dark:text-amber-300 text-sm tracking-wide">
              <span className="w-3 h-3 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping" />
              <span>🎉 SEAT AVAILABLE (CURR_AVBL)</span>
            </div>
          ) : isPaused ? (
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold">
              <Pause className="w-3.5 h-3.5" />
              <span>⏸ Watch Paused</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 font-bold text-xs sm:text-sm text-emerald-400">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span>🟢 Monitoring Journey</span>
            </div>
          )}
        </div>

        {/* Live timer / Heartbeat */}
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-400">
          {!isPaused && (
            <span className="font-mono-numbers">
              Last checked: {secondsAgo}s ago
            </span>
          )}
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-400">
            {watch.checkCount} checks made
          </span>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-5 sm:p-6 space-y-4">
        
        {/* Route & Date Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2.5 text-lg sm:text-xl font-extrabold text-white">
              <span>{watch.fromStation.city}</span>
              <span className="text-emerald-400">→</span>
              <span>{watch.toStation.city}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono font-normal">
                {watch.fromStation.code} - {watch.toStation.code}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-300">
              <span className="font-semibold text-slate-200">
                {watch.journeyDate}
              </span>
              <span className="text-slate-600">•</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
                {classInfo.short} ({classInfo.name})
              </span>
              <span className="text-slate-600">•</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20">
                {quotaInfo.name} ({watch.quota})
              </span>
            </div>
          </div>

          {/* Train Spec */}
          <div className="sm:text-right bg-slate-950/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-slate-800">
            <div className="flex sm:justify-end items-center space-x-1.5 text-xs text-slate-400">
              <Train className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-semibold text-slate-200">{watch.trainNumber === 'ALL' ? 'Any Train on Route' : `Train #${watch.trainNumber}`}</span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[200px]">{watch.trainName}</p>
          </div>
        </div>

        {/* Quota & Passenger Eligibility Badge */}
        {watch.passenger && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-medium text-slate-200">{watch.passenger.name || 'Passenger'}</span>
                <span className="text-slate-400 text-[11px] ml-1.5">
                  ({watch.passenger.gender}, DOB: {watch.passenger.dob})
                </span>
              </div>
            </div>
            
            {watch.passengerEligibility && (
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                watch.passengerEligibility.isEligible
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}>
                {watch.passengerEligibility.isEligible
                  ? `✓ Age ${watch.passengerEligibility.calculatedAge} · Eligible for ${watch.quota}`
                  : `⚠ Age ${watch.passengerEligibility.calculatedAge} · May not meet ${watch.quota} criteria`}
              </span>
            )}
          </div>
        )}

        {/* Seat Available Alert Banner (if found!) */}
        {isSeatFound && watch.foundSeatInfo && (
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-100/90 via-orange-50 to-amber-100/90 dark:from-amber-500/20 dark:via-orange-500/20 dark:to-amber-600/20 border border-amber-400 dark:border-amber-500/60 text-slate-900 dark:text-slate-100 space-y-3 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 bg-amber-200/90 dark:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400 dark:border-amber-500/40">
                  {watch.foundSeatInfo.availabilityCode}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                  {watch.foundSeatInfo.availableBerths} Confirmed Berth{watch.foundSeatInfo.availableBerths > 1 ? 's' : ''} Ready to Book!
                </h4>
                <p className="text-xs text-amber-900 dark:text-amber-100/90 mt-0.5 font-medium">
                  Detected on {watch.foundSeatInfo.trainNumber} {watch.foundSeatInfo.trainName} ({watch.foundSeatInfo.travelClass}, {watch.foundSeatInfo.quota} Quota).
                </p>
              </div>

              <button
                id={`btn-open-seat-modal-${watch.id}`}
                onClick={() => onOpenSeatAvailableModal(watch)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-lg hover:from-amber-400 hover:to-orange-500 transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 text-white-always"
              >
                <span className="text-white-always font-extrabold">View Alert & Book</span>
                <ArrowRight className="w-3.5 h-3.5 text-white-always" />
              </button>
            </div>
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          
          {/* Scout Simulation & Force Check */}
          <div className="flex items-center space-x-2">
            {!isSeatFound && (
              <button
                id={`simulate-seat-alert-${watch.id}`}
                onClick={() => onSimulateSeatAvailable(watch.id)}
                title="Simulate CURR_AVBL detection to test the celebratory alert flow"
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Simulate Seat Found</span>
              </button>
            )}

            <button
              id={`force-check-${watch.id}`}
              onClick={() => onForceCheck(watch.id)}
              title="Force immediate IRCTC check"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowLogs(!showLogs)}
              className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs flex items-center space-x-1 hover:bg-slate-800/60"
            >
              <History className="w-3 h-3" />
              <span>Scout Logs ({watch.pingLogs.length})</span>
              {showLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Pause / Delete Actions */}
          <div className="flex items-center space-x-2">
            <button
              id={`toggle-pause-${watch.id}`}
              onClick={() => onPauseToggle(watch.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                isPaused
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              <span>{isPaused ? 'Resume Scout' : 'Pause'}</span>
            </button>

            <button
              id={`delete-watch-${watch.id}`}
              onClick={() => onDeleteWatch(watch.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Remove Watch"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Expandable Ping Logs / Timeline */}
        {showLogs && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
              <span className="font-semibold uppercase tracking-wider">Live Scout Radar Timeline</span>
              <span>Interval: {watch.checkIntervalSeconds}s</span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {watch.pingLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between text-[11px] py-1 border-b border-slate-900">
                  <div className="flex items-start space-x-2">
                    <span className="font-mono text-slate-500">{log.timestamp}</span>
                    <span className="text-slate-300">{log.statusText}</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-slate-900 text-emerald-400 border border-slate-800">
                    {log.availabilityCode}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
