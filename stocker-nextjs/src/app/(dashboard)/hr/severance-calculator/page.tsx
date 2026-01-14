'use client';

/**
 * Kıdem ve İhbar Tazminatı Hesaplama (Severance Calculator) Page
 * Türkiye mevzuatına uygun tazminat hesaplama
 * 4857 sayılı İş Kanunu ve 1475 sayılı kanun 14. madde
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useMemo } from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Card, Button, Divider, Alert, Table, Tabs, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CalculatorIcon,
  UserIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Types
type TerminationType =
  | 'resignation' // İstifa
  | 'dismissal_justified' // Haklı nedenle fesih (işveren)
  | 'dismissal_unjustified' // Haksız fesih
  | 'retirement' // Emeklilik
  | 'military' // Askerlik
  | 'death' // Vefat
  | 'marriage_female' // Kadın işçi evlilik
  | 'mutual_agreement' // İkale
  | 'contract_end' // Belirli süreli iş sözleşmesi bitimi
  | 'workplace_closure'; // İşyeri kapanması

interface TerminationInfo {
  label: string;
  description: string;
  severanceEligible: boolean;
  noticeEligible: boolean;
  noticePeriodByEmployer: boolean;
}

interface CalculationResult {
  grossSeverance: number;
  severanceTax: number;
  netSeverance: number;
  grossNotice: number;
  noticeTax: number;
  netNotice: number;
  totalGross: number;
  totalTax: number;
  totalNet: number;
  workYears: number;
  workMonths: number;
  workDays: number;
  noticePeriodDays: number;
  dailyWage: number;
  severanceCeiling: number;
  isAboveCeiling: boolean;
}

interface SeveranceCeilingHistory {
  period: string;
  startDate: string;
  endDate: string;
  ceiling: number;
}

// Termination type configurations
const terminationTypes: Record<TerminationType, TerminationInfo> = {
  resignation: {
    label: 'İstifa',
    description: 'İşçinin kendi isteğiyle işten ayrılması',
    severanceEligible: false,
    noticeEligible: false,
    noticePeriodByEmployer: false,
  },
  dismissal_justified: {
    label: 'Haklı Nedenle Fesih (İşveren)',
    description: 'İşverenin haklı nedenle (ahlak ve iyi niyet kurallarına uymayan davranışlar) iş akdini feshetmesi',
    severanceEligible: false,
    noticeEligible: false,
    noticePeriodByEmployer: false,
  },
  dismissal_unjustified: {
    label: 'Haksız/Geçersiz Fesih',
    description: 'İşverenin geçerli bir neden olmaksızın iş akdini feshetmesi',
    severanceEligible: true,
    noticeEligible: true,
    noticePeriodByEmployer: true,
  },
  retirement: {
    label: 'Emeklilik',
    description: 'Yaşlılık aylığı almak için işten ayrılma',
    severanceEligible: true,
    noticeEligible: false,
    noticePeriodByEmployer: false,
  },
  military: {
    label: 'Askerlik',
    description: 'Muvazzaf askerlik hizmeti nedeniyle işten ayrılma',
    severanceEligible: true,
    noticeEligible: false,
    noticePeriodByEmployer: false,
  },
  death: {
    label: 'Vefat',
    description: 'İşçinin vefatı halinde hak sahiplerine ödeme',
    severanceEligible: true,
    noticeEligible: false,
    noticePeriodByEmployer: false,
  },
  marriage_female: {
    label: 'Kadın İşçi Evlilik',
    description: 'Kadın işçinin evlilik tarihinden itibaren 1 yıl içinde ayrılması',
    severanceEligible: true,
    noticeEligible: false,
    noticePeriodByEmployer: false,
  },
  mutual_agreement: {
    label: 'İkale (Karşılıklı Anlaşma)',
    description: 'İşçi ve işverenin karşılıklı anlaşarak iş ilişkisini sonlandırması',
    severanceEligible: true,
    noticeEligible: true,
    noticePeriodByEmployer: false,
  },
  contract_end: {
    label: 'Belirli Süreli Sözleşme Bitimi',
    description: 'Belirli süreli iş sözleşmesinin süresinin dolması',
    severanceEligible: false,
    noticeEligible: false,
    noticePeriodByEmployer: false,
  },
  workplace_closure: {
    label: 'İşyeri Kapanması',
    description: 'İşyerinin kapanması veya faaliyetinin durması',
    severanceEligible: true,
    noticeEligible: true,
    noticePeriodByEmployer: true,
  },
};

// 2025 Kıdem tazminatı tavan değerleri (örnek)
const severanceCeilingHistory: SeveranceCeilingHistory[] = [
  { period: '2025/1', startDate: '2025-01-01', endDate: '2025-06-30', ceiling: 41828.42 },
  { period: '2024/2', startDate: '2024-07-01', endDate: '2024-12-31', ceiling: 35058.58 },
  { period: '2024/1', startDate: '2024-01-01', endDate: '2024-06-30', ceiling: 28761.90 },
  { period: '2023/2', startDate: '2023-07-01', endDate: '2023-12-31', ceiling: 23489.83 },
  { period: '2023/1', startDate: '2023-01-01', endDate: '2023-06-30', ceiling: 19982.83 },
];

// İhbar süreleri (4857 sayılı İş Kanunu madde 17)
const noticePeriods = [
  { minMonths: 0, maxMonths: 6, days: 14, weeks: 2, description: '6 aydan az' },
  { minMonths: 6, maxMonths: 18, days: 28, weeks: 4, description: '6 ay - 1.5 yıl' },
  { minMonths: 18, maxMonths: 36, days: 42, weeks: 6, description: '1.5 yıl - 3 yıl' },
  { minMonths: 36, maxMonths: Infinity, days: 56, weeks: 8, description: '3 yıldan fazla' },
];

// Current severance ceiling (2025/1)
const CURRENT_SEVERANCE_CEILING = 41828.42;

export default function SeveranceCalculatorPage() {
  const [form] = Form.useForm();
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [terminationType, setTerminationType] = useState<TerminationType>('dismissal_unjustified');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const currentTerminationInfo = terminationTypes[terminationType];

  // Calculate work duration
  const calculateWorkDuration = (startDate: Dayjs, endDate: Dayjs) => {
    const years = endDate.diff(startDate, 'year');
    const months = endDate.diff(startDate.add(years, 'year'), 'month');
    const days = endDate.diff(startDate.add(years, 'year').add(months, 'month'), 'day');
    const totalMonths = endDate.diff(startDate, 'month');

    return { years, months, days, totalMonths };
  };

  // Get notice period based on work duration
  const getNoticePeriod = (totalMonths: number) => {
    const period = noticePeriods.find(
      (p) => totalMonths >= p.minMonths && totalMonths < p.maxMonths
    );
    return period || noticePeriods[noticePeriods.length - 1];
  };

  // Handle form submission
  const handleCalculate = (values: {
    startDate: Dayjs;
    endDate: Dayjs;
    grossSalary: number;
    bonusAmount: number;
    foodAllowance: number;
    transportAllowance: number;
    otherBenefits: number;
  }) => {
    const { startDate, endDate, grossSalary, bonusAmount = 0, foodAllowance = 0, transportAllowance = 0, otherBenefits = 0 } = values;

    // Calculate work duration
    const duration = calculateWorkDuration(startDate, endDate);
    const totalDays = endDate.diff(startDate, 'day');

    // Calculate daily wage (includes all benefits)
    const monthlyWage = grossSalary + (bonusAmount / 12) + foodAllowance + transportAllowance + otherBenefits;
    const dailyWage = monthlyWage / 30;

    // Apply severance ceiling if above
    const effectiveDailyWage = Math.min(dailyWage, CURRENT_SEVERANCE_CEILING / 30);
    const isAboveCeiling = dailyWage > CURRENT_SEVERANCE_CEILING / 30;

    // Calculate severance pay (kıdem tazminatı)
    let grossSeverance = 0;
    let severanceTax = 0;
    let netSeverance = 0;

    if (currentTerminationInfo.severanceEligible && duration.totalMonths >= 12) {
      // One month's salary for each year of service
      const totalYearsDecimal = totalDays / 365;
      grossSeverance = effectiveDailyWage * 30 * totalYearsDecimal;

      // Kıdem tazminatı gelir vergisinden muaftır, sadece damga vergisi kesilir
      severanceTax = grossSeverance * 0.00759; // Damga vergisi %0.759
      netSeverance = grossSeverance - severanceTax;
    }

    // Calculate notice pay (ihbar tazminatı)
    let grossNotice = 0;
    let noticeTax = 0;
    let netNotice = 0;
    let noticePeriodDays = 0;

    if (currentTerminationInfo.noticeEligible) {
      const noticePeriod = getNoticePeriod(duration.totalMonths);
      noticePeriodDays = noticePeriod.days;
      grossNotice = dailyWage * noticePeriodDays;

      // İhbar tazminatı gelir vergisi ve damga vergisine tabidir
      // Kümülatif vergi matrahına göre hesaplama (basitleştirilmiş)
      const incomeTaxRate = 0.15; // Basitleştirilmiş oran
      const stampTaxRate = 0.00759;
      noticeTax = grossNotice * (incomeTaxRate + stampTaxRate);
      netNotice = grossNotice - noticeTax;
    }

    // Total calculations
    const totalGross = grossSeverance + grossNotice;
    const totalTax = severanceTax + noticeTax;
    const totalNet = netSeverance + netNotice;

    setCalculationResult({
      grossSeverance,
      severanceTax,
      netSeverance,
      grossNotice,
      noticeTax,
      netNotice,
      totalGross,
      totalTax,
      totalNet,
      workYears: duration.years,
      workMonths: duration.months,
      workDays: duration.days,
      noticePeriodDays,
      dailyWage,
      severanceCeiling: CURRENT_SEVERANCE_CEILING,
      isAboveCeiling,
    });
  };

  const noticePeriodColumns: ColumnsType<typeof noticePeriods[0]> = [
    {
      title: 'Kıdem Süresi',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'İhbar Süresi',
      key: 'period',
      render: (_, record) => `${record.weeks} hafta (${record.days} gün)`,
    },
  ];

  const ceilingColumns: ColumnsType<SeveranceCeilingHistory> = [
    {
      title: 'Dönem',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (value) => dayjs(value).format('DD.MM.YYYY'),
    },
    {
      title: 'Bitiş',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (value) => dayjs(value).format('DD.MM.YYYY'),
    },
    {
      title: 'Tavan Tutar',
      dataIndex: 'ceiling',
      key: 'ceiling',
      align: 'right',
      render: (value) => formatCurrency(value),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <CalculatorIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Kıdem ve İhbar Tazminatı Hesaplama</h1>
          <p className="text-sm text-slate-500">4857 sayılı İş Kanunu ve 1475 sayılı kanun 14. madde kapsamında</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Termination Type Selection */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <DocumentTextIcon className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Fesih Türü</h3>
            </div>

            <Select
              value={terminationType}
              onChange={(value) => setTerminationType(value)}
              className="w-full mb-4"
              size="large"
              options={Object.entries(terminationTypes).map(([key, value]) => ({
                value: key,
                label: value.label,
              }))}
            />

            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-3">{currentTerminationInfo.description}</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  {currentTerminationInfo.severanceEligible ? (
                    <CheckCircleIcon className="w-5 h-5 text-slate-700" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-slate-400" />
                  )}
                  <span className="text-sm">
                    Kıdem Tazminatı: {currentTerminationInfo.severanceEligible ? 'Hak edilir' : 'Hak edilmez'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {currentTerminationInfo.noticeEligible ? (
                    <CheckCircleIcon className="w-5 h-5 text-slate-700" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-slate-400" />
                  )}
                  <span className="text-sm">
                    İhbar Tazminatı: {currentTerminationInfo.noticeEligible ? 'Hak edilir' : 'Hak edilmez'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Çalışan Bilgileri</h3>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleCalculate}
              initialValues={{
                bonusAmount: 0,
                foodAllowance: 0,
                transportAllowance: 0,
                otherBenefits: 0,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="startDate"
                  label="İşe Giriş Tarihi"
                  rules={[{ required: true, message: 'Lütfen işe giriş tarihini seçin' }]}
                >
                  <DatePicker
                    className="w-full"
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                  />
                </Form.Item>
                <Form.Item
                  name="endDate"
                  label="İşten Çıkış Tarihi"
                  rules={[{ required: true, message: 'Lütfen işten çıkış tarihini seçin' }]}
                >
                  <DatePicker
                    className="w-full"
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                  />
                </Form.Item>
              </div>

              <Divider className="my-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="grossSalary"
                  label={
                    <span className="flex items-center gap-1">
                      Brüt Maaş (Aylık)
                      <Tooltip title="Son brüt maaş tutarı">
                        <InformationCircleIcon className="w-4 h-4 text-slate-400" />
                      </Tooltip>
                    </span>
                  }
                  rules={[{ required: true, message: 'Lütfen brüt maaşı girin' }]}
                >
                  <InputNumber<number>
                    className="w-full"
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/₺\s?|(,*)/g, '') || 0)}
                    min={0}
                    placeholder="0"
                  />
                </Form.Item>
                <Form.Item
                  name="bonusAmount"
                  label={
                    <span className="flex items-center gap-1">
                      Yıllık İkramiye
                      <Tooltip title="Düzenli olarak ödenen yıllık ikramiye toplamı (giydirilmiş ücrete dahil edilir)">
                        <InformationCircleIcon className="w-4 h-4 text-slate-400" />
                      </Tooltip>
                    </span>
                  }
                >
                  <InputNumber<number>
                    className="w-full"
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/₺\s?|(,*)/g, '') || 0)}
                    min={0}
                    placeholder="0"
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="foodAllowance"
                  label="Yemek Yardımı (Aylık)"
                >
                  <InputNumber<number>
                    className="w-full"
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/₺\s?|(,*)/g, '') || 0)}
                    min={0}
                    placeholder="0"
                  />
                </Form.Item>
                <Form.Item
                  name="transportAllowance"
                  label="Yol Yardımı (Aylık)"
                >
                  <InputNumber<number>
                    className="w-full"
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/₺\s?|(,*)/g, '') || 0)}
                    min={0}
                    placeholder="0"
                  />
                </Form.Item>
                <Form.Item
                  name="otherBenefits"
                  label="Diğer Yan Haklar (Aylık)"
                >
                  <InputNumber<number>
                    className="w-full"
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/₺\s?|(,*)/g, '') || 0)}
                    min={0}
                    placeholder="0"
                  />
                </Form.Item>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => form.resetFields()}>
                  Temizle
                </Button>
                <Button type="primary" htmlType="submit" className="bg-slate-900">
                  Hesapla
                </Button>
              </div>
            </Form>
          </div>

          {/* Calculation Results */}
          {calculationResult && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <BanknotesIcon className="w-4 h-4 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Hesaplama Sonucu</h3>
                </div>
                <div className="flex gap-2">
                  <Button icon={<PrinterIcon className="w-4 h-4" />}>
                    Yazdır
                  </Button>
                  <Button icon={<ArrowDownTrayIcon className="w-4 h-4" />}>
                    PDF İndir
                  </Button>
                </div>
              </div>

              {/* Work Duration */}
              <div className="p-4 bg-slate-50 rounded-lg mb-6">
                <div className="text-sm text-slate-500 mb-1">Toplam Kıdem Süresi</div>
                <div className="text-xl font-semibold text-slate-900">
                  {calculationResult.workYears} yıl, {calculationResult.workMonths} ay, {calculationResult.workDays} gün
                </div>
              </div>

              {/* Ceiling Warning */}
              {calculationResult.isAboveCeiling && (
                <Alert
                  type="warning"
                  showIcon
                  message="Tavan Uygulaması"
                  description={`Hesaplanan giydirilmiş brüt ücret (${formatCurrency(calculationResult.dailyWage * 30)}) kıdem tazminatı tavanını (${formatCurrency(calculationResult.severanceCeiling)}) aştığı için tavan üzerinden hesaplama yapılmıştır.`}
                  className="mb-6"
                />
              )}

              {/* Severance Pay */}
              <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <span className="font-medium text-slate-700">Kıdem Tazminatı</span>
                </div>
                <div className="p-4">
                  {calculationResult.grossSeverance > 0 ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Brüt Tutar</span>
                        <span className="text-sm font-medium">{formatCurrency(calculationResult.grossSeverance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Damga Vergisi (%0.759)</span>
                        <span className="text-sm font-medium text-slate-600">-{formatCurrency(calculationResult.severanceTax)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-100">
                        <span className="text-sm font-semibold text-slate-900">Net Tutar</span>
                        <span className="text-sm font-semibold text-slate-900">{formatCurrency(calculationResult.netSeverance)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 text-center py-4">
                      Bu fesih türünde kıdem tazminatı hak edilmez veya kıdem süresi 1 yılın altındadır.
                    </div>
                  )}
                </div>
              </div>

              {/* Notice Pay */}
              <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <span className="font-medium text-slate-700">İhbar Tazminatı</span>
                </div>
                <div className="p-4">
                  {calculationResult.grossNotice > 0 ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>İhbar Süresi: {calculationResult.noticePeriodDays} gün</span>
                        <span>Günlük Ücret: {formatCurrency(calculationResult.dailyWage)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Brüt Tutar</span>
                        <span className="text-sm font-medium">{formatCurrency(calculationResult.grossNotice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Vergi Kesintileri</span>
                        <span className="text-sm font-medium text-slate-600">-{formatCurrency(calculationResult.noticeTax)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-100">
                        <span className="text-sm font-semibold text-slate-900">Net Tutar</span>
                        <span className="text-sm font-semibold text-slate-900">{formatCurrency(calculationResult.netNotice)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 text-center py-4">
                      Bu fesih türünde ihbar tazminatı hak edilmez.
                    </div>
                  )}
                </div>
              </div>

              {/* Grand Total */}
              <div className="bg-slate-900 text-white rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Toplam Brüt</div>
                    <div className="text-lg font-semibold">{formatCurrency(calculationResult.totalGross)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Toplam Kesinti</div>
                    <div className="text-lg font-semibold text-slate-400">-{formatCurrency(calculationResult.totalTax)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Net Ödeme</div>
                    <div className="text-xl font-bold text-white">{formatCurrency(calculationResult.totalNet)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reference Information */}
        <div className="space-y-6">
          {/* Current Ceiling */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <BanknotesIcon className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Güncel Tavan</h3>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-2">
              {formatCurrency(CURRENT_SEVERANCE_CEILING)}
            </div>
            <div className="text-xs text-slate-500">
              2025/1 Dönemi (01.01.2025 - 30.06.2025)
            </div>
          </div>

          {/* Reference Tables */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <Tabs
              defaultActiveKey="notice"
              size="small"
              items={[
                {
                  key: 'notice',
                  label: 'İhbar Süreleri',
                  children: (
                    <Table
                      columns={noticePeriodColumns}
                      dataSource={noticePeriods}
                      rowKey="description"
                      pagination={false}
                      size="small"
                      className="text-xs"
                    />
                  ),
                },
                {
                  key: 'ceiling',
                  label: 'Tavan Geçmişi',
                  children: (
                    <Table
                      columns={ceilingColumns}
                      dataSource={severanceCeilingHistory}
                      rowKey="period"
                      pagination={false}
                      size="small"
                      className="text-xs"
                    />
                  ),
                },
              ]}
            />
          </div>

          {/* Legal Information */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="w-5 h-5 text-slate-500 mt-0.5" />
              <div className="text-xs text-slate-700">
                <strong className="block mb-1">Yasal Bilgi</strong>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Kıdem tazminatı için en az 1 yıl çalışma şartı aranır</li>
                  <li>Kıdem tazminatı gelir vergisinden muaftır</li>
                  <li>İhbar tazminatı gelir vergisine tabidir</li>
                  <li>Tavan tutarı 6 ayda bir güncellenir</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-slate-100 border border-slate-300 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-slate-600 mt-0.5" />
              <div className="text-xs text-slate-700">
                <strong className="block mb-1">Uyarı</strong>
                Bu hesaplama aracı bilgilendirme amaçlıdır. Kesin hesaplamalar için bir mali müşavir veya avukata danışınız.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
