const CACHE_NAME = 'bp-shift-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/assets/logo.png',
  '/assets/hero.png',
  '/assets/login-bg.png',
  '/assets/avatar.png',
  '/assets/attendance.png',
  '/assets/checkin.png',
  '/assets/dashboard.png',
  '/assets/greeting.png',
  '/assets/nozzles.png',
  '/assets/sales.png',
  '/assets/settings.png',
  '/assets/shifts.png'
];

// Install Event - Pre-cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline assets');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[Service Worker] Failed to cache some assets during install:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Serve from Cache or Network
self.addEventListener('fetch', (event) => {
  // Only handle local/GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached resource, but fetch in the background to update cache (stale-while-revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Ignore background fetch errors
          });
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // Cache new static assets on the fly
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (event.request.url.includes('/assets/') ||
             event.request.url.includes('.js') ||
             event.request.url.includes('.css') ||
             event.request.url.includes('fonts.googleapis.com'))
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          // If offline and request is HTML/navigation, return the cached index.html
          const acceptHeader = event.request.headers.get('accept');
          if (acceptHeader && acceptHeader.includes('text/html')) {
            return caches.match('/') || caches.match('/index.html');
          }
          throw err; // Rethrow network errors so the browser handles it properly
        });
    })
  );
});
