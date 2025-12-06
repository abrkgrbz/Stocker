'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Select, DatePicker, InputNumber, Input, Row, Col } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, DollarOutlined } from '@ant-design/icons';
import { useCreatePayroll, useEmployees } from '@/lib/api/hooks/useHR';
import type { CreatePayrollDto } from '@/lib/api/services/hr.types';

const { Title } = Typography;
const { TextArea } = Input;

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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/payroll')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <DollarOutlined className="mr-2" />
            Yeni Bordro
          </Title>
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={18}>
          <Card>
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
                    <DatePicker picker="month" format="MM/YYYY" style={{ width: '100%' }} placeholder="Ay/Yıl" />
                  </Form.Item>
                </Col>
              </Row>

              <Card title="Kazançlar" size="small" className="mb-4">
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
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card title="Kesintiler" size="small" className="mb-4">
                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Form.Item name="taxDeduction" label="Vergi Kesintisi">
                      <InputNumber
                        placeholder="0"
                        style={{ width: '100%' }}
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
                        formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                        min={0}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Form.Item name="notes" label="Notlar">
                <TextArea rows={3} placeholder="Ek notlar" />
              </Form.Item>

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => router.push('/hr/payroll')}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={createPayroll.isPending}
                >
                  Kaydet
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
