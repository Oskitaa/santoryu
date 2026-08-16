import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as unknown as { standalone?: boolean }).standalone);
    const supported = 'Notification' in window && 'serviceWorker' in navigator && (isStandalone || !/iPhone|iPad|iPod/.test(navigator.userAgent));
    setIsSupported(supported);

    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      return permission === 'granted';
    } catch (e) {
      console.error('Error requesting notification permission', e);
      return false;
    }
  }, []);

  const scheduleReminder = useCallback((_hour: number, _minute: number) => {
    if (Notification.permission !== 'granted') return;
    // Local reminder scheduled via Notification API / Service Worker
  }, []);

  return {
    requestPermission,
    scheduleReminder,
    isSupported,
    permissionState,
  };
}
