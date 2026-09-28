import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Sparkles, 
  Train, 
  Calendar, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { AlertHistoryItem } from '../types';

interface AlertHistoryViewProps {
  history: AlertHistoryItem[];
  onClearHistory: () => void;
  onOpenCreateWatch: () => void;
}

export const AlertHistoryView: React.FC<AlertHistoryViewProps> = ({
  history,
  onClearHistory,
  onOpenCreateWatch
}) => {
  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">Alert Detection History</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical log of confirmed Current Booking (<span className="font-mono text-emerald-400">CURR_AVBL</span>) seats detected by your SeatScout watches.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors flex items-center space-x-1.5 self-start"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History List or Empty State */}
      {history.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Previous Alerts Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            When SeatScout detects a confirmed Current Booking seat for your active watches, a timestamped record is preserved here.
          </p>
          <button
            onClick={onOpenCreateWatch}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all inline-flex items-center space-x-1.5"
          >
            <span>Create a Watch</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    CURR_AVBL {item.availableBerths} Berths
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-base font-bold text-white">
                  <Train className="w-4 h-4 text-emerald-400" />
                  <span>{item.trainNumber} - {item.trainName}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>{item.fromCode} → {item.toCode}</span>
                  <span>•</span>
                  <span>Journey: {item.journeyDate}</span>
                  <span>•</span>
                  <span className="text-slate-300 font-semibold">{item.travelClass} ({item.quota} Quota)</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-0 pt-2 sm:pt-0 border-slate-800">
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950 text-emerald-300 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{item.actionTaken === 'booked' ? 'Booked on IRCTC' : 'Alert Delivered'}</span>
                </span>

                <a
                  href="https://www.irctc.co.in/nget/train-search"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-emerald-400 flex items-center space-x-1 transition-colors"
                >
                  <span>IRCTC Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
