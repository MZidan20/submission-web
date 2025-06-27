import CONFIG from '../config';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export async function requestNotificationPermission() {
  const status = await Notification.requestPermission();
  if (status === 'denied') {
    alert('Notification permission denied. Please enable notification permission in your browser settings..');
    return false;
  }
  if (status === 'default') {
    alert('Notification permission default. Please enable notification permission in your browser settings.');
    return false;
  }
  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) return;

  const subscription = await getPushSubscription();
  if (subscription) {
    alert('You are already subscribed.');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  try {
    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
    });

    await subscribePushNotification(newSubscription.toJSON());
    alert('Successfully subscribed!');
  } catch (error) {
    console.error('Failed to subscribe:', error);
    alert('Failed to subscribe.');
  }
}

export async function unsubscribe() {
    const subscription = await getPushSubscription();
    if (!subscription) {
        alert('You are not subscribed.');
        return;
    }

    try {
        await unsubscribePushNotification(subscription.endpoint);
        await subscription.unsubscribe();
        alert('Successfully unsubscribed. You will no longer receive notifications.');
    } catch (error) {
        console.error('Failed to unsubscribe :', error);
        alert('Failed to unsubscribe. Please try again later.');
    }
}