'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MailOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { VerificationCodeInput } from '@/components/auth/VerificationCodeInput';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState(false);

  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  // Auto-verify if token is provided in URL (from email link)
  useEffect(() => {
    if (token && email && !verifySuccess && !verifyError) {
      // Automatically verify with token from email link
      handleVerifyToken(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleVerifyToken = async (verificationToken: string) => {
    setVerifying(true);
    setVerifyError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/public/tenant-registration/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || '',
          token: verificationToken,
        }),
      });

      const data = await response.json();
      console.log('Token verification response:', data);

      if (response.ok && data.success) {
        setVerifySuccess(true);
        // Redirect to tenant creation progress page with registrationId
        setTimeout(() => {
          const registrationId = data.registrationId;
          console.log('Redirecting with registrationId:', registrationId);
          if (registrationId) {
            router.push(`/register/tenant-creation?registrationId=${registrationId}`);
          } else {
            console.warn('No registrationId in response, falling back to login');
            router.push('/login');
          }
        }, 2000);
      } else {
        setVerifyError(data.message || 'Token geçersiz veya süresi dolmuş. Lütfen yeni kod isteyin.');
      }
    } catch (err) {
      setVerifyError('Doğrulama yapılamadı. Lütfen tekrar deneyin.');
      console.error('Token verification error:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (!email) {
      setVerifyError('E-posta adresi bulunamadı');
      return;
    }

    setVerifying(true);
    setVerifyError('');

    try {
      const { authService } = await import('@/lib/api/services');
      const response = await authService.verifyEmail(email, code);
      console.log('Code verification response:', response);

      if (response.success) {
        setVerifySuccess(true);
        // Redirect to tenant creation progress page with registrationId
        setTimeout(() => {
          // Response is directly the API response: { success, registrationId, message }
          const registrationId = response.registrationId;
          console.log('Redirecting with registrationId:', registrationId);
          if (registrationId) {
            router.push(`/register/tenant-creation?registrationId=${registrationId}`);
          } else {
            console.warn('No registrationId in response, falling back to login');
            router.push('/login');
          }
        }, 2000);
      } else {
        setVerifyError('Geçersiz kod. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setVerifyError('Kod doğrulanamadı. Lütfen tekrar deneyin.');
      console.error('Email verification error:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email || resendCountdown > 0) return;

    setResending(true);
    setResendError('');
    setResendSuccess(false);

    try {
      const { authService } = await import('@/lib/api/services');
      const response = await authService.resendVerificationEmail(email);

      if (response.success) {
        setResendSuccess(true);
        setResendCountdown(60); // 60 seconds countdown
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        setResendError('E-posta gönderilemedi. Lütfen tekrar deneyin.');
      }
    } catch (err: any) {
      setResendError(err.message || 'Bir hata oluştu');
    } finally {
      setResending(false);
    }
  };

  if (verifySuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleOutlined className="text-4xl text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">E-posta Doğrulandı!</h2>
              <p className="mt-2 text-sm text-gray-600">
                E-posta adresiniz başarıyla doğrulandı.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                Hesabınız oluşturuluyor... Lütfen bekleyin.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <MailOutlined className="text-4xl text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">E-posta Doğrulama</h2>
            <p className="mt-2 text-sm text-gray-600">
              <strong>{email}</strong> adresine gönderilen 6 haneli kodu girin
            </p>
          </div>

          {/* Verification Code Input */}
          <div className="py-4">
            <VerificationCodeInput
              length={6}
              onComplete={handleVerifyCode}
              disabled={verifying}
              error={!!verifyError}
            />
          </div>

          {/* Verify Error */}
          {verifyError && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <CloseCircleOutlined />
              <span className="text-sm">{verifyError}</span>
            </div>
          )}

          {/* Resend Success */}
          {resendSuccess && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircleOutlined />
              <span className="text-sm">E-posta başarıyla tekrar gönderildi!</span>
            </div>
          )}

          {/* Resend Error */}
          {resendError && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <CloseCircleOutlined />
              <span className="text-sm">{resendError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={resending || resendCountdown > 0}
              className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {resending
                ? 'Gönderiliyor...'
                : resendCountdown > 0
                ? `Tekrar Gönder (${resendCountdown}s)`
                : 'Kodu Tekrar Gönder'}
            </button>

            <Link
              href="/login"
              className="block w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-center font-medium"
            >
              Giriş Sayfasına Dön
            </Link>
          </div>

          {/* Help Text */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              E-postayı göremiyorsanız spam/gereksiz klasörünü kontrol edin.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Kod 15 dakika içinde geçerliliğini yitirecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
