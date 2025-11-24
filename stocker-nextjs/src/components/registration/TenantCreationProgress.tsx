'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signalRService, TenantCreationProgress as ProgressData } from '@/lib/signalr/signalr.service';
import { logger } from '@/lib/logger';

interface ProgressState {
  step: string;
  message: string;
  percentage: number;
  isCompleted: boolean;
  hasError: boolean;
  errorMessage?: string;
}

const stepMessages: Record<string, string> = {
  'EmailVerified': 'E-posta doğrulandı',
  'Starting': 'Başlatılıyor',
  'CreatingTenant': 'Şirket kaydı oluşturuluyor',
  'CreatingSubscription': 'Abonelik hazırlanıyor',
  'CreatingMasterUser': 'Kullanıcı hesabı oluşturuluyor',
  'CreatingDatabase': 'Veritabanı oluşturuluyor',
  'RunningMigrations': 'Veritabanı yapılandırılıyor',
  'SeedingData': 'İlk veriler yükleniyor',
  'ActivatingModules': 'Modüller aktifleştiriliyor',
  'ActivatingTenant': 'Hesabınız aktifleştiriliyor',
  'SendingWelcomeEmail': 'Hoşgeldin e-postası gönderiliyor',
  'Completed': 'Tamamlandı',
  'Failed': 'Hata oluştu'
};

export default function TenantCreationProgress() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('registrationId');

  const [progress, setProgress] = useState<ProgressState>({
    step: 'Starting',
    message: 'Hazırlanıyor...',
    percentage: 0,
    isCompleted: false,
    hasError: false,
  });

  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleProgress = useCallback((progressData: ProgressData) => {
    setProgress({
      step: progressData.step,
      message: progressData.message,
      percentage: progressData.progressPercentage,
      isCompleted: progressData.isCompleted,
      hasError: progressData.hasError,
      errorMessage: progressData.errorMessage,
    });

    // Redirect to dashboard after successful completion
    if (progressData.isCompleted && !progressData.hasError) {
      logger.info('Tenant creation completed, redirecting to login', {
        registrationId: progressData.registrationId
      });

      setTimeout(() => {
        router.push('/login?message=tenant-created');
      }, 2000);
    }
  }, [router]);

  useEffect(() => {
    if (!registrationId) {
      logger.error('No registrationId provided in URL');
      setConnectionError('Geçersiz kayıt kimliği');
      return;
    }

    let isSubscribed = true;
    let cleanupCalled = false;

    const setupSignalR = async () => {
      try {
        logger.info('Setting up SignalR connection', { registrationId });

        // Connect to SignalR
        await signalRService.connect();

        if (!isSubscribed) return;

        // Join registration group
        await signalRService.joinRegistrationGroup(registrationId);

        if (!isSubscribed) return;

        // Subscribe to progress updates
        signalRService.onTenantCreationProgress(handleProgress);

        logger.info('SignalR setup complete', { registrationId });
      } catch (error) {
        logger.error('Failed to setup SignalR', { error, registrationId });
        if (isSubscribed) {
          setConnectionError('Bağlantı kurulamadı. Lütfen sayfayı yenileyin.');
        }
      }
    };

    setupSignalR();

    // Cleanup function
    return () => {
      if (cleanupCalled) return;
      cleanupCalled = true;
      isSubscribed = false;

      logger.info('Cleaning up SignalR connection', { registrationId });

      // Unsubscribe from progress updates
      signalRService.offTenantCreationProgress();

      // Leave registration group
      if (registrationId) {
        signalRService.leaveRegistrationGroup(registrationId).catch((error) => {
          logger.warn('Failed to leave registration group during cleanup', {
            error,
            registrationId
          });
        });
      }
    };
  }, [registrationId, handleProgress]);

  if (!registrationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hata</h1>
          <p className="text-gray-600 mb-4">Geçersiz kayıt kimliği</p>
          <button
            onClick={() => router.push('/register')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kayıt Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-orange-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bağlantı Hatası</h1>
          <p className="text-gray-600 mb-4">{connectionError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }

  if (progress.hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hata Oluştu</h1>
          <p className="text-gray-600 mb-4">
            {progress.errorMessage || 'Hesap oluşturulurken bir hata oluştu'}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tekrar Dene
            </button>
            <button
              onClick={() => router.push('/register')}
              className="w-full px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Kayıt Sayfasına Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          {progress.isCompleted ? (
            <div className="text-green-500 text-6xl mb-4 animate-bounce">✅</div>
          ) : (
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {progress.isCompleted ? 'Hesabınız Hazır!' : 'Hesabınız Oluşturuluyor'}
          </h1>
          <p className="text-gray-600">
            {progress.isCompleted
              ? 'Başarıyla oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...'
              : 'Bu işlem birkaç dakika sürebilir, lütfen bekleyin'
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {stepMessages[progress.step] || progress.step}
            </span>
            <span className="text-sm font-bold text-blue-600">
              {progress.percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Current Step Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 text-center">
            {progress.message}
          </p>
        </div>

        {/* Steps Checklist */}
        <div className="space-y-3">
          {Object.entries(stepMessages).map(([stepKey, stepLabel]) => {
            if (stepKey === 'Failed') return null;

            const stepIndex = Object.keys(stepMessages).indexOf(stepKey);
            const currentStepIndex = Object.keys(stepMessages).indexOf(progress.step);
            const isCompleted = stepIndex < currentStepIndex || progress.isCompleted;
            const isCurrent = stepKey === progress.step;

            return (
              <div
                key={stepKey}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                  isCurrent ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? '✓' : stepIndex + 1}
                </div>
                <span
                  className={`text-sm ${
                    isCompleted
                      ? 'text-green-700 font-medium'
                      : isCurrent
                      ? 'text-blue-700 font-medium'
                      : 'text-gray-500'
                  }`}
                >
                  {stepLabel}
                </span>
              </div>
            );
          })}
        </div>

        {/* Info Footer */}
        {!progress.isCompleted && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              💡 Bu sayfayı kapatmayın. İşlem tamamlandığında otomatik olarak yönlendirileceksiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
