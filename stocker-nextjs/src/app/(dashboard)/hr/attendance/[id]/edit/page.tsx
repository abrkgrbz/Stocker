'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Select, DatePicker, TimePicker, Input, Row, Col, Spin, Empty } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { useAttendance, useUpdateAttendance, useEmployees, useShifts } from '@/lib/api/hooks/useHR';
import type { UpdateAttendanceDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/hr/attendance/${id}`)}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <FieldTimeOutlined className="mr-2" />
              Yoklama Kaydı Düzenle
            </Title>
            <Text type="secondary">
              {attendance.employeeName || `Çalışan #${attendance.employeeId}`} -{' '}
              {dayjs(attendance.date).format('DD.MM.YYYY')}
            </Text>
          </div>
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
                <Button onClick={() => router.push(`/hr/attendance/${id}`)}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={updateAttendance.isPending}
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
