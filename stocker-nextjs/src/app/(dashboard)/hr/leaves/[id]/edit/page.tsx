'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Select, DatePicker, Input, Row, Col, Spin, Empty } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CalendarOutlined } from '@ant-design/icons';
import { useLeave, useUpdateLeave, useEmployees, useLeaveTypes } from '@/lib/api/hooks/useHR';
import type { UpdateLeaveDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
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
        employeeId: values.employeeId,
        leaveTypeId: values.leaveTypeId,
        startDate: values.dateRange[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange[1]?.format('YYYY-MM-DD'),
        reason: values.reason,
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
        <Spin size="large" />
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

  if (leave.status !== 'Pending') {
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/hr/leaves/${id}`)}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <CalendarOutlined className="mr-2" />
              İzin Talebi Düzenle
            </Title>
            <Text type="secondary">
              {leave.employeeName || `Çalışan #${leave.employeeId}`}
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
                <Button onClick={() => router.push(`/hr/leaves/${id}`)}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={updateLeave.isPending}
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
