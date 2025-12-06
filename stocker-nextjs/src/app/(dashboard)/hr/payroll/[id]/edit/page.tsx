'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Select, DatePicker, InputNumber, Input, Row, Col, Spin, Empty } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, DollarOutlined } from '@ant-design/icons';
import { usePayroll, useUpdatePayroll, useEmployees } from '@/lib/api/hooks/useHR';
import type { UpdatePayrollDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/hr/payroll/${id}`)}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <DollarOutlined className="mr-2" />
              Bordro Düzenle
            </Title>
            <Text type="secondary">
              {payroll.employeeName || `Çalışan #${payroll.employeeId}`} - {payroll.month}/{payroll.year}
            </Text>
          </div>
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={18}>
          <Card>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                <Button onClick={() => router.push(`/hr/payroll/${id}`)}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={updatePayroll.isPending}
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
