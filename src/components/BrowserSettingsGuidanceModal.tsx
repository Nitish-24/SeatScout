import React, { useState } from 'react';
import { 
  Lock, 
  Settings, 
  RefreshCw, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  SlidersHorizontal,
  Compass,
  Laptop
} from 'lucide-react';

interface BrowserSettingsGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecheckPermission: () => Promise<void> | void;
  onOpenPhoneModal?: () => void;
}

export const BrowserSettingsGuidanceModal: React.FC<BrowserSettingsGuidanceModalProps> = ({
  isOpen,
  onClose,
  onRecheckPermission,
  onOpenPhoneModal
}) => {
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [activeBrowser, setActiveBrowser] = useState<'chrome' | 'safari' | 'firefox'>('chrome');

  if (!isOpen) return null;

  const handleRecheck = async () => {
    setIsChecking(true);
    try {
      await onRecheckPermission();
    } finally {
      setTimeout(() => setIsChecking(false), 600);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="browser-permission-title"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative text-slate-100 overflow-hidden">
        
        {/* Glowing Top Ambient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Close guidance"
          aria-label="Close guidance"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge & Title */}
        <div className="flex items-start space-x-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold uppercase tracking-wider mb-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Permission Denied in Browser</span>
            </div>
            <h2 id="browser-permission-title" className="text-lg font-extrabold text-white tracking-tight">
              Enable Notifications in Site Settings
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Your browser has notifications set to <strong className="text-rose-400">"Block"</strong> for this website. Because modern browsers prevent websites from asking again once blocked, please allow them in your site settings.
            </p>
          </div>
        </div>

        {/* Browser Selector Tabs */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveBrowser('chrome')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeBrowser === 'chrome'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Chrome / Edge / Brave</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveBrowser('safari')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeBrowser === 'safari'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Safari / Mac</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveBrowser('firefox')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeBrowser === 'firefox'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Firefox</span>
          </button>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
          {activeBrowser === 'chrome' && (
            <>
              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div className="text-xs text-slate-300">
                  Look at the top URL address bar and click the <strong className="text-white">Padlock (🔒)</strong> or <strong className="text-white">Site Info / Tune icon (⚙️)</strong> to the left of the website URL.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="text-xs text-slate-300">
                  Find the <strong className="text-white">Notifications</strong> switch and change it from <span className="text-rose-400 font-semibold">"Block"</span> to <span className="text-emerald-400 font-semibold">"Allow"</span>.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="text-xs text-slate-300">
                  Click the <strong className="text-blue-400">"Check Permission Again"</strong> button below to activate desktop seat alerts.
                </div>
              </div>
            </>
          )}

          {activeBrowser === 'safari' && (
            <>
              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div className="text-xs text-slate-300">
                  In the top Mac menu bar, open <strong className="text-white">Safari → Settings (or Preferences)</strong>.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="text-xs text-slate-300">
                  Go to the <strong className="text-white">Websites</strong> tab and select <strong className="text-white">Notifications</strong> in the left list.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="text-xs text-slate-300">
                  Find this site in the list and set permissions to <strong className="text-emerald-400">"Allow"</strong>, then return here and recheck.
                </div>
              </div>
            </>
          )}

          {activeBrowser === 'firefox' && (
            <>
              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div className="text-xs text-slate-300">
                  Click the <strong className="text-white">Padlock (🔒)</strong> or <strong className="text-white">Permission icon</strong> on the left side of the address bar.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="text-xs text-slate-300">
                  Under <strong className="text-white">Permissions</strong>, find <strong className="text-white">Send Notifications</strong> and click the <span className="text-rose-400">"✕"</span> next to Blocked.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="text-xs text-slate-300">
                  Click the <strong className="text-blue-400">"Check Permission Again"</strong> button below to re-prompt and allow.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {onOpenPhoneModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPhoneModal();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer border border-slate-700"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Use WhatsApp & Email Instead</span>
            </button>
          )}

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleRecheck}
              disabled={isChecking}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-900/40 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking...' : 'Check Permission Again'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
