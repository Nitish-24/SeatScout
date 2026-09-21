import React from 'react';
import { Radio, Volume2, VolumeX, History, HelpCircle, Search, Sun, Moon, Smartphone, Bell } from 'lucide-react';
import { NotificationSettings } from '../types';

interface SimpleHeaderProps {
  currentScreen: 'create' | 'monitoring' | 'history' | 'how_it_works';
  onNavigate: (screen: 'create' | 'monitoring' | 'history' | 'how_it_works') => void;
  activeWatchCount: number;
  settings: NotificationSettings;
  onToggleSound: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenPhoneModal?: () => void;
  isPhoneVerified?: boolean;
  onRequestNotificationPermission?: () => void;
  notificationPermission?: NotificationPermission;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  currentScreen,
  onNavigate,
  activeWatchCount,
  settings,
  onToggleSound,
  theme,
  onToggleTheme,
  onOpenPhoneModal,
  isPhoneVerified,
  onRequestNotificationPermission,
  notificationPermission
}) => {
  const isDark = theme === 'dark';

  return (
    <header className="border-b border-blue-100 dark:border-blue-950/80 bg-white/90 dark:bg-black/90 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        
        {/* Brand Logo with Royal Blue icon */}
        <button
          onClick={() => onNavigate('create')}
          className="flex items-center space-x-2.5 focus:outline-none group text-left cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <Radio className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base">SeatScout</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></span>
            </div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono tracking-wider uppercase block font-bold">
              Live IRCTC Radar
            </span>
          </div>
        </button>

        {/* Screen Switcher Nav */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5">
          <button
            onClick={() => onNavigate('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              currentScreen === 'create'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search & Seats</span>
            <span className="sm:hidden">Search</span>
          </button>

          <button
            onClick={() => onNavigate('monitoring')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 relative cursor-pointer ${
              currentScreen === 'monitoring'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Radar</span>
            {activeWatchCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-mono font-bold">
                {activeWatchCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('history')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
              currentScreen === 'history'
                ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden md:inline">History</span>
          </button>

          <button
            onClick={() => onNavigate('how_it_works')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
              currentScreen === 'how_it_works'
                ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Guide</span>
          </button>
        </nav>

        {/* Right Tools: SMS Alerts + Dark/Light Mode Toggle + Audio Toggle */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          
          {/* SMS / Mobile Alert Trigger via OTP */}
          {onOpenPhoneModal && (
            <button
              onClick={onOpenPhoneModal}
              title="Verify mobile number via OTP for instant 24/7 SMS berth alerts"
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isPhoneVerified
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                  : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isPhoneVerified ? 'SMS Active' : 'SMS Alerts'}</span>
            </button>
          )}

          {/* Browser Notification Permission trigger */}
          {onRequestNotificationPermission && notificationPermission !== 'granted' && (
            <button
              onClick={onRequestNotificationPermission}
              title="Enable instant browser desktop notifications"
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>Push</span>
            </button>
          )}

          {/* THEME TOGGLE BUTTON (White & Royal Blue / Black & Royal Blue) */}
          <button
            onClick={onToggleTheme}
            type="button"
            id="theme-toggle-btn"
            aria-label={isDark ? "Switch to light mode (White and Royal Blue)" : "Switch to dark mode (Black and Royal Blue)"}
            title={isDark ? "Switch to Light Mode (White & Royal Blue)" : "Switch to Dark Mode (Black & Royal Blue)"}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
              isDark
                ? 'bg-black hover:bg-blue-950/40 text-amber-300 border-blue-900/80 shadow-sm shadow-blue-950/50 hover:border-blue-700'
                : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200 shadow-sm shadow-blue-500/10 hover:border-blue-300'
            }`}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-300 animate-spin-slow transition-transform hover:rotate-45" />
                <span className="hidden sm:inline font-semibold text-white text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-700 transition-transform hover:-rotate-12" />
                <span className="hidden sm:inline font-semibold text-blue-800 text-[11px]">Dark</span>
              </>
            )}
          </button>

          {/* Audio Mute / Sound toggle */}
          <button
            onClick={onToggleSound}
            title={settings.soundEnabled ? 'Audio alerts ON' : 'Audio alerts MUTED'}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              settings.soundEnabled
                ? 'border-blue-200 dark:border-blue-900/70 bg-blue-50 dark:bg-black text-blue-700 dark:text-blue-400 hover:border-blue-400'
                : 'border-slate-200 dark:border-blue-950 bg-white dark:bg-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
