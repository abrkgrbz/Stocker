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
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { MeetingDto } from '@/lib/api/services/crm.types';
import { MeetingType, MeetingPriority, MeetingLocationType } from '@/lib/api/services/crm.types';
import { useCustomers } from '@/lib/api/hooks/useCRM';

const { TextArea } = Input;
const { Text } = Typography;

// Meeting type options
const meetingTypeOptions = [
  { value: MeetingType.General, label: 'Genel' },
  { value: MeetingType.Sales, label: 'Satış' },
  { value: MeetingType.Demo, label: 'Demo' },
  { value: MeetingType.Presentation, label: 'Sunum' },
  { value: MeetingType.Negotiation, label: 'Müzakere' },
  { value: MeetingType.Contract, label: 'Sözleşme' },
  { value: MeetingType.Kickoff, label: 'Başlangıç' },
  { value: MeetingType.Review, label: 'İnceleme' },
  { value: MeetingType.Planning, label: 'Planlama' },
  { value: MeetingType.Training, label: 'Eğitim' },
  { value: MeetingType.Workshop, label: 'Workshop' },
  { value: MeetingType.Webinar, label: 'Webinar' },
  { value: MeetingType.Conference, label: 'Konferans' },
  { value: MeetingType.OneOnOne, label: 'Birebir' },
  { value: MeetingType.TeamMeeting, label: 'Ekip Toplantısı' },
  { value: MeetingType.BusinessLunch, label: 'İş Yemeği' },
  { value: MeetingType.SiteVisit, label: 'Saha Ziyareti' },
];

// Priority options
const priorityOptions = [
  { value: MeetingPriority.Low, label: '🟢 Düşük' },
  { value: MeetingPriority.Normal, label: '🟡 Normal' },
  { value: MeetingPriority.High, label: '🟠 Yüksek' },
  { value: MeetingPriority.Urgent, label: '🔴 Acil' },
];

// Location type options
const locationTypeOptions = [
  { value: MeetingLocationType.InPerson, label: 'Yüz Yüze' },
  { value: MeetingLocationType.Online, label: 'Online' },
  { value: MeetingLocationType.Hybrid, label: 'Hibrit' },
  { value: MeetingLocationType.Phone, label: 'Telefon' },
];

// Online platform options
const onlinePlatformOptions = [
  { value: 'Zoom', label: 'Zoom' },
  { value: 'MicrosoftTeams', label: 'Microsoft Teams' },
  { value: 'GoogleMeet', label: 'Google Meet' },
  { value: 'Webex', label: 'Webex' },
  { value: 'Skype', label: 'Skype' },
  { value: 'Other', label: 'Diğer' },
];

interface MeetingFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: MeetingDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function MeetingForm({ form, initialValues, onFinish, loading }: MeetingFormProps) {
  const [priority, setPriority] = useState<MeetingPriority>(MeetingPriority.Normal);
  const [locationType, setLocationType] = useState<MeetingLocationType>(MeetingLocationType.InPerson);
  const { data: customersData } = useCustomers({ pageSize: 100 });
  const customers = customersData?.items || [];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
      setPriority(initialValues.priority || MeetingPriority.Normal);
      setLocationType(initialValues.locationType || MeetingLocationType.InPerson);
    } else {
      form.setFieldsValue({
        priority: MeetingPriority.Normal,
        meetingType: MeetingType.General,
        locationType: MeetingLocationType.InPerson,
      });
    }
  }, [form, initialValues]);

  const showOnlineFields = locationType === MeetingLocationType.Online || locationType === MeetingLocationType.Hybrid;
  const showPhysicalFields = locationType === MeetingLocationType.InPerson || locationType === MeetingLocationType.Hybrid;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="meeting-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Meeting Visual Representation */}
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
              <CalendarOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Toplantı
              </p>
              <p className="text-sm text-white/60">
                Toplantılarınızı planlayın
              </p>
            </div>
          </div>

          {/* Priority Selection */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Öncelik
            </Text>
            <Form.Item name="priority" className="mb-0" initialValue={MeetingPriority.Normal}>
              <Segmented
                block
                options={priorityOptions}
                value={priority}
                onChange={(val) => {
                  setPriority(val as MeetingPriority);
                  form.setFieldValue('priority', val);
                }}
                className="w-full"
              />
            </Form.Item>
          </div>

          {/* Meeting Type */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Toplantı Tipi
            </Text>
            <Form.Item name="meetingType" className="mb-0" initialValue={MeetingType.General}>
              <Select
                options={meetingTypeOptions}
                variant="filled"
                size="large"
                className="w-full"
              />
            </Form.Item>
          </div>

          {/* Location Type */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Konum Tipi
            </Text>
            <Form.Item name="locationType" className="mb-0" initialValue={MeetingLocationType.InPerson}>
              <Segmented
                block
                options={locationTypeOptions}
                value={locationType}
                onChange={(val) => {
                  setLocationType(val as MeetingLocationType);
                  form.setFieldValue('locationType', val);
                }}
                className="w-full"
              />
            </Form.Item>
          </div>
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Meeting Title - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="title"
              rules={[
                { required: true, message: 'Başlık zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Toplantı Başlığı"
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
                placeholder="Toplantı hakkında açıklama ekleyin..."
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

          {/* Date & Time */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <CalendarOutlined className="mr-1" /> Tarih ve Saat
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Başlangıç *</div>
                <Form.Item
                  name="startTime"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <DatePicker
                    showTime
                    format="DD.MM.YYYY HH:mm"
                    placeholder="Başlangıç tarihi"
                    variant="filled"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Bitiş *</div>
                <Form.Item
                  name="endTime"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <DatePicker
                    showTime
                    format="DD.MM.YYYY HH:mm"
                    placeholder="Bitiş tarihi"
                    variant="filled"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Location Info */}
          {showPhysicalFields && (
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                <EnvironmentOutlined className="mr-1" /> Konum Bilgileri
              </Text>
              <Row gutter={16}>
                <Col span={12}>
                  <div className="text-xs text-gray-400 mb-1">Adres</div>
                  <Form.Item name="location" className="mb-3">
                    <Input
                      placeholder="Toplantı adresi"
                      variant="filled"
                      prefix={<EnvironmentOutlined className="text-gray-400" />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <div className="text-xs text-gray-400 mb-1">Toplantı Odası</div>
                  <Form.Item name="meetingRoom" className="mb-3">
                    <Input
                      placeholder="Oda adı veya numarası"
                      variant="filled"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* Online Meeting Info */}
          {showOnlineFields && (
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                <VideoCameraOutlined className="mr-1" /> Online Toplantı Bilgileri
              </Text>
              <Row gutter={16}>
                <Col span={12}>
                  <div className="text-xs text-gray-400 mb-1">Platform</div>
                  <Form.Item name="onlinePlatform" className="mb-3">
                    <Select
                      placeholder="Platform seçin"
                      options={onlinePlatformOptions}
                      variant="filled"
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <div className="text-xs text-gray-400 mb-1">Toplantı Linki</div>
                  <Form.Item name="onlineMeetingLink" className="mb-3">
                    <Input
                      placeholder="https://..."
                      variant="filled"
                      prefix={<VideoCameraOutlined className="text-gray-400" />}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Customer Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <UserOutlined className="mr-1" /> İlişkili Kayıtlar
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

          {/* Agenda */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <FileTextOutlined className="mr-1" /> Gündem
            </Text>
            <Form.Item name="agenda" className="mb-3">
              <TextArea
                placeholder="Toplantı gündemi..."
                variant="filled"
                autoSize={{ minRows: 3, maxRows: 6 }}
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
