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
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  FileOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useDocument, useDeleteDocument, useVerifyDocument } from '@/lib/api/hooks/useHR';
import { DocumentType } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

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
  const { data: document, isLoading, error } = useDocument(id);
  const deleteDocument = useDeleteDocument();
  const verifyDocument = useVerifyDocument();

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
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/documents')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {document.title}
            </Title>
            <Space>
              <Text type="secondary">{documentTypeLabels[document.documentType]}</Text>
              {document.isVerified ? (
                <Tag color="green" icon={<CheckCircleOutlined />}>Doğrulandı</Tag>
              ) : (
                <Tag color="default" icon={<ClockCircleOutlined />}>Bekliyor</Tag>
              )}
              {document.isExpired && (
                <Tag color="red" icon={<ExclamationCircleOutlined />}>Süresi Dolmuş</Tag>
              )}
              {document.isExpiringSoon && !document.isExpired && (
                <Tag color="orange" icon={<ClockCircleOutlined />}>Süresi Dolacak</Tag>
              )}
            </Space>
          </div>
        </Space>
        <Space>
          {!document.isVerified && (
            <Button
              type="primary"
              icon={<SafetyCertificateOutlined />}
              onClick={handleVerify}
              loading={verifyDocument.isPending}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              Doğrula
            </Button>
          )}
          <Button icon={<EditOutlined />} onClick={() => router.push(`/hr/documents/${id}/edit`)}>
            Düzenle
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
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
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Belge No"
                  value={document.documentNumber}
                  prefix={<FileOutlined />}
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
                  prefix={document.isVerified ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
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
                    <Tag color="green" icon={<CheckCircleOutlined />}>Doğrulandı</Tag>
                  ) : (
                    <Tag color="default" icon={<ClockCircleOutlined />}>Bekliyor</Tag>
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
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Dosya Adı">
                  {document.fileName || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Dosya Türü">
                  {document.fileType || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Dosya Boyutu">
                  {formatFileSize(document.fileSize)}
                </Descriptions.Item>
              </Descriptions>
              {document.fileUrl && (
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  block
                  className="mt-4"
                  href={document.fileUrl}
                  target="_blank"
                >
                  Dosyayı İndir
                </Button>
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
