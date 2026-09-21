import React from 'react';
import {
  Sunrise,
  Sun,
  Sunset,
  Moon,
  ArrowUpDown,
  Filter,
  Check,
  RotateCcw,
  Zap,
  Clock
} from 'lucide-react';
import {
  TIME_SLOTS,
  SORT_OPTIONS,
  TimeSlotId,
  TimeSlotTarget,
  SortOptionId,
  calculateSlotCounts
} from '../utils/trainFilterUtils';
import { TrainSchedule } from '../types';

interface TrainSortAndFilterBarProps {
  trains: TrainSchedule[];
  selectedSlots: TimeSlotId[];
  onToggleSlot: (slot: TimeSlotId) => void;
  onSelectAllSlots: () => void;
  slotTarget: TimeSlotTarget;
  onChangeSlotTarget: (target: TimeSlotTarget) => void;
  sortBy: SortOptionId;
  onChangeSortBy: (sort: SortOptionId) => void;
  totalFilteredCount: number;
}

export const TrainSortAndFilterBar: React.FC<TrainSortAndFilterBarProps> = ({
  trains,
  selectedSlots,
  onToggleSlot,
  onSelectAllSlots,
  slotTarget,
  onChangeSlotTarget,
  sortBy,
  onChangeSortBy,
  totalFilteredCount
}) => {
  const slotCounts = calculateSlotCounts(trains, slotTarget);
  const isFiltered = selectedSlots.length > 0;

  const getSlotIcon = (id: TimeSlotId) => {
    switch (id) {
      case 'early_morning':
        return <Sunrise className="w-4 h-4 text-amber-400" />;
      case 'morning':
        return <Sun className="w-4 h-4 text-yellow-400" />;
      case 'afternoon':
        return <Sunset className="w-4 h-4 text-orange-400" />;
      case 'night':
        return <Moon className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm dark:shadow-xl transition-colors">
      
      {/* Top Controls: Target Selector & Sort Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3.5">
        
        {/* Left: Timing Target Switcher (Departure vs Arrival) */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-400" />
            <span>Time Slots for:</span>
          </div>

          <div className="inline-flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onChangeSlotTarget('departure')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                slotTarget === 'departure'
                  ? 'bg-blue-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Departure Time
            </button>
            <button
              type="button"
              onClick={() => onChangeSlotTarget('arrival')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                slotTarget === 'arrival'
                  ? 'bg-blue-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Arrival Time
            </button>
          </div>
        </div>

        {/* Right: Sort By Selection */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="flex items-center space-x-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-400" />
            <span>Sort by:</span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => onChangeSortBy(e.target.value as SortOptionId)}
            className="flex-1 sm:flex-initial bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl px-3 py-1.5 focus:border-blue-500 dark:focus:border-emerald-500 focus:outline-none cursor-pointer shadow-xs"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* 4 Time Categories Grid (Early Morning, Morning, Mid-Day/Afternoon, Night) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
            <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-400" />
            <span>Select Time Slot ({slotTarget === 'departure' ? 'Departure' : 'Arrival'})</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onSelectAllSlots}
              className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
                !isFiltered
                  ? 'bg-blue-100 dark:bg-emerald-500/20 text-blue-900 dark:text-emerald-300 font-bold border border-blue-200 dark:border-emerald-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
              }`}
            >
              <span>All Times ({trains.length})</span>
            </button>

            {isFiltered && (
              <button
                type="button"
                onClick={onSelectAllSlots}
                className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* The 4 Time Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {TIME_SLOTS.map((slot) => {
            const isSelected = selectedSlots.includes(slot.id);
            const count = slotCounts[slot.id];

            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => onToggleSlot(slot.id)}
                className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-emerald-950/40 border-2 border-blue-600 dark:border-emerald-400 text-slate-900 dark:text-white shadow-md shadow-blue-500/10 dark:shadow-emerald-500/10 ring-1 ring-blue-600/30'
                    : count > 0
                    ? 'bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-950/80 dark:hover:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-850 text-slate-400 dark:text-slate-600 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    {getSlotIcon(slot.id)}
                  </div>

                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? 'bg-blue-600 dark:bg-emerald-400 text-white dark:text-slate-950'
                        : count > 0
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {count} {count === 1 ? 'train' : 'trains'}
                  </span>
                </div>

                <div className="mt-2.5">
                  <div className="text-xs font-extrabold flex items-center justify-between text-slate-900 dark:text-white">
                    <span>{slot.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-400" />}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                    {slot.timeRange}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t border-slate-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <span>
            Showing <strong className="text-blue-700 dark:text-emerald-400 font-bold">{totalFilteredCount}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white font-bold">{trains.length}</strong> trains
          </span>
          {isFiltered && (
            <span className="text-[11px] bg-blue-50 dark:bg-emerald-500/10 text-blue-700 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-blue-200 dark:border-emerald-500/20 font-semibold">
              Filtered by {selectedSlots.map((s) => TIME_SLOTS.find((t) => t.id === s)?.label).join(', ')}
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono font-medium">
          Sorted: {SORT_OPTIONS.find((o) => o.id === sortBy)?.shortLabel}
        </div>
      </div>

    </div>
  );
};
