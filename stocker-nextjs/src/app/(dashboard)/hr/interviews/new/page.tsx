'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Select, DatePicker, InputNumber, Row, Col, Typography } from 'antd';
import {
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useCreateInterview, useEmployees, useJobApplications } from '@/lib/api/hooks/useHR';
import { FormPageLayout } from '@/components/patterns';

const { TextArea } = Input;
const { Text } = Typography;

const statusOptions = [
  { value: 'Scheduled', label: 'Planlandi' },
  { value: 'Confirmed', label: 'Onaylandi' },
  { value: 'InProgress', label: 'Devam Ediyor' },
  { value: 'Completed', label: 'Tamamlandi' },
  { value: 'Cancelled', label: 'Iptal' },
  { value: 'NoShow', label: 'Gelmedi' },
  { value: 'Rescheduled', label: 'Yeniden Planlandi' },
];

const interviewTypeOptions = [
  { value: 'Phone', label: 'Telefon' },
  { value: 'Video', label: 'Video' },
  { value: 'InPerson', label: 'Yuz Yuze' },
  { value: 'Technical', label: 'Teknik' },
  { value: 'HR', label: 'IK' },
  { value: 'Panel', label: 'Panel' },
  { value: 'Final', label: 'Final' },
];

export default function NewInterviewPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createInterview = useCreateInterview();
  const { data: employees } = useEmployees();
  const { data: applications } = useJobApplications();

  const handleSubmit = async (values: any) => {
    try {
      const data = { ...values, scheduledDate: values.scheduledDate?.toISOString() };
      await createInterview.mutateAsync(data);
      router.push('/hr/interviews');
    } catch (error) {}
  };

  return (
    <FormPageLayout
      title="Yeni Mulakat"
      subtitle="Is gorusmesi planlayin"
      icon={<UserGroupIcon className="w-5 h-5" />}
      cancelPath="/hr/interviews"
      loading={createInterview.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'Scheduled', duration: 60 }}>
        <Row gutter={48}>
          <Col xs={24} lg={10}>
            <div className="mb-8">
              <div style={{ background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', borderRadius: '16px', padding: '40px 20px', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <UserGroupIcon className="w-16 h-16 text-white/90" />
                <p className="mt-4 text-lg font-medium text-white/90">Mulakat</p>
                <p className="text-sm text-white/60">Is gorusmesi</p>
              </div>
            </div>
            <div className="mb-6">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Durum & Tur</Text>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="status" className="mb-3"><Select options={statusOptions} placeholder="Durum" /></Form.Item></Col>
                <Col span={12}><Form.Item name="interviewType" rules={[{ required: true }]} className="mb-3"><Select options={interviewTypeOptions} placeholder="Mulakat turu" /></Form.Item></Col>
              </Row>
            </div>
          </Col>
          <Col xs={24} lg={14}>
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><UserIcon className="w-4 h-4 mr-1" /> Basvuru & Gorusmeci</Text>
              <Form.Item name="applicationId" rules={[{ required: true, message: 'Basvuru secimi zorunludur' }]} className="mb-3">
                <Select showSearch placeholder="Basvuru secin" optionFilterProp="label" options={applications?.map((a: any) => ({ value: a.id, label: `${a.candidateName} - ${a.positionTitle}` }))} />
              </Form.Item>
              <Form.Item name="interviewerId" rules={[{ required: true }]} className="mb-3">
                <Select showSearch placeholder="Gorusmeci secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} />
              </Form.Item>
            </div>
            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Planlama</Text>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="scheduledDate" rules={[{ required: true }]} className="mb-3"><DatePicker showTime style={{ width: '100%' }} format="DD.MM.YYYY HH:mm" placeholder="Tarih ve saat" /></Form.Item></Col>
                <Col span={12}><Form.Item name="duration" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Sure (dakika)" addonAfter="dk" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="location" className="mb-3"><Input placeholder="Konum" variant="filled" /></Form.Item></Col>
                <Col span={12}><Form.Item name="videoLink" className="mb-3"><Input placeholder="Video link (Zoom, Teams vb.)" variant="filled" /></Form.Item></Col>
              </Row>
            </div>
            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Notlar</Text>
              <Form.Item name="notes" className="mb-0"><TextArea rows={3} placeholder="Mulakat notlari..." variant="filled" /></Form.Item>
            </div>
          </Col>
        </Row>
        <Form.Item hidden><button type="submit" /></Form.Item>
      </Form>
    </FormPageLayout>
  );
}
