'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Form,
  Button,
  Card,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Typography,
  Spin,
  Empty,
  Tag,
  Slider,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import {
  usePurchaseBudget,
  useUpdatePurchaseBudget,
} from '@/lib/api/hooks/usePurchase';
import { useDepartments } from '@/lib/api/hooks/useHR';
import type { PurchaseBudgetStatus, PurchaseBudgetType } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusConfig: Record<PurchaseBudgetStatus, { color: string; text: string }> = {
  Draft: { color: 'default', text: 'Taslak' },
  PendingApproval: { color: 'orange', text: 'Onay Bekliyor' },
  Approved: { color: 'blue', text: 'Onaylandı' },
  Active: { color: 'green', text: 'Aktif' },
  Frozen: { color: 'cyan', text: 'Donduruldu' },
  Exhausted: { color: 'red', text: 'Tükendi' },
  Closed: { color: 'gray', text: 'Kapatıldı' },
  Rejected: { color: 'volcano', text: 'Reddedildi' },
  Cancelled: { color: 'magenta', text: 'İptal Edildi' },
};

const budgetTypeOptions = [
  { value: 'Annual', label: 'Yıllık' },
  { value: 'Quarterly', label: 'Çeyreklik' },
  { value: 'Monthly', label: 'Aylık' },
  { value: 'Project', label: 'Proje' },
  { value: 'Department', label: 'Departman' },
  { value: 'Category', label: 'Kategori' },
  { value: 'CostCenter', label: 'Maliyet Merkezi' },
  { value: 'General', label: 'Genel' },
];

const currencyOptions = [
  { value: 'TRY', label: 'TRY (₺)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
];

export default function EditPurchaseBudgetPage() {
  const params = useParams();
  const router = useRouter();
  const budgetId = params.id as string;
  const [form] = Form.useForm();

  const { data: budget, isLoading: budgetLoading } = usePurchaseBudget(budgetId);
  const updateBudget = useUpdatePurchaseBudget();
  const { data: departmentsData, isLoading: departmentsLoading } = useDepartments();

  useEffect(() => {
    if (budget) {
      form.setFieldsValue({
        code: budget.code || budget.budgetCode,
        name: budget.name,
        description: budget.description,
        budgetType: budget.budgetType || budget.type,
        year: budget.year,
        quarter: budget.quarter,
        departmentId: budget.departmentId,
        periodStart: budget.periodStart ? dayjs(budget.periodStart) : null,
        periodEnd: budget.periodEnd ? dayjs(budget.periodEnd) : null,
        totalAmount: budget.totalAmount || budget.originalAmount,
        currency: budget.currency,
        alertThreshold: budget.alertThreshold,
        notes: budget.notes,
      });
    }
  }, [budget, form]);

  if (budgetLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="p-8">
        <Empty description="Bütçe bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/budgets')}>
            Bütçelere Dön
          </Button>
        </div>
      </div>
    );
  }

  if (budget.status !== 'Draft') {
    return (
      <div className="p-8">
        <Empty description="Bu bütçe düzenlenemez. Sadece taslak bütçeler düzenlenebilir." />
        <div className="text-center mt-4">
          <Button onClick={() => router.push(`/purchase/budgets/${budgetId}`)}>
            Bütçeye Dön
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async (values: any) => {
    try {
      await updateBudget.mutateAsync({
        id: budgetId,
        data: {
          name: values.name,
          description: values.description,
          endDate: values.periodEnd?.toISOString(),
          warningThreshold: values.alertThreshold,
          notes: values.notes,
        },
      });
      message.success('Bütçe başarıyla güncellendi');
      router.push(`/purchase/budgets/${budgetId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/budgets/${budgetId}`);
  };

  const isLoading = updateBudget.isPending;
  const status = statusConfig[budget.status as PurchaseBudgetStatus] || statusConfig.Draft;

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #722ed1 0%, #1890ff 100%)' }}
              >
                <WalletOutlined style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  Bütçeyi Düzenle
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  {budget.code || budget.budgetCode}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              loading={isLoading}
              className="px-6"
            >
              Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* Read-Only Info */}
          <Card title="Bütçe Bilgileri (Salt Okunur)" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Durum</Text>
                  <Tag color={status.color}>{status.text}</Tag>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Kullanılan</Text>
                  <Text strong style={{ color: budget.usedAmount > 0 ? '#f5222d' : '#52c41a' }}>
                    {(budget.usedAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {budget.currency}
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Kalan</Text>
                  <Text strong style={{ color: '#52c41a' }}>
                    {(budget.remainingAmount || budget.availableAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {budget.currency}
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Editable Fields */}
          <Card title="Bütçe Detayları" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="code"
                  label="Bütçe Kodu"
                  rules={[{ required: true, message: 'Kod zorunludur' }]}
                >
                  <Input placeholder="BTJ-2024-001" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="Bütçe Adı"
                  rules={[{ required: true, message: 'Ad zorunludur' }]}
                >
                  <Input placeholder="Bütçe adı" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="description" label="Açıklama">
                  <TextArea rows={2} placeholder="Bütçe açıklaması..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="budgetType"
                  label="Bütçe Tipi"
                  rules={[{ required: true, message: 'Tip seçin' }]}
                >
                  <Select options={budgetTypeOptions} placeholder="Tip seçin" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="year" label="Yıl">
                  <InputNumber
                    className="w-full"
                    min={2020}
                    max={2099}
                    placeholder="2024"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="quarter" label="Çeyrek">
                  <Select placeholder="Seçin" allowClear>
                    <Select.Option value={1}>Q1</Select.Option>
                    <Select.Option value={2}>Q2</Select.Option>
                    <Select.Option value={3}>Q3</Select.Option>
                    <Select.Option value={4}>Q4</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="departmentId" label="Departman">
                  <Select
                    placeholder="Departman seçin"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    loading={departmentsLoading}
                  >
                    {departmentsData?.map((dept: any) => (
                      <Select.Option key={dept.id} value={dept.id}>
                        {dept.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="periodStart" label="Dönem Başlangıcı">
                  <DatePicker className="w-full" format="DD.MM.YYYY" placeholder="Tarih" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="periodEnd" label="Dönem Bitişi">
                  <DatePicker className="w-full" format="DD.MM.YYYY" placeholder="Tarih" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="totalAmount"
                  label="Toplam Bütçe"
                  rules={[{ required: true, message: 'Tutar zorunludur' }]}
                >
                  <InputNumber
                    className="w-full"
                    min={0}
                    precision={2}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => (parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0) as unknown as 0}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="currency" label="Para Birimi">
                  <Select options={currencyOptions} placeholder="Seçin" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="alertThreshold" label="Uyarı Eşiği (%)">
                  <Slider
                    min={50}
                    max={100}
                    marks={{
                      50: '50%',
                      70: '70%',
                      80: '80%',
                      90: '90%',
                      100: '100%',
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="notes" label="Notlar">
                  <TextArea rows={3} placeholder="Ek notlar..." />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </div>
    </div>
  );
}
