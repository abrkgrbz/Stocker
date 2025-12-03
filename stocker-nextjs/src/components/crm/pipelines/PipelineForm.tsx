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
  Button,
  Card,
  Tag,
} from 'antd';
import {
  FunnelPlotOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StarOutlined,
} from '@ant-design/icons';
import type { Pipeline } from '@/lib/api/services/crm.service';

const { TextArea } = Input;
const { Text } = Typography;

// Stage color options
const STAGE_COLORS = [
  { value: '#1890ff', label: 'Mavi' },
  { value: '#52c41a', label: 'Yeşil' },
  { value: '#faad14', label: 'Turuncu' },
  { value: '#f5222d', label: 'Kırmızı' },
  { value: '#722ed1', label: 'Mor' },
  { value: '#13c2c2', label: 'Cyan' },
  { value: '#eb2f96', label: 'Pembe' },
  { value: '#fa8c16', label: 'Gold' },
];

// Pipeline type options
const pipelineTypeOptions = [
  { value: 'Sales', label: 'Satış' },
  { value: 'Lead', label: 'Potansiyel Müşteri' },
  { value: 'Deal', label: 'Fırsat' },
  { value: 'Custom', label: 'Özel' },
];

// Default stages for new pipelines
const DEFAULT_STAGES = [
  { name: 'Yeni Fırsat', probability: 10, color: '#1890ff', isWon: false, isLost: false },
  { name: 'Teklif Hazırlama', probability: 30, color: '#52c41a', isWon: false, isLost: false },
  { name: 'Müzakere', probability: 60, color: '#faad14', isWon: false, isLost: false },
  { name: 'Kazanıldı', probability: 100, color: '#52c41a', isWon: true, isLost: false },
];

