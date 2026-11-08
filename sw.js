const CACHE_VERSION = 'tank-calc-v18';
const FILES_TO_CACHE = ['/tank-calc/', '/tank-calc/index.html', '/tank-calc/locations.json'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  event.respondWith(
    fetch(req, { cache: 'no-cache' }).then(response => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(req, clone));
      }
      return response;
    }).catch(() => caches.match(req))
  );
});
