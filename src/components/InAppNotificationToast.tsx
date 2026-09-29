import React, { useEffect, useState, useRef } from 'react';
import { 
  Bell, 
  X, 
  ExternalLink, 
  Sparkles, 
  Radio, 
  Volume2, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  subscribeToInAppNotifications, 
  InAppNotificationPayload,
  playSeatAlertSound,
  requestNotificationPermission,
  sendDesktopNotification
} from '../utils/audioAlert';
import { PushNotificationService } from '../services/pushNotification';

interface InAppAlertItem extends InAppNotificationPayload {
  id: string;
  timestampStr: string;
  durationMs: number;
}

interface InAppNotificationToastProps {
  onNavigateToRadar?: (radarId?: string) => void;
  onOpenAlertModal?: (radar?: any) => void;
}

export const InAppNotificationToast: React.FC<InAppNotificationToastProps> = ({
  onNavigateToRadar,
  onOpenAlertModal
}) => {
  const [alerts, setAlerts] = useState<InAppAlertItem[]>([]);
  const [isHoveredId, setIsHoveredId] = useState<string | null>(null);
  const [nativePermission, setNativePermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  useEffect(() => {
    const unsubscribe = subscribeToInAppNotifications((payload) => {
      const newAlert: InAppAlertItem = {
        ...payload,
        id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestampStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        durationMs: payload.type === 'SEAT_FOUND' ? 20000 : 10000 // 20 seconds for seat found
      };

      setAlerts((prev) => [newAlert, ...prev.slice(0, 2)]);
    });

    return () => unsubscribe();
  }, []);

  // Handle countdown & auto-dismiss with hover-pause
  useEffect(() => {
    if (alerts.length === 0) return;

    const interval = setInterval(() => {
      setAlerts((prev) =>
        prev
          .map((a) => {
            if (isHoveredId === a.id) return a; // Paused while hovering
            return { ...a, durationMs: a.durationMs - 500 };
          })
          .filter((a) => a.durationMs > 0)
      );
    }, 500);

    return () => clearInterval(interval);
  }, [alerts.length, isHoveredId]);

  const handleDismiss = (id: string) => {
    setAlerts((curr) => curr.filter((a) => a.id !== id));
  };

  const handleReplayChime = () => {
    playSeatAlertSound('chime', 0.85);
  };

  const handleEnableDesktopPopups = async () => {
    try {
      const res = await requestNotificationPermission();
      setNativePermission(res.permission);
      if (res.permission === 'granted') {
        await PushNotificationService.enablePushNotifications();
        sendDesktopNotification('✅ Screen Pop-ups Enabled!', {
          body: 'You will now receive top-right display alerts even when working on other tabs or desktop apps.'
        });
      }
    } catch (e) {
      console.warn('Could not enable desktop popups:', e);
    }
  };

  if (alerts.length === 0) return null;

  return (
    <aside 
      aria-label="Live Seat Scout Alerts"
      className="fixed top-4 right-4 z-[99999] flex flex-col space-y-3 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
    >
      {alerts.map((alert) => {
        const isSeatFound = alert.type !== 'INFO';
        const hasBerths = (alert.availableBerths || 0) > 0;
        const totalDuration = alert.type === 'SEAT_FOUND' ? 20000 : 10000;
        const progressPercent = Math.max(0, Math.min(100, (alert.durationMs / totalDuration) * 100));

        return (
          <div
            key={alert.id}
            onMouseEnter={() => setIsHoveredId(alert.id)}
            onMouseLeave={() => setIsHoveredId(null)}
            className={`pointer-events-auto rounded-2xl border-2 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all transform animate-in slide-in-from-top-4 duration-300 ${
              isSeatFound
                ? 'bg-slate-950/95 border-emerald-500 shadow-emerald-500/25 ring-2 ring-emerald-500/30'
                : 'bg-slate-900/95 border-blue-500 shadow-blue-500/20'
            }`}
          >
            {/* Top Glowing Header */}
            <div className={`px-4 py-2.5 flex items-center justify-between border-b ${
              isSeatFound 
                ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/30' 
                : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black tracking-wide uppercase text-emerald-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSeatFound ? '🎉 SEAT FOUND ALERT!' : 'Radar Status Alert'}</span>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-slate-400">
                  {alert.timestampStr}
                </span>
                <button
                  type="button"
                  onClick={() => handleDismiss(alert.id)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
                  title="Dismiss pop-up"
                  aria-label="Dismiss pop-up"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Alert Content Body */}
            <div className="p-4 space-y-3">
              {/* Train Name & Route */}
              <div>
                <h4 className="text-sm font-extrabold text-white leading-tight">
                  {alert.title}
                </h4>
                {alert.body && (
                  <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
                    {alert.body}
                  </p>
                )}
              </div>

              {/* Specific Berths & Route Badges */}
              {(alert.trainNumber || alert.fromCode) && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {alert.trainNumber && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      🚆 {alert.trainNumber} {alert.trainName || ''}
                    </span>
                  )}
                  {alert.fromCode && alert.toCode && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                      📍 {alert.fromCode} → {alert.toCode}
                    </span>
                  )}
                  {alert.travelClass && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Class: {alert.travelClass} ({alert.quota || 'GN'})
                    </span>
                  )}
                </div>
              )}

              {/* Primary Call-to-Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Book on IRCTC Direct Link */}
                <a
                  href={alert.bookingUrl || 'https://www.irctc.co.in/nget/train-search'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[130px] px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <span>⚡ Book on IRCTC</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* View on Radar Action */}
                {onNavigateToRadar && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToRadar(alert.radarId);
                      handleDismiss(alert.id);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs flex items-center space-x-1 transition-all cursor-pointer border border-slate-700"
                  >
                    <span>View Radar</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                  </button>
                )}

                {/* Replay Sound Chime */}
                <button
                  type="button"
                  onClick={handleReplayChime}
                  title="Replay alert chime"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Native Desktop Pop-up Assistant if not allowed */}
              {nativePermission !== 'granted' && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-amber-300/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  <div className="flex items-center space-x-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Want alerts while in other tabs?</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleEnableDesktopPopups}
                    className="ml-2 px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[10px] transition-colors cursor-pointer shadow-sm"
                  >
                    Allow Pop-ups
                  </button>
                </div>
              )}
            </div>

            {/* Countdown Auto-Dismiss Progress Bar */}
            <div className="w-full bg-slate-800/80 h-1">
              <div
                className="bg-emerald-400 h-1 transition-all duration-500 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        );
      })}
    </aside>
  );
};
