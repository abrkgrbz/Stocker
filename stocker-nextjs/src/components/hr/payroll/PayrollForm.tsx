'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Form, Select, DatePicker, InputNumber, Input, Switch, Tooltip, Collapse, Tag } from 'antd';
import { CurrencyDollarIcon, CalculatorIcon, InformationCircleIcon, BoltIcon } from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { PayrollDto } from '@/lib/api/services/hr.types';
import {
  calculateTurkishPayroll,
  getPayrollBreakdown,
  formatCurrency,
  formatPercent,
  getPayrollParams,
  getTaxBracketInfo,
  type PayrollCalculation,
} from '@/lib/utils/turkish-payroll';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface PayrollFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: PayrollDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function PayrollForm({ form, initialValues, onFinish, loading }: PayrollFormProps) {
  const { data: employees = [] } = useEmployees();
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [calculation, setCalculation] = useState<PayrollCalculation | null>(null);

  // Watch form values for calculations
  const baseSalary = Form.useWatch('baseSalary', form) || 0;
  const overtimePay = Form.useWatch('overtimePay', form) || 0;
  const bonus = Form.useWatch('bonus', form) || 0;
  const allowances = Form.useWatch('allowances', form) || 0;
  const cumulativeGross = Form.useWatch('cumulativeGross', form) || 0;
  const applyMinWageExemption = Form.useWatch('applyMinWageExemption', form) ?? true;

  // Manual deduction values (when auto-calculate is off)
  const taxDeduction = Form.useWatch('taxDeduction', form) || 0;
  const socialSecurityDeduction = Form.useWatch('socialSecurityDeduction', form) || 0;
  const otherDeductions = Form.useWatch('otherDeductions', form) || 0;

  // Auto calculation with Turkish payroll logic
  const performCalculation = useCallback(() => {
    if (autoCalculate && baseSalary > 0) {
      const result = calculateTurkishPayroll({
        baseSalary,
        overtimePay,
        bonus,
        allowances,
        cumulativeGross,
        applyMinWageExemption,
      });
      setCalculation(result);

      // Update form fields with calculated values
      form.setFieldsValue({
        taxDeduction: Math.round(result.incomeTax * 100) / 100,
        socialSecurityDeduction: Math.round(result.totalSgkEmployee * 100) / 100,
        otherDeductions: Math.round(result.stampTax * 100) / 100,
      });
    } else {
      setCalculation(null);
    }
  }, [autoCalculate, baseSalary, overtimePay, bonus, allowances, cumulativeGross, applyMinWageExemption, form]);

  useEffect(() => {
    performCalculation();
  }, [performCalculation]);

  // Calculate totals (either from auto-calc or manual)
  const grossSalary = useMemo(
    () => baseSalary + overtimePay + bonus + allowances,
    [baseSalary, overtimePay, bonus, allowances]
  );

  const totalDeductions = useMemo(
    () => taxDeduction + socialSecurityDeduction + otherDeductions,
    [taxDeduction, socialSecurityDeduction, otherDeductions]
  );

  const netSalary = useMemo(
    () => grossSalary - totalDeductions,
    [grossSalary, totalDeductions]
  );

  // Tax bracket info for display
  const taxBracketInfo = useMemo(
    () => getTaxBracketInfo(cumulativeGross + grossSalary),
    [cumulativeGross, grossSalary]
  );

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        period: initialValues.month && initialValues.year
          ? dayjs().year(initialValues.year).month(initialValues.month - 1)
          : undefined,
      });
      // Disable auto-calculate for editing existing payroll
      setAutoCalculate(false);
    }
  }, [form, initialValues]);

  const params = getPayrollParams();

  const handleAutoCalculateChange = (checked: boolean) => {
    setAutoCalculate(checked);
    if (!checked) {
      setCalculation(null);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      initialValues={{
        baseSalary: 0,
        overtimePay: 0,
        bonus: 0,
        allowances: 0,
        taxDeduction: 0,
        socialSecurityDeduction: 0,
        otherDeductions: 0,
        cumulativeGross: 0,
        applyMinWageExemption: true,
      }}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Title + Auto Calculate Toggle
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Payroll Icon */}
            <div className="flex-shrink-0">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: autoCalculate
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                }}
              >
                {autoCalculate ? (
                  <BoltIcon className="w-7 h-7 text-white" />
                ) : (
                  <CurrencyDollarIcon className="w-7 h-7 text-white" />
                )}
              </div>
            </div>

            {/* Title */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {autoCalculate ? 'Otomatik Bordro Hesaplama' : 'Manuel Bordro Girişi'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {autoCalculate ? '2024 Türkiye Vergi Mevzuatı ile otomatik hesaplama' : 'Kesinti değerlerini manuel olarak girin'}
              </p>
            </div>

            {/* Auto Calculate Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <CalculatorIcon className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-600">
                  {autoCalculate ? 'Otomatik' : 'Manuel'}
                </span>
                <Switch
                  checked={autoCalculate}
                  onChange={handleAutoCalculateChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── TEMEL BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Çalışan <span className="text-red-500">*</span></label>
                <Form.Item
                  name="employeeId"
                  rules={[{ required: true, message: 'Çalışan seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Çalışan seçin"
                    showSearch
                    optionFilterProp="label"
                    disabled={!!initialValues}
                    options={employees.map((e) => ({
                      value: e.id,
                      label: e.fullName,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Dönem <span className="text-red-500">*</span></label>
                <Form.Item
                  name="period"
                  rules={[{ required: true, message: 'Dönem seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    picker="month"
                    format="MM/YYYY"
                    style={{ width: '100%' }}
                    placeholder="Ay/Yıl seçin"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── KAZANÇLAR ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Kazançlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Temel Maaş <span className="text-red-500">*</span></label>
                <Form.Item
                  name="baseSalary"
                  rules={[{ required: true, message: 'Temel maaş zorunludur' }]}
                  className="mb-0"
                >
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/,/g, '') as any}
                    min={0}
                    addonAfter="TRY"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Fazla Mesai</label>
                <Form.Item name="overtimePay" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/,/g, '') as any}
                    min={0}
                    addonAfter="TRY"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Prim/Bonus</label>
                <Form.Item name="bonus" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/,/g, '') as any}
                    min={0}
                    addonAfter="TRY"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yan Haklar</label>
                <Form.Item name="allowances" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/,/g, '') as any}
                    min={0}
                    addonAfter="TRY"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── VERGİ HESAPLAMA PARAMETRELERİ (Otomatik Mod) ─────────────── */}
          {autoCalculate && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Vergi Hesaplama Parametreleri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    Kümülatif Brüt (Önceki Aylar)
                    <Tooltip title="Bu çalışanın yılbaşından bu aya kadar toplam brüt kazancı. Doğru vergi dilimi hesaplaması için gereklidir.">
                      <InformationCircleIcon className="w-4 h-4 ml-1 text-slate-400 cursor-help inline" />
                    </Tooltip>
                  </label>
                  <Form.Item name="cumulativeGross" className="mb-0">
                    <InputNumber
                      placeholder="0"
                      style={{ width: '100%' }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/,/g, '') as any}
                      min={0}
                      addonAfter="TRY"
                      className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    />
                  </Form.Item>
                </div>
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    Asgari Ücret İstisnası
                    <Tooltip title="2024'te asgari ücret kadar gelir vergiden muaftır.">
                      <InformationCircleIcon className="w-4 h-4 ml-1 text-slate-400 cursor-help inline" />
                    </Tooltip>
                  </label>
                  <div className="flex items-center h-[32px] mt-2">
                    <Form.Item name="applyMinWageExemption" valuePropName="checked" noStyle>
                      <Switch checkedChildren="Evet" unCheckedChildren="Hayır" defaultChecked />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────── KESİNTİLER ─────────────── */}
          <div className="mb-8">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Kesintiler
              </h3>
              {autoCalculate && (
                <Tag color="purple" className="text-xs">Otomatik Hesaplanıyor</Tag>
              )}
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  {autoCalculate ? 'Gelir Vergisi' : 'Vergi'}
                </label>
                <Form.Item name="taxDeduction" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/,/g, '') as any}
                    min={0}
                    addonAfter="TRY"
                    disabled={autoCalculate}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  {autoCalculate ? 'SGK İşçi Payı' : 'SGK'}
                </label>
                <Form.Item name="socialSecurityDeduction" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/,/g, '') as any}
                    min={0}
                    addonAfter="TRY"
                    disabled={autoCalculate}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  {autoCalculate ? 'Damga Vergisi' : 'Diğer'}
                </label>
                <Form.Item name="otherDeductions" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/,/g, '') as any}
                    min={0}
                    addonAfter="TRY"
                    disabled={autoCalculate}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── MAAŞ ÖZETİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Maaş Özeti
            </h3>
            <div className="grid grid-cols-12 gap-4">
              {/* Brüt Maaş */}
              <div className="col-span-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                  <div className="text-2xl font-semibold text-green-700">
                    {formatCurrency(grossSalary)}
                  </div>
                  <div className="text-xs text-green-600 mt-1">Brüt Maaş</div>
                </div>
              </div>

              {/* Toplam Kesinti */}
              <div className="col-span-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
                  <div className="text-2xl font-semibold text-red-700">
                    -{formatCurrency(totalDeductions)}
                  </div>
                  <div className="text-xs text-red-600 mt-1">Toplam Kesinti</div>
                </div>
              </div>

              {/* Net Maaş */}
              <div className="col-span-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                  <div className="text-2xl font-semibold text-blue-700">
                    {formatCurrency(netSalary)}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Net Maaş</div>
                </div>
              </div>
            </div>

            {/* Kesinti Detayları (Otomatik mod) */}
            {autoCalculate && calculation && (
              <div className="mt-4 grid grid-cols-12 gap-4">
                <div className="col-span-8">
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-xs font-medium text-amber-700 mb-3">Kesinti Detayları</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-amber-600">SGK İşçi Payı (%15)</span>
                        <span className="font-medium text-amber-700">-{formatCurrency(calculation.totalSgkEmployee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-600">Gelir Vergisi</span>
                        <span className="font-medium text-amber-700">-{formatCurrency(calculation.incomeTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-600">Damga Vergisi (%0.759)</span>
                        <span className="font-medium text-amber-700">-{formatCurrency(calculation.stampTax)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 h-full">
                    <div className="text-xs font-medium text-purple-700 mb-3">İşveren Maliyeti</div>
                    <div className="text-lg font-semibold text-purple-700">
                      {formatCurrency(calculation.totalEmployerCost)}
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      SGK İşveren: +{formatCurrency(calculation.totalSgkEmployer)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Vergi Dilimi Bilgisi */}
            {autoCalculate && grossSalary > 0 && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <InformationCircleIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-600">Vergi Dilimi Bilgisi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag color="blue">{taxBracketInfo.currentBracket}. Dilim</Tag>
                  <Tag color="orange">%{(taxBracketInfo.currentRate * 100).toFixed(0)}</Tag>
                </div>
                {taxBracketInfo.amountUntilNextBracket && (
                  <p className="text-xs text-slate-500 mt-2">
                    Sonraki dilime {formatCurrency(taxBracketInfo.amountUntilNextBracket)} kaldı
                  </p>
                )}
                {calculation?.sgkCeilingApplied && (
                  <p className="text-xs text-amber-600 mt-2">
                    SGK Tavanı uygulandı ({formatCurrency(params.SGK_CEILING)})
                  </p>
                )}
              </div>
            )}

            {/* Hesaplama Detayları */}
            {autoCalculate && calculation && (
              <Collapse
                ghost
                className="mt-4"
                items={[{
                  key: '1',
                  label: <span className="text-xs text-slate-500">Hesaplama Detayları</span>,
                  children: (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vergi Matrahı:</span>
                        <span className="text-slate-700">{formatCurrency(calculation.taxBase)}</span>
                      </div>
                      {calculation.minWageExemption > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Asgari Ücret İstisnası:</span>
                          <span className="text-green-600">-{formatCurrency(calculation.minWageExemption)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Efektif Vergi Oranı:</span>
                        <span className="text-slate-700">{formatPercent(calculation.effectiveTaxRate)}</span>
                      </div>
                      <div className="border-t border-slate-200 my-2" />
                      <div className="flex justify-between">
                        <span className="text-slate-500">SGK Sigorta İşçi:</span>
                        <span className="text-slate-700">{formatCurrency(calculation.sgkInsuranceEmployee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">İşsizlik İşçi:</span>
                        <span className="text-slate-700">{formatCurrency(calculation.sgkUnemploymentEmployee)}</span>
                      </div>
                      <div className="border-t border-slate-200 my-2" />
                      <div className="flex justify-between">
                        <span className="text-slate-500">SGK Sigorta İşveren:</span>
                        <span className="text-slate-700">{formatCurrency(calculation.sgkInsuranceEmployer)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">İşsizlik İşveren:</span>
                        <span className="text-slate-700">{formatCurrency(calculation.sgkUnemploymentEmployer)}</span>
                      </div>
                    </div>
                  ),
                }]}
              />
            )}
          </div>

          {/* ─────────────── 2024 VERGİ PARAMETRELERİ (Otomatik Mod) ─────────────── */}
          {autoCalculate && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                2024 Vergi Parametreleri
              </h3>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Asgari Ücret:</span>
                    <span className="ml-2 font-medium text-blue-700">{formatCurrency(params.MINIMUM_WAGE)}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">SGK Tavan:</span>
                    <span className="ml-2 font-medium text-blue-700">{formatCurrency(params.SGK_CEILING)}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">SGK İşçi:</span>
                    <span className="ml-2 font-medium text-blue-700">%{(params.SGK_EMPLOYEE.TOTAL * 100).toFixed(0)}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">SGK İşveren:</span>
                    <span className="ml-2 font-medium text-blue-700">%{(params.SGK_EMPLOYER.TOTAL * 100).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────── NOTLAR ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Ek notlar..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
