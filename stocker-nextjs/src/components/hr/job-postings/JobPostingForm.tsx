'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Switch,
  InputNumber,
  DatePicker,
} from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useDepartments, usePositions, useEmployees, useWorkLocations } from '@/lib/api/hooks/useHR';
import type { JobPostingDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

// Employment type options
const employmentTypeOptions = [
  { value: 'FullTime', label: 'Tam Zamanlı' },
  { value: 'PartTime', label: 'Yarı Zamanlı' },
  { value: 'Contract', label: 'Sözleşmeli' },
  { value: 'Intern', label: 'Stajyer' },
  { value: 'Temporary', label: 'Geçici' },
  { value: 'Freelance', label: 'Freelance' },
];

// Experience level options
const experienceLevelOptions = [
  { value: 'Entry', label: 'Giriş Seviyesi' },
  { value: 'Junior', label: 'Junior (1-3 Yıl)' },
  { value: 'Mid', label: 'Mid-Level (3-5 Yıl)' },
  { value: 'Senior', label: 'Senior (5+ Yıl)' },
  { value: 'Lead', label: 'Lead / Takım Lideri' },
  { value: 'Manager', label: 'Yönetici' },
  { value: 'Director', label: 'Direktör' },
  { value: 'Executive', label: 'Üst Düzey Yönetici' },
];

// Remote work type options
const remoteWorkTypeOptions = [
  { value: 'OnSite', label: 'Ofiste' },
  { value: 'Remote', label: 'Uzaktan' },
  { value: 'Hybrid', label: 'Hibrit' },
];

// Salary period options
const salaryPeriodOptions = [
  { value: 'Monthly', label: 'Aylık' },
  { value: 'Annual', label: 'Yıllık' },
  { value: 'Hourly', label: 'Saatlik' },
];

interface JobPostingFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: JobPostingDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function JobPostingForm({
  form,
  initialValues,
  onFinish,
  loading,
}: JobPostingFormProps) {
  const [isInternal, setIsInternal] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [showSalary, setShowSalary] = useState(true);

  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions();
  const { data: employees = [] } = useEmployees();
  const { data: workLocations = [] } = useWorkLocations();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        applicationDeadline: initialValues.applicationDeadline
          ? dayjs(initialValues.applicationDeadline)
          : undefined,
        expectedStartDate: initialValues.expectedStartDate
          ? dayjs(initialValues.expectedStartDate)
          : undefined,
      });
      setIsInternal(initialValues.isInternal ?? false);
      setIsFeatured(initialValues.isFeatured ?? false);
      setIsUrgent(initialValues.isUrgent ?? false);
      setShowSalary(initialValues.showSalary ?? true);
    } else {
      form.setFieldsValue({
        numberOfOpenings: 1,
        currency: 'TRY',
        salaryPeriod: 'Monthly',
        remoteWorkType: 'OnSite',
        employmentType: 'FullTime',
        experienceLevel: 'Mid',
        showSalary: true,
      });
    }
  }, [form, initialValues]);

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      applicationDeadline: values.applicationDeadline?.format('YYYY-MM-DD'),
      expectedStartDate: values.expectedStartDate?.format('YYYY-MM-DD'),
    };
    onFinish(formattedValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
      className="job-posting-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileTextOutlined
                style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }}
              />
              <p className="mt-4 text-lg font-medium text-white/90">İş İlanı</p>
              <p className="text-sm text-white/60">
                Yeni pozisyonlar için ilan oluşturun
              </p>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  İç İlan
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  Sadece mevcut çalışanlara görünür
                </div>
              </div>
              <Form.Item name="isInternal" valuePropName="checked" noStyle>
                <Switch
                  checked={isInternal}
                  onChange={(val) => {
                    setIsInternal(val);
                    form.setFieldValue('isInternal', val);
                  }}
                />
              </Form.Item>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Öne Çıkan
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  İlan öne çıkarılsın mı?
                </div>
              </div>
              <Form.Item name="isFeatured" valuePropName="checked" noStyle>
                <Switch
                  checked={isFeatured}
                  onChange={(val) => {
                    setIsFeatured(val);
                    form.setFieldValue('isFeatured', val);
                  }}
                />
              </Form.Item>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Acil
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  Acil alım gerektiriyor
                </div>
              </div>
              <Form.Item name="isUrgent" valuePropName="checked" noStyle>
                <Switch
                  checked={isUrgent}
                  onChange={(val) => {
                    setIsUrgent(val);
                    form.setFieldValue('isUrgent', val);
                  }}
                />
              </Form.Item>
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.totalApplications || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Başvuru</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.viewsCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Görüntülenme</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.hiredCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">İşe Alınan</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Job Title - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="title"
              rules={[
                { required: true, message: 'İlan başlığı zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="İlan başlığı"
                variant="borderless"
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  padding: '0',
                  color: '#1a1a1a',
                }}
                className="placeholder:text-gray-300"
              />
            </Form.Item>
            <Form.Item
              name="description"
              rules={[{ required: true, message: 'Açıklama zorunludur' }]}
              className="mb-0 mt-2"
            >
              <TextArea
                placeholder="İş ilanı açıklaması..."
                variant="borderless"
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{
                  fontSize: '15px',
                  padding: '0',
                  color: '#666',
                  resize: 'none',
                }}
                className="placeholder:text-gray-300"
              />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Basic Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <TeamOutlined className="mr-1" /> Temel Bilgiler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Departman *</div>
                <Form.Item
                  name="departmentId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Select
                    placeholder="Departman seçin"
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    options={departments.map((d) => ({
                      value: d.id,
                      label: d.name,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Pozisyon</div>
                <Form.Item name="positionId" className="mb-3">
                  <Select
                    placeholder="Pozisyon seçin"
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    allowClear
                    options={positions.map((p) => ({
                      value: p.id,
                      label: p.title,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Çalışma Tipi *</div>
                <Form.Item
                  name="employmentType"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Select
                    placeholder="Seçin"
                    variant="filled"
                    options={employmentTypeOptions}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Deneyim Seviyesi *</div>
                <Form.Item
                  name="experienceLevel"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Select
                    placeholder="Seçin"
                    variant="filled"
                    options={experienceLevelOptions}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Açık Pozisyon Sayısı *</div>
                <Form.Item
                  name="numberOfOpenings"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">İşe Alım Yöneticisi</div>
                <Form.Item name="hiringManagerId" className="mb-3">
                  <Select
                    placeholder="Seçin"
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    allowClear
                    options={employees.map((e) => ({
                      value: e.id,
                      label: e.fullName,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Uzaktan Çalışma *</div>
                <Form.Item
                  name="remoteWorkType"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Select
                    placeholder="Seçin"
                    variant="filled"
                    options={remoteWorkTypeOptions}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Location Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <EnvironmentOutlined className="mr-1" /> Konum Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Çalışma Lokasyonu</div>
                <Form.Item name="workLocationId" className="mb-3">
                  <Select
                    placeholder="Seçin"
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    allowClear
                    options={workLocations.map((l) => ({
                      value: l.id,
                      label: l.name,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Şehir</div>
                <Form.Item name="city" className="mb-3">
                  <Input placeholder="İstanbul" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Ülke</div>
                <Form.Item name="country" className="mb-3">
                  <Input placeholder="Türkiye" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Salary Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <DollarOutlined className="mr-1" /> Maaş Bilgileri
            </Text>
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl mb-4">
              <div>
                <Text strong className="text-gray-700">
                  Maaşı Göster
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  İlanda maaş bilgisini göster
                </div>
              </div>
              <Form.Item name="showSalary" valuePropName="checked" noStyle>
                <Switch
                  checked={showSalary}
                  onChange={(val) => {
                    setShowSalary(val);
                    form.setFieldValue('showSalary', val);
                  }}
                />
              </Form.Item>
            </div>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Minimum Maaş</div>
                <Form.Item name="salaryMin" className="mb-3">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    variant="filled"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Maksimum Maaş</div>
                <Form.Item name="salaryMax" className="mb-3">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    variant="filled"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Periyot</div>
                <Form.Item name="salaryPeriod" className="mb-3">
                  <Select
                    placeholder="Seçin"
                    variant="filled"
                    options={salaryPeriodOptions}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Dates */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Tarihler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Son Başvuru Tarihi</div>
                <Form.Item name="applicationDeadline" className="mb-3">
                  <DatePicker
                    style={{ width: '100%' }}
                    variant="filled"
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Beklenen Başlangıç</div>
                <Form.Item name="expectedStartDate" className="mb-3">
                  <DatePicker
                    style={{ width: '100%' }}
                    variant="filled"
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Requirements & Qualifications */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Gereksinimler ve Nitelikler
            </Text>
            <div className="text-xs text-gray-400 mb-1">Gereksinimler</div>
            <Form.Item name="requirements" className="mb-4">
              <TextArea
                rows={3}
                placeholder="Pozisyon için gerekli nitelikler"
                variant="filled"
              />
            </Form.Item>
            <div className="text-xs text-gray-400 mb-1">Sorumluluklar</div>
            <Form.Item name="responsibilities" className="mb-4">
              <TextArea
                rows={3}
                placeholder="Pozisyonun sorumlulukları"
                variant="filled"
              />
            </Form.Item>
            <div className="text-xs text-gray-400 mb-1">Nitelikler</div>
            <Form.Item name="qualifications" className="mb-4">
              <TextArea
                rows={3}
                placeholder="Aranan nitelikler"
                variant="filled"
              />
            </Form.Item>
            <div className="text-xs text-gray-400 mb-1">Tercih Edilen Nitelikler</div>
            <Form.Item name="preferredQualifications" className="mb-4">
              <TextArea
                rows={2}
                placeholder="Tercih edilen ek nitelikler"
                variant="filled"
              />
            </Form.Item>
            <div className="text-xs text-gray-400 mb-1">Yan Haklar</div>
            <Form.Item name="benefits" className="mb-0">
              <TextArea
                rows={2}
                placeholder="Sunulan yan haklar ve avantajlar"
                variant="filled"
              />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Tags & Keywords */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Etiketler ve Anahtar Kelimeler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Etiketler</div>
                <Form.Item name="tags" className="mb-3">
                  <Input
                    placeholder="yazilim, gelistirici, react"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Anahtar Kelimeler</div>
                <Form.Item name="keywords" className="mb-3">
                  <Input
                    placeholder="frontend, typescript, nextjs"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
            <div className="text-xs text-gray-400 mb-1">İç Notlar</div>
            <Form.Item name="internalNotes" className="mb-0">
              <TextArea
                rows={2}
                placeholder="Sadece yöneticilerin görebileceği notlar"
                variant="filled"
              />
            </Form.Item>
          </div>
        </Col>
      </Row>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
