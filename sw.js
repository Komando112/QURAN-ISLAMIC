// =============================================
//  SERVICE WORKER — قرآن كريم PWA v2
//  تحديث الكاش لإجبار المتصفح على تحميل الملفات الجديدة
// =============================================

// ⚠️ غيّر هذا الرقم في كل مرة تحدّث فيها الملفات
const CACHE_NAME = 'quran-pwa-v4';

const STATIC_ASSETS = [
  './',
  './index.html',
  './config.js',
  './main.js',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  // الخط الجديد Noto Naskh Arabic
  'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;700;800&display=swap'
];

// ── Install: cache static assets ──
self.addEventListener('install', event => {
  // تخطي الانتظار وتفعيل النسخة الجديدة فوراً
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
});

// ── Activate: حذف جميع الكاشات القديمة فوراً ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => {
            console.log('[SW] حذف كاش قديم:', k);
            return caches.delete(k);
          })
      );
    }).then(() => {
      console.log('[SW] تم تفعيل النسخة الجديدة:', CACHE_NAME);
      return self.clients.claim();
    })
  );
});

// ── Fetch ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API calls → network first, no cache
  if (url.hostname === 'api.alquran.cloud' || url.hostname === 'everyayah.com') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // للملفات المحلية → network first لضمان التحديث
  if (url.hostname === self.location.hostname || url.protocol === 'file:') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // باقي الموارد → cache first
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
    dir: 'rtl', lang: 'ar',
    vibrate: [200, 100, 200],
    tag: 'ayah-of-day', renotify: true,
    data: { url: './' },
    actions: [
      { action: 'open', title: 'اقرأ التفسير' },
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
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});

// ── Background Sync ──
self.addEventListener('sync', event => {
  if (event.tag === 'send-ayah-notification') {
    event.waitUntil(sendScheduledAyahNotification());
  }
});

async function sendScheduledAyahNotification() {
  try {
    const seed = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    const ayahNum = Math.abs(hash % 6236) + 1;
    const res = await fetch('https://api.alquran.cloud/v1/ayah/' + ayahNum);
    const data = await res.json();
    if (!data.data) return;
    const ayah = data.data;
    await self.registration.showNotification('آية اليوم 📖', {
      body: ayah.text.substring(0, 120) + '...\n' + ayah.surah.name + ' - الآية ' + ayah.numberInSurah,
      dir: 'rtl', lang: 'ar',
      tag: 'ayah-of-day', renotify: true,
      vibrate: [300, 150, 300],
      data: { ayahNum, url: './' }
    });
  } catch(e) {
    console.error('Failed to send ayah notification:', e);
  }
}
