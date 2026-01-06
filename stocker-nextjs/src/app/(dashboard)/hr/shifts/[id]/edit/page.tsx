'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Input, TimePicker, InputNumber, Row, Col } from 'antd';
import { ClockIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
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

  const subtitle = shift
    ? `${shift.name} - ${shift.code}`
    : 'Vardiya bilgilerini duzenleyin';

  return (
    <FormPageLayout
      title="Vardiya Duzenle"
      subtitle={subtitle}
      cancelPath={`/hr/shifts/${id}`}
      loading={updateShift.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !shift)}
      errorMessage="Vardiya Bulunamadi"
      errorDescription="Istenen vardiya bulunamadi veya bir hata olustu."
      saveButtonText="Guncelle"
      icon={<ClockIcon className="w-5 h-5" />}
      maxWidth="max-w-4xl"
    >
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
                  label="Vardiya Adi"
                  rules={[{ required: true, message: 'Vardiya adi gerekli' }]}
                >
                  <Input placeholder="Orn: Sabah Vardiyasi" variant="filled" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="code"
                  label="Vardiya Kodu"
                  rules={[{ required: true, message: 'Vardiya kodu gerekli' }]}
                >
                  <Input placeholder="Orn: SABAH, AKSAM, GECE" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" label="Aciklama">
              <TextArea rows={3} placeholder="Vardiya aciklamasi" variant="filled" />
            </Form.Item>
          </div>
        </div>

        {/* Time Settings */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Saat Ayarlari
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          </div>
          <div className="bg-gray-50/50 rounded-xl p-6">
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="startTime"
                  label="Baslangic Saati"
                  rules={[{ required: true, message: 'Baslangic saati gerekli' }]}
                >
                  <TimePicker
                    format="HH:mm"
                    style={{ width: '100%' }}
                    placeholder="Saat secin"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="endTime"
                  label="Bitis Saati"
                  rules={[{ required: true, message: 'Bitis saati gerekli' }]}
                >
                  <TimePicker
                    format="HH:mm"
                    style={{ width: '100%' }}
                    placeholder="Saat secin"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="breakDurationMinutes" label="Mola Suresi (dk)">
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
    </FormPageLayout>
  );
}
