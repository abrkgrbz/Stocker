'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tag, Modal, Row, Col, Card, Statistic, Descriptions } from 'antd';
import { DetailPageLayout } from '@/components/patterns';
import { Button } from '@/components/primitives';
import {
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  MapPinIcon,
  PencilIcon,
  StopCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  useAnnouncement,
  useDeleteAnnouncement,
  usePublishAnnouncement,
  useUnpublishAnnouncement,
} from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

const priorityConfig: Record<string, { color: string; label: string }> = {
  Low: { color: 'default', label: 'Dusuk' },
  Normal: { color: 'blue', label: 'Normal' },
  High: { color: 'orange', label: 'Yuksek' },
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
      content: `"${announcement.title}" duyurusunu silmek istediginizden emin misiniz? Bu islem geri alinamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
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

  const priority = priorityConfig[announcement?.priority || 'Normal'] || priorityConfig.Normal;
  const daysUntilExpiry = getDaysUntilExpiry();
  const expired = isExpired();

  return (
    <DetailPageLayout
      title={announcement?.title || 'Duyuru'}
      subtitle={announcement?.isPinned ? 'Sabitlenmis Duyuru' : undefined}
      backPath="/hr/announcements"
      icon={<BellIcon className="w-5 h-5 text-white" />}
      iconBgColor="bg-orange-600"
      statusBadge={
        announcement && (
          <>
            <Tag color={priority.color}>{priority.label}</Tag>
            <Tag color={announcement.isPublished ? 'green' : 'default'}>
              {announcement.isPublished ? 'Yayinda' : 'Taslak'}
            </Tag>
            {expired && <Tag color="red">Suresi Dolmus</Tag>}
          </>
        )
      }
      actions={
        <>
          <Button
            variant="secondary"
            icon={announcement?.isPublished ? <StopCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
            onClick={handleTogglePublish}
          >
            {announcement?.isPublished ? 'Yayindan Kaldir' : 'Yayinla'}
          </Button>
          <Button
            variant="secondary"
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => router.push(`/hr/announcements/${id}/edit`)}
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
      isError={!!error || (!isLoading && !announcement)}
      errorMessage="Duyuru Bulunamadi"
      errorDescription="Istenen duyuru bulunamadi veya bir hata olustu."
    >
      <Row gutter={[24, 24]}>
        {/* Stats */}
        <Col xs={24}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Oncelik"
                  value={priority.label}
                  valueStyle={{ color: priority.color === 'red' ? '#f5222d' : priority.color === 'orange' ? '#fa8c16' : '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Yayin Tarihi"
                  value={formatDate(announcement?.publishDate)}
                  prefix={<CalendarIcon className="w-4 h-4" />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Bitis Tarihi"
                  value={formatDate(announcement?.expiryDate)}
                  prefix={<CalendarIcon className="w-4 h-4" />}
                  valueStyle={{ color: expired ? '#f5222d' : undefined }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Kalan Gun"
                  value={daysUntilExpiry !== null ? (daysUntilExpiry >= 0 ? daysUntilExpiry : 0) : '-'}
                  suffix={daysUntilExpiry !== null ? 'gun' : ''}
                  valueStyle={{ color: expired ? '#f5222d' : daysUntilExpiry !== null && daysUntilExpiry <= 7 ? '#fa8c16' : '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Content */}
        <Col xs={24} lg={16}>
          <Card title="Duyuru Icerigi">
            <p className="text-slate-600 whitespace-pre-wrap text-base">
              {announcement?.content}
            </p>
          </Card>
        </Col>

        {/* Details */}
        <Col xs={24} lg={8}>
          <Card title="Duyuru Bilgileri">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Baslik">{announcement?.title}</Descriptions.Item>
              <Descriptions.Item label="Oncelik">
                <Tag color={priority.color}>{priority.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Yayin Tarihi">
                {formatDate(announcement?.publishDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Bitis Tarihi">
                {formatDate(announcement?.expiryDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Sabitlenmis">
                {announcement?.isPinned ? (
                  <Tag color="orange" icon={<MapPinIcon className="w-4 h-4" />}>Evet</Tag>
                ) : (
                  <Tag>Hayir</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={announcement?.isPublished ? 'green' : 'default'}>
                  {announcement?.isPublished ? 'Yayinda' : 'Taslak'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </DetailPageLayout>
  );
}
