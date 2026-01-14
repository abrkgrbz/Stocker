'use client';

import React, { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ServerIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  LinkIcon,
  ClockIcon,
  BuildingOffice2Icon,
  DocumentDuplicateIcon,
  ReceiptPercentIcon,
  BoltIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface GibSettings {
  // Company Info
  companyName: string;
  taxOffice: string;
  taxNumber: string;
  mersisNo: string;
  ticaretSicilNo: string;

  // GİB Credentials
  gibUsername: string;
  gibPassword: string;
  pkcs12Certificate: string | null;
  certificatePassword: string;
  certificateExpiry: string | null;

  // E-Fatura Settings
  eFaturaEnabled: boolean;
  eFaturaPrefix: string;
  eFaturaStartNumber: number;
  eFaturaIntegrator: 'gib_portal' | 'private_integrator';
  integratorName: string;
  integratorApiUrl: string;
  integratorApiKey: string;

  // E-Arşiv Settings
  eArsivEnabled: boolean;
  eArsivPrefix: string;
  eArsivStartNumber: number;
  eArsivAutoSend: boolean;
  eArsivDefaultDelivery: 'email' | 'sms' | 'portal';

  // E-İrsaliye Settings
  eIrsaliyeEnabled: boolean;
  eIrsaliyePrefix: string;
  eIrsaliyeStartNumber: number;

  // Auto Settings
  autoSendOnApproval: boolean;
  autoCheckStatus: boolean;
  statusCheckInterval: number; // minutes
  retryOnFailure: boolean;
  maxRetryCount: number;
}

interface ConnectionStatus {
  connected: boolean;
  lastCheck: string | null;
  message: string;
}

// Mock settings
const mockSettings: GibSettings = {
  companyName: 'Demo Şirket A.Ş.',
  taxOffice: 'Kadıköy',
  taxNumber: '1234567890',
  mersisNo: '0123456789012345',
  ticaretSicilNo: '123456',

  gibUsername: 'demo_user',
  gibPassword: '********',
  pkcs12Certificate: 'certificate.p12',
  certificatePassword: '********',
  certificateExpiry: '2025-12-31',

  eFaturaEnabled: true,
  eFaturaPrefix: 'EFT',
  eFaturaStartNumber: 1,
  eFaturaIntegrator: 'private_integrator',
  integratorName: 'Demo Entegratör',
  integratorApiUrl: 'https://api.demo-integrator.com/v1',
  integratorApiKey: '********',

  eArsivEnabled: true,
  eArsivPrefix: 'EAR',
  eArsivStartNumber: 1,
  eArsivAutoSend: true,
  eArsivDefaultDelivery: 'email',

  eIrsaliyeEnabled: false,
  eIrsaliyePrefix: 'EIR',
  eIrsaliyeStartNumber: 1,

  autoSendOnApproval: true,
  autoCheckStatus: true,
  statusCheckInterval: 15,
  retryOnFailure: true,
  maxRetryCount: 3,
};

export default function GibSettingsPage() {
  const [settings, setSettings] = useState<GibSettings>(mockSettings);
  const [activeTab, setActiveTab] = useState<'company' | 'credentials' | 'efatura' | 'earsiv' | 'eirsaliye' | 'automation'>('company');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: true,
    lastCheck: '2024-01-15T10:30:00',
    message: 'GİB bağlantısı aktif',
  });

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
    setToast({ message: 'Ayarlar başarıyla kaydedildi', type: 'success' });
  };

  const handleTestConnection = async () => {
    setToast({ message: 'Bağlantı test ediliyor...', type: 'info' });
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConnectionStatus({
      connected: true,
      lastCheck: new Date().toISOString(),
      message: 'GİB bağlantısı başarılı',
    });
    setToast({ message: 'GİB bağlantısı başarılı', type: 'success' });
  };

  const handleCertificateUpload = () => {
    // In real app, this would open file picker
    setToast({ message: 'Sertifika yükleme işlemi simüle edildi', type: 'info' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Cog6ToothIcon className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">GİB Ayarları</h1>
                <p className="text-slate-500 mt-1">e-Fatura, e-Arşiv ve e-İrsaliye entegrasyon ayarları</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                connectionStatus.connected ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className={`text-sm font-medium ${
                  connectionStatus.connected ? 'text-green-700' : 'text-red-700'
                }`}>
                  {connectionStatus.connected ? 'Bağlı' : 'Bağlantı Yok'}
                </span>
              </div>
              <button
                onClick={handleTestConnection}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Bağlantı Test
              </button>
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircleIcon className="w-5 h-5" />
                    )}
                    Kaydet
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Düzenle
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex -mb-px overflow-x-auto">
            {[
              { id: 'company', icon: BuildingOffice2Icon, label: 'Firma Bilgileri' },
              { id: 'credentials', icon: KeyIcon, label: 'Kimlik Bilgileri' },
              { id: 'efatura', icon: DocumentTextIcon, label: 'E-Fatura' },
              { id: 'earsiv', icon: DocumentDuplicateIcon, label: 'E-Arşiv' },
              { id: 'eirsaliye', icon: ReceiptPercentIcon, label: 'E-İrsaliye' },
              { id: 'automation', icon: BoltIcon, label: 'Otomasyon' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Company Tab */}
        {activeTab === 'company' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Firma Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Firma Ünvanı</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Vergi Dairesi</label>
                  <input
                    type="text"
                    value={settings.taxOffice}
                    onChange={(e) => setSettings({ ...settings, taxOffice: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Vergi Numarası</label>
                  <input
                    type="text"
                    value={settings.taxNumber}
                    onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">MERSİS No</label>
                  <input
                    type="text"
                    value={settings.mersisNo}
                    onChange={(e) => setSettings({ ...settings, mersisNo: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ticaret Sicil No</label>
                  <input
                    type="text"
                    value={settings.ticaretSicilNo}
                    onChange={(e) => setSettings({ ...settings, ticaretSicilNo: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Credentials Tab */}
        {activeTab === 'credentials' && (
          <div className="space-y-6">
            {/* GİB Portal Credentials */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheckIcon className="w-6 h-6 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900">GİB Portal Kimlik Bilgileri</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={settings.gibUsername}
                    onChange={(e) => setSettings({ ...settings, gibUsername: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Şifre</label>
                  <input
                    type="password"
                    value={settings.gibPassword}
                    onChange={(e) => setSettings({ ...settings, gibPassword: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Certificate */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <KeyIcon className="w-6 h-6 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900">Dijital Sertifika (PKCS#12)</h3>
              </div>

              {settings.pkcs12Certificate ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Sertifika yüklü</p>
                        <p className="text-sm text-green-600">{settings.pkcs12Certificate}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Sertifika Şifresi</label>
                      <input
                        type="password"
                        value={settings.certificatePassword}
                        onChange={(e) => setSettings({ ...settings, certificatePassword: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Geçerlilik Tarihi</label>
                      <input
                        type="text"
                        value={settings.certificateExpiry || ''}
                        disabled
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                      />
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={handleCertificateUpload}
                      className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <CloudArrowUpIcon className="w-5 h-5" />
                      Yeni Sertifika Yükle
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <KeyIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">Henüz sertifika yüklenmemiş</p>
                  {isEditing && (
                    <button
                      onClick={handleCertificateUpload}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors mx-auto"
                    >
                      <CloudArrowUpIcon className="w-5 h-5" />
                      Sertifika Yükle
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* E-Fatura Tab */}
        {activeTab === 'efatura' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="w-6 h-6 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-900">E-Fatura Ayarları</h3>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className={`text-sm font-medium ${settings.eFaturaEnabled ? 'text-green-600' : 'text-slate-500'}`}>
                    {settings.eFaturaEnabled ? 'Aktif' : 'Pasif'}
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.eFaturaEnabled}
                      onChange={(e) => setSettings({ ...settings, eFaturaEnabled: e.target.checked })}
                      disabled={!isEditing}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      settings.eFaturaEnabled ? 'bg-green-500' : 'bg-slate-300'
                    } ${!isEditing ? 'opacity-50' : ''}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        settings.eFaturaEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                </label>
              </div>

              {settings.eFaturaEnabled && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Fatura Prefix</label>
                      <input
                        type="text"
                        value={settings.eFaturaPrefix}
                        onChange={(e) => setSettings({ ...settings, eFaturaPrefix: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Başlangıç Numarası</label>
                      <input
                        type="number"
                        value={settings.eFaturaStartNumber}
                        onChange={(e) => setSettings({ ...settings, eFaturaStartNumber: parseInt(e.target.value) })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Entegrasyon Tipi</label>
                      <select
                        value={settings.eFaturaIntegrator}
                        onChange={(e) => setSettings({ ...settings, eFaturaIntegrator: e.target.value as any })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500 bg-white"
                      >
                        <option value="gib_portal">GİB Portal</option>
                        <option value="private_integrator">Özel Entegratör</option>
                      </select>
                    </div>
                  </div>

                  {settings.eFaturaIntegrator === 'private_integrator' && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-slate-700 mb-4">Özel Entegratör Ayarları</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Entegratör Adı</label>
                          <input
                            type="text"
                            value={settings.integratorName}
                            onChange={(e) => setSettings({ ...settings, integratorName: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">API URL</label>
                          <input
                            type="url"
                            value={settings.integratorApiUrl}
                            onChange={(e) => setSettings({ ...settings, integratorApiUrl: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
                          <input
                            type="password"
                            value={settings.integratorApiKey}
                            onChange={(e) => setSettings({ ...settings, integratorApiKey: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* E-Arşiv Tab */}
        {activeTab === 'earsiv' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <DocumentDuplicateIcon className="w-6 h-6 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-900">E-Arşiv Ayarları</h3>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className={`text-sm font-medium ${settings.eArsivEnabled ? 'text-green-600' : 'text-slate-500'}`}>
                    {settings.eArsivEnabled ? 'Aktif' : 'Pasif'}
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.eArsivEnabled}
                      onChange={(e) => setSettings({ ...settings, eArsivEnabled: e.target.checked })}
                      disabled={!isEditing}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      settings.eArsivEnabled ? 'bg-green-500' : 'bg-slate-300'
                    } ${!isEditing ? 'opacity-50' : ''}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        settings.eArsivEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                </label>
              </div>

              {settings.eArsivEnabled && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Fatura Prefix</label>
                      <input
                        type="text"
                        value={settings.eArsivPrefix}
                        onChange={(e) => setSettings({ ...settings, eArsivPrefix: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Başlangıç Numarası</label>
                      <input
                        type="number"
                        value={settings.eArsivStartNumber}
                        onChange={(e) => setSettings({ ...settings, eArsivStartNumber: parseInt(e.target.value) })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Varsayılan Teslimat</label>
                      <select
                        value={settings.eArsivDefaultDelivery}
                        onChange={(e) => setSettings({ ...settings, eArsivDefaultDelivery: e.target.value as any })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500 bg-white"
                      >
                        <option value="email">E-posta</option>
                        <option value="sms">SMS</option>
                        <option value="portal">Portal</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="autoSend"
                      checked={settings.eArsivAutoSend}
                      onChange={(e) => setSettings({ ...settings, eArsivAutoSend: e.target.checked })}
                      disabled={!isEditing}
                      className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                    />
                    <label htmlFor="autoSend" className="text-sm text-slate-700">
                      Onaylanan faturaları otomatik olarak GİB'e gönder
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* E-İrsaliye Tab */}
        {activeTab === 'eirsaliye' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ReceiptPercentIcon className="w-6 h-6 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-900">E-İrsaliye Ayarları</h3>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className={`text-sm font-medium ${settings.eIrsaliyeEnabled ? 'text-green-600' : 'text-slate-500'}`}>
                    {settings.eIrsaliyeEnabled ? 'Aktif' : 'Pasif'}
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.eIrsaliyeEnabled}
                      onChange={(e) => setSettings({ ...settings, eIrsaliyeEnabled: e.target.checked })}
                      disabled={!isEditing}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      settings.eIrsaliyeEnabled ? 'bg-green-500' : 'bg-slate-300'
                    } ${!isEditing ? 'opacity-50' : ''}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        settings.eIrsaliyeEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                </label>
              </div>

              {settings.eIrsaliyeEnabled ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">İrsaliye Prefix</label>
                    <input
                      type="text"
                      value={settings.eIrsaliyePrefix}
                      onChange={(e) => setSettings({ ...settings, eIrsaliyePrefix: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Başlangıç Numarası</label>
                    <input
                      type="number"
                      value={settings.eIrsaliyeStartNumber}
                      onChange={(e) => setSettings({ ...settings, eIrsaliyeStartNumber: parseInt(e.target.value) })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ReceiptPercentIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">E-İrsaliye devre dışı</p>
                  <p className="text-sm text-slate-400 mt-1">Aktif etmek için düzenleme moduna geçin</p>
                </div>
              )}
            </div>

            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">E-İrsaliye Zorunluluğu</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Belirli sektörlerde (gıda, içecek, tıbbi cihaz vb.) faaliyet gösteren işletmeler için e-irsaliye kullanımı zorunludur.
                    Detaylı bilgi için GİB web sitesini ziyaret edin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <BoltIcon className="w-6 h-6 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900">Otomasyon Ayarları</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Onay Sonrası Otomatik Gönder</p>
                    <p className="text-sm text-slate-500">Fatura onaylandığında otomatik olarak GİB'e gönderilir</p>
                  </div>
                  <label className="relative cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoSendOnApproval}
                      onChange={(e) => setSettings({ ...settings, autoSendOnApproval: e.target.checked })}
                      disabled={!isEditing}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      settings.autoSendOnApproval ? 'bg-green-500' : 'bg-slate-300'
                    } ${!isEditing ? 'opacity-50' : ''}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        settings.autoSendOnApproval ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Otomatik Durum Kontrolü</p>
                    <p className="text-sm text-slate-500">Gönderilen faturaların durumu periyodik olarak kontrol edilir</p>
                  </div>
                  <label className="relative cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoCheckStatus}
                      onChange={(e) => setSettings({ ...settings, autoCheckStatus: e.target.checked })}
                      disabled={!isEditing}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      settings.autoCheckStatus ? 'bg-green-500' : 'bg-slate-300'
                    } ${!isEditing ? 'opacity-50' : ''}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        settings.autoCheckStatus ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </label>
                </div>

                {settings.autoCheckStatus && (
                  <div className="pl-4 border-l-2 border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kontrol Aralığı (dakika)</label>
                    <select
                      value={settings.statusCheckInterval}
                      onChange={(e) => setSettings({ ...settings, statusCheckInterval: parseInt(e.target.value) })}
                      disabled={!isEditing}
                      className="w-full max-w-xs px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500 bg-white"
                    >
                      <option value="5">5 dakika</option>
                      <option value="15">15 dakika</option>
                      <option value="30">30 dakika</option>
                      <option value="60">1 saat</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Başarısızlıkta Yeniden Dene</p>
                    <p className="text-sm text-slate-500">Gönderim başarısız olduğunda otomatik olarak tekrar denenir</p>
                  </div>
                  <label className="relative cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.retryOnFailure}
                      onChange={(e) => setSettings({ ...settings, retryOnFailure: e.target.checked })}
                      disabled={!isEditing}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      settings.retryOnFailure ? 'bg-green-500' : 'bg-slate-300'
                    } ${!isEditing ? 'opacity-50' : ''}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        settings.retryOnFailure ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </label>
                </div>

                {settings.retryOnFailure && (
                  <div className="pl-4 border-l-2 border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Maksimum Deneme Sayısı</label>
                    <select
                      value={settings.maxRetryCount}
                      onChange={(e) => setSettings({ ...settings, maxRetryCount: parseInt(e.target.value) })}
                      disabled={!isEditing}
                      className="w-full max-w-xs px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500 bg-white"
                    >
                      <option value="1">1 kez</option>
                      <option value="3">3 kez</option>
                      <option value="5">5 kez</option>
                      <option value="10">10 kez</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Last Check Info */}
            {connectionStatus.lastCheck && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Son Bağlantı Kontrolü</p>
                    <p className="text-sm font-medium text-slate-700">
                      {new Date(connectionStatus.lastCheck).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-slate-800 text-white' :
          toast.type === 'error' ? 'bg-red-600 text-white' :
          'bg-blue-600 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <CheckCircleIcon className="w-5 h-5" />}
            {toast.type === 'error' && <ExclamationTriangleIcon className="w-5 h-5" />}
            {toast.type === 'info' && <InformationCircleIcon className="w-5 h-5" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
