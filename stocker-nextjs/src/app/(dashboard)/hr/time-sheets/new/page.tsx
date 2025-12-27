'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, Select, DatePicker, InputNumber, Row, Col, Typography } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useCreateTimeSheet, useEmployees } from '@/lib/api/hooks/useHR';

const { TextArea } = Input;
const { Text } = Typography;

const statusOptions = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'Submitted', label: 'Gonderildi' },
  { value: 'Approved', label: 'Onaylandi' },
  { value: 'Rejected', label: 'Reddedildi' },
  { value: 'Paid', label: 'Odendi' },
];

export default function NewTimeSheetPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createTimeSheet = useCreateTimeSheet();
  const { data: employees } = useEmployees();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        periodStart: values.periodStart?.toISOString(),
        periodEnd: values.periodEnd?.toISOString(),
        submittedDate: values.submittedDate?.toISOString(),
      };
      await createTimeSheet.mutateAsync(data);
      router.push('/hr/time-sheets');
    } catch (error) {}
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 px-8 py-4" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()} type="text" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Puantaj</h1>
              <p className="text-sm text-gray-400 m-0">Calisan calisma saatlerini kaydedin</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/time-sheets')}>Vazgec</Button>
            <Button type="primary" icon={<CheckIcon className="w-4 h-4" />} loading={createTimeSheet.isPending} onClick={() => form.submit()} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Kaydet</Button>
          </Space>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'Draft' }}>
          <Row gutter={48}>
            <Col xs={24} lg={10}>
              <div className="mb-8">
                <div style={{ background: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)', borderRadius: '16px', padding: '40px 20px', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <ClockIcon className="w-4 h-4" style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
                  <p className="mt-4 text-lg font-medium text-white/90">Puantaj</p>
                  <p className="text-sm text-white/60">Calisma saati takibi</p>
                </div>
              </div>
              <div className="mb-6">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Durum</Text>
                <Form.Item name="status" className="mb-3"><Select options={statusOptions} placeholder="Durum" /></Form.Item>
              </div>
            </Col>
            <Col xs={24} lg={14}>
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><UserIcon className="w-4 h-4" className="mr-1" /> Calisan & Donem Bilgileri</Text>
                <Form.Item name="employeeId" rules={[{ required: true }]} className="mb-3">
                  <Select showSearch placeholder="Calisan secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="periodStart" rules={[{ required: true }]} className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Donem baslangic" /></Form.Item></Col>
                  <Col span={12}><Form.Item name="periodEnd" rules={[{ required: true }]} className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Donem bitis" /></Form.Item></Col>
                </Row>
              </div>
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><ClockIcon className="w-4 h-4" className="mr-1" /> Calisma Saatleri</Text>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="totalRegularHours" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Normal saat" min={0} /></Form.Item></Col>
                  <Col span={12}><Form.Item name="totalOvertimeHours" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Fazla mesai saat" min={0} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="weekendHours" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Hafta sonu saat" min={0} /></Form.Item></Col>
                  <Col span={12}><Form.Item name="holidayHours" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Tatil gun saat" min={0} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="nightShiftHours" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Gece mesaisi saat" min={0} /></Form.Item></Col>
                  <Col span={12}><Form.Item name="paidLeaveHours" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Ucretli izin saat" min={0} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="unpaidLeaveHours" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Ucretsiz izin saat" min={0} /></Form.Item></Col>
                  <Col span={12}><Form.Item name="sickLeaveHours" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Hastalik izni saat" min={0} /></Form.Item></Col>
                </Row>
              </div>
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Notlar</Text>
                <Form.Item name="notes" className="mb-0"><TextArea rows={3} placeholder="Ek notlar..." variant="filled" /></Form.Item>
              </div>
            </Col>
          </Row>
          <Form.Item hidden><button type="submit" /></Form.Item>
        </Form>
      </div>
    </div>
  );
}
