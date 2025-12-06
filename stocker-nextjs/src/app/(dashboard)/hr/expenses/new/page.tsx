'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Select, DatePicker, InputNumber, Input, Row, Col, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, WalletOutlined } from '@ant-design/icons';
import { useCreateExpense, useEmployees } from '@/lib/api/hooks/useHR';
import type { CreateExpenseDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;
const { Text } = Typography;

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
                <WalletOutlined className="mr-2" />
                Yeni Harcama
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir harcama kaydı oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/expenses')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createExpense.isPending}
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
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={48}>
            <Col xs={24} lg={16}>
              {/* Basic Info Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Harcama Bilgileri
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
                        name="expenseDate"
                        label="Harcama Tarihi"
                        rules={[{ required: true, message: 'Tarih gerekli' }]}
                      >
                        <DatePicker
                          format="DD.MM.YYYY"
                          style={{ width: '100%' }}
                          placeholder="Tarih seçin"
                          variant="filled"
                        />
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
                          variant="filled"
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
                          variant="filled"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="description"
                    label="Açıklama"
                    rules={[{ required: true, message: 'Açıklama gerekli' }]}
                  >
                    <Input placeholder="Harcama açıklaması" variant="filled" />
                  </Form.Item>
                </div>
              </div>

              {/* Notes Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Ek Notlar
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Form.Item name="notes" label="Notlar" className="mb-0">
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
