'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Input, DatePicker, InputNumber, Row, Col, Spin, Empty, Switch, Select } from 'antd';
import { ArrowLeftOutlined, BookOutlined } from '@ant-design/icons';
import { useTraining, useUpdateTraining } from '@/lib/api/hooks/useHR';
import type { UpdateTrainingDto } from '@/lib/api/services/hr.types';
import { TrainingStatus } from '@/lib/api/services/hr.types';
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
        title: training.title,
        description: training.description,
        trainingType: training.trainingType,
        provider: training.provider,
        instructor: training.instructor,
        dateRange: [
          training.startDate ? dayjs(training.startDate) : null,
          training.endDate ? dayjs(training.endDate) : null,
        ],
        location: training.location,
        isOnline: training.isOnline,
        onlineUrl: training.onlineUrl,
        durationHours: training.durationHours,
        maxParticipants: training.maxParticipants,
        cost: training.cost,
        currency: training.currency,
        isMandatory: training.isMandatory,
        hasCertification: training.hasCertification,
        certificationValidityMonths: training.certificationValidityMonths,
        passingScore: training.passingScore,
        prerequisites: training.prerequisites,
        materials: training.materials,
      });
    }
  }, [training, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateTrainingDto = {
        title: values.title,
        description: values.description,
        trainingType: values.trainingType,
        provider: values.provider,
        instructor: values.instructor,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
        location: values.location,
        isOnline: values.isOnline ?? false,
        onlineUrl: values.onlineUrl,
        durationHours: values.durationHours || 0,
        maxParticipants: values.maxParticipants,
        cost: values.cost,
        currency: values.currency,
        isMandatory: values.isMandatory ?? false,
        hasCertification: values.hasCertification ?? false,
        certificationValidityMonths: values.certificationValidityMonths,
        passingScore: values.passingScore,
        prerequisites: values.prerequisites,
        materials: values.materials,
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
                <p className="text-sm text-gray-500 m-0">{training.title}</p>
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
                    name="title"
                    label="Eğitim Adı"
                    rules={[{ required: true, message: 'Eğitim adı gerekli' }]}
                  >
                    <Input placeholder="Eğitim adı" variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="trainingType" label="Eğitim Türü">
                    <Input placeholder="Örn: Teknik, Soft Skills" variant="filled" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="provider" label="Eğitim Sağlayıcısı">
                    <Input placeholder="Şirket veya kuruluş adı" variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="instructor" label="Eğitmen">
                    <Input placeholder="Eğitmen adı" variant="filled" />
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
                  <Form.Item name="dateRange" label="Eğitim Tarihleri">
                    <RangePicker
                      format="DD.MM.YYYY"
                      style={{ width: '100%' }}
                      placeholder={['Başlangıç', 'Bitiş']}
                      variant="filled"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="durationHours" label="Süre (Saat)">
                    <InputNumber placeholder="0" style={{ width: '100%' }} min={0} variant="filled" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="isOnline" label="Online Eğitim" valuePropName="checked">
                    <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="location" label="Konum">
                    <Input placeholder="Eğitim yeri" variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="onlineUrl" label="Online URL">
                    <Input placeholder="https://..." variant="filled" />
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
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="currency" label="Para Birimi">
                    <Select
                      placeholder="Seçin"
                      variant="filled"
                      options={[
                        { value: 'TRY', label: 'TRY' },
                        { value: 'USD', label: 'USD' },
                        { value: 'EUR', label: 'EUR' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="isMandatory" label="Zorunlu Eğitim" valuePropName="checked">
                    <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          {/* Certification */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Sertifikasyon
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="hasCertification" label="Sertifika Verilecek mi?" valuePropName="checked">
                    <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="certificationValidityMonths" label="Sertifika Geçerlilik (Ay)">
                    <InputNumber placeholder="0" style={{ width: '100%' }} min={0} variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="passingScore" label="Geçme Puanı">
                    <InputNumber placeholder="0" style={{ width: '100%' }} min={0} max={100} variant="filled" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Ek Bilgiler
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Form.Item name="prerequisites" label="Ön Koşullar">
                <TextArea rows={3} placeholder="Eğitime katılım için gerekli ön koşullar" variant="filled" />
              </Form.Item>
              <Form.Item name="materials" label="Materyaller" className="mb-0">
                <TextArea rows={3} placeholder="Eğitim materyalleri ve kaynaklar" variant="filled" />
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
