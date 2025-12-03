'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Typography,
  Switch,
} from 'antd';
import {
  NumberOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useUnits } from '@/lib/api/hooks/useInventory';
import type { UnitDto } from '@/lib/api/services/inventory.types';

const { Text } = Typography;

interface UnitFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: UnitDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function UnitForm({ form, initialValues, onFinish, loading }: UnitFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [hasBaseUnit, setHasBaseUnit] = useState(false);

  const { data: units = [] } = useUnits(true);

  // Filter out the current unit from base unit options
  const baseUnitOptions = units
    .filter(u => !initialValues || u.id !== initialValues.id)
    .filter(u => !u.baseUnitId) // Only show base units
    .map(u => ({
      value: u.id,
      label: `${u.name} (${u.symbol || u.code})`,
    }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
      setHasBaseUnit(!!initialValues.baseUnitId);
    } else {
      form.setFieldsValue({
        conversionFactor: 1,
      });
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="unit-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Unit Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <NumberOutlined style={{ fontSize: '64px', color: 'rgba(0,0,0,0.6)' }} />
              <p className="mt-4 text-lg font-medium text-gray-700">
                Birim Bilgileri
              </p>
              <p className="text-sm text-gray-500">
                Ürün ölçü birimlerini tanımlayın
              </p>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">Durum</Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isActive ? 'Birim aktif ve kullanılabilir' : 'Birim pasif durumda'}
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

          {/* Derived Units for Edit Mode */}
          {initialValues && initialValues.derivedUnits && initialValues.derivedUnits.length > 0 && (
            <div className="mt-6">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                Türetilmiş Birimler
              </Text>
              <div className="space-y-2">
                {initialValues.derivedUnits.map(du => (
                  <div key={du.id} className="p-3 bg-gray-50/50 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-gray-700">{du.name}</span>
                    <span className="text-xs text-gray-400">x{du.conversionFactor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Unit Name - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Birim adı zorunludur' },
                { max: 100, message: 'En fazla 100 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Birim adı (örn: Kilogram)"
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
                <div className="text-xs text-gray-400 mb-1">Birim Kodu *</div>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Input
                    placeholder="KG"
                    variant="filled"
                    disabled={!!initialValues}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Sembol</div>
                <Form.Item name="symbol" className="mb-3">
                  <Input
                    placeholder="kg"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Conversion */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <SwapOutlined className="mr-1" /> Dönüşüm
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Temel Birim</div>
                <Form.Item name="baseUnitId" className="mb-3">
                  <Select
                    placeholder="Temel birim seçin (opsiyonel)"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    options={baseUnitOptions}
                    onChange={(val) => setHasBaseUnit(!!val)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Dönüşüm Faktörü</div>
                <Form.Item
                  name="conversionFactor"
                  className="mb-3"
                  rules={[
                    { required: hasBaseUnit, message: 'Temel birim seçiliyse gerekli' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0.0001}
                    step={0.01}
                    placeholder="1"
                    variant="filled"
                    disabled={!hasBaseUnit}
                  />
                </Form.Item>
              </Col>
            </Row>
            <div className="text-xs text-gray-400 mt-2 p-3 bg-blue-50 rounded-lg">
              <strong>Örnek:</strong> Eğer temel birim "Kilogram" ve bu birim "Gram" ise, dönüşüm faktörü 0.001 olmalıdır (1 gram = 0.001 kilogram)
            </div>
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
