'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  Typography,
  Switch,
  Select,
  InputNumber,
  DatePicker,
  Divider,
  Table,
  Button,
  Space,
  Popconfirm,
  message,
} from 'antd';
import {
  DollarOutlined,
  PercentageOutlined,
  CalendarOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { PriceListDto, PriceListItemDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;
const { RangePicker } = DatePicker;

interface PriceListFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: PriceListDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const CURRENCIES = [
  { value: 'TRY', label: 'TRY - Turk Lirasi' },
  { value: 'USD', label: 'USD - Amerikan Dolari' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - Ingiliz Sterlini' },
];

export default function PriceListForm({ form, initialValues, onFinish, loading }: PriceListFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [items, setItems] = useState<PriceListItemDto[]>([]);

  useEffect(() => {
    if (initialValues) {
      const formValues = {
        ...initialValues,
        validityRange: initialValues.validFrom || initialValues.validTo
          ? [
              initialValues.validFrom ? dayjs(initialValues.validFrom) : null,
              initialValues.validTo ? dayjs(initialValues.validTo) : null,
            ]
          : undefined,
      };
      form.setFieldsValue(formValues);
      setIsActive(initialValues.isActive ?? true);
      setItems(initialValues.items || []);
    }
  }, [form, initialValues]);

  const handleFinish = (values: any) => {
    const submitData = {
      ...values,
      validFrom: values.validityRange?.[0]?.toISOString(),
      validTo: values.validityRange?.[1]?.toISOString(),
    };
    delete submitData.validityRange;
    onFinish(submitData);
  };

  const itemColumns: ColumnsType<PriceListItemDto> = [
    {
      title: 'Urun',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.productName}</div>
          <div className="text-xs text-gray-400">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Fiyat',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price: number, record) => (
        <span className="font-medium">
          {price?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'Indirim',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      align: 'center',
      render: (discount: number) => discount ? `%${discount}` : '-',
    },
    {
      title: 'Min Miktar',
      dataIndex: 'minQuantity',
      key: 'minQuantity',
      align: 'center',
      render: (val: number) => val || '-',
    },
    {
      title: 'Max Miktar',
      dataIndex: 'maxQuantity',
      key: 'maxQuantity',
      align: 'center',
      render: (val: number) => val || '-',
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
      className="price-list-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Price List Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              <p className="mt-4 text-lg font-medium text-white/90">
                Fiyat Listesi
              </p>
              <p className="text-sm text-white/60">
                Urun fiyatlarini grupla ve yonet
              </p>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">Durum</Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isActive ? 'Liste aktif ve kullanilabilir' : 'Liste pasif durumda'}
                </div>
              </div>
              <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                <Switch
                  checked={isActive}
                  onChange={(val) => {
                    setIsActive(val);
                    form.setFieldValue('isActive', val);
                  }}
                  checkedChildren="Aktif"
                  unCheckedChildren="Pasif"
                  style={{
                    backgroundColor: isActive ? '#52c41a' : '#d9d9d9',
                    minWidth: '80px'
                  }}
                />
              </Form.Item>
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.itemCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Urun Sayisi</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.priority || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Oncelik</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Price List Name - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Fiyat listesi adi zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Fiyat listesi adi"
                variant="borderless"
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  padding: '0',
                  color: '#1a1a1a',
                }}
                className="placeholder:text-gray-300"
              />
            </Form.Item>
            <Form.Item name="description" className="mb-0 mt-2">
              <TextArea
                placeholder="Aciklama ekleyin..."
                variant="borderless"
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{
                  fontSize: '15px',
                  padding: '0',
                  color: '#666',
                  resize: 'none'
                }}
                className="placeholder:text-gray-300"
              />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Basic Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Temel Bilgiler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Liste Kodu *</div>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Input
                    placeholder="PL-001"
                    variant="filled"
                    disabled={!!initialValues}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Para Birimi *</div>
                <Form.Item
                  name="currency"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  initialValue="TRY"
                  className="mb-3"
                >
                  <Select
                    options={CURRENCIES}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Oncelik</div>
                <Form.Item name="priority" className="mb-0" initialValue={0}>
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    variant="filled"
                    placeholder="0"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Pricing Options */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <PercentageOutlined className="mr-1" /> Fiyatlandirma
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Global Indirim (%)</div>
                <Form.Item name="globalDiscountPercentage" className="mb-3">
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    variant="filled"
                    placeholder="0"
                    addonAfter="%"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Global Markup (%)</div>
                <Form.Item name="globalMarkupPercentage" className="mb-3">
                  <InputNumber
                    min={0}
                    max={1000}
                    style={{ width: '100%' }}
                    variant="filled"
                    placeholder="0"
                    addonAfter="%"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Validity Period */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <CalendarOutlined className="mr-1" /> Gecerlilik Suresi
            </Text>
            <Form.Item name="validityRange" className="mb-0">
              <RangePicker
                style={{ width: '100%' }}
                variant="filled"
                placeholder={['Baslangic', 'Bitis']}
                format="DD.MM.YYYY"
              />
            </Form.Item>
            <div className="text-xs text-gray-400 mt-2">
              Bos birakilirsa surekli gecerli olur
            </div>
          </div>

          {/* Items (Read-only in form, managed separately) */}
          {initialValues && items.length > 0 && (
            <>
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
              <div>
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <DollarOutlined className="mr-1" /> Urun Fiyatlari ({items.length})
                </Text>
                <Table
                  columns={itemColumns}
                  dataSource={items}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 5 }}
                />
              </div>
            </>
          )}
        </Col>
      </Row>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
