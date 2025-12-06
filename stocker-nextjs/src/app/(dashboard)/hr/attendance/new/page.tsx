'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Select, DatePicker, TimePicker, Input, Row, Col } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { useCreateAttendance, useEmployees, useShifts } from '@/lib/api/hooks/useHR';
import type { CreateAttendanceDto } from '@/lib/api/services/hr.types';

const { Title } = Typography;
const { TextArea } = Input;

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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/attendance')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <FieldTimeOutlined className="mr-2" />
            Yeni Yoklama Kaydı
          </Title>
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ status: 'Present' }}
            >
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
                    name="date"
                    label="Tarih"
                    rules={[{ required: true, message: 'Tarih gerekli' }]}
                  >
                    <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} placeholder="Tarih seçin" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="checkInTime" label="Giriş Saati">
                    <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="Giriş saati" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="checkOutTime" label="Çıkış Saati">
                    <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="Çıkış saati" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="shiftId" label="Vardiya">
                    <Select
                      placeholder="Vardiya seçin"
                      allowClear
                      options={shifts.map((s) => ({
                        value: s.id,
                        label: s.name,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="status"
                label="Durum"
                rules={[{ required: true, message: 'Durum gerekli' }]}
              >
                <Select
                  placeholder="Durum seçin"
                  options={[
                    { value: 'Present', label: 'Mevcut' },
                    { value: 'Absent', label: 'Yok' },
                    { value: 'Late', label: 'Geç' },
                    { value: 'HalfDay', label: 'Yarım Gün' },
                    { value: 'OnLeave', label: 'İzinli' },
                  ]}
                />
              </Form.Item>

              <Form.Item name="notes" label="Notlar">
                <TextArea rows={3} placeholder="Ek notlar" />
              </Form.Item>

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => router.push('/hr/attendance')}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={createAttendance.isPending}
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
