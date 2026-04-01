/**
 * CVScanner PWA Service Worker Registration
 * - Only runs in production
 * - Fails silently — never breaks the app
 * - Does NOT modify any existing code
 */

export function registerServiceWorker() {
  // Only in production and if browser supports it
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Silent success
          reg.addEventListener('updatefound', () => {
            // New version available — silent update
          });
        })
        .catch(() => {
          // Fail silently — app works fine without SW
        });
    });
  }
}

/**
 * PWA Install prompt handler
 * Returns the deferred prompt event or null
 */
let deferredPrompt = null;

export function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Dispatch custom event so components can react
    window.dispatchEvent(new CustomEvent('pwa-installable'));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
}

export function triggerInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
    });
  }
}

export function isInstallable() {
  return deferredPrompt !== null;
}
