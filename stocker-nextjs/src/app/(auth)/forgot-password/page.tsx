'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { validatePasswordResetRequest } from '@/lib/auth/password-recovery'
import { handleApiError } from '@/lib/api/client'
import { Building2, User } from 'lucide-react'

type UserType = 'owner' | 'employee' | null

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<UserType>(null)
  const [workspaceCode, setWorkspaceCode] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate workspace code for employees
    if (userType === 'employee' && !workspaceCode.trim()) {
      setError('Çalışma alanı kodu gereklidir')
      setLoading(false)
      return
    }

    // Validate email
    const validation = validatePasswordResetRequest(email)
    if (!validation.valid) {
      setError(validation.error || 'Geçerli bir e-posta adresi girin')
      setLoading(false)
      return
    }

    try {
      const { authService } = await import('@/lib/api/services')
      // Pass workspace code for employees
      const response = await authService.forgotPassword(email, userType === 'employee' ? workspaceCode.trim().toLowerCase() : undefined)

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
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
            <h1 className="text-2xl font-bold text-slate-900 mb-2">E-posta Gönderildi</h1>
            <p className="text-slate-500">
              Şifre sıfırlama bağlantısı <span className="font-medium text-slate-700">{email}</span> adresine gönderildi.
            </p>
          </div>

          {/* Info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-600 text-center">
              E-posta gelmediyse spam klasörünüzü kontrol edin. Bağlantı 1 saat geçerlidir.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-slate-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Giriş sayfasına dön
            </button>

            <button
              onClick={() => {
                setEmailSent(false)
                setEmail('')
                setWorkspaceCode('')
                setUserType(null)
              }}
              className="w-full text-slate-500 hover:text-slate-700 py-2 text-sm font-medium transition-colors"
            >
              Farklı e-posta adresi dene
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Form state
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
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
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Şifrenizi mi unuttunuz?</h1>
          <p className="text-slate-500">
            {!userType
              ? 'Hesap türünüzü seçerek başlayın'
              : userType === 'employee'
                ? 'Çalışma alanı ve e-posta bilgilerinizi girin'
                : 'E-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.'
            }
          </p>
        </div>

        {/* User Type Selection */}
        {!userType ? (
          <div className="space-y-4">
            {/* Owner Option */}
            <button
              onClick={() => setUserType('owner')}
              className="w-full p-5 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-900 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                  <Building2 className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 mb-0.5">Firma Sahibi</div>
                  <div className="text-sm text-slate-500">İşletme hesabı yöneticisi</div>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Employee Option */}
            <button
              onClick={() => setUserType('employee')}
              className="w-full p-5 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-900 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                  <User className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 mb-0.5">Çalışan</div>
                  <div className="text-sm text-slate-500">Firma çalışanı hesabı</div>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Back to Login */}
            <div className="pt-4">
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
        ) : (
          <>
            {/* Selected User Type Badge */}
            <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                    {userType === 'owner' ? (
                      <Building2 className="w-5 h-5 text-white" strokeWidth={1.5} />
                    ) : (
                      <User className="w-5 h-5 text-white" strokeWidth={1.5} />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">
                      {userType === 'owner' ? 'Firma Sahibi' : 'Çalışan'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {userType === 'owner' ? 'İşletme hesabı yöneticisi' : 'Firma çalışanı hesabı'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setUserType(null)
                    setEmail('')
                    setWorkspaceCode('')
                    setError('')
                  }}
                  className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Değiştir
                </button>
              </div>
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
              {/* Workspace Code Field - Only for Employees */}
              {userType === 'employee' && (
                <div>
                  <label htmlFor="workspace" className="block text-sm font-medium text-slate-700 mb-2">
                    Çalışma Alanı Kodu
                  </label>
                  <div className="relative">
                    <input
                      id="workspace"
                      type="text"
                      value={workspaceCode}
                      onChange={(e) => setWorkspaceCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                      placeholder="firma-adi"
                      required
                      autoFocus
                      autoComplete="organization"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      .stoocker.app
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Firmanızın Stoocker çalışma alanı kodunu girin
                  </p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  E-posta Adresi
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  placeholder={userType === 'owner' ? 'sahip@sirket.com' : 'calisan@sirket.com'}
                  required
                  autoFocus={userType === 'owner'}
                  autoComplete="email"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email || (userType === 'employee' && !workspaceCode)}
                className="w-full bg-slate-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <span>Sıfırlama Bağlantısı Gönder</span>
                )}
              </button>
            </form>

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
          </>
        )}
      </div>
    </div>
  )
}
