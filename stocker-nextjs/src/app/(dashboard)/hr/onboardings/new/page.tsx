'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Select, DatePicker, InputNumber, Row, Col, Typography, Switch } from 'antd';
import {
  ComputerDesktopIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useCreateOnboarding, useEmployees } from '@/lib/api/hooks/useHR';
import { FormPageLayout } from '@/components/patterns';

const { TextArea } = Input;
const { Text } = Typography;

const statusOptions = [
  { value: 'NotStarted', label: 'Baslamadi' },
  { value: 'InProgress', label: 'Devam Ediyor' },
  { value: 'Completed', label: 'Tamamlandi' },
  { value: 'OnHold', label: 'Beklemede' },
  { value: 'Cancelled', label: 'Iptal' },
];

export default function NewOnboardingPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createOnboarding = useCreateOnboarding();
  const { data: employees } = useEmployees();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        startDate: values.startDate?.toISOString(),
        expectedEndDate: values.expectedEndDate?.toISOString(),
        firstDaySchedule: values.firstDaySchedule?.toISOString(),
        firstWeekCheckIn: values.firstWeekCheckIn?.toISOString(),
        thirtyDayCheckIn: values.thirtyDayCheckIn?.toISOString(),
        sixtyDayCheckIn: values.sixtyDayCheckIn?.toISOString(),
        ninetyDayCheckIn: values.ninetyDayCheckIn?.toISOString(),
      };
      await createOnboarding.mutateAsync(data);
      router.push('/hr/onboardings');
    } catch (error) {}
  };

  return (
    <FormPageLayout
      title="Yeni Onboarding"
      subtitle="Yeni calisan oryantasyonu olusturun"
      icon={<RocketLaunchIcon className="w-5 h-5" />}
      cancelPath="/hr/onboardings"
      loading={createOnboarding.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'NotStarted', completionPercentage: 0 }}>
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
                <Col span={12}><Form.Item name="mentorId" className="mb-3"><Select showSearch placeholder="Mentor secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} allowClear /></Form.Item></Col>
                <Col span={12}><Form.Item name="buddyId" className="mb-3"><Select showSearch placeholder="Buddy secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} allowClear /></Form.Item></Col>
              </Row>
              <Form.Item name="hrRepresentativeId" className="mb-3"><Select showSearch placeholder="HR Sorumlusu secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} allowClear /></Form.Item>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="startDate" rules={[{ required: true }]} className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Baslangic tarihi" /></Form.Item></Col>
                <Col span={12}><Form.Item name="expectedEndDate" className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Beklenen bitis" /></Form.Item></Col>
              </Row>
            </div>
            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><ComputerDesktopIcon className="w-4 h-4 mr-1" /> Ekipman & IT Erisimi</Text>
              <Row gutter={16}>
                <Col span={8}><Form.Item name="workstationAssigned" valuePropName="checked" className="mb-3"><Switch checkedChildren="Is Istasyonu" unCheckedChildren="Is Istasyonu" /></Form.Item></Col>
                <Col span={8}><Form.Item name="computerAssigned" valuePropName="checked" className="mb-3"><Switch checkedChildren="Bilgisayar" unCheckedChildren="Bilgisayar" /></Form.Item></Col>
                <Col span={8}><Form.Item name="phoneAssigned" valuePropName="checked" className="mb-3"><Switch checkedChildren="Telefon" unCheckedChildren="Telefon" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}><Form.Item name="emailSetup" valuePropName="checked" className="mb-3"><Switch checkedChildren="E-posta" unCheckedChildren="E-posta" /></Form.Item></Col>
                <Col span={8}><Form.Item name="networkAccess" valuePropName="checked" className="mb-3"><Switch checkedChildren="Ag Erisimi" unCheckedChildren="Ag Erisimi" /></Form.Item></Col>
                <Col span={8}><Form.Item name="vpnAccess" valuePropName="checked" className="mb-3"><Switch checkedChildren="VPN" unCheckedChildren="VPN" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}><Form.Item name="accessCardIssued" valuePropName="checked" className="mb-3"><Switch checkedChildren="Gec Karti" unCheckedChildren="Gec Karti" /></Form.Item></Col>
                <Col span={8}><Form.Item name="softwareLicenses" valuePropName="checked" className="mb-3"><Switch checkedChildren="Yazilim" unCheckedChildren="Yazilim" /></Form.Item></Col>
                <Col span={8}><Form.Item name="toolsProvided" valuePropName="checked" className="mb-3"><Switch checkedChildren="Ekipman" unCheckedChildren="Ekipman" /></Form.Item></Col>
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
                <Col span={8}><Form.Item name="handbookProvided" valuePropName="checked" className="mb-3"><Switch checkedChildren="El Kitabi" unCheckedChildren="El Kitabi" /></Form.Item></Col>
                <Col span={8}><Form.Item name="safetyTrainingComplete" valuePropName="checked" className="mb-3"><Switch checkedChildren="Is Guvenligi" unCheckedChildren="Is Guvenligi" /></Form.Item></Col>
                <Col span={8}><Form.Item name="complianceTrainingComplete" valuePropName="checked" className="mb-3"><Switch checkedChildren="Uyum" unCheckedChildren="Uyum" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}><Form.Item name="orientationComplete" valuePropName="checked" className="mb-3"><Switch checkedChildren="Oryantasyon" unCheckedChildren="Oryantasyon" /></Form.Item></Col>
                <Col span={8}><Form.Item name="departmentIntroComplete" valuePropName="checked" className="mb-3"><Switch checkedChildren="Dept. Tanitim" unCheckedChildren="Dept. Tanitim" /></Form.Item></Col>
                <Col span={8}><Form.Item name="systemsTrainingComplete" valuePropName="checked" className="mb-3"><Switch checkedChildren="Sistem Egitimi" unCheckedChildren="Sistem Egitimi" /></Form.Item></Col>
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
    </FormPageLayout>
  );
}
