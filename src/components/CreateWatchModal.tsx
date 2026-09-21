import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeftRight, 
  Compass, 
  Train, 
  Calendar, 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  BellRing, 
  Check,
  Info,
  ChevronDown
} from 'lucide-react';
import { 
  Station, 
  TrainSchedule, 
  TrainClass, 
  QuotaType, 
  Passenger, 
  SeatScoutWatch,
  QuotaEligibility 
} from '../types';
import { 
  POPULAR_STATIONS, 
  POPULAR_ROUTES, 
  TRAIN_DATABASE, 
  CLASS_LABELS, 
  QUOTA_DETAILS,
  getTrainsForRoute
} from '../data/trainData';
import { evaluateQuotaEligibility, calculateAgeOnDate } from '../utils/quotaCalculator';
import { getStoredSavedPassengers } from '../utils/storage';
import { calculateEstimatedChartingTime } from '../utils/chartingTime';

interface CreateWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveWatch: (watch: SeatScoutWatch) => void;
  initialRoute?: { fromCode: string; toCode: string };
}

export const CreateWatchModal: React.FC<CreateWatchModalProps> = ({
  isOpen,
  onClose,
  onSaveWatch,
  initialRoute
}) => {
  // Default values
  const defaultFrom = POPULAR_STATIONS.find(s => s.code === (initialRoute?.fromCode || 'CDG')) || POPULAR_STATIONS[0];
  const defaultTo = POPULAR_STATIONS.find(s => s.code === (initialRoute?.toCode || 'NDLS')) || POPULAR_STATIONS[1];

  // Next month default date (e.g. 2026-09-29 or today + 2 days)
  const defaultDate = '2026-09-29';

  const [fromStation, setFromStation] = useState<Station>(defaultFrom);
  const [toStation, setToStation] = useState<Station>(defaultTo);
  const [journeyDate, setJourneyDate] = useState<string>(defaultDate);
  const [selectedTrainNumber, setSelectedTrainNumber] = useState<string>('12012'); // Kalka Shatabdi
  const [selectedClass, setSelectedClass] = useState<TrainClass>('3A');
  const [selectedQuota, setSelectedQuota] = useState<QuotaType>('GN');
  
  // Passenger details for smart quota check
  const [passengerName, setPassengerName] = useState<string>('Nitish (Father)');
  const [passengerGender, setPassengerGender] = useState<'male' | 'female' | 'transgender'>('male');
  const [passengerDob, setPassengerDob] = useState<string>('1960-04-15'); // 66 yrs on 2026-09-29 -> Eligible!
  
  // Scout preferences
  const [checkInterval, setCheckInterval] = useState<number>(15);
  const [notifySound, setNotifySound] = useState<boolean>(true);
  const [notifyPush, setNotifyPush] = useState<boolean>(true);

  // Filter available trains for route (including metro clusters & corridors)
  const matchingTrains = useMemo(() => {
    return getTrainsForRoute(fromStation.code, toStation.code);
  }, [fromStation.code, toStation.code]);

  // Selected train object
  const selectedTrain = useMemo(() => {
    if (selectedTrainNumber === 'ALL') return null;
    return matchingTrains.find(t => t.number === selectedTrainNumber) || matchingTrains[0] || null;
  }, [matchingTrains, selectedTrainNumber]);

  // Compute live quota eligibility
  const eligibility: QuotaEligibility = useMemo(() => {
    const passenger: Passenger = {
      name: passengerName,
      gender: passengerGender,
      dob: passengerDob
    };
    return evaluateQuotaEligibility(selectedQuota, passenger, journeyDate);
  }, [selectedQuota, passengerGender, passengerDob, journeyDate, passengerName]);

  // Handle station swapping
  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // Preset quick route selector
  const handleSelectRoutePreset = (fromCode: string, toCode: string) => {
    const f = POPULAR_STATIONS.find(s => s.code === fromCode);
    const t = POPULAR_STATIONS.find(s => s.code === toCode);
    if (f && t) {
      setFromStation(f);
      setToStation(t);
    }
  };

  // Autofill from saved passenger
  const handleLoadSavedPassenger = (p: Passenger) => {
    if (p.name) setPassengerName(p.name);
    setPassengerGender(p.gender);
    setPassengerDob(p.dob);
  };

  const handleLaunchWatch = (e: React.FormEvent) => {
    e.preventDefault();

    const passenger: Passenger = {
      name: passengerName.trim() || 'Passenger 1',
      gender: passengerGender,
      dob: passengerDob
    };

    const depTime = selectedTrain?.departureTime || '18:00';
    const { chartingDate } = calculateEstimatedChartingTime(journeyDate, depTime);

    const newWatch: SeatScoutWatch = {
      id: `scout-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fromStation,
      toStation,
      journeyDate,
      trainNumber: selectedTrainNumber,
      trainName: selectedTrain ? selectedTrain.name : 'All Trains on Route',
      departureTime: depTime,
      estimatedChartingTime: chartingDate.toISOString(),
      travelClass: selectedClass,
      quota: selectedQuota,
      passenger,
      passengerEligibility: eligibility,
      status: 'monitoring',
      checkIntervalSeconds: checkInterval,
      lastCheckedAt: new Date().toISOString(),
      nextCheckAt: new Date(Date.now() + checkInterval * 1000).toISOString(),
      checkCount: 1,
      notifySound,
      notifyPush,
      pingLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          statusText: `SeatScout activated. Monitoring ${fromStation.code} → ${toStation.code} (${selectedClass}, ${selectedQuota} Quota).`,
          availabilityCode: 'RADAR_ACTIVE',
          trainNumber: selectedTrainNumber
        }
      ]
    };

    onSaveWatch(newWatch);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Create SeatScout Watch</h2>
              <p className="text-xs text-slate-400">Set route, train, class & smart quota for instant CURR_AVBL alerts.</p>
            </div>
          </div>
          <button
            id="close-create-watch-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleLaunchWatch} className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Quick Route Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Popular Current Booking Corridors
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_ROUTES.slice(0, 4).map((route) => {
                const isActive = fromStation.code === route.from && toStation.code === route.to;
                return (
                  <button
                    key={`${route.from}-${route.to}`}
                    type="button"
                    onClick={() => handleSelectRoutePreset(route.from, route.to)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                        : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {route.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* From & To Station Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative items-center">
            {/* From Station */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                From Station (Origin)
              </label>
              <select
                id="select-from-station"
                value={fromStation.code}
                onChange={(e) => {
                  const s = POPULAR_STATIONS.find(st => st.code === e.target.value);
                  if (s) setFromStation(s);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                {POPULAR_STATIONS.map((station) => (
                  <option key={station.code} value={station.code} disabled={station.code === toStation.code}>
                    {station.name} ({station.code}) - {station.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button (Desktop Center, Mobile Right) */}
            <div className="hidden sm:flex absolute left-1/2 -ml-4 top-7 z-10">
              <button
                type="button"
                onClick={handleSwapStations}
                title="Swap stations"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 flex items-center justify-center shadow transition-transform hover:rotate-180"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* To Station */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                To Station (Destination)
              </label>
              <select
                id="select-to-station"
                value={toStation.code}
                onChange={(e) => {
                  const s = POPULAR_STATIONS.find(st => st.code === e.target.value);
                  if (s) setToStation(s);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                {POPULAR_STATIONS.map((station) => (
                  <option key={station.code} value={station.code} disabled={station.code === fromStation.code}>
                    {station.name} ({station.code}) - {station.city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Journey Date & Train Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Journey Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Journey Date
              </label>
              <div className="relative">
                <input
                  id="input-journey-date"
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
                  required
                />
              </div>
              <div className="flex space-x-2 mt-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setJourneyDate('2026-09-29')}
                  className="text-emerald-400 hover:underline"
                >
                  Set 29 Sep (Example)
                </button>
                <span className="text-slate-600">·</span>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setJourneyDate(today);
                  }}
                  className="text-slate-400 hover:underline"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Train Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Train Preference
              </label>
              <select
                id="select-train-preference"
                value={selectedTrainNumber}
                onChange={(e) => setSelectedTrainNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="ALL">🔍 Any Train on this Corridor</option>
                {matchingTrains.map((train) => (
                  <option key={train.number} value={train.number}>
                    {train.number} - {train.name} ({train.departureTime} dep)
                  </option>
                ))}
                {matchingTrains.length === 0 && (
                  <option value="12012">12012 - Kalka Shatabdi (18:23 dep)</option>
                )}
              </select>
              {selectedTrain?.chartingTimeNote && (
                <p className="text-[11px] text-teal-400 mt-1 flex items-center">
                  <Clock className="w-3 h-3 mr-1 inline" />
                  {selectedTrain.chartingTimeNote}
                </p>
              )}
            </div>
          </div>

          {/* Travel Class Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Class of Travel
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['3A', '2A', 'CC', '1A', '3E', 'SL'] as TrainClass[]).map((cls) => {
                const info = CLASS_LABELS[cls];
                const isSelected = selectedClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    id={`select-class-${cls}`}
                    onClick={() => setSelectedClass(cls)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-sm">{info.short}</span>
                    <span className="block text-[10px] text-slate-400 truncate">{cls === 'CC' ? 'Chair' : cls === '3A' ? '3-Tier' : cls}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quota Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Booking Quota
              </label>
              {selectedQuota === 'GN' ? (
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
                value={selectedQuota}
                onChange={(e) => setSelectedQuota(e.target.value as QuotaType)}
                className="w-full bg-slate-950 border border-slate-750 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white font-medium focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer"
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
              {selectedQuota === 'GN' && 'Standard open booking for all passengers across all classes.'}
              {selectedQuota === 'TQ' && 'Emergency Tatkal quota (opens at 10 AM for AC, 11 AM for Non-AC).'}
              {selectedQuota === 'SS' && 'Lower berth priority for male passengers 60+ and female 45+.'}
              {selectedQuota === 'LD' && 'Reserved berths for solo female travelers and mothers with children.'}
              {selectedQuota === 'HP' && 'Reserved berths for Divyangjan concession certificate holders.'}
            </p>
          </div>

          {/* Passenger Details & Smart Quota Age Calculator (Especially for SS & LD) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                <Users className="w-4 h-4 text-teal-400" />
                <span>Passenger Details for Quota Verification</span>
              </div>
              <span className="text-[11px] text-slate-500">Calculates age on {journeyDate || 'Journey Date'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Passenger Name */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Passenger Name / Label</label>
                <input
                  type="text"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="e.g. Nitish (Father)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Gender</label>
                <select
                  value={passengerGender}
                  onChange={(e) => setPassengerGender(e.target.value as 'male' | 'female' | 'transgender')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="male">Male (60+ yrs for SS)</option>
                  <option value="female">Female (45+ yrs for SS)</option>
                  <option value="transgender">Transgender (60+ yrs for SS)</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={passengerDob}
                  onChange={(e) => setPassengerDob(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Smart Eligibility Feedback Indicator matching prompt specs! */}
            <div className={`p-3 rounded-lg border text-xs transition-all ${
              eligibility.isEligible
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            }`}>
              <div className="flex items-start space-x-2">
                {eligibility.isEligible ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-bold text-sm">
                    {eligibility.message}
                  </p>
                  <p className="text-[11px] opacity-90">
                    {eligibility.criteria}
                  </p>
                  <p className="text-[10px] text-slate-400 pt-0.5">
                    ℹ {eligibility.disclaimer}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scout Polling & Alert Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Scout Checking Frequency
              </label>
              <select
                value={checkInterval}
                onChange={(e) => setCheckInterval(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value={10}>⚡ Ultra-Fast (Every 10 seconds)</option>
                <option value={15}>🟢 Standard Scout (Every 15 seconds)</option>
                <option value={30}>⏳ Balanced (Every 30 seconds)</option>
                <option value={60}>🔋 Gentle (Every 60 seconds)</option>
              </select>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-around text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySound}
                  onChange={(e) => setNotifySound(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-400"
                />
                <span className="text-slate-300">Audio Chime Alert</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyPush}
                  onChange={(e) => setNotifyPush(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-400"
                />
                <span className="text-slate-300">Push Notification</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="submit-launch-scout-btn"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Launch SeatScout Watch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
