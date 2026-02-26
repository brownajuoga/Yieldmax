const CACHE_VERSION = 'yieldmax-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('✅ Cached app shell');
      return cache.addAll(CACHE_URLS);
    }).catch(err => {
      console.warn('⚠ Could not cache all resources:', err);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_VERSION)
          .map(name => {
            console.log('🗑️ Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and API calls (let IndexedDB handle them)
  if (request.method !== 'GET') {
    return;
  }

  // Serve static assets from cache
  if (url.pathname.startsWith('/assets/') || 
      url.pathname === '/index.html' ||
      url.pathname === '/') {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request)
            .then((resp) => {
              if (resp.ok) {
                const cache = caches.open(CACHE_VERSION);
                cache.then(c => c.put(request, resp.clone()));
              }
              return resp;
            })
            .catch(() => {
              // Return offline page if needed
              return new Response('Offline - no cached content', { status: 503 });
            })
        );
      })
    );
  }
});

// Background sync for queued mutations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mutations') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_MUTATIONS' });
        });
      })
    );
  }
});