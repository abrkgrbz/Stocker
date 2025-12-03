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
  DatePicker,
  Segmented,
  Progress,
} from 'antd';
import {
  MailOutlined,
  UserAddOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  TrophyOutlined,
  DollarOutlined,
  PhoneOutlined,
  AimOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import type { Campaign } from '@/lib/api/services/crm.service';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;
const { RangePicker } = DatePicker;

// Campaign type options
const campaignTypeOptions = [
  { value: 'Email', label: 'E-posta', icon: <MailOutlined /> },
  { value: 'SocialMedia', label: 'Sosyal Medya', icon: <UserAddOutlined /> },
  { value: 'Webinar', label: 'Webinar', icon: <PlayCircleOutlined /> },
  { value: 'Event', label: 'Etkinlik', icon: <CheckCircleOutlined /> },
  { value: 'Conference', label: 'Konferans', icon: <CalendarOutlined /> },
  { value: 'Advertisement', label: 'Reklam', icon: <TrophyOutlined /> },
  { value: 'Banner', label: 'Banner', icon: <DollarOutlined /> },
  { value: 'Telemarketing', label: 'Telefonla Pazarlama', icon: <PhoneOutlined /> },
  { value: 'PublicRelations', label: 'Halkla İlişkiler', icon: <UserAddOutlined /> },
];

// Campaign status options
const campaignStatusOptions = [
  { value: 'Planned', label: 'Planlandı' },
  { value: 'InProgress', label: 'Devam Ediyor' },
  { value: 'Completed', label: 'Tamamlandı' },
  { value: 'OnHold', label: 'Beklemede' },
  { value: 'Aborted', label: 'İptal Edildi' },
];

interface CampaignFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: Campaign;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function CampaignForm({ form, initialValues, onFinish, loading }: CampaignFormProps) {
  const [campaignType, setCampaignType] = useState<string>('Email');
  const [budgetedCost, setBudgetedCost] = useState<number>(0);
  const [expectedRevenue, setExpectedRevenue] = useState<number>(0);
  const [targetLeads, setTargetLeads] = useState<number>(0);

  useEffect(() => {
    if (initialValues) {
      const formValues = {
        ...initialValues,
        dateRange: initialValues.startDate && initialValues.endDate
          ? [dayjs(initialValues.startDate), dayjs(initialValues.endDate)]
          : undefined,
      };
      form.setFieldsValue(formValues);
      setCampaignType(initialValues.type || 'Email');
      setBudgetedCost(initialValues.budgetedCost || 0);
      setExpectedRevenue(initialValues.expectedRevenue || 0);
      setTargetLeads(initialValues.targetLeads || 0);
    } else {
      form.setFieldsValue({
        status: 'Planned',
        budgetedCost: 0,
        expectedRevenue: 0,
        targetLeads: 0,
      });
    }
  }, [form, initialValues]);

  // Calculate metrics
  const expectedProfit = expectedRevenue - budgetedCost;
  const roi = budgetedCost > 0 ? ((expectedProfit / budgetedCost) * 100) : 0;
  const costPerLead = targetLeads > 0 ? (budgetedCost / targetLeads) : 0;

  const handleFormFinish = (values: any) => {
    // Format dates
    if (values.dateRange) {
      values.startDate = values.dateRange[0].format('YYYY-MM-DD');
      values.endDate = values.dateRange[1].format('YYYY-MM-DD');
      delete values.dateRange;
    }
    onFinish(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormFinish}
      disabled={loading}
      className="campaign-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Metrics (40%) */}
        <Col xs={24} lg={10}>
          {/* Campaign Visual Representation */}
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
              <TrophyOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Pazarlama Kampanyası
              </p>
              <p className="text-sm text-white/60">
                Hedef kitlenize ulaşın ve dönüşüm elde edin
              </p>
            </div>
          </div>

          {/* Campaign Type Selection */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <MailOutlined className="mr-1" /> Kampanya Tipi
            </Text>
            <Form.Item
              name="type"
              rules={[{ required: true, message: 'Kampanya tipi zorunludur' }]}
              className="mb-0"
              initialValue="Email"
            >
              <Select
                size="large"
                placeholder="Tip seçin"
                variant="filled"
                options={campaignTypeOptions.map(opt => ({
                  value: opt.value,
                  label: (
                    <span className="flex items-center gap-2">
                      {opt.icon} {opt.label}
                    </span>
                  ),
                }))}
                onChange={(val) => {
                  setCampaignType(val);
                  form.setFieldValue('type', val);
                }}
              />
            </Form.Item>
          </div>

          {/* ROI Analysis Card */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <CalculatorOutlined className="mr-1" /> Bütçe Analizi
            </Text>
            <div
              className={`p-4 rounded-xl border-2 ${
                expectedProfit >= 0
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="text-center mb-3">
                <div className="text-xs text-gray-500 mb-1">Beklenen Kar</div>
                <div
                  className={`text-3xl font-bold ${
                    expectedProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  ₺{expectedProfit.toLocaleString('tr-TR')}
                </div>
              </div>
              {budgetedCost > 0 && (
                <div className="text-center pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    ROI: <span className="font-bold">{roi.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Target Performance Card */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <AimOutlined className="mr-1" /> Hedef Performans
            </Text>
            <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Hedef Lead</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {targetLeads}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Lead Maliyeti</div>
                  <div className="text-2xl font-bold text-purple-600">
                    ₺{costPerLead.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Mode Stats */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.actualLeads || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Gerçek Lead</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.conversionRate?.toFixed(1) || 0}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Dönüşüm Oranı</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Campaign Name - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Kampanya adı zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Kampanya adı (örn: Yılbaşı İndirimleri)"
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
                placeholder="Kampanya hakkında detaylı açıklama..."
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

          {/* Budget Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <DollarOutlined className="mr-1" /> Bütçe Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Planlanan Bütçe (₺) *</div>
                <Form.Item
                  name="budgetedCost"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="0"
                    variant="filled"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/,/g, '') || 0) as any}
                    onChange={(val) => setBudgetedCost(val || 0)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Beklenen Gelir (₺) *</div>
                <Form.Item
                  name="expectedRevenue"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="0"
                    variant="filled"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/,/g, '') || 0) as any}
                    onChange={(val) => setExpectedRevenue(val || 0)}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Targets Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <AimOutlined className="mr-1" /> Hedefler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Hedef Lead Sayısı *</div>
                <Form.Item
                  name="targetLeads"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="0"
                    variant="filled"
                    onChange={(val) => setTargetLeads(val || 0)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Hedef Kitle</div>
                <Form.Item name="targetAudience" className="mb-3">
                  <Input
                    placeholder="örn: 25-40 yaş profesyoneller"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Schedule Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <CalendarOutlined className="mr-1" /> Zamanlama
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Kampanya Tarihleri *</div>
                <Form.Item
                  name="dateRange"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <RangePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder={['Başlangıç', 'Bitiş']}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Durum *</div>
                <Form.Item
                  name="status"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                  initialValue="Planned"
                >
                  <Select
                    placeholder="Durum seçin"
                    options={campaignStatusOptions}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
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
