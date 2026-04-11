// ─────────────────────────────────────────────
// BUMP THIS VERSION NUMBER EVERY TIME YOU UPDATE
// The app will detect the change and refresh the cache automatically
// ─────────────────────────────────────────────
const CACHE_VERSION = 'tank-calc-v1';
const FILES_TO_CACHE = [
  '/tank-calc/',
  '/tank-calc/index.html'
];

// Install: cache all files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: delete any old cache versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
// On network success, update cache silently
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached); // if offline, use cache
      return cached || networkFetch;
    })
  );
});
