'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Input, TimePicker, InputNumber, Row, Col, Spin, Empty } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useShift, useUpdateShift } from '@/lib/api/hooks/useHR';
import type { UpdateShiftDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function EditShiftPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: shift, isLoading, error } = useShift(id);
  const updateShift = useUpdateShift();

  // Populate form when shift data loads
  useEffect(() => {
    if (shift) {
      form.setFieldsValue({
        name: shift.name,
        code: shift.code,
        description: shift.description,
        startTime: shift.startTime ? dayjs(shift.startTime, 'HH:mm:ss') : null,
        endTime: shift.endTime ? dayjs(shift.endTime, 'HH:mm:ss') : null,
        breakDurationMinutes: shift.breakDurationMinutes,
      });
    }
  }, [shift, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateShiftDto = {
        name: values.name,
        description: values.description,
        shiftType: values.shiftType || 0, // Default to Regular shift type
        startTime: values.startTime?.format('HH:mm:ss'),
        endTime: values.endTime?.format('HH:mm:ss'),
        breakStartTime: values.breakStartTime?.format('HH:mm:ss'),
        breakEndTime: values.breakEndTime?.format('HH:mm:ss'),
        breakDurationMinutes: values.breakDurationMinutes || 0,
        nightShiftAllowancePercentage: values.nightShiftAllowancePercentage,
        gracePeriodMinutes: values.gracePeriodMinutes,
        earlyDepartureThresholdMinutes: values.earlyDepartureThresholdMinutes,
        overtimeThresholdMinutes: values.overtimeThresholdMinutes,
        isFlexible: values.isFlexible ?? false,
        flexibleStartTime: values.flexibleStartTime?.format('HH:mm:ss'),
        flexibleEndTime: values.flexibleEndTime?.format('HH:mm:ss'),
      };

      await updateShift.mutateAsync({ id, data });
      router.push(`/hr/shifts/${id}`);
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

  if (error || !shift) {
    return (
      <div className="p-6">
        <Empty description="Vardiya bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/shifts')}>Listeye Dön</Button>
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
              onClick={() => router.push(`/hr/shifts/${id}`)}
            />
            <div className="flex items-center gap-2">
              <ClockCircleOutlined className="text-lg text-gray-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 m-0">Vardiya Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">
                  {shift.name} - {shift.code}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/hr/shifts/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updateShift.isPending}
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
          {/* Basic Information */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Vardiya Bilgileri
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="Vardiya Adı"
                    rules={[{ required: true, message: 'Vardiya adı gerekli' }]}
                  >
                    <Input placeholder="Örn: Sabah Vardiyası" variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="code"
                    label="Vardiya Kodu"
                    rules={[{ required: true, message: 'Vardiya kodu gerekli' }]}
                  >
                    <Input placeholder="Örn: SABAH, AKSAM, GECE" variant="filled" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="description" label="Açıklama">
                <TextArea rows={3} placeholder="Vardiya açıklaması" variant="filled" />
              </Form.Item>
            </div>
          </div>

          {/* Time Settings */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Saat Ayarları
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="startTime"
                    label="Başlangıç Saati"
                    rules={[{ required: true, message: 'Başlangıç saati gerekli' }]}
                  >
                    <TimePicker
                      format="HH:mm"
                      style={{ width: '100%' }}
                      placeholder="Saat seçin"
                      variant="filled"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="endTime"
                    label="Bitiş Saati"
                    rules={[{ required: true, message: 'Bitiş saati gerekli' }]}
                  >
                    <TimePicker
                      format="HH:mm"
                      style={{ width: '100%' }}
                      placeholder="Saat seçin"
                      variant="filled"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="breakDurationMinutes" label="Mola Süresi (dk)">
                    <InputNumber
                      placeholder="Dakika"
                      style={{ width: '100%' }}
                      min={0}
                      max={180}
                      variant="filled"
                    />
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
