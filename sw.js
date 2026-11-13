// Service worker: permite abrir la app sin conexión.
// Primero intenta la red (para recibir actualizaciones) y si no hay conexión usa la copia guardada.
const CACHE = 'mis-finanzas-v39';
const ASSETS = [
  './', './index.html', './styles.css', './app.js', './manifest.webmanifest',
  './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png', './icons/logo-96.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Precios y tipos de cambio (otros sitios) van siempre directo a internet
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    // no-cache: pregunta al servidor si hay versión nueva (así una actualización se ve enseguida)
    fetch(e.request, { cache: 'no-cache' })
      .then((res) => {
        // Sólo se guardan respuestas buenas (un error 404/500 no reemplaza la copia que funciona sin conexión)
        if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
        return res;
      })
      // Sin conexión: la copia guardada; la página principal sólo si lo que se pidió era una página
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
