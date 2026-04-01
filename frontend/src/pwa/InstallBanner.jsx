/**
 * CVScanner PWA Install Popup
 * Works on Android (native prompt) + iOS (manual instructions)
 * Shows on first visit, remembers dismissal
 */

import { useState, useEffect } from 'react';
import { FaFileAlt, FaTimes, FaDownload, FaShareAlt } from 'react-icons/fa';

function InstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    try {
      // Don't show if dismissed this session
      if (sessionStorage.getItem('pwa-dismissed')) return;

      // Detect iOS
      const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone;

      setIsIOS(ios);

      // Already installed — don't show
      if (isInStandaloneMode) return;

      // iOS — show manual instructions after 2 seconds
      if (ios) {
        setTimeout(() => setShow(true), 2000);
        return;
      }

      // Android/Desktop — wait for beforeinstallprompt
      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setTimeout(() => setShow(true), 1500);
      };

      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    } catch {
      // Fail silently
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
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
      <div className="pwa-backdrop" onClick={handleDismiss} />
      <div className="pwa-popup" role="dialog">
        <button className="pwa-popup-close" onClick={handleDismiss}><FaTimes /></button>

        <div className="pwa-popup-icon"><FaFileAlt /></div>
        <h3 className="pwa-popup-title">Install CVScanner</h3>
        <p className="pwa-popup-desc">
          Add to your home screen for instant access — works like a native app.
        </p>

        <div className="pwa-popup-features">
          <div className="pwa-feature">⚡ Instant launch</div>
          <div className="pwa-feature">📱 Native feel</div>
          <div className="pwa-feature">🔒 No app store</div>
        </div>

        {isIOS ? (
          <div className="pwa-popup-manual">
            <FaShareAlt style={{ color: '#818cf8', marginBottom: 8, fontSize: 20 }} />
            <p>Tap <strong>Share</strong> at the bottom of Safari, then tap <strong>"Add to Home Screen"</strong></p>
          </div>
        ) : (
          <button className="pwa-popup-btn" onClick={handleInstall}>
            <FaDownload /> Install App
          </button>
        )}

        <button className="pwa-popup-skip" onClick={handleDismiss}>Not now</button>
      </div>
    </>
  );
}

export default InstallBanner;
