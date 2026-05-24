// Bump this whenever you want every client to drop their cache.
const CACHE = "operator-v3";

const PRECACHE = [
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Nuke every cache that isn't current so stale HTML/JS chunks die.
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
      // Tell open pages to reload so they pick up the new build immediately.
      const clients = await self.clients.matchAll({ type: "window" });
      for (const c of clients) {
        try { c.navigate(c.url); } catch (_) {}
      }
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Always go to network for HTML, Next chunks, and Supabase auth pages.
  // No HTML caching = no stale UI after redeploy.
  const isNavigate =
    req.mode === "navigate" || req.headers.get("accept")?.includes("text/html");
  const isNextChunk = url.pathname.startsWith("/_next/");

  if (isNavigate || isNextChunk) {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match(req).then((r) => r || new Response("", { status: 504 }))
      )
    );
    return;
  }

  // Cache-first only for true static assets (icons/manifest/sw itself).
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req)
        .then((res) => {
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached)
    )
  );
});
