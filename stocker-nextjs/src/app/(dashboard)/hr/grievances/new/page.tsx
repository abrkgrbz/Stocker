'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, Select, DatePicker, Row, Col, Typography } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  ExclamationCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useCreateGrievance, useEmployees } from '@/lib/api/hooks/useHR';

const { TextArea } = Input;
const { Text } = Typography;

const statusOptions = [
  { value: 'Open', label: 'Acik' },
  { value: 'UnderReview', label: 'Incelemede' },
  { value: 'Investigating', label: 'Sorusturmada' },
  { value: 'PendingResolution', label: 'Cozum Bekliyor' },
  { value: 'Resolved', label: 'Cozuldu' },
  { value: 'Closed', label: 'Kapandi' },
  { value: 'Escalated', label: 'Eskalasyon' },
  { value: 'Withdrawn', label: 'Geri Cekildi' },
];

const priorityOptions = [
  { value: 'Low', label: 'Dusuk' },
  { value: 'Medium', label: 'Orta' },
  { value: 'High', label: 'Yuksek' },
  { value: 'Critical', label: 'Kritik' },
];

const grievanceTypeOptions = [
  { value: 'Harassment', label: 'Taciz' },
  { value: 'Discrimination', label: 'Ayrimcilik' },
  { value: 'WorkConditions', label: 'Calisma Kosullari' },
  { value: 'Management', label: 'Yonetim' },
  { value: 'Compensation', label: 'Ucretlendirme' },
  { value: 'Benefits', label: 'Yan Haklar' },
  { value: 'Policy', label: 'Politika' },
  { value: 'Safety', label: 'Is Guvenligi' },
  { value: 'Other', label: 'Diger' },
];

export default function NewGrievancePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createGrievance = useCreateGrievance();
  const { data: employees } = useEmployees();

  const handleSubmit = async (values: any) => {
    try {
      const data = { ...values, filedDate: values.filedDate?.toISOString() };
      await createGrievance.mutateAsync(data);
      router.push('/hr/grievances');
    } catch (error) {}
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 px-8 py-4" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()} type="text" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Sikayet</h1>
              <p className="text-sm text-gray-400 m-0">Calisan sikayeti olusturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/grievances')}>Vazgec</Button>
            <Button type="primary" icon={<CheckIcon className="w-4 h-4" />} loading={createGrievance.isPending} onClick={() => form.submit()} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Kaydet</Button>
          </Space>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'Open', priority: 'Medium' }}>
          <Row gutter={48}>
            <Col xs={24} lg={10}>
              <div className="mb-8">
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '40px 20px', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <ExclamationCircleIcon className="w-16 h-16 text-white/90" />
                  <p className="mt-4 text-lg font-medium text-white/90">Sikayet</p>
                  <p className="text-sm text-white/60">Calisan sikayeti</p>
                </div>
              </div>
              <div className="mb-6">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Durum & Oncelik</Text>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="status" className="mb-3"><Select options={statusOptions} placeholder="Durum" /></Form.Item></Col>
                  <Col span={12}><Form.Item name="priority" className="mb-3"><Select options={priorityOptions} placeholder="Oncelik" /></Form.Item></Col>
                </Row>
              </div>
            </Col>
            <Col xs={24} lg={14}>
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><UserIcon className="w-4 h-4 mr-1" /> Calisan & Sikayet Bilgileri</Text>
                <Form.Item name="employeeId" rules={[{ required: true, message: 'Calisan secimi zorunludur' }]} className="mb-3">
                  <Select showSearch placeholder="Calisan secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="grievanceType" rules={[{ required: true }]} className="mb-3"><Select options={grievanceTypeOptions} placeholder="Sikayet turu" /></Form.Item></Col>
                  <Col span={12}><Form.Item name="filedDate" rules={[{ required: true }]} className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Basvuru tarihi" /></Form.Item></Col>
                </Row>
                <Form.Item name="subject" rules={[{ required: true }]} className="mb-3"><Input placeholder="Konu" variant="filled" /></Form.Item>
              </div>
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Aciklama</Text>
                <Form.Item name="description" rules={[{ required: true }]} className="mb-3"><TextArea rows={4} placeholder="Sikayet aciklamasi..." variant="filled" /></Form.Item>
              </div>
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Inceleme</Text>
                <Form.Item name="assignedToId" className="mb-3">
                  <Select showSearch allowClear placeholder="Incelemeye atanacak kisi" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} />
                </Form.Item>
                <Form.Item name="investigationNotes" className="mb-0"><TextArea rows={3} placeholder="Sorusturma notlari..." variant="filled" /></Form.Item>
              </div>
            </Col>
          </Row>
          <Form.Item hidden><button type="submit" /></Form.Item>
        </Form>
      </div>
    </div>
  );
}
