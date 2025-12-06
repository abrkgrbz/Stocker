'use client';

import React, { useEffect, useMemo } from 'react';
import { Form, Select, DatePicker, InputNumber, Input, Row, Col, Typography } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { PayrollDto } from '@/lib/api/services/hr.types';
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

  // Watch form values for calculations
  const baseSalary = Form.useWatch('baseSalary', form) || 0;
  const overtimePay = Form.useWatch('overtimePay', form) || 0;
  const bonus = Form.useWatch('bonus', form) || 0;
  const allowances = Form.useWatch('allowances', form) || 0;
  const taxDeduction = Form.useWatch('taxDeduction', form) || 0;
  const socialSecurityDeduction = Form.useWatch('socialSecurityDeduction', form) || 0;
  const otherDeductions = Form.useWatch('otherDeductions', form) || 0;

  const grossSalary = useMemo(() => baseSalary + overtimePay + bonus + allowances, [baseSalary, overtimePay, bonus, allowances]);
  const totalDeductions = useMemo(() => taxDeduction + socialSecurityDeduction + otherDeductions, [taxDeduction, socialSecurityDeduction, otherDeductions]);
  const netSalary = useMemo(() => grossSalary - totalDeductions, [grossSalary, totalDeductions]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        period: initialValues.month && initialValues.year
          ? dayjs().year(initialValues.year).month(initialValues.month - 1)
          : undefined,
      });
    }
  }, [form, initialValues]);

  const formatCurrency = (value: number) => `₺${value.toLocaleString('tr-TR')}`;

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
      }}
      className="payroll-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Summary (40%) */}
        <Col xs={24} lg={10}>
          {/* Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">Bordro Kaydı</p>
              <p className="text-sm text-white/60">Maaş hesaplaması yapın</p>
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
          </div>
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
                      label: `${e.firstName} ${e.lastName}`,
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

          {/* Deductions */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Kesintiler
            </Text>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Vergi</div>
                <Form.Item name="taxDeduction" className="mb-0">
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
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">SGK</div>
                <Form.Item name="socialSecurityDeduction" className="mb-0">
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
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Diğer</div>
                <Form.Item name="otherDeductions" className="mb-0">
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
