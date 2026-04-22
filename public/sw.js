const CACHE_NAME = 'rifelo-v2';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  OFFLINE_URL,
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip unsupported protocols (like chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // 1. HTML Requests (Navigations) -> Network First, fallback to offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 2. Static Assets (_next/static, images, fonts) -> Cache First, fallback to Network
  if (url.pathname.startsWith('/_next/static/') || url.pathname.match(/\.(png|jpg|jpeg|svg|css|js|woff2?|json)$/)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          // Do not cache opaque responses from third parties
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
           // Provide a blank 404 response to avoid loud console error on failing images
           return new Response('', { status: 404 });
        });
      })
    );
    return;
  }

  // 3. API Calls & Dynamic Content -> Network Only (Or Network First with no aggressive caching)
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
