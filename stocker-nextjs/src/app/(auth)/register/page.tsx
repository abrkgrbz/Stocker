'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function RegisterPage() {

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

      {/* RIGHT - Form Area (Empty for now) */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-2xl py-8">
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden mb-8 inline-block">
            <Logo variant="gradient" size="md" />
          </Link>

          {/* Form will be built here */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Kayıt Formu
            </h2>
            <p className="text-gray-600">
              Form yapısı sıfırdan oluşturulacak
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
