const CACHE_NAME = 'portfolio-models-v1';

// Models to pre-cache in the background after install
const PRECACHE_URLS = [
  '/models/snowy_mountian.glb',
  '/models/need_some_space.glb',
  '/models/wanderer_above_the_sea_of_fog.glb',
  '/models/dalithe_persistence_of_memory.glb',
  '/models/window.glb',
];

self.addEventListener('install', (event) => {
  // Skip waiting so the SW activates immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache models one by one — don't fail install if one is missing
      return Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch(() => {/* ignore individual failures */})
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only intercept GLB model requests
  if (!url.pathname.endsWith('.glb')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      // Not cached yet — fetch, cache, and return
      const response = await fetch(event.request);
      if (response.ok) {
        cache.put(event.request, response.clone());
      }
      return response;
    })
  );
});
