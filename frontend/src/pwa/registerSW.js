/**
 * CVScanner PWA Service Worker Registration
 * Fails silently — never breaks the app
 */

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

export function initInstallPrompt() {
  // No-op — install prompt is now handled inside InstallBanner component directly
}

export function triggerInstall() {}
export function isInstallable() { return false; }
