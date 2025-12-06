'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Select, DatePicker, TimePicker, Input, Row, Col, Spin, Empty } from 'antd';
import { ArrowLeftOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { useAttendance, useUpdateAttendance, useEmployees, useShifts } from '@/lib/api/hooks/useHR';
import type { UpdateAttendanceDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function EditAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: attendance, isLoading, error } = useAttendance(id);
  const updateAttendance = useUpdateAttendance();
  const { data: employees = [] } = useEmployees();
  const { data: shifts = [] } = useShifts();

  // Populate form when attendance data loads
  useEffect(() => {
    if (attendance) {
      form.setFieldsValue({
        employeeId: attendance.employeeId,
        date: attendance.date ? dayjs(attendance.date) : null,
        checkInTime: attendance.checkInTime ? dayjs(attendance.checkInTime, 'HH:mm:ss') : null,
        checkOutTime: attendance.checkOutTime ? dayjs(attendance.checkOutTime, 'HH:mm:ss') : null,
        shiftId: attendance.shiftId,
        status: attendance.status,
        notes: attendance.notes,
      });
    }
  }, [attendance, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateAttendanceDto = {
        employeeId: values.employeeId,
        date: values.date?.format('YYYY-MM-DD'),
        checkInTime: values.checkInTime?.format('HH:mm:ss'),
        checkOutTime: values.checkOutTime?.format('HH:mm:ss'),
        shiftId: values.shiftId,
        status: values.status,
        notes: values.notes,
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
          {/* Employee & Date */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Temel Bilgiler
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="employeeId"
                    label="Çalışan"
                    rules={[{ required: true, message: 'Çalışan seçimi gerekli' }]}
                  >
                    <Select
                      placeholder="Çalışan seçin"
                      showSearch
                      optionFilterProp="children"
                      variant="filled"
                      options={employees.map((e) => ({
                        value: e.id,
                        label: `${e.firstName} ${e.lastName}`,
                      }))}
                    />
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
            </div>
          </div>

          {/* Time & Shift */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Saat ve Vardiya
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="checkInTime" label="Giriş Saati">
                    <TimePicker
                      format="HH:mm"
                      style={{ width: '100%' }}
                      placeholder="Giriş saati"
                      variant="filled"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="checkOutTime" label="Çıkış Saati">
                    <TimePicker
                      format="HH:mm"
                      style={{ width: '100%' }}
                      placeholder="Çıkış saati"
                      variant="filled"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="shiftId" label="Vardiya">
                    <Select
                      placeholder="Vardiya seçin"
                      allowClear
                      variant="filled"
                      options={shifts.map((s) => ({
                        value: s.id,
                        label: s.name,
                      }))}
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
