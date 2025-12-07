'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Input, DatePicker, Row, Col, Spin, Empty, Switch } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined } from '@ant-design/icons';
import { useHoliday, useUpdateHoliday } from '@/lib/api/hooks/useHR';
import type { UpdateHolidayDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function EditHolidayPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: holiday, isLoading, error } = useHoliday(id);
  const updateHoliday = useUpdateHoliday();

  // Populate form when holiday data loads
  useEffect(() => {
    if (holiday) {
      form.setFieldsValue({
        name: holiday.name,
        date: holiday.date ? dayjs(holiday.date) : null,
        description: holiday.description,
        isRecurring: holiday.isRecurring,
        holidayType: holiday.holidayType,
        isHalfDay: holiday.isHalfDay,
        isNational: holiday.isNational,
        affectedRegions: holiday.affectedRegions,
      });
    }
  }, [holiday, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateHolidayDto = {
        name: values.name,
        date: values.date?.format('YYYY-MM-DD'),
        description: values.description,
        isRecurring: values.isRecurring ?? false,
        holidayType: values.holidayType,
        isHalfDay: values.isHalfDay ?? false,
        isNational: values.isNational ?? true,
        affectedRegions: values.affectedRegions,
      };

      await updateHoliday.mutateAsync({ id, data });
      router.push(`/hr/holidays/${id}`);
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

  if (error || !holiday) {
    return (
      <div className="p-6">
        <Empty description="Tatil günü bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/holidays')}>Listeye Dön</Button>
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
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push(`/hr/holidays/${id}`)}
            />
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-lg text-gray-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 m-0">Tatil Günü Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">{holiday.name}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/hr/holidays/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updateHoliday.isPending}
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
          {/* Holiday Information */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Tatil Bilgileri
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="Tatil Adı"
                    rules={[{ required: true, message: 'Tatil adı gerekli' }]}
                  >
                    <Input placeholder="Örn: Yılbaşı, Ramazan Bayramı" variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="date"
                    label="Tarih"
                    rules={[{ required: true, message: 'Tarih gerekli' }]}
                  >
                    <DatePicker
                      format="DD.MM.YYYY"
                      style={{ width: '100%' }}
                      placeholder="Tarih seçin"
                      variant="filled"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="description" label="Açıklama">
                <TextArea rows={3} placeholder="Tatil günü açıklaması" variant="filled" />
              </Form.Item>
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
              <Form.Item
                name="isRecurring"
                label="Yıllık Tekrarlayan"
                valuePropName="checked"
                className="mb-0"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>
            </div>
          </div>

          {/* Hidden submit button for form.submit() */}
          <button type="submit" hidden />
        </Form>
      </div>
    </div>
  );
}
