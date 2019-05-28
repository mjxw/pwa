const staticCacheName = "site-static-v2"; //app shell cache
const dynamicCacheName = 'site-dynamic-v1'
const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    '/img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    '/pages/fallback.html '
]; // storing request URLs

// cache size limit function
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if(keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size)) //keep calling this function until size is under limit
            }
        })
    })
}

// install service worker
self.addEventListener('install', event => {
    //console.log('service worker has been installed');
    event.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            console.log('caching shell assets');
            cache.addAll(assets);
        })
    )
});

// activate event
self.addEventListener('activate', event => {
    //console.log('service worker has been activated');
    event.waitUntil(
        caches.keys().then(keys => { //access array of keys (cache versions)
            //console.log(keys);
            return Promise.all(keys //check for cache version and delete old caches
            .filter(key => key !== staticCacheName && key !== dynamicCacheName)
            .map(key => caches.delete(key))
            )
        })
    )
});

// fetch event
self.addEventListener('fetch', event => {
    //console.log('fetch event', event);
    event.respondWith(
        caches.match(event.request).then((cacheRes) => {
            //return pre-cached asset or return initial fetch request
            return cacheRes || fetch(event.request).then((fetchRes) => {
                return caches.open(dynamicCacheName).then((cache => {
                    cache.put(event.request.url, fetchRes.clone()) //put clone of fetch response and put into cache as kv pair
                    limitCacheSize(dynamicCacheName, 2); //check everytime
                    return fetchRes; // return the original fetch response so we consume it once.
                }))
            })
        }).catch(() => {
            if (event.request.url.indexOf('.html') > -1) {
                return caches.match('/pages/fallback.html')
            }
        })
    )
});