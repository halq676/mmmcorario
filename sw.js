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
            console.error('❌ ERROR en:', url);
          })
        )
      )
    )
  );
});