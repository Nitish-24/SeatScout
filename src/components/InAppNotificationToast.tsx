import React, { useEffect, useState } from 'react';
import { Bell, X, ExternalLink, Sparkles } from 'lucide-react';
import { subscribeToInAppNotifications } from '../utils/audioAlert';

interface InAppAlert {
  id: string;
  title: string;
  body?: string;
  timestamp: string;
}

export const InAppNotificationToast: React.FC = () => {
  const [alerts, setAlerts] = useState<InAppAlert[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToInAppNotifications(({ title, body }) => {
      const newAlert: InAppAlert = {
        id: `toast-${Date.now()}-${Math.random()}`,
        title,
        body,
        timestamp: new Date().toLocaleTimeString()
      };
      setAlerts((prev) => [newAlert, ...prev.slice(0, 2)]);

      // Auto dismiss after 8 seconds
      setTimeout(() => {
        setAlerts((curr) => curr.filter((a) => a.id !== newAlert.id));
      }, 8000);
    });

    return () => unsubscribe();
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none p-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto p-4 rounded-2xl bg-slate-900 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20 text-white space-y-2 animate-in slide-in-from-top-3 duration-300 relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black">
                <Sparkles className="w-4 h-4 text-slate-950" />
              </div>
              <h4 className="font-extrabold text-sm text-white">{alert.title}</h4>
            </div>

            <button
              onClick={() => setAlerts((curr) => curr.filter((a) => a.id !== alert.id))}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {alert.body && (
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {alert.body}
            </p>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
            <span>{alert.timestamp} · Alert Broadcast</span>
            <a
              href="https://www.irctc.co.in/nget/train-search"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 font-bold hover:underline flex items-center space-x-1"
            >
              <span>Book on IRCTC</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};
