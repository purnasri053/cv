/**
 * CVScanner PWA Install Popup
 * - Android: waits for beforeinstallprompt, falls back to manual instructions
 * - iOS Safari: always shows manual instructions
 * - Shows on first visit only
 */

import { useState, useEffect } from 'react';
import { FaFileAlt, FaTimes, FaDownload, FaShareAlt, FaEllipsisV } from 'react-icons/fa';

function InstallBanner() {
  const [show, setShow]               = useState(false);
  const [platform, setPlatform]       = useState(''); // 'ios' | 'android' | 'desktop'
  const [deferredPrompt, setDeferred] = useState(null);

  useEffect(() => {
    // Already dismissed this session
    if (sessionStorage.getItem('pwa-dismissed')) return;

    // Already installed (running in standalone mode)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (standalone) return;

    const ua = navigator.userAgent;
    const isIOS     = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isMobile  = isIOS || isAndroid;

    if (isIOS) {
      setPlatform('ios');
      // iOS Safari — always show manual instructions after 2s
      setTimeout(() => setShow(true), 2000);
      return;
    }

    if (isAndroid || !isMobile) {
      setPlatform(isAndroid ? 'android' : 'desktop');

      // Listen for native install prompt
      const handler = (e) => {
        e.preventDefault();
        setDeferred(e);
        setTimeout(() => setShow(true), 1500);
      };
      window.addEventListener('beforeinstallprompt', handler);

      // Fallback: if no prompt fires within 4s, show manual instructions anyway
      const fallback = setTimeout(() => {
        setShow(true);
      }, 4000);

      window.addEventListener('appinstalled', () => {
        clearTimeout(fallback);
        setShow(false);
      });

      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
        clearTimeout(fallback);
      };
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      } catch {}
    }
    dismiss();
  };

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('pwa-dismissed', '1');
  };

  if (!show) return null;

  return (
    <>
      <div className="pwa-backdrop" onClick={dismiss} />
      <div className="pwa-popup" role="dialog" aria-modal="true">
        <button className="pwa-popup-close" onClick={dismiss} aria-label="Close">
          <FaTimes />
        </button>

        <div className="pwa-popup-icon"><FaFileAlt /></div>
        <h3 className="pwa-popup-title">Install CVScanner</h3>
        <p className="pwa-popup-desc">
          Add CVScanner to your home screen for instant access — works like a native app.
        </p>

        <div className="pwa-popup-features">
          <div className="pwa-feature">⚡ Instant launch</div>
          <div className="pwa-feature">📱 Native feel</div>
          <div className="pwa-feature">🔒 No app store</div>
        </div>

        {/* Android with native prompt */}
        {deferredPrompt && (
          <button className="pwa-popup-btn" onClick={handleInstall}>
            <FaDownload /> Install App
          </button>
        )}

        {/* iOS Safari instructions */}
        {platform === 'ios' && (
          <div className="pwa-popup-manual">
            <FaShareAlt style={{ color: '#818cf8', fontSize: 22, marginBottom: 10 }} />
            <p>Tap the <strong>Share</strong> button <FaShareAlt style={{ display: 'inline', verticalAlign: 'middle' }} /> at the bottom of Safari</p>
            <p style={{ marginTop: 8 }}>Then tap <strong>"Add to Home Screen"</strong></p>
          </div>
        )}

        {/* Android/Desktop without native prompt (Chrome menu fallback) */}
        {!deferredPrompt && platform !== 'ios' && (
          <div className="pwa-popup-manual">
            <FaEllipsisV style={{ color: '#818cf8', fontSize: 22, marginBottom: 10 }} />
            <p>Tap the <strong>⋮ menu</strong> in Chrome</p>
            <p style={{ marginTop: 8 }}>Then tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong></p>
          </div>
        )}

        <button className="pwa-popup-skip" onClick={dismiss}>Not now</button>
      </div>
    </>
  );
}

export default InstallBanner;
