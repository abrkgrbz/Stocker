'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

// Dynamic import for GradientMesh to avoid SSR issues with Three.js
const GradientMesh = dynamic(() => import('@/components/landing/GradientMesh'), {
  ssr: false,
  loading: () => null,
})

// Testimonials data for Register page
const TESTIMONIALS = [
  {
    id: 1,
    quote: "Kurulum 5 dakika sürdü. İlk gün tüm ekip kullanmaya başladı. Bu kadar basit olacağını düşünmemiştik.",
    author: "Elif Kaya",
    role: "Kurucu Ortak",
    company: "ModernBiz",
    initials: "EK",
  },
  {
    id: 2,
    quote: "Rakiplerden geçiş çok kolay oldu. Tüm verilerimizi sorunsuz aktardık. Harika bir onboarding deneyimi.",
    author: "Can Özdemir",
    role: "IT Direktörü",
    company: "FastGrowth",
    initials: "CÖ",
  },
  {
    id: 3,
    quote: "14 günlük deneme süresi yeterli oldu. Ekibimiz ürünü o kadar sevdi ki hemen premium'a geçtik.",
    author: "Selin Arslan",
    role: "Finans Müdürü",
    company: "SmartRetail",
    initials: "SA",
  },
  {
    id: 4,
    quote: "Kurulumdan itibaren her adımda destek aldık. Canlı chat ile anında çözüm buluyoruz.",
    author: "Burak Yıldız",
    role: "Operasyon Şefi",
    company: "QuickLogistics",
    initials: "BY",
  },
]
import { useSignalRValidation } from '@/hooks/useSignalRValidation'
import { toast } from '@/lib/notifications/use-toast'
import { showAlert } from '@/lib/sweetalert-config'
import { authService } from '@/lib/api/services/auth.service'
import { ApiClientError, handleApiError } from '@/lib/api/client'

type Step = 'email' | 'password' | 'teamName' | 'fullName' | 'complete'

