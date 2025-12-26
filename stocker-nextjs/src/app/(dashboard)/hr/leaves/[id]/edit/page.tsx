'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Select, DatePicker, Input, Row, Col, Empty } from 'antd';
import { Spinner } from '@/components/primitives';
import { ArrowLeftIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useLeave, useUpdateLeave, useEmployees, useLeaveTypes } from '@/lib/api/hooks/useHR';
import type { UpdateLeaveDto } from '@/lib/api/services/hr.types';
import { LeaveStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function EditLeavePage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: leave, isLoading, error } = useLeave(id);
  const updateLeave = useUpdateLeave();
  const { data: employees = [] } = useEmployees();
  const { data: leaveTypes = [] } = useLeaveTypes();

  // Populate form when leave data loads
  useEffect(() => {
    if (leave) {
      form.setFieldsValue({
        employeeId: leave.employeeId,
        leaveTypeId: leave.leaveTypeId,
        dateRange: [
          leave.startDate ? dayjs(leave.startDate) : null,
          leave.endDate ? dayjs(leave.endDate) : null,
        ],
        reason: leave.reason,
      });
    }
  }, [leave, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateLeaveDto = {
        leaveTypeId: values.leaveTypeId,
        startDate: values.dateRange[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange[1]?.format('YYYY-MM-DD'),
        isHalfDay: values.isHalfDay ?? false,
        isHalfDayMorning: values.isHalfDayMorning ?? false,
        reason: values.reason,
        contactDuringLeave: values.contactDuringLeave,
        handoverNotes: values.handoverNotes,
        substituteEmployeeId: values.substituteEmployeeId,
      };

      await updateLeave.mutateAsync({ id, data });
      router.push(`/hr/leaves/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !leave) {
    return (
      <div className="p-6">
        <Empty description="İzin talebi bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/leaves')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  if (leave.status !== LeaveStatus.Pending) {
    return (
      <div className="p-6">
        <Empty description="Bu izin talebi düzenlenemez. Sadece bekleyen talepler düzenlenebilir." />
        <div className="text-center mt-4">
          <Button onClick={() => router.push(`/hr/leaves/${id}`)}>Detaya Dön</Button>
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
              onClick={() => router.push(`/hr/leaves/${id}`)}
            />
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 m-0">İzin Talebi Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">
                  {leave.employeeName || `Çalışan #${leave.employeeId}`}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/hr/leaves/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updateLeave.isPending}
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
          {/* Employee & Leave Type */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                İzin Bilgileri
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
                        label: e.fullName,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="leaveTypeId"
                    label="İzin Türü"
                    rules={[{ required: true, message: 'İzin türü seçimi gerekli' }]}
                  >
                    <Select
                      placeholder="İzin türü seçin"
                      variant="filled"
                      options={leaveTypes.map((lt) => ({
                        value: lt.id,
                        label: lt.name,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="dateRange"
                label="İzin Tarihleri"
                rules={[{ required: true, message: 'İzin tarihleri gerekli' }]}
              >
                <RangePicker
                  format="DD.MM.YYYY"
                  style={{ width: '100%' }}
                  placeholder={['Başlangıç Tarihi', 'Bitiş Tarihi']}
                  variant="filled"
                />
              </Form.Item>
            </div>
          </div>

          {/* Reason */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                İzin Nedeni
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Form.Item
                name="reason"
                label="Neden"
                rules={[{ required: true, message: 'İzin nedeni gerekli' }]}
                className="mb-0"
              >
                <TextArea
                  rows={4}
                  placeholder="İzin talebinizin nedenini açıklayın"
                  variant="filled"
                />
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
