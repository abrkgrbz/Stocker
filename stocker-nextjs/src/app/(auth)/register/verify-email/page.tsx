'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { VerificationCodeInput } from '@/components/auth/VerificationCodeInput';

// Testimonials data for verify email page
const TESTIMONIALS = [
  {
    id: 1,
    quote: "Güvenlik her şeyden önce gelir. E-posta doğrulama adımı, hesabımızın korunmasını sağlıyor.",
    author: "Ahmet Yılmaz",
    role: "Güvenlik Müdürü",
    company: "SecureTech",
    initials: "AY",
  },
  {
    id: 2,
    quote: "Kayıt süreci çok hızlı ve güvenli. Anında doğrulama kodu aldım ve dakikalar içinde sisteme eriştim.",
    author: "Zeynep Demir",
    role: "Proje Yöneticisi",
    company: "AgileWorks",
    initials: "ZD",
  },
  {
    id: 3,
    quote: "İki faktörlü doğrulama seçeneği harika. Ekibimizin tüm hesapları koruma altında.",
    author: "Mehmet Kara",
    role: "CTO",
    company: "InnovateTR",
    initials: "MK",
  },
];

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  // Testimonial slider state
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-rotate testimonials
  const nextTestimonial = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
      setIsTransitioning(false);
    }, 300);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 6000);
    return () => clearInterval(interval);
  }, [nextTestimonial]);

  // Auto-verify if token is provided in URL (from email link)
  useEffect(() => {
    if (token && email && !redirecting && !verifyError) {
      handleVerifyToken(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Verify email with API
  const verifyEmailWithAPI = async (emailAddress: string, codeOrToken: string, isCode: boolean): Promise<string | null> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/public/tenant-registration/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: emailAddress,
        ...(isCode ? { code: codeOrToken } : { token: codeOrToken }),
      }),
    });

    const data = await response.json();

    if (response.ok && data.success && data.registrationId) {
      return data.registrationId;
    } else {
      throw new Error(data.detail || data.message || 'Doğrulama kodu geçersiz');
    }
  };

  const handleVerifyToken = async (verificationToken: string) => {
    if (!email) {
      setVerifyError('E-posta adresi bulunamadı');
      return;
    }

    setVerifying(true);
    setVerifyError('');
    setVerifySuccess(false);

    try {
      const registrationId = await verifyEmailWithAPI(email, verificationToken, false);

      if (registrationId) {
        setVerifySuccess(true);
        setVerifying(false);

        setTimeout(() => {
          setRedirecting(true);
          const params = new URLSearchParams({
            registrationId: registrationId,
          });
          router.push(`/register/tenant-creation?${params.toString()}`);
        }, 1500);
      }
    } catch (err: any) {
      setVerifyError('Doğrulama kodu yanlış. Lütfen tekrar deneyin.');
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
    setVerifySuccess(false);

    try {
      const registrationId = await verifyEmailWithAPI(email, code, true);

      if (registrationId) {
        setVerifySuccess(true);
        setVerifying(false);

        setTimeout(() => {
          setRedirecting(true);
          const params = new URLSearchParams({
            registrationId: registrationId,
          });
          router.push(`/register/tenant-creation?${params.toString()}`);
        }, 1500);
      }
    } catch (err: any) {
      setVerifyError('Doğrulama kodu yanlış. Lütfen tekrar deneyin.');
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
        setResendCountdown(60);
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

  // Success state before redirecting
  if (verifySuccess || redirecting) {
    return (
      <div className="auth-page min-h-screen flex">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full h-full">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-semibold text-white mb-4">Doğrulama Başarılı!</h2>
            <p className="text-slate-400 text-center max-w-sm">
              E-posta adresiniz doğrulandı. Hesap oluşturma sayfasına yönlendiriliyorsunuz...
            </p>
          </div>
        </div>

        {/* Right Panel - Success */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                E-posta Doğrulandı!
              </h2>
              <p className="text-slate-500">
                Hesap oluşturma sayfasına yönlendiriliyorsunuz...
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-400">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Yönlendiriliyor...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page min-h-screen flex">
      {/* Left Panel - Corporate Branding with Testimonial */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full">
          {/* Testimonial Slider */}
          <div className="flex-1 flex items-center">
            <div className="max-w-md w-full">
              {/* Quote Icon */}
              <svg
                className="w-12 h-12 text-slate-700 mb-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>

              {/* Testimonial Content with Fade Animation */}
              <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                <blockquote className="text-2xl font-light text-white leading-relaxed mb-8 min-h-[120px]">
                  "{TESTIMONIALS[currentTestimonial].quote}"
                </blockquote>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold text-lg">
                    {TESTIMONIALS[currentTestimonial].initials}
                  </div>
                  <div>
                    <div className="text-white font-medium">{TESTIMONIALS[currentTestimonial].author}</div>
                    <div className="text-slate-400 text-sm">{TESTIMONIALS[currentTestimonial].role}, {TESTIMONIALS[currentTestimonial].company}</div>
                  </div>
                </div>
              </div>

              {/* Slider Dots */}
              <div className="flex items-center gap-2 mt-8">
                {TESTIMONIALS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setCurrentTestimonial(index);
                        setIsTransitioning(false);
                      }, 300);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentTestimonial
                        ? 'w-8 bg-white'
                        : 'w-1.5 bg-slate-600 hover:bg-slate-500'
                    }`}
                    aria-label={`Testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Security Stats - Bottom */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-800 mt-8">
            <div>
              <div className="text-3xl font-semibold text-white">256-bit</div>
              <div className="text-sm text-slate-500 mt-1">SSL Şifreleme</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white">2FA</div>
              <div className="text-sm text-slate-500 mt-1">İki Faktör Doğrulama</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white">KVKK</div>
              <div className="text-sm text-slate-500 mt-1">Uyumlu</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Verification Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        {/* Back Link */}
        <Link
          href="/register"
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Kayıt Sayfası</span>
        </Link>

        <div className="w-full max-w-[400px]">
          {/* Email Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              E-posta Doğrulama
            </h1>
            <p className="text-slate-500">
              <span className="font-medium text-slate-700">{email}</span> adresine gönderilen 6 haneli kodu girin
            </p>
          </div>

          {/* Verification Code Input */}
          <div className="mb-6">
            <VerificationCodeInput
              length={6}
              onComplete={handleVerifyCode}
              disabled={verifying}
              error={!!verifyError}
            />
          </div>

          {/* Verify Error */}
          {verifyError && (
            <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{verifyError}</span>
            </div>
          )}

          {/* Resend Success */}
          {resendSuccess && (
            <div className="mb-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">E-posta başarıyla tekrar gönderildi!</span>
            </div>
          )}

          {/* Resend Error */}
          {resendError && (
            <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{resendError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={resending || resendCountdown > 0}
              className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {resending
                ? 'Gönderiliyor...'
                : resendCountdown > 0
                ? `Tekrar Gönder (${resendCountdown}s)`
                : 'Kodu Tekrar Gönder'}
            </button>

            <Link
              href="/login"
              className="block w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-slate-800 transition-all text-center font-semibold shadow-lg hover:shadow-xl"
            >
              Giriş Sayfasına Dön
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400 mb-2">
              E-postayı göremiyorsanız spam/gereksiz klasörünü kontrol edin.
            </p>
            <p className="text-sm text-slate-400">
              Kod 15 dakika içinde geçerliliğini yitirecektir.
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-slate-600 transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-slate-600 transition-colors">Şartlar</Link>
              <Link href="/help" className="hover:text-slate-600 transition-colors">Yardım</Link>
            </div>
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
        <div className="auth-page min-h-screen flex">
          <div className="hidden lg:flex lg:w-1/2 bg-slate-900" />
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
              <p className="mt-4 text-slate-600">Yükleniyor...</p>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
