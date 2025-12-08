'use client';

import React from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  DatePicker,
  InputNumber,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { useCreatePurchaseBudget } from '@/lib/api/hooks/usePurchase';
import type { CreatePurchaseBudgetDto, BudgetType } from '@/lib/api/services/purchase.types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const budgetTypeOptions: { value: BudgetType; label: string }[] = [
  { value: 'Department', label: 'Departman' },
  { value: 'Category', label: 'Kategori' },
  { value: 'Project', label: 'Proje' },
  { value: 'CostCenter', label: 'Maliyet Merkezi' },
  { value: 'General', label: 'Genel' },
];

export default function NewPurchaseBudgetPage() {
  const router = useRouter();
  const [form] = Form.useForm();

  const createMutation = useCreatePurchaseBudget();

  const handleSubmit = async (values: any) => {
    const [periodStart, periodEnd] = values.period || [];

    const data: CreatePurchaseBudgetDto = {
      code: values.code,
      name: values.name,
      description: values.description,
      budgetType: values.budgetType,
      departmentId: values.departmentId,
      categoryId: values.categoryId,
      totalAmount: values.totalAmount,
      currency: values.currency || 'TRY',
      periodStart: periodStart?.toISOString(),
      periodEnd: periodEnd?.toISOString(),
      alertThreshold: values.alertThreshold,
      notes: values.notes,
    };

    try {
      await createMutation.mutateAsync(data);
      router.push('/purchase/budgets');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} />
        <div>
          <Title level={3} className="mb-1">Yeni Satın Alma Bütçesi</Title>
          <Text type="secondary">Departman veya kategori bazlı bütçe tanımlayın</Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          currency: 'TRY',
          budgetType: 'Department',
          alertThreshold: 80,
        }}
      >
        <Row gutter={24}>
          {/* Left Panel */}
          <Col xs={24} lg={10}>
            <Card bordered={false} className="shadow-sm mb-6">
              <div
                style={{
                  background: 'linear-gradient(135deg, #722ed1 0%, #1890ff 100%)',
                  borderRadius: '12px',
                  padding: '32px 20px',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WalletOutlined style={{ fontSize: '56px', color: 'rgba(255,255,255,0.9)' }} />
                <p className="mt-4 text-lg font-medium text-white/90">Satın Alma Bütçesi</p>
                <p className="text-sm text-white/60">Harcama limitlerini belirleyin</p>
              </div>
            </Card>

            {/* Budget Amount */}
            <Card title="Bütçe Tutarı" bordered={false} className="shadow-sm">
              <Form.Item
                name="totalAmount"
                label="Toplam Bütçe"
                rules={[{ required: true, message: 'Tutar zorunludur' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="0.00"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: string | undefined) => Number(value?.replace(/,/g, '') ?? 0)}
                  addonAfter={
                    <Form.Item name="currency" noStyle>
                      <Select style={{ width: 80 }}>
                        <Select.Option value="TRY">TRY</Select.Option>
                        <Select.Option value="USD">USD</Select.Option>
                        <Select.Option value="EUR">EUR</Select.Option>
                      </Select>
                    </Form.Item>
                  }
                />
              </Form.Item>

              <Form.Item
                name="alertThreshold"
                label="Uyarı Eşiği (%)"
                help="Bu yüzdeyi aştığında uyarı gönderilir"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  placeholder="80"
                  addonAfter="%"
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Right Panel */}
          <Col xs={24} lg={14}>
            <Card bordered={false} className="shadow-sm mb-6">
              {/* Name - Hero Input */}
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Bütçe adı zorunludur' },
                  { max: 200, message: 'En fazla 200 karakter' },
                ]}
                className="mb-4"
              >
                <Input
                  placeholder="Bütçe adı"
                  variant="borderless"
                  style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    padding: '0',
                    color: '#1a1a1a',
                  }}
                  className="placeholder:text-gray-300"
                />
              </Form.Item>

              <Form.Item name="description" className="mb-6">
                <TextArea
                  placeholder="Bütçe hakkında açıklama..."
                  variant="borderless"
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  style={{ fontSize: '15px', padding: '0', color: '#666' }}
                  className="placeholder:text-gray-300"
                />
              </Form.Item>

              <Divider />

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="code"
                    label="Bütçe Kodu"
                    rules={[{ required: true, message: 'Zorunlu' }]}
                  >
                    <Input placeholder="BUD-2024-001" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="budgetType"
                    label="Bütçe Tipi"
                    rules={[{ required: true, message: 'Zorunlu' }]}
                  >
                    <Select placeholder="Tip seçin" options={budgetTypeOptions} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="period"
                label="Bütçe Dönemi"
                rules={[{ required: true, message: 'Dönem seçimi zorunludur' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  format="DD.MM.YYYY"
                  placeholder={['Başlangıç', 'Bitiş']}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="departmentId" label="Departman">
                    <Select
                      placeholder="Departman seçin"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {/* TODO: Load departments from API */}
                      <Select.Option value="dept-1">Üretim</Select.Option>
                      <Select.Option value="dept-2">Pazarlama</Select.Option>
                      <Select.Option value="dept-3">İK</Select.Option>
                      <Select.Option value="dept-4">IT</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="categoryId" label="Kategori">
                    <Select
                      placeholder="Kategori seçin"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {/* TODO: Load categories from API */}
                      <Select.Option value="cat-1">Hammadde</Select.Option>
                      <Select.Option value="cat-2">Ofis Malzemeleri</Select.Option>
                      <Select.Option value="cat-3">IT Ekipmanları</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="notes" label="Notlar">
                <TextArea rows={3} placeholder="Ek notlar ve açıklamalar..." />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={() => router.back()}>İptal</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
            loading={createMutation.isPending}
          >
            Kaydet
          </Button>
        </div>
      </Form>
    </div>
  );
}
