const C = 'licencias-v22';
const BASE = ['./', 'index.html', 'estilos.css', 'app.js', 'config.js', 'manifest.webmanifest', 'icon-192.png'];
// siempre se pide la versión más reciente a GitHub (sin esperar a que caduque la caché del navegador);
// la copia guardada solo se usa si no hay conexión
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(BASE.map(u => new Request(u, { cache: 'reload' })))).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(u.href, { cache: 'no-cache', credentials: 'same-origin' }).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
});
