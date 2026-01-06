'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Select, TimePicker, Input, Row, Col, Descriptions } from 'antd';
import { ClockIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { useAttendanceById, useUpdateAttendance } from '@/lib/api/hooks/useHR';
import type { UpdateAttendanceDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function EditAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: attendance, isLoading, error } = useAttendanceById(id);
  const updateAttendance = useUpdateAttendance();

  // Populate form when attendance data loads
  useEffect(() => {
    if (attendance) {
      form.setFieldsValue({
        checkInTime: attendance.checkInTime ? dayjs(attendance.checkInTime, 'HH:mm:ss') : null,
        checkOutTime: attendance.checkOutTime ? dayjs(attendance.checkOutTime, 'HH:mm:ss') : null,
        status: attendance.status,
        notes: attendance.notes,
      });
    }
  }, [attendance, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateAttendanceDto = {
        checkInTime: values.checkInTime?.format('HH:mm:ss'),
        checkOutTime: values.checkOutTime?.format('HH:mm:ss'),
        status: values.status,
        notes: values.notes,
        isManualEntry: true,
      };

      await updateAttendance.mutateAsync({ id, data });
      router.push(`/hr/attendance/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const subtitle = attendance
    ? `${attendance.employeeName || `Calisan #${attendance.employeeId}`} - ${dayjs(attendance.date).format('DD.MM.YYYY')}`
    : 'Yoklama kaydini duzenleyin';

  return (
    <FormPageLayout
      title="Yoklama Kaydi Duzenle"
      subtitle={subtitle}
      cancelPath={`/hr/attendance/${id}`}
      loading={updateAttendance.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !attendance)}
      errorMessage="Yoklama Kaydi Bulunamadi"
      errorDescription="Istenen yoklama kaydi bulunamadi veya bir hata olustu."
      saveButtonText="Guncelle"
      icon={<ClockIcon className="w-5 h-5" />}
      maxWidth="max-w-4xl"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Employee & Date (Read-only info) */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Kayit Bilgileri
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          </div>
          <div className="bg-gray-50/50 rounded-xl p-6">
            <Descriptions column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label="Calisan">
                {attendance?.employeeName || `Calisan #${attendance?.employeeId}`}
              </Descriptions.Item>
              <Descriptions.Item label="Tarih">
                {attendance?.date ? dayjs(attendance.date).format('DD.MM.YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Vardiya">
                {attendance?.shiftName || '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>

        {/* Time */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Saat Bilgileri
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          </div>
          <div className="bg-gray-50/50 rounded-xl p-6">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="checkInTime" label="Giris Saati">
                  <TimePicker
                    format="HH:mm"
                    style={{ width: '100%' }}
                    placeholder="Giris saati"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="checkOutTime" label="Cikis Saati">
                  <TimePicker
                    format="HH:mm"
                    style={{ width: '100%' }}
                    placeholder="Cikis saati"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>

        {/* Status */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Durum
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          </div>
          <div className="bg-gray-50/50 rounded-xl p-6">
            <Form.Item
              name="status"
              label="Yoklama Durumu"
              rules={[{ required: true, message: 'Durum gerekli' }]}
            >
              <Select
                placeholder="Durum secin"
                variant="filled"
                options={[
                  { value: 'Present', label: 'Mevcut' },
                  { value: 'Absent', label: 'Yok' },
                  { value: 'Late', label: 'Gec' },
                  { value: 'HalfDay', label: 'Yarim Gun' },
                  { value: 'OnLeave', label: 'Izinli' },
                ]}
              />
            </Form.Item>
            <Form.Item name="notes" label="Notlar" className="mb-0">
              <TextArea rows={3} placeholder="Ek notlar" variant="filled" />
            </Form.Item>
          </div>
        </div>

        {/* Hidden submit button for form.submit() */}
        <button type="submit" hidden />
      </Form>
    </FormPageLayout>
  );
}
