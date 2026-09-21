import React, { useState } from 'react';
import { 
  Volume2, 
  Bell, 
  Clock, 
  Users, 
  Trash2, 
  Plus, 
  Play, 
  Check, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  Info,
  Smartphone
} from 'lucide-react';
import { NotificationSettings, Passenger, SoundType } from '../types';
import { playSeatAlertSound, sendDesktopNotification, requestNotificationPermission } from '../utils/audioAlert';

interface SettingsModalProps {
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
  savedPassengers: Passenger[];
  onUpdatePassengers: (passengers: Passenger[]) => void;
  notificationPermission: NotificationPermission;
  onRefreshPermission: () => void;
  onOpenPhoneModal?: () => void;
  verifiedPhone?: string | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  savedPassengers,
  onUpdatePassengers,
  notificationPermission,
  onRefreshPermission,
  onOpenPhoneModal,
  verifiedPhone
}) => {
  const [newPassengerName, setNewPassengerName] = useState<string>('');
  const [newPassengerGender, setNewPassengerGender] = useState<'male' | 'female' | 'transgender'>('male');
  const [newPassengerDob, setNewPassengerDob] = useState<string>('1962-05-10');
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  const handleTestSound = (type?: SoundType) => {
    const soundToPlay = type || settings.soundType;
    playSeatAlertSound(soundToPlay, settings.volume);
    setTestSuccess(`Playing "${soundToPlay}" alert tone`);
    setTimeout(() => setTestSuccess(null), 2500);
  };

  const handleTestPush = async () => {
    let perm = notificationPermission;
    if (perm !== 'granted') {
      const res = await requestNotificationPermission();
      perm = res.permission;
      onRefreshPermission();
      if (res.isIframeBlocked) {
        setTestSuccess(res.message || 'Notification prompt restricted in iframe. Triggering In-App alert & SMS option.');
      }
    }
    
    // Always trigger alert (will dispatch desktop push if granted + in-app notification banner)
    sendDesktopNotification('🎉 SeatScout Test: 12012 Kalka Shatabdi Available!', {
      body: '3A · Senior Citizen / Lower Berth (CURR_AVBL 0004). Ready for instant booking on IRCTC.'
    });

    if (perm === 'granted') {
      setTestSuccess('Desktop push & in-app notification sent!');
    } else {
      setTestSuccess('In-app alert triggered! (For system notifications, open in new tab or use SMS alerts)');
    }
    setTimeout(() => setTestSuccess(null), 4000);
  };

  const handleAddPassenger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassengerName.trim() || !newPassengerDob) return;
    const updated = [
      ...savedPassengers,
      {
        name: newPassengerName.trim(),
        gender: newPassengerGender,
        dob: newPassengerDob
      }
    ];
    onUpdatePassengers(updated);
    setNewPassengerName('');
  };

  const handleRemovePassenger = (index: number) => {
    const updated = savedPassengers.filter((_, i) => i !== index);
    onUpdatePassengers(updated);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Scout Preferences & Alerts</h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize your instant audio tones, desktop push notifications, and saved passenger profiles for quick watch creation.
        </p>
      </div>

      {testSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{testSuccess}</span>
        </div>
      )}

      {/* Audio Alerts Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Audio Chimes & Alert Tones</h3>
          </div>
          <label className="flex items-center space-x-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onUpdateSettings({ ...settings, soundEnabled: e.target.checked })}
              className="rounded text-emerald-500 focus:ring-emerald-400"
            />
            <span className="text-slate-300 font-medium">Enable Sound</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Sound Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Alert Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['chime', 'soft', 'radar'] as SoundType[]).map((type) => {
                const isSelected = settings.soundType === type;
                return (
                  <button
                    key={type}
                    onClick={() => {
                      onUpdateSettings({ ...settings, soundType: type });
                      handleTestSound(type);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="capitalize">{type === 'chime' ? 'Glass Chime' : type === 'soft' ? 'Soft Bell' : 'Gentle Radar'}</span>
                    <Play className="w-3 h-3 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Slider & Test Button */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Alert Volume</span>
                <span className="font-mono">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.volume}
                onChange={(e) => onUpdateSettings({ ...settings, volume: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            <button
              onClick={() => handleTestSound()}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Test Current Sound Tone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Push Notifications Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Bell className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-base font-bold text-white">Browser Push Notifications</h3>
              <p className="text-xs text-slate-400">Receive instant alerts even when this browser tab is running in the background.</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            notificationPermission === 'granted'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
          }`}>
            {notificationPermission === 'granted' ? 'Active & Permitted' : 'Permission Required'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {notificationPermission !== 'granted' ? (
            <button
              onClick={handleTestPush}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Request Push Permission
            </button>
          ) : (
            <button
              onClick={handleTestPush}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-teal-400" />
              <span>Send Sample Berth Alert Notification</span>
            </button>
          )}
        </div>
      </div>

      {/* SMS & Mobile Notification via OTP API */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-white">SMS & Mobile Phone Alerts (OTP Verified)</h3>
              <p className="text-xs text-slate-400">
                Receive instant SMS notifications on your mobile device the second Current Booking berths become available.
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            verifiedPhone
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
          }`}>
            {verifiedPhone ? 'Active & Verified' : 'Available'}
          </span>
        </div>

        {verifiedPhone ? (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Registered Alert Phone</span>
              <div className="font-mono font-bold text-emerald-400 text-sm">{verifiedPhone}</div>
            </div>
            {onOpenPhoneModal && (
              <button
                onClick={onOpenPhoneModal}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs border border-slate-700 cursor-pointer"
              >
                Manage / Send Test SMS
              </button>
            )}
          </div>
        ) : (
          <div className="pt-1">
            {onOpenPhoneModal && (
              <button
                onClick={onOpenPhoneModal}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer text-white-always"
              >
                <Smartphone className="w-4 h-4 text-white-always" />
                <span className="text-white-always font-bold">Verify Mobile via OTP for SMS Alerts</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Saved Passenger Profiles (Quick-Load for Quotas) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2.5">
          <Users className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-base font-bold text-white">Saved Passenger Profiles</h3>
            <p className="text-xs text-slate-400">Pre-store passenger dates of birth for instant Senior Citizen / Lower Berth quota validation.</p>
          </div>
        </div>

        {/* Existing Saved Passengers */}
        <div className="space-y-2">
          {savedPassengers.map((p, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">{p.name}</span>
                <span className="text-slate-400 font-mono text-[11px]">({p.gender}, DOB: {p.dob})</span>
              </div>
              <button
                onClick={() => handleRemovePassenger(idx)}
                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Passenger Form */}
        <form onSubmit={handleAddPassenger} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
          <input
            type="text"
            placeholder="Passenger Name"
            value={newPassengerName}
            onChange={(e) => setNewPassengerName(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            required
          />
          <select
            value={newPassengerGender}
            onChange={(e) => setNewPassengerGender(e.target.value as 'male' | 'female' | 'transgender')}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="male">Male (60+ yrs for SS)</option>
            <option value="female">Female (45+ yrs for SS)</option>
            <option value="transgender">Transgender (60+ yrs for SS)</option>
          </select>
          <input
            type="date"
            value={newPassengerDob}
            onChange={(e) => setNewPassengerDob(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            required
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Passenger</span>
          </button>
        </form>
      </div>

    </div>
  );
};
