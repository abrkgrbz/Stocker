'use client';

/**
 * Tax Rates Configuration Page (Vergi Oranları Yönetimi)
 * Turkish tax rates and brackets configuration
 * Based on Turkish Tax Law (193 sayılı Gelir Vergisi Kanunu)
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { Table, Modal, Tooltip, Alert, Tabs, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CalculatorIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ScaleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Types
interface TaxBracket {
  id: number;
  bracketNumber: number;
  minAmount: number;
  maxAmount: number;
  rate: number;
}

interface SgkRates {
  id: number;
  year: number;
  employeeInsurance: number;
  employeeUnemployment: number;
  employerInsurance: number;
  employerUnemployment: number;
  employerIncentiveDiscount: number;
  shortTermInsurance: number;
  isActive: boolean;
}

// Mock data - 2024 Turkish income tax brackets (GVK Mad. 103)
const mockTaxBrackets: { year: number; brackets: TaxBracket[]; isActive: boolean }[] = [
  {
    year: 2025,
    isActive: true,
    brackets: [
      { id: 1, bracketNumber: 1, minAmount: 0, maxAmount: 158000, rate: 15 },
      { id: 2, bracketNumber: 2, minAmount: 158000, maxAmount: 330000, rate: 20 },
      { id: 3, bracketNumber: 3, minAmount: 330000, maxAmount: 800000, rate: 27 },
      { id: 4, bracketNumber: 4, minAmount: 800000, maxAmount: 4000000, rate: 35 },
      { id: 5, bracketNumber: 5, minAmount: 4000000, maxAmount: Infinity, rate: 40 },
    ],
  },
  {
    year: 2024,
    isActive: false,
    brackets: [
      { id: 6, bracketNumber: 1, minAmount: 0, maxAmount: 110000, rate: 15 },
      { id: 7, bracketNumber: 2, minAmount: 110000, maxAmount: 230000, rate: 20 },
      { id: 8, bracketNumber: 3, minAmount: 230000, maxAmount: 580000, rate: 27 },
      { id: 9, bracketNumber: 4, minAmount: 580000, maxAmount: 3000000, rate: 35 },
      { id: 10, bracketNumber: 5, minAmount: 3000000, maxAmount: Infinity, rate: 40 },
    ],
  },
];

// Mock SGK rates
const mockSgkRates: SgkRates[] = [
  {
    id: 1,
    year: 2025,
    employeeInsurance: 14,
    employeeUnemployment: 1,
    employerInsurance: 20.5,
    employerUnemployment: 2,
    employerIncentiveDiscount: 5,
    shortTermInsurance: 2,
    isActive: true,
  },
  {
    id: 2,
    year: 2024,
    employeeInsurance: 14,
    employeeUnemployment: 1,
    employerInsurance: 20.5,
    employerUnemployment: 2,
    employerIncentiveDiscount: 5,
    shortTermInsurance: 2,
    isActive: false,
  },
];

// Other tax rates
const mockOtherRates = {
  stampTax: 0.759, // %0.759
  severanceTaxExemption: true, // Kıdem tazminatı vergiden muaf
  severanceCeiling2025: 41828.42, // 2025/1 kıdem tazminatı tavanı
};

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

export default function TaxRatesConfigPage() {
  const [taxBrackets, setTaxBrackets] = useState(mockTaxBrackets);
  const [sgkRates, setSgkRates] = useState(mockSgkRates);

  const formatCurrency = (amount: number) => {
    if (amount === Infinity) return '∞';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount);
  };

  // Get current active rates
  const activeTaxBrackets = taxBrackets.find(t => t.isActive);
  const activeSgkRates = sgkRates.find(s => s.isActive);

  // Tax Bracket Table Columns
  const taxBracketColumns: ColumnsType<TaxBracket> = [
    {
      title: 'Dilim',
      dataIndex: 'bracketNumber',
      key: 'bracketNumber',
      align: 'center',
      width: 80,
      render: (num) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-medium text-slate-700">
          {num}
        </span>
      ),
    },
    {
      title: 'Alt Limit',
      dataIndex: 'minAmount',
      key: 'minAmount',
      align: 'right',
      render: (amount) => (
        <span className="text-sm text-slate-600">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Üst Limit',
      dataIndex: 'maxAmount',
      key: 'maxAmount',
      align: 'right',
      render: (amount) => (
        <span className="text-sm text-slate-600">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Vergi Oranı',
      dataIndex: 'rate',
      key: 'rate',
      align: 'center',
      render: (rate) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          rate <= 15 ? 'bg-slate-100 text-slate-700' : rate <= 27 ? 'bg-slate-200 text-slate-800' : 'bg-slate-900 text-white'
        }`}>
          %{rate}
        </span>
      ),
    },
  ];

  // SGK Rates summary card
  const SgkRateCard = ({ rates, title }: { rates: SgkRates; title: string }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        {rates.isActive && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-white">
            Aktif
          </span>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">İşçi Kesintileri</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">Sigorta Primi</p>
              <p className="text-lg font-bold text-slate-900">%{rates.employeeInsurance}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">İşsizlik Sigortası</p>
              <p className="text-lg font-bold text-slate-900">%{rates.employeeUnemployment}</p>
            </div>
          </div>
          <div className="mt-2 p-2 bg-slate-100 rounded-lg">
            <p className="text-xs text-slate-700">
              <strong>Toplam İşçi:</strong> %{rates.employeeInsurance + rates.employeeUnemployment}
            </p>
          </div>
        </div>
        <Divider className="my-4" />
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">İşveren Kesintileri</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">Sigorta Primi</p>
              <p className="text-lg font-bold text-slate-900">%{rates.employerInsurance}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">İşsizlik Sigortası</p>
              <p className="text-lg font-bold text-slate-900">%{rates.employerUnemployment}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-slate-100 rounded-lg p-3">
              <p className="text-xs text-slate-600">5 Puan İndirimi (81/ı)</p>
              <p className="text-lg font-bold text-slate-700">-%{rates.employerIncentiveDiscount}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">Kısa Vadeli Sigorta</p>
              <p className="text-lg font-bold text-slate-900">%{rates.shortTermInsurance}</p>
            </div>
          </div>
          <div className="mt-2 p-2 bg-slate-100 rounded-lg">
            <p className="text-xs text-slate-700">
              <strong>Toplam İşveren:</strong> %{rates.employerInsurance + rates.employerUnemployment + rates.shortTermInsurance}
              <span className="text-slate-500 ml-2">(İndirimli: %{rates.employerInsurance + rates.employerUnemployment + rates.shortTermInsurance - rates.employerIncentiveDiscount})</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const handleActivateTaxBrackets = (year: number) => {
    Modal.confirm({
      title: 'Vergi Dilimlerini Aktifleştir',
      content: `${year} yılı vergi dilimlerini aktifleştirmek istediğinizden emin misiniz?`,
      okText: 'Aktifleştir',
      cancelText: 'İptal',
      onOk: () => {
        setTaxBrackets(taxBrackets.map(t => ({
          ...t,
          isActive: t.year === year,
        })));
      },
    });
  };

  const handleActivateSgkRates = (id: number) => {
    Modal.confirm({
      title: 'SGK Oranlarını Aktifleştir',
      content: 'Bu SGK oranlarını aktifleştirmek istediğinizden emin misiniz?',
      okText: 'Aktifleştir',
      cancelText: 'İptal',
      onOk: () => {
        setSgkRates(sgkRates.map(s => ({
          ...s,
          isActive: s.id === id,
        })));
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <CalculatorIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Vergi Oranları Yönetimi</h1>
          <p className="text-sm text-slate-500">Gelir vergisi dilimleri ve SGK prim oranları</p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert
        message="Türkiye Vergi Sistemi"
        description={
          <div className="text-sm text-slate-600">
            <p><strong className="text-slate-700">Gelir Vergisi:</strong> Kümülatif matrah üzerinden artan oranlı vergi (GVK Mad. 103)</p>
            <p className="mt-1"><strong className="text-slate-700">SGK Primleri:</strong> 5510 sayılı Kanun kapsamında işçi ve işveren payları</p>
            <p className="mt-1"><strong className="text-slate-700">Damga Vergisi:</strong> Brüt ücret üzerinden %0.759</p>
          </div>
        }
        type="info"
        showIcon
        icon={<InformationCircleIcon className="w-5 h-5 text-slate-500" />}
        className="mb-8 !border-slate-300 !bg-slate-50 [&_.ant-alert-message]:!text-slate-700"
      />

      <Tabs
        defaultActiveKey="income-tax"
        items={[
          {
            key: 'income-tax',
            label: (
              <span className="flex items-center gap-2">
                <ScaleIcon className="w-4 h-4" />
                Gelir Vergisi Dilimleri
              </span>
            ),
            children: (
              <div className="space-y-6">
                {/* Current Active Tax Brackets */}
                {activeTaxBrackets && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <CheckCircleIcon className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">Güncel Vergi Dilimleri</h3>
                          <p className="text-sm text-slate-500">{activeTaxBrackets.year} Yılı - GVK Madde 103</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-white">
                        Aktif
                      </span>
                    </div>
                    <Table
                      columns={taxBracketColumns}
                      dataSource={activeTaxBrackets.brackets}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      className={tableClassName}
                    />
                  </div>
                )}

                {/* Tax Brackets History */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <ChartBarIcon className="w-4 h-4 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Vergi Dilimi Geçmişi</h3>
                  </div>

                  <div className="space-y-6">
                    {taxBrackets.filter(t => !t.isActive).map((taxYear) => (
                      <div key={taxYear.year} className="border border-slate-100 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-slate-700">{taxYear.year} Yılı</h4>
                          <Tooltip title="Aktifleştir">
                            <button
                              onClick={() => handleActivateTaxBrackets(taxYear.year)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </div>
                        <Table
                          columns={taxBracketColumns}
                          dataSource={taxYear.brackets}
                          rowKey="id"
                          pagination={false}
                          size="small"
                          className={tableClassName}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: 'sgk-rates',
            label: (
              <span className="flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4" />
                SGK Prim Oranları
              </span>
            ),
            children: (
              <div className="space-y-6">
                {/* Current Active SGK Rates */}
                {activeSgkRates && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SgkRateCard rates={activeSgkRates} title={`${activeSgkRates.year} Yılı SGK Oranları`} />

                    {/* Quick Summary */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                      <h4 className="text-sm font-semibold text-slate-900 mb-4">Hızlı Özet</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-600">İşçi Toplam Kesinti</span>
                          <span className="text-lg font-bold text-slate-900">
                            %{activeSgkRates.employeeInsurance + activeSgkRates.employeeUnemployment}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-600">İşveren Toplam Kesinti</span>
                          <span className="text-lg font-bold text-slate-900">
                            %{activeSgkRates.employerInsurance + activeSgkRates.employerUnemployment + activeSgkRates.shortTermInsurance}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg">
                          <span className="text-sm text-slate-600">İşveren (5 Puan İndirimli)</span>
                          <span className="text-lg font-bold text-slate-700">
                            %{activeSgkRates.employerInsurance + activeSgkRates.employerUnemployment + activeSgkRates.shortTermInsurance - activeSgkRates.employerIncentiveDiscount}
                          </span>
                        </div>
                        <Divider className="my-2" />
                        <div className="flex justify-between items-center p-3 bg-slate-200 rounded-lg">
                          <span className="text-sm text-slate-700">Toplam Maliyet (İndirimli)</span>
                          <span className="text-lg font-bold text-slate-900">
                            %{activeSgkRates.employeeInsurance + activeSgkRates.employeeUnemployment + activeSgkRates.employerInsurance + activeSgkRates.employerUnemployment + activeSgkRates.shortTermInsurance - activeSgkRates.employerIncentiveDiscount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SGK Rates History */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <ChartBarIcon className="w-4 h-4 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">SGK Oran Geçmişi</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sgkRates.filter(s => !s.isActive).map((rate) => (
                      <div key={rate.id} className="border border-slate-100 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-slate-700">{rate.year} Yılı</h4>
                          <Tooltip title="Aktifleştir">
                            <button
                              onClick={() => handleActivateSgkRates(rate.id)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </div>
                        <div className="text-xs text-slate-500 space-y-1">
                          <p>İşçi: %{rate.employeeInsurance + rate.employeeUnemployment}</p>
                          <p>İşveren: %{rate.employerInsurance + rate.employerUnemployment + rate.shortTermInsurance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: 'other-rates',
            label: (
              <span className="flex items-center gap-2">
                <CurrencyDollarIcon className="w-4 h-4" />
                Diğer Oranlar
              </span>
            ),
            children: (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stamp Tax */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <DocumentTextIcon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Damga Vergisi</h3>
                      <p className="text-xs text-slate-500">Brüt ücret üzerinden</p>
                    </div>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-4xl font-bold text-slate-900">%{mockOtherRates.stampTax}</p>
                    <p className="text-sm text-slate-500 mt-2">488 sayılı Damga Vergisi Kanunu</p>
                  </div>
                </div>

                {/* Severance Ceiling */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <ScaleIcon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Kıdem Tazminatı Tavanı</h3>
                      <p className="text-xs text-slate-500">2025/1 Dönemi</p>
                    </div>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold text-slate-900">{formatCurrency(mockOtherRates.severanceCeiling2025)}</p>
                    <p className="text-sm text-slate-500 mt-2">1475 sayılı Kanun 14. Madde</p>
                  </div>
                </div>

                {/* Tax Exemptions */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Vergi İstisnaları</h3>
                      <p className="text-xs text-slate-500">Aktif muafiyetler</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <CheckCircleIcon className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-700">Kıdem Tazminatı Vergiden Muaf</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <CheckCircleIcon className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-700">Asgari Ücret İstisnası Aktif</span>
                    </div>
                  </div>
                </div>

                {/* Income Tax Calculation Info */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 md:col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <InformationCircleIcon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Gelir Vergisi Hesaplama Bilgisi</h3>
                      <p className="text-xs text-slate-500">Kümülatif matrah sistemi</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700">
                    <p><strong>Kümülatif Matrah:</strong> Yıl içinde elde edilen tüm kazançlar toplanarak vergi matrahı hesaplanır.</p>
                    <p className="mt-2"><strong>Artan Oranlı Vergi:</strong> Matrah arttıkça daha yüksek vergi dilimine geçilir.</p>
                    <p className="mt-2"><strong>Asgari Ücret İstisnası:</strong> Asgari ücret tutarı kadar gelir, gelir vergisinden istisnadır.</p>
                    <div className="mt-4 p-3 bg-slate-100 rounded-lg border border-slate-200">
                      <p className="text-slate-700">
                        <strong>Örnek:</strong> Aylık 50.000 TL brüt maaş alan bir çalışan için, yılın ilk aylarında %15 dilimde vergilendirilirken,
                        kümülatif matrah arttıkça daha yüksek dilimlere geçilir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
