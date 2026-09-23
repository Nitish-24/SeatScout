import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Zap, CheckCircle2, Info, ArrowRight, ShieldCheck } from 'lucide-react';
import { getChartingCountdown, ChartingCountdownResult } from '../utils/chartingTime';

interface ChartingCountdownWidgetProps {
  journeyDate: string;
  departureTime?: string;
  trainNumber?: string;
  trainName?: string;
  fromStationCode?: string;
  compact?: boolean;
}

export const ChartingCountdownWidget: React.FC<ChartingCountdownWidgetProps> = ({
  journeyDate,
  departureTime,
  trainNumber,
  trainName,
  fromStationCode,
  compact = false
}) => {
  const [countdown, setCountdown] = useState<ChartingCountdownResult>(() =>
    getChartingCountdown(journeyDate, departureTime)
  );
  const [showInfo, setShowInfo] = useState<boolean>(false);

  // Live second-by-second countdown ticker
  useEffect(() => {
    // Initial evaluation
    setCountdown(getChartingCountdown(journeyDate, departureTime));

    const interval = setInterval(() => {
      setCountdown(getChartingCountdown(journeyDate, departureTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [journeyDate, departureTime]);

  // Compact layout (used in small cards or table rows)
  if (compact) {
    if (countdown.status === 'CURRENT_BOOKING_LIVE') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 text-[11px] font-bold shadow-xs">
          <Zap className="w-3.5 h-3.5 animate-pulse text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Chart Ready • {countdown.formattedCountdown}</span>
        </span>
      );
    }

    if (countdown.status === 'DEPARTED') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[11px] font-medium shadow-xs">
          <span>Departed</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-500/40 text-[11px] font-mono font-bold shadow-xs">
        <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
        <span>Chart in {countdown.formattedCountdown}</span>
      </span>
    );
  }

  // Full detailed card layout
  return (
    <div
      id="estimated-charting-countdown-widget"
      className={`rounded-2xl border p-4 sm:p-5 transition-all ${
        countdown.status === 'CURRENT_BOOKING_LIVE'
          ? 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-500/50 shadow-sm'
          : countdown.status === 'DEPARTED'
          ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              countdown.status === 'CURRENT_BOOKING_LIVE'
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40'
                : 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30'
            }`}
          >
            {countdown.status === 'CURRENT_BOOKING_LIVE' ? (
              <Zap className="w-4 h-4 animate-bounce" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Estimated Charting Time
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                  countdown.status === 'CURRENT_BOOKING_LIVE'
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : countdown.status === 'DEPARTED'
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                    : 'bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-500/40'
                }`}
              >
                {countdown.status === 'CURRENT_BOOKING_LIVE'
                  ? 'Chart Ready • Current Booking Live'
                  : countdown.status === 'DEPARTED'
                  ? 'Departed'
                  : 'Countdown Active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Official Indian Railways chart preparation timetable
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="text-xs text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-cyan-300 flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
          title="How IRCTC Charting Time is calculated"
        >
          <Info className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">How it works</span>
        </button>
      </div>

      {/* Heuristic Explainer Drawer */}
      {showInfo && (
        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 animate-in fade-in duration-150">
          <div className="font-semibold text-sky-700 dark:text-cyan-300 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Indian Railways Chart Preparation Rules:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
            <li>
              <strong className="text-slate-900 dark:text-slate-200">Trains departing between 00:01 & 14:00:</strong> 1st chart is prepared at <strong className="text-emerald-700 dark:text-emerald-400">20:00 (8:00 PM)</strong> the previous evening.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-200">Trains departing after 14:00:</strong> 1st chart is prepared <strong className="text-emerald-700 dark:text-emerald-400">4 hours prior to departure</strong>.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-200">Current Booking window:</strong> Immediately after the 1st chart is released, unbooked & canceled quotas convert to <em>Current Booking</em> until the 2nd chart (~30 mins before dep).
            </li>
          </ul>
        </div>
      )}

      {/* Main Countdown Display */}
      <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Countdown digits */}
        <div className="md:col-span-7 space-y-1.5">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {countdown.status === 'CURRENT_BOOKING_LIVE'
              ? 'Current Booking active! Train departs in:'
              : countdown.status === 'DEPARTED'
              ? 'Train has departed:'
              : 'Estimated time until 1st Chart release:'}
          </div>

          <div className="flex items-baseline space-x-2">
            {countdown.status === 'DEPARTED' ? (
              <span className="text-xl font-bold text-slate-600 dark:text-slate-400">Journey Completed / Departed</span>
            ) : (
              <div className="flex items-center space-x-1.5 font-mono">
                {countdown.days > 0 && (
                  <div className="flex items-baseline space-x-0.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {countdown.days}
                    </span>
                    <span className="text-xs text-slate-500 font-sans font-bold mr-1.5">d</span>
                  </div>
                )}
                <div className="flex items-baseline space-x-0.5">
                  <span
                    className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                      countdown.status === 'CURRENT_BOOKING_LIVE'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-sky-700 dark:text-cyan-300'
                    }`}
                  >
                    {String(countdown.hours).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-slate-500 font-sans font-bold">h</span>
                </div>
                <span className="text-xl font-bold text-slate-400 dark:text-slate-600">:</span>
                <div className="flex items-baseline space-x-0.5">
                  <span
                    className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                      countdown.status === 'CURRENT_BOOKING_LIVE'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-sky-700 dark:text-cyan-300'
                    }`}
                  >
                    {String(countdown.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-slate-500 font-sans font-bold">m</span>
                </div>
                <span className="text-xl font-bold text-slate-400 dark:text-slate-600">:</span>
                <div className="flex items-baseline space-x-0.5">
                  <span
                    className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                      countdown.status === 'CURRENT_BOOKING_LIVE'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-sky-700 dark:text-cyan-400'
                    }`}
                  >
                    {String(countdown.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-slate-500 font-sans font-bold">s</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-0.5 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-cyan-400"></span>
            <span>{countdown.heuristicExplanation}</span>
          </div>
        </div>

        {/* Milestone Schedule Chips */}
        <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950/80 rounded-xl p-3 border border-slate-200 dark:border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Target Charting:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              {countdown.chartTimeFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Train Departure:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              {countdown.departureFormatted} {fromStationCode ? `(${fromStationCode})` : ''}
            </span>
          </div>

          {/* Mini progress bar */}
          <div className="pt-1 space-y-1">
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  countdown.status === 'CURRENT_BOOKING_LIVE'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-blue-600 to-sky-400'
                }`}
                style={{ width: `${Math.max(5, countdown.progressPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Chart Pending</span>
              <span>1st Chart</span>
              <span>Departure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
