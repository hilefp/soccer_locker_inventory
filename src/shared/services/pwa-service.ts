/**
 * PWA Service Worker Registration and Update Management
 * Handles auto-update strategy for the PWA
 */

export interface PWAUpdateStatus {
  needsRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => Promise<void>;
}

export class PWAService {
  private updateCallback: ((status: PWAUpdateStatus) => void) | null = null;

  /**
   * Register service worker and set up auto-update listener
   */
  async register(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported in this browser');
      return;
    }

    try {
      // The vite-plugin-pwa will inject the service worker registration
      // This is just a placeholder for additional logic if needed
      console.log('PWA Service initialized');
    } catch (error) {
      console.error('PWA registration error:', error);
    }
  }

  /**
   * Check for service worker updates manually
   */
  async checkForUpdates(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
    }
  }

  /**
   * Subscribe to PWA update events
   */
  onUpdateAvailable(callback: (status: PWAUpdateStatus) => void): void {
    this.updateCallback = callback;
  }

  /**
   * Force update to new service worker
   */
  async forceUpdate(): Promise<void> {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
}

export const pwaService = new PWAService();
