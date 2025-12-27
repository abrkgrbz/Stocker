'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Switch,
  InputNumber,
  DatePicker,
  TimePicker,
} from 'antd';
import {
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { OvertimeDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

// Overtime type options
const overtimeTypeOptions = [
  { value: 'Regular', label: 'Normal Mesai' },
  { value: 'Weekend', label: 'Hafta Sonu' },
  { value: 'Holiday', label: 'Tatil Günü' },
  { value: 'Night', label: 'Gece Mesaisi' },
  { value: 'Emergency', label: 'Acil Durum' },
  { value: 'Project', label: 'Proje Bazlı' },
];

// Pay multiplier options
const payMultiplierOptions = [
  { value: 1.0, label: '1.0x (Normal)' },
  { value: 1.5, label: '1.5x (Fazla Mesai)' },
  { value: 2.0, label: '2.0x (Çift)' },
  { value: 2.5, label: '2.5x (Tatil)' },
  { value: 3.0, label: '3.0x (Özel)' },
];

interface OvertimeFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: OvertimeDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function OvertimeForm({
  form,
  initialValues,
  onFinish,
  loading,
}: OvertimeFormProps) {
  const [isCompensatoryTimeOff, setIsCompensatoryTimeOff] = useState(false);
  const [isPreApproved, setIsPreApproved] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date: initialValues.date ? dayjs(initialValues.date) : undefined,
        startTime: initialValues.startTime
          ? dayjs(initialValues.startTime, 'HH:mm:ss')
          : undefined,
        endTime: initialValues.endTime
          ? dayjs(initialValues.endTime, 'HH:mm:ss')
          : undefined,
      });
      setIsCompensatoryTimeOff(initialValues.isCompensatoryTimeOff ?? false);
      setIsPreApproved(initialValues.isPreApproved ?? false);
      setIsEmergency(initialValues.isEmergency ?? false);
    } else {
      form.setFieldsValue({
        overtimeType: 'Regular',
        payMultiplier: 1.5,
        breakMinutes: 0,
        isCompensatoryTimeOff: false,
        isPreApproved: false,
        isEmergency: false,
      });
    }
  }, [form, initialValues]);

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      date: values.date?.format('YYYY-MM-DD'),
      startTime: values.startTime?.format('HH:mm:ss'),
      endTime: values.endTime?.format('HH:mm:ss'),
    };
    onFinish(formattedValues);
  };

  // Calculate planned hours when times change
  const calculateHours = () => {
    const startTime = form.getFieldValue('startTime');
    const endTime = form.getFieldValue('endTime');
    const breakMinutes = form.getFieldValue('breakMinutes') || 0;

    if (startTime && endTime) {
      const start = dayjs(startTime);
      const end = dayjs(endTime);
      let diff = end.diff(start, 'hour', true);
      if (diff < 0) diff += 24; // Handle overnight
      const hours = Math.max(0, diff - breakMinutes / 60);
      form.setFieldValue('plannedHours', Math.round(hours * 100) / 100);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
      className="overtime-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ClockIcon className="w-16 h-16 text-white/90" />
              <p className="mt-4 text-lg font-medium text-white/90">
                Fazla Mesai Talebi
              </p>
              <p className="text-sm text-white/60">
                Ek çalışma saatlerini kaydedin
              </p>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1 text-red-500 inline" /> Acil Durum
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  Acil durum mesaisi mi?
                </div>
              </div>
              <Form.Item name="isEmergency" valuePropName="checked" noStyle>
                <Switch
                  checked={isEmergency}
                  onChange={(val) => {
                    setIsEmergency(val);
                    form.setFieldValue('isEmergency', val);
                  }}
                />
              </Form.Item>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Ön Onaylı
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  Önceden onay alındı mı?
                </div>
              </div>
              <Form.Item name="isPreApproved" valuePropName="checked" noStyle>
                <Switch
                  checked={isPreApproved}
                  onChange={(val) => {
                    setIsPreApproved(val);
                    form.setFieldValue('isPreApproved', val);
                  }}
                />
              </Form.Item>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Telafi İzni
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  Ödeme yerine izin olarak kullanılacak
                </div>
              </div>
              <Form.Item
                name="isCompensatoryTimeOff"
                valuePropName="checked"
                noStyle
              >
                <Switch
                  checked={isCompensatoryTimeOff}
                  onChange={(val) => {
                    setIsCompensatoryTimeOff(val);
                    form.setFieldValue('isCompensatoryTimeOff', val);
                  }}
                />
              </Form.Item>
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.plannedHours || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Planlanan Saat</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.actualHours || '-'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Gerçekleşen</div>
              </div>
              {initialValues.calculatedAmount && (
                <div className="p-4 bg-green-50 rounded-xl text-center col-span-2">
                  <div className="text-2xl font-semibold text-green-600">
                    {initialValues.calculatedAmount.toLocaleString('tr-TR')}{' '}
                    {initialValues.currency}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Hesaplanan Tutar
                  </div>
                </div>
              )}
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Reason - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="reason"
              rules={[
                { required: true, message: 'Sebep zorunludur' },
                { max: 500, message: 'En fazla 500 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Fazla mesai sebebi"
                variant="borderless"
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  padding: '0',
                  color: '#1a1a1a',
                }}
                className="placeholder:text-gray-300"
              />
            </Form.Item>
            <Form.Item name="description" className="mb-0 mt-2">
              <TextArea
                placeholder="Detaylı açıklama..."
                variant="borderless"
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{
                  fontSize: '15px',
                  padding: '0',
                  color: '#666',
                  resize: 'none',
                }}
                className="placeholder:text-gray-300"
              />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Basic Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Temel Bilgiler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Çalışan *</div>
                <Form.Item
                  name="employeeId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Select
                    placeholder="Çalışan seçin"
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    options={employees.map((e) => ({
                      value: e.id,
                      label: e.fullName,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Mesai Tipi *</div>
                <Form.Item
                  name="overtimeType"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Select
                    placeholder="Tip seçin"
                    variant="filled"
                    options={overtimeTypeOptions}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Date & Time */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <ClockIcon className="w-4 h-4 mr-1 inline" /> Tarih ve Saat
            </Text>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Tarih *</div>
                <Form.Item
                  name="date"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    variant="filled"
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Başlangıç *</div>
                <Form.Item
                  name="startTime"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <TimePicker
                    style={{ width: '100%' }}
                    variant="filled"
                    format="HH:mm"
                    placeholder="Saat seçin"
                    onChange={calculateHours}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Bitiş *</div>
                <Form.Item
                  name="endTime"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <TimePicker
                    style={{ width: '100%' }}
                    variant="filled"
                    format="HH:mm"
                    placeholder="Saat seçin"
                    onChange={calculateHours}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Mola (dk)</div>
                <Form.Item name="breakMinutes" className="mb-3">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    variant="filled"
                    placeholder="0"
                    onChange={calculateHours}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Planlanan Saat *</div>
                <Form.Item
                  name="plannedHours"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={0.5}
                    variant="filled"
                    placeholder="2.5"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Ödeme Çarpanı</div>
                <Form.Item name="payMultiplier" className="mb-3">
                  <Select
                    variant="filled"
                    options={payMultiplierOptions}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Project Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <DocumentTextIcon className="w-4 h-4 mr-1 inline" /> Proje / Görev Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Görev ID</div>
                <Form.Item name="taskId" className="mb-3">
                  <Input placeholder="TASK-123" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Maliyet Merkezi</div>
                <Form.Item name="costCenter" className="mb-3">
                  <Input placeholder="CC-001" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
            <div className="text-xs text-gray-400 mb-1">Yapılan İşler</div>
            <Form.Item name="workDetails" className="mb-0">
              <TextArea
                rows={3}
                placeholder="Mesai süresince yapılan işlerin detayları..."
                variant="filled"
              />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Notes */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Notlar
            </Text>
            <Form.Item name="notes" className="mb-0">
              <TextArea rows={2} placeholder="Ek notlar..." variant="filled" />
            </Form.Item>
          </div>
        </Col>
      </Row>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
