'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Select, TimePicker, Input, Row, Col, Spin, Empty, Descriptions } from 'antd';
import { ArrowLeftOutlined, FieldTimeOutlined } from '@ant-design/icons';
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !attendance) {
    return (
      <div className="p-6">
        <Empty description="Yoklama kaydı bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/attendance')}>Listeye Dön</Button>
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
              onClick={() => router.push(`/hr/attendance/${id}`)}
            />
            <div className="flex items-center gap-2">
              <FieldTimeOutlined className="text-lg text-gray-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 m-0">Yoklama Kaydı Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">
                  {attendance.employeeName || `Çalışan #${attendance.employeeId}`} -{' '}
                  {dayjs(attendance.date).format('DD.MM.YYYY')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/hr/attendance/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updateAttendance.isPending}
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
          {/* Employee & Date (Read-only info) */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Kayıt Bilgileri
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Çalışan">
                  {attendance?.employeeName || `Çalışan #${attendance?.employeeId}`}
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
                  <Form.Item name="checkInTime" label="Giriş Saati">
                    <TimePicker
                      format="HH:mm"
                      style={{ width: '100%' }}
                      placeholder="Giriş saati"
                      variant="filled"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="checkOutTime" label="Çıkış Saati">
                    <TimePicker
                      format="HH:mm"
                      style={{ width: '100%' }}
                      placeholder="Çıkış saati"
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
                  placeholder="Durum seçin"
                  variant="filled"
                  options={[
                    { value: 'Present', label: 'Mevcut' },
                    { value: 'Absent', label: 'Yok' },
                    { value: 'Late', label: 'Geç' },
                    { value: 'HalfDay', label: 'Yarım Gün' },
                    { value: 'OnLeave', label: 'İzinli' },
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
      </div>
    </div>
  );
}
