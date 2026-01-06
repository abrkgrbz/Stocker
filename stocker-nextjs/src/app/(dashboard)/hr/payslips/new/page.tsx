'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Select, DatePicker, InputNumber, Row, Col, Typography } from 'antd';
import {
  CurrencyDollarIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useCreatePayslip, useEmployees } from '@/lib/api/hooks/useHR';
import { FormPageLayout } from '@/components/patterns';

const { TextArea } = Input;
const { Text } = Typography;

const statusOptions = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'Pending', label: 'Beklemede' },
  { value: 'Approved', label: 'Onaylandi' },
  { value: 'Paid', label: 'Odendi' },
  { value: 'Cancelled', label: 'Iptal' },
];

const paymentMethodOptions = [
  { value: 'BankTransfer', label: 'Banka Havale' },
  { value: 'Cash', label: 'Nakit' },
  { value: 'Check', label: 'Cek' },
];

export default function NewPayslipPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createPayslip = useCreatePayslip();
  const { data: employees } = useEmployees();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        payPeriodStart: values.payPeriodStart?.toISOString(),
        payPeriodEnd: values.payPeriodEnd?.toISOString(),
        paymentDate: values.paymentDate?.toISOString(),
      };
      await createPayslip.mutateAsync(data);
      router.push('/hr/payslips');
    } catch (error) {}
  };

  return (
    <FormPageLayout
      title="Yeni Bordro"
      subtitle="Calisan bordrosu olusturun"
      icon={<CurrencyDollarIcon className="w-5 h-5" />}
      cancelPath="/hr/payslips"
      loading={createPayslip.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'Draft' }}>
        <Row gutter={48}>
          <Col xs={24} lg={10}>
            <div className="mb-8">
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '40px 20px', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <CurrencyDollarIcon className="w-16 h-16 text-white/90" />
                <p className="mt-4 text-lg font-medium text-white/90">Bordro</p>
                <p className="text-sm text-white/60">Maas hesaplama</p>
              </div>
            </div>
            <div className="mb-6">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Durum & Odeme</Text>
              <Form.Item name="status" className="mb-3"><Select options={statusOptions} placeholder="Durum" /></Form.Item>
              <Form.Item name="paymentMethod" className="mb-3"><Select options={paymentMethodOptions} placeholder="Odeme yontemi" allowClear /></Form.Item>
            </div>
          </Col>
          <Col xs={24} lg={14}>
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><UserIcon className="w-4 h-4 mr-1" /> Calisan & Donem Bilgileri</Text>
              <Form.Item name="employeeId" rules={[{ required: true }]} className="mb-3">
                <Select showSearch placeholder="Calisan secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} />
              </Form.Item>
              <Row gutter={16}>
                <Col span={8}><Form.Item name="payPeriodStart" rules={[{ required: true }]} className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Donem baslangic" /></Form.Item></Col>
                <Col span={8}><Form.Item name="payPeriodEnd" rules={[{ required: true }]} className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Donem bitis" /></Form.Item></Col>
                <Col span={8}><Form.Item name="paymentDate" className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Odeme tarihi" /></Form.Item></Col>
              </Row>
            </div>
            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><PlusCircleIcon className="w-4 h-4 mr-1" /> Kazanclar</Text>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="basicSalary" rules={[{ required: true }]} className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Temel maas" prefix="₺" /></Form.Item></Col>
                <Col span={12}><Form.Item name="overtimePay" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Fazla mesai" prefix="₺" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="bonuses" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Ikramiye" prefix="₺" /></Form.Item></Col>
                <Col span={12}><Form.Item name="commission" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Komisyon" prefix="₺" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}><Form.Item name="mealAllowance" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Yemek" prefix="₺" /></Form.Item></Col>
                <Col span={8}><Form.Item name="transportAllowance" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Ulasim" prefix="₺" /></Form.Item></Col>
                <Col span={8}><Form.Item name="housingAllowance" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Konut" prefix="₺" /></Form.Item></Col>
              </Row>
              <Form.Item name="otherAllowances" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Diger odenekler" prefix="₺" /></Form.Item>
            </div>
            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><MinusCircleIcon className="w-4 h-4 mr-1 inline" /> Kesintiler</Text>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="incomeTax" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Gelir vergisi" prefix="₺" /></Form.Item></Col>
                <Col span={12}><Form.Item name="stampTax" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Damga vergisi" prefix="₺" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="ssiEmployeeContribution" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="SGK (calisan)" prefix="₺" /></Form.Item></Col>
                <Col span={12}><Form.Item name="unemploymentInsuranceEmployee" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Issizlik (calisan)" prefix="₺" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="healthInsurance" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Saglik sigortasi" prefix="₺" /></Form.Item></Col>
                <Col span={12}><Form.Item name="unionDues" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Sendika aidati" prefix="₺" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="garnishments" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Icra kesintisi" prefix="₺" /></Form.Item></Col>
                <Col span={12}><Form.Item name="otherDeductions" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Diger kesintiler" prefix="₺" /></Form.Item></Col>
              </Row>
            </div>
            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Isveren Kesintileri</Text>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="ssiEmployerContribution" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="SGK (isveren)" prefix="₺" /></Form.Item></Col>
                <Col span={12}><Form.Item name="unemploymentInsuranceEmployer" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Issizlik (isveren)" prefix="₺" /></Form.Item></Col>
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
