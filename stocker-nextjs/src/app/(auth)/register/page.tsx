'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input, Button } from 'antd'
import { MailOutlined, LockOutlined, TeamOutlined, UserOutlined, ArrowRightOutlined, CheckCircleFilled } from '@ant-design/icons'
import Logo from '@/components/Logo'
import { useSignalRValidation } from '@/hooks/useSignalRValidation'
import { showAlert } from '@/lib/sweetalert-config'

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          teamName,
          firstName,
          lastName,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Save token for authenticated setup
        if (data.token) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('refreshToken', data.refreshToken)
        }

        // Show email verification success message
        await showAlert.success(
          'Kayıt Başarılı! 📧',
          data.message || 'Lütfen email adresinizi kontrol edin ve doğrulama linkine tıklayın.'
        )

        // Registration successful - redirect to email verification
        setCurrentStep('complete')

        // Redirect to the URL specified by backend (email verification page)
        const redirectUrl = data.redirectUrl || `/register/verify-email?email=${encodeURIComponent(email)}`
        setTimeout(() => {
          window.location.href = redirectUrl
        }, 1000)
      } else {
        // Registration failed - handle specific errors
        const errorMessage = data.message || 'Kayıt işlemi başarısız oldu'

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
      await showAlert.error('Hata', 'Kayıt işlemi sırasında bir hata oluştu')
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
              <Link href="/signin" className="text-violet-600 hover:text-violet-700 font-medium">
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
                onPressEnter={handleComplete}
                className="h-14 text-lg"
              />
            </div>

            <Button
              type="primary"
              size="large"
              block
              disabled={!firstName.trim() || !lastName.trim()}
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
      <div className="hidden lg:flex lg:w-[45%] relative bg-black overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Gradient Mesh */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20" />

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

          {/* Glowing Orbs */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white overflow-y-auto">
          <div>
            <Link href="/" className="mb-16 inline-block">
              <Logo variant="white" size="lg" />
            </Link>

            <div className="space-y-8">
              <div>
                <h1 className="text-5xl font-bold mb-4 leading-tight">
                  Modern İşletme<br />Yönetimi Başlıyor
                </h1>
                <p className="text-xl text-white/70 max-w-md">
                  Stoocker ile işletmenizi dijital çağa taşıyın. Güçlü özellikler, kolay kullanım.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-6 max-w-md">
                <div className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Gerçek Zamanlı Doğrulama</div>
                    <p className="text-sm text-white/60">Form doldururken anlık validasyon</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Güvenli Altyapı</div>
                    <p className="text-sm text-white/60">256-bit şifreleme ile korunan veriler</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Hızlı Başlangıç</div>
                    <p className="text-sm text-white/60">5 dakikada sistemi kullanmaya başlayın</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">99.9%</div>
              <div className="text-sm text-white/60 mt-1">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">2M+</div>
              <div className="text-sm text-white/60 mt-1">İşlem</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">256-bit</div>
              <div className="text-sm text-white/60 mt-1">Şifreleme</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden mb-8 inline-block">
            <Logo variant="gradient" size="md" />
          </Link>

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