interface PipelineFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: Pipeline;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function PipelineForm({ form, initialValues, onFinish, loading }: PipelineFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
      setIsDefault((initialValues as any).isDefault ?? false);
    } else {
      form.setFieldsValue({
        type: 'Deal',
        isActive: true,
        isDefault: false,
        stages: DEFAULT_STAGES,
      });
    }
  }, [form, initialValues]);

  const handleFormFinish = (values: any) => {
    // Ensure stages have proper order
    if (values.stages) {
      values.stages = values.stages.map((stage: any, index: number) => ({
        ...stage,
        order: index + 1,
        color: stage.color || '#1890ff',
      }));
    }
    onFinish(values);
  };

  const handleUseDefaultStages = () => {
    form.setFieldsValue({ stages: DEFAULT_STAGES });
  };

  // Watch stages for statistics
  const stages = Form.useWatch('stages', form) || [];
  const stageCount = stages.length;
  const wonStage = stages.find((s: any) => s?.isWon);
  const lostStage = stages.find((s: any) => s?.isLost);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormFinish}
      disabled={loading}
      className="pipeline-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Pipeline Visual Representation */}
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
              <FunnelPlotOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Satış Süreci
              </p>
              <p className="text-sm text-white/60">
                Fırsatlarınızın aşamalarını yönetin
              </p>
            </div>
          </div>

          {/* Pipeline Stats */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Pipeline Özeti
            </Text>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-blue-600">
                  {stageCount}
                </div>
                <div className="text-xs text-gray-500 mt-1">Aşama</div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-green-600">
                  {wonStage ? '✓' : '-'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Kazanıldı Aşaması</div>
              </div>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">Durum</Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isActive ? 'Pipeline aktif ve kullanılabilir' : 'Pipeline pasif durumda'}
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

            <div className="flex items-center justify-between p-4 bg-yellow-50/50 rounded-xl border border-yellow-200">
              <div>
                <Text strong className="text-gray-700">
                  <StarOutlined className="mr-1 text-yellow-500" /> Varsayılan Pipeline
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  Yeni kayıtlar için varsayılan olarak kullanılsın
                </div>
              </div>
              <Form.Item name="isDefault" valuePropName="checked" noStyle initialValue={false}>
                <Switch
                  checked={isDefault}
                  onChange={(val) => {
                    setIsDefault(val);
                    form.setFieldValue('isDefault', val);
                  }}
                  checkedChildren="Evet"
                  unCheckedChildren="Hayır"
                  style={{
                    backgroundColor: isDefault ? '#faad14' : '#d9d9d9',
                    minWidth: '70px'
                  }}
                />
              </Form.Item>
            </div>
          </div>
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Pipeline Name - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Pipeline adı zorunludur' },
                { max: 100, message: 'En fazla 100 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Pipeline adı (örn: Kurumsal Satış Süreci)"
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
                placeholder="Pipeline hakkında açıklama..."
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
              <Col span={24}>
                <div className="text-xs text-gray-400 mb-1">Pipeline Tipi *</div>
                <Form.Item
                  name="type"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Select
                    placeholder="Tip seçin"
                    options={pipelineTypeOptions}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Stages Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                <FunnelPlotOutlined className="mr-1" /> Pipeline Aşamaları
              </Text>
              <Button size="small" type="link" onClick={handleUseDefaultStages}>
                Varsayılan Aşamaları Kullan
              </Button>
            </div>

            <Form.List
              name="stages"
              rules={[
                {
                  validator: async (_, stages) => {
                    if (!stages || stages.length === 0) {
                      return Promise.reject(new Error('En az 1 aşama eklemelisiniz'));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {fields.map((field, index) => (
                      <Card
                        key={field.key}
                        size="small"
                        className="bg-gray-50/50"
                        title={
                          <div className="flex items-center gap-2">
                            <Tag color="blue">#{index + 1}</Tag>
                            <span className="text-sm font-medium">
                              {Form.useWatch(['stages', field.name, 'name'], form) || `Aşama ${index + 1}`}
                            </span>
                          </div>
                        }
                        extra={
                          fields.length > 1 && (
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => remove(field.name)}
                            />
                          )
                        }
                      >
                        <div className="space-y-3">
                          <Row gutter={12}>
                            <Col span={12}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'name']}
                                rules={[{ required: true, message: 'Gerekli' }]}
                                className="mb-0"
                              >
                                <Input placeholder="Aşama adı" variant="filled" />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'probability']}
                                rules={[{ required: true, message: 'Gerekli' }]}
                                className="mb-0"
                              >
                                <InputNumber
                                  placeholder="%"
                                  min={0}
                                  max={100}
                                  style={{ width: '100%' }}
                                  variant="filled"
                                  addonAfter="%"
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'color']}
                                initialValue="#1890ff"
                                className="mb-0"
                              >
                                <Select variant="filled">
                                  {STAGE_COLORS.map((c) => (
                                    <Select.Option key={c.value} value={c.value}>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-3 h-3 rounded"
                                          style={{ backgroundColor: c.value }}
                                        />
                                        {c.label}
                                      </div>
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>

                          <div className="flex gap-4">
                            <Form.Item
                              {...field}
                              name={[field.name, 'isWon']}
                              valuePropName="checked"
                              className="mb-0"
                            >
                              <div className="flex items-center gap-2 p-2 border rounded-lg bg-green-50/50 cursor-pointer">
                                <Switch size="small" />
                                <span className="text-xs">
                                  <CheckCircleOutlined className="text-green-500 mr-1" />
                                  Kazanıldı
                                </span>
                              </div>
                            </Form.Item>

                            <Form.Item
                              {...field}
                              name={[field.name, 'isLost']}
                              valuePropName="checked"
                              className="mb-0"
                            >
                              <div className="flex items-center gap-2 p-2 border rounded-lg bg-red-50/50 cursor-pointer">
                                <Switch size="small" />
                                <span className="text-xs">
                                  <CloseCircleOutlined className="text-red-500 mr-1" />
                                  Kaybedildi
                                </span>
                              </div>
                            </Form.Item>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button
                    type="dashed"
                    onClick={() =>
                      add({ name: '', probability: 50, color: '#1890ff', isWon: false, isLost: false })
                    }
                    block
                    icon={<PlusOutlined />}
                    className="mt-3"
                  >
                    Yeni Aşama Ekle
                  </Button>
                </>
              )}
            </Form.List>
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
