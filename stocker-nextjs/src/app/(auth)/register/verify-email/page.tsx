'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MailOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState('')

  const handleResendEmail = async () => {
    if (!email) return

    setResending(true)
    setResendError('')
    setResendSuccess(false)

    try {
      const response = await fetch('/api/public/tenant-registration/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'E-posta gönderilemedi')
      }

      setResendSuccess(true)
    } catch (err: any) {
      setResendError(err.message || 'Bir hata oluştu')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <MailOutlined className="text-4xl text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">E-posta Adresinizi Doğrulayın</h2>
            <p className="mt-2 text-sm text-gray-600">
              Kayıt işleminiz başarıyla tamamlandı!
            </p>
          </div>

          {/* Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>{email}</strong> adresine bir doğrulama e-postası gönderdik.
            </p>
            <p className="mt-2 text-xs text-gray-600">
              Lütfen gelen kutunuzu kontrol edin ve e-postadaki bağlantıya tıklayarak hesabınızı aktive edin.
            </p>
          </div>

          {/* Resend Success */}
          {resendSuccess && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircleOutlined />
              <span className="text-sm">E-posta başarıyla tekrar gönderildi!</span>
            </div>
          )}

          {/* Resend Error */}
          {resendError && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <CloseCircleOutlined />
              <span className="text-sm">{resendError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {resending ? 'Gönderiliyor...' : 'E-postayı Tekrar Gönder'}
            </button>

            <Link
              href="/login"
              className="block w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-center font-medium"
            >
              Giriş Sayfasına Dön
            </Link>
          </div>

          {/* Help Text */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              E-postayı göremiyorsanız spam/gereksiz klasörünü kontrol edin.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
