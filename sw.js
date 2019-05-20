// install service worker
self.addEventListener('install', event => {
    console.log('service worker has been installed');
});

// activate event
self.addEventListener('activate', event => {
    console.log('service worker has been activated');
});