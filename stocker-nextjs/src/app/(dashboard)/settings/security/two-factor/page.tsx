'use client';

/**
 * Two-Factor Authentication Setup Page
 * Monochrome Design System - Professional Slate Palette
 * - Clean step-by-step wizard
 * - Slate color scheme only
 * - Modern card-based layout
 */

import { useState, useEffect } from 'react';
import { message } from 'antd';
import {
  ShieldCheckIcon,
  QrCodeIcon,
  KeyIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type BackupCode } from '@/lib/auth/totp';

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Setup 2FA on mount (call backend API)
  useEffect(() => {
    const setup2FA = async () => {
      try {
        setIsLoading(true);
        const { authService } = await import('@/lib/api/services');
        const response = await authService.setup2FA();

        if (response.success && response.data) {
          setSecret(response.data.secret);
          setQrCodeUrl(response.data.qrCodeUrl);
          setManualKey(response.data.secret.match(/.{1,4}/g)?.join(' ') || response.data.secret);

          // Convert backend backup codes to BackupCode format
          const codes: BackupCode[] = response.data.backupCodes.map((code) => ({
            code,
            used: false,
          }));
          setBackupCodes(codes);
        } else {
          message.error('2FA kurulumu başlatılamadı');
        }
      } catch (error) {
        message.error('Bir hata oluştu. Lütfen tekrar deneyin.');
        console.error('2FA setup error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setup2FA();
  }, []);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      message.error('Lütfen 6 haneli kodu girin');
      return;
    }

    try {
      const { authService } = await import('@/lib/api/services');
      const response = await authService.enable2FA(verificationCode);

      if (response.success) {
        message.success('2FA başarıyla etkinleştirildi!');
        setIsEnabled(true);
        setCurrentStep(2);
      } else {
        message.error('Doğrulama başarısız. Lütfen kodu kontrol edin.');
      }
    } catch (error) {
      message.error('Kod doğrulanamadı. Lütfen tekrar deneyin.');
      console.error('2FA enable error:', error);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    message.success('Anahtar panoya kopyalandı');
  };

  const handleDownloadCodes = () => {
    const text = backupCodes.map(bc => bc.code).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stocker-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    message.success('Yedekleme kodları indirildi');
  };

  const handleDisable2FA = async () => {
    try {
      const { authService } = await import('@/lib/api/services');
      const code = prompt('2FA\'yı devre dışı bırakmak için authenticator kodunu girin:');
      if (code) {
        const response = await authService.disable2FA(code);
        if (response.success) {
          message.success('2FA devre dışı bırakıldı');
          setIsEnabled(false);
          router.push('/settings/security');
        }
      }
    } catch (error) {
      message.error('İşlem başarısız. Kodu kontrol edin.');
    }
  };

  const steps = [
    { title: 'QR Kod Tara', icon: QrCodeIcon },
    { title: 'Doğrulama', icon: KeyIcon },
    { title: 'Yedekleme Kodları', icon: CheckCircleIcon },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">2FA kurulumu hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">İki Faktörlü Doğrulama</h1>
            <p className="text-sm text-slate-500">Hesabınızı ekstra güvenlik katmanıyla koruyun</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center gap-2 ${index <= currentStep ? 'text-slate-900' : 'text-slate-400'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    index < currentStep
                      ? 'bg-slate-900 text-white'
                      : index === currentStep
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${index < currentStep ? 'bg-slate-900' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          {currentStep === 0 && (
            <div className="space-y-6">
              {/* Info Alert */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <InformationCircleIcon className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-slate-900">Authenticator Uygulaması Gerekli</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Google Authenticator, Microsoft Authenticator veya Authy gibi bir uygulama indirin.
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center">
                {qrCodeUrl && (
                  <div className="inline-block p-4 bg-white border border-slate-200 rounded-xl">
                    <Image
                      src={qrCodeUrl}
                      alt="QR Code"
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Manual Key */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-900">Manuel Giriş Anahtarı</h3>
                  <button
                    onClick={handleCopySecret}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                  >
                    <DocumentDuplicateIcon className="w-3 h-3" />
                    Kopyala
                  </button>
                </div>
                <code className="block text-sm font-mono text-slate-700 bg-white border border-slate-200 rounded px-3 py-2">
                  {manualKey}
                </code>
                <p className="text-xs text-slate-500 mt-2">
                  QR kodu tarayamıyorsanız, bu anahtarı manuel olarak girin.
                </p>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 !bg-slate-900 hover:!bg-slate-800 !border-slate-900 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Devam Et
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Info Alert */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <InformationCircleIcon className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-slate-900">Uygulamadan Kodu Girin</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Authenticator uygulamanızda görünen 6 haneli kodu aşağıya girin.
                  </p>
                </div>
              </div>

              {/* Verification Code Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Doğrulama Kodu</label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full h-14 text-center text-2xl font-mono tracking-widest border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(0)}
                  className="flex-1 px-4 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Geri
                </button>
                <button
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6}
                  className="flex-1 px-4 py-3 !bg-slate-900 hover:!bg-slate-800 !border-slate-900 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Doğrula ve Etkinleştir
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Warning Alert */}
              <div className="flex items-start gap-3 p-4 bg-slate-100 border border-slate-200 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-slate-900">Yedekleme Kodlarınızı Kaydedin</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Telefonunuzu kaybederseniz bu kodlarla giriş yapabilirsiniz. Her kod sadece bir kez kullanılabilir.
                  </p>
                </div>
              </div>

              {/* Backup Codes */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-900">Yedekleme Kodları</h3>
                  <button
                    onClick={handleDownloadCodes}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-3 h-3" />
                    İndir
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((bc, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-white border border-slate-200 rounded text-center"
                    >
                      <code className="text-sm font-mono text-slate-700">{bc.code}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Alert */}
              <div className="flex items-start gap-3 p-4 bg-slate-900 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-white">2FA Başarıyla Etkinleştirildi!</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Artık hesabınız iki faktörlü doğrulama ile korunuyor.
                  </p>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full px-4 py-3 !bg-slate-900 hover:!bg-slate-800 !border-slate-900 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Dashboard'a Dön
              </button>
            </div>
          )}
        </div>

        {/* Security Status Card (when enabled) */}
        {isEnabled && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-900">2FA Aktif</h3>
                  <p className="text-xs text-slate-500">
                    Son etkinleştirme: {new Date().toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDisable2FA}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Devre Dışı Bırak
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
