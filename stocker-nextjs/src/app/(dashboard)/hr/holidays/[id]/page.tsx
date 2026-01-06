'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Modal,
} from 'antd';
import { DetailPageLayout, Badge } from '@/components/patterns';
import { Button } from '@/components/primitives';
import {
  CalendarIcon,
  GiftIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useHoliday, useDeleteHoliday } from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

export default function HolidayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // API Hooks
  const { data: holiday, isLoading, error } = useHoliday(id);
  const deleteHoliday = useDeleteHoliday();

  const handleDelete = () => {
    if (!holiday) return;
    Modal.confirm({
      title: 'Tatil Gununu Sil',
      content: `"${holiday.name}" tatil gununu silmek istediginizden emin misiniz? Bu islem geri alinamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await deleteHoliday.mutateAsync(id);
          router.push('/hr/holidays');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const isPassed = holiday ? dayjs(holiday.date).isBefore(dayjs(), 'day') : false;
  const isToday = holiday ? dayjs(holiday.date).isSame(dayjs(), 'day') : false;
  const daysUntil = holiday ? dayjs(holiday.date).diff(dayjs(), 'day') : 0;

  const getStatusVariant = (): 'success' | 'neutral' | 'info' => {
    if (isToday) return 'success';
    if (isPassed) return 'neutral';
    return 'info';
  };

  const getStatusText = () => {
    if (isToday) return 'Bugun';
    if (isPassed) return 'Gecti';
    return 'Yaklasan';
  };

  return (
    <DetailPageLayout
      title={holiday?.name || 'Tatil Detayi'}
      subtitle={holiday ? dayjs(holiday.date).format('DD MMMM YYYY, dddd') : undefined}
      backPath="/hr/holidays"
      icon={<GiftIcon className="w-6 h-6 text-white" />}
      iconBgColor="bg-amber-600"
      statusBadge={
        holiday && (
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant()} dot>
              {getStatusText()}
            </Badge>
            {holiday.isRecurring && (
              <Badge variant="info" dot>Yillik</Badge>
            )}
          </div>
        )
      }
      actions={
        holiday && (
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/hr/holidays/${id}/edit`)}
            >
              Duzenle
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={handleDelete}
            >
              Sil
            </Button>
          </>
        )
      }
      isLoading={isLoading}
      isError={!!error || (!isLoading && !holiday)}
      errorMessage="Tatil Gunu Bulunamadi"
      errorDescription="Istenen tatil gunu bulunamadi veya bir hata olustu."
    >
      {holiday && (
        <Row gutter={[24, 24]}>
          {/* Stats */}
          <Col xs={24}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8}>
                <Card size="small">
                  <Statistic
                    title="Tarih"
                    value={dayjs(holiday.date).format('DD.MM.YYYY')}
                    prefix={<CalendarIcon className="w-4 h-4" />}
                    valueStyle={{ color: '#7c3aed', fontSize: 18 }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8}>
                <Card size="small">
                  <Statistic
                    title="Gun"
                    value={dayjs(holiday.date).format('dddd')}
                    prefix={<GiftIcon className="w-4 h-4" />}
                    valueStyle={{ color: '#1890ff', fontSize: 18 }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8}>
                <Card size="small">
                  <Statistic
                    title={isPassed ? 'Gecen Gun' : 'Kalan Gun'}
                    value={isPassed ? Math.abs(daysUntil) : daysUntil}
                    suffix="gun"
                    valueStyle={{ color: isPassed ? '#8c8c8c' : '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>

          {/* Details */}
          <Col xs={24} lg={16}>
            <Card title="Tatil Bilgileri">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Tatil Adi">{holiday.name}</Descriptions.Item>
                <Descriptions.Item label="Tarih">
                  {dayjs(holiday.date).format('DD MMMM YYYY, dddd')}
                </Descriptions.Item>
                <Descriptions.Item label="Aciklama">{holiday.description || '-'}</Descriptions.Item>
                <Descriptions.Item label="Tur">
                  <Tag color={holiday.isRecurring ? 'purple' : 'default'}>
                    {holiday.isRecurring ? 'Yillik Tekrarlayan' : 'Tek Seferlik'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Durum">
                  <Tag color={isToday ? 'green' : isPassed ? 'default' : 'blue'}>
                    {isToday ? 'Bugun' : isPassed ? 'Gecti' : `${daysUntil} gun kaldi`}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      )}
    </DetailPageLayout>
  );
}
