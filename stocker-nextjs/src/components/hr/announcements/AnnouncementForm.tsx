'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Select, Row, Col, Typography, Switch } from 'antd';
import { NotificationOutlined } from '@ant-design/icons';
import { useDepartments } from '@/lib/api/hooks/useHR';
import type { AnnouncementDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface AnnouncementFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: AnnouncementDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function AnnouncementForm({ form, initialValues, onFinish, loading }: AnnouncementFormProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [requiresAck, setRequiresAck] = useState(false);

  const { data: departments = [] } = useDepartments();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        publishDate: initialValues.publishDate ? dayjs(initialValues.publishDate) : undefined,
        expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate) : undefined,
      });
      setIsPinned(initialValues.isPinned ?? false);
      setRequiresAck(initialValues.requiresAcknowledgment ?? false);
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      initialValues={{ priority: 'Normal', isPinned: false, requiresAcknowledgment: false }}
      className="announcement-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Settings (40%) */}
        <Col xs={24} lg={10}>
          {/* Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <NotificationOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">Duyuru</p>
              <p className="text-sm text-white/60">Çalışanlara duyuru yayınlayın</p>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Sabitle
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isPinned ? 'Listede üstte sabit' : 'Normal sıralama'}
                </div>
              </div>
              <Form.Item name="isPinned" valuePropName="checked" noStyle>
                <Switch
                  checked={isPinned}
                  onChange={(val) => {
                    setIsPinned(val);
                    form.setFieldValue('isPinned', val);
                  }}
                  checkedChildren="Evet"
                  unCheckedChildren="Hayır"
                  style={{
                    backgroundColor: isPinned ? '#faad14' : '#d9d9d9',
                    minWidth: '80px',
                  }}
                />
              </Form.Item>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Onay Gerekli
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {requiresAck ? 'Çalışanlar onaylamalı' : 'Onay gerekmez'}
                </div>
              </div>
              <Form.Item name="requiresAcknowledgment" valuePropName="checked" noStyle>
                <Switch
                  checked={requiresAck}
                  onChange={(val) => {
                    setRequiresAck(val);
                    form.setFieldValue('requiresAcknowledgment', val);
                  }}
                  checkedChildren="Evet"
                  unCheckedChildren="Hayır"
                  style={{
                    backgroundColor: requiresAck ? '#1890ff' : '#d9d9d9',
                    minWidth: '80px',
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
                  {initialValues.acknowledgmentCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Onaylayan</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.viewCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Görüntülenme</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Announcement Title - Hero Input */}
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
                placeholder="Duyuru başlığı"
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
            <Form.Item name="summary" className="mb-0 mt-2">
              <Input
                placeholder="Kısa özet ekleyin..."
                variant="borderless"
                style={{
                  fontSize: '15px',
                  padding: '0',
                  color: '#666',
                }}
                className="placeholder:text-gray-300"
              />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Content */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              İçerik
            </Text>
            <Form.Item
              name="content"
              rules={[{ required: true, message: 'Gerekli' }]}
              className="mb-0"
            >
              <TextArea rows={6} placeholder="Duyuru içeriği..." variant="filled" />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Schedule & Priority */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Zamanlama ve Öncelik
            </Text>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Öncelik</div>
                <Form.Item name="priority" className="mb-0">
                  <Select
                    variant="filled"
                    options={[
                      { value: 'Low', label: 'Düşük' },
                      { value: 'Normal', label: 'Normal' },
                      { value: 'High', label: 'Yüksek' },
                      { value: 'Urgent', label: 'Acil' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Yayın Tarihi</div>
                <Form.Item name="publishDate" className="mb-0">
                  <DatePicker
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    placeholder="Tarih"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Bitiş Tarihi</div>
                <Form.Item name="expiryDate" className="mb-0">
                  <DatePicker
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    placeholder="Tarih"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Target Department */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Hedef Kitle
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Departman (boş = herkese)</div>
                <Form.Item name="targetDepartmentId" className="mb-0">
                  <Select
                    placeholder="Tüm departmanlar"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    options={departments.map((d) => ({
                      value: d.id,
                      label: d.name,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Duyuru Tipi</div>
                <Form.Item name="announcementType" className="mb-0">
                  <Select
                    placeholder="Genel"
                    variant="filled"
                    options={[
                      { value: 'General', label: 'Genel' },
                      { value: 'Policy', label: 'Politika' },
                      { value: 'Event', label: 'Etkinlik' },
                      { value: 'Achievement', label: 'Başarı' },
                      { value: 'Welcome', label: 'Hoşgeldin' },
                      { value: 'Farewell', label: 'Veda' },
                    ]}
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
