'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, Select, DatePicker, InputNumber, Row, Col, Typography, Switch } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  UserIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';
import { useCreateEmployeeSkill, useEmployees } from '@/lib/api/hooks/useHR';

const { TextArea } = Input;
const { Text } = Typography;

const proficiencyOptions = [
  { value: 'Beginner', label: 'Baslangic' },
  { value: 'Elementary', label: 'Temel' },
  { value: 'Intermediate', label: 'Orta' },
  { value: 'Advanced', label: 'Ileri' },
  { value: 'Expert', label: 'Uzman' },
  { value: 'Master', label: 'Usta' },
];

const categoryOptions = [
  { value: 'Technical', label: 'Teknik' },
  { value: 'Language', label: 'Dil' },
  { value: 'Soft', label: 'Yumusak Beceri' },
  { value: 'Management', label: 'Yonetim' },
  { value: 'Tools', label: 'Arac/Yazilim' },
  { value: 'Industry', label: 'Sektor' },
  { value: 'Other', label: 'Diger' },
];

export default function NewEmployeeSkillPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createSkill = useCreateEmployeeSkill();
  const { data: employees } = useEmployees();

  const handleSubmit = async (values: any) => {
    try {
      const data = { ...values, lastUsedDate: values.lastUsedDate?.toISOString(), certificationDate: values.certificationDate?.toISOString(), certificationExpiry: values.certificationExpiry?.toISOString() };
      await createSkill.mutateAsync(data);
      router.push('/hr/employee-skills');
    } catch (error) {}
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 px-8 py-4" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()} type="text" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Yetkinlik</h1>
              <p className="text-sm text-gray-400 m-0">Calisana yetkinlik ekleyin</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/employee-skills')}>Vazgec</Button>
            <Button type="primary" icon={<CheckIcon className="w-4 h-4" />} loading={createSkill.isPending} onClick={() => form.submit()} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Kaydet</Button>
          </Space>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ proficiencyLevel: 'Intermediate', isCertified: false, isVerified: false }}>
          <Row gutter={48}>
            <Col xs={24} lg={10}>
              <div className="mb-8">
                <div style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', borderRadius: '16px', padding: '40px 20px', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <WrenchIcon className="w-4 h-4" style={{ fontSize: '64px', color: 'rgba(0,0,0,0.6)' }} />
                  <p className="mt-4 text-lg font-medium text-gray-800">Yetkinlik</p>
                  <p className="text-sm text-gray-600">Calisan beceri ve yetenekleri</p>
                </div>
              </div>
              <div className="mb-6">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Seviye & Dogrulama</Text>
                <Form.Item name="proficiencyLevel" className="mb-3"><Select options={proficiencyOptions} placeholder="Seviye" /></Form.Item>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="isCertified" valuePropName="checked" className="mb-3"><Switch checkedChildren="Sertifikali" unCheckedChildren="Sertifikasiz" /></Form.Item></Col>
                  <Col span={12}><Form.Item name="isVerified" valuePropName="checked" className="mb-3"><Switch checkedChildren="Dogrulanmis" unCheckedChildren="Dogrulanmamis" /></Form.Item></Col>
                </Row>
              </div>
            </Col>
            <Col xs={24} lg={14}>
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><UserIcon className="w-4 h-4" className="mr-1" /> Calisan & Yetkinlik Bilgileri</Text>
                <Form.Item name="employeeId" rules={[{ required: true, message: 'Calisan secimi zorunludur' }]} className="mb-3">
                  <Select showSearch placeholder="Calisan secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="skillName" rules={[{ required: true }]} className="mb-3"><Input placeholder="Yetkinlik adi" variant="filled" /></Form.Item></Col>
                  <Col span={12}><Form.Item name="skillCategory" className="mb-3"><Select options={categoryOptions} placeholder="Kategori" allowClear /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="yearsOfExperience" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Deneyim (yil)" /></Form.Item></Col>
                  <Col span={12}><Form.Item name="lastUsedDate" className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Son kullanim" /></Form.Item></Col>
                </Row>
              </div>
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Sertifika Bilgileri</Text>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="certificationName" className="mb-3"><Input placeholder="Sertifika adi" variant="filled" /></Form.Item></Col>
                  <Col span={12}><Form.Item name="issuingOrganization" className="mb-3"><Input placeholder="Veren kurum" variant="filled" /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="certificationDate" className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Sertifika tarihi" /></Form.Item></Col>
                  <Col span={12}><Form.Item name="certificationExpiry" className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Gecerlilik bitis" /></Form.Item></Col>
                </Row>
                <Form.Item name="credentialId" className="mb-3"><Input placeholder="Sertifika ID" variant="filled" /></Form.Item>
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
