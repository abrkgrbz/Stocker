'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Space, Form, Input, Select, DatePicker, InputNumber, Row, Col, Typography, Spin } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  StarIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { useSuccessionPlan, useUpdateSuccessionPlan, useEmployees, useDepartments, usePositions } from '@/lib/api/hooks/useHR';

const { TextArea } = Input;
const { Text } = Typography;

const statusOptions = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'Active', label: 'Aktif' },
  { value: 'UnderReview', label: 'Incelemede' },
  { value: 'Approved', label: 'Onaylandi' },
  { value: 'Implemented', label: 'Uygulandi' },
  { value: 'Archived', label: 'Arsivlendi' },
];

const priorityOptions = [
  { value: 'Critical', label: 'Kritik' },
  { value: 'High', label: 'Yuksek' },
  { value: 'Medium', label: 'Orta' },
  { value: 'Low', label: 'Dusuk' },
];

export default function EditSuccessionPlanPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: plan, isLoading } = useSuccessionPlan(id);
  const updatePlan = useUpdateSuccessionPlan();
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();
  const { data: positions } = usePositions();

  useEffect(() => {
    if (plan) {
      form.setFieldsValue({
        ...plan,
        targetDate: plan.targetDate ? dayjs(plan.targetDate) : null,
        lastReviewDate: plan.lastReviewDate ? dayjs(plan.lastReviewDate) : null,
        nextReviewDate: plan.nextReviewDate ? dayjs(plan.nextReviewDate) : null,
      });
    }
  }, [plan, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        targetDate: values.targetDate?.toISOString(),
        lastReviewDate: values.lastReviewDate?.toISOString(),
        nextReviewDate: values.nextReviewDate?.toISOString(),
      };
      await updatePlan.mutateAsync({ id, data });
      router.push(`/hr/succession-plans/${id}`);
    } catch (error) {}
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 px-8 py-4" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()} type="text" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Yedekleme Plani Duzenle</h1>
              <p className="text-sm text-gray-400 m-0">{plan?.positionTitle}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/hr/succession-plans/${id}`)}>Vazgec</Button>
            <Button type="primary" icon={<CheckIcon className="w-4 h-4" />} loading={updatePlan.isPending} onClick={() => form.submit()} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Kaydet</Button>
          </Space>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={48}>
            <Col xs={24} lg={10}>
              <div className="mb-8">
                <div style={{ background: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)', borderRadius: '16px', padding: '40px 20px', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <StarIcon className="w-16 h-16 text-white/90" />
                  <p className="mt-4 text-lg font-medium text-white/90">Yedekleme Plani</p>
                  <p className="text-sm text-white/60">Kritik pozisyon planlamasi</p>
                </div>
              </div>
              <div className="mb-6">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Durum & Oncelik</Text>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="status" className="mb-3"><Select options={statusOptions} placeholder="Durum" /></Form.Item></Col>
                  <Col span={12}><Form.Item name="priority" className="mb-3"><Select options={priorityOptions} placeholder="Oncelik" /></Form.Item></Col>
                </Row>
                <Form.Item name="readinessScore" className="mb-3"><InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="Hazirlik skoru (%)" /></Form.Item>
              </div>
            </Col>
            <Col xs={24} lg={14}>
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><UserIcon className="w-4 h-4 mr-1" /> Pozisyon Bilgileri</Text>
                <Form.Item name="positionId" rules={[{ required: true }]} className="mb-3">
                  <Select showSearch placeholder="Pozisyon secin" optionFilterProp="label" options={positions?.map((p: any) => ({ value: p.id, label: p.title }))} />
                </Form.Item>
                <Form.Item name="departmentId" className="mb-3">
                  <Select showSearch placeholder="Departman secin" optionFilterProp="label" options={departments?.map((d: any) => ({ value: d.id, label: d.name }))} allowClear />
                </Form.Item>
                <Form.Item name="incumbentId" className="mb-3">
                  <Select showSearch placeholder="Mevcut pozisyon sahibi" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} allowClear />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={8}><Form.Item name="targetDate" className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Hedef tarih" /></Form.Item></Col>
                  <Col span={8}><Form.Item name="lastReviewDate" className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Son inceleme" /></Form.Item></Col>
                  <Col span={8}><Form.Item name="nextReviewDate" className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Sonraki inceleme" /></Form.Item></Col>
                </Row>
              </div>
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><UserGroupIcon className="w-4 h-4 mr-1" /> Aday Havuzu</Text>
                <Row gutter={16}>
                  <Col span={16}><Form.Item name="primaryCandidateId" className="mb-3"><Select showSearch placeholder="Birincil aday" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} allowClear /></Form.Item></Col>
                  <Col span={8}><Form.Item name="primaryCandidateReadiness" className="mb-3"><InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="Hazirlik %" /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={16}><Form.Item name="secondaryCandidateId" className="mb-3"><Select showSearch placeholder="Ikincil aday" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} allowClear /></Form.Item></Col>
                  <Col span={8}><Form.Item name="secondaryCandidateReadiness" className="mb-3"><InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="Hazirlik %" /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={16}><Form.Item name="tertiaryCandidateId" className="mb-3"><Select showSearch placeholder="Ucuncul aday" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} allowClear /></Form.Item></Col>
                  <Col span={8}><Form.Item name="tertiaryCandidateReadiness" className="mb-3"><InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="Hazirlik %" /></Form.Item></Col>
                </Row>
              </div>
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Yetkinlik & Gelisim</Text>
                <Form.Item name="keyCompetencies" className="mb-3"><TextArea rows={3} placeholder="Kritik yetkinlikler..." variant="filled" /></Form.Item>
                <Form.Item name="developmentNeeds" className="mb-3"><TextArea rows={3} placeholder="Gelisim ihtiyaclari..." variant="filled" /></Form.Item>
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
