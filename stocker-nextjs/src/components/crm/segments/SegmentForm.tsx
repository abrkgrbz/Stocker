'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Switch,
  ColorPicker,
  Tag,
  Segmented,
} from 'antd';
import {
  TeamOutlined,
  ApartmentOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { CustomerSegment } from '@/lib/api/services/crm.service';
import { RuleBuilder } from './RuleBuilder';

const { TextArea } = Input;
const { Text } = Typography;

// Segment type options
const segmentTypeOptions = [
  { value: 'Static', label: 'Statik (Manuel)' },
  { value: 'Dynamic', label: 'Dinamik (Otomatik)' },
];

// Preset colors
const PRESET_COLORS = [
  '#1890ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#fa8c16',
];

interface SegmentFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: CustomerSegment;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function SegmentForm({ form, initialValues, onFinish, loading }: SegmentFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [segmentType, setSegmentType] = useState<'Static' | 'Dynamic'>('Static');
  const [selectedColor, setSelectedColor] = useState('#1890ff');

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
      setSegmentType((initialValues.type as 'Static' | 'Dynamic') || 'Static');
      setSelectedColor(initialValues.color || '#1890ff');
    } else {
      form.setFieldsValue({
        type: 'Static',
        isActive: true,
        color: '#1890ff',
      });
    }
  }, [form, initialValues]);

  const handleFormFinish = (values: any) => {
    // Handle color picker value
    if (values.color && typeof values.color === 'object') {
      values.color = values.color.toHexString();
    }
    onFinish(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormFinish}
      disabled={loading}
      className="segment-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Segment Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: `linear-gradient(135deg, ${selectedColor} 0%, ${selectedColor}dd 100%)`,
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TeamOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Müşteri Segmenti
              </p>
              <p className="text-sm text-white/60">
                Doğru kişilere doğru mesajı gönderin
              </p>
            </div>
          </div>

          {/* Segment Type Selection */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <ApartmentOutlined className="mr-1" /> Segment Tipi
            </Text>
            <Form.Item
              name="type"
              rules={[{ required: true, message: 'Segment tipi zorunludur' }]}
              className="mb-0"
              initialValue="Static"
            >
              <Segmented
                block
                options={[
                  {
                    value: 'Static',
                    label: (
                      <div className="py-2">
                        <div className="font-medium">Statik</div>
                        <div className="text-xs text-gray-500">Manuel ekleme</div>
                      </div>
                    ),
                  },
                  {
                    value: 'Dynamic',
                    label: (
                      <div className="py-2">
                        <div className="font-medium">Dinamik</div>
                        <div className="text-xs text-gray-500">Otomatik güncelleme</div>
                      </div>
                    ),
                  },
                ]}
                value={segmentType}
                onChange={(val) => {
                  setSegmentType(val as 'Static' | 'Dynamic');
                  form.setFieldValue('type', val);
                }}
              />
            </Form.Item>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Segment Rengi
            </Text>
            <Form.Item name="color" className="mb-0" initialValue="#1890ff">
              <ColorPicker
                showText
                format="hex"
                presets={[
                  {
                    label: 'Önerilen',
                    colors: PRESET_COLORS,
                  },
                ]}
                onChange={(color) => {
                  const hexColor = color.toHexString();
                  setSelectedColor(hexColor);
                  form.setFieldValue('color', hexColor);
                }}
              />
            </Form.Item>
          </div>

          {/* Status Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">Durum</Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isActive ? 'Segment aktif ve kullanılabilir' : 'Segment pasif durumda'}
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

          {/* Edit Mode Stats */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.memberCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Üye Sayısı</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  <Tag color={segmentType === 'Dynamic' ? 'processing' : 'default'}>
                    {segmentType === 'Dynamic' ? 'Dinamik' : 'Statik'}
                  </Tag>
                </div>
                <div className="text-xs text-gray-500 mt-1">Tip</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Segment Name - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Segment adı zorunludur' },
                { max: 100, message: 'En fazla 100 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Segment adı (örn: VIP Müşteriler)"
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
                placeholder="Segment hakkında açıklama..."
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

          {/* Criteria Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <UserOutlined className="mr-1" /> Segment Kriterleri
            </Text>

            {segmentType === 'Dynamic' ? (
              <>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">Dinamik Segment</h4>
                  <p className="text-sm text-blue-800">
                    Dinamik segmentler belirlediğiniz kriterlere göre otomatik olarak güncellenir.
                    Kriterlere uyan yeni müşteriler otomatik olarak eklenir.
                  </p>
                </div>

                <Form.Item
                  name="criteria"
                  rules={[{ required: segmentType === 'Dynamic', message: 'En az bir kriter eklemelisiniz' }]}
                >
                  <RuleBuilder />
                </Form.Item>
              </>
            ) : (
              <>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Statik Segment</h4>
                  <p className="text-sm text-gray-600">
                    Statik segmentlere müşterileri manuel olarak ekleyeceksiniz. Segment oluşturduktan sonra
                    müşteri listesinden istediğiniz müşterileri bu segmente ekleyebilirsiniz.
                  </p>
                </div>

                <Form.Item name="criteria" initialValue="{}" hidden>
                  <Input type="hidden" />
                </Form.Item>
              </>
            )}
          </div>

          {/* Info Section for Dynamic */}
          {segmentType === 'Dynamic' && (
            <>
              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-1">Dinamik Segment Bilgisi</h4>
                <p className="text-sm text-yellow-800">
                  Dinamik segmentler her gün otomatik olarak güncellenir. Kriterlere uyan yeni müşteriler
                  otomatik olarak eklenir, uymayanlar çıkarılır.
                </p>
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
