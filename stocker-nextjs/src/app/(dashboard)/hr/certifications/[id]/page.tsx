'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  Space,
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  Typography,
  Spin,
  Divider,
  Progress,
  Timeline,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  BookOutlined,
  DollarOutlined,
  LinkOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useCertification } from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export default function CertificationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: certification, isLoading } = useCertification(id);

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return dayjs(date).format('DD.MM.YYYY');
  };

  const formatCurrency = (value?: number, currency?: string) => {
    if (!value) return '-';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!certification) {
    return (
      <div className="p-6">
        <Text>Sertifika bulunamadı.</Text>
      </div>
    );
  }

  const getStatusInfo = () => {
    if (certification.isExpired) {
      return { color: 'red', text: 'Süresi Doldu', icon: <ExclamationCircleOutlined /> };
    }
    if (certification.isExpiringSoon) {
      return { color: 'orange', text: 'Yakında Dolacak', icon: <WarningOutlined /> };
    }
    return { color: 'green', text: 'Geçerli', icon: <CheckCircleOutlined /> };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50">
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
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0 flex items-center gap-2">
                <SafetyCertificateOutlined />
                {certification.certificationName}
              </h1>
              <p className="text-sm text-gray-400 m-0">{certification.employeeName}</p>
            </div>
          </div>
          <Space>
            {certification.verificationUrl && (
              <Button
                icon={<LinkOutlined />}
                href={certification.verificationUrl}
                target="_blank"
              >
                Doğrula
              </Button>
            )}
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/hr/certifications/${id}/edit`)}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
              }}
            >
              Düzenle
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]}>
          {/* Left Column - Main Info */}
          <Col xs={24} lg={16}>
            {/* Basic Info */}
            <Card className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Title level={4} className="m-0">
                  <TrophyOutlined className="mr-2" />
                  Sertifika Bilgileri
                </Title>
                <Tag color={statusInfo.color} icon={statusInfo.icon} className="text-base px-3 py-1">
                  {statusInfo.text}
                </Tag>
              </div>
              <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered size="small">
                <Descriptions.Item label="Sertifika Adı">
                  {certification.certificationName}
                </Descriptions.Item>
                <Descriptions.Item label="Tip">
                  <Tag>{certification.certificationType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Seviye">
                  {certification.certificationLevel || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Uzmanlık">
                  {certification.specialization || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Veren Kurum">
                  {certification.issuingAuthority}
                </Descriptions.Item>
                <Descriptions.Item label="Ülke">
                  {certification.issuingCountry || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Sertifika No">
                  {certification.certificationNumber || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Credential ID">
                  {certification.credentialId || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Training Info */}
            {certification.trainingRequired && (
              <Card className="mb-6">
                <Title level={4}>
                  <BookOutlined className="mr-2" />
                  Eğitim Bilgileri
                </Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text type="secondary">Toplam Saat:</Text>
                    <div>
                      <Text strong>{certification.totalTrainingHours || 0} saat</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Tamamlanan:</Text>
                    <div>
                      <Text strong>{certification.completedTrainingHours || 0} saat</Text>
                    </div>
                  </Col>
                  <Col span={24}>
                    <Text type="secondary">İlerleme:</Text>
                    <Progress
                      percent={
                        certification.totalTrainingHours
                          ? Math.round(
                              ((certification.completedTrainingHours || 0) /
                                certification.totalTrainingHours) *
                                100
                            )
                          : 0
                      }
                      status={
                        (certification.completedTrainingHours || 0) >=
                        (certification.totalTrainingHours || 0)
                          ? 'success'
                          : 'active'
                      }
                    />
                  </Col>
                  {certification.trainingProvider && (
                    <Col span={24}>
                      <Text type="secondary">Eğitim Sağlayıcı:</Text>
                      <div>
                        <Text>{certification.trainingProvider}</Text>
                      </div>
                    </Col>
                  )}
                </Row>
              </Card>
            )}

            {/* Exam Info */}
            {certification.examRequired && (
              <Card className="mb-6">
                <Title level={4}>Sınav Bilgileri</Title>
                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                  <Descriptions.Item label="Sınav Tarihi">
                    {formatDate(certification.examDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Deneme Sayısı">
                    {certification.attemptNumber || 1}
                  </Descriptions.Item>
                  <Descriptions.Item label="Sınav Puanı">
                    <Text
                      strong
                      type={
                        certification.examScore &&
                        certification.passingScore &&
                        certification.examScore >= certification.passingScore
                          ? 'success'
                          : 'danger'
                      }
                    >
                      {certification.examScore || '-'}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Geçme Puanı">
                    {certification.passingScore || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* CPE Info */}
            {certification.cpeRequired && (
              <Card className="mb-6">
                <Title level={4}>CPE/CEU Bilgileri</Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text type="secondary">Gerekli CPE:</Text>
                    <div>
                      <Text strong>{certification.requiredCpeUnits || 0}</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Kazanılan CPE:</Text>
                    <div>
                      <Text strong>{certification.earnedCpeUnits || 0}</Text>
                    </div>
                  </Col>
                  <Col span={24}>
                    <Progress
                      percent={
                        certification.requiredCpeUnits
                          ? Math.round(
                              ((certification.earnedCpeUnits || 0) /
                                certification.requiredCpeUnits) *
                                100
                            )
                          : 0
                      }
                      status={
                        (certification.earnedCpeUnits || 0) >=
                        (certification.requiredCpeUnits || 0)
                          ? 'success'
                          : 'active'
                      }
                    />
                  </Col>
                </Row>
              </Card>
            )}

            {/* Description & Notes */}
            {(certification.description || certification.notes) && (
              <Card className="mb-6">
                <Title level={4}>Açıklama ve Notlar</Title>
                {certification.description && (
                  <>
                    <Text strong>Açıklama:</Text>
                    <Paragraph className="mt-2">{certification.description}</Paragraph>
                  </>
                )}
                {certification.notes && (
                  <>
                    {certification.description && <Divider />}
                    <Text strong>Notlar:</Text>
                    <Paragraph className="mt-2">{certification.notes}</Paragraph>
                  </>
                )}
              </Card>
            )}
          </Col>

          {/* Right Column - Sidebar */}
          <Col xs={24} lg={8}>
            {/* Employee Info */}
            <Card className="mb-6">
              <Title level={5}>Çalışan</Title>
              <div className="text-center py-4">
                <div
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 flex items-center justify-center mx-auto mb-3"
                >
                  <SafetyCertificateOutlined className="text-2xl text-white" />
                </div>
                <Text strong className="text-lg block">
                  {certification.employeeName}
                </Text>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between">
                  <Text type="secondary">İş İçin Zorunlu:</Text>
                  <Tag color={certification.requiredForJob ? 'red' : 'default'}>
                    {certification.requiredForJob ? 'Evet' : 'Hayır'}
                  </Tag>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Şirket Sponsorlu:</Text>
                  <Tag color={certification.companySponsored ? 'green' : 'default'}>
                    {certification.companySponsored ? 'Evet' : 'Hayır'}
                  </Tag>
                </div>
              </div>
            </Card>

            {/* Dates */}
            <Card className="mb-6">
              <Title level={5}>Tarihler</Title>
              <Timeline
                items={[
                  {
                    color: 'green',
                    children: (
                      <div>
                        <Text type="secondary">Verilme Tarihi</Text>
                        <div>
                          <Text>{formatDate(certification.issueDate)}</Text>
                        </div>
                      </div>
                    ),
                  },
                  ...(certification.expiryDate
                    ? [
                        {
                          color: certification.isExpired
                            ? 'red'
                            : certification.isExpiringSoon
                            ? 'orange'
                            : 'blue',
                          children: (
                            <div>
                              <Text type="secondary">Bitiş Tarihi</Text>
                              <div>
                                <Text>{formatDate(certification.expiryDate)}</Text>
                              </div>
                            </div>
                          ),
                        },
                      ]
                    : []),
                  ...(certification.lastRenewalDate
                    ? [
                        {
                          color: 'purple',
                          children: (
                            <div>
                              <Text type="secondary">Son Yenileme</Text>
                              <div>
                                <Text>{formatDate(certification.lastRenewalDate)}</Text>
                              </div>
                            </div>
                          ),
                        },
                      ]
                    : []),
                  ...(certification.nextRenewalDate
                    ? [
                        {
                          color: 'cyan',
                          children: (
                            <div>
                              <Text type="secondary">Sonraki Yenileme</Text>
                              <div>
                                <Text>{formatDate(certification.nextRenewalDate)}</Text>
                              </div>
                            </div>
                          ),
                        },
                      ]
                    : []),
                ]}
              />
            </Card>

            {/* Cost Info */}
            {(certification.certificationCost || certification.renewalCost) && (
              <Card className="mb-6">
                <Title level={5}>
                  <DollarOutlined className="mr-2" />
                  Maliyet
                </Title>
                <div className="space-y-3">
                  {certification.certificationCost && (
                    <div className="flex justify-between">
                      <Text type="secondary">Sertifika Ücreti:</Text>
                      <Text strong>
                        {formatCurrency(
                          certification.certificationCost,
                          certification.currency
                        )}
                      </Text>
                    </div>
                  )}
                  {certification.renewalCost && (
                    <div className="flex justify-between">
                      <Text type="secondary">Yenileme Ücreti:</Text>
                      <Text strong>
                        {formatCurrency(certification.renewalCost, certification.currency)}
                      </Text>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Badge */}
            {certification.badgeUrl && (
              <Card className="mb-6">
                <Title level={5}>Rozet</Title>
                <div className="text-center">
                  <img
                    src={certification.badgeUrl}
                    alt="Sertifika Rozeti"
                    className="max-w-full h-auto rounded-lg"
                    style={{ maxHeight: 150 }}
                  />
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
