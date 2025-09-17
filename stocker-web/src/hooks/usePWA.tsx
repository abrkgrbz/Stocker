import { useState, useEffect, useCallback } from 'react';
import { message, notification } from 'antd';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAStatus {
  isInstalled: boolean;
  isInstallable: boolean;
  isOffline: boolean;
  isUpdateAvailable: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

export function usePWA() {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isInstalled: false,
    isInstallable: false,
    isOffline: !navigator.onLine,
    isUpdateAvailable: false,
    installPrompt: null,
  });

  // Check if app is installed
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInstalled = isStandalone || (navigator as any).standalone;
      
      setPwaStatus(prev => ({ ...prev, isInstalled }));
    };

    checkInstalled();
    
    // Listen for app installed event
    window.addEventListener('appinstalled', checkInstalled);
    
    return () => {
      window.removeEventListener('appinstalled', checkInstalled);
    };
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      
      setPwaStatus(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: promptEvent,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setPwaStatus(prev => ({ ...prev, isOffline: false }));
      message.success('Bağlantı yeniden kuruldu');
    };

    const handleOffline = () => {
      setPwaStatus(prev => ({ ...prev, isOffline: true }));
      message.warning('İnternet bağlantısı kesildi. Çevrimdışı modda çalışıyorsunuz.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle service worker updates
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleUpdate = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setPwaStatus(prev => ({ ...prev, isUpdateAvailable: true }));
        
        notification.info({
          message: 'Güncelleme Mevcut',
          description: 'Yeni bir sürüm mevcut. Güncellemek için tıklayın.',
          btn: (
            <button
              onClick={() => {
                registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }}
              style={{
                padding: '4px 12px',
                background: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Güncelle
            </button>
          ),
          duration: 0,
        });
      }
    };

    navigator.serviceWorker.ready.then((registration) => {
      // Check for updates immediately
      registration.update();
      
      // Check for updates periodically (every hour)
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
      
      // Listen for update found
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            handleUpdate(registration);
          }
        });
      });
    });
  }, []);

  // Install PWA
  const installPWA = useCallback(async () => {
    if (!pwaStatus.installPrompt) return;

    try {
      await pwaStatus.installPrompt.prompt();
      const { outcome } = await pwaStatus.installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        message.success('Uygulama başarıyla yüklendi');
        setPwaStatus(prev => ({
          ...prev,
          isInstalled: true,
          isInstallable: false,
          installPrompt: null,
        }));
      } else {
        message.info('Uygulama yüklenmedi');
      }
    } catch (error) {
      // Error handling removed for production
      message.error('Yükleme sırasında bir hata oluştu');
    }
  }, [pwaStatus.installPrompt]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      message.warning('Tarayıcınız bildirimleri desteklemiyor');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        message.success('Bildirimler etkinleştirildi');
        return true;
      } else {
        message.info('Bildirim izni verilmedi');
        return false;
      }
    }

    message.warning('Bildirimler engellenmiş. Tarayıcı ayarlarından etkinleştirin.');
    return false;
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      message.warning('Push bildirimleri desteklenmiyor');
      return null;
    }

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Subscribe
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        
        if (!vapidPublicKey) {
          // Error handling removed for production
          return null;
        }
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
        
        // Send subscription to server
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription),
        });
        
        message.success('Push bildirimleri etkinleştirildi');
      }
      
      return subscription;
    } catch (error) {
      // Error handling removed for production
      message.error('Push bildirimleri etkinleştirilemedi');
      return null;
    }
  }, [requestNotificationPermission]);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        
        message.success('Push bildirimleri devre dışı bırakıldı');
      }
    } catch (error) {
      // Error handling removed for production
      message.error('Push bildirimleri devre dışı bırakılamadı');
    }
  }, []);

  // Share API
  const share = useCallback(async (data: ShareData) => {
    if (!navigator.share) {
      message.warning('Paylaşım özelliği desteklenmiyor');
      return false;
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        // Error handling removed for production
        message.error('Paylaşım başarısız');
      }
      return false;
    }
  }, []);

  return {
    ...pwaStatus,
    installPWA,
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    share,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}