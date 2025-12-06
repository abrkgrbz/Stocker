'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Select, TimePicker, Row, Col, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { useCheckIn, useEmployees } from '@/lib/api/hooks/useHR';
import type { CheckInDto } from '@/lib/api/services/hr.types';

const { Text } = Typography;

export default function NewAttendancePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const checkIn = useCheckIn();
  const { data: employees = [] } = useEmployees();

  const handleSubmit = async (values: any) => {
    try {
      const data: CheckInDto = {
        employeeId: values.employeeId,
        checkInTime: values.checkInTime?.format('HH:mm:ss'),
      };

      await checkIn.mutateAsync(data);
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
                Manuel Giriş Kaydı
              </h1>
              <p className="text-sm text-gray-400 m-0">Çalışan için manuel giriş kaydı oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/attendance')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={checkIn.isPending}
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
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={48}>
            <Col xs={24} lg={16}>
              {/* Basic Info Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Giriş Bilgileri
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
                      <Form.Item name="checkInTime" label="Giriş Saati">
                        <TimePicker
                          format="HH:mm"
                          style={{ width: '100%' }}
                          placeholder="Boş bırakılırsa şu anki saat"
                          variant="filled"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
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
