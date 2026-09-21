import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  SeatScoutWatch, 
  NotificationSettings, 
  AlertHistoryItem,
  PingLogEntry
} from './types';
import { 
  getInitialWatches, 
  saveWatches, 
  getStoredSettings, 
  saveStoredSettings, 
  getAlertHistory, 
  saveAlertHistory,
  getStoredTheme,
  saveStoredTheme,
  AppTheme
} from './utils/storage';
import { playSeatAlertSound, sendDesktopNotification, requestNotificationPermission } from './utils/audioAlert';
import { PhoneNotificationModal } from './components/PhoneNotificationModal';
import { InAppNotificationToast } from './components/InAppNotificationToast';
import { PhoneNotificationClient } from './services/phoneNotificationClient';
import { 
  fetchLiveAvailability, 
  fetchLiveAvailabilityDetailed,
  fetchNetworkHealth 
} from './services/railwayApi';
import { 
  calculateAdaptivePolling, 
  recordNetworkObservation,
  updateGatewayHealth 
} from './services/adaptivePollingService';

import { SimpleHeader } from './components/SimpleHeader';
import { CreateWatchScreen } from './components/CreateWatchScreen';
import { MonitoringScreen } from './components/MonitoringScreen';
import { HowItWorksScreen } from './components/HowItWorksScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { RadarDashboard } from './components/RadarDashboard';
import { RadarApiService } from './services/radarApiService';
import { ServerRadarJob } from './types';

