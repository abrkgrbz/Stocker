'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Select, DatePicker, InputNumber, Input, Row, Col, Spin, Empty } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, WalletOutlined } from '@ant-design/icons';
import { useExpense, useUpdateExpense, useEmployees } from '@/lib/api/hooks/useHR';
import type { UpdateExpenseDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: expense, isLoading, error } = useExpense(id);
  const updateExpense = useUpdateExpense();
  const { data: employees = [] } = useEmployees();

  // Populate form when expense data loads
  useEffect(() => {
    if (expense) {
      form.setFieldsValue({
        employeeId: expense.employeeId,
        expenseDate: expense.expenseDate ? dayjs(expense.expenseDate) : null,
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        notes: expense.notes,
      });
    }
  }, [expense, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateExpenseDto = {
        employeeId: values.employeeId,
        description: values.description,
        amount: values.amount,
        category: values.category,
        expenseDate: values.expenseDate?.format('YYYY-MM-DD'),
        notes: values.notes,
      };

      await updateExpense.mutateAsync({ id, data });
      router.push(`/hr/expenses/${id}`);
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

  if (error || !expense) {
    return (
      <div className="p-6">
        <Empty description="Harcama kaydı bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/expenses')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  if (expense.status !== 'Pending') {
    return (
      <div className="p-6">
        <Empty description="Bu harcama kaydı düzenlenemez. Sadece bekleyen harcamalar düzenlenebilir." />
        <div className="text-center mt-4">
          <Button onClick={() => router.push(`/hr/expenses/${id}`)}>Detaya Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/hr/expenses/${id}`)}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <WalletOutlined className="mr-2" />
              Harcama Düzenle
            </Title>
            <Text type="secondary">
              {expense.employeeName || `Çalışan #${expense.employeeId}`}
            </Text>
          </div>
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
                <Button onClick={() => router.push(`/hr/expenses/${id}`)}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={updateExpense.isPending}
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
