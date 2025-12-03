'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Row,
  Col,
  Typography,
} from 'antd';
import {
  DollarOutlined,
  PercentageOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { Deal, Pipeline } from '@/lib/api/services/crm.service';
import { useCustomers, usePipelines } from '@/lib/api/hooks/useCRM';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

// Status options
const statusOptions = [
  { value: 'Open', label: 'Acik' },
  { value: 'Won', label: 'Kazanildi' },
  { value: 'Lost', label: 'Kaybedildi' },
];

// Priority options
const priorityOptions = [
  { value: 'Low', label: 'Dusuk' },
  { value: 'Medium', label: 'Orta' },
  { value: 'High', label: 'Yuksek' },
  { value: 'Urgent', label: 'Acil' },
];

interface DealFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: Deal;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function DealForm({ form, initialValues, onFinish, loading }: DealFormProps) {
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  // Fetch data
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: pipelines = [], isLoading: pipelinesLoading } = usePipelines();
  const customers = customersData?.items || [];

  // Get stages from selected pipeline
  const stages = selectedPipeline
    ? pipelines.find((p) => p.id === selectedPipeline)?.stages || []
    : [];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        expectedCloseDate: initialValues.expectedCloseDate ? dayjs(initialValues.expectedCloseDate) : null,
      });
      setSelectedPipeline(initialValues.pipelineId || null);
      setIsOpen(initialValues.status === 'Open');
    } else {
      // Set defaults for new deal
      const defaultPipeline = pipelines.find((p) => p.isDefault) || pipelines[0];
      if (defaultPipeline) {
        setSelectedPipeline(defaultPipeline.id);
        form.setFieldsValue({
          pipelineId: defaultPipeline.id,
          stageId: defaultPipeline.stages?.[0]?.id,
          status: 'Open',
          probability: 50,
          priority: 'Medium',
        });
      }
    }
  }, [form, initialValues, pipelines]);

  const handleFormFinish = (values: any) => {
    // Ensure date is properly formatted
    if (values.expectedCloseDate) {
      values.expectedCloseDate = values.expectedCloseDate.toISOString();
    }
    onFinish(values);
  };

  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipeline(pipelineId);
    const pipeline = pipelines.find((p) => p.id === pipelineId);
    if (pipeline?.stages?.length) {
      form.setFieldsValue({ stageId: pipeline.stages[0].id });
    } else {
      form.setFieldsValue({ stageId: undefined });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormFinish}
      disabled={loading}
      className="deal-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Deal Visual Representation */}
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
                Satis Firsati
              </p>
              <p className="text-sm text-white/60">
                Potansiyel gelir ve satis takibi
              </p>
            </div>
          </div>

          {/* Deal Summary */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Firsat Ozeti
            </Text>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-pink-50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-pink-600">
                  {isOpen ? 'Acik' : 'Kapali'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Durum</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-purple-600">
                  {stages.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Pipeline Asamasi</div>
              </div>
            </div>
          </div>

          {/* Customer Selection */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <UserOutlined className="mr-1" /> Musteri Bilgisi
            </Text>
            <div className="p-4 bg-gray-50/50 rounded-xl">
              <Form.Item
                name="customerId"
                rules={[{ required: true, message: 'Musteri secimi zorunludur' }]}
                className="mb-0"
              >
                <Select
                  placeholder="Musteri seciniz"
                  showSearch
                  loading={customersLoading}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={customers.map((customer) => ({
                    label: customer.customerName,
                    value: customer.id,
                  }))}
                  variant="filled"
                  size="large"
                />
              </Form.Item>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-50/50 rounded-xl">
              <div className="text-xs text-gray-400 mb-2">Durum</div>
              <Form.Item name="status" className="mb-0" initialValue="Open">
                <Select
                  options={statusOptions}
                  variant="filled"
                  onChange={(value) => setIsOpen(value === 'Open')}
                />
              </Form.Item>
            </div>

            <div className="p-4 bg-gray-50/50 rounded-xl">
              <div className="text-xs text-gray-400 mb-2">Oncelik</div>
              <Form.Item name="priority" className="mb-0" initialValue="Medium">
                <Select options={priorityOptions} variant="filled" />
              </Form.Item>
            </div>
          </div>
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Deal Title - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="title"
              rules={[
                { required: true, message: 'Firsat basligi zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Firsat basligi (orn: Yillik Yazilim Lisansi)"
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
                placeholder="Firsat hakkinda aciklama..."
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
              Finansal Bilgiler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Tutar (TL) *</div>
                <Form.Item
                  name="amount"
                  rules={[{ required: true, message: 'Tutar zorunludur' }]}
                  className="mb-3"
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    variant="filled"
                    prefix="TL"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/TL\s?|(,*)/g, '') as any}
                    placeholder="0"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Olasilik (%) *</div>
                <Form.Item
                  name="probability"
                  rules={[{ required: true, message: 'Olasilik zorunludur' }]}
                  className="mb-3"
                  initialValue={50}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    variant="filled"
                    prefix={<PercentageOutlined className="text-gray-400" />}
                    placeholder="50"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Pipeline & Stage */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Satis Sureci
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Pipeline *</div>
                <Form.Item
                  name="pipelineId"
                  rules={[{ required: true, message: 'Pipeline zorunludur' }]}
                  className="mb-3"
                >
                  <Select
                    placeholder="Pipeline seciniz"
                    loading={pipelinesLoading}
                    onChange={handlePipelineChange}
                    variant="filled"
                  >
                    {pipelines.map((pipeline) => (
                      <Select.Option key={pipeline.id} value={pipeline.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{pipeline.name}</span>
                          <span className="text-gray-500 text-xs">({pipeline.stages?.length || 0} asama)</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Asama *</div>
                <Form.Item
                  name="stageId"
                  rules={[{ required: true, message: 'Asama zorunludur' }]}
                  className="mb-3"
                >
                  <Select
                    placeholder={selectedPipeline ? "Asama seciniz" : "Once pipeline seciniz"}
                    disabled={!selectedPipeline}
                    variant="filled"
                  >
                    {stages.map((stage) => (
                      <Select.Option key={stage.id} value={stage.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                          <span>{stage.name}</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Expected Close Date */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Tahmini Kapanis
            </Text>
            <div className="text-xs text-gray-400 mb-1">Tahmini Kapanis Tarihi *</div>
            <Form.Item
              name="expectedCloseDate"
              rules={[{ required: true, message: 'Tahmini kapanis tarihi zorunludur' }]}
              className="mb-0"
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                variant="filled"
                placeholder="Tarih seciniz"
                size="large"
                disabledDate={(current) => {
                  return current && current < dayjs().startOf('day');
                }}
              />
            </Form.Item>
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
