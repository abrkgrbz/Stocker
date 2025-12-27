'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Form, Space, Card, Row, Col, Select, DatePicker, Checkbox, Input } from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useAssignWorkSchedule, useEmployees, useShifts } from '@/lib/api/hooks/useHR';
import type { AssignWorkScheduleDto } from '@/lib/api/services/hr.types';

const { RangePicker } = DatePicker;

export default function AssignWorkSchedulePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { data: employees = [] } = useEmployees();
  const { data: shifts = [] } = useShifts();
  const assignSchedule = useAssignWorkSchedule();

  const handleSubmit = async (values: any) => {
    try {
      const data: AssignWorkScheduleDto = {
        employeeId: values.employeeId,
        shiftId: values.shiftId,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        monday: values.monday ?? true,
        tuesday: values.tuesday ?? true,
        wednesday: values.wednesday ?? true,
        thursday: values.thursday ?? true,
        friday: values.friday ?? true,
        saturday: values.saturday ?? false,
        sunday: values.sunday ?? false,
        notes: values.notes,
      };

      await assignSchedule.mutateAsync(data);
      router.push('/hr/work-schedules');
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
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push('/hr/work-schedules')}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Toplu Program Atama
              </h1>
              <p className="text-sm text-gray-400 m-0">Tarih aralığı için program oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/work-schedules')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={assignSchedule.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Ata
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
          initialValues={{
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
          }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={16}>
              <Card title="Atama Bilgileri" className="mb-6">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="employeeId"
                      label="Çalışan"
                      rules={[{ required: true, message: 'Çalışan seçimi zorunludur' }]}
                    >
                      <Select
                        placeholder="Çalışan seçin"
                        showSearch
                        optionFilterProp="label"
                        options={employees.map((e) => ({
                          value: e.id,
                          label: e.fullName,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="shiftId"
                      label="Vardiya"
                      rules={[{ required: true, message: 'Vardiya seçimi zorunludur' }]}
                    >
                      <Select
                        placeholder="Vardiya seçin"
                        showSearch
                        optionFilterProp="label"
                        options={shifts.filter(s => s.isActive).map((s) => ({
                          value: s.id,
                          label: s.name,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="dateRange"
                  label="Tarih Aralığı"
                  rules={[{ required: true, message: 'Tarih aralığı zorunludur' }]}
                >
                  <RangePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                </Form.Item>
              </Card>

              <Card title="Çalışma Günleri" className="mb-6">
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={8} md={6}>
                    <Form.Item name="monday" valuePropName="checked" noStyle>
                      <Checkbox>Pazartesi</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8} md={6}>
                    <Form.Item name="tuesday" valuePropName="checked" noStyle>
                      <Checkbox>Salı</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8} md={6}>
                    <Form.Item name="wednesday" valuePropName="checked" noStyle>
                      <Checkbox>Çarşamba</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8} md={6}>
                    <Form.Item name="thursday" valuePropName="checked" noStyle>
                      <Checkbox>Perşembe</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8} md={6}>
                    <Form.Item name="friday" valuePropName="checked" noStyle>
                      <Checkbox>Cuma</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8} md={6}>
                    <Form.Item name="saturday" valuePropName="checked" noStyle>
                      <Checkbox>Cumartesi</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={8} md={6}>
                    <Form.Item name="sunday" valuePropName="checked" noStyle>
                      <Checkbox>Pazar</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="Notlar">
                <Form.Item name="notes" label="Açıklama">
                  <Input.TextArea rows={6} placeholder="Varsa eklemek istediğiniz notlar..." />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
