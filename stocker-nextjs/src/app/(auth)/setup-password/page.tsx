'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { validatePasswordReset, generateSecurePassword, calculatePasswordStrength } from '@/lib/auth/password-recovery'
import { handleApiError } from '@/lib/api/client'

function SetupPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get params from URL
  const userId = searchParams.get('userId')
  const tenantId = searchParams.get('tenantId')
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(false)
  const [validatingParams, setValidatingParams] = useState(true)
  const [paramsValid, setParamsValid] = useState(false)
  const [setupSuccess, setSetupSuccess] = useState(false)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Calculate password strength
  const passwordStrength = password ? calculatePasswordStrength(password) : null

  // Validate params on mount
  useEffect(() => {
    const validateParams = async () => {
      // Check if all required params exist
      if (!userId || !tenantId || !token) {
        setError('Geçersiz veya eksik aktivasyon bağlantısı. Lütfen e-postanızdaki bağlantıyı tekrar kontrol edin.')
        setParamsValid(false)
        setValidatingParams(false)
        return
      }

      // Validate GUID formats
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!guidRegex.test(userId) || !guidRegex.test(tenantId)) {
        setError('Geçersiz aktivasyon bağlantısı formatı.')
        setParamsValid(false)
        setValidatingParams(false)
        return
      }

      // Token seems valid (actual validation happens on server)
      setParamsValid(true)
      setValidatingParams(false)
    }

    validateParams()
  }, [userId, tenantId, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords
    const validation = validatePasswordReset(password, confirmPassword)
    if (!validation.valid) {
      setError(validation.error || 'Geçersiz şifre')
      setLoading(false)
      return
    }

    try {
      const { setupPassword } = await import('@/lib/api/users')
      const response = await setupPassword({
        tenantId: tenantId!,
        userId: userId!,
        token: token!,
        password: password,
        confirmPassword: confirmPassword,
      })

      if (response.success) {
        setSetupSuccess(true)
        // Auto-login: Backend has already set HttpOnly cookies
        // Redirect to dashboard after 2 seconds (user is now authenticated)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError(response.message || 'Hesap aktifleştirilemedi. Lütfen tekrar deneyin.')
      }
    } catch (err) {
      console.error('Setup password error:', err)
      const errorMessage = handleApiError(err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePassword = () => {
    const generatedPassword = generateSecurePassword()
    setPassword(generatedPassword)
    setConfirmPassword(generatedPassword)
    setShowPassword(true)
  }

  // Params validation in progress
  if (validatingParams) {
    return (
      <div className="auth-page min-h-screen bg-slate-50 flex items-center justify-center p-4">
        {/* Dot Pattern Background */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.15) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Card */}
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-8 sm:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <svg viewBox="0 0 180 40" fill="none" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="6" width="22" height="4" rx="2" fill="#0f172a"/>
              <rect x="8" y="13" width="18" height="4" rx="2" fill="#0f172a"/>
              <rect x="4" y="20" width="22" height="4" rx="2" fill="#0f172a"/>
              <rect x="8" y="27" width="18" height="4" rx="2" fill="#0f172a"/>
              <text x="38" y="28" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="600" fill="#0f172a">Stoocker</text>
            </svg>
          </div>

          {/* Loading */}
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin h-10 w-10 border-3 border-slate-900 border-t-transparent rounded-full mb-4" />
            <p className="text-slate-500">Bağlantı doğrulanıyor...</p>
          </div>
        </div>
      </div>
    )
  }

  // Invalid or missing params
  if (!paramsValid) {
    return (
      <div className="auth-page min-h-screen bg-slate-50 flex items-center justify-center p-4">
        {/* Dot Pattern Background */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.15) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Card */}
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-8 sm:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <svg viewBox="0 0 180 40" fill="none" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="6" width="22" height="4" rx="2" fill="#0f172a"/>
              <rect x="8" y="13" width="18" height="4" rx="2" fill="#0f172a"/>
              <rect x="4" y="20" width="22" height="4" rx="2" fill="#0f172a"/>
              <rect x="8" y="27" width="18" height="4" rx="2" fill="#0f172a"/>
              <text x="38" y="28" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="600" fill="#0f172a">Stoocker</text>
            </svg>
          </div>

          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Geçersiz Bağlantı</h1>
            <p className="text-slate-500">{error || 'Aktivasyon bağlantısı geçersiz veya süresi dolmuş.'}</p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <p className="text-sm text-slate-500 text-center">
              Yöneticinizle iletişime geçerek yeni bir davet e-postası talep edebilirsiniz.
            </p>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 py-2 text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Giriş sayfasına dön</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Password setup success
  if (setupSuccess) {
    return (
      <div className="auth-page min-h-screen bg-slate-50 flex items-center justify-center p-4">
        {/* Dot Pattern Background */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.15) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Card */}
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-8 sm:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <svg viewBox="0 0 180 40" fill="none" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="6" width="22" height="4" rx="2" fill="#0f172a"/>
              <rect x="8" y="13" width="18" height="4" rx="2" fill="#0f172a"/>
              <rect x="4" y="20" width="22" height="4" rx="2" fill="#0f172a"/>
              <rect x="8" y="27" width="18" height="4" rx="2" fill="#0f172a"/>
              <text x="38" y="28" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="600" fill="#0f172a">Stoocker</text>
            </svg>
          </div>

          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Hesabınız Aktifleştirildi!</h1>
            <p className="text-slate-500">
              Şifreniz başarıyla oluşturuldu. Panele yönlendiriliyorsunuz...
            </p>
          </div>

          {/* Actions */}
          <Link
            href="/dashboard"
            className="block w-full bg-slate-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-slate-800 transition-colors text-center"
          >
            Panele Git
          </Link>
        </div>
      </div>
    )
  }

  // Password setup form
  return (
    <div className="auth-page min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Dot Pattern Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-8 sm:p-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <svg viewBox="0 0 180 40" fill="none" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="6" width="22" height="4" rx="2" fill="#0f172a"/>
            <rect x="8" y="13" width="18" height="4" rx="2" fill="#0f172a"/>
            <rect x="4" y="20" width="22" height="4" rx="2" fill="#0f172a"/>
            <rect x="8" y="27" width="18" height="4" rx="2" fill="#0f172a"/>
            <text x="38" y="28" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="600" fill="#0f172a">Stoocker</text>
          </svg>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Hesabınızı Aktifleştirin</h1>
          <p className="text-slate-500">
            Hesabınızı kullanmaya başlamak için bir şifre oluşturun
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Şifre
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                autoFocus
                autoComplete="new-password"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password Strength Meter */}
            {password && passwordStrength && (
              <div className="mt-3">
                <div className="flex gap-1 mb-2">
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        level < passwordStrength.score
                          ? level < 2
                            ? 'bg-red-500'
                            : level < 3
                              ? 'bg-yellow-500'
                              : 'bg-emerald-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${
                  passwordStrength.score < 2
                    ? 'text-red-600'
                    : passwordStrength.score < 3
                      ? 'text-yellow-600'
                      : 'text-emerald-600'
                }`}>
                  {passwordStrength.feedback[0]}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
              Şifreyi Onayla
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 pr-12 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all ${
                  confirmPassword && password !== confirmPassword ? 'border-red-300' : 'border-slate-200'
                }`}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showConfirmPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1.5 text-xs text-red-600">Şifreler eşleşmiyor</p>
            )}
          </div>

          {/* Generate Password Button */}
          <button
            type="button"
            onClick={handleGeneratePassword}
            className="w-full py-2.5 px-4 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Güçlü Şifre Öner</span>
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !password || !confirmPassword || password !== confirmPassword}
            className="w-full bg-slate-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Hesap Aktifleştiriliyor...</span>
              </>
            ) : (
              <span>Hesabı Aktifleştir</span>
            )}
          </button>
        </form>

        {/* Security Tips */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <h3 className="text-sm font-medium text-slate-700 mb-2">Güvenli Şifre İpuçları</h3>
          <ul className="text-xs text-slate-500 space-y-1">
            <li>• En az 8 karakter kullanın (12+ daha güvenli)</li>
            <li>• Büyük/küçük harf, sayı ve özel karakter karıştırın</li>
            <li>• Yaygın kelimelerden ve desenlerden kaçının</li>
          </ul>
        </div>

        {/* Back to Login */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Giriş sayfasına dön</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" />
      </div>
    }>
      <SetupPasswordContent />
    </Suspense>
  )
}
