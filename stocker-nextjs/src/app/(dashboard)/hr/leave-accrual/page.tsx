'use client';

/**
 * Leave Accrual Calculator Page (İzin Hak Ediş Hesaplayıcı)
 * Turkish labor law compliant annual leave calculation
 * Based on 4857 sayılı İş Kanunu Madde 53, 54, 55, 56
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useMemo } from 'react';
import { Form, DatePicker, InputNumber, Select, Table, Button, Alert, Divider, Empty, Spin } from 'antd';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { ColumnsType } from 'antd/es/table';
import {
  CalendarDaysIcon,
  CalculatorIcon,
  ClockIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Types
interface LeaveAccrualInput {
  employeeId: number;
  startDate: Dayjs;
  calculationDate: Dayjs;
  birthDate?: Dayjs;
  isUnderground?: boolean; // Yeraltı işçisi
  isHandicapped?: boolean; // Engelli
  usedLeaveDays: number;
  carriedOverDays: number;
}

interface LeaveAccrualResult {
  totalServiceYears: number;
  totalServiceMonths: number;
  totalServiceDays: number;
  baseEntitlement: number;
  additionalEntitlement: number;
  totalEntitlement: number;
  usedDays: number;
  carriedOver: number;
  remainingDays: number;
  accrualRate: string;
  nextMilestone: string;
  daysUntilNextMilestone: number;
  isEligible: boolean;
  eligibilityDate: string;
  breakdown: LeaveBreakdown[];
}

interface LeaveBreakdown {
  year: number;
  period: string;
  entitlement: number;
  rate: string;
  notes: string;
}

// Turkish Labor Law Leave Entitlements (4857/53)
const LEAVE_ENTITLEMENTS = [
  { minYears: 1, maxYears: 5, days: 14, label: '1-5 yıl' },
  { minYears: 5, maxYears: 15, days: 20, label: '5-15 yıl' },
  { minYears: 15, maxYears: Infinity, days: 26, label: '15+ yıl' },
];

// Additional entitlements
const ADDITIONAL_ENTITLEMENTS = {
  underground: 4, // Yeraltı işçileri için +4 gün
  under18: 4, // 18 yaş altı çalışanlar için +4 gün (toplam 20 gün)
  over50: 4, // 50 yaş üstü için +4 gün (2023 değişiklik)
};

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

export default function LeaveAccrualPage() {
  const [form] = Form.useForm<LeaveAccrualInput>();
  const [result, setResult] = useState<LeaveAccrualResult | null>(null);

  // Fetch employees from backend
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();

  // Transform employees for Select options
  const employeeOptions = useMemo(() => {
    return employees.map((emp) => ({
      value: emp.id,
      label: emp.fullName,
      startDate: emp.hireDate,
    }));
  }, [employees]);

  const calculateLeaveAccrual = (values: LeaveAccrualInput): LeaveAccrualResult => {
    const startDate = values.startDate;
    const calcDate = values.calculationDate;
    const birthDate = values.birthDate;

    // Calculate service duration
    const totalDays = calcDate.diff(startDate, 'day');
    const totalMonths = calcDate.diff(startDate, 'month');
    const totalYears = calcDate.diff(startDate, 'year');

    // Check eligibility (minimum 1 year of service)
    const isEligible = totalYears >= 1;
    const eligibilityDate = startDate.add(1, 'year').format('DD.MM.YYYY');

    // Calculate base entitlement based on service years
    let baseEntitlement = 0;
    let accrualRate = '';

    for (const tier of LEAVE_ENTITLEMENTS) {
      if (totalYears >= tier.minYears && totalYears < tier.maxYears) {
        baseEntitlement = tier.days;
        accrualRate = `${tier.days} gün/yıl (${tier.label})`;
        break;
      }
    }

    // Calculate additional entitlements
    let additionalEntitlement = 0;
    const additionalNotes: string[] = [];

    // Underground worker check
    if (values.isUnderground) {
      additionalEntitlement += ADDITIONAL_ENTITLEMENTS.underground;
      additionalNotes.push(`Yeraltı işçisi: +${ADDITIONAL_ENTITLEMENTS.underground} gün`);
    }

    // Age-based additional leave
    if (birthDate) {
      const age = calcDate.diff(birthDate, 'year');
      if (age < 18) {
        // Under 18: minimum 20 days
        if (baseEntitlement < 20) {
          const diff = 20 - baseEntitlement;
          additionalEntitlement += diff;
          additionalNotes.push(`18 yaş altı: +${diff} gün (minimum 20 gün)`);
        }
      } else if (age >= 50) {
        additionalEntitlement += ADDITIONAL_ENTITLEMENTS.over50;
        additionalNotes.push(`50 yaş üstü: +${ADDITIONAL_ENTITLEMENTS.over50} gün`);
      }
    }

    const totalEntitlement = baseEntitlement + additionalEntitlement;
    const remainingDays = values.carriedOverDays + totalEntitlement - values.usedLeaveDays;

    // Calculate next milestone
    let nextMilestone = '';
    let daysUntilNextMilestone = 0;

    if (totalYears < 1) {
      nextMilestone = 'İlk hak ediş (1 yıl)';
      daysUntilNextMilestone = startDate.add(1, 'year').diff(calcDate, 'day');
    } else if (totalYears < 5) {
      nextMilestone = '20 gün hak edişi (5 yıl)';
      daysUntilNextMilestone = startDate.add(5, 'year').diff(calcDate, 'day');
    } else if (totalYears < 15) {
      nextMilestone = '26 gün hak edişi (15 yıl)';
      daysUntilNextMilestone = startDate.add(15, 'year').diff(calcDate, 'day');
    } else {
      nextMilestone = 'Maksimum hak edişe ulaşıldı';
      daysUntilNextMilestone = 0;
    }

    // Generate yearly breakdown
    const breakdown: LeaveBreakdown[] = [];
    const yearsToShow = Math.min(totalYears + 1, 20);

    for (let i = 1; i <= yearsToShow; i++) {
      let yearEntitlement = 0;
      let rate = '';
      let notes = '';

      if (i < 1) {
        yearEntitlement = 0;
        rate = '-';
        notes = 'Henüz hak kazanılmadı';
      } else if (i >= 1 && i < 5) {
        yearEntitlement = 14;
        rate = '14 gün';
        notes = '1-5 yıl arası';
      } else if (i >= 5 && i < 15) {
        yearEntitlement = 20;
        rate = '20 gün';
        notes = '5-15 yıl arası';
      } else {
        yearEntitlement = 26;
        rate = '26 gün';
        notes = '15 yıl ve üzeri';
      }

      breakdown.push({
        year: i,
        period: `${i}. Yıl`,
        entitlement: yearEntitlement,
        rate,
        notes,
      });
    }

    return {
      totalServiceYears: totalYears,
      totalServiceMonths: totalMonths % 12,
      totalServiceDays: totalDays % 30,
      baseEntitlement,
      additionalEntitlement,
      totalEntitlement,
      usedDays: values.usedLeaveDays,
      carriedOver: values.carriedOverDays,
      remainingDays,
      accrualRate,
      nextMilestone,
      daysUntilNextMilestone,
      isEligible,
      eligibilityDate,
      breakdown,
    };
  };

  const handleCalculate = (values: LeaveAccrualInput) => {
    const calculatedResult = calculateLeaveAccrual(values);
    setResult(calculatedResult);
  };

  const breakdownColumns: ColumnsType<LeaveBreakdown> = [
    {
      title: 'Yıl',
      dataIndex: 'period',
      key: 'period',
      width: 100,
    },
    {
      title: 'İzin Hakkı',
      dataIndex: 'entitlement',
      key: 'entitlement',
      align: 'center',
      render: (days) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          days >= 20 ? 'bg-slate-900 text-white' : days > 0 ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-500'
        }`}>
          {days} gün
        </span>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => <span className="text-sm text-slate-600">{notes}</span>,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <CalendarDaysIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">İzin Hak Ediş Hesaplayıcı</h1>
          <p className="text-sm text-slate-500">4857 sayılı İş Kanunu&apos;na göre yıllık izin hesaplama</p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert
        message="Türkiye Yıllık İzin Hakları (4857 sayılı İş Kanunu Madde 53)"
        description={
          <div className="text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="bg-slate-100 rounded-lg p-3">
                <p className="font-semibold text-slate-700">1-5 Yıl Arası</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">14 Gün</p>
              </div>
              <div className="bg-slate-200 rounded-lg p-3">
                <p className="font-semibold text-slate-700">5-15 Yıl Arası</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">20 Gün</p>
              </div>
              <div className="bg-slate-300 rounded-lg p-3">
                <p className="font-semibold text-slate-800">15 Yıl ve Üzeri</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">26 Gün</p>
              </div>
            </div>
            <p className="mt-3 text-slate-600">
              <strong className="text-slate-700">Not:</strong> 18 yaşından küçük ve 50 yaşından büyük işçilere en az 20 gün yıllık ücretli izin verilir.
              Yeraltı işlerinde çalışanlara 4 gün ek izin hakkı tanınır.
            </p>
          </div>
        }
        type="info"
        showIcon
        icon={<InformationCircleIcon className="w-5 h-5 text-slate-500" />}
        className="mb-8 !border-slate-300 !bg-slate-50 [&_.ant-alert-message]:!text-slate-700"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <CalculatorIcon className="w-4 h-4 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Hesaplama Formu</h3>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleCalculate}
            initialValues={{
              calculationDate: dayjs(),
              usedLeaveDays: 0,
              carriedOverDays: 0,
              isUnderground: false,
              isHandicapped: false,
            }}
          >
            <Form.Item
              name="employeeId"
              label="Çalışan"
              rules={[{ required: true, message: 'Çalışan seçiniz' }]}
            >
              <Select
                showSearch
                placeholder="Çalışan seçiniz"
                optionFilterProp="label"
                loading={employeesLoading}
                options={employeeOptions}
                onChange={(value) => {
                  // Auto-fill dates when employee is selected
                  const selected = employeeOptions.find((e) => e.value === value);
                  if (selected) {
                    if (selected.startDate) {
                      form.setFieldValue('startDate', dayjs(selected.startDate));
                    }
                  }
                }}
                notFoundContent={employeesLoading ? <Spin size="small" /> : 'Çalışan bulunamadı'}
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="startDate"
                label="İşe Başlama Tarihi"
                rules={[{ required: true, message: 'İşe başlama tarihi seçiniz' }]}
              >
                <DatePicker
                  className="w-full"
                  format="DD.MM.YYYY"
                  placeholder="Tarih seçiniz"
                />
              </Form.Item>

              <Form.Item
                name="calculationDate"
                label="Hesaplama Tarihi"
                rules={[{ required: true, message: 'Hesaplama tarihi seçiniz' }]}
              >
                <DatePicker
                  className="w-full"
                  format="DD.MM.YYYY"
                  placeholder="Tarih seçiniz"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="birthDate"
              label="Doğum Tarihi"
              tooltip="18 yaş altı veya 50 yaş üstü çalışanlar için ek izin hakkı"
            >
              <DatePicker
                className="w-full"
                format="DD.MM.YYYY"
                placeholder="Tarih seçiniz (isteğe bağlı)"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="usedLeaveDays"
                label="Kullanılan İzin (Gün)"
                rules={[{ required: true, message: 'Kullanılan izin giriniz' }]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  placeholder="0"
                />
              </Form.Item>

              <Form.Item
                name="carriedOverDays"
                label="Devreden İzin (Gün)"
                tooltip="Önceki yıldan devreden izin günleri"
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  placeholder="0"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="isUnderground"
                label="Yeraltı İşçisi"
                valuePropName="checked"
              >
                <Select
                  options={[
                    { value: false, label: 'Hayır' },
                    { value: true, label: 'Evet (+4 gün ek izin)' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="isHandicapped"
                label="Engelli Çalışan"
                valuePropName="checked"
              >
                <Select
                  options={[
                    { value: false, label: 'Hayır' },
                    { value: true, label: 'Evet' },
                  ]}
                />
              </Form.Item>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              icon={<CalculatorIcon className="w-4 h-4" />}
              className="w-full bg-slate-900 hover:bg-slate-800 border-slate-900"
              size="large"
            >
              Hesapla
            </Button>
          </Form>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Summary Card */}
              <div className={`rounded-xl p-6 ${result.isEligible ? 'bg-white border border-slate-200' : 'bg-slate-100 border border-slate-300'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${result.isEligible ? 'bg-slate-100' : 'bg-slate-200'} flex items-center justify-center`}>
                    {result.isEligible ? (
                      <CheckCircleIcon className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ExclamationTriangleIcon className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {result.isEligible ? 'İzin Hak Ediş Sonucu' : 'Henüz Hak Kazanılmadı'}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Kıdem: {result.totalServiceYears} yıl {result.totalServiceMonths} ay
                    </p>
                  </div>
                  {result.isEligible && (
                    <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-white">
                      Hak Kazanıldı
                    </span>
                  )}
                </div>

                {result.isEligible ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Yıllık Hak</p>
                      <p className="text-2xl font-bold text-slate-900">{result.totalEntitlement}</p>
                      <p className="text-xs text-slate-500">gün</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Devreden</p>
                      <p className="text-2xl font-bold text-slate-900">{result.carriedOver}</p>
                      <p className="text-xs text-slate-500">gün</p>
                    </div>
                    <div className="bg-slate-100 rounded-lg p-3">
                      <p className="text-xs text-slate-600 uppercase tracking-wider">Kullanılan</p>
                      <p className="text-2xl font-bold text-slate-700">{result.usedDays}</p>
                      <p className="text-xs text-slate-600">gün</p>
                    </div>
                    <div className="bg-slate-200 rounded-lg p-3">
                      <p className="text-xs text-slate-700 uppercase tracking-wider">Kalan</p>
                      <p className="text-2xl font-bold text-slate-900">{result.remainingDays}</p>
                      <p className="text-xs text-slate-700">gün</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-slate-700">
                      Yıllık ücretli izin hakkı kazanmak için en az <strong>1 yıl</strong> çalışmış olmak gerekir.
                    </p>
                    <p className="text-sm text-slate-600 mt-2">
                      İlk izin hak ediş tarihi: <strong className="text-slate-900">{result.eligibilityDate}</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Entitlement Details */}
              {result.isEligible && (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <DocumentTextIcon className="w-4 h-4 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Hak Ediş Detayları</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Temel İzin Hakkı</span>
                      <span className="text-sm font-semibold text-slate-900">{result.baseEntitlement} gün</span>
                    </div>
                    {result.additionalEntitlement > 0 && (
                      <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg">
                        <span className="text-sm text-slate-700">Ek İzin Hakkı</span>
                        <span className="text-sm font-semibold text-slate-900">+{result.additionalEntitlement} gün</span>
                      </div>
                    )}
                    <Divider className="my-2" />
                    <div className="flex justify-between items-center p-3 bg-slate-200 rounded-lg">
                      <span className="text-sm text-slate-700 font-medium">Toplam Yıllık İzin</span>
                      <span className="text-lg font-bold text-slate-900">{result.totalEntitlement} gün</span>
                    </div>
                  </div>

                  {/* Next Milestone */}
                  {result.daysUntilNextMilestone > 0 && (
                    <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-700">
                          <strong>{result.nextMilestone}</strong>: {result.daysUntilNextMilestone} gün kaldı
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Yearly Breakdown */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <ChartBarIcon className="w-4 h-4 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Yıllık Hak Ediş Tablosu</h3>
                </div>

                <Table
                  columns={breakdownColumns}
                  dataSource={result.breakdown}
                  rowKey="year"
                  pagination={false}
                  size="small"
                  className={tableClassName}
                  rowClassName={(record) =>
                    record.year === result.totalServiceYears + 1 ? 'bg-blue-50' : ''
                  }
                />
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-slate-500">Hesaplama sonuçları burada görünecek</span>
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Legal Reference */}
      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Yasal Dayanak</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600">
          <div>
            <h4 className="font-medium text-slate-700 mb-2">4857 sayılı İş Kanunu</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Madde 53:</strong> Yıllık ücretli izin hakkı ve izin süreleri</li>
              <li><strong>Madde 54:</strong> Yıllık ücretli izne hak kazanma ve hesaplanması</li>
              <li><strong>Madde 55:</strong> Yıllık izin bakımından çalışılmış gibi sayılan haller</li>
              <li><strong>Madde 56:</strong> Yıllık ücretli iznin uygulanması</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 mb-2">Önemli Notlar</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Yıllık izin hakkından vazgeçilemez</li>
              <li>İzin ücreti peşin ödenir</li>
              <li>İzin süresi bölünemez (işçi onayı hariç)</li>
              <li>Hafta tatili ve bayram günleri izne dahil değildir</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
