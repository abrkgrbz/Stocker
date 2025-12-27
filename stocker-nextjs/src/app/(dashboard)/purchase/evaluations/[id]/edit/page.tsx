'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Form,
  Button,
  Card,
  Input,
  Row,
  Col,
  Typography,
  Spin,
  Empty,
  Tag,
  message,
  Progress,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  useSupplierEvaluation,
  useUpdateSupplierEvaluation,
} from '@/lib/api/hooks/usePurchase';
import type { EvaluationStatus } from '@/lib/api/services/purchase.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusConfig: Record<EvaluationStatus, { color: string; text: string }> = {
  Draft: { color: 'default', text: 'Taslak' },
  Submitted: { color: 'blue', text: 'Gönderildi' },
  Approved: { color: 'green', text: 'Onaylandı' },
  Rejected: { color: 'red', text: 'Reddedildi' },
};

const ratingColors: Record<string, string> = {
  Excellent: '#52c41a',
  Good: '#1890ff',
  Average: '#faad14',
  Poor: '#f5222d',
  Critical: '#722ed1',
};

const ratingLabels: Record<string, string> = {
  Excellent: 'Mükemmel',
  Good: 'İyi',
  Average: 'Ortalama',
  Poor: 'Zayıf',
  Critical: 'Kritik',
};

export default function EditSupplierEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const evaluationId = params.id as string;
  const [form] = Form.useForm();

  const { data: evaluation, isLoading: evaluationLoading } = useSupplierEvaluation(evaluationId);
  const updateEvaluation = useUpdateSupplierEvaluation();

  useEffect(() => {
    if (evaluation) {
      form.setFieldsValue({
        qualityScore: evaluation.qualityScore,
        deliveryScore: evaluation.deliveryScore,
        priceScore: evaluation.priceScore,
        serviceScore: evaluation.serviceScore,
        communicationScore: evaluation.communicationScore,
        responsiveness: evaluation.responsiveness,
        reliability: evaluation.reliability,
        flexibility: evaluation.flexibility,
        documentation: evaluation.documentation,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        recommendations: evaluation.recommendations,
        notes: evaluation.notes,
      });
    }
  }, [evaluation, form]);

  if (evaluationLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="p-8">
        <Empty description="Değerlendirme bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/evaluations')}>
            Değerlendirmelere Dön
          </Button>
        </div>
      </div>
    );
  }

  if (evaluation.status !== 'Draft') {
    return (
      <div className="p-8">
        <Empty description="Bu değerlendirme düzenlenemez. Sadece taslak değerlendirmeler düzenlenebilir." />
        <div className="text-center mt-4">
          <Button onClick={() => router.push(`/purchase/evaluations/${evaluationId}`)}>
            Değerlendirmeye Dön
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async (values: any) => {
    try {
      // Update evaluation notes (scores are read-only after creation based on DTO)
      await updateEvaluation.mutateAsync({
        id: evaluationId,
        data: {
          notes: values.notes,
        },
      });

      message.success('Değerlendirme başarıyla güncellendi');
      router.push(`/purchase/evaluations/${evaluationId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/evaluations/${evaluationId}`);
  };

  const isLoading = updateEvaluation.isPending;
  const status = statusConfig[evaluation.status as EvaluationStatus] || statusConfig.Draft;

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #faad14 0%, #fa8c16 100%)' }}
              >
                <StarOutlined style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  Değerlendirmeyi Düzenle
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  {evaluation.evaluationNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={<XMarkIcon className="w-4 h-4" />}
              onClick={handleCancel}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              onClick={() => form.submit()}
              loading={isLoading}
              className="px-6"
            >
              Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* Read-Only Info */}
          <Card title="Değerlendirme Bilgileri (Salt Okunur)" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Tedarikçi</Text>
                  <Text strong>{evaluation.supplierName}</Text>
                  {evaluation.supplierCode && (
                    <div className="text-xs text-gray-500">{evaluation.supplierCode}</div>
                  )}
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Durum</Text>
                  <Tag color={status.color}>{status.text}</Tag>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Değerlendirme</Text>
                  <Tag color={ratingColors[evaluation.rating] || 'default'}>
                    {ratingLabels[evaluation.rating] || evaluation.rating}
                  </Tag>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Dönem</Text>
                  <Text strong>{evaluation.year} - Q{evaluation.quarter || '-'}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Tip</Text>
                  <Text strong>{evaluation.evaluationType || evaluation.type}</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Genel Puan</Text>
                  <Progress
                    percent={evaluation.overallScore}
                    size="small"
                    status={evaluation.overallScore >= 70 ? 'success' : evaluation.overallScore >= 50 ? 'normal' : 'exception'}
                  />
                </div>
              </Col>
            </Row>
          </Card>

          {/* Primary Scores (Read-Only) */}
          <Card title="Ana Değerlendirme Puanları (Salt Okunur)" className="mb-6">
            <Text type="secondary" className="block mb-4">
              Puanlar değerlendirme oluşturulduktan sonra değiştirilemez.
            </Text>
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Kalite Puanı</Text>
                  <Progress percent={evaluation.qualityScore || 0} size="small" />
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Teslimat Puanı</Text>
                  <Progress percent={evaluation.deliveryScore || 0} size="small" />
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Fiyat Puanı</Text>
                  <Progress percent={evaluation.priceScore || 0} size="small" />
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Hizmet Puanı</Text>
                  <Progress percent={evaluation.serviceScore || 0} size="small" />
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">İletişim Puanı</Text>
                  <Progress percent={evaluation.communicationScore || 0} size="small" />
                </div>
              </Col>
            </Row>
          </Card>

          {/* Editable Feedback */}
          <Card title="Değerlendirme Notları" className="mb-6">
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item name="notes" label="Notlar">
                  <TextArea
                    rows={4}
                    placeholder="Değerlendirme notlarını girin..."
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </div>
    </div>
  );
}
