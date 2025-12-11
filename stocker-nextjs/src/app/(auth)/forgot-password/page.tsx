'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { validatePasswordResetRequest } from '@/lib/auth/password-recovery'
import { ApiClientError, handleApiError } from '@/lib/api/client'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [tenantCode, setTenantCode] = useState('')
  const [isTenantUser, setIsTenantUser] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate email
    const validation = validatePasswordResetRequest(email)
    if (!validation.valid) {
      setError(validation.error || 'Geçerli bir e-posta adresi girin')
      setLoading(false)
      return
    }

    // Validate tenant code if user is a tenant user
    if (isTenantUser && !tenantCode.trim()) {
      setError('Çalışma alanı kodu gereklidir')
      setLoading(false)
      return
    }

    try {
      const { authService } = await import('@/lib/api/services')
      const response = await authService.forgotPassword(
        email,
        isTenantUser ? tenantCode.trim() : undefined
      )

      if (response.success) {
        setEmailSent(true)
      } else {
        setError(response.message || 'E-posta gönderilemedi. Lütfen tekrar deneyin.')
      }
    } catch (err) {
      console.error('Forgot password error:', err)
      const errorMessage = handleApiError(err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Success state - Email sent
  if (emailSent) {
    return (
      <div className="min-h-screen flex">
        {/* Left - Premium Branding */}
        <div className="hidden lg:flex lg:w-[55%] relative bg-black overflow-hidden">
          {/* Gradient Mesh Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-teal-600/20 to-cyan-600/20" />

          {/* Animated Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

          {/* Glowing Orbs */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            {/* Main Content */}
            <div className="space-y-8 max-w-lg">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-sm text-white/90 font-medium">Güvenli hesap kurtarma</span>
                </div>

                <h1 className="text-5xl font-bold text-white leading-tight">
                  E-posta
                  <br />
                  gönderildi
                </h1>

                <p className="text-xl text-white/70 leading-relaxed">
                  Şifre sıfırlama bağlantısı e-posta adresinize gönderildi
                </p>
              </div>

              {/* Security Tips */}
              <div className="space-y-4 pt-8 border-t border-white/10">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">1 saat geçerlilik</div>
                    <div className="text-white/60 text-sm">Bağlantı 1 saat sonra geçersiz olacak</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">Tek kullanımlık</div>
                    <div className="text-white/60 text-sm">Bağlantı yalnızca bir kez kullanılabilir</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="pt-8 border-t border-white/10">
              <div className="text-white/60 text-sm">256-bit şifreleme ile korunan güvenli bağlantı</div>
            </div>
          </div>
        </div>

        {/* Right - Success Content */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-100 to-transparent rounded-full blur-3xl opacity-30" />

          <div className="w-full max-w-md relative z-10">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">E-posta Gönderildi!</h2>
              <p className="text-gray-600">
                Şifre sıfırlama bağlantısı <strong className="text-gray-900">{email}</strong> adresine gönderildi.
              </p>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-5 mb-6">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-semibold text-gray-900 mb-2">E-posta gelmediyse</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      <span>Spam/gereksiz klasörünüzü kontrol edin</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      <span>E-posta adresinizi doğru yazdığınızdan emin olun</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      <span>Birkaç dakika bekleyip tekrar deneyin</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 flex items-center justify-center space-x-2 group"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                <span>Giriş Sayfasına Dön</span>
              </button>

              <button
                onClick={() => {
                  setEmailSent(false)
                  setEmail('')
                  setTenantCode('')
                }}
                className="w-full text-gray-600 hover:text-gray-900 py-3 text-sm font-medium"
              >
                Farklı e-posta adresi dene
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center space-x-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-900">Gizlilik</Link>
              <Link href="/terms" className="hover:text-gray-900">Şartlar</Link>
              <Link href="/help" className="hover:text-gray-900">Yardım</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Form state
  return (
    <div className="min-h-screen flex">
      {/* Left - Premium Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-black overflow-hidden">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20" />

        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Glowing Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Main Content */}
          <div className="space-y-8 max-w-lg">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span className="text-sm text-white/90 font-medium">Güvenli hesap kurtarma</span>
              </div>

              <h1 className="text-5xl font-bold text-white leading-tight">
                Şifrenizi mi
                <br />
                unuttunuz?
              </h1>

              <p className="text-xl text-white/70 leading-relaxed">
                Endişelenmeyin, size şifre sıfırlama bağlantısı göndereceğiz
              </p>
            </div>

            {/* Security Features */}
            <div className="space-y-4 pt-8 border-t border-white/10">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium">256-bit Şifreleme</div>
                  <div className="text-white/60 text-sm">Tüm verileriniz güvenli şekilde korunur</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium">Tek Kullanımlık Bağlantı</div>
                  <div className="text-white/60 text-sm">Güvenliğiniz için bağlantı tek seferlik geçerlidir</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium">1 Saat Geçerlilik</div>
                  <div className="text-white/60 text-sm">Bağlantı 1 saat sonra geçersiz olur</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/10">
            <div className="text-white/60 text-sm">Hesabınızda şüpheli aktivite fark ederseniz yöneticiyle iletişime geçin</div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white relative">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-violet-100 to-transparent rounded-full blur-3xl opacity-30" />

        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Şifremi Unuttum</h2>
            <p className="text-gray-600">E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3"
            >
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600 flex-1">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User Type Toggle */}
            <div className="bg-gray-100 p-1 rounded-xl flex">
              <button
                type="button"
                onClick={() => setIsTenantUser(false)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  !isTenantUser
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Firma Yöneticisi
              </button>
              <button
                type="button"
                onClick={() => setIsTenantUser(true)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  isTenantUser
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Çalışan
              </button>
            </div>

            {/* Info Box for User Type */}
            <div className={`p-3 rounded-lg text-sm ${isTenantUser ? 'bg-blue-50 text-blue-800' : 'bg-gray-50 text-gray-600'}`}>
              {isTenantUser ? (
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Çalışma alanı kodunuzu firma yöneticinizden öğrenebilirsiniz.</span>
                </div>
              ) : (
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Sisteme kayıt olan firma sahibi iseniz bu seçeneği kullanın.</span>
                </div>
              )}
            </div>

            {/* Tenant Code Field (only for tenant users) */}
            {isTenantUser && (
              <div>
                <label htmlFor="tenant-code-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Çalışma Alanı Kodu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <input
                    id="tenant-code-input"
                    type="text"
                    value={tenantCode}
                    onChange={(e) => setTenantCode(e.target.value.toUpperCase())}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 uppercase"
                    placeholder="ABC123"
                    aria-label="Çalışma alanı kodu"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">Örnek: ABC123, DEMO, SIRKET</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                placeholder="ornek@sirket.com"
                required
                autoFocus={!isTenantUser}
                autoComplete="email"
                aria-label="E-posta adresi"
                aria-invalid={!!error}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || (isTenantUser && !tenantCode.trim())}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 flex items-center justify-center space-x-2 group"
              aria-label={loading ? 'Gönderiliyor' : 'Sıfırlama bağlantısı gönder'}
              aria-busy={loading}
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}</span>
              {!loading && (
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </button>

            <Link
              href="/login"
              className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 py-3 text-sm font-medium group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              <span>Giriş sayfasına dön</span>
            </Link>
          </form>

          {/* Security Warning */}
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <div className="font-semibold text-amber-800 text-sm">Güvenlik İpucu</div>
                <p className="text-xs text-amber-700 mt-1">
                  Şifre sıfırlama bağlantısı yalnızca 1 saat geçerlidir ve tek kullanımlıktır.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center space-x-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900">Gizlilik</Link>
            <Link href="/terms" className="hover:text-gray-900">Şartlar</Link>
            <Link href="/help" className="hover:text-gray-900">Yardım</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
