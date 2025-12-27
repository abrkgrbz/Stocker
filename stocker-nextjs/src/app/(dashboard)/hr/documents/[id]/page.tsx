'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Card,
  Descriptions,
  Tag,
  Spin,
  Row,
  Col,
  Statistic,
  Empty,
  Modal,
  Upload,
  message,
} from 'antd';
import type { UploadProps } from 'antd';
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentIcon,
  ExclamationCircleIcon,
  InboxIcon,
  PencilIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useDocument, useDeleteDocument, useVerifyDocument, useUploadDocumentFile } from '@/lib/api/hooks/useHR';
import { DocumentType } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Dragger } = Upload;

const { Title, Text } = Typography;

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

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: document, isLoading, error, refetch } = useDocument(id);
  const deleteDocument = useDeleteDocument();
  const verifyDocument = useVerifyDocument();
  const uploadFile = useUploadDocumentFile();

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      // Validate file size (max 10MB)
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Dosya boyutu 10MB\'dan küçük olmalıdır!');
        return false;
      }
      return true;
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        await uploadFile.mutateAsync({ id, file: file as File });
        message.success('Dosya başarıyla yüklendi');
        refetch();
        onSuccess?.(null);
      } catch (error) {
        message.error('Dosya yüklenirken bir hata oluştu');
        onError?.(error as Error);
      }
    },
  };

  const handleDelete = () => {
    if (!document) return;
    Modal.confirm({
      title: 'Belgeyi Sil',
      content: `"${document.title}" belgesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteDocument.mutateAsync(id);
          router.push('/hr/documents');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleVerify = () => {
    if (!document) return;
    Modal.confirm({
      title: 'Belgeyi Doğrula',
      content: `"${document.title}" belgesini doğrulamak istediğinizden emin misiniz?`,
      okText: 'Doğrula',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await verifyDocument.mutateAsync({ id });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="p-6">
        <Empty description="Belge bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/documents')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let size = bytes;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/hr/documents')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {document.title}
            </Title>
            <Space>
              <Text type="secondary">{documentTypeLabels[document.documentType]}</Text>
              {document.isVerified ? (
                <Tag color="green" icon={<CheckCircleIcon className="w-4 h-4" />}>Doğrulandı</Tag>
              ) : (
                <Tag color="default" icon={<ClockIcon className="w-4 h-4" />}>Bekliyor</Tag>
              )}
              {document.isExpired && (
                <Tag color="red" icon={<ExclamationCircleIcon className="w-4 h-4" />}>Süresi Dolmuş</Tag>
              )}
              {document.isExpiringSoon && !document.isExpired && (
                <Tag color="orange" icon={<ClockIcon className="w-4 h-4" />}>Süresi Dolacak</Tag>
              )}
            </Space>
          </div>
        </Space>
        <Space>
          {!document.isVerified && (
            <Button
              type="primary"
              icon={<ShieldCheckIcon className="w-4 h-4" />}
              onClick={handleVerify}
              loading={verifyDocument.isPending}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              Doğrula
            </Button>
          )}
          <Button icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/documents/${id}/edit`)}>
            Düzenle
          </Button>
          <Button danger icon={<TrashIcon className="w-4 h-4" />} onClick={handleDelete}>
            Sil
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Stats */}
        <Col xs={24}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Çalışan"
                  value={document.employeeName}
                  prefix={<UserIcon className="w-4 h-4" />}
                  valueStyle={{ color: '#1890ff', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Belge No"
                  value={document.documentNumber}
                  prefix={<DocumentIcon className="w-4 h-4" />}
                  valueStyle={{ color: '#7c3aed', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Dosya Boyutu"
                  value={formatFileSize(document.fileSize)}
                  valueStyle={{ color: '#3b82f6', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Durum"
                  value={document.isVerified ? 'Doğrulanmış' : 'Bekliyor'}
                  prefix={document.isVerified ? <CheckCircleIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}
                  valueStyle={{
                    color: document.isVerified ? '#52c41a' : '#8c8c8c',
                    fontSize: 16
                  }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Details */}
        <Col xs={24} lg={16}>
          <Card title="Belge Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Belge Adı">{document.title}</Descriptions.Item>
              <Descriptions.Item label="Belge Numarası">{document.documentNumber}</Descriptions.Item>
              <Descriptions.Item label="Belge Türü">
                <Tag color="blue">{documentTypeLabels[document.documentType]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Çalışan">{document.employeeName}</Descriptions.Item>
              <Descriptions.Item label="Açıklama">{document.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="Veren Kurum">{document.issuingAuthority || '-'}</Descriptions.Item>
              <Descriptions.Item label="Düzenleme Tarihi">
                {document.issueDate ? dayjs(document.issueDate).format('DD.MM.YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Son Geçerlilik Tarihi">
                {document.expiryDate ? (
                  <Space>
                    {dayjs(document.expiryDate).format('DD.MM.YYYY')}
                    {document.isExpired && <Tag color="red">Süresi Dolmuş</Tag>}
                    {document.isExpiringSoon && !document.isExpired && <Tag color="orange">Yakında</Tag>}
                  </Space>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Notlar">{document.notes || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Verification Info & File */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Verification Info */}
            <Card title="Doğrulama Bilgileri">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Durum">
                  {document.isVerified ? (
                    <Tag color="green" icon={<CheckCircleIcon className="w-4 h-4" />}>Doğrulandı</Tag>
                  ) : (
                    <Tag color="default" icon={<ClockIcon className="w-4 h-4" />}>Bekliyor</Tag>
                  )}
                </Descriptions.Item>
                {document.isVerified && (
                  <>
                    <Descriptions.Item label="Doğrulayan">
                      {document.verifiedByName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Doğrulama Tarihi">
                      {document.verifiedDate ? dayjs(document.verifiedDate).format('DD.MM.YYYY HH:mm') : '-'}
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </Card>

            {/* File Info */}
            <Card title="Dosya Bilgileri">
              {document.fileName ? (
                <>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Dosya Adı">
                      {document.fileName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dosya Türü">
                      {document.fileType || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dosya Boyutu">
                      {formatFileSize(document.fileSize)}
                    </Descriptions.Item>
                  </Descriptions>
                  <Space direction="vertical" style={{ width: '100%' }} className="mt-4">
                    {document.fileUrl && (
                      <Button
                        type="primary"
                        icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                        block
                        href={document.fileUrl}
                        target="_blank"
                      >
                        Dosyayı İndir
                      </Button>
                    )}
                    <Dragger {...uploadProps} disabled={uploadFile.isPending}>
                      <p className="ant-upload-drag-icon">
                        <InboxIcon className="w-4 h-4" />
                      </p>
                      <p className="ant-upload-text">Yeni Dosya Yükle</p>
                      <p className="ant-upload-hint">
                        Mevcut dosyayı değiştirmek için tıklayın veya sürükleyin
                      </p>
                    </Dragger>
                  </Space>
                </>
              ) : (
                <Dragger {...uploadProps} disabled={uploadFile.isPending}>
                  <p className="ant-upload-drag-icon">
                    <InboxIcon className="w-4 h-4" />
                  </p>
                  <p className="ant-upload-text">Dosya Yükle</p>
                  <p className="ant-upload-hint">
                    Dosya yüklemek için tıklayın veya buraya sürükleyin (max 10MB)
                  </p>
                </Dragger>
              )}
            </Card>

            {/* System Info */}
            <Card title="Sistem Bilgileri" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Oluşturulma">
                  {dayjs(document.createdAt).format('DD.MM.YYYY HH:mm')}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
