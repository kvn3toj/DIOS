'use client';

import { useEffect } from 'react';
import {
  registerServiceWorker,
  subscribeToPushNotifications,
  enableBackgroundSync,
} from '@/utils/serviceWorker';

interface ServiceWorkerEvent extends Event {
  isUpdate?: boolean;
}

const ServiceWorkerRegistration: React.FC = () => {
  useEffect(() => {
    const initServiceWorker = async () => {
      try {
        const registration = await registerServiceWorker();

        if (registration) {
          // Listen for service worker lifecycle events
          registration.addEventListener('installed', (event: Event) => {
            const swEvent = event as ServiceWorkerEvent;
            if (swEvent.isUpdate) {
              console.log('New content is available; please refresh.');
            } else {
              console.log('Content is cached for offline use.');
            }
          });

          registration.addEventListener('activated', () => {
            console.log('Service worker activated');
          });

          registration.addEventListener('controlling', () => {
            console.log('Service worker is controlling the page');
          });

          // Setup push notifications
          const subscription = await subscribeToPushNotifications(registration);
          if (subscription) {
            // Send subscription to backend
            // TODO: Implement backend integration
            console.log('Push notification subscription successful');
          }

          // Enable background sync
          const syncEnabled = await enableBackgroundSync(registration);
          if (syncEnabled) {
            console.log('Background sync enabled');
          }
        }
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };

    initServiceWorker();
  }, []);

  return null;
};

export default ServiceWorkerRegistration;
