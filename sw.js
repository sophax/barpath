/* Offline-Unterstützung: App-Dateien beim Installieren speichern, Modell und Laufzeit beim ersten Gebrauch.
   Bei jeder Änderung an der App VERSION erhöhen, damit Nutzer die neue Version bekommen. */
const VERSION = "v1";
const CACHE = "hantel-diagnose-" + VERSION;
const SHELL = [
  "./", "index.html", "app.css", "fonts/fonts.css", "manifest.webmanifest",
  "data/lib.js", "js/catalog.js", "js/app.js", "js/video.js", "js/analysis.js",
  "icons/icon-192.png", "icons/icon-512.png",
  "fonts/AtkinsonHyperlegible-400.woff2", "fonts/AtkinsonHyperlegible-400i.woff2", "fonts/AtkinsonHyperlegible-700.woff2",
  "fonts/BigShouldersDisplay-600.woff2", "fonts/IBMPlexMono-500.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("hantel-diagnose-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  // Zuerst aus dem Speicher, sonst laden und für später speichern (auch Modell und Laufzeit)
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok && res.type === "basic") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
