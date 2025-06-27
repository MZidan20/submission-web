import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import CONFIG from './config';


precacheAndRoute(self.__WB_MANIFEST);


registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-cache',
  }),
);


registerRoute(
  ({ url }) => url.origin.includes('maptiler.com'),
  new StaleWhileRevalidate({ 
    cacheName: 'maptiler-api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) => url.href.startsWith(CONFIG.BASE_URL) && request.destination !== 'image',
  new NetworkFirst({
    cacheName: 'story-api-data-cache',
  }),
);


registerRoute(
  ({ request, url }) => url.href.startsWith(CONFIG.BASE_URL) && request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'story-api-images-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);


self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received.');

  let notificationTitle;
  let notificationOptions;

  try {
    const data = event.data.json();
    notificationTitle = data.title;
    notificationOptions = {
      body: data.options.body,
      icon: 'images/icons/icon-192.png', 
      badge: 'images/icons/icon-192.png', 
    };
  } catch (e) {
    notificationTitle = 'Pemberitahuan Baru';
    notificationOptions = {
      body: event.data.text(), 
      icon: 'images/icons/icon-192.png',
      badge: 'images/icons/icon-192.png',
    };
  }

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});