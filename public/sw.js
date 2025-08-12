// ABC-List Service Worker for PWA functionality
// Provides offline capabilities, caching, background sync, and push notifications

const CACHE_NAME = 'abc-list-v1';
const DATA_CACHE_NAME = 'abc-list-data-v1';

// Static assets to cache for offline functionality
const STATIC_CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './assets/favicon.png',
  './assets/drawer-150x150.png',
  './assets/icon.png',
  './assets/adaptive-icon.png',
  './assets/splash.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_CACHE_FILES);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim control of all clients
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If online, serve from network and update cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If offline, serve from cache
          return caches.match('./index.html');
        })
    );
    return;
  }

  // Handle static assets - cache first strategy
  if (STATIC_CACHE_FILES.some(file => request.url.includes(file))) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((response) => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          });
        })
    );
    return;
  }

  // Handle all other requests - network first, then cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // If response is valid, clone and cache it
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DATA_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(request);
      })
  );
});

// Background Sync for offline data synchronization
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-abc-lists') {
    event.waitUntil(syncABCLists());
  } else if (event.tag === 'background-sync-basar') {
    event.waitUntil(syncBasarData());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push notification received');
  
  let notificationData = {
    title: 'ABC-List Lernreminder',
    body: 'Zeit für deine nächste Lerneinheit!',
    icon: './assets/icon.png',
    badge: './assets/favicon.png',
    tag: 'learning-reminder',
    requireInteraction: false,
    actions: [
      {
        action: 'open-app',
        title: 'App öffnen'
      },
      {
        action: 'dismiss',
        title: 'Später'
      }
    ]
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (e) {
      console.log('[ServiceWorker] Error parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      data: {
        url: './',
        action: 'open-app'
      }
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click received');
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // If app is not open, open it
        if (clients.openWindow) {
          return clients.openWindow('./');
        }
      })
  );
});

// Background sync functions
async function syncABCLists() {
  try {
    console.log('[ServiceWorker] Syncing ABC Lists data');
    
    // Get stored data that needs to be synced
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      // Send message to client to handle sync
      clients[0].postMessage({
        type: 'BACKGROUND_SYNC',
        action: 'SYNC_ABC_LISTS'
      });
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('[ServiceWorker] Error syncing ABC Lists:', error);
    return Promise.reject(error);
  }
}

async function syncBasarData() {
  try {
    console.log('[ServiceWorker] Syncing Basar data');
    
    // Get stored data that needs to be synced
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      // Send message to client to handle sync
      clients[0].postMessage({
        type: 'BACKGROUND_SYNC',
        action: 'SYNC_BASAR'
      });
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('[ServiceWorker] Error syncing Basar data:', error);
    return Promise.reject(error);
  }
}

// Handle messages from main app
self.addEventListener('message', (event) => {
  const { data } = event;
  
  if (data && data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (data && data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return cache.addAll(data.payload);
      })
    );
  }
});