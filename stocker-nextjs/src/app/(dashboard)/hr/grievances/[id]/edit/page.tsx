'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Form, Input, Select, DatePicker, Row, Col, Typography } from 'antd';
import {
  ExclamationCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { useGrievance, useUpdateGrievance, useEmployees } from '@/lib/api/hooks/useHR';
import { FormPageLayout } from '@/components/patterns';

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

export default function EditGrievancePage() {
  const params = useParams();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: grievance, isLoading, isError } = useGrievance(id);
  const updateGrievance = useUpdateGrievance();
  const { data: employees } = useEmployees();

  useEffect(() => {
    if (grievance) {
      form.setFieldsValue({
        ...grievance,
        filedDate: grievance.filedDate ? dayjs(grievance.filedDate) : null,
        resolutionDate: grievance.resolutionDate ? dayjs(grievance.resolutionDate) : null,
      });
    }
  }, [grievance, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        filedDate: values.filedDate?.toISOString(),
        resolutionDate: values.resolutionDate?.toISOString(),
      };
      await updateGrievance.mutateAsync({ id, data });
    } catch (error) {
      // Error handled by hook or form validation
    }
  };

  return (
    <FormPageLayout
      title="Sikayet Duzenle"
      subtitle={grievance?.subject || ''}
      cancelPath={`/hr/grievances/${id}`}
      loading={updateGrievance.isPending}
      onSave={handleSubmit}
      isDataLoading={isLoading}
      dataError={isError}
      saveButtonText="Guncelle"
      icon={<ExclamationCircleIcon className="h-6 w-6" />}
      maxWidth="max-w-7xl"
    >
      <Form form={form} layout="vertical">
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
              <Form.Item name="employeeId" rules={[{ required: true }]} className="mb-3">
                <Select showSearch placeholder="Calisan secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="grievanceType" rules={[{ required: true }]} className="mb-3"><Select options={grievanceTypeOptions} placeholder="Sikayet turu" /></Form.Item></Col>
                <Col span={12}><Form.Item name="filedDate" rules={[{ required: true }]} className="mb-3"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" /></Form.Item></Col>
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
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Inceleme & Cozum</Text>
              <Form.Item name="assignedToId" className="mb-3">
                <Select showSearch allowClear placeholder="Incelemeye atanacak kisi" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} />
              </Form.Item>
              <Form.Item name="investigationNotes" className="mb-3"><TextArea rows={3} placeholder="Sorusturma notlari..." variant="filled" /></Form.Item>
              <Form.Item name="resolution" className="mb-3"><TextArea rows={3} placeholder="Cozum..." variant="filled" /></Form.Item>
              <Form.Item name="resolutionDate" className="mb-0"><DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Cozum tarihi" /></Form.Item>
            </div>
          </Col>
        </Row>
      </Form>
    </FormPageLayout>
  );
}
