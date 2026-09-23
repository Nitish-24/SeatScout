import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Users,
  Search,
  RefreshCw,
  ChevronDown,
  Radio,
  Train,
  AlertCircle
} from 'lucide-react';
import { 
  Station, 
  TrainClass, 
  QuotaType, 
  SeatScoutWatch, 
  TrainSchedule,
  ServerRadarJob
} from '../types';
import { POPULAR_STATIONS, POPULAR_ROUTES } from '../data/trainData';
import { DatePickerCalendar, formatDateISO } from './DatePickerCalendar';
import { IxigoAvailabilityStrip } from './IxigoAvailabilityStrip';
import { ChartingCountdownWidget } from './ChartingCountdownWidget';
import { calculateEstimatedChartingTime } from '../utils/chartingTime';
import { fetchLiveTrains } from '../services/railwayApi';
import { TrainSortAndFilterBar } from './TrainSortAndFilterBar';
import { StationAutocomplete } from './StationAutocomplete';
import { getCachedStation } from '../services/stationService';
import { RadarApiService } from '../services/radarApiService';
import { PushNotificationService } from '../services/pushNotification';
import {
  TimeSlotId,
  TimeSlotTarget,
  SortOptionId,
  filterAndSortTrains
} from '../utils/trainFilterUtils';

interface CreateWatchScreenProps {
  onStartWatch: (watch: SeatScoutWatch) => void;
  onViewActiveWatch?: () => void;
  hasActiveWatches?: boolean;
  activeRadars?: ServerRadarJob[];
  onRefreshRadars?: () => void;
}

