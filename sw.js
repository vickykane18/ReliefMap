/* ===========================================================
   ReliefMap
   Service Worker — Offline-First
   Author : Vigneshan S
   Year : 2026

   Caches all app shell assets (HTML, CSS, JS, images, icons,
   fonts, manifest) so the platform keeps working offline and
   serves the offline fallback page when a request cannot be
   satisfied from cache or network.
=========================================================== */

"use strict";

const SW_VERSION = "reliefmap-v1.1.1";

const CACHE_NAMES = {
    APP: SW_VERSION + "-app",
    PAGES: SW_VERSION + "-pages",
    API: SW_VERSION + "-api",
    MEDIA: SW_VERSION + "-media"
};

/* App shell — core static assets */
const APP_SHELL = [
    "index.html",
    "map.html",
    "analytics.html",
    "ai.html",
    "news.html",
    "profile.html",
    "settings.html",
    "contact.html",
    "login.html",
    "offline.html",
    "manifest.json",

    "css/main.css",
    "css/animation.css",
    "css/sidebar.css",
    "css/navbar.css",
    "css/dashboard.css",
    "css/cards.css",
    "css/footer.css",
    "css/responsive.css",
    "css/map.css",
    "css/weather.css",
    "css/analytics.css",
    "css/charts.css",
    "css/ai.css",
    "css/news.css",
    "css/profile.css",
    "css/settings.css",
    "css/contact.css",
    "css/login.css",
    "css/modal.css",
    "css/roles.css",
    "css/chatbot.css",

    "js/config.js",
    "js/utils.js",
    "js/api.js",
    "js/layout.js",
    "js/dashboard.js",
    "js/map.js",
    "js/weather.js",
    "js/charts.js",
    "js/ai.js",
    "js/news.js",
    "js/profile.js",
    "js/settings.js",
    "js/contact.js",
    "js/auth.js",
    "js/login.js",
    "js/roles.js",
    "js/offline.js",
    "js/chatbot.js",
    "js/knowledge.json",

    "assets/profile/profile.jpg",
    "assets/images/default.png",
    "assets/images/hero.png",
    "assets/images/news-placeholder.jpg",
    "assets/images/news1.jpg",
    "assets/images/news2.jpg",
    "assets/images/news3.jpg"
];

/* ===========================================================
   INSTALL — pre-cache app shell
=========================================================== */

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAMES.APP).then((cache) => {
            // Cache each asset individually so a single failure
            // does not abort the whole install.
            return Promise.allSettled(
                APP_SHELL.map((url) =>
                    cache.add(url).catch((err) => {
                        console.warn("SW cache add skipped:", url, err);
                    })
                )
            );
        })
    );
    self.skipWaiting();
});

/* ===========================================================
   ACTIVATE — clean up old caches
=========================================================== */

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (!Object.values(CACHE_NAMES).includes(key)) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

/* ===========================================================
   STRATEGY HELPERS
=========================================================== */

function isNavigationRequest(request) {
    return request.mode === "navigate";
}

function isApiRequest(request) {
    return request.url.includes("/aoi/") || request.url.includes("/api/");
}

function isMediaRequest(request) {
    const path = new URL(request.url).pathname;
    return /\.(png|jpe?g|gif|webp|svg|ico|mp4|woff2?|ttf)$/i.test(path);
}

/* ===========================================================
   NETWORK-FIRST WITH CACHE FALLBACK (API)
   When offline, returns the last cached API response.
=========================================================== */

async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    try {
        const response = await fetch(request);
        if (response && response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await cache.match(request);
        if (cached) return cached;
        throw error;
    }
}

/* ===========================================================
   CACHE-FIRST WITH NETWORK FALLBACK (static assets)
=========================================================== */

async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response && response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        return caches.match("offline.html");
    }
}

/* ===========================================================
   FETCH HANDLER
=========================================================== */

self.addEventListener("fetch", (event) => {
    const { request } = event;

    // Only handle same-origin GET requests
    if (request.method !== "GET") return;
    if (!request.url.startsWith(self.location.origin)) {
        // Still cache media from CDNs (fonts, images) best-effort
        if (isMediaRequest(request)) {
            event.respondWith(cacheFirst(request, CACHE_NAMES.MEDIA));
        }
        return;
    }

    // Navigation → serve cached shell, fall back to offline page
    if (isNavigationRequest(request)) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAMES.PAGES).then((cache) => {
                        cache.put(request, copy);
                    });
                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(request);
                    if (cached) return cached;
                    // Prefer offline.html regardless of how it was cached
                    const scopeURL = new URL("/offline.html", self.registration.scope);
                    const offlineRes =
                        (await caches.match("offline.html")) ||
                        (await caches.match(scopeURL)) ||
                        (await caches.match(new URL("offline.html", self.registration.scope)));
                    if (offlineRes) {
                        return offlineRes;
                    }
                    return new Response(
                        "<html lang=\"en\"><body style=\"font-family:Poppins,sans-serif;background:#0b1220;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;\"><div style=\"text-align:center\"><h1>You're Offline</h1><p>ReliefMap is working offline. Connect to the network to continue.</p><button onclick=\"location.reload()\" style=\"background:#2563eb;color:#fff;border:none;padding:12px 24px;border-radius:10px;cursor:pointer;font-size:15px\">Retry</button></div></body></html>",
                        { headers: { "Content-Type": "text/html" } }
                    );
                })
        );
        return;
    }

    // API → network-first with cache fallback
    if (isApiRequest(request)) {
        event.respondWith(
            networkFirst(request, CACHE_NAMES.API).catch(async () => {
                const cached = await caches.match("offline.html");
                if (cached) return cached;
                return new Response(
                    JSON.stringify({ success: false, message: "Offline" }),
                    { headers: { "Content-Type": "application/json" } }
                );
            })
        );
        return;
    }

    // Media → cache-first
    if (isMediaRequest(request)) {
        event.respondWith(cacheFirst(request, CACHE_NAMES.MEDIA));
        return;
    }

    // All other static assets → cache-first with network fallback
    event.respondWith(cacheFirst(request, CACHE_NAMES.APP));
});

/* ===========================================================
   MESSAGE — allow clients to skip waiting / update
=========================================================== */

self.addEventListener("message", (event) => {
    if (event.data === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

/* ===========================================================
   END
=========================================================== */

console.log("✅ Service Worker Loaded");
