const CACHE = "familyboard-v1.2.1";
const CORE = [
  "/",
  "/app/",
  "/offline/",
  "/manifest.webmanifest",
  "/favicon.svg",
];
self.addEventListener("install", (event) =>
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE))),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin
  )
    return;
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request)
          .then(async (response) => {
            if (response.ok) {
              const cache = await caches.open(CACHE);
              await cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() =>
            event.request.mode === "navigate"
              ? caches.match("/offline/")
              : Response.error(),
          ),
    ),
  );
});
