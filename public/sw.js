/**
 * SeatScout Service Worker - Web Push & Deep-Link Handler
 * Handles background push notifications when browser/app is closed or locked.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for incoming Web Push events from backend Radar Scheduler
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'SeatScout Radar', body: event.data.text() };
    }
  }

  const title = data.title || '🚨 Seats Available!';
  const options = {
    body: data.body || 'Current booking seats have opened up on your watched train!',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    vibrate: [250, 100, 250, 100, 250],
    tag: data.tag || 'radar-seat-alert',
    renotify: true,
    requireInteraction: true,
    data: data.data || { url: '/?screen=monitoring' },
    actions: [
      {
        action: 'open_booking',
        title: 'Open Train & Book'
      },
      {
        action: 'view_radar',
        title: 'View Radar'
      }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks with deep-linking to the exact train / radar
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const payloadData = event.notification.data || {};
  let targetUrl = payloadData.url || '/?screen=monitoring';

  // If user clicked direct book action
  if (event.action === 'open_booking') {
    targetUrl = 'https://www.irctc.co.in/nget/train-search';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate to target deep link
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client && targetUrl !== client.url) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // If no window is open, open a new window with the deep link URL
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
