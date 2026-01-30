'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { signalRService, TenantCreationProgress as ProgressData } from '@/lib/signalr/signalr.service';
import Swal from 'sweetalert2';

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
// NOTE: Subscription and modules are NOT created during registration.
// They are created in Setup Wizard after user logs in and selects their package.
const stepConfig: Record<string, { message: string; icon: string }> = {
  'EmailVerified': { message: 'E-posta doğrulandı', icon: '✉️' },
  'Starting': { message: 'Başlatılıyor', icon: '🚀' },
  'CreatingTenant': { message: 'Şirket kaydı oluşturuluyor', icon: '🏢' },
  'CreatingMasterUser': { message: 'Kullanıcı hesabı oluşturuluyor', icon: '👤' },
  'CreatingDatabase': { message: 'Veritabanı oluşturuluyor', icon: '🗄️' },
  'RunningMigrations': { message: 'Veritabanı yapılandırılıyor', icon: '⚙️' },
  'SeedingData': { message: 'İlk veriler yükleniyor', icon: '📊' },
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
  const [, setVerificationStarted] = useState(false);
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

      // Show success message with SweetAlert2 and redirect
      Swal.fire({
        icon: 'success',
        title: 'Hesabınız Hazır! 🎉',
        html: `
          <div class="text-slate-600">
            <p class="mb-2">Hesabınız başarıyla oluşturuldu.</p>
            <p class="text-sm">Giriş sayfasına yönlendiriliyorsunuz...</p>
          </div>
        `,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: '#ffffff',
        color: '#0f172a',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border border-slate-200',
          title: 'text-2xl font-bold text-slate-900',
          timerProgressBar: 'bg-slate-900',
        },
        didOpen: () => {
          const timerBar = Swal.getPopup()?.querySelector('.swal2-timer-progress-bar') as HTMLElement;
          if (timerBar) {
            timerBar.style.background = '#0f172a';
          }
        }
      }).then(() => {
        router.push('/login?message=tenant-created');
      });
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

  // Error states with new theme
  if (!hasRequiredParams) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Hata</h1>
          <p className="text-slate-600 mb-6">Geçersiz kayıt bilgisi</p>
          <button
            onClick={() => router.push('/register')}
            className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all duration-200"
          >
            Kayıt Sayfasına Dön
          </button>
        </motion.div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Bağlantı Hatası</h1>
          <p className="text-slate-600 mb-6">{connectionError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all duration-200"
          >
            Sayfayı Yenile
          </button>
        </motion.div>
      </div>
    );
  }

  if (progress.hasError) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Hata Oluştu</h1>
          <p className="text-slate-600 mb-6">
            {progress.errorMessage || 'Hesap oluşturulurken bir hata oluştu'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all duration-200"
            >
              Tekrar Dene
            </button>
            <button
              onClick={() => router.push('/register')}
              className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all duration-200"
            >
              Kayıt Sayfasına Dön
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Get visible steps (exclude EmailVerified and Failed from display)
  const visibleSteps = Object.entries(stepConfig).filter(
    ([key]) => key !== 'EmailVerified' && key !== 'Failed'
  );

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          {progress.isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center"
            >
              <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          ) : (
            <div className="relative w-24 h-24 mx-auto mb-6">
              {/* Progress ring */}
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="#e2e8f0"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="#0f172a"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={276.46}
                  strokeDashoffset={276.46 - (276.46 * progress.percentage) / 100}
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">
                  {progress.percentage}%
                </span>
              </div>
            </div>
          )}

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {progress.isCompleted ? 'Hesabınız Hazır!' : 'Hesabınız Oluşturuluyor'}
          </h1>
          <p className="text-slate-500 text-sm">
            {progress.isCompleted
              ? 'Başarıyla oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...'
              : 'Bu işlem birkaç dakika sürebilir, lütfen bekleyin'
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <span>{stepConfig[progress.step]?.icon || '⏳'}</span>
              {stepConfig[progress.step]?.message || progress.step}
            </span>
            <span className="text-sm font-bold text-slate-900">
              {progress.percentage}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-slate-900 rounded-full relative overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </motion.div>
          </div>
        </div>

        {/* Current Step Message */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-slate-600 text-center">
            {progress.message}
          </p>
        </div>

        {/* Steps Checklist - Compact Grid View */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {visibleSteps.map(([stepKey, config]) => {
            const stepIndex = Object.keys(stepConfig).indexOf(stepKey);
            const currentStepIndex = Object.keys(stepConfig).indexOf(progress.step);
            const isCompleted = stepIndex < currentStepIndex || progress.isCompleted;
            const isCurrent = stepKey === progress.step;

            return (
              <motion.div
                key={stepKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stepIndex * 0.05 }}
                className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${isCurrent
                  ? 'bg-slate-900 text-white shadow-lg'
                  : isCompleted
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-slate-50 border border-slate-100'
                  }`}
              >
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm ${isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-400'
                    }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs">{config.icon}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium leading-tight ${isCompleted
                    ? 'text-emerald-700'
                    : isCurrent
                      ? 'text-white'
                      : 'text-slate-500'
                    }`}
                >
                  {config.message}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Info Footer */}
        {!progress.isCompleted && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Bu sayfayı kapatmayın. İşlem tamamlandığında otomatik olarak yönlendirileceksiniz.</span>
            </p>
          </div>
        )}

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs">256-bit SSL</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs">Güvenli İşlem</span>
          </div>
        </div>
      </motion.div>

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
