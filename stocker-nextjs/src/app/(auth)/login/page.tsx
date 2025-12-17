'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Tenant, TenantInfo } from '@/lib/types/auth'

// Testimonials data
const TESTIMONIALS = [
  {
    id: 1,
    quote: "Stoocker ile stok yönetimimiz tamamen değişti. Artık her şey tek bir yerden, gerçek zamanlı olarak takip ediliyor.",
    author: "Ahmet Yılmaz",
    role: "Operasyon Müdürü",
    company: "TechCorp",
    initials: "AY",
  },
  {
    id: 2,
    quote: "Envanter takibi hiç bu kadar kolay olmamıştı. Stoocker sayesinde stok maliyetlerimizi %30 azalttık.",
    author: "Elif Demir",
    role: "Satın Alma Direktörü",
    company: "RetailPlus",
    initials: "ED",
  },
  {
    id: 3,
    quote: "Müşteri desteği mükemmel. Her sorumuz anında çözüme kavuşuyor. Kesinlikle tavsiye ederim.",
    author: "Mehmet Kaya",
    role: "Genel Müdür",
    company: "LogiTech Solutions",
    initials: "MK",
  },
  {
    id: 4,
    quote: "Çoklu depo yönetimi özelliği işimizi inanılmaz kolaylaştırdı. Tüm lokasyonları tek panelden yönetiyoruz.",
    author: "Zeynep Aksoy",
    role: "Lojistik Müdürü",
    company: "GlobalTrade",
    initials: "ZA",
  },
]
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

      // Extract tenant-code from subdomain and set cookie
      const parts = hostname.split('.')
      if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'auth') {
        const tenantCode = parts[0]
        // Set tenant-code cookie for API requests
        document.cookie = `tenant-code=${tenantCode}; path=/; domain=.stoocker.app; SameSite=Lax`
        console.log('🍪 Set tenant-code cookie from subdomain:', tenantCode)
      }
    }
  }, [])

  const [step, setStep] = useState<'email' | 'tenant-selection' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [tenants, setTenants] = useState<TenantInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [backoffUntil, setBackoffUntil] = useState<number | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Testimonial slider state
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Auto-rotate testimonials
  const nextTestimonial = useCallback(() => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length)
      setIsTransitioning(false)
    }, 300)
  }, [])

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 6000) // Change every 6 seconds
    return () => clearInterval(interval)
  }, [nextTestimonial])

  // Detect if we're on tenant subdomain (not auth domain)
  const isOnTenantSubdomain = () => {
    if (typeof window === 'undefined') return false
    const hostname = window.location.hostname
    const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'localhost:3000'

    // Extract auth hostname (remove protocol)
    const authHostname = authDomain.replace(/^https?:\/\//, '').split(':')[0]

    // If we're NOT on auth subdomain and NOT on root domain, we're on tenant subdomain
    return !hostname.includes(authHostname) && !hostname.includes('www.') && hostname.includes('.')
  }

  // Restore state from URL params or sessionStorage
  useEffect(() => {
    const emailParam = searchParams.get('email')
    const tenantCodeParam = searchParams.get('tenant')
    const tenantData = sessionStorage.getItem('login-tenant')

    if (emailParam) {
      setEmail(emailParam)
    }

    // If on tenant subdomain with email+tenant params, skip to password
    if (isOnTenantSubdomain() && emailParam && tenantCodeParam) {
      // Create minimal tenant object for password step
      // Signature will be fetched from backend when needed
      setTenant({
        code: tenantCodeParam,
        name: tenantCodeParam,
        id: '', // Will be populated by backend
        signature: '', // Will be fetched on login
        timestamp: Date.now(),
        domain: window.location.hostname
      })
      setStep('password')
      return
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

      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      console.log('🔍 Calling check-email API:', `${authDomain}/api/auth/check-email`)
      console.log('📧 Email:', email)

      const response = await fetch(`${authDomain}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include', // Important for CORS cookies
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('✅ Response received, status:', response.status)

      const data = await response.json()

      // DEBUG: Log the full response
      console.log('🔍 CheckEmail Response:', JSON.stringify(data, null, 2))
      console.log('🏢 Tenants data:', data.data)
      console.log('📋 Tenants array:', data.data?.tenants)

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

      // Backend returns: { success, data: { exists, tenants } }
      const tenantsList = data.data?.tenants || []

      if (!tenantsList || tenantsList.length === 0) {
        setError('Bu e-posta adresi için erişilebilir çalışma alanı bulunamadı')
        return
      }

      // Store tenants list and email
      setTenants(tenantsList)

      // Update URL with email for recovery
      const url = new URL(window.location.href)
      url.searchParams.set('email', email)
      window.history.replaceState({}, '', url)

      setStep('tenant-selection')
    } catch (err) {
      console.error('❌ Check-email error:', err)

      // Handle different error types
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          trackAuth({ event: 'login_failure', metadata: { step: 'email', errorType: 'timeout' } })
          setError('İstek zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.')
        } else {
          trackAuth({ event: 'login_failure', metadata: { step: 'email', errorType: 'network_error', message: err.message } })
          setError(`Bağlantı hatası: ${err.message}`)
        }
      } else {
        trackAuth({ event: 'login_failure', metadata: { step: 'email', errorType: 'unknown_error' } })
        setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTenantSelect = (selectedTenant: TenantInfo) => {
    // Redirect to selected tenant's login page with email pre-filled
    const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
    const tenantDomain = isProduction
      ? `https://${selectedTenant.code}.stoocker.app`
      : `http://localhost:3001` // Development tenant domain

    // Store email and tenant for the next page
    sessionStorage.setItem('login-email', email)
    sessionStorage.setItem('login-tenant-code', selectedTenant.code)

    // Redirect to tenant's login page
    window.location.href = `${tenantDomain}/login?email=${encodeURIComponent(email)}&tenant=${selectedTenant.code}`
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
      if (!tenant?.code) {
        setError('Tenant bilgisi eksik. Lütfen baştan giriş yapın.')
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
          tenantSignature: tenant.signature || '',
          tenantTimestamp: tenant.timestamp || Date.now()
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
      // Support both old and new API response formats for backward compatibility
      const authData = data.data || data

      trackAuth({
        event: 'login_success',
        metadata: {
          tenantCode: tenant.code,
          duration: loginDuration,
          requires2FA: authData.requires2FA
        }
      })

      sessionStorage.removeItem('login-tenant')
      setFailedAttempts(0)
      setBackoffUntil(null)

      // Handle 2FA if required
      if (authData.requires2FA) {
        // Store email in sessionStorage for 2FA verification
        sessionStorage.setItem('2fa_email', email);
        router.push('/verify-2fa');
        return;
      }

      // Check if setup is required and store in localStorage
      console.log('🔍 Checking requiresSetup in authData:', authData.requiresSetup);
      console.log('📋 Full authData:', JSON.stringify(authData, null, 2));

      if (authData.requiresSetup === true) {
        localStorage.setItem('requiresSetup', 'true');
        console.log('✅ Setup required flag set in localStorage');
        console.log('📦 Verify localStorage:', localStorage.getItem('requiresSetup'));
      } else {
        console.log('⚠️ Setup NOT required or undefined, removing flag');
        // Make sure flag is removed if not required
        localStorage.removeItem('requiresSetup');
      }

      // Redirect to tenant dashboard
      console.log('🎯 Login success! Redirecting to tenant dashboard...')
      console.log('📋 Tenant code:', tenant.code)
      const tenantUrl = getClientTenantUrl(tenant.code)
      console.log('🌐 Tenant URL:', tenantUrl)
      console.log('🚀 Full redirect URL:', `${tenantUrl}/app`)

      // Wait for cookies to be set before redirecting
      setTimeout(() => {
        window.location.href = `${tenantUrl}/app`
      }, 100)
    } catch (err) {
      trackAuth({ event: 'login_failure', metadata: { step: 'password', errorType: 'exception' } })
      setError('Giriş yapılırken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Corporate Branding with Testimonial */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

        {/* Subtle dot pattern - enhanced visibility */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full">
          {/* Testimonial Slider - Vertically Centered */}
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
                      setIsTransitioning(true)
                      setTimeout(() => {
                        setCurrentTestimonial(index)
                        setIsTransitioning(false)
                      }, 300)
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

          {/* Stats - Bottom */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-800 mt-8">
            <div>
              <div className="text-3xl font-semibold text-white">2,500+</div>
              <div className="text-sm text-slate-500 mt-1">Aktif İşletme</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white">99.9%</div>
              <div className="text-sm text-slate-500 mt-1">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white">4.9/5</div>
              <div className="text-sm text-slate-500 mt-1">Müşteri Puanı</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        {/* Back to Home Link */}
        <Link
          href="/"
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
          <span className="text-sm">Ana Sayfa</span>
        </Link>

        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              {step === 'email' && 'Hesabınıza giriş yapın'}
              {step === 'tenant-selection' && 'Çalışma alanı seçin'}
              {step === 'password' && 'Şifrenizi girin'}
            </h1>
            <p className="text-slate-500">
              {step === 'email' && 'E-posta adresinizi girerek başlayın'}
              {step === 'tenant-selection' && `${email} için erişilebilir alanlar`}
              {step === 'password' && `${tenant?.name || tenant?.code} hesabına giriş`}
            </p>
          </div>

          {/* Tenant Card - Password Step */}
          {tenant && step === 'password' && (
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-semibold">
                    {tenant.name?.[0]?.toUpperCase() || tenant.code?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{tenant.name || tenant.code}</div>
                    <div className="text-sm text-slate-500">
                      {tenant.code}.stoocker.app
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
                  className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Değiştir
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              id="error-message"
              role="alert"
              aria-live="polite"
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Forms */}
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email-input" className="block text-sm font-medium text-slate-700 mb-2">
                  E-posta adresi
                </label>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  placeholder="ornek@sirket.com"
                  required
                  autoFocus
                  autoComplete="email"
                  aria-describedby={error ? "error-message" : undefined}
                  aria-invalid={!!error}
                  suppressHydrationWarning
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-black hover:bg-slate-800 text-white py-3.5 px-4 rounded-lg font-semibold text-base transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Kontrol ediliyor...</span>
                  </>
                ) : (
                  <span>Devam et</span>
                )}
              </button>

              {/* Register Link */}
              <p className="text-center text-sm text-slate-500">
                Hesabınız yok mu?{' '}
                <Link href="/register" className="text-slate-900 font-medium hover:underline">
                  Ücretsiz başlayın
                </Link>
              </p>
            </form>
          ) : step === 'tenant-selection' ? (
            <div className="space-y-4">
              {/* Tenant List */}
              <div className="space-y-3">
                {tenants.map((t) => (
                  <button
                    key={t.code}
                    onClick={() => handleTenantSelect(t)}
                    className="w-full p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-900 hover:bg-slate-50 transition-all group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {t.name?.[0]?.toUpperCase() || t.code?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 group-hover:text-slate-900">
                          {t.name || t.code}
                        </div>
                        <div className="text-sm text-slate-500 truncate">
                          {t.domain || `${t.code}.stoocker.app`}
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>

              {/* Back button */}
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setTenants([])
                }}
                className="w-full text-slate-500 hover:text-slate-900 py-3 text-sm font-medium transition-colors"
              >
                ← Farklı e-posta kullan
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password-input" className="block text-sm font-medium text-slate-700">
                    Şifre
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Şifremi unuttum
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                    autoFocus
                    autoComplete="current-password"
                    aria-describedby={error ? "error-message" : undefined}
                    aria-invalid={!!error}
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
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
              </div>

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full bg-black hover:bg-slate-800 text-white py-3.5 px-4 rounded-lg font-semibold text-base transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Giriş yapılıyor...</span>
                  </>
                ) : (
                  <span>Giriş yap</span>
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
                className="w-full text-slate-500 hover:text-slate-900 py-2 text-sm font-medium transition-colors"
              >
                ← Farklı hesap kullan
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-slate-600 transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-slate-600 transition-colors">Şartlar</Link>
              <Link href="/help" className="hover:text-slate-600 transition-colors">Yardım</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-8 w-8 border-2 border-slate-900 border-t-transparent rounded-full" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
