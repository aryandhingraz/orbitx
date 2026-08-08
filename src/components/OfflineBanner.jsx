import { useState, useEffect } from 'react';
import '../styles/components/offlineBanner.css';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    function handleOffline() {
      setIsOffline(true);
    }

    function handleOnline() {
      setIsOffline(false);
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="offline-banner" role="alert">
      <span>📡 SYSTEM OFFLINE — Displaying cached last-known telemetry feeds</span>
    </div>
  );
}
