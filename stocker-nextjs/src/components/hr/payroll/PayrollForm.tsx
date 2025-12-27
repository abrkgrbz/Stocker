'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Form, Select, DatePicker, InputNumber, Input, Row, Col, Typography, Button, Switch, Tooltip, Collapse, Tag } from 'antd';
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
const { Text } = Typography;

interface PayrollFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: PayrollDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function PayrollForm({ form, initialValues, onFinish, loading }: PayrollFormProps) {
  const { data: employees = [] } = useEmployees();
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
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
      className="payroll-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Summary (40%) */}
        <Col xs={24} lg={10}>
          {/* Visual Representation */}
          <div className="mb-6">
            <div
              style={{
                background: autoCalculate
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                borderRadius: '16px',
                padding: '32px 20px',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.3s ease',
              }}
            >
              {autoCalculate ? (
                <BoltIcon className="w-14 h-14 text-white/90" />
              ) : (
                <CurrencyDollarIcon className="w-14 h-14 text-white/90" />
              )}
              <p className="mt-3 text-lg font-medium text-white/90">
                {autoCalculate ? 'Otomatik Hesaplama' : 'Manuel Giriş'}
              </p>
              <p className="text-sm text-white/60">
                {autoCalculate ? '2024 Türkiye Vergi Mevzuatı' : 'Değerleri kendiniz girin'}
              </p>
            </div>
          </div>