const steps = [
  { id: 'email', label: 'E-posta', number: 1 },
  { id: 'password', label: 'Şifre', number: 2 },
  { id: 'teamName', label: 'Takım', number: 3 },
  { id: 'fullName', label: 'Bilgiler', number: 4 },
]

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('email')
  const [isLoading, setIsLoading] = useState(false)

  // reCAPTCHA v3 hook
  const { executeRecaptcha } = useGoogleReCaptcha()

  // SignalR validation hook
  const {
    isConnected,
    validateEmail: signalRValidateEmail,
    checkPasswordStrength: signalRCheckPasswordStrength,
    validateTenantCode: signalRValidateTenantCode
  } = useSignalRValidation()

  // Form data
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [teamName, setTeamName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)
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

  // Validation states
  const [emailValid, setEmailValid] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordValid, setPasswordValid] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<number>(0)
  const [teamNameValid, setTeamNameValid] = useState(false)
  const [teamNameError, setTeamNameError] = useState('')

  // Redirect to auth domain if on root domain
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost'
      const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'http://localhost:3000'

      const normalizedAuthDomain = authDomain.startsWith('https://')
        ? authDomain.split(':').slice(0, 2).join(':')
        : authDomain

      const isRootDomain = hostname === baseDomain || hostname === `www.${baseDomain}`

      if (isRootDomain && !hostname.includes('localhost')) {
        const currentPath = window.location.pathname + window.location.search + window.location.hash
        window.location.href = `${normalizedAuthDomain}${currentPath}`
      }
    }
  }, [])

  // Email validation with SignalR
  useEffect(() => {
    if (!email) {
      setEmailValid(false)
      setEmailError('')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailValid(false)
      setEmailError('Geçerli bir e-posta adresi girin')
      return
    }

    if (isConnected) {
      signalRValidateEmail(email, (result) => {
        setEmailValid(result.isValid)
        setEmailError(result.isValid ? '' : result.message)
      })
    } else {
      setEmailValid(true)
      setEmailError('')
    }
  }, [email, isConnected, signalRValidateEmail])

  // Password validation with SignalR
  useEffect(() => {
    if (!password) {
      setPasswordValid(false)
      setPasswordError('')
      setPasswordStrength(0)
      return
    }

    if (isConnected) {
      signalRCheckPasswordStrength(password, (result) => {
        setPasswordStrength(result.score)
        setPasswordValid(result.score >= 3)
        setPasswordError(result.score >= 3 ? '' : (result.suggestions[0] || 'Şifre güçlendirilmeli'))
      })
    } else {
      if (password.length < 8) {
        setPasswordValid(false)
        setPasswordError('Şifre en az 8 karakter olmalı')
        return
      }
      if (!/[A-Z]/.test(password)) {
        setPasswordValid(false)
        setPasswordError('En az bir büyük harf içermeli')
        return
      }
      if (!/[a-z]/.test(password)) {
        setPasswordValid(false)
        setPasswordError('En az bir küçük harf içermeli')
        return
      }
      if (!/[0-9]/.test(password)) {
        setPasswordValid(false)
        setPasswordError('En az bir rakam içermeli')
        return
      }
      setPasswordValid(true)
      setPasswordError('')
      setPasswordStrength(4)
    }
  }, [password, isConnected, signalRCheckPasswordStrength])

  // Team name validation with SignalR
  useEffect(() => {
    if (!teamName) {
      setTeamNameValid(false)
      setTeamNameError('')
      return
    }

    const teamNameRegex = /^[a-z0-9-]+$/
    if (!teamNameRegex.test(teamName)) {
      setTeamNameValid(false)
      setTeamNameError('Sadece küçük harf, rakam ve tire (-) kullanın')
      return
    }

    if (teamName.length < 3) {
      setTeamNameValid(false)
      setTeamNameError('En az 3 karakter olmalı')
      return
    }

    if (isConnected) {
      signalRValidateTenantCode(teamName, (result) => {
        setTeamNameValid(result.isAvailable)
        setTeamNameError(result.isAvailable ? '' : result.message)
      })
    } else {
      setTeamNameValid(true)
      setTeamNameError('')
    }
  }, [teamName, isConnected, signalRValidateTenantCode])

  const handleEmailContinue = () => {
    if (emailValid) setCurrentStep('password')
  }

  const handlePasswordContinue = () => {
    if (passwordValid) setCurrentStep('teamName')
  }

  const handleTeamNameContinue = () => {
    if (teamNameValid) setCurrentStep('fullName')
  }

  const handleComplete = async () => {
    if (!firstName.trim() || !lastName.trim()) return

    setIsLoading(true)

    try {
      let captchaToken: string | undefined
      if (executeRecaptcha) {
        try {
          captchaToken = await executeRecaptcha('register')
        } catch (captchaError) {
          console.warn('[reCAPTCHA] Execution failed:', captchaError)
        }
      }

      const response = await authService.register({
        email,
        password,
        teamName,
        firstName,
        lastName,
        acceptTerms,
        acceptPrivacyPolicy: acceptPrivacy,
        captchaToken
      })

      if (response.success && response.data) {
        setCurrentStep('complete')
        // Alert kapandıktan sonra yönlendir
        await showAlert.success(
          'Kayıt Başarılı!',
          response.message || 'Lütfen email adresinizi kontrol edin ve doğrulama kodunu girin.'
        )
        window.location.href = `/register/verify-email?email=${encodeURIComponent(email)}`
      } else {
        const errorMessage = response.message || 'Kayıt işlemi başarısız oldu'
        if (errorMessage.includes('e-posta') || errorMessage.toLowerCase().includes('email')) {
          setEmailError(errorMessage)
          setEmailValid(false)
          setCurrentStep('email')
        } else if (errorMessage.includes('takım') || errorMessage.includes('team')) {
          setTeamNameError(errorMessage)
          setTeamNameValid(false)
          setCurrentStep('teamName')
        } else {
          toast.error(errorMessage)
        }
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = handleApiError(error)

      if (error instanceof ApiClientError) {
        const lowerMessage = errorMessage.toLowerCase()
        if (lowerMessage.includes('e-posta') || lowerMessage.includes('email') || lowerMessage.includes('mail')) {
          setEmailError(errorMessage)
          setEmailValid(false)
          setCurrentStep('email')
          setIsLoading(false)
          return
        }
        if (lowerMessage.includes('takım') || lowerMessage.includes('team') || lowerMessage.includes('tenant')) {
          setTeamNameError(errorMessage)
          setTeamNameValid(false)
          setCurrentStep('teamName')
          setIsLoading(false)
          return
        }
      }

      toast.error(errorMessage)
      setIsLoading(false)
    }
  }

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.id === currentStep)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'email':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                İş e-posta adresiniz
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailContinue()}
                className={`w-full px-4 py-3 bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  email && !emailValid ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-900'
                }`}
                placeholder="ornek@sirket.com"
                autoFocus
              />
              {emailError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {emailError}
                </p>
              )}
              {emailValid && (
                <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  E-posta geçerli
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={!emailValid}
              onClick={handleEmailContinue}
              className="w-full bg-black hover:bg-slate-800 text-white py-3.5 px-4 rounded-lg font-semibold text-base transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Devam et
            </button>

            <p className="text-center text-sm text-slate-500">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="text-slate-900 font-medium hover:underline">
                Giriş yapın
              </Link>
            </p>
          </div>
        )

      case 'password':
        return (
          <div className="space-y-6">
            <button
              onClick={() => setCurrentStep('email')}
              className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Geri
            </button>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Şifrenizi belirleyin
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordContinue()}
                  className={`w-full px-4 py-3 pr-12 bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    password && !passwordValid ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-900'
                  }`}
                  placeholder="En az 8 karakter"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
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
              {passwordError && (
                <p className="mt-2 text-sm text-red-600">{passwordError}</p>
              )}
              {password && !passwordError && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength >= level
                            ? passwordStrength >= 4 ? 'bg-emerald-500' : passwordStrength >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    {passwordStrength >= 4 ? 'Güçlü şifre' : passwordStrength >= 3 ? 'Orta güçlükte' : 'Zayıf şifre'}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!passwordValid}
              onClick={handlePasswordContinue}
              className="w-full bg-black hover:bg-slate-800 text-white py-3.5 px-4 rounded-lg font-semibold text-base transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Devam et
            </button>
          </div>
        )

      case 'teamName':
        return (
          <div className="space-y-6">
            <button
              onClick={() => setCurrentStep('password')}
              className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Geri
            </button>

            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-slate-700 mb-2">
                Çalışma alanı adresiniz
              </label>
              <div className="flex items-center">
                <input
                  id="teamName"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleTeamNameContinue()}
                  className={`flex-1 px-4 py-3 bg-white border rounded-l-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    teamName && !teamNameValid ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-900'
                  }`}
                  placeholder="sirketiniz"
                  autoFocus
                />
                <span className="px-4 py-3 bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg text-slate-500 text-sm">
                  .stoocker.app
                </span>
              </div>
              {teamName && (
                <p className="mt-2 text-sm text-slate-500">
                  Adresiniz: <span className="font-medium text-slate-700">{teamName}.stoocker.app</span>
                </p>
              )}
              {teamNameError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {teamNameError}
                </p>
              )}
              {teamNameValid && (
                <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Bu adres kullanılabilir
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={!teamNameValid}
              onClick={handleTeamNameContinue}
              className="w-full bg-black hover:bg-slate-800 text-white py-3.5 px-4 rounded-lg font-semibold text-base transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Devam et
            </button>
          </div>
        )

      case 'fullName':
        return (
          <div className="space-y-6">
            <button
              onClick={() => setCurrentStep('teamName')}
              className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Geri
            </button>

            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                  Adınız
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  placeholder="Adınız"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                  Soyadınız
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  placeholder="Soyadınız"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                    <Link href="/terms" target="_blank" className="text-slate-900 font-medium hover:underline">
                      Kullanım Koşulları
                    </Link>'nı okudum ve kabul ediyorum
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptPrivacy}
                    onChange={(e) => setAcceptPrivacy(e.target.checked)}
                    className="mt-1 w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                    <Link href="/privacy" target="_blank" className="text-slate-900 font-medium hover:underline">
                      Gizlilik Politikası
                    </Link>'nı okudum ve kabul ediyorum
                  </span>
                </label>
              </div>
            </div>

            <button
              type="button"
              disabled={!firstName.trim() || !lastName.trim() || !acceptTerms || !acceptPrivacy || isLoading}
              onClick={handleComplete}
              className="w-full bg-black hover:bg-slate-800 text-white py-3.5 px-4 rounded-lg font-semibold text-base transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Hesap oluşturuluyor...
                </>
              ) : (
                'Hesabı oluştur'
              )}
            </button>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                Hoş geldiniz, {firstName}!
              </h2>
              <p className="text-slate-500">
                Hesabınız başarıyla oluşturuldu.<br />
                <span className="font-medium text-slate-700">{teamName}.stoocker.app</span> adresiniz hazır.
              </p>
            </div>

            <button
              onClick={() => router.push('/app/dashboard')}
              className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-8 rounded-lg font-medium transition-colors"
            >
              Panele git
            </button>
          </div>
        )
    }
  }

  return (
    <div className="auth-page min-h-screen flex">
      {/* Left Panel - Corporate Branding with Testimonial */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0c0f1a] relative overflow-hidden">
        {/* Gradient Mesh Animation Background */}
        <div className="absolute inset-0">
          <Suspense fallback={<div className="absolute inset-0 bg-[#0c0f1a]" />}>
            <GradientMesh />
          </Suspense>
        </div>

        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-transparent to-slate-900/30" />

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
              <div className="text-3xl font-semibold text-white">5 dk</div>
              <div className="text-sm text-slate-500 mt-1">Kurulum Süresi</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white">14 gün</div>
              <div className="text-sm text-slate-500 mt-1">Ücretsiz Deneme</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white">7/24</div>
              <div className="text-sm text-slate-500 mt-1">Destek</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
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
          {/* Progress Steps */}
          {currentStep !== 'complete' && (
            <div className="mb-10">
              <div className="flex items-center justify-between relative">
                {/* Progress Line Background */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200" />
                {/* Progress Line Active */}
                <div
                  className="absolute top-4 left-0 h-0.5 bg-slate-900 transition-all duration-300"
                  style={{ width: `${(getCurrentStepIndex() / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                  const isActive = getCurrentStepIndex() >= index
                  const isCurrent = step.id === currentStep
                  return (
                    <div key={step.id} className="relative flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-200 text-slate-500'
                        } ${isCurrent ? 'ring-4 ring-slate-900/20' : ''}`}
                      >
                        {index < getCurrentStepIndex() ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          step.number
                        )}
                      </div>
                      <span className={`mt-2 text-xs font-medium ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Header */}
          {currentStep !== 'complete' && (
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-slate-900 mb-2">
                Hesabınızı oluşturun
              </h1>
              <p className="text-slate-500">
                14 gün ücretsiz deneyin, kredi kartı gerekmez
              </p>
            </div>
          )}

          {/* Step Content */}
          {renderStep()}

          {/* Footer */}
          {currentStep !== 'complete' && (
            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
                <Link href="/privacy" className="hover:text-slate-600 transition-colors">Gizlilik</Link>
                <Link href="/terms" className="hover:text-slate-600 transition-colors">Şartlar</Link>
                <Link href="/help" className="hover:text-slate-600 transition-colors">Yardım</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
