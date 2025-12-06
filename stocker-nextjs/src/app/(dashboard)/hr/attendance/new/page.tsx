'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Select, DatePicker, TimePicker, Input, Row, Col, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { useCreateAttendance, useEmployees, useShifts } from '@/lib/api/hooks/useHR';
import type { CreateAttendanceDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;
const { Text } = Typography;

export default function NewAttendancePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createAttendance = useCreateAttendance();
  const { data: employees = [] } = useEmployees();
  const { data: shifts = [] } = useShifts();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateAttendanceDto = {
        employeeId: values.employeeId,
        date: values.date?.format('YYYY-MM-DD'),
        checkInTime: values.checkInTime?.format('HH:mm:ss'),
        checkOutTime: values.checkOutTime?.format('HH:mm:ss'),
        shiftId: values.shiftId,
        status: values.status,
        notes: values.notes,
      };

      await createAttendance.mutateAsync(data);
      router.push('/hr/attendance');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <FieldTimeOutlined className="mr-2" />
                Yeni Yoklama Kaydı
              </h1>
              <p className="text-sm text-gray-400 m-0">Manuel yoklama kaydı oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/attendance')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createAttendance.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: 'Present' }}
        >
          <Row gutter={48}>
            <Col xs={24} lg={16}>
              {/* Basic Info Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Yoklama Bilgileri
                </Text>
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

              {/* Time Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Zaman Bilgileri
                </Text>
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

              {/* Status Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Durum ve Notlar
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Form.Item
                    name="status"
                    label="Durum"
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
            </Col>
          </Row>

          {/* Hidden submit button */}
          <Form.Item hidden>
            <Button htmlType="submit" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
