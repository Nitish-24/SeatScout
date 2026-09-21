import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Pause, 
  Play, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Clock, 
  Train, 
  Ticket, 
  Shield, 
  Zap, 
  Users, 
  Heart,
  Plus,
  Search
} from 'lucide-react';
import { SeatScoutWatch, TrainClass } from '../types';
import { QUOTA_DETAILS, TRAIN_DATABASE } from '../data/trainData';
import { EditWatchModal } from './EditWatchModal';
import { IxigoAvailabilityStrip } from './IxigoAvailabilityStrip';
import { NetworkHealthWidget } from './NetworkHealthWidget';
import { ChartingCountdownWidget } from './ChartingCountdownWidget';
import { fetchLiveTrainRunningStatus, LiveTrainRunningStatus } from '../services/railwayApi';

interface MonitoringScreenProps {
  watches: SeatScoutWatch[];
  activeWatchId: string;
  onSelectWatch: (id: string) => void;
  onForceScan: (id: string) => void;
  onTogglePause: (id: string) => void;
  onDeleteWatch: (id: string) => void;
  onResetWatch: (id: string) => void;
  onMarkBooked: (id: string) => void;
  onCreateNewWatch: () => void;
  onSimulateSeatFound: (id: string) => void;
  onUpdateWatch: (watch: SeatScoutWatch) => void;
}

