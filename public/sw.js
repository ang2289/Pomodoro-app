const RXV_CACHE_VERSION = 'rxv-pwa-v86-no-html-cache';
const RXV_STATIC_CACHE = `${RXV_CACHE_VERSION}-static`;

function isLocalDev() {
  return self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
}

self.addEventListener('install', (event) => {
  self.skipWaiting();

  // 開發環境不預快取，避免 localhost 首頁第一次載入吃到舊版。
  if (isLocalDev()) return;

  event.waitUntil(
    caches.open(RXV_STATIC_CACHE).then((cache) =>
      cache.addAll([
        '/manifest.json',
        '/icons/rxv-icon-192-v78.png',
        '/icons/rxv-icon-512-v78.png',
        '/icons/rxv-maskable-192-v78.png',
        '/icons/rxv-maskable-512-v78.png',
      ]).catch(() => undefined)
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('rxv-pwa-') && !key.includes(RXV_CACHE_VERSION))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();

  if (event.data?.type === 'RXV_TEST_NOTIFICATION') {
    const title = event.data.title || 'RxV 工具提醒';
    const options = {
      body: event.data.body || '回來使用 RxV 工具。',
      icon: '/icons/rxv-icon-192-v78.png',
      badge: '/icons/rxv-icon-192-v78.png',
      data: { url: event.data.url || '/' },
    };
    self.registration.showNotification(title, options);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // 關鍵：首頁、login、register、任何 SPA document 永遠不交給 SW 快取。
  // 這可避免第一次進首頁吃到舊版 index.html，造成首頁錯頁或登入狀態不同步。
  if (req.mode === 'navigate' || req.destination === 'document') {
    return;
  }

  // localhost 開發環境完全不攔截，避免 Vite HMR / 首頁 cache 互相干擾。
  if (isLocalDev()) {
    return;
  }

  // Vite chunk 檔案每次 build 可能變 hash，不快取 JS/CSS，避免 MIME type text/html 或舊 chunk 問題。
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    req.destination === 'script' ||
    req.destination === 'style'
  ) {
    return;
  }

  // 只快取圖片與 manifest/icon 這類穩定資源。
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;

    try {
      const res = await fetch(req);
      if (
        res &&
        res.status === 200 &&
        (req.destination === 'image' || url.pathname === '/manifest.json' || url.pathname.startsWith('/icons/'))
      ) {
        const copy = res.clone();
        caches.open(RXV_STATIC_CACHE).then((cache) => cache.put(req, copy)).catch(() => undefined);
      }
      return res;
    } catch {
      return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
