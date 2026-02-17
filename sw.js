// =============================================
//  SERVICE WORKER — قرآن كريم PWA
//  يدعم: الوضع الأوف لاين + إشعارات آية اليوم
// =============================================

const CACHE_NAME = 'quran-pwa-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './config.js',
  './main.js',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:wght@400;700&family=Tajawal:wght@300;400;500;700;800&display=swap'
];

// ── Install: cache static assets ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for static, network-first for API ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API calls → network first, fallback to cache
  if (url.hostname === 'api.alquran.cloud' || url.hostname === 'everyayah.com') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Static → cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

// ── Push Notification: آية اليوم ──
self.addEventListener('push', event => {
  let data = { title: 'قرآن كريم', body: 'آية اليوم', ayah: '' };
  try { data = event.data ? event.data.json() : data; } catch(e) {}

  const options = {
    body: data.body || data.ayah,
    icon: './icons/icon-192.png',
    badge: './icons/badge-72.png',
    dir: 'rtl',
    lang: 'ar',
    vibrate: [200, 100, 200],
    tag: 'ayah-of-day',
    renotify: true,
    data: { url: './' },
    actions: [
      { action: 'open', title: 'اقرأ التفسير', icon: './icons/icon-96.png' },
      { action: 'close', title: 'إغلاق' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'آية اليوم 📖', options)
  );
});

// ── Notification Click ──
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});

// ── Background Sync: scheduled ayah notification ──
self.addEventListener('sync', event => {
  if (event.tag === 'send-ayah-notification') {
    event.waitUntil(sendScheduledAyahNotification());
  }
});

async function sendScheduledAyahNotification() {
  try {
    // Get a random ayah (1-6236)
    const seed = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    const ayahNum = Math.abs(hash % 6236) + 1;

    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNum}`);
    const data = await res.json();
    if (!data.data) return;

    const ayah = data.data;
    await self.registration.showNotification('آية اليوم 📖', {
      body: `${ayah.text.substring(0, 120)}...\n${ayah.surah.name} - الآية ${ayah.numberInSurah}`,
      icon: './icons/icon-192.png',
      badge: './icons/badge-72.png',
      dir: 'rtl',
      lang: 'ar',
      tag: 'ayah-of-day',
      renotify: true,
      vibrate: [300, 150, 300],
      data: { ayahNum, url: './' }
    });
  } catch(e) {
    console.error('Failed to send ayah notification:', e);
  }
}