export const MonitoringScreen: React.FC<MonitoringScreenProps> = ({
  watches,
  activeWatchId,
  onSelectWatch,
  onForceScan,
  onTogglePause,
  onDeleteWatch,
  onResetWatch,
  onMarkBooked,
  onCreateNewWatch,
  onSimulateSeatFound,
  onUpdateWatch
}) => {
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  // Active watch reference
  const currentWatch = watches.find((w) => w.id === activeWatchId) || (watches.length > 0 ? watches[0] : null);

  // Live Train Running Status state
  const [runningStatus, setRunningStatus] = useState<LiveTrainRunningStatus | null>(null);
  const [isLoadingRunningStatus, setIsLoadingRunningStatus] = useState<boolean>(false);

  const loadRunningStatus = async (trainNo?: string, date?: string, forceRefresh = false) => {
    const tNo = trainNo || currentWatch?.trainNumber;
    if (!tNo) return;
    setIsLoadingRunningStatus(true);
    try {
      const status = await fetchLiveTrainRunningStatus(tNo, date || currentWatch?.journeyDate, forceRefresh);
      if (status) {
        setRunningStatus(status);
      }
    } catch (err) {
      console.warn('Live running status error', err);
    } finally {
      setIsLoadingRunningStatus(false);
    }
  };

  useEffect(() => {
    if (currentWatch?.trainNumber) {
      loadRunningStatus(currentWatch.trainNumber, currentWatch.journeyDate);
    }
  }, [currentWatch?.trainNumber, currentWatch?.journeyDate]);

  // Train database entry
  const trainDetail = currentWatch 
    ? TRAIN_DATABASE.find((t) => t.number === currentWatch.trainNumber) || null 
    : null;

  // Auto-updating "Last checked: X seconds ago"
  useEffect(() => {
    if (!currentWatch || !currentWatch.lastCheckedAt) return;

    const updateAgo = () => {
      const diffMs = Date.now() - new Date(currentWatch.lastCheckedAt!).getTime();
      setSecondsAgo(Math.max(0, Math.floor(diffMs / 1000)));
    };

    updateAgo();
    const interval = setInterval(updateAgo, 1000);
    return () => clearInterval(interval);
  }, [currentWatch?.id, currentWatch?.lastCheckedAt]);

  const handleManualScan = (id: string) => {
    setIsScanning(true);
    if (currentWatch?.trainNumber) {
      loadRunningStatus(currentWatch.trainNumber, currentWatch.journeyDate, true);
    }
    onForceScan(id);
    setTimeout(() => {
      setIsScanning(false);
      setSecondsAgo(0);
    }, 500);
  };

  const handleCopyDetails = (watch: SeatScoutWatch) => {
    const quotaName = QUOTA_DETAILS[watch.quota]?.name || watch.quota;
    const text = `IRCTC Live Radar: Train ${watch.trainNumber || 'All Trains'} (${watch.trainName}) | Route: ${watch.fromStation.code} (${watch.fromStation.city}) → ${watch.toStation.code} (${watch.toStation.city}) | Date: ${watch.journeyDate} | Class: ${watch.travelClass === 'ANY' ? 'Any Class' : watch.travelClass} | Quota: ${quotaName}`;

    navigator.clipboard.writeText(text);
    setCopiedId(watch.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // If no radars exist
  if (watches.length === 0 || !currentWatch) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <Radio className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">No Active Radars</h2>
          <p className="text-xs text-slate-400">
            Search for trains to check live seat availability and start a radar for Current Booking berths.
          </p>
        </div>
        <button
          onClick={onCreateNewWatch}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all inline-flex items-center space-x-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Search Trains & Live Availability</span>
        </button>
      </div>
    );
  }

  const isPaused = currentWatch.status === 'paused';
  const isSeatFound = currentWatch.status === 'seat_found';

  const getQuotaIcon = (q: string) => {
    switch (q) {
      case 'TQ': return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'SS': return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      case 'LD': return <Heart className="w-3.5 h-3.5 text-pink-400" />;
      default: return <Users className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-5 sm:py-7 px-4 space-y-5">
      
      {/* Top Header: Multi-Watch Switcher + Search Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          {watches.map((w) => {
            const isSelected = w.id === currentWatch.id;
            return (
              <button
                key={w.id}
                onClick={() => onSelectWatch(w.id)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition-all flex items-center space-x-2 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  w.status === 'seat_found' 
                    ? 'bg-emerald-400 animate-ping' 
                    : w.status === 'paused' 
                      ? 'bg-slate-500' 
                      : 'bg-emerald-500 animate-pulse'
                }`} />
                <span>{w.fromStation.code} → {w.toStation.code}</span>
                <span className="text-[10px] text-slate-500 font-mono">({w.trainNumber})</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          <button
            onClick={onCreateNewWatch}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Trains</span>
          </button>
        </div>
      </div>

      {/* Main Active Radar Card */}
      <div className={`rounded-2xl border transition-all p-4 sm:p-6 space-y-5 ${
        isSeatFound 
          ? 'bg-slate-900 border-emerald-500/80 shadow-2xl shadow-emerald-500/20' 
          : 'bg-slate-900 border-slate-800 shadow-xl shadow-slate-950/40'
      }`}>
        
        {/* Radar Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isSeatFound
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 animate-bounce'
                  : isPaused
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              }`}>
                <Radio className={`w-4 h-4 ${!isPaused && !isSeatFound ? 'animate-pulse' : ''}`} />
              </div>
              {!isPaused && !isSeatFound && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {currentWatch.fromStation.city} ({currentWatch.fromStation.code}) → {currentWatch.toStation.city} ({currentWatch.toStation.code})
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isSeatFound
                    ? 'bg-emerald-500 text-slate-950'
                    : isPaused
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                }`}>
                  {isSeatFound ? 'Seat Found!' : isPaused ? 'Paused' : 'Active Radar'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                <span className="font-semibold text-slate-200">{currentWatch.trainNumber} · {currentWatch.trainName}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{currentWatch.journeyDate}</span>
                <span>•</span>
                <span className="inline-flex items-center space-x-1 text-slate-300">
                  {getQuotaIcon(currentWatch.quota)}
                  <span>{QUOTA_DETAILS[currentWatch.quota]?.name || currentWatch.quota}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1 ml-auto">
            <button
              onClick={() => handleManualScan(currentWatch.id)}
              disabled={isScanning || isPaused}
              title="Force scan now"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={() => onTogglePause(currentWatch.id)}
              title={isPaused ? 'Resume radar' : 'Pause radar'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              title="Edit parameters"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDeleteWatch(currentWatch.id)}
              title="Delete radar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono pl-1.5 border-l border-slate-800">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{isPaused ? 'Paused' : `Updated ${secondsAgo}s ago`}</span>
            </div>
          </div>
        </div>

        {/* Confirmed Berth Alert Notification */}
        {isSeatFound && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-blue-50/70 dark:from-emerald-950/80 dark:to-slate-950 border-2 border-emerald-400 dark:border-emerald-500/60 shadow-xl shadow-emerald-600/10 dark:shadow-emerald-500/10 space-y-3">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-black text-xs shadow-xs text-white-always">
                <span>CURR_AVBL {currentWatch.foundSeatInfo?.availableBerths || 4} BERTHS CONFIRMED</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Berths Released on IRCTC Current Booking!
              </h3>
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Detected at {currentWatch.foundSeatInfo?.detectedAt ? new Date(currentWatch.foundSeatInfo.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'just now'}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <a
                href={currentWatch.foundSeatInfo?.bookingUrl || 'https://www.irctc.co.in/nget/train-search'}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-extrabold text-xs shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer text-white-always"
              >
                <span className="text-white-always font-extrabold">Book Now on IRCTC</span>
                <ExternalLink className="w-4 h-4 text-white-always" />
              </a>

              <button
                onClick={() => handleCopyDetails(currentWatch)}
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
              >
                {copiedId === currentWatch.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-200">Copy Booking Info</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400">
              <button
                onClick={() => onMarkBooked(currentWatch.id)}
                className="hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors flex items-center space-x-1 cursor-pointer font-medium text-emerald-700 dark:text-emerald-400"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Mark as Booked</span>
              </button>

              <button
                onClick={() => onResetWatch(currentWatch.id)}
                className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center space-x-1 cursor-pointer font-medium text-slate-600 dark:text-slate-400"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resume Scanning</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Train Status & Charting Pill */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">
              {runningStatus ? (
                <span>
                  {runningStatus.curStnName || runningStatus.curStn} ·{' '}
                  <span className={runningStatus.totalLateMins <= 5 ? 'text-emerald-400' : 'text-amber-400'}>
                    {runningStatus.totalLateMins <= 0 ? 'On Time' : `${runningStatus.totalLateMins}m late`}
                  </span>
                  {runningStatus.expectedPlatform ? ` · PF ${runningStatus.expectedPlatform}` : ''}
                </span>
              ) : (
                <span>Train running on schedule</span>
              )}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <ChartingCountdownWidget
              compact
              journeyDate={currentWatch.journeyDate}
              departureTime={currentWatch.departureTime || trainDetail?.departureTime || '18:23'}
              trainNumber={currentWatch.trainNumber}
              trainName={currentWatch.trainName}
              fromStationCode={currentWatch.fromStation.code}
            />
          </div>
        </div>

        {/* ================= IXIGO LIVE AVAILABILITY STRIP ================= */}
        <div>
          <IxigoAvailabilityStrip
            trainNumber={currentWatch.trainNumber || '12012'}
            trainName={currentWatch.trainName}
            fromCode={currentWatch.fromStation.code}
            toCode={currentWatch.toStation.code}
            availableClasses={trainDetail?.classes || ['CC', 'EC', '3A', '2A']}
            selectedClass={currentWatch.travelClass}
            quota={currentWatch.quota}
            startDate={currentWatch.journeyDate}
            isWatching={true}
            onClassChange={(newCls) => {
              onUpdateWatch({
                ...currentWatch,
                travelClass: newCls
              });
            }}
          />
        </div>

        {/* Quick Simulator and Help Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowLogs(!showLogs)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>Scout Logs ({currentWatch.pingLogs?.length || 0})</span>
            </button>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Instant alerts trigger the second IRCTC releases Current Booking berths.
            </span>
          </div>

          <button
            onClick={() => {
              setShowLogs(true);
              onSimulateSeatFound(currentWatch.id);
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px] transition-all flex items-center space-x-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Test Alert</span>
          </button>
        </div>

        {/* Expandable Scout Ping Logs */}
        {showLogs && (
          <div className="p-3 rounded-xl bg-slate-950 dark:bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400 font-semibold text-[11px] border-b border-slate-800/60 pb-1.5">
              <span>Real-Time Radar Ping Stream</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {currentWatch.pingLogs?.length || 0} scan{currentWatch.pingLogs?.length === 1 ? '' : 's'} logged
              </span>
            </div>

            {(!currentWatch.pingLogs || currentWatch.pingLogs.length === 0) ? (
              <p className="text-slate-500 text-[11px] py-2 text-center">
                Adaptive monitoring engine is running. Scans and availability status will stream here automatically.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {currentWatch.pingLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-2 rounded-lg border flex flex-wrap items-center justify-between gap-1.5 text-[11px] ${
                      log.availabilityCode === 'CURR_AVBL' || log.availabilityCode === 'AVAILABLE'
                        ? 'bg-emerald-950/40 border-emerald-500/50 shadow-xs'
                        : 'bg-slate-900/80 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-slate-400 text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`font-bold ${
                        log.availabilityCode === 'CURR_AVBL' || log.availabilityCode === 'AVAILABLE'
                          ? 'text-emerald-300'
                          : 'text-slate-200'
                      }`}>
                        {log.statusText}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                        log.availabilityCode === 'CURR_AVBL' || log.availabilityCode === 'AVAILABLE'
                          ? 'bg-emerald-500 text-slate-950 shadow-xs'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {log.availabilityCode}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                      {log.adaptiveIntervalSeconds && (
                        <span className="text-emerald-400 font-semibold">
                          ⚡ {log.adaptiveIntervalSeconds}s
                        </span>
                      )}
                      {log.latencyMs !== undefined && (
                        <span className="text-slate-500">
                          {log.latencyMs}ms
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Edit Watch Modal */}
      <EditWatchModal
        watch={currentWatch}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(updated) => onUpdateWatch(updated)}
      />

    </div>
  );
};
