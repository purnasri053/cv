/* CVScanner Service Worker
 * Caches static assets only — never caches API responses
 * Safe to fail silently
 */

const CACHE_NAME = 'cvscanner-v1';

// Only cache static assets — NOT API calls
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Fail silently — don't block install
      });
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback for navigation only
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NEVER intercept API calls — let them go straight to network
  if (
    url.hostname.includes('onrender.com') ||
    url.hostname.includes('127.0.0.1') ||
    url.hostname.includes('localhost') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/analyze') ||
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/register') ||
    url.pathname.startsWith('/generativelanguage')
  ) {
    return; // Don't intercept — pass through to network
  }

  // For navigation requests (page loads) — network first, fallback to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/index.html')
      )
    );
    return;
  }

  // For static assets — cache first
  if (
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    event.request.destination === 'image' ||
    event.request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      }).catch(() => fetch(event.request))
    );
  }
});
