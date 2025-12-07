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
  BookOutlined,
  DeleteOutlined,
  TeamOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTraining, useDeleteTraining } from '@/lib/api/hooks/useHR';
import { TrainingStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export default function TrainingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: training, isLoading, error } = useTraining(id);
  const deleteTraining = useDeleteTraining();

  const handleDelete = () => {
    if (!training) return;
    Modal.confirm({
      title: 'Eğitimi Sil',
      content: `"${training.title}" eğitimini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteTraining.mutateAsync(id);
          router.push('/hr/trainings');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const formatCurrency = (value?: number) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  const getStatusConfig = (status?: TrainingStatus) => {
    const statusMap: Record<TrainingStatus, { color: string; text: string }> = {
      [TrainingStatus.Scheduled]: { color: 'blue', text: 'Planlandı' },
      [TrainingStatus.InProgress]: { color: 'green', text: 'Devam Ediyor' },
      [TrainingStatus.Completed]: { color: 'default', text: 'Tamamlandı' },
      [TrainingStatus.Cancelled]: { color: 'red', text: 'İptal Edildi' },
      [TrainingStatus.Postponed]: { color: 'orange', text: 'Ertelendi' },
    };
    return status !== undefined ? statusMap[status] : { color: 'default', text: '-' };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="p-6">
        <Empty description="Eğitim bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/trainings')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(training.status);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/trainings')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {training.title}
            </Title>
            <Space>
              <Text type="secondary">{training.code}</Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">{training.provider || '-'}</Text>
              <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
              {training.isMandatory && <Tag color="red">Zorunlu</Tag>}
              {training.isOnline && <Tag color="purple">Online</Tag>}
            </Space>
          </div>
        </Space>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => router.push(`/hr/trainings/${id}/edit`)}>
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
                  title="Katılımcı"
                  value={training.currentParticipants || 0}
                  suffix={`/ ${training.maxParticipants || '-'}`}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#7c3aed' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Süre"
                  value={training.durationHours || 0}
                  suffix="saat"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#52c41a', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Başlangıç"
                  value={training.startDate ? dayjs(training.startDate).format('DD.MM.YYYY') : '-'}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Maliyet"
                  value={training.cost || 0}
                  formatter={(val) => formatCurrency(Number(val))}
                  valueStyle={{ color: '#faad14', fontSize: 16 }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Details */}
        <Col xs={24} lg={16}>
          <Card title="Eğitim Bilgileri">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Eğitim Kodu">{training.code}</Descriptions.Item>
              <Descriptions.Item label="Eğitim Adı">{training.title}</Descriptions.Item>
              <Descriptions.Item label="Eğitim Türü">{training.trainingType || '-'}</Descriptions.Item>
              <Descriptions.Item label="Sağlayıcı">{training.provider || '-'}</Descriptions.Item>
              <Descriptions.Item label="Eğitmen">{training.instructor || '-'}</Descriptions.Item>
              <Descriptions.Item label="Açıklama">{training.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="Başlangıç Tarihi">
                {training.startDate ? dayjs(training.startDate).format('DD MMMM YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Bitiş Tarihi">
                {training.endDate ? dayjs(training.endDate).format('DD MMMM YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Süre">{training.durationHours} saat</Descriptions.Item>
              <Descriptions.Item label="Konum">
                <Space>
                  <EnvironmentOutlined />
                  {training.isOnline ? (
                    <a href={training.onlineUrl} target="_blank" rel="noopener noreferrer">
                      {training.onlineUrl || 'Online'}
                    </a>
                  ) : (
                    training.location || '-'
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Maksimum Katılımcı">
                {training.maxParticipants || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Mevcut Katılımcı">
                {training.currentParticipants || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Maliyet">
                {formatCurrency(training.cost)} {training.currency || 'TRY'}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Certification Info */}
        <Col xs={24} lg={8}>
          <Card title="Sertifikasyon">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Sertifika">
                {training.hasCertification ? (
                  <Tag color="green">Var</Tag>
                ) : (
                  <Tag color="default">Yok</Tag>
                )}
              </Descriptions.Item>
              {training.hasCertification && (
                <>
                  <Descriptions.Item label="Geçerlilik">
                    {training.certificationValidityMonths
                      ? `${training.certificationValidityMonths} ay`
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Geçme Puanı">
                    {training.passingScore || '-'}
                  </Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="Zorunlu">
                {training.isMandatory ? (
                  <Tag color="red">Evet</Tag>
                ) : (
                  <Tag color="default">Hayır</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Prerequisites & Materials */}
        {(training.prerequisites || training.materials) && (
          <Col xs={24}>
            <Card title="Ek Bilgiler">
              {training.prerequisites && (
                <>
                  <Text strong>Ön Koşullar:</Text>
                  <Paragraph className="mt-2">{training.prerequisites}</Paragraph>
                </>
              )}
              {training.materials && (
                <>
                  <Text strong>Materyaller:</Text>
                  <Paragraph className="mt-2">{training.materials}</Paragraph>
                </>
              )}
            </Card>
          </Col>
        )}

        {/* Notes */}
        {training.notes && (
          <Col xs={24}>
            <Card title="Notlar">
              <Paragraph>{training.notes}</Paragraph>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}
