'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Select, DatePicker, InputNumber, Row, Col, Typography } from 'antd';
import {
  DocumentTextIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useCreateJobApplication, useJobPostings } from '@/lib/api/hooks/useHR';
import { FormPageLayout } from '@/components/patterns';

const { TextArea } = Input;
const { Text } = Typography;

const statusOptions = [
  { value: 'New', label: 'Yeni' },
  { value: 'Screening', label: 'On Eleme' },
  { value: 'Interview', label: 'Mulakat' },
  { value: 'Assessment', label: 'Degerlendirme' },
  { value: 'Reference', label: 'Referans Kontrolu' },
  { value: 'Offer', label: 'Teklif' },
  { value: 'Hired', label: 'Ise Alindi' },
  { value: 'Rejected', label: 'Reddedildi' },
  { value: 'Withdrawn', label: 'Geri Cekildi' },
  { value: 'OnHold', label: 'Beklemede' },
];

const sourceOptions = [
  { value: 'Website', label: 'Web Sitesi' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Indeed', label: 'Indeed' },
  { value: 'Referral', label: 'Referans' },
  { value: 'Agency', label: 'Ajans' },
  { value: 'JobFair', label: 'Is Fuari' },
  { value: 'University', label: 'Universite' },
  { value: 'Social', label: 'Sosyal Medya' },
  { value: 'Other', label: 'Diger' },
];

export default function NewJobApplicationPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createApplication = useCreateJobApplication();
  const { data: jobPostings } = useJobPostings();

  const handleSubmit = async (values: any) => {
    try {
      const data = { ...values, applicationDate: values.applicationDate?.toISOString() };
      await createApplication.mutateAsync(data);
      router.push('/hr/job-applications');
    } catch (error) {}
  };

  return (
    <FormPageLayout
      title="Yeni Is Basvurusu"
      subtitle="Aday basvurusu kaydedin"
      icon={<DocumentTextIcon className="w-5 h-5" />}
      cancelPath="/hr/job-applications"
      loading={createApplication.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'New' }}>
        <Row gutter={48}>
          <Col xs={24} lg={10}>
            <div className="mb-8">
              <div style={{ background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', borderRadius: '16px', padding: '40px 20px', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <DocumentTextIcon className="w-16 h-16 text-white/90" />
                <p className="mt-4 text-lg font-medium text-white/90">Is Basvurusu</p>
                <p className="text-sm text-white/60">Aday degerlendirme</p>
              </div>
            </div>
            <div className="mb-6">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Durum & Kaynak</Text>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="status" className="mb-3"><Select options={statusOptions} placeholder="Durum" /></Form.Item></Col>
                <Col span={12}><Form.Item name="source" className="mb-3"><Select options={sourceOptions} placeholder="Kaynak" /></Form.Item></Col>
              </Row>
            </div>
          </Col>
          <Col xs={24} lg={14}>
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block"><UserIcon className="w-4 h-4 mr-1" /> Aday Bilgileri</Text>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="candidateName" rules={[{ required: true }]} className="mb-3"><Input placeholder="Ad Soyad" variant="filled" /></Form.Item></Col>
                <Col span={12}><Form.Item name="candidateEmail" rules={[{ required: true, type: 'email' }]} className="mb-3"><Input placeholder="E-posta" variant="filled" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="candidatePhone" className="mb-3"><Input placeholder="Telefon" variant="filled" /></Form.Item></Col>
                <Col span={12}><Form.Item name="applicationDate" rules={[{ required: true }]} className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Basvuru tarihi" /></Form.Item></Col>
              </Row>
            </div>
            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Pozisyon & Deneyim</Text>
              <Form.Item name="jobPostingId" rules={[{ required: true }]} className="mb-3">
                <Select showSearch placeholder="Is ilani secin" optionFilterProp="label" options={jobPostings?.map((j: any) => ({ value: j.id, label: j.title }))} />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="yearsOfExperience" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Deneyim (yil)" /></Form.Item></Col>
                <Col span={12}><Form.Item name="currentCompany" className="mb-3"><Input placeholder="Mevcut sirket" variant="filled" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="currentPosition" className="mb-3"><Input placeholder="Mevcut pozisyon" variant="filled" /></Form.Item></Col>
                <Col span={12}><Form.Item name="expectedSalary" className="mb-3"><InputNumber style={{ width: '100%' }} placeholder="Beklenen maas" /></Form.Item></Col>
              </Row>
            </div>
            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">On Yazi & Notlar</Text>
              <Form.Item name="coverLetter" className="mb-3"><TextArea rows={4} placeholder="On yazi..." variant="filled" /></Form.Item>
              <Form.Item name="notes" className="mb-0"><TextArea rows={3} placeholder="Notlar..." variant="filled" /></Form.Item>
            </div>
          </Col>
        </Row>
        <Form.Item hidden><button type="submit" /></Form.Item>
      </Form>
    </FormPageLayout>
  );
}
