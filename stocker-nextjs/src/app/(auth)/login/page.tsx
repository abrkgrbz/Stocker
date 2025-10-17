'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/components/Logo'
import { Tenant } from '@/lib/types/auth'
import { calculateBackoff } from '@/lib/auth/backoff'
import { getClientTenantUrl } from '@/lib/env'
import { normalizeAuthDomain, isRootDomain } from '@/lib/utils/auth'
import { trackAuth } from '@/lib/analytics'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Redirect to auth domain if on root domain
  useEffect(() => {
    // Check if we're on the root domain (not auth subdomain)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost'
      const authDomain = normalizeAuthDomain(process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'http://localhost:3000')

      // If on root domain (e.g., stoocker.app or www.stoocker.app), redirect to auth domain
      const rootDomain = isRootDomain(hostname, baseDomain)

      if (rootDomain && !hostname.includes('localhost')) {
        const currentPath = window.location.pathname + window.location.search + window.location.hash
        window.location.href = `${authDomain}${currentPath}`
      }
    }
  }, [])

  const [step, setStep] = useState<'email' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [backoffUntil, setBackoffUntil] = useState<number | null>(null)

  // Restore state from URL params or sessionStorage
  useEffect(() => {
    const emailParam = searchParams.get('email')
    const tenantData = sessionStorage.getItem('login-tenant')

    if (emailParam) {
      setEmail(emailParam)
    }

    if (tenantData) {
      try {
        const parsed = JSON.parse(tenantData)
        // Validate restored data has required fields
        if (parsed.code && parsed.signature && parsed.timestamp && parsed.name) {
          setTenant(parsed)
          setStep('password')
        } else {
          // Invalid data, clear it
          sessionStorage.removeItem('login-tenant')
        }
      } catch (err) {
        console.error('Failed to restore tenant data:', err)
        sessionStorage.removeItem('login-tenant')
      }
    }
  }, [searchParams])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Track login attempt
    trackAuth({ event: 'login_attempt', metadata: { step: 'email' } })
    
    setLoading(true)
    setError('')

    try {
      // Use Next.js API route proxy on auth domain
      const authDomain = normalizeAuthDomain(process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'http://localhost:3000')
      const response = await fetch(`${authDomain}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include' // Important for CORS cookies
      })

      const data = await response.json()

      // Handle rate limiting
      if (response.status === 429) {
        setError(data.message || 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin.')
        return
      }

      if (!data.success) {
        trackAuth({ event: 'login_failure', metadata: { step: 'email', errorType: 'email_not_found' } })
        setError(data.message || 'Bu e-posta adresi sistemde kayıtlı değil')
        return
      }

      // Backend returns: { success, data: { exists, tenant } }
      const tenant = data.data?.tenant

      if (!tenant) {
        setError('Hesabınız bir firmaya bağlı değil')
        return
      }

      // Validate tenant has signature (HMAC)
      if (!tenant.signature || !tenant.timestamp) {
        setError('Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin.')
        return
      }

      // Store tenant in state and sessionStorage for recovery
      setTenant(tenant)

      // Store essential data including name for UI display
      sessionStorage.setItem('login-tenant', JSON.stringify({
        code: tenant.code,
        name: tenant.name,
        signature: tenant.signature,
        timestamp: tenant.timestamp
      }))

      // Update URL with email for recovery
      const url = new URL(window.location.href)
      url.searchParams.set('email', email)
      window.history.replaceState({}, '', url)

      setStep('password')
    } catch (err) {
      trackAuth({ event: 'login_failure', metadata: { step: 'email', errorType: 'network_error' } })
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const startTime = Date.now()
    
    // Track password step attempt
    trackAuth({ event: 'login_attempt', metadata: { step: 'password' } })

    // Check exponential backoff
    if (backoffUntil && Date.now() < backoffUntil) {
      const remainingSeconds = Math.ceil((backoffUntil - Date.now()) / 1000)
      setError(`Çok fazla başarısız deneme. ${remainingSeconds} saniye bekleyin.`)
      return
    }

    setLoading(true)
    setError('')

    try {
      if (!tenant?.signature || !tenant?.timestamp) {
        setError('Güvenlik doğrulaması başarısız. Lütfen baştan giriş yapın.')
        return
      }

      // Use Next.js API route proxy on auth domain
      const authDomain = normalizeAuthDomain(process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'http://localhost:3000')
      const response = await fetch(`${authDomain}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          tenantCode: tenant.code,
          tenantSignature: tenant.signature,
          tenantTimestamp: tenant.timestamp
        }),
        credentials: 'include' // Important for CORS cookies
      })

      const data = await response.json()

      // Handle rate limiting
      if (response.status === 429) {
        setError(data.message || 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.')
        return
      }

      if (!data.success) {
        // Increment failed attempts and set exponential backoff
        const newAttempts = failedAttempts + 1
        setFailedAttempts(newAttempts)

        trackAuth({ 
          event: 'login_failure', 
          metadata: { 
            step: 'password', 
            errorType: 'invalid_credentials',
            attempt: newAttempts 
          } 
        })

        if (newAttempts >= 3) {
          const backoffDelay = calculateBackoff(newAttempts - 2)
          setBackoffUntil(Date.now() + backoffDelay)
          setError(
            `${data.message || 'E-posta veya şifre hatalı'}. ${Math.ceil(backoffDelay / 1000)} saniye bekleyin.`
          )
        } else {
          setError(data.message || 'E-posta veya şifre hatalı')
        }
        return
      }

      // Success - clear sessionStorage, reset counters, and redirect
      const loginDuration = Date.now() - startTime
      
      trackAuth({ 
        event: 'login_success', 
        metadata: { 
          tenantCode: tenant.code,
          duration: loginDuration,
          requires2FA: data.requires2FA 
        } 
      })
      
      sessionStorage.removeItem('login-tenant')
      setFailedAttempts(0)
      setBackoffUntil(null)

      // Handle 2FA if required
      if (data.requires2FA) {
        // Store email in sessionStorage for 2FA verification
        sessionStorage.setItem('2fa_email', email);
        router.push('/verify-2fa');
        return;
      }

      // Redirect to tenant dashboard
      const tenantUrl = getClientTenantUrl(tenant.code)
      window.location.href = `${tenantUrl}/dashboard`
    } catch (err) {
      trackAuth({ event: 'login_failure', metadata: { step: 'password', errorType: 'exception' } })
      setError('Giriş yapılırken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

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
          {/* Logo */}
          <Logo variant="white" size="md" />

          {/* Main Content */}
          <div className="space-y-8 max-w-lg">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-white/90 font-medium">10,000+ aktif kullanıcı</span>
              </div>

              <h1 className="text-5xl font-bold text-white leading-tight">
                Modern işletme
                <br />
                yönetimi başlıyor
              </h1>

              <p className="text-xl text-white/70 leading-relaxed">
                Bulut tabanlı ERP sistemi ile tüm iş süreçlerinizi tek platformda yönetin
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
              <div>
                <div className="text-3xl font-bold text-white">99.9%</div>
                <div className="text-sm text-white/60 mt-1">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">2M+</div>
                <div className="text-sm text-white/60 mt-1">İşlem/gün</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">256-bit</div>
                <div className="text-sm text-white/60 mt-1">Şifreleme</div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="flex items-center space-x-8 pt-8 border-t border-white/10">
            <div className="text-white/60 text-sm">Güvenilir Ortaklar:</div>
            <div className="flex items-center space-x-6 opacity-60">
              <div className="h-6 w-20 bg-white/20 rounded" />
              <div className="h-6 w-20 bg-white/20 rounded" />
              <div className="h-6 w-20 bg-white/20 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white relative">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-violet-100 to-transparent rounded-full blur-3xl opacity-30" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Logo variant="gradient" size="md" />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {step === 'email' ? 'Hoş geldiniz' : 'Devam edin'}
            </h2>
            <p className="text-gray-600">
              {step === 'email'
                ? 'E-posta adresinizle başlayın'
                : `${tenant?.name || 'Hesabınız'} için şifrenizi girin`
              }
            </p>
          </div>

          {/* Tenant Card */}
          {tenant && step === 'password' && (
            <div className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {tenant.name?.[0]?.toUpperCase() || tenant.code?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{tenant.name || tenant.code || 'Hesabınız'}</div>
                    <div className="text-sm text-gray-600">
                      {tenant.code}.{process.env.NODE_ENV === 'development' ? 'localhost:3001' : 'stoocker.app'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStep('email')
                    setTenant(null)
                    setPassword('')
                    setFailedAttempts(0)
                    setBackoffUntil(null)
                    sessionStorage.removeItem('login-tenant')
                  }}
                  className="text-sm font-medium text-violet-600 hover:text-violet-700"
                >
                  Değiştir
                </button>
              </div>
            </div>
          )}

          {/* Error - Accessible error message with aria-live */}
          {error && (
            <div 
              id="email-error"
              role="alert"
              aria-live="polite"
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3"
            >
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600 flex-1">{error}</p>
            </div>
          )}

          {/* Forms */}
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta
                </label>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  placeholder="ahmet@firma.com"
                  required
                  autoFocus
                  autoComplete="email"
                  aria-label="E-posta adresi"
                  aria-describedby={error ? "email-error" : undefined}
                  aria-invalid={!!error}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 flex items-center justify-center space-x-2 group"
                aria-label={loading ? 'E-posta kontrol ediliyor' : 'E-posta ile devam et'}
                aria-busy={loading}
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{loading ? 'Kontrol ediliyor...' : 'Devam Et'}</span>
                {!loading && (
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">veya</span>
                </div>
              </div>

              <Link
                href="/register"
                className="block w-full text-center py-3.5 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                Yeni Hesap Oluştur
              </Link>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-5" aria-label="Şifre girişi formu">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password-input" className="block text-sm font-medium text-gray-700">
                    Şifre
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm font-medium text-violet-600 hover:text-violet-700"
                    aria-label="Şifremi unuttum"
                  >
                    Unuttum
                  </Link>
                </div>
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="••••••••"
                  required
                  autoFocus
                  autoComplete="current-password"
                  aria-label="Şifre"
                  aria-describedby={error ? "email-error" : undefined}
                  aria-invalid={!!error}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 flex items-center justify-center space-x-2 group"
                aria-label={loading ? 'Giriş yapılıyor' : 'Hesaba giriş yap'}
                aria-busy={loading}
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</span>
                {!loading && (
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setTenant(null)
                  setPassword('')
                  setFailedAttempts(0)
                  setBackoffUntil(null)
                  sessionStorage.removeItem('login-tenant')
                }}
                className="w-full text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
              >
                ← Farklı hesap kullan
              </button>
            </form>
          )}

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

export default function PremiumLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