          {/* Auto Calculate Toggle */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalculatorIcon className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-medium text-gray-700">Otomatik Hesaplama</span>
                <Tooltip title="Açık olduğunda SGK, Gelir Vergisi ve Damga Vergisi 2024 parametreleriyle otomatik hesaplanır.">
                  <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <Switch
                checked={autoCalculate}
                onChange={handleAutoCalculateChange}
                checkedChildren="Açık"
                unCheckedChildren="Kapalı"
              />
            </div>
          </div>

          {/* Salary Summary */}
          <div className="space-y-3">
            <div className="p-4 bg-green-50/50 rounded-xl border border-green-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Brüt Maaş</span>
                <span className="text-lg font-semibold text-green-700">{formatCurrency(grossSalary)}</span>
              </div>
            </div>

            {autoCalculate && calculation && (
              <>
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-amber-700">SGK İşçi Payı (%15)</span>
                    <span className="text-sm font-medium text-amber-700">
                      -{formatCurrency(calculation.totalSgkEmployee)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-amber-700">Gelir Vergisi</span>
                    <span className="text-sm font-medium text-amber-700">
                      -{formatCurrency(calculation.incomeTax)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-amber-700">Damga Vergisi (%0.759)</span>
                    <span className="text-sm font-medium text-amber-700">
                      -{formatCurrency(calculation.stampTax)}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-700">Toplam Kesinti</span>
                <span className="text-lg font-semibold text-red-700">-{formatCurrency(totalDeductions)}</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-700">Net Maaş</span>
                <span className="text-xl font-bold text-blue-700">{formatCurrency(netSalary)}</span>
              </div>
            </div>

            {autoCalculate && calculation && (
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-purple-700">İşveren SGK Payı</span>
                  <span className="text-sm font-medium text-purple-700">
                    +{formatCurrency(calculation.totalSgkEmployer)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-purple-200">
                  <span className="text-sm font-medium text-purple-700">Toplam İşveren Maliyeti</span>
                  <span className="text-lg font-bold text-purple-700">
                    {formatCurrency(calculation.totalEmployerCost)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tax Bracket Info */}
          {autoCalculate && grossSalary > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <InformationCircleIcon className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">Vergi Dilimi Bilgisi</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag color="blue">{taxBracketInfo.currentBracket}. Dilim</Tag>
                <Tag color="orange">%{(taxBracketInfo.currentRate * 100).toFixed(0)}</Tag>
              </div>
              {taxBracketInfo.amountUntilNextBracket && (
                <p className="text-xs text-gray-500 mt-2">
                  Sonraki dilime {formatCurrency(taxBracketInfo.amountUntilNextBracket)} kaldı
                </p>
              )}
              {calculation?.sgkCeilingApplied && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ SGK Tavanı uygulandı ({formatCurrency(params.SGK_CEILING)})
                </p>
              )}
            </div>
          )}

          {/* Calculation Details */}
          {autoCalculate && calculation && (
            <Collapse
              ghost
              className="mt-4"
              items={[{
                key: '1',
                label: <span className="text-xs text-gray-500">Hesaplama Detayları</span>,
                children: (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vergi Matrahı:</span>
                      <span className="text-gray-700">{formatCurrency(calculation.taxBase)}</span>
                    </div>
                    {calculation.minWageExemption > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Asgari Ücret İstisnası:</span>
                        <span className="text-green-600">-{formatCurrency(calculation.minWageExemption)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Efektif Vergi Oranı:</span>
                      <span className="text-gray-700">{formatPercent(calculation.effectiveTaxRate)}</span>
                    </div>
                    <div className="border-t border-gray-200 my-2" />
                    <div className="flex justify-between">
                      <span className="text-gray-500">SGK Sigorta İşçi:</span>
                      <span className="text-gray-700">{formatCurrency(calculation.sgkInsuranceEmployee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">İşsizlik İşçi:</span>
                      <span className="text-gray-700">{formatCurrency(calculation.sgkUnemploymentEmployee)}</span>
                    </div>
                    <div className="border-t border-gray-200 my-2" />
                    <div className="flex justify-between">
                      <span className="text-gray-500">SGK Sigorta İşveren:</span>
                      <span className="text-gray-700">{formatCurrency(calculation.sgkInsuranceEmployer)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">İşsizlik İşveren:</span>
                      <span className="text-gray-700">{formatCurrency(calculation.sgkUnemploymentEmployer)}</span>
                    </div>
                  </div>
                ),
              }]}
            />
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Basic Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Temel Bilgiler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Çalışan *</div>
                <Form.Item
                  name="employeeId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <Select
                    placeholder="Çalışan seçin"
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    disabled={!!initialValues}
                    options={employees.map((e) => ({
                      value: e.id,
                      label: e.fullName,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Dönem *</div>
                <Form.Item
                  name="period"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <DatePicker
                    picker="month"
                    format="MM/YYYY"
                    style={{ width: '100%' }}
                    placeholder="Ay/Yıl"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Earnings */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Kazançlar
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Temel Maaş *</div>
                <Form.Item
                  name="baseSalary"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                    min={0}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Fazla Mesai</div>
                <Form.Item name="overtimePay" className="mb-4">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                    min={0}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Prim/Bonus</div>
                <Form.Item name="bonus" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                    min={0}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Yan Haklar</div>
                <Form.Item name="allowances" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                    min={0}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Auto-calculation specific fields */}
          {autoCalculate && (
            <>
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  Vergi Hesaplama Parametreleri
                </Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className="text-xs text-gray-400 mb-1">
                      Kümülatif Brüt (Önceki Aylar)
                      <Tooltip title="Bu çalışanın yılbaşından bu aya kadar toplam brüt kazancı. Doğru vergi dilimi hesaplaması için gereklidir.">
                        <InformationCircleIcon className="w-4 h-4 ml-1 text-gray-400 cursor-help inline" />
                      </Tooltip>
                    </div>
                    <Form.Item name="cumulativeGross" className="mb-4">
                      <InputNumber
                        placeholder="0"
                        style={{ width: '100%' }}
                        formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                        min={0}
                        variant="filled"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <div className="text-xs text-gray-400 mb-1">
                      Asgari Ücret İstisnası
                      <Tooltip title="2024'te asgari ücret kadar gelir vergiden muaftır.">
                        <InformationCircleIcon className="w-4 h-4 ml-1 text-gray-400 cursor-help inline" />
                      </Tooltip>
                    </div>
                    <Form.Item name="applyMinWageExemption" valuePropName="checked" className="mb-4">
                      <Switch checkedChildren="Evet" unCheckedChildren="Hayır" defaultChecked />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
            </>
          )}

          {/* Deductions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Kesintiler
              </Text>
              {autoCalculate && (
                <Tag color="purple" className="text-xs">Otomatik Hesaplanıyor</Tag>
              )}
            </div>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">
                  {autoCalculate ? 'Gelir Vergisi' : 'Vergi'}
                </div>
                <Form.Item name="taxDeduction" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                    min={0}
                    variant="filled"
                    disabled={autoCalculate}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">
                  {autoCalculate ? 'SGK İşçi Payı' : 'SGK'}
                </div>
                <Form.Item name="socialSecurityDeduction" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                    min={0}
                    variant="filled"
                    disabled={autoCalculate}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">
                  {autoCalculate ? 'Damga Vergisi' : 'Diğer'}
                </div>
                <Form.Item name="otherDeductions" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                    min={0}
                    variant="filled"
                    disabled={autoCalculate}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* 2024 Parameters Info */}
          {autoCalculate && (
            <>
              <div className="mb-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <InformationCircleIcon className="w-4 h-4 text-blue-600" />
                  <Text className="text-xs font-medium text-blue-700">2024 Vergi Parametreleri</Text>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Asgari Ücret:</span>
                    <span className="ml-2 text-gray-700">{formatCurrency(params.MINIMUM_WAGE)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">SGK Tavan:</span>
                    <span className="ml-2 text-gray-700">{formatCurrency(params.SGK_CEILING)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">SGK İşçi:</span>
                    <span className="ml-2 text-gray-700">%{(params.SGK_EMPLOYEE.TOTAL * 100).toFixed(0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">SGK İşveren:</span>
                    <span className="ml-2 text-gray-700">%{(params.SGK_EMPLOYER.TOTAL * 100).toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
            </>
          )}

          {/* Notes */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Notlar
            </Text>
            <Form.Item name="notes" className="mb-0">
              <TextArea rows={3} placeholder="Ek notlar..." variant="filled" />
            </Form.Item>
          </div>
        </Col>
      </Row>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
