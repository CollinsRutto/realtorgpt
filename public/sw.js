// Basic service worker that doesn't interfere with Next.js
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Use default browser behavior
  event.respondWith(fetch(event.request));
});