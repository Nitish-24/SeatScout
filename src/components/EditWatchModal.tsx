import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Save, 
  Train, 
  Users,
  ChevronDown
} from 'lucide-react';
import { 
  SeatScoutWatch, 
  TrainClass, 
  QuotaType 
} from '../types';
import { POPULAR_STATIONS, QUOTA_DETAILS, getTrainsForRoute, CLASS_LABELS } from '../data/trainData';
import { DatePickerCalendar } from './DatePickerCalendar';
import { ChartingCountdownWidget } from './ChartingCountdownWidget';
import { calculateEstimatedChartingTime } from '../utils/chartingTime';

interface EditWatchModalProps {
  watch: SeatScoutWatch;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedWatch: SeatScoutWatch) => void;
}

export const EditWatchModal: React.FC<EditWatchModalProps> = ({
  watch,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [fromCode, setFromCode] = useState<string>(watch.fromStation.code);
  const [toCode, setToCode] = useState<string>(watch.toStation.code);
  const [journeyDate, setJourneyDate] = useState<string>(watch.journeyDate);
  const [trainNumber, setTrainNumber] = useState<string>(watch.trainNumber || '12012');
  const [travelClass, setTravelClass] = useState<TrainClass>(watch.travelClass || 'CC');
  const [quota, setQuota] = useState<QuotaType>(watch.quota || 'GN');

  // Reset internal state when modal opens with a different watch
  useEffect(() => {
    setFromCode(watch.fromStation.code);
    setToCode(watch.toStation.code);
    setJourneyDate(watch.journeyDate);
    setTrainNumber(watch.trainNumber || '12012');
    setTravelClass(watch.travelClass || 'CC');
    setQuota(watch.quota || 'GN');
  }, [watch]);

  // Station Lookups
  const fromStation = POPULAR_STATIONS.find((s) => s.code === fromCode) || watch.fromStation;
  const toStation = POPULAR_STATIONS.find((s) => s.code === toCode) || watch.toStation;

  // Available trains for this corridor dynamically
  const availableTrains = useMemo(() => {
    return getTrainsForRoute(fromCode, toCode);
  }, [fromCode, toCode]);

  // Auto-sync train number if not in availableTrains
  useEffect(() => {
    if (availableTrains.length > 0) {
      const match = availableTrains.find((t) => t.number === trainNumber);
      if (!match) {
        setTrainNumber(availableTrains[0].number);
      }
    }
  }, [availableTrains, trainNumber]);

  const selectedTrain = useMemo(() => {
    return availableTrains.find((t) => t.number === trainNumber) || availableTrains[0] || null;
  }, [availableTrains, trainNumber]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const trainName = selectedTrain ? selectedTrain.name : watch.trainName || 'Superfast Express';
    const depTime = selectedTrain?.departureTime || watch.departureTime || '18:00';
    const { chartingDate } = calculateEstimatedChartingTime(journeyDate, depTime);

    const updated: SeatScoutWatch = {
      ...watch,
      fromStation,
      toStation,
      journeyDate,
      trainNumber,
      trainName,
      departureTime: depTime,
      estimatedChartingTime: chartingDate.toISOString(),
      travelClass,
      quota,
      updatedAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
      pingLogs: [
        {
          id: `ping-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          statusText: `Updated parameters: ${fromStation.code} → ${toStation.code}, Train ${trainNumber} (${travelClass}, ${quota}) on ${journeyDate}`,
          availabilityCode: 'SCAN_ACTIVE',
          trainNumber
        },
        ...(watch.pingLogs || [])
      ]
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Train className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Edit Radar Parameters</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* Origin and Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Origin (From)</label>
              <select
                value={fromCode}
                onChange={(e) => setFromCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
              >
                {POPULAR_STATIONS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.city} ({s.code}) - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Destination (To)</label>
              <select
                value={toCode}
                onChange={(e) => setToCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
              >
                {POPULAR_STATIONS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.city} ({s.code}) - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Journey Date with Interactive Calendar */}
          <div>
            <DatePickerCalendar
              value={journeyDate}
              onChange={(newDate) => setJourneyDate(newDate)}
              label="Journey Date"
            />
          </div>

          {/* Train Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Preferred Train</label>
            <select
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-750 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
            >
              {availableTrains.map((t) => (
                <option key={t.number} value={t.number}>
                  {t.number} - {t.name} ({t.departureTime} dep)
                </option>
              ))}
            </select>
          </div>

          {/* Travel Class Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Travel Class</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(['CC', 'EC', '3A', '2A', '1A', 'SL', '2S'] as TrainClass[]).map((cls) => {
                const isSelected = travelClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setTravelClass(cls)}
                    className={`py-2 px-1 rounded-xl text-center font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Booking Quota Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-semibold text-sm">Booking Quota</label>
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
              {quota === 'GN' && 'Standard open booking for all passengers across all classes.'}
              {quota === 'TQ' && 'Emergency Tatkal quota (opens at 10 AM for AC, 11 AM for Non-AC).'}
              {quota === 'SS' && 'Lower berth priority for male passengers 60+ and female 45+.'}
              {quota === 'LD' && 'Reserved berths for solo female travelers and mothers with children.'}
              {quota === 'HP' && 'Reserved berths for Divyangjan concession certificate holders.'}
            </p>
          </div>

          {/* Charting Countdown Preview */}
          <div className="pt-2">
            <ChartingCountdownWidget
              journeyDate={journeyDate}
              departureTime={selectedTrain?.departureTime || watch.departureTime || '18:00'}
              trainNumber={trainNumber}
              trainName={selectedTrain?.name || watch.trainName}
              fromStationCode={fromStation.code}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center space-x-1.5 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Update Radar</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
