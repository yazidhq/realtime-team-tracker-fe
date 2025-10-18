const CACHE_NAME = "rtt-static-v1";
const PRECACHE_URLS = ["/", "/index.html", "/vite.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) return caches.delete(key);
            return null;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Simple fetch handler: try cache, then network, cache successful GETs
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          // only cache successful responses
          if (!response || response.status !== 200 || response.type !== "basic") return response;
          const responseToCache = response.clone();
          try {
            const reqUrl = new URL(event.request.url);
            // only cache http/https same-origin requests
            if (reqUrl.protocol.startsWith("http") && reqUrl.origin === self.location.origin) {
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseToCache))
                .catch((err) => {
                  console.warn("SW: cache.put failed for", event.request.url, err);
                });
            }
          } catch (err) {
            // invalid URL or unsupported scheme (e.g. chrome-extension://)
            console.warn("SW: skip caching request", event.request.url, err);
          }
          return response;
        })
        .catch(() => {
          // fallback: if request is navigation, return the cached app shell
          if (event.request.mode === "navigate") return caches.match("/index.html");
        });
    })
  );
});
