'use client';

/**
 * Leave Accrual Calculator Page (İzin Hak Ediş Hesaplayıcı)
 * Turkish labor law compliant annual leave calculation
 * Based on 4857 sayılı İş Kanunu Madde 53, 54, 55, 56
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useMemo } from 'react';
import { useEmployees } from '@/lib/api/hooks/useHR';
import {
  CalendarDaysIcon,
  CalculatorIcon,
  ClockIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Types
interface LeaveAccrualInput {
  employeeId: number | null;
  startDate: string;
  calculationDate: string;
  birthDate: string;
  isUnderground: boolean;
  isHandicapped: boolean;
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

export default function LeaveAccrualPage() {
  const [result, setResult] = useState<LeaveAccrualResult | null>(null);
  const [formData, setFormData] = useState<LeaveAccrualInput>({
    employeeId: null,
    startDate: '',
    calculationDate: dayjs().format('YYYY-MM-DD'),
    birthDate: '',
    isUnderground: false,
    isHandicapped: false,
    usedLeaveDays: 0,
    carriedOverDays: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');

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

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch) return employeeOptions;
    return employeeOptions.filter((emp) =>
      emp.label.toLowerCase().includes(employeeSearch.toLowerCase())
    );
  }, [employeeOptions, employeeSearch]);

  // Get selected employee name
  const selectedEmployeeName = useMemo(() => {
    const selected = employeeOptions.find((e) => e.value === formData.employeeId);
    return selected?.label || '';
  }, [employeeOptions, formData.employeeId]);

  const calculateLeaveAccrual = (values: LeaveAccrualInput): LeaveAccrualResult => {
    const startDate = dayjs(values.startDate);
    const calcDate = dayjs(values.calculationDate);
    const birthDate = values.birthDate ? dayjs(values.birthDate) : null;

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

    // Underground worker check
    if (values.isUnderground) {
      additionalEntitlement += ADDITIONAL_ENTITLEMENTS.underground;
    }

    // Age-based additional leave
    if (birthDate) {
      const age = calcDate.diff(birthDate, 'year');
      if (age < 18) {
        // Under 18: minimum 20 days
        if (baseEntitlement < 20) {
          const diff = 20 - baseEntitlement;
          additionalEntitlement += diff;
        }
      } else if (age >= 50) {
        additionalEntitlement += ADDITIONAL_ENTITLEMENTS.over50;
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Çalışan seçiniz';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'İşe başlama tarihi seçiniz';
    }
    if (!formData.calculationDate) {
      newErrors.calculationDate = 'Hesaplama tarihi seçiniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const calculatedResult = calculateLeaveAccrual(formData);
      setResult(calculatedResult);
    }
  };

  const handleEmployeeSelect = (employeeId: number) => {
    const selected = employeeOptions.find((e) => e.value === employeeId);
    setFormData((prev) => ({
      ...prev,
      employeeId,
      startDate: selected?.startDate ? dayjs(selected.startDate).format('YYYY-MM-DD') : prev.startDate,
    }));
    setIsEmployeeDropdownOpen(false);
    setEmployeeSearch('');
    setErrors((prev) => ({ ...prev, employeeId: '' }));
  };

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

      {/* Info Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-3 mb-4">
          <InformationCircleIcon className="w-5 h-5 text-slate-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-slate-700">Türkiye Yıllık İzin Hakları (4857 sayılı İş Kanunu Madde 53)</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-600">1-5 Yıl Arası</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">14 Gün</p>
          </div>
          <div className="bg-slate-100 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-600">5-15 Yıl Arası</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">20 Gün</p>
          </div>
          <div className="bg-slate-200 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-700">15 Yıl ve Üzeri</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">26 Gün</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          <strong className="text-slate-700">Not:</strong> 18 yaşından küçük ve 50 yaşından büyük işçilere en az 20 gün yıllık ücretli izin verilir.
          Yeraltı işlerinde çalışanlara 4 gün ek izin hakkı tanınır.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <CalculatorIcon className="w-4 h-4 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Hesaplama Formu</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Employee Select */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Çalışan <span className="text-slate-400">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-left transition-colors ${
                    errors.employeeId
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 hover:border-slate-400 focus:ring-slate-500 focus:border-slate-500'
                  }`}
                >
                  <span className={selectedEmployeeName ? 'text-slate-900' : 'text-slate-400'}>
                    {selectedEmployeeName || 'Çalışan seçiniz'}
                  </span>
                  <ChevronUpDownIcon className="w-5 h-5 text-slate-400" />
                </button>

                {isEmployeeDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 border-b border-slate-100">
                      <input
                        type="text"
                        placeholder="Ara..."
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                        autoFocus
                      />
                    </div>
                    {employeesLoading ? (
                      <div className="p-4 text-center text-sm text-slate-500">Yükleniyor...</div>
                    ) : filteredEmployees.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">Çalışan bulunamadı</div>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <button
                          key={emp.value}
                          type="button"
                          onClick={() => handleEmployeeSelect(emp.value)}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors ${
                            formData.employeeId === emp.value ? 'bg-slate-100 text-slate-900' : 'text-slate-700'
                          }`}
                        >
                          {emp.label}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {errors.employeeId && <p className="mt-1 text-sm text-red-500">{errors.employeeId}</p>}
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  İşe Başlama Tarihi <span className="text-slate-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, startDate: e.target.value }));
                    setErrors((prev) => ({ ...prev, startDate: '' }));
                  }}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-1 ${
                    errors.startDate
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-slate-500'
                  }`}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Hesaplama Tarihi <span className="text-slate-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.calculationDate}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, calculationDate: e.target.value }));
                    setErrors((prev) => ({ ...prev, calculationDate: '' }));
                  }}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-1 ${
                    errors.calculationDate
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-slate-500'
                  }`}
                />
                {errors.calculationDate && <p className="mt-1 text-sm text-red-500">{errors.calculationDate}</p>}
              </div>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Doğum Tarihi
                <span className="text-xs text-slate-400 ml-2">(18 yaş altı veya 50 yaş üstü için ek izin)</span>
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, birthDate: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            {/* Leave Days */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Kullanılan İzin (Gün)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.usedLeaveDays}
                  onChange={(e) => setFormData((prev) => ({ ...prev, usedLeaveDays: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Devreden İzin (Gün)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.carriedOverDays}
                  onChange={(e) => setFormData((prev) => ({ ...prev, carriedOverDays: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
            </div>

            {/* Special Conditions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Yeraltı İşçisi</label>
                <select
                  value={formData.isUnderground ? 'true' : 'false'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isUnderground: e.target.value === 'true' }))}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500"
                >
                  <option value="false">Hayır</option>
                  <option value="true">Evet (+4 gün ek izin)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Engelli Çalışan</label>
                <select
                  value={formData.isHandicapped ? 'true' : 'false'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isHandicapped: e.target.value === 'true' }))}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500"
                >
                  <option value="false">Hayır</option>
                  <option value="true">Evet</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              <CalculatorIcon className="w-5 h-5" />
              Hesapla
            </button>
          </form>
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
                    <div className="border-t border-slate-200 my-2" />
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

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">Yıl</th>
                        <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">İzin Hakkı</th>
                        <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">Kategori</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.breakdown.map((row) => (
                        <tr
                          key={row.year}
                          className={row.year === result.totalServiceYears + 1 ? 'bg-slate-50' : 'hover:bg-slate-50'}
                        >
                          <td className="py-3 px-4 text-sm text-slate-900">{row.period}</td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                row.entitlement >= 20
                                  ? 'bg-slate-900 text-white'
                                  : row.entitlement > 0
                                  ? 'bg-slate-200 text-slate-800'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {row.entitlement} gün
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">{row.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12">
              <div className="text-center">
                <CalendarDaysIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Hesaplama sonuçları burada görünecek</p>
              </div>
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
