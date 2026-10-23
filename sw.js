/* Offline-Unterstützung: App-Dateien beim Installieren speichern, Modell und Laufzeit beim ersten Gebrauch.
   Bei jeder Änderung an der App VERSION erhöhen, damit Nutzer die neue Version bekommen. */
const VERSION = "v21";
const CACHE = "hantel-diagnose-" + VERSION;
const SHELL = [
  "./", "index.html", "app.css", "fonts/fonts.css", "manifest.webmanifest",
  "data/lib.js", "data/clubs.js", "js/clubs.js", "js/i18n.js", "js/lang/de.js", "js/lang/fr.js", "js/catalog.js", "js/app.js", "js/video.js", "js/analysis.js", "js/share.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/favicon-32.png",
  "fonts/Inter-var.woff2", "fonts/JetBrainsMono-var.woff2"
];

self.addEventListener("install", e => {
  // cache: "reload" umgeht den Browser-Cache (GitHub Pages: 10 Minuten), sonst landen alte Dateien im neuen Speicher
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("hantel-diagnose-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") return; // local development: always fresh files
  // Zuerst aus dem Speicher, sonst laden und für später speichern (auch Modell und Laufzeit)
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok && res.type === "basic") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
