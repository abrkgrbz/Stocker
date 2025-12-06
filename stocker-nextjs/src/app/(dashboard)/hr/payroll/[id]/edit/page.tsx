'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Select, DatePicker, InputNumber, Input, Row, Col, Spin, Empty } from 'antd';
import { ArrowLeftOutlined, DollarOutlined } from '@ant-design/icons';
import { usePayroll, useUpdatePayroll, useEmployees } from '@/lib/api/hooks/useHR';
import type { UpdatePayrollDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function EditPayrollPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: payroll, isLoading, error } = usePayroll(id);
  const updatePayroll = useUpdatePayroll();
  const { data: employees = [] } = useEmployees();

  // Populate form when payroll data loads
  useEffect(() => {
    if (payroll) {
      form.setFieldsValue({
        employeeId: payroll.employeeId,
        period: dayjs().year(payroll.year).month((payroll.month || 1) - 1),
        baseSalary: payroll.baseSalary,
        overtimePay: payroll.overtimePay,
        bonus: payroll.bonus,
        allowances: payroll.allowances,
        taxDeduction: payroll.taxDeduction,
        socialSecurityDeduction: payroll.socialSecurityDeduction,
        otherDeductions: payroll.otherDeductions,
        notes: payroll.notes,
      });
    }
  }, [payroll, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdatePayrollDto = {
        employeeId: values.employeeId,
        month: values.period.month() + 1,
        year: values.period.year(),
        baseSalary: values.baseSalary,
        overtimePay: values.overtimePay,
        bonus: values.bonus,
        allowances: values.allowances,
        taxDeduction: values.taxDeduction,
        socialSecurityDeduction: values.socialSecurityDeduction,
        otherDeductions: values.otherDeductions,
        notes: values.notes,
      };

      await updatePayroll.mutateAsync({ id, data });
      router.push(`/hr/payroll/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !payroll) {
    return (
      <div className="p-6">
        <Empty description="Bordro kaydı bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/payroll')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  if (payroll.status === 'Processed') {
    return (
      <div className="p-6">
        <Empty description="Bu bordro kaydı düzenlenemez. Ödenen bordrolar düzenlenemez." />
        <div className="text-center mt-4">
          <Button onClick={() => router.push(`/hr/payroll/${id}`)}>Detaya Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 px-6 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push(`/hr/payroll/${id}`)}
            />
            <div className="flex items-center gap-2">
              <DollarOutlined className="text-lg text-gray-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 m-0">Bordro Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">
                  {payroll.employeeName || `Çalışan #${payroll.employeeId}`} - {payroll.month}/
                  {payroll.year}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/hr/payroll/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updatePayroll.isPending}
              style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
            >
              Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Employee & Period */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Temel Bilgiler
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="employeeId"
                    label="Çalışan"
                    rules={[{ required: true, message: 'Çalışan seçimi gerekli' }]}
                  >
                    <Select
                      placeholder="Çalışan seçin"
                      showSearch
                      optionFilterProp="children"
                      variant="filled"
                      options={employees.map((e) => ({
                        value: e.id,
                        label: `${e.firstName} ${e.lastName}`,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="period"
                    label="Dönem"
                    rules={[{ required: true, message: 'Dönem seçimi gerekli' }]}
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
          </div>

          {/* Earnings */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Kazançlar
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="baseSalary"
                    label="Temel Maaş"
                    rules={[{ required: true, message: 'Temel maaş gerekli' }]}
                  >
                    <InputNumber
                      placeholder="0"
                      style={{ width: '100%' }}
                      variant="filled"
                      formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="overtimePay" label="Fazla Mesai">
                    <InputNumber
                      placeholder="0"
                      style={{ width: '100%' }}
                      variant="filled"
                      formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="bonus" label="Prim/Bonus">
                    <InputNumber
                      placeholder="0"
                      style={{ width: '100%' }}
                      variant="filled"
                      formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="allowances" label="Yan Haklar">
                    <InputNumber
                      placeholder="0"
                      style={{ width: '100%' }}
                      variant="filled"
                      formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          {/* Deductions */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Kesintiler
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="taxDeduction" label="Vergi Kesintisi">
                    <InputNumber
                      placeholder="0"
                      style={{ width: '100%' }}
                      variant="filled"
                      formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="socialSecurityDeduction" label="SGK Kesintisi">
                    <InputNumber
                      placeholder="0"
                      style={{ width: '100%' }}
                      variant="filled"
                      formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="otherDeductions" label="Diğer Kesintiler">
                    <InputNumber
                      placeholder="0"
                      style={{ width: '100%' }}
                      variant="filled"
                      formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Notlar
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Form.Item name="notes" className="mb-0">
                <TextArea rows={3} placeholder="Ek notlar" variant="filled" />
              </Form.Item>
            </div>
          </div>

          {/* Hidden submit button for form.submit() */}
          <button type="submit" hidden />
        </Form>
      </div>
    </div>
  );
}
