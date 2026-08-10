/* Turné Menedzser — service worker
   Cél: az APP-HÉJ offline is elinduljon (index.html, icons.js, manifest, ikonok).
   A külső források (Leaflet, betűk, térkép-csempék, város- és előadófotók) NEM
   kerülnek gyorsítótárba: netkapcsolat nélkül a játék elindul, csak a térkép és a
   fotók hiányoznak — a kód `HAS_MAP` és a kép-fallback ezt kezeli.

   FRISSÍTÉS: a héj HÁLÓZAT-ELSŐ, ezért új verzió azonnal érkezik, ha van net;
   offline a cache-elt példány jön. A CACHE nevét minden kiadásnál emeljük, és az
   aktiválás töröl minden korábbit — így nem ragadhat be régi build. */
const CACHE = 'tm-shell-v5';
const SHELL = [
  './',
  './index.html',
  './icons.js?v=3',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './assets/logo-empire.webp',
  './assets/bg-start.webp'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
      .catch(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) {
        return Promise.all(ks.map(function (k) {
          return k === CACHE ? null : caches.delete(k);   // régi buildek takarítása
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        // CDN/térkép/fotó: érintetlen

  /* Navigáció (az app indítása): hálózat-első, offline a cache-elt héj. */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(function (res) {
          const copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
          return res;
        })
        .catch(function () {
          return caches.match('./index.html').then(function (r) {
            return r || caches.match('./');
          });
        })
    );
    return;
  }

  /* Saját statikus fájlok: cache-ből azonnal, közben csendben frissítjük. */
  e.respondWith(
    caches.match(req).then(function (hit) {
      const net = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
