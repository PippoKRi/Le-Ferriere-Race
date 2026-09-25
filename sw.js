// Le Ferriere Race: funziona anche senza internet (modalità aereo)
const CACHE = 'ferriere-race-v10';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// con segnale debole non si aspetta la rete più di 2,5 secondi: si apre subito la copia salvata
function withTimeout(p, ms){ return new Promise((ok, ko) => { const t = setTimeout(() => ko(new Error('timeout')), ms); p.then(r => { clearTimeout(t); ok(r); }, e => { clearTimeout(t); ko(e); }); }); }
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  if(req.mode === 'navigate'){
    const net = fetch(req).then(r => { if(r && r.ok){ const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); } return r; });
    e.respondWith(withTimeout(net, 2500).catch(() => caches.match('./index.html').then(hit => hit || net)));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if(r && r.ok){ const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return r;
  })));
});
