'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tag, Modal, Row, Col, Card, Statistic, Descriptions, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { DetailPageLayout } from '@/components/patterns';
import { Button } from '@/components/primitives';
import {
  ArrowDownTrayIcon,
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

// Document type labels in Turkish
const documentTypeLabels: Record<number, string> = {
  [DocumentType.IdentityCard]: 'Kimlik Karti',
  [DocumentType.Passport]: 'Pasaport',
  [DocumentType.DrivingLicense]: 'Ehliyet',
  [DocumentType.Diploma]: 'Diploma',
  [DocumentType.Certificate]: 'Sertifika',
  [DocumentType.Resume]: 'Ozgecmis',
  [DocumentType.EmploymentContract]: 'Is Sozlesmesi',
  [DocumentType.MedicalReport]: 'Saglik Raporu',
  [DocumentType.CriminalRecord]: 'Sabika Kaydi',
  [DocumentType.AddressProof]: 'Adres Belgesi',
  [DocumentType.ReferenceLetter]: 'Referans Mektubu',
  [DocumentType.SocialSecurityDocument]: 'SGK Belgesi',
  [DocumentType.BankInformation]: 'Banka Bilgileri',
  [DocumentType.FamilyRegister]: 'Aile Kayit Belgesi',
  [DocumentType.MilitaryDocument]: 'Askerlik Belgesi',
  [DocumentType.Photo]: 'Fotograf',
  [DocumentType.Other]: 'Diger',
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
        message.error('Dosya boyutu 10MB\'dan kucuk olmalidir!');
        return false;
      }
      return true;
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        await uploadFile.mutateAsync({ id, file: file as File });
        message.success('Dosya basariyla yuklendi');
        refetch();
        onSuccess?.(null);
      } catch (error) {
        message.error('Dosya yuklenirken bir hata olustu');
        onError?.(error as Error);
      }
    },
  };

  const handleDelete = () => {
    if (!document) return;
    Modal.confirm({
      title: 'Belgeyi Sil',
      content: `"${document.title}" belgesini silmek istediginizden emin misiniz? Bu islem geri alinamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
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
      title: 'Belgeyi Dogrula',
      content: `"${document.title}" belgesini dogrulamak istediginizden emin misiniz?`,
      okText: 'Dogrula',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await verifyDocument.mutateAsync({ id });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

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
    <DetailPageLayout
      title={document?.title || 'Belge'}
      subtitle={document ? documentTypeLabels[document.documentType] : undefined}
      backPath="/hr/documents"
      icon={<DocumentIcon className="w-5 h-5 text-white" />}
      iconBgColor="bg-cyan-600"
      statusBadge={
        document && (
          <>
            {document.isVerified ? (
              <Tag color="green" icon={<CheckCircleIcon className="w-4 h-4" />}>Dogrulandi</Tag>
            ) : (
              <Tag color="default" icon={<ClockIcon className="w-4 h-4" />}>Bekliyor</Tag>
            )}
            {document.isExpired && (
              <Tag color="red" icon={<ExclamationCircleIcon className="w-4 h-4" />}>Suresi Dolmus</Tag>
            )}
            {document.isExpiringSoon && !document.isExpired && (
              <Tag color="orange" icon={<ClockIcon className="w-4 h-4" />}>Suresi Dolacak</Tag>
            )}
          </>
        )
      }
      actions={
        <>
          {document && !document.isVerified && (
            <Button
              variant="primary"
              icon={<ShieldCheckIcon className="w-4 h-4" />}
              onClick={handleVerify}
              loading={verifyDocument.isPending}
              className="!bg-emerald-600 hover:!bg-emerald-700"
            >
              Dogrula
            </Button>
          )}
          <Button
            variant="secondary"
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => router.push(`/hr/documents/${id}/edit`)}
          >
            Duzenle
          </Button>
          <Button
            variant="danger"
            icon={<TrashIcon className="w-4 h-4" />}
            onClick={handleDelete}
          >
            Sil
          </Button>
        </>
      }
      isLoading={isLoading}
      isError={!!error || (!isLoading && !document)}
      errorMessage="Belge Bulunamadi"
      errorDescription="Istenen belge bulunamadi veya bir hata olustu."
    >
      <Row gutter={[24, 24]}>
        {/* Stats */}
        <Col xs={24}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Calisan"
                  value={document?.employeeName}
                  prefix={<UserIcon className="w-4 h-4" />}
                  valueStyle={{ color: '#1890ff', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Belge No"
                  value={document?.documentNumber}
                  prefix={<DocumentIcon className="w-4 h-4" />}
                  valueStyle={{ color: '#7c3aed', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Dosya Boyutu"
                  value={formatFileSize(document?.fileSize)}
                  valueStyle={{ color: '#3b82f6', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Durum"
                  value={document?.isVerified ? 'Dogrulanmis' : 'Bekliyor'}
                  prefix={document?.isVerified ? <CheckCircleIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}
                  valueStyle={{
                    color: document?.isVerified ? '#52c41a' : '#8c8c8c',
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
              <Descriptions.Item label="Belge Adi">{document?.title}</Descriptions.Item>
              <Descriptions.Item label="Belge Numarasi">{document?.documentNumber}</Descriptions.Item>
              <Descriptions.Item label="Belge Turu">
                <Tag color="blue">{document ? documentTypeLabels[document.documentType] : '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Calisan">{document?.employeeName}</Descriptions.Item>
              <Descriptions.Item label="Aciklama">{document?.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="Veren Kurum">{document?.issuingAuthority || '-'}</Descriptions.Item>
              <Descriptions.Item label="Duzenleme Tarihi">
                {document?.issueDate ? dayjs(document.issueDate).format('DD.MM.YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Son Gecerlilik Tarihi">
                {document?.expiryDate ? (
                  <div className="flex items-center gap-2">
                    {dayjs(document.expiryDate).format('DD.MM.YYYY')}
                    {document.isExpired && <Tag color="red">Suresi Dolmus</Tag>}
                    {document.isExpiringSoon && !document.isExpired && <Tag color="orange">Yakinda</Tag>}
                  </div>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Notlar">{document?.notes || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Verification Info & File */}
        <Col xs={24} lg={8}>
          <div className="space-y-4">
            {/* Verification Info */}
            <Card title="Dogrulama Bilgileri">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Durum">
                  {document?.isVerified ? (
                    <Tag color="green" icon={<CheckCircleIcon className="w-4 h-4" />}>Dogrulandi</Tag>
                  ) : (
                    <Tag color="default" icon={<ClockIcon className="w-4 h-4" />}>Bekliyor</Tag>
                  )}
                </Descriptions.Item>
                {document?.isVerified && (
                  <>
                    <Descriptions.Item label="Dogrulayan">
                      {document.verifiedByName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dogrulama Tarihi">
                      {document.verifiedDate ? dayjs(document.verifiedDate).format('DD.MM.YYYY HH:mm') : '-'}
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </Card>

            {/* File Info */}
            <Card title="Dosya Bilgileri">
              {document?.fileName ? (
                <>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Dosya Adi">
                      {document.fileName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dosya Turu">
                      {document.fileType || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dosya Boyutu">
                      {formatFileSize(document.fileSize)}
                    </Descriptions.Item>
                  </Descriptions>
                  <div className="mt-4 space-y-3">
                    {document.fileUrl && (
                      <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <Button
                          variant="primary"
                          icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                          fullWidth
                        >
                          Dosyayi Indir
                        </Button>
                      </a>
                    )}
                    <Dragger {...uploadProps} disabled={uploadFile.isPending}>
                      <p className="ant-upload-drag-icon">
                        <InboxIcon className="w-8 h-8 mx-auto text-slate-400" />
                      </p>
                      <p className="ant-upload-text">Yeni Dosya Yukle</p>
                      <p className="ant-upload-hint">
                        Mevcut dosyayi degistirmek icin tiklayin veya surukleyin
                      </p>
                    </Dragger>
                  </div>
                </>
              ) : (
                <Dragger {...uploadProps} disabled={uploadFile.isPending}>
                  <p className="ant-upload-drag-icon">
                    <InboxIcon className="w-8 h-8 mx-auto text-slate-400" />
                  </p>
                  <p className="ant-upload-text">Dosya Yukle</p>
                  <p className="ant-upload-hint">
                    Dosya yuklemek icin tiklayin veya buraya surukleyin (max 10MB)
                  </p>
                </Dragger>
              )}
            </Card>

            {/* System Info */}
            <Card title="Sistem Bilgileri" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Olusturulma">
                  {document?.createdAt ? dayjs(document.createdAt).format('DD.MM.YYYY HH:mm') : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        </Col>
      </Row>
    </DetailPageLayout>
  );
}
