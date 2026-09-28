import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  Info
} from 'lucide-react';
import { evaluateQuotaEligibility, calculateAgeOnDate } from '../utils/quotaCalculator';
import { QuotaType } from '../types';
import { QUOTA_DETAILS } from '../data/trainData';

interface QuotaCalculatorModalProps {
  onStartWatchWithPassenger?: (gender: 'male' | 'female' | 'transgender', dob: string, quota: QuotaType) => void;
}

export const QuotaCalculatorModal: React.FC<QuotaCalculatorModalProps> = ({
  onStartWatchWithPassenger
}) => {
  const [quota, setQuota] = useState<QuotaType>('SS');
  const [gender, setGender] = useState<'male' | 'female' | 'transgender'>('male');
  const [dob, setDob] = useState<string>('1964-03-20');
  const [journeyDate, setJourneyDate] = useState<string>('2026-09-29');

  const age = useMemo(() => {
    return calculateAgeOnDate(dob, journeyDate);
  }, [dob, journeyDate]);

  const eligibility = useMemo(() => {
    return evaluateQuotaEligibility(quota, { gender, dob }, journeyDate);
  }, [quota, gender, dob, journeyDate]);

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Indian Railways Smart Quota Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Senior Citizen & Lower Berth Quota Eligibility Calculator
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Verify whether a passenger qualifies for Senior Citizen / Lower Berth (<span className="text-emerald-400 font-mono">SS</span>) or Ladies (<span className="text-cyan-400 font-mono">LD</span>) quota on their exact travel date.
        </p>
      </div>

      {/* Calculator Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        
        {/* Quota Type Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Select Quota to Check
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['SS', 'GN', 'LD', 'HP'] as QuotaType[]).map((q) => {
              const qInfo = QUOTA_DETAILS[q];
              const isSelected = quota === q;
              return (
                <button
                  key={q}
                  onClick={() => setQuota(q)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm flex items-center justify-between">
                    <span>{q}</span>
                    {q === 'SS' && <span className="text-[10px] text-emerald-400">Recommended</span>}
                  </div>
                  <span className="text-xs text-slate-400 block truncate">{qInfo.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Passenger Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'transgender')}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="male">Male (Threshold: 60+ yrs)</option>
              <option value="female">Female (Threshold: 45+ yrs)</option>
              <option value="transgender">Transgender (Threshold: 60+ yrs)</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Passenger Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Journey Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Intended Journey Date
            </label>
            <input
              type="date"
              value={journeyDate}
              onChange={(e) => setJourneyDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Results Showcase Banner matching prompt requirements! */}
        <div className={`p-5 rounded-2xl border transition-all ${
          eligibility.isEligible
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
        }`}>
          <div className="flex items-start space-x-3">
            {eligibility.isEligible ? (
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
            )}

            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-extrabold text-white">
                  {eligibility.message}
                </h3>
                <span className="font-mono px-2.5 py-1 rounded-lg bg-slate-900 text-xs font-bold text-slate-200 border border-slate-700">
                  Age on Journey Date: {eligibility.calculatedAge} Years
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium">
                {eligibility.criteria}
              </p>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2 mt-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Official Rule Clarification:</strong> Under Indian Railways rules for Senior Citizen / Lower Berth Quota (SS), male passengers aged 60 years and above, and female passengers aged 45 years and above travelling alone or with another qualified senior citizen are allocated lower berths, subject to availability.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action button to create alert with calculated passenger */}
        {onStartWatchWithPassenger && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onStartWatchWithPassenger(gender, dob, quota)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Create SeatScout Watch with this Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
