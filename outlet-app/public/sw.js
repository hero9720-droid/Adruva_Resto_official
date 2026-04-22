const CACHE_NAME = 'adruva-outlet-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip API calls for caching, handle them via background sync or offline logic in app
  if (url.pathname.startsWith('/api')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Only cache successful GET requests
          if (request.method === 'GET' && fetchResponse.status === 200) {
            cache.put(request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Fallback for document requests when offline
      if (request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});
