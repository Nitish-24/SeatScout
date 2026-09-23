import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Radio, RefreshCw, Sparkles, CheckCircle2, AlertCircle, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import { TrainClass, QuotaType } from '../types';
import { CLASS_LABELS } from '../data/trainData';
import { DayAvailability } from '../utils/ixigoAvailability';
import { fetchLiveAvailabilityDetailed } from '../services/railwayApi';

interface IxigoAvailabilityStripProps {
  trainNumber: string;
  trainName?: string;
  availableClasses?: TrainClass[];
  selectedClass: TrainClass;
  onClassChange?: (cls: TrainClass) => void;
  quota?: QuotaType;
  startDate?: string;
  fromCode?: string;
  toCode?: string;
  initialAvailability?: Record<string, any>;
  onSelectDateForWatch?: (dateStr: string, cls: TrainClass, dayInfo: DayAvailability) => void;
  isWatching?: boolean;
}

export const IxigoAvailabilityStrip: React.FC<IxigoAvailabilityStripProps> = ({
  trainNumber,
  trainName,
  availableClasses = ['CC', 'EC', '3A', '2A'],
  selectedClass,
  onClassChange,
  quota = 'GN',
  startDate,
  fromCode,
  toCode,
  initialAvailability,
  onSelectDateForWatch,
  isWatching = false
}) => {
  // Normalize selected class if 'ANY'
  const effectiveClass = selectedClass === 'ANY' ? (availableClasses[0] || 'CC') : selectedClass;
  const [activeTab, setActiveTab] = useState<TrainClass>(effectiveClass);
  const [serverValidClasses, setServerValidClasses] = useState<TrainClass[] | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isUnavailable, setIsUnavailable] = useState<boolean>(false);
  const [unavailableReason, setUnavailableReason] = useState<string>('');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [refreshSuccess, setRefreshSuccess] = useState<boolean>(false);
  const [classNotice, setClassNotice] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('Official Indian Railways Booking System');
  const [days, setDays] = useState<DayAvailability[]>(() => {
    // Strictly do NOT initialize with dummy generator
    if (initialAvailability && Array.isArray(initialAvailability) && initialAvailability.length > 0) {
      return initialAvailability;
    }
    return [];
  });

  const prevSelectedClassRef = useRef<TrainClass>(selectedClass);
  const lastParamsRef = useRef<string>('');

  // Sync if selectedClass prop changes from parent
  useEffect(() => {
    if (selectedClass !== 'ANY' && selectedClass !== prevSelectedClassRef.current) {
      prevSelectedClassRef.current = selectedClass;
      setActiveTab(selectedClass);
    }
  }, [selectedClass]);

  // Fetch live availability whenever train, class, quota, date, from, or to changes
  useEffect(() => {
    let isCancelled = false;
    const currentParamsKey = `${trainNumber}_${activeTab}_${quota}_${startDate || ''}_${fromCode || ''}_${toCode || ''}`;

    // Skip redundant fetch if identical query was already fulfilled and we have data
    if (lastParamsRef.current === currentParamsKey && days.length > 0) {
      return;
    }

    const loadAvailability = async () => {
      // Avoid full skeleton flash if existing data is already showing to prevent flickering
      if (days.length === 0) {
        setIsLoading(true);
      }
      setIsUnavailable(false);
      setUnavailableReason('');

      try {
        const res = await fetchLiveAvailabilityDetailed(
          trainNumber,
          activeTab,
          quota as QuotaType,
          startDate || new Date().toISOString().split('T')[0],
          fromCode,
          toCode,
          false
        );

        if (isCancelled) return;

        if (res.success && res.availability && res.availability.length > 0) {
          lastParamsRef.current = currentParamsKey;
          setDays(res.availability);
          setIsUnavailable(false);
          setUnavailableReason('');
          setLastRefreshedAt(new Date());
          if (res.source) setDataSource(res.source);
          if (res.validClasses && res.validClasses.length > 0) {
            setServerValidClasses(res.validClasses);
          }
          setClassNotice(res.classWarning || null);
        } else {
          // Reject empty or malformed data packets; reflect Data Unavailable state
          setDays([]);
          setIsUnavailable(true);
          setUnavailableReason(res.error || 'Live availability data is currently unavailable from Indian Railways.');
        }
      } catch (err: any) {
        if (!isCancelled) {
          setDays([]);
          setIsUnavailable(true);
          setUnavailableReason(err?.message || 'Unable to connect to Indian Railways booking servers.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAvailability();

    return () => {
      isCancelled = true;
    };
  }, [trainNumber, activeTab, quota, startDate, fromCode, toCode]);

  const selectedDay = days[selectedDayIdx] || days[0];

  const handleTabClick = (cls: TrainClass) => {
    if (cls === activeTab) return;
    setActiveTab(cls);
    setClassNotice(null);
    if (onClassChange) {
      onClassChange(cls);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshSuccess(false);
    try {
      const res = await fetchLiveAvailabilityDetailed(
        trainNumber,
        activeTab,
        quota as QuotaType,
        startDate || new Date().toISOString().split('T')[0],
        fromCode,
        toCode,
        true // forceRefresh: true forces fresh CRIS PRS query
      );

      if (res.success && res.availability && res.availability.length > 0) {
        setDays(res.availability);
        setIsUnavailable(false);
        setUnavailableReason('');
        setLastRefreshedAt(new Date());
        setRefreshSuccess(true);
        if (res.source) setDataSource(res.source);
        if (res.validClasses && res.validClasses.length > 0) {
          setServerValidClasses(res.validClasses);
        }
        setClassNotice(res.classWarning || null);
        setTimeout(() => setRefreshSuccess(false), 3500);
      } else {
        setDays([]);
        setIsUnavailable(true);
        setUnavailableReason(res.error || 'Live availability data is currently unavailable.');
      }
    } catch (err: any) {
      setDays([]);
      setIsUnavailable(true);
      setUnavailableReason(err?.message || 'Failed to refresh live availability from gateway.');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 300);
    }
  };

  // Determine comprehensive, train-accurate class suite so user can always switch seat classes
  const displayedClasses: TrainClass[] = React.useMemo(() => {
    const set = new Set<TrainClass>();

    // 1. Add all classes known from train schedule props
    if (Array.isArray(availableClasses) && availableClasses.length > 0) {
      availableClasses.forEach((c) => {
        if (c && c !== 'ANY') set.add(c as TrainClass);
      });
    }

    // 2. Add server valid classes if multiple
    if (Array.isArray(serverValidClasses) && serverValidClasses.length > 1) {
      serverValidClasses.forEach((c) => {
        if (c && c !== 'ANY') set.add(c as TrainClass);
      });
    }

    // 3. Always include activeTab
    if (activeTab && activeTab !== 'ANY') {
      set.add(activeTab);
    }

    // 4. If we only have 1 or 0 classes, infer the realistic Indian Railways train class suite
    if (set.size <= 1) {
      const isChairCar = ['CC', 'EC', 'EA'].includes(activeTab) || 
        (availableClasses && availableClasses.some((c) => ['CC', 'EC'].includes(c)));
      const isSecondSittingOnly = activeTab === '2S';

      if (isChairCar) {
        set.add('CC');
        set.add('EC');
      } else if (isSecondSittingOnly) {
        set.add('2S');
        set.add('CC');
      } else {
        // Standard sleeper & AC mail/express train (Sleeper, 3E, 3A, 2A, 1A)
        set.add('SL');
        set.add('3E');
        set.add('3A');
        set.add('2A');
        set.add('1A');
      }
    }

    // Sort priority: SL, 3E, 3A, 2A, 1A, CC, EC, EA, 2S
    const sortPriority: Record<string, number> = {
      'SL': 1,
      '3E': 2,
      '3A': 3,
      '2A': 4,
      '1A': 5,
      'CC': 6,
      'EC': 7,
      'EA': 8,
      '2S': 9
    };

    return Array.from(set).sort((a, b) => (sortPriority[a] || 99) - (sortPriority[b] || 99));
  }, [availableClasses, serverValidClasses, activeTab]);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/90 overflow-hidden shadow-sm space-y-0">
      
      {/* 1. TOP CLASS TABS (Clean light background in light mode, dark in dark mode) */}
      <div className="flex items-center space-x-5 px-4 pt-3 pb-0 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none bg-slate-100 dark:bg-slate-900">
        {displayedClasses.map((cls) => {
          const classKey = cls as TrainClass;
          const isCurrent = activeTab === classKey;
          const labelInfo = CLASS_LABELS[classKey] || { name: classKey, short: classKey };
          const displayLabel = `${labelInfo.name} (${classKey})`;

          return (
            <button
              key={cls}
              type="button"
              onClick={() => handleTabClick(classKey)}
              className={`pb-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer relative ${
                isCurrent
                  ? 'text-slate-950 dark:text-white border-b-2 border-[#f27405] font-black'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border-b-2 border-transparent'
              }`}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>

      {/* Class Notice if auto-switched */}
      {classNotice && (
        <div className="mx-4 mt-2.5 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center space-x-2 text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{classNotice}</span>
        </div>
      )}

      {/* 2. HORIZONTAL MULTI-DAY AVAILABILITY CARDS STRIP */}
      <div className="p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold ${
              isUnavailable
                ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-400'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isUnavailable ? 'bg-amber-500' : 'bg-emerald-600 dark:bg-emerald-400 animate-pulse'}`} />
              <span>{isUnavailable ? 'Availability Refresh Needed' : 'Official IRCTC Live Data'}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              {quota} Quota · Class {activeTab}
            </span>
            {refreshSuccess && (
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/40 flex items-center space-x-1 animate-pulse">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Verified Availability</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {!isUnavailable && days.length > 0 && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline font-medium">
                Updated: {lastRefreshedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-[11px] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold flex items-center space-x-1.5 cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 transition-all disabled:opacity-50 active:scale-95 shadow-xs"
              title="Check latest official seat availability"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-600 dark:text-emerald-300' : 'text-slate-500'}`} />
              <span className="font-semibold">{isRefreshing ? 'Checking Seats...' : 'Refresh Live Data'}</span>
            </button>
          </div>
        </div>

        {/* LOADING SKELETON STATE */}
        {isLoading && days.length === 0 && (
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 min-h-[76px] flex flex-col justify-between animate-pulse">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800/80 rounded" />
                </div>
              ))}
            </div>
            <div className="text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1.5">
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-600 dark:text-emerald-400" />
              <span>Fetching official seat availability across upcoming dates...</span>
            </div>
          </div>
        )}

        {/* DATA UNAVAILABLE STATE */}
        {!isLoading && (isUnavailable || days.length === 0) && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-slate-900/80 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Live Status Temporarily Unavailable</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {unavailableReason && !unavailableReason.includes('Unexpected token') && !unavailableReason.includes('not valid JSON') && !unavailableReason.includes('<!')
                      ? unavailableReason
                      : `Real-time availability could not be refreshed right now for train ${trainNumber} in class ${activeTab} (${quota} quota). Please tap Retry to update.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Retrying...' : 'Retry Live Fetch'}</span>
                </button>
                <a
                  href="https://www.irctc.co.in/nget/train-search"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-all"
                >
                  <span>IRCTC Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Guidance note */}
            <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-950/70 border border-amber-200/60 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Tap "Retry Live Fetch" to query the reservation system again.</span>
              </div>
              {displayedClasses.length > 1 && (
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500">Try other classes:</span>
                  {displayedClasses
                    .filter((c) => c !== activeTab)
                    .map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleTabClick(c as TrainClass)}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px] cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
                      >
                        {c}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VALID MULTI-DAY AVAILABILITY CARDS */}
        {days.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {days.map((day, idx) => {
              const isSelected = idx === selectedDayIdx;
              const isCurrAvbl = day.statusCode === 'CURR_AVBL';
              const isAvbl = day.statusCode === 'AVAILABLE';
              const isWL = day.statusCode === 'WL';
              const isRAC = day.statusCode === 'RAC';
              const isDeparted = day.statusCode === 'DEPARTED' || day.statusText.toUpperCase().includes('DEPARTED');

              const isAvailable = (isCurrAvbl || isAvbl) && !isDeparted;

              const cardTypeClass = isDeparted
                ? 'seat-card-departed'
                : isAvailable
                  ? 'seat-card-avbl'
                  : isWL
                    ? 'seat-card-wl'
                    : isRAC
                      ? 'seat-card-rac'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800';

              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[72px] ${cardTypeClass} ${
                    isSelected ? 'is-selected' : ''
                  }`}
                >
                  {/* Date Header: e.g. "Sat, 29 Aug" */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold tracking-tight seat-date-title">
                      {day.dayLabel}
                    </span>
                    {day.fare && (
                      <span className={`text-[11px] font-bold shrink-0 ${
                        isDeparted 
                          ? 'text-slate-400 dark:text-slate-500'
                          : isAvailable 
                            ? 'seat-fare-avbl' 
                            : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        ₹{day.fare}
                      </span>
                    )}
                  </div>

                  {/* Status Text with Color Hierarchy */}
                  <div className="mt-1.5">
                    {isDeparted ? (
                      <div className="text-xs font-bold tracking-tight whitespace-nowrap seat-text-departed truncate">
                        {day.statusText}
                      </div>
                    ) : isAvailable ? (
                      <div className="text-[11px] sm:text-[11.5px] font-black tracking-tight whitespace-nowrap seat-text-avbl truncate">
                        {day.seatsCount !== undefined && day.seatsCount > 0 && !day.statusText.includes('-')
                          ? `${isCurrAvbl ? 'CURR_AVBL' : 'AVAILABLE'}-${String(day.seatsCount).padStart(4, '0')}`
                          : day.statusText}
                      </div>
                    ) : isWL ? (
                      <div className="text-xs font-black tracking-tight whitespace-nowrap seat-text-wl truncate">
                        {day.statusText}
                      </div>
                    ) : isRAC ? (
                      <div className="text-xs font-black tracking-tight whitespace-nowrap seat-text-rac truncate">
                        {day.statusText}
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap truncate">
                        {day.statusText}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. SELECTED CARD ACTION BAR */}
        {days.length > 0 && selectedDay && (
          <div className="p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs mt-2">
            
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Selected Date & Fare</span>
                <span className="font-black text-slate-900 dark:text-white text-xs">
                  {selectedDay.dayLabel} · ₹{selectedDay.fare}
                </span>
              </div>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Current Status</span>
                {(() => {
                  const isDeparted = selectedDay.statusCode === 'DEPARTED' || selectedDay.statusText.toUpperCase().includes('DEPARTED');
                  const isAvailable = (selectedDay.statusCode === 'CURR_AVBL' || selectedDay.statusCode === 'AVAILABLE') && !isDeparted;
                  const isWL = selectedDay.statusCode === 'WL';
                  const isRAC = selectedDay.statusCode === 'RAC';

                  return (
                    <span className={`font-extrabold flex items-center space-x-1.5 ${
                      isDeparted
                        ? 'seat-text-departed'
                        : isAvailable 
                          ? 'seat-text-avbl' 
                          : isWL 
                            ? 'seat-text-wl' 
                            : isRAC
                              ? 'seat-text-rac'
                              : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {isAvailable && (
                        <span className="w-2 h-2 rounded-full seat-dot-avbl shrink-0" />
                      )}
                      <span>{selectedDay.statusText}</span>
                    </span>
                  );
                })()}
              </div>

              {selectedDay.probability && (
                <>
                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Confirmation Chance</span>
                    <span className="font-bold text-blue-600 dark:text-sky-400 text-xs flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-blue-600 dark:text-sky-400" />
                      <span>{selectedDay.probability}</span>
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Direct IRCTC Booking link */}
              <a
                href="https://www.irctc.co.in/nget/train-search"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <span>Book on IRCTC</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Set Radar / Watch Button */}
              {onSelectDateForWatch && (
                <button
                  type="button"
                  onClick={() => onSelectDateForWatch(selectedDay.dateStr, activeTab, selectedDay)}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer ${
                    isWatching
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/40'
                      : 'bg-[#f27405] hover:bg-[#d96300] text-white'
                  }`}
                >
                  <Radio className={`w-3.5 h-3.5 ${isWatching ? 'animate-pulse text-emerald-200' : ''}`} />
                  <span>{isWatching ? 'Radar Active' : 'Watch with Radar'}</span>
                </button>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

