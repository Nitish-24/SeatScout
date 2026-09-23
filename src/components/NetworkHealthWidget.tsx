import React, { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, Server, Wifi, WifiOff, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { fetchNetworkHealth, NetworkHealthStatus } from '../services/railwayApi';
import { updateGatewayHealth } from '../services/adaptivePollingService';

interface NetworkHealthWidgetProps {
  onManualRecheck?: () => void;
  className?: string;
}

export const NetworkHealthWidget: React.FC<NetworkHealthWidgetProps> = ({
  onManualRecheck,
  className = ''
}) => {
  const [health, setHealth] = useState<NetworkHealthStatus>({
    status: 'connected',
    gateway: 'Indian Railways Network',
    latencyMs: 32,
    timestamp: new Date().toISOString(),
    serverLocation: 'New Delhi Server Center'
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [simulatedState, setSimulatedState] = useState<'auto' | 'connected' | 'retrying' | 'disconnected'>('auto');
  const [lastCheckedSecondsAgo, setLastCheckedSecondsAgo] = useState<number>(0);

  const checkConnectivity = useCallback(async (forcedState?: 'connected' | 'retrying' | 'disconnected') => {
    setIsLoading(true);
    const stateToQuery = forcedState || (simulatedState !== 'auto' ? simulatedState : undefined);
    try {
      const data = await fetchNetworkHealth(stateToQuery);
      setHealth(data);
      updateGatewayHealth(data);
      setLastCheckedSecondsAgo(0);
    } catch {
      const offlineStatus: NetworkHealthStatus = {
        status: 'disconnected',
        gateway: 'Indian Railways Network',
        latencyMs: 0,
        timestamp: new Date().toISOString(),
        message: 'Could not connect to Railway Server'
      };
      setHealth(offlineStatus);
      updateGatewayHealth(offlineStatus);
    } finally {
      setIsLoading(false);
    }
  }, [simulatedState]);

  // Initial check and periodic heartbeat
  useEffect(() => {
    checkConnectivity();
    const interval = setInterval(() => {
      checkConnectivity();
    }, 12000);
    return () => clearInterval(interval);
  }, [checkConnectivity]);

  // Seconds ago timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLastCheckedSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStateOverride = (state: 'auto' | 'connected' | 'retrying' | 'disconnected') => {
    setSimulatedState(state);
    if (state === 'auto') {
      checkConnectivity();
    } else {
      checkConnectivity(state);
    }
  };

  const handlePingNow = () => {
    checkConnectivity();
    if (onManualRecheck) {
      onManualRecheck();
    }
  };

  // Status-specific styling
  const statusConfig = {
    connected: {
      label: 'Connected',
      dotColor: 'bg-emerald-500',
      pingColor: 'bg-emerald-400',
      badgeBg: 'bg-emerald-500/15',
      badgeBorder: 'border-emerald-500/40',
      textColor: 'text-emerald-400',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
    },
    retrying: {
      label: 'Retrying',
      dotColor: 'bg-amber-500',
      pingColor: 'bg-amber-400',
      badgeBg: 'bg-amber-500/15',
      badgeBorder: 'border-amber-500/40',
      textColor: 'text-amber-400',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
    },
    disconnected: {
      label: 'Disconnected',
      dotColor: 'bg-rose-500',
      pingColor: 'bg-rose-400',
      badgeBg: 'bg-rose-500/15',
      badgeBorder: 'border-rose-500/40',
      textColor: 'text-rose-400',
      icon: <WifiOff className="w-3.5 h-3.5 text-rose-400" />
    }
  };

  const currentConfig = statusConfig[health.status] || statusConfig.connected;

  return (
    <div
      id="network-health-widget"
      className={`rounded-2xl border bg-slate-900/90 border-slate-800 p-4 transition-all shadow-md ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Title & Live Indicator */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700/60">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                Network Health
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Indian Railways Server
              </span>
            </div>

            {/* Simple Color-Coded Indicator */}
            <div className="flex items-center space-x-2 mt-1">
              <div
                className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold ${currentConfig.badgeBg} ${currentConfig.badgeBorder} ${currentConfig.textColor}`}
              >
                <span className="relative flex h-2 w-2">
                  {health.status !== 'disconnected' && (
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentConfig.pingColor}`}
                    ></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${currentConfig.dotColor}`}
                  ></span>
                </span>
                <span>{currentConfig.label}</span>
              </div>

              {health.status === 'connected' && (
                <span className="text-[11px] text-slate-400 font-mono">
                  {health.latencyMs}ms response
                </span>
              )}

              {health.status === 'retrying' && (
                <span className="text-[11px] text-amber-300 font-medium animate-pulse">
                  Re-establishing connection...
                </span>
              )}

              {health.status === 'disconnected' && (
                <span className="text-[11px] text-rose-300 font-medium">
                  Connection offline
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions & Simulation pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick test simulation pills */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px]">
            <span className="text-slate-500 px-1 font-medium hidden sm:inline">Simulate:</span>
            <button
              onClick={() => handleStateOverride('connected')}
              title="Test Green Connected state"
              className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                health.status === 'connected' && simulatedState === 'connected'
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
              Green
            </button>
            <button
              onClick={() => handleStateOverride('retrying')}
              title="Test Yellow Retrying state"
              className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                health.status === 'retrying' && simulatedState === 'retrying'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1"></span>
              Yellow
            </button>
            <button
              onClick={() => handleStateOverride('disconnected')}
              title="Test Red Disconnected state"
              className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                health.status === 'disconnected' && simulatedState === 'disconnected'
                  ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mr-1"></span>
              Red
            </button>
            {simulatedState !== 'auto' && (
              <button
                onClick={() => handleStateOverride('auto')}
                className="px-1.5 py-0.5 rounded text-[9px] text-slate-400 hover:text-emerald-300 font-medium underline ml-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Manual Ping Server Button */}
          <button
            onClick={handlePingNow}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Check Indian Railways server response time"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isLoading ? 'Checking...' : 'Check Server'}</span>
          </button>
        </div>

      </div>

      {/* Micro Telemetry Bar */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center space-x-2">
          <Server className="w-3 h-3 text-slate-500" />
          <span>Server: <span className="text-slate-300 font-medium">{health.gateway}</span></span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">{health.serverLocation || 'New Delhi Server Center'}</span>
        </div>
        <div className="text-slate-500">
          Last checked: <span className="text-slate-400 font-mono">{lastCheckedSecondsAgo}s ago</span>
        </div>
      </div>
    </div>
  );
};
