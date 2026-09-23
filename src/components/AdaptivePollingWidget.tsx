import React, { useState } from 'react';
import { 
  Zap, 
  ShieldAlert, 
  Clock, 
  Gauge, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Server,
  Calendar,
  AlertTriangle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { SeatScoutWatch, AdaptivePollingMeta } from '../types';
import { calculateAdaptivePolling, recordNetworkObservation } from '../services/adaptivePollingService';

interface AdaptivePollingWidgetProps {
  watch: SeatScoutWatch;
  onSimulateCondition?: (latencyMs: number, state?: 'connected' | 'retrying' | 'disconnected') => void;
  className?: string;
}

export const AdaptivePollingWidget: React.FC<AdaptivePollingWidgetProps> = ({
  watch,
  onSimulateCondition,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [simulationActive, setSimulationActive] = useState<string | null>(null);

  const adaptive = watch.adaptivePolling || calculateAdaptivePolling(watch);

  // Trigger test simulation scenarios
  const handleSimulate = (type: 'busy' | 'critical' | 'advance' | 'normal') => {
    setSimulationActive(type);
    if (type === 'busy') {
      recordNetworkObservation(340, true);
      if (onSimulateCondition) onSimulateCondition(340, 'connected');
    } else if (type === 'normal') {
      recordNetworkObservation(28, true);
      if (onSimulateCondition) onSimulateCondition(28, 'connected');
    }
  };

  // Status visual themes
  const isCritical = adaptive.urgencyTier === 'critical';
  const isUrgent = adaptive.urgencyTier === 'urgent';
  const isBusy = adaptive.isBackingOff || adaptive.networkTier === 'busy' || adaptive.networkTier === 'degraded';
  const isDisconnected = adaptive.networkTier === 'disconnected';

  let theme = {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-950/20',
    pillBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    pulseColor: 'bg-emerald-400'
  };

  if (isDisconnected) {
    theme = {
      border: 'border-rose-500/40',
      bg: 'bg-rose-950/20',
      pillBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      iconColor: 'text-rose-400',
      pulseColor: 'bg-rose-400'
    };
  } else if (isBusy) {
    theme = {
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/20',
      pillBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      iconColor: 'text-amber-400',
      pulseColor: 'bg-amber-400'
    };
  } else if (isCritical) {
    theme = {
      border: 'border-cyan-500/40 shadow-sm shadow-cyan-500/10',
      bg: 'bg-cyan-950/25',
      pillBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      iconColor: 'text-cyan-400',
      pulseColor: 'bg-cyan-400'
    };
  }

  return (
    <div className={`rounded-xl border ${theme.border} ${theme.bg} p-3 sm:p-3.5 transition-all text-xs ${className}`}>
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center">
            {isBusy ? (
              <ShieldAlert className={`w-4 h-4 ${theme.iconColor}`} />
            ) : isCritical ? (
              <Zap className={`w-4 h-4 ${theme.iconColor} animate-bounce`} />
            ) : isUrgent ? (
              <Zap className={`w-4 h-4 ${theme.iconColor}`} />
            ) : (
              <Activity className={`w-4 h-4 ${theme.iconColor}`} />
            )}
            <span className={`absolute -top-0.5 -right-0.5 flex h-2 w-2`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.pulseColor} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${theme.pulseColor}`} />
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white text-[13px]">
                Adaptive Polling: {adaptive.effectiveIntervalSeconds}s Interval
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${theme.pillBg}`}>
                {isBusy ? 'Backoff Active' : isCritical ? 'Ultra Accuracy' : isUrgent ? 'Accelerated' : 'Balanced'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
              {adaptive.statusReason}
            </p>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center space-x-2 ml-auto">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-semibold flex items-center space-x-1 transition-all cursor-pointer"
          >
            <Gauge className="w-3 h-3 text-emerald-400" />
            <span>{isExpanded ? 'Hide Telemetry' : 'View Breakdown'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expanded Breakdown & Telemetry Panel */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3">
          
          {/* Dual Engine Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Engine 1: Journey Proximity */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. Journey Proximity Engine</span>
                </span>
                <span className="text-emerald-400 font-mono font-bold">
                  {adaptive.proximityMultiplier}x Multiplier
                </span>
              </div>
              <div className="text-white font-bold text-xs">
                {adaptive.urgencyLabel}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Time to departure:</span>
                <span className="font-mono text-slate-200">
                  {adaptive.hoursUntilDeparture > 0 
                    ? `${adaptive.hoursUntilDeparture} hours remaining` 
                    : 'Train Departed'}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
                <div 
                  className={`h-full transition-all duration-500 ${
                    isCritical ? 'bg-cyan-400' : isUrgent ? 'bg-emerald-400' : 'bg-blue-400'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(10, 100 - (adaptive.hoursUntilDeparture / 72) * 100))}%`
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-tight pt-0.5">
                {adaptive.hoursUntilDeparture <= 4 
                  ? '⚡ Maximum frequency active to instantly catch berths released during IRCTC final chart preparation.'
                  : 'Frequency tightens automatically as departure approaches.'}
              </p>
            </div>

            {/* Engine 2: Network & Service Load */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold flex items-center space-x-1">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <span>2. Network & Service Load Engine</span>
                </span>
                <span className={`font-mono font-bold ${isBusy ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {adaptive.networkMultiplier}x Multiplier
                </span>
              </div>
              <div className="text-white font-bold text-xs">
                {adaptive.networkLabel}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Server Response:</span>
                <span className="font-mono text-slate-200">{adaptive.lastResponseLatencyMs || 32}ms</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
                <div 
                  className={`h-full transition-all duration-500 ${
                    isBusy ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(15, ((adaptive.lastResponseLatencyMs || 32) / 400) * 100))}%`
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-tight pt-0.5">
                {isBusy
                  ? '🛡️ Refresh rate adjusted automatically for smooth, reliable monitoring.'
                  : 'Connection is responsive and actively monitoring.'}
              </p>
            </div>
          </div>

          {/* Mathematical Formula Banner */}
          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="text-slate-400 font-mono">Dynamic Formula:</span>
              <span className="font-mono text-slate-400">{adaptive.baseIntervalSeconds}s (Base)</span>
              <span>×</span>
              <span className="font-mono text-emerald-400 font-bold">{adaptive.proximityMultiplier}x (Proximity)</span>
              <span>×</span>
              <span className={`font-mono font-bold ${isBusy ? 'text-amber-400' : 'text-cyan-400'}`}>
                {adaptive.networkMultiplier}x (Service Load)
              </span>
              <span>=</span>
              <span className="font-mono text-white font-black px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                {adaptive.effectiveIntervalSeconds}s Target
              </span>
            </div>

            <div className="text-[10px] text-slate-400">
              Safety bounds: 5s min - 120s max
            </div>
          </div>

          {/* Quick Scenario Simulator Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
            <span className="text-slate-400 font-medium mr-1">Test Conditions:</span>
            
            <button
              type="button"
              onClick={() => handleSimulate('busy')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                simulationActive === 'busy'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/40 hover:text-amber-300'
              }`}
            >
              Simulate Busy Service (340ms Latency → Backoff)
            </button>

            <button
              type="button"
              onClick={() => handleSimulate('normal')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                simulationActive === 'normal'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-emerald-500/40 hover:text-emerald-300'
              }`}
            >
              Simulate Fast & Healthy (28ms Latency)
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
