import React from 'react';
import { Clock, Trash2, Train, ExternalLink, CheckCircle2, Radio } from 'lucide-react';
import { AlertHistoryItem } from '../types';

interface HistoryScreenProps {
  history: AlertHistoryItem[];
  onClearHistory: () => void;
  onCreateWatch: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  onClearHistory,
  onCreateWatch
}) => {
  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alert History</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Log of confirmed Current Booking berths detected by SeatScout.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* History Items */}
      {history.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No Previous Alerts</h3>
            <p className="text-xs text-slate-400">
              When a seat is detected, a timestamped record will appear here.
            </p>
          </div>
          <button
            onClick={onCreateWatch}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all inline-flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Create a Seat Alert</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    CURR_AVBL {item.availableBerths} Berths
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <Train className="w-4 h-4 text-emerald-400" />
                  <span>{item.trainNumber} - {item.trainName}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {item.fromCode} → {item.toCode} · {item.journeyDate} · {item.travelClass} ({item.quota})
                </div>
              </div>

              <a
                href="https://www.irctc.co.in/nget/train-search"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-emerald-300 flex items-center space-x-1 transition-colors shrink-0"
              >
                <span>IRCTC</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
