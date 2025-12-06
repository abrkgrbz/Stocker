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
  DollarOutlined,
} from '@ant-design/icons';
import { useTraining, useDeleteTraining } from '@/lib/api/hooks/useHR';
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
      content: `"${training.name}" eğitimini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
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

  const getStatusConfig = () => {
    if (!training) return { color: 'default', text: '-' };
    const now = dayjs();
    if (training.endDate && dayjs(training.endDate).isBefore(now)) {
      return { color: 'default', text: 'Tamamlandı' };
    }
    if (training.startDate && dayjs(training.startDate).isAfter(now)) {
      return { color: 'blue', text: 'Yaklaşan' };
    }
    if (training.startDate && training.endDate) {
      return { color: 'green', text: 'Devam Ediyor' };
    }
    return { color: 'default', text: '-' };
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

  const statusConfig = getStatusConfig();

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
              {training.name}
            </Title>
            <Space>
              <Text type="secondary">{training.provider || '-'}</Text>
              <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
              {training.isActive && <Tag color="green">Aktif</Tag>}
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
                  value={training.participantCount || 0}
                  suffix={`/ ${training.maxParticipants || '-'}`}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#7c3aed' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Başlangıç"
                  value={training.startDate ? dayjs(training.startDate).format('DD.MM.YYYY') : '-'}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#52c41a', fontSize: 16 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Bitiş"
                  value={training.endDate ? dayjs(training.endDate).format('DD.MM.YYYY') : '-'}
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
              <Descriptions.Item label="Eğitim Adı">{training.name}</Descriptions.Item>
              <Descriptions.Item label="Sağlayıcı">{training.provider || '-'}</Descriptions.Item>
              <Descriptions.Item label="Açıklama">{training.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="Başlangıç Tarihi">
                {training.startDate ? dayjs(training.startDate).format('DD MMMM YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Bitiş Tarihi">
                {training.endDate ? dayjs(training.endDate).format('DD MMMM YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Konum">
                <Space>
                  <EnvironmentOutlined />
                  {training.location || '-'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Maksimum Katılımcı">
                {training.maxParticipants || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Mevcut Katılımcı">
                {training.participantCount || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Maliyet">
                {formatCurrency(training.cost)}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
