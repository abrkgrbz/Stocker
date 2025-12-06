'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, DatePicker, Select, Row, Col, Switch, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, NotificationOutlined } from '@ant-design/icons';
import { useCreateAnnouncement } from '@/lib/api/hooks/useHR';
import type { CreateAnnouncementDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;
const { Text } = Typography;

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createAnnouncement = useCreateAnnouncement();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateAnnouncementDto = {
        title: values.title,
        content: values.content,
        summary: values.summary,
        announcementType: values.announcementType || 'General',
        priority: values.priority || 'Normal',
        authorId: 0, // Will be set by backend from current user
        publishDate: values.publishDate?.format('YYYY-MM-DD') || new Date().toISOString().split('T')[0],
        expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
        isPinned: values.isPinned ?? false,
        requiresAcknowledgment: values.requiresAcknowledgment ?? false,
        targetDepartmentId: values.targetDepartmentId,
      };

      await createAnnouncement.mutateAsync(data);
      router.push('/hr/announcements');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <NotificationOutlined className="mr-2" />
                Yeni Duyuru
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir duyuru oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/announcements')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createAnnouncement.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ priority: 'Normal', isPinned: false, requiresAcknowledgment: false }}
        >
          <Row gutter={48}>
            <Col xs={24} lg={16}>
              {/* Basic Info Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Duyuru Bilgileri
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Form.Item
                    name="title"
                    label="Duyuru Başlığı"
                    rules={[{ required: true, message: 'Başlık gerekli' }]}
                  >
                    <Input placeholder="Duyuru başlığı" variant="filled" />
                  </Form.Item>

                  <Form.Item
                    name="content"
                    label="İçerik"
                    rules={[{ required: true, message: 'İçerik gerekli' }]}
                  >
                    <TextArea rows={6} placeholder="Duyuru içeriği" variant="filled" />
                  </Form.Item>
                </div>
              </div>

              {/* Schedule Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Zamanlama ve Öncelik
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Form.Item name="priority" label="Öncelik">
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
                    <Col xs={24} sm={8}>
                      <Form.Item name="publishDate" label="Yayın Tarihi">
                        <DatePicker
                          format="DD.MM.YYYY"
                          style={{ width: '100%' }}
                          placeholder="Tarih seçin"
                          variant="filled"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item name="expiryDate" label="Bitiş Tarihi">
                        <DatePicker
                          format="DD.MM.YYYY"
                          style={{ width: '100%' }}
                          placeholder="Tarih seçin"
                          variant="filled"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* Settings Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Ayarlar
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Sabitlenmiş</div>
                      <div className="text-xs text-gray-400">Duyuru listesinde üstte sabit kalır</div>
                    </div>
                    <Form.Item name="isPinned" valuePropName="checked" noStyle>
                      <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                    </Form.Item>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Onay Gerekli</div>
                      <div className="text-xs text-gray-400">Çalışanların duyuruyu onaylaması gereksin mi?</div>
                    </div>
                    <Form.Item name="requiresAcknowledgment" valuePropName="checked" noStyle>
                      <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Hidden submit button */}
          <Form.Item hidden>
            <Button htmlType="submit" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
