'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Select, DatePicker, InputNumber, Input, Row, Col, Upload } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, WalletOutlined, UploadOutlined } from '@ant-design/icons';
import { useCreateExpense, useEmployees } from '@/lib/api/hooks/useHR';
import type { CreateExpenseDto } from '@/lib/api/services/hr.types';

const { Title } = Typography;
const { TextArea } = Input;

export default function NewExpensePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createExpense = useCreateExpense();
  const { data: employees = [] } = useEmployees();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateExpenseDto = {
        employeeId: values.employeeId,
        description: values.description,
        amount: values.amount,
        category: values.category,
        expenseDate: values.expenseDate?.format('YYYY-MM-DD'),
        notes: values.notes,
      };

      await createExpense.mutateAsync(data);
      router.push('/hr/expenses');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/expenses')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <WalletOutlined className="mr-2" />
            Yeni Harcama
          </Title>
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
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
                    name="expenseDate"
                    label="Harcama Tarihi"
                    rules={[{ required: true, message: 'Tarih gerekli' }]}
                  >
                    <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} placeholder="Tarih seçin" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="category"
                    label="Kategori"
                    rules={[{ required: true, message: 'Kategori gerekli' }]}
                  >
                    <Select
                      placeholder="Kategori seçin"
                      options={[
                        { value: 'Travel', label: 'Seyahat' },
                        { value: 'Meals', label: 'Yemek' },
                        { value: 'Supplies', label: 'Malzeme' },
                        { value: 'Equipment', label: 'Ekipman' },
                        { value: 'Training', label: 'Eğitim' },
                        { value: 'Communication', label: 'İletişim' },
                        { value: 'Transportation', label: 'Ulaşım' },
                        { value: 'Accommodation', label: 'Konaklama' },
                        { value: 'Other', label: 'Diğer' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="amount"
                    label="Tutar"
                    rules={[{ required: true, message: 'Tutar gerekli' }]}
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
              </Row>

              <Form.Item
                name="description"
                label="Açıklama"
                rules={[{ required: true, message: 'Açıklama gerekli' }]}
              >
                <Input placeholder="Harcama açıklaması" />
              </Form.Item>

              <Form.Item name="notes" label="Ek Notlar">
                <TextArea rows={3} placeholder="Ek notlar" />
              </Form.Item>

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => router.push('/hr/expenses')}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={createExpense.isPending}
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
