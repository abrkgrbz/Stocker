'use client';

/**
 * Security Settings Page
 * With 2FA Integration
 */

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Smartphone,
  Key,
  Shield,
  Monitor,
  Globe,
  Clock,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Copy,
  RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  use2FAStatus,
  useSetup2FA,
  useEnable2FA,
  useDisable2FA,
  useSecurityOverview,
  useActiveSessions,
  useSecurityEvents,
  useChangePassword,
  type ActiveSessionDto,
  type ChangePasswordRequest,
} from './hooks';
import { useProfile } from '../profile/hooks';

// Modal Component
function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function SecurityPage() {
  const { data: profile } = useProfile();
  const { data: twoFactorStatus, isLoading: statusLoading, refetch: refetch2FAStatus } = use2FAStatus();
  const { data: securityOverview, isLoading: overviewLoading } = useSecurityOverview();
  const { data: activeSessions, isLoading: sessionsLoading } = useActiveSessions();
  const { data: securityEvents } = useSecurityEvents(1, 5);
  const { mutate: setup2FA, isPending: isSettingUp, data: setupData, reset: resetSetup } = useSetup2FA();
  const { mutate: enable2FA, isPending: isEnabling } = useEnable2FA();
  const { mutate: disable2FA, isPending: isDisabling } = useDisable2FA();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [setupStep, setSetupStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Get 2FA enabled status from API or profile
  const twoFactorEnabled = twoFactorStatus?.data?.enabled ?? securityOverview?.data?.twoFactorEnabled ?? profile?.data?.twoFactorEnabled ?? false;
  const backupCodesRemaining = twoFactorStatus?.data?.backupCodesRemaining ?? 0;
  const securityScore = securityOverview?.data?.securityScore ?? (twoFactorEnabled ? 100 : 75);

  // Format password last changed
  const passwordLastChanged = securityOverview?.data?.passwordLastChanged
    ? formatTimeAgo(new Date(securityOverview.data.passwordLastChanged))
    : 'Bilinmiyor';

  const lastLoginDate = securityOverview?.data?.lastLoginDate
    ? new Date(securityOverview.data.lastLoginDate).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
    : profile?.data?.lastLoginDate
      ? new Date(profile.data.lastLoginDate).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
      : '-';

  // Get active sessions from API
  const sessions: ActiveSessionDto[] = activeSessions?.data ?? [];

  // Helper function to format time ago
  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bugun';
    if (diffDays === 1) return 'Dun';
    if (diffDays < 7) return `${diffDays} gun once`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta once`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay once`;
    return `${Math.floor(diffDays / 365)} yil once`;
  }

  const handleSetup2FA = () => {
    setup2FA(undefined, {
      onSuccess: (response) => {
        if (response.success) {
          setShowSetupModal(true);
          setSetupStep('qr');
        } else {
          setErrorMessage(response.message || '2FA kurulumu baslatilirken hata olustu');
          setTimeout(() => setErrorMessage(''), 3000);
        }
      },
      onError: (error: any) => {
        setErrorMessage(error?.message || '2FA kurulumu baslatilirken hata olustu');
        setTimeout(() => setErrorMessage(''), 3000);
      },
    });
  };

  const handleVerifyAndEnable = () => {
    if (verificationCode.length !== 6) {
      setErrorMessage('Lutfen 6 haneli kodu girin');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    enable2FA(verificationCode, {
      onSuccess: (response) => {
        if (response.success) {
          setSetupStep('backup');
          refetch2FAStatus();
        } else {
          setErrorMessage(response.message || 'Kod dogrulanamadi');
          setTimeout(() => setErrorMessage(''), 3000);
        }
      },
      onError: (error: any) => {
        setErrorMessage(error?.message || 'Kod dogrulanamadi');
        setTimeout(() => setErrorMessage(''), 3000);
      },
    });
  };

  const handleDisable2FA = () => {
    if (disableCode.length !== 6) {
      setErrorMessage('Lutfen 6 haneli kodu girin');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    disable2FA(disableCode, {
      onSuccess: (response) => {
        if (response.success) {
          setShowDisableModal(false);
          setDisableCode('');
          setSuccessMessage('2FA devre disi birakildi');
          refetch2FAStatus();
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setErrorMessage(response.message || 'Kod dogrulanamadi');
          setTimeout(() => setErrorMessage(''), 3000);
        }
      },
      onError: (error: any) => {
        setErrorMessage(error?.message || 'Kod dogrulanamadi');
        setTimeout(() => setErrorMessage(''), 3000);
      },
    });
  };

  const handleCloseSetupModal = () => {
    setShowSetupModal(false);
    setVerificationCode('');
    setSetupStep('qr');
    resetSetup();
    if (setupStep === 'backup') {
      setSuccessMessage('2FA basariyla etkinlestirildi');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleChangePassword = () => {
    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setErrorMessage('Tum alanlari doldurun');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setErrorMessage('Yeni sifre en az 8 karakter olmalidir');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('Yeni sifreler eslesmiyor');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    changePassword(passwordForm, {
      onSuccess: (response) => {
        if (response.success) {
          setShowPasswordModal(false);
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setSuccessMessage('Sifreniz basariyla degistirildi');
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setErrorMessage(response.message || 'Sifre degistirilemedi');
          setTimeout(() => setErrorMessage(''), 3000);
        }
      },
      onError: (error: any) => {
        setErrorMessage(error?.message || 'Sifre degistirilemedi');
        setTimeout(() => setErrorMessage(''), 3000);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {(successMessage || errorMessage) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-white border rounded-lg shadow-lg ${errorMessage ? 'border-red-200' : 'border-slate-200'
            }`}
        >
          {errorMessage ? (
            <AlertCircle className="w-4 h-4 text-red-600" />
          ) : (
            <Check className="w-4 h-4 text-emerald-600" />
          )}
          <span className="text-sm text-slate-900">{successMessage || errorMessage}</span>
        </motion.div>
      )}

      {/* Header Card - Security Overview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-2xl">
              <Shield className="w-8 h-8 text-slate-700" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Hesap Guvenligi</h1>
              <p className="text-sm text-slate-500 mt-0.5">Guvenlik ayarlarinizi yonetin ve hesabinizi koruyun</p>
            </div>
          </div>

          {/* Security Score */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{overviewLoading ? '...' : `${securityScore}%`}</p>
              <p className="text-xs text-slate-500">Guvenlik Skoru</p>
            </div>
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke={securityScore >= 80 ? '#10b981' : securityScore >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="4"
                  strokeDasharray={`${securityScore * 1.508} 151`}
                  strokeLinecap="round"
                />
              </svg>
              {securityScore >= 80 && <Check className="absolute inset-0 m-auto w-5 h-5 text-emerald-500" />}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="text-center">
            <p className={`text-lg font-semibold ${twoFactorEnabled ? 'text-emerald-600' : 'text-amber-600'}`}>
              {statusLoading || overviewLoading ? '...' : twoFactorEnabled ? 'Aktif' : 'Kapali'}
            </p>
            <p className="text-xs text-slate-500">2FA Durumu</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">{overviewLoading ? '...' : passwordLastChanged}</p>
            <p className="text-xs text-slate-500">Sifre Degisikligi</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">
              {sessionsLoading ? '...' : securityOverview?.data?.activeSessions ?? sessions.length}
            </p>
            <p className="text-xs text-slate-500">Aktif Oturum</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">{overviewLoading ? '...' : lastLoginDate}</p>
            <p className="text-xs text-slate-500">Son Giris</p>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Authentication */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Kimlik Dogrulama</h2>
            <p className="text-xs text-slate-500 mt-0.5">Sifre ve 2FA ayarlari</p>
          </div>
          <div className="divide-y divide-slate-100">
            {/* Password */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Lock className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Sifre</p>
                    <p className="text-xs text-slate-500">Son degisiklik: {passwordLastChanged}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Degistir
                </button>
              </div>
            </div>

            {/* 2FA */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Smartphone className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Iki Faktorlu Dogrulama</p>
                    <p className="text-xs text-slate-500">
                      {twoFactorEnabled
                        ? `Aktif - ${backupCodesRemaining} yedek kod kaldi`
                        : 'Authenticator uygulamasi ile'}
                    </p>
                  </div>
                </div>
                {twoFactorEnabled ? (
                  <button
                    onClick={() => setShowDisableModal(true)}
                    disabled={isDisabling}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {isDisabling ? 'Devre disi birakiliyor...' : 'Devre Disi Birak'}
                  </button>
                ) : (
                  <button
                    onClick={handleSetup2FA}
                    disabled={isSettingUp}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {isSettingUp ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      'Etkinlestir'
                    )}
                  </button>
                )}
              </div>
              {!twoFactorEnabled && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-xs text-amber-700">
                    <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                    2FA etkinlestirerek hesabinizi daha guvenli hale getirin
                  </p>
                </div>
              )}
            </div>

            {/* API Keys */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Key className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">API Anahtarlari</p>
                    <p className="text-xs text-slate-500">0 aktif anahtar</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  Yonet
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sessions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Aktif Oturumlar</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {sessionsLoading ? '...' : `${sessions.length} cihaz bagli`}
              </p>
            </div>
            {sessions.length > 1 && (
              <button className="text-xs text-red-600 hover:text-red-700 font-medium">Tumunu Sonlandir</button>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {sessionsLoading ? (
              <div className="px-6 py-8 text-center text-sm text-slate-500">Yukleniyor...</div>
            ) : sessions.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-slate-500">Aktif oturum bulunamadi</div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Monitor className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">
                          {session.browser} - {session.device}
                        </p>
                        {session.isCurrent && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-600 rounded">
                            Bu cihaz
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <Globe className="w-3 h-3" />
                        <span>{session.location}</span>
                        <span>-</span>
                        <span>{session.ipAddress}</span>
                        <span>-</span>
                        <Clock className="w-3 h-3" />
                        <span>
                          {session.isCurrent
                            ? 'Su an aktif'
                            : new Date(session.lastActive).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Security Activity Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Guvenlik Etkinlikleri</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {securityEvents?.data?.items?.length ? (
            securityEvents.data.items.map((event, idx) => (
              <div key={event.id || idx} className="px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${event.success ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{event.action}</p>
                    <p className="text-xs text-slate-500">{event.description} - IP: {event.ipAddress}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">
                  {event.timestamp
                    ? new Date(event.timestamp).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                    : '-'}
                </span>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-sm text-slate-500">
              Henuz guvenlik etkinligi yok
            </div>
          )}
        </div>
        {securityEvents?.data?.totalItems && securityEvents.data.totalItems > 5 && (
          <div className="px-6 py-3 border-t border-slate-100">
            <button className="text-sm text-slate-600 hover:text-slate-900 font-medium">
              Tum etkinlikleri goruntule ({securityEvents.data.totalItems})
            </button>
          </div>
        )}
      </div>

      {/* 2FA Setup Modal */}
      <Modal isOpen={showSetupModal} onClose={handleCloseSetupModal} title="Iki Faktorlu Dogrulama Kurulumu">
        {setupStep === 'qr' && setupData?.data && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-4">
                Authenticator uygulamaniz ile asagidaki QR kodu tarayin veya gizli anahtari manuel olarak girin.
              </p>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 inline-block mb-4">
                <Image src={setupData.data.qrCodeUrl} alt="2FA QR Code" width={192} height={192} className="mx-auto" unoptimized />
              </div>

              {/* Secret Key */}
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Gizli Anahtar</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-sm font-mono text-slate-900">{setupData.data.secret}</code>
                  <button
                    onClick={() => copyToClipboard(setupData.data?.secret ?? '', 'secret')}
                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                  >
                    {copiedCode === 'secret' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSetupStep('verify')}
              className="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Devam Et
            </button>
          </div>
        )}

        {setupStep === 'verify' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-4">
                Authenticator uygulamanizda gorunen 6 haneli kodu girin.
              </p>

              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSetupStep('qr')}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Geri
              </button>
              <button
                onClick={handleVerifyAndEnable}
                disabled={verificationCode.length !== 6 || isEnabling}
                className="flex-1 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEnabling ? 'Dogrulaniyor...' : 'Dogrula ve Etkinlestir'}
              </button>
            </div>
          </div>
        )}

        {setupStep === 'backup' && setupData?.data && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">2FA Etkinlestirildi!</h4>
              <p className="text-sm text-slate-600">
                Asagidaki yedek kodlari guvenli bir yere kaydedin. Telefonunuza erisemezseniz bu kodlari kullanabilirsiniz.
              </p>
            </div>

            {/* Backup Codes */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                {setupData.data.backupCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white px-3 py-2 rounded border border-slate-200"
                  >
                    <code className="text-sm font-mono text-slate-900">{code}</code>
                    <button
                      onClick={() => copyToClipboard(code, `backup-${idx}`)}
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                    >
                      {copiedCode === `backup-${idx}` ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(setupData.data?.backupCodes?.join('\n') ?? '', 'all-codes')}
              className="w-full py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              {copiedCode === 'all-codes' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  Kopyalandi!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Tum Kodlari Kopyala
                </>
              )}
            </button>

            <button
              onClick={handleCloseSetupModal}
              className="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Tamamla
            </button>
          </div>
        )}
      </Modal>

      {/* Disable 2FA Modal */}
      <Modal isOpen={showDisableModal} onClose={() => setShowDisableModal(false)} title="2FA Devre Disi Birak">
        <div className="space-y-6">
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-700">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              2FA devre disi birakmak hesabinizin guvenligini azaltir. Emin misiniz?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Authenticator kodunuzu girin
            </label>
            <input
              type="text"
              maxLength={6}
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full text-center text-xl tracking-[0.3em] font-mono px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDisableModal(false);
                setDisableCode('');
              }}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Iptal
            </button>
            <button
              onClick={handleDisable2FA}
              disabled={disableCode.length !== 6 || isDisabling}
              className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDisabling ? 'Devre disi birakiliyor...' : 'Devre Disi Birak'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }}
        title="Sifre Degistir"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Mevcut Sifre
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="Mevcut sifrenizi girin"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Yeni Sifre
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Yeni sifrenizi girin"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">En az 8 karakter olmalidir</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Yeni Sifre (Tekrar)
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Yeni sifrenizi tekrar girin"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Iptal
            </button>
            <button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              className="flex-1 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? 'Degistiriliyor...' : 'Sifreyi Degistir'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
