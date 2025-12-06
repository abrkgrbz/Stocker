'use client';

import React, { useEffect, useState } from 'react';
import { Form, Select, DatePicker, Input, Row, Col, Typography, Upload, message } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { FileOutlined, InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { EmployeeDocumentDto } from '@/lib/api/services/hr.types';
import { DocumentType } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;
const { Dragger } = Upload;

// Document type labels in Turkish
const documentTypeLabels: Record<number, string> = {
  [DocumentType.IdentityCard]: 'Kimlik Kartı',
  [DocumentType.Passport]: 'Pasaport',
  [DocumentType.DrivingLicense]: 'Ehliyet',
  [DocumentType.Diploma]: 'Diploma',
  [DocumentType.Certificate]: 'Sertifika',
  [DocumentType.Resume]: 'Özgeçmiş',
  [DocumentType.EmploymentContract]: 'İş Sözleşmesi',
  [DocumentType.MedicalReport]: 'Sağlık Raporu',
  [DocumentType.CriminalRecord]: 'Sabıka Kaydı',
  [DocumentType.AddressProof]: 'Adres Belgesi',
  [DocumentType.ReferenceLetter]: 'Referans Mektubu',
  [DocumentType.SocialSecurityDocument]: 'SGK Belgesi',
  [DocumentType.BankInformation]: 'Banka Bilgileri',
  [DocumentType.FamilyRegister]: 'Aile Kayıt Belgesi',
  [DocumentType.MilitaryDocument]: 'Askerlik Belgesi',
  [DocumentType.Photo]: 'Fotoğraf',
  [DocumentType.Other]: 'Diğer',
};

const documentTypeOptions = Object.entries(documentTypeLabels).map(([value, label]) => ({
  value: Number(value),
  label,
}));

interface DocumentFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: EmployeeDocumentDto;
  onFinish: (values: any) => void;
  loading?: boolean;
  onFileChange?: (file: File | null) => void;
}

export default function DocumentForm({ form, initialValues, onFinish, loading, onFileChange }: DocumentFormProps) {
  const { data: employees = [] } = useEmployees();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        issueDate: initialValues.issueDate ? dayjs(initialValues.issueDate) : undefined,
        expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate) : undefined,
      });
    }
  }, [form, initialValues]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    beforeUpload: (file) => {
      // Validate file size (max 10MB)
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Dosya boyutu 10MB\'dan küçük olmalıdır!');
        return Upload.LIST_IGNORE;
      }

      // Store the file for later upload
      setFileList([file]);
      onFileChange?.(file);

      // Prevent automatic upload
      return false;
    },
    onRemove: () => {
      setFileList([]);
      onFileChange?.(null);
    },
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="document-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - File Upload (40%) */}
        <Col xs={24} lg={10}>
          {/* File Upload Area */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Dosya Yükleme
            </Text>
            <Dragger
              {...uploadProps}
              style={{
                background: 'linear-gradient(135deg, #667eea08 0%, #764ba208 100%)',
                borderRadius: '16px',
                border: '2px dashed #667eea40',
                padding: '20px',
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ fontSize: '48px', color: '#667eea' }} />
              </p>
              <p className="ant-upload-text" style={{ color: '#374151', fontWeight: 500 }}>
                Dosya Yükle
              </p>
              <p className="ant-upload-hint" style={{ color: '#6b7280' }}>
                Dosyayı sürükleyip bırakın veya tıklayarak seçin
              </p>
              <p className="ant-upload-hint" style={{ color: '#9ca3af', fontSize: '12px' }}>
                Maksimum dosya boyutu: 10MB
              </p>
            </Dragger>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 mb-6">
            <div className="text-sm font-medium text-blue-700 mb-1">Bilgi</div>
            <div className="text-xs text-blue-600">
              PDF, Word, Excel, resim ve diğer belge formatlarını yükleyebilirsiniz.
            </div>
          </div>

          {/* File Info for Edit Mode */}
          {initialValues && initialValues.fileName && (
            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Mevcut Dosya</div>
              <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                <FileOutlined />
                {initialValues.fileName}
              </div>
              {initialValues.fileSize && (
                <div className="text-xs text-gray-400 mt-1">
                  {(initialValues.fileSize / 1024 / 1024).toFixed(2)} MB
                </div>
              )}
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Basic Info Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Temel Bilgiler
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Çalışan *</div>
                <Form.Item
                  name="employeeId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <Select
                    placeholder="Çalışan seçin"
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    disabled={!!initialValues}
                    options={employees.map((e) => ({
                      value: e.id,
                      label: e.fullName,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Belge Türü *</div>
                <Form.Item
                  name="documentType"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <Select
                    placeholder="Belge türü seçin"
                    variant="filled"
                    options={documentTypeOptions}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Belge Adı *</div>
                <Form.Item
                  name="title"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <Input placeholder="Örn: Kimlik Kartı Fotokopisi" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Belge Numarası *</div>
                <Form.Item
                  name="documentNumber"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <Input placeholder="Örn: 12345678901" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Date Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Tarih Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Düzenleme Tarihi</div>
                <Form.Item name="issueDate" className="mb-4">
                  <DatePicker
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    placeholder="Tarih seçin"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Son Geçerlilik Tarihi</div>
                <Form.Item name="expiryDate" className="mb-4">
                  <DatePicker
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    placeholder="Tarih seçin"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Additional Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Ek Bilgiler
            </Text>
            <div className="text-xs text-gray-400 mb-1">Veren Kurum</div>
            <Form.Item name="issuingAuthority" className="mb-4">
              <Input placeholder="Örn: Nüfus Müdürlüğü" variant="filled" />
            </Form.Item>
            <div className="text-xs text-gray-400 mb-1">Açıklama</div>
            <Form.Item name="description" className="mb-4">
              <TextArea rows={2} placeholder="Belge hakkında açıklama..." variant="filled" />
            </Form.Item>
            <div className="text-xs text-gray-400 mb-1">Notlar</div>
            <Form.Item name="notes" className="mb-0">
              <TextArea rows={2} placeholder="Ek notlar..." variant="filled" />
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
