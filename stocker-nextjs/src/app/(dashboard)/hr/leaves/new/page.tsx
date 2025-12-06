'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Select, DatePicker, Input, Row, Col } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CalendarOutlined } from '@ant-design/icons';
import { useCreateLeave, useEmployees, useLeaveTypes } from '@/lib/api/hooks/useHR';
import type { CreateLeaveDto } from '@/lib/api/services/hr.types';

const { Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/leaves')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <CalendarOutlined className="mr-2" />
            Yeni İzin Talebi
          </Title>
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                />
              </Form.Item>

              <Form.Item
                name="reason"
                label="İzin Nedeni"
                rules={[{ required: true, message: 'İzin nedeni gerekli' }]}
              >
                <TextArea rows={4} placeholder="İzin talebinizin nedenini açıklayın" />
              </Form.Item>

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => router.push('/hr/leaves')}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={createLeave.isPending}
                >
                  Kaydet
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
