'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, Select, DatePicker, InputNumber, Row, Col, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, GiftOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { useCreateEmployeeBenefit, useEmployees } from '@/lib/api/hooks/useHR';

const { TextArea } = Input;
const { Text } = Typography;

const statusOptions = [
  { value: 'Active', label: 'Aktif' },
  { value: 'Pending', label: 'Beklemede' },
  { value: 'Expired', label: 'Suresi Doldu' },
  { value: 'Cancelled', label: 'Iptal' },
  { value: 'Suspended', label: 'Askiya Alindi' },
];

const benefitTypeOptions = [
  { value: 'HealthInsurance', label: 'Saglik Sigortasi' },
  { value: 'LifeInsurance', label: 'Hayat Sigortasi' },
  { value: 'DentalInsurance', label: 'Dis Sigortasi' },
  { value: 'VisionInsurance', label: 'Goz Sigortasi' },
  { value: 'RetirementPlan', label: 'Emeklilik Plani' },
  { value: 'MealCard', label: 'Yemek Karti' },
  { value: 'TransportAllowance', label: 'Ulasim Yardimi' },
  { value: 'CompanyCar', label: 'Sirket Araci' },
  { value: 'FuelCard', label: 'Yakit Karti' },
  { value: 'GymMembership', label: 'Spor Salonu Uyeligi' },
  { value: 'EducationSupport', label: 'Egitim Destegi' },
  { value: 'ChildcareSupport', label: 'Cocuk Bakimi Destegi' },
  { value: 'HousingAllowance', label: 'Konut Yardimi' },
  { value: 'PhoneAllowance', label: 'Telefon Yardimi' },
  { value: 'Other', label: 'Diger' },
];

export default function NewEmployeeBenefitPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createBenefit = useCreateEmployeeBenefit();
  const { data: employees } = useEmployees();

  const handleSubmit = async (values: any) => {
    try {
      const data = { ...values, startDate: values.startDate?.toISOString(), endDate: values.endDate?.toISOString() };
      await createBenefit.mutateAsync(data);
      router.push('/hr/employee-benefits');
    } catch (error) {}
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 px-8 py-4" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} type="text" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Yan Hak</h1>
              <p className="text-sm text-gray-400 m-0">Calisana yan hak tanimlayin</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/employee-benefits')}>Vazgec</Button>
            <Button type="primary" icon={<SaveOutlined />} loading={createBenefit.isPending} onClick={() => form.submit()} style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>Kaydet</Button>
          </Space>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'Active', currency: 'TRY' }}>
          <Row gutter={48}>
            <Col xs={24} lg={10}>
              <div className="mb-8">
                <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '16px', padding: '40px 20px', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <GiftOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
                  <p className="mt-4 text-lg font-medium text-white/90">Yan Hak</p>
                  <p className="text-sm text-white/60">Calisan faydasi</p>
                </div>
              </div>
              <div className="mb-6">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Durum</Text>
                <Form.Item name="status" className="mb-3"><Select options={statusOptions} placeholder="Durum" /></Form.Item>
              </div>
            </Col>
            <Col xs={24} lg={14}>
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><UserOutlined className="mr-1" /> Calisan & Yan Hak Bilgileri</Text>
                <Form.Item name="employeeId" rules={[{ required: true, message: 'Calisan secimi zorunludur' }]} className="mb-3">
                  <Select showSearch placeholder="Calisan secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="benefitType" rules={[{ required: true }]} className="mb-3"><Select options={benefitTypeOptions} placeholder="Yan hak turu" /></Form.Item></Col>
                  <Col span={12}><Form.Item name="benefitName" rules={[{ required: true }]} className="mb-3"><Input placeholder="Yan hak adi" variant="filled" /></Form.Item></Col>
                </Row>
                <Form.Item name="provider" className="mb-3"><Input placeholder="Saglayici" variant="filled" /></Form.Item>
              </div>
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><CalendarOutlined className="mr-1" /> Tarihler & Deger</Text>
                <Row gutter={16}>
                  <Col span={8}><Form.Item name="startDate" rules={[{ required: true }]} className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Baslangic" /></Form.Item></Col>
                  <Col span={8}><Form.Item name="endDate" className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Bitis" /></Form.Item></Col>
                  <Col span={8}><Form.Item name="value" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Deger" /></Form.Item></Col>
                </Row>
                <Form.Item name="currency" className="mb-3"><Select options={[{ value: 'TRY', label: 'TRY' }, { value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }]} style={{ width: 120 }} /></Form.Item>
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
