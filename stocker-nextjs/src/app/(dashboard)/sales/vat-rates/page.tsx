'use client';

import React, { useState, useEffect } from 'react';
import {
  CalculatorIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

// Türkiye KDV Oranları - Güncel Mevzuat
const VAT_RATES_REFERENCE = {
  standard: {
    rate: 20,
    description: 'Genel KDV Oranı',
    examples: ['Genel mal ve hizmetler', 'Elektronik ürünler', 'Otomobiller', 'Mobilya', 'Giyim (lüks)'],
  },
  reduced: {
    rate: 10,
    description: 'İndirimli KDV Oranı',
    examples: ['Tekstil ürünleri', 'Giyim ve ayakkabı', 'Kâğıt ve kâğıt ürünleri', 'İlaç hammaddeleri', 'Bazı gıda maddeleri'],
  },
  superReduced: {
    rate: 1,
    description: 'Süper İndirimli KDV Oranı',
    examples: ['Temel gıda maddeleri', 'Ekmek', 'Un', 'Süt', 'Gazete ve dergiler', 'Kitaplar', 'Tarım ürünleri'],
  },
  exempt: {
    rate: 0,
    description: 'KDV İstisna',
    examples: ['İhracat', 'Uluslararası taşımacılık', 'Diplomatik muafiyet', 'Transit ticaret'],
  },
};

interface VatRate {
  id: string;
  name: string;
  rate: number;
  category: 'standard' | 'reduced' | 'superReduced' | 'exempt';
  description: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VatCalculation {
  baseAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  reverseBaseAmount?: number;
}

// Mock data
const mockVatRates: VatRate[] = [
  {
    id: '1',
    name: 'Genel KDV',
    rate: 20,
    category: 'standard',
    description: 'Standart ürün ve hizmetler için uygulanan genel KDV oranı',
    effectiveFrom: '2024-07-01',
    effectiveTo: null,
    isActive: true,
    createdAt: '2024-07-01',
    updatedAt: '2024-07-01',
  },
  {
    id: '2',
    name: 'İndirimli KDV',
    rate: 10,
    category: 'reduced',
    description: 'Tekstil, giyim ve bazı ara mallar için uygulanan indirimli oran',
    effectiveFrom: '2024-01-01',
    effectiveTo: null,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '3',
    name: 'Temel Gıda KDV',
    rate: 1,
    category: 'superReduced',
    description: 'Temel gıda maddeleri için uygulanan süper indirimli oran',
    effectiveFrom: '2024-01-01',
    effectiveTo: null,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '4',
    name: 'İhracat KDV İstisnası',
    rate: 0,
    category: 'exempt',
    description: 'İhracat işlemlerinde uygulanan KDV istisnası',
    effectiveFrom: '2024-01-01',
    effectiveTo: null,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export default function VatRatesPage() {
  const [rates, setRates] = useState<VatRate[]>(mockVatRates);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'rates' | 'calculator' | 'reference' | 'history'>('rates');

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<VatRate | null>(null);

  // Calculator states
  const [calcMode, setCalcMode] = useState<'forward' | 'reverse'>('forward');
  const [calcAmount, setCalcAmount] = useState<string>('');
  const [calcVatRate, setCalcVatRate] = useState<string>('20');
  const [calcResult, setCalcResult] = useState<VatCalculation | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    category: 'standard' as 'standard' | 'reduced' | 'superReduced' | 'exempt',
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

  const filteredRates = rates.filter(rate =>
    rate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rate.rate.toString().includes(searchTerm) ||
    rate.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRate = () => {
    if (!formData.name || !formData.rate) {
      setToast({ message: 'Lütfen gerekli alanları doldurun', type: 'error' });
      return;
    }

    const newRate: VatRate = {
      id: Date.now().toString(),
      name: formData.name,
      rate: parseFloat(formData.rate),
      category: formData.category,
      description: formData.description,
      effectiveFrom: formData.effectiveFrom || new Date().toISOString().split('T')[0],
      effectiveTo: formData.effectiveTo || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRates([...rates, newRate]);
    setAddModalOpen(false);
    setFormData({ name: '', rate: '', category: 'standard', description: '', effectiveFrom: '', effectiveTo: '' });
    setToast({ message: 'KDV oranı başarıyla eklendi', type: 'success' });
  };

  const handleEditRate = () => {
    if (!selectedRate) return;

    const updatedRates = rates.map(rate =>
      rate.id === selectedRate.id
        ? {
            ...rate,
            name: formData.name,
            rate: parseFloat(formData.rate),
            category: formData.category,
            description: formData.description,
            effectiveTo: formData.effectiveTo || null,
            updatedAt: new Date().toISOString(),
          }
        : rate
    );

    setRates(updatedRates);
    setEditModalOpen(false);
    setSelectedRate(null);
    setToast({ message: 'KDV oranı başarıyla güncellendi', type: 'success' });
  };

  const handleDeleteRate = () => {
    if (!selectedRate) return;

    setRates(rates.filter(rate => rate.id !== selectedRate.id));
    setDeleteModalOpen(false);
    setSelectedRate(null);
    setToast({ message: 'KDV oranı başarıyla silindi', type: 'success' });
  };

  const handleToggleActive = (id: string) => {
    setRates(rates.map(rate =>
      rate.id === id ? { ...rate, isActive: !rate.isActive, updatedAt: new Date().toISOString() } : rate
    ));
  };

  const calculateVat = () => {
    const amount = parseFloat(calcAmount);
    const vatRate = parseFloat(calcVatRate) / 100;

    if (isNaN(amount)) {
      setToast({ message: 'Lütfen geçerli bir tutar girin', type: 'error' });
      return;
    }

    if (calcMode === 'forward') {
      // KDV Hariç tutardan KDV Dahil tutara
      const vatAmount = amount * vatRate;
      const totalAmount = amount + vatAmount;

      setCalcResult({
        baseAmount: amount,
        vatRate: vatRate * 100,
        vatAmount,
        totalAmount,
      });
    } else {
      // KDV Dahil tutardan KDV Hariç tutara (Ters Hesaplama)
      const baseAmount = amount / (1 + vatRate);
      const vatAmount = amount - baseAmount;

      setCalcResult({
        baseAmount,
        vatRate: vatRate * 100,
        vatAmount,
        totalAmount: amount,
        reverseBaseAmount: baseAmount,
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'standard':
        return 'bg-slate-100 text-slate-700';
      case 'reduced':
        return 'bg-blue-100 text-blue-700';
      case 'superReduced':
        return 'bg-green-100 text-green-700';
      case 'exempt':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'standard':
        return 'Standart';
      case 'reduced':
        return 'İndirimli';
      case 'superReduced':
        return 'Süper İndirimli';
      case 'exempt':
        return 'İstisna';
      default:
        return category;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <CalculatorIcon className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">KDV Oranları</h1>
                <p className="text-slate-500 mt-1">Türkiye KDV oranları yönetimi ve hesaplama</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFormData({ name: '', rate: '', category: 'standard', description: '', effectiveFrom: '', effectiveTo: '' });
                setAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Yeni Oran Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('rates')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'rates'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4" />
                KDV Oranları
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
                KDV Hesaplama
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
                Referans Tablosu
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                Oran Geçmişi
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Rates Tab */}
        {activeTab === 'rates' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-700">%20</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Genel Oran</p>
                    <p className="text-lg font-semibold text-slate-900">Standart KDV</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-700">%10</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">İndirimli Oran</p>
                    <p className="text-lg font-semibold text-slate-900">Tekstil & Giyim</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-green-700">%1</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Süper İndirimli</p>
                    <p className="text-lg font-semibold text-slate-900">Temel Gıda</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-amber-700">%0</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">KDV İstisna</p>
                    <p className="text-lg font-semibold text-slate-900">İhracat</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="KDV oranı veya açıklama ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>
            </div>

            {/* Rates Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Oran Adı</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Oran (%)</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Kategori</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Açıklama</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRates.map((rate) => (
                      <tr key={rate.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-900">{rate.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 bg-slate-800 text-white text-sm font-semibold rounded">
                            %{rate.rate}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${getCategoryBadge(rate.category)}`}>
                            {getCategoryName(rate.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-500 max-w-xs truncate">{rate.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(rate.id)}
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                              rate.isActive
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {rate.isActive ? 'Aktif' : 'Pasif'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedRate(rate);
                                setFormData({
                                  name: rate.name,
                                  rate: rate.rate.toString(),
                                  category: rate.category,
                                  description: rate.description,
                                  effectiveFrom: rate.effectiveFrom,
                                  effectiveTo: rate.effectiveTo || '',
                                });
                                setEditModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRate(rate);
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

              {filteredRates.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <CalculatorIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">KDV oranı bulunamadı</p>
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
              <h3 className="text-lg font-semibold text-slate-900 mb-6">KDV Hesaplama</h3>

              {/* Mode Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
                <button
                  onClick={() => {
                    setCalcMode('forward');
                    setCalcResult(null);
                  }}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    calcMode === 'forward'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  KDV Hesapla
                </button>
                <button
                  onClick={() => {
                    setCalcMode('reverse');
                    setCalcResult(null);
                  }}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    calcMode === 'reverse'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  KDV Ayır
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {calcMode === 'forward' ? 'KDV Hariç Tutar' : 'KDV Dahil Tutar'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">₺</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">KDV Oranı</label>
                  <select
                    value={calcVatRate}
                    onChange={(e) => setCalcVatRate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
                  >
                    <option value="1">%1 - Süper İndirimli (Temel Gıda)</option>
                    <option value="10">%10 - İndirimli (Tekstil/Giyim)</option>
                    <option value="20">%20 - Standart (Genel)</option>
                  </select>
                </div>

                <button
                  onClick={calculateVat}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <CalculatorIcon className="w-5 h-5" />
                  {calcMode === 'forward' ? 'KDV Hesapla' : 'KDV Ayır'}
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
                      <span className="text-sm text-slate-600">KDV Hariç Tutar</span>
                      <span className="text-sm font-medium text-slate-900">{formatCurrency(calcResult.baseAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">KDV Oranı</span>
                      <span className="text-sm font-medium text-slate-900">%{calcResult.vatRate}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-800">KDV Tutarı</span>
                      <span className="text-lg font-semibold text-blue-900">{formatCurrency(calcResult.vatAmount)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">KDV Dahil Toplam</span>
                      <span className="text-xl font-bold text-green-900">{formatCurrency(calcResult.totalAmount)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCalcResult(null);
                      setCalcAmount('');
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
          <div className="space-y-6">
            {/* Standard Rate */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 text-white text-lg font-bold rounded-lg">
                    %{VAT_RATES_REFERENCE.standard.rate}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{VAT_RATES_REFERENCE.standard.description}</h3>
                    <p className="text-sm text-slate-500">Standart Oran - Çoğu mal ve hizmet için geçerli</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm font-medium text-slate-700 mb-3">Uygulama Alanları:</p>
                <div className="flex flex-wrap gap-2">
                  {VAT_RATES_REFERENCE.standard.examples.map((example, index) => (
                    <span key={index} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reduced Rate */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-blue-50">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white text-lg font-bold rounded-lg">
                    %{VAT_RATES_REFERENCE.reduced.rate}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{VAT_RATES_REFERENCE.reduced.description}</h3>
                    <p className="text-sm text-slate-500">Tekstil, giyim ve bazı ara mallar</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm font-medium text-slate-700 mb-3">Uygulama Alanları:</p>
                <div className="flex flex-wrap gap-2">
                  {VAT_RATES_REFERENCE.reduced.examples.map((example, index) => (
                    <span key={index} className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Super Reduced Rate */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-green-50">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-12 h-12 bg-green-600 text-white text-lg font-bold rounded-lg">
                    %{VAT_RATES_REFERENCE.superReduced.rate}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{VAT_RATES_REFERENCE.superReduced.description}</h3>
                    <p className="text-sm text-slate-500">Temel gıda ve kültürel ürünler</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm font-medium text-slate-700 mb-3">Uygulama Alanları:</p>
                <div className="flex flex-wrap gap-2">
                  {VAT_RATES_REFERENCE.superReduced.examples.map((example, index) => (
                    <span key={index} className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Exempt */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-amber-50">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-12 h-12 bg-amber-600 text-white text-lg font-bold rounded-lg">
                    %{VAT_RATES_REFERENCE.exempt.rate}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{VAT_RATES_REFERENCE.exempt.description}</h3>
                    <p className="text-sm text-slate-500">İhracat ve uluslararası işlemler</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm font-medium text-slate-700 mb-3">Uygulama Alanları:</p>
                <div className="flex flex-wrap gap-2">
                  {VAT_RATES_REFERENCE.exempt.examples.map((example, index) => (
                    <span key={index} className="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm rounded-lg">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <ClockIcon className="w-6 h-6 text-slate-600" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">KDV Oran Değişiklik Geçmişi</h3>
                  <p className="text-sm text-slate-500">Türkiye KDV oranlarının tarihsel değişimi</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Değişiklik</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Önceki Oran</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Yeni Oran</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Dayanak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900">01.07.2023</td>
                    <td className="px-6 py-4 text-sm text-slate-600">Genel KDV Oranı Artışı</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-700 text-sm rounded">%18</span></td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-800 text-white text-sm rounded">%20</span></td>
                    <td className="px-6 py-4 text-sm text-slate-500">7346 Sayılı Cumhurbaşkanlığı Kararı</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900">01.07.2023</td>
                    <td className="px-6 py-4 text-sm text-slate-600">İndirimli Oran Artışı</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-700 text-sm rounded">%8</span></td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-600 text-white text-sm rounded">%10</span></td>
                    <td className="px-6 py-4 text-sm text-slate-500">7346 Sayılı Cumhurbaşkanlığı Kararı</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900">01.01.2019</td>
                    <td className="px-6 py-4 text-sm text-slate-600">Temel Gıda İndirimi</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-700 text-sm rounded">%8</span></td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-600 text-white text-sm rounded">%1</span></td>
                    <td className="px-6 py-4 text-sm text-slate-500">535 Sayılı Cumhurbaşkanlığı Kararı</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900">01.01.2008</td>
                    <td className="px-6 py-4 text-sm text-slate-600">Genel Oran Değişikliği</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-700 text-sm rounded">%18</span></td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-800 text-white text-sm rounded">%18</span></td>
                    <td className="px-6 py-4 text-sm text-slate-500">2007/13033 Sayılı BKK</td>
                  </tr>
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
                <h3 className="text-lg font-semibold text-slate-900">Yeni KDV Oranı</h3>
                <button onClick={() => setAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Oran Adı</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Genel KDV"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Oran (%)</label>
                    <input
                      type="number"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                      placeholder="0"
                      min="0"
                      max="100"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
                    >
                      <option value="standard">Standart</option>
                      <option value="reduced">İndirimli</option>
                      <option value="superReduced">Süper İndirimli</option>
                      <option value="exempt">İstisna</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    placeholder="Oran için açıklama..."
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Geçerlilik Bitişi</label>
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
                  onClick={handleAddRate}
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
      {editModalOpen && selectedRate && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setEditModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">KDV Oranını Düzenle</h3>
                <button onClick={() => setEditModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Oran Adı</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Oran (%)</label>
                    <input
                      type="number"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white"
                    >
                      <option value="standard">Standart</option>
                      <option value="reduced">İndirimli</option>
                      <option value="superReduced">Süper İndirimli</option>
                      <option value="exempt">İstisna</option>
                    </select>
                  </div>
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
                  onClick={handleEditRate}
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
      {deleteModalOpen && selectedRate && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDeleteModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">KDV Oranını Sil</h3>
                <p className="text-sm text-slate-500 text-center">
                  "{selectedRate.name} (%{selectedRate.rate})" oranını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
                  onClick={handleDeleteRate}
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
