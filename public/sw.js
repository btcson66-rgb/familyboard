const CACHE = "familyboard-v1.4.0-shell-2";
const CORE = [
  "/",
  "/app/",
  "/zh-tw/app/",
  "/offline/",
  "/manifest.webmanifest",
  "/favicon.svg",
];
self.addEventListener("install", (event) =>
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const responses = await Promise.all(
        CORE.map((path) =>
          fetch(`${path}?sw-precache=${encodeURIComponent(CACHE)}`, {
            cache: "reload",
          }),
        ),
      );
      await Promise.all(
        responses.map((response, index) => {
          if (!response.ok)
            throw new Error(`Could not precache ${CORE[index]}`);
          return cache.put(CORE[index], response.clone());
        }),
      );

      // An HTML document in Cache Storage is not enough to boot the React app.
      // Cache the generated JS and CSS referenced by both localized app shells
      // so someone can open the app offline after the service worker is ready,
      // even when they first arrived on a public guide rather than /app/.
      const shellAssets = new Set();
      for (const route of ["/app/", "/zh-tw/app/"]) {
        const html = await responses[CORE.indexOf(route)].clone().text();
        for (const match of html.matchAll(
          /(?:src|href)=["'](\/_astro\/[^"'#?]+(?:\?[^"']*)?)["']/g,
        ))
          shellAssets.add(match[1]);
      }
      await cache.addAll([...shellAssets]);
    })(),
  ),
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
