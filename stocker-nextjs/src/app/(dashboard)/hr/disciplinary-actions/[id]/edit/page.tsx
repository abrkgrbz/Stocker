'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Space, Form, Input, Select, DatePicker, Row, Col, Typography, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, WarningOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDisciplinaryAction, useUpdateDisciplinaryAction, useEmployees } from '@/lib/api/hooks/useHR';

const { TextArea } = Input;
const { Text } = Typography;

const statusOptions = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'UnderInvestigation', label: 'Sorusturmada' },
  { value: 'PendingReview', label: 'Incelemede' },
  { value: 'Approved', label: 'Onaylandi' },
  { value: 'Implemented', label: 'Uygulandi' },
  { value: 'Appealed', label: 'Itiraz Edildi' },
  { value: 'Overturned', label: 'Iptal Edildi' },
  { value: 'Closed', label: 'Kapandi' },
];

const severityLevelOptions = [
  { value: 'Minor', label: 'Hafif' },
  { value: 'Moderate', label: 'Orta' },
  { value: 'Major', label: 'Agir' },
  { value: 'Critical', label: 'Kritik' },
];

const actionTypeOptions = [
  { value: 'VerbalWarning', label: 'Sozlu Uyari' },
  { value: 'WrittenWarning', label: 'Yazili Uyari' },
  { value: 'FinalWarning', label: 'Son Uyari' },
  { value: 'Suspension', label: 'Uzaklastirma' },
  { value: 'Demotion', label: 'Kademe Indirme' },
  { value: 'Termination', label: 'Is Akdi Feshi' },
  { value: 'ProbationExtension', label: 'Deneme Suresi Uzatma' },
  { value: 'TrainingRequired', label: 'Egitim Zorunlulugu' },
  { value: 'PerformanceImprovement', label: 'Performans Iyilestirme' },
];

const violationTypeOptions = [
  { value: 'Attendance', label: 'Devamsizlik' },
  { value: 'Performance', label: 'Performans' },
  { value: 'Conduct', label: 'Davranis' },
  { value: 'Policy', label: 'Politika Ihlali' },
  { value: 'Safety', label: 'Is Guvenligi' },
  { value: 'Harassment', label: 'Taciz' },
  { value: 'Theft', label: 'Hirsizlik' },
  { value: 'Fraud', label: 'Dolandiricilik' },
  { value: 'Insubordination', label: 'Itaatsizlik' },
  { value: 'Other', label: 'Diger' },
];

export default function EditDisciplinaryActionPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: action, isLoading } = useDisciplinaryAction(id);
  const updateAction = useUpdateDisciplinaryAction();
  const { data: employees } = useEmployees();

  useEffect(() => {
    if (action) {
      form.setFieldsValue({
        ...action,
        incidentDate: action.incidentDate ? dayjs(action.incidentDate) : null,
        sanctionStartDate: action.sanctionStartDate ? dayjs(action.sanctionStartDate) : null,
        sanctionEndDate: action.sanctionEndDate ? dayjs(action.sanctionEndDate) : null,
      });
    }
  }, [action, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        incidentDate: values.incidentDate?.toISOString(),
        sanctionStartDate: values.sanctionStartDate?.toISOString(),
        sanctionEndDate: values.sanctionEndDate?.toISOString(),
      };
      await updateAction.mutateAsync({ id, data });
      router.push(`/hr/disciplinary-actions/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} type="text" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Disiplin Islemi Duzenle</h1>
              <p className="text-sm text-gray-400 m-0">{action?.employeeName}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/hr/disciplinary-actions/${id}`)}>Vazgec</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateAction.isPending}
              onClick={() => form.submit()}
              style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={48}>
            <Col xs={24} lg={10}>
              <div className="mb-8">
                <div
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                    borderRadius: '16px',
                    padding: '40px 20px',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WarningOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
                  <p className="mt-4 text-lg font-medium text-white/90">Disiplin Islemi</p>
                  <p className="text-sm text-white/60">Calisan disiplin kaydi</p>
                </div>
              </div>

              <div className="mb-6">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Durum & Siddet</Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="status" className="mb-3"><Select options={statusOptions} placeholder="Durum" /></Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="severityLevel" className="mb-3"><Select options={severityLevelOptions} placeholder="Siddet" /></Form.Item>
                  </Col>
                </Row>
              </div>
            </Col>

            <Col xs={24} lg={14}>
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <UserOutlined className="mr-1" /> Calisan & Islem Bilgileri
                </Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="employeeId" rules={[{ required: true, message: 'Calisan secimi zorunludur' }]} className="mb-3">
                      <Select showSearch placeholder="Calisan secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="actionType" rules={[{ required: true, message: 'Islem turu zorunludur' }]} className="mb-3">
                      <Select options={actionTypeOptions} placeholder="Islem turu" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="violatedPolicy" className="mb-3">
                  <Input placeholder="Ihlal edilen politika" />
                </Form.Item>
              </div>

              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <CalendarOutlined className="mr-1" /> Tarihler
                </Text>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="incidentDate" rules={[{ required: true }]} className="mb-3">
                      <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Olay tarihi" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="sanctionStartDate" className="mb-3">
                      <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Yaptirim baslangic" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="sanctionEndDate" className="mb-3">
                      <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Yaptirim bitis" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Aciklamalar</Text>
                <Form.Item name="incidentDescription" className="mb-3"><TextArea rows={3} placeholder="Olay aciklamasi..." variant="filled" /></Form.Item>
              </div>

              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Sorusturma</Text>
                <Form.Item name="investigatorId" className="mb-3">
                  <Select showSearch allowClear placeholder="Sorusturmaci secin" optionFilterProp="label" options={employees?.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))} />
                </Form.Item>
                <Form.Item name="investigationFindings" className="mb-3"><TextArea rows={3} placeholder="Sorusturma bulgulari..." variant="filled" /></Form.Item>
              </div>

              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Savunma & Alinan Aksiyonlar</Text>
                <Form.Item name="defenseText" className="mb-3"><TextArea rows={3} placeholder="Calisan savunmasi..." variant="filled" /></Form.Item>
                <Form.Item name="actionsTaken" className="mb-3"><TextArea rows={3} placeholder="Alinan aksiyonlar..." variant="filled" /></Form.Item>
              </div>

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
