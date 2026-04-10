const CACHE_NAME = 'corario-v6';

const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './fonts.css',
  './main.js',
  './canciones.js',
  './manifest.json',

  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/favicon-32.png',

  './fonts/poppins-Regular.woff2',
  './fonts/Roboto-Regular.woff2'
];

// INSTALAR
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        urlsToCache.map(url =>
          cache.add(url).catch(err => {
            console.error('❌ ERROR en:', url, err);
          })
        )
      )
    )
  );
});

// ACTIVAR y limpiar cachés antiguas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// INTERCEPTAR peticiones para funcionar offline
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          if (e.request.method === 'GET' && networkResponse && networkResponse.status === 200) {
            cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
        });
      }).catch(() => {
        return caches.match('./');
      });
    })
  );
});