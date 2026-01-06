'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Form, Input, Select, DatePicker, InputNumber, Row, Col, Typography } from 'antd';
import {
  CalendarIcon,
  GiftIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { useEmployeeBenefit, useUpdateEmployeeBenefit, useEmployees } from '@/lib/api/hooks/useHR';
import { FormPageLayout } from '@/components/patterns';

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

export default function EditEmployeeBenefitPage() {
  const params = useParams();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: benefit, isLoading, isError } = useEmployeeBenefit(id);
  const updateBenefit = useUpdateEmployeeBenefit();
  const { data: employees } = useEmployees();

  useEffect(() => {
    if (benefit) {
      form.setFieldsValue({
        ...benefit,
        startDate: benefit.startDate ? dayjs(benefit.startDate) : null,
        endDate: benefit.endDate ? dayjs(benefit.endDate) : null,
      });
    }
  }, [benefit, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        startDate: values.startDate?.toISOString(),
        endDate: values.endDate?.toISOString(),
      };
      await updateBenefit.mutateAsync({ id, data });
    } catch (error) {
      // Error handled by hook or form validation
    }
  };

  return (
    <FormPageLayout
      title="Yan Hak Duzenle"
      subtitle={benefit?.benefitName || ''}
      cancelPath={`/hr/employee-benefits/${id}`}
      loading={updateBenefit.isPending}
      onSave={handleSubmit}
      isDataLoading={isLoading}
      dataError={isError}
      saveButtonText="Guncelle"
      icon={<GiftIcon className="h-6 w-6" />}
      maxWidth="max-w-7xl"
    >
      <Form form={form} layout="vertical">
        <Row gutter={48}>
          <Col xs={24} lg={10}>
            <div className="mb-8">
              <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '16px', padding: '40px 20px', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <GiftIcon className="w-16 h-16 text-white/90" />
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
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><UserIcon className="w-4 h-4 mr-1" /> Calisan & Yan Hak Bilgileri</Text>
              <Form.Item name="employeeId" rules={[{ required: true }]} className="mb-3">
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
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><CalendarIcon className="w-4 h-4 mr-1" /> Tarihler & Deger</Text>
              <Row gutter={16}>
                <Col span={8}><Form.Item name="startDate" rules={[{ required: true }]} className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" /></Form.Item></Col>
                <Col span={8}><Form.Item name="endDate" className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" /></Form.Item></Col>
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
      </Form>
    </FormPageLayout>
  );
}
