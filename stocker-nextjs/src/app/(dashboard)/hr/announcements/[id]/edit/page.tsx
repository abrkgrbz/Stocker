'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Input, DatePicker, Select, Row, Col, Spin, Empty, Switch } from 'antd';
import {
  ArrowLeftIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { useAnnouncement, useUpdateAnnouncement } from '@/lib/api/hooks/useHR';
import type { UpdateAnnouncementDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

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
        summary: announcement.summary,
        announcementType: announcement.announcementType,
        priority: announcement.priority,
        publishDate: announcement.publishDate ? dayjs(announcement.publishDate) : null,
        expiryDate: announcement.expiryDate ? dayjs(announcement.expiryDate) : null,
        isPinned: announcement.isPinned,
        requiresAcknowledgment: announcement.requiresAcknowledgment,
        targetDepartmentId: announcement.targetDepartmentId,
      });
    }
  }, [announcement, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateAnnouncementDto = {
        title: values.title,
        content: values.content,
        summary: values.summary,
        announcementType: values.announcementType || 'General',
        priority: values.priority || 'Normal',
        publishDate: values.publishDate?.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
        isPinned: values.isPinned || false,
        requiresAcknowledgment: values.requiresAcknowledgment || false,
        targetDepartmentId: values.targetDepartmentId,
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
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 px-6 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push(`/hr/announcements/${id}`)}
            />
            <div className="flex items-center gap-2">
              <BellIcon className="w-4 h-4" className="text-lg text-gray-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 m-0">Duyuru Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">{announcement.title}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/hr/announcements/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updateAnnouncement.isPending}
              style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
            >
              Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Announcement Content */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Duyuru İçeriği
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
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

          {/* Priority & Dates */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Öncelik ve Tarihler
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
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

          {/* Settings */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Ayarlar
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={12}>
                  <Form.Item name="isPinned" label="Sabitlenmiş" valuePropName="checked">
                    <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item name="requiresAcknowledgment" label="Onay Gerekli" valuePropName="checked">
                    <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          {/* Hidden submit button for form.submit() */}
          <button type="submit" hidden />
        </Form>
      </div>
    </div>
  );
}
