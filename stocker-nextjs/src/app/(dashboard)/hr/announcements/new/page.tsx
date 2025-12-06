'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Input, DatePicker, Select, Row, Col, Switch } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, NotificationOutlined } from '@ant-design/icons';
import { useCreateAnnouncement } from '@/lib/api/hooks/useHR';
import type { CreateAnnouncementDto } from '@/lib/api/services/hr.types';

const { Title } = Typography;
const { TextArea } = Input;

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createAnnouncement = useCreateAnnouncement();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateAnnouncementDto = {
        title: values.title,
        content: values.content,
        priority: values.priority,
        publishDate: values.publishDate?.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
        isPinned: values.isPinned ?? false,
        isActive: values.isActive ?? true,
      };

      await createAnnouncement.mutateAsync(data);
      router.push('/hr/announcements');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/announcements')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <NotificationOutlined className="mr-2" />
            Yeni Duyuru
          </Title>
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ priority: 'Normal', isActive: true, isPinned: false }}
            >
              <Form.Item
                name="title"
                label="Duyuru Başlığı"
                rules={[{ required: true, message: 'Başlık gerekli' }]}
              >
                <Input placeholder="Duyuru başlığı" />
              </Form.Item>

              <Form.Item
                name="content"
                label="İçerik"
                rules={[{ required: true, message: 'İçerik gerekli' }]}
              >
                <TextArea rows={6} placeholder="Duyuru içeriği" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="priority" label="Öncelik">
                    <Select
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
                    <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} placeholder="Tarih seçin" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="expiryDate" label="Bitiş Tarihi">
                    <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} placeholder="Tarih seçin" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={12}>
                  <Form.Item name="isPinned" label="Sabitlenmiş" valuePropName="checked">
                    <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item name="isActive" label="Aktif" valuePropName="checked">
                    <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                  </Form.Item>
                </Col>
              </Row>

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => router.push('/hr/announcements')}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={createAnnouncement.isPending}
                >
                  Kaydet
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
