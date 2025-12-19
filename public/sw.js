// Emergency service worker cleanup - stops all interception immediately
console.log('Emergency SW cleanup activated');

// Immediately skip waiting and claim clients
self.skipWaiting();

self.addEventListener('install', (event) => {
  console.log('Emergency SW: Installing and taking control');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Emergency SW: Activating and cleaning up');
  event.waitUntil(
    Promise.all([
      // Clear all caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('Emergency SW: Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // Take control of all clients
      self.clients.claim(),
      // Unregister this service worker after cleanup
      new Promise((resolve) => {
        setTimeout(() => {
          console.log('Emergency SW: Unregistering self');
          self.registration.unregister().then(() => {
            console.log('Emergency SW: Successfully unregistered');
            resolve(undefined);
          });
        }, 1000);
      })
    ])
  );
});

// CRITICAL: Do not intercept any fetch requests
self.addEventListener('fetch', (event) => {
  // Let all requests pass through to the network normally
  console.log('Emergency SW: Allowing fetch to pass through:', event.request.url);
  return;
});