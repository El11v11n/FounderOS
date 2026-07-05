/*
 * Minimal service worker: makes the app installable as a PWA.
 * Deliberately no caching yet — stale caches break silently, and the
 * app is online-first. Offline support can be added in a later phase.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Pass through — network handles everything.
});
