'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input, Button, Checkbox } from 'antd'
import { MailOutlined, LockOutlined, TeamOutlined, UserOutlined, ArrowRightOutlined, CheckCircleFilled } from '@ant-design/icons'
import { useSignalRValidation } from '@/hooks/useSignalRValidation'
import { showAlert } from '@/lib/sweetalert-config'
import { cookieStorage } from '@/lib/auth/cookie-storage'
import { authService } from '@/lib/api/services/auth.service'
import { ApiClientError, handleApiError } from '@/lib/api/client'

type Step = 'email' | 'password' | 'teamName' | 'fullName' | 'complete'

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('email')
  const [isLoading, setIsLoading] = useState(false)

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

    // Basic client-side validation first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailValid(false)
      setEmailError('Geçerli bir e-posta adresi girin')
      return
    }

    // Real-time backend validation via SignalR
    if (isConnected) {
      signalRValidateEmail(email, (result) => {
        setEmailValid(result.isValid)
        setEmailError(result.isValid ? '' : result.message)
      })
    } else {
      // Fallback when SignalR not connected
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

    // Real-time backend strength check via SignalR
    if (isConnected) {
      signalRCheckPasswordStrength(password, (result) => {
        setPasswordStrength(result.score)
        // Score >= 3 means strong enough (out of 5)
        setPasswordValid(result.score >= 3)
        setPasswordError(result.score >= 3 ? '' : (result.suggestions[0] || 'Şifre güçlendirilmeli'))
      })
    } else {
      // Fallback client-side validation when SignalR not connected
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

    // Basic client-side validation first
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

    // Real-time backend availability check via SignalR
    if (isConnected) {
      signalRValidateTenantCode(teamName, (result) => {
        setTeamNameValid(result.isAvailable)
        setTeamNameError(result.isAvailable ? '' : result.message)
      })
    } else {
      // Fallback when SignalR not connected
      setTeamNameValid(true)
      setTeamNameError('')
    }
  }, [teamName, isConnected, signalRValidateTenantCode])

  const handleEmailContinue = () => {
    if (emailValid) {
      setCurrentStep('password')
    }
  }

  const handlePasswordContinue = () => {
    if (passwordValid) {
      setCurrentStep('teamName')
    }
  }

  const handleTeamNameContinue = () => {
    if (teamNameValid) {
      setCurrentStep('fullName')
    }
  }

  const handleComplete = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      return
    }

    setIsLoading(true)

    try {
      // Use new minimal registration endpoint
      const response = await authService.register({
        email,
        password,
        teamName,
        firstName,
        lastName,
        acceptTerms,
        acceptPrivacyPolicy: acceptPrivacy
      })

      if (response.success && response.data) {
        // Show email verification success message
        await showAlert.success(
          'Kayıt Başarılı! 📧',
          response.message || 'Lütfen email adresinizi kontrol edin ve doğrulama kodunu girin.'
        )

        // Registration successful - redirect to email verification
        setCurrentStep('complete')

        // Redirect to email verification page
        setTimeout(() => {
          window.location.href = `/register/verify-email?email=${encodeURIComponent(email)}`
        }, 1000)
      } else {
        // Registration failed - handle specific errors
        const errorMessage = response.message || 'Kayıt işlemi başarısız oldu'

        // Check if it's an email duplicate error
        if (errorMessage.includes('e-posta') || errorMessage.toLowerCase().includes('email')) {
          setEmailError(errorMessage)
          setEmailValid(false)
          setCurrentStep('email')
        }
        // Check if it's a team name duplicate error
        else if (errorMessage.includes('takım') || errorMessage.includes('team')) {
          setTeamNameError(errorMessage)
          setTeamNameValid(false)
          setCurrentStep('teamName')
        }
        // Generic error
        else {
          await showAlert.error('Kayıt Başarısız', errorMessage)
        }

        setIsLoading(false)
      }
    } catch (error) {
      console.error('Registration error:', error)

      // Extract actual error message from API
      const errorMessage = handleApiError(error)

      // Check if it's a specific error type and navigate to relevant step
      if (error instanceof ApiClientError) {
        const lowerMessage = errorMessage.toLowerCase()

        // Email already exists error
        if (lowerMessage.includes('e-posta') || lowerMessage.includes('email') || lowerMessage.includes('mail')) {
          setEmailError(errorMessage)
          setEmailValid(false)
          setCurrentStep('email')
          setIsLoading(false)
          return
        }

        // Team name already exists error
        if (lowerMessage.includes('takım') || lowerMessage.includes('team') || lowerMessage.includes('tenant')) {
          setTeamNameError(errorMessage)
          setTeamNameValid(false)
          setCurrentStep('teamName')
          setIsLoading(false)
          return
        }
      }

      // Show generic error with actual API message
      await showAlert.error('Kayıt Başarısız', errorMessage)
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'email':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                İş e-postanızı girin
              </h2>
              <p className="text-gray-600">
                Hesabınız bu e-posta ile oluşturulacak
              </p>
            </div>

            <div>
              <Input
                size="large"
                type="email"
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="ornek@sirket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                onPressEnter={handleEmailContinue}
                status={email && !emailValid ? 'error' : ''}
                className="h-14 text-lg"
                autoFocus
              />
              {emailError && (
                <p className="mt-2 text-sm text-red-600">{emailError}</p>
              )}
              {emailValid && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <CheckCircleFilled /> E-posta geçerli
                </p>
              )}
            </div>

            <Button
              type="primary"
              size="large"
              block
              disabled={!emailValid}
              onClick={handleEmailContinue}
              icon={<ArrowRightOutlined />}
              className="h-14 text-lg font-semibold"
            >
              E-posta ile Devam Et
            </Button>

            <p className="text-center text-sm text-gray-500">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="text-violet-600 hover:text-violet-700 font-medium">
                Giriş Yapın
              </Link>
            </p>
          </div>
        )

      case 'password':
        return (
          <div className="space-y-6">
            <button
              onClick={() => setCurrentStep('email')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              ← Geri
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Şifrenizi belirleyin
              </h2>
              <p className="text-gray-600">
                Güçlü bir şifre oluşturun
              </p>
            </div>

            <div>
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="En az 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onPressEnter={handlePasswordContinue}
                status={password && !passwordValid ? 'error' : ''}
                className="h-14 text-lg"
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600">{passwordError}</p>
              )}
              {passwordValid && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <CheckCircleFilled /> Şifre güçlü
                </p>
              )}
              {!passwordError && password && (
                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  <p className={password.length >= 8 ? 'text-green-600' : ''}>• En az 8 karakter</p>
                  <p className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>• Bir büyük harf</p>
                  <p className={/[a-z]/.test(password) ? 'text-green-600' : ''}>• Bir küçük harf</p>
                  <p className={/[0-9]/.test(password) ? 'text-green-600' : ''}>• Bir rakam</p>
                </div>
              )}
            </div>

            <Button
              type="primary"
              size="large"
              block
              disabled={!passwordValid}
              onClick={handlePasswordContinue}
              icon={<ArrowRightOutlined />}
              className="h-14 text-lg font-semibold"
            >
              Şifreyi Onayla
            </Button>
          </div>
        )

      case 'teamName':
        return (
          <div className="space-y-6">
            <button
              onClick={() => setCurrentStep('password')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              ← Geri
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Takım adınızı seçin
              </h2>
              <p className="text-gray-600">
                Bu, sizin Stoocker adresiniz olacak
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Input
                  size="large"
                  prefix={<TeamOutlined className="text-gray-400" />}
                  placeholder="sirketiniz"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  onPressEnter={handleTeamNameContinue}
                  status={teamName && !teamNameValid ? 'error' : ''}
                  className="h-14 text-lg flex-1"
                  autoFocus
                />
                <span className="text-gray-500 text-sm whitespace-nowrap">.stoocker.app</span>
              </div>

              <p className="text-sm text-gray-500 mb-2">
                Adresiniz: <span className="font-medium text-violet-600">{teamName || 'sirketiniz'}.stoocker.app</span>
              </p>

              {teamNameError && (
                <p className="mt-2 text-sm text-red-600">{teamNameError}</p>
              )}
              {teamNameValid && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <CheckCircleFilled /> Takım adı kullanılabilir
                </p>
              )}
            </div>

            <Button
              type="primary"
              size="large"
              block
              disabled={!teamNameValid}
              onClick={handleTeamNameContinue}
              icon={<ArrowRightOutlined />}
              className="h-14 text-lg font-semibold"
            >
              Takım Adını Onayla
            </Button>
          </div>
        )

      case 'fullName':
        return (
          <div className="space-y-6">
            <button
              onClick={() => setCurrentStep('teamName')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              ← Geri
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Adınız ve soyadınız
              </h2>
              <p className="text-gray-600">
                Son adım! Hemen tamamlayın
              </p>
            </div>

            <div className="space-y-4">
              <Input
                size="large"
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Adınız"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-14 text-lg"
                autoFocus
              />

              <Input
                size="large"
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Soyadınız"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-14 text-lg"
              />

              <div className="space-y-3 pt-2">
                <Checkbox
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="text-sm"
                >
                  <span className="text-gray-700">
                    <Link href="/terms" target="_blank" className="text-violet-600 hover:text-violet-700 font-medium">
                      Kullanım Koşulları
                    </Link>'nı okudum ve kabul ediyorum
                  </span>
                </Checkbox>

                <Checkbox
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                  className="text-sm"
                >
                  <span className="text-gray-700">
                    <Link href="/privacy" target="_blank" className="text-violet-600 hover:text-violet-700 font-medium">
                      Gizlilik Politikası
                    </Link>'nı okudum ve kabul ediyorum
                  </span>
                </Checkbox>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              block
              disabled={!firstName.trim() || !lastName.trim() || !acceptTerms || !acceptPrivacy}
              onClick={handleComplete}
              loading={isLoading}
              className="h-14 text-lg font-semibold btn-neon-green"
            >
              Tamamla ve Kullanmaya Başla
            </Button>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleFilled className="text-5xl text-green-600" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900">
              Hoş geldiniz, {firstName}!
            </h2>

            <p className="text-lg text-gray-600">
              Hesabınız başarıyla oluşturuldu.<br />
              <span className="font-medium text-violet-600">{teamName}.stoocker.app</span> adresiniz hazır.
            </p>

            <Button
              type="primary"
              size="large"
              onClick={() => router.push('/app/dashboard')}
              className="h-14 px-12 text-lg font-semibold btn-neon-green"
            >
              Panele Git
            </Button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT - Premium Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-black overflow-hidden">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20" />

        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Glowing Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Floating Elements */}
        <div className="absolute top-32 right-32 w-3 h-3 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-48 right-48 w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-48 left-32 w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top Badge Row */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-white/90 font-medium">Ücretsiz başlayın</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-lg border border-white/10">
              <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs text-white/80">ISO 27001</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white leading-tight">
                İşletmenizi
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  dijitale taşıyın
                </span>
              </h1>

              <p className="text-xl text-white/70 leading-relaxed max-w-md">
                Stoocker ile modern ERP deneyimini keşfedin. 5 dakikada kurulum, hemen kullanmaya başlayın.
              </p>
            </div>

            {/* Security Feature Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-1">256-bit SSL</h3>
                <p className="text-white/50 text-sm">Uçtan uca şifreli bağlantı</p>
              </div>

              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-1">KVKK Uyumlu</h3>
                <p className="text-white/50 text-sm">Yasal veri koruma standardı</p>
              </div>

              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-1">2FA Desteği</h3>
                <p className="text-white/50 text-sm">İki faktörlü kimlik doğrulama</p>
              </div>

              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-1">Otomatik Yedekleme</h3>
                <p className="text-white/50 text-sm">Günlük veri yedekleme</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">99.9%</div>
                <div className="text-sm text-white/60 mt-1">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">2M+</div>
                <div className="text-sm text-white/60 mt-1">İşlem/gün</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">256-bit</div>
                <div className="text-sm text-white/60 mt-1">Şifreleme</div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium text-sm">KVKK Uyumlu</div>
                  <div className="text-white/50 text-xs">Veri güvenliği garantisi</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Bulut Tabanlı</div>
                  <div className="text-white/50 text-xs">Her yerden erişim</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-6 text-white/40 text-xs">
              <span>AWS Altyapısı</span>
              <span>•</span>
              <span>7/24 Destek</span>
              <span>•</span>
              <span>Otomatik Yedekleme</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white relative overflow-y-auto">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-violet-100 to-transparent rounded-full blur-3xl opacity-30" />

        <div className="w-full max-w-md py-8 relative z-10">
          {/* Progress Indicator */}
          {currentStep !== 'complete' && (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2">
                <div className={`h-2 w-2 rounded-full ${currentStep === 'email' || currentStep === 'password' || currentStep === 'teamName' || currentStep === 'fullName' ? 'bg-violet-600' : 'bg-gray-200'}`} />
                <div className={`h-2 w-2 rounded-full ${currentStep === 'password' || currentStep === 'teamName' || currentStep === 'fullName' ? 'bg-violet-600' : 'bg-gray-200'}`} />
                <div className={`h-2 w-2 rounded-full ${currentStep === 'teamName' || currentStep === 'fullName' ? 'bg-violet-600' : 'bg-gray-200'}`} />
                <div className={`h-2 w-2 rounded-full ${currentStep === 'fullName' ? 'bg-violet-600' : 'bg-gray-200'}`} />
              </div>
            </div>
          )}

          {/* Step Content */}
          {renderStep()}
        </div>
      </div>
    </div>
  )
}
