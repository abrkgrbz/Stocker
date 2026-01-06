'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Select, DatePicker, InputNumber, Row, Col, Typography } from 'antd';
import { ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { useCreateTimeSheet, useEmployees } from '@/lib/api/hooks/useHR';

const { TextArea } = Input;
const { Text } = Typography;

const statusOptions = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'Submitted', label: 'Gönderildi' },
  { value: 'Approved', label: 'Onaylandı' },
  { value: 'Rejected', label: 'Reddedildi' },
  { value: 'Paid', label: 'Ödendi' },
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
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Puantaj"
      subtitle="Çalışan çalışma saatlerini kaydedin"
      icon={<ClockIcon className="w-5 h-5" />}
      cancelPath="/hr/time-sheets"
      loading={createTimeSheet.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'Draft' }}>
        <Row gutter={48}>
          <Col xs={24} lg={10}>
            <div className="mb-8">
              <div
                style={{
                  background: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
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
                <p className="mt-4 text-lg font-medium text-white/90">Puantaj</p>
                <p className="text-sm text-white/60">Çalışma saati takibi</p>
              </div>
            </div>
            <div className="mb-6">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Durum</Text>
              <Form.Item name="status" className="mb-3">
                <Select options={statusOptions} placeholder="Durum" />
              </Form.Item>
            </div>
          </Col>
          <Col xs={24} lg={14}>
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                <UserIcon className="w-4 h-4 mr-1 inline" /> Çalışan & Dönem Bilgileri
              </Text>
              <Form.Item name="employeeId" rules={[{ required: true, message: 'Çalışan seçimi gerekli' }]} className="mb-3">
                <Select
                  showSearch
                  placeholder="Çalışan seçin"
                  optionFilterProp="label"
                  options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="periodStart" rules={[{ required: true, message: 'Başlangıç tarihi gerekli' }]} className="mb-3">
                    <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Dönem başlangıç" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="periodEnd" rules={[{ required: true, message: 'Bitiş tarihi gerekli' }]} className="mb-3">
                    <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Dönem bitiş" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                <ClockIcon className="w-4 h-4 mr-1 inline" /> Çalışma Saatleri
              </Text>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="totalRegularHours" className="mb-3">
                    <InputNumber style={{ width: '100%' }} placeholder="Normal saat" min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="totalOvertimeHours" className="mb-3">
                    <InputNumber style={{ width: '100%' }} placeholder="Fazla mesai saat" min={0} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="weekendHours" className="mb-3">
                    <InputNumber style={{ width: '100%' }} placeholder="Hafta sonu saat" min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="holidayHours" className="mb-3">
                    <InputNumber style={{ width: '100%' }} placeholder="Tatil günü saat" min={0} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="nightShiftHours" className="mb-3">
                    <InputNumber style={{ width: '100%' }} placeholder="Gece mesaisi saat" min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="paidLeaveHours" className="mb-3">
                    <InputNumber style={{ width: '100%' }} placeholder="Ücretli izin saat" min={0} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="unpaidLeaveHours" className="mb-3">
                    <InputNumber style={{ width: '100%' }} placeholder="Ücretsiz izin saat" min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="sickLeaveHours" className="mb-3">
                    <InputNumber style={{ width: '100%' }} placeholder="Hastalık izni saat" min={0} />
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Notlar</Text>
              <Form.Item name="notes" className="mb-0">
                <TextArea rows={3} placeholder="Ek notlar..." variant="filled" />
              </Form.Item>
            </div>
          </Col>
        </Row>
        <Form.Item hidden>
          <button type="submit" />
        </Form.Item>
      </Form>
    </FormPageLayout>
  );
}
