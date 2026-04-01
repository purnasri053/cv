/* CVScanner Service Worker v2
 * Minimal — just enough for Chrome to recognize as installable PWA
 */

const CACHE = 'cvscanner-v2';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(['/', '/index.html']).catch(() => {})
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Never intercept API calls
  const url = e.request.url;
  if (url.includes('onrender.com') || url.includes('generativelanguage') ||
      url.includes('aivencloud') || !url.startsWith('https')) return;

  // Navigation — network first, fallback to cached index.html
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html'))
    );
  }
});