export const CreateWatchScreen: React.FC<CreateWatchScreenProps> = ({
  onStartWatch,
  onViewActiveWatch,
  hasActiveWatches,
  activeRadars = [],
  onRefreshRadars
}) => {
  // Dynamic initial date: Tomorrow
  const defaultJourneyDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDateISO(d);
  }, []);

  // Form State
  const [fromStationCode, setFromStationCode] = useState<string>('CDG');
  const [toStationCode, setToStationCode] = useState<string>('NDLS');
  const [journeyDate, setJourneyDate] = useState<string>(defaultJourneyDate);
  const [quota, setQuota] = useState<QuotaType>('GN');
  const [trainQuery, setTrainQuery] = useState<string>('');
  const [isLoadingTrains, setIsLoadingTrains] = useState<boolean>(true);
  const [trainsList, setTrainsList] = useState<TrainSchedule[]>([]);
  const [trainSelectedClasses, setTrainSelectedClasses] = useState<Record<string, TrainClass>>({});

  // Sort & Time Category Filter States
  const [selectedSlots, setSelectedSlots] = useState<TimeSlotId[]>([]);
  const [slotTarget, setSlotTarget] = useState<TimeSlotTarget>('departure');
  const [sortBy, setSortBy] = useState<SortOptionId>('departure_asc');

  const handleToggleSlot = (slot: TimeSlotId) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleSelectAllSlots = () => {
    setSelectedSlots([]);
  };

  // Filtered and Sorted Trains
  const filteredTrains = useMemo(() => {
    return filterAndSortTrains(trainsList, {
      selectedSlots,
      slotTarget,
      sortBy,
      searchQuery: trainQuery
    });
  }, [trainsList, selectedSlots, slotTarget, sortBy, trainQuery]);

  // Station lookups across all 9,000+ Indian Railway stations
  const fromStation = getCachedStation(fromStationCode) || POPULAR_STATIONS.find((s) => s.code === fromStationCode) || {
    code: fromStationCode,
    name: `${fromStationCode} Station`,
    city: fromStationCode,
    state: ''
  };
  const toStation = getCachedStation(toStationCode) || POPULAR_STATIONS.find((s) => s.code === toStationCode) || {
    code: toStationCode,
    name: `${toStationCode} Station`,
    city: toStationCode,
    state: ''
  };

  const handleManualSearch = async () => {
    setIsLoadingTrains(true);
    try {
      const res = await fetchLiveTrains(fromStationCode, toStationCode, journeyDate, quota, trainQuery, true);
      if (res && Array.isArray(res.trains)) {
        setTrainsList(res.trains);
      } else {
        setTrainsList([]);
      }
    } catch {
      setTrainsList([]);
    } finally {
      setIsLoadingTrains(false);
    }
  };

  // Fetch live trains whenever from/to/date/quota changes
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingTrains(true);

    const load = async () => {
      try {
        const res = await fetchLiveTrains(fromStationCode, toStationCode, journeyDate, quota, trainQuery);
        if (!isCancelled) {
          if (res && Array.isArray(res.trains)) {
            setTrainsList(res.trains);
          } else {
            setTrainsList([]);
          }
        }
      } catch {
        if (!isCancelled) {
          setTrainsList([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingTrains(false);
        }
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, [fromStationCode, toStationCode, journeyDate, quota, trainQuery]);

  const [isStartingRouteRadar, setIsStartingRouteRadar] = useState<boolean>(false);

  // Active route radar for current corridor & date
  const activeRouteRadar = activeRadars.find(
    (r) =>
      r.mode === 'ROUTE' &&
      r.fromCode === fromStationCode &&
      r.toCode === toStationCode &&
      r.journeyDate === journeyDate &&
      (r.status === 'ACTIVE' || r.status === 'SEAT_FOUND')
  );

  const handleStartRouteRadar = async () => {
    if (activeRouteRadar) {
      onViewActiveWatch?.();
      return;
    }
    setIsStartingRouteRadar(true);
    try {
      await PushNotificationService.enablePushNotifications();
      const defaultCls = (trainsList[0]?.classes && trainsList[0].classes[0]) || 'CC';
      await RadarApiService.createRadar({
        mode: 'ROUTE',
        fromCode: fromStationCode,
        toCode: toStationCode,
        journeyDate: journeyDate,
        travelClass: defaultCls,
        quota: quota
      });
      onRefreshRadars?.();
      if (onViewActiveWatch) {
        onViewActiveWatch();
      }
    } catch (err) {
      console.error('Failed to create route radar', err);
    } finally {
      setIsStartingRouteRadar(false);
    }
  };

  // Quick Corridor Selection
  const handleSelectRoute = (from: string, to: string) => {
    setFromStationCode(from);
    setToStationCode(to);
  };

  // Swap Stations
  const handleSwapStations = () => {
    const temp = fromStationCode;
    setFromStationCode(toStationCode);
    setToStationCode(temp);
  };

  // Quick Watch Trigger from Ixigo Strip
  const handleStartWatchForTrain = async (
    trainNumber: string,
    trainName: string,
    travelClass: TrainClass,
    targetDate: string,
    departureTime?: string
  ) => {
    const depTime = departureTime || '18:00';
    const jDate = targetDate || journeyDate;
    const { chartingDate } = calculateEstimatedChartingTime(jDate, depTime);

    // 1. Create Server-Side Radar job so it monitors 24/7 in background even when page closes
    try {
      await PushNotificationService.enablePushNotifications();
      await RadarApiService.createRadar({
        mode: 'TRAIN',
        trainNumber: trainNumber,
        trainName: trainName,
        fromCode: fromStation.code,
        toCode: toStation.code,
        journeyDate: jDate,
        travelClass: travelClass,
        quota: quota,
        departureTime: depTime
      });
      onRefreshRadars?.();
    } catch (err) {
      console.warn('Server radar trigger notice:', err);
    }

    // 2. Also register client-side watch for in-app reactive UI
    const newWatch: SeatScoutWatch = {
      id: `watch-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fromStation,
      toStation,
      journeyDate: jDate,
      trainNumber: trainNumber,
      trainName: trainName,
      departureTime: depTime,
      estimatedChartingTime: chartingDate.toISOString(),
      travelClass: travelClass,
      quota: quota,
      status: 'monitoring',
      lastCheckedAt: new Date().toISOString(),
      checkIntervalSeconds: 15,
      checkCount: 1,
      notifySound: true,
      notifyPush: true,
      pingLogs: [
        {
          id: `ping-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          statusText: `24/7 Radar backend monitoring active for ${trainNumber} ${trainName} (${travelClass}, ${quota})`,
          availabilityCode: 'SCAN_ACTIVE',
          trainNumber
        }
      ]
    };

    onStartWatch(newWatch);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 space-y-8">
      
      {/* Title & Concept Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live IRCTC Berth Availability & Current Booking Radar</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Search Trains & Check Real-Time Availability
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
          Explore real-time seat availability across all Indian Railways corridors. Watch for Current Booking berths that open immediately after chart preparation.
        </p>
      </div>

      {/* Primary Search Bar Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-950/40 space-y-6">
        
        {/* Quick Route Presets */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Popular Corridors
          </label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_ROUTES.slice(0, 5).map((r) => {
              const isSelected = fromStationCode === r.from && toStationCode === r.to;
              return (
                <button
                  key={`${r.from}-${r.to}`}
                  type="button"
                  onClick={() => handleSelectRoute(r.from, r.to)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Station Selectors with Autocomplete across all 9,000+ Indian Railway Stations */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          
          <div className="sm:col-span-5">
            <StationAutocomplete
              id="watch-from-station"
              label="Origin Station (From)"
              value={fromStationCode}
              disabledCode={toStationCode}
              onChange={(s) => setFromStationCode(s.code)}
              placeholder="Search station or city (e.g. NDLS, Gorakhpur)..."
            />
          </div>

          <div className="sm:col-span-2 flex justify-center pb-0.5">
            <button
              type="button"
              onClick={handleSwapStations}
              title="Swap stations"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
            >
              <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
            </button>
          </div>

          <div className="sm:col-span-5">
            <StationAutocomplete
              id="watch-to-station"
              label="Destination Station (To)"
              value={toStationCode}
              disabledCode={fromStationCode}
              onChange={(s) => setToStationCode(s.code)}
              placeholder="Search destination station or city..."
            />
          </div>

        </div>

        {/* Date & Quota Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          <div>
            <DatePickerCalendar
              value={journeyDate}
              onChange={(newDate) => setJourneyDate(newDate)}
              label="Journey Date"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Booking Quota
              </label>
              {quota === 'GN' ? (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  Default (General)
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  Special Quota Active
                </span>
              )}
            </div>
            <div className="relative">
              <select
                value={quota}
                onChange={(e) => setQuota(e.target.value as QuotaType)}
                className="w-full bg-slate-950 border border-slate-750 rounded-xl pl-3.5 pr-10 py-3 text-sm text-white font-medium focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="GN">General (GN) — Standard Public (Default)</option>
                <option value="TQ">Tatkal (TQ) — Emergency Short-Notice Quota</option>
                <option value="SS">Senior Citizen (SS) — Lower Berth Quota</option>
                <option value="LD">Ladies (LD) — Solo Female Quota</option>
                <option value="HP">Physically Handicapped (HP) — Divyangjan</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {quota === 'GN' && 'Standard open booking for all passengers across all classes.'}
              {quota === 'TQ' && 'Emergency Tatkal quota (opens at 10 AM for AC, 11 AM for Non-AC).'}
              {quota === 'SS' && 'Lower berth priority for male passengers 60+ and female 45+.'}
              {quota === 'LD' && 'Reserved berths for solo female travelers and mothers with children.'}
              {quota === 'HP' && 'Reserved berths for Divyangjan concession certificate holders.'}
            </p>
          </div>

        </div>

        {/* Train Query & Explicit Search Action */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={trainQuery}
              onChange={(e) => setTrainQuery(e.target.value)}
              placeholder="Optional: Filter by train number (e.g. 12012) or name..."
              className="w-full bg-slate-950 border border-slate-750 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            {trainQuery && (
              <button
                type="button"
                onClick={() => setTrainQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleManualSearch}
            disabled={isLoadingTrains}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoadingTrains ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Search for Results</span>
          </button>
        </div>

      </div>

      {/* ================= CORRIDOR TRAINS & LIVE AVAILABILITY STRIPS ================= */}
      <div className="space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Trains on Corridor ({trainsList.length} Trains Found)</span>
              {isLoadingTrains && <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />}
            </h2>
            <p className="text-xs text-slate-400">
              {fromStation.city} ({fromStation.code}) → {toStation.city} ({toStation.code}) on {journeyDate} · {quota} Quota
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Watch Entire Route Action */}
            <button
              type="button"
              onClick={handleStartRouteRadar}
              disabled={isStartingRouteRadar || trainsList.length === 0}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-md ${
                activeRouteRadar
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/40 shadow-emerald-900/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 active:scale-95'
              }`}
            >
              {isStartingRouteRadar ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Radio className={`w-3.5 h-3.5 ${activeRouteRadar ? 'animate-pulse text-emerald-200' : 'text-blue-200'}`} />
              )}
              <span>
                {activeRouteRadar
                  ? `Route Radar Active (${activeRouteRadar.monitoredTrains?.length || trainsList.length} Trains)`
                  : `Watch Entire Route (${trainsList.length} Trains)`}
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-black/30 text-white font-mono uppercase">
                24/7 Radar
              </span>
            </button>

            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Official Indian Railways Live Timetable</span>
            </div>
          </div>
        </div>

        {/* 4 Time Slots & Sort Controls */}
        <TrainSortAndFilterBar
          trains={trainsList}
          selectedSlots={selectedSlots}
          onToggleSlot={handleToggleSlot}
          onSelectAllSlots={handleSelectAllSlots}
          slotTarget={slotTarget}
          onChangeSlotTarget={setSlotTarget}
          sortBy={sortBy}
          onChangeSortBy={setSortBy}
          totalFilteredCount={filteredTrains.length}
        />

        {/* Empty State when no trains operate on route */}
        {trainsList.length === 0 && !isLoadingTrains && (
          <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-lg">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
              <Train className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-bold text-white">
                No Direct Trains Found on Indian Railways
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                There are no scheduled direct trains operating between <span className="font-semibold text-slate-200">{fromStation.name} ({fromStation.code})</span> and <span className="font-semibold text-slate-200">{toStation.name} ({toStation.code})</span> on {journeyDate}.
              </p>
            </div>
            <div className="text-xs text-slate-400 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 max-w-lg mx-auto text-left space-y-1.5">
              <p className="font-semibold text-emerald-400 flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Travel Tip for Smaller Railway Stations:</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Smaller stations often connect via nearby junction hubs. Try searching to or from a nearby major junction (such as <span className="text-slate-300 font-mono">NDLS</span> New Delhi, <span className="text-slate-300 font-mono">UMB</span> Ambala Cantt, or <span className="text-slate-300 font-mono">MB</span> Moradabad) to find express connecting services.
              </p>
            </div>
          </div>
        )}

        {/* Empty State when filters yield zero trains */}
        {trainsList.length > 0 && filteredTrains.length === 0 && (
          <div className="text-center py-10 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3">
            <p className="text-sm font-semibold text-slate-300">
              No trains found matching the selected {slotTarget} time category.
            </p>
            <p className="text-xs text-slate-500">
              There are {trainsList.length} total trains available on this corridor.
            </p>
            <button
              type="button"
              onClick={handleSelectAllSlots}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer transition-all inline-flex items-center space-x-1.5"
            >
              <span>View All {trainsList.length} Trains</span>
            </button>
          </div>
        )}

        {filteredTrains.map((train) => {
          const isTrainWatching = activeRadars.some(
            (r) =>
              (r.status === 'ACTIVE' || r.status === 'SEAT_FOUND') &&
              r.journeyDate === journeyDate &&
              (r.mode === 'ROUTE' || r.trainNumber === train.number)
          );

          return (
            <div
              key={train.number}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg hover:border-slate-700 transition-all"
            >
              {/* Train Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-extrabold text-white">
                      {train.number} - {train.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 font-mono text-[11px] font-bold">
                      {train.type}
                    </span>
                    {train.isNearby && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                        Nearby Station Route ({train.fromCode} → {train.toCode})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">{train.departureTime} ({train.fromCode || fromStation.code})</span>
                    <span>→</span>
                    <span className="font-semibold text-slate-200">{train.arrivalTime} ({train.toCode || toStation.code})</span>
                    <span>•</span>
                    <span>{train.duration}</span>
                    <span>•</span>
                    <span>Runs: {train.runsOn?.join(', ') || 'All Days'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ChartingCountdownWidget
                    compact
                    journeyDate={journeyDate}
                    departureTime={train.departureTime}
                  />
                  {train.chartingTimeNote && (
                    <div className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 rounded-xl flex items-center space-x-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{train.chartingTimeNote}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ixigo Live Availability Strip Component (Directly updates on train/quota/date) */}
              <div>
                <IxigoAvailabilityStrip
                  trainNumber={train.number}
                  trainName={train.name}
                  fromCode={train.fromCode || fromStation.code}
                  toCode={train.toCode || toStation.code}
                  availableClasses={train.classes}
                  selectedClass={trainSelectedClasses[train.number] || train.classes[0] || 'CC'}
                  onClassChange={(newCls) => {
                    setTrainSelectedClasses((prev) => ({
                      ...prev,
                      [train.number]: newCls
                    }));
                  }}
                  quota={quota}
                  startDate={journeyDate}
                  initialAvailability={train.liveAvailability}
                  isWatching={isTrainWatching}
                  onSelectDateForWatch={(dateStr, cls) => {
                    if (isTrainWatching) {
                      onViewActiveWatch?.();
                    } else {
                      handleStartWatchForTrain(train.number, train.name, cls, dateStr, train.departureTime);
                    }
                  }}
                />
              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
};
