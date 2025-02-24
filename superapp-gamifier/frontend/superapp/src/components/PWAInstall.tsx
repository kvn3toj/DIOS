import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if the app is already installed
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      // Clear the deferredPrompt for the next time
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <h3 className="text-lg font-semibold mb-2">Install SuperApp</h3>
        <p className="text-gray-600 mb-4">
          Install SuperApp on your device for a better experience and offline access.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setIsInstallable(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Not now
          </button>
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
