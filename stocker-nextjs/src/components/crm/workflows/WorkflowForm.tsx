'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Radio,
  Alert,
  Space,
} from 'antd';
import {
  ThunderboltOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { WorkflowDto, WorkflowTriggerType } from '@/lib/api/services/crm.types';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

// Entity types from backend
const entityTypes = [
  { value: 'Account', label: 'Hesap' },
  { value: 'Contact', label: 'Iletisim' },
  { value: 'Customer', label: 'Musteri' },
  { value: 'Lead', label: 'Potansiyel Musteri' },
  { value: 'Opportunity', label: 'Firsat' },
  { value: 'Deal', label: 'Anlasma' },
  { value: 'Quote', label: 'Teklif' },
  { value: 'Contract', label: 'Sozlesme' },
  { value: 'Ticket', label: 'Destek Talebi' },
  { value: 'Campaign', label: 'Kampanya' },
];

// Trigger type options
const triggerTypeOptions = [
  { value: 'Manual', label: 'Manuel - Elle Baslatilir', icon: '🖱️' },
  { value: 'Scheduled', label: 'Zamanlanmis - Belirli zamanlarda', icon: '⏰' },
  { value: 'OnCreate', label: 'Kayit Olusturuldugunda', icon: '➕' },
  { value: 'OnUpdate', label: 'Kayit Guncellendiginde', icon: '✏️' },
  { value: 'OnStatusChange', label: 'Durum Degistiginde', icon: '🔄' },
];

interface WorkflowFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: WorkflowDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function WorkflowForm({ form, initialValues, onFinish, loading }: WorkflowFormProps) {
  const [isActive, setIsActive] = useState(false);
  const [selectedTriggerType, setSelectedTriggerType] = useState<string>('Manual');

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
        triggerType: initialValues.triggerType,
        entityType: initialValues.entityType,
        isActive: initialValues.isActive,
      });
      setIsActive(initialValues.isActive ?? false);
      setSelectedTriggerType(initialValues.triggerType || 'Manual');
    } else {
      form.setFieldsValue({
        triggerType: 'Manual',
        isActive: false,
      });
    }
  }, [form, initialValues]);

  const handleFormFinish = (values: any) => {
    onFinish(values);
  };

  const handleTriggerTypeChange = (value: string) => {
    setSelectedTriggerType(value);
    if (value === 'Manual' || value === 'Scheduled') {
      form.setFieldsValue({ entityType: undefined });
    }
  };

  const requiresEntityType = (triggerType: string) => {
    return !['Manual', 'Scheduled'].includes(triggerType);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormFinish}
      disabled={loading}
      className="workflow-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Workflow Visual Representation */}
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
              <ThunderboltOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Otomasyon
              </p>
              <p className="text-sm text-white/60">
                Is akislarinizi otomatiklestirin
              </p>
            </div>
          </div>

          {/* Status Info */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Workflow Durumu
            </Text>
            <div className="p-4 bg-gray-50/50 rounded-xl">
              <Form.Item name="isActive" className="mb-0" initialValue={false}>
                <Radio.Group
                  onChange={(e) => setIsActive(e.target.value)}
                  value={isActive}
                >
                  <Space direction="vertical">
                    <Radio value={false}>
                      <Space>
                        <InfoCircleOutlined />
                        <span>Taslak - Test icin kullanilabilir</span>
                      </Space>
                    </Radio>
                    <Radio value={true}>
                      <Space>
                        <ThunderboltOutlined />
                        <span>Aktif - Otomatik calisir</span>
                      </Space>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </div>
          </div>

          {/* Trigger Type Info */}
          <Alert
            type="info"
            message="Bilgi"
            description="Workflow olusturduktan sonra detay sayfasindan tetikleyici kosullarini ve aksiyonlari yapilandirabilirsiniz."
            showIcon
          />
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Workflow Name - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Workflow adi zorunludur' },
                { min: 3, message: 'En az 3 karakter' },
                { max: 100, message: 'En fazla 100 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Workflow adi (orn: Musteri hos geldin e-postasi)"
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
            <Form.Item
              name="description"
              rules={[
                { required: true, message: 'Aciklama zorunludur' },
                { min: 10, message: 'En az 10 karakter' },
                { max: 500, message: 'En fazla 500 karakter' },
              ]}
              className="mb-0 mt-2"
            >
              <TextArea
                placeholder="Workflow'un ne yaptigini aciklayin..."
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

          {/* Trigger Type */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Tetikleyici Tipi
            </Text>
            <Form.Item
              name="triggerType"
              rules={[{ required: true, message: 'Tetikleyici tipi zorunludur' }]}
              className="mb-3"
            >
              <Select
                placeholder="Workflow'un nasil tetiklenecegini secin"
                onChange={handleTriggerTypeChange}
                size="large"
                variant="filled"
              >
                {triggerTypeOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    <Space>
                      <span>{opt.icon}</span>
                      <strong>{opt.value}</strong>
                      <span className="text-gray-500">- {opt.label}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Info boxes for each trigger type */}
            {selectedTriggerType === 'Manual' && (
              <Alert
                type="info"
                message="Manuel Tetikleyici"
                description="Bu workflow otomatik calismaz. Kullanici tarafindan manuel olarak baslatilmasi gerekir."
                showIcon
              />
            )}

            {selectedTriggerType === 'Scheduled' && (
              <Alert
                type="info"
                message="Zamanlanmis Tetikleyici"
                description="Workflow'un ne zaman calisacagini (gunluk, haftalik, aylik vb.) detay sayfasindan ayarlayabilirsiniz."
                showIcon
              />
            )}

            {(selectedTriggerType === 'OnCreate' || selectedTriggerType === 'OnUpdate' || selectedTriggerType === 'OnStatusChange') && (
              <Alert
                type="info"
                message="Olay Bazli Tetikleyici"
                description="Secilen entity tipinde bir islem yapildiginda workflow calisir. Detayli kosullari olusturma sonrasi ayarlayabilirsiniz."
                showIcon
              />
            )}
          </div>

          {/* Entity Type - Only for event-based triggers */}
          {requiresEntityType(selectedTriggerType) && (
            <>
              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  Entity Tipi
                </Text>
                <Form.Item
                  name="entityType"
                  rules={[{ required: true, message: 'Entity tipi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Workflow'un calisacagi entity tipini secin"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    size="large"
                    variant="filled"
                  >
                    {entityTypes.map((type) => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
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
