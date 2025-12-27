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
  Statistic,
  Typography,
  Spin,
  Divider,
  Timeline,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  PencilIcon,
  UserGroupIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import {
  useJobPosting,
  usePublishJobPosting,
  useUnpublishJobPosting,
  useCloseJobPosting,
} from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

// Status options
const statusOptions: Record<string, { label: string; color: string }> = {
  Draft: { label: 'Taslak', color: 'default' },
  Published: { label: 'Yayında', color: 'green' },
  Closed: { label: 'Kapalı', color: 'red' },
  OnHold: { label: 'Beklemede', color: 'orange' },
  Filled: { label: 'Dolu', color: 'blue' },
};

export default function JobPostingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: jobPosting, isLoading } = useJobPosting(id);
  const publishJobPosting = usePublishJobPosting();
  const unpublishJobPosting = useUnpublishJobPosting();
  const closeJobPosting = useCloseJobPosting();

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return dayjs(date).format('DD.MM.YYYY');
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!jobPosting) {
    return (
      <div className="p-6">
        <Text>İlan bulunamadı.</Text>
      </div>
    );
  }

  const statusInfo = statusOptions[jobPosting.status] || { label: jobPosting.status, color: 'default' };

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
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0 flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4" />
                {jobPosting.title}
                {jobPosting.isUrgent && <FireOutlined style={{ color: '#ff4d4f' }} />}
                {jobPosting.isFeatured && <PushpinOutlined style={{ color: '#faad14' }} />}
              </h1>
              <p className="text-sm text-gray-400 m-0">{jobPosting.postingCode}</p>
            </div>
          </div>
          <Space>
            {jobPosting.status === 'Draft' && (
              <Button
                icon={<PaperAirplaneIcon className="w-4 h-4" />}
                onClick={() => publishJobPosting.mutateAsync(id)}
                loading={publishJobPosting.isPending}
              >
                Yayınla
              </Button>
            )}
            {jobPosting.status === 'Published' && (
              <>
                <Button
                  icon={<EyeSlashIcon className="w-4 h-4" />}
                  onClick={() => unpublishJobPosting.mutateAsync(id)}
                  loading={unpublishJobPosting.isPending}
                >
                  Yayından Kaldır
                </Button>
                <Button
                  icon={<StopOutlined />}
                  onClick={() => closeJobPosting.mutateAsync(id)}
                  loading={closeJobPosting.isPending}
                  danger
                >
                  Kapat
                </Button>
              </>
            )}
            <Button
              type="primary"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/hr/job-postings/${id}/edit`)}
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
        {/* Stats */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Başvurular"
                value={jobPosting.totalApplications || 0}
                prefix={<UserGroupIcon className="w-4 h-4" />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Görüntülenme"
                value={jobPosting.viewsCount || 0}
                prefix={<DocumentTextIcon className="w-4 h-4" />}
                valueStyle={{ color: '#7c3aed' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="İşe Alınan"
                value={jobPosting.hiredCount || 0}
                prefix={<CheckCircleIcon className="w-4 h-4" />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Açık Pozisyon"
                value={jobPosting.numberOfOpenings || 0}
                prefix={<UserGroupIcon className="w-4 h-4" />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* Left Column - Main Info */}
          <Col xs={24} lg={16}>
            {/* Basic Info */}
            <Card className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Title level={4} className="m-0">Temel Bilgiler</Title>
                <Tag color={statusInfo.color} className="text-base px-3 py-1">
                  {statusInfo.label}
                </Tag>
              </div>
              <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered size="small">
                <Descriptions.Item label="Departman">{jobPosting.departmentName}</Descriptions.Item>
                <Descriptions.Item label="Pozisyon">{jobPosting.positionTitle || '-'}</Descriptions.Item>
                <Descriptions.Item label="Çalışma Tipi">
                  <Tag>{jobPosting.employmentType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Deneyim Seviyesi">
                  <Tag>{jobPosting.experienceLevel}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="İşe Alım Yöneticisi">
                  {jobPosting.hiringManagerName || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Uzaktan Çalışma">
                  {jobPosting.remoteWorkType === 'Remote' ? 'Uzaktan' :
                   jobPosting.remoteWorkType === 'Hybrid' ? 'Hibrit' : 'Ofiste'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Description */}
            <Card className="mb-6">
              <Title level={4}>Açıklama</Title>
              <Paragraph>{jobPosting.description || '-'}</Paragraph>
            </Card>

            {/* Requirements & Responsibilities */}
            {(jobPosting.requirements || jobPosting.responsibilities) && (
              <Card className="mb-6">
                <Title level={4}>Gereksinimler ve Sorumluluklar</Title>
                {jobPosting.requirements && (
                  <>
                    <Text strong>Gereksinimler:</Text>
                    <Paragraph className="mt-2 whitespace-pre-line">
                      {jobPosting.requirements}
                    </Paragraph>
                  </>
                )}
                {jobPosting.responsibilities && (
                  <>
                    <Divider />
                    <Text strong>Sorumluluklar:</Text>
                    <Paragraph className="mt-2 whitespace-pre-line">
                      {jobPosting.responsibilities}
                    </Paragraph>
                  </>
                )}
              </Card>
            )}

            {/* Qualifications */}
            {(jobPosting.qualifications || jobPosting.preferredQualifications) && (
              <Card className="mb-6">
                <Title level={4}>Nitelikler</Title>
                {jobPosting.qualifications && (
                  <>
                    <Text strong>Aranan Nitelikler:</Text>
                    <Paragraph className="mt-2 whitespace-pre-line">
                      {jobPosting.qualifications}
                    </Paragraph>
                  </>
                )}
                {jobPosting.preferredQualifications && (
                  <>
                    <Divider />
                    <Text strong>Tercih Edilen:</Text>
                    <Paragraph className="mt-2 whitespace-pre-line">
                      {jobPosting.preferredQualifications}
                    </Paragraph>
                  </>
                )}
              </Card>
            )}

            {/* Benefits */}
            {jobPosting.benefits && (
              <Card className="mb-6">
                <Title level={4}>Yan Haklar</Title>
                <Paragraph className="whitespace-pre-line">
                  {jobPosting.benefits}
                </Paragraph>
              </Card>
            )}
          </Col>

          {/* Right Column - Sidebar */}
          <Col xs={24} lg={8}>
            {/* Location */}
            <Card className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPinIcon className="w-4 h-4" className="text-lg" />
                <Title level={5} className="m-0">Konum</Title>
              </div>
              <div className="space-y-2">
                {jobPosting.workLocationName && (
                  <div>
                    <Text type="secondary">Çalışma Lokasyonu: </Text>
                    <Text>{jobPosting.workLocationName}</Text>
                  </div>
                )}
                {jobPosting.city && (
                  <div>
                    <Text type="secondary">Şehir: </Text>
                    <Text>{jobPosting.city}</Text>
                  </div>
                )}
                {jobPosting.country && (
                  <div>
                    <Text type="secondary">Ülke: </Text>
                    <Text>{jobPosting.country}</Text>
                  </div>
                )}
              </div>
            </Card>

            {/* Salary */}
            {jobPosting.showSalary && (jobPosting.salaryMin || jobPosting.salaryMax) && (
              <Card className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <CurrencyDollarIcon className="w-4 h-4" className="text-lg" />
                  <Title level={5} className="m-0">Maaş Bilgisi</Title>
                </div>
                <div className="space-y-2">
                  <div>
                    <Text type="secondary">Aralık: </Text>
                    <Text strong>
                      {formatCurrency(jobPosting.salaryMin)} - {formatCurrency(jobPosting.salaryMax)}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary">Periyot: </Text>
                    <Text>{jobPosting.salaryPeriod}</Text>
                  </div>
                </div>
              </Card>
            )}

            {/* Dates */}
            <Card className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="w-4 h-4" className="text-lg" />
                <Title level={5} className="m-0">Tarihler</Title>
              </div>
              <Timeline
                items={[
                  {
                    color: 'gray',
                    children: (
                      <div>
                        <Text type="secondary">Oluşturulma</Text>
                        <div><Text>{formatDate(jobPosting.createdAt)}</Text></div>
                      </div>
                    ),
                  },
                  ...(jobPosting.postedDate ? [{
                    color: 'green',
                    children: (
                      <div>
                        <Text type="secondary">Yayın Tarihi</Text>
                        <div><Text>{formatDate(jobPosting.postedDate)}</Text></div>
                      </div>
                    ),
                  }] : []),
                  ...(jobPosting.applicationDeadline ? [{
                    color: dayjs(jobPosting.applicationDeadline).isBefore(dayjs()) ? 'red' : 'blue',
                    children: (
                      <div>
                        <Text type="secondary">Son Başvuru</Text>
                        <div><Text>{formatDate(jobPosting.applicationDeadline)}</Text></div>
                      </div>
                    ),
                  }] : []),
                  ...(jobPosting.expectedStartDate ? [{
                    color: 'purple',
                    children: (
                      <div>
                        <Text type="secondary">Beklenen Başlangıç</Text>
                        <div><Text>{formatDate(jobPosting.expectedStartDate)}</Text></div>
                      </div>
                    ),
                  }] : []),
                  ...(jobPosting.closedDate ? [{
                    color: 'red',
                    children: (
                      <div>
                        <Text type="secondary">Kapanış Tarihi</Text>
                        <div><Text>{formatDate(jobPosting.closedDate)}</Text></div>
                      </div>
                    ),
                  }] : []),
                ]}
              />
            </Card>

            {/* Tags & Keywords */}
            {(jobPosting.tags || jobPosting.keywords) && (
              <Card className="mb-6">
                <Title level={5}>Etiketler</Title>
                {jobPosting.tags && (
                  <div className="mb-2">
                    {jobPosting.tags.split(',').map((tag, idx) => (
                      <Tag key={idx} className="mb-1">{tag.trim()}</Tag>
                    ))}
                  </div>
                )}
                {jobPosting.keywords && (
                  <div>
                    <Text type="secondary" className="text-xs">Anahtar Kelimeler: </Text>
                    <Text className="text-xs">{jobPosting.keywords}</Text>
                  </div>
                )}
              </Card>
            )}

            {/* Internal Notes */}
            {jobPosting.internalNotes && (
              <Card className="mb-6">
                <Title level={5}>İç Notlar</Title>
                <Paragraph className="text-sm text-gray-600">
                  {jobPosting.internalNotes}
                </Paragraph>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
