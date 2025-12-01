const CACHE_NAME = 'paketin-cache-v1';
const urlsToCache = ['/', '/manifest.json'];

// --- INSTALL ---
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// --- ACTIVATE ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    })
  );
});

// --- FETCH FIXED ---
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 1. JANGAN cache icon PWA (favicon, logo, icon-512)
  if (req.url.includes('/images/icon-') || req.url.includes('/images/logo')) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // 2. Untuk gambar umum → NETWORK FIRST
  if (req.destination === 'image') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 3. Default → CACHE FIRST
  event.respondWith(
    caches.match(req).then((res) => res || fetch(req))
  );
});

// --- PUSH NOTIFS ---
self.addEventListener('push', function (event) {
  let data = { title: 'Paketin', message: 'Ada notifikasi baru!' };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.message = event.data.text();
    }
  }

  const options = {
    body: data.message,
    icon: '/images/logo.png',
    badge: '/images/logo.png',
    vibrate: [100, 50, 100],
    data: { url: '/notifikasi' }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// --- CLICK NOTIFICATION ---
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
});
