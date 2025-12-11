'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Segmented,
  DatePicker,
} from 'antd';
import {
  PhoneOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { CallLogDto } from '@/lib/api/services/crm.types';
import { CallDirection, CallType, CallOutcome } from '@/lib/api/services/crm.types';
import { useCustomers } from '@/lib/api/hooks/useCRM';

const { TextArea } = Input;
const { Text } = Typography;

// Call direction options
const directionOptions = [
  { value: CallDirection.Inbound, label: '📥 Gelen' },
  { value: CallDirection.Outbound, label: '📤 Giden' },
];

// Call type options
const callTypeOptions = [
  { value: CallType.Standard, label: 'Standart' },
  { value: CallType.Sales, label: 'Satış' },
  { value: CallType.Support, label: 'Destek' },
  { value: CallType.FollowUp, label: 'Takip' },
  { value: CallType.Campaign, label: 'Kampanya' },
  { value: CallType.Conference, label: 'Konferans' },
  { value: CallType.Callback, label: 'Geri Arama' },
];

// Call outcome options
const outcomeOptions = [
  { value: CallOutcome.Successful, label: 'Başarılı' },
  { value: CallOutcome.NoAnswer, label: 'Cevapsız' },
  { value: CallOutcome.Busy, label: 'Meşgul' },
  { value: CallOutcome.LeftVoicemail, label: 'Sesli Mesaj Bırakıldı' },
  { value: CallOutcome.WrongNumber, label: 'Yanlış Numara' },
  { value: CallOutcome.CallbackRequested, label: 'Geri Arama İstendi' },
  { value: CallOutcome.NotInterested, label: 'İlgilenmedi' },
  { value: CallOutcome.InformationProvided, label: 'Bilgi Verildi' },
  { value: CallOutcome.AppointmentScheduled, label: 'Randevu Alındı' },
  { value: CallOutcome.SaleMade, label: 'Satış Yapıldı' },
  { value: CallOutcome.ComplaintReceived, label: 'Şikayet Alındı' },
  { value: CallOutcome.IssueResolved, label: 'Sorun Çözüldü' },
  { value: CallOutcome.Abandoned, label: 'İptal Edildi' },
  { value: CallOutcome.Transferred, label: 'Transfer Edildi' },
];

interface CallLogFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: CallLogDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function CallLogForm({ form, initialValues, onFinish, loading }: CallLogFormProps) {
  const [direction, setDirection] = useState<CallDirection>(CallDirection.Outbound);
  const { data: customersData } = useCustomers({ pageSize: 100 });
  const customers = customersData?.items || [];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
      setDirection(initialValues.direction || CallDirection.Outbound);
    } else {
      form.setFieldsValue({
        direction: CallDirection.Outbound,
        callType: CallType.Standard,
      });
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="call-log-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Call Log Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PhoneOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Arama Kaydı
              </p>
              <p className="text-sm text-white/60">
                Müşteri aramalarını kaydedin
              </p>
            </div>
          </div>

          {/* Direction Selection */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <PhoneOutlined className="mr-1" /> Arama Yönü
            </Text>
            <Form.Item name="direction" className="mb-0" initialValue={CallDirection.Outbound}>
              <Segmented
                block
                options={directionOptions}
                value={direction}
                onChange={(val) => {
                  setDirection(val as CallDirection);
                  form.setFieldValue('direction', val);
                }}
                className="w-full"
              />
            </Form.Item>
          </div>

          {/* Call Type */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Arama Tipi
            </Text>
            <Form.Item name="callType" className="mb-0" initialValue={CallType.Standard}>
              <Select
                options={callTypeOptions}
                variant="filled"
                size="large"
                className="w-full"
              />
            </Form.Item>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.durationSeconds ? Math.floor(initialValues.durationSeconds / 60) : 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Dakika</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {outcomeOptions.find(o => o.value === initialValues.outcome)?.label || '-'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Sonuç</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Phone Numbers - Hero Inputs */}
          <div className="mb-8">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="callerNumber"
                  rules={[
                    { required: true, message: 'Arayan numara zorunludur' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Arayan Numara"
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
              </Col>
              <Col span={12}>
                <Form.Item
                  name="calledNumber"
                  rules={[
                    { required: true, message: 'Aranan numara zorunludur' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Aranan Numara"
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
              </Col>
            </Row>
            <Form.Item name="notes" className="mb-0 mt-2">
              <TextArea
                placeholder="Arama hakkında notlar ekleyin..."
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

          {/* Customer Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <UserOutlined className="mr-1" /> Müşteri Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={24}>
                <div className="text-xs text-gray-400 mb-1">Müşteri</div>
                <Form.Item name="customerId" className="mb-3">
                  <Select
                    placeholder="Müşteri seçin (opsiyonel)"
                    variant="filled"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={customers.map(c => ({ value: c.id, label: c.companyName }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Outcome Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <FileTextOutlined className="mr-1" /> Sonuç Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Sonuç</div>
                <Form.Item name="outcome" className="mb-3">
                  <Select
                    placeholder="Sonuç seçin"
                    options={outcomeOptions}
                    variant="filled"
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Sonuç Açıklaması</div>
                <Form.Item name="outcomeDescription" className="mb-3">
                  <Input
                    placeholder="Sonuç detayları"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Follow-up Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <ClockCircleOutlined className="mr-1" /> Takip Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Takip Tarihi</div>
                <Form.Item name="followUpDate" className="mb-3">
                  <DatePicker
                    placeholder="Takip tarihi seçin"
                    variant="filled"
                    className="w-full"
                    showTime
                    format="DD.MM.YYYY HH:mm"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Takip Notu</div>
                <Form.Item name="followUpNote" className="mb-3">
                  <Input
                    placeholder="Takip notu"
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
