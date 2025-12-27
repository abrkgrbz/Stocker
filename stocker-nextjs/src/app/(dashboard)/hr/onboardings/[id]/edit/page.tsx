'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Space, Form, Input, Select, DatePicker, InputNumber, Row, Col, Typography, Switch, Spin } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { useOnboarding, useUpdateOnboarding, useEmployees } from '@/lib/api/hooks/useHR';

const { TextArea } = Input;
const { Text } = Typography;

const statusOptions = [
  { value: 'NotStarted', label: 'Baslamadi' },
  { value: 'InProgress', label: 'Devam Ediyor' },
  { value: 'Completed', label: 'Tamamlandi' },
  { value: 'OnHold', label: 'Beklemede' },
  { value: 'Cancelled', label: 'Iptal' },
];

export default function EditOnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: onboarding, isLoading } = useOnboarding(id);
  const updateOnboarding = useUpdateOnboarding();
  const { data: employees } = useEmployees();

  useEffect(() => {
    if (onboarding) {
      form.setFieldsValue({
        ...onboarding,
        startDate: onboarding.startDate ? dayjs(onboarding.startDate) : null,
        plannedEndDate: onboarding.plannedEndDate ? dayjs(onboarding.plannedEndDate) : null,
        actualEndDate: onboarding.actualEndDate ? dayjs(onboarding.actualEndDate) : null,
        firstDayOfWork: onboarding.firstDayOfWork ? dayjs(onboarding.firstDayOfWork) : null,
      });
    }
  }, [onboarding, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        startDate: values.startDate?.toISOString(),
        plannedEndDate: values.plannedEndDate?.toISOString(),
        actualEndDate: values.actualEndDate?.toISOString(),
        firstDayOfWork: values.firstDayOfWork?.toISOString(),
      };
      await updateOnboarding.mutateAsync({ id, data });
      router.push(`/hr/onboardings/${id}`);
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
              <h1 className="text-xl font-semibold text-gray-900 m-0">Onboarding Duzenle</h1>
              <p className="text-sm text-gray-400 m-0">{onboarding?.employeeName}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/hr/onboardings/${id}`)}>Vazgec</Button>
            <Button type="primary" icon={<CheckIcon className="w-4 h-4" />} loading={updateOnboarding.isPending} onClick={() => form.submit()} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Kaydet</Button>
          </Space>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={48}>
            <Col xs={24} lg={10}>
              <div className="mb-8">
                <div style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', borderRadius: '16px', padding: '40px 20px', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <RocketLaunchIcon className="w-16 h-16 text-white/90" />
                  <p className="mt-4 text-lg font-medium text-white/90">Ise Alisim</p>
                  <p className="text-sm text-white/60">Yeni calisan oryantasyonu</p>
                </div>
              </div>
              <div className="mb-6">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Durum & Ilerleme</Text>
                <Form.Item name="status" className="mb-3"><Select options={statusOptions} placeholder="Durum" /></Form.Item>
                <Form.Item name="completionPercentage" className="mb-3"><InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="Tamamlanma %" /></Form.Item>
              </div>
            </Col>
            <Col xs={24} lg={14}>
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><UserIcon className="w-4 h-4 mr-1" /> Calisan & Mentor Bilgileri</Text>
                <Form.Item name="employeeId" rules={[{ required: true }]} className="mb-3">
                  <Select showSearch placeholder="Calisan secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="buddyId" className="mb-3"><Select showSearch placeholder="Buddy secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} allowClear /></Form.Item></Col>
                  <Col span={12}><Form.Item name="hrResponsibleId" className="mb-3"><Select showSearch placeholder="HR Sorumlusu secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} allowClear /></Form.Item></Col>
                </Row>
                <Form.Item name="itResponsibleId" className="mb-3"><Select showSearch placeholder="IT Sorumlusu secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} allowClear /></Form.Item>
                <Row gutter={16}>
                  <Col span={8}><Form.Item name="startDate" rules={[{ required: true }]} className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Baslangic" /></Form.Item></Col>
                  <Col span={8}><Form.Item name="plannedEndDate" className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Beklenen bitis" /></Form.Item></Col>
                  <Col span={8}><Form.Item name="actualEndDate" className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Gercek bitis" /></Form.Item></Col>
                </Row>
              </div>
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><ComputerDesktopIcon className="w-4 h-4 mr-1" /> Ekipman & IT Erisimi</Text>
                <Row gutter={16}>
                  <Col span={8}><Form.Item name="deskPrepared" valuePropName="checked" className="mb-3"><Switch checkedChildren="Is Istasyonu" unCheckedChildren="Is Istasyonu" /></Form.Item></Col>
                  <Col span={8}><Form.Item name="laptopProvided" valuePropName="checked" className="mb-3"><Switch checkedChildren="Bilgisayar" unCheckedChildren="Bilgisayar" /></Form.Item></Col>
                  <Col span={8}><Form.Item name="phoneProvided" valuePropName="checked" className="mb-3"><Switch checkedChildren="Telefon" unCheckedChildren="Telefon" /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}><Form.Item name="emailAccountCreated" valuePropName="checked" className="mb-3"><Switch checkedChildren="E-posta" unCheckedChildren="E-posta" /></Form.Item></Col>
                  <Col span={8}><Form.Item name="systemAccessGranted" valuePropName="checked" className="mb-3"><Switch checkedChildren="Sistem Erisimi" unCheckedChildren="Sistem Erisimi" /></Form.Item></Col>
                  <Col span={8}><Form.Item name="vpnAccessGranted" valuePropName="checked" className="mb-3"><Switch checkedChildren="VPN" unCheckedChildren="VPN" /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}><Form.Item name="accessCardProvided" valuePropName="checked" className="mb-3"><Switch checkedChildren="Gec Karti" unCheckedChildren="Gec Karti" /></Form.Item></Col>
                </Row>
              </div>
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><DocumentTextIcon className="w-4 h-4 mr-1" /> Dokumantasyon & Egitim</Text>
                <Row gutter={16}>
                  <Col span={8}><Form.Item name="contractSigned" valuePropName="checked" className="mb-3"><Switch checkedChildren="Sozlesme" unCheckedChildren="Sozlesme" /></Form.Item></Col>
                  <Col span={8}><Form.Item name="ndaSigned" valuePropName="checked" className="mb-3"><Switch checkedChildren="NDA" unCheckedChildren="NDA" /></Form.Item></Col>
                  <Col span={8}><Form.Item name="policiesAcknowledged" valuePropName="checked" className="mb-3"><Switch checkedChildren="Politikalar" unCheckedChildren="Politikalar" /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}><Form.Item name="safetyTrainingCompleted" valuePropName="checked" className="mb-3"><Switch checkedChildren="Is Guvenligi" unCheckedChildren="Is Guvenligi" /></Form.Item></Col>
                  <Col span={8}><Form.Item name="complianceTrainingCompleted" valuePropName="checked" className="mb-3"><Switch checkedChildren="Uyum" unCheckedChildren="Uyum" /></Form.Item></Col>
                  <Col span={8}><Form.Item name="orientationCompleted" valuePropName="checked" className="mb-3"><Switch checkedChildren="Oryantasyon" unCheckedChildren="Oryantasyon" /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}><Form.Item name="teamIntroductionDone" valuePropName="checked" className="mb-3"><Switch checkedChildren="Takim Tanitimi" unCheckedChildren="Takim Tanitimi" /></Form.Item></Col>
                  <Col span={8}><Form.Item name="productTrainingCompleted" valuePropName="checked" className="mb-3"><Switch checkedChildren="Urun Egitimi" unCheckedChildren="Urun Egitimi" /></Form.Item></Col>
                </Row>
              </div>
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Notlar & Geri Bildirim</Text>
                <Form.Item name="notes" className="mb-3"><TextArea rows={3} placeholder="Ek notlar..." variant="filled" /></Form.Item>
                <Form.Item name="feedback" className="mb-0"><TextArea rows={3} placeholder="Calisan geri bildirimi..." variant="filled" /></Form.Item>
              </div>
            </Col>
          </Row>
          <Form.Item hidden><button type="submit" /></Form.Item>
        </Form>
      </div>
    </div>
  );
}
