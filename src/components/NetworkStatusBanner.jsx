import React, { useEffect, useState } from 'react';

export default function NetworkStatusBanner() {
  const [isOffline, setIsOffline] = useState(() => (
    typeof navigator !== 'undefined' && navigator.onLine === false
  ));

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="network-status-banner" role="status" aria-live="polite">
      인터넷 연결이 끊겼습니다. 캐시된 데이터는 계속 표시됩니다.
    </div>
  );
}
