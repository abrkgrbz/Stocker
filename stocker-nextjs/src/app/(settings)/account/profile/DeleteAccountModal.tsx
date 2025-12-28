'use client';

/**
 * Delete Account Modal - GitHub-style confirmation
 * User must type their username/email and password to confirm deletion
 * For tenant owners: Shows tenant deletion warning and requires additional confirmation
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Eye, EyeOff, Loader2, Building2, Database, Users, HardDrive } from 'lucide-react';
import { useDeleteAccount, useDeleteAccountPreview, DeleteAccountPreview } from './hooks';
import { useAuth } from '@/lib/auth';
import { ApiService } from '@/lib/api';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userIdentifier: string; // username or email to match
}

export function DeleteAccountModal({ isOpen, onClose, userIdentifier }: DeleteAccountModalProps) {
  const { logout } = useAuth();
  const { mutate: deleteAccount, isPending } = useDeleteAccount();

  const [confirmationText, setConfirmationText] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmTenantDeletion, setConfirmTenantDeletion] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<DeleteAccountPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const isConfirmationValid = confirmationText.toLowerCase() === userIdentifier.toLowerCase();

  // For owners, they must also check the tenant deletion confirmation
  const canSubmit = isConfirmationValid &&
    password.length > 0 &&
    !isPending &&
    (!preview?.isOwner || confirmTenantDeletion);

  // Load preview when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoadingPreview(true);
      ApiService.get<{ success: boolean; data: DeleteAccountPreview; message?: string }>('/api/account/delete/preview')
        .then((response) => {
          if (response.success && response.data) {
            setPreview(response.data);
          }
        })
        .catch((err) => {
          console.error('Failed to load delete preview:', err);
        })
        .finally(() => {
          setIsLoadingPreview(false);
        });
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmationText('');
      setPassword('');
      setShowPassword(false);
      setConfirmTenantDeletion(false);
      setError('');
      setPreview(null);
    }
  }, [isOpen]);

  const handleDelete = () => {
    if (!canSubmit) return;

    deleteAccount(
      {
        confirmationText,
        password,
        confirmTenantDeletion: preview?.isOwner ? confirmTenantDeletion : undefined
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            // Logout and redirect
            logout();
          } else {
            setError(response.message || 'Hesap silinemedi');
          }
        },
        onError: (err: Error & { response?: { data?: { message?: string } } }) => {
          setError(err?.response?.data?.message || err?.message || 'Bir hata oluştu');
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className={`border-b px-6 py-4 ${preview?.isOwner ? 'bg-red-100 border-red-200' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${preview?.isOwner ? 'bg-red-200' : 'bg-red-100'}`}>
                      {preview?.isOwner ? (
                        <Building2 className="w-5 h-5 text-red-700" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-red-900">
                        {preview?.isOwner ? 'Firma ve Hesabı Sil' : 'Hesabı Sil'}
                      </h2>
                      <p className="text-sm text-red-700 mt-0.5">
                        {preview?.isOwner ? 'TÜM FİRMA VERİLERİ SİLİNECEK!' : 'Bu işlem geri alınamaz'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {isLoadingPreview ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <>
                    {/* Owner Warning - Critical alert for tenant owners */}
                    {preview?.isOwner && (
                      <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-red-800">
                              DİKKAT: Firma Sahibi Olarak Hesabınızı Siliyorsunuz!
                            </p>
                            <p className="text-sm text-red-700 mt-1">
                              Bu işlem <strong>{preview.tenantName}</strong> firmasını ve tüm verilerini kalıcı olarak silecektir.
                              Bu işlem GERİ ALINAMAZ!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tenant Deletion Summary - Only for owners */}
                    {preview?.isOwner && preview.willDeleteTenant && (
                      <div className="border border-red-200 rounded-lg overflow-hidden">
                        <div className="bg-red-50 px-4 py-2 border-b border-red-200">
                          <p className="text-sm font-medium text-red-800">Silinecek Firma Bilgileri</p>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-slate-600">
                              <Building2 className="w-4 h-4" />
                              Firma Adı
                            </span>
                            <span className="font-medium text-slate-900">{preview.tenantName}</span>
                          </div>
                          {preview.databaseName && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2 text-slate-600">
                                <Database className="w-4 h-4" />
                                Veritabanı
                              </span>
                              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{preview.databaseName}</span>
                            </div>
                          )}
                          {preview.userCount > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2 text-slate-600">
                                <Users className="w-4 h-4" />
                                Kullanıcı Sayısı
                              </span>
                              <span className="font-medium text-red-600">{preview.userCount} kullanıcı</span>
                            </div>
                          )}
                          {preview.dataSizeMB > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2 text-slate-600">
                                <HardDrive className="w-4 h-4" />
                                Veri Boyutu
                              </span>
                              <span className="font-medium text-slate-900">{preview.dataSizeMB} MB</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Warnings from server */}
                    {preview?.warnings && preview.warnings.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-amber-800 mb-2">Uyarılar:</p>
                        <ul className="text-sm text-amber-700 space-y-1">
                          {preview.warnings.map((warning, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Standard warning for non-owners */}
                    {!preview?.isOwner && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-amber-800">
                          <strong>Dikkat:</strong> Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinecektir.
                          Bu işlemi onaylamak için lütfen aşağıdaki bilgileri girin.
                        </p>
                      </div>
                    )}

                    {/* Confirmation Text Input */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Onaylamak için <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-red-600">{userIdentifier}</span> yazın
                      </label>
                      <input
                        type="text"
                        value={confirmationText}
                        onChange={(e) => {
                          setConfirmationText(e.target.value);
                          setError('');
                        }}
                        placeholder={userIdentifier}
                        autoComplete="off"
                        className={`w-full px-4 py-3 border rounded-lg text-sm transition-colors ${
                          confirmationText && !isConfirmationValid
                            ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                            : isConfirmationValid
                            ? 'border-emerald-300 bg-emerald-50 focus:ring-emerald-500 focus:border-emerald-500'
                            : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2`}
                      />
                      {confirmationText && !isConfirmationValid && (
                        <p className="text-xs text-red-600 mt-1">
                          Girilen metin eşleşmiyor
                        </p>
                      )}
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Şifrenizi girin
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError('');
                          }}
                          placeholder="Şifreniz"
                          className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-slate-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Tenant Deletion Confirmation Checkbox - Only for owners */}
                    {preview?.isOwner && (
                      <div className="border-2 border-red-300 rounded-lg p-4 bg-red-50">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={confirmTenantDeletion}
                            onChange={(e) => setConfirmTenantDeletion(e.target.checked)}
                            className="mt-1 w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500"
                          />
                          <span className="text-sm text-red-800">
                            <strong>{preview.tenantName}</strong> firmasını ve tüm verilerini (veritabanı, kullanıcılar, belgeler)
                            kalıcı olarak silmek istediğimi onaylıyorum. Bu işlemin geri alınamayacağını anlıyorum.
                          </span>
                        </label>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    {/* What will be deleted - For non-owners */}
                    {!preview?.isOwner && (
                      <div className="border border-slate-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-slate-700 mb-2">Silinecekler:</p>
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Profil bilgileriniz
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Hesap ayarlarınız
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Aktivite geçmişiniz
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Tüm oturumlarınız
                          </li>
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!canSubmit}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    canSubmit
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-red-200 text-red-400 cursor-not-allowed'
                  }`}
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isPending
                    ? 'Siliniyor...'
                    : preview?.isOwner
                      ? 'Firmamı ve Hesabımı Sil'
                      : 'Hesabımı Sil'
                  }
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
