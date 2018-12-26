

const CACHE_NAME = "cache-v1";
const assetToCache = [
    "/index.html"];

self.addEventListener("install", function(event) {
    console.log("installing");
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(assetToCache);
        })
        .catch(console.error)
    );
  });