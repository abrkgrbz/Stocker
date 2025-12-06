'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Select, DatePicker, InputNumber, Input, Row, Col, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, DollarOutlined } from '@ant-design/icons';
import { useCreatePayroll, useEmployees } from '@/lib/api/hooks/useHR';
import type { CreatePayrollDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;
const { Text } = Typography;

export default function NewPayrollPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createPayroll = useCreatePayroll();
  const { data: employees = [] } = useEmployees();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreatePayrollDto = {
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

      await createPayroll.mutateAsync(data);
      router.push('/hr/payroll');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <DollarOutlined className="mr-2" />
                Yeni Bordro
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir bordro kaydı oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/payroll')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createPayroll.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            baseSalary: 0,
            overtimePay: 0,
            bonus: 0,
            allowances: 0,
            taxDeduction: 0,
            socialSecurityDeduction: 0,
            otherDeductions: 0,
          }}
        >
          <Row gutter={48}>
            <Col xs={24} lg={18}>
              {/* Basic Info Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Temel Bilgiler
                </Text>
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

              {/* Earnings Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Kazançlar
                </Text>
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
                          formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                          min={0}
                          variant="filled"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item name="overtimePay" label="Fazla Mesai">
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
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item name="bonus" label="Prim/Bonus">
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
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item name="allowances" label="Yan Haklar">
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
              </div>

              {/* Deductions Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Kesintiler
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Form.Item name="taxDeduction" label="Vergi Kesintisi">
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
                    <Col xs={24} sm={8}>
                      <Form.Item name="socialSecurityDeduction" label="SGK Kesintisi">
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
                    <Col xs={24} sm={8}>
                      <Form.Item name="otherDeductions" label="Diğer Kesintiler">
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
              </div>

              {/* Notes Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Notlar
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Form.Item name="notes" label="Ek Notlar" className="mb-0">
                    <TextArea rows={3} placeholder="Ek notlar" variant="filled" />
                  </Form.Item>
                </div>
              </div>
            </Col>
          </Row>

          {/* Hidden submit button */}
          <Form.Item hidden>
            <Button htmlType="submit" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
