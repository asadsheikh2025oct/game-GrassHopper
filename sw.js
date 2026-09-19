// Service worker: caches the whole game so it loads instantly and works offline.
// Bump CACHE_VERSION whenever you change the game files so players get the new version.
const CACHE_VERSION = 'hop-v22';
const FILES = ['./', './index.html', './style.css', './game.js', './editor.html', './manifest.json', './icon-192.png', './icon-512.png'];

// The title font comes from Google Fonts; cache its stylesheet and font files too so it survives offline.
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap';
async function cacheFonts(c) {
  try {
    const res = await fetch(FONT_CSS); if (!res.ok) return;
    await c.put(FONT_CSS, res.clone());
    const urls = [...(await res.text()).matchAll(/url\(([^)]+)\)/g)].map(m => m[1]);
    await Promise.all(urls.map(u => fetch(u).then(r => r.ok && c.put(u, r)).catch(() => {})));
  } catch (e) { /* offline or blocked: the game falls back to a system font */ }
}

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(FILES).then(() => cacheFonts(c))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  // remove caches from older versions
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Network first (so updates arrive), fall back to the cache when offline.
  e.respondWith(
    fetch(e.request).then(res => {
      // keep a copy of good responses only (not errors or dev-server redirects, which would shadow the precached files)
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE_VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