export default function App() {
  const [watches, setWatches] = useState<SeatScoutWatch[]>(() => {
    const loaded = getInitialWatches();
    return loaded.map((w) => ({
      ...w,
      adaptivePolling: calculateAdaptivePolling(w)
    }));
  });
  const [settings, setSettings] = useState<NotificationSettings>(() => getStoredSettings());
  const [history, setHistory] = useState<AlertHistoryItem[]>(() => getAlertHistory());
  const [theme, setTheme] = useState<AppTheme>(() => getStoredTheme());
  const inFlightScansRef = useRef<Set<string>>(new Set());

  // 24/7 Backend Server Radars State
  const [serverRadars, setServerRadars] = useState<ServerRadarJob[]>([]);
  const [highlightRadarId, setHighlightRadarId] = useState<string | null>(null);

  // Screen State: 'create' | 'monitoring' | 'history' | 'how_it_works'
  const [currentScreen, setCurrentScreen] = useState<'create' | 'monitoring' | 'history' | 'how_it_works'>('create');
  const [activeWatchId, setActiveWatchId] = useState<string | null>(() => {
    const initial = getInitialWatches();
    return initial.length > 0 ? initial[0].id : null;
  });

  // Phone & SMS Notification State
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(() => PhoneNotificationClient.getSavedPhone());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const handleRequestNotificationPermission = async () => {
    const res = await requestNotificationPermission();
    setNotificationPermission(res.permission);
    if (res.isIframeBlocked || res.permission !== 'granted') {
      setIsPhoneModalOpen(true);
    }
  };

  // Fetch and poll server radars every 3.5 seconds
  const refreshServerRadars = useCallback(async () => {
    try {
      const res = await RadarApiService.listRadars();
      if (res && res.radars) {
        setServerRadars(res.radars);
      }
    } catch (err) {
      console.warn('Server radars query error:', err);
    }
  }, []);

  useEffect(() => {
    refreshServerRadars();
    const interval = setInterval(refreshServerRadars, 3500);
    return () => clearInterval(interval);
  }, [refreshServerRadars]);

  // Handle URL deep-links from push notifications (e.g. /?screen=monitoring&radarId=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const screenParam = params.get('screen');
      const radarIdParam = params.get('radarId');
      if (screenParam === 'monitoring' || screenParam === 'radar') {
        setCurrentScreen('monitoring');
        if (radarIdParam) {
          setHighlightRadarId(radarIdParam);
        }
      }
    } catch {
      // Ignore URL parsing error
    }
  }, []);

  // Theme synchronization with html element and storage
  useEffect(() => {
    saveStoredTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync to local storage
  useEffect(() => {
    saveWatches(watches);
  }, [watches]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveAlertHistory(history);
  }, [history]);

  // Find currently active watch
  const currentActiveWatch = watches.find((w) => w.id === activeWatchId) || (watches.length > 0 ? watches[0] : null);

  // Toggle Sound globally
  const handleToggleSound = () => {
    setSettings((prev) => {
      const nextVal = !prev.soundEnabled;
      if (nextVal) {
        playSeatAlertSound('chime', prev.volume);
      }
      return { ...prev, soundEnabled: nextVal };
    });
  };

  // Start new watch from create screen
  const handleStartWatch = (newWatch: SeatScoutWatch) => {
    const adaptive = calculateAdaptivePolling(newWatch);
    const watchWithAdaptive: SeatScoutWatch = {
      ...newWatch,
      adaptivePolling: adaptive,
      nextCheckAt: new Date(Date.now() + adaptive.effectiveIntervalSeconds * 1000).toISOString()
    };
    setWatches((prev) => [watchWithAdaptive, ...prev.filter((w) => w.id !== newWatch.id)]);
    setActiveWatchId(newWatch.id);
    setCurrentScreen('monitoring');
  };

  // Trigger Seat Available Alert (The Core Magical Moment)
  const triggerSeatAvailableAlert = useCallback((watchId: string, customBerths = 4) => {
    setWatches((prevWatches) => {
      let targetFoundWatch: SeatScoutWatch | null = null;

      const updated = prevWatches.map((w) => {
        if (w.id !== watchId) return w;

        const foundInfo = {
          trainNumber: w.trainNumber === 'ALL' ? '12012' : w.trainNumber || '12012',
          trainName: w.trainName || 'Kalka Shatabdi Express',
          availableBerths: customBerths,
          availabilityCode: `CURR_AVBL ${String(customBerths).padStart(4, '0')}`,
          detectedAt: new Date().toISOString(),
          bookingUrl: 'https://www.irctc.co.in/nget/train-search',
          travelClass: w.travelClass,
          quota: w.quota,
          estimatedFare: 845
        };

        const alertLogEntry: PingLogEntry = {
          id: `alert-log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          statusText: `🎉 CURR_AVBL ${customBerths} BERTHS CONFIRMED AVAILABLE`,
          availabilityCode: 'CURR_AVBL',
          seatsAvailable: customBerths,
          trainNumber: w.trainNumber === 'ALL' ? '12012' : w.trainNumber,
          adaptiveIntervalSeconds: w.adaptivePolling?.effectiveIntervalSeconds || w.checkIntervalSeconds || 15,
          latencyMs: 42,
          reason: '🚨 Instant Alert: IRCTC Current Booking released'
        };

        const updatedWatch: SeatScoutWatch = {
          ...w,
          status: 'seat_found',
          foundSeatInfo: foundInfo,
          lastCheckedAt: new Date().toISOString(),
          checkCount: w.checkCount + 1,
          pingLogs: [alertLogEntry, ...(w.pingLogs || []).slice(0, 29)]
        };

        targetFoundWatch = updatedWatch;
        return updatedWatch;
      });

      if (targetFoundWatch) {
        // Trigger Audio Chime
        if (settings.soundEnabled) {
          playSeatAlertSound('chime', settings.volume);
        }

        // Trigger Desktop Push Notification
        sendDesktopNotification(`🎉 Seat Available: ${targetFoundWatch.trainNumber} ${targetFoundWatch.trainName}`, {
          body: `${targetFoundWatch.fromStation.city} → ${targetFoundWatch.toStation.city} | ${targetFoundWatch.journeyDate} | ${targetFoundWatch.travelClass} (${targetFoundWatch.quota}) | CURR_AVBL 0004`
        });

        // Trigger SMS Notification if user verified phone number
        if (verifiedPhone) {
          PhoneNotificationClient.sendAlert({
            phone: verifiedPhone,
            trainNumber: targetFoundWatch.trainNumber,
            trainName: targetFoundWatch.trainName,
            fromStation: targetFoundWatch.fromStation.code,
            toStation: targetFoundWatch.toStation.code,
            journeyDate: targetFoundWatch.journeyDate,
            travelClass: targetFoundWatch.travelClass,
            quota: targetFoundWatch.quota,
            availableBerths: customBerths,
            channel: 'BOTH'
          }).catch((err) => console.warn('Automatic SMS alert error:', err));
        }

        // Set active watch
        setActiveWatchId(targetFoundWatch.id);
        setCurrentScreen('monitoring');

        // Record in History
        const newHistItem: AlertHistoryItem = {
          id: `hist-${Date.now()}`,
          watchId: targetFoundWatch.id,
          timestamp: new Date().toISOString(),
          trainNumber: targetFoundWatch.trainNumber,
          trainName: targetFoundWatch.trainName,
          fromCode: targetFoundWatch.fromStation.code,
          toCode: targetFoundWatch.toStation.code,
          journeyDate: targetFoundWatch.journeyDate,
          travelClass: targetFoundWatch.travelClass,
          quota: targetFoundWatch.quota,
          availableBerths: customBerths,
          actionTaken: 'viewed'
        };
        setHistory((prev) => [newHistItem, ...prev]);
      }

      return updated;
    });
  }, [settings]);

  // Adaptive Polling Monitoring Engine:
  // Dynamically scales frequency according to network health/load and journey date proximity
  useEffect(() => {
    // Check baseline gateway latency on mount
    fetchNetworkHealth().then((health) => updateGatewayHealth(health)).catch(() => {});

    const interval = setInterval(() => {
      const now = Date.now();

      setWatches((prevWatches) => {
        let hasStateUpdates = false;

        const updatedList = prevWatches.map((watch) => {
          if (watch.status !== 'monitoring') return watch;

          // Compute latest adaptive polling metrics
          const adaptive = calculateAdaptivePolling(watch);
          const effectiveIntervalMs = adaptive.effectiveIntervalSeconds * 1000;
          const lastCheck = watch.lastCheckedAt ? new Date(watch.lastCheckedAt).getTime() : 0;

          // If dynamic interval elapsed and no request is currently in-flight for this watch
          if (now - lastCheck >= effectiveIntervalMs && !inFlightScansRef.current.has(watch.id)) {
            hasStateUpdates = true;
            inFlightScansRef.current.add(watch.id);

            // Execute live API query
            (async () => {
              const startT = performance.now();
              let durationMs = 0;
              try {
                const liveDetailed = await fetchLiveAvailabilityDetailed(
                  watch.trainNumber || '12012',
                  watch.travelClass,
                  watch.quota,
                  watch.journeyDate,
                  watch.fromStation.code,
                  watch.toStation.code,
                  false
                );
                durationMs = Math.round(performance.now() - startT);

                if (liveDetailed.success && liveDetailed.availability && liveDetailed.availability.length > 0) {
                  // Report success & latency to adapt frequency dynamically
                  recordNetworkObservation(durationMs, true);
                  const match = liveDetailed.availability.find((d) => d.dateStr === watch.journeyDate) || liveDetailed.availability[0];

                  const isSeatAvailable = match && (
                    match.statusCode === 'CURR_AVBL' || 
                    (match.statusCode === 'AVAILABLE' && (match.seatsCount || 0) > 0)
                  );

                  if (isSeatAvailable) {
                    triggerSeatAvailableAlert(watch.id, match.seatsCount || 4);
                  }

                  const newPing: PingLogEntry = {
                    id: `ping-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    statusText: match ? match.statusText : 'Adaptive scan OK',
                    availabilityCode: match ? match.statusCode : 'AVL',
                    seatsAvailable: match ? match.seatsCount : undefined,
                    trainNumber: watch.trainNumber,
                    adaptiveIntervalSeconds: adaptive.effectiveIntervalSeconds,
                    latencyMs: durationMs,
                    reason: adaptive.statusReason
                  };

                  setWatches((curr) =>
                    curr.map((w) => {
                      if (w.id !== watch.id) return w;
                      const nextAdaptive = calculateAdaptivePolling(w);
                      return {
                        ...w,
                        lastCheckedAt: new Date().toISOString(),
                        nextCheckAt: new Date(Date.now() + nextAdaptive.effectiveIntervalSeconds * 1000).toISOString(),
                        checkCount: w.checkCount + 1,
                        adaptivePolling: nextAdaptive,
                        pingLogs: [newPing, ...(w.pingLogs || []).slice(0, 19)]
                      };
                    })
                  );
                } else {
                  // Service busy / returned error -> trigger backoff
                  recordNetworkObservation(durationMs, false, 503);
                  setWatches((curr) =>
                    curr.map((w) => {
                      if (w.id !== watch.id) return w;
                      const nextAdaptive = calculateAdaptivePolling(w);
                      return {
                        ...w,
                        lastCheckedAt: new Date().toISOString(),
                        nextCheckAt: new Date(Date.now() + nextAdaptive.effectiveIntervalSeconds * 1000).toISOString(),
                        checkCount: w.checkCount + 1,
                        adaptivePolling: nextAdaptive
                      };
                    })
                  );
                }
              } catch (err) {
                durationMs = Math.round(performance.now() - startT);
                recordNetworkObservation(durationMs, false, 500);
                setWatches((curr) =>
                  curr.map((w) => {
                    if (w.id !== watch.id) return w;
                    const nextAdaptive = calculateAdaptivePolling(w);
                    return {
                      ...w,
                      lastCheckedAt: new Date().toISOString(),
                      nextCheckAt: new Date(Date.now() + nextAdaptive.effectiveIntervalSeconds * 1000).toISOString(),
                      checkCount: w.checkCount + 1,
                      adaptivePolling: nextAdaptive
                    };
                  })
                );
              } finally {
                inFlightScansRef.current.delete(watch.id);
              }
            })();
          }

          // Keep adaptivePolling metadata continuously up to date in UI
          if (!watch.adaptivePolling || watch.adaptivePolling.effectiveIntervalSeconds !== adaptive.effectiveIntervalSeconds) {
            hasStateUpdates = true;
            return {
              ...watch,
              adaptivePolling: adaptive
            };
          }

          return watch;
        });

        return hasStateUpdates ? updatedList : prevWatches;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [triggerSeatAvailableAlert]);

  // Pause / Resume watch
  const handlePauseToggle = (watchId: string) => {
    setWatches((prev) =>
      prev.map((w) => {
        if (w.id !== watchId) return w;
        return { ...w, status: w.status === 'paused' ? 'monitoring' : 'paused' };
      })
    );
  };

  // Reset watch back to monitoring
  const handleResetWatch = (watchId: string) => {
    setWatches((prev) =>
      prev.map((w) => {
        if (w.id !== watchId) return w;
        return {
          ...w,
          status: 'monitoring',
          foundSeatInfo: undefined
        };
      })
    );
  };

  // Delete watch
  const handleDeleteWatch = (watchId: string) => {
    setWatches((prev) => {
      const remaining = prev.filter((w) => w.id !== watchId);
      if (activeWatchId === watchId) {
        setActiveWatchId(remaining.length > 0 ? remaining[0].id : null);
      }
      if (remaining.length === 0) {
        setCurrentScreen('create');
      }
      return remaining;
    });
  };

  // Force manual scan using real IRCTC live availability with adaptive feedback
  const handleForceScan = async (watchId: string) => {
    const targetWatch = watches.find((w) => w.id === watchId);
    if (!targetWatch) return;

    const startT = performance.now();
    try {
      const liveDetailed = await fetchLiveAvailabilityDetailed(
        targetWatch.trainNumber || '12012',
        targetWatch.travelClass,
        targetWatch.quota,
        targetWatch.journeyDate,
        targetWatch.fromStation.code,
        targetWatch.toStation.code,
        true
      );
      const durationMs = Math.round(performance.now() - startT);

      if (liveDetailed.success && liveDetailed.availability && liveDetailed.availability.length > 0) {
        recordNetworkObservation(durationMs, true);
        const match = liveDetailed.availability.find((d) => d.dateStr === targetWatch.journeyDate) || liveDetailed.availability[0];

        const isSeatAvailable = match && (
          match.statusCode === 'CURR_AVBL' || 
          (match.statusCode === 'AVAILABLE' && (match.seatsCount || 0) > 0)
        );

        if (isSeatAvailable) {
          triggerSeatAvailableAlert(targetWatch.id, match.seatsCount || 4);
        }

        const adaptive = calculateAdaptivePolling(targetWatch);
        const newPing: PingLogEntry = {
          id: `ping-${Date.now()}`,
          timestamp: new Date().toISOString(),
          statusText: match ? match.statusText : 'Manual refresh completed',
          availabilityCode: match ? match.statusCode : 'AVL',
          seatsAvailable: match ? match.seatsCount : undefined,
          trainNumber: targetWatch.trainNumber,
          adaptiveIntervalSeconds: adaptive.effectiveIntervalSeconds,
          latencyMs: durationMs,
          reason: 'Manual scan triggered by user'
        };

        setWatches((prev) =>
          prev.map((w) => {
            if (w.id !== watchId) return w;
            return {
              ...w,
              lastCheckedAt: new Date().toISOString(),
              nextCheckAt: new Date(Date.now() + adaptive.effectiveIntervalSeconds * 1000).toISOString(),
              checkCount: w.checkCount + 1,
              adaptivePolling: adaptive,
              pingLogs: [newPing, ...(w.pingLogs || []).slice(0, 19)]
            };
          })
        );
      } else {
        recordNetworkObservation(durationMs, false, 503);
      }
    } catch (err) {
      console.warn('Manual scan query failed', err);
      recordNetworkObservation(Math.round(performance.now() - startT), false, 500);
    }
  };

  // Update existing watch parameters
  const handleUpdateWatch = (updatedWatch: SeatScoutWatch) => {
    setWatches((prev) =>
      prev.map((w) => (w.id === updatedWatch.id ? updatedWatch : w))
    );
  };

  // Mark watch as booked
  const handleMarkBooked = (watchId: string) => {
    setWatches((prev) =>
      prev.map((w) => (w.id === watchId ? { ...w, status: 'booked' } : w))
    );
    setHistory((prev) =>
      prev.map((item) => (item.watchId === watchId ? { ...item, actionTaken: 'booked' } : item))
    );
  };

  const activeWatchesCount = watches.filter((w) => w.status === 'monitoring' || w.status === 'seat_found').length;
  const activeServerRadarsCount = serverRadars.filter((r) => r.status === 'ACTIVE' || r.status === 'SEAT_FOUND').length;
  const totalActiveRadarCount = activeServerRadarsCount > 0 ? activeServerRadarsCount : activeWatchesCount;

  // Radar View Mode: 'dashboard' (Default 24/7 Radar Dashboard) or 'telemetry' (Live ping logs)
  const [radarSubView, setRadarSubView] = useState<'dashboard' | 'telemetry'>('dashboard');

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === 'dark' 
        ? 'dark bg-black text-slate-100 selection:bg-blue-600 selection:text-white' 
        : 'bg-[#f8faff] text-slate-900 selection:bg-blue-600 selection:text-white'
    }`}>
      
      {/* Top Header */}
      <SimpleHeader
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        activeWatchCount={totalActiveRadarCount}
        settings={settings}
        onToggleSound={handleToggleSound}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenPhoneModal={() => setIsPhoneModalOpen(true)}
        isPhoneVerified={!!verifiedPhone}
        onRequestNotificationPermission={handleRequestNotificationPermission}
        notificationPermission={notificationPermission}
      />

      {/* In-App Live Notification Toast Broadcast */}
      <InAppNotificationToast />

      {/* Phone OTP Verification & SMS Alert Modal */}
      <PhoneNotificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onPhoneVerified={(p) => setVerifiedPhone(p)}
      />

      {/* Main Screen Content (Screen-Wise) */}
      <main className="flex-1">
        
        {/* Screen 1: Create a Seat Alert */}
        {currentScreen === 'create' && (
          <CreateWatchScreen
            onStartWatch={handleStartWatch}
            onViewActiveWatch={() => setCurrentScreen('monitoring')}
            hasActiveWatches={totalActiveRadarCount > 0}
            activeRadars={serverRadars}
            onRefreshRadars={refreshServerRadars}
          />
        )}

        {/* Screen 2: Monitoring Radar Screen (24/7 Radar Dashboard + Optional Telemetry Switch) */}
        {currentScreen === 'monitoring' && (
          <div className="space-y-4">
            {watches.length > 0 && (
              <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 flex items-center justify-end">
                <div className="inline-flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setRadarSubView('dashboard')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      radarSubView === 'dashboard'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    24/7 Radar Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => setRadarSubView('telemetry')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      radarSubView === 'telemetry'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Gateway Telemetry
                  </button>
                </div>
              </div>
            )}

            {radarSubView === 'dashboard' ? (
              <RadarDashboard
                radars={serverRadars}
                onRefreshRadars={refreshServerRadars}
                onNavigateToSearch={() => setCurrentScreen('create')}
                soundEnabled={settings.soundEnabled}
                highlightRadarId={highlightRadarId}
                onOpenPhoneModal={() => setIsPhoneModalOpen(true)}
              />
            ) : (
              <MonitoringScreen
                watches={watches}
                activeWatchId={activeWatchId || (watches.length > 0 ? watches[0].id : '')}
                onSelectWatch={(id) => setActiveWatchId(id)}
                onSimulateSeatFound={(id) => triggerSeatAvailableAlert(id, 4)}
                onTogglePause={handlePauseToggle}
                onDeleteWatch={handleDeleteWatch}
                onCreateNewWatch={() => setCurrentScreen('create')}
                onForceScan={handleForceScan}
                onMarkBooked={handleMarkBooked}
                onResetWatch={handleResetWatch}
                onUpdateWatch={handleUpdateWatch}
              />
            )}
          </div>
        )}

        {/* Screen 3: History */}
        {currentScreen === 'history' && (
          <HistoryScreen
            history={history}
            onClearHistory={() => setHistory([])}
            onCreateWatch={() => setCurrentScreen('create')}
          />
        )}

        {/* Screen 4: How It Works Guide */}
        {currentScreen === 'how_it_works' && (
          <HowItWorksScreen
            onStartWatch={() => setCurrentScreen('create')}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-blue-100 dark:border-blue-950/80 bg-white dark:bg-black py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            SeatScout · Current Booking (<span className="text-blue-600 dark:text-blue-400 font-mono font-bold">CURR_AVBL</span>) Radar for Indian Railways
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-500">
            SeatScout monitors vacant berths released at charting. All bookings are processed through the official IRCTC portal.
          </p>
        </div>
      </footer>

    </div>
  );
}
