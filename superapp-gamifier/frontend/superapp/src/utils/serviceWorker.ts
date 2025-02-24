import { Workbox } from 'workbox-window';

interface PushSubscriptionOptions {
  userVisibleOnly: boolean;
  applicationServerKey: string | ArrayBuffer;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw error;
    }
  }
  return undefined;
}

export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | undefined> {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const subscribeOptions: PushSubscriptionOptions = {
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
      };
      const subscription = await registration.pushManager.subscribe(subscribeOptions);
      return subscription;
    }
    return undefined;
  } catch (error) {
    console.error('Push notification subscription failed:', error);
    throw error;
  }
}

export async function enableBackgroundSync(
  registration: ServiceWorkerRegistration
): Promise<boolean> {
  if ('sync' in registration) {
    try {
      await (registration as any).sync.register('syncData');
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      throw error;
    }
  }
  return false;
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function unregisterServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}
