'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signalRService, TenantCreationProgress as ProgressData } from '@/lib/signalr/signalr.service';

interface ProgressState {
  step: string;
  message: string;
  percentage: number;
  isCompleted: boolean;
  hasError: boolean;
  errorMessage?: string;
}

interface VerificationParams {
  email?: string;
  code?: string;
  token?: string;
  registrationId?: string;
}

// Step configuration with icons and messages
const stepConfig: Record<string, { message: string; icon: string }> = {
  'EmailVerified': { message: 'E-posta doğrulandı', icon: '✉️' },
  'Starting': { message: 'Başlatılıyor', icon: '🚀' },
  'CreatingTenant': { message: 'Şirket kaydı oluşturuluyor', icon: '🏢' },
  'CreatingSubscription': { message: 'Abonelik hazırlanıyor', icon: '📋' },
  'CreatingMasterUser': { message: 'Kullanıcı hesabı oluşturuluyor', icon: '👤' },
  'CreatingDatabase': { message: 'Veritabanı oluşturuluyor', icon: '🗄️' },
  'RunningMigrations': { message: 'Veritabanı yapılandırılıyor', icon: '⚙️' },
  'SeedingData': { message: 'İlk veriler yükleniyor', icon: '📊' },
  'ActivatingModules': { message: 'Modüller aktifleştiriliyor', icon: '🔌' },
  'ActivatingTenant': { message: 'Hesabınız aktifleştiriliyor', icon: '✨' },
  'SendingWelcomeEmail': { message: 'Hoşgeldin e-postası gönderiliyor', icon: '📧' },
  'Completed': { message: 'Tamamlandı', icon: '🎉' },
  'Failed': { message: 'Hata oluştu', icon: '❌' }
};

