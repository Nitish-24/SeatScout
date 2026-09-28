import React from 'react';
import { 
  Compass, 
  Bell, 
  Volume2, 
  VolumeX, 
  PlusCircle, 
  Radio, 
  Clock, 
  ShieldCheck, 
  Settings,
  Flame,
  Smartphone
} from 'lucide-react';
import { NotificationSettings } from '../types';

interface HeaderProps {
  activeWatchesCount: number;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCreateModal: () => void;
  settings: NotificationSettings;
  onToggleSound: () => void;
  onRequestNotificationPermission: () => void;
  notificationPermission: NotificationPermission;
  onOpenPhoneModal?: () => void;
  isPhoneVerified?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeWatchesCount,
  currentTab,
  setCurrentTab,
  onOpenCreateModal,
  settings,
  onToggleSound,
  onRequestNotificationPermission,
  notificationPermission,
  onOpenPhoneModal,
  isPhoneVerified
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20">
              <Compass className="w-6 h-6 animate-pulse" />
              {activeWatchesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full radar-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
                  Seat<span className="text-emerald-400">Scout</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  <Radio className="w-3 h-3 mr-1 text-emerald-400 animate-pulse" />
                  CURR_AVBL Radar
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden md:block">
                Stop refreshing IRCTC. SeatScout watches for your seat.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              id="nav-dashboard-tab"
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Active Radar</span>
              {activeWatchesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-slate-950 font-bold">
                  {activeWatchesCount}
                </span>
              )}
            </button>

            <button
              id="nav-radar-tab"
              onClick={() => setCurrentTab('radar')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                currentTab === 'radar'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>How CURR_AVBL Works</span>
            </button>

            <button
              id="nav-calculator-tab"
              onClick={() => setCurrentTab('calculator')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                currentTab === 'calculator'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Quota Eligibility</span>
            </button>

            <button
              id="nav-history-tab"
              onClick={() => setCurrentTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                currentTab === 'history'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Alert History</span>
            </button>
          </nav>

          {/* Quick Actions & Preferences */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Sound Alert Toggle */}
            <button
              id="header-sound-toggle-btn"
              onClick={onToggleSound}
              title={settings.soundEnabled ? 'Alert chime sound is enabled' : 'Alert sound is muted'}
              className={`p-2 rounded-xl border text-xs transition-all ${
                settings.soundEnabled
                  ? 'bg-slate-900 border-slate-700 text-emerald-400 hover:border-emerald-500/50'
                  : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* SMS / Phone Alert Trigger */}
            {onOpenPhoneModal && (
              <button
                id="header-sms-alert-btn"
                onClick={onOpenPhoneModal}
                title="Configure SMS & Mobile Alert notifications via OTP"
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isPhoneVerified
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{isPhoneVerified ? 'SMS Active' : 'SMS Alerts'}</span>
              </button>
            )}

            {/* Notification Permission Button */}
            {notificationPermission !== 'granted' && (
              <button
                id="header-push-enable-btn"
                onClick={onRequestNotificationPermission}
                title="Enable browser desktop notifications for instant alerts"
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-all cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                <span>Enable Push</span>
              </button>
            )}

            {/* Settings Trigger */}
            <button
              id="header-settings-btn"
              onClick={() => setCurrentTab('settings')}
              title="Preferences & Audio Settings"
              className={`p-2 rounded-xl border transition-all ${
                currentTab === 'settings'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Main CTA: Create Scout */}
            <button
              id="header-create-watch-cta"
              onClick={onOpenCreateModal}
              className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Create Watch</span>
            </button>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-800/60 overflow-x-auto text-xs">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1 rounded-lg font-medium ${
              currentTab === 'dashboard' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            Radar ({activeWatchesCount})
          </button>
          <button
            onClick={() => setCurrentTab('radar')}
            className={`px-3 py-1 rounded-lg font-medium ${
              currentTab === 'radar' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            Chart Guide
          </button>
          <button
            onClick={() => setCurrentTab('calculator')}
            className={`px-3 py-1 rounded-lg font-medium ${
              currentTab === 'calculator' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            SS Quota
          </button>
          <button
            onClick={() => setCurrentTab('history')}
            className={`px-3 py-1 rounded-lg font-medium ${
              currentTab === 'history' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            History
          </button>
        </div>
      </div>
    </header>
  );
};
