'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Input, DatePicker, InputNumber, Row, Col, Spin, Empty, Switch } from 'antd';
import { ArrowLeftOutlined, BookOutlined } from '@ant-design/icons';
import { useTraining, useUpdateTraining } from '@/lib/api/hooks/useHR';
import type { UpdateTrainingDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function EditTrainingPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: training, isLoading, error } = useTraining(id);
  const updateTraining = useUpdateTraining();

  // Populate form when training data loads
  useEffect(() => {
    if (training) {
      form.setFieldsValue({
        name: training.name,
        description: training.description,
        provider: training.provider,
        dateRange: [
          training.startDate ? dayjs(training.startDate) : null,
          training.endDate ? dayjs(training.endDate) : null,
        ],
        location: training.location,
        maxParticipants: training.maxParticipants,
        cost: training.cost,
        isActive: training.isActive,
      });
    }
  }, [training, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateTrainingDto = {
        name: values.name,
        description: values.description,
        provider: values.provider,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
        location: values.location,
        maxParticipants: values.maxParticipants,
        cost: values.cost,
        isActive: values.isActive,
      };

      await updateTraining.mutateAsync({ id, data });
      router.push(`/hr/trainings/${id}`);
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

  if (error || !training) {
    return (
      <div className="p-6">
        <Empty description="Eğitim bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/trainings')}>Listeye Dön</Button>
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
              onClick={() => router.push(`/hr/trainings/${id}`)}
            />
            <div className="flex items-center gap-2">
              <BookOutlined className="text-lg text-gray-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 m-0">Eğitim Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">{training.name}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/hr/trainings/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updateTraining.isPending}
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
          {/* Training Information */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Eğitim Bilgileri
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="Eğitim Adı"
                    rules={[{ required: true, message: 'Eğitim adı gerekli' }]}
                  >
                    <Input placeholder="Eğitim adı" variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="provider" label="Eğitim Sağlayıcısı">
                    <Input placeholder="Şirket veya eğitmen adı" variant="filled" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="description" label="Açıklama">
                <TextArea rows={3} placeholder="Eğitim açıklaması" variant="filled" />
              </Form.Item>
            </div>
          </div>

          {/* Schedule & Location */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Tarih ve Konum
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="dateRange"
                    label="Eğitim Tarihleri"
                    rules={[{ required: true, message: 'Tarih aralığı gerekli' }]}
                  >
                    <RangePicker
                      format="DD.MM.YYYY"
                      style={{ width: '100%' }}
                      placeholder={['Başlangıç', 'Bitiş']}
                      variant="filled"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="location" label="Konum">
                    <Input placeholder="Eğitim yeri veya Online" variant="filled" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          {/* Capacity & Cost */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Kapasite ve Maliyet
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="maxParticipants" label="Maksimum Katılımcı">
                    <InputNumber placeholder="0" style={{ width: '100%' }} min={1} variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="cost" label="Maliyet">
                    <InputNumber
                      placeholder="0"
                      style={{ width: '100%' }}
                      variant="filled"
                      formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="isActive" label="Durum" valuePropName="checked">
                    <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
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
