/**
 * CVScanner PWA Install Banner
 * - Shows only on mobile
 * - Shows only once (localStorage)
 * - Does NOT interfere with any existing UI
 * - Fails silently if anything goes wrong
 */

import { useState, useEffect } from 'react';
import { triggerInstall, isInstallable } from './registerSW';

function InstallBanner() {
  const [show, setShow] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    try {
      // Only show on mobile
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      // Only show once
      const dismissed = localStorage.getItem('pwa-banner-dismissed');
      // Only in production
      const isProd = import.meta.env.PROD;

      if (!isMobile || dismissed || !isProd) return;

      // Check if already installable
      if (isInstallable()) {
        setCanInstall(true);
        setShow(true);
      }

      // Listen for install prompt
      const onInstallable = () => {
        setCanInstall(true);
        setShow(true);
      };
      window.addEventListener('pwa-installable', onInstallable);

      // Hide after install
      const onInstalled = () => setShow(false);
      window.addEventListener('pwa-installed', onInstalled);

      return () => {
        window.removeEventListener('pwa-installable', onInstallable);
        window.removeEventListener('pwa-installed', onInstalled);
      };
    } catch {
      // Fail silently
    }
  }, []);

  const handleInstall = () => {
    try {
      triggerInstall();
      setShow(false);
      localStorage.setItem('pwa-banner-dismissed', '1');
    } catch {
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa-banner-dismissed', '1');
  };

  if (!show) return null;

  return (
    <div className="pwa-banner" role="banner" aria-label="Install app">
      <div className="pwa-banner-content">
        <span className="pwa-banner-icon">📱</span>
        <span className="pwa-banner-text">
          Install CVScanner for a better experience
        </span>
      </div>
      <div className="pwa-banner-actions">
        {canInstall ? (
          <button className="pwa-btn-install" onClick={handleInstall}>
            Install
          </button>
        ) : (
          <span className="pwa-banner-hint">
            Open in Chrome → Add to Home Screen
          </span>
        )}
        <button className="pwa-btn-dismiss" onClick={handleDismiss} aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
}

export default InstallBanner;
