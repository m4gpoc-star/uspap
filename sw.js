const CACHE_NAME = "uspap-pwa-v1";

const ASSETS_TO_CACHE = [
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/flashcards.html",
  "/quiz.html",
  "/style.css",
  "/app.js",
  "/quiz.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];


// 安装阶段：预缓存静态资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 激活阶段：清除旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// 拦截请求：先从缓存取，取不到再走网络
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
