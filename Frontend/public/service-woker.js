const CACHE_NAME = 'yieldmax-cache-v1';
const API_CACHE = 'yieldmax-api-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache API responses
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/knowledge')) {
    if (request.method === 'GET') {
      event.respondWith(
        caches.open(API_CACHE).then((cache) => {
          return cache.match(request).then((response) => {
            return (
              response ||
              fetch(request)
                .then((resp) => {
                  if (resp.ok) cache.put(request, resp.clone());
                  return resp;
                })
                .catch(() => {
                  return cache.match(request) || new Response('Offline - No cached data', { status: 503 });
                })
            );
          });
        })
      );
    }
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mutations') {
    event.waitUntil(syncPendingMutations());
  }
});

async function syncPendingMutations() {
  // This will be called when connection is restored
  // Pull from IndexedDB sync queue and send to backend
  console.log('Background sync triggered');
}