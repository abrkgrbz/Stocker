'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Select, DatePicker, Input, Row, Col, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CalendarOutlined } from '@ant-design/icons';
import { useCreateLeave, useEmployees, useLeaveTypes } from '@/lib/api/hooks/useHR';
import type { CreateLeaveDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function NewLeavePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createLeave = useCreateLeave();
  const { data: employees = [] } = useEmployees();
  const { data: leaveTypes = [] } = useLeaveTypes();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateLeaveDto = {
        employeeId: values.employeeId,
        leaveTypeId: values.leaveTypeId,
        startDate: values.dateRange[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange[1]?.format('YYYY-MM-DD'),
        reason: values.reason,
      };

      await createLeave.mutateAsync(data);
      router.push('/hr/leaves');
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
                <CalendarOutlined className="mr-2" />
                Yeni İzin Talebi
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir izin talebi oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/leaves')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createLeave.isPending}
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
              {/* Leave Info Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  İzin Bilgileri
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

                  <Form.Item
                    name="reason"
                    label="İzin Nedeni"
                    rules={[{ required: true, message: 'İzin nedeni gerekli' }]}
                    className="mb-0"
                  >
                    <TextArea rows={4} placeholder="İzin talebinizin nedenini açıklayın" variant="filled" />
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
