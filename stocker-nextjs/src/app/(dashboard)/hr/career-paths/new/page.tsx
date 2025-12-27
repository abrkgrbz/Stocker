'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Space,
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
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  RocketLaunchIcon,
  TrophyIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useCreateCareerPath, useEmployees, usePositions } from '@/lib/api/hooks/useHR';

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

const priorityOptions = [
  { value: 'Low', label: 'Dusuk' },
  { value: 'Medium', label: 'Orta' },
  { value: 'High', label: 'Yuksek' },
  { value: 'Critical', label: 'Kritik' },
];

export default function NewCareerPathPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createCareerPath = useCreateCareerPath();
  const { data: employees } = useEmployees();
  const { data: positions } = usePositions();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        startDate: values.startDate?.toISOString(),
        targetDate: values.targetDate?.toISOString(),
      };
      await createCareerPath.mutateAsync(data);
      router.push('/hr/career-paths');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
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
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Yeni Kariyer Plani
              </h1>
              <p className="text-sm text-gray-400 m-0">Calisan icin kariyer plani olusturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/career-paths')}>
              Vazgec
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createCareerPath.isPending}
              onClick={() => form.submit()}
              style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: 'Draft', priority: 'Medium', progressPercentage: 0 }}
        >
          <Row gutter={48}>
            {/* Left Panel - Visual & Status (40%) */}
            <Col xs={24} lg={10}>
              {/* Visual Card */}
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
                  <RocketLaunchIcon className="w-4 h-4" style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
                  <p className="mt-4 text-lg font-medium text-white/90">
                    Kariyer Plani
                  </p>
                  <p className="text-sm text-white/60">
                    Kariyer gelisim yolculugunu planlayin
                  </p>
                </div>
              </div>

              {/* Status & Priority */}
              <div className="mb-6">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  Durum & Oncelik
                </Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="status" className="mb-3">
                      <Select options={statusOptions} placeholder="Durum" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="priority" className="mb-3">
                      <Select options={priorityOptions} placeholder="Oncelik" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <TrophyIcon className="w-4 h-4" className="mr-1" /> Ilerleme
                </Text>
                <Form.Item name="progressPercentage" className="mb-0">
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    addonAfter="%"
                  />
                </Form.Item>
              </div>
            </Col>

            {/* Right Panel - Form Content (60%) */}
            <Col xs={24} lg={14}>
              {/* Employee Selection */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <UserIcon className="w-4 h-4" className="mr-1" /> Calisan Bilgileri
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

              {/* Position Info */}
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

              {/* Dates */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <CalendarIcon className="w-4 h-4" className="mr-1" /> Tarihler
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
                    <Form.Item name="targetDate" className="mb-3">
                      <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              {/* Mentor */}
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

              {/* Development Plan & Notes */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  Gelisim Plani
                </Text>
                <Form.Item name="developmentPlan" className="mb-3">
                  <TextArea
                    rows={4}
                    placeholder="Gelisim plani detaylarini girin..."
                    variant="filled"
                  />
                </Form.Item>
              </div>

              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  Notlar
                </Text>
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Ek notlar..."
                    variant="filled"
                  />
                </Form.Item>
              </div>
            </Col>
          </Row>

          <Form.Item hidden>
            <button type="submit" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
