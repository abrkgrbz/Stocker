'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getClientTenantUrl } from '@/lib/env';

function Verify2FAForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [tenantCode, setTenantCode] = useState('');

  // Get email and tenant from sessionStorage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('2fa_email');
    const storedTenant = sessionStorage.getItem('login-tenant-code');

    if (!storedEmail) {
      router.push('/login');
      return;
    }

    setEmail(storedEmail);
    if (storedTenant) {
      setTenantCode(storedTenant);
    }
  }, [router]);

  const handleVerify = async () => {
    if ((useBackupCode && code.length < 8) || (!useBackupCode && code.length !== 6)) {
      setError(useBackupCode ? 'Yedekleme kodu en az 8 karakter olmalidir' : 'Kod 6 haneli olmalidir');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { authService } = await import('@/lib/api/services');
      const response = await authService.verify2FA({
        email,
        code,
        backupCode: useBackupCode,
      });

      if (response.success && response.data) {
        // Clear 2FA session data
        sessionStorage.removeItem('2fa_email');

        // Redirect to tenant dashboard
        if (tenantCode) {
          const tenantUrl = getClientTenantUrl(tenantCode);
          window.location.href = `${tenantUrl}/app`;
        } else {
          router.push('/app');
        }
      } else {
        setError(response.message || 'Gecersiz kod. Lutfen tekrar deneyin.');
      }
    } catch (err) {
      setError('Kod dogrulanamadi. Lutfen tekrar deneyin.');
      console.error('2FA verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleVerify();
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = useBackupCode
      ? e.target.value.toUpperCase()
      : e.target.value.replace(/\D/g, '');
    setCode(value);
  };

  return (
    <div className="auth-page min-h-screen flex">
      {/* Left Panel - Security Visual */}
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
        <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full h-full">
          {/* Shield Icon */}
          <div className="w-32 h-32 bg-slate-800 rounded-3xl flex items-center justify-center mb-8">
            <svg className="w-16 h-16 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>

          <h2 className="text-3xl font-semibold text-white mb-4 text-center">
            Hesabiniz Koruma Altinda
          </h2>
          <p className="text-slate-400 text-center max-w-sm">
            Iki faktorlu dogrulama ile hesabiniz ekstra guvenlik katmaniyla korunuyor.
          </p>

          {/* Security Features */}
          <div className="mt-12 space-y-4 w-full max-w-sm">
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Sifre Korunuyor</p>
                <p className="text-sm text-slate-500">Guclu sifre politikasi aktif</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">2FA Aktif</p>
                <p className="text-sm text-slate-500">Ekstra guvenlik katmani</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Verification Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        {/* Back to Login Link */}
        <Link
          href="/login"
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
          <span className="text-sm">Giris Sayfasi</span>
        </Link>

        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Icon */}
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              {useBackupCode ? (
                <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              )}
            </div>

            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              {useBackupCode ? 'Yedekleme Kodu' : 'Dogrulama Kodu'}
            </h1>
            <p className="text-slate-500">
              {useBackupCode
                ? 'Kaydettiginiz yedekleme kodlarindan birini girin'
                : 'Authenticator uygulamanizda gorunen 6 haneli kodu girin'
              }
            </p>
          </div>

          {/* Email Badge */}
          {email && (
            <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span className="text-sm text-slate-600">{email}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Code Input */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {useBackupCode ? 'Yedekleme Kodu' : 'Dogrulama Kodu'}
              </label>
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                onKeyPress={handleKeyPress}
                maxLength={useBackupCode ? 10 : 6}
                placeholder={useBackupCode ? 'XXXX-XXXX' : '000000'}
                className={`w-full px-4 py-4 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-center font-mono ${
                  useBackupCode ? 'text-lg tracking-widest' : 'text-2xl tracking-[0.5em]'
                }`}
                autoFocus
                autoComplete="one-time-code"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || (useBackupCode ? code.length < 8 : code.length !== 6)}
              className="w-full bg-black hover:bg-slate-800 text-white py-3.5 px-4 rounded-lg font-semibold text-base transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Dogrulaniyor...</span>
                </>
              ) : (
                <span>Dogrula</span>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">veya</span>
              </div>
            </div>

            {/* Toggle Backup Code */}
            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setCode('');
                setError('');
              }}
              className="w-full py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors flex items-center justify-center gap-2"
            >
              {useBackupCode ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                  <span>Authenticator kodu kullan</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                  <span>Yedekleme kodu kullan</span>
                </>
              )}
            </button>
          </div>

          {/* Help Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  {useBackupCode ? 'Yedekleme Kodlari Hakkinda' : 'Kod Nereden Alinir?'}
                </p>
                <p className="text-sm text-blue-700">
                  {useBackupCode
                    ? '2FA kurulumunda kaydettiginiz 10 koddan birini girin. Her kod sadece bir kez kullanilabilir.'
                    : 'Google Authenticator, Microsoft Authenticator veya Authy uygulamanizda "Stocker" icin gorunen 6 haneli kodu girin.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-slate-600 transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-slate-600 transition-colors">Sartlar</Link>
              <Link href="/help" className="hover:text-slate-600 transition-colors">Yardim</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" />
      </div>
    }>
      <Verify2FAForm />
    </Suspense>
  );
}
