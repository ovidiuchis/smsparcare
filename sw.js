const CACHE_NAME = 'smsparcare-v2'; // Bump this for updates
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/data.js',
    './icon.png',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    // Force new SW to take over immediately if possible, or wait
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', (event) => {
    // Cleanup old caches
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((authCacheName) => {
                    if (authCacheName !== CACHE_NAME) {
                        return caches.delete(authCacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});

// Listen for "connected" message to trigger immediate update
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
