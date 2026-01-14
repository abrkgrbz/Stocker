'use client';

import React, { useState, useEffect } from 'react';
import {
  ReceiptPercentIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CalculatorIcon,
  InformationCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// GİB Tevkifat Kodları - Türkiye Mevzuatı
const GIB_WITHHOLDING_CODES = [
  { code: '601', rate: '2/10', rateValue: 0.20, name: 'Yapım İşleri ile Bu İşlerle Birlikte İfa Edilen Mühendislik-Mimarlık ve Etüt-Proje Hizmetleri' },
  { code: '602', rate: '2/10', rateValue: 0.20, name: 'Etüt, Plan-Proje, Danışmanlık, Denetim ve Benzeri Hizmetler' },
  { code: '603', rate: '5/10', rateValue: 0.50, name: 'Makine, Teçhizat, Demirbaş ve Taşıtlara Ait Tadil, Bakım ve Onarım Hizmetleri' },
  { code: '604', rate: '5/10', rateValue: 0.50, name: 'Yemek Servis ve Organizasyon Hizmetleri' },
  { code: '605', rate: '5/10', rateValue: 0.50, name: 'İşgücü Temin Hizmetleri' },
  { code: '606', rate: '5/10', rateValue: 0.50, name: 'Yapı Denetim Hizmetleri' },
  { code: '607', rate: '5/10', rateValue: 0.50, name: 'Fason Olarak Yaptırılan Tekstil ve Konfeksiyon İşleri' },
  { code: '608', rate: '7/10', rateValue: 0.70, name: 'Turistik Mağazalara Verilen Müşteri Bulma / Götürme Hizmetleri' },
  { code: '609', rate: '9/10', rateValue: 0.90, name: 'Spor Kulüplerinin Yayın, Reklam ve İsim Hakkı Gelirlerine Konu İşlemler' },
  { code: '610', rate: '5/10', rateValue: 0.50, name: 'Temizlik, Çevre ve Bahçe Bakım Hizmetleri' },
  { code: '611', rate: '9/10', rateValue: 0.90, name: 'Servis Taşımacılığı Hizmetleri' },
  { code: '612', rate: '7/10', rateValue: 0.70, name: 'Her Türlü Baskı ve Basım Hizmetleri' },
  { code: '613', rate: '5/10', rateValue: 0.50, name: 'Diğer Hizmetler' },
  { code: '614', rate: '2/10', rateValue: 0.20, name: 'Kamu Özel İş Birliği Modeli ile Yaptırılan Sağlık Tesislerine İlişkin İşletme Döneminde Sunulan Hizmetler' },
  { code: '615', rate: '3/10', rateValue: 0.30, name: 'Ticari Reklam Hizmetleri' },
];

interface WithholdingRule {
  id: string;
  gibCode: string;
  rate: string;
  rateValue: number;
  name: string;
  description: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;
}

interface WithholdingCalculation {
  baseAmount: number;
  vatRate: number;
  vatAmount: number;
  withholdingRate: number;
  withholdingAmount: number;
  netVatAmount: number;
  totalAmount: number;
}

// Mock data
const mockWithholdingRules: WithholdingRule[] = [
  {
    id: '1',
    gibCode: '601',
    rate: '2/10',
    rateValue: 0.20,
    name: 'Yapım İşleri ile Bu İşlerle Birlikte İfa Edilen Mühendislik-Mimarlık ve Etüt-Proje Hizmetleri',
    description: 'İnşaat ve mühendislik projeleri için uygulanan tevkifat',
    isActive: true,
    effectiveFrom: '2024-01-01',
    effectiveTo: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    gibCode: '605',
    rate: '5/10',
    rateValue: 0.50,
    name: 'İşgücü Temin Hizmetleri',
    description: 'Personel temin hizmetleri için uygulanan tevkifat',
    isActive: true,
    effectiveFrom: '2024-01-01',
    effectiveTo: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '3',
    gibCode: '610',
    rate: '5/10',
    rateValue: 0.50,
    name: 'Temizlik, Çevre ve Bahçe Bakım Hizmetleri',
    description: 'Temizlik ve bakım hizmetleri için uygulanan tevkifat',
    isActive: true,
    effectiveFrom: '2024-01-01',
    effectiveTo: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '4',
    gibCode: '615',
    rate: '3/10',
    rateValue: 0.30,
    name: 'Ticari Reklam Hizmetleri',
    description: 'Reklam ve tanıtım hizmetleri için uygulanan tevkifat',
    isActive: true,
    effectiveFrom: '2024-01-01',
    effectiveTo: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export default function WithholdingPage() {
  const [rules, setRules] = useState<WithholdingRule[]>(mockWithholdingRules);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'calculator' | 'reference'>('rules');

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<WithholdingRule | null>(null);

  // Calculator states
  const [calcBaseAmount, setCalcBaseAmount] = useState<string>('');
  const [calcVatRate, setCalcVatRate] = useState<string>('20');
  const [calcWithholdingCode, setCalcWithholdingCode] = useState<string>('');
  const [calcResult, setCalcResult] = useState<WithholdingCalculation | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    gibCode: '',
    description: '',
    effectiveFrom: '',
    effectiveTo: '',
  });

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const filteredRules = rules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.gibCode.includes(searchTerm) ||
    rule.rate.includes(searchTerm)
  );

  const handleAddRule = () => {
    const selectedCode = GIB_WITHHOLDING_CODES.find(c => c.code === formData.gibCode);
    if (!selectedCode) {
      setToast({ message: 'Lütfen bir tevkifat kodu seçin', type: 'error' });
      return;
    }

    const newRule: WithholdingRule = {
      id: Date.now().toString(),
      gibCode: selectedCode.code,
      rate: selectedCode.rate,
      rateValue: selectedCode.rateValue,
      name: selectedCode.name,
      description: formData.description,
      isActive: true,
      effectiveFrom: formData.effectiveFrom || new Date().toISOString().split('T')[0],
      effectiveTo: formData.effectiveTo || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRules([...rules, newRule]);
    setAddModalOpen(false);
    setFormData({ gibCode: '', description: '', effectiveFrom: '', effectiveTo: '' });
    setToast({ message: 'Tevkifat kuralı başarıyla eklendi', type: 'success' });
  };

  const handleEditRule = () => {
    if (!selectedRule) return;

    const updatedRules = rules.map(rule =>
      rule.id === selectedRule.id
        ? { ...rule, description: formData.description, effectiveTo: formData.effectiveTo || null, updatedAt: new Date().toISOString() }
        : rule
    );

    setRules(updatedRules);
    setEditModalOpen(false);
    setSelectedRule(null);
    setToast({ message: 'Tevkifat kuralı başarıyla güncellendi', type: 'success' });
  };

  const handleDeleteRule = () => {
    if (!selectedRule) return;

    setRules(rules.filter(rule => rule.id !== selectedRule.id));
    setDeleteModalOpen(false);
    setSelectedRule(null);
    setToast({ message: 'Tevkifat kuralı başarıyla silindi', type: 'success' });
  };

  const handleToggleActive = (id: string) => {
    setRules(rules.map(rule =>
      rule.id === id ? { ...rule, isActive: !rule.isActive, updatedAt: new Date().toISOString() } : rule
    ));
  };

  const calculateWithholding = () => {
    const baseAmount = parseFloat(calcBaseAmount);
    const vatRate = parseFloat(calcVatRate) / 100;
    const selectedCode = GIB_WITHHOLDING_CODES.find(c => c.code === calcWithholdingCode);

    if (isNaN(baseAmount) || !selectedCode) {
      setToast({ message: 'Lütfen geçerli değerler girin', type: 'error' });
      return;
    }

    const vatAmount = baseAmount * vatRate;
    const withholdingAmount = vatAmount * selectedCode.rateValue;
    const netVatAmount = vatAmount - withholdingAmount;
    const totalAmount = baseAmount + netVatAmount;

    setCalcResult({
      baseAmount,
      vatRate: vatRate * 100,
      vatAmount,
      withholdingRate: selectedCode.rateValue * 100,
      withholdingAmount,
      netVatAmount,
      totalAmount,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <ReceiptPercentIcon className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Tevkifat Yönetimi</h1>
                <p className="text-slate-500 mt-1">KDV Tevkifat kuralları ve hesaplama</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFormData({ gibCode: '', description: '', effectiveFrom: '', effectiveTo: '' });
                setAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Yeni Kural Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'rules'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4" />
                Tevkifat Kuralları
              </div>
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'calculator'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CalculatorIcon className="w-4 h-4" />
                Tevkifat Hesaplama
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reference')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'reference'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <InformationCircleIcon className="w-4 h-4" />
                GİB Referans Kodları
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tevkifat kodu, oranı veya adı ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>
            </div>

            {/* Rules Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">GİB Kodu</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Oran</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Açıklama</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Geçerlilik</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 text-sm font-mono rounded">
                            {rule.gibCode}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 bg-slate-800 text-white text-sm font-semibold rounded">
                            {rule.rate}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <p className="text-sm font-medium text-slate-900 truncate">{rule.name}</p>
                            {rule.description && (
                              <p className="text-sm text-slate-500 truncate">{rule.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(rule.id)}
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                              rule.isActive
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {rule.isActive ? 'Aktif' : 'Pasif'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600">
                            <span>{rule.effectiveFrom}</span>
                            {rule.effectiveTo && (
                              <span className="text-slate-400"> - {rule.effectiveTo}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedRule(rule);
                                setFormData({
                                  gibCode: rule.gibCode,
                                  description: rule.description,
                                  effectiveFrom: rule.effectiveFrom,
                                  effectiveTo: rule.effectiveTo || '',
                                });
                                setEditModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRule(rule);
                                setDeleteModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredRules.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <ReceiptPercentIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Tevkifat kuralı bulunamadı</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calculator Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Tevkifat Hesaplama</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Matrah (KDV Hariç Tutar)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={calcBaseAmount}
                      onChange={(e) => setCalcBaseAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">₺</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">KDV Oranı (%)</label>
                  <select
                    value={calcVatRate}
                    onChange={(e) => setCalcVatRate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
                  >
                    <option value="1">%1</option>
                    <option value="10">%10</option>
                    <option value="20">%20</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tevkifat Kodu</label>
                  <select
                    value={calcWithholdingCode}
                    onChange={(e) => setCalcWithholdingCode(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
                  >
                    <option value="">Seçiniz...</option>
                    {GIB_WITHHOLDING_CODES.map((code) => (
                      <option key={code.code} value={code.code}>
                        {code.code} - {code.rate} - {code.name.substring(0, 50)}...
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={calculateWithholding}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <CalculatorIcon className="w-5 h-5" />
                  Hesapla
                </button>
              </div>
            </div>

            {/* Result */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Hesaplama Sonucu</h3>

              {calcResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">Matrah (KDV Hariç)</span>
                      <span className="text-sm font-medium text-slate-900">{formatCurrency(calcResult.baseAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">KDV Oranı</span>
                      <span className="text-sm font-medium text-slate-900">%{calcResult.vatRate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Hesaplanan KDV</span>
                      <span className="text-sm font-medium text-slate-900">{formatCurrency(calcResult.vatAmount)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-amber-800">Tevkifat Oranı</span>
                      <span className="text-sm font-semibold text-amber-900">%{calcResult.withholdingRate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-800">Tevkif Edilen KDV</span>
                      <span className="text-sm font-semibold text-amber-900">{formatCurrency(calcResult.withholdingAmount)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-green-800">Ödenecek KDV</span>
                      <span className="text-sm font-semibold text-green-900">{formatCurrency(calcResult.netVatAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-green-200">
                      <span className="text-sm font-medium text-green-800">Genel Toplam</span>
                      <span className="text-lg font-bold text-green-900">{formatCurrency(calcResult.totalAmount)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCalcResult(null);
                      setCalcBaseAmount('');
                      setCalcWithholdingCode('');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                    Sıfırla
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalculatorIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Hesaplama sonucu burada görünecek</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reference Tab */}
        {activeTab === 'reference' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <InformationCircleIcon className="w-6 h-6 text-slate-600" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">GİB Tevkifat Kodları Referans Tablosu</h3>
                  <p className="text-sm text-slate-500">117 Seri No'lu KDV Genel Tebliği kapsamında belirlenen tevkifat oranları</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Kod</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Oran</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Hizmet Türü</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {GIB_WITHHOLDING_CODES.map((code) => (
                    <tr key={code.code} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 text-sm font-mono rounded">
                          {code.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded ${
                          code.rateValue === 0.20 ? 'bg-blue-100 text-blue-700' :
                          code.rateValue === 0.30 ? 'bg-cyan-100 text-cyan-700' :
                          code.rateValue === 0.50 ? 'bg-amber-100 text-amber-700' :
                          code.rateValue === 0.70 ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {code.rate}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">{code.name}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {addModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setAddModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Yeni Tevkifat Kuralı</h3>
                <button onClick={() => setAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">GİB Tevkifat Kodu</label>
                  <select
                    value={formData.gibCode}
                    onChange={(e) => setFormData({ ...formData, gibCode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
                  >
                    <option value="">Seçiniz...</option>
                    {GIB_WITHHOLDING_CODES.map((code) => (
                      <option key={code.code} value={code.code}>
                        {code.code} - {code.rate} - {code.name.substring(0, 40)}...
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama (Opsiyonel)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    placeholder="Kural için ek açıklama..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Geçerlilik Başlangıcı</label>
                    <input
                      type="date"
                      value={formData.effectiveFrom}
                      onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Geçerlilik Bitişi (Opsiyonel)</label>
                    <input
                      type="date"
                      value={formData.effectiveTo}
                      onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddRule}
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedRule && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setEditModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Tevkifat Kuralını Düzenle</h3>
                <button onClick={() => setEditModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700">{selectedRule.gibCode} - {selectedRule.rate}</p>
                  <p className="text-sm text-slate-500 mt-1">{selectedRule.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Geçerlilik Bitişi</label>
                  <input
                    type="date"
                    value={formData.effectiveTo}
                    onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleEditRule}
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && selectedRule && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDeleteModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">Kuralı Sil</h3>
                <p className="text-sm text-slate-500 text-center">
                  "{selectedRule.gibCode} - {selectedRule.rate}" kuralını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteRule}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-slate-800 text-white' : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
