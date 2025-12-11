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
  SafetyCertificateOutlined,
  DollarOutlined,
  BookOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { CertificationDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

// Certification type options
const certificationTypeOptions = [
  { value: 'Professional', label: 'Profesyonel' },
  { value: 'Technical', label: 'Teknik' },
  { value: 'Industry', label: 'Sektörel' },
  { value: 'Academic', label: 'Akademik' },
  { value: 'Government', label: 'Devlet' },
  { value: 'Vendor', label: 'Vendor/Ürün' },
  { value: 'Safety', label: 'Güvenlik' },
  { value: 'Quality', label: 'Kalite' },
  { value: 'Other', label: 'Diğer' },
];

// Certification level options
const certificationLevelOptions = [
  { value: 'Foundation', label: 'Foundation (Temel)' },
  { value: 'Associate', label: 'Associate (Yardımcı)' },
  { value: 'Professional', label: 'Professional (Profesyonel)' },
  { value: 'Expert', label: 'Expert (Uzman)' },
  { value: 'Master', label: 'Master (Usta)' },
  { value: 'Architect', label: 'Architect (Mimar)' },
];

interface CertificationFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: CertificationDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function CertificationForm({
  form,
  initialValues,
  onFinish,
  loading,
}: CertificationFormProps) {
  const [trainingRequired, setTrainingRequired] = useState(false);
  const [examRequired, setExamRequired] = useState(false);
  const [cpeRequired, setCpeRequired] = useState(false);
  const [companySponsored, setCompanySponsored] = useState(false);
  const [requiredForJob, setRequiredForJob] = useState(false);

  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        issueDate: initialValues.issueDate ? dayjs(initialValues.issueDate) : undefined,
        expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate) : undefined,
        examDate: initialValues.examDate ? dayjs(initialValues.examDate) : undefined,
        trainingCompletionDate: initialValues.trainingCompletionDate
          ? dayjs(initialValues.trainingCompletionDate)
          : undefined,
      });
      setTrainingRequired(initialValues.trainingRequired ?? false);
      setExamRequired(initialValues.examRequired ?? false);
      setCpeRequired(initialValues.cpeRequired ?? false);
      setCompanySponsored(initialValues.companySponsored ?? false);
      setRequiredForJob(initialValues.requiredForJob ?? false);
    } else {
      form.setFieldsValue({
        currency: 'TRY',
        trainingRequired: false,
        examRequired: false,
        cpeRequired: false,
        companySponsored: false,
        requiredForJob: false,
      });
    }
  }, [form, initialValues]);

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      issueDate: values.issueDate?.format('YYYY-MM-DD'),
      expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
      examDate: values.examDate?.format('YYYY-MM-DD'),
      trainingCompletionDate: values.trainingCompletionDate?.format('YYYY-MM-DD'),
    };
    onFinish(formattedValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
      className="certification-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SafetyCertificateOutlined
                style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }}
              />
              <p className="mt-4 text-lg font-medium text-white/90">
                Sertifika Bilgileri
              </p>
              <p className="text-sm text-white/60">
                Çalışan sertifikalarını yönetin
              </p>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Eğitim Gerekli
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  Sertifika için eğitim zorunlu mu?
                </div>
              </div>
              <Form.Item name="trainingRequired" valuePropName="checked" noStyle>
                <Switch
                  checked={trainingRequired}
                  onChange={(val) => {
                    setTrainingRequired(val);
                    form.setFieldValue('trainingRequired', val);
                  }}
                />
              </Form.Item>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Sınav Gerekli
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  Sertifika için sınav zorunlu mu?
                </div>
              </div>
              <Form.Item name="examRequired" valuePropName="checked" noStyle>
                <Switch
                  checked={examRequired}
                  onChange={(val) => {
                    setExamRequired(val);
                    form.setFieldValue('examRequired', val);
                  }}
                />
              </Form.Item>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  CPE/CEU Gerekli
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  Sürekli eğitim kredisi gerekli mi?
                </div>
              </div>
              <Form.Item name="cpeRequired" valuePropName="checked" noStyle>
                <Switch
                  checked={cpeRequired}
                  onChange={(val) => {
                    setCpeRequired(val);
                    form.setFieldValue('cpeRequired', val);
                  }}
                />
              </Form.Item>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Şirket Sponsorlu
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  Masraflar şirket tarafından karşılanıyor mu?
                </div>
              </div>
              <Form.Item name="companySponsored" valuePropName="checked" noStyle>
                <Switch
                  checked={companySponsored}
                  onChange={(val) => {
                    setCompanySponsored(val);
                    form.setFieldValue('companySponsored', val);
                  }}
                />
              </Form.Item>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  İş İçin Zorunlu
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  Pozisyon için gerekli mi?
                </div>
              </div>
              <Form.Item name="requiredForJob" valuePropName="checked" noStyle>
                <Switch
                  checked={requiredForJob}
                  onChange={(val) => {
                    setRequiredForJob(val);
                    form.setFieldValue('requiredForJob', val);
                  }}
                />
              </Form.Item>
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div
                className={`p-4 rounded-xl text-center ${
                  initialValues.isExpired
                    ? 'bg-red-50'
                    : initialValues.isExpiringSoon
                    ? 'bg-yellow-50'
                    : 'bg-green-50'
                }`}
              >
                <div
                  className={`text-2xl font-semibold ${
                    initialValues.isExpired
                      ? 'text-red-600'
                      : initialValues.isExpiringSoon
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}
                >
                  {initialValues.isExpired
                    ? 'Süresi Doldu'
                    : initialValues.isExpiringSoon
                    ? 'Yakında'
                    : 'Geçerli'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Durum</div>
              </div>
              {initialValues.examScore && (
                <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                  <div className="text-2xl font-semibold text-gray-800">
                    {initialValues.examScore}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Sınav Puanı</div>
                </div>
              )}
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Certification Name - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="certificationName"
              rules={[
                { required: true, message: 'Sertifika adı zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Sertifika adı"
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
            <Form.Item name="description" className="mb-0 mt-2">
              <TextArea
                placeholder="Sertifika açıklaması..."
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
              <TrophyOutlined className="mr-1" /> Temel Bilgiler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Çalışan *</div>
                <Form.Item
                  name="employeeId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Select
                    placeholder="Çalışan seçin"
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    options={employees.map((e) => ({
                      value: e.id,
                      label: e.fullName,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Sertifika Tipi *</div>
                <Form.Item
                  name="certificationType"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Select
                    placeholder="Tip seçin"
                    variant="filled"
                    options={certificationTypeOptions}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Seviye</div>
                <Form.Item name="certificationLevel" className="mb-3">
                  <Select
                    placeholder="Seviye seçin"
                    variant="filled"
                    allowClear
                    options={certificationLevelOptions}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Uzmanlık Alanı</div>
                <Form.Item name="specialization" className="mb-3">
                  <Input placeholder="Örn: Cloud, Security" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Issuing Authority */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Veren Kurum
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Kurum Adı *</div>
                <Form.Item
                  name="issuingAuthority"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <Input placeholder="Örn: Microsoft, AWS, PMI" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Ülke</div>
                <Form.Item name="issuingCountry" className="mb-3">
                  <Input placeholder="ABD, Almanya, vb." variant="filled" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Sertifika No</div>
                <Form.Item name="certificationNumber" className="mb-3">
                  <Input placeholder="Sertifika numarası" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Credential ID</div>
                <Form.Item name="credentialId" className="mb-3">
                  <Input placeholder="Kimlik numarası" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
            <div className="text-xs text-gray-400 mb-1">Doğrulama URL</div>
            <Form.Item name="verificationUrl" className="mb-0">
              <Input
                placeholder="https://verify.example.com/..."
                variant="filled"
              />
            </Form.Item>
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
                <div className="text-xs text-gray-400 mb-1">Verilme Tarihi *</div>
                <Form.Item
                  name="issueDate"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-3"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    variant="filled"
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Geçerlilik Bitiş</div>
                <Form.Item name="expiryDate" className="mb-3">
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

          {/* Training Section (if required) */}
          {trainingRequired && (
            <>
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <BookOutlined className="mr-1" /> Eğitim Bilgileri
                </Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className="text-xs text-gray-400 mb-1">Toplam Saat</div>
                    <Form.Item name="totalTrainingHours" className="mb-3">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        variant="filled"
                        placeholder="40"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <div className="text-xs text-gray-400 mb-1">Eğitim Sağlayıcı</div>
                    <Form.Item name="trainingProvider" className="mb-3">
                      <Input placeholder="Eğitim veren kurum" variant="filled" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </>
          )}

          {/* Exam Section (if required) */}
          {examRequired && (
            <>
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  Sınav Bilgileri
                </Text>
                <Row gutter={16}>
                  <Col span={8}>
                    <div className="text-xs text-gray-400 mb-1">Sınav Tarihi</div>
                    <Form.Item name="examDate" className="mb-3">
                      <DatePicker
                        style={{ width: '100%' }}
                        variant="filled"
                        format="DD.MM.YYYY"
                        placeholder="Tarih seçin"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <div className="text-xs text-gray-400 mb-1">Sınav Puanı</div>
                    <Form.Item name="examScore" className="mb-3">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        max={100}
                        variant="filled"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <div className="text-xs text-gray-400 mb-1">Geçme Puanı</div>
                    <Form.Item name="passingScore" className="mb-3">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        max={100}
                        variant="filled"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </>
          )}

          {/* CPE Section (if required) */}
          {cpeRequired && (
            <>
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  CPE/CEU Bilgileri
                </Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className="text-xs text-gray-400 mb-1">Gerekli CPE</div>
                    <Form.Item name="requiredCpeUnits" className="mb-3">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        variant="filled"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <div className="text-xs text-gray-400 mb-1">Kazanılan CPE</div>
                    <Form.Item name="earnedCpeUnits" className="mb-3">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        variant="filled"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </>
          )}

          {/* Cost Section */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <DollarOutlined className="mr-1" /> Maliyet Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Sertifika Ücreti</div>
                <Form.Item name="certificationCost" className="mb-3">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    variant="filled"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                    addonAfter="TRY"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Yenileme Ücreti</div>
                <Form.Item name="renewalCost" className="mb-3">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    variant="filled"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                    addonAfter="TRY"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Notes */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />
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

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
