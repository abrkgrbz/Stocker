'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, Switch, TimePicker, Card, Row, Col } from 'antd';
import type { FormInstance } from 'antd';
import { useEmployees, useShifts } from '@/lib/api/hooks/useHR';
import type { WorkScheduleDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface WorkScheduleFormProps {
  form: FormInstance;
  initialValues?: WorkScheduleDto;
  onFinish: (values: any) => void;
  loading?: boolean;
  isEdit?: boolean;
}

export function WorkScheduleForm({
  form,
  initialValues,
  onFinish,
  loading,
  isEdit = false,
}: WorkScheduleFormProps) {
  const { data: employees = [] } = useEmployees();
  const { data: shifts = [] } = useShifts();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        employeeId: initialValues.employeeId,
        shiftId: initialValues.shiftId,
        date: initialValues.date ? dayjs(initialValues.date) : undefined,
        isWorkDay: initialValues.isWorkDay,
        customStartTime: initialValues.customStartTime ? dayjs(initialValues.customStartTime, 'HH:mm:ss') : undefined,
        customEndTime: initialValues.customEndTime ? dayjs(initialValues.customEndTime, 'HH:mm:ss') : undefined,
        notes: initialValues.notes,
      });
    }
  }, [initialValues, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        isWorkDay: true,
      }}
    >
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title="Program Bilgileri" className="mb-6">
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
                    disabled={isEdit}
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

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="date"
                  label="Tarih"
                  rules={[{ required: true, message: 'Tarih zorunludur' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" disabled={isEdit} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="isWorkDay" label="Çalışma Günü" valuePropName="checked">
                  <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Özel Saatler (Opsiyonel)" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="customStartTime" label="Özel Başlangıç Saati">
                  <TimePicker style={{ width: '100%' }} format="HH:mm" placeholder="Başlangıç saati" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="customEndTime" label="Özel Bitiş Saati">
                  <TimePicker style={{ width: '100%' }} format="HH:mm" placeholder="Bitiş saati" />
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
  );
}
