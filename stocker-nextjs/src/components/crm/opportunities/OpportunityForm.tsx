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
  DatePicker,
  Slider,
} from 'antd';
import {
  DollarOutlined,
  PercentageOutlined,
  CalendarOutlined,
  UserOutlined,
  FlagOutlined,
} from '@ant-design/icons';
import { useCustomers, usePipelines } from '@/lib/api/hooks/useCRM';
import type { OpportunityDto, OpportunityStatus } from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

// Opportunity status options
const statusOptions = [
  { value: 'Prospecting', label: '🔍 Araştırma' },
  { value: 'Qualification', label: '📋 Nitelendirme' },
  { value: 'NeedsAnalysis', label: '📊 İhtiyaç Analizi' },
  { value: 'Proposal', label: '📄 Teklif' },
  { value: 'Negotiation', label: '🤝 Müzakere' },
  { value: 'ClosedWon', label: '✅ Kazanıldı' },
  { value: 'ClosedLost', label: '❌ Kaybedildi' },
];

interface OpportunityFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: OpportunityDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function OpportunityForm({ form, initialValues, onFinish, loading }: OpportunityFormProps) {
  const [probability, setProbability] = useState(50);
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);

  // Fetch customers and pipelines
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: pipelines = [] } = usePipelines();

  const customers = customersData?.items || [];

  // Get stages from selected pipeline
  const stages = selectedPipeline
    ? (pipelines as any[]).find((p: any) => p.id === selectedPipeline)?.stages || []
    : [];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        expectedCloseDate: initialValues.expectedCloseDate ? dayjs(initialValues.expectedCloseDate) : null,
      });
      setProbability(initialValues.probability || 50);
      setAmount(initialValues.amount || 0);
      if (initialValues.pipelineId) {
        setSelectedPipeline(initialValues.pipelineId);
      }
    } else {
      form.setFieldsValue({
        probability: 50,
        status: 'Prospecting',
      });
    }
  }, [form, initialValues]);

  // Calculate expected value
  const expectedValue = (amount * probability) / 100;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="opportunity-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Opportunity Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                Satış Fırsatı
              </p>
              <p className="text-sm text-white/60">
                Potansiyel satış fırsatlarını yönetin
              </p>
            </div>
          </div>

          {/* Probability Slider */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <PercentageOutlined className="mr-1" /> Olasılık
            </Text>
            <div className="p-4 bg-gray-50/50 rounded-xl">
              <Form.Item name="probability" className="mb-2" initialValue={50}>
                <Slider
                  min={0}
                  max={100}
                  marks={{
                    0: '0%',
                    25: '25%',
                    50: '50%',
                    75: '75%',
                    100: '100%',
                  }}
                  value={probability}
                  onChange={(val) => {
                    setProbability(val);
                    form.setFieldValue('probability', val);
                  }}
                  tooltip={{ formatter: (val) => `${val}%` }}
                />
              </Form.Item>
              <div className="text-center text-2xl font-bold text-gray-800">
                %{probability}
              </div>
            </div>
          </div>

          {/* Expected Value Calculation */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Beklenen Değer
            </Text>
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600">
                ₺{expectedValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Tutar × Olasılık = Beklenen Gelir
              </div>
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  ₺{(initialValues.amount || 0).toLocaleString('tr-TR')}
                </div>
                <div className="text-xs text-gray-500 mt-1">Tutar</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  %{initialValues.probability || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Olasılık</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Opportunity Name - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Fırsat adı zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Fırsat adı (örn: Kurumsal CRM Satışı)"
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
                placeholder="Fırsat hakkında detaylar ekleyin..."
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

          {/* Financial Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <DollarOutlined className="mr-1" /> Finansal Bilgiler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Tutar (₺) *</div>
                <Form.Item
                  name="amount"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    variant="filled"
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/₺\s?|(,*)/g, '') as any}
                    placeholder="0"
                    size="large"
                    onChange={(val) => setAmount(val || 0)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Durum *</div>
                <Form.Item
                  name="status"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                  initialValue="Prospecting"
                >
                  <Select
                    options={statusOptions}
                    variant="filled"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Customer & Date */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <UserOutlined className="mr-1" /> Müşteri ve Tarih
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Müşteri *</div>
                <Form.Item
                  name="customerId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Select
                    placeholder="Müşteri seçin"
                    variant="filled"
                    size="large"
                    showSearch
                    loading={customersLoading}
                    optionFilterProp="label"
                    options={customers.map((c: any) => ({
                      label: c.customerName || c.companyName,
                      value: c.id,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Tahmini Kapanış Tarihi *</div>
                <Form.Item
                  name="expectedCloseDate"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    variant="filled"
                    size="large"
                    placeholder="Tarih seçin"
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Pipeline Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <FlagOutlined className="mr-1" /> Satış Süreci (Opsiyonel)
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Pipeline</div>
                <Form.Item name="pipelineId" className="mb-3">
                  <Select
                    placeholder="Pipeline seçin (opsiyonel)"
                    variant="filled"
                    size="large"
                    allowClear
                    onChange={(val) => {
                      setSelectedPipeline(val);
                      form.setFieldValue('stageId', undefined);
                    }}
                    options={(pipelines as any[]).map((p: any) => ({
                      label: `${p.name} (${p.stages?.length || 0} aşama)`,
                      value: p.id,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Aşama</div>
                <Form.Item name="stageId" className="mb-3">
                  <Select
                    placeholder={selectedPipeline ? 'Aşama seçin' : 'Önce pipeline seçin'}
                    variant="filled"
                    size="large"
                    allowClear
                    disabled={!selectedPipeline}
                    options={stages.map((s: any) => ({
                      label: s.name,
                      value: s.id,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>
            <div className="text-xs text-gray-400 p-3 bg-blue-50 rounded-lg">
              <strong>Bilgi:</strong> Pipeline ve aşama seçimi opsiyoneldir. Fırsatları satış süreçlerine bağlamak için kullanabilirsiniz.
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
