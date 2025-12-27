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
  Timeline,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PencilIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useOvertime,
  useApproveOvertime,
  useRejectOvertime,
} from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

// Status options
const statusOptions: Record<string, { label: string; color: string }> = {
  Pending: { label: 'Beklemede', color: 'orange' },
  Approved: { label: 'Onaylandı', color: 'green' },
  Rejected: { label: 'Reddedildi', color: 'red' },
  Completed: { label: 'Tamamlandı', color: 'blue' },
  Cancelled: { label: 'İptal Edildi', color: 'default' },
};

// Overtime type options
const overtimeTypeLabels: Record<string, string> = {
  Regular: 'Normal Mesai',
  Weekend: 'Hafta Sonu',
  Holiday: 'Tatil Günü',
  Night: 'Gece Mesaisi',
  Emergency: 'Acil Durum',
  Project: 'Proje Bazlı',
};

export default function OvertimeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: overtime, isLoading } = useOvertime(id);
  const approveOvertime = useApproveOvertime();
  const rejectOvertime = useRejectOvertime();

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return dayjs(date).format('DD.MM.YYYY');
  };

  const formatDateTime = (date?: string) => {
    if (!date) return '-';
    return dayjs(date).format('DD.MM.YYYY HH:mm');
  };

  const formatTime = (time?: string) => {
    if (!time) return '-';
    return time.substring(0, 5);
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

  if (!overtime) {
    return (
      <div className="p-6">
        <Text>Mesai kaydı bulunamadı.</Text>
      </div>
    );
  }

  const statusInfo = statusOptions[overtime.status] || { label: overtime.status, color: 'default' };

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
                <ClockIcon className="w-4 h-4" />
                Fazla Mesai Detayı
                {overtime.isEmergency && (
                  <Tag color="red" icon={<AlertOutlined />}>
                    Acil
                  </Tag>
                )}
              </h1>
              <p className="text-sm text-gray-400 m-0">
                {overtime.employeeName} - {formatDate(overtime.date)}
              </p>
            </div>
          </div>
          <Space>
            {overtime.status === 'Pending' && (
              <>
                <Button
                  icon={<CheckCircleIcon className="w-4 h-4" />}
                  onClick={() => approveOvertime.mutateAsync({ id })}
                  loading={approveOvertime.isPending}
                  type="primary"
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                  Onayla
                </Button>
                <Button
                  icon={<XCircleIcon className="w-4 h-4" />}
                  onClick={() =>
                    rejectOvertime.mutateAsync({ id, reason: 'Talep reddedildi' })
                  }
                  loading={rejectOvertime.isPending}
                  danger
                >
                  Reddet
                </Button>
              </>
            )}
            <Button
              type="primary"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/hr/overtimes/${id}/edit`)}
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
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Mesai Bilgileri
                </Title>
                <Tag color={statusInfo.color} className="text-base px-3 py-1">
                  {statusInfo.label}
                </Tag>
              </div>
              <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered size="small">
                <Descriptions.Item label="Çalışan">
                  {overtime.employeeName}
                </Descriptions.Item>
                <Descriptions.Item label="Mesai Tipi">
                  <Tag>{overtimeTypeLabels[overtime.overtimeType] || overtime.overtimeType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tarih">
                  {formatDate(overtime.date)}
                </Descriptions.Item>
                <Descriptions.Item label="Saat Aralığı">
                  {formatTime(overtime.startTime)} - {formatTime(overtime.endTime)}
                </Descriptions.Item>
                <Descriptions.Item label="Planlanan Saat">
                  {overtime.plannedHours} saat
                </Descriptions.Item>
                <Descriptions.Item label="Gerçekleşen Saat">
                  {overtime.actualHours ? `${overtime.actualHours} saat` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Mola">
                  {overtime.breakMinutes} dakika
                </Descriptions.Item>
                <Descriptions.Item label="Ödeme Çarpanı">
                  x{overtime.payMultiplier}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Reason & Description */}
            <Card className="mb-6">
              <Title level={4}>Sebep ve Açıklama</Title>
              <Text strong>Sebep:</Text>
              <Paragraph className="mt-2">{overtime.reason}</Paragraph>

              {overtime.description && (
                <>
                  <Divider />
                  <Text strong>Açıklama:</Text>
                  <Paragraph className="mt-2">{overtime.description}</Paragraph>
                </>
              )}

              {overtime.workDetails && (
                <>
                  <Divider />
                  <Text strong>Yapılan İşler:</Text>
                  <Paragraph className="mt-2 whitespace-pre-line">
                    {overtime.workDetails}
                  </Paragraph>
                </>
              )}
            </Card>

            {/* Project Info */}
            {(overtime.projectName || overtime.taskId || overtime.costCenter) && (
              <Card className="mb-6">
                <Title level={4}>
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Proje / Görev Bilgileri
                </Title>
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                  {overtime.projectName && (
                    <Descriptions.Item label="Proje">
                      {overtime.projectName}
                    </Descriptions.Item>
                  )}
                  {overtime.taskId && (
                    <Descriptions.Item label="Görev ID">
                      {overtime.taskId}
                    </Descriptions.Item>
                  )}
                  {overtime.costCenter && (
                    <Descriptions.Item label="Maliyet Merkezi">
                      {overtime.costCenter}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {/* Approval Info */}
            {(overtime.approvedByName ||
              overtime.approvalDate ||
              overtime.approvalNotes ||
              overtime.rejectionReason) && (
              <Card className="mb-6">
                <Title level={4}>
                  <UserIcon className="w-4 h-4 mr-2" />
                  Onay Bilgileri
                </Title>
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                  {overtime.approvedByName && (
                    <Descriptions.Item label="Onaylayan">
                      {overtime.approvedByName}
                    </Descriptions.Item>
                  )}
                  {overtime.approvalDate && (
                    <Descriptions.Item label="Onay Tarihi">
                      {formatDateTime(overtime.approvalDate)}
                    </Descriptions.Item>
                  )}
                </Descriptions>
                {overtime.approvalNotes && (
                  <>
                    <Divider />
                    <Text strong>Onay Notları:</Text>
                    <Paragraph className="mt-2">{overtime.approvalNotes}</Paragraph>
                  </>
                )}
                {overtime.rejectionReason && (
                  <>
                    <Divider />
                    <Text strong type="danger">
                      Red Sebebi:
                    </Text>
                    <Paragraph className="mt-2 text-red-500">
                      {overtime.rejectionReason}
                    </Paragraph>
                  </>
                )}
              </Card>
            )}

            {/* Notes */}
            {overtime.notes && (
              <Card className="mb-6">
                <Title level={4}>Notlar</Title>
                <Paragraph>{overtime.notes}</Paragraph>
              </Card>
            )}
          </Col>

          {/* Right Column - Sidebar */}
          <Col xs={24} lg={8}>
            {/* Employee Card */}
            <Card className="mb-6">
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-3">
                  <ClockIcon className="w-4 h-4 text-2xl text-white" />
                </div>
                <Text strong className="text-lg block">
                  {overtime.employeeName}
                </Text>
                <Tag
                  color={overtimeTypeLabels[overtime.overtimeType] === 'Acil Durum' ? 'red' : 'blue'}
                  className="mt-2"
                >
                  {overtimeTypeLabels[overtime.overtimeType] || overtime.overtimeType}
                </Tag>
              </div>
              <div className="space-y-3 mt-4">
                <div className="flex justify-between">
                  <Text type="secondary">Ön Onaylı:</Text>
                  <Tag color={overtime.isPreApproved ? 'green' : 'default'}>
                    {overtime.isPreApproved ? 'Evet' : 'Hayır'}
                  </Tag>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Acil:</Text>
                  <Tag color={overtime.isEmergency ? 'red' : 'default'}>
                    {overtime.isEmergency ? 'Evet' : 'Hayır'}
                  </Tag>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Telafi İzni:</Text>
                  <Tag color={overtime.isCompensatoryTimeOff ? 'purple' : 'default'}>
                    {overtime.isCompensatoryTimeOff ? 'Evet' : 'Hayır'}
                  </Tag>
                </div>
              </div>
            </Card>

            {/* Payment Info */}
            {!overtime.isCompensatoryTimeOff && (
              <Card className="mb-6">
                <Title level={5}>
                  <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                  Ödeme Bilgileri
                </Title>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Text type="secondary">Hesaplanan Tutar:</Text>
                    <Text strong className="text-lg text-green-600">
                      {formatCurrency(overtime.calculatedAmount, overtime.currency)}
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Ödendi:</Text>
                    <Tag color={overtime.isPaid ? 'green' : 'orange'}>
                      {overtime.isPaid ? 'Evet' : 'Hayır'}
                    </Tag>
                  </div>
                  {overtime.paidDate && (
                    <div className="flex justify-between">
                      <Text type="secondary">Ödeme Tarihi:</Text>
                      <Text>{formatDate(overtime.paidDate)}</Text>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Compensatory Time */}
            {overtime.isCompensatoryTimeOff && (
              <Card className="mb-6">
                <Title level={5}>Telafi İzni</Title>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Text type="secondary">Kazanılan Saat:</Text>
                    <Text strong>{overtime.compensatoryHoursEarned || 0}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Kullanılan Saat:</Text>
                    <Text>{overtime.compensatoryHoursUsed || 0}</Text>
                  </div>
                </div>
              </Card>
            )}

            {/* Timeline */}
            <Card className="mb-6">
              <Title level={5}>Zaman Çizelgesi</Title>
              <Timeline
                items={[
                  {
                    color: 'gray',
                    children: (
                      <div>
                        <Text type="secondary">Talep Tarihi</Text>
                        <div>
                          <Text>{formatDateTime(overtime.requestDate)}</Text>
                        </div>
                      </div>
                    ),
                  },
                  ...(overtime.approvalDate
                    ? [
                        {
                          color: overtime.status === 'Approved' ? 'green' : 'red',
                          children: (
                            <div>
                              <Text type="secondary">
                                {overtime.status === 'Approved' ? 'Onay' : 'Red'} Tarihi
                              </Text>
                              <div>
                                <Text>{formatDateTime(overtime.approvalDate)}</Text>
                              </div>
                            </div>
                          ),
                        },
                      ]
                    : []),
                  ...(overtime.paidDate
                    ? [
                        {
                          color: 'green',
                          children: (
                            <div>
                              <Text type="secondary">Ödeme Tarihi</Text>
                              <div>
                                <Text>{formatDate(overtime.paidDate)}</Text>
                              </div>
                            </div>
                          ),
                        },
                      ]
                    : []),
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
