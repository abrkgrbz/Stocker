'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  Typography,
  Switch,
  InputNumber,
  Select,
} from 'antd';
import {
  EnvironmentOutlined,
  HomeOutlined,
  NumberOutlined,
} from '@ant-design/icons';
import { useWarehouses } from '@/lib/api/hooks/useInventory';
import type { LocationDto } from '@/lib/api/services/inventory.types';

const { TextArea } = Input;
const { Text } = Typography;

interface LocationFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: LocationDto;
  onFinish: (values: any) => void;
  loading?: boolean;
  defaultWarehouseId?: number;
}

export default function LocationForm({ form, initialValues, onFinish, loading, defaultWarehouseId }: LocationFormProps) {
  const [isActive, setIsActive] = useState(true);
  const { data: warehouses = [] } = useWarehouses();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
    } else if (defaultWarehouseId) {
      form.setFieldValue('warehouseId', defaultWarehouseId);
    }
  }, [form, initialValues, defaultWarehouseId]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="location-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Location Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EnvironmentOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Lokasyon Bilgileri
              </p>
              <p className="text-sm text-white/60">
                Depo içi konumları tanımlayın
              </p>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">Durum</Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isActive ? 'Lokasyon aktif' : 'Lokasyon pasif durumda'}
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
                  {initialValues.productCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Ürün Sayısı</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.capacity > 0
                    ? Math.round((initialValues.usedCapacity / initialValues.capacity) * 100)
                    : 0}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Doluluk</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Location Name - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Lokasyon adı zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Lokasyon adı"
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
                placeholder="Lokasyon açıklaması ekleyin..."
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
                <div className="text-xs text-gray-400 mb-1">Lokasyon Kodu *</div>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Input
                    placeholder="LOC-001"
                    variant="filled"
                    disabled={!!initialValues}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Depo *</div>
                <Form.Item
                  name="warehouseId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Select
                    placeholder="Depo seçin"
                    variant="filled"
                    disabled={!!initialValues}
                    options={warehouses.map((w) => ({
                      value: w.id,
                      label: (
                        <div className="flex items-center gap-2">
                          <HomeOutlined />
                          {w.name}
                        </div>
                      ),
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Position Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <NumberOutlined className="mr-1" /> Konum Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Koridor</div>
                <Form.Item name="aisle" className="mb-3">
                  <Input placeholder="A" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Raf</div>
                <Form.Item name="shelf" className="mb-3">
                  <Input placeholder="01" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Bölme</div>
                <Form.Item name="bin" className="mb-3">
                  <Input placeholder="001" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Capacity */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Kapasite
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Toplam Kapasite *</div>
                <Form.Item
                  name="capacity"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                  initialValue={100}
                >
                  <InputNumber
                    placeholder="100"
                    variant="filled"
                    min={1}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              {initialValues && (
                <Col span={12}>
                  <div className="text-xs text-gray-400 mb-1">Kullanılan Kapasite</div>
                  <div className="p-3 bg-gray-50 rounded-lg text-lg font-medium text-gray-700">
                    {initialValues.usedCapacity} / {initialValues.capacity}
                  </div>
                </Col>
              )}
            </Row>
          </div>
        </Col>
      </Row>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
