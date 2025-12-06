'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Input, DatePicker, Select, Row, Col, Spin, Empty, Switch } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, NotificationOutlined } from '@ant-design/icons';
import { useAnnouncement, useUpdateAnnouncement } from '@/lib/api/hooks/useHR';
import type { UpdateAnnouncementDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function EditAnnouncementPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: announcement, isLoading, error } = useAnnouncement(id);
  const updateAnnouncement = useUpdateAnnouncement();

  // Populate form when announcement data loads
  useEffect(() => {
    if (announcement) {
      form.setFieldsValue({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        publishDate: announcement.publishDate ? dayjs(announcement.publishDate) : null,
        expiryDate: announcement.expiryDate ? dayjs(announcement.expiryDate) : null,
        isPinned: announcement.isPinned,
        isActive: announcement.isActive,
      });
    }
  }, [announcement, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateAnnouncementDto = {
        title: values.title,
        content: values.content,
        priority: values.priority,
        publishDate: values.publishDate?.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
        isPinned: values.isPinned,
        isActive: values.isActive,
      };

      await updateAnnouncement.mutateAsync({ id, data });
      router.push(`/hr/announcements/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="p-6">
        <Empty description="Duyuru bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/announcements')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/hr/announcements/${id}`)}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <NotificationOutlined className="mr-2" />
              Duyuru Düzenle
            </Title>
            <Text type="secondary">{announcement.title}</Text>
          </div>
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                <Button onClick={() => router.push(`/hr/announcements/${id}`)}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={updateAnnouncement.isPending}
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
