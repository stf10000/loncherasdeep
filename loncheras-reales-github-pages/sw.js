/* Pequedoctor · Service Worker versionado.
   El build inyecta aquí los chunks con hash de Next.js para que el modo offline
   funcione desde la primera visita. */
const CACHE_VERSION = "pequedoctor-122101e054e6";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// En GitHub Pages de proyecto el SW vive en /nombre-repo/sw.js.
// self.registration.scope permite construir todas las rutas sin hardcodear el repo.
const SCOPE_PATH = new URL(self.registration.scope).pathname;
const BASE_PATH = SCOPE_PATH.replace(/\/$/, "");
const scoped = (path) => `${BASE_PATH}${path}`;

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/alimentos.json",
  "/manifest.json",
  "/logo-192.png",
  "/logo-512.png",
  "/config.js",
].map(scoped);

const BUILD_ASSETS = ["/_next/static/Rvh4dV3Chg3CtF2B7PqiD/_buildManifest.js",
  "/_next/static/Rvh4dV3Chg3CtF2B7PqiD/_ssgManifest.js",
  "/_next/static/chunks/117-f2e02a3a86c2ae78.js",
  "/_next/static/chunks/app/_not-found/page-701e2d86e5488441.js",
  "/_next/static/chunks/app/layout-d5f5b23e697974d3.js",
  "/_next/static/chunks/app/not-found-953a7129bfb7ab47.js",
  "/_next/static/chunks/app/page-4459ade024d36159.js",
  "/_next/static/chunks/fd9d1056-42a1c2df9c4a85a8.js",
  "/_next/static/chunks/framework-f66176bb897dc684.js",
  "/_next/static/chunks/main-26fe7fcc4e7508a5.js",
  "/_next/static/chunks/main-app-d1250bb6d611d9ee.js",
  "/_next/static/chunks/pages/_app-72b849fbd24ac258.js",
  "/_next/static/chunks/pages/_error-7ba65e1336b92748.js",
  "/_next/static/chunks/polyfills-42372ed130431b0a.js",
  "/_next/static/chunks/webpack-731addd81f11ca51.js",
  "/_next/static/css/662e310d2687bc22.css",
  "/_next/static/media/7b0b24f36b1a6d0b-s.p.woff2",
  "/_next/static/media/98848575513c9742-s.woff2"].map(scoped);

const DATA_PATHS = new Set([scoped("/alimentos.json"), scoped("/config.js")]);
const PRECACHE = [...new Set([...CORE_ASSETS, ...BUILD_ASSETS])];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        // addAll falla completo si un archivo no existe. Cacheamos uno a uno
        // para que una imagen ausente no impida la instalación de la PWA.
        Promise.allSettled(PRECACHE.map((url) => cache.add(new Request(url, { cache: "reload" }))))
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("pequedoctor-") && !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const staticCache = await caches.open(STATIC_CACHE);
    return (
      (await staticCache.match(request)) ||
      (await staticCache.match(fallbackUrl)) ||
      (await staticCache.match(scoped("/index.html"))) ||
      Response.error()
    );
  }
}

async function cacheFirst(request) {
  const staticCache = await caches.open(STATIC_CACHE);
  const runtimeCache = await caches.open(RUNTIME_CACHE);
  const cached = (await staticCache.match(request)) || (await runtimeCache.match(request));
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) runtimeCache.put(request, response.clone());
    return response;
  } catch {
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, scoped("/index.html")));
    return;
  }

  if (DATA_PATHS.has(url.pathname)) {
    event.respondWith(networkFirst(request, url.pathname));
    return;
  }

  if (
    url.pathname.startsWith(scoped("/_next/static/")) ||
    /\.(?:css|js|woff2?|png|jpg|jpeg|svg|webp|ico)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request));
  }
});
