'use client';

import React from 'react';
import {
  Card,
  Descriptions,
  Button,
  Tag,
  Typography,
  Row,
  Col,
  Space,
  Spin,
  Dropdown,
  Modal,
  Progress,
  Statistic,
} from 'antd';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  PaperAirplaneIcon,
  PencilIcon,
  StarIcon,
  TrashIcon,
  TrophyIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useParams } from 'next/navigation';
import {
  useSupplierEvaluation,
  useDeleteSupplierEvaluation,
  useSubmitSupplierEvaluation,
  useApproveSupplierEvaluation,
} from '@/lib/api/hooks/usePurchase';
import type { EvaluationStatus } from '@/lib/api/services/purchase.types';

const { Title, Text, Paragraph } = Typography;

const statusConfig: Record<EvaluationStatus, { color: string; text: string; icon: React.ReactNode }> = {
  Draft: { color: 'default', text: 'Taslak', icon: <PencilIcon className="w-4 h-4" /> },
  Submitted: { color: 'blue', text: 'Gönderildi', icon: <ClockIcon className="w-4 h-4" /> },
  Approved: { color: 'green', text: 'Onaylandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Rejected: { color: 'red', text: 'Reddedildi', icon: <XCircleIcon className="w-4 h-4" /> },
};

const evaluationTypeLabels: Record<string, string> = {
  Periodic: 'Periyodik',
  PostDelivery: 'Teslimat Sonrası',
  Annual: 'Yıllık',
  Quarterly: 'Çeyreklik',
  Incident: 'Olay Bazlı',
};

const getScoreColor = (score: number) => {
  if (score >= 80) return '#52c41a';
  if (score >= 60) return '#1890ff';
  if (score >= 40) return '#faad14';
  return '#ff4d4f';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Mükemmel';
  if (score >= 60) return 'İyi';
  if (score >= 40) return 'Orta';
  return 'Düşük';
};

const criteriaLabels: Record<string, string> = {
  qualityScore: 'Kalite',
  deliveryScore: 'Teslimat',
  priceScore: 'Fiyat',
  serviceScore: 'Hizmet',
  responsiveness: 'Yanıt Hızı',
  reliability: 'Güvenilirlik',
  flexibility: 'Esneklik',
  documentation: 'Dokümantasyon',
};

export default function SupplierEvaluationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: evaluation, isLoading } = useSupplierEvaluation(id);
  const deleteMutation = useDeleteSupplierEvaluation();
  const submitMutation = useSubmitSupplierEvaluation();
  const approveMutation = useApproveSupplierEvaluation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="p-6">
        <Text type="danger">Değerlendirme bulunamadı</Text>
      </div>
    );
  }

  const status = statusConfig[evaluation.status];

  const handleDelete = () => {
    Modal.confirm({
      title: 'Değerlendirme Silinecek',
      icon: <ExclamationCircleIcon className="w-4 h-4" />,
      content: 'Bu değerlendirmeyi silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        await deleteMutation.mutateAsync(id);
        router.push('/purchase/evaluations');
      },
    });
  };

  const handleSubmit = () => {
    Modal.confirm({
      title: 'Değerlendirme Gönderilecek',
      content: 'Bu değerlendirmeyi onaya göndermek istediğinize emin misiniz?',
      onOk: () => submitMutation.mutate(id),
    });
  };

  const handleApprove = () => {
    Modal.confirm({
      title: 'Değerlendirme Onaylanacak',
      content: 'Bu değerlendirmeyi onaylamak istediğinize emin misiniz?',
      onOk: () => approveMutation.mutate({ id }),
    });
  };

  const renderScoreProgress = (key: string, score: number) => (
    <div key={key} className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>{criteriaLabels[key]}</span>
        <span style={{ color: getScoreColor(score) }} className="font-medium">
          {score}
        </span>
      </div>
      <Progress
        percent={score}
        strokeColor={getScoreColor(score)}
        showInfo={false}
        size="small"
      />
    </div>
  );

  const scores = {
    qualityScore: evaluation.qualityScore,
    deliveryScore: evaluation.deliveryScore,
    priceScore: evaluation.priceScore,
    serviceScore: evaluation.serviceScore,
    responsiveness: evaluation.responsiveness,
    reliability: evaluation.reliability,
    flexibility: evaluation.flexibility,
    documentation: evaluation.documentation,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()} />
          <div>
            <div className="flex items-center gap-3">
              <Title level={3} className="mb-0">{evaluation.evaluationNumber}</Title>
              <Tag color={status.color} icon={status.icon}>
                {status.text}
              </Tag>
              {evaluation.rank && evaluation.rank <= 3 && (
                <Tag color="gold" icon={<TrophyIcon className="w-4 h-4" />}>
                  #{evaluation.rank} Sıralama
                </Tag>
              )}
            </div>
            <Text type="secondary">{evaluation.supplierName}</Text>
          </div>
        </div>

        <Space>
          {evaluation.status === 'Draft' && (
            <>
              <Button
                icon={<PencilIcon className="w-4 h-4" />}
                onClick={() => router.push(`/purchase/evaluations/${id}/edit`)}
              >
                Düzenle
              </Button>
              <Button
                type="primary"
                icon={<PaperAirplaneIcon className="w-4 h-4" />}
                onClick={handleSubmit}
                loading={submitMutation.isPending}
              >
                Onaya Gönder
              </Button>
            </>
          )}
          {evaluation.status === 'Submitted' && (
            <Button
              type="primary"
              icon={<CheckCircleIcon className="w-4 h-4" />}
              onClick={handleApprove}
              loading={approveMutation.isPending}
            >
              Onayla
            </Button>
          )}
          <Dropdown
            menu={{
              items: [
                {
                  key: 'delete',
                  label: 'Sil',
                  icon: <TrashIcon className="w-4 h-4" />,
                  danger: true,
                  disabled: evaluation.status !== 'Draft',
                  onClick: handleDelete,
                },
              ],
            }}
          >
            <Button icon={<EllipsisHorizontalIcon className="w-4 h-4" />} />
          </Dropdown>
        </Space>
      </div>

      <Row gutter={24}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          {/* Overall Score */}
          <Card bordered={false} className="shadow-sm mb-6">
            <Row gutter={24} align="middle">
              <Col span={8}>
                <div className="text-center">
                  <Progress
                    type="circle"
                    percent={evaluation.overallScore}
                    strokeColor={getScoreColor(evaluation.overallScore)}
                    format={() => (
                      <div>
                        <div className="text-3xl font-bold" style={{ color: getScoreColor(evaluation.overallScore) }}>
                          {evaluation.overallScore.toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-500">Genel Puan</div>
                      </div>
                    )}
                    size={160}
                  />
                  <Tag
                    color={getScoreColor(evaluation.overallScore)}
                    className="mt-4"
                    style={{ fontSize: '14px', padding: '4px 12px' }}
                  >
                    {getScoreLabel(evaluation.overallScore)}
                  </Tag>
                </div>
              </Col>
              <Col span={16}>
                <Title level={5}>Kriter Puanları</Title>
                <Row gutter={24}>
                  <Col span={12}>
                    {Object.entries(scores).slice(0, 4).map(([key, score]) =>
                      renderScoreProgress(key, score)
                    )}
                  </Col>
                  <Col span={12}>
                    {Object.entries(scores).slice(4).map(([key, score]) =>
                      renderScoreProgress(key, score)
                    )}
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>

          {/* Info */}
          <Card title="Değerlendirme Bilgileri" bordered={false} className="shadow-sm mb-6">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Değerlendirme No">{evaluation.evaluationNumber}</Descriptions.Item>
              <Descriptions.Item label="Tedarikçi">
                <Space>
                  <BuildingStorefrontIcon className="w-4 h-4" />
                  {evaluation.supplierName}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Tip">
                {evaluationTypeLabels[evaluation.evaluationType] || evaluation.evaluationType}
              </Descriptions.Item>
              <Descriptions.Item label="Dönem">{evaluation.evaluationPeriod || '-'}</Descriptions.Item>
              <Descriptions.Item label="Değerlendirme Tarihi">
                {new Date(evaluation.evaluationDate).toLocaleDateString('tr-TR')}
              </Descriptions.Item>
              <Descriptions.Item label="Değerlendiren">{evaluation.evaluatorName || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Comments */}
          <Card title="Değerlendirme Notları" bordered={false} className="shadow-sm">
            <Row gutter={24}>
              <Col span={12}>
                <div className="mb-4">
                  <Text strong className="text-green-600">Güçlü Yönler</Text>
                  <Paragraph className="mt-2 text-gray-600">
                    {evaluation.strengths || 'Belirtilmemiş'}
                  </Paragraph>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-4">
                  <Text strong className="text-red-600">Zayıf Yönler</Text>
                  <Paragraph className="mt-2 text-gray-600">
                    {evaluation.weaknesses || 'Belirtilmemiş'}
                  </Paragraph>
                </div>
              </Col>
            </Row>
            {evaluation.recommendations && (
              <div className="mb-4">
                <Text strong className="text-blue-600">Öneriler</Text>
                <Paragraph className="mt-2 text-gray-600">
                  {evaluation.recommendations}
                </Paragraph>
              </div>
            )}
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          {/* Status Card */}
          <Card bordered={false} className="shadow-sm mb-6">
            <div
              style={{
                background: 'linear-gradient(135deg, #faad14 0%, #fa8c16 100%)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >
              <StarIcon className="w-4 h-4" style={{ fontSize: '48px', color: 'rgba(255,255,255,0.9)' }} />
              <div className="text-white/90 font-medium mt-2">{evaluation.evaluationNumber}</div>
              <Tag color={status.color} className="mt-2">{status.text}</Tag>
            </div>

            <Descriptions column={1} size="small">
              <Descriptions.Item label="Oluşturulma">
                {evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Son Güncelleme">
                {evaluation.updatedAt ? new Date(evaluation.updatedAt).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              {evaluation.approvedAt && (
                <Descriptions.Item label="Onay Tarihi">
                  {new Date(evaluation.approvedAt).toLocaleDateString('tr-TR')}
                </Descriptions.Item>
              )}
              {evaluation.approverName && (
                <Descriptions.Item label="Onaylayan">
                  {evaluation.approverName}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Notes */}
          {evaluation.notes && (
            <Card title="Ek Notlar" bordered={false} className="shadow-sm">
              <Paragraph className="text-gray-600 mb-0">{evaluation.notes}</Paragraph>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
