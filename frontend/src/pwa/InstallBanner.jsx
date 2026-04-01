/**
 * CVScanner PWA Install Popup
 * - Shows on ALL devices when site is installable
 * - Triggers native browser install prompt
 * - Dismissable, remembers dismissal
 */

import { useState, useEffect } from 'react';
import { FaFileAlt, FaTimes, FaDownload } from 'react-icons/fa';
import { triggerInstall, isInstallable } from './registerSW';

function InstallBanner() {
  const [show, setShow] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    try {
      // Don't show if already dismissed this session
      const dismissed = sessionStorage.getItem('pwa-dismissed');
      if (dismissed) return;

      // Show immediately if already installable
      if (isInstallable()) {
        setCanInstall(true);
        setShow(true);
      }

      // Listen for install prompt event
      const onInstallable = () => {
        const alreadyDismissed = sessionStorage.getItem('pwa-dismissed');
        if (!alreadyDismissed) {
          setCanInstall(true);
          setShow(true);
        }
      };

      const onInstalled = () => setShow(false);

      window.addEventListener('pwa-installable', onInstallable);
      window.addEventListener('pwa-installed', onInstalled);

      return () => {
        window.removeEventListener('pwa-installable', onInstallable);
        window.removeEventListener('pwa-installed', onInstalled);
      };
    } catch {
      // Fail silently
    }
  }, []);

  const handleInstall = async () => {
    try {
      await triggerInstall();
    } catch {
      // ignore
    }
    setShow(false);
    sessionStorage.setItem('pwa-dismissed', '1');
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem('pwa-dismissed', '1');
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="pwa-backdrop" onClick={handleDismiss} />

      {/* Popup */}
      <div className="pwa-popup" role="dialog" aria-label="Install CVScanner">
        <button className="pwa-popup-close" onClick={handleDismiss} aria-label="Close">
          <FaTimes />
        </button>

        <div className="pwa-popup-icon">
          <FaFileAlt />
        </div>

        <h3 className="pwa-popup-title">Install CVScanner</h3>
        <p className="pwa-popup-desc">
          Add CVScanner to your home screen for quick access — works like a native app, even offline.
        </p>

        <div className="pwa-popup-features">
          <div className="pwa-feature">⚡ Instant launch</div>
          <div className="pwa-feature">📱 Native app feel</div>
          <div className="pwa-feature">🔒 No app store needed</div>
        </div>

        {canInstall ? (
          <button className="pwa-popup-btn" onClick={handleInstall}>
            <FaDownload /> Install App
          </button>
        ) : (
          <div className="pwa-popup-manual">
            <p>Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> in your browser</p>
          </div>
        )}

        <button className="pwa-popup-skip" onClick={handleDismiss}>
          Not now
        </button>
      </div>
    </>
  );
}

export default InstallBanner;
