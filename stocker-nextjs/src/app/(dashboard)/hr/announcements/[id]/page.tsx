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
  ArrowLeftIcon,
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  useAnnouncement,
  useDeleteAnnouncement,
  usePublishAnnouncement,
  useUnpublishAnnouncement,
} from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const priorityConfig: Record<string, { color: string; label: string }> = {
  Low: { color: 'default', label: 'Düşük' },
  Normal: { color: 'blue', label: 'Normal' },
  High: { color: 'orange', label: 'Yüksek' },
  Urgent: { color: 'red', label: 'Acil' },
};

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: announcement, isLoading, error } = useAnnouncement(id);
  const deleteAnnouncement = useDeleteAnnouncement();
  const publishAnnouncement = usePublishAnnouncement();
  const unpublishAnnouncement = useUnpublishAnnouncement();

  const handleDelete = () => {
    if (!announcement) return;
    Modal.confirm({
      title: 'Duyuruyu Sil',
      content: `"${announcement.title}" duyurusunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteAnnouncement.mutateAsync(id);
          router.push('/hr/announcements');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleTogglePublish = async () => {
    if (!announcement) return;
    try {
      if (announcement.isPublished) {
        await unpublishAnnouncement.mutateAsync(id);
      } else {
        await publishAnnouncement.mutateAsync(id);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return dayjs(date).format('DD.MM.YYYY');
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = () => {
    if (!announcement?.expiryDate) return null;
    const diff = dayjs(announcement.expiryDate).diff(dayjs(), 'day');
    return diff;
  };

  // Check if announcement is expired
  const isExpired = () => {
    if (!announcement?.expiryDate) return false;
    return dayjs(announcement.expiryDate).isBefore(dayjs(), 'day');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="p-6">
        <Empty description="Duyuru bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/announcements')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  const priority = priorityConfig[announcement.priority] || priorityConfig.Normal;
  const daysUntilExpiry = getDaysUntilExpiry();
  const expired = isExpired();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/hr/announcements')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {announcement.isPinned && <PushpinOutlined className="mr-2 text-orange-500" />}
              {announcement.title}
            </Title>
            <Space>
              <Tag color={priority.color}>{priority.label}</Tag>
              <Tag color={announcement.isPublished ? 'green' : 'default'}>
                {announcement.isPublished ? 'Yayında' : 'Taslak'}
              </Tag>
              {expired && <Tag color="red">Süresi Dolmuş</Tag>}
            </Space>
          </div>
        </Space>
        <Space>
          <Button
            icon={announcement.isPublished ? <StopOutlined /> : <CheckCircleIcon className="w-4 h-4" />}
            onClick={handleTogglePublish}
          >
            {announcement.isPublished ? 'Yayından Kaldır' : 'Yayınla'}
          </Button>
          <Button icon={<PencilIcon className="w-4 h-4" />} onClick={() => router.push(`/hr/announcements/${id}/edit`)}>
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
                  title="Öncelik"
                  value={priority.label}
                  valueStyle={{ color: priority.color === 'red' ? '#f5222d' : priority.color === 'orange' ? '#fa8c16' : '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Yayın Tarihi"
                  value={formatDate(announcement.publishDate)}
                  prefix={<CalendarIcon className="w-4 h-4" />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Bitiş Tarihi"
                  value={formatDate(announcement.expiryDate)}
                  prefix={<CalendarIcon className="w-4 h-4" />}
                  valueStyle={{ color: expired ? '#f5222d' : undefined }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Kalan Gün"
                  value={daysUntilExpiry !== null ? (daysUntilExpiry >= 0 ? daysUntilExpiry : 0) : '-'}
                  suffix={daysUntilExpiry !== null ? 'gün' : ''}
                  valueStyle={{ color: expired ? '#f5222d' : daysUntilExpiry !== null && daysUntilExpiry <= 7 ? '#fa8c16' : '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Content */}
        <Col xs={24} lg={16}>
          <Card title="Duyuru İçeriği">
            <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: 16 }}>
              {announcement.content}
            </Paragraph>
          </Card>
        </Col>

        {/* Details */}
        <Col xs={24} lg={8}>
          <Card title="Duyuru Bilgileri">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Başlık">{announcement.title}</Descriptions.Item>
              <Descriptions.Item label="Öncelik">
                <Tag color={priority.color}>{priority.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Yayın Tarihi">
                {formatDate(announcement.publishDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Bitiş Tarihi">
                {formatDate(announcement.expiryDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Sabitlenmiş">
                {announcement.isPinned ? (
                  <Tag color="orange" icon={<PushpinOutlined />}>Evet</Tag>
                ) : (
                  <Tag>Hayır</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={announcement.isPublished ? 'green' : 'default'}>
                  {announcement.isPublished ? 'Yayında' : 'Taslak'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
