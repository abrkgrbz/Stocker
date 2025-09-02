/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope;

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache strategies
const cacheNames = {
  static: 'static-cache-v1',
  dynamic: 'dynamic-cache-v1',
  api: 'api-cache-v1',
  images: 'images-cache-v1',
};

// Static assets (CSS, JS) - Cache First
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new CacheFirst({
    cacheName: cacheNames.static,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        maxEntries: 60,
      }),
    ],
  })
);

// Images - Cache First with expiration
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: cacheNames.images,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        maxEntries: 100,
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// API calls - Network First with fallback
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: cacheNames.api,
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 5 * 60, // 5 minutes
        maxEntries: 50,
      }),
    ],
  })
);

// Offline fallback for navigation
const navigationHandler = new NetworkFirst({
  cacheName: cacheNames.dynamic,
  networkTimeoutSeconds: 5,
});

const navigationRoute = new NavigationRoute(navigationHandler);
registerRoute(navigationRoute);

// Background sync for failed POST requests
const bgSyncPlugin = new BackgroundSyncPlugin('api-queue', {
  maxRetentionTime: 24 * 60, // 24 hours
});

registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/api/') && request.method === 'POST',
  new NetworkFirst({
    plugins: [bgSyncPlugin],
  })
);

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'Stocker ERP';
  const options: NotificationOptions = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: data.actions || [],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  const action = event.action;

  let url = '/';
  
  if (action === 'view' && data?.url) {
    url = data.url;
  } else if (action === 'dismiss') {
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if not found
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Handle skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic background sync
self.addEventListener('periodicsync', (event: any) => {
  if (event.tag === 'update-data') {
    event.waitUntil(updateData());
  }
});

async function updateData() {
  try {
    // Fetch latest data
    const response = await fetch('/api/sync/latest');
    const data = await response.json();
    
    // Update cache
    const cache = await caches.open(cacheNames.api);
    await cache.put('/api/data/latest', new Response(JSON.stringify(data)));
    
    // Send message to clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'DATA_UPDATED',
        data: data,
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => !Object.values(cacheNames).includes(key))
          .map((key) => caches.delete(key))
      );
    })
  );
});