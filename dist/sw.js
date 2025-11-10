const cacheName = "v1";

async function impl(e) {
    const req = e.request;

    // Only handle GET requests (don't try to cache POST/PUT/etc.)
    if (req.method !== 'GET') {
        return fetch(req);
    }

    const cache = await caches.open(cacheName);
    const cacheResponse = await cache.match(req);
    if (cacheResponse) return cacheResponse;

    // Fall back to network. Only attempt to cache http(s) resources and successful responses.
    try {
        const networkResponse = await fetch(req);

        const isHttpScheme = req.url && (req.url.startsWith('http://') || req.url.startsWith('https://'));
        if (isHttpScheme && networkResponse && networkResponse.ok) {
            try {
                await cache.put(req, networkResponse.clone());
            } catch (putErr) {
                // Swallow cache.put errors (e.g. unsupported schemes like chrome-extension:)
                console.warn('ServiceWorker: cache.put failed for', req.url, putErr);
            }
        }

        return networkResponse;
    } catch (err) {
        // If network fails, try to return any cached response we might have (already checked above),
        // otherwise rethrow the error so the fetch promise rejects as expected.
        const fallback = await cache.match(req);
        if (fallback) return fallback;
        throw err;
    }
}

self.addEventListener('fetch', e => e.respondWith(impl(e)));