import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Pause, 
  Play, 
  Square, 
  ExternalLink, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  RotateCcw, 
  Bell, 
  BellRing, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  Train, 
  X,
  Sparkles,
  Search,
  ArrowRight,
  Smartphone
} from 'lucide-react';
import { ServerRadarJob, MonitoredTrainStatus } from '../types';
import { RadarApiService } from '../services/radarApiService';
import { PushNotificationService } from '../services/pushNotification';
import { CLASS_LABELS, QUOTA_DETAILS } from '../data/trainData';
import { playSeatAlertSound } from '../utils/audioAlert';

interface RadarDashboardProps {
  radars: ServerRadarJob[];
  onRefreshRadars: () => void;
  onNavigateToSearch: () => void;
  soundEnabled?: boolean;
  highlightRadarId?: string | null;
  onOpenPhoneModal?: () => void;
}

export const RadarDashboard: React.FC<RadarDashboardProps> = ({
  radars,
  onRefreshRadars,
  onNavigateToSearch,
  soundEnabled = true,
  highlightRadarId = null,
  onOpenPhoneModal
}) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [viewTrainsModalRadar, setViewTrainsModalRadar] = useState<ServerRadarJob | null>(null);
  const [isScanningId, setIsScanningId] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<{ supported: boolean; permission: NotificationPermission; subscribed: boolean }>({
    supported: false,
    permission: 'default',
    subscribed: false
  });
  const [isEnablingPush, setIsEnablingPush] = useState<boolean>(false);
  const [pushToast, setPushToast] = useState<string | null>(null);

  // Check push subscription status on mount
  useEffect(() => {
    PushNotificationService.getStatus().then(setPushStatus);
  }, []);

  const handleEnablePush = async () => {
    setIsEnablingPush(true);
    try {
      const res = await PushNotificationService.enablePushNotifications();
      const status = await PushNotificationService.getStatus();
      setPushStatus(status);
      setPushToast(res.message);
      setTimeout(() => setPushToast(null), 4000);
    } catch (err: any) {
      setPushToast(err?.message || 'Failed to enable push');
      setTimeout(() => setPushToast(null), 4000);
    } finally {
      setIsEnablingPush(false);
    }
  };

  const handleTestPush = async () => {
    const success = await PushNotificationService.sendTestNotification();
    setPushToast(success ? 'Test notification sent! Check your device.' : 'Could not deliver test notification.');
    setTimeout(() => setPushToast(null), 4000);
  };

  // Actions on Radars
  const handleTogglePause = async (radar: ServerRadarJob) => {
    try {
      if (radar.status === 'PAUSED') {
        await RadarApiService.resumeRadar(radar.id);
      } else {
        await RadarApiService.pauseRadar(radar.id);
      }
      onRefreshRadars();
    } catch (err) {
      console.error('Toggle pause error:', err);
    }
  };

  const handleStopRadar = async (id: string) => {
    try {
      await RadarApiService.stopRadar(id);
      onRefreshRadars();
    } catch (err) {
      console.error('Stop radar error:', err);
    }
  };

  const handleDeleteRadar = async (id: string) => {
    try {
      await RadarApiService.deleteRadar(id);
      onRefreshRadars();
    } catch (err) {
      console.error('Delete radar error:', err);
    }
  };

  const handleForceScan = async (id: string) => {
    setIsScanningId(id);
    try {
      await RadarApiService.forceScan(id);
      onRefreshRadars();
    } catch (err) {
      console.error('Force scan error:', err);
    } finally {
      setTimeout(() => setIsScanningId(null), 600);
    }
  };

  const activeRadars = radars.filter((r) => r.status === 'ACTIVE' || r.status === 'PAUSED' || r.status === 'SEAT_FOUND');
  const historyRadars = radars.filter((r) => r.status === 'STOPPED' || r.status === 'EXPIRED');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Push Notification Banner */}
      {pushStatus.supported && (!pushStatus.subscribed || pushStatus.permission !== 'granted') && (
        <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-blue-950/40 border border-blue-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Enable Push Notifications for 24/7 Alerts</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Receive instant mobile and desktop alerts when seats open up — even when your browser is closed.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {onOpenPhoneModal && (
              <button
                type="button"
                onClick={onOpenPhoneModal}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span>SMS Alert via OTP</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleEnablePush}
              disabled={isEnablingPush}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{isEnablingPush ? 'Connecting...' : 'Enable Push Alerts'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Push Toast Notification */}
      {pushToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-blue-500/60 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-semibold animate-fade-in">
          <Bell className="w-4 h-4 text-blue-400" />
          <span>{pushToast}</span>
        </div>
      )}

      {/* Dashboard Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">RADAR</h1>
              <span className="text-[11px] text-slate-400 block font-medium">
                Server-side 24/7 IRCTC Current Booking Monitor
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {pushStatus.subscribed && (
            <button
              type="button"
              onClick={handleTestPush}
              title="Test web push delivery on this device"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border border-slate-700"
            >
              <Bell className="w-3.5 h-3.5 text-blue-400" />
              <span>Test Push</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNavigateToSearch}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search & Watch</span>
          </button>
        </div>
      </div>

      {/* Radar Tabs: ACTIVE RADARS / RADAR HISTORY */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'ACTIVE'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>ACTIVE RADARS</span>
          <span className="px-1.5 py-0.5 rounded-full bg-blue-800/80 text-[10px] font-mono">
            {activeRadars.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'HISTORY'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>RADAR HISTORY</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono">
            {historyRadars.length}
          </span>
        </button>
      </div>

      {/* ACTIVE RADARS TAB CONTENT */}
      {activeTab === 'ACTIVE' && (
        <div className="space-y-4">
          {activeRadars.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Radio className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No Active Radars</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Start a Train Radar from any train card, or select "Watch Entire Route" to continuously hunt for seats across all corridor trains.
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateToSearch}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center space-x-2 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Trains & Start Radar</span>
              </button>
            </div>
          ) : (
            activeRadars.map((radar) => (
              <RadarCard
                key={radar.id}
                radar={radar}
                isHighlighted={radar.id === highlightRadarId}
                isScanning={isScanningId === radar.id}
                onViewTrains={() => setViewTrainsModalRadar(radar)}
                onTogglePause={() => handleTogglePause(radar)}
                onStop={() => handleStopRadar(radar.id)}
                onForceScan={() => handleForceScan(radar.id)}
              />
            ))
          )}
        </div>
      )}

      {/* RADAR HISTORY TAB CONTENT */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          {historyRadars.length === 0 ? (
            <div className="text-center py-14 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 text-slate-400 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-semibold">No previous radar history</p>
            </div>
          ) : (
            historyRadars.map((radar) => (
              <div
                key={radar.id}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 opacity-85 hover:opacity-100 transition-opacity"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {radar.mode === 'ROUTE' ? '🛤 ROUTE RADAR' : '🚆 TRAIN RADAR'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      radar.status === 'EXPIRED' ? 'bg-slate-800 text-slate-400' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {radar.status === 'EXPIRED' ? '⌛ EXPIRED' : '🛑 STOPPED'}
                    </span>
                  </div>

                  <div className="text-sm font-extrabold text-white">
                    {radar.mode === 'TRAIN' ? `${radar.trainNumber} ${radar.trainName}` : `${radar.fromCode} → ${radar.toCode}`}
                  </div>

                  <div className="text-xs text-slate-400 flex items-center space-x-2">
                    <span>{radar.fromCode} → {radar.toCode}</span>
                    <span>•</span>
                    <span>{radar.journeyDate}</span>
                    <span>•</span>
                    <span>{radar.travelClass} · {radar.quota}</span>
                    <span>•</span>
                    <span>Checked {radar.checkCount} times</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteRadar(radar.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* "View Trains" Modal for Route Radar */}
      {viewTrainsModalRadar && (
        <ViewTrainsModal
          radar={viewTrainsModalRadar}
          onClose={() => setViewTrainsModalRadar(null)}
          onRefresh={() => {
            handleForceScan(viewTrainsModalRadar.id);
          }}
        />
      )}

    </div>
  );
};

interface RadarCardProps {
  radar: ServerRadarJob;
  isHighlighted?: boolean;
  isScanning?: boolean;
  onViewTrains: () => void;
  onTogglePause: () => void;
  onStop: () => void;
  onForceScan: () => void;
}

const RadarCard: React.FC<RadarCardProps> = ({
  radar,
  isHighlighted,
  isScanning,
  onViewTrains,
  onTogglePause,
  onStop,
  onForceScan
}) => {
  const [timeAgo, setTimeAgo] = useState<string>('just now');

  useEffect(() => {
    const updateTime = () => {
      if (!radar.lastCheckedAt) {
        setTimeAgo('Checking soon...');
        return;
      }
      const diffSec = Math.max(0, Math.floor((Date.now() - new Date(radar.lastCheckedAt).getTime()) / 1000));
      if (diffSec < 5) setTimeAgo('just now');
      else if (diffSec < 60) setTimeAgo(`${diffSec}s ago`);
      else setTimeAgo(`${Math.floor(diffSec / 60)}m ago`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [radar.lastCheckedAt]);

  const isSeatFound = radar.status === 'SEAT_FOUND';
  const isPaused = radar.status === 'PAUSED';
  const isRoute = radar.mode === 'ROUTE';

  const monitoredCount = radar.monitoredTrains?.length || (isRoute ? 8 : 1);

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        isSeatFound
          ? 'bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10'
          : isPaused
          ? 'bg-slate-900/60 border-slate-800 opacity-80'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md'
      } ${isHighlighted ? 'ring-2 ring-blue-500' : ''}`}
    >
      {/* Top Banner / Type */}
      <div className={`px-4 sm:px-6 py-2.5 flex items-center justify-between border-b ${
        isSeatFound
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          : isPaused
          ? 'bg-slate-950/60 border-slate-800 text-slate-400'
          : 'bg-slate-950/40 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5">
            <span>{isRoute ? '🛤 ROUTE RADAR' : '🚆 TRAIN RADAR'}</span>
          </span>
          <span className="text-slate-600 dark:text-slate-700">•</span>
          <span className="text-[11px] text-slate-400 font-medium">
            {isRoute ? `${monitoredCount} trains monitored` : 'Single train monitor'}
          </span>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center space-x-2">
          {isSeatFound ? (
            <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SEAT AVAILABLE</span>
            </span>
          ) : isPaused ? (
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-bold">
              <Pause className="w-3 h-3" />
              <span>Paused</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>🟢 Monitoring</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-4 sm:p-6 space-y-4">
        
        {/* Core Train/Route Information */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center space-x-2">
              {isRoute ? (
                <span>{radar.fromCode} → {radar.toCode}</span>
              ) : (
                <span>{radar.trainNumber} {radar.trainName}</span>
              )}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-medium">
              {!isRoute && (
                <>
                  <span className="text-slate-300 font-semibold">{radar.fromCode} → {radar.toCode}</span>
                  <span>•</span>
                </>
              )}
              <span className="text-slate-300 font-semibold">{formatDateDisplay(radar.journeyDate)}</span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 font-mono font-bold">
                {radar.travelClass}
              </span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono font-bold">
                {radar.quota}
              </span>
            </div>
          </div>

          <div className="text-right sm:text-right space-y-0.5">
            <div className="text-[11px] text-slate-400 flex items-center justify-end space-x-1">
              <Clock className="w-3 h-3" />
              <span>Last checked: <strong className="text-slate-200">{timeAgo}</strong></span>
            </div>
            <div className="text-[10px] text-slate-400">
              Scanned {radar.checkCount} times · 24/7 backend active
            </div>
          </div>
        </div>

        {/* Found Seat Banner if Available */}
        {isSeatFound && radar.foundSeatInfo && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-black text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Seats Available: {radar.foundSeatInfo.trainNumber} {radar.foundSeatInfo.trainName}</span>
              </div>
              <div className="text-xs text-slate-300">
                Status: <strong className="text-emerald-300 font-bold">{radar.foundSeatInfo.availabilityCode}</strong> ({radar.foundSeatInfo.availableBerths} berths)
              </div>
            </div>
            <a
              href="https://www.irctc.co.in/nget/train-search"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition-all shadow-md shrink-0"
            >
              <span>Book on IRCTC</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Status Message Line */}
        <div className="text-xs text-slate-400 font-mono bg-slate-950/40 rounded-xl px-3 py-2 border border-slate-800/80 flex items-center justify-between">
          <span className="truncate">{radar.lastStatusText || 'Monitoring live train seats...'}</span>
          <button
            type="button"
            onClick={onForceScan}
            disabled={isScanning}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-sans font-bold flex items-center space-x-1 cursor-pointer ml-2 shrink-0"
          >
            <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
            <span>Check Now</span>
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center space-x-2">
            {/* Route Radar: [View Trains] */}
            {isRoute && (
              <button
                type="button"
                onClick={onViewTrains}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Train className="w-3.5 h-3.5" />
                <span>View Trains ({monitoredCount})</span>
              </button>
            )}

            {/* Train Radar: [Open Train] */}
            {!isRoute && (
              <a
                href="https://www.irctc.co.in/nget/train-search"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
              >
                <span>Open Train</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Pause / Resume */}
            <button
              type="button"
              onClick={onTogglePause}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pause</span>
                </>
              )}
            </button>

            {/* Stop Radar */}
            <button
              type="button"
              onClick={onStop}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Stop</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

/**
 * "View Trains" modal for Route Radar:
 * Displays all trains currently being monitored and their latest state:
 * 12006 Kalka Shatabdi | 01:45 -> 06:35 | 🟢 CURRENT AVL 212 [BOOK NOW]
 * 12426 Rajdhani | 🔴 NOT AVAILABLE
 * 12012 Shatabdi | 🟡 CHECKING
 */
interface ViewTrainsModalProps {
  radar: ServerRadarJob;
  onClose: () => void;
  onRefresh: () => void;
}

const ViewTrainsModal: React.FC<ViewTrainsModalProps> = ({ radar, onClose, onRefresh }) => {
  const [trains, setTrains] = useState<MonitoredTrainStatus[]>(radar.monitoredTrains || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadLatest = async () => {
    setIsLoading(true);
    try {
      const res = await RadarApiService.getRadarTrains(radar.id);
      if (res.monitoredTrains) {
        setTrains(res.monitoredTrains);
      }
    } catch (err) {
      console.error('Failed to load radar trains:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLatest();
  }, [radar.id]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">
              Route Radar Monitored Trains
            </div>
            <h2 className="text-base font-extrabold text-white mt-0.5">
              {radar.fromCode} → {radar.toCode} · {formatDateDisplay(radar.journeyDate)} · {radar.travelClass} ({radar.quota})
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                onRefresh();
                loadLatest();
              }}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Refresh all trains now"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Train List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {trains.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Fetching trains on this corridor...
            </div>
          ) : (
            trains.map((t) => {
              const isAvailable = (t.lastStatus === 'AVAILABLE' || t.lastStatus === 'CURR_AVBL') && (t.seatsCount || 0) > 0;
              const isDeparted = t.lastStatus === 'DEPARTED';
              const isChecking = t.lastStatus === 'CHECKING' || !t.lastStatus;

              return (
                <div
                  key={t.trainNumber}
                  className={`p-4 rounded-2xl border transition-all ${
                    isAvailable
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/5'
                      : isDeparted
                      ? 'bg-slate-950/40 border-slate-800/80 opacity-60 text-slate-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-white">
                        {t.trainNumber} {t.trainName}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center space-x-2 font-mono">
                      <span>{t.departureTime}</span>
                      <span>→</span>
                      <span>{t.arrivalTime}</span>
                      {t.duration && <span>({t.duration})</span>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Status Badge */}
                    {isAvailable ? (
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs">
                          🟢 {t.lastStatus === 'CURR_AVBL' ? 'CURRENT AVL' : 'AVAILABLE'} {t.seatsCount}
                        </span>
                        <a
                          href="https://www.irctc.co.in/nget/train-search"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1 shadow-sm"
                        >
                          <span>BOOK NOW</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : isDeparted ? (
                      <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs">
                        ⚪ DEPARTED
                      </span>
                    ) : isChecking ? (
                      <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center space-x-1">
                        <span>🟡 CHECKING</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-xs">
                        🔴 NOT AVAILABLE
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-center">
          <p className="text-[11px] text-slate-400">
            Route Radar monitors all {trains.length} trains in the background and sends a push notification the moment current booking opens.
          </p>
        </div>

      </div>
    </div>
  );
};

function formatDateDisplay(isoDateStr: string): string {
  if (!isoDateStr) return '';
  const parts = isoDateStr.split('-').map(Number);
  if (parts.length === 3) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }
  return isoDateStr;
}
