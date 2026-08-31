// Bump this when the shell/recovery behavior changes so clients discard the
// cache created by the previous service worker.
const CACHE_NAME = 'ssh-reports-shell-v2';
const SHELL_URLS = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    !['document', 'script', 'style', 'image', 'font'].includes(request.destination)
  ) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => {
        // A failed lazy JS/CSS request must never receive index.html. That
        // turns a transient chunk failure into a module parse/render error.
        if (cached) return cached;
        return request.destination === 'document' ? caches.match('/') : Response.error();
      }))
  );
});