export default function TenantCreationProgress() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get parameters from URL - can be either registrationId (old flow) or email+code/token (new flow)
  const verificationParams: VerificationParams = {
    email: searchParams.get('email') || undefined,
    code: searchParams.get('code') || undefined,
    token: searchParams.get('token') || undefined,
    registrationId: searchParams.get('registrationId') || undefined,
  };

  // Check localStorage for previously saved registrationId (for page refresh scenarios)
  const getStoredRegistrationId = (): string | null => {
    if (typeof window === 'undefined') return null;
    const email = verificationParams.email;
    if (!email) return null;
    const key = `tenant_creation_${email}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Only use if less than 30 minutes old
        if (data.timestamp && Date.now() - data.timestamp < 30 * 60 * 1000) {
          return data.registrationId;
        }
        localStorage.removeItem(key);
      } catch {
        localStorage.removeItem(key);
      }
    }
    return null;
  };

  const saveRegistrationId = (regId: string) => {
    if (typeof window === 'undefined') return;
    const email = verificationParams.email;
    if (!email) return;
    const key = `tenant_creation_${email}`;
    localStorage.setItem(key, JSON.stringify({
      registrationId: regId,
      timestamp: Date.now()
    }));
  };

  const clearStoredRegistrationId = () => {
    if (typeof window === 'undefined') return;
    const email = verificationParams.email;
    if (!email) return;
    const key = `tenant_creation_${email}`;
    localStorage.removeItem(key);
  };

  const storedRegId = getStoredRegistrationId();
  const [currentRegistrationId, setCurrentRegistrationId] = useState<string | null>(
    verificationParams.registrationId || storedRegId || null
  );
  const [verificationStarted, setVerificationStarted] = useState(false);
  // Use stored registrationId to determine if verification was already called
  const verificationCalledRef = useRef(!!storedRegId);

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
      console.log('Tenant creation completed, redirecting to login', {
        registrationId: progressData.registrationId
      });

      // Clear localStorage since tenant creation is complete
      clearStoredRegistrationId();

      setTimeout(() => {
        router.push('/login?message=tenant-created');
      }, 2000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Call verify-email API after SignalR is connected
  const callVerifyEmailAPI = useCallback(async (email: string, codeOrToken: string, isCode: boolean): Promise<string | null> => {
    console.log('Calling verify-email API', { email, isCode });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/public/tenant-registration/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          ...(isCode ? { code: codeOrToken } : { token: codeOrToken }),
        }),
      });

      const data = await response.json();
      console.log('Verify-email response:', data);

      if (response.ok && data.success && data.registrationId) {
        return data.registrationId;
      } else {
        throw new Error(data.message || 'E-posta doğrulama başarısız oldu');
      }
    } catch (error) {
      console.error('Verify-email API error:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    // Check if we have required parameters
    const hasVerificationParams = verificationParams.email && (verificationParams.code || verificationParams.token);
    const hasRegistrationId = verificationParams.registrationId;

    if (!hasVerificationParams && !hasRegistrationId) {
      console.error('No verification params or registrationId provided');
      setConnectionError('Geçersiz kayıt bilgisi');
      return;
    }

    let isSubscribed = true;
    let cleanupCalled = false;

    const setupSignalRAndVerify = async () => {
      try {
        console.log('Setting up SignalR connection', { verificationParams });

        // Step 1: Connect to SignalR
        await signalRService.connect();

        if (!isSubscribed) return;

        // Step 2: Subscribe to progress updates FIRST (before joining group or verifying)
        signalRService.onTenantCreationProgress(handleProgress);

        // Step 3: If we have email+code/token, we need to verify first to get registrationId
        // Check for registrationId in order: URL param > stored in localStorage > verify API
        let regId = verificationParams.registrationId || storedRegId;

        if (!regId && verificationParams.email && (verificationParams.code || verificationParams.token)) {
          // Prevent double calls
          if (verificationCalledRef.current) {
            console.log('Verification already called, skipping - using stored registrationId');
            regId = currentRegistrationId;
          } else {
            verificationCalledRef.current = true;
            setVerificationStarted(true);

            console.log('Calling verify-email API to get registrationId');
            const codeOrToken = verificationParams.code || verificationParams.token!;
            const isCode = !!verificationParams.code;

            try {
              regId = await callVerifyEmailAPI(verificationParams.email, codeOrToken, isCode);
              if (regId) {
                setCurrentRegistrationId(regId);
                // Save to localStorage for page refresh scenarios
                saveRegistrationId(regId);
                console.log('Got registrationId from verify-email:', regId);
              }
            } catch (verifyError: unknown) {
              console.error('Verification failed', verifyError);
              if (isSubscribed) {
                const errorMessage = verifyError instanceof Error ? verifyError.message : 'Doğrulama başarısız';
                setConnectionError(errorMessage);
              }
              return;
            }
          }
        }

        if (!regId) {
          console.error('No registrationId available');
          if (isSubscribed) {
            setConnectionError('Kayıt kimliği alınamadı');
          }
          return;
        }

        if (!isSubscribed) return;

        // Step 4: Join registration group with the registrationId
        await signalRService.joinRegistrationGroup(regId);

        console.log('SignalR setup complete, waiting for progress updates', { registrationId: regId });
      } catch (error) {
        console.error('Failed to setup SignalR', { error });
        if (isSubscribed) {
          setConnectionError('Bağlantı kurulamadı. Lütfen sayfayı yenileyin.');
        }
      }
    };

    setupSignalRAndVerify();

    // Cleanup function
    return () => {
      if (cleanupCalled) return;
      cleanupCalled = true;
      isSubscribed = false;

      console.log('Cleaning up SignalR connection');

      // Unsubscribe from progress updates
      signalRService.offTenantCreationProgress();

      // Leave registration group
      const regIdToLeave = currentRegistrationId || verificationParams.registrationId;
      if (regIdToLeave) {
        signalRService.leaveRegistrationGroup(regIdToLeave).catch((error) => {
          console.warn('Failed to leave registration group during cleanup', {
            error,
            registrationId: regIdToLeave
          });
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if we have required params
  const hasRequiredParams = verificationParams.registrationId ||
    (verificationParams.email && (verificationParams.code || verificationParams.token));

  if (!hasRequiredParams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#220430] via-[#28002D] to-[#1E1429] p-4">
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-[#2F70B5]/20">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Hata</h1>
          <p className="text-gray-600 mb-6">Geçersiz kayıt bilgisi</p>
          <button
            onClick={() => router.push('/register')}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#28002D] to-[#2F70B5] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#2F70B5]/30 transition-all duration-300 hover:scale-105"
          >
            Kayıt Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#220430] via-[#28002D] to-[#1E1429] p-4">
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-[#2F70B5]/20">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Bağlantı Hatası</h1>
          <p className="text-gray-600 mb-6">{connectionError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#28002D] to-[#2F70B5] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#2F70B5]/30 transition-all duration-300 hover:scale-105"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }

  if (progress.hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#220430] via-[#28002D] to-[#1E1429] p-4">
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-[#2F70B5]/20">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Hata Oluştu</h1>
          <p className="text-gray-600 mb-6">
            {progress.errorMessage || 'Hesap oluşturulurken bir hata oluştu'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#28002D] to-[#2F70B5] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#2F70B5]/30 transition-all duration-300 hover:scale-105"
            >
              Tekrar Dene
            </button>
            <button
              onClick={() => router.push('/register')}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
            >
              Kayıt Sayfasına Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get visible steps (exclude EmailVerified and Failed from display)
  const visibleSteps = Object.entries(stepConfig).filter(
    ([key]) => key !== 'EmailVerified' && key !== 'Failed'
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#220430] via-[#28002D] to-[#1E1429] p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#2F70B5]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#28002D]/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2F70B5]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-xl w-full border border-[#2F70B5]/20">
        {/* Header */}
        <div className="text-center mb-8">
          {progress.isCompleted ? (
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#28002D] to-[#2F70B5] rounded-full animate-pulse shadow-lg shadow-[#2F70B5]/40"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl animate-bounce">🎉</span>
              </div>
            </div>
          ) : (
            <div className="relative w-24 h-24 mx-auto mb-6">
              {/* Outer glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#28002D]/20 to-[#2F70B5]/20 rounded-full blur-md animate-pulse"></div>
              {/* Progress ring background */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="url(#progressGradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={276.46}
                  strokeDashoffset={276.46 - (276.46 * progress.percentage) / 100}
                  className="transition-all duration-500 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#28002D" />
                    <stop offset="100%" stopColor="#2F70B5" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-[#28002D] to-[#2F70B5] bg-clip-text text-transparent">
                  {progress.percentage}%
                </span>
              </div>
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {progress.isCompleted ? 'Hesabınız Hazır! 🚀' : 'Hesabınız Oluşturuluyor'}
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
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <span>{stepConfig[progress.step]?.icon || '⏳'}</span>
              {stepConfig[progress.step]?.message || progress.step}
            </span>
            <span className="text-sm font-bold bg-gradient-to-r from-[#28002D] to-[#2F70B5] bg-clip-text text-transparent">
              {progress.percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#28002D] to-[#2F70B5] rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progress.percentage}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Current Step Message */}
        <div className="bg-gradient-to-r from-[#220430]/5 to-[#2F70B5]/10 border border-[#2F70B5]/20 rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-700 text-center font-medium">
            {progress.message}
          </p>
        </div>

        {/* Steps Checklist - Compact Grid View */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {visibleSteps.map(([stepKey, config]) => {
            const stepIndex = Object.keys(stepConfig).indexOf(stepKey);
            const currentStepIndex = Object.keys(stepConfig).indexOf(progress.step);
            const isCompleted = stepIndex < currentStepIndex || progress.isCompleted;
            const isCurrent = stepKey === progress.step;

            return (
              <div
                key={stepKey}
                className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-[#220430]/5 to-[#2F70B5]/10 border-2 border-[#2F70B5]/30 shadow-sm'
                    : isCompleted
                    ? 'bg-green-50 border border-green-100'
                    : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-gradient-to-br from-[#28002D] to-[#2F70B5] text-white shadow-sm animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? '✓' : config.icon}
                </div>
                <span
                  className={`text-xs font-medium leading-tight ${
                    isCompleted
                      ? 'text-green-700'
                      : isCurrent
                      ? 'text-[#2F70B5] font-semibold'
                      : 'text-gray-500'
                  }`}
                >
                  {config.message}
                </span>
              </div>
            );
          })}
        </div>

        {/* Info Footer */}
        {!progress.isCompleted && (
          <div className="p-4 bg-gradient-to-r from-[#220430]/5 to-[#2F70B5]/10 border border-[#2F70B5]/20 rounded-2xl">
            <p className="text-xs text-[#28002D] text-center flex items-center justify-center gap-2">
              <span className="text-base">💡</span>
              <span>Bu sayfayı kapatmayın. İşlem tamamlandığında otomatik olarak yönlendirileceksiniz.</span>
            </p>
          </div>
        )}

        {/* Completion CTA */}
        {progress.isCompleted && (
          <button
            onClick={() => router.push('/login?message=tenant-created')}
            className="w-full px-6 py-4 bg-gradient-to-r from-[#28002D] to-[#2F70B5] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#2F70B5]/30 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <span>Giriş Yap</span>
            <span className="text-xl">→</span>
          </button>
        )}
      </div>

      {/* Add shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
