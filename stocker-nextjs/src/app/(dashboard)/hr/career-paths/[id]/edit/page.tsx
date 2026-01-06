'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Typography,
} from 'antd';
import {
  CalendarIcon,
  RocketLaunchIcon,
  TrophyIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { useCareerPath, useUpdateCareerPath, useEmployees, usePositions } from '@/lib/api/hooks/useHR';
import { FormPageLayout } from '@/components/patterns';

const { TextArea } = Input;
const { Text } = Typography;

const statusOptions = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'Active', label: 'Aktif' },
  { value: 'OnTrack', label: 'Yolunda' },
  { value: 'AtRisk', label: 'Riskli' },
  { value: 'Completed', label: 'Tamamlandi' },
  { value: 'Cancelled', label: 'Iptal' },
  { value: 'OnHold', label: 'Beklemede' },
];

const careerTrackOptions = [
  { value: 'Technical', label: 'Teknik' },
  { value: 'Management', label: 'Yonetim' },
  { value: 'Specialist', label: 'Uzmanlik' },
  { value: 'Leadership', label: 'Liderlik' },
];

export default function EditCareerPathPage() {
  const params = useParams();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: careerPath, isLoading, isError } = useCareerPath(id);
  const updateCareerPath = useUpdateCareerPath();
  const { data: employees } = useEmployees();
  const { data: positions } = usePositions();

  useEffect(() => {
    if (careerPath) {
      form.setFieldsValue({
        ...careerPath,
        startDate: careerPath.startDate ? dayjs(careerPath.startDate) : null,
        expectedTargetDate: careerPath.expectedTargetDate ? dayjs(careerPath.expectedTargetDate) : null,
      });
    }
  }, [careerPath, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        startDate: values.startDate?.toISOString(),
        expectedTargetDate: values.expectedTargetDate?.toISOString(),
      };
      await updateCareerPath.mutateAsync({ id, data });
    } catch (error) {
      // Error handled by hook or form validation
    }
  };

  return (
    <FormPageLayout
      title="Kariyer Plani Duzenle"
      subtitle={careerPath?.employeeName || ''}
      cancelPath={`/hr/career-paths/${id}`}
      loading={updateCareerPath.isPending}
      onSave={handleSubmit}
      isDataLoading={isLoading}
      dataError={isError}
      saveButtonText="Guncelle"
      icon={<RocketLaunchIcon className="h-6 w-6" />}
      maxWidth="max-w-7xl"
    >
      <Form form={form} layout="vertical">
        <Row gutter={48}>
          {/* Left Panel */}
          <Col xs={24} lg={10}>
            <div className="mb-8">
              <div
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  borderRadius: '16px',
                  padding: '40px 20px',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RocketLaunchIcon className="w-16 h-16 text-white/90" />
                <p className="mt-4 text-lg font-medium text-white/90">
                  Kariyer Plani
                </p>
                <p className="text-sm text-white/60">
                  Kariyer gelisim yolculugunu planlayin
                </p>
              </div>
            </div>

            <div className="mb-6">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                Durum & Kariyer Yolu
              </Text>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="status" className="mb-3">
                    <Select options={statusOptions} placeholder="Durum" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="careerTrack" className="mb-3">
                    <Select options={careerTrackOptions} placeholder="Kariyer Yolu" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div className="mb-6">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                <TrophyIcon className="w-4 h-4 mr-1" /> Ilerleme
              </Text>
              <Form.Item name="progressPercentage" className="mb-0">
                <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
              </Form.Item>
            </div>
          </Col>

          {/* Right Panel */}
          <Col xs={24} lg={14}>
            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                <UserIcon className="w-4 h-4 mr-1" /> Calisan Bilgileri
              </Text>
              <Form.Item
                name="employeeId"
                rules={[{ required: true, message: 'Calisan secimi zorunludur' }]}
                className="mb-3"
              >
                <Select
                  showSearch
                  placeholder="Calisan secin"
                  optionFilterProp="label"
                  options={employees?.map((e: any) => ({
                    value: e.id,
                    label: `${e.firstName} ${e.lastName}`,
                  }))}
                />
              </Form.Item>
            </div>

            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                Pozisyon Bilgileri
              </Text>
              <Row gutter={16}>
                <Col span={12}>
                  <div className="text-xs text-gray-400 mb-1">Mevcut Pozisyon</div>
                  <Form.Item name="currentPositionId" className="mb-3">
                    <Select
                      showSearch
                      placeholder="Mevcut pozisyon"
                      optionFilterProp="label"
                      options={positions?.map((p: any) => ({
                        value: p.id,
                        label: p.title,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <div className="text-xs text-gray-400 mb-1">Hedef Pozisyon *</div>
                  <Form.Item
                    name="targetPositionId"
                    rules={[{ required: true, message: 'Hedef pozisyon zorunludur' }]}
                    className="mb-3"
                  >
                    <Select
                      showSearch
                      placeholder="Hedef pozisyon"
                      optionFilterProp="label"
                      options={positions?.map((p: any) => ({
                        value: p.id,
                        label: p.title,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                <CalendarIcon className="w-4 h-4 mr-1" /> Tarihler
              </Text>
              <Row gutter={16}>
                <Col span={12}>
                  <div className="text-xs text-gray-400 mb-1">Baslangic Tarihi *</div>
                  <Form.Item
                    name="startDate"
                    rules={[{ required: true, message: 'Baslangic tarihi zorunludur' }]}
                    className="mb-3"
                  >
                    <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <div className="text-xs text-gray-400 mb-1">Hedef Tarih</div>
                  <Form.Item name="expectedTargetDate" className="mb-3">
                    <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                Mentorluk
              </Text>
              <Form.Item name="mentorId" className="mb-3">
                <Select
                  showSearch
                  allowClear
                  placeholder="Mentor secin"
                  optionFilterProp="label"
                  options={employees?.map((e: any) => ({
                    value: e.id,
                    label: `${e.firstName} ${e.lastName}`,
                  }))}
                />
              </Form.Item>
            </div>

            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                Gelisim Alanlari
              </Text>
              <Form.Item name="developmentAreas" className="mb-3">
                <TextArea rows={4} placeholder="Gelisim alanlari detaylarini girin..." variant="filled" />
              </Form.Item>
            </div>

            <div className="mb-8">
              <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                Notlar
              </Text>
              <Form.Item name="notes" className="mb-0">
                <TextArea rows={3} placeholder="Ek notlar..." variant="filled" />
              </Form.Item>
            </div>
          </Col>
        </Row>
      </Form>
    </FormPageLayout>
  );
}
