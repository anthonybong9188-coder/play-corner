// Play Corner offline support.
// Pages: network first (so new deploys show up straight away), cache as fallback when offline.
// Everything else: serve from cache, refresh in the background.
var CACHE = 'play-corner-v16';
var CORE = [
  './',
  './index.html',
  './match/',
  './match/index.html',
  './penalty/',
  './penalty/index.html',
  './feed/',
  './feed/index.html',
  './maths/',
  './maths/index.html',
  './sky/',
  './sky/index.html',
  './assets/animals.js',
  './assets/sfx.js',
  './assets/zh.js',
  './shop/',
  './shop/index.html',
  './zh-write/',
  './zh-write/index.html',
  './zh-write/hanzi-writer.min.js',
  './zh-write/data/ri.json',
  './zh-write/data/yue.json',
  './zh-write/data/shan.json',
  './zh-write/data/shui.json',
  './zh-write/data/huo.json',
  './zh-write/data/mu.json',
  './zh-write/data/ren.json',
  './zh-write/data/kou.json',
  './zh-write/data/tian.json',
  './zh-write/data/yu.json',
  './zh-write/data/n1.json',
  './zh-write/data/n2.json',
  './zh-write/data/n3.json',
  './zh-write/data/n4.json',
  './zh-write/data/n5.json',
  './zh-write/data/n6.json',
  './zh-write/data/n7.json',
  './zh-write/data/n8.json',
  './zh-write/data/n9.json',
  './zh-write/data/n10.json',
  './zh-write/data/mu-eye.json',
  './zh-write/data/er-ear.json',
  './zh-write/data/shou.json',
  './zh-write/data/zu.json',
  './zh-write/data/niu.json',
  './zh-write/data/yang.json',
  './zh-write/data/ma.json',
  './zh-write/data/niao.json',
  './zh-write/data/yu-fish.json',
  './zh-write/data/chong.json',
  './zh-write/data/da.json',
  './zh-write/data/xiao.json',
  './zh-write/data/shang.json',
  './zh-write/data/xia.json',
  './zh-write/data/zhong.json',
  './zh-write/data/tian-sky.json',
  './zh-write/data/yun.json',
  './zh-write/data/tu.json',
  './zh-write/data/shi-stone.json',
  './zh-write/data/men.json',
  './zh-act/',
  './zh-act/index.html',
  './zh-read/',
  './zh-read/index.html',
  './zh-say/',
  './zh-say/index.html',
  './balloon/',
  './balloon/index.html',
  './assets/app.css',
  './assets/sw-register.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './manifest.webmanifest'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('./'); });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
